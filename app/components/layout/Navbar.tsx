"use client";

export default function Navbar() {
  return (
    <div
      style={{
        background: "var(--cp-bg)",
        borderBottom: "1px solid var(--cp-border)",
        backdropFilter: "blur(12px)",
      }}
      className="sticky top-0 bg-amber-50 py-6 z-50">
      <header
        className="flex justify-between items-center w-full h-16 px-4 rounded-2xl mb-2"
        style={{
          background: "var(--cp-surface)",
          borderBottom: "1px solid var(--cp-border)",
          backdropFilter: "blur(12px)",
        }}
      >
        {/* Search */}
        <div className="flex-1 max-w-md">
          <div className="relative group">
            <span
              className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-lg transition-colors"
              style={{ color: "var(--cp-muted)" }}
            >
              search
            </span>
            <input
              type="text"
              placeholder="Search campus gossip..."
              className="w-full rounded-2xl pl-12 pr-4 py-2.5 text-sm outline-none transition-all"
              style={{
                background: "var(--cp-surface-2)",
                color: "var(--cp-text)",
                border: "1px solid var(--cp-border)",
              }}
            />
          </div>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-3 ml-6">
          <button
            className="p-2 rounded-xl transition-colors"
            style={{ color: "var(--cp-muted)" }}
            aria-label="Notifications"
          >
            <span className="material-symbols-outlined">notifications</span>
          </button>

          <button
            className="p-2 rounded-xl transition-colors"
            style={{ color: "var(--cp-accent)" }}
            aria-label="Trending"
          >
            <span
              className="material-symbols-outlined"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              local_fire_department
            </span>
          </button>

          {/* Avatar */}
          <div
            className="w-10 h-10 rounded-full overflow-hidden"
            style={{ border: "2px solid var(--cp-primary)" }}
          >
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCreFSxDEvLmZcXBlgaVO2MalBoc0aeH-svysyoQeXqgyE1aXs9Muo94GWVijtYuTB6NBNs0QT94mKHadEkoE3dZzGUaZ8PRYyo_3QRDrLiHh65c2FS0tQnbKOmZDwdCneyoOCyakJbeKbOrXqs423F2G6U0rUtUCvDX1HOf5Li-wimC0jcIgjM7JHBllV_S_gAHntCq99DxGJ0Ow8Cwi9v8NDwncEPhKe7rBwXdirRbOpmzFnv3fy79ohgR5pQ50Z9O8RdkwIcTS0"
              alt="User profile"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </header>
    </div>
  );
}