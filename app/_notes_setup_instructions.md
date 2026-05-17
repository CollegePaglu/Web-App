// This is a temporary workaround file
// Next.js won't recognize this as a route because it's at the app root
// You need to rename this directory structure or create: app/notes/page.tsx
// 
// To fix: Create a directory "notes" in app/ folder, then move this content to app/notes/page.tsx

import { redirect } from "next/navigation";

export default function NotesPageRedirect() {
  // Redirect is not the best solution but showing the issue
  redirect("/notes");
}
