import { randomUUID, createHash } from "crypto";
import { connectToDatabase } from "@/lib/db";
import { FlakeModel, FlakeDocument, FlakeStatus, FlakeVerificationType, Participant, AttestationEntry } from "@/lib/models/Flake";
import { getEnv } from "@/lib/env";
import { AppError } from "@/lib/errors";
import { buildResolveCalldata, buildOpenRefundsCalldata, buildStakeCalldata } from "@/lib/server/blockchain";
import { analyzeEvidencePrompt } from "@/lib/server/gemini";
import { uploadBufferToPinata } from "@/lib/server/pinata";
import { SignJWT, jwtVerify } from "jose";

interface ParticipantInput {
  fid: string;
  stakeAmount: string;
}

export interface CreateFlakeInput {
  creatorFid: string;
  title: string;
  description?: string;
  stakeAmount: string;
  verificationType: FlakeVerificationType;
  deadline: Date;
  participants: ParticipantInput[];
}

export interface FlakeStatusResponse {
  flakeId: string;
  status: FlakeStatus;
  participants: Array<{
    fid: string;
    status: string;
    stakeAmount: string;
    depositTxHash?: string;
    winner?: boolean;
  }>;
  verificationType: FlakeVerificationType;
  deadline: Date;
  evidenceCount: number;
}

export async function createFlake(input: CreateFlakeInput) {
  await connectToDatabase();

  const flakeId = randomUUID();
  const env = getEnv();
  const chainId = env.CONTRACT_CHAIN_ID;
  const contractAddress = env.CONTRACT_ADDRESS;

  const participants = input.participants.map((participant) => ({
    userFid: participant.fid,
    stakeAmount: participant.stakeAmount,
    status: "PENDING" as const,
  }));

  const deepLink = await buildDeepLinkIfNeeded({
    verificationType: input.verificationType,
    flakeId,
  });

  const flake = await FlakeModel.create({
    flakeId,
    creatorFid: input.creatorFid,
    title: input.title,
    description: input.description,
    stakeAmount: input.stakeAmount,
    verificationType: input.verificationType,
    deadline: input.deadline,
    participants,
    status: "PENDING_STAKES",
    deepLink,
    chainId,
    contractAddress,
  });

  return flake.toObject();
}

export async function getFlakeStatus(flakeId: string): Promise<FlakeStatusResponse> {
  await connectToDatabase();
  const flake = await FlakeModel.findOne({ flakeId }).lean<{
    flakeId: string;
    status: FlakeStatus;
    participants: Array<{
      userFid: string;
      status: string;
      stakeAmount: string;
      depositTxHash?: string;
      winner?: boolean;
    }>;
    verificationType: FlakeVerificationType;
    deadline: Date;
    evidence: unknown[];
  }>();
  if (!flake) {
    throw new AppError("Flake not found", 404);
  }

  return {
    flakeId: flake.flakeId,
    status: flake.status,
    participants: flake.participants.map((p) => ({
      fid: p.userFid,
      status: p.status,
      stakeAmount: p.stakeAmount,
      depositTxHash: p.depositTxHash,
      winner: p.winner,
    })),
    verificationType: flake.verificationType,
    deadline: flake.deadline,
    evidenceCount: flake.evidence.length,
  };
}

export async function getDepositStatus(flakeId: string) {
  await connectToDatabase();
  const flake = await FlakeModel.findOne({ flakeId }).lean<{
    flakeId: string;
    participants: Array<{
      userFid: string;
      stakeAmount: string;
      status: string;
    }>;
    chainId: number;
    contractAddress?: string;
  }>();
  if (!flake) {
    throw new AppError("Flake not found", 404);
  }

  const totalStake = flake.participants.reduce((acc: number, participant) => acc + Number(participant.stakeAmount), 0);
  const pendingParticipants = flake.participants.filter((participant) => participant.status === "PENDING");

  return {
    flakeId: flake.flakeId,
    totalStake,
    pendingParticipants: pendingParticipants.map((p) => p.userFid),
    chainId: flake.chainId,
    contractAddress: flake.contractAddress,
  };
}

