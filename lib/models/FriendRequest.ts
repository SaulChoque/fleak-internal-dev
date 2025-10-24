import mongoose, { Schema } from "mongoose";

export interface FriendRequestDocument extends mongoose.Document {
  requesterFid: string;
  targetFid: string;
  status: "pending" | "accepted" | "rejected";
  createdAt: Date;
  updatedAt: Date;
}

const friendRequestSchema = new Schema<FriendRequestDocument>(
  {
    requesterFid: { type: String, required: true, index: true },
    targetFid: { type: String, required: true, index: true },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

friendRequestSchema.index({ requesterFid: 1, targetFid: 1 }, { unique: true });

export const FriendRequestModel =
  mongoose.models.FriendRequest ||
  mongoose.model<FriendRequestDocument>("FriendRequest", friendRequestSchema);
