import { hc } from "hono/client";
import type { ContextType } from "@/api/routes/context"

const baseUrl = process.env.BUN_PUBLIC_SERVER_URL || "http://localhost:3000/api/v1";

const client = {
    context: hc<ContextType>(`${baseUrl}/context`),
};

export default client;