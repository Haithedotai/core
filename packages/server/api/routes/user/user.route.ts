import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { respond } from "@/api/lib/utils/respond";
import { generateStream, generateText } from "@/api/lib/utils/gemini";
import { stream } from "hono/streaming";

const user = new Hono()

export default user;
export type UserType = typeof user;
