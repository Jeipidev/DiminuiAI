import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    eslint: {
      ignoreDuringBuilds: true,
    },
    future: { webpack5: true, }
  
};

export default nextConfig;
