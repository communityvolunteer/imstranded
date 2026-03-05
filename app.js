// ============================================================
// CONFIG
// ============================================================
const SUPABASE_URL  = 'https://nzvlvqyitsjuxnafcuhl.supabase.co';
const SUPABASE_ANON = 'sb_publishable_jEEyPd33KHXKXM53QvrIKQ_JpzQNSGr';
const _sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON);
const SB_ON = !SUPABASE_URL.includes('YOUR_PROJECT_ID');

const EMBASSY_META = {
  usa:{flag:'🇺🇸',role:'US Embassy'},uk:{flag:'🇬🇧',role:'UK Embassy'},
  aus:{flag:'🇦🇺',role:'Australian Embassy'},can:{flag:'🇨🇦',role:'Canadian Embassy'},
  ind:{flag:'🇮🇳',role:'Indian Embassy'},phl:{flag:'🇵🇭',role:'Philippine Embassy / OWWA'},
  pak:{flag:'🇵🇰',role:'Pakistani Embassy'},bgd:{flag:'🇧🇩',role:'Bangladesh Embassy'},
  npl:{flag:'🇳🇵',role:'Nepalese Embassy'},deu:{flag:'🇩🇪',role:'German Embassy'},
  fra:{flag:'🇫🇷',role:'French Embassy'},eu:{flag:'🇪🇺',role:'EU Delegation'},
};

const COUNTRIES = [
  {id:'uae',name:'United Arab Emirates',status:'danger',
   advisory:'Shelter in place. Airspace closed. DXB/AUH suspended. Iranian missile debris reported in civilian areas.',
   embassy:{usa:{phone:'+971-2-414-2200',email:'ACSAbuDhabi@state.gov'},uk:{phone:'+971-2-610-1100'},aus:{phone:'+61-2-6261-3305',note:'Consular Emergency Centre'},can:{phone:'+971-2-694-0300'},ind:{phone:'800-46342 (toll-free)'},phl:{phone:'+971-50-813-7836'},pak:{phone:'+971-50-254-8975'},bgd:{phone:'+971-2-665-5336'},npl:{phone:'+971-2-444-7804'}},
   airspace:'CLOSED',borders:[{route:'Oman (E611)',status:'warn',note:'Open but drone activity near border.'},{route:'Saudi Arabia',status:'warn',note:'Long 900km+. Fill tank, carry water.'}],
   ngos:['UNHCR','Red Cross UAE','IOM'],coords:[24.47,54.37],telegram:'https://t.me/gulfcrisis'},
  {id:'bahrain',name:'Bahrain',status:'danger',
   advisory:'High alert. Airspace restricted. US Naval base on lockdown. Missile strikes reported.',
   embassy:{usa:{phone:'+973-1724-2700'},uk:{phone:'+973-1757-4100'},ind:{phone:'+973-1771-2785'},phl:{phone:'+973-3995-3235'},pak:{phone:'+973-1771-1789'},bgd:{phone:'+973-1753-3271'}},
   airspace:'RESTRICTED',borders:[{route:'King Fahd Causeway to Saudi',status:'warn',note:'Road crossing open.'}],ngos:['Red Crescent Bahrain'],coords:[26.07,50.55],telegram:null},
  {id:'kuwait',name:'Kuwait',status:'danger',
   advisory:'Airspace closed. Airport struck. US military base on heightened alert.',
   embassy:{usa:{phone:'+965-2259-1001'},uk:{phone:'+965-2259-4320'},ind:{phone:'+965-6550-1946'},phl:{phone:'+965-2220-5571'},bgd:{phone:'+965-6992-0013'}},
   airspace:'CLOSED',borders:[{route:'Saudi Arabia (south)',status:'warn',note:'Monitor hourly.'}],ngos:['Kuwait Red Crescent'],coords:[29.37,47.97],telegram:null},
  {id:'qatar',name:'Qatar',status:'warn',
   advisory:'Airspace restricted. US Al Udeid base sheltering in place.',
   embassy:{usa:{phone:'+974-4496-6000'},uk:{phone:'+974-4496-2100'},aus:{phone:'+61-2-6261-3305',note:'Consular Emergency Centre'},ind:{phone:'+974-5564-7502'},phl:{phone:'+974-4483-1585'}},
   airspace:'RESTRICTED',borders:[{route:'Sea via Doha Port',status:'warn',note:'Some vessels operating.'}],ngos:['Qatar Red Crescent','IOM Qatar'],coords:[25.28,51.53],telegram:null},
  {id:'oman',name:'Oman',status:'warn',
   advisory:'Drone incident near Sohar. Relatively stable. Receiving UAE overland arrivals.',
   embassy:{usa:{phone:'+968-2464-3400'},uk:{phone:'+968-2460-9000'},ind:{phone:'8007-1234 (toll-free)'},phl:{phone:'+968-7990-5211'}},
   airspace:'OPEN (monitor)',borders:[{route:'UAE to Oman (Hatta/Hafeet)',status:'safe',note:'Open. Queues building. Fuel up first.'}],ngos:['Oman Red Crescent'],coords:[23.61,58.59],telegram:null},
  {id:'saudi',name:'Saudi Arabia',status:'warn',
   advisory:'Airspace open on select routes. Receiving overland arrivals.',
   embassy:{usa:{phone:'+966-11-488-3800'},uk:{phone:'+966-11-488-0077'},ind:{phone:'+966-11-488-4697'},phl:{phone:'+966-56-989-3301'}},
   airspace:'PARTIALLY OPEN',borders:[{route:'Receiving from UAE/Kuwait/Bahrain',status:'safe',note:'Land borders open. Delays.'}],ngos:['Saudi Red Crescent'],coords:[23.88,45.07],telegram:null},
  {id:'iran',name:'Iran',status:'danger',
   advisory:'DO NOT TRAVEL. Active military operations. No consular services for most Western nationals.',
   embassy:{usa:{note:'No US Embassy - Swiss: +98-21-2200-8333'},uk:{note:'Limited - FCDO: +44-20-7008-5000'},pak:{phone:'+98-21-669413-88'}},
   airspace:'CLOSED',borders:[{route:'All crossings',status:'danger',note:'Unstable / closed. Do not attempt.'}],ngos:['ICRC (limited)'],coords:[32.43,53.68],telegram:null},
  {id:'iraq',name:'Iraq',status:'danger',
   advisory:'Do not travel. Airspace closed. US facilities targeted.',
   embassy:{usa:{phone:'+964-760-030-7000',note:'Shelter in place'},uk:{phone:'+964-7901-926-280'}},
   airspace:'CLOSED',borders:[{route:'Jordan (Trebil)',status:'warn',note:'Open but slow queues.'}],ngos:['UNHCR Iraq','IOM Iraq','ICRC'],coords:[33.22,43.68],telegram:null},
  {id:'israel',name:'Israel',status:'danger',
   advisory:'High alert. Rocket fire reported. Ben Gurion Airport (TLV) suspended. Shelter in reinforced rooms.',
   embassy:{usa:{phone:'+972-3-519-7575'},uk:{phone:'+972-3-725-1222'},aus:{phone:'+61-2-6261-3305',note:'Consular Emergency Centre'},can:{phone:'+972-3-636-3300'},deu:{phone:'+972-3-693-9000'},fra:{phone:'+972-3-520-0404'}},
   airspace:'CLOSED',borders:[{route:'Jordan (Allenby Bridge)',status:'warn',note:'Open, crossing 24h.'},{route:'Egypt (Taba)',status:'warn',note:'Open, delayed.'},{route:'Egypt via Rafah',status:'danger',note:'Closed.'}],
   ngos:['Magen David Adom','ICRC','WFP'],coords:[31.85,35.22],telegram:null},
];

