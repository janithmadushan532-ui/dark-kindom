export type WorldId =
  | 'forgotten_kingdom'
  | 'cursed_forest'
  | 'lava_lands'
  | 'frozen_empire'
  | 'desert_kingdom'
  | 'sky_islands'
  | 'ancient_temple'
  | 'mushroom_kingdom'
  | 'ocean_abyss'
  | 'dragons_realm'
  | 'cyber_wasteland'
  | 'toxic_mutation_zone'
  | 'frozen_mecha_kingdom'
  | 'void_dimension'
  | 'omega_final_war';

export type DifficultyBand =
  | 'Easy'
  | 'Normal'
  | 'Hard'
  | 'Very Hard'
  | 'Expert'
  | 'Nightmare';

export type WeaponId =
  | 'shadow_archer'
  | 'iron_cannon'
  | 'ice_wizard'
  | 'thunder_tower'
  | 'poison_tower'
  | 'fire_dragon'
  | 'crystal_laser'
  | 'ancient_guardian'
  | 'sky_hunter'
  | 'missile_platform'
  | 'storm_cannon'
  | 'drone_station'
  | 'plasma_air_defense'
  | 'titan_plasma_cannon';

export type WeaponQualityTier = 'basic' | 'premium';

export type TargetingMode =
  | 'first'
  | 'strongest'
  | 'fastest'
  | 'flying_priority'
  | 'ground_priority'
  | 'area';

export type SciFiEnemyAbility =
  | 'energy_shield'
  | 'speed_boost'
  | 'armor_regen'
  | 'stealth'
  | 'emp_pulse'
  | 'aerial_dash'
  | 'heavy_armor'
  | 'boss_energy_wave'
  | 'void_teleport'
  | 'long_range_jam'
  | 'toxic_aura'
  | 'cryo_aura';

export type EnemyClass =
  | 'normal'
  | 'fast'
  | 'armored'
  | 'flying'
  | 'shielded'
  | 'resistant'
  | 'elite'
  | 'boss';

export type EnvironmentHazard =
  | 'none'
  | 'poison_mist'
  | 'lava_heat'
  | 'ice_slick'
  | 'sandstorm'
  | 'lightning_storm'
  | 'ancient_curse'
  | 'toxic_spores'
  | 'abyss_current'
  | 'shadow_aura'
  | 'cyber_emp_storm'
  | 'toxic_acid_rain'
  | 'cryo_blizzard'
  | 'void_rift'
  | 'omega_warzone';

export interface Vec2 {
  x: number;
  y: number;
}

export interface WorldDefinition {
  id: WorldId;
  index: number;
  name: string;
  subtitle: string;
  description: string;
  terrainName: string;
  bgPrimaryHex: string;
  bgSecondaryHex: string;
  roadFillHex: string;
  roadBorderHex: string;
  accentHex: string;
  hazard: EnvironmentHazard;
  unlockStarsRequired: number;
  worldCompletionBonusCoins?: number;
}

export interface UpgradeTier {
  level: 1 | 2 | 3;
  name: string;
  cost: number;
  damageBonus: number;
  rangeBonus: number;
  fireRateMultiplier: number;
  specialEffect: string;
}

export interface UpgradePath {
  id: 'A' | 'B' | 'C';
  name: string;
  summary: string;
  tiers: [UpgradeTier, UpgradeTier, UpgradeTier];
}

export interface WeaponDefinition {
  id: WeaponId;
  name: string;
  role: string;
  tier: WeaponQualityTier;
  description: string;
  price: number;
  damage: number;
  attackSpeed: number; // shots per second
  range: number; // map units (1000x600 coordinate space)
  targeting: TargetingMode;
  canTargetFlying: boolean;
  canTargetGround: boolean;
  projectileType:
    | 'arrow'
    | 'cannonball'
    | 'frost_bolt'
    | 'lightning'
    | 'poison_vial'
    | 'fireball'
    | 'laser_beam'
    | 'shockwave'
    | 'aa_bullet'
    | 'aa_missile'
    | 'storm_sphere'
    | 'drone_laser'
    | 'plasma_aa'
    | 'titan_plasma';
  projectileSpeed: number;
  splashRadius: number;
  slowFactor?: number;
  slowDuration?: number;
  poisonDps?: number;
  poisonDuration?: number;
  burnDps?: number;
  burnDuration?: number;
  chainCount?: number;
  armorPierce?: number; // 0..1
  specialAbility: string;
  sellRatio: number;
  primaryColor: string;
  accentColor: string;
  upgradePaths: [UpgradePath, UpgradePath, UpgradePath];
}

