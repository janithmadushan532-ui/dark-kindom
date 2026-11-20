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
      spawns: [{ x: 70, y: 145, label: 'උතුරු ග්ලැසියර පිවිසුම' }],
      castle: { x: 1190, y: 560, name: 'හිම මුර බලකොටුව' },
      paths: [
        {
          id: 'cryo_pass',
          name: 'ග්ලැසියර මාර්ගය',
          width: 48,
          points: [
            { x: 70, y: 145 },
            { x: 480, y: 145 },
            { x: 480, y: 560 },
            { x: 830, y: 560 },
            { x: 830, y: 175 },
            { x: 1055, y: 175 },
            { x: 1055, y: 560 },
            { x: 1190, y: 560 },
          ],
        },
      ],
      zoneCoords: [
        [265, 245], [375, 245], [375, 455], [600, 260], [600, 455],
        [725, 260], [725, 455], [945, 285], [945, 455], [1135, 340],
      ],
      hasJunctions: false,
      curvesDescription: 'හිම කඳු අතරින් දිවෙන දිගු ග්ලැසියර වංගු මාර්ගය.',
    },
    {
      spawns: [
        { x: 70, y: 165, label: 'උතුරු ක්‍රයෝ දොරටුව' },
        { x: 70, y: 555, label: 'දකුණු ක්‍රයෝ දොරටුව' },
      ],
      castle: { x: 1190, y: 360, name: 'ශීත මෙක් බලකොටුව' },
      paths: [
        {
          id: 'cryo_north',
          name: 'උතුරු හිම මංතීරුව',
          width: 46,
          points: [
            { x: 70, y: 165 },
            { x: 420, y: 165 },
            { x: 580, y: 360 },
            { x: 860, y: 205 },
            { x: 1050, y: 360 },
            { x: 1190, y: 360 },
          ],
        },
        {
          id: 'cryo_south',
          name: 'දකුණු හිම මංතීරුව',
          width: 46,
          points: [
            { x: 70, y: 555 },
            { x: 420, y: 555 },
            { x: 580, y: 360 },
            { x: 860, y: 515 },
            { x: 1050, y: 360 },
            { x: 1190, y: 360 },
          ],
        },
      ],
      zoneCoords: [
        [230, 265], [230, 455], [415, 275], [415, 445], [640, 225],
        [640, 495], [820, 265], [820, 455], [1010, 265], [1010, 455],
      ],
      hasJunctions: true,
      curvesDescription: 'මධ්‍යයේදී එක්වන ද්විත්ව හිම කුණාටු මාර්ගය.',
    },
    {
      spawns: [{ x: 70, y: 360, label: 'මධ්‍ය ක්‍රයෝ විවරය' }],
      castle: { x: 1190, y: 360, name: 'ශීත න්‍යෂ්ටික මධ්‍යස්ථානය' },
      paths: [
        {
          id: 'upper_frost',
          name: 'ඉහළ හිම මාර්ගය',
          width: 46,
          points: [
            { x: 70, y: 360 },
            { x: 265, y: 360 },
            { x: 395, y: 145 },
            { x: 870, y: 145 },
            { x: 995, y: 360 },
            { x: 1190, y: 360 },
          ],
        },
        {
          id: 'lower_frost',
          name: 'පහළ හිම මාර්ගය',
          width: 46,
          points: [
            { x: 70, y: 360 },
            { x: 265, y: 360 },
            { x: 395, y: 575 },
            { x: 870, y: 575 },
            { x: 995, y: 360 },
            { x: 1190, y: 360 },
          ],
        },
      ],
      zoneCoords: [
        [170, 255], [170, 465], [490, 270], [490, 450], [640, 360],
        [790, 270], [790, 450], [640, 72], [640, 648], [1095, 255],
      ],
      hasJunctions: true,
      curvesDescription: 'ශීත ආරක්ෂක කලාපය වටා බෙදී යන ද්විත්ව ක්‍රයෝ මාර්ගය.',
    },
    {
      spawns: [
        { x: 70, y: 165, label: 'උතුරු හිම අධිරාජ්‍ය දොරටුව' },
        { x: 70, y: 555, label: 'දකුණු හිම අධිරාජ්‍ය දොරටුව' },
      ],
      castle: { x: 1190, y: 360, name: 'ඇබ්සොලියුට් සීරෝ බලකොටුව' },
      paths: [
        {
          id: 'az_north',
          name: 'උතුරු ක්‍රයෝ මහා මග',
          width: 48,
          points: [
            { x: 70, y: 165 },
            { x: 370, y: 165 },
            { x: 370, y: 360 },
            { x: 690, y: 185 },
            { x: 970, y: 185 },
            { x: 1055, y: 360 },
            { x: 1190, y: 360 },
          ],
        },
        {
          id: 'az_south',
          name: 'දකුණු ක්‍රයෝ මහා මග',
          width: 48,
          points: [
            { x: 70, y: 555 },
            { x: 370, y: 555 },
            { x: 370, y: 360 },
            { x: 690, y: 535 },
            { x: 970, y: 535 },
            { x: 1055, y: 360 },
            { x: 1190, y: 360 },
          ],
        },
      ],
      zoneCoords: [
        [220, 265], [220, 455], [510, 155], [510, 565], [680, 360],
        [835, 285], [835, 435], [1015, 105], [1015, 615], [1135, 240],
      ],
      hasJunctions: true,
      curvesDescription: 'හිම අධිරාජ්‍යයා පැමිණෙන දියමන්ති හැඩැති සටන් කලාපය.',
    },
  ];
  return layouts[variant % layouts.length];
}

