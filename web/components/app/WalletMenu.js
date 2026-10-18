"use client";
import { useEffect, useRef, useState } from "react";
import { NETWORK } from "@/lib/config";
import { shortAddress, useWallet } from "@/lib/wallet";

const ICO = { WebkitMaskImage: "url(/logo-wallet.png)", maskImage: "url(/logo-wallet.png)" };

/** Wallet button for the top right: Connect when nobody is connected, otherwise the address with a menu. */
export default function WalletMenu() {
  const { hasWallet, address, wrongNetwork, connect, disconnect, changeAccount, switchNetwork } = useWallet();
  const [open, setOpen] = useState(false);
  const [err, setErr] = useState("");
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);
  const root = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => root.current && !root.current.contains(e.target) && setOpen(false);
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  async function run(fn, closeAfter = false) {
    setErr("");
    setBusy(true);
    try {
      await fn();
      if (closeAfter) setOpen(false);
    } catch (e) {
      setErr(e?.code === 4001 ? "Request cancelled." : "Could not connect. Try again.");
    } finally {
      setBusy(false);
    }
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard blocked */
    }
  }

  if (hasWallet === null) return <span className="ap-wbtn is-ghost" aria-hidden="true">Wallet</span>;
  if (hasWallet === false) {
    return (
      <a className="ap-wbtn" href="https://metamask.io/download/" target="_blank" rel="noopener noreferrer">
        <span className="ap-wallet-ico" aria-hidden="true" style={ICO} />
        Install MetaMask
      </a>
    );
  }
  if (!address) {
    return (
      <span className="ap-wmenu">
        {err && <span className="ap-werr" role="alert">{err}</span>}
        <button className="ap-wbtn is-primary" onClick={() => run(connect)} disabled={busy}>
          <span className="ap-wallet-ico" aria-hidden="true" style={ICO} />
          {busy ? "Connecting…" : "Connect wallet"}
        </button>
      </span>
    );
  }

  return (
    <div className="ap-wmenu" ref={root}>
      <button className={`ap-wbtn${wrongNetwork ? " is-warn" : ""}`} onClick={() => setOpen((v) => !v)} aria-expanded={open} aria-haspopup="menu" title={address}>
        <span className={`ap-dot${wrongNetwork ? " is-warn" : ""}`} aria-hidden="true" />
        {shortAddress(address)}
        <svg width="12" height="8" viewBox="0 0 12 8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m1 1 5 5 5-5" /></svg>
      </button>
      {open && (
        <div className="ap-wpop" role="menu">
          <div className="ap-wpop-head">
            <small>Connected wallet</small>
            <b title={address}>{address.slice(0, 10)}…{address.slice(-8)}</b>
            <span className={wrongNetwork ? "is-warn" : "is-ok"}>{wrongNetwork ? "Wrong network" : NETWORK.chainName}</span>
          </div>
          {wrongNetwork && <button role="menuitem" onClick={() => run(switchNetwork)} disabled={busy}>Switch to {NETWORK.chainName}</button>}
          <button role="menuitem" onClick={copy}>{copied ? "Copied" : "Copy address"}</button>
          <button role="menuitem" onClick={() => run(changeAccount, true)} disabled={busy}>Change wallet</button>
          <button role="menuitem" className="is-danger" onClick={() => run(disconnect, true)} disabled={busy}>Disconnect</button>
          {err && <span className="ap-werr" role="alert">{err}</span>}
          {NETWORK.key === "testnet" && <p>Test network: free test BOT, no real money.</p>}
        </div>
      )}
    </div>
  );
}
