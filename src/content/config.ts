import { defineCollection, z } from 'astro:content';

const posts = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    modified: z.coerce.date().optional(),
    author: z.string().default('Mare Punzalan'),
    featured_image: z.string().optional().nullable(),
    categories: z.array(z.string()).default([]),
    tags: z.array(z.string()).default([]),
    excerpt: z.string().optional().nullable(),
    draft: z.boolean().default(false),
    status: z.string().optional(),
    wp_id: z.number().optional(),
    original_url: z.string().optional(),
    type: z.string().optional(),
  }),
});

const pages = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.coerce.date().optional(),
    modified: z.coerce.date().optional(),
    author: z.string().optional(),
    featured_image: z.string().optional().nullable(),
    excerpt: z.string().optional().nullable(),
    status: z.string().optional(),
    wp_id: z.number().optional(),
    original_url: z.string().optional(),
    type: z.string().optional(),
  }),
});

export const collections = { posts, pages };
