export type WorldId =
  | 'forest'
  | 'candy'
  | 'ocean'
  | 'snow'
  | 'sky'
  | 'crystal';

export type PowerUpType = 'magnet' | 'invisibility' | 'bird' | 'shield';

export type CharacterId = 'fox' | 'bunny' | 'panda' | 'cosmic_cat';

export type HoverboardId = 'aero' | 'candy_glider' | 'starlight' | 'crystal_phantom';

export type GamePhase = 'menu' | 'playing' | 'paused' | 'gameover';

export interface WorldConfig {
  id: WorldId;
  name: string;
  subtitle: string;
  accentHex: string;
  skyTopHex: string;
  skyBottomHex: string;
  fogHex: string;
  fogDensity: number;
  trackBaseHex: string;
  trackStripeHex: string;
  groundHex: string;
  sunHex: string;
  hemiSkyHex: string;
  hemiGroundHex: string;
}

export const WORLDS: WorldConfig[] = [
  {
    id: 'forest',
    name: 'Cute Green Forest',
    subtitle: 'Wildflowers, wooden bridges & woodland critters',
    accentHex: '#34D399',
    skyTopHex: '#8CE0FF',
    skyBottomHex: '#D8F5E5',
    fogHex: '#CBEFE0',
    fogDensity: 0.0085,
    trackBaseHex: '#C99B6D',
    trackStripeHex: '#E3BE94',
    groundHex: '#63C27A',
    sunHex: '#FFF1D0',
    hemiSkyHex: '#B6EBFF',
    hemiGroundHex: '#4FA362',
  },
  {
    id: 'candy',
    name: 'Candy World',
    subtitle: 'Giant lollipops, wafer hurdles & sweet cottages',
    accentHex: '#F472B6',
    skyTopHex: '#FFD1EB',
    skyBottomHex: '#FFF0C9',
    fogHex: '#FFE4F1',
    fogDensity: 0.0085,
    trackBaseHex: '#F9A8D4',
    trackStripeHex: '#FFF1F7',
    groundHex: '#FBCFE8',
    sunHex: '#FFF5DC',
    hemiSkyHex: '#FFE0F2',
    hemiGroundHex: '#F48FB1',
  },
  {
    id: 'ocean',
    name: 'Ocean World',
    subtitle: 'Coral reefs, glowing pearls & darting fish',
    accentHex: '#22D3EE',
    skyTopHex: '#0F6292',
    skyBottomHex: '#48CAE4',
    fogHex: '#258BB8',
    fogDensity: 0.0105,
    trackBaseHex: '#E9C46A',
    trackStripeHex: '#F7E09E',
    groundHex: '#3A9BBF',
    sunHex: '#BDF2FF',
    hemiSkyHex: '#7DE2FF',
    hemiGroundHex: '#1D6B8C',
  },
  {
    id: 'snow',
    name: 'Snow World',
    subtitle: 'Frozen bridges, cheerful snowmen & alpine peaks',
    accentHex: '#60A5FA',
    skyTopHex: '#A6D8FF',
    skyBottomHex: '#EDF7FF',
    fogHex: '#DCEEFF',
    fogDensity: 0.0085,
    trackBaseHex: '#B5E2FA',
    trackStripeHex: '#EBF8FF',
    groundHex: '#E6F4FF',
    sunHex: '#FFF6E8',
    hemiSkyHex: '#D6EEFF',
    hemiGroundHex: '#9AC5E8',
  },
  {
    id: 'sky',
    name: 'Sky World',
    subtitle: 'Floating islands, cloud paths & rainbow bridges',
    accentHex: '#FBBF24',
    skyTopHex: '#67B8FF',
    skyBottomHex: '#FFF3D1',
    fogHex: '#D6EEFF',
    fogDensity: 0.0072,
    trackBaseHex: '#FFFDF7',
    trackStripeHex: '#FDE68A',
    groundHex: '#9CD3FF',
    sunHex: '#FFF2B8',
    hemiSkyHex: '#BCE3FF',
    hemiGroundHex: '#FCD5CE',
  },
  {
    id: 'crystal',
    name: 'Magic Crystal World',
    subtitle: 'Glowing amethyst spires & enchanted trees',
    accentHex: '#C084FC',
    skyTopHex: '#2A1B54',
    skyBottomHex: '#6E44A8',
    fogHex: '#432875',
    fogDensity: 0.0095,
    trackBaseHex: '#3D2B6B',
    trackStripeHex: '#7C5CFA',
    groundHex: '#2C1E52',
    sunHex: '#F0D9FF',
    hemiSkyHex: '#A98BFF',
    hemiGroundHex: '#261447',
  },
];

export interface CharacterDef {
  id: CharacterId;
  name: string;
  tagline: string;
  cost: number;
  primaryHex: string;
  secondaryHex: string;
  scarfHex: string;
}

