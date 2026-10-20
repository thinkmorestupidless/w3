import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { families } from './lib/families';
import { readCatalogue } from './lib/github';

const familySlugs = families.map((f) => f.slug) as [string, ...string[]];

/** Posts: one markdown file each under content/posts, named YYYY-MM-DD-slug.md. */
const posts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './content/posts' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    family: z.enum(familySlugs),
    kind: z.string(),
    summary: z.string(),
    repos: z.array(z.string()).default([]),
    minutes: z.number().int().positive().default(5),
    draft: z.boolean().default(false),
  }),
});

/** Repositories: read from GitHub at build time; see src/lib/github.ts. */
const repos = defineCollection({
  loader: async () => {
    const { repos, notShown, fetchedAt } = await readCatalogue();
    return [
      ...repos.map((r) => ({ id: r.name, ...r })),
      { id: '__meta', name: '__meta', family: '', description: '', url: '', kind: 'private', release: '', releasedAt: '', pushedAt: '', archived: false, topics: [], notShown, fetchedAt },
    ];
  },
  schema: z.object({
    name: z.string(),
    family: z.string(),
    description: z.string(),
    url: z.string(),
    kind: z.enum(['released', 'unreleased', 'frozen', 'produced', 'private']),
    release: z.string(),
    releasedAt: z.string(),
    pushedAt: z.string(),
    archived: z.boolean(),
    topics: z.array(z.string()),
    notShown: z.number().optional(),
    fetchedAt: z.string().optional(),
  }),
});

export const collections = { posts, repos };
