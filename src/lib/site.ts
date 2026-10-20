import { getCollection } from 'astro:content';
import { families, type Family } from './families';

export type RepoEntry = Awaited<ReturnType<typeof getCollection<'repos'>>>[number];
export type PostEntry = Awaited<ReturnType<typeof getCollection<'posts'>>>[number];

export const stageWord = (kind: string, archived: boolean): string =>
  kind === 'released' ? '● released' :
  kind === 'produced' ? 'produced by a release job' :
  kind === 'frozen' || archived ? '◌ frozen' :
  kind === 'private' ? 'private, named not shown' :
  '◐ no release yet';

export const loadRepos = async () => {
  const all = await getCollection('repos');
  const meta = all.find((r) => r.id === '__meta');
  const repos = all.filter((r) => r.id !== '__meta');
  return { repos, notShown: meta?.data.notShown ?? 0, fetchedAt: meta?.data.fetchedAt ?? '' };
};

export const loadPosts = async () => {
  const posts = await getCollection('posts', ({ data }) => !data.draft || import.meta.env.DEV || process.env.SHOW_DRAFTS === '1');
  return posts.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
};

export const reposOf = (repos: RepoEntry[], family: Family) => repos.filter((r) => r.data.family === family.slug);

/** The family's summary line for a column: stage, latest release and last touch across its repos. */
export const familySummary = (repos: RepoEntry[], family: Family) => {
  const mine = reposOf(repos, family).filter((r) => r.data.kind !== 'private');
  const released = mine.filter((r) => r.data.kind === 'released');
  // The family's headline release is its root repository's: the first one families.yaml names.
  const root = family.repos[0];
  const latest = released.find((r) => r.data.name === root) ?? released.sort((a, b) => b.data.releasedAt.localeCompare(a.data.releasedAt))[0];
  const touched = mine.map((r) => r.data.pushedAt).sort().reverse()[0] ?? '';
  const stage = mine.length === 0 ? '○ designing' : released.length > 0 ? '● released' : '◐ building';
  return { count: mine.length, stage, release: latest ? latest.data.release : 'unreleased', touched };
};

export const isoDate = (d: Date): string => d.toISOString().slice(0, 10);

export const slugOf = (post: PostEntry): string => post.id.replace(/^\d{4}-\d{2}-\d{2}-/, '');

export { families };
