import { dkAudio } from './audio';
import { getCanonicalMonsterRadius, getMonsterClickHitRadius } from './art/monsterScaling';
import { ENEMY_MAP } from './enemies';
import {
  BattlefieldRenderer,
  computeViewportTransform,
  MAP_HEIGHT,
  MAP_WIDTH,
  RenderCoinDrop,
  ViewportTransform,
} from './renderer';
import {
  ActiveDroneState,
  ActiveEnemyState,
  ActiveSpiderNestState,
  BattleSnapshot,
  DefeatedEffect,
  EnemySpeedMultiplier,
  GraphicsSettings,
  LevelConfig,
  PlacedTowerState,
  TargetingMode,
  Vec2,
  WeaponDefinition,
  WeaponId,
} from './types';
import { WEAPON_MAP } from './weapons';

export { computeViewportTransform, MAP_HEIGHT, MAP_WIDTH };
export type { ViewportTransform };

// Scale factor adapting 1000x600 weapon/enemy distances to 1280x720 16:9 widescreen space
const WORLD_SCALE = 1.24;

const SPIDER_ENEMY_IDS = new Set([
  'giant_spider',
  'venom_spider',
  'cybernetic_spider',
  'mutated_acid_spider',
  'brood_mech_spider',
]);

interface PendingSpawn {
  enemyId: string;
  pathIndex: number;
  spawnTime: number;
  isBoss?: boolean;
}

interface ActiveProjectile {
  id: string;
  weaponId: WeaponId;
  projectileType: WeaponDefinition['projectileType'];
  x: number;
  y: number;
  vx: number;
  vy: number;
  targetInstanceId: string;
  targetNestId?: string;
  targetX: number;
  targetY: number;
  speed: number;
  damage: number;
  splashRadius: number;
  armorPierce: number;
  slowFactor: number;
  slowDuration: number;
  poisonDps: number;
  poisonDuration: number;
  burnDps: number;
  burnDuration: number;
  color: string;
  accentColor: string;
  towerId: string;
  upgradeTier: number;
  canHitFlying: boolean;
  canHitGround: boolean;
}

type TowerTarget =
  | { kind: 'enemy'; enemy: ActiveEnemyState; x: number; y: number }
  | { kind: 'nest'; nest: ActiveSpiderNestState; x: number; y: number };

interface VisualBeam {
  points: { x: number; y: number }[];
  color: string;
  width: number;
  life: number;
  maxLife: number;
  kind: 'beam' | 'shockwave' | 'emp_ring';
  style?: 'lightning' | 'laser' | 'drone_laser';
  radius?: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  life: number;
  maxLife: number;
}

interface FloatingText {
  x: number;
  y: number;
  text: string;
  color: string;
  life: number;
  maxLife: number;
}

export interface TowerEffectiveStats {
  damage: number;
  attackSpeed: number;
  range: number;
  splashRadius: number;
  armorPierce: number;
  slowFactor: number;
  slowDuration: number;
  poisonDps: number;
  poisonDuration: number;
  burnDps: number;
  burnDuration: number;
  chainCount: number;
  canTargetFlying: boolean;
  canTargetGround: boolean;
}

export function getWeaponCostForLevel(level: LevelConfig, weaponId: WeaponId): number {
  const override = level.weaponCostOverrides?.[weaponId];
  if (typeof override === 'number') return override;
  return WEAPON_MAP[weaponId].price;
}

export function getTowerEffectiveStats(
  tower: PlacedTowerState,
  level?: LevelConfig
): TowerEffectiveStats {
  const def = WEAPON_MAP[tower.weaponId];
  let damage = def.damage;
  let range = def.range;
  let speedMult = 1;
  let splash = def.splashRadius;
  let armorPierce = def.armorPierce ?? 0;
  let slowFactor = def.slowFactor ?? 0;
  let slowDuration = def.slowDuration ?? 0;
  let poisonDps = def.poisonDps ?? 0;
  let poisonDuration = def.poisonDuration ?? 0;
  let burnDps = def.burnDps ?? 0;
  let burnDuration = def.burnDuration ?? 0;
  let chainCount = def.chainCount ?? 0;
  let canTargetFlying = def.canTargetFlying;
  const canTargetGround = def.canTargetGround;

  (['A', 'B', 'C'] as const).forEach((pathId) => {
    const tierLevel = tower.pathChoices[pathId];
    if (tierLevel <= 0) return;
    const pathDef = def.upgradePaths.find((p) => p.id === pathId);
    if (!pathDef) return;
    for (let i = 0; i < tierLevel; i++) {
      const tier = pathDef.tiers[i];
      if (!tier) continue;
      damage += tier.damageBonus;
      range += tier.rangeBonus;
      speedMult *= tier.fireRateMultiplier;

      if (def.id === 'shadow_archer' && pathId === 'B') {
        armorPierce = Math.min(0.85, armorPierce + 0.15);
      } else if (def.id === 'iron_cannon') {
        if (pathId === 'A') splash += 18;
        if (pathId === 'C') armorPierce = Math.min(1, armorPierce + 0.22);
      } else if (def.id === 'ice_wizard') {
        if (pathId === 'A') {
          slowFactor = Math.min(0.72, slowFactor + 0.09);
          slowDuration += 0.55;
        }
        if (pathId === 'C') splash += 12;
      } else if (def.id === 'thunder_tower') {
        if (pathId === 'A') chainCount += i === 2 ? 2 : 1;
        if (pathId === 'B') armorPierce = Math.min(1, armorPierce + 0.07);
      } else if (def.id === 'poison_tower') {
        if (pathId === 'A') poisonDps += 14 + i * 10;
        if (pathId === 'B') splash += 16;
      } else if (def.id === 'fire_dragon') {
        if (pathId === 'A') burnDps += 14 + i * 8;
        if (pathId === 'C') splash += 16;
      } else if (def.id === 'crystal_laser' && pathId === 'A') {
        armorPierce = Math.min(1, armorPierce + 0.02);
      } else if (def.id === 'ancient_guardian' && pathId === 'A') {
        splash += 16;
        slowFactor = Math.min(0.45, slowFactor + 0.05);
      } else if (def.id === 'sky_hunter' && pathId === 'B') {
        armorPierce = Math.min(0.94, armorPierce + 0.15);
      } else if (def.id === 'missile_platform') {
        if (pathId === 'A') splash += 16;
        if (pathId === 'C') armorPierce = Math.min(0.85, armorPierce + 0.08);
      } else if (def.id === 'storm_cannon') {
        if (pathId === 'A') armorPierce = Math.min(0.98, armorPierce + 0.05);
        if (pathId === 'B') {
          slowFactor = Math.min(0.58, slowFactor + 0.08);
          slowDuration += 0.35;
          splash += 14;
        }
      } else if (def.id === 'drone_station' && pathId === 'B') {
        armorPierce = Math.min(0.95, armorPierce + 0.08);
      } else if (def.id === 'plasma_air_defense' && pathId === 'A') {
        burnDps += 12 + i * 8;
        armorPierce = Math.min(0.99, armorPierce + 0.03);
      } else if (def.id === 'titan_plasma_cannon') {
        if (pathId === 'A') {
          armorPierce = Math.min(0.96, armorPierce + 0.08);
          if (i >= 1) {
            burnDps += 14 + i * 8;
            burnDuration = Math.max(burnDuration, 2.6);
          }
        }
        if (pathId === 'C') {
          splash += i === 0 ? 20 : i === 2 ? 28 : 12;
          if (i >= 1) {
            canTargetFlying = true;
          }
        }
      }
    }
  });

  if (level) {
    if (level.environment.hazard === 'sandstorm') {
      range *= 0.9;
    } else if (level.environment.hazard === 'poison_mist') {
      speedMult *= 0.92;
    }
  }

  return {
    damage: Math.round(damage),
    attackSpeed: def.attackSpeed * speedMult,
    range: Math.round(range * WORLD_SCALE),
    splashRadius: Math.round(splash * WORLD_SCALE),
    armorPierce,
    slowFactor,
    slowDuration,
    poisonDps,
    poisonDuration,
    burnDps,
    burnDuration,
    chainCount,
    canTargetFlying,
    canTargetGround,
  };
}

export function getPreviewWeaponRange(weaponId: WeaponId, level?: LevelConfig): number {
  const def = WEAPON_MAP[weaponId];
  let r = def.range;
  if (level?.environment.hazard === 'sandstorm') {
    r *= 0.9;
  }
  return Math.round(r * WORLD_SCALE);
}

export class DarkKingdomEngine {
  public level: LevelConfig;
  public status: BattleSnapshot['status'] = 'idle';
  public castleHp: number;
  public maxCastleHp: number;
  public castleDamageFlash = 0;
  public castleShakeTimer = 0;
  public coins: number;
  public score = 0;
  public currentWave = 0;
  public waveTimer = 0;
  public waveCountdown = 3.5;
  public waveAnnouncement: string | null = null;
  public announcementTimer = 0;
  public enemySpeedMultiplier: EnemySpeedMultiplier = 1;
  public kills = 0;
  public bossesKilledInLevel = 0;
  public leaks = 0;

  public towers: PlacedTowerState[] = [];
  public enemies: ActiveEnemyState[] = [];
  public spiderNests: ActiveSpiderNestState[] = [];
  public activeDrones: ActiveDroneState[] = [];
  public defeatedEffects: DefeatedEffect[] = [];
  public projectiles: ActiveProjectile[] = [];
  public beams: VisualBeam[] = [];
  public particles: Particle[] = [];
  public coinDrops: RenderCoinDrop[] = [];
  public floatingTexts: FloatingText[] = [];

  public selectedZoneId: string | null = null;
  public previewWeaponId: WeaponId | null = null;
  public pendingWeaponToBuild: WeaponId | null = null;
  public selectedTowerId: string | null = null;
  public selectedEnemyId: string | null = null;
  public selectedNestId: string | null = null;
  public focusedNestId: string | null = null;

  public specialCharges = {
    arcaneStorm: 0,
    castleRepair: 0,
    goldSurge: 0,
  };

  public graphics: GraphicsSettings = {
    particles: 'high',
    showRangeAlways: false,
    showDamageNumbers: true,
  };

  private pendingSpawns: PendingSpawn[] = [];
  private waveInProgress = false;
  private elapsedTime = 0;
  private uidCounter = 1;
  private previousStatusBeforeMcq: BattleSnapshot['status'] = 'playing';
  private statusBeforeShop: 'playing' | 'paused' = 'playing';
  private onStatusChange?: (snap: BattleSnapshot) => void;
  private renderer = new BattlefieldRenderer();

  constructor(
    level: LevelConfig,
    options?: {
      graphics?: GraphicsSettings;
      initialEnemySpeed?: EnemySpeedMultiplier;
      initialCharges?: { arcaneStorm?: number; castleRepair?: number; goldSurge?: number };
      onStatusChange?: (snap: BattleSnapshot) => void;
    }
  ) {
    this.level = level;
    this.maxCastleHp = level.castleHealth;
    this.castleHp = level.castleHealth;
    this.coins = level.startingCoins;
    if (options?.graphics) {
      this.graphics = { ...options.graphics };
    }
    if (options?.initialEnemySpeed) {
      this.enemySpeedMultiplier = options.initialEnemySpeed;
    }
    if (options?.initialCharges) {
      this.specialCharges = {
        arcaneStorm: options.initialCharges.arcaneStorm ?? 0,
        castleRepair: options.initialCharges.castleRepair ?? 0,
        goldSurge: options.initialCharges.goldSurge ?? 0,
      };
    }
    this.onStatusChange = options?.onStatusChange;
    this.initSpiderNests();
    this.status = 'playing';
    this.waveCountdown = 2.2;
    this.waveAnnouncement = `මට්ටම ${level.id}: ${level.name}`;
    this.announcementTimer = 2.6;
  }

  private initSpiderNests() {
    const configs = this.level.spiderNests ?? [];
    this.spiderNests = configs.map((cfg, idx) => {
      const pathIdx = Math.max(0, Math.min(this.level.roadLayout.paths.length - 1, cfg.pathIndex));
      const path = this.level.roadLayout.paths[pathIdx];
      let waypointIndex = 1;
      if (path && path.points.length > 1) {
        let bestWp = 1;
        let bestDist = Infinity;
        for (let i = 1; i < path.points.length; i++) {
          const d = Math.hypot(path.points[i].x - cfg.x, path.points[i].y - cfg.y);
          if (d < bestDist) {
            bestDist = d;
            bestWp = i;
          }
        }
        waypointIndex = bestWp;
      }
      return {
        id: cfg.id,
        x: cfg.x,
        y: cfg.y,
        pathIndex: pathIdx,
        waypointIndex,
        hp: cfg.maxHp,
        maxHp: cfg.maxHp,
        armor: cfg.armor ?? 4,
        coinReward: cfg.coinReward,
        spawnInterval: cfg.spawnInterval,
        spawnCooldown: 2.2 + idx * 1.4,
        spawnsRemaining: cfg.maxSpawns,
        maxSpawns: cfg.maxSpawns,
        spawnedCount: 0,
        batchSize: cfg.batchSize ?? 1,
        enemyId: cfg.enemyId,
        label: cfg.label,
        destroyed: false,
        hitFlash: 0,
        destroyAnimTimer: 0,
        size: 27,
      };
    });
  }

