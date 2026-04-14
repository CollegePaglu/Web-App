"use client";
import { useState } from "react";

export default function CreatePost() {
  const [anonymous, setAnonymous] = useState(false);
  const [text, setText] = useState("");

  return (
    <section
      className="cp-card p-6"
      style={{ background: "var(--cp-surface)" }}
    >
      <div className="flex gap-4">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
          style={{
            background: "var(--cp-primary-10)",
            color: "var(--cp-primary)",
          }}
        >
          <span className="material-symbols-outlined text-2xl">edit_note</span>
        </div>
        <div className="flex-1">
          <textarea
            rows={2}
            className="w-full bg-transparent border-0 focus:ring-0 text-base font-medium resize-none outline-none placeholder:font-normal"
            placeholder="What's the tea?"
            value={text}
            onChange={(e) => setText(e.target.value)}
            style={{
              color: "var(--cp-text)",
            }}
          />
        </div>
      </div>

      <div
        className="mt-4 pt-4 flex justify-between items-center"
        style={{ borderTop: "1px solid var(--cp-border)" }}
      >
        {/* Media actions */}
        <div className="flex gap-1">
          {["image", "gif_box", "poll"].map((icon) => (
            <button
              key={icon}
              className="p-2 rounded-lg transition-colors"
              style={{ color: "var(--cp-muted)" }}
            >
              <span className="material-symbols-outlined text-xl">{icon}</span>
            </button>
          ))}
        </div>

        {/* Anonymous + Post */}
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <span
              className="text-xs font-semibold uppercase tracking-tighter"
              style={{ color: "var(--cp-muted)" }}
            >
              Anonymous
            </span>
            <div className="relative inline-flex items-center">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={anonymous}
                onChange={(e) => setAnonymous(e.target.checked)}
              />
              <div
                className="w-9 h-5 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all"
                style={{
                  background: anonymous ? "var(--cp-primary)" : "var(--cp-border-strong)",
                }}
              />
            </div>
          </label>

          <button
            className="px-6 py-2 font-bold rounded-xl text-sm transition-all hover:opacity-90 active:scale-95"
            style={{
              background: "var(--cp-primary)",
              color: "#fff",
            }}
          >
            Post
          </button>
        </div>
      </div>
    </section>
  );
}