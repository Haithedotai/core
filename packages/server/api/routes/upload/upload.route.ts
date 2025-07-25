import { Hono } from "hono";
import { respond } from "@/api/lib/utils/respond";
import { uploadFile } from "@/api/lib/utils/upload";

const upload = new Hono()
.post(
    "/",
    async (ctx) => {
      const body = await ctx.req.parseBody();
      console.log("Upload body", body);

      if (!body.file || typeof body.file !== "object") {
        return respond.err(ctx, "File is required", 400);
      }

      const result = await uploadFile(body.file)
      return respond.ok(
        ctx,
        result,
        "Successfully uploaded file",
        200
      );
    }
  )

export default upload;
export type UploadType = typeof upload;