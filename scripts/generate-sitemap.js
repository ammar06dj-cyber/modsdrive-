import { writeFileSync } from 'fs';
import { execSync } from 'child_process';

function normalizeBaseUrl(url) {
  let raw = url ? String(url).trim() : "";
  if (!raw) {
    return 'https://modsdrive.pages.dev';
  }

  // Remove final slashes
  raw = raw.replace(/\/+$/, '');

  // Must start with https://
  if (!raw.startsWith('https://')) {
    console.warn(`⚠️ Warning: Base URL "${raw}" does not start with https://. Falling back to production default: https://modsdrive.pages.dev`);
    return 'https://modsdrive.pages.dev';
  }

  // Must not contain banned keywords
  const bannedKeywords = ['run.app', 'ais-dev', 'localhost', '127.0.0.1', 'http://'];
  for (const pattern of bannedKeywords) {
    if (raw.includes(pattern)) {
      console.warn(`⚠️ Warning: Base URL "${raw}" contains prohibited pattern "${pattern}". Falling back to production default: https://modsdrive.pages.dev`);
      return 'https://modsdrive.pages.dev';
    }
  }

  return raw;
}

const rawAppUrl = process.env.APP_URL || '';
const baseUrl = normalizeBaseUrl(rawAppUrl);
console.log(`ℹ️ Normalized Base URL for sitemap: ${baseUrl}`);

let SEED_MODS = [];
try {
  // Execute tsx on the fly to import SEED_MODS from supabaseClient.ts and output it as JSON
  const modsJson = execSync(
    'npx tsx -e "import { SEED_MODS } from \'./src/supabaseClient.ts\'; console.log(JSON.stringify(SEED_MODS))"',
    { encoding: 'utf-8' }
  );
  SEED_MODS = JSON.parse(modsJson);
} catch (error) {
  console.error("⚠️ Failed to load SEED_MODS using tsx, falling back to empty list:", error);
}

const staticUrls = [
  { loc: `${baseUrl}/`, priority: '1.0', changefreq: 'daily' },
  { loc: `${baseUrl}/privacy-policy`, priority: '0.3', changefreq: 'monthly' },
];

const modUrls = SEED_MODS.map(mod => ({
  loc: `${baseUrl}/mod/${mod.id}`,
  priority: '0.8',
  changefreq: 'weekly',
  lastmod: mod.created_at ? new Date(mod.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
}));

const rawUrls = [...staticUrls, ...modUrls];

const allUrls = rawUrls.filter(url => {
  const loc = url.loc;
  if (!loc || typeof loc !== 'string') return false;
  
  // Rule checks
  if (
    loc.includes('run.app') ||
    loc.includes('ais-dev') ||
    loc.includes('localhost') ||
    loc.includes('127.0.0.1') ||
    loc.startsWith('http://')
  ) {
    console.warn(`⚠️ Warning: Excluded invalid url from sitemap: ${loc}`);
    return false;
  }
  
  if (!loc.startsWith('https://modsdrive.pages.dev')) {
    console.warn(`⚠️ Warning: URL does not match production domain: ${loc}`);
  }

  return true;
});

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls.map(url => `  <url>
    <loc>${url.loc}</loc>
    ${url.lastmod ? `<lastmod>${url.lastmod}</lastmod>` : ''}
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

writeFileSync('./public/sitemap.xml', sitemap);
console.log(`✅ Generated sitemap with ${allUrls.length} URLs inside /public/sitemap.xml`);
