// Seed content for HORNAFRIKA.
//
// Editorial rule (spec §17): nothing in this file invents a quote, a named
// eyewitness, or a statistic. Bodies are built from widely-documented regional
// context — geography, institutions, treaty history, infrastructure — the kind
// of background a desk editor would already have on file. Where a live figure
// belongs, the text carries a bracketed placeholder for an editor to fill.
// Every row seeds with isSeed = true and is badged as such in the admin.

export type SeedArticle = {
  slug: string;
  headline: string;
  deck: string;
  body: string;
  country?: string | null;
  countries?: string[];
  region?: string | null;
  category: string;
  subcategory?: string | null;
  author: string;
  topics: string[];
  imageCaption: string;
  placement?: "NONE" | "LEAD" | "SECONDARY" | "COUNTRY_LEAD" | "SECTION_FEATURE";
  isBreaking?: boolean;
  isDeveloping?: boolean;
  sourceNote?: string;
  daysAgo: number;
  hoursAgo?: number;
  readMinutes: number;
  views: number;
};

export const COUNTRIES = [
  {
    slug: "somalia",
    name: "Somalia",
    nativeName: "Soomaaliya",
    flag: "🇸🇴",
    capital: "Mogadishu",
    accent: "#4189DD",
    order: 1,
    blurb:
      "A federal republic on the Horn's eastern seaboard with the longest coastline in mainland Africa. Somalia's federal member states share power with a central government in Mogadishu, and its economy runs heavily on livestock export, remittances and the ports of Mogadishu, Bosaso, Kismayo and Berbera.",
    regions: [
      { slug: "mogadishu", name: "Mogadishu", blurb: "The capital and Banadir administrative region, and the country's largest port and commercial centre." },
      { slug: "puntland", name: "Puntland", blurb: "A federal member state in the north-east, declared autonomous in 1998, centred on Garowe and the port of Bosaso." },
      { slug: "galmudug", name: "Galmudug", blurb: "A central federal member state formed in 2006, with Dhusamareb as its administrative seat." },
      { slug: "hirshabelle", name: "Hirshabelle", blurb: "Formed in 2016 from the Hiiraan and Middle Shabelle regions, along the Shabelle river valley." },
      { slug: "south-west", name: "South West", blurb: "A federal member state covering Bay, Bakool and Lower Shabelle, with Baidoa as its capital." },
      { slug: "jubaland", name: "Jubaland", blurb: "The southernmost federal member state, centred on Kismayo and the Juba river valley." },
      { slug: "somaliland", name: "Somaliland", blurb: "A self-declared republic in the north-west that announced independence in 1991. It is not internationally recognised; Mogadishu regards it as part of Somalia." },
    ],
  },
  {
    slug: "ethiopia",
    name: "Ethiopia",
    nativeName: "ኢትዮጵያ",
    flag: "🇪🇹",
    capital: "Addis Ababa",
    accent: "#2C9C4A",
    order: 2,
    blurb:
      "The most populous country in the Horn and the second most populous in Africa. Landlocked since Eritrean independence in 1993, Ethiopia routes the overwhelming majority of its foreign trade through Djibouti. Addis Ababa hosts the headquarters of the African Union.",
    regions: [
      { slug: "addis-ababa", name: "Addis Ababa", blurb: "The federal capital, a chartered city, and the seat of the African Union Commission." },
      { slug: "oromia", name: "Oromia", blurb: "The largest region by area and population, encircling Addis Ababa." },
      { slug: "amhara", name: "Amhara", blurb: "A northern highland region containing Lake Tana and the source of the Blue Nile." },
      { slug: "tigray", name: "Tigray", blurb: "The northernmost region, bordering Eritrea, administered under a transitional arrangement following the 2022 cessation-of-hostilities agreement." },
      { slug: "somali-region", name: "Somali Region", blurb: "The eastern lowland region bordering Somalia and Djibouti, historically known as the Ogaden." },
      { slug: "afar", name: "Afar", blurb: "The north-eastern region crossed by the Djibouti trade corridor and containing the Danakil Depression." },
      { slug: "sidama", name: "Sidama", blurb: "A southern region established in 2020 following a referendum, centred on Hawassa." },
      { slug: "other-regions", name: "Other Regions", blurb: "Benishangul-Gumuz, Gambela, Harari, Dire Dawa, Central Ethiopia, South Ethiopia and South West Ethiopia." },
    ],
  },
  {
    slug: "djibouti",
    name: "Djibouti",
    nativeName: "Djibouti",
    flag: "🇩🇯",
    capital: "Djibouti City",
    accent: "#4CA6B8",
    order: 3,
    blurb:
      "The smallest country in the Horn and the most strategically placed, sitting on the Bab el-Mandeb strait where the Red Sea meets the Gulf of Aden. Its economy is built on ports, logistics and the leasing of military bases to foreign powers, and it is the principal maritime gateway for Ethiopian trade.",
    regions: [
      { slug: "djibouti-city", name: "Djibouti City", blurb: "The capital and the location of the country's main container, multipurpose and bulk terminals." },
      { slug: "ali-sabieh", name: "Ali Sabieh", blurb: "A southern region on the rail corridor toward the Ethiopian border." },
      { slug: "tadjourah", name: "Tadjourah", blurb: "A northern coastal region and the site of a potash and livestock export port." },
      { slug: "obock", name: "Obock", blurb: "The north-eastern region facing the Bab el-Mandeb, and a departure point on the Yemen migration route." },
      { slug: "dikhil", name: "Dikhil", blurb: "An inland western region bordering Ethiopia, containing Lake Abbe." },
      { slug: "arta", name: "Arta", blurb: "A coastal region west of the capital along the Gulf of Tadjoura." },
    ],
  },
  {
    slug: "eritrea",
    name: "Eritrea",
    nativeName: "ኤርትራ",
    flag: "🇪🇷",
    capital: "Asmara",
    accent: "#C9182B",
    order: 4,
    blurb:
      "A Red Sea state that became independent from Ethiopia in 1993 after a thirty-year war. Eritrea holds roughly a thousand kilometres of coastline and the ports of Massawa and Assab, and its capital Asmara is a UNESCO World Heritage site for its modernist architecture.",
    regions: [
      { slug: "asmara", name: "Asmara", blurb: "The capital, in the Maekel region, listed by UNESCO for its early-twentieth-century modernist architecture." },
      { slug: "northern-red-sea", name: "Northern Red Sea", blurb: "The coastal region containing Massawa, the country's principal northern port." },
      { slug: "southern-red-sea", name: "Southern Red Sea", blurb: "The southern coastal region containing Assab and facing the Bab el-Mandeb." },
      { slug: "anseba", name: "Anseba", blurb: "A north-western region centred on Keren, the country's second city." },
      { slug: "gash-barka", name: "Gash-Barka", blurb: "The western agricultural and mining region bordering Sudan." },
      { slug: "debub", name: "Debub", blurb: "The southern highland region bordering Ethiopia, centred on Mendefera." },
    ],
  },
];

