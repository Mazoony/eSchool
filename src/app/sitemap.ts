
import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://eschool.com'; 

  // Public pages
  const publicPages = [
    '/',
    '/about',
    '/contact',
    '/privacy',
    '/login',
    '/register',
  ];

  const sitemap = publicPages.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as 'weekly',
    priority: route === '/' ? 1 : 0.8,
  }));

  return sitemap;
}
