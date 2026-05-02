#!/usr/bin/env node
/**
 * Migrate external images to local public/images/{year}/ directory.
 * Downloads images, saves locally, and updates all references in blog posts.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { execSync } from "child_process";
import { basename, extname } from "path";
import { createHash } from "crypto";

const BLOG_DIR = "src/content/blog";
const IMAGES_DIR = "public/images";

// Get all blog post files
const files = execSync(`find ${BLOG_DIR} -name '*.md'`, { encoding: "utf-8" })
  .trim()
  .split("\n")
  .filter(Boolean);

// Collect all unique image URLs across all posts with their year context
const urlMap = new Map(); // url -> local path

// Regex to find image URLs - covers frontmatter src: and markdown ![](url)
const imageUrlRegex = /https?:\/\/[^\s")\]>]+\.(?:jpg|jpeg|png|gif|webp|svg)(?:\?[^\s")\]>]*)?/gi;
// Google Photos URLs (no extension)
const googlePhotosRegex = /https?:\/\/lh3\.googleusercontent\.com\/[^\s")\]>]+/g;
// wp-content URLs that might not have extensions
const wpContentRegex = /https?:\/\/www\.lastcoolnameleft\.com\/wp-content\/uploads\/[^\s")\]>]+/g;

function getYearFromFile(filePath) {
  const match = filePath.match(/\/(\d{4})\//);
  return match ? match[1] : "misc";
}

function sanitizeFilename(url) {
  // Extract filename from URL
  let name = url.split("/").pop().split("?")[0].split("#")[0];

  // For Google Photos URLs, generate a hash-based name
  if (url.includes("googleusercontent.com")) {
    const hash = createHash("md5").update(url).digest("hex").slice(0, 10);
    name = `gphoto-${hash}.jpg`;
  }

  // For URLs without proper extensions
  if (!extname(name) || extname(name).length > 5) {
    const hash = createHash("md5").update(url).digest("hex").slice(0, 10);
    name = `img-${hash}.jpg`;
  }

  // Clean up filename
  name = name.replace(/[^a-zA-Z0-9._-]/g, "-").toLowerCase();

  return name;
}

async function downloadImage(url, destPath) {
  try {
    execSync(
      `curl -fsSL --max-time 15 -o "${destPath}" "${url}"`,
      { timeout: 20000, stdio: "pipe" }
    );
    // Verify it's actually an image (check file size > 0)
    const stats = execSync(`wc -c < "${destPath}"`, { encoding: "utf-8" }).trim();
    if (parseInt(stats) < 100) {
      execSync(`rm -f "${destPath}"`);
      return false;
    }
    return true;
  } catch {
    execSync(`rm -f "${destPath}"`, { stdio: "ignore" });
    return false;
  }
}

// Phase 1: Collect all image URLs and plan downloads
console.log("Phase 1: Scanning blog posts for image URLs...\n");

const allUrls = new Set();

for (const file of files) {
  const content = readFileSync(file, "utf-8");
  const year = getYearFromFile(file);

  // Find all image URLs
  const urls = new Set();
  for (const match of content.matchAll(imageUrlRegex)) {
    urls.add(match[0]);
  }
  for (const match of content.matchAll(googlePhotosRegex)) {
    urls.add(match[0]);
  }
  for (const match of content.matchAll(wpContentRegex)) {
    if (!urls.has(match[0])) urls.add(match[0]);
  }

  for (const url of urls) {
    if (!urlMap.has(url)) {
      const filename = sanitizeFilename(url);
      const localDir = `${IMAGES_DIR}/${year}`;
      let localPath = `${localDir}/${filename}`;

      // Handle duplicates by appending hash
      if ([...urlMap.values()].includes(localPath)) {
        const hash = createHash("md5").update(url).digest("hex").slice(0, 6);
        const ext = extname(filename);
        const base = basename(filename, ext);
        localPath = `${localDir}/${base}-${hash}${ext}`;
      }

      urlMap.set(url, localPath);
    }
    allUrls.add(url);
  }
}

console.log(`Found ${allUrls.size} unique image URLs to migrate.\n`);

// Phase 2: Download images
console.log("Phase 2: Downloading images...\n");

let downloaded = 0;
let failed = 0;
const failedUrls = new Set();

for (const [url, localPath] of urlMap) {
  const dir = localPath.substring(0, localPath.lastIndexOf("/"));
  mkdirSync(dir, { recursive: true });

  if (existsSync(localPath)) {
    console.log(`  SKIP (exists): ${localPath}`);
    downloaded++;
    continue;
  }

  const ok = await downloadImage(url, localPath);
  if (ok) {
    downloaded++;
    console.log(`  OK: ${localPath}`);
  } else {
    failed++;
    failedUrls.add(url);
    console.log(`  FAIL: ${url}`);
  }
}

console.log(`\nDownloaded: ${downloaded}, Failed: ${failed}\n`);

// Phase 3: Update blog post references
console.log("Phase 3: Updating blog post references...\n");

let filesUpdated = 0;

for (const file of files) {
  let content = readFileSync(file, "utf-8");
  let changed = false;

  for (const [url, localPath] of urlMap) {
    if (failedUrls.has(url)) continue;

    // Convert public/images/... to /images/... for the URL
    const webPath = localPath.replace(/^public/, "");

    if (content.includes(url)) {
      content = content.replaceAll(url, webPath);
      changed = true;
    }
  }

  if (changed) {
    writeFileSync(file, content, "utf-8");
    filesUpdated++;
  }
}

console.log(`Updated ${filesUpdated} blog post files.`);

if (failedUrls.size > 0) {
  console.log(`\n⚠ Failed URLs (likely dead links):`);
  for (const url of failedUrls) {
    console.log(`  - ${url}`);
  }
}

console.log("\nDone!");
