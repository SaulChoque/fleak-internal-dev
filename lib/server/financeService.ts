import { connectToDatabase } from "@/lib/db";
import { FlakeModel, Participant, FlakeStatus } from "@/lib/models/Flake";
import { UserModel } from "@/lib/models/User";

export interface FinanceSnapshot {
  totalEscrowed: number;
  pendingEscrow: number;
  resolvedPayouts: number;
  recentActivity: Array<{
    flakeId: string;
    type: "deposit" | "payout" | "refund";
    amount: number;
    occurredAt: Date;
  }>;
  walletAddress?: string;
}

export async function getFinanceSnapshot(fid: string): Promise<FinanceSnapshot> {
  await connectToDatabase();

  const [flakes, user] = await Promise.all([
    FlakeModel.find({ "participants.userFid": fid })
      .sort({ updatedAt: -1 })
      .limit(20)
      .lean<Array<{
        flakeId: string;
        participants: Participant[];
        status: FlakeStatus;
        updatedAt: Date;
      }>>(),
    UserModel.findOne({ fid }).lean<{ walletAddress?: string }>(),
  ]);

  let totalEscrowed = 0;
  let pendingEscrow = 0;
  let resolvedPayouts = 0;

  const recentActivity: FinanceSnapshot["recentActivity"] = [];

  for (const flake of flakes) {
    const participant = flake.participants.find((p: Participant) => p.userFid === fid);
    if (!participant) continue;

    const stake = Number(participant.stakeAmount);

    if (participant.status === "STAKED") {
      totalEscrowed += stake;
    }
    if (participant.status === "PENDING") {
      pendingEscrow += stake;
    }
    if (participant.winner && flake.status === "RESOLVED") {
      resolvedPayouts += stake;
    }

    recentActivity.push({
      flakeId: flake.flakeId,
      type:
        flake.status === "RESOLVED"
          ? participant.winner
            ? "payout"
            : "refund"
          : participant.status === "PENDING"
          ? "deposit"
          : "deposit",
      amount: stake,
      occurredAt: flake.updatedAt,
    });
  }

  return {
    totalEscrowed,
    pendingEscrow,
    resolvedPayouts,
    recentActivity,
    walletAddress: user?.walletAddress,
  };
}