  private nextId(prefix: string): string {
    return `${prefix}_${this.uidCounter++}`;
  }

  public setGraphics(graphics: GraphicsSettings) {
    this.graphics = { ...graphics };
  }

  public setEnemySpeedMultiplier(speed: EnemySpeedMultiplier) {
    this.enemySpeedMultiplier = speed;
  }

  public togglePause() {
    if (this.status === 'playing') {
      this.status = 'paused';
      this.emitSnapshot();
    } else if (this.status === 'paused') {
      this.status = 'playing';
      this.emitSnapshot();
    }
  }

  public enterMcqPause() {
    if (this.status === 'playing' || this.status === 'paused' || this.status === 'shop_pause') {
      this.previousStatusBeforeMcq = this.status === 'paused' ? 'playing' : this.status;
      this.status = 'mcq_pause';
      this.emitSnapshot();
    }
  }

  public exitMcqPause() {
    if (this.status === 'mcq_pause') {
      this.status =
        this.previousStatusBeforeMcq === 'shop_pause' ? 'shop_pause' : 'playing';
      this.emitSnapshot();
    }
  }

  public openWeaponShopForZone(zoneId: string, preferredWeaponId?: WeaponId | null): boolean {
    if (this.status === 'victory' || this.status === 'defeat') return false;
    const zone = this.level.buildZones.find((z) => z.id === zoneId);
    if (!zone) return false;
    if (this.towers.some((t) => t.zoneId === zoneId)) return false;

    if (this.status === 'playing' || this.status === 'paused') {
      this.statusBeforeShop = this.status;
    }

    this.selectedZoneId = zone.id;
    this.selectedTowerId = null;
    this.selectedEnemyId = null;

    if (preferredWeaponId && this.level.availableWeapons.includes(preferredWeaponId)) {
      this.previewWeaponId = preferredWeaponId;
    } else {
      const firstAffordable =
        this.level.availableWeapons.find(
          (wId) => this.coins >= getWeaponCostForLevel(this.level, wId)
        ) ??
        this.level.availableWeapons[0] ??
        null;
      this.previewWeaponId = firstAffordable;
    }

    this.status = 'shop_pause';
    this.emitSnapshot();
    return true;
  }

  public closeWeaponShop() {
    this.selectedZoneId = null;
    this.previewWeaponId = null;
    this.pendingWeaponToBuild = null;
    if (this.status === 'shop_pause' || this.status === 'mcq_pause') {
      this.status = this.statusBeforeShop;
    }
    this.emitSnapshot();
  }

  public enterShopMcqPause() {
    if (this.status === 'shop_pause' || this.status === 'playing' || this.status === 'paused') {
      this.previousStatusBeforeMcq = this.selectedZoneId ? 'shop_pause' : 'playing';
      this.status = 'mcq_pause';
      this.emitSnapshot();
    }
  }

  public returnToShopFromMcq() {
    if (this.status === 'mcq_pause') {
      this.status = this.selectedZoneId ? 'shop_pause' : 'playing';
      this.emitSnapshot();
    }
  }

  public applyMcqReward(reward: {
    bonusCoins: number;
    specialType?: 'arcaneStorm' | 'castleRepair' | 'goldSurge';
  }) {
    this.coins += reward.bonusCoins;
    this.score += reward.bonusCoins * 2;
    this.spawnFloatingText(
      this.level.castle.x,
      this.level.castle.y - 36,
      `+${reward.bonusCoins}g Bonus`,
      '#fbbf24'
    );
    if (reward.specialType) {
      this.specialCharges[reward.specialType] += 1;
    }
    this.emitSnapshot();
  }

  public triggerSpecialPower(type: 'arcaneStorm' | 'castleRepair' | 'goldSurge'): boolean {
    if (this.specialCharges[type] <= 0 || this.status !== 'playing') return false;
    this.specialCharges[type] -= 1;

    if (type === 'arcaneStorm') {
      const targets = [...this.enemies];
      targets.forEach((enemy) => {
        const dmg = enemy.isBoss ? Math.round(enemy.maxHp * 0.16) : Math.round(enemy.maxHp * 0.65 + 90);
        this.beams.push({
          points: [
            { x: enemy.x - 18, y: Math.max(10, enemy.y - 160) },
            { x: enemy.x + 8, y: enemy.y - 75 },
            { x: enemy.x, y: enemy.y },
          ],
          color: '#38bdf8',
          width: 3,
          life: 0.35,
          maxLife: 0.35,
          kind: 'beam',
        });
        this.applyDamageToEnemy(enemy, dmg, 1.0, false);
      });
      for (const nest of this.spiderNests) {
        if (nest.destroyed) continue;
        this.beams.push({
          points: [
            { x: nest.x - 16, y: Math.max(10, nest.y - 160) },
            { x: nest.x + 6, y: nest.y - 75 },
            { x: nest.x, y: nest.y },
          ],
          color: '#38bdf8',
          width: 3,
          life: 0.35,
          maxLife: 0.35,
          kind: 'beam',
        });
        this.applyDamageToNest(nest, Math.round(nest.maxHp * 0.45 + 75), 1.0, false);
      }
      this.waveAnnouncement = 'මායා අකුණු කුණාටුව මුදා හරින ලදී!';
      this.announcementTimer = 2.0;
      dkAudio.playWeaponShot('thunder_tower');
    } else if (type === 'castleRepair') {
      const heal = Math.max(4, Math.ceil(this.maxCastleHp * 0.35));
      this.castleHp = Math.min(this.maxCastleHp, this.castleHp + heal);
      this.spawnFloatingText(this.level.castle.x, this.level.castle.y - 30, `+${heal} ජීව`, '#4ade80');
      this.waveAnnouncement = `බලකොටුව අලුත්වැඩියා කළා (+${heal} ජීව)`;
      this.announcementTimer = 2.0;
      dkAudio.playUpgrade();
    } else if (type === 'goldSurge') {
      this.coins += 180;
      this.spawnFloatingText(this.level.castle.x, this.level.castle.y - 30, '+180 කාසි', '#fbbf24');
      this.waveAnnouncement = 'රාජකීය භාණ්ඩාගාරය (+180 කාසි)';
      this.announcementTimer = 2.0;
      dkAudio.playBuild();
    }

    this.emitSnapshot();
    return true;
  }

  public startNextWaveNow(): boolean {
    if (this.status !== 'playing') return false;
    if (this.waveInProgress || this.currentWave >= this.level.waveCount) return false;
    const earlyBonus = Math.round(this.waveCountdown * 3);
    if (earlyBonus > 0) {
      this.coins += earlyBonus;
      this.spawnFloatingText(
        this.level.castle.x,
        this.level.castle.y - 25,
        `+${earlyBonus} කලින් වටය`,
        '#fbbf24'
      );
    }
    this.beginNextWave();
    return true;
  }

  public selectWeaponForPlacement(weaponId: WeaponId | null) {
    if (weaponId && this.selectedZoneId) {
      // Preview weapon on selected zone; second tap builds immediately!
      if (this.previewWeaponId === weaponId) {
        if (this.buildTower(this.selectedZoneId, weaponId)) {
          this.pendingWeaponToBuild = null;
          this.previewWeaponId = null;
          return;
        }
      } else {
        this.previewWeaponId = weaponId;
        this.emitSnapshot();
        return;
      }
    }
    this.pendingWeaponToBuild = this.pendingWeaponToBuild === weaponId ? null : weaponId;
    if (this.pendingWeaponToBuild) {
      this.selectedTowerId = null;
      this.selectedEnemyId = null;
    }
    this.emitSnapshot();
  }

  public setPreviewWeapon(weaponId: WeaponId | null) {
    this.previewWeaponId = weaponId;
    this.emitSnapshot();
  }

  public confirmPreviewBuild(): boolean {
    if (!this.selectedZoneId || !this.previewWeaponId) return false;
    return this.buildTower(this.selectedZoneId, this.previewWeaponId);
  }

  public setFocusedNest(nestId: string | null) {
    if (nestId && this.spiderNests.some((n) => n.id === nestId && !n.destroyed)) {
      this.focusedNestId = nestId;
    } else {
      this.focusedNestId = null;
    }
    this.emitSnapshot();
  }

  public selectAtMapPoint(x: number, y: number) {
    // 1. Check existing tower click
    for (const t of this.towers) {
      const d = Math.hypot(x - t.x, y - t.y);
      if (d <= 34) {
        this.selectedTowerId = t.instanceId;
        this.selectedZoneId = null;
        this.previewWeaponId = null;
        this.pendingWeaponToBuild = null;
        this.selectedEnemyId = null;
        this.selectedNestId = null;
        this.emitSnapshot();
        return;
      }
    }

    // 2. Check build zone click — opens Smart Weapon Shop & automatically pauses battle
    for (const z of this.level.buildZones) {
      const d = Math.hypot(x - z.x, y - z.y);
      if (d <= Math.max(36, z.radius + 10)) {
        const existing = this.towers.find((t) => t.zoneId === z.id);
        if (existing) {
          this.selectedTowerId = existing.instanceId;
          this.selectedZoneId = null;
          this.previewWeaponId = null;
          this.pendingWeaponToBuild = null;
          this.selectedEnemyId = null;
          this.selectedNestId = null;
          this.emitSnapshot();
        } else {
          this.selectedNestId = null;
          this.openWeaponShopForZone(z.id, this.pendingWeaponToBuild);
        }
        return;
      }
    }

    // 3. Check enemy click
    for (const e of this.enemies) {
      const d = Math.hypot(x - e.x, y - e.y);
      if (d <= getMonsterClickHitRadius(e.enemyClass, e.isBoss, e.size)) {
        this.selectedEnemyId = e.instanceId;
        this.selectedNestId = null;
        this.selectedZoneId = null;
        this.previewWeaponId = null;
        this.selectedTowerId = null;
        this.pendingWeaponToBuild = null;
        this.emitSnapshot();
        return;
      }
    }

    // 4. Check spider nest click (select & focus-fire)
    for (const nest of this.spiderNests) {
      if (nest.destroyed) continue;
      const d = Math.hypot(x - nest.x, y - nest.y);
      if (d <= nest.size + 14) {
        this.selectedNestId = nest.id;
        this.focusedNestId = nest.id;
        this.selectedEnemyId = null;
        this.selectedZoneId = null;
        this.previewWeaponId = null;
        this.selectedTowerId = null;
        this.pendingWeaponToBuild = null;
        this.emitSnapshot();
        return;
      }
    }

    // Clear selection (prevents placement on invalid ground)
    this.selectedZoneId = null;
    this.previewWeaponId = null;
    this.selectedTowerId = null;
    this.selectedEnemyId = null;
    this.selectedNestId = null;
    this.pendingWeaponToBuild = null;
    this.emitSnapshot();
  }

  public canBuildInZone(
    zoneId: string,
    weaponId: WeaponId,
    options?: { free?: boolean }
  ): { ok: boolean; reason?: string } {
    if (!this.level.availableWeapons.includes(weaponId)) {
      return { ok: false, reason: 'මෙම මට්ටමේදී මෙම ආයුධය සීමා කර ඇත' };
    }
    if (
      typeof this.level.maxTowersAllowed === 'number' &&
      this.towers.length >= this.level.maxTowersAllowed
    ) {
      return {
        ok: false,
        reason: `උපරිම කුළුණු සීමාව (${this.level.maxTowersAllowed}) සම්පූර්ණයි`,
      };
    }
    const zone = this.level.buildZones.find((z) => z.id === zoneId);
    if (!zone) {
      return { ok: false, reason: 'වලංගු නොවන ස්ථානයකි' };
    }
    if (this.towers.some((t) => t.zoneId === zoneId)) {
      return { ok: false, reason: 'මෙම ස්ථානයේ කුළුණක් ඇත' };
    }
    if (!options?.free) {
      const cost = getWeaponCostForLevel(this.level, weaponId);
      if (this.coins < cost) {
        return { ok: false, reason: `කාසි ${cost}ක් අවශ්‍යයි` };
      }
    }
    return { ok: true };
  }

