import mongoose, { Schema } from "mongoose";

export interface UserDocument extends mongoose.Document {
  fid: string;
  walletAddress?: string;
  displayName?: string;
  avatarUrl?: string;
  streakCount: number;
  friends: string[];
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<UserDocument>(
  {
    fid: { type: String, required: true, unique: true, index: true },
    walletAddress: { type: String },
    displayName: { type: String },
    avatarUrl: { type: String },
    streakCount: { type: Number, default: 0 },
    friends: { type: [String], default: [] },
  },
  { timestamps: true }
);

export const UserModel =
  mongoose.models.User || mongoose.model<UserDocument>("User", userSchema);
