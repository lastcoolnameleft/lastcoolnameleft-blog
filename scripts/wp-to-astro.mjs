#!/usr/bin/env node

/**
 * WordPress XML Export to Astro Markdown Converter
 *
 * Usage: node scripts/wp-to-astro.mjs <path-to-wordpress-export.xml>
 *
 * Reads a WordPress XML export file and converts each published post
 * into a Markdown file with Astro-compatible frontmatter, saved to
 * src/content/blog/.
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, resolve } from 'path';

const xmlPath = process.argv[2];
if (!xmlPath) {
	console.error('Usage: node scripts/wp-to-astro.mjs <wordpress-export.xml>');
	process.exit(1);
}

const xml = readFileSync(resolve(xmlPath), 'utf-8');
const outputDir = join(import.meta.dirname, '..', 'src', 'content', 'blog');

if (!existsSync(outputDir)) {
	mkdirSync(outputDir, { recursive: true });
}

// Extract all <item> blocks
const items = [];
const itemRegex = /<item>([\s\S]*?)<\/item>/g;
let match;
while ((match = itemRegex.exec(xml)) !== null) {
	items.push(match[1]);
}

function getTagContent(itemXml, tag) {
	// Handle CDATA and regular content
	const cdataRegex = new RegExp(`<${tag}>\\s*<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>\\s*</${tag}>`);
	const cdataMatch = itemXml.match(cdataRegex);
	if (cdataMatch) return cdataMatch[1].trim();

	const plainRegex = new RegExp(`<${tag}>(.*?)</${tag}>`);
	const plainMatch = itemXml.match(plainRegex);
	return plainMatch ? plainMatch[1].trim() : '';
}

function getNamespacedContent(itemXml, ns, tag) {
	const cdataRegex = new RegExp(`<${ns}:${tag}>\\s*<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>\\s*</${ns}:${tag}>`);
	const cdataMatch = itemXml.match(cdataRegex);
	if (cdataMatch) return cdataMatch[1].trim();

	const plainRegex = new RegExp(`<${ns}:${tag}>(.*?)</${ns}:${tag}>`, 's');
	const plainMatch = itemXml.match(plainRegex);
	return plainMatch ? plainMatch[1].trim() : '';
}

function getCategories(itemXml) {
	const cats = [];
	const regex = /<category domain="category"[^>]*><!\[CDATA\[(.*?)\]\]><\/category>/g;
	let m;
	while ((m = regex.exec(itemXml)) !== null) {
		cats.push(m[1]);
	}
	return [...new Set(cats)];
}

function getTags(itemXml) {
	const tags = [];
	const regex = /<category domain="post_tag"[^>]*><!\[CDATA\[(.*?)\]\]><\/category>/g;
	let m;
	while ((m = regex.exec(itemXml)) !== null) {
		tags.push(m[1]);
	}
	return [...new Set(tags)];
}

function slugify(str) {
	return str
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');
}

function htmlToMarkdown(html) {
	if (!html) return '';

	let md = html;

	// Remove WordPress shortcodes
	md = md.replace(/\[caption[^\]]*\]([\s\S]*?)\[\/caption\]/g, '$1');
	md = md.replace(/\[\/?[a-z_]+[^\]]*\]/gi, '');

	// Convert headings
	md = md.replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, '\n# $1\n');
	md = md.replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, '\n## $1\n');
	md = md.replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, '\n### $1\n');
	md = md.replace(/<h4[^>]*>([\s\S]*?)<\/h4>/gi, '\n#### $1\n');
	md = md.replace(/<h5[^>]*>([\s\S]*?)<\/h5>/gi, '\n##### $1\n');
	md = md.replace(/<h6[^>]*>([\s\S]*?)<\/h6>/gi, '\n###### $1\n');

	// Convert bold and italic
	md = md.replace(/<(strong|b)>([\s\S]*?)<\/\1>/gi, '**$2**');
	md = md.replace(/<(em|i)>([\s\S]*?)<\/\1>/gi, '*$2*');

	// Convert links
	md = md.replace(/<a[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi, '[$2]($1)');

	// Convert images
	md = md.replace(/<img[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]*\/?>/gi, '![$2]($1)');
	md = md.replace(/<img[^>]*alt="([^"]*)"[^>]*src="([^"]*)"[^>]*\/?>/gi, '![$1]($2)');
	md = md.replace(/<img[^>]*src="([^"]*)"[^>]*\/?>/gi, '![]($1)');

	// Convert lists
	md = md.replace(/<ul[^>]*>/gi, '\n');
	md = md.replace(/<\/ul>/gi, '\n');
	md = md.replace(/<ol[^>]*>/gi, '\n');
	md = md.replace(/<\/ol>/gi, '\n');
	md = md.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, '- $1\n');

	// Convert blockquotes
	md = md.replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, (_, content) => {
		return content
			.trim()
			.split('\n')
			.map((line) => `> ${line}`)
			.join('\n');
	});

	// Convert code blocks
	md = md.replace(/<pre[^>]*><code[^>]*>([\s\S]*?)<\/code><\/pre>/gi, '\n```\n$1\n```\n');
	md = md.replace(/<pre[^>]*>([\s\S]*?)<\/pre>/gi, '\n```\n$1\n```\n');
	md = md.replace(/<code>([\s\S]*?)<\/code>/gi, '`$1`');

	// Convert <br> and <hr>
	md = md.replace(/<br\s*\/?>/gi, '\n');
	md = md.replace(/<hr\s*\/?>/gi, '\n---\n');

	// Convert paragraphs
	md = md.replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, '\n$1\n');

	// Remove remaining HTML tags
	md = md.replace(/<[^>]+>/g, '');

	// Decode HTML entities
	md = md.replace(/&amp;/g, '&');
	md = md.replace(/&lt;/g, '<');
	md = md.replace(/&gt;/g, '>');
	md = md.replace(/&quot;/g, '"');
	md = md.replace(/&#039;/g, "'");
	md = md.replace(/&nbsp;/g, ' ');
	md = md.replace(/&#8217;/g, "'");
	md = md.replace(/&#8216;/g, "'");
	md = md.replace(/&#8220;/g, '"');
	md = md.replace(/&#8221;/g, '"');
	md = md.replace(/&#8211;/g, '–');
	md = md.replace(/&#8212;/g, '—');
	md = md.replace(/&#8230;/g, '…');

	// Clean up excessive newlines
	md = md.replace(/\n{3,}/g, '\n\n');

	return md.trim();
}

function escapeYaml(str) {
	if (!str) return '""';
	// Escape strings that could be problematic in YAML
	if (str.includes(':') || str.includes('#') || str.includes("'") || str.includes('"') || str.startsWith('-') || str.startsWith('{') || str.startsWith('[')) {
		return `"${str.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
	}
	return str;
}

let converted = 0;
let skipped = 0;

for (const item of items) {
	const postType = getNamespacedContent(item, 'wp', 'post_type');
	const status = getNamespacedContent(item, 'wp', 'status');

	// Only convert published posts
	if (postType !== 'post' || status !== 'publish') {
		skipped++;
		continue;
	}

	const title = getTagContent(item, 'title');
	const content = getNamespacedContent(item, 'content', 'encoded');
	const pubDate = getTagContent(item, 'pubDate');
	const postName = getNamespacedContent(item, 'wp', 'post_name');
	const excerpt = getNamespacedContent(item, 'excerpt', 'encoded');
	const categories = getCategories(item);
	const tags = getTags(item);

	const slug = postName || slugify(title);
	const date = new Date(pubDate);

	if (isNaN(date.getTime())) {
		console.warn(`  Skipping "${title}" - invalid date: ${pubDate}`);
		skipped++;
		continue;
	}

	// Build frontmatter
	let frontmatter = `---\n`;
	frontmatter += `title: ${escapeYaml(title)}\n`;
	if (excerpt) {
		frontmatter += `description: ${escapeYaml(excerpt)}\n`;
	} else {
		frontmatter += `description: ""\n`;
	}
	frontmatter += `pubDate: '${date.toISOString()}'\n`;
	if (categories.length > 0) {
		frontmatter += `categories:\n${categories.map((c) => `  - ${escapeYaml(c)}`).join('\n')}\n`;
	}
	if (tags.length > 0) {
		frontmatter += `tags:\n${tags.map((t) => `  - ${escapeYaml(t)}`).join('\n')}\n`;
	}
	frontmatter += `---\n`;

	const markdown = htmlToMarkdown(content);
	const fileContent = `${frontmatter}\n${markdown}\n`;

	const filename = `${slug}.md`;
	const filepath = join(outputDir, filename);

	writeFileSync(filepath, fileContent, 'utf-8');
	converted++;
	console.log(`  ✓ ${filename}`);
}

console.log(`\nDone! Converted ${converted} posts, skipped ${skipped} items.`);
console.log(`Output: ${outputDir}`);
