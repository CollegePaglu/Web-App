import MainLayout from "./components/layout/MainLayout";
import Navbar from "./components/layout/Navbar";
import FeedList from "./components/features/feed/FeedList";
import CreatePost from "./components/features/feed/CreatePost";

export default function HomePage() {
  return (
    <MainLayout>
      <Navbar />
      {/* Feed column — max-width centered, full scrollable area */}
      <div className="flex-1 w-full max-w-2xl mx-auto px-4 py-4">
        <CreatePost />
        <FeedList />
      </div>
    </MainLayout>
  );
}