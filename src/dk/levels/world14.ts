import { DecorObject, LevelConfig, RoadPath, WaveConfig } from '../types';
import { ALL_WEAPONS, createLevel } from './helpers';

interface MapBlueprint {
  spawns: { x: number; y: number; label: string }[];
  castle: { x: number; y: number; name: string };
  paths: RoadPath[];
  zoneCoords: [number, number][];
  hasJunctions: boolean;
  curvesDescription: string;
}

function makeBlueprint(variant: number): MapBlueprint {
  const layouts: MapBlueprint[] = [
    {
      spawns: [{ x: 70, y: 360, label: 'අවකාශ විවර දොරටුව' }],
      castle: { x: 1190, y: 360, name: 'මාන ආරක්ෂක මධ්‍යස්ථානය' },
      paths: [
        {
          id: 'void_spiral',
          name: 'අන්තර්-මාන සර්ප මග',
          width: 48,
          points: [
            { x: 70, y: 360 },
            { x: 260, y: 140 },
            { x: 560, y: 140 },
            { x: 640, y: 580 },
            { x: 940, y: 580 },
            { x: 1030, y: 210 },
            { x: 1190, y: 360 },
          ],
        },
      ],
      zoneCoords: [
        [205, 255], [395, 245], [395, 465], [510, 355], [770, 260],
        [770, 455], [935, 355], [1095, 470], [640, 75], [275, 575],
      ],
      hasJunctions: false,
      curvesDescription: 'අවකාශ පිමි එල්ල වන දිගු වංගු සහිත මාන මාර්ගය.',
    },
    {
      spawns: [
        { x: 70, y: 165, label: 'උතුරු රිෆ්ට් විවරය' },
        { x: 70, y: 555, label: 'දකුණු රිෆ්ට් විවරය' },
      ],
      castle: { x: 1190, y: 360, name: 'ශුන්‍ය බලකොටුව' },
      paths: [
        {
          id: 'void_north',
          name: 'උතුරු මාන මාර්ගය',
          width: 46,
          points: [
            { x: 70, y: 165 },
            { x: 430, y: 165 },
            { x: 590, y: 360 },
            { x: 870, y: 195 },
            { x: 1055, y: 360 },
            { x: 1190, y: 360 },
          ],
        },
        {
          id: 'void_south',
          name: 'දකුණු මාන මාර්ගය',
          width: 46,
          points: [
            { x: 70, y: 555 },
            { x: 430, y: 555 },
            { x: 590, y: 360 },
            { x: 870, y: 525 },
            { x: 1055, y: 360 },
            { x: 1190, y: 360 },
          ],
        },
      ],
      zoneCoords: [
        [235, 265], [235, 455], [420, 360], [700, 195], [700, 525],
        [870, 360], [1015, 200], [1015, 520], [520, 95], [520, 625],
      ],
      hasJunctions: true,
      curvesDescription: 'ද්විත්ව අවකාශ විවර හරහා එක්වන සටන් භූමිය.',
    },
    {
      spawns: [{ x: 70, y: 135, label: 'බටහිර අවකාශ දොරටුව' }],
      castle: { x: 1190, y: 580, name: 'ආකාශ බලකොටුව' },
      paths: [
        {
          id: 'void_switchback',
          name: 'මාන සිග්සැග් මග',
          width: 48,
          points: [
            { x: 70, y: 135 },
            { x: 960, y: 135 },
            { x: 960, y: 300 },
            { x: 250, y: 300 },
            { x: 250, y: 475 },
            { x: 960, y: 475 },
            { x: 960, y: 580 },
            { x: 1190, y: 580 },
          ],
        },
      ],
      zoneCoords: [
        [210, 215], [440, 215], [660, 215], [855, 215], [400, 388],
        [630, 388], [840, 388], [1075, 225], [1075, 435], [560, 575],
      ],
      hasJunctions: false,
      curvesDescription: 'ටෙලිපෝට් සතුරන් පාලනය කිරීමට උපකාරී වන බහු-හැරවුම් මාර්ගය.',
    },
    {
      spawns: [
        { x: 70, y: 165, label: 'උතුරු ආකොන් විවරය' },
        { x: 70, y: 555, label: 'දකුණු ආකොන් විවරය' },
      ],
      castle: { x: 1190, y: 360, name: 'අන්තර්-මාන අවසන් බලකොටුව' },
      paths: [
        {
          id: 'archon_north',
          name: 'උතුරු ආකොන් මග',
          width: 48,
          points: [
            { x: 70, y: 165 },
            { x: 370, y: 165 },
            { x: 370, y: 360 },
            { x: 690, y: 175 },
            { x: 970, y: 175 },
            { x: 1055, y: 360 },
            { x: 1190, y: 360 },
          ],
        },
        {
          id: 'archon_south',
          name: 'දකුණු ආකොන් මග',
          width: 48,
          points: [
            { x: 70, y: 555 },
            { x: 370, y: 555 },
            { x: 370, y: 360 },
            { x: 690, y: 545 },
            { x: 970, y: 545 },
            { x: 1055, y: 360 },
            { x: 1190, y: 360 },
          ],
        },
      ],
      zoneCoords: [
        [220, 265], [220, 455], [510, 155], [510, 565], [680, 360],
        [835, 285], [835, 435], [1015, 100], [1015, 620], [1135, 240],
      ],
      hasJunctions: true,
      curvesDescription: 'අවකාශ ආකොන් සෙන්පති පියාසර කරන දියමන්ති මාන යුධ බිම.',
    },
  ];
  return layouts[variant % layouts.length];
}

