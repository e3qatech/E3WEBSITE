import { redirect } from 'next/navigation';

export default function ClientLoginRedirectPage() {
  redirect('/en/login/business');
}
