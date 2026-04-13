import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/feed', '/categories/', '/posts/'],
        disallow: ['/admin/', '/activity', '/saved', '/settings', '/auth/', '/profile/'],
      },
    ],
  };
}
