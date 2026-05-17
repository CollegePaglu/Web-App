"use client";
import React, { useState, useRef } from "react";
import { X, Upload } from "lucide-react";
import { notesApi } from "@/lib/api";
import { useNotesStore } from "@/store/useNotesStore";
import { SEMESTER_SUBJECTS } from "./notes-constants";

interface UploadNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UploadNoteModal({ isOpen, onClose }: UploadNoteModalProps) {
  const fetchNotes = useNotesStore((s) => s.fetchNotes);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    subject: "",
    semester: 2,
    file: null as File | null,
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({ ...prev, file }));
      setError("");
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.title.trim()) {
      setError("Title is required");
      return;
    }
    if (!formData.subject) {
      setError("Please select a subject");
      return;
    }
    if (!formData.file) {
      setError("Please upload a file");
      return;
    }

    setLoading(true);
    try {
      // Upload file first
      const uploadRes = await notesApi.uploadFile(formData.file);
      const fileUrl = uploadRes.data.data?.url;
      if (!fileUrl) {
        throw new Error("File upload failed");
      }

      const noteData = {
        title: formData.title,
        description: formData.description,
        subject: formData.subject,
        semester: Number(formData.semester),
        fileUrl,
        fileType: formData.file.type,
        fileSize: formData.file.size,
        isPublic: true,
      };

      await notesApi.uploadNote(noteData);
      await fetchNotes(true);

      // Reset form
      setFormData({
        title: "",
        description: "",
        subject: "",
        semester: 2,
        file: null,
      });
      if (fileInputRef.current) fileInputRef.current.value = "";

      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to upload note");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.5)" }}
    >
      <div
        className="rounded-lg w-full max-w-md shadow-lg"
        style={{ background: "var(--cp-surface)" }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between p-4 border-b"
          style={{ borderColor: "var(--cp-border)" }}
        >
          <h2
            className="text-lg font-bold"
            style={{ color: "var(--cp-text)" }}
          >
            Upload Note
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:opacity-70"
            disabled={loading}
          >
            <X size={20} style={{ color: "var(--cp-muted)" }} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {error && (
            <div
              className="p-3 rounded-lg text-sm"
              style={{ background: "#ff4d4d15", color: "#ff4d4d" }}
            >
              {error}
            </div>
          )}

          {/* Title */}
          <div>
            <label
              className="block text-sm font-semibold mb-2"
              style={{ color: "var(--cp-text)" }}
            >
              Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Note title"
              className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
              style={{
                background: "var(--cp-surface-2)",
                borderColor: "var(--cp-border)",
                color: "var(--cp-text)",
              }}
              disabled={loading}
            />
          </div>

          {/* Semester */}
          <div>
            <label
              className="block text-sm font-semibold mb-2"
              style={{ color: "var(--cp-text)" }}
            >
              Semester *
            </label>
            <select
              name="semester"
              value={formData.semester}
              onChange={handleInputChange}
              className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
              style={{
                background: "var(--cp-surface-2)",
                borderColor: "var(--cp-border)",
                color: "var(--cp-text)",
              }}
              disabled={loading}
            >
              <option value={2}>Semester 2</option>
              <option value={4}>Semester 4</option>
              <option value={6}>Semester 6</option>
            </select>
          </div>

          {/* Subject */}
          <div>
            <label
              className="block text-sm font-semibold mb-2"
              style={{ color: "var(--cp-text)" }}
            >
              Subject *
            </label>
            <select
              name="subject"
              value={formData.subject}
              onChange={handleInputChange}
              className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
              style={{
                background: "var(--cp-surface-2)",
                borderColor: "var(--cp-border)",
                color: "var(--cp-text)",
              }}
              disabled={loading}
            >
              <option value="">Select subject</option>
              {SEMESTER_SUBJECTS[formData.semester].map((subj) => (
                <option key={subj} value={subj}>
                  {subj}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label
              className="block text-sm font-semibold mb-2"
              style={{ color: "var(--cp-text)" }}
            >
              Description (optional)
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Add a brief description..."
              rows={3}
              className="w-full px-3 py-2 rounded-lg border text-sm outline-none resize-none"
              style={{
                background: "var(--cp-surface-2)",
                borderColor: "var(--cp-border)",
                color: "var(--cp-text)",
              }}
              disabled={loading}
            />
          </div>

          {/* File Upload */}
          <div>
            <label
              className="block text-sm font-semibold mb-2"
              style={{ color: "var(--cp-text)" }}
            >
              Upload File *
            </label>
            <div
              className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:opacity-75 transition-opacity"
              style={{ borderColor: "var(--cp-primary)", background: "var(--cp-surface-2)" }}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload size={24} className="mx-auto mb-2" style={{ color: "var(--cp-primary)" }} />
              <p
                className="text-sm font-semibold"
                style={{ color: "var(--cp-text)" }}
              >
                {formData.file ? formData.file.name : "Click to upload"}
              </p>
              <p className="text-xs" style={{ color: "var(--cp-muted)" }}>
                PDF, DOC, DOCX, XLS, XLSX supported
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.xls,.xlsx,image/*"
              className="hidden"
              disabled={loading}
            />
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-lg font-semibold text-sm transition-opacity hover:opacity-70"
              style={{
                background: "var(--cp-border)",
                color: "var(--cp-text)",
              }}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 rounded-lg font-semibold text-sm transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{ background: "var(--cp-primary)", color: "var(--cp-primary-text)" }}
              disabled={loading}
            >
              {loading ? "Uploading..." : "Upload"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
