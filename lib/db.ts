import mongoose from "mongoose";
import { getEnv } from "./env";

let connection: typeof mongoose | null = null;

export async function connectToDatabase(): Promise<typeof mongoose> {
  if (connection) {
    return connection;
  }

  const env = getEnv();
  const uri = env.MONGODB_URI;

  if (mongoose.connection.readyState === 1) {
    connection = mongoose;
    return connection;
  }

  if (!global.__mongooseConnectionPromise) {
    global.__mongooseConnectionPromise = mongoose.connect(uri, {
      maxPoolSize: 10,
    });
  }

  connection = await global.__mongooseConnectionPromise;
  return connection;
}

declare global {
  var __mongooseConnectionPromise: Promise<typeof mongoose> | undefined;
}
