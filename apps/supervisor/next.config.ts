import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  poweredByHeader: false,
  output: "standalone",
  compress: true, // Enable Gzip/Brotli compression
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },

  // Ensure mono-repo dependencies are traced correctly
  outputFileTracingRoot: path.join(__dirname, "../../"),
  
  experimental: {
  },

  async rewrites() {
    return [
      {
        source: '/operator',
        destination: 'http://127.0.0.1:8080/operator/', // Proxy to Vite (Explicit IPv4)
      },
      {
        source: '/operator/:path+',
        destination: 'http://127.0.0.1:8080/operator/:path+', // Proxy to Vite subpaths
      },
    ];
  },
};

export default nextConfig;
