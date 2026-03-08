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
  // REAL DATA — AviationStack API full pull, March 7, 2026 (paid tier)
  // cancelled = today's cancelled, h7 = 7-day cumulative cancelled flights
  // Gulf
  {city:'Dubai',code:'DXB',iata:'DXB',coords:[25.252,55.364],cancelled:6632,stranded:1226920,status:'DISRUPTED',cancelRate:39,dailyFlights:17219,h7:5515,updated:'live'},
  {city:'Abu Dhabi',code:'AUH',iata:'AUH',coords:[24.432,54.651],cancelled:2404,stranded:444740,status:'DISRUPTED',cancelRate:34,dailyFlights:6981,h7:2175,updated:'live'},
  {city:'Doha',code:'DOH',iata:'DOH',coords:[25.273,51.608],cancelled:11949,stranded:2210565,status:'RESTRICTED',cancelRate:62,dailyFlights:19242,h7:11306,updated:'live'},
  {city:'Kuwait City',code:'KWI',iata:'KWI',coords:[29.226,47.968],cancelled:469,stranded:86765,status:'OPEN',cancelRate:16,dailyFlights:2895,h7:388,updated:'live'},
  {city:'Bahrain',code:'BAH',iata:'BAH',coords:[26.270,50.633],cancelled:1115,stranded:206275,status:'RESTRICTED',cancelRate:53,dailyFlights:2122,h7:897,updated:'live'},
  {city:'Muscat',code:'MCT',iata:'MCT',coords:[23.593,58.284],cancelled:694,stranded:128390,status:'DISRUPTED',cancelRate:22,dailyFlights:3100,h7:599,updated:'live'},
  {city:'Sharjah',code:'SHJ',iata:'SHJ',coords:[25.329,55.517],cancelled:147,stranded:27195,status:'OPEN',cancelRate:4,dailyFlights:3344,h7:0,updated:'live'},
  {city:'Al Maktoum',code:'DWC',iata:'DWC',coords:[24.896,55.161],cancelled:82,stranded:15170,status:'OPEN',cancelRate:5,dailyFlights:1796,h7:0,updated:'live'},
  {city:'Ras Al Khaimah',code:'RKT',iata:'RKT',coords:[25.613,55.939],cancelled:72,stranded:13320,status:'DISRUPTED',cancelRate:34,dailyFlights:210,h7:0,updated:'live'},
  // Saudi
  {city:'Riyadh',code:'RUH',iata:'RUH',coords:[24.957,46.698],cancelled:1105,stranded:204425,status:'OPEN',cancelRate:20,dailyFlights:5555,h7:736,updated:'live'},
  {city:'Jeddah',code:'JED',iata:'JED',coords:[21.670,39.150],cancelled:1091,stranded:201835,status:'OPEN',cancelRate:13,dailyFlights:8375,h7:806,updated:'live'},
  {city:'Dammam',code:'DMM',iata:'DMM',coords:[26.471,49.798],cancelled:765,stranded:141525,status:'DISRUPTED',cancelRate:36,dailyFlights:2149,h7:0,updated:'live'},
  {city:'Medina',code:'MED',iata:'MED',coords:[24.553,39.705],cancelled:294,stranded:54390,status:'OPEN',cancelRate:17,dailyFlights:1683,h7:0,updated:'live'},
  // Iran — mostly OPEN
  {city:'Tehran IKA',code:'IKA',iata:'IKA',coords:[35.416,51.152],cancelled:212,stranded:39220,status:'OPEN',cancelRate:16,dailyFlights:1304,h7:0,updated:'live'},
  {city:'Tehran Mehrabad',code:'THR',iata:'THR',coords:[35.689,51.313],cancelled:0,stranded:0,status:'OPEN',cancelRate:0,dailyFlights:75,h7:0,updated:'live'},
  {city:'Mashhad',code:'MHD',iata:'MHD',coords:[36.236,59.641],cancelled:49,stranded:9065,status:'OPEN',cancelRate:4,dailyFlights:1365,h7:0,updated:'live'},
  {city:'Shiraz',code:'SYZ',iata:'SYZ',coords:[29.540,52.590],cancelled:27,stranded:4995,status:'OPEN',cancelRate:9,dailyFlights:310,h7:0,updated:'live'},
  // Iraq
  {city:'Baghdad',code:'BGW',iata:'BGW',coords:[33.262,44.235],cancelled:112,stranded:20720,status:'OPEN',cancelRate:18,dailyFlights:606,h7:0,updated:'live'},
  {city:'Erbil',code:'EBL',iata:'EBL',coords:[36.237,43.963],cancelled:74,stranded:13690,status:'DISRUPTED',cancelRate:23,dailyFlights:320,h7:0,updated:'live'},
  {city:'Basra',code:'BSR',iata:'BSR',coords:[30.549,47.662],cancelled:55,stranded:10175,status:'DISRUPTED',cancelRate:33,dailyFlights:168,h7:0,updated:'live'},
  // Israel
  {city:'Tel Aviv',code:'TLV',iata:'TLV',coords:[32.011,34.887],cancelled:1198,stranded:221630,status:'DISRUPTED',cancelRate:31,dailyFlights:3843,h7:969,updated:'live'},
  // Jordan / Lebanon
  {city:'Amman',code:'AMM',iata:'AMM',coords:[31.723,35.993],cancelled:734,stranded:135790,status:'DISRUPTED',cancelRate:37,dailyFlights:1965,h7:605,updated:'live'},
  {city:'Beirut',code:'BEY',iata:'BEY',coords:[33.821,35.488],cancelled:295,stranded:54575,status:'DISRUPTED',cancelRate:30,dailyFlights:968,h7:0,updated:'live'},
];

// 7-day history for top 10 ME hubs (real AviationStack data)
const HISTORY_7D = {
  DXB:{days:{'03-01':1141,'03-02':1114,'03-03':1001,'03-04':847,'03-05':674,'03-06':492,'03-07':246},total:5515},
  DOH:{days:{'03-01':1538,'03-02':1598,'03-03':1633,'03-04':1583,'03-05':1610,'03-06':1694,'03-07':1650},total:11306},
  AUH:{days:{'03-01':538,'03-02':432,'03-03':216,'03-04':264,'03-05':444,'03-06':222,'03-07':59},total:2175},
  TLV:{days:{'03-01':207,'03-02':205,'03-03':190,'03-04':121,'03-05':146,'03-06':85,'03-07':15},total:969},
  RUH:{days:{'03-01':135,'03-02':118,'03-03':108,'03-04':97,'03-05':107,'03-06':99,'03-07':72},total:736},
  JED:{days:{'03-01':160,'03-02':151,'03-03':126,'03-04':114,'03-05':107,'03-06':89,'03-07':59},total:806},
  KWI:{days:{'03-01':71,'03-02':65,'03-03':58,'03-04':45,'03-05':57,'03-06':60,'03-07':32},total:388},
  BAH:{days:{'03-01':192,'03-02':163,'03-03':154,'03-04':154,'03-05':108,'03-06':55,'03-07':71},total:897},
  MCT:{days:{'03-01':96,'03-02':80,'03-03':107,'03-04':94,'03-05':115,'03-06':53,'03-07':54},total:599},
  AMM:{days:{'03-01':79,'03-02':104,'03-03':111,'03-04':78,'03-05':86,'03-06':90,'03-07':57},total:605},
};

