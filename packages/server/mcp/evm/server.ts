// mcp/evm/server.ts
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { evmFunctions } from "./functions";

export function evmServer(config: {
  rpcUrl: string;
  privateKey?: string;
  name: string;
}) {

  const server = new McpServer({
    name: config.name,
    version: "1.0.0",
  });

  
  for (const [toolName, tool] of Object.entries(evmFunctions)) {
    server.registerTool(
      toolName,                     
      tool.schema ?? undefined,     
      async (input) => tool.run(config, input)  
    );
  }

  return server;
}
