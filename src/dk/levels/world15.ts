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
    // 0: Twin-Branch Citadel Siege
    {
      spawns: [
        { x: 70, y: 165, label: 'උතුරු ඔමේගා විවරය' },
        { x: 70, y: 555, label: 'දකුණු ඔමේගා විවරය' },
      ],
      castle: { x: 1190, y: 360, name: 'ඔමේගා අවසන් බලකොටුව' },
      paths: [
        {
          id: 'omega_n',
          name: 'උතුරු ඔමේගා මග',
          width: 48,
          points: [
            { x: 70, y: 165 },
            { x: 420, y: 165 },
            { x: 580, y: 360 },
            { x: 870, y: 190 },
            { x: 1055, y: 360 },
            { x: 1190, y: 360 },
          ],
        },
        {
          id: 'omega_s',
          name: 'දකුණු ඔමේගා මග',
          width: 48,
          points: [
            { x: 70, y: 555 },
            { x: 420, y: 555 },
            { x: 580, y: 360 },
            { x: 870, y: 530 },
            { x: 1055, y: 360 },
            { x: 1190, y: 360 },
          ],
        },
      ],
      zoneCoords: [
        [235, 265], [235, 455], [415, 360], [695, 195], [695, 525],
        [870, 360], [1015, 200], [1015, 520], [520, 95], [520, 625], [1135, 240],
      ],
      hasJunctions: true,
      curvesDescription: 'ද්විත්ව ඔමේගා ප්‍රහාරක මංතීරු හරහා මධ්‍යයේදී ගැටෙන යුධ බිම.',
    },
    // 1: Triple-Lane Warfront!
    {
      spawns: [
        { x: 70, y: 135, label: 'උතුරු යුධ පෙරමුණ' },
        { x: 70, y: 360, label: 'මධ්‍ය යුධ පෙරමුණ' },
        { x: 70, y: 585, label: 'දකුණු යුධ පෙරමුණ' },
      ],
      castle: { x: 1190, y: 360, name: 'අවසන් මහා බලකොටුව' },
      paths: [
        {
          id: 'tri_n',
          name: 'උතුරු මංතීරුව',
          width: 44,
          points: [
            { x: 70, y: 135 },
            { x: 510, y: 135 },
            { x: 790, y: 245 },
            { x: 1020, y: 360 },
            { x: 1190, y: 360 },
          ],
        },
        {
          id: 'tri_c',
          name: 'මධ්‍ය මංතීරුව',
          width: 44,
          points: [
            { x: 70, y: 360 },
            { x: 640, y: 360 },
            { x: 1020, y: 360 },
            { x: 1190, y: 360 },
          ],
        },
        {
          id: 'tri_s',
          name: 'දකුණු මංතීරුව',
          width: 44,
          points: [
            { x: 70, y: 585 },
            { x: 510, y: 585 },
            { x: 790, y: 475 },
            { x: 1020, y: 360 },
            { x: 1190, y: 360 },
          ],
        },
      ],
      zoneCoords: [
        [240, 265], [240, 455], [460, 265], [460, 455], [640, 275],
        [640, 445], [880, 145], [880, 575], [960, 255], [960, 465], [1110, 245],
      ],
      hasJunctions: true,
      curvesDescription: 'මංතීරු තුනකින් එකවර සතුරන් පැමිණෙන අති-තීව්‍ර යුධ පෙරමුණ.',
    },
    // 2: Long Serpent Crossfire
    {
      spawns: [{ x: 70, y: 145, label: 'ඔමේගා පිවිසුම් දොරටුව' }],
      castle: { x: 1190, y: 575, name: 'රාජධානි අවසන් කුළුණ' },
      paths: [
        {
          id: 'omega_serpent',
          name: 'ඔමේගා සර්ප මහා මාර්ගය',
          width: 50,
          points: [
            { x: 70, y: 145 },
            { x: 460, y: 145 },
            { x: 460, y: 575 },
            { x: 820, y: 575 },
            { x: 820, y: 175 },
            { x: 1055, y: 175 },
            { x: 1055, y: 575 },
            { x: 1190, y: 575 },
          ],
        },
      ],
      zoneCoords: [
        [255, 250], [360, 250], [360, 465], [585, 260], [585, 465],
        [715, 260], [715, 465], [940, 290], [940, 465], [1135, 345], [180, 465],
      ],
      hasJunctions: false,
      curvesDescription: 'සතුරු යුධ ටැංකි හා ගුවන් යානා මර්දනය සඳහා දිගු S-වංගු බලකොටු මාර්ගය.',
    },
    // 3: Level 100 Grand Final Citadel Nexus
    {
      spawns: [
        { x: 70, y: 150, label: 'උතුරු ඔමේගා ගේට්ටුව' },
        { x: 70, y: 360, label: 'මධ්‍ය ඔමේගා ගේට්ටුව' },
        { x: 70, y: 570, label: 'දකුණු ඔමේගා ගේට්ටුව' },
      ],
      castle: { x: 1190, y: 360, name: 'අඳුරු රාජධානියේ අවසන් බලකොටුව' },
      paths: [
        {
          id: 'final_n',
          name: 'උතුරු අවසන් මහා මග',
          width: 48,
          points: [
            { x: 70, y: 150 },
            { x: 380, y: 150 },
            { x: 520, y: 360 },
            { x: 760, y: 175 },
            { x: 980, y: 175 },
            { x: 1065, y: 360 },
            { x: 1190, y: 360 },
          ],
        },
        {
          id: 'final_c',
          name: 'මධ්‍ය අවසන් මහා මග',
          width: 48,
          points: [
            { x: 70, y: 360 },
            { x: 520, y: 360 },
            { x: 840, y: 360 },
            { x: 1065, y: 360 },
            { x: 1190, y: 360 },
          ],
        },
        {
          id: 'final_s',
          name: 'දකුණු අවසන් මහා මග',
          width: 48,
          points: [
            { x: 70, y: 570 },
            { x: 380, y: 570 },
            { x: 520, y: 360 },
            { x: 760, y: 545 },
            { x: 980, y: 545 },
            { x: 1065, y: 360 },
            { x: 1190, y: 360 },
          ],
        },
      ],
      zoneCoords: [
        [225, 250], [225, 470], [415, 255], [415, 465], [605, 165],
        [605, 555], [875, 260], [875, 460], [1020, 95], [1020, 625],
        [1130, 240], [1130, 480],
      ],
      hasJunctions: true,
      curvesDescription: 'මට්ටම 100 අවසන් මහා සංග්‍රාමය — මංතීරු 3ක් හා ආරක්ෂක කලාප 12ක් සහිත මහා බලකොටුව!',
    },
  ];
  return layouts[variant % layouts.length];
}