export const CHARACTERS: CharacterDef[] = [
  {
    id: 'fox',
    name: 'Pip the Fox',
    tagline: 'Agile woodland explorer with a fluffy tail',
    cost: 0,
    primaryHex: '#FF7D3B',
    secondaryHex: '#FFF4E6',
    scarfHex: '#38BDF8',
  },
  {
    id: 'bunny',
    name: 'Mochi the Bunny',
    tagline: 'Pastel sakura jumper with floppy ears',
    cost: 150,
    primaryHex: '#FFE4EC',
    secondaryHex: '#FFFFFF',
    scarfHex: '#FB7185',
  },
  {
    id: 'panda',
    name: 'Koko the Panda',
    tagline: 'Cheerful bamboo rider with mint bandana',
    cost: 350,
    primaryHex: '#F8FAFC',
    secondaryHex: '#272936',
    scarfHex: '#34D399',
  },
  {
    id: 'cosmic_cat',
    name: 'Nova the Cat',
    tagline: 'Starlight adventurer with golden bell collar',
    cost: 600,
    primaryHex: '#A78BFA',
    secondaryHex: '#F5F3FF',
    scarfHex: '#FBBF24',
  },
];

export interface HoverboardDef {
  id: HoverboardId;
  name: string;
  tagline: string;
  cost: number;
  deckHex: string;
  trimHex: string;
  glowHex: string;
}

export const HOVERBOARDS: HoverboardDef[] = [
  {
    id: 'aero',
    name: 'Aero Breeze',
    tagline: 'Balanced twin-thruster pastel cruiser',
    cost: 0,
    deckHex: '#38BDF8',
    trimHex: '#F8FAFC',
    glowHex: '#22D3EE',
  },
  {
    id: 'candy_glider',
    name: 'Candy Glider',
    tagline: 'Peppermint-swirled sweet speedster',
    cost: 120,
    deckHex: '#F472B6',
    trimHex: '#FFF1F7',
    glowHex: '#FBBF24',
  },
  {
    id: 'starlight',
    name: 'Starlight Cruiser',
    tagline: 'Golden winged glider from the clouds',
    cost: 300,
    deckHex: '#F59E0B',
    trimHex: '#FEF3C7',
    glowHex: '#C084FC',
  },
  {
    id: 'crystal_phantom',
    name: 'Crystal Phantom',
    tagline: 'Arcane prism board with emerald jets',
    cost: 500,
    deckHex: '#4C1D95',
    trimHex: '#C4B5FD',
    glowHex: '#34D399',
  },
];

export interface PowerUpMeta {
  type: PowerUpType;
  label: string;
  duration: number; // seconds
  colorHex: string;
  description: string;
}

export const POWERUP_META: Record<PowerUpType, PowerUpMeta> = {
  magnet: {
    type: 'magnet',
    label: 'Magnet',
    duration: 9,
    colorHex: '#FB7185',
    description: 'Pulls nearby coins & gems automatically',
  },
  invisibility: {
    type: 'invisibility',
    label: 'Invisibility',
    duration: 7,
    colorHex: '#67E8F9',
    description: 'Phase cleanly through obstacles',
  },
  bird: {
    type: 'bird',
    label: 'Bird Flight',
    duration: 8,
    colorHex: '#FBBF24',
    description: 'Soar above the track & obstacles',
  },
  shield: {
    type: 'shield',
    label: 'Shield',
    duration: 18,
    colorHex: '#34D399',
    description: 'Absorbs one obstacle collision',
  },
};

export interface ActivePowerUpState {
  type: PowerUpType;
  remaining: number;
  duration: number;
}

export interface MissionDef {
  id: string;
  title: string;
  metric: 'distance' | 'coins' | 'powerups' | 'runs';
  target: number;
  reward: number;
}

export const MISSIONS_POOL: MissionDef[] = [
  { id: 'm_dist_300', title: 'Glide 300m in total', metric: 'distance', target: 300, reward: 60 },
  { id: 'm_coins_50', title: 'Collect 50 coins', metric: 'coins', target: 50, reward: 50 },
  { id: 'm_pwr_3', title: 'Grab 3 power-ups', metric: 'powerups', target: 3, reward: 75 },
  { id: 'm_dist_1000', title: 'Glide 1,000m in total', metric: 'distance', target: 1000, reward: 120 },
  { id: 'm_coins_180', title: 'Collect 180 coins', metric: 'coins', target: 180, reward: 130 },
  { id: 'm_runs_5', title: 'Complete 5 runs', metric: 'runs', target: 5, reward: 100 },
  { id: 'm_pwr_10', title: 'Grab 10 power-ups', metric: 'powerups', target: 10, reward: 160 },
  { id: 'm_dist_2500', title: 'Glide 2,500m in total', metric: 'distance', target: 2500, reward: 240 },
];

export interface SaveData {
  totalCoins: number;
  bestScores: Record<WorldId, number>;
  bestDistances: Record<WorldId, number>;
  unlockedCharacters: CharacterId[];
  unlockedHoverboards: HoverboardId[];
  selectedCharacter: CharacterId;
  selectedHoverboard: HoverboardId;
  selectedWorld: WorldId;
  muted: boolean;
  missionProgress: Record<string, number>;
  claimedMissions: string[];
}

export interface HudSnapshot {
  phase: GamePhase;
  worldId: WorldId;
  distance: number;
  score: number;
  runCoins: number;
  speed: number;
  activePowers: ActivePowerUpState[];
  pickupBanner: { label: string; colorHex: string; key: number } | null;
  nextPortalMeters: number;
  newBest: boolean;
}