const DECORS_W14: DecorObject[] = [
  { kind: 'void_obelisk', x: 175, y: 95, scale: 1.3 },
  { kind: 'rift_gate', x: 640, y: 90, scale: 1.25 },
  { kind: 'void_obelisk', x: 1105, y: 635, scale: 1.35 },
  { kind: 'rift_gate', x: 175, y: 635, scale: 1.25 },
];

function buildWaves(offset: number, twoPaths: boolean): WaveConfig[] {
  const c = (n: number) => Math.max(4, Math.round(n * (1 + offset * 0.045)));
  const alt = (i: number) => (twoPaths ? i % 2 : 0);

  const waves: WaveConfig[] = [
    {
      waveNumber: 1,
      announcement: 'අවකාශ පිමි රකුසන්ගේ රැල්ල',
      delayBeforeWave: 2,
      bonusCoins: 310 + offset * 24,
      groups: [
        { enemyId: 'void_teleporter', count: c(10), spawnInterval: 0.78, pathIndex: 0, delayBeforeGroup: 0 },
        { enemyId: 'void_teleporter', count: c(6), spawnInterval: 0.82, pathIndex: alt(1), delayBeforeGroup: 1.8 },
      ],
    },
    {
      waveNumber: 2,
      announcement: 'අවකාශ යෝධයින් හා අවහිර නේත්‍ර',
      delayBeforeWave: 5,
      bonusCoins: 360 + offset * 26,
      groups: [
        { enemyId: 'void_rift_juggernaut', count: c(7), spawnInterval: 1.45, pathIndex: 0, delayBeforeGroup: 0 },
        { enemyId: 'void_disruptor_eye', count: c(8), spawnInterval: 1.1, pathIndex: alt(1), delayBeforeGroup: 1.8 },
      ],
    },
    {
      waveNumber: 3,
      announcement: 'ලෙවියාතන් ගුවන් පිමි ප්‍රහාරය',
      delayBeforeWave: 6,
      bonusCoins: 420 + offset * 30,
      groups: [
        { enemyId: 'void_leviathan_flyer', count: c(14), spawnInterval: 0.56, pathIndex: 0, delayBeforeGroup: 0 },
        { enemyId: 'void_teleporter', count: c(16), spawnInterval: 0.48, pathIndex: alt(1), delayBeforeGroup: 1.5 },
      ],
    },
    {
      waveNumber: 4,
      announcement: 'ද්විත්ව මාන වටලෑම',
      delayBeforeWave: 6,
      bonusCoins: 480 + offset * 34,
      groups: [
        { enemyId: 'void_rift_juggernaut', count: c(10), spawnInterval: 1.15, pathIndex: 0, delayBeforeGroup: 0 },
        { enemyId: 'void_disruptor_eye', count: c(12), spawnInterval: 0.85, pathIndex: alt(1), delayBeforeGroup: 1.4 },
        { enemyId: 'void_leviathan_flyer', count: c(16), spawnInterval: 0.48, pathIndex: 0, delayBeforeGroup: 2.4 },
      ],
    },
    {
      waveNumber: 5,
      announcement: 'අවකාශ කුණාටු රැල්ල',
      delayBeforeWave: 6,
      bonusCoins: 550 + offset * 38,
      groups: [
        { enemyId: 'void_teleporter', count: c(20), spawnInterval: 0.42, pathIndex: 0, delayBeforeGroup: 0 },
        { enemyId: 'void_rift_juggernaut', count: c(12), spawnInterval: 1.05, pathIndex: alt(1), delayBeforeGroup: 1.2 },
        { enemyId: 'void_leviathan_flyer', count: c(18), spawnInterval: 0.42, pathIndex: 0, delayBeforeGroup: 2.2 },
      ],
    },
  ];

  if (offset >= 4) {
    waves.push({
      waveNumber: 6,
      announcement: 'අන්තර්-මාන මහා ප්‍රහාරය',
      delayBeforeWave: 7,
      bonusCoins: 650 + offset * 42,
      groups: [
        { enemyId: 'void_stalker', count: c(10), spawnInterval: 1.1, pathIndex: 0, delayBeforeGroup: 0 },
        { enemyId: 'void_disruptor_eye', count: c(14), spawnInterval: 0.78, pathIndex: alt(1), delayBeforeGroup: 1.2 },
        { enemyId: 'void_leviathan_flyer', count: c(20), spawnInterval: 0.38, pathIndex: 0, delayBeforeGroup: 2.0 },
      ],
    });
  }

  return waves;
}