export interface EnemyDefinition {
  id: string;
  name: string;
  worldId: WorldId;
  enemyClass: EnemyClass;
  baseHp: number;
  speed: number; // map units per second
  armor: number; // flat damage reduction before pierce
  magicResist: number; // 0..0.75
  shieldHp?: number;
  coinReward: number;
  castleDamage: number;
  specialAbility: string;
  isFlying: boolean;
  isBoss?: boolean;
  regenPerSec?: number;
  poisonResistant?: boolean;
  dodgeChance?: number;
  sciFiAbility?: SciFiEnemyAbility;
  bodyColor: string;
  accentColor: string;
  size: number;
}

export interface RoadPath {
  id: string;
  name: string;
  points: Vec2[];
  width: number;
}

export interface BuildZone {
  id: string;
  x: number;
  y: number;
  radius: number;
}

export interface DecorObject {
  kind:
    | 'ruin_pillar'
    | 'dead_tree'
    | 'tombstone'
    | 'pine_tree'
    | 'poison_pond'
    | 'giant_root'
    | 'lava_pool'
    | 'volcano_rock'
    | 'ice_crystal'
    | 'snow_pine'
    | 'pyramid'
    | 'palm_dune'
    | 'cloud_cluster'
    | 'sky_ruin'
    | 'temple_obelisk'
    | 'giant_mushroom'
    | 'coral_cluster'
    | 'dragon_spire'
    | 'banner'
    | 'wrecked_mech'
    | 'cyber_pylon'
    | 'toxic_vat'
    | 'mutant_pod'
    | 'frozen_turret'
    | 'glacier_spire'
    | 'void_obelisk'
    | 'rift_gate'
    | 'omega_citadel'
    | 'plasma_beacon';
  x: number;
  y: number;
  scale: number;
}

export interface WaveGroup {
  enemyId: string;
  count: number;
  spawnInterval: number; // seconds
  pathIndex: number;
  delayBeforeGroup: number; // seconds after wave start or previous group
}

export interface WaveConfig {
  waveNumber: number;
  announcement: string;
  delayBeforeWave: number;
  bonusCoins: number;
  groups: WaveGroup[];
  miniBossId?: string;
}

export interface BossPhase {
  hpThresholdPct: number; // e.g. 0.7, 0.35
  name: string;
  ability: 'summon_minions' | 'shield_burst' | 'speed_surge' | 'tower_jam' | 'meteor_aura';
  description: string;
}

export interface BossConfig {
  enemyId: string;
  name: string;
  title: string;
  hp: number;
  armor: number;
  speed: number;
  coinReward: number;
  castleDamage: number;
  resistances: string[];
  abilities: string[];
  phases: BossPhase[];
}

export interface BonusObjective {
  id: string;
  description: string;
  type: 'min_castle_hp_pct' | 'max_towers_built' | 'no_leaks' | 'mcq_perfect';
  threshold: number;
  rewardCoins: number;
}

export interface SpiderNestConfig {
  id: string;
  x: number;
  y: number;
  pathIndex: number;
  maxHp: number;
  armor?: number;
  coinReward: number;
  spawnInterval: number;
  maxSpawns: number;
  batchSize?: number;
  enemyId: string;
  label: string;
}

export interface ActiveSpiderNestState {
  id: string;
  x: number;
  y: number;
  pathIndex: number;
  waypointIndex: number;
  hp: number;
  maxHp: number;
  armor: number;
  coinReward: number;
  spawnInterval: number;
  spawnCooldown: number;
  spawnsRemaining: number;
  maxSpawns: number;
  spawnedCount: number;
  batchSize: number;
  enemyId: string;
  label: string;
  destroyed: boolean;
  hitFlash: number;
  destroyAnimTimer: number;
  size: number;
}

