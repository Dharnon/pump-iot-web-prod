import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true, // Enable Gzip/Brotli compression

  // Experimental optimizations (use with caution)
  experimental: {
    // optimizeCss: true, // Requires 'critters' package
    // turbo: { ... } // TurboPack options
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
