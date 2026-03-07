/**
 * embassies.js — Embassy/consulate contacts for stranded travelers
 * 
 * Organized by HOST COUNTRY (where people are stuck).
 * Each entry lists embassies of major nationalities IN that country.
 * 
 * Used by: popup rendering on global disruption dots, ME airport pins,
 * and the resources page.
 */

// Country metadata (flag + demonym for display)
var EMB_NATIONS = {
  US:{flag:'\u{1f1fa}\u{1f1f8}',name:'United States'},UK:{flag:'\u{1f1ec}\u{1f1e7}',name:'United Kingdom'},
  IN:{flag:'\u{1f1ee}\u{1f1f3}',name:'India'},PH:{flag:'\u{1f1f5}\u{1f1ed}',name:'Philippines'},
  PK:{flag:'\u{1f1f5}\u{1f1f0}',name:'Pakistan'},BD:{flag:'\u{1f1e7}\u{1f1e9}',name:'Bangladesh'},
  NP:{flag:'\u{1f1f3}\u{1f1f5}',name:'Nepal'},LK:{flag:'\u{1f1f1}\u{1f1f0}',name:'Sri Lanka'},
  AU:{flag:'\u{1f1e6}\u{1f1fa}',name:'Australia'},CA:{flag:'\u{1f1e8}\u{1f1e6}',name:'Canada'},
  DE:{flag:'\u{1f1e9}\u{1f1ea}',name:'Germany'},FR:{flag:'\u{1f1eb}\u{1f1f7}',name:'France'},
  IT:{flag:'\u{1f1ee}\u{1f1f9}',name:'Italy'},ES:{flag:'\u{1f1ea}\u{1f1f8}',name:'Spain'},
  NL:{flag:'\u{1f1f3}\u{1f1f1}',name:'Netherlands'},IE:{flag:'\u{1f1ee}\u{1f1ea}',name:'Ireland'},
  ZA:{flag:'\u{1f1ff}\u{1f1e6}',name:'South Africa'},KR:{flag:'\u{1f1f0}\u{1f1f7}',name:'South Korea'},
  JP:{flag:'\u{1f1ef}\u{1f1f5}',name:'Japan'},CN:{flag:'\u{1f1e8}\u{1f1f3}',name:'China'},
  ID:{flag:'\u{1f1ee}\u{1f1e9}',name:'Indonesia'},MY:{flag:'\u{1f1f2}\u{1f1fe}',name:'Malaysia'},
  TH:{flag:'\u{1f1f9}\u{1f1ed}',name:'Thailand'},EG:{flag:'\u{1f1ea}\u{1f1ec}',name:'Egypt'},
  JO:{flag:'\u{1f1ef}\u{1f1f4}',name:'Jordan'},KE:{flag:'\u{1f1f0}\u{1f1ea}',name:'Kenya'},
  NG:{flag:'\u{1f1f3}\u{1f1ec}',name:'Nigeria'},ET:{flag:'\u{1f1ea}\u{1f1f9}',name:'Ethiopia'},
  RU:{flag:'\u{1f1f7}\u{1f1fa}',name:'Russia'},BR:{flag:'\u{1f1e7}\u{1f1f7}',name:'Brazil'},
  NZ:{flag:'\u{1f1f3}\u{1f1ff}',name:'New Zealand'},
};

