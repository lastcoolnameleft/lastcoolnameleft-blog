# Copilot Instructions

## Build & Dev Commands

```bash
pnpm install          # Install dependencies (uses pnpm workspace)
pnpm dev              # Dev server at localhost:4321
pnpm build            # Production build to ./dist/
pnpm preview          # Preview production build locally
```

No test suite or linter is configured.

## Creating Blog Posts

Use the helper script:

```bash
./scripts/add-post.sh "Your Post Title"
```

This creates `src/content/blog/{year}/{slug}.md` with frontmatter template. Posts are organized by year.

## Architecture

- **Framework**: Astro 6 with Tailwind CSS 4, deployed to GitHub Pages via GitHub Actions
- **Content**: Astro Content Collections using glob loaders (Markdown only, no MDX)
- **Search**: Pagefind (static search index built at build time)
- **Images**: Local hosted media under `/images/...` in `public/`, with Sharp for local optimization
- **Code blocks**: Expressive Code with `aurora-x` theme and line numbers plugin
- **Icons**: `astro-icon` with `@iconify-json/lucide` and `@iconify-json/fa6-brands`
- **CSP**: Content Security Policy is configured in `astro.config.mjs` with script/style hashes — new inline scripts require adding their hash

## Key Files

- `src/site.config.ts` — Site metadata, social links, header/footer navigation
- `src/content.config.ts` — Collection schemas (blog, about, legal, licenses)
- `astro.config.mjs` — Integrations, CSP hashes, markdown plugins, fonts
- `src/styles/global.css` — Tailwind config, CSS custom properties (light/dark themes using oklch)

## Content Conventions

Blog post frontmatter requires:
- `title`, `description`, `pubDate`, `license` (reference to licenses collection)
- `draft: true/false` — drafts are excluded from production
- `featured: "1"|"2"|"3"|"none"` — controls homepage featured card slots
- `tags` — array of strings for categorization
- `image` — hero image with `src` and `alt`
- `authors` — defaults to `["Tommy Falgout"]`

## Styling Conventions

- Tailwind utility classes directly in `.astro` components
- Design tokens via CSS custom properties (`--surface`, `--accent`, `--text-main`, etc.)
- Light/dark mode via `.dark` class on root with `@custom-variant dark`
- Component variants use `class-variance-authority` (cva) and `clsx`/`tailwind-merge` for class composition

## Inline Scripts & CSP

When adding or modifying `<script is:inline>` blocks, the CSP hash must be updated in `astro.config.mjs` under `security.csp.directives`. The build will fail or the script will be blocked if the hash is missing. Use `is:inline` only when needed (e.g., DOM manipulation that must run immediately); prefer standard `<script>` tags which Astro bundles automatically.
