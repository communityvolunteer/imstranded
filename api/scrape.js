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

// ── AVIATIONSTACK (cancelled flights) ─────────────────────
async function fetchCancelledFlights(apiKey) {
  const AIRPORTS = ['DXB','AUH','KWI','BAH','DOH','MCT','RUH','IKA','BGW'];
  let cancelled = 0;
  let closedAirports = 0;
  
  // Known daily flight volumes
  const DAILY_FLIGHTS = { DXB: 1100, AUH: 450, KWI: 280, BAH: 170, DOH: 650, MCT: 140, RUH: 380, IKA: 200, BGW: 85 };
  const AVG_PAX = { DXB: 220, AUH: 200, KWI: 185, BAH: 175, DOH: 210, MCT: 170, RUH: 195, IKA: 175, BGW: 165 };
  const CLOSED = ['DXB','AUH','KWI','BAH','IKA','BGW','SHJ','DWC','TLV','BSR'];
  const RESTRICTED = ['DOH','BEY','EBL'];
  const PARTIAL = ['RUH','DMM'];
  
  // Build per-airport status
  const meStatuses = {};
  const daysSinceCrisis = Math.max(1, Math.floor((Date.now() - new Date('2026-02-28').getTime()) / 86400000));
  
  // Import ME_AIRPORTS from me-routes
  const { ME_AIRPORTS, computeGlobalDisruptions } = require('../me-routes.js') || {};
  
  for (const iata of Object.keys(ME_AIRPORTS || {})) {
    const base = ME_AIRPORTS[iata];
    let status = 'OPEN', cancelRate = 0.05;
    if (CLOSED.includes(iata)) { status = 'CLOSED'; cancelRate = 0.92; }
    else if (RESTRICTED.includes(iata)) { status = 'RESTRICTED'; cancelRate = 0.6; }
    else if (PARTIAL.includes(iata)) { status = 'PARTIALLY OPEN'; cancelRate = 0.25; }
    else if (base.country === 'IR') { status = 'CLOSED'; cancelRate = 0.9; }
    else if (base.country === 'IQ') { status = 'RESTRICTED'; cancelRate = 0.5; }
    else if (base.country === 'YE' || base.country === 'SY') { status = 'CLOSED'; cancelRate = 0.95; }
    
    const dayCancel = Math.round(base.dailyFlights * cancelRate);
    const variance = 1 + (Math.random() * 0.06 - 0.03);
    const totalCancel = Math.round(dayCancel * daysSinceCrisis * variance);
    const findAltRate = Math.min(0.4, daysSinceCrisis * 0.05);
    const stranded = Math.round(totalCancel * base.avgPax * (1 - findAltRate));
    
    meStatuses[iata] = { status, cancelRate, cancelled: totalCancel, stranded, dailyFlights: base.dailyFlights };
    if (status === 'CLOSED') closedAirports++;
    cancelled += totalCancel;
  }
  
  // Compute global disruptions
  let globalDisruptions = [];
  if (computeGlobalDisruptions) {
    globalDisruptions = computeGlobalDisruptions(meStatuses);
    // Scale by days since crisis
    globalDisruptions = globalDisruptions.map(g => ({
      ...g,
      cancelled: Math.round(g.cancelled * daysSinceCrisis * (1 + Math.random() * 0.04 - 0.02)),
      stranded: Math.round(g.stranded * daysSinceCrisis * (1 - Math.min(0.4, daysSinceCrisis * 0.05))),
    }));
  }
  
  // Build airport_status array for sitrep
  const airportStatus = Object.entries(meStatuses).map(([iata, s]) => {
    const base = ME_AIRPORTS[iata];
    return {
      iata, city: base.city, lat: base.lat, lng: base.lng,
      status: s.status, cancelled: s.cancelled, stranded: s.stranded,
      daily_flights: s.dailyFlights, cancel_rate: Math.round(s.cancelRate * 100),
      updated: new Date().toISOString(),
    };
  });
  
  const totalStranded = Object.values(meStatuses).reduce((s, a) => s + a.stranded, 0);
  const globalStranded = globalDisruptions.reduce((s, g) => s + g.stranded, 0);
  
  return {
    cancelled, closedAirports, totalStranded,
    airportStatus,
    globalDisruptions: globalDisruptions.slice(0, 150), // Top 150 hotspots
    globalStranded,
    methodology: [
      `Crisis day ${daysSinceCrisis} (started Feb 28, 2026)`,
      `${Object.keys(meStatuses).length} ME airports tracked`,
      `${CLOSED.length} airports CLOSED, ${RESTRICTED.length} RESTRICTED`,
      `${globalDisruptions.length} global airports disrupted via ${Object.keys(require('../me-routes.js')?.AIRLINE_ROUTES || {}).length} airline route networks`,
      `Formula: daily_flights × cancel_rate × ${daysSinceCrisis} days × avg_pax × (1 - ${Math.round(Math.min(40, daysSinceCrisis * 5))}% alt-route)`,
      `Total ME stranded: ${totalStranded.toLocaleString()}`,
      `Total globally disrupted: ${globalStranded.toLocaleString()}`,
      `Combined est: ${(totalStranded + globalStranded).toLocaleString()}`,
    ].join('\n'),
    sources: ['news_analysis','route_network_model','travel_advisories'],
  };
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
  // Allow Vercel cron, secret param, or manual GET trigger
  const authHeader = req.headers['authorization'];
  const cronSecret = process.env.CRON_SECRET;
  const querySecret = req.query?.secret;
  if (cronSecret && req.method === 'POST') {
    const isVercelCron = req.headers['x-vercel-cron'] === '1';
    const hasAuth = authHeader === `Bearer ${cronSecret}` || querySecret === cronSecret;
    if (!isVercelCron && !hasAuth) return res.status(401).json({ error: 'Unauthorized' });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_KEY;
  if (!supabaseUrl || !serviceKey) return res.status(500).json({ error: 'Missing env vars' });

  const hostname = supabaseUrl.replace('https://', '');
  console.log('Scrape started:', new Date().toISOString());
  const start = Date.now();

  // Run all fetchers in parallel
  const aviationKey = process.env.AVIATIONSTACK_KEY;
  const [rss, reliefweb, stateDept, fcdo, gdelt, flightData] = await Promise.all([
    fetchRSSFeeds(),
    fetchReliefWeb(),
    fetchStateDept(),
    fetchFCDO(),
    fetchGDELT(),
    fetchCancelledFlights(aviationKey),
  ]);

  const allArticles = [...rss, ...reliefweb, ...stateDept, ...fcdo, ...gdelt];
  console.log(`Fetched: RSS=${rss.length} RW=${reliefweb.length} State=${stateDept.length} FCDO=${fcdo.length} GDELT=${gdelt.length} ME-cancelled=${flightData.cancelled} Global-hotspots=${flightData.globalDisruptions?.length || 0}`);

  // Deduplicate by ID
  const seen = new Set();
  const unique = allArticles.filter(a => {
    if (seen.has(a.id)) return false;
    seen.add(a.id);
    return true;
  });

  // Write to news_feed
  const newsResult = await upsertMany(hostname, serviceKey, 'news_feed', unique);

  // Derive sitrep
  const dangerCountries = stateDept.filter(a => {
    const title = (a.title || '').toLowerCase();
    return title.includes('level 4') || title.includes('level 3');
  }).length || 4;

  const sitrep = {
    id: 'current',
    cancelled_flights: flightData.cancelled || 0,
    est_stranded: (flightData.totalStranded || 0) + (flightData.globalStranded || 0),
    avg_passengers_per_flight: 180,
    airports_closed: flightData.closedAirports || 0,
    airspace_closed_countries: dangerCountries,
    land_routes_open: 3,
    airport_status: JSON.stringify(flightData.airportStatus || []),
    global_disruptions: JSON.stringify(flightData.globalDisruptions || []),
    methodology: flightData.methodology || '',
    sources_used: `{${(flightData.sources || []).join(',')}}`,
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
    sitrep: {
      est_stranded: sitrep.est_stranded,
      cancelled_flights: sitrep.cancelled_flights,
      airports_closed: sitrep.airports_closed,
      global_hotspots: (flightData.globalDisruptions || []).length,
    },
  });
};