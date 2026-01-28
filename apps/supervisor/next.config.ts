import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
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