const WORLDWIDE = [
  {id:'india',name:'India',note:'Air India/IndiGo cancelled Gulf routes. Millions separated.',contacts:[{label:'MOIA 24/7',value:'1800-11-3090 (India toll-free)'},{label:'MEA Emergency',value:'+91-11-2301-2113'}],coords:[20.59,78.96]},
  {id:'philippines',name:'Philippines',note:'Massive OFW disruption. OWWA coordinating repatriation.',contacts:[{label:'OWWA',value:'+632-1348'},{label:'DFA OFW 24/7',value:'+632-8651-9400'}],coords:[12.88,121.77]},
  {id:'pakistan',name:'Pakistan',note:'PIA suspended Gulf routes. CMU activated 24/7.',contacts:[{label:'Pakistan CMU (24/7)',value:'+92-51-9207887'}],coords:[30.38,69.35]},
  {id:'bangladesh',name:'Bangladesh',note:'Hundreds of thousands of workers stranded.',contacts:[{label:'MOFA Helpline',value:'+880-2-9554000'}],coords:[23.68,90.35]},
  {id:'uk_eu',name:'UK / Europe',note:'Flights to South Asia rerouted via Africa (+5-8h).',contacts:[{label:'FCDO 24/7',value:'+44-20-7008-5000'}],coords:[51.5,10.5]},
  {id:'australia',name:'Australia / NZ',note:'Smartraveller raised UAE/Iran to Do Not Travel.',contacts:[{label:'Consular Emergency',value:'+61-2-6261-3305'}],coords:[-25.27,133.77]},
  {id:'bali',name:'Bali / Southeast Asia',note:'1,600+ tourists stranded in Bali after Gulf-routed flights cancelled.',contacts:[{label:'Indonesian Emergency',value:'112'},{label:'Bali Tourism Help',value:'+62-361-224-111'}],coords:[-8.34,115.09]},
];

const NGOS = [
  {type:'Government',name:'US STEP Program',desc:'Register for emergency alerts from US Embassy.',url:'https://step.state.gov'},
  {type:'Government',name:'UK FCDO Travel Advice',desc:'Live advisories and consular support.',url:'https://www.gov.uk/foreign-travel-advice'},
  {type:'Government',name:'Australia Smartraveller',desc:'DFAT advisories and emergency registration.',url:'https://www.smartraveller.gov.au'},
  {type:'Government',name:'Canada ROCA',desc:'Register of Canadians Abroad.',url:'https://travel.gc.ca/travelling/registration'},
  {type:'NGO',name:'UNHCR',desc:'UN Refugee Agency active in UAE, Iraq, Jordan.',url:'https://www.unhcr.org'},
  {type:'NGO',name:'ICRC / Red Cross',desc:'Active across the conflict zone.',url:'https://www.icrc.org'},
  {type:'NGO',name:'IOM',desc:'Emergency evacuation logistics.',url:'https://www.iom.int'},
  {type:'NGO',name:'IRC',desc:'Emergency relief in Iraq and Jordan.',url:'https://www.rescue.org'},
  {type:'NGO',name:'Medecins Sans Frontieres',desc:'Medical teams active in Iraq.',url:'https://www.msf.org'},
  {type:'Info',name:'FlightAware',desc:'Live airspace and flight status.',url:'https://flightaware.com'},
  {type:'Info',name:'ReliefWeb',desc:'Humanitarian news and NGO tracking.',url:'https://reliefweb.int'},
  {type:'Community',name:'r/dubai Megathread',desc:'Real-time reports from expats.',url:'https://reddit.com/r/dubai'},
];


let AIRPORT_DATA = [
  {city:'Dubai',code:'DXB',iata:'DXB',coords:[25.252,55.364],cancelled:312,status:'CLOSED',stranded:56160,updated:'--:--'},
  {city:'Abu Dhabi',code:'AUH',iata:'AUH',coords:[24.432,54.651],cancelled:198,status:'CLOSED',stranded:35640,updated:'--:--'},
  {city:'Kuwait City',code:'KWI',iata:'KWI',coords:[29.226,47.968],cancelled:143,status:'CLOSED',stranded:25740,updated:'--:--'},
  {city:'Doha',code:'DOH',iata:'DOH',coords:[25.273,51.608],cancelled:117,status:'RESTRICTED',stranded:18720,updated:'--:--'},
  {city:'Bahrain',code:'BAH',iata:'BAH',coords:[26.270,50.633],cancelled:89,status:'CLOSED',stranded:16020,updated:'--:--'},
  {city:'Muscat',code:'MCT',iata:'MCT',coords:[23.593,58.284],cancelled:34,status:'OPEN',stranded:2720,updated:'--:--'},
  {city:'Riyadh',code:'RUH',iata:'RUH',coords:[24.957,46.698],cancelled:41,status:'PARTIALLY OPEN',stranded:3280,updated:'--:--'},
  {city:'Tehran',code:'IKA',iata:'IKA',coords:[35.416,51.152],cancelled:201,status:'CLOSED',stranded:36180,updated:'--:--'},
  {city:'Baghdad',code:'BGW',iata:'BGW',coords:[33.262,44.235],cancelled:88,status:'CLOSED',stranded:15840,updated:'--:--'},
];

// ============================================================
// LIVE DATA FROM SUPABASE
// ============================================================
async function fetchSitrepFromSupabase() {
  try {
    const { data, error } = await _sb.from('sitrep').select('*').eq('id', 'current').single();
    if (error || !data) return null;
    const stranded = (data.cancelled_flights || 1847) * (data.avg_passengers_per_flight || 459);
    return {
      stranded,
      cancelled: data.cancelled_flights,
      airports: data.airports_closed,
      airspace: data.airspace_closed_countries,
      lastUpdated: data.last_updated,
    };
  } catch(e) {
    console.warn('Supabase sitrep unavailable, using seeded data');
    return null;
  }
}

// ============================================================
// MAP STATE
// ============================================================
const SC = {danger:'#a855f7',warn:'#a855f7',safe:'#a855f7'};
const _mk = {country:[],routes:[],worldwide:[],help:[]};
let _helpCluster = null;
let _mHelpCluster = null;
let _activeFilter = 'all';
let _postMarkers = [];
let posts = [];
const _dataPins = {airports:[]};
let _legendOpen = true;

// ============================================================
// LEGEND TOGGLE
// ============================================================
function toggleLegend() {
  _legendOpen = !_legendOpen;
  const leg = document.getElementById('map-legend');
  const btn = document.getElementById('legend-toggle-btn');
  if (leg) leg.style.display = _legendOpen ? 'block' : 'none';
  if (btn) btn.style.display = _legendOpen ? 'none' : 'flex';
}

