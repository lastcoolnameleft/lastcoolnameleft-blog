import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const blogDir = path.join(__dirname, '../src/content/blog');

function convertDateToISO(dateStr) {
  const date = new Date(dateStr);
  return date.toISOString().split('T')[0];
}

let migrated = 0;

function migrateFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  
  if (!match) return;
  
  const frontmatter = match[1];
  const body = content.slice(match[0].length);
  
  // Parse old frontmatter
  const oldFrontmatter = {};
  frontmatter.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split(':');
    if (key) {
      oldFrontmatter[key.trim()] = valueParts.join(':').trim().replace(/^['"]|['"]$/g, '');
    }
  });
  
  // Map to Fuwari schema
  const newFrontmatter = {
    title: oldFrontmatter.title || 'Untitled',
    published: convertDateToISO(oldFrontmatter.pubDate || new Date().toISOString()),
    description: oldFrontmatter.description || '',
    draft: false,
    tags: [],
    category: '',
    image: '',
  };
  
  // Build new frontmatter
  let newFront = '---\n';
  newFront += `title: "${newFrontmatter.title}"\n`;
  newFront += `published: ${newFrontmatter.published}\n`;
  if (newFrontmatter.description) {
    newFront += `description: "${newFrontmatter.description}"\n`;
  }
  newFront += `draft: ${newFrontmatter.draft}\n`;
  newFront += `tags: []\n`;
  newFront += `category: ""\n`;
  newFront += `image: ""\n`;
  newFront += '---\n';
  
  const newContent = newFront + body;
  fs.writeFileSync(filePath, newContent);
  migrated++;
}

// Recursively migrate all blog posts
function walkDir(dir) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      walkDir(filePath);
    } else if (file.endsWith('.md')) {
      migrateFile(filePath);
    }
  });
}

walkDir(blogDir);
console.log(`Migrated ${migrated} files to Fuwari schema`);
