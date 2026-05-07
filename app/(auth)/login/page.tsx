"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { useTheme } from "@/app/context/ThemeContext";
import toast from "react-hot-toast";
import { Sun, Moon, ArrowLeft } from "lucide-react";

/** Normalise to +91XXXXXXXXXX */
function normalisePhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("91") && digits.length === 12) return "+" + digits;
  if (digits.length === 10) return "+91" + digits;
  return "+" + digits;
}

export default function LoginPage() {
  const router = useRouter();
  const { sendOtp, verifyOtp, isLoading } = useAuthStore();
  const { theme, toggleTheme } = useTheme();

  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");

  const isPhoneValid = phone.replace(/\D/g, "").length === 10;

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPhoneValid) { toast.error("Enter a valid 10-digit mobile number"); return; }
    try {
      await sendOtp(normalisePhone(phone));
      toast.success("OTP sent to your WhatsApp 📲");
      setStep("otp");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to send OTP");
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) { toast.error("Enter the 6-digit OTP"); return; }
    try {
      const { needsProfile } = await verifyOtp(normalisePhone(phone), otp);
      toast.success("Welcome to College Paglu! 🎉");
      router.push(needsProfile ? "/complete-profile" : "/");
    } catch (err: any) {
      console.error("OTP verification error:", err);
      toast.error(err?.response?.data?.message || err.message || "Invalid OTP. Try again");
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: "var(--cp-bg)" }}>
      {/* ── Left decorative panel (hidden on mobile) ── */}
      <div
        className="hidden lg:flex flex-col justify-between w-1/2 p-12 relative overflow-hidden"
        style={{ background: "linear-gradient(145deg, #262626, #000000)" }}
      >
        {/* Background blobs */}
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-20 -translate-y-1/2 translate-x-1/2" style={{ background: "#fff" }} />
        <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full opacity-10 translate-y-1/2 -translate-x-1/2" style={{ background: "#fff" }} />

        {/* Brand */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white text-lg font-black">CP</div>
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
            <p className="text-white/80 text-sm font-semibold">12,000+ students already vibing</p>
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
          {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        <div className="w-full max-w-sm">
          {/* Mobile brand */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black" style={{ background: "var(--cp-primary)", color: "var(--cp-primary-text)" }}>CP</div>
            <span className="font-extrabold text-lg" style={{ color: "var(--cp-text)" }}>College Paglu</span>
          </div>

          <h1 className="text-2xl font-extrabold mb-1" style={{ color: "var(--cp-text)" }}>
            {step === "phone" ? "Welcome back 👋" : "Check your WhatsApp 📲"}
          </h1>
          <p className="text-sm mb-8" style={{ color: "var(--cp-muted)" }}>
            {step === "phone"
              ? "Enter your WhatsApp number to login or sign up"
              : `OTP sent to +91 ${phone}`}
          </p>

          {step === "phone" ? (
            <form onSubmit={handleSendOtp} className="flex flex-col gap-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest mb-2 block" style={{ color: "var(--cp-muted)" }}>
                  WhatsApp Number
                </label>
                {/* Phone input with +91 prefix pill */}
                <div
                  className="flex items-center rounded-xl overflow-hidden"
                  style={{ border: "1px solid var(--cp-border)", background: "var(--cp-surface-2)" }}
                >
                  <div
                    className="px-3 py-3 text-sm font-bold shrink-0 flex items-center gap-1.5"
                    style={{ background: "var(--cp-primary-10)", color: "var(--cp-primary)", borderRight: "1px solid var(--cp-border)" }}
                  >
                    🇮🇳 +91
                  </div>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    placeholder="9876543210"
                    className="flex-1 px-4 py-3 text-sm font-bold outline-none bg-transparent"
                    style={{ color: "var(--cp-text)" }}
                    autoFocus
                    inputMode="numeric"
                    maxLength={10}
                  />
                </div>
                <p className="text-[10px] mt-1.5" style={{ color: "var(--cp-muted)" }}>
                  You'll receive a 6-digit OTP on WhatsApp
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading || !isPhoneValid}
                className="w-full py-3.5 rounded-xl font-bold text-sm transition-all hover:opacity-90 active:scale-95 disabled:opacity-50 mt-1"
                style={{ background: "var(--cp-primary)", color: "var(--cp-primary-text)" }}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Sending…
                  </span>
                ) : (
                  "Send OTP on WhatsApp →"
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
                onClick={() => { setStep("phone"); setOtp(""); }}
                className="flex items-center gap-1.5 text-xs mb-1 transition-colors"
                style={{ color: "var(--cp-muted)" }}
              >
                <ArrowLeft size={14} />
                Change number
              </button>

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest mb-2 block" style={{ color: "var(--cp-muted)" }}>
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
                style={{ background: "var(--cp-primary)", color: "var(--cp-primary-text)" }}
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
