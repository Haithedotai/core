import { mainnet } from "viem/chains";

const runtimeChain = mainnet;

const cookieOptions = {
	httpOnly: true,
	secure: isProd,
	sameSite: "Strict" as const,
	path: "/",
};

const jwtSecretBytes = new TextEncoder().encode(env.JWT_SECRET);
const jwtOptions = {
	secret: jwtSecretBytes,
	algorithm: "HS256" as const,
};

const config = {
	runtimeChain,
};

export default config;
