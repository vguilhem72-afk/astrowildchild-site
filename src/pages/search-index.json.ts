import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export const GET: APIRoute = async () => {
  const posts = await getCollection('posts', ({ data }) => !data.draft);
  const index = posts
    .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf())
    .map((p) => ({
      slug: p.slug,
      title: p.data.title,
      date: p.data.date.toISOString(),
      excerpt: p.data.excerpt || '',
      categories: p.data.categories || [],
      tags: p.data.tags || [],
      image: p.data.featured_image || null,
      body: p.body
        .replace(/<[^>]+>/g, ' ')
        .replace(/[#*_`>[\]()]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 1200),
    }));
  return new Response(JSON.stringify(index), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=300, s-maxage=3600',
    },
  });
};
