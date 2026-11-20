import { drawDefeatedMonsterEffect, drawIllustratedMonster } from './art/monsterSprites';
import {
  drawActiveDefenseDrones,
  drawIllustratedTower,
  drawTowerPlacementPreview,
} from './art/towerSprites';
import {
  ActiveDroneState,
  ActiveEnemyState,
  ActiveSpiderNestState,
  DecorObject,
  DefeatedEffect,
  LevelConfig,
  PlacedTowerState,
  Vec2,
  WeaponDefinition,
  WeaponId,
  WorldDefinition,
  WorldId,
} from './types';
import { WEAPON_MAP } from './weapons';
import { WORLD_MAP } from './worlds';

// Canonical 16:9 Widescreen Logical World
export const MAP_WIDTH = 1280;
export const MAP_HEIGHT = 720;

const STATIC_CACHE_MIN_X = -180;
const STATIC_CACHE_MIN_Y = -140;
const STATIC_CACHE_W = 1640;
const STATIC_CACHE_H = 1000;

export interface ViewportTransform {
  scale: number;
  offsetX: number;
  offsetY: number;
  viewW: number;
  viewH: number;
}

export interface RenderProjectile {
  weaponId: WeaponId;
  projectileType: WeaponDefinition['projectileType'];
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  accentColor: string;
  upgradeTier?: number;
}

export interface RenderBeam {
  points: Vec2[];
  color: string;
  width: number;
  life: number;
  maxLife: number;
  kind: 'beam' | 'shockwave' | 'emp_ring';
  style?: 'lightning' | 'laser' | 'drone_laser';
  radius?: number;
}

export interface RenderParticle {
  x: number;
  y: number;
  color: string;
  size: number;
  life: number;
  maxLife: number;
}

export interface RenderCoinDrop {
  x: number;
  y: number;
  startY: number;
  amount: number;
  life: number;
  maxLife: number;
}

export interface RenderFloatingText {
  x: number;
  y: number;
  text: string;
  color: string;
  life: number;
  maxLife: number;
}

export interface EngineRenderState {
  level: LevelConfig;
  status: string;
  elapsedTime: number;
  castleHp: number;
  maxCastleHp: number;
  castleDamageFlash: number;
  castleShakeTimer: number;
  coins: number;
  towers: PlacedTowerState[];
  enemies: ActiveEnemyState[];
  spiderNests: ActiveSpiderNestState[];
  activeDrones: ActiveDroneState[];
  defeatedEffects: DefeatedEffect[];
  projectiles: RenderProjectile[];
  beams: RenderBeam[];
  particles: RenderParticle[];
  coinDrops: RenderCoinDrop[];
  floatingTexts: RenderFloatingText[];
  selectedZoneId: string | null;
  previewWeaponId: WeaponId | null;
  pendingWeaponToBuild: WeaponId | null;
  selectedTowerId: string | null;
  selectedEnemyId: string | null;
  selectedNestId: string | null;
  focusedNestId: string | null;
  showRangeAlways: boolean;
  getTowerRange: (t: PlacedTowerState) => number;
  getPreviewRange: (wId: WeaponId) => number;
  getWeaponCost: (wId: WeaponId) => number;
}

export function computeViewportTransform(
  viewW: number,
  viewH: number,
  topSafePx = 26,
  bottomSafePx = 34
): ViewportTransform {
  const safeW = Math.max(240, viewW);
  const safeH = Math.max(180, viewH - topSafePx - bottomSafePx);
  const scale = Math.min(safeW / MAP_WIDTH, safeH / MAP_HEIGHT);
  const drawnW = MAP_WIDTH * scale;
  const drawnH = MAP_HEIGHT * scale;
  const offsetX = (viewW - drawnW) * 0.5;
  const offsetY = topSafePx + (safeH - drawnH) * 0.5;
  return { scale, offsetX, offsetY, viewW, viewH };
}

function seededRand(seed: number): () => number {
  let s = (seed * 9301 + 49297) % 233280;
  if (s < 0) s += 233280;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function distToSegment(p: Vec2, a: Vec2, b: Vec2): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return Math.hypot(p.x - a.x, p.y - a.y);
  const t = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / lenSq));
  return Math.hypot(p.x - (a.x + t * dx), p.y - (a.y + t * dy));
}

interface BiomePalette {
  grassA: string;
  grassB: string;
  grassC: string;
  cliffFace: string;
  cliffRim: string;
  roadFill: string;
  roadInner: string;
  roadStone: string;
  roadEdge: string;
  water: string;
  waterDeep: string;
  waterGlow: string;
  treeLeaf: string;
  treeMid: string;
  treeHighlight: string;
  padBase: string;
  padRim: string;
  castleStone: string;
  castleDark: string;
  castleRoof: string;
  bannerColor: string;
  torchGlow: string;
}

function getBiomeColors(world: WorldDefinition): BiomePalette {
  switch (world.id) {
    case 'forgotten_kingdom':
      return {
        grassA: '#3f7d36',
        grassB: '#2a5a26',
        grassC: '#5ca348',
        cliffFace: '#5d4a38',
        cliffRim: '#75b857',
        roadFill: '#b89463',
        roadInner: '#d4b383',
        roadStone: '#9e7c50',
        roadEdge: '#664a2e',
        water: '#1e90b8',
        waterDeep: '#0f5c7a',
        waterGlow: '#7dd3fc',
        treeLeaf: '#1e5724',
        treeMid: '#2d7a32',
        treeHighlight: '#6ad158',
        padBase: '#334155',
        padRim: '#94a3b8',
        castleStone: '#94a3b8',
        castleDark: '#475569',
        castleRoof: '#1d4ed8',
        bannerColor: '#ef4444',
        torchGlow: '#fb923c',
      };
    case 'cursed_forest':
      return {
        grassA: '#1e4230',
        grassB: '#12281d',
        grassC: '#2b5c42',
        cliffFace: '#2c302e',
        cliffRim: '#3a7554',
        roadFill: '#6b5b4a',
        roadInner: '#85735e',
        roadStone: '#52463a',
        roadEdge: '#312921',
        water: '#2b7a4b',
        waterDeep: '#15442b',
        waterGlow: '#84cc16',
        treeLeaf: '#123622',
        treeMid: '#1f5737',
        treeHighlight: '#4ade80',
        padBase: '#27303f',
        padRim: '#6ee7b7',
        castleStone: '#64748b',
        castleDark: '#334155',
        castleRoof: '#065f46',
        bannerColor: '#a3e635',
        torchGlow: '#4ade80',
      };
    case 'lava_lands':
      return {
        grassA: '#431d19',
        grassB: '#270f0d',
        grassC: '#5e2b24',
        cliffFace: '#291716',
        cliffRim: '#7c2d12',
        roadFill: '#544542',
        roadInner: '#6e5c58',
        roadStone: '#382d2b',
        roadEdge: '#231614',
        water: '#ea580c',
        waterDeep: '#9a3412',
        waterGlow: '#fde047',
        treeLeaf: '#3b150c',
        treeMid: '#7c2d12',
        treeHighlight: '#fb923c',
        padBase: '#292524',
        padRim: '#fb923c',
        castleStone: '#57534e',
        castleDark: '#292524',
        castleRoof: '#b91c1c',
        bannerColor: '#f59e0b',
        torchGlow: '#fde047',
      };
    case 'frozen_empire':
      return {
        grassA: '#2e577d',
        grassB: '#1d3954',
        grassC: '#4277a6',
        cliffFace: '#315170',
        cliffRim: '#93c5fd',
        roadFill: '#9cc2e0',
        roadInner: '#cbe4f7',
        roadStone: '#77a3c7',
        roadEdge: '#476e91',
        water: '#0284c7',
        waterDeep: '#075985',
        waterGlow: '#e0f2fe',
        treeLeaf: '#164e63',
        treeMid: '#0284c7',
        treeHighlight: '#e0f2fe',
        padBase: '#1e3a5f',
        padRim: '#7dd3fc',
        castleStone: '#cbd5e1',
        castleDark: '#64748b',
        castleRoof: '#0284c7',
        bannerColor: '#38bdf8',
        torchGlow: '#bae6fd',
      };
    case 'desert_kingdom':
      return {
        grassA: '#a3773c',
        grassB: '#7d5726',
        grassC: '#c2924e',
        cliffFace: '#754c24',
        cliffRim: '#e0b468',
        roadFill: '#dcb779',
        roadInner: '#edd09c',
        roadStone: '#bd9659',
        roadEdge: '#805c2a',
        water: '#0e95ad',
        waterDeep: '#095e70',
        waterGlow: '#67e8f9',
        treeLeaf: '#3f6212',
        treeMid: '#65a30d',
        treeHighlight: '#bef264',
        padBase: '#78552b',
        padRim: '#fcd34d',
        castleStone: '#eab308',
        castleDark: '#92400e',
        castleRoof: '#b45309',
        bannerColor: '#06b6d4',
        torchGlow: '#fde047',
      };
    case 'sky_islands':
      return {
        grassA: '#2f568a',
        grassB: '#1e3a63',
        grassC: '#4576b5',
        cliffFace: '#334155',
        cliffRim: '#7dd3fc',
        roadFill: '#cbd5e1',
        roadInner: '#f1f5f9',
        roadStone: '#94a3b8',
        roadEdge: '#64748b',
        water: '#38bdf8',
        waterDeep: '#0369a1',
        waterGlow: '#ffffff',
        treeLeaf: '#075985',
        treeMid: '#0284c7',
        treeHighlight: '#bae6fd',
        padBase: '#334155',
        padRim: '#e2e8f0',
        castleStone: '#e2e8f0',
        castleDark: '#64748b',
        castleRoof: '#2563eb',
        bannerColor: '#fbbf24',
        torchGlow: '#7dd3fc',
      };
    case 'ancient_temple':
      return {
        grassA: '#35314a',
        grassB: '#211e30',
        grassC: '#4c4669',
        cliffFace: '#2e2b3d',
        cliffRim: '#8b5cf6',
        roadFill: '#7f7896',
        roadInner: '#9e97b5',
        roadStone: '#5d5773',
        roadEdge: '#3e394f',
        water: '#6d28d9',
        waterDeep: '#4c1d95',
        waterGlow: '#d8b4fe',
        treeLeaf: '#3b0764',
        treeMid: '#6d28d9',
        treeHighlight: '#c084fc',
        padBase: '#2e2645',
        padRim: '#c084fc',
        castleStone: '#a78bfa',
        castleDark: '#4c1d95',
        castleRoof: '#f59e0b',
        bannerColor: '#c084fc',
        torchGlow: '#e9d5ff',
      };
    case 'mushroom_kingdom':
      return {
        grassA: '#3d2252',
        grassB: '#261336',
        grassC: '#583375',
        cliffFace: '#341e45',
        cliffRim: '#e879f9',
        roadFill: '#8d6596',
        roadInner: '#b085ba',
        roadStone: '#694870',
        roadEdge: '#472d4d',
        water: '#9333ea',
        waterDeep: '#581c87',
        waterGlow: '#f5d0fe',
        treeLeaf: '#701a75',
        treeMid: '#c026d3',
        treeHighlight: '#f472b6',
        padBase: '#3b1d52',
        padRim: '#f0abfc',
        castleStone: '#d8b4fe',
        castleDark: '#6b21a8',
        castleRoof: '#db2777',
        bannerColor: '#4ade80',
        torchGlow: '#f0abfc',
      };
    case 'ocean_abyss':
      return {
        grassA: '#134259',
        grassB: '#0a2736',
        grassC: '#1c5d7d',
        cliffFace: '#0f3042',
        cliffRim: '#2dd4bf',
        roadFill: '#3b8299',
        roadInner: '#59a6bf',
        roadStone: '#255f73',
        roadEdge: '#163f4f',
        water: '#0284c7',
        waterDeep: '#0c4a6e',
        waterGlow: '#5eead4',
        treeLeaf: '#0f766e',
        treeMid: '#14b8a6',
        treeHighlight: '#99f6e4',
        padBase: '#0f384a',
        padRim: '#5eead4',
        castleStone: '#67e8f9',
        castleDark: '#155e75',
        castleRoof: '#0f766e',
        bannerColor: '#2dd4bf',
        torchGlow: '#5eead4',
      };
    case 'cyber_wasteland':
      return {
        grassA: '#27303f',
        grassB: '#161c26',
        grassC: '#3a4659',
        cliffFace: '#1e2430',
        cliffRim: '#f59e0b',
        roadFill: '#475569',
        roadInner: '#64748b',
        roadStone: '#334155',
        roadEdge: '#0f172a',
        water: '#b45309',
        waterDeep: '#451a03',
        waterGlow: '#fbbf24',
        treeLeaf: '#334155',
        treeMid: '#475569',
        treeHighlight: '#f59e0b',
        padBase: '#1e293b',
        padRim: '#f59e0b',
        castleStone: '#94a3b8',
        castleDark: '#334155',
        castleRoof: '#d97706',
        bannerColor: '#f59e0b',
        torchGlow: '#fb923c',
      };
    case 'toxic_mutation_zone':
      return {
        grassA: '#163622',
        grassB: '#0c2114',
        grassC: '#235234',
        cliffFace: '#14291c',
        cliffRim: '#84cc16',
        roadFill: '#3b4a3f',
        roadInner: '#526958',
        roadStone: '#263329',
        roadEdge: '#111a13',
        water: '#65a30d',
        waterDeep: '#1a2e05',
        waterGlow: '#bef264',
        treeLeaf: '#14532d',
        treeMid: '#15803d',
        treeHighlight: '#a3e635',
        padBase: '#132a1d',
        padRim: '#a3e635',
        castleStone: '#64748b',
        castleDark: '#1e293b',
        castleRoof: '#4d7c0f',
        bannerColor: '#a3e635',
        torchGlow: '#bef264',
      };
    case 'frozen_mecha_kingdom':
      return {
        grassA: '#1e3a5f',
        grassB: '#0f233d',
        grassC: '#2c5282',
        cliffFace: '#172c47',
        cliffRim: '#38bdf8',
        roadFill: '#64829e',
        roadInner: '#94b2cc',
        roadStone: '#435e78',
        roadEdge: '#1e3a5f',
        water: '#0284c7',
        waterDeep: '#082f49',
        waterGlow: '#7dd3fc',
        treeLeaf: '#0c4a6e',
        treeMid: '#0284c7',
        treeHighlight: '#bae6fd',
        padBase: '#162d47',
        padRim: '#38bdf8',
        castleStone: '#bae6fd',
        castleDark: '#1e3a5f',
        castleRoof: '#0284c7',
        bannerColor: '#38bdf8',
        torchGlow: '#7dd3fc',
      };
    case 'void_dimension':
      return {
        grassA: '#241445',
        grassB: '#140929',
        grassC: '#371e69',
        cliffFace: '#1b0e36',
        cliffRim: '#c084fc',
        roadFill: '#4c2c7a',
        roadInner: '#6b42a6',
        roadStone: '#321b54',
        roadEdge: '#190a30',
        water: '#7e22ce',
        waterDeep: '#3b0764',
        waterGlow: '#e879f9',
        treeLeaf: '#3b0764',
        treeMid: '#6b21a8',
        treeHighlight: '#e879f9',
        padBase: '#1f113a',
        padRim: '#c084fc',
        castleStone: '#c4b5fd',
        castleDark: '#3b0764',
        castleRoof: '#9333ea',
        bannerColor: '#e879f9',
        torchGlow: '#d946ef',
      };
    case 'omega_final_war':
      return {
        grassA: '#24141d',
        grassB: '#12080e',
        grassC: '#381e2c',
        cliffFace: '#1c0e16',
        cliffRim: '#fbbf24',
        roadFill: '#422c38',
        roadInner: '#5e3f50',
        roadStone: '#2b1b24',
        roadEdge: '#14090f',
        water: '#be123c',
        waterDeep: '#4c0519',
        waterGlow: '#fbbf24',
        treeLeaf: '#4c0519',
        treeMid: '#9f1239',
        treeHighlight: '#fbbf24',
        padBase: '#24121c',
        padRim: '#fbbf24',
        castleStone: '#cbd5e1',
        castleDark: '#1e1b24',
        castleRoof: '#be123c',
        bannerColor: '#fbbf24',
        torchGlow: '#f43f5e',
      };
    case 'dragons_realm':
    default:
      return {
        grassA: '#381824',
        grassB: '#210c14',
        grassC: '#522435',
        cliffFace: '#240f17',
        cliffRim: '#ef4444',
        roadFill: '#613741',
        roadInner: '#824b58',
        roadStone: '#45242c',
        roadEdge: '#291218',
        water: '#dc2626',
        waterDeep: '#7f1d1d',
        waterGlow: '#fb923c',
        treeLeaf: '#450a0a',
        treeMid: '#991b1b',
        treeHighlight: '#f87171',
        padBase: '#30141c',
        padRim: '#fbbf24',
        castleStone: '#78716c',
        castleDark: '#292524',
        castleRoof: '#dc2626',
        bannerColor: '#fbbf24',
        torchGlow: '#fb923c',
      };
  }
}

