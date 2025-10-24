import mongoose, { Schema } from "mongoose";

export interface SessionDocument extends mongoose.Document {
  sessionId: string;
  userFid: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const sessionSchema = new Schema<SessionDocument>(
  {
    sessionId: { type: String, required: true, unique: true },
    userFid: { type: String, required: true, index: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const SessionModel =
  mongoose.models.Session ||
  mongoose.model<SessionDocument>("Session", sessionSchema);
