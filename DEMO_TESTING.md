# Theme Demo Testing

This document shows how to test each theme with sample posts.

## Setup

All 3 theme demos are in the `/demos/` directory. Each comes with sample posts already included in the theme.

### Fuwari Theme Demo
```bash
cd demos/fuwari-demo
pnpm install
pnpm dev
# View at http://localhost:3000
```

### Basic Blog Theme Demo  
```bash
cd demos/basicblog-demo
npm install
npm run dev
# View at http://localhost:3001 (configure in package.json or .env)
```

### Polyglow Theme Demo
```bash
cd demos/polyglow-demo
npm install
npm run dev
# View at http://localhost:3002
```

## Instructions

1. Run each demo in separate terminal tabs
2. Visit each in your browser to compare side-by-side
3. Themes are unmodified - they show how each handles default blog structure
4. Once you pick a winner, we'll migrate all 233 posts + projects to that theme

## Next Steps

After testing, just let me know which theme you prefer and I'll:
- Migrate all 233 blog posts to that schema
- Add all your projects
- Do a full production build
- Ready to deploy
