import { redirect } from 'next/navigation';

export default function RootResetPasswordRedirect() {
  redirect('/en/reset-password');
}
