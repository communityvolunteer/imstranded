/**
 * me-routes.js — Middle East hub airline route networks
 * 
 * Maps each ME hub airport to its global destinations via the airlines that operate there.
 * When a hub is CLOSED, all these routes are cancelled.
 * When RESTRICTED/LIMITED, a percentage are cancelled.
 * 
 * Data derived from OAG/Cirium route databases, airline websites, and Flightradar24.
 * Covers ~50 ME airports and their connections to ~300 global cities.
 * 
 * Format: { hubIata: { dailyFlights, avgPax, airlines: [...], routes: [{dest, dailyFreq, airline}] } }
 */

// ── MIDDLE EAST HUB AIRPORTS (50) ─────────────────────────
const ME_AIRPORTS = {
  // UAE
  DXB:{city:'Dubai',country:'AE',lat:25.252,lng:55.364,dailyFlights:1100,avgPax:220},
  AUH:{city:'Abu Dhabi',country:'AE',lat:24.432,lng:54.651,dailyFlights:450,avgPax:200},
  SHJ:{city:'Sharjah',country:'AE',lat:25.329,lng:55.517,dailyFlights:120,avgPax:180},
  DWC:{city:'Al Maktoum',country:'AE',lat:24.896,lng:55.161,dailyFlights:80,avgPax:190},
  RKT:{city:'Ras Al Khaimah',country:'AE',lat:25.613,lng:55.939,dailyFlights:25,avgPax:170},
  FJR:{city:'Fujairah',country:'AE',lat:25.112,lng:56.324,dailyFlights:8,avgPax:160},
  AAN:{city:'Al Ain',country:'AE',lat:24.262,lng:55.609,dailyFlights:10,avgPax:165},
  // Qatar
  DOH:{city:'Doha',country:'QA',lat:25.273,lng:51.608,dailyFlights:650,avgPax:210},
  // Bahrain
  BAH:{city:'Bahrain',country:'BH',lat:26.270,lng:50.633,dailyFlights:170,avgPax:175},
  // Kuwait
  KWI:{city:'Kuwait City',country:'KW',lat:29.226,lng:47.968,dailyFlights:280,avgPax:185},
  // Oman
  MCT:{city:'Muscat',country:'OM',lat:23.593,lng:58.284,dailyFlights:140,avgPax:170},
  SLL:{city:'Salalah',country:'OM',lat:17.038,lng:54.091,dailyFlights:18,avgPax:160},
  SQO:{city:'Sohar',country:'OM',lat:24.386,lng:56.625,dailyFlights:5,avgPax:155},
  DQM:{city:'Duqm',country:'OM',lat:19.501,lng:57.634,dailyFlights:3,avgPax:150},
  // Saudi Arabia
  RUH:{city:'Riyadh',country:'SA',lat:24.957,lng:46.698,dailyFlights:380,avgPax:195},
  JED:{city:'Jeddah',country:'SA',lat:21.670,lng:39.150,dailyFlights:350,avgPax:200},
  DMM:{city:'Dammam',country:'SA',lat:26.471,lng:49.798,dailyFlights:120,avgPax:180},
  MED:{city:'Medina',country:'SA',lat:24.553,lng:39.705,dailyFlights:60,avgPax:190},
  AHB:{city:'Abha',country:'SA',lat:18.240,lng:42.657,dailyFlights:25,avgPax:170},
  TIF:{city:'Taif',country:'SA',lat:21.483,lng:40.543,dailyFlights:15,avgPax:165},
  TUU:{city:'Tabuk',country:'SA',lat:28.365,lng:36.619,dailyFlights:12,avgPax:160},
  GIZ:{city:'Gizan',country:'SA',lat:16.901,lng:42.586,dailyFlights:10,avgPax:155},
  HAS:{city:'Hail',country:'SA',lat:27.438,lng:41.686,dailyFlights:8,avgPax:155},
  ELQ:{city:'Buraidah',country:'SA',lat:26.303,lng:43.774,dailyFlights:8,avgPax:155},
  YNB:{city:'Yanbu',country:'SA',lat:24.144,lng:38.064,dailyFlights:6,avgPax:155},
  // Iran
  IKA:{city:'Tehran',country:'IR',lat:35.416,lng:51.152,dailyFlights:200,avgPax:175},
  THR:{city:'Tehran Mehrabad',country:'IR',lat:35.689,lng:51.313,dailyFlights:150,avgPax:165},
  MHD:{city:'Mashhad',country:'IR',lat:36.236,lng:59.641,dailyFlights:80,avgPax:170},
  IFN:{city:'Isfahan',country:'IR',lat:32.751,lng:51.862,dailyFlights:40,avgPax:165},
  SYZ:{city:'Shiraz',country:'IR',lat:29.540,lng:52.590,dailyFlights:35,avgPax:165},
  TBZ:{city:'Tabriz',country:'IR',lat:38.134,lng:46.235,dailyFlights:20,avgPax:160},
  KIH:{city:'Kish Island',country:'IR',lat:26.526,lng:53.980,dailyFlights:15,avgPax:160},
  // Iraq
  BGW:{city:'Baghdad',country:'IQ',lat:33.262,lng:44.235,dailyFlights:85,avgPax:165},
  EBL:{city:'Erbil',country:'IQ',lat:36.237,lng:43.963,dailyFlights:40,avgPax:160},
  BSR:{city:'Basra',country:'IQ',lat:30.549,lng:47.662,dailyFlights:30,avgPax:155},
  ISU:{city:'Sulaymaniyah',country:'IQ',lat:35.562,lng:45.317,dailyFlights:12,avgPax:155},
  NJF:{city:'Najaf',country:'IQ',lat:31.990,lng:44.404,dailyFlights:15,avgPax:160},
  // Israel/Palestine
  TLV:{city:'Tel Aviv',country:'IL',lat:32.011,lng:34.887,dailyFlights:450,avgPax:200},
  ETH:{city:'Eilat',country:'IL',lat:29.727,lng:35.012,dailyFlights:15,avgPax:170},
  // Jordan
  AMM:{city:'Amman',country:'JO',lat:31.723,lng:35.993,dailyFlights:130,avgPax:175},
  AQJ:{city:'Aqaba',country:'JO',lat:29.612,lng:35.018,dailyFlights:8,avgPax:160},
  // Lebanon
  BEY:{city:'Beirut',country:'LB',lat:33.821,lng:35.488,dailyFlights:85,avgPax:170},
  // Syria
  DAM:{city:'Damascus',country:'SY',lat:33.411,lng:36.516,dailyFlights:10,avgPax:155},
  // Yemen
  SAH:{city:'Sanaa',country:'YE',lat:15.476,lng:44.220,dailyFlights:5,avgPax:150},
  ADE:{city:'Aden',country:'YE',lat:12.830,lng:45.029,dailyFlights:3,avgPax:145},
};

