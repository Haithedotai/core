import router from "./routes/router";

Bun.serve({
	port: 4000,
	fetch: router.fetch,
});

console.log("Server is running on http://localhost:4000");
