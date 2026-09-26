import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Lets phones and tablets on the local network load the dev server
  // (npm run dev listens on all interfaces). Without this, Next blocks
  // its dev-only assets for any origin other than localhost.
  allowedDevOrigins: ["192.168.*.*", "10.*.*.*", "172.*.*.*"],
};

export default nextConfig;
