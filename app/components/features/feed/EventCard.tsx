"use client";

interface EventCardProps {
  society: string;
  title: string;
  description: string;
  onRegister?: () => void;
}

export default function EventCard({
  society,
  title,
  description,
  onRegister,
}: EventCardProps) {
  return (
    <article
      className="cp-card p-6"
      style={{ background: "var(--cp-surface)" }}
    >
      <div className="flex gap-4">
        <div className="flex-shrink-0">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{
              background: "var(--cp-primary-10)",
              color: "var(--cp-primary)",
            }}
          >
            <span className="material-symbols-outlined text-3xl">
              event_available
            </span>
          </div>
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span
              className="text-xs font-bold px-2 py-0.5 rounded-md"
              style={{
                background: "var(--cp-primary-10)",
                color: "var(--cp-primary)",
              }}
            >
              Event
            </span>
            <h4
              className="font-bold text-sm"
              style={{ color: "var(--cp-text)" }}
            >
              {society}
            </h4>
          </div>

          <h3
            className="text-lg font-bold mb-2"
            style={{ color: "var(--cp-text)" }}
          >
            {title}
          </h3>

          <p
            className="text-sm mb-4 leading-relaxed"
            style={{ color: "var(--cp-muted)" }}
          >
            {description}
          </p>

          <div className="flex items-center gap-3">
            <button
              onClick={onRegister}
              className="px-4 py-2 rounded-xl text-xs font-bold transition-all hover:opacity-90 active:scale-95"
              style={{
                background: "var(--cp-primary)",
                color: "#fff",
              }}
            >
              Count Me In
            </button>
            <button
              className="text-xs font-bold px-4 py-2 rounded-xl transition-all"
              style={{ color: "var(--cp-muted)" }}
            >
              Details
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}