import {
  drawArmorPauldron,
  drawArticulatedLeg,
  drawDragonWing,
  drawGlowBloom,
  drawGlowingEye,
  drawVolumetricLimb,
  fillShadedEllipse,
  fillShadedPoly,
} from './artPrimitives';
import { drawSciFiCharacterRig } from './monsterSciFiRigs';
import { drawExpansionMonsterRig } from './monsterExpansionRigs';

/**
 * High-detail illustrated character rigs for all World Bosses
 * plus Worlds 6–15 specialized monsters and Volcanic Wyverns.
 * Zero stick-figure strokes: 100% volumetric shaded limbs, armor & faces.
 */
export function drawSpecializedAndBossMonster(
  ctx: CanvasRenderingContext2D,
  id: string,
  s: number,
  stride: number,
  armSwing: number,
  t: number,
  dist: number,
  body: string,
  accent: string,
  flash: boolean
): boolean {
  if (drawSciFiCharacterRig(ctx, id, s, stride, armSwing, t, dist, body, accent, flash)) {
    return true;
  }
  if (drawExpansionMonsterRig(ctx, id, s, stride, armSwing, t, dist, body, accent, flash)) {
    return true;
  }

  switch (id) {
    // ======================== WORLD 1–5 BOSSES ========================
    case 'boss_fallen_king': {
      drawFallenKingBoss(ctx, s, stride, armSwing, t, body, accent, flash);
      return true;
    }
    case 'boss_lava_golem': {
      drawLavaGolemBoss(ctx, s, stride, armSwing, t, body, accent, flash);
      return true;
    }
    case 'boss_ice_titan': {
      drawIceTitanBoss(ctx, s, stride, armSwing, t, body, accent, flash);
      return true;
    }
    case 'boss_sand_king': {
      drawSandKingBoss(ctx, s, stride, armSwing, t, body, accent, flash);
      return true;
    }

    // ======================== WORLD 3 SPECIALIZED ========================
    case 'lava_dragon': {
      drawVolcanicDrake(ctx, s, t, dist, body, accent, flash);
      return true;
    }

    // ======================== WORLD 6: SKY ISLANDS ========================
    case 'sky_harpy': {
      drawSkyHarpy(ctx, s, stride, t, dist, body, accent, flash);
      return true;
    }
    case 'storm_beast': {
      drawStormGriffon(ctx, s, stride, t, dist, body, accent, flash);
      return true;
    }
    case 'thunder_roc': {
      drawThunderRoc(ctx, s, t, dist, body, accent, flash);
      return true;
    }
    case 'boss_sky_dragon': {
      drawSkyDragonBoss(ctx, s, t, dist, body, accent, flash);
      return true;
    }

    // ======================== WORLD 7: ANCIENT TEMPLE ========================
    case 'ancient_guard': {
      drawAncientTempleSentinel(ctx, s, stride, armSwing, t, body, accent, flash);
      return true;
    }
    case 'stone_golem': {
      drawRuneStoneGolem(ctx, s, stride, armSwing, t, body, accent, flash);
      return true;
    }
    case 'temple_specter': {
      drawTempleSpecter(ctx, s, t, body, accent, flash);
      return true;
    }
    case 'boss_stone_titan': {
      drawStoneTitanBoss(ctx, s, stride, armSwing, t, body, accent, flash);
      return true;
    }

    // ======================== WORLD 8: MUSHROOM KINGDOM ========================
    case 'tiny_mutant': {
      drawToadstoolGremlin(ctx, s, stride, armSwing, body, accent, flash);
      return true;
    }
    case 'poison_beast': {
      drawToxicSporeHulk(ctx, s, stride, armSwing, t, body, accent, flash);
      return true;
    }
    case 'spore_flyer': {
      drawSporeMoth(ctx, s, t, dist, body, accent, flash);
      return true;
    }
    case 'boss_toxic_overlord': {
      drawToxicOverlordBoss(ctx, s, stride, armSwing, t, body, accent, flash);
      return true;
    }

    // ======================== WORLD 9: OCEAN ABYSS ========================
    case 'sea_creature': {
      drawAbyssRaider(ctx, s, stride, armSwing, t, body, accent, flash);
      return true;
    }
    case 'armored_sea_monster': {
      drawKrakenCrabBruiser(ctx, s, stride, armSwing, t, body, accent, flash);
      return true;
    }
    case 'abyss_manta': {
      drawAbyssManta(ctx, s, t, dist, body, accent, flash);
      return true;
    }
    case 'boss_leviathan': {
      drawLeviathanBoss(ctx, s, stride, armSwing, t, body, accent, flash);
      return true;
    }

    // ======================== WORLD 10: DRAGON'S REALM ========================
    case 'elite_monster': {
      drawAbyssalWarlord(ctx, s, stride, armSwing, body, accent, flash);
      return true;
    }
    case 'dragon_warrior': {
      drawDragonbornPaladin(ctx, s, stride, armSwing, t, body, accent, flash);
      return true;
    }
    case 'shadow_drake': {
      drawShadowWyvern(ctx, s, t, dist, body, accent, flash);
      return true;
    }
    case 'boss_dark_dragon_king': {
      drawDarkDragonKingBoss(ctx, s, t, dist, body, accent, flash);
      return true;
    }

    default:
      return false;
  }
}

// ---------------------------------------------------------------------------
// WORLD 1 BOSS: THE FALLEN KING (Undead Lich Monarch)
// ---------------------------------------------------------------------------
function drawFallenKingBoss(
  ctx: CanvasRenderingContext2D,
  s: number,
  stride: number,
  armSwing: number,
  t: number,
  body: string,
  accent: string,
  flash: boolean
) {
  const legL = stride * s * 0.22;
  const legR = -stride * s * 0.22;
  const capeSway = Math.sin(t * 4.5) * s * 0.08;

  // Royal Tattered Cloak
  fillShadedPoly(
    ctx,
    [
      [-s * 0.28, -s * 0.44],
      [-s * 0.94, s * 0.08 + capeSway],
      [-s * 0.74, s * 0.72],
      [-s * 0.45, s * 0.56],
      [-s * 0.3, s * 0.72],
      [-s * 0.05, s * 0.44],
    ],
    '#7f1d1d',
    '#2e0713',
    '#090d16',
    2
  );

  // Articulated Armored Greaves
  drawArticulatedLeg(ctx, -s * 0.2, s * 0.28, -s * 0.24 + legL, s * 0.74, s * 0.1, '#64748b', '#1e293b', '#94a3b8', '#475569');
  drawArticulatedLeg(ctx, s * 0.2, s * 0.28, s * 0.24 + legR, s * 0.74, s * 0.1, '#64748b', '#1e293b', '#94a3b8', '#475569');

  // Sculpted Royal Rib-Plated Breastplate
  fillShadedPoly(
    ctx,
    [
      [-s * 0.48, -s * 0.34],
      [s * 0.48, -s * 0.34],
      [s * 0.36, s * 0.38],
      [-s * 0.36, s * 0.38],
    ],
    '#475569',
    flash ? '#ffffff' : body,
    '#090d16',
    2.2
  );

  // Glowing Soul Furnace & Bone Rib Trim
  if (!flash) {
    drawGlowBloom(ctx, 0, -s * 0.04, s * 0.28, '#38bdf8', 0.5);
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 2.6;
    for (const ry of [-0.14, 0, 0.14]) {
      ctx.beginPath();
      ctx.moveTo(-s * 0.24, s * ry);
      ctx.quadraticCurveTo(0, s * (ry + 0.07), s * 0.24, s * ry);
      ctx.stroke();
    }
    fillShadedEllipse(ctx, 0, -s * 0.04, s * 0.11, s * 0.11, '#e0f2fe', '#0284c7', '#090d16', 1.4);
  }

  // Spiked Royal Gold Pauldrons
  drawArmorPauldron(ctx, -s * 0.45, -s * 0.3, s * 0.23, s * 0.19, '#fde047', '#92400e', accent, -1);
  drawArmorPauldron(ctx, s * 0.45, -s * 0.3, s * 0.23, s * 0.19, '#fde047', '#92400e', accent, 1);

  // Lich Skull Face, Cheekbones & Jaw
  fillShadedEllipse(ctx, s * 0.02, -s * 0.62, s * 0.3, s * 0.28, '#f8fafc', '#94a3b8', '#090d16', 2);
  fillShadedPoly(
    ctx,
    [
      [-s * 0.12, -s * 0.46],
      [s * 0.16, -s * 0.46],
      [s * 0.12, -s * 0.32],
      [-s * 0.08, -s * 0.32],
    ],
    '#e2e8f0',
    '#64748b',
    '#090d16',
    1.5
  );

  if (!flash) {
    drawGlowingEye(ctx, s * 0.15, -s * 0.64, s * 0.075, s * 0.055, '#38bdf8');
    drawGlowingEye(ctx, -s * 0.06, -s * 0.64, s * 0.065, s * 0.05, '#38bdf8');
  }

  // Floating Shattered Gold Crown
  const floatC = Math.sin(t * 4) * 3.5;
  fillShadedPoly(
    ctx,
    [
      [-s * 0.28, -s * 0.84 + floatC],
      [-s * 0.36, -s * 1.24 + floatC],
      [-s * 0.12, -s * 0.94 + floatC],
      [0, -s * 1.3 + floatC],
      [s * 0.14, -s * 0.94 + floatC],
      [s * 0.38, -s * 1.22 + floatC],
      [s * 0.28, -s * 0.84 + floatC],
    ],
    '#fef08a',
    '#b45309',
    '#090d16',
    1.8
  );

  // Armored Sword Arm + Colossal Frost Runeblade
  ctx.save();
  ctx.translate(s * 0.44, -s * 0.14);
  ctx.rotate(armSwing * 0.22);
  drawVolumetricLimb(ctx, 0, 0, s * 0.14, s * 0.22, s * 0.09, s * 0.08, '#64748b', '#1e293b');
  fillShadedPoly(
    ctx,
    [
      [s * 0.02, s * 0.22],
      [s * 0.66, -s * 0.88],
      [s * 0.78, -s * 0.74],
      [s * 0.18, s * 0.28],
    ],
    '#e0f2fe',
    '#0284c7',
    '#090d16',
    2
  );
  // Gold crossguard
  fillShadedPoly(
    ctx,
    [
      [s * 0.02, s * 0.08],
      [s * 0.24, s * 0.26],
      [s * 0.18, s * 0.32],
      [-s * 0.04, s * 0.14],
    ],
    '#fbbf24',
    '#92400e',
    '#090d16',
    1.4
  );
  ctx.restore();
}

