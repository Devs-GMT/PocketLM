import { Fredoka, Newsreader, Caveat } from "next/font/google";
import { WalletProvider } from "@/lib/wallet";
import "./globals.css";

const fredoka = Fredoka({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--font-fredoka", display: "swap" });
const newsreader = Newsreader({ subsets: ["latin"], style: ["normal", "italic"], variable: "--font-newsreader", display: "swap" });
const caveat = Caveat({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--font-caveat", display: "swap" });

export const metadata = {
  title: "PocketLM — an AI notebook that helps you learn",
  description: "Paste text or a short PDF and get a summary, key points, a quiz and answers to your questions. Finish the quiz and stamp your study on BOT Chain.",
};

export const viewport = { width: "device-width", initialScale: 1, themeColor: "#fbf8f5" };

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${fredoka.variable} ${newsreader.variable} ${caveat.variable}`}>
      <body>
        <WalletProvider>{children}</WalletProvider>
      </body>
    </html>
  );
}
