import router from "./routes/router";

Bun.serve({
	port: 4000,
	fetch: router.fetch,
});
