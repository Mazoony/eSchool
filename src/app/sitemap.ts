
import { MetadataRoute } from 'next';
import fs from 'fs';
import path from 'path';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://eschool.com';
  const pagesDir = path.resolve(process.cwd(), 'src/app');

  const getSitemapEntries = (dir: string, isAppDir = false): MetadataRoute.Sitemap => {
    const entries: MetadataRoute.Sitemap = [];
    const files = fs.readdirSync(dir);

    for (const file of files) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        if (file.startsWith('(') && file.endsWith(')')) {
          entries.push(...getSitemapEntries(fullPath, isAppDir));
        } else {
          const pagePath = path.join(fullPath, 'page.tsx');
          if (fs.existsSync(pagePath)) {
            let route = fullPath.replace(pagesDir, '').replace(/\\/g, '/');
            if (route === '/home') route = '/';
            if (route.endsWith('/')) route = route.slice(0, -1);

            entries.push({
              url: `${baseUrl}${route || '/'}`,
              lastModified: new Date(fs.statSync(pagePath).mtime),
              changeFrequency: route === '/social' ? 'daily' : 'weekly',
              priority: route === '/' ? 1 : 0.8,
            });
          }
        }
      } else if (file === 'page.tsx' && !isAppDir) {
        let route = dir.replace(pagesDir, '').replace(/\\/g, '/');
        if (route === '/home') route = '/';
        if (route.endsWith('/')) route = route.slice(0, -1);

        entries.push({
          url: `${baseUrl}${route || '/'}`,
          lastModified: new Date(stat.mtime),
          changeFrequency: route === '/social' ? 'daily' : 'weekly',
          priority: route === '/' ? 1 : 0.8,
        });
      }
    }

    return entries;
  };

  return getSitemapEntries(pagesDir, true);
}
