import SideBar from "@/app/components/layout/SideBar";
import Navbar from "@/app/components/layout/Navbar";
import RightPanel from "@/app/components/layout/RightPanel";
import { ReactNode } from "react";

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className="flex min-h-screen mx-auto relative"
      style={{ background: "var(--cp-bg)" }}
    >
      <SideBar />

      <main className="flex-1 max-w-2xl mx-auto py-8 px-4 flex flex-col gap-6">
        
        {children}
      </main>

      <RightPanel />
    </div>
  );
}