export async function createDepositIntent({
  flakeId,
  userFid,
  amount,
  walletAddress,
}: {
  flakeId: string;
  userFid: string;
  amount: string;
  walletAddress?: `0x${string}`;
}) {
  await connectToDatabase();
  const flake = await FlakeModel.findOne({ flakeId }).lean<{
    flakeId: string;
    participants: Array<{
      userFid: string;
      walletAddress?: string;
      stakeAmount: string;
      status: string;
    }>;
    contractAddress?: string;
    chainId: number;
  }>();
  if (!flake) {
    throw new AppError("Flake not found", 404);
  }

  const participant = flake.participants.find((p) => p.userFid === userFid);
  if (!participant) {
    throw new AppError("Participant not part of flake", 403);
  }

  if (participant.status === "STAKED") {
    throw new AppError("Stake already deposited", 409);
  }

  if (participant.stakeAmount !== amount) {
    throw new AppError("Stake amount mismatch", 400);
  }

  const numericId = flakeToNumericId(flake.flakeId);
  
  // Usar walletAddress del parámetro, del participante, o address(0)
  const beneficiary = walletAddress || participant.walletAddress || "0x0000000000000000000000000000000000000000";
  const calldata = buildStakeCalldata(numericId, beneficiary as `0x${string}`);

  return {
    contractAddress: flake.contractAddress,
    chainId: flake.chainId,
    calldata,
    value: participant.stakeAmount,
    expiresAt: new Date(Date.now() + 10 * 60 * 1000),
  };
}

export async function markDepositConfirmed({
  flakeId,
  userFid,
  txHash,
}: {
  flakeId: string;
  userFid: string;
  txHash: string;
}) {
  await connectToDatabase();
  const flake = await FlakeModel.findOne({ flakeId });
  if (!flake) {
    throw new AppError("Flake not found", 404);
  }

  const participant = flake.participants.find((p: Participant) => p.userFid === userFid);
  if (!participant) {
    throw new AppError("Participant not part of flake", 403);
  }

  participant.depositTxHash = txHash;
  participant.status = "STAKED";

  if (flake.participants.every((p: Participant) => p.status === "STAKED")) {
    flake.status = "ACTIVE";
  }

  await flake.save();
}

export async function listPendingAttestations(fid: string) {
  await connectToDatabase();
  const flakes = await FlakeModel.find({
    verificationType: { $in: ["social", "ai"] },
    status: { $in: ["ACTIVE", "AWAITING_VERDICT"] },
    "participants.userFid": fid,
  })
    .sort({ deadline: 1 })
    .lean<Array<{
      flakeId: string;
      title: string;
      deadline: Date;
      verificationType: FlakeVerificationType;
      attestations: Array<{ attestorFid: string }>;
    }>>();

  return flakes
    .filter((flake) => !flake.attestations.some((attestation) => attestation.attestorFid === fid))
    .map((flake) => ({
      flakeId: flake.flakeId,
      title: flake.title,
      deadline: flake.deadline,
      verificationType: flake.verificationType,
    }));
}

export async function submitAttestation({
  flakeId,
  attestorFid,
  verdict,
  notes,
}: {
  flakeId: string;
  attestorFid: string;
  verdict: "approved" | "rejected" | "abstain";
  notes?: string;
}) {
  await connectToDatabase();
  const flake = await FlakeModel.findOne({ flakeId });
  if (!flake) {
    throw new AppError("Flake not found", 404);
  }

  const alreadySubmitted = flake.attestations.some((attestation: AttestationEntry) => attestation.attestorFid === attestorFid);
  if (alreadySubmitted) {
    throw new AppError("Attestation already submitted", 409);
  }

  flake.attestations.push({
    attestorFid,
    verdict,
    notes,
    submittedAt: new Date(),
  });

  flake.status = "AWAITING_VERDICT";

  await flake.save();
  return flake.toObject();
}

