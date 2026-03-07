/**
 * /api/pull-global.js — Comprehensive AviationStack data pull
 * 
 * Four phases:
 * 1. ME airports: cancelled + scheduled (real status)       ~48 requests
 * 2. Route pairs: dep=LHR&arr=DXB for EVERY known route    ~462 requests
 * 3. Historical: 7-day cancelled per ME hub                 ~70 requests
 * 4. Discover: inbound scan for unknown airports            ~10 requests
 * 
 * /api/pull-global                     (phases me+routes+history, ~580 req)
 * /api/pull-global?phase=me            (ME airports only, ~48 req)
 * /api/pull-global?phase=routes        (route pairs, ~462 req)
 * /api/pull-global?phase=history       (7-day history, ~70 req)
 * /api/pull-global?phase=discover      (inbound scan, ~10 req)
 * /api/pull-global?phase=me,routes     (combine, comma-separated)
 * 
 * Requires paid AviationStack tier ($50/mo = 10K requests).
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
        catch (e) { resolve({ error: 'Parse failed', raw: d.slice(0, 300) }); }
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

const API_BASE = 'https://api.aviationstack.com/v1';
const AVG_PAX = 185;

const ME_AIRPORTS = [
  'DXB','DOH','AUH','KWI','BAH','TLV','IKA','BGW','RUH','JED',
  'MCT','SHJ','DMM','AMM','BEY','EBL','BSR','DWC','MED','MHD',
  'RKT','NJF','SYZ','THR',
];

const TOP_HUBS = ['DXB','DOH','AUH','TLV','RUH','JED','KWI','BAH','MCT','AMM'];

// Known global->ME route pairs from airline network data
const ROUTE_PAIRS = buildRoutePairs();

function buildRoutePairs() {
  const airlines = {
    emirates:    { hubs:['DXB'], dests:['LHR','LGW','MAN','BHX','EDI','NCL','GLA','BRS','CDG','NCE','LYS','FRA','MUC','DUS','HAM','BER','FCO','MXP','VCE','BCN','MAD','AGP','LIS','AMS','BRU','ZRH','GVA','VIE','CPH','OSL','ARN','DUB','PRG','BUD','WAW','ATH','IST','JFK','EWR','IAD','BOS','ORD','LAX','SFO','SEA','DFW','IAH','MIA','MCO','DTW','PHL','ATL','YYZ','YVR','YUL','DEL','BOM','BLR','MAA','HYD','COK','AMD','CCU','TRV','SIN','BKK','HKG','NRT','HND','ICN','KUL','CGK','DPS','PVG','PEK','CAN','TPE','GRU','EZE','MEX','JNB','CPT','DUR','NBO','ADD','LOS','ABV','DAR','MRU','CMB','DAC','KTM','AKL','SYD','MEL','BNE','PER'] },
    qatar:       { hubs:['DOH'], dests:['LHR','CDG','FRA','FCO','BCN','MAD','AMS','BRU','ZRH','VIE','CPH','OSL','ARN','MUC','BER','MXP','ATH','IST','JFK','IAD','ORD','LAX','MIA','DFW','BOS','PHL','YYZ','DEL','BOM','BLR','MAA','HYD','COK','AMD','CCU','SIN','BKK','HKG','NRT','ICN','KUL','CGK','DPS','PVG','PEK','CAN','TPE','HAN','SGN','GRU','EZE','MEX','JNB','CPT','NBO','ADD','LOS','DAR','ACC','CMB','DAC','KTM','ISB','KHI','LHE','AKL','SYD','MEL','BNE','PER','MNL','ILO','MLE'] },
    etihad:      { hubs:['AUH'], dests:['LHR','CDG','FRA','MUC','MXP','AMS','BRU','ZRH','GVA','VIE','DUB','ATH','IST','JFK','ORD','LAX','IAD','YYZ','DEL','BOM','BLR','MAA','HYD','COK','SIN','BKK','HKG','NRT','ICN','KUL','CGK','PVG','PEK','TPE','GRU','JNB','NBO','SYD','MEL','CMB','ISB','KHI','MNL','MLE','BCN','SEA'] },
    flydubai:    { hubs:['DXB','DWC'], dests:['KZN','LED','SVO','DME','TBS','EVN','GYD','TAS','EBB','KGL','KRK','SOF','BEG','SKG','HER','SAW','HEL','BOG','DSS','KAN','ALG','ABJ','ASB','KHI','ASM','VNO','VOG','ZNZ'] },
    saudia:      { hubs:['RUH','JED'], dests:['LHR','CDG','FRA','MUC','FCO','MAD','IST','JFK','IAD','LAX','DEL','BOM','BLR','MAA','HYD','SIN','BKK','KUL','CGK','MNL','ILO','PVG','NBO','ADD','CMB','ISB','KHI','LHE','DAC','CAI','AMM','TUN'] },
    gulfair:     { hubs:['BAH'], dests:['LHR','CDG','FRA','MUC','ATH','IST','MAN','SIN','BKK','HKG','MNL','DEL','BOM','BLR','COK','HYD','CMB','DAC','KTM','ISB','KHI','LHE','NBO','JNB','CAI','CMN','LCA','PVG','CAN','GOI'] },
    kuwait:      { hubs:['KWI'], dests:['LHR','CDG','FRA','MUC','GVA','IST','JFK','DEL','BOM','BLR','COK','HYD','AMD','SIN','BKK','MNL','CGK','CMB','DAC','ISB','KHI','LHE','NBO','CAI'] },
    omanair:     { hubs:['MCT'], dests:['LHR','CDG','FRA','MUC','MXP','ZRH','IST','SIN','BKK','KUL','DEL','BOM','BLR','MAA','COK','HYD','CMB','DAC','KTM','ISB','KHI','LHE','NBO','JNB','CAI'] },
    elal:        { hubs:['TLV'], dests:['LHR','CDG','FRA','MUC','FCO','MAD','BCN','AMS','BRU','ZRH','VIE','ATH','IST','JFK','EWR','IAD','LAX','MIA','BOS','ORD','YYZ','BKK','BOM','DEL','HKG','PRG','BUD','OTP','SOF','TBS','LTN'] },
    royaljordan: { hubs:['AMM'], dests:['LHR','CDG','FRA','FCO','MAD','AMS','ATH','IST','JFK','ORD','DFW','DEL','BOM','KUL','SIN','BKK','CAI','PRG','OTP','BGY','CIA','PSA','PFO','DAM','ESB'] },
  };

  const pairs = new Set();
  for (const al of Object.values(airlines)) {
    for (const hub of al.hubs) {
      if (!TOP_HUBS.includes(hub)) continue;
      for (const dest of al.dests) {
        if (ME_AIRPORTS.includes(dest)) continue;
        pairs.add(dest + '|' + hub);
      }
    }
  }
  return [...pairs].map(p => { const [dep,arr] = p.split('|'); return { dep, arr }; });
}

// ── PHASE 1: ME Airport Status ──
async function pullMEStatus(apiKey) {
  const results = []; let requests = 0;
  for (const iata of ME_AIRPORTS) {
    try {
      const cData = await fetchJSON(`${API_BASE}/flights?access_key=${apiKey}&dep_iata=${iata}&flight_status=cancelled&limit=3`);
      requests++;
      if (cData?.error) { results.push({ iata, error: cData.error.message || cData.error.info }); continue; }
      const cancelled = cData?.pagination?.total || 0;
      const samples = (cData?.data || []).slice(0, 3).map(f => ({
        flight: f.flight?.iata, airline: f.airline?.name, dest: f.arrival?.iata, date: f.flight_date,
      }));
      const sData = await fetchJSON(`${API_BASE}/flights?access_key=${apiKey}&dep_iata=${iata}&flight_status=scheduled&limit=1`);
      requests++;
      const scheduled = sData?.pagination?.total || 0;
      const total = cancelled + scheduled;
      const cancelRate = total > 0 ? Math.round((cancelled / total) * 100) : 0;
      let status = total === 0 ? 'NO_DATA' : cancelRate > 85 ? 'CLOSED' : cancelRate > 50 ? 'RESTRICTED' : cancelRate > 20 ? 'DISRUPTED' : 'OPEN';
      results.push({ iata, cancelled, scheduled, total, cancelRate, status, samples });
      await new Promise(r => setTimeout(r, 200));
    } catch (e) { results.push({ iata, error: e.message }); }
  }
  return { results, requests };
}

// ── PHASE 2: Route-pair queries ──
async function pullRoutePairs(apiKey) {
  const globalMap = {};
  let requests = 0, routesWithData = 0;
  const errors = [];
  console.log(`Querying ${ROUTE_PAIRS.length} route pairs...`);

  for (let i = 0; i < ROUTE_PAIRS.length; i++) {
    const { dep, arr } = ROUTE_PAIRS[i];
    try {
      const url = `${API_BASE}/flights?access_key=${apiKey}&dep_iata=${dep}&arr_iata=${arr}&flight_status=cancelled&limit=3`;
      const data = await fetchJSON(url);
      requests++;

      if (data?.error) {
        if (data.error.code === 104) {
          console.error(`Rate limited at request ${requests}. Stopping.`);
          errors.push({ dep, arr, error: 'rate_limit' });
          break;
        }
        continue;
      }

      const cancelled = data?.pagination?.total || 0;
      if (cancelled > 0) {
        routesWithData++;
        const flights = data?.data || [];
        const airlineNames = [...new Set(flights.map(f => f.airline?.name).filter(Boolean))];
        if (!globalMap[dep]) {
          globalMap[dep] = { iata: dep, cancelled: 0, stranded: 0, airlines: new Set(), meHubs: new Set(), routes: [] };
        }
        globalMap[dep].cancelled += cancelled;
        globalMap[dep].stranded += cancelled * AVG_PAX;
        airlineNames.forEach(a => globalMap[dep].airlines.add(a));
        globalMap[dep].meHubs.add(arr);
        globalMap[dep].routes.push({ hub: arr, cancelled, airlines: airlineNames });
      }

      if (requests % 50 === 0) {
        console.log(`  ${requests}/${ROUTE_PAIRS.length} done, ${routesWithData} routes with data, ${Object.keys(globalMap).length} airports`);
      }
      await new Promise(r => setTimeout(r, 150));
    } catch (e) { errors.push({ dep, arr, error: e.message }); }
  }

  const globalList = Object.values(globalMap)
    .map(g => ({ iata: g.iata, cancelled: g.cancelled, stranded: g.stranded, airlines: [...g.airlines], me_hubs: [...g.meHubs], routes: g.routes.sort((a, b) => b.cancelled - a.cancelled) }))
    .sort((a, b) => b.cancelled - a.cancelled);

  return { globalList, requests, routesWithData, errors };
}

// ── PHASE 3: 7-day history ──
async function pullHistory(apiKey) {
  const history = {}; let requests = 0;
  const dates = [];
  for (let i = 0; i < 7; i++) { dates.push(new Date(Date.now() - i * 86400000).toISOString().slice(0, 10)); }
  for (const hub of TOP_HUBS) {
    history[hub] = { dates: {}, total7d: 0 };
    for (const date of dates) {
      try {
        const data = await fetchJSON(`${API_BASE}/flights?access_key=${apiKey}&dep_iata=${hub}&flight_status=cancelled&flight_date=${date}&limit=1`);
        requests++;
        if (data?.error) { history[hub].dates[date] = { cancelled: 0, error: data.error.message }; continue; }
        const count = data?.pagination?.total || 0;
        history[hub].dates[date] = { cancelled: count };
        history[hub].total7d += count;
        await new Promise(r => setTimeout(r, 200));
      } catch (e) { history[hub].dates[date] = { cancelled: 0, error: e.message }; }
    }
    console.log(`${hub} 7-day: ${history[hub].total7d}`);
  }
  return { history, requests, dates };
}

// ── PHASE 4: Discover unknown airports via inbound scan ──
async function pullDiscover(apiKey) {
  const found = {}; let requests = 0;
  for (const hub of TOP_HUBS) {
    try {
      const data = await fetchJSON(`${API_BASE}/flights?access_key=${apiKey}&arr_iata=${hub}&flight_status=cancelled&limit=100`);
      requests++;
      if (data?.error) continue;
      for (const f of (data?.data || [])) {
        const origin = f.departure?.iata;
        if (!origin || ME_AIRPORTS.includes(origin)) continue;
        if (!found[origin]) found[origin] = { iata: origin, cancelled: 0, hubs: new Set() };
        found[origin].cancelled++;
        found[origin].hubs.add(hub);
      }
      await new Promise(r => setTimeout(r, 200));
    } catch (e) {}
  }
  return { discovered: Object.values(found).map(f => ({ ...f, hubs: [...f.hubs] })).sort((a, b) => b.cancelled - a.cancelled), requests };
}

// ── MAIN HANDLER ──
module.exports = async function handler(req, res) {
  const apiKey = process.env.AVIATIONSTACK_KEY;
  if (!apiKey) return res.status(400).json({ error: 'AVIATIONSTACK_KEY not set' });

  const phases = (req.query?.phase || 'me,routes,history').split(',').map(p => p.trim());
  const start = Date.now();
  let totalRequests = 0;
  const output = {};

  if (phases.includes('all') || phases.includes('me')) {
    console.log('=== PHASE 1: ME Status ===');
    const me = await pullMEStatus(apiKey);
    output.me_airports = me.results;
    totalRequests += me.requests;
    output.me_summary = {
      total_cancelled: me.results.reduce((s, r) => s + (r.cancelled || 0), 0),
      total_scheduled: me.results.reduce((s, r) => s + (r.scheduled || 0), 0),
      restricted: me.results.filter(r => r.status === 'RESTRICTED').map(r => r.iata),
      disrupted: me.results.filter(r => r.status === 'DISRUPTED').map(r => r.iata),
      open: me.results.filter(r => r.status === 'OPEN').map(r => r.iata),
    };
  }

  if (phases.includes('all') || phases.includes('routes')) {
    console.log('=== PHASE 2: Route Pairs ===');
    const routes = await pullRoutePairs(apiKey);
    output.global_disruptions = routes.globalList;
    totalRequests += routes.requests;
    output.routes_summary = {
      route_pairs_queried: routes.requests,
      routes_with_cancellations: routes.routesWithData,
      airports_affected: routes.globalList.length,
      total_cancelled: routes.globalList.reduce((s, g) => s + g.cancelled, 0),
      total_stranded_est: routes.globalList.reduce((s, g) => s + g.stranded, 0),
      top_20: routes.globalList.slice(0, 20).map(g => ({ iata: g.iata, cancelled: g.cancelled, stranded: g.stranded, airlines: g.airlines.slice(0, 5), me_hubs: g.me_hubs })),
      errors: routes.errors.length,
    };
  }

  if (phases.includes('all') || phases.includes('history')) {
    console.log('=== PHASE 3: History ===');
    const hist = await pullHistory(apiKey);
    output.history = hist.history;
    output.history_dates = hist.dates;
    totalRequests += hist.requests;
    output.history_summary = {};
    for (const [hub, data] of Object.entries(hist.history)) {
      output.history_summary[hub] = { total_7d: data.total7d, today: data.dates[hist.dates[0]]?.cancelled || 0, est_stranded_7d: data.total7d * AVG_PAX };
    }
  }

  if (phases.includes('all') || phases.includes('discover')) {
    console.log('=== PHASE 4: Discover ===');
    const disc = await pullDiscover(apiKey);
    output.discovered_airports = disc.discovered;
    totalRequests += disc.requests;
  }

  // Write to Supabase
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_KEY;
  if (supabaseUrl && serviceKey) {
    const hostname = supabaseUrl.replace('https://', '');
    const H = { 'apikey': serviceKey, 'Authorization': `Bearer ${serviceKey}`, 'Prefer': 'resolution=merge-duplicates' };
    const sitrep = { id: 'current', last_updated: new Date().toISOString() };
    if (output.me_airports) {
      sitrep.airport_status = JSON.stringify(output.me_airports.filter(a => !a.error).map(a => ({
        iata: a.iata, status: a.status, cancelled: a.cancelled, scheduled: a.scheduled,
        cancel_rate: a.cancelRate, source: 'aviationstack_route_pairs', updated: new Date().toISOString(),
      })));
    }
    if (output.global_disruptions) {
      sitrep.global_disruptions = JSON.stringify(output.global_disruptions);
    }
    sitrep.methodology = `LIVE — AviationStack route-pair queries, ${new Date().toISOString()}\n${totalRequests} API requests\n${output.global_disruptions ? output.global_disruptions.length + ' global airports with EXACT cancelled flight counts' : ''}\nPhases: ${phases.join(', ')}`;
    sitrep.sources_used = '{aviationstack_route_pairs}';
    try { await postJSON(hostname, '/rest/v1/sitrep', sitrep, H); console.log('Supabase updated'); }
    catch (e) { console.error('Supabase write failed:', e.message); }
  }

  return res.status(200).json({
    ok: true, phases, requests_used: totalRequests,
    route_pairs_in_model: ROUTE_PAIRS.length,
    duration_ms: Date.now() - start,
    ...output,
  });
};