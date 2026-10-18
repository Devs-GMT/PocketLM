import { redirect } from "next/navigation";

// The old "shelf" is now Study records inside the app.
export default function ShelfPage() {
  redirect("/app/records");
}