const DECORS_W15: DecorObject[] = [
  { kind: 'omega_citadel', x: 175, y: 88, scale: 1.3 },
  { kind: 'plasma_beacon', x: 640, y: 85, scale: 1.3 },
  { kind: 'omega_citadel', x: 1105, y: 638, scale: 1.35 },
  { kind: 'plasma_beacon', x: 175, y: 638, scale: 1.3 },
];

function buildWaves(offset: number, pathCount: number): WaveConfig[] {
  const c = (n: number) => Math.max(4, Math.round(n * (1 + offset * 0.045)));
  const lane = (i: number) => i % pathCount;

  const waves: WaveConfig[] = [
    {
      waveNumber: 1,
      announcement: 'ඔමේගා සයිබර් පෙරමුණ',
      delayBeforeWave: 2,
      bonusCoins: 380 + offset * 28,
      groups: [
        { enemyId: 'omega_cyber_vanguard', count: c(10), spawnInterval: 0.78, pathIndex: 0, delayBeforeGroup: 0 },
        { enemyId: 'omega_cyber_vanguard', count: c(7), spawnInterval: 0.82, pathIndex: lane(1), delayBeforeGroup: 1.8 },
      ],
    },
    {
      waveNumber: 2,
      announcement: 'ඔමේගා වටලෑම් ටැංකි හා ස්ටෙල්ත් යානා',
      delayBeforeWave: 5,
      bonusCoins: 440 + offset * 32,
      groups: [
        { enemyId: 'omega_siege_tank', count: c(8), spawnInterval: 1.3, pathIndex: 0, delayBeforeGroup: 0 },
        { enemyId: 'omega_stealth_interceptor', count: c(16), spawnInterval: 0.48, pathIndex: lane(2), delayBeforeGroup: 1.2 },
      ],
    },
    {
      waveNumber: 3,
      announcement: 'රේල්ගන් ස්ට්‍රයිඩර් ප්‍රහාරය',
      delayBeforeWave: 6,
      bonusCoins: 510 + offset * 36,
      groups: [
        { enemyId: 'omega_railgun_strider', count: c(10), spawnInterval: 1.0, pathIndex: lane(1), delayBeforeGroup: 0 },
        { enemyId: 'omega_cyber_vanguard', count: c(20), spawnInterval: 0.42, pathIndex: 0, delayBeforeGroup: 1.2 },
      ],
    },
    {
      waveNumber: 4,
      announcement: 'බහු-මාන ඒකාබද්ධ ප්‍රහාරය',
      delayBeforeWave: 6,
      bonusCoins: 580 + offset * 40,
      groups: [
        { enemyId: 'omega_siege_tank', count: c(10), spawnInterval: 1.15, pathIndex: lane(2), delayBeforeGroup: 0 },
        { enemyId: 'omega_railgun_strider', count: c(12), spawnInterval: 0.85, pathIndex: lane(1), delayBeforeGroup: 1.2 },
        { enemyId: 'omega_stealth_interceptor', count: c(18), spawnInterval: 0.4, pathIndex: 0, delayBeforeGroup: 2.0 },
      ],
    },
    {
      waveNumber: 5,
      announcement: 'ඔමේගා මහා කුණාටුව',
      delayBeforeWave: 6,
      bonusCoins: 680 + offset * 45,
      groups: [
        { enemyId: 'omega_siege_tank', count: c(12), spawnInterval: 1.0, pathIndex: 0, delayBeforeGroup: 0 },
        { enemyId: 'omega_railgun_strider', count: c(14), spawnInterval: 0.78, pathIndex: lane(1), delayBeforeGroup: 1.0 },
        { enemyId: 'omega_stealth_interceptor', count: c(22), spawnInterval: 0.36, pathIndex: lane(2), delayBeforeGroup: 1.8 },
      ],
    },
    {
      waveNumber: 6,
      announcement: offset >= 6 ? 'අනු-ප්‍රධාන සතුරා: ඔමේගා යුධ යන්ත්‍ර හමුදාව!' : 'අවසන් ඔමේගා ආක්‍රමණය',
      delayBeforeWave: 7,
      bonusCoins: 780 + offset * 50,
      groups: [
        { enemyId: 'omega_war_machine', count: offset >= 6 ? 3 : 2, spawnInterval: 3.0, pathIndex: 0, delayBeforeGroup: 0 },
        { enemyId: 'omega_siege_tank', count: c(12), spawnInterval: 1.0, pathIndex: lane(1), delayBeforeGroup: 1.2 },
        { enemyId: 'omega_stealth_interceptor', count: c(24), spawnInterval: 0.34, pathIndex: lane(2), delayBeforeGroup: 2.0 },
      ],
    },
  ];

  return waves;
}