// Embassies IN each ME host country, keyed by host country code
// Each nationality entry: { phone, email?, web?, note? }
var EMBASSIES_BY_HOST = {
  AE: { // UAE
    name:'United Arab Emirates',
    emergency:'999',
    crisis_url:'https://www.mohap.gov.ae',
    embassies:{
      US:{phone:'+971-2-414-2200',email:'ACSAbuDhabi@state.gov',web:'https://ae.usembassy.gov'},
      UK:{phone:'+971-2-610-1100',web:'https://www.gov.uk/world/organisations/british-embassy-abu-dhabi'},
      IN:{phone:'+971-800-46342',note:'Toll-free',web:'https://www.indembassyuae.gov.in'},
      PH:{phone:'+971-2-634-0235',note:'POLO-OWWA: +971-50-813-7836',web:'https://abudhabi.philembassy.net'},
      PK:{phone:'+971-2-444-7800',web:'https://www.pakembassyuae.org'},
      BD:{phone:'+971-2-665-5336',web:'https://bdembassyuae.org'},
      NP:{phone:'+971-2-444-7804'},
      LK:{phone:'+971-2-443-4377'},
      AU:{phone:'+971-2-401-7500',web:'https://uae.embassy.gov.au'},
      CA:{phone:'+971-2-694-0300',web:'https://www.canadainternational.gc.ca/uae'},
      DE:{phone:'+971-2-644-6693',web:'https://abu-dhabi.diplo.de'},
      FR:{phone:'+971-2-443-5100',web:'https://ae.ambafrance.org'},
      IT:{phone:'+971-2-695-7622'},
      KR:{phone:'+971-2-443-1551'},
      JP:{phone:'+971-2-443-5696'},
      CN:{phone:'+971-2-443-4276'},
      ID:{phone:'+971-2-444-8335'},
      EG:{phone:'+971-2-444-4555'},
      JO:{phone:'+971-2-444-7100'},
      KE:{phone:'+971-2-666-7775'},
      NG:{phone:'+971-2-447-4433'},
      ET:{phone:'+971-2-672-0260'},
      ZA:{phone:'+971-2-447-0999'},
      NZ:{phone:'+971-4-331-7500',note:'Consulate Dubai'},
      RU:{phone:'+971-2-672-1797'},
    }
  },
  QA: { // Qatar
    name:'Qatar',
    emergency:'999',
    embassies:{
      US:{phone:'+974-4496-6000',web:'https://qa.usembassy.gov'},
      UK:{phone:'+974-4496-2100',web:'https://www.gov.uk/world/organisations/british-embassy-doha'},
      IN:{phone:'+974-4467-2175',note:'Emergency: +974-5564-7502'},
      PH:{phone:'+974-4483-1585',note:'OWWA: +974-7744-1237'},
      PK:{phone:'+974-4483-2525'},
      BD:{phone:'+974-4436-7944'},
      NP:{phone:'+974-4441-2190'},
      LK:{phone:'+974-4469-2530'},
      AU:{phone:'+61-2-6261-3305',note:'Consular Emergency Centre'},
      CA:{phone:'+974-4419-9000'},
      DE:{phone:'+974-4408-7400'},
      FR:{phone:'+974-4407-2700'},
      EG:{phone:'+974-4483-2088'},
      JO:{phone:'+974-4483-2030'},
      KR:{phone:'+974-4483-8700'},
      JP:{phone:'+974-4440-7200'},
      ID:{phone:'+974-4483-2320'},
      KE:{phone:'+974-4483-1533'},
      ZA:{phone:'+974-4483-3900'},
    }
  },
  BH: { // Bahrain
    name:'Bahrain',
    emergency:'999',
    embassies:{
      US:{phone:'+973-1724-2700',web:'https://bh.usembassy.gov'},
      UK:{phone:'+973-1757-4100'},
      IN:{phone:'+973-1771-2785'},
      PH:{phone:'+973-3995-3235'},
      PK:{phone:'+973-1771-1789'},
      BD:{phone:'+973-1753-3271'},
      EG:{phone:'+973-1772-0005'},
      JO:{phone:'+973-1729-1100'},
      KR:{phone:'+973-1753-4301'},
    }
  },
  KW: { // Kuwait
    name:'Kuwait',
    emergency:'112',
    embassies:{
      US:{phone:'+965-2259-1001',web:'https://kw.usembassy.gov'},
      UK:{phone:'+965-2259-4320'},
      IN:{phone:'+965-2253-1600',note:'Emergency: +965-6550-1946'},
      PH:{phone:'+965-2220-5571',note:'ATN: +965-9782-4974'},
      PK:{phone:'+965-2256-4949'},
      BD:{phone:'+965-6992-0013'},
      EG:{phone:'+965-2256-1966'},
      LK:{phone:'+965-2256-4712'},
      NP:{phone:'+965-2251-6011'},
      ID:{phone:'+965-2253-9467'},
      ET:{phone:'+965-2251-8950'},
    }
  },
  OM: { // Oman
    name:'Oman',
    emergency:'9999',
    embassies:{
      US:{phone:'+968-2464-3400',web:'https://om.usembassy.gov'},
      UK:{phone:'+968-2460-9000'},
      IN:{phone:'+968-8007-1234',note:'Toll-free'},
      PH:{phone:'+968-7990-5211'},
      PK:{phone:'+968-2460-3439'},
      BD:{phone:'+968-2460-5566'},
      EG:{phone:'+968-2460-1655'},
    }
  },
  SA: { // Saudi Arabia
    name:'Saudi Arabia',
    emergency:'911',
    embassies:{
      US:{phone:'+966-11-488-3800',web:'https://sa.usembassy.gov'},
      UK:{phone:'+966-11-488-0077'},
      IN:{phone:'+966-11-488-4697',note:'Jeddah: +966-12-672-3334'},
      PH:{phone:'+966-11-482-3559',note:'OWWA Riyadh: +966-56-989-3301'},
      PK:{phone:'+966-11-461-0352'},
      BD:{phone:'+966-11-488-1661'},
      NP:{phone:'+966-11-482-7050'},
      LK:{phone:'+966-11-460-0289'},
      ID:{phone:'+966-11-488-2800'},
      EG:{phone:'+966-11-488-1064'},
      KE:{phone:'+966-11-488-3737'},
      NG:{phone:'+966-11-482-3410'},
      ET:{phone:'+966-11-488-0457'},
      AU:{phone:'+966-11-488-7788'},
      CA:{phone:'+966-11-488-2288'},
      FR:{phone:'+966-11-488-1255'},
      DE:{phone:'+966-11-488-0700'},
      JP:{phone:'+966-11-488-1100'},
      KR:{phone:'+966-11-488-2211'},
      CN:{phone:'+966-11-483-2077'},
    }
  },
  IR: { // Iran
    name:'Iran',
    emergency:'115',
    crisis_note:'Most Western embassies closed or operating at minimal capacity.',
    embassies:{
      US:{note:'No US Embassy — Swiss protecting power: +98-21-2200-8333'},
      UK:{note:'Limited services — FCDO 24/7: +44-20-7008-5000'},
      PK:{phone:'+98-21-6694-1388'},
      IN:{phone:'+98-21-2288-6037'},
      JP:{phone:'+98-21-2287-0391'},
      KR:{phone:'+98-21-2205-5900'},
      DE:{phone:'+98-21-3999-0000'},
      FR:{phone:'+98-21-6416-4100'},
      IT:{phone:'+98-21-6672-6955'},
      CN:{phone:'+98-21-2290-3804'},
      RU:{phone:'+98-21-6670-0042'},
    }
  },
  IQ: { // Iraq
    name:'Iraq',
    emergency:'104',
    embassies:{
      US:{phone:'+964-760-030-7000',note:'Shelter in place',web:'https://iq.usembassy.gov'},
      UK:{phone:'+964-7901-926-280'},
      IN:{phone:'+964-770-443-2089'},
      PH:{phone:'+964-750-815-5150',note:'Erbil'},
      AU:{phone:'+61-2-6261-3305',note:'Consular Emergency Centre'},
      DE:{phone:'+964-751-988-2000',note:'Erbil Consulate'},
      FR:{phone:'+964-770-443-1060'},
      JO:{phone:'+964-770-190-3020'},
      EG:{phone:'+964-770-100-5511'},
    }
  },
  IL: { // Israel
    name:'Israel',
    emergency:'100 (police) / 101 (ambulance)',
    embassies:{
      US:{phone:'+972-3-519-7575',web:'https://il.usembassy.gov'},
      UK:{phone:'+972-3-725-1222'},
      CA:{phone:'+972-3-636-3300'},
      AU:{phone:'+972-3-693-5000'},
      DE:{phone:'+972-3-693-9000'},
      FR:{phone:'+972-3-520-0404'},
      IT:{phone:'+972-3-510-4004'},
      RU:{phone:'+972-3-522-6744'},
      IN:{phone:'+972-3-526-1737'},
      CN:{phone:'+972-3-544-6688'},
      JP:{phone:'+972-3-695-7292'},
      KR:{phone:'+972-3-692-2626'},
      BR:{phone:'+972-3-797-2500'},
      ZA:{phone:'+972-9-957-6147'},
      NL:{phone:'+972-3-754-0777'},
      ES:{phone:'+972-3-519-2451'},
    }
  },
  JO: { // Jordan
    name:'Jordan',
    emergency:'911',
    embassies:{
      US:{phone:'+962-6-590-6000',web:'https://jo.usembassy.gov'},
      UK:{phone:'+962-6-590-9200'},
      IN:{phone:'+962-6-462-2098'},
      PH:{phone:'+962-6-593-2505'},
      PK:{phone:'+962-6-461-1271'},
      AU:{phone:'+962-6-580-7000'},
      CA:{phone:'+962-6-590-1500'},
      DE:{phone:'+962-6-590-1170'},
      FR:{phone:'+962-6-460-4630'},
      EG:{phone:'+962-6-560-5175'},
      KR:{phone:'+962-6-593-0745'},
      JP:{phone:'+962-6-593-2005'},
      ID:{phone:'+962-6-593-2360'},
    }
  },
  LB: { // Lebanon
    name:'Lebanon',
    emergency:'112',
    embassies:{
      US:{phone:'+961-4-543-600',web:'https://lb.usembassy.gov'},
      UK:{phone:'+961-1-960-800'},
      FR:{phone:'+961-1-420-000'},
      DE:{phone:'+961-4-934-600'},
      AU:{phone:'+961-1-960-600'},
      CA:{phone:'+961-4-726-700'},
      EG:{phone:'+961-1-867-361'},
      IN:{phone:'+961-5-958-790'},
    }
  },
};

