"use client";
import Link from "next/link";
import { useState } from "react";
import { Pencil } from "@/components/Icons";
import Navbar from "@/components/Navbar";
import { NETWORK } from "@/lib/config";
import { useWallet, shortAddress } from "@/lib/wallet";

function WalletIcon() {
  return <span className="wallet-ico" aria-hidden="true" style={{ WebkitMaskImage: "url(/logo-wallet.png)", maskImage: "url(/logo-wallet.png)" }} />;
}

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
        <WalletIcon /> Install MetaMask
      </a>
    );
  }
  if (hasWallet === null) return <span className="btn btn-sm" aria-hidden="true" style={{ visibility: "hidden" }}>Connect</span>;
  if (!address) {
    return (
      <>
        <button className="btn btn-sm" onClick={() => run(connect)}><WalletIcon /> Connect wallet</button>
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
  return <span className="btn btn-sm btn-ghost" title={address}><WalletIcon /> {shortAddress(address)}</span>;
}

export default function Header({ landing = false }) {
  if (landing) return <Navbar />;
  return (
    <header className="site-header">
      <div className="wrap">
        <Link href="/" className="logo">
          <Pencil size={26} /> pocketLM
        </Link>
        <nav className="nav" aria-label="Main">
          {NETWORK.key === "testnet" && <span className="net-pill">testnet</span>}
          <Link href="/app" className="nav-link-plain">New notebook</Link>
          <Link href="/shelf" className="nav-link-plain">My shelf</Link>
          <WalletButton />
        </nav>
      </div>
    </header>
  );
}
