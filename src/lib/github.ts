/**
 * Reads the repositories the site shows from the GitHub API at build time.
 *
 * Membership: a repository is shown when a family names it in families.yaml or when it carries the
 * topic `family-<slug>`. Everything else the account owns is counted, not shown.
 *
 * Needs GITHUB_TOKEN in the environment: the tag lookup is GraphQL, which refuses anonymous calls,
 * and a build makes about one call per repository shown plus one per hundred the account owns.
 */
import { families, familyTopic, owner } from './families';

export type Kind = 'released' | 'unreleased' | 'frozen' | 'produced' | 'private';

export type Repo = {
  name: string;
  family: string;
  description: string;
  url: string;
  kind: Kind;
  release: string;
  releasedAt: string;
  pushedAt: string;
  archived: boolean;
  topics: string[];
};

type ApiRepo = {
  name: string;
  description: string | null;
  html_url: string;
  archived: boolean;
  pushed_at: string;
  topics?: string[];
  fork: boolean;
};

const api = 'https://api.github.com';

const headers = (): Record<string, string> => {
  const h: Record<string, string> = {
    accept: 'application/vnd.github+json',
    'x-github-api-version': '2022-11-28',
    'user-agent': 'thinkmorestupidless.com build',
  };
  const token = process.env.GITHUB_TOKEN;
  if (token) h.authorization = `Bearer ${token}`;
  return h;
};

const get = async <T>(path: string): Promise<T | null> => {
  const res = await fetch(`${api}${path}`, { headers: headers() });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`GitHub ${res.status} for ${path}: ${await res.text()}`);
  return (await res.json()) as T;
};

const allRepos = async (): Promise<ApiRepo[]> => {
  const out: ApiRepo[] = [];
  for (let page = 1; page < 10; page++) {
    const batch = await get<ApiRepo[]>(`/users/${owner}/repos?per_page=100&type=owner&page=${page}`);
    if (!batch || batch.length === 0) break;
    out.push(...batch);
    if (batch.length < 100) break;
  }
  return out;
};

type Latest = { tag: string; at: string } | null;

type GraphRepo = {
  repository: {
    latestRelease: { tagName: string; publishedAt: string } | null;
    refs: { nodes: Array<{ name: string; target: { committedDate?: string; target?: { committedDate?: string } } }> };
  } | null;
};

/**
 * The latest release, or failing that the newest tag by commit date. One GraphQL call per
 * repository; the REST tag list is unordered, which gave a fork its upstream's tags.
 */
const latest = async (name: string): Promise<Latest> => {
  const query = `query($owner: String!, $name: String!) {
    repository(owner: $owner, name: $name) {
      latestRelease { tagName publishedAt }
      refs(refPrefix: "refs/tags/", first: 1, orderBy: { field: TAG_COMMIT_DATE, direction: DESC }) {
        nodes { name target { ... on Commit { committedDate } ... on Tag { target { ... on Commit { committedDate } } } } }
      }
    }
  }`;
  const res = await fetch(`${api}/graphql`, { method: 'POST', headers: { ...headers(), 'content-type': 'application/json' }, body: JSON.stringify({ query, variables: { owner, name } }) });
  if (!res.ok) throw new Error(`GitHub GraphQL ${res.status} for ${name}: ${await res.text()}`);
  const { data, errors } = (await res.json()) as { data: GraphRepo; errors?: unknown[] };
  if (errors) throw new Error(`GitHub GraphQL for ${name}: ${JSON.stringify(errors)}`);
  const r = data.repository;
  if (!r) return null;
  if (r.latestRelease) return { tag: r.latestRelease.tagName, at: r.latestRelease.publishedAt.slice(0, 10) };
  const t = r.refs.nodes[0];
  if (!t) return null;
  const at = t.target.committedDate ?? t.target.target?.committedDate ?? '';
  return { tag: t.name, at: at.slice(0, 10) };
};

export type Catalogue = { repos: Repo[]; notShown: number; fetchedAt: string };

export const readCatalogue = async (): Promise<Catalogue> => {
  const all = await allRepos();
  const byName = new Map(all.map((r) => [r.name, r]));
  const repos: Repo[] = [];
  const claimed = new Set<string>();

  for (const family of families) {
    const topic = familyTopic(family.slug);
    const names = new Set<string>([
      ...family.repos,
      ...family.produced,
      ...all.filter((r) => (r.topics ?? []).includes(topic)).map((r) => r.name),
    ]);
    for (const name of names) {
      const r = byName.get(name);
      if (!r) {
        console.warn(`families.yaml names ${name} but ${owner} has no public repository of that name`);
        continue;
      }
      if (claimed.has(name)) continue;
      claimed.add(name);
      const produced = family.produced.includes(name) || (r.topics ?? []).includes('produced');
      const rel = produced ? null : await latest(name);
      const kind: Kind = produced ? 'produced' : r.archived ? 'frozen' : rel ? 'released' : 'unreleased';
      repos.push({
        name,
        family: family.slug,
        description: r.description ?? '',
        url: r.html_url,
        kind,
        release: rel?.tag ?? '',
        releasedAt: rel?.at ?? '',
        pushedAt: r.pushed_at.slice(0, 10),
        archived: r.archived,
        topics: r.topics ?? [],
      });
    }
    for (const p of family.private) {
      repos.push({
        name: p.name,
        family: family.slug,
        description: p.description,
        url: '',
        kind: 'private',
        release: '',
        releasedAt: '',
        pushedAt: '',
        archived: false,
        topics: [],
      });
    }
  }

  return { repos, notShown: all.length - claimed.size, fetchedAt: new Date().toISOString().slice(0, 10) };
};
