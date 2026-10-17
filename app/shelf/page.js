import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Shelf from "@/components/Shelf";

export const metadata = { title: "My shelf — PocketLM" };

export default function ShelfPage() {
  return (
    <>
      <Header />
      <main className="wrap">
        <Shelf />
      </main>
      <Footer />
    </>
  );
}
