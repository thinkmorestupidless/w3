import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { loadPosts, slugOf } from '../lib/site';

export async function GET(context: APIContext) {
  const posts = await loadPosts();
  return rss({
    title: 'thinkmorestupidless, writing',
    description: 'Posts about the families of work at thinkmorestupidless.',
    site: context.site!,
    items: posts.map((p) => ({
      title: p.data.title,
      pubDate: p.data.date,
      description: p.data.summary,
      link: `/writing/${slugOf(p)}/`,
    })),
  });
}
