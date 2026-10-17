// Deploys PocketLM with ethers directly. The BOT Chain RPC sometimes resets the
// TLS connection, so every network call is retried a few times.
require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { JsonRpcProvider, Wallet, ContractFactory, Network, formatEther } = require("ethers");

const RPC = process.env.BOT_TESTNET_RPC || "https://rpc.bohr.life";
const CHAIN_ID = Number(process.env.BOT_TESTNET_CHAIN_ID || 968);
const NAME = "botTestnet";

async function retry(label, fn, tries = 8) {
  for (let i = 1; ; i++) {
    try {
      return await fn();
    } catch (e) {
      const code = e.code || e.cause?.code || e.message;
      if (i >= tries) throw e;
      console.log(`  ${label}: ${code}, retry ${i}/${tries - 1}`);
      await new Promise((r) => setTimeout(r, 1500 * i));
    }
  }
}

async function main() {
  const key = process.env.DEPLOYER_PRIVATE_KEY;
  if (!key) throw new Error("DEPLOYER_PRIVATE_KEY is empty in .env");
  const network = Network.from(CHAIN_ID);
  const provider = new JsonRpcProvider(RPC, network, { staticNetwork: network });
  const wallet = new Wallet(key.startsWith("0x") ? key : `0x${key}`, provider);

  const bal = await retry("balance", () => provider.getBalance(wallet.address));
  console.log(`Network: ${NAME} (chain ${CHAIN_ID})`);
  console.log(`Deployer: ${wallet.address}`);
  console.log(`Balance: ${formatEther(bal)} BOT`);

  const art = require("../artifacts/src/PocketLM.sol/PocketLM.json");
  const factory = new ContractFactory(art.abi, art.bytecode, wallet);
  const contract = await retry("deploy", () => factory.deploy());
  const tx = contract.deploymentTransaction();
  console.log(`Tx sent: ${tx.hash}`);
  await retry("wait", () => tx.wait(1));
  const address = await contract.getAddress();
  console.log(`PocketLM deployed: ${address}`);

  const out = path.join(__dirname, "..", "deployments");
  fs.mkdirSync(out, { recursive: true });
  fs.writeFileSync(
    path.join(out, `${NAME}.json`),
    JSON.stringify({ address, chainId: CHAIN_ID, txHash: tx.hash, deployer: wallet.address }, null, 2) + "\n"
  );
}

main().catch((e) => {
  console.error(e.shortMessage || e.message);
  process.exit(1);
});