// REAL global disruption data — 132 airports from AviationStack route-pair queries (Mar 7, 2026)
// Every number is an exact count of cancelled flights on a specific route
const REAL_GLOBAL_DISRUPTIONS = [
  {iata:'CMB',cancelled:676,stranded:125060,airlines:['flydubai','Emirates','Qatar Airways','LATAM Airlines','Iberia'],me_hubs:['DXB','DOH','AUH','RUH','KWI']},
  {iata:'BKK',cancelled:672,stranded:124320,airlines:['Qatar Airways','Bangkok Airways','EgyptAir','Thai Airways International','Gulf Air'],me_hubs:['DXB','DOH','AUH','BAH','KWI','MCT','TLV']},
  {iata:'LHR',cancelled:626,stranded:115810,airlines:['WestJet','SAS','Delta Air Lines','Qatar Airways','American Airlines'],me_hubs:['DXB','DOH','AUH','RUH','JED','BAH','TLV','AMM']},
  {iata:'CDG',cancelled:453,stranded:83805,airlines:['SAS','KLM','Delta Air Lines','Air France','Etihad Airways'],me_hubs:['DXB','DOH','AUH','RUH','BAH','TLV']},
  {iata:'JNB',cancelled:421,stranded:77885,airlines:['South African Airways','Emirates','British Airways','Finnair','Etihad Airways'],me_hubs:['DXB','DOH','AUH']},
  {iata:'NBO',cancelled:379,stranded:70115,airlines:['Kenya Airways','flydubai','Emirates','Qatar Airways','Etihad Airways'],me_hubs:['DXB','DOH','AUH','JED','BAH']},
  {iata:'AMS',cancelled:352,stranded:65120,airlines:['SAS','Delta Air Lines','Air France','Etihad Airways','KLM'],me_hubs:['DXB','DOH','AUH','TLV','AMM']},
  {iata:'SIN',cancelled:333,stranded:61605,airlines:['Qantas','Emirates','Qatar Airways','Singapore Airlines','Gulf Air'],me_hubs:['DXB','DOH','AUH','JED','BAH']},
  {iata:'CPT',cancelled:286,stranded:52910,airlines:['Emirates','South African Airways','Qatar Airways','Finnair'],me_hubs:['DXB','DOH']},
  {iata:'JFK',cancelled:274,stranded:50690,airlines:['Emirates','Qatar Airways','Etihad Airways','Delta Air Lines','Saudia'],me_hubs:['DXB','DOH','AUH','RUH','JED','KWI','TLV']},
  {iata:'BOM',cancelled:249,stranded:46065,airlines:['IndiGo','Air India','SpiceJet','Qatar Airways','Etihad Airways'],me_hubs:['DXB','DOH','AUH','RUH','JED','BAH','KWI','MCT','AMM']},
  {iata:'MLE',cancelled:243,stranded:44955,airlines:['Qatar Airways','Oman Air','Etihad Airways','EgyptAir'],me_hubs:['DOH','AUH']},
  {iata:'BCN',cancelled:241,stranded:44585,airlines:['Qantas','Etihad Airways','Iberia','El Al'],me_hubs:['DXB','DOH','AUH','TLV']},
  {iata:'KHI',cancelled:240,stranded:44400,airlines:['Qatar Airways','Etihad Airways','flydubai','Emirates','Saudia'],me_hubs:['DOH','AUH','DXB','RUH','JED','BAH']},
  {iata:'KUL',cancelled:228,stranded:42180,airlines:['Emirates','Qatar Airways','Malaysia Airlines','EgyptAir'],me_hubs:['DXB','DOH','AUH','JED']},
  {iata:'MEL',cancelled:214,stranded:39590,airlines:['Qantas','Emirates','Oman Air','Etihad Airways'],me_hubs:['DXB','DOH','AUH']},
  {iata:'FRA',cancelled:205,stranded:37925,airlines:['Qantas','Emirates','SAS','Gulf Air','El Al'],me_hubs:['DXB','DOH','AUH','BAH','TLV']},
  {iata:'MXP',cancelled:202,stranded:37370,airlines:['Qantas','Qatar Airways','Etihad Airways'],me_hubs:['DXB','DOH','AUH']},
  {iata:'CAI',cancelled:199,stranded:36815,airlines:['EgyptAir','Air Cairo','Gulf Air','Jazeera Airways'],me_hubs:['RUH','JED','BAH','KWI','MCT','AMM']},
  {iata:'DAC',cancelled:195,stranded:36075,airlines:['flydubai','Emirates','Qatar Airways','Saudia','Gulf Air'],me_hubs:['DXB','DOH','RUH','JED','BAH','MCT']},
  {iata:'ATH',cancelled:192,stranded:35520,airlines:['Emirates','Qatar Airways','Etihad Airways','Gulf Air','El Al'],me_hubs:['DXB','DOH','AUH','BAH','TLV']},
  {iata:'FCO',cancelled:190,stranded:35150,airlines:['Qantas','Emirates','Qatar Airways','El Al'],me_hubs:['DXB','DOH','JED','TLV']},
  {iata:'DEL',cancelled:190,stranded:35150,airlines:['Air India','Qatar Airways','IndiGo','Etihad Airways','Gulf Air'],me_hubs:['DXB','DOH','AUH','RUH','JED','BAH','KWI','TLV']},
  {iata:'SYD',cancelled:188,stranded:34780,airlines:['Qantas','Condor','Emirates','Oman Air','Etihad Airways'],me_hubs:['DXB','DOH','AUH']},
  {iata:'LHE',cancelled:182,stranded:33670,airlines:['Qatar Airways','Pakistan International Airlines','Saudia','Gulf Air'],me_hubs:['DOH','RUH','JED','BAH','KWI','MCT']},
  {iata:'MAD',cancelled:176,stranded:32560,airlines:['Qantas','Emirates','Qatar Airways','Iberia','El Al'],me_hubs:['DXB','DOH','TLV','AMM']},
  {iata:'ISB',cancelled:175,stranded:32375,airlines:['Qatar Airways','Pakistan International Airlines','Etihad Airways','Saudia','Gulf Air'],me_hubs:['DOH','AUH','JED','BAH']},
  {iata:'ZRH',cancelled:173,stranded:32005,airlines:['SWISS','Qatar Airways','Etihad Airways','El Al'],me_hubs:['DXB','DOH','AUH','TLV']},
  {iata:'IST',cancelled:169,stranded:31265,airlines:['Qantas','Emirates','Turkish Airlines','Qatar Airways','Gulf Air'],me_hubs:['DXB','DOH','AUH','RUH','JED','BAH','AMM']},
  {iata:'CGK',cancelled:167,stranded:30895,airlines:['Garuda Indonesia','flydubai','Qatar Airways','Etihad Airways','Saudia'],me_hubs:['DXB','DOH','AUH','JED']},
  {iata:'HKG',cancelled:157,stranded:29045,airlines:['Emirates','British Airways','Etihad Airways'],me_hubs:['DXB','DOH','AUH']},
  {iata:'MUC',cancelled:154,stranded:28490,airlines:['Qantas','Emirates','Lufthansa','Etihad Airways','Gulf Air'],me_hubs:['DXB','DOH','AUH','BAH','TLV']},
  {iata:'DPS',cancelled:152,stranded:28120,airlines:['Emirates','Garuda Indonesia','flydubai','Qatar Airways'],me_hubs:['DXB','DOH']},
  {iata:'GRU',cancelled:140,stranded:25900,airlines:['Emirates','Qatar Airways','Gulf Air'],me_hubs:['DXB','DOH']},
  {iata:'CPH',cancelled:139,stranded:25715,airlines:['Qantas','Emirates','Qatar Airways'],me_hubs:['DXB','DOH']},
  {iata:'ADD',cancelled:130,stranded:24050,airlines:['flydubai','British Airways','Qatar Airways'],me_hubs:['DXB','DOH']},
  {iata:'DFW',cancelled:128,stranded:23680,airlines:['Emirates','Qatar Airways'],me_hubs:['DXB','DOH']},
  {iata:'HAN',cancelled:128,stranded:23680,airlines:['Qatar Airways','British Airways'],me_hubs:['DOH']},
  {iata:'ICN',cancelled:125,stranded:23125,airlines:['Emirates','Korean Air','Qatar Airways','Etihad Airways'],me_hubs:['DXB','DOH','AUH']},
  {iata:'HYD',cancelled:120,stranded:22200,airlines:['IndiGo','Air India','Qatar Airways','Etihad Airways','Gulf Air'],me_hubs:['DXB','DOH','AUH','RUH','JED','BAH','KWI','MCT']},
  {iata:'VIE',cancelled:117,stranded:21645,airlines:['Emirates','Qantas','Qatar Airways','Etihad Airways','El Al'],me_hubs:['DXB','DOH','AUH','TLV']},
  {iata:'BNE',cancelled:113,stranded:20905,airlines:['Qantas','Emirates','Qatar Airways'],me_hubs:['DXB','DOH']},
  {iata:'BER',cancelled:111,stranded:20535,airlines:['Condor','Qatar Airways'],me_hubs:['DXB','DOH']},
  {iata:'BRU',cancelled:108,stranded:19980,airlines:['Qantas','Emirates','Qatar Airways','Etihad Airways'],me_hubs:['DXB','DOH','AUH','TLV']},
  {iata:'IAD',cancelled:103,stranded:19055,airlines:['Emirates','Qatar Airways','Etihad Airways','Saudia','United Airlines'],me_hubs:['DXB','DOH','AUH','JED','TLV']},
  {iata:'SGN',cancelled:103,stranded:19055,airlines:['Qatar Airways','Finnair'],me_hubs:['DOH']},
  {iata:'COK',cancelled:101,stranded:18685,airlines:['Air India','SpiceJet','IndiGo','Qatar Airways','Gulf Air'],me_hubs:['DXB','DOH','AUH','BAH','KWI','MCT']},
  {iata:'PER',cancelled:100,stranded:18500,airlines:['Emirates','Qantas','Qatar Airways'],me_hubs:['DXB','DOH']},
  {iata:'BLR',cancelled:88,stranded:16280,airlines:['IndiGo','Emirates','Qatar Airways','Etihad Airways','Gulf Air'],me_hubs:['DXB','DOH','AUH','RUH','JED','BAH']},
  {iata:'MIA',cancelled:87,stranded:16095,airlines:['Emirates','Qatar Airways','El Al'],me_hubs:['DXB','DOH','TLV']},
  {iata:'BOS',cancelled:82,stranded:15170,airlines:['Emirates','Qatar Airways','El Al'],me_hubs:['DXB','DOH','TLV']},
  {iata:'MNL',cancelled:79,stranded:14615,airlines:['Qatar Airways','Etihad Airways','Saudia','Philippine Airlines','Gulf Air'],me_hubs:['DOH','AUH','RUH','BAH']},
  {iata:'PVG',cancelled:78,stranded:14430,airlines:['China Eastern Airlines','Saudia','Qatar Airways','Etihad Airways','Gulf Air'],me_hubs:['DXB','DOH','AUH','RUH','BAH']},
  {iata:'DAR',cancelled:73,stranded:13505,airlines:['Emirates','Qatar Airways'],me_hubs:['DXB','DOH']},
  {iata:'MAA',cancelled:72,stranded:13320,airlines:['Air India','IndiGo','Qatar Airways','Etihad Airways'],me_hubs:['DXB','DOH','AUH']},
  {iata:'ORD',cancelled:69,stranded:12765,airlines:['Emirates','Qatar Airways','Etihad Airways','United Airlines'],me_hubs:['DXB','DOH','AUH','TLV']},
  {iata:'YYZ',cancelled:69,stranded:12765,airlines:['Air Canada','Emirates','Qatar Airways','Etihad Airways'],me_hubs:['DXB','DOH','AUH','TLV']},
  {iata:'KTM',cancelled:69,stranded:12765,airlines:['flydubai','Emirates','Qatar Airways'],me_hubs:['DXB','DOH']},
  {iata:'OSL',cancelled:68,stranded:12580,airlines:['Emirates','Qantas','Qatar Airways'],me_hubs:['DXB','DOH']},
  {iata:'ARN',cancelled:62,stranded:11470,airlines:['Emirates','Qantas','Qatar Airways'],me_hubs:['DXB','DOH']},
  {iata:'CAN',cancelled:60,stranded:11100,airlines:['China Southern Airlines','Emirates','Qatar Airways','Gulf Air'],me_hubs:['DXB','DOH','BAH']},
  {iata:'LAX',cancelled:57,stranded:10545,airlines:['Emirates','Qatar Airways','El Al'],me_hubs:['DXB','DOH','TLV']},
  {iata:'NRT',cancelled:57,stranded:10545,airlines:['Japan Airlines','Emirates','Qatar Airways','Etihad Airways'],me_hubs:['DXB','DOH','AUH']},
  {iata:'MAN',cancelled:52,stranded:9620,airlines:['Emirates','Qantas','Gulf Air'],me_hubs:['DXB','BAH']},
  {iata:'AKL',cancelled:52,stranded:9620,airlines:['Emirates','Qatar Airways'],me_hubs:['DXB','DOH']},
  {iata:'TBS',cancelled:52,stranded:9620,airlines:['flydubai','Emirates','El Al'],me_hubs:['DXB','TLV']},
  {iata:'EWR',cancelled:50,stranded:9250,airlines:['United Airlines'],me_hubs:['DXB','TLV']},
  {iata:'LGW',cancelled:49,stranded:9065,airlines:['Qantas','Emirates'],me_hubs:['DXB']},
  {iata:'PRG',cancelled:47,stranded:8695,airlines:['flydubai','Emirates','SmartWings','El Al','Ryanair'],me_hubs:['DXB','TLV','AMM']},
  {iata:'DUB',cancelled:45,stranded:8325,airlines:['Emirates','Qantas','Etihad Airways'],me_hubs:['DXB','AUH']},
  {iata:'BUD',cancelled:45,stranded:8325,airlines:['Emirates','Qantas','El Al'],me_hubs:['DXB','TLV']},
  {iata:'MRU',cancelled:42,stranded:7770,airlines:['Emirates','Air Mauritius'],me_hubs:['DXB']},
  {iata:'LOS',cancelled:41,stranded:7585,airlines:['Emirates','Qatar Airways'],me_hubs:['DXB','DOH']},
  {iata:'AMD',cancelled:40,stranded:7400,airlines:['IndiGo','SpiceJet','Qatar Airways'],me_hubs:['DXB','DOH','KWI']},
  {iata:'GVA',cancelled:39,stranded:7215,airlines:['Emirates','Qantas','Etihad Airways'],me_hubs:['DXB','AUH']},
  {iata:'WAW',cancelled:38,stranded:7030,airlines:['flydubai','Emirates'],me_hubs:['DXB']},
  {iata:'OTP',cancelled:35,stranded:6475,airlines:['El Al','TAROM','Ryanair'],me_hubs:['TLV','AMM']},
  {iata:'PHL',cancelled:31,stranded:5735,airlines:['Qatar Airways'],me_hubs:['DOH']},
  {iata:'TAS',cancelled:29,stranded:5365,airlines:['flydubai','Emirates'],me_hubs:['DXB']},
  {iata:'EBB',cancelled:29,stranded:5365,airlines:['flydubai','Emirates'],me_hubs:['DXB']},
  {iata:'BEG',cancelled:28,stranded:5180,airlines:['flydubai','Emirates'],me_hubs:['DXB']},
  {iata:'DME',cancelled:26,stranded:4810,airlines:['Emirates','S7 Airlines'],me_hubs:['DXB']},
  {iata:'SOF',cancelled:25,stranded:4625,airlines:['flydubai','Emirates','El Al'],me_hubs:['DXB','TLV']},
  {iata:'HAM',cancelled:24,stranded:4440,airlines:['Emirates','Qantas'],me_hubs:['DXB']},
  {iata:'TPE',cancelled:24,stranded:4440,airlines:['Emirates','STARLUX','Etihad Airways'],me_hubs:['DXB','AUH']},
  {iata:'SAW',cancelled:23,stranded:4255,airlines:['Pegasus','Emirates','flydubai'],me_hubs:['DXB']},
  {iata:'BHX',cancelled:22,stranded:4070,airlines:['Emirates','Qantas'],me_hubs:['DXB']},
  {iata:'LIS',cancelled:22,stranded:4070,airlines:['TAP Air Portugal','Emirates'],me_hubs:['DXB']},
  {iata:'EVN',cancelled:22,stranded:4070,airlines:['flydubai','Emirates'],me_hubs:['DXB']},
  {iata:'ZNZ',cancelled:22,stranded:4070,airlines:['flydubai','Emirates'],me_hubs:['DXB']},
  {iata:'DUS',cancelled:20,stranded:3700,airlines:['Emirates','Qantas'],me_hubs:['DXB']},
  {iata:'PEK',cancelled:20,stranded:3700,airlines:['Emirates','Air China'],me_hubs:['DXB','AUH']},
  {iata:'CCU',cancelled:19,stranded:3515,airlines:['Emirates','Qatar Airways'],me_hubs:['DXB','DOH']},
  {iata:'DUR',cancelled:18,stranded:3330,airlines:['Emirates','South African Airways'],me_hubs:['DXB']},
  {iata:'KZN',cancelled:18,stranded:3330,airlines:['flydubai','Emirates'],me_hubs:['DXB']},
  {iata:'GYD',cancelled:18,stranded:3330,airlines:['flydubai','Emirates'],me_hubs:['DXB']},
  {iata:'GLA',cancelled:15,stranded:2775,airlines:['Emirates','Qantas'],me_hubs:['DXB']},
  {iata:'LED',cancelled:15,stranded:2775,airlines:['flydubai'],me_hubs:['DXB']},
  {iata:'KRK',cancelled:14,stranded:2590,airlines:['flydubai','Emirates'],me_hubs:['DXB']},
  {iata:'ASB',cancelled:14,stranded:2590,airlines:['flydubai','Emirates'],me_hubs:['DXB']},
  {iata:'DAM',cancelled:14,stranded:2590,airlines:['Royal Jordanian'],me_hubs:['AMM']},
  {iata:'CMN',cancelled:13,stranded:2405,airlines:['Gulf Air'],me_hubs:['BAH']},
  {iata:'NCL',cancelled:12,stranded:2220,airlines:['Emirates','Qantas'],me_hubs:['DXB']},
  {iata:'LYS',cancelled:12,stranded:2220,airlines:['Emirates','Qantas'],me_hubs:['DXB']},
  {iata:'TRV',cancelled:11,stranded:2035,airlines:['Emirates'],me_hubs:['DXB']},
  {iata:'NCE',cancelled:10,stranded:1850,airlines:['Emirates','Qantas'],me_hubs:['DXB']},
  {iata:'VCE',cancelled:10,stranded:1850,airlines:['Emirates','Qantas'],me_hubs:['DXB']},
  {iata:'HND',cancelled:10,stranded:1850,airlines:['Japan Airlines','Emirates'],me_hubs:['DXB']},
  {iata:'ACC',cancelled:10,stranded:1850,airlines:['Qatar Airways'],me_hubs:['DOH']},
  {iata:'SVO',cancelled:10,stranded:1850,airlines:['Aeroflot'],me_hubs:['DXB']},
  {iata:'ASM',cancelled:10,stranded:1850,airlines:['flydubai','Emirates'],me_hubs:['DXB']},
  {iata:'LTN',cancelled:10,stranded:1850,airlines:['El Al'],me_hubs:['TLV']},
  {iata:'PFO',cancelled:10,stranded:1850,airlines:['Ryanair'],me_hubs:['AMM']},
  {iata:'EDI',cancelled:8,stranded:1480,airlines:['Emirates','Qantas'],me_hubs:['DXB']},
  {iata:'VNO',cancelled:8,stranded:1480,airlines:['Air Baltic','Emirates','flydubai'],me_hubs:['DXB']},
  {iata:'LCA',cancelled:8,stranded:1480,airlines:['Gulf Air'],me_hubs:['BAH']},
  {iata:'ALG',cancelled:7,stranded:1295,airlines:['Emirates'],me_hubs:['DXB']},
  {iata:'IAH',cancelled:6,stranded:1110,airlines:['Emirates'],me_hubs:['DXB']},
  {iata:'VOG',cancelled:6,stranded:1110,airlines:['flydubai','Emirates'],me_hubs:['DXB']},
  {iata:'GOI',cancelled:6,stranded:1110,airlines:['Gulf Air'],me_hubs:['BAH']},
  {iata:'SEA',cancelled:5,stranded:925,airlines:['Emirates'],me_hubs:['DXB']},
  {iata:'YUL',cancelled:5,stranded:925,airlines:['Emirates'],me_hubs:['DXB']},
  {iata:'SFO',cancelled:4,stranded:740,airlines:['Emirates'],me_hubs:['DXB']},
  {iata:'MCO',cancelled:3,stranded:555,airlines:['Emirates'],me_hubs:['DXB']},
  {iata:'HEL',cancelled:3,stranded:555,airlines:['Finnair'],me_hubs:['DXB']},
  {iata:'DSS',cancelled:3,stranded:555,airlines:['Emirates'],me_hubs:['DXB']},
  {iata:'BGY',cancelled:3,stranded:555,airlines:['Ryanair'],me_hubs:['AMM']},
  {iata:'CIA',cancelled:3,stranded:555,airlines:['Ryanair'],me_hubs:['AMM']},
  {iata:'KGL',cancelled:2,stranded:370,airlines:['RwandAir'],me_hubs:['DXB']},
  {iata:'TUN',cancelled:2,stranded:370,airlines:['Tunisair'],me_hubs:['JED']},
  {iata:'PSA',cancelled:2,stranded:370,airlines:['Ryanair'],me_hubs:['AMM']},
  {iata:'ESB',cancelled:1,stranded:185,airlines:['Pegasus'],me_hubs:['AMM']},
];

