// ============================================================
// CONFIG
// ============================================================
const SUPABASE_URL  = 'https://nzvlvqyitsjuxnafcuhl.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im56dmx2cXlpdHNqdXhuYWZjdWhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0MTQxOTEsImV4cCI6MjA4Nzk5MDE5MX0.K4JCnTJTBR7zQBaLmxbeZS2QBRCIxdVzbZKrmapOEkw';
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
  // Gulf — Major
  {city:'Dubai',code:'DXB',iata:'DXB',coords:[25.252,55.364],cancelled:312,status:'CLOSED',stranded:56160,updated:'--:--'},
  {city:'Abu Dhabi',code:'AUH',iata:'AUH',coords:[24.432,54.651],cancelled:198,status:'CLOSED',stranded:35640,updated:'--:--'},
  {city:'Doha',code:'DOH',iata:'DOH',coords:[25.273,51.608],cancelled:117,status:'RESTRICTED',stranded:18720,updated:'--:--'},
  {city:'Kuwait City',code:'KWI',iata:'KWI',coords:[29.226,47.968],cancelled:143,status:'CLOSED',stranded:25740,updated:'--:--'},
  {city:'Bahrain',code:'BAH',iata:'BAH',coords:[26.270,50.633],cancelled:89,status:'CLOSED',stranded:16020,updated:'--:--'},
  {city:'Muscat',code:'MCT',iata:'MCT',coords:[23.593,58.284],cancelled:34,status:'OPEN',stranded:2720,updated:'--:--'},
  // Gulf — Regional
  {city:'Sharjah',code:'SHJ',iata:'SHJ',coords:[25.329,55.517],cancelled:67,status:'CLOSED',stranded:8040,updated:'--:--'},
  {city:'Al Maktoum (DWC)',code:'DWC',iata:'DWC',coords:[24.896,55.161],cancelled:28,status:'CLOSED',stranded:3360,updated:'--:--'},
  {city:'Ras Al Khaimah',code:'RKT',iata:'RKT',coords:[25.613,55.939],cancelled:12,status:'RESTRICTED',stranded:960,updated:'--:--'},
  {city:'Salalah',code:'SLL',iata:'SLL',coords:[17.038,54.091],cancelled:8,status:'OPEN',stranded:480,updated:'--:--'},
  // Saudi
  {city:'Riyadh',code:'RUH',iata:'RUH',coords:[24.957,46.698],cancelled:41,status:'PARTIALLY OPEN',stranded:3280,updated:'--:--'},
  {city:'Jeddah',code:'JED',iata:'JED',coords:[21.670,39.150],cancelled:52,status:'OPEN',stranded:4160,updated:'--:--'},
  {city:'Dammam',code:'DMM',iata:'DMM',coords:[26.471,49.798],cancelled:38,status:'PARTIALLY OPEN',stranded:3040,updated:'--:--'},
  {city:'Medina',code:'MED',iata:'MED',coords:[24.553,39.705],cancelled:15,status:'OPEN',stranded:1200,updated:'--:--'},
  // Conflict zone
  {city:'Tehran',code:'IKA',iata:'IKA',coords:[35.416,51.152],cancelled:201,status:'CLOSED',stranded:36180,updated:'--:--'},
  {city:'Baghdad',code:'BGW',iata:'BGW',coords:[33.262,44.235],cancelled:88,status:'CLOSED',stranded:15840,updated:'--:--'},
  {city:'Erbil',code:'EBL',iata:'EBL',coords:[36.237,43.963],cancelled:22,status:'RESTRICTED',stranded:2640,updated:'--:--'},
  {city:'Basra',code:'BSR',iata:'BSR',coords:[30.549,47.662],cancelled:19,status:'CLOSED',stranded:2280,updated:'--:--'},
  {city:'Tel Aviv',code:'TLV',iata:'TLV',coords:[32.011,34.887],cancelled:156,status:'CLOSED',stranded:28080,updated:'--:--'},
  // Transit / Alternative routes
  {city:'Amman',code:'AMM',iata:'AMM',coords:[31.723,35.993],cancelled:24,status:'OPEN',stranded:1920,updated:'--:--'},
  {city:'Beirut',code:'BEY',iata:'BEY',coords:[33.821,35.488],cancelled:31,status:'RESTRICTED',stranded:3720,updated:'--:--'},
  {city:'Cairo',code:'CAI',iata:'CAI',coords:[30.122,31.406],cancelled:18,status:'OPEN',stranded:1440,updated:'--:--'},
  {city:'Istanbul',code:'IST',iata:'IST',coords:[41.261,28.742],cancelled:45,status:'OPEN',stranded:5400,updated:'--:--'},
  // Key destination airports (where people are trying to GET to)
  {city:'Mumbai',code:'BOM',iata:'BOM',coords:[19.089,72.868],cancelled:87,status:'DISRUPTED',stranded:6960,updated:'--:--'},
  {city:'Delhi',code:'DEL',iata:'DEL',coords:[28.556,77.100],cancelled:94,status:'DISRUPTED',stranded:7520,updated:'--:--'},
  {city:'Manila',code:'MNL',iata:'MNL',coords:[14.508,121.020],cancelled:63,status:'DISRUPTED',stranded:5040,updated:'--:--'},
  {city:'Islamabad',code:'ISB',iata:'ISB',coords:[33.616,72.829],cancelled:42,status:'DISRUPTED',stranded:3360,updated:'--:--'},
  {city:'Dhaka',code:'DAC',iata:'DAC',coords:[23.843,90.398],cancelled:38,status:'DISRUPTED',stranded:3040,updated:'--:--'},
  {city:'Colombo',code:'CMB',iata:'CMB',coords:[7.181,79.884],cancelled:21,status:'DISRUPTED',stranded:1680,updated:'--:--'},
  {city:'Kathmandu',code:'KTM',iata:'KTM',coords:[27.697,85.358],cancelled:16,status:'DISRUPTED',stranded:1280,updated:'--:--'},
  {city:'Bali',code:'DPS',iata:'DPS',coords:[-8.748,115.167],cancelled:29,status:'DISRUPTED',stranded:2320,updated:'--:--'},
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
  if (name === 'feed' && navBtns[1]) navBtns[1].classList.add('active');
  if (name === 'resources' && navBtns[2]) navBtns[2].classList.add('active');
  if (name === 'map' && !window._mapInit) initMap();
  if (name === 'resources') renderResources();
  if (name === 'feed') loadFeed();
  if (name === 'help') { renderPosts(); }
  if (name === 'profile') { renderProfileView(); }
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
// MAP THEME TOGGLE
// ============================================================
let _mapDark = true;
const TILE_DARK = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
const TILE_LIGHT = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';

function toggleMapTheme() {
  _mapDark = !_mapDark;
  const url = _mapDark ? TILE_DARK : TILE_LIGHT;
  if (window._dtTile) window._dtTile.setUrl(url);
  if (window._mTile) window._mTile.setUrl(url);
  // Sync icons on both desktop and mobile buttons
  ['','m-'].forEach(prefix => {
    const sun = document.getElementById(prefix + 'theme-icon-sun');
    const moon = document.getElementById(prefix + 'theme-icon-moon');
    if (sun) sun.style.display = _mapDark ? 'block' : 'none';
    if (moon) moon.style.display = _mapDark ? 'none' : 'block';
  });
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
  window._dtTile = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',{
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
  renderReportsOnMap(map);
  renderStrandedOnMap(map, false);
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
    btns.push(`<a href="https://t.me/${tgMatch[1]}" target="_blank" style="${btnStyle}background:#229ED9;color:#fff" title="Telegram">TG @${tgMatch[1]}</a>`);
  }

  // X/Twitter handle
  if (xhandle) {
    btns.push(`<a href="https://x.com/${xhandle}" target="_blank" style="${btnStyle}background:#000;color:#fff;border:1px solid rgba(255,255,255,.2)" title="X / Twitter">𝕏 @${xhandle}</a>`);
  }

  return btns.length ? `<div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:.5rem">${btns.join('')}</div>` : '';
}

