import { writeFileSync } from 'fs';
import { execSync } from 'child_process';

const baseUrl = process.env.APP_URL || 'https://modsdrive.pages.dev';

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

const allUrls = [...staticUrls, ...modUrls];

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