// ============================================================
// LIVE DATA FROM SUPABASE
// ============================================================
let _globalDisruptions = [];

async function fetchSitrepFromSupabase() {
  try {
    const { data, error } = await _sb.from('sitrep').select('*').eq('id', 'current').single();
    if (error || !data) throw new Error('No sitrep data');
    
    // Update AIRPORT_DATA from live airport_status if available
    const liveAirports = typeof data.airport_status === 'string' ? JSON.parse(data.airport_status || '[]') : (data.airport_status || []);
    if (liveAirports.length) {
      AIRPORT_DATA = liveAirports.map(a => ({
        city: a.city, code: a.iata, iata: a.iata,
        coords: [a.lat, a.lng],
        cancelled: a.cancelled || 0,
        status: a.status || 'UNKNOWN',
        stranded: a.stranded || 0,
        cancelRate: a.cancel_rate || 0,
        dailyFlights: a.daily_flights || 0,
        h7: a.h7 || 0,
        updated: a.updated ? new Date(a.updated).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}) : '--:--',
      }));
    }
    
    // Use REAL global disruptions from Supabase if available, else use seeded data
    if (data.global_disruptions) {
      const gd = typeof data.global_disruptions === 'string' ? JSON.parse(data.global_disruptions) : data.global_disruptions;
      if (gd.length) {
        _globalDisruptions = gd;
        console.log(`[Global] Loaded ${gd.length} REAL disrupted airports from Supabase`);
      } else {
        _globalDisruptions = computeGlobalFromAirportData();
      }
    } else {
      _globalDisruptions = computeGlobalFromAirportData();
    }
    const stranded = computeTotalStranded();
    
    return {
      stranded,
      cancelled: data.cancelled_flights,
      airports: data.airports_closed,
      airspace: data.airspace_closed_countries,
      lastUpdated: data.last_updated,
      methodology: data.methodology,
      sources: data.sources_used,
    };
  } catch(e) {
    console.warn('Supabase sitrep unavailable, using seeded data:', e.message);
    _globalDisruptions = computeGlobalFromAirportData();
    const totalStranded = computeTotalStranded();
    return {
      stranded: totalStranded,
      cancelled: AIRPORT_DATA.reduce((s,a) => s + (a.cancelled||0), 0),
      airports: AIRPORT_DATA.filter(a => a.status === 'CLOSED' || a.status === 'RESTRICTED').length,
      airspace: 4,
    };
  }
}