export interface LevelConfig {
  id: number; // 1..100
  name: string;
  worldId: WorldId;
  worldName: string;
  description: string;
  objective: string;
  difficulty: DifficultyBand;
  difficultyRating: number; // 1..10
  environment: {
    terrainLabel: string;
    backgroundTint: string;
    roadTint: string;
    hazard: EnvironmentHazard;
    hazardDescription: string;
    decorations: DecorObject[];
  };
  spawns: { x: number; y: number; label: string }[];
  spiderNests?: SpiderNestConfig[];
  castle: { x: number; y: number; name: string };
  roadLayout: {
    paths: RoadPath[];
    totalLength: number;
    curvesDescription: string;
    hasJunctions: boolean;
  };
  buildZones: BuildZone[];
  castleHealth: number;
  startingCoins: number;
  waveCount: number;
  waves: WaveConfig[];
  enemyStatScale: {
    hpMultiplier: number;
    speedMultiplier: number;
    armorBonus: number;
    coinMultiplier: number;
  };
  availableWeapons: WeaponId[];
  weaponCostOverrides?: Partial<Record<WeaponId, number>>;
  restrictions: string[];
  specialChallenges: string[];
  maxTowersAllowed?: number;
  bossConfig?: BossConfig;
  victoryCondition: string;
  defeatCondition: string;
  rewards: {
    coins: number;
    xp: number;
    maxStars: 3;
  };
  unlockRequirement: {
    previousLevelId: number | null;
    minStarsInWorld?: number;
  };
  bonusObjectives: BonusObjective[];
}

export type McqCognitiveLevel = 'knowledge' | 'understanding' | 'application' | 'reasoning';
export type McqDifficulty = 'easy' | 'medium' | 'hard';
export type McqScienceBranch = 'biology' | 'physics' | 'chemistry';

export type McqUnitId =
  | 'G10_U01'
  | 'G10_U02'
  | 'G10_U03'
  | 'G10_U04'
  | 'G10_U05'
  | 'G10_U06'
  | 'G10_U07'
  | 'G10_U08'
  | 'G10_U09'
  | 'G10_U10'
  | 'G10_U11'
  | 'G10_U12'
  | 'G10_U13'
  | 'G10_U14'
  | 'G10_U15'
  | 'G10_U16'
  | 'G10_U17'
  | 'G10_U18'
  | 'G10_U19'
  | 'G10_U20';

export type McqStudyModeId = McqUnitId | 'ALL_UNITS';

export interface McqDataTable {
  headers: string[];
  rows: string[][];
}

export interface McqLessonDef {
  id: McqUnitId;
  grade: 10;
  unitNumber: number;
  title: string;
  subtitle: string;
  branch: McqScienceBranch;
  unlockAfterLessonId: string | null;
  questionCount: number;
}

export interface McqLessonProgress {
  attempts: number;
  bestScore: number;
  stars: 0 | 1 | 2 | 3;
  completed: boolean;
}

export interface McqModeProgress {
  modeId: McqStudyModeId;
  currentLevel: number; // 1..100
  completedLevels: number[]; // sorted level numbers 1..100
  levelStars: Record<number, 0 | 1 | 2 | 3>;
  levelBestScores: Record<number, number>; // 0..10
  totalAnswered: number;
  totalCorrect: number;
  totalScore: number;
  perfectLevels: number;
  seenQuestionIds: string[];
  lastQuestionId?: string | null;
}

