import { ThemeProvider } from "@/app/context/ThemeContext";
import { Toaster } from "react-hot-toast";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: { borderRadius: "12px", fontSize: "13px", fontWeight: 600 },
        }}
      />
    </>
  );
}
