# w3

A static Astro site that renders a GitHub account: families of work, their repositories with
status, and posts. Read `README.md` first. This checkout is the site for `thinkmorestupidless`;
the tool is meant to serve any owner, so nothing about that account belongs in `src/`. The family
conventions in `../ankka-brain/conventions.md` apply where they fit a Node repository: thin
Justfile, push-to-main deploys here instead of tags, sentence-case declarative commits.

## Rules
- `w3.yaml` is the only hand-kept data, and `site:` in it is the only place the owner, domain,
  title, copy, nav and links are written. Do not hardcode an account name, a domain or an email in
  `src/`; read `site` from `src/lib/config.ts`.
- A repository's membership comes from its own `w3.yaml`, or from the site's lists for
  repositories that cannot carry one. Do not add a third source of truth; if the site needs a
  fact, read it from GitHub.
- Posts are markdown under `content/posts/`, named `YYYY-MM-DD-slug.md`. The schema in
  `src/content.config.ts` rejects an unknown family; add the family to `w3.yaml` first.
- The build reads GitHub and needs `GITHUB_TOKEN`. Never commit a token. The Actions token sees
  public repositories only; keep it that way.
- Two typefaces, Bricolage Grotesque and IBM Plex Mono, loaded from Google Fonts in
  `src/layouts/Base.astro`. Do not add a third.
- Colours are tokens in `src/styles/global.css`; family colours live in `w3.yaml`. Light means
  shipped, dark means not; keep the circle vocabulary in `global.css` and the legend on the home
  page in step.
- British spelling in prose, lower-case family names, no exclamation marks.

## Traps
Dated, flat statements of what cost time. Add one the day it does.

- 2026-10-19: `readFileSync` of a file next to `astro.config.mjs` does not survive the build;
  import data files with `?raw` so Vite bundles them.
- 2026-10-19: the REST `/tags` list is unordered and a fork returns its upstream's tags. Use
  GraphQL `refs` ordered by `TAG_COMMIT_DATE`.
- 2026-10-19: `astro preview` daemonises; stop it with `npx astro preview stop`.
