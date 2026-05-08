#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const blogDir = path.join(__dirname, '../src/content/blog');

// Helper to parse YAML frontmatter
function parseFrontmatter(content) {
  const lines = content.split('\n');
  if (lines[0] !== '---') return null;
  
  let endIdx = -1;
  for (let i = 1; i < lines.length; i++) {
    if (lines[i] === '---') {
      endIdx = i;
      break;
    }
  }
  
  if (endIdx === -1) return null;
  
  const fmLines = lines.slice(1, endIdx);
  const fm = {};
  
  for (const line of fmLines) {
    if (!line.trim()) continue;
    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) continue;
    
    const key = line.substring(0, colonIdx).trim();
    const value = line.substring(colonIdx + 1).trim();
    
    if (key === 'categories') {
      // Will handle array parsing specially
      fm.categories = [];
    } else if (key.startsWith('  -')) {
      // Category item in array
      fm.categories.push(value);
    } else if (key === 'pubDate') {
      fm.pubDate = value.replace(/'/g, '');
    } else {
      fm[key] = value.replace(/^['"]|['"]$/g, '');
    }
  }
  
  const body = lines.slice(endIdx + 1).join('\n').trim();
  
  return { fm, body };
}

// Extract first image URL from markdown body
function extractFirstImage(body) {
  // Match markdown images: ![alt](url)
  const mdMatch = body.match(/!\[([^\]]*)\]\((https?:\/\/[^)]+)\)/);
  if (mdMatch) {
    return { src: mdMatch[2], alt: mdMatch[1] || 'Post image' };
  }
  // Match HTML img tags: <img src="url" ...>
  const htmlMatch = body.match(/<img[^>]+src=["'](https?:\/\/[^"']+)["'][^>]*>/);
  if (htmlMatch) {
    const altMatch = htmlMatch[0].match(/alt=["']([^"']*)["']/);
    return { src: htmlMatch[1], alt: altMatch ? altMatch[1] : 'Post image' };
  }
  return null;
}

// Build new frontmatter
function buildNewFrontmatter(oldFm, body) {
  const tags = oldFm.categories || ['personal'];
  const image = extractFirstImage(body);
  
  const fm = {
    draft: false,
    featured: 'none',
    title: oldFm.title || 'Untitled',
    description: oldFm.description || '',
    authors: ['Tommy Falgout'],
    pubDate: oldFm.pubDate || new Date().toISOString(),
    license: 'cc-by-nc-sa-4-0',
    tags: tags,
  };

  if (image) {
    fm.image = image;
    fm.ogImage = image;
  }

  return fm;
}

// Format YAML frontmatter
function formatFrontmatter(fm) {
  let yaml = '---\n';
  
  // Ensure description is not empty
  const description = fm.description && fm.description.trim() ? fm.description : 'A post by Tommy Falgout';
  
  // Add fields in order
  yaml += `draft: ${fm.draft}\n`;
  yaml += `featured: "${fm.featured}"\n`;
  yaml += `title: ${JSON.stringify(fm.title)}\n`;
  yaml += `description: ${JSON.stringify(description)}\n`;
  yaml += `authors:\n`;
  fm.authors.forEach(author => {
    yaml += `  - ${author}\n`;
  });
  yaml += `pubDate: ${fm.pubDate}\n`;
  yaml += `license: ${fm.license}\n`;
  yaml += `tags:\n`;
  if (fm.tags && fm.tags.length > 0) {
    fm.tags.forEach(tag => {
      yaml += `  - ${tag}\n`;
    });
  } else {
    yaml += `  - personal\n`;
  }
  if (fm.image) {
    yaml += `image:\n`;
    yaml += `  src: ${fm.image.src}\n`;
    yaml += `  alt: ${JSON.stringify(fm.image.alt)}\n`;
  }
  if (fm.ogImage) {
    yaml += `ogImage:\n`;
    yaml += `  src: ${fm.ogImage.src}\n`;
  }
  yaml += '---\n';
  
  return yaml;
}

// Process a single file
function migrateFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const parsed = parseFrontmatter(content);
    
    if (!parsed) {
      console.warn(`⚠️  Could not parse: ${filePath}`);
      return false;
    }
    
    const newFm = buildNewFrontmatter(parsed.fm, parsed.body);
    const newContent = formatFrontmatter(newFm) + parsed.body;
    
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`✓ ${path.relative(blogDir, filePath)}`);
    return true;
  } catch (error) {
    console.error(`✗ ${filePath}: ${error.message}`);
    return false;
  }
}

// Recursively process all MD files
function migrateBlog() {
  const files = [];
  
  function walk(dir) {
    const items = fs.readdirSync(dir);
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        walk(fullPath);
      } else if (item.endsWith('.md')) {
        files.push(fullPath);
      }
    }
  }
  
  walk(blogDir);
  
  console.log(`\n📝 Migrating ${files.length} posts to Basic Blog schema...\n`);
  
  let successCount = 0;
  for (const file of files) {
    if (migrateFile(file)) successCount++;
  }
  
  console.log(`\n✅ Migration complete: ${successCount}/${files.length} posts migrated\n`);
}

migrateBlog();