  public buildTower(
    zoneId: string,
    weaponId: WeaponId,
    options?: { free?: boolean }
  ): boolean {
    const isFree = Boolean(options?.free);
    const check = this.canBuildInZone(zoneId, weaponId, { free: isFree });
    if (!check.ok) return false;
    const zone = this.level.buildZones.find((z) => z.id === zoneId)!;
    const def = WEAPON_MAP[weaponId];
    const cost = isFree ? 0 : getWeaponCostForLevel(this.level, weaponId);

    if (!isFree) {
      this.coins -= cost;
    }

    const tower: PlacedTowerState = {
      instanceId: this.nextId('tower'),
      zoneId,
      weaponId,
      x: zone.x,
      y: zone.y,
      pathChoices: { A: 0, B: 0, C: 0 },
      totalInvested: cost,
      targeting: def.targeting,
      kills: 0,
      cooldown: 0.15,
      angle: 0,
      recoil: 0,
      jammedTimer: 0,
    };
    this.towers.push(tower);
    this.selectedZoneId = null;
    this.previewWeaponId = null;
    this.pendingWeaponToBuild = null;
    this.selectedTowerId = tower.instanceId;

    if (this.status === 'shop_pause' || this.status === 'mcq_pause') {
      this.status = this.statusBeforeShop;
    }

    if (isFree) {
      this.spawnBurst(zone.x, zone.y, '#34d399', 20);
      this.spawnBurst(zone.x, zone.y, '#fbbf24', 12);
      this.beams.push({
        points: [{ x: zone.x, y: zone.y }],
        color: '#34d399',
        width: 4,
        life: 0.55,
        maxLife: 0.55,
        kind: 'shockwave',
        radius: 95,
      });
      this.spawnFloatingText(zone.x, zone.y - 26, 'නොමිලේ අගුළු හරින ලදී!', '#34d399');
      dkAudio.playUpgrade();
      dkAudio.playBuild();
    } else {
      this.spawnBurst(zone.x, zone.y, def.accentColor, 14);
      dkAudio.playBuild();
    }

    this.emitSnapshot();
    return true;
  }

  public upgradeTower(towerId: string, pathId: 'A' | 'B' | 'C'): boolean {
    const tower = this.towers.find((t) => t.instanceId === towerId);
    if (!tower) return false;
    const currentTier = tower.pathChoices[pathId];
    if (currentTier >= 3) return false;
    const def = WEAPON_MAP[tower.weaponId];
    const pathDef = def.upgradePaths.find((p) => p.id === pathId);
    if (!pathDef) return false;
    const nextTier = pathDef.tiers[currentTier];
    if (!nextTier || this.coins < nextTier.cost) return false;

    this.coins -= nextTier.cost;
    tower.totalInvested += nextTier.cost;
    tower.pathChoices[pathId] = currentTier + 1;
    this.spawnBurst(tower.x, tower.y, '#fbbf24', 14);
    this.spawnFloatingText(tower.x, tower.y - 26, `${nextTier.name}!`, '#fde047');
    dkAudio.playUpgrade();
    this.emitSnapshot();
    return true;
  }

  public cycleTowerTargeting(towerId: string): boolean {
    const tower = this.towers.find((t) => t.instanceId === towerId);
    if (!tower) return false;
    const def = WEAPON_MAP[tower.weaponId];
    let modes: TargetingMode[];
    if (def.canTargetFlying && !def.canTargetGround) {
      modes = ['flying_priority', 'strongest', 'fastest', 'first'];
    } else if (!def.canTargetFlying && def.canTargetGround) {
      modes = ['first', 'strongest', 'fastest', 'ground_priority', 'area'];
    } else {
      modes = ['first', 'strongest', 'fastest', 'flying_priority', 'ground_priority', 'area'];
    }
    const idx = modes.indexOf(tower.targeting);
    tower.targeting = modes[(idx + 1) % modes.length];
    this.emitSnapshot();
    return true;
  }

  public sellTower(towerId: string): number {
    const idx = this.towers.findIndex((t) => t.instanceId === towerId);
    if (idx === -1) return 0;
    const tower = this.towers[idx];
    const ratio = WEAPON_MAP[tower.weaponId].sellRatio;
    const refund = Math.round(tower.totalInvested * ratio);
    this.coins += refund;
    this.towers.splice(idx, 1);
    this.activeDrones = this.activeDrones.filter((d) => d.towerId !== towerId);
    if (this.selectedTowerId === towerId) {
      this.selectedTowerId = null;
    }
    this.spawnFloatingText(tower.x, tower.y - 20, `+${refund} විකුණුවා`, '#fbbf24');
    dkAudio.playSell();
    this.emitSnapshot();
    return refund;
  }

  private beginNextWave() {
    if (this.currentWave >= this.level.waveCount) return;
    this.currentWave += 1;
    const waveDef = this.level.waves[this.currentWave - 1];
    this.waveInProgress = true;
    this.waveTimer = 0;
    this.pendingSpawns = [];

    for (const grp of waveDef.groups) {
      for (let i = 0; i < grp.count; i++) {
        const pathIdx = grp.pathIndex % this.level.roadLayout.paths.length;
        if (this.isSpiderSpawnBlockedByDestroyedNests(grp.enemyId, pathIdx)) {
          continue;
        }
        this.pendingSpawns.push({
          enemyId: grp.enemyId,
          pathIndex: pathIdx,
          spawnTime: grp.delayBeforeGroup + i * grp.spawnInterval,
        });
      }
    }

    if (waveDef.miniBossId) {
      const lastTime =
        this.pendingSpawns.length > 0
          ? Math.max(...this.pendingSpawns.map((s) => s.spawnTime)) + 1.4
          : 1.0;
      this.pendingSpawns.push({
        enemyId: waveDef.miniBossId,
        pathIndex: 0,
        spawnTime: lastTime,
        isBoss: true,
      });
      dkAudio.playBossWarning();
    } else {
      dkAudio.playWaveStart();
    }

    this.pendingSpawns.sort((a, b) => a.spawnTime - b.spawnTime);
    this.waveAnnouncement = waveDef.announcement || `සතුරු වටය ${this.currentWave}`;
    this.announcementTimer = 2.8;
    this.emitSnapshot();
  }

  private isSpiderSpawnBlockedByDestroyedNests(enemyId: string, pathIndex: number): boolean {
    if (!SPIDER_ENEMY_IDS.has(enemyId)) return false;
    const nestsOnPath = this.spiderNests.filter((n) => n.pathIndex === pathIndex);
    if (nestsOnPath.length === 0) return false;
    return nestsOnPath.every((n) => n.destroyed);
  }

  private computeAirWaypoints(
    spawnPt: Vec2,
    castlePt: Vec2,
    pathIndex: number,
    enemyId: string
  ): Vec2[] {
    let hash = 0;
    for (let i = 0; i < enemyId.length; i++) {
      hash = (hash * 31 + enemyId.charCodeAt(i)) | 0;
    }
    const laneSign = ((pathIndex + Math.abs(hash)) % 2 === 0 ? -1 : 1);
    const arcOffset = laneSign * (42 + (Math.abs(hash) % 48));
    const clampY = (y: number) => Math.max(78, Math.min(642, Math.round(y)));
    const clampX = (x: number) => Math.max(36, Math.min(1244, Math.round(x)));

    return [
      { x: spawnPt.x, y: spawnPt.y },
      {
        x: clampX(spawnPt.x + (castlePt.x - spawnPt.x) * 0.25),
        y: clampY(spawnPt.y + (castlePt.y - spawnPt.y) * 0.22 + arcOffset * 0.85),
      },
      {
        x: clampX(spawnPt.x + (castlePt.x - spawnPt.x) * 0.52),
        y: clampY(spawnPt.y + (castlePt.y - spawnPt.y) * 0.48 - arcOffset * 0.55),
      },
      {
        x: clampX(spawnPt.x + (castlePt.x - spawnPt.x) * 0.78),
        y: clampY(spawnPt.y + (castlePt.y - spawnPt.y) * 0.76 + arcOffset * 0.4),
      },
      { x: castlePt.x, y: castlePt.y },
    ];
  }

  private spawnEnemy(
    entry: PendingSpawn,
    originOverride?: { x: number; y: number; waypointIndex: number }
  ) {
    if (!originOverride && this.isSpiderSpawnBlockedByDestroyedNests(entry.enemyId, entry.pathIndex)) {
      return;
    }
    const def = ENEMY_MAP[entry.enemyId];
    if (!def) return;
    const path =
      this.level.roadLayout.paths[entry.pathIndex] ?? this.level.roadLayout.paths[0];
    if (!path || path.points.length === 0) return;

    const scale = this.level.enemyStatScale;
    const isMajorBoss =
      Boolean(entry.isBoss) && this.level.bossConfig?.enemyId === entry.enemyId;

    let hp = Math.round(
      (isMajorBoss && this.level.bossConfig ? this.level.bossConfig.hp : def.baseHp) *
        scale.hpMultiplier
    );
    if (this.level.environment.hazard === 'ancient_curse') {
      hp = Math.round(hp * 1.08);
    } else if (this.level.environment.hazard === 'toxic_acid_rain' && !def.isBoss) {
      hp = Math.round(hp * 1.05);
    } else if (this.level.environment.hazard === 'omega_warzone' && !def.isBoss) {
      hp = Math.round(hp * 1.06);
    }

    let speed =
      (isMajorBoss && this.level.bossConfig ? this.level.bossConfig.speed : def.speed) *
      scale.speedMultiplier *
      WORLD_SCALE;
    if (this.level.environment.hazard === 'lava_heat' || this.level.environment.hazard === 'ice_slick') {
      speed *= 1.09;
    } else if (this.level.environment.hazard === 'abyss_current' && !def.isFlying) {
      speed *= 1.1;
    } else if (
      this.level.environment.hazard === 'cyber_emp_storm' ||
      this.level.environment.hazard === 'cryo_blizzard'
    ) {
      speed *= 1.06;
    } else if (this.level.environment.hazard === 'omega_warzone') {
      speed *= 1.05;
    }

    const armor =
      (isMajorBoss && this.level.bossConfig ? this.level.bossConfig.armor : def.armor) +
      scale.armorBonus;

    let coinReward = Math.round(
      (isMajorBoss && this.level.bossConfig ? this.level.bossConfig.coinReward : def.coinReward) *
        scale.coinMultiplier
    );
    if (this.level.environment.hazard === 'ancient_curse') {
      coinReward = Math.round(coinReward * 1.12);
    } else if (this.level.environment.hazard === 'omega_warzone') {
      coinReward = Math.round(coinReward * 1.08);
    }

    let shieldHp = def.shieldHp ? Math.round(def.shieldHp * scale.hpMultiplier) : 0;
    if (this.level.environment.hazard === 'void_rift' && shieldHp > 0) {
      shieldHp = Math.round(shieldHp * 1.1);
    }
    const p0 = originOverride ? { x: originOverride.x, y: originOverride.y } : path.points[0];
    const startWaypointIdx = originOverride ? originOverride.waypointIndex : 1;
    const airWaypoints = def.isFlying
      ? this.computeAirWaypoints(p0, this.level.castle, entry.pathIndex, def.id)
      : undefined;
    const p1 = (airWaypoints ? airWaypoints[1] : path.points[startWaypointIdx]) ?? p0;
    const dirLen = Math.max(1, Math.hypot(p1.x - p0.x, p1.y - p0.y));
    const isBossUnit = Boolean(def.isBoss || isMajorBoss);

    const enemy: ActiveEnemyState = {
      instanceId: this.nextId('enemy'),
      enemyId: def.id,
      name: isMajorBoss && this.level.bossConfig ? this.level.bossConfig.name : def.name,
      enemyClass: def.enemyClass,
      pathIndex: entry.pathIndex,
      waypointIndex: startWaypointIdx,
      x: p0.x,
      y: p0.y,
      vx: (p1.x - p0.x) / dirLen,
      vy: (p1.y - p0.y) / dirLen,
      hp,
      maxHp: hp,
      shield: shieldHp,
      maxShield: shieldHp,
      armor,
      magicResist: def.magicResist,
      speed,
      coinReward,
      castleDamage:
        isMajorBoss && this.level.bossConfig
          ? this.level.bossConfig.castleDamage
          : def.castleDamage,
      isFlying: def.isFlying,
      isBoss: isBossUnit,
      regenPerSec: def.regenPerSec ?? 0,
      poisonResistant: Boolean(def.poisonResistant),
      dodgeChance: def.dodgeChance ?? 0,
      attackLungeTimer: 0,
      bodyColor: def.bodyColor,
      accentColor: def.accentColor,
      size: def.size,
      slowTimer: 0,
      slowFactor: 0,
      poisonTimer: 0,
      poisonDps: 0,
      burnTimer: 0,
      burnDps: 0,
      distanceTraveled: 0,
      hitFlash: 0,
      phaseIndex: 0,
      abilityCooldown:
        def.id === 'venom_spider' || def.id === 'giant_spider'
          ? 5.6 + Math.random() * 2.4
          : 3.4 + Math.random() * 2.2,
      sciFiAbility: def.sciFiAbility,
      airWaypoints,
      flyAltitude: def.isFlying ? (isBossUnit ? 36 : 26) : 0,
      stealthTimer: 0,
      dashTimer: 0,
      speedBoostTimer: 0,
      walkPhase: 0,
    };

    this.enemies.push(enemy);
    if (enemy.isBoss) {
      this.spawnBurst(enemy.x, enemy.y, enemy.accentColor, 22);
    }
  }

