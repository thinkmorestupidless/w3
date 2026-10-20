# w3

w3 renders a GitHub account as a static website, and keeps it current as the account changes.
Point it at an owner, say which families of work there are, drop a `w3.yaml` into each
repository that belongs to one, and the site redraws itself: every repository as a circle whose
shape and colour say what it is and whether it has shipped, every family as a poster, and a
writing section for the posts kept in this repository. Nothing on the site is written for the
site; it reads what is already true on GitHub.

This repository is the site for `thinkmorestupidless`. Fork it, change `w3.yaml`, and it is yours.

## How it works

- `w3.yaml` here is the only hand-kept data. `site:` is the identity: owner, domain, title, the
  wordmark, the intro, the nav and the footer links. `families:` are the families of work in the
  order they appear, each with a slug, a name, a one-line label, a thesis and three colours.
- A repository joins a family by carrying its own `w3.yaml` at the root of its default branch:

  ```yaml
  family: ankka          # a slug this site defines; anything else is reported and not shown
  description: ...       # optional; replaces the GitHub description on the site
  kind: produced         # optional; produced (pushed by a release job) or frozen; else derived
  order: 0               # optional; position within the family, lowest is the family's root
  touched: 2023-08-22    # optional; shown as last touched when the last push was not work
  ```

  The site's `w3.yaml` can also name repositories under a family's `repos:`, `produced:` and
  `private:`, for ones that cannot carry a file: a fork you would rather not touch, a repository
  a release job overwrites, one that is not public. The lists and the files merge; a repository
  in neither is counted on the home page, not shown.
- `src/lib/github.ts` reads the account at build time: every public repository's description,
  archived flag and pushed-at over REST; then, in batches of fifty over GraphQL, the latest
  release or newest tag and the text of `w3.yaml`. Shipped means a release or a tag exists.
- `content/posts/*.md` are the posts, one file each, named `YYYY-MM-DD-slug.md`, with front
  matter for `title`, `date`, `family`, `kind`, `summary`, `repos`, `minutes` and `draft`. A
  post's colour is its family's; a draft is shown in dev and hidden in a build unless
  `SHOW_DRAFTS=1`.
- `.github/workflows/site.yml` builds on push, on a `repository_dispatch` of type `rebuild`,
  every six hours, and by hand, and deploys to GitHub Pages. `site.domain` becomes the `CNAME`.

## Working on it

```
just install
just dev        # needs gh auth; the build reads GitHub
just build
just preview    # daemonises; stop with: npx astro preview stop
```

The build needs `GITHUB_TOKEN`; the Justfile takes it from `gh auth token`. In Actions the
workflow token reads the owner's public repositories and nothing else, which is the intent.

## Setting it up for another account

1. Fork, then edit `site:` in `w3.yaml`: owner, repo, url, domain (or remove it), title, wordmark,
   accent, intro, nav, links.
2. Define the families. Pick a colour each, then a light tint (`lite`) and a dark shade (`deep`)
   of it for the circles.
3. Add a `w3.yaml` to each repository you want shown, or list it under the family here.
4. In the repository settings, set Pages to deploy from GitHub Actions, and point the domain's DNS
   at Pages if there is one.
5. Push to `main`. The site is live after the first run.

## Asking the site to redraw after a release

Add to a repository's release workflow, with a fine-grained token scoped to this repository's
Actions, so the site redraws minutes after a tag rather than hours:

```yaml
- run: gh api repos/<owner>/w3/dispatches -f event_type=rebuild
  env:
    GH_TOKEN: ${{ secrets.W3_DISPATCH_TOKEN }}
```

## Not yet

- Private repositories are named, never read, even with a token that could.
- No mobile layout beyond the bars wrapping.
