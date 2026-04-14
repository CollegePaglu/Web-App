"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import toast from "react-hot-toast";
import { useTheme } from "@/app/context/ThemeContext";

export default function LoginPage() {
  const router = useRouter();
  const { sendOtp, verifyOtp, isLoading } = useAuthStore();
  const { theme } = useTheme();
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.length < 10) {
      toast.error("Enter a valid phone number");
      return;
    }
    try {
      await sendOtp(phone);
      toast.success("OTP sent!");
      setStep("otp");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to send OTP");
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      toast.error("Enter the 6-digit OTP");
      return;
    }
    try {
      const { needsProfile } = await verifyOtp(phone, otp);
      toast.success("Logged in!");
      if (needsProfile) {
        router.push("/complete-profile");
      } else {
        router.push("/");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Invalid OTP");
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: "var(--cp-bg)" }}
    >
      <div
        className="w-full max-w-md p-8 rounded-3xl shadow-2xl"
        style={{ background: "var(--cp-surface)", border: "1px solid var(--cp-border)" }}
      >
        {/* Logo & Headline */}
        <div className="text-center mb-8">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl font-black"
            style={{ background: "var(--cp-primary)", color: "#fff" }}
          >
            CP
          </div>
          <h1 className="text-2xl font-extrabold" style={{ color: "var(--cp-text)" }}>
            College Paglu
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--cp-muted)" }}>
            Your campus, your vibe 🎓
          </p>
        </div>

        {step === "phone" ? (
          <form onSubmit={handleSendOtp} className="flex flex-col gap-4">
            <div>
              <label
                className="text-xs font-bold uppercase tracking-widest mb-2 block"
                style={{ color: "var(--cp-muted)" }}
              >
                Phone Number
              </label>
              <div className="flex gap-2">
                <span
                  className="flex items-center px-4 rounded-xl text-sm font-bold"
                  style={{
                    background: "var(--cp-surface-2)",
                    border: "1px solid var(--cp-border)",
                    color: "var(--cp-text)",
                  }}
                >
                  +91
                </span>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  placeholder="10-digit number"
                  className="flex-1 px-4 py-3 rounded-xl text-sm outline-none transition-all"
                  style={{
                    background: "var(--cp-surface-2)",
                    border: "1px solid var(--cp-border)",
                    color: "var(--cp-text)",
                  }}
                  autoFocus
                  inputMode="numeric"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={isLoading || phone.length < 10}
              className="w-full py-3 rounded-xl font-bold text-sm transition-all hover:opacity-90 active:scale-95 disabled:opacity-50"
              style={{ background: "var(--cp-primary)", color: "#fff" }}
            >
              {isLoading ? "Sending…" : "Send OTP →"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
            <button
              type="button"
              onClick={() => setStep("phone")}
              className="flex items-center gap-2 text-xs mb-2 transition-colors"
              style={{ color: "var(--cp-muted)" }}
            >
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              Change number
            </button>
            <p className="text-xs" style={{ color: "var(--cp-muted)" }}>
              OTP sent to +91 {phone}
            </p>
            <div>
              <label
                className="text-xs font-bold uppercase tracking-widest mb-2 block"
                style={{ color: "var(--cp-muted)" }}
              >
                Enter OTP
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="6-digit OTP"
                className="w-full px-4 py-3 rounded-xl text-sm outline-none tracking-[0.5em] text-center font-bold"
                style={{
                  background: "var(--cp-surface-2)",
                  border: "1px solid var(--cp-border)",
                  color: "var(--cp-text)",
                  fontSize: "1.25rem",
                }}
                autoFocus
                inputMode="numeric"
                maxLength={6}
              />
            </div>
            <button
              type="submit"
              disabled={isLoading || otp.length !== 6}
              className="w-full py-3 rounded-xl font-bold text-sm transition-all hover:opacity-90 active:scale-95 disabled:opacity-50"
              style={{ background: "var(--cp-primary)", color: "#fff" }}
            >
              {isLoading ? "Verifying…" : "Verify & Login ✓"}
            </button>
            <button
              type="button"
              onClick={handleSendOtp}
              disabled={isLoading}
              className="text-xs underline text-center"
              style={{ color: "var(--cp-muted)" }}
            >
              Resend OTP
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-[10px]" style={{ color: "var(--cp-muted)" }}>
          By continuing you agree to our Terms & Privacy Policy
        </p>
      </div>
    </div>
  );
}
