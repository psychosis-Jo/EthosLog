import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "react/jsx-runtime.js": "react/jsx-runtime",
      "react/jsx-dev-runtime.js": "react/jsx-dev-runtime",
    };
    return config;
  },
  // 添加这个配置来处理上传的图片
  images: {
    domains: ['localhost', process.env.NEXT_PUBLIC_SUPABASE_URL?.replace('https://', '')].filter(Boolean) as string[],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'dstzyldxgvxtgvafmadl.supabase.co',
        port: '',
        pathname: '/storage/v1/object/sign/**',
      },
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,  // 在构建时忽略 ESLint 错误
  },
  typescript: {
    ignoreBuildErrors: true,   // 在构建时忽略 TypeScript 错误
  },
  env: {
    DASHSCOPE_API_KEY: process.env.DASHSCOPE_API_KEY,
  },
};

export default nextConfig; 