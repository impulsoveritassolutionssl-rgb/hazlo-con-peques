import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "placeholders.io",
      },
      {
        protocol: "https",
        hostname: "i.postimg.cc",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ]
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
          { key: "Pragma", value: "no-cache" },
          { key: "Expires", value: "0" },
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors 'self' https://web.totalum.app https://totalum-frontend-test.web.app http://localhost:8100; frame-src 'self' https://claude.ai https://*.claude.ai https://studio--studio-7562023643-58b09.us-central1.hosted.app blob: data:; child-src 'self' https://claude.ai https://*.claude.ai blob:",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
