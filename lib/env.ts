import { z } from "zod";

type EnvSchema = z.infer<typeof schema>;

const schema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  MONGODB_URI: z.string().url(),
  PINATA_JWT: z.string().min(1),
  PINATA_API_KEY: z.string().min(1),
  PINATA_SECRET: z.string().min(1),
  API_KEY_GEMINI: z.string().min(1),
  SESSION_SECRET: z.string().min(32),
  ORACLE_PRIVATE_KEY: z.string().optional(),
  CONTRACT_ADDRESS: z.string().optional(),
  CONTRACT_CHAIN_ID: z.coerce.number().default(84532),
  NEXT_PUBLIC_URL: z.string().optional(),
});

let cached: EnvSchema | undefined;

export function getEnv(): EnvSchema {
  if (!cached) {
    cached = schema.parse({
      NODE_ENV: process.env.NODE_ENV,
      MONGODB_URI: process.env.MONGODB_URI,
      PINATA_JWT: process.env.PINATA_JWT,
      PINATA_API_KEY: process.env.PINATA_API_KEY,
      PINATA_SECRET: process.env.PINATA_SECRET,
      API_KEY_GEMINI: process.env.API_KEY_GEMINI,
      SESSION_SECRET: process.env.SESSION_SECRET,
      ORACLE_PRIVATE_KEY: process.env.ORACLE_PRIVATE_KEY,
      CONTRACT_ADDRESS: process.env.CONTRACT_ADDRESS,
      CONTRACT_CHAIN_ID: process.env.CONTRACT_CHAIN_ID,
      NEXT_PUBLIC_URL: process.env.NEXT_PUBLIC_URL,
    });
  }

  return cached;
}