// ── GLOBAL EMERGENCY HOTLINES (for popups on non-ME airports) ──
var GLOBAL_EMERGENCY = {
  US:{phone:'1-888-407-4747',note:'State Dept Overseas Citizens',web:'https://travel.state.gov'},
  UK:{phone:'+44-20-7008-5000',note:'FCDO 24/7',web:'https://www.gov.uk/foreign-travel-advice'},
  AU:{phone:'+61-2-6261-3305',note:'Consular Emergency',web:'https://www.smartraveller.gov.au'},
  CA:{phone:'+1-613-996-8885',note:'Global Affairs 24/7',web:'https://travel.gc.ca'},
  IN:{phone:'+91-11-2301-2113',note:'MEA Control Room',web:'https://www.mea.gov.in'},
  PH:{phone:'+63-2-8651-9400',note:'DFA OFW 24/7',web:'https://dfa.gov.ph'},
  PK:{phone:'+92-51-920-7887',note:'MOFA Crisis Mgmt',web:'https://mofa.gov.pk'},
  BD:{phone:'+880-2-9554000',note:'MOFA Helpline'},
  NP:{phone:'+977-1-441-6019',note:'MOFA'},
  LK:{phone:'+94-11-238-1100',note:'Foreign Ministry'},
};

// ── HELPER: get embassy info for a given airport IATA ──
function getEmbassiesForAirport(iata) {
  // Map IATA to host country code
  if (typeof ME_AIRPORTS !== 'undefined' && ME_AIRPORTS[iata]) {
    return EMBASSIES_BY_HOST[ME_AIRPORTS[iata].country] || null;
  }
  // Check AIRPORT_DATA
  const ad = (typeof AIRPORT_DATA !== 'undefined' ? AIRPORT_DATA : []).find(a => (a.iata||a.code) === iata);
  if (ad) {
    // Try mapping from airport country code
    const cc2 = ad.countryCode || '';
    if (EMBASSIES_BY_HOST[cc2]) return EMBASSIES_BY_HOST[cc2];
  }
  return null;
}

