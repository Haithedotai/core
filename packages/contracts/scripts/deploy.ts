import * as viem from "viem";
import { privateKeyToAccount } from "viem/accounts";

import tusdt from "../artifacts/src/tUSDT.sol/tusdt.json";
import HaitheOrchestrator from "../artifacts/src/HaitheOrchestrator.sol/HaitheOrchestrator.json";

const hyperion: viem.Chain = {
  id: 133717,
  name: "Hyperion Testnet",
  nativeCurrency: {
    name: "tMetis",
    symbol: "TMETIS",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://hyperion-testnet.metisdevops.link"],
    },
  },
};

const networkArg = Bun.argv[2];
console.log("Network argument:", networkArg);

const privateKey = Bun.env.METIS_PRIVATE_KEY_1;
if (!privateKey || !viem.isHex(privateKey)) {
  throw new Error("METIS_PRIVATE_KEY_1 is invalid");
}
const client = viem
  .createWalletClient({
    chain: hyperion,
    account: privateKeyToAccount(privateKey),
    transport: viem.http(hyperion.rpcUrls.default.http[0]),
  })
  .extend(viem.publicActions);

const definitionsFile = Bun.file("../../definitions.json");
const definitions: Record<
  string,
  {
    abi: any;
    address: viem.Address;
  }
> = {};

async function main() {
  if (!viem.isHex(tusdt.bytecode))
    throw new Error("tusdt bytecode is missing or invalid");

  const usdtHash = await client.deployContract({
    abi: tusdt.abi,
    bytecode: tusdt.bytecode,
  });

  const usdtReceipt = await client.waitForTransactionReceipt({
    hash: usdtHash,
  });

  if (!usdtReceipt.contractAddress) throw new Error("tUSDT deployment failed");

  const usdt = viem.getContract({
    address: usdtReceipt.contractAddress,
    abi: tusdt.abi,
    client,
  });

  if (!viem.isHex(HaitheOrchestrator.bytecode))
    throw new Error("HaitheOrchestrator bytecode is missing or invalid");

  const orchestratorHash = await client.deployContract({
    abi: HaitheOrchestrator.abi,
    bytecode: HaitheOrchestrator.bytecode,
    args: [usdt.address],
  });

  const orchestratorReceipt = await client.waitForTransactionReceipt({
    hash: orchestratorHash,
  });

  if (!orchestratorReceipt.contractAddress)
    throw new Error("Orchestrator deployment failed");

  const orchestrator = viem.getContract({
    address: orchestratorReceipt.contractAddress,
    abi: HaitheOrchestrator.abi,
    client,
  });

  definitions["tUSDT"] = {
    abi: tusdt.abi,
    address: usdt.address,
  };
  definitions["HaitheOrchestrator"] = {
    abi: HaitheOrchestrator.abi,
    address: orchestrator.address,
  };
}

main().then(async () => {
  await Bun.write(definitionsFile, JSON.stringify(definitions, null, 2));
  console.log("Deployment successful. Definitions written");
});