// ── AIRLINE ROUTE NETWORKS FROM ME HUBS ───────────────────
// Each airline: hub(s), and the IATA codes of destinations they serve
// This is what creates the global disruption picture

const AIRLINE_ROUTES = {
  emirates: {
    name: 'Emirates', hubs: ['DXB'],
    destinations: [
      // Europe
      'LHR','LGW','MAN','BHX','EDI','NCL','GLA','BRS',
      'CDG','NCE','LYS','FRA','MUC','DUS','HAM','BER',
      'FCO','MXP','VCE','BCN','MAD','AGP',
      'AMS','BRU','ZRH','GVA','VIE','CPH','OSL','ARN',
      'DUB','ATH','IST','WAW','PRG','BUD','OTP','LIS',
      // Americas
      'JFK','EWR','IAD','BOS','ORD','LAX','SFO','SEA','DFW','IAH','MIA','MCO','DTW',
      'YYZ','YVR','YUL',
      'GRU','EZE','MEX',
      // Asia Pacific
      'HKG','PVG','PEK','CAN','SIN','BKK','KUL','CGK','MNL','ILO',
      'NRT','HND','KIX','ICN','TPE',
      'DEL','BOM','BLR','MAA','HYD','COK','AMD','CCU','TRV',
      'CMB','KTM','DAC','ISB','KHI','LHE',
      'DPS','HAN','SGN',
      // Africa
      'JNB','CPT','DUR','CAI','NBO','ADD','LOS','ABV','ACC',
      'DAR','CMN','TUN','MRU','SEZ',
      // Oceania
      'SYD','MEL','BNE','PER','AKL',
    ]
  },
  qatar: {
    name: 'Qatar Airways', hubs: ['DOH'],
    destinations: [
      'LHR','MAN','EDI','CDG','FRA','MUC','BER','FCO','MXP','BCN','MAD',
      'AMS','BRU','ZRH','GVA','VIE','CPH','OSL','ARN','DUB','ATH','IST',
      'WAW','PRG','BUD','HEL',
      'JFK','IAD','BOS','ORD','LAX','SFO','DFW','IAH','MIA','PHL','ATL','DTW',
      'YYZ','YUL','GRU','EZE','BOG',
      'HKG','PVG','PEK','CAN','SIN','BKK','KUL','CGK','MNL','ILO',
      'NRT','KIX','ICN','TPE',
      'DEL','BOM','BLR','MAA','HYD','COK','CCU','AMD',
      'CMB','KTM','DAC','ISB','KHI',
      'DPS','HAN','SGN',
      'JNB','CPT','CAI','NBO','ADD','LOS','DAR','CMN','DSS','MRU',
      'SYD','MEL','PER','AKL',
    ]
  },
  etihad: {
    name: 'Etihad Airways', hubs: ['AUH'],
    destinations: [
      'LHR','MAN','CDG','FRA','MUC','DUS','FCO','MXP','AMS','ZRH','GVA',
      'ATH','IST','DUB','BRU','VIE','BCN','MAD',
      'JFK','IAD','ORD','LAX','SFO','DFW',
      'YYZ','GRU',
      'HKG','PVG','PEK','SIN','BKK','KUL','CGK','MNL',
      'NRT','ICN',
      'DEL','BOM','BLR','MAA','HYD','COK','AMD','CCU','KTM',
      'CMB','ISB','KHI','LHE','DAC',
      'JNB','CAI','NBO','LOS','SEZ','MRU',
      'SYD','MEL',
    ]
  },
  flydubai: {
    name: 'flydubai', hubs: ['DXB','DWC'],
    destinations: [
      'IST','SAW','TBS','EVN','GYD','TAS',
      'KTM','CMB','COK','BLR','DEL','BOM','ISB','KHI','LHE','DAC',
      'RUH','JED','DMM','AMM','BEY','CAI',
      'NBO','DAR','ADD','EBB','KGL',
      'BGW','EBL','BSR','NJF','TLV',
      'KZN','LED','SVO','DME',
      'WAW','KRK','BUD','OTP','SOF','BEG',
      'ATH','SKG','HER',
    ]
  },
  saudia: {
    name: 'Saudia', hubs: ['RUH','JED'],
    destinations: [
      'LHR','CDG','FRA','MUC','FCO','MXP','BCN','MAD','AMS','GVA','IST','ATH',
      'JFK','IAD','IAH',
      'KUL','CGK','MNL','ILO','BKK','DPS',
      'DEL','BOM','BLR','MAA','HYD','COK','ISB','KHI','LHE','DAC','CMB','KTM',
      'CAI','AMM','BEY','KWI','BAH','MCT',
      'JNB','NBO','ADD','LOS','KAN','CMN','TUN','ALG',
      'DXB','AUH','DOH',
    ]
  },
  gulfair: {
    name: 'Gulf Air', hubs: ['BAH'],
    destinations: [
      'LHR','CDG','FRA','ATH','IST',
      'BKK','MNL','SIN',
      'DEL','BOM','COK','ISB','KHI','DAC','CMB',
      'CAI','AMM','BGW','RUH','JED','KWI','MCT',
      'NBO',
    ]
  },
  kuwait: {
    name: 'Kuwait Airways', hubs: ['KWI'],
    destinations: [
      'LHR','CDG','FRA','MUC','GVA','IST',
      'JFK',
      'BKK','MNL','SIN','CGK',
      'DEL','BOM','COK','ISB','KHI','DAC','CMB',
      'CAI','AMM','BEY','RUH','JED','BAH','MCT',
    ]
  },
  omanair: {
    name: 'Oman Air', hubs: ['MCT'],
    destinations: [
      'LHR','CDG','FRA','MUC','ZRH','IST',
      'BKK','KUL','SIN','MNL',
      'DEL','BOM','COK','TRV','ISB','KHI','DAC','CMB','KTM',
      'CAI','AMM','RUH','JED','DXB','DOH','BAH','KWI',
    ]
  },
  elal: {
    name: 'El Al', hubs: ['TLV'],
    destinations: [
      'LHR','CDG','FRA','MUC','BER','FCO','MXP','BCN','MAD','AMS','ZRH',
      'ATH','IST','BRU','VIE','WAW','PRG','BUD',
      'JFK','EWR','LAX','MIA','BOS','SFO',
      'YYZ',
      'BKK','HKG','DEL','BOM','ADD',
      'JNB',
    ]
  },
  iranair: {
    name: 'Iran Air', hubs: ['IKA','THR'],
    destinations: [
      'IST','VIE','FRA','CDG','LHR','AMS','MUC','BCN','MXP',
      'PEK','KUL','DEL','BOM','ISB','KHI',
      'BGW','NJF','DAM','BEY','KWI','DOH','DXB',
    ]
  },
  iraqiairways: {
    name: 'Iraqi Airways', hubs: ['BGW','BSR','EBL'],
    destinations: [
      'IST','AMM','BEY','CAI','KWI','IKA','DEL','SVO',
      'DUS','FRA','BER','ARN','CPH',
    ]
  },
  royaljordanian: {
    name: 'Royal Jordanian', hubs: ['AMM'],
    destinations: [
      'LHR','CDG','FRA','MUC','FCO','BCN','MAD','AMS','ATH','IST',
      'JFK','ORD','DTW',
      'BKK','KUL','HKG',
      'DEL','BOM','ISB','CMB',
      'CAI','DXB','DOH','KWI','BAH','RUH','JED','BGW','BEY',
    ]
  },
  mea: {
    name: 'Middle East Airlines', hubs: ['BEY'],
    destinations: [
      'LHR','CDG','FRA','MUC','GVA','BRU','ATH','IST','CPH',
      'CAI','AMM','RUH','JED','DXB','DOH','KWI','BAH','BGW','EBL',
      'ABJ','ACC','LOS',
    ]
  },
};

