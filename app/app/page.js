import { Suspense } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import NotebookApp from "@/components/NotebookApp";

export const metadata = { title: "My notebook — PocketLM" };

export default function AppPage() {
  return (
    <>
      <Header />
      <main className="wrap">
        <Suspense fallback={<p className="note" style={{ marginTop: 40 }}>opening your notebook…</p>}>
          <NotebookApp />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
