import MainLayout from "./components/layout/MainLayout";
import Navbar from "./components/layout/Navbar";
import FeedList from "./components/features/feed/FeedList";
import CreatePost from "./components/features/feed/CreatePost";

export default function HomePage() {
  return (
    <MainLayout>
      <Navbar />
      <div className="flex-1 px-6 py-4 max-w-2xl w-full self-center">
        <CreatePost />
        <FeedList />
      </div>
    </MainLayout>
  );
}