// Vercel Edge Middleware — Dynamic OG tags for social media crawlers
// Intercepts crawler requests, reads ?pet=, ?airport=, ?room= params,
// fetches data from Supabase, returns HTML with dynamic OG meta tags.
// Real users pass through to the normal SPA.

const SUPABASE_URL  = process.env.SUPABASE_URL;
const SUPABASE_ANON = process.env.SUPABASE_ANON;
const SITE_URL      = 'https://help.imstranded.org';
const DEFAULT_IMG   = SITE_URL + '/og-default.png';

// Social media crawler user-agent patterns
const CRAWLER_RE = /facebookexternalhit|Facebot|Twitterbot|LinkedInBot|WhatsApp|TelegramBot|Slackbot|Discordbot|Pinterestbot|redditbot|Applebot|bingbot|Googlebot/i;

export const config = {
  matcher: '/',
};

export default async function middleware(request) {
  const ua = request.headers.get('user-agent') || '';

  // Only intercept social media crawlers
  if (!CRAWLER_RE.test(ua)) {
    return; // pass through to normal page
  }

  const url = new URL(request.url);
  const petId     = url.searchParams.get('pet');
  const airportId = url.searchParams.get('airport');
  const roomId    = url.searchParams.get('room');

  let title       = 'Stranded — But Not Alone.';
  let description = 'Live crisis map: 25M+ people impacted by the Gulf conflict. Find spare rooms, help stranded pets, connect with embassies. Real-time mutual aid.';
  let image       = DEFAULT_IMG;
  let pageUrl     = SITE_URL;

  try {
    // ── Pet deep link ──
    if (petId) {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/stranded_pets?id=eq.${petId}&select=pet_name,animal_type,pet_status,location,description,photo_url,name&limit=1`,
        { headers: { apikey: SUPABASE_ANON, Authorization: `Bearer ${SUPABASE_ANON}` } }
      );
      const data = await res.json();
      const p = data?.[0];
      if (p) {
        const type = (p.animal_type || 'Pet').charAt(0).toUpperCase() + (p.animal_type || 'pet').slice(1);
        const petName = p.pet_name || type;
        if (p.pet_status === 'can_foster') {
          title = `🐾 ${p.name || 'Someone'} can give a ${type.toLowerCase()} a home in ${p.location || 'the Gulf'}`;
          description = p.description || `This person is offering to take in a pet. See the live crisis map at ImStranded.org.`;
        } else {
          title = `🐾 ${petName} needs a home in ${p.location || 'the Gulf'}`;
          description = p.description || `${petName} is stranded and needs help. Can you take them in?`;
        }
        if (p.photo_url) image = p.photo_url;
        pageUrl = `${SITE_URL}/?pet=${petId}`;
      }
    }

    // ── Airport deep link ──
    else if (airportId) {
      const iata = airportId.toUpperCase();
      // Try to get disruption stats from airport_daily (cumulative since crisis start)
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/airport_daily?iata=eq.${iata}&select=cancelled&order=date.desc&limit=1`,
        { headers: { apikey: SUPABASE_ANON, Authorization: `Bearer ${SUPABASE_ANON}` } }
      );
      const data = await res.json();
      const cancelled = data?.[0]?.cancelled || 0;
      const estStranded = Math.round(cancelled * 185 * 0.2);
      title = `✈️ ${iata} — ${estStranded > 0 ? estStranded.toLocaleString() + ' estimated stranded' : 'Gulf Crisis Impact'}`;
      description = `See the live impact data for ${iata} airport. ${cancelled > 0 ? cancelled.toLocaleString() + ' flights cancelled since March 1.' : 'Real-time crisis map at ImStranded.org.'}`;
      pageUrl = `${SITE_URL}/?airport=${iata}`;
    }

    // ── Room deep link ──
    else if (roomId) {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/help_posts?id=eq.${roomId}&select=name,location,body&limit=1`,
        { headers: { apikey: SUPABASE_ANON, Authorization: `Bearer ${SUPABASE_ANON}` } }
      );
      const data = await res.json();
      const p = data?.[0];
      if (p) {
        title = `🏠 Spare room offered in ${p.location || 'the Gulf'}`;
        description = p.body ? p.body.slice(0, 200) : `${p.name || 'Someone'} is offering a spare room to stranded travelers. See the live crisis map.`;
        pageUrl = `${SITE_URL}/?room=${roomId}`;
      }
    }
  } catch (e) {
    // Fallback to defaults on any fetch error
    console.error('[middleware] OG fetch error:', e.message);
  }

  // Escape HTML entities
  const esc = s => (s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="ImStranded.org">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${esc(pageUrl)}">
<meta property="og:image" content="${esc(image)}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:site" content="@imstrandedorg">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(description)}">
<meta name="twitter:image" content="${esc(image)}">
<link rel="canonical" href="${esc(pageUrl)}">
</head>
<body>
<p>${esc(description)}</p>
<p><a href="${esc(pageUrl)}">View on ImStranded.org</a></p>
</body>
</html>`;

  return new Response(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=300, s-maxage=300',
    },
  });
}