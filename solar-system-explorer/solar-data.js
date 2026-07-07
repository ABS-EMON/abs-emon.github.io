// ============================================================
// SOLAR SYSTEM DATA
// Note: orbit distances and body sizes below are NOT to real
// scale — they're compressed/exaggerated so the whole system
// (and small planets) stay visible and readable at once.
// Facts (diameter, gravity, temperature, periods, moon counts)
// are real approximate astronomical values.
// ============================================================

const SUN_DATA = {
  id: 'sun',
  name: 'Sun',
  type: 'Star',
  color: 0xffcf6b,
  visualRadius: 6.4,
  rotationHours: 27 * 24, // ~27 Earth days per rotation (equatorial)
  facts: {
    diameter: '1,391,000 km (109× Earth)',
    distanceFromSun: '—',
    orbitalPeriod: '~230 million years (around galaxy core)',
    dayLength: '~27 Earth days (rotation)',
    gravity: '27.9× Earth (surface)',
    moons: '0 (8 planets in orbit)',
    avgTemp: '~5,500°C (surface) / ~15,000,000°C (core)'
  },
  description: 'The Sun is a G-type main-sequence star that holds the solar system together with its gravity and powers nearly all life on Earth through nuclear fusion, converting hydrogen into helium at its core.'
};

const PLANETS_DATA = [
  {
    id: 'mercury', name: 'Mercury', type: 'Planet', color: 0x9a9a94,
    visualRadius: 0.8, visualDistance: 16.7, orbitalPeriodDays: 88,
    rotationHours: 1408, tiltDeg: 0.03, retrograde: false,
    facts: {
      diameter: '4,879 km', distanceFromSun: '57.9 million km (0.39 AU)',
      orbitalPeriod: '88 Earth days', dayLength: '59 Earth days',
      gravity: '0.38× Earth', moons: '0', avgTemp: '-173°C to 427°C'
    },
    description: 'The smallest and fastest planet, Mercury has almost no atmosphere, so temperatures swing violently between blistering days and freezing nights.',
    moons: []
  },
  {
    id: 'venus', name: 'Venus', type: 'Planet', color: 0xe0c088,
    visualRadius: 1.08, visualDistance: 19.9, orbitalPeriodDays: 225,
    rotationHours: -5832, tiltDeg: 177.4, retrograde: true,
    facts: {
      diameter: '12,104 km', distanceFromSun: '108.2 million km (0.72 AU)',
      orbitalPeriod: '225 Earth days', dayLength: '243 Earth days (retrograde)',
      gravity: '0.90× Earth', moons: '0', avgTemp: '464°C (hottest planet)'
    },
    description: 'Venus spins backwards and so slowly that its day is longer than its year. A crushing, acidic atmosphere traps heat, making it the hottest planet in the solar system.',
    moons: []
  },
  {
    id: 'earth', name: 'Earth', type: 'Planet', color: 0x2f6fdc,
    visualRadius: 1.1, visualDistance: 22.0, orbitalPeriodDays: 365.25,
    rotationHours: 24, tiltDeg: 23.44, retrograde: false,
    facts: {
      diameter: '12,742 km', distanceFromSun: '149.6 million km (1 AU)',
      orbitalPeriod: '365.25 days', dayLength: '24 hours',
      gravity: '1× (9.8 m/s²)', moons: '1', avgTemp: '15°C (average)'
    },
    description: 'Our home — the only known planet with liquid surface water and life. Its axial tilt of 23.4° is what gives us seasons.',
    moons: [
      { name: 'Moon', color: 0xcfcfcf, visualRadius: 0.3, visualDistance: 2.1, periodDays: 27.3,
        fact: 'Earth\u2019s only natural satellite; stabilizes our axial tilt and drives ocean tides.' }
    ]
  },
  {
    id: 'mars', name: 'Mars', type: 'Planet', color: 0xc1440e,
    visualRadius: 0.9, visualDistance: 25.3, orbitalPeriodDays: 687,
    rotationHours: 24.6, tiltDeg: 25.19, retrograde: false,
    facts: {
      diameter: '6,779 km', distanceFromSun: '227.9 million km (1.52 AU)',
      orbitalPeriod: '687 Earth days', dayLength: '24.6 hours',
      gravity: '0.38× Earth', moons: '2', avgTemp: '-65°C (average)'
    },
    description: 'The "Red Planet" gets its color from iron oxide (rust) covering its surface. It hosts the largest volcano (Olympus Mons) and canyon (Valles Marineris) in the solar system.',
    moons: [
      { name: 'Phobos', color: 0x8a7f6e, visualRadius: 0.12, visualDistance: 1.5, periodDays: 0.32,
        fact: 'Orbits so close and fast it rises and sets twice a Martian day; slowly spiraling inward.' },
      { name: 'Deimos', color: 0x9c9284, visualRadius: 0.09, visualDistance: 1.9, periodDays: 1.26,
        fact: 'Smaller and more distant than Phobos; likely a captured asteroid.' }
    ]
  },
  {
    id: 'jupiter', name: 'Jupiter', type: 'Planet', color: 0xd9a066,
    visualRadius: 2.5, visualDistance: 39.9, orbitalPeriodDays: 4331,
    rotationHours: 9.9, tiltDeg: 3.13, retrograde: false,
    facts: {
      diameter: '139,820 km', distanceFromSun: '778.5 million km (5.2 AU)',
      orbitalPeriod: '11.86 years', dayLength: '9.9 hours (fastest spin)',
      gravity: '2.53× Earth', moons: '95 known', avgTemp: '-110°C (cloud tops)'
    },
    description: 'The largest planet — a gas giant so massive it could fit all other planets inside it. Its Great Red Spot is a storm bigger than Earth that has raged for centuries.',
    moons: [
      { name: 'Io', color: 0xe8d271, visualRadius: 0.24, visualDistance: 3.6, periodDays: 1.77,
        fact: 'The most volcanically active body in the solar system, due to tidal heating from Jupiter.' },
      { name: 'Europa', color: 0xd8c9a3, visualRadius: 0.22, visualDistance: 4.3, periodDays: 3.55,
        fact: 'An icy moon hiding a global ocean beneath its shell — a top target in the search for life.' },
      { name: 'Ganymede', color: 0xa89a86, visualRadius: 0.32, visualDistance: 5.1, periodDays: 7.15,
        fact: 'The largest moon in the solar system — bigger than the planet Mercury.' },
      { name: 'Callisto', color: 0x7d7566, visualRadius: 0.3, visualDistance: 5.9, periodDays: 16.7,
        fact: 'One of the most heavily cratered, ancient surfaces known in the solar system.' }
    ]
  },
  {
    id: 'saturn', name: 'Saturn', type: 'Planet', color: 0xe3cf9e,
    visualRadius: 2.3, visualDistance: 51.3, orbitalPeriodDays: 10747,
    rotationHours: 10.7, tiltDeg: 26.73, retrograde: false, hasRings: true,
    facts: {
      diameter: '116,460 km', distanceFromSun: '1.43 billion km (9.58 AU)',
      orbitalPeriod: '29.4 years', dayLength: '10.7 hours',
      gravity: '1.07× Earth', moons: '146 known', avgTemp: '-140°C (average)'
    },
    description: 'Famous for its spectacular ring system made of ice and rock particles. Saturn is so light it would float in water — if you could find an ocean big enough.',
    moons: [
      { name: 'Titan', color: 0xd9a75f, visualRadius: 0.3, visualDistance: 4.4, periodDays: 15.9,
        fact: 'The only moon with a dense atmosphere and liquid methane lakes on its surface.' },
      { name: 'Enceladus', color: 0xeef3f7, visualRadius: 0.14, visualDistance: 3.4, periodDays: 1.37,
        fact: 'Sprays icy geysers from a subsurface ocean, another candidate for hosting life.' }
    ]
  },
  {
    id: 'uranus', name: 'Uranus', type: 'Planet', color: 0x9fd8d8,
    visualRadius: 1.74, visualDistance: 69.4, orbitalPeriodDays: 30589,
    rotationHours: -17.2, tiltDeg: 97.77, retrograde: true,
    facts: {
      diameter: '50,724 km', distanceFromSun: '2.87 billion km (19.2 AU)',
      orbitalPeriod: '84 years', dayLength: '17.2 hours (retrograde)',
      gravity: '0.89× Earth', moons: '28 known', avgTemp: '-195°C (average)'
    },
    description: 'Uranus rotates almost completely on its side (98° tilt), likely from an ancient collision, causing extreme 20-year-long seasons at its poles.',
    moons: [
      { name: 'Titania', color: 0xb7b3ad, visualRadius: 0.16, visualDistance: 3.0, periodDays: 8.7,
        fact: 'The largest moon of Uranus, named after a Shakespearean fairy queen.' },
      { name: 'Oberon', color: 0xa39f9a, visualRadius: 0.15, visualDistance: 3.6, periodDays: 13.5,
        fact: 'Heavily cratered outer moon, also named from Shakespeare.' }
    ]
  },
  {
    id: 'neptune', name: 'Neptune', type: 'Planet', color: 0x3a5fcd,
    visualRadius: 1.7, visualDistance: 84.7, orbitalPeriodDays: 59800,
    rotationHours: 16.1, tiltDeg: 28.32, retrograde: false,
    facts: {
      diameter: '49,244 km', distanceFromSun: '4.5 billion km (30.05 AU)',
      orbitalPeriod: '165 years', dayLength: '16.1 hours',
      gravity: '1.14× Earth', moons: '16 known', avgTemp: '-200°C (average)'
    },
    description: 'The windiest planet, with supersonic storms reaching 2,100 km/h. Neptune was the first planet located by mathematical prediction rather than direct observation.',
    moons: [
      { name: 'Triton', color: 0xcdd7e0, visualRadius: 0.22, visualDistance: 3.0, periodDays: -5.88,
        fact: 'Orbits backwards (retrograde) — likely a captured Kuiper Belt object, slowly spiraling toward Neptune.' }
    ]
  }
];

// Bonus dwarf planet
const DWARF_DATA = {
  id: 'pluto', name: 'Pluto', type: 'Dwarf Planet', color: 0xc9b29b,
  visualRadius: 0.6, visualDistance: 96.0, orbitalPeriodDays: 90560,
  rotationHours: -153.3, tiltDeg: 122.5, retrograde: true,
  facts: {
    diameter: '2,377 km', distanceFromSun: '5.9 billion km (39.5 AU)',
    orbitalPeriod: '248 years', dayLength: '6.4 Earth days (retrograde)',
    gravity: '0.06× Earth', moons: '5', avgTemp: '-225°C (average)'
  },
  description: 'Reclassified as a dwarf planet in 2006. Pluto and its largest moon Charon are so close in size they orbit a shared point of gravity between them.',
  moons: [
    { name: 'Charon', color: 0x9a9088, visualRadius: 0.24, visualDistance: 1.6, periodDays: 6.39,
      fact: 'About half Pluto\u2019s size — together they form a rare "double dwarf planet" system.' }
  ]
};

// Combined ordered list used for the tour and sidebar
const ALL_BODIES = [SUN_DATA, ...PLANETS_DATA, DWARF_DATA];
