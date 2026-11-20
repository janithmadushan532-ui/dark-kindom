import { ActiveEnemyState, DefeatedEffect } from '../types';
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
import { drawSpecializedAndBossMonster } from './monsterBossRigs';
import { getCanonicalMonsterRadius } from './monsterScaling';

export function drawIllustratedMonster(
  ctx: CanvasRenderingContext2D,
  e: ActiveEnemyState,
  selected: boolean,
  t: number
) {
  const s = getCanonicalMonsterRadius(e.enemyClass, e.isBoss, e.size);
  const seed = (e.instanceId.charCodeAt(e.instanceId.length - 1) || 0) * 0.63;
  const animT = (e.walkPhase > 0 ? e.walkPhase : t) + seed;
  const stride = Math.sin(animT * 10.5);
  const armSwing = Math.cos(animT * 10.5);
  const walkBob = e.isFlying
    ? Math.sin(animT * 7.5) * 6.5
    : Math.abs(stride) * 3.2;
  const facingRight = e.vx >= -0.05;

  // Lunge attack & recoil stagger kinematics + aerial altitude lift
  const lunge = e.attackLungeTimer > 0 ? Math.sin((e.attackLungeTimer / 0.35) * Math.PI) : 0;
  const stagger = e.hitFlash > 0 ? -0.14 : 0;
  const flyLift = e.isFlying ? (e.flyAltitude ?? (e.isBoss ? 36 : 26)) * 0.72 : 0;

  ctx.save();
  ctx.translate(e.x, e.y);

  // Soft Ground Drop Shadow (stays anchored on ground plane even when flying)
  ctx.fillStyle = e.isFlying ? 'rgba(0, 0, 0, 0.36)' : 'rgba(0, 0, 0, 0.44)';
  ctx.beginPath();
  ctx.ellipse(
    0,
    e.isFlying ? 10 : s * 0.74,
    s * (e.isFlying ? 0.74 : 0.88),
    s * (e.isFlying ? 0.3 : 0.38),
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();

  if (selected) {
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 2.8;
    ctx.beginPath();
    ctx.ellipse(0, e.isFlying ? 10 : 5, s * 1.02, s * 0.56, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Boss Entrance Swirling Vortex Portal (fades out cleanly as boss marches in)
  if (e.isBoss && e.distanceTraveled < 68) {
    const entranceAlpha = Math.max(0, 1 - e.distanceTraveled / 68);
    ctx.save();
    ctx.globalAlpha = entranceAlpha;
    drawGlowBloom(ctx, 0, 0, s * 1.65, e.accentColor, 0.65 * entranceAlpha);

    // Outer summoning rune ring
    ctx.strokeStyle = e.accentColor;
    ctx.lineWidth = 3.2;
    ctx.setLineDash([12, 8]);
    ctx.beginPath();
    ctx.ellipse(0, s * 0.25, s * 1.32, s * 0.66, t * 2.4, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Vertical summoning energy pillars
    for (let i = -2; i <= 2; i++) {
      const beamX = i * s * 0.34 + Math.sin(t * 8 + i) * 4;
      const beamGrad = ctx.createLinearGradient(beamX, -s * 1.6, beamX, s * 0.4);
      beamGrad.addColorStop(0, 'rgba(255,255,255,0)');
      beamGrad.addColorStop(0.5, e.accentColor);
      beamGrad.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = beamGrad;
      ctx.fillRect(beamX - 3.5, -s * 1.5, 7, s * 1.9);
    }
    ctx.restore();
  }

  // Boss Royal/Menacing Aura
  if (e.isBoss) {
    const pulse = 0.8 + Math.sin(t * 5) * 0.2;
    ctx.strokeStyle = e.accentColor;
    ctx.globalAlpha = 0.52 * pulse;
    ctx.lineWidth = 2.8;
    ctx.beginPath();
    ctx.ellipse(0, s * 0.62, s * 1.22, s * 0.58, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  // Regeneration emerald shimmer particles when healing
  if (e.regenPerSec > 0 && e.burnTimer <= 0 && e.hp < e.maxHp) {
    const rY = (t * 22) % (s * 0.9);
    ctx.fillStyle = 'rgba(74, 222, 128, 0.88)';
    ctx.beginPath();
    ctx.arc(-s * 0.45, s * 0.2 - rY, 2.8, 0, Math.PI * 2);
    ctx.arc(s * 0.42, s * 0.05 - ((rY + 12) % (s * 0.9)), 2.4, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.translate(lunge * (facingRight ? 6 : -6), -walkBob - flyLift);

  // Dash / Speed Boost Thruster Plume behind unit
  if ((e.dashTimer > 0 || e.speedBoostTimer > 0) && e.hitFlash <= 0) {
    const dir = facingRight ? -1 : 1;
    const flameLen = s * (0.95 + Math.sin(t * 26) * 0.2);
    ctx.save();
    ctx.fillStyle = e.accentColor;
    ctx.globalAlpha = 0.75;
    ctx.beginPath();
    ctx.moveTo(dir * s * 0.28, -s * 0.16);
    ctx.lineTo(dir * (s * 0.28 + flameLen), 0);
    ctx.lineTo(dir * s * 0.28, s * 0.16);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  ctx.save();
  if (e.stealthTimer > 0) {
    ctx.globalAlpha = 0.36;
  }
  if (!facingRight) ctx.scale(-1, 1);
  ctx.rotate(lunge * 0.16 + stagger);

  const flash = e.hitFlash > 0;
  const body = flash ? '#ffffff' : e.bodyColor;
  const accent = flash ? '#fef08a' : e.accentColor;
  const id = e.enemyId;

  if (
    drawSpecializedAndBossMonster(
      ctx,
      id,
      s,
      stride,
      armSwing,
      animT,
      e.distanceTraveled,
      body,
      accent,
      flash
    )
  ) {
    // Rendered by specialized World 6-10 / Boss character rig
  } else if (id === 'giant_spider' || id === 'venom_spider' || id === 'boss_spider_queen') {
    drawSpiderVariant(ctx, id, s, stride, animT, body, accent, flash);
  } else if (id === 'skeleton_archer') {
    drawSkeletonArcherRig(ctx, s, stride, armSwing, body, accent, flash);
  } else if (id === 'frost_skeleton') {
    drawSkeletonRig(ctx, s, stride, armSwing, body, accent, true, true, flash);
  } else if (id.includes('skeleton')) {
    drawSkeletonRig(ctx, s, stride, armSwing, body, accent, id === 'skeleton_warrior', false, flash);
  } else if (id === 'goblin_warrior') {
    drawGoblinVariant(ctx, 'warrior', s, stride, armSwing, body, accent, flash);
  } else if (id === 'forest_goblin') {
    drawGoblinVariant(ctx, 'forest', s, stride, armSwing, body, accent, flash);
  } else if (id === 'armored_goblin') {
    drawGoblinVariant(ctx, 'armored', s, stride, armSwing, body, accent, flash);
  } else if (id === 'goblin') {
    drawGoblinVariant(ctx, 'raider', s, stride, armSwing, body, accent, flash);
  } else if (id === 'armored_orc') {
    drawOrcWarriorRig(ctx, s, stride, armSwing, body, accent, flash);
  } else if (id === 'forest_troll') {
    drawForestTrollRig(ctx, s, stride, armSwing, body, accent, flash);
  } else if (id === 'dark_werewolf') {
    drawWerewolfRig(ctx, s, stride, armSwing, body, accent, flash);
  } else if (id === 'root_stalker') {
    drawRootwalkerRig(ctx, s, stride, armSwing, body, accent, flash);
  } else if (id === 'lava_beast') {
    drawLavaBeastRig(ctx, s, stride, t, body, accent, flash);
  } else if (id === 'flame_knight') {
    drawFlameKnightRig(ctx, s, stride, armSwing, t, body, accent, flash);
  } else if (id === 'lava_imp') {
    drawLavaImpRig(ctx, s, stride, armSwing, t, body, accent, flash);
  } else if (id === 'ice_wolf' || id === 'fire_monster') {
    drawBeastQuadrupedRig(ctx, s, stride, body, accent, id === 'fire_monster', flash);
  } else if (id === 'crystal_monster') {
    drawCrystalGolemRig(ctx, s, stride, t, body, accent, flash);
  } else if (id === 'frost_giant') {
    drawFrostGiantRig(ctx, s, stride, armSwing, body, accent, flash);
  } else if (id === 'ice_warrior') {
    drawFrostWarriorRig(ctx, s, stride, armSwing, body, accent, flash);
  } else if (id === 'sand_warrior') {
    drawSandWarriorRig(ctx, s, stride, armSwing, body, accent, flash);
  } else if (id === 'sand_creature') {
    drawSandElementalRig(ctx, s, t, body, accent, flash);
  } else if (id === 'desert_scorpion') {
    drawScorpionCreatureRig(ctx, s, stride, t, body, accent, flash);
  } else if (id === 'sand_golem' || id === 'stone_golem' || id === 'boss_stone_titan') {
    drawMonolithGolemRig(ctx, s, stride, armSwing, body, accent, e.isBoss, id === 'sand_golem', flash);
  } else if (id === 'mummy_guard') {
    drawMummyGuardRig(ctx, s, stride, armSwing, body, accent, flash);
  } else if (id === 'tiny_mutant' || id === 'poison_beast' || id === 'boss_toxic_overlord') {
    drawMushroomMutantRig(ctx, s, stride, armSwing, t, body, accent, e.isBoss, flash);
  } else if (id === 'sea_creature' || id === 'armored_sea_monster' || id === 'boss_leviathan') {
    drawAbyssalSeaRig(ctx, id, s, stride, armSwing, t, body, accent, e.isBoss, flash);
  } else if (e.isFlying) {
    drawFlyingMonsterRig(ctx, id, s, t, e.distanceTraveled, body, accent, e.isBoss, flash);
  } else if (e.isBoss) {
    drawBossOverlordRig(ctx, id, s, stride, armSwing, t, body, accent, flash);
  } else if (
    e.enemyClass === 'armored' ||
    e.enemyClass === 'shielded' ||
    e.enemyClass === 'elite'
  ) {
    drawArmoredWarriorRig(ctx, s, stride, armSwing, body, accent, flash);
  } else {
    drawFiendWarriorRig(ctx, s, stride, armSwing, body, accent, flash);
  }

  // Universal Sci-Fi Cyber Reactor Node & Neon Visor Accent on non-flash bodies
  if (!flash) {
    ctx.save();
    ctx.fillStyle = accent;
    ctx.globalAlpha = 0.85;
    ctx.beginPath();
    ctx.arc(s * 0.05, -s * 0.04, Math.max(2, s * 0.085), 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(s * 0.05, -s * 0.04, Math.max(1, s * 0.036), 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  ctx.restore();

  // Holographic Stealth Scanlines overlay when cloaked
  if (e.stealthTimer > 0) {
    ctx.save();
    ctx.strokeStyle = '#c084fc';
    ctx.lineWidth = 1.4;
    ctx.globalAlpha = 0.72;
    for (let i = -2; i <= 2; i++) {
      const sy = i * s * 0.24 + Math.sin(t * 14 + i) * 2;
      ctx.beginPath();
      ctx.moveTo(-s * 0.58, sy);
      ctx.lineTo(s * 0.58, sy);
      ctx.stroke();
    }
    ctx.restore();
  }

  // Translucent Hexagonal Energy Shield Aura (flares bright cyan-white when struck)
  if (e.shield > 0) {
    const shieldPulse = 0.85 + Math.sin(t * 7 + e.distanceTraveled * 0.05) * 0.15;
    const shieldR = s * 0.96 * shieldPulse;
    ctx.save();
    ctx.globalAlpha = flash ? 0.72 : 0.34;
    ctx.fillStyle = flash ? 'rgba(224, 242, 254, 0.45)' : 'rgba(56, 189, 248, 0.18)';
    ctx.strokeStyle = flash ? '#ffffff' : '#38bdf8';
    ctx.lineWidth = flash ? 2.8 : 1.9;
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const a = (Math.PI * 2 * i) / 6 + t * 0.6;
      const hx = Math.cos(a) * shieldR;
      const hy = Math.sin(a) * shieldR * 0.88 - s * 0.1;
      if (i === 0) ctx.moveTo(hx, hy);
      else ctx.lineTo(hx, hy);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  // Heavy Armor Absorb Shimmer Ring when armored unit is hit
  if (e.armor >= 20 && flash && e.shield <= 0) {
    ctx.save();
    ctx.strokeStyle = '#fef08a';
    ctx.globalAlpha = 0.75;
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.arc(0, -s * 0.1, s * 0.84, -0.7, 0.7);
    ctx.stroke();
    ctx.restore();
  }

  // Status Indicators
  if (e.slowTimer > 0) {
    ctx.strokeStyle = '#7dd3fc';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.ellipse(0, 2, s * 0.88, s * 0.46, 0, 0, Math.PI * 2);
    ctx.stroke();
    fillShadedPoly(
      ctx,
      [
        [-s * 0.36, -s * 0.15],
        [-s * 0.28, -s * 0.38],
        [-s * 0.2, -s * 0.15],
      ],
      '#e0f2fe',
      '#0284c7',
      '#090d16',
      1.1
    );
    fillShadedPoly(
      ctx,
      [
        [s * 0.22, -s * 0.1],
        [s * 0.3, -s * 0.32],
        [s * 0.38, -s * 0.1],
      ],
      '#e0f2fe',
      '#0284c7',
      '#090d16',
      1.1
    );
  }
  if (e.poisonTimer > 0) {
    const bub = Math.sin(t * 9 + e.x) * 3;
    ctx.fillStyle = '#a3e635';
    ctx.beginPath();
    ctx.arc(-s * 0.35, -s * 0.75 + bub, 3.4, 0, Math.PI * 2);
    ctx.arc(s * 0.25, -s * 0.9 - bub, 2.7, 0, Math.PI * 2);
    ctx.fill();
  }
  if (e.burnTimer > 0) {
    const fl = Math.sin(t * 15) * 2.5;
    fillShadedPoly(
      ctx,
      [
        [-s * 0.25, -s * 0.55],
        [0, -s * 1.08 + fl],
        [s * 0.25, -s * 0.55],
      ],
      '#fef08a',
      '#ea580c',
      '#7c2d12',
      1.2
    );
  }

  // Crisp Overhead Health & Shield Bars
  const barW = Math.max(38, s * 1.65);
  const barY = -s * 1.1 - (e.isBoss ? 14 : 6);
  ctx.fillStyle = 'rgba(15, 23, 42, 0.94)';
  ctx.fillRect(-barW / 2 - 1, barY - 1, barW + 2, 7.5);
  ctx.fillStyle = e.isBoss ? '#f43f5e' : '#22c55e';
  ctx.fillRect(-barW / 2, barY, barW * Math.max(0, e.hp / e.maxHp), 5.5);

  if (e.shield > 0 && e.maxShield > 0) {
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(-barW / 2, barY - 4, barW * Math.min(1, e.shield / e.maxShield), 3);
  }

  ctx.restore();
}

// ============================================================================
// VOLUMETRIC GOBLIN VARIANTS (Raider / Warrior / Forest / Armored)
// ============================================================================
function drawGoblinVariant(
  ctx: CanvasRenderingContext2D,
  variant: 'raider' | 'warrior' | 'forest' | 'armored',
  s: number,
  stride: number,
  armSwing: number,
  body: string,
  accent: string,
  flash: boolean
) {
  const legL = stride * s * 0.24;
  const legR = -stride * s * 0.24;

  // Back Buckler Shield (Raider / Warrior / Armored)
  if (variant !== 'forest') {
    ctx.save();
    ctx.translate(-s * 0.24, -s * 0.04);
    ctx.rotate(-armSwing * 0.26);
    fillShadedEllipse(
      ctx,
      -s * 0.16,
      s * 0.08,
      s * 0.26,
      s * 0.28,
      variant === 'armored' ? '#94a3b8' : '#b45309',
      variant === 'armored' ? '#334155' : '#451a03',
      '#090d16',
      1.7
    );
    fillShadedEllipse(
      ctx,
      -s * 0.16,
      s * 0.08,
      s * 0.09,
      s * 0.09,
      '#fef08a',
      variant === 'warrior' ? '#b45309' : '#64748b',
      '#090d16',
      1.2
    );
    ctx.restore();
  }

  // Forest Goblin Leaf Cloak
  if (variant === 'forest') {
    fillShadedPoly(
      ctx,
      [
        [-s * 0.1, -s * 0.36],
        [-s * 0.62, s * 0.34],
        [-s * 0.36, s * 0.44],
        [-s * 0.12, s * 0.34],
      ],
      '#22c55e',
      '#14532d',
      '#090d16',
      1.6
    );
  }

  // Articulated Muscular Legs
  const skinDark = variant === 'forest' ? '#14532d' : '#166534';
  const bootHex = variant === 'armored' ? '#475569' : '#451a03';
  drawArticulatedLeg(ctx, -s * 0.15, s * 0.24, -s * 0.18 + legL, s * 0.68, s * 0.085, body, skinDark, variant === 'armored' ? '#94a3b8' : '#78350f', bootHex);
  drawArticulatedLeg(ctx, s * 0.15, s * 0.24, s * 0.18 + legR, s * 0.68, s * 0.085, body, skinDark, variant === 'armored' ? '#94a3b8' : '#78350f', bootHex);

  // Sculpted Torso Armor / Tunic
  const armorTop = variant === 'armored' ? '#94a3b8' : variant === 'forest' ? '#16a34a' : '#b45309';
  const armorBot = variant === 'armored' ? '#334155' : variant === 'forest' ? '#14532d' : '#451a03';
  fillShadedPoly(
    ctx,
    [
      [-s * 0.36, -s * 0.16],
      [s * 0.36, -s * 0.16],
      [s * 0.28, s * 0.34],
      [-s * 0.28, s * 0.34],
    ],
    armorTop,
    armorBot,
    '#090d16',
    1.8
  );
  // Leather/Steel War Belt & Buckle
  fillShadedPoly(
    ctx,
    [
      [-s * 0.29, s * 0.12],
      [s * 0.29, s * 0.12],
      [s * 0.27, s * 0.22],
      [-s * 0.27, s * 0.22],
    ],
    '#fde047',
    '#92400e',
    '#090d16',
    1.2
  );

  // Shoulder Pauldrons
  if (variant === 'armored' || variant === 'warrior') {
    drawArmorPauldron(
      ctx,
      -s * 0.32,
      -s * 0.14,
      s * 0.15,
      s * 0.12,
      variant === 'armored' ? '#cbd5e1' : '#b45309',
      armorBot,
      '#fbbf24',
      variant === 'armored' ? -1 : 0
    );
    drawArmorPauldron(
      ctx,
      s * 0.32,
      -s * 0.14,
      s * 0.15,
      s * 0.12,
      variant === 'armored' ? '#cbd5e1' : '#b45309',
      armorBot,
      '#fbbf24',
      variant === 'armored' ? 1 : 0
    );
  }

  // Pointed Back Goblin Ear
  fillShadedPoly(
    ctx,
    [
      [-s * 0.2, -s * 0.48],
      [-s * 0.74, -s * 0.68],
      [-s * 0.16, -s * 0.32],
    ],
    body,
    skinDark,
    '#090d16',
    1.6
  );

  // Detailed Goblin Head + Cheekbone + Pointed Chin
  fillShadedEllipse(ctx, s * 0.04, -s * 0.42, s * 0.34, s * 0.29, '#86efac', body, '#090d16', 1.8);

  // Helmet / Hood / Mohawks
  if (variant === 'armored') {
    fillShadedPoly(
      ctx,
      [
        [-s * 0.32, -s * 0.48],
        [-s * 0.18, -s * 0.84],
        [s * 0.22, -s * 0.84],
        [s * 0.42, -s * 0.48],
      ],
      '#e2e8f0',
      '#475569',
      '#090d16',
      1.8
    );
    fillShadedPoly(
      ctx,
      [
        [-s * 0.04, -s * 0.84],
        [s * 0.04, -s * 1.12],
        [s * 0.12, -s * 0.84],
      ],
      '#f8fafc',
      '#64748b',
      '#090d16',
      1.4
    );
  } else if (variant === 'forest') {
    fillShadedPoly(
      ctx,
      [
        [-s * 0.34, -s * 0.42],
        [0, -s * 0.86],
        [s * 0.38, -s * 0.48],
      ],
      '#22c55e',
      '#14532d',
      '#090d16',
      1.7
    );
  } else if (variant === 'warrior') {
    fillShadedPoly(
      ctx,
      [
        [-s * 0.16, -s * 0.68],
        [s * 0.06, -s * 0.98],
        [s * 0.26, -s * 0.66],
      ],
      '#f87171',
      '#991b1b',
      '#090d16',
      1.4
    );
  } else {
    fillShadedPoly(
      ctx,
      [
        [-s * 0.28, -s * 0.56],
        [s * 0.38, -s * 0.56],
        [s * 0.32, -s * 0.48],
        [-s * 0.3, -s * 0.48],
      ],
      '#ef4444',
      '#991b1b',
      '#090d16',
      1.3
    );
  }

  // Facial Detail: Snout Nose, Glowing Eyes, Fang Smile
  fillShadedEllipse(ctx, s * 0.28, -s * 0.36, s * 0.11, s * 0.08, '#bbf7d0', skinDark, '#090d16', 1.3);
  if (!flash) {
    drawGlowingEye(ctx, s * 0.18, -s * 0.46, s * 0.07, s * 0.055, variant === 'armored' ? '#38bdf8' : '#fde047');
    drawGlowingEye(ctx, -s * 0.02, -s * 0.46, s * 0.06, s * 0.05, variant === 'armored' ? '#38bdf8' : '#fde047');
    // Snarl teeth
    ctx.fillStyle = '#fefce8';
    ctx.beginPath();
    ctx.moveTo(s * 0.12, -s * 0.25);
    ctx.lineTo(s * 0.16, -s * 0.32);
    ctx.lineTo(s * 0.2, -s * 0.25);
    ctx.moveTo(s * 0.24, -s * 0.25);
    ctx.lineTo(s * 0.28, -s * 0.32);
    ctx.lineTo(s * 0.32, -s * 0.25);
    ctx.fill();
  }

  // Front Ear
  fillShadedPoly(
    ctx,
    [
      [-s * 0.1, -s * 0.4],
      [-s * 0.56, -s * 0.56],
      [-s * 0.12, -s * 0.28],
    ],
    body,
    skinDark,
    '#090d16',
    1.5
  );

  // Volumetric Weapon Arm & Weapon
  ctx.save();
  ctx.translate(s * 0.3, -s * 0.04);
  ctx.rotate(armSwing * 0.34);
  drawVolumetricLimb(ctx, 0, 0, s * 0.16, s * 0.08, s * 0.075, s * 0.065, '#86efac', skinDark);

  if (variant === 'forest') {
    // Wicked curved venom dagger
    fillShadedPoly(
      ctx,
      [
        [s * 0.12, s * 0.1],
        [s * 0.48, -s * 0.22],
        [s * 0.54, -s * 0.1],
        [s * 0.18, s * 0.16],
      ],
      '#d9f99d',
      '#15803d',
      '#090d16',
      1.4
    );
  } else if (variant === 'armored') {
    // Heavy steel halberd / mace
    drawVolumetricLimb(ctx, s * 0.12, s * 0.24, s * 0.34, -s * 0.48, 2.8, 2.5, '#cbd5e1', '#475569');
    fillShadedPoly(
      ctx,
      [
        [s * 0.24, -s * 0.52],
        [s * 0.5, -s * 0.62],
        [s * 0.48, -s * 0.34],
      ],
      '#f8fafc',
      '#64748b',
      '#090d16',
      1.5
    );
  } else {
    // Curved Iron Cleaver Scimitar
    fillShadedPoly(
      ctx,
      [
        [s * 0.14, s * 0.12],
        [s * 0.34, -s * 0.42],
        [s * 0.48, -s * 0.32],
        [s * 0.24, s * 0.14],
      ],
      '#f1f5f9',
      accent,
      '#090d16',
      1.5
    );
  }
  ctx.restore();
}

// ============================================================================
// VOLUMETRIC ORC WARRIOR
// ============================================================================
function drawOrcWarriorRig(
  ctx: CanvasRenderingContext2D,
  s: number,
  stride: number,
  armSwing: number,
  body: string,
  accent: string,
  flash: boolean
) {
  const legL = stride * s * 0.2;
  const legR = -stride * s * 0.2;

  drawArticulatedLeg(ctx, -s * 0.2, s * 0.26, -s * 0.22 + legL, s * 0.7, s * 0.11, '#4ade80', '#14532d', '#64748b', '#1e293b');
  drawArticulatedLeg(ctx, s * 0.2, s * 0.26, s * 0.22 + legR, s * 0.7, s * 0.11, '#4ade80', '#14532d', '#64748b', '#1e293b');

  // Heavy Iron-Plated Orc Breastplate
  fillShadedPoly(
    ctx,
    [
      [-s * 0.48, -s * 0.28],
      [s * 0.48, -s * 0.28],
      [s * 0.38, s * 0.36],
      [-s * 0.38, s * 0.36],
    ],
    '#64748b',
    flash ? '#ffffff' : '#1e293b',
    '#090d16',
    2
  );
  drawArmorPauldron(ctx, -s * 0.42, -s * 0.22, s * 0.2, s * 0.16, '#94a3b8', '#334155', accent, -1);
  drawArmorPauldron(ctx, s * 0.42, -s * 0.22, s * 0.2, s * 0.16, '#94a3b8', '#334155', accent, 1);

  // Brutal Orc Head & Jaw with Tusks
  fillShadedEllipse(ctx, s * 0.04, -s * 0.48, s * 0.32, s * 0.28, '#86efac', body, '#090d16', 1.9);
  fillShadedPoly(
    ctx,
    [
      [-s * 0.28, -s * 0.56],
      [-s * 0.12, -s * 0.84],
      [s * 0.26, -s * 0.8],
      [s * 0.38, -s * 0.56],
    ],
    '#cbd5e1',
    '#475569',
    '#090d16',
    1.7
  );

  if (!flash) {
    drawGlowingEye(ctx, s * 0.18, -s * 0.5, s * 0.07, s * 0.05, '#ef4444');
    // Protruding Ivory Tusks
    fillShadedPoly(
      ctx,
      [
        [s * 0.1, -s * 0.28],
        [s * 0.16, -s * 0.44],
        [s * 0.22, -s * 0.28],
      ],
      '#fefce8',
      '#ca8a04',
      '#090d16',
      1.2
    );
    fillShadedPoly(
      ctx,
      [
        [s * 0.26, -s * 0.28],
        [s * 0.34, -s * 0.44],
        [s * 0.36, -s * 0.28],
      ],
      '#fefce8',
      '#ca8a04',
      '#090d16',
      1.2
    );
  }

  // Iron Battleaxe Arm
  ctx.save();
  ctx.translate(s * 0.38, -s * 0.06);
  ctx.rotate(armSwing * 0.28);
  drawVolumetricLimb(ctx, 0, 0, s * 0.16, s * 0.12, s * 0.1, s * 0.09, '#86efac', '#14532d');
  drawVolumetricLimb(ctx, s * 0.08, s * 0.24, s * 0.38, -s * 0.58, 3.2, 2.8, '#92400e', '#451a03');
  fillShadedPoly(
    ctx,
    [
      [s * 0.24, -s * 0.58],
      [s * 0.62, -s * 0.72],
      [s * 0.58, -s * 0.3],
      [s * 0.28, -s * 0.4],
    ],
    '#f8fafc',
    '#475569',
    '#090d16',
    1.7
  );
  ctx.restore();
}

// ============================================================================
// VOLUMETRIC SKELETON ARCHER & WARRIOR RIGS (Zero Stick Strokes!)
// ============================================================================
function drawSkeletonArcherRig(
  ctx: CanvasRenderingContext2D,
  s: number,
  stride: number,
  armSwing: number,
  body: string,
  accent: string,
  flash: boolean
) {
  const legL = stride * s * 0.2;
  const legR = -stride * s * 0.2;

  // Quiver on back
  fillShadedPoly(
    ctx,
    [
      [-s * 0.38, -s * 0.32],
      [-s * 0.2, -s * 0.38],
      [-s * 0.12, s * 0.14],
      [-s * 0.34, s * 0.16],
    ],
    '#b45309',
    '#451a03',
    '#090d16',
    1.6
  );

  // Sculpted Bone & Greave Legs
  drawArticulatedLeg(ctx, -s * 0.14, s * 0.22, -s * 0.18 + legL, s * 0.66, s * 0.075, '#f8fafc', '#94a3b8', '#475569', '#1e293b');
  drawArticulatedLeg(ctx, s * 0.14, s * 0.22, s * 0.18 + legR, s * 0.66, s * 0.075, '#f8fafc', '#94a3b8', '#475569', '#1e293b');

  // Sculpted Hooded Ranger Ribplate Armor
  fillShadedPoly(
    ctx,
    [
      [-s * 0.28, -s * 0.24],
      [s * 0.28, -s * 0.24],
      [s * 0.22, s * 0.28],
      [-s * 0.22, s * 0.28],
    ],
    '#475569',
    '#1e293b',
    '#090d16',
    1.7
  );
  // Bone rib chevrons plated cleanly
  fillShadedPoly(
    ctx,
    [
      [-s * 0.18, -s * 0.14],
      [s * 0.18, -s * 0.14],
      [s * 0.12, s * 0.14],
      [-s * 0.12, s * 0.14],
    ],
    '#f8fafc',
    body,
    '#090d16',
    1.3
  );

  // Hooded Skull
  fillShadedPoly(
    ctx,
    [
      [-s * 0.34, -s * 0.28],
      [-s * 0.14, -s * 0.82],
      [s * 0.24, -s * 0.78],
      [s * 0.36, -s * 0.32],
    ],
    '#1e293b',
    '#0f172a',
    '#090d16',
    1.7
  );
  fillShadedEllipse(ctx, s * 0.06, -s * 0.48, s * 0.22, s * 0.21, '#f8fafc', body, '#090d16', 1.6);
  if (!flash) {
    drawGlowingEye(ctx, s * 0.16, -s * 0.5, s * 0.055, s * 0.045, accent);
  }

  // Volumetric Bow Arm + Composite Warbow
  ctx.save();
  ctx.translate(s * 0.26, -s * 0.12);
  ctx.rotate(armSwing * 0.15);
  drawVolumetricLimb(ctx, -s * 0.06, 0, s * 0.18, 0, s * 0.06, s * 0.055, '#f8fafc', '#94a3b8');
  ctx.strokeStyle = '#d97706';
  ctx.lineWidth = 3.8;
  ctx.beginPath();
  ctx.arc(s * 0.12, 0, s * 0.42, -Math.PI * 0.45, Math.PI * 0.45);
  ctx.stroke();
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(s * 0.16, -s * 0.4);
  ctx.lineTo(s * 0.04, 0);
  ctx.lineTo(s * 0.16, s * 0.4);
  ctx.stroke();
  // Nocked Plasma/Bone Arrow
  drawVolumetricLimb(ctx, s * 0.04, 0, s * 0.62, 0, 2.2, 1.8, '#fef08a', '#b45309');
  ctx.restore();
}

function drawSkeletonRig(
  ctx: CanvasRenderingContext2D,
  s: number,
  stride: number,
  armSwing: number,
  body: string,
  accent: string,
  armored: boolean,
  frost: boolean,
  flash: boolean
) {
  const legL = stride * s * 0.22;
  const legR = -stride * s * 0.22;

  const boneTop = frost ? '#e0f2fe' : '#f8fafc';
  const boneBot = frost ? '#38bdf8' : body;
  const plateTop = frost ? '#38bdf8' : '#94a3b8';
  const plateBot = frost ? '#075985' : '#334155';

  // Articulated Bone Legs with Armored Greaves
  drawArticulatedLeg(ctx, -s * 0.14, s * 0.22, -s * 0.18 + legL, s * 0.66, s * 0.08, boneTop, boneBot, plateTop, '#1e293b');
  drawArticulatedLeg(ctx, s * 0.14, s * 0.22, s * 0.18 + legR, s * 0.66, s * 0.08, boneTop, boneBot, plateTop, '#1e293b');

  // Sculpted Pelvis & Armored Rib-Plate Cuirass
  fillShadedPoly(
    ctx,
    [
      [-s * 0.34, -s * 0.26],
      [s * 0.34, -s * 0.26],
      [s * 0.24, s * 0.28],
      [-s * 0.24, s * 0.28],
    ],
    armored ? plateTop : '#475569',
    armored ? plateBot : '#1e293b',
    '#090d16',
    1.8
  );

  // Carved Ribplate Emblem
  fillShadedPoly(
    ctx,
    [
      [-s * 0.2, -s * 0.16],
      [s * 0.2, -s * 0.16],
      [s * 0.14, s * 0.14],
      [-s * 0.14, s * 0.14],
    ],
    boneTop,
    boneBot,
    '#090d16',
    1.3
  );

  if (armored) {
    drawArmorPauldron(ctx, -s * 0.34, -s * 0.22, s * 0.16, s * 0.13, plateTop, plateBot, accent, -1);
    drawArmorPauldron(ctx, s * 0.34, -s * 0.22, s * 0.16, s * 0.13, plateTop, plateBot, accent, 1);
  }

  // Skull & Jaw
  fillShadedEllipse(ctx, s * 0.03, -s * 0.5, s * 0.27, s * 0.25, boneTop, boneBot, '#090d16', 1.8);
  fillShadedPoly(
    ctx,
    [
      [-s * 0.1, -s * 0.36],
      [s * 0.16, -s * 0.36],
      [s * 0.12, -s * 0.24],
      [-s * 0.06, -s * 0.24],
    ],
    boneTop,
    boneBot,
    '#090d16',
    1.4
  );

  if (armored) {
    fillShadedPoly(
      ctx,
      [
        [-s * 0.26, -s * 0.56],
        [-s * 0.12, -s * 0.88],
        [s * 0.22, -s * 0.86],
        [s * 0.34, -s * 0.54],
      ],
      plateTop,
      plateBot,
      '#090d16',
      1.7
    );
  }

  if (!flash) {
    drawGlowingEye(ctx, s * 0.14, -s * 0.52, s * 0.065, s * 0.05, frost ? '#38bdf8' : accent);
    drawGlowingEye(ctx, -s * 0.04, -s * 0.52, s * 0.06, s * 0.048, frost ? '#38bdf8' : accent);
  }

  // Back Buckler & Sword Arm
  ctx.save();
  ctx.translate(s * 0.28, -s * 0.06);
  ctx.rotate(armSwing * 0.3);
  drawVolumetricLimb(ctx, 0, 0, s * 0.16, s * 0.08, s * 0.075, s * 0.065, boneTop, boneBot);
  fillShadedPoly(
    ctx,
    [
      [s * 0.1, s * 0.14],
      [s * 0.44, -s * 0.46],
      [s * 0.54, -s * 0.36],
      [s * 0.2, s * 0.18],
    ],
    frost ? '#e0f2fe' : '#f1f5f9',
    frost ? '#0284c7' : '#64748b',
    '#090d16',
    1.5
  );
  ctx.restore();
}

// ============================================================================
// VOLUMETRIC SPIDER VARIANTS (8 Two-Segment Articulated Arachnid Legs)
// ============================================================================
function drawSpiderVariant(
  ctx: CanvasRenderingContext2D,
  id: string,
  s: number,
  stride: number,
  t: number,
  body: string,
  accent: string,
  flash: boolean
) {
  const isBoss = id === 'boss_spider_queen';
  const isVenom = id === 'venom_spider';
  const legTop = isBoss ? '#c084fc' : isVenom ? '#4ade80' : '#64748b';
  const legBot = isBoss ? '#3b0764' : isVenom ? '#14532d' : '#1e293b';

  // 8 Two-Segment Articulated Legs
  for (let i = 0; i < 4; i++) {
    const dir = i % 2 === 0 ? 1 : -1;
    const baseAngle = -0.5 + i * 0.35;
    const lift = Math.sin(t * 14 + i * 1.6) * s * 0.12 * dir + stride * s * 0.06;
    const kneeX = Math.cos(baseAngle) * s * 0.58;
    const kneeY = -s * 0.44 + i * s * 0.08 + lift * 0.4;
    const footX = s * (0.72 + (i === 1 || i === 2 ? 0.2 : 0));
    const footY = s * (0.28 + i * 0.12) + lift;

    drawVolumetricLimb(ctx, 0, 0, kneeX, kneeY, s * 0.075, s * 0.055, legTop, legBot);
    drawVolumetricLimb(ctx, kneeX, kneeY, footX, footY, s * 0.055, s * 0.03, legTop, legBot);
    drawVolumetricLimb(ctx, 0, 0, -kneeX * 0.9, kneeY, s * 0.075, s * 0.055, legTop, legBot);
    drawVolumetricLimb(ctx, -kneeX * 0.9, kneeY, -footX * 0.9, footY, s * 0.055, s * 0.03, legTop, legBot);
  }

  // Enormous Shaded Abdomen
  fillShadedEllipse(ctx, -s * 0.28, -s * 0.06, s * 0.54, s * 0.44, isBoss ? '#9333ea' : '#475569', body, '#090d16', 2);
  if (!flash) {
    fillShadedPoly(
      ctx,
      [
        [-s * 0.42, -s * 0.18],
        [-s * 0.22, -s * 0.26],
        [-s * 0.14, -s * 0.04],
        [-s * 0.34, s * 0.04],
      ],
      '#fef08a',
      accent,
      '#090d16',
      1.2
    );
  }

  // Cephalothorax Head & Fangs
  fillShadedEllipse(ctx, s * 0.3, s * 0.02, s * 0.32, s * 0.26, legTop, body, '#090d16', 1.8);
  if (isBoss) {
    fillShadedPoly(
      ctx,
      [
        [s * 0.18, -s * 0.22],
        [s * 0.3, -s * 0.62],
        [s * 0.44, -s * 0.22],
      ],
      '#fef08a',
      accent,
      '#090d16',
      1.5
    );
  }
  if (!flash) {
    for (const [ex, ey, er] of [
      [0.42, -0.06, 0.06],
      [0.46, 0.06, 0.055],
      [0.32, -0.1, 0.045],
    ]) {
      drawGlowingEye(ctx, s * ex, s * ey, s * er, s * er, isVenom ? '#bef264' : accent);
    }
    // Mandible fangs
    fillShadedPoly(
      ctx,
      [
        [s * 0.52, s * 0.08],
        [s * 0.72, s * 0.24],
        [s * 0.46, s * 0.2],
      ],
      '#f8fafc',
      accent,
      '#090d16',
      1.3
    );
  }
}

// ============================================================================
// CURSED FOREST HEAVY MONSTERS (Forest Troll / Dark Werewolf / Root Stalker)
// ============================================================================
function drawForestTrollRig(
  ctx: CanvasRenderingContext2D,
  s: number,
  stride: number,
  armSwing: number,
  body: string,
  accent: string,
  flash: boolean
) {
  const legL = stride * s * 0.2;
  const legR = -stride * s * 0.2;
  drawArticulatedLeg(ctx, -s * 0.22, s * 0.26, -s * 0.26 + legL, s * 0.72, s * 0.13, '#4ade80', '#14532d', '#78350f', '#292524');
  drawArticulatedLeg(ctx, s * 0.22, s * 0.26, s * 0.26 + legR, s * 0.72, s * 0.13, '#4ade80', '#14532d', '#78350f', '#292524');

  // Hulking Moss-Backed Troll Torso
  fillShadedEllipse(ctx, -s * 0.04, -s * 0.02, s * 0.52, s * 0.46, '#22c55e', flash ? '#ffffff' : body, '#090d16', 2.1);
  fillShadedEllipse(ctx, -s * 0.24, -s * 0.34, s * 0.28, s * 0.18, '#84cc16', '#365314', '#090d16', 1.5);

  // Troll Head + Lower Tusks
  fillShadedEllipse(ctx, s * 0.16, -s * 0.44, s * 0.28, s * 0.25, '#86efac', body, '#090d16', 1.8);
  if (!flash) {
    drawGlowingEye(ctx, s * 0.28, -s * 0.48, s * 0.065, s * 0.05, accent);
    fillShadedPoly(
      ctx,
      [
        [s * 0.22, -s * 0.26],
        [s * 0.28, -s * 0.4],
        [s * 0.34, -s * 0.26],
      ],
      '#fefce8',
      '#ca8a04',
      '#090d16',
      1.2
    );
  }

  // Giant Spiked Oak Club Arm
  ctx.save();
  ctx.translate(s * 0.36, -s * 0.02);
  ctx.rotate(armSwing * 0.26);
  drawVolumetricLimb(ctx, 0, 0, s * 0.16, s * 0.1, s * 0.11, s * 0.1, '#4ade80', '#14532d');
  fillShadedPoly(
    ctx,
    [
      [s * 0.1, s * 0.18],
      [s * 0.36, -s * 0.58],
      [s * 0.56, -s * 0.48],
      [s * 0.22, s * 0.2],
    ],
    '#a16207',
    '#451a03',
    '#090d16',
    1.7
  );
  ctx.restore();
}

function drawWerewolfRig(
  ctx: CanvasRenderingContext2D,
  s: number,
  stride: number,
  armSwing: number,
  body: string,
  accent: string,
  flash: boolean
) {
  const legL = stride * s * 0.26;
  const legR = -stride * s * 0.26;

  // Bushy Wolf Tail
  fillShadedPoly(
    ctx,
    [
      [-s * 0.28, s * 0.12],
      [-s * 0.78, -s * 0.08],
      [-s * 0.62, s * 0.22],
      [-s * 0.24, s * 0.26],
    ],
    '#64748b',
    '#1e293b',
    '#090d16',
    1.7
  );

  drawArticulatedLeg(ctx, -s * 0.16, s * 0.22, -s * 0.2 + legL, s * 0.68, s * 0.095, '#64748b', body, '#475569', '#0f172a');
  drawArticulatedLeg(ctx, s * 0.16, s * 0.22, s * 0.2 + legR, s * 0.68, s * 0.095, '#64748b', body, '#475569', '#0f172a');

  fillShadedEllipse(ctx, 0, -s * 0.02, s * 0.38, s * 0.36, '#64748b', flash ? '#ffffff' : body, '#090d16', 1.9);

  // Snarling Lupine Snout & Pointed Ears
  fillShadedPoly(
    ctx,
    [
      [-s * 0.14, -s * 0.56],
      [-s * 0.24, -s * 0.92],
      [0, -s * 0.66],
      [s * 0.14, -s * 0.9],
      [s * 0.24, -s * 0.56],
    ],
    '#94a3b8',
    body,
    '#090d16',
    1.6
  );
  fillShadedPoly(
    ctx,
    [
      [-s * 0.12, -s * 0.62],
      [s * 0.58, -s * 0.44],
      [s * 0.48, -s * 0.28],
      [-s * 0.06, -s * 0.3],
    ],
    '#64748b',
    body,
    '#090d16',
    1.8
  );
  if (!flash) {
    drawGlowingEye(ctx, s * 0.22, -s * 0.5, s * 0.065, s * 0.048, accent);
  }

  // Clawed Forearm
  ctx.save();
  ctx.translate(s * 0.28, -s * 0.04);
  ctx.rotate(armSwing * 0.38);
  drawVolumetricLimb(ctx, 0, 0, s * 0.24, s * 0.1, s * 0.09, s * 0.075, '#64748b', body);
  fillShadedPoly(
    ctx,
    [
      [s * 0.22, s * 0.04],
      [s * 0.44, s * 0.1],
      [s * 0.2, s * 0.16],
    ],
    '#f8fafc',
    '#94a3b8',
    '#090d16',
    1.2
  );
  ctx.restore();
}

function drawRootwalkerRig(
  ctx: CanvasRenderingContext2D,
  s: number,
  stride: number,
  armSwing: number,
  body: string,
  accent: string,
  flash: boolean
) {
  const legL = stride * s * 0.18;
  const legR = -stride * s * 0.18;

  drawArticulatedLeg(ctx, -s * 0.2, s * 0.24, -s * 0.24 + legL, s * 0.68, s * 0.11, '#a16207', '#451a03', '#65a30d', '#292524');
  drawArticulatedLeg(ctx, s * 0.2, s * 0.24, s * 0.24 + legR, s * 0.68, s * 0.11, '#a16207', '#451a03', '#65a30d', '#292524');

  // Twisted Bark Ent Body
  fillShadedPoly(
    ctx,
    [
      [-s * 0.42, -s * 0.4],
      [s * 0.42, -s * 0.4],
      [s * 0.32, s * 0.36],
      [-s * 0.32, s * 0.36],
    ],
    '#92400e',
    flash ? '#ffffff' : body,
    '#090d16',
    2
  );
  // Crown Antler Branches
  for (const dir of [-1, 1] as const) {
    fillShadedPoly(
      ctx,
      [
        [dir * s * 0.16, -s * 0.44],
        [dir * s * 0.56, -s * 0.94],
        [dir * s * 0.36, -s * 0.44],
      ],
      '#22c55e',
      '#14532d',
      '#090d16',
      1.6
    );
  }
  if (!flash) {
    drawGlowingEye(ctx, s * 0.12, -s * 0.24, s * 0.065, s * 0.05, accent);
    drawGlowingEye(ctx, -s * 0.1, -s * 0.24, s * 0.065, s * 0.05, accent);
  }

  ctx.save();
  ctx.translate(s * 0.34, -s * 0.06);
  ctx.rotate(armSwing * 0.24);
  drawVolumetricLimb(ctx, 0, 0, s * 0.26, s * 0.14, s * 0.1, s * 0.09, '#92400e', '#451a03');
  ctx.restore();
}

// ============================================================================
// FIRE LAND MONSTERS (Lava Imp / Lava Beast / Flame Knight)
// ============================================================================
function drawLavaImpRig(
  ctx: CanvasRenderingContext2D,
  s: number,
  stride: number,
  armSwing: number,
  t: number,
  body: string,
  accent: string,
  flash: boolean
) {
  const legL = stride * s * 0.26;
  const legR = -stride * s * 0.26;
  const flap = Math.sin(t * 16) * s * 0.25;

  drawDragonWing(ctx, -s * 0.08, -s * 0.12, s * 0.72, flap, -1, '#7c2d12', '#fb923c', '#991b1b');
  drawArticulatedLeg(ctx, -s * 0.14, s * 0.2, -s * 0.16 + legL, s * 0.62, s * 0.075, '#f97316', '#7c2d12', '#fb923c', '#292524');
  drawArticulatedLeg(ctx, s * 0.14, s * 0.2, s * 0.16 + legR, s * 0.62, s * 0.075, '#f97316', '#7c2d12', '#fb923c', '#292524');

  fillShadedEllipse(ctx, 0, 0, s * 0.3, s * 0.28, '#fb923c', flash ? '#ffffff' : body, '#090d16', 1.8);
  fillShadedEllipse(ctx, s * 0.04, -s * 0.36, s * 0.24, s * 0.22, '#fb923c', body, '#090d16', 1.7);
  for (const sx of [-1, 1]) {
    fillShadedPoly(
      ctx,
      [
        [sx * s * 0.1, -s * 0.52],
        [sx * s * 0.26, -s * 0.82],
        [sx * s * 0.2, -s * 0.48],
      ],
      '#fef08a',
      accent,
      '#090d16',
      1.3
    );
  }
  if (!flash) {
    drawGlowingEye(ctx, s * 0.14, -s * 0.38, s * 0.06, s * 0.05, '#fef08a');
  }

  ctx.save();
  ctx.translate(s * 0.24, 0);
  ctx.rotate(armSwing * 0.34);
  drawVolumetricLimb(ctx, 0, 0, s * 0.18, s * 0.08, s * 0.065, s * 0.055, '#fb923c', '#9a3412');
  ctx.restore();
}

function drawLavaBeastRig(
  ctx: CanvasRenderingContext2D,
  s: number,
  stride: number,
  t: number,
  body: string,
  accent: string,
  flash: boolean
) {
  const legL = stride * s * 0.2;
  const legR = -stride * s * 0.2;

  drawArticulatedLeg(ctx, -s * 0.24, s * 0.24, -s * 0.28 + legL, s * 0.68, s * 0.12, '#7c2d12', '#1c1917', '#ea580c', '#292524');
  drawArticulatedLeg(ctx, s * 0.24, s * 0.24, s * 0.28 + legR, s * 0.68, s * 0.12, '#7c2d12', '#1c1917', '#ea580c', '#292524');

  fillShadedPoly(
    ctx,
    [
      [-s * 0.5, -s * 0.3],
      [s * 0.5, -s * 0.3],
      [s * 0.38, s * 0.34],
      [-s * 0.38, s * 0.34],
    ],
    '#7c2d12',
    flash ? '#ffffff' : body,
    '#090d16',
    2
  );
  if (!flash) {
    drawGlowBloom(ctx, 0, 0, s * 0.32, accent, 0.55 + Math.sin(t * 6) * 0.15);
    fillShadedEllipse(ctx, 0, 0, s * 0.16, s * 0.16, '#fef08a', '#ea580c', '#7c2d12', 1.3);
  }
  fillShadedEllipse(ctx, s * 0.1, -s * 0.46, s * 0.26, s * 0.24, '#57534e', '#1c1917', '#090d16', 1.8);
  if (!flash) {
    drawGlowingEye(ctx, s * 0.22, -s * 0.48, s * 0.065, s * 0.048, '#fde047');
  }
}

function drawFlameKnightRig(
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

  drawArticulatedLeg(ctx, -s * 0.18, s * 0.26, -s * 0.2 + legL, s * 0.68, s * 0.11, '#b91c1c', '#450a0a', '#fb923c', '#1c1917');
  drawArticulatedLeg(ctx, s * 0.18, s * 0.26, s * 0.2 + legR, s * 0.68, s * 0.11, '#b91c1c', '#450a0a', '#fb923c', '#1c1917');

  fillShadedPoly(
    ctx,
    [
      [-s * 0.44, -s * 0.28],
      [s * 0.44, -s * 0.28],
      [s * 0.34, s * 0.34],
      [-s * 0.34, s * 0.34],
    ],
    '#dc2626',
    flash ? '#ffffff' : body,
    '#090d16',
    1.9
  );
  drawArmorPauldron(ctx, -s * 0.38, -s * 0.24, s * 0.18, s * 0.15, '#fb923c', '#7c2d12', '#fef08a', -1);
  drawArmorPauldron(ctx, s * 0.38, -s * 0.24, s * 0.18, s * 0.15, '#fb923c', '#7c2d12', '#fef08a', 1);

  fillShadedPoly(
    ctx,
    [
      [-s * 0.22, -s * 0.72],
      [s * 0.22, -s * 0.72],
      [s * 0.26, -s * 0.32],
      [-s * 0.26, -s * 0.32],
    ],
    '#57534e',
    '#1c1917',
    '#fb923c',
    1.8
  );
  if (!flash) {
    drawGlowingEye(ctx, s * 0.1, -s * 0.52, s * 0.065, s * 0.04, '#fde047');
    drawGlowBloom(ctx, 0, -s * 0.84, s * 0.24, '#fb923c', 0.55 + Math.sin(t * 8) * 0.2);
  }

  // Blazing Tower Shield & Flame Greatsword
  fillShadedPoly(
    ctx,
    [
      [-s * 0.52, -s * 0.18],
      [-s * 0.16, -s * 0.18],
      [-s * 0.2, s * 0.28],
      [-s * 0.36, s * 0.4],
      [-s * 0.5, s * 0.26],
    ],
    '#fb923c',
    '#7c2d12',
    '#090d16',
    1.7
  );

  ctx.save();
  ctx.translate(s * 0.36, -s * 0.04);
  ctx.rotate(armSwing * 0.28);
  drawVolumetricLimb(ctx, 0, 0, s * 0.14, s * 0.1, s * 0.09, s * 0.08, '#dc2626', '#450a0a');
  fillShadedPoly(
    ctx,
    [
      [s * 0.04, s * 0.18],
      [s * 0.5, -s * 0.58],
      [s * 0.6, -s * 0.44],
      [s * 0.16, s * 0.2],
    ],
    '#fef08a',
    '#ea580c',
    '#090d16',
    1.6
  );
  ctx.restore();
}

// ============================================================================
// QUADRUPED BEASTS (Ice Wolf / Fire Monster Hound)
// ============================================================================
function drawBeastQuadrupedRig(
  ctx: CanvasRenderingContext2D,
  s: number,
  stride: number,
  body: string,
  accent: string,
  fire: boolean,
  flash: boolean
) {
  const legF = stride * s * 0.24;
  const legB = -stride * s * 0.24;
  const light = fire ? '#fb923c' : '#93c5fd';
  const dark = fire ? '#7c2d12' : '#1e3a8a';

  // Tail
  fillShadedPoly(
    ctx,
    [
      [-s * 0.46, -s * 0.04],
      [-s * 0.92, -s * 0.32],
      [-s * 0.72, s * 0.08],
      [-s * 0.42, s * 0.1],
    ],
    light,
    body,
    '#090d16',
    1.6
  );

  // 4 Articulated Quadruped Legs
  drawArticulatedLeg(ctx, -s * 0.36, s * 0.12, -s * 0.4 + legB, s * 0.6, s * 0.085, light, dark, accent, '#0f172a');
  drawArticulatedLeg(ctx, -s * 0.22, s * 0.14, -s * 0.2 + legF, s * 0.6, s * 0.085, light, dark, accent, '#0f172a');
  drawArticulatedLeg(ctx, s * 0.24, s * 0.12, s * 0.22 + legB, s * 0.6, s * 0.085, light, dark, accent, '#0f172a');
  drawArticulatedLeg(ctx, s * 0.38, s * 0.14, s * 0.4 + legF, s * 0.6, s * 0.085, light, dark, accent, '#0f172a');

  // Muscular Quadruped Torso + Mane
  fillShadedEllipse(ctx, 0, 0, s * 0.56, s * 0.3, light, flash ? '#ffffff' : body, '#090d16', 1.9);
  fillShadedPoly(
    ctx,
    [
      [s * 0.12, -s * 0.32],
      [s * 0.42, -s * 0.52],
      [s * 0.6, -s * 0.26],
      [s * 0.32, s * 0.12],
    ],
    accent,
    dark,
    '#090d16',
    1.6
  );

  // Snarling Wolf/Hound Head & Ears
  fillShadedPoly(
    ctx,
    [
      [s * 0.32, -s * 0.42],
      [s * 0.88, -s * 0.24],
      [s * 0.78, -s * 0.08],
      [s * 0.34, -s * 0.06],
    ],
    light,
    body,
    '#090d16',
    1.8
  );
  fillShadedPoly(
    ctx,
    [
      [s * 0.3, -s * 0.42],
      [s * 0.22, -s * 0.72],
      [s * 0.48, -s * 0.42],
    ],
    accent,
    dark,
    '#090d16',
    1.4
  );

  if (!flash) {
    drawGlowingEye(ctx, s * 0.54, -s * 0.26, s * 0.065, s * 0.048, fire ? '#fde047' : '#e0f2fe');
  }
}

// ============================================================================
// FROZEN EMPIRE RIGS (Crystal Monster / Frost Warrior / Frost Giant)
// ============================================================================
function drawCrystalGolemRig(
  ctx: CanvasRenderingContext2D,
  s: number,
  stride: number,
  t: number,
  body: string,
  accent: string,
  flash: boolean
) {
  const legL = stride * s * 0.18;
  const legR = -stride * s * 0.18;
  drawArticulatedLeg(ctx, -s * 0.22, s * 0.24, -s * 0.24 + legL, s * 0.68, s * 0.11, '#e0f2fe', '#0284c7', '#7dd3fc', '#0c4a6e');
  drawArticulatedLeg(ctx, s * 0.22, s * 0.24, s * 0.24 + legR, s * 0.68, s * 0.11, '#e0f2fe', '#0284c7', '#7dd3fc', '#0c4a6e');

  // Faceted Prism Crystal Body
  fillShadedPoly(
    ctx,
    [
      [0, -s * 0.72],
      [s * 0.46, -s * 0.2],
      [s * 0.34, s * 0.38],
      [-s * 0.34, s * 0.38],
      [-s * 0.46, -s * 0.2],
    ],
    '#e0f2fe',
    flash ? '#ffffff' : body,
    '#bae6fd',
    2
  );
  if (!flash) {
    drawGlowBloom(ctx, 0, -s * 0.1, s * 0.32, accent, 0.55 + Math.sin(t * 6) * 0.2);
    drawGlowingEye(ctx, s * 0.12, -s * 0.34, s * 0.065, s * 0.05, '#ffffff');
    drawGlowingEye(ctx, -s * 0.08, -s * 0.34, s * 0.065, s * 0.05, '#ffffff');
  }
}

function drawFrostWarriorRig(
  ctx: CanvasRenderingContext2D,
  s: number,
  stride: number,
  armSwing: number,
  body: string,
  accent: string,
  flash: boolean
) {
  const legL = stride * s * 0.2;
  const legR = -stride * s * 0.2;
  drawArticulatedLeg(ctx, -s * 0.18, s * 0.26, -s * 0.2 + legL, s * 0.68, s * 0.1, '#7dd3fc', '#0c4a6e', '#e0f2fe', '#1e3a8a');
  drawArticulatedLeg(ctx, s * 0.18, s * 0.26, s * 0.2 + legR, s * 0.68, s * 0.1, '#7dd3fc', '#0c4a6e', '#e0f2fe', '#1e3a8a');

  fillShadedPoly(
    ctx,
    [
      [-s * 0.42, -s * 0.28],
      [s * 0.42, -s * 0.28],
      [s * 0.32, s * 0.34],
      [-s * 0.32, s * 0.34],
    ],
    '#38bdf8',
    flash ? '#ffffff' : body,
    '#090d16',
    1.9
  );
  drawArmorPauldron(ctx, -s * 0.38, -s * 0.24, s * 0.18, s * 0.15, '#e0f2fe', '#0369a1', accent, -1);
  drawArmorPauldron(ctx, s * 0.38, -s * 0.24, s * 0.18, s * 0.15, '#e0f2fe', '#0369a1', accent, 1);

  fillShadedEllipse(ctx, s * 0.02, -s * 0.5, s * 0.26, s * 0.24, '#bae6fd', '#0369a1', '#090d16', 1.8);
  if (!flash) {
    drawGlowingEye(ctx, s * 0.14, -s * 0.52, s * 0.06, s * 0.045, '#e0f2fe');
  }

  ctx.save();
  ctx.translate(s * 0.34, -s * 0.04);
  ctx.rotate(armSwing * 0.28);
  drawVolumetricLimb(ctx, 0, 0, s * 0.14, s * 0.1, s * 0.09, s * 0.08, '#7dd3fc', '#0369a1');
  fillShadedPoly(
    ctx,
    [
      [s * 0.08, s * 0.16],
      [s * 0.46, -s * 0.54],
      [s * 0.56, -s * 0.42],
      [s * 0.18, s * 0.2],
    ],
    '#ffffff',
    '#0284c7',
    '#090d16',
    1.6
  );
  ctx.restore();
}

function drawFrostGiantRig(
  ctx: CanvasRenderingContext2D,
  s: number,
  stride: number,
  armSwing: number,
  body: string,
  accent: string,
  flash: boolean
) {
  const legL = stride * s * 0.18;
  const legR = -stride * s * 0.18;
  drawArticulatedLeg(ctx, -s * 0.24, s * 0.26, -s * 0.28 + legL, s * 0.72, s * 0.13, '#bae6fd', '#1e3a8a', '#e0f2fe', '#0c4a6e');
  drawArticulatedLeg(ctx, s * 0.24, s * 0.26, s * 0.28 + legR, s * 0.72, s * 0.13, '#bae6fd', '#1e3a8a', '#e0f2fe', '#0c4a6e');

  fillShadedEllipse(ctx, 0, 0, s * 0.52, s * 0.44, '#7dd3fc', flash ? '#ffffff' : body, '#090d16', 2);
  drawArmorPauldron(ctx, -s * 0.44, -s * 0.24, s * 0.22, s * 0.17, '#ffffff', '#0284c7', accent, -1);
  drawArmorPauldron(ctx, s * 0.44, -s * 0.24, s * 0.22, s * 0.17, '#ffffff', '#0284c7', accent, 1);

  fillShadedEllipse(ctx, s * 0.04, -s * 0.52, s * 0.28, s * 0.26, '#e0f2fe', '#0369a1', '#090d16', 1.8);
  if (!flash) {
    drawGlowingEye(ctx, s * 0.16, -s * 0.54, s * 0.07, s * 0.05, '#fde047');
  }

  ctx.save();
  ctx.translate(s * 0.42, -s * 0.04);
  ctx.rotate(armSwing * 0.22);
  drawVolumetricLimb(ctx, 0, 0, s * 0.16, s * 0.14, s * 0.11, s * 0.1, '#7dd3fc', '#0369a1');
  drawVolumetricLimb(ctx, s * 0.12, s * 0.22, s * 0.44, -s * 0.5, 3.6, 3, '#e2e8f0', '#475569');
  fillShadedEllipse(ctx, s * 0.46, -s * 0.52, s * 0.2, s * 0.2, '#ffffff', '#0284c7', '#090d16', 1.6);
  ctx.restore();
}

// ============================================================================
// DESERT KINGDOM RIGS (Sand Warrior / Sand Elemental / Scorpion / Golem / Mummy)
// ============================================================================
function drawSandWarriorRig(
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
  drawArticulatedLeg(ctx, -s * 0.16, s * 0.24, -s * 0.18 + legL, s * 0.66, s * 0.09, '#fbbf24', '#78350f', '#fde68a', '#451a03');
  drawArticulatedLeg(ctx, s * 0.16, s * 0.24, s * 0.18 + legR, s * 0.66, s * 0.09, '#fbbf24', '#78350f', '#fde68a', '#451a03');

  fillShadedPoly(
    ctx,
    [
      [-s * 0.36, -s * 0.24],
      [s * 0.36, -s * 0.24],
      [s * 0.28, s * 0.34],
      [-s * 0.28, s * 0.34],
    ],
    '#eab308',
    flash ? '#ffffff' : body,
    '#090d16',
    1.8
  );
  // Desert Turban & Veil
  fillShadedEllipse(ctx, s * 0.02, -s * 0.46, s * 0.28, s * 0.26, '#fde047', '#92400e', '#090d16', 1.7);
  if (!flash) {
    drawGlowingEye(ctx, s * 0.14, -s * 0.46, s * 0.06, s * 0.045, accent);
  }

  ctx.save();
  ctx.translate(s * 0.3, -s * 0.04);
  ctx.rotate(armSwing * 0.32);
  drawVolumetricLimb(ctx, 0, 0, s * 0.14, s * 0.08, s * 0.08, s * 0.07, '#fbbf24', '#78350f');
  fillShadedPoly(
    ctx,
    [
      [s * 0.1, s * 0.14],
      [s * 0.44, -s * 0.42],
      [s * 0.52, -s * 0.26],
      [s * 0.2, s * 0.16],
    ],
    '#f8fafc',
    '#fbbf24',
    '#090d16',
    1.5
  );
  ctx.restore();
}

function drawSandElementalRig(
  ctx: CanvasRenderingContext2D,
  s: number,
  t: number,
  body: string,
  accent: string,
  flash: boolean
) {
  const swirl = Math.sin(t * 7) * 5;
  ctx.strokeStyle = 'rgba(253, 224, 71, 0.5)';
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  ctx.ellipse(0, s * 0.42, s * 0.72, s * 0.24, Math.sin(t * 4) * 0.15, 0, Math.PI * 2);
  ctx.stroke();

  fillShadedPoly(
    ctx,
    [
      [-s * 0.42, -s * 0.38],
      [s * 0.42, -s * 0.38],
      [s * 0.22, s * 0.12],
      [swirl, s * 0.56],
      [-s * 0.22, s * 0.12],
    ],
    '#fde047',
    flash ? '#ffffff' : body,
    '#090d16',
    1.8
  );
  fillShadedEllipse(ctx, s * 0.04, -s * 0.5, s * 0.24, s * 0.22, '#fef08a', '#b45309', '#090d16', 1.7);
  if (!flash) {
    drawGlowingEye(ctx, s * 0.14, -s * 0.52, s * 0.065, s * 0.05, accent);
    drawGlowingEye(ctx, -s * 0.04, -s * 0.52, s * 0.065, s * 0.05, accent);
  }
}

function drawScorpionCreatureRig(
  ctx: CanvasRenderingContext2D,
  s: number,
  stride: number,
  t: number,
  body: string,
  accent: string,
  flash: boolean
) {
  // 6 Articulated Scorpion Legs
  for (let i = -1; i <= 1; i++) {
    drawArticulatedLeg(ctx, i * s * 0.22, s * 0.14, i * s * 0.32 + stride * 4, s * 0.56, s * 0.075, '#f59e0b', '#78350f', '#b45309', '#451a03');
  }

  // Articulated Segmented Scorpion Stinger Tail
  const tailBob = Math.sin(t * 7) * 4;
  drawVolumetricLimb(ctx, -s * 0.32, -s * 0.02, -s * 0.62, -s * 0.44, s * 0.12, s * 0.1, '#d97706', '#78350f');
  drawVolumetricLimb(ctx, -s * 0.62, -s * 0.44, -s * 0.22, -s * 0.84 + tailBob, s * 0.1, s * 0.075, '#fbbf24', '#b45309');
  fillShadedPoly(
    ctx,
    [
      [-s * 0.24, -s * 0.88 + tailBob],
      [s * 0.08, -s * 0.72 + tailBob],
      [-s * 0.16, -s * 0.74 + tailBob],
    ],
    '#fef08a',
    '#dc2626',
    '#090d16',
    1.4
  );

  // Armored Carapace
  fillShadedEllipse(ctx, 0, 0, s * 0.48, s * 0.28, '#f59e0b', flash ? '#ffffff' : body, '#090d16', 1.9);

  // Dual Heavy Claws
  drawVolumetricLimb(ctx, s * 0.28, 0, s * 0.56, -s * 0.12, s * 0.09, s * 0.08, '#f59e0b', '#78350f');
  fillShadedEllipse(ctx, s * 0.68, -s * 0.16, s * 0.18, s * 0.13, '#fde047', accent, '#090d16', 1.5);

  if (!flash) {
    drawGlowingEye(ctx, s * 0.3, -s * 0.1, s * 0.06, s * 0.045, '#fde047');
  }
}

function drawMonolithGolemRig(
  ctx: CanvasRenderingContext2D,
  s: number,
  stride: number,
  armSwing: number,
  body: string,
  accent: string,
  isBoss: boolean,
  isSand: boolean,
  flash: boolean
) {
  const legL = stride * s * 0.18;
  const legR = -stride * s * 0.18;
  const light = isSand ? '#fbbf24' : '#94a3b8';
  const dark = isSand ? '#78350f' : '#334155';

  drawArticulatedLeg(ctx, -s * 0.24, s * 0.26, -s * 0.28 + legL, s * 0.72, s * 0.13, light, dark, accent, '#1e293b');
  drawArticulatedLeg(ctx, s * 0.24, s * 0.26, s * 0.28 + legR, s * 0.72, s * 0.13, light, dark, accent, '#1e293b');

  fillShadedPoly(
    ctx,
    [
      [-s * 0.52, -s * 0.36],
      [s * 0.52, -s * 0.36],
      [s * 0.38, s * 0.4],
      [-s * 0.38, s * 0.4],
    ],
    light,
    flash ? '#ffffff' : body,
    '#090d16',
    2
  );
  fillShadedPoly(
    ctx,
    [
      [-s * 0.24, -s * 0.7],
      [s * 0.24, -s * 0.7],
      [s * 0.22, -s * 0.36],
      [-s * 0.22, -s * 0.36],
    ],
    light,
    dark,
    '#090d16',
    1.8
  );
  if (!flash) {
    drawGlowBloom(ctx, 0, 0, s * 0.24, accent, 0.45);
    drawGlowingEye(ctx, s * 0.1, -s * 0.52, s * 0.065, s * 0.045, accent);
    if (isBoss) drawGlowingEye(ctx, -s * 0.1, -s * 0.52, s * 0.065, s * 0.045, accent);
  }

  ctx.save();
  ctx.translate(s * 0.46, -s * 0.04);
  ctx.rotate(armSwing * 0.22);
  drawVolumetricLimb(ctx, 0, 0, s * 0.16, s * 0.16, s * 0.12, s * 0.11, light, dark);
  ctx.restore();
}

function drawMummyGuardRig(
  ctx: CanvasRenderingContext2D,
  s: number,
  stride: number,
  armSwing: number,
  body: string,
  accent: string,
  flash: boolean
) {
  const legL = stride * s * 0.2;
  const legR = -stride * s * 0.2;
  drawArticulatedLeg(ctx, -s * 0.16, s * 0.24, -s * 0.18 + legL, s * 0.66, s * 0.095, '#fef08a', '#92400e', '#fde047', '#451a03');
  drawArticulatedLeg(ctx, s * 0.16, s * 0.24, s * 0.18 + legR, s * 0.66, s * 0.095, '#fef08a', '#92400e', '#fde047', '#451a03');

  fillShadedPoly(
    ctx,
    [
      [-s * 0.36, -s * 0.26],
      [s * 0.36, -s * 0.26],
      [s * 0.28, s * 0.34],
      [-s * 0.28, s * 0.34],
    ],
    '#fef08a',
    flash ? '#ffffff' : body,
    '#090d16',
    1.8
  );
  // Pharaoh Gold Collar & Linen Bandage Wraps
  fillShadedEllipse(ctx, 0, -s * 0.16, s * 0.28, s * 0.1, '#fde047', '#b45309', '#090d16', 1.4);
  fillShadedEllipse(ctx, s * 0.02, -s * 0.48, s * 0.25, s * 0.24, '#fef08a', '#a16207', '#090d16', 1.7);
  if (!flash) {
    drawGlowingEye(ctx, s * 0.12, -s * 0.5, s * 0.06, s * 0.045, accent);
  }

  ctx.save();
  ctx.translate(s * 0.32, -s * 0.04);
  ctx.rotate(armSwing * 0.24);
  drawVolumetricLimb(ctx, 0, 0, s * 0.22, s * 0.04, s * 0.085, s * 0.075, '#fef08a', '#92400e');
  ctx.restore();
}

// ============================================================================
// GENERIC HIGH-DETAIL FALLBACKS (Zero Stick Figures)
// ============================================================================
function drawMushroomMutantRig(
  ctx: CanvasRenderingContext2D,
  s: number,
  stride: number,
  armSwing: number,
  _t: number,
  body: string,
  accent: string,
  _isBoss: boolean,
  flash: boolean
) {
  const legL = stride * s * 0.22;
  const legR = -stride * s * 0.22;
  drawArticulatedLeg(ctx, -s * 0.16, s * 0.22, -s * 0.18 + legL, s * 0.64, s * 0.09, '#e879f9', '#581c87', '#bef264', '#3b0764');
  drawArticulatedLeg(ctx, s * 0.16, s * 0.22, s * 0.18 + legR, s * 0.64, s * 0.09, '#e879f9', '#581c87', '#bef264', '#3b0764');
  fillShadedEllipse(ctx, 0, 0, s * 0.38, s * 0.34, '#e879f9', body, '#090d16', 1.8);
  fillShadedEllipse(ctx, 0, -s * 0.44, s * 0.46, s * 0.22, '#f0abfc', '#7e22ce', '#090d16', 1.7);
  if (!flash) drawGlowingEye(ctx, s * 0.14, -s * 0.08, s * 0.065, s * 0.055, accent);
  ctx.save();
  ctx.translate(s * 0.3, 0);
  ctx.rotate(armSwing * 0.3);
  drawVolumetricLimb(ctx, 0, 0, s * 0.18, s * 0.06, s * 0.08, s * 0.07, '#f0abfc', body);
  ctx.restore();
}

function drawAbyssalSeaRig(
  ctx: CanvasRenderingContext2D,
  _id: string,
  s: number,
  stride: number,
  armSwing: number,
  _t: number,
  body: string,
  accent: string,
  _isBoss: boolean,
  flash: boolean
) {
  const legL = stride * s * 0.2;
  const legR = -stride * s * 0.2;
  drawArticulatedLeg(ctx, -s * 0.16, s * 0.24, -s * 0.18 + legL, s * 0.66, s * 0.09, '#2dd4bf', '#134e4a', '#5eead4', '#0f766e');
  drawArticulatedLeg(ctx, s * 0.16, s * 0.24, s * 0.18 + legR, s * 0.66, s * 0.09, '#2dd4bf', '#134e4a', '#5eead4', '#0f766e');
  fillShadedEllipse(ctx, 0, 0, s * 0.4, s * 0.36, '#2dd4bf', body, '#090d16', 1.9);
  fillShadedEllipse(ctx, s * 0.1, -s * 0.36, s * 0.26, s * 0.22, '#5eead4', body, '#090d16', 1.7);
  if (!flash) drawGlowingEye(ctx, s * 0.2, -s * 0.38, s * 0.065, s * 0.05, accent);
  ctx.save();
  ctx.translate(s * 0.32, 0);
  ctx.rotate(armSwing * 0.28);
  drawVolumetricLimb(ctx, 0, 0, s * 0.2, s * 0.06, s * 0.08, s * 0.07, '#2dd4bf', body);
  ctx.restore();
}

function drawFlyingMonsterRig(
  ctx: CanvasRenderingContext2D,
  _id: string,
  s: number,
  t: number,
  dist: number,
  body: string,
  accent: string,
  _isBoss: boolean,
  flash: boolean
) {
  const flap = Math.sin(t * 14 + dist * 0.09) * s * 0.48;
  drawDragonWing(ctx, -s * 0.08, -s * 0.08, s * 1.15, flap, -1, '#334155', accent, body);
  fillShadedEllipse(ctx, 0, 0, s * 0.42, s * 0.26, accent, body, '#090d16', 1.9);
  fillShadedEllipse(ctx, s * 0.34, -s * 0.14, s * 0.22, s * 0.2, '#f8fafc', body, '#090d16', 1.7);
  if (!flash) drawGlowingEye(ctx, s * 0.42, -s * 0.16, s * 0.06, s * 0.048, '#fde047');
  drawDragonWing(ctx, s * 0.06, -s * 0.06, s * 1.02, -flap * 0.65, 1, '#475569', accent, body);
}

function drawBossOverlordRig(
  ctx: CanvasRenderingContext2D,
  _id: string,
  s: number,
  stride: number,
  armSwing: number,
  _t: number,
  body: string,
  accent: string,
  flash: boolean
) {
  const legL = stride * s * 0.18;
  const legR = -stride * s * 0.18;
  drawArticulatedLeg(ctx, -s * 0.24, s * 0.28, -s * 0.26 + legL, s * 0.74, s * 0.13, '#64748b', '#1e293b', accent, '#0f172a');
  drawArticulatedLeg(ctx, s * 0.24, s * 0.28, s * 0.26 + legR, s * 0.74, s * 0.13, '#64748b', '#1e293b', accent, '#0f172a');
  fillShadedPoly(
    ctx,
    [
      [-s * 0.54, -s * 0.36],
      [s * 0.54, -s * 0.36],
      [s * 0.4, s * 0.4],
      [-s * 0.4, s * 0.4],
    ],
    '#64748b',
    body,
    '#090d16',
    2.2
  );
  drawArmorPauldron(ctx, -s * 0.44, -s * 0.28, s * 0.22, s * 0.18, '#94a3b8', '#1e293b', accent, -1);
  drawArmorPauldron(ctx, s * 0.44, -s * 0.28, s * 0.22, s * 0.18, '#94a3b8', '#1e293b', accent, 1);
  fillShadedEllipse(ctx, s * 0.02, -s * 0.56, s * 0.28, s * 0.26, '#94a3b8', body, '#090d16', 1.9);
  if (!flash) drawGlowingEye(ctx, s * 0.14, -s * 0.58, s * 0.075, s * 0.055, accent);
  ctx.save();
  ctx.translate(s * 0.44, -s * 0.06);
  ctx.rotate(armSwing * 0.24);
  drawVolumetricLimb(ctx, 0, 0, s * 0.18, s * 0.12, s * 0.11, s * 0.09, '#94a3b8', body);
  ctx.restore();
}

function drawArmoredWarriorRig(
  ctx: CanvasRenderingContext2D,
  s: number,
  stride: number,
  armSwing: number,
  body: string,
  accent: string,
  flash: boolean
) {
  const legL = stride * s * 0.2;
  const legR = -stride * s * 0.2;
  drawArticulatedLeg(ctx, -s * 0.18, s * 0.24, -s * 0.2 + legL, s * 0.68, s * 0.11, '#94a3b8', '#1e293b', '#cbd5e1', '#0f172a');
  drawArticulatedLeg(ctx, s * 0.18, s * 0.24, s * 0.2 + legR, s * 0.68, s * 0.11, '#94a3b8', '#1e293b', '#cbd5e1', '#0f172a');
  fillShadedPoly(
    ctx,
    [
      [-s * 0.42, -s * 0.28],
      [s * 0.42, -s * 0.28],
      [s * 0.34, s * 0.34],
      [-s * 0.34, s * 0.34],
    ],
    '#94a3b8',
    body,
    '#090d16',
    1.9
  );
  drawArmorPauldron(ctx, -s * 0.38, -s * 0.22, s * 0.18, s * 0.15, '#cbd5e1', '#334155', accent, -1);
  drawArmorPauldron(ctx, s * 0.38, -s * 0.22, s * 0.18, s * 0.15, '#cbd5e1', '#334155', accent, 1);
  fillShadedEllipse(ctx, s * 0.02, -s * 0.5, s * 0.26, s * 0.24, '#cbd5e1', body, '#090d16', 1.8);
  if (!flash) drawGlowingEye(ctx, s * 0.12, -s * 0.52, s * 0.065, s * 0.048, accent);
  ctx.save();
  ctx.translate(s * 0.34, -s * 0.04);
  ctx.rotate(armSwing * 0.28);
  drawVolumetricLimb(ctx, 0, 0, s * 0.18, s * 0.08, s * 0.09, s * 0.08, '#94a3b8', body);
  ctx.restore();
}

function drawFiendWarriorRig(
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
  drawArticulatedLeg(ctx, -s * 0.15, s * 0.22, -s * 0.18 + legL, s * 0.66, s * 0.09, body, '#1e293b', accent, '#0f172a');
  drawArticulatedLeg(ctx, s * 0.15, s * 0.22, s * 0.18 + legR, s * 0.66, s * 0.09, body, '#1e293b', accent, '#0f172a');
  fillShadedEllipse(ctx, 0, 0, s * 0.36, s * 0.34, accent, body, '#090d16', 1.8);
  fillShadedEllipse(ctx, s * 0.04, -s * 0.42, s * 0.24, s * 0.22, accent, body, '#090d16', 1.7);
  if (!flash) drawGlowingEye(ctx, s * 0.14, -s * 0.44, s * 0.06, s * 0.048, '#fde047');
  ctx.save();
  ctx.translate(s * 0.28, -s * 0.02);
  ctx.rotate(armSwing * 0.32);
  drawVolumetricLimb(ctx, 0, 0, s * 0.18, s * 0.06, s * 0.08, s * 0.07, accent, body);
  ctx.restore();
}

// ============================================================================
// CUSTOMIZED DEFEAT SHOCKWAVE + TUMBLING ARMOR / CRYSTAL SHARDS
// ============================================================================
export function drawDefeatedMonsterEffect(ctx: CanvasRenderingContext2D, fx: DefeatedEffect) {
  const progress = 1 - Math.max(0, fx.life / fx.maxLife);
  const alpha = Math.max(0, 1 - progress);
  const s = fx.size;

  ctx.save();
  ctx.translate(fx.x, fx.y);
  ctx.globalAlpha = alpha;

  // Dual Shockwave Rings
  ctx.strokeStyle = fx.accentColor;
  ctx.lineWidth = fx.isBoss ? 4.2 : 2.6;
  ctx.beginPath();
  ctx.ellipse(0, 2, s * (0.6 + progress * 1.45), s * (0.34 + progress * 0.78), 0, 0, Math.PI * 2);
  ctx.stroke();

  if (fx.isBoss) {
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(0, 2, s * (0.4 + progress * 1.85), s * (0.24 + progress * 1.0), 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Rising Translucent Smoke Puffs
  const puffCount = fx.isBoss ? 7 : 4;
  for (let i = 0; i < puffCount; i++) {
    const a = (Math.PI * 2 * i) / puffCount + 0.5;
    const dist = s * (0.25 + progress * 0.9);
    const px = Math.cos(a) * dist;
    const py = Math.sin(a) * dist * 0.55 - progress * 22;
    ctx.fillStyle = fx.isBoss ? 'rgba(248, 250, 252, 0.35)' : 'rgba(148, 163, 184, 0.32)';
    ctx.beginPath();
    ctx.arc(px, py, s * (0.22 + progress * 0.14), 0, Math.PI * 2);
    ctx.fill();
  }

  // Tumbling Shaded Armor / Crystal / Bone Shards
  const shardCount = fx.isBoss ? 12 : 7;
  for (let i = 0; i < shardCount; i++) {
    const angle = (Math.PI * 2 * i) / shardCount + 0.3;
    const dist = s * (0.28 + progress * (fx.isBoss ? 1.55 : 1.05));
    const sx = Math.cos(angle) * dist;
    const sy = Math.sin(angle) * dist * 0.68 - Math.sin(progress * Math.PI) * 18;
    ctx.save();
    ctx.translate(sx, sy);
    ctx.rotate(progress * 5 + i);
    const sr = fx.isBoss ? 7.5 : 5;
    fillShadedPoly(
      ctx,
      [
        [0, -sr],
        [sr * 0.8, 0],
        [0, sr * 0.9],
        [-sr * 0.7, sr * 0.2],
      ],
      i % 2 === 0 ? fx.accentColor : '#f8fafc',
      fx.bodyColor,
      '#090d16',
      1.1
    );
    ctx.restore();
  }

  ctx.restore();
}
