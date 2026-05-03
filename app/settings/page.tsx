"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import MainLayout from "@/app/components/layout/MainLayout";
import Navbar from "@/app/components/layout/Navbar";
import { useAuthStore } from "@/store/useAuthStore";
import { useTheme } from "@/app/context/ThemeContext";
import { usersApi } from "@/lib/api";
import toast from "react-hot-toast";

type Section = "profile" | "account" | "privacy" | "appearance";

const SECTIONS: { key: Section; label: string; icon: string }[] = [
  { key: "profile",    label: "Profile",    icon: "person" },
  { key: "account",   label: "Account",    icon: "manage_accounts" },
  { key: "appearance",label: "Appearance", icon: "palette" },
  { key: "privacy",   label: "Privacy",    icon: "lock" },
];

// ── Section: Profile ────────────────────────────────────────────────────────
function ProfileSection() {
  const { user, updateProfile, fetchMe, isLoading } = useAuthStore();
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    displayName: user?.displayName || user?.name || "",
    bio:         user?.bio || "",
  });
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile,    setAvatarFile]    = useState<File | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [saved, setSaved] = useState(false);

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
      await fetchMe();
      toast.success("Photo updated! 📸");
      setAvatarFile(null);
      setAvatarPreview(null);
    } catch {
      toast.error("Failed to upload photo");
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile({ displayName: form.displayName, bio: form.bio });
      if (avatarFile) await handleAvatarUpload();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      toast.success("Profile saved! ✅");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to save");
    }
  };

  const displayName = user?.displayName || user?.name || user?.username || "You";
  const currentAvatar = avatarPreview || user?.avatar;

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-6">
      {/* Avatar section */}
      <div className="flex items-center gap-5">
        <div className="relative">
          <div className="w-20 h-20 rounded-full overflow-hidden flex items-center justify-center text-2xl font-black"
            style={{ background: "var(--cp-primary-10)", color: "var(--cp-primary)", border: "3px solid var(--cp-primary)" }}>
            {currentAvatar
              ? <img src={currentAvatar} className="w-full h-full object-cover" alt="" />
              : displayName[0]?.toUpperCase()}
          </div>
          <button type="button" onClick={() => fileRef.current?.click()}
            className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center shadow-lg"
            style={{ background: "var(--cp-primary)", color: "var(--cp-primary-text)" }}>
            <span className="material-symbols-outlined text-sm">photo_camera</span>
          </button>
        </div>
        <div>
          <p className="text-sm font-bold mb-1" style={{ color: "var(--cp-text)" }}>{displayName}</p>
          <p className="text-xs mb-2" style={{ color: "var(--cp-muted)" }}>JPG, PNG, WebP · Max 5MB</p>
          {avatarFile && (
            <button type="button" onClick={handleAvatarUpload} disabled={avatarUploading}
              className="text-xs px-3 py-1.5 rounded-lg font-bold disabled:opacity-50"
              style={{ background: "var(--cp-primary)", color: "var(--cp-primary-text)" }}>
              {avatarUploading ? "Uploading…" : "Upload photo"}
            </button>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
      </div>

      <div className="h-px" style={{ background: "var(--cp-border)" }} />

      {/* Display name */}
      <div>
        <label className="text-xs font-bold uppercase tracking-widest mb-2 block" style={{ color: "var(--cp-muted)" }}>
          Display Name
        </label>
        <input value={form.displayName} onChange={(e) => handle("displayName", e.target.value)}
          placeholder="Your name"
          className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
          style={{ background: "var(--cp-surface-2)", border: "1px solid var(--cp-border)", color: "var(--cp-text)" }} />
      </div>

      {/* Bio */}
      <div>
        <label className="text-xs font-bold uppercase tracking-widest mb-2 block" style={{ color: "var(--cp-muted)" }}>
          Bio
        </label>
        <textarea value={form.bio} onChange={(e) => handle("bio", e.target.value)}
          placeholder="Tell your campus about yourself…"
          rows={3} maxLength={200}
          className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none"
          style={{ background: "var(--cp-surface-2)", border: "1px solid var(--cp-border)", color: "var(--cp-text)" }} />
        <p className="text-right text-[10px] mt-0.5" style={{ color: "var(--cp-muted)" }}>{form.bio.length}/200</p>
      </div>

      <button type="submit" disabled={isLoading}
        className="w-full py-3 rounded-xl font-bold text-sm transition-all hover:opacity-90 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
        style={{ background: saved ? "#10B981" : "var(--cp-primary)", color: "#fff" }}>
        {isLoading
          ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving…</>
          : saved
          ? <><span className="material-symbols-outlined text-base">check_circle</span>Saved!</>
          : "Save Changes"}
      </button>
    </form>
  );
}

