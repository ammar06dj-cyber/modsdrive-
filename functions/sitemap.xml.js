export async function onRequest(context) {
  const url = new URL('/sitemap.xml', context.request.url);
  const response = await context.env.ASSETS.fetch(url);
  const body = await response.text();
  
  return new Response(body, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