// ============================================================
// VIEW SWITCHING
// ============================================================
function showView(name) {
  document.querySelectorAll('.view').forEach(v => {
    v.classList.remove('active');
    v.style.display = '';
  });
  document.querySelectorAll('nav button').forEach(b => b.classList.remove('active'));
  const view = document.getElementById(name+'-view');
  if (view) { view.classList.add('active'); view.style.display = 'block'; }
  const navBtns = document.querySelectorAll('nav button');
  if (name === 'map' && navBtns[0]) navBtns[0].classList.add('active');
  if (name === 'resources' && navBtns[1]) navBtns[1].classList.add('active');
  if (name === 'map' && !window._mapInit) initMap();
  if (name === 'resources') renderResources();
  if (name === 'help') { renderPosts(); }
}

// ============================================================
// HELP TABS (offer only now)
// ============================================================
function switchHelpTab(tab) {
  // Only offer tab remains
  const offerPanel = document.getElementById('help-panel-offer');
  if (offerPanel) offerPanel.style.display = 'grid';
}

// ============================================================
// DESKTOP MAP FILTER
// ============================================================
function filterMap(type) {
  if (!window._mapInit) { showView('map'); setTimeout(() => filterMap(type), 500); return; }
  if (_activeFilter === type) type = 'all';
  _activeFilter = type;
  const map = window._crisisMap;

  document.querySelectorAll('.sitrep-stat').forEach(s => s.classList.remove('active-filter'));
  const ssMap = {stranded:'ss-stranded',cancelled:'ss-cancelled',airports:'ss-airports',
                 airspace:'ss-airspace',help:'ss-help-offer'};
  if (ssMap[type]) document.getElementById(ssMap[type])?.classList.add('active-filter');

  document.querySelectorAll('.legend-item').forEach(l => l.classList.remove('active-legend'));
  const lm = {help:'leg-help',worldwide:'leg-worldwide'};
  if (lm[type]) document.getElementById(lm[type])?.classList.add('active-legend');

  _mk.country.forEach(({marker,status}) => {
    const show = type==='all'||type===status||
      ['stranded','cancelled','airports','airspace','danger','warn','safe'].includes(type);
    show ? marker.addTo(map) : map.removeLayer(marker);
  });
  _mk.routes.forEach(({marker,status}) => {
    const show = type==='all'||type==='routes'||
      (type==='danger'&&status==='danger')||(type==='warn'&&status!=='safe');
    show ? marker.addTo(map) : map.removeLayer(marker);
  });
  _mk.worldwide.forEach(m => {
    (type==='all'||type==='worldwide') ? m.addTo(map) : map.removeLayer(m);
  });
  // Help cluster layer
  if (_helpCluster) {
    (type==='all'||type==='help') ? map.addLayer(_helpCluster) : map.removeLayer(_helpCluster);
  }

  if (type==='airports'||type==='cancelled'||type==='stranded') {
    renderAirportPins(map, type); map.flyTo([28,47],5,{duration:1});
  } else { clearDataPins(map); }
  if (type==='routes')    map.flyTo([28,46],5,{duration:1});
  if (type==='worldwide') map.flyTo([20,60],3,{duration:1.2});
  if (type==='help') map.flyTo([28,45],5,{duration:1});
  if (type==='all') { clearDataPins(map); map.flyTo([28,45],5,{duration:1}); }

  showView('map');
}

// ============================================================
// INIT MAP
// ============================================================
function initMap() {
  window._mapInit = true;
  const map = L.map('crisis-map',{zoomControl:false}).setView([28,45],5);
  L.control.zoom({position:'bottomright'}).addTo(map);
  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',{
    attribution:'(c)OpenStreetMap (c)CARTO',maxZoom:19
  }).addTo(map);

  // Custom panes — BELOW markerPane (600) so unclustered blue pins sit on top
  // Country glow radius is wide enough to click from outside blue pin area
  map.createPane('countryPane');
  map.getPane('countryPane').style.zIndex = 590;
  map.createPane('worldwidePane');
  map.getPane('worldwidePane').style.zIndex = 580;

  COUNTRIES.forEach(c => {
    const col = SC[c.status];
    const glow = L.circleMarker(c.coords,{pane:'countryPane',interactive:true,radius:28,fillColor:'#ec3452',color:'#ec3452',weight:0,opacity:0,fillOpacity:.12}).addTo(map)
      .bindPopup(`<div style="font-family:Inter,sans-serif;min-width:240px">
        <div style="font-size:.72rem;font-weight:800;text-transform:uppercase;letter-spacing:.08em;color:#fcd34d;margin-bottom:.4rem">${c.name}</div>
        <div style="font-size:.82rem;color:rgba(255,255,255,.85);line-height:1.55;margin-bottom:.6rem">${c.advisory}</div>
        <div style="font-size:.72rem;margin-bottom:.75rem;color:rgba(255,255,255,.6)">Airspace: <strong style="color:${c.airspace==='CLOSED'?'#ec3452':c.airspace.includes('OPEN')?'#17bc7b':'#fcd34d'}">${c.airspace}</strong></div>
        ${c.telegram?`<a href="${c.telegram}" style="color:#3498ec;font-size:.76rem;font-weight:500;display:block;margin-bottom:.6rem" target="_blank">→ Telegram group</a>`:''}
        <button onclick="window.showCountryDetail('${c.id}')" style="background:#3498ec;border:none;color:#fff;font-family:Inter,sans-serif;font-size:.82rem;font-weight:700;padding:.55rem 1rem;cursor:pointer;border-radius:8px;width:100%">Full info &amp; embassies →</button>
      </div>`);
    const dot  = L.circleMarker(c.coords,{pane:'countryPane',interactive:false,radius:8,fillColor:col,color:'#fff',weight:2,opacity:1,fillOpacity:.95}).addTo(map);
    _mk.country.push({marker:glow,status:c.status});
    _mk.country.push({marker:dot,status:c.status});
  });

  WORLDWIDE.forEach(r => {
    const m = L.circleMarker(r.coords,{pane:'worldwidePane',interactive:true,radius:7,fillColor:'#a855f7',color:'#fff',weight:2,opacity:.9,fillOpacity:.55}).addTo(map)
      .bindPopup(`<div style="font-family:Inter,sans-serif;min-width:200px">
        <div style="font-size:.72rem;font-weight:800;text-transform:uppercase;letter-spacing:.07em;color:#d8b4fe;margin-bottom:.3rem">Worldwide: ${r.name}</div>
        <div style="font-size:.78rem;color:rgba(255,255,255,.8);line-height:1.5;margin-bottom:.4rem">${r.note}</div>
        <div style="font-size:.7rem;color:rgba(255,255,255,.5)">${r.contacts[0]?.label}: <strong style="color:#fff">${r.contacts[0]?.value}</strong></div>
      </div>`);
    _mk.worldwide.push(m);
  });

  _helpCluster = L.markerClusterGroup({
    maxClusterRadius: 120,
    spiderfyOnMaxZoom: true,
    showCoverageOnHover: false,
    zoomToBoundsOnClick: true,
    disableClusteringAtZoom: 16,
  });
  map.addLayer(_helpCluster);

  renderPostsOnMap(map);
  window._crisisMap = map;
}

