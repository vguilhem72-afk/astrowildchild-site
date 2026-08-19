import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const posts = (await getCollection('posts', ({ data }) => !data.draft))
    .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());

  return rss({
    title: 'Astro Wild Child',
    description: 'Astrology, natal readings, and cosmic guidance by Mare Punzalan.',
    site: context.site!,
    items: posts.map((p) => ({
      title: p.data.title,
      pubDate: p.data.date,
      description: p.data.excerpt ?? '',
      link: `/blog/${p.slug}/`,
      categories: p.data.categories,
    })),
    customData: `<language>en-us</language>`,
  });
}