// ---------------------------------------------------------------------------
// WORLD 3 BOSS: LAVA GOLEM OVERLORD
// ---------------------------------------------------------------------------
function drawLavaGolemBoss(
  ctx: CanvasRenderingContext2D,
  s: number,
  stride: number,
  armSwing: number,
  t: number,
  body: string,
  accent: string,
  flash: boolean
) {
  const legL = stride * s * 0.18;
  const legR = -stride * s * 0.18;
  const pulse = 0.8 + Math.sin(t * 7) * 0.2;

  drawArticulatedLeg(ctx, -s * 0.26, s * 0.28, -s * 0.3 + legL, s * 0.74, s * 0.14, '#57534e', '#1c1917', '#ea580c', '#292524');
  drawArticulatedLeg(ctx, s * 0.26, s * 0.28, s * 0.3 + legR, s * 0.74, s * 0.14, '#57534e', '#1c1917', '#ea580c', '#292524');

  // Hulking Basalt Torso
  fillShadedPoly(
    ctx,
    [
      [-s * 0.58, -s * 0.38],
      [-s * 0.3, -s * 0.54],
      [s * 0.3, -s * 0.54],
      [s * 0.58, -s * 0.38],
      [s * 0.44, s * 0.42],
      [-s * 0.44, s * 0.42],
    ],
    '#57534e',
    '#1c1917',
    '#090d16',
    2.4
  );

  // Twin Shoulder Volcano Chimneys
  for (const sx of [-1, 1]) {
    fillShadedPoly(
      ctx,
      [
        [sx * s * 0.32, -s * 0.46],
        [sx * s * 0.42, -s * 0.84],
        [sx * s * 0.62, -s * 0.84],
        [sx * s * 0.66, -s * 0.32],
      ],
      '#7c2d12',
      body,
      '#090d16',
      1.9
    );

    if (!flash) {
      const ventY = -s * 0.92 - Math.abs(Math.sin(t * 6 + sx)) * 7;
      drawGlowBloom(ctx, sx * s * 0.52, ventY, s * 0.25, '#fb923c', 0.65);
      fillShadedEllipse(ctx, sx * s * 0.52, ventY, s * 0.12 * pulse, s * 0.12 * pulse, '#fef08a', '#ea580c', '#7c2d12', 1.2);
    }
  }

  // Molten Furnace Core
  if (!flash) {
    drawGlowBloom(ctx, 0, -s * 0.04, s * 0.38, '#f97316', 0.58);
    ctx.strokeStyle = '#fb923c';
    ctx.lineWidth = 3.2;
    ctx.beginPath();
    ctx.moveTo(-s * 0.28, -s * 0.2);
    ctx.lineTo(0, 0);
    ctx.lineTo(s * 0.28, -s * 0.16);
    ctx.moveTo(0, 0);
    ctx.lineTo(-s * 0.18, s * 0.28);
    ctx.stroke();
    fillShadedEllipse(ctx, 0, -s * 0.04, s * 0.18 * pulse, s * 0.18 * pulse, '#fef08a', accent, '#9a3412', 1.5);
  }

  // Horned Obsidian Head
  fillShadedPoly(
    ctx,
    [
      [-s * 0.24, -s * 0.82],
      [s * 0.24, -s * 0.82],
      [s * 0.28, -s * 0.44],
      [-s * 0.28, -s * 0.44],
    ],
    '#44403c',
    '#1c1917',
    '#090d16',
    2
  );
  for (const sx of [-1, 1]) {
    fillShadedPoly(
      ctx,
      [
        [sx * s * 0.18, -s * 0.78],
        [sx * s * 0.38, -s * 1.08],
        [sx * s * 0.06, -s * 0.82],
      ],
      '#fb923c',
      '#7c2d12',
      '#090d16',
      1.5
    );
  }
  if (!flash) {
    drawGlowingEye(ctx, s * 0.1, -s * 0.64, s * 0.07, s * 0.045, '#fde047');
    drawGlowingEye(ctx, -s * 0.08, -s * 0.64, s * 0.065, s * 0.045, '#fde047');
  }

  // Articulated Molten Hammer Arm
  ctx.save();
  ctx.translate(s * 0.48, -s * 0.06);
  ctx.rotate(armSwing * 0.25);
  drawVolumetricLimb(ctx, 0, 0, s * 0.14, s * 0.18, s * 0.11, s * 0.1, '#57534e', '#1c1917');
  fillShadedPoly(
    ctx,
    [
      [s * 0.04, -s * 0.06],
      [s * 0.42, -s * 0.06],
      [s * 0.42, s * 0.36],
      [s * 0.04, s * 0.36],
    ],
    '#fb923c',
    '#9a3412',
    '#090d16',
    1.8
  );
  ctx.restore();
}

// ---------------------------------------------------------------------------
// WORLD 4 BOSS: ICE TITAN KING
// ---------------------------------------------------------------------------
function drawIceTitanBoss(
  ctx: CanvasRenderingContext2D,
  s: number,
  stride: number,
  armSwing: number,
  t: number,
  body: string,
  accent: string,
  flash: boolean
) {
  const legL = stride * s * 0.18;
  const legR = -stride * s * 0.18;

  // Frost-Fur Cloak
  fillShadedPoly(
    ctx,
    [
      [-s * 0.34, -s * 0.44],
      [-s * 0.82, s * 0.62],
      [-s * 0.05, s * 0.46],
    ],
    '#0284c7',
    '#0c4a6e',
    '#090d16',
    2
  );

  drawArticulatedLeg(ctx, -s * 0.22, s * 0.28, -s * 0.24 + legL, s * 0.74, s * 0.12, '#38bdf8', '#1e3a8a', '#bae6fd', '#0c4a6e');
  drawArticulatedLeg(ctx, s * 0.22, s * 0.28, s * 0.24 + legR, s * 0.74, s * 0.12, '#38bdf8', '#1e3a8a', '#bae6fd', '#0c4a6e');

  // Glacial Armor Torso
  fillShadedPoly(
    ctx,
    [
      [-s * 0.54, -s * 0.36],
      [s * 0.54, -s * 0.36],
      [s * 0.4, s * 0.42],
      [-s * 0.4, s * 0.42],
    ],
    '#38bdf8',
    flash ? '#ffffff' : body,
    '#e0f2fe',
    2.1
  );

  // Jagged Icicle Pauldrons
  for (const sx of [-1, 1]) {
    fillShadedPoly(
      ctx,
      [
        [sx * s * 0.35, -s * 0.34],
        [sx * s * 0.64, -s * 0.78],
        [sx * s * 0.7, -s * 0.2],
      ],
      '#e0f2fe',
      '#0284c7',
      '#090d16',
      1.7
    );
  }

  // Head + Icy Beard + Crown
  fillShadedEllipse(ctx, s * 0.03, -s * 0.6, s * 0.28, s * 0.26, '#7dd3fc', '#0369a1', '#090d16', 1.9);
  fillShadedPoly(
    ctx,
    [
      [-s * 0.18, -s * 0.48],
      [0, -s * 0.08],
      [s * 0.2, -s * 0.48],
    ],
    '#ffffff',
    '#93c5fd',
    '#090d16',
    1.5
  );

  const glow = Math.sin(t * 5) * 2;
  fillShadedPoly(
    ctx,
    [
      [-s * 0.24, -s * 0.8],
      [-s * 0.3, -s * 1.18 + glow],
      [0, -s * 0.96],
      [s * 0.06, -s * 1.24 + glow],
      [s * 0.32, -s * 0.8],
    ],
    '#ffffff',
    accent,
    '#0284c7',
    1.6
  );

  if (!flash) {
    drawGlowingEye(ctx, s * 0.15, -s * 0.62, s * 0.065, s * 0.05, '#e0f2fe');
    drawGlowingEye(ctx, -s * 0.05, -s * 0.62, s * 0.065, s * 0.05, '#e0f2fe');
  }

  // Articulated Arm + Massive Glacial Star-Mace
  ctx.save();
  ctx.translate(s * 0.46, -s * 0.1);
  ctx.rotate(armSwing * 0.22);
  drawVolumetricLimb(ctx, 0, 0, s * 0.16, s * 0.16, s * 0.1, s * 0.09, '#7dd3fc', '#0369a1');
  drawVolumetricLimb(ctx, s * 0.1, s * 0.22, s * 0.48, -s * 0.56, 3.8, 3.2, '#e2e8f0', '#475569');
  fillShadedEllipse(ctx, s * 0.5, -s * 0.6, s * 0.21, s * 0.21, '#ffffff', '#0284c7', '#e0f2fe', 1.8);
  ctx.restore();
}

