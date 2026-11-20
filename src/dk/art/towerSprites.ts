import { ActiveDroneState, PlacedTowerState, WeaponId } from '../types';
import {
  drawGlowBloom,
  fillShadedEllipse,
  fillShadedPoly,
} from './artPrimitives';

function getUpgradeStage(tower: PlacedTowerState): 1 | 2 | 3 {
  const totalTier = tower.pathChoices.A + tower.pathChoices.B + tower.pathChoices.C;
  if (totalTier >= 4) return 3;
  if (totalTier >= 1) return 2;
  return 1;
}

function getDominantUpgradePath(tower: PlacedTowerState): 'A' | 'B' | 'C' | null {
  const { A, B, C } = tower.pathChoices;
  if (A === 0 && B === 0 && C === 0) return null;
  if (A >= B && A >= C) return 'A';
  if (B >= A && B >= C) return 'B';
  return 'C';
}

function drawArmoredTechBase(
  ctx: CanvasRenderingContext2D,
  stage: 1 | 2 | 3,
  hullTop: string,
  hullBot: string,
  accentGlow: string,
  trimMetal: string
) {
  const wScale = stage === 3 ? 1.18 : stage === 2 ? 1.09 : 1.0;

  // Heavy ground drop shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.48)';
  ctx.beginPath();
  ctx.ellipse(2, 16, 36 * wScale, 22 * wScale, 0, 0, Math.PI * 2);
  ctx.fill();

  // Four hydraulic outrigger stabilizer legs (visible even at Level 1, beefier at 2 & 3)
  const legAngles = [0.65, 2.49, 3.79, 5.63];
  for (const ang of legAngles) {
    const ix = Math.cos(ang) * 19 * wScale;
    const iy = Math.sin(ang) * 12 * wScale + 4;
    const ox = Math.cos(ang) * 33 * wScale;
    const oy = Math.sin(ang) * 20 * wScale + 7;
    ctx.strokeStyle = '#090d16';
    ctx.lineWidth = stage === 3 ? 8.5 : 6.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(ix, iy);
    ctx.lineTo(ox, oy);
    ctx.stroke();

    ctx.strokeStyle = trimMetal;
    ctx.lineWidth = stage === 3 ? 5 : 3.5;
    ctx.stroke();

    // Footpad bolt
    fillShadedEllipse(ctx, ox, oy, 4.5, 3.2, trimMetal, '#1e293b', '#090d16', 1.3);
  }

  // Octagonal beveled steel/obsidian platform
  const pts: [number, number][] = [];
  for (let i = 0; i < 8; i++) {
    const a = (Math.PI * 2 * i) / 8 + Math.PI / 8;
    pts.push([Math.cos(a) * 28 * wScale, Math.sin(a) * 18 * wScale + 4]);
  }
  fillShadedPoly(ctx, pts, hullTop, hullBot, '#090d16', 2.2);

  // Upper turret ring collar
  fillShadedEllipse(
    ctx,
    0,
    -2,
    22 * wScale,
    14 * wScale,
    trimMetal,
    hullBot,
    '#090d16',
    1.8
  );

  // Glowing power conduits on front & flanks
  ctx.fillStyle = accentGlow;
  ctx.beginPath();
  ctx.roundRect(-8 * wScale, 7, 16 * wScale, 3.8, 2);
  ctx.fill();

  if (stage >= 2) {
    // Side armor fins / cooling vents
    for (const dir of [-1, 1] as const) {
      fillShadedPoly(
        ctx,
        [
          [dir * 18 * wScale, -5],
          [dir * 29 * wScale, -9],
          [dir * 27 * wScale, 4],
          [dir * 17 * wScale, 6],
        ],
        trimMetal,
        hullBot,
        '#090d16',
        1.5
      );
      ctx.fillStyle = accentGlow;
      ctx.fillRect(dir * 22 * wScale - (dir === -1 ? 4 : 0), -4, 4, 5);
    }
  }

  if (stage === 3) {
    // Stage 3 overdrive energy floor halo
    ctx.strokeStyle = accentGlow;
    ctx.lineWidth = 2.2;
    ctx.globalAlpha = 0.72;
    ctx.beginPath();
    ctx.ellipse(0, 4, 34 * wScale, 21 * wScale, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
}

export function drawIllustratedTower(
  ctx: CanvasRenderingContext2D,
  tower: PlacedTowerState,
  selected: boolean,
  t: number,
  previewAlpha = 1
) {
  const stage = getUpgradeStage(tower);
  const totalTier = tower.pathChoices.A + tower.pathChoices.B + tower.pathChoices.C;
  const dominantPath = getDominantUpgradePath(tower);

  // Charge-up shimmer right before firing
  const chargeGlow =
    previewAlpha === 1 && tower.cooldown > 0 && tower.cooldown < 0.28 && tower.recoil < 0.2
      ? 1 - tower.cooldown / 0.28
      : 0;

  ctx.save();
  ctx.translate(tower.x, tower.y);
  ctx.globalAlpha = previewAlpha;

  if (selected) {
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 2.8;
    ctx.beginPath();
    ctx.ellipse(0, 7, 42, 27, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  if (stage === 3 && previewAlpha === 1) {
    drawGlowBloom(ctx, 0, -8, 48, '#fbbf24', 0.18 + Math.sin(t * 4) * 0.06);
  }

  const masterScale = stage === 3 ? 1.22 : stage === 2 ? 1.15 : 1.08;
  ctx.save();
  ctx.scale(masterScale, masterScale);
  drawFuturisticTowerRig(
    ctx,
    tower.weaponId,
    stage,
    tower.angle,
    tower.recoil,
    chargeGlow,
    t,
    tower.pathChoices.C >= 2
  );
  ctx.restore();

  // Stage & Upgrade Star Badge
  if (previewAlpha === 1 && (totalTier > 0 || selected)) {
    const label = totalTier > 0 ? `LV${stage} · ★${totalTier}${dominantPath ?? ''}` : 'LV1';
    const badgeW = totalTier > 0 ? 52 : 30;
    ctx.fillStyle = stage === 3 ? 'rgba(69, 26, 3, 0.94)' : 'rgba(9, 13, 22, 0.92)';
    ctx.strokeStyle = stage === 3 ? '#fde047' : stage === 2 ? '#38bdf8' : '#94a3b8';
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.roundRect(-badgeW * 0.5, 22, badgeW, 14, 4);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = stage === 3 ? '#fef08a' : stage === 2 ? '#bae6fd' : '#e2e8f0';
    ctx.font = 'bold 9.5px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(label, 0, 32);
  }

  if (tower.jammedTimer > 0 && previewAlpha === 1) {
    ctx.strokeStyle = '#f43f5e';
    ctx.lineWidth = 3.4;
    ctx.beginPath();
    ctx.moveTo(-18, -26);
    ctx.lineTo(18, 10);
    ctx.moveTo(18, -26);
    ctx.lineTo(-18, 10);
    ctx.stroke();
  }

  ctx.restore();
}

export function drawTowerPlacementPreview(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  weaponId: WeaponId,
  range: number,
  affordable: boolean,
  t: number
) {
  ctx.save();

  ctx.fillStyle = affordable ? 'rgba(56, 189, 248, 0.14)' : 'rgba(248, 113, 113, 0.14)';
  ctx.strokeStyle = affordable ? 'rgba(125, 211, 252, 0.92)' : 'rgba(248, 113, 113, 0.92)';
  ctx.lineWidth = 2.4;
  ctx.setLineDash([8, 6]);
  ctx.beginPath();
  ctx.arc(x, y, range, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.setLineDash([]);

  drawIllustratedTower(
    ctx,
    {
      instanceId: 'preview',
      zoneId: 'preview',
      weaponId,
      x,
      y,
      pathChoices: { A: 0, B: 0, C: 0 },
      totalInvested: 0,
      targeting: 'first',
      kills: 0,
      cooldown: 0,
      angle: -0.35,
      recoil: 0,
      jammedTimer: 0,
    },
    true,
    t,
    0.86
  );

  ctx.restore();
}

function drawFuturisticTowerRig(
  ctx: CanvasRenderingContext2D,
  weaponId: WeaponId,
  stage: 1 | 2 | 3,
  angle: number,
  recoil: number,
  chargeGlow: number,
  t: number,
  airUnlocked = false
) {
  const kick = -recoil * 6.5;

  switch (weaponId) {
    // A. PLASMA GUN TURRET (shadow_archer)
    case 'shadow_archer': {
      const plasmaGlow = stage === 3 ? '#38bdf8' : stage === 2 ? '#22d3ee' : '#06b6d4';
      drawArmoredTechBase(ctx, stage, '#475569', '#1e293b', plasmaGlow, '#94a3b8');

      ctx.save();
      ctx.translate(0, -10);
      ctx.rotate(angle);

      // Armored Rotating Turret Housing
      fillShadedPoly(
        ctx,
        [
          [-18, -12],
          [10, -14],
          [16, -7],
          [16, 7],
          [10, 14],
          [-18, 12],
          [-22, 0],
        ],
        '#64748b',
        '#1e293b',
        '#090d16',
        2
      );

      // Rear Plasma Reactor Battery Pack
      fillShadedPoly(
        ctx,
        [
          [-22, -8],
          [-13, -8],
          [-13, 8],
          [-22, 8],
        ],
        '#0ea5e9',
        '#0369a1',
        '#090d16',
        1.5
      );

      // Barrels: Stage 1 = Dual Magnetic Rail, Stage 2 = Heavy Twin Autocannon, Stage 3 = Quad Overdrive Array
      const offsets =
        stage === 3 ? [-8, -3, 3, 8] : stage === 2 ? [-5.5, 5.5] : [-3.8, 3.8];
      const barrelLen = stage === 3 ? 34 : stage === 2 ? 31 : 27;

      for (const oy of offsets) {
        fillShadedPoly(
          ctx,
          [
            [6 + kick, oy - 2.3],
            [barrelLen + kick, oy - 1.8],
            [barrelLen + kick, oy + 1.8],
            [6 + kick, oy + 2.3],
          ],
          '#cbd5e1',
          '#334155',
          '#090d16',
          1.3
        );
        // Glowing plasma accelerator groove
        ctx.fillStyle = plasmaGlow;
        ctx.fillRect(10 + kick, oy - 0.8, barrelLen - 13, 1.6);
      }

      // Central Energy Core Dome + Pre-Fire Charge Bloom
      drawGlowBloom(ctx, -2, 0, 12 + stage * 3 + chargeGlow * 8, plasmaGlow, 0.45 + chargeGlow * 0.4);
      fillShadedEllipse(ctx, -2, 0, 7.5 + stage, 6.5 + stage * 0.6, '#e0f2fe', plasmaGlow, '#090d16', 1.6);

      // Muzzle Flash
      if (recoil > 0.55) {
        drawGlowBloom(ctx, barrelLen + 2 + kick, 0, 15, '#7dd3fc', 0.85);
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(barrelLen + 1 + kick, 0, 5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
      break;
    }

    // B. HEAVY CANNON (iron_cannon)
    case 'iron_cannon': {
      const ember = stage === 3 ? '#fb923c' : '#f59e0b';
      drawArmoredTechBase(ctx, stage, '#57534e', '#292524', ember, '#a8a29e');

      // Stacked armored artillery shells on turret deck
      ctx.fillStyle = stage >= 2 ? '#f59e0b' : '#cbd5e1';
      ctx.strokeStyle = '#090d16';
      ctx.lineWidth = 1.2;
      for (const [sx, sy] of [
        [-20, 6],
        [-14, 9],
      ]) {
        ctx.beginPath();
        ctx.arc(sx, sy, 3.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }

      ctx.save();
      ctx.translate(0, -11);
      ctx.rotate(angle);

      // Heavy Cast-Steel Turret Mantle
      fillShadedPoly(
        ctx,
        [
          [-18, -14],
          [12, -13],
          [16, -7],
          [16, 7],
          [12, 13],
          [-18, 14],
        ],
        '#78716c',
        '#292524',
        '#090d16',
        2.1
      );

      // Hydraulic recoil cylinders flanking barrel
      for (const sy of [-10, 10]) {
        fillShadedPoly(
          ctx,
          [
            [-4, sy - 2.5],
            [17, sy - 2.5],
            [17, sy + 2.5],
            [-4, sy + 2.5],
          ],
          '#d6d3d1',
          '#44403c',
          '#090d16',
          1.3
        );
      }

      // Single colossal siege cannon (Stage 1-2) or Twin Heavy Dreadnought Barrels (Stage 3)
      const barrels = stage === 3 ? [-6, 6] : [0];
      const boreH = stage === 3 ? 8.5 : stage === 2 ? 14 : 12;
      const bLen = stage === 3 ? 34 : stage === 2 ? 32 : 28;

      for (const by of barrels) {
        fillShadedPoly(
          ctx,
          [
            [-4 + kick, by - boreH * 0.5],
            [bLen + kick, by - boreH * 0.44],
            [bLen + kick, by + boreH * 0.44],
            [-4 + kick, by + boreH * 0.5],
          ],
          '#44403c',
          '#1c1917',
          '#090d16',
          1.8
        );
        // Brass/Gold Muzzle Brake Ring
        fillShadedPoly(
          ctx,
          [
            [bLen - 7 + kick, by - boreH * 0.58],
            [bLen + 1 + kick, by - boreH * 0.58],
            [bLen + 1 + kick, by + boreH * 0.58],
            [bLen - 7 + kick, by + boreH * 0.58],
          ],
          '#fbbf24',
          '#92400e',
          '#090d16',
          1.4
        );
      }

      // Armor commander hatch + rangefinder optic
      fillShadedEllipse(ctx, -5, 0, 7, 6, '#a8a29e', '#44403c', '#090d16', 1.6);
      if (stage >= 2) {
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(6, -12, 6, 4);
      }

      if (recoil > 0.55) {
        drawGlowBloom(ctx, bLen + 6 + kick, 0, 18, '#fb923c', 0.9);
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.arc(bLen + 4 + kick, 0, 6.5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
      break;
    }

    // C. MISSILE DEFENSE TOWER (fire_dragon)
    case 'fire_dragon': {
      const mGlow = stage === 3 ? '#f43f5e' : '#f97316';
      drawArmoredTechBase(ctx, stage, '#451a03', '#1c1917', mGlow, '#b45309');

      // Rotating Radar Dish behind launcher
      ctx.save();
      ctx.translate(-11, -18);
      ctx.rotate(t * 2.2);
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.arc(0, 0, 8, -Math.PI * 0.4, Math.PI * 0.4);
      ctx.stroke();
      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.arc(3, 0, 2.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      ctx.save();
      ctx.translate(2, -12);
      ctx.rotate(angle);

      // Armored Launcher Pod Frame
      const podW = stage === 3 ? 28 : stage === 2 ? 25 : 22;
      const podH = stage === 3 ? 26 : stage === 2 ? 22 : 18;
      fillShadedPoly(
        ctx,
        [
          [-podW * 0.45 + kick * 0.4, -podH * 0.5],
          [podW * 0.55 + kick * 0.4, -podH * 0.45],
          [podW * 0.55 + kick * 0.4, podH * 0.45],
          [-podW * 0.45 + kick * 0.4, podH * 0.5],
        ],
        '#7f1d1d',
        '#292524',
        '#090d16',
        2
      );

      // Visible Missile Tubes & Glowing Red/Amber Warhead Tips
      const rows = stage === 3 ? [-7, 0, 7] : stage === 2 ? [-5, 5] : [-4, 4];
      const cols = stage >= 2 ? [3, 10] : [6];
      for (const ry of rows) {
        for (const cx of cols) {
          ctx.fillStyle = '#090d16';
          ctx.beginPath();
          ctx.arc(cx + kick * 0.4, ry, 3.4, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#fb923c';
          ctx.beginPath();
          ctx.arc(cx + 1 + kick * 0.4, ry, 2.1, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Side Missile Rack Wings on Stage 2 & 3
      if (stage >= 2) {
        for (const dir of [-1, 1] as const) {
          fillShadedPoly(
            ctx,
            [
              [-6, dir * (podH * 0.5)],
              [10, dir * (podH * 0.5 + 7)],
              [-8, dir * (podH * 0.5 + 7)],
            ],
            '#f59e0b',
            '#78350f',
            '#090d16',
            1.4
          );
        }
      }

      if (recoil > 0.55) {
        drawGlowBloom(ctx, 16, 0, 18, '#fb923c', 0.85);
      }
      ctx.restore();
      break;
    }

    // D. LASER TOWER (crystal_laser)
    case 'crystal_laser': {
      const beamCol = stage === 3 ? '#f0abfc' : '#e879f9';
      drawArmoredTechBase(ctx, stage, '#3b0764', '#1e1b4b', beamCol, '#a855f7');

      // Elevated Energy Pylon Struts
      const topY = -29 - stage * 4;
      fillShadedPoly(
        ctx,
        [
          [-15, -4],
          [-9, topY + 6],
          [9, topY + 6],
          [15, -4],
        ],
        '#6b21a8',
        '#1e1b4b',
        '#090d16',
        1.9
      );

      // Rotating Targeting Gimbal Ring(s)
      ctx.save();
      ctx.translate(0, topY);
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.ellipse(0, 0, 19 + stage * 2, 7.5, t * 1.6, 0, Math.PI * 2);
      ctx.stroke();

      if (stage >= 2) {
        ctx.strokeStyle = beamCol;
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.ellipse(0, 0, 21 + stage * 2, 8.5, -t * 2.1, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Levitating Prism Emitter Crystal aiming at target
      drawGlowBloom(ctx, 0, 0, 18 + stage * 3 + chargeGlow * 10, beamCol, 0.55 + chargeGlow * 0.4);
      ctx.rotate(angle);
      fillShadedPoly(
        ctx,
        [
          [19 + stage * 2, 0],
          [0, -10 - stage],
          [-14, 0],
          [0, 10 + stage],
        ],
        '#f5d0fe',
        '#a21caf',
        '#ffffff',
        1.6
      );

      // Stage 3 Twin Flanking Focus Mirrors
      if (stage === 3) {
        for (const fy of [-13, 13]) {
          fillShadedPoly(
            ctx,
            [
              [10, fy],
              [-4, fy - 3],
              [-4, fy + 3],
            ],
            '#fde047',
            '#b45309',
            '#090d16',
            1.2
          );
        }
      }

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(6, 0, 3.6 + chargeGlow * 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      break;
    }

    // E. TESLA TOWER (thunder_tower)
    case 'thunder_tower': {
      const boltCol = stage === 3 ? '#7dd3fc' : '#fde047';
      drawArmoredTechBase(ctx, stage, '#312e81', '#0f172a', boltCol, '#818cf8');

      const pylonTop = -34 - stage * 4;
      fillShadedPoly(
        ctx,
        [
          [-14, -4],
          [-6, pylonTop + 4],
          [6, pylonTop + 4],
          [14, -4],
        ],
        '#4338ca',
        '#1e1b4b',
        '#090d16',
        1.9
      );

      // Stacked Copper & Titanium Toroid Induction Rings
      const rings = stage === 3 ? 4 : stage === 2 ? 3 : 2;
      for (let i = 0; i < rings; i++) {
        const frac = i / Math.max(1, rings - 1);
        const ry = -11 + frac * (pylonTop + 17);
        const rw = 16 - frac * 5.5;
        ctx.strokeStyle = '#090d16';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.ellipse(0, ry, rw, 4, 0, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = stage === 3 ? '#38bdf8' : '#f59e0b';
        ctx.lineWidth = 2.8;
        ctx.stroke();
      }

      // Side Capacitor Conductors on Stage 2+
      if (stage >= 2) {
        for (const dir of [-1, 1]) {
          ctx.strokeStyle = '#cbd5e1';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(dir * 7, pylonTop + 12);
          ctx.lineTo(dir * (16 + stage * 2), pylonTop - 2);
          ctx.stroke();
          fillShadedEllipse(
            ctx,
            dir * (16 + stage * 2),
            pylonTop - 2,
            4,
            4,
            '#e0f2fe',
            '#38bdf8',
            '#090d16',
            1.2
          );
        }
      }

      // Main Plasma Arc Sphere + Directional Aiming Arc Crown (tracks air & ground targets)
      const orbY = pylonTop - 4;
      const orbR = 8 + stage * 1.4 + Math.sin(t * 14) * 1.3;
      drawGlowBloom(ctx, 0, orbY, orbR + 12 + chargeGlow * 8, boltCol, 0.5 + chargeGlow * 0.4);
      fillShadedEllipse(ctx, 0, orbY, orbR, orbR, '#ffffff', boltCol, '#090d16', 1.6);

      ctx.save();
      ctx.translate(0, orbY);
      ctx.rotate(angle);
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(orbR * 0.5, -5);
      ctx.lineTo(orbR + 7, -2);
      ctx.moveTo(orbR * 0.5, 5);
      ctx.lineTo(orbR + 7, 2);
      ctx.stroke();
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(orbR + 7, 0, 2.6 + chargeGlow * 1.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Crackling animated electric arcs
      ctx.strokeStyle = '#e0f2fe';
      ctx.lineWidth = 1.6;
      const a0 = t * 9;
      for (let k = 0; k < stage; k++) {
        const ak = a0 + (k * Math.PI * 2) / stage;
        ctx.beginPath();
        ctx.moveTo(Math.cos(ak) * orbR, orbY + Math.sin(ak) * orbR);
        ctx.lineTo(Math.cos(ak + 0.45) * (orbR + 9), orbY + Math.sin(ak + 0.45) * (orbR + 9));
        ctx.stroke();
      }
      break;
    }

    // F. DRONE DEFENSE TOWER (ancient_guardian)
    case 'ancient_guardian': {
      const goldGlow = stage === 3 ? '#fef08a' : '#fbbf24';
      drawArmoredTechBase(ctx, stage, '#92400e', '#292524', goldGlow, '#f59e0b');

      // Command Pad + Holographic Radar Core
      fillShadedPoly(
        ctx,
        [
          [-16, -5],
          [-11, -24],
          [11, -24],
          [16, -5],
        ],
        '#d97706',
        '#451a03',
        '#090d16',
        1.9
      );

      // Rotating Hologram Radar Emitter
      drawGlowBloom(ctx, 0, -27, 16 + chargeGlow * 8, '#38bdf8', 0.48 + chargeGlow * 0.35);
      fillShadedEllipse(ctx, 0, -27, 8 + stage, 5.5 + stage * 0.5, '#e0f2fe', '#0284c7', '#090d16', 1.5);

      // Animated Flying Defense Drones orbiting around command spire (1 -> 2 -> 3 drones!)
      const droneCount = stage;
      for (let i = 0; i < droneCount; i++) {
        const oa = t * 2.5 + (Math.PI * 2 * i) / droneCount;
        const dx = Math.cos(oa) * (22 + stage * 3);
        const dy = -26 + Math.sin(oa * 1.5) * 6 + Math.sin(oa) * 8;

        ctx.save();
        ctx.translate(dx, dy);
        // Drone Shadow Beam Ring
        drawGlowBloom(ctx, 0, 0, 10, '#38bdf8', 0.45);
        // Twin Rotor Thrusters
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-10, -2);
        ctx.lineTo(10, -2);
        ctx.stroke();
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.ellipse(-9, -3, 4.5, 1.8, 0, 0, Math.PI * 2);
        ctx.ellipse(9, -3, 4.5, 1.8, 0, 0, Math.PI * 2);
        ctx.fill();
        // Drone Armored Pod + Cannon Eye
        fillShadedPoly(
          ctx,
          [
            [-6, -4],
            [6, -4],
            [8, 2],
            [0, 5],
            [-8, 2],
          ],
          '#fbbf24',
          '#78350f',
          '#090d16',
          1.4
        );
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.arc(0, 1, 2.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      break;
    }

    // G. FROST CANNON (ice_wizard)
    case 'ice_wizard': {
      const cryo = stage === 3 ? '#e0f2fe' : '#38bdf8';
      drawArmoredTechBase(ctx, stage, '#1e3a5f', '#0f172a', cryo, '#60a5fa');

      // Dual Pressurized Liquid-Nitrogen Coolant Cylinders on Rear Deck
      for (const cx of [-16, 16]) {
        fillShadedPoly(
          ctx,
          [
            [cx - 4, -22 - stage * 2],
            [cx + 4, -22 - stage * 2],
            [cx + 4, -4],
            [cx - 4, -4],
          ],
          '#bae6fd',
          '#0284c7',
          '#090d16',
          1.4
        );
      }

      ctx.save();
      ctx.translate(0, -11);
      ctx.rotate(angle);

      // Cryo Turret Cowling
      fillShadedPoly(
        ctx,
        [
          [-16, -12],
          [11, -11],
          [15, -6],
          [15, 6],
          [11, 11],
          [-16, 12],
        ],
        '#0284c7',
        '#0c4a6e',
        '#090d16',
        1.9
      );

      // Wide-bore Cryo Projector Barrel(s) + Frost Radiator Fins
      const cryoBarrels = stage === 3 ? [-5, 5] : [0];
      const len = stage === 3 ? 31 : stage === 2 ? 29 : 25;
      for (const by of cryoBarrels) {
        fillShadedPoly(
          ctx,
          [
            [-2 + kick, by - 4.5],
            [len + kick, by - 5.5],
            [len + kick, by + 5.5],
            [-2 + kick, by + 4.5],
          ],
          '#7dd3fc',
          '#0369a1',
          '#090d16',
          1.6
        );
        // Glowing frost muzzle ring
        ctx.fillStyle = '#e0f2fe';
        ctx.fillRect(len - 5 + kick, by - 5, 4, 10);
      }

      // Top Cryo Core Crystal
      drawGlowBloom(ctx, -3, 0, 12 + chargeGlow * 8, '#7dd3fc', 0.55 + chargeGlow * 0.35);
      fillShadedPoly(
        ctx,
        [
          [4, 0],
          [-3, -6],
          [-9, 0],
          [-3, 6],
        ],
        '#ffffff',
        '#38bdf8',
        '#090d16',
        1.3
      );

      if (recoil > 0.55) {
        drawGlowBloom(ctx, len + 4 + kick, 0, 15, '#bae6fd', 0.85);
      }
      ctx.restore();
      break;
    }

    // H. SHADOW ENERGY TOWER (poison_tower)
    case 'poison_tower': {
      const voidCol = stage === 3 ? '#e879f9' : '#a855f7';
      drawArmoredTechBase(ctx, stage, '#2e1065', '#0f0720', voidCol, '#7e22ce');

      // Floating Obsidian Containment Pylons surrounding central Void Orb
      const clawH = -28 - stage * 4;
      const claws = stage === 3 ? 3 : 2;
      for (let i = 0; i < claws; i++) {
        const cx = claws === 2 ? (i === 0 ? -13 : 13) : (i - 1) * 14;
        fillShadedPoly(
          ctx,
          [
            [cx - 4, -5],
            [cx, clawH],
            [cx + 4, -5],
          ],
          '#581c87',
          '#0f0720',
          voidCol,
          1.4
        );
      }

      // Levitating Shadow Void Energy Sphere + Dark Orbiting Runes
      const floatY = clawH - 6 + Math.sin(t * 4.2) * 2.5;
      const orbR = 9 + stage * 1.5;
      drawGlowBloom(ctx, 0, floatY, orbR + 14 + chargeGlow * 10, voidCol, 0.58 + chargeGlow * 0.38);

      // Orbiting dark energy ring
      ctx.strokeStyle = '#f0abfc';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(0, floatY, orbR + 7, 4.5, t * 2.2, 0, Math.PI * 2);
      ctx.stroke();

      fillShadedEllipse(ctx, 0, floatY, orbR, orbR, '#7e22ce', '#090d16', '#e879f9', 1.7);
      ctx.fillStyle = '#fdf4ff';
      ctx.beginPath();
      ctx.arc(-2.5, floatY - 2.5, orbR * 0.32, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    // I. SKY HUNTER AA TURRET (sky_hunter)
    case 'sky_hunter': {
      const cyanGlow = stage === 3 ? '#67e8f9' : '#22d3ee';
      drawArmoredTechBase(ctx, stage, '#115e59', '#0f172a', cyanGlow, '#2dd4bf');

      // Spinning sky radar dish at rear collar
      ctx.save();
      ctx.translate(-12, -16);
      ctx.scale(Math.max(0.3, Math.abs(Math.cos(t * 3.8))), 1);
      fillShadedEllipse(ctx, 0, 0, 8, 5, '#e2e8f0', '#0d9488', '#090d16', 1.3);
      ctx.restore();

      ctx.save();
      ctx.translate(0, -13);
      ctx.rotate(angle);

      fillShadedPoly(
        ctx,
        [
          [-15, -11],
          [11, -10],
          [15, -4],
          [15, 4],
          [11, 10],
          [-15, 11],
        ],
        '#14b8a6',
        '#134e4a',
        '#090d16',
        1.9
      );

      // Twin high-velocity AA gatling barrels
      const barrelLen = stage === 3 ? 32 : stage === 2 ? 29 : 26;
      const barrels = stage === 3 ? [-5.5, 0, 5.5] : [-4, 4];
      for (const by of barrels) {
        fillShadedPoly(
          ctx,
          [
            [0 + kick, by - 2.4],
            [barrelLen + kick, by - 1.9],
            [barrelLen + kick, by + 1.9],
            [0 + kick, by + 2.4],
          ],
          '#e2e8f0',
          '#475569',
          '#090d16',
          1.3
        );
        ctx.fillStyle = cyanGlow;
        ctx.fillRect(barrelLen - 4 + kick, by - 1.6, 3.5, 3.2);
      }
      fillShadedEllipse(ctx, -3, 0, 6.5, 5.5, '#a5f3fc', '#0e7490', '#090d16', 1.3);
      if (recoil > 0.5) {
        drawGlowBloom(ctx, barrelLen + 3 + kick, 0, 12, cyanGlow, 0.85);
      }
      ctx.restore();
      break;
    }

    // J. MISSILE AIR DEFENSE PLATFORM (missile_platform)
    case 'missile_platform': {
      const orangeGlow = stage === 3 ? '#fde047' : '#f97316';
      drawArmoredTechBase(ctx, stage, '#475569', '#0f172a', orangeGlow, '#94a3b8');

      ctx.save();
      ctx.translate(0, -14);
      ctx.rotate(angle);

      // Rotating armored launcher frame
      fillShadedPoly(
        ctx,
        [
          [-16, -14],
          [12, -13],
          [15, 13],
          [-16, 14],
        ],
        '#64748b',
        '#1e293b',
        '#090d16',
        1.9
      );

      // Dual SAM missile pod racks with red warhead noses
      const podRows = stage === 3 ? [-8, 0, 8] : [-6, 6];
      for (const py of podRows) {
        fillShadedPoly(
          ctx,
          [
            [-8 + kick * 0.5, py - 4],
            [18 + kick * 0.5, py - 3.6],
            [18 + kick * 0.5, py + 3.6],
            [-8 + kick * 0.5, py + 4],
          ],
          '#cbd5e1',
          '#334155',
          '#090d16',
          1.3
        );
        // Missile nose tips peeking out
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.moveTo(23 + kick * 0.5, py);
        ctx.lineTo(17 + kick * 0.5, py - 3);
        ctx.lineTo(17 + kick * 0.5, py + 3);
        ctx.closePath();
        ctx.fill();
      }

      if (recoil > 0.45) {
        drawGlowBloom(ctx, -15, 0, 15, '#fb923c', 0.85);
      }
      ctx.restore();
      break;
    }

    // K. STORM ANTI-AIR CANNON (storm_cannon)
    case 'storm_cannon': {
      const skyGlow = stage === 3 ? '#e0f2fe' : '#38bdf8';
      drawArmoredTechBase(ctx, stage, '#1e40af', '#0f172a', skyGlow, '#60a5fa');

      ctx.save();
      ctx.translate(0, -13);
      ctx.rotate(angle);

      fillShadedPoly(
        ctx,
        [
          [-15, -13],
          [10, -11],
          [14, 11],
          [-15, 13],
        ],
        '#3b82f6',
        '#1e3a8a',
        '#090d16',
        1.9
      );

      // Twin parallel electromagnetic accelerator rails
      const railLen = stage === 3 ? 33 : 28;
      for (const ry of [-6.5, 6.5]) {
        fillShadedPoly(
          ctx,
          [
            [2 + kick * 0.5, ry - 2.6],
            [railLen + kick * 0.5, ry - 2],
            [railLen + kick * 0.5, ry + 2],
            [2 + kick * 0.5, ry + 2.6],
          ],
          '#e2e8f0',
          '#1d4ed8',
          '#090d16',
          1.3
        );
      }

      // Pulsing storm sphere core nested between rails
      drawGlowBloom(ctx, 13, 0, 13 + chargeGlow * 8, skyGlow, 0.6 + chargeGlow * 0.35);
      fillShadedEllipse(ctx, 13, 0, 6.5, 6.5, '#ffffff', '#0284c7', '#090d16', 1.3);
      ctx.restore();
      break;
    }

    // L. AUTONOMOUS DRONE STATION (drone_station)
    case 'drone_station': {
      const emeraldGlow = stage === 3 ? '#6ee7b7' : '#34d399';
      drawArmoredTechBase(ctx, stage, '#1e293b', '#090d16', emeraldGlow, '#64748b');

      // Elevated octagonal drone launch deck
      fillShadedPoly(
        ctx,
        [
          [-20, -4],
          [-14, -20],
          [14, -20],
          [20, -4],
        ],
        '#334155',
        '#0f172a',
        '#090d16',
        1.9
      );

      // Holographic launch bay ring
      drawGlowBloom(ctx, 0, -21, 18 + stage * 3, emeraldGlow, 0.55);
      fillShadedEllipse(ctx, 0, -21, 12, 6, '#a7f3d0', '#059669', '#090d16', 1.4);

      // Sweeping holographic radar beam cone
      ctx.save();
      ctx.translate(0, -21);
      ctx.rotate(t * 2.8);
      ctx.fillStyle = 'rgba(52, 211, 153, 0.28)';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, 20, -0.38, 0.38);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // Twin telemetry antennas on flank
      for (const ax of [-13, 13]) {
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(ax, -14);
        ctx.lineTo(ax, -30 - stage * 2);
        ctx.stroke();
        ctx.fillStyle = emeraldGlow;
        ctx.beginPath();
        ctx.arc(ax, -30 - stage * 2, 2.8, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }

    // M. PLASMA AIR DEFENSE BATTERY (plasma_air_defense)
    case 'plasma_air_defense': {
      const roseGlow = stage === 3 ? '#fda4af' : '#f43f5e';
      drawArmoredTechBase(ctx, stage, '#581c87', '#0f0720', roseGlow, '#a855f7');

      ctx.save();
      ctx.translate(0, -14);
      ctx.rotate(angle);

      fillShadedPoly(
        ctx,
        [
          [-17, -14],
          [12, -12],
          [17, -5],
          [17, 5],
          [12, 12],
          [-17, 14],
        ],
        '#7e22ce',
        '#2e1065',
        '#090d16',
        2
      );

      // Triple plasma AA accelerator barrels
      const pLen = stage === 3 ? 34 : 30;
      for (const py of [-7.5, 0, 7.5]) {
        fillShadedPoly(
          ctx,
          [
            [2 + kick, py - 2.3],
            [pLen + kick, py - 1.8],
            [pLen + kick, py + 1.8],
            [2 + kick, py + 2.3],
          ],
          '#e2e8f0',
          '#4c1d95',
          '#090d16',
          1.3
        );
        ctx.fillStyle = roseGlow;
        ctx.fillRect(pLen - 5 + kick, py - 1.8, 4.5, 3.6);
      }

      drawGlowBloom(ctx, -3, 0, 14 + chargeGlow * 9, roseGlow, 0.65 + chargeGlow * 0.35);
      fillShadedEllipse(ctx, -3, 0, 7, 7, '#ffffff', '#e11d48', '#090d16', 1.4);

      if (recoil > 0.5) {
        drawGlowBloom(ctx, pLen + 4 + kick, 0, 18, roseGlow, 0.9);
      }
      ctx.restore();
      break;
    }

    // N. TITAN PLASMA CANNON (titan_plasma_cannon)
    case 'titan_plasma_cannon': {
      const pulse = 0.55 + Math.sin(t * 5.2) * 0.2 + chargeGlow * 0.45;
      const coreGlow = stage === 3 ? '#67e8f9' : '#38bdf8';
      drawArmoredTechBase(ctx, stage, '#334155', '#090d16', coreGlow, '#94a3b8');

      // Heavy titanium rear stabilizer fins
      for (const sy of [-1, 1] as const) {
        fillShadedPoly(
          ctx,
          [
            [-22, sy * 8],
            [-30, sy * 16],
            [-14, sy * 18],
            [-8, sy * 10],
          ],
          '#475569',
          '#0f172a',
          '#090d16',
          1.5
        );
      }

      ctx.save();
      ctx.translate(0, -13);
      ctx.rotate(angle);

      // Massive beveled armored cannon hull
      fillShadedPoly(
        ctx,
        [
          [-21, -15],
          [11, -14],
          [18, -7],
          [18, 7],
          [11, 14],
          [-21, 15],
        ],
        '#475569',
        '#0f172a',
        '#090d16',
        2.1
      );

      // Side energy cooling manifolds
      for (const side of [-1, 1] as const) {
        fillShadedPoly(
          ctx,
          [
            [-15, side * 14],
            [6, side * 14],
            [9, side * 19],
            [-12, side * 19],
          ],
          '#1e293b',
          '#020617',
          coreGlow,
          1.2
        );
      }

      // Dual heavy plasma accelerator rails + glowing plasma conduit channel
      const cannonLen = stage === 3 ? 38 : stage === 2 ? 35 : 32;
      const railKick = kick * 1.15;

      // Central ionized barrel channel glow
      drawGlowBloom(ctx, 21 + railKick * 0.5, 0, 12 + chargeGlow * 8, coreGlow, pulse * 0.72);
      ctx.fillStyle = coreGlow;
      ctx.fillRect(4 + railKick, -2.6, cannonLen - 6, 5.2);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(6 + railKick, -1, cannonLen - 10, 2);

      // Top & bottom heavy magnetic plasma rails
      for (const ry of [-6.2, 6.2]) {
        fillShadedPoly(
          ctx,
          [
            [0 + railKick, ry - 3.3],
            [cannonLen + railKick, ry - 2.6],
            [cannonLen + railKick, ry + 2.6],
            [0 + railKick, ry + 3.3],
          ],
          '#cbd5e1',
          '#334155',
          '#090d16',
          1.5
        );
        // Glowing accelerator coils
        ctx.fillStyle = coreGlow;
        ctx.fillRect(10 + railKick, ry - 1.5, 4, 3);
        ctx.fillRect(20 + railKick, ry - 1.5, 4, 3);
        if (stage >= 2) {
          ctx.fillRect(27 + railKick, ry - 1.5, 4, 3);
        }
      }

      // Twin sky-tracker AA emitter fins when air-targeting upgrade is unlocked
      if (airUnlocked) {
        for (const ay of [-11.5, 11.5]) {
          fillShadedPoly(
            ctx,
            [
              [-6, ay - 2.5],
              [10, ay - 1.5],
              [10, ay + 1.5],
              [-6, ay + 2.5],
            ],
            '#a5f3fc',
            '#0369a1',
            '#090d16',
            1.2
          );
        }
        drawGlowBloom(ctx, 11, 0, 11, '#38bdf8', 0.42);
      }

      // Central Titan Plasma Reactor Core
      drawGlowBloom(ctx, -4, 0, 16 + chargeGlow * 10, coreGlow, 0.72 + chargeGlow * 0.28);
      fillShadedEllipse(ctx, -4, 0, 9.2, 8.2, '#e0f2fe', '#0284c7', '#090d16', 1.6);
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(-4, 0, 3.8 + chargeGlow * 1.6, 0, Math.PI * 2);
      ctx.fill();

      // Heavy plasma muzzle detonation flare on fire
      if (recoil > 0.38) {
        drawGlowBloom(ctx, cannonLen + 5 + railKick, 0, 22, '#67e8f9', 0.95);
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(cannonLen + 2 + railKick, 0, 5.5, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
      break;
    }
  }
}

export function drawActiveDefenseDrones(
  ctx: CanvasRenderingContext2D,
  drones: ActiveDroneState[],
  t: number
) {
  for (const d of drones) {
    const hover = Math.sin(t * 7 + d.orbitAngle) * 2.4;
    ctx.save();
    ctx.translate(d.x, d.y + hover);

    // Subtle ground shadow beneath hovering interceptor drone
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.ellipse(0, 26, 9, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.rotate(d.angle);
    drawGlowBloom(ctx, 0, 0, 12 + d.stage * 2, '#34d399', 0.45);

    // Swept interceptor twin wings
    fillShadedPoly(
      ctx,
      [
        [8, 0],
        [-7, -11],
        [-3, 0],
        [-7, 11],
      ],
      '#94a3b8',
      '#0f172a',
      '#34d399',
      1.4
    );

    // Rotor discs
    const spin = 0.5 + Math.abs(Math.sin(t * 24 + d.orbitAngle)) * 0.5;
    ctx.fillStyle = 'rgba(110, 231, 183, 0.65)';
    ctx.beginPath();
    ctx.ellipse(-4, -8, 4.5 * spin, 2.2, 0, 0, Math.PI * 2);
    ctx.ellipse(-4, 8, 4.5 * spin, 2.2, 0, 0, Math.PI * 2);
    ctx.fill();

    // Central laser emitter eye
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(6.5, 0, 2.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}
