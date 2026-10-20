# www

thinkmorestupidless.com: a static Astro site rendered from GitHub. Read `README.md` first. The
family conventions in `../ankka-brain/conventions.md` apply where they fit a Node repository: thin
Justfile, tag-free deploys here replaced by push-to-main, sentence-case declarative commits.

## Rules
- `families.yaml` is the only hand-kept data. Do not add a second source of truth for
  repositories, families or status; if the site needs a fact, read it from GitHub or from a brain.
- Posts are markdown under `content/posts/`, named `YYYY-MM-DD-slug.md`. The schema in
  `src/content.config.ts` rejects an unknown family; add the family to `families.yaml` first.
- The build reads GitHub and needs `GITHUB_TOKEN`. Never commit a token. The Actions token sees
  public repositories only; keep it that way.
- Two typefaces, Bricolage Grotesque and IBM Plex Mono, loaded from Google Fonts in
  `src/layouts/Base.astro`. Do not add a third.
- Colours are tokens in `src/styles/global.css`; family colours live in `families.yaml`. Light
  means shipped, dark means not; keep the circle vocabulary in `global.css` and the legend on the
  home page in step.
- British spelling in prose, lower-case family names, no exclamation marks.

## Traps
Dated, flat statements of what cost time. Add one the day it does.

- (none yet)
