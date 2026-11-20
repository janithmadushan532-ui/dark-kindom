import { DecorObject, LevelConfig, RoadPath, Vec2, WaveConfig } from '../types';
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
    // 0: Wide S-Curve Scrap Highway
    {
      spawns: [{ x: 70, y: 150, label: 'උතුරු සුන්බුන් දොරටුව' }],
      castle: { x: 1190, y: 540, name: 'යකඩ මුරපොළ' },
      paths: [
        {
          id: 'main',
          name: 'ප්‍රධාන සුන්බුන් මාර්ගය',
          width: 48,
          points: [
            { x: 70, y: 150 },
            { x: 430, y: 150 },
            { x: 430, y: 540 },
            { x: 810, y: 540 },
            { x: 810, y: 190 },
            { x: 1050, y: 190 },
            { x: 1050, y: 540 },
            { x: 1190, y: 540 },
          ],
        },
      ],
      zoneCoords: [
        [240, 250], [330, 250], [330, 440], [540, 260], [540, 440],
        [705, 260], [705, 440], [925, 290], [925, 440], [1135, 340],
      ],
      hasJunctions: false,
      curvesDescription: 'සුන්බුන් අතරින් දිවෙන ද්විත්ව S-වංගු මහා මාර්ගය.',
    },
    // 1: Dual Converging Twin Lanes
    {
      spawns: [
        { x: 70, y: 165, label: 'උතුරු කඳවුරු මාර්ගය' },
        { x: 70, y: 555, label: 'දකුණු කඳවුරු මාර්ගය' },
      ],
      castle: { x: 1190, y: 360, name: 'සයිබර් බලකොටුව' },
      paths: [
        {
          id: 'north',
          name: 'උතුරු මාර්ගය',
          width: 46,
          points: [
            { x: 70, y: 165 },
            { x: 450, y: 165 },
            { x: 640, y: 360 },
            { x: 1190, y: 360 },
          ],
        },
        {
          id: 'south',
          name: 'දකුණු මාර්ගය',
          width: 46,
          points: [
            { x: 70, y: 555 },
            { x: 450, y: 555 },
            { x: 640, y: 360 },
            { x: 1190, y: 360 },
          ],
        },
      ],
      zoneCoords: [
        [230, 265], [230, 455], [410, 275], [410, 445], [640, 230],
        [640, 490], [820, 265], [820, 455], [1000, 265], [1000, 455],
      ],
      hasJunctions: true,
      curvesDescription: 'මධ්‍යයේදී එක්වන ද්විත්ව ප්‍රහාරක මංතීරු.',
    },
    // 2: Central Reactor Loop
    {
      spawns: [{ x: 70, y: 360, label: 'බටහිර පරිපථ දොරටුව' }],
      castle: { x: 1190, y: 360, name: 'බලශක්ති කේන්ද්‍රය' },
      paths: [
        {
          id: 'upper_arc',
          name: 'ඉහළ පරිපථ මග',
          width: 46,
          points: [
            { x: 70, y: 360 },
            { x: 260, y: 360 },
            { x: 390, y: 150 },
            { x: 870, y: 150 },
            { x: 990, y: 360 },
            { x: 1190, y: 360 },
          ],
        },
        {
          id: 'lower_arc',
          name: 'පහළ පරිපථ මග',
          width: 46,
          points: [
            { x: 70, y: 360 },
            { x: 260, y: 360 },
            { x: 390, y: 570 },
            { x: 870, y: 570 },
            { x: 990, y: 360 },
            { x: 1190, y: 360 },
          ],
        },
      ],
      zoneCoords: [
        [170, 255], [170, 465], [480, 270], [480, 450], [640, 360],
        [790, 270], [790, 450], [640, 75], [640, 645], [1095, 255],
      ],
      hasJunctions: true,
      curvesDescription: 'මධ්‍ය ආරක්ෂක දූපත වටා බෙදී යන ද්විත්ව චක්‍රීය මාර්ගය.',
    },
    // 3: Triple Switchback Zigzag
    {
      spawns: [{ x: 70, y: 120, label: 'උතුරු මළ යකඩ විවරය' }],
      castle: { x: 1190, y: 600, name: 'අවසන් මුර බලකොටුව' },
      paths: [
        {
          id: 'zigzag',
          name: 'වංගු ප්‍රහාරක මාර්ගය',
          width: 48,
          points: [
            { x: 70, y: 120 },
            { x: 980, y: 120 },
            { x: 980, y: 290 },
            { x: 260, y: 290 },
            { x: 260, y: 465 },
            { x: 980, y: 465 },
            { x: 980, y: 600 },
            { x: 1190, y: 600 },
          ],
        },
      ],
      zoneCoords: [
        [200, 205], [430, 205], [640, 205], [840, 205], [400, 380],
        [620, 380], [830, 380], [1085, 210], [1085, 420], [560, 565],
      ],
      hasJunctions: false,
      curvesDescription: 'බහු-හරස් ප්‍රහාර එල්ල කළ හැකි දිගු සිග්සැග් සටන් බිම.',
    },
    // 4: Diamond Nexus (Boss Layout)
    {
      spawns: [
        { x: 70, y: 165, label: 'උතුරු EMP විවරය' },
        { x: 70, y: 555, label: 'දකුණු EMP විවරය' },
      ],
      castle: { x: 1190, y: 360, name: 'සුන්බුන් රාජධානි කේන්ද්‍රය' },
      paths: [
        {
          id: 'north_nexus',
          name: 'උතුරු ටයිටේනියම් මග',
          width: 48,
          points: [
            { x: 70, y: 165 },
            { x: 370, y: 165 },
            { x: 370, y: 360 },
            { x: 670, y: 195 },
            { x: 940, y: 195 },
            { x: 1045, y: 360 },
            { x: 1190, y: 360 },
          ],
        },
        {
          id: 'south_nexus',
          name: 'දකුණු ටයිටේනියම් මග',
          width: 48,
          points: [
            { x: 70, y: 555 },
            { x: 370, y: 555 },
            { x: 370, y: 360 },
            { x: 670, y: 525 },
            { x: 940, y: 525 },
            { x: 1045, y: 360 },
            { x: 1190, y: 360 },
          ],
        },
      ],
      zoneCoords: [
        [220, 265], [220, 455], [520, 265], [520, 455], [645, 360],
        [810, 285], [810, 435], [1005, 115], [1005, 605], [1130, 240],
      ],
      hasJunctions: true,
      curvesDescription: 'දෙවරක් හමුවී බෙදී යන දියමන්ති හැඩැති ප්‍රධාන සටන් භූමිය.',
    },
  ];
  return layouts[variant % layouts.length];
}

