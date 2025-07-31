import { privateKeyToAccount } from "viem/accounts";
import { HaitheClient } from "./services/interface";
import * as viem from "viem";

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

const wallet = viem.createWalletClient({
  transport: viem.http(hyperion.rpcUrls.default.http[0]),
  chain: hyperion,
  account: privateKeyToAccount(Bun.env.SERVER_PVT_KEY as "0x"),
});

const client = new HaitheClient({
  baseUrl: "http://localhost:9090/api",
  walletClient: wallet,
  debug: true,
});

async function main() {
  await client.login();
  console.log(await client.profile());
  //   await client.fetch("/v1/creator", { method: "POST" });
  if (!(await client.isCreator())) {
    await client.becomeCreator("https://example.com/creator-profile");
  }
  const product = await client.creator.uploadToMarketplaceAndGetReward(
    "Test Product " + Math.random().toString(36).substring(7),
    new File([], "ad"),
    "knowledge:text",
    4n,
    async () => "https://example.com/product-metadata.json"
  );

  console.log("Product uploaded:", product);
  const products = await client.getAllProducts();
  console.log("All products:", products);
}

main()
  .then(() => console.log("Done"))
  .catch((error) => console.error("Error:", error));
