import type { SeedArticle } from "./seed-data";

// See the editorial note at the top of seed-data.ts. No invented quotes,
// no invented statistics, no named eyewitnesses. Bracketed placeholders mark
// where a live figure belongs.

export const ARTICLES: SeedArticle[] = [
  // ---------------------------------------------------------------------
  // LEAD + HOMEPAGE SECONDARIES
  // ---------------------------------------------------------------------
  {
    slug: "ethiopia-somalia-framework-for-cooperation",
    headline: "Ethiopia and Somalia Agree on New Framework for Cooperation",
    deck: "Delegations from both countries met to set out a structure for diplomatic, economic and security cooperation, returning to a relationship that has swung between alliance and rupture for half a century.",
    body: `Ethiopia and Somalia have agreed a framework intended to put their diplomatic, economic and security relations on a more predictable footing. The two governments have spent the past several years alternating between close cooperation and public disagreement, and the framework is presented by both sides as an attempt to make the relationship less dependent on the temperature of any single dispute.

The underlying logic is geographic. Ethiopia is landlocked and has been since Eritrea's independence in 1993, and it borders Somalia along more than sixteen hundred kilometres. Somalia holds the longest coastline in mainland Africa. Neither country can pursue a trade, security or migration policy that ignores the other, and both have repeatedly discovered the cost of trying.

Security cooperation is the most established strand. Ethiopian forces have operated in southern and central Somalia for years, both bilaterally and under African Union mandates, and Ethiopian troops form part of the AU mission supporting Somali federal forces. Any framework that survives will have to answer how that presence is authorised, reviewed and eventually ended.

The economic strand is newer and harder. Ethiopia's search for reliable sea access has become the central variable in Horn diplomacy, and Somali ports are one of several options under discussion alongside Djibouti, Eritrea's Assab, and Berbera in Somaliland. Somalia's position has consistently been that access arrangements must be negotiated with the federal government and must not imply recognition of any breakaway administration.

What the framework does not yet settle is the question of sequencing: whether commercial agreements precede political ones or follow them. Both governments have described the document as a starting structure rather than a finished settlement.

[Editor: confirm signatories, date and the text of the agreement before publication.]`,
    countries: ["ethiopia", "somalia"],
    category: "regional",
    subcategory: "relations",
    author: "amina-warsame",
    topics: ["diplomacy", "trade", "security-cooperation", "ports"],
    imageCaption: "Delegations from Ethiopia and Somalia meet for talks on regional cooperation.",
    placement: "LEAD",
    isBreaking: true,
    daysAgo: 0,
    hoursAgo: 1,
    readMinutes: 6,
    views: 2840,
  },
  {
    slug: "djibouti-port-expansion-plan",
    headline: "Djibouti Unveils Major Port Expansion Plan",
    deck: "The expansion targets container and bulk capacity on the corridor that carries the overwhelming majority of Ethiopian foreign trade.",
    body: `Djibouti has set out plans for a further expansion of its port capacity, extending an infrastructure programme that has run for two decades and turned a country of under a million people into the primary maritime gateway for a neighbour of more than a hundred and twenty million.

The commercial case rests on a single fact. Ethiopia has no coastline, and the overwhelming majority of its imports and exports move through Djibouti. That dependence gives Djibouti a stable revenue base from port fees, transit charges and the leasing of logistics land, and it gives Ethiopia a strong interest in the corridor's reliability.

Djibouti's port complex is not a single facility. It spans the Doraleh container terminal, a multipurpose port, an oil terminal, and specialised facilities at Tadjourah and Goubet built for potash and livestock export. The expansion is aimed at the container and bulk segments, where congestion has the most direct effect on Ethiopian shippers.

Two pressures sit behind the timing. The first is competition: Berbera in Somaliland has been developed as an alternative Ethiopian outlet, and Eritrea's Assab has been discussed as another. The second is the disruption to Red Sea shipping that has pushed some carriers onto longer routes around southern Africa, changing the calculus for every port on the corridor.

Djibouti has also been careful to diversify beyond transit. The free zone, the Ethiopiaâ€“Djibouti electric railway, submarine cable landings and the leasing of military bases to several foreign powers all draw on the same strategic position at the mouth of the Red Sea.

[Editor: confirm the project's stated value, phasing and financing before publication.]`,
    country: "djibouti",
    countries: ["djibouti", "ethiopia"],
    region: "djibouti-city",
    category: "business",
    subcategory: "ports",
    author: "ismail-houmed",
    topics: ["ports", "trade", "infrastructure", "investment", "shipping"],
    imageCaption: "Container cranes at Djibouti's port complex, the principal maritime gateway for Ethiopian trade.",
    placement: "SECONDARY",
    daysAgo: 0,
    hoursAgo: 5,
    readMinutes: 5,
    views: 1960,
  },
  {
    slug: "somalia-border-security-operations-galmudug",
    headline: "Somalia Boosts Border Security Operations in Galmudug",
    deck: "Federal and state forces are expanding operations across central Somalia, where the boundary between administrations has long been harder to police than the international border.",
    body: `Somali federal and Galmudug state forces are expanding security operations across central Somalia, a stretch of country where authority is divided between federal institutions, state administrations and local clan structures.

Galmudug was formed in 2006 and sits between Puntland to the north and Hirshabelle to the south, with Dhusamareb as its administrative seat. Its internal boundaries have been contested for most of its existence, and the practical difficulty in central Somalia has rarely been the international frontier. It has been the space between administrations, where jurisdiction is unclear and armed groups have historically been able to move.

Operations in the region involve several distinct forces: the Somali National Army, federal police, Galmudug state forces, and locally raised units. Coordinating them is itself a large part of the security problem, and the federal government has spent several years attempting to bring locally raised forces into a common command structure.

Reporting from central Somalia is difficult to verify independently. Access is limited, communications are intermittent, and claims from all parties routinely diverge. This newsroom does not publish casualty figures, territorial claims or operational details that it cannot corroborate.

[Editor: this is a developing story. Confirm locations, participating units and any claims of territorial change with at least two independent sources before adding detail.]`,
    country: "somalia",
    region: "galmudug",
    category: "security",
    subcategory: "border-security",
    author: "hodan-ali",
    topics: ["security-cooperation", "borders"],
    imageCaption: "Somali security forces on patrol in the central regions.",
    placement: "SECONDARY",
    isDeveloping: true,
    sourceNote: "Details in this report are drawn from official statements and have not been independently verified on the ground.",
    daysAgo: 0,
    hoursAgo: 8,
    readMinutes: 4,
    views: 1520,
  },
  {
    slug: "eritrean-music-global-stage",
    headline: "Eritrean Music Shines on Global Stage Again",
    deck: "From the krar and the wata to the brass-heavy sound of Asmara's mid-century clubs, Eritrean music is finding new audiences through diaspora venues and streaming.",
    body: `Eritrean music is reaching audiences well beyond the Red Sea coast, carried by a diaspora spread across Europe, North America and the Gulf and by streaming platforms that have made a national catalogue searchable for the first time.

The instruments are old. The krar, a five- or six-string lyre, and the wata, a single-string bowed instrument, anchor much of the traditional repertoire, alongside the kebero drum. Eritrea's nine recognised ethnic groups each carry distinct musical traditions, and the guaila circle dance remains the form most immediately associated with Eritrean celebration.

The twentieth century added another layer. Asmara's clubs developed a brass-driven popular sound in the decades around federation and the start of the independence war, and music became inseparable from the political history that followed. Songs written during the thirty-year struggle for independence are still performed, and still carry that weight.

The contemporary picture is largely a diaspora one. Eritrean communities in Frankfurt, Stockholm, London, Toronto and Washington sustain a circuit of festivals and community events, and younger artists increasingly blend the traditional scales with hip-hop and R&B production.

Asmara itself remains central to the story. The capital's early-twentieth-century modernist architecture was inscribed on the UNESCO World Heritage list in 2017, and its cinemas and bars are part of the same cultural inheritance as the music made in them.`,
    country: "eritrea",
    region: "asmara",
    category: "culture",
    subcategory: "music",
    author: "senait-ghebre",
    topics: ["music", "heritage", "diaspora"],
    imageCaption: "An Eritrean performer on stage at a diaspora music festival.",
    placement: "SECONDARY",
    daysAgo: 1,
    readMinutes: 5,
    views: 1180,
  },

  // ---------------------------------------------------------------------
  // HORN / REGIONAL
  // ---------------------------------------------------------------------
  {
    slug: "why-the-red-sea-is-vital-to-the-horn-of-africa",
    headline: "Why the Red Sea Is Vital to the Horn of Africa",
    deck: "A narrow strait at the bottom of the Red Sea shapes the economics and the security policy of all four countries in the Horn. Here is how.",
    body: `The Bab el-Mandeb is about thirty kilometres wide at its narrowest point. It separates Djibouti and Eritrea from Yemen, and it is the only sea route between the Indian Ocean and the Suez Canal. Close it, and traffic between Asia and Europe must go around the Cape of Good Hope, adding thousands of kilometres and roughly a week and a half to a voyage.

That geography explains a great deal about the Horn. It explains why Djibouti, a country of under a million people, hosts military installations belonging to several foreign powers, and why port revenue and base leases rather than agriculture or industry form the backbone of its economy.

It explains Ethiopia's position too. Ethiopia lost its coastline when Eritrea became independent in 1993, and it now moves the overwhelming majority of its foreign trade through Djibouti. For a country of Ethiopia's size, depending on a single corridor is a structural vulnerability, and the search for an alternative outlet has been the dominant theme in Horn diplomacy.

For Eritrea, the Red Sea is the entire national frontage. Massawa and Assab are the two principal ports, and Assab in particular served Ethiopian trade before the 1998â€“2000 war closed the border. For Somalia, the relevant waters are the Gulf of Aden and the Indian Ocean rather than the Red Sea proper, but the same shipping lane runs past its northern coast, and the piracy surge of the late 2000s originated there.

**Why disruption matters here more than elsewhere.** When Red Sea shipping is disrupted, the effect on the Horn is not only the loss of transit traffic. Insurance premiums rise, carriers reroute, and the cost of imported food, fuel and construction material rises in countries with limited ability to absorb it.

**What to watch.** Three things determine the region's exposure: whether alternative Ethiopian outlets at Berbera or Assab become commercially serious, whether the naval presence in the Gulf of Aden is sustained, and whether the corridor infrastructure â€” rail, road and power â€” keeps pace with volume.`,
    countries: ["djibouti", "eritrea", "ethiopia", "somalia"],
    category: "explained",
    subcategory: "background",
    author: "meron-tesfaye",
    topics: ["red-sea", "shipping", "ports", "trade"],
    imageCaption: "The Bab el-Mandeb strait, the entrance to the Red Sea, seen from the Horn's coastline.",
    placement: "SECTION_FEATURE",
    daysAgo: 1,
    readMinutes: 8,
    views: 3120,
  },
  {
    slug: "landlocked-ethiopia-search-for-sea-access",
    headline: "Landlocked Ethiopia's Search for Sea Access Reshapes Regional Diplomacy",
    deck: "Every serious question in Horn diplomacy now runs through one problem: how a country of more than a hundred and twenty million reaches the sea.",
    body: `Ethiopia became landlocked on 24 May 1993, when Eritrea formally became independent after a referendum. The separation transferred the entire Ethiopian coastline, including the ports of Massawa and Assab, to the new state. For the first five years the practical effect was limited, because Ethiopian trade continued to move through Assab under bilateral arrangements.

The 1998â€“2000 border war ended that. The frontier closed, Assab stopped serving Ethiopian cargo, and traffic shifted almost entirely to Djibouti. What began as a wartime necessity became a permanent structure, and Ethiopia has since routed the overwhelming majority of its foreign trade through a single neighbour.

The 2018 rapprochement between Addis Ababa and Asmara reopened the possibility of Assab, and the peace agreement signed that year was recognised with the Nobel Peace Prize. In practice the port has not returned to significant Ethiopian use, and relations between the two governments have cooled again since.

That leaves three live options, each with a different cost. Djibouti offers proven capacity, an electric railway to Addis Ababa and political stability, at the price of dependence. Berbera in Somaliland offers a shorter route to eastern Ethiopia and has attracted terminal investment, but any formal agreement runs directly into Somalia's position that Somaliland cannot conclude international arrangements. Assab offers the shortest distance of all, and depends entirely on the state of Ethiopiaâ€“Eritrea relations.

There is a fourth option that receives less attention: making the existing corridor work better. Corridor efficiency â€” customs processing, rail utilisation, inland dry ports â€” determines landed cost as much as the choice of seaport does.

The diplomacy follows the geography. Somalia reads Ethiopian port initiatives through the question of sovereignty. Djibouti reads them as competition for its principal revenue stream. Eritrea reads them through two decades of unresolved history. No arrangement satisfies all three at once, which is why the question has stayed open for thirty years.`,
    countries: ["ethiopia", "djibouti", "eritrea", "somalia"],
    category: "regional",
    subcategory: "diplomacy",
    author: "meron-tesfaye",
    topics: ["ports", "diplomacy", "trade", "red-sea"],
    imageCaption: "Freight on the corridor linking the Ethiopian highlands to the Red Sea coast.",
    daysAgo: 2,
    readMinutes: 9,
    views: 2410,
  },
  {
    slug: "new-trade-corridor-regional-economy",
    headline: "New Trade Corridor to Boost Regional Economy",
    deck: "Corridor projects across the Horn aim to cut the cost of moving goods between the highlands and the coast, where transport costs remain the largest single component of landed price.",
    body: `Work on trade corridors across the Horn is aimed at a problem that tariff policy cannot solve: in much of the region, the cost of moving a container inland exceeds the cost of shipping it across an ocean.

The Horn's corridors follow a small number of natural routes. The Djibouti corridor connects the Ethiopian highlands to the Gulf of Tadjoura and carries the bulk of Ethiopian trade, served by road and by the electrified standard-gauge railway between Addis Ababa and Djibouti that opened to commercial traffic in 2018. The Berbera corridor runs from the Somaliland coast toward eastern Ethiopia. Southern corridors link Mogadishu and Kismayo to their agricultural hinterlands along the Shabelle and Juba rivers.

Corridor performance is rarely determined by the road surface alone. Customs procedure, border-post opening hours, weighbridge policy, the availability of return loads and the reliability of power at inland terminals all feed into transit time, and transit time feeds into working capital.

There is also a livestock dimension specific to this region. Livestock is among the Horn's largest export categories, moving primarily to Gulf markets through Berbera, Bosaso and Djibouti. Livestock corridors need holding grounds, water points and veterinary certification rather than container handling, and they are frequently left out of infrastructure planning built around manufactured goods.

[Editor: confirm current corridor project names, financing and completion dates before publication.]`,
    countries: ["ethiopia", "djibouti", "somalia"],
    category: "business",
    subcategory: "trade",
    author: "dawit-bekele",
    topics: ["trade", "infrastructure", "railway", "livestock", "ports"],
    imageCaption: "Freight vehicles on a trade corridor between the coast and the interior.",
    isBreaking: true,
    daysAgo: 1,
    readMinutes: 6,
    views: 1340,
  },
  {
    slug: "ethiopia-eritrea-war-then-peace-timeline",
    headline: "Ethiopia and Eritrea: From Thirty Years of War to a Peace Deal, and What Came After",
    deck: "A timeline of the relationship that has done more than any other to shape the modern Horn.",
    body: `**1890â€“1941.** Eritrea is an Italian colony, administered separately from Ethiopia. Asmara is built out in the modernist style that would later earn it UNESCO World Heritage listing.

**1952.** After a period of British administration, the United Nations federates Eritrea with Ethiopia, granting it its own parliament and administration.

**1962.** The federal arrangement is dissolved and Eritrea is annexed as an Ethiopian province. Armed resistance follows, and the war of independence begins.

**1991.** The Eritrean People's Liberation Front takes Asmara as the Derg regime falls in Addis Ababa. Eritrea comes under provisional government.

**1993.** A referendum returns an overwhelming vote for independence. Eritrea becomes a sovereign state on 24 May, and Ethiopia becomes landlocked.

**1998â€“2000.** A border war breaks out, centred on the town of Badme. It is among the deadliest interstate conflicts in modern African history. The Algiers Agreement ends the fighting in December 2000 and establishes a boundary commission.

**2002.** The commission issues its ruling, awarding Badme to Eritrea. Ethiopia does not implement it. The frontier remains closed and the relationship enters what becomes known as the "no war, no peace" period, lasting sixteen years.

**2018.** Ethiopia announces it will accept the boundary ruling. Leaders meet in Asmara, a joint declaration ends the state of war, flights and phone lines resume, and border crossings open. The Nobel Peace Prize follows.

**After 2018.** Crossings that opened were later closed again, and relations cooled through the period of the Tigray conflict and the 2022 cessation-of-hostilities agreement. The peace declaration has not been formally revoked, but the practical opening has not been sustained.

**Why it still matters.** Ethiopia's access to the sea, Eritrea's regional posture, and the security of the Red Sea coast all trace back to this relationship. No account of the Horn works without it.`,
    countries: ["ethiopia", "eritrea"],
    category: "explained",
    subcategory: "timeline",
    author: "meron-tesfaye",
    topics: ["diplomacy", "red-sea", "borders"],
    imageCaption: "The highland frontier between Ethiopia and Eritrea.",
    daysAgo: 3,
    readMinutes: 7,
    views: 1890,
  },
  {
    slug: "drought-and-displacement-across-the-horn",
    headline: "Drought and Displacement Remain the Horn's Largest Shared Emergency",
    deck: "Rainfall failure does not respect borders, and neither does the displacement that follows it.",
    body: `The Horn of Africa sits across one of the world's most rainfall-variable zones. Much of the region depends on two rainy seasons â€” the long rains around March to May and the short rains around October to December â€” and the failure of consecutive seasons is the single largest driver of humanitarian need across all four countries.

The mechanism is consistent. Pastoralist communities lose livestock first, because animals cannot be moved fast enough to water. Terms of trade turn against herders as animal prices fall and cereal prices rise. Families move toward towns, water points and aid distribution, and displacement concentrates in settlements that were not built for it.

Displacement in the Horn is overwhelmingly internal rather than cross-border. People move within their own countries, to the outskirts of Mogadishu, Baidoa, Dhusamareb, or to towns in the Ethiopian lowlands. Camps that begin as emergency settlements frequently become permanent, and a second generation grows up in them.

Climate is not the only variable. Conflict restricts the movement of both herds and assistance, and areas that are hardest to reach are frequently the areas in greatest need. Where drought and insecurity overlap, the response is slower and the outcome worse.

There is a longer structural question underneath the emergency cycle. Pastoralism has been the rational land-use strategy for these rangelands for centuries precisely because it is mobile. Where that mobility is constrained â€” by conflict, by land enclosure, by settlement â€” the system's resilience falls.

[Editor: obtain current needs assessments from OCHA and FEWS NET before adding figures.]`,
    countries: ["somalia", "ethiopia", "djibouti", "eritrea"],
    category: "society",
    subcategory: "community",
    author: "hodan-ali",
    topics: ["drought", "climate", "migration"],
    imageCaption: "Rangeland in the Horn's drylands during a failed rainy season.",
    daysAgo: 4,
    readMinutes: 6,
    views: 1120,
  },
  {
    slug: "igad-and-the-limits-of-regional-mediation",
    headline: "IGAD and the Limits of Regional Mediation",
    deck: "The Horn's own regional body has mediated some of Africa's hardest conflicts. Its structural weakness is that its members are frequently parties to them.",
    body: `The Intergovernmental Authority on Development began in 1986 as a drought and desertification body and was reconstituted in 1996 with a broader mandate covering peace and security. Its members are Djibouti, Ethiopia, Kenya, Somalia, South Sudan, Sudan, Uganda and Eritrea, whose participation has been intermittent. The secretariat is in Djibouti.

IGAD's record includes serious achievements. It mediated the process that produced the 2005 Comprehensive Peace Agreement in Sudan, which led to South Sudanese independence, and it convened the conferences that produced Somalia's transitional institutions.

The structural weakness is straightforward. A regional body composed of the region's own governments struggles to mediate disputes in which those governments are parties. When a member state is a protagonist, IGAD's leverage falls to whatever its other members are willing to apply, and they are frequently unwilling.

Consensus decision-making compounds this. Any member can slow a process it dislikes, and Eritrea's on-and-off participation has meant that some of the region's hardest questions were addressed in a forum from which one of the interested parties was absent.

The African Union operates at a different level, and Addis Ababa's position as AU headquarters gives Ethiopia a standing role in continental diplomacy that its neighbours do not have. In practice much Horn mediation has migrated to bilateral channels and to outside actors in the Gulf, Turkey and the West.

What IGAD does well is technical and unglamorous: drought early warning, livestock disease surveillance, cross-border pastoral agreements. That work rarely makes headlines and is arguably where the body's comparative advantage actually lies.`,
    countries: ["djibouti", "ethiopia", "somalia", "eritrea"],
    category: "explained",
    subcategory: "background",
    author: "meron-tesfaye",
    topics: ["igad", "diplomacy", "african-union"],
    imageCaption: "The Horn's regional diplomacy runs through a small number of institutions.",
    daysAgo: 5,
    readMinutes: 6,
    views: 870,
  },
  {
    slug: "red-sea-shipping-disruption-reaches-horn-ports",
    headline: "Red Sea Shipping Disruption Reaches Horn Ports",
    deck: "Carriers rerouting around southern Africa change the economics of every terminal between Massawa and Mogadishu.",
    body: `Disruption to Red Sea shipping affects the Horn twice over: once as a transit region whose ports lose calls, and once as an import-dependent region whose landed costs rise.

The first effect is direct. When container lines divert from the Suez route to the Cape of Good Hope, they bypass the Bab el-Mandeb entirely. Ports positioned to serve that lane lose transhipment volume, and the feeder services that connect smaller regional terminals to the main line become harder to sustain.

The second effect reaches further inland. A longer voyage means more days at sea, higher fuel consumption, higher crew cost and higher war-risk insurance. Those costs are passed into freight rates, and freight rates feed into the price of imported wheat, rice, fuel, fertiliser, medicine and construction material.

For the Horn this matters more than it would elsewhere. All four countries are net food importers to varying degrees, and none has the fiscal space to absorb a sustained increase in import costs without it reaching household prices.

There is a countervailing effect for some operators. Naval deployments to the region increase demand for bunkering, resupply and port services, and Djibouti in particular has long provided them.

[Editor: confirm current carrier routing policy and regional freight-rate movement before adding figures.]`,
    countries: ["djibouti", "eritrea", "somalia"],
    category: "business",
    subcategory: "ports",
    author: "ismail-houmed",
    topics: ["red-sea", "shipping", "trade", "ports"],
    imageCaption: "A container vessel in the Gulf of Aden approaching the Bab el-Mandeb.",
    daysAgo: 6,
    readMinutes: 5,
    views: 940,
  },

  // ---------------------------------------------------------------------
  // SOMALIA
  // ---------------------------------------------------------------------
  {
    slug: "president-meets-regional-leaders-ankara",
    headline: "Somali President Meets Regional Leaders for Talks in Ankara",
    deck: "Turkey has become one of Somalia's most consequential external partners, with interests spanning port management, military training and reconstruction.",
    body: `Somali leaders have held talks in Ankara, continuing a relationship that has become one of the country's most significant external partnerships over the past decade.

Turkey's engagement in Somalia dates to 2011, when Ankara made a high-profile intervention during the famine of that year at a point when few governments maintained a presence in Mogadishu. What began as humanitarian assistance developed into a broad relationship spanning infrastructure, education, health and defence.

The commercial dimension is substantial. A Turkish operator has managed Mogadishu's port under concession, and Turkish firms have been involved in the capital's airport and in road and hospital construction. Turkey also operates a military training facility in Mogadishu, its largest such installation outside its own territory, which has trained a significant portion of the Somali National Army's officer corps.

Ankara has also acted as a mediator. It has hosted talks between Somalia and Ethiopia at moments when the relationship was strained, and its position of relatively good relations with both governments has made it a usable channel when others were closed.

For Mogadishu the relationship offers investment and training without the conditionality attached to some Western assistance. For Ankara it offers strategic presence on the Gulf of Aden and a commercial foothold in a market with substantial reconstruction requirements.

[Editor: confirm participants, agenda and outcomes before publication.]`,
    country: "somalia",
    region: "mogadishu",
    countries: ["somalia"],
    category: "politics",
    subcategory: "diplomacy",
    author: "amina-warsame",
    topics: ["diplomacy", "investment", "ports"],
    imageCaption: "Somali and Turkish officials during talks in Ankara.",
    placement: "COUNTRY_LEAD",
    daysAgo: 0,
    hoursAgo: 11,
    readMinutes: 5,
    views: 1610,
  },
  {
    slug: "mogadishu-port-operations-increase",
    headline: "Mogadishu Port Operations Increase as Throughput Grows",
    deck: "The capital's port handles the largest share of Somali imports, and its performance sets the price of goods across the south.",
    body: `Mogadishu's port continues to handle the largest share of Somalia's imports, and changes in its throughput are felt quickly in market prices across the southern regions.

The port has been under concession management since 2014, and the arrangement brought equipment renewal, systematic revenue collection and digital customs processing to a facility that had operated informally for much of the preceding two decades. Port revenue is one of the federal government's most important domestic income streams, which makes throughput a fiscal question as well as a commercial one.

Somalia's port system is not centralised. Bosaso in Puntland serves the north-east and is a major livestock export point for Gulf markets. Kismayo serves Jubaland and the Juba valley. Berbera, in Somaliland, has received significant terminal investment. Each serves a distinct hinterland, and the balance between them is a live political question in a federal system where revenue-sharing between the centre and the member states is unsettled.

The import mix reflects the structure of the economy. Food, fuel, construction material and consumer goods dominate inbound volume. Outbound volume is much smaller and is concentrated in livestock, hides, charcoal â€” the export of which is subject to a UN ban â€” and fisheries.

Fisheries are the most underdeveloped category relative to potential. Somalia's coastline is the longest in mainland Africa and its waters are productive, but cold-chain infrastructure, processing capacity and licensing enforcement all remain limited.

[Editor: confirm current throughput figures with the port authority before publication.]`,
    country: "somalia",
    region: "mogadishu",
    category: "business",
    subcategory: "ports",
    author: "amina-warsame",
    topics: ["ports", "trade", "livestock", "fisheries"],
    imageCaption: "Cargo handling at the port of Mogadishu.",
    daysAgo: 1,
    readMinutes: 5,
    views: 780,
  },
  {
    slug: "galmudug-launches-new-development-plan",
    headline: "Galmudug Launches New Development Plan",
    deck: "The central state sets out priorities across water, roads, health and education, in a region where the administration is younger than most of its problems.",
    body: `Galmudug has set out a development plan covering water infrastructure, roads, health facilities and schools, in a region where state institutions are still being built alongside the services they are meant to deliver.

Galmudug was formed in 2006 and is one of Somalia's federal member states, with Dhusamareb as its administrative seat. Its territory covers the Mudug and Galgaduud regions in central Somalia, an area of rangeland and small towns where livestock herding is the dominant livelihood.

Water is the first priority in any central Somali development plan, and for structural reasons. Rainfall is low and variable, surface water is scarce away from the rivers, and boreholes and berkads determine where herds and people can go during dry seasons. Water infrastructure is therefore not a social service in this context so much as the basic condition of economic activity.

Roads matter for a related reason. Livestock reaching export markets, and food aid reaching settlements, both depend on routes that are passable in the rainy season. Much of the region's road network is unsurfaced.

The financing question sits underneath all of it. Federal member states in Somalia have limited independent revenue, and the division of revenue between the federal government and the states is among the most contested items in the country's unfinished constitutional settlement.

[Editor: confirm the plan's budget, timeframe and funding sources before publication.]`,
    country: "somalia",
    region: "galmudug",
    category: "economy",
    subcategory: "development",
    author: "amina-warsame",
    topics: ["infrastructure", "drought", "livestock"],
    imageCaption: "Water infrastructure in central Somalia.",
    daysAgo: 2,
    readMinutes: 4,
    views: 520,
  },
  {
    slug: "somali-startups-attract-record-investment",
    headline: "Somali Startups Attract Growing Investment Interest",
    deck: "A mobile money system with unusually deep penetration has given Somali founders an infrastructure layer that many larger African markets lack.",
    body: `Somalia's startup sector is drawing increasing investor attention, built on an unusual foundation: one of the world's most widely used mobile money systems, developed largely without a functioning central banking sector.

Mobile money in Somalia grew because it filled a vacuum. With the collapse of formal banking after 1991 and a currency that had ceased to be reliably issued, telecommunications operators built payment systems that became the country's de facto financial infrastructure. Cash transactions are now comparatively rare in urban areas, and payment by mobile is routine at every scale from street vendors to wholesalers.

That creates conditions founders in larger African markets often lack. A digital payment rail with deep penetration removes the single hardest problem for consumer internet businesses. Somali startups have built on it in logistics, e-commerce, ride-hailing, agricultural marketplaces, health services and education.

The diaspora is the second structural advantage. Remittances from Somalis abroad are among the largest sources of foreign exchange in the economy, and the same networks that move money also move capital, mentorship and returning founders.

The constraints are real. Access to formal credit is limited, contract enforcement is difficult, insurance markets are thin, and security costs are a permanent line item. Regulation is developing but incomplete, and the relationship between mobile money operators and the central bank is still being formalised.

[Editor: confirm current investment figures with named funds before publication.]`,
    country: "somalia",
    category: "business",
    subcategory: "startups",
    author: "dawit-bekele",
    topics: ["startups", "investment", "telecoms", "remittances", "diaspora"],
    imageCaption: "A mobile payment being made at a market stall in Somalia.",
    daysAgo: 2,
    readMinutes: 6,
    views: 1440,
  },
  {
    slug: "al-shabaab-attacks-repelled-middle-shabelle",
    headline: "Security Forces Report Operations in Middle Shabelle",
    deck: "The Shabelle valley has been contested for years. Reporting from it requires unusual caution.",
    body: `Somali security forces have reported operations in Middle Shabelle, part of the Hirshabelle federal member state along the Shabelle river north of Mogadishu.

The Shabelle valley has been among the most persistently contested areas in southern Somalia. Its agricultural land, its river crossings and its proximity to the capital have made it strategically significant to every party to the conflict since the early 1990s.

This newsroom applies a specific standard to security reporting in Somalia. Claims of territorial control, casualty counts and operational detail issued by any party â€” government, allied forces or armed groups â€” are not published as fact unless independently corroborated. Where corroboration is unavailable, the claim is attributed and its status made explicit.

That standard exists because the incentive to overstate is strong on all sides, independent access to contested districts is limited, and communications from affected areas are intermittent. Early reports from Somalia are frequently revised.

What can be stated without qualification is structural: control in the Shabelle valley has historically shifted between actors rather than settling, and district centres have changed hands more than once.

[Editor: this is a developing story. Do not add casualty figures or claims of territorial change without two independent sources.]`,
    country: "somalia",
    region: "hirshabelle",
    category: "security",
    subcategory: "militancy",
    author: "hodan-ali",
    topics: ["security-cooperation"],
    imageCaption: "The Shabelle river valley north of Mogadishu.",
    isDeveloping: true,
    sourceNote: "Based on official statements. Not independently verified.",
    daysAgo: 1,
    readMinutes: 4,
    views: 1290,
  },
  {
    slug: "puntland-fisheries-sector-development",
    headline: "Puntland Looks to Fisheries as a Growth Sector",
    deck: "Some of the most productive waters in the western Indian Ocean sit off a coastline with almost no processing capacity.",
    body: `Puntland is pursuing development of its fisheries sector, in waters that are among the most productive in the western Indian Ocean and among the least commercially exploited by the communities nearest to them.

The oceanography is favourable. Seasonal upwelling along the Somali coast brings nutrient-rich water to the surface, supporting large stocks of tuna, mackerel, snapper, lobster and shark. The Somali exclusive economic zone is correspondingly large.

The constraint has never been the resource. It is everything between the catch and the buyer. Cold-chain infrastructure is minimal, so fish landed in Bosaso or the smaller coastal settlements cannot reliably be kept at temperature until they reach a market. Processing capacity is limited. Certification for export to high-value markets requires traceability systems that mostly do not exist.

Illegal, unreported and unregulated fishing by foreign-flagged vessels has been a long-standing grievance along this coast, and was one of the stated motivations in the early piracy period of the late 2000s. Licensing and enforcement remain contested between federal and state authorities, which is itself a barrier to the investment that would make the sector viable.

The livelihood question runs alongside the commercial one. Coastal communities in Puntland have historically combined fishing with pastoralism, and drought that damages herds increases pressure on fisheries as a fallback.

[Editor: confirm current catch and licensing figures with the Puntland Ministry of Fisheries before publication.]`,
    country: "somalia",
    region: "puntland",
    category: "business",
    subcategory: "companies",
    author: "amina-warsame",
    topics: ["fisheries", "investment", "livestock"],
    imageCaption: "Fishing boats on the Puntland coast.",
    daysAgo: 4,
    readMinutes: 5,
    views: 640,
  },
  {
    slug: "somali-football-league-grows",
    headline: "Somali Football Rebuilds Around a New Generation",
    deck: "Stadiums that stood empty for two decades are hosting competitive football again.",
    body: `Competitive football is being rebuilt in Somalia around domestic league play and a national team drawing increasingly on diaspora talent.

The sport never disappeared, but organised competition did. Stadiums in Mogadishu were used for other purposes during the conflict years, and the infrastructure of league football â€” grounds, referees, travel between cities, fixture calendars â€” largely dissolved.

Reconstruction has been incremental. Mogadishu Stadium returned to sporting use after being vacated by military occupants, and the Somali Premier League has expanded its fixture programme. Attendance at derby matches in the capital has been substantial.

The national team's structure reflects the shape of the Somali population. Large communities in the United Kingdom, Sweden, Norway, the Netherlands, the United States and Canada have produced players developed in European academy systems, and the federation has actively recruited among them.

Two constraints persist. Facilities remain limited, with few pitches meeting the standard required to host competitive international fixtures, so home matches have frequently been played abroad. And security costs at mass-attendance events remain significant.

Basketball and athletics occupy smaller but genuine spaces, with women's basketball in particular having a longer continuous history in Mogadishu than is generally recognised.`,
    country: "somalia",
    region: "mogadishu",
    category: "sports",
    subcategory: "football",
    author: "yusuf-abdi",
    topics: ["football", "youth", "diaspora"],
    imageCaption: "A domestic league match in Mogadishu.",
    daysAgo: 3,
    readMinutes: 5,
    views: 980,
  },
  {
    slug: "somali-poetry-oral-tradition",
    headline: "The Somali Oral Tradition Meets the Recording Age",
    deck: "Somali has been called a nation of poets. The written alphabet arrived only in 1972.",
    body: `Somali poetry occupies a position in its culture that has few parallels. For most of its history the language had no official written script, and poetry served as the medium for history, law, argument, courtship, negotiation and news.

The formal structures are demanding. The gabay, the most prestigious form, uses long lines with strict alliteration sustained across an entire composition â€” every line carrying the same initial consonant. The geeraar and the jiifto are shorter forms with their own metres and occasions. Composition is oral, memorisation is exact, and transmission is by performance.

Poetry has also been political. Verse has been used to conduct disputes between clans, to argue for and against colonial administrations, and to mobilise opinion. The early-twentieth-century anti-colonial leader Sayyid Mohammed Abdullah Hassan is remembered as much for his verse as for his campaigns.

An official Latin-based orthography for Somali was adopted in 1972, and a mass literacy campaign followed. That transition changed the relationship between composition and record: poems that had existed only in memory could be fixed on a page, and a written literature began to develop alongside the oral one.

Recording changed it again. Cassette tapes circulated poetry through the diaspora during the conflict years, and the internet has since made a vast body of recorded performance searchable. Younger poets work in both registers, and the classical forms are still composed and still judged by the old standards.`,
    country: "somalia",
    category: "culture",
    subcategory: "literature",
    author: "senait-ghebre",
    topics: ["heritage", "diaspora"],
    imageCaption: "Somali poetry has been transmitted by performance for centuries.",
    daysAgo: 5,
    readMinutes: 6,
    views: 720,
  },
  {
    slug: "somaliland-berbera-corridor",
    headline: "Berbera and the Corridor to Eastern Ethiopia",
    deck: "Terminal investment has made Berbera a serious port. Its political status keeps its commercial future unsettled.",
    body: `Berbera sits on the Gulf of Aden in Somaliland, and has been developed with substantial terminal and corridor investment aimed at serving eastern Ethiopia.

The geography is genuinely competitive. Berbera is closer to parts of eastern Ethiopia than Djibouti is, and a corridor running inland toward Jigjiga and Dire Dawa would shorten the route for a meaningful share of Ethiopian trade. The port has natural depth and has been used for livestock export to Gulf markets for a very long time.

The complication is political rather than commercial. Somaliland declared independence in 1991 and has maintained separate institutions, its own currency and its own elections since. It is not recognised by any state, and the federal government in Mogadishu regards its territory as part of Somalia. Any agreement that treats Somaliland as a contracting party therefore runs directly into Somali sovereignty objections, and Ethiopian initiatives in this direction have produced sharp diplomatic reactions.

Livestock remains Berbera's established business. The port has long been a principal export point for sheep, goats and camels to Saudi Arabia and the Gulf, particularly around the Hajj season, and that trade depends on holding grounds and veterinary certification rather than container cranes.

For the corridor to reach its stated potential, three things have to hold at once: the terminal must operate reliably, the inland road must be completed and maintained, and the political arrangement must be stable enough for shippers to commit. The third has been the hardest.`,
    country: "somalia",
    region: "somaliland",
    countries: ["somalia", "ethiopia"],
    category: "business",
    subcategory: "ports",
    author: "amina-warsame",
    topics: ["ports", "trade", "livestock", "infrastructure"],
    imageCaption: "The port of Berbera on the Gulf of Aden.",
    daysAgo: 6,
    readMinutes: 6,
    views: 1080,
  },

  // ---------------------------------------------------------------------
  // ETHIOPIA
  // ---------------------------------------------------------------------
  {
    slug: "parliament-passes-new-investment-law",
    headline: "Ethiopia's Parliament Passes New Investment Legislation",
    deck: "Sectors closed to foreign participation for decades are being opened in stages, as Addis Ababa pursues foreign exchange.",
    body: `Ethiopia's parliament has passed investment legislation continuing a programme of opening sectors that were closed to foreign participation for most of the past three decades.

The context is a state-led development model now under revision. Ethiopia's growth through the 2000s and 2010s was driven substantially by public investment in infrastructure â€” roads, rail, hydropower, industrial parks â€” financed by external borrowing and directed credit. Telecommunications, banking, logistics and retail were reserved for domestic and state operators.

That model produced sustained high growth and left two problems: an external debt burden requiring restructuring, and a chronic shortage of foreign exchange. Opening reserved sectors is aimed principally at the second.

Telecommunications came first. A second operator licence was issued and the market opened to competition after decades of state monopoly, and mobile money followed. Banking has been the more contested step, with the sector opened to foreign entry in stages. Logistics, previously subject to a state monopoly on multimodal freight, has been progressively liberalised.

The macroeconomic backdrop matters for how these measures land. Ethiopia has been through debt restructuring under the G20 Common Framework and has moved on exchange-rate policy, with significant consequences for import prices and for firms holding foreign-currency obligations.

The domestic argument is not settled. Opening banking and telecoms to foreign entry is contested by those who see the state-led model as the source of Ethiopia's growth record, and supported by those who see the foreign-exchange constraint as binding.

[Editor: confirm the bill's title, provisions and vote before publication.]`,
    country: "ethiopia",
    region: "addis-ababa",
    category: "politics",
    subcategory: "parliament",
    author: "dawit-bekele",
    topics: ["investment", "banking", "telecoms", "trade"],
    imageCaption: "The Ethiopian parliament building in Addis Ababa.",
    placement: "COUNTRY_LEAD",
    daysAgo: 0,
    hoursAgo: 14,
    readMinutes: 6,
    views: 1730,
  },
  {
    slug: "ethiopia-economy-grows-official-data",
    headline: "Ethiopia's Economy Posts Continued Growth, Official Data Shows",
    deck: "Headline growth has stayed high for two decades. The harder questions are inflation, foreign exchange and debt.",
    body: `Ethiopia has recorded continued economic growth according to official data, sustaining a run of high headline figures that stretches back roughly two decades.

The composition of that growth has shifted. Agriculture still employs the largest share of the workforce, with coffee the most significant export crop alongside oilseeds, pulses, khat and cut flowers. But services â€” telecommunications, aviation, banking, construction â€” have grown faster, and Ethiopian Airlines is among the continent's largest carriers and a substantial foreign-exchange earner in its own right.

Manufacturing has been the target of deliberate policy. A network of industrial parks was built to attract textile and garment production, with the intention of moving Ethiopia into export manufacturing as costs rose in Asia. Results have been mixed, constrained by logistics costs, power reliability and, in some periods, by the loss of preferential trade access.

Three pressures sit underneath the headline number. Inflation has been persistently high, with food price inflation heaviest on urban households. Foreign exchange has been chronically scarce, constraining importers and firms servicing foreign-currency debt. And external debt required restructuring under the G20 Common Framework.

The Grand Ethiopian Renaissance Dam is central to the medium-term picture. Financed substantially domestically, it is the largest hydroelectric project in Africa and is intended both to address domestic supply and to make Ethiopia a regional power exporter â€” a genuine foreign-exchange source that does not depend on commodity prices.

[Editor: confirm the current growth rate, inflation figure and reporting period with the statistics service before publication.]`,
    country: "ethiopia",
    category: "economy",
    subcategory: "gdp",
    author: "dawit-bekele",
    topics: ["investment", "energy", "gerd", "trade"],
    imageCaption: "Construction and commerce in Addis Ababa.",
    daysAgo: 1,
    readMinutes: 6,
    views: 2050,
  },
  {
    slug: "addis-ababa-light-rail-expansion",
    headline: "Addis Ababa Light Rail Expansion Moves Forward",
    deck: "Sub-Saharan Africa's first light rail system faces the maintenance problem common to every transit network of its age.",
    body: `Plans to expand Addis Ababa's light rail network are moving forward, more than a decade after the system opened as the first of its kind in sub-Saharan Africa.

The network opened in 2015 with two lines, northâ€“south and eastâ€“west, crossing near the city centre. It was built to address congestion in a capital whose population growth had far outpaced its road network, and fares were set low enough to serve commuters on modest incomes.

The system's operating history illustrates a pattern common to transit projects across the region. Construction was completed on schedule with external financing and contracting. Sustaining operations proved harder. Vehicle availability fell as maintenance requirements accumulated, spare parts required foreign exchange that was in short supply, and headways lengthened.

Expansion therefore poses a question about sequencing: whether to extend the network or to restore the reliability of what exists. The two compete for the same maintenance capacity and the same foreign currency.

Addis Ababa's wider transport picture includes a bus rapid transit corridor and a large informal minibus sector that carries a substantial share of daily trips. Any assessment of the light rail's contribution has to account for how it connects to that network.

[Editor: confirm the expansion's route, financing and timeline before publication.]`,
    country: "ethiopia",
    region: "addis-ababa",
    category: "business",
    subcategory: "infrastructure",
    author: "dawit-bekele",
    topics: ["infrastructure", "railway"],
    imageCaption: "A light rail train in Addis Ababa.",
    daysAgo: 2,
    readMinutes: 5,
    views: 890,
  },
  {
    slug: "tigray-peace-agreement-progress",
    headline: "Tigray Transition Continues Under Cessation-of-Hostilities Framework",
    deck: "The 2022 agreement ended the fighting. Implementation has been slower than the text envisaged.",
    body: `The transition in Tigray continues under the framework established by the cessation-of-hostilities agreement signed in Pretoria in November 2022, which ended two years of conflict in northern Ethiopia.

The agreement was mediated under African Union auspices and provided for the cessation of hostilities, disarmament of Tigrayan forces, restoration of federal authority and services, unhindered humanitarian access, and accountability measures. An interim regional administration was subsequently established.

Implementation has been uneven. Restoration of basic services â€” electricity, telecommunications, banking, flights â€” proceeded following the agreement. Other provisions have moved more slowly. Disarmament and reintegration of combatants is a long process requiring resources. Large numbers of people remain displaced. And areas whose administration is disputed, including parts of western Tigray, remain unresolved.

The humanitarian consequences of the conflict period were severe, and recovery in health, education and agriculture is measured in years rather than months. Health facilities were extensively damaged and agricultural cycles were missed.

Accountability remains the most contested element. Investigations have been conducted at various levels, and the question of what mechanism will address serious violations documented during the conflict has not been settled.

This newsroom reports on Tigray using verified documentation and named institutional sources. Casualty estimates from the conflict period vary widely between sources and are reported with attribution and the methodology behind them, never as settled fact.`,
    country: "ethiopia",
    region: "tigray",
    category: "politics",
    subcategory: "government",
    author: "hodan-ali",
    topics: ["diplomacy", "african-union", "peacekeeping"],
    imageCaption: "Reconstruction under way in northern Ethiopia.",
    sourceNote: "Reported from official documentation and institutional sources.",
    daysAgo: 3,
    readMinutes: 6,
    views: 1620,
  },
  {
    slug: "ethiopia-nationwide-tree-planting",
    headline: "Ethiopia Continues Nationwide Tree Planting Campaign",
    deck: "One of the world's largest reforestation programmes by seedling count. Survival rates are the number that matters.",
    body: `Ethiopia is continuing its national tree-planting campaign, among the largest reforestation efforts anywhere by number of seedlings planted.

The programme responds to a real problem. Ethiopia's highland forest cover declined substantially over the twentieth century under pressure from agricultural expansion, fuelwood demand and construction timber. The consequences show up as soil erosion on steep highland slopes, sedimentation in reservoirs, and reduced water retention in catchments that feed both domestic supply and the Blue Nile.

The campaign has planted very large numbers of seedlings in mass mobilisation events, with public participation across regions. Seedling counts are the figure most often reported.

Survival rate is the figure that determines outcome. Planting a seedling and establishing a tree are different achievements, and the gap between them depends on species selection, site matching, rainfall in the first two seasons, protection from grazing, and follow-up care. Independent assessment of survival rates across large-scale campaigns is methodologically difficult, and estimates vary.

Species choice carries a long-term consequence. Fast-growing exotics such as eucalyptus establish quickly and provide usable timber and fuelwood, but have high water demand and limited biodiversity value. Indigenous highland species support more ecological function and establish more slowly.

[Editor: confirm current campaign figures and any published survival assessments before publication.]`,
    country: "ethiopia",
    category: "society",
    subcategory: "community",
    author: "meron-tesfaye",
    topics: ["climate", "nile"],
    imageCaption: "Seedlings prepared for planting in the Ethiopian highlands.",
    daysAgo: 4,
    readMinutes: 5,
    views: 760,
  },
  {
    slug: "gerd-and-the-nile-question",
    headline: "The Grand Ethiopian Renaissance Dam and the Nile Question, Explained",
    deck: "Africa's largest hydroelectric project sits on a river that three countries depend on. Here is what is actually in dispute.",
    body: `**What it is.** The Grand Ethiopian Renaissance Dam sits on the Blue Nile in Benishangul-Gumuz, near the Sudanese border. It is the largest hydroelectric project in Africa. Construction began in 2011 and was financed substantially through domestic sources including public bond purchases, which gave the project unusual political significance inside Ethiopia.

**Why the Blue Nile.** The Nile has two main tributaries. The White Nile rises in the Great Lakes region. The Blue Nile rises at Lake Tana in Ethiopia. The Blue Nile contributes the majority of the Nile's total flow measured at Khartoum, and a larger share still during the flood season. What Ethiopia does with the Blue Nile therefore affects Sudan and Egypt directly.

**What Ethiopia's position is.** The dam generates electricity; it does not consume water. Water passing through turbines continues downstream. Ethiopia argues it has a sovereign right to develop a resource rising in its own territory, that domestic electricity access remains a development priority, and that power exports serve the wider region.

**What Egypt's position is.** Egypt depends on the Nile for the overwhelming majority of its fresh water and has very little rainfall of its own. Its concern is not the dam's existence but its operation: how quickly the reservoir fills, and how releases are managed during multi-year droughts. Egypt has sought a binding agreement on drought-period operation.

**What Sudan's position is.** Sudan sits between the two and holds a mixed interest. Regulated flow reduces the seasonal flooding that has damaged Sudanese infrastructure, and steadier flow benefits Sudanese irrigation and its own dams. But Sudan wants operational data and coordination, given that its facilities are immediately downstream.

**What is actually disputed.** Not whether the dam exists â€” it does, and has been generating. The dispute is legal and operational: whether the filling and long-term operation are governed by a binding agreement or by Ethiopian discretion, and how a prolonged drought would be handled. Negotiations under various mediators have not produced a binding instrument.

**The colonial-era overhang.** Egypt and Sudan cite agreements from 1929 and 1959 that allocated Nile waters between them. Ethiopia was not a party to either and does not accept that they bind it. That disagreement about the applicable legal framework underlies much of the rest.`,
    country: "ethiopia",
    countries: ["ethiopia"],
    category: "explained",
    subcategory: "background",
    author: "meron-tesfaye",
    topics: ["gerd", "nile", "energy", "diplomacy", "climate"],
    imageCaption: "The Blue Nile, which contributes the majority of the Nile's flow.",
    daysAgo: 7,
    readMinutes: 8,
    views: 2680,
  },
  {
    slug: "ethiopian-athletics-distance-running",
    headline: "Ethiopian Distance Running and the System Behind It",
    deck: "The medals are the visible part. The structure underneath is a national development pathway few countries match.",
    body: `Ethiopian distance running has produced Olympic and world champions across six decades, and the results rest on a development system rather than on individual talent alone.

The lineage is well documented. Abebe Bikila won the Olympic marathon in Rome in 1960 running barefoot, and won again in Tokyo in 1964. Miruts Yifter took the 5,000 and 10,000 metres double in Moscow in 1980. Haile Gebrselassie won successive Olympic 10,000-metre titles and set world records across a range of distances. Kenenisa Bekele dominated the 5,000 and 10,000 metres for a decade. Tirunesh Dibaba, Derartu Tulu, Meseret Defar and Almaz Ayana carried the same record on the women's side, and Tulu's 10,000-metre gold in Barcelona in 1992 was the first Olympic title won by a Black African woman.

Altitude is the most cited factor. Much of the Ethiopian highlands sits between two and three thousand metres, and the physiological adaptations of living and training at that elevation are well established in sports science.

Altitude alone does not explain it, since many places are high and few produce this record. The additional factors are structural: an active club system linked to institutions and employers, a competitive domestic calendar producing depth of competition, established training groups, and coaching that transmits accumulated method. Running is also a visible route to economic mobility, which sustains participation.

Marathon running has become the economic centre of the sport. Prize money and appearance fees at major international marathons substantially exceed what track competition offers, and athlete career paths increasingly move from track to road.`,
    country: "ethiopia",
    category: "sports",
    subcategory: "athletics",
    author: "yusuf-abdi",
    topics: ["athletics", "youth"],
    imageCaption: "Distance runners training in the Ethiopian highlands.",
    daysAgo: 5,
    readMinutes: 6,
    views: 1410,
  },
  {
    slug: "ethiopian-coffee-origin-and-trade",
    headline: "Coffee, Ethiopia's Oldest Export and Its Most Complicated One",
    deck: "The plant originated here. Capturing value from it remains the hard part.",
    body: `Coffee arabica originated in the forests of south-western Ethiopia, and coffee remains the country's most significant export crop and the livelihood of a very large number of smallholder households.

The production system is unusual. Much Ethiopian coffee grows in garden plots, semi-forest and forest conditions rather than on plantations, under shade and frequently without chemical inputs. That produces the varietal diversity â€” Yirgacheffe, Sidamo, Harar, Guji, Limu, Jimma â€” that specialty buyers pay premiums for, and it also means production is fragmented across a very large number of small producers.

Domestic consumption is high by producing-country standards. A substantial share of the crop is consumed inside Ethiopia, where coffee preparation is a social institution rather than simply a beverage. This gives Ethiopian producers a domestic market floor most origin countries lack.

The value-capture problem is the persistent one. Most Ethiopian coffee leaves the country green and unroasted, meaning the roasting, branding and retail margins accrue elsewhere. Efforts to move up the chain have included trademarking regional names and building domestic roasting capacity, with partial results.

Climate change is the medium-term risk. Arabica has a narrow optimal temperature range, and modelling of warming in Ethiopian growing areas suggests suitable altitude bands will shift upward. Adaptation means moving production higher where land allows, and changing varieties and shade management where it does not.

[Editor: confirm current export volume and value with the coffee authority before publication.]`,
    country: "ethiopia",
    region: "sidama",
    category: "business",
    subcategory: "trade",
    author: "dawit-bekele",
    topics: ["trade", "climate", "investment"],
    imageCaption: "Coffee cherries drying at a washing station in southern Ethiopia.",
    daysAgo: 6,
    readMinutes: 6,
    views: 1150,
  },

  // ---------------------------------------------------------------------
  // DJIBOUTI
  // ---------------------------------------------------------------------
  {
    slug: "new-port-expansion-boost-trade",
    headline: "Port Expansion Aims to Lift Regional Trade Volumes",
    deck: "Djibouti's port complex is several facilities rather than one, and each serves a different segment of the corridor.",
    body: `Djibouti's port expansion programme continues to develop a complex that has grown from a single general-cargo harbour into a set of specialised facilities.

The components serve distinct traffic. The Doraleh container terminal handles containerised cargo. A multipurpose port handles break-bulk and vehicles. An oil terminal handles petroleum products, including fuel destined for Ethiopia. Specialised facilities at Tadjourah and Goubet were built for potash export from the Ethiopian side of the Danakil and for salt. A livestock export terminal handles animals bound for Gulf markets.

That specialisation matters commercially. Livestock, potash, containers and fuel require different infrastructure, different handling and different dwell arrangements, and mixing them in a single facility degrades performance for all of them.

Rail is the corridor's other half. The electrified standard-gauge line between Addis Ababa and Djibouti opened to commercial traffic in 2018, replacing a metre-gauge railway dating to the colonial era. Rail shifts freight off a road corridor that carries heavy truck traffic, and its utilisation rate is one of the corridor's key performance indicators.

The free zone adds a second business line. Warehousing, light assembly and re-export operations allow Djibouti to capture value beyond transit fees, and the same strategic position that makes the country a transit point also makes it attractive for regional distribution.

[Editor: confirm project value, phasing and financing before publication.]`,
    country: "djibouti",
    region: "djibouti-city",
    category: "business",
    subcategory: "ports",
    author: "ismail-houmed",
    topics: ["ports", "trade", "infrastructure", "railway", "livestock"],
    imageCaption: "The container terminal at Doraleh.",
    placement: "COUNTRY_LEAD",
    daysAgo: 0,
    hoursAgo: 16,
    readMinutes: 5,
    views: 830,
  },
  {
    slug: "djibouti-regional-digital-hub",
    headline: "Djibouti Positions Itself as a Regional Digital Hub",
    deck: "The same geography that makes the country a shipping chokepoint makes it a landing point for submarine cable.",
    body: `Djibouti is pursuing a position as a regional digital hub, built on an asset that follows directly from its geography: submarine cable landings.

The logic mirrors the shipping story. Submarine fibre-optic cables connecting Europe, the Middle East, Asia and East Africa run through the Red Sea and the Bab el-Mandeb, and Djibouti sits where they pass. Multiple international cable systems land there, making it one of the most connected points on the African continent by international bandwidth available.

That creates two commercial opportunities. The first is transit: carrying traffic for landlocked neighbours, principally Ethiopia, which reaches the internet substantially through Djibouti. The second is hosting: data centres located at a cable landing point offer lower latency to the systems that pass through it.

The vulnerability is the same as the shipping vulnerability. Cables in a narrow, shallow, heavily trafficked strait are exposed to anchor damage and to deliberate interference, and cable faults in the Red Sea have disrupted connectivity across East Africa on more than one occasion. Route diversity is the mitigation, and it is expensive.

Power is the binding constraint on the data centre ambition. Data centres need continuous, affordable electricity, and Djibouti's own generation is limited. Imported Ethiopian hydropower and domestic renewable development â€” geothermal potential in the Rift, wind and solar â€” are the routes under development.

[Editor: confirm current cable systems, data centre capacity and power arrangements before publication.]`,
    country: "djibouti",
    region: "djibouti-city",
    category: "business",
    subcategory: "telecommunications",
    author: "ismail-houmed",
    topics: ["telecoms", "infrastructure", "energy", "investment"],
    imageCaption: "Submarine cable infrastructure at a landing station.",
    daysAgo: 1,
    readMinutes: 5,
    views: 1290,
  },
  {
    slug: "djibouti-airlines-new-aircraft",
    headline: "Djibouti Expands Its Aviation Capacity",
    deck: "Air links matter disproportionately for a small state whose economy is built on being a connection point.",
    body: `Djibouti is expanding its aviation capacity, in a market where air links carry weight beyond passenger numbers.

Aviation serves three distinct functions for the country. It connects a small population to regional and international destinations. It supports the diplomatic, military and commercial presence that the country's strategic position attracts. And it provides air cargo capacity for time-sensitive freight moving to and from the Ethiopian interior.

The competitive environment is demanding. Ethiopian Airlines operates one of Africa's largest networks with a major hub at Addis Ababa, and Gulf carriers connect the region to global networks through their own hubs. A Djiboutian operator competes against both.

Airport infrastructure is the enabling piece. Djiboutiâ€“Ambouli International serves both civil and military traffic, and capacity expansion has been under discussion for an extended period.

Air cargo has a specific regional role. Perishable exports â€” livestock for certain markets, fish, horticultural produce â€” and high-value imports move by air where sea transit times are too long, and cargo capacity is therefore part of the same logistics proposition as the ports.

[Editor: confirm aircraft type, quantity and delivery schedule before publication.]`,
    country: "djibouti",
    region: "djibouti-city",
    category: "business",
    subcategory: "companies",
    author: "ismail-houmed",
    topics: ["aviation", "trade", "infrastructure"],
    imageCaption: "Aircraft at Djiboutiâ€“Ambouli International Airport.",
    daysAgo: 2,
    readMinutes: 4,
    views: 610,
  },
  {
    slug: "djibouti-free-zone-attracts-companies",
    headline: "Djibouti's Free Zone Attracts Regional Distribution Business",
    deck: "The free zone is the mechanism by which a transit country tries to become a destination.",
    body: `Djibouti's free zone continues to attract regional distribution and light processing operations, part of a strategy to capture value from cargo rather than merely charging it to pass through.

The distinction matters for a transit economy. A container that is unloaded, stored, re-packed and re-exported generates warehousing revenue, employment and services. A container that passes straight through generates a handling fee. The free zone exists to convert more of the second into the first.

The offer is standard for such zones â€” customs exemptions on goods not entering the domestic market, simplified company formation, foreign ownership, and repatriation of profits â€” with the differentiator being location. A distributor serving Ethiopia, South Sudan, Somalia and the wider region can hold stock at the point where the shipping lane meets the corridor.

Employment is the domestic political test. Djibouti's population is small and largely urban, and unemployment, particularly among young people, has been a persistent concern. Zones that generate warehousing throughput without generating jobs face criticism, and the value of a zone to the country depends on how much of the activity is labour-absorbing.

Competition is regional. Free zones and logistics hubs operate elsewhere on the Red Sea and in the Gulf, and the segments Djibouti can realistically win are those where proximity to the Ethiopian market is the decisive factor.

[Editor: confirm current tenant numbers and investment figures with the free zone authority before publication.]`,
    country: "djibouti",
    region: "djibouti-city",
    category: "business",
    subcategory: "investment",
    author: "ismail-houmed",
    topics: ["trade", "investment", "infrastructure"],
    imageCaption: "Warehousing in Djibouti's free zone.",
    daysAgo: 3,
    readMinutes: 4,
    views: 540,
  },
  {
    slug: "djibouti-geothermal-energy-potential",
    headline: "Djibouti's Geothermal Potential and the Cost of Power",
    deck: "A country sitting on a rift valley imports much of its electricity. The geology says it should not have to.",
    body: `Djibouti has substantial geothermal potential and has historically imported a significant share of its electricity, a mismatch rooted in the difficulty and cost of geothermal development rather than in the resource itself.

The geology is favourable. Djibouti sits at the junction of three tectonic plates in the Afar triple junction, one of the most volcanically active regions on earth, where the East African Rift meets the Red Sea and Gulf of Aden rifts. Lake Assal, at 155 metres below sea level, is the lowest point in Africa. Areas around Lake Assal, Fiale and Hanle have been investigated for geothermal development over several decades.

The obstacle is exploration risk. Geothermal requires drilling deep wells before anyone knows whether a field is commercially productive. Those wells are expensive, and a dry hole is a total loss. Private capital is reluctant to carry that risk, and concessional finance for exploration is therefore usually the precondition for development.

The alternative supply has been imported Ethiopian hydropower, delivered over an interconnection, plus domestic thermal generation running on imported fuel. Both have drawbacks: the first creates dependency on a neighbour's grid and hydrology, the second is expensive and exposed to fuel prices.

Solar and wind resources are also strong, with high irradiation and consistent coastal wind. Their intermittency makes them complementary to, rather than a substitute for, the baseload that geothermal would provide.

The stakes are larger than domestic supply. Reliable, affordable power is the precondition for the data centre ambition and for any industrial activity in the free zone.`,
    country: "djibouti",
    region: "dikhil",
    category: "business",
    subcategory: "energy",
    author: "ismail-houmed",
    topics: ["energy", "investment", "infrastructure", "climate"],
    imageCaption: "The volcanic landscape around Lake Assal.",
    daysAgo: 5,
    readMinutes: 5,
    views: 690,
  },
  {
    slug: "djibouti-migration-route-obock",
    headline: "Obock and the Eastern Migration Route",
    deck: "One of the world's busiest irregular migration corridors runs from the Horn toward the Gulf, and much of it passes through northern Djibouti.",
    body: `The eastern migration route carries very large numbers of people each year from the Horn of Africa across the Gulf of Aden and the Red Sea toward Yemen and onward to Saudi Arabia and the Gulf states. Obock, on Djibouti's north-eastern coast facing the Bab el-Mandeb, is one of its principal departure points.

The route's structure is consistent. Most travellers are Ethiopian, with a smaller number of Somalis. They move overland through the Afar lowlands toward the coast, cross by boat, and continue through Yemen. The destination is overwhelmingly labour migration rather than asylum, and the driver is economic.

The dangers are documented by the international organisations that monitor the route. The overland leg crosses desert with limited water. The sea crossing is made in overloaded boats. Yemen is an active conflict zone, and migrants transiting it are exposed to detention, extortion and abuse. Deaths occur at every stage.

Djibouti's position is that of a transit state. It does not generate the migration and it is not the destination, but the flow passes through its territory and it carries the humanitarian and enforcement consequences.

There is a return flow as well. Significant numbers of migrants are deported from Saudi Arabia or return from Yemen, and returnees pass back through the same corridor, frequently in worse condition than when they left.

[Editor: obtain current route figures from IOM before adding numbers.]`,
    country: "djibouti",
    region: "obock",
    countries: ["djibouti", "ethiopia", "somalia"],
    category: "society",
    subcategory: "human-interest",
    author: "hodan-ali",
    topics: ["migration", "red-sea"],
    imageCaption: "The coast at Obock, facing the Bab el-Mandeb.",
    daysAgo: 4,
    readMinutes: 5,
    views: 980,
  },
  {
    slug: "djibouti-president-inaugurates-road",
    headline: "Djibouti Opens New Road Project",
    deck: "Road links between the capital and the interior regions carry both freight and the case for national cohesion.",
    body: `Djibouti has opened a new road project, part of a programme connecting the capital to interior regions where most of the country's territory but a minority of its population sits.

Djibouti's settlement pattern is heavily concentrated. A large majority of the population lives in Djibouti City, with the remainder distributed across Ali Sabieh, Dikhil, Tadjourah, Obock and Arta. That concentration means road investment serves two distinct purposes: moving freight on the Ethiopian corridor, and connecting interior communities to services concentrated in the capital.

The corridor roads carry heavy truck traffic and require correspondingly heavy construction and continual maintenance. Interior roads serve smaller volumes but have a larger relative effect on the communities they reach, determining access to health facilities, secondary schools and markets.

Terrain and climate make both expensive. The country is arid and volcanic, with steep escarpments between the coastal plain and the interior, and flash flooding during infrequent heavy rain damages unprotected roadbeds.

Rail complements rather than replaces road. The Addis Ababaâ€“Djibouti line carries bulk freight on the main corridor, while road carries the shorter and more dispersed movements that rail cannot serve.

[Editor: confirm the road's route, length, cost and financing before publication.]`,
    country: "djibouti",
    region: "tadjourah",
    category: "politics",
    subcategory: "government",
    author: "ismail-houmed",
    topics: ["infrastructure", "trade"],
    imageCaption: "A road through Djibouti's volcanic interior.",
    daysAgo: 6,
    readMinutes: 4,
    views: 420,
  },

  // ---------------------------------------------------------------------
  // ERITREA
  // ---------------------------------------------------------------------
  {
    slug: "independence-day-celebrated-nationwide",
    headline: "Eritrea Marks Independence Anniversary",
    deck: "Independence Day on 24 May commemorates the end of a thirty-year war and the founding of the state.",
    body: `Eritrea marks its independence anniversary on 24 May, commemorating the entry of the Eritrean People's Liberation Front into Asmara in 1991 and the formal establishment of the state in 1993.

The history behind the date is long. Eritrea was an Italian colony from the 1890s, came under British administration after the Second World War, and was federated with Ethiopia by United Nations resolution in 1952 with its own parliament and administration. The federation was dissolved in 1962 and Eritrea annexed as a province, which began the armed struggle.

The war lasted three decades and is among the longest in modern African history. It ended in 1991 with the fall of the Derg in Addis Ababa and the EPLF's entry into Asmara. A referendum in 1993 returned an overwhelming vote for independence, and Eritrea became a sovereign state on 24 May of that year.

The commemoration is observed in Eritrea and across a large diaspora in Europe, North America, the Middle East and neighbouring African states, with events organised by community associations.

The period since independence has been shaped by the 1998â€“2000 border war with Ethiopia and its long aftermath. National service, introduced in 1995, and its extension during and after that conflict, has been the subject of sustained international scrutiny and is among the most frequently cited factors in Eritrean emigration.

Asmara itself is part of what the anniversary marks. The capital's early-twentieth-century modernist architecture was inscribed on the UNESCO World Heritage list in 2017, recognising one of the most complete surviving ensembles of its kind.`,
    country: "eritrea",
    region: "asmara",
    category: "politics",
    subcategory: "government",
    author: "senait-ghebre",
    topics: ["heritage", "diaspora"],
    imageCaption: "Asmara, listed by UNESCO for its modernist architecture.",
    placement: "COUNTRY_LEAD",
    isBreaking: true,
    daysAgo: 0,
    hoursAgo: 20,
    readMinutes: 5,
    views: 1350,
  },
  {
    slug: "eritrea-renewable-energy-investment",
    headline: "Eritrea Invests in Renewable Energy for Off-Grid Communities",
    deck: "Solar mini-grids reach settlements that a national transmission network will not reach for years.",
    body: `Eritrea is developing renewable energy capacity with a focus on solar generation for communities outside the reach of the national grid.

The rationale is structural rather than environmental in the first instance. Eritrea's population is dispersed across highland and lowland terrain, and extending transmission to small, distant settlements costs more per household than the electricity delivered is worth. Decentralised solar generation with battery storage serves those settlements at a fraction of the capital cost.

The resource is strong. Eritrea has high solar irradiation across most of its territory and consistent wind along the Red Sea coast and in parts of the highlands, both well suited to distributed generation.

The applications that matter most are not domestic lighting. Water pumping is the largest single use case in arid areas, since a solar borehole pump changes what agriculture and livestock keeping are possible. Health facility refrigeration for vaccines is the second, and school electrification the third.

The constraints are maintenance and parts. Solar installations require servicing, inverters and batteries have finite lives, and replacement components require foreign exchange and a supply chain. Installations that are built without a maintenance model degrade within a few years, and this pattern is well documented across the region.

Eritrea's grid-connected generation has historically relied on imported fuel for thermal plants, which makes the foreign-exchange case for renewables straightforward.

[Editor: confirm installed capacity and project locations with the energy ministry before publication.]`,
    country: "eritrea",
    region: "anseba",
    category: "business",
    subcategory: "energy",
    author: "senait-ghebre",
    topics: ["energy", "climate", "infrastructure", "health"],
    imageCaption: "A solar installation serving a rural community in Eritrea.",
    daysAgo: 2,
    readMinutes: 5,
    views: 580,
  },
  {
    slug: "eritrea-mining-projects-economy",
    headline: "Mining Projects Anchor Eritrea's Export Economy",
    deck: "Gold, copper, zinc and potash in the Arabian-Nubian Shield make mining the country's principal source of foreign exchange.",
    body: `Mining is Eritrea's principal source of export earnings, drawing on mineral deposits in a geological province that has been worked for a very long time.

Eritrea sits within the Arabian-Nubian Shield, a Precambrian formation extending across the Red Sea into Saudi Arabia and Egypt and known for volcanogenic massive sulphide deposits containing gold, copper and zinc. Gold has been mined in the region since antiquity.

Modern development has centred on a small number of large projects, typically structured as joint ventures between foreign operators and the state mining corporation, with the state holding a substantial equity share. That structure gives the government direct participation in revenue and gives operators access to deposits.

Potash is the other significant category. The Danakil Depression, extending across the Eritrean and Ethiopian lowlands, contains large potash deposits formed by the evaporation of an ancient sea. Potash is a fertiliser input with global demand, and its development depends heavily on transport infrastructure, since the deposits are remote and the product is bulky and low-value per tonne.

The economic characteristics of mining explain both its appeal and its limits. It generates foreign exchange and government revenue at scale, which matters greatly for an economy with few other sources. It employs relatively few people. And it is exposed to commodity price cycles that the producing country does not control.

[Editor: confirm current production figures and operating projects before publication.]`,
    country: "eritrea",
    region: "gash-barka",
    category: "business",
    subcategory: "companies",
    author: "dawit-bekele",
    topics: ["investment", "trade", "infrastructure"],
    imageCaption: "Mining operations in western Eritrea.",
    daysAgo: 3,
    readMinutes: 5,
    views: 630,
  },
  {
    slug: "eritrea-tourism-strategy-heritage",
    headline: "Eritrea's Tourism Strategy Targets Heritage and the Red Sea Coast",
    deck: "Asmara's modernist architecture, the Dahlak archipelago and the ruins at Adulis are the assets. Access is the constraint.",
    body: `Eritrea is developing a tourism strategy built on heritage architecture, Red Sea coastal assets and archaeological sites.

The heritage case is strong and internationally recognised. Asmara was inscribed on the UNESCO World Heritage list in 2017 as an exceptionally complete example of early-twentieth-century modernist urban planning, with rationalist, futurist and art deco buildings, including the Fiat Tagliero service station, the Cinema Impero and the central market. Few cities preserve an ensemble of that period so intact.

The coastal assets are the Dahlak archipelago, more than two hundred islands in the Red Sea off Massawa, with coral reefs comparable to better-known Red Sea diving destinations and far less visited. Massawa itself has Ottoman and Egyptian-era architecture, much of it damaged during the independence war.

The archaeology reaches further back. Adulis, on the Red Sea coast, was a major port of the Aksumite kingdom, trading with Rome, Arabia and India. Qohaito and Matara in the highlands are pre-Aksumite and Aksumite sites.

The constraints are practical. International air connectivity is limited, internal travel requires permits, hotel capacity outside Asmara is thin, and the visa process is a barrier. Tourism at scale would require changes in each of these.

There is a diaspora market that partly bypasses these constraints. Eritreans abroad returning to visit family constitute an existing travel flow, and heritage tourism aimed at second-generation diaspora is a segment with a lower access barrier than general international tourism.`,
    country: "eritrea",
    region: "northern-red-sea",
    category: "culture",
    subcategory: "history",
    author: "senait-ghebre",
    topics: ["heritage", "red-sea", "diaspora", "investment"],
    imageCaption: "The Fiat Tagliero building in Asmara, completed in 1938.",
    daysAgo: 4,
    readMinutes: 6,
    views: 1470,
  },
  {
    slug: "eritrea-cultural-festival",
    headline: "Eritrean Cultural Festival Draws Regional Visitors",
    deck: "Nine recognised ethnic groups, nine distinct traditions, one festival calendar.",
    body: `Eritrea's cultural festivals bring together the traditions of the country's nine recognised ethnic groups, each with its own language, music, dress and customary practice.

The nine are the Tigrinya, Tigre, Saho, Afar, Bilen, Kunama, Nara, Hedareb and Rashaida. They are distributed across highland and lowland regions and across Christian and Muslim communities, and the diversity within a population of Eritrea's size is unusual.

Language reflects that spread. Tigrinya and Arabic function as working languages, and Tigrinya and Tigre together account for the largest share of speakers. The remaining languages belong to Cushitic, Nilo-Saharan and Semitic families, and the state's stated policy has been to support mother-tongue primary education in each.

Festival programming typically covers music and dance, textile and craft traditions, food, and staged demonstrations of customary practice. Each group's musical tradition has distinct instrumentation and rhythm, and the guaila circle dance associated with highland communities is the form most widely recognised internationally.

Diaspora festivals extend the calendar well beyond Eritrea. Community associations in Germany, Sweden, the Netherlands, the United Kingdom, the United States and Canada organise annual events that function as cultural transmission for children raised outside the country.

Coffee preparation appears at all of them. The ceremony â€” roasting green beans, grinding, brewing in a jebena and serving in three rounds â€” is a shared practice across Eritrean and Ethiopian communities and is as much about the duration of the gathering as the drink.`,
    country: "eritrea",
    region: "asmara",
    category: "culture",
    subcategory: "traditions",
    author: "senait-ghebre",
    topics: ["heritage", "music", "diaspora"],
    imageCaption: "Traditional dress and music at an Eritrean cultural festival.",
    daysAgo: 5,
    readMinutes: 5,
    views: 810,
  },
  {
    slug: "eritrea-cycling-tradition",
    headline: "Eritrea's Cycling Tradition, a Colonial Import That Became National",
    deck: "The bicycle arrived with Italian colonialism. It stayed, and produced Grand Tour riders.",
    body: `Cycling occupies a place in Eritrean sporting culture that has no real parallel elsewhere in sub-Saharan Africa, and its origins are colonial.

Italians brought competitive cycling to Eritrea during the colonial period, and races were held in and around Asmara from the 1930s. What distinguishes the Eritrean case is what happened afterwards: the sport was taken up by Eritreans rather than abandoned with the colonial administration, and became genuinely popular.

The conditions favour it. Asmara sits at roughly 2,300 metres, and the roads descending from the highlands to the coast at Massawa provide climbs and descents of a scale that professional teams travel to find. Riders raised there train at altitude on demanding terrain as a matter of course.

Eritrean riders have competed at the highest level of the sport. Daniel Teklehaimanot became the first African rider to wear the polka-dot climber's jersey at the Tour de France, in 2015. Merhawi Kudus and Natnael Berhane rode for World Tour teams, and Biniam Girmay won a stage at the Giro d'Italia in 2022 and stages at the Tour de France in 2024, the first Black African rider to do so.

The Tour of Eritrea remains the domestic centrepiece, and the national championship in Asmara draws large crowds. Bicycles are also everyday transport in a way that sustains a base of riders.

The constraint on the pipeline is equipment and racing access. Competitive cycling requires expensive machinery and exposure to European racing calendars, and the route from a strong domestic scene to a professional contract runs through development teams and scouting relationships that are limited in number.`,
    country: "eritrea",
    region: "asmara",
    category: "sports",
    subcategory: "local-sports",
    author: "yusuf-abdi",
    topics: ["youth", "heritage"],
    imageCaption: "Cyclists on the highland roads outside Asmara.",
    daysAgo: 6,
    readMinutes: 5,
    views: 1220,
  },

  // ---------------------------------------------------------------------
  // PEOPLE
  // ---------------------------------------------------------------------
  {
    slug: "profile-horn-diaspora-engineers",
    headline: "The Engineers Building the Horn's Digital Infrastructure",
    deck: "A generation trained abroad is returning to build the systems the region runs on.",
    body: `A recognisable pattern has emerged across the Horn's technology sector: engineers educated in Europe, North America or the Gulf returning to build companies and infrastructure in Mogadishu, Addis Ababa, Hargeisa, Djibouti City and Asmara.

The pattern follows the shape of the region's migration history. Large numbers left during the conflicts and disruptions of the 1980s and 1990s, and their children were educated in the countries they settled in. That produced a cohort with technical training from established universities and family connections to the region.

What draws some of them back is the state of the market rather than sentiment alone. Systems that would be considered basic infrastructure elsewhere â€” payment rails, logistics software, digital identity, hospital records â€” are in some cases not built at all, and the opportunity to build them from a blank sheet is genuinely rarer in mature markets.

The advantages they bring are specific. Technical training, access to capital networks abroad, and familiarity with how comparable systems work elsewhere. The advantages they lack are equally specific: local regulatory knowledge, established commercial relationships, and an accurate sense of what customers will actually pay for.

The most durable ventures have tended to pair returning technical founders with local commercial partners, an arrangement that supplies both sides of that gap.

This section profiles individuals and their work. Every profile in *People of the Horn* is based on an interview conducted by this newsroom, with the subject's consent, and no profile is published without direct contact.

[Editor: this is a section overview. Individual profiles require conducted interviews.]`,
    countries: ["somalia", "ethiopia", "djibouti", "eritrea"],
    category: "people",
    subcategory: "diaspora",
    author: "khadra-jama",
    topics: ["diaspora", "startups", "youth", "telecoms"],
    imageCaption: "Technology work in the Horn increasingly draws on returning diaspora expertise.",
    placement: "SECTION_FEATURE",
    daysAgo: 3,
    readMinutes: 6,
    views: 1560,
  },
  {
    slug: "profile-women-in-horn-business",
    headline: "The Women Running the Horn's Trade Networks",
    deck: "Cross-border commerce in the Horn has long been organised by women. It rarely appears in trade statistics.",
    body: `Much of the Horn's cross-border trade is conducted by women, and most of it is invisible in official figures.

The pattern is long established. Women dominate market trade in foodstuffs, textiles, household goods and consumer items across the region, and cross-border movement of those goods between Ethiopia, Somalia, Djibouti and Kenya is substantially organised through networks that are largely female.

These networks operate on informal credit. Goods move on trust between traders who have dealt with each other, sometimes across generations, without written contract or bank involvement. Enforcement is reputational, and exclusion from the network is the sanction.

Because these transactions do not pass through formal customs channels or banks, they do not appear in trade statistics. That has a policy consequence: infrastructure and trade facilitation are planned around the flows that are measured, and border facilities designed for container freight are frequently unusable by traders moving goods in quantities that fill a minibus.

Mobile money has changed part of this. Digital payment allows value to move without cash crossing a border physically, which reduces both risk and the need for intermediaries.

The constraints that remain are the familiar ones: limited access to formal credit at reasonable rates, exposure at border crossings, and business registration processes designed around a firm rather than a trader.

*People of the Horn* profiles are interview-based. This overview introduces the section; individual profiles follow.

[Editor: section overview. Individual profiles require conducted interviews.]`,
    countries: ["somalia", "ethiopia", "djibouti"],
    category: "people",
    subcategory: "profiles",
    author: "khadra-jama",
    topics: ["women", "trade", "banking", "remittances"],
    imageCaption: "Traders at a cross-border market in the Horn.",
    daysAgo: 5,
    readMinutes: 5,
    views: 1040,
  },

  // ---------------------------------------------------------------------
  // EXPLAINED
  // ---------------------------------------------------------------------
  {
    slug: "why-ports-matter-horn-of-africa",
    headline: "Why Ports Matter So Much in the Horn of Africa",
    deck: "Four countries, one strategic waterway, and a hundred and twenty million people who need to reach it.",
    body: `**The basic asymmetry.** Ethiopia has more than a hundred and twenty million people and no coastline. Djibouti has under a million people and sits on one of the world's most important shipping lanes. Eritrea has roughly a thousand kilometres of Red Sea coast. Somalia has the longest coastline in mainland Africa. Almost everything else in Horn economics follows from this distribution.

**What a port actually provides.** Not just a place for ships. A working port is a berth deep enough for modern vessels, cranes that can handle containers at speed, customs processing that does not add days, storage that does not fill up, and a road or rail link inland that can move volume. A failure at any one of these makes the others worthless.

**The corridor is the product.** Shippers do not buy port calls; they buy delivered cost and delivered time to an inland destination. A port with excellent cranes and a bad road is a bad corridor. This is why the Addis Ababaâ€“Djibouti railway matters as much as the Doraleh terminal does.

**The main facilities.** Djibouti's complex â€” container, multipurpose, oil, livestock and specialised bulk terminals â€” carries the overwhelming majority of Ethiopian trade. Berbera in Somaliland has received major terminal investment and targets eastern Ethiopia. Bosaso in Puntland is a principal livestock export point. Mogadishu handles the largest share of Somali imports. Kismayo serves the Juba valley. Massawa and Assab serve Eritrea, with Assab historically serving Ethiopia before 1998.

**Why this is political, not just commercial.** Port access determines whether a landlocked state's economy functions. That makes port agreements matters of national security rather than ordinary commerce, and it explains why an Ethiopian memorandum on port access can produce an immediate diplomatic crisis with Somalia. It also explains Djibouti's sensitivity to competing facilities: transit revenue is a large share of national income.

**Livestock is the exception that proves the rule.** One of the region's largest export categories moves through ports, but needs holding grounds, watering, veterinary inspection and specialised vessels rather than container cranes. Infrastructure planning built around manufactured goods misses it entirely.

**What to watch.** Whether rail utilisation on the Djibouti corridor rises. Whether the Berbera corridor road to Ethiopia is completed. Whether Assab returns to Ethiopian use. And whether customs and border processing improves, which changes landed cost more cheaply than any new concrete.`,
    countries: ["djibouti", "ethiopia", "somalia", "eritrea"],
    category: "explained",
    subcategory: "key-facts",
    author: "meron-tesfaye",
    topics: ["ports", "trade", "infrastructure", "red-sea", "livestock"],
    imageCaption: "Port infrastructure is the Horn's central economic question.",
    daysAgo: 8,
    readMinutes: 8,
    views: 2230,
  },
  {
    slug: "how-the-somali-federal-system-works",
    headline: "How Somalia's Federal System Actually Works",
    deck: "A federal government, five member states, one self-declared republic, and a constitution that is still provisional.",
    body: `**The structure.** Somalia is a federal republic with a central government in Mogadishu and federal member states: Puntland, Galmudug, Hirshabelle, South West and Jubaland. The Banadir region, containing Mogadishu, has a distinct status that remains unsettled. Somaliland, in the north-west, declared independence in 1991 and is administered separately; it is not internationally recognised, and Mogadishu regards it as Somali territory.

**Why federal.** The system was designed after 1991 to distribute power in a country where central authority had collapsed and where regional administrations had formed independently. Puntland declared autonomy in 1998 without seeking separation. Others were formed later through negotiated processes.

**What is still provisional.** The constitution adopted in 2012 was explicitly provisional, and core questions were deferred: the division of powers between the federal government and the member states, control of natural resources, the status of Mogadishu, the structure of the judiciary, and the electoral model. Those deferrals are the source of most subsequent political disputes.

**Revenue is the sharpest question.** Ports and airports are the largest domestic revenue sources, and they sit in specific member states. Whether Mogadishu port revenue belongs to the federal government, to Banadir, or to a shared pool is not fully settled, and the same applies to Bosaso and Kismayo.

**How elections have worked.** Somalia has used an indirect system in which clan elders select delegates who choose members of parliament, who in turn elect the president. This reflects the 4.5 formula â€” an allocation among four major clan families and a half share for minority groups â€” which has structured power-sharing since the transitional period. Moving to direct universal suffrage has been a stated goal for years and is politically and logistically difficult.

**Security follows the same structure.** The Somali National Army operates alongside state forces, and integrating locally raised units into a national command is an ongoing process. African Union forces have supported federal forces under successive mandates.

**What to watch.** Whether the constitutional review resolves the division of powers; whether direct elections are held; and whether federalâ€“state revenue sharing is agreed. Almost every recurring Somali political dispute is a symptom of one of these three.`,
    country: "somalia",
    category: "explained",
    subcategory: "background",
    author: "meron-tesfaye",
    topics: ["elections", "diplomacy", "ports"],
    imageCaption: "Somalia's federal structure remains constitutionally unfinished.",
    daysAgo: 9,
    readMinutes: 8,
    views: 1780,
  },
  {
    slug: "horn-of-africa-strategic-importance",
    headline: "Why the Horn of Africa Is Strategically Important",
    deck: "Six factors explain why states with no obvious connection to the region maintain a presence in it.",
    body: `**One. The shipping lane.** The Bab el-Mandeb is the southern gate of the Red Sea and the only sea route between the Indian Ocean and Suez. A very large share of world trade, including a substantial share of seaborne oil, passes through it. Any state with an interest in that traffic has an interest in the Horn.

**Two. Military basing.** Djibouti hosts installations belonging to several foreign powers, including the United States, France, Japan, Italy and China. It is one of the few places on earth where that many militaries maintain a permanent presence in one small country, and the reason is position.

**Three. Proximity to the Gulf.** The Horn faces the Arabian Peninsula across a narrow strait. Gulf states have pursued port investments, agricultural land arrangements and political relationships across the region, and Yemen's conflict has made the opposite shore directly relevant to Horn security.

**Four. Population and market size.** Ethiopia alone is the second most populous country in Africa. The four Horn states together represent a substantial and young market, and Addis Ababa hosts the African Union, which gives the region diplomatic weight beyond its economic size.

**Five. Migration.** The eastern route toward the Gulf and the northern route toward the Mediterranean both originate or transit here. That makes the Horn's stability a direct policy concern for Europe and the Gulf.

**Six. Resources and connectivity.** Ethiopian hydropower, Eritrean minerals, Danakil potash, Somali fisheries and offshore hydrocarbon prospects are the physical resources. The submarine cables through the Red Sea are the digital ones â€” much of East Africa's international bandwidth passes through this corridor.

**The consequence.** External interest brings investment, and it brings competition. Horn governments have leverage they would not otherwise have, and they operate in an environment where several outside powers with conflicting objectives are simultaneously active. Managing that is the central skill of Horn statecraft, and the region's history offers examples of it being done well and badly.`,
    countries: ["djibouti", "ethiopia", "somalia", "eritrea"],
    category: "explained",
    subcategory: "key-facts",
    author: "meron-tesfaye",
    topics: ["red-sea", "diplomacy", "ports", "migration", "energy"],
    imageCaption: "The Horn of Africa sits at the junction of Africa, the Middle East and the Indian Ocean.",
    daysAgo: 10,
    readMinutes: 7,
    views: 2960,
  },
];

