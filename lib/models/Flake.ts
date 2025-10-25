import mongoose, { Schema } from "mongoose";

export type FlakeVerificationType = "automatic" | "social" | "ai";
export type FlakeStatus =
  | "DRAFT"
  | "PENDING_STAKES"
  | "ACTIVE"
  | "AWAITING_VERDICT"
  | "RESOLVED"
  | "REFUNDING";

export interface Participant {
  userFid: string;
  walletAddress?: string;
  stakeAmount: string;
  status: "PENDING" | "STAKED" | "REFUNDED" | "RELEASED";
  depositTxHash?: string;
  refundTxHash?: string;
  winner?: boolean;
}

export interface EvidenceEntry {
  cid: string;
  uploaderFid: string;
  mimeType: string;
  sizeBytes: number;
  title?: string;
  uploadedAt: Date;
}

export interface AttestationEntry {
  attestorFid: string;
  verdict: "approved" | "rejected" | "abstain";
  notes?: string;
  submittedAt: Date;
  aiScore?: number;
  aiRationale?: string;
}

export interface FlakeDocument extends mongoose.Document {
  flakeId: string;
  creatorFid: string;
  creatorWalletAddress?: string;
  title: string;
  description?: string;
  stakeAmount: string;
  verificationType: FlakeVerificationType;
  status: FlakeStatus;
  deadline: Date;
  participants: Participant[];
  evidence: EvidenceEntry[];
  attestations: AttestationEntry[];
  deepLink?: string;
  chainId: number;
  contractAddress?: string;
  feeBps: number;
  feeRecipient?: string;
  onChainCreationTxHash?: string;
  resolutionTxHash?: string;
  refundOpenedTxHash?: string;
  createdAt: Date;
  updatedAt: Date;
}

const participantSchema = new Schema<Participant>(
  {
    userFid: { type: String, required: true },
    walletAddress: { type: String },
    stakeAmount: { type: String, required: true },
    status: {
      type: String,
      enum: ["PENDING", "STAKED", "REFUNDED", "RELEASED"],
      default: "PENDING",
    },
    depositTxHash: { type: String },
    refundTxHash: { type: String },
    winner: { type: Boolean },
  },
  { _id: false }
);

const evidenceSchema = new Schema<EvidenceEntry>(
  {
    cid: { type: String, required: true },
    uploaderFid: { type: String, required: true },
    mimeType: { type: String, required: true },
    sizeBytes: { type: Number, required: true },
    title: { type: String },
    uploadedAt: { type: Date, required: true },
  },
  { _id: false }
);

const attestationSchema = new Schema<AttestationEntry>(
  {
    attestorFid: { type: String, required: true },
    verdict: {
      type: String,
      enum: ["approved", "rejected", "abstain"],
      required: true,
    },
    notes: { type: String },
    submittedAt: { type: Date, required: true },
    aiScore: { type: Number },
    aiRationale: { type: String },
  },
  { _id: false }
);

const flakeSchema = new Schema<FlakeDocument>(
  {
    flakeId: { type: String, required: true, unique: true, index: true },
    creatorFid: { type: String, required: true, index: true },
    creatorWalletAddress: { type: String },
    title: { type: String, required: true },
    description: { type: String },
    stakeAmount: { type: String, required: true },
    verificationType: {
      type: String,
      enum: ["automatic", "social", "ai"],
      required: true,
    },
    status: {
      type: String,
      enum: ["DRAFT", "PENDING_STAKES", "ACTIVE", "AWAITING_VERDICT", "RESOLVED", "REFUNDING"],
      default: "PENDING_STAKES",
    },
    deadline: { type: Date, required: true },
    participants: { type: [participantSchema], default: [] },
    evidence: { type: [evidenceSchema], default: [] },
    attestations: { type: [attestationSchema], default: [] },
    deepLink: { type: String },
    chainId: { type: Number, default: 84532 },
    contractAddress: { type: String },
    feeBps: { type: Number, default: 0, min: 0, max: 1000 },
    feeRecipient: { type: String },
    onChainCreationTxHash: { type: String },
    resolutionTxHash: { type: String },
    refundOpenedTxHash: { type: String },
  },
  { timestamps: true }
);

flakeSchema.index({ status: 1, verificationType: 1 });
flakeSchema.index({ "participants.userFid": 1 });
flakeSchema.index({ deadline: 1 });

export const FlakeModel =
  mongoose.models.Flake || mongoose.model<FlakeDocument>("Flake", flakeSchema);

export interface FlakeLean {
  flakeId: string;
  creatorFid: string;
  creatorWalletAddress?: string;
  title: string;
  description?: string;
  stakeAmount: string;
  verificationType: FlakeVerificationType;
  status: FlakeStatus;
  deadline: Date;
  participants: Participant[];
  evidence: EvidenceEntry[];
  attestations: AttestationEntry[];
  deepLink?: string;
  chainId: number;
  contractAddress?: string;
  feeBps: number;
  feeRecipient?: string;
  onChainCreationTxHash?: string;
  resolutionTxHash?: string;
  refundOpenedTxHash?: string;
  createdAt: Date;
  updatedAt: Date;
  _id: unknown;
  __v: number;
}