const DECORS_W13: DecorObject[] = [
  { kind: 'glacier_spire', x: 175, y: 95, scale: 1.3 },
  { kind: 'frozen_turret', x: 640, y: 90, scale: 1.25 },
  { kind: 'glacier_spire', x: 1105, y: 635, scale: 1.35 },
  { kind: 'frozen_turret', x: 170, y: 635, scale: 1.25 },
];

function buildWaves(offset: number, twoPaths: boolean): WaveConfig[] {
  const c = (n: number) => Math.max(4, Math.round(n * (1 + offset * 0.045)));
  const alt = (i: number) => (twoPaths ? i % 2 : 0);

  const waves: WaveConfig[] = [
    {
      waveNumber: 1,
      announcement: 'හිම ජෙට් ධාවන පෙරමුණ',
      delayBeforeWave: 2,
      bonusCoins: 260 + offset * 20,
      groups: [
        { enemyId: 'cryo_jet_rusher', count: c(12), spawnInterval: 0.68, pathIndex: 0, delayBeforeGroup: 0 },
        { enemyId: 'cryo_jet_rusher', count: c(8), spawnInterval: 0.72, pathIndex: alt(1), delayBeforeGroup: 1.5 },
      ],
    },
    {
      waveNumber: 2,
      announcement: 'ග්ලැසියර් ටැංකි හා ස්ටෙල්ත් ජෙට්',
      delayBeforeWave: 5,
      bonusCoins: 300 + offset * 22,
      groups: [
        { enemyId: 'glacier_mech_tank', count: c(8), spawnInterval: 1.35, pathIndex: 0, delayBeforeGroup: 0 },
        { enemyId: 'blizzard_stealth_jet', count: c(10), spawnInterval: 0.74, pathIndex: alt(1), delayBeforeGroup: 1.8 },
      ],
    },
    {
      waveNumber: 3,
      announcement: 'හිම කාලතුවක්කු වෝකර් ප්‍රහාරය',
      delayBeforeWave: 6,
      bonusCoins: 350 + offset * 25,
      groups: [
        { enemyId: 'cryo_artillery_walker', count: c(10), spawnInterval: 1.05, pathIndex: 0, delayBeforeGroup: 0 },
        { enemyId: 'cryo_jet_rusher', count: c(18), spawnInterval: 0.44, pathIndex: alt(1), delayBeforeGroup: 1.4 },
      ],
    },
    {
      waveNumber: 4,
      announcement: 'හිම කුණාටු ස්ටෙල්ත් ප්‍රහාරය',
      delayBeforeWave: 6,
      bonusCoins: 400 + offset * 28,
      groups: [
        { enemyId: 'blizzard_stealth_jet', count: c(18), spawnInterval: 0.42, pathIndex: 0, delayBeforeGroup: 0 },
        { enemyId: 'glacier_mech_tank', count: c(10), spawnInterval: 1.15, pathIndex: alt(1), delayBeforeGroup: 1.5 },
        { enemyId: 'cryo_artillery_walker', count: c(10), spawnInterval: 0.95, pathIndex: 0, delayBeforeGroup: 2.5 },
      ],
    },
    {
      waveNumber: 5,
      announcement: 'සීතල යාන්ත්‍රික ප්‍රහාරක රැල්ල',
      delayBeforeWave: 6,
      bonusCoins: 460 + offset * 30,
      groups: [
        { enemyId: 'glacier_mech_tank', count: c(12), spawnInterval: 1.05, pathIndex: 0, delayBeforeGroup: 0 },
        { enemyId: 'cryo_artillery_walker', count: c(12), spawnInterval: 0.88, pathIndex: alt(1), delayBeforeGroup: 1.2 },
        { enemyId: 'blizzard_stealth_jet', count: c(20), spawnInterval: 0.38, pathIndex: 0, delayBeforeGroup: 2.2 },
      ],
    },
  ];

  if (offset >= 4) {
    waves.push({
      waveNumber: 6,
      announcement: 'අවසන් ක්‍රයෝ ටයිටෑන් රැල්ල',
      delayBeforeWave: 7,
      bonusCoins: 540 + offset * 34,
      groups: [
        { enemyId: 'heavy_combat_titan', count: c(8), spawnInterval: 1.6, pathIndex: 0, delayBeforeGroup: 0 },
        { enemyId: 'cryo_artillery_walker', count: c(14), spawnInterval: 0.82, pathIndex: alt(1), delayBeforeGroup: 1.2 },
        { enemyId: 'blizzard_stealth_jet', count: c(22), spawnInterval: 0.35, pathIndex: 0, delayBeforeGroup: 2.0 },
      ],
    });
  }

  return waves;
}

