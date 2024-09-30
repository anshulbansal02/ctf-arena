// @ts-check

/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  reactStrictMode: false,
  experimental: {
    instrumentationHook: true,
    serverComponentsExternalPackages: [
      "@react-email/components",
      "@react-email/render",
    ],
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
