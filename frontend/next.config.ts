import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable Turbopack to avoid Windows symlink issues
  // Use webpack instead for compatibility
};

export default nextConfig;
