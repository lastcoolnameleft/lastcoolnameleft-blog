#!/usr/bin/env node
// optimize-paste-image.mjs
// Usage: node scripts/optimize-paste-image.mjs [image-path] <markdown-file> <caret-line>
// - Converts pasted images to JPEG, resizes, compresses, moves to public/images/<year>, and rewrites the markdown reference

import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';

const args = process.argv.slice(2);
if (args.length < 2 || args.length > 3) {
  console.error('Usage: node scripts/optimize-paste-image.mjs [image-path] <markdown-file> <caret-line>');
  process.exit(1);
}

let imagePath;
let markdownFile;
let caretLineArg;

if (args.length === 3) {
  [imagePath, markdownFile, caretLineArg] = args;
} else {
  [markdownFile, caretLineArg] = args;
}


const caretLine = parseInt(caretLineArg, 10);
const year = new Date().getFullYear();
const imagesDir = path.resolve('public/images', String(year));
await fs.mkdir(imagesDir, { recursive: true });

let md = await fs.readFile(markdownFile, 'utf8');
const lines = md.split(/\r?\n/);

function isLocalImageTarget(target) {
  return target && !target.startsWith('/') && !target.startsWith('http://') && !target.startsWith('https://');
}

function extractLocalImageTargets(line) {
  const matches = [...line.matchAll(/\(([^)]+)\)/g)];
  return matches
    .map((match) => match[1].trim())
    .filter(isLocalImageTarget);
}

function preferSourceTarget(targets) {
  if (targets.length === 0) {
    return null;
  }

  const preferred = targets.find((target) => /\.(heic|heif|png|jpe?g|webp|avif)$/i.test(target) && !/\.png$/i.test(target));
  return preferred ?? targets[0];
}

function unique(values) {
  return [...new Set(values)];
}

let matchedLineIndex = -1;
let localTargetsOnMatchedLine = [];

if (!imagePath) {
  let detectedTargets = [];

  if (caretLine >= 0 && caretLine < lines.length) {
    detectedTargets = extractLocalImageTargets(lines[caretLine]);
    if (detectedTargets.length > 0) {
      matchedLineIndex = caretLine;
      localTargetsOnMatchedLine = detectedTargets;
    }
  }

  if (detectedTargets.length === 0) {
    for (let index = Math.min(caretLine, lines.length - 1); index >= 0; index -= 1) {
      detectedTargets = extractLocalImageTargets(lines[index]);
      if (detectedTargets.length > 0) {
        matchedLineIndex = index;
        localTargetsOnMatchedLine = detectedTargets;
        break;
      }
    }
  }

  if (detectedTargets.length === 0) {
    console.error('Could not find a local pasted image reference near the caret line. Save the markdown file first, then run the task again with the cursor on or below the pasted image line.');
    process.exit(1);
  }

  imagePath = path.resolve(path.dirname(markdownFile), preferSourceTarget(detectedTargets));
  console.log('Auto-detected local imagePath:', imagePath);
  console.log('All local targets on matched line:', detectedTargets);
}

if (matchedLineIndex === -1) {
  const resolvedImagePath = path.resolve(imagePath);
  for (let index = 0; index < lines.length; index += 1) {
    const detectedTargets = extractLocalImageTargets(lines[index]);
    const resolvedTargets = detectedTargets.map((target) => path.resolve(path.dirname(markdownFile), target));
    if (resolvedTargets.includes(resolvedImagePath)) {
      matchedLineIndex = index;
      localTargetsOnMatchedLine = detectedTargets;
      break;
    }
  }
}

let ext = path.extname(imagePath).toLowerCase();
let baseName = path.basename(imagePath, ext);
let outExt = '.jpg';
let outName = `${baseName}-${Date.now()}${outExt}`;
let outPath = path.join(imagesDir, outName);

console.log('--- optimize-paste-image.mjs LOG ---');
console.log('Working directory:', process.cwd());
console.log('Input imagePath:', imagePath);
console.log('Output imagesDir:', imagesDir);
console.log('Output outPath:', outPath);
console.log('Markdown file:', markdownFile);
console.log('Caret line:', caretLine);

try {
  await sharp(imagePath)
    .jpeg({ quality: 80 })
    .resize({ width: 1600, withoutEnlargement: true })
    .toFile(outPath);
  console.log('Image converted and written to:', outPath);
} catch (err) {
  console.error('Error during image conversion:', err);
  process.exit(2);
}

// Remove the original image if it is not the output file
if (path.resolve(imagePath) !== path.resolve(outPath)) {
  try {
    await fs.unlink(imagePath);
    console.log('Original image deleted:', imagePath);
  } catch (err) {
    console.warn('Could not delete original image:', imagePath, err);
  }
}

const astroPath = `/images/${year}/${outName}`;
const embed = `![](${astroPath})`;

// Replace the pasted local image reference when present; otherwise insert at caret line.
if (matchedLineIndex !== -1 && localTargetsOnMatchedLine.length > 0) {
  lines[matchedLineIndex] = embed;
  md = lines.join('\n');
  console.log('Replaced pasted markdown line at index:', matchedLineIndex);
  console.log('Replaced local targets:', localTargetsOnMatchedLine);
} else {
  lines.splice(caretLine, 0, embed);
  md = lines.join('\n');
  console.log('Inserted markdown image reference at line:', caretLine);
}

await fs.writeFile(markdownFile, md);

for (const target of unique(localTargetsOnMatchedLine)) {
  const targetPath = path.resolve(path.dirname(markdownFile), target);
  if (targetPath === path.resolve(imagePath) || targetPath === path.resolve(outPath)) {
    continue;
  }

  try {
    await fs.unlink(targetPath);
    console.log('Deleted additional local image file:', targetPath);
  } catch (err) {
    console.warn('Could not delete additional local image file:', targetPath, err);
  }
}

console.log(`Image processed and inserted: ${astroPath}`);
