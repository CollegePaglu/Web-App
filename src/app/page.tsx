import { redirect } from 'next/navigation';

export default function RootPage() {
  // Server-side redirect — middleware handles auth check
  redirect('/home');
}
