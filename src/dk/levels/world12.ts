import { DecorObject, LevelConfig, RoadPath, SpiderNestConfig, WaveConfig } from '../types';
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
      spawns: [{ x: 70, y: 360, label: 'අම්ල විල පිවිසුම' }],
      castle: { x: 1190, y: 360, name: 'පවිත්‍ර බලකොටුව' },
      paths: [
        {
          id: 'serpent',
          name: 'විෂ වගුරු මාර්ගය',
          width: 48,
          points: [
            { x: 70, y: 360 },
            { x: 250, y: 150 },
            { x: 510, y: 150 },
            { x: 620, y: 565 },
            { x: 900, y: 565 },
            { x: 1020, y: 220 },
            { x: 1190, y: 360 },
          ],
        },
      ],
      zoneCoords: [
        [200, 260], [375, 255], [375, 455], [510, 355], [750, 260],
        [750, 455], [910, 345], [1085, 455], [640, 80], [280, 565],
      ],
      hasJunctions: false,
      curvesDescription: 'අම්ල විල් මතින් දිවෙන පුළුල් S-වංගු මාර්ගය.',
    },
    {
      spawns: [
        { x: 70, y: 165, label: 'විකෘති උතුරු ගුහාව' },
        { x: 70, y: 555, label: 'විකෘති දකුණු ගුහාව' },
      ],
      castle: { x: 1190, y: 360, name: 'ජෛව ආරක්ෂක බලකොටුව' },
      paths: [
        {
          id: 'north_mire',
          name: 'උතුරු අම්ල මග',
          width: 46,
          points: [
            { x: 70, y: 165 },
            { x: 430, y: 165 },
            { x: 580, y: 360 },
            { x: 860, y: 205 },
            { x: 1050, y: 360 },
            { x: 1190, y: 360 },
          ],
        },
        {
          id: 'south_mire',
          name: 'දකුණු අම්ල මග',
          width: 46,
          points: [
            { x: 70, y: 555 },
            { x: 430, y: 555 },
            { x: 580, y: 360 },
            { x: 860, y: 515 },
            { x: 1050, y: 360 },
            { x: 1190, y: 360 },
          ],
        },
      ],
      zoneCoords: [
        [235, 265], [235, 455], [415, 360], [690, 200], [690, 520],
        [860, 360], [1010, 210], [1010, 510], [520, 100], [520, 620],
      ],
      hasJunctions: true,
      curvesDescription: 'මකුළු කැදලි හා මධ්‍ය හන්දිය සහිත අම්ල ද්විත්ව මාර්ගය.',
    },
    {
      spawns: [{ x: 70, y: 135, label: 'විෂ ජලාශ පිවිසුම' }],
      castle: { x: 1190, y: 580, name: 'ශුද්ධ රසායනික කුළුණ' },
      paths: [
        {
          id: 'loop_mire',
          name: 'විකෘති වංගු මග',
          width: 48,
          points: [
            { x: 70, y: 135 },
            { x: 520, y: 135 },
            { x: 520, y: 455 },
            { x: 245, y: 455 },
            { x: 245, y: 590 },
            { x: 890, y: 590 },
            { x: 890, y: 215 },
            { x: 1085, y: 215 },
            { x: 1085, y: 580 },
            { x: 1190, y: 580 },
          ],
        },
      ],
      zoneCoords: [
        [375, 240], [375, 355], [645, 245], [645, 465], [770, 355],
        [985, 325], [985, 495], [160, 300], [720, 110], [450, 660],
      ],
      hasJunctions: false,
      curvesDescription: 'ද්විත්ව හරස් වෙඩි කලාප සහිත ගැඹුරු විකෘති මාර්ගය.',
    },
    {
      spawns: [
        { x: 70, y: 180, label: 'උතුරු හයිඩ්‍රා දොරටුව' },
        { x: 70, y: 540, label: 'දකුණු හයිඩ්‍රා දොරටුව' },
      ],
      castle: { x: 1190, y: 360, name: 'ඔමේගා පවිත්‍රාගාරය' },
      paths: [
        {
          id: 'hydra_north',
          name: 'උතුරු හයිඩ්‍රා මාර්ගය',
          width: 48,
          points: [
            { x: 70, y: 180 },
            { x: 380, y: 180 },
            { x: 380, y: 360 },
            { x: 710, y: 165 },
            { x: 990, y: 165 },
            { x: 1065, y: 360 },
            { x: 1190, y: 360 },
          ],
        },
        {
          id: 'hydra_south',
          name: 'දකුණු හයිඩ්‍රා මාර්ගය',
          width: 48,
          points: [
            { x: 70, y: 540 },
            { x: 380, y: 540 },
            { x: 380, y: 360 },
            { x: 710, y: 555 },
            { x: 990, y: 555 },
            { x: 1065, y: 360 },
            { x: 1190, y: 360 },
          ],
        },
      ],
      zoneCoords: [
        [225, 275], [225, 445], [510, 155], [510, 565], [685, 360],
        [850, 275], [850, 445], [1030, 100], [1030, 620], [1135, 240],
      ],
      hasJunctions: true,
      curvesDescription: 'හයිඩ්‍රා අධිපති පැමිණෙන ද්විත්ව විකෘති සටන් බිම.',
    },
  ];
  return layouts[variant % layouts.length];
}

