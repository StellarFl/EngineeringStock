import dotenv from "dotenv";
dotenv.config();

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const API_KEY: string = requireEnv("CUSTOMER_SERVICE_API_KEY");
export const PORT: number = Number(process.env.PORT) || 3000;