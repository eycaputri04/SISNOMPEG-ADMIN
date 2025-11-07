import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "vvshybdfvyuvkdcjmeka.supabase.co",
      },
    ],
  },
};

export default nextConfig;
