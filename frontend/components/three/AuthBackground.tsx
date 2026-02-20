'use client';

import dynamic from 'next/dynamic';

export const AuthBackground = dynamic(
  () => import('./AuthBackgroundCanvas').then((mod) => mod.AuthBackgroundCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-800 dark:from-slate-900 dark:via-indigo-950 dark:to-slate-800" />
    ),
  }
);
