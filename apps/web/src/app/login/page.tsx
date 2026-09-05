import { redirect } from 'next/navigation';

export default function RootLoginRedirectPage() {
  redirect('/en/login/admin');
}
