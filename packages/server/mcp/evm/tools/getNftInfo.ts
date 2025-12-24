import { z } from "zod";
import { zEvmAddress } from "@haithe/shared";
import type { McpToolRegistrationConfig } from "../../registry";
import type { EvmMcpConfig } from "..";
import { createEvmClient } from "../evmClient";
import { ERC721_ABI } from "../../../lib/evm/ERC721_ABI";

const inputSchema = z.object({
    contract: zEvmAddress().describe("ERC721 contract address"),
    tokenId: z.number().describe("Token ID (uint256)"),
    chainId: z.number().describe("Target EVM chain ID"),
});

export default function (config: McpToolRegistrationConfig<EvmMcpConfig>) {
    const { server } = config;

    server.registerTool(
        "get-nft-info",
        {
            title: "Get NFT Info",
            description:
                "Fetches owner, tokenURI, and metadata for an ERC721 token.",
            annotations: {
                readOnlyHint: true,
                destructiveHint: false,
                idempotentHint: true,
                openWorldHint: true,
                title: "Get NFT Info",
            },
            inputSchema,
        },

        async ({ contract, tokenId, chainId }) => {
            const client = createEvmClient({ chainId });

            
            const owner = await client.readContract({
                address: contract,
                abi: ERC721_ABI,
                functionName: "ownerOf",
                args: [BigInt(tokenId)],
            });

            
            const rawTokenUri = await client.readContract({
                address: contract,
                abi: ERC721_ABI,
                functionName: "tokenURI",
                args: [BigInt(tokenId)],
            });

            let tokenUri = String(rawTokenUri);

            
            if (tokenUri.startsWith("ipfs://")) {
                tokenUri = tokenUri.replace("ipfs://", "https://ipfs.io/ipfs/");
            }

            
            let metadata: any = null;
            try {
                metadata = await fetch(tokenUri).then((res) => res.json());
            } catch {
                
            }

            return {
                content: [
                    {
                        type: "text",
                        text: `NFT Info:
Contract: ${contract}
Token ID: ${tokenId}
Owner: ${owner}
Token URI: ${tokenUri}
Metadata: ${metadata ? JSON.stringify(metadata, null, 2) : "Unavailable"}`,
                    },
                ],
            };
        }
    );
}