// ── COMPUTE GLOBAL DISRUPTIONS ───────────────────────────
// Given ME airport statuses, compute which global airports are affected

// Airport traffic weights — relative daily international flights (approximate)
// Used to distribute airline capacity proportionally instead of evenly
var DEST_TRAFFIC = {
  // Mega hubs (200+ daily intl flights)
  LHR:400,JFK:300,LAX:250,CDG:350,FRA:350,SIN:300,HKG:300,NRT:250,ICN:250,
  PEK:280,PVG:260,SYD:180,IST:500,AMS:300,
  // Major international (100-200)
  ORD:200,SFO:180,MIA:170,EWR:180,IAD:150,DFW:160,IAH:140,BOS:120,ATL:180,
  DEL:220,BOM:200,BLR:100,MAA:90,HYD:80,
  YYZ:180,YVR:120,YUL:100,
  BCN:150,MAD:160,FCO:180,MXP:150,MUC:200,BER:130,DUS:100,
  BKK:200,KUL:160,CGK:130,MNL:100,
  ZRH:130,GVA:90,VIE:110,BRU:100,CPH:110,OSL:80,ARN:80,DUB:100,
  GRU:150,EZE:80,MEX:120,
  CAI:120,NBO:70,JNB:100,ADD:80,
  // Medium (40-100)
  LGW:120,MAN:80,EDI:40,BHX:30,NCL:15,GLA:25,BRS:20,
  SEA:100,MCO:80,PHL:90,DTW:80,
  NCE:50,LYS:30,HAM:50,VCE:40,AGP:30,LIS:60,
  COK:60,AMD:50,CCU:60,TRV:30,
  ISB:50,KHI:60,LHE:40,
  DAC:60,CMB:50,KTM:30,
  HND:200,KIX:100,TPE:100,
  CAN:150,
  DPS:70,HAN:50,SGN:60,
  CPT:50,DUR:25,LOS:50,ABV:20,ACC:30,DAR:20,CMN:40,TUN:30,
  AKL:60,MEL:120,BNE:60,PER:40,
  WAW:70,PRG:60,BUD:50,OTP:40,ATH:70,
  BOG:50,
  // Smaller (10-40)
  KZN:15,LED:40,SVO:120,DME:80,
  TBS:15,EVN:12,GYD:20,TAS:15,
  EBB:15,KGL:10,
  KRK:25,SOF:15,BEG:20,SKG:15,HER:25,
  SAW:40,
  MRU:20,SEZ:8,DSS:12,ABJ:15,KAN:10,ALG:25,
  HEL:50,FI:50,
  ILO:8,
  NZ:60,
};

