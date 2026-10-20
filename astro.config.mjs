import { defineConfig } from 'astro/config';
import { readFileSync, writeFileSync } from 'node:fs';
import { parse } from 'yaml';

const { site } = parse(readFileSync(new URL('./w3.yaml', import.meta.url), 'utf8'));

/** Writes dist/CNAME from `site.domain` so GitHub Pages serves the custom domain. */
const cname = () => ({
  name: 'w3-cname',
  hooks: {
    'astro:build:done': ({ dir }) => {
      if (site.domain) writeFileSync(new URL('CNAME', dir), `${site.domain}\n`);
    },
  },
});

// https://docs.astro.build/en/reference/configuration-reference/
export default defineConfig({
  site: site.url,
  output: 'static',
  trailingSlash: 'always',
  build: { format: 'directory' },
  integrations: [cname()],
});
