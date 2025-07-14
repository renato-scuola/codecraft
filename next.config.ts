import type { NextConfig } from "next";

// COMPLETE RESET - NO basePath for GitHub Pages
const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  distDir: 'out',
};

export default nextConfig;
