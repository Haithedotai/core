import { hc } from "hono/client";
import type { ContextType } from "@/api/routes/context"
import type { UploadType } from "@/api/routes/upload";

const baseUrl = process.env.BUN_PUBLIC_SERVER_URL || "http://localhost:3000/api/v1";

const client = {
    context: hc<ContextType>(`${baseUrl}/context`),
    upload: hc<UploadType>(`${baseUrl}/upload`),
};

export default client;