// ---------------------------------------------------------------------------
// WORLD 5 BOSS: DESERT SAND EMPEROR
// ---------------------------------------------------------------------------
function drawSandKingBoss(
  ctx: CanvasRenderingContext2D,
  s: number,
  stride: number,
  armSwing: number,
  t: number,
  body: string,
  accent: string,
  flash: boolean
) {
  const legL = stride * s * 0.2;
  const legR = -stride * s * 0.2;

  ctx.strokeStyle = 'rgba(250, 204, 21, 0.48)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.ellipse(0, s * 0.36, s * 0.96, s * 0.3, Math.sin(t * 3) * 0.08, 0, Math.PI * 2);
  ctx.stroke();

  drawArticulatedLeg(ctx, -s * 0.2, s * 0.28, -s * 0.22 + legL, s * 0.74, s * 0.1, '#ca8a04', '#78350f', '#fbbf24', '#451a03');
  drawArticulatedLeg(ctx, s * 0.2, s * 0.28, s * 0.22 + legR, s * 0.74, s * 0.1, '#ca8a04', '#78350f', '#fbbf24', '#451a03');

  // Pharaoh Golden Armor & Scarab Pectoral
  fillShadedPoly(
    ctx,
    [
      [-s * 0.48, -s * 0.34],
      [s * 0.48, -s * 0.34],
      [s * 0.34, s * 0.4],
      [-s * 0.34, s * 0.4],
    ],
    '#eab308',
    flash ? '#ffffff' : body,
    '#090d16',
    2.1
  );
  fillShadedEllipse(ctx, 0, -s * 0.18, s * 0.32, s * 0.14, '#fde047', '#0284c7', '#090d16', 1.6);

  drawArmorPauldron(ctx, -s * 0.44, -s * 0.28, s * 0.2, s * 0.16, '#fef08a', '#92400e', accent, 0);
  drawArmorPauldron(ctx, s * 0.44, -s * 0.28, s * 0.2, s * 0.16, '#fef08a', '#92400e', accent, 0);

  // Royal Lapis & Gold Nemes Headdress
  fillShadedPoly(
    ctx,
    [
      [-s * 0.38, -s * 0.28],
      [-s * 0.24, -s * 0.92],
      [s * 0.28, -s * 0.92],
      [s * 0.38, -s * 0.28],
    ],
    '#2563eb',
    '#1e3a8a',
    '#fbbf24',
    2
  );
  drawGlowBloom(ctx, s * 0.02, -s * 1.04, s * 0.26, '#fde047', 0.55);
  fillShadedEllipse(ctx, s * 0.02, -s * 1.04, s * 0.18, s * 0.18, '#fef08a', '#d97706', '#090d16', 1.6);

  // Face
  fillShadedEllipse(ctx, s * 0.04, -s * 0.56, s * 0.22, s * 0.22, '#92400e', '#451a03', '#090d16', 1.7);
  if (!flash) {
    drawGlowingEye(ctx, s * 0.14, -s * 0.58, s * 0.06, s * 0.045, '#4ade80');
    drawGlowingEye(ctx, -s * 0.04, -s * 0.58, s * 0.06, s * 0.045, '#4ade80');
  }

  // Royal Solar Ankh Scepter
  ctx.save();
  ctx.translate(s * 0.42, -s * 0.06);
  ctx.rotate(armSwing * 0.24);
  drawVolumetricLimb(ctx, 0, 0, s * 0.12, s * 0.14, s * 0.09, s * 0.08, '#eab308', '#78350f');
  drawVolumetricLimb(ctx, 0, s * 0.34, s * 0.24, -s * 0.72, 3.2, 2.8, '#fef08a', '#b45309');
  fillShadedEllipse(ctx, s * 0.28, -s * 0.86, s * 0.14, s * 0.14, '#ffffff', '#fde047', '#090d16', 1.6);
  ctx.restore();
}

// ---------------------------------------------------------------------------
// WORLD 3: VOLCANIC DRAKE
// ---------------------------------------------------------------------------
function drawVolcanicDrake(
  ctx: CanvasRenderingContext2D,
  s: number,
  t: number,
  dist: number,
  body: string,
  accent: string,
  flash: boolean
) {
  const flap = Math.sin(t * 14 + dist * 0.09) * s * 0.5;
  drawDragonWing(ctx, -s * 0.08, -s * 0.08, s * 1.15, flap, -1, '#7c2d12', '#fb923c', '#9a3412');

  // Scaled Wyvern Torso & Armored Tail
  fillShadedPoly(
    ctx,
    [
      [-s * 0.88, s * 0.22],
      [-s * 0.3, -s * 0.34],
      [s * 0.44, -s * 0.18],
      [s * 0.52, s * 0.16],
      [-s * 0.14, s * 0.3],
    ],
    '#94a3b8',
    flash ? '#ffffff' : body,
    '#090d16',
    1.9
  );
  if (!flash) {
    drawGlowBloom(ctx, s * 0.08, -s * 0.04, s * 0.24, accent, 0.55);
    fillShadedEllipse(ctx, s * 0.08, -s * 0.04, s * 0.11, s * 0.08, '#fef08a', accent, '#090d16', 1.2);
  }

  // Horned Dragon Snout & Crest
  fillShadedPoly(
    ctx,
    [
      [s * 0.28, -s * 0.38],
      [s * 0.8, -s * 0.24],
      [s * 0.72, -s * 0.06],
      [s * 0.32, -s * 0.04],
    ],
    '#f97316',
    body,
    '#090d16',
    1.8
  );
  fillShadedPoly(
    ctx,
    [
      [s * 0.26, -s * 0.38],
      [s * 0.08, -s * 0.72],
      [s * 0.44, -s * 0.38],
    ],
    accent,
    '#9a3412',
    '#090d16',
    1.4
  );

  if (!flash) {
    drawGlowingEye(ctx, s * 0.5, -s * 0.24, s * 0.07, s * 0.05, accent);
  }

  drawDragonWing(ctx, s * 0.04, -s * 0.06, s * 1.05, -flap * 0.65, 1, '#9a3412', '#fde047', '#ea580c');
}

