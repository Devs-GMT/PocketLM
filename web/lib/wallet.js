"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { NETWORK } from "@/lib/config";

const WalletContext = createContext(null);
export const useWallet = () => useContext(WalletContext);

export function getEthereum() {
  if (typeof window === "undefined" || !window.ethereum) return null;
  const eth = window.ethereum;
  if (eth.providers?.length) return eth.providers.find((p) => p.isMetaMask) || eth.providers[0];
  return eth;
}

const hex = (n) => `0x${n.toString(16)}`;

// "Disconnect" in a dapp: wallets cannot be force-disconnected, so besides asking the wallet to revoke
// the permission we remember the choice here and ignore the wallet's accounts until the user connects again.
const OFF_KEY = "pocketlm-wallet-off";
const isOff = () => {
  try {
    return localStorage.getItem(OFF_KEY) === "1";
  } catch {
    return false;
  }
};
const setOff = (on) => {
  try {
    on ? localStorage.setItem(OFF_KEY, "1") : localStorage.removeItem(OFF_KEY);
  } catch {
    /* storage blocked */
  }
};
export const shortAddress = (a) => (a ? `${a.slice(0, 6)}…${a.slice(-4)}` : "");

export function WalletProvider({ children }) {
  const [hasWallet, setHasWallet] = useState(null); // null until we have looked in the browser
  const [address, setAddress] = useState(null);
  const [chainId, setChainId] = useState(null);

  useEffect(() => {
    let detach = () => {};
    let waiting = null;

    function attach(eth) {
      setHasWallet(true);
      if (!isOff()) eth.request({ method: "eth_accounts" }).then((a) => setAddress(a[0] || null)).catch(() => {});
      eth.request({ method: "eth_chainId" }).then((c) => setChainId(parseInt(c, 16))).catch(() => {});
      const onAccounts = (a) => {
        if (!isOff()) setAddress(a[0] || null);
      };
      const onChain = (c) => setChainId(parseInt(c, 16));
      eth.on?.("accountsChanged", onAccounts);
      eth.on?.("chainChanged", onChain);
      detach = () => {
        eth.removeListener?.("accountsChanged", onAccounts);
        eth.removeListener?.("chainChanged", onChain);
      };
    }

    const eth = getEthereum();
    if (eth) {
      attach(eth);
    } else {
      // Wallet extensions sometimes inject a moment after the page loads.
      const onLate = () => {
        const late = getEthereum();
        if (late) {
          clearTimeout(waiting);
          window.removeEventListener("ethereum#initialized", onLate);
          attach(late);
        }
      };
      window.addEventListener("ethereum#initialized", onLate);
      waiting = setTimeout(() => {
        window.removeEventListener("ethereum#initialized", onLate);
        const found = getEthereum();
        found ? attach(found) : setHasWallet(false);
      }, 2500);
      const cleanupLate = () => {
        clearTimeout(waiting);
        window.removeEventListener("ethereum#initialized", onLate);
      };
      return () => {
        cleanupLate();
        detach();
      };
    }
    return () => detach();
  }, []);

  /** Adds BOT Chain to the wallet if needed and switches to it. */
  const switchNetwork = useCallback(async () => {
    const eth = getEthereum();
    if (!eth) throw new Error("No wallet found.");
    try {
      await eth.request({ method: "wallet_switchEthereumChain", params: [{ chainId: hex(NETWORK.chainId) }] });
    } catch (e) {
      const unknownChain = e?.code === 4902 || e?.data?.originalError?.code === 4902 || /unrecognized chain/i.test(e?.message || "");
      if (!unknownChain) throw e;
      await eth.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: hex(NETWORK.chainId),
            chainName: NETWORK.chainName,
            nativeCurrency: NETWORK.currency,
            rpcUrls: [NETWORK.rpcUrl],
            blockExplorerUrls: [NETWORK.explorer],
          },
        ],
      });
    }
    setChainId(NETWORK.chainId);
  }, []);

  /** Connects the account, then makes sure we are on BOT Chain. Returns the address. */
  const connect = useCallback(async () => {
    const eth = getEthereum();
    if (!eth) throw new Error("No wallet found.");
    const accounts = await eth.request({ method: "eth_requestAccounts" });
    setOff(false);
    setAddress(accounts[0] || null);
    const current = parseInt(await eth.request({ method: "eth_chainId" }), 16);
    setChainId(current);
    if (current !== NETWORK.chainId) await switchNetwork();
    return accounts[0];
  }, [switchNetwork]);

  /** Forgets the connected account in PocketLM (and asks the wallet to revoke the permission). */
  const disconnect = useCallback(async () => {
    setOff(true);
    setAddress(null);
    try {
      await getEthereum()?.request({ method: "wallet_revokePermissions", params: [{ eth_accounts: {} }] });
    } catch {
      /* older wallets: the local choice is enough */
    }
  }, []);

  /** Opens the wallet's account picker so another account can be chosen. */
  const changeAccount = useCallback(async () => {
    const eth = getEthereum();
    if (!eth) throw new Error("No wallet found.");
    try {
      await eth.request({ method: "wallet_requestPermissions", params: [{ eth_accounts: {} }] });
    } catch (e) {
      if (e?.code === 4001) throw e;
    }
    const accounts = await eth.request({ method: "eth_requestAccounts" });
    setOff(false);
    setAddress(accounts[0] || null);
  }, []);

  const value = useMemo(
    () => ({
      hasWallet,
      address,
      chainId,
      wrongNetwork: !!address && chainId !== null && chainId !== NETWORK.chainId,
      connect,
      disconnect,
      changeAccount,
      switchNetwork,
    }),
    [hasWallet, address, chainId, connect, disconnect, changeAccount, switchNetwork]
  );

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}
