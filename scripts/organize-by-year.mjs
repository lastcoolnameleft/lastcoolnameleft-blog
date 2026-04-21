#!/usr/bin/env node

/**
 * Moves blog posts from src/content/blog/ into year-based subdirectories
 * based on the pubDate frontmatter field.
 *
 * Usage: node scripts/organize-by-year.mjs [--dry-run]
 */

import { readFileSync, mkdirSync, renameSync, readdirSync } from 'fs';
import { join, basename } from 'path';

const BLOG_DIR = 'src/content/blog';
const dryRun = process.argv.includes('--dry-run');

const files = readdirSync(BLOG_DIR).filter(
	(f) => f.endsWith('.md') || f.endsWith('.mdx'),
);

console.log(`Found ${files.length} posts to organize${dryRun ? ' (dry run)' : ''}...\n`);

let moved = 0;

for (const file of files) {
	const filePath = join(BLOG_DIR, file);
	const content = readFileSync(filePath, 'utf-8');

	// Extract pubDate from frontmatter
	const match = content.match(/^pubDate:\s*['"]?(\d{4})/m);
	if (!match) {
		console.warn(`⚠ No pubDate found in ${file}, skipping`);
		continue;
	}

	const year = match[1];
	const destDir = join(BLOG_DIR, year);
	const destPath = join(destDir, file);

	if (dryRun) {
		console.log(`  ${file} → ${year}/`);
	} else {
		mkdirSync(destDir, { recursive: true });
		renameSync(filePath, destPath);
	}
	moved++;
}

console.log(`\n${dryRun ? 'Would move' : 'Moved'} ${moved} posts into year directories.`);
