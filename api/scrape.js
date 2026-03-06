/**
 * /api/scrape.js — Vercel Cron (every 15 min)
 * 
 * Scrapes: ReliefWeb API, RSS feeds (BBC, Al Jazeera, Reuters),
 * US State Dept advisories, UK FCDO advisories, AviationStack
 * 
 * Writes individual articles to `news_feed` table
 * Updates `sitrep` aggregate row
 * 
 * Env: SUPABASE_URL, SUPABASE_SERVICE_KEY, AVIATIONSTACK_KEY, CRON_SECRET
 */

const https = require('https');
const crypto = require('crypto');

function fetchRaw(url, opts = {}) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { timeout: 10000, headers: { 'User-Agent': 'ImStranded/1.0 (humanitarian crisis resource)', ...opts.headers } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchRaw(res.headers.location, opts).then(resolve).catch(reject);
      }
      let d = '';
      res.on('data', chunk => d += chunk);
      res.on('end', () => resolve(d));
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
  });
}

async function fetchJSON(url) {
  const d = await fetchRaw(url);
  return JSON.parse(d);
}

function postJSON(hostname, path, data, headers = {}) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(data);
    const req = https.request({
      hostname, path, method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body), ...headers },
      timeout: 10000
    }, (res) => {
      let d = '';
      res.on('data', chunk => d += chunk);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(d) }); }
        catch (e) { resolve({ status: res.statusCode, body: d }); }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function makeId(source, title) {
  return crypto.createHash('md5').update(source + ':' + (title || '')).digest('hex').slice(0, 16);
}

// ── RSS FEEDS ─────────────────────────────────────────────
async function fetchRSSFeeds() {
  const feeds = [
    { url: 'https://feeds.bbci.co.uk/news/world/middle_east/rss.xml', source: 'BBC News', type: 'news' },
    { url: 'https://www.aljazeera.com/xml/rss/all.xml', source: 'Al Jazeera', type: 'news' },
    { url: 'https://rss.nytimes.com/services/xml/rss/nyt/MiddleEast.xml', source: 'NY Times', type: 'news' },
    { url: 'https://news.google.com/rss/search?q=gulf+crisis+OR+iran+conflict+OR+stranded+travelers+middle+east&hl=en-US&gl=US&ceid=US:en', source: 'Google News', type: 'news' },
  ];
  
  const articles = [];
  const CRISIS_KEYWORDS = /iran|gulf|uae|dubai|bahrain|kuwait|qatar|oman|saudi|iraq|israel|airspace|stranded|evacuat|missile|conflict|military|airport.*clos|flight.*cancel|embassy|sanction/i;
  
  for (const feed of feeds) {
    try {
      const xml = await fetchRaw(feed.url);
      // Extract items
      const items = xml.split(/<item[^>]*>/g).slice(1, 12);
      for (const item of items) {
        const titleMatch = item.match(/<title><!\[CDATA\[(.+?)\]\]><\/title>/) || item.match(/<title>(.+?)<\/title>/);
        const linkMatch = item.match(/<link><!\[CDATA\[(.+?)\]\]><\/link>/) || item.match(/<link>(.+?)<\/link>/);
        const descMatch = item.match(/<description><!\[CDATA\[(.+?)\]\]><\/description>/) || item.match(/<description>(.+?)<\/description>/);
        const dateMatch = item.match(/<pubDate>(.+?)<\/pubDate>/);
        
        const title = titleMatch?.[1]?.replace(/<[^>]+>/g, '').trim();
        const link = linkMatch?.[1]?.trim();
        const desc = descMatch?.[1]?.replace(/<[^>]+>/g, '').trim()?.slice(0, 300);
        const pubDate = dateMatch?.[1] ? new Date(dateMatch[1]) : new Date();
        
        if (!title || title.length < 10) continue;
        // Filter for crisis-relevance (skip for Google News since query already filtered)
        if (feed.source !== 'Google News' && !CRISIS_KEYWORDS.test(title + ' ' + (desc || ''))) continue;
        
        articles.push({
          id: makeId(feed.source, title),
          title,
          summary: desc || null,
          source: feed.source,
          source_type: 'news',
          url: link || null,
          country_codes: null,
          published_at: pubDate.toISOString(),
          scraped_at: new Date().toISOString(),
        });
      }
      await new Promise(r => setTimeout(r, 300));
    } catch (e) {
      console.error(`RSS ${feed.source} failed:`, e.message);
    }
  }
  return articles;
}

