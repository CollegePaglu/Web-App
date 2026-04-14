"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { collegesApi } from "@/lib/api";
import toast from "react-hot-toast";
import { useEffect } from "react";

interface College { _id: string; name: string; }

export default function CompleteProfilePage() {
  const router = useRouter();
  const { completeProfile, isLoading } = useAuthStore();
  const [colleges, setColleges] = useState<College[]>([]);
  const [form, setForm] = useState({
    username: "",
    displayName: "",
    collegeId: "",
    rollNumber: "",
    year: "",
    branch: "",
  });

  useEffect(() => {
    collegesApi.list().then(({ data }) => setColleges(data.data || [])).catch(() => {});
  }, []);

  const handle = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.username || !form.displayName || !form.collegeId) {
      toast.error("Fill all required fields");
      return;
    }
    try {
      await completeProfile(form);
      toast.success("Profile set up! Welcome 🎉");
      router.push("/");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to save profile");
    }
  };

  const Input = ({ label, k, placeholder, type = "text" }: { label: string; k: keyof typeof form; placeholder?: string; type?: string }) => (
    <div>
      <label className="text-xs font-bold uppercase tracking-widest mb-1 block" style={{ color: "var(--cp-muted)" }}>{label}</label>
      <input
        type={type}
        value={form[k]}
        onChange={(e) => handle(k, e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-3 rounded-xl text-sm outline-none"
        style={{ background: "var(--cp-surface-2)", border: "1px solid var(--cp-border)", color: "var(--cp-text)" }}
      />
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "var(--cp-bg)" }}>
      <div className="w-full max-w-md p-8 rounded-3xl shadow-2xl" style={{ background: "var(--cp-surface)", border: "1px solid var(--cp-border)" }}>
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl font-black" style={{ background: "var(--cp-primary)", color: "#fff" }}>🎓</div>
          <h1 className="text-2xl font-extrabold" style={{ color: "var(--cp-text)" }}>Set up your profile</h1>
          <p className="text-sm mt-1" style={{ color: "var(--cp-muted)" }}>One time setup — takes 30 seconds</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input label="Display Name *" k="displayName" placeholder="How you appear to others" />
          <Input label="Username *" k="username" placeholder="@yourhandle" />

          <div>
            <label className="text-xs font-bold uppercase tracking-widest mb-1 block" style={{ color: "var(--cp-muted)" }}>College *</label>
            <select
              value={form.collegeId}
              onChange={(e) => handle("collegeId", e.target.value)}
              className="w-full px-4 py-3 rounded-xl text-sm outline-none"
              style={{ background: "var(--cp-surface-2)", border: "1px solid var(--cp-border)", color: "var(--cp-text)" }}
            >
              <option value="">— Select college —</option>
              {colleges.map((c) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input label="Year" k="year" placeholder="e.g. 2" type="number" />
            <Input label="Branch" k="branch" placeholder="e.g. CS" />
          </div>

          <Input label="Roll Number" k="rollNumber" placeholder="Optional" />

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl font-bold text-sm transition-all hover:opacity-90 active:scale-95 disabled:opacity-50 mt-2"
            style={{ background: "var(--cp-primary)", color: "#fff" }}
          >
            {isLoading ? "Saving…" : "Let's Go 🚀"}
          </button>
        </form>
      </div>
    </div>
  );
}
