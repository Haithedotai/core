const envKeys = [
  "BUN_PUBLIC_SERVER_URL",
  "BUN_VERSION",
  "BUN_PUBLIC_PRIVY_APP_ID",
  "BUN_PUBLIC_RUST_SERVER_URL",
  "GEMINI_API_KEY",
  "DATABASE_URL",
  "PINATA_JWT",
  "BUN_PUBLIC_PINATA_GATEWAY_URL",
] as const;

type ENV = Record<(typeof envKeys)[number], string>;

let env: ENV = {} as any;

export function ensureEnv() {
  for (const key of envKeys) {
    if (!Bun.env[key]) {
      throw new Error(`Environment variable ${key} is not set`);
    }
  }

  env = Object.fromEntries(envKeys.map((key) => [key, Bun.env[key]])) as ENV;
}
const isProd =
  process.env["NODE_ENV"] === "production" ||
  process.env["NODE_ENV"] === "prod";
ensureEnv();

export { env, isProd };