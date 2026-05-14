#!/usr/bin/env node
import fs from 'node:fs/promises';
import fsSync from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const markdownPath = process.argv[2];

if (!markdownPath) {
  process.exit(0);
}

const absoluteMarkdownPath = path.resolve(markdownPath);
const projectRoot = process.cwd();
const normalizedMarkdownPath = absoluteMarkdownPath.replace(/\\/g, '/');
const yearMatch = normalizedMarkdownPath.match(/\/src\/content\/blog\/(\d{4})\//);

if (!yearMatch) {
  process.exit(0);
}

const year = yearMatch[1];
const markdownDir = path.dirname(absoluteMarkdownPath);
const destinationDir = path.join(projectRoot, 'public', 'images', year);
const MAX_WIDTH = 2200;
const JPEG_QUALITY = 82;
const PNG_QUALITY = 82;
const WEBP_QUALITY = 80;

if (!fsSync.existsSync(absoluteMarkdownPath)) {
  process.exit(0);
}

const markdown = await fs.readFile(absoluteMarkdownPath, 'utf8');
const imageRegex = /!\[([^\]]*)\]\(([^)\s]+)(\s+"[^"]*")?\)/g;
let changed = false;
const resolvedUrlCache = new Map();

function isRelocatableUrl(url) {
  return !(
    url.startsWith('http://') ||
    url.startsWith('https://') ||
    url.startsWith('data:') ||
    url.startsWith('#') ||
    url.startsWith('/images/') ||
    url.startsWith('/')
  );
}

function isAbsoluteImagesUrl(url) {
  return url.startsWith('/images/');
}

async function nextAvailablePath(targetPath) {
  if (!fsSync.existsSync(targetPath)) {
    return targetPath;
  }

  const dir = path.dirname(targetPath);
  const ext = path.extname(targetPath);
  const stem = path.basename(targetPath, ext);

  let i = 2;
  while (true) {
    const candidate = path.join(dir, `${stem}-${i}${ext}`);
    if (!fsSync.existsSync(candidate)) {
      return candidate;
    }
    i += 1;
  }
}

function isHeicLike(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return ext === '.heic' || ext === '.heif';
}

function extensionForOutput(sourcePath) {
  const ext = path.extname(sourcePath).toLowerCase();
  if (ext === '.heic' || ext === '.heif' || ext === '.jpeg') {
    return '.jpg';
  }
  if (ext === '.jpg' || ext === '.png' || ext === '.webp' || ext === '.avif') {
    return ext;
  }
  return ext;
}

function isCompressibleRaster(sourcePath) {
  const ext = path.extname(sourcePath).toLowerCase();
  return ['.heic', '.heif', '.jpg', '.jpeg', '.png', '.webp', '.avif'].includes(ext);
}

async function optimizeAndMoveImage(sourcePath, outputDir) {
  const sourceExt = path.extname(sourcePath).toLowerCase();
  const sourceStem = path.basename(sourcePath, sourceExt);
  const outputExt = extensionForOutput(sourcePath);
  const targetBasePath = path.join(outputDir, `${sourceStem}${outputExt}`);
  const targetPath = await nextAvailablePath(targetBasePath);

  if (!isCompressibleRaster(sourcePath)) {
    await fs.rename(sourcePath, targetPath);
    return targetPath;
  }

  let transformer = sharp(sourcePath, { animated: true })
    .rotate()
    .resize({ width: MAX_WIDTH, withoutEnlargement: true });

  if (outputExt === '.jpg') {
    transformer = transformer.jpeg({ quality: JPEG_QUALITY, progressive: true, mozjpeg: true });
  } else if (outputExt === '.png') {
    transformer = transformer.png({ quality: PNG_QUALITY, compressionLevel: 9, adaptiveFiltering: true, palette: true });
  } else if (outputExt === '.webp') {
    transformer = transformer.webp({ quality: WEBP_QUALITY });
  } else if (outputExt === '.avif') {
    transformer = transformer.avif({ quality: WEBP_QUALITY });
  }

  await transformer.toFile(targetPath);

  if (path.resolve(sourcePath) !== path.resolve(targetPath) && fsSync.existsSync(sourcePath)) {
    await fs.unlink(sourcePath);
  }

  return targetPath;
}

const matches = [...markdown.matchAll(imageRegex)];
let rebuilt = '';
let cursor = 0;

for (const match of matches) {
  const full = match[0];
  const alt = match[1];
  const rawUrl = match[2];
  const titlePart = match[3] || '';
  const url = decodeURIComponent(rawUrl);
  const start = match.index ?? 0;
  const end = start + full.length;

  rebuilt += markdown.slice(cursor, start);

  let replacement = full;

  if (resolvedUrlCache.has(url)) {
    const cachedUrl = resolvedUrlCache.get(url);
    replacement = `![${alt}](${cachedUrl}${titlePart || ''})`;
    rebuilt += replacement;
    cursor = end;
    changed = changed || replacement !== full;
    continue;
  }

  if (isAbsoluteImagesUrl(url) && isHeicLike(url)) {
    const absolutePublicPath = path.join(projectRoot, 'public', url.replace(/^\//, ''));
    if (fsSync.existsSync(absolutePublicPath)) {
      await fs.mkdir(path.dirname(absolutePublicPath), { recursive: true });
      const convertedPath = await optimizeAndMoveImage(absolutePublicPath, path.dirname(absolutePublicPath));
      const newUrl = `/images/${year}/${path.basename(convertedPath)}`;
      replacement = `![${alt}](${newUrl}${titlePart || ''})`;
      resolvedUrlCache.set(url, newUrl);
      changed = true;
    }
    rebuilt += replacement;
    cursor = end;
    continue;
  }

  if (!isRelocatableUrl(url)) {
    rebuilt += replacement;
    cursor = end;
    continue;
  }

  const sourcePath = path.resolve(markdownDir, url);
  if (!fsSync.existsSync(sourcePath)) {
    rebuilt += replacement;
    cursor = end;
    continue;
  }

  await fs.mkdir(destinationDir, { recursive: true });
  const finalTargetPath = await optimizeAndMoveImage(sourcePath, destinationDir);
  const newUrl = `/images/${year}/${path.basename(finalTargetPath)}`;
  resolvedUrlCache.set(url, newUrl);
  changed = true;
  replacement = `![${alt}](${newUrl}${titlePart || ''})`;

  rebuilt += replacement;
  cursor = end;
}

rebuilt += markdown.slice(cursor);

if (changed) {
  await fs.writeFile(absoluteMarkdownPath, rebuilt, 'utf8');
}