export async function requestAiReview(flakeId: string) {
  await connectToDatabase();
  const flake = await FlakeModel.findOne({ flakeId });
  if (!flake) {
    throw new AppError("Flake not found", 404);
  }

  if (flake.verificationType !== "ai") {
    throw new AppError("Flake does not support AI review", 400);
  }

  const prompt = buildAiPrompt(flake);
  const result = await analyzeEvidencePrompt(prompt);

  flake.attestations.push({
    attestorFid: "ai",
    verdict: result.score >= 60 ? "approved" : "rejected",
    notes: "AI-generated verdict",
    submittedAt: new Date(),
    aiScore: result.score,
    aiRationale: result.rationale,
  });

  if (result.score >= 60) {
    flake.status = "AWAITING_VERDICT";
  }

  await flake.save();

  return { score: result.score, rationale: result.rationale };
}

export async function attachEvidence({
  flakeId,
  uploaderFid,
  cid,
  mimeType,
  sizeBytes,
  title,
}: {
  flakeId: string;
  uploaderFid: string;
  cid: string;
  mimeType: string;
  sizeBytes: number;
  title?: string;
}) {
  await connectToDatabase();
  const flake = await FlakeModel.findOne({ flakeId });
  if (!flake) {
    throw new AppError("Flake not found", 404);
  }

  flake.evidence.push({
    cid,
    uploaderFid,
    mimeType,
    sizeBytes,
    title,
    uploadedAt: new Date(),
  });

  await flake.save();
  return flake.toObject();
}

export async function uploadEvidenceBuffer({
  buffer,
  fileName,
  contentType,
}: {
  buffer: Buffer;
  fileName: string;
  contentType: string;
}) {
  const upload = await uploadBufferToPinata({ buffer, fileName, contentType });
  return upload;
}

export async function verifyAutomaticFlake({
  flakeId,
  verifierFid,
  completedAt,
}: {
  flakeId: string;
  verifierFid: string;
  completedAt: Date;
}) {
  await connectToDatabase();
  const flake = await FlakeModel.findOne({ flakeId });
  if (!flake) {
    throw new AppError("Flake not found", 404);
  }

  if (flake.verificationType !== "automatic") {
    throw new AppError("Flake is not automatic", 400);
  }

  flake.attestations.push({
    attestorFid: verifierFid,
    verdict: "approved",
    submittedAt: completedAt,
    notes: "Automatic verification",
  });

  flake.status = "AWAITING_VERDICT";
  await flake.save();
}

export async function verifyDeepLinkSignature({
  flakeId,
  signature,
}: {
  flakeId: string;
  signature: string;
}) {
  const env = getEnv();
  const secret = new TextEncoder().encode(env.SESSION_SECRET);

  try {
    const result = await jwtVerify(signature, secret);
    if (result.payload.flakeId !== flakeId) {
      throw new AppError("Invalid signature payload", 401);
    }
  } catch (error) {
    throw new AppError("Invalid signature", 401, error);
  }
}

export async function markResolution({
  flakeId,
  winnerFid,
  winnerAddress,
}: {
  flakeId: string;
  winnerFid: string;
  winnerAddress: `0x${string}`;
}) {
  await connectToDatabase();
  const flake = await FlakeModel.findOne({ flakeId });
  if (!flake) {
    throw new AppError("Flake not found", 404);
  }

  flake.status = "RESOLVED";
  flake.participants = flake.participants.map((participant: Participant) => ({
    ...participant,
    winner: participant.userFid === winnerFid,
    status: (participant.userFid === winnerFid ? "RELEASED" : "REFUNDED") as "PENDING" | "STAKED" | "REFUNDED" | "RELEASED",
  }));

  flake.attestations.push({
    attestorFid: "oracle",
    verdict: "approved",
    notes: `Resolved to ${winnerAddress}`,
    submittedAt: new Date(),
  });

  await flake.save();

  const numericId = flakeToNumericId(flake.flakeId);
  const calldata = buildResolveCalldata(numericId, winnerAddress);
  return { calldata, chainId: flake.chainId, contractAddress: flake.contractAddress };
}