const DECORS_W11: DecorObject[] = [
  { kind: 'wrecked_mech', x: 185, y: 95, scale: 1.3 },
  { kind: 'cyber_pylon', x: 520, y: 95, scale: 1.2 },
  { kind: 'wrecked_mech', x: 1110, y: 635, scale: 1.35 },
  { kind: 'cyber_pylon', x: 165, y: 635, scale: 1.2 },
];

function buildStandardWaves(levelOffset: number, twoPaths: boolean): WaveConfig[] {
  const density = 1 + levelOffset * 0.045;
  const c = (n: number) => Math.max(4, Math.round(n * density));
  const alt = (i: number) => (twoPaths ? i % 2 : 0);

  const waves: WaveConfig[] = [
    {
      waveNumber: 1,
      announcement: 'යකඩ ධාවන රොබෝ රැල්ල',
      delayBeforeWave: 2,
      bonusCoins: 170 + levelOffset * 15,
      groups: [
        { enemyId: 'scrap_runner_mech', count: c(12), spawnInterval: 0.68, pathIndex: 0, delayBeforeGroup: 0 },
        { enemyId: 'scrap_runner_mech', count: c(8), spawnInterval: 0.72, pathIndex: alt(1), delayBeforeGroup: 1.5 },
      ],
    },
    {
      waveNumber: 2,
      announcement: 'බුල්ඩෝසර් ටැංකි හා බෝම්බ ඩ්‍රෝන',
      delayBeforeWave: 5,
      bonusCoins: 205 + levelOffset * 18,
      groups: [
        { enemyId: 'wasteland_bulldozer', count: c(8), spawnInterval: 1.25, pathIndex: 0, delayBeforeGroup: 0 },
        { enemyId: 'scrap_bomber_drone', count: c(12), spawnInterval: 0.65, pathIndex: alt(1), delayBeforeGroup: 1.5 },
      ],
    },
    {
      waveNumber: 3,
      announcement: 'EMP ස්නයිපර් ඩ්‍රොයිඩ් ප්‍රහාරය',
      delayBeforeWave: 6,
      bonusCoins: 245 + levelOffset * 20,
      groups: [
        { enemyId: 'emp_sniper_droid', count: c(10), spawnInterval: 0.95, pathIndex: 0, delayBeforeGroup: 0 },
        { enemyId: 'scrap_runner_mech', count: c(18), spawnInterval: 0.45, pathIndex: alt(1), delayBeforeGroup: 1.5 },
      ],
    },
    {
      waveNumber: 4,
      announcement: 'ගුවන් සහ භූමි ඒකාබද්ධ ප්‍රහාරය',
      delayBeforeWave: 6,
      bonusCoins: 290 + levelOffset * 22,
      groups: [
        { enemyId: 'scrap_bomber_drone', count: c(16), spawnInterval: 0.48, pathIndex: 0, delayBeforeGroup: 0 },
        { enemyId: 'wasteland_bulldozer', count: c(11), spawnInterval: 1.05, pathIndex: alt(1), delayBeforeGroup: 1.5 },
        { enemyId: 'emp_sniper_droid', count: c(10), spawnInterval: 0.9, pathIndex: 0, delayBeforeGroup: 2.5 },
      ],
    },
    {
      waveNumber: 5,
      announcement: 'සුන්බුන් යුධ කුණාටුව',
      delayBeforeWave: 6,
      bonusCoins: 340 + levelOffset * 25,
      groups: [
        { enemyId: 'wasteland_bulldozer', count: c(14), spawnInterval: 0.95, pathIndex: 0, delayBeforeGroup: 0 },
        { enemyId: 'emp_sniper_droid', count: c(12), spawnInterval: 0.85, pathIndex: alt(1), delayBeforeGroup: 1.2 },
        { enemyId: 'scrap_bomber_drone', count: c(18), spawnInterval: 0.42, pathIndex: 0, delayBeforeGroup: 2.2 },
      ],
    },
  ];

  if (levelOffset >= 4) {
    waves.push({
      waveNumber: 6,
      announcement: 'අවසන් EMP ටයිටෑන් රැල්ල',
      delayBeforeWave: 7,
      bonusCoins: 420 + levelOffset * 30,
      groups: [
        { enemyId: 'omega_war_machine', count: levelOffset >= 7 ? 2 : 1, spawnInterval: 4.0, pathIndex: 0, delayBeforeGroup: 0 },
        { enemyId: 'emp_sniper_droid', count: c(12), spawnInterval: 0.82, pathIndex: alt(1), delayBeforeGroup: 1.4 },
        { enemyId: 'scrap_bomber_drone', count: c(18), spawnInterval: 0.42, pathIndex: 0, delayBeforeGroup: 2.2 },
      ],
    });
  }

  return waves;
}