function getStreamPointsForLevel(level: LevelConfig): Vec2[] | null {
  if (level.id === 1) return null;
  const rng = seededRand(level.id * 173 + 19);
  const variant = level.id % 5;
  const baseY = 195 + rng() * 310;
  if (variant === 0) {
    // Diagonal mountain stream from top-left toward bottom-right
    return [
      { x: -240, y: 120 + rng() * 90 },
      { x: 260, y: 240 + rng() * 60 },
      { x: 640, y: 360 + rng() * 60 },
      { x: 1020, y: 490 + rng() * 50 },
      { x: 1540, y: 610 + rng() * 50 },
    ];
  }
  if (variant === 2) {
    // Broad sweeping S-curve river
    return [
      { x: 340 + rng() * 140, y: -150 },
      { x: 470 + rng() * 90, y: 160 },
      { x: 360 + rng() * 90, y: 370 },
      { x: 520 + rng() * 110, y: 560 },
      { x: 420 + rng() * 140, y: 880 },
    ];
  }
  if (variant === 4) {
    // Upper channel skirting castle outskirts
    return [
      { x: -260, y: 155 + rng() * 45 },
      { x: 220, y: 130 + rng() * 50 },
      { x: 640, y: 185 + rng() * 55 },
      { x: 1060, y: 135 + rng() * 50 },
      { x: 1540, y: 215 + rng() * 50 },
    ];
  }
  return [
    { x: -300, y: baseY - 45 },
    { x: 280, y: baseY + 65 },
    { x: 640, y: baseY - 52 },
    { x: 980, y: baseY + 58 },
    { x: 1560, y: baseY - 36 },
  ];
}

function traceSmoothSpline(ctx: CanvasRenderingContext2D, pts: Vec2[]) {
  if (pts.length < 2) return;
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  if (pts.length === 2) {
    ctx.lineTo(pts[1].x, pts[1].y);
    return;
  }
  for (let i = 1; i < pts.length - 1; i++) {
    const xc = (pts[i].x + pts[i + 1].x) * 0.5;
    const yc = (pts[i].y + pts[i + 1].y) * 0.5;
    ctx.quadraticCurveTo(pts[i].x, pts[i].y, xc, yc);
  }
  const last = pts[pts.length - 1];
  ctx.lineTo(last.x, last.y);
}

function sampleSplinePoints(pts: Vec2[], stepPx: number): { x: number; y: number; angle: number }[] {
  const result: { x: number; y: number; angle: number }[] = [];
  if (pts.length < 2) return result;
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1];
    const b = pts[i];
    const segLen = Math.hypot(b.x - a.x, b.y - a.y);
    const angle = Math.atan2(b.y - a.y, b.x - a.x);
    const count = Math.max(1, Math.floor(segLen / stepPx));
    for (let s = 0; s < count; s++) {
      const t = (s + 0.5) / count;
      result.push({
        x: a.x + (b.x - a.x) * t,
        y: a.y + (b.y - a.y) * t,
        angle,
      });
    }
  }
  return result;
}

function findSegmentIntersection(a: Vec2, b: Vec2, c: Vec2, d: Vec2): Vec2 | null {
  const rX = b.x - a.x;
  const rY = b.y - a.y;
  const sX = d.x - c.x;
  const sY = d.y - c.y;
  const denom = rX * sY - rY * sX;
  if (Math.abs(denom) < 1e-6) return null;
  const u = ((c.x - a.x) * rY - (c.y - a.y) * rX) / denom;
  const t = ((c.x - a.x) * sY - (c.y - a.y) * sX) / denom;
  if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
    return { x: a.x + t * rX, y: a.y + t * rY };
  }
  return null;
}

export class BattlefieldRenderer {
  private staticCache: {
    levelId: number;
    canvas: HTMLCanvasElement;
  } | null = null;

  private getOrBuildStaticTerrain(
    level: LevelConfig,
    world: WorldDefinition,
    pal: BiomePalette
  ): HTMLCanvasElement | null {
    if (typeof document === 'undefined') return null;
    if (this.staticCache && this.staticCache.levelId === level.id) {
      return this.staticCache.canvas;
    }

    const canvas = document.createElement('canvas');
    canvas.width = STATIC_CACHE_W;
    canvas.height = STATIC_CACHE_H;
    const sctx = canvas.getContext('2d');
    if (!sctx) return null;

    sctx.save();
    sctx.translate(-STATIC_CACHE_MIN_X, -STATIC_CACHE_MIN_Y);

    // Rich radial backdrop inside cache
    const bg = sctx.createRadialGradient(640, 320, 80, 640, 360, 960);
    bg.addColorStop(0, pal.grassC);
    bg.addColorStop(0.62, pal.grassA);
    bg.addColorStop(1, pal.grassB);
    sctx.fillStyle = bg;
    sctx.fillRect(STATIC_CACHE_MIN_X, STATIC_CACHE_MIN_Y, STATIC_CACHE_W, STATIC_CACHE_H);

    // Multi-layered hills, terraced cliffs & sunlit contour meadows
    this.drawStaticTerrainAndPlateaus(sctx, level, world, pal);

    // Static road foundation + fitted cobblestone / flagstone slabs + curbstones
    this.drawStaticRoads(sctx, level, world, pal);

    // Roadside lanterns/torches and biome stone props
    this.drawStaticProps(sctx, level, world, pal);

    sctx.restore();
    this.staticCache = { levelId: level.id, canvas };
    return canvas;
  }

