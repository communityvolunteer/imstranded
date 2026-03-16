import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const AVIATION_BASE = 'https://api.aviationstack.com/v1';
const AVG_PAX = 185;

const ME_HUB_IATAS = [
  'DXB','AUH','SHJ','DWC','RKT',
  'DOH',
  'BAH','KWI','MCT',
  'RUH','JED','DMM','MED',
  'IKA','THR','MHD','SYZ',
  'BGW','EBL','BSR',
  'TLV','AMM','BEY',
];

const ME_META = {
  DXB:{ city:'Dubai',          country:'AE', lat:25.252, lng:55.364 },
  AUH:{ city:'Abu Dhabi',      country:'AE', lat:24.432, lng:54.651 },
  SHJ:{ city:'Sharjah',        country:'AE', lat:25.329, lng:55.517 },
  DWC:{ city:'Al Maktoum',     country:'AE', lat:24.896, lng:55.161 },
  RKT:{ city:'Ras Al Khaimah', country:'AE', lat:25.613, lng:55.939 },
  DOH:{ city:'Doha',           country:'QA', lat:25.273, lng:51.608 },
  BAH:{ city:'Bahrain',        country:'BH', lat:26.270, lng:50.633 },
  KWI:{ city:'Kuwait City',    country:'KW', lat:29.226, lng:47.968 },
  MCT:{ city:'Muscat',         country:'OM', lat:23.593, lng:58.284 },
  RUH:{ city:'Riyadh',         country:'SA', lat:24.957, lng:46.698 },
  JED:{ city:'Jeddah',         country:'SA', lat:21.670, lng:39.150 },
  DMM:{ city:'Dammam',         country:'SA', lat:26.471, lng:49.798 },
  MED:{ city:'Medina',         country:'SA', lat:24.553, lng:39.705 },
  IKA:{ city:'Tehran IKA',     country:'IR', lat:35.416, lng:51.152 },
  THR:{ city:'Tehran Mehr',    country:'IR', lat:35.689, lng:51.313 },
  MHD:{ city:'Mashhad',        country:'IR', lat:36.236, lng:59.641 },
  SYZ:{ city:'Shiraz',         country:'IR', lat:29.540, lng:52.590 },
  BGW:{ city:'Baghdad',        country:'IQ', lat:33.262, lng:44.235 },
  EBL:{ city:'Erbil',          country:'IQ', lat:36.237, lng:43.963 },
  BSR:{ city:'Basra',          country:'IQ', lat:30.549, lng:47.662 },
  TLV:{ city:'Tel Aviv',       country:'IL', lat:32.011, lng:34.887 },
  AMM:{ city:'Amman',          country:'JO', lat:31.723, lng:35.993 },
  BEY:{ city:'Beirut',         country:'LB', lat:33.821, lng:35.488 },
};

const ME_IATA_SET = new Set(Object.keys(ME_META));

// onFlush called every FLUSH_EVERY flights with the batch so far
const FLUSH_EVERY = 500;

async function fetchCancelled(apiKey, hub, direction, date, onFlush) {
  let offset = 0;
  let batch = [];
  let totalFetched = 0;
  const dirParam = direction === 'dep' ? `dep_iata=${hub}` : `arr_iata=${hub}`;

  while (true) {
    const url = `${AVIATION_BASE}/flights?access_key=${apiKey}`
      + `&flight_status=cancelled&${dirParam}`
      + `&date_from=${date}&date_to=${date}`
      + `&limit=100&offset=${offset}`;

    const res = await fetch(url);
    if (!res.ok) { console.error(`  ${direction.toUpperCase()} ${hub}: HTTP ${res.status}`); break; }
    const json = await res.json();
    if (json.error) { console.error(`  ${direction.toUpperCase()} ${hub} API error:`, json.error.message); break; }

    for (const f of (json.data ?? [])) {
      const depIata = f?.departure?.iata ?? '';
      const arrIata = f?.arrival?.iata ?? '';
      const airline = f?.airline?.name ?? '';
      if (depIata && arrIata && depIata !== arrIata) {
        batch.push({ depIata, arrIata, airline });
        totalFetched++;
      }
    }

    // Flush every FLUSH_EVERY flights — writes to DB mid-pagination
    if (batch.length >= FLUSH_EVERY) {
      await onFlush(batch);
      batch = [];
    }

    const total = json.pagination?.total ?? 0;
    offset += (json.data ?? []).length;
    if (offset >= total || (json.data ?? []).length === 0) break;
    await new Promise(r => setTimeout(r, 50));
  }

  // Flush remaining
  if (batch.length > 0) await onFlush(batch);

  return totalFetched;
}

