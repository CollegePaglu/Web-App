import MainLayout from "@/app/components/layout/MainLayout";

export default function MainGroupLayout({ children }: { children: React.ReactNode }) {
  return <MainLayout>{children}</MainLayout>;
}