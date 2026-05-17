"use client";
import { create } from "zustand";
import { notesApi, Note } from "@/lib/api";

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface NotesState {
  notes: Note[];
  pagination: Pagination | null;
  isLoading: boolean;
  isLoadingMore: boolean;
  currentPage: number;
  semester: number;
  subject: string;

  fetchNotes: (reset?: boolean) => Promise<void>;
  loadMore: () => Promise<void>;
  setSemester: (sem: number) => void;
  setSubject: (sub: string) => void;
  addNote: (note: Note) => void;
  removeNote: (id: string) => void;
  updateDownloadCount: (id: string) => void;
}

export const useNotesStore = create<NotesState>((set, get) => ({
  notes: [],
  pagination: null,
  isLoading: false,
  isLoadingMore: false,
  currentPage: 1,
  semester: 2,
  subject: "",

  fetchNotes: async (reset = true) => {
    const { semester, subject, currentPage } = get();
    set({ isLoading: reset, isLoadingMore: !reset });

    try {
      const page = reset ? 1 : currentPage;
      const { data } = await notesApi.getNotes({
        semester,
        subject: subject || undefined,
        page,
        limit: 20,
      });

      const raw = data.pagination;
      const pagination = raw
        ? {
            ...raw,
            hasNext: raw.page < raw.pages,
            hasPrev: raw.page > 1,
          }
        : null;

      set((s) => ({
        notes: reset ? data.data : [...s.notes, ...data.data],
        pagination,
        currentPage: page,
        isLoading: false,
        isLoadingMore: false,
      }));
    } catch (error) {
      console.error("Failed to fetch notes:", error);
      set({
        isLoading: false,
        isLoadingMore: false,
      });
    }
  },

  loadMore: async () => {
    const { pagination, isLoadingMore, isLoading } = get();
    if (isLoadingMore || isLoading) return;
    if (!pagination?.hasNext) return;

    set((s) => ({ currentPage: s.currentPage + 1 }));
    await get().fetchNotes(false);
  },

  setSemester: (semester) => {
    set({ semester, currentPage: 1 });
    get().fetchNotes(true);
  },

  setSubject: (subject) => {
    set({ subject, currentPage: 1 });
    get().fetchNotes(true);
  },

  addNote: (note) =>
    set((s) => ({
      notes: [note, ...s.notes],
    })),

  removeNote: (id) =>
    set((s) => ({
      notes: s.notes.filter((n) => n._id !== id),
    })),

  updateDownloadCount: (id) =>
    set((s) => ({
      notes: s.notes.map((n) =>
        n._id === id ? { ...n, downloadCount: n.downloadCount + 1 } : n
      ),
    })),
}));
