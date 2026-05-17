"use client";
import { Note } from "@/lib/api";
import { FileText, Download, Calendar, TrendingDown } from "lucide-react";

function formatDate(dateStr: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(dateStr));
}

interface NoteCardProps {
  note: Note;
  onDownload: (id: string, url: string) => void;
}

export default function NoteCard({ note, onDownload }: NoteCardProps) {
  const handleDownload = () => {
    onDownload(note._id, note.fileUrl);
  };

  return (
    <div
      className="rounded-lg border p-4 shadow-sm hover:shadow-md transition-shadow"
      style={{
        background: "var(--cp-surface)",
        borderColor: "var(--cp-border)",
      }}
    >
      {/* Header */}
      <div className="flex gap-3 mb-3">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: "var(--cp-primary-10)" }}
        >
          <FileText size={20} style={{ color: "var(--cp-text)" }} />
        </div>
        <div className="flex-1 min-w-0">
          <h3
            className="font-semibold text-sm truncate"
            style={{ color: "var(--cp-text)" }}
          >
            {note.title}
          </h3>
          <p
            className="text-xs font-medium uppercase truncate"
            style={{ color: "var(--cp-muted)" }}
          >
            {note.subject}
          </p>
        </div>
      </div>

      {/* Description */}
      {note.description && (
        <p
          className="text-sm line-clamp-2 mb-3"
          style={{ color: "var(--cp-text)", opacity: 0.8 }}
        >
          {note.description}
        </p>
      )}

      {/* Divider */}
      <div
        className="h-px my-3"
        style={{ background: "var(--cp-border)" }}
      />

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs" style={{ color: "var(--cp-muted)" }}>
          <div className="flex items-center gap-1">
            <Calendar size={14} />
            <span>{formatDate(note.createdAt)}</span>
          </div>
          <div className="flex items-center gap-1">
            <TrendingDown size={14} />
            <span>{note.downloadCount}</span>
          </div>
        </div>

        <button
          onClick={handleDownload}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-opacity hover:opacity-90"
          style={{ background: "var(--cp-primary)", color: "var(--cp-primary-text)" }}
        >
          <Download size={14} />
          Download
        </button>
      </div>
    </div>
  );
}