// ---------------------------------------------------------------------------
// WORLD 6: SKY ISLANDS
// ---------------------------------------------------------------------------
function drawSkyHarpy(
  ctx: CanvasRenderingContext2D,
  s: number,
  stride: number,
  t: number,
  dist: number,
  body: string,
  accent: string,
  flash: boolean
) {
  const flap = Math.sin(t * 16 + dist * 0.1) * s * 0.46;
  drawDragonWing(ctx, -s * 0.05, -s * 0.08, s * 1.1, flap, -1, '#e2e8f0', '#ffffff', '#60a5fa');
  drawDragonWing(ctx, s * 0.05, -s * 0.08, s * 1.05, -flap * 0.6, 1, '#e2e8f0', '#ffffff', '#3b82f6');

  // Raptor Talons
  drawArticulatedLeg(ctx, -s * 0.12, s * 0.28, -s * 0.18 + stride * 3, s * 0.62, s * 0.07, '#fbbf24', '#b45309', '#f59e0b', '#78350f');
  drawArticulatedLeg(ctx, s * 0.12, s * 0.28, s * 0.18 - stride * 3, s * 0.62, s * 0.07, '#fbbf24', '#b45309', '#f59e0b', '#78350f');

  // Feathered Avian Torso & Armor Breastplate
  fillShadedEllipse(ctx, 0, 0, s * 0.3, s * 0.4, '#93c5fd', body, '#090d16', 1.8);
  fillShadedEllipse(ctx, s * 0.1, -s * 0.42, s * 0.23, s * 0.22, '#ffffff', accent, '#090d16', 1.7);

  // Hooked Golden Beak
  fillShadedPoly(
    ctx,
    [
      [s * 0.28, -s * 0.46],
      [s * 0.54, -s * 0.36],
      [s * 0.26, -s * 0.28],
    ],
    '#fde047',
    '#b45309',
    '#090d16',
    1.5
  );
  if (!flash) {
    drawGlowingEye(ctx, s * 0.22, -s * 0.44, s * 0.06, s * 0.045, '#0ea5e9');
  }
}

function drawStormGriffon(
  ctx: CanvasRenderingContext2D,
  s: number,
  stride: number,
  t: number,
  dist: number,
  body: string,
  accent: string,
  flash: boolean
) {
  const flap = Math.sin(t * 13 + dist * 0.08) * s * 0.42;
  drawDragonWing(ctx, -s * 0.1, -s * 0.12, s * 1.12, flap, -1, '#1e3a8a', '#60a5fa', '#1e40af');

  drawArticulatedLeg(ctx, -s * 0.28, s * 0.18, -s * 0.34 + stride * 4, s * 0.54, s * 0.08, '#60a5fa', body, '#1e3a8a', '#fde047');
  drawArticulatedLeg(ctx, s * 0.26, s * 0.18, s * 0.32 - stride * 4, s * 0.54, s * 0.08, '#60a5fa', body, '#1e3a8a', '#fde047');

  fillShadedEllipse(ctx, 0, 0, s * 0.5, s * 0.28, '#93c5fd', body, '#090d16', 1.9);
  fillShadedEllipse(ctx, s * 0.44, -s * 0.18, s * 0.25, s * 0.23, '#fef08a', accent, '#090d16', 1.8);
  fillShadedPoly(
    ctx,
    [
      [s * 0.62, -s * 0.22],
      [s * 0.84, -s * 0.12],
      [s * 0.6, -s * 0.06],
    ],
    '#fde047',
    '#b45309',
    '#090d16',
    1.4
  );

  if (!flash) {
    drawGlowingEye(ctx, s * 0.52, -s * 0.2, s * 0.06, s * 0.045, '#fde047');
  }

  drawDragonWing(ctx, s * 0.06, -s * 0.08, s * 1.0, -flap * 0.6, 1, '#93c5fd', '#bae6fd', '#3b82f6');
}

function drawThunderRoc(
  ctx: CanvasRenderingContext2D,
  s: number,
  t: number,
  dist: number,
  body: string,
  accent: string,
  flash: boolean
) {
  const flap = Math.sin(t * 11 + dist * 0.08) * s * 0.54;
  drawDragonWing(ctx, -s * 0.1, -s * 0.1, s * 1.32, flap, -1, '#1e3a8a', '#60a5fa', body);

  fillShadedEllipse(ctx, 0, 0, s * 0.46, s * 0.26, '#3b82f6', body, '#090d16', 1.9);
  fillShadedEllipse(ctx, s * 0.44, -s * 0.22, s * 0.25, s * 0.24, '#e0f2fe', accent, '#090d16', 1.8);

  fillShadedPoly(
    ctx,
    [
      [s * 0.62, -s * 0.28],
      [s * 0.92, -s * 0.16],
      [s * 0.58, -s * 0.08],
    ],
    '#fef08a',
    '#d97706',
    '#090d16',
    1.5
  );

  if (!flash) {
    drawGlowingEye(ctx, s * 0.52, -s * 0.24, s * 0.065, s * 0.05, '#fde047');
  }

  drawDragonWing(ctx, s * 0.06, -s * 0.08, s * 1.18, -flap * 0.65, 1, '#93c5fd', '#fde047', '#2563eb');
}

function drawSkyDragonBoss(
  ctx: CanvasRenderingContext2D,
  s: number,
  t: number,
  dist: number,
  body: string,
  accent: string,
  flash: boolean
) {
  const flap = Math.sin(t * 10 + dist * 0.06) * s * 0.48;
  drawDragonWing(ctx, -s * 0.12, -s * 0.12, s * 1.44, flap, -1, '#1e3a8a', '#60a5fa', '#1d4ed8');

  // Serpentine Sky-Dragon Body
  fillShadedPoly(
    ctx,
    [
      [-s * 0.94, s * 0.24],
      [-s * 0.34, -s * 0.44],
      [s * 0.52, -s * 0.22],
      [s * 0.58, s * 0.2],
      [-s * 0.14, s * 0.34],
    ],
    '#60a5fa',
    flash ? '#ffffff' : body,
    '#090d16',
    2.1
  );

  // Crowned Dragon Head & Golden Beard Crest
  fillShadedPoly(
    ctx,
    [
      [s * 0.32, -s * 0.46],
      [s * 0.9, -s * 0.26],
      [s * 0.78, -s * 0.04],
      [s * 0.38, -s * 0.02],
    ],
    '#3b82f6',
    body,
    '#090d16',
    1.9
  );
  fillShadedPoly(
    ctx,
    [
      [s * 0.3, -s * 0.46],
      [s * 0.06, -s * 0.92],
      [s * 0.52, -s * 0.44],
    ],
    '#fef08a',
    accent,
    '#090d16',
    1.6
  );

  if (!flash) {
    drawGlowingEye(ctx, s * 0.54, -s * 0.28, s * 0.08, s * 0.055, '#fde047');
  }

  drawDragonWing(ctx, s * 0.08, -s * 0.08, s * 1.28, -flap * 0.65, 1, '#93c5fd', '#e0f2fe', '#2563eb');
}

// ---------------------------------------------------------------------------
// WORLD 7: ANCIENT TEMPLE
// ---------------------------------------------------------------------------
function drawAncientTempleSentinel(
  ctx: CanvasRenderingContext2D,
  s: number,
  stride: number,
  armSwing: number,
  t: number,
  body: string,
  accent: string,
  flash: boolean
) {
  const legL = stride * s * 0.2;
  const legR = -stride * s * 0.2;

  drawArticulatedLeg(ctx, -s * 0.16, s * 0.24, -s * 0.18 + legL, s * 0.66, s * 0.09, '#6d28d9', '#1e1b4b', '#a78bfa', '#312e81');
  drawArticulatedLeg(ctx, s * 0.16, s * 0.24, s * 0.18 + legR, s * 0.66, s * 0.09, '#6d28d9', '#1e1b4b', '#a78bfa', '#312e81');

  fillShadedPoly(
    ctx,
    [
      [-s * 0.38, -s * 0.28],
      [s * 0.38, -s * 0.28],
      [s * 0.3, s * 0.32],
      [-s * 0.3, s * 0.32],
    ],
    '#8b5cf6',
    body,
    '#090d16',
    1.9
  );
  drawArmorPauldron(ctx, -s * 0.36, -s * 0.24, s * 0.18, s * 0.14, '#e9d5ff', '#4c1d95', '#fbbf24', 0);
  drawArmorPauldron(ctx, s * 0.36, -s * 0.24, s * 0.18, s * 0.14, '#e9d5ff', '#4c1d95', '#fbbf24', 0);

  // Jackal-Eared Anubis Sentinel Mask
  fillShadedEllipse(ctx, 0, -s * 0.48, s * 0.25, s * 0.25, '#4c1d95', '#1e1b4b', '#090d16', 1.8);
  for (const sx of [-1, 1]) {
    fillShadedPoly(
      ctx,
      [
        [sx * s * 0.12, -s * 0.66],
        [sx * s * 0.28, -s * 1.04],
        [sx * s * 0.24, -s * 0.56],
      ],
      '#fef08a',
      accent,
      '#090d16',
      1.5
    );
  }
  if (!flash) {
    drawGlowingEye(ctx, s * 0.1, -s * 0.5, s * 0.06, s * 0.045, '#e879f9');
  }

  // Spear Arm + Orbiting Arcane Shield
  ctx.save();
  ctx.translate(s * 0.34, -s * 0.06);
  ctx.rotate(armSwing * 0.28);
  drawVolumetricLimb(ctx, 0, 0, s * 0.12, s * 0.14, s * 0.08, s * 0.07, '#a78bfa', '#312e81');
  drawVolumetricLimb(ctx, 0, s * 0.25, s * 0.38, -s * 0.66, 2.8, 2.2, '#f5d0fe', '#6d28d9');
  ctx.restore();

  if (!flash) {
    drawGlowBloom(ctx, Math.cos(t * 4) * s * 0.42, -s * 0.08, s * 0.2, '#e879f9', 0.55);
    fillShadedEllipse(ctx, Math.cos(t * 4) * s * 0.42, -s * 0.08, s * 0.13, s * 0.13, '#fdf4ff', '#9333ea', '#ffffff', 1.4);
  }
}