function classifyStatus(cancelled, isME) {
  if (!isME) return cancelled > 0 ? 'DISRUPTED' : 'OPEN';
  if (cancelled === 0)  return 'OPEN';
  if (cancelled > 500)  return 'CLOSED';
  if (cancelled > 100)  return 'RESTRICTED';
  return 'DISRUPTED';
}

Deno.serve(async (_req) => {
  // ── ENV CHECK ──────────────────────────────────────────────
  const apiKey = Deno.env.get('AVIATIONSTACK_KEY') ?? '';
  const sbUrl  = Deno.env.get('SUPABASE_URL') ?? '';
  const sbKey  = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
  console.log(`ENV CHECK — AVIATIONSTACK_KEY:${apiKey ? 'SET' : 'MISSING'} | SUPABASE_URL:${sbUrl ? 'SET' : 'MISSING'} | SERVICE_ROLE_KEY:${sbKey ? 'SET' : 'MISSING'}`);

  if (!apiKey) return new Response(JSON.stringify({ error: 'AVIATIONSTACK_KEY not set' }), { status: 500 });
  if (!sbUrl)  return new Response(JSON.stringify({ error: 'SUPABASE_URL not set' }), { status: 500 });
  if (!sbKey)  return new Response(JSON.stringify({ error: 'SUPABASE_SERVICE_ROLE_KEY not set' }), { status: 500 });

  const sb = createClient(sbUrl, sbKey);
  const today = new Date().toISOString().slice(0, 10);

  const reqUrl = new URL(_req.url);
  const batchParam = reqUrl.searchParams.get('batch') ?? 'all';
  // Each batch key maps to [hubs, passes]
  // passes: 'dep' = outbound only, 'arr' = inbound only, 'both' = both passes
  const BATCHES = {
    'dxb-dep': { hubs: ['DXB'],                                                    passes: 'dep' },
    'dxb-arr': { hubs: ['DXB'],                                                    passes: 'arr' },
    'doh-dep': { hubs: ['DOH'],                                                    passes: 'dep' },
    'doh-arr': { hubs: ['DOH'],                                                    passes: 'arr' },
    'dxb':     { hubs: ['DXB'],                                                    passes: 'both' },
    'doh':     { hubs: ['DOH'],                                                    passes: 'both' },
    'auh':     { hubs: ['AUH','SHJ','DWC','RKT'],                                  passes: 'both' },
    '2':       { hubs: ['BAH','KWI','MCT','RUH','JED','DMM'],                      passes: 'both' },
    '3':       { hubs: ['MED','IKA','THR','MHD','SYZ','BGW','EBL','BSR','TLV','AMM','BEY'], passes: 'both' },
  };
  const batch = BATCHES[batchParam] ?? { hubs: ME_HUB_IATAS, passes: 'both' };
  const hubsToProcess = batch.hubs;
  const passMode = batch.passes;

  console.log(`[daily-flight-pull] ${today} batch=${batchParam} — ${hubsToProcess.length * 2} API calls`);

  const globalAcc = {};
  let totalHubCancelled = 0;

  async function flushRoutes(hub, direction, flights) {
    // Aggregate routes — deduplicates flights that AviationStack returns on multiple pages
    const agg = {};
    for (const { depIata, arrIata, airline } of flights) {
      const key = `${depIata}|${arrIata}`;
      if (!agg[key]) agg[key] = { dep: depIata, arr: arrIata, cancelled: 0, airlines: new Set() };
      agg[key].cancelled++;
      if (airline) agg[key].airlines.add(airline);
    }
    // Use deduplicated counts for globalAcc — avoids inflating global airport totals
    for (const r of Object.values(agg)) {
      const globalIata = direction === 'dep' ? r.arr : r.dep;
      if (!ME_IATA_SET.has(globalIata)) {
        globalAcc[globalIata] = (globalAcc[globalIata] ?? 0) + r.cancelled;
      }
    }
    const rows = Object.values(agg).map(r => ({
      dep_iata: r.dep, arr_iata: r.arr, date: today,
      cancelled: r.cancelled, airlines: Array.from(r.airlines),
      updated_at: new Date().toISOString(),
    }));
    for (let i = 0; i < rows.length; i += 200) {
      const { error } = await sb.from('route_daily').upsert(rows.slice(i, i + 200), { onConflict: 'dep_iata,arr_iata,date' });
      if (error) console.error(`  route_daily flush error for ${hub}:`, error.message);
    }
    // Return deduplicated total so hubCancelledAcc is accurate
    const dedupTotal = Object.values(agg).reduce((s, r) => s + r.cancelled, 0);
    console.log(`  flushed ${rows.length} routes for ${hub} (${flights.length} raw → ${dedupTotal} dedup)`);
    return dedupTotal;
  }

  // hubCancelledAcc accumulates DEP + ARR so we write airport_daily ONCE per hub (not twice)
  const hubCancelledAcc = {};

  async function processHub(hub, direction) {
    // Track deduplicated count via flushRoutes return values
    let dedupTotal = 0;
    await fetchCancelled(apiKey, hub, direction, today, async (batch) => {
      const n = await flushRoutes(hub, direction, batch);
      dedupTotal += (n ?? 0);
    }).catch(e => {
      console.error(`  ${direction.toUpperCase()} ${hub} failed:`, e.message);
    });
    console.log(`  ${direction.toUpperCase()} ${hub}: ${dedupTotal} cancelled (dedup)`);
    hubCancelledAcc[hub] = (hubCancelledAcc[hub] ?? 0) + dedupTotal;
    return dedupTotal;
  }

  async function flushHubAirportDaily(hub) {
    const total = hubCancelledAcc[hub] ?? 0;
    const meta = ME_META[hub];
    const { error: apErr } = await sb.from('airport_daily').upsert({
      iata: hub,
      date: today,
      cancelled: total,
      is_me_hub: true,
      status: classifyStatus(total, true),
      city: meta.city,
      country_code: meta.country,
      lat: meta.lat,
      lng: meta.lng,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'iata,date' });
    if (apErr) console.error(`  airport_daily upsert error for ${hub}:`, apErr.message);
    else console.log(`  ✓ wrote ${hub} airport_daily (dep+arr total: ${total})`);
  }

  // Pass 1: Outbound
  if (passMode === 'dep' || passMode === 'both') {
    console.log('[Pass 1] Outbound...');
    for (const hub of hubsToProcess) {
      totalHubCancelled += await processHub(hub, 'dep');
      // dep-only batches (dxb-dep, doh-dep): write airport_daily now
      if (passMode === 'dep') await flushHubAirportDaily(hub);
      await new Promise(r => setTimeout(r, 50));
    }
  }

  // Pass 2: Inbound
  if (passMode === 'arr' || passMode === 'both') {
    console.log('[Pass 2] Inbound...');
    for (const hub of hubsToProcess) {
      await processHub(hub, 'arr');
      // Write airport_daily AFTER arr pass — captures dep+arr combined total
      await flushHubAirportDaily(hub);
      await new Promise(r => setTimeout(r, 50));
    }
  }



  // Write global airports
  const globalRows = Object.entries(globalAcc).map(([iata, cancelled]) => ({
    iata, date: today, cancelled, is_me_hub: false, status: 'DISRUPTED',
    updated_at: new Date().toISOString(),
  }));
  for (let i = 0; i < globalRows.length; i += 200) {
    const { error } = await sb.from('airport_daily').upsert(globalRows.slice(i, i + 200), { onConflict: 'iata,date' });
    if (error) console.error(`global airport chunk error:`, error.message);
  }
  console.log(`Wrote ${globalRows.length} global airport rows`);

  // Refresh sitrep
  const { data: totals } = await sb.from('airport_daily').select('cancelled').gte('date', '2026-03-01').eq('is_me_hub', true);
  const totalCancelled = (totals ?? []).reduce((s, r) => s + (r.cancelled ?? 0), 0);
  await sb.from('sitrep').upsert({
    id: 'current',
    cancelled_flights: totalCancelled,
    stranded_people: totalCancelled * AVG_PAX,
    last_updated: new Date().toISOString(),
  }, { onConflict: 'id' });

  const summary = { date: today, me_hub_cancelled_today: totalHubCancelled, global_airports_written: globalRows.length, crisis_total_cancelled: totalCancelled };
  console.log('[daily-flight-pull] Done:', summary);
  return new Response(JSON.stringify(summary, null, 2), { headers: { 'Content-Type': 'application/json' } });
});