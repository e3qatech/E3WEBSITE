import React from 'react';
import Link from 'next/link';
import { FileQuestion, Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-zinc-950 p-6 text-center text-white">
      <div className="mb-6 rounded-full bg-emerald-500/10 p-6 border border-emerald-500/20">
        <FileQuestion className="h-12 w-12 text-emerald-400" />
      </div>
      <h1 className="mb-2 font-mono text-4xl font-black tracking-tight text-white md:text-6xl">
        404 — PAGE NOT FOUND
      </h1>
      <p className="mb-8 max-w-md text-zinc-400 text-base md:text-lg">
        The route or resource you requested does not exist or has been relocated within E3 Qatar.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <Link
          href="/en"
          className="flex items-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 font-mono text-sm font-bold text-zinc-950 transition-all hover:bg-emerald-400"
        >
          <Home className="h-4 w-4" />
          RETURN HOME
        </Link>
        <Link
          href="/en/contact"
          className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900 px-6 py-3 font-mono text-sm font-bold text-zinc-300 transition-all hover:bg-zinc-800"
        >
          <ArrowLeft className="h-4 w-4" />
          CONTACT SUPPORT
        </Link>
      </div>
    </div>
  );
}
