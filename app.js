// ============================================================
// CONFIG
// ============================================================
const SUPABASE_URL  = 'https://nzvlvqyitsjuxnafcuhl.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im56dmx2cXlpdHNqdXhuYWZjdWhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0MTQxOTEsImV4cCI6MjA4Nzk5MDE5MX0.K4JCnTJTBR7zQBaLmxbeZS2QBRCIxdVzbZKrmapOEkw';
const _sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON);
const SB_ON = !SUPABASE_URL.includes('YOUR_PROJECT_ID');

// ── Accent color system — MUST be at top, called throughout ──
var ACCENT_THEMES = {
  purple: { hex: '#a855f7', r: 168, g: 85,  b: 247 },
  yellow: { hex: '#f5c400', r: 245, g: 196, b: 0   },
  blue:   { hex: '#3498ec', r: 52,  g: 152, b: 236 },
  red:    { hex: '#ec3452', r: 236, g: 52,  b: 82  },
  amber:  { hex: '#ff9f1c', r: 255, g: 159, b: 28  },
  teal:   { hex: '#2ec4b6', r: 46,  g: 196, b: 182 },
  pink:   { hex: '#ec4899', r: 236, g: 72,  b: 153 },
};
let _currentAccent = 'blue';
function accentHex() { return ACCENT_THEMES[_currentAccent]?.hex || '#a855f7'; }
function accentRgba(a) { const t = ACCENT_THEMES[_currentAccent] || ACCENT_THEMES.purple; return `rgba(${t.r},${t.g},${t.b},${a})`; }

// Solid button style helpers (accent-aware)
// HTML escape — prevents XSS from user input in innerHTML
function esc(s) {
  if (!s) return '';
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

// Solid button style helpers (accent-aware)
function btnStyle(type, size) {
  const pad = size === 'sm' ? '.25rem .5rem' : '.5rem .8rem';
  const fs = size === 'sm' ? '.62rem' : '.72rem';
  const base = 'border:none;border-radius:8px;font-weight:700;cursor:pointer;font-family:Inter,sans-serif;padding:'+pad+';font-size:'+fs+';';
  if (type === 'accent') return base + 'background:'+accentHex()+';color:#fff;';
  if (type === 'green') return base + 'background:#22c55e;color:#000;';
  if (type === 'danger') return base + 'background:#ec3452;color:#fff;';
  return base + 'background:rgba(255,255,255,.1);color:rgba(255,255,255,.6);';
}

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
  // ── GOVERNMENT TRAVEL REGISTRATION & ALERTS ─────────────
  {type:'Government',name:'US STEP Program',desc:'Register for emergency alerts and evacuation notices from US Embassy. Essential for all US citizens abroad.',url:'https://step.state.gov',phone:'+1-888-407-4747'},
  {type:'Government',name:'UK FCDO Travel Advice',desc:'Live advisories, consular support, and crisis registration for British nationals.',url:'https://www.gov.uk/foreign-travel-advice',phone:'+44-20-7008-5000'},
  {type:'Government',name:'Australia Smartraveller',desc:'DFAT advisories, crisis registration, and 24/7 consular emergency line.',url:'https://www.smartraveller.gov.au',phone:'+61-2-6261-3305'},
  {type:'Government',name:'Canada ROCA',desc:'Register of Canadians Abroad — register for crisis notifications and evacuation.',url:'https://travel.gc.ca/travelling/registration',phone:'+1-613-996-8885'},
  {type:'Government',name:'India MADAD Portal',nat:['IN'],desc:'Consular grievance portal for Indian nationals abroad. Track complaints, request assistance.',url:'https://madad.gov.in',phone:'+91-11-2301-2113'},
  {type:'Government',name:'Philippines OWWA',nat:['PH'],desc:'Overseas Workers Welfare Administration — emergency repatriation, financial aid, and shelter for OFWs.',url:'https://owwa.gov.ph',phone:'+632-1348'},
  {type:'Government',name:'Pakistan CMU (24/7)',nat:['PK'],desc:'Crisis Management Unit — 24/7 helpline for Pakistanis stranded abroad.',url:'https://mofa.gov.pk',phone:'+92-51-9207887'},
  {type:'Government',name:'Bangladesh MOFA Helpline',nat:['BD'],desc:'Ministry of Foreign Affairs emergency line for stranded Bangladeshi workers.',url:'https://mofa.gov.bd',phone:'+880-2-9554000'},
  {type:'Government',name:'Nepal MOFA',nat:['NP'],desc:'Ministry of Foreign Affairs — emergency coordination for Nepali workers in Gulf states.',url:'https://mofa.gov.np',phone:'+977-1-4200182'},
  {type:'Government',name:'Sri Lanka SLBFE',nat:['LK'],desc:'Sri Lanka Bureau of Foreign Employment — welfare and repatriation support.',url:'https://www.slbfe.lk',phone:'+94-11-2879900'},
  {type:'Government',name:'Germany Crisis Hotline',nat:['DE'],desc:'Federal Foreign Office 24/7 crisis line for German nationals.',url:'https://www.auswaertiges-amt.de',phone:'+49-30-1817-0'},
  {type:'Government',name:'France Centre de Crise',nat:['FR'],desc:'24/7 crisis center for French nationals abroad.',url:'https://www.diplomatie.gouv.fr',phone:'+33-1-5359-1100'},
  {type:'Government',name:'Japan Emergency Contact',nat:['JP'],desc:'MOFA consular emergency line for Japanese nationals.',url:'https://www.anzen.mofa.go.jp',phone:'+81-3-3580-3311'},
  {type:'Government',name:'South Korea Emergency',nat:['KR'],desc:'MOFA 24/7 consular emergency for Korean nationals abroad.',url:'https://www.0404.go.kr',phone:'+82-2-3210-0404'},
  {type:'Government',name:'Ireland DFA',nat:['IE'],desc:'Department of Foreign Affairs 24/7 consular assistance for Irish citizens.',url:'https://www.ireland.ie',phone:'+353-1-408-2000'},
  {type:'Government',name:'Netherlands 24/7 BZ',nat:['NL'],desc:'Ministry of Foreign Affairs crisis line for Dutch nationals.',url:'https://www.netherlandsandyou.nl',phone:'+31-247-247-247'},

  // ── GOVERNMENT RELIEF PROGRAMS (HOTEL/REPATRIATION) ────
  {type:'Relief',name:'UAE Tourist Support Fund',countries:['AE'],desc:'UAE government covering hotel costs for tourists stranded due to airspace closures. Apply through your hotel or airline.',url:'https://www.mohap.gov.ae',phone:'+971-800-11111'},
  {type:'Relief',name:'Qatar Airways Rebooking',countries:['QA'],desc:'Free rebooking for affected passengers. No change fees on Gulf routes through crisis period.',url:'https://www.qatarairways.com/press-releases.html',phone:'+974-4023-0000'},
  {type:'Relief',name:'Emirates Rebooking',countries:['AE'],desc:'Passengers on cancelled routes eligible for free rebooking or full refund. Lounge access for stranded passengers in Dubai.',url:'https://www.emirates.com/help',phone:'+971-600-555-555'},
  {type:'Relief',name:'Etihad Guest Relief',countries:['AE'],desc:'Free rebooking, hotel stays for connecting passengers stranded in Abu Dhabi.',url:'https://www.etihad.com/en/manage',phone:'+971-600-555-666'},
  {type:'Relief',name:'Air India Gulf Relief',countries:['AE','SA','QA','BH','KW','OM'],nat:['IN'],desc:'Special repatriation flights and free rebooking for Indian nationals on cancelled Gulf routes.',url:'https://www.airindia.com',phone:'+91-11-2462-2220'},
  {type:'Relief',name:'Philippine Airlines OFW Flights',countries:['AE','SA','QA','BH','KW','OM'],nat:['PH'],desc:'Special repatriation flights coordinated with DFA/OWWA for stranded OFWs.',url:'https://www.philippineairlines.com',phone:'+632-8855-8888'},
  {type:'Relief',name:'PIA Emergency Routes',countries:['AE','SA','QA','BH','KW','OM'],nat:['PK'],desc:'Pakistan International Airlines special Gulf evacuation flights. Priority for workers and families.',url:'https://www.piac.com.pk',phone:'+92-21-111-786-786'},
  {type:'Relief',name:'Biman Bangladesh Relief',countries:['AE','SA','QA','BH','KW','OM'],nat:['BD'],desc:'Emergency repatriation flights for Bangladeshi workers from Gulf states.',url:'https://www.bfrbd.com',phone:'+880-2-8901600'},
  {type:'Relief',name:'Jordan Hotel Assistance',countries:['JO'],desc:'Jordanian government providing accommodation support for transit passengers stranded at Amman airport.',url:'https://www.mota.gov.jo'},
  {type:'Relief',name:'Bahrain Visitor Relief',countries:['BH'],desc:'Bahrain Tourism Authority assisting stranded tourists with hotel accommodations.',url:'https://www.btea.bh',phone:'+973-1758-8777'},
  {type:'Relief',name:'Saudi GACA Assistance',countries:['SA'],desc:'General Authority of Civil Aviation passenger rights — compensation and hotel for delayed/cancelled flights.',url:'https://gaca.gov.sa',phone:'+966-920-000-999'},

  // ── WORKER RIGHTS & LABOR ──────────────────────────────
  {type:'Worker Rights',name:'ILO Migrant Workers',desc:'International Labour Organization — legal advice and rights protection for migrant workers in Gulf states.',url:'https://www.ilo.org/global/topics/labour-migration'},
  {type:'Worker Rights',name:'Migrant-Rights.org',desc:'Advocacy and real-time reporting on migrant worker conditions in Gulf states. Know your rights resources.',url:'https://www.migrant-rights.org'},
  {type:'Worker Rights',name:'POLO-OWWA UAE',countries:['AE'],nat:['PH'],desc:'Philippine Overseas Labor Office — on-the-ground assistance for Filipino workers in UAE.',url:'https://abudhabi.philembassy.net',phone:'+971-50-813-7836'},
  {type:'Worker Rights',name:'OKUP Bangladesh',desc:'Ovibashi Karmi Unnayan Program — support for Bangladeshi migrant workers.',url:'https://www.okup.org.bd'},
  {type:'Worker Rights',name:'PAFLA',desc:'Pan-African Federation of the Landless — legal aid for African workers in Gulf states.',url:'https://www.pafla.org'},
  {type:'Worker Rights',name:'Pravasi Legal Cell India',nat:['IN'],desc:'Indian government legal assistance cell for Indian workers facing labor disputes abroad.',url:'https://www.mea.gov.in',phone:'+91-1800-11-3090'},

  // ── HUMANITARIAN / NGO ─────────────────────────────────
  {type:'NGO',name:'UNHCR',desc:'UN Refugee Agency — active in UAE, Iraq, Jordan. Protection and resettlement assistance.',url:'https://www.unhcr.org',phone:'+41-22-739-8111'},
  {type:'NGO',name:'ICRC / Red Cross',desc:'Active across the conflict zone. Family tracing, medical support, emergency supplies.',url:'https://www.icrc.org'},
  {type:'NGO',name:'IOM',desc:'International Organization for Migration — emergency evacuation logistics, stranded migrant support.',url:'https://www.iom.int'},
  {type:'NGO',name:'IRC',desc:'International Rescue Committee — emergency relief in Iraq and Jordan. Medical and shelter support.',url:'https://www.rescue.org'},
  {type:'NGO',name:'Médecins Sans Frontières',desc:'Medical teams active in Iraq, Yemen, and Jordan. Emergency healthcare for conflict-affected populations.',url:'https://www.msf.org'},
  {type:'NGO',name:'World Food Programme',desc:'Emergency food distribution in conflict-affected areas. Active in Yemen, Iraq, Syria.',url:'https://www.wfp.org'},
  {type:'NGO',name:'UNICEF Gulf Response',desc:'Child protection and family reunification support in crisis-affected Gulf states.',url:'https://www.unicef.org'},
  {type:'NGO',name:'Doctors Without Borders',desc:'Emergency medical care in Iraq, Yemen, and surrounding conflict zones.',url:'https://www.doctorswithoutborders.org'},
  {type:'NGO',name:'Amnesty International',desc:'Documenting human rights situations and advocating for stranded workers\' rights.',url:'https://www.amnesty.org'},
  {type:'NGO',name:'Human Rights Watch',desc:'Monitoring labor rights and documenting conditions for migrant workers in Gulf states.',url:'https://www.hrw.org'},

  // ── TRAVEL INSURANCE & FINANCIAL ───────────────────────
  {type:'Financial',name:'Travel Insurance Claims',desc:'Most policies cover trip interruption due to armed conflict. File claims ASAP — document everything with photos and receipts.',url:'https://www.insuremytrip.com/travel-advice/travel-insurance-war-exclusion'},
  {type:'Financial',name:'EU Air Passenger Rights',desc:'EU261 compensation may apply for EU-connected flights. Up to €600 for cancelled flights depending on distance.',url:'https://europa.eu/youreurope/citizens/travel/passenger-rights/air/index_en.htm'},
  {type:'Financial',name:'US DOT Refund Rules',desc:'US airlines must refund cancelled flights. File complaints with DOT if airlines refuse.',url:'https://www.transportation.gov/airconsumer',phone:'+1-202-366-2220'},
  {type:'Financial',name:'Chargeback Guide',desc:'If airlines won\'t refund, credit card chargebacks may be possible. Contact your bank within 120 days of transaction.',url:'https://www.consumerfinance.gov/ask-cfpb/'},
  {type:'Financial',name:'Western Union Emergency',desc:'Send/receive emergency funds internationally when banking is disrupted.',url:'https://www.westernunion.com',phone:'+1-800-325-6000'},
  {type:'Financial',name:'MoneyGram',desc:'Emergency money transfers to Gulf state locations for stranded travelers.',url:'https://www.moneygram.com',phone:'+1-800-926-9400'},

  // ── MENTAL HEALTH & CRISIS SUPPORT ─────────────────────
  {type:'Mental Health',name:'Crisis Text Line',desc:'Free 24/7 crisis counseling via text. Text HOME to 741741 (US) or 85258 (UK).',url:'https://www.crisistextline.org'},
  {type:'Mental Health',name:'IASC Mental Health',desc:'Inter-Agency Standing Committee — mental health resources for humanitarian crises.',url:'https://interagencystandingcommittee.org/iasc-reference-group-mental-health-and-psychosocial-support'},
  {type:'Mental Health',name:'Befrienders Worldwide',desc:'Emotional support in 30+ languages. Find local helpline numbers.',url:'https://www.befrienders.org'},
  {type:'Mental Health',name:'iCall India',desc:'Psychosocial helpline for Indians abroad experiencing crisis-related distress.',url:'https://icallhelpline.org',phone:'+91-22-2556-3291'},

  // ── LEGAL AID ──────────────────────────────────────────
  {type:'Legal',name:'Gulf Immigration Lawyers',desc:'Directory of immigration attorneys specializing in Gulf state visa/labor issues.',url:'https://www.hg.org/law-firms/immigration/united-arab-emirates'},
  {type:'Legal',name:'AILA Emergency Resources',desc:'American Immigration Lawyers Association — emergency resources for US citizens with visa issues abroad.',url:'https://www.aila.org'},
  {type:'Legal',name:'UK Citizens Advice Abroad',desc:'Free legal guidance for British nationals facing legal issues overseas.',url:'https://www.citizensadvice.org.uk'},

  // ── INFO & TOOLS ───────────────────────────────────────
  {type:'Info',name:'FlightAware',desc:'Live airspace closures, flight tracking, and airline status updates.',url:'https://flightaware.com'},
  {type:'Info',name:'Flightradar24',desc:'Real-time flight tracking. See which routes are active and which airspace is closed.',url:'https://www.flightradar24.com'},
  {type:'Info',name:'ReliefWeb',desc:'UN humanitarian news, situation reports, and NGO coordination updates.',url:'https://reliefweb.int'},
  {type:'Info',name:'NOTAM Search',desc:'Official Notice to Airmen — check airspace closures and restrictions by region.',url:'https://www.notams.faa.gov'},
  {type:'Info',name:'Google Translate',desc:'Essential for communicating with locals, reading signs, and understanding official notices in Arabic/Farsi.',url:'https://translate.google.com'},
  {type:'Info',name:'Maps.me Offline',desc:'Download offline maps before your data runs out. Works without internet for navigation.',url:'https://maps.me'},
  {type:'Info',name:'XE Currency Converter',desc:'Live exchange rates. Critical when you\'re budgeting emergency funds in a foreign currency.',url:'https://www.xe.com'},
  {type:'Info',name:'iOverlander',desc:'Crowd-sourced border crossing info, open roads, and safe rest stops.',url:'https://www.ioverlander.com'},
  {type:'Info',name:'Skyscanner Everywhere',desc:'Find the cheapest available flights from your location to anywhere. Good for alternative routing.',url:'https://www.skyscanner.com/transport/flights-from/everywhere'},
  {type:'Info',name:'Rome2Rio',desc:'Multi-modal route planner — shows bus, train, ferry, and flight alternatives when direct routes are cancelled.',url:'https://www.rome2rio.com'},
  {type:'Info',name:'Hostelworld',desc:'Budget accommodation finder. Filter by price and location for emergency stays.',url:'https://www.hostelworld.com'},
  {type:'Info',name:'Couchsurfing',desc:'Free accommodation from locals. Community-verified hosts. Emergency stays available in many Gulf cities.',url:'https://www.couchsurfing.com'},
  {type:'Info',name:'What3Words',desc:'Precise location sharing without addresses. Useful for directing emergency services or meeting helpers.',url:'https://what3words.com'},
  {type:'Info',name:'Wise (TransferWise)',desc:'Low-cost international money transfers. Get money sent to you quickly in local currency.',url:'https://wise.com'},

  // ── COMMUNITY ──────────────────────────────────────────
  {type:'Community',name:'r/dubai Megathread',countries:['AE'],desc:'Real-time reports from expats in Dubai. Verified information from people on the ground.',url:'https://reddit.com/r/dubai'},
  {type:'Community',name:'r/saudiarabia',countries:['SA'],desc:'Community updates from expats and residents in Saudi Arabia.',url:'https://reddit.com/r/saudiarabia'},
  {type:'Community',name:'ExpatWoman Forum',desc:'Active expat community with Gulf crisis threads. Housing, legal, and practical advice.',url:'https://www.expatwoman.com/forum'},
  {type:'Community',name:'InterNations Gulf',desc:'Expat network with local chapters in UAE, Qatar, Bahrain. Emergency meetups and support.',url:'https://www.internations.org'},
  {type:'Community',name:'ImStranded Telegram',desc:'Our official Telegram community. Real-time updates, mutual aid, and volunteer coordination.',url:'https://t.me/imstrandedorg'},
  {type:'Community',name:'ImStranded X / Twitter',desc:'Live crisis updates, flight status, and community stories.',url:'https://x.com/imstrandedorg'},
];



// ── ME hub skeleton for fallback rendering (coords/city only — no hardcoded counts) ──
// All cancelled/stranded figures come from Supabase airport_daily + route_daily.
// This array is ONLY used when the DB is unreachable.
let AIRPORT_DATA = [
  {city:'Dubai',          code:'DXB',iata:'DXB',coords:[25.252,55.364],cancelled:0,stranded:0,status:'DISRUPTED',isME:true,updated:'fallback'},
  {city:'Abu Dhabi',      code:'AUH',iata:'AUH',coords:[24.432,54.651],cancelled:0,stranded:0,status:'DISRUPTED',isME:true,updated:'fallback'},
  {city:'Doha',           code:'DOH',iata:'DOH',coords:[25.273,51.608],cancelled:0,stranded:0,status:'RESTRICTED',isME:true,updated:'fallback'},
  {city:'Kuwait City',    code:'KWI',iata:'KWI',coords:[29.226,47.968],cancelled:0,stranded:0,status:'OPEN',    isME:true,updated:'fallback'},
  {city:'Bahrain',        code:'BAH',iata:'BAH',coords:[26.270,50.633],cancelled:0,stranded:0,status:'RESTRICTED',isME:true,updated:'fallback'},
  {city:'Muscat',         code:'MCT',iata:'MCT',coords:[23.593,58.284],cancelled:0,stranded:0,status:'DISRUPTED',isME:true,updated:'fallback'},
  {city:'Sharjah',        code:'SHJ',iata:'SHJ',coords:[25.329,55.517],cancelled:0,stranded:0,status:'OPEN',    isME:true,updated:'fallback'},
  {city:'Al Maktoum',     code:'DWC',iata:'DWC',coords:[24.896,55.161],cancelled:0,stranded:0,status:'OPEN',    isME:true,updated:'fallback'},
  {city:'Ras Al Khaimah', code:'RKT',iata:'RKT',coords:[25.613,55.939],cancelled:0,stranded:0,status:'DISRUPTED',isME:true,updated:'fallback'},
  {city:'Riyadh',         code:'RUH',iata:'RUH',coords:[24.957,46.698],cancelled:0,stranded:0,status:'OPEN',    isME:true,updated:'fallback'},
  {city:'Jeddah',         code:'JED',iata:'JED',coords:[21.670,39.150],cancelled:0,stranded:0,status:'OPEN',    isME:true,updated:'fallback'},
  {city:'Dammam',         code:'DMM',iata:'DMM',coords:[26.471,49.798],cancelled:0,stranded:0,status:'DISRUPTED',isME:true,updated:'fallback'},
  {city:'Medina',         code:'MED',iata:'MED',coords:[24.553,39.705],cancelled:0,stranded:0,status:'OPEN',    isME:true,updated:'fallback'},
  {city:'Tehran IKA',     code:'IKA',iata:'IKA',coords:[35.416,51.152],cancelled:0,stranded:0,status:'OPEN',    isME:true,updated:'fallback'},
  {city:'Tehran Mehrabad',code:'THR',iata:'THR',coords:[35.689,51.313],cancelled:0,stranded:0,status:'OPEN',    isME:true,updated:'fallback'},
  {city:'Mashhad',        code:'MHD',iata:'MHD',coords:[36.236,59.641],cancelled:0,stranded:0,status:'OPEN',    isME:true,updated:'fallback'},
  {city:'Shiraz',         code:'SYZ',iata:'SYZ',coords:[29.540,52.590],cancelled:0,stranded:0,status:'OPEN',    isME:true,updated:'fallback'},
  {city:'Baghdad',        code:'BGW',iata:'BGW',coords:[33.262,44.235],cancelled:0,stranded:0,status:'OPEN',    isME:true,updated:'fallback'},
  {city:'Erbil',          code:'EBL',iata:'EBL',coords:[36.237,43.963],cancelled:0,stranded:0,status:'DISRUPTED',isME:true,updated:'fallback'},
  {city:'Basra',          code:'BSR',iata:'BSR',coords:[30.549,47.662],cancelled:0,stranded:0,status:'DISRUPTED',isME:true,updated:'fallback'},
  {city:'Tel Aviv',       code:'TLV',iata:'TLV',coords:[32.011,34.887],cancelled:0,stranded:0,status:'DISRUPTED',isME:true,updated:'fallback'},
  {city:'Amman',          code:'AMM',iata:'AMM',coords:[31.723,35.993],cancelled:0,stranded:0,status:'DISRUPTED',isME:true,updated:'fallback'},
  {city:'Beirut',         code:'BEY',iata:'BEY',coords:[33.821,35.488],cancelled:0,stranded:0,status:'DISRUPTED',isME:true,updated:'fallback'},
];

// ============================================================
// LIVE DATA FROM SUPABASE — unified pipeline
//
// Data model:
//   airport_daily  — one row per (iata, date), cancelled = that day's count
//   route_daily    — one row per (dep_iata, arr_iata, date), cancelled = that day's count
//
// ALL figures are cumulative since CRISIS_START (2026-03-01) so the map
// shows the full picture of who is still stranded — not just today.
// "Today" figures are derived separately for the +today labels.
// The bar graph later = group route_daily by date, trivial from this structure.
// ============================================================
const CRISIS_START = '2026-03-01';
let _globalDisruptions = [];

// _meOutbound[hubIata] = sorted array of { iata, cancelled, stranded, airlines[] }
// Cumulative since CRISIS_START — real observed data from route_daily.
let _meOutbound = null;

let _dataDate = '';

async function fetchSitrepFromSupabase() {
  const AVG_PAX = 185;

  try {
    const today = new Date().toISOString().slice(0, 10);
    _dataDate = today;

    // ── 1. Pull ALL airport_daily rows since crisis start ──────
    const { data: adRows, error: adErr } = await _sb
      .from('airport_daily')
      .select('iata, date, cancelled, status, cancel_rate, is_me_hub, city, country_code, lat, lng')
      .gte('date', CRISIS_START)
      .lte('date', today)
      .order('date', { ascending: true });

    if (adErr || !adRows || !adRows.length) throw new Error('No airport_daily data');

    // ── 2. Pull ALL route_daily rows since crisis start ────────
    // Key fix: DOH→BOS cancelled on Mar 3 still matters today —
    // those passengers are still stranded. Sum across ALL days.
    let routes = [];
    let from = 0;
    const pageSize = 1000;
    const MAX_RETRIES = 3;
    while (true) {
      let page = null, pageErr = null, attempts = 0;
      while (attempts < MAX_RETRIES) {
        const res = await _sb
          .from('route_daily')
          .select('dep_iata, arr_iata, date, cancelled, airlines')
          .gte('date', CRISIS_START)
          .lte('date', today)
          .range(from, from + pageSize - 1);
        page = res.data; pageErr = res.error;
        if (!pageErr) break;
        attempts++;
        console.warn(`[Pipeline] route_daily page ${from} attempt ${attempts} failed:`, pageErr.message);
        if (attempts < MAX_RETRIES) await new Promise(r => setTimeout(r, 400 * attempts));
      }
      if (pageErr) { console.warn('[Pipeline] route_daily page failed after retries, continuing with partial data'); break; }
      if (!page || !page.length) break;
      routes.push(...page);
      if (page.length < pageSize) break;
      from += pageSize;
    }
    console.log(`[Pipeline] route_daily rows fetched: ${routes.length}`);

    // ── 3. Build AIRPORT_DATA from airport_daily ───────────────
    // .cancelled     = crisis total (sum of all days) — used everywhere as main figure
    // .todayCancelled = today's row only — used for +today labels
    // .h7days        = { 'MM-DD': count } for future sparklines / bar chart
    const apMap = {};
    for (const row of adRows) {
      const k = row.iata;
      if (!apMap[k]) {
        // Fall back to airports.js reference data for any fields the DB left null.
        // This is the main reason airports were rendering at [0,0] (null island) —
        // the edge function wasn't writing lat/lng/city for many airports.
        const apRef = (typeof findAirport === 'function') ? findAirport(k) : null;
        const lat   = row.lat  || apRef?.lat  || 0;
        const lng   = row.lng  || apRef?.lng  || 0;
        const city  = row.city || apRef?.city || k;
        apMap[k] = {
          iata: k, city, code: k,
          coords: [lat, lng],
          status: row.status || 'UNKNOWN',
          cancelRate: row.cancel_rate || 0,
          isME: row.is_me_hub,
          cancelled: 0,
          todayCancelled: 0,
          stranded: 0,
          todayStranded: 0,
          h7days: {},
          updated: 'live',
        };
      }
      const count = row.cancelled || 0;
      const mmdd  = row.date.slice(5);
      apMap[k].cancelled += count;
      apMap[k].h7days[mmdd] = count;
      apMap[k].status     = row.status || apMap[k].status;
      apMap[k].cancelRate = row.cancel_rate || apMap[k].cancelRate;
      if ((row.date || '').slice(0, 10) === today) {
        apMap[k].todayCancelled = count;
        apMap[k].todayStranded  = count * AVG_PAX;
      }
    }
    for (const a of Object.values(apMap)) {
      a.stranded = a.cancelled * AVG_PAX;
    }

    // ── Build _dailyTotals from ALL airports (ME + global) ────
    // h7days on AIRPORT_DATA is ME-only after the filter below,
    // so we capture global daily sums here for the timeline chart.
    window._dailyTotals = {};
    for (const ap of Object.values(apMap)) {
      for (const [mmdd, count] of Object.entries(ap.h7days || {})) {
        if (!window._dailyTotals[mmdd]) window._dailyTotals[mmdd] = { cancelled: 0, stranded: 0 };
        window._dailyTotals[mmdd].cancelled += count || 0;
        window._dailyTotals[mmdd].stranded  += (count || 0) * AVG_PAX;
      }
    }
    console.log(`[Pipeline] Built _dailyTotals: ${Object.keys(window._dailyTotals).length} days`);

    AIRPORT_DATA = Object.values(apMap).filter(a => a.isME);
    console.log(`[Pipeline] Built AIRPORT_DATA: ${AIRPORT_DATA.length} ME airports`);

    // ── 4. Aggregate routes across ALL days ───────────────────
    // routeTotals[dep][arr] = { cancelled: N, airlines: Set }
    const routeTotals = {};
    for (const r of routes) {
      const dep = r.dep_iata, arr = r.arr_iata;
      if (!routeTotals[dep]) routeTotals[dep] = {};
      if (!routeTotals[dep][arr]) routeTotals[dep][arr] = { cancelled: 0, airlines: new Set() };
      routeTotals[dep][arr].cancelled += r.cancelled || 0;
      (r.airlines || []).forEach(a => routeTotals[dep][arr].airlines.add(a));
    }

    const meIatas = new Set(AIRPORT_DATA.map(a => a.iata));

    // ── 4a. _meOutbound: ME hub → global destinations ─────────
    _meOutbound = {};
    for (const dep of Object.keys(routeTotals)) {
      if (!meIatas.has(dep)) continue;
      _meOutbound[dep] = Object.entries(routeTotals[dep])
        .filter(([arr]) => !meIatas.has(arr))
        .map(([arr, d]) => ({
          iata: arr, cancelled: d.cancelled,
          stranded: d.cancelled * AVG_PAX,
          airlines: Array.from(d.airlines),
        }))
        .sort((a, b) => b.cancelled - a.cancelled);
    }
    console.log(`[Pipeline] Built _meOutbound for ${Object.keys(_meOutbound).length} ME hubs`);

    // ── 4b. _meInbound: global → ME hub ──────────────────────
    window._meInbound = {};
    for (const dep of Object.keys(routeTotals)) {
      if (meIatas.has(dep)) continue;
      for (const [arr, d] of Object.entries(routeTotals[dep])) {
        if (!meIatas.has(arr)) continue;
        if (!window._meInbound[arr]) window._meInbound[arr] = {};
        if (!window._meInbound[arr][dep]) window._meInbound[arr][dep] = { cancelled: 0, airlines: new Set() };
        window._meInbound[arr][dep].cancelled += d.cancelled;
        d.airlines.forEach(a => window._meInbound[arr][dep].airlines.add(a));
      }
    }
    for (const hub of Object.keys(window._meInbound)) {
      window._meInbound[hub] = Object.entries(window._meInbound[hub])
        .map(([iata, d]) => ({ iata, cancelled: d.cancelled, stranded: d.cancelled * AVG_PAX, airlines: Array.from(d.airlines) }))
        .sort((a, b) => b.cancelled - a.cancelled);
    }
    console.log(`[Pipeline] Built _meInbound for ${Object.keys(window._meInbound).length} ME hubs`);

    // ── 4b2. _meAllOutbound / _meAllInbound: ALL routes including intra-ME ──
    // Used only for popup route lists — shows the full picture of what's cancelled.
    // _meOutbound/_meInbound intentionally exclude intra-ME for arc drawing purposes.
    window._meAllOutbound = {};
    window._meAllInbound  = {};
    for (const dep of Object.keys(routeTotals)) {
      if (!meIatas.has(dep)) continue;
      window._meAllOutbound[dep] = Object.entries(routeTotals[dep])
        .map(([arr, d]) => ({ iata: arr, cancelled: d.cancelled, stranded: d.cancelled * AVG_PAX, airlines: Array.from(d.airlines) }))
        .sort((a, b) => b.cancelled - a.cancelled);
    }
    for (const dep of Object.keys(routeTotals)) {
      for (const [arr, d] of Object.entries(routeTotals[dep])) {
        if (!meIatas.has(arr)) continue;
        if (!window._meAllInbound[arr]) window._meAllInbound[arr] = {};
        if (!window._meAllInbound[arr][dep]) window._meAllInbound[arr][dep] = { cancelled: 0, airlines: new Set() };
        window._meAllInbound[arr][dep].cancelled += d.cancelled;
        d.airlines.forEach(a => window._meAllInbound[arr][dep].airlines.add(a));
      }
    }
    for (const hub of Object.keys(window._meAllInbound)) {
      window._meAllInbound[hub] = Object.entries(window._meAllInbound[hub])
        .map(([iata, d]) => ({ iata, cancelled: d.cancelled, stranded: d.cancelled * AVG_PAX, airlines: Array.from(d.airlines) }))
        .sort((a, b) => b.cancelled - a.cancelled);
    }

    // ── 4c. _globalInbound: global airport → which ME hubs ────
    window._globalInbound = {};
    for (const dep of Object.keys(routeTotals)) {
      if (!meIatas.has(dep)) continue;
      for (const [arr, d] of Object.entries(routeTotals[dep])) {
        if (meIatas.has(arr)) continue;
        if (!window._globalInbound[arr]) window._globalInbound[arr] = {};
        if (!window._globalInbound[arr][dep]) window._globalInbound[arr][dep] = { cancelled: 0, airlines: new Set() };
        window._globalInbound[arr][dep].cancelled += d.cancelled;
        d.airlines.forEach(a => window._globalInbound[arr][dep].airlines.add(a));
      }
    }
    for (const globalIata of Object.keys(window._globalInbound)) {
      window._globalInbound[globalIata] = Object.entries(window._globalInbound[globalIata])
        .map(([iata, d]) => ({ iata, cancelled: d.cancelled, stranded: d.cancelled * AVG_PAX, airlines: Array.from(d.airlines) }))
        .sort((a, b) => b.cancelled - a.cancelled);
    }
    console.log(`[Pipeline] Built _globalInbound for ${Object.keys(window._globalInbound).length} global airports`);

    // ── 4d. Build _globalOutbound (global airport → ME hubs) ──
    // dep = global airport, arr = ME hub.
    // Powers the "Trying to Leave [city]" popup tab for non-ME airports.
    // e.g. IFN→DXB: 8 cancelled = 8 flights from Isfahan to Dubai cancelled.
    // Without this, both popup tabs showed the same ME→global data.
    window._globalOutbound = {};
    for (const dep of Object.keys(routeTotals)) {
      if (meIatas.has(dep)) continue;           // dep must be global
      for (const [arr, d] of Object.entries(routeTotals[dep])) {
        if (!meIatas.has(arr)) continue;         // arr must be ME
        if (!window._globalOutbound[dep]) window._globalOutbound[dep] = {};
        if (!window._globalOutbound[dep][arr]) window._globalOutbound[dep][arr] = { cancelled: 0, airlines: new Set() };
        window._globalOutbound[dep][arr].cancelled += d.cancelled;
        d.airlines.forEach(a => window._globalOutbound[dep][arr].airlines.add(a));
      }
    }
    for (const globalIata of Object.keys(window._globalOutbound)) {
      window._globalOutbound[globalIata] = Object.entries(window._globalOutbound[globalIata])
        .map(([iata, d]) => ({ iata, cancelled: d.cancelled, stranded: d.cancelled * AVG_PAX, airlines: Array.from(d.airlines) }))
        .sort((a, b) => b.cancelled - a.cancelled);
    }
    console.log(`[Pipeline] Built _globalOutbound for ${Object.keys(window._globalOutbound).length} global airports`);

    // ── 4e. Build _countryImpact (country → total cancelled + stranded) ──
    //
    // TWO different sources, one per airport type:
    //
    // ME hub countries (SA, AE, QA, ...):
    //   Use airport_daily (apMap) — comprehensive total for every flight at that airport.
    //   route_daily only captures tracked international routes; intra-ME logic previously
    //   excluded the dominant ME→global volume, making SA appear 20× too small.
    //
    // Non-ME countries (US, GB, IN, ...):
    //   Use route_daily (routeTotals) — only data source available for global airports.
    //   Count the global side of ME↔global routes (i.e. how many flights to/from that
    //   country were cancelled because of the ME disruption).
    //
    window._countryImpact = {};
    const addToCountry = (iata, cancelled) => {
      const ap = typeof findAirport === 'function' ? findAirport(iata) : null;
      if (!ap) return;
      const cc = ap.countryCode;
      const name = ap.countryName || cc;
      if (!window._countryImpact[cc]) window._countryImpact[cc] = { code: cc, name, cancelled: 0, stranded: 0, airports: new Set() };
      window._countryImpact[cc].cancelled += cancelled;
      window._countryImpact[cc].stranded  += cancelled * AVG_PAX;
      window._countryImpact[cc].airports.add(iata);
    };

    // ME hub countries: sum airport_daily totals directly — accurate and complete
    for (const ap of Object.values(apMap)) {
      if (!ap.isME) continue;
      addToCountry(ap.iata, ap.cancelled);
    }

    // Non-ME countries: sum route_daily — ME→global direction only.
    // route_daily has BOTH RUH→JFK and JFK→RUH as separate rows (dep+arr passes).
    // Counting both would double every non-ME country. Use ME→global only.
    for (const dep of Object.keys(routeTotals)) {
      if (!meIatas.has(dep)) continue;  // only ME departure hubs
      for (const [arr, d] of Object.entries(routeTotals[dep])) {
        if (meIatas.has(arr)) continue; // skip intra-ME (already in airport_daily)
        addToCountry(arr, d.cancelled);
      }
    }

    // Convert Sets to counts, sort by stranded desc
    window._countryImpact = Object.values(window._countryImpact)
      .map(c => ({ ...c, airports: c.airports.size }))
      .sort((a, b) => b.stranded - a.stranded);

    console.log(`[Pipeline] Built _countryImpact for ${window._countryImpact.length} countries`);
    try { renderNationsPanel(); } catch(e) { console.warn('[Pipeline] renderNationsPanel error:', e.message); }

    // ── 5. Build _globalDisruptions ───────────────────────────
    // ME airports: full airport_daily cancelled (both directions, includes intra-ME)
    // This captures the complete disruption footprint at each hub.
    const meAsDots = AIRPORT_DATA.filter(a => a.cancelled > 0).map(a => ({
      iata: a.iata, cancelled: a.cancelled, stranded: a.stranded,
      airlines: [], me_hubs: [], isME: true,
    }));

    // Global airports: sum of cancelled DEPARTURES from this airport to any ME hub
    // (global→ME direction = flights leaving this airport)
    const globalAcc = {};
    for (const dep of Object.keys(routeTotals)) {
      if (meIatas.has(dep)) continue;       // dep must be global
      for (const [arr, d] of Object.entries(routeTotals[dep])) {
        if (!meIatas.has(arr)) continue;     // arr must be ME
        if (!globalAcc[dep]) globalAcc[dep] = { cancelled: 0, me_hubs: new Set(), airlines: new Set() };
        globalAcc[dep].cancelled += d.cancelled;
        globalAcc[dep].me_hubs.add(arr);
        d.airlines.forEach(a => globalAcc[dep].airlines.add(a));
      }
    }

    const globalDots = Object.entries(globalAcc).map(([iata, g]) => ({
      iata,
      cancelled: g.cancelled,
      stranded:  g.cancelled * AVG_PAX,
      me_hubs:   Array.from(g.me_hubs),
      airlines:  Array.from(g.airlines),
      isME:      false,
    }));

    // ── 6. Totals ─────────────────────────────────────────────
    // Headline = authoritative AIRPORT_DATA totals (the ~20M number)
    const totalCancelled = AIRPORT_DATA.reduce((s, a) => s + a.cancelled, 0);
    const todayCancelled = AIRPORT_DATA.reduce((s, a) => s + (a.todayCancelled || 0), 0);
    const airportsClosed = AIRPORT_DATA.filter(a => a.status === 'CLOSED').length;
    const headlineStranded = totalCancelled * AVG_PAX;

    // Scale ME dot stranded values so all dots sum to the headline.
    // Global dots are departure-only and correct; ME dots overcount due to
    // intra-ME flights being counted at both endpoints.
    const globalTotal = globalDots.reduce((s, g) => s + (g.stranded || 0), 0);
    const meTarget = headlineStranded - globalTotal;  // what ME dots should add up to
    const meRawTotal = meAsDots.reduce((s, g) => s + (g.stranded || 0), 0);
    if (meRawTotal > 0 && meTarget > 0) {
      const scale = meTarget / meRawTotal;
      for (const d of meAsDots) {
        d.stranded = Math.round((d.stranded || 0) * scale);
      }
    }

    _globalDisruptions = [...meAsDots, ...globalDots];
    console.log(`[Pipeline] _globalDisruptions: ${meAsDots.length} ME + ${globalDots.length} global, headline ${headlineStranded.toLocaleString()}`);

    window._todayCancelledFlight = todayCancelled;
    window._todayStrandedPeople  = todayCancelled * AVG_PAX;

    return {
      stranded:  headlineStranded,
      cancelled: totalCancelled,
      airports:  airportsClosed,
      airspace:  4,
    };

  } catch(e) {
    console.warn('[Pipeline] DB unavailable, using fallback skeleton:', e.message);

    // ── Fallback: AIRPORT_DATA skeleton (coords only, no counts) ──
    // Global dots not shown in fallback — DB is source of truth.
    buildMEOutboundIndex();
    const meAsDots = AIRPORT_DATA.filter(a => (a.cancelled || 0) > 0).map(a => ({
      iata: a.iata, cancelled: a.cancelled, stranded: a.stranded,
      airlines: [], me_hubs: [], isME: true,
    }));
    _globalDisruptions = meAsDots;

    window._todayCancelledFlight = 0;
    window._todayStrandedPeople  = 0;

    const totalC = AIRPORT_DATA.reduce((s, a) => s + (a.cancelled || 0), 0);
    return {
      stranded:  totalC * AVG_PAX,
      cancelled: totalC,
      airports:  AIRPORT_DATA.filter(a => a.status === 'CLOSED' || a.status === 'RESTRICTED').length,
      airspace:  4,
    };
  }
}


function computeTotalStranded() {
  const meStranded = AIRPORT_DATA.reduce((s, a) => s + (a.stranded || 0), 0);
  const globalStranded = _globalDisruptions.reduce((s, g) => s + (g.isME ? 0 : (g.stranded || 0)), 0);
  return meStranded + globalStranded;
}

// _meOutbound is now populated by fetchSitrepFromSupabase (from route_daily).
// buildMEOutboundIndex is kept as the fallback path when DB is unavailable.

function buildMEOutboundIndex() {
  if (typeof AIRLINE_ROUTES === 'undefined' || typeof ME_AIRPORTS === 'undefined') return;

  // Build a lookup of actual cancelled totals from live AIRPORT_DATA
  const meActual = {};
  for (const a of AIRPORT_DATA) {
    const iata = a.iata || a.code;
    meActual[iata] = { cancelled: a.cancelled || 0, avgPax: a.avgPax || 180 };
  }

  const raw = {}; // { hubIata: { destIata: { weight, airlines: Set } } }
  const hubTotalWeight = {}; // total traffic weight per hub (for proportional distribution)

  for (const airlineKey in AIRLINE_ROUTES) {
    const airline = AIRLINE_ROUTES[airlineKey];
    for (const hub of airline.hubs) {
      const meHub = ME_AIRPORTS[hub];
      if (!meHub) continue;
      // Only process hubs with actual cancellations
      if (!meActual[hub] || meActual[hub].cancelled < 1) continue;

      for (const dest of airline.destinations) {
        if (ME_AIRPORTS[dest]) continue; // skip intra-ME routes
        const w = (typeof DEST_TRAFFIC !== 'undefined' && DEST_TRAFFIC[dest]) || 15;
        if (!raw[hub]) raw[hub] = {};
        if (!raw[hub][dest]) { raw[hub][dest] = { weight: 0, airlines: new Set() }; }
        raw[hub][dest].weight += w;
        raw[hub][dest].airlines.add(airline.name);
        hubTotalWeight[hub] = (hubTotalWeight[hub] || 0) + w;
      }
    }
  }

  _meOutbound = {};
  for (const hub of Object.keys(raw)) {
    const totalCancelled = meActual[hub]?.cancelled || 0;
    const totalW = hubTotalWeight[hub] || 1;
    const avgPax = ME_AIRPORTS[hub]?.avgPax || meActual[hub]?.avgPax || 180;

    _meOutbound[hub] = Object.entries(raw[hub])
      .map(([destIata, d]) => {
        const share = d.weight / totalW;
        const cancelled = Math.max(1, Math.round(totalCancelled * share));
        return {
          iata: destIata,
          cancelled,
          stranded: Math.round(cancelled * avgPax),
          airlines: Array.from(d.airlines),
        };
      })
      .filter(d => d.cancelled >= 1)
      .sort((a, b) => b.cancelled - a.cancelled);
  }
  console.log(`[MEOutbound] Built index for ${Object.keys(_meOutbound).length} ME airports`);
}

// ============================================================
// MAP STATE
// ============================================================
function getSC() { const h = accentHex(); return {danger:h, warn:h, safe:h}; }
const _mk = {country:[],routes:[],worldwide:[],help:[]};
let _helpCluster = null;
let _mHelpCluster = null;
let _postMarkers = [];
let posts = [];
let _globalPins = [];
let _globalCluster = null;
let _mGlobalCluster = null;
let _activeFilter = 'all';

function timeAgo(dateStr) {
  const diff = Math.max(0, Date.now() - new Date(dateStr).getTime());
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return mins + 'm ago';
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return hrs + 'h ago';
  const days = Math.floor(hrs / 24);
  if (days < 7) return days + 'd ago';
  return new Date(dateStr).toLocaleDateString();
}

// ============================================================
// FILTER PANEL
// ============================================================

// GPS geolocation
function useMyLocation(prefix) {
  if (!navigator.geolocation) { alert('Geolocation not supported.'); return; }
  const locInput = document.getElementById(prefix + '-location');
  if (locInput) locInput.value = 'Locating...';
  navigator.geolocation.getCurrentPosition(async (pos) => {
    const lat = pos.coords.latitude, lng = pos.coords.longitude;
    document.getElementById(prefix + '-lat').value = lat;
    document.getElementById(prefix + '-lng').value = lng;
    try {
      const r = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`, { headers: { 'User-Agent': 'ImStranded/1.0' } });
      const d = await r.json();
      if (locInput) locInput.value = d.display_name?.split(',').slice(0, 3).join(',').trim() || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    } catch (e) { if (locInput) locInput.value = `${lat.toFixed(4)}, ${lng.toFixed(4)}`; }
  }, () => { if (locInput) locInput.value = ''; alert('Could not get location. Please enter manually.'); }, { enableHighAccuracy: true, timeout: 10000 });
}

// Airport search autocomplete
let _apTimer = null;
function airportAutocomplete(input, listId, prefix) {
  clearTimeout(_apTimer);
  const list = document.getElementById(listId);
  const q = input.value.trim();
  if (q.length < 2) { list.classList.remove('open'); return; }
  _apTimer = setTimeout(() => {
    const results = searchAirports(q, 8);
    if (!results.length) { list.classList.remove('open'); return; }
    list.innerHTML = results.map((a, i) => 
      `<div class="loc-ac-item" data-idx="${i}" onmousedown="pickAirport(event,'${prefix}',${i},'${listId}')">
        <strong>${a.iata}</strong> — ${a.city} <small>${a.name}, ${a.countryName}</small>
      </div>`
    ).join('');
    list.classList.add('open');
    list._results = results;
  }, 150);
  input.addEventListener('blur', () => setTimeout(() => list.classList.remove('open'), 200), { once: true });
}

function pickAirport(e, prefix, idx, listId) {
  e.preventDefault();
  const list = document.getElementById(listId);
  const a = list._results?.[idx];
  if (!a) return;
  // Find the input — it's the sibling before the list's parent, or the input in the same loc-ac-wrap
  const wrap = list.closest('.loc-ac-wrap');
  const input = wrap?.querySelector('input[type="text"]');
  if (input) input.value = `${a.iata} — ${a.city}, ${a.countryName}`;
  // Set hidden fields
  const latEl = document.getElementById(prefix + '-dest-lat');
  const lngEl = document.getElementById(prefix + '-dest-lng');
  const countryEl = document.getElementById(prefix + '-dest-country');
  const airportEl = document.getElementById(prefix + '-dest-airport');
  if (latEl) latEl.value = a.lat;
  if (lngEl) lngEl.value = a.lng;
  if (countryEl) countryEl.value = a.countryCode;
  if (airportEl) airportEl.value = a.iata;
  list.classList.remove('open');
  // For filter panels, apply immediately
  if (prefix.includes('filter')) applyFilters();
}
let _filterPanelOpen = true;

function toggleFilterPanel() {
  _filterPanelOpen = !_filterPanelOpen;
  const panel = document.getElementById('filter-panel');
  if (panel) panel.classList.toggle('open', _filterPanelOpen);
  document.getElementById('ss-filter')?.classList.toggle('active-filter', _filterPanelOpen);
  document.getElementById('map-view')?.style.setProperty('--sidebar-w', _filterPanelOpen ? '280px' : '0px');
  const btn = document.getElementById('nav-filters-btn');
  if (btn) btn.textContent = _filterPanelOpen ? 'Hide Filters' : 'Show Filters';
}

function toggleSitrepBar() {
  const bar = document.getElementById('sitrep-bar');
  const mapView = document.getElementById('map-view');
  const btn = document.getElementById('nav-sitrep-btn');
  if (!bar) return;
  const hidden = bar.style.display === 'none';
  bar.style.display = hidden ? '' : 'none';
  // Recalculate map height: 56px header, 96px sitrep bar
  if (mapView) mapView.style.height = hidden ? 'calc(100vh - 56px - 96px)' : 'calc(100vh - 56px)';
  if (btn) btn.textContent = hidden ? 'Hide Menu' : 'Show Menu';
  // Invalidate Leaflet map size so tiles fill correctly
  setTimeout(() => {
    if (window._crisisMap) window._crisisMap.invalidateSize();
    if (window._mobileMap) window._mobileMap.invalidateSize();
  }, 50);
}

function toggleSocialsBar() {
  const bar = document.querySelector('.map-community-bar');
  const btn = document.getElementById('nav-socials-btn');
  if (!bar) return;
  const hidden = bar.style.display === 'none';
  bar.style.display = hidden ? '' : 'none';
  if (btn) btn.textContent = hidden ? 'Hide Socials' : 'Show Socials';
}

function renderImpactSheetChart() {
  const canvas = document.getElementById('impact-sheet-canvas');
  if (!canvas) return;
  const result = _drawChart(canvas, _impactSheetMetric);
  if (!result) return;
  const { pts, peakIdx } = result;
  const peakEl = document.getElementById('impact-sheet-peak');
  if (peakEl && pts[peakIdx]) {
    const mmdd = Object.keys(window._dailyTotals || {}).sort()[peakIdx];
    if (mmdd) peakEl.textContent = `Peak: Mar ${parseInt(mmdd.slice(3))} · ${pts[peakIdx].val.toLocaleString()}`;
  }
  _attachChartHover(canvas, _impactSheetMetric, 'impact-sheet-peak');
}

let _timelineMetric     = 'stranded';
let _impactSheetMetric  = 'stranded';


function toggleImpactSheetMetric() {
  _impactSheetMetric = _impactSheetMetric === 'stranded' ? 'cancelled' : 'stranded';
  const btn = document.getElementById('impact-sheet-metric-toggle');
  if (btn) btn.textContent = _impactSheetMetric === 'stranded' ? 'People ▾' : 'Flights ▾';
  renderImpactSheetChart();
}

function _buildChartPoints(canvasEl, metric) {
  const source = window._dailyTotals || {};
  const sorted = Object.keys(source).sort();
  if (!sorted.length) return null;
  const vals   = sorted.map(d => source[d][metric] || 0);
  const maxVal = Math.max(...vals, 1);
  // Use cached dims if available (set during _drawChart) to avoid feedback loop on hover
  const w      = canvasEl._cachedW || canvasEl.offsetWidth || 240;
  const h      = canvasEl._cachedH || parseInt(canvasEl.getAttribute('height')) || 64;
  const pad    = { l: 2, r: 2, t: 10, b: 4 };
  const cw     = w - pad.l - pad.r;
  const ch     = h - pad.t - pad.b;
  const n      = vals.length;
  const pts    = vals.map((v, i) => ({
    x:    pad.l + (n === 1 ? cw / 2 : i * (cw / (n - 1))),
    y:    pad.t + ch * (1 - v / maxVal),
    val:  v,
    date: sorted[i],
  }));
  return { pts, vals, sorted, maxVal, w, h, pad, cw, ch, dpr: window.devicePixelRatio || 1 };
}

function _drawChart(canvasEl, metric, accentOverride) {
  // Read width from PARENT, capped to viewport width to prevent mobile growth loop.
  const parent = canvasEl.parentElement;
  const maxW = window.innerWidth;
  let rawW = parent ? parent.clientWidth || parent.offsetWidth : 240;
  if (parent) {
    const ps = getComputedStyle(parent);
    rawW -= (parseFloat(ps.paddingLeft) || 0) + (parseFloat(ps.paddingRight) || 0);
  }
  const w = Math.max(Math.min(rawW, maxW), 100);
  // ALWAYS use the original CSS height (stored once), never read back from canvas.height
  // because canvas.height = h*dpr overwrites the attribute, causing snowball on retoggle.
  if (!canvasEl._originalH) canvasEl._originalH = parseInt(canvasEl.getAttribute('height')) || 72;
  const h = canvasEl._originalH;
  canvasEl._cachedW = w;
  canvasEl._cachedH = h;

  const data = _buildChartPoints(canvasEl, metric);
  if (!data) return;
  const { pts, vals, maxVal, pad, ch, dpr } = data;
  const peakIdx = vals.indexOf(Math.max(...vals));
  const accent  = accentOverride || getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#3498ec';

  canvasEl.width  = w * dpr;
  canvasEl.height = h * dpr;
  canvasEl.style.width  = w + 'px';
  canvasEl.style.height = h + 'px';
  canvasEl.style.maxWidth = '100%';

  const ctx = canvasEl.getContext('2d');
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, w, h);

  // Grid lines
  ctx.strokeStyle = 'rgba(255,255,255,.05)';
  ctx.lineWidth = 1;
  [0.25, 0.5, 0.75].forEach(f => {
    const y = pad.t + ch * (1 - f);
    ctx.beginPath(); ctx.moveTo(pad.l, y); ctx.lineTo(w - pad.r, y); ctx.stroke();
  });

  // Gradient fill
  const grad = ctx.createLinearGradient(0, pad.t, 0, pad.t + ch);
  grad.addColorStop(0, accent + '44');
  grad.addColorStop(1, accent + '00');
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pad.t + ch);
  pts.forEach(p => ctx.lineTo(p.x, p.y));
  ctx.lineTo(pts[pts.length - 1].x, pad.t + ch);
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();

  // Line
  ctx.beginPath();
  ctx.strokeStyle = accent;
  ctx.lineWidth   = 2;
  ctx.lineJoin    = 'round';
  ctx.lineCap     = 'round';
  pts.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
  ctx.stroke();

  // Peak dot
  if (pts[peakIdx]) {
    ctx.beginPath();
    ctx.arc(pts[peakIdx].x, pts[peakIdx].y, 4.5, 0, Math.PI * 2);
    ctx.fillStyle = accent; ctx.fill();
    ctx.strokeStyle = '#000'; ctx.lineWidth = 1.5; ctx.stroke();
  }

  // Latest dot
  const last = pts[pts.length - 1];
  if (last && peakIdx !== pts.length - 1) {
    ctx.beginPath();
    ctx.arc(last.x, last.y, 3, 0, Math.PI * 2);
    ctx.fillStyle = '#fff'; ctx.fill();
  }

  return { pts, peakIdx };
}

function _attachChartHover(canvasEl, metric, peakLabelId) {
  if (canvasEl._hoverHandler) {
    canvasEl.removeEventListener('mousemove', canvasEl._hoverHandler);
  }
  if (canvasEl._leaveHandler) {
    canvasEl.removeEventListener('mouseleave', canvasEl._leaveHandler);
  }
  if (canvasEl._touchStartHandler) {
    canvasEl.removeEventListener('touchstart', canvasEl._touchStartHandler);
    canvasEl.removeEventListener('touchmove', canvasEl._touchMoveHandler);
    canvasEl.removeEventListener('touchend', canvasEl._touchEndHandler);
  }

  // Snapshot the freshly-drawn chart pixels — restore these on every hover frame
  // instead of calling _drawChart (which resets canvas.width → reflow → snowball)
  const dpr      = window.devicePixelRatio || 1;
  const snapshot = canvasEl.getContext('2d').getImageData(0, 0, canvasEl.width, canvasEl.height);

  let tip = document.getElementById('chart-hover-tip');
  if (!tip) {
    tip = document.createElement('div');
    tip.id = 'chart-hover-tip';
    tip.style.cssText = 'position:fixed;pointer-events:none;z-index:99999;background:#111;border:1px solid rgba(255,255,255,.12);border-radius:7px;padding:.35rem .65rem;font-family:Inter,sans-serif;font-size:.72rem;color:#fff;white-space:nowrap;opacity:0;transition:opacity .1s;box-shadow:0 4px 16px rgba(0,0,0,.5)';
    document.body.appendChild(tip);
  }

  canvasEl._hoverHandler = (e) => {
    const data = _buildChartPoints(canvasEl, metric);
    if (!data) return;
    const { pts } = data;
    const rect = canvasEl.getBoundingClientRect();
    // Support both mouse and touch
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const mx = clientX - rect.left;

    // Check if touch/mouse is actually inside the canvas bounds
    const my = clientY - rect.top;
    if (mx < 0 || mx > rect.width || my < 0 || my > rect.height) {
      tip.style.opacity = '0'; return;
    }

    let closest = pts[0], minDist = Infinity;
    for (const p of pts) {
      const d = Math.abs(p.x - mx);
      if (d < minDist) { minDist = d; closest = p; }
    }
    if (minDist > 25) { tip.style.opacity = '0'; return; }

    const accent = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#3498ec';
    const day    = `Mar ${parseInt(closest.date.slice(3))}`;
    const label  = metric === 'stranded' ? 'people' : 'flights';
    tip.innerHTML = `<span style="color:rgba(255,255,255,.45);font-size:.65rem">${day}</span><br><span style="color:${accent};font-weight:800;font-size:.85rem">${closest.val.toLocaleString()}</span> <span style="color:rgba(255,255,255,.4);font-size:.65rem">${label}</span>`;
    tip.style.opacity = '1';

    const tipW = tip.offsetWidth || 100;
    const tipH = tip.offsetHeight || 48;
    let tx = clientX - tipW / 2;
    let ty = clientY - tipH - 12;
    if (tx < 4) tx = 4;
    if (tx + tipW > window.innerWidth - 4) tx = window.innerWidth - tipW - 4;
    if (ty < 4) ty = clientY + 16;
    tip.style.left = tx + 'px';
    tip.style.top  = ty + 'px';

    // Restore snapshot (no canvas.width reset — no reflow)
    const ctx = canvasEl.getContext('2d');
    ctx.putImageData(snapshot, 0, 0);

    // Draw crosshair overlay
    const h = canvasEl._cachedH || 64;
    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.strokeStyle = 'rgba(255,255,255,.18)';
    ctx.lineWidth   = 1;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(closest.x, 2);
    ctx.lineTo(closest.x, h - 2);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.arc(closest.x, closest.y, 5, 0, Math.PI * 2);
    ctx.fillStyle   = accent;
    ctx.fill();
    ctx.strokeStyle = '#000';
    ctx.lineWidth   = 1.5;
    ctx.stroke();
    ctx.restore();
  };

  canvasEl._leaveHandler = () => {
    tip.style.opacity = '0';
    // Restore clean snapshot on leave too
    canvasEl.getContext('2d').putImageData(snapshot, 0, 0);
  };

  canvasEl._touchActive = false;

  canvasEl._touchStartHandler = (e) => {
    const rect = canvasEl.getBoundingClientRect();
    const t = e.touches[0];
    const mx = t.clientX - rect.left;
    const my = t.clientY - rect.top;
    if (mx >= 0 && mx <= rect.width && my >= 0 && my <= rect.height) {
      canvasEl._touchActive = true;
      canvasEl._hoverHandler(e);
    }
  };

  canvasEl._touchMoveHandler = (e) => {
    if (!canvasEl._touchActive) return;
    e.preventDefault(); // prevent sheet scroll while dragging on chart
    canvasEl._hoverHandler(e);
  };

  canvasEl._touchEndHandler = () => {
    canvasEl._touchActive = false;
    canvasEl._leaveHandler();
  };

  canvasEl.addEventListener('mousemove', canvasEl._hoverHandler);
  canvasEl.addEventListener('mouseleave', canvasEl._leaveHandler);
  canvasEl.addEventListener('touchstart', canvasEl._touchStartHandler, { passive: false });
  canvasEl.addEventListener('touchmove', canvasEl._touchMoveHandler, { passive: false });
  canvasEl.addEventListener('touchend', canvasEl._touchEndHandler);
}


function renderMobileNations() {
  const el = document.getElementById('m-nations-list');
  if (!el || !window._countryImpact || !window._countryImpact.length) return;

  const top = window._countryImpact.slice(0, 15);
  const maxStranded = top[0]?.stranded || 1;

  el.innerHTML = top.map(c => {
    const pct  = Math.round((c.stranded / maxStranded) * 100);
    const flag = c.code.toUpperCase().replace(/./g, ch =>
      String.fromCodePoint(0x1F1E6 - 65 + ch.charCodeAt(0))
    );
    return `
      <div style="padding:.45rem 1.1rem;border-bottom:1px solid rgba(255,255,255,.04)">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:.25rem">
          <span style="font-weight:600;color:#fff;font-size:.78rem">${flag} ${c.name}</span>
          <span style="color:var(--accent);font-weight:700;font-size:.75rem;white-space:nowrap;margin-left:.5rem">${c.stranded.toLocaleString()}</span>
        </div>
        <div style="height:2px;background:rgba(255,255,255,.07);border-radius:2px;overflow:hidden">
          <div style="width:${pct}%;height:100%;background:var(--accent);border-radius:2px"></div>
        </div>
      </div>`;
  }).join('');
}

function renderNationsPanel() {
  if (typeof renderTimelineChart === 'function') renderTimelineChart();
  const el = document.getElementById('fp-nations-list');
  if (!el || !window._countryImpact || !window._countryImpact.length) return;

  const top = window._countryImpact.slice(0, 25);
  const maxStranded = top[0]?.stranded || 1;

  el.innerHTML = top.map((c, i) => {
    const pct = Math.round((c.stranded / maxStranded) * 100);
    const flag = c.code.toUpperCase().replace(/./g, ch =>
      String.fromCodePoint(0x1F1E6 - 65 + ch.charCodeAt(0))
    );
    return `
      <div style="padding:.55rem 1rem;border-bottom:1px solid rgba(255,255,255,.05);cursor:default">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:.3rem">
          <span style="font-weight:600;color:#fff;font-size:.8rem">${flag} ${c.name}</span>
          <span style="color:var(--accent);font-weight:700;font-size:.78rem;white-space:nowrap;margin-left:.5rem">${c.stranded.toLocaleString()}</span>
        </div>
        <div style="display:flex;align-items:center;gap:.5rem">
          <div style="flex:1;height:3px;background:rgba(255,255,255,.08);border-radius:2px;overflow:hidden">
            <div style="width:${pct}%;height:100%;background:var(--accent);border-radius:2px;transition:width .4s"></div>
          </div>
          <span style="font-size:.68rem;color:rgba(255,255,255,.35);white-space:nowrap">${c.cancelled.toLocaleString()} flights · ${c.airports} airport${c.airports !== 1 ? 's' : ''}</span>
        </div>
      </div>`;
  }).join('');
}

function toggleFpSection(head) {
  const body = head.nextElementSibling;
  if (body) body.classList.toggle('open');
}

function getFilterState() {
  // IMPORTANT: Both fp- (desktop) and mfp- (mobile) elements exist in the DOM at all times
  // (one is just CSS-hidden). We must read the ACTIVE set first — otherwise ?? never falls
  // through since a hidden checkbox still returns true/false, not null.
  const mob = isMob();
  const P = mob ? 'mfp' : 'fp';   // primary prefix
  const S = mob ? 'fp'  : 'mfp';  // secondary prefix (fallback)

  function val(id) { const el = document.getElementById(id); return el ? (el.type === 'checkbox' ? el.checked : el.value) : null; }
  function v(key) { return val(P + '-' + key) ?? val(S + '-' + key); }
  function checked(containerId) { return [...document.querySelectorAll('#' + containerId + ' input:checked')].map(c => c.value); }
  function chk(key) {
    const pArr = checked(P + '-' + key);
    return pArr.length ? pArr : checked(S + '-' + key);
  }

  const showOffers      = v('show-offers')    ?? true;
  const offersVerified  = v('offers-verified') ?? false;
  const offerTypes      = chk('offer-type');
  const showStranded    = v('show-stranded')   ?? true;
  const strandedVerified = v('stranded-verified') ?? false;
  const nationality     = v('nationality')     || '';
  const strandedNeeds   = chk('stranded-needs');
  const groupSize       = v('group-size')      || '';
  const showWorldwide   = v('show-worldwide')  ?? true;
  const showArcs        = v('worldwide-arcs')  ?? false;
  const showSuccess     = v('show-success')    ?? true;
  const showSuccessArcs = v('show-success-arcs') ?? true;
  const showHome        = v('show-home')       ?? true;

  const showPets        = v('show-pets')       ?? true;
  const petStatus       = v('pet-status')      || '';

  const destCountry = val(P + '-filter-dest-country') || val(S + '-filter-dest-country') || '';
  const destAirport = val(P + '-filter-dest-airport') || val(S + '-filter-dest-airport') || '';
  const atIata = _filterAtIata || val(P + '-at-iata') || val(S + '-at-iata') || '';
  const toIata = _filterToIata || val(P + '-to-iata') || val(S + '-to-iata') || '';

  return { showOffers, offersVerified, offerTypes, showStranded, strandedVerified, nationality, strandedNeeds, groupSize, showWorldwide, destCountry, destAirport, showArcs, atIata, toIata, showSuccess, showSuccessArcs, showHome, showPets, petStatus };
}

function applyFilters() {
  const f = getFilterState();
  syncFilterPanels();

  // ── Merge threshold: when People Impacted is on + zoomed out, hide individual
  //    clusters so impacted bubbles are the single source of truth ──────────────
  const MERGE_ZOOM = 7;
  const pcZoom  = window._crisisMap  ? window._crisisMap.getZoom()  : 99;
  const mobZoom = window._mobileMap  ? window._mobileMap.getZoom()  : 99;
  const pcMerge  = f.showWorldwide && pcZoom  < MERGE_ZOOM;
  const mobMerge = f.showWorldwide && mobZoom < MERGE_ZOOM;

  // ── Filter & re-render help posts (offers) ──
  const filteredPosts = posts.filter(p => {
    if (p.type !== 'offer') return false;
    if (!f.showOffers) return false;
    if (f.offersVerified && !p.user_id) return false;
    if (f.offerTypes.length && !f.offerTypes.includes(p.post_type)) return false;
    return true;
  });
  renderFilteredPosts(window._crisisMap,  _helpCluster,  pcMerge  ? [] : filteredPosts);
  renderFilteredPosts(window._mobileMap, _mHelpCluster, mobMerge ? [] : filteredPosts);

  // ── Filter & re-render stranded people ──
  const filteredStranded = _strandedPeople.filter(p => {
    if (!f.showStranded) return false;
    if (f.strandedVerified && !p.user_id) return false;
    if (f.nationality && p.nationality !== f.nationality) return false;
    if (f.strandedNeeds.length) {
      const pNeeds = p.needs || [];
      if (!f.strandedNeeds.some(n => pNeeds.includes(n))) return false;
    }
    if (f.groupSize) {
      const gs = p.group_size || 1;
      if (f.groupSize === '1' && gs !== 1) return false;
      if (f.groupSize === '2-5' && (gs < 2 || gs > 5)) return false;
      if (f.groupSize === '6+' && gs < 6) return false;
    }
    if (f.destCountry && p.dest_country !== f.destCountry) return false;
    if (f.destAirport && p.dest_airport !== f.destAirport) return false;
    return true;
  });
  renderFilteredStranded(window._crisisMap, false, pcMerge  ? [] : filteredStranded);
  renderFilteredStranded(window._mobileMap, true,  mobMerge ? [] : filteredStranded);

  // ── Arc lines (only when dest filter active) ──
  clearArcLines();
  if (f.destCountry || f.destAirport) {
    drawArcLines(window._crisisMap, filteredStranded);
    drawArcLines(window._mobileMap, filteredStranded);
  }

  // ── Success stories — pins, arcs, home pins ──
  [
    { layer: '_successLayer',  map: window._crisisMap,  show: f.showSuccess && !pcMerge },
    { layer: '_mSuccessLayer', map: window._mobileMap,  show: f.showSuccess && !mobMerge },
    { layer: '_arcLayer',      map: window._crisisMap,  show: f.showSuccessArcs && !pcMerge },
    { layer: '_mArcLayer',     map: window._mobileMap,  show: f.showSuccessArcs && !mobMerge },
  ].forEach(({ layer, map, show }) => {
    if (!map || !window[layer]) return;
    show ? window[layer].addTo(map) : map.removeLayer(window[layer]);
  });
  // "Made it home" pins — re-render when showHome changes, suppress when merged
  if (!f.showHome || !f.showSuccess || pcMerge) {
    renderSuccessOnMap(window._crisisMap, f.showHome && f.showSuccess && !pcMerge);
  }
  if (!f.showHome || !f.showSuccess || mobMerge) {
    renderSuccessOnMap(window._mobileMap, f.showHome && f.showSuccess && !mobMerge);
  }

  // ── Worldwide markers ──
  if (_mk.worldwide) {
    _mk.worldwide.forEach(m => {
      [window._crisisMap, window._mobileMap].forEach(map => {
        if (!map) return;
        f.showWorldwide ? m.addTo(map) : map.removeLayer(m);
      });
    });
  }
  
  // ── Global disruption dots — dual filter (both can be active) ──
  clearGlobalArcs();
  _globalPins.forEach(m => {
    [window._crisisMap, window._mobileMap].forEach(map => { if (map) try { map.removeLayer(m); } catch(e) {} });
  });
  _globalPins = [];
  
  let filteredGlobal = [];
  let reverseData = [];
  const hasAt = !!f.atIata;
  const hasTo = !!f.toIata;

  if (f.showWorldwide) {
    // ── "Stranded at" layer ──
    if (hasAt) {
      filteredGlobal = _globalDisruptions.filter(g => g.iata === f.atIata);
    } else if (!hasTo) {
      filteredGlobal = _globalDisruptions;
    }
    if (filteredGlobal.length) {
      renderGlobalDisruptions(window._crisisMap, filteredGlobal);
      renderGlobalDisruptions(window._mobileMap, filteredGlobal);
      if (f.showArcs || hasAt) {
        drawGlobalRouteArcs(window._crisisMap, filteredGlobal);
        drawGlobalRouteArcs(window._mobileMap, filteredGlobal);
        drawMERouteArcs(window._crisisMap);
        drawMERouteArcs(window._mobileMap);
      }
    }

    // ── "Heading to" layer ──
    if (hasTo) {
      reverseData = _computeReverseCached(f.toIata);
      const destAp = typeof findAirport === 'function' ? findAirport(f.toIata) : null;
      const destCity = destAp?.city || f.toIata;
      const totalRevStranded = reverseData.reduce((s,r) => s + r.stranded, 0);
      const totalRevCancelled = reverseData.reduce((s,r) => s + r.cancelled, 0);
      const allAirlines = [...new Set(reverseData.flatMap(r => r.airlines))];

      [window._crisisMap, window._mobileMap].forEach(map => {
        if (!map) return;
        for (const r of reverseData) {
          const rc = r.cancelled || 0;
          let rdot;
          if (rc >= 5000) rdot = 18; else if (rc >= 1000) rdot = 14; else if (rc >= 500) rdot = 11; else if (rc >= 200) rdot = 8; else rdot = 5;
          const circle = L.circleMarker([r.lat, r.lng], {
            radius: rdot, fillColor: accentHex(), color: ''+accentRgba(.4)+'', weight: 1.5, fillOpacity: 0.45,
          }).addTo(map);
          circle.bindPopup('<div style="min-width:200px;font-family:Inter,sans-serif"><div style="font-size:.6rem;font-weight:700;text-transform:uppercase;color:'+accentHex()+';margin-bottom:.3rem">TRYING TO REACH '+destCity.toUpperCase()+'</div><div style="font-size:.88rem;font-weight:800;color:#fff;margin-bottom:.15rem">'+r.city+' ('+r.iata+')</div><div style="display:grid;grid-template-columns:1fr 1fr;gap:.3rem .8rem;margin-bottom:.4rem;margin-top:.4rem"><div><div style="font-size:1.1rem;font-weight:800;color:'+accentHex()+'">'+r.cancelled.toLocaleString()+'</div><div style="font-size:.55rem;color:rgba(255,255,255,.4);text-transform:uppercase">Flights Cancelled</div></div><div><div style="font-size:1.1rem;font-weight:800;color:'+accentHex()+'">'+r.stranded.toLocaleString()+'</div><div style="font-size:.55rem;color:rgba(255,255,255,.4);text-transform:uppercase">Pax Stranded</div></div></div><div style="display:flex;flex-wrap:wrap;gap:3px">'+r.airlines.map(a => '<span style="padding:.15rem .4rem;background:'+accentRgba(.12)+';border-radius:4px;font-size:.6rem;color:'+accentHex()+';font-weight:600">'+a+'</span>').join('')+'</div></div>', { className: 'dark-popup', maxWidth: 300 });
          _globalPins.push(circle);
        }

        // Destination dot with popup
        if (destAp) {
          const destDot = L.circleMarker([destAp.lat, destAp.lng], {
            radius: 8, fillColor: accentHex(), color: '#fff', weight: 2.5, fillOpacity: 0.9,
          }).addTo(map);
          destDot.bindPopup('<div style="min-width:240px;font-family:Inter,sans-serif"><div style="font-size:.6rem;font-weight:700;text-transform:uppercase;color:'+accentHex()+';margin-bottom:.3rem">DESTINATION</div><div style="font-size:.95rem;font-weight:800;color:#fff;margin-bottom:.25rem">'+destCity+' ('+f.toIata+')</div><div style="font-size:.72rem;color:rgba(255,255,255,.5);margin-bottom:.6rem">'+(destAp.countryName||destAp.country||'')+'</div><div style="display:grid;grid-template-columns:1fr 1fr;gap:.3rem .8rem;margin-bottom:.6rem"><div><div style="font-size:1.3rem;font-weight:800;color:'+accentHex()+';line-height:1">'+totalRevStranded.toLocaleString()+'</div><div style="font-size:.55rem;color:rgba(255,255,255,.4);text-transform:uppercase;margin-top:.15rem">People Trying to Reach Here</div></div><div><div style="font-size:1.3rem;font-weight:800;color:'+accentHex()+';line-height:1">'+totalRevCancelled.toLocaleString()+'</div><div style="font-size:.55rem;color:rgba(255,255,255,.4);text-transform:uppercase;margin-top:.15rem">Inbound Flights Cancelled</div></div></div><div style="font-size:.72rem;color:rgba(255,255,255,.55);line-height:1.5;margin-bottom:.5rem">'+totalRevStranded.toLocaleString()+' passengers across '+reverseData.length+' Middle East airports are stranded and unable to fly home to '+destCity+'.</div><div style="font-size:.6rem;font-weight:700;text-transform:uppercase;color:rgba(255,255,255,.25);margin-bottom:.3rem">Affected Airlines</div><div style="display:flex;flex-wrap:wrap;gap:3px">'+allAirlines.map(a => '<span style="padding:.15rem .4rem;background:'+accentRgba(.12)+';border-radius:4px;font-size:.6rem;color:'+accentHex()+';font-weight:600">'+a+'</span>').join('')+'</div><div style="font-size:.6rem;font-weight:700;text-transform:uppercase;color:rgba(255,255,255,.25);margin-top:.5rem;margin-bottom:.3rem">They\u2019re stuck at</div>'+reverseData.slice(0,6).map(r => '<div style="display:flex;justify-content:space-between;padding:.2rem 0;border-bottom:1px solid rgba(255,255,255,.04);font-size:.68rem"><span style="color:rgba(255,255,255,.6)">'+r.city+' ('+r.iata+')</span><span style="color:'+accentHex()+';font-weight:700">'+r.stranded.toLocaleString()+'</span></div>').join('')+'</div>'+'</div>', { className: 'dark-popup', maxWidth: 320 });
          _globalPins.push(destDot);
        }
      });

      // Arcs from ME hubs to destination
      if (f.showArcs || hasTo) {
        if (destAp) {
          for (const r of reverseData) {
            const rc = r.cancelled || 0;
            let wt, op;
            if (rc >= 5000) { wt = 4; op = 0.35; } else if (rc >= 1000) { wt = 3; op = 0.28; } else if (rc >= 500) { wt = 2.2; op = 0.22; } else if (rc >= 200) { wt = 1.5; op = 0.18; } else { wt = 0.7; op = 0.12; }
            const arc = generateArc([r.lat, r.lng], [destAp.lat, destAp.lng], 30);
            [window._crisisMap, window._mobileMap].forEach(map => {
              if (!map) return;
              const line = L.polyline(arc, { color: accentRgba(op), weight: wt, interactive: false }).addTo(map);
              _globalArcLines.push(line);
            });
          }
        }
      }
    }
  }
  
  // ── Filter & re-render pets ──
  const filteredPets = _petPosts.filter(p => {
    if (!f.showPets) return false;
    if (f.petStatus && p.pet_status !== f.petStatus) return false;
    return true;
  });
  renderFilteredPets(window._crisisMap, false, pcMerge  ? [] : filteredPets);
  renderFilteredPets(window._mobileMap, true,  mobMerge ? [] : filteredPets);

  // ── Update Est. Stranded label ──
  updateStrandedLabel(f.atIata, f.toIata, filteredGlobal, reverseData);

  // Country markers always visible
  if (_mk.country) {
    _mk.country.forEach(({marker}) => {
      [window._crisisMap, window._mobileMap].forEach(map => { if (map) marker.addTo(map); });
    });
  }
}

function renderFilteredPosts(map, cluster, filteredPosts) {
  if (!map || !cluster) return;
  const isMobile = (map === window._mobileMap);
  cluster.clearLayers();
  for (const p of filteredPosts) {
    if (!p.lat || !p.lng) continue;
    const fStory = _successByOffer[p.id];
    const fMatched = !!fStory;
    const fDotType = fMatched ? 'success' : 'offer';
    const fDotLabel = fMatched ? 'story' : 'room';
    const _fd = buildUserDot(fDotType, 1, fDotLabel, 50);
    const helpIcon = L.divIcon({
      className:'',
      html: _fd.html,
      iconSize:[_fd.sz,_fd.sz],iconAnchor:[_fd.sz/2,_fd.sz/2]
    });
    const popupHtml = `<div style="font-family:Inter,sans-serif">
        <div style="font-size:.62rem;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#93c5fd;margin-bottom:.25rem">SPARE ROOM</div>
        <div style="font-weight:600;font-size:.95rem;margin-bottom:.2rem;color:#fff">${esc(p.name)} ${buildBadge(!!p.user_id)}</div>
        <div style="font-size:.82rem;color:rgba(255,255,255,.75);line-height:1.55;margin-bottom:.4rem">${esc(p.body)||''}</div>
        <div style="font-size:.72rem;color:rgba(255,255,255,.4);margin-bottom:.4rem">📍 ${esc(p.location)}</div>
        ${buildContactButtons(p.contact, p.xhandle, p.name)}
        ${buildTipButton(p.xhandle, !!p.user_id)}
        ${buildFlagButton('help_posts', p.id)}
      </div>`;
    const m = L.marker([p.lat, p.lng], {icon: helpIcon});
    if (isMobile) {
      m.on('click', function(e) { L.DomEvent.stopPropagation(e); openMPinSheet(popupHtml); });
    } else {
      (function(post) {
        m.on('click', function(e) { L.DomEvent.stopPropagation(e); closePostSidebar(); openPostSidebar(post, 'offer'); });
      })(p);
    }
    cluster.addLayer(m);
  }
}

function renderFilteredStranded(map, isMobile, filteredData) {
  if (!map) return;
  const clusterRef = isMobile ? _mStrandedCluster : _strandedCluster;
  if (clusterRef) map.removeLayer(clusterRef);

  const cluster = L.markerClusterGroup({
    maxClusterRadius: 60, spiderfyOnMaxZoom: true, showCoverageOnHover: false, zoomToBoundsOnClick: true,
    iconCreateFunction: function(c) {
      const total = c.getAllChildMarkers().reduce((sum, m) => sum + (m.options.groupSize || 1), 0);
      const d = buildUserDot('stranded', total, 'stranded', 50);
      return L.divIcon({ html: d.html, className: '', iconSize: [d.sz, d.sz], iconAnchor: [d.sz/2, d.sz/2] });
    }
  });

  for (const p of filteredData) {
    if (!p.current_lat || !p.current_lng) continue;
    const age = timeAgo(p.created_at);
    const needsList = (p.needs || []).map(n => NEED_LABELS[n] || n).join(', ');
    const sinceTxt = p.stranded_since ? 'Since ' + new Date(p.stranded_since).toLocaleDateString() : '';
    const fStory = _successByStranded[p.id];
    const fMatched = !!fStory;
    const fHome = fMatched && fStory?.home_lat;
    const fDotType = fMatched ? 'success' : 'stranded';
    const fDotLabel = fHome ? 'home' : fMatched ? 'story' : 'stranded';
    const _sd = buildUserDot(fDotType, p.group_size || 1, fDotLabel, 50);
    const icon = L.divIcon({ className: '', html: _sd.html, iconSize: [_sd.sz, _sd.sz], iconAnchor: [_sd.sz/2, _sd.sz/2] });
    const marker = L.marker([p.current_lat, p.current_lng], { icon, groupSize: p.group_size || 1 });
    const popupHtml = `
      <div style="font-family:Inter,sans-serif">
        <div style="font-size:.6rem;font-weight:700;text-transform:uppercase;color:#ec3452;margin-bottom:.3rem">STRANDED · ${age}</div>
        ${p.name ? '<div style="font-size:.95rem;font-weight:800;color:#fff;margin-bottom:.15rem">'+esc(p.name)+'</div>' : ''}
        <div style="font-size:.82rem;font-weight:600;color:rgba(255,255,255,.7);margin-bottom:.2rem">${p.group_size > 1 ? p.group_size + ' people' : '1 person'}${p.nationality ? ' · ' + p.nationality : ''}</div>
        <div style="font-size:.78rem;color:rgba(255,255,255,.6);margin-bottom:.15rem">From: ${esc(p.current_location)}</div>
        <div style="font-size:.78rem;color:rgba(255,255,255,.6);margin-bottom:.35rem">Need to reach: <strong style="color:#fff">${esc(p.destination)}</strong>${p.dest_airport ? ' <span style="background:rgba(255,255,255,.1);padding:.1rem .4rem;border-radius:4px;font-size:.65rem;font-weight:600">✈ '+p.dest_airport+'</span>' : ''}</div>
        ${needsList ? '<div style="font-size:.72rem;color:#e67e22;margin-bottom:.25rem">Needs: '+needsList+'</div>' : ''}
        ${sinceTxt ? '<div style="font-size:.68rem;color:rgba(255,255,255,.35);margin-bottom:.25rem">'+sinceTxt+'</div>' : ''}
        ${p.details ? '<div style="font-size:.78rem;color:rgba(255,255,255,.5);line-height:1.45;margin-top:.35rem">'+esc(p.details)+'</div>' : ''}
        ${buildContactButtons(p.contact, p.xhandle, p.name)}
        ${buildSendHelpButton(p.xhandle, !!p.user_id)}
        ${buildFlagButton('stranded_people', p.id)}
      </div>
    `;
    if (isMobile) {
      marker.on('click', function(e) { L.DomEvent.stopPropagation(e); openMPinSheet(popupHtml); });
    } else {
      (function(post) {
        marker.on('click', function(e) { L.DomEvent.stopPropagation(e); closePostSidebar(); openPostSidebar(post, 'stranded'); });
      })(p);
    }
    cluster.addLayer(marker);
  }

  map.addLayer(cluster);
  if (isMobile) _mStrandedCluster = cluster;
  else _strandedCluster = cluster;
}

function syncFilterPanels() {
  const isMobile = window.innerWidth <= 768;
  const pairs = [
    ['fp-show-offers','mfp-show-offers'],['fp-offers-verified','mfp-offers-verified'],
    ['fp-show-stranded','mfp-show-stranded'],['fp-stranded-verified','mfp-stranded-verified'],
    ['fp-show-worldwide','mfp-show-worldwide'],['fp-worldwide-arcs','mfp-worldwide-arcs'],
    ['fp-show-pets','mfp-show-pets'],
  ];
  pairs.forEach(([d,m]) => {
    const src = document.getElementById(isMobile ? m : d);
    const dst = document.getElementById(isMobile ? d : m);
    if (src && dst) dst.checked = src.checked;
  });
  [['fp-nationality','mfp-nationality'],['fp-group-size','mfp-group-size'],['fp-at-search','mfp-at-search'],['fp-at-iata','mfp-at-iata'],['fp-to-search','mfp-to-search'],['fp-to-iata','mfp-to-iata'],['fp-pet-status','mfp-pet-status']].forEach(([d,m]) => {
    const src = document.getElementById(isMobile ? m : d);
    const dst = document.getElementById(isMobile ? d : m);
    if (src && dst) dst.value = src.value;
  });
  // Sync chip checkboxes
  [['fp-offer-type','mfp-offer-type'],['fp-stranded-needs','mfp-stranded-needs']].forEach(([d,m]) => {
    const srcId = isMobile ? m : d, dstId = isMobile ? d : m;
    const srcChecked = [...document.querySelectorAll('#'+srcId+' input:checked')].map(c=>c.value);
    document.querySelectorAll('#'+dstId+' input').forEach(c => c.checked = srcChecked.includes(c.value));
  });
}

function toggleArcsFromStat() {
  showView('map');
  // Toggle the entire DISRUPTED GLOBALLY set — dots + arcs together
  const pcWW  = document.getElementById('fp-show-worldwide');
  const mWW   = document.getElementById('mfp-show-worldwide');
  const pcArc = document.getElementById('fp-worldwide-arcs');
  const mArc  = document.getElementById('mfp-worldwide-arcs');
  const newState = pcWW ? !pcWW.checked : true;
  if (pcWW)  pcWW.checked  = newState;
  if (mWW)   mWW.checked   = newState;
  if (pcArc) pcArc.checked = newState;
  if (mArc)  mArc.checked  = newState;
  applyFilters();
}

function updateFilterBadges() {
  function setBadge(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = val || '';
  }
  function fmt(n) {
    if (!n && n !== 0) return '';
    if (n >= 1000000) return (n / 1000000).toFixed(n >= 10000000 ? 0 : 1) + 'M';
    if (n >= 1000) return Math.round(n / 1000) + 'k';
    return n.toString();
  }
  // People impacted — use canonical stranded figure, shortened to M/k
  const impacted = window._canonicalStranded || 0;
  const impactedLabel = fmt(impacted);
  setBadge('fp-badge-impacted', impactedLabel);
  setBadge('mfp-badge-impacted', impactedLabel);

  // Spare rooms
  const roomCount = (typeof posts !== 'undefined') ? posts.filter(p => p.type === 'offer').length : 0;
  setBadge('fp-badge-rooms', roomCount || '');
  setBadge('mfp-badge-rooms', roomCount || '');

  // People stranded (registered)
  const strandedCount = _strandedPeople ? _strandedPeople.length : 0;
  setBadge('fp-badge-stranded', strandedCount || '');
  setBadge('mfp-badge-stranded', strandedCount || '');

  // Success stories
  const successCount = _successStories ? _successStories.length : 0;
  setBadge('fp-badge-success', successCount || '');
  setBadge('mfp-badge-success', successCount || '');

  // Stranded pets
  const petCount = _petPosts ? _petPosts.length : 0;
  setBadge('pet-count-badge', petCount || '');
  setBadge('m-pet-count-badge', petCount || '');

  // Most impacted nations
  const nationsCount = window._countryImpact ? window._countryImpact.length : 0;
  setBadge('fp-badge-nations', nationsCount || '');
}

function clearAllFilters() {
  _mapFilterActive = '';
  clearGlobalFilter();
  document.querySelectorAll('.fp-chip input').forEach(cb => cb.checked = false);
  document.querySelectorAll('[id$="-show-offers"],[id$="-show-stranded"],[id$="-show-worldwide"],[id$="-show-pets"]').forEach(cb => cb.checked = true);
  document.querySelectorAll('[id$="-offers-verified"],[id$="-stranded-verified"]').forEach(cb => cb.checked = false);
  document.querySelectorAll('[id$="-worldwide-arcs"]').forEach(cb => cb.checked = false);
  document.querySelectorAll('.fp-select').forEach(s => { if (s.tagName === 'SELECT') s.value = ''; else if (s.type === 'text') s.value = ''; });
  document.querySelectorAll('[id$="filter-dest-country"],[id$="filter-dest-airport"]').forEach(h => h.value = '');
  document.querySelectorAll('.sitrep-stat,.m-stat').forEach(s => s.classList.remove('active-filter'));
  clearArcLines();
  clearGlobalArcs();
  updateStrandedLabel('', []);
  applyFilters();
}

// ── UPDATE EST. STRANDED LABEL ──────────────────────────
function updateStrandedLabel(atIata, toIata, filteredGlobal, reverseData) {
  const pcLabel = document.getElementById('stranded-label');
  const pcSub = document.getElementById('stranded-sub');
  const mLabel = document.getElementById('m-stranded-label');
  
  const hasAt = atIata && filteredGlobal?.length;
  const hasTo = toIata && reverseData?.length;
  
  if (hasAt && hasTo) {
    // Both filters active — combined view
    const atAp = typeof findAirport === 'function' ? findAirport(atIata) : null;
    const toAp = typeof findAirport === 'function' ? findAirport(toIata) : null;
    const atCity = atAp?.city || atIata;
    const toCity = toAp?.city || toIata;
    const atNum = filteredGlobal[0]?.stranded || 0;
    const toNum = reverseData.reduce((s, r) => s + r.stranded, 0);
    const combined = atNum + toNum;
    
    ['stat-stranded', 'm-stat-stranded'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.textContent = combined.toLocaleString();
    });
    if (pcLabel) pcLabel.textContent = atCity + ' \u2194 ' + toCity;
    if (pcSub) pcSub.textContent = atIata + ' \u2192 ' + toIata + ' \u00b7 ' + atNum.toLocaleString() + ' + ' + toNum.toLocaleString();
    if (mLabel) mLabel.innerHTML = atIata + ' \u2194 ' + toIata;
  } else if (hasTo) {
    const totalStranded = reverseData.reduce((s, r) => s + r.stranded, 0);
    const totalAirlines = new Set(reverseData.flatMap(r => r.airlines)).size;
    const ap = typeof findAirport === 'function' ? findAirport(toIata) : null;
    const city = ap?.city || toIata;
    
    ['stat-stranded', 'm-stat-stranded'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.textContent = totalStranded.toLocaleString();
    });
    if (pcLabel) pcLabel.textContent = 'Heading to ' + city;
    if (pcSub) pcSub.textContent = reverseData.length + ' ME hubs \u00b7 ' + totalAirlines + ' airlines';
    if (mLabel) mLabel.innerHTML = 'TO ' + city.toUpperCase() + '<br>' + toIata;
  } else if (hasAt) {
    const g = filteredGlobal[0];
    const ap = typeof findAirport === 'function' ? findAirport(atIata) : null;
    const city = ap?.city || atIata;
    
    ['stat-stranded', 'm-stat-stranded'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.textContent = (g.stranded || 0).toLocaleString();
    });
    if (pcLabel) pcLabel.textContent = 'Stranded at ' + city;
    if (pcSub) pcSub.textContent = atIata + ' \u00b7 ' + (g.airlines||[]).length + ' airlines';
    if (mLabel) mLabel.innerHTML = 'AT ' + city.toUpperCase() + '<br>' + atIata;
  } else {
    if (pcLabel) pcLabel.innerHTML = 'People Impacted <span style="font-size:.55rem;color:var(--accent);font-weight:700;letter-spacing:.01em">since Mar 1</span>';
    // Restore +today into the sub — read cached value from the today span if present
    if (pcSub) {
      const todayEl = document.getElementById('stat-stranded-today');
      const todayVal = todayEl ? todayEl.textContent : '';
      pcSub.innerHTML = todayVal
        ? `<span id="stat-stranded-today" style="color:'+accentHex()+';font-weight:700">${todayVal}</span><span id="stat-stranded-today-label">\u00a0today</span>`
        : `<span id="stat-stranded-today" style="color:'+accentHex()+';font-weight:700"></span><span id="stat-stranded-today-label">tap \u00b7 see how</span>`;
    }
    if (mLabel) mLabel.innerHTML = 'PEOPLE IMPACTED <span style="font-size:.52rem;color:var(--accent);font-weight:700;letter-spacing:.01em">· SINCE MAR 1</span>';
    refreshStrandedCount();
  }
}

function refreshStrandedCount() {
  // Use canonical pipeline value — computeTotalStranded() adds global airports
  // and produces inflated numbers (56m+). We only want ME-hub totals here.
  const total = window._canonicalStranded != null
    ? window._canonicalStranded
    : computeTotalStranded();
  ['stat-stranded', 'm-stat-stranded'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = total.toLocaleString();
  });
}

// ── ARC LINES (stranded → destination) ──
let _arcLines = [];
let _globalArcLines = [];
let _meArcLines = [];
let _filterAtIata = '';  // "Stranded at" filter
let _filterToIata = '';  // "Heading to" filter

function clearArcLines() {
  _arcLines.forEach(line => {
    [window._crisisMap, window._mobileMap].forEach(m => { if (m) try { m.removeLayer(line); } catch(e) {} });
  });
  _arcLines = [];
}

function clearGlobalArcs(keepClusters) {
  _globalArcLines.forEach(line => {
    [window._crisisMap, window._mobileMap].forEach(m => { if (m) try { m.removeLayer(line); } catch(e) {} });
  });
  _globalArcLines = [];
  // Clear zoom-label tracking so renderGlobalDisruptions rebuilds them fresh
  [window._crisisMap, window._mobileMap].forEach(function(m) { if (m) m._strandedLabels = []; });
  _meArcLines.forEach(line => {
    [window._crisisMap, window._mobileMap].forEach(m => { if (m) try { m.removeLayer(line); } catch(e) {} });
  });
  _meArcLines = [];
  // Remove global disruption cluster layers (skip when just toggling popup arcs)
  if (!keepClusters) {
    if (window._globalCluster && window._crisisMap)  { try { window._crisisMap.removeLayer(window._globalCluster);  } catch(e) {} window._globalCluster = null; }
    if (window._mGlobalCluster && window._mobileMap) { try { window._mobileMap.removeLayer(window._mGlobalCluster); } catch(e) {} window._mGlobalCluster = null; }
  }
}

// ── INTRA-ME ROUTE ARCS (orange/amber) ─────────────────
// Draws arcs between ME hub airports based on intra-ME route_daily data
function drawMERouteArcs(map) {
  if (!map || !window._meAllOutbound) return;
  const meIatas = new Set(AIRPORT_DATA.map(a => a.iata));

  for (const [dep, dests] of Object.entries(window._meAllOutbound)) {
    if (!meIatas.has(dep)) continue;
    const depAp = AIRPORT_DATA.find(a => a.iata === dep);
    if (!depAp) continue;
    const fromCoords = depAp.coords || [depAp.lat, depAp.lng];

    for (const dest of dests) {
      if (!meIatas.has(dest.iata)) continue; // intra-ME only
      const arrAp = AIRPORT_DATA.find(a => a.iata === dest.iata);
      if (!arrAp) continue;
      const toCoords = arrAp.coords || [arrAp.lat, arrAp.lng];

      const c = dest.cancelled || 0;
      let dw, do_;
      if (c >= 500)      { dw = 3.0; do_ = 0.5; }
      else if (c >= 200) { dw = 2.2; do_ = 0.4; }
      else if (c >= 50)  { dw = 1.5; do_ = 0.3; }
      else               { dw = 0.8; do_ = 0.2; }

      const arc = generateArc(fromCoords, toCoords, 30);
      const line = L.polyline(arc, {
        color: accentRgba(do_),
        weight: dw,
        interactive: false,
      }).addTo(map);
      _meArcLines.push(line);
    }
  }
}

function drawArcLines(map, strandedData) {
  if (!map) return;
  for (const p of strandedData) {
    if (!p.current_lat || !p.current_lng || !p.dest_lat || !p.dest_lng) continue;
    const from = [p.current_lat, p.current_lng];
    const to = [p.dest_lat, p.dest_lng];
    const arc = generateArc(from, to, 30);
    const line = L.polyline(arc, { color: 'rgba(236,52,82,.35)', weight: 1.2, dashArray: '4 6', interactive: false }).addTo(map);
    _arcLines.push(line);
    const dot = L.circleMarker(to, { radius: 3, fillColor: '#ec3452', color: '#fff', weight: 1, fillOpacity: .7, interactive: false }).addTo(map);
    _arcLines.push(dot);
  }
}

// ── GLOBAL ROUTE ARCS (purple) ─────────────────────────
// Draws arcs from global airports to their ME hub connections
function drawGlobalRouteArcs(map, disruptions) {
  if (!map || !disruptions.length) return;
  
  for (const g of disruptions) {
    const ap = typeof findAirport === 'function' ? findAirport(g.iata) : null;
    // For ME hubs, fall back to ME_AIRPORTS coords
    let fromCoords = ap ? [ap.lat, ap.lng] : null;
    if (!fromCoords && typeof ME_AIRPORTS !== 'undefined' && ME_AIRPORTS[g.iata]) {
      fromCoords = [ME_AIRPORTS[g.iata].lat, ME_AIRPORTS[g.iata].lng];
    }
    if (!fromCoords) continue;

    const c = g.cancelled || 0;
    let weight, opacity;
    if (c >= 5000)      { weight = 4.5; opacity = 0.4; }
    else if (c >= 1000) { weight = 3.5; opacity = 0.32; }
    else if (c >= 500)  { weight = 2.5; opacity = 0.25; }
    else if (c >= 200)  { weight = 1.8; opacity = 0.2; }
    else if (c >= 50)   { weight = 1.0; opacity = 0.15; }
    else                { weight = 0.5; opacity = 0.1; }

    if (g.isME) {
      // ME hub → draw arcs outward to top global destinations via _meOutbound
      const outbound = (window._meOutbound && window._meOutbound[g.iata]) || [];
      const topDests = outbound.slice(0, 12); // cap per hub
      for (const dest of topDests) {
        const dap = typeof findAirport === 'function' ? findAirport(dest.iata) : null;
        if (!dap) continue;
        const destC = dest.cancelled || 0;
        let dw, do_;
        if (destC >= 300)      { dw = 3.5; do_ = 0.35; }
        else if (destC >= 100) { dw = 2.5; do_ = 0.27; }
        else if (destC >= 30)  { dw = 1.5; do_ = 0.2; }
        else                   { dw = 0.8; do_ = 0.13; }
        const arc = generateArc(fromCoords, [dap.lat, dap.lng], 30);
        const line = L.polyline(arc, { color: accentRgba(do_), weight: dw, interactive: false }).addTo(map);
        _globalArcLines.push(line);
      }
    } else {
      // Global airport → draw arcs to each connected ME hub
      for (const hub of (g.me_hubs || [])) {
        let hubCoords = null;
        if (typeof ME_AIRPORTS !== 'undefined' && ME_AIRPORTS[hub]) {
          hubCoords = [ME_AIRPORTS[hub].lat, ME_AIRPORTS[hub].lng];
        } else {
          const ad = AIRPORT_DATA.find(a => (a.iata || a.code) === hub);
          if (ad) hubCoords = ad.coords || [ad.lat, ad.lng];
        }
        if (!hubCoords) continue;
        const arc = generateArc(fromCoords, hubCoords, 30);
        const line = L.polyline(arc, { color: accentRgba(opacity), weight, interactive: false }).addTo(map);
        _globalArcLines.push(line);
      }
    }
  }
}

// ── DUAL GLOBAL FILTER (Stranded at + Heading to) ─────
let _gacTimer = null;

function globalAirportAC(input, listId, dir) {
  clearTimeout(_gacTimer);
  const list = document.getElementById(listId);
  const q = input.value.trim().toLowerCase();
  if (q.length < 2) { list.classList.remove('open'); return; }
  
  _gacTimer = setTimeout(() => {
    let results = [];
    
    if (dir === 'at') {
      results = _globalDisruptions.filter(g => {
        const ap = typeof findAirport === 'function' ? findAirport(g.iata) : null;
        if (!ap) return false;
        return g.iata.toLowerCase().startsWith(q) || ap.city.toLowerCase().includes(q) || (ap.countryName || '').toLowerCase().startsWith(q);
      }).slice(0, 8).map(g => {
        const ap = findAirport(g.iata);
        return { iata: g.iata, city: ap?.city || '?', stranded: g.stranded || 0, label: 'stranded' };
      });
    } else {
      const all = typeof searchAirports === 'function' ? searchAirports(q, 8) : [];
      results = all.map(ap => {
        const rev = _computeReverseCached(ap.iata);
        const totalStranded = rev.reduce((s, r) => s + r.stranded, 0);
        return { iata: ap.iata, city: ap.city, stranded: totalStranded, label: 'trying to reach' };
      }).filter(r => r.stranded > 0);
    }
    
    if (!results.length) { list.classList.remove('open'); return; }
    list.innerHTML = results.map(r => 
      '<div class="loc-ac-item" onmousedown="pickGlobalAC(event,\'' + r.iata + '\',\'' + dir + '\',\'' + listId + '\')">' +
        '<strong>' + r.iata + '</strong> \u2014 ' + r.city + ' <small>' + r.stranded.toLocaleString() + ' ' + r.label + '</small></div>'
    ).join('');
    list.classList.add('open');
  }, 150);
  input.addEventListener('blur', () => setTimeout(() => list.classList.remove('open'), 200), { once: true });
}

function pickGlobalAC(e, iata, dir, listId) {
  e.preventDefault();
  document.getElementById(listId)?.classList.remove('open');
  const ap = typeof findAirport === 'function' ? findAirport(iata) : null;
  const label = ap ? iata + ' \u2014 ' + ap.city : iata;
  
  if (dir === 'at') {
    _filterAtIata = iata;
    ['fp-at-search','mfp-at-search'].forEach(id => { const el = document.getElementById(id); if (el) el.value = label; });
    ['fp-at-iata','mfp-at-iata'].forEach(id => { const el = document.getElementById(id); if (el) el.value = iata; });
  } else {
    _filterToIata = iata;
    ['fp-to-search','mfp-to-search'].forEach(id => { const el = document.getElementById(id); if (el) el.value = label; });
    ['fp-to-iata','mfp-to-iata'].forEach(id => { const el = document.getElementById(id); if (el) el.value = iata; });
  }
  applyFilters();
}

// Cache reverse computations
let _reverseCache = {};
function _computeReverseCached(destIata) {
  if (_reverseCache[destIata]) return _reverseCache[destIata];
  if (typeof computeReverseDisruptions !== 'function' || typeof ME_AIRPORTS === 'undefined') return [];
  const meStatuses = {};
  for (const a of AIRPORT_DATA) {
    const iata = a.iata || a.code;
    const cr = (a.cancelRate && a.cancelRate > 1) ? a.cancelRate / 100
      : a.status === 'CLOSED' ? 0.93
      : a.status === 'RESTRICTED' || a.status === 'LIMITED' ? 0.6
      : a.status === 'PARTIALLY OPEN' ? 0.3
      : 0.05;
    meStatuses[iata] = { cancelRate: cr };
  }
  for (const iata of Object.keys(ME_AIRPORTS)) {
    if (!meStatuses[iata]) {
      meStatuses[iata] = { cancelRate: ['IR','IQ','YE','SY'].includes(ME_AIRPORTS[iata].country) ? 0.85 : 0.3 };
    }
  }
  const raw = computeReverseDisruptions(destIata, meStatuses);
  const days = Math.max(1, Math.floor((Date.now() - new Date('2026-02-28').getTime()) / 86400000));
  const altRate = Math.min(0.3, days * 0.03);
  const result = raw.map(r => ({
    ...r,
    cancelled: Math.round(r.cancelled * days),
    stranded: Math.round(r.stranded * days * (1 - altRate)),
  }));
  _reverseCache[destIata] = result;
  return result;
}

function clearGlobalFilter() {
  _filterAtIata = '';
  _filterToIata = '';
  ['fp-at-search','mfp-at-search','fp-to-search','mfp-to-search'].forEach(id => {
    const el = document.getElementById(id); if (el) el.value = '';
  });
  ['fp-at-iata','mfp-at-iata','fp-to-iata','mfp-to-iata'].forEach(id => {
    const el = document.getElementById(id); if (el) el.value = '';
  });
}


function generateArc(from, to, numPoints) {
  const points = [];
  const latD = to[0] - from[0], lngD = to[1] - from[1];
  const dist = Math.sqrt(latD * latD + lngD * lngD);
  const bulge = dist * 0.2;
  for (let i = 0; i <= numPoints; i++) {
    const t = i / numPoints;
    points.push([from[0] + latD * t + bulge * Math.sin(t * Math.PI), from[1] + lngD * t]);
  }
  return points;
}

// Legacy filterMap compat
let _mapFilterActive = '';

function filterMap(type) {
  // Toggle: click same filter again → show all
  if (_mapFilterActive === type) { _mapFilterActive = ''; clearAllFilters(); return; }
  _mapFilterActive = type;

  if (type === 'all') { _mapFilterActive = ''; clearAllFilters(); return; }
  if (type === 'help') {
    document.querySelectorAll('[id$="-show-offers"]').forEach(c => c.checked = true);
    document.querySelectorAll('[id$="-show-stranded"]').forEach(c => c.checked = false);
    document.querySelectorAll('[id$="-show-worldwide"]').forEach(c => c.checked = false);
  } else if (type === 'worldwide') {
    document.querySelectorAll('[id$="-show-offers"]').forEach(c => c.checked = false);
    document.querySelectorAll('[id$="-show-stranded"]').forEach(c => c.checked = false);
    document.querySelectorAll('[id$="-show-worldwide"]').forEach(c => c.checked = true);
  } else if (type === 'stranded') {
    document.querySelectorAll('[id$="-show-offers"]').forEach(c => c.checked = false);
    document.querySelectorAll('[id$="-show-stranded"]').forEach(c => c.checked = true);
    document.querySelectorAll('[id$="-show-worldwide"]').forEach(c => c.checked = false);
  }
  applyFilters();

  // Highlight active sitrep stat
  document.querySelectorAll('.sitrep-stat').forEach(s => s.classList.remove('active-filter'));
  if (type === 'stranded') document.getElementById('ss-stranded')?.classList.add('active-filter');

  // Highlight mobile stat
  document.querySelectorAll('.m-stat').forEach(s => s.classList.remove('active-filter'));
  if (type === 'stranded') document.getElementById('mss-stranded')?.classList.add('active-filter');
}

// ============================================================
// VIEW SWITCHING
// ============================================================
function showView(name) {
  // On PC, help and profile open as form-sidebar fly-ins over the map
  if (!isMob() && name === 'profile') { openFormSidebar('profile'); return; }
  if (!isMob() && name === 'help')    { openFormSidebar('offer');   return; }
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
  if (name === 'resources') { populateResourceDropdowns(); renderResources(); }
  if (name === 'map') closeFormSidebar();
}

// ── FORM SIDEBAR — same pattern as openPinSidebar ───────────────────────
const _fsTitles = {
  offer:    'OFFER A SPARE ROOM',
  stranded: "I'M STRANDED",
  help:     '$HELP · COMMUNITY TIPS',
  profile:  'MY PROFILE',
  pets:     'STRANDED PETS',
};
// Map of which DOM element to move into the sidebar for each panel
const _fsSourceMap = {
  offer:    () => document.getElementById('help-panel-offer'),
  stranded: () => document.getElementById('help-panel-stranded'),
  pets:     () => document.getElementById('help-panel-pets'),
  profile:  () => document.querySelector('#profile-view .container'),
  help:     () => document.getElementById('help-money-modal'),
};
const _fsReturnMap = {
  offer:    () => document.getElementById('help-view-container'),
  stranded: () => document.getElementById('help-view-container'),
  pets:     () => document.getElementById('help-view-container'),
  profile:  () => document.getElementById('profile-view'),
  help:     () => document.body,
};

function openFormSidebar(which) {
  if (isMob()) return;
  const sb    = document.getElementById('form-sidebar');
  const body  = document.getElementById('form-sidebar-body');
  const title = document.getElementById('form-sidebar-title');
  if (!sb || !body) return;

  // Toggle: clicking same panel again closes
  if (sb.classList.contains('open') && sb.dataset.panel === which) {
    closeFormSidebar(); return;
  }

  // Return any previously mounted node back to its home
  _fsReturnMounted();

  // Clear any leftover content (e.g. manage dashboard HTML)
  body.innerHTML = '';

  // Get the source node and move it into the sidebar body
  const getNode = _fsSourceMap[which];
  const node = getNode ? getNode() : null;
  if (node) {
    node.dataset.fsHome = node.parentElement?.id || '';
    body.appendChild(node);
    sb.dataset.panel = which;
  }

  if (title) {
    title.textContent = _fsTitles[which] || which.toUpperCase();
    title.style.color = '';
    title.style.fontSize = '';
  }
  sb.classList.add('open');
  document.getElementById('sidebar-overlay')?.classList.add('active');
  document.getElementById('map-view')?.style.setProperty('--right-sidebar-w', '400px');

  // Click outside form sidebar to close
  setTimeout(function() {
    if (!window._fsBackdropClose) {
      window._fsBackdropClose = function(e) {
        const sb = document.getElementById('form-sidebar');
        if (sb && sb.classList.contains('open') && !sb.contains(e.target)) {
          // Don't close if clicking a button that opens the sidebar
          if (e.target.closest('[onclick*="openFormSidebar"]') || e.target.closest('[onclick*="openManageSidebar"]') || e.target.closest('[onclick*="mTab"]')) return;
          closeFormSidebar();
        }
      };
    }
    document.removeEventListener('mousedown', window._fsBackdropClose);
    document.addEventListener('mousedown', window._fsBackdropClose);
  }, 100);

  // Make the moved element visible (views are display:none by default)
  if (node) node.style.display = 'block';

  // Panel-specific init
  if (which === 'stranded') {
    // Panel moved individually — just ensure it's visible
    if (node) node.style.display = 'block';
  }
  if (which === 'offer') {
    if (node) node.style.display = 'block';
    renderPosts();
  }
  if (which === 'pets') {
    if (node) node.style.display = 'block';
  }
  if (which === 'profile')  renderProfileView();
  if (which === 'help')     {
    // Ensure modal shows inline
    if (node) { node.style.position = 'static'; node.style.background = 'none';
      node.style.backdropFilter = 'none'; node.style.zIndex = 'auto'; }
  }
}

function _fsReturnMounted() {
  const body = document.getElementById('form-sidebar-body');
  if (!body) return;
  // Restore toggle bar visibility before moving content back
  const toggleWrap = body.querySelector('.help-toggle-wrap');
  if (toggleWrap) toggleWrap.style.display = '';
  // Move any child nodes back to their original homes
  [...body.children].forEach(child => {
    const homeId = child.dataset.fsHome;
    if (homeId) {
      const home = document.getElementById(homeId);
      if (home) {
        // Offer panel should return hidden (stranded is default view)
        if (child.id === 'help-panel-offer') child.style.display = 'none';
        if (child.id === 'help-panel-pets') child.style.display = 'none';
        else child.style.display = '';
        home.appendChild(child);
        delete child.dataset.fsHome;
      }
    } else {
      // $HELP modal goes back to body
      if (child.id === 'help-money-modal') {
        child.style.position = ''; child.style.background = '';
        child.style.backdropFilter = ''; child.style.zIndex = '';
        child.style.display = '';
        document.body.appendChild(child);
      }
    }
  });
}

function closeFormSidebar() {
  const sb = document.getElementById('form-sidebar');
  if (!sb) return;
  sb.classList.remove('open');
  sb.dataset.panel = '';
  document.getElementById('sidebar-overlay')?.classList.remove('active');
  document.getElementById('map-view')?.style.setProperty('--right-sidebar-w', '0px');
  if (window._fsBackdropClose) {
    document.removeEventListener('mousedown', window._fsBackdropClose);
  }
  _fsReturnMounted();
}

// ============================================================
// HELP TABS (offer only now)
// ============================================================
function switchHelpTab(tab) { switchHelpMode(tab === 'offer' ? 'helper' : 'stranded'); }

function switchHelpMode(mode) {
  const sp = document.getElementById('help-panel-stranded');
  const op = document.getElementById('help-panel-offer');
  const bs = document.getElementById('help-toggle-stranded');
  const bh = document.getElementById('help-toggle-helper');
  // Inside the form sidebar, offer panel uses block not grid
  const inSidebar = !!document.querySelector('#form-sidebar.open');
  if (mode === 'stranded') {
    if (sp) sp.style.display = 'block';
    if (op) op.style.display = 'none';
    if (bs) bs.classList.add('active');
    if (bh) bh.classList.remove('active');
  } else {
    if (sp) sp.style.display = 'none';
    if (op) op.style.display = inSidebar ? 'block' : 'grid';
    if (bh) bh.classList.add('active');
    if (bs) bs.classList.remove('active');
  }
}

// ============================================================
// MAP THEME TOGGLE
// ============================================================
let _mapDark = true;
const TILE_DARK = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
const TILE_LIGHT = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';

const LANGUAGES = [
  {code:'ar',name:'Arabic',native:'العربية'},{code:'bn',name:'Bengali',native:'বাংলা'},
  {code:'zh-CN',name:'Chinese',native:'中文'},{code:'nl',name:'Dutch',native:'Nederlands'},
  {code:'en',name:'English',native:'English'},{code:'fa',name:'Farsi',native:'فارسی'},
  {code:'tl',name:'Filipino',native:'Filipino'},{code:'fr',name:'French',native:'Français'},
  {code:'de',name:'German',native:'Deutsch'},{code:'el',name:'Greek',native:'Ελληνικά'},
  {code:'hi',name:'Hindi',native:'हिन्दी'},{code:'iw',name:'Hebrew',native:'עברית'},{code:'id',name:'Indonesian',native:'Bahasa'},
  {code:'it',name:'Italian',native:'Italiano'},{code:'ja',name:'Japanese',native:'日本語'},
  {code:'ko',name:'Korean',native:'한국어'},{code:'ms',name:'Malay',native:'Melayu'},
  {code:'ne',name:'Nepali',native:'नेपाली'},{code:'pl',name:'Polish',native:'Polski'},
  {code:'pt',name:'Portuguese',native:'Português'},{code:'ro',name:'Romanian',native:'Română'},
  {code:'ru',name:'Russian',native:'Русский'},{code:'si',name:'Sinhala',native:'සිංහල'},
  {code:'es',name:'Spanish',native:'Español'},{code:'ta',name:'Tamil',native:'தமிழ்'},
  {code:'te',name:'Telugu',native:'తెలుగు'},{code:'th',name:'Thai',native:'ไทย'},
  {code:'tr',name:'Turkish',native:'Türkçe'},{code:'uk',name:'Ukrainian',native:'Українська'},
  {code:'ur',name:'Urdu',native:'اردو'},{code:'vi',name:'Vietnamese',native:'Tiếng Việt'},
];

let _langGridBuilt = false;

function buildLangGrid() {
  if (_langGridBuilt) return;
  const grid = document.getElementById('lang-grid');
  if (!grid) return;
  grid.innerHTML = LANGUAGES.map(l => 
    `<button class="lang-btn" data-lang="${l.code}" onclick="setTranslation('${l.code}')">
      ${l.name} <span class="lang-native">${l.native}</span>
    </button>`
  ).join('');
  _langGridBuilt = true;
  _syncLangGrid();
}

function toggleTranslate() {
  const overlay = document.getElementById('translate-overlay');
  if (!overlay) return;
  buildLangGrid();
  overlay.classList.toggle('open');
  if (overlay.classList.contains('open')) {
    setTimeout(() => {
      document.addEventListener('click', function closeTr(e) {
        if (!overlay.contains(e.target) && !e.target.closest('.translate-wrap') && !e.target.closest('.m-map-pill')) {
          overlay.classList.remove('open');
          document.removeEventListener('click', closeTr);
        }
      });
    }, 10);
  }
}

function setTranslation(langCode) {
  // Close panel
  const overlay = document.getElementById('translate-overlay');
  if (overlay) overlay.classList.remove('open');

  // Build every possible domain variant the cookie could be set on
  // e.g. for help.imstranded.org → ['', 'help.imstranded.org', '.help.imstranded.org', 'imstranded.org', '.imstranded.org']
  const parts = location.hostname.split('.');
  const domains = ['', location.hostname, '.' + location.hostname];
  if (parts.length > 2) {
    const parent = parts.slice(1).join('.');
    domains.push(parent, '.' + parent);
  }

  // Nuke googtrans cookie on EVERY domain + path combination
  const expiry = '=;expires=Thu, 01 Jan 1970 00:00:00 GMT';
  domains.forEach(d => {
    const dm = d ? ';domain=' + d : '';
    document.cookie = 'googtrans' + expiry + ';path=/' + dm;
    document.cookie = 'googtrans' + expiry + dm; // no path
    document.cookie = 'googtrans' + expiry + ';path=' + dm; // empty path
  });

  if (langCode === 'en') {
    location.reload();
    return;
  }

  // Set fresh cookie on all domain variants
  const val = '/en/' + langCode;
  domains.forEach(d => {
    const dm = d ? ';domain=' + d : '';
    document.cookie = 'googtrans=' + val + ';path=/' + dm;
  });

  location.reload();
}

// On page load, highlight the active language from cookie
function _syncLangGrid() {
  const match = document.cookie.match(/googtrans=\/en\/([a-z-]+)/i);
  const activeLang = match ? match[1] : 'en';
  document.querySelectorAll('.lang-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.lang === activeLang);
  });
  const resetBtn = document.getElementById('lang-reset');
  if (resetBtn) resetBtn.style.display = activeLang === 'en' ? 'none' : 'block';
}

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
  // Sync zoom button color with theme
  document.querySelector('.leaflet-control-zoom')?.classList.toggle('theme-light', !_mapDark);
  // Add theme class to body so CSS can restyle map dots
  document.body.classList.toggle('map-light', !_mapDark);
}

function setAccent(name) {
  const t = ACCENT_THEMES[name]; if (!t) return;
  _currentAccent = name;
  const root = document.documentElement;
  root.style.setProperty('--accent', t.hex);
  root.style.setProperty('--accent-r', t.r);
  root.style.setProperty('--accent-g', t.g);
  root.style.setProperty('--accent-b', t.b);

  // Update swatch dots
  document.querySelectorAll('.accent-swatch-dot').forEach(d => d.style.background = t.hex);
  document.querySelectorAll('.accent-opt').forEach(btn => {
    btn.classList.toggle('active', btn.dataset?.accent === name || btn.querySelector('.accent-opt-dot')?.style.background === t.hex);
  });

  // Persist
  try { localStorage.setItem('imstranded_accent', name); } catch(e) {}

  // Close dropdowns
  document.querySelectorAll('.accent-dropdown').forEach(d => d.classList.remove('open'));

  // Re-render map layers that use hardcoded '+accentRgba(...)+' in JS
  // These live in renderGlobalDisruptions — trigger a repaint if map is ready
  if (window._crisisMap || window._mobileMap) {
    clearGlobalArcs();
    _globalPins.forEach(m => {
      [window._crisisMap, window._mobileMap].forEach(map => { if (map) try { map.removeLayer(m); } catch(e){} });
    });
    _globalPins = [];
    renderGlobalDisruptions(window._crisisMap, _globalDisruptions);
    renderGlobalDisruptions(window._mobileMap, _globalDisruptions);
    // Redraw arcs (clearGlobalArcs removed them)
    drawGlobalRouteArcs(window._crisisMap, _globalDisruptions);
    drawGlobalRouteArcs(window._mobileMap, _globalDisruptions);
    drawMERouteArcs(window._crisisMap);
    drawMERouteArcs(window._mobileMap);
    drawSuccessArcs(window._crisisMap);
    drawSuccessArcs(window._mobileMap);
    // Live-repaint country status dots (rendered once at init, stored in _mk.country)
    const newCol = accentHex();
    (_mk.country || []).forEach(({marker, status}) => {
      // glow rings have fillOpacity .12 and are red — skip them
      try {
        const opts = marker.options;
        if (opts.fillOpacity > 0.2) marker.setStyle({ fillColor: newCol });
      } catch(e) {}
    });
    // Worldwide static dots removed — cluster handles repainting via re-render
  }

  // Repaint timeline charts with new accent color
  if (typeof renderTimelineChart === 'function') renderTimelineChart();
  renderImpactSheetChart();

  // Sweep inline-style elements that hardcode #3498ec / rgba(52,152,236,...)
  // Excludes offer/spare room UI which intentionally stays blue as its own brand color.
  const hex = t.hex;
  const rgbStr = `${t.r},${t.g},${t.b}`;
  const offerSelectors = '.help-panel-offer, .post-form-header--offer, .post-form-header--live, .submit-btn--offer, [data-offer], .help-tab-dot--offer, #ss-offer-room, #m-stat-offer, .m-tab-spare, #mtab-spare, .accent-opt, .accent-opt-dot, .accent-dropdown, .accent-picker-wrap';
  const offerEls = new Set(document.querySelectorAll(offerSelectors));
  const isInOffer = el => {
    let n = el;
    while (n) { if (offerEls.has(n)) return true; n = n.parentElement; }
    return false;
  };
  document.querySelectorAll('[style]').forEach(el => {
    if (isInOffer(el)) return;
    const st = el.getAttribute('style');
    if (!st.includes('#3498ec') && !st.includes('52,152,236')) return;
    el.setAttribute('style',
      st.replace(/#3498ec/gi, hex)
        .replace(/rgba\(52,\s*152,\s*236,\s*([\d.]+)\)/g, `rgba(${rgbStr},$1)`)
    );
  });
  // SVG fill/stroke attributes
  document.querySelectorAll('[fill="#3498ec"],[stroke="#3498ec"]').forEach(el => {
    if (isInOffer(el)) return;
    if (el.getAttribute('fill') === '#3498ec') el.setAttribute('fill', hex);
    if (el.getAttribute('stroke') === '#3498ec') el.setAttribute('stroke', hex);
  });
}

function toggleImpactSheet() {
  // PC: no popup — data lives in the filter sidebar chart
  if (!isMob()) return;
  const sheet = document.getElementById('m-impact-sheet');
  const backdrop = document.getElementById('m-impact-backdrop');
  if (!sheet) return;
  const isOpen = sheet.style.transform === 'translateY(0px)' || sheet.style.transform === 'translateY(0)';
  if (isOpen) {
    closeImpactSheet();
  } else {
    backdrop.style.display = 'block';
    requestAnimationFrame(() => {
      backdrop.style.opacity = '1';
      sheet.style.transform = 'translateY(0)';
      // Wait for slide animation to fully finish before measuring canvas width
      setTimeout(() => { renderImpactSheetChart(); renderMobileNations(); }, 350);
    });
  }
}

function closeImpactSheet() {
  const sheet = document.getElementById('m-impact-sheet');
  const backdrop = document.getElementById('m-impact-backdrop');
  if (!sheet) return;
  sheet.style.transform = 'translateY(100%)';
  backdrop.style.opacity = '0';
  setTimeout(() => { backdrop.style.display = 'none'; }, 280);
}

function toggleAccentPicker(e) {
  e.stopPropagation();
  // Close any other open dropdowns first
  document.querySelectorAll('.accent-dropdown').forEach(d => {
    if (!d.parentElement.contains(e.currentTarget)) d.classList.remove('open');
  });
  // Toggle the nearest dropdown
  const wrap = e.currentTarget.closest('.accent-picker-wrap');
  const dd = wrap?.querySelector('.accent-dropdown');
  if (dd) dd.classList.toggle('open');
}

// Close picker when clicking outside
document.addEventListener('click', e => {
  if (!e.target.closest('.accent-picker-wrap')) {
    document.querySelectorAll('.accent-dropdown').forEach(d => d.classList.remove('open'));
  }
});

function initAccent() {
  let saved = 'purple';
  try { saved = localStorage.getItem('imstranded_accent') || 'blue'; } catch(e) {}
  setAccent(saved);
}

// ============================================================
// INIT MAP
// ============================================================
// Applies leaflet-zoom-level-N class to map container so CSS can show/hide labels
function applyZoomClass(map, container) {
  if (!container) return;
  function setClass() {
    const z = map.getZoom();
    container.className = container.className.replace(/leaflet-zoom-level-\d+/g, '').trim();
    container.classList.add('leaflet-zoom-level-' + z);
  }
  map.on('zoomend', setClass);
  setTimeout(setClass, 400);
}

function initMap() {
  window._mapInit = true;
  const map = L.map('crisis-map',{zoomControl:false,attributionControl:false}).setView([28,45],5);
  L.control.zoom({position:'bottomright'}).addTo(map);
  window._dtTile = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',{
    attribution:'(c)OpenStreetMap (c)CARTO',maxZoom:19
  }).addTo(map);

  // Custom panes — layered for proper visibility
  applyZoomClass(map, document.getElementById('crisis-map'));
  map.createPane('worldwidePane');
  map.getPane('worldwidePane').style.zIndex = 580;
  map.createPane('airportGlowPane');
  map.getPane('airportGlowPane').style.zIndex = 620;
  map.createPane('airportPane');
  map.getPane('airportPane').style.zIndex = 630;
  map.createPane('countryPane');
  map.getPane('countryPane').style.zIndex = 640;

  // COUNTRIES status dots suppressed — cluster system replaces these

  // WORLDWIDE static dots suppressed — replaced by live cluster system

  _helpCluster = L.markerClusterGroup({
    maxClusterRadius: 120,
    spiderfyOnMaxZoom: true,
    showCoverageOnHover: false,
    zoomToBoundsOnClick: true,
    disableClusteringAtZoom: 16,
    iconCreateFunction: function(c) {
      const count = c.getChildCount();
      const d = buildUserDot('offer', count, count === 1 ? 'room' : 'rooms', 50);
      return L.divIcon({ html: d.html, className: '', iconSize: [d.sz, d.sz], iconAnchor: [d.sz/2, d.sz/2] });
    }
  });
  map.addLayer(_helpCluster);

  renderPostsOnMap(map);
  renderStrandedOnMap(map, false);
  map.on('zoomend', () => applyFilters());
  window._crisisMap = map;
}

// ============================================================
// GLOBAL DISRUPTION DOTS (purple)
// ============================================================
let _activePopupIata = '';
let _activePopupMode = 'leave';
let _activePopupCircle = null;

function buildDualPopup(iata) {
  const ap = typeof findAirport === 'function' ? findAirport(iata) : null;
  if (!ap) return '';
  const city = ap.city;
  const country = ap.countryName || '';
  const gData = _globalDisruptions.find(g => g.iata === iata);
  
  // Toggle styles
  const tWrap = 'display:flex;background:rgba(255,255,255,.06);border-radius:8px;padding:2px;margin-bottom:.6rem;border:1px solid rgba(255,255,255,.08)';
  const tBase = 'flex:1;padding:.35rem .4rem;border:none;border-radius:6px;font-family:Inter,sans-serif;font-size:.58rem;font-weight:700;cursor:pointer;text-transform:uppercase;letter-spacing:.02em;text-align:center;';
  const tOn = 'background:'+accentRgba(.15)+';color:'+accentHex()+';border:1px solid '+accentRgba(.2)+';';
  const tOff = 'background:transparent;color:rgba(255,255,255,.3);border:1px solid transparent;';
  
  // Determine whether this is a ME hub or a global destination airport
  var isMEAirport = AIRPORT_DATA.some(function(a) { return (a.iata || a.code) === iata; });

  // ── LEAVE data ──
  // ME airport: people at this hub trying to fly out to global destinations
  // Global airport: people there trying to fly to/through ME hubs
  var lCancelled = 0, lStranded = 0, lRoutes = [], lAirlines = [];
  if (isMEAirport) {
    // Pull from pre-computed outbound index (inverted AIRLINE_ROUTES with live cancel rates)
    var apRow = AIRPORT_DATA.find(function(a) { return (a.iata || a.code) === iata; });
    lCancelled = apRow ? (apRow.cancelled || 0) : 0;
    lStranded  = apRow ? (apRow.stranded  || 0) : 0;
    // Use _meAllOutbound for popup — includes intra-ME routes (e.g. BGW→DOH)
    var outboundDests = (window._meAllOutbound && window._meAllOutbound[iata]) || (_meOutbound && _meOutbound[iata]) || [];
    lCancelled = outboundDests.reduce(function(s, d) { return s + (d.cancelled || 0); }, 0);
    lStranded  = lCancelled * 185;
    lRoutes = outboundDests.map(function(d) {
      var ap2 = typeof findAirport === 'function' ? findAirport(d.iata) : null;
      return { hub: d.iata, cancelled: d.cancelled, city: ap2 ? ap2.city : d.iata };
    });
    var seenL = {};
    outboundDests.forEach(function(d) {
      d.airlines.forEach(function(a) { if (!seenL[a]) { seenL[a] = 1; lAirlines.push(a); } });
    });
  } else {
    // Global airport "Trying to Leave": dep=this airport, arr=ME hub
    // Use _globalOutbound which has the correct direction (IFN→DXB, not DXB→IFN)
    var outbound = (window._globalOutbound && window._globalOutbound[iata]) || [];
    if (outbound.length) {
      lCancelled = outbound.reduce(function(s, r) { return s + (r.cancelled || 0); }, 0);
      lStranded  = outbound.reduce(function(s, r) { return s + (r.stranded  || 0); }, 0);
      lRoutes    = outbound.map(function(r) {
        var ap2 = typeof findAirport === 'function' ? findAirport(r.iata) : null;
        return { hub: r.iata, cancelled: r.cancelled, city: ap2 ? ap2.city : r.iata };
      });
      var seenLG = {};
      outbound.forEach(function(r) {
        (r.airlines || []).forEach(function(a) { if (!seenLG[a]) { seenLG[a] = 1; lAirlines.push(a); } });
      });
    } else if (gData) {
      // Fallback to gData if _globalOutbound not populated yet (first load before backfill)
      lCancelled = gData.cancelled || 0;
      lStranded  = gData.stranded  || 0;
      lRoutes    = (gData.me_hubs || []).map(function(h) {
        return { hub: h, cancelled: Math.round(lCancelled / (gData.me_hubs||[]).length) };
      });
      lAirlines  = gData.airlines || [];
    }
  }
  var lHubCities = lRoutes.slice(0, 4).map(function(r) {
    var h = typeof findAirport === 'function' ? findAirport(r.hub) : null;
    return h ? h.city : r.hub;
  });
  
  // ── HOME / FLYING-IN data ──
  // For ME airports: real inbound route data from _meInbound (arr_iata = this hub)
  // For global airports: real inbound route data from _globalInbound (dep = this airport, arr = ME hub)
  var hCancelled, hStranded, hRoutes, hAirlines, hHubCities;
  if (isMEAirport) {
    // Use _meAllInbound for popup — includes intra-ME routes (e.g. DOH→BGW, AMM→BGW)
    var inboundRoutes = (window._meAllInbound && window._meAllInbound[iata]) || (window._meInbound && window._meInbound[iata]) || [];
    if (!inboundRoutes.length && _meOutbound && _meOutbound[iata]) {
      inboundRoutes = _meOutbound[iata];
    }
    hCancelled = inboundRoutes.reduce(function(s, r) { return s + (r.cancelled || 0); }, 0);
    hStranded  = inboundRoutes.reduce(function(s, r) { return s + (r.stranded  || 0); }, 0);
    hRoutes = inboundRoutes.map(function(r) {
      var ap2 = typeof findAirport === 'function' ? findAirport(r.iata) : null;
      return { hub: r.iata, cancelled: r.cancelled, city: ap2 ? ap2.city : r.iata, airlines: r.airlines || [] };
    });
    var seenH = {};
    hAirlines = [];
    inboundRoutes.forEach(function(r) { (r.airlines || []).forEach(function(a) { if (!seenH[a]) { seenH[a] = 1; hAirlines.push(a); } }); });
    hHubCities = hRoutes.slice(0, 4).map(function(r) { return r.city || r.hub; });
  } else {
    // Global airport: people here trying to reach a ME hub (dep=this, arr=ME)
    var globalIn = (window._globalInbound && window._globalInbound[iata]) || [];
    // Fallback: derive from gData.me_hubs + _meInbound if DB hasn't run yet
    if (!globalIn.length && gData && gData.me_hubs) {
      globalIn = gData.me_hubs.map(function(hub) {
        var inb = window._meInbound && window._meInbound[hub];
        var match = inb && inb.find(function(r) { return r.iata === iata; });
        return match ? { iata: hub, cancelled: match.cancelled, stranded: match.stranded, airlines: match.airlines } : null;
      }).filter(Boolean);
    }
    hCancelled = globalIn.reduce(function(s, r) { return s + (r.cancelled || 0); }, 0);
    hStranded  = globalIn.reduce(function(s, r) { return s + (r.stranded  || 0); }, 0);
    hRoutes = globalIn.map(function(r) {
      var ap2 = typeof findAirport === 'function' ? findAirport(r.iata) : null;
      return { hub: r.iata, cancelled: r.cancelled, city: ap2 ? ap2.city : r.iata, airlines: r.airlines || [] };
    });
    var seen = {};
    hAirlines = [];
    globalIn.forEach(function(r) { (r.airlines || []).forEach(function(a) { if (!seen[a]) { seen[a] = 1; hAirlines.push(a); } }); });
    hHubCities = hRoutes.slice(0, 4).map(function(r) { return r.city || r.hub; });
  }
  
  function buildRouteRows(routes) {
    return routes.map(function(r) {
      var hubAp = typeof findAirport === 'function' ? findAirport(r.hub) : null;
      var hubName = r.city || (hubAp ? hubAp.city : r.hub);
      return '<div style="display:flex;justify-content:space-between;padding:.2rem 0;border-bottom:1px solid rgba(255,255,255,.04);font-size:.68rem"><span style="color:rgba(255,255,255,.6)">' + hubName + ' (' + r.hub + ')</span><span style="color:'+accentHex()+';font-weight:700">' + (r.cancelled || 0).toLocaleString() + '</span></div>';
    }).join('');
  }
  
  function buildPills(airlines) {
    return airlines.map(function(a) {
      return '<span style="padding:.15rem .4rem;background:'+accentRgba(.12)+';border-radius:4px;font-size:.6rem;color:'+accentHex()+';font-weight:600">' + a + '</span>';
    }).join('');
  }
  
  var embBtn = '';
  
  // Build panel HTML — designed for the 320px sidebar
  function buildPanel(cancelled, stranded, routes, airlines, mode, hubCities) {
    var desc = '';
    var routeLabel = '';
    if (mode === 'leave') {
      var dest = hubCities.length ? hubCities.join(', ') : (isMEAirport ? 'worldwide destinations' : 'the Middle East');
      desc = 'People in ' + city + ' trying to reach ' + dest + '.';
      routeLabel = 'Cancelled routes to';
    } else if (mode === 'flyin') {
      desc = 'Passengers with cancelled inbound flights to or via ' + city + '.';
      routeLabel = 'Cancelled routes from';
    } else {
      var origin = hubCities.length ? hubCities.join(', ') : 'the Middle East';
      desc = 'People stranded in ' + origin + ' trying to get home to ' + city + '.';
      routeLabel = 'Stranded at';
    }

    var estStranded = Math.round(cancelled * 185 * 0.20);

    var statsHtml =
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:.45rem;margin-bottom:.9rem">' +
        '<div style="background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07);border-radius:10px;padding:.7rem .8rem">' +
          '<div style="font-size:1.5rem;font-weight:900;color:'+accentHex()+';line-height:1;letter-spacing:-.03em">' + cancelled.toLocaleString() + '</div>' +
          '<div style="font-size:.52rem;color:rgba(255,255,255,.35);text-transform:uppercase;letter-spacing:.06em;margin-top:.28rem">Flights Cancelled</div>' +
        '</div>' +
        '<div style="background:rgba(236,52,82,.06);border:1px solid rgba(236,52,82,.14);border-radius:10px;padding:.7rem .8rem">' +
          '<div style="font-size:1.5rem;font-weight:900;color:#ec3452;line-height:1;letter-spacing:-.03em">' + stranded.toLocaleString() + '</div>' +
          '<div style="font-size:.52rem;color:rgba(255,255,255,.35);text-transform:uppercase;letter-spacing:.06em;margin-top:.28rem">People Affected</div>' +
        '</div>' +
      '</div>';

    var descHtml = '<p style="font-size:.74rem;color:rgba(255,255,255,.45);line-height:1.6;margin:0 0 .9rem;padding:.55rem .7rem;background:rgba(255,255,255,.03);border-radius:8px;border-left:2px solid '+accentRgba(.3)+'">' + desc + '</p>';

    var routesHtml = '';
    if (routes.length) {
      var rows = routes.map(function(r) {
        var hubAp = typeof findAirport === 'function' ? findAirport(r.hub) : null;
        var hubName = r.city || (hubAp ? hubAp.city : r.hub);
        return '<div style="display:flex;justify-content:space-between;align-items:center;padding:.28rem 0;border-bottom:1px solid rgba(255,255,255,.04)">' +
          '<span style="font-size:.72rem;color:rgba(255,255,255,.65)">' + hubName + ' <span style="color:rgba(255,255,255,.25);font-size:.64rem">(' + r.hub + ')</span></span>' +
          '<span style="font-size:.72rem;font-weight:700;color:'+accentHex()+'">' + (r.cancelled||0).toLocaleString() + '</span>' +
        '</div>';
      }).join('');
      routesHtml =
        '<div style="font-size:.56rem;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:rgba(255,255,255,.28);margin-bottom:.4rem">' + routeLabel + '</div>' +
        '<div style="margin-bottom:.85rem">' + rows + '</div>';
    }

    var airlinesHtml = '';
    if (airlines.length) {
      var pills = airlines.map(function(a) {
        return '<span style="padding:.16rem .42rem;background:'+accentRgba(.1)+';border:1px solid '+accentRgba(.18)+';border-radius:5px;font-size:.62rem;color:'+accentHex()+';font-weight:600">' + a + '</span>';
      }).join('');
      airlinesHtml =
        '<div style="font-size:.56rem;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:rgba(255,255,255,.28);margin-bottom:.38rem">Airlines affected</div>' +
        '<div style="display:flex;flex-wrap:wrap;gap:4px">' + pills + '</div>';
    }

    return statsHtml + descHtml + routesHtml + airlinesHtml;
  }
  
  var uid = iata.replace(/[^A-Z0-9]/g, '');
  var homeLabel = isMEAirport ? ('Trying to Fly In to ' + city) : ('Trying to Get Home to ' + city);
  var homeMode  = isMEAirport ? 'flyin' : 'home';
  
  var lEstStranded = Math.round(lCancelled * 185 * 0.20);
  var estBlock =
    '<div id="gest-' + uid + '" style="background:rgba(236,52,82,.1);border:none;border-radius:12px;padding:.8rem 1rem;margin-bottom:.6rem;text-align:center">' +
      '<div style="font-size:.52rem;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:rgba(236,52,82,.7);margin-bottom:.2rem">Estimated Stranded in ' + city + '</div>' +
      '<div style="font-size:2rem;font-weight:900;color:#ec3452;line-height:1;letter-spacing:-.04em">' + lEstStranded.toLocaleString() + '</div>' +
      '<div style="font-size:.56rem;color:rgba(255,255,255,.3);margin-top:.25rem">active stranded estimate · updated live</div>' +
    '</div>';

  // CTA: Can You Help?
  var ctaOffer =
    '<div style="margin-top:.6rem;padding-top:.75rem;border-top:1px solid rgba(255,255,255,.07)">' +
      '<div class="popup-section-title" style="font-size:.99rem;font-weight:800;color:#fff;margin-bottom:.5rem;text-align:center">Can You Help?</div>' +
      '<button onclick="isMob()?mTab(\'offer\',null):openFormSidebar(\'offer\')" ' +
        'style="width:100%;padding:.65rem .8rem;border-radius:10px;cursor:pointer;font-family:Inter,sans-serif;font-size:.76rem;font-weight:800;letter-spacing:.02em;' +
        'background:'+accentRgba(.12)+';color:'+accentHex()+';border:1px solid '+accentRgba(.28)+';' +
        'display:flex;align-items:center;justify-content:center;gap:.45rem;transition:background .15s" ' +
        'onmouseover="this.style.background=\''+accentRgba(.22)+'\'" onmouseout="this.style.background=\''+accentRgba(.12)+'\'">' +
        '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>' +
        'Offer a Spare Room' +
      '</button>' +
      '<div style="font-size:.62rem;color:rgba(255,255,255,.35);text-align:center;margin-top:.45rem;line-height:1.5">Help folks providing rooms by tweeting $HELP to <a href="https://x.com/intent/tweet?text=%40bankrbot%20send%201000000%20%24HELP%20to%20%40imstrandedorg" target="_blank" style="color:var(--accent);text-decoration:none;font-weight:600">@imstrandedorg</a></div>' +
    '</div>';

  // CTA: Are You Stranded Here?
  var ctaStranded =
    '<div style="margin-top:1rem;padding-top:.85rem;border-top:1px solid rgba(255,255,255,.07)">' +
      '<div class="popup-section-title" style="font-size:.99rem;font-weight:800;color:#fff;margin-bottom:.5rem;text-align:center">Are You Stranded Here?</div>' +
      '<button onclick="isMob()?mTab(\'stranded\',null):openFormSidebar(\'stranded\')" ' +
        'style="width:100%;padding:.65rem .8rem;border-radius:10px;cursor:pointer;font-family:Inter,sans-serif;font-size:.76rem;font-weight:800;letter-spacing:.02em;' +
        'background:'+accentRgba(.12)+';color:'+accentHex()+';border:1px solid '+accentRgba(.28)+';' +
        'display:flex;align-items:center;justify-content:center;gap:.45rem;transition:background .15s" ' +
        'onmouseover="this.style.background=\''+accentRgba(.22)+'\'" onmouseout="this.style.background=\''+accentRgba(.12)+'\'">' +
        '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>' +
        'Add Yourself to the Map' +
      '</button>' +
    '</div>';

  // Section header: The Full Impact
  var fullImpactHeader =
    '<div style="margin-top:1rem;padding-top:.85rem;border-top:1px solid rgba(255,255,255,.07);margin-bottom:.6rem">' +
      '<div class="popup-section-title" style="font-size:.99rem;font-weight:800;color:#fff;text-align:center">The Full Impact</div>' +
    '</div>';

  return '<div style="width:100%;font-family:Inter,sans-serif" id="gpop-' + uid + '">' +
    
    // City header — visible on mobile pin sheet, hidden on PC sidebar (has its own header)
    '<div class="popup-city-header" style="text-align:center;margin-bottom:.5rem">' +
      '<div style="font-size:1.65rem;font-weight:800;color:#fff;letter-spacing:-.01em">' + city + '</div>' +
      '<div style="display:flex;justify-content:center;align-items:center;gap:.5rem;margin-top:.15rem">' +
        '<span style="font-size:.65rem;font-weight:800;letter-spacing:.1em;color:var(--accent);text-transform:uppercase">' + iata + '</span>' +
        '<span style="font-size:.65rem;color:#fff">' + country + '</span>' +
      '</div>' +
    '</div>' +
    
    // Est. stranded — above toggle, hidden on arrivals tab
    estBlock +
    
    // CTA buttons
    ctaOffer +
    ctaStranded +
    
    // Section: The Full Impact
    fullImpactHeader +
    
    // Toggle — both tabs always present
    '<div style="' + tWrap + '">' +
      '<button id="gtl-' + uid + '" onclick="event.stopPropagation();switchPopupMode(\'' + iata + '\',\'leave\')" style="' + tBase + tOn + '">↑ Leaving ' + city + '</button>' +
      '<button id="gth-' + uid + '" onclick="event.stopPropagation();switchPopupMode(\'' + iata + '\',\'' + homeMode + '\')" style="' + tBase + tOff + '">' + homeLabel + '</button>' +
    '</div>' +
    
    // LEAVE panel (visible by default)
    '<div id="gpl-' + uid + '">' + buildPanel(lCancelled, lStranded, lRoutes, lAirlines, 'leave', lHubCities) + '</div>' +
    
    // HOME / FLYING-IN panel (hidden by default)
    '<div id="gph-' + uid + '" style="display:none">' + buildPanel(hCancelled, hStranded, hRoutes, hAirlines, homeMode, hHubCities) + '</div>' +
    
    embBtn +

  '</div>';
}

function switchPopupMode(iata, mode) {
  _activePopupMode = mode;
  _activePopupIata = iata;

  const isMobile = window.innerWidth <= 600;

  if (isMobile) {
    // On mobile, rebuild and refresh the pin sheet content
    const html = buildDualPopup(iata);
    // After insert, immediately switch panel visibility via the uid
    refreshMPinSheet(html);
    // Now flip the panels — the HTML is fresh so query directly
    const uid = iata.replace(/[^A-Z0-9]/g, '');
    const leavePanel = document.getElementById('gpl-' + uid);
    const homePanel  = document.getElementById('gph-' + uid);
    const leaveBtn   = document.getElementById('gtl-' + uid);
    const homeBtn    = document.getElementById('gth-' + uid);
    const isLeave    = (mode === 'leave');
    const tOn  = 'background:'+accentRgba(.15)+';color:'+accentHex()+';border:1px solid '+accentRgba(.2)+';';
    const tOff = 'background:transparent;color:rgba(255,255,255,.3);border:1px solid transparent;';
    if (leavePanel && homePanel) {
      leavePanel.style.display = isLeave ? 'block' : 'none';
      homePanel.style.display  = isLeave ? 'none' : 'block';
    }
    var estEl = document.getElementById('gest-' + uid);
    if (estEl) estEl.style.display = isLeave ? 'block' : 'none';
    if (leaveBtn && homeBtn) {
      leaveBtn.style.cssText += isLeave ? tOn : tOff;
      homeBtn.style.cssText  += isLeave ? tOff : tOn;
    }
  } else {
    // PC sidebar — re-inject content so rebuilt panels are in the sidebar DOM
    const sbBody = document.getElementById('pin-sidebar-body');
    if (sbBody) {
      sbBody.innerHTML = buildDualPopup(iata);
      // Set correct panel visibility immediately after inject
      const uid = iata.replace(/[^A-Z0-9]/g, '');
      const leavePanel = document.getElementById('gpl-' + uid);
      const homePanel  = document.getElementById('gph-' + uid);
      const leaveBtn   = document.getElementById('gtl-' + uid);
      const homeBtn    = document.getElementById('gth-' + uid);
      const isLeave = (mode === 'leave');
      const tOn  = 'background:'+accentRgba(.15)+';color:'+accentHex()+';border:1px solid '+accentRgba(.2)+';';
      const tOff = 'background:transparent;color:rgba(255,255,255,.3);border:1px solid transparent;';
      if (leavePanel && homePanel) {
        leavePanel.style.display = isLeave ? 'block' : 'none';
        homePanel.style.display  = isLeave ? 'none'  : 'block';
      }
      var estEl = document.getElementById('gest-' + uid);
      if (estEl) estEl.style.display = isLeave ? 'block' : 'none';
      if (leaveBtn && homeBtn) {
        leaveBtn.style.cssText  += isLeave ? tOn : tOff;
        homeBtn.style.cssText   += isLeave ? tOff : tOn;
      }
    }
  }

  clearGlobalArcs(true);
  drawPopupArcs(iata, mode);
}

// ── PC RIGHT-SIDE PIN INFO SIDEBAR ─────────────────────────────────────────
function openPinSidebar(iata) {
  _activePopupIata = iata;
  _activePopupMode = 'leave';

  const ap   = typeof findAirport === 'function' ? findAirport(iata) : null;
  const city = ap ? ap.city : iata;
  const country = ap ? (ap.countryName || '') : '';

  // Populate header
  const titleCity = document.getElementById('pin-sidebar-city');
  const titleCode = document.getElementById('pin-sidebar-code');
  const titleCoun = document.getElementById('pin-sidebar-country');
  if (titleCity) titleCity.textContent = city;
  if (titleCode) titleCode.textContent = iata;
  if (titleCoun) titleCoun.textContent = country;

  // Populate body
  const body = document.getElementById('pin-sidebar-body');
  if (body) body.innerHTML = buildDualPopup(iata);

  // Slide open
  const sb = document.getElementById('pin-sidebar');
  if (sb) sb.classList.add('open');
  document.getElementById('map-view')?.style.setProperty('--right-sidebar-w', '320px');

  // Lock hover state on the clicked dot
  document.querySelectorAll('.gd-active').forEach(el => el.classList.remove('gd-active'));
  if (_activePopupCircle && _activePopupCircle._icon) {
    const dot = _activePopupCircle._icon.querySelector('.gd-cluster, .gd-single');
    if (dot) dot.classList.add('gd-active');
  }

  // Draw focused arcs for this pin
  clearGlobalArcs(true);
  drawPopupArcs(iata, 'leave');

  // Close on any bare map click (not a pin or control click)
  if (window._crisisMap && !window._crisisMap._pinSidebarClose) {
    window._crisisMap._pinSidebarClose = function() { closePinSidebar(); };
    window._crisisMap.on('click', window._crisisMap._pinSidebarClose);
  }
}

// ── POST SIDEBAR (spare room / stranded detail) ─────────────
function openPostSidebar(post, postType) {
  // Close airport sidebar if open
  const pinSb = document.getElementById('pin-sidebar');
  if (pinSb) pinSb.classList.remove('open');

  // ── Avatar ──
  const initEl  = document.getElementById('post-sidebar-avatar-initials');
  const imgEl   = document.getElementById('post-sidebar-avatar-img');
  const initials = (post.name || '?').trim().charAt(0).toUpperCase();
  if (initEl) initEl.textContent = initials;
  if (imgEl) {
    if (post.avatar_url) {
      imgEl.src = post.avatar_url;
      imgEl.style.display = 'block';
      imgEl.onerror = function() { imgEl.style.display = 'none'; };
    } else {
      imgEl.style.display = 'none';
    }
  }

  // ── Header ──
  const nameEl  = document.getElementById('post-sidebar-name');
  const badgeEl = document.getElementById('post-sidebar-type-badge');
  const timeEl  = document.getElementById('post-sidebar-time');
  if (nameEl) nameEl.innerHTML = (post.name || 'Anonymous') + ' ' + buildBadge(!!post.user_id);
  if (timeEl) timeEl.textContent = timeAgo(post.created_at);
  if (badgeEl) {
    const isOffer = (postType === 'offer');
    badgeEl.textContent  = isOffer ? 'Spare Room' : 'Stranded';
    badgeEl.style.cssText = isOffer
      ? `background:rgba(52,152,236,.18);color:#3498ec;`
      : `background:rgba(236,52,82,.18);color:#ec3452;`;
  }

  // ── Body ──
  const body = document.getElementById('post-sidebar-body');
  if (!body) return;

  let html = '';

  if (postType === 'offer') {
    // Spare room post
    html += `<div class="post-sidebar-section">
      <div class="post-sidebar-label">Location</div>
      <div class="post-sidebar-value">📍 ${post.location || '—'}</div>
    </div>`;
    if (post.post_type) {
      html += `<div class="post-sidebar-section">
        <div class="post-sidebar-label">Room Type</div>
        <div class="post-sidebar-value">${post.post_type}</div>
      </div>`;
    }
    if (post.body) {
      html += `<hr class="post-sidebar-divider">
      <div class="post-sidebar-section">
        <div class="post-sidebar-label">About This Space</div>
        <div class="post-sidebar-value">${post.body}</div>
      </div>`;
    }
  } else {
    // Stranded post
    const needsList = (post.needs || []).map(n => NEED_LABELS[n] || n).join(', ');
    html += `<div class="post-sidebar-section">
      <div class="post-sidebar-label">Currently At</div>
      <div class="post-sidebar-value">📍 ${post.current_location || post.location || '—'}</div>
    </div>`;
    html += `<div class="post-sidebar-section">
      <div class="post-sidebar-label">Trying to Reach</div>
      <div class="post-sidebar-value">✈ <strong style="color:#fff">${post.destination || '—'}</strong>${post.dest_airport ? ' <span style="background:rgba(255,255,255,.1);padding:.1rem .4rem;border-radius:4px;font-size:.7rem;font-weight:600">'+post.dest_airport+'</span>' : ''}</div>
    </div>`;
    if (post.group_size > 1 || post.nationality) {
      html += `<div class="post-sidebar-section">
        <div class="post-sidebar-label">Group</div>
        <div class="post-sidebar-value">${post.group_size > 1 ? post.group_size + ' people' : '1 person'}${post.nationality ? ' &middot; ' + post.nationality : ''}</div>
      </div>`;
    }
    if (needsList) {
      html += `<div class="post-sidebar-section">
        <div class="post-sidebar-label">Needs</div>
        <div class="post-sidebar-value" style="color:#e67e22">${needsList}</div>
      </div>`;
    }
    if (post.stranded_since) {
      html += `<div class="post-sidebar-section">
        <div class="post-sidebar-label">Stranded Since</div>
        <div class="post-sidebar-value">${new Date(post.stranded_since).toLocaleDateString()}</div>
      </div>`;
    }
    if (post.details) {
      html += `<hr class="post-sidebar-divider">
      <div class="post-sidebar-section">
        <div class="post-sidebar-label">Details</div>
        <div class="post-sidebar-value">${post.details}</div>
      </div>`;
    }
  }

  html += `<hr class="post-sidebar-divider">`;
  html += `<div style="display:flex;flex-direction:column;gap:.5rem">`;
  html += buildContactButtons(post.contact, post.xhandle, post.name);
  html += postType === 'offer'
    ? buildTipButton(post.xhandle, !!post.user_id)
    : buildSendHelpButton(post.xhandle, !!post.user_id);
  html += buildFlagButton(postType === 'offer' ? 'help_posts' : 'stranded_people', post.id);
  html += `</div>`;

  body.innerHTML = html;

  // Open
  const sb = document.getElementById('post-sidebar');
  if (sb) sb.classList.add('open');
  document.getElementById('map-view')?.style.setProperty('--right-sidebar-w', '320px');

  // Close on bare map click
  if (window._crisisMap && !window._crisisMap._postSidebarClose) {
    window._crisisMap._postSidebarClose = function() { closePostSidebar(); };
    window._crisisMap.on('click', window._crisisMap._postSidebarClose);
  }
}

function closePostSidebar() {
  const sb = document.getElementById('post-sidebar');
  if (sb) sb.classList.remove('open');
  document.getElementById('map-view')?.style.setProperty('--right-sidebar-w', '0px');
  if (window._crisisMap && window._crisisMap._postSidebarClose) {
    window._crisisMap.off('click', window._crisisMap._postSidebarClose);
    window._crisisMap._postSidebarClose = null;
  }
}

function closePinSidebar() {
  const sb = document.getElementById('pin-sidebar');
  if (sb) sb.classList.remove('open');
  document.getElementById('map-view')?.style.setProperty('--right-sidebar-w', '0px');
  // Release locked hover state
  document.querySelectorAll('.gd-active').forEach(el => el.classList.remove('gd-active'));
  _activePopupIata  = '';
  _activePopupCircle = null;
  // Remove map close listener
  if (window._crisisMap && window._crisisMap._pinSidebarClose) {
    window._crisisMap.off('click', window._crisisMap._pinSidebarClose);
    window._crisisMap._pinSidebarClose = null;
  }
  clearGlobalArcs(true);
  drawGlobalRouteArcs(window._crisisMap, _globalDisruptions);
  drawMERouteArcs(window._crisisMap);
}

function drawPopupArcs(iata, mode) {
  const ap = typeof findAirport === 'function' ? findAirport(iata) : null;
  if (!ap) return;
  
  const maps = [window._crisisMap, window._mobileMap].filter(Boolean);
  const isMEAirport = AIRPORT_DATA.some(a => (a.iata || a.code) === iata);
  
  if (mode === 'leave') {
    if (isMEAirport) {
      // ME airport: draw arcs FROM this hub TO affected global destinations
      const outboundDests = (_meOutbound && _meOutbound[iata]) || [];
      if (!outboundDests.length) return;
      const maxC = Math.max(...outboundDests.map(d => d.cancelled || 1), 1);
      for (const map of maps) {
        for (const d of outboundDests) {
          const destAp = typeof findAirport === 'function' ? findAirport(d.iata) : null;
          if (!destAp) continue;
          const weight = 1 + ((d.cancelled || 1) / maxC) * 4;
          const opacity = 0.2 + ((d.cancelled || 1) / maxC) * 0.35;
          const arc = generateArc([ap.lat, ap.lng], [destAp.lat, destAp.lng], 30);
          const line = L.polyline(arc, { color: accentRgba(opacity), weight, interactive: false }).addTo(map);
          _globalArcLines.push(line);
        }
      }
    } else {
      // Global airport: draw arcs FROM this airport TO ME hubs
      const gData = _globalDisruptions.find(g => g.iata === iata);
      if (!gData) return;
      const routes = gData.routes || [];
      const hubs = routes.length ? routes.map(r => r.hub) : (gData.me_hubs || []);
      const maxC = Math.max(...(routes.length ? routes.map(r => r.cancelled || 1) : [1]), 1);
      
      for (const map of maps) {
        for (let i = 0; i < hubs.length; i++) {
          const hubIata = routes[i] ? routes[i].hub : hubs[i];
          const routeC = routes[i] ? (routes[i].cancelled || 1) : 1;
          let hubCoords = null;
          if (typeof ME_AIRPORTS !== 'undefined' && ME_AIRPORTS[hubIata]) {
            hubCoords = [ME_AIRPORTS[hubIata].lat, ME_AIRPORTS[hubIata].lng];
          } else {
            const ad = AIRPORT_DATA.find(a => (a.iata || a.code) === hubIata);
            if (ad) hubCoords = ad.coords;
          }
          if (!hubCoords) continue;
          
          const weight = 1 + (routeC / maxC) * 4;
          const opacity = 0.2 + (routeC / maxC) * 0.35;
          const arc = generateArc([ap.lat, ap.lng], hubCoords, 30);
          const line = L.polyline(arc, { color: accentRgba(opacity), weight, interactive: false }).addTo(map);
          _globalArcLines.push(line);
        }
      }
    }
  } else {
    // 'home' or 'flyin'
    if (isMEAirport) {
      // ME airport "flying in": draw arcs FROM global origins TO this hub
      // Use _globalDisruptions (built from DB route_daily, all days since CRISIS_START)
      let inbound = _globalDisruptions.filter(g => !g.isME && (g.me_hubs || []).includes(iata));
      // Fall back to _meOutbound for minor hubs
      if (!inbound.length && _meOutbound && _meOutbound[iata]) {
        inbound = _meOutbound[iata].map(d => ({ iata: d.iata, cancelled: d.cancelled, stranded: d.stranded }));
      }
      if (!inbound.length) return;
      const maxC = Math.max(...inbound.map(g => g.cancelled || 1), 1);
      for (const map of maps) {
        for (const g of inbound) {
          const origAp = typeof findAirport === 'function' ? findAirport(g.iata) : null;
          if (!origAp) continue;
          const weight = 1 + ((g.cancelled || 1) / maxC) * 4;
          const opacity = 0.2 + ((g.cancelled || 1) / maxC) * 0.35;
          const arc = generateArc([origAp.lat, origAp.lng], [ap.lat, ap.lng], 30);
          const line = L.polyline(arc, { color: accentRgba(opacity), weight, interactive: false }).addTo(map);
          _globalArcLines.push(line);
        }
      }
    } else {
      // Global airport "home": draw arcs FROM ME hubs TO this airport
      const rev = _computeReverseCached(iata);
      if (!rev.length) return;
      const maxC = Math.max(...rev.map(r => r.cancelled || 1), 1);
      
      for (const map of maps) {
        for (const r of rev) {
          if (!r.lat || !r.lng) continue;
          const weight = 1 + ((r.cancelled || 1) / maxC) * 4;
          const opacity = 0.2 + ((r.cancelled || 1) / maxC) * 0.35;
          const arc = generateArc([r.lat, r.lng], [ap.lat, ap.lng], 30);
          const line = L.polyline(arc, { color: accentRgba(opacity), weight, interactive: false }).addTo(map);
          _globalArcLines.push(line);
        }
      }
    }
  }
}

function renderGlobalDisruptions(map, data) {
  if (!map) return;
  const disruptions = data || _globalDisruptions;
  if (!disruptions || !disruptions.length) return;

  const isMobileMap = (map === window._mobileMap);

  // Remove existing cluster for this map
  const existingCluster = isMobileMap ? window._mGlobalCluster : window._globalCluster;
  if (existingCluster) { try { map.removeLayer(existingCluster); } catch(e) {} }

  const cluster = L.markerClusterGroup({
    maxClusterRadius: function(zoom) {
      // Wide radius zoomed out = continent blobs; tight zoomed in = per-airport
      if (zoom <= 2)  return 220;
      if (zoom <= 3)  return 160;
      if (zoom <= 4)  return 100;
      if (zoom <= 5)  return 60;
      return 30;
    },
    spiderfyOnMaxZoom: false,
    showCoverageOnHover: false,
    zoomToBoundsOnClick: true,
    disableClusteringAtZoom: 7,
    animate: true,
    iconCreateFunction: function(c) {
      const markers = c.getAllChildMarkers();
      const totalStranded = markers.reduce((s, m) => s + (m.options.strandedEst || 0), 0);
      const label = totalStranded >= 1000000
        ? (totalStranded / 1000000).toFixed(1) + 'M'
        : totalStranded >= 1000
          ? Math.round(totalStranded / 1000) + 'k'
          : Math.round(totalStranded).toLocaleString();
      const count = markers.length;
      // Size tiers based on stranded estimate — larger on mobile
      const mob = (typeof isMob === 'function' && isMob());
      let sz, ring;
      if (totalStranded >= 5000000)      { sz = 110; ring = 16; }
      else if (totalStranded >= 1000000) { sz = 90;  ring = 12; }
      else if (totalStranded >= 500000)  { sz = 74;  ring = 10; }
      else if (totalStranded >= 100000)  { sz = 60;  ring = 8;  }
      else if (totalStranded >= 10000)   { sz = 48;  ring = 6;  }
      else                               { sz = 36;  ring = 4;  }
      if (mob) { sz = Math.round(sz * 1.3); ring = Math.round(ring * 1.3); }
      const html =
        '<div class="gd-cluster" style="width:'+sz+'px;height:'+sz+'px">' +
          '<div class="gd-cluster-ring" style="inset:-'+ring+'px"></div>' +
          '<div class="gd-cluster-inner">' +
            '<div class="gd-cluster-num">'+label+'</div>' +
            '<div class="gd-cluster-lbl">impacted</div>' +
          '</div>' +
        '</div>';
      return L.divIcon({ html, className: '', iconSize: [sz, sz], iconAnchor: [sz/2, sz/2] });
    }
  });

  for (const g of disruptions) {
    const ap = typeof findAirport === 'function' ? findAirport(g.iata) : null;
    if (!ap) continue;

    const c = g.cancelled || 0;
    const strandedEst = g.stranded || Math.round(c * 185);

    // Size tiers for individual dot
    let radius, opacity, borderW;
    if (c >= 5000)      { radius = 22; opacity = 0.44; borderW = 3;   }
    else if (c >= 1000) { radius = 16; opacity = 0.36; borderW = 2.5; }
    else if (c >= 500)  { radius = 13; opacity = 0.32; borderW = 2;   }
    else if (c >= 200)  { radius = 10; opacity = 0.28; borderW = 1.5; }
    else if (c >= 50)   { radius = 7;  opacity = 0.24; borderW = 1.5; }
    else                { radius = 5;  opacity = 0.20; borderW = 1;   }

    const labelK = strandedEst >= 1000000
      ? (strandedEst / 1000000).toFixed(1) + 'M'
      : strandedEst >= 1000
        ? Math.round(strandedEst / 1000) + 'k'
        : strandedEst.toLocaleString();

    // All airports show their impact number
    const mob = isMobileMap;
    if (mob) radius = Math.round(radius * 1.2);
    const sz = Math.max(radius * 2, mob ? 50 : 54);
    const ringInset = mob ? (c >= 200 ? 8 : 6) : 6;
    const dotHtml =
      '<div class="gd-cluster" style="width:'+sz+'px;height:'+sz+'px">' +
        '<div class="gd-cluster-ring" style="inset:-'+ringInset+'px"></div>' +
        '<div class="gd-cluster-inner">' +
          '<div class="gd-cluster-num">'+labelK+'</div>' +
          '<div class="gd-cluster-lbl">impacted</div>' +
        '</div>' +
      '</div>';

    const icon = L.divIcon({
      html: dotHtml,
      className: '',
      iconSize: [sz, sz],
      iconAnchor: [sz/2, sz/2],
    });

    const marker = L.marker([ap.lat, ap.lng], {
      icon,
      strandedEst,
      pane: 'airportPane',
    });

    if (isMobileMap) {
      marker.on('click', function() {
        _activePopupCircle = marker;
        _activePopupIata = g.iata;
        _activePopupMode = 'leave';
        clearGlobalArcs(true);
        openMPinSheet(buildDualPopup(g.iata));
        drawPopupArcs(g.iata, 'leave');
      });
    } else {
      let _dragged = false;
      marker.on('mousedown', function() { _dragged = false; });
      marker.on('mousemove', function() { _dragged = true; });
      marker.on('click', function(e) {
        if (_dragged) { _dragged = false; return; }
        L.DomEvent.stopPropagation(e);
        closePostSidebar();
        _activePopupCircle = marker;
        openPinSidebar(g.iata);
      });
    }

    cluster.addLayer(marker);
    _globalPins.push(marker);
  }

  map.addLayer(cluster);
  if (isMobileMap) window._mGlobalCluster = cluster;
  else window._globalCluster = cluster;
}


// ============================================================
// CONTACT BUTTONS + TIP TWEET HELPERS
// ============================================================
function buildContactButtons(contact, xhandle, name) {
  if (!contact && !xhandle) return '';
  const c = (contact || '').trim();
  const btns = [];
  const s = 'display:flex;align-items:center;justify-content:center;width:32px;height:28px;border-radius:6px;text-decoration:none;background:#222;border:1px solid rgba(255,255,255,.08);';
  const emailIco = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 7l-10 7L2 7"/></svg>';
  const phoneIco = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>';
  const tgIco = '<svg width="14" height="14" viewBox="0 0 24 24" fill="#fff"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.96 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>';
  const xIco = '<svg width="13" height="13" viewBox="0 0 24 24" fill="#fff"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>';

  const emailMatch = c.match(/[\w.-]+@[\w.-]+\.\w+/);
  if (emailMatch) btns.push(`<a href="mailto:${emailMatch[0]}" style="${s}" title="${emailMatch[0]}">${emailIco}</a>`);

  const phoneMatch = c.match(/\+?[\d\s\-().]{7,}/);
  if (phoneMatch) {
    const digits = phoneMatch[0].replace(/[\s\-().]/g, '');
    btns.push(`<a href="tel:${digits}" style="${s}" title="Call ${digits}">${phoneIco}</a>`);
  }

  const tgMatch = c.match(/@([A-Za-z0-9_]{3,})/);
  if (tgMatch) btns.push(`<a href="https://t.me/${tgMatch[1]}" target="_blank" style="${s}" title="@${tgMatch[1]}">${tgIco}</a>`);

  if (xhandle) btns.push(`<a href="https://x.com/${xhandle}" target="_blank" style="${s}" title="@${xhandle}">${xIco}</a>`);

  if (!btns.length) return '';
  return `<div style="margin-top:.5rem"><div style="font-size:.5rem;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#fff;margin-bottom:.25rem">${name ? "CONTACT " + name.toUpperCase() : "CONTACT"}</div><div style="display:flex;gap:3px">${btns.join('')}</div></div>`;
}

function buildTipButton(xhandle, hasUserId) {
  const tipIcon = '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>';
  if (!xhandle || !hasUserId) return '';
  const tweetText = encodeURIComponent(`@bankrbot Tip 1 $HELP to @${xhandle}`);
  return `<a href="https://x.com/intent/tweet?text=${tweetText}" target="_blank" style="display:flex;align-items:center;justify-content:center;gap:4px;margin-top:.4rem;padding:.32rem .65rem;background:#3498ec;color:#fff;font-size:.66rem;font-weight:700;border-radius:6px;text-decoration:none;font-family:Inter,sans-serif">${tipIcon} Tip $HELP</a>`;
}

function buildSendHelpButton(xhandle, hasUserId) {
  const tipIcon = '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>';
  if (!xhandle || !hasUserId) return '';
  const tweetText = encodeURIComponent(`@bankrbot Tip 1 $HELP to @${xhandle}`);
  return `<a href="https://x.com/intent/tweet?text=${tweetText}" target="_blank" style="display:flex;align-items:center;justify-content:center;gap:4px;margin-top:.4rem;padding:.32rem .65rem;background:#ec3452;color:#fff;font-size:.66rem;font-weight:700;border-radius:6px;text-decoration:none;font-family:Inter,sans-serif">${tipIcon} Send $HELP</a>`;
}

// Compact inline contact icons for discovery cards
function buildContactIcons(contact, xhandle, name) {
  const c = (contact || '').trim();
  const icons = [];
  const is = 'display:inline-flex;align-items:center;justify-content:center;width:26px;height:26px;border-radius:6px;text-decoration:none;background:rgba(255,255,255,.08);';
  const emailIco = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 7l-10 7L2 7"/></svg>';
  const phoneIco = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>';
  const tgIco = '<svg width="12" height="12" viewBox="0 0 24 24" fill="#fff"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.96 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>';
  const xIco = '<svg width="11" height="11" viewBox="0 0 24 24" fill="#fff"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>';
  const emailMatch = c.match(/[\w.-]+@[\w.-]+\.\w+/);
  if (emailMatch) icons.push(`<a href="mailto:${emailMatch[0]}" style="${is}" title="${emailMatch[0]}">${emailIco}</a>`);
  const phoneMatch = c.match(/\+?[\d\s\-().]{7,}/);
  if (phoneMatch) icons.push(`<a href="tel:${phoneMatch[0].replace(/[\s\-().]/g,'')}" style="${is}" title="Call">${phoneIco}</a>`);
  const tgMatch = c.match(/@([A-Za-z0-9_]{3,})/);
  if (tgMatch) icons.push(`<a href="https://t.me/${tgMatch[1]}" target="_blank" style="${is}" title="@${tgMatch[1]}">${tgIco}</a>`);
  if (xhandle) icons.push(`<a href="https://x.com/${xhandle}" target="_blank" style="${is}" title="@${xhandle}">${xIco}</a>`);
  if (!icons.length) return '';
  const firstName = (name || 'them').split(' ')[0];
  return `<div style="font-size:.55rem;color:rgba(255,255,255,.35);margin-top:.2rem">Contact ${firstName} via <span style="display:inline-flex;gap:3px;vertical-align:middle;margin-left:2px">${icons.join('')}</span></div>`;
}

function buildFlagButton(table, id) {
  return `<button onclick="event.stopPropagation();flagPost('${table}','${id}')" style="display:inline-flex;align-items:center;gap:3px;margin-top:.35rem;padding:.2rem .5rem;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.08);border-radius:5px;color:rgba(255,255,255,.3);font-size:.55rem;font-weight:600;cursor:pointer;font-family:Inter,sans-serif" title="Flag for review"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg> Flag</button>`;
}

// ── User dot builder (matches IMPACTED dot style) ────────────
function buildUserDot(type, num, subtitle, minSz) {
  // type: 'offer' (blue), 'stranded' (red), 'success' (green), 'pet' (amber)
  const colors = {
    offer:    { bg:'rgba(52,152,236,.36)',  border:'rgba(52,152,236,.70)',  ring:'rgba(52,152,236,.24)' },
    stranded: { bg:'rgba(236,52,82,.36)',   border:'rgba(236,52,82,.70)',   ring:'rgba(236,52,82,.24)' },
    success:  { bg:'rgba(34,197,94,.36)',   border:'rgba(34,197,94,.70)',   ring:'rgba(34,197,94,.24)' },
    pet:      { bg:'rgba(255,159,28,.36)',  border:'rgba(255,159,28,.80)',  ring:'rgba(255,159,28,.24)' },
  };
  const c = colors[type] || colors.offer;
  const label = num >= 1000000 ? (num/1000000).toFixed(1)+'M' : num >= 1000 ? Math.round(num/1000)+'k' : num.toString();
  const sz = Math.max(minSz || 50, num >= 100 ? 56 : num >= 10 ? 52 : 50);
  const ring = num >= 100 ? 8 : 6;
  const html = '<div class="gd-cluster gd-cluster--'+type+'" style="width:'+sz+'px;height:'+sz+'px;background:'+c.bg+';border:1.5px solid '+c.border+'">' +
    '<div class="gd-cluster-ring" style="inset:-'+ring+'px;border-color:'+c.ring+'"></div>' +
    '<div class="gd-cluster-inner"><div class="gd-cluster-num">'+label+'</div>' +
    '<div class="gd-cluster-lbl">'+subtitle+'</div></div></div>';
  return { html, sz };
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
    const story = _successByOffer[p.id];
    const isMatched = !!story; // story only exists if offer_confirmed=true
    const dotType = isMatched ? 'success' : 'offer';
    const dotLabel = isMatched ? 'story' : 'room';
    const _d = buildUserDot(dotType, 1, dotLabel, 50);
    const helpIcon = L.divIcon({
      className:'',
      html: _d.html,
      iconSize:[_d.sz,_d.sz],iconAnchor:[_d.sz/2,_d.sz/2]
    });
    const isMobileM = (map === window._mobileMap);
    const uid = p.id.slice(0,8);
    const toggleBar = story ? `
      <div class="success-popup-toggle spt-wrap-${uid}" style="margin-bottom:.5rem">
        <button class="spt-btn active" onclick="showSuccessTab(this,'story','${uid}')">✓ Success Story</button>
        <button class="spt-btn" onclick="showSuccessTab(this,'original','${uid}')">Original Post</button>
      </div>` : '';
    const storyTab = story ? buildSuccessTab(story, uid) : '';
    const originalStyle = story ? 'display:none' : '';
    const popHtml = `<div class="spt-wrap-${uid}" style="font-family:Inter,sans-serif">
        ${toggleBar}
        ${storyTab}
        <div data-sptab="original" style="${originalStyle}">
        <div style="font-size:.62rem;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#93c5fd;margin-bottom:.25rem">SPARE ROOM</div>
        <div style="font-weight:600;font-size:.95rem;margin-bottom:.2rem;color:#fff">${esc(p.name)} ${buildBadge(!!p.user_id)}</div>
        <div style="font-size:.82rem;color:rgba(255,255,255,.75);line-height:1.55;margin-bottom:.4rem">${esc(p.body)||''}</div>
        <div style="font-size:.72rem;color:rgba(255,255,255,.4);margin-bottom:.4rem">📍 ${esc(p.location)}</div>
        ${buildContactButtons(p.contact, p.xhandle, p.name)}
        ${buildTipButton(p.xhandle, !!p.user_id)}
        ${buildFlagButton('help_posts', p.id)}
        </div>
      </div>`;
    const m = L.marker([geo.lat,geo.lng],{icon:helpIcon});
    if (isMobileM) {
      m.on('click', function(e) { L.DomEvent.stopPropagation(e); openMPinSheet(popHtml); });
    } else {
      (function(post) {
        m.on('click', function(e) { L.DomEvent.stopPropagation(e); closePostSidebar(); openPostSidebar(post, post.type || 'offer'); });
      })(p);
    }
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
  document.querySelectorAll('.filter-bar .filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderResources();
}

function populateResourceDropdowns() {
  const stuckIn = document.getElementById('res-stuck-in');
  const from = document.getElementById('res-from');
  if (!stuckIn || !from) return;
  if (typeof EMBASSIES_BY_HOST === 'undefined') return;

  // "Stuck in" = host countries, ME first
  const meOrder = ['AE','SA','QA','BH','KW','OM','JO','IR','IQ','IL','LB'];
  const allHosts = Object.entries(EMBASSIES_BY_HOST).sort((a,b) => {
    const aMe = meOrder.indexOf(a[0]), bMe = meOrder.indexOf(b[0]);
    if (aMe >= 0 && bMe >= 0) return aMe - bMe;
    if (aMe >= 0) return -1;
    if (bMe >= 0) return 1;
    return a[1].name.localeCompare(b[1].name);
  });

  let stuckHtml = '<option value="">All countries</option>';
  stuckHtml += '<optgroup label="Middle East (Crisis Zone)">';
  for (const [cc, host] of allHosts) {
    if (meOrder.includes(cc)) {
      stuckHtml += `<option value="${cc}">${host.name} (${Object.keys(host.embassies).length} embassies)</option>`;
    }
  }
  stuckHtml += '</optgroup><optgroup label="Other Countries">';
  for (const [cc, host] of allHosts) {
    if (!meOrder.includes(cc)) {
      stuckHtml += `<option value="${cc}">${host.name} (${Object.keys(host.embassies).length})</option>`;
    }
  }
  stuckHtml += '</optgroup>';
  stuckIn.innerHTML = stuckHtml;

  // "From" = nationalities
  const natSet = new Set();
  for (const host of Object.values(EMBASSIES_BY_HOST)) {
    for (const cc of Object.keys(host.embassies)) natSet.add(cc);
  }
  const nats = Array.from(natSet).map(cc => {
    const n = (typeof EMB_NATIONS !== 'undefined' && EMB_NATIONS[cc]) || { flag: '', name: cc };
    return { cc, name: n.name, flag: n.flag };
  }).sort((a, b) => a.name.localeCompare(b.name));

  let fromHtml = '<option value="">All nationalities</option>';
  for (const n of nats) {
    // Count how many countries have this embassy
    let count = 0;
    for (const host of Object.values(EMBASSIES_BY_HOST)) {
      if (host.embassies[n.cc]) count++;
    }
    fromHtml += `<option value="${n.cc}">${n.flag} ${n.name} (in ${count} countries)</option>`;
  }
  from.innerHTML = fromHtml;
}

function renderResources() {
  const grid = document.getElementById('resources-grid');
  if (!grid) return;
  let html = '';
  
  const stuckIn = document.getElementById('res-stuck-in')?.value || '';
  const from = document.getElementById('res-from')?.value || '';
  const search = (document.getElementById('res-search')?.value || '').toLowerCase().trim();
  
  // Map COUNTRIES.id to embassy host country code
  const ID_TO_CC = {uae:'AE',bahrain:'BH',kuwait:'KW',qatar:'QA',oman:'OM',saudi:'SA',iran:'IR',iraq:'IQ',israel:'IL'};
  
  if (_resFilter==='all'||_resFilter==='embassy') {
    // Country situation cards (advisory, airspace, borders)
    if (!stuckIn && !from && !search) {
      html += COUNTRIES.map(c => {
        const embCC = ID_TO_CC[c.id];
        const hasFullDir = typeof EMBASSIES_BY_HOST !== 'undefined' && embCC && EMBASSIES_BY_HOST[embCC];
        const embCount = hasFullDir ? Object.keys(EMBASSIES_BY_HOST[embCC].embassies).length : 0;
        const embSection = hasFullDir
          ? `<div class="embassy-section"><a href="javascript:void(0)" onclick="document.getElementById('res-stuck-in').value='${embCC}';renderResources()" style="display:block;text-align:center;padding:.45rem;background:rgba(52,152,236,.1);border:1px solid rgba(52,152,236,.18);border-radius:8px;color:#3498ec;font-size:.72rem;font-weight:700;text-decoration:none;text-transform:uppercase;letter-spacing:.03em">\ud83c\udfdb\ufe0f ${embCount} Embassy contacts — tap to filter</a></div>`
          : `<div class="embassy-section"><div class="embassy-title">Emergency Contacts</div>${Object.entries(c.embassy).map(([key,info]) => {
              const M = EMBASSY_META[key]||{flag:'',role:key.toUpperCase()};
              const phone = info.phone||info.alt||null;
              return '<div class="embassy-row"><div style="flex:1"><span class="embassy-name">'+M.flag+' '+M.role+'</span>'+(info.note?'<div class="embassy-note">'+info.note+'</div>':'')+'</div>'+(phone?'<a class="call-btn" href="tel:'+phone.replace(/[\s\-()]/g,'')+'">'+phone+'</a>':'')+'</div>';
            }).join('')}</div>`;
        return `<div class="country-card ${c.status}" id="card-${c.id}">
          <div class="card-header"><div class="card-name">${c.name}</div><span class="status-badge ${c.status}">${c.status.toUpperCase()}</span></div>
          <div class="card-advisory">${c.advisory}</div>
          <div class="info-row"><span class="info-label">Airspace</span><span style="color:${c.airspace==='CLOSED'?'var(--danger)':c.airspace.includes('OPEN')?'var(--safe)':'var(--warn)'};font-weight:600">${c.airspace}</span></div>
          ${c.borders.map(b=>`<div class="info-row"><span class="info-label">${b.route}</span><span style="color:${b.status==='safe'?'var(--safe)':b.status==='warn'?'var(--warn)':'var(--danger)'};font-weight:600">${b.status.toUpperCase()}</span></div>`).join('')}
          ${embSection}
          ${c.ngos?.length?`<div class="ngo-tags">${c.ngos.map(n=>`<span class="ngo-tag">${n}</span>`).join('')}</div>`:''}
          ${c.telegram?`<a class="telegram-link" href="${c.telegram}" target="_blank">\u2192 Telegram group</a>`:''}
        </div>`;
      }).join('');
    }
    
    // Embassy directory — filtered by dropdowns and search
    if (typeof EMBASSIES_BY_HOST !== 'undefined') {
      const hosts = stuckIn ? [[stuckIn, EMBASSIES_BY_HOST[stuckIn]]] : Object.entries(EMBASSIES_BY_HOST);
      let matchCount = 0;

      for (const [cc, host] of hosts) {
        if (!host) continue;
        let entries = Object.entries(host.embassies);
        
        // Filter by nationality
        if (from) entries = entries.filter(([natCC]) => natCC === from);
        
        // Filter by search
        if (search) {
          entries = entries.filter(([natCC, info]) => {
            const nat = (typeof EMB_NATIONS !== 'undefined' && EMB_NATIONS[natCC]) || {name: natCC};
            return nat.name.toLowerCase().includes(search) ||
                   host.name.toLowerCase().includes(search) ||
                   (info.phone || '').includes(search) ||
                   natCC.toLowerCase() === search;
          });
        }
        
        if (!entries.length) continue;
        matchCount += entries.length;

        html += `<div class="country-card warn" id="emb-${cc}" style="grid-column:1/-1">
          <div class="card-header"><div class="card-name">${host.name}</div><span class="status-badge" style="background:rgba(52,152,236,.15);color:#3498ec">${entries.length} EMBASSIES</span></div>
          ${host.emergency ? '<div style="font-size:.78rem;color:rgba(255,255,255,.5);margin:.3rem 0">Emergency: <strong style="color:#ec3452">'+host.emergency+'</strong></div>' : ''}
          ${host.crisis_note ? '<div style="font-size:.72rem;color:rgba(255,255,255,.35);font-style:italic;margin-bottom:.4rem">'+host.crisis_note+'</div>' : ''}
          <div class="embassy-section">`;
        for (const [natCC, info] of entries) {
          const nat = (typeof EMB_NATIONS !== 'undefined' && EMB_NATIONS[natCC]) || {flag:'',name:natCC};
          const phone = info.phone || null;
          html += `<div class="embassy-row">
            <div style="flex:1">
              <span class="embassy-name">${nat.flag} ${nat.name}</span>
              ${info.note ? '<div class="embassy-note">'+info.note+'</div>' : ''}
            </div>
            <div style="display:flex;gap:.3rem;align-items:center">
              ${phone ? '<a class="call-btn" href="tel:'+phone.replace(/[\s\-()]/g,'')+'">'+phone+'</a>' : ''}
              ${info.web ? '<a href="'+info.web+'" target="_blank" style="font-size:.65rem;color:#3498ec;text-decoration:none;white-space:nowrap">[web]</a>' : ''}
            </div>
          </div>`;
        }
        html += '</div></div>';
      }

      // Summary
      if (stuckIn || from || search) {
        const summaryColor = matchCount > 0 ? '#3498ec' : 'rgba(255,255,255,.3)';
        html = `<div style="grid-column:1/-1;font-size:.78rem;color:${summaryColor};font-weight:600;margin-bottom:.3rem">${matchCount} result${matchCount !== 1 ? 's' : ''} found</div>` + html;
      }
    }
    
    // Global emergency hotlines (show when no filters)
    if (!stuckIn && !from && !search && typeof GLOBAL_EMERGENCY !== 'undefined') {
      html += `<div class="country-card safe" id="emb-global" style="grid-column:1/-1;border-color:rgba(52,152,236,.2)">
        <div class="card-header"><div class="card-name">Global Emergency Hotlines</div><span class="status-badge safe">24/7</span></div>
        <div style="font-size:.78rem;color:rgba(255,255,255,.45);margin-bottom:.5rem">Call your country's crisis line from anywhere</div>
        <div class="embassy-section">`;
      for (const [natCC, info] of Object.entries(GLOBAL_EMERGENCY)) {
        const nat = (typeof EMB_NATIONS !== 'undefined' && EMB_NATIONS[natCC]) || {flag:'',name:natCC};
        html += `<div class="embassy-row">
          <div style="flex:1"><span class="embassy-name">${nat.flag} ${nat.name}</span>${info.note ? '<div class="embassy-note">'+info.note+'</div>' : ''}</div>
          <div style="display:flex;gap:.3rem;align-items:center">
            <a class="call-btn" href="tel:${info.phone.replace(/[\s\-()]/g,'')}">${info.phone}</a>
            ${info.web ? '<a href="'+info.web+'" target="_blank" style="font-size:.65rem;color:#3498ec;text-decoration:none">[web]</a>' : ''}
          </div>
        </div>`;
      }
      html += '</div></div>';
    }

    if (!stuckIn && !from && !search) {
      html += WORLDWIDE.map(r=>`<div class="country-card safe" id="card-${r.id}"><div class="card-name" style="margin-bottom:.5rem">Worldwide: ${r.name}</div><div class="card-advisory">${r.note}</div>${r.contacts.map(c=>`<div class="info-row"><span class="info-label">${c.label}</span><span>${c.value}</span></div>`).join('')}</div>`).join('');
    }
  }
  if (_resFilter==='all'||_resFilter==='ngo'||_resFilter==='info'||_resFilter==='relief'||_resFilter==='legal'||_resFilter==='tools') {
    if (!stuckIn && !from && !search) {
      const typeMap = {
        'ngo':    ['NGO','Worker Rights','Mental Health','Community'],
        'info':   ['Government','Info'],
        'relief': ['Relief','Financial'],
        'legal':  ['Legal'],
        'tools':  ['Info','Community'],
      };

      let filtered = NGOS;
      if (_resFilter !== 'all') {
        const allowed = typeMap[_resFilter] || [];
        filtered = NGOS.filter(r => allowed.includes(r.type));
      }

      // Group by type
      const groups = {};
      for (const r of filtered) {
        if (!groups[r.type]) groups[r.type] = [];
        groups[r.type].push(r);
      }

      for (const [type, items] of Object.entries(groups)) {
        html += `<div style="grid-column:1/-1;margin-top:1rem;margin-bottom:.3rem"><div style="font-size:.7rem;font-weight:800;text-transform:uppercase;letter-spacing:.08em;color:rgba(255,255,255,.35)">${type}</div></div>`;
        html += items.map(r => `<div class="resource-card">
          <div class="resource-type">${r.type}</div>
          <div class="resource-name">${r.name}</div>
          <div class="resource-desc">${r.desc}</div>
          <div style="display:flex;gap:.4rem;align-items:center;flex-wrap:wrap;margin-top:.4rem">
            <a class="resource-link" href="${r.url}" target="_blank" rel="noopener">Open \u2192</a>
            ${r.phone ? `<a href="tel:${r.phone.replace(/[\s\-()]/g,'')}" style="font-size:.7rem;color:#22c55e;text-decoration:none;font-weight:600;display:inline-flex;align-items:center;gap:.2rem"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>${r.phone}</a>` : ''}
          </div>
        </div>`).join('');
      }
    }
  }
  grid.innerHTML = html || '<div class="empty-state" style="min-height:50vh;display:flex;align-items:center;justify-content:center">No items match this filter.</div>';
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
      <div class="post-loc">📍 ${esc(p.location)}</div>
      <div class="post-body">${esc(p.body)}</div>
      <div class="post-footer">
        <span style="font-size:.77rem;color:var(--muted)">${esc(p.name)} ${buildBadge(!!p.user_id)}</span>
      </div>
      ${buildContactButtons(p.contact, p.xhandle, p.name)}
      ${buildTipButton(p.xhandle, !!p.user_id)}
      ${buildFlagButton('help_posts', p.id)}
    </div>`;
  }).join('');
}

async function submitPost(type) {
  if (!isLoggedIn()) { alert('Please sign in first to post.'); isMob()?mTab('profile',null):openFormSidebar('profile'); return; }
  if (type === 'offer') {
    const roleErr = await checkUserRole('offer');
    if (roleErr) { alert(roleErr); return; }
  }
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
  if(containsLink(b)){alert('Links are not allowed in posts. Please remove any URLs.');return;}
  if(!c){alert('Please link at least one contact method (Google or Telegram).');return;}
  if(!lat||!lng){alert('Please select a location from the dropdown suggestions.');return;}
  const btn=document.querySelector(`.submit-btn--${type}`); if(!btn)return;
  btn.textContent='Posting...'; btn.disabled=true;
  try {
    const{error}=await _sb.from('help_posts').insert({type,post_type:t,location:l,body:b,name:n,contact:c,xhandle:x||null,lat,lng,user_id:_currentUser.id,flagged:false,avatar_url:(_currentProfile&&_currentProfile.avatar_url)||''});
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
// Canonical stat values — set by refreshSitrep, used by refreshStrandedCount
// to prevent computeTotalStranded() from pulling in global airports and inflating the number
window._canonicalStranded  = null;
window._canonicalCancelled = null;
window._sitrepLoaded = false;

function animCount(id, target, dur) {
  // On first load skip animation — just set instantly to avoid count-up flash
  if (!window._sitrepLoaded) { setStatNow(id, target); return; }
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

// ── Digit flip animation ────────────────────────────────
// Builds a slot-machine style flip for each digit position.
function flipToNumber(containerId, targetNum) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const formatted = Math.round(targetNum).toLocaleString(); // e.g. "8,312,450"
  const charH = container.closest('.sitrep-num, .m-stat-num')?.offsetHeight || 38;

  container.innerHTML = '';

  // Build one column per character
  formatted.split('').forEach((ch, i) => {
    if (ch === ',' || ch === '.') {
      const sep = document.createElement('span');
      sep.className = 'flip-sep';
      sep.textContent = ch;
      container.appendChild(sep);
      return;
    }

    const finalDigit = parseInt(ch);
    const wrap = document.createElement('span');
    wrap.className = 'flip-digit-wrap';
    wrap.style.height = charH + 'px';

    const inner = document.createElement('span');
    inner.className = 'flip-digit-inner';

    // Stack: random digits for spinning, then the final digit at bottom
    const spinCount = 10 + Math.floor(Math.random() * 8);
    const digits = [];
    for (let s = 0; s < spinCount; s++) {
      digits.push(Math.floor(Math.random() * 10));
    }
    digits.push(finalDigit); // last one is the target

    digits.forEach(d => {
      const span = document.createElement('span');
      span.className = 'flip-char';
      span.style.height = charH + 'px';
      span.style.lineHeight = charH + 'px';
      span.textContent = d;
      inner.appendChild(span);
    });

    wrap.appendChild(inner);
    container.appendChild(wrap);

    // Animate: translate from top to final position, staggered per column
    const totalH  = charH * digits.length;
    const finalY  = -charH * spinCount; // land on last digit
    const delay   = i * 60 + Math.random() * 40; // cascade left→right
    const dur     = 520 + i * 40;

    // Start at top
    inner.style.transform = 'translateY(0)';

    setTimeout(() => {
      inner.style.transition = `transform ${dur}ms cubic-bezier(.15,.85,.35,1.05)`;
      inner.style.transform  = `translateY(${finalY}px)`;
    }, delay);
  });
}

function flipStrandedStats(targetNum) {
  flipToNumber('flip-stranded',   targetNum);
  flipToNumber('flip-stranded-m', targetNum);
}

function flyAndDismissOverlay() {
  console.log('[flyAndDismiss] called, overlay:', !!document.getElementById('intro-overlay'), 'dismissed:', document.getElementById('intro-overlay')?._dismissed);
  const overlay = document.getElementById('intro-overlay');
  if (!overlay || overlay._dismissed) { console.log('[flyAndDismiss] skipped (no overlay or already dismissed)'); return; }
  overlay._dismissed = true;

  const mob = window.innerWidth <= 600;

  // Target real icon IDs per platform
  const tgTargetId = mob ? 'mob-social-tg' : 'pc-social-tg';
  const xTargetId  = mob ? 'mob-social-x'  : 'pc-social-x';

  const introTg = document.getElementById('intro-icon-tg');
  const introX  = document.getElementById('intro-icon-x');
  const tgTarget = document.getElementById(tgTargetId);
  const xTarget  = document.getElementById(xTargetId);

  function flyIcon(introEl, targetEl, delay) {
    if (!introEl || !targetEl) return;
    const fromR = introEl.getBoundingClientRect();
    const toR   = targetEl.getBoundingClientRect();

    // Convert to position:fixed at current spot
    introEl.style.position   = 'fixed';
    introEl.style.left       = fromR.left + 'px';
    introEl.style.top        = fromR.top  + 'px';
    introEl.style.width      = fromR.width  + 'px';
    introEl.style.height     = fromR.height + 'px';
    introEl.style.margin     = '0';
    introEl.style.zIndex     = '100001';
    introEl.style.transition = 'none';
    document.body.appendChild(introEl); // pull out of overlay so it survives fade

    const dx = toR.left - fromR.left + (toR.width  - fromR.width)  / 2;
    const dy = toR.top  - fromR.top  + (toR.height - fromR.height) / 2;

    setTimeout(() => {
      introEl.style.transition = `transform .6s cubic-bezier(.4,0,.2,1), opacity .5s ease .25s`;
      introEl.style.transform  = `translate(${dx}px,${dy}px) scale(${toR.width / fromR.width})`;
      introEl.style.opacity    = '0';
      setTimeout(() => introEl.remove(), 900);
    }, delay);
  }

  // Brief pause so users can read the message, then fly
  setTimeout(() => {
    console.log('[flyAndDismiss] 400ms fired, tgTarget:', !!tgTarget, 'xTarget:', !!xTarget);
    flyIcon(introTg, tgTarget, 0);
    flyIcon(introX,  xTarget,  80);

    // Fade overlay slightly before icons fully land
    setTimeout(() => {
      console.log('[flyAndDismiss] fading overlay now');
      overlay.style.opacity          = '0';
      overlay.style.pointerEvents    = 'none';
      setTimeout(() => {
        console.log('[flyAndDismiss] removing overlay');
        overlay.remove();
        // iOS Safari: removing a backdrop-filter element can reset the GPU compositor,
        // wiping Leaflet SVG layers rendered while the overlay was live.
        // Two rAF calls give the browser time to settle before we re-render.
        // applyFilters() is the canonical full-repaint path — it handles pins,
        // arcs, clusters, and filter state in one shot for both maps.
        requestAnimationFrame(() => requestAnimationFrame(() => {
          if (window._mobileMap) window._mobileMap.invalidateSize();
          if (_globalDisruptions.length) {
            // Data is ready — full re-render restores anything the GPU reset wiped
            applyFilters();
          } else {
            // Data hasn't arrived yet; refreshSitrep's 1600ms callback will handle
            // the post-overlay re-render once _globalDisruptions is populated.
            // Still re-render stranded/help layers which may already have data.
            applyFilters();
          }
        }));
      }, 850);
    }, 120);
  }, 400);
}

async function refreshSitrep() {
  console.log('[refreshSitrep] start');
  const icon=document.getElementById('refresh-icon');
  if(icon) icon.classList.add('spinning');
  try {
  const liveStats = await fetchSitrepFromSupabase();
  const totalCancelled = AIRPORT_DATA.reduce((s,a)=>s+a.cancelled,0);
  const totalStranded  = AIRPORT_DATA.reduce((s,a)=>s+a.stranded,0);
  const airportsClosed = AIRPORT_DATA.filter(a=>a.status==='CLOSED').length;
  const vals = liveStats || {stranded:totalStranded,cancelled:totalCancelled,airports:airportsClosed,airspace:4};

  // ── Compute today vs. since-crisis totals ──────────────────
  // All figures now come from the unified pipeline (airport_daily + route_daily).
  // window._todayCancelledFlight and _todayStrandedPeople are set by fetchSitrepFromSupabase.
  const todayCancelled = window._todayCancelledFlight || 0;
  const todayStranded  = window._todayStrandedPeople  || 0;
  // Est. stranded = 20% of total (still actively waiting / without accommodation)
  const estStranded      = Math.round(vals.stranded * 0.20);
  const todayEstStranded = Math.round(todayStranded  * 0.20);

  setStatNow('stat-cancelled',vals.cancelled);
  setStatNow('stat-airports-closed',vals.airports);
  setStatNow('stat-airspace',vals.airspace);
  setStatNow('m-stat-cancelled',vals.cancelled);

  // Cache so refreshStrandedCount never recomputes from global arrays
  window._canonicalStranded  = vals.stranded;
  window._canonicalCancelled = vals.cancelled;

  // Slot-machine flip for the headline people-affected number
  flipStrandedStats(vals.stranded);

  animCount('stat-cancelled',vals.cancelled,800);
  animCount('stat-airports-closed',vals.airports,500);
  animCount('stat-airspace',vals.airspace,500);
  animCount('m-stat-cancelled',vals.cancelled,800);
  window._sitrepLoaded = true; // subsequent refreshes can animate
  updateFilterBadges();

  // Dismiss loading toast + shimmer
  const toast = document.getElementById('data-loading-toast');
  if (toast) toast.classList.add('toast-hidden');
  document.querySelectorAll('.stat-loading').forEach(el => el.classList.remove('stat-loading'));

  // Fly intro overlay icons to their real positions, then fade out
  console.log('[refreshSitrep] calling flyAndDismissOverlay');
  flyAndDismissOverlay();

  // ── Inject +Today labels ────────────────────────────────────
  function setToday(id, n, prefix='+') {
    const el = document.getElementById(id);
    if (el) el.textContent = n > 0 ? prefix + n.toLocaleString() + ' today' : '';
  }
  // Sitrep bar
  const sitrepTodayEl = document.getElementById('stat-stranded-today');
  const sitrepTodayLbl = document.getElementById('stat-stranded-today-label');
  if (sitrepTodayEl) sitrepTodayEl.textContent = todayStranded > 0 ? '+' + todayStranded.toLocaleString() : '';
  if (sitrepTodayLbl) sitrepTodayLbl.textContent = todayStranded > 0 ? '\u00a0today' : 'tap · see how';
  // Mobile stat bar
  const mTodayEl = document.getElementById('m-stranded-sub');
  if (mTodayEl) mTodayEl.textContent = todayStranded > 0 ? '+' + todayStranded.toLocaleString() + ' today' : '';
  // Filter sidebar (PC)
  const fpSt  = document.getElementById('fp-stat-stranded');
  const fpStT = document.getElementById('fp-stat-stranded-today');
  const fpCa  = document.getElementById('fp-stat-cancelled');
  const fpCaT = document.getElementById('fp-stat-cancelled-today');
  if (fpSt) fpSt.textContent = estStranded.toLocaleString();
  if (fpStT) fpStT.textContent = todayEstStranded > 0 ? '+' + todayEstStranded.toLocaleString() + ' today' : '';
  if (fpCa) fpCa.textContent = vals.cancelled.toLocaleString();
  if (fpCaT) fpCaT.textContent = todayCancelled > 0 ? '+' + todayCancelled.toLocaleString() + ' today' : '';

  // Mobile impact sheet (same values, separate IDs)
  const mFpSt  = document.getElementById('m-fp-stat-stranded');
  const mFpStT = document.getElementById('m-fp-stat-stranded-today');
  const mFpCa  = document.getElementById('m-fp-stat-cancelled');
  const mFpCaT = document.getElementById('m-fp-stat-cancelled-today');
  if (mFpSt)  mFpSt.textContent  = estStranded.toLocaleString();
  if (mFpStT) mFpStT.textContent = todayEstStranded > 0 ? '+' + todayEstStranded.toLocaleString() + ' today' : '';
  if (mFpCa)  mFpCa.textContent  = vals.cancelled.toLocaleString();
  if (mFpCaT) mFpCaT.textContent = todayCancelled > 0 ? '+' + todayCancelled.toLocaleString() + ' today' : '';

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

  // Render global disruption dots + arcs now that _globalDisruptions is populated.
  // Use requestAnimationFrame so Leaflet tile layers are committed before we add vector layers.
  requestAnimationFrame(() => {
    _globalPins.forEach(m => { [window._crisisMap, window._mobileMap].forEach(map => { if (map) try { map.removeLayer(m); } catch(e) {} }); });
    _globalPins = [];
    renderGlobalDisruptions(window._crisisMap, _globalDisruptions);
    renderGlobalDisruptions(window._mobileMap, _globalDisruptions);
    clearGlobalArcs();
    drawGlobalRouteArcs(window._crisisMap, _globalDisruptions);
    drawGlobalRouteArcs(window._mobileMap, _globalDisruptions);
    drawMERouteArcs(window._crisisMap);
    drawMERouteArcs(window._mobileMap);
    if (icon) icon.classList.remove('spinning');

    // Mobile: after data loads, fire a second full re-render timed to land AFTER the
    // intro overlay's ~1370ms dismissal window. This ensures arcs and pins survive the
    // iOS GPU compositor reset that backdrop-filter removal can trigger on SVG layers.
    // Always schedule the catch-up re-render, even if _mobileMap isn't ready yet.
    // If map init (double-rAF) hasn't fired yet, _mobileMap will be set by the time
    // this 1600ms timeout runs (double-rAF takes ~33ms, this is 1600ms).
    setTimeout(() => {
      if (window._mobileMap) {
        window._mobileMap.invalidateSize();
        applyFilters();
      }
    }, 1600);
  });
  } catch(e) {
    console.error('[refreshSitrep] uncaught error:', e);
  } finally {
    console.log('[refreshSitrep] finally — calling flyAndDismissOverlay');
    flyAndDismissOverlay();
    if(icon) icon.classList.remove('spinning');
  }
}

// ============================================================
// SUPABASE
// ============================================================
async function loadPosts() {
  if(!SB_ON)return;
  try {
    const{data}=await withTimeout(_sb.from('help_posts').select('id,type,post_type,location,body,name,contact,xhandle,lat,lng,user_id,created_at,avatar_url').eq('flagged',false).eq('type','offer').order('created_at',{ascending:false}).limit(100));
    if(data){posts=data;renderPosts();renderPostsOnMap(window._crisisMap||window._mobileMap);updateActionButtons();updateFilterBadges();}
  } catch(e) { console.warn('[loadPosts]', e.message); }
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

  // ── Critical: wait for the browser to paint the flex layout ──────────────
  // #m-shell starts as display:none. Setting it to flex and immediately calling
  // L.map() means Leaflet measures a 0×0 container — the SVG overlay is created
  // at zero size, so ALL vector layers (circle markers, polylines, arcs) are
  // invisible. Two rAF calls let the browser complete layout + paint first.
  requestAnimationFrame(() => requestAnimationFrame(() => {

    // If Leaflet already stamped this container, wipe it cleanly before re-init.
    const _mc = document.getElementById('m-crisis-map');
    if (_mc && _mc._leaflet_id) { delete _mc._leaflet_id; _mc.innerHTML = ''; }
    // If map object already exists, nothing to do.
    if (window._mobileMap) return;

    let mmap;
    try {
      mmap = L.map('m-crisis-map',{zoomControl:false,attributionControl:false}).setView([28,45],4);
    } catch(e) {
      console.error('[initMobile] L.map failed:', e.message);
      return;
    }

    // Assign immediately so any async callbacks that fire during init can find it,
    // and so a second rAF call won't re-enter.
    window._mobileMap = mmap;
    mmap.on('zoomend', () => applyFilters());

    try {
      window._mTile = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',{maxZoom:19}).addTo(mmap);

      mmap.createPane('worldwidePane');
      mmap.getPane('worldwidePane').style.zIndex = 580;
      mmap.createPane('airportGlowPane');
      mmap.getPane('airportGlowPane').style.zIndex = 620;
      mmap.createPane('airportPane');
      mmap.getPane('airportPane').style.zIndex = 630;
      mmap.createPane('countryPane');
      mmap.getPane('countryPane').style.zIndex = 640;

      _mk.country = [];
      _mk.worldwide = [];

      // COUNTRIES status dots suppressed — cluster system replaces these
      // WORLDWIDE static dots suppressed — replaced by live cluster system

      _mHelpCluster = L.markerClusterGroup({
        maxClusterRadius: 120,
        spiderfyOnMaxZoom: true,
        showCoverageOnHover: false,
        zoomToBoundsOnClick: true,
        disableClusteringAtZoom: 16,
        iconCreateFunction: function(c) {
          const count = c.getChildCount();
          const d = buildUserDot('offer', count, count === 1 ? 'room' : 'rooms', 50);
          return L.divIcon({ html: d.html, className: '', iconSize: [d.sz, d.sz], iconAnchor: [d.sz/2, d.sz/2] });
        }
      });
      mmap.addLayer(_mHelpCluster);

      renderStrandedOnMap(mmap, true);
      renderPostsOnMap(mmap);

      if (_globalDisruptions.length) {
        renderGlobalDisruptions(mmap, _globalDisruptions);
        clearGlobalArcs();
        drawGlobalRouteArcs(mmap, _globalDisruptions);
        drawMERouteArcs(mmap);
      }

      mRenderResources();

      // Mobile defaults to light map
      _mapDark = false;
      document.body.classList.add('map-light');
      document.querySelectorAll('.leaflet-control-zoom').forEach(el => el.classList.add('theme-light'));
      ['','m-'].forEach(prefix => {
        const sun = document.getElementById(prefix + 'theme-icon-sun');
        const moon = document.getElementById(prefix + 'theme-icon-moon');
        if (sun) sun.style.display = 'none';
        if (moon) moon.style.display = 'block';
      });

      // Mobile: turn off route arcs by default
      ['mfp-worldwide-arcs','mfp-show-success-arcs'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.checked = false;
      });

    } catch(e) {
      console.error('[initMobile] init error:', e.message, e.stack);
    }

  })); // end double-rAF
}

function mFilterMap(type){
  filterMap(type);
}

function openMFilterLegend(){ mTab('filters', null); }
function closeMFilterLegend(){ mSheetToggle(); }

const PHONE_SVG=`<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>`;

function openMCountryPopup(id){
  const c=COUNTRIES.find(x=>x.id===id); if(!c)return;
  const col=getSC()[c.status];
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

// ── Mobile pin bottom sheet ─────────────────────────────
function openMPinSheet(html) {
  const sheet    = document.getElementById('m-pin-sheet');
  const inner    = document.getElementById('m-pin-sheet-inner');
  const backdrop = document.getElementById('m-pin-sheet-backdrop');
  if (!sheet || !inner) return;
  inner.innerHTML = html;
  sheet.classList.add('open');
  if (backdrop) backdrop.classList.add('open');
  // Lock hover state on the clicked dot
  document.querySelectorAll('.gd-active').forEach(el => el.classList.remove('gd-active'));
  if (_activePopupCircle && _activePopupCircle._icon) {
    const dot = _activePopupCircle._icon.querySelector('.gd-cluster, .gd-single');
    if (dot) dot.classList.add('gd-active');
  }
}

function closeMPinSheet() {
  const sheet    = document.getElementById('m-pin-sheet');
  const backdrop = document.getElementById('m-pin-sheet-backdrop');
  if (sheet) sheet.classList.remove('open');
  if (backdrop) backdrop.classList.remove('open');
  // Release locked hover state
  document.querySelectorAll('.gd-active').forEach(el => el.classList.remove('gd-active'));
  // Clean up any active airport popup state
  if (_activePopupIata) {
    _activePopupIata = '';
    _activePopupMode = 'leave';
    clearGlobalArcs(true);
    drawGlobalRouteArcs(window._mobileMap, _globalDisruptions);
  }
}

// Used by switchPopupMode on mobile — refreshes pin sheet content without reopening
function refreshMPinSheet(html) {
  const inner = document.getElementById('m-pin-sheet-inner');
  if (inner && document.getElementById('m-pin-sheet').classList.contains('open')) {
    inner.innerHTML = html;
  }
}

function mTab(tab,btn){
  const sheet=document.getElementById('m-sheet');

  if(_mCurrentTab===tab&&tab!=='map'&&_mSheetOpen){
    _mSheetOpen=false;sheet.classList.remove('open');_mCurrentTab='map';
    document.querySelectorAll('.m-tab,.m-tab-spare').forEach(b=>b.classList.remove('active'));return;
  }
  document.querySelectorAll('.m-tab,.m-tab-spare').forEach(b=>b.classList.remove('active'));
  if(btn) btn.classList.add('active');
  _mCurrentTab=tab;
  if(tab==='map'){_mSheetOpen=false;sheet.classList.remove('open');}
  else if(tab==='resources') mShowSheetContent('resources','ADDITIONAL RESOURCES');
  else if(tab==='filters')   mShowSheetContent('filters','MAP FILTERS');
  else if(tab==='help-money') mShowSheetContent('help-money','$HELP');
  else if(tab==='stranded')  mShowSheetContent('stranded','I\'M STRANDED');
  else if(tab==='offer')     mShowSheetContent('offer','OFFER A SPARE ROOM');
  else if(tab==='pets')      mShowSheetContent('pets','STRANDED PETS');
  else if(tab==='profile')   { mShowSheetContent('profile','MY PROFILE'); renderMobileProfileView(); }
  else if(tab==='manage-room')     { mShowSheetContent('manage','MY ROOM'); renderManageDashboard('offer'); }
  else if(tab==='manage-stranded') { mShowSheetContent('manage','MY STATUS'); renderManageDashboard('stranded'); }
}

function mShowSheetContent(which,title){
  document.getElementById('m-resources-content').style.display=which==='resources'?'block':'none';
  document.getElementById('m-filters-content').style.display=which==='filters'?'block':'none';
  document.getElementById('m-help-money-content').style.display=which==='help-money'?'block':'none';
  document.getElementById('m-stranded-content').style.display=which==='stranded'?'block':'none';
  document.getElementById('m-offer-content').style.display=which==='offer'?'block':'none';
  const petsEl = document.getElementById('m-pets-content');
  if (petsEl) petsEl.style.display = which==='pets'?'block':'none';
  document.getElementById('m-edit-content').style.display=which==='profile'?'block':'none';
  const manageEl = document.getElementById('m-manage-content');
  if (manageEl) manageEl.style.display = which==='manage'?'block':'none';
  const titleEl = document.getElementById('m-sheet-title-text');
  if (titleEl) titleEl.textContent = title;
  _mSheetOpen=true;document.getElementById('m-sheet').classList.add('open');
}

function mSheetToggle(){
  _mSheetOpen=!_mSheetOpen;document.getElementById('m-sheet').classList.toggle('open',_mSheetOpen);
  if(!_mSheetOpen){_mCurrentTab='map';document.querySelectorAll('.m-tab,.m-tab-spare').forEach(b=>b.classList.remove('active'));}
}

function mRenderResources(){
  const el=document.getElementById('m-resources-content');if(!el)return;
  let html='';

  // Smart finder for mobile
  html += `<div style="background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:.8rem;margin-bottom:.8rem">
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:.5rem;margin-bottom:.5rem">
      <div>
        <label style="font-size:.5rem;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:rgba(255,255,255,.3);display:block;margin-bottom:.2rem">I'm stuck in</label>
        <select id="m-res-stuck" onchange="mFilterResources()" style="width:100%;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);border-radius:8px;padding:.4rem;color:#fff;font-family:Inter,sans-serif;font-size:.72rem;font-weight:600">
          <option value="">All</option>
        </select>
      </div>
      <div>
        <label style="font-size:.5rem;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:rgba(255,255,255,.3);display:block;margin-bottom:.2rem">I'm from</label>
        <select id="m-res-from" onchange="mFilterResources()" style="width:100%;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);border-radius:8px;padding:.4rem;color:#fff;font-family:Inter,sans-serif;font-size:.72rem;font-weight:600">
          <option value="">All</option>
        </select>
      </div>
    </div>
    <input type="text" id="m-res-search" oninput="mFilterResources()" placeholder="Search..." style="width:100%;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);border-radius:8px;padding:.4rem .6rem;color:#fff;font-family:Inter,sans-serif;font-size:.72rem">
  </div>
  <div id="m-res-results"></div>`;

  el.innerHTML = html;

  // Populate mobile dropdowns
  if (typeof EMBASSIES_BY_HOST !== 'undefined') {
    const meOrder = ['AE','SA','QA','BH','KW','OM','JO','IR','IQ','IL','LB'];
    const stuckSel = document.getElementById('m-res-stuck');
    const fromSel = document.getElementById('m-res-from');
    if (stuckSel) {
      let opts = '<option value="">All</option>';
      const sorted = Object.entries(EMBASSIES_BY_HOST).sort((a,b) => {
        const am = meOrder.indexOf(a[0]), bm = meOrder.indexOf(b[0]);
        if (am >= 0 && bm >= 0) return am - bm;
        if (am >= 0) return -1; if (bm >= 0) return 1;
        return a[1].name.localeCompare(b[1].name);
      });
      for (const [cc, h] of sorted) opts += `<option value="${cc}">${h.name}</option>`;
      stuckSel.innerHTML = opts;
    }
    if (fromSel) {
      const nats = new Set();
      for (const h of Object.values(EMBASSIES_BY_HOST)) for (const cc of Object.keys(h.embassies)) nats.add(cc);
      let opts = '<option value="">All</option>';
      const natArr = Array.from(nats).map(cc => {
        const n = (typeof EMB_NATIONS !== 'undefined' && EMB_NATIONS[cc]) || {flag:'',name:cc};
        return {cc, name: n.name, flag: n.flag};
      }).sort((a,b) => a.name.localeCompare(b.name));
      for (const n of natArr) opts += `<option value="${n.cc}">${n.flag} ${n.name}</option>`;
      fromSel.innerHTML = opts;
    }
  }

  mFilterResources();
}

function mFilterResources() {
  const results = document.getElementById('m-res-results');
  if (!results) return;
  const stuckIn = document.getElementById('m-res-stuck')?.value || '';
  const from = document.getElementById('m-res-from')?.value || '';
  const search = (document.getElementById('m-res-search')?.value || '').toLowerCase().trim();
  let html = '';

  if (typeof EMBASSIES_BY_HOST !== 'undefined') {
    const hosts = stuckIn ? [[stuckIn, EMBASSIES_BY_HOST[stuckIn]]] : Object.entries(EMBASSIES_BY_HOST);
    let count = 0;
    for (const [cc, host] of hosts) {
      if (!host) continue;
      let entries = Object.entries(host.embassies);
      if (from) entries = entries.filter(([n]) => n === from);
      if (search) entries = entries.filter(([n, info]) => {
        const nat = (typeof EMB_NATIONS !== 'undefined' && EMB_NATIONS[n]) || {name:n};
        return nat.name.toLowerCase().includes(search) || host.name.toLowerCase().includes(search) || (info.phone||'').includes(search);
      });
      if (!entries.length) continue;
      count += entries.length;
      html += `<div class="m-emb-section">
        <div class="m-emb-country-title">${host.name} <span style="font-size:.55rem;background:rgba(52,152,236,.15);color:#3498ec;border-radius:4px;padding:.1rem .3rem;font-weight:700">${entries.length}</span></div>
        ${host.emergency ? '<div style="font-size:.65rem;color:rgba(255,255,255,.4);margin-bottom:.3rem">Emergency: <strong style="color:#ec3452">'+host.emergency+'</strong></div>' : ''}
        ${entries.map(([natCC, info]) => {
          const nat = (typeof EMB_NATIONS !== 'undefined' && EMB_NATIONS[natCC]) || {flag:'',name:natCC};
          const phone = info.phone || null;
          return `<div class="m-emb-row"><div class="m-emb-who"><span class="m-emb-country">${nat.flag} ${nat.name}</span>${info.note?`<span class="m-emb-role">${info.note}</span>`:''}</div>
            <div style="display:flex;gap:.3rem;align-items:center">
              ${phone?`<a class="m-call-btn" href="tel:${phone.replace(/[\s\-()]/g,'')}">${PHONE_SVG} ${phone}</a>`:''}
              ${info.web?`<a href="${info.web}" target="_blank" style="font-size:.55rem;color:#3498ec;text-decoration:none">[web]</a>`:''}
            </div></div>`;
        }).join('')}
      </div>`;
    }
    if (stuckIn || from || search) {
      html = `<div style="font-size:.7rem;color:#3498ec;font-weight:600;margin-bottom:.4rem">${count} result${count!==1?'s':''}</div>` + html;
    }
  }

  if (!stuckIn && !from && !search) {
    // Show ME situation cards + NGOs when unfiltered
    html += '<div style="font-size:.6rem;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:rgba(255,255,255,.3);margin:.6rem 0 .4rem">Country Situations</div>';
    html += COUNTRIES.map(c => `
      <div class="m-emb-section">
        <div class="m-emb-country-title" style="color:${getSC()[c.status]}">${c.name} <span style="font-size:.6rem;font-weight:600;text-transform:uppercase;opacity:.6">${c.status}</span></div>
        ${Object.entries(c.embassy).slice(0,4).map(([key,info])=>{
          const M=EMBASSY_META[key]||{flag:'',role:key.toUpperCase()};
          const phone=info.phone||info.alt||null;
          return `<div class="m-emb-row"><div class="m-emb-who"><span class="m-emb-country">${M.flag} ${M.role}</span>${info.note?`<span class="m-emb-role">${info.note}</span>`:''}</div>${phone?`<a class="m-call-btn" href="tel:${phone.replace(/[\s\-()]/g,'')}">${PHONE_SVG} Call</a>`:''}</div>`;
        }).join('')}
      </div>`).join('');
    html += '<div style="font-size:.6rem;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:rgba(255,255,255,.3);margin:.6rem 0 .4rem">Resources & Support</div>';
    const mGroups = {};
    for (const r of NGOS) { if (!mGroups[r.type]) mGroups[r.type] = []; mGroups[r.type].push(r); }
    for (const [type, items] of Object.entries(mGroups)) {
      html += `<div style="font-size:.5rem;font-weight:800;text-transform:uppercase;letter-spacing:.06em;color:rgba(255,255,255,.2);margin:.5rem 0 .2rem;padding-top:.3rem;border-top:1px solid rgba(255,255,255,.04)">${type}</div>`;
      html += items.map(r => `<div class="m-res-row"><div style="flex:1"><div class="m-res-name">${r.name}<span class="m-res-type">${r.type}</span></div><div style="font-size:.6rem;color:rgba(255,255,255,.35);line-height:1.4;margin-top:.15rem">${r.desc}</div></div><div style="display:flex;flex-direction:column;gap:.2rem;align-items:flex-end;flex-shrink:0">${r.phone ? `<a href="tel:${r.phone.replace(/[\s\-()]/g,'')}" style="font-size:.55rem;color:#22c55e;text-decoration:none;font-weight:600;white-space:nowrap">Call</a>` : ''}<a class="m-res-go" href="${r.url}" target="_blank">Open</a></div></div>`).join('');
    }
  }

  results.innerHTML = html || '<div style="text-align:center;padding:3rem 0;min-height:40vh;color:rgba(255,255,255,.25);font-size:.78rem">No results found</div>';
}

async function mSubmitOffer(){
  if (!isLoggedIn()) { alert('Please sign in first to post.'); mTab('profile',document.getElementById('mtab-help')); return; }
  const roleErr = await checkUserRole('offer');
  if (roleErr) { alert(roleErr); return; }
  const l=document.getElementById('m-offer-location')?.value,b=document.getElementById('m-offer-body')?.value,
    n=document.getElementById('m-offer-name')?.value,
    email=document.getElementById('m-offer-contact')?.value?.trim()||'',
    tgContact=document.getElementById('m-offer-tg-contact')?.value?.trim()||'',
    x=(document.getElementById('m-offer-xhandle')?.value||'').trim().replace(/^@+/,''),
    lat=parseFloat(document.getElementById('m-offer-lat')?.value)||null,
    lng=parseFloat(document.getElementById('m-offer-lng')?.value)||null;
  const c = [email, tgContact].filter(Boolean).join(' | ') || email || tgContact;
  if(!l||!b||!n){alert('Please fill in all fields.');return;}
  if(containsLink(b)){alert('Links are not allowed in posts. Please remove any URLs.');return;}
  if(!c){alert('Please link at least one contact method (Google or Telegram).');return;}
  if(!lat||!lng){alert('Please select a location from the dropdown suggestions.');return;}
  const btn=document.querySelector('#m-offer-content .m-submit');btn.textContent='Posting...';btn.disabled=true;
  try{
    const{error}=await _sb.from('help_posts').insert({type:'offer',post_type:'General',location:l,body:b,name:n,contact:c,xhandle:x||null,lat,lng,user_id:_currentUser.id,flagged:false,avatar_url:(_currentProfile&&_currentProfile.avatar_url)||''});
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
      if (!isMob()) openFormSidebar('profile');
      else mTab('profile', document.getElementById('mtab-help'));
    } else if (sessionStorage.getItem('postLogin') === 'help') {
      sessionStorage.removeItem('postLogin');
      toggleHelpPanel();
    }
  }
  // Listen for auth changes (login, logout, token refresh)
  _sb.auth.onAuthStateChange(async (event, session) => {
    if (event === 'TOKEN_REFRESHED' && session?.user) {
      _currentUser = session.user;
      console.log('[Auth] Token refreshed');
    }
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
        if (!isMob()) openFormSidebar('profile');
        else mTab('profile', document.getElementById('mtab-help'));
      } else if (sessionStorage.getItem('postLogin') === 'help') {
        sessionStorage.removeItem('postLogin');
        toggleHelpPanel();
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
  try {
    let { data, error } = await withTimeout(_sb.from('profiles').select('*').eq('id', _currentUser.id).single());
    if (!data) {
      const meta = _currentUser.user_metadata || {};
      await withTimeout(_sb.from('profiles').insert({
        id: _currentUser.id,
        email: _currentUser.email,
        display_name: meta.full_name || meta.name || '',
        avatar_url: meta.avatar_url || meta.picture || '',
        google_verified: true
      }));
      const res = await withTimeout(_sb.from('profiles').select('*').eq('id', _currentUser.id).single());
      data = res.data;
    }
    _currentProfile = data;
  } catch(e) {
    console.warn('[loadProfile]', e.message);
    // Use what we have
  }
  if (_currentProfile?.avatar_url) setProfileAvatar(_currentProfile.avatar_url);
  updateLinkedFields();
  renderProfileView();
  renderMobileProfileView();
  // Keep $HELP modal in sync with live auth state
  refreshHelpPanel();
  // Update offer/stranded buttons based on active posts
  updateActionButtons();
  updateAdminButton();
}

function updateLinkedFields() {
  const p = _currentProfile;
  const lockSvg = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>';

  // Google → Email
  ['offer-contact','m-offer-contact','stranded-contact','m-stranded-contact'].forEach(id => {
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
  ['offer-tg-contact','m-offer-tg-contact','stranded-tg-contact','m-stranded-tg-contact'].forEach(id => {
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
  ['offer-xhandle','m-offer-xhandle','stranded-xhandle','m-stranded-xhandle'].forEach(id => {
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
      input.placeholder = isLoggedIn() ? 'Link X to enable Send $HELP' : 'Sign in to link X';
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
  // Require TOS agreement for signup
  if (mode === 'signup') {
    const agreed = document.getElementById('tos-agree')?.checked || document.getElementById('m-tos-agree')?.checked;
    if (!agreed) {
      alert('Please agree to the Terms of Service and Privacy Policy to create an account.');
      return;
    }
  }
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
      if (!isMob()) openFormSidebar('profile');
      else mTab('profile', document.getElementById('mtab-help'));
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
      if (!isMob()) openFormSidebar('profile');
      else mTab('profile', document.getElementById('mtab-help'));
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
  if (!isMob()) openFormSidebar('profile');
  else mTab('profile', document.getElementById('mtab-help'));
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
  updateActionButtons();
  updateAdminButton();
  showView('map');
}

function isLoggedIn() { return !!_currentUser; }

// Fast session check — never hangs, never blocks UI
async function ensureSession() {
  // Fast path: we have a user in memory — trust it, validate in background
  if (_currentUser) {
    // Fire-and-forget token refresh (don't await, don't block)
    _sb.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) _currentUser = session.user;
    }).catch(() => {});
    return true;
  }
  // Cold path: no user, try to restore
  try {
    const result = await Promise.race([
      _sb.auth.getSession(),
      new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 3000))
    ]);
    if (result?.data?.session?.user) {
      _currentUser = result.data.session.user;
      return true;
    }
  } catch(e) {}
  return false;
}

// Wrap a promise with a timeout — prevents infinite hangs on stale connections
function withTimeout(promise, ms = 8000) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('Request timed out')), ms))
  ]);
}

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
    // Big badge next to name — signature blue #3498ec if verified, gray if not
    _updateProfileNameBadge();
    updateActionButtons();
  } else {
    loginEl.style.display = 'block';
    mainEl.style.display = 'none';
  }
}

function _updateProfileNameBadge() {
  const p = _currentProfile;
  const isVerified = p?.google_verified || p?.x_verified || p?.tg_verified;
  const badge = document.getElementById('profile-verified-badge');
  if (!badge) return;
  const shield = badge.querySelector('svg');
  const check  = badge.querySelector('#profile-badge-check');
  if (isVerified) {
    shield.style.fill = '#3498ec';
    if (check) { check.setAttribute('stroke','#fff'); }
    badge.title = 'Verified account';
  } else {
    shield.style.fill = 'rgba(255,255,255,.12)';
    if (check) { check.setAttribute('stroke','rgba(255,255,255,.25)'); }
    badge.title = 'Not yet verified';
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
  // Refresh big name badge
  _updateProfileNameBadge();
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
    return `<div class="profile-post-card" data-post-id="${p.id}">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:.3rem">
        <span style="font-size:.82rem;font-weight:600;color:#fff">${esc(p.name)} ${buildBadge(verified)}</span>
        <span style="font-size:.63rem;color:rgba(255,255,255,.35)">${t}</span>
      </div>
      <div style="font-size:.78rem;font-weight:600;color:rgba(255,255,255,.7);margin-bottom:.2rem">📍 ${esc(p.location)}</div>
      <div style="font-size:.82rem;color:rgba(255,255,255,.55);line-height:1.5">${(p.body || '').slice(0, 150)}${(p.body || '').length > 150 ? '...' : ''}</div>
      ${buildContactButtons(p.contact, p.xhandle, p.name)}
      <div class="profile-post-actions">
        <button onclick="profileEditPost('${p.id}')" style="background:rgba(52,152,236,.15);color:#3498ec;border:1px solid rgba(52,152,236,.25);border-radius:6px;padding:.28rem .7rem;font-size:.7rem;font-weight:600;cursor:pointer;font-family:Inter,sans-serif">Edit</button>
        <button onclick="profileDeletePost('${p.id}')" style="background:#ec3452;color:#fff;border:none;border-radius:6px;padding:.28rem .7rem;font-size:.7rem;font-weight:600;cursor:pointer;font-family:Inter,sans-serif">Delete</button>
      </div>
    </div>`;
  }).join('');
  injectMatchNotifications('profile-posts-list');
}

async function profileDeletePost(id) {
  if (!confirm('Delete this post? This cannot be undone.')) return;
  try {
    const { error } = await _sb.from('help_posts').delete().eq('id', id).eq('user_id', _currentUser.id);
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
  // Switch to help view, offer panel
  if(!isMob()) openFormSidebar('offer'); else { mTab('offer',null); }
  switchHelpMode('helper');
  // Change button
  const btn = document.querySelector('.submit-btn--offer');
  if (btn) { btn.textContent = 'Update Post'; btn.onclick = () => submitEditPost('offer'); }
}

async function mProfileEditPost(id) {
  if (!await ensureSession()) { alert('Please sign in first.'); return; }
  const { data } = await _sb.from('help_posts').select('*').eq('id', id).eq('user_id', _currentUser.id).single();
  if (!data) { alert('Post not found.'); return; }
  _editingPostId = id;
  const mob = isMob();
  const prefix = mob ? 'm-offer' : 'offer';

  // Populate form fields
  const setVal = (fid, v) => { const el = document.getElementById(fid); if (el) el.value = v || ''; };
  setVal(prefix + '-location', data.location);
  setVal(prefix + '-lat', data.lat);
  setVal(prefix + '-lng', data.lng);
  setVal(prefix + '-body', data.body);
  setVal(prefix + '-name', data.name);

  if (mob) {
    mTab('offer', document.querySelector('#mtab-spare'));
    const btn = document.querySelector('#m-offer-content .m-submit');
    if (btn) { btn.textContent = 'Update Post'; btn.onclick = () => mSubmitEditPost(); }
  } else {
    // Directly swap: clear sidebar, then immediately open offer form
    const sb = document.getElementById('form-sidebar');
    const body = document.getElementById('form-sidebar-body');
    if (sb && body) {
      _fsReturnMounted();
      body.innerHTML = '';
      sb.dataset.panel = '';
      sb.classList.remove('open');
    }
    requestAnimationFrame(() => {
      openFormSidebar('offer');
      setTimeout(() => {
        const btn = document.querySelector('.submit-btn--offer');
        if (btn) { btn.textContent = 'Update Post'; btn.onclick = () => submitEditPost('offer'); }
      }, 200);
    });
  }
}

async function submitEditPost(type) {
  if (!_editingPostId || !isLoggedIn()) return;
  const l = document.getElementById(type + '-location')?.value,
    b = document.getElementById(type + '-body')?.value,
    n = document.getElementById(type + '-name')?.value,
    lat = parseFloat(document.getElementById(type + '-lat')?.value) || null,
    lng = parseFloat(document.getElementById(type + '-lng')?.value) || null;
  if (!l || !b || !n) { alert('Please fill in all required fields.'); return; }
  const email = document.getElementById(type + '-contact')?.value?.trim() || '';
  const tgContact = document.getElementById(type + '-tg-contact')?.value?.trim() || '';
  const x = (document.getElementById(type + '-xhandle')?.value || '').trim().replace(/^@+/, '');
  const c = [email, tgContact].filter(Boolean).join(' | ') || email || tgContact;
  const updateObj = { location: l, body: b, name: n, contact: c, xhandle: x || null, lat, lng };
  const t = document.getElementById(type + '-type')?.value;
  if (t) updateObj.post_type = t;
  const btn = document.querySelector(`.submit-btn--${type}`);
  if (btn) { btn.textContent = 'Updating...'; btn.disabled = true; }
  try {
    const { error } = await _sb.from('help_posts').update(updateObj).eq('id', _editingPostId).eq('user_id', _currentUser.id);
    if (error) throw error;
    cancelEdit('offer');
    loadPosts();
    renderProfilePosts();
    isMob()?mTab('profile',null):openFormSidebar('profile');
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
    mTab('profile', document.getElementById('mtab-help'));
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
    await _sb.from('help_posts').delete().eq('user_id', _currentUser.id);
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
async function renderMobileProfileView() {
  const loginEl = document.getElementById('m-profile-login');
  const mainEl = document.getElementById('m-profile-main');
  if (!loginEl || !mainEl) return;
  await ensureSession();
  if (isLoggedIn()) {
    loginEl.style.display = 'none';
    mainEl.style.display = 'block';
    const nameEl = document.getElementById('m-profile-display-name');
    if (nameEl) {
      const verified = _currentProfile?.google_verified || _currentProfile?.x_verified || _currentProfile?.tg_verified;
      nameEl.innerHTML = esc(_currentProfile?.display_name || _currentUser.email) + ' ' + buildBadge(verified);
    }
    updateVerifyStatus('google', _currentProfile?.google_verified);
    updateVerifyStatus('x', _currentProfile?.x_verified);
    updateVerifyStatus('tg', _currentProfile?.tg_verified);
    updateActionButtons();
  } else {
    loginEl.style.display = 'block';
    mainEl.style.display = 'none';
  }
}

async function mRenderProfilePosts() {
  const list = document.getElementById('m-my-posts-list');
  if (!list) return;
  if (!await ensureSession()) {
    list.innerHTML = '<div style="color:rgba(255,255,255,.5);font-size:.82rem;padding:.5rem 0">Please sign in.</div>'; return;
  }
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
      return `<div style="background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);border-radius:10px;padding:.75rem;margin-bottom:.6rem" data-post-id="${p.id}">
        <div style="font-size:.7rem;color:rgba(255,255,255,.45);margin-bottom:.2rem">${t}</div>
        <div style="font-size:.85rem;font-weight:600;color:#fff;margin-bottom:.15rem">📍 ${esc(p.location)}</div>
        <div style="font-size:.8rem;color:rgba(255,255,255,.7);line-height:1.5;margin-bottom:.6rem">${(p.body || '').slice(0, 120)}${(p.body || '').length > 120 ? '...' : ''}</div>
        <div style="display:flex;gap:.5rem">
          <button onclick="mProfileEditPost('${p.id}')" style="background:rgba(52,152,236,.15);color:#3498ec;border:1px solid rgba(52,152,236,.25);border-radius:7px;padding:.35rem .8rem;font-size:.72rem;font-weight:700;cursor:pointer;font-family:Inter,sans-serif">Edit</button>
          <button onclick="mProfileDeletePost('${p.id}')" style="background:#ec3452;color:#fff;border:none;border-radius:7px;padding:.35rem .8rem;font-size:.72rem;font-weight:700;cursor:pointer;font-family:Inter,sans-serif">Delete</button>
        </div>
      </div>`;
    }).join('');
    injectMatchNotifications('m-my-posts-list');
  } catch (e) {
    list.innerHTML = `<div style="color:#ec3452;font-size:.82rem;padding:.5rem 0">Error: ${e.message} <button onclick="mRenderProfilePosts()" style="background:rgba(52,152,236,.15);color:#3498ec;border:none;border-radius:5px;padding:.2rem .5rem;font-size:.7rem;font-weight:600;cursor:pointer;margin-left:.3rem">Retry</button></div>`;
  }
}

async function mProfileDeletePost(id) {
  if (!confirm('Delete this post? This cannot be undone.')) return;
  try {
    const { error } = await _sb.from('help_posts').delete().eq('id', id).eq('user_id', _currentUser.id);
    if (error) throw error;
    closeFormSidebar();
    if (isMob()) mTab('map', null);
    mRenderProfilePosts();
    loadPosts();
  } catch (e) { alert('Failed to delete: ' + e.message); }
}

// ── Stranded Profile Posts ────────────────────────────────
async function renderProfileStranded() {
  const el = document.getElementById('profile-stranded-list');
  const mel = document.getElementById('m-stranded-posts-list');
  if (!await ensureSession()) return;
  [el, mel].forEach(list => {
    if (list) list.innerHTML = '<div style="font-size:.82rem;color:rgba(255,255,255,.4);padding:.3rem 0">Loading...</div>';
  });
  try {
    const { data, error } = await _sb.from('stranded_people').select('id,name,current_location,current_lat,current_lng,destination,dest_airport,nationality,group_size,needs,stranded_since,details,status,created_at')
      .eq('user_id', _currentUser.id).eq('status', 'active').order('created_at', { ascending: false });
    if (error) throw error;
    if (!data || !data.length) {
      [el, mel].forEach(list => {
        if (list) list.innerHTML = '<div style="font-size:.82rem;color:rgba(255,255,255,.4);padding:.3rem 0">No stranded registration.</div>';
      });
      return;
    }
  const html = [];
  // Fetch match status for all stranded posts
  const postIds = data.map(p => p.id);
  let matchMap = {};
  try {
    const { data: matches } = await _sb.from('success_stories')
      .select('stranded_post_id,offer_confirmed,home_lat')
      .eq('stranded_user_id', _currentUser.id)
      .in('stranded_post_id', postIds);
    if (matches) for (const m of matches) matchMap[m.stranded_post_id] = m;
  } catch(e) {}

  for (const p of data) {
    const t = p.created_at ? new Date(p.created_at).toLocaleString() : '';
    const needsList = (p.needs || []).join(', ');
    const match = matchMap[p.id];
    const matchedLabel = match?.offer_confirmed ? '✓ Matched' : match ? 'Pending…' : 'Matched?';
    const matchedStyle = match?.offer_confirmed
      ? 'border-color:#22c55e;color:#22c55e;opacity:.7;cursor:default'
      : match ? 'border-color:rgba(255,165,0,.4);color:rgba(255,165,0,.7);cursor:default' : '';
    const homeLabel = match?.home_lat ? '✓ Home' : 'Home?';
    const homeStyle = match?.home_lat
      ? 'border-color:#22c55e;color:#22c55e;opacity:.7;cursor:default'
      : match?.offer_confirmed ? 'border-color:rgba(34,197,94,.25);color:rgba(34,197,94,.6)' : 'border-color:rgba(255,255,255,.1);color:rgba(255,255,255,.2);cursor:default';
    html.push(`<div class="profile-post-card" style="border-color:rgba(236,52,82,.15)">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:.3rem">
        <span style="font-size:.82rem;font-weight:700;color:#ec3452">${esc(p.name) || 'Anonymous'}</span>
        <span style="font-size:.63rem;color:rgba(255,255,255,.35)">${t}</span>
      </div>
      <div style="font-size:.78rem;color:rgba(255,255,255,.6);margin-bottom:.15rem">📍 ${esc(p.current_location)}</div>
      <div style="font-size:.78rem;color:rgba(255,255,255,.6);margin-bottom:.15rem">🏠 ${esc(p.destination)}${p.dest_airport ? ' ('+p.dest_airport+')' : ''}</div>
      ${p.group_size > 1 ? '<div style="font-size:.75rem;color:rgba(255,255,255,.5)">Group: '+p.group_size+' people</div>' : ''}
      ${needsList ? '<div style="font-size:.72rem;color:#e67e22;margin-top:.2rem">Needs: '+needsList+'</div>' : ''}
      ${p.details ? '<div style="font-size:.78rem;color:rgba(255,255,255,.45);line-height:1.4;margin-top:.2rem">'+esc(p.details).slice(0,120)+'</div>' : ''}
      <div class="profile-post-actions">
        <button class="found-place-btn" style="${matchedStyle}" onclick="openMatchPicker('${p.id}','${p.current_lat||0}','${p.current_lng||0}','${(p.name||'').replace(/'/g,"\\'")}','${(p.current_location||'').replace(/'/g,"\\'")}')">
          ${matchedLabel}
        </button>
        <button class="found-place-btn" style="${homeStyle}" onclick="${match?.offer_confirmed && !match?.home_lat ? "checkAndOpenGoHome('"+p.id+"')" : 'void(0)'}">
          ${homeLabel}
        </button>
        <button onclick="editStrandedPost('${p.id}')" style="background:rgba(52,152,236,.15);color:#3498ec;border:1px solid rgba(52,152,236,.25);border-radius:6px;padding:.28rem .7rem;font-size:.7rem;font-weight:600;cursor:pointer;font-family:Inter,sans-serif">Edit</button>
        <button onclick="deleteStrandedPost('${p.id}')" style="background:#ec3452;color:#fff;border:none;border-radius:6px;padding:.28rem .7rem;font-size:.7rem;font-weight:600;cursor:pointer;font-family:Inter,sans-serif">Delete</button>
      </div>
    </div>`);
  }
  const htmlStr = html.join('');
  if (el) el.innerHTML = htmlStr;
  if (mel) mel.innerHTML = htmlStr;
  } catch (e) {
    console.error('renderProfileStranded error:', e);
    [el, mel].forEach(list => {
      if (list) list.innerHTML = `<div style="font-size:.82rem;color:#ec3452;padding:.3rem 0">Error loading: ${e.message} <button onclick="renderProfileStranded()" style="background:rgba(52,152,236,.15);color:#3498ec;border:none;border-radius:5px;padding:.2rem .5rem;font-size:.7rem;font-weight:600;cursor:pointer;margin-left:.3rem">Retry</button></div>`;
    });
  }
}

let _editingStrandedId = null;

async function editStrandedPost(id) {
  if (!await ensureSession()) { alert('Please sign in first.'); return; }
  const { data } = await _sb.from('stranded_people').select('*').eq('id', id).eq('user_id', _currentUser.id).single();
  if (!data) { alert('Registration not found.'); return; }
  _editingStrandedId = id;
  const isMobile = window.innerWidth <= 600;
  const prefix = isMobile ? 'm-stranded' : 'stranded';

  // Populate fields
  const setVal = (fid, v) => { const el = document.getElementById(fid); if (el) el.value = v || ''; };
  setVal(prefix + '-name', data.name);
  setVal(prefix + '-location', data.current_location);
  setVal(prefix + '-lat', data.current_lat);
  setVal(prefix + '-lng', data.current_lng);
  setVal(prefix + '-dest', data.destination);
  setVal(prefix + '-dest-lat', data.dest_lat);
  setVal(prefix + '-dest-lng', data.dest_lng);
  setVal(prefix + '-dest-country', data.dest_country);
  setVal(prefix + '-dest-airport', data.dest_airport);
  setVal(prefix + '-details', data.details);
  setVal(prefix + '-since', data.stranded_since);
  setVal(prefix + '-phone', data.contact?.match(/\+?[\d\s\-().]{7,}/)?.[0]?.trim() || '');
  setVal(prefix + '-group', data.group_size || 1);

  const natEl = document.getElementById(prefix + '-nationality');
  if (natEl && data.nationality) {
    for (let i = 0; i < natEl.options.length; i++) {
      if (natEl.options[i].value === data.nationality || natEl.options[i].text === data.nationality) { natEl.selectedIndex = i; break; }
    }
  }
  const needsContainer = document.getElementById(prefix + '-needs');
  if (needsContainer && data.needs) {
    needsContainer.querySelectorAll('input').forEach(cb => cb.checked = (data.needs || []).includes(cb.value));
  }

  if (isMobile) {
    mTab('stranded', null);
  } else {
    // Directly swap: close+clear, then immediately open stranded form (no delay needed)
    const sb = document.getElementById('form-sidebar');
    const body = document.getElementById('form-sidebar-body');
    if (sb && body) {
      _fsReturnMounted();
      body.innerHTML = '';
      sb.dataset.panel = '';
      sb.classList.remove('open');
    }
    // Small frame delay so DOM settles, then open fresh
    requestAnimationFrame(() => { openFormSidebar('stranded'); });
  }

  // Change submit button
  setTimeout(() => {
    const btn = document.getElementById(prefix + '-submit-btn');
    if (btn) {
      btn.textContent = 'Update Registration';
      btn._origOnclick = btn.onclick;
      btn.onclick = () => submitStrandedEdit(prefix);
    }
  }, 400);
}

async function submitStrandedEdit(prefix) {
  if (!_editingStrandedId || !isLoggedIn()) return;
  const sName = document.getElementById(prefix + '-name')?.value?.trim() || '';
  const loc = document.getElementById(prefix + '-location')?.value?.trim();
  const lat = parseFloat(document.getElementById(prefix + '-lat')?.value) || null;
  const lng = parseFloat(document.getElementById(prefix + '-lng')?.value) || null;
  const dest = document.getElementById(prefix + '-dest')?.value?.trim();
  const destLat = parseFloat(document.getElementById(prefix + '-dest-lat')?.value) || null;
  const destLng = parseFloat(document.getElementById(prefix + '-dest-lng')?.value) || null;
  const destCountry = document.getElementById(prefix + '-dest-country')?.value || '';
  const destAirport = document.getElementById(prefix + '-dest-airport')?.value || '';
  const nationality = document.getElementById(prefix + '-nationality')?.value;
  const groupSize = parseInt(document.getElementById(prefix + '-group')?.value) || 1;
  const since = document.getElementById(prefix + '-since')?.value || null;
  const details = document.getElementById(prefix + '-details')?.value?.trim();
  const needs = [...document.querySelectorAll('#' + prefix + '-needs input:checked')].map(c => c.value);
  const phone = document.getElementById(prefix + '-phone')?.value?.trim() || '';
  const email = _currentUser?.email || '';
  const tg = _currentProfile?.tg_handle ? '@' + _currentProfile.tg_handle : '';
  const xhandle = _currentProfile?.x_handle || document.getElementById(prefix + '-xhandle')?.value?.replace('@','') || '';
  const contact = [email, tg, phone].filter(Boolean).join(' | ');

  if (!loc || !dest) { alert('Please fill in location and destination.'); return; }

  const btn = document.getElementById(prefix + '-submit-btn');
  if (btn) { btn.textContent = 'Updating...'; btn.disabled = true; }
  try {
    const { error } = await _sb.from('stranded_people').update({
      name: sName || null, current_location: loc, current_lat: lat, current_lng: lng,
      destination: dest, dest_lat: destLat, dest_lng: destLng,
      dest_country: destCountry || null, dest_airport: destAirport || null,
      nationality, group_size: groupSize,
      needs: needs.length ? `{${needs.join(',')}}` : '{}',
      stranded_since: since, details, contact, xhandle: xhandle || null,
    }).eq('id', _editingStrandedId).eq('user_id', _currentUser.id);
    if (error) throw error;
    _editingStrandedId = null;
    if (btn) { btn.textContent = 'Add Me to the Map'; btn.disabled = false; btn.onclick = prefix.startsWith('m-') ? mSubmitStranded : submitStranded; }
    renderProfileStranded();
    loadStranded();
    if (prefix.startsWith('m-')) mTab('profile', null);
    else openFormSidebar('profile');
  } catch (e) {
    alert('Failed to update: ' + e.message);
    if (btn) { btn.textContent = 'Update Registration'; btn.disabled = false; }
  }
}

async function deleteStrandedPost(id) {
  if (!confirm('Remove your stranded registration? You can re-register anytime.')) return;
  try {
    const { error } = await _sb.from('stranded_people').delete().eq('id', id).eq('user_id', _currentUser.id);
    if (error) throw error;
    closeFormSidebar();
    if (isMob()) mTab('map', null);
    renderProfileStranded();
    loadStranded();
  } catch (e) { alert('Failed: ' + e.message); }
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

// ── PETS ──
let _petPosts = [];
let _petCluster = null;
let _mPetCluster = null;

function toggleHelpPanel() {
  const modal = document.getElementById('help-money-modal');
  if (!modal) return;
  const opening = !modal.classList.contains('open');
  modal.classList.toggle('open');
  if (opening) refreshHelpPanel();
}

// Context-aware dismiss: if $HELP is inside sidebar, close sidebar. If modal, close modal.
function dismissHelp() {
  const sb = document.getElementById('form-sidebar');
  if (sb && sb.classList.contains('open') && sb.dataset.panel === 'help') {
    closeFormSidebar();
  } else {
    const modal = document.getElementById('help-money-modal');
    if (modal && modal.classList.contains('open')) toggleHelpPanel();
  }
}

function switchHelpTab(tab) {
  document.getElementById('htab-send').classList.toggle('active', tab === 'send');
  document.getElementById('htab-receive').classList.toggle('active', tab === 'receive');
  document.getElementById('help-send-panel').style.display = tab === 'send' ? '' : 'none';
  document.getElementById('help-receive-panel').style.display = tab === 'receive' ? '' : 'none';
}

function refreshHelpPanel() {
  const p = _currentProfile;
  const xOk = !!(p?.x_verified && p?.x_handle);
  const tgOk = !!p?.tg_verified;
  const gOk  = !!p?.google_verified;

  // ── SEND panel ──────────────────────────────────────────
  // Step 1: X connect
  const s1num  = document.getElementById('hs-s1-num');
  const s1desc = document.getElementById('hs-s1-desc');
  const s1btn  = document.getElementById('hs-s1-btn');
  if (xOk) {
    s1num?.classList.add('done');
    const isVerified = xOk && tgOk && gOk;
    const badge = isVerified
      ? '<span style="display:inline-flex;align-items:center;gap:.2rem;background:rgba(var(--accent-r),var(--accent-g),var(--accent-b),.15);border:1px solid rgba(var(--accent-r),var(--accent-g),var(--accent-b),.3);border-radius:6px;padding:.1rem .35rem;font-size:.55rem;font-weight:700;color:var(--accent);margin-left:.35rem;vertical-align:middle">✓ Verified</span>'
      : '<span style="display:inline-flex;align-items:center;gap:.2rem;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);border-radius:6px;padding:.1rem .35rem;font-size:.55rem;font-weight:700;color:rgba(255,255,255,.35);margin-left:.35rem;vertical-align:middle">⚪ Unverified</span>';
    if (s1desc) s1desc.innerHTML = `Connected as <strong style="color:#fff">@${p.x_handle}</strong> ${badge}`;
    if (s1btn) {
      s1btn.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg> X Connected`;
      s1btn.className = 'hstep-btn hstep-btn--x done';
    }
  } else {
    s1num?.classList.remove('done');
    if (s1desc) s1desc.textContent = 'Link your X account to send and receive $HELP tips.';
    if (s1btn) {
      s1btn.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg> Connect X`;
      s1btn.className = 'hstep-btn hstep-btn--x';
      s1btn.onclick = () => { helpConnectX(); };
    }
  }

  // Step 3: tip button — disabled if no X
  const s3btn    = document.getElementById('hs-s3-btn');
  const s3locked = document.getElementById('hs-s3-locked');
  if (s3btn && s3locked) {
    if (xOk) {
      s3btn.style.display = '';
      s3locked.style.display = 'none';
    } else {
      s3btn.style.display = 'none';
      s3locked.style.display = '';
    }
  }

  // Send steps 2 & 3 — go solid when X is connected
  const s2num = document.getElementById('hs-s2-num');
  const s2btn = document.getElementById('hs-s2-btn');
  const s3num = document.getElementById('hs-s3-num');
  if (s2num) s2num.classList.toggle('done', xOk);
  if (s2btn) s2btn.classList.toggle('done', xOk);
  if (s3num) s3num.classList.toggle('done', xOk);
  if (s3btn) s3btn.classList.toggle('done', xOk);

  // ── RECEIVE panel ────────────────────────────────────────
  // Step 1 socials
  function setDot(id, linked) {
    const dot = document.getElementById(id);
    if (dot) dot.classList.toggle('linked', linked);
  }
  function setLinkBtn(id, linked) {
    const btn = document.getElementById(id);
    if (!btn) return;
    btn.textContent = linked ? '✓ Connected' : 'Connect';
    btn.classList.toggle('linked', linked);
    btn.disabled = linked;
    if (linked) { btn.style.opacity = '1'; btn.style.color = '#fff'; btn.style.background = '#3498ec'; btn.style.borderColor = '#3498ec'; }
    else { btn.style.opacity = ''; btn.style.color = ''; btn.style.background = ''; btn.style.borderColor = ''; }
  }
  setDot('hr-dot-x', xOk);  setLinkBtn('hr-btn-x', xOk);
  setDot('hr-dot-tg', tgOk); setLinkBtn('hr-btn-tg', tgOk);
  setDot('hr-dot-g', gOk);   setLinkBtn('hr-btn-g', gOk);

  // Step 1 num — green if at least X connected (required for tipping)
  const r1num = document.getElementById('hr-s1-num');
  if (r1num) r1num.classList.toggle('done', xOk);

  // Receive step 2 — solid when user has an active offer or stranded post
  const r2num = document.getElementById('hr-s2-num');
  const r2offerBtn = document.getElementById('hr-s2-offer-btn');
  const r2strandedBtn = document.getElementById('hr-s2-stranded-btn');
  const hasPost = !!(_hasActiveOffer || _hasActiveStranded);
  if (r2num) r2num.classList.toggle('done', hasPost);
  if (r2offerBtn) r2offerBtn.classList.toggle('done', _hasActiveOffer);
  if (r2strandedBtn) r2strandedBtn.classList.toggle('done', _hasActiveStranded);

  // Receive step 3 — solid when X is connected
  const r3num = document.getElementById('hr-s3-num');
  const r3btn = document.getElementById('hr-s3-btn');
  if (r3num) r3num.classList.toggle('done', xOk);
  if (r3btn) r3btn.classList.toggle('done', xOk);
}

// ── $HELP modal self-contained connect functions ─────────────
// These handle auth directly without navigating to the profile sidebar.
// If user isn't signed in, Google sign-in is triggered first.
function helpConnectX() {
  if (!isLoggedIn()) {
    sessionStorage.setItem('postLogin', 'help');
    authAction('x', 'signin');
    return;
  }
  linkX();
}
function helpConnectTg() {
  if (!isLoggedIn()) {
    sessionStorage.setItem('postLogin', 'help');
    authAction('x', 'signin');
    return;
  }
  linkTelegram();
}
function helpConnectGoogle() {
  if (!isLoggedIn()) {
    authAction('google', 'signin');
    return;
  }
  // Already signed in via Google — mark as verified
  if (_currentProfile && !_currentProfile.google_verified) {
    _sb.from('profiles').update({ google_verified: true }).eq('id', _currentUser.id)
      .then(() => { loadProfile(); });
  }
}

// Filter map to verified stranded + offers only
function helpFilterVerifiedOnly() {
  // Turn off disrupted globally + embassies + routes; show only verified spare rooms + stranded
  const setCheck = (id, val) => {
    const el = document.getElementById(id) || document.getElementById(id.replace('fp-','mfp-'));
    if (el) { el.checked = val; }
  };
  setCheck('fp-show-worldwide', false);
  setCheck('fp-worldwide-arcs', false);
  setCheck('fp-show-offers', true);
  setCheck('fp-show-stranded', true);
  setCheck('fp-show-embassies', false);
  setCheck('fp-show-routes', false);
  setCheck('fp-offers-verified', true);
  setCheck('fp-stranded-verified', true);
  // mirror to mobile checkboxes too
  ['mfp-show-worldwide','mfp-worldwide-arcs','mfp-show-offers','mfp-show-stranded','mfp-show-embassies','mfp-show-routes',
   'mfp-offers-verified','mfp-stranded-verified'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.checked = ['mfp-show-offers','mfp-show-stranded','mfp-offers-verified','mfp-stranded-verified'].includes(id);
  });
  applyFilters();
  // Close help panel (sidebar or modal) and switch to map
  dismissHelp();
  if (isMob()) mTab('map', null);
  else showView('map');
}

function openStrandedForm() {
  if (isMob()) { mTab('stranded', null); }
  else { openFormSidebar('stranded'); }
}

function closeStrandedForm() {
  showView('map');
}

async function mSubmitStranded() {
  if (!isLoggedIn()) { alert('Please sign in first.'); mTab('profile', null); return; }
  const roleErr = await checkUserRole('stranded');
  if (roleErr) { alert(roleErr); return; }
  const sName = document.getElementById('m-stranded-name')?.value?.trim() || '';
  const loc = document.getElementById('m-stranded-location').value.trim();
  const lat = parseFloat(document.getElementById('m-stranded-lat').value) || null;
  const lng = parseFloat(document.getElementById('m-stranded-lng').value) || null;
  const dest = document.getElementById('m-stranded-dest').value.trim();
  const destLat = parseFloat(document.getElementById('m-stranded-dest-lat').value) || null;
  const destLng = parseFloat(document.getElementById('m-stranded-dest-lng').value) || null;
  const destCountry = document.getElementById('m-stranded-dest-country')?.value || '';
  const destAirport = document.getElementById('m-stranded-dest-airport')?.value || '';
  const nationality = document.getElementById('m-stranded-nationality').value;
  const groupSize = parseInt(document.getElementById('m-stranded-group').value) || 1;
  const since = document.getElementById('m-stranded-since').value || null;
  const details = document.getElementById('m-stranded-details').value.trim();
  const needs = [...document.querySelectorAll('#m-stranded-needs input:checked')].map(c => c.value);
  if (!loc) { alert('Please fill in your current location.'); return; }
  if (!lat || !lng) { alert('Please select your location or use GPS.'); return; }
  if (!dest) { alert('Please select where you need to get home to.'); return; }
  if (containsLink(details)) { alert('Links are not allowed in posts. Please remove any URLs.'); return; }
  const email = _currentUser?.email || '';
  const tg = _currentProfile?.tg_handle ? '@' + _currentProfile.tg_handle : '';
  const xhandle = _currentProfile?.x_handle || document.getElementById('m-stranded-xhandle')?.value?.replace('@','') || '';
  const phone = document.getElementById('m-stranded-phone')?.value?.trim() || '';
  const contact = [email, tg, phone].filter(Boolean).join(' | ');
  const btn = document.getElementById('m-stranded-submit-btn');
  btn.textContent = 'Registering...'; btn.disabled = true;
  try {
    const { error } = await _sb.from('stranded_people').insert({
      user_id: _currentUser.id, name: sName || null, current_location: loc, current_lat: lat, current_lng: lng,
      destination: dest, dest_lat: destLat, dest_lng: destLng,
      dest_country: destCountry || null, dest_airport: destAirport || null,
      nationality, group_size: groupSize,
      needs: needs.length ? '{' + needs.join(',') + '}' : '{}',
      stranded_since: since, details, contact, xhandle: xhandle || null,
    });
    if (error) throw error;
    btn.textContent = "You're on the map!"; btn.style.background = '#27ae60';
    setTimeout(() => { btn.textContent = 'Add Me to the Map'; btn.disabled = false; btn.style.background = '#ec3452'; }, 4000);
    loadStranded();
  } catch (e) { alert('Failed: ' + e.message); btn.textContent = 'Add Me to the Map'; btn.disabled = false; }
}

async function submitStranded() {
  if (!isLoggedIn()) { alert('Please sign in first.'); return; }
  const roleErr = await checkUserRole('stranded');
  if (roleErr) { alert(roleErr); return; }
  const sName = document.getElementById('stranded-name')?.value?.trim() || '';
  const loc = document.getElementById('stranded-location').value.trim();
  const lat = parseFloat(document.getElementById('stranded-lat').value) || null;
  const lng = parseFloat(document.getElementById('stranded-lng').value) || null;
  const dest = document.getElementById('stranded-dest').value.trim();
  const destLat = parseFloat(document.getElementById('stranded-dest-lat').value) || null;
  const destLng = parseFloat(document.getElementById('stranded-dest-lng').value) || null;
  const destCountry = document.getElementById('stranded-dest-country')?.value || '';
  const destAirport = document.getElementById('stranded-dest-airport')?.value || '';
  const nationality = document.getElementById('stranded-nationality').value;
  const groupSize = parseInt(document.getElementById('stranded-group').value) || 1;
  const since = document.getElementById('stranded-since').value || null;
  const details = document.getElementById('stranded-details').value.trim();
  const needs = [...document.querySelectorAll('#stranded-needs input:checked')].map(c => c.value);

  if (!loc) { alert('Please fill in your current location.'); return; }
  if (!lat || !lng) { alert('Please select your location from suggestions or use GPS.'); return; }
  if (!dest) { alert('Please select where you need to get home to.'); return; }
  if (containsLink(details)) { alert('Links are not allowed in posts. Please remove any URLs.'); return; }

  const email = _currentUser?.email || '';
  const tg = _currentProfile?.tg_handle ? '@' + _currentProfile.tg_handle : '';
  const xhandle = _currentProfile?.x_handle || document.getElementById('stranded-xhandle')?.value?.replace('@','') || '';
  const phone = document.getElementById('stranded-phone')?.value?.trim() || '';
  const contact = [email, tg, phone].filter(Boolean).join(' | ');

  const btn = document.getElementById('stranded-submit-btn');
  btn.textContent = 'Registering...'; btn.disabled = true;
  try {
    const { error } = await _sb.from('stranded_people').insert({
      user_id: _currentUser.id, name: sName || null,
      current_location: loc, current_lat: lat, current_lng: lng,
      destination: dest, dest_lat: destLat, dest_lng: destLng,
      dest_country: destCountry || null, dest_airport: destAirport || null,
      nationality, group_size: groupSize,
      needs: needs.length ? `{${needs.join(',')}}` : '{}',
      stranded_since: since, details, contact, xhandle: xhandle || null,
    });
    if (error) throw error;
    btn.textContent = "You're on the map!"; btn.style.background = '#27ae60';
    setTimeout(() => { btn.textContent = 'Add Me to the Map'; btn.disabled = false; btn.style.background = '#ec3452'; }, 4000);
    loadStranded();
  } catch (e) {
    alert('Failed: ' + e.message);
    btn.textContent = 'Add Me to the Map'; btn.disabled = false;
  }
}

async function loadStranded() {
  try {
    const { data } = await withTimeout(_sb.from('stranded_people').select('id,user_id,name,current_location,current_lat,current_lng,destination,dest_lat,dest_lng,dest_country,dest_airport,nationality,group_size,needs,stranded_since,details,contact,xhandle,status,created_at')
      .eq('flagged', false).eq('status', 'active').order('created_at', { ascending: false }).limit(500));
    _strandedPeople = data || [];

    // Update stranded count in sitrep bar
    const totalPeople = _strandedPeople.reduce((sum, p) => sum + (p.group_size || 1), 0);
    const countEl = document.getElementById('stat-stranded');
    const mCountEl = document.getElementById('m-stat-stranded');
    // Only update if we have registered people (otherwise keep the estimated number)
    // NOTE: do NOT overwrite stat-stranded — that shows flight impact (millions).
    // Registered people is a separate count shown elsewhere.
    if (totalPeople > 0) {
      // update a dedicated registered-count element if it exists
      const regEl = document.getElementById('stat-registered-people');
      if (regEl) regEl.textContent = totalPeople.toLocaleString() + '+';
    }

    renderStrandedOnMap(window._crisisMap, false);
    renderStrandedOnMap(window._mobileMap, true);
    updateActionButtons();
    updateFilterBadges();
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
      const total = c.getAllChildMarkers().reduce((sum, m) => sum + (m.options.groupSize || 1), 0);
      const d = buildUserDot('stranded', total, 'stranded', 50);
      return L.divIcon({ html: d.html, className: '', iconSize: [d.sz, d.sz], iconAnchor: [d.sz/2, d.sz/2] });
    }
  });

  for (const p of _strandedPeople) {
    if (!p.current_lat || !p.current_lng) continue;
    const age = timeAgo(p.created_at);
    const needsList = (p.needs || []).map(n => NEED_LABELS[n] || n).join(', ');
    const sinceTxt = p.stranded_since ? 'Since ' + new Date(p.stranded_since).toLocaleDateString() : '';
    const story = _successByStranded[p.id];
    const isMatched = !!story; // story only exists if offer_confirmed=true
    const hasHome = isMatched && story?.home_lat;
    const dotType = isMatched ? 'success' : 'stranded';
    const dotLabel = hasHome ? 'home' : isMatched ? 'story' : 'stranded';
    const _sd = buildUserDot(dotType, p.group_size || 1, dotLabel, 50);
    const icon = L.divIcon({ className: '', html: _sd.html, iconSize: [_sd.sz, _sd.sz], iconAnchor: [_sd.sz/2, _sd.sz/2] });
    const marker = L.marker([p.current_lat, p.current_lng], { icon, groupSize: p.group_size || 1 });
    const uid = p.id.slice(0,8);
    const toggleBar = story ? `
      <div class="success-popup-toggle spt-wrap-${uid}" style="margin-bottom:.5rem">
        <button class="spt-btn active" onclick="showSuccessTab(this,'story','${uid}')">✓ Success Story</button>
        <button class="spt-btn" onclick="showSuccessTab(this,'original','${uid}')">Original Post</button>
      </div>` : '';
    const storyTab = story ? buildSuccessTab(story, uid) : '';
    const originalStyle = story ? 'display:none' : '';
    const popHtml = `
      <div class="spt-wrap-${uid}" style="font-family:Inter,sans-serif">
        ${toggleBar}
        ${storyTab}
        <div data-sptab="original" style="${originalStyle}">
        <div style="font-size:.6rem;font-weight:700;text-transform:uppercase;color:#ec3452;margin-bottom:.3rem">STRANDED · ${age}</div>
        ${p.name ? '<div style="font-size:.95rem;font-weight:800;color:#fff;margin-bottom:.15rem">'+esc(p.name)+'</div>' : ''}
        <div style="font-size:.82rem;font-weight:600;color:rgba(255,255,255,.7);margin-bottom:.2rem">${p.group_size > 1 ? p.group_size + ' people' : '1 person'}${p.nationality ? ' · ' + p.nationality : ''}</div>
        <div style="font-size:.78rem;color:rgba(255,255,255,.6);margin-bottom:.15rem">From: ${esc(p.current_location)}</div>
        <div style="font-size:.78rem;color:rgba(255,255,255,.6);margin-bottom:.35rem">Need to reach: <strong style="color:#fff">${esc(p.destination)}</strong>${p.dest_airport ? ' <span style="background:rgba(255,255,255,.1);padding:.1rem .4rem;border-radius:4px;font-size:.65rem;font-weight:600">✈ '+p.dest_airport+'</span>' : ''}</div>
        ${needsList ? `<div style="font-size:.72rem;color:#e67e22;margin-bottom:.25rem">Needs: ${needsList}</div>` : ''}
        ${sinceTxt ? `<div style="font-size:.68rem;color:rgba(255,255,255,.35);margin-bottom:.25rem">${sinceTxt}</div>` : ''}
        ${p.details ? `<div style="font-size:.78rem;color:rgba(255,255,255,.5);line-height:1.45;margin-top:.35rem">${esc(p.details)}</div>` : ''}
        ${buildContactButtons(p.contact, p.xhandle, p.name)}
        ${buildSendHelpButton(p.xhandle, !!p.user_id)}
        ${buildFlagButton('stranded_people', p.id)}
        </div>
      </div>
    `;
    if (isMobile) {
      marker.on('click', function(e) { L.DomEvent.stopPropagation(e); openMPinSheet(popHtml); });
    } else {
      marker.bindPopup(popHtml, { className: 'dark-popup', maxWidth: 280 });
    }
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
// STRANDED PETS
// ============================================================
const PET_STATUS_LABELS = { need_foster:'Needs Foster', found_stray:'Found Stray', can_foster:'Can Foster' };
const PET_STATUS_COLORS = { need_foster:'#ff9f1c', found_stray:'#ec3452', can_foster:'#22c55e' };
const PET_ANIMAL_ICONS  = { dog:'🐕', cat:'🐈', bird:'🐦', other:'🐾' };

async function loadPets() {
  try {
    const { data } = await withTimeout(_sb.from('stranded_pets').select('*')
      .eq('flagged', false).order('created_at', { ascending: false }).limit(500));
    _petPosts = data || [];
    renderPetsOnMap(window._crisisMap, false);
    renderPetsOnMap(window._mobileMap, true);
    updateFilterBadges();
  } catch(e) { console.error('Load pets error:', e); }
}

function renderPetsOnMap(map, isMobile) {
  if (!map) return;
  const clusterRef = isMobile ? _mPetCluster : _petCluster;
  if (clusterRef) map.removeLayer(clusterRef);

  const cluster = L.markerClusterGroup({
    maxClusterRadius: 60, spiderfyOnMaxZoom: true, showCoverageOnHover: false, zoomToBoundsOnClick: true,
    iconCreateFunction: function(c) {
      const count = c.getChildCount();
      const d = buildUserDot('pet', count, 'pets', 50);
      return L.divIcon({ html: d.html, className: '', iconSize: [d.sz, d.sz], iconAnchor: [d.sz/2, d.sz/2] });
    }
  });

  for (const p of _petPosts) {
    if (!p.lat || !p.lng) continue;
    const age = timeAgo(p.created_at);
    const statusLabel = PET_STATUS_LABELS[p.pet_status] || p.pet_status;
    const statusColor = PET_STATUS_COLORS[p.pet_status] || '#ff9f1c';
    const animalIcon = PET_ANIMAL_ICONS[p.animal_type] || '🐾';
    const _petIsMatched = !!_petMatchByPet[p.id];
    const _pd = buildUserDot(_petIsMatched ? 'success' : 'pet', 1, _petIsMatched ? '✓' : animalIcon, 50);
    const icon = L.divIcon({ className: '', html: _pd.html, iconSize: [_pd.sz, _pd.sz], iconAnchor: [_pd.sz/2, _pd.sz/2] });
    const marker = L.marker([p.lat, p.lng], { icon });
    const popHtml = `
      <div style="font-family:Inter,sans-serif">
        <div style="display:flex;align-items:center;gap:.4rem;margin-bottom:.3rem">
          <span style="font-size:1.2rem">${animalIcon}</span>
          <span style="font-size:.6rem;font-weight:800;text-transform:uppercase;color:${statusColor};letter-spacing:.04em">${statusLabel}</span>
          <span style="font-size:.55rem;color:rgba(255,255,255,.3);margin-left:auto">${age}</span>
        </div>
        ${p.pet_name ? '<div style="font-size:.95rem;font-weight:800;color:#fff;margin-bottom:.15rem">'+esc(p.pet_name)+'</div>' : ''}
        <div style="font-size:.72rem;font-weight:600;color:rgba(255,255,255,.5);margin-bottom:.15rem;text-transform:capitalize">${p.animal_type}</div>
        <div style="font-size:.78rem;color:rgba(255,255,255,.6);margin-bottom:.2rem">📍 ${esc(p.location)}</div>
        <div style="font-size:.78rem;color:rgba(255,255,255,.5);line-height:1.5;margin-bottom:.4rem">${esc(p.description)}</div>
        <div style="font-size:.72rem;color:rgba(255,255,255,.45);margin-bottom:.3rem">Posted by <strong style="color:#fff">${esc(p.name)}</strong></div>
        ${buildContactButtons(p.contact, p.xhandle, p.name)}
        ${buildPetMatchButton(p)}
        ${buildFlagButton('stranded_pets', p.id)}
      </div>`;
    if (isMobile) {
      marker.on('click', function(e) { L.DomEvent.stopPropagation(e); openMPinSheet(popHtml); });
    } else {
      marker.bindPopup(popHtml, { className: 'dark-popup', maxWidth: 280 });
    }
    cluster.addLayer(marker);
  }

  map.addLayer(cluster);
  if (isMobile) _mPetCluster = cluster;
  else _petCluster = cluster;
}

function renderFilteredPets(map, isMobile, filteredPets) {
  if (!map) return;
  const clusterRef = isMobile ? _mPetCluster : _petCluster;
  if (clusterRef) map.removeLayer(clusterRef);

  const cluster = L.markerClusterGroup({
    maxClusterRadius: 60, spiderfyOnMaxZoom: true, showCoverageOnHover: false, zoomToBoundsOnClick: true,
    iconCreateFunction: function(c) {
      const count = c.getChildCount();
      const d = buildUserDot('pet', count, 'pets', 50);
      return L.divIcon({ html: d.html, className: '', iconSize: [d.sz, d.sz], iconAnchor: [d.sz/2, d.sz/2] });
    }
  });

  for (const p of filteredPets) {
    if (!p.lat || !p.lng) continue;
    const age = timeAgo(p.created_at);
    const statusLabel = PET_STATUS_LABELS[p.pet_status] || p.pet_status;
    const statusColor = PET_STATUS_COLORS[p.pet_status] || '#ff9f1c';
    const animalIcon = PET_ANIMAL_ICONS[p.animal_type] || '🐾';
    const _petIsMatched = !!_petMatchByPet[p.id];
    const _pd = buildUserDot(_petIsMatched ? 'success' : 'pet', 1, _petIsMatched ? '✓' : animalIcon, 50);
    const icon = L.divIcon({ className: '', html: _pd.html, iconSize: [_pd.sz, _pd.sz], iconAnchor: [_pd.sz/2, _pd.sz/2] });
    const marker = L.marker([p.lat, p.lng], { icon });
    const popHtml = `
      <div style="font-family:Inter,sans-serif">
        <div style="display:flex;align-items:center;gap:.4rem;margin-bottom:.3rem">
          <span style="font-size:1.2rem">${animalIcon}</span>
          <span style="font-size:.6rem;font-weight:800;text-transform:uppercase;color:${statusColor};letter-spacing:.04em">${statusLabel}</span>
          <span style="font-size:.55rem;color:rgba(255,255,255,.3);margin-left:auto">${age}</span>
        </div>
        ${p.pet_name ? '<div style="font-size:.95rem;font-weight:800;color:#fff;margin-bottom:.15rem">'+esc(p.pet_name)+'</div>' : ''}
        <div style="font-size:.72rem;font-weight:600;color:rgba(255,255,255,.5);margin-bottom:.15rem;text-transform:capitalize">${p.animal_type}</div>
        <div style="font-size:.78rem;color:rgba(255,255,255,.6);margin-bottom:.2rem">📍 ${esc(p.location)}</div>
        <div style="font-size:.78rem;color:rgba(255,255,255,.5);line-height:1.5;margin-bottom:.4rem">${esc(p.description)}</div>
        <div style="font-size:.72rem;color:rgba(255,255,255,.45);margin-bottom:.3rem">Posted by <strong style="color:#fff">${esc(p.name)}</strong></div>
        ${buildContactButtons(p.contact, p.xhandle, p.name)}
        ${buildPetMatchButton(p)}
        ${buildFlagButton('stranded_pets', p.id)}
      </div>`;
    if (isMobile) {
      marker.on('click', function(e) { L.DomEvent.stopPropagation(e); openMPinSheet(popHtml); });
    } else {
      marker.bindPopup(popHtml, { className: 'dark-popup', maxWidth: 280 });
    }
    cluster.addLayer(marker);
  }

  map.addLayer(cluster);
  if (isMobile) _mPetCluster = cluster;
  else _petCluster = cluster;
}

function initPetRealtime() {
  _sb.channel('stranded_pets').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'stranded_pets' }, payload => {
    if (payload.new && !payload.new.flagged) {
      _petPosts.unshift(payload.new);
      renderPetsOnMap(window._crisisMap, false);
      renderPetsOnMap(window._mobileMap, true);
    }
  }).subscribe();
}

async function submitPet(prefix) {
  const status = document.getElementById(prefix + '-pet-status')?.value;
  const animalType = document.getElementById(prefix + '-pet-animal')?.value;
  const petName = document.getElementById(prefix + '-pet-name')?.value?.trim() || '';
  const desc = document.getElementById(prefix + '-pet-desc')?.value?.trim();
  const loc = document.getElementById(prefix + '-pet-location')?.value?.trim();
  const lat = parseFloat(document.getElementById(prefix + '-pet-lat')?.value) || null;
  const lng = parseFloat(document.getElementById(prefix + '-pet-lng')?.value) || null;
  const name = document.getElementById(prefix + '-pet-poster')?.value?.trim();
  const contact = document.getElementById(prefix + '-pet-contact')?.value?.trim();

  if (!status) return alert('Please select a situation.');
  if (!animalType) return alert('Please select the animal type.');
  if (!desc || desc.length < 5) return alert('Please describe the situation (min 5 chars).');
  if (!loc) return alert('Please enter a location.');
  if (!name) return alert('Please enter your name.');
  if (!contact) return alert('Please enter contact info.');

  const btn = document.getElementById(prefix + '-pet-submit');
  if (btn) { btn.disabled = true; btn.textContent = 'Posting...'; }

  try {
    const row = {
      pet_status: status, animal_type: animalType, pet_name: petName || null,
      description: desc, location: loc, lat, lng, name, contact,
      xhandle: (_currentProfile?.x_handle) || null,
      user_id: _currentUser?.id || null,
      avatar_url: _currentProfile?.avatar_url || '',
      flagged: containsLink(desc)
    };
    const { error } = await _sb.from('stranded_pets').insert(row);
    if (error) throw error;
    alert('Pet post submitted! It will appear on the map shortly.');
    // Clear form
    ['pet-status','pet-animal','pet-name','pet-desc','pet-location','pet-lat','pet-lng','pet-poster','pet-contact'].forEach(f => {
      const el = document.getElementById(prefix + '-' + f);
      if (el) el.value = '';
    });
    loadPets();
  } catch(e) {
    alert('Error: ' + e.message);
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = 'Submit Pet Post'; }
  }
}

// ============================================================
// PET MATCH SYSTEM — mirrors success_stories for rooms
// ============================================================
let _petMatches = [];
let _petMatchByPet = {};     // pet_post_id → match
let _petMatchByFoster = {};  // foster_post_id → match

async function loadPetMatches() {
  if (!SB_ON) return;
  try {
    const { data } = await withTimeout(_sb.from('pet_matches')
      .select('*').eq('foster_confirmed', true)
      .order('confirmed_at', { ascending: false }).limit(200));
    _petMatches = data || [];
  } catch(e) { /* table may not exist yet */ }
  _petMatchByPet = {};
  _petMatchByFoster = {};
  for (const m of _petMatches) {
    _petMatchByPet[m.pet_post_id] = m;
    _petMatchByFoster[m.foster_post_id] = m;
  }
}

function buildPetMatchButton(petPost) {
  if (!isLoggedIn() || !petPost?.id || !petPost?.user_id) return '';
  const myId = _currentUser?.id;
  if (!myId) return '';

  // Check if already matched
  if (_petMatchByPet[petPost.id]) {
    const m = _petMatchByPet[petPost.id];
    const reunitedLabel = m.reunited ? '🏠 Reunited!' : '✅ Fostered';
    return `<div style="margin-top:.5rem;padding:.45rem .6rem;background:rgba(34,197,94,.1);border:1px solid rgba(34,197,94,.2);border-radius:8px;text-align:center;font-size:.7rem;font-weight:700;color:#22c55e">${reunitedLabel}${m.foster_name ? ' by '+esc(m.foster_name) : ''}</div>`;
  }

  // If I'm the pet owner viewing someone else's can_foster, or I'm a foster viewing a need_foster/found_stray
  if (petPost.pet_status === 'can_foster' && petPost.user_id !== myId) {
    // I need a foster — check if I have an active need_foster or found_stray post
    const myPetPost = _petPosts.find(p => p.user_id === myId && (p.pet_status === 'need_foster' || p.pet_status === 'found_stray'));
    if (myPetPost) {
      return `<button onclick="requestPetMatch('${myPetPost.id}','${petPost.id}')" style="margin-top:.5rem;width:100%;padding:.5rem;background:rgba(255,159,28,.12);border:1px solid rgba(255,159,28,.25);border-radius:8px;color:#ff9f1c;font-family:Inter,sans-serif;font-size:.72rem;font-weight:700;cursor:pointer">🐾 Request This Foster</button>`;
    }
  } else if ((petPost.pet_status === 'need_foster' || petPost.pet_status === 'found_stray') && petPost.user_id !== myId) {
    // I can foster — check if I have an active can_foster post
    const myFosterPost = _petPosts.find(p => p.user_id === myId && p.pet_status === 'can_foster');
    if (myFosterPost) {
      return `<button onclick="requestPetMatch('${petPost.id}','${myFosterPost.id}')" style="margin-top:.5rem;width:100%;padding:.5rem;background:rgba(34,197,94,.12);border:1px solid rgba(34,197,94,.25);border-radius:8px;color:#22c55e;font-family:Inter,sans-serif;font-size:.72rem;font-weight:700;cursor:pointer">🐾 Offer to Foster This Pet</button>`;
    }
  }
  return '';
}

async function requestPetMatch(petPostId, fosterPostId) {
  if (!isLoggedIn()) return;
  // Check for existing match
  try {
    const { data: existing } = await _sb.from('pet_matches')
      .select('id,foster_confirmed').eq('pet_post_id', petPostId).maybeSingle();
    if (existing?.foster_confirmed) { alert('This pet already has a confirmed foster!'); return; }
    if (existing) { alert('A match request is already pending for this pet.'); return; }
  } catch(e) { /* table may not exist */ }

  const petPost = _petPosts.find(p => p.id === petPostId);
  const fosterPost = _petPosts.find(p => p.id === fosterPostId);
  if (!petPost || !fosterPost) { alert('Could not find the posts.'); return; }

  if (!confirm(`Match "${petPost.pet_name || petPost.animal_type}" with foster "${fosterPost.name}"?`)) return;

  try {
    const { error } = await _sb.from('pet_matches').insert({
      pet_post_id: petPostId,
      foster_post_id: fosterPostId,
      pet_user_id: petPost.user_id || null,
      foster_user_id: fosterPost.user_id || null,
      pet_confirmed: true,
      foster_confirmed: false,
      pet_lat: petPost.lat, pet_lng: petPost.lng,
      pet_location: petPost.location,
      pet_name: petPost.pet_name || petPost.animal_type,
      animal_type: petPost.animal_type,
      foster_lat: fosterPost.lat, foster_lng: fosterPost.lng,
      foster_location: fosterPost.location,
      foster_name: fosterPost.name,
    });
    if (error) throw error;
    alert('✅ Match request sent! The foster will see it in their notifications.');
    loadPetMatches();
  } catch(e) { alert('Error: ' + e.message); }
}

async function confirmPetMatch(matchId) {
  if (!isLoggedIn()) return;
  if (!confirm('Confirm you are fostering this pet?')) return;
  try {
    const { error } = await _sb.from('pet_matches').update({
      foster_confirmed: true,
      confirmed_at: new Date().toISOString()
    }).eq('id', matchId).eq('foster_user_id', _currentUser.id);
    if (error) throw error;
    alert('🎉 Confirmed! This match will appear as a green pin on the map.');
    loadPetMatches();
    loadPets();
  } catch(e) { alert('Error: ' + e.message); }
}

async function markPetReunited(matchId) {
  if (!isLoggedIn()) return;
  const story = prompt('How did the reunion go? (optional, 200 chars max)');
  try {
    const { error } = await _sb.from('pet_matches').update({
      reunited: true,
      reunited_story: story ? story.slice(0, 200) : null
    }).eq('id', matchId);
    if (error) throw error;
    alert('🏠 Marked as reunited! Thank you for the update.');
    loadPetMatches();
  } catch(e) { alert('Error: ' + e.message); }
}


// ════════════════════════════════════════════════════════════════
// SUCCESS STORIES / MATCH SYSTEM
// ════════════════════════════════════════════════════════════════
/*
  SUPABASE — run this SQL once in your dashboard:

  create table public.success_stories (
    id uuid default gen_random_uuid() primary key,
    stranded_post_id uuid not null,
    offer_post_id uuid not null,
    stranded_user_id uuid not null,
    offer_user_id uuid not null,
    stranded_story text,
    offer_story text,
    stranded_confirmed boolean default true,
    offer_confirmed boolean default false,
    confirmed_at timestamptz,
    -- Stranded person's location at time of match
    stranded_lat double precision,
    stranded_lng double precision,
    stranded_location text,
    stranded_name text,
    -- Spare room location
    lat double precision,
    lng double precision,
    offer_location text,
    offer_xhandle text,
    offer_name text,
    -- "Got home" follow-up
    home_lat double precision,
    home_lng double precision,
    home_location text,
    home_story text,
    created_at timestamptz default now()
  );
  alter table public.success_stories enable row level security;
  create policy "read_confirmed" on public.success_stories
    for select using (offer_confirmed = true);
  create policy "read_own" on public.success_stories
    for select using (auth.uid() = stranded_user_id or auth.uid() = offer_user_id);
  create policy "stranded_insert" on public.success_stories
    for insert with check (auth.uid() = stranded_user_id);
  create policy "update_own" on public.success_stories
    for update using (auth.uid() = stranded_user_id or auth.uid() = offer_user_id);
*/

let _successStories = [];
let _successByOffer = {};    // offer_post_id → story (for popup toggles)
let _successByStranded = {}; // stranded_post_id → story
let _successLayer = null;
let _mSuccessLayer = null;
let _arcLayer = null;
let _mArcLayer = null;

// ── Haversine distance (km) ──────────────────────────────────
function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371, toRad = x => x * Math.PI / 180;
  const dLat = toRad(lat2 - lat1), dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat/2)**2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

// ── Quadratic bezier arc between two lat/lng points ──────────
function arcPoints(p1, p2, n = 40) {
  const midLat = (p1[0]+p2[0])/2, midLng = (p1[1]+p2[1])/2;
  const dLat = p2[0]-p1[0], dLng = p2[1]-p1[1];
  const dist = Math.sqrt(dLat*dLat + dLng*dLng);
  if (dist < 0.001) return [p1, p2];
  const bend = Math.min(dist * 0.38, 8); // cap bend for very long arcs
  const ctrlLat = midLat - (dLng/dist) * bend;
  const ctrlLng = midLng + (dLat/dist) * bend;
  const pts = [];
  for (let i=0; i<=n; i++) {
    const t = i/n;
    pts.push([
      (1-t)*(1-t)*p1[0] + 2*(1-t)*t*ctrlLat + t*t*p2[0],
      (1-t)*(1-t)*p1[1] + 2*(1-t)*t*ctrlLng + t*t*p2[1]
    ]);
  }
  return pts;
}

// ── Build lookup maps for popup toggles ─────────────────────
function buildSuccessLookups() {
  _successByOffer = {};
  _successByStranded = {};
  for (const s of _successStories) {
    if (s.offer_post_id) _successByOffer[s.offer_post_id] = s;
    if (s.stranded_post_id) _successByStranded[s.stranded_post_id] = s;
  }
}

// ── Success popup toggle (called inline from popup HTML) ─────
function showSuccessTab(btn, tab, uid) {
  const wrap = document.querySelector(`.spt-wrap-${uid}`);
  if (!wrap) return;
  wrap.querySelectorAll('.spt-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  wrap.querySelectorAll('[data-sptab]').forEach(el => {
    el.style.display = el.dataset.sptab === tab ? '' : 'none';
  });
}

// ── Build success story tab HTML for a popup ─────────────────
function buildSuccessTab(s, uid) {
  const sStory = s.stranded_story ? `<div style="font-size:.78rem;color:rgba(255,255,255,.55);line-height:1.5;margin:.3rem 0;padding-left:.5rem;border-left:2px solid rgba(236,52,82,.4)">"${esc(s.stranded_story)}"<div style="font-size:.63rem;color:rgba(255,255,255,.25);margin-top:.15rem">— ${s.stranded_name||'Stranded person'}</div></div>` : '';
  const oStory = s.offer_story ? `<div style="font-size:.78rem;color:rgba(255,255,255,.55);line-height:1.5;margin:.3rem 0;padding-left:.5rem;border-left:2px solid rgba(52,152,236,.4)">"${esc(s.offer_story)}"<div style="font-size:.63rem;color:rgba(255,255,255,.25);margin-top:.15rem">— ${s.offer_name||'Host'}</div></div>` : '';
  const homeNote = s.home_location ? `<div style="font-size:.68rem;color:#22c55e;margin-top:.35rem">🏠 Made it home to ${s.home_location}</div>` : '';
  const date = s.confirmed_at ? new Date(s.confirmed_at).toLocaleDateString() : '';
  return `<div data-sptab="story">
    <div style="font-size:.6rem;font-weight:800;text-transform:uppercase;letter-spacing:.07em;color:#22c55e;margin-bottom:.3rem">✓ Matched · ${date}</div>
    <div style="font-size:.88rem;font-weight:700;color:#fff;margin-bottom:.2rem">${esc(s.offer_name)||'A helper'} welcomed ${esc(s.stranded_name)||'someone stranded'}</div>
    ${sStory}${oStory}
    ${!sStory&&!oStory ? '<div style="font-size:.72rem;color:rgba(255,255,255,.22);font-style:italic;margin-bottom:.2rem">No story shared yet.</div>' : ''}
    ${homeNote}
  </div>`;
}

// ── Load confirmed stories, build lookups, render everything ─
async function loadSuccessStories() {
  if (!SB_ON) return;
  try {
    const { data } = await withTimeout(_sb.from('success_stories')
      .select('id,stranded_post_id,offer_post_id,offer_confirmed,stranded_lat,stranded_lng,stranded_location,stranded_name,lat,lng,offer_location,offer_xhandle,offer_name,stranded_story,offer_story,home_lat,home_lng,home_location,home_story,confirmed_at')
      .eq('offer_confirmed', true)
      .order('confirmed_at', { ascending: false })
      .limit(500));
    _successStories = data || [];
  } catch(e) { console.warn('[loadSuccessStories]', e.message); }
  buildSuccessLookups();
  renderSuccessOnMap(window._crisisMap, true);
  renderSuccessOnMap(window._mobileMap, true);
  drawSuccessArcs(window._crisisMap);
  drawSuccessArcs(window._mobileMap);
  // Refresh stranded + offer markers so toggles appear
  if (window._crisisMap) { renderPostsOnMap(window._crisisMap); renderStrandedOnMap(window._crisisMap, false); }
  if (window._mobileMap) { renderPostsOnMap(window._mobileMap); renderStrandedOnMap(window._mobileMap, true); }
  updateFilterBadges();
}

function renderSuccessOnMap(map, showHome = true) {
  if (!map) return;
  const isMobileM = map === window._mobileMap;
  const key = isMobileM ? '_mSuccessLayer' : '_successLayer';
  if (window[key]) map.removeLayer(window[key]);
  window[key] = L.layerGroup();
  for (const s of _successStories) {
    // Green pin at room location
    if (s.lat && s.lng) {
      const uid = s.id.slice(0,8);
      const _sucD = buildUserDot('success', 1, 'story', 50);
      const icon = L.divIcon({ className: '', html: _sucD.html, iconSize: [_sucD.sz, _sucD.sz], iconAnchor: [_sucD.sz/2, _sucD.sz/2] });
      const popHtml = `<div class="spt-wrap-${uid}" style="font-family:Inter,sans-serif">${buildSuccessTab(s, uid)}</div>`;
      const marker = L.marker([s.lat, s.lng], { icon });
      if (isMobileM) marker.on('click', e => { L.DomEvent.stopPropagation(e); openMPinSheet(popHtml); });
      else marker.bindPopup(popHtml, { className: 'dark-popup', maxWidth: 290 });
      window[key].addLayer(marker);
    }
    // Extra pin at home location if they made it
    if (showHome && s.home_lat && s.home_lng) {
      const _homeD = buildUserDot('success', 1, 'home', 50);
      const homeIcon = L.divIcon({ className: '', html: _homeD.html, iconSize: [_homeD.sz, _homeD.sz], iconAnchor: [_homeD.sz/2, _homeD.sz/2] });
      const homePop = `<div style="font-family:Inter,sans-serif"><div style="font-size:.6rem;font-weight:800;text-transform:uppercase;color:#22c55e;margin-bottom:.3rem">🏠 Made it home</div><div style="font-size:.82rem;font-weight:700;color:#fff;margin-bottom:.15rem">${s.stranded_name||'Stranded person'}</div><div style="font-size:.73rem;color:rgba(255,255,255,.45)">${esc(s.home_location)||''}</div>${s.home_story?`<div style="font-size:.75rem;color:rgba(255,255,255,.5);margin-top:.35rem;line-height:1.5;padding-left:.5rem;border-left:2px solid rgba(34,197,94,.4)">"${esc(s.home_story)}"</div>`:''}</div>`;
      const hm = L.marker([s.home_lat, s.home_lng], { icon: homeIcon });
      if (isMobileM) hm.on('click', e => { L.DomEvent.stopPropagation(e); openMPinSheet(homePop); });
      else hm.bindPopup(homePop, { className: 'dark-popup', maxWidth: 260 });
      window[key].addLayer(hm);
    }
  }
  map.addLayer(window[key]);
}

// ── Draw green arcs between matched pairs ────────────────────
function drawSuccessArcs(map) {
  if (!map) return;
  const isMobileM = map === window._mobileMap;
  const key = isMobileM ? '_mArcLayer' : '_arcLayer';
  if (window[key]) map.removeLayer(window[key]);
  window[key] = L.layerGroup();
  for (const s of _successStories) {
    // Arc 1: stranded location → offer/room location
    if (s.stranded_lat && s.stranded_lng && s.lat && s.lng) {
      const pts = arcPoints([s.stranded_lat, s.stranded_lng], [s.lat, s.lng]);
      L.polyline(pts, { color:'#22c55e', weight:1.8, opacity:.45, dashArray:'5,5', className:'success-arc', interactive:false }).addTo(window[key]);
    }
    // Arc 2: room → home (if they made it)
    if (s.lat && s.lng && s.home_lat && s.home_lng) {
      const pts2 = arcPoints([s.lat, s.lng], [s.home_lat, s.home_lng]);
      L.polyline(pts2, { color:'#22c55e', weight:2.2, opacity:.6, className:'success-arc', interactive:false }).addTo(window[key]);
    }
  }
  map.addLayer(window[key]);
}

// ── Role enforcement — one account, one role ─────────────────
async function checkUserRole(attemptingType) {
  // attemptingType: 'offer' or 'stranded'
  if (!isLoggedIn() || !SB_ON) return null;
  if (attemptingType === 'offer') {
    const { data } = await _sb.from('stranded_people').select('id').eq('user_id', _currentUser.id).eq('status','active').limit(1);
    if (data?.length) return "You're currently registered as stranded. Remove yourself from the stranded map before posting a spare room offer.";
  }
  if (attemptingType === 'stranded') {
    const { data } = await _sb.from('help_posts').select('id').eq('user_id', _currentUser.id).eq('type','offer').eq('flagged',false).limit(1);
    if (data?.length) return "You already have an active spare room offer. Remove it before registering as stranded — one account, one role.";
  }
  return null;
}

// ── "Found a place?" — open match picker from stranded card ──
let _matchPickerStrandedId = null;

async function openMatchPicker(strandedPostId, strandedLat, strandedLng, strandedName, strandedLocation) {
  if (!await ensureSession()) { alert('Please sign in first.'); return; }
  _matchPickerStrandedId = strandedPostId;

  const { data: existing } = await _sb.from('success_stories')
    .select('id,offer_confirmed').eq('stranded_post_id', strandedPostId).eq('stranded_user_id', _currentUser.id).maybeSingle();
  if (existing?.offer_confirmed) { openStoryPrompt(existing.id, 'stranded'); return; }
  if (existing && !existing.offer_confirmed) { alert("Your match request is waiting for the host to approve — they'll see it in their profile."); return; }

  const lat = parseFloat(strandedLat), lng = parseFloat(strandedLng);
  let offerList = posts.filter(p => p.lat && p.lng && p.user_id);
  if (lat && lng) {
    offerList = offerList.map(p => ({ ...p, _dist: haversineKm(lat, lng, p.lat, p.lng) }))
                         .sort((a,b) => a._dist - b._dist);
  }

  const body = document.getElementById('match-modal-body');
  body.innerHTML = `
    <div class="match-modal-title">🏠 Who gave you a place?</div>
    <div class="match-modal-sub">Select the spare room post that helped you. The host gets notified and approves — which enters them into the weekly $HELP pool.</div>
    <div id="match-offer-list">
      ${offerList.length === 0
        ? '<div style="color:rgba(255,255,255,.35);font-size:.8rem;padding:1rem 0 .5rem">No spare room posts found near you.</div>'
        : offerList.slice(0, 15).map(p => `
        <div class="match-offer-card" onclick="selectMatchOffer(this,'${p.id}','${p.user_id||''}','${(p.location||'').replace(/'/g,"\\'")}','${p.xhandle||''}','${p.lat||0}','${p.lng||0}','${(p.name||'').replace(/'/g,"\\'")}')">
          <div class="match-offer-name">${esc(p.name)||'Anonymous'}</div>
          <div class="match-offer-loc">📍 ${esc(p.location)||'Unknown'}</div>
          ${p._dist != null ? `<div class="match-offer-dist">${p._dist < 1 ? '<1' : Math.round(p._dist)} km away</div>` : ''}
          ${p.body ? `<div class="match-offer-body">${esc(p.body).slice(0,100)}${p.body.length>100?'…':''}</div>` : ''}
        </div>`).join('')}
    </div>
    <div style="display:flex;gap:.5rem;margin-top:.9rem">
      <button onclick="closeMatchModal()" style="flex:1;padding:.5rem;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);border-radius:9px;color:rgba(255,255,255,.4);font-family:Inter,sans-serif;font-size:.75rem;font-weight:700;cursor:pointer">Cancel</button>
      <button id="match-confirm-btn" onclick="submitMatchRequest('${strandedPostId}','${(strandedName||'').replace(/'/g,"\\'")}','${(strandedLocation||'').replace(/'/g,"\\'")}','${lat||0}','${lng||0}')" disabled style="flex:2;padding:.5rem;background:#22c55e;border:none;border-radius:9px;color:#000;font-family:Inter,sans-serif;font-size:.75rem;font-weight:800;cursor:pointer;opacity:.3">Confirm Match →</button>
    </div>`;
  document.getElementById('match-modal').classList.add('open');
}

let _selectedOffer = null;

function selectMatchOffer(el, offerId, offerUserId, offerLocation, offerXhandle, lat, lng, offerName) {
  document.querySelectorAll('.match-offer-card').forEach(c => c.classList.remove('selected'));
  el.classList.add('selected');
  _selectedOffer = { offerId, offerUserId, offerLocation, offerXhandle, lat: parseFloat(lat), lng: parseFloat(lng), offerName };
  const btn = document.getElementById('match-confirm-btn');
  if (btn) { btn.disabled = false; btn.style.opacity = '1'; }
}

async function submitMatchRequest(strandedPostId, strandedName, strandedLocation, sLat, sLng) {
  if (!_selectedOffer || !isLoggedIn()) return;
  const btn = document.getElementById('match-confirm-btn');
  if (btn) { btn.textContent = 'Sending…'; btn.disabled = true; }
  try {
    const { error } = await _sb.from('success_stories').insert({
      stranded_post_id: strandedPostId,
      offer_post_id: _selectedOffer.offerId,
      stranded_user_id: _currentUser.id,
      offer_user_id: _selectedOffer.offerUserId,
      stranded_confirmed: true,
      offer_confirmed: false,
      stranded_lat: parseFloat(sLat) || null,
      stranded_lng: parseFloat(sLng) || null,
      stranded_location: strandedLocation || null,
      stranded_name: strandedName || _currentProfile?.display_name || null,
      lat: _selectedOffer.lat || null,
      lng: _selectedOffer.lng || null,
      offer_location: _selectedOffer.offerLocation || null,
      offer_xhandle: _selectedOffer.offerXhandle || null,
      offer_name: _selectedOffer.offerName || null,
    });
    if (error) throw error;
    closeMatchModal();
    renderProfileStranded();
    alert('✅ Match request sent! The host will see it in their profile and approve — entering them into the weekly $HELP pool.');
  } catch(e) {
    alert('Error: ' + e.message);
    if (btn) { btn.textContent = 'Confirm Match →'; btn.disabled = false; btn.style.opacity = '1'; }
  }
}

function closeMatchModal() {
  document.getElementById('match-modal').classList.remove('open');
  _selectedOffer = null;
  _matchPickerStrandedId = null;
}

// ── Pending match notifications on offer cards ──────────────
async function injectMatchNotifications(listElId) {
  if (!isLoggedIn() || !SB_ON) return;
  const { data: pending } = await _sb.from('success_stories')
    .select('id,offer_post_id,stranded_name,offer_confirmed')
    .eq('offer_user_id', _currentUser.id)
    .eq('offer_confirmed', false);
  if (!pending?.length) return;
  const list = document.getElementById(listElId);
  if (!list) return;
  for (const s of pending) {
    const card = list.querySelector(`[data-post-id="${s.offer_post_id}"]`);
    if (!card || card.querySelector('.match-notif-banner')) continue;
    const banner = document.createElement('div');
    banner.className = 'match-notif-banner';
    banner.innerHTML = `<div class="match-notif-dot"></div>
      <div class="match-notif-text"><strong style="color:#22c55e">${esc(s.stranded_name)||'Someone'}</strong> says you helped them. Approve to enter the weekly $HELP pool!</div>
      <button class="match-notif-btn" onclick="approveMatch('${s.id}')">Approve ✓</button>`;
    card.appendChild(banner);
  }
}

// ── Approve match (offer-side) ───────────────────────────────
async function approveMatch(storyId) {
  if (!isLoggedIn()) return;
  try {
    const { error } = await _sb.from('success_stories').update({
      offer_confirmed: true, confirmed_at: new Date().toISOString()
    }).eq('id', storyId).eq('offer_user_id', _currentUser.id);
    if (error) throw error;
    await loadSuccessStories();
    renderProfilePosts();
    mRenderProfilePosts();
    openStoryPrompt(storyId, 'offer');
  } catch(e) { alert('Error approving match: ' + e.message); }
}

// ── Story prompt ─────────────────────────────────────────────
async function openStoryPrompt(storyId, side) {
  const { data: s } = await _sb.from('success_stories')
    .select('stranded_story,offer_story,stranded_name,offer_name').eq('id', storyId).single();
  if (!s) return;
  const existing = side === 'stranded' ? (s.stranded_story||'') : (s.offer_story||'');
  const other = side === 'stranded' ? (s.offer_name||'your host') : (s.stranded_name||'the person you helped');
  const maxLen = 200;
  const body = document.getElementById('story-modal-body');
  body.innerHTML = `
    <div class="match-modal-title" style="color:#22c55e">🎉 You're matched!</div>
    <div class="match-modal-sub">Want to share what happened with ${other}? It'll appear on the map as a green pin. (Optional, ${maxLen} chars max)</div>
    <textarea class="story-textarea" id="story-text" maxlength="${maxLen}" placeholder="In a few words, what happened…" oninput="document.getElementById('story-char-count').textContent=(${maxLen}-this.value.length)+' left'">${existing}</textarea>
    <div class="story-char-count" id="story-char-count">${maxLen - existing.length} left</div>
    <div style="display:flex;gap:.5rem">
      <button onclick="closeStoryModal()" style="flex:1;padding:.5rem;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);border-radius:9px;color:rgba(255,255,255,.4);font-family:Inter,sans-serif;font-size:.75rem;font-weight:700;cursor:pointer">Skip</button>
      <button onclick="submitStory('${storyId}','${side}')" style="flex:2;padding:.5rem;background:#22c55e;border:none;border-radius:9px;color:#000;font-family:Inter,sans-serif;font-size:.75rem;font-weight:800;cursor:pointer">Share Story →</button>
    </div>`;
  document.getElementById('story-modal').classList.add('open');
}

async function submitStory(storyId, side) {
  const text = (document.getElementById('story-text')?.value || '').trim();
  const field = side === 'stranded' ? 'stranded_story' : 'offer_story';
  try {
    if (text) await _sb.from('success_stories').update({ [field]: text }).eq('id', storyId);
    await loadSuccessStories();
    renderProfileStranded();
    closeStoryModal();
  } catch(e) { alert('Error saving story: ' + e.message); }
}

function closeStoryModal() { document.getElementById('story-modal').classList.remove('open'); }

// ── "Got home?" flow ─────────────────────────────────────────
let _goHomeStoryId = null;

async function checkAndOpenGoHome(strandedPostId) {
  if (!await ensureSession()) { alert('Please sign in first.'); return; }
  try {
    const { data, error } = await _sb.from('success_stories')
      .select('id,offer_confirmed,home_lat')
      .eq('stranded_post_id', strandedPostId)
      .eq('stranded_user_id', _currentUser.id)
      .eq('offer_confirmed', true)
      .maybeSingle();
    if (error) throw error;
    if (!data) { alert('You need a confirmed match first. Tap "Matched?" to select your host — they\'ll approve it from their profile.'); return; }
    if (data.home_lat) { alert('You\'ve already marked yourself as home!'); return; }
    openGoHomePrompt(data.id);
  } catch(e) { alert('Error checking match: ' + e.message + '. Try again.'); }
}

async function openGoHomePrompt(storyId) {
  _goHomeStoryId = storyId;
  const body = document.getElementById('gohome-modal-body');
  body.innerHTML = `
    <div class="match-modal-title">🏠 Made it home?</div>
    <div class="match-modal-sub">Add your home location and the arc on the map will extend all the way there. (Optional story, ${180} chars max)</div>
    <div class="gohome-loc-wrap">
      <input class="gohome-loc-input" id="gohome-loc" placeholder="City or country you made it to…" autocomplete="off">
      <input type="hidden" id="gohome-lat"><input type="hidden" id="gohome-lng">
      <div id="gohome-ac" class="ac-list"></div>
    </div>
    <textarea class="story-textarea" id="gohome-story" maxlength="180" placeholder="What's the first thing you did when you got home?" style="min-height:70px" oninput="document.getElementById('gohome-char').textContent=(180-this.value.length)+' left'"></textarea>
    <div class="story-char-count" id="gohome-char">180 left</div>
    <div style="display:flex;gap:.5rem">
      <button onclick="closeGoHomeModal()" style="flex:1;padding:.5rem;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);border-radius:9px;color:rgba(255,255,255,.4);font-family:Inter,sans-serif;font-size:.75rem;font-weight:700;cursor:pointer">Cancel</button>
      <button onclick="submitGoHome()" style="flex:2;padding:.5rem;background:#22c55e;border:none;border-radius:9px;color:#000;font-family:Inter,sans-serif;font-size:.75rem;font-weight:800;cursor:pointer">I'm home! →</button>
    </div>`;
  document.getElementById('gohome-modal').classList.add('open');
  initLocationAutocomplete('gohome-loc','gohome-lat','gohome-lng','gohome-ac');
}

async function submitGoHome() {
  if (!_goHomeStoryId) return;
  const loc = document.getElementById('gohome-loc')?.value?.trim();
  const lat = parseFloat(document.getElementById('gohome-lat')?.value) || null;
  const lng = parseFloat(document.getElementById('gohome-lng')?.value) || null;
  const story = document.getElementById('gohome-story')?.value?.trim() || null;
  if (!loc || !lat || !lng) { alert('Please select a location from the dropdown.'); return; }
  try {
    const { error } = await _sb.from('success_stories').update({
      home_lat: lat, home_lng: lng, home_location: loc, home_story: story || null
    }).eq('id', _goHomeStoryId).eq('stranded_user_id', _currentUser.id);
    if (error) throw error;
    await loadSuccessStories();
    renderProfileStranded();
    closeGoHomeModal();
    alert('🏠 Welcome home! Your journey is now on the map.');
  } catch(e) { alert('Error: ' + e.message); }
}

function closeGoHomeModal() {
  document.getElementById('gohome-modal').classList.remove('open');
  _goHomeStoryId = null;
}

// ── Weekly $HELP pool CSV download (admin/console) ──────────
async function downloadPoolCSV() {
  const weekAgo = new Date(Date.now() - 7*24*60*60*1000).toISOString();
  const { data } = await _sb.from('success_stories')
    .select('offer_xhandle,offer_name,offer_location,confirmed_at')
    .eq('offer_confirmed', true)
    .gte('confirmed_at', weekAgo)
    .not('offer_xhandle', 'is', null);
  if (!data?.length) { console.log('No confirmed matches this week.'); return; }
  const csv = 'X Handle,Name,Location,Confirmed\n' +
    data.map(r => `@${r.offer_xhandle},${r.offer_name||''},${r.offer_location||''},${r.confirmed_at}`).join('\n');
  const a = document.createElement('a');
  a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
  a.download = `help-pool-${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
  console.log(`Downloaded ${data.length} confirmed matches for this week's $HELP pool.`);
}
window.downloadPoolCSV = downloadPoolCSV;

// ── Context-aware action buttons ──────────────────────────
let _hasActiveOffer = false;
let _hasActiveStranded = false;
let _pendingRequestCount = 0;  // for room owners: how many stranded people requested your room
let _roomsOfferedCount = 0;    // for stranded: how many rooms have been offered/matched

async function updateActionButtons() {
  if (!isLoggedIn() || !SB_ON) {
    _hasActiveOffer = false;
    _hasActiveStranded = false;
    _pendingRequestCount = 0;
    _roomsOfferedCount = 0;
    resetActionButtons();
    return;
  }
  // Use already-loaded data if available, else query
  _hasActiveOffer = posts.some(p => p.user_id === _currentUser.id);
  _hasActiveStranded = _strandedPeople.some(p => p.user_id === _currentUser.id);
  
  // If data hasn't loaded yet, check DB
  if (!posts.length && !_strandedPeople.length) {
    try {
      const [offerRes, strandedRes] = await Promise.all([
        _sb.from('help_posts').select('id', { count: 'exact', head: true }).eq('user_id', _currentUser.id).eq('type', 'offer').eq('flagged', false),
        _sb.from('stranded_people').select('id', { count: 'exact', head: true }).eq('user_id', _currentUser.id).eq('status', 'active')
      ]);
      _hasActiveOffer = (offerRes.count || 0) > 0;
      _hasActiveStranded = (strandedRes.count || 0) > 0;
    } catch(e) { return; }
  }

  // Fetch notification counts (fire-and-forget, don't block rendering)
  _pendingRequestCount = 0;
  _roomsOfferedCount = 0;
  if (_hasActiveOffer || _hasActiveStranded) {
    try {
      if (_hasActiveOffer) {
        const myPost = posts.find(p => p.user_id === _currentUser.id);
        if (myPost) {
          const { count } = await withTimeout(_sb.from('success_stories').select('id', { count: 'exact', head: true })
            .eq('offer_post_id', myPost.id).eq('offer_confirmed', false), 4000);
          _pendingRequestCount = count || 0;
        }
      }
      if (_hasActiveStranded) {
        const myStranded = _strandedPeople.find(s => s.user_id === _currentUser.id);
        if (myStranded) {
          const { count } = await withTimeout(_sb.from('success_stories').select('id', { count: 'exact', head: true })
            .eq('stranded_post_id', myStranded.id).eq('offer_confirmed', true), 4000);
          _roomsOfferedCount = count || 0;
        }
      }
    } catch(e) {}
  }

  // ── PC buttons ──
  const pcOffer = document.getElementById('ss-offer-room');
  const pcStranded = document.getElementById('ss-im-stranded');
  if (pcOffer) {
    if (_hasActiveOffer) {
      pcOffer.querySelector('.sitrep-label').textContent = 'My Room';
      pcOffer.querySelector('.sitrep-label').style.color = '#fff';
      const badge = _pendingRequestCount > 0
        ? `<span style="display:inline-block;background:#ec3452;color:#fff;font-size:.55rem;font-weight:800;border-radius:10px;padding:.1rem .4rem;margin-left:.3rem;vertical-align:middle">${_pendingRequestCount}</span>`
        : `<span style="display:inline-block;background:rgba(255,255,255,.12);color:rgba(255,255,255,.4);font-size:.55rem;font-weight:800;border-radius:10px;padding:.1rem .4rem;margin-left:.3rem;vertical-align:middle">0</span>`;
      pcOffer.querySelector('.sitrep-sub').innerHTML = 'Requests' + badge;
      pcOffer.querySelector('svg').outerHTML = '<svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#3498ec" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>';
      pcOffer.onclick = () => openManageSidebar('offer');
    } else {
      pcOffer.querySelector('.sitrep-label').textContent = 'Offer Spare Room';
      pcOffer.querySelector('.sitrep-label').style.color = '#3498ec';
      pcOffer.querySelector('.sitrep-sub').textContent = 'tap · help someone';
      pcOffer.onclick = () => isMob() ? mTab('offer', null) : openFormSidebar('offer');
    }
  }
  if (pcStranded) {
    if (_hasActiveStranded) {
      pcStranded.querySelector('.sitrep-label').textContent = 'My Status';
      pcStranded.querySelector('.sitrep-label').style.color = '#fff';
      const badge = _roomsOfferedCount > 0
        ? `<span style="display:inline-block;background:var(--accent);color:#fff;font-size:.55rem;font-weight:800;border-radius:10px;padding:.1rem .4rem;margin-left:.3rem;vertical-align:middle">${_roomsOfferedCount}</span>`
        : `<span style="display:inline-block;background:rgba(255,255,255,.12);color:rgba(255,255,255,.4);font-size:.55rem;font-weight:800;border-radius:10px;padding:.1rem .4rem;margin-left:.3rem;vertical-align:middle">0</span>`;
      pcStranded.querySelector('.sitrep-sub').innerHTML = 'Offers' + badge;
      pcStranded.onclick = () => openManageSidebar('stranded');
    } else {
      pcStranded.querySelector('.sitrep-label').textContent = "I'm Stranded";
      pcStranded.querySelector('.sitrep-label').style.color = '#ec3452';
      pcStranded.querySelector('.sitrep-sub').textContent = 'tap · register';
      pcStranded.onclick = () => isMob() ? mTab('stranded', null) : openFormSidebar('stranded');
    }
  }

  // ── Mobile buttons ──
  const mOffer = document.getElementById('mss-offer');
  const mTabSpare = document.getElementById('mtab-spare');
  if (mOffer) {
    const mSvg = mOffer.querySelector('svg');
    if (_hasActiveStranded) {
      if (mSvg) mSvg.outerHTML = '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>';
      const rBubble = `<span style="display:inline-flex;align-items:center;justify-content:center;min-width:16px;height:16px;border-radius:8px;font-size:.5rem;font-weight:800;padding:0 .25rem;${_roomsOfferedCount > 0 ? 'background:var(--accent);color:#fff' : 'background:#000;color:#fff'}">${_roomsOfferedCount}</span>`;
      mOffer.querySelector('.m-stat-label').innerHTML = `<span style="color:#1a1a2e;font-size:.55rem;font-weight:800;letter-spacing:.06em">OFFERS ${rBubble}</span>`;
      mOffer.onclick = () => mTab('manage-stranded', null);
    } else {
      if (mSvg) mSvg.outerHTML = '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>';
      mOffer.querySelector('.m-stat-label').innerHTML = '<span style="color:#1a1a2e">HELP · I\'M STRANDED</span>';
      mOffer.onclick = () => mTab('stranded', null);
    }
  }
  if (mTabSpare) {
    if (_hasActiveOffer) {
      const reqBubble = `<span style="display:inline-flex;align-items:center;justify-content:center;min-width:16px;height:16px;border-radius:8px;font-size:.5rem;font-weight:800;padding:0 .25rem;${_pendingRequestCount > 0 ? 'background:#ec3452;color:#fff' : 'background:#000;color:#fff'}">${_pendingRequestCount}</span>`;
      mTabSpare.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1a1a2e" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg><span style="font-size:.55rem;font-weight:800;letter-spacing:.06em;margin-top:.1rem">REQUESTS ' + reqBubble + '</span>';
      mTabSpare.style.color = '#1a1a2e';
      mTabSpare.onclick = () => mTab('manage-room', null);
    } else {
      mTabSpare.innerHTML = '<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2.9" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> OFFER A SPARE ROOM';
      mTabSpare.style.color = '';
      mTabSpare.onclick = () => mTab('offer', null);
    }
  }

  // ── Profile page buttons (both PC and mobile) ──
  ['m-profile', 'pc-profile'].forEach(prefix => {
    const offerText = document.getElementById(prefix + '-btn-offer-text');
    const strandedText = document.getElementById(prefix + '-btn-stranded-text');
    const offerBtn = document.getElementById(prefix + '-btn-offer');
    const strandedBtn = document.getElementById(prefix + '-btn-stranded');
    if (offerText) offerText.textContent = _hasActiveOffer ? 'My Room' : 'Offer a Room';
    if (strandedText) strandedText.textContent = _hasActiveStranded ? 'My Status' : "I'm Stranded";
    if (offerBtn) {
      offerBtn.style.opacity = _hasActiveStranded && !_hasActiveOffer ? '.3' : '1';
      offerBtn.style.pointerEvents = _hasActiveStranded && !_hasActiveOffer ? 'none' : '';
    }
    if (strandedBtn) {
      strandedBtn.style.opacity = _hasActiveOffer && !_hasActiveStranded ? '.3' : '1';
      strandedBtn.style.pointerEvents = _hasActiveOffer && !_hasActiveStranded ? 'none' : '';
    }
  });
}

// ── Manage Dashboard ─────────────────────────────────────
function openManageSidebar(type) {
  if (isMob()) { mTab(type === 'offer' ? 'manage-room' : 'manage-stranded', null); return; }
  // PC: render into form sidebar body directly
  const sb = document.getElementById('form-sidebar');
  const body = document.getElementById('form-sidebar-body');
  const title = document.getElementById('form-sidebar-title');
  if (!sb || !body) return;
  if (sb.classList.contains('open')) closeFormSidebar();
  setTimeout(() => {
    body.innerHTML = '<div id="pc-manage-content"></div>';
    const heroColor = type === 'offer' ? '#3498ec' : '#ec3452';
    const heroIcon = type === 'stranded'
      ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ec3452" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;margin-right:.3rem"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>'
      : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3498ec" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;margin-right:.3rem"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>';
    if (title) {
      title.innerHTML = heroIcon + (type === 'offer' ? 'MY ROOM' : 'MY STATUS');
      title.style.color = heroColor;
      title.style.fontSize = '.85rem';
    }
    sb.classList.add('open');
    sb.dataset.panel = 'manage';
    document.getElementById('sidebar-overlay')?.classList.add('active');
    document.getElementById('map-view')?.style.setProperty('--right-sidebar-w', '350px');
    // Click outside to close
    setTimeout(() => {
      if (!window._fsBackdropClose) {
        window._fsBackdropClose = function(e) {
          const sb = document.getElementById('form-sidebar');
          if (sb && sb.classList.contains('open') && !sb.contains(e.target)) {
            if (e.target.closest('[onclick*="openFormSidebar"]') || e.target.closest('[onclick*="openManageSidebar"]') || e.target.closest('[onclick*="mTab"]')) return;
            closeFormSidebar();
          }
        };
      }
      document.removeEventListener('mousedown', window._fsBackdropClose);
      document.addEventListener('mousedown', window._fsBackdropClose);
    }, 100);
    renderManageDashboard(type);
  }, 50);
}

async function renderManageDashboard(type) {
  const container = isMob() ? document.getElementById('m-manage-content') : document.getElementById('pc-manage-content');
  if (!container) return;
  if (!_currentUser) {
    if (!await ensureSession()) {
      container.innerHTML = '<div style="text-align:center;padding:2rem 0;color:rgba(255,255,255,.4)">Please sign in first.</div>';
      return;
    }
  }

  // ── STRANDED ──
  if (type === 'stranded') {
    // 1. Try cache (instant, no network)
    let p = _strandedPeople.find(s => s.user_id === _currentUser.id);
    let match = p ? (_successByStranded[p.id] || null) : null;

    // 2. If cache empty, try network with tight timeout
    if (!p) {
      container.innerHTML = '<div style="text-align:center;padding:1rem 0;color:rgba(255,255,255,.4)">Loading...</div>';
      try {
        const { data } = await withTimeout(_sb.from('stranded_people')
          .select('id,name,current_location,current_lat,current_lng,destination,dest_airport,needs,group_size,stranded_since,details,created_at')
          .eq('user_id', _currentUser.id).eq('status', 'active').order('created_at', { ascending: false }).limit(1), 6000);
        p = data?.[0];
        if (p) {
          try {
            const mr = await withTimeout(_sb.from('success_stories')
              .select('id,offer_confirmed,offer_name,offer_location,home_lat,home_location,stranded_story,offer_story,confirmed_at')
              .eq('stranded_post_id', p.id).eq('stranded_user_id', _currentUser.id).maybeSingle(), 6000);
            match = mr.data;
          } catch(e) {}
        }
      } catch(e) {
        container.innerHTML = `<div style="text-align:center;padding:1.5rem 0"><div style="color:rgba(255,255,255,.5);font-size:.85rem;margin-bottom:.6rem">Connection timed out</div><button onclick="renderManageDashboard('stranded')" style="${btnStyle('accent')}">Try Again</button></div>`;
        return;
      }
    }

    if (!p) { container.innerHTML = '<div style="text-align:center;padding:2rem 0;color:rgba(255,255,255,.4)">No active registration.</div>'; return; }

    const step = match?.home_lat ? 3 : match?.offer_confirmed ? 2 : 1;
    container.innerHTML = buildProgressTracker(step, ['Registered', 'Matched', 'Home'], '#ec3452') + buildStrandedCard(p, match, step);

  // ── OFFER ──
  } else {
    // 1. Try cache
    let p = posts.find(o => o.user_id === _currentUser.id);
    let match = p ? (_successByOffer[p.id] || null) : null;
    let pending = null;

    // 2. If cache empty, try network
    if (!p) {
      container.innerHTML = '<div style="text-align:center;padding:1rem 0;color:rgba(255,255,255,.4)">Loading...</div>';
      try {
        const { data } = await withTimeout(_sb.from('help_posts')
          .select('id,location,body,name,lat,lng,created_at')
          .eq('user_id', _currentUser.id).eq('type', 'offer').eq('flagged', false).order('created_at', { ascending: false }).limit(1), 6000);
        p = data?.[0];
      } catch(e) {
        container.innerHTML = `<div style="text-align:center;padding:1.5rem 0"><div style="color:rgba(255,255,255,.5);font-size:.85rem;margin-bottom:.6rem">Connection timed out</div><button onclick="renderManageDashboard('offer')" style="${btnStyle('accent')}">Try Again</button></div>`;
        return;
      }
    }

    if (!p) { container.innerHTML = '<div style="text-align:center;padding:2rem 0;color:rgba(255,255,255,.4)">No active listing.</div>'; return; }

    // Fetch match + pending (non-blocking — render what we have if these fail)
    if (!match) {
      try {
        const mr = await withTimeout(_sb.from('success_stories')
          .select('id,offer_confirmed,stranded_name,stranded_location,offer_story,stranded_story,confirmed_at')
          .eq('offer_post_id', p.id).eq('offer_user_id', _currentUser.id).eq('offer_confirmed', true).maybeSingle(), 6000);
        match = mr.data;
      } catch(e) {}
    }
    try {
      const pr = await withTimeout(_sb.from('success_stories')
        .select('id,stranded_name').eq('offer_post_id', p.id).eq('offer_confirmed', false), 6000);
      pending = pr.data;
    } catch(e) {}

    const step = match ? 2 : 1;
    container.innerHTML = buildProgressTracker(step, ['Listed', 'Matched', 'Success'], '#3498ec') + buildOfferCard(p, match, pending, step);
  }
}

function buildProgressTracker(currentStep, labels, color) {
  const green = '#22c55e';
  return `<div style="display:flex;align-items:center;padding:.8rem .5rem 1rem;margin-bottom:.8rem;border-bottom:1px solid rgba(255,255,255,.06)">
    ${labels.map((l, i) => {
      const step = i + 1;
      const active = step <= currentStep;
      const stepColor = active ? (step >= 2 ? green : color) : 'rgba(255,255,255,.15)';
      const lineColor = step <= currentStep ? (step >= 2 ? green : color) : 'rgba(255,255,255,.1)';
      const textColor = active ? '#fff' : 'rgba(255,255,255,.25)';
      return (i > 0 ? `<div style="flex:1;height:2px;background:${lineColor}"></div>` : '') +
        `<div style="display:flex;flex-direction:column;align-items:center;gap:.25rem;min-width:60px">
          <div style="width:30px;height:30px;border-radius:50%;background:${active ? stepColor : 'transparent'};border:2px solid ${stepColor};display:flex;align-items:center;justify-content:center;font-size:.65rem;font-weight:800;color:${active ? '#fff' : 'rgba(255,255,255,.3)'}">${step}</div>
          <span style="font-size:.52rem;font-weight:700;text-transform:uppercase;letter-spacing:.04em;color:${textColor};text-align:center">${l}</span>
        </div>`;
    }).join('')}
  </div>`;
}

const _svgPin = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ec3452" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>';
const _svgHome = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>';
const _svgPerson = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3498ec" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>';

function buildStrandedCard(p, match, step) {
  const t = p.created_at ? new Date(p.created_at).toLocaleDateString() : '';
  const needsList = (p.needs || []).join(', ');
  const _verified = _currentProfile?.google_verified || _currentProfile?.x_verified || _currentProfile?.tg_verified;
  let html = `<div style="padding:.5rem 0">
    <div style="font-size:1.35rem;font-weight:800;color:#fff;margin-bottom:.5rem;line-height:1.2">${esc(p.name) || 'Anonymous'} ${buildBadge(_verified)} <span style="font-size:.7rem;color:rgba(255,255,255,.4);font-weight:400">${t}</span></div>
    <div style="display:flex;align-items:center;gap:.35rem;font-size:.9rem;color:rgba(255,255,255,.85);margin-bottom:.25rem">${_svgPin} ${esc(p.current_location)}</div>
    <div style="display:flex;align-items:center;gap:.35rem;font-size:.9rem;color:rgba(255,255,255,.85);margin-bottom:.25rem">${_svgHome} ${esc(p.destination)}${p.dest_airport ? ' ('+p.dest_airport+')' : ''}</div>
    ${needsList ? '<div style="font-size:.8rem;color:#f59e0b;margin-top:.3rem;margin-bottom:.4rem">Needs: '+needsList+'</div>' : ''}
    ${p.details ? '<div style="font-size:.85rem;color:rgba(255,255,255,.65);line-height:1.5;margin-bottom:.6rem">'+esc(p.details).slice(0,150)+'</div>' : ''}`;

  if (step >= 2 && match) {
    html += `<div style="background:#22c55e4a;border:none;border-radius:10px;padding:.75rem;margin:.5rem 0">
      <div style="font-size:.65rem;font-weight:800;text-transform:uppercase;color:#22c55e;margin-bottom:.3rem">✓ Matched${match.confirmed_at ? ' · ' + new Date(match.confirmed_at).toLocaleDateString() : ''}</div>
      <div style="font-size:.95rem;color:#fff;font-weight:700">${esc(match.offer_name) || 'A host'} in ${esc(match.offer_location) || 'nearby'}</div>
      ${match.offer_story ? '<div style="font-size:.8rem;color:rgba(255,255,255,.65);margin-top:.3rem;padding-left:.5rem;border-left:2px solid rgba(34,197,94,.3)">"'+match.offer_story+'"</div>' : ''}
    </div>`;
  }

  if (step >= 3 && match?.home_lat) {
    html += `<div style="background:#22c55e87;border:none;border-radius:10px;padding:.75rem;margin:.5rem 0">
      <div style="display:flex;align-items:center;gap:.35rem;font-size:.65rem;font-weight:800;text-transform:uppercase;color:#22c55e;margin-bottom:.3rem">${_svgHome} Made it home</div>
      <div style="font-size:.95rem;color:#fff;font-weight:600">${esc(match.home_location) || ''}</div>
    </div>`;
  }

  html += '<div style="display:flex;gap:.4rem;flex-wrap:wrap;margin-top:.6rem">';
  if (step === 1) {
    html += `<button onclick="openMatchPicker('${p.id}','${p.current_lat||0}','${p.current_lng||0}','${(p.name||'').replace(/'/g,"\\'")}','${(p.current_location||'').replace(/'/g,"\\'")}')" style="flex:1;${btnStyle('green')}">Found a place? →</button>`;
  }
  if (step === 2 && !match?.home_lat) {
    html += `<button onclick="checkAndOpenGoHome('${p.id}')" style="flex:1;${btnStyle('green')}">Made it home? →</button>`;
  }
  html += `<button onclick="editStrandedPost('${p.id}')" style="${btnStyle('accent')}">Edit</button>`;
  html += `<button onclick="deleteStrandedPost('${p.id}')" style="${btnStyle('danger')}">Remove</button>`;
  html += '</div>';

  // Discovery: nearby rooms
  const lat = p.current_lat, lng = p.current_lng;
  let nearby = posts.filter(o => o.lat && o.lng && o.user_id);
  if (lat && lng) nearby = nearby.map(o => ({...o, _d: haversineKm(lat, lng, o.lat, o.lng)})).sort((a,b) => a._d - b._d);
  if (nearby.length) {
    html += `<div style="margin-top:1.2rem;padding-top:.8rem;border-top:1px solid rgba(255,255,255,.06)">
      <div style="font-size:1.15rem;font-weight:800;color:#fff;margin-bottom:.2rem">Request a Spare Room Nearby</div>
      <div style="font-size:.7rem;color:rgba(255,255,255,.45);margin-bottom:.6rem">Someone near you is offering help</div>`;
    html += nearby.slice(0, 5).map(o => `<div style="padding:.55rem 0;border-bottom:1px solid rgba(255,255,255,.04)">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:.25rem">
          <div><div style="font-size:.85rem;font-weight:700;color:#fff">${esc(o.name) || 'Anonymous'} ${buildBadge(!!o.user_id)}</div>
            <div style="font-size:.7rem;color:rgba(255,255,255,.5)">${esc(o.location)}${o._d != null ? ' · '+Math.round(o._d)+'km' : ''}</div></div>
          <button onclick="openMatchPicker('${p.id}','${lat||0}','${lng||0}','${(p.name||'').replace(/'/g,"\\'")}','${(p.current_location||'').replace(/'/g,"\\'")}')" style="white-space:nowrap;${btnStyle('accent','sm')}">Select →</button>
        </div>
        ${buildContactIcons(o.contact, o.xhandle, o.name)}
      </div>`).join('');
    html += '</div>';
  }

  html += '</div>';
  return html;
}

function buildOfferCard(p, match, pending, step) {
  const t = p.created_at ? new Date(p.created_at).toLocaleDateString() : '';
  const _verified = _currentProfile?.google_verified || _currentProfile?.x_verified || _currentProfile?.tg_verified;
  let html = `<div style="padding:.5rem 0">
    <div style="font-size:1.35rem;font-weight:800;color:#fff;margin-bottom:.5rem;line-height:1.2">${esc(p.name) || 'Anonymous'} ${buildBadge(_verified)} <span style="font-size:.7rem;color:rgba(255,255,255,.4);font-weight:400">${t}</span></div>
    <div style="display:flex;align-items:center;gap:.35rem;font-size:.9rem;color:rgba(255,255,255,.85);margin-bottom:.25rem">${_svgPin} ${esc(p.location)}</div>
    ${p.body ? '<div style="font-size:.85rem;color:rgba(255,255,255,.65);line-height:1.5;margin-bottom:.6rem">'+esc(p.body).slice(0,150)+'</div>' : ''}`;

  if (pending?.length) {
    html += `<div style="background:rgba(255,165,0,.12);border:none;border-radius:10px;padding:.75rem;margin:.5rem 0">
      <div style="font-size:.6rem;font-weight:800;text-transform:uppercase;color:#f59e0b;margin-bottom:.35rem">Pending Match Request${pending.length > 1 ? 's' : ''}</div>
      ${pending.map(s => `<div style="display:flex;justify-content:space-between;align-items:center;padding:.3rem 0;border-bottom:1px solid rgba(255,255,255,.04)">
        <span style="font-size:.75rem;color:#fff;font-weight:600">${s.stranded_name || 'Someone'}</span>
        <button onclick="approveMatch('${s.id}')" style="${btnStyle('green','sm')}">Approve ✓</button>
      </div>`).join('')}
    </div>`;
  }

  if (step >= 2 && match) {
    html += `<div style="background:#22c55e4a;border:none;border-radius:10px;padding:.75rem;margin:.5rem 0">
      <div style="font-size:.65rem;font-weight:800;text-transform:uppercase;color:#22c55e;margin-bottom:.3rem">✓ Matched${match.confirmed_at ? ' · ' + new Date(match.confirmed_at).toLocaleDateString() : ''}</div>
      <div style="font-size:.95rem;color:#fff;font-weight:700">Helped ${esc(match.stranded_name) || 'someone'} from ${esc(match.stranded_location) || 'nearby'}</div>
      ${match.stranded_story ? '<div style="font-size:.8rem;color:rgba(255,255,255,.65);margin-top:.3rem;padding-left:.5rem;border-left:2px solid rgba(236,52,82,.3)">"'+match.stranded_story+'"</div>' : ''}
    </div>`;
  }

  html += '<div style="display:flex;gap:.4rem;flex-wrap:wrap;margin-top:.6rem">';
  html += `<button onclick="mProfileEditPost('${p.id}')" style="${btnStyle('accent')}">Edit</button>`;
  html += `<button onclick="mProfileDeletePost('${p.id}')" style="${btnStyle('danger')}">Remove</button>`;
  html += '</div>';

  // Discovery: stranded people nearby
  const lat = p.lat, lng = p.lng;
  let nearby = _strandedPeople.filter(s => s.current_lat && s.current_lng);
  if (lat && lng) nearby = nearby.map(s => ({...s, _d: haversineKm(lat, lng, s.current_lat, s.current_lng)})).sort((a,b) => a._d - b._d);
  if (nearby.length) {
    html += `<div style="margin-top:1.2rem;padding-top:.8rem;border-top:1px solid rgba(255,255,255,.06)">
      <div style="font-size:1.15rem;font-weight:800;color:#fff;margin-bottom:.2rem">Offer Spare Room Directly</div>
      <div style="font-size:.7rem;color:rgba(255,255,255,.45);margin-bottom:.6rem">To someone stranded nearby</div>`;
    html += nearby.slice(0, 8).map(s => {
      const needs = (s.needs || []).slice(0,3).join(', ');
      return `<div style="padding:.55rem 0;border-bottom:1px solid rgba(255,255,255,.04)">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:.25rem">
          <div><div style="font-size:.85rem;font-weight:700;color:#fff">${esc(s.name) || 'Anonymous'} ${buildBadge(!!s.user_id)} <span style="font-size:.6rem;color:rgba(255,255,255,.25)">${s.group_size > 1 ? s.group_size + ' people' : ''}</span></div>
            <div style="font-size:.7rem;color:rgba(255,255,255,.5)">${esc(s.current_location)}${s._d != null ? ' · '+Math.round(s._d)+'km' : ''}</div>
            ${needs ? '<div style="font-size:.6rem;color:#f59e0b">'+needs+'</div>' : ''}</div>
          <button onclick="alert('Room offered! They will see this in their dashboard.')" style="white-space:nowrap;${btnStyle('green','sm')}">Offer Room</button>
        </div>
        ${buildContactIcons(s.contact, s.xhandle, s.name)}
      </div>`;
    }).join('');
    html += '</div>';
  }

  html += '</div>';
  return html;
}

function resetActionButtons() {
  const pcOffer = document.getElementById('ss-offer-room');
  const pcStranded = document.getElementById('ss-im-stranded');
  if (pcOffer) {
    pcOffer.querySelector('.sitrep-label').textContent = 'Offer Spare Room';
    pcOffer.querySelector('.sitrep-label').style.color = '#3498ec';
    pcOffer.querySelector('.sitrep-sub').textContent = 'tap · help someone';
    pcOffer.onclick = () => isMob() ? mTab('offer', null) : openFormSidebar('offer');
  }
  if (pcStranded) {
    pcStranded.querySelector('.sitrep-label').textContent = "I'm Stranded";
    pcStranded.querySelector('.sitrep-label').style.color = '#ec3452';
    pcStranded.querySelector('.sitrep-sub').textContent = 'tap · register';
    pcStranded.onclick = () => isMob() ? mTab('stranded', null) : openFormSidebar('stranded');
  }
  const mOffer = document.getElementById('mss-offer');
  if (mOffer) {
    const mSvg = mOffer.querySelector('svg');
    if (mSvg) mSvg.outerHTML = '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>';
    mOffer.querySelector('.m-stat-label').innerHTML = '<span style="color:#1a1a2e">HELP · I\'M STRANDED</span>';
    mOffer.onclick = () => mTab('stranded', null);
  }
  const mTabSpare = document.getElementById('mtab-spare');
  if (mTabSpare) {
    mTabSpare.innerHTML = '<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2.9" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> OFFER A SPARE ROOM';
    mTabSpare.style.color = '';
    mTabSpare.onclick = () => mTab('offer', null);
  }
}

// ============================================================
// CONTENT MODERATION & ADMIN
// ============================================================
const ADMIN_EMAIL = 'dannymcglashing@gmail.com';

function containsLink(text) {
  if (!text) return false;
  return /https?:\/\/|www\.|\.com\/|\.org\/|\.net\/|\.io\//i.test(text);
}

function isAdmin() {
  return _currentUser?.email === ADMIN_EMAIL && _currentProfile?.google_verified;
}

function isMod() {
  return isAdmin() || _currentProfile?.role === 'mod';
}

function isModOrAdmin() {
  return isAdmin() || _currentProfile?.role === 'mod';
}

// ── Flag post (verified users only) ──────────────────────
async function flagPost(table, id) {
  if (!isLoggedIn()) { alert('Please sign in first.'); return; }
  const verified = _currentProfile?.google_verified || _currentProfile?.x_verified || _currentProfile?.tg_verified;
  if (!verified) { alert('Only verified users can flag posts. Link Google, X, or Telegram in your profile.'); return; }
  if (!confirm('Flag this post for moderator review?')) return;
  try {
    await withTimeout(_sb.from(table).update({ flagged: true }).eq('id', id), 5000);
    alert('Post flagged for review. Thank you.');
    if (table === 'help_posts') loadPosts();
    else loadStranded();
  } catch(e) { alert('Error: ' + e.message); }
}

// ── Admin panel toggle ───────────────────────────────────
function toggleAdminPanel() {
  if (!isModOrAdmin()) return;
  if (isMob()) {
    mShowSheetContent('manage', 'ADMIN');
    setTimeout(() => {
      const c = document.getElementById('m-manage-content');
      if (c) { c.innerHTML = ''; renderAdminPanel(c); }
    }, 100);
  } else {
    openManageAdmin();
  }
}

function openManageAdmin() {
  const sb = document.getElementById('form-sidebar');
  const body = document.getElementById('form-sidebar-body');
  const title = document.getElementById('form-sidebar-title');
  if (!sb || !body) return;
  if (sb.classList.contains('open')) closeFormSidebar();
  setTimeout(() => {
    body.innerHTML = '<div id="pc-manage-content"></div>';
    if (title) {
      title.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ec3452" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;margin-right:.3rem"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> ADMIN';
      title.style.color = '#ec3452';
      title.style.fontSize = '.85rem';
    }
    sb.classList.add('open');
    sb.dataset.panel = 'admin';
    document.getElementById('sidebar-overlay')?.classList.add('active');
    document.getElementById('map-view')?.style.setProperty('--right-sidebar-w', '420px');
    setTimeout(() => {
      if (!window._fsBackdropClose) {
        window._fsBackdropClose = function(e) {
          const sb = document.getElementById('form-sidebar');
          if (sb && sb.classList.contains('open') && !sb.contains(e.target)) {
            if (e.target.closest('[onclick*="openFormSidebar"]') || e.target.closest('[onclick*="openManageSidebar"]') || e.target.closest('[onclick*="mTab"]') || e.target.closest('[onclick*="toggleAdminPanel"]')) return;
            closeFormSidebar();
          }
        };
      }
      document.removeEventListener('mousedown', window._fsBackdropClose);
      document.addEventListener('mousedown', window._fsBackdropClose);
    }, 100);
    renderAdminPanel(document.getElementById('pc-manage-content'));
  }, 50);
}

let _adminTab = 'flagged';

async function renderAdminPanel(container) {
  if (!container || !isModOrAdmin()) return;

  const toggleHtml = `<div style="display:flex;background:rgba(255,255,255,.06);border-radius:8px;padding:2px;margin-bottom:1rem;border:1px solid rgba(255,255,255,.08)">
    <button onclick="_adminTab='flagged';renderAdminPanel(this.closest('#pc-manage-content')||document.getElementById('m-manage-content'))" style="flex:1;padding:.4rem;border:none;border-radius:6px;font-family:Inter,sans-serif;font-size:.65rem;font-weight:700;cursor:pointer;${_adminTab==='flagged'?'background:rgba(236,52,82,.15);color:#ec3452':'background:transparent;color:rgba(255,255,255,.3)'}">Flagged</button>
    <button onclick="_adminTab='rooms';renderAdminPanel(this.closest('#pc-manage-content')||document.getElementById('m-manage-content'))" style="flex:1;padding:.4rem;border:none;border-radius:6px;font-family:Inter,sans-serif;font-size:.65rem;font-weight:700;cursor:pointer;${_adminTab==='rooms'?'background:rgba(52,152,236,.15);color:#3498ec':'background:transparent;color:rgba(255,255,255,.3)'}">Rooms</button>
    <button onclick="_adminTab='stranded';renderAdminPanel(this.closest('#pc-manage-content')||document.getElementById('m-manage-content'))" style="flex:1;padding:.4rem;border:none;border-radius:6px;font-family:Inter,sans-serif;font-size:.65rem;font-weight:700;cursor:pointer;${_adminTab==='stranded'?'background:rgba(236,52,82,.15);color:#ec3452':'background:transparent;color:rgba(255,255,255,.3)'}">Stranded</button>
    <button onclick="_adminTab='pets';renderAdminPanel(this.closest('#pc-manage-content')||document.getElementById('m-manage-content'))" style="flex:1;padding:.4rem;border:none;border-radius:6px;font-family:Inter,sans-serif;font-size:.65rem;font-weight:700;cursor:pointer;${_adminTab==='pets'?'background:rgba(255,159,28,.15);color:#ff9f1c':'background:transparent;color:rgba(255,255,255,.3)'}">Pets</button>
    ${isAdmin() ? `<button onclick="_adminTab='mods';renderAdminPanel(this.closest('#pc-manage-content')||document.getElementById('m-manage-content'))" style="flex:1;padding:.4rem;border:none;border-radius:6px;font-family:Inter,sans-serif;font-size:.65rem;font-weight:700;cursor:pointer;${_adminTab==='mods'?'background:rgba(168,85,247,.15);color:#a855f7':'background:transparent;color:rgba(255,255,255,.3)'}">Mods</button>` : ''}
  </div>`;

  if (_adminTab === 'mods') {
    container.innerHTML = toggleHtml + '<div style="text-align:center;padding:1rem 0;color:rgba(255,255,255,.4)">Loading mods...</div>';
    await renderModPanel(container, toggleHtml);
    return;
  }

  container.innerHTML = toggleHtml + '<div style="text-align:center;padding:1rem 0;color:rgba(255,255,255,.4)">Loading...</div>';

  try {
    let items = [];
    if (_adminTab === 'flagged') {
      const [r1, r2, r3] = await Promise.all([
        withTimeout(_sb.from('help_posts').select('id,name,location,body,created_at,flagged,user_id').eq('flagged', true).order('created_at', { ascending: false }).limit(50), 6000),
        withTimeout(_sb.from('stranded_people').select('id,name,current_location,details,created_at,flagged,user_id').eq('flagged', true).order('created_at', { ascending: false }).limit(50), 6000),
        withTimeout(_sb.from('stranded_pets').select('id,name,location,description,created_at,flagged,user_id').eq('flagged', true).order('created_at', { ascending: false }).limit(50), 6000)
      ]);
      if (r1.error) throw new Error('help_posts: ' + r1.error.message);
      if (r2.error) throw new Error('stranded_people: ' + r2.error.message);
      // r3 may fail if table doesn't exist yet — gracefully handle
      items = [
        ...(r1.data || []).map(p => ({ ...p, _table: 'help_posts', _type: 'Room' })),
        ...(r2.data || []).map(p => ({ ...p, _table: 'stranded_people', _type: 'Stranded', location: p.current_location, body: p.details })),
        ...((r3.data || []).map(p => ({ ...p, _table: 'stranded_pets', _type: 'Pet', body: p.description })))
      ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    } else if (_adminTab === 'rooms') {
      const { data, error } = await withTimeout(_sb.from('help_posts').select('id,name,location,body,created_at,flagged,user_id').eq('type', 'offer').order('created_at', { ascending: false }).limit(100), 6000);
      if (error) throw new Error(error.message);
      items = (data || []).map(p => ({ ...p, _table: 'help_posts', _type: 'Room' }));
    } else if (_adminTab === 'pets') {
      const { data, error } = await withTimeout(_sb.from('stranded_pets').select('id,name,location,description,animal_type,pet_status,created_at,flagged,user_id').order('created_at', { ascending: false }).limit(100), 6000);
      if (error) throw new Error(error.message);
      items = (data || []).map(p => ({ ...p, _table: 'stranded_pets', _type: 'Pet', body: p.description }));
    } else {
      const { data, error } = await withTimeout(_sb.from('stranded_people').select('id,name,current_location,details,created_at,flagged,user_id').order('created_at', { ascending: false }).limit(100), 6000);
      if (error) throw new Error(error.message);
      items = (data || []).map(p => ({ ...p, _table: 'stranded_people', _type: 'Stranded', location: p.current_location, body: p.details }));
    }

    if (!items.length) {
      container.innerHTML = toggleHtml + '<div style="text-align:center;padding:2rem 0;color:rgba(255,255,255,.3)">No posts found.</div>';
      return;
    }

    container.innerHTML = toggleHtml + items.map(p => {
      const t = p.created_at ? new Date(p.created_at).toLocaleDateString() : '';
      const flagBadge = p.flagged ? '<span style="background:#ec3452;color:#fff;font-size:.5rem;font-weight:800;border-radius:4px;padding:.1rem .3rem;margin-left:.3rem">FLAGGED</span>' : '';
      return `<div style="padding:.5rem 0;border-bottom:1px solid rgba(255,255,255,.04)">
        <div style="display:flex;justify-content:space-between;align-items:flex-start">
          <div style="flex:1;min-width:0">
            <div style="font-size:.75rem;font-weight:700;color:#fff">${esc(p.name) || 'Anonymous'} <span style="font-size:.55rem;color:rgba(255,255,255,.3)">${p._type} · ${t}</span>${flagBadge}</div>
            <div style="font-size:.65rem;color:rgba(255,255,255,.4)">${esc(p.location) || ''}</div>
            ${p.body ? `<div style="font-size:.65rem;color:rgba(255,255,255,.3);margin-top:.15rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(p.body).slice(0,100)}</div>` : ''}
          </div>
          <div style="display:flex;gap:.3rem;flex-shrink:0;margin-left:.5rem">
            ${p.flagged ? `<button onclick="adminUnflag('${p._table}','${p.id}')" style="${btnStyle('accent','sm')}">Unflag</button>` : ''}
            <button onclick="adminDelete('${p._table}','${p.id}')" style="${btnStyle('danger','sm')}">Delete</button>
          </div>
        </div>
      </div>`;
    }).join('');
  } catch(e) {
    container.innerHTML = toggleHtml + `<div style="text-align:center;padding:1rem 0"><div style="color:#ec3452;font-size:.78rem;margin-bottom:.4rem">${e.message}</div><div style="color:rgba(255,255,255,.3);font-size:.6rem;line-height:1.6">If this is an RLS error, run the SQL policies in your browser console (press F12 → Console).</div><button onclick="renderAdminPanel(this.closest('#pc-manage-content')||document.getElementById('m-manage-content'))" style="margin-top:.5rem;${btnStyle('accent','sm')}">Retry</button></div>`;
  }
}

async function adminDelete(table, id) {
  if (!isModOrAdmin()) return;
  if (!confirm('Permanently delete this post?')) return;
  try {
    const { error } = await withTimeout(_sb.from(table).delete().eq('id', id), 5000);
    if (error) {
      console.error('[Admin Delete] Error:', error);
      alert('Delete failed — likely RLS policy. Error: ' + error.message + '\n\nRun in Supabase SQL editor:\nCREATE POLICY "admin_delete_' + table + '" ON ' + table + ' FOR DELETE USING (auth.jwt()->>\'email\' = \'' + ADMIN_EMAIL + '\' OR (SELECT role FROM profiles WHERE id = auth.uid()) = \'mod\');');
      return;
    }
    loadPosts(); loadStranded();
    const c = document.getElementById('pc-manage-content') || document.getElementById('m-manage-content');
    if (c) renderAdminPanel(c);
  } catch(e) { alert('Error: ' + e.message); }
}

async function adminUnflag(table, id) {
  if (!isModOrAdmin()) return;
  try {
    await withTimeout(_sb.from(table).update({ flagged: false }).eq('id', id), 5000);
    loadPosts(); loadStranded();
    const c = document.getElementById('pc-manage-content') || document.getElementById('m-manage-content');
    if (c) renderAdminPanel(c);
  } catch(e) { alert('Error: ' + e.message); }
}

// ── Mod management (admin only) ──────────────────────────
async function renderModPanel(container, toggleHtml) {
  if (!isAdmin()) { container.innerHTML = toggleHtml + '<div style="padding:1rem 0;color:rgba(255,255,255,.3)">Admin only.</div>'; return; }

  let html = toggleHtml;
  html += `<div style="margin-bottom:1rem">
    <div style="font-size:.9rem;font-weight:800;color:#fff;margin-bottom:.4rem">Add Moderator</div>
    <div style="display:flex;gap:.3rem">
      <input type="text" id="admin-mod-search" placeholder="Search by name or email..." style="flex:1;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);border-radius:8px;padding:.45rem .6rem;color:#fff;font-family:Inter,sans-serif;font-size:.75rem" oninput="adminSearchUsers(this.value)">
    </div>
    <div id="admin-search-results"></div>
  </div>`;

  // Current mods
  html += '<div style="font-size:.9rem;font-weight:800;color:#fff;margin-bottom:.4rem;margin-top:1rem;padding-top:.8rem;border-top:1px solid rgba(255,255,255,.06)">Team</div>';

  try {
    // Admin
    html += `<div style="display:flex;justify-content:space-between;align-items:center;padding:.4rem 0;border-bottom:1px solid rgba(255,255,255,.04)">
      <div><span style="font-size:.78rem;font-weight:700;color:#fff">${_currentProfile?.display_name || ADMIN_EMAIL}</span>
      <span style="font-size:.5rem;background:#ec3452;color:#fff;border-radius:4px;padding:.1rem .3rem;margin-left:.3rem;font-weight:800">ADMIN</span></div>
      <span style="font-size:.6rem;color:rgba(255,255,255,.25)">You</span>
    </div>`;

    // Mods
    const { data: mods } = await withTimeout(_sb.from('profiles').select('id,display_name,email,role').eq('role', 'mod'), 5000);
    if (mods?.length) {
      for (const m of mods) {
        html += `<div style="display:flex;justify-content:space-between;align-items:center;padding:.4rem 0;border-bottom:1px solid rgba(255,255,255,.04)">
          <div><span style="font-size:.78rem;font-weight:700;color:#fff">${m.display_name || m.email}</span>
          <span style="font-size:.5rem;background:#a855f7;color:#fff;border-radius:4px;padding:.1rem .3rem;margin-left:.3rem;font-weight:800">MOD</span></div>
          <button onclick="adminRemoveMod('${m.id}')" style="${btnStyle('danger','sm')}">Remove</button>
        </div>`;
      }
    } else {
      html += '<div style="font-size:.7rem;color:rgba(255,255,255,.25);padding:.3rem 0">No moderators yet.</div>';
    }
  } catch(e) { html += `<div style="color:rgba(255,255,255,.3);font-size:.7rem">${e.message}</div>`; }

  container.innerHTML = html;
}

async function adminSearchUsers(q) {
  const results = document.getElementById('admin-search-results');
  if (!results || !isAdmin()) return;
  if (q.length < 2) { results.innerHTML = ''; return; }
  // Debounce
  clearTimeout(window._adminSearchTimer);
  window._adminSearchTimer = setTimeout(async () => {
    try {
      results.innerHTML = '<div style="font-size:.6rem;color:rgba(255,255,255,.25);padding:.2rem 0">Searching...</div>';
      const { data, error } = await withTimeout(_sb.from('profiles').select('id,display_name,email,role')
        .or(`display_name.ilike.%${q}%,email.ilike.%${q}%`)
        .limit(8), 4000);
      if (error) { results.innerHTML = `<div style="font-size:.6rem;color:#ec3452;padding:.3rem 0">RLS error: ${error.message}. See console for RLS fix.</div>`; console.error('[Admin Search] RLS policy needed. Run in Supabase SQL editor:\nCREATE POLICY "admin_read_profiles" ON profiles FOR SELECT USING (auth.jwt()->>\'email\' = \'' + ADMIN_EMAIL + '\' OR (SELECT role FROM profiles WHERE id = auth.uid()) = \'mod\');'); return; }
      if (!data?.length) { results.innerHTML = '<div style="font-size:.65rem;color:rgba(255,255,255,.25);padding:.3rem 0">No users found.</div>'; return; }
      results.innerHTML = data.map(u => {
        const isSelf = u.email === ADMIN_EMAIL;
        const isAlreadyMod = u.role === 'mod';
        return `<div style="display:flex;justify-content:space-between;align-items:center;padding:.35rem 0;border-bottom:1px solid rgba(255,255,255,.03)">
          <div><span style="font-size:.72rem;font-weight:600;color:#fff">${u.display_name || 'No name'}</span>
          <span style="font-size:.55rem;color:rgba(255,255,255,.25);margin-left:.3rem">${u.email || ''}</span>
          ${isAlreadyMod ? '<span style="font-size:.5rem;background:#a855f7;color:#fff;border-radius:4px;padding:.05rem .25rem;margin-left:.2rem;font-weight:700">MOD</span>' : ''}
          ${isSelf ? '<span style="font-size:.5rem;background:#ec3452;color:#fff;border-radius:4px;padding:.05rem .25rem;margin-left:.2rem;font-weight:700">ADMIN</span>' : ''}</div>
          ${!isSelf && !isAlreadyMod ? `<button onclick="adminMakeMod('${u.id}')" style="${btnStyle('green','sm')}">Make Mod</button>` : ''}
        </div>`;
      }).join('');
    } catch(e) { results.innerHTML = `<div style="font-size:.6rem;color:#ec3452">${e.message}</div>`; }
  }, 300);
}

async function adminMakeMod(userId) {
  if (!isAdmin()) return;
  try {
    await withTimeout(_sb.from('profiles').update({ role: 'mod' }).eq('id', userId), 5000);
    document.getElementById('admin-mod-search').value = '';
    document.getElementById('admin-search-results').innerHTML = '';
    const c = document.getElementById('pc-manage-content') || document.getElementById('m-manage-content');
    if (c) renderAdminPanel(c);
  } catch(e) { alert('Error: ' + e.message); }
}

async function adminRemoveMod(userId) {
  if (!isAdmin()) return;
  if (!confirm('Remove moderator access?')) return;
  try {
    await withTimeout(_sb.from('profiles').update({ role: null }).eq('id', userId), 5000);
    const c = document.getElementById('pc-manage-content') || document.getElementById('m-manage-content');
    if (c) renderAdminPanel(c);
  } catch(e) { alert('Error: ' + e.message); }
}

// ── Show/hide admin button based on role ─────────────────
function updateAdminButton() {
  const show = isModOrAdmin();
  const btn = document.getElementById('admin-nav-btn');
  if (btn) btn.style.display = show ? 'inline-flex' : 'none';
  const mBtn = document.getElementById('m-admin-pill');
  if (mBtn) mBtn.style.display = show ? 'flex' : 'none';
  // Log RLS SQL for admin setup
  if (isAdmin() && !window._adminSqlLogged) {
    window._adminSqlLogged = true;
    console.log('%c[ADMIN] Required Supabase RLS policies — run these in SQL Editor:', 'color:#ec3452;font-weight:bold');
    console.log(`
-- Add role column if not exists
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role text;

-- Admin/mod can read all profiles (for user search)
CREATE POLICY "admin_mod_read_profiles" ON profiles FOR SELECT
  USING (true);

-- Admin can update any profile (for mod management)
CREATE POLICY "admin_update_profiles" ON profiles FOR UPDATE
  USING (auth.jwt()->>'email' = '${ADMIN_EMAIL}');

-- Admin/mod can delete any help_posts
CREATE POLICY "admin_mod_delete_posts" ON help_posts FOR DELETE
  USING (
    auth.jwt()->>'email' = '${ADMIN_EMAIL}'
    OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'mod'
  );

-- Admin/mod can update help_posts (unflag)
CREATE POLICY "admin_mod_update_posts" ON help_posts FOR UPDATE
  USING (
    auth.uid() = user_id
    OR auth.jwt()->>'email' = '${ADMIN_EMAIL}'
    OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'mod'
  );

-- Admin/mod can delete any stranded_people
CREATE POLICY "admin_mod_delete_stranded" ON stranded_people FOR DELETE
  USING (
    auth.jwt()->>'email' = '${ADMIN_EMAIL}'
    OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'mod'
  );

-- Admin/mod can update stranded_people (unflag)
CREATE POLICY "admin_mod_update_stranded" ON stranded_people FOR UPDATE
  USING (
    auth.uid() = user_id
    OR auth.jwt()->>'email' = '${ADMIN_EMAIL}'
    OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'mod'
  );
    `);
  }
}

// ── RESOURCES SIDEBAR ─────────────────────────────────────
let _resHostCC = '';
let _resNatCC = '';

function openResourcesSidebar(hostCC) {
  _resHostCC = hostCC || '';
  _resNatCC = '';
  if (isMob()) {
    mShowSheetContent('manage', 'RESOURCES');
    setTimeout(() => {
      const c = document.getElementById('m-manage-content');
      if (c) { c.innerHTML = ''; renderResourcesSidebar(c); }
    }, 100);
  } else {
    const sb = document.getElementById('form-sidebar');
    const body = document.getElementById('form-sidebar-body');
    const title = document.getElementById('form-sidebar-title');
    if (!sb || !body) return;
    if (sb.classList.contains('open')) closeFormSidebar();
    setTimeout(() => {
      body.innerHTML = '<div id="pc-manage-content"></div>';
      if (title) {
        title.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3498ec" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;margin-right:.3rem"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg> RESOURCES';
        title.style.color = '#3498ec';
        title.style.fontSize = '.85rem';
      }
      sb.classList.add('open');
      sb.dataset.panel = 'resources';
      document.getElementById('sidebar-overlay')?.classList.add('active');
      document.getElementById('map-view')?.style.setProperty('--right-sidebar-w', '420px');
      setTimeout(() => {
        if (!window._fsBackdropClose) {
          window._fsBackdropClose = function(e) {
            const sb = document.getElementById('form-sidebar');
            if (sb && sb.classList.contains('open') && !sb.contains(e.target)) {
              if (e.target.closest('[onclick*="openFormSidebar"]') || e.target.closest('[onclick*="openManageSidebar"]') || e.target.closest('[onclick*="openResourcesSidebar"]')) return;
              closeFormSidebar();
            }
          };
        }
        document.removeEventListener('mousedown', window._fsBackdropClose);
        document.addEventListener('mousedown', window._fsBackdropClose);
      }, 100);
      renderResourcesSidebar(document.getElementById('pc-manage-content'));
    }, 50);
  }
}

function renderResourcesSidebar(container) {
  if (!container) return;
  const hostCC = _resHostCC;
  const natCC = _resNatCC;
  const meOrder = ['AE','SA','QA','BH','KW','OM','JO','IR','IQ','IL','LB'];

  // Build country dropdown
  let hostOpts = '<option value="">Select country...</option>';
  if (typeof EMBASSIES_BY_HOST !== 'undefined') {
    const sorted = Object.entries(EMBASSIES_BY_HOST).sort((a,b) => {
      const am = meOrder.indexOf(a[0]), bm = meOrder.indexOf(b[0]);
      if (am >= 0 && bm >= 0) return am - bm;
      if (am >= 0) return -1; if (bm >= 0) return 1;
      return a[1].name.localeCompare(b[1].name);
    });
    hostOpts += '<optgroup label="Middle East">';
    for (const [cc, h] of sorted) { if (meOrder.includes(cc)) hostOpts += `<option value="${cc}" ${cc===hostCC?'selected':''}>${h.name}</option>`; }
    hostOpts += '</optgroup><optgroup label="Other">';
    for (const [cc, h] of sorted) { if (!meOrder.includes(cc)) hostOpts += `<option value="${cc}" ${cc===hostCC?'selected':''}>${h.name}</option>`; }
    hostOpts += '</optgroup>';
  }

  // Build nationality dropdown
  let natOpts = '<option value="">All nationalities</option>';
  if (typeof EMB_NATIONS !== 'undefined') {
    const nats = Object.entries(EMB_NATIONS).sort((a,b) => a[1].name.localeCompare(b[1].name));
    for (const [cc, n] of nats) natOpts += `<option value="${cc}" ${cc===natCC?'selected':''}>${n.flag} ${n.name}</option>`;
  }

  let html = `<div style="margin-bottom:.8rem">
    <label style="font-size:.55rem;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:rgba(255,255,255,.3);display:block;margin-bottom:.2rem">I'm stuck in</label>
    <select id="res-sb-host" onchange="_resHostCC=this.value;renderResourcesSidebar(this.closest('#pc-manage-content')||document.getElementById('m-manage-content'))" style="width:100%;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);border-radius:8px;padding:.45rem;color:#fff;font-family:Inter,sans-serif;font-size:.78rem;font-weight:600;color-scheme:dark">${hostOpts}</select>
  </div>
  <div style="margin-bottom:.8rem">
    <label style="font-size:.55rem;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:rgba(255,255,255,.3);display:block;margin-bottom:.2rem">I'm from</label>
    <select id="res-sb-nat" onchange="_resNatCC=this.value;renderResourcesSidebar(this.closest('#pc-manage-content')||document.getElementById('m-manage-content'))" style="width:100%;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);border-radius:8px;padding:.45rem;color:#fff;font-family:Inter,sans-serif;font-size:.78rem;font-weight:600;color-scheme:dark">${natOpts}</select>
  </div>`;

  if (!hostCC) {
    html += '<div style="text-align:center;padding:2rem 0;color:rgba(255,255,255,.25);font-size:.82rem">Select a country to see embassy contacts and local resources</div>';
    // Show the full resources page link
    html += `<a href="javascript:void(0)" onclick="${isMob() ? "mTab('resources',null)" : "closeFormSidebar();showView('resources')"}" style="display:block;text-align:center;padding:.5rem;background:rgba(52,152,236,.08);border:1px solid rgba(52,152,236,.15);border-radius:8px;color:#3498ec;font-size:.72rem;font-weight:700;text-decoration:none;margin-top:.5rem">View Full Resources Directory →</a>`;
    container.innerHTML = html;
    return;
  }

  const host = (typeof EMBASSIES_BY_HOST !== 'undefined') ? EMBASSIES_BY_HOST[hostCC] : null;

  if (host) {
    // Emergency number
    if (host.emergency) {
      html += `<div style="background:rgba(236,52,82,.1);border:1px solid rgba(236,52,82,.15);border-radius:10px;padding:.6rem;margin-bottom:.8rem">
        <div style="font-size:.6rem;font-weight:800;text-transform:uppercase;color:#ec3452;margin-bottom:.2rem">Emergency</div>
        <a href="tel:${host.emergency}" style="font-size:1.1rem;font-weight:800;color:#fff;text-decoration:none">${host.emergency}</a>
      </div>`;
    }

    // Embassies
    let entries = Object.entries(host.embassies);
    if (natCC) entries = entries.filter(([cc]) => cc === natCC);

    html += `<div style="font-size:.7rem;font-weight:800;text-transform:uppercase;letter-spacing:.06em;color:rgba(255,255,255,.35);margin-bottom:.4rem">${host.name} — ${entries.length} Embassies</div>`;
    for (const [nc, info] of entries) {
      const nat = (typeof EMB_NATIONS !== 'undefined' && EMB_NATIONS[nc]) || {flag:'',name:nc};
      html += `<div style="display:flex;justify-content:space-between;align-items:center;padding:.4rem 0;border-bottom:1px solid rgba(255,255,255,.04)">
        <div style="flex:1"><span style="font-size:.78rem;font-weight:600;color:#fff">${nat.flag} ${nat.name}</span>${info.note ? '<div style="font-size:.6rem;color:rgba(255,255,255,.3)">'+info.note+'</div>' : ''}</div>
        <div style="display:flex;gap:.3rem;align-items:center;flex-shrink:0">
          ${info.phone ? '<a href="tel:'+info.phone.replace(/[\s\-()]/g,'')+'" style="font-size:.68rem;color:#22c55e;text-decoration:none;font-weight:600;white-space:nowrap">'+info.phone+'</a>' : ''}
          ${info.web ? '<a href="'+info.web+'" target="_blank" style="font-size:.6rem;color:#3498ec;text-decoration:none">[web]</a>' : ''}
        </div>
      </div>`;
    }
  }

  // Contextual resources — filtered by country and nationality
  const contextResources = NGOS.filter(r => {
    if (r.countries && r.countries.includes(hostCC)) return true;
    if (natCC && r.nat && r.nat.includes(natCC)) return true;
    return false;
  });

  if (contextResources.length) {
    html += `<div style="font-size:.7rem;font-weight:800;text-transform:uppercase;letter-spacing:.06em;color:rgba(255,255,255,.35);margin-top:1rem;margin-bottom:.4rem;padding-top:.6rem;border-top:1px solid rgba(255,255,255,.06)">Relevant Programs &amp; Resources</div>`;
    for (const r of contextResources) {
      html += `<div style="background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);border-radius:8px;padding:.55rem;margin-bottom:.4rem">
        <div style="font-size:.55rem;font-weight:700;text-transform:uppercase;color:rgba(255,255,255,.25);margin-bottom:.15rem">${r.type}</div>
        <div style="font-size:.8rem;font-weight:700;color:#fff;margin-bottom:.15rem">${r.name}</div>
        <div style="font-size:.7rem;color:rgba(255,255,255,.45);line-height:1.5;margin-bottom:.3rem">${r.desc}</div>
        <div style="display:flex;gap:.4rem;align-items:center">
          <a href="${r.url}" target="_blank" style="font-size:.65rem;color:#3498ec;text-decoration:none;font-weight:600">Open →</a>
          ${r.phone ? `<a href="tel:${r.phone.replace(/[\s\-()]/g,'')}" style="font-size:.65rem;color:#22c55e;text-decoration:none;font-weight:600">${r.phone}</a>` : ''}
        </div>
      </div>`;
    }
  }

  // Always show link to full directory
  html += `<a href="javascript:void(0)" onclick="${isMob() ? "mTab('resources',null)" : "closeFormSidebar();showView('resources')"}" style="display:block;text-align:center;padding:.5rem;background:rgba(52,152,236,.08);border:1px solid rgba(52,152,236,.15);border-radius:8px;color:#3498ec;font-size:.72rem;font-weight:700;text-decoration:none;margin-top:.8rem">View Full Directory (${typeof EMBASSIES_BY_HOST !== 'undefined' ? Object.values(EMBASSIES_BY_HOST).reduce((s,h)=>s+Object.keys(h.embassies).length,0) : '850'}+ contacts) →</a>`;

  container.innerHTML = html;
}

window.addEventListener('DOMContentLoaded',()=>{
  console.log('[INIT] DOMContentLoaded fired');
  initAccent();
  if(isMob()){ initMobile(); }
  else {
    showView('map');
    // Initialize sidebar-aware community bar centering (sidebar starts open)
    document.getElementById('map-view')?.style.setProperty('--sidebar-w', '290px');
  }
  // Init autocomplete on both desktop and mobile location fields
  initLocationAutocomplete('offer-location','offer-lat','offer-lng','offer-location-ac');
  initLocationAutocomplete('m-offer-location','m-offer-lat','m-offer-lng','m-offer-location-ac');
  initAuth();
  // Keep session alive — refresh token every 2 minutes to prevent expiry
  setInterval(async () => {
    if (_currentUser) {
      try {
        const { data: { session } } = await withTimeout(_sb.auth.getSession(), 5000);
        if (session?.user) _currentUser = session.user;
      } catch(e) { /* silent — don't null out user on timeout */ }
    }
  }, 2 * 60 * 1000);
  // Recover from phone sleep / tab background — refresh everything on return
  let _lastVisible = Date.now();
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      const gone = Date.now() - _lastVisible;
      if (gone > 60000 && _currentUser) { // Been away > 1 minute
        console.log('[Visibility] Tab returned after', Math.round(gone/1000), 's — refreshing session');
        _sb.auth.getSession().then(({ data: { session } }) => {
          if (session?.user) _currentUser = session.user;
        }).catch(() => {});
        // Reload data silently
        loadPosts();
        loadStranded();
      }
    } else {
      _lastVisible = Date.now();
    }
  });
  checkTelegramRedirect();
  checkXRedirect();
  initStrandedRealtime();
  loadStranded();
  initPetRealtime();
  loadPets();
  loadPetMatches();
  initLocationAutocomplete('pet-pet-location','pet-pet-lat','pet-pet-lng','pet-location-ac');
  initLocationAutocomplete('m-pet-pet-location','m-pet-pet-lat','m-pet-pet-lng','m-pet-location-ac');
  initLocationAutocomplete('stranded-location','stranded-lat','stranded-lng','stranded-location-ac');
  initLocationAutocomplete('m-stranded-location','m-stranded-lat','m-stranded-lng','m-stranded-location-ac');
  // Seed placeholder dashes in flip columns before data arrives
  ['flip-stranded','flip-stranded-m'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = '<span style="letter-spacing:.05em;color:rgba(255,255,255,.15)">— — — —</span>';
  });
  console.log('[INIT] calling refreshSitrep...');
  refreshSitrep().then(()=>console.log('[INIT] refreshSitrep resolved')).catch(e=>console.error('[INIT] refreshSitrep rejected:',e));
  // Hard fallback — if refreshSitrep fails or hangs, dismiss overlay after 8s
  setTimeout(() => { console.log('[INIT] 8s fallback firing'); flyAndDismissOverlay(); }, 8000);
  // Data refreshes on page load only — no polling interval.
  if(SB_ON){loadPosts();loadSuccessStories();subscribeStream();}
  else{
    const el=document.getElementById('offer-posts');
    if(el)el.innerHTML='<div class="empty-state" style="color:var(--warn)">Supabase not configured.</div>';
  }
});
window.addEventListener('resize',()=>{if(isMob()&&!window._mobileInit)initMobile();});