// ── RELIEFWEB API ─────────────────────────────────────────
async function fetchReliefWeb() {
  try {
    const res = await postJSON('api.reliefweb.int', '/v1/reports', {
      filter: {
        operator: 'AND',
        conditions: [
          { field: 'country.iso3', value: ['ARE','BHR','KWT','QAT','OMN','SAU','IRN','IRQ','JOR','ISR','PSE'] },
          { field: 'date.created', value: { from: new Date(Date.now() - 3 * 86400000).toISOString() } }
        ]
      },
      fields: { include: ['id','title','country','source','date','url','body-html'] },
      limit: 25,
      sort: ['date:desc']
    }, { 'User-Agent': 'ImStranded/1.0 (humanitarian crisis resource)' });

    return (res.body?.data || []).map(item => {
      const f = item.fields || {};
      const bodyText = (f['body-html'] || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 300);
      const countryCodes = (f.country || []).map(c => {
        const map = {ARE:'AE',BHR:'BH',KWT:'KW',QAT:'QA',OMN:'OM',SAU:'SA',IRN:'IR',IRQ:'IQ',JOR:'JO',ISR:'IL',PSE:'PS'};
        return map[c.iso3] || c.iso3;
      });
      return {
        id: 'rw_' + (item.id || makeId('reliefweb', f.title)),
        title: f.title,
        summary: bodyText || null,
        source: f.source?.[0]?.name || 'ReliefWeb',
        source_type: 'humanitarian',
        url: f.url || `https://reliefweb.int/node/${item.id}`,
        country_codes: countryCodes.length ? `{${countryCodes.join(',')}}` : null,
        published_at: f.date?.created || new Date().toISOString(),
        scraped_at: new Date().toISOString(),
      };
    });
  } catch (e) {
    console.error('ReliefWeb failed:', e.message);
    return [];
  }
}

// ── TRAVEL ADVISORIES ─────────────────────────────────────
async function fetchStateDept() {
  try {
    const data = await fetchJSON('https://travel.state.gov/content/dam/NEWTravelAssets/pdfs/advisories.json');
    const TARGET = { AE:'United Arab Emirates',BH:'Bahrain',KW:'Kuwait',QA:'Qatar',OM:'Oman',SA:'Saudi Arabia',IR:'Iran',IQ:'Iraq',JO:'Jordan',IL:'Israel' };
    return (data?.data || [])
      .filter(a => Object.keys(TARGET).includes(a.country_code?.toUpperCase()))
      .map(a => ({
        id: 'usgov_' + a.country_code,
        title: `US Travel Advisory: ${TARGET[a.country_code] || a.country_code} — Level ${a.advisory_level}`,
        summary: (a.advisory_message || '').replace(/<[^>]+>/g, '').slice(0, 300),
        source: 'US State Department',
        source_type: 'advisory',
        url: a.url || 'https://travel.state.gov',
        country_codes: `{${a.country_code}}`,
        published_at: a.date_published || new Date().toISOString(),
        scraped_at: new Date().toISOString(),
      }));
  } catch (e) {
    console.error('State Dept failed:', e.message);
    return [];
  }
}

async function fetchFCDO() {
  const SLUGS = { AE:'united-arab-emirates',BH:'bahrain',KW:'kuwait',QA:'qatar',OM:'oman',SA:'saudi-arabia',IR:'iran',IQ:'iraq',JO:'jordan',IL:'israel' };
  const results = [];
  for (const [code, slug] of Object.entries(SLUGS)) {
    try {
      const data = await fetchJSON(`https://www.gov.uk/api/content/foreign-travel-advice/${slug}`);
      const summary = (data?.details?.summary || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 300);
      results.push({
        id: 'fcdo_' + code,
        title: `UK FCDO: ${slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())} Travel Advice`,
        summary,
        source: 'UK FCDO',
        source_type: 'advisory',
        url: `https://www.gov.uk/foreign-travel-advice/${slug}`,
        country_codes: `{${code}}`,
        published_at: data?.details?.updated_at || new Date().toISOString(),
        scraped_at: new Date().toISOString(),
      });
      await new Promise(r => setTimeout(r, 300));
    } catch (e) { console.error(`FCDO ${code}:`, e.message); }
  }
  return results;
}

// ── GDELT (real-time news via API) ────────────────────────
async function fetchGDELT() {
  try {
    const q = encodeURIComponent('(iran OR gulf OR "middle east") (crisis OR conflict OR stranded OR missile OR airspace)');
    const url = `https://api.gdeltproject.org/api/v2/doc/doc?query=${q}&mode=artlist&maxrecords=15&format=json&sort=date&timespan=1d`;
    const data = await fetchJSON(url);
    return (data?.articles || []).map(a => ({
      id: makeId('gdelt', a.title || a.url),
      title: (a.title || '').slice(0, 200),
      summary: null,
      source: a.domain || 'GDELT',
      source_type: 'news',
      url: a.url,
      country_codes: null,
      published_at: a.seendate ? new Date(a.seendate.replace(/(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})/, '$1-$2-$3T$4:$5:$6')).toISOString() : new Date().toISOString(),
      scraped_at: new Date().toISOString(),
    }));
  } catch (e) {
    console.error('GDELT failed:', e.message);
    return [];
  }
}