const DECORS_W12: DecorObject[] = [
  { kind: 'toxic_vat', x: 165, y: 95, scale: 1.25 },
  { kind: 'mutant_pod', x: 640, y: 95, scale: 1.25 },
  { kind: 'toxic_vat', x: 1100, y: 635, scale: 1.3 },
  { kind: 'mutant_pod', x: 170, y: 635, scale: 1.25 },
];

function buildWaves(offset: number, twoPaths: boolean): WaveConfig[] {
  const c = (n: number) => Math.max(4, Math.round(n * (1 + offset * 0.045)));
  const alt = (i: number) => (twoPaths ? i % 2 : 0);

  const waves: WaveConfig[] = [
    {
      waveNumber: 1,
      announcement: 'අම්ල විකෘති හා මකුළු පෙරමුණ',
      delayBeforeWave: 2,
      bonusCoins: 210 + offset * 18,
      groups: [
        { enemyId: 'acid_mutant_stalker', count: c(12), spawnInterval: 0.68, pathIndex: 0, delayBeforeGroup: 0 },
        { enemyId: 'mutated_acid_spider', count: c(8), spawnInterval: 0.72, pathIndex: alt(1), delayBeforeGroup: 1.5 },
      ],
    },
    {
      waveNumber: 2,
      announcement: 'සයිබර් මකුළුවන් හා බඹර ඩ්‍රෝන',
      delayBeforeWave: 5,
      bonusCoins: 250 + offset * 20,
      groups: [
        { enemyId: 'brood_mech_spider', count: c(9), spawnInterval: 1.15, pathIndex: 0, delayBeforeGroup: 0 },
        { enemyId: 'toxic_spitter_wasp', count: c(10), spawnInterval: 0.75, pathIndex: alt(1), delayBeforeGroup: 1.8 },
      ],
    },
    {
      waveNumber: 3,
      announcement: 'ජෛව-විකෘති යෝධ ආක්‍රමණය',
      delayBeforeWave: 6,
      bonusCoins: 295 + offset * 24,
      groups: [
        { enemyId: 'bio_mutant_juggernaut', count: c(8), spawnInterval: 1.35, pathIndex: 0, delayBeforeGroup: 0 },
        { enemyId: 'acid_mutant_stalker', count: c(18), spawnInterval: 0.45, pathIndex: alt(1), delayBeforeGroup: 1.5 },
      ],
    },
    {
      waveNumber: 4,
      announcement: 'විෂ ගුවන් හා මකුළු කුණාටුව',
      delayBeforeWave: 6,
      bonusCoins: 345 + offset * 26,
      groups: [
        { enemyId: 'toxic_spitter_wasp', count: c(18), spawnInterval: 0.44, pathIndex: 0, delayBeforeGroup: 0 },
        { enemyId: 'brood_mech_spider', count: c(12), spawnInterval: 0.92, pathIndex: alt(1), delayBeforeGroup: 1.4 },
        { enemyId: 'mutated_acid_spider', count: c(14), spawnInterval: 0.52, pathIndex: 0, delayBeforeGroup: 2.6 },
      ],
    },
    {
      waveNumber: 5,
      announcement: 'මහා විකෘති ප්‍රහාරය',
      delayBeforeWave: 6,
      bonusCoins: 400 + offset * 30,
      groups: [
        { enemyId: 'bio_mutant_juggernaut', count: c(12), spawnInterval: 1.05, pathIndex: 0, delayBeforeGroup: 0 },
        { enemyId: 'toxic_spitter_wasp', count: c(20), spawnInterval: 0.4, pathIndex: alt(1), delayBeforeGroup: 1.5 },
        { enemyId: 'brood_mech_spider', count: c(12), spawnInterval: 0.88, pathIndex: 0, delayBeforeGroup: 2.2 },
      ],
    },
  ];

  if (offset >= 4) {
    waves.push({
      waveNumber: 6,
      announcement: 'අවසන් ජෛව-යාන්ත්‍රික රැල්ල',
      delayBeforeWave: 7,
      bonusCoins: 480 + offset * 32,
      groups: [
        { enemyId: 'mutated_machine_beast', count: c(8), spawnInterval: 1.5, pathIndex: 0, delayBeforeGroup: 0 },
        { enemyId: 'bio_mutant_juggernaut', count: c(12), spawnInterval: 1.0, pathIndex: alt(1), delayBeforeGroup: 1.2 },
        { enemyId: 'toxic_spitter_wasp', count: c(22), spawnInterval: 0.36, pathIndex: 0, delayBeforeGroup: 2.0 },
      ],
    });
  }

  return waves;
}

