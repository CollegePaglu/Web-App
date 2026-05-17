"use client";

import Link from "next/link";
import { BookOpen, ChevronRight } from "lucide-react";

/** Compact Notes CTA — shown above the fold on mobile home feed */
export default function NotesPromoBanner() {
  return (
    <Link
      href="/notes"
      className="lg:hidden flex items-center gap-3 px-4 py-3 rounded-2xl transition-all active:scale-[0.98] nav-notes-highlight nav-notes-promo"
    >
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: "var(--cp-primary-10)" }}
      >
        <BookOpen size={22} style={{ color: "var(--cp-primary)" }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold leading-tight" style={{ color: "var(--cp-text)" }}>
          📚 Notes
        </p>
        <p className="text-xs leading-snug mt-0.5 truncate" style={{ color: "var(--cp-muted)" }}>
          Upload & download semester notes
        </p>
      </div>
      <span className="nav-notes-badge shrink-0">NEW</span>
      <ChevronRight size={18} className="shrink-0" style={{ color: "var(--cp-muted)" }} />
    </Link>
  );
}
