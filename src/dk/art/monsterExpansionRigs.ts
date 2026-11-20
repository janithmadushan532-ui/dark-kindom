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

/**
 * High-detail futuristic character rigs for all 26 Expansion Enemies (Worlds 11–15, Levels 51–100).
 * Every unit has distinct sci-fi/cyber/bio-mech/cryo/void/omega silhouettes,
 * volumetric shading, armor plates, glowing cores, and articulated limbs.
 */
export function drawExpansionMonsterRig(
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
  switch (id) {
    // WORLD 11: CYBER WASTELAND
    case 'scrap_runner_mech':
      drawScrapRunnerMech(ctx, s, stride, armSwing, t, body, accent, flash);
      return true;
    case 'wasteland_bulldozer':
      drawWastelandBulldozer(ctx, s, t, body, accent, flash);
      return true;
    case 'emp_sniper_droid':
      drawEmpSniperDroid(ctx, s, stride, armSwing, t, body, accent, flash);
      return true;
    case 'scrap_bomber_drone':
      drawScrapBomberDrone(ctx, s, t, dist, body, accent, flash);
      return true;
    case 'boss_wasteland_colossus':
      drawWastelandColossusBoss(ctx, s, stride, armSwing, t, body, accent, flash);
      return true;

    // WORLD 12: TOXIC MUTATION ZONE
    case 'acid_mutant_stalker':
      drawAcidMutantStalker(ctx, s, stride, armSwing, t, body, accent, flash);
      return true;
    case 'mutated_acid_spider':
      drawMutatedAcidSpider(ctx, s, stride, t, body, accent, flash);
      return true;
    case 'brood_mech_spider':
      drawBroodMechSpider(ctx, s, stride, t, body, accent, flash);
      return true;
    case 'bio_mutant_juggernaut':
      drawBioMutantJuggernaut(ctx, s, stride, armSwing, t, body, accent, flash);
      return true;
    case 'toxic_spitter_wasp':
      drawToxicSpitterWasp(ctx, s, t, dist, body, accent, flash);
      return true;
    case 'boss_mutation_hydra':
      drawMutationHydraBoss(ctx, s, stride, armSwing, t, body, accent, flash);
      return true;

    // WORLD 13: FROZEN MECHA KINGDOM
    case 'cryo_jet_rusher':
      drawCryoJetRusher(ctx, s, stride, armSwing, t, body, accent, flash);
      return true;
    case 'glacier_mech_tank':
      drawGlacierMechTank(ctx, s, t, body, accent, flash);
      return true;
    case 'cryo_artillery_walker':
      drawCryoArtilleryWalker(ctx, s, stride, t, body, accent, flash);
      return true;
    case 'blizzard_stealth_jet':
      drawBlizzardStealthJet(ctx, s, t, dist, body, accent, flash);
      return true;
    case 'boss_absolute_zero':
      drawAbsoluteZeroBoss(ctx, s, stride, armSwing, t, body, accent, flash);
      return true;

    // WORLD 14: VOID DIMENSION
    case 'void_teleporter':
      drawVoidTeleporter(ctx, s, stride, armSwing, t, body, accent, flash);
      return true;
    case 'void_rift_juggernaut':
      drawVoidRiftJuggernaut(ctx, s, stride, armSwing, t, body, accent, flash);
      return true;
    case 'void_disruptor_eye':
      drawVoidDisruptorEye(ctx, s, t, body, accent, flash);
      return true;
    case 'void_leviathan_flyer':
      drawVoidLeviathanFlyer(ctx, s, t, dist, body, accent, flash);
      return true;
    case 'boss_void_archon':
      drawVoidArchonBoss(ctx, s, t, dist, body, accent, flash);
      return true;

    // WORLD 15: OMEGA FINAL WAR
    case 'omega_cyber_vanguard':
      drawOmegaCyberVanguard(ctx, s, stride, armSwing, t, body, accent, flash);
      return true;
    case 'omega_siege_tank':
      drawOmegaSiegeTank(ctx, s, t, body, accent, flash);
      return true;
    case 'omega_railgun_strider':
      drawOmegaRailgunStrider(ctx, s, stride, t, body, accent, flash);
      return true;
    case 'omega_stealth_interceptor':
      drawOmegaStealthInterceptor(ctx, s, t, dist, body, accent, flash);
      return true;
    case 'boss_omega_supreme_overlord':
      drawOmegaSupremeOverlordBoss(ctx, s, t, dist, body, accent, flash);
      return true;

    default:
      return false;
  }
}