export const VIDEOS = [
  { slug: "explainer-bab-el-mandeb", title: "The Strait That Moves the World's Trade", description: "A four-minute explainer on the Bab el-Mandeb, the thirty-kilometre gap between the Horn and Arabia that determines the region's economics.", country: "djibouti", kind: "EXPLAINER", durationSec: 254, daysAgo: 1 },
  { slug: "interview-port-logistics", title: "Inside the Corridor: How Ethiopian Cargo Reaches the Sea", description: "Following a container from the Doraleh terminal to the Ethiopian highlands, and the delays that determine its cost.", country: "djibouti", kind: "DOCUMENTARY", durationSec: 892, daysAgo: 2 },
  { slug: "asmara-modernist-city", title: "Asmara: A Modernist City on the Red Sea Highlands", description: "A walk through the capital whose 1930s architecture earned it UNESCO World Heritage status in 2017.", country: "eritrea", kind: "CULTURE", durationSec: 431, daysAgo: 3 },
  { slug: "mogadishu-market-economy", title: "Mogadishu's Markets and the Mobile Money Economy", description: "How a payment system built without banks became the infrastructure of Somali commerce.", country: "somalia", kind: "BUSINESS", durationSec: 517, daysAgo: 3 },
  { slug: "highland-running-training", title: "Training at Altitude in the Ethiopian Highlands", description: "Inside the club system that has produced Olympic distance champions for six decades.", country: "ethiopia", kind: "DOCUMENTARY", durationSec: 645, daysAgo: 4 },
  { slug: "explainer-gerd", title: "The Dam, the River and Three Countries", description: "What the Grand Ethiopian Renaissance Dam actually does, and what is genuinely in dispute.", country: "ethiopia", kind: "EXPLAINER", durationSec: 388, daysAgo: 5 },
  { slug: "somali-poetry-performance", title: "The Alliteration Rule: Somali Gabay in Performance", description: "A poet explains the form that carried Somali history before the language had a script.", country: "somalia", kind: "CULTURE", durationSec: 476, daysAgo: 6 },
  { slug: "eritrea-cycling-climb", title: "The Climb from Massawa to Asmara", description: "Two thousand three hundred metres of ascent, and the cycling culture built on it.", country: "eritrea", kind: "NEWS", durationSec: 302, daysAgo: 7 },
  { slug: "djibouti-geothermal", title: "Drilling for Power in the Afar Triple Junction", description: "Why a country sitting on one of the most volcanically active regions on earth imports electricity.", country: "djibouti", kind: "EXPLAINER", durationSec: 361, daysAgo: 8 },
  { slug: "horn-drought-pastoralists", title: "When the Rains Fail: Pastoralism Under Pressure", description: "How consecutive failed rainy seasons reshape livelihoods across the Horn's rangelands.", country: null, kind: "DOCUMENTARY", durationSec: 1024, daysAgo: 9 },
  { slug: "interview-founder-logistics", title: "Building Logistics Software for Mogadishu", description: "An interview with founders building for a market where the addressing system is informal.", country: "somalia", kind: "INTERVIEW", durationSec: 723, daysAgo: 10 },
  { slug: "coffee-origin-ethiopia", title: "Where Coffee Comes From", description: "In the forests of south-western Ethiopia, where coffee arabica originated and still grows wild.", country: "ethiopia", kind: "CULTURE", durationSec: 545, daysAgo: 11 },
];

