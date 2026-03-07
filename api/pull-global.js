/**
 * /api/pull-global.js — Comprehensive AviationStack data pull
 * 
 * Three phases:
 * 1. ME airports: cancelled + scheduled TODAY (real status for each airport)
 * 2. ME inbound: cancelled arrivals at top hubs → extracts REAL global disruption
 *    (which origin airports actually have cancelled flights to the ME)
 * 3. Historical: 7-day cancelled flight totals per ME hub (cumulative picture)
 * 
 * Hit: /api/pull-global                    (all phases, ~130 requests)
 * Hit: /api/pull-global?phase=me           (ME airports only, ~48 requests)
 * Hit: /api/pull-global?phase=global       (inbound cancelled only, ~10 requests)
 * Hit: /api/pull-global?phase=history      (7-day history only, ~70 requests)
 * 
 * Requires paid AviationStack tier for HTTPS + historical data.
 */

const https = require('https');
const http = require('http');

function fetchJSON(url) {
  const mod = url.startsWith('https') ? https : http;
  return new Promise((resolve, reject) => {
    const req = mod.get(url, { timeout: 15000 }, (res) => {
      let d = '';
      res.on('data', chunk => d += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(d)); }
        catch (e) { resolve({ error: 'Parse failed', raw: d.slice(0, 500) }); }
      });
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
  });
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

// Use HTTPS for paid tier, HTTP for free
function apiBase(key) {
  // Paid tier supports HTTPS, free only HTTP
  return `https://api.aviationstack.com/v1`;
}

const ME_AIRPORTS = [
  'DXB','DOH','AUH','KWI','BAH','TLV','IKA','BGW','RUH','JED',
  'MCT','SHJ','DMM','AMM','BEY','EBL','BSR','DWC','MED','MHD',
  'RKT','NJF','SYZ','THR',
];

// Top hubs for inbound analysis (most connected globally)
const TOP_HUBS = ['DXB','DOH','AUH','TLV','RUH','JED','KWI','BAH','MCT','AMM'];

const AVG_PAX = 185; // average passengers per cancelled flight

// ────────────────────────────────────────────────────────────
// PHASE 1: ME Airport Status (today)
// ────────────────────────────────────────────────────────────
async function pullMEStatus(apiKey) {
  const base = apiBase(apiKey);
  const results = [];
  let requests = 0;

  for (const iata of ME_AIRPORTS) {
    try {
      // Cancelled departures
      const cUrl = `${base}/flights?access_key=${apiKey}&dep_iata=${iata}&flight_status=cancelled&limit=3`;
      const cData = await fetchJSON(cUrl);
      requests++;
      if (cData?.error) {
        results.push({ iata, error: cData.error.message || cData.error.info });
        continue;
      }
      const cancelled = cData?.pagination?.total || 0;
      const samples = (cData?.data || []).slice(0, 3).map(f => ({
        flight: f.flight?.iata, airline: f.airline?.name,
        dest: f.arrival?.iata, date: f.flight_date,
      }));

      // Scheduled departures
      const sUrl = `${base}/flights?access_key=${apiKey}&dep_iata=${iata}&flight_status=scheduled&limit=1`;
      const sData = await fetchJSON(sUrl);
      requests++;
      const scheduled = sData?.pagination?.total || 0;

      const total = cancelled + scheduled;
      const cancelRate = total > 0 ? Math.round((cancelled / total) * 100) : 0;
      let status = 'UNKNOWN';
      if (total === 0) status = 'NO_DATA';
      else if (cancelRate > 85) status = 'CLOSED';
      else if (cancelRate > 50) status = 'RESTRICTED';
      else if (cancelRate > 20) status = 'DISRUPTED';
      else status = 'OPEN';

      results.push({ iata, cancelled, scheduled, total, cancelRate, status, samples });
      await new Promise(r => setTimeout(r, 250));
    } catch (e) {
      results.push({ iata, error: e.message });
    }
  }
  return { results, requests };
}

