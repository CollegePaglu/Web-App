import MainLayout from "./components/layout/MainLayout";
import Navbar from "./components/layout/Navbar";
import FeedList from "./components/features/feed/FeedList";

export default function HomePage() {
  return (
    <MainLayout>
      <Navbar />
      <div className="flex-1 w-full max-w-2xl mx-auto px-4 py-4">
        <FeedList />
      </div>
    </MainLayout>
  );
}