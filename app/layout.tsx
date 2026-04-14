import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/app/context/ThemeContext";
import { Plus_Jakarta_Sans } from "next/font/google";
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

const font = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
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
                borderRadius: "12px",
                fontSize: "13px",
                fontWeight: 600,
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}