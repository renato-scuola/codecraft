import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === 'production';
const isGitHubPages = process.env.GITHUB_ACTIONS === 'true';

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  skipTrailingSlashRedirect: true,
  images: {
    unoptimized: true
  },
  assetPrefix: isProd || isGitHubPages ? '/codecraft' : '',
  basePath: isProd || isGitHubPages ? '/codecraft' : '',
  distDir: 'out',
  experimental: {
    optimizePackageImports: ['lucide-react']
  }
};

export default nextConfig;