function drawRuneStoneGolem(
  ctx: CanvasRenderingContext2D,
  s: number,
  stride: number,
  armSwing: number,
  t: number,
  body: string,
  accent: string,
  flash: boolean
) {
  const legL = stride * s * 0.18;
  const legR = -stride * s * 0.18;

  drawArticulatedLeg(ctx, -s * 0.24, s * 0.24, -s * 0.26 + legL, s * 0.68, s * 0.13, '#71717a', '#27272a', '#a1a1aa', '#3f3f46');
  drawArticulatedLeg(ctx, s * 0.24, s * 0.24, s * 0.26 + legR, s * 0.68, s * 0.13, '#71717a', '#27272a', '#a1a1aa', '#3f3f46');

  fillShadedPoly(
    ctx,
    [
      [-s * 0.48, -s * 0.36],
      [s * 0.48, -s * 0.36],
      [s * 0.38, s * 0.36],
      [-s * 0.38, s * 0.36],
    ],
    '#71717a',
    flash ? '#ffffff' : body,
    '#090d16',
    2.1
  );

  if (!flash) {
    drawGlowBloom(ctx, 0, 0, s * 0.28, accent, 0.55 + Math.sin(t * 5) * 0.2);
    fillShadedPoly(
      ctx,
      [
        [0, -s * 0.22],
        [s * 0.16, 0],
        [0, s * 0.22],
        [-s * 0.16, 0],
      ],
      '#f5d0fe',
      accent,
      '#090d16',
      1.3
    );
  }

  fillShadedPoly(
    ctx,
    [
      [-s * 0.24, -s * 0.68],
      [s * 0.24, -s * 0.68],
      [s * 0.22, -s * 0.36],
      [-s * 0.22, -s * 0.36],
    ],
    '#52525b',
    '#27272a',
    '#090d16',
    1.8
  );
  if (!flash) {
    drawGlowingEye(ctx, s * 0.09, -s * 0.52, s * 0.06, s * 0.04, '#c4b5fd');
  }

  ctx.save();
  ctx.translate(s * 0.44, 0);
  ctx.rotate(armSwing * 0.25);
  drawVolumetricLimb(ctx, 0, 0, s * 0.12, s * 0.1, s * 0.1, s * 0.1, '#71717a', '#27272a');
  fillShadedPoly(
    ctx,
    [
      [0, -s * 0.16],
      [s * 0.28, -s * 0.16],
      [s * 0.28, s * 0.2],
      [0, s * 0.2],
    ],
    '#71717a',
    '#3f3f46',
    '#090d16',
    1.6
  );
  ctx.restore();
}

function drawTempleSpecter(
  ctx: CanvasRenderingContext2D,
  s: number,
  t: number,
  body: string,
  accent: string,
  flash: boolean
) {
  const floatWisp = Math.sin(t * 6) * 4;
  drawGlowBloom(ctx, 0, 0, s * 0.72, accent, 0.38);

  fillShadedPoly(
    ctx,
    [
      [0, -s * 0.7],
      [s * 0.42, -s * 0.24],
      [s * 0.32, s * 0.5],
      [s * 0.12, s * 0.34 + floatWisp * 0.4],
      [0, s * 0.58],
      [-s * 0.16, s * 0.34 - floatWisp * 0.4],
      [-s * 0.34, s * 0.52],
      [-s * 0.42, -s * 0.24],
    ],
    '#a78bfa',
    flash ? '#ffffff' : body,
    accent,
    1.9
  );

  if (!flash) {
    fillShadedEllipse(ctx, s * 0.05, -s * 0.42, s * 0.18, s * 0.18, '#1e1b4b', '#090d16', '#090d16', 1.4);
    drawGlowingEye(ctx, s * 0.12, -s * 0.43, s * 0.065, s * 0.05, '#f0abfc');

    // Floating Soul Lantern
    drawGlowBloom(ctx, s * 0.44, -s * 0.1 + floatWisp, s * 0.24, '#fde047', 0.65);
    fillShadedEllipse(ctx, s * 0.44, -s * 0.1 + floatWisp, s * 0.12, s * 0.12, '#ffffff', '#fbbf24', '#090d16', 1.4);
  }
}

function drawStoneTitanBoss(
  ctx: CanvasRenderingContext2D,
  s: number,
  stride: number,
  armSwing: number,
  t: number,
  body: string,
  accent: string,
  flash: boolean
) {
  const legL = stride * s * 0.16;
  const legR = -stride * s * 0.16;

  // Orbiting Floating Rune Monoliths
  for (let i = 0; i < 4; i++) {
    const a = t * 1.8 + (Math.PI * 2 * i) / 4;
    const mx = Math.cos(a) * s * 0.85;
    const my = Math.sin(a) * s * 0.42 - s * 0.2;
    fillShadedPoly(
      ctx,
      [
        [mx - 7, my - 9],
        [mx + 7, my - 9],
        [mx + 7, my + 9],
        [mx - 7, my + 9],
      ],
      '#f5d0fe',
      accent,
      '#090d16',
      1.5
    );
  }

  drawArticulatedLeg(ctx, -s * 0.26, s * 0.3, -s * 0.28 + legL, s * 0.74, s * 0.14, '#6d28d9', '#27272a', '#a78bfa', '#1e1b4b');
  drawArticulatedLeg(ctx, s * 0.26, s * 0.3, s * 0.28 + legR, s * 0.74, s * 0.14, '#6d28d9', '#27272a', '#a78bfa', '#1e1b4b');

  fillShadedPoly(
    ctx,
    [
      [-s * 0.58, -s * 0.38],
      [s * 0.58, -s * 0.38],
      [s * 0.42, s * 0.44],
      [-s * 0.42, s * 0.44],
    ],
    '#7c3aed',
    flash ? '#ffffff' : body,
    '#c4b5fd',
    2.2
  );

  // Temple Crown Head
  fillShadedPoly(
    ctx,
    [
      [-s * 0.28, -s * 0.82],
      [s * 0.28, -s * 0.82],
      [s * 0.26, -s * 0.4],
      [-s * 0.26, -s * 0.4],
    ],
    '#4c1d95',
    '#1e1b4b',
    '#c4b5fd',
    1.9
  );
  if (!flash) {
    drawGlowBloom(ctx, 0, -s * 0.6, s * 0.25, '#e879f9', 0.65);
    fillShadedEllipse(ctx, 0, -s * 0.6, s * 0.11, s * 0.11, '#ffffff', '#e879f9', '#090d16', 1.4);
  }

  ctx.save();
  ctx.translate(s * 0.48, -s * 0.05);
  ctx.rotate(armSwing * 0.2);
  drawVolumetricLimb(ctx, 0, 0, s * 0.14, s * 0.12, s * 0.12, s * 0.11, '#6d28d9', '#1e1b4b');
  fillShadedPoly(
    ctx,
    [
      [0, -s * 0.22],
      [s * 0.36, -s * 0.22],
      [s * 0.36, s * 0.26],
      [0, s * 0.26],
    ],
    '#71717a',
    '#27272a',
    '#ddd6fe',
    1.8
  );
  ctx.restore();
}

