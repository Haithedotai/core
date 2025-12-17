import { mainnet } from "viem/chains";
import env, { isProd } from "./env";

const runtimeChain = mainnet;

const cookieOptions = {
	httpOnly: true,
	secure: isProd,
	sameSite: "Strict" as const,
	path: "/",
	secret: env.COOKIE_SIGNING_SECRET,
};

const jwtSecretBytes = new TextEncoder().encode(env.JWT_SECRET);
const jwtOptions = {
	secret: jwtSecretBytes,
	algorithm: "HS256" as const,
	cookieNames: {
		access: "H_access_token",
		refresh: "H_refresh_token",
	},
};

const config = {
	runtimeChain,
	cookieOptions,
	jwtOptions,
};

export default config;
