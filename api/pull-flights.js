/**
 * /api/pull-flights.js — One-time AviationStack data pull
 * 
 * Hit: help.imstranded.org/api/pull-flights
 * 
 * Checks every key ME airport for cancelled flights using REAL API data.
 * Compares against our model estimates.
 * Stores results in Supabase sitrep.
 * 
 * Uses ~25 API requests (one per airport). Free tier = 100/month.
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

// Airports to check — prioritized by importance
const AIRPORTS = [
  // Tier 1: Major Gulf hubs (most critical)
  { iata: 'DXB', city: 'Dubai', priority: 1 },
  { iata: 'DOH', city: 'Doha', priority: 1 },
  { iata: 'AUH', city: 'Abu Dhabi', priority: 1 },
  { iata: 'KWI', city: 'Kuwait', priority: 1 },
  { iata: 'BAH', city: 'Bahrain', priority: 1 },
  // Tier 2: Conflict zone + Saudi
  { iata: 'TLV', city: 'Tel Aviv', priority: 2 },
  { iata: 'IKA', city: 'Tehran IKA', priority: 2 },
  { iata: 'BGW', city: 'Baghdad', priority: 2 },
  { iata: 'RUH', city: 'Riyadh', priority: 2 },
  { iata: 'JED', city: 'Jeddah', priority: 2 },
  // Tier 3: Secondary airports
  { iata: 'MCT', city: 'Muscat', priority: 3 },
  { iata: 'SHJ', city: 'Sharjah', priority: 3 },
  { iata: 'DMM', city: 'Dammam', priority: 3 },
  { iata: 'AMM', city: 'Amman', priority: 3 },
  { iata: 'BEY', city: 'Beirut', priority: 3 },
  { iata: 'EBL', city: 'Erbil', priority: 3 },
  { iata: 'BSR', city: 'Basra', priority: 3 },
  // Tier 4: Smaller / less likely to have data
  { iata: 'DWC', city: 'Al Maktoum', priority: 4 },
  { iata: 'MED', city: 'Medina', priority: 4 },
  { iata: 'MHD', city: 'Mashhad', priority: 4 },
  { iata: 'RKT', city: 'Ras Al Khaimah', priority: 4 },
  { iata: 'NJF', city: 'Najaf', priority: 4 },
  { iata: 'SYZ', city: 'Shiraz', priority: 4 },
  { iata: 'THR', city: 'Tehran Mehrabad', priority: 4 },
];

module.exports = async function handler(req, res) {
  const apiKey = process.env.AVIATIONSTACK_KEY;
  if (!apiKey) {
    return res.status(400).json({ error: 'AVIATIONSTACK_KEY not set in env vars' });
  }

  // Tier param: ?tier=1 (top 5 only, 10 requests), ?tier=2 (top 10, 20 req), ?tier=all (all 24, ~48 req)
  const tier = req.query?.tier || 'all';
  const maxPriority = tier === '1' ? 1 : tier === '2' ? 2 : tier === '3' ? 3 : 4;
  const airportsToCheck = AIRPORTS.filter(a => a.priority <= maxPriority);

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_KEY;
  const hostname = supabaseUrl ? supabaseUrl.replace('https://', '') : null;

  const results = [];
  let requestCount = 0;
  const start = Date.now();

  console.log(`Starting AviationStack pull: ${airportsToCheck.length} airports (tier=${tier}, max_priority=${maxPriority})`);
  console.log(`Estimated requests: ~${airportsToCheck.length * 2}`);

  for (const airport of airportsToCheck) {
    try {
      // Request 1: Cancelled departures (pagination.total gives full count)
      const cancelUrl = `http://api.aviationstack.com/v1/flights?access_key=${apiKey}&dep_iata=${airport.iata}&flight_status=cancelled&limit=3`;
      const cancelData = await fetchJSON(cancelUrl);
      requestCount++;

      if (cancelData?.error) {
        results.push({
          iata: airport.iata, city: airport.city, priority: airport.priority,
          cancelled: 0, scheduled: 0, total: 0, cancel_rate: 0,
          derived_status: 'API_ERROR',
          sample_flights: [],
          api_error: cancelData.error.message || cancelData.error.info || JSON.stringify(cancelData.error),
        });
        console.error(`${airport.iata}: API error — ${cancelData.error.message || cancelData.error.info}`);
        await new Promise(r => setTimeout(r, 200));
        continue;
      }

      const totalCancelled = cancelData?.pagination?.total || 0;
      const sampleFlights = (cancelData?.data || []).slice(0, 3).map(f => ({
        flight: f.flight?.iata || f.flight?.number,
        airline: f.airline?.name,
        dest: f.arrival?.iata,
        scheduled: f.departure?.scheduled,
      }));

      // Request 2: Scheduled departures (tells us what's still running)
      const schedUrl = `http://api.aviationstack.com/v1/flights?access_key=${apiKey}&dep_iata=${airport.iata}&flight_status=scheduled&limit=1`;
      const schedData = await fetchJSON(schedUrl);
      requestCount++;

      const totalScheduled = schedData?.pagination?.total || 0;
      const totalAll = totalCancelled + totalScheduled;

      // Derive real status from data
      let status = 'UNKNOWN';
      let cancelRate = 0;
      if (totalAll > 0) {
        cancelRate = totalCancelled / totalAll;
        if (cancelRate > 0.85) status = 'CLOSED';
        else if (cancelRate > 0.5) status = 'RESTRICTED';
        else if (cancelRate > 0.2) status = 'DISRUPTED';
        else if (totalScheduled > 5) status = 'OPEN';
        else status = 'LIMITED';
      } else {
        // No data at all — could mean closed or API doesn't cover it
        status = 'NO_DATA';
      }

      results.push({
        iata: airport.iata, city: airport.city, priority: airport.priority,
        cancelled: totalCancelled,
        scheduled: totalScheduled,
        total: totalAll,
        cancel_rate: Math.round(cancelRate * 100),
        derived_status: status,
        sample_flights: sampleFlights,
        api_error: null,
      });

      console.log(`${airport.iata} (${airport.city}): ${totalCancelled} cancelled / ${totalScheduled} scheduled → ${status} (${Math.round(cancelRate * 100)}%)`);
      await new Promise(r => setTimeout(r, 300));

    } catch (e) {
      results.push({
        iata: airport.iata, city: airport.city, priority: airport.priority,
        cancelled: 0, scheduled: 0, total: 0, cancel_rate: 0,
        derived_status: 'FETCH_ERROR',
        sample_flights: [],
        api_error: e.message,
      });
      console.error(`${airport.iata} failed: ${e.message}`);
    }
  }

  // Build comparison with our model
  const OUR_MODEL = {
    DXB: { status: 'CLOSED', cancelRate: 93 },
    DOH: { status: 'RESTRICTED', cancelRate: 55 },
    AUH: { status: 'CLOSED', cancelRate: 93 },
    KWI: { status: 'CLOSED', cancelRate: 93 },
    BAH: { status: 'CLOSED', cancelRate: 93 },
    TLV: { status: 'CLOSED', cancelRate: 93 },
    IKA: { status: 'CLOSED', cancelRate: 93 },
    BGW: { status: 'CLOSED', cancelRate: 93 },
    RUH: { status: 'PARTIALLY OPEN', cancelRate: 20 },
    JED: { status: 'OPEN', cancelRate: 10 },
    MCT: { status: 'PARTIALLY OPEN', cancelRate: 20 },
    SHJ: { status: 'CLOSED', cancelRate: 93 },
    DMM: { status: 'PARTIALLY OPEN', cancelRate: 20 },
    AMM: { status: 'OPEN', cancelRate: 5 },
    BEY: { status: 'RESTRICTED', cancelRate: 55 },
    EBL: { status: 'RESTRICTED', cancelRate: 55 },
    BSR: { status: 'CLOSED', cancelRate: 93 },
    DWC: { status: 'CLOSED', cancelRate: 93 },
    MED: { status: 'OPEN', cancelRate: 10 },
    MHD: { status: 'RESTRICTED', cancelRate: 55 },
    RKT: { status: 'RESTRICTED', cancelRate: 55 },
    NJF: { status: 'RESTRICTED', cancelRate: 45 },
    SYZ: { status: 'CLOSED', cancelRate: 90 },
    THR: { status: 'CLOSED', cancelRate: 93 },
  };

  const comparison = results.map(r => {
    const model = OUR_MODEL[r.iata] || { status: '?', cancelRate: 0 };
    const match = r.derived_status === model.status;
    const rateDiff = Math.abs(r.cancel_rate - model.cancelRate);
    return {
      ...r,
      model_status: model.status,
      model_cancel_rate: model.cancelRate,
      status_match: match,
      rate_diff: rateDiff,
    };
  });

  // Store live data in Supabase if available
  if (hostname && serviceKey) {
    const liveAirportStatus = results
      .filter(r => r.derived_status !== 'API_ERROR' && r.derived_status !== 'FETCH_ERROR')
      .map(r => ({
        iata: r.iata,
        city: r.city,
        status: r.derived_status,
        cancelled: r.cancelled,
        
        scheduled: r.scheduled,
        cancel_rate: r.cancel_rate,
        source: 'aviationstack_live',
        updated: new Date().toISOString(),
      }));

    const sitrep = {
      id: 'current',
      airport_status: JSON.stringify(liveAirportStatus),
      methodology: `LIVE DATA from AviationStack API — ${requestCount} requests used\n${results.filter(r => r.total > 0).length} airports returned data\n${results.filter(r => r.derived_status === 'CLOSED').length} CLOSED, ${results.filter(r => r.derived_status === 'RESTRICTED').length} RESTRICTED\nPulled: ${new Date().toISOString()}`,
      sources_used: '{aviationstack_live}',
      last_updated: new Date().toISOString(),
    };

    const H = { 'apikey': serviceKey, 'Authorization': `Bearer ${serviceKey}`, 'Prefer': 'resolution=merge-duplicates' };
    try {
      await postJSON(hostname, '/rest/v1/sitrep', sitrep, H);
      console.log('Sitrep updated with live data');
    } catch (e) {
      console.error('Supabase write failed:', e.message);
    }
  }

  const duration = Date.now() - start;

  // Summary stats
  const summary = {
    airports_checked: results.length,
    api_requests_used: requestCount,
    airports_with_data: results.filter(r => r.total > 0).length,
    airports_with_errors: results.filter(r => r.api_error).length,
    total_cancelled: results.reduce((s, r) => s + r.cancelled, 0),
    
    total_scheduled: results.reduce((s, r) => s + r.scheduled, 0),
    status_breakdown: {
      CLOSED: results.filter(r => r.derived_status === 'CLOSED').map(r => r.iata),
      RESTRICTED: results.filter(r => r.derived_status === 'RESTRICTED').map(r => r.iata),
      PARTIALLY_OPEN: results.filter(r => r.derived_status === 'PARTIALLY OPEN').map(r => r.iata),
      OPEN: results.filter(r => r.derived_status === 'OPEN').map(r => r.iata),
      LIMITED: results.filter(r => r.derived_status === 'LIMITED').map(r => r.iata),
    },
    model_accuracy: {
      status_matches: comparison.filter(c => c.status_match).length,
      status_total: comparison.filter(c => c.derived_status !== 'API_ERROR' && c.derived_status !== 'FETCH_ERROR').length,
      avg_rate_diff: Math.round(comparison.filter(c => c.total > 0).reduce((s, c) => s + c.rate_diff, 0) / Math.max(1, comparison.filter(c => c.total > 0).length)),
    },
    duration_ms: duration,
  };

  return res.status(200).json({
    ok: true,
    summary,
    airports: comparison,
  });
};