  public stepSimulation(rawDt: number) {
    if (this.status !== 'playing') return;

    const totalDt = Math.min(rawDt, 0.1);
    const effectiveEnemyStep = totalDt * this.enemySpeedMultiplier;
    const substeps = Math.max(totalDt, effectiveEnemyStep) > 0.03 ? 2 : 1;
    const dt = totalDt / substeps;

    for (let s = 0; s < substeps; s++) {
      this.stepOnce(dt);
      if (this.status !== 'playing') break;
    }
  }

  private stepOnce(dt: number) {
    this.elapsedTime += dt;
    if (this.castleDamageFlash > 0) {
      this.castleDamageFlash = Math.max(0, this.castleDamageFlash - dt * 2.5);
    }
    if (this.castleShakeTimer > 0) {
      this.castleShakeTimer = Math.max(0, this.castleShakeTimer - dt * 2.4);
    }
    if (this.announcementTimer > 0) {
      this.announcementTimer -= dt;
      if (this.announcementTimer <= 0) {
        this.waveAnnouncement = null;
      }
    }

    // 1. Wave scheduling & Spider Nest brood spawning
    if (!this.waveInProgress) {
      if (this.currentWave < this.level.waveCount) {
        this.waveCountdown -= dt;
        if (this.waveCountdown <= 0) {
          this.beginNextWave();
        }
      }
    } else {
      this.waveTimer += dt;
      while (this.pendingSpawns.length > 0 && this.pendingSpawns[0].spawnTime <= this.waveTimer) {
        const next = this.pendingSpawns.shift()!;
        this.spawnEnemy(next);
      }

      if (this.pendingSpawns.length === 0 && this.enemies.length === 0) {
        this.waveInProgress = false;
        const completedWave = this.level.waves[this.currentWave - 1];
        if (completedWave && completedWave.bonusCoins > 0) {
          this.coins += completedWave.bonusCoins;
          this.score += completedWave.bonusCoins * 3;
          this.spawnFloatingText(
            this.level.castle.x,
            this.level.castle.y - 34,
            `+${completedWave.bonusCoins} වටය අවසන්`,
            '#4ade80'
          );
        }
        if (this.currentWave >= this.level.waveCount) {
          this.status = 'victory';
          dkAudio.playVictory();
          this.emitSnapshot();
          return;
        } else {
          const nextWave = this.level.waves[this.currentWave];
          this.waveCountdown = Math.max(2.5, nextWave?.delayBeforeWave ?? 4.0);
        }
      }
    }

    // 1b. Update Spider Nests (cooldowns, capped brood spawns, hit flash, destruction anim)
    for (const nest of this.spiderNests) {
      if (nest.hitFlash > 0) {
        nest.hitFlash = Math.max(0, nest.hitFlash - dt);
      }
      if (nest.destroyed) {
        if (nest.destroyAnimTimer > 0) {
          nest.destroyAnimTimer = Math.max(0, nest.destroyAnimTimer - dt);
        }
        continue;
      }
      if (this.waveInProgress && nest.spawnsRemaining > 0 && this.enemies.length < 32) {
        nest.spawnCooldown -= dt;
        if (nest.spawnCooldown <= 0) {
          nest.spawnCooldown = nest.spawnInterval;
          const batch = Math.min(nest.batchSize, nest.spawnsRemaining);
          for (let b = 0; b < batch; b++) {
            this.spawnEnemy(
              {
                enemyId: nest.enemyId,
                pathIndex: nest.pathIndex,
                spawnTime: this.waveTimer,
              },
              {
                x: nest.x + (b - (batch - 1) * 0.5) * 10,
                y: nest.y + (Math.random() * 6 - 3),
                waypointIndex: nest.waypointIndex,
              }
            );
            nest.spawnsRemaining -= 1;
            nest.spawnedCount += 1;
          }
          this.spawnBurst(nest.x, nest.y, '#a3e635', 5);
        }
      }
    }

    // 2. Update Enemies
    const enemyDt = dt * this.enemySpeedMultiplier;
    const enemiesToRemove = new Set<string>();
    for (const enemy of this.enemies) {
      if (enemy.hitFlash > 0) enemy.hitFlash = Math.max(0, enemy.hitFlash - dt);
      if (enemy.attackLungeTimer > 0) enemy.attackLungeTimer = Math.max(0, enemy.attackLungeTimer - enemyDt);
      if (enemy.stealthTimer > 0) enemy.stealthTimer = Math.max(0, enemy.stealthTimer - dt);
      if (enemy.dashTimer > 0) enemy.dashTimer = Math.max(0, enemy.dashTimer - enemyDt);
      if (enemy.speedBoostTimer > 0) enemy.speedBoostTimer = Math.max(0, enemy.speedBoostTimer - enemyDt);

      if (enemy.slowTimer > 0) {
        enemy.slowTimer -= dt;
        if (enemy.slowTimer <= 0) {
          enemy.slowFactor = 0;
        }
      }

      if (enemy.poisonTimer > 0) {
        enemy.poisonTimer -= dt;
        const envMult = this.level.environment.hazard === 'toxic_spores' ? 0.9 : 1;
        const poisonMult = enemy.poisonResistant ? 0.35 : 1;
        this.applyDamageToEnemy(enemy, enemy.poisonDps * dt * envMult * poisonMult, 1.0, false);
      }

      if (enemy.burnTimer > 0 && enemy.hp > 0) {
        enemy.burnTimer -= dt;
        this.applyDamageToEnemy(enemy, enemy.burnDps * dt, 0.8, false);
      }

      if (enemy.hp <= 0) {
        enemiesToRemove.add(enemy.instanceId);
        continue;
      }

      // Passive health regeneration (suppressed while burning)
      if (enemy.regenPerSec > 0 && enemy.hp < enemy.maxHp && enemy.burnTimer <= 0) {
        enemy.hp = Math.min(enemy.maxHp, enemy.hp + enemy.regenPerSec * dt);
      }

      // Active sci-fi monster ability cycling
      if (enemy.sciFiAbility) {
        enemy.abilityCooldown -= dt;
        if (enemy.abilityCooldown <= 0) {
          this.triggerSciFiEnemyAbility(enemy);
        }
      }

      if (enemy.isBoss && this.level.bossConfig) {
        const hpRatio = enemy.hp / enemy.maxHp;
        const phases = this.level.bossConfig.phases;
        while (
          enemy.phaseIndex < phases.length &&
          hpRatio <= phases[enemy.phaseIndex].hpThresholdPct
        ) {
          const phase = phases[enemy.phaseIndex];
          this.triggerBossPhaseAbility(enemy, phase.ability, phase.name);
          enemy.phaseIndex += 1;
        }
      }

      const path = this.level.roadLayout.paths[enemy.pathIndex] ?? this.level.roadLayout.paths[0];
      const waypoints =
        enemy.isFlying && enemy.airWaypoints && enemy.airWaypoints.length > 0
          ? enemy.airWaypoints
          : path.points;
      const slowMult = 1 - Math.min(0.75, enemy.slowFactor);
      const dashMult = enemy.dashTimer > 0 || enemy.speedBoostTimer > 0 ? 1.85 : 1;
      enemy.walkPhase += enemyDt * slowMult * dashMult;
      let remainingDist = enemy.speed * slowMult * dashMult * enemyDt;

      if ((enemy.dashTimer > 0 || enemy.speedBoostTimer > 0) && this.graphics.particles === 'high' && Math.random() < 0.35) {
        this.particles.push({
          x: enemy.x - enemy.vx * 8,
          y: enemy.y - enemy.vy * 8 - (enemy.flyAltitude ?? 0),
          vx: -enemy.vx * 22,
          vy: -enemy.vy * 22,
          color: enemy.accentColor,
          size: 2.3,
          life: 0.24,
          maxLife: 0.24,
        });
      }

      while (remainingDist > 0 && enemy.waypointIndex < waypoints.length) {
        const targetPt = waypoints[enemy.waypointIndex];
        const dx = targetPt.x - enemy.x;
        const dy = targetPt.y - enemy.y;
        const dist = Math.hypot(dx, dy);
        if (dist > 0.001) {
          enemy.vx = dx / dist;
          enemy.vy = dy / dist;
        }
        if (enemy.waypointIndex >= waypoints.length - 1 && dist < 90 && enemy.attackLungeTimer <= 0) {
          enemy.attackLungeTimer = 0.32;
        }
        if (dist <= remainingDist) {
          enemy.x = targetPt.x;
          enemy.y = targetPt.y;
          enemy.distanceTraveled += dist;
          remainingDist -= dist;
          enemy.waypointIndex += 1;
        } else {
          enemy.x += (dx / dist) * remainingDist;
          enemy.y += (dy / dist) * remainingDist;
          enemy.distanceTraveled += remainingDist;
          remainingDist = 0;
        }
      }

      if (enemy.waypointIndex >= waypoints.length) {
        this.castleHp = Math.max(0, Number((this.castleHp - enemy.castleDamage).toFixed(2)));
        this.castleDamageFlash = 1;
        this.castleShakeTimer = 1;
        this.leaks += 1;
        enemiesToRemove.add(enemy.instanceId);
        const dmgLabel = Number.isInteger(enemy.castleDamage)
          ? `${enemy.castleDamage}`
          : enemy.castleDamage.toFixed(1);
        this.spawnFloatingText(
          this.level.castle.x,
          this.level.castle.y - 26,
          `-${dmgLabel} ජීව`,
          '#f87171'
        );
        this.spawnBurst(this.level.castle.x, this.level.castle.y, '#ef4444', 14);
        dkAudio.playCastleHit();
        if (this.castleHp <= 0) {
          this.status = 'defeat';
          dkAudio.playDefeat();
          this.emitSnapshot();
          return;
        }
      }
    }

    if (enemiesToRemove.size > 0) {
      this.enemies = this.enemies.filter((e) => !enemiesToRemove.has(e.instanceId));
      if (this.selectedEnemyId && enemiesToRemove.has(this.selectedEnemyId)) {
        this.selectedEnemyId = null;
      }
    }

    // 3. Towers detect & fire
    for (const tower of this.towers) {
      if (tower.recoil > 0) tower.recoil = Math.max(0, tower.recoil - dt * 6);
      if (tower.jammedTimer > 0) {
        tower.jammedTimer = Math.max(0, tower.jammedTimer - dt);
        continue;
      }
      if (tower.weaponId === 'drone_station') {
        continue; // Active flying drones handle combat in updateDrones
      }
      tower.cooldown = Math.max(0, tower.cooldown - dt);
      if (tower.cooldown > 0) continue;

      const stats = getTowerEffectiveStats(tower, this.level);
      const target = this.pickTargetForTower(tower, stats);
      if (!target) continue;

      tower.angle = Math.atan2(target.y - tower.y, target.x - tower.x);
      tower.recoil = 1;
      tower.cooldown = 1 / Math.max(0.15, stats.attackSpeed);
      this.fireTowerAtTarget(tower, stats, target);
    }

    // 3b. Autonomous Drone Station Fleets
    this.updateDrones(dt);

    // 4. Projectiles move & impact
    const remainingProjectiles: ActiveProjectile[] = [];
    for (const proj of this.projectiles) {
      const targetEnemy = proj.targetInstanceId
        ? this.enemies.find((e) => e.instanceId === proj.targetInstanceId)
        : undefined;
      const targetNest = proj.targetNestId
        ? this.spiderNests.find((n) => n.id === proj.targetNestId && !n.destroyed)
        : undefined;

      if (targetEnemy) {
        proj.targetX = targetEnemy.x;
        proj.targetY = targetEnemy.y;
      } else if (targetNest) {
        proj.targetX = targetNest.x;
        proj.targetY = targetNest.y;
      }

      const dx = proj.targetX - proj.x;
      const dy = proj.targetY - proj.y;
      const dist = Math.hypot(dx, dy);
      const stepDist = proj.speed * dt;
      if (dist > 0.001) {
        proj.vx = (dx / dist) * proj.speed;
        proj.vy = (dy / dist) * proj.speed;
      }

      if (dist <= stepDist + 6) {
        this.resolveProjectileImpact(proj, targetEnemy, targetNest);
      } else {
        proj.x += (dx / dist) * stepDist;
        proj.y += (dy / dist) * stepDist;
        remainingProjectiles.push(proj);
      }
    }
    this.projectiles = remainingProjectiles;

    // 5. Cleanup dead enemies killed by projectiles or DoTs
    const deadNow = this.enemies.filter((e) => e.hp <= 0);
    if (deadNow.length > 0) {
      this.enemies = this.enemies.filter((e) => e.hp > 0);
      if (this.selectedEnemyId && deadNow.some((d) => d.instanceId === this.selectedEnemyId)) {
        this.selectedEnemyId = null;
      }
    }

    // 6. Visual beams, defeat bursts, particles, coin drops, floating texts
    this.beams = this.beams.filter((b) => {
      b.life -= dt;
      return b.life > 0;
    });
    this.defeatedEffects = this.defeatedEffects.filter((fx) => {
      fx.life -= dt;
      return fx.life > 0;
    });
    this.particles = this.particles.filter((p) => {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;
      return p.life > 0;
    });
    this.coinDrops = this.coinDrops.filter((c) => {
      c.life -= dt;
      const progress = 1 - c.life / c.maxLife;
      c.y = c.startY - Math.sin(Math.min(1, progress * 1.4) * Math.PI) * 30;
      return c.life > 0;
    });
    this.floatingTexts = this.floatingTexts.filter((f) => {
      f.y -= 28 * dt;
      f.life -= dt;
      return f.life > 0;
    });
  }