const NAMES_W15 = [
  'ඔමේගා අවසන් දොරටුව',
  'රේල්ගන් යුධ පෙරමුණ',
  'වටලෑම් ටැංකි කලාපය',
  'ස්ටෙල්ත් ගුවන් අවසන් සටන',
  'ත්‍රිත්ව මංතීරු සංග්‍රාමය',
  'ප්ලාස්මා බලකොටු බිඳීම',
  'අනු-අධිපති ප්‍රහාරය',
  'විශ්වීය රේල්ගන් වැටලෑම',
  'අවසන් මහා ආරක්ෂාව',
  'ඔමේගා මහා අධිපති',
];

export const WORLD_15_LEVELS: LevelConfig[] = NAMES_W15.map((name, idx) => {
  const id = 91 + idx;
  const isBoss = id === 100;
  const bp = makeBlueprint(isBoss ? 3 : idx % 3);
  const pathCount = bp.paths.length;
  const waves: WaveConfig[] = isBoss
    ? [
        ...buildWaves(idx, pathCount).slice(0, 5),
        {
          waveNumber: 6,
          announcement: 'අවසන් මහා ප්‍රධාන සතුරා: ඔමේගා මහා අධිපති!',
          delayBeforeWave: 9,
          bonusCoins: 5000,
          groups: [
            { enemyId: 'boss_omega_supreme_overlord', count: 1, spawnInterval: 1.0, pathIndex: 1, delayBeforeGroup: 0 },
            { enemyId: 'omega_siege_tank', count: 12, spawnInterval: 1.4, pathIndex: 0, delayBeforeGroup: 2.5 },
            { enemyId: 'omega_railgun_strider', count: 12, spawnInterval: 1.3, pathIndex: 2, delayBeforeGroup: 3.5 },
            { enemyId: 'omega_stealth_interceptor', count: 22, spawnInterval: 0.55, pathIndex: 0, delayBeforeGroup: 4.5 },
          ],
        },
      ]
    : buildWaves(idx, pathCount);

  return createLevel({
    id,
    name,
    worldId: 'omega_final_war',
    isWidescreen16x9: true,
    description: isBoss
      ? 'මට්ටම 100 අවසන් මහා සංග්‍රාමය! සිව්-පියාපත් ඔමේගා මහා අධිපති සියලුම යුධ ඒකක සමඟ අවසන් ප්‍රහාරය එල්ල කරයි!'
      : `අවසන් ඔමේගා යුද්ධයේ ${name} සටන් බිමේදී සියලුම භූමි හා ගුවන් සතුරු රැළි මැඩපවත්වන්න.`,
    objective: isBoss ? 'ඔමේගා මහා අධිපති පරාජය කර Dark Kingdom සම්පූර්ණ ජයග්‍රහණය ලබාගන්න!' : `සතුරු වට ${waves.length}ම ජයගන්න.`,
    difficultyRating: 10,
    hazard: 'omega_warzone',
    hazardDescription: 'ඔමේගා යුධ කලාපය: සතුරු HP +6%, වේගය +5%, සෑම සතුරෙකුගෙන්ම +8% අමතර කාසි!',
    decorations: DECORS_W15,
    spawns: bp.spawns,
    castle: bp.castle,
    paths: bp.paths,
    curvesDescription: bp.curvesDescription,
    hasJunctions: bp.hasJunctions,
    zoneCoords: bp.zoneCoords,
    castleHealth: isBoss ? 50 : 38 + Math.floor(idx / 3),
    startingCoins: 4750 + idx * 235 + (isBoss ? 1400 : 0),
    waves,
    enemyStatScale: {
      hpMultiplier: Number((1.07 + idx * 0.03).toFixed(2)),
      speedMultiplier: Number((1.01 + idx * 0.008).toFixed(2)),
      armorBonus: 10 + Math.floor(idx / 2),
      coinMultiplier: Number((1.2 + idx * 0.03).toFixed(2)),
    },
    availableWeapons: ALL_WEAPONS,
    restrictions: isBoss
      ? ['මට්ටම 100 අවසන් සටන · 105,000+ HP පියාසර අධිපති · බහු-මංතීරු ආක්‍රමණය']
      : ['ඔමේගා වටලෑම් ටැංකි · රේල්ගන් අවහිරතා · ස්ටෙල්ත් ගුවන් යානා'],
    specialChallenges: ['ටයිටන් ප්ලාස්මා කැනන්, ප්ලාස්මා ගුවන් ආරක්ෂක හා තන්ඩර් කුළුණු Tier-9 දක්වා උසස් කරන්න!'],
    bossConfig: isBoss
      ? {
          enemyId: 'boss_omega_supreme_overlord',
          name: 'ඔමේගා මහා අධිපති',
          title: 'අවසන් මහා යුධ අධිරාජ්‍යයා (Level 100 Final Boss)',
          hp: 105000,
          armor: 112,
          speed: 42,
          coinReward: 5000,
          castleDamage: 99,
          resistances: ['පියාසර අවසන් ප්‍රධාන සතුරා', '112 ඔමේගා සන්නාහය', '18500 ප්ලාස්මා පලිහ', 'විෂ ප්‍රතිරෝධී'],
          abilities: ['ඔමේගා ගුවන් සේනා කැඳවීම', 'මහා රේල්ගන් කුළුණු අවහිරය', 'ප්ලාස්මා පලිහ පුපුරුවීම', 'ඔමේගා වේග ප්‍රහාරය'],
          phases: [
            { hpThresholdPct: 0.78, name: 'ඔමේගා ගුවන් සේනාව', ability: 'summon_minions', description: 'අවසන් ආරක්ෂක සගයන් කැඳවයි.' },
            { hpThresholdPct: 0.56, name: 'රේල්ගන් අවහිර කුණාටුව', ability: 'tower_jam', description: 'ආසන්න කුළුණු තාවකාලිකව අක්‍රීය කරයි.' },
            { hpThresholdPct: 0.34, name: 'ප්ලාස්මා මහා පලිහ', ability: 'shield_burst', description: 'බලවත් ඔමේගා පලිහ නැවත පුරවයි.' },
            { hpThresholdPct: 0.16, name: 'අවසන් ඔමේගා උත්තේජනය', ability: 'speed_surge', description: 'අවසන් වේග ප්‍රහාරය දියත් කරයි!' },
          ],
        }
      : undefined,
    rewards: { coins: 4000 + idx * 250 + (isBoss ? 4000 : 0), xp: 4500 + idx * 280 },
    bonusObjectives: [
      {
        id: `l${id}_hp`,
        description: 'බලකොටුව 85% ට වැඩි ජීව ශක්තියකින් රැකගන්න',
        type: 'min_castle_hp_pct',
        threshold: 85,
        rewardCoins: 750 + idx * 50,
      },
    ],
  });
});