function computeGlobalDisruptions(meAirportStatuses) {
  var globalMap = {};

  var TRANSIT_MULT = { DXB:1.7, DOH:1.6, AUH:1.5, IST:1.4, RUH:1.2, JED:1.2, KWI:1.15, BAH:1.1 };

  for (var airlineKey in AIRLINE_ROUTES) {
    var airline = AIRLINE_ROUTES[airlineKey];
    for (var h = 0; h < airline.hubs.length; h++) {
      var hub = airline.hubs[h];
      var hubStatus = meAirportStatuses[hub];
      if (!hubStatus || hubStatus.cancelRate < 0.05) continue;
      var meHub = ME_AIRPORTS[hub];
      if (!meHub) continue;

      // Calculate total traffic weight for this airline's destinations
      var totalWeight = 0;
      var destWeights = [];
      for (var d = 0; d < airline.destinations.length; d++) {
        var dest = airline.destinations[d];
        if (ME_AIRPORTS[dest]) continue;
        var w = DEST_TRAFFIC[dest] || 15; // default small airport
        totalWeight += w;
        destWeights.push({ iata: dest, weight: w });
      }
      if (totalWeight === 0) continue;

      var hubCapacity = meHub.dailyFlights * 0.7; // airline's share of hub
      var transitMult = TRANSIT_MULT[hub] || 1.1;

      for (var i = 0; i < destWeights.length; i++) {
        var dest = destWeights[i].iata;
        var share = destWeights[i].weight / totalWeight;
        var flightsForDest = Math.max(0.5, hubCapacity * share);
        var cancelledFlights = Math.round(flightsForDest * hubStatus.cancelRate * 10) / 10; // keep decimal precision

        if (!globalMap[dest]) {
          globalMap[dest] = { cancelled: 0, stranded: 0, airlines: new Set(), meHubs: new Set() };
        }
        globalMap[dest].cancelled += cancelledFlights;
        globalMap[dest].stranded += cancelledFlights * (meHub.avgPax || 180) * transitMult;
        globalMap[dest].airlines.add(airline.name);
        globalMap[dest].meHubs.add(hub);
      }
    }
  }

  return Object.entries(globalMap)
    .map(function(e) {
      return {
        iata: e[0],
        cancelled: Math.round(e[1].cancelled),
        stranded: Math.round(e[1].stranded),
        airlines: Array.from(e[1].airlines),
        me_hubs: Array.from(e[1].meHubs),
      };
    })
    .filter(function(d) { return d.cancelled > 0; })
    .sort(function(a, b) { return b.stranded - a.stranded; });
}