  private triggerSciFiEnemyAbility(enemy: ActiveEnemyState) {
    const ab = enemy.sciFiAbility;
    if (!ab) return;

    if (ab === 'stealth') {
      enemy.abilityCooldown = 7.4;
      enemy.stealthTimer = 2.2;
      this.spawnBurst(enemy.x, enemy.y - (enemy.flyAltitude ?? 0), '#a855f7', 6);
    } else if (ab === 'aerial_dash') {
      enemy.abilityCooldown = 5.6;
      enemy.dashTimer = 1.35;
      enemy.attackLungeTimer = 0.35;
      this.spawnBurst(enemy.x, enemy.y - (enemy.flyAltitude ?? 0), '#38bdf8', 7);
    } else if (ab === 'speed_boost') {
      const isNormalSpider = enemy.enemyId === 'giant_spider' || enemy.enemyId === 'venom_spider';
      const isSpider = SPIDER_ENEMY_IDS.has(enemy.enemyId);
      enemy.abilityCooldown = isNormalSpider ? 8.6 : isSpider ? 7.2 : 6.0;
      enemy.speedBoostTimer = isNormalSpider ? 1.15 : isSpider ? 1.35 : 1.55;
      this.spawnBurst(enemy.x, enemy.y, '#22d3ee', 6);
    } else if (ab === 'armor_regen') {
      enemy.abilityCooldown = 5.2;
      if (enemy.burnTimer <= 0 && (enemy.hp < enemy.maxHp || enemy.shield < enemy.maxShield)) {
        enemy.hp = Math.min(enemy.maxHp, enemy.hp + Math.round(enemy.maxHp * 0.06));
        if (enemy.maxShield > 0) {
          enemy.shield = Math.min(enemy.maxShield, enemy.shield + Math.round(enemy.maxShield * 0.08));
        }
        this.spawnBurst(enemy.x, enemy.y - (enemy.flyAltitude ?? 0), '#34d399', 6);
      }
    } else if (ab === 'energy_shield') {
      enemy.abilityCooldown = 7.8;
      if (enemy.maxShield > 0 && enemy.shield < enemy.maxShield * 0.45) {
        enemy.shield = Math.min(enemy.maxShield, enemy.shield + Math.round(enemy.maxShield * 0.28));
        this.spawnBurst(enemy.x, enemy.y - (enemy.flyAltitude ?? 0), '#38bdf8', 8);
      }
    } else if (ab === 'emp_pulse') {
      const isSpider = SPIDER_ENEMY_IDS.has(enemy.enemyId);
      const isNormalSpider = enemy.enemyId === 'venom_spider' || enemy.enemyId === 'giant_spider';
      enemy.abilityCooldown = isNormalSpider ? 11.2 : isSpider ? 8.8 : 7.2;
      const empRadius = (isNormalSpider ? 130 : isSpider ? 155 : 175) * WORLD_SCALE;
      const jamDur = isNormalSpider ? 0.85 : isSpider ? 1.25 : 1.55;
      const maxJammed = isNormalSpider ? 1 : 2;
      let jammed = 0;
      for (const t of this.towers) {
        if (t.jammedTimer <= 0 && Math.hypot(t.x - enemy.x, t.y - enemy.y) <= empRadius) {
          t.jammedTimer = jamDur;
          jammed++;
          if (jammed >= maxJammed) break;
        }
      }
      this.beams.push({
        points: [{ x: enemy.x, y: enemy.y - (enemy.flyAltitude ?? 0) * 0.5 }],
        color: '#a855f7',
        width: 3,
        life: 0.34,
        maxLife: 0.34,
        kind: 'emp_ring',
        radius: empRadius,
      });
      if (jammed > 0) {
        this.spawnFloatingText(enemy.x, enemy.y - 34, 'EMP කම්පනය!', '#c084fc');
      }
    } else if (ab === 'boss_energy_wave') {
      const isSpiderBoss = enemy.enemyId === 'boss_spider_queen';
      enemy.abilityCooldown = isSpiderBoss ? 9.2 : 7.4;
      const waveRadius = 200 * WORLD_SCALE;
      const bossJamDur = isSpiderBoss ? 1.05 : 1.35;
      let jammed = 0;
      for (const t of this.towers) {
        if (Math.hypot(t.x - enemy.x, t.y - enemy.y) <= waveRadius && jammed < 2) {
          t.jammedTimer = Math.max(t.jammedTimer, bossJamDur);
          jammed++;
        }
      }
      if (enemy.maxShield > 0) {
        enemy.shield = Math.min(enemy.maxShield, enemy.shield + Math.round(enemy.maxShield * 0.14));
      }
      this.beams.push({
        points: [{ x: enemy.x, y: enemy.y - (enemy.flyAltitude ?? 0) * 0.5 }],
        color: enemy.accentColor,
        width: 3.4,
        life: 0.38,
        maxLife: 0.38,
        kind: 'emp_ring',
        radius: waveRadius,
      });
      // Hornet Queen & Sky/Void/Omega Bosses deploy cyber swarm drones!
      if (
        (enemy.enemyId === 'mecha_hornet_queen' ||
          enemy.enemyId === 'omega_sky_dragon' ||
          enemy.enemyId === 'boss_dark_dragon_king' ||
          enemy.enemyId === 'boss_void_archon' ||
          enemy.enemyId === 'boss_omega_supreme_overlord') &&
        this.enemies.length < 34
      ) {
        const summonId =
          enemy.enemyId === 'mecha_hornet_queen'
            ? 'nano_wasp'
            : enemy.enemyId === 'boss_void_archon'
              ? 'void_leviathan_flyer'
              : enemy.enemyId === 'boss_omega_supreme_overlord'
                ? 'omega_stealth_interceptor'
                : 'cyber_bat_swarm';
        const summonDef = ENEMY_MAP[summonId];
        if (summonDef) {
          const spawnPos = { x: enemy.x, y: enemy.y };
          const summonAir = this.computeAirWaypoints(
            spawnPos,
            this.level.castle,
            enemy.pathIndex,
            summonId
          );
          const hp = Math.max(
            24,
            Math.round(summonDef.baseHp * this.level.enemyStatScale.hpMultiplier * 0.65)
          );
          this.enemies.push({
            instanceId: this.nextId('drone_summon'),
            enemyId: summonDef.id,
            name: summonDef.name,
            enemyClass: summonDef.enemyClass,
            pathIndex: enemy.pathIndex,
            waypointIndex: 1,
            x: enemy.x + (Math.random() * 18 - 9),
            y: enemy.y + (Math.random() * 14 - 7),
            vx: enemy.vx,
            vy: enemy.vy,
            hp,
            maxHp: hp,
            shield: 0,
            maxShield: 0,
            armor: summonDef.armor,
            magicResist: summonDef.magicResist,
            speed: summonDef.speed * this.level.enemyStatScale.speedMultiplier * WORLD_SCALE,
            coinReward: Math.max(4, Math.round(summonDef.coinReward * 0.5)),
            castleDamage: 1,
            isFlying: true,
            isBoss: false,
            regenPerSec: 0,
            poisonResistant: false,
            dodgeChance: summonDef.dodgeChance ?? 0.12,
            attackLungeTimer: 0.25,
            bodyColor: summonDef.bodyColor,
            accentColor: summonDef.accentColor,
            size: summonDef.size,
            slowTimer: 0,
            slowFactor: 0,
            poisonTimer: 0,
            poisonDps: 0,
            burnTimer: 0,
            burnDps: 0,
            distanceTraveled: enemy.distanceTraveled,
            hitFlash: 0,
            phaseIndex: 99,
            abilityCooldown: 5,
            sciFiAbility: summonDef.sciFiAbility,
            airWaypoints: summonAir,
            flyAltitude: 24,
            stealthTimer: 0,
            dashTimer: 0,
            speedBoostTimer: 0,
            walkPhase: 0,
          });
        }
      }
    } else if (ab === 'void_teleport') {
      enemy.abilityCooldown = 6.5;
      const waypoints = enemy.airWaypoints ?? this.level.roadLayout.paths[enemy.pathIndex]?.points;
      if (waypoints && waypoints.length > 1) {
        const finalPt = waypoints[waypoints.length - 1];
        const distToCastle = Math.hypot(finalPt.x - enemy.x, finalPt.y - enemy.y);
        // Safety guard: never teleport directly into the castle!
        if (distToCastle > 165) {
          let budget = Math.min(125, distToCastle - 140);
          let curX = enemy.x;
          let curY = enemy.y;
          let wpIdx = enemy.waypointIndex;
          while (budget > 2 && wpIdx < waypoints.length) {
            const target = waypoints[wpIdx];
            const seg = Math.hypot(target.x - curX, target.y - curY);
            if (seg <= budget && wpIdx < waypoints.length - 1) {
              budget -= seg;
              curX = target.x;
              curY = target.y;
              wpIdx++;
            } else {
              const frac = Math.min(0.85, budget / Math.max(1, seg));
              curX += (target.x - curX) * frac;
              curY += (target.y - curY) * frac;
              budget = 0;
            }
          }
          const moved = Math.hypot(curX - enemy.x, curY - enemy.y);
          if (moved > 25) {
            this.spawnBurst(enemy.x, enemy.y - (enemy.flyAltitude ?? 0), '#c084fc', 7);
            enemy.x = curX;
            enemy.y = curY;
            enemy.waypointIndex = wpIdx;
            enemy.distanceTraveled += moved;
            this.beams.push({
              points: [{ x: enemy.x, y: enemy.y - (enemy.flyAltitude ?? 0) * 0.5 }],
              color: '#e879f9',
              width: 2.8,
              life: 0.3,
              maxLife: 0.3,
              kind: 'emp_ring',
              radius: 42,
            });
            this.spawnBurst(enemy.x, enemy.y - (enemy.flyAltitude ?? 0), '#e879f9', 8);
            this.spawnFloatingText(enemy.x, enemy.y - 30, 'අවකාශ පිම්ම!', '#e879f9');
          }
        }
      }
    } else if (ab === 'long_range_jam') {
      enemy.abilityCooldown = 7.0;
      const jamRange = 240 * WORLD_SCALE;
      let nearest: PlacedTowerState | null = null;
      let nearestDist = jamRange;
      for (const t of this.towers) {
        if (t.jammedTimer > 0) continue;
        const d = Math.hypot(t.x - enemy.x, t.y - enemy.y);
        if (d < nearestDist) {
          nearest = t;
          nearestDist = d;
        }
      }
      if (nearest) {
        nearest.jammedTimer = 1.15;
        this.beams.push({
          points: [
            { x: enemy.x, y: enemy.y - (enemy.flyAltitude ?? 0) * 0.5 },
            { x: nearest.x, y: nearest.y },
          ],
          color: enemy.accentColor,
          width: 2.6,
          life: 0.32,
          maxLife: 0.32,
          kind: 'beam',
          style: 'laser',
        });
        this.spawnFloatingText(nearest.x, nearest.y - 26, 'ලේසර් අවහිරය!', enemy.accentColor);
      }
    } else if (ab === 'toxic_aura') {
      enemy.abilityCooldown = 6.5;
      const auraRadius = 135 * WORLD_SCALE;
      let healed = 0;
      for (const ally of this.enemies) {
        if (
          ally.instanceId !== enemy.instanceId &&
          !ally.isBoss &&
          ally.hp < ally.maxHp &&
          Math.hypot(ally.x - enemy.x, ally.y - enemy.y) <= auraRadius
        ) {
          ally.hp = Math.min(ally.maxHp, ally.hp + Math.round(ally.maxHp * 0.04));
          healed++;
          if (healed >= 3) break;
        }
      }
      this.beams.push({
        points: [{ x: enemy.x, y: enemy.y - (enemy.flyAltitude ?? 0) * 0.5 }],
        color: '#a3e635',
        width: 2.4,
        life: 0.32,
        maxLife: 0.32,
        kind: 'emp_ring',
        radius: auraRadius,
      });
    } else if (ab === 'cryo_aura') {
      enemy.abilityCooldown = 7.2;
      const cryoRadius = 165 * WORLD_SCALE;
      let chilled = 0;
      for (const t of this.towers) {
        if (t.jammedTimer <= 0 && Math.hypot(t.x - enemy.x, t.y - enemy.y) <= cryoRadius) {
          t.jammedTimer = 0.95;
          chilled++;
          if (chilled >= 2) break;
        }
      }
      if (enemy.maxShield > 0) {
        enemy.shield = Math.min(enemy.maxShield, enemy.shield + Math.round(enemy.maxShield * 0.12));
      }
      this.beams.push({
        points: [{ x: enemy.x, y: enemy.y }],
        color: '#38bdf8',
        width: 2.8,
        life: 0.34,
        maxLife: 0.34,
        kind: 'emp_ring',
        radius: cryoRadius,
      });
      if (chilled > 0) {
        this.spawnFloatingText(enemy.x, enemy.y - 30, 'සීත අවහිරය!', '#7dd3fc');
      }
    } else {
      enemy.abilityCooldown = 9;
    }
  }

