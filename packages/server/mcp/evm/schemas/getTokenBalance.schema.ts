// mcp/evm/schemas/getTokenBalance.schema.ts
import { z } from "zod";

export const getTokenBalanceSchema = z.object({
  address: z.string().describe("Wallet address to fetch token balance for"),
  tokenAddress: z.string().describe("ERC-20 token contract address"),
  decimals: z.number().optional().describe("Token decimals - if not provided we will try to read it"),
});
