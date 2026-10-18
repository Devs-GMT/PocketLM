import Link from "next/link";
import { NETWORK, CONTRACT_ADDRESS, BOTCHAIN_URL, explorerAddress } from "@/lib/config";

const short = (a) => `${a.slice(0, 6)}…${a.slice(-4)}`;

const LINKS = [
  ["Notebook", [["Open my notebook", "/app"], ["Study records", "/app/records"]]],
  ["Learn more", [["How it works", "/#how"], ["Privacy", "/#privacy"], ["FAQ", "/#faq"]]],
];

// The back cover of the notebook.
export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="wrap">
        <div className="cover-card">
          <span className="psst">psst… this notebook lives on</span>
          <div className="cover-body">
            <a className="sticker-link" href={BOTCHAIN_URL} target="_blank" rel="noopener noreferrer" aria-label="BOT Chain (opens botchain.ai)">
              <span className="washi" aria-hidden="true" />
              <span className="sticker">
                <img src="/botchain-logo.svg" alt="" />
              </span>
            </a>

            <div className="contract-block">
              <div className="name-label">
                <small>Contract:</small>
                <code title={CONTRACT_ADDRESS || undefined}>{CONTRACT_ADDRESS ? short(CONTRACT_ADDRESS) : "not deployed yet"}</code>
              </div>
              {CONTRACT_ADDRESS && (
                <a className="btn btn-sm" style={{ justifySelf: "start" }} href={explorerAddress(CONTRACT_ADDRESS)} target="_blank" rel="noopener noreferrer">
                  View on explorer →
                </a>
              )}
              <p className="stamped">
                Stamped on BOT Chain · chain ID {NETWORK.chainId}
                {NETWORK.key === "testnet" ? " (testnet)" : ""}
              </p>
            </div>

            <nav className="cover-links" aria-label="Footer">
              {LINKS.map(([title, items]) => (
                <div key={title}>
                  <h3>{title}</h3>
                  <ul>
                    {items.map(([label, href]) => (
                      <li key={label}>
                        <Link href={href}>{label}</Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </nav>
          </div>
        </div>
      </div>
      <p className="fine">© PocketLM 2026 · designed &amp; stamped with love</p>
    </footer>
  );
}
