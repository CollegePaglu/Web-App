"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { usersApi, collegesApi } from "@/lib/api";
import toast from "react-hot-toast";

interface College { _id: string; name: string; }

// Extracted outside component so it never re-mounts on each render
const FormInput = ({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) => (
  <div>
    <label
      className="text-xs font-bold uppercase tracking-widest mb-1 block"
      style={{ color: "var(--cp-muted)" }}
    >
      {label}
    </label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-4 py-3 rounded-xl text-sm outline-none"
      style={{
        background: "var(--cp-surface-2)",
        border: "1px solid var(--cp-border)",
        color: "var(--cp-text)",
      }}
    />
  </div>
);

export default function CompleteProfilePage() {
  const router = useRouter();
  const { fetchMe } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [colleges, setColleges] = useState<College[]>([]);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    username: "",
    collegeId: "",
    year: "",
    branch: "",
    rollNumber: "",
  });

  useEffect(() => {
    collegesApi
      .list()
      .then(({ data }) => setColleges(data.data?.colleges || []))
      .catch(() => {});
  }, []);

  const handle = (k: string, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.firstName.trim() || !form.lastName.trim()) {
      toast.error("First name and last name are required");
      return;
    }
    if (!form.username.trim()) {
      toast.error("Username is required");
      return;
    }
    if (!form.collegeId) {
      toast.error("Please select your college");
      return;
    }

    setIsLoading(true);
    try {
      // Find college name from selected ID
      const selectedCollege = colleges.find((c) => c._id === form.collegeId);
      const collegeName = selectedCollege?.name || "";

      // 1. Complete profile (firstName, lastName, college details)
      await usersApi.completeProfile({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        ...(collegeName && {
          college: {
            name: collegeName,
            department: form.branch.trim() || "General",
            year: form.year ? parseInt(form.year) : 1,
            ...(form.rollNumber && { rollNumber: form.rollNumber.trim() }),
          },
        }),
      });

      // 2. Set username separately
      const cleanUsername = form.username.replace(/^@/, "").toLowerCase().trim();
      if (cleanUsername) {
        try {
          await usersApi.setUsername(cleanUsername);
        } catch {
          // Username might already be taken — user can change later
          toast.error("Username is already taken, you can update it in settings");
        }
      }

      // 3. Refresh auth store with latest user data
      await fetchMe();

      toast.success("Profile set up! Welcome 🎉");
      router.push("/");
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || "Failed to save profile. Try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: "var(--cp-bg)" }}
    >
      <div
        className="w-full max-w-md p-8 rounded-3xl shadow-2xl"
        style={{
          background: "var(--cp-surface)",
          border: "1px solid var(--cp-border)",
        }}
      >
        <div className="text-center mb-8">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl font-black"
            style={{ background: "var(--cp-primary)", color: "var(--cp-primary-text)" }}
          >
            🎓
          </div>
          <h1
            className="text-2xl font-extrabold"
            style={{ color: "var(--cp-text)" }}
          >
            Set up your profile
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--cp-muted)" }}>
            One time setup — takes 30 seconds
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <FormInput
              label="First Name *"
              value={form.firstName}
              onChange={(v) => handle("firstName", v)}
              placeholder="Shubham"
            />
            <FormInput
              label="Last Name *"
              value={form.lastName}
              onChange={(v) => handle("lastName", v)}
              placeholder="Raj"
            />
          </div>

          <FormInput
            label="Username *"
            value={form.username}
            onChange={(v) => handle("username", v)}
            placeholder="@shubham556"
          />

          {/* College dropdown */}
          <div>
            <label
              className="text-xs font-bold uppercase tracking-widest mb-1 block"
              style={{ color: "var(--cp-muted)" }}
            >
              College *
            </label>
            <select
              value={form.collegeId}
              onChange={(e) => handle("collegeId", e.target.value)}
              className="w-full px-4 py-3 rounded-xl text-sm outline-none"
              style={{
                background: "var(--cp-surface-2)",
                border: "1px solid var(--cp-border)",
                color: "var(--cp-text)",
              }}
            >
              <option value="">— Select college —</option>
              {colleges.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FormInput
              label="Year"
              value={form.year}
              onChange={(v) => handle("year", v)}
              placeholder="e.g. 3"
              type="number"
            />
            <FormInput
              label="Branch / Dept"
              value={form.branch}
              onChange={(v) => handle("branch", v)}
              placeholder="e.g. CSE"
            />
          </div>

          <FormInput
            label="Roll Number"
            value={form.rollNumber}
            onChange={(v) => handle("rollNumber", v)}
            placeholder="Optional"
          />

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl font-bold text-sm transition-all hover:opacity-90 active:scale-95 disabled:opacity-50 mt-2"
            style={{ background: "var(--cp-primary)", color: "var(--cp-primary-text)" }}
          >
            {isLoading ? "Saving…" : "Let's Go 🚀"}
          </button>
        </form>
      </div>
    </div>
  );
}
