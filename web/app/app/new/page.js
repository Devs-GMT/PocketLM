import { Suspense } from "react";
import NewNotebook from "@/components/app/NewNotebook";

export const metadata = { title: "New notebook — PocketLM" };

export default function NewPage() {
  return (
    <Suspense fallback={null}>
      <NewNotebook />
    </Suspense>
  );
}
