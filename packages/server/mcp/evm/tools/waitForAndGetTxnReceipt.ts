import { z } from "zod";
import type { McpToolRegistrationConfig } from "../../registry";
import type { EvmMcpConfig } from "..";
import { createEvmClient } from "../evmClient";

type HexHash = `0x${string}`;

const zTxHash = z
  .string()
  .regex(/^0x[a-fA-F0-9]{64}$/, "Invalid transaction hash")
  .transform((val) => val as HexHash);

const inputSchema = z.object({
  txHash: zTxHash.describe("Transaction hash"),
  chainId: z.number().describe("Chain ID"),
});

export default function (config: McpToolRegistrationConfig<EvmMcpConfig>) {
  const { server } = config;

  server.registerTool(
    "get-transaction-receipt",
    {
      title: "Get Transaction Receipt",
      description:
        "Fetches the transaction receipt if mined. Returns a friendly message if not yet available.",
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
      inputSchema,
    },
    async ({ txHash, chainId }) => {
      const client = createEvmClient({ chainId });

      try {
        const receipt = await client.getTransactionReceipt({
          hash: txHash, 
        });

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(receipt, null, 2),
            },
          ],
        };
      } catch {
        return {
          content: [
            {
              type: "text",
              text:
                "Transaction has not been mined yet. Please retry this tool after a short delay.",
            },
          ],
        };
      }
    }
  );
}
