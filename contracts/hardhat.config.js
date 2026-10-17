require("dotenv").config();
require("@nomicfoundation/hardhat-toolbox");

const key = process.env.DEPLOYER_PRIVATE_KEY;
const accounts = key ? [key.startsWith("0x") ? key : `0x${key}`] : [];

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.24",
    settings: { optimizer: { enabled: true, runs: 200 }, evmVersion: "paris" },
  },
  paths: { sources: "./src" },
  networks: {
    botTestnet: {
      url: process.env.BOT_TESTNET_RPC || "https://rpc.bohr.life",
      chainId: Number(process.env.BOT_TESTNET_CHAIN_ID || 968),
      accounts,
    },
  },
};
