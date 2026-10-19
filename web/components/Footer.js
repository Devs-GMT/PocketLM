import Link from "next/link";
import { NETWORK, CONTRACT_ADDRESS, BOTCHAIN_URL, explorerAddress } from "@/lib/config";

const short = (a) => `${a.slice(0, 6)}…${a.slice(-4)}`;

const ICONS = {
  book: <path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3zM5 17a3 3 0 0 1 3-3h11" />,
  records: <><rect x="5" y="5" width="14" height="16" rx="2" /><path d="M9 5V3.5h6V5M9 13.5l2 2 4-4.5" /></>,
  flow: <path d="M5 5h5v5H5zM14 14h5v5h-5zM10 7.5h3a2.5 2.5 0 0 1 2.5 2.5v4" />,
  shield: <path d="M12 3l7 3v5.5c0 4.6-3 7.7-7 9.5-4-1.8-7-4.9-7-9.5V6z" />,
  question: <><circle cx="12" cy="12" r="9" /><path d="M9.6 9.6a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1.1.9-1.1 1.6M12 17h.01" /></>,
  x: <path className="fill" d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />,
};

function FootIcon({ name }) {
  return (
    <svg className="fi" viewBox="0 0 24 24" aria-hidden="true">
      {ICONS[name]}
    </svg>
  );
}

const LINKS = [
  ["Notebook", [["Open my notebook", "/app", "book"], ["Study records", "/app/records", "records"]]],
  ["Learn more", [["How it works", "/#how", "flow"], ["Privacy", "/#privacy", "shield"], ["FAQ", "/#faq", "question"]]],
  ["Social", [["PocketLM on X", "https://x.com/PocketLM", "x"]]],
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
                    {items.map(([label, href, icon]) => (
                      <li key={label}>
                        {href.startsWith("http") ? (
                          <a href={href} target="_blank" rel="noopener noreferrer"><FootIcon name={icon} />{label}</a>
                        ) : (
                          <Link href={href}><FootIcon name={icon} />{label}</Link>
                        )}
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