const NAMES_W13 = [
  'ශීත මෙක් දොරටුව',
  'හිම ජෙට් මාර්ගය',
  'ග්ලැසියර් බලකොටු මාවත',
  'ක්‍රයෝ කාලතුවක්කු නිම්නය',
  'ස්ටෙල්ත් හිම අහස',
  'අධි-ශීත යුධ කඳවුර',
  'ටයිටේනියම් හිම පාලම',
  'බ්ලිසාඩ් හරස් පාර',
  'ශීත අධිරාජ්‍ය පෙරමුණ',
  'ඇබ්සොලියුට් සීරෝ',
];

export const WORLD_13_LEVELS: LevelConfig[] = NAMES_W13.map((name, idx) => {
  const id = 71 + idx;
  const isBoss = id === 80;
  const bp = makeBlueprint(isBoss ? 3 : idx % 3);
  const twoPaths = bp.paths.length > 1;
  const waves: WaveConfig[] = isBoss
    ? [
        ...buildWaves(idx, true).slice(0, 4),
        {
          waveNumber: 5,
          announcement: 'ප්‍රධාන සතුරා: ඇබ්සොලියුට් සීරෝ අධිරාජ්‍යයා!',
          delayBeforeWave: 8,
          bonusCoins: 2600,
          groups: [
            { enemyId: 'boss_absolute_zero', count: 1, spawnInterval: 1.0, pathIndex: 0, delayBeforeGroup: 0 },
            { enemyId: 'glacier_mech_tank', count: 10, spawnInterval: 1.5, pathIndex: 1, delayBeforeGroup: 2.5 },
            { enemyId: 'cryo_artillery_walker', count: 10, spawnInterval: 1.4, pathIndex: 0, delayBeforeGroup: 4.0 },
            { enemyId: 'blizzard_stealth_jet', count: 18, spawnInterval: 0.68, pathIndex: 1, delayBeforeGroup: 5.0 },
          ],
        },
      ]
    : buildWaves(idx, twoPaths);

  return createLevel({
    id,
    name,
    worldId: 'frozen_mecha_kingdom',
    isWidescreen16x9: true,
    description: isBoss
      ? 'ශීත යාන්ත්‍රික රාජධානියේ පාලකයා වන ඇබ්සොලියුට් සීරෝ අධිරාජ්‍යයා සමඟ මහා සටනට සූදානම් වන්න!'
      : `හිම කුණාටු මැදින් පැමිණෙන ${name} ආක්‍රමණය මැඩපවත්වන්න.`,
    objective: isBoss ? 'ඇබ්සොලියුට් සීරෝ අධිරාජ්‍යයා පරාජය කරන්න.' : `සතුරු වට ${waves.length}ම ජයගන්න.`,
    difficultyRating: 10,
    hazard: 'cryo_blizzard',
    hazardDescription: 'හිම කුණාටුව: හිම යාන්ත්‍රික සතුරන්ගේ වේගය +6% වන අතර ක්‍රයෝ වෝකර්වරු කුළුණු සිසිල් කරති.',
    decorations: DECORS_W13,
    spawns: bp.spawns,
    castle: bp.castle,
    paths: bp.paths,
    curvesDescription: bp.curvesDescription,
    hasJunctions: bp.hasJunctions,
    zoneCoords: bp.zoneCoords,
    castleHealth: isBoss ? 40 : 32 + Math.floor(idx / 3),
    startingCoins: 3400 + idx * 185 + (isBoss ? 700 : 0),
    waves,
    enemyStatScale: {
      hpMultiplier: Number((1.05 + idx * 0.03).toFixed(2)),
      speedMultiplier: Number((1.01 + idx * 0.008).toFixed(2)),
      armorBonus: 6 + Math.floor(idx / 2),
      coinMultiplier: Number((1.12 + idx * 0.025).toFixed(2)),
    },
    availableWeapons: ALL_WEAPONS,
    restrictions: ['ස්ටෙල්ත් ගුවන් යානා · සීත කුළුණු අවහිරතා'],
    specialChallenges: ['ස්ටෙල්ත් සතුරන් හඳුනාගැනීමට ප්ලාස්මා ගුවන් ආරක්ෂක කුළුණු සහ ලේසර් කුළුණු තබන්න.'],
    bossConfig: isBoss
      ? {
          enemyId: 'boss_absolute_zero',
          name: 'ඇබ්සොලියුට් සීරෝ අධිරාජ්‍යයා',
          title: 'ශීත යාන්ත්‍රික අධිපති',
          hp: 62000,
          armor: 86,
          speed: 38,
          coinReward: 1850,
          castleDamage: 99,
          resistances: ['86 ටයිටේනියම් සන්නාහය', '9500 ක්‍රයෝ පලිහ', '55% මැජික් ප්‍රතිරෝධය'],
          abilities: ['ක්‍රයෝ හමුදා කැඳවීම', 'සීත කුළුණු අවහිරය', 'ග්ලැසියර පලිහ පුපුරුවීම'],
          phases: [
            { hpThresholdPct: 0.74, name: 'හිම පෙරමුණ', ability: 'summon_minions', description: 'හිම යාන්ත්‍රික සගයන් කැඳවයි.' },
            { hpThresholdPct: 0.48, name: 'අධි-ශීත කුණාටුව', ability: 'tower_jam', description: 'ආසන්න කුළුණු සීතලෙන් අක්‍රීය කරයි.' },
            { hpThresholdPct: 0.22, name: 'ග්ලැසියර ආවරණය', ability: 'shield_burst', description: 'ක්‍රයෝ පලිහ නැවත පුරවයි.' },
          ],
        }
      : undefined,
    rewards: { coins: 2900 + idx * 180 + (isBoss ? 1700 : 0), xp: 3100 + idx * 190 },
    bonusObjectives: [
      {
        id: `l${id}_hp`,
        description: 'බලකොටුව 85% ට වැඩි ජීව ශක්තියකින් රැකගන්න',
        type: 'min_castle_hp_pct',
        threshold: 85,
        rewardCoins: 520 + idx * 30,
      },
    ],
  });
});