// ---------------------------------------------------------------------------
// WORLD 8: MUSHROOM KINGDOM
// ---------------------------------------------------------------------------
function drawToadstoolGremlin(
  ctx: CanvasRenderingContext2D,
  s: number,
  stride: number,
  armSwing: number,
  body: string,
  accent: string,
  flash: boolean
) {
  const legL = stride * s * 0.24;
  const legR = -stride * s * 0.24;

  drawArticulatedLeg(ctx, -s * 0.14, s * 0.22, -s * 0.18 + legL, s * 0.62, s * 0.08, '#fdf4ff', '#a21caf', '#e879f9', '#581c87');
  drawArticulatedLeg(ctx, s * 0.14, s * 0.22, s * 0.18 + legR, s * 0.62, s * 0.08, '#fdf4ff', '#a21caf', '#e879f9', '#581c87');

  fillShadedEllipse(ctx, 0, s * 0.05, s * 0.34, s * 0.3, '#fdf4ff', '#c084fc', '#090d16', 1.8);

  // Giant Spotted Toadstool Cap
  fillShadedPoly(
    ctx,
    [
      [-s * 0.56, -s * 0.22],
      [-s * 0.42, -s * 0.62],
      [0, -s * 0.8],
      [s * 0.42, -s * 0.62],
      [s * 0.56, -s * 0.22],
    ],
    '#f0abfc',
    body,
    '#090d16',
    1.9
  );

  if (!flash) {
    ctx.fillStyle = accent;
    ctx.beginPath();
    ctx.arc(-s * 0.22, -s * 0.44, s * 0.1, 0, Math.PI * 2);
    ctx.arc(s * 0.18, -s * 0.5, s * 0.08, 0, Math.PI * 2);
    ctx.fill();

    drawGlowingEye(ctx, s * 0.14, -s * 0.02, s * 0.065, s * 0.055, '#fde047');
    drawGlowingEye(ctx, -s * 0.06, -s * 0.02, s * 0.065, s * 0.055, '#fde047');
  }

  ctx.save();
  ctx.translate(s * 0.26, 0);
  ctx.rotate(armSwing * 0.35);
  drawVolumetricLimb(ctx, 0, 0, s * 0.18, s * 0.04, s * 0.07, s * 0.06, '#f5d0fe', '#9333ea');
  fillShadedEllipse(ctx, s * 0.2, 0, s * 0.12, s * 0.12, '#d9f99d', '#65a30d', '#090d16', 1.4);
  ctx.restore();
}

function drawToxicSporeHulk(
  ctx: CanvasRenderingContext2D,
  s: number,
  stride: number,
  armSwing: number,
  t: number,
  body: string,
  accent: string,
  flash: boolean
) {
  const legL = stride * s * 0.18;
  const legR = -stride * s * 0.18;

  drawArticulatedLeg(ctx, -s * 0.2, s * 0.25, -s * 0.24 + legL, s * 0.68, s * 0.13, '#d946ef', '#4a044e', '#a3e635', '#3b0764');
  drawArticulatedLeg(ctx, s * 0.2, s * 0.25, s * 0.24 + legR, s * 0.68, s * 0.13, '#d946ef', '#4a044e', '#a3e635', '#3b0764');

  fillShadedEllipse(ctx, 0, 0, s * 0.48, s * 0.42, '#d946ef', flash ? '#ffffff' : body, '#090d16', 2);

  const bub = Math.sin(t * 7) * 2.5;
  if (!flash) {
    drawGlowBloom(ctx, -s * 0.12, -s * 0.36, s * 0.3, '#bef264', 0.45);
    fillShadedEllipse(ctx, -s * 0.26, -s * 0.32, s * 0.16, s * 0.16, '#ecfccb', accent, '#365314', 1.3);
    fillShadedEllipse(ctx, s * 0.04, -s * 0.44 + bub * 0.3, s * 0.14, s * 0.14, '#ecfccb', accent, '#365314', 1.3);
  }

  fillShadedEllipse(ctx, s * 0.16, -s * 0.24, s * 0.26, s * 0.24, '#e879f9', body, '#090d16', 1.8);
  if (!flash) {
    drawGlowingEye(ctx, s * 0.28, -s * 0.26, s * 0.075, s * 0.055, '#bef264');
  }

  ctx.save();
  ctx.translate(s * 0.34, s * 0.04);
  ctx.rotate(armSwing * 0.28);
  drawVolumetricLimb(ctx, 0, 0, s * 0.16, s * 0.06, s * 0.11, s * 0.1, '#d946ef', body);
  fillShadedEllipse(ctx, s * 0.2, s * 0.04, s * 0.16, s * 0.14, '#d9f99d', '#4d7c0f', '#090d16', 1.5);
  ctx.restore();
}

function drawSporeMoth(
  ctx: CanvasRenderingContext2D,
  s: number,
  t: number,
  dist: number,
  body: string,
  accent: string,
  flash: boolean
) {
  const flap = Math.sin(t * 16 + dist * 0.09) * s * 0.48;
  for (const dir of [-1, 1] as const) {
    fillShadedPoly(
      ctx,
      [
        [0, -s * 0.08],
        [dir * s * 0.72, -s * 0.92 + flap * dir],
        [dir * s * 1.15, -s * 0.18 + flap * dir],
        [dir * s * 0.32, s * 0.32],
      ],
      '#f0abfc',
      body,
      '#090d16',
      1.7
    );
    if (!flash) {
      fillShadedEllipse(
        ctx,
        dir * s * 0.65,
        -s * 0.28 + flap * dir * 0.5,
        s * 0.15,
        s * 0.15,
        '#fef08a',
        accent,
        '#090d16',
        1.2
      );
    }
  }
  fillShadedEllipse(ctx, 0, 0, s * 0.22, s * 0.42, '#7e22ce', '#2e1065', '#090d16', 1.8);
  if (!flash) {
    drawGlowingEye(ctx, s * 0.08, -s * 0.28, s * 0.055, s * 0.05, '#fde047');
  }
}

function drawToxicOverlordBoss(
  ctx: CanvasRenderingContext2D,
  s: number,
  stride: number,
  armSwing: number,
  t: number,
  body: string,
  accent: string,
  flash: boolean
) {
  const legL = stride * s * 0.16;
  const legR = -stride * s * 0.16;

  drawArticulatedLeg(ctx, -s * 0.26, s * 0.3, -s * 0.28 + legL, s * 0.74, s * 0.13, '#a21caf', '#3b0764', '#a3e635', '#1e1b4b');
  drawArticulatedLeg(ctx, s * 0.26, s * 0.3, s * 0.28 + legR, s * 0.74, s * 0.13, '#a21caf', '#3b0764', '#a3e635', '#1e1b4b');

  fillShadedEllipse(ctx, 0, s * 0.04, s * 0.56, s * 0.48, '#c026d3', flash ? '#ffffff' : body, '#090d16', 2.2);

  // Giant Triple-Capped Fungal Crown Overlord
  for (const [cx, cy, cr] of [
    [-0.32, -0.44, 0.34],
    [0.32, -0.44, 0.32],
    [0, -0.66, 0.44],
  ]) {
    fillShadedPoly(
      ctx,
      [
        [s * (cx - cr), s * cy],
        [s * (cx - cr * 0.7), s * (cy - cr * 0.7)],
        [s * cx, s * (cy - cr)],
        [s * (cx + cr * 0.7), s * (cy - cr * 0.7)],
        [s * (cx + cr), s * cy],
      ],
      '#f0abfc',
      '#701a75',
      '#090d16',
      1.8
    );
  }

  if (!flash) {
    ctx.fillStyle = accent;
    ctx.beginPath();
    ctx.arc(-s * 0.12, -s * 0.84, s * 0.09, 0, Math.PI * 2);
    ctx.arc(s * 0.16, -s * 0.88, s * 0.08, 0, Math.PI * 2);
    ctx.fill();
    drawGlowingEye(ctx, s * 0.16, -s * 0.16, s * 0.075, s * 0.06, '#bef264');
    drawGlowingEye(ctx, -s * 0.08, -s * 0.16, s * 0.075, s * 0.06, '#bef264');
  }

  ctx.save();
  ctx.translate(s * 0.44, 0);
  ctx.rotate(armSwing * 0.22 + Math.sin(t * 5) * 0.06);
  drawVolumetricLimb(ctx, 0, 0, s * 0.14, s * 0.1, s * 0.11, s * 0.09, '#c026d3', body);
  drawVolumetricLimb(ctx, 0, s * 0.25, s * 0.36, -s * 0.7, 3.6, 2.8, '#ecfccb', '#4d7c0f');
  drawGlowBloom(ctx, s * 0.38, -s * 0.76, s * 0.28, '#bef264', 0.65);
  fillShadedEllipse(ctx, s * 0.38, -s * 0.76, s * 0.16, s * 0.16, '#ffffff', '#84cc16', '#090d16', 1.6);
  ctx.restore();
}