function buildTipButton(xhandle, hasUserId) {
  if (!xhandle) return '';
  const tipIcon = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>';
  if (!hasUserId) {
    return `<span style="display:inline-flex;align-items:center;gap:4px;margin-top:.45rem;padding:.28rem .65rem;background:rgba(255,255,255,.08);color:rgba(255,255,255,.3);font-size:.68rem;font-weight:700;border-radius:5px;font-family:Inter,sans-serif;cursor:default" title="Unverified user">${tipIcon} Tip $HELP <span style="font-size:.58rem;opacity:.6">(unverified)</span></span>`;
  }
  const tweetText = encodeURIComponent(`@bankrbot Tip 1 $HELP to @${xhandle}`);
  return `<a href="https://x.com/intent/tweet?text=${tweetText}" target="_blank" style="display:inline-flex;align-items:center;gap:4px;margin-top:.45rem;padding:.28rem .65rem;background:#3498ec;color:#fff;font-size:.68rem;font-weight:700;border-radius:5px;text-decoration:none;font-family:Inter,sans-serif">${tipIcon} Tip $HELP</a>`;
}

function buildBadge(verified) {
  if (verified) {
    return `<svg width="18" height="18" viewBox="0 0 24 24" fill="#3498ec" style="vertical-align:middle;margin-left:3px" title="Verified"><path d="M12 22c-1.1 0-2-.2-2.7-.6L3.5 18.2c-.4-.3-.7-.7-.9-1.1-.2-.5-.3-1-.3-1.5V8.4c0-.5.1-1 .3-1.5.2-.4.5-.8.9-1.1l5.8-3.2C10 2.2 11 2 12 2s2 .2 2.7.6l5.8 3.2c.4.3.7.7.9 1.1.2.5.3 1 .3 1.5v7.2c0 .5-.1 1-.3 1.5-.2.4-.5.8-.9 1.1l-5.8 3.2c-.7.4-1.6.6-2.7.6z"/><path d="M9 12l2 2 4-4" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  }
  return `<svg width="18" height="18" viewBox="0 0 24 24" fill="rgba(150,150,150,.2)" style="vertical-align:middle;margin-left:3px" title="Not verified"><path d="M12 22c-1.1 0-2-.2-2.7-.6L3.5 18.2c-.4-.3-.7-.7-.9-1.1-.2-.5-.3-1-.3-1.5V8.4c0-.5.1-1 .3-1.5.2-.4.5-.8.9-1.1l5.8-3.2C10 2.2 11 2 12 2s2 .2 2.7.6l5.8 3.2c.4.3.7.7.9 1.1.2.5.3 1 .3 1.5v7.2c0 .5-.1 1-.3 1.5-.2.4-.5.8-.9 1.1l-5.8 3.2c-.7.4-1.6.6-2.7.6z"/><path d="M9 12l2 2 4-4" fill="none" stroke="rgba(255,255,255,.3)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
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
        <div style="font-weight:600;font-size:.84rem;margin-bottom:.2rem;color:#fff">${p.name} ${buildBadge(!!p.user_id)}</div>
        <div style="font-size:.77rem;color:rgba(255,255,255,.75);line-height:1.5;margin-bottom:.3rem">${(p.body||'').slice(0,120)}${(p.body||'').length>120?'...':''}</div>
        <div style="font-size:.68rem;color:rgba(255,255,255,.4);margin-bottom:.15rem">📍 ${p.location}</div>
        ${buildContactButtons(p.contact, p.xhandle, p.name)}
        ${buildTipButton(p.xhandle, !!p.user_id)}
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
        <span style="font-size:.77rem;color:var(--muted)">${p.name} ${buildBadge(!!p.user_id)}</span>
      </div>
      ${buildContactButtons(p.contact, p.xhandle, p.name)}
      ${buildTipButton(p.xhandle, !!p.user_id)}
    </div>`;
  }).join('');
}

async function submitPost(type) {
  if (!isLoggedIn()) { alert('Please sign in first to post.'); showView('profile'); return; }
  const t=document.getElementById(type+'-type')?.value,
    l=document.getElementById(type+'-location')?.value,
    b=document.getElementById(type+'-body')?.value,
    n=document.getElementById(type+'-name')?.value,
    email=document.getElementById(type+'-contact')?.value?.trim()||'',
    tgContact=document.getElementById(type+'-tg-contact')?.value?.trim()||'',
    x=(document.getElementById(type+'-xhandle')?.value||'').trim().replace(/^@+/,''),
    lat=parseFloat(document.getElementById(type+'-lat')?.value)||null,
    lng=parseFloat(document.getElementById(type+'-lng')?.value)||null;
  // Combine contacts
  const c = [email, tgContact].filter(Boolean).join(' | ') || email || tgContact;
  if(!t||!l||!b||!n){alert('Please fill in all required fields.');return;}
  if(!c){alert('Please link at least one contact method (Google or Telegram).');return;}
  if(!lat||!lng){alert('Please select a location from the dropdown suggestions.');return;}
  const btn=document.querySelector(`.submit-btn--${type}`); if(!btn)return;
  btn.textContent='Posting...'; btn.disabled=true;
  try {
    const{error}=await _sb.from('help_posts').insert({type,post_type:t,location:l,body:b,name:n,contact:c,xhandle:x||null,lat,lng,user_id:_currentUser.id,flagged:false});
    if(error)throw error;
    ['type','location','body','name'].forEach(f=>{const el=document.getElementById(type+'-'+f);if(el)el.tagName==='SELECT'?el.selectedIndex=0:el.value='';});
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
  const{data}=await _sb.from('help_posts').select('id,type,post_type,location,body,name,contact,xhandle,lat,lng,user_id,created_at').eq('flagged',false).eq('type','offer').order('created_at',{ascending:false}).limit(100);
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
  window._mTile = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',{maxZoom:19}).addTo(mmap);

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
  renderReportsOnMap(mmap);
  renderStrandedOnMap(mmap, true);
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
  else if(tab==='feed')      { mShowSheetContent('feed','LIVE FEED'); loadFeed(); }
  else if(tab==='offer')     mShowSheetContent('offer','OFFER A SPARE ROOM');
  else if(tab==='profile')   { mShowSheetContent('profile','MY PROFILE'); renderMobileProfileView(); }
}

function mShowSheetContent(which,title){
  document.getElementById('m-resources-content').style.display=which==='resources'?'block':'none';
  document.getElementById('m-feed-content').style.display=which==='feed'?'block':'none';
  document.getElementById('m-offer-content').style.display=which==='offer'?'block':'none';
  document.getElementById('m-edit-content').style.display=which==='profile'?'block':'none';
  const titleEl = document.getElementById('m-sheet-title-text');
  if (titleEl) titleEl.textContent = title;
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
  if (!isLoggedIn()) { alert('Please sign in first to post.'); mTab('profile',document.getElementById('mtab-filters')); return; }
  const l=document.getElementById('m-offer-location')?.value,b=document.getElementById('m-offer-body')?.value,
    n=document.getElementById('m-offer-name')?.value,
    email=document.getElementById('m-offer-contact')?.value?.trim()||'',
    tgContact=document.getElementById('m-offer-tg-contact')?.value?.trim()||'',
    x=(document.getElementById('m-offer-xhandle')?.value||'').trim().replace(/^@+/,''),
    lat=parseFloat(document.getElementById('m-offer-lat')?.value)||null,
    lng=parseFloat(document.getElementById('m-offer-lng')?.value)||null;
  const c = [email, tgContact].filter(Boolean).join(' | ') || email || tgContact;
  if(!l||!b||!n){alert('Please fill in all fields.');return;}
  if(!c){alert('Please link at least one contact method (Google or Telegram).');return;}
  if(!lat||!lng){alert('Please select a location from the dropdown suggestions.');return;}
  const btn=document.querySelector('#m-offer-content .m-submit');btn.textContent='Posting...';btn.disabled=true;
  try{
    const{error}=await _sb.from('help_posts').insert({type:'offer',post_type:'General',location:l,body:b,name:n,contact:c,xhandle:x||null,lat,lng,user_id:_currentUser.id,flagged:false});
    if(error)throw error;
    ['location','body','name'].forEach(f=>{const el=document.getElementById('m-offer-'+f);if(el)el.value='';});
    document.getElementById('m-offer-lat').value='';document.getElementById('m-offer-lng').value='';
    btn.textContent='Posted!';
    setTimeout(()=>{btn.textContent='Post Offer';btn.disabled=false;},3000);
    loadPosts();
  }catch(e){alert('Failed: '+e.message);btn.textContent='Post Offer';btn.disabled=false;}
}


// ============================================================
// AUTH + PROFILE SYSTEM (Google OAuth via Supabase)
// ============================================================
let _currentUser = null;
let _currentProfile = null;
let _editingPostId = null;

function setProfileAvatar(imageUrl) {
  ['profile-avatar-default','m-profile-avatar-default'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });
  ['profile-avatar-img','m-profile-avatar-img'].forEach(id => {
    const el = document.getElementById(id);
    if (el) { el.src = imageUrl; el.style.display = 'block'; }
  });
}

function clearProfileAvatar() {
  ['profile-avatar-default','m-profile-avatar-default'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = '';
  });
  ['profile-avatar-img','m-profile-avatar-img'].forEach(id => {
    const el = document.getElementById(id);
    if (el) { el.src = ''; el.style.display = 'none'; }
  });
}

async function initAuth() {
  const { data: { session } } = await _sb.auth.getSession();
  if (session?.user) {
    _currentUser = session.user;
    await loadProfile();
    // Check if we just came back from OAuth
    if (sessionStorage.getItem('postLogin') === 'profile') {
      sessionStorage.removeItem('postLogin');
      if (!isMob()) showView('profile');
      else mTab('profile', document.getElementById('mtab-filters'));
    }
  }
  // Listen for auth changes (login, logout, token refresh)
  _sb.auth.onAuthStateChange(async (event, session) => {
    if (event === 'SIGNED_IN' && session?.user) {
      _currentUser = session.user;
      // Check if profile already exists before loading (for mode enforcement)
      const { data: existingProfile } = await _sb.from('profiles').select('id').eq('id', _currentUser.id).single();
      const profileExisted = !!existingProfile;
      await loadProfile();

      const authMode = sessionStorage.getItem('authMode');
      sessionStorage.removeItem('authMode');

      // Google mode enforcement
      if (authMode === 'login' && !profileExisted) {
        // New user tried to log in — let them stay since Google auto-creates
        // but they'll see their empty profile, which is fine
      }
      if (authMode === 'signup' && profileExisted) {
        // Existing user tried to sign up — just log them in, no harm
      }

      if (sessionStorage.getItem('postLogin') === 'profile') {
        sessionStorage.removeItem('postLogin');
        if (!isMob()) showView('profile');
        else mTab('profile', document.getElementById('mtab-filters'));
      }
    } else if (event === 'SIGNED_OUT') {
      _currentUser = null;
      _currentProfile = null;
      clearProfileAvatar();
      renderProfileView();
      renderMobileProfileView();
    }
  });
}

async function loadProfile() {
  if (!_currentUser) return;
  let { data, error } = await _sb.from('profiles').select('*').eq('id', _currentUser.id).single();
  if (!data) {
    const meta = _currentUser.user_metadata || {};
    const insertRes = await _sb.from('profiles').insert({
      id: _currentUser.id,
      email: _currentUser.email,
      display_name: meta.full_name || meta.name || '',
      avatar_url: meta.avatar_url || meta.picture || '',
      google_verified: true
    });
    if (insertRes.error) console.error('Profile insert failed:', insertRes.error);
    const res = await _sb.from('profiles').select('*').eq('id', _currentUser.id).single();
    data = res.data;
  }
  _currentProfile = data;
  if (_currentProfile?.avatar_url) setProfileAvatar(_currentProfile.avatar_url);
  updateLinkedFields();
  renderProfileView();
  renderMobileProfileView();
}

function updateLinkedFields() {
  const p = _currentProfile;
  const lockSvg = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>';

  // Google → Email
  ['offer-contact','m-offer-contact'].forEach(id => {
    const input = document.getElementById(id);
    const wrap = input?.closest('.linked-input');
    if (!input || !wrap) return;
    if (p?.google_verified && _currentUser?.email) {
      input.value = _currentUser.email;
      input.classList.add('filled');
      wrap.classList.add('linked-input--active');
      if (!wrap.querySelector('.linked-input-lock')) {
        wrap.insertAdjacentHTML('beforeend', `<div class="linked-input-lock">${lockSvg}</div>`);
      }
    } else {
      input.value = '';
      input.classList.remove('filled');
      wrap.classList.remove('linked-input--active');
      const lock = wrap.querySelector('.linked-input-lock');
      if (lock) lock.remove();
      input.placeholder = isLoggedIn() ? 'Google verified — email linked' : 'Sign in with Google to add email';
    }
  });

  // Telegram → Contact
  ['offer-tg-contact','m-offer-tg-contact'].forEach(id => {
    const input = document.getElementById(id);
    const wrap = input?.closest('.linked-input');
    if (!input || !wrap) return;
    if (p?.tg_verified && p?.tg_handle) {
      input.value = '@' + p.tg_handle;
      input.classList.add('filled');
      wrap.classList.add('linked-input--active');
      if (!wrap.querySelector('.linked-input-lock')) {
        wrap.insertAdjacentHTML('beforeend', `<div class="linked-input-lock">${lockSvg}</div>`);
      }
    } else {
      input.value = '';
      input.classList.remove('filled');
      wrap.classList.remove('linked-input--active');
      const lock = wrap.querySelector('.linked-input-lock');
      if (lock) lock.remove();
      input.placeholder = isLoggedIn() ? 'Link Telegram to add contact' : 'Sign in to link Telegram';
    }
  });

  // X → Handle
  ['offer-xhandle','m-offer-xhandle'].forEach(id => {
    const input = document.getElementById(id);
    const wrap = input?.closest('.linked-input');
    if (!input || !wrap) return;
    if (p?.x_verified && p?.x_handle) {
      input.value = '@' + p.x_handle;
      input.classList.add('filled');
      wrap.classList.add('linked-input--active');
      if (!wrap.querySelector('.linked-input-lock')) {
        wrap.insertAdjacentHTML('beforeend', `<div class="linked-input-lock">${lockSvg}</div>`);
      }
    } else {
      input.value = '';
      input.classList.remove('filled');
      wrap.classList.remove('linked-input--active');
      const lock = wrap.querySelector('.linked-input-lock');
      if (lock) lock.remove();
      input.placeholder = isLoggedIn() ? 'Link X to add @handle & enable tips' : 'Sign in to link X';
    }
  });
}

// ── Auth Tab Switching ────────────────────────────────────
function switchAuthTab(tab) {
  ['auth-panel-login','m-auth-panel-login'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = tab === 'login' ? 'block' : 'none';
  });
  ['auth-panel-signup','m-auth-panel-signup'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = tab === 'signup' ? 'block' : 'none';
  });
  ['auth-tab-login','m-auth-tab-login'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.className = 'auth-tab' + (tab === 'login' ? ' auth-tab--active' : '');
  });
  ['auth-tab-signup','m-auth-tab-signup'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.className = 'auth-tab' + (tab === 'signup' ? ' auth-tab--active' : '');
  });
}

// ── Unified Auth Action ──────────────────────────────────
function authAction(provider, mode) {
  sessionStorage.setItem('postLogin', 'profile');
  sessionStorage.setItem('authMode', mode);

  if (provider === 'google') {
    _sb.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin + window.location.pathname }
    }).then(({ error }) => { if (error) alert('Google auth failed: ' + error.message); });
  } else if (provider === 'telegram') {
    window.Telegram.Login.auth(
      { bot_id: '8600585901', request_access: 'write' },
      handleTelegramAuthData
    );
  } else if (provider === 'x') {
    window.location.href = '/api/auth/x-login?mode=' + mode;
  }
}

function linkTelegram() {
  if (!isLoggedIn()) { alert('Please sign in first.'); return; }
  window.Telegram.Login.auth(
    { bot_id: '8600585901', request_access: 'write' },
    async function(tgData) {
      if (!tgData) { alert('Telegram login cancelled.'); return; }
      const tgHandle = tgData.username || tgData.first_name || '';
      const { error } = await _sb.from('profiles').update({
        tg_handle: tgHandle,
        tg_verified: true
      }).eq('id', _currentUser.id);
      if (error) { alert('Failed to link Telegram: ' + error.message); return; }
      await loadProfile();
    }
  );
}

function linkX() {
  if (!isLoggedIn()) { alert('Please sign in first.'); return; }
  window.location.href = '/api/auth/x-login?mode=link&user_id=' + _currentUser.id;
}

async function unlinkProvider(provider) {
  if (!isLoggedIn()) return;
  const names = { tg: 'Telegram', x: 'X', google: 'Google' };
  if (!confirm(`Unlink ${names[provider]}? Your ${names[provider]} data will be removed from your profile.`)) return;
  try {
    const update = {};
    if (provider === 'tg') { update.tg_handle = null; update.tg_verified = false; }
    if (provider === 'x') { update.x_handle = null; update.x_verified = false; }
    if (provider === 'google') { update.google_verified = false; }
    const { error } = await _sb.from('profiles').update(update).eq('id', _currentUser.id);
    if (error) throw error;
    await loadProfile();
  } catch (e) { alert('Failed to unlink: ' + e.message); }
}

async function handleTelegramAuthData(tgData) {
  if (!tgData) { alert('Telegram login cancelled.'); return; }
  const mode = sessionStorage.getItem('authMode') || 'login';
  try {
    const res = await fetch('/api/auth/telegram', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...tgData, mode })
    });
    const result = await res.json();
    if (!res.ok) { alert('Login failed: ' + (result.detail || result.error || 'Unknown error')); return; }
    // Sign in with the credentials returned by server
    const { error } = await _sb.auth.signInWithPassword({
      email: result.email,
      password: result.password,
    });
    if (error) { alert('Session failed: ' + error.message); return; }
    sessionStorage.removeItem('tgLoginPending');
    // onAuthStateChange will handle the rest
  } catch (e) {
    alert('Login failed: ' + e.message);
  }
}

// Check for TG auth data in URL hash on page load (mobile redirect flow)
function checkTelegramRedirect() {
  const hash = window.location.hash;
  if (!hash || !hash.includes('tgAuthResult=')) return;
  try {
    const params = new URLSearchParams(hash.replace('#', ''));
    const tgData = {};
    for (const [k, v] of params) tgData[k] = v;
    if (tgData.id && tgData.hash) {
      window.location.hash = '';
      handleTelegramAuthData(tgData);
    }
  } catch(e) {}
}

// Check for X OAuth credentials in URL hash
async function checkXRedirect() {
  const hash = window.location.hash;
  if (!hash) return;

  // X error: #x-error:message
  if (hash.startsWith('#x-error:')) {
    const msg = decodeURIComponent(hash.replace('#x-error:', ''));
    window.location.hash = '';
    alert(msg);
    return;
  }

  // X linked successfully: #x-linked
  if (hash === '#x-linked') {
    window.location.hash = '';
    if (isLoggedIn()) {
      await loadProfile();
      if (!isMob()) showView('profile');
      else mTab('profile', document.getElementById('mtab-filters'));
    }
    return;
  }

  // X link finish — browser calls Twitter API: #x-link-finish:userId:tokenB64
  if (hash.startsWith('#x-link-finish:')) {
    const parts = hash.replace('#x-link-finish:', '').split(':');
    window.location.hash = '';
    if (parts.length >= 2) {
      const userId = parts[0];
      const token = b64urlDecode(parts.slice(1).join(':'));
      await finishXLink(userId, token);
    }
    return;
  }

  // X login/signup finish: #x-auth-finish:mode:xId:tokenB64
  if (hash.startsWith('#x-auth-finish:')) {
    const parts = hash.replace('#x-auth-finish:', '').split(':');
    window.location.hash = '';
    if (parts.length >= 3) {
      const mode = parts[0];
      const xId = parts[1];
      const token = b64urlDecode(parts.slice(2).join(':'));
      await finishXAuth(mode, xId, token);
    }
    return;
  }

  // X login: #x-login:email:password
  if (hash.startsWith('#x-login:')) {
    const parts = hash.replace('#x-login:', '').split(':');
    if (parts.length >= 2) {
      const email = parts[0];
      const password = parts.slice(1).join(':');
      window.location.hash = '';
      sessionStorage.setItem('postLogin', 'profile');
      const { error } = await _sb.auth.signInWithPassword({ email, password });
      if (error) { alert('X sign-in failed: ' + error.message); }
    }
    return;
  }

  // Generic profile redirect: #profile
  if (hash === '#profile') {
    window.location.hash = '';
    if (isLoggedIn()) {
      await loadProfile();
      if (!isMob()) showView('profile');
      else mTab('profile', document.getElementById('mtab-filters'));
    }
  }
}

// Base64url decode helper
function b64urlDecode(s) {
  let b = s.replace(/-/g, '+').replace(/_/g, '/');
  while (b.length % 4) b += '=';
  return atob(b);
}

// Fetch X profile via our proxy (Twitter blocks browser CORS, proxy retries 503s)
async function fetchXProfile(accessToken) {
  for (let attempt = 0; attempt < 2; attempt++) {
    if (attempt > 0) await new Promise(r => setTimeout(r, 2000));
    try {
      const r = await fetch('/api/auth/x-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: accessToken })
      });
      if (r.ok) {
        const json = await r.json();
        if (json?.data) return json.data;
      }
      console.log('X profile proxy attempt', attempt + 1, ':', r.status);
    } catch (e) { console.log('X profile proxy error:', e.message); }
  }
  return null;
}

async function finishXLink(userId, accessToken) {
  const xUser = await fetchXProfile(accessToken);
  if (!xUser || !xUser.username) {
    alert('Twitter API is temporarily unavailable (503). This is a known issue with their free tier. Please try linking X again in a few minutes.');
    return;
  }
  const avatar = (xUser.profile_image_url || '').replace('_normal', '_400x400');
  const { error } = await _sb.from('profiles').update({
    x_handle: xUser.username,
    x_verified: true,
    avatar_url: avatar || undefined,
  }).eq('id', userId);
  if (error) { alert('Failed to link X: ' + error.message); return; }
  await loadProfile();
  if (!isMob()) showView('profile');
  else mTab('profile', document.getElementById('mtab-filters'));
}

async function finishXAuth(mode, xId, accessToken) {
  const xUser = await fetchXProfile(accessToken);
  if (!xUser || !xUser.username) {
    alert('Twitter API is temporarily unavailable (503). Please try again in a few minutes.');
    return;
  }
  const xUsername = xUser.username;
  const xName = xUser.name || xUsername;
  const avatar = (xUser.profile_image_url || '').replace('_normal', '_400x400');

  // Call server to complete login/signup with the profile data
  try {
    const res = await fetch('/api/auth/x-complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode, xId, xUsername, xName, avatar })
    });
    const result = await res.json();
    if (!res.ok) {
      alert(result.detail || result.error || 'X auth failed');
      return;
    }
    sessionStorage.setItem('postLogin', 'profile');
    const { error } = await _sb.auth.signInWithPassword({ email: result.email, password: result.password });
    if (error) alert('Sign in failed: ' + error.message);
  } catch (e) {
    alert('X auth failed: ' + e.message);
  }
}

async function doSignOut() {
  try {
    await _sb.auth.signOut();
  } catch(e) { console.error('Sign out error:', e); }
  _currentUser = null;
  _currentProfile = null;
  clearProfileAvatar();
  updateLinkedFields();
  renderProfileView();
  renderMobileProfileView();
  showView('map');
}

function isLoggedIn() { return !!_currentUser; }

// ── Desktop Profile ──────────────────────────────────────
function renderProfileView() {
  const loginEl = document.getElementById('profile-login');
  const mainEl = document.getElementById('profile-main');
  if (!loginEl || !mainEl) return;
  if (isLoggedIn()) {
    loginEl.style.display = 'none';
    mainEl.style.display = 'block';
    // Update name + email display
    const nameEl = document.getElementById('profile-display-name');
    const emailEl = document.getElementById('profile-email');
    if (nameEl) nameEl.textContent = _currentProfile?.display_name || _currentUser.email;
    if (emailEl) emailEl.textContent = _currentUser.email;
    // Update verify statuses
    updateVerifyStatus('google', _currentProfile?.google_verified);
    updateVerifyStatus('x', _currentProfile?.x_verified);
    updateVerifyStatus('tg', _currentProfile?.tg_verified);
    renderProfilePosts();
  } else {
    loginEl.style.display = 'block';
    mainEl.style.display = 'none';
  }
}

function updateVerifyStatus(provider, verified) {
  const p = _currentProfile;
  // Desktop button
  const btn = document.getElementById('verify-btn-' + provider);
  if (btn) {
    if (verified) {
      btn.innerHTML = 'Verified <svg width="13" height="13" viewBox="0 0 24 24" fill="#3498ec" style="vertical-align:middle"><path d="M12 22c-1.1 0-2-.2-2.7-.6L3.5 18.2c-.4-.3-.7-.7-.9-1.1-.2-.5-.3-1-.3-1.5V8.4c0-.5.1-1 .3-1.5.2-.4.5-.8.9-1.1l5.8-3.2C10 2.2 11 2 12 2s2 .2 2.7.6l5.8 3.2c.4.3.7.7.9 1.1.2.5.3 1 .3 1.5v7.2c0 .5-.1 1-.3 1.5-.2.4-.5.8-.9 1.1l-5.8 3.2c-.7.4-1.6.6-2.7.6z"/><path d="M9 12l2 2 4-4" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg> <span style="font-size:.55rem;opacity:.5;margin-left:4px;cursor:pointer" onclick="event.stopPropagation();unlinkProvider(\'' + provider + '\')">unlink</span>';
      btn.className = 'p-verify-btn p-verify-btn--linked';
      btn.disabled = false;
      btn.style.cursor = 'default';
      btn.onclick = null;
    } else if (provider === 'tg' || provider === 'x') {
      btn.textContent = 'Link';
      btn.className = 'p-verify-btn p-verify-btn--link';
      btn.disabled = false;
    } else {
      btn.textContent = 'Linked';
      btn.className = 'p-verify-btn';
      btn.disabled = true;
    }
  }
  // Desktop subtitle — show handle when linked
  const sub = document.getElementById('verify-sub-' + provider);
  if (sub) {
    if (provider === 'x' && p?.x_handle) sub.textContent = '@' + p.x_handle;
    else if (provider === 'tg' && p?.tg_handle) sub.textContent = '@' + p.tg_handle;
    else if (provider === 'google' && verified) sub.textContent = _currentUser?.email || 'Email verified';
    else if (provider === 'x') sub.textContent = 'Required for $HELP tips';
    else if (provider === 'tg') sub.textContent = 'Verify your Telegram identity';
    else if (provider === 'google') sub.textContent = 'Verifies your email automatically';
  }
  // Mobile label
  const mLabel = document.getElementById('m-verify-' + provider);
  if (mLabel) {
    if (verified) {
      mLabel.innerHTML = 'Verified <svg width="13" height="13" viewBox="0 0 24 24" fill="#3498ec" style="vertical-align:middle"><path d="M12 22c-1.1 0-2-.2-2.7-.6L3.5 18.2c-.4-.3-.7-.7-.9-1.1-.2-.5-.3-1-.3-1.5V8.4c0-.5.1-1 .3-1.5.2-.4.5-.8.9-1.1l5.8-3.2C10 2.2 11 2 12 2s2 .2 2.7.6l5.8 3.2c.4.3.7.7.9 1.1.2.5.3 1 .3 1.5v7.2c0 .5-.1 1-.3 1.5-.2.4-.5.8-.9 1.1l-5.8 3.2c-.7.4-1.6.6-2.7.6z"/><path d="M9 12l2 2 4-4" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg> <span style="font-size:.5rem;opacity:.4;cursor:pointer" onclick="event.stopPropagation();unlinkProvider(\'' + provider + '\')">unlink</span>';
      mLabel.style.color = '#3498ec';
      mLabel.style.cursor = 'default';
      mLabel.onclick = null;
    } else if (provider === 'tg' || provider === 'x') {
      mLabel.textContent = 'Link';
      mLabel.style.color = '#3498ec';
      mLabel.style.cursor = 'pointer';
    } else {
      mLabel.textContent = 'Soon';
      mLabel.style.color = 'rgba(255,255,255,.25)';
    }
  }
  // Mobile subtitle
  const mSub = document.getElementById('m-verify-sub-' + provider);
  if (mSub) {
    if (provider === 'x' && p?.x_handle) mSub.textContent = '@' + p.x_handle;
    else if (provider === 'tg' && p?.tg_handle) mSub.textContent = '@' + p.tg_handle;
    else if (provider === 'google' && verified) mSub.textContent = _currentUser?.email || 'Verified';
    else if (provider === 'x') mSub.textContent = 'Enables $HELP tips';
    else if (provider === 'tg') mSub.textContent = 'Verify your identity';
    else if (provider === 'google') mSub.textContent = 'Auto-verifies email';
  }
}

async function renderProfilePosts() {
  const el = document.getElementById('profile-posts-list');
  if (!el || !_currentUser) return;
  el.innerHTML = '<div style="font-size:.82rem;color:rgba(255,255,255,.4);padding:.5rem 0">Loading...</div>';
  const { data, error } = await _sb.from('help_posts').select('id,location,body,name,contact,xhandle,post_type,lat,lng,created_at').eq('user_id', _currentUser.id).eq('type', 'offer').eq('flagged', false).order('created_at', { ascending: false });
  if (error || !data || !data.length) {
    el.innerHTML = '<div style="font-size:.82rem;color:rgba(255,255,255,.4);padding:.5rem 0">No listings yet. Offer a spare room to get started.</div>';
    return;
  }
  const verified = _currentProfile?.google_verified || _currentProfile?.x_verified || _currentProfile?.tg_verified;
  el.innerHTML = data.map(p => {
    const t = p.created_at ? new Date(p.created_at).toLocaleString() : '';
    return `<div class="profile-post-card">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:.3rem">
        <span style="font-size:.82rem;font-weight:600;color:#fff">${p.name} ${buildBadge(verified)}</span>
        <span style="font-size:.63rem;color:rgba(255,255,255,.35)">${t}</span>
      </div>
      <div style="font-size:.78rem;font-weight:600;color:rgba(255,255,255,.7);margin-bottom:.2rem">📍 ${p.location}</div>
      <div style="font-size:.82rem;color:rgba(255,255,255,.55);line-height:1.5">${(p.body || '').slice(0, 150)}${(p.body || '').length > 150 ? '...' : ''}</div>
      ${buildContactButtons(p.contact, p.xhandle, p.name)}
      <div class="profile-post-actions">
        <button onclick="profileEditPost('${p.id}')" style="background:rgba(52,152,236,.15);color:#3498ec;border:1px solid rgba(52,152,236,.25);border-radius:6px;padding:.28rem .7rem;font-size:.7rem;font-weight:600;cursor:pointer;font-family:Inter,sans-serif">Edit</button>
        <button onclick="profileDeletePost('${p.id}')" style="background:#ec3452;color:#fff;border:none;border-radius:6px;padding:.28rem .7rem;font-size:.7rem;font-weight:600;cursor:pointer;font-family:Inter,sans-serif">Delete</button>
      </div>
    </div>`;
  }).join('');
}

async function profileDeletePost(id) {
  if (!confirm('Delete this post? This cannot be undone.')) return;
  try {
    const { error } = await _sb.from('help_posts').update({ flagged: true }).eq('id', id).eq('user_id', _currentUser.id);
    if (error) throw error;
    renderProfilePosts();
    loadPosts();
  } catch (e) { alert('Failed to delete: ' + e.message); }
}

async function profileEditPost(id) {
  const { data } = await _sb.from('help_posts').select('*').eq('id', id).eq('user_id', _currentUser.id).single();
  if (!data) { alert('Post not found.'); return; }
  _editingPostId = id;
  // Populate desktop form
  const typeEl = document.getElementById('offer-type');
  if (typeEl) { for (let i = 0; i < typeEl.options.length; i++) { if (typeEl.options[i].text === data.post_type || typeEl.options[i].value === data.post_type) { typeEl.selectedIndex = i; break; } } }
  document.getElementById('offer-location').value = data.location || '';
  document.getElementById('offer-lat').value = data.lat || '';
  document.getElementById('offer-lng').value = data.lng || '';
  document.getElementById('offer-body').value = data.body || '';
  document.getElementById('offer-name').value = data.name || '';
  // Switch to offer view
  showView('offer');
  // Change button
  const btn = document.querySelector('.submit-btn--offer');
  if (btn) { btn.textContent = 'Update Post'; btn.onclick = () => submitEditPost('offer'); }
}

async function mProfileEditPost(id) {
  const { data } = await _sb.from('help_posts').select('*').eq('id', id).eq('user_id', _currentUser.id).single();
  if (!data) { alert('Post not found.'); return; }
  _editingPostId = id;
  // Populate mobile form
  document.getElementById('m-offer-location').value = data.location || '';
  document.getElementById('m-offer-lat').value = data.lat || '';
  document.getElementById('m-offer-lng').value = data.lng || '';
  document.getElementById('m-offer-body').value = data.body || '';
  document.getElementById('m-offer-name').value = data.name || '';
  // Switch to offer tab
  mTab('offer', document.querySelector('#mtab-spare'));
  // Change button
  const btn = document.querySelector('#m-offer-content .m-submit');
  if (btn) { btn.textContent = 'Update Post'; btn.onclick = () => mSubmitEditPost(); }
}

async function submitEditPost(type) {
  if (!_editingPostId || !isLoggedIn()) return;
  const l = document.getElementById(type + '-location')?.value,
    b = document.getElementById(type + '-body')?.value,
    n = document.getElementById(type + '-name')?.value,
    t = document.getElementById(type + '-type')?.value,
    lat = parseFloat(document.getElementById(type + '-lat')?.value) || null,
    lng = parseFloat(document.getElementById(type + '-lng')?.value) || null;
  if (!l || !b || !n) { alert('Please fill in all required fields.'); return; }
  const email = document.getElementById(type + '-contact')?.value?.trim() || '';
  const tgContact = document.getElementById(type + '-tg-contact')?.value?.trim() || '';
  const x = (document.getElementById(type + '-xhandle')?.value || '').trim().replace(/^@+/, '');
  const c = [email, tgContact].filter(Boolean).join(' | ') || email || tgContact;
  const btn = document.querySelector(`.submit-btn--${type}`);
  if (btn) { btn.textContent = 'Updating...'; btn.disabled = true; }
  try {
    const { error } = await _sb.from('help_posts').update({ post_type: t, location: l, body: b, name: n, contact: c, xhandle: x || null, lat, lng }).eq('id', _editingPostId).eq('user_id', _currentUser.id);
    if (error) throw error;
    cancelEdit('offer');
    loadPosts();
    showView('profile');
  } catch (e) { alert('Failed to update: ' + e.message); if (btn) { btn.textContent = 'Update Post'; btn.disabled = false; } }
}

async function mSubmitEditPost() {
  if (!_editingPostId || !isLoggedIn()) return;
  const l = document.getElementById('m-offer-location')?.value,
    b = document.getElementById('m-offer-body')?.value,
    n = document.getElementById('m-offer-name')?.value,
    lat = parseFloat(document.getElementById('m-offer-lat')?.value) || null,
    lng = parseFloat(document.getElementById('m-offer-lng')?.value) || null;
  if (!l || !b || !n) { alert('Please fill in all fields.'); return; }
  const email = document.getElementById('m-offer-contact')?.value?.trim() || '';
  const tgContact = document.getElementById('m-offer-tg-contact')?.value?.trim() || '';
  const x = (document.getElementById('m-offer-xhandle')?.value || '').trim().replace(/^@+/, '');
  const c = [email, tgContact].filter(Boolean).join(' | ') || email || tgContact;
  const btn = document.querySelector('#m-offer-content .m-submit');
  if (btn) { btn.textContent = 'Updating...'; btn.disabled = true; }
  try {
    const { error } = await _sb.from('help_posts').update({ location: l, body: b, name: n, contact: c, xhandle: x || null, lat, lng }).eq('id', _editingPostId).eq('user_id', _currentUser.id);
    if (error) throw error;
    cancelEdit('m-offer');
    loadPosts();
    mTab('profile', document.getElementById('mtab-filters'));
  } catch (e) { alert('Failed to update: ' + e.message); if (btn) { btn.textContent = 'Update Post'; btn.disabled = false; } }
}

function cancelEdit(prefix) {
  _editingPostId = null;
  if (prefix === 'offer') {
    ['type', 'location', 'body', 'name'].forEach(f => { const el = document.getElementById('offer-' + f); if (el) el.tagName === 'SELECT' ? el.selectedIndex = 0 : el.value = ''; });
    document.getElementById('offer-lat').value = '';
    document.getElementById('offer-lng').value = '';
    const btn = document.querySelector('.submit-btn--offer');
    if (btn) { btn.textContent = 'List Spare Room'; btn.disabled = false; btn.onclick = () => submitPost('offer'); }
  } else {
    ['location', 'body', 'name'].forEach(f => { const el = document.getElementById('m-offer-' + f); if (el) el.value = ''; });
    document.getElementById('m-offer-lat').value = '';
    document.getElementById('m-offer-lng').value = '';
    const btn = document.querySelector('#m-offer-content .m-submit');
    if (btn) { btn.textContent = 'List Spare Room'; btn.disabled = false; btn.onclick = () => mSubmitOffer(); }
  }
}

async function deleteAccount() {
  if (!confirm('Are you sure you want to delete your account? All your posts and data will be permanently removed. This cannot be undone.')) return;
  if (!confirm('This is irreversible. Type OK to the next prompt to confirm.')) return;
  const confirmText = prompt('Type DELETE to permanently delete your account:');
  if (confirmText !== 'DELETE') { alert('Account deletion cancelled.'); return; }
  try {
    // Flag all user's posts
    await _sb.from('help_posts').update({ flagged: true }).eq('user_id', _currentUser.id);
    // Delete profile
    await _sb.from('profiles').delete().eq('id', _currentUser.id);
    // Sign out
    await _sb.auth.signOut();
    _currentUser = null;
    _currentProfile = null;
    clearProfileAvatar();
    renderProfileView();
    renderMobileProfileView();
    showView('map');
    alert('Your account has been deleted.');
  } catch (e) { alert('Failed to delete account: ' + e.message); }
}

// ── Mobile Profile ───────────────────────────────────────
function renderMobileProfileView() {
  const loginEl = document.getElementById('m-profile-login');
  const mainEl = document.getElementById('m-profile-main');
  if (!loginEl || !mainEl) return;
  if (isLoggedIn()) {
    loginEl.style.display = 'none';
    mainEl.style.display = 'block';
    const nameEl = document.getElementById('m-profile-display-name');
    if (nameEl) nameEl.textContent = _currentProfile?.display_name || _currentUser.email;
    updateVerifyStatus('google', _currentProfile?.google_verified);
    updateVerifyStatus('x', _currentProfile?.x_verified);
    updateVerifyStatus('tg', _currentProfile?.tg_verified);
    mRenderProfilePosts();
  } else {
    loginEl.style.display = 'block';
    mainEl.style.display = 'none';
  }
}

async function mRenderProfilePosts() {
  const list = document.getElementById('m-my-posts-list');
  if (!list || !_currentUser) return;
  list.innerHTML = '<div style="color:rgba(255,255,255,.5);font-size:.82rem;padding:.5rem 0">Loading...</div>';
  try {
    const { data, error } = await _sb.from('help_posts').select('id,location,body,name,post_type,lat,lng,created_at').eq('user_id', _currentUser.id).eq('type', 'offer').eq('flagged', false).order('created_at', { ascending: false });
    if (error) throw error;
    if (!data || !data.length) {
      list.innerHTML = '<div style="color:rgba(255,255,255,.5);font-size:.82rem;padding:.5rem 0">No listings yet.</div>';
      return;
    }
    list.innerHTML = data.map(p => {
      const t = p.created_at ? new Date(p.created_at).toLocaleString() : '';
      return `<div style="background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);border-radius:10px;padding:.75rem;margin-bottom:.6rem">
        <div style="font-size:.7rem;color:rgba(255,255,255,.45);margin-bottom:.2rem">${t}</div>
        <div style="font-size:.85rem;font-weight:600;color:#fff;margin-bottom:.15rem">📍 ${p.location}</div>
        <div style="font-size:.8rem;color:rgba(255,255,255,.7);line-height:1.5;margin-bottom:.6rem">${(p.body || '').slice(0, 120)}${(p.body || '').length > 120 ? '...' : ''}</div>
        <div style="display:flex;gap:.5rem">
          <button onclick="mProfileEditPost('${p.id}')" style="background:rgba(52,152,236,.15);color:#3498ec;border:1px solid rgba(52,152,236,.25);border-radius:7px;padding:.35rem .8rem;font-size:.72rem;font-weight:700;cursor:pointer;font-family:Inter,sans-serif">Edit</button>
          <button onclick="mProfileDeletePost('${p.id}')" style="background:#ec3452;color:#fff;border:none;border-radius:7px;padding:.35rem .8rem;font-size:.72rem;font-weight:700;cursor:pointer;font-family:Inter,sans-serif">Delete</button>
        </div>
      </div>`;
    }).join('');
  } catch (e) {
    list.innerHTML = `<div style="color:#ec3452;font-size:.82rem;padding:.5rem 0">Error: ${e.message}</div>`;
  }
}

async function mProfileDeletePost(id) {
  if (!confirm('Delete this post? This cannot be undone.')) return;
  try {
    const { error } = await _sb.from('help_posts').update({ flagged: true }).eq('id', id).eq('user_id', _currentUser.id);
    if (error) throw error;
    mRenderProfilePosts();
    loadPosts();
  } catch (e) { alert('Failed to delete: ' + e.message); }
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
// ============================================================
// STRANDED PEOPLE
// ============================================================
let _strandedPeople = [];
let _strandedCluster = null;
let _mStrandedCluster = null;

function openStrandedForm() {
  if (!isLoggedIn()) { alert('Please sign in to register as stranded.'); showView('profile'); return; }
  document.getElementById('stranded-modal').classList.add('open');
}

function closeStrandedForm() {
  document.getElementById('stranded-modal').classList.remove('open');
}

async function submitStranded() {
  if (!isLoggedIn()) { alert('Please sign in first.'); return; }
  const loc = document.getElementById('stranded-location').value.trim();
  const lat = parseFloat(document.getElementById('stranded-lat').value) || null;
  const lng = parseFloat(document.getElementById('stranded-lng').value) || null;
  const dest = document.getElementById('stranded-dest').value.trim();
  const destLat = parseFloat(document.getElementById('stranded-dest-lat').value) || null;
  const destLng = parseFloat(document.getElementById('stranded-dest-lng').value) || null;
  const nationality = document.getElementById('stranded-nationality').value;
  const groupSize = parseInt(document.getElementById('stranded-group').value) || 1;
  const since = document.getElementById('stranded-since').value || null;
  const details = document.getElementById('stranded-details').value.trim();
  const needs = [...document.querySelectorAll('#stranded-needs input:checked')].map(c => c.value);

  if (!loc || !dest) { alert('Please fill in your current location and destination.'); return; }
  if (!lat || !lng) { alert('Please select your current location from suggestions.'); return; }

  // Build contact from linked accounts
  const email = _currentUser?.email || '';
  const tg = _currentProfile?.tg_handle ? '@' + _currentProfile.tg_handle : '';
  const contact = [email, tg].filter(Boolean).join(' | ');

  const btn = document.getElementById('stranded-submit-btn');
  btn.textContent = 'Registering...'; btn.disabled = true;
  try {
    const { error } = await _sb.from('stranded_people').insert({
      user_id: _currentUser.id,
      current_location: loc, current_lat: lat, current_lng: lng,
      destination: dest, dest_lat: destLat, dest_lng: destLng,
      nationality, group_size: groupSize,
      needs: needs.length ? `{${needs.join(',')}}` : '{}',
      stranded_since: since, details, contact,
    });
    if (error) throw error;
    closeStrandedForm();
    btn.textContent = 'Register as Stranded'; btn.disabled = false;
    alert('You\'ve been registered. Stay safe — help is on the way.');
    loadStranded();
  } catch (e) {
    alert('Failed: ' + e.message);
    btn.textContent = 'Register as Stranded'; btn.disabled = false;
  }
}

async function loadStranded() {
  try {
    const { data } = await _sb.from('stranded_people').select('id,current_location,current_lat,current_lng,destination,nationality,group_size,needs,stranded_since,details,status,created_at')
      .eq('flagged', false).eq('status', 'active').order('created_at', { ascending: false }).limit(500);
    _strandedPeople = data || [];

    // Update stranded count in sitrep bar
    const totalPeople = _strandedPeople.reduce((sum, p) => sum + (p.group_size || 1), 0);
    const countEl = document.getElementById('stat-stranded');
    const mCountEl = document.getElementById('m-stat-stranded');
    // Only update if we have registered people (otherwise keep the estimated number)
    if (totalPeople > 0) {
      if (countEl) countEl.textContent = totalPeople.toLocaleString() + '+';
      if (mCountEl) mCountEl.textContent = totalPeople.toLocaleString() + '+';
    }

    renderStrandedOnMap(window._crisisMap, false);
    renderStrandedOnMap(window._mobileMap, true);
  } catch (e) { console.error('Load stranded error:', e); }
}

const NEED_LABELS = { housing: 'Housing', flight: 'Flight home', food: 'Food/water', medical: 'Medical', money: 'Financial', translation: 'Translation' };

function renderStrandedOnMap(map, isMobile) {
  if (!map) return;
  // Clear existing cluster
  const clusterRef = isMobile ? _mStrandedCluster : _strandedCluster;
  if (clusterRef) { map.removeLayer(clusterRef); }

  const cluster = L.markerClusterGroup({
    maxClusterRadius: 60,
    spiderfyOnMaxZoom: true,
    showCoverageOnHover: false,
    zoomToBoundsOnClick: true,
    iconCreateFunction: function(c) {
      const count = c.getAllChildMarkers().reduce((sum, m) => sum + (m.options.groupSize || 1), 0);
      const size = count > 50 ? 44 : count > 10 ? 36 : 28;
      return L.divIcon({ html: `<div class="stranded-cluster" style="width:${size}px;height:${size}px">${count}</div>`, className: '', iconSize: [size, size] });
    }
  });

  for (const p of _strandedPeople) {
    if (!p.current_lat || !p.current_lng) continue;
    const age = timeAgo(p.created_at);
    const needsList = (p.needs || []).map(n => NEED_LABELS[n] || n).join(', ');
    const sinceTxt = p.stranded_since ? 'Since ' + new Date(p.stranded_since).toLocaleDateString() : '';
    const icon = L.divIcon({ className: '', html: '<div class="stranded-pin"></div>', iconSize: [10, 10], iconAnchor: [5, 5] });
    const marker = L.marker([p.current_lat, p.current_lng], { icon, groupSize: p.group_size || 1 });
    marker.bindPopup(`
      <div style="min-width:200px;font-family:Inter,sans-serif">
        <div style="font-size:.6rem;font-weight:700;text-transform:uppercase;color:#ec3452;margin-bottom:.3rem">STRANDED · ${age}</div>
        <div style="font-size:.82rem;font-weight:700;color:#fff;margin-bottom:.15rem">${p.group_size > 1 ? p.group_size + ' people' : '1 person'}${p.nationality ? ' · ' + p.nationality : ''}</div>
        <div style="font-size:.75rem;color:rgba(255,255,255,.6);margin-bottom:.15rem">From: ${p.current_location}</div>
        <div style="font-size:.75rem;color:rgba(255,255,255,.6);margin-bottom:.3rem">Need to reach: <strong style="color:#fff">${p.destination}</strong></div>
        ${needsList ? `<div style="font-size:.68rem;color:#e67e22;margin-bottom:.2rem">Needs: ${needsList}</div>` : ''}
        ${sinceTxt ? `<div style="font-size:.65rem;color:rgba(255,255,255,.35)">${sinceTxt}</div>` : ''}
        ${p.details ? `<div style="font-size:.75rem;color:rgba(255,255,255,.5);line-height:1.4;margin-top:.3rem">${p.details.slice(0, 150)}</div>` : ''}
      </div>
    `, { className: 'dark-popup', maxWidth: 280 });
    cluster.addLayer(marker);
  }

  map.addLayer(cluster);
  if (isMobile) _mStrandedCluster = cluster;
  else _strandedCluster = cluster;
}

function initStrandedRealtime() {
  _sb.channel('stranded_people').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'stranded_people' }, payload => {
    if (payload.new && !payload.new.flagged) {
      _strandedPeople.unshift(payload.new);
      renderStrandedOnMap(window._crisisMap, false);
      renderStrandedOnMap(window._mobileMap, true);
    }
  }).subscribe();
}

// ============================================================
// GROUND REPORTS
// ============================================================
let _reports = [];

function openReportForm() {
  if (!isLoggedIn()) { alert('Please sign in to post a ground report.'); showView('profile'); return; }
  document.getElementById('report-modal').classList.add('open');
}

function closeReportForm() {
  document.getElementById('report-modal').classList.remove('open');
  document.getElementById('report-body').value = '';
  document.getElementById('report-location').value = '';
  document.getElementById('report-lat').value = '';
  document.getElementById('report-lng').value = '';
}

async function submitReport() {
  if (!isLoggedIn()) { alert('Please sign in first.'); return; }
  const type = document.getElementById('report-type').value;
  const loc = document.getElementById('report-location').value.trim();
  const body = document.getElementById('report-body').value.trim();
  const lat = parseFloat(document.getElementById('report-lat').value) || null;
  const lng = parseFloat(document.getElementById('report-lng').value) || null;
  if (!loc || !body) { alert('Please fill in location and description.'); return; }
  if (!lat || !lng) { alert('Please select a location from suggestions.'); return; }
  const btn = document.getElementById('report-submit-btn');
  btn.textContent = 'Posting...'; btn.disabled = true;
  try {
    const { error } = await _sb.from('situation_reports').insert({ user_id: _currentUser.id, location: loc, body, report_type: type, lat, lng });
    if (error) throw error;
    closeReportForm();
    btn.textContent = 'Post Report'; btn.disabled = false;
    loadReports();
  } catch (e) {
    alert('Failed: ' + e.message);
    btn.textContent = 'Post Report'; btn.disabled = false;
  }
}

const REPORT_COLORS = { ground: '#e67e22', airport: '#e74c3c', border: '#f39c12', supply: '#2ecc71' };
const REPORT_LABELS = { ground: 'Ground Report', airport: 'Airport', border: 'Border Crossing', supply: 'Supplies' };
let _reportMarkers = [];

async function loadReports() {
  try {
    const { data } = await _sb.from('situation_reports').select('id,user_id,location,body,report_type,lat,lng,created_at').eq('flagged', false).order('created_at', { ascending: false }).limit(100);
    _reports = data || [];
    renderReportsOnMap(window._crisisMap);
    renderReportsOnMap(window._mobileMap);
  } catch (e) { console.error('Load reports error:', e); }
}

function renderReportsOnMap(map) {
  if (!map) return;
  // Clear existing report markers
  _reportMarkers.forEach(m => map.removeLayer(m));
  _reportMarkers = [];

  for (const r of _reports) {
    if (!r.lat || !r.lng) continue;
    const color = REPORT_COLORS[r.report_type] || '#e67e22';
    const label = REPORT_LABELS[r.report_type] || 'Report';
    const age = timeAgo(r.created_at);
    const icon = L.divIcon({
      className: '',
      html: `<div class="report-pin report-pin--${r.report_type}"></div>`,
      iconSize: [12, 12],
      iconAnchor: [6, 6]
    });
    const marker = L.marker([r.lat, r.lng], { icon }).addTo(map);
    marker.bindPopup(`
      <div style="min-width:180px;font-family:Inter,sans-serif">
        <div style="font-size:.65rem;font-weight:700;text-transform:uppercase;color:${color};margin-bottom:.25rem">${label} · ${age}</div>
        <div style="font-size:.78rem;font-weight:600;color:#fff;margin-bottom:.15rem">📍 ${r.location}</div>
        <div style="font-size:.78rem;color:rgba(255,255,255,.7);line-height:1.5">${r.body}</div>
      </div>
    `, { className: 'dark-popup', maxWidth: 260 });
    _reportMarkers.push(marker);
  }
}

// Realtime report updates
function initReportRealtime() {
  _sb.channel('situation_reports').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'situation_reports' }, payload => {
    if (payload.new && !payload.new.flagged) {
      _reports.unshift(payload.new);
      renderReportsOnMap(window._crisisMap);
      renderReportsOnMap(window._mobileMap);
    }
  }).subscribe();
}

// ============================================================
// LIVE FEED
// ============================================================
let _feedArticles = [];
let _feedFilter = 'all';
let _feedLoaded = false;

async function loadFeed() {
  if (_feedLoaded && _feedArticles.length) { renderFeed(); return; }
  try {
    const { data, error } = await _sb.from('news_feed').select('*').order('published_at', { ascending: false }).limit(80);
    if (error) throw error;
    _feedArticles = data || [];
    _feedLoaded = true;
    renderFeed();
  } catch (e) {
    console.error('Feed load error:', e);
    const el = document.getElementById('feed-list');
    const mEl = document.getElementById('m-feed-list');
    const msg = '<div style="text-align:center;padding:2rem;color:rgba(255,255,255,.4);font-size:.82rem">Unable to load feed. Data will appear once the scraper runs.</div>';
    if (el) el.innerHTML = msg;
    if (mEl) mEl.innerHTML = msg;
  }
  const loadEl = document.getElementById('feed-loading');
  if (loadEl) loadEl.style.display = 'none';
}

function filterFeed(filter, btn) {
  _feedFilter = filter;
  document.querySelectorAll('.feed-filter').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  // Sync both desktop and mobile filter buttons
  document.querySelectorAll(`.feed-filter[data-filter="${filter}"]`).forEach(b => b.classList.add('active'));
  renderFeed();
}

function timeAgo(dateStr) {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = Math.max(0, now - then);
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return mins + 'm ago';
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return hrs + 'h ago';
  const days = Math.floor(hrs / 24);
  if (days < 7) return days + 'd ago';
  return new Date(dateStr).toLocaleDateString();
}

const SOURCE_ICONS = {
  'news': '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>',
  'advisory': '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22c-1.1 0-2-.2-2.7-.6L3.5 18.2c-.4-.3-.7-.7-.9-1.1-.2-.5-.3-1-.3-1.5V8.4c0-.5.1-1 .3-1.5.2-.4.5-.8.9-1.1l5.8-3.2C10 2.2 11 2 12 2s2 .2 2.7.6l5.8 3.2c.4.3.7.7.9 1.1.2.5.3 1 .3 1.5v7.2c0 .5-.1 1-.3 1.5-.2.4-.5.8-.9 1.1l-5.8 3.2c-.7.4-1.6.6-2.7.6z"/></svg>',
  'humanitarian': '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>',
  'community': '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
};

const SOURCE_COLORS = {
  'news': '#3498ec',
  'advisory': '#e67e22',
  'humanitarian': '#e74c3c',
  'community': '#2ecc71',
};

function renderFeed() {
  const filtered = _feedFilter === 'all' ? _feedArticles : _feedArticles.filter(a => a.source_type === _feedFilter);
  const html = filtered.length ? filtered.map(a => {
    const icon = SOURCE_ICONS[a.source_type] || SOURCE_ICONS.news;
    const color = SOURCE_COLORS[a.source_type] || '#3498ec';
    return `<a href="${a.url || '#'}" target="_blank" rel="noopener" class="feed-item" style="border-left-color:${color}">
      <div class="feed-item-header">
        <span class="feed-item-source" style="color:${color}">${icon} ${a.source}</span>
        <span class="feed-item-time">${timeAgo(a.published_at)}</span>
      </div>
      <div class="feed-item-title">${a.title}</div>
      ${a.summary ? `<div class="feed-item-summary">${a.summary.slice(0, 180)}${a.summary.length > 180 ? '...' : ''}</div>` : ''}
    </a>`;
  }).join('') : '<div style="text-align:center;padding:2rem;color:rgba(255,255,255,.35);font-size:.82rem">No articles for this filter yet.</div>';

  const el = document.getElementById('feed-list');
  const mEl = document.getElementById('m-feed-list');
  if (el) el.innerHTML = html;
  if (mEl) mEl.innerHTML = html;
}

// Realtime feed updates
function initFeedRealtime() {
  _sb.channel('news_feed').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'news_feed' }, payload => {
    if (payload.new) {
      _feedArticles.unshift(payload.new);
      if (_feedArticles.length > 100) _feedArticles.pop();
      renderFeed();
    }
  }).subscribe();
}

window.addEventListener('DOMContentLoaded',()=>{
  if(isMob()){ initMobile(); }
  else { showView('map'); }
  // Init autocomplete on both desktop and mobile location fields
  initLocationAutocomplete('offer-location','offer-lat','offer-lng','offer-location-ac');
  initLocationAutocomplete('m-offer-location','m-offer-lat','m-offer-lng','m-offer-location-ac');
  initAuth();
  checkTelegramRedirect();
  checkXRedirect();
  initFeedRealtime();
  initReportRealtime();
  initStrandedRealtime();
  loadReports();
  loadStranded();
  initLocationAutocomplete('report-location','report-lat','report-lng','report-location-ac');
  initLocationAutocomplete('stranded-location','stranded-lat','stranded-lng','stranded-location-ac');
  initLocationAutocomplete('stranded-dest','stranded-dest-lat','stranded-dest-lng','stranded-dest-ac');
  refreshSitrep();
  setInterval(refreshSitrep,5*60*1000);
  if(SB_ON){loadPosts();subscribeStream();}
  else{
    const el=document.getElementById('offer-posts');
    if(el)el.innerHTML='<div class="empty-state" style="color:var(--warn)">Supabase not configured.</div>';
  }
});
window.addEventListener('resize',()=>{if(isMob()&&!window._mobileInit)initMobile();});