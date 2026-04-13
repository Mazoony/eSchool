/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
      {
        protocol: 'https',
        hostname: 'i.pravatar.cc',
      },
    ],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        fs: false,
        v8: false,
      };
    }
    return config;
  },
  allowedDevOrigins: [
    '9000-firebase-eschool-1759955938236.cluster-64pjnskmlbaxowh5lzq6i7v4ra.cloudworkstations.dev',
  ],
};

export default nextConfig;