export const CATEGORIES = [
  { slug: "politics", name: "Politics", kind: "DESK", color: "red", order: 1, inNav: true, blurb: "Government, elections, diplomacy, parliament and regional politics across the Horn.", subs: ["Government", "Elections", "Diplomacy", "Parliament", "Leadership", "Regional Politics"] },
  { slug: "business", name: "Business", kind: "DESK", color: "blue", order: 2, inNav: true, blurb: "Companies, trade, investment, banking, startups, infrastructure, ports, telecoms and energy.", subs: ["Companies", "Trade", "Investment", "Banking", "Startups", "Infrastructure", "Ports", "Telecommunications", "Energy"] },
  { slug: "security", name: "Security", kind: "DESK", color: "slate", order: 3, inNav: true, blurb: "Conflict, militancy, military affairs, policing, border security, piracy and regional security cooperation. Reported factually and without speculation.", subs: ["Conflict", "Militancy", "Military", "Police", "Border Security", "Piracy", "Regional Security"] },
  { slug: "economy", name: "Economy", kind: "DESK", color: "teal", order: 4, inNav: false, blurb: "GDP, inflation, currency, employment, development and international assistance.", subs: ["GDP", "Inflation", "Currency", "Employment", "Development", "International Aid"] },
  { slug: "society", name: "Society", kind: "DESK", color: "green", order: 5, inNav: false, blurb: "Education, healthcare, community, youth, women and human interest.", subs: ["Education", "Healthcare", "Community", "Human Interest", "Youth", "Women"] },
  { slug: "culture", name: "Culture", kind: "DESK", color: "amber", order: 6, inNav: true, blurb: "Music, art, literature, food, traditions and history.", subs: ["Music", "Art", "Literature", "Food", "Traditions", "History"] },
  { slug: "sports", name: "Sports", kind: "DESK", color: "emerald", order: 7, inNav: true, blurb: "Football, basketball, athletics, local sport and international competition.", subs: ["Football", "Basketball", "Athletics", "Local Sports", "International"] },
  // The desk slug is "regional" so a country-less regional story gets the URL
  // /horn/regional/<slug> rather than the redundant /horn/horn/<slug>.
  { slug: "regional", name: "Horn of Africa", kind: "REGIONAL", color: "navy", order: 8, inNav: false, blurb: "Stories that belong to more than one country: relations, the Red Sea, trade corridors, ports, migration, climate and the regional bodies that bind the four states together.", subs: ["Relations", "Red Sea", "Trade", "Ports", "Diplomacy", "Migration", "Climate", "Regional Bodies"] },
  { slug: "explained", name: "Explained", kind: "FORMAT", color: "indigo", order: 9, inNav: false, blurb: "Background, context and plain-language answers to the questions behind the headlines.", subs: ["Background", "Timeline", "Key Facts", "Maps"] },
  { slug: "people", name: "People", kind: "FORMAT", color: "rose", order: 10, inNav: false, blurb: "Profiles and interviews with the entrepreneurs, athletes, artists, scientists, educators and community leaders of the Horn.", subs: ["Profiles", "Interviews", "Diaspora", "Innovators"] },
];

