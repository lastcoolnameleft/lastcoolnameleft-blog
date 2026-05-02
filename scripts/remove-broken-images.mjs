#!/usr/bin/env node
/**
 * Remove broken image/ogImage fields from blog posts where the URL
 * is not from imgur.com (i.e., old Flickr links that are dead).
 */
import { readFileSync, writeFileSync } from "fs";
import { execSync } from "child_process";

// Find all blog posts that have an image field
const files = execSync(
  `grep -rl '^image:' src/content/blog/`,
  { encoding: "utf-8" }
)
  .trim()
  .split("\n")
  .filter(Boolean);

let updated = 0;
let skipped = 0;

for (const file of files) {
  const content = readFileSync(file, "utf-8");

  // Extract the image src
  const imgMatch = content.match(/^image:\n\s+src:\s+(.+)$/m);
  if (!imgMatch) {
    skipped++;
    continue;
  }

  const imgUrl = imgMatch[1].trim();

  // Keep imgur images — they're valid
  if (imgUrl.includes("imgur.com")) {
    skipped++;
    continue;
  }

  // Remove image block (image: + src: + alt:) and ogImage block (ogImage: + src:)
  let newContent = content
    .replace(/^image:\n\s+src:\s+.+\n(\s+alt:\s+.+\n)?/m, "")
    .replace(/^ogImage:\n\s+src:\s+.+\n/m, "");

  writeFileSync(file, newContent, "utf-8");
  updated++;
  console.log(`  CLEANED: ${file}`);
}

console.log(`\nDone. Cleaned: ${updated}, Kept: ${skipped}`);