const NAMES_W11 = [
  'මළ යකඩ දොරටුව',
  'විදුලි සුන්බුන් නිම්නය',
  'රොබෝ සුසාන භූමිය',
  'EMP කුණාටු පාලම',
  'බුල්ඩෝසර් මහා මාර්ගය',
  'පරිපථ භූමි කලාපය',
  'ලේසර් ස්නයිපර් දුර්ගය',
  'ඩ්‍රෝන කුණාටු අහස',
  'යකඩ බලකොටු වටලෑම',
  'මළ යකඩ කොලොසස්',
];

export const WORLD_11_LEVELS: LevelConfig[] = NAMES_W11.map((name, idx) => {
  const id = 51 + idx;
  const isBoss = id === 60;
  const bp = makeBlueprint(isBoss ? 4 : idx % 4);
  const twoPaths = bp.paths.length > 1;
  const waves: WaveConfig[] = isBoss
    ? [
        ...buildStandardWaves(idx, true).slice(0, 4),
        {
          waveNumber: 5,
          announcement: 'ප්‍රධාන සතුරා: මළ යකඩ කොලොසස්!',
          delayBeforeWave: 8,
          bonusCoins: 1800,
          groups: [
            { enemyId: 'boss_wasteland_colossus', count: 1, spawnInterval: 1.0, pathIndex: 0, delayBeforeGroup: 0 },
            { enemyId: 'wasteland_bulldozer', count: 10, spawnInterval: 1.4, pathIndex: 1, delayBeforeGroup: 2.5 },
            { enemyId: 'emp_sniper_droid', count: 8, spawnInterval: 1.6, pathIndex: 0, delayBeforeGroup: 4.0 },
            { enemyId: 'scrap_bomber_drone', count: 16, spawnInterval: 0.75, pathIndex: 1, delayBeforeGroup: 5.0 },
          ],
        },
      ]
    : buildStandardWaves(idx, twoPaths);

  return createLevel({
    id,
    name,
    worldId: 'cyber_wasteland',
    isWidescreen16x9: true,
    description: isBoss
      ? 'සයිබර් සුන්බුන් කලාපයේ පාලකයා වන මළ යකඩ කොලොසස් දැවැන්ත EMP රැළි සමඟ පැමිණේ!'
      : `සයිබර් සුන්බුන් මැදින් පැමිණෙන ${name} සටන් බිමේ සියලු සතුරු රැළි පරාජය කරන්න.`,
    objective: isBoss ? 'මළ යකඩ කොලොසස් පරාජය කර ලෝකය 11 ජයගන්න.' : `සතුරු වට ${waves.length}ම සාර්ථකව ආරක්ෂා කරන්න.`,
    difficultyRating: 10,
    hazard: 'cyber_emp_storm',
    hazardDescription: 'EMP කුණාටුව: සියලු සතුරන්ගේ වේගය +6% කින් ඉහළ යන අතර ස්නයිපර් ඩ්‍රොයිඩ්වරු කුළුණු අවහිර කරති.',
    decorations: DECORS_W11,
    spawns: bp.spawns,
    castle: bp.castle,
    paths: bp.paths,
    curvesDescription: bp.curvesDescription,
    hasJunctions: bp.hasJunctions,
    zoneCoords: bp.zoneCoords,
    castleHealth: isBoss ? 36 : 28 + Math.floor(idx / 3),
    startingCoins: 2450 + idx * 150 + (isBoss ? 550 : 0),
    waves,
    enemyStatScale: {
      hpMultiplier: Number((1.0 + idx * 0.032).toFixed(2)),
      speedMultiplier: Number((1.0 + idx * 0.008).toFixed(2)),
      armorBonus: Math.floor(idx / 2),
      coinMultiplier: Number((1.04 + idx * 0.02).toFixed(2)),
    },
    availableWeapons: ALL_WEAPONS,
    restrictions: ['EMP කුණාටු කලාපය · ස්නයිපර් ඩ්‍රොයිඩ් දිගු දුර අවහිරතා'],
    specialChallenges: ['ටයිටන් ප්ලාස්මා කැනන් සහ ප්ලාස්මා ගුවන් ආරක්ෂක කුළුණු උපරිම කරන්න.'],
    bossConfig: isBoss
      ? {
          enemyId: 'boss_wasteland_colossus',
          name: 'මළ යකඩ කොලොසස්',
          title: 'සයිබර් සුන්බුන් අධිපති',
          hp: 30000,
          armor: 64,
          speed: 38,
          coinReward: 1150,
          castleDamage: 99,
          resistances: ['64 ටයිටේනියම් සන්නාහය', '4800 බලශක්ති පලිහ', 'EMP අවහිර ප්‍රතිරෝධය'],
          abilities: ['සයිබර් හමුදා කැඳවීම', 'EMP කුළුණු අවහිරය', 'පලිහ පුපුරුවීම'],
          phases: [
            { hpThresholdPct: 0.72, name: 'සුන්බුන් සේනාව', ability: 'summon_minions', description: 'සගයන් කැඳවයි.' },
            { hpThresholdPct: 0.45, name: 'මහා EMP පුපුරුවීම', ability: 'tower_jam', description: 'ආසන්න කුළුණු අවහිර කරයි.' },
            { hpThresholdPct: 0.2, name: 'අවසන් ඔවර්ලෝඩ්', ability: 'shield_burst', description: 'පලිහ නැවත පුරවා වේගය වැඩි කරයි.' },
          ],
        }
      : undefined,
    rewards: { coins: 1900 + idx * 140 + (isBoss ? 1200 : 0), xp: 2000 + idx * 150 },
    bonusObjectives: [
      {
        id: `l${id}_hp`,
        description: 'බලකොටුව 85% ට වැඩි ජීව ශක්තියකින් රැකගන්න',
        type: 'min_castle_hp_pct',
        threshold: 85,
        rewardCoins: 380 + idx * 25,
      },
    ],
  });
});
