'use client';

interface LogoProps {
  className?: string;
  size?: number;
}

export function Logo({ className = '', size = 32 }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#2563EB', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#7C3AED', stopOpacity: 1 }} />
        </linearGradient>
      </defs>
      {/* Outer circle */}
      <circle cx="50" cy="50" r="45" fill="none" stroke="url(#logoGradient)" strokeWidth="3" />
      {/* Brain/wellness icon */}
      <path
        d="M50 20 C40 20 32 28 32 38 C32 44 35 49 38 52 C35 55 33 60 33 65 C33 72 38 78 45 78 H55 C62 78 67 72 67 65 C67 60 65 55 62 52 C65 49 68 44 68 38 C68 28 60 20 50 20 Z"
        fill="none"
        stroke="url(#logoGradient)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* Checkmark */}
      <path
        d="M40 50 L46 56 L60 42"
        fill="none"
        stroke="#10B981"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Pulse line - left */}
      <path
        d="M20 50 L28 50 L32 45 L36 55 L40 50 L48 50"
        fill="none"
        stroke="url(#logoGradient)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.6"
      />
      {/* Pulse line - right */}
      <path
        d="M52 50 L60 50 L64 45 L68 55 L72 50 L80 50"
        fill="none"
        stroke="url(#logoGradient)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.6"
      />
    </svg>
  );
}
