"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaceIcon } from "@/components/MascotArt";
import Tour from "@/components/app/Tour";
import WalletMenu from "@/components/app/WalletMenu";
import { NETWORK } from "@/lib/config";
import { useAppTheme } from "@/lib/theme";

const I = {
  home: <path d="M4 11.5 12 5l8 6.5V19a1 1 0 0 1-1 1h-4.5v-5h-5v5H5a1 1 0 0 1-1-1z" />,
  books: <><path d="M5 4h9a2 2 0 0 1 2 2v14H7a2 2 0 0 1-2-2z" /><path d="M16 8h2a1 1 0 0 1 1 1v11h-3" /><path d="M9 9h4M9 13h4" /></>,
  stamp: <><path d="M9 4h6v5l2.5 3.5V14h-11v-1.5L9 9z" /><path d="M5 19h14" /></>,
  gear: <><circle cx="12" cy="12" r="3" /><path d="M12 3v2.5M12 18.5V21M3 12h2.5M18.5 12H21M5.6 5.6l1.8 1.8M16.6 16.6l1.8 1.8M18.4 5.6l-1.8 1.8M7.4 16.6l-1.8 1.8" /></>,
  plus: <path d="M12 5v14M5 12h14" />,
};
export function Ico({ name, size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {I[name]}
    </svg>
  );
}

const NAV = [
  { href: "/app", label: "Home", icon: "home", match: (p) => p === "/app" || p === "/app/new" },
  { href: "/app/notebooks", label: "My Notebooks", short: "Notebooks", icon: "books", match: (p) => p.startsWith("/app/notebook") },
  { href: "/app/records", label: "Study Records", short: "Records", icon: "stamp", match: (p) => p.startsWith("/app/records") },
  { href: "/app/settings", label: "Settings", icon: "gear", match: (p) => p.startsWith("/app/settings") },
];

export default function Shell({ children }) {
  const path = usePathname() || "/app";
  useAppTheme();
  return (
    <div className="ap">
      <aside className="ap-side">
        <Link href="/" className="ap-logo" aria-label="PocketLM home page">
          <FaceIcon size={30} idp="aps" />
          <span>PocketLM</span>
        </Link>
        <Link href="/app/new" className="ap-newbtn">
          <Ico name="plus" size={18} /> New notebook
        </Link>
        <nav className="ap-nav" aria-label="App">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className={n.match(path) ? "is-on" : ""} aria-current={n.match(path) ? "page" : undefined}>
              <Ico name={n.icon} /> {n.label}
            </Link>
          ))}
        </nav>
        <div className="ap-side-foot">
          {NETWORK.key === "testnet" && <span className="ap-testnet">testnet · no real money</span>}
        </div>
      </aside>

      <div className="ap-main">
        <header className="ap-top">
          <Link href="/" className="ap-logo" aria-label="PocketLM home page">
            <FaceIcon size={26} idp="apt" />
            <span>PocketLM</span>
          </Link>
          <WalletMenu />
        </header>
        <div className="ap-bar-top">
          <WalletMenu />
        </div>
        <main className="ap-content" id="main">{children}</main>
      </div>

      <nav className="ap-tabbar" aria-label="App">
        {NAV.map((n) => (
          <Link key={n.href} href={n.href} className={n.match(path) ? "is-on" : ""} aria-current={n.match(path) ? "page" : undefined}>
            <Ico name={n.icon} size={22} />
            <span>{n.short || n.label}</span>
          </Link>
        ))}
      </nav>
      <Tour />
    </div>
  );
}