// ── Section: Account ─────────────────────────────────────────────────────────
function AccountSection() {
  const { user, fetchMe } = useAuthStore();
  const router = useRouter();
  const [username, setUsername] = useState(user?.username || "");
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleSaveUsername = async () => {
    const clean = username.replace(/^@/, "").toLowerCase().trim();
    if (!clean || clean.length < 4) { toast.error("Username must be at least 4 characters"); return; }
    setSaving(true);
    try {
      await usersApi.setUsername(clean);
      await fetchMe();
      toast.success("Username updated! @" + clean);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Username unavailable");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Info row */}
      <div className="flex flex-col gap-4">
        <Row label="Phone" value={user?.phone || "—"} icon="phone" />
        <Row label="College" value={user?.college?.name || "—"} icon="school" />
        <Row label="Role" value={user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : "Student"} icon="badge" />
      </div>

      <div className="h-px" style={{ background: "var(--cp-border)" }} />

      {/* Username change */}
      <div>
        <label className="text-xs font-bold uppercase tracking-widest mb-2 block" style={{ color: "var(--cp-muted)" }}>
          Username
        </label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold" style={{ color: "var(--cp-muted)" }}>@</span>
            <input value={username} onChange={(e) => setUsername(e.target.value.replace(/^@/, ""))}
              placeholder="your_username"
              className="w-full pl-7 pr-4 py-3 rounded-xl text-sm outline-none"
              style={{ background: "var(--cp-surface-2)", border: "1px solid var(--cp-border)", color: "var(--cp-text)" }} />
          </div>
          <button onClick={handleSaveUsername} disabled={saving || !username}
            className="px-4 py-3 rounded-xl font-bold text-sm disabled:opacity-50"
            style={{ background: "var(--cp-primary)", color: "var(--cp-primary-text)" }}>
            {saving ? "…" : "Save"}
          </button>
        </div>
        <p className="text-xs mt-1" style={{ color: "var(--cp-muted)" }}>4–20 chars, lowercase letters, numbers and underscores</p>
      </div>

      <div className="h-px" style={{ background: "var(--cp-border)" }} />

      {/* Danger zone */}
      <div>
        <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "var(--cp-error, #EF4444)" }}>Danger Zone</p>
        {!confirmDelete ? (
          <button onClick={() => setConfirmDelete(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all hover:opacity-80"
            style={{ borderColor: "#EF4444", color: "#EF4444" }}>
            <span className="material-symbols-outlined text-base">delete_forever</span>
            Delete Account
          </button>
        ) : (
          <div className="p-4 rounded-2xl" style={{ background: "#EF444415", border: "1px solid #EF444440" }}>
            <p className="text-sm font-bold mb-3" style={{ color: "#EF4444" }}>
              Are you sure? This cannot be undone.
            </p>
            <div className="flex gap-2">
              <button onClick={() => setConfirmDelete(false)}
                className="flex-1 py-2.5 rounded-xl font-bold text-sm"
                style={{ background: "var(--cp-surface-2)", color: "var(--cp-text)" }}>
                Cancel
              </button>
              <button
                onClick={() => toast.error("Please contact support to delete your account")}
                className="flex-1 py-2.5 rounded-xl font-bold text-sm"
                style={{ background: "#EF4444", color: "#fff" }}>
                Delete
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Section: Appearance ───────────────────────────────────────────────────────
function AppearanceSection() {
  const { theme, toggleTheme } = useTheme();

  const themes = [
    { key: "light", label: "Light", icon: "light_mode", desc: "Clean and bright" },
    { key: "dark",  label: "Dark",  icon: "dark_mode",  desc: "Easy on the eyes" },
  ];

  return (
    <div className="flex flex-col gap-4">
      <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--cp-muted)" }}>Theme</p>
      <div className="grid grid-cols-2 gap-3">
        {themes.map((t) => {
          const isActive = theme === t.key;
          return (
            <button key={t.key} onClick={() => { if (!isActive) toggleTheme(); }}
              className="flex flex-col items-center gap-2 py-5 rounded-2xl font-bold text-sm transition-all hover:opacity-90"
              style={{
                background: isActive ? "var(--cp-primary-10)" : "var(--cp-surface-2)",
                border: `2px solid ${isActive ? "var(--cp-primary)" : "transparent"}`,
                color: isActive ? "var(--cp-primary)" : "var(--cp-muted)",
              }}>
              <span className="material-symbols-outlined text-2xl">{t.icon}</span>
              <span>{t.label}</span>
              <span className="text-[10px] opacity-70 font-normal">{t.desc}</span>
              {isActive && (
                <span className="w-5 h-5 rounded-full flex items-center justify-center"
                  style={{ background: "var(--cp-primary)", color: "var(--cp-primary-text)" }}>
                  <span className="material-symbols-outlined text-xs">check</span>
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Section: Privacy ──────────────────────────────────────────────────────────
function PrivacySection() {
  const [anonDefault, setAnonDefault] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      <ToggleRow
        label="Default Anonymous Posting"
        desc="Post anonymously by default on Confessions"
        value={anonDefault}
        onChange={setAnonDefault}
      />
      <div className="h-px" style={{ background: "var(--cp-border)" }} />
      <div className="p-4 rounded-2xl text-xs" style={{ background: "var(--cp-surface-2)", color: "var(--cp-muted)" }}>
        <p className="font-bold mb-1" style={{ color: "var(--cp-text)" }}>Your data & privacy</p>
        <p>College Paglu stores only the minimum data needed to provide the service. Anonymous posts never reveal your identity to other users.</p>
      </div>
    </div>
  );
}

// ── Reusable sub-components ───────────────────────────────────────────────────
function Row({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-3">
        <span className="material-symbols-outlined text-lg" style={{ color: "var(--cp-muted)" }}>{icon}</span>
        <div>
          <p className="text-xs" style={{ color: "var(--cp-muted)" }}>{label}</p>
          <p className="text-sm font-semibold" style={{ color: "var(--cp-text)" }}>{value}</p>
        </div>
      </div>
    </div>
  );
}

function ToggleRow({ label, desc, value, onChange }: {
  label: string; desc: string; value: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-1">
      <div>
        <p className="text-sm font-semibold" style={{ color: "var(--cp-text)" }}>{label}</p>
        <p className="text-xs mt-0.5" style={{ color: "var(--cp-muted)" }}>{desc}</p>
      </div>
      <button
        onClick={() => onChange(!value)}
        className="relative w-11 h-6 rounded-full transition-all flex-shrink-0"
        style={{ background: value ? "var(--cp-primary)" : "var(--cp-border)" }}>
        <span
          className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full transition-all"
          style={{ background: "#fff", transform: value ? "translateX(20px)" : "translateX(0)" }} />
      </button>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function SettingsPage() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [activeSection, setActiveSection] = useState<Section>("profile");

  useEffect(() => {
    if (!user) router.push("/login");
  }, [user]);

  if (!user) return null;

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out 👋");
    router.push("/login");
  };

  const sectionComponents: Record<Section, React.ReactNode> = {
    profile:    <ProfileSection />,
    account:    <AccountSection />,
    appearance: <AppearanceSection />,
    privacy:    <PrivacySection />,
  };

  return (
    <MainLayout>
      <Navbar />
      <div className="flex-1 w-full max-w-2xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-extrabold mb-6" style={{ color: "var(--cp-text)" }}>Settings</h1>

        {/* Section tabs */}
        <div className="flex gap-1 mb-6 p-1 rounded-2xl overflow-x-auto"
          style={{ background: "var(--cp-surface)", border: "1px solid var(--cp-border)" }}>
          {SECTIONS.map(({ key, label, icon }) => (
            <button key={key} onClick={() => setActiveSection(key)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex-1 justify-center"
              style={{
                background: activeSection === key ? "var(--cp-primary)" : "transparent",
                color: activeSection === key ? "#fff" : "var(--cp-muted)",
              }}>
              <span className="material-symbols-outlined text-base">{icon}</span>
              {label}
            </button>
          ))}
        </div>

        {/* Active section content */}
        <div className="rounded-3xl p-6 mb-4"
          style={{ background: "var(--cp-surface)", border: "1px solid var(--cp-border)" }}>
          {sectionComponents[activeSection]}
        </div>

        {/* Logout — always visible */}
        <button onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-sm transition-all hover:opacity-80"
          style={{ background: "#EF444415", color: "#EF4444", border: "1px solid #EF444430" }}>
          <span className="material-symbols-outlined text-lg">logout</span>
          Log Out
        </button>
      </div>
    </MainLayout>
  );
}
