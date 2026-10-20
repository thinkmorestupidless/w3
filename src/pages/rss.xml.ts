import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { loadPosts, site, slugOf } from '../lib/site';

export async function GET(context: APIContext) {
  const posts = await loadPosts();
  return rss({
    title: `${site.title}, writing`,
    description: site.description,
    site: context.site!,
    items: posts.map((p) => ({
      title: p.data.title,
      pubDate: p.data.date,
      description: p.data.summary,
      link: `/writing/${slugOf(p)}/`,
    })),
  });
}
