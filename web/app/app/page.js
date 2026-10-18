import { Suspense } from "react";
import HomeView from "@/components/app/HomeView";

export const metadata = { title: "Home — PocketLM" };

export default function AppHome() {
  return (
    <Suspense fallback={null}>
      <HomeView />
    </Suspense>
  );
}
