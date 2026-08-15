// All copy transcribed from the FEVER pitch deck (19 slides).
// Two obvious typos corrected: "ephiphany" -> "epiphany", "abou" -> "about".

export const SECTIONS = [
  { id: "cover", label: "Cover", accent: "ember" },
  { id: "setting", label: "The Setting", accent: "amber" },
  { id: "creed", label: "Pre-Social Media", accent: "teal" },
  { id: "about", label: "About Fever", accent: "ember" },
  { id: "logline", label: "Logline", accent: "ember" },
  { id: "pitch", label: "The Pitch", accent: "amber" },
  { id: "s1a", label: "S1 · Ep 1–4", accent: "amber" },
  { id: "s1b", label: "S1 · Ep 5–8", accent: "amber" },
  { id: "s2a", label: "S2 · Ep 9–12", accent: "teal" },
  { id: "s2b", label: "S2 · Ep 13–16", accent: "teal" },
  { id: "characters", label: "Fever Crew", accent: "ember" },
  { id: "cast-main", label: "Main Cast", accent: "rose" },
  { id: "cast-sup1", label: "Supporting Cast", accent: "rose" },
  { id: "cast-sup2", label: "Supporting Cast II", accent: "rose" },
  { id: "book", label: "The Book", accent: "sand" },
  { id: "photos", label: "Photos", accent: "sand" },
  { id: "mood", label: "Mood & Colour", accent: "teal" },
  { id: "nightlife", label: "Miami · 1995", accent: "rose" },
  { id: "close", label: "Can't Stop Fever", accent: "ember" },
] as const;

export const SETTING_LINES = [
  "Industrial warehouses in Hialeah",
  "Neon-lit South Beach nights",
  "Catholic family dinners in Little Havana",
  "Pagers, flyers, car trunks filled with cash…",
];

// Jill's format: the statement in CAPS, each line on its own highlighted band.
// Text between asterisks is emphasised, matching how she marked "pre-social
// media" in the reference.
export const STATEMENT = [
  "This is a time of *pre-social media.*",
  "Photos and video do not exist.",
  "Reputation spreads only by word of mouth and myth spreads faster than truth.",
];

export const CREED = [
  "The rave becomes church.",
  "Bass becomes confession.",
  "Ecstasy becomes communion.",
];

export const ABOUT = [
  "In the mid-1990s Miami, a group of first-generation Cuban-American young men create an underground rave empire called Fever — a sanctuary of music, freedom, and excess — but as their cultural revolution grows into a criminal enterprise, their brotherhood fractures under the weight of ambition, loyalty, and the illusion of invincibility.",
  "Fever is a coming-of-age crime tragedy set against the birth of Miami's underground rave scene. It is not just a party show. It is a story about young men trying to outrun the expectations of their fathers — and accidentally building something bigger than they can control.",
  "At 21, they think they are inventing the culture. At 25, they realize the culture can consume you.",
];

export type Ep = { n: number; title: string; body: string };

export const SEASON_ONE_A: Ep[] = [
  { n: 1, title: "Humble Start", body: "The introduction to the characters — Manny, Frankie and Hector. The backstory. The friendship. The Cuban links." },
  { n: 2, title: "A Little Bit of Ecstasy", body: "Manny takes an ecstasy pill for the first time, has an epiphany and comes up with a business idea." },
  { n: 3, title: "Rally", body: "After Manny's experience with ecstasy, he pushes the guys to think about throwing their own raves." },
  { n: 4, title: "Deuces", body: "The guys escape the “preppy party” circuit and vow to show South Beach what they've never seen before." },
];

export const SEASON_ONE_B: Ep[] = [
  { n: 5, title: "The Brand", body: "They name it: FEVER. Flyers become art. Identity solidifies. Miami nightclub advertising changes forever." },
  { n: 6, title: "The Execution", body: "The deal is done. The buzz is out. The guys prepare for the first after-hours rave thrown on South Beach." },
  { n: 7, title: "The First Night", body: "An old ballroom. 300 club kids. Electricity in the air. The moment feels historic. The rise feels euphoric." },
  { n: 8, title: "Word Spreads", body: "Lines wrap around blocks. Money floods in. The guys did it. But where money flows, ego grows…" },
];

export const SEASON_TWO_A: Ep[] = [
  { n: 9, title: "Can't Stop Fever", body: "Bigger venues. Out-of-town DJs. Real money. Real lies." },
  { n: 10, title: "Cracks", body: "Rival promoters. Overdose scares. Frankie's sidequests intensify. Families begin to worry." },
  { n: 11, title: "Run MDC", body: "Fever is unstoppable. Egos peak. They want more." },
  { n: 12, title: "Untouchable", body: "They throw the biggest party yet. But law enforcement is watching as tension hums underneath." },
];