const NAMES_W14 = [
  'අවකාශ විවර දොරටුව',
  'ටෙලිපෝට් නිම්නය',
  'ශුන්‍ය රිෆ්ට් පාලම',
  'අවහිර නේත්‍ර කලාපය',
  'ලෙවියාතන් ගුවන් පථය',
  'ද්විත්ව මාන දුර්ගය',
  'පලිහ විවර කඳවුර',
  'අන්තර්-මාන කුණාටුව',
  'ආකොන් පෙරමුණු බලකොටුව',
  'අවකාශ ආකොන් සෙන්පති',
];

export const WORLD_14_LEVELS: LevelConfig[] = NAMES_W14.map((name, idx) => {
  const id = 81 + idx;
  const isBoss = id === 90;
  const bp = makeBlueprint(isBoss ? 3 : idx % 3);
  const twoPaths = bp.paths.length > 1;
  const waves: WaveConfig[] = isBoss
    ? [
        ...buildWaves(idx, true).slice(0, 4),
        {
          waveNumber: 5,
          announcement: 'ප්‍රධාන සතුරා: අවකාශ ආකොන් සෙන්පති!',
          delayBeforeWave: 8,
          bonusCoins: 3200,
          groups: [
            { enemyId: 'boss_void_archon', count: 1, spawnInterval: 1.0, pathIndex: 0, delayBeforeGroup: 0 },
            { enemyId: 'void_rift_juggernaut', count: 10, spawnInterval: 1.5, pathIndex: 1, delayBeforeGroup: 2.5 },
            { enemyId: 'void_disruptor_eye', count: 10, spawnInterval: 1.4, pathIndex: 0, delayBeforeGroup: 4.0 },
            { enemyId: 'void_leviathan_flyer', count: 16, spawnInterval: 0.68, pathIndex: 1, delayBeforeGroup: 5.0 },
          ],
        },
      ]
    : buildWaves(idx, twoPaths);

  return createLevel({
    id,
    name,
    worldId: 'void_dimension',
    isWidescreen16x9: true,
    description: isBoss
      ? 'අහසින් පියාසර කරන අවකාශ ආකොන් සෙන්පති ලෙවියාතන් යානා සහ අවකාශ පිමි සමඟ පැමිණේ!'
      : `මාර්ගය දිගේ ක්ෂණිකව ටෙලිපෝට් වන ${name} සතුරු හමුදා නවත්වන්න.`,
    objective: isBoss ? 'අවකාශ ආකොන් සෙන්පති පරාජය කරන්න.' : `සතුරු වට ${waves.length}ම ජයගන්න.`,
    difficultyRating: 10,
    hazard: 'void_rift',
    hazardDescription: 'අවකාශ විවරය: බලශක්ති පලිහ +10% කින් ශක්තිමත් වන අතර සතුරන් ඉදිරියට ටෙලිපෝට් වේ.',
    decorations: DECORS_W14,
    spawns: bp.spawns,
    castle: bp.castle,
    paths: bp.paths,
    curvesDescription: bp.curvesDescription,
    hasJunctions: bp.hasJunctions,
    zoneCoords: bp.zoneCoords,
    castleHealth: isBoss ? 42 : 34 + Math.floor(idx / 3),
    startingCoins: 4050 + idx * 205 + (isBoss ? 850 : 0),
    waves,
    enemyStatScale: {
      hpMultiplier: Number((1.06 + idx * 0.03).toFixed(2)),
      speedMultiplier: Number((1.01 + idx * 0.008).toFixed(2)),
      armorBonus: 8 + Math.floor(idx / 2),
      coinMultiplier: Number((1.16 + idx * 0.025).toFixed(2)),
    },
    availableWeapons: ALL_WEAPONS,
    restrictions: ['අවකාශ පිමි (Teleport) · පියාසර ලෙවියාතන් යානා · දිගු දුර අවහිර නේත්‍ර'],
    specialChallenges: ['බලකොටුව අසල ද ගුවන් ආරක්ෂක හා ටයිටන් ප්ලාස්මා කුළුණු ස්ථාපනය කරන්න!'],
    bossConfig: isBoss
      ? {
          enemyId: 'boss_void_archon',
          name: 'අවකාශ ආකොන් සෙන්පති',
          title: 'විශ්වීය මාන අධිපති (පියාසර ප්‍රධාන සතුරා)',
          hp: 76000,
          armor: 92,
          speed: 44,
          coinReward: 2400,
          castleDamage: 99,
          resistances: ['පියාසර ප්‍රධාන සතුරා', '92 අවකාශ සන්නාහය', '12500 මාන පලිහ'],
          abilities: ['ලෙවියාතන් ගුවන් කැඳවීම', 'මාන කුළුණු අවහිරය', 'පලිහ පුපුරුවීම හා වේග ප්‍රහාරය'],
          phases: [
            { hpThresholdPct: 0.75, name: 'ලෙවියාතන් සේනාව', ability: 'summon_minions', description: 'අවකාශ සගයන් කැඳවයි.' },
            { hpThresholdPct: 0.48, name: 'මාන බිඳීම', ability: 'tower_jam', description: 'ආසන්න කුළුණු අක්‍රීය කරයි.' },
            { hpThresholdPct: 0.22, name: 'ශුන්‍ය පලිහ පුපුරුවීම', ability: 'shield_burst', description: 'පලිහ නැවත පුරවා වේගයෙන් ඇදේ.' },
          ],
        }
      : undefined,
    rewards: { coins: 3400 + idx * 200 + (isBoss ? 2200 : 0), xp: 3600 + idx * 210 },
    bonusObjectives: [
      {
        id: `l${id}_hp`,
        description: 'බලකොටුව 85% ට වැඩි ජීව ශක්තියකින් රැකගන්න',
        type: 'min_castle_hp_pct',
        threshold: 85,
        rewardCoins: 600 + idx * 35,
      },
    ],
  });
});