function computeGlobalFromAirportData() {
  // Prefer REAL global disruption data from AviationStack
  if (typeof REAL_GLOBAL_DISRUPTIONS !== 'undefined' && REAL_GLOBAL_DISRUPTIONS.length) {
    // Add ME airports as purple dots too (flagged isME to avoid double-counting in totals)
    const meAsDots = AIRPORT_DATA.filter(a => (a.cancelled || 0) > 0).map(a => ({
      iata: a.iata || a.code,
      cancelled: a.cancelled,
      stranded: a.stranded || (a.cancelled * 185),
      airlines: [],
      me_hubs: [],
      isME: true,
    }));
    console.log(`[Global] Using REAL data: ${REAL_GLOBAL_DISRUPTIONS.length} global + ${meAsDots.length} ME airports`);
    return [...meAsDots, ...REAL_GLOBAL_DISRUPTIONS];
  }
  // Fallback to modeled data
  if (typeof computeGlobalDisruptions !== 'function' || typeof ME_AIRPORTS === 'undefined') {
    console.warn('[Global] No real data or model available');
    return [];
  }
  const meStatuses = {};
  for (const a of AIRPORT_DATA) {
    const iata = a.iata || a.code;
    const cr = (a.cancelRate && a.cancelRate > 1) ? a.cancelRate / 100
      : a.status === 'CLOSED' ? 0.93
      : a.status === 'RESTRICTED' || a.status === 'LIMITED' ? 0.6
      : a.status === 'DISRUPTED' ? 0.15
      : 0.05;
    meStatuses[iata] = { cancelRate: cr };
  }
  for (const iata of Object.keys(ME_AIRPORTS)) {
    if (!meStatuses[iata]) {
      meStatuses[iata] = { cancelRate: 0.1 };
    }
  }
  const raw = computeGlobalDisruptions(meStatuses);
  console.log(`[Global] Computed ${raw.length} disrupted airports from model (no real data)`);
  return raw;
}

function computeTotalStranded() {
  const meStranded = AIRPORT_DATA.reduce((s, a) => s + (a.stranded || 0), 0);
  // Skip isME entries — those are already counted in AIRPORT_DATA
  const globalStranded = _globalDisruptions.reduce((s, g) => s + (g.isME ? 0 : (g.stranded || 0)), 0);
  return meStranded + globalStranded;
}

// ============================================================
// MAP STATE
// ============================================================
const SC = {danger:'#a855f7',warn:'#a855f7',safe:'#a855f7'};
const _mk = {country:[],routes:[],worldwide:[],help:[]};
let _helpCluster = null;
let _mHelpCluster = null;
let _postMarkers = [];
let posts = [];
const _dataPins = {_pc:[],_mobile:[]};
let _globalPins = [];
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
}

function toggleFpSection(head) {
  const body = head.nextElementSibling;
  if (body) body.classList.toggle('open');
}

function getFilterState() {
  // Read from whichever set of controls exists — use fp- (desktop) as primary, fall back to mfp- (mobile)
  function val(id) { const el = document.getElementById(id); return el ? (el.type === 'checkbox' ? el.checked : el.value) : null; }
  function checked(containerId) { return [...document.querySelectorAll('#' + containerId + ' input:checked')].map(c => c.value); }

  // Try desktop first, then mobile
  const showOffers = val('fp-show-offers') ?? val('mfp-show-offers') ?? true;
  const offersVerified = val('fp-offers-verified') ?? val('mfp-offers-verified') ?? false;
  const offerTypes = checked('fp-offer-type').length ? checked('fp-offer-type') : checked('mfp-offer-type');
  const showStranded = val('fp-show-stranded') ?? val('mfp-show-stranded') ?? true;
  const strandedVerified = val('fp-stranded-verified') ?? val('mfp-stranded-verified') ?? false;
  const nationality = val('fp-nationality') || val('mfp-nationality') || '';
  const strandedNeeds = checked('fp-stranded-needs').length ? checked('fp-stranded-needs') : checked('mfp-stranded-needs');
  const groupSize = val('fp-group-size') || val('mfp-group-size') || '';
  const showWorldwide = val('fp-show-worldwide') ?? val('mfp-show-worldwide') ?? true;

  const destCountry = val('fp-filter-dest-country') || val('mfp-filter-dest-country') || '';
  const destAirport = val('fp-filter-dest-airport') || val('mfp-filter-dest-airport') || '';
  const showArcs = val('fp-worldwide-arcs') ?? val('mfp-worldwide-arcs') ?? false;
  const atIata = _filterAtIata || val('fp-at-iata') || val('mfp-at-iata') || '';
  const toIata = _filterToIata || val('fp-to-iata') || val('mfp-to-iata') || '';
  return { showOffers, offersVerified, offerTypes, showStranded, strandedVerified, nationality, strandedNeeds, groupSize, showWorldwide, destCountry, destAirport, showArcs, atIata, toIata };
}

function applyFilters() {
  const f = getFilterState();
  syncFilterPanels();

  // ── Filter & re-render help posts (offers) ──
  const filteredPosts = posts.filter(p => {
    if (p.type !== 'offer') return false;
    if (!f.showOffers) return false;
    if (f.offersVerified && !p.user_id) return false;
    if (f.offerTypes.length && !f.offerTypes.includes(p.post_type)) return false;
    return true;
  });
  renderFilteredPosts(window._crisisMap, _helpCluster, filteredPosts);
  renderFilteredPosts(window._mobileMap, _mHelpCluster, filteredPosts);

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
  renderFilteredStranded(window._crisisMap, false, filteredStranded);
  renderFilteredStranded(window._mobileMap, true, filteredStranded);

  // ── Arc lines (only when dest filter active) ──
  clearArcLines();
  if (f.destCountry || f.destAirport) {
    drawArcLines(window._crisisMap, filteredStranded);
    drawArcLines(window._mobileMap, filteredStranded);
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
        const maxS = Math.max(...reverseData.map(x => x.stranded), 1);
        for (const r of reverseData) {
          const radius = 4 + Math.min(14, (r.stranded / maxS) * 14);
          const circle = L.circleMarker([r.lat, r.lng], {
            radius, fillColor: '#a855f7', color: 'rgba(168,85,247,.4)', weight: 1.5, fillOpacity: 0.45,
          }).addTo(map);
          circle.bindPopup('<div style="min-width:200px;font-family:Inter,sans-serif"><div style="font-size:.6rem;font-weight:700;text-transform:uppercase;color:#a855f7;margin-bottom:.3rem">TRYING TO REACH '+destCity.toUpperCase()+'</div><div style="font-size:.88rem;font-weight:800;color:#fff;margin-bottom:.15rem">'+r.city+' ('+r.iata+')</div><div style="display:grid;grid-template-columns:1fr 1fr;gap:.3rem .8rem;margin-bottom:.4rem;margin-top:.4rem"><div><div style="font-size:1.1rem;font-weight:800;color:#a855f7">'+r.cancelled.toLocaleString()+'</div><div style="font-size:.55rem;color:rgba(255,255,255,.4);text-transform:uppercase">Flights Cancelled</div></div><div><div style="font-size:1.1rem;font-weight:800;color:#a855f7">'+r.stranded.toLocaleString()+'</div><div style="font-size:.55rem;color:rgba(255,255,255,.4);text-transform:uppercase">Pax Stranded</div></div></div><div style="display:flex;flex-wrap:wrap;gap:3px">'+r.airlines.map(a => '<span style="padding:.15rem .4rem;background:rgba(168,85,247,.12);border-radius:4px;font-size:.6rem;color:#a855f7;font-weight:600">'+a+'</span>').join('')+'</div>'+(typeof buildEmbassyButton==='function'?buildEmbassyButton(r.iata):'')+'</div>', { className: 'dark-popup', maxWidth: 300 });
          _globalPins.push(circle);
        }

        // Destination dot with popup
        if (destAp) {
          const destDot = L.circleMarker([destAp.lat, destAp.lng], {
            radius: 8, fillColor: '#a855f7', color: '#fff', weight: 2.5, fillOpacity: 0.9,
          }).addTo(map);
          destDot.bindPopup('<div style="min-width:240px;font-family:Inter,sans-serif"><div style="font-size:.6rem;font-weight:700;text-transform:uppercase;color:#a855f7;margin-bottom:.3rem">DESTINATION</div><div style="font-size:.95rem;font-weight:800;color:#fff;margin-bottom:.25rem">'+destCity+' ('+f.toIata+')</div><div style="font-size:.72rem;color:rgba(255,255,255,.5);margin-bottom:.6rem">'+(destAp.countryName||destAp.country||'')+'</div><div style="display:grid;grid-template-columns:1fr 1fr;gap:.3rem .8rem;margin-bottom:.6rem"><div><div style="font-size:1.3rem;font-weight:800;color:#a855f7;line-height:1">'+totalRevStranded.toLocaleString()+'</div><div style="font-size:.55rem;color:rgba(255,255,255,.4);text-transform:uppercase;margin-top:.15rem">People Trying to Reach Here</div></div><div><div style="font-size:1.3rem;font-weight:800;color:#a855f7;line-height:1">'+totalRevCancelled.toLocaleString()+'</div><div style="font-size:.55rem;color:rgba(255,255,255,.4);text-transform:uppercase;margin-top:.15rem">Inbound Flights Cancelled</div></div></div><div style="font-size:.72rem;color:rgba(255,255,255,.55);line-height:1.5;margin-bottom:.5rem">'+totalRevStranded.toLocaleString()+' passengers across '+reverseData.length+' Middle East airports are stranded and unable to fly home to '+destCity+'.</div><div style="font-size:.6rem;font-weight:700;text-transform:uppercase;color:rgba(255,255,255,.25);margin-bottom:.3rem">Affected Airlines</div><div style="display:flex;flex-wrap:wrap;gap:3px">'+allAirlines.map(a => '<span style="padding:.15rem .4rem;background:rgba(168,85,247,.12);border-radius:4px;font-size:.6rem;color:#a855f7;font-weight:600">'+a+'</span>').join('')+'</div><div style="font-size:.6rem;font-weight:700;text-transform:uppercase;color:rgba(255,255,255,.25);margin-top:.5rem;margin-bottom:.3rem">They\u2019re stuck at</div>'+reverseData.slice(0,6).map(r => '<div style="display:flex;justify-content:space-between;padding:.2rem 0;border-bottom:1px solid rgba(255,255,255,.04);font-size:.68rem"><span style="color:rgba(255,255,255,.6)">'+r.city+' ('+r.iata+')</span><span style="color:#a855f7;font-weight:700">'+r.stranded.toLocaleString()+'</span></div>').join('')+'</div>'+(typeof buildGlobalEmergencyButton==='function'?buildGlobalEmergencyButton():'')+'</div>', { className: 'dark-popup', maxWidth: 320 });
          _globalPins.push(destDot);
        }
      });

      // Arcs from ME hubs to destination
      if (f.showArcs || hasTo) {
        if (destAp) {
          const maxC = Math.max(...reverseData.map(r => r.cancelled), 1);
          for (const r of reverseData) {
            const weight = 0.5 + (r.cancelled / maxC) * 3.5;
            const arc = generateArc([r.lat, r.lng], [destAp.lat, destAp.lng], 30);
            [window._crisisMap, window._mobileMap].forEach(map => {
              if (!map) return;
              const line = L.polyline(arc, { color: 'rgba(168,85,247,.3)', weight, interactive: false }).addTo(map);
              _globalArcLines.push(line);
            });
          }
        }
      }
    }
  }
  
  // ── Update Est. Stranded label ──
  updateStrandedLabel(f.atIata, f.toIata, filteredGlobal, reverseData);

  // Country markers always visible
  if (_mk.country) {
    _mk.country.forEach(({marker}) => {
      [window._crisisMap, window._mobileMap].forEach(map => { if (map) marker.addTo(map); });
    });
  }

  // Airport pins always visible
  [window._crisisMap, window._mobileMap].forEach(map => {
    if (map) renderAirportPins(map, 'stranded');
  });
}