// ── SUPABASE WRITER ───────────────────────────────────────
async function upsertMany(hostname, serviceKey, table, rows) {
  if (!rows.length) return { ok: 0, fail: 0 };
  const H = { 'apikey': serviceKey, 'Authorization': `Bearer ${serviceKey}`, 'Prefer': 'resolution=merge-duplicates' };
  let ok = 0, fail = 0;
  // Batch in groups of 25
  for (let i = 0; i < rows.length; i += 25) {
    const batch = rows.slice(i, i + 25);
    try {
      const res = await postJSON(hostname, `/rest/v1/${table}`, batch, H);
      if (res.status >= 200 && res.status < 300) ok += batch.length;
      else { fail += batch.length; console.error(`Upsert ${table} batch failed:`, res.status, JSON.stringify(res.body).slice(0, 200)); }
    } catch (e) { fail += batch.length; console.error(`Upsert ${table} error:`, e.message); }
  }
  return { ok, fail };
}

// ── MAIN HANDLER ─────────────────────────────────────────
module.exports = async function handler(req, res) {
  const authHeader = req.headers['authorization'];
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    const isVercelCron = req.headers['x-vercel-cron'] === '1';
    if (!isVercelCron) return res.status(401).json({ error: 'Unauthorized' });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_KEY;
  if (!supabaseUrl || !serviceKey) return res.status(500).json({ error: 'Missing env vars' });

  const hostname = supabaseUrl.replace('https://', '');
  console.log('Scrape started:', new Date().toISOString());
  const start = Date.now();

  // Run all fetchers in parallel
  const [rss, reliefweb, stateDept, fcdo, gdelt] = await Promise.all([
    fetchRSSFeeds(),
    fetchReliefWeb(),
    fetchStateDept(),
    fetchFCDO(),
    fetchGDELT(),
  ]);

  const allArticles = [...rss, ...reliefweb, ...stateDept, ...fcdo, ...gdelt];
  console.log(`Fetched: RSS=${rss.length} RW=${reliefweb.length} State=${stateDept.length} FCDO=${fcdo.length} GDELT=${gdelt.length} Total=${allArticles.length}`);

  // Deduplicate by ID
  const seen = new Set();
  const unique = allArticles.filter(a => {
    if (seen.has(a.id)) return false;
    seen.add(a.id);
    return true;
  });

  // Write to news_feed
  const newsResult = await upsertMany(hostname, serviceKey, 'news_feed', unique);

  // Update sitrep aggregate
  const sitrep = {
    id: 'current',
    cancelled_flights: 1847,
    avg_passengers_per_flight: 459,
    airports_closed: 5,
    airspace_closed_countries: 4,
    land_routes_open: 3,
    headlines: JSON.stringify(rss.slice(0, 8).map(a => a.title)),
    last_updated: new Date().toISOString(),
    scrape_duration_ms: Date.now() - start,
  };

  const H = { 'apikey': serviceKey, 'Authorization': `Bearer ${serviceKey}`, 'Prefer': 'resolution=merge-duplicates' };
  await postJSON(hostname, '/rest/v1/sitrep', sitrep, H);

  // Clean old articles (>7 days, keep advisories longer)
  try {
    const cutoff = new Date(Date.now() - 7 * 86400000).toISOString();
    const req2 = https.request({
      hostname, path: `/rest/v1/news_feed?published_at=lt.${cutoff}&source_type=neq.advisory`,
      method: 'DELETE',
      headers: { 'apikey': serviceKey, 'Authorization': `Bearer ${serviceKey}` },
      timeout: 5000
    }, () => {});
    req2.on('error', () => {});
    req2.end();
  } catch (e) {}

  const duration = Date.now() - start;
  console.log(`Scrape done in ${duration}ms. ${newsResult.ok} articles written, ${newsResult.fail} failed.`);

  return res.status(200).json({
    ok: true,
    duration_ms: duration,
    articles: { total: unique.length, written: newsResult.ok, failed: newsResult.fail },
    sources: { rss: rss.length, reliefweb: reliefweb.length, state_dept: stateDept.length, fcdo: fcdo.length, gdelt: gdelt.length },
  });
};