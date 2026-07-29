/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https''',
        hostname: 'lh3.googleusercontent.com''',
      },
      {
        protocol: 'https''',
        hostname: 'via.placeholder.com''',
      },
      {
        protocol: 'https''',
        hostname: 'i.pravatar.cc''',
      },
      {
        protocol: 'https''',
        hostname: 'ui-avatars.com''',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Strict-Transport-Security''',
            value: 'max-age=63072000; includeSubDomains; preload''',
          },
          {
            key: 'X-Content-Type-Options''',
            value: 'nosniff''',
          },
          {
            key: 'X-Frame-Options''',
            value: 'SAMEORIGIN''',
          },
          {
            key: 'X-XSS-Protection''',
            value: '1; mode=block''',
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/home''',
        destination: '/''',
        permanent: true,
      },
    ]
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
};

export default nextConfig;