function renderFilteredPosts(map, cluster, filteredPosts) {
  if (!map || !cluster) return;
  cluster.clearLayers();
  for (const p of filteredPosts) {
    if (!p.lat || !p.lng) continue;
    const helpIcon = L.divIcon({
      className:'help-pin',
      html:'<div style="width:14px;height:14px;background:#3b82f6;border:2px solid #fff;border-radius:50%;box-shadow:0 1px 4px rgba(0,0,0,.3)"></div>',
      iconSize:[14,14],iconAnchor:[7,7]
    });
    const m = L.marker([p.lat, p.lng], {icon: helpIcon})
      .bindPopup(`<div style="font-family:Inter,sans-serif;min-width:220px;max-width:280px">
        <div style="font-size:.62rem;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#93c5fd;margin-bottom:.25rem">SPARE ROOM</div>
        <div style="font-weight:600;font-size:.84rem;margin-bottom:.2rem;color:#fff">${p.name} ${buildBadge(!!p.user_id)}</div>
        <div style="font-size:.77rem;color:rgba(255,255,255,.75);line-height:1.5;margin-bottom:.3rem">${(p.body||'').slice(0,120)}${(p.body||'').length>120?'...':''}</div>
        <div style="font-size:.68rem;color:rgba(255,255,255,.4);margin-bottom:.15rem">📍 ${p.location}</div>
        ${buildContactButtons(p.contact, p.xhandle, p.name)}
        ${buildTipButton(p.xhandle, !!p.user_id)}
      </div>`);
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
      const count = c.getAllChildMarkers().reduce((sum, m) => sum + (m.options.groupSize || 1), 0);
      const size = count > 50 ? 44 : count > 10 ? 36 : 28;
      return L.divIcon({ html: '<div class="stranded-cluster" style="width:'+size+'px;height:'+size+'px">'+count+'</div>', className: '', iconSize: [size, size] });
    }
  });

  for (const p of filteredData) {
    if (!p.current_lat || !p.current_lng) continue;
    const age = timeAgo(p.created_at);
    const needsList = (p.needs || []).map(n => NEED_LABELS[n] || n).join(', ');
    const sinceTxt = p.stranded_since ? 'Since ' + new Date(p.stranded_since).toLocaleDateString() : '';
    const icon = L.divIcon({ className: '', html: '<div class="stranded-pin"></div>', iconSize: [10, 10], iconAnchor: [5, 5] });
    const marker = L.marker([p.current_lat, p.current_lng], { icon, groupSize: p.group_size || 1 });
    marker.bindPopup(`
      <div style="min-width:200px;font-family:Inter,sans-serif">
        <div style="font-size:.6rem;font-weight:700;text-transform:uppercase;color:#ec3452;margin-bottom:.3rem">STRANDED · ${age}</div>
        ${p.name ? '<div style="font-size:.88rem;font-weight:800;color:#fff;margin-bottom:.1rem">'+p.name+'</div>' : ''}
        <div style="font-size:.78rem;font-weight:600;color:rgba(255,255,255,.7);margin-bottom:.15rem">${p.group_size > 1 ? p.group_size + ' people' : '1 person'}${p.nationality ? ' · ' + p.nationality : ''}</div>
        <div style="font-size:.75rem;color:rgba(255,255,255,.6);margin-bottom:.15rem">From: ${p.current_location}</div>
        <div style="font-size:.75rem;color:rgba(255,255,255,.6);margin-bottom:.3rem">Need to reach: <strong style="color:#fff">${p.destination}</strong>${p.dest_airport ? ' <span style="background:rgba(255,255,255,.1);padding:.1rem .4rem;border-radius:4px;font-size:.65rem;font-weight:600">✈ '+p.dest_airport+'</span>' : ''}</div>
        ${needsList ? '<div style="font-size:.68rem;color:#e67e22;margin-bottom:.2rem">Needs: '+needsList+'</div>' : ''}
        ${sinceTxt ? '<div style="font-size:.65rem;color:rgba(255,255,255,.35)">'+sinceTxt+'</div>' : ''}
        ${p.details ? '<div style="font-size:.75rem;color:rgba(255,255,255,.5);line-height:1.4;margin-top:.3rem">'+p.details.slice(0,150)+'</div>' : ''}
        ${buildContactButtons(p.contact, p.xhandle, p.name)}
        ${buildSendHelpButton(p.xhandle, !!p.user_id)}
      </div>
    `, { className: 'dark-popup', maxWidth: 280 });
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
  ];
  pairs.forEach(([d,m]) => {
    const src = document.getElementById(isMobile ? m : d);
    const dst = document.getElementById(isMobile ? d : m);
    if (src && dst) dst.checked = src.checked;
  });
  [['fp-nationality','mfp-nationality'],['fp-group-size','mfp-group-size'],['fp-at-search','mfp-at-search'],['fp-at-iata','mfp-at-iata'],['fp-to-search','mfp-to-search'],['fp-to-iata','mfp-to-iata']].forEach(([d,m]) => {
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
  var pcArc = document.getElementById('fp-worldwide-arcs');
  var mArc = document.getElementById('mfp-worldwide-arcs');
  var newState = pcArc ? !pcArc.checked : true;
  if (pcArc) pcArc.checked = newState;
  if (mArc) mArc.checked = newState;
  applyFilters();
}

function clearAllFilters() {
  _mapFilterActive = '';
  clearGlobalFilter();
  document.querySelectorAll('.fp-chip input').forEach(cb => cb.checked = false);
  document.querySelectorAll('[id$="-show-offers"],[id$="-show-stranded"],[id$="-show-worldwide"]').forEach(cb => cb.checked = true);
  document.querySelectorAll('[id$="-offers-verified"],[id$="-stranded-verified"],[id$="-worldwide-arcs"]').forEach(cb => cb.checked = false);
  document.querySelectorAll('.fp-select').forEach(s => { if (s.tagName === 'SELECT') s.value = ''; else if (s.type === 'text') s.value = ''; });
  document.querySelectorAll('[id$="filter-dest-country"],[id$="filter-dest-airport"]').forEach(h => h.value = '');
  document.querySelectorAll('.sitrep-stat,.m-stat').forEach(s => s.classList.remove('active-filter'));
  [window._crisisMap, window._mobileMap].forEach(map => { if (map) clearDataPins(map); });
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
    if (pcLabel) pcLabel.textContent = 'People Impacted';
    if (pcSub) pcSub.textContent = 'tap \u00b7 see how';
    if (mLabel) mLabel.innerHTML = 'PEOPLE<br>IMPACTED';
    refreshStrandedCount();
  }
}

function refreshStrandedCount() {
  const total = computeTotalStranded();
  ['stat-stranded', 'm-stat-stranded'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = total.toLocaleString();
  });
}

// ── ARC LINES (stranded → destination) ──
let _arcLines = [];
let _globalArcLines = [];
let _filterAtIata = '';  // "Stranded at" filter
let _filterToIata = '';  // "Heading to" filter

function clearArcLines() {
  _arcLines.forEach(line => {
    [window._crisisMap, window._mobileMap].forEach(m => { if (m) try { m.removeLayer(line); } catch(e) {} });
  });
  _arcLines = [];
}

