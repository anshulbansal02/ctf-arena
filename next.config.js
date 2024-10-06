// @ts-check

/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  output: "standalone",
  eslint: {
    ignoreDuringBuilds: true,
  },
  reactStrictMode: false,
  experimental: {
    instrumentationHook: true,
  },
  images: {
    dangerouslyAllowSVG: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api.dicebear.com",
        pathname: "**",
      },
    ],
  },
};

export default nextConfig;
