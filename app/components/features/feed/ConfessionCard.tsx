"use client";

interface ConfessionCardProps {
  number: number;
  text: string;
  likes: number;
  tag: string;
}

export default function ConfessionCard({
  number,
  text,
  likes,
  tag,
}: ConfessionCardProps) {
  return (
    <article
      className="cp-card relative p-8 overflow-hidden"
      style={{
        background: "var(--cp-surface)",
        borderLeft: "4px solid var(--cp-primary)",
      }}
    >
      {/* Decorative quote mark */}
      <div
        className="absolute -top-8 -right-2 opacity-[0.04] pointer-events-none select-none"
        style={{ fontSize: "12rem", lineHeight: 1, color: "var(--cp-text)" }}
        aria-hidden
      >
        ❝
      </div>

      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center"
          style={{ background: "var(--cp-text)", color: "var(--cp-bg)" }}
        >
          <span className="material-symbols-outlined text-base">
            visibility_off
          </span>
        </div>
        <span
          className="text-xs font-bold uppercase tracking-widest"
          style={{ color: "var(--cp-muted)" }}
        >
          Anonymous Confession #{number}
        </span>
      </div>

      {/* Quote */}
      <blockquote
        className="text-xl font-medium leading-snug italic mb-6 relative z-10"
        style={{ color: "var(--cp-text)" }}
      >
        "{text}"
      </blockquote>

      {/* Footer */}
      <div
        className="flex items-center justify-between pt-4"
        style={{ borderTop: "1px solid var(--cp-border)" }}
      >
        <button
          className="flex items-center gap-2 text-xs font-bold uppercase tracking-tighter transition-colors"
          style={{ color: "var(--cp-primary)" }}
        >
          <span
            className="material-symbols-outlined text-base"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            favorite
          </span>
          {likes} Tea Spilled
        </button>
        <span
          className="text-[10px] font-medium"
          style={{ color: "var(--cp-muted)" }}
        >
          Post in {tag}
        </span>
      </div>
    </article>
  );
}