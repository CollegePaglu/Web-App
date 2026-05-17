import MainLayout from "@/app/components/layout/MainLayout";
import Navbar from "@/app/components/layout/Navbar";
import NotesPageClient from "./NotesPageClient";

export const metadata = {
  title: "Notes – College Paglu",
  description: "Academic notes shared by students",
};

export default function NotesPage() {
  return (
    <MainLayout>
      <Navbar />
      <NotesPageClient />
    </MainLayout>
  );
}
