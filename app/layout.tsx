import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/app/context/ThemeContext";
import { Poppins } from "next/font/google";
import { Toaster } from "react-hot-toast";
import AuthBootstrap from "@/app/components/AuthBootstrap";

export const metadata: Metadata = {
  title: "College Paglu — Campus Community",
  description: "Your campus, your vibe. Memes, confessions, societies & more.",
  keywords: ["college", "campus", "community", "students", "memes", "confessions"],
  openGraph: {
    title: "College Paglu",
    description: "Your campus, your vibe.",
    type: "website",
  },
};

const font = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Anti-flash: apply saved theme before first paint (defaults to dark like AppV1) */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var t=localStorage.getItem('cp-theme')||'dark';if(t==='dark')document.documentElement.classList.add('dark');})();`,
          }}
        />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </head>
      <body className={font.className}>
        <ThemeProvider>
          <AuthBootstrap />
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: "#1E1E1E",
                color: "#FFFFFF",
                borderRadius: "12px",
                border: "1px solid #262626",
                fontSize: "13px",
                fontWeight: 600,
              },
              success: {
                iconTheme: { primary: "#FFFFFF", secondary: "#000000" },
              },
              error: {
                iconTheme: { primary: "#F87171", secondary: "#000000" },
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}