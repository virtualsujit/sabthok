import type { NextConfig } from "next";

const apiHostname = process.env.API_IMAGE_HOSTNAME || "localhost";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: apiHostname,
      },
      {
        protocol: "http",
        hostname: "localhost",
      },
      {
        protocol: "http",
        hostname: "backend",
        port: "8000",
      },
    ],
    unoptimized: true,
  },
};

export default nextConfig;
