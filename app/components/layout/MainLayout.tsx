"use client";
import SideBar from "./SideBar";
import RightPanel from "./RightPanel";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen" style={{ background: "var(--cp-bg)" }}>
      <SideBar />
      <main className="flex-1 min-w-0 flex flex-col">
        {children}
      </main>
      <RightPanel />
    </div>
  );
}