# Thin by convention: every recipe is one command, and everything works without just.

default:
    @just --list

# Install dependencies exactly as locked
install:
    npm ci

# Local dev server with hot reload; needs a GitHub token to read the repositories
dev:
    GITHUB_TOKEN=$(gh auth token) npx astro dev

# Build the site into dist/
build:
    GITHUB_TOKEN=$(gh auth token) npx astro build

# Serve dist/ as the deploy would
preview:
    npx astro preview

# Type-check the components and the content schemas
check:
    GITHUB_TOKEN=$(gh auth token) npx astro check
