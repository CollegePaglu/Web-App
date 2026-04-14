// Redirect old /login path to new (auth)/login/page.tsx
import { redirect } from "next/navigation";
export default function OldLoginRedirect() {
  redirect("/login");
}