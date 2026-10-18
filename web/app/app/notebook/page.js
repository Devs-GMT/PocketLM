import { Suspense } from "react";
import NotebookView from "@/components/app/NotebookView";

export const metadata = { title: "Notebook — PocketLM" };

export default function NotebookPage() {
  return (
    <Suspense fallback={null}>
      <NotebookView />
    </Suspense>
  );
}
