import MainLayout from "@/app/components/layout/MainLayout";
import Navbar from "@/app/components/layout/Navbar";
import FeedList from "@/app/components/features/feed/FeedList";

export const metadata = { 
  title: "Updates – College Paglu", 
  description: "Official announcements and updates from societies" 
};

export default function UpdatesPage() {
  return (
    <MainLayout>
      <Navbar />
      <div className="flex-1 w-full max-w-2xl mx-auto px-4 py-4">
        {/* Section header */}
        <div
          className="rounded-3xl p-5 mb-4 flex items-center gap-4"
          style={{ background: "linear-gradient(135deg, #0284c720, #0284c708)", border: "1px solid #0284c730" }}
        >
          <span className="text-4xl">📢</span>
          <div>
            <h1 className="text-xl font-extrabold" style={{ color: "var(--cp-text)" }}>Updates</h1>
            <p className="text-sm" style={{ color: "var(--cp-muted)" }}>Official announcements from campus societies</p>
          </div>
        </div>
        <FeedList isUpdates={true} />
      </div>
    </MainLayout>
  );
}
