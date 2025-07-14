import type { NextConfig } from "next";

// GitHub Pages configuration - force fresh deployment
const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  // Always use basePath for GitHub Pages
  basePath: '/codecraft',
  assetPrefix: '/codecraft/',
  distDir: 'out',
};

export default nextConfig;