const NAMES_W12 = [
  'අම්ල වැසි දොරටුව',
  'විකෘති වගුරු බිම',
  'අම්ල මකුළු කැදැල්ල',
  'ජෛව රසායනික කලාපය',
  'විෂ බඹර නිම්නය',
  'සයිබර් බෲඩ් ගුහාව',
  'ප්‍රතිරෝධී විකෘති වනය',
  'ද්විත්ව මකුළු වටලෑම',
  'හයිඩ්‍රා පෙරමුණු බලකොටුව',
  'විකෘති හයිඩ්‍රා අධිපති',
];

export const WORLD_12_LEVELS: LevelConfig[] = NAMES_W12.map((name, idx) => {
  const id = 61 + idx;
  const isBoss = id === 70;
  const bp = makeBlueprint(isBoss ? 3 : idx % 3);
  const twoPaths = bp.paths.length > 1;
  const hasNests = id === 63 || id === 66 || id === 68 || id === 69;

  const spiderNests: SpiderNestConfig[] | undefined = hasNests
    ? [
        {
          id: `nest_${id}_a`,
          x: bp.paths[0].points[1].x,
          y: bp.paths[0].points[1].y,
          pathIndex: 0,
          maxHp: 1700 + idx * 140,
          armor: 14 + idx,
          coinReward: 185,
          spawnInterval: 6.4,
          maxSpawns: 7,
          batchSize: 1,
          enemyId: idx >= 7 ? 'brood_mech_spider' : 'mutated_acid_spider',
          label: 'විකෘති මකුළු කැදැල්ල',
        },
        ...(twoPaths
          ? [
              {
                id: `nest_${id}_b`,
                x: bp.paths[1].points[1].x,
                y: bp.paths[1].points[1].y,
                pathIndex: 1,
                maxHp: 1700 + idx * 140,
                armor: 14 + idx,
                coinReward: 185,
                spawnInterval: 6.8,
                maxSpawns: 6,
                batchSize: 1,
                enemyId: 'mutated_acid_spider',
                label: 'දකුණු මකුළු කැදැල්ල',
              },
            ]
          : []),
      ]
    : undefined;

  const waves: WaveConfig[] = isBoss
    ? [
        ...buildWaves(idx, true).slice(0, 4),
        {
          waveNumber: 5,
          announcement: 'ප්‍රධාන සතුරා: විකෘති හයිඩ්‍රා අධිපති!',
          delayBeforeWave: 8,
          bonusCoins: 2200,
          groups: [
            { enemyId: 'boss_mutation_hydra', count: 1, spawnInterval: 1.0, pathIndex: 0, delayBeforeGroup: 0 },
            { enemyId: 'bio_mutant_juggernaut', count: 10, spawnInterval: 1.5, pathIndex: 1, delayBeforeGroup: 2.5 },
            { enemyId: 'brood_mech_spider', count: 10, spawnInterval: 1.4, pathIndex: 0, delayBeforeGroup: 4.0 },
            { enemyId: 'toxic_spitter_wasp', count: 16, spawnInterval: 0.72, pathIndex: 1, delayBeforeGroup: 5.0 },
          ],
        },
      ]
    : buildWaves(idx, twoPaths);

  return createLevel({
    id,
    name,
    worldId: 'toxic_mutation_zone',
    isWidescreen16x9: true,
    description: isBoss
      ? 'හිස් තුනකින් යුත් විකෘති හයිඩ්‍රා අධිපති අම්ල වැසි මැදින් අවසන් ප්‍රහාරය දියත් කරයි!'
      : hasNests
        ? 'විනාශ කළ හැකි විකෘති මකුළු කැදලි වලින් නව මකුළුවන් බිහි වීමට පෙර ඒවා විනාශ කරන්න!'
        : `අම්ල විකෘති කලාපයේ ${name} සටන් බිම ආරක්ෂා කරන්න.`,
    objective: isBoss ? 'විකෘති හයිඩ්‍රා අධිපති පරාජය කරන්න.' : `සතුරු වට ${waves.length}ම ජයගන්න.`,
    difficultyRating: 10,
    hazard: 'toxic_acid_rain',
    hazardDescription: 'අම්ල වැස්ස: විකෘති සතුරන්ගේ ජීව ශක්තිය +5% කින් ඉහළ යන අතර විෂ ප්‍රතිරෝධී වේ.',
    decorations: DECORS_W12,
    spawns: bp.spawns,
    spiderNests,
    castle: bp.castle,
    paths: bp.paths,
    curvesDescription: bp.curvesDescription,
    hasJunctions: bp.hasJunctions,
    zoneCoords: bp.zoneCoords,
    castleHealth: isBoss ? 38 : 30 + Math.floor(idx / 3),
    startingCoins: 2850 + idx * 165 + (isBoss ? 600 : 0),
    waves,
    enemyStatScale: {
      hpMultiplier: Number((1.03 + idx * 0.03).toFixed(2)),
      speedMultiplier: Number((1.01 + idx * 0.008).toFixed(2)),
      armorBonus: 4 + Math.floor(idx / 2),
      coinMultiplier: Number((1.08 + idx * 0.02).toFixed(2)),
    },
    availableWeapons: ALL_WEAPONS,
    restrictions: hasNests
      ? ['විනාශ කළ හැකි මකුළු කැදලි · විෂ ප්‍රතිරෝධී විකෘති හමුදාව']
      : ['විෂ ප්‍රතිරෝධී විකෘති හමුදාව · අම්ල ප්‍රතිසංස්කරණ ප්‍රභාව'],
    specialChallenges: ['විෂ කුළුණු වෙනුවට ප්ලාස්මා, ගිනි මකර, සහ ලේසර් කුළුණු භාවිතා කරන්න.'],
    bossConfig: isBoss
      ? {
          enemyId: 'boss_mutation_hydra',
          name: 'විකෘති හයිඩ්‍රා අධිපති',
          title: 'ත්‍රිත්ව-හිස් ජෛව-යාන්ත්‍රික රකුසා',
          hp: 45000,
          armor: 78,
          speed: 40,
          coinReward: 1450,
          castleDamage: 99,
          resistances: ['78 ජෛව-වානේ සන්නාහය', 'විෂ ප්‍රතිරෝධී', '7200 බලශක්ති පලිහ'],
          abilities: ['සයිබර් මකුළු කැඳවීම', 'අම්ල කුළුණු අවහිරය', 'ජෛව පලිහ පුපුරුවීම'],
          phases: [
            { hpThresholdPct: 0.74, name: 'විකෘති පැටවුන්', ability: 'summon_minions', description: 'විකෘති සගයන් කැඳවයි.' },
            { hpThresholdPct: 0.46, name: 'අම්ල ගිගුරුම', ability: 'tower_jam', description: 'ආසන්න කුළුණු අක්‍රීය කරයි.' },
            { hpThresholdPct: 0.22, name: 'හයිඩ්‍රා පුනරුත්ථානය', ability: 'shield_burst', description: 'පලිහ වර්ධනය කර වේගයෙන් ඉදිරියට පනී.' },
          ],
        }
      : undefined,
    rewards: { coins: 2400 + idx * 160 + (isBoss ? 1400 : 0), xp: 2500 + idx * 170 },
    bonusObjectives: [
      {
        id: `l${id}_hp`,
        description: 'බලකොටුව 85% ට වැඩි ජීව ශක්තියකින් රැකගන්න',
        type: 'min_castle_hp_pct',
        threshold: 85,
        rewardCoins: 450 + idx * 25,
      },
    ],
  });
});
