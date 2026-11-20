import {
  BossConfig,
  BonusObjective,
  BuildZone,
  DecorObject,
  DifficultyBand,
  EnvironmentHazard,
  LevelConfig,
  RoadPath,
  SpiderNestConfig,
  Vec2,
  WaveConfig,
  WeaponId,
  WorldId,
} from '../types';
import { SI_LEVELS } from '../localization/siLevels';
import { WORLD_MAP } from '../worlds';

export const ALL_WEAPONS: WeaponId[] = [
  'shadow_archer',
  'iron_cannon',
  'ice_wizard',
  'thunder_tower',
  'poison_tower',
  'fire_dragon',
  'crystal_laser',
  'ancient_guardian',
  'sky_hunter',
  'missile_platform',
  'storm_cannon',
  'drone_station',
  'plasma_air_defense',
  'titan_plasma_cannon',
];

export function getDifficultyBand(levelId: number): DifficultyBand {
  if (levelId <= 5) return 'Easy';
  if (levelId <= 10) return 'Normal';
  if (levelId <= 20) return 'Hard';
  if (levelId <= 30) return 'Very Hard';
  if (levelId <= 40) return 'Expert';
  return 'Nightmare';
}

export function computePathLength(points: Vec2[]): number {
  let len = 0;
  for (let i = 1; i < points.length; i++) {
    const dx = points[i].x - points[i - 1].x;
    const dy = points[i].y - points[i - 1].y;
    len += Math.hypot(dx, dy);
  }
  return Math.round(len);
}

export function distToSegment(p: Vec2, a: Vec2, b: Vec2): number {
  const vx = b.x - a.x;
  const vy = b.y - a.y;
  const wx = p.x - a.x;
  const wy = p.y - a.y;
  const lenSq = vx * vx + vy * vy;
  if (lenSq === 0) return Math.hypot(wx, wy);
  const t = Math.max(0, Math.min(1, (wx * vx + wy * vy) / lenSq));
  const px = a.x + t * vx;
  const py = a.y + t * vy;
  return Math.hypot(p.x - px, p.y - py);
}

export function isZoneClearOfRoads(zone: BuildZone, paths: RoadPath[]): boolean {
  for (const path of paths) {
    const minReq = path.width * 0.5 + zone.radius + 4;
    for (let i = 1; i < path.points.length; i++) {
      if (distToSegment(zone, path.points[i - 1], path.points[i]) < minReq) {
        return false;
      }
    }
  }
  return true;
}

export function makeZones(
  prefix: string,
  coords: [number, number][],
  paths: RoadPath[]
): BuildZone[] {
  return coords.map(([x, y], idx) => {
    const zone: BuildZone = {
      id: `${prefix}_z${idx + 1}`,
      x,
      y,
      radius: 26,
    };
    // Safety fallback nudge if a manually authored coordinate touches road edge
    if (!isZoneClearOfRoads(zone, paths)) {
      const offsets: [number, number][] = [
        [0, -34], [0, 34], [-34, 0], [34, 0],
        [0, -52], [0, 52], [-52, 0], [52, 0],
      ];
      for (const [ox, oy] of offsets) {
        const candidate: BuildZone = {
          ...zone,
          x: Math.max(58, Math.min(1222, x + ox)),
          y: Math.max(66, Math.min(654, y + oy)),
        };
        if (isZoneClearOfRoads(candidate, paths)) return candidate;
      }
    }
    return zone;
  });
}

export interface LevelInput {
  id: number;
  name: string;
  worldId: WorldId;
  description: string;
  objective: string;
  difficultyRating: number;
  isWidescreen16x9?: boolean;
  hazard?: EnvironmentHazard;
  hazardDescription: string;
  decorations: DecorObject[];
  spawns: { x: number; y: number; label: string }[];
  spiderNests?: SpiderNestConfig[];
  castle: { x: number; y: number; name: string };
  paths: RoadPath[];
  curvesDescription: string;
  hasJunctions: boolean;
  zoneCoords: [number, number][];
  castleHealth: number;
  startingCoins: number;
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
  rewards: { coins: number; xp: number };
  bonusObjectives: BonusObjective[];
}

