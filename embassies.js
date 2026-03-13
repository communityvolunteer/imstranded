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
  AF:{flag:'\u{1f1e6}\u{1f1eb}',name:'Afghanistan'},
  SG:{flag:'\u{1f1f8}\u{1f1ec}',name:'Singapore'},
  SE:{flag:'\u{1f1f8}\u{1f1ea}',name:'Sweden'},
  NO:{flag:'\u{1f1f3}\u{1f1f4}',name:'Norway'},
  DK:{flag:'\u{1f1e9}\u{1f1f0}',name:'Denmark'},
  CH:{flag:'\u{1f1e8}\u{1f1ed}',name:'Switzerland'},
  BE:{flag:'\u{1f1e7}\u{1f1ea}',name:'Belgium'},
  AT:{flag:'\u{1f1e6}\u{1f1f9}',name:'Austria'},
  PL:{flag:'\u{1f1f5}\u{1f1f1}',name:'Poland'},
  GR:{flag:'\u{1f1ec}\u{1f1f7}',name:'Greece'},
  PT:{flag:'\u{1f1f5}\u{1f1f9}',name:'Portugal'},
  TR:{flag:'\u{1f1f9}\u{1f1f7}',name:'Turkey'},
  VN:{flag:'\u{1f1fb}\u{1f1f3}',name:'Vietnam'},
  SD:{flag:'\u{1f1f8}\u{1f1e9}',name:'Sudan'},
  GH:{flag:'\u{1f1ec}\u{1f1ed}',name:'Ghana'},
  UG:{flag:'\u{1f1fa}\u{1f1ec}',name:'Uganda'},
  TZ:{flag:'\u{1f1f9}\u{1f1ff}',name:'Tanzania'},
  MX:{flag:'\u{1f1f2}\u{1f1fd}',name:'Mexico'},
  SO:{flag:'\u{1f1f8}\u{1f1f4}',name:'Somalia'},
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
    
      IE:{phone:'+971-2-495-8200',web:'https://www.ireland.ie/en/uae/abudhabi/'},
      NL:{phone:'+971-2-404-6100',web:'https://www.netherlandsandyou.nl/your-country-and-the-netherlands/united-arab-emirates'},
      TH:{phone:'+971-2-644-4786'},
      MY:{phone:'+971-2-444-9999',web:'https://www.kln.gov.my/web/are_abu-dhabi'},
      SG:{phone:'+971-2-444-7966'},
      ES:{phone:'+971-2-626-9544'},
      SE:{phone:'+971-2-418-8600',web:'https://www.swedenabroad.se/abudhabi'},
      NO:{phone:'+971-2-418-8700'},
      DK:{phone:'+971-2-698-3500'},
      CH:{phone:'+971-2-627-4636',web:'https://www.eda.admin.ch/abudhabi'},
      BE:{phone:'+971-2-631-0200'},
      AT:{phone:'+971-2-694-0088'},
      PL:{phone:'+971-2-446-5200'},
      GR:{phone:'+971-2-449-9900'},
      PT:{phone:'+971-2-445-4555'},
      TR:{phone:'+971-2-446-2444',web:'https://abudhabi.be.mfa.gov.tr'},
      AF:{phone:'+971-2-444-1200'},
      VN:{phone:'+971-2-446-0404'},
      SD:{phone:'+971-2-665-5116'},
      GH:{phone:'+971-2-641-1119'},
      UG:{phone:'+971-2-449-6555'},
      TZ:{phone:'+971-2-633-2300'},
      MX:{phone:'+971-2-443-9000'},}
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
    
      IE:{phone:'+974-4496-1100'},
      NL:{phone:'+974-4467-6200'},
      TH:{phone:'+974-4484-7095'},
      MY:{phone:'+974-4485-9202'},
      SG:{phone:'+974-4468-3005'},
      ES:{phone:'+974-4483-6666'},
      SE:{phone:'+974-4467-5010'},
      NO:{phone:'+974-4483-3464'},
      CH:{phone:'+974-4497-3300'},
      BE:{phone:'+974-4483-3144'},
      PL:{phone:'+974-4493-1060'},
      TR:{phone:'+974-4484-5555',web:'https://doha.be.mfa.gov.tr'},
      AF:{phone:'+974-4487-5222'},
      VN:{phone:'+974-4491-8777'},
      SD:{phone:'+974-4467-4670'},
      GH:{phone:'+974-4483-7705'},
      NZ:{phone:'+974-4422-6300',note:'via UK Embassy'},
      DK:{phone:'+974-4413-5300'},}
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
    
      TH:{phone:'+973-1725-1550'},
      MY:{phone:'+973-1758-1500'},
      IE:{phone:'+973-1756-4333'},
      NL:{phone:'+973-1727-2800'},
      DE:{phone:'+973-1757-4970'},
      FR:{phone:'+973-1729-8600'},
      IT:{phone:'+973-1723-1295'},
      TR:{phone:'+973-1722-8978'},
      AU:{phone:'+973-1757-4700'},
      CA:{phone:'+973-1753-2280'},
      JP:{phone:'+973-1721-6565'},
      CN:{phone:'+973-1772-3800'},
      RU:{phone:'+973-1772-5222'},}
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
    
      IE:{phone:'+965-2256-2831'},
      NL:{phone:'+965-2253-1280'},
      ZA:{phone:'+965-2256-1592'},
      TH:{phone:'+965-2253-8640'},
      MY:{phone:'+965-2254-5344'},
      SG:{phone:'+965-2256-0185'},
      ES:{phone:'+965-2252-1174'},
      SE:{phone:'+965-2256-0202'},
      CH:{phone:'+965-2256-7791'},
      TR:{phone:'+965-2253-1785'},
      AU:{phone:'+965-2253-3218'},
      CA:{phone:'+965-2256-3025'},
      DE:{phone:'+965-2252-0827'},
      FR:{phone:'+965-2257-1061'},
      IT:{phone:'+965-2253-9764'},
      JP:{phone:'+965-2253-0940'},
      KR:{phone:'+965-2253-3611'},
      CN:{phone:'+965-2253-3340'},
      JO:{phone:'+965-2255-8414'},
      NG:{phone:'+965-2252-6050'},
      SD:{phone:'+965-2254-2251'},}
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
    
      NP:{phone:'+968-2468-2040'},
      LK:{phone:'+968-2469-7841'},
      JO:{phone:'+968-2469-2015'},
      TH:{phone:'+968-2460-2291'},
      MY:{phone:'+968-2460-8825'},
      DE:{phone:'+968-2483-2482'},
      FR:{phone:'+968-2468-1800'},
      IT:{phone:'+968-2456-3230'},
      NL:{phone:'+968-2460-3706'},
      AU:{phone:'+968-2469-5900'},
      CA:{phone:'+968-2469-1791',note:'via Canadian Trade Office'},
      JP:{phone:'+968-2460-1028'},
      KR:{phone:'+968-2469-1490'},
      CN:{phone:'+968-2469-6000'},
      TR:{phone:'+968-2460-1948'},
      ZA:{phone:'+968-2460-6774'},
      KE:{phone:'+968-2469-8222'},}
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
    
      IE:{phone:'+966-11-488-2300'},
      NL:{phone:'+966-11-488-0011'},
      ZA:{phone:'+966-11-482-0880'},
      TH:{phone:'+966-11-488-1174'},
      MY:{phone:'+966-11-488-7100',web:'https://www.kln.gov.my/web/sau_riyadh'},
      SG:{phone:'+966-11-462-0906'},
      ES:{phone:'+966-11-488-0606'},
      SE:{phone:'+966-11-488-3100'},
      NO:{phone:'+966-11-488-4744'},
      DK:{phone:'+966-11-488-0101'},
      CH:{phone:'+966-11-488-1291'},
      BE:{phone:'+966-11-488-2888'},
      AT:{phone:'+966-11-480-1777'},
      PL:{phone:'+966-11-454-3244'},
      GR:{phone:'+966-11-460-3333'},
      TR:{phone:'+966-11-488-1100',web:'https://riyad.be.mfa.gov.tr'},
      AF:{phone:'+966-11-488-0208'},
      VN:{phone:'+966-11-454-2550'},
      SD:{phone:'+966-11-488-1533'},
      SO:{phone:'+966-11-454-1076'},
      GH:{phone:'+966-11-462-8011'},
      NZ:{phone:'+966-11-488-7988',note:'via Australian Embassy'},
      MX:{phone:'+966-11-480-8355'},}
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
    
      IE:{phone:'+962-6-593-0466'},
      NL:{phone:'+962-6-590-2200'},
      ZA:{phone:'+962-6-592-1194'},
      TH:{phone:'+962-6-593-8055'},
      MY:{phone:'+962-6-592-5700'},
      ES:{phone:'+962-6-461-4166'},
      SE:{phone:'+962-6-590-1600'},
      NO:{phone:'+962-6-593-2620'},
      CH:{phone:'+962-6-593-1416'},
      BE:{phone:'+962-6-592-2176'},
      AT:{phone:'+962-6-460-1101'},
      PL:{phone:'+962-6-551-2198'},
      GR:{phone:'+962-6-567-2331'},
      TR:{phone:'+962-6-464-1251'},
      BR:{phone:'+962-6-592-6204'},
      BD:{phone:'+962-6-592-3652'},
      NP:{phone:'+962-6-593-0440'},
      NG:{phone:'+962-6-592-0606'},
      ET:{phone:'+962-6-461-6063'},
      SD:{phone:'+962-6-569-7551'},}
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
  AM: { // Armenia
    name:'Armenia',
    emergency:'911',
    embassies:{
      US:{phone:'+374-10-464-700'},
    }
  },
  AR: { // Argentina
    name:'Argentina',
    emergency:'911',
    embassies:{
      US:{phone:'+54-11-5777-4533'},
    }
  },
  AT: { // Austria
    name:'Austria',
    emergency:'112',
    embassies:{
      US:{phone:'+43-1-31339-0'},
    }
  },
  AU: { // Australia
    name:'Australia',
    emergency:'000',
    embassies:{
      US:{phone:'+61-2-6214-5600'},
      UK:{phone:'+61-2-6270-6666'},
      IN:{phone:'+61-2-6273-3999'},
      PH:{phone:'+61-2-6273-2535'},
    }
  },
  AZ: { // Azerbaijan
    name:'Azerbaijan',
    emergency:'112',
    embassies:{
      US:{phone:'+994-12-488-3300'},
      UK:{phone:'+994-12-437-7878'},
    }
  },
  BD: { // Bangladesh
    name:'Bangladesh',
    emergency:'999',
    embassies:{
      US:{phone:'+880-2-5566-2000'},
      UK:{phone:'+880-2-8961-2000'},
    }
  },
  BE: { // Belgium
    name:'Belgium',
    emergency:'112',
    embassies:{
      US:{phone:'+32-2-811-4000'},
    }
  },
  BG: { // Bulgaria
    name:'Bulgaria',
    emergency:'112',
    embassies:{
      US:{phone:'+359-2-937-5100'},
    }
  },
  BR: { // Brazil
    name:'Brazil',
    emergency:'190',
    embassies:{
      US:{phone:'+55-61-3312-7000'},
      UK:{phone:'+55-61-3329-2300'},
      IN:{phone:'+55-61-3248-4006'},
      PH:{phone:'+55-61-3034-2424'},
    }
  },
  CA: { // Canada
    name:'Canada',
    emergency:'911',
    embassies:{
      US:{phone:'+1-613-238-5335'},
      UK:{phone:'+1-613-237-1530'},
      IN:{phone:'+1-613-744-3751'},
      PH:{phone:'+1-613-233-1121'},
    }
  },
  CH: { // Switzerland
    name:'Switzerland',
    emergency:'112',
    embassies:{
      US:{phone:'+41-31-357-7011'},
    }
  },
  CN: { // China
    name:'China',
    emergency:'110',
    embassies:{
      US:{phone:'+86-10-8531-3000'},
      UK:{phone:'+86-10-5192-4000'},
      IN:{phone:'+86-10-6532-1908'},
    }
  },
  CO: { // Colombia
    name:'Colombia',
    emergency:'123',
    embassies:{
      US:{phone:'+57-1-275-2000'},
    }
  },
  CY: { // Cyprus
    name:'Cyprus',
    emergency:'112',
    embassies:{
      US:{phone:'+357-22-393-939'},
    }
  },
  CZ: { // Czech Republic
    name:'Czech Republic',
    emergency:'112',
    embassies:{
      US:{phone:'+420-257-022-000'},
    }
  },
  DE: { // Germany
    name:'Germany',
    emergency:'112',
    embassies:{
      US:{phone:'+49-30-8305-0'},
      UK:{phone:'+49-30-204-570'},
      IN:{phone:'+49-30-257-950'},
      PH:{phone:'+49-30-864-9500'},
    }
  },
  DK: { // Denmark
    name:'Denmark',
    emergency:'112',
    embassies:{
      US:{phone:'+45-33-41-71-00'},
    }
  },
  DZ: { // Algeria
    name:'Algeria',
    emergency:'17',
    embassies:{
      US:{phone:'+213-770-08-2000'},
    }
  },
  EG: { // Egypt
    name:'Egypt',
    emergency:'122',
    embassies:{
      US:{phone:'+20-2-2797-3300'},
      UK:{phone:'+20-2-2791-6000'},
    }
  },
  ES: { // Spain
    name:'Spain',
    emergency:'112',
    embassies:{
      US:{phone:'+34-91-587-2200'},
      UK:{phone:'+34-91-714-6300'},
      PH:{phone:'+34-91-782-3830'},
    }
  },
  ET: { // Ethiopia
    name:'Ethiopia',
    emergency:'911',
    embassies:{
      US:{phone:'+251-11-130-6000'},
      IN:{phone:'+251-11-123-5539'},
    }
  },
  FI: { // Finland
    name:'Finland',
    emergency:'112',
    embassies:{
      US:{phone:'+358-9-6162-5100'},
    }
  },
  FR: { // France
    name:'France',
    emergency:'112',
    embassies:{
      US:{phone:'+33-1-4312-2222'},
      UK:{phone:'+33-1-4451-3100'},
      IN:{phone:'+33-1-4050-7070'},
      PH:{phone:'+33-1-4414-5700'},
    }
  },
  GB: { // United Kingdom
    name:'United Kingdom',
    emergency:'999',
    embassies:{
      US:{phone:'+44-20-7499-9000'},
      IN:{phone:'+44-20-7632-3149'},
      PH:{phone:'+44-20-7937-1600'},
      PK:{phone:'+44-20-7664-9200'},
      BD:{phone:'+44-20-7584-0081'},
      AU:{phone:'+44-20-7379-4334'},
      CA:{phone:'+44-20-7004-6000'},
      DE:{phone:'+44-20-7824-1300'},
      FR:{phone:'+44-20-7073-1000'},
    }
  },
  GE: { // Georgia
    name:'Georgia',
    emergency:'112',
    embassies:{
      US:{phone:'+995-32-227-7000'},
      UK:{phone:'+995-32-227-4747'},
    }
  },
  GH: { // Ghana
    name:'Ghana',
    emergency:'112',
    embassies:{
      US:{phone:'+233-30-274-1000'},
    }
  },
  GR: { // Greece
    name:'Greece',
    emergency:'112',
    embassies:{
      US:{phone:'+30-210-720-2414'},
      UK:{phone:'+30-210-727-2600'},
    }
  },
  HK: { // Hong Kong
    name:'Hong Kong',
    emergency:'999',
    embassies:{
      US:{phone:'+852-2523-9011'},
    }
  },
  HU: { // Hungary
    name:'Hungary',
    emergency:'112',
    embassies:{
      US:{phone:'+36-1-475-4400'},
    }
  },
  ID: { // Indonesia
    name:'Indonesia',
    emergency:'112',
    embassies:{
      US:{phone:'+62-21-5083-1000'},
      UK:{phone:'+62-21-2356-5200'},
      IN:{phone:'+62-21-5204-150'},
      PH:{phone:'+62-21-315-9036'},
    }
  },
  IE: { // Ireland
    name:'Ireland',
    emergency:'112',
    embassies:{
      US:{phone:'+353-1-668-8777'},
    }
  },
  IN: { // India
    name:'India',
    emergency:'112',
    embassies:{
      US:{phone:'+91-11-2419-8000'},
      UK:{phone:'+91-11-2419-2100'},
      AU:{phone:'+91-11-4139-9900'},
      CA:{phone:'+91-11-4178-2000'},
      PH:{phone:'+63-2-8843-1668',note:'Manila'},
      BD:{phone:'+91-11-2412-8512'},
      NP:{phone:'+91-11-2347-6819'},
      LK:{phone:'+91-11-2301-0201'},
    }
  },
  IT: { // Italy
    name:'Italy',
    emergency:'112',
    embassies:{
      US:{phone:'+39-06-4674-1'},
      UK:{phone:'+39-06-4220-0001'},
      PH:{phone:'+39-06-3608-6401'},
    }
  },
  JP: { // Japan
    name:'Japan',
    emergency:'110',
    embassies:{
      US:{phone:'+81-3-3224-5000'},
      UK:{phone:'+81-3-5211-1100'},
      IN:{phone:'+81-3-3262-2391'},
      PH:{phone:'+81-3-5562-1600'},
    }
  },
  KE: { // Kenya
    name:'Kenya',
    emergency:'999',
    embassies:{
      US:{phone:'+254-20-363-6000'},
      UK:{phone:'+254-20-287-3000'},
      IN:{phone:'+254-20-222-5563'},
    }
  },
  KR: { // South Korea
    name:'South Korea',
    emergency:'112',
    embassies:{
      US:{phone:'+82-2-397-4114'},
      UK:{phone:'+82-2-3210-5500'},
      IN:{phone:'+82-2-798-4257'},
      PH:{phone:'+82-2-796-7387'},
    }
  },
  LK: { // Sri Lanka
    name:'Sri Lanka',
    emergency:'119',
    embassies:{
      US:{phone:'+94-11-249-8500'},
      UK:{phone:'+94-11-539-0639'},
    }
  },
  MA: { // Morocco
    name:'Morocco',
    emergency:'19',
    embassies:{
      US:{phone:'+212-522-642-000'},
    }
  },
  MU: { // Mauritius
    name:'Mauritius',
    emergency:'999',
    embassies:{
      US:{phone:'+230-202-4400'},
    }
  },
  MX: { // Mexico
    name:'Mexico',
    emergency:'911',
    embassies:{
      US:{phone:'+52-55-5080-2000'},
    }
  },
  MY: { // Malaysia
    name:'Malaysia',
    emergency:'999',
    embassies:{
      US:{phone:'+60-3-2168-5000'},
      UK:{phone:'+60-3-2170-2200'},
      IN:{phone:'+60-3-2093-3510'},
      PH:{phone:'+60-3-2148-4233'},
    }
  },
  NG: { // Nigeria
    name:'Nigeria',
    emergency:'112',
    embassies:{
      US:{phone:'+234-9-461-4000'},
      UK:{phone:'+234-9-462-2200'},
      IN:{phone:'+234-9-413-1824'},
    }
  },
  NL: { // Netherlands
    name:'Netherlands',
    emergency:'112',
    embassies:{
      US:{phone:'+31-70-310-2209'},
      UK:{phone:'+31-70-427-0427'},
      IN:{phone:'+31-70-346-9771'},
    }
  },
  NO: { // Norway
    name:'Norway',
    emergency:'112',
    embassies:{
      US:{phone:'+47-21-30-85-40'},
    }
  },
  NP: { // Nepal
    name:'Nepal',
    emergency:'100',
    embassies:{
      US:{phone:'+977-1-423-4000'},
      UK:{phone:'+977-1-423-5100'},
    }
  },
  NZ: { // New Zealand
    name:'New Zealand',
    emergency:'111',
    embassies:{
      US:{phone:'+64-4-462-6000'},
      UK:{phone:'+64-4-924-2888'},
      IN:{phone:'+64-4-473-6390'},
    }
  },
  PH: { // Philippines
    name:'Philippines',
    emergency:'911',
    embassies:{
      US:{phone:'+63-2-5301-2000'},
      UK:{phone:'+63-2-8858-2200'},
      IN:{phone:'+63-2-8843-1668'},
    }
  },
  PK: { // Pakistan
    name:'Pakistan',
    emergency:'1122',
    embassies:{
      US:{phone:'+92-51-201-4000'},
      UK:{phone:'+92-51-201-2000'},
    }
  },
  PL: { // Poland
    name:'Poland',
    emergency:'112',
    embassies:{
      US:{phone:'+48-22-504-2000'},
    }
  },
  PT: { // Portugal
    name:'Portugal',
    emergency:'112',
    embassies:{
      US:{phone:'+351-21-727-3300'},
    }
  },
  RO: { // Romania
    name:'Romania',
    emergency:'112',
    embassies:{
      US:{phone:'+40-21-200-3300'},
    }
  },
  RS: { // Serbia
    name:'Serbia',
    emergency:'112',
    embassies:{
      US:{phone:'+381-11-706-4000'},
    }
  },
  RU: { // Russia
    name:'Russia',
    emergency:'112',
    embassies:{
      US:{phone:'+7-495-728-5000'},
      UK:{phone:'+7-495-956-7200'},
      IN:{phone:'+7-495-783-7535'},
    }
  },
  RW: { // Rwanda
    name:'Rwanda',
    emergency:'112',
    embassies:{
      US:{phone:'+250-252-596-400'},
    }
  },
  SE: { // Sweden
    name:'Sweden',
    emergency:'112',
    embassies:{
      US:{phone:'+46-8-783-5300'},
    }
  },
  SG: { // Singapore
    name:'Singapore',
    emergency:'999',
    embassies:{
      US:{phone:'+65-6476-9100'},
      UK:{phone:'+65-6424-4200'},
      IN:{phone:'+65-6737-6777'},
      PH:{phone:'+65-6737-3977'},
    }
  },
  TH: { // Thailand
    name:'Thailand',
    emergency:'191',
    embassies:{
      US:{phone:'+66-2-205-4000'},
      UK:{phone:'+66-2-305-8333'},
      IN:{phone:'+66-2-258-0300'},
    }
  },
  TN: { // Tunisia
    name:'Tunisia',
    emergency:'197',
    embassies:{
      US:{phone:'+216-71-107-000'},
    }
  },
  TR: { // Turkey
    name:'Turkey',
    emergency:'112',
    embassies:{
      US:{phone:'+90-312-455-5555'},
      UK:{phone:'+90-312-455-3344'},
      IN:{phone:'+90-312-438-2195'},
    }
  },
  TW: { // Taiwan
    name:'Taiwan',
    emergency:'110',
    embassies:{
      US:{phone:'+886-2-2162-2000'},
    }
  },
  TZ: { // Tanzania
    name:'Tanzania',
    emergency:'112',
    embassies:{
      US:{phone:'+255-22-229-4000'},
    }
  },
  UG: { // Uganda
    name:'Uganda',
    emergency:'999',
    embassies:{
      US:{phone:'+256-414-259-791'},
    }
  },
  US: { // United States
    name:'United States',
    emergency:'911',
    embassies:{
      UK:{phone:'+1-202-588-6500'},
      IN:{phone:'+1-202-939-7000'},
      PH:{phone:'+1-202-467-9300'},
      PK:{phone:'+1-202-243-6500'},
      BD:{phone:'+1-202-244-0183'},
      AU:{phone:'+1-202-797-3000'},
      CA:{phone:'+1-202-682-1740'},
      DE:{phone:'+1-202-298-4000'},
      FR:{phone:'+1-202-944-6000'},
      JP:{phone:'+1-202-238-6700'},
      KR:{phone:'+1-202-939-5600'},
      CN:{phone:'+1-202-495-2266'},
    }
  },
  UZ: { // Uzbekistan
    name:'Uzbekistan',
    emergency:'101',
    embassies:{
      US:{phone:'+998-78-120-5450'},
    }
  },
  VN: { // Vietnam
    name:'Vietnam',
    emergency:'113',
    embassies:{
      US:{phone:'+84-24-3850-5000'},
    }
  },
  ZA: { // South Africa
    name:'South Africa',
    emergency:'10111',
    embassies:{
      US:{phone:'+27-12-431-4000'},
      UK:{phone:'+27-12-421-7500'},
      IN:{phone:'+27-12-342-5392'},
    }
  },
  SC: { // Seychelles
    name:'Seychelles',
    emergency:'999',
    embassies:{
      UK:{phone:'+248-428-3666'},
      FR:{phone:'+248-438-2500'},
      IN:{phone:'+248-461-0301'},
    }
  },
  SN: { // Senegal
    name:'Senegal',
    emergency:'17',
    embassies:{
      US:{phone:'+221-33-879-4000'},
      FR:{phone:'+221-33-839-5100'},
      IN:{phone:'+221-33-849-3571'},
    }
  },
  CI: { // Ivory Coast
    name:'Ivory Coast',
    emergency:'110',
    embassies:{
      US:{phone:'+225-27-22-494-000'},
      FR:{phone:'+225-27-20-200-400'},
      IN:{phone:'+225-27-22-428-051'},
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
  // Check ME airports first
  if (typeof ME_AIRPORTS !== 'undefined' && ME_AIRPORTS[iata]) return ME_AIRPORTS[iata].country;
  // Check global airports via airports.js
  if (typeof findAirport === 'function') {
    var ap = findAirport(iata);
    if (ap && ap.countryCode && EMBASSIES_BY_HOST[ap.countryCode]) return ap.countryCode;
  }
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

// ── HELPER: build purple button for popups ──
function buildEmbassyButton(iata) {
  var cc = getHostCountryForAirport(iata);
  var host = cc && EMBASSIES_BY_HOST[cc] ? EMBASSIES_BY_HOST[cc] : null;
  if (!host) return buildGlobalEmergencyButton();
  var label = 'Embassies in ' + host.name;
  return '<div style="margin-top:.6rem">' +
    '<a href="javascript:void(0)" onclick="goToEmbassy(\'' + cc + '\')" ' +
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