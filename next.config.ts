import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Another lockfile exists further up the user's home directory; pin the root
  // so tracing does not walk out of the project.
  outputFileTracingRoot: import.meta.dirname,
  images: {
    // Editorial SVG placeholders are served locally today. When real
    // photography arrives via the CMS, add its host here.
    remotePatterns: [],
  },
  experimental: {
    optimizePackageImports: [],
  },
};

export default nextConfig;