  private updateDrones(dt: number) {
    const stations = this.towers.filter((t) => t.weaponId === 'drone_station');
    const stationIds = new Set(stations.map((s) => s.instanceId));
    this.activeDrones = this.activeDrones.filter((d) => stationIds.has(d.towerId));

    for (const station of stations) {
      const upgradesTotal = station.pathChoices.A + station.pathChoices.B + station.pathChoices.C;
      const desiredCount = Math.min(
        3,
        1 +
          (station.pathChoices.A >= 1 ? 1 : 0) +
          (station.pathChoices.A >= 3 ? 1 : 0) +
          (station.pathChoices.A === 0 && upgradesTotal >= 4 ? 1 : 0)
      );
      const stage = 1 + Math.min(2, Math.floor(upgradesTotal / 3));

      let stationDrones = this.activeDrones.filter((d) => d.towerId === station.instanceId);
      while (stationDrones.length < desiredCount) {
        const idx = stationDrones.length;
        const orbitAngle = (Math.PI * 2 * idx) / Math.max(1, desiredCount);
        const created: ActiveDroneState = {
          id: this.nextId('drone'),
          towerId: station.instanceId,
          x: station.x + Math.cos(orbitAngle) * 20,
          y: station.y - 32 + Math.sin(orbitAngle) * 14,
          homeX: station.x,
          homeY: station.y,
          angle: orbitAngle,
          cooldown: 0.12 * idx,
          targetId: null,
          orbitAngle,
          stage,
        };
        this.activeDrones.push(created);
        stationDrones.push(created);
      }
      if (stationDrones.length > desiredCount) {
        const dropIds = new Set(stationDrones.slice(desiredCount).map((d) => d.id));
        this.activeDrones = this.activeDrones.filter((d) => !dropIds.has(d.id));
        stationDrones = stationDrones.filter((d) => !dropIds.has(d.id));
      }

      const stats = getTowerEffectiveStats(station, this.level);
      const isJammed = station.jammedTimer > 0;
      const stationRange = stats.range + 40;
      const validFlyers = isJammed
        ? []
        : this.enemies.filter(
            (e) =>
              e.hp > 0 &&
              e.isFlying &&
              Math.hypot(e.x - station.x, e.y - station.y) <= stationRange + e.size * 0.4
          );

      for (let i = 0; i < stationDrones.length; i++) {
        const drone = stationDrones[i];
        drone.homeX = station.x;
        drone.homeY = station.y;
        drone.stage = stage;
        drone.orbitAngle += dt * 2.45;
        if (drone.cooldown > 0) drone.cooldown = Math.max(0, drone.cooldown - dt);

        let target: ActiveEnemyState | undefined;
        if (validFlyers.length > 0) {
          if (station.targeting === 'strongest') {
            target = validFlyers.reduce((b, c) => (c.hp + c.shield > b.hp + b.shield ? c : b));
          } else if (station.targeting === 'fastest') {
            target = validFlyers.reduce((b, c) => (c.speed > b.speed ? c : b));
          } else {
            target = validFlyers[(i + validFlyers.length) % validFlyers.length];
            if (!target) {
              target = validFlyers.reduce((b, c) =>
                c.distanceTraveled > b.distanceTraveled ? c : b
              );
            }
          }
        }

        if (target && !isJammed) {
          drone.targetId = target.instanceId;
          const desiredX = target.x + Math.cos(drone.orbitAngle + i * 2.1) * 32;
          const desiredY =
            target.y - (target.flyAltitude ?? 24) - 10 + Math.sin(drone.orbitAngle + i * 2.1) * 20;
          const dx = desiredX - drone.x;
          const dy = desiredY - drone.y;
          const d = Math.hypot(dx, dy);
          const droneSpeed = 230 * WORLD_SCALE;
          if (d > 2) {
            const step = Math.min(d, droneSpeed * dt);
            drone.x += (dx / d) * step;
            drone.y += (dy / d) * step;
          }
          const targetVisualY = target.y - (target.flyAltitude ?? 24) * 0.7;
          drone.angle = Math.atan2(targetVisualY - drone.y, target.x - drone.x);

          if (drone.cooldown <= 0 && Math.hypot(target.x - drone.x, targetVisualY - drone.y) <= 135 * WORLD_SCALE) {
            drone.cooldown = 1 / Math.max(0.25, stats.attackSpeed);
            station.angle = Math.atan2(target.y - station.y, target.x - station.x);
            station.recoil = 0.6;
            const killed = this.applyDamageToEnemy(target, stats.damage, stats.armorPierce, false);
            if (killed) station.kills += 1;
            if (i === 0) dkAudio.playWeaponShot('drone_station');
            this.beams.push({
              points: [
                { x: drone.x, y: drone.y },
                { x: target.x, y: targetVisualY },
              ],
              color: '#34d399',
              width: 2.3 + stage * 0.45,
              life: 0.11,
              maxLife: 0.11,
              kind: 'beam',
              style: 'drone_laser',
            });
          }
        } else {
          drone.targetId = null;
          const idleX = station.x + Math.cos(drone.orbitAngle + i * 2.1) * 26;
          const idleY = station.y - 34 + Math.sin(drone.orbitAngle + i * 2.1) * 12;
          const dx = idleX - drone.x;
          const dy = idleY - drone.y;
          const d = Math.hypot(dx, dy);
          const homeSpeed = 165 * WORLD_SCALE;
          if (d > 1.5) {
            const step = Math.min(d, homeSpeed * dt);
            drone.x += (dx / d) * step;
            drone.y += (dy / d) * step;
            drone.angle = Math.atan2(dy, dx);
          }
        }
      }
    }
  }

  private triggerBossPhaseAbility(
    boss: ActiveEnemyState,
    ability: 'summon_minions' | 'shield_burst' | 'speed_surge' | 'tower_jam' | 'meteor_aura',
    phaseName: string
  ) {
    this.waveAnnouncement = `${boss.name}: ${phaseName}!`;
    this.announcementTimer = 2.6;
    boss.attackLungeTimer = 0.45;
    dkAudio.playBossWarning();
    this.spawnBurst(boss.x, boss.y, boss.accentColor, 18);

    if (ability === 'shield_burst') {
      const bonusShield = Math.round(boss.maxHp * 0.22);
      boss.shield += bonusShield;
      boss.maxShield = Math.max(boss.maxShield, boss.shield);
      this.spawnFloatingText(boss.x, boss.y - 26, `+${bonusShield} පලිහ`, '#38bdf8');
    } else if (ability === 'speed_surge') {
      boss.speed *= 1.25;
      this.spawnFloatingText(boss.x, boss.y - 26, 'වේග ප්‍රහාරය!', '#f97316');
    } else if (ability === 'tower_jam') {
      const jamDuration = boss.enemyId === 'boss_spider_queen' ? 1.9 : 2.5;
      let jammedCount = 0;
      for (const t of this.towers) {
        if (Math.hypot(t.x - boss.x, t.y - boss.y) <= 210) {
          t.jammedTimer = jamDuration;
          jammedCount++;
        }
      }
      if (jammedCount > 0) {
        this.spawnFloatingText(boss.x, boss.y - 26, `කුළුණු ${jammedCount}ක් අක්‍රියයි`, '#f43f5e');
      }
    } else if (ability === 'summon_minions') {
      const worldEnemies = Object.values(ENEMY_MAP).filter(
        (e) => e.worldId === this.level.worldId && !e.isBoss
      );
      const escort =
        boss.enemyId === 'boss_spider_queen'
          ? ENEMY_MAP.venom_spider
          : worldEnemies[0] ?? ENEMY_MAP.goblin;
      for (let i = 0; i < 2; i++) {
        const escortAir = escort.isFlying
          ? this.computeAirWaypoints(
              { x: boss.x, y: boss.y },
              this.level.castle,
              boss.pathIndex,
              escort.id
            )
          : undefined;
        this.enemies.push({
          ...boss,
          instanceId: this.nextId('summon'),
          enemyId: escort.id,
          name: escort.name,
          enemyClass: escort.enemyClass,
          waypointIndex: escort.isFlying ? 1 : boss.waypointIndex,
          x: boss.x + (i === 0 ? -12 : 12),
          y: boss.y + (i === 0 ? -8 : 8),
          hp: Math.round(escort.baseHp * this.level.enemyStatScale.hpMultiplier),
          maxHp: Math.round(escort.baseHp * this.level.enemyStatScale.hpMultiplier),
          shield: 0,
          maxShield: 0,
          armor: escort.armor,
          magicResist: escort.magicResist,
          speed: escort.speed * this.level.enemyStatScale.speedMultiplier * WORLD_SCALE,
          coinReward: Math.round(escort.coinReward * 0.6),
          castleDamage: 1,
          isFlying: escort.isFlying,
          isBoss: false,
          regenPerSec: escort.regenPerSec ?? 0,
          poisonResistant: Boolean(escort.poisonResistant),
          dodgeChance: escort.dodgeChance ?? 0,
          attackLungeTimer: 0.25,
          bodyColor: escort.bodyColor,
          accentColor: escort.accentColor,
          size: escort.size,
          slowTimer: 0,
          slowFactor: 0,
          poisonTimer: 0,
          poisonDps: 0,
          burnTimer: 0,
          burnDps: 0,
          phaseIndex: 99,
          abilityCooldown: 5.5,
          sciFiAbility: escort.sciFiAbility,
          airWaypoints: escortAir,
          flyAltitude: escort.isFlying ? 24 : 0,
          stealthTimer: 0,
          dashTimer: 0,
          speedBoostTimer: 0,
          walkPhase: 0,
        });
      }
    } else if (ability === 'meteor_aura') {
      boss.shield += Math.round(boss.maxHp * 0.12);
      for (const t of this.towers) {
        if (Math.hypot(t.x - boss.x, t.y - boss.y) <= 170) {
          t.jammedTimer = Math.max(t.jammedTimer, 1.8);
        }
      }
    }
  }