// ---------------------------------------------------------------------------
// WORLD 9: OCEAN ABYSS
// ---------------------------------------------------------------------------
function drawAbyssRaider(
  ctx: CanvasRenderingContext2D,
  s: number,
  stride: number,
  armSwing: number,
  t: number,
  body: string,
  accent: string,
  flash: boolean
) {
  const legL = stride * s * 0.22;
  const legR = -stride * s * 0.22;

  // Dorsal Shark Fin
  fillShadedPoly(
    ctx,
    [
      [-s * 0.18, -s * 0.24],
      [-s * 0.44, -s * 0.8],
      [s * 0.12, -s * 0.32],
    ],
    '#99f6e4',
    accent,
    '#090d16',
    1.7
  );

  drawArticulatedLeg(ctx, -s * 0.15, s * 0.24, -s * 0.18 + legL, s * 0.64, s * 0.085, '#2dd4bf', '#134e4a', '#5eead4', '#0f766e');
  drawArticulatedLeg(ctx, s * 0.15, s * 0.24, s * 0.18 + legR, s * 0.64, s * 0.085, '#2dd4bf', '#134e4a', '#5eead4', '#0f766e');

  fillShadedEllipse(ctx, 0, 0, s * 0.36, s * 0.34, '#2dd4bf', flash ? '#ffffff' : body, '#090d16', 1.9);
  fillShadedEllipse(ctx, s * 0.16, -s * 0.22, s * 0.2, s * 0.18, '#5eead4', body, '#090d16', 1.6);

  // Bioluminescent Angler Lure
  if (!flash) {
    ctx.strokeStyle = accent;
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(s * 0.12, -s * 0.34);
    ctx.quadraticCurveTo(s * 0.38, -s * 0.72, s * 0.48, -s * 0.46 + Math.sin(t * 7) * 2.5);
    ctx.stroke();
    drawGlowBloom(ctx, s * 0.48, -s * 0.46 + Math.sin(t * 7) * 2.5, s * 0.22, '#5eead4', 0.7);
    fillShadedEllipse(ctx, s * 0.48, -s * 0.46 + Math.sin(t * 7) * 2.5, 4.5, 4.5, '#ffffff', '#14b8a6', '#090d16', 1.1);
    drawGlowingEye(ctx, s * 0.24, -s * 0.24, s * 0.065, s * 0.05, '#fde047');
  }

  ctx.save();
  ctx.translate(s * 0.24, s * 0.04);
  ctx.rotate(armSwing * 0.28);
  drawVolumetricLimb(ctx, 0, 0, s * 0.14, s * 0.08, s * 0.08, s * 0.07, '#2dd4bf', body);
  drawVolumetricLimb(ctx, 0, s * 0.16, s * 0.46, -s * 0.38, 2.8, 2.2, '#e2e8f0', '#475569');
  ctx.restore();
}

function drawKrakenCrabBruiser(
  ctx: CanvasRenderingContext2D,
  s: number,
  stride: number,
  armSwing: number,
  _t: number,
  body: string,
  accent: string,
  flash: boolean
) {
  for (let i = -1; i <= 1; i++) {
    drawArticulatedLeg(ctx, i * s * 0.24, s * 0.2, i * s * 0.32 + stride * 4, s * 0.64, s * 0.08, '#2dd4bf', '#134e4a', '#0d9488', '#090d16');
  }

  fillShadedEllipse(ctx, 0, -s * 0.04, s * 0.56, s * 0.4, '#14b8a6', flash ? '#ffffff' : body, '#090d16', 2);
  fillShadedPoly(
    ctx,
    [
      [-s * 0.44, -s * 0.14],
      [-s * 0.28, -s * 0.48],
      [0, -s * 0.56],
      [s * 0.28, -s * 0.48],
      [s * 0.44, -s * 0.14],
    ],
    '#0d9488',
    '#115e59',
    '#090d16',
    1.8
  );

  // Giant Snapping Pincer Claw
  ctx.save();
  ctx.translate(s * 0.38, s * 0.04);
  ctx.rotate(armSwing * 0.24);
  drawVolumetricLimb(ctx, 0, 0, s * 0.16, s * 0.04, s * 0.11, s * 0.1, '#2dd4bf', '#0f766e');
  fillShadedEllipse(ctx, s * 0.24, 0, s * 0.24, s * 0.18, '#67e8f9', accent, '#090d16', 1.7);
  ctx.restore();

  if (!flash) {
    drawGlowingEye(ctx, s * 0.24, -s * 0.18, s * 0.065, s * 0.055, '#fde047');
  }
}

function drawAbyssManta(
  ctx: CanvasRenderingContext2D,
  s: number,
  t: number,
  dist: number,
  body: string,
  accent: string,
  flash: boolean
) {
  const glide = Math.sin(t * 10 + dist * 0.07) * s * 0.38;
  fillShadedPoly(
    ctx,
    [
      [-s * 0.92, 0],
      [-s * 0.2, -s * 0.88 + glide],
      [s * 0.56, -s * 0.16],
      [s * 0.66, 0],
      [s * 0.56, s * 0.16],
      [-s * 0.2, s * 0.88 - glide],
    ],
    '#38bdf8',
    flash ? '#ffffff' : body,
    '#090d16',
    1.9
  );

  if (!flash) {
    ctx.strokeStyle = accent;
    ctx.lineWidth = 2.8;
    ctx.beginPath();
    ctx.moveTo(-s * 0.3, -s * 0.35 + glide * 0.35);
    ctx.lineTo(s * 0.25, -s * 0.12);
    ctx.moveTo(-s * 0.3, s * 0.35 - glide * 0.35);
    ctx.lineTo(s * 0.25, s * 0.12);
    ctx.stroke();
    drawGlowingEye(ctx, s * 0.42, -s * 0.08, s * 0.05, s * 0.04, '#fde047');
  }
}

function drawLeviathanBoss(
  ctx: CanvasRenderingContext2D,
  s: number,
  stride: number,
  armSwing: number,
  t: number,
  body: string,
  accent: string,
  flash: boolean
) {
  const wave = Math.sin(t * 6) * 6;
  // Writhing Kraken Tentacles as volumetric limbs
  for (const offset of [-0.36, -0.14, 0.14, 0.36]) {
    const midX = s * offset + stride * 7;
    const midY = s * 0.52;
    const endX = s * offset - stride * 5;
    const endY = s * 0.76;
    drawVolumetricLimb(ctx, s * offset, s * 0.28, midX, midY, s * 0.085, s * 0.06, '#0891b2', '#164e63');
    drawVolumetricLimb(ctx, midX, midY, endX, endY, s * 0.06, s * 0.03, '#22d3ee', '#0e7490');
  }

  fillShadedPoly(
    ctx,
    [
      [-s * 0.22, -s * 0.42],
      [-s * 0.62, -s * 1.1 + wave * 0.4],
      [s * 0.16, -s * 0.48],
    ],
    '#99f6e4',
    accent,
    '#090d16',
    1.8
  );

  fillShadedEllipse(ctx, 0, 0, s * 0.54, s * 0.44, '#0891b2', flash ? '#ffffff' : body, '#090d16', 2.2);
  drawArmorPauldron(ctx, -s * 0.42, -s * 0.22, s * 0.2, s * 0.16, '#2dd4bf', '#134e4a', '#fde047', -1);

  fillShadedEllipse(ctx, s * 0.18, -s * 0.52, s * 0.32, s * 0.3, '#14b8a6', '#134e4a', '#090d16', 1.9);
  if (!flash) {
    drawGlowingEye(ctx, s * 0.3, -s * 0.55, s * 0.075, s * 0.055, '#5eead4');
  }

  // Golden Coral Trident
  ctx.save();
  ctx.translate(s * 0.44, -s * 0.12);
  ctx.rotate(armSwing * 0.22);
  drawVolumetricLimb(ctx, 0, 0, s * 0.14, s * 0.1, s * 0.1, s * 0.09, '#14b8a6', body);
  drawVolumetricLimb(ctx, 0, s * 0.3, s * 0.38, -s * 0.76, 3.6, 2.8, '#fef08a', '#b45309');
  ctx.restore();
}

