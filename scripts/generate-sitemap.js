import { writeFileSync } from 'fs';
import { execSync } from 'child_process';

let rawAppUrl = process.env.APP_URL || '';
let baseUrl = 'https://modsdrive.pages.dev';

if (rawAppUrl) {
  let parsedUrl = rawAppUrl.trim().replace(/\/+$/, '');
  
  if (
    parsedUrl.startsWith('https://') &&
    !parsedUrl.includes('run.app') &&
    !parsedUrl.includes('ais-dev') &&
    !parsedUrl.includes('localhost') &&
    !parsedUrl.includes('127.0.0.1')
  ) {
    baseUrl = parsedUrl;
    console.log(`ℹ️ Base URL configured from APP_URL: ${baseUrl}`);
  } else {
    console.warn(`⚠️ Warning: APP_URL "${rawAppUrl}" is a development/preview or invalid URL. Falling back to production default: https://modsdrive.pages.dev`);
  }
} else {
  console.log(`ℹ️ APP_URL environment variable is not defined. Using default base URL: ${baseUrl}`);
}

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
