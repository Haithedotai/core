import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { respond } from "@/api/lib/utils/respond";
import { generateStream, generateText } from "@/api/lib/utils/gemini";
import { stream } from "hono/streaming";

const context = new Hono()
  .get(
    "/",
    zValidator(
      "query",
      z.object({
        name: z.string(),
      })
    ),
    async (ctx) => {
      const { name } = ctx.req.valid("query");

      if (!name) {
        return respond.err(ctx, "Name is required", 400);
      }

      return respond.ok(
        ctx,
        {
          name,
        },
        "Successfully fetched data",
        200
      );
    }
  )

  .post("/gemini", async (ctx) => {
    const { prompt } = await ctx.req.json();

    try {
      const response = await generateText(prompt);
      return respond.ok(ctx, { text: response }, "Successfully generated text", 200);
    } catch (error) {
      return respond.err(ctx, "Failed to generate text", 500);
    }
  })

  .post("/gemini/stream", async (ctx) => {
    const { prompt } = await ctx.req.json();
    const answer = await generateStream(prompt);

    return stream(ctx, async (stream) => {
      await stream.pipe(answer);
    })
  })

export default context;
export type ContextType = typeof context;
