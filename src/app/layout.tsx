import type { Metadata } from 'next';
import { AppProviders } from '@/providers';
import './globals.css';

export const metadata: Metadata = {
  title: 'CollegePaglu — Your Campus, Connected',
  description: 'Community, marketplace, and campus life — all in one place for college students.',
  keywords: ['college', 'campus', 'community', 'student', 'marketplace'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
