
import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://eschool.com';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/',
        '/_next/',
        '/admin/',
        '/dashboard/',
        '/profile/',
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
