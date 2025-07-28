import * as viem from "viem";
import { hardhat } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";

import tusdt from "../artifacts/src/tUSDT.sol/tusdt.json";
import HaitheOrchestrator from "../artifacts/src/HaitheOrchestrator.sol/HaitheOrchestrator.json";
import HaitheOrganization from "../artifacts/src/HaitheOrganization.sol/HaitheOrganization.json";
import HaitheCreatorIdentity from "../artifacts/src/HaitheCreatorIdentity.sol/HaitheCreatorIdentity.json";
import HaitheProduct from "../artifacts/src/HaitheProduct.sol/HaitheProduct.json"; // Assuming this is the correct import path

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
const isHyperion = networkArg === "hyperion";

const privateKey = Bun.env.METIS_PRIVATE_KEY_1;
if (!privateKey || !viem.isHex(privateKey)) {
  throw new Error("METIS_PRIVATE_KEY_1 is invalid");
}
const client = viem
  .createWalletClient({
    chain: isHyperion ? hyperion : hardhat,
    account: isHyperion
      ? privateKeyToAccount(privateKey)
      : privateKeyToAccount(
          "0x92db14e403b83dfe3df233f83dfa3a0d7096f21ca9b0d6d6b8d88b2b4ec1564e" // Hardhat default private key
        ),
    transport: viem.http(
      (isHyperion ? hyperion : hardhat).rpcUrls.default.http[0]
    ),
  })
  .extend(viem.publicActions);

const definitionsFile = "../../definitions";
const definitions: Record<
  string,
  {
    abi: any;
    address?: viem.Address;
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

  const creatorIdentityAddress = await client.readContract({
    address: orchestrator.address,
    abi: HaitheOrchestrator.abi,
    functionName: "creatorIdentity",
  });

  if (
    typeof creatorIdentityAddress != "string" ||
    !viem.isAddress(creatorIdentityAddress)
  )
    throw new Error("HaitheCreatorIdentity address is invalid");

  definitions["tUSDT"] = {
    abi: tusdt.abi,
    address: usdt.address,
  };
  definitions["HaitheOrchestrator"] = {
    abi: HaitheOrchestrator.abi,
    address: orchestrator.address,
  };
  definitions["HaitheOrganization"] = {
    abi: HaitheOrganization.abi,
  };
  definitions["HaitheCreatorIdentity"] = {
    abi: HaitheCreatorIdentity.abi,
    address: creatorIdentityAddress,
  };
  definitions["HaitheProduct"] = {
    abi: HaitheProduct.abi,
  };
}

main().then(async () => {
  await Bun.write(
    Bun.file(definitionsFile + ".json"),
    JSON.stringify(definitions, null, 2)
  );

  await Bun.write(
    Bun.file(definitionsFile + ".ts"),
    "const definitions = " +
      JSON.stringify(definitions, null, 2) +
      "as const;\nexport default definitions;\n"
  );

  console.log("Deployment successful. Definitions written");
});
