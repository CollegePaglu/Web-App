"use client";

import { useState, useEffect } from "react";
import { useNotesStore } from "@/store/useNotesStore";
import NoteCard from "@/app/components/NoteCard";
import UploadNoteModal from "@/app/components/UploadNoteModal";
import { SEMESTER_SUBJECTS } from "@/app/components/notes-constants";
import { notesApi } from "@/lib/api";
import { Upload, ChevronDown } from "lucide-react";

export default function NotesPageClient() {
  const {
    notes,
    isLoading,
    semester,
    subject,
    setSemester,
    setSubject,
    fetchNotes,
    loadMore,
    pagination,
  } = useNotesStore();

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showSubjectDropdown, setShowSubjectDropdown] = useState(false);

  useEffect(() => {
    fetchNotes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDownload = async (id: string, url: string) => {
    try {
      await notesApi.trackDownload(id);
      useNotesStore.getState().updateDownloadCount(id);
      window.open(url, "_blank");
    } catch (error) {
      console.error("Download error:", error);
      window.open(url, "_blank");
    }
  };

  const subjects = SEMESTER_SUBJECTS[semester] || [];

  return (
    <div className="flex-1 px-6 py-4 max-w-2xl w-full self-center">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-extrabold" style={{ color: "var(--cp-text)" }}>
          📚 Notes
        </h1>
        <button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-opacity hover:opacity-90"
          style={{ background: "var(--cp-primary)", color: "var(--cp-primary-text)" }}
        >
          <Upload size={16} />
          Upload
        </button>
      </div>

      <div className="flex flex-col gap-3 mb-6">
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {[2, 4, 6].map((sem) => (
            <button
              key={sem}
              onClick={() => {
                setSemester(sem);
                setSubject("");
              }}
              className="px-4 py-2 rounded-lg font-semibold text-sm whitespace-nowrap transition-all shrink-0 border"
              style={{
                background:
                  semester === sem ? "var(--cp-primary)" : "var(--cp-surface-2)",
                color: semester === sem ? "var(--cp-primary-text)" : "var(--cp-text)",
                borderColor:
                  semester === sem ? "var(--cp-primary)" : "var(--cp-border)",
              }}
            >
              Sem {sem}
            </button>
          ))}
        </div>

        <div className="relative">
          <button
            onClick={() => setShowSubjectDropdown(!showSubjectDropdown)}
            className="w-full px-4 py-2 rounded-lg border text-sm font-medium flex items-center justify-between transition-opacity hover:opacity-90"
            style={{
              background: "var(--cp-surface)",
              borderColor: "var(--cp-border)",
              color: subject ? "var(--cp-text)" : "var(--cp-muted)",
            }}
          >
            <span>{subject || "All Subjects"}</span>
            <ChevronDown size={16} />
          </button>

          {showSubjectDropdown && (
            <div
              className="absolute top-full left-0 right-0 mt-1 rounded-lg border shadow-lg max-h-60 overflow-y-auto z-10"
              style={{
                background: "var(--cp-surface)",
                borderColor: "var(--cp-border)",
              }}
            >
              <button
                onClick={() => {
                  setSubject("");
                  setShowSubjectDropdown(false);
                }}
                className="w-full text-left px-4 py-2 text-sm hover:opacity-70 transition-opacity"
                style={{
                  color: !subject ? "var(--cp-primary)" : "var(--cp-text)",
                  fontWeight: !subject ? "700" : "400",
                }}
              >
                All Subjects
              </button>
              {subjects.map((subj) => (
                <button
                  key={subj}
                  onClick={() => {
                    setSubject(subj);
                    setShowSubjectDropdown(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm border-t hover:opacity-70 transition-opacity"
                  style={{
                    borderColor: "var(--cp-border)",
                    color: subject === subj ? "var(--cp-primary)" : "var(--cp-text)",
                    fontWeight: subject === subj ? "700" : "400",
                  }}
                >
                  {subj}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {isLoading && notes.length === 0 ? (
          <div className="text-center py-12">
            <div
              className="inline-block"
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                border: "3px solid var(--cp-border)",
                borderTop: "3px solid var(--cp-primary)",
                animation: "spin 0.6s linear infinite",
              }}
            />
            <p className="mt-4 text-sm" style={{ color: "var(--cp-muted)" }}>
              Loading notes...
            </p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : notes.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg font-semibold" style={{ color: "var(--cp-text)" }}>
              No notes found
            </p>
            <p className="text-sm mt-2" style={{ color: "var(--cp-muted)" }}>
              Be the first to upload notes for this semester!
            </p>
          </div>
        ) : (
          <>
            {notes.map((note) => (
              <NoteCard key={note._id} note={note} onDownload={handleDownload} />
            ))}

            {pagination?.hasNext && (
              <button
                onClick={loadMore}
                className="w-full px-4 py-3 rounded-lg font-semibold text-sm transition-opacity hover:opacity-90 disabled:opacity-50"
                style={{
                  background: "var(--cp-border)",
                  color: "var(--cp-text)",
                }}
                disabled={isLoading}
              >
                {isLoading ? "Loading..." : "Load More"}
              </button>
            )}
          </>
        )}
      </div>

      <UploadNoteModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
      />
    </div>
  );
}