// ────────────────────────────────────────────────────────────
// PHASE 2: Global Disruption (inbound cancelled to ME hubs)
// Each cancelled inbound flight has an origin airport → real disruption data
// ────────────────────────────────────────────────────────────
async function pullGlobalDisruption(apiKey) {
  const base = apiBase(apiKey);
  const globalMap = {}; // originIata → { cancelled, airlines, meHubs, flights[] }
  let requests = 0;

  for (const hub of TOP_HUBS) {
    try {
      // Get cancelled ARRIVALS at this hub (limit 100 = max per page)
      const url = `${base}/flights?access_key=${apiKey}&arr_iata=${hub}&flight_status=cancelled&limit=100`;
      const data = await fetchJSON(url);
      requests++;

      if (data?.error) {
        console.error(`Inbound ${hub}: API error — ${data.error.message || data.error.info}`);
        continue;
      }

      const totalInbound = data?.pagination?.total || 0;
      const flights = data?.data || [];

      console.log(`${hub}: ${totalInbound} total cancelled inbound (${flights.length} in this page)`);

      for (const f of flights) {
        const origin = f.departure?.iata;
        if (!origin) continue;
        // Skip ME-to-ME routes
        if (ME_AIRPORTS.includes(origin)) continue;

        if (!globalMap[origin]) {
          globalMap[origin] = {
            iata: origin,
            cancelled: 0,
            stranded: 0,
            airlines: new Set(),
            meHubs: new Set(),
            sampleFlights: [],
          };
        }
        globalMap[origin].cancelled++;
        globalMap[origin].stranded += AVG_PAX;
        if (f.airline?.name) globalMap[origin].airlines.add(f.airline.name);
        globalMap[origin].meHubs.add(hub);
        if (globalMap[origin].sampleFlights.length < 3) {
          globalMap[origin].sampleFlights.push({
            flight: f.flight?.iata,
            airline: f.airline?.name,
            to: hub,
            date: f.flight_date,
          });
        }
      }

      await new Promise(r => setTimeout(r, 250));
    } catch (e) {
      console.error(`Inbound ${hub} failed: ${e.message}`);
    }
  }

  // Convert to sorted array
  const globalList = Object.values(globalMap)
    .map(g => ({
      ...g,
      airlines: [...g.airlines],
      meHubs: [...g.meHubs],
    }))
    .sort((a, b) => b.cancelled - a.cancelled);

  return { globalList, requests };
}

// ────────────────────────────────────────────────────────────
// PHASE 3: Historical (7-day cancelled counts per hub)
// ────────────────────────────────────────────────────────────
async function pullHistory(apiKey) {
  const base = apiBase(apiKey);
  const history = {}; // iata → { dates: { '2026-03-01': count, ... }, total7d }
  let requests = 0;

  // Generate last 7 dates
  const dates = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(Date.now() - i * 86400000);
    dates.push(d.toISOString().slice(0, 10));
  }

  for (const hub of TOP_HUBS) {
    history[hub] = { dates: {}, total7d: 0 };

    for (const date of dates) {
      try {
        const url = `${base}/flights?access_key=${apiKey}&dep_iata=${hub}&flight_status=cancelled&flight_date=${date}&limit=1`;
        const data = await fetchJSON(url);
        requests++;

        if (data?.error) {
          // Historical data might not be available on all tiers
          history[hub].dates[date] = { cancelled: 0, error: data.error.message || data.error.info };
          continue;
        }

        const count = data?.pagination?.total || 0;
        history[hub].dates[date] = { cancelled: count };
        history[hub].total7d += count;

        await new Promise(r => setTimeout(r, 250));
      } catch (e) {
        history[hub].dates[date] = { cancelled: 0, error: e.message };
      }
    }

    console.log(`${hub} 7-day total: ${history[hub].total7d} cancelled`);
  }

  return { history, requests, dates };
}