// ============================================================
// AIRPORT PINS
// ============================================================
function renderAirportPins(map, mode) {
  clearDataPins(map);
  const showStranded = mode === 'stranded';
  AIRPORT_DATA.forEach(a => {
    const col = a.status==='CLOSED'?'#ef4444':a.status==='OPEN'?'#22c55e':'#fcd34d';
    const pinNum = showStranded ? a.stranded.toLocaleString() : a.cancelled.toLocaleString();
    const pinSuffix = showStranded ? 'est. stranded' : 'cancelled';
    const icon = L.divIcon({
      className:'airport-pin-label',
      html:`<div style="background:#000;border-radius:999px;padding:5px 10px;font-family:Inter,sans-serif;font-size:11px;font-weight:700;color:#fff;white-space:nowrap;box-shadow:0 2px 8px rgba(0,0,0,.35);display:flex;align-items:center;gap:5px">✈ ${a.code} <span style="opacity:.75;font-size:9.5px">${pinNum} ${pinSuffix}</span></div>`,
      iconAnchor:[0,0],iconSize:null
    });
    const m = L.marker(a.coords,{icon}).addTo(map).bindPopup(`
      <div style="font-family:Inter,sans-serif;min-width:230px">
        <div style="font-size:.65rem;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#fff;margin-bottom:.45rem">✈ ${a.city} — ${a.code}</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:.4rem .85rem;margin-bottom:.55rem">
          <div><div style="font-size:1.5rem;font-weight:800;color:#ec3452;letter-spacing:-.03em;line-height:1">${a.stranded.toLocaleString()}</div><div style="font-size:.58rem;color:rgba(255,255,255,.5);text-transform:uppercase;letter-spacing:.04em;margin-top:.15rem">Est. Stranded</div></div>
          <div><div style="font-size:1.5rem;font-weight:800;color:#FFF;letter-spacing:-.03em;line-height:1">${a.cancelled.toLocaleString()}</div><div style="font-size:.58rem;color:rgba(255,255,255,.5);text-transform:uppercase;letter-spacing:.04em;margin-top:.15rem">Flights Cancelled</div></div>
        </div>
        <div style="display:flex;justify-content:space-between;padding:.35rem .55rem;background:rgba(255,255,255,.08);border-radius:6px;align-items:center;border:1px solid rgba(255,255,255,.1)">
          <span style="font-size:.7rem;font-weight:700;color:${col==='#ef4444'?'#ec3452':col==='#22c55e'?'#22c55e':'#fcd34d'}">Status: ${a.status}</span>
          <span style="font-size:.62rem;color:rgba(255,255,255,.45)">${a.updated !== '--:--' ? 'Updated '+a.updated : 'Seeded data'}</span>
        </div>
      </div>
    `);
    _dataPins.airports.push(m);
  });
}

function clearDataPins(map) {
  _dataPins.airports.forEach(m => { try { map.removeLayer(m); } catch(e) {} });
  _dataPins.airports = [];
}

// ============================================================
// CONTACT BUTTONS + TIP TWEET HELPERS
// ============================================================
function buildContactButtons(contact, xhandle, name) {
  if (!contact) return '';
  const c = contact.trim();
  const btns = [];
  const btnStyle = 'display:inline-flex;align-items:center;gap:3px;padding:.22rem .55rem;border-radius:5px;font-size:.66rem;font-weight:700;text-decoration:none;font-family:Inter,sans-serif;white-space:nowrap;';

  // Email
  const emailMatch = c.match(/[\w.-]+@[\w.-]+\.\w+/);
  if (emailMatch) {
    btns.push(`<a href="mailto:${emailMatch[0]}" target="_blank" style="${btnStyle}background:#059669;color:#fff" title="Email">✉ Email</a>`);
  }

  // Phone / WhatsApp
  const phoneMatch = c.match(/\+?[\d\s\-().]{7,}/);
  if (phoneMatch) {
    const digits = phoneMatch[0].replace(/[\s\-().]/g, '');
    btns.push(`<a href="tel:${digits}" style="${btnStyle}background:#374151;color:#fff" title="Call">📞 Call</a>`);
    btns.push(`<a href="https://wa.me/${digits.replace(/^\+/,'')}" target="_blank" style="${btnStyle}background:#25d366;color:#fff" title="WhatsApp">💬 WhatsApp</a>`);
  }

  // Telegram @handle
  const tgMatch = c.match(/@([A-Za-z0-9_]{3,})/);
  if (tgMatch) {
    btns.push(`<a href="https://t.me/${tgMatch[1]}" target="_blank" style="${btnStyle}background:#229ED9;color:#fff" title="Telegram">✈ Telegram</a>`);
  }

  // X/Twitter handle
  if (xhandle) {
    btns.push(`<a href="https://x.com/${xhandle}" target="_blank" style="${btnStyle}background:#000;color:#fff;border:1px solid rgba(255,255,255,.2)" title="X / Twitter">𝕏 @${xhandle}</a>`);
  }

  return btns.length ? `<div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:.5rem">${btns.join('')}</div>` : '';
}

function buildTipButton(xhandle) {
  if (!xhandle) return '';
  const tweetText = encodeURIComponent(`@bankrbot Tip 1 $HELP to @${xhandle}`);
  return `<a href="https://x.com/intent/tweet?text=${tweetText}" target="_blank" style="display:inline-flex;align-items:center;gap:4px;margin-top:.45rem;padding:.28rem .65rem;background:#3498ec;color:#fff;font-size:.68rem;font-weight:700;border-radius:5px;text-decoration:none;font-family:Inter,sans-serif">💰 Tip $HELP</a>`;
}

async function renderPostsOnMap(map) {
  if (!map) return;
  const cluster = (map === window._mobileMap) ? _mHelpCluster : _helpCluster;
  if (cluster) cluster.clearLayers();
  _mk.help.length = 0; _postMarkers = [];

  for (const p of posts) {
    if (!p.location) continue;
    if (p.type !== 'offer') continue;
    // Use stored coordinates if available, otherwise geocode (for old posts)
    let geo = null;
    if (p.lat && p.lng) {
      geo = { lat: p.lat, lng: p.lng };
    } else {
      geo = await geocodeCity(p.location);
    }
    if (!geo) continue;
    const helpIcon = L.divIcon({
      className:'help-pin',
      html:'<div style="width:14px;height:14px;background:#3b82f6;border:2px solid #fff;border-radius:50%;box-shadow:0 1px 4px rgba(0,0,0,.3)"></div>',
      iconSize:[14,14],iconAnchor:[7,7]
    });
    const m = L.marker([geo.lat,geo.lng],{icon:helpIcon})
      .bindPopup(`<div style="font-family:Inter,sans-serif;min-width:220px;max-width:280px">
        <div style="font-size:.62rem;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#93c5fd;margin-bottom:.25rem">SPARE ROOM</div>
        <div style="font-weight:600;font-size:.84rem;margin-bottom:.2rem;color:#fff">${p.name}</div>
        <div style="font-size:.77rem;color:rgba(255,255,255,.75);line-height:1.5;margin-bottom:.3rem">${(p.body||'').slice(0,120)}${(p.body||'').length>120?'...':''}</div>
        <div style="font-size:.68rem;color:rgba(255,255,255,.4);margin-bottom:.15rem">📍 ${p.location}</div>
        ${buildContactButtons(p.contact, p.xhandle, p.name)}
        ${buildTipButton(p.xhandle)}
      </div>`);
    if (cluster) cluster.addLayer(m);
    _mk.help.push(m);
    _postMarkers.push(m);
  }
}

