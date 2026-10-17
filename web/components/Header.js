"use client";
import Link from "next/link";
import { useState } from "react";
import { Pencil } from "@/components/Icons";
import { NETWORK } from "@/lib/config";
import { useWallet, shortAddress } from "@/lib/wallet";

export function WalletButton() {
  const { hasWallet, address, wrongNetwork, connect, switchNetwork } = useWallet();
  const [err, setErr] = useState("");

  async function run(fn) {
    setErr("");
    try {
      await fn();
    } catch (e) {
      setErr(e?.code === 4001 ? "Request cancelled." : "Couldn't connect. Try again.");
    }
  }

  if (hasWallet === false) {
    return (
      <a className="btn btn-sm" href="https://metamask.io/download/" target="_blank" rel="noopener noreferrer">
        Install MetaMask
      </a>
    );
  }
  if (hasWallet === null) return <span className="btn btn-sm" aria-hidden="true" style={{ visibility: "hidden" }}>Connect</span>;
  if (!address) {
    return (
      <>
        <button className="btn btn-sm" onClick={() => run(connect)}>Connect wallet</button>
        {err && <span className="note-sm" role="alert">{err}</span>}
      </>
    );
  }
  if (wrongNetwork) {
    return (
      <>
        <button className="btn btn-sm btn-primary" onClick={() => run(switchNetwork)}>Switch to BOT Chain</button>
        {err && <span className="note-sm" role="alert">{err}</span>}
      </>
    );
  }
  return <span className="btn btn-sm btn-ghost" title={address}>{shortAddress(address)}</span>;
}

export default function Header({ landing = false }) {
  return (
    <header className="site-header">
      <div className="wrap">
        <Link href="/" className="logo">
          <Pencil size={26} /> pocketLM
        </Link>
        <nav className="nav" aria-label="Main">
          {NETWORK.key === "testnet" && <span className="net-pill">testnet</span>}
          {landing ? (
            <Link href="/app" className="btn btn-sm btn-primary">Open my notebook</Link>
          ) : (
            <>
              <Link href="/app" className="nav-link">New notebook</Link>
              <Link href="/shelf" className="nav-link">My shelf</Link>
              <WalletButton />
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