  private pickTargetForTower(
    tower: PlacedTowerState,
    stats: TowerEffectiveStats
  ): TowerTarget | null {
    const def = WEAPON_MAP[tower.weaponId];
    const hasTrueSight =
      def.id === 'sky_hunter' ||
      def.id === 'plasma_air_defense' ||
      def.id === 'crystal_laser' ||
      (def.id === 'titan_plasma_cannon' && tower.pathChoices.C >= 2);

    const liveNestsInRange = stats.canTargetGround
      ? this.spiderNests.filter(
          (n) =>
            !n.destroyed &&
            Math.hypot(n.x - tower.x, n.y - tower.y) <= stats.range + n.size * 0.5
        )
      : [];

    // If player explicitly focused a live Spider Nest within tower range, prioritize it!
    if (this.focusedNestId) {
      const focusedNest = liveNestsInRange.find((n) => n.id === this.focusedNestId);
      if (focusedNest) {
        return { kind: 'nest', nest: focusedNest, x: focusedNest.x, y: focusedNest.y };
      }
    }

    const inRange = this.enemies.filter((e) => {
      if (e.hp <= 0) return false;
      if (e.isFlying && !stats.canTargetFlying) return false;
      if (!e.isFlying && !stats.canTargetGround) return false;
      const d = Math.hypot(e.x - tower.x, e.y - tower.y);
      if (e.stealthTimer > 0 && !hasTrueSight && d > stats.range * 0.62) return false;
      return d <= stats.range + e.size * 0.4;
    });

    if (inRange.length === 0) {
      if (liveNestsInRange.length > 0) {
        const chosenNest = liveNestsInRange.reduce((best, cur) =>
          cur.hp < best.hp ? cur : best
        );
        return { kind: 'nest', nest: chosenNest, x: chosenNest.x, y: chosenNest.y };
      }
      return null;
    }

    let picked: ActiveEnemyState;
    if (tower.targeting === 'strongest') {
      picked = inRange.reduce((best, cur) =>
        cur.hp + cur.shield > best.hp + best.shield ? cur : best
      );
    } else if (tower.targeting === 'fastest') {
      picked = inRange.reduce((best, cur) => (cur.speed > best.speed ? cur : best));
    } else if (tower.targeting === 'flying_priority') {
      const flyers = inRange.filter((e) => e.isFlying);
      const pool = flyers.length > 0 ? flyers : inRange;
      picked = pool.reduce((best, cur) =>
        cur.distanceTraveled > best.distanceTraveled ? cur : best
      );
    } else if (tower.targeting === 'ground_priority') {
      const ground = inRange.filter((e) => !e.isFlying);
      const pool = ground.length > 0 ? ground : inRange;
      picked = pool.reduce((best, cur) =>
        cur.distanceTraveled > best.distanceTraveled ? cur : best
      );
    } else if (tower.targeting === 'area') {
      let bestEnemy = inRange[0];
      let bestScore = -1;
      for (const cand of inRange) {
        let cluster = 0;
        for (const other of inRange) {
          if (Math.hypot(other.x - cand.x, other.y - cand.y) <= Math.max(40, stats.splashRadius)) {
            cluster++;
          }
        }
        const score = cluster * 1000 + cand.distanceTraveled;
        if (score > bestScore) {
          bestScore = score;
          bestEnemy = cand;
        }
      }
      picked = bestEnemy;
    } else {
      picked = inRange.reduce((best, cur) =>
        cur.distanceTraveled > best.distanceTraveled ? cur : best
      );
    }

    return { kind: 'enemy', enemy: picked, x: picked.x, y: picked.y };
  }

  private fireTowerAtTarget(
    tower: PlacedTowerState,
    stats: TowerEffectiveStats,
    target: TowerTarget
  ) {
    const def = WEAPON_MAP[tower.weaponId];
    const upgradeTier =
      tower.pathChoices.A + tower.pathChoices.B + tower.pathChoices.C;
    dkAudio.playWeaponShot(tower.weaponId);

    if (def.projectileType === 'lightning') {
      const hitIds = new Set<string>();
      const arcOriginX = tower.x + Math.cos(tower.angle) * 6;
      const arcOriginY = tower.y - 46 + Math.sin(tower.angle) * 4;
      const arcPoints: { x: number; y: number }[] = [{ x: arcOriginX, y: arcOriginY }];
      const maxJumps = Math.max(1, stats.chainCount);

      if (target.kind === 'nest') {
        arcPoints.push({ x: target.nest.x, y: target.nest.y - 6 });
        this.applyDamageToNest(target.nest, stats.damage, stats.armorPierce, true, tower);
        let prevX = target.nest.x;
        let prevY = target.nest.y;
        let current = this.enemies
          .filter(
            (e) =>
              e.hp > 0 &&
              (!e.isFlying || stats.canTargetFlying) &&
              (e.isFlying || stats.canTargetGround) &&
              Math.hypot(e.x - prevX, e.y - prevY) <= 132 * WORLD_SCALE
          )
          .sort(
            (a, b) =>
              Math.hypot(a.x - prevX, a.y - prevY) - Math.hypot(b.x - prevX, b.y - prevY)
          )[0];

        for (let i = 1; i < maxJumps && current; i++) {
          hitIds.add(current.instanceId);
          const targetVisualY = current.y - (current.flyAltitude ?? 0) * 0.72;
          arcPoints.push({ x: current.x, y: targetVisualY });
          const dmgScale = Math.pow(0.84, i);
          const killed = this.applyDamageToEnemy(
            current,
            stats.damage * dmgScale,
            stats.armorPierce,
            true
          );
          if (killed) tower.kills += 1;
          prevX = current.x;
          prevY = current.y;
          current = this.enemies
            .filter(
              (e) =>
                e.hp > 0 &&
                (!e.isFlying || stats.canTargetFlying) &&
                (e.isFlying || stats.canTargetGround) &&
                !hitIds.has(e.instanceId) &&
                Math.hypot(e.x - prevX, e.y - prevY) <= 132 * WORLD_SCALE
            )
            .sort(
              (a, b) =>
                Math.hypot(a.x - prevX, a.y - prevY) - Math.hypot(b.x - prevX, b.y - prevY)
            )[0];
        }
      } else {
        let current: ActiveEnemyState | undefined = target.enemy;
        for (let i = 0; i < maxJumps && current; i++) {
          hitIds.add(current.instanceId);
          const targetVisualY = current.y - (current.flyAltitude ?? 0) * 0.72;
          arcPoints.push({ x: current.x, y: targetVisualY });
          const dmgScale = Math.pow(0.84, i);
          const killed = this.applyDamageToEnemy(
            current,
            stats.damage * dmgScale,
            stats.armorPierce,
            true
          );
          if (killed) tower.kills += 1;

          const prev: ActiveEnemyState = current;
          current = this.enemies
            .filter(
              (e) =>
                e.hp > 0 &&
                (!e.isFlying || stats.canTargetFlying) &&
                (e.isFlying || stats.canTargetGround) &&
                !hitIds.has(e.instanceId) &&
                Math.hypot(e.x - prev.x, e.y - prev.y) <= 132 * WORLD_SCALE
            )
            .sort(
              (a, b) =>
                Math.hypot(a.x - prev.x, a.y - prev.y) - Math.hypot(b.x - prev.x, b.y - prev.y)
            )[0];
        }
      }

      this.beams.push({
        points: arcPoints,
        color: def.accentColor,
        width: 2.8 + Math.min(2.2, upgradeTier * 0.25),
        life: 0.16,
        maxLife: 0.16,
        kind: 'beam',
        style: 'lightning',
      });
      return;
    }

    if (def.projectileType === 'laser_beam') {
      if (target.kind === 'nest') {
        this.applyDamageToNest(target.nest, stats.damage, stats.armorPierce, true, tower);
        this.beams.push({
          points: [
            { x: tower.x, y: tower.y - 34 },
            { x: target.nest.x, y: target.nest.y - 8 },
          ],
          color: def.accentColor,
          width: 3.6 + Math.min(2.6, upgradeTier * 0.3),
          life: 0.14,
          maxLife: 0.14,
          kind: 'beam',
          style: 'laser',
        });
      } else {
        const killed = this.applyDamageToEnemy(target.enemy, stats.damage, stats.armorPierce, true);
        if (killed) tower.kills += 1;
        this.beams.push({
          points: [
            { x: tower.x, y: tower.y - 34 },
            { x: target.enemy.x, y: target.enemy.y - (target.enemy.flyAltitude ?? 0) * 0.72 },
          ],
          color: def.accentColor,
          width: 3.6 + Math.min(2.6, upgradeTier * 0.3),
          life: 0.14,
          maxLife: 0.14,
          kind: 'beam',
          style: 'laser',
        });
      }
      return;
    }

    if (def.projectileType === 'shockwave') {
      const radius = Math.max(stats.splashRadius, stats.range * 0.72);
      for (const e of this.enemies) {
        if (e.hp <= 0) continue;
        if (Math.hypot(e.x - tower.x, e.y - tower.y) <= radius) {
          const killed = this.applyDamageToEnemy(e, stats.damage, stats.armorPierce, false);
          if (killed) tower.kills += 1;
          if (stats.slowFactor > 0) {
            e.slowFactor = Math.max(e.slowFactor, stats.slowFactor);
            e.slowTimer = Math.max(e.slowTimer, stats.slowDuration);
          }
        }
      }
      if (stats.canTargetGround) {
        for (const nest of this.spiderNests) {
          if (nest.destroyed) continue;
          if (Math.hypot(nest.x - tower.x, nest.y - tower.y) <= radius + nest.size * 0.5) {
            this.applyDamageToNest(nest, stats.damage, stats.armorPierce, false, tower);
          }
        }
      }
      this.beams.push({
        points: [{ x: tower.x, y: tower.y }],
        color: def.accentColor,
        width: 3.4 + Math.min(2.4, upgradeTier * 0.28),
        life: 0.25,
        maxLife: 0.25,
        kind: 'shockwave',
        radius,
      });
      return;
    }

    const dx = target.x - tower.x;
    const dy = target.y - tower.y;
    const dist = Math.max(1, Math.hypot(dx, dy));
    const projSpeed = def.projectileSpeed * WORLD_SCALE;

    this.projectiles.push({
      id: this.nextId('proj'),
      weaponId: tower.weaponId,
      projectileType: def.projectileType,
      x: tower.x,
      y: tower.y - 14,
      vx: (dx / dist) * projSpeed,
      vy: (dy / dist) * projSpeed,
      targetInstanceId: target.kind === 'enemy' ? target.enemy.instanceId : '',
      targetNestId: target.kind === 'nest' ? target.nest.id : undefined,
      targetX: target.x,
      targetY: target.y,
      speed: projSpeed,
      damage: stats.damage,
      splashRadius: stats.splashRadius,
      armorPierce: stats.armorPierce,
      slowFactor: stats.slowFactor,
      slowDuration: stats.slowDuration,
      poisonDps: stats.poisonDps,
      poisonDuration: stats.poisonDuration,
      burnDps: stats.burnDps,
      burnDuration: stats.burnDuration,
      color: def.primaryColor,
      accentColor: def.accentColor,
      towerId: tower.instanceId,
      upgradeTier,
      canHitFlying: stats.canTargetFlying,
      canHitGround: stats.canTargetGround,
    });
  }

  private resolveProjectileImpact(
    proj: ActiveProjectile,
    directTarget?: ActiveEnemyState,
    directNest?: ActiveSpiderNestState
  ) {
    const tower = this.towers.find((t) => t.instanceId === proj.towerId);
    const isMagic =
      proj.projectileType === 'frost_bolt' ||
      proj.projectileType === 'poison_vial' ||
      proj.projectileType === 'storm_sphere';

    if (proj.splashRadius > 0) {
      const canHitFlying = proj.canHitFlying;
      const canHitGround = proj.canHitGround;
      for (const e of this.enemies) {
        if (e.hp <= 0) continue;
        if (e.isFlying && !canHitFlying) continue;
        if (!e.isFlying && !canHitGround) continue;
        const d = Math.hypot(e.x - proj.targetX, e.y - proj.targetY);
        if (d <= proj.splashRadius + e.size * 0.4) {
          const falloff = d <= proj.splashRadius * 0.45 ? 1 : 0.72;
          const shieldBonus = proj.projectileType === 'storm_sphere' && e.shield > 0 ? 1.65 : 1;
          const killed = this.applyDamageToEnemy(
            e,
            proj.damage * falloff * shieldBonus,
            proj.armorPierce,
            isMagic,
            proj.projectileType === 'cannonball' || proj.projectileType === 'titan_plasma'
          );
          if (killed && tower) tower.kills += 1;
          this.applyStatusEffects(e, proj);
        }
      }

      if (canHitGround) {
        for (const nest of this.spiderNests) {
          if (nest.destroyed) continue;
          const d = Math.hypot(nest.x - proj.targetX, nest.y - proj.targetY);
          if (d <= proj.splashRadius + nest.size * 0.55) {
            const falloff = d <= proj.splashRadius * 0.5 ? 1 : 0.75;
            this.applyDamageToNest(
              nest,
              proj.damage * falloff,
              proj.armorPierce,
              isMagic,
              tower
            );
          }
        }
      }

      if (proj.projectileType === 'titan_plasma') {
        this.beams.push({
          points: [{ x: proj.targetX, y: proj.targetY }],
          color: '#38bdf8',
          width: 3.6,
          life: 0.28,
          maxLife: 0.28,
          kind: 'shockwave',
          radius: Math.max(38, proj.splashRadius),
        });
        this.spawnBurst(proj.targetX, proj.targetY, '#67e8f9', this.graphics.particles === 'high' ? 12 : 7);
      } else {
        this.spawnBurst(proj.targetX, proj.targetY, proj.accentColor, 8);
      }
    } else if (directTarget && directTarget.hp > 0) {
      const shieldBonus = proj.projectileType === 'storm_sphere' && directTarget.shield > 0 ? 1.65 : 1;
      const killed = this.applyDamageToEnemy(
        directTarget,
        proj.damage * shieldBonus,
        proj.armorPierce,
        isMagic,
        true
      );
      if (killed && tower) tower.kills += 1;
      this.applyStatusEffects(directTarget, proj);
      this.spawnBurst(proj.targetX, proj.targetY, proj.accentColor, 5);
    } else if (directNest && !directNest.destroyed && proj.canHitGround) {
      this.applyDamageToNest(directNest, proj.damage, proj.armorPierce, isMagic, tower);
      this.spawnBurst(proj.targetX, proj.targetY, proj.accentColor, 6);
    }
  }

