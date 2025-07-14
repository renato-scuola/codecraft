import type { NextConfig } from "next";

// Funziona solo quando deployato su GitHub Pages, non in locale
const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  // Solo per GitHub Pages
  ...(process.env.GITHUB_ACTIONS && {
    basePath: '/codecraft',
    assetPrefix: '/codecraft/',
  }),
  distDir: 'out',
};

export default nextConfig;
