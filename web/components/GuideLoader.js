"use client";
import dynamic from "next/dynamic";

// Browser-only: the guide reads the window size and localStorage, and it is not needed for the first paint.
const GuideBot = dynamic(() => import("@/components/GuideBot"), { ssr: false });

export default function GuideLoader() {
  return <GuideBot />;
}