export function createLevel(input: LevelInput): LevelConfig {
  const world = WORLD_MAP[input.worldId];
  const sx = input.isWidescreen16x9 ? 1 : 1.28;
  const sy = input.isWidescreen16x9 ? 1 : 1.2;

  const scaledPaths: RoadPath[] = input.paths.map((p) => ({
    ...p,
    width: Math.round(p.width * (input.isWidescreen16x9 ? 1 : 1.18)),
    points: p.points.map((pt) => ({
      x: Math.round(pt.x * sx),
      y: Math.round(pt.y * sy),
    })),
  }));

  const scaledSpawns = input.spawns.map((s) => ({
    ...s,
    x: Math.round(s.x * sx),
    y: Math.round(s.y * sy),
  }));

  const scaledSpiderNests = input.spiderNests?.map((n) => ({
    ...n,
    x: Math.round(n.x * sx),
    y: Math.round(n.y * sy),
  }));

  const scaledCastle = {
    ...input.castle,
    x: Math.round(input.castle.x * sx),
    y: Math.round(input.castle.y * sy),
  };

  const scaledDecorations: DecorObject[] = input.decorations.map((d) => ({
    ...d,
    x: Math.round(d.x * sx),
    y: Math.round(d.y * sy),
    scale: Number((d.scale * (input.isWidescreen16x9 ? 1 : 1.14)).toFixed(2)),
  }));

  const scaledZoneCoords: [number, number][] = input.zoneCoords.map(([zx, zy]) => [
    Math.round(zx * sx),
    Math.round(zy * sy),
  ]);

  const totalLength = scaledPaths.reduce((sum, p) => sum + computePathLength(p.points), 0);
  const buildZones = makeZones(`l${input.id}`, scaledZoneCoords, scaledPaths);
  const tr = SI_LEVELS[input.id];

  const localizedSpawns = scaledSpawns.map((s, i) => ({
    ...s,
    label: tr?.spawns[i] ?? s.label,
  }));

  const localizedCastle = {
    ...scaledCastle,
    name: tr?.castleName ?? scaledCastle.name,
  };

  const localizedWaves = input.waves.map((w, i) => ({
    ...w,
    announcement: tr?.waves[i] ?? w.announcement,
  }));

  const localizedBonusObjectives = input.bonusObjectives.map((bo, i) => ({
    ...bo,
    description: tr?.bonusObjectives[i] ?? bo.description,
  }));

  const localizedBossConfig =
    input.bossConfig && tr?.boss
      ? {
          ...input.bossConfig,
          name: tr.boss.name,
          title: tr.boss.title,
          resistances: tr.boss.resistances,
          abilities: tr.boss.abilities,
          phases: input.bossConfig.phases.map((p, i) => ({
            ...p,
            name: tr.boss!.phases[i]?.name ?? p.name,
            description: tr.boss!.phases[i]?.description ?? p.description,
          })),
        }
      : input.bossConfig;

  return {
    id: input.id,
    name: tr?.name ?? input.name,
    worldId: input.worldId,
    worldName: world.name,
    description: tr?.description ?? input.description,
    objective: tr?.objective ?? input.objective,
    difficulty: getDifficultyBand(input.id),
    difficultyRating: input.difficultyRating,
    environment: {
      terrainLabel: world.terrainName,
      backgroundTint: world.bgPrimaryHex,
      roadTint: world.roadFillHex,
      hazard: input.hazard ?? world.hazard,
      hazardDescription: tr?.hazardDescription ?? input.hazardDescription,
      decorations: scaledDecorations,
    },
    spawns: localizedSpawns,
    spiderNests: scaledSpiderNests,
    castle: localizedCastle,
    roadLayout: {
      paths: scaledPaths,
      totalLength,
      curvesDescription: tr?.curvesDescription ?? input.curvesDescription,
      hasJunctions: input.hasJunctions,
    },
    buildZones,
    castleHealth: input.castleHealth,
    startingCoins: input.startingCoins,
    waveCount: input.waves.length,
    waves: localizedWaves,
    enemyStatScale: input.enemyStatScale,
    availableWeapons: input.availableWeapons,
    weaponCostOverrides: input.weaponCostOverrides,
    restrictions: tr?.restrictions ?? input.restrictions,
    specialChallenges: tr?.specialChallenges ?? input.specialChallenges,
    maxTowersAllowed: input.maxTowersAllowed,
    bossConfig: localizedBossConfig,
    victoryCondition: `බලකොටුව බිඳ වැටීමට පෙර සතුරු වට ${input.waves.length}ම ජය ගන්න.`,
    defeatCondition: 'බලකොටුවේ ජීව ශක්තිය 0 දක්වා අඩු වීම.',
    rewards: {
      coins: input.rewards.coins,
      xp: input.rewards.xp,
      maxStars: 3,
    },
    unlockRequirement: {
      previousLevelId: input.id === 1 ? null : input.id - 1,
      minStarsInWorld:
        input.id > 50
          ? input.id % 10 === 1
            ? world.unlockStarsRequired
            : undefined
          : input.id % 5 === 1 && input.id > 1
            ? world.unlockStarsRequired
            : undefined,
    },
    bonusObjectives: localizedBonusObjectives,
  };
}