export const TOPICS = [
  "red-sea", "ports", "trade", "diplomacy", "elections", "security-cooperation",
  "drought", "climate", "migration", "gerd", "nile", "investment", "football",
  "athletics", "music", "diaspora", "energy", "telecoms", "banking", "startups",
  "african-union", "igad", "livestock", "fisheries", "education", "health",
  "infrastructure", "railway", "aviation", "heritage", "youth", "women",
  "remittances", "shipping", "borders", "peacekeeping",
];

export const AUTHORS = [
  { slug: "amina-warsame", name: "Amina Warsame", title: "Regional Correspondent", location: "Mogadishu", avatarSeed: "aw-01", bio: "Covers Somali federal politics and the Horn's diplomatic track. Based in Mogadishu." },
  { slug: "dawit-bekele", name: "Dawit Bekele", title: "Business Editor", location: "Addis Ababa", avatarSeed: "db-02", bio: "Writes on Ethiopian macroeconomics, trade corridors and the region's investment climate." },
  { slug: "hodan-ali", name: "Hodan Ali", title: "Senior Reporter, Security", location: "Nairobi", avatarSeed: "ha-03", bio: "Reports on security and conflict across the Horn with an emphasis on verification and restraint." },
  { slug: "ismail-houmed", name: "Ismail Houmed", title: "Djibouti Correspondent", location: "Djibouti City", avatarSeed: "ih-04", bio: "Covers ports, logistics and the maritime economy of the Bab el-Mandeb." },
  { slug: "senait-ghebre", name: "Senait Ghebre", title: "Culture Editor", location: "Asmara", avatarSeed: "sg-05", bio: "Writes on music, heritage and the arts across the four countries of the Horn." },
  { slug: "yusuf-abdi", name: "Yusuf Abdi", title: "Sports Correspondent", location: "Hargeisa", avatarSeed: "ya-06", bio: "Follows football, athletics and grassroots sport in the Horn and its diaspora." },
  { slug: "meron-tesfaye", name: "Meron Tesfaye", title: "Explainers Editor", location: "Addis Ababa", avatarSeed: "mt-07", bio: "Builds the background, maps and timelines behind the region's most consequential stories." },
  { slug: "khadra-jama", name: "Khadra Jama", title: "People Editor", location: "London", avatarSeed: "kj-08", bio: "Profiles and long-form interviews with the entrepreneurs, scientists and artists of the Horn and its diaspora." },
];

export const USERS = [
  { email: "admin@hornafrika.com", name: "Platform Owner", role: "SUPER_ADMIN", password: "hornafrika", author: null },
  { email: "editor@hornafrika.com", name: "Amina Warsame", role: "EDITOR", password: "hornafrika", author: "amina-warsame" },
  { email: "journalist@hornafrika.com", name: "Dawit Bekele", role: "JOURNALIST", password: "hornafrika", author: "dawit-bekele" },
  { email: "contributor@hornafrika.com", name: "Yusuf Abdi", role: "CONTRIBUTOR", password: "hornafrika", author: "yusuf-abdi" },
  { email: "moderator@hornafrika.com", name: "Community Moderator", role: "MODERATOR", password: "hornafrika", author: null },
];
