"use client";
import { useState } from "react";
import WalletMenu from "@/components/app/WalletMenu";
import { BOTCHAIN_URL, CONTRACT_ADDRESS, NETWORK, explorerAddress } from "@/lib/config";
import { clearNotebooks, useNotebooks } from "@/lib/notebooks";
import { setTheme, useTheme } from "@/lib/theme";

export default function Settings() {
  const list = useNotebooks();
  const theme = useTheme();
  const [sure, setSure] = useState(false);
  const [done, setDone] = useState(false);

  return (
    <div className="ap-page ap-narrow">
      <h1 className="ap-h2">Settings</h1>
      <p className="ap-lede">Where your data lives and which network PocketLM uses.</p>

      <section className="ap-panel ap-set">
        <h2 className="ap-h3">Appearance</h2>
        <div className="ap-seg" role="radiogroup" aria-label="Theme">
          <button type="button" role="radio" aria-checked={theme === "light"} className={theme === "light" ? "is-on" : ""} onClick={() => setTheme("light")}>Light</button>
          <button type="button" role="radio" aria-checked={theme === "dark"} className={theme === "dark" ? "is-on" : ""} onClick={() => setTheme("dark")}>Dark</button>
        </div>
        <p className="ap-fine">Light is the default. Your choice is saved in this browser and applies to the app screens.</p>
      </section>

      <section className="ap-panel ap-set">
        <h2 className="ap-h3">Wallet</h2>
        <div className="ap-set-wallet"><WalletMenu /></div>
        <p className="ap-fine">You can also connect, change wallet or disconnect from the button at the top right of every screen. PocketLM never holds your keys: your wallet signs each stamp.</p>
      </section>

      <section className="ap-panel ap-set">
        <h2 className="ap-h3">Network</h2>
        <dl className="ap-rows">
          <div><dt>Chain</dt><dd>{NETWORK.chainName}</dd></div>
          <div><dt>Chain ID</dt><dd>{NETWORK.chainId}</dd></div>
          <div>
            <dt>Contract</dt>
            <dd>{CONTRACT_ADDRESS ? <a href={explorerAddress(CONTRACT_ADDRESS)} target="_blank" rel="noopener noreferrer" title={CONTRACT_ADDRESS}>{CONTRACT_ADDRESS.slice(0, 8)}…{CONTRACT_ADDRESS.slice(-6)}</a> : "not set yet"}</dd>
          </div>
        </dl>
        <p className="ap-fine">{NETWORK.key === "testnet" ? "This is the test network: it uses free test BOT, never real money. " : ""}Learn more about <a href={BOTCHAIN_URL} target="_blank" rel="noopener noreferrer">BOT Chain</a>.</p>
      </section>

      <section className="ap-panel ap-set">
        <h2 className="ap-h3">Data on this device</h2>
        <p className="ap-body">{list === null ? "…" : `${list.length} notebook${list.length === 1 ? "" : "s"}`} saved in this browser. Notes are never stored on a server.</p>
        {done && <div className="ap-alert" role="status">Cleared. Your notebooks were removed from this browser.</div>}
        <div className="ap-row">
          {sure ? (
            <>
              <button className="ap-btn is-danger" onClick={() => { clearNotebooks(); setSure(false); setDone(true); }}>Yes, delete all</button>
              <button className="ap-btn is-ghost" onClick={() => setSure(false)}>Cancel</button>
            </>
          ) : (
            <button className="ap-btn" disabled={!list?.length} onClick={() => { setSure(true); setDone(false); }}>Delete all notebooks</button>
          )}
        </div>
      </section>
    </div>
  );
}