// ── HELPER: get host country code for airport ──
function getHostCountryForAirport(iata) {
  if (typeof ME_AIRPORTS !== 'undefined' && ME_AIRPORTS[iata]) return ME_AIRPORTS[iata].country;
  return null;
}

// ── HELPER: navigate to embassy section on resources page ──
function goToEmbassy(cc) {
  showView('resources');
  // Click the Embassies filter
  var btns = document.querySelectorAll('.filter-btn');
  for (var i = 0; i < btns.length; i++) {
    if (btns[i].textContent.trim() === 'Embassies') {
      filterResources('embassy', btns[i]);
      break;
    }
  }
  if (cc) {
    setTimeout(function() {
      var el = document.getElementById('emb-' + cc);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 250);
  }
}

// ── HELPER: build purple button for ME airport popups ──
function buildEmbassyButton(iata) {
  var cc = getHostCountryForAirport(iata);
  var host = cc && EMBASSIES_BY_HOST[cc] ? EMBASSIES_BY_HOST[cc] : null;
  var label = host ? 'Embassies in ' + host.name : 'Embassy Contacts';
  var ccStr = cc || '';
  return '<div style="margin-top:.6rem">' +
    '<a href="javascript:void(0)" onclick="goToEmbassy(\'' + ccStr + '\')" ' +
    'style="display:block;text-align:center;padding:.45rem .8rem;background:rgba(168,85,247,.15);' +
    'border:1px solid rgba(168,85,247,.25);border-radius:8px;color:#a855f7;font-family:Inter,sans-serif;' +
    'font-size:.7rem;font-weight:700;text-decoration:none;text-transform:uppercase;letter-spacing:.03em">' +
    '\ud83c\udfdb\ufe0f ' + label + '</a></div>';
}

// ── HELPER: build purple button for non-ME popups ──
function buildGlobalEmergencyButton() {
  return '<div style="margin-top:.6rem">' +
    '<a href="javascript:void(0)" onclick="goToEmbassy(\'global\')" ' +
    'style="display:block;text-align:center;padding:.45rem .8rem;background:rgba(168,85,247,.15);' +
    'border:1px solid rgba(168,85,247,.25);border-radius:8px;color:#a855f7;font-family:Inter,sans-serif;' +
    'font-size:.7rem;font-weight:700;text-decoration:none;text-transform:uppercase;letter-spacing:.03em">' +
    '\ud83c\udfdb\ufe0f Embassy Contacts & Resources</a></div>';
}


if (typeof module !== 'undefined' && module.exports) {
  module.exports = { EMB_NATIONS, EMBASSIES_BY_HOST, GLOBAL_EMERGENCY };
}