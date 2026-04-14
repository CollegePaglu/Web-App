"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import MainLayout from "@/app/components/layout/MainLayout";
import Navbar from "@/app/components/layout/Navbar";
import { useAuthStore } from "@/store/useAuthStore";
import { usersApi } from "@/lib/api";
import toast from "react-hot-toast";

export default function SettingsPage() {
  const router = useRouter();
  const { user, updateProfile, logout, isLoading } = useAuthStore();
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    displayName: user?.displayName || user?.name || "",
    username: user?.username || "",
    bio: user?.bio || "",
  });
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);

  if (!user) {
    router.push("/login");
    return null;
  }

  const handle = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleAvatarUpload = async () => {
    if (!avatarFile) return;
    setAvatarUploading(true);
    try {
      await usersApi.uploadAvatar(avatarFile);
      toast.success("Avatar updated!");
      setAvatarFile(null);
    } catch {
      toast.error("Failed to upload avatar");
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile(form);
      if (avatarFile) await handleAvatarUpload();
      toast.success("Profile saved!");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to save");
    }
  };

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out");
    router.push("/login");
  };

  const displayName = user.displayName || user.name || user.username || "You";
  const currentAvatar = avatarPreview || user.avatar;

  return (
    <MainLayout>
      <Navbar />
      <div className="flex-1 px-6 py-6 max-w-2xl w-full self-center">
        <h1 className="text-2xl font-extrabold mb-6" style={{ color: "var(--cp-text)" }}>Settings</h1>

        {/* Avatar */}
        <div className="cp-card p-6 mb-4">
          <h2 className="text-sm font-bold uppercase tracking-widest mb-4" style={{ color: "var(--cp-muted)" }}>Profile Photo</h2>
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className="w-20 h-20 rounded-full overflow-hidden"
                style={{ background: "var(--cp-surface-2)", border: "3px solid var(--cp-primary)" }}>
                {currentAvatar
                  ? <img src={currentAvatar} className="w-full h-full object-cover" alt="" />
                  : <div className="w-full h-full flex items-center justify-center text-2xl font-black"
                      style={{ color: "var(--cp-primary)" }}>{displayName[0]}</div>}
              </div>
              <button onClick={() => fileRef.current?.click()}
                className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center"
                style={{ background: "var(--cp-primary)", color: "#fff" }}>
                <span className="material-symbols-outlined text-sm">edit</span>
              </button>
            </div>
            <div>
              <p className="text-sm font-bold mb-1" style={{ color: "var(--cp-text)" }}>{displayName}</p>
              <p className="text-xs mb-2" style={{ color: "var(--cp-muted)" }}>JPG, PNG, WebP · Max 5MB</p>
              {avatarFile && (
                <button onClick={handleAvatarUpload} disabled={avatarUploading}
                  className="text-xs px-3 py-1.5 rounded-lg font-bold"
                  style={{ background: "var(--cp-primary)", color: "#fff" }}>
                  {avatarUploading ? "Uploading…" : "Upload"}
                </button>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          </div>
        </div>

        {/* Profile info */}
        <form onSubmit={handleSave} className="cp-card p-6 mb-4 flex flex-col gap-4">
          <h2 className="text-sm font-bold uppercase tracking-widest" style={{ color: "var(--cp-muted)" }}>Profile Info</h2>

          {[
            { label: "Display Name", key: "displayName", placeholder: "Your name" },
            { label: "Username", key: "username", placeholder: "@handle" },
          ].map(({ label, key, placeholder }) => (
            <div key={key}>
              <label className="text-xs font-bold uppercase tracking-widest mb-1 block" style={{ color: "var(--cp-muted)" }}>{label}</label>
              <input
                value={form[key as keyof typeof form]}
                onChange={(e) => handle(key, e.target.value)}
                placeholder={placeholder}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                style={{ background: "var(--cp-surface-2)", border: "1px solid var(--cp-border)", color: "var(--cp-text)" }}
              />
            </div>
          ))}

          <div>
            <label className="text-xs font-bold uppercase tracking-widest mb-1 block" style={{ color: "var(--cp-muted)" }}>Bio</label>
            <textarea
              value={form.bio}
              onChange={(e) => handle("bio", e.target.value)}
              placeholder="Tell your campus about yourself…"
              rows={3}
              maxLength={200}
              className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none"
              style={{ background: "var(--cp-surface-2)", border: "1px solid var(--cp-border)", color: "var(--cp-text)" }}
            />
            <p className="text-right text-[10px] mt-0.5" style={{ color: "var(--cp-muted)" }}>{form.bio.length}/200</p>
          </div>

          <button type="submit" disabled={isLoading}
            className="w-full py-3 rounded-xl font-bold text-sm transition-all hover:opacity-90 active:scale-95 disabled:opacity-50"
            style={{ background: "var(--cp-primary)", color: "#fff" }}>
            {isLoading ? "Saving…" : "Save Changes"}
          </button>
        </form>

        {/* Account */}
        <div className="cp-card p-6 flex flex-col gap-3">
          <h2 className="text-sm font-bold uppercase tracking-widest mb-2" style={{ color: "var(--cp-muted)" }}>Account</h2>
          <div className="flex items-center justify-between py-3" style={{ borderBottom: "1px solid var(--cp-border)" }}>
            <div>
              <p className="text-sm font-semibold" style={{ color: "var(--cp-text)" }}>Email</p>
              <p className="text-xs" style={{ color: "var(--cp-muted)" }}>{user.email || "—"}</p>
            </div>
          </div>
          <div className="flex items-center justify-between py-3" style={{ borderBottom: "1px solid var(--cp-border)" }}>
            <div>
              <p className="text-sm font-semibold" style={{ color: "var(--cp-text)" }}>College</p>
              <p className="text-xs" style={{ color: "var(--cp-muted)" }}>{user.college?.name || "—"}</p>
            </div>
          </div>
          <button onClick={handleLogout}
            className="flex items-center gap-2 py-3 text-sm font-semibold transition-colors hover:opacity-80"
            style={{ color: "var(--cp-error)" }}>
            <span className="material-symbols-outlined text-lg">logout</span>
            Log Out
          </button>
        </div>
      </div>
    </MainLayout>
  );
}
