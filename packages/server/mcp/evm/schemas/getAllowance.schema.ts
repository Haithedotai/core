import { z } from "zod";

export const getAllowanceSchema = z.object({
  token: z.string().describe("ERC20 token contract address"),
  owner: z.string().describe("Owner address"),
  spender: z.string().describe("Spender address"),
});