export const SEASON_TWO_B: Ep[] = [
  { n: 13, title: "Pressure", body: "Permits denied. Informants surface. While the drug use intensifies, the brotherhood begins to destabilize." },
  { n: 14, title: "Fractured", body: "The party goes on…but at what final price?" },
  { n: 15, title: "The Beginning of The End", body: "Implosion. Precisional. Surgical. The machine dismantles piece by piece. The music begins to fade and then — silence." },
  { n: 16, title: "Stillness", body: "The aftermath of it all. What was lost. Who was damaged. Years pass. We see who they became — and what they grieve." },
];

export const CHARACTERS = [
  {
    key: "manny", name: "Manny", role: "Founder · Mastermind",
    body: "The complex artistic founder and mastermind who ran the parties on pure adrenaline, frequently partying harder than his own patrons. Manny was a mad-genius visionary who was both highly calculated and deeply embedded in the madness he helped create. As the operational anchor to the Fever Crew empire, he was constantly torn between his morals and his business.",
  },
  {
    key: "frankie", name: "Frankie", role: "Operations · Street",
    body: "The raw, street-hardened muscle and “wild child” of the Fever Crew, handling operations and street promotions, Frankie was the enforcer and the unpredictable soul of the party. A standout local baseball player from Miami, his talent was noticeable enough that the Florida Marlins drafted him, but his injuries derailed that dream and sent him into a downward spiral.",
  },
  {
    key: "hector", name: "Hector", role: "The Mascot",
    body: "Considered the unofficial mascot of the 1990s scene, Hector was described as an intimidating, introspective powerhouse — a “Cuban version of Tupac Shakur” with “Fever Crew” tattooed across his knuckles. Lore states he would brazenly steal cash from the venue's registers during the party, only to go into the alleyway and buy clothes off the homeless for “good karma”.",
  },
];

export const MAIN_CAST = [
  { key: "marcello", actor: "Marcello Hernandez", role: "as Manny" },
  { key: "diego", actor: "Diego Tinoco", role: "as Frankie" },
  { key: "xolo", actor: "Xolo Maridueña", role: "as Hector" },
];

export const SUPPORTING_1 = [
  { key: "jose", role: "Jose", actor: "Jayce Mroz is desired" },
  { key: "vanessa", role: "Vanessa", actor: "Kassandra Rubio is desired" },
  { key: "jenny", role: "Jenny", actor: "Tess Romero is desired" },
  { key: "ivan", role: "Ivan", actor: "Tyler Alvarez is desired" },
  { key: "mendoza", role: "Officer Mendoza", actor: "Andy Garcia is desired" },
  { key: "pino", role: "Manny's Dad · Mr. Pino", actor: "Stephen Bauer is desired" },
];

export const SUPPORTING_2 = [
  { key: "fmom", role: "Frankie's Mom", actor: "Natalie Martinez is desired" },
  { key: "fgrand", role: "Frankie's Grandparents", actor: "Emilio & Gloria Estefan are desired" },
  { key: "kiera", role: "Kiera the Infamous Doorgirl", actor: "Bella Thorne is desired" },
];

export const BOOK_COPY = [
  "The word fever means, “an abnormally high body temperature, and in severe instances, delirium; A state of nervous excitement or agitation.” But back in the day, Fever was also the name for a legendary rave that defined the mean style and brash attitude of Miami's underground dance culture.",
  "Today, the mention of Fever sparks recollections of decadence, excess, even insanity. They used to say that for every hour you spent at Fever, you took a week off of your life. Some of the stories are so over the top they are considered urban myths. But these things actually happened.",
  "For better and worse, the guys known as Fever Crew delivered what they promised: Revolution.",
];

export const BOOK_URL =
  "https://www.amazon.com/Fever-Read-this-before-raving/dp/B086Y6HQV1";

export const PALETTE = [
  { hex: "#3FB3A6", name: "Ocean Drive" },
  { hex: "#C94A6B", name: "Neon Rose" },
  { hex: "#9B7BC4", name: "Lavender Haze" },
  { hex: "#CE7A4F", name: "Sunset Burn" },
  { hex: "#DDC088", name: "Deco Sand" },
  { hex: "#081740", name: "Causeway Navy" },
  { hex: "#000000", name: "After Hours" },
  { hex: "#E2DEDB", name: "Salt White" },
];
