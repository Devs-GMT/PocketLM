"use client";
import { useSearchParams } from "next/navigation";
import Studio from "@/components/Studio";
import Proof from "@/components/Proof";

export default function NotebookApp() {
  const params = useSearchParams();
  const study = params.get("study");
  if (study !== null) return <Proof id={study} />;
  return <Studio />;
}
