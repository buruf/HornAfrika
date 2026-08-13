import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Another lockfile exists further up the user's home directory; pin the root
  // so tracing does not walk out of the project.
  outputFileTracingRoot: import.meta.dirname,
  images: {
    // Freely licensed photography from Wikimedia Commons. Publisher-owned
    // images are deliberately absent: the wire links out to the publisher
    // rather than reproducing their pictures.
    remotePatterns: [
      { protocol: "https", hostname: "upload.wikimedia.org" },
    ],
  },
  experimental: {
    optimizePackageImports: [],
  },
};

export default nextConfig;
