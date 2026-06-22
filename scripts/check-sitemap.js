import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const sitemapPath = join(process.cwd(), 'public', 'sitemap.xml');

console.log('🔍 Starting automatic Sitemap verification...');

if (!existsSync(sitemapPath)) {
  console.error(`❌ Error: sitemap.xml does not exist at path: ${sitemapPath}`);
  process.exit(1);
}

const content = readFileSync(sitemapPath, 'utf8');

// Basic XML structure checks
if (!content.startsWith('<?xml')) {
  console.error('❌ Error: sitemap.xml does not start with valid XML declaration.');
  process.exit(1);
}

if (!content.includes('<urlset') || !content.includes('</urlset>')) {
  console.error('❌ Error: sitemap.xml is missing <urlset> root tag wrappers.');
  process.exit(1);
}

// Regex to extract all <loc> content
const locRegex = /<loc>([\s\S]*?)<\/loc>/g;
let match;
const urls = [];

while ((match = locRegex.exec(content)) !== null) {
  urls.push(match[1].trim());
}

if (urls.length === 0) {
  console.error('❌ Error: No <loc> URLs were found in the sitemap.xml file.');
  process.exit(1);
}

console.log(`ℹ️ Found ${urls.length} URLs in the sitemap.`);

// Check website prefix safety and banned patterns on each loc URL
const expectedPrefix = 'https://modsdrive.pages.dev';
const bannedPatterns = ['run.app', 'ais-dev', 'localhost', '127.0.0.1', 'http://'];

for (const url of urls) {
  if (!url.startsWith(expectedPrefix)) {
    console.error(`❌ Error: URL does not start with the expected live domain: "${url}". Expected prefix: ${expectedPrefix}`);
    process.exit(1);
  }
  
  // Banned patterns check
  for (const pattern of bannedPatterns) {
    if (url.includes(pattern)) {
      console.error(`❌ Error: URL "${url}" contains prohibited pattern: "${pattern}"`);
      process.exit(1);
    }
  }

  // Check double slash (e.g. modsdrive.pages.dev//mod)
  if (url.includes('pages.dev//')) {
    console.error(`❌ Error: URL contains double slashes: "${url}"`);
    process.exit(1);
  }
}

console.log('✅ Success: Sitemap passed all verification steps with no issues!');
process.exit(0);
