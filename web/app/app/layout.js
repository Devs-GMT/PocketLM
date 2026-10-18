import Shell from "@/components/app/Shell";
import "./app.css";

export const metadata = { title: "PocketLM app" };

export default function AppLayout({ children }) {
  return <Shell>{children}</Shell>;
}
