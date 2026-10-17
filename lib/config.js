// One place for everything that differs between testnet and mainnet.
// Switch with NEXT_PUBLIC_NETWORK=testnet|mainnet (default: testnet).
// After the mainnet deploy, paste the address into MAINNET.contract below
// (or set NEXT_PUBLIC_CONTRACT_MAINNET in Vercel) and set NEXT_PUBLIC_NETWORK=mainnet.

const TESTNET = {
  key: "testnet",
  chainId: 968,
  chainName: "BOT Chain Testnet",
  rpcUrl: process.env.NEXT_PUBLIC_TESTNET_RPC || "https://rpc.bohr.life",
  explorer: "https://scan.bohr.life",
  currency: { name: "BOT", symbol: "BOT", decimals: 18 },
  contract: process.env.NEXT_PUBLIC_CONTRACT_TESTNET || "0x9e7ad905539f72c3Ae7B8f8637c19EEFBa8B61aA",
};

const MAINNET = {
  key: "mainnet",
  chainId: 677,
  chainName: "BOT Chain",
  rpcUrl: process.env.NEXT_PUBLIC_MAINNET_RPC || "https://rpc.botchain.ai",
  explorer: "https://scan.botchain.ai",
  currency: { name: "BOT", symbol: "BOT", decimals: 18 },
  contract: process.env.NEXT_PUBLIC_CONTRACT_MAINNET || "",
};

export const NETWORK = process.env.NEXT_PUBLIC_NETWORK === "mainnet" ? MAINNET : TESTNET;

export const CONTRACT_ADDRESS = NETWORK.contract;
export const BOTCHAIN_URL = "https://botchain.ai";
export const explorerAddress = (a) => `${NETWORK.explorer}/address/${a}`;
export const explorerTx = (h) => `${NETWORK.explorer}/tx/${h}`;
