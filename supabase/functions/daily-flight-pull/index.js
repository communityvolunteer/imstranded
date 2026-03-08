/**
 * daily-flight-pull — Supabase Edge Function
 *
 * 44 AviationStack calls/day (22 dep + 22 arr per ME hub).
 * No global airports queried directly — they accumulate as a side effect.
 *
 * Outbound pass (dep_iata=HUB): HUB→WORLD routes + global airport totals
 * Inbound pass  (arr_iata=HUB): WORLD→HUB routes (powers "Trying to Fly In" tab)
 *
 * Both passes write into route_daily. airport_daily gets counts from both.
 *
 * Deploy:
 *   supabase functions deploy daily-flight-pull --no-verify-jwt
 *
 * Schedule (Supabase SQL editor):
 *   SELECT cron.schedule(
 *     'daily-flight-pull',
 *     '45 23 * * *',
 *     $$SELECT net.http_post(
 *       url := 'https://<project-ref>.supabase.co/functions/v1/daily-flight-pull',
 *       headers := '{"Authorization": "Bearer <service-role-key>"}'::jsonb
 *     )$$
 *   );
 *
 * Env vars (Supabase Dashboard → Functions → Environment variables):
 *   AVIATION_STACK_KEY        — your AviationStack paid API key
 *   SUPABASE_URL              — auto-injected
 *   SUPABASE_SERVICE_ROLE_KEY — auto-injected
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const AVIATION_BASE = 'https://api.aviationstack.com/v1';
const AVG_PAX = 185;

const ME_HUB_IATAS = [
  'DXB','AUH','SHJ','DWC','RKT',
  'DOH',
  'BAH',
  'KWI',
  'MCT',
  'RUH','JED','DMM','MED',
  'IKA','THR','MHD','SYZ',
  'BGW','EBL','BSR',
  'TLV',
  'AMM','BEY',
];

const ME_META = {
  DXB:{ city:'Dubai',         country:'AE', lat:25.252, lng:55.364 },
  AUH:{ city:'Abu Dhabi',     country:'AE', lat:24.432, lng:54.651 },
  SHJ:{ city:'Sharjah',       country:'AE', lat:25.329, lng:55.517 },
  DWC:{ city:'Al Maktoum',    country:'AE', lat:24.896, lng:55.161 },
  RKT:{ city:'Ras Al Khaimah',country:'AE', lat:25.613, lng:55.939 },
  DOH:{ city:'Doha',          country:'QA', lat:25.273, lng:51.608 },
  BAH:{ city:'Bahrain',       country:'BH', lat:26.270, lng:50.633 },
  KWI:{ city:'Kuwait City',   country:'KW', lat:29.226, lng:47.968 },
  MCT:{ city:'Muscat',        country:'OM', lat:23.593, lng:58.284 },
  RUH:{ city:'Riyadh',        country:'SA', lat:24.957, lng:46.698 },
  JED:{ city:'Jeddah',        country:'SA', lat:21.670, lng:39.150 },
  DMM:{ city:'Dammam',        country:'SA', lat:26.471, lng:49.798 },
  MED:{ city:'Medina',        country:'SA', lat:24.553, lng:39.705 },
  IKA:{ city:'Tehran IKA',    country:'IR', lat:35.416, lng:51.152 },
  THR:{ city:'Tehran Mehr',   country:'IR', lat:35.689, lng:51.313 },
  MHD:{ city:'Mashhad',       country:'IR', lat:36.236, lng:59.641 },
  SYZ:{ city:'Shiraz',        country:'IR', lat:29.540, lng:52.590 },
  BGW:{ city:'Baghdad',       country:'IQ', lat:33.262, lng:44.235 },
  EBL:{ city:'Erbil',         country:'IQ', lat:36.237, lng:43.963 },
  BSR:{ city:'Basra',         country:'IQ', lat:30.549, lng:47.662 },
  TLV:{ city:'Tel Aviv',      country:'IL', lat:32.011, lng:34.887 },
  AMM:{ city:'Amman',         country:'JO', lat:31.723, lng:35.993 },
  BEY:{ city:'Beirut',        country:'LB', lat:33.821, lng:35.488 },
};

const ME_IATA_SET = new Set(Object.keys(ME_META));

// ── AviationStack paginated fetch ─────────────────────────────
// direction 'dep': query dep_iata=hub  (flights leaving hub)
// direction 'arr': query arr_iata=hub  (flights arriving at hub)
async function fetchCancelled(apiKey, hub, direction, date) {
  const results = [];
  let offset = 0;
  const limit = 100;
  const dirParam = direction === 'dep' ? `dep_iata=${hub}` : `arr_iata=${hub}`;

  while (true) {
    const url = `${AVIATION_BASE}/flights?access_key=${apiKey}`
      + `&flight_status=cancelled&${dirParam}`
      + `&date_from=${date}&date_to=${date}`
      + `&limit=${limit}&offset=${offset}`;

    const res = await fetch(url);
    if (!res.ok) { console.error(`  ${direction.toUpperCase()} ${hub}: HTTP ${res.status}`); break; }

    const json = await res.json();
    if (json.error) { console.error(`  ${direction.toUpperCase()} ${hub} API error:`, json.error.message); break; }

    for (const f of (json.data ?? [])) {
      const depIata = f?.departure?.iata ?? '';
      const arrIata = f?.arrival?.iata ?? '';
      const airline = f?.airline?.name ?? '';
      if (depIata && arrIata && depIata !== arrIata) {
        results.push({ depIata, arrIata, airline });
      }
    }

    const total = json.pagination?.total ?? 0;
    offset += (json.data ?? []).length;
    if (offset >= total || (json.data ?? []).length === 0) break;
  }

  return results;
}

function classifyStatus(cancelled, isME) {
  if (!isME) return cancelled > 0 ? 'DISRUPTED' : 'OPEN';
  if (cancelled === 0)  return 'OPEN';
  if (cancelled > 500)  return 'CLOSED';
  if (cancelled > 100)  return 'RESTRICTED';
  return 'DISRUPTED';
}

// ── Main handler ──────────────────────────────────────────────
Deno.serve(async (_req) => {
  const apiKey = Deno.env.get('AVIATION_STACK_KEY') ?? '';
  if (!apiKey) return new Response(JSON.stringify({ error: 'AVIATION_STACK_KEY not set' }), { status: 500 });

  const sb = createClient(
    Deno.env.get('SUPABASE_URL'),
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'),
  );

  const today = new Date().toISOString().slice(0, 10);
  console.log(`[daily-flight-pull] ${today} — ${ME_HUB_IATAS.length * 2} API calls`);

  // airport_daily accumulator: iata → { cancelled, isME, city, country, lat, lng }
  const airportAcc = {};
  // route_daily accumulator: "dep|arr" → { dep, arr, cancelled, airlines: Set }
  const routeAcc = {};

  function bumpAirport(iata, isMEOverride = null) {
    if (!airportAcc[iata]) {
      const meta = ME_META[iata];
      airportAcc[iata] = {
        cancelled: 0,
        isME: isMEOverride !== null ? isMEOverride : ME_IATA_SET.has(iata),
        ...(meta ?? {}),
      };
    }
    airportAcc[iata].cancelled += 1;
  }

  function bumpRoute(dep, arr, airline) {
    const key = `${dep}|${arr}`;
    if (!routeAcc[key]) routeAcc[key] = { dep, arr, cancelled: 0, airlines: new Set() };
    routeAcc[key].cancelled += 1;
    if (airline) routeAcc[key].airlines.add(airline);
  }

  // ── Pass 1: Outbound (dep_iata = ME hub) ─────────────────────
  console.log('[Pass 1] Outbound...');
  for (const hub of ME_HUB_IATAS) {
    try {
      const flights = await fetchCancelled(apiKey, hub, 'dep', today);
      console.log(`  DEP ${hub}: ${flights.length} cancelled`);
      for (const { depIata, arrIata, airline } of flights) {
        bumpAirport(depIata, true);                           // ME hub
        bumpRoute(depIata, arrIata, airline);
        if (!ME_IATA_SET.has(arrIata)) bumpAirport(arrIata, false); // global dest
      }
    } catch (e) { console.error(`  DEP ${hub} failed:`, e); }
    await new Promise(r => setTimeout(r, 250));
  }

  // ── Pass 2: Inbound (arr_iata = ME hub) ──────────────────────
  console.log('[Pass 2] Inbound...');
  for (const hub of ME_HUB_IATAS) {
    try {
      const flights = await fetchCancelled(apiKey, hub, 'arr', today);
      console.log(`  ARR ${hub}: ${flights.length} cancelled`);
      for (const { depIata, arrIata, airline } of flights) {
        bumpAirport(arrIata, true);                            // ME hub
        bumpRoute(depIata, arrIata, airline);
        if (!ME_IATA_SET.has(depIata)) bumpAirport(depIata, false); // global origin
      }
    } catch (e) { console.error(`  ARR ${hub} failed:`, e); }
    await new Promise(r => setTimeout(r, 250));
  }

  // ── Upsert airport_daily ──────────────────────────────────────
  const airportRows = Object.entries(airportAcc).map(([iata, a]) => ({
    iata,
    date: today,
    cancelled: a.cancelled,
    is_me_hub: a.isME,
    status: classifyStatus(a.cancelled, a.isME),
    city: a.city ?? null,
    country_code: a.country ?? null,
    lat: a.lat ?? null,
    lng: a.lng ?? null,
    updated_at: new Date().toISOString(),
  }));

  if (airportRows.length) {
    const { error } = await sb.from('airport_daily').upsert(airportRows, { onConflict: 'iata,date' });
    if (error) console.error('airport_daily upsert error:', error.message);
    else console.log(`Upserted ${airportRows.length} airport_daily rows`);
  }

  // ── Upsert route_daily (chunked) ──────────────────────────────
  const routeRows = Object.values(routeAcc).map(r => ({
    dep_iata: r.dep,
    arr_iata: r.arr,
    date: today,
    cancelled: r.cancelled,
    airlines: Array.from(r.airlines),
    updated_at: new Date().toISOString(),
  }));

  for (let i = 0; i < routeRows.length; i += 200) {
    const { error } = await sb.from('route_daily').upsert(routeRows.slice(i, i + 200), {
      onConflict: 'dep_iata,arr_iata,date',
    });
    if (error) console.error(`route_daily chunk ${i} error:`, error.message);
  }
  console.log(`Upserted ${routeRows.length} route_daily rows`);

  // ── Refresh sitrep — full crisis total (ME hubs only, no double-count) ──
  const { data: totals } = await sb
    .from('airport_daily')
    .select('cancelled')
    .gte('date', '2026-03-01')
    .eq('is_me_hub', true);

  const totalCancelled = (totals ?? []).reduce((s, r) => s + (r.cancelled ?? 0), 0);

  await sb.from('sitrep').upsert({
    id: 'current',
    cancelled_flights: totalCancelled,
    stranded_people: totalCancelled * AVG_PAX,
    last_updated: new Date().toISOString(),
  }, { onConflict: 'id' });

  const summary = {
    date: today,
    api_calls: ME_HUB_IATAS.length * 2,
    airports_written: airportRows.length,
    routes_written: routeRows.length,
    crisis_total_cancelled: totalCancelled,
  };
  console.log('[daily-flight-pull] Done:', summary);
  return new Response(JSON.stringify(summary, null, 2), {
    headers: { 'Content-Type': 'application/json' },
  });
});