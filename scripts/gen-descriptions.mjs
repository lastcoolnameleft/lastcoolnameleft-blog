#!/usr/bin/env node
/**
 * Auto-generate descriptions for blog posts that have the placeholder
 * "A post by Tommy Falgout" by extracting the first ~155 characters
 * of meaningful body text.
 */
import { readFileSync, writeFileSync } from "fs";
import { execSync } from "child_process";

const PLACEHOLDER = 'description: "A post by Tommy Falgout"';
const MAX_LEN = 155;

// Find all affected files
const files = execSync(
  `grep -rl 'description: "A post by Tommy Falgout"' src/content/blog/`,
  { encoding: "utf-8" }
)
  .trim()
  .split("\n")
  .filter(Boolean);

console.log(`Found ${files.length} files to update.\n`);

function extractDescription(body) {
  // Strip markdown images, links (keep text), HTML tags, headings, hrs, list markers
  let text = body
    .replace(/!\[.*?\]\(.*?\)/g, "")             // images
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")     // links → keep text
    .replace(/<[^>]+>/g, "")                       // HTML tags
    .replace(/^#{1,6}\s+/gm, "")                  // headings
    .replace(/^[-*_]{3,}\s*$/gm, "")              // horizontal rules
    .replace(/^[\s]*[-*+]\s+/gm, "")              // list markers
    .replace(/^[\s]*\d+\.\s+/gm, "")              // ordered list markers
    .replace(/[*_`~]+/g, "")                       // bold/italic/code/strikethrough
    .replace(/\n+/g, " ")                          // collapse newlines
    .replace(/\s+/g, " ")                          // collapse whitespace
    .trim();

  if (!text) return null;

  // Truncate at word boundary
  if (text.length > MAX_LEN) {
    text = text.slice(0, MAX_LEN);
    const lastSpace = text.lastIndexOf(" ");
    if (lastSpace > MAX_LEN * 0.6) {
      text = text.slice(0, lastSpace);
    }
    text += "…";
  }

  return text;
}

let updated = 0;
let skipped = 0;

for (const file of files) {
  const content = readFileSync(file, "utf-8");

  // Split frontmatter from body
  const fmEnd = content.indexOf("---", 3);
  if (fmEnd === -1) {
    console.log(`  SKIP (no frontmatter): ${file}`);
    skipped++;
    continue;
  }

  const body = content.slice(fmEnd + 3).trim();
  const desc = extractDescription(body);

  if (!desc) {
    console.log(`  SKIP (empty body): ${file}`);
    skipped++;
    continue;
  }

  // Escape quotes for YAML
  const safeDesc = desc.replace(/"/g, '\\"');
  const newContent = content.replace(
    PLACEHOLDER,
    `description: "${safeDesc}"`
  );

  writeFileSync(file, newContent, "utf-8");
  updated++;
}

console.log(`\nDone. Updated: ${updated}, Skipped: ${skipped}`);