const _geoCache = {};
async function geocodeCity(city) {
  if (_geoCache[city]) return _geoCache[city];
  try {
    const r = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city)}&format=json&limit=1`,{headers:{'Accept-Language':'en','User-Agent':'ImStranded/1.0'}});
    const d = await r.json();
    if (d && d[0]) {
      const result = {lat:parseFloat(d[0].lat),lng:parseFloat(d[0].lon)};
      _geoCache[city] = result;
      return result;
    }
  } catch(e) {}
  return null;
}

window.showCountryDetail = function(id) {
  const c = COUNTRIES.find(x=>x.id===id)||WORLDWIDE.find(x=>x.id===id);
  if (!c) return;
  showView('resources');
  setTimeout(() => {
    const el = document.getElementById('card-'+id);
    if (el) { el.scrollIntoView({behavior:'smooth',block:'start'}); el.classList.add('highlight'); setTimeout(()=>el.classList.remove('highlight'),2000); }
  }, 200);
};

// ============================================================
// RESOURCES
// ============================================================
let _resFilter = 'all';
function filterResources(f, btn) {
  _resFilter = f;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderResources();
}
function renderResources() {
  const grid = document.getElementById('resources-grid');
  if (!grid) return;
  let html = '';
  if (_resFilter==='all'||_resFilter==='embassy') {
    html += COUNTRIES.map(c => {
      const embs = Object.entries(c.embassy).map(([key,info]) => {
        const M = EMBASSY_META[key]||{flag:'',role:key.toUpperCase()};
        const phone = info.phone||info.alt||null;
        return `<div class="embassy-row"><div style="flex:1"><span class="embassy-name">${M.flag} ${M.role}</span>${info.note?`<div class="embassy-note">${info.note}</div>`:''}</div>${phone?`<a class="call-btn" href="tel:${phone.replace(/[\s\-()]/g,'')}">${phone}</a>`:''}</div>`;
      }).join('');
      return `<div class="country-card ${c.status}" id="card-${c.id}">
        <div class="card-header"><div class="card-name">${c.name}</div><span class="status-badge ${c.status}">${c.status.toUpperCase()}</span></div>
        <div class="card-advisory">${c.advisory}</div>
        <div class="info-row"><span class="info-label">Airspace</span><span style="color:${c.airspace==='CLOSED'?'var(--danger)':c.airspace.includes('OPEN')?'var(--safe)':'var(--warn)'};font-weight:600">${c.airspace}</span></div>
        ${c.borders.map(b=>`<div class="info-row"><span class="info-label">${b.route}</span><span style="color:${b.status==='safe'?'var(--safe)':b.status==='warn'?'var(--warn)':'var(--danger)'};font-weight:600">${b.status.toUpperCase()}</span></div>`).join('')}
        <div class="embassy-section"><div class="embassy-title">Emergency Contacts</div>${embs||'<div style="font-size:.75rem;color:var(--muted)">Check embassy website</div>'}</div>
        ${c.ngos?.length?`<div class="ngo-tags">${c.ngos.map(n=>`<span class="ngo-tag">${n}</span>`).join('')}</div>`:''}
        ${c.telegram?`<a class="telegram-link" href="${c.telegram}" target="_blank">→ Telegram group</a>`:''}
      </div>`;
    }).join('');
    html += WORLDWIDE.map(r=>`<div class="country-card safe" id="card-${r.id}"><div class="card-name" style="margin-bottom:.5rem">Worldwide: ${r.name}</div><div class="card-advisory">${r.note}</div>${r.contacts.map(c=>`<div class="info-row"><span class="info-label">${c.label}</span><span>${c.value}</span></div>`).join('')}</div>`).join('');
  }
  if (_resFilter==='all'||_resFilter==='ngo'||_resFilter==='info') {
    html += NGOS.filter(r=>_resFilter==='all'||(_resFilter==='ngo'&&r.type!=='Info'&&r.type!=='Government')||(_resFilter==='info'&&(r.type==='Info'||r.type==='Government')))
      .map(r=>`<div class="resource-card"><div class="resource-type">${r.type}</div><div class="resource-name">${r.name}</div><div class="resource-desc">${r.desc}</div><a class="resource-link" href="${r.url}" target="_blank" rel="noopener">Open →</a></div>`).join('');
  }
  grid.innerHTML = html || '<div class="empty-state">No items match this filter.</div>';
}

// ============================================================
// HELP BOARD (offer only)
// ============================================================
function renderPosts() {
  const el = document.getElementById('offer-posts');
  if (!el) return;
  const offerPosts = posts.filter(p=>p.type==='offer');
  if (!offerPosts.length) { el.innerHTML='<div class="empty-state">No offers yet — be the first to post.</div>'; return; }
  el.innerHTML = offerPosts.map(p => {
    const t = p.created_at ? new Date(p.created_at).toLocaleString() : '';
    return `<div class="post-card">
      <div class="post-header"><span class="post-type">Offering</span><span class="post-time">${t}</span></div>
      <div class="post-loc">📍 ${p.location}</div>
      <div class="post-body">${p.body}</div>
      <div class="post-footer">
        <span style="font-size:.77rem;color:var(--muted)">${p.name}</span>
      </div>
      ${buildContactButtons(p.contact, p.xhandle, p.name)}
      ${buildTipButton(p.xhandle)}
    </div>`;
  }).join('');
}

async function submitPost(type) {
  const t=document.getElementById(type+'-type')?.value,
    l=document.getElementById(type+'-location')?.value,
    b=document.getElementById(type+'-body')?.value,
    n=document.getElementById(type+'-name')?.value,
    c=document.getElementById(type+'-contact')?.value,
    x=(document.getElementById(type+'-xhandle')?.value||'').trim().replace(/^@+/,''),
    lat=parseFloat(document.getElementById(type+'-lat')?.value)||null,
    lng=parseFloat(document.getElementById(type+'-lng')?.value)||null;
  if(!t||!l||!b||!n||!c){alert('Please fill in all required fields.');return;}
  if(!lat||!lng){alert('Please select a location from the dropdown suggestions.');return;}
  const editCode = document.getElementById(type+'-password')?.value?.trim();
  if(!editCode||editCode.length<4){alert('Please enter a password (at least 4 characters) to manage your post later.');return;}
  const btn=document.querySelector(`.submit-btn--${type}`); if(!btn)return;
  btn.textContent='Posting...'; btn.disabled=true;
  try {
    const{error}=await _sb.from('help_posts').insert({type,post_type:t,location:l,body:b,name:n,contact:c,xhandle:x||null,lat,lng,edit_code:editCode,flagged:false});
    if(error)throw error;
    ['type','location','body','name','contact','xhandle','password'].forEach(f=>{const el=document.getElementById(type+'-'+f);if(el)el.tagName==='SELECT'?el.selectedIndex=0:el.value='';});
    document.getElementById(type+'-lat').value='';document.getElementById(type+'-lng').value='';
    btn.textContent='Posted!';
    setTimeout(()=>{btn.textContent='Post Offer';btn.disabled=false;},3000);
    loadPosts();
  } catch(e){alert('Failed: '+e.message);btn.textContent='Post Offer';btn.disabled=false;}
}

// ============================================================
// SITREP
// ============================================================
function animCount(id, target, dur) {
  const el=document.getElementById(id); if(!el||target==null)return;
  const raw=el.textContent.replace(/[^0-9]/g,'');
  const startVal=raw.length?parseInt(raw):0;
  const start=Date.now();
  const step=()=>{
    const p=Math.min((Date.now()-start)/dur,1);
    const v=Math.round(startVal+(target-startVal)*(1-Math.pow(1-p,3)));
    el.textContent=v.toLocaleString();
    if(p<1)requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}
function setStatNow(id,val){const el=document.getElementById(id);if(el)el.textContent=typeof val==='number'?val.toLocaleString():val;}

async function refreshSitrep() {
  const icon=document.getElementById('refresh-icon');
  if(icon) icon.classList.add('spinning');

  const liveStats = await fetchSitrepFromSupabase();
  const totalCancelled = AIRPORT_DATA.reduce((s,a)=>s+a.cancelled,0);
  const totalStranded  = AIRPORT_DATA.reduce((s,a)=>s+a.stranded,0);
  const airportsClosed = AIRPORT_DATA.filter(a=>a.status==='CLOSED').length;
  const vals = liveStats || {stranded:totalStranded,cancelled:totalCancelled,airports:airportsClosed,airspace:4};

  setStatNow('stat-stranded',vals.stranded);
  setStatNow('stat-cancelled',vals.cancelled);
  setStatNow('stat-airports-closed',vals.airports);
  setStatNow('stat-airspace',vals.airspace);
  setStatNow('m-stat-stranded',vals.stranded);
  setStatNow('m-stat-cancelled',vals.cancelled);

  animCount('stat-stranded',vals.stranded,1200);
  animCount('stat-cancelled',vals.cancelled,800);
  animCount('stat-airports-closed',vals.airports,500);
  animCount('stat-airspace',vals.airspace,500);
  animCount('m-stat-stranded',vals.stranded,1200);
  animCount('m-stat-cancelled',vals.cancelled,800);

  if(SB_ON){
    const[offerRes]=await Promise.all([
      _sb.from('help_posts').select('*',{count:'exact',head:true}).eq('flagged',false).eq('type','offer'),
    ]);
    const hc=offerRes.count||0;
    setStatNow('stat-help-posts',hc);
    setStatNow('m-tab-spare-num',hc);
    animCount('stat-help-posts',hc,600);
    animCount('m-tab-spare-num',hc,600);
  } else {
    setStatNow('stat-help-posts',0);
    setStatNow('m-tab-spare-num',0);
  }

  const now=new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});
  const lbl=document.getElementById('last-updated-label'); if(lbl)lbl.textContent='Updated: '+now;
  if(icon) icon.classList.remove('spinning');
}

// ============================================================
// SUPABASE
// ============================================================
async function loadPosts() {
  if(!SB_ON)return;
  const{data}=await _sb.from('help_posts').select('id,type,post_type,location,body,name,contact,xhandle,lat,lng,created_at').eq('flagged',false).eq('type','offer').order('created_at',{ascending:false}).limit(100);
  if(data){posts=data;renderPosts();renderPostsOnMap(window._crisisMap||window._mobileMap);}
}
function subscribeStream(){
  if(!SB_ON)return;
  _sb.channel('help_posts').on('postgres_changes',{event:'INSERT',schema:'public',table:'help_posts'},p=>{
    if(p.new.type==='offer'){posts.unshift(p.new);renderPosts();renderPostsOnMap(window._crisisMap||window._mobileMap);}
  }).subscribe();
  // Live sitrep updates — when scraper writes new data, refresh instantly
  _sb.channel('sitrep').on('postgres_changes',{event:'UPDATE',schema:'public',table:'sitrep'},()=>{
    refreshSitrep();
  }).subscribe();
}

// ============================================================
// MOBILE
// ============================================================
let _mSheetOpen=false,_mCurrentTab='map';
const isMob=()=>window.innerWidth<=600;

function initMobile(){
  window._mobileInit=true;
  document.getElementById('m-shell').style.display='flex';
  const mmap=L.map('m-crisis-map',{zoomControl:false,attributionControl:false}).setView([28,45],4);
  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',{maxZoom:19}).addTo(mmap);

  mmap.createPane('countryPane');
  mmap.getPane('countryPane').style.zIndex = 590;
  mmap.createPane('worldwidePane');
  mmap.getPane('worldwidePane').style.zIndex = 580;

  COUNTRIES.forEach(c => {
    const col = SC[c.status];
    L.circleMarker(c.coords, {pane:'countryPane',interactive:true,radius:28,fillColor:'#ec3452',color:'#ec3452',weight:0,opacity:0,fillOpacity:.12}).addTo(mmap)
      .on('click', () => openMCountryPopup(c.id));
    L.circleMarker(c.coords, {pane:'countryPane',interactive:false,radius:10,fillColor:col,color:'#fff',weight:2,opacity:1,fillOpacity:.92}).addTo(mmap);
  });
  WORLDWIDE.forEach(r=>{
    L.circleMarker(r.coords,{pane:'worldwidePane',interactive:true,radius:7,fillColor:'#a855f7',color:'#fff',weight:1.5,opacity:.9,fillOpacity:.5}).addTo(mmap)
      .on('click',()=>openMWorldwidePopup(r.id));
  });
  window._mobileMap=mmap;
  _mHelpCluster = L.markerClusterGroup({
    maxClusterRadius: 120,
    spiderfyOnMaxZoom: true,
    showCoverageOnHover: false,
    zoomToBoundsOnClick: true,
    disableClusteringAtZoom: 16,
  });
  mmap.addLayer(_mHelpCluster);
  mRenderResources();
}

function mFilterMap(type){
  document.querySelectorAll('.m-stat').forEach(s=>s.classList.remove('active-filter'));
  const msMap={stranded:'mss-stranded',cancelled:'mss-cancelled',help:'mss-offer'};
  if(msMap[type]) document.getElementById(msMap[type])?.classList.add('active-filter');
  const mm=window._mobileMap; if(!mm)return;
  if(type==='airports'||type==='cancelled'||type==='stranded'){renderAirportPins(mm,type);mm.flyTo([28,47],5,{duration:1});}
  else clearDataPins(mm);
  if(type==='worldwide') mm.flyTo([20,40],3,{duration:1.2});
  if(type==='all'){clearDataPins(mm);mm.flyTo([28,45],4,{duration:1});}
}

function openMFilterLegend(){
  document.getElementById('m-filter-legend')?.classList.add('open');
}
function closeMFilterLegend(){
  document.getElementById('m-filter-legend')?.classList.remove('open');
}

const PHONE_SVG=`<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>`;

function openMCountryPopup(id){
  const c=COUNTRIES.find(x=>x.id===id); if(!c)return;
  const col=SC[c.status];
  const acCol=c.airspace==='CLOSED'?'#dc2626':c.airspace.includes('OPEN')?'#059669':'#d97706';
  const embRows=Object.entries(c.embassy).map(([key,info])=>{
    const M=EMBASSY_META[key]||{flag:'',role:key.toUpperCase()};
    const phone=info.phone||info.alt||null;
    return `<div class="m-emb-row"><div class="m-emb-who"><span class="m-emb-country">${M.flag} ${M.role}</span>${info.note?`<span class="m-emb-role">${info.note}</span>`:''}</div>${phone?`<a class="m-call-btn" href="tel:${phone.replace(/[\s\-()]/g,'')}">${PHONE_SVG} Call</a>`:''}</div>`;
  }).join('');
  const borderRows=c.borders.map(b=>{
    const bc=b.status==='safe'?'#059669':b.status==='warn'?'#d97706':'#dc2626';
    return `<div class="m-popup-info-row"><span style="color:#fff;font-size:.72rem">${b.route}</span><span style="color:${bc};font-weight:600;font-size:.78rem">${b.status.toUpperCase()} — ${b.note}</span></div>`;
  }).join('');
  document.getElementById('m-popup-title').textContent=c.name;
  document.getElementById('m-popup-body').innerHTML=`
    <div class="m-popup-badge" style="background:${col}18;color:${col};border:1px solid ${col}44">${c.status.toUpperCase()}</div>
    <div class="m-popup-advisory">${c.advisory}</div>
    <div class="m-popup-info-row"><span style="font-size:.72rem;color:#fff">Airspace</span><span style="color:${acCol};font-weight:700">${c.airspace}</span></div>
    ${borderRows}
    <div class="m-popup-section-title">Embassy Emergency Contacts</div>
    ${embRows||'<div style="font-size:.78rem;color:var(--muted)">Check embassy website</div>'}
    ${c.ngos?.length?`<div class="m-popup-section-title">Active NGOs</div><div class="ngo-tags" style="display:flex;flex-wrap:wrap;gap:.3rem;margin-top:.3rem">${c.ngos.map(n=>`<span style="background:#eff6ff30;color:#3498ec;font-size:.63rem;font-weight:600;border-radius:4px;padding:.14rem .48rem">${n}</span>`).join('')}</div>`:''}
    ${c.telegram?`<a href="${c.telegram}" target="_blank" style="display:inline-block;margin-top:.65rem;color:#2563eb;font-size:.8rem;font-weight:500">→ Telegram group</a>`:''}
  `;
  document.getElementById('m-country-popup').classList.add('open');
}

function openMWorldwidePopup(id){
  const r=WORLDWIDE.find(x=>x.id===id); if(!r)return;
  document.getElementById('m-popup-title').textContent=r.name;
  document.getElementById('m-popup-body').innerHTML=`
    <div class="m-popup-advisory">${r.note}</div>
    <div class="m-popup-section-title">Emergency Contacts</div>
    ${r.contacts.map(c=>`<div class="m-popup-info-row"><span style="font-size:.72rem;color:#fff">${c.label}</span><span style="font-weight:600">${c.value}</span></div>`).join('')}
  `;
  document.getElementById('m-country-popup').classList.add('open');
}

function closeMPopup(){document.getElementById('m-country-popup').classList.remove('open');}

function mTab(tab,btn){
  const sheet=document.getElementById('m-sheet');

  // MAP FILTERS tab opens the filter legend overlay (no sheet)
  if(tab==='filters'){
    // Close sheet if open
    _mSheetOpen=false; sheet.classList.remove('open');
    // Toggle filter legend
    openMFilterLegend();
    // Highlight
    document.querySelectorAll('.m-tab,.m-tab-spare').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    _mCurrentTab='filters';
    return;
  }

  if(_mCurrentTab===tab&&tab!=='map'&&_mSheetOpen){
    _mSheetOpen=false;sheet.classList.remove('open');_mCurrentTab='map';
    document.querySelectorAll('.m-tab,.m-tab-spare').forEach(b=>b.classList.remove('active'));
    document.getElementById('mtab-filters').classList.add('active');return;
  }
  document.querySelectorAll('.m-tab,.m-tab-spare').forEach(b=>b.classList.remove('active'));
  if(btn) btn.classList.add('active');
  _mCurrentTab=tab;
  if(tab==='map'){_mSheetOpen=false;sheet.classList.remove('open');}
  else if(tab==='resources') mShowSheetContent('resources','ADDITIONAL RESOURCES');
  else if(tab==='offer')     mShowSheetContent('offer','OFFER A SPARE ROOM');
  else if(tab==='edit')      mShowSheetContent('edit','Edit My Post');
}

function mShowSheetContent(which,title){
  document.getElementById('m-resources-content').style.display=which==='resources'?'block':'none';
  document.getElementById('m-offer-content').style.display=which==='offer'?'block':'none';
  document.getElementById('m-edit-content').style.display=which==='edit'?'block':'none';
  document.getElementById('m-sheet-title').textContent=title;
  _mSheetOpen=true;document.getElementById('m-sheet').classList.add('open');
}

function mSheetToggle(){
  _mSheetOpen=!_mSheetOpen;document.getElementById('m-sheet').classList.toggle('open',_mSheetOpen);
  if(!_mSheetOpen){_mCurrentTab='map';document.querySelectorAll('.m-tab,.m-tab-spare').forEach(b=>b.classList.remove('active'));document.getElementById('mtab-filters').classList.add('active');}
}

function mRenderResources(){
  const el=document.getElementById('m-resources-content');if(!el)return;
  let html='<div style="font-size:.65rem;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:rgba(255,255,255,.4);margin-bottom:.6rem;margin-top:.25rem">Country Embassies</div>';
  html+=COUNTRIES.map(c=>`
    <div class="m-emb-section">
      <div class="m-emb-country-title" style="color:${SC[c.status]}">${c.name} <span style="font-size:.6rem;font-weight:600;text-transform:uppercase;opacity:.6">${c.status}</span></div>
      ${Object.entries(c.embassy).slice(0,4).map(([key,info])=>{
        const M=EMBASSY_META[key]||{flag:'',role:key.toUpperCase()};
        const phone=info.phone||info.alt||null;
        return `<div class="m-emb-row"><div class="m-emb-who"><span class="m-emb-country">${M.flag} ${M.role}</span>${info.note?`<span class="m-emb-role">${info.note}</span>`:''}</div>${phone?`<a class="m-call-btn" href="tel:${phone.replace(/[\s\-()]/g,'')}">${PHONE_SVG} Call</a>`:''}</div>`;
      }).join('')}
    </div>`).join('');
  html+='<div style="font-size:.65rem;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:rgba(255,255,255,.4);margin:.9rem 0 .6rem">NGOs and Info</div>';
  html+=NGOS.map(r=>`<div class="m-res-row"><div><div class="m-res-name">${r.name}<span class="m-res-type">${r.type}</span></div></div><a class="m-res-go" href="${r.url}" target="_blank">Open</a></div>`).join('');
  el.innerHTML=html;
}

async function mSubmitOffer(){
  const l=document.getElementById('m-offer-location')?.value,b=document.getElementById('m-offer-body')?.value,
    n=document.getElementById('m-offer-name')?.value,c=document.getElementById('m-offer-contact')?.value,
    x=(document.getElementById('m-offer-xhandle')?.value||'').trim().replace(/^@+/,''),
    lat=parseFloat(document.getElementById('m-offer-lat')?.value)||null,
    lng=parseFloat(document.getElementById('m-offer-lng')?.value)||null;
  if(!l||!b||!n||!c){alert('Please fill in all fields.');return;}
  if(!lat||!lng){alert('Please select a location from the dropdown suggestions.');return;}
  const editCode = document.getElementById('m-offer-password')?.value?.trim();
  if(!editCode||editCode.length<4){alert('Please enter a password (at least 4 characters) to manage your post later.');return;}
  const btn=document.querySelector('#m-offer-content .m-submit');btn.textContent='Posting...';btn.disabled=true;
  try{
    const{error}=await _sb.from('help_posts').insert({type:'offer',post_type:'General',location:l,body:b,name:n,contact:c,xhandle:x||null,lat,lng,edit_code:editCode,flagged:false});
    if(error)throw error;
    ['location','body','name','contact','xhandle','password'].forEach(f=>{const el=document.getElementById('m-offer-'+f);if(el)el.value='';});
    document.getElementById('m-offer-lat').value='';document.getElementById('m-offer-lng').value='';
    btn.textContent='Posted!';
    setTimeout(()=>{btn.textContent='Post Offer';btn.disabled=false;},3000);
    loadPosts();
  }catch(e){alert('Failed: '+e.message);btn.textContent='Post Offer';btn.disabled=false;}
}

// ============================================================
// Edit My Post
// ============================================================
function openEditPostsSheet(){
  mTab('edit', document.getElementById('mtab-filters'));
}

async function mSearchMyPosts(){
  const code = (document.getElementById('m-edit-contact')?.value||'').trim();
  if(!code){alert('Please enter your password.');return;}
  const list = document.getElementById('m-my-posts-list');
  if(!list)return;
  list.innerHTML='<div style="color:rgba(255,255,255,.5);font-size:.82rem;padding:.5rem 0">Searching...</div>';
  try{
    const{data,error}=await _sb.from('help_posts').select('id,location,body,created_at').eq('edit_code',code).eq('type','offer').eq('flagged',false).order('created_at',{ascending:false});
    if(error)throw error;
    if(!data||!data.length){
      list.innerHTML='<div style="color:rgba(255,255,255,.5);font-size:.82rem;padding:.5rem 0">No posts found for that password.</div>';
      return;
    }
    list.innerHTML=data.map(p=>{
      const t=p.created_at?new Date(p.created_at).toLocaleString():'';
      return `<div style="background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);border-radius:10px;padding:.75rem;margin-bottom:.6rem">
        <div style="font-size:.7rem;color:rgba(255,255,255,.45);margin-bottom:.2rem">${t}</div>
        <div style="font-size:.85rem;font-weight:600;color:#fff;margin-bottom:.15rem">📍 ${p.location}</div>
        <div style="font-size:.8rem;color:rgba(255,255,255,.7);line-height:1.5;margin-bottom:.6rem">${(p.body||'').slice(0,120)}${(p.body||'').length>120?'...':''}</div>
        <div style="display:flex;gap:.5rem">
          <button onclick="mDeletePost('${p.id}','${code}')" style="background:#ec3452;color:#fff;border:none;border-radius:7px;padding:.35rem .8rem;font-size:.72rem;font-weight:700;cursor:pointer;font-family:Inter,sans-serif">Delete</button>
        </div>
      </div>`;
    }).join('');
  }catch(e){
    list.innerHTML=`<div style="color:#ec3452;font-size:.82rem;padding:.5rem 0">Error: ${e.message}</div>`;
  }
}

async function mDeletePost(id, code){
  if(!confirm('Delete this post? This cannot be undone.'))return;
  try{
    const{error}=await _sb.from('help_posts').update({flagged:true}).eq('id',id).eq('edit_code',code);
    if(error)throw error;
    mSearchMyPosts();
    loadPosts();
  }catch(e){alert('Failed to delete: '+e.message);}
}

// ============================================================
// LOCATION AUTOCOMPLETE (Nominatim)
// ============================================================
function initLocationAutocomplete(inputId, latId, lngId, listId) {
  const input = document.getElementById(inputId);
  const latEl = document.getElementById(latId);
  const lngEl = document.getElementById(lngId);
  const list = document.getElementById(listId);
  if (!input || !list) return;

  let _acTimer = null;
  let _acIdx = -1;
  let _acResults = [];

  input.addEventListener('input', () => {
    clearTimeout(_acTimer);
    const q = input.value.trim();
    if (q.length < 3) { list.classList.remove('open'); return; }
    if (latEl) latEl.value = '';
    if (lngEl) lngEl.value = '';
    _acTimer = setTimeout(async () => {
      try {
        const r = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=5&addressdetails=1`, {
          headers: { 'Accept-Language': 'en', 'User-Agent': 'ImStranded/1.0' }
        });
        _acResults = await r.json();
        if (!_acResults.length) { list.classList.remove('open'); return; }
        _acIdx = -1;
        list.innerHTML = _acResults.map((r, i) => {
          const main = r.display_name.split(',').slice(0, 3).join(',');
          const rest = r.display_name.split(',').slice(3).join(',');
          return `<div class="loc-ac-item" data-idx="${i}">${main}${rest ? `<small>${rest}</small>` : ''}</div>`;
        }).join('');
        list.classList.add('open');
        list.querySelectorAll('.loc-ac-item').forEach(item => {
          item.addEventListener('mousedown', (e) => {
            e.preventDefault();
            selectAc(parseInt(item.dataset.idx));
          });
        });
      } catch (e) { list.classList.remove('open'); }
    }, 350);
  });

  function selectAc(idx) {
    const r = _acResults[idx];
    if (!r) return;
    input.value = r.display_name.split(',').slice(0, 3).join(',').trim();
    if (latEl) latEl.value = r.lat;
    if (lngEl) lngEl.value = r.lon;
    list.classList.remove('open');
  }

  input.addEventListener('keydown', (e) => {
    const items = list.querySelectorAll('.loc-ac-item');
    if (!items.length || !list.classList.contains('open')) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); _acIdx = Math.min(_acIdx + 1, items.length - 1); updateHighlight(items); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); _acIdx = Math.max(_acIdx - 1, 0); updateHighlight(items); }
    else if (e.key === 'Enter' && _acIdx >= 0) { e.preventDefault(); selectAc(_acIdx); }
    else if (e.key === 'Escape') { list.classList.remove('open'); }
  });

  function updateHighlight(items) {
    items.forEach((it, i) => it.classList.toggle('active', i === _acIdx));
  }

  input.addEventListener('blur', () => { setTimeout(() => list.classList.remove('open'), 200); });
}

// ============================================================
// INIT
// ============================================================
window.addEventListener('DOMContentLoaded',()=>{
  if(isMob()){ initMobile(); }
  else { showView('map'); }
  // Init autocomplete on both desktop and mobile location fields
  initLocationAutocomplete('offer-location','offer-lat','offer-lng','offer-location-ac');
  initLocationAutocomplete('m-offer-location','m-offer-lat','m-offer-lng','m-offer-location-ac');
  refreshSitrep();
  setInterval(refreshSitrep,5*60*1000);
  if(SB_ON){loadPosts();subscribeStream();}
  else{
    const el=document.getElementById('offer-posts');
    if(el)el.innerHTML='<div class="empty-state" style="color:var(--warn)">Supabase not configured.</div>';
  }
});
window.addEventListener('resize',()=>{if(isMob()&&!window._mobileInit)initMobile();});