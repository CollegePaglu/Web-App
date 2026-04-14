// app/(main)/feed/page.tsx

import MainLayout from "./components/layout/MainLayout";
import Navbar from "./components/layout/Navbar";
import FeedList from "./components/features/feed/FeedList";

export default function Page() {
  return (
    <MainLayout>
      <Navbar />
      <FeedList />
    </MainLayout>
  );
}