export async function getPayoutSummary(flakeId: string) {
  await connectToDatabase();
  const flake = await FlakeModel.findOne({ flakeId }).lean<{
    flakeId: string;
    status: FlakeStatus;
    participants: Array<{
      userFid: string;
      stakeAmount: string;
      status: string;
      depositTxHash?: string;
      winner?: boolean;
    }>;
    attestations: Array<{
      attestorFid: string;
      verdict: string;
      notes?: string;
      submittedAt: Date;
    }>;
  }>();
  if (!flake) {
    throw new AppError("Flake not found", 404);
  }

  return {
    flakeId: flake.flakeId,
    status: flake.status,
    participants: flake.participants,
    attestations: flake.attestations,
  };
}

async function buildDeepLinkIfNeeded({
  verificationType,
  flakeId,
}: {
  verificationType: FlakeVerificationType;
  flakeId: string;
}) {
  if (verificationType !== "automatic") {
    return undefined;
  }

  const env = getEnv();
  const secret = new TextEncoder().encode(env.SESSION_SECRET);
  const signature = await new SignJWT({ flakeId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("2h")
    .sign(secret);

  return `fleak://set-alarm?flakeId=${flakeId}&signature=${encodeURIComponent(signature)}`;
}

function flakeToNumericId(flakeId: string) {
  const hash = createHash("sha256").update(flakeId).digest("hex");
  const truncated = hash.slice(0, 16);
  return BigInt(`0x${truncated}`);
}

function buildAiPrompt(flake: FlakeDocument) {
  const evidenceSummary = flake.evidence
    .map((item) => `CID: ${item.cid}, uploader: ${item.uploaderFid}, mime: ${item.mimeType}`)
    .join("\n");
  return `Flake ${flake.flakeId} title: ${flake.title}.
Verification type: ${flake.verificationType}.
Evidence: ${evidenceSummary || "no evidence yet"}.
Attestations count: ${flake.attestations.length}.`;
}

export async function openRefunds(flakeId: string) {
  await connectToDatabase();
  const flake = await FlakeModel.findOne({ flakeId });
  if (!flake) {
    throw new AppError("Flake not found", 404);
  }

  if (flake.status === "RESOLVED") {
    throw new AppError("Flake already resolved", 409);
  }

  if (flake.status === "REFUNDING") {
    throw new AppError("Refunds already opened", 409);
  }

  flake.status = "REFUNDING";
  await flake.save();

  const numericId = flakeToNumericId(flake.flakeId);
  const calldata = buildOpenRefundsCalldata(numericId);

  return {
    calldata,
    chainId: flake.chainId,
    contractAddress: flake.contractAddress,
  };
}

export async function markRefundOpened({
  flakeId,
  txHash,
}: {
  flakeId: string;
  txHash: string;
}) {
  await connectToDatabase();
  const flake = await FlakeModel.findOne({ flakeId });
  if (!flake) {
    throw new AppError("Flake not found", 404);
  }

  flake.refundOpenedTxHash = txHash;
  await flake.save();
}

export async function markRefundClaimed({
  flakeId,
  userFid,
  txHash,
}: {
  flakeId: string;
  userFid: string;
  txHash: string;
}) {
  await connectToDatabase();
  const flake = await FlakeModel.findOne({ flakeId });
  if (!flake) {
    throw new AppError("Flake not found", 404);
  }

  const participant = flake.participants.find((p: Participant) => p.userFid === userFid);
  if (!participant) {
    throw new AppError("Participant not found", 404);
  }

  participant.status = "REFUNDED";
  participant.refundTxHash = txHash;
  await flake.save();
}
