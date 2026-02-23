import type { NextConfig } from "next";

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
