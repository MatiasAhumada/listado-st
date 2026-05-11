import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pub-8d04def1bf324247a6d4db7141f6af9e.r2.dev",
      },
    ],
  },
};

export default nextConfig;