function coreGlow(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  color: string,
  flash: boolean
) {
  if (flash) return;
  drawGlowBloom(ctx, x, y, r * 2.2, color, 0.55);
  ctx.fillStyle = '#090d16';
  ctx.beginPath();
  ctx.arc(x, y, r * 1.15, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r * 0.85, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(x - r * 0.22, y - r * 0.22, r * 0.34, 0, Math.PI * 2);
  ctx.fill();
}

// ======================== WORLD 11: CYBER WASTELAND ========================

function drawScrapRunnerMech(
  ctx: CanvasRenderingContext2D,
  s: number,
  stride: number,
  armSwing: number,
  t: number,
  body: string,
  accent: string,
  flash: boolean
) {
  const b = flash ? '#ffffff' : body;
  const rust = flash ? '#ffffff' : '#78350f';
  const hi = flash ? '#ffffff' : '#64748b';
  const ac = flash ? '#ffffff' : accent;

  // Digitigrade cyber legs
  drawArticulatedLeg(ctx, -s * 0.22, s * 0.22, -s * 0.36 + stride * 0.45, s * 0.92, s * 0.14, hi, b, rust, '#1e293b');
  drawArticulatedLeg(ctx, s * 0.22, s * 0.22, s * 0.36 - stride * 0.45, s * 0.92, s * 0.14, hi, b, rust, '#1e293b');

  // Exhaust booster on back
  fillShadedPoly(ctx, [[-s * 0.52, -s * 0.3], [-s * 0.12, -s * 0.42], [-s * 0.12, s * 0.12], [-s * 0.48, s * 0.08]], rust, '#1e293b');
  if (!flash) {
    drawGlowBloom(ctx, -s * 0.58, -s * 0.05, s * 0.38, ac, 0.45 + 0.2 * Math.sin(t * 14));
  }

  // Forward-leaning armored chassis
  fillShadedPoly(
    ctx,
    [[-s * 0.36, -s * 0.42], [s * 0.44, -s * 0.3], [s * 0.34, s * 0.28], [-s * 0.28, s * 0.26]],
    hi,
    b
  );
  coreGlow(ctx, s * 0.08, -s * 0.05, s * 0.14, ac, flash);

  // Scythe cyber arm
  drawVolumetricLimb(ctx, s * 0.26, -s * 0.15, s * 0.68, s * 0.14 + armSwing * 0.2, s * 0.12, s * 0.08, rust, b);
  fillShadedPoly(ctx, [[s * 0.62, s * 0.06], [s * 0.96, s * 0.24], [s * 0.56, s * 0.28]], ac, rust);

  // Visor sensor head + antenna
  fillShadedEllipse(ctx, s * 0.16, -s * 0.56, s * 0.3, s * 0.22, hi, b);
  drawVolumetricLimb(ctx, -s * 0.04, -s * 0.72, -s * 0.16, -s * 1.02, s * 0.04, s * 0.02, ac, b);
  drawGlowingEye(ctx, s * 0.28, -s * 0.56, s * 0.14, s * 0.07, ac);
}

function drawWastelandBulldozer(
  ctx: CanvasRenderingContext2D,
  s: number,
  t: number,
  body: string,
  accent: string,
  flash: boolean
) {
  const b = flash ? '#ffffff' : body;
  const hi = flash ? '#ffffff' : '#475569';
  const rust = flash ? '#ffffff' : '#9a3412';
  const ac = flash ? '#ffffff' : accent;

  // Heavy tank treads
  fillShadedPoly(ctx, [[-s * 0.85, s * 0.26], [s * 0.76, s * 0.26], [s * 0.68, s * 0.74], [-s * 0.76, s * 0.74]], '#334155', '#090d16');
  for (let i = -2; i <= 2; i++) {
    fillShadedEllipse(ctx, i * s * 0.3, s * 0.5, s * 0.14, s * 0.16, hi, '#0f172a');
  }

  // Armored hull
  fillShadedPoly(ctx, [[-s * 0.76, -s * 0.45], [s * 0.58, -s * 0.38], [s * 0.64, s * 0.34], [-s * 0.78, s * 0.34]], hi, b);

  // Front bulldozer ram blade with hazard stripes
  fillShadedPoly(ctx, [[s * 0.52, -s * 0.28], [s * 0.98, -s * 0.12], [s * 1.05, s * 0.62], [s * 0.52, s * 0.55]], ac, rust);

  // Turret dome & twin cannons
  fillShadedEllipse(ctx, -s * 0.1, -s * 0.58, s * 0.42, s * 0.26, rust, b);
  drawVolumetricLimb(ctx, s * 0.2, -s * 0.62, s * 0.86, -s * 0.66, s * 0.08, s * 0.07, hi, b);
  drawVolumetricLimb(ctx, s * 0.2, -s * 0.48, s * 0.82, -s * 0.5, s * 0.08, s * 0.07, hi, b);
  coreGlow(ctx, -s * 0.15, -s * 0.05, s * 0.18 + 0.02 * Math.sin(t * 6), ac, flash);
  drawGlowingEye(ctx, s * 0.18, -s * 0.58, s * 0.12, s * 0.07, '#ef4444');
}

function drawEmpSniperDroid(
  ctx: CanvasRenderingContext2D,
  s: number,
  stride: number,
  armSwing: number,
  t: number,
  body: string,
  accent: string,
  flash: boolean
) {
  const b = flash ? '#ffffff' : body;
  const hi = flash ? '#ffffff' : '#334155';
  const ac = flash ? '#ffffff' : accent;

  drawArticulatedLeg(ctx, -s * 0.24, s * 0.22, -s * 0.28 + stride * 0.35, s * 0.96, s * 0.14, hi, b, ac, '#090d16');
  drawArticulatedLeg(ctx, s * 0.24, s * 0.22, s * 0.28 - stride * 0.35, s * 0.96, s * 0.14, hi, b, ac, '#090d16');

  // Sleek sniper torso + armored cloak fins
  fillShadedPoly(ctx, [[-s * 0.42, -s * 0.45], [s * 0.42, -s * 0.45], [s * 0.28, s * 0.34], [-s * 0.28, s * 0.34]], hi, b);
  drawArmorPauldron(ctx, -s * 0.44, -s * 0.34, s * 0.24, s * 0.18, hi, b, ac, -1);
  drawArmorPauldron(ctx, s * 0.44, -s * 0.34, s * 0.24, s * 0.18, hi, b, ac, 1);

  // Long EMP rail-rifle
  drawVolumetricLimb(ctx, -s * 0.2, -s * 0.12, s * 0.42, s * 0.05 + armSwing * 0.08, s * 0.1, s * 0.09, hi, b);
  fillShadedPoly(ctx, [[s * 0.15, -s * 0.16], [s * 1.18, -s * 0.08], [s * 1.18, s * 0.06], [s * 0.15, s * 0.04]], '#1e293b', '#090d16');
  if (!flash) {
    drawGlowBloom(ctx, s * 1.15, -s * 0.01, s * 0.26, ac, 0.55 + 0.25 * Math.sin(t * 9));
  }

  // Cyclops sniper dome head
  fillShadedEllipse(ctx, 0, -s * 0.66, s * 0.28, s * 0.26, hi, b);
  drawGlowingEye(ctx, s * 0.12, -s * 0.66, s * 0.14, s * 0.1, ac);
}

function drawScrapBomberDrone(
  ctx: CanvasRenderingContext2D,
  s: number,
  t: number,
  dist: number,
  body: string,
  accent: string,
  flash: boolean
) {
  const b = flash ? '#ffffff' : body;
  const hi = flash ? '#ffffff' : '#52525b';
  const ac = flash ? '#ffffff' : accent;
  const hover = Math.sin(t * 8 + dist * 0.04) * s * 0.08;

  // Twin side jet nacelles
  fillShadedPoly(ctx, [[-s * 0.96, -s * 0.28 + hover], [-s * 0.42, -s * 0.38 + hover], [-s * 0.48, s * 0.2 + hover], [-s * 0.92, s * 0.14 + hover]], hi, b);
  fillShadedPoly(ctx, [[s * 0.42, -s * 0.38 + hover], [s * 0.96, -s * 0.28 + hover], [s * 0.92, s * 0.14 + hover], [s * 0.48, s * 0.2 + hover]], hi, b);

  // Main bomber fuselage
  fillShadedEllipse(ctx, 0, -s * 0.05 + hover, s * 0.54, s * 0.38, hi, b);
  // Under-slung plasma bomb
  fillShadedEllipse(ctx, 0, s * 0.4 + hover, s * 0.28, s * 0.18, ac, '#7c2d12');
  coreGlow(ctx, s * 0.22, -s * 0.06 + hover, s * 0.16, ac, flash);
  if (!flash) {
    drawGlowBloom(ctx, -s * 0.72, s * 0.24 + hover, s * 0.25, '#fb923c', 0.6);
    drawGlowBloom(ctx, s * 0.72, s * 0.24 + hover, s * 0.25, '#fb923c', 0.6);
  }
}

function drawWastelandColossusBoss(
  ctx: CanvasRenderingContext2D,
  s: number,
  stride: number,
  armSwing: number,
  t: number,
  body: string,
  accent: string,
  flash: boolean
) {
  const b = flash ? '#ffffff' : body;
  const hi = flash ? '#ffffff' : '#475569';
  const rust = flash ? '#ffffff' : '#9a3412';
  const ac = flash ? '#ffffff' : accent;

  // Massive hydraulic legs
  drawArticulatedLeg(ctx, -s * 0.34, s * 0.28, -s * 0.42 + stride * 0.4, s * 1.05, s * 0.22, hi, b, rust, '#090d16');
  drawArticulatedLeg(ctx, s * 0.34, s * 0.28, s * 0.42 - stride * 0.4, s * 1.05, s * 0.22, hi, b, rust, '#090d16');

  // Back smokestacks
  fillShadedPoly(ctx, [[-s * 0.48, -s * 0.98], [-s * 0.3, -s * 0.98], [-s * 0.26, -s * 0.4], [-s * 0.52, -s * 0.4]], rust, '#090d16');
  fillShadedPoly(ctx, [[s * 0.3, -s * 0.98], [s * 0.48, -s * 0.98], [s * 0.52, -s * 0.4], [s * 0.26, -s * 0.4]], rust, '#090d16');

  // Heavy industrial chest
  fillShadedPoly(ctx, [[-s * 0.64, -s * 0.52], [s * 0.64, -s * 0.52], [s * 0.48, s * 0.4], [-s * 0.48, s * 0.4]], hi, b);
  drawArmorPauldron(ctx, -s * 0.68, -s * 0.36, s * 0.34, s * 0.26, rust, b, ac, -1);
  drawArmorPauldron(ctx, s * 0.68, -s * 0.36, s * 0.34, s * 0.26, rust, b, ac, 1);

  // Wrecker claw + siege cannon arm
  drawVolumetricLimb(ctx, -s * 0.66, -s * 0.2, -s * 0.94, s * 0.4 + armSwing * 0.2, s * 0.18, s * 0.14, hi, b);
  fillShadedEllipse(ctx, -s * 0.96, s * 0.46 + armSwing * 0.2, s * 0.24, s * 0.2, ac, rust);
  drawVolumetricLimb(ctx, s * 0.66, -s * 0.2, s * 1.06, s * 0.15 - armSwing * 0.2, s * 0.18, s * 0.14, hi, b);
  fillShadedPoly(ctx, [[s * 0.88, 0], [s * 1.25, s * 0.05], [s * 1.25, s * 0.26], [s * 0.88, s * 0.26]], '#334155', '#090d16');

  coreGlow(ctx, 0, -s * 0.05, s * 0.24 + 0.03 * Math.sin(t * 7), ac, flash);

  // Armored juggernaut head + furnace visor
  fillShadedPoly(ctx, [[-s * 0.3, -s * 0.82], [s * 0.3, -s * 0.82], [s * 0.34, -s * 0.46], [-s * 0.34, -s * 0.46]], hi, b);
  drawGlowingEye(ctx, -s * 0.1, -s * 0.64, s * 0.1, s * 0.06, ac);
  drawGlowingEye(ctx, s * 0.14, -s * 0.64, s * 0.1, s * 0.06, ac);
}

// ======================== WORLD 12: TOXIC MUTATION ZONE ========================

function drawAcidMutantStalker(
  ctx: CanvasRenderingContext2D,
  s: number,
  stride: number,
  armSwing: number,
  t: number,
  body: string,
  accent: string,
  flash: boolean
) {
  const b = flash ? '#ffffff' : body;
  const hi = flash ? '#ffffff' : '#166534';
  const ac = flash ? '#ffffff' : accent;

  drawArticulatedLeg(ctx, -s * 0.22, s * 0.2, -s * 0.34 + stride * 0.5, s * 0.92, s * 0.14, hi, b, ac, '#052e16');
  drawArticulatedLeg(ctx, s * 0.22, s * 0.2, s * 0.34 - stride * 0.5, s * 0.92, s * 0.14, hi, b, ac, '#052e16');

  // Bio-hunched torso + glowing dorsal acid sacs
  fillShadedEllipse(ctx, -s * 0.04, -s * 0.06, s * 0.42, s * 0.36, hi, b);
  coreGlow(ctx, -s * 0.26, -s * 0.28, s * 0.15 + 0.02 * Math.sin(t * 8), ac, flash);

  // Razor mutant claws
  drawVolumetricLimb(ctx, s * 0.24, -s * 0.12, s * 0.66, s * 0.16 + armSwing * 0.25, s * 0.12, s * 0.07, hi, b);
  fillShadedPoly(ctx, [[s * 0.62, s * 0.1], [s * 0.96, s * 0.22], [s * 0.62, s * 0.28]], ac, '#14532d');

  // Mutant skull + triple acid eyes
  fillShadedEllipse(ctx, s * 0.2, -s * 0.52, s * 0.28, s * 0.24, hi, b);
  drawGlowingEye(ctx, s * 0.28, -s * 0.56, s * 0.08, s * 0.06, ac);
  drawGlowingEye(ctx, s * 0.36, -s * 0.46, s * 0.06, s * 0.05, ac);
}

function drawMutatedAcidSpider(
  ctx: CanvasRenderingContext2D,
  s: number,
  stride: number,
  t: number,
  body: string,
  accent: string,
  flash: boolean
) {
  const b = flash ? '#ffffff' : body;
  const hi = flash ? '#ffffff' : '#365314';
  const ac = flash ? '#ffffff' : accent;

  // 8 articulated cyber-organic spider legs
  for (let side of [-1, 1] as const) {
    for (let i = 0; i < 4; i++) {
      const ang = (i - 1.5) * 0.42;
      const step = Math.sin(t * 10 + i * 1.4 + side) * s * 0.14;
      const hx = side * s * 0.26;
      const hy = (i - 1.5) * s * 0.16;
      const fx = side * (s * 0.85 + Math.cos(ang) * s * 0.18) + step * 0.3;
      const fy = hy + Math.sin(ang) * s * 0.44 + stride * 0.15;
      drawVolumetricLimb(ctx, hx, hy, (hx + fx) * 0.5, (hy + fy) * 0.5 - s * 0.22, s * 0.07, s * 0.055, hi, b);
      drawVolumetricLimb(ctx, (hx + fx) * 0.5, (hy + fy) * 0.5 - s * 0.22, fx, fy, s * 0.055, s * 0.035, ac, b);
    }
  }

  // Acid abdomen sack
  fillShadedEllipse(ctx, -s * 0.22, -s * 0.12, s * 0.46, s * 0.38, hi, b);
  coreGlow(ctx, -s * 0.26, -s * 0.14, s * 0.18, ac, flash);

  // Armored cephalothorax + fangs
  fillShadedEllipse(ctx, s * 0.22, 0, s * 0.32, s * 0.26, '#3f6212', b);
  drawGlowingEye(ctx, s * 0.34, -s * 0.09, s * 0.07, s * 0.05, ac);
  drawGlowingEye(ctx, s * 0.34, s * 0.09, s * 0.07, s * 0.05, ac);
}

function drawBroodMechSpider(
  ctx: CanvasRenderingContext2D,
  s: number,
  stride: number,
  t: number,
  body: string,
  accent: string,
  flash: boolean
) {
  const b = flash ? '#ffffff' : body;
  const hi = flash ? '#ffffff' : '#334155';
  const ac = flash ? '#ffffff' : accent;

  for (let side of [-1, 1] as const) {
    for (let i = 0; i < 4; i++) {
      const ang = (i - 1.5) * 0.45;
      const hx = side * s * 0.3;
      const hy = (i - 1.5) * s * 0.18;
      const fx = side * (s * 0.92 + Math.cos(ang) * s * 0.16);
      const fy = hy + Math.sin(ang) * s * 0.46 + stride * 0.18 * (i % 2 === 0 ? 1 : -1);
      drawVolumetricLimb(ctx, hx, hy, (hx + fx) * 0.5, (hy + fy) * 0.5 - s * 0.25, s * 0.09, s * 0.07, hi, b);
      drawVolumetricLimb(ctx, (hx + fx) * 0.5, (hy + fy) * 0.5 - s * 0.25, fx, fy, s * 0.07, s * 0.04, ac, '#090d16');
    }
  }

  // Hexagonal armored cyber-carapace
  fillShadedPoly(
    ctx,
    [[-s * 0.62, -s * 0.34], [s * 0.45, -s * 0.3], [s * 0.62, 0], [s * 0.45, s * 0.3], [-s * 0.62, s * 0.34]],
    hi,
    b
  );
  coreGlow(ctx, -s * 0.12, 0, s * 0.2 + 0.02 * Math.sin(t * 7), ac, flash);
  drawGlowingEye(ctx, s * 0.44, -s * 0.12, s * 0.08, s * 0.06, ac);
  drawGlowingEye(ctx, s * 0.44, s * 0.12, s * 0.08, s * 0.06, ac);
}

function drawBioMutantJuggernaut(
  ctx: CanvasRenderingContext2D,
  s: number,
  stride: number,
  armSwing: number,
  t: number,
  body: string,
  accent: string,
  flash: boolean
) {
  const b = flash ? '#ffffff' : body;
  const hi = flash ? '#ffffff' : '#15803d';
  const ac = flash ? '#ffffff' : accent;

  drawArticulatedLeg(ctx, -s * 0.3, s * 0.28, -s * 0.36 + stride * 0.35, s * 1.0, s * 0.2, hi, b, '#334155', '#090d16');
  drawArticulatedLeg(ctx, s * 0.3, s * 0.28, s * 0.36 - stride * 0.35, s * 1.0, s * 0.2, hi, b, '#334155', '#090d16');

  // Back bio-acid canisters
  fillShadedEllipse(ctx, -s * 0.42, -s * 0.46, s * 0.16, s * 0.28, ac, '#14532d');
  fillShadedEllipse(ctx, s * 0.42, -s * 0.46, s * 0.16, s * 0.28, ac, '#14532d');

  // Hulking torso + cyber armor belt
  fillShadedPoly(ctx, [[-s * 0.56, -s * 0.48], [s * 0.56, -s * 0.48], [s * 0.42, s * 0.38], [-s * 0.42, s * 0.38]], hi, b);
  drawArmorPauldron(ctx, -s * 0.56, -s * 0.34, s * 0.28, s * 0.22, '#334155', b, ac, -1);
  drawArmorPauldron(ctx, s * 0.56, -s * 0.34, s * 0.28, s * 0.22, '#334155', b, ac, 1);

  drawVolumetricLimb(ctx, -s * 0.56, -s * 0.15, -s * 0.82, s * 0.44 + armSwing * 0.2, s * 0.16, s * 0.14, hi, b);
  drawVolumetricLimb(ctx, s * 0.56, -s * 0.15, s * 0.82, s * 0.44 - armSwing * 0.2, s * 0.16, s * 0.14, hi, b);
  coreGlow(ctx, 0, -s * 0.06, s * 0.2 + 0.02 * Math.sin(t * 6), ac, flash);

  fillShadedEllipse(ctx, 0, -s * 0.62, s * 0.28, s * 0.24, hi, b);
  drawGlowingEye(ctx, -s * 0.1, -s * 0.62, s * 0.07, s * 0.05, ac);
  drawGlowingEye(ctx, s * 0.1, -s * 0.62, s * 0.07, s * 0.05, ac);
}

function drawToxicSpitterWasp(
  ctx: CanvasRenderingContext2D,
  s: number,
  t: number,
  dist: number,
  body: string,
  accent: string,
  flash: boolean
) {
  const b = flash ? '#ffffff' : body;
  const hi = flash ? '#ffffff' : '#334155';
  const ac = flash ? '#ffffff' : accent;
  const flap = Math.sin(t * 22 + dist * 0.05) * s * 0.35;

  // Translucent cyber wings
  drawDragonWing(ctx, -s * 0.1, -s * 0.18, s * 0.82, flap, -1, hi, ac, '#14532d');
  drawDragonWing(ctx, s * 0.1, -s * 0.18, s * 0.82, flap, 1, hi, ac, '#14532d');

  // Wasp abdomen + stinger
  fillShadedEllipse(ctx, -s * 0.28, s * 0.1, s * 0.36, s * 0.22, ac, '#14532d', '#090d16', 1.6, -0.2);
  fillShadedEllipse(ctx, s * 0.18, -s * 0.06, s * 0.3, s * 0.22, hi, b);
  coreGlow(ctx, -s * 0.28, s * 0.1, s * 0.12, ac, flash);
  drawGlowingEye(ctx, s * 0.32, -s * 0.1, s * 0.1, s * 0.07, ac);
}

function drawMutationHydraBoss(
  ctx: CanvasRenderingContext2D,
  s: number,
  stride: number,
  armSwing: number,
  t: number,
  body: string,
  accent: string,
  flash: boolean
) {
  const b = flash ? '#ffffff' : body;
  const hi = flash ? '#ffffff' : '#166534';
  const ac = flash ? '#ffffff' : accent;

  drawArticulatedLeg(ctx, -s * 0.36, s * 0.28, -s * 0.44 + stride * 0.4, s * 1.04, s * 0.22, hi, b, '#334155', '#090d16');
  drawArticulatedLeg(ctx, s * 0.36, s * 0.28, s * 0.44 - stride * 0.4, s * 1.04, s * 0.22, hi, b, '#334155', '#090d16');

  // Massive armored bio-chest
  fillShadedPoly(ctx, [[-s * 0.66, -s * 0.42], [s * 0.66, -s * 0.42], [s * 0.48, s * 0.4], [-s * 0.48, s * 0.4]], hi, b);
  coreGlow(ctx, 0, 0, s * 0.24 + 0.03 * Math.sin(t * 6), ac, flash);

  // Clawed arms
  drawVolumetricLimb(ctx, -s * 0.64, -s * 0.22, -s * 0.96, s * 0.36 + armSwing * 0.25, s * 0.16, s * 0.12, hi, b);
  drawVolumetricLimb(ctx, s * 0.64, -s * 0.22, s * 0.96, s * 0.36 - armSwing * 0.25, s * 0.16, s * 0.12, hi, b);

  // THREE distinct cyber-hydra necks & heads
  const headPositions: [number, number][] = [
    [-s * 0.42, -s * 0.88 + Math.sin(t * 5) * s * 0.05],
    [0, -s * 1.02 + Math.cos(t * 4.5) * s * 0.05],
    [s * 0.42, -s * 0.88 - Math.sin(t * 5) * s * 0.05],
  ];
  for (const [hx, hy] of headPositions) {
    drawVolumetricLimb(ctx, hx * 0.45, -s * 0.36, hx, hy, s * 0.14, s * 0.11, hi, b);
    fillShadedEllipse(ctx, hx, hy, s * 0.22, s * 0.18, '#334155', b);
    drawGlowingEye(ctx, hx - s * 0.06, hy - s * 0.02, s * 0.06, s * 0.04, ac);
    drawGlowingEye(ctx, hx + s * 0.08, hy - s * 0.02, s * 0.06, s * 0.04, ac);
  }
}

// ======================== WORLD 13: FROZEN MECHA KINGDOM ========================

function drawCryoJetRusher(
  ctx: CanvasRenderingContext2D,
  s: number,
  stride: number,
  armSwing: number,
  t: number,
  body: string,
  accent: string,
  flash: boolean
) {
  const b = flash ? '#ffffff' : body;
  const hi = flash ? '#ffffff' : '#0284c7';
  const ac = flash ? '#ffffff' : accent;

  drawArticulatedLeg(ctx, -s * 0.22, s * 0.2, -s * 0.32 + stride * 0.46, s * 0.92, s * 0.14, '#e0f2fe', b, hi, '#082f49');
  drawArticulatedLeg(ctx, s * 0.22, s * 0.2, s * 0.32 - stride * 0.46, s * 0.92, s * 0.14, '#e0f2fe', b, hi, '#082f49');

  // Cryo jet backpack
  fillShadedPoly(ctx, [[-s * 0.56, -s * 0.42], [-s * 0.14, -s * 0.46], [-s * 0.14, s * 0.1], [-s * 0.54, s * 0.06]], '#bae6fd', b);
  if (!flash) drawGlowBloom(ctx, -s * 0.62, -s * 0.12, s * 0.34, ac, 0.5 + 0.2 * Math.sin(t * 14));

  fillShadedPoly(ctx, [[-s * 0.34, -s * 0.42], [s * 0.4, -s * 0.32], [s * 0.3, s * 0.28], [-s * 0.28, s * 0.28]], '#e0f2fe', b);
  coreGlow(ctx, s * 0.06, -s * 0.08, s * 0.14, ac, flash);

  drawVolumetricLimb(ctx, s * 0.22, -s * 0.15, s * 0.62, s * 0.18 + armSwing * 0.2, s * 0.11, s * 0.08, '#bae6fd', b);
  fillShadedPoly(ctx, [[-s * 0.16, -s * 0.78], [s * 0.34, -s * 0.72], [s * 0.28, -s * 0.42], [-s * 0.2, -s * 0.44]], '#e0f2fe', b);
  drawGlowingEye(ctx, s * 0.18, -s * 0.58, s * 0.14, s * 0.07, ac);
}

function drawGlacierMechTank(
  ctx: CanvasRenderingContext2D,
  s: number,
  t: number,
  body: string,
  accent: string,
  flash: boolean
) {
  const b = flash ? '#ffffff' : body;
  const hi = flash ? '#ffffff' : '#bae6fd';
  const ac = flash ? '#ffffff' : accent;

  // Heavy glacier treads
  fillShadedPoly(ctx, [[-s * 0.88, s * 0.28], [s * 0.84, s * 0.28], [s * 0.74, s * 0.78], [-s * 0.76, s * 0.78]], '#334155', '#082f49');
  // Titanium-ice chassis
  fillShadedPoly(ctx, [[-s * 0.78, -s * 0.4], [s * 0.76, -s * 0.28], [s * 0.84, s * 0.34], [-s * 0.8, s * 0.34]], hi, b);
  // Ice ram shield + cryo cannon
  fillShadedPoly(ctx, [[s * 0.54, -s * 0.32], [s * 1.02, 0], [s * 0.86, s * 0.48], [s * 0.54, s * 0.44]], ac, '#0369a1');
  fillShadedEllipse(ctx, -s * 0.12, -s * 0.54, s * 0.44, s * 0.26, '#e0f2fe', b);
  drawVolumetricLimb(ctx, s * 0.18, -s * 0.56, s * 0.92, -s * 0.56, s * 0.11, s * 0.09, '#334155', '#082f49');
  coreGlow(ctx, -s * 0.14, -s * 0.02, s * 0.18 + 0.02 * Math.sin(t * 5), ac, flash);
}

function drawCryoArtilleryWalker(
  ctx: CanvasRenderingContext2D,
  s: number,
  stride: number,
  t: number,
  body: string,
  accent: string,
  flash: boolean
) {
  const b = flash ? '#ffffff' : body;
  const hi = flash ? '#ffffff' : '#7dd3fc';
  const ac = flash ? '#ffffff' : accent;

  drawArticulatedLeg(ctx, -s * 0.34, s * 0.24, -s * 0.44 + stride * 0.35, s * 0.96, s * 0.16, hi, b, '#334155', '#090d16');
  drawArticulatedLeg(ctx, s * 0.34, s * 0.24, s * 0.44 - stride * 0.35, s * 0.96, s * 0.16, hi, b, '#334155', '#090d16');

  // Cryo walker dome + shoulder cryo launchers
  fillShadedEllipse(ctx, 0, -s * 0.12, s * 0.56, s * 0.44, hi, b);
  fillShadedPoly(ctx, [[-s * 0.64, -s * 0.62], [-s * 0.24, -s * 0.62], [-s * 0.26, -s * 0.2], [-s * 0.62, -s * 0.2]], '#0284c7', '#082f49');
  fillShadedPoly(ctx, [[s * 0.24, -s * 0.62], [s * 0.64, -s * 0.62], [s * 0.62, -s * 0.2], [s * 0.26, -s * 0.2]], '#0284c7', '#082f49');
  coreGlow(ctx, 0, -s * 0.08, s * 0.22 + 0.02 * Math.sin(t * 8), ac, flash);
  drawGlowingEye(ctx, s * 0.22, -s * 0.3, s * 0.14, s * 0.07, ac);
}

function drawBlizzardStealthJet(
  ctx: CanvasRenderingContext2D,
  s: number,
  t: number,
  dist: number,
  body: string,
  accent: string,
  flash: boolean
) {
  const b = flash ? '#ffffff' : body;
  const hi = flash ? '#ffffff' : '#bae6fd';
  const ac = flash ? '#ffffff' : accent;
  const hover = Math.sin(t * 7 + dist * 0.04) * s * 0.07;

  // Swept delta stealth wings
  fillShadedPoly(
    ctx,
    [[s * 0.92, hover], [-s * 0.42, -s * 0.72 + hover], [-s * 0.78, -s * 0.24 + hover], [-s * 0.54, hover], [-s * 0.78, s * 0.24 + hover], [-s * 0.42, s * 0.72 + hover]],
    hi,
    b
  );
  fillShadedEllipse(ctx, s * 0.22, hover, s * 0.32, s * 0.14, ac, '#0284c7');
  if (!flash) {
    drawGlowBloom(ctx, -s * 0.68, -s * 0.16 + hover, s * 0.24, ac, 0.55);
    drawGlowBloom(ctx, -s * 0.68, s * 0.16 + hover, s * 0.24, ac, 0.55);
  }
}

function drawAbsoluteZeroBoss(
  ctx: CanvasRenderingContext2D,
  s: number,
  stride: number,
  armSwing: number,
  t: number,
  body: string,
  accent: string,
  flash: boolean
) {
  const b = flash ? '#ffffff' : body;
  const hi = flash ? '#ffffff' : '#bae6fd';
  const ac = flash ? '#ffffff' : accent;

  drawArticulatedLeg(ctx, -s * 0.36, s * 0.28, -s * 0.44 + stride * 0.38, s * 1.06, s * 0.22, hi, b, '#0284c7', '#082f49');
  drawArticulatedLeg(ctx, s * 0.36, s * 0.28, s * 0.44 - stride * 0.38, s * 1.06, s * 0.22, hi, b, '#0284c7', '#082f49');

  // Cryo crystal crown/wings on back
  fillShadedPoly(ctx, [[-s * 0.2, -s * 0.4], [-s * 0.88, -s * 0.96], [-s * 0.56, -s * 0.18]], ac, '#0369a1');
  fillShadedPoly(ctx, [[s * 0.2, -s * 0.4], [s * 0.88, -s * 0.96], [s * 0.56, -s * 0.18]], ac, '#0369a1');

  fillShadedPoly(ctx, [[-s * 0.62, -s * 0.5], [s * 0.62, -s * 0.5], [s * 0.46, s * 0.42], [-s * 0.46, s * 0.42]], hi, b);
  drawArmorPauldron(ctx, -s * 0.66, -s * 0.36, s * 0.32, s * 0.24, hi, b, ac, -1);
  drawArmorPauldron(ctx, s * 0.66, -s * 0.36, s * 0.32, s * 0.24, hi, b, ac, 1);

  drawVolumetricLimb(ctx, -s * 0.66, -s * 0.2, -s * 0.96, s * 0.4 + armSwing * 0.22, s * 0.18, s * 0.13, hi, b);
  drawVolumetricLimb(ctx, s * 0.66, -s * 0.2, s * 0.96, s * 0.4 - armSwing * 0.22, s * 0.18, s * 0.13, hi, b);
  coreGlow(ctx, 0, -s * 0.06, s * 0.25 + 0.03 * Math.sin(t * 7), ac, flash);

  // Crowned ice-mecha helm
  fillShadedPoly(ctx, [[-s * 0.3, -s * 0.88], [0, -s * 1.12], [s * 0.3, -s * 0.88], [s * 0.28, -s * 0.48], [-s * 0.28, -s * 0.48]], hi, b);
  drawGlowingEye(ctx, -s * 0.11, -s * 0.68, s * 0.09, s * 0.06, ac);
  drawGlowingEye(ctx, s * 0.11, -s * 0.68, s * 0.09, s * 0.06, ac);
}

// ======================== WORLD 14: VOID DIMENSION ========================

function drawVoidTeleporter(
  ctx: CanvasRenderingContext2D,
  s: number,
  stride: number,
  armSwing: number,
  t: number,
  body: string,
  accent: string,
  flash: boolean
) {
  const b = flash ? '#ffffff' : body;
  const hi = flash ? '#ffffff' : '#6b21a8';
  const ac = flash ? '#ffffff' : accent;

  if (!flash) drawGlowBloom(ctx, 0, 0, s * 0.95, ac, 0.25 + 0.15 * Math.sin(t * 9));

  drawArticulatedLeg(ctx, -s * 0.2, s * 0.2, -s * 0.32 + stride * 0.45, s * 0.9, s * 0.13, hi, b, ac, '#1e1b4b');
  drawArticulatedLeg(ctx, s * 0.2, s * 0.2, s * 0.32 - stride * 0.45, s * 0.9, s * 0.13, hi, b, ac, '#1e1b4b');

  fillShadedPoly(ctx, [[-s * 0.34, -s * 0.44], [s * 0.34, -s * 0.44], [s * 0.24, s * 0.28], [-s * 0.24, s * 0.28]], hi, b);
  drawVolumetricLimb(ctx, -s * 0.34, -s * 0.22, -s * 0.62, s * 0.22 + armSwing * 0.25, s * 0.1, s * 0.07, hi, b);
  drawVolumetricLimb(ctx, s * 0.34, -s * 0.22, s * 0.66, s * 0.18 - armSwing * 0.25, s * 0.1, s * 0.07, hi, b);
  coreGlow(ctx, 0, -s * 0.08, s * 0.16, ac, flash);

  // Horned void mask
  fillShadedPoly(ctx, [[-s * 0.24, -s * 0.78], [0, -s * 0.92], [s * 0.24, -s * 0.78], [s * 0.22, -s * 0.46], [-s * 0.22, -s * 0.46]], hi, b);
  drawGlowingEye(ctx, -s * 0.09, -s * 0.62, s * 0.07, s * 0.05, ac);
  drawGlowingEye(ctx, s * 0.09, -s * 0.62, s * 0.07, s * 0.05, ac);
}

function drawVoidRiftJuggernaut(
  ctx: CanvasRenderingContext2D,
  s: number,
  stride: number,
  armSwing: number,
  t: number,
  body: string,
  accent: string,
  flash: boolean
) {
  const b = flash ? '#ffffff' : body;
  const hi = flash ? '#ffffff' : '#581c87';
  const ac = flash ? '#ffffff' : accent;

  drawArticulatedLeg(ctx, -s * 0.32, s * 0.28, -s * 0.4 + stride * 0.35, s * 1.0, s * 0.2, hi, b, '#312e81', '#090d16');
  drawArticulatedLeg(ctx, s * 0.32, s * 0.28, s * 0.4 - stride * 0.35, s * 1.0, s * 0.2, hi, b, '#312e81', '#090d16');

  fillShadedPoly(ctx, [[-s * 0.6, -s * 0.48], [s * 0.6, -s * 0.48], [s * 0.44, s * 0.38], [-s * 0.44, s * 0.38]], hi, b);
  drawArmorPauldron(ctx, -s * 0.62, -s * 0.34, s * 0.3, s * 0.22, hi, b, ac, -1);
  drawArmorPauldron(ctx, s * 0.62, -s * 0.34, s * 0.3, s * 0.22, hi, b, ac, 1);

  drawVolumetricLimb(ctx, -s * 0.6, -s * 0.16, -s * 0.88, s * 0.42 + armSwing * 0.2, s * 0.16, s * 0.12, hi, b);
  drawVolumetricLimb(ctx, s * 0.6, -s * 0.16, s * 0.88, s * 0.42 - armSwing * 0.2, s * 0.16, s * 0.12, hi, b);
  coreGlow(ctx, 0, -s * 0.04, s * 0.22 + 0.02 * Math.sin(t * 6), ac, flash);

  fillShadedEllipse(ctx, 0, -s * 0.64, s * 0.28, s * 0.22, hi, b);
  drawGlowingEye(ctx, 0, -s * 0.64, s * 0.16, s * 0.07, ac);
}

function drawVoidDisruptorEye(
  ctx: CanvasRenderingContext2D,
  s: number,
  t: number,
  body: string,
  accent: string,
  flash: boolean
) {
  const b = flash ? '#ffffff' : body;
  const hi = flash ? '#ffffff' : '#7e22ce';
  const ac = flash ? '#ffffff' : accent;
  const hover = Math.sin(t * 5) * s * 0.08;

  // 4 hovering void pylons around central eye sphere
  for (let i = 0; i < 4; i++) {
    const a = t * 1.8 + (i * Math.PI) / 2;
    const px = Math.cos(a) * s * 0.68;
    const py = Math.sin(a) * s * 0.48 + hover;
    fillShadedPoly(ctx, [[px, py - s * 0.18], [px + s * 0.12, py], [px, py + s * 0.18], [px - s * 0.12, py]], ac, b);
  }

  fillShadedEllipse(ctx, 0, hover, s * 0.46, s * 0.46, hi, b);
  coreGlow(ctx, s * 0.12, hover, s * 0.22, ac, flash);
}

function drawVoidLeviathanFlyer(
  ctx: CanvasRenderingContext2D,
  s: number,
  t: number,
  dist: number,
  body: string,
  accent: string,
  flash: boolean
) {
  const b = flash ? '#ffffff' : body;
  const hi = flash ? '#ffffff' : '#6d28d9';
  const ac = flash ? '#ffffff' : accent;
  const flap = Math.sin(t * 10 + dist * 0.04) * s * 0.35;

  drawDragonWing(ctx, -s * 0.14, -s * 0.08, s * 0.95, flap, -1, hi, ac, b);
  drawDragonWing(ctx, s * 0.14, -s * 0.08, s * 0.95, flap, 1, hi, ac, b);

  fillShadedEllipse(ctx, 0, 0, s * 0.42, s * 0.28, hi, b);
  coreGlow(ctx, 0, 0, s * 0.16, ac, flash);
  fillShadedPoly(ctx, [[s * 0.24, -s * 0.22], [s * 0.68, 0], [s * 0.24, s * 0.22]], hi, b);
  drawGlowingEye(ctx, s * 0.42, -s * 0.04, s * 0.1, s * 0.06, ac);
}

function drawVoidArchonBoss(
  ctx: CanvasRenderingContext2D,
  s: number,
  t: number,
  dist: number,
  body: string,
  accent: string,
  flash: boolean
) {
  const b = flash ? '#ffffff' : body;
  const hi = flash ? '#ffffff' : '#7e22ce';
  const ac = flash ? '#ffffff' : accent;
  const flap = Math.sin(t * 7 + dist * 0.04) * s * 0.32;

  if (!flash) drawGlowBloom(ctx, 0, 0, s * 1.45, ac, 0.32);

  // Quad energy void wings
  drawDragonWing(ctx, -s * 0.24, -s * 0.26, s * 1.15, flap, -1, ac, '#a855f7', b);
  drawDragonWing(ctx, s * 0.24, -s * 0.26, s * 1.15, flap, 1, ac, '#a855f7', b);
  drawDragonWing(ctx, -s * 0.2, s * 0.04, s * 0.85, -flap * 0.7, -1, hi, '#c084fc', b);
  drawDragonWing(ctx, s * 0.2, s * 0.04, s * 0.85, -flap * 0.7, 1, hi, '#c084fc', b);

  // Floating archon armored torso
  fillShadedPoly(ctx, [[-s * 0.48, -s * 0.48], [s * 0.48, -s * 0.48], [s * 0.28, s * 0.46], [-s * 0.28, s * 0.46]], hi, b);
  drawArmorPauldron(ctx, -s * 0.54, -s * 0.34, s * 0.28, s * 0.2, hi, b, ac, -1);
  drawArmorPauldron(ctx, s * 0.54, -s * 0.34, s * 0.28, s * 0.2, hi, b, ac, 1);
  coreGlow(ctx, 0, -s * 0.06, s * 0.24 + 0.03 * Math.sin(t * 8), ac, flash);

  // Archon horned helm
  fillShadedPoly(ctx, [[-s * 0.26, -s * 0.88], [0, -s * 1.08], [s * 0.26, -s * 0.88], [s * 0.24, -s * 0.48], [-s * 0.24, -s * 0.48]], hi, b);
  drawGlowingEye(ctx, -s * 0.1, -s * 0.68, s * 0.09, s * 0.05, ac);
  drawGlowingEye(ctx, s * 0.1, -s * 0.68, s * 0.09, s * 0.05, ac);
}

// ======================== WORLD 15: OMEGA FINAL WAR ========================

function drawOmegaCyberVanguard(
  ctx: CanvasRenderingContext2D,
  s: number,
  stride: number,
  armSwing: number,
  t: number,
  body: string,
  accent: string,
  flash: boolean
) {
  const b = flash ? '#ffffff' : body;
  const hi = flash ? '#ffffff' : '#3f3f46';
  const ac = flash ? '#ffffff' : accent;

  drawArticulatedLeg(ctx, -s * 0.22, s * 0.2, -s * 0.32 + stride * 0.48, s * 0.94, s * 0.15, hi, b, ac, '#090d16');
  drawArticulatedLeg(ctx, s * 0.22, s * 0.2, s * 0.32 - stride * 0.48, s * 0.94, s * 0.15, hi, b, ac, '#090d16');

  fillShadedPoly(ctx, [[-s * 0.38, -s * 0.44], [s * 0.38, -s * 0.44], [s * 0.28, s * 0.3], [-s * 0.28, s * 0.3]], hi, b);
  drawVolumetricLimb(ctx, s * 0.24, -s * 0.16, s * 0.72, s * 0.1 + armSwing * 0.2, s * 0.12, s * 0.08, hi, b);
  fillShadedPoly(ctx, [[s * 0.66, -s * 0.02], [s * 1.04, s * 0.12], [s * 0.66, s * 0.22]], ac, '#9f1239');
  coreGlow(ctx, 0, -s * 0.08, s * 0.15 + 0.02 * Math.sin(t * 10), ac, flash);

  fillShadedPoly(ctx, [[-s * 0.22, -s * 0.78], [s * 0.26, -s * 0.74], [s * 0.24, -s * 0.44], [-s * 0.22, -s * 0.44]], hi, b);
  drawGlowingEye(ctx, s * 0.12, -s * 0.6, s * 0.14, s * 0.07, ac);
}

function drawOmegaSiegeTank(
  ctx: CanvasRenderingContext2D,
  s: number,
  t: number,
  body: string,
  accent: string,
  flash: boolean
) {
  const b = flash ? '#ffffff' : body;
  const hi = flash ? '#ffffff' : '#3f3f46';
  const ac = flash ? '#ffffff' : accent;

  fillShadedPoly(ctx, [[-s * 0.9, s * 0.26], [s * 0.88, s * 0.26], [s * 0.78, s * 0.78], [-s * 0.8, s * 0.78]], '#27272a', '#090d16');
  fillShadedPoly(ctx, [[-s * 0.82, -s * 0.42], [s * 0.8, -s * 0.3], [s * 0.86, s * 0.34], [-s * 0.82, s * 0.34]], hi, b);
  fillShadedEllipse(ctx, -s * 0.08, -s * 0.56, s * 0.48, s * 0.26, '#52525b', b);

  // Twin heavy omega rail-barrels
  drawVolumetricLimb(ctx, s * 0.2, -s * 0.62, s * 1.06, -s * 0.64, s * 0.09, s * 0.08, '#52525b', '#090d16');
  drawVolumetricLimb(ctx, s * 0.2, -s * 0.44, s * 1.02, -s * 0.46, s * 0.09, s * 0.08, '#52525b', '#090d16');
  coreGlow(ctx, -s * 0.14, -s * 0.02, s * 0.2 + 0.02 * Math.sin(t * 7), ac, flash);
  drawGlowingEye(ctx, s * 0.66, -s * 0.04, s * 0.12, s * 0.07, ac);
}

function drawOmegaRailgunStrider(
  ctx: CanvasRenderingContext2D,
  s: number,
  stride: number,
  t: number,
  body: string,
  accent: string,
  flash: boolean
) {
  const b = flash ? '#ffffff' : body;
  const hi = flash ? '#ffffff' : '#4338ca';
  const ac = flash ? '#ffffff' : accent;

  drawArticulatedLeg(ctx, -s * 0.3, s * 0.2, -s * 0.38 + stride * 0.38, s * 1.0, s * 0.16, hi, b, ac, '#090d16');
  drawArticulatedLeg(ctx, s * 0.3, s * 0.2, s * 0.38 - stride * 0.38, s * 1.0, s * 0.16, hi, b, ac, '#090d16');

  fillShadedPoly(ctx, [[-s * 0.46, -s * 0.48], [s * 0.46, -s * 0.48], [s * 0.32, s * 0.34], [-s * 0.32, s * 0.34]], hi, b);
  // Dual shoulder railguns
  fillShadedPoly(ctx, [[s * 0.12, -s * 0.7], [s * 1.12, -s * 0.62], [s * 1.12, -s * 0.46], [s * 0.12, -s * 0.5]], '#334155', '#090d16');
  coreGlow(ctx, 0, -s * 0.08, s * 0.2 + 0.02 * Math.sin(t * 9), ac, flash);
  drawGlowingEye(ctx, s * 0.24, -s * 0.26, s * 0.14, s * 0.07, ac);
}

function drawOmegaStealthInterceptor(
  ctx: CanvasRenderingContext2D,
  s: number,
  t: number,
  dist: number,
  body: string,
  accent: string,
  flash: boolean
) {
  const b = flash ? '#ffffff' : body;
  const hi = flash ? '#ffffff' : '#334155';
  const ac = flash ? '#ffffff' : accent;
  const hover = Math.sin(t * 8 + dist * 0.04) * s * 0.07;

  fillShadedPoly(
    ctx,
    [[s * 1.0, hover], [s * 0.12, -s * 0.28 + hover], [-s * 0.48, -s * 0.84 + hover], [-s * 0.82, -s * 0.22 + hover], [-s * 0.54, hover], [-s * 0.82, s * 0.22 + hover], [-s * 0.48, s * 0.84 + hover], [s * 0.12, s * 0.28 + hover]],
    hi,
    b
  );
  coreGlow(ctx, s * 0.18, hover, s * 0.16, ac, flash);
  if (!flash) {
    drawGlowBloom(ctx, -s * 0.72, hover, s * 0.32, '#f43f5e', 0.6);
  }
}

function drawOmegaSupremeOverlordBoss(
  ctx: CanvasRenderingContext2D,
  s: number,
  t: number,
  dist: number,
  body: string,
  accent: string,
  flash: boolean
) {
  const b = flash ? '#ffffff' : body;
  const hi = flash ? '#ffffff' : '#3f3f46';
  const crimson = flash ? '#ffffff' : '#be123c';
  const gold = flash ? '#ffffff' : accent;
  const flap = Math.sin(t * 6.5 + dist * 0.04) * s * 0.32;

  if (!flash) {
    drawGlowBloom(ctx, 0, -s * 0.1, s * 1.7, gold, 0.28);
    drawGlowBloom(ctx, 0, -s * 0.1, s * 1.15, '#f43f5e', 0.3);
  }

  // Grand quad mechanical dragon-overlord wings
  drawDragonWing(ctx, -s * 0.26, -s * 0.24, s * 1.28, flap, -1, gold, crimson, b);
  drawDragonWing(ctx, s * 0.26, -s * 0.24, s * 1.28, flap, 1, gold, crimson, b);
  drawDragonWing(ctx, -s * 0.2, s * 0.08, s * 0.94, -flap * 0.7, -1, hi, gold, b);
  drawDragonWing(ctx, s * 0.2, s * 0.08, s * 0.94, -flap * 0.7, 1, hi, gold, b);

  // Armored lower legs & plasma tail thrusters
  drawArticulatedLeg(ctx, -s * 0.32, s * 0.32, -s * 0.42, s * 0.98, s * 0.18, hi, b, gold, '#090d16');
  drawArticulatedLeg(ctx, s * 0.32, s * 0.32, s * 0.42, s * 0.98, s * 0.18, hi, b, gold, '#090d16');

  // Heavy gilded cyber-torso
  fillShadedPoly(ctx, [[-s * 0.58, -s * 0.5], [s * 0.58, -s * 0.5], [s * 0.42, s * 0.44], [-s * 0.42, s * 0.44]], hi, b);
  drawArmorPauldron(ctx, -s * 0.64, -s * 0.36, s * 0.32, s * 0.24, crimson, b, gold, -1);
  drawArmorPauldron(ctx, s * 0.64, -s * 0.36, s * 0.32, s * 0.24, crimson, b, gold, 1);

  // Dual Omega Plasma Cannons
  drawVolumetricLimb(ctx, -s * 0.64, -s * 0.14, -s * 1.02, s * 0.24, s * 0.16, s * 0.12, crimson, b);
  drawVolumetricLimb(ctx, s * 0.64, -s * 0.14, s * 1.02, s * 0.24, s * 0.16, s * 0.12, crimson, b);

  // Central Omega Reactor Core
  coreGlow(ctx, 0, -s * 0.04, s * 0.28 + 0.03 * Math.sin(t * 8), gold, flash);

  // Crowned Sovereign Horned Helm
  fillShadedPoly(ctx, [[-s * 0.3, -s * 0.92], [0, -s * 1.18], [s * 0.3, -s * 0.92], [s * 0.26, -s * 0.48], [-s * 0.26, -s * 0.48]], crimson, b);
  drawGlowingEye(ctx, -s * 0.11, -s * 0.68, s * 0.1, s * 0.06, gold);
  drawGlowingEye(ctx, s * 0.11, -s * 0.68, s * 0.1, s * 0.06, gold);
}
