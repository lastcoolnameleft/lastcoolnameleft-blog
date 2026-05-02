#!/usr/bin/env node
/**
 * Generate a report of broken image links in blog posts.
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from "fs";
import { join } from "path";

function walkDir(dir) {
  const results = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      results.push(...walkDir(full));
    } else if (full.endsWith(".md")) {
      results.push(full);
    }
  }
  return results;
}

const BLOG_DIR = "src/content/blog";

// Get all broken URLs from the migration run
const brokenUrls = [
  "http://photos.yahoo.com/bc/dstein36/vwp2?.tok=bcwEoGQB4kgMvsWD&.dir=/Jeromy+and+Cathy%27s+Wedding&.dnm=Jeromy+and+Cathy.jpg&.src=ph",
  "http://photos.yahoo.com/bc/dstein36/vwp2?.tok=bcwEoGQBPctoWRHL&.dir=/Jeromy+and+Cathy%27s+Wedding&.dnm=Locomotion%21.jpg&.src=ph",
  "http://photos17.flickr.com/22356323_db82de2159_m.jpg",
  "http://photos22.flickr.com/32296282_2daae4f4d5_m.jpg",
  "http://politicalhumor.about.com/library/graphics/bush_lordoftherings.jpg",
  "http://static.flickr.com/20/74025758_e4d055d783_m.jpg",
  "http://static.flickr.com/24/66817781_63ace59ea8_m.jpg",
  "http://static.flickr.com/54/127804886_d9242a22fc_m.jpg",
  "http://static.flickr.com/56/134302708_5100792957_m.jpg",
  "http://tommebay.lastcoolnameleft.com/images/boughtstuff.gif",
  "http://tommebay.lastcoolnameleft.com/images/gavestuff.gif",
  "http://us.ent4.yimg.com/movies.yahoo.com/images/hv/photo/movie_pix/regent/the_specials/_group_photos/kelly_coffield3.jpg",
  "http://us.ent4.yimg.com/movies.yahoo.com/images/hv/photo/movie_pix/regent/the_specials/_group_photos/sean_gunn6.jpg",
  "http://www.lastcoolnameleft.com/albums/album55/IMG_0278.thumb.jpg",
  "http://www.lastcoolnameleft.com/albums/album55/IMG_0295.thumb.jpg",
  "http://www.lastcoolnameleft.com/albums/album55/IMG_0302.thumb.jpg",
  "http://www.lastcoolnameleft.com/albums/album56/IMG_0316.thumb.jpg",
  "http://www.lastcoolnameleft.com/albums/Denver/IMG_0071.thumb.jpg",
  "http://www.lastcoolnameleft.com/albums/Denver/IMG_0110.thumb.jpg",
  "http://www.ul.com/turkeyfryers/imgs/fryerpic.jpg",
  "https://github.com/lastcoolnameleft/kubernetes-examples/blob/master/service/private-link-endpoint-service.svg",
  "https://m.rebrickable.com/media/cache/d6/cd/d6cd06631a7615cdb3eb144a1c831d59.jpg?1487482475.7118123",
  "https://raw.githubusercontent.com/lastcoolnameleft/kubernetes-examples/master/capi-capz/architecture.png",
  "https://raw.githubusercontent.com/lastcoolnameleft/kubernetes-examples/master/service/private-link-endpoint-service.svg",
];

const files = walkDir(BLOG_DIR);
const report = {};

for (const file of files) {
  const content = readFileSync(file, "utf-8");
  const relPath = file.replace(`${BLOG_DIR}/`, "");

  for (const url of brokenUrls) {
    if (content.includes(url)) {
      if (!report[relPath]) report[relPath] = [];
      report[relPath].push(url);
    }
  }
}

// Generate markdown report
let md = `# Broken Image Links\n\nGenerated: ${new Date().toISOString().split("T")[0]}\n\n`;
md += `These images could not be downloaded during the migration to local hosting.\n`;
md += `The original URLs are still in the post markdown but the images are dead.\n\n`;

const sortedFiles = Object.keys(report).sort();
md += `## Summary\n\n`;
md += `- **${sortedFiles.length}** posts affected\n`;
md += `- **${brokenUrls.length}** broken URLs total\n\n`;

md += `## By Post\n\n`;

for (const file of sortedFiles) {
  const title = file.replace(/\.md$/, "").split("/").pop().replace(/-/g, " ");
  md += `### ${file}\n\n`;
  for (const url of report[file]) {
    md += `- ${url}\n`;
  }
  md += `\n`;
}

md += `## By Source\n\n`;

const byHost = {};
for (const url of brokenUrls) {
  const host = url.split("/")[2];
  if (!byHost[host]) byHost[host] = [];
  byHost[host].push(url);
}

for (const [host, urls] of Object.entries(byHost).sort()) {
  md += `### ${host}\n\n`;
  for (const url of urls) {
    const files = sortedFiles.filter((f) => report[f].includes(url));
    md += `- ${url}\n`;
    for (const f of files) {
      md += `  - ${f}\n`;
    }
  }
  md += `\n`;
}

writeFileSync("broken-image-links.md", md);
console.log(`Report written to broken-image-links.md`);