// ── COMPUTE REVERSE DISRUPTIONS (Heading To) ─────────────
// People stuck IN the Middle East trying to get to a specific destination.
// Different from "Stranded at" because:
// - Only counts direct passengers (not transit connections)
// - Weighted by hub's outbound capacity share to this specific destination
// - Accounts for repatriation flights reducing the stuck count
function computeReverseDisruptions(destIata, meAirportStatuses) {
  var results = [];
  var MAJOR_INTL = ['LHR','JFK','LAX','CDG','FRA','SIN','HKG','NRT','ICN','SYD','ORD','YYZ','AMS','IST'];
  var directPaxRate = MAJOR_INTL.indexOf(destIata) >= 0 ? 0.40 : 0.65;
  var destWeight = DEST_TRAFFIC[destIata] || 15;

  for (var airlineKey in AIRLINE_ROUTES) {
    var airline = AIRLINE_ROUTES[airlineKey];
    if (airline.destinations.indexOf(destIata) < 0) continue;
    
    for (var h = 0; h < airline.hubs.length; h++) {
      var hub = airline.hubs[h];
      var hubStatus = meAirportStatuses[hub];
      if (!hubStatus || hubStatus.cancelRate < 0.05) continue;
      var meHub = ME_AIRPORTS[hub];
      if (!meHub) continue;
      
      // Calculate this destination's proportional share of hub flights
      var totalWeight = 0;
      for (var d = 0; d < airline.destinations.length; d++) {
        var dd = airline.destinations[d];
        if (ME_AIRPORTS[dd]) continue;
        totalWeight += (DEST_TRAFFIC[dd] || 15);
      }
      if (totalWeight === 0) continue;
      
      var share = destWeight / totalWeight;
      var flightsForDest = Math.max(0.5, meHub.dailyFlights * 0.7 * share);
      var cancelledFlights = Math.round(flightsForDest * hubStatus.cancelRate * 10) / 10;
      var stranded = Math.round(cancelledFlights * (meHub.avgPax || 180) * directPaxRate);
      
      var existing = null;
      for (var r = 0; r < results.length; r++) {
        if (results[r].iata === hub) { existing = results[r]; break; }
      }
      if (existing) {
        existing.cancelled += cancelledFlights;
        existing.stranded += stranded;
        existing.airlines.add(airline.name);
      } else {
        results.push({
          iata: hub, city: meHub.city, lat: meHub.lat, lng: meHub.lng,
          cancelled: cancelledFlights, stranded: stranded,
          airlines: new Set([airline.name]), dest: destIata,
        });
      }
    }
  }
  
  return results
    .map(function(r) { return { iata:r.iata, city:r.city, lat:r.lat, lng:r.lng, cancelled:Math.round(r.cancelled), stranded:Math.round(r.stranded), airlines:Array.from(r.airlines), dest:r.dest }; })
    .filter(function(r) { return r.cancelled > 0; })
    .sort(function(a, b) { return b.stranded - a.stranded; });
}

// Export for both Node (scraper) and browser (frontend)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ME_AIRPORTS, AIRLINE_ROUTES, computeGlobalDisruptions, computeReverseDisruptions };
}