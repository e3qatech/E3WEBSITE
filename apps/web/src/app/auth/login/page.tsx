import { redirect } from 'next/navigation';

export default function AuthLoginRedirectPage() {
  redirect('/en/login/admin');
}
