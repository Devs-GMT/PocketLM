"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Shared links look like /?study=9 — send them to the notebook, which shows the proof.
export default function StudyRedirect() {
  const router = useRouter();
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("study");
    if (id !== null) router.replace(`/app?study=${encodeURIComponent(id)}`);
  }, [router]);
  return null;
}