function clearGlobalArcs() {
  _globalArcLines.forEach(line => {
    [window._crisisMap, window._mobileMap].forEach(m => { if (m) try { m.removeLayer(line); } catch(e) {} });
  });
  _globalArcLines = [];
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
  const maxCancelled = Math.max(...disruptions.map(g => g.cancelled || 0), 1);
  
  for (const g of disruptions) {
    const ap = typeof findAirport === 'function' ? findAirport(g.iata) : null;
    if (!ap) continue;
    
    for (const hub of (g.me_hubs || [])) {
      // Look up ME hub coords from ME_AIRPORTS or AIRPORT_DATA
      let hubCoords = null;
      if (typeof ME_AIRPORTS !== 'undefined' && ME_AIRPORTS[hub]) {
        hubCoords = [ME_AIRPORTS[hub].lat, ME_AIRPORTS[hub].lng];
      } else {
        const ad = AIRPORT_DATA.find(a => (a.iata || a.code) === hub);
        if (ad) hubCoords = ad.coords || [ad.lat, ad.lng];
      }
      if (!hubCoords) continue;
      
      // Thickness proportional to cancelled flights (min 0.5, max 4)
      const ratio = (g.cancelled || 0) / maxCancelled;
      const weight = 0.5 + ratio * 3.5;
      
      const arc = generateArc([ap.lat, ap.lng], hubCoords, 30);
      const line = L.polyline(arc, {
        color: 'rgba(168,85,247,.25)',
        weight,
        interactive: false,
      }).addTo(map);
      _globalArcLines.push(line);
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

  // Airport pins — show when stranded filter is active
  [window._crisisMap, window._mobileMap].forEach(map => {
    if (!map) return;
    clearDataPins(map);
    if (type === 'stranded') renderAirportPins(map, 'stranded');
  });

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
  if (name === 'profile') { renderProfileView(); }
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
  if (mode === 'stranded') {
    if (sp) sp.style.display = 'block';
    if (op) op.style.display = 'none';
    if (bs) bs.classList.add('active');
    if (bh) bh.classList.remove('active');
  } else {
    if (sp) sp.style.display = 'none';
    if (op) op.style.display = 'grid';
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

  // Custom panes — layered for proper visibility
  map.createPane('worldwidePane');
  map.getPane('worldwidePane').style.zIndex = 580;
  map.createPane('countryPane');
  map.getPane('countryPane').style.zIndex = 590;
  map.createPane('airportPane');
  map.getPane('airportPane').style.zIndex = 610;
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
    const pinSuffix = showStranded ? 'impacted' : 'cancelled';
    const icon = L.divIcon({
      className:'airport-pin-label',
      html:`<div style="background:#000;border-radius:999px;padding:5px 10px;font-family:Inter,sans-serif;font-size:11px;font-weight:700;color:#fff;white-space:nowrap;box-shadow:0 2px 8px rgba(0,0,0,.35);display:flex;align-items:center;gap:5px">✈ ${a.code} <span style="opacity:.75;font-size:9.5px">${pinNum} ${pinSuffix}</span></div>`,
      iconAnchor:[0,0],iconSize:null
    });
    const m = L.marker(a.coords,{icon,pane:'airportPane'}).addTo(map).bindPopup(`
      <div style="font-family:Inter,sans-serif;min-width:230px">
        <div style="font-size:.65rem;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#fff;margin-bottom:.45rem">✈ ${a.city} — ${a.code}</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:.4rem .85rem;margin-bottom:.55rem">
          <div><div style="font-size:1.5rem;font-weight:800;color:#ec3452;letter-spacing:-.03em;line-height:1">${a.stranded.toLocaleString()}</div><div style="font-size:.58rem;color:rgba(255,255,255,.5);text-transform:uppercase;letter-spacing:.04em;margin-top:.15rem">People Impacted</div></div>
          <div><div style="font-size:1.5rem;font-weight:800;color:#FFF;letter-spacing:-.03em;line-height:1">${a.cancelled.toLocaleString()}</div><div style="font-size:.58rem;color:rgba(255,255,255,.5);text-transform:uppercase;letter-spacing:.04em;margin-top:.15rem">Flights Cancelled</div></div>
        </div>
        <div style="display:flex;justify-content:space-between;padding:.35rem .55rem;background:rgba(255,255,255,.08);border-radius:6px;align-items:center;border:1px solid rgba(255,255,255,.1)">
          <span style="font-size:.7rem;font-weight:700;color:${col==='#ef4444'?'#ec3452':col==='#22c55e'?'#22c55e':'#fcd34d'}">Status: ${a.status}</span>
          <span style="font-size:.62rem;color:rgba(255,255,255,.45)">${a.updated !== '--:--' ? 'Updated '+a.updated : 'Seeded data'}</span>
        </div>
        ${typeof buildEmbassyButton === 'function' ? buildEmbassyButton(a.iata || a.code) : ''}
      </div>
    `);
    _dataPins[map === window._mobileMap ? '_mobile' : '_pc'].push(m);
  });
}

function clearDataPins(map) {
  const key = map === window._mobileMap ? '_mobile' : '_pc';
  if (_dataPins[key]) {
    _dataPins[key].forEach(m => { try { map.removeLayer(m); } catch(e) {} });
  }
  _dataPins[key] = [];
}

// ── GLOBAL DISRUPTION DOTS (purple) ──────────────────────
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
  const tOn = 'background:rgba(168,85,247,.15);color:#a855f7;border:1px solid rgba(168,85,247,.2);';
  const tOff = 'background:transparent;color:rgba(255,255,255,.3);border:1px solid transparent;';
  
  // ── LEAVE data ──
  let lCancelled = 0, lStranded = 0, lRoutes = [], lAirlines = [];
  if (gData) {
    lCancelled = gData.cancelled || 0;
    lStranded = gData.stranded || 0;
    lRoutes = gData.routes || (gData.me_hubs || []).map(h => ({ hub: h, cancelled: Math.round(lCancelled / (gData.me_hubs||[]).length) }));
    lAirlines = gData.airlines || [];
  }
  var lHubCities = lRoutes.slice(0, 4).map(function(r) {
    var h = typeof findAirport === 'function' ? findAirport(r.hub) : null;
    return h ? h.city : r.hub;
  });
  
  // ── HOME data ──
  var rev = _computeReverseCached(iata);
  var hCancelled = rev.reduce(function(s, r) { return s + (r.cancelled || 0); }, 0);
  var hStranded = rev.reduce(function(s, r) { return s + (r.stranded || 0); }, 0);
  var hRoutes = rev.map(function(r) { return { hub: r.iata, cancelled: r.cancelled, city: r.city, airlines: r.airlines || [] }; });
  var hAirlines = [];
  var seen = {};
  rev.forEach(function(r) { (r.airlines || []).forEach(function(a) { if (!seen[a]) { seen[a] = 1; hAirlines.push(a); } }); });
  var hHubCities = hRoutes.slice(0, 4).map(function(r) { return r.city || r.hub; });
  
  function buildRouteRows(routes) {
    return routes.slice(0, 6).map(function(r) {
      var hubAp = typeof findAirport === 'function' ? findAirport(r.hub) : null;
      var hubName = r.city || (hubAp ? hubAp.city : r.hub);
      return '<div style="display:flex;justify-content:space-between;padding:.2rem 0;border-bottom:1px solid rgba(255,255,255,.04);font-size:.68rem"><span style="color:rgba(255,255,255,.6)">' + hubName + ' (' + r.hub + ')</span><span style="color:#a855f7;font-weight:700">' + (r.cancelled || 0).toLocaleString() + '</span></div>';
    }).join('');
  }
  
  function buildPills(airlines) {
    return airlines.slice(0, 6).map(function(a) {
      return '<span style="padding:.15rem .4rem;background:rgba(168,85,247,.12);border-radius:4px;font-size:.6rem;color:#a855f7;font-weight:600">' + a + '</span>';
    }).join('');
  }
  
  var embBtn = typeof buildEmbassyButton === 'function' ? buildEmbassyButton(iata) : (typeof buildGlobalEmergencyButton === 'function' ? buildGlobalEmergencyButton() : '');
  
  // Build panel HTML
  function buildPanel(cancelled, stranded, routes, airlines, mode, hubCities) {
    var desc = '';
    var routeLabel = '';
    if (mode === 'leave') {
      desc = stranded.toLocaleString() + ' people here in ' + city + ', ' + country + ' trying to reach ' + (hubCities.length ? hubCities.join(', ') : 'the Middle East');
      routeLabel = 'Cancelled routes to';
    } else {
      desc = stranded.toLocaleString() + ' people stranded in ' + (hubCities.length ? hubCities.join(', ') : 'the Middle East') + ' trying to get home to ' + city + ', ' + country;
      routeLabel = 'Stranded at';
    }
    
    return '<div style="display:grid;grid-template-columns:1fr 1fr;gap:.3rem .8rem;margin-bottom:.4rem">' +
      '<div><div style="font-size:1.1rem;font-weight:800;color:#a855f7;line-height:1">' + cancelled.toLocaleString() + '</div><div style="font-size:.55rem;color:rgba(255,255,255,.4);text-transform:uppercase;margin-top:.1rem">Flights Cancelled</div></div>' +
      '<div><div style="font-size:1.1rem;font-weight:800;color:#ec3452;line-height:1">' + stranded.toLocaleString() + '</div><div style="font-size:.55rem;color:rgba(255,255,255,.4);text-transform:uppercase;margin-top:.1rem">People Affected</div></div>' +
    '</div>' +
    '<div style="font-size:.68rem;color:rgba(255,255,255,.45);margin-bottom:.5rem;line-height:1.4">' + desc + '</div>' +
    (routes.length ? '<div style="font-size:.58rem;font-weight:700;text-transform:uppercase;color:#fff;margin-bottom:.25rem">' + routeLabel + '</div>' + buildRouteRows(routes) : '') +
    (airlines.length ? '<div style="display:flex;flex-wrap:wrap;gap:3px;margin-top:.4rem">' + buildPills(airlines) + '</div>' : '');
  }
  
  var uid = iata.replace(/[^A-Z0-9]/g, '');
  
  return '<div style="min-width:250px;max-width:300px;font-family:Inter,sans-serif" id="gpop-' + uid + '">' +
    '<div style="font-size:.88rem;font-weight:800;color:#fff;margin-bottom:.1rem">' + city + ' (' + iata + ')</div>' +
    '<div style="font-size:.68rem;color:#fff;margin-bottom:.5rem">' + country + '</div>' +
    
    // Toggle — both buttons always present
    '<div style="' + tWrap + '">' +
      '<div id="gtl-' + uid + '" onclick="event.stopPropagation();switchPopupMode(\'' + iata + '\',\'leave\')" style="' + tBase + tOn + '">Trying to Leave ' + city + '</div>' +
      '<div id="gth-' + uid + '" onclick="event.stopPropagation();switchPopupMode(\'' + iata + '\',\'home\')" style="' + tBase + tOff + '">Trying to Get Home to ' + city + '</div>' +
    '</div>' +
    
    // LEAVE panel (visible by default)
    '<div id="gpl-' + uid + '">' + buildPanel(lCancelled, lStranded, lRoutes, lAirlines, 'leave', lHubCities) + '</div>' +
    
    // HOME panel (hidden by default)
    '<div id="gph-' + uid + '" style="display:none">' + buildPanel(hCancelled, hStranded, hRoutes, hAirlines, 'home', hHubCities) + '</div>' +
    
    embBtn +
  '</div>';
}

