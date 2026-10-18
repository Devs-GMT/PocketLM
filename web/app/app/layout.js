import Shell from "@/components/app/Shell";
import { THEME_BOOT } from "@/lib/theme";
import "./app.css";
import "./wallet.css";
import "./dark.css";

export const metadata = { title: "PocketLM app" };

export default function AppLayout({ children }) {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: THEME_BOOT }} />
      <Shell>{children}</Shell>
    </>
  );
}
