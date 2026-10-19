// One place for everything that differs between testnet and mainnet.
// Mainnet is the default. Set NEXT_PUBLIC_NETWORK=testnet to develop against the testnet
// (NEXT_PUBLIC_CONTRACT_MAINNET / NEXT_PUBLIC_CONTRACT_TESTNET override the addresses below).

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
  contract: process.env.NEXT_PUBLIC_CONTRACT_MAINNET || "0xa0AD40C50001DEFcEe354Ec0316b99F78bD6c64f",
};

export const NETWORK = process.env.NEXT_PUBLIC_NETWORK === "testnet" ? TESTNET : MAINNET;

export const CONTRACT_ADDRESS = NETWORK.contract;
export const BOTCHAIN_URL = "https://botchain.ai";
export const explorerAddress = (a) => `${NETWORK.explorer}/address/${a}`;
export const explorerTx = (h) => `${NETWORK.explorer}/tx/${h}`;
