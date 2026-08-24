import { redirect } from 'next/navigation';

export default function RootForgotPasswordRedirect() {
  redirect('/en/forgot-password');
}
