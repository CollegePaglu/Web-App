import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow images from backend R2 CDN and external sources
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "r2.sagarteotia.in" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "api.dicebear.com" },
      { protocol: "https", hostname: "cdn.collegepaglu.com" },
      { protocol: "http", hostname: "localhost" },
    ],
  },

  // Proxy /api/* calls to the Express backend during dev
  async rewrites() {
    return [
      {
        source: "/api/backend/:path*",
        destination: `${process.env.NODE_ENV === "production" ? (process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.collegepaglu.com/api/v1") : (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api/v1")}/:path*`,
      },
    ];
  },

  // Allow cross-origin requests from backend
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
