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

// Generate placeholder image URL (use imgur or similar)
function getPlaceholderImage() {
  return {
    src: 'https://i.imgur.com/qEEldh5.jpeg',
    alt: 'Post image'
  };
}

// Build new frontmatter
function buildNewFrontmatter(oldFm) {
  const tags = oldFm.categories || ['life'];
  
  return {
    draft: false,
    featured: 'none',
    title: oldFm.title || 'Untitled',
    description: oldFm.description || '',
    authors: ['Tommy Falgout'],
    pubDate: oldFm.pubDate || new Date().toISOString(),
    license: 'cc-by-nc-sa-4-0',
    tags: tags,
    image: getPlaceholderImage(),
    ogImage: getPlaceholderImage()
  };
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
    yaml += `  - life\n`;
  }
  yaml += `image:\n`;
  yaml += `  src: ${fm.image.src}\n`;
  yaml += `  alt: ${JSON.stringify(fm.image.alt)}\n`;
  yaml += `ogImage:\n`;
  yaml += `  src: ${fm.ogImage.src}\n`;
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
    
    const newFm = buildNewFrontmatter(parsed.fm);
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
