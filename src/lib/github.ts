/**
 * Reads the repositories the site shows from the GitHub API at build time.
 *
 * Membership: a repository is shown when it carries a `w3.yaml` at the root of its default branch
 * naming a family this site defines, or when the site's own `w3.yaml` names it under a family's
 * `repos:` or `produced:`. Everything else the account owns is counted, not shown.
 *
 * Needs GITHUB_TOKEN in the environment: the lookup is GraphQL, which refuses anonymous calls. A
 * build makes one REST call per hundred repositories the account owns and one GraphQL call per
 * fifty, whatever the number shown.
 */
import { parse } from 'yaml';
import { families, owner } from './config';

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
  /** Position within the family; the lowest is the family's root repository. */
  order: number;
  /** Where the membership came from: the repository's own w3.yaml or the site's. */
  source: 'repo' | 'site';
};

/** The shape of a `w3.yaml` in a rendered repository. Everything but `family` is optional. */
export type RepoConfig = {
  family: string;
  description?: string;
  kind?: 'produced' | 'frozen';
  order?: number;
};

type ApiRepo = {
  name: string;
  description: string | null;
  html_url: string;
  archived: boolean;
  pushed_at: string;
  fork: boolean;
};

const api = 'https://api.github.com';

const headers = (): Record<string, string> => {
  const h: Record<string, string> = {
    accept: 'application/vnd.github+json',
    'x-github-api-version': '2022-11-28',
    'user-agent': `w3 build for ${owner}`,
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

/** Every public repository the account owns, forks included. */
const allRepos = async (): Promise<ApiRepo[]> => {
  const out: ApiRepo[] = [];
  for (let page = 1; page < 20; page++) {
    const batch = await get<ApiRepo[]>(`/users/${owner}/repos?per_page=100&type=owner&page=${page}`);
    if (!batch || batch.length === 0) break;
    out.push(...batch);
    if (batch.length < 100) break;
  }
  return out;
};

type Latest = { tag: string; at: string } | null;

type GraphRepo = {
  latestRelease: { tagName: string; publishedAt: string } | null;
  refs: { nodes: Array<{ name: string; target: { committedDate?: string; target?: { committedDate?: string } } }> };
  object: { text: string } | null;
};

type Detail = { latest: Latest; config: RepoConfig | null };

/** A legal GraphQL alias for a repository name, which may carry dots and dashes. */
const alias = (i: number) => `r${i}`;

/**
 * For a batch of repositories: the latest release, or failing that the newest tag by commit date,
 * and the text of `w3.yaml` on the default branch. One GraphQL call per batch; the REST tag list
 * is unordered, which once gave a fork its upstream's tags.
 */
const detailsOf = async (names: string[]): Promise<Map<string, Detail>> => {
  const fields = `
    latestRelease { tagName publishedAt }
    refs(refPrefix: "refs/tags/", first: 1, orderBy: { field: TAG_COMMIT_DATE, direction: DESC }) {
      nodes { name target { ... on Commit { committedDate } ... on Tag { target { ... on Commit { committedDate } } } } }
    }
    object(expression: "HEAD:w3.yaml") { ... on Blob { text } }`;
  const query = `query { ${names.map((n, i) => `${alias(i)}: repository(owner: ${JSON.stringify(owner)}, name: ${JSON.stringify(n)}) { ${fields} }`).join('\n')} }`;
  const res = await fetch(`${api}/graphql`, { method: 'POST', headers: { ...headers(), 'content-type': 'application/json' }, body: JSON.stringify({ query }) });
  if (!res.ok) throw new Error(`GitHub GraphQL ${res.status}: ${await res.text()}`);
  const { data, errors } = (await res.json()) as { data: Record<string, GraphRepo | null>; errors?: unknown[] };
  if (errors) throw new Error(`GitHub GraphQL: ${JSON.stringify(errors)}`);

  const out = new Map<string, Detail>();
  names.forEach((name, i) => {
    const r = data[alias(i)];
    if (!r) return;
    let latest: Latest = null;
    if (r.latestRelease) latest = { tag: r.latestRelease.tagName, at: r.latestRelease.publishedAt.slice(0, 10) };
    else if (r.refs.nodes[0]) {
      const t = r.refs.nodes[0];
      latest = { tag: t.name, at: (t.target.committedDate ?? t.target.target?.committedDate ?? '').slice(0, 10) };
    }
    let config: RepoConfig | null = null;
    if (r.object?.text) {
      try {
        const parsed = parse(r.object.text) as Partial<RepoConfig> | null;
        if (parsed && typeof parsed.family === 'string') config = parsed as RepoConfig;
        else console.warn(`${name}/w3.yaml has no family; ignored`);
      } catch (e) {
        console.warn(`${name}/w3.yaml does not parse; ignored: ${e}`);
      }
    }
    out.set(name, { latest, config });
  });
  return out;
};

const chunk = <T>(xs: T[], n: number): T[][] => Array.from({ length: Math.ceil(xs.length / n) }, (_, i) => xs.slice(i * n, i * n + n));

export type Catalogue = { repos: Repo[]; notShown: number; fetchedAt: string };

export const readCatalogue = async (): Promise<Catalogue> => {
  const all = await allRepos();
  const byName = new Map(all.map((r) => [r.name, r]));
  const details = new Map<string, Detail>();
  for (const names of chunk(all.map((r) => r.name), 50)) for (const [k, v] of await detailsOf(names)) details.set(k, v);

  const repos: Repo[] = [];
  const claimed = new Set<string>();
  const slugs = new Set(families.map((f) => f.slug));

  const add = (r: ApiRepo, family: string, source: Repo['source'], order: number, cfg: RepoConfig | null) => {
    if (claimed.has(r.name)) return;
    claimed.add(r.name);
    const d = details.get(r.name);
    const produced = cfg?.kind === 'produced' || families.find((f) => f.slug === family)?.produced.includes(r.name) === true;
    const frozen = cfg?.kind === 'frozen' || r.archived;
    const rel = produced ? null : d?.latest ?? null;
    const kind: Kind = produced ? 'produced' : frozen ? 'frozen' : rel ? 'released' : 'unreleased';
    repos.push({
      name: r.name,
      family,
      description: cfg?.description ?? r.description ?? '',
      url: r.html_url,
      kind,
      release: rel?.tag ?? '',
      releasedAt: rel?.at ?? '',
      pushedAt: r.pushed_at.slice(0, 10),
      archived: r.archived,
      order,
      source,
    });
  };

  // The site's own lists first, in their order: these are the repositories one cannot or should
  // not edit, and the root of a family when it has not yet opted in itself.
  for (const family of families) {
    [...family.repos, ...family.produced].forEach((name, i) => {
      const r = byName.get(name);
      if (!r) {
        console.warn(`w3.yaml names ${name} under ${family.slug} but ${owner} has no public repository of that name`);
        return;
      }
      add(r, family.slug, 'site', i, details.get(name)?.config ?? null);
    });
  }

  // Then every repository that opted in with its own w3.yaml.
  for (const r of all) {
    const cfg = details.get(r.name)?.config;
    if (!cfg) continue;
    if (!slugs.has(cfg.family)) {
      console.warn(`${r.name}/w3.yaml names family ${cfg.family}, which this site does not define; not shown`);
      continue;
    }
    add(r, cfg.family, 'repo', cfg.order ?? 100, cfg);
  }

  for (const family of families) {
    for (const p of family.private) {
      repos.push({ name: p.name, family: family.slug, description: p.description, url: '', kind: 'private', release: '', releasedAt: '', pushedAt: '', archived: false, order: 1000, source: 'site' });
    }
  }

  repos.sort((a, b) => a.family.localeCompare(b.family) || a.order - b.order || a.name.localeCompare(b.name));
  return { repos, notShown: all.length - claimed.size, fetchedAt: new Date().toISOString().slice(0, 10) };
};