// ---------------------------------------------------------------------------
// WORLD 10: DRAGON'S REALM
// ---------------------------------------------------------------------------
function drawAbyssalWarlord(
  ctx: CanvasRenderingContext2D,
  s: number,
  stride: number,
  armSwing: number,
  body: string,
  accent: string,
  flash: boolean
) {
  const legL = stride * s * 0.22;
  const legR = -stride * s * 0.22;

  fillShadedPoly(
    ctx,
    [
      [-s * 0.24, -s * 0.32],
      [-s * 0.72, s * 0.58],
      [-s * 0.06, s * 0.4],
    ],
    '#7f1d1d',
    '#290808',
    '#090d16',
    1.8
  );

  drawArticulatedLeg(ctx, -s * 0.18, s * 0.26, -s * 0.2 + legL, s * 0.68, s * 0.11, '#52525b', '#090d16', '#ef4444', '#18181b');
  drawArticulatedLeg(ctx, s * 0.18, s * 0.26, s * 0.2 + legR, s * 0.68, s * 0.11, '#52525b', '#090d16', '#ef4444', '#18181b');

  fillShadedPoly(
    ctx,
    [
      [-s * 0.44, -s * 0.3],
      [s * 0.44, -s * 0.3],
      [s * 0.36, s * 0.36],
      [-s * 0.36, s * 0.36],
    ],
    '#b91c1c',
    flash ? '#ffffff' : body,
    '#090d16',
    2
  );
  drawArmorPauldron(ctx, -s * 0.4, -s * 0.24, s * 0.2, s * 0.16, '#ef4444', '#450a0a', '#fbbf24', -1);
  drawArmorPauldron(ctx, s * 0.4, -s * 0.24, s * 0.2, s * 0.16, '#ef4444', '#450a0a', '#fbbf24', 1);

  fillShadedEllipse(ctx, s * 0.02, -s * 0.54, s * 0.27, s * 0.26, '#3f3f46', '#090d16', '#090d16', 1.8);
  for (const sx of [-1, 1]) {
    fillShadedPoly(
      ctx,
      [
        [sx * s * 0.16, -s * 0.66],
        [sx * s * 0.46, -s * 1.04],
        [sx * s * 0.04, -s * 0.74],
      ],
      '#fca5a5',
      accent,
      '#090d16',
      1.5
    );
  }
  if (!flash) {
    drawGlowingEye(ctx, s * 0.14, -s * 0.54, s * 0.065, s * 0.045, '#f87171');
  }

  ctx.save();
  ctx.translate(s * 0.36, -s * 0.06);
  ctx.rotate(armSwing * 0.28);
  drawVolumetricLimb(ctx, 0, 0, s * 0.14, s * 0.12, s * 0.09, s * 0.08, '#991b1b', '#18181b');
  fillShadedPoly(
    ctx,
    [
      [0, s * 0.2],
      [s * 0.52, -s * 0.56],
      [s * 0.62, -s * 0.42],
      [s * 0.16, s * 0.22],
    ],
    '#fca5a5',
    '#dc2626',
    '#090d16',
    1.6
  );
  ctx.restore();
}

function drawDragonbornPaladin(
  ctx: CanvasRenderingContext2D,
  s: number,
  stride: number,
  armSwing: number,
  _t: number,
  body: string,
  accent: string,
  flash: boolean
) {
  const legL = stride * s * 0.2;
  const legR = -stride * s * 0.2;

  drawArticulatedLeg(ctx, -s * 0.2, s * 0.26, -s * 0.22 + legL, s * 0.68, s * 0.12, '#dc2626', '#450a0a', '#fbbf24', '#1c1917');
  drawArticulatedLeg(ctx, s * 0.2, s * 0.26, s * 0.22 + legR, s * 0.68, s * 0.12, '#dc2626', '#450a0a', '#fbbf24', '#1c1917');

  fillShadedPoly(
    ctx,
    [
      [-s * 0.48, -s * 0.3],
      [s * 0.48, -s * 0.3],
      [s * 0.38, s * 0.38],
      [-s * 0.38, s * 0.38],
    ],
    '#dc2626',
    flash ? '#ffffff' : body,
    '#090d16',
    2
  );

  // Dragon Wing Pauldrons
  for (const sx of [-1, 1]) {
    fillShadedPoly(
      ctx,
      [
        [sx * s * 0.36, -s * 0.3],
        [sx * s * 0.68, -s * 0.72],
        [sx * s * 0.56, -s * 0.14],
      ],
      '#fef08a',
      accent,
      '#090d16',
      1.6
    );
  }

  // Dragon-Snouted Paladin Helm
  fillShadedPoly(
    ctx,
    [
      [-s * 0.18, -s * 0.7],
      [s * 0.5, -s * 0.54],
      [s * 0.44, -s * 0.36],
      [-s * 0.18, -s * 0.38],
    ],
    '#ef4444',
    '#7f1d1d',
    '#090d16',
    1.8
  );
  if (!flash) {
    drawGlowingEye(ctx, s * 0.22, -s * 0.54, s * 0.065, s * 0.045, '#fde047');
  }

  // Dragon Crest Shield
  fillShadedPoly(
    ctx,
    [
      [-s * 0.56, -s * 0.2],
      [-s * 0.16, -s * 0.2],
      [-s * 0.18, s * 0.18],
      [-s * 0.36, s * 0.34],
      [-s * 0.54, s * 0.18],
    ],
    '#fef08a',
    accent,
    '#090d16',
    1.7
  );

  ctx.save();
  ctx.translate(s * 0.38, -s * 0.06);
  ctx.rotate(armSwing * 0.26);
  drawVolumetricLimb(ctx, 0, 0, s * 0.12, s * 0.12, s * 0.1, s * 0.09, '#ef4444', '#7f1d1d');
  fillShadedPoly(
    ctx,
    [
      [0, s * 0.22],
      [s * 0.56, -s * 0.6],
      [s * 0.66, -s * 0.48],
      [s * 0.14, s * 0.26],
    ],
    '#f8fafc',
    '#94a3b8',
    '#090d16',
    1.7
  );
  ctx.restore();
}

function drawShadowWyvern(
  ctx: CanvasRenderingContext2D,
  s: number,
  t: number,
  dist: number,
  body: string,
  accent: string,
  flash: boolean
) {
  const flap = Math.sin(t * 14 + dist * 0.09) * s * 0.52;
  drawDragonWing(ctx, -s * 0.08, -s * 0.1, s * 1.24, flap, -1, '#18181b', '#7f1d1d', '#090d16');

  fillShadedPoly(
    ctx,
    [
      [-s * 0.88, s * 0.22],
      [-s * 0.26, -s * 0.36],
      [s * 0.46, -s * 0.18],
      [s * 0.54, s * 0.16],
      [-s * 0.14, s * 0.32],
    ],
    '#7f1d1d',
    flash ? '#ffffff' : body,
    '#090d16',
    1.9
  );
  fillShadedPoly(
    ctx,
    [
      [s * 0.28, -s * 0.4],
      [s * 0.8, -s * 0.22],
      [s * 0.72, -s * 0.04],
      [s * 0.32, -s * 0.04],
    ],
    '#991b1b',
    body,
    '#090d16',
    1.8
  );

  if (!flash) {
    drawGlowingEye(ctx, s * 0.5, -s * 0.24, s * 0.07, s * 0.05, accent);
  }

  drawDragonWing(ctx, s * 0.06, -s * 0.06, s * 1.1, -flap * 0.6, 1, '#450a0a', '#dc2626', '#450a0a');
}

function drawDarkDragonKingBoss(
  ctx: CanvasRenderingContext2D,
  s: number,
  t: number,
  dist: number,
  body: string,
  accent: string,
  flash: boolean
) {
  const flap = Math.sin(t * 9 + dist * 0.05) * s * 0.46;

  // Vast Abyssal Crimson-Black Back Wing
  drawDragonWing(ctx, -s * 0.14, -s * 0.16, s * 1.54, flap, -1, '#090d16', '#dc2626', '#18181b');

  // Heavy Scaled Tail with Glowing Ember Blade Tip
  fillShadedPoly(
    ctx,
    [
      [-s * 0.36, s * 0.12],
      [-s * 1.1, s * 0.38],
      [-s * 1.24, s * 0.18],
      [-s * 0.96, s * 0.12],
      [-s * 0.22, -s * 0.06],
    ],
    '#450a0a',
    '#090d16',
    '#090d16',
    2
  );

  // Colossal Obsidian & Molten Dragon Torso
  fillShadedEllipse(ctx, 0, 0, s * 0.62, s * 0.44, '#3f3f46', flash ? '#ffffff' : body, '#ef4444', 2.4);

  if (!flash) {
    drawGlowBloom(ctx, s * 0.1, s * 0.02, s * 0.38, '#ef4444', 0.65);
    fillShadedEllipse(ctx, s * 0.1, s * 0.02, s * 0.19, s * 0.14, '#fef08a', '#dc2626', '#090d16', 1.4);
  }

  // Crowned Dragon Head & Triple Blazing Horns
  fillShadedPoly(
    ctx,
    [
      [s * 0.32, -s * 0.5],
      [s * 0.98, -s * 0.24],
      [s * 0.88, -s * 0.02],
      [s * 0.38, s * 0.06],
    ],
    '#3f3f46',
    '#090d16',
    '#ef4444',
    2
  );
  fillShadedPoly(
    ctx,
    [
      [s * 0.32, -s * 0.48],
      [s * 0.08, -s * 1.06],
      [s * 0.48, -s * 0.5],
    ],
    '#fef08a',
    accent,
    '#090d16',
    1.6
  );
  fillShadedPoly(
    ctx,
    [
      [s * 0.46, -s * 0.44],
      [s * 0.38, -s * 0.94],
      [s * 0.62, -s * 0.4],
    ],
    '#fde047',
    '#dc2626',
    '#090d16',
    1.5
  );

  if (!flash) {
    drawGlowingEye(ctx, s * 0.62, -s * 0.26, s * 0.085, s * 0.055, '#fde047');
  }

  // Foremost Dragon Wing
  drawDragonWing(ctx, s * 0.08, -s * 0.08, s * 1.38, -flap * 0.6, 1, '#991b1b', '#f87171', '#450a0a');
}