  public applyDamageToNest(
    nest: ActiveSpiderNestState,
    rawDamage: number,
    armorPierce: number,
    isMagic: boolean,
    tower?: PlacedTowerState
  ): boolean {
    if (nest.destroyed || nest.hp <= 0) return false;
    const effectiveArmor = nest.armor * (1 - Math.min(1, Math.max(0, armorPierce)));
    const finalDamage = Math.max(1, Math.round(rawDamage - effectiveArmor * 0.45));
    nest.hp = Math.max(0, nest.hp - finalDamage);
    nest.hitFlash = 0.16;

    this.spawnBurst(
      nest.x + (Math.random() * 14 - 7),
      nest.y - 6 + (Math.random() * 10 - 5),
      isMagic ? '#67e8f9' : '#fca5a5',
      3
    );

    if (this.graphics.showDamageNumbers && finalDamage >= 4) {
      this.spawnFloatingText(
        nest.x + (Math.random() * 12 - 6),
        nest.y - nest.size - 8,
        `${finalDamage}`,
        isMagic ? '#67e8f9' : '#fde68a'
      );
    }

    if (nest.hp <= 0) {
      nest.hp = 0;
      nest.destroyed = true;
      nest.destroyAnimTimer = 1.15;
      nest.spawnsRemaining = 0;
      if (this.focusedNestId === nest.id) {
        this.focusedNestId = null;
      }
      if (this.selectedNestId === nest.id) {
        this.selectedNestId = null;
      }

      // Immediately cancel any remaining queued spider spawns from this path if no live nest remains there
      const hasOtherLiveNestOnPath = this.spiderNests.some(
        (other) => !other.destroyed && other.pathIndex === nest.pathIndex
      );
      if (!hasOtherLiveNestOnPath) {
        this.pendingSpawns = this.pendingSpawns.filter(
          (ps) => !(ps.pathIndex === nest.pathIndex && SPIDER_ENEMY_IDS.has(ps.enemyId))
        );
      }

      this.coins += nest.coinReward;
      this.score += nest.coinReward * 12;
      if (tower) {
        tower.kills += 1;
      }
      this.beams.push({
        points: [{ x: nest.x, y: nest.y }],
        color: '#a3e635',
        width: 4.5,
        life: 0.45,
        maxLife: 0.45,
        kind: 'shockwave',
        radius: 105,
      });
      this.spawnBurst(nest.x, nest.y, '#a3e635', 22);
      this.spawnBurst(nest.x, nest.y, '#f43f5e', 14);
      this.spawnBurst(nest.x, nest.y, '#fde047', 10);
      this.spawnFloatingText(
        nest.x,
        nest.y - 34,
        `මකුළු ගුල විනාශයි! +${nest.coinReward} කාසි`,
        '#a3e635'
      );
      this.waveAnnouncement = `${nest.label} විනාශ කරන ලදී! මකුළු පැටවුන් බිහිවීම නැවතුණි!`;
      this.announcementTimer = 2.6;
      dkAudio.playEnemyDefeat(true);
      this.emitSnapshot();
      return true;
    }
    return false;
  }

  private applyStatusEffects(enemy: ActiveEnemyState, proj: ActiveProjectile) {
    if (enemy.hp <= 0) return;
    if (proj.slowFactor > 0) {
      enemy.slowFactor = Math.max(enemy.slowFactor, proj.slowFactor);
      enemy.slowTimer = Math.max(enemy.slowTimer, proj.slowDuration);
    }
    if (proj.poisonDps > 0) {
      enemy.poisonDps = Math.max(enemy.poisonDps, proj.poisonDps);
      enemy.poisonTimer = Math.max(enemy.poisonTimer, proj.poisonDuration);
    }
    if (proj.burnDps > 0) {
      enemy.burnDps = Math.max(enemy.burnDps, proj.burnDps);
      enemy.burnTimer = Math.max(enemy.burnTimer, proj.burnDuration);
    }
  }

  public applyDamageToEnemy(
    enemy: ActiveEnemyState,
    rawDamage: number,
    armorPierce: number,
    isMagic: boolean,
    canDodge = false
  ): boolean {
    if (enemy.hp <= 0) return false;
    const visualRadius = getCanonicalMonsterRadius(enemy.enemyClass, enemy.isBoss, enemy.size);

    if (canDodge && enemy.dodgeChance > 0 && enemy.slowTimer <= 0 && Math.random() < enemy.dodgeChance) {
      enemy.attackLungeTimer = 0.28;
      this.spawnFloatingText(enemy.x, enemy.y - visualRadius * 1.15, 'මඟ හැරියා!', '#38bdf8');
      return false;
    }

    const effectiveArmor = enemy.armor * (1 - Math.min(1, Math.max(0, armorPierce)));
    const magicMult = isMagic ? 1 - Math.min(0.7, enemy.magicResist) : 1;
    const finalDamage = Math.max(1, Math.round((rawDamage - effectiveArmor * 0.45) * magicMult));

    let remaining = finalDamage;
    const hadShield = enemy.shield > 0;
    if (hadShield) {
      const absorbed = Math.min(enemy.shield, remaining);
      enemy.shield -= absorbed;
      remaining -= absorbed;
      this.spawnBurst(enemy.x, enemy.y - visualRadius * 0.2, '#38bdf8', 4);
    } else if (enemy.armor >= 18) {
      this.spawnBurst(enemy.x, enemy.y - visualRadius * 0.15, '#fde68a', 3);
    }
    enemy.hp = Math.max(0, enemy.hp - remaining);
    enemy.hitFlash = 0.14;

    if (this.graphics.showDamageNumbers && remaining >= 6) {
      this.spawnFloatingText(
        enemy.x + (Math.random() * 10 - 5),
        enemy.y - visualRadius * 1.05,
        `${remaining}`,
        isMagic ? '#67e8f9' : '#f8fafc'
      );
    }

    if (enemy.hp <= 0) {
      this.coins += enemy.coinReward;
      this.score += enemy.coinReward * 10 + (enemy.isBoss ? 1000 : 25);
      this.kills += 1;
      if (enemy.isBoss) this.bossesKilledInLevel += 1;
      if (this.defeatedEffects.length < 30) {
        this.defeatedEffects.push({
          x: enemy.x,
          y: enemy.y,
          enemyId: enemy.enemyId,
          isBoss: enemy.isBoss,
          bodyColor: enemy.bodyColor,
          accentColor: enemy.accentColor,
          size: visualRadius,
          life: 0.45,
          maxLife: 0.45,
        });
      }
      if (this.coinDrops.length < 40) {
        this.coinDrops.push({
          x: enemy.x,
          y: enemy.y,
          startY: enemy.y,
          amount: enemy.coinReward,
          life: 0.75,
          maxLife: 0.75,
        });
      }
      this.spawnFloatingText(
        enemy.x,
        enemy.y - Math.max(26, visualRadius * 0.9),
        `+${enemy.coinReward} කාසි`,
        '#fde047'
      );
      this.spawnBurst(enemy.x, enemy.y, enemy.accentColor, enemy.isBoss ? 24 : 12);
      dkAudio.playEnemyDefeat(enemy.isBoss);
      return true;
    }
    return false;
  }

  private spawnBurst(x: number, y: number, color: string, count: number) {
    const cap = this.graphics.particles === 'low' ? 75 : 220;
    const actualCount = this.graphics.particles === 'low' ? Math.ceil(count * 0.45) : count;
    if (this.particles.length >= cap) return;

    for (let i = 0; i < actualCount; i++) {
      const angle = (Math.PI * 2 * i) / actualCount + Math.random() * 0.4;
      const spd = 35 + Math.random() * 85;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd,
        color,
        size: 2 + Math.random() * 2.5,
        life: 0.3 + Math.random() * 0.25,
        maxLife: 0.55,
      });
    }
  }

  private spawnFloatingText(x: number, y: number, text: string, color: string) {
    if (this.floatingTexts.length > 55) {
      this.floatingTexts.shift();
    }
    this.floatingTexts.push({
      x,
      y,
      text,
      color,
      life: 0.85,
      maxLife: 0.85,
    });
  }

  public getSnapshot(): BattleSnapshot {
    const activeBossEnemy = this.enemies.find((e) => e.isBoss);
    const bossPhaseName =
      activeBossEnemy && this.level.bossConfig
        ? this.level.bossConfig.phases[Math.max(0, activeBossEnemy.phaseIndex - 1)]?.name ??
          'පළමු අදියර'
        : '';

    return {
      status: this.status,
      levelId: this.level.id,
      castleHp: this.castleHp,
      maxCastleHp: this.maxCastleHp,
      castleDamageFlash: this.castleDamageFlash,
      coins: this.coins,
      score: this.score,
      currentWave: this.currentWave,
      totalWaves: this.level.waveCount,
      waveCountdown: Math.max(0, this.waveCountdown),
      waveAnnouncement: this.announcementTimer > 0 ? this.waveAnnouncement : null,
      enemiesRemaining: this.enemies.length + this.pendingSpawns.length,
      kills: this.kills,
      leaks: this.leaks,
      towersBuilt: this.towers.length,
      enemySpeedMultiplier: this.enemySpeedMultiplier,
      activeBoss: activeBossEnemy
        ? {
            name: activeBossEnemy.name,
            title: this.level.bossConfig?.title ?? 'ලෝක ප්‍රධාන රාක්ෂයා',
            hp: activeBossEnemy.hp,
            maxHp: activeBossEnemy.maxHp,
            phaseName: bossPhaseName,
          }
        : null,
      spiderNests: this.spiderNests.map((n) => ({ ...n })),
      selectedZoneId: this.selectedZoneId,
      previewWeaponId: this.previewWeaponId,
      pendingWeaponToBuild: this.pendingWeaponToBuild,
      selectedTower: this.towers.find((t) => t.instanceId === this.selectedTowerId) ?? null,
      selectedEnemy: this.enemies.find((e) => e.instanceId === this.selectedEnemyId) ?? null,
      selectedNest: this.spiderNests.find((n) => n.id === this.selectedNestId) ?? null,
      focusedNestId: this.focusedNestId,
      specialCharges: { ...this.specialCharges },
    };
  }

  private emitSnapshot() {
    this.onStatusChange?.(this.getSnapshot());
  }

  public renderWithViewport(ctx: CanvasRenderingContext2D, vt: ViewportTransform) {
    this.renderer.render(ctx, vt, {
      level: this.level,
      status: this.status,
      elapsedTime: this.elapsedTime,
      castleHp: this.castleHp,
      maxCastleHp: this.maxCastleHp,
      castleDamageFlash: this.castleDamageFlash,
      castleShakeTimer: this.castleShakeTimer,
      coins: this.coins,
      towers: this.towers,
      enemies: this.enemies,
      spiderNests: this.spiderNests,
      activeDrones: this.activeDrones,
      defeatedEffects: this.defeatedEffects,
      projectiles: this.projectiles,
      beams: this.beams,
      particles: this.particles,
      coinDrops: this.coinDrops,
      floatingTexts: this.floatingTexts,
      selectedZoneId: this.selectedZoneId,
      previewWeaponId: this.previewWeaponId,
      pendingWeaponToBuild: this.pendingWeaponToBuild,
      selectedTowerId: this.selectedTowerId,
      selectedEnemyId: this.selectedEnemyId,
      selectedNestId: this.selectedNestId,
      focusedNestId: this.focusedNestId,
      showRangeAlways: this.graphics.showRangeAlways,
      getTowerRange: (t) => getTowerEffectiveStats(t, this.level).range,
      getPreviewRange: (wId) => getPreviewWeaponRange(wId, this.level),
      getWeaponCost: (wId) => getWeaponCostForLevel(this.level, wId),
    });
  }

  public render(ctx: CanvasRenderingContext2D) {
    this.renderWithViewport(ctx, {
      scale: 1,
      offsetX: 0,
      offsetY: 0,
      viewW: MAP_WIDTH,
      viewH: MAP_HEIGHT,
    });
  }
}
