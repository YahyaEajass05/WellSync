/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        // Allow common image CDNs and storage providers
        // Add your specific production image hostname here
        protocol: 'https',
        hostname: '**.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: '**.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
  },
  reactStrictMode: true,
  typescript: {
    // TypeScript errors are reported during development via IDE and `tsc --noEmit`
    // Build continues to allow incremental deployment; remove this once all type
    // errors are resolved in a future sprint.
    ignoreBuildErrors: false,
  },
  experimental: {
    optimizePackageImports: ['lucide-react', 'recharts'],
  },
  // Transpile Three.js and React Three Fiber packages
  transpilePackages: ['three', '@react-three/fiber', '@react-three/drei', '@react-three/postprocessing'],
  // Remove console.log in production; keep error and warn for monitoring
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
  // Cache-Control headers:
  // - API/page routes: no-cache (dynamic content)
  // - Static assets: served by Next.js with long-lived cache automatically
  async headers() {
    return [
      {
        // Apply no-cache only to HTML pages and API routes, NOT static assets
        source: '/((?!_next/static|_next/image|favicon.ico|logo).*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
        ],
      },
    ];
  },
}

module.exports = nextConfig