function switchPopupMode(iata, mode) {
  _activePopupMode = mode;
  _activePopupIata = iata;
  var uid = iata.replace(/[^A-Z0-9]/g, '');
  
  // Toggle panel visibility
  var leavePanel = document.getElementById('gpl-' + uid);
  var homePanel = document.getElementById('gph-' + uid);
  var leaveBtn = document.getElementById('gtl-' + uid);
  var homeBtn = document.getElementById('gth-' + uid);
  
  if (leavePanel && homePanel) {
    leavePanel.style.display = mode === 'leave' ? 'block' : 'none';
    homePanel.style.display = mode === 'home' ? 'block' : 'none';
  }
  
  // Swap button active styles
  var tOn = 'background:rgba(168,85,247,.15);color:#a855f7;border:1px solid rgba(168,85,247,.2);';
  var tOff = 'background:transparent;color:rgba(255,255,255,.3);border:1px solid transparent;';
  if (leaveBtn && homeBtn) {
    leaveBtn.style.cssText += (mode === 'leave' ? tOn : tOff);
    homeBtn.style.cssText += (mode === 'home' ? tOn : tOff);
  }
  
  // Redraw arcs for this airport only
  clearGlobalArcs();
  drawPopupArcs(iata, mode);
}

function drawPopupArcs(iata, mode) {
  const ap = typeof findAirport === 'function' ? findAirport(iata) : null;
  if (!ap) return;
  
  const maps = [window._crisisMap, window._mobileMap].filter(Boolean);
  
  if (mode === 'leave') {
    // Arcs FROM this airport TO ME hubs
    const gData = _globalDisruptions.find(g => g.iata === iata);
    if (!gData) return;
    const routes = gData.routes || [];
    const hubs = routes.length ? routes.map(r => r.hub) : (gData.me_hubs || []);
    const maxC = Math.max(...(routes.length ? routes.map(r => r.cancelled || 1) : [1]), 1);
    
    for (const map of maps) {
      for (let i = 0; i < hubs.length; i++) {
        const hub = typeof hubs[i] === 'object' ? hubs[i] : hubs[i];
        const hubIata = routes[i] ? routes[i].hub : hub;
        const routeC = routes[i] ? (routes[i].cancelled || 1) : 1;
        let hubCoords = null;
        if (typeof ME_AIRPORTS !== 'undefined' && ME_AIRPORTS[hubIata]) {
          hubCoords = [ME_AIRPORTS[hubIata].lat, ME_AIRPORTS[hubIata].lng];
        } else {
          const ad = AIRPORT_DATA.find(a => (a.iata || a.code) === hubIata);
          if (ad) hubCoords = ad.coords;
        }
        if (!hubCoords) continue;
        
        const weight = 1 + (routeC / maxC) * 3;
        const arc = generateArc([ap.lat, ap.lng], hubCoords, 30);
        const line = L.polyline(arc, { color: 'rgba(168,85,247,.35)', weight, interactive: false }).addTo(map);
        _globalArcLines.push(line);
      }
    }
  } else {
    // Arcs FROM ME hubs TO this airport
    const rev = _computeReverseCached(iata);
    if (!rev.length) return;
    const maxC = Math.max(...rev.map(r => r.cancelled || 1), 1);
    
    for (const map of maps) {
      for (const r of rev) {
        if (!r.lat || !r.lng) continue;
        const weight = 1 + ((r.cancelled || 1) / maxC) * 3;
        const arc = generateArc([r.lat, r.lng], [ap.lat, ap.lng], 30);
        const line = L.polyline(arc, { color: 'rgba(168,85,247,.35)', weight, interactive: false }).addTo(map);
        _globalArcLines.push(line);
      }
    }
  }
}

function renderGlobalDisruptions(map, data) {
  if (!map) return;
  const disruptions = data || _globalDisruptions;
  if (!disruptions || !disruptions.length) return;
  
  const maxStranded = Math.max(..._globalDisruptions.map(g => g.stranded || 0), 1);
  
  for (const g of disruptions) {
    const ap = typeof findAirport === 'function' ? findAirport(g.iata) : null;
    if (!ap) continue;
    
    const ratio = (g.stranded || 0) / maxStranded;
    const radius = 4 + ratio * 14;
    
    const circle = L.circleMarker([ap.lat, ap.lng], {
      radius,
      pane: 'airportPane',
      fillColor: '#a855f7',
      color: 'rgba(168,85,247,.4)',
      weight: 1.5,
      fillOpacity: 0.35,
      className: 'global-disruption-dot',
    }).addTo(map);
    
    const popupContent = buildDualPopup(g.iata);
    circle.bindPopup(popupContent, { className: 'dark-popup', maxWidth: 320, closeOnClick: false });
    
    // Track which circle is active for content updates
    circle.on('popupopen', function() {
      _activePopupCircle = circle;
      _activePopupIata = g.iata;
      _activePopupMode = 'leave';
      clearGlobalArcs();
      drawPopupArcs(g.iata, 'leave');
    });
    circle.on('popupclose', function() {
      _activePopupCircle = null;
      _activePopupIata = '';
      clearGlobalArcs();
      drawGlobalRouteArcs(window._crisisMap, _globalDisruptions);
      drawGlobalRouteArcs(window._mobileMap, _globalDisruptions);
    });
    
    _globalPins.push(circle);
  }
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
  
  // Map COUNTRIES.id to embassy host country code
  const ID_TO_CC = {uae:'AE',bahrain:'BH',kuwait:'KW',qatar:'QA',oman:'OM',saudi:'SA',iran:'IR',iraq:'IQ',israel:'IL'};
  
  if (_resFilter==='all'||_resFilter==='embassy') {
    // Country situation cards (advisory, airspace, borders — NO duplicate embassy lists)
    html += COUNTRIES.map(c => {
      const embCC = ID_TO_CC[c.id];
      const hasFullDir = typeof EMBASSIES_BY_HOST !== 'undefined' && embCC && EMBASSIES_BY_HOST[embCC];
      const embCount = hasFullDir ? Object.keys(EMBASSIES_BY_HOST[embCC].embassies).length : 0;
      // Show a link to full directory instead of sparse embassy rows
      const embSection = hasFullDir
        ? `<div class="embassy-section"><a href="javascript:void(0)" onclick="document.getElementById('emb-${embCC}')?.scrollIntoView({behavior:'smooth',block:'start'})" style="display:block;text-align:center;padding:.45rem;background:rgba(168,85,247,.1);border:1px solid rgba(168,85,247,.18);border-radius:8px;color:#a855f7;font-size:.72rem;font-weight:700;text-decoration:none;text-transform:uppercase;letter-spacing:.03em">\ud83c\udfdb\ufe0f ${embCount} Embassy contacts below \u2193</a></div>`
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
    
    // Full embassy directory (single source of truth)
    if (typeof EMBASSIES_BY_HOST !== 'undefined') {
      html += '<div style="grid-column:1/-1;margin:1.5rem 0 .5rem"><div style="font-size:1.1rem;font-weight:800;color:#a855f7;margin-bottom:.25rem">Full Embassy Directory</div><div style="font-size:.8rem;color:rgba(255,255,255,.4)">Contacts for 25+ nationalities in each Middle East country</div></div>';
      for (const [cc, host] of Object.entries(EMBASSIES_BY_HOST)) {
        const entries = Object.entries(host.embassies);
        html += `<div class="country-card warn" id="emb-${cc}" style="border-color:rgba(168,85,247,.2)">
          <div class="card-header"><div class="card-name">${host.name}</div><span class="status-badge" style="background:rgba(168,85,247,.15);color:#a855f7">${entries.length} EMBASSIES</span></div>
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
              ${info.web ? '<a href="'+info.web+'" target="_blank" style="font-size:.65rem;color:#a855f7;text-decoration:none;white-space:nowrap">[web]</a>' : ''}
            </div>
          </div>`;
        }
        html += '</div></div>';
      }
    }
    
    // Global emergency hotlines
    if (typeof GLOBAL_EMERGENCY !== 'undefined') {
      html += `<div class="country-card safe" id="emb-global" style="border-color:rgba(52,152,236,.2)">
        <div class="card-header"><div class="card-name">Global Emergency Hotlines</div><span class="status-badge safe">24/7</span></div>
        <div style="font-size:.78rem;color:rgba(255,255,255,.45);margin-bottom:.5rem">Call your country's crisis line from anywhere</div>
        <div class="embassy-section">`;
      for (const [natCC, info] of Object.entries(GLOBAL_EMERGENCY)) {
        const nat = (typeof EMB_NATIONS !== 'undefined' && EMB_NATIONS[natCC]) || {flag:'',name:natCC};
        html += `<div class="embassy-row">
          <div style="flex:1"><span class="embassy-name">${nat.flag} ${nat.name}</span>${info.note ? '<div class="embassy-note">'+info.note+'</div>' : ''}</div>
          <div style="display:flex;gap:.3rem;align-items:center">
            <a class="call-btn" href="tel:${info.phone.replace(/[\s\-()]/g,'')}">${info.phone}</a>
            ${info.web ? '<a href="'+info.web+'" target="_blank" style="font-size:.65rem;color:#a855f7;text-decoration:none">[web]</a>' : ''}
          </div>
        </div>`;
      }
      html += '</div></div>';
    }

    html += WORLDWIDE.map(r=>`<div class="country-card safe" id="card-${r.id}"><div class="card-name" style="margin-bottom:.5rem">Worldwide: ${r.name}</div><div class="card-advisory">${r.note}</div>${r.contacts.map(c=>`<div class="info-row"><span class="info-label">${c.label}</span><span>${c.value}</span></div>`).join('')}</div>`).join('');
  }
  if (_resFilter==='all'||_resFilter==='ngo'||_resFilter==='info') {
    html += NGOS.filter(r=>_resFilter==='all'||(_resFilter==='ngo'&&r.type!=='Info'&&r.type!=='Government')||(_resFilter==='info'&&(r.type==='Info'||r.type==='Government')))
      .map(r=>`<div class="resource-card"><div class="resource-type">${r.type}</div><div class="resource-name">${r.name}</div><div class="resource-desc">${r.desc}</div><a class="resource-link" href="${r.url}" target="_blank" rel="noopener">Open \u2192</a></div>`).join('');
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

  // Render global disruption dots on both maps (initial full set)
  _globalPins.forEach(m => { [window._crisisMap, window._mobileMap].forEach(map => { if (map) try { map.removeLayer(m); } catch(e) {} }); });
  _globalPins = [];
  renderGlobalDisruptions(window._crisisMap, _globalDisruptions);
  renderGlobalDisruptions(window._mobileMap, _globalDisruptions);
  
  // Render ME airport pins on both maps
  renderAirportPins(window._crisisMap, 'stranded');
  renderAirportPins(window._mobileMap, 'stranded');
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

  mmap.createPane('worldwidePane');
  mmap.getPane('worldwidePane').style.zIndex = 580;
  mmap.createPane('countryPane');
  mmap.getPane('countryPane').style.zIndex = 590;
  mmap.createPane('airportPane');
  mmap.getPane('airportPane').style.zIndex = 610;

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
  renderStrandedOnMap(mmap, true);
  mRenderResources();
}

function mFilterMap(type){
  filterMap(type);
}

function openMFilterLegend(){ mTab('filters', null); }
function closeMFilterLegend(){ mSheetToggle(); }

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
  else if(tab==='profile')   { mShowSheetContent('profile','MY PROFILE'); renderMobileProfileView(); }
}

function mShowSheetContent(which,title){
  document.getElementById('m-resources-content').style.display=which==='resources'?'block':'none';
  document.getElementById('m-filters-content').style.display=which==='filters'?'block':'none';
  document.getElementById('m-help-money-content').style.display=which==='help-money'?'block':'none';
  document.getElementById('m-stranded-content').style.display=which==='stranded'?'block':'none';
  document.getElementById('m-offer-content').style.display=which==='offer'?'block':'none';
  document.getElementById('m-edit-content').style.display=which==='profile'?'block':'none';
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
  if (!isLoggedIn()) { alert('Please sign in first to post.'); mTab('profile',document.getElementById('mtab-help')); return; }
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
      else mTab('profile', document.getElementById('mtab-help'));
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
        else mTab('profile', document.getElementById('mtab-help'));
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
      if (!isMob()) showView('profile');
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
  if (!isMob()) showView('profile');
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
    renderProfileStranded();
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
  showView('help');
  switchHelpMode('helper');
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
    renderProfileStranded();
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
    const { error } = await _sb.from('help_posts').delete().eq('id', id).eq('user_id', _currentUser.id);
    if (error) throw error;
    mRenderProfilePosts();
    loadPosts();
  } catch (e) { alert('Failed to delete: ' + e.message); }
}