// ────────────────────────────────────────────────────────────
// MAIN HANDLER
// ────────────────────────────────────────────────────────────
module.exports = async function handler(req, res) {
  const apiKey = process.env.AVIATIONSTACK_KEY;
  if (!apiKey) return res.status(400).json({ error: 'AVIATIONSTACK_KEY not set' });

  const phase = req.query?.phase || 'all';
  const start = Date.now();
  let totalRequests = 0;
  const output = {};

  // Phase 1: ME Airport Status
  if (phase === 'all' || phase === 'me') {
    console.log('=== PHASE 1: ME Airport Status ===');
    const me = await pullMEStatus(apiKey);
    output.me_airports = me.results;
    totalRequests += me.requests;

    output.me_summary = {
      total_cancelled: me.results.reduce((s, r) => s + (r.cancelled || 0), 0),
      total_scheduled: me.results.reduce((s, r) => s + (r.scheduled || 0), 0),
      closed: me.results.filter(r => r.status === 'CLOSED').map(r => r.iata),
      restricted: me.results.filter(r => r.status === 'RESTRICTED').map(r => r.iata),
      disrupted: me.results.filter(r => r.status === 'DISRUPTED').map(r => r.iata),
      open: me.results.filter(r => r.status === 'OPEN').map(r => r.iata),
    };
  }

  // Phase 2: Global Disruption from real inbound data
  if (phase === 'all' || phase === 'global') {
    console.log('=== PHASE 2: Global Disruption ===');
    const global = await pullGlobalDisruption(apiKey);
    output.global_disruptions = global.globalList;
    totalRequests += global.requests;

    output.global_summary = {
      airports_affected: global.globalList.length,
      total_cancelled_inbound: global.globalList.reduce((s, g) => s + g.cancelled, 0),
      total_stranded_est: global.globalList.reduce((s, g) => s + g.stranded, 0),
      top_10: global.globalList.slice(0, 10).map(g => ({
        iata: g.iata,
        cancelled: g.cancelled,
        stranded: g.stranded,
        airlines: g.airlines.slice(0, 5),
      })),
    };
  }

  // Phase 3: 7-day History
  if (phase === 'all' || phase === 'history') {
    console.log('=== PHASE 3: 7-Day History ===');
    const hist = await pullHistory(apiKey);
    output.history = hist.history;
    output.history_dates = hist.dates;
    totalRequests += hist.requests;

    output.history_summary = {};
    for (const [hub, data] of Object.entries(hist.history)) {
      const today = hist.dates[0];
      output.history_summary[hub] = {
        total_7d: data.total7d,
        today: data.dates[today]?.cancelled || 0,
        est_stranded_7d: data.total7d * AVG_PAX,
        est_new_stranded_today: (data.dates[today]?.cancelled || 0) * AVG_PAX,
      };
    }
  }

  // Write to Supabase if available
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_KEY;
  if (supabaseUrl && serviceKey) {
    const hostname = supabaseUrl.replace('https://', '');
    const H = { 'apikey': serviceKey, 'Authorization': `Bearer ${serviceKey}`, 'Prefer': 'resolution=merge-duplicates' };

    const sitrep = { id: 'current', last_updated: new Date().toISOString() };

    // Store ME airport status
    if (output.me_airports) {
      sitrep.airport_status = JSON.stringify(output.me_airports.filter(a => !a.error).map(a => ({
        iata: a.iata, status: a.status,
        cancelled: a.cancelled, scheduled: a.scheduled,
        cancel_rate: a.cancelRate,
        source: 'aviationstack_live',
        updated: new Date().toISOString(),
      })));
      sitrep.est_stranded = output.me_airports.reduce((s, a) => s + ((a.cancelled || 0) * AVG_PAX), 0);
    }

    // Store global disruption
    if (output.global_disruptions) {
      sitrep.global_disruptions = JSON.stringify(output.global_disruptions.slice(0, 200));
    }

    // Store methodology
    sitrep.methodology = [
      `LIVE DATA — AviationStack API, ${new Date().toISOString()}`,
      `${totalRequests} API requests used`,
      output.me_airports ? `${output.me_airports.filter(a => !a.error).length} ME airports verified` : '',
      output.global_disruptions ? `${output.global_disruptions.length} global airports with REAL cancelled inbound data` : '',
      output.history ? `7-day history for ${Object.keys(output.history).length} hubs` : '',
    ].filter(Boolean).join('\n');
    sitrep.sources_used = '{aviationstack_live}';

    try {
      await postJSON(hostname, '/rest/v1/sitrep', sitrep, H);
      console.log('Supabase updated');
    } catch (e) {
      console.error('Supabase write failed:', e.message);
    }
  }

  return res.status(200).json({
    ok: true,
    phase,
    requests_used: totalRequests,
    duration_ms: Date.now() - start,
    ...output,
  });
};