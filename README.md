# www

thinkmorestupidless.com. A static site rendered from GitHub: the families of work, every
repository in them with its status, and the writing. Nothing is deployed yet.

## How it works

- `families.yaml` is the only hand-kept data: the families in order, their colours, their thesis,
  and which repositories they claim. A repository is also claimed by carrying the topic
  `family-<slug>` on GitHub; the two sources merge.
- `src/lib/github.ts` reads the account's public repositories at build time: description, topics,
  archived, pushed-at, and the latest release or tag. A repository in no family is counted, not
  shown.
- `content/posts/*.md` are the posts, one file each, named `YYYY-MM-DD-slug.md`, with front matter
  for `title`, `date`, `family`, `kind`, `summary`, `repos`, `minutes` and `draft`.
- `.github/workflows/site.yml` builds on push, on a `repository_dispatch` of type `rebuild`, every
  six hours, and by hand, and deploys to GitHub Pages.

## Working on it

```
just install
just dev        # needs gh auth; the build reads GitHub
just build
just preview
```

The build needs `GITHUB_TOKEN`; the Justfile takes it from `gh auth token`.

## Asking the site to redraw after a release

Add to a family's release workflow, with a fine-grained token scoped to this repository's Actions:

```yaml
- run: gh api repos/thinkmorestupidless/www/dispatches -f event_type=rebuild
  env:
    GH_TOKEN: ${{ secrets.WWW_DISPATCH_TOKEN }}
```

## Not yet

- The honest list page reads nothing yet; it will collect each repository's limitations page.
- The about page carries a placeholder for the personal honest list.
- No videos page; `videos` in the nav goes to the self-hosted ai family.
- Repository descriptions come from GitHub as they are; several are empty.