// ── Stranded Profile Posts ────────────────────────────────
async function renderProfileStranded() {
  const el = document.getElementById('profile-stranded-list');
  const mel = document.getElementById('m-stranded-posts-list');
  if (!_currentUser) return;
  [el, mel].forEach(list => {
    if (list) list.innerHTML = '<div style="font-size:.82rem;color:rgba(255,255,255,.4);padding:.3rem 0">Loading...</div>';
  });
  const { data, error } = await _sb.from('stranded_people').select('id,name,current_location,destination,dest_airport,nationality,group_size,needs,stranded_since,details,status,created_at')
    .eq('user_id', _currentUser.id).eq('status', 'active').order('created_at', { ascending: false });
  if (error || !data || !data.length) {
    [el, mel].forEach(list => {
      if (list) list.innerHTML = '<div style="font-size:.82rem;color:rgba(255,255,255,.4);padding:.3rem 0">No stranded registration.</div>';
    });
    return;
  }
  const html = data.map(p => {
    const t = p.created_at ? new Date(p.created_at).toLocaleString() : '';
    const needsList = (p.needs || []).join(', ');
    return `<div class="profile-post-card" style="border-color:rgba(236,52,82,.15)">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:.3rem">
        <span style="font-size:.82rem;font-weight:700;color:#ec3452">${p.name || 'Anonymous'}</span>
        <span style="font-size:.63rem;color:rgba(255,255,255,.35)">${t}</span>
      </div>
      <div style="font-size:.78rem;color:rgba(255,255,255,.6);margin-bottom:.15rem">📍 ${p.current_location}</div>
      <div style="font-size:.78rem;color:rgba(255,255,255,.6);margin-bottom:.15rem">🏠 ${p.destination}${p.dest_airport ? ' ('+p.dest_airport+')' : ''}</div>
      ${p.group_size > 1 ? '<div style="font-size:.75rem;color:rgba(255,255,255,.5)">Group: '+p.group_size+' people</div>' : ''}
      ${needsList ? '<div style="font-size:.72rem;color:#e67e22;margin-top:.2rem">Needs: '+needsList+'</div>' : ''}
      ${p.details ? '<div style="font-size:.78rem;color:rgba(255,255,255,.45);line-height:1.4;margin-top:.2rem">'+p.details.slice(0,120)+'</div>' : ''}
      <div class="profile-post-actions">
        <button onclick="editStrandedPost('${p.id}')" style="background:rgba(52,152,236,.15);color:#3498ec;border:1px solid rgba(52,152,236,.25);border-radius:6px;padding:.28rem .7rem;font-size:.7rem;font-weight:600;cursor:pointer;font-family:Inter,sans-serif">Edit</button>
        <button onclick="deleteStrandedPost('${p.id}')" style="background:#ec3452;color:#fff;border:none;border-radius:6px;padding:.28rem .7rem;font-size:.7rem;font-weight:600;cursor:pointer;font-family:Inter,sans-serif">Remove from Map</button>
      </div>
    </div>`;
  }).join('');
  if (el) el.innerHTML = html;
  if (mel) mel.innerHTML = html;
}

let _editingStrandedId = null;

async function editStrandedPost(id) {
  const { data } = await _sb.from('stranded_people').select('*').eq('id', id).eq('user_id', _currentUser.id).single();
  if (!data) { alert('Registration not found.'); return; }
  _editingStrandedId = id;
  const isMobile = window.innerWidth <= 600;
  const prefix = isMobile ? 'm-stranded' : 'stranded';

  // Populate fields
  const setVal = (id, v) => { const el = document.getElementById(id); if (el) el.value = v || ''; };
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

  // Group size
  setVal(prefix + '-group', data.group_size || 1);

  // Nationality
  const natEl = document.getElementById(prefix + '-nationality');
  if (natEl && data.nationality) {
    for (let i = 0; i < natEl.options.length; i++) {
      if (natEl.options[i].value === data.nationality || natEl.options[i].text === data.nationality) { natEl.selectedIndex = i; break; }
    }
  }

  // Needs checkboxes
  const needsContainer = document.getElementById(prefix + '-needs');
  if (needsContainer && data.needs) {
    needsContainer.querySelectorAll('input').forEach(cb => cb.checked = (data.needs || []).includes(cb.value));
  }

  // Navigate
  if (isMobile) {
    mTab('stranded', null);
  } else {
    showView('help');
    switchHelpMode('stranded');
  }

  // Change submit button
  const btn = document.getElementById(prefix + '-submit-btn');
  if (btn) {
    btn.textContent = 'Update Registration';
    btn._origOnclick = btn.onclick;
    btn.onclick = () => submitStrandedEdit(prefix);
  }
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
    else showView('profile');
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

function toggleHelpPanel() {
  const modal = document.getElementById('help-money-modal');
  if (modal) modal.classList.toggle('open');
}

function openStrandedForm() {
  if (isMob()) { mTab('stranded', null); }
  else { showView('help'); switchHelpMode('stranded'); }
}

function closeStrandedForm() {
  showView('map');
}

async function mSubmitStranded() {
  if (!isLoggedIn()) { alert('Please sign in first.'); mTab('profile', null); return; }
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
    const { data } = await _sb.from('stranded_people').select('id,user_id,name,current_location,current_lat,current_lng,destination,dest_lat,dest_lng,dest_country,dest_airport,nationality,group_size,needs,stranded_since,details,contact,xhandle,status,created_at')
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
        ${p.name ? '<div style="font-size:.88rem;font-weight:800;color:#fff;margin-bottom:.1rem">'+p.name+'</div>' : ''}
        <div style="font-size:.78rem;font-weight:600;color:rgba(255,255,255,.7);margin-bottom:.15rem">${p.group_size > 1 ? p.group_size + ' people' : '1 person'}${p.nationality ? ' · ' + p.nationality : ''}</div>
        <div style="font-size:.75rem;color:rgba(255,255,255,.6);margin-bottom:.15rem">From: ${p.current_location}</div>
        <div style="font-size:.75rem;color:rgba(255,255,255,.6);margin-bottom:.3rem">Need to reach: <strong style="color:#fff">${p.destination}</strong>${p.dest_airport ? ' <span style="background:rgba(255,255,255,.1);padding:.1rem .4rem;border-radius:4px;font-size:.65rem;font-weight:600">✈ '+p.dest_airport+'</span>' : ''}</div>
        ${needsList ? `<div style="font-size:.68rem;color:#e67e22;margin-bottom:.2rem">Needs: ${needsList}</div>` : ''}
        ${sinceTxt ? `<div style="font-size:.65rem;color:rgba(255,255,255,.35)">${sinceTxt}</div>` : ''}
        ${p.details ? `<div style="font-size:.75rem;color:rgba(255,255,255,.5);line-height:1.4;margin-top:.3rem">${p.details.slice(0, 150)}</div>` : ''}
        ${buildContactButtons(p.contact, p.xhandle, p.name)}
        ${buildSendHelpButton(p.xhandle, !!p.user_id)}
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


window.addEventListener('DOMContentLoaded',()=>{
  if(isMob()){ initMobile(); }
  else { showView('map'); }
  // Init autocomplete on both desktop and mobile location fields
  initLocationAutocomplete('offer-location','offer-lat','offer-lng','offer-location-ac');
  initLocationAutocomplete('m-offer-location','m-offer-lat','m-offer-lng','m-offer-location-ac');
  initAuth();
  checkTelegramRedirect();
  checkXRedirect();
  initStrandedRealtime();
  loadStranded();
  initLocationAutocomplete('stranded-location','stranded-lat','stranded-lng','stranded-location-ac');
  initLocationAutocomplete('m-stranded-location','m-stranded-lat','m-stranded-lng','m-stranded-location-ac');
  refreshSitrep();
  setInterval(refreshSitrep,5*60*1000);
  if(SB_ON){loadPosts();subscribeStream();}
  else{
    const el=document.getElementById('offer-posts');
    if(el)el.innerHTML='<div class="empty-state" style="color:var(--warn)">Supabase not configured.</div>';
  }
});
window.addEventListener('resize',()=>{if(isMob()&&!window._mobileInit)initMobile();});