  public render(
    ctx: CanvasRenderingContext2D,
    vt: ViewportTransform,
    state: EngineRenderState
  ) {
    const { level, elapsedTime } = state;
    const world = WORLD_MAP[level.worldId];
    const pal = getBiomeColors(world);

    // 1. Seamless Edge-to-Edge Terrain Backdrop (Zero Black Bars)
    const fullBg = ctx.createRadialGradient(
      vt.viewW * 0.5,
      vt.viewH * 0.45,
      50,
      vt.viewW * 0.5,
      vt.viewH * 0.5,
      Math.max(vt.viewW, vt.viewH) * 0.85
    );
    fullBg.addColorStop(0, pal.grassC);
    fullBg.addColorStop(0.6, pal.grassA);
    fullBg.addColorStop(1, pal.grassB);
    ctx.fillStyle = fullBg;
    ctx.fillRect(0, 0, vt.viewW, vt.viewH);

    ctx.save();
    let shakeX = 0;
    let shakeY = 0;
    if (state.castleShakeTimer > 0) {
      shakeX = Math.sin(elapsedTime * 55) * 4.5 * state.castleShakeTimer;
      shakeY = Math.cos(elapsedTime * 48) * 3.5 * state.castleShakeTimer;
    }
    ctx.translate(vt.offsetX + shakeX, vt.offsetY + shakeY);
    ctx.scale(vt.scale, vt.scale);

    const minX = -vt.offsetX / vt.scale - 90;
    const maxX = (vt.viewW - vt.offsetX) / vt.scale + 90;
    const minY = -vt.offsetY / vt.scale - 90;
    const maxY = (vt.viewH - vt.offsetY) / vt.scale + 90;

    // 2. Cached High-Detail Terrain, Plateaus & Cobblestone Roads (or direct fallback in headless Node)
    const cachedTerrain = this.getOrBuildStaticTerrain(level, world, pal);
    if (cachedTerrain) {
      ctx.drawImage(cachedTerrain, STATIC_CACHE_MIN_X, STATIC_CACHE_MIN_Y);
    } else {
      this.drawStaticTerrainAndPlateaus(ctx, level, world, pal);
      this.drawStaticRoads(ctx, level, world, pal);
      this.drawStaticProps(ctx, level, world, pal);
    }

    // 3. Animated Water Features & Bridges spanning water crossings
    const streamPts = getStreamPointsForLevel(level);
    if (level.id === 1) {
      this.drawMeadowPond(ctx, 155, 585, pal, elapsedTime);
    } else if (streamPts) {
      this.drawRiver(ctx, streamPts, world, pal, elapsedTime);
    }
    this.drawBridgesOverWater(ctx, level, world, streamPts);

    // 4. Animated Trees, Bushes, Crystals, Ruins & Torch Flicker
    this.drawEnvironmentProps(ctx, level, world, pal, minX, maxX, minY, maxY, elapsedTime);

    // 5. Carved Stone Build Pads
    this.drawBuildZones(ctx, state, pal);

    // 6. Tower Range Rings (selected or always-on)
    for (const tower of state.towers) {
      const isSelected = tower.instanceId === state.selectedTowerId;
      if (isSelected || state.showRangeAlways) {
        const range = state.getTowerRange(tower);
        ctx.save();
        ctx.fillStyle = isSelected ? 'rgba(56, 189, 248, 0.14)' : 'rgba(255, 255, 255, 0.04)';
        ctx.strokeStyle = isSelected ? 'rgba(125, 211, 252, 0.88)' : 'rgba(255, 255, 255, 0.18)';
        ctx.lineWidth = isSelected ? 2.4 : 1.1;
        ctx.beginPath();
        ctx.arc(tower.x, tower.y, range, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }
    }

    // 7. Biome-Themed Spawn Gates, Destructible Spider Nests & Grand Fantasy Castle
    for (const sp of level.spawns) {
      this.drawSpawnGate(ctx, sp.x, sp.y, world, pal, elapsedTime);
    }
    if (state.spiderNests && state.spiderNests.length > 0) {
      this.drawSpiderNests(ctx, state, elapsedTime);
    }
    this.drawCastle(ctx, state, world, pal, elapsedTime);

    // 8. Illustrated Defensive Towers
    for (const tower of state.towers) {
      drawIllustratedTower(ctx, tower, tower.instanceId === state.selectedTowerId, elapsedTime);
    }

    // 8b. Live Placement Preview + Range Ring on Selected Build Pad
    if (state.selectedZoneId && state.previewWeaponId) {
      const zone = level.buildZones.find((z) => z.id === state.selectedZoneId);
      const occupied = state.towers.some((t) => t.zoneId === state.selectedZoneId);
      if (zone && !occupied) {
        const range = state.getPreviewRange(state.previewWeaponId);
        const cost = state.getWeaponCost(state.previewWeaponId);
        drawTowerPlacementPreview(
          ctx,
          zone.x,
          zone.y,
          state.previewWeaponId,
          range,
          state.coins >= cost,
          elapsedTime
        );
      }
    }

    // 9. Defeat Burst Effects & Animated Fantasy Monsters
    for (const fx of state.defeatedEffects) {
      drawDefeatedMonsterEffect(ctx, fx);
    }

    const groundEnemies = state.enemies.filter((e) => !e.isFlying);
    const flyingEnemies = state.enemies.filter((e) => e.isFlying);

    // Subtle holographic aerial corridor lines when air threats are inbound
    if (flyingEnemies.length > 0) {
      ctx.save();
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.24)';
      ctx.lineWidth = 2;
      ctx.setLineDash([10, 12]);
      ctx.lineDashOffset = -elapsedTime * 36;
      const drawnRoutes = new Set<string>();
      for (const fe of flyingEnemies) {
        if (!fe.airWaypoints || fe.airWaypoints.length < 2) continue;
        const key = fe.airWaypoints.map((p) => `${p.x},${p.y}`).join('|');
        if (drawnRoutes.has(key)) continue;
        drawnRoutes.add(key);
        traceSmoothSpline(ctx, fe.airWaypoints);
        ctx.stroke();
      }
      ctx.setLineDash([]);
      ctx.restore();
    }

    for (const e of groundEnemies) {
      drawIllustratedMonster(ctx, e, e.instanceId === state.selectedEnemyId, elapsedTime);
    }
    for (const e of flyingEnemies) {
      drawIllustratedMonster(ctx, e, e.instanceId === state.selectedEnemyId, elapsedTime);
    }

    // 9b. Autonomous Defense Drones orbiting & engaging aerial threats
    drawActiveDefenseDrones(ctx, state.activeDrones, elapsedTime);

    // 10. Combat Beams, Shockwaves, Projectiles & Coin Drops
    this.drawBeams(ctx, state.beams);
    this.drawProjectiles(ctx, state.projectiles, elapsedTime);
    this.drawCoinDrops(ctx, state.coinDrops, elapsedTime);

    // 11. Particles & Damage Numbers
    for (const pt of state.particles) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, pt.life / pt.maxLife);
      ctx.fillStyle = pt.color;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    for (const ft of state.floatingTexts) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, ft.life / ft.maxLife);
      ctx.font = 'bold 15px "Noto Sans Sinhala", "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.strokeStyle = 'rgba(0,0,0,0.88)';
      ctx.lineWidth = 3.2;
      ctx.strokeText(ft.text, ft.x, ft.y);
      ctx.fillStyle = ft.color;
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.restore();
    }

    // 12. Sunlit Lighting & Atmospheric Motes
    this.drawAtmosphere(ctx, level, world, elapsedTime, minX, maxX, minY, maxY);

    ctx.restore();
  }

  private isNearPathOrImportant(level: LevelConfig, x: number, y: number, pad: number): boolean {
    for (const p of level.roadLayout.paths) {
      for (let i = 1; i < p.points.length; i++) {
        if (distToSegment({ x, y }, p.points[i - 1], p.points[i]) < p.width * 0.72 + pad) {
          return true;
        }
      }
    }
    for (const z of level.buildZones) {
      if (Math.hypot(x - z.x, y - z.y) < z.radius + pad + 18) return true;
    }
    if (Math.hypot(x - level.castle.x, y - level.castle.y) < 98) return true;
    if (level.spawns.some((s) => Math.hypot(x - s.x, y - s.y) < 82)) return true;
    if (level.id === 1 && Math.hypot(x - 155, y - 585) < 98) return true;
    return false;
  }

  private drawStaticTerrainAndPlateaus(
    ctx: CanvasRenderingContext2D,
    level: LevelConfig,
    world: WorldDefinition,
    pal: BiomePalette
  ) {
    const rng = seededRand(level.id * 97 + 3);

    // Sunlit / shaded valley patches
    for (let i = 0; i < 38; i++) {
      const x = -160 + rng() * 1600;
      const y = -120 + rng() * 960;
      const rx = 95 + rng() * 165;
      const ry = 52 + rng() * 94;
      ctx.fillStyle = i % 2 === 0 ? pal.grassC : pal.grassB;
      ctx.globalAlpha = 0.28;
      ctx.beginPath();
      ctx.ellipse(x, y, rx, ry, rng() * Math.PI, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // Stylized raised cliff / hill plateaus along edges & elevated flanks
    const ridgeAnchors: { x: number; y: number; rx: number; ry: number }[] = [
      { x: 160, y: 82, rx: 145, ry: 48 },
      { x: 620, y: 66, rx: 165, ry: 44 },
      { x: 1090, y: 88, rx: 140, ry: 50 },
      { x: 240, y: 660, rx: 150, ry: 46 },
      { x: 930, y: 655, rx: 155, ry: 48 },
    ];
    for (let idx = 0; idx < ridgeAnchors.length; idx++) {
      const r = ridgeAnchors[idx];
      const ox = r.x + (rng() - 0.5) * 70;
      const oy = r.y + (rng() - 0.5) * 30;
      if (this.isNearPathOrImportant(level, ox, oy, 36)) continue;

      ctx.save();
      ctx.translate(ox, oy);
      // Drop shadow
      ctx.fillStyle = 'rgba(0,0,0,0.28)';
      ctx.beginPath();
      ctx.ellipse(6, 18, r.rx + 8, r.ry + 6, 0, 0, Math.PI * 2);
      ctx.fill();
      // Rock cliff face
      ctx.fillStyle = pal.cliffFace;
      ctx.beginPath();
      ctx.ellipse(0, 10, r.rx, r.ry, 0, 0, Math.PI * 2);
      ctx.fill();
      // Top plateau rim
      ctx.fillStyle = pal.grassC;
      ctx.strokeStyle = pal.cliffRim;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(0, 0, r.rx * 0.96, r.ry * 0.86, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Subtle cliff strata grooves
      ctx.strokeStyle = 'rgba(0,0,0,0.28)';
      ctx.lineWidth = 1.6;
      for (let k = -2; k <= 2; k++) {
        ctx.beginPath();
        ctx.moveTo(k * r.rx * 0.28, r.ry * 0.7);
        ctx.lineTo(k * r.rx * 0.28 + 6, r.ry * 0.98);
        ctx.stroke();
      }
      ctx.restore();
    }

    // Subtle ground pebbles & biome wildflowers
    for (let i = 0; i < 150; i++) {
      const gx = -160 + rng() * 1600;
      const gy = -120 + rng() * 960;
      if (this.isNearPathOrImportant(level, gx, gy, 16)) continue;
      if (i % 5 === 0) {
        ctx.fillStyle = 'rgba(255,255,255,0.14)';
        ctx.beginPath();
        ctx.ellipse(gx, gy, 5 + rng() * 3, 2.8 + rng() * 1.8, rng() * Math.PI, 0, Math.PI * 2);
        ctx.fill();
      } else if (i % 6 === 0) {
        ctx.fillStyle =
          world.id === 'lava_lands' || world.id === 'dragons_realm'
            ? '#fb923c'
            : world.id === 'frozen_empire'
              ? '#e0f2fe'
              : i % 12 === 0
                ? '#fde047'
                : '#f472b6';
        ctx.beginPath();
        ctx.arc(gx, gy, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  private drawStaticRoads(
    ctx: CanvasRenderingContext2D,
    level: LevelConfig,
    world: WorldDefinition,
    pal: BiomePalette
  ) {
    for (const path of level.roadLayout.paths) {
      if (path.points.length < 2) continue;
      ctx.save();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      const roadW = Math.max(path.width + 8, Math.round(path.width * 1.15));

      // Ambient shadow trench
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.38)';
      ctx.lineWidth = roadW + 22;
      traceSmoothSpline(ctx, path.points);
      ctx.stroke();

      // Raised beveled stone/earthen curbstones
      ctx.strokeStyle = pal.roadEdge;
      ctx.lineWidth = roadW + 13;
      traceSmoothSpline(ctx, path.points);
      ctx.stroke();

      // Sunlit outer rim highlight
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.16)';
      ctx.lineWidth = roadW + 5;
      traceSmoothSpline(ctx, path.points);
      ctx.stroke();

      // Road bed
      ctx.strokeStyle = pal.roadFill;
      ctx.lineWidth = roadW;
      traceSmoothSpline(ctx, path.points);
      ctx.stroke();

      // Worn central track highlight
      ctx.strokeStyle = pal.roadInner;
      ctx.lineWidth = Math.max(20, roadW * 0.5);
      traceSmoothSpline(ctx, path.points);
      ctx.stroke();

      // Fitted paving stones / flagstones along the road
      const rng = seededRand(level.id * 31 + path.points.length * 7);
      const samples = sampleSplinePoints(path.points, 24);
      for (let i = 0; i < samples.length; i++) {
        const sp = samples[i];
        const perpX = -Math.sin(sp.angle);
        const perpY = Math.cos(sp.angle);

        // Curbstones left & right
        for (const side of [-1, 1]) {
          const cx = sp.x + perpX * (roadW * 0.49 * side);
          const cy = sp.y + perpY * (roadW * 0.49 * side);
          ctx.save();
          ctx.translate(cx, cy);
          ctx.rotate(sp.angle);
          ctx.fillStyle = side === -1 ? pal.roadStone : pal.roadEdge;
          ctx.strokeStyle = 'rgba(0,0,0,0.35)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.roundRect(-7, -3.5, 14, 7, 2.5);
          ctx.fill();
          ctx.stroke();
          ctx.restore();
        }

        // Interior flagstones / cobblestones
        const count = i % 2 === 0 ? 2 : 1;
        for (let k = 0; k < count; k++) {
          const lateral = (rng() - 0.5) * (roadW * 0.56);
          const sx = sp.x + perpX * lateral;
          const sy = sp.y + perpY * lateral;
          ctx.save();
          ctx.translate(sx, sy);
          ctx.rotate(sp.angle + (rng() - 0.5) * 0.35);
          ctx.fillStyle =
            world.id === 'ancient_temple' || world.id === 'desert_kingdom'
              ? 'rgba(255,255,255,0.16)'
              : k % 2 === 0
                ? 'rgba(255,255,255,0.14)'
                : 'rgba(0,0,0,0.15)';
          ctx.beginPath();
          if (world.id === 'ancient_temple' || world.id === 'sky_islands') {
            ctx.roundRect(-7, -4.5, 14, 9, 2);
          } else {
            ctx.ellipse(0, 0, 6.5 + rng() * 3, 3.8 + rng() * 1.8, 0, 0, Math.PI * 2);
          }
          ctx.fill();
          ctx.restore();
        }
      }
      ctx.restore();
    }
  }

  private drawStaticProps(
    ctx: CanvasRenderingContext2D,
    level: LevelConfig,
    world: WorldDefinition,
    pal: BiomePalette
  ) {
    // Rock clusters placed cleanly across the biome perimeter
    const rng = seededRand(level.id * 401 + 17);
    for (let i = 0; i < 26; i++) {
      const px = -120 + rng() * 1520;
      const py = -80 + rng() * 880;
      if (this.isNearPathOrImportant(level, px, py, 24)) continue;
      this.drawRockCluster(ctx, px, py, 0.85 + rng() * 0.55, pal);
    }
    void world;
  }

  private drawMeadowPond(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    pal: BiomePalette,
    t: number
  ) {
    ctx.save();
    ctx.translate(x, y);

    ctx.fillStyle = pal.roadEdge;
    ctx.beginPath();
    ctx.ellipse(0, 0, 92, 48, -0.15, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = pal.waterDeep;
    ctx.beginPath();
    ctx.ellipse(0, 0, 84, 42, -0.15, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = pal.water;
    ctx.beginPath();
    ctx.ellipse(-3, -2, 76, 36, -0.15, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = pal.waterGlow;
    ctx.globalAlpha = 0.5;
    ctx.lineWidth = 2.2;
    const ripple = (t * 8) % 14;
    ctx.beginPath();
    ctx.ellipse(-12, -4, 18 + ripple, 8 + ripple * 0.4, 0, 0, Math.PI * 2);
    ctx.stroke();

    ctx.globalAlpha = 1;
    ctx.fillStyle = '#15803d';
    ctx.beginPath();
    ctx.arc(24, 10, 9.5, 0.3, Math.PI * 1.9);
    ctx.lineTo(24, 10);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(-32, 12, 7.5, 0.5, Math.PI * 2.1);
    ctx.lineTo(-32, 12);
    ctx.fill();

    ctx.fillStyle = '#f472b6';
    ctx.beginPath();
    ctx.arc(25, 9, 3.3, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  private drawRiver(
    ctx: CanvasRenderingContext2D,
    riverPts: Vec2[],
    world: WorldDefinition,
    pal: BiomePalette,
    t: number
  ) {
    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Outer rocky / snowy / charred bank
    ctx.strokeStyle = pal.roadEdge;
    ctx.globalAlpha = 0.78;
    ctx.lineWidth = 56;
    traceSmoothSpline(ctx, riverPts);
    ctx.stroke();

    // Deep water / magma core
    ctx.globalAlpha = 0.94;
    ctx.strokeStyle = pal.waterDeep;
    ctx.lineWidth = 42;
    traceSmoothSpline(ctx, riverPts);
    ctx.stroke();

    // Bright surface channel
    ctx.strokeStyle = pal.water;
    ctx.lineWidth = 32;
    traceSmoothSpline(ctx, riverPts);
    ctx.stroke();

    // Animated currents / lava ribbons / frost shimmer
    ctx.strokeStyle = pal.waterGlow;
    ctx.globalAlpha = world.id === 'lava_lands' || world.id === 'dragons_realm' ? 0.72 : 0.48;
    ctx.lineWidth = 3.4;
    ctx.setLineDash([22, 24]);
    ctx.lineDashOffset = -t * 36;
    traceSmoothSpline(ctx, riverPts);
    ctx.stroke();
    ctx.restore();
  }

  private drawBridgesOverWater(
    ctx: CanvasRenderingContext2D,
    level: LevelConfig,
    world: WorldDefinition,
    riverPts: Vec2[] | null
  ) {
    if (!riverPts) return;
    for (const path of level.roadLayout.paths) {
      const roadW = Math.max(path.width + 8, Math.round(path.width * 1.15));
      for (let i = 1; i < path.points.length; i++) {
        for (let j = 1; j < riverPts.length; j++) {
          const hit = findSegmentIntersection(
            path.points[i - 1],
            path.points[i],
            riverPts[j - 1],
            riverPts[j]
          );
          if (hit) {
            const angle = Math.atan2(
              path.points[i].y - path.points[i - 1].y,
              path.points[i].x - path.points[i - 1].x
            );
            this.drawBridge(ctx, hit.x, hit.y, angle, roadW + 12, world.id);
          }
        }
      }
    }
  }

  private drawBridge(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    angle: number,
    width: number,
    worldId: WorldId
  ) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);

    const isStone =
      worldId === 'ancient_temple' ||
      worldId === 'sky_islands' ||
      worldId === 'desert_kingdom';
    const isIron =
      worldId === 'lava_lands' ||
      worldId === 'dragons_realm' ||
      worldId === 'cyber_wasteland' ||
      worldId === 'omega_final_war' ||
      worldId === 'toxic_mutation_zone';
    const isIce =
      worldId === 'frozen_empire' ||
      worldId === 'ocean_abyss' ||
      worldId === 'frozen_mecha_kingdom';
    const isVoid = worldId === 'void_dimension';

    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    ctx.fillRect(-38, -width * 0.52 + 6, 76, width * 1.04);

    ctx.fillStyle = isVoid
      ? '#4c1d95'
      : isIron
        ? '#334155'
        : isIce
          ? '#7dd3fc'
          : isStone
            ? '#cbd5e1'
            : '#854d0e';
    ctx.fillRect(-36, -width * 0.52, 72, width * 1.04);

    ctx.strokeStyle = isVoid
      ? '#c084fc'
      : isIron
        ? '#0f172a'
        : isIce
          ? '#0369a1'
          : isStone
            ? '#64748b'
            : '#451a03';
    ctx.lineWidth = 1.6;
    for (let px = -28; px <= 28; px += 9) {
      ctx.beginPath();
      ctx.moveTo(px, -width * 0.5);
      ctx.lineTo(px, width * 0.5);
      ctx.stroke();
    }

    // Parapet rails
    ctx.fillStyle = isVoid
      ? '#2e1065'
      : isIron
        ? '#1e293b'
        : isIce
          ? '#e0f2fe'
          : isStone
            ? '#94a3b8'
            : '#a16207';
    ctx.fillRect(-38, -width * 0.57, 76, 8);
    ctx.fillRect(-38, width * 0.57 - 8, 76, 8);

    // Corner bridge posts
    ctx.fillStyle = isVoid
      ? '#e879f9'
      : worldId === 'toxic_mutation_zone'
        ? '#a3e635'
        : worldId === 'cyber_wasteland'
          ? '#f59e0b'
          : isIron
            ? '#fb923c'
            : isIce
              ? '#38bdf8'
              : '#fbbf24';
    for (const cx of [-34, 0, 34]) {
      ctx.fillRect(cx - 4, -width * 0.6, 8, 9);
      ctx.fillRect(cx - 4, width * 0.6 - 9, 8, 9);
    }
    ctx.restore();
  }

  private drawEnvironmentProps(
    ctx: CanvasRenderingContext2D,
    level: LevelConfig,
    world: WorldDefinition,
    pal: BiomePalette,
    minX: number,
    maxX: number,
    minY: number,
    maxY: number,
    t: number
  ) {
    for (const dec of level.environment.decorations) {
      this.drawSingleDecor(ctx, dec, world, pal, t);
    }

    const rng = seededRand(level.id * 401 + 7);
    for (let i = 0; i < 64; i++) {
      const px = minX + rng() * (maxX - minX);
      const py = minY + rng() * (maxY - minY);
      if (this.isNearPathOrImportant(level, px, py, 24)) continue;

      const roll = rng();
      if (roll < 0.52) {
        this.drawBiomeFlora(ctx, px, py, 0.92 + rng() * 0.52, world, pal, t, i);
      } else if (roll < 0.82) {
        this.drawBushAndFlowers(ctx, px, py, pal, world.accentHex, rng());
      } else {
        this.drawRoadsideLantern(ctx, px, py, pal, t + i);
      }
    }
  }

  private drawBiomeFlora(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    scale: number,
    world: WorldDefinition,
    pal: BiomePalette,
    t: number,
    seedIdx: number
  ) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    const sway = Math.sin(t * 1.9 + x * 0.04) * 1.6;

    // Ground drop shadow
    ctx.fillStyle = 'rgba(0,0,0,0.34)';
    ctx.beginPath();
    ctx.ellipse(5, 13, 21, 8.5, 0, 0, Math.PI * 2);
    ctx.fill();

    if (world.id === 'mushroom_kingdom') {
      ctx.fillStyle = '#e2e8f0';
      ctx.strokeStyle = '#3b0764';
      ctx.lineWidth = 1.4;
      ctx.fillRect(-5, -4, 10, 18);
      ctx.strokeRect(-5, -4, 10, 18);
      ctx.fillStyle = seedIdx % 2 === 0 ? '#c026d3' : '#7c3aed';
      ctx.beginPath();
      ctx.arc(sway * 0.4, -7, 17, Math.PI, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#fdf4ff';
      ctx.beginPath();
      ctx.arc(-6, -13, 3, 0, Math.PI * 2);
      ctx.arc(6, -11, 2.4, 0, Math.PI * 2);
      ctx.fill();
    } else if (world.id === 'desert_kingdom') {
      // Palm tree / desert obelisk cactus
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 6.5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(0, 13);
      ctx.quadraticCurveTo(4, -6, sway * 0.8, -22);
      ctx.stroke();
      ctx.fillStyle = pal.treeMid;
      for (let a = 0; a < 5; a++) {
        const ang = -Math.PI * 0.9 + a * 0.45;
        ctx.save();
        ctx.translate(sway * 0.8, -22);
        ctx.rotate(ang);
        ctx.beginPath();
        ctx.ellipse(12, 0, 13, 4.2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    } else if (world.id === 'ocean_abyss') {
      // Glowing coral branches
      ctx.strokeStyle = seedIdx % 2 === 0 ? '#14b8a6' : '#f472b6';
      ctx.lineWidth = 5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(0, 12);
      ctx.lineTo(0, -14);
      ctx.moveTo(0, -2);
      ctx.lineTo(-10 + sway * 0.4, -15);
      ctx.moveTo(0, -5);
      ctx.lineTo(10 + sway * 0.4, -18);
      ctx.stroke();
      ctx.fillStyle = '#99f6e4';
      ctx.beginPath();
      ctx.arc(sway * 0.4, -16, 3, 0, Math.PI * 2);
      ctx.arc(10 + sway * 0.4, -19, 2.5, 0, Math.PI * 2);
      ctx.fill();
    } else if (world.id === 'lava_lands' || world.id === 'dragons_realm') {
      // Jagged volcanic basalt spire with magma vein
      ctx.fillStyle = '#292524';
      ctx.strokeStyle = '#0c0a09';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(-14, 12);
      ctx.lineTo(-7, -20);
      ctx.lineTo(0, -34);
      ctx.lineTo(9, -16);
      ctx.lineTo(14, 12);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = '#f97316';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-2, 6);
      ctx.lineTo(1, -12);
      ctx.lineTo(-1, -24);
      ctx.stroke();
    } else if (
      world.id === 'frozen_empire' ||
      world.id === 'sky_islands' ||
      world.id === 'frozen_mecha_kingdom'
    ) {
      // Layered frosted alpine / cryo pine
      ctx.fillStyle = '#475569';
      ctx.fillRect(-4, -2, 8, 15);
      for (let tier = 0; tier < 3; tier++) {
        const yOff = -8 - tier * 10;
        const w = 19 - tier * 3.5;
        ctx.fillStyle = tier === 2 ? pal.treeHighlight : pal.treeMid;
        ctx.beginPath();
        ctx.moveTo(sway * (0.4 + tier * 0.25), yOff - 16);
        ctx.lineTo(w, yOff);
        ctx.lineTo(-w, yOff);
        ctx.closePath();
        ctx.fill();
      }
    } else if (world.id === 'cyber_wasteland' || world.id === 'omega_final_war') {
      // Industrial cyber pylon / plasma conduit spire
      ctx.fillStyle = '#334155';
      ctx.strokeStyle = '#090d16';
      ctx.lineWidth = 1.5;
      ctx.fillRect(-6, -24, 12, 36);
      ctx.strokeRect(-6, -24, 12, 36);
      ctx.fillStyle = world.id === 'omega_final_war' ? '#fbbf24' : '#f59e0b';
      ctx.beginPath();
      ctx.arc(0, -26, 5.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-11, -10, 22, 5);
    } else if (world.id === 'toxic_mutation_zone') {
      // Mutated toxic spore pod
      ctx.fillStyle = '#14532d';
      ctx.fillRect(-5, -4, 10, 16);
      ctx.fillStyle = '#65a30d';
      ctx.beginPath();
      ctx.ellipse(0, -10, 12, 13, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#bef264';
      ctx.beginPath();
      ctx.arc(-4, -13, 3.2, 0, Math.PI * 2);
      ctx.arc(4, -8, 2.4, 0, Math.PI * 2);
      ctx.fill();
    } else if (world.id === 'void_dimension') {
      // Levitating void crystal spire
      const floatY = Math.sin(t * 2.5 + seedIdx) * 3;
      ctx.fillStyle = '#6b21a8';
      ctx.strokeStyle = '#e879f9';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(0, -28 + floatY);
      ctx.lineTo(10, -8 + floatY);
      ctx.lineTo(0, 6 + floatY);
      ctx.lineTo(-10, -8 + floatY);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else {
      // Multi-tiered lush fantasy oak / cypress canopy
      ctx.fillStyle = '#4a2c18';
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1.4;
      ctx.fillRect(-4.5, -3, 9, 16);
      ctx.strokeRect(-4.5, -3, 9, 16);

      ctx.fillStyle = pal.treeLeaf;
      ctx.beginPath();
      ctx.arc(-11 + sway * 0.4, -11, 14, 0, Math.PI * 2);
      ctx.arc(11 + sway * 0.4, -10, 13.5, 0, Math.PI * 2);
      ctx.arc(sway * 0.7, -22, 16.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = pal.treeMid;
      ctx.beginPath();
      ctx.arc(-5 + sway * 0.5, -18, 11, 0, Math.PI * 2);
      ctx.arc(7 + sway * 0.5, -15, 9, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = pal.treeHighlight;
      ctx.globalAlpha = 0.75;
      ctx.beginPath();
      ctx.arc(-3 + sway * 0.7, -26, 8.5, 0, Math.PI * 2);
      ctx.arc(6 + sway * 0.5, -17, 5.5, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  private drawBushAndFlowers(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    pal: BiomePalette,
    accentHex: string,
    seed: number
  ) {
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = 'rgba(0,0,0,0.24)';
    ctx.beginPath();
    ctx.ellipse(2, 6, 15, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = pal.treeLeaf;
    ctx.beginPath();
    ctx.arc(-6, 0, 8, 0, Math.PI * 2);
    ctx.arc(6, 1, 7.5, 0, Math.PI * 2);
    ctx.arc(0, -5, 8.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = pal.treeMid;
    ctx.beginPath();
    ctx.arc(-1, -4, 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = seed > 0.5 ? '#fde047' : accentHex;
    ctx.beginPath();
    ctx.arc(-5, -3, 2.2, 0, Math.PI * 2);
    ctx.arc(4, -2, 2.2, 0, Math.PI * 2);
    ctx.arc(0, -8, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  private drawRoadsideLantern(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    pal: BiomePalette,
    phase: number
  ) {
    ctx.save();
    ctx.translate(x, y);
    const pulse = 0.8 + Math.sin(phase * 5) * 0.2;
    ctx.fillStyle = 'rgba(0,0,0,0.28)';
    ctx.beginPath();
    ctx.ellipse(2, 9, 8, 3.5, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#475569';
    ctx.fillRect(-2.5, -14, 5, 22);
    ctx.fillStyle = pal.torchGlow;
    ctx.globalAlpha = 0.36 * pulse;
    ctx.beginPath();
    ctx.arc(0, -16, 11 * pulse, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.beginPath();
    ctx.arc(0, -16, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  private drawRockCluster(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    scale: number,
    pal: BiomePalette
  ) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    ctx.fillStyle = 'rgba(0,0,0,0.32)';
    ctx.beginPath();
    ctx.ellipse(3, 6, 16, 6.5, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = pal.cliffFace;
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(-14, 5);
    ctx.lineTo(-9, -9);
    ctx.lineTo(2, -13);
    ctx.lineTo(14, -2);
    ctx.lineTo(11, 7);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = pal.cliffRim;
    ctx.globalAlpha = 0.55;
    ctx.beginPath();
    ctx.moveTo(-9, -9);
    ctx.lineTo(2, -13);
    ctx.lineTo(4, -4);
    ctx.lineTo(-5, -2);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  private drawSingleDecor(
    ctx: CanvasRenderingContext2D,
    dec: DecorObject,
    world: WorldDefinition,
    pal: BiomePalette,
    t: number
  ) {
    ctx.save();
    ctx.translate(dec.x, dec.y);
    ctx.scale(dec.scale, dec.scale);

    switch (dec.kind) {
      case 'ruin_pillar': {
        ctx.fillStyle = 'rgba(0,0,0,0.32)';
        ctx.beginPath();
        ctx.ellipse(4, 11, 15, 6.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = pal.castleStone;
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 1.5;
        ctx.fillRect(-8, -19, 16, 28);
        ctx.strokeRect(-8, -19, 16, 28);
        ctx.fillStyle = pal.castleDark;
        ctx.fillRect(-10, -23, 20, 6);
        ctx.fillRect(-10, 5, 20, 6);
        ctx.fillStyle = world.accentHex;
        ctx.globalAlpha = 0.68;
        ctx.fillRect(-6, -11, 7, 5);
        break;
      }
      case 'dead_tree':
      case 'pine_tree':
      case 'snow_pine': {
        ctx.restore();
        this.drawBiomeFlora(ctx, dec.x, dec.y, dec.scale, world, pal, t, Math.round(dec.x));
        return;
      }
      case 'tombstone': {
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath();
        ctx.ellipse(2, 8, 11, 4.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#64748b';
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 1.3;
        ctx.beginPath();
        ctx.arc(0, -6, 9, Math.PI, 0);
        ctx.lineTo(9, 8);
        ctx.lineTo(-9, 8);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        break;
      }
      case 'lava_pool':
      case 'poison_pond': {
        const pulse = 0.86 + Math.sin(t * 3.2 + dec.x) * 0.14;
        ctx.fillStyle = dec.kind === 'lava_pool' ? '#ea580c' : '#4ade80';
        ctx.globalAlpha = 0.65;
        ctx.beginPath();
        ctx.ellipse(0, 0, 27 * pulse, 15 * pulse, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = dec.kind === 'lava_pool' ? '#fde047' : '#bef264';
        ctx.beginPath();
        ctx.ellipse(-3, -2, 12, 6, 0, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
      case 'ice_crystal':
      case 'dragon_spire':
      case 'temple_obelisk': {
        ctx.fillStyle = world.accentHex;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(0, -28);
        ctx.lineTo(12, 4);
        ctx.lineTo(0, 11);
        ctx.lineTo(-12, 4);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        break;
      }
      case 'giant_mushroom': {
        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(-5, -3, 10, 17);
        ctx.fillStyle = '#c026d3';
        ctx.beginPath();
        ctx.arc(0, -5, 16, Math.PI, 0);
        ctx.fill();
        ctx.fillStyle = '#fdf4ff';
        ctx.beginPath();
        ctx.arc(-5, -10, 3, 0, Math.PI * 2);
        ctx.arc(5, -8, 2.3, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
      case 'pyramid': {
        ctx.fillStyle = '#b45309';
        ctx.beginPath();
        ctx.moveTo(0, -28);
        ctx.lineTo(26, 14);
        ctx.lineTo(-26, 14);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.moveTo(0, -28);
        ctx.lineTo(26, 14);
        ctx.lineTo(2, 14);
        ctx.closePath();
        ctx.fill();
        break;
      }
      case 'banner': {
        const wave = Math.sin(t * 5 + dec.x) * 3;
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, 12);
        ctx.lineTo(0, -26);
        ctx.stroke();
        ctx.fillStyle = pal.bannerColor;
        ctx.beginPath();
        ctx.moveTo(0, -26);
        ctx.quadraticCurveTo(10, -21 + wave, 19, -17 + wave);
        ctx.lineTo(0, -10);
        ctx.closePath();
        ctx.fill();
        break;
      }
      case 'wrecked_mech': {
        ctx.fillStyle = '#334155';
        ctx.strokeStyle = '#090d16';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.ellipse(0, 2, 18, 11, -0.25, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#9a3412';
        ctx.fillRect(-12, -10, 14, 10);
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(6, -3, 3.5, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
      case 'cyber_pylon':
      case 'plasma_beacon': {
        const color = dec.kind === 'plasma_beacon' ? '#fbbf24' : '#22d3ee';
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(-7, -20, 14, 30);
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(0, -23, 6 + Math.sin(t * 4 + dec.x) * 1.2, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
      case 'toxic_vat': {
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(-12, -14, 24, 24);
        ctx.fillStyle = '#84cc16';
        ctx.fillRect(-9, -11, 18, 14);
        ctx.fillStyle = '#bef264';
        ctx.beginPath();
        ctx.arc(-3, -6, 3, 0, Math.PI * 2);
        ctx.arc(4, -3, 2, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
      case 'mutant_pod': {
        ctx.fillStyle = '#14532d';
        ctx.beginPath();
        ctx.ellipse(0, 0, 14, 18, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#a3e635';
        ctx.beginPath();
        ctx.ellipse(0, -2, 6, 9, 0, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
      case 'frozen_turret':
      case 'glacier_spire': {
        ctx.fillStyle = '#bae6fd';
        ctx.strokeStyle = '#0284c7';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(0, -28);
        ctx.lineTo(13, 6);
        ctx.lineTo(-13, 6);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        break;
      }
      case 'void_obelisk':
      case 'rift_gate': {
        ctx.fillStyle = '#3b0764';
        ctx.strokeStyle = '#e879f9';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.ellipse(0, -6, 12, 20, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#f0abfc';
        ctx.beginPath();
        ctx.ellipse(0, -6, 5, 11, 0, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
      case 'omega_citadel': {
        ctx.fillStyle = '#27272a';
        ctx.fillRect(-14, -18, 28, 28);
        ctx.fillStyle = '#be123c';
        ctx.beginPath();
        ctx.moveTo(-16, -18);
        ctx.lineTo(0, -34);
        ctx.lineTo(16, -18);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(-4, -12, 8, 12);
        break;
      }
      default: {
        ctx.restore();
        this.drawRockCluster(ctx, dec.x, dec.y, dec.scale, pal);
        return;
      }
    }
    ctx.restore();
  }

  private drawBuildZones(ctx: CanvasRenderingContext2D, state: EngineRenderState, pal: BiomePalette) {
    const { level, towers, selectedZoneId, pendingWeaponToBuild, elapsedTime } = state;
    for (const zone of level.buildZones) {
      if (towers.some((t) => t.zoneId === zone.id)) continue;
      const isSelected = selectedZoneId === zone.id;
      const invitePulse =
        pendingWeaponToBuild || !selectedZoneId ? 0.5 + Math.sin(elapsedTime * 4.5) * 0.5 : 0;

      ctx.save();
      ctx.translate(zone.x, zone.y);

      ctx.fillStyle = 'rgba(0,0,0,0.42)';
      ctx.beginPath();
      ctx.ellipse(0, 6, 31, 23, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = isSelected ? '#475569' : pal.padBase;
      ctx.strokeStyle = isSelected
        ? '#fbbf24'
        : pendingWeaponToBuild
          ? `rgba(251, 191, 36, ${0.55 + invitePulse * 0.45})`
          : pal.padRim;
      ctx.lineWidth = isSelected || pendingWeaponToBuild ? 2.8 : 2;
      ctx.beginPath();
      for (let i = 0; i < 8; i++) {
        const a = (Math.PI * 2 * i) / 8 + Math.PI / 8;
        const px = Math.cos(a) * 27;
        const py = Math.sin(a) * 21.5;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.ellipse(0, 0, 16, 13, 0, 0, Math.PI * 2);
      ctx.fill();

      // Hammer build emblem
      ctx.strokeStyle = isSelected || pendingWeaponToBuild ? '#fbbf24' : '#cbd5e1';
      ctx.lineWidth = 2.1;
      ctx.beginPath();
      ctx.moveTo(-6, 5);
      ctx.lineTo(6, -5);
      ctx.stroke();
      ctx.fillStyle = isSelected || pendingWeaponToBuild ? '#fbbf24' : '#e2e8f0';
      ctx.save();
      ctx.translate(4, -4);
      ctx.rotate(-0.7);
      ctx.fillRect(-4.2, -3, 8.4, 5.2);
      ctx.restore();

      ctx.restore();
    }
  }

  private drawSpawnGate(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    world: WorldDefinition,
    pal: BiomePalette,
    t: number
  ) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(1.18, 1.18);

    ctx.fillStyle = 'rgba(0,0,0,0.46)';
    ctx.beginPath();
    ctx.ellipse(0, 18, 37, 14, 0, 0, Math.PI * 2);
    ctx.fill();

    // Dark swirling portal inside biome archway
    const glow = 0.76 + Math.sin(t * 4.2) * 0.24;
    const riftGrad = ctx.createRadialGradient(0, -2, 2, 0, -2, 23);
    riftGrad.addColorStop(0, world.accentHex);
    riftGrad.addColorStop(0.55, '#7f1d1d');
    riftGrad.addColorStop(1, '#090d16');
    ctx.fillStyle = riftGrad;
    ctx.beginPath();
    ctx.arc(0, 0, 21, Math.PI, 0);
    ctx.lineTo(21, 16);
    ctx.lineTo(-21, 16);
    ctx.closePath();
    ctx.fill();

    // Pillars & archway
    ctx.strokeStyle = pal.padRim;
    ctx.fillStyle = pal.castleDark;
    ctx.lineWidth = 2.2;
    ctx.fillRect(-29, -16, 11, 32);
    ctx.strokeRect(-29, -16, 11, 32);
    ctx.fillRect(18, -16, 11, 32);
    ctx.strokeRect(18, -16, 11, 32);

    ctx.beginPath();
    ctx.arc(0, -10, 24, Math.PI, 0);
    ctx.lineWidth = 9;
    ctx.strokeStyle = pal.castleStone;
    ctx.stroke();

    // Keystone crest
    ctx.fillStyle = world.accentHex;
    ctx.beginPath();
    ctx.moveTo(0, -40);
    ctx.lineTo(6, -32);
    ctx.lineTo(0, -26);
    ctx.lineTo(-6, -32);
    ctx.closePath();
    ctx.fill();

    // Twin torches
    for (const tx of [-23.5, 23.5]) {
      ctx.fillStyle = pal.torchGlow;
      ctx.globalAlpha = 0.56 * glow;
      ctx.beginPath();
      ctx.arc(tx, -21, 9 * glow, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(tx, -21, 3.8, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  private drawCastle(
    ctx: CanvasRenderingContext2D,
    state: EngineRenderState,
    world: WorldDefinition,
    pal: BiomePalette,
    t: number
  ) {
    const { x, y } = state.level.castle;
    const hitFlash = state.castleDamageFlash > 0;
    const hpRatio = Math.max(0, state.castleHp / state.maxCastleHp);

    ctx.save();
    ctx.translate(x, y);
    ctx.scale(1.24, 1.24);

    // Courtyard terrace
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.beginPath();
    ctx.ellipse(0, 29, 54, 20, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = pal.castleDark;
    ctx.beginPath();
    ctx.ellipse(0, 23, 45, 16, 0, 0, Math.PI * 2);
    ctx.fill();

    // Main Citadel Keep Wall
    ctx.fillStyle = hitFlash ? '#fca5a5' : pal.castleStone;
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2.4;
    ctx.fillRect(-33, -29, 66, 49);
    ctx.strokeRect(-33, -29, 66, 49);

    // Central high spire behind main keep
    ctx.fillStyle = hitFlash ? '#fecaca' : pal.castleDark;
    ctx.fillRect(-15, -52, 30, 24);
    ctx.strokeRect(-15, -52, 30, 24);
    ctx.fillStyle = pal.castleRoof;
    ctx.beginPath();
    ctx.moveTo(-19, -52);
    ctx.lineTo(0, -70);
    ctx.lineTo(19, -52);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Battlements
    ctx.fillStyle = hitFlash ? '#fecaca' : pal.castleStone;
    for (let bx = -28; bx <= 18; bx += 15) {
      ctx.fillRect(bx, -38, 10, 9);
      ctx.strokeRect(bx, -38, 10, 9);
    }

    // Twin flanking turrets with biome roofs & banners
    for (const tx of [-39, 23]) {
      ctx.fillStyle = hitFlash ? '#fca5a5' : pal.castleDark;
      ctx.fillRect(tx, -36, 16, 56);
      ctx.strokeRect(tx, -36, 16, 56);

      ctx.fillStyle = pal.castleRoof;
      ctx.beginPath();
      ctx.moveTo(tx - 4, -36);
      ctx.lineTo(tx + 8, -57);
      ctx.lineTo(tx + 20, -36);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      const wave = Math.sin(t * 6 + tx) * 3.5;
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(tx + 8, -57);
      ctx.lineTo(tx + 8, -73);
      ctx.stroke();

      ctx.fillStyle = pal.bannerColor;
      ctx.beginPath();
      ctx.moveTo(tx + 8, -73);
      ctx.quadraticCurveTo(tx + 18, -70 + wave, tx + 26, -66 + wave);
      ctx.lineTo(tx + 8, -61);
      ctx.closePath();
      ctx.fill();
    }

    // Biome crest gem on central keep
    ctx.fillStyle = world.accentHex;
    ctx.beginPath();
    ctx.moveTo(0, -47);
    ctx.lineTo(6, -40);
    ctx.lineTo(0, -33);
    ctx.lineTo(-6, -40);
    ctx.closePath();
    ctx.fill();

    // Arched oak & iron gate
    ctx.fillStyle = '#451a03';
    ctx.beginPath();
    ctx.arc(0, 4, 13.5, Math.PI, 0);
    ctx.lineTo(13.5, 20);
    ctx.lineTo(-13.5, 20);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Lit windows
    ctx.fillStyle = pal.torchGlow;
    ctx.fillRect(-15, -18, 6, 10);
    ctx.fillRect(9, -18, 6, 10);

    // Floating Castle Health Bar
    ctx.fillStyle = 'rgba(15, 23, 42, 0.94)';
    ctx.fillRect(-39, -87, 78, 11.5);
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1.3;
    ctx.strokeRect(-39, -87, 78, 11.5);
    ctx.fillStyle = hpRatio > 0.5 ? '#22c55e' : hpRatio > 0.25 ? '#eab308' : '#ef4444';
    ctx.fillRect(-37.5, -85.5, 75 * hpRatio, 8.5);

    if (state.status === 'defeat') {
      ctx.fillStyle = 'rgba(30, 41, 59, 0.65)';
      for (let i = 0; i < 4; i++) {
        const sy = -24 - ((t * 22 + i * 15) % 52);
        ctx.beginPath();
        ctx.arc(-12 + i * 9, sy, 10 + i * 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();
  }

  private drawSpiderNests(
    ctx: CanvasRenderingContext2D,
    state: EngineRenderState,
    t: number
  ) {
    for (const nest of state.spiderNests) {
      ctx.save();
      ctx.translate(nest.x, nest.y);

      const isSelected = state.selectedNestId === nest.id;
      const isFocused = state.focusedNestId === nest.id;
      const hpRatio = Math.max(0, Math.min(1, nest.hp / Math.max(1, nest.maxHp)));

      if (nest.destroyed) {
        // Ruined Silk Crater
        ctx.fillStyle = 'rgba(15, 23, 42, 0.72)';
        ctx.beginPath();
        ctx.ellipse(0, 4, 29, 17, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Broken silk & chitin stubs
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.45)';
        ctx.lineWidth = 1.6;
        for (let i = 0; i < 6; i++) {
          const a = (Math.PI * 2 * i) / 6 + 0.3;
          ctx.beginPath();
          ctx.moveTo(Math.cos(a) * 10, Math.sin(a) * 6);
          ctx.lineTo(Math.cos(a) * 28, Math.sin(a) * 16);
          ctx.stroke();
        }

        // Satisfying Collapse & Shatter Destruction Animation
        if (nest.destroyAnimTimer > 0) {
          const progress = 1 - Math.min(1, nest.destroyAnimTimer / 1.15);
          const alpha = Math.max(0, 1 - progress);
          const ringR = 16 + progress * 58;

          ctx.globalAlpha = alpha;
          ctx.strokeStyle = '#a3e635';
          ctx.lineWidth = 4 * (1 - progress * 0.6);
          ctx.beginPath();
          ctx.arc(0, 0, ringR, 0, Math.PI * 2);
          ctx.stroke();

          ctx.strokeStyle = '#fbbf24';
          ctx.lineWidth = 2.4;
          ctx.beginPath();
          ctx.arc(0, 0, ringR * 0.68, 0, Math.PI * 2);
          ctx.stroke();

          // Flying chitin shards & severed web wisps
          for (let s = 0; s < 10; s++) {
            const ang = (Math.PI * 2 * s) / 10 + 0.2;
            const dist = 10 + progress * 48;
            const sx = Math.cos(ang) * dist;
            const sy = Math.sin(ang) * dist - progress * 14;
            ctx.fillStyle = s % 2 === 0 ? '#a3e635' : '#f43f5e';
            ctx.beginPath();
            ctx.arc(sx, sy, Math.max(1.5, 4.5 * (1 - progress)), 0, Math.PI * 2);
            ctx.fill();
          }
        }
        ctx.restore();
        continue;
      }

      const pulse = 1 + Math.sin(t * 4.5 + nest.x * 0.05) * 0.045;
      const isHit = nest.hitFlash > 0;

      // Ground drop shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.52)';
      ctx.beginPath();
      ctx.ellipse(0, 10, 34, 18, 0, 0, Math.PI * 2);
      ctx.fill();

      // Anchor Web Strands radiating onto road
      ctx.strokeStyle = isHit ? 'rgba(254, 202, 202, 0.85)' : 'rgba(226, 232, 240, 0.45)';
      ctx.lineWidth = 1.8;
      for (let i = 0; i < 8; i++) {
        const a = (Math.PI * 2 * i) / 8;
        ctx.beginPath();
        ctx.moveTo(Math.cos(a) * 14, Math.sin(a) * 9);
        ctx.lineTo(Math.cos(a) * 35, Math.sin(a) * 21);
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.ellipse(0, 2, 29, 17, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Focus / Selected Reticle
      if (isFocused || isSelected) {
        ctx.save();
        ctx.strokeStyle = isFocused ? '#f43f5e' : '#38bdf8';
        ctx.lineWidth = 2.4;
        ctx.setLineDash([7, 5]);
        ctx.lineDashOffset = -t * 28;
        ctx.beginPath();
        ctx.arc(0, 0, 35, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();
      }

      // Main Cyber-Organic Spider Nest Dome
      ctx.save();
      ctx.scale(pulse, pulse);

      const domeGrad = ctx.createRadialGradient(-4, -10, 4, 0, -2, 28);
      if (isHit) {
        domeGrad.addColorStop(0, '#fecaca');
        domeGrad.addColorStop(0.55, '#ef4444');
        domeGrad.addColorStop(1, '#450a0a');
      } else {
        domeGrad.addColorStop(0, '#581c87');
        domeGrad.addColorStop(0.55, '#3b0764');
        domeGrad.addColorStop(1, '#0f172a');
      }

      ctx.fillStyle = domeGrad;
      ctx.strokeStyle = isHit ? '#ffffff' : '#a855f7';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.ellipse(0, 2, 25, 16, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Armored chitin ribs
      ctx.strokeStyle = isHit ? '#fee2e2' : '#1e1b4b';
      ctx.lineWidth = 3;
      for (const rx of [-12, 0, 12]) {
        ctx.beginPath();
        ctx.moveTo(rx * 0.7, -11);
        ctx.quadraticCurveTo(rx * 1.2, -1, rx * 0.9, 12);
        ctx.stroke();
      }

      // Glowing Venom Brood Core & Egg Sacs
      const glow = 0.72 + Math.sin(t * 5.8) * 0.28;
      ctx.fillStyle = isHit ? '#fef08a' : `rgba(163, 230, 53, ${glow})`;
      for (const [ex, ey, er] of [
        [-9, -3, 4.4],
        [8, -2, 4.1],
        [0, -9, 5.2],
      ]) {
        ctx.beginPath();
        ctx.arc(ex, ey, er, 0, Math.PI * 2);
        ctx.fill();
      }

      // Visible Structural Damage Cracks as HP drops
      if (hpRatio < 0.72) {
        ctx.strokeStyle = '#fde047';
        ctx.lineWidth = 1.9;
        ctx.beginPath();
        ctx.moveTo(-14, -4);
        ctx.lineTo(-5, 2);
        ctx.lineTo(-9, 10);
        ctx.stroke();
      }
      if (hpRatio < 0.38) {
        ctx.strokeStyle = '#fb7185';
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(13, -6);
        ctx.lineTo(4, 1);
        ctx.lineTo(10, 11);
        ctx.moveTo(-2, -12);
        ctx.lineTo(3, 5);
        ctx.stroke();
      }

      ctx.restore();

      // Visible Health Bar Above the Spider Nest
      const barW = 58;
      const barH = 7;
      const barY = -32;
      ctx.fillStyle = 'rgba(2, 6, 23, 0.92)';
      ctx.fillRect(-barW * 0.5 - 1, barY - 1, barW + 2, barH + 2);
      ctx.strokeStyle = isFocused ? '#f43f5e' : '#e2e8f0';
      ctx.lineWidth = 1.1;
      ctx.strokeRect(-barW * 0.5 - 1, barY - 1, barW + 2, barH + 2);
      ctx.fillStyle = hpRatio > 0.55 ? '#84cc16' : hpRatio > 0.28 ? '#f59e0b' : '#ef4444';
      ctx.fillRect(-barW * 0.5, barY, barW * hpRatio, barH);

      // Compact HP numeric readout above bar
      ctx.font = 'bold 10px "Plus Jakarta Sans", monospace';
      ctx.textAlign = 'center';
      ctx.strokeStyle = 'rgba(0,0,0,0.9)';
      ctx.lineWidth = 2.6;
      const hpText = `${Math.ceil(nest.hp)}/${nest.maxHp}`;
      ctx.strokeText(hpText, 0, barY - 4);
      ctx.fillStyle = '#f8fafc';
      ctx.fillText(hpText, 0, barY - 4);

      ctx.restore();
    }
  }

  private drawBeams(ctx: CanvasRenderingContext2D, beams: RenderBeam[]) {
    for (const b of beams) {
      const alpha = Math.max(0, b.life / b.maxLife);
      ctx.save();
      ctx.globalAlpha = alpha;
      if (b.kind === 'emp_ring') {
        const progress = 1 - alpha;
        const r = (b.radius ?? 140) * (0.18 + progress * 0.82);
        ctx.strokeStyle = b.color;
        ctx.lineWidth = b.width + 1.5;
        ctx.setLineDash([14, 10]);
        ctx.beginPath();
        ctx.arc(b.points[0].x, b.points[0].y, r, progress * 2.5, progress * 2.5 + Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = b.color;
        ctx.globalAlpha = alpha * 0.14;
        ctx.fill();
      } else if (b.kind === 'shockwave') {
        const progress = 1 - alpha;
        const r = (b.radius ?? 95) * (0.22 + progress * 0.78);
        // Outer golden/cyan energy wave
        ctx.strokeStyle = b.color;
        ctx.lineWidth = b.width + 2.2;
        ctx.beginPath();
        ctx.arc(b.points[0].x, b.points[0].y, r, 0, Math.PI * 2);
        ctx.stroke();

        // Secondary orbital drone pulse ticks
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2.2;
        ctx.setLineDash([12, 16]);
        ctx.beginPath();
        ctx.arc(b.points[0].x, b.points[0].y, r * 0.88, progress * 3, progress * 3 + Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.arc(b.points[0].x, b.points[0].y, r * 0.72, 0, Math.PI * 2);
        ctx.stroke();
      } else if (b.points.length >= 2) {
        const isLightning = b.style === 'lightning' || b.points.length > 2;
        if (isLightning) {
          // Jagged Tesla Arc with Electric Glow & Fork Nodes
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';

          const drawJagged = (width: number, stroke: string) => {
            ctx.strokeStyle = stroke;
            ctx.lineWidth = width;
            ctx.beginPath();
            ctx.moveTo(b.points[0].x, b.points[0].y);
            for (let i = 1; i < b.points.length; i++) {
              const p0 = b.points[i - 1];
              const p1 = b.points[i];
              const dx = p1.x - p0.x;
              const dy = p1.y - p0.y;
              const len = Math.max(1, Math.hypot(dx, dy));
              const nx = -dy / len;
              const ny = dx / len;
              for (let seg = 1; seg <= 3; seg++) {
                const frac = seg / 4;
                const jitter = Math.sin(b.life * 140 + i * 7 + seg * 5) * 11;
                ctx.lineTo(p0.x + dx * frac + nx * jitter, p0.y + dy * frac + ny * jitter);
              }
              ctx.lineTo(p1.x, p1.y);
            }
            ctx.stroke();
          };

          drawJagged(b.width + 5, 'rgba(56, 189, 248, 0.48)');
          drawJagged(b.width + 1.5, b.color);
          drawJagged(Math.max(1.5, b.width * 0.55), '#ffffff');

          // Spark bursts at hit targets
          for (let i = 1; i < b.points.length; i++) {
            ctx.fillStyle = '#e0f2fe';
            ctx.beginPath();
            ctx.arc(b.points[i].x, b.points[i].y, 5.5 * alpha + 2, 0, Math.PI * 2);
            ctx.fill();
          }
        } else {
          // High-Energy Prism Laser Beam or Drone Interceptor Laser + Flares
          const p0 = b.points[0];
          const p1 = b.points[b.points.length - 1];
          ctx.lineCap = 'round';
          const haloCol =
            b.style === 'drone_laser' ? 'rgba(52, 211, 153, 0.36)' : 'rgba(232, 121, 249, 0.35)';

          ctx.strokeStyle = haloCol;
          ctx.lineWidth = b.width + 7;
          ctx.beginPath();
          ctx.moveTo(p0.x, p0.y);
          ctx.lineTo(p1.x, p1.y);
          ctx.stroke();

          ctx.strokeStyle = b.color;
          ctx.lineWidth = b.width + 2.2;
          ctx.stroke();

          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = Math.max(1.6, b.width * 0.62);
          ctx.stroke();

          // Emitter & Target Scorch Flares
          for (const pt of [p0, p1]) {
            ctx.fillStyle = b.color;
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, b.width + 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, b.width * 0.72 + 1.4, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
      ctx.restore();
    }
  }

  private drawProjectiles(
    ctx: CanvasRenderingContext2D,
    projectiles: RenderProjectile[],
    t: number
  ) {
    for (const p of projectiles) {
      const angle = Math.atan2(p.vy, p.vx);
      const tier = p.upgradeTier ?? 0;
      const scale = 1 + Math.min(0.45, tier * 0.06);

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(angle);
      ctx.scale(scale, scale);

      if (p.projectileType === 'arrow') {
        // Plasma Gun Turret: glowing high-velocity plasma energy bolt
        ctx.fillStyle = tier >= 4 ? 'rgba(251, 191, 36, 0.35)' : 'rgba(56, 189, 248, 0.38)';
        ctx.beginPath();
        ctx.ellipse(-2, 0, 15, 5.6, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = tier >= 4 ? '#fbbf24' : '#38bdf8';
        ctx.beginPath();
        ctx.moveTo(14, 0);
        ctx.quadraticCurveTo(2, -4.5, -13, 0);
        ctx.quadraticCurveTo(2, 4.5, 14, 0);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.ellipse(3, 0, 7.5, 2, 0, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.projectileType === 'cannonball') {
        // Heavy Cannon: Armored High-Explosive Artillery Shell with Ember Wake
        ctx.fillStyle = 'rgba(251, 146, 60, 0.45)';
        ctx.beginPath();
        ctx.ellipse(-9, 0, 10, 5.8, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#334155';
        ctx.strokeStyle = '#090d16';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(11, 0);
        ctx.quadraticCurveTo(6, -6.5, -6, -6);
        ctx.lineTo(-8, 6);
        ctx.quadraticCurveTo(6, 6.5, 11, 0);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Copper/gold warhead band
        ctx.fillStyle = tier >= 3 ? '#fde047' : '#f59e0b';
        ctx.fillRect(-1, -5.2, 4, 10.4);
        ctx.fillStyle = '#fde047';
        ctx.beginPath();
        ctx.arc(-9.5, 0, 3.6, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.projectileType === 'fireball') {
        // Missile Defense Tower: Guided Tactical Rocket + Jet Plume + Fins
        ctx.fillStyle = 'rgba(251, 146, 60, 0.52)';
        ctx.beginPath();
        ctx.ellipse(-13, 0, 9, 4.8, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.ellipse(-10, 0, 5, 2.5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Stabilizer fins
        ctx.fillStyle = '#991b1b';
        ctx.beginPath();
        ctx.moveTo(-8, -3.5);
        ctx.lineTo(-12, -8);
        ctx.lineTo(-4, -3.5);
        ctx.moveTo(-8, 3.5);
        ctx.lineTo(-12, 8);
        ctx.lineTo(-4, 3.5);
        ctx.fill();

        // Sleek missile fuselage & warhead tip
        ctx.fillStyle = '#e2e8f0';
        ctx.strokeStyle = '#090d16';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.roundRect(-8, -3.8, 15, 7.6, 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.moveTo(14, 0);
        ctx.lineTo(6, -4);
        ctx.lineTo(6, 4);
        ctx.closePath();
        ctx.fill();
      } else if (p.projectileType === 'frost_bolt') {
        // Frost Cannon: Cryo Energy Shell
        ctx.fillStyle = 'rgba(125, 211, 252, 0.36)';
        ctx.beginPath();
        ctx.arc(0, 0, 9.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.moveTo(13, 0);
        ctx.lineTo(-3, -6);
        ctx.lineTo(-11, 0);
        ctx.lineTo(-3, 6);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.3;
        ctx.stroke();
      } else if (p.projectileType === 'aa_bullet') {
        // Sky Hunter AA: Rapid glowing cyan tracer slug
        ctx.fillStyle = 'rgba(34, 211, 238, 0.42)';
        ctx.beginPath();
        ctx.ellipse(-3, 0, 14, 4.2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#22d3ee';
        ctx.beginPath();
        ctx.ellipse(2, 0, 9.5, 2.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.ellipse(4, 0, 4.8, 1.3, 0, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.projectileType === 'aa_missile') {
        // Missile Platform AA: Guided hyper-velocity SAM rocket + plume
        ctx.fillStyle = 'rgba(249, 115, 22, 0.56)';
        ctx.beginPath();
        ctx.ellipse(-14, 0, 10, 4.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#f97316';
        ctx.beginPath();
        ctx.moveTo(-7, -3);
        ctx.lineTo(-12, -8);
        ctx.lineTo(-3, -3);
        ctx.moveTo(-7, 3);
        ctx.lineTo(-12, 8);
        ctx.lineTo(-3, 3);
        ctx.fill();
        ctx.fillStyle = '#f8fafc';
        ctx.strokeStyle = '#090d16';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.roundRect(-8, -3.5, 15, 7, 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.moveTo(15, 0);
        ctx.lineTo(6, -3.8);
        ctx.lineTo(6, 3.8);
        ctx.closePath();
        ctx.fill();
      } else if (p.projectileType === 'storm_sphere') {
        // Storm Cannon AA: High-voltage plasma storm orb
        ctx.rotate(t * 11);
        ctx.fillStyle = 'rgba(56, 189, 248, 0.42)';
        ctx.beginPath();
        ctx.arc(0, 0, 11.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#0284c7';
        ctx.strokeStyle = '#e0f2fe';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.arc(0, 0, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(0, 0, 3, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.projectileType === 'plasma_aa') {
        // Plasma Air Defense: Triple rose-violet plasma salvo bolts
        for (const oy of [-4.2, 0, 4.2]) {
          ctx.fillStyle = 'rgba(244, 63, 94, 0.45)';
          ctx.beginPath();
          ctx.ellipse(0, oy, 11, 3.4, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#fb7185';
          ctx.beginPath();
          ctx.ellipse(2, oy, 7.5, 2, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.ellipse(4, oy, 3.6, 1, 0, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (p.projectileType === 'titan_plasma') {
        // Titan Plasma Cannon: Heavy high-energy plasma blast orb with ionized wake
        ctx.fillStyle = 'rgba(56, 189, 248, 0.38)';
        ctx.beginPath();
        ctx.ellipse(-8, 0, 18, 8.5, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.rotate(t * 14);
        ctx.fillStyle = 'rgba(103, 232, 249, 0.42)';
        ctx.beginPath();
        ctx.arc(0, 0, 14, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#7dd3fc';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(0, 0, 12, 5.5, 0.5, 0, Math.PI * 2);
        ctx.ellipse(0, 0, 12, 5.5, -0.5, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = '#0284c7';
        ctx.strokeStyle = '#e0f2fe';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.arc(0, 0, 8.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(0, 0, 4.2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Shadow Energy Tower (poison_vial): Swirling Dark-Purple & Toxic-Emerald Arcane Orb
        ctx.rotate(t * 9);
        ctx.fillStyle = 'rgba(168, 85, 247, 0.38)';
        ctx.beginPath();
        ctx.arc(0, 0, 10.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#9333ea';
        ctx.strokeStyle = '#d8b4fe';
        ctx.lineWidth = 1.3;
        ctx.beginPath();
        ctx.arc(0, 0, 6.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#a3e635';
        ctx.beginPath();
        ctx.arc(3.5, 0, 2.2, 0, Math.PI * 2);
        ctx.arc(-3.5, 0, 2.2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  }

  private drawCoinDrops(ctx: CanvasRenderingContext2D, coins: RenderCoinDrop[], t: number) {
    for (const c of coins) {
      const progress = 1 - c.life / c.maxLife;
      const alpha = progress < 0.7 ? 1 : Math.max(0, (1 - progress) / 0.3);
      const spinWidth = 0.35 + Math.abs(Math.cos(t * 10 + c.x)) * 0.65;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(c.x, c.y);
      ctx.fillStyle = '#fbbf24';
      ctx.strokeStyle = '#92400e';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.ellipse(0, 0, 7.8 * spinWidth, 7.8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }
  }

  private drawAtmosphere(
    ctx: CanvasRenderingContext2D,
    level: LevelConfig,
    world: WorldDefinition,
    t: number,
    minX: number,
    maxX: number,
    minY: number,
    maxY: number
  ) {
    ctx.save();
    if (world.id === 'forgotten_kingdom' || world.id === 'desert_kingdom' || world.id === 'sky_islands') {
      const sunGrad = ctx.createRadialGradient(140, 70, 30, 180, 90, 640);
      sunGrad.addColorStop(0, 'rgba(254, 240, 138, 0.16)');
      sunGrad.addColorStop(1, 'rgba(254, 240, 138, 0)');
      ctx.fillStyle = sunGrad;
      ctx.fillRect(minX, minY, maxX - minX, maxY - minY);
    }

    const rng = seededRand(level.id * 55 + 11);
    for (let i = 0; i < 24; i++) {
      const bx = rng() * MAP_WIDTH;
      const by = rng() * MAP_HEIGHT;
      const px = bx + Math.sin(t * 0.8 + i * 2) * 32;
      const py = by + Math.cos(t * 0.65 + i * 3) * 22;
      ctx.fillStyle =
        world.id === 'frozen_empire' || world.id === 'frozen_mecha_kingdom'
          ? 'rgba(224, 242, 254, 0.66)'
          : world.id === 'lava_lands' || world.id === 'dragons_realm' || world.id === 'omega_final_war'
            ? 'rgba(251, 146, 60, 0.62)'
            : world.id === 'cyber_wasteland'
              ? 'rgba(245, 158, 11, 0.56)'
              : world.id === 'toxic_mutation_zone'
                ? 'rgba(163, 230, 53, 0.58)'
                : world.id === 'mushroom_kingdom' || world.id === 'ancient_temple' || world.id === 'void_dimension'
                  ? 'rgba(232, 121, 249, 0.56)'
                  : world.id === 'ocean_abyss'
                    ? 'rgba(94, 234, 212, 0.55)'
                    : 'rgba(253, 224, 71, 0.45)';
      ctx.beginPath();
      ctx.arc(px, py, 2.7, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}

export { WEAPON_MAP };
