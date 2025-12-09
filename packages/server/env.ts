const envKeys = [
	"PG_URI",
	"DB_NAME",
	"FRONTEND_URL",
	"RUNTIME_CHAIN_ID",
] as const;

type ENV = Record<(typeof envKeys)[number], string>;

let env: ENV = {} as ENV;

export function ensureEnv() {
	for (const key of envKeys) {
		if (!Bun.env[key]) {
			throw new Error(`Environment variable ${key} is not set`);
		}
	}

	env = Object.fromEntries(envKeys.map((key) => [key, Bun.env[key]])) as ENV;
}
const isProd =
	process.env.NODE_ENV === "production" || process.env.NODE_ENV === "prod";
if (!isProd) ensureEnv();

export default env;
