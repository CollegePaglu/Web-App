"use client";
import SideBar from "./SideBar";
import RightPanel from "./RightPanel";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="flex w-full"
      style={{ background: "var(--cp-bg)", minHeight: "100vh" }}
    >
      {/* Left Sidebar — fixed height, sticky */}
      <SideBar />

      {/* Center — scrollable feed column */}
      <main
        className="flex-1 min-w-0 flex flex-col overflow-y-auto"
        style={{ height: "100vh" }}
      >
        {children}
      </main>

      {/* Right Panel — fixed height, sticky */}
      <RightPanel />
    </div>
  );
}