export interface McqQuestion {
  id: string;
  question_id?: string;
  lessonId: string;
  grade: 10;
  unitNumber: number;
  unit_id?: McqUnitId;
  unit_name?: string;
  lessonName: string;
  topic: string;
  difficulty: McqDifficulty;
  cognitiveLevel: McqCognitiveLevel;
  question: string;
  dataTable?: McqDataTable;
  options: [string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3;
  correct_answer?: string;
  explanation: string;
  textbook_reference?: string;
}

export type ResolvedMcqQuestion = McqQuestion & {
  question_id: string;
  unit_id: McqUnitId;
  unit_name: string;
  correct_answer: string;
  textbook_reference: string;
};

export type EnemySpeedMultiplier = 0.5 | 1 | 1.5 | 2;

export interface AchievementDef {
  id: string;
  title: string;
  description: string;
  rewardCoins: number;
  metric: 'levels_cleared' | 'total_stars' | 'kills' | 'mcq_correct' | 'mcq_perfect_sets' | 'bosses_slain';
  target: number;
}

export interface GraphicsSettings {
  particles: 'high' | 'low';
  showRangeAlways: boolean;
  showDamageNumbers: boolean;
}

export interface SaveData {
  coins: number;
  xp: number;
  playerLevel: number;
  highestUnlockedLevel: number;
  levelStars: Record<number, number>; // 1..3
  levelBestScores: Record<number, number>;
  unlockedWeapons: WeaponId[];
  specialAbilitiesUnlocked: string[];
  answeredMcqIds: string[];
  mcqTotalAnswered: number;
  mcqTotalCorrect: number;
  mcqPerfectSets: number;
  mcqLessonProgress: Record<string, McqLessonProgress>;
  mcqSelectedMode: McqStudyModeId | null;
  mcqModeProgress: Record<string, McqModeProgress>;
  totalKills: number;
  bossesSlain: number;
  claimedAchievements: string[];
  claimedWorldBonuses: WorldId[];
  dailyLastClaimDate: string | null;
  dailyStreak: number;
  musicEnabled: boolean;
  sfxEnabled: boolean;
  graphics: GraphicsSettings;
}

export interface PlacedTowerState {
  instanceId: string;
  zoneId: string;
  weaponId: WeaponId;
  x: number;
  y: number;
  pathChoices: { A: number; B: number; C: number };
  totalInvested: number;
  targeting: TargetingMode;
  kills: number;
  cooldown: number;
  angle: number;
  recoil: number;
  jammedTimer: number;
}

export interface ActiveEnemyState {
  instanceId: string;
  enemyId: string;
  name: string;
  enemyClass: EnemyClass;
  pathIndex: number;
  waypointIndex: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  hp: number;
  maxHp: number;
  shield: number;
  maxShield: number;
  armor: number;
  magicResist: number;
  speed: number;
  coinReward: number;
  castleDamage: number;
  isFlying: boolean;
  isBoss: boolean;
  regenPerSec: number;
  poisonResistant: boolean;
  dodgeChance: number;
  attackLungeTimer: number;
  bodyColor: string;
  accentColor: string;
  size: number;
  slowTimer: number;
  slowFactor: number;
  poisonTimer: number;
  poisonDps: number;
  burnTimer: number;
  burnDps: number;
  distanceTraveled: number;
  hitFlash: number;
  phaseIndex: number;
  abilityCooldown: number;
  sciFiAbility?: SciFiEnemyAbility;
  airWaypoints?: Vec2[];
  flyAltitude?: number;
  stealthTimer: number;
  dashTimer: number;
  speedBoostTimer: number;
  walkPhase: number;
}

export interface ActiveDroneState {
  id: string;
  towerId: string;
  x: number;
  y: number;
  homeX: number;
  homeY: number;
  angle: number;
  cooldown: number;
  targetId: string | null;
  orbitAngle: number;
  stage: number;
}

export interface DefeatedEffect {
  x: number;
  y: number;
  enemyId: string;
  isBoss: boolean;
  bodyColor: string;
  accentColor: string;
  size: number;
  life: number;
  maxLife: number;
}

export interface BattleSnapshot {
  status: 'idle' | 'playing' | 'paused' | 'shop_pause' | 'mcq_pause' | 'victory' | 'defeat';
  levelId: number;
  castleHp: number;
  maxCastleHp: number;
  castleDamageFlash: number;
  coins: number;
  score: number;
  currentWave: number;
  totalWaves: number;
  waveCountdown: number;
  waveAnnouncement: string | null;
  enemiesRemaining: number;
  kills: number;
  leaks: number;
  towersBuilt: number;
  enemySpeedMultiplier: EnemySpeedMultiplier;
  activeBoss: {
    name: string;
    title: string;
    hp: number;
    maxHp: number;
    phaseName: string;
  } | null;
  spiderNests: ActiveSpiderNestState[];
  selectedZoneId: string | null;
  previewWeaponId: WeaponId | null;
  pendingWeaponToBuild: WeaponId | null;
  selectedTower: PlacedTowerState | null;
  selectedEnemy: ActiveEnemyState | null;
  selectedNest: ActiveSpiderNestState | null;
  focusedNestId: string | null;
  specialCharges: {
    arcaneStorm: number;
    castleRepair: number;
    goldSurge: number;
  };
}
