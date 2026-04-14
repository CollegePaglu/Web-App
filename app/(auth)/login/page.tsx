"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { useTheme } from "@/app/context/ThemeContext";
import toast from "react-hot-toast";

export default function LoginPage() {
  const router = useRouter();
  const { sendOtp, verifyOtp, isLoading } = useAuthStore();
  const { theme, toggleTheme } = useTheme();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"email" | "otp">("email");

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@")) { toast.error("Enter a valid email address"); return; }
    try {
      await sendOtp(email);
      toast.success("OTP sent to " + email);
      setStep("otp");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to send OTP");
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) { toast.error("Enter the 6-digit OTP"); return; }
    try {
      const { needsProfile } = await verifyOtp(email, otp);
      toast.success("Welcome to College Paglu! 🎉");
      router.push(needsProfile ? "/complete-profile" : "/");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Invalid OTP. Try again");
    }
  };

  return (
    <div
      className="min-h-screen flex"
      style={{ background: "var(--cp-bg)" }}
    >
      {/* ── Left decorative panel (hidden on mobile) ── */}
      <div
        className="hidden lg:flex flex-col justify-between w-1/2 p-12 relative overflow-hidden"
        style={{ background: "linear-gradient(145deg, var(--cp-primary), #1a6b63)" }}
      >
        {/* Background blobs */}
        <div
          className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-20 -translate-y-1/2 translate-x-1/2"
          style={{ background: "#fff" }}
        />
        <div
          className="absolute bottom-0 left-0 w-72 h-72 rounded-full opacity-10 translate-y-1/2 -translate-x-1/2"
          style={{ background: "#fff" }}
        />

        {/* Brand */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white text-lg font-black">
              CP
            </div>
            <span className="text-white font-extrabold text-xl">College Paglu</span>
          </div>
        </div>

        {/* Hero copy */}
        <div className="relative z-10">
          <h2 className="text-4xl font-black text-white leading-tight mb-4">
            Your campus,<br />your vibe. 🎓
          </h2>
          <p className="text-white/80 text-base leading-relaxed mb-8">
            Memes, confessions, society updates, and real campus conversations — all in one place.
          </p>

          {/* Social proof */}
          <div className="flex items-center gap-4">
            <div className="flex -space-x-2">
              {["aryan", "priya", "rahul", "nisha", "dev"].map((seed) => (
                <img
                  key={seed}
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`}
                  className="w-8 h-8 rounded-full border-2 border-white"
                  alt=""
                />
              ))}
            </div>
            <p className="text-white/80 text-sm font-semibold">
              12,000+ students already vibing
            </p>
          </div>
        </div>

        {/* Feature pills */}
        <div className="relative z-10 flex flex-wrap gap-2">
          {["🎭 Anonymous Confessions", "😂 Campus Memes", "📢 Society Updates", "🏆 Leaderboard"].map((tag) => (
            <span
              key={tag}
              className="px-3 py-1.5 rounded-full text-xs font-bold"
              style={{ background: "rgba(255,255,255,0.15)", color: "#fff" }}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* ── Right login panel ── */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 relative">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="absolute top-6 right-6 p-2 rounded-xl transition-all hover:opacity-80"
          style={{ color: "var(--cp-muted)", background: "var(--cp-surface)" }}
        >
          <span className="material-symbols-outlined text-xl">
            {theme === "dark" ? "light_mode" : "dark_mode"}
          </span>
        </button>

        <div className="w-full max-w-sm">
          {/* Mobile brand */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black"
              style={{ background: "var(--cp-primary)", color: "#fff" }}
            >
              CP
            </div>
            <span className="font-extrabold text-lg" style={{ color: "var(--cp-text)" }}>
              College Paglu
            </span>
          </div>

          <h1 className="text-2xl font-extrabold mb-1" style={{ color: "var(--cp-text)" }}>
            {step === "email" ? "Welcome back 👋" : "Check your inbox 📧"}
          </h1>
          <p className="text-sm mb-8" style={{ color: "var(--cp-muted)" }}>
            {step === "email"
              ? "Login or sign up with your college email"
              : `OTP sent to ${email}`}
          </p>

          {step === "email" ? (
            <form onSubmit={handleSendOtp} className="flex flex-col gap-4">
              <div>
                <label
                  className="text-[10px] font-black uppercase tracking-widest mb-2 block"
                  style={{ color: "var(--cp-muted)" }}
                >
                  Email Address
                </label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value.toLowerCase().trim())}
                    placeholder="student@college.edu"
                    className="flex-1 px-4 py-3 rounded-xl text-sm outline-none font-bold transition-all"
                    style={{
                      background: "var(--cp-surface-2)",
                      border: "1px solid var(--cp-border)",
                      color: "var(--cp-text)",
                    }}
                    autoFocus
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || !email.includes("@")}
                className="w-full py-3.5 rounded-xl font-bold text-sm transition-all hover:opacity-90 active:scale-95 disabled:opacity-50 mt-1"
                style={{ background: "var(--cp-primary)", color: "#fff" }}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Sending…
                  </span>
                ) : (
                  "Send OTP →"
                )}
              </button>

              <p className="text-center text-[10px]" style={{ color: "var(--cp-muted)" }}>
                New here? Same link — we'll create your account automatically.
              </p>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
              <button
                type="button"
                onClick={() => { setStep("email"); setOtp(""); }}
                className="flex items-center gap-1.5 text-xs mb-1 transition-colors"
                style={{ color: "var(--cp-muted)" }}
              >
                <span className="material-symbols-outlined text-sm">arrow_back</span>
                Change email
              </button>

              <div>
                <label
                  className="text-[10px] font-black uppercase tracking-widest mb-2 block"
                  style={{ color: "var(--cp-muted)" }}
                >
                  6-Digit OTP
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="• • • • • •"
                  className="w-full px-4 py-4 rounded-xl text-center font-black outline-none transition-all"
                  style={{
                    background: "var(--cp-surface-2)",
                    border: `2px solid ${otp.length === 6 ? "var(--cp-primary)" : "var(--cp-border)"}`,
                    color: "var(--cp-text)",
                    fontSize: "1.5rem",
                    letterSpacing: "0.5em",
                  }}
                  autoFocus
                  inputMode="numeric"
                  maxLength={6}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || otp.length !== 6}
                className="w-full py-3.5 rounded-xl font-bold text-sm transition-all hover:opacity-90 active:scale-95 disabled:opacity-50"
                style={{ background: "var(--cp-primary)", color: "#fff" }}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Verifying…
                  </span>
                ) : (
                  "Verify & Login ✓"
                )}
              </button>

              <button
                type="button"
                onClick={handleSendOtp}
                disabled={isLoading}
                className="text-xs text-center transition-colors hover:opacity-80"
                style={{ color: "var(--cp-primary)" }}
              >
                Didn't get it? Resend OTP
              </button>
            </form>
          )}

          <p className="mt-8 text-center text-[10px]" style={{ color: "var(--cp-muted)" }}>
            By continuing you agree to our Terms &amp; Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
}
