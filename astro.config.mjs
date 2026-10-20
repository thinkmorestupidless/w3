import { defineConfig } from 'astro/config';

// https://docs.astro.build/en/reference/configuration-reference/
export default defineConfig({
  site: 'https://thinkmorestupidless.com',
  output: 'static',
  trailingSlash: 'always',
  build: { format: 'directory' },
});
