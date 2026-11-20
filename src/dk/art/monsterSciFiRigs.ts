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
 * High-detail futuristic sci-fi character rigs for all 10 new flying
 * and 10 new ground cybernetic/alien enemies, plus cyber-core helpers.
 */
export function drawSciFiCharacterRig(
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
    // ======================== 10 NEW FLYING SCI-FI MONSTERS ========================
    case 'cyber_bat_swarm':
      drawCyberBatSwarm(ctx, s, t, dist, body, accent, flash);
      return true;
    case 'nano_wasp':
      drawNanoWasp(ctx, s, t, dist, body, accent, flash);
      return true;
    case 'void_hunter':
      drawVoidHunter(ctx, s, t, dist, body, accent, flash);
      return true;
    case 'plasma_wyvern':
      drawPlasmaWyvern(ctx, s, t, dist, body, accent, flash);
      return true;
    case 'storm_reaper':
      drawStormReaper(ctx, s, t, dist, body, accent, flash);
      return true;
    case 'shadow_drone_beast':
      drawShadowDroneBeast(ctx, s, t, dist, body, accent, flash);
      return true;
    case 'titan_air_colossus':
      drawTitanAirColossus(ctx, s, t, dist, body, accent, flash);
      return true;
    case 'omega_sky_dragon':
      drawOmegaSkyDragon(ctx, s, t, dist, body, accent, flash);
      return true;
    case 'neon_phantom':
      drawNeonPhantom(ctx, s, t, dist, body, accent, flash);
      return true;
    case 'mecha_hornet_queen':
      drawMechaHornetQueen(ctx, s, t, dist, body, accent, flash);
      return true;

    // ======================== 10 NEW GROUND SCI-FI MONSTERS ========================
    case 'cyber_assault_beast':
      drawCyberAssaultBeast(ctx, s, stride, armSwing, t, body, accent, flash);
      return true;
    case 'armored_alien_warrior':
      drawArmoredAlienWarrior(ctx, s, stride, armSwing, t, body, accent, flash);
      return true;
    case 'mechanical_brute':
      drawMechanicalBrute(ctx, s, stride, armSwing, t, body, accent, flash);
      return true;
    case 'plasma_juggernaut':
      drawPlasmaJuggernaut(ctx, s, stride, armSwing, t, body, accent, flash);
      return true;
    case 'nano_swarm_creature':
      drawNanoSwarmCreature(ctx, s, stride, t, body, accent, flash);
      return true;
    case 'cybernetic_spider':
      drawCyberneticSpider(ctx, s, stride, t, body, accent, flash);
      return true;
    case 'heavy_combat_titan':
      drawHeavyCombatTitan(ctx, s, stride, armSwing, t, body, accent, flash);
      return true;
    case 'void_stalker':
      drawVoidStalker(ctx, s, stride, armSwing, t, body, accent, flash);
      return true;
    case 'mutated_machine_beast':
      drawMutatedMachineBeast(ctx, s, stride, armSwing, t, body, accent, flash);
      return true;
    case 'omega_war_machine':
      drawOmegaWarMachine(ctx, s, stride, armSwing, t, body, accent, flash);
      return true;
    default:
      return false;
  }
}

function drawReactorCore(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  glowHex: string,
  flash: boolean
) {
  if (flash) return;
  drawGlowBloom(ctx, x, y, r * 2.1, glowHex, 0.55);
  ctx.fillStyle = '#090d16';
  ctx.beginPath();
  ctx.arc(x, y, r * 1.18, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = glowHex;
  ctx.beginPath();
  ctx.arc(x, y, r * 0.85, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(x - r * 0.2, y - r * 0.2, r * 0.35, 0, Math.PI * 2);
  ctx.fill();
}

function drawJetFlame(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  len: number,
  w: number,
  angle: number,
  color: string,
  t: number
) {
  const flicker = 0.85 + Math.sin(t * 28 + x) * 0.18;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, -w * 0.5);
  ctx.lineTo(-len * flicker, 0);
  ctx.lineTo(0, w * 0.5);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.moveTo(0, -w * 0.24);
  ctx.lineTo(-len * 0.55 * flicker, 0);
  ctx.lineTo(0, w * 0.24);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

// ============================================================================
// 1. CYBER BAT SWARM
// ============================================================================
function drawCyberBatSwarm(
  ctx: CanvasRenderingContext2D,
  s: number,
  t: number,
  dist: number,
  body: string,
  accent: string,
  flash: boolean
) {
  const drawSingleDroneBat = (ox: number, oy: number, sc: number, phase: number) => {
    const flap = Math.sin(t * 18 + dist * 0.12 + phase) * sc * 0.45;
    ctx.save();
    ctx.translate(ox, oy);
    // Razor titanium wings
    fillShadedPoly(
      ctx,
      [
        [0, 0],
        [-sc * 0.85, -sc * 0.36 + flap],
        [-sc * 0.52, sc * 0.28 + flap * 0.5],
      ],
      '#475569',
      '#0f172a',
      accent,
      1.2
    );
    fillShadedPoly(
      ctx,
      [
        [0, 0],
        [sc * 0.85, -sc * 0.36 - flap * 0.4],
        [sc * 0.52, sc * 0.28 - flap * 0.2],
      ],
      '#64748b',
      '#1e293b',
      accent,
      1.2
    );
    fillShadedEllipse(ctx, 0, 0, sc * 0.34, sc * 0.24, '#64748b', body, '#090d16', 1.4);
    if (!flash) {
      drawGlowingEye(ctx, sc * 0.14, -sc * 0.04, sc * 0.08, sc * 0.055, accent);
    }
    ctx.restore();
  };

  drawSingleDroneBat(-s * 0.48, -s * 0.28, s * 0.62, 0.4);
  drawSingleDroneBat(-s * 0.38, s * 0.3, s * 0.58, 1.9);
  drawSingleDroneBat(s * 0.14, 0, s * 0.86, 0);
}

// ============================================================================
// 2. NANO WASP
// ============================================================================
function drawNanoWasp(
  ctx: CanvasRenderingContext2D,
  s: number,
  t: number,
  dist: number,
  body: string,
  accent: string,
  flash: boolean
) {
  const buzz = Math.sin(t * 34 + dist * 0.1) * s * 0.22;
  // Translucent neon-veined insect wings
  ctx.save();
  ctx.globalAlpha = 0.72;
  fillShadedPoly(
    ctx,
    [
      [-s * 0.05, -s * 0.18],
      [-s * 0.82, -s * 0.78 + buzz],
      [-s * 0.35, -s * 0.65 + buzz * 0.5],
      [s * 0.06, -s * 0.2],
    ],
    '#e0f2fe',
    accent,
    '#090d16',
    1.2
  );
  fillShadedPoly(
    ctx,
    [
      [s * 0.04, -s * 0.16],
      [-s * 0.48, -s * 0.92 - buzz * 0.6],
      [-s * 0.06, -s * 0.72 - buzz * 0.3],
      [s * 0.18, -s * 0.18],
    ],
    '#f8fafc',
    accent,
    '#090d16',
    1.2
  );
  ctx.restore();

  // Segmented cyber-abdomen + plasma stinger
  fillShadedPoly(
    ctx,
    [
      [-s * 0.14, s * 0.02],
      [-s * 0.66, -s * 0.06],
      [-s * 0.96, s * 0.16],
      [-s * 0.58, s * 0.28],
      [-s * 0.1, s * 0.18],
    ],
    '#334155',
    body,
    '#090d16',
    1.7
  );
  if (!flash) {
    ctx.strokeStyle = accent;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-s * 0.42, -s * 0.02);
    ctx.lineTo(-s * 0.46, s * 0.22);
    ctx.moveTo(-s * 0.62, 0.02);
    ctx.lineTo(-s * 0.65, s * 0.22);
    ctx.stroke();
  }
  // Armored thorax + visor head
  fillShadedEllipse(ctx, s * 0.12, 0, s * 0.28, s * 0.22, '#64748b', '#0f172a', '#090d16', 1.7);
  fillShadedPoly(
    ctx,
    [
      [s * 0.24, -s * 0.2],
      [s * 0.62, -s * 0.08],
      [s * 0.56, s * 0.14],
      [s * 0.26, s * 0.16],
    ],
    '#94a3b8',
    body,
    '#090d16',
    1.6
  );
  drawReactorCore(ctx, s * 0.1, 0, s * 0.08, accent, flash);
  if (!flash) drawGlowingEye(ctx, s * 0.44, -s * 0.06, s * 0.09, s * 0.05, accent);
}

// ============================================================================
// 3. VOID HUNTER
// ============================================================================
function drawVoidHunter(
  ctx: CanvasRenderingContext2D,
  s: number,
  t: number,
  dist: number,
  body: string,
  accent: string,
  flash: boolean
) {
  const pulse = Math.sin(t * 10 + dist * 0.08) * s * 0.14;
  drawJetFlame(ctx, -s * 0.56, 0, s * 0.48, s * 0.18, 0, accent, t);
  // Swept alien energy delta wings
  fillShadedPoly(
    ctx,
    [
      [s * 0.36, -s * 0.1],
      [-s * 0.84, -s * 0.72 + pulse],
      [-s * 0.46, -s * 0.14],
    ],
    accent,
    '#1e1b4b',
    '#090d16',
    1.6
  );
  fillShadedPoly(
    ctx,
    [
      [s * 0.36, s * 0.1],
      [-s * 0.84, s * 0.66 - pulse * 0.5],
      [-s * 0.46, s * 0.14],
    ],
    accent,
    '#312e81',
    '#090d16',
    1.6
  );
  // Sleek obsidian stealth hull
  fillShadedPoly(
    ctx,
    [
      [-s * 0.62, 0],
      [0, -s * 0.26],
      [s * 0.74, 0],
      [0, s * 0.24],
    ],
    '#64748b',
    body,
    accent,
    1.8
  );
  drawReactorCore(ctx, -s * 0.05, 0, s * 0.11, accent, flash);
  if (!flash) drawGlowingEye(ctx, s * 0.44, -s * 0.04, s * 0.08, s * 0.04, '#f8fafc');
}

// ============================================================================
// 4. PLASMA WYVERN
// ============================================================================
function drawPlasmaWyvern(
  ctx: CanvasRenderingContext2D,
  s: number,
  t: number,
  dist: number,
  body: string,
  accent: string,
  flash: boolean
) {
  const flap = Math.sin(t * 11 + dist * 0.07) * s * 0.48;
  drawDragonWing(ctx, -s * 0.1, -s * 0.14, s * 1.24, flap, -1, '#1e293b', accent, '#0f172a');
  // Cyber-dragon plated fuselage & plasma spine
  fillShadedPoly(
    ctx,
    [
      [-s * 0.94, s * 0.18],
      [-s * 0.3, -s * 0.32],
      [s * 0.42, -s * 0.22],
      [s * 0.48, s * 0.18],
      [-s * 0.18, s * 0.3],
    ],
    '#475569',
    body,
    '#090d16',
    1.9
  );
  // Reactor pods along spine
  drawReactorCore(ctx, -s * 0.22, -s * 0.08, s * 0.09, accent, flash);
  drawReactorCore(ctx, s * 0.14, -s * 0.04, s * 0.12, accent, flash);
  // Armored cyber-wyvern head & visor jaw
  fillShadedPoly(
    ctx,
    [
      [s * 0.28, -s * 0.4],
      [s * 0.88, -s * 0.2],
      [s * 0.78, s * 0.02],
      [s * 0.34, s * 0.04],
    ],
    '#94a3b8',
    body,
    '#090d16',
    1.8
  );
  if (!flash) drawGlowingEye(ctx, s * 0.56, -s * 0.22, s * 0.075, s * 0.05, accent);
  drawDragonWing(ctx, s * 0.06, -s * 0.04, s * 1.08, -flap * 0.6, 1, '#334155', accent, '#0f172a');
}

// ============================================================================
// 5. STORM REAPER
// ============================================================================
function drawStormReaper(
  ctx: CanvasRenderingContext2D,
  s: number,
  t: number,
  _dist: number,
  body: string,
  accent: string,
  flash: boolean
) {
  // Orbiting high-voltage shock nodes
  for (let i = 0; i < 3; i++) {
    const a = t * 5.2 + (Math.PI * 2 * i) / 3;
    const nx = Math.cos(a) * s * 0.78;
    const ny = Math.sin(a) * s * 0.52;
    drawReactorCore(ctx, nx, ny, s * 0.08, accent, flash);
    if (!flash) {
      ctx.strokeStyle = accent;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(nx, ny);
      ctx.stroke();
    }
  }
  // Swept blade-vanes
  fillShadedPoly(
    ctx,
    [
      [-s * 0.2, -s * 0.15],
      [-s * 0.82, -s * 0.55],
      [-s * 0.52, 0],
      [-s * 0.82, s * 0.55],
      [-s * 0.2, s * 0.15],
    ],
    '#475569',
    '#0f172a',
    accent,
    1.7
  );
  fillShadedPoly(
    ctx,
    [
      [-s * 0.34, -s * 0.28],
      [s * 0.54, -s * 0.16],
      [s * 0.68, 0],
      [s * 0.54, s * 0.18],
      [-s * 0.34, s * 0.28],
    ],
    '#64748b',
    body,
    '#090d16',
    1.9
  );
  drawReactorCore(ctx, s * 0.14, 0, s * 0.15, accent, flash);
  if (!flash) drawGlowingEye(ctx, s * 0.44, -s * 0.04, s * 0.075, s * 0.05, '#fef08a');
}

// ============================================================================
// 6. SHADOW DRONE BEAST
// ============================================================================
function drawShadowDroneBeast(
  ctx: CanvasRenderingContext2D,
  s: number,
  t: number,
  _dist: number,
  body: string,
  accent: string,
  flash: boolean
) {
  // Twin spinning gyro-rotors above wings
  const rotorW = Math.max(0.2, Math.abs(Math.cos(t * 22))) * s * 0.52;
  for (const rx of [-s * 0.42, s * 0.26]) {
    fillShadedEllipse(ctx, rx, -s * 0.42, rotorW, s * 0.08, '#94a3b8', accent, '#090d16', 1.2);
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(rx, -s * 0.18);
    ctx.lineTo(rx, -s * 0.42);
    ctx.stroke();
  }
  // Articulated predator claw struts
  drawVolumetricLimb(ctx, -s * 0.12, s * 0.18, -s * 0.26, s * 0.56, s * 0.08, s * 0.05, '#475569', '#090d16');
  drawVolumetricLimb(ctx, s * 0.18, s * 0.18, s * 0.34, s * 0.54, s * 0.08, s * 0.05, '#475569', '#090d16');
  // Angular armored drone chassis
  fillShadedPoly(
    ctx,
    [
      [-s * 0.64, -s * 0.12],
      [-s * 0.14, -s * 0.32],
      [s * 0.58, -s * 0.18],
      [s * 0.66, s * 0.14],
      [-s * 0.36, s * 0.24],
    ],
    '#475569',
    body,
    '#090d16',
    1.9
  );
  drawReactorCore(ctx, -s * 0.08, -s * 0.04, s * 0.1, accent, flash);
  if (!flash) drawGlowingEye(ctx, s * 0.44, -s * 0.04, s * 0.085, s * 0.06, '#ef4444');
}

// ============================================================================
// 7. TITAN AIR COLOSSUS
// ============================================================================
function drawTitanAirColossus(
  ctx: CanvasRenderingContext2D,
  s: number,
  t: number,
  _dist: number,
  body: string,
  accent: string,
  flash: boolean
) {
  // Dual VTOL jet turbine nacelles with downward thrust flames
  for (const tx of [-s * 0.56, s * 0.48]) {
    drawJetFlame(ctx, tx, s * 0.22, s * 0.44, s * 0.22, -Math.PI / 2, accent, t);
    fillShadedPoly(
      ctx,
      [
        [tx - s * 0.18, -s * 0.36],
        [tx + s * 0.18, -s * 0.36],
        [tx + s * 0.22, s * 0.2],
        [tx - s * 0.22, s * 0.2],
      ],
      '#94a3b8',
      '#1e293b',
      '#090d16',
      1.8
    );
  }
  // Massive titanium dreadnought fuselage
  fillShadedPoly(
    ctx,
    [
      [-s * 0.66, -s * 0.26],
      [s * 0.66, -s * 0.26],
      [s * 0.78, s * 0.14],
      [s * 0.42, s * 0.36],
      [-s * 0.42, s * 0.36],
      [-s * 0.78, s * 0.14],
    ],
    '#cbd5e1',
    body,
    '#090d16',
    2.2
  );
  drawArmorPauldron(ctx, -s * 0.36, -s * 0.24, s * 0.24, s * 0.16, '#94a3b8', '#0f172a', accent, -1);
  drawArmorPauldron(ctx, s * 0.36, -s * 0.24, s * 0.24, s * 0.16, '#94a3b8', '#0f172a', accent, 1);
  drawReactorCore(ctx, 0, s * 0.02, s * 0.18, accent, flash);
  if (!flash) drawGlowingEye(ctx, s * 0.38, -s * 0.1, s * 0.09, s * 0.05, accent);
}

// ============================================================================
// 8. OMEGA SKY DRAGON (BOSS)
// ============================================================================
function drawOmegaSkyDragon(
  ctx: CanvasRenderingContext2D,
  s: number,
  t: number,
  dist: number,
  body: string,
  accent: string,
  flash: boolean
) {
  const flap = Math.sin(t * 9.5 + dist * 0.05) * s * 0.5;
  drawDragonWing(ctx, -s * 0.14, -s * 0.16, s * 1.56, flap, -1, '#1e293b', accent, '#0f172a');
  drawJetFlame(ctx, -s * 0.72, s * 0.06, s * 0.62, s * 0.24, 0, accent, t);
  // Segmented titanium tail
  fillShadedPoly(
    ctx,
    [
      [-s * 0.34, s * 0.08],
      [-s * 1.12, s * 0.32],
      [-s * 1.24, s * 0.14],
      [-s * 0.3, -s * 0.12],
    ],
    '#64748b',
    '#0f172a',
    accent,
    1.8
  );
  // Heavy mech-dragon hull
  fillShadedEllipse(ctx, 0, 0, s * 0.62, s * 0.42, '#94a3b8', body, accent, 2.3);
  drawReactorCore(ctx, s * 0.06, 0, s * 0.22, accent, flash);
  // Cyber-crowned dragon skull
  fillShadedPoly(
    ctx,
    [
      [s * 0.3, -s * 0.46],
      [s * 0.98, -s * 0.2],
      [s * 0.88, s * 0.04],
      [s * 0.36, s * 0.06],
    ],
    '#cbd5e1',
    '#0f172a',
    accent,
    2
  );
  fillShadedPoly(
    ctx,
    [
      [s * 0.34, -s * 0.44],
      [s * 0.1, -s * 0.96],
      [s * 0.54, -s * 0.42],
    ],
    accent,
    '#334155',
    '#090d16',
    1.5
  );
  if (!flash) drawGlowingEye(ctx, s * 0.64, -s * 0.22, s * 0.09, s * 0.055, '#fef08a');
  drawDragonWing(ctx, s * 0.08, -s * 0.08, s * 1.38, -flap * 0.6, 1, '#334155', accent, '#0f172a');
}

// ============================================================================
// 9. NEON PHANTOM
// ============================================================================
function drawNeonPhantom(
  ctx: CanvasRenderingContext2D,
  s: number,
  t: number,
  dist: number,
  body: string,
  accent: string,
  flash: boolean
) {
  const hover = Math.sin(t * 10 + dist * 0.08) * s * 0.1;
  drawJetFlame(ctx, -s * 0.55, 0, s * 0.55, s * 0.16, 0, accent, t);
  // Sleek stealth diamond airframe
  fillShadedPoly(
    ctx,
    [
      [-s * 0.72, -s * 0.44 + hover],
      [s * 0.78, 0],
      [-s * 0.72, s * 0.44 - hover],
      [-s * 0.36, 0],
    ],
    '#334155',
    body,
    accent,
    1.9
  );
  if (!flash) {
    ctx.strokeStyle = accent;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-s * 0.45, -s * 0.22);
    ctx.lineTo(s * 0.5, 0);
    ctx.lineTo(-s * 0.45, s * 0.22);
    ctx.stroke();
    drawGlowingEye(ctx, s * 0.34, 0, s * 0.09, s * 0.045, '#f8fafc');
  }
}

// ============================================================================
// 10. MECHA HORNET QUEEN (BOSS)
// ============================================================================
function drawMechaHornetQueen(
  ctx: CanvasRenderingContext2D,
  s: number,
  t: number,
  dist: number,
  body: string,
  accent: string,
  flash: boolean
) {
  const buzz = Math.sin(t * 28 + dist * 0.1) * s * 0.28;
  // Quadruple holographic buzz wings
  ctx.save();
  ctx.globalAlpha = 0.75;
  for (const wy of [-1, 1]) {
    fillShadedPoly(
      ctx,
      [
        [-s * 0.1, wy * s * 0.12],
        [-s * 1.05, wy * s * 0.92 + buzz * wy],
        [-s * 0.32, wy * s * 0.85 + buzz * 0.5],
        [s * 0.14, wy * s * 0.14],
      ],
      '#fef08a',
      accent,
      '#090d16',
      1.5
    );
  }
  ctx.restore();

  // Heavy mechanical wasp abdomen with reactor rings
  fillShadedPoly(
    ctx,
    [
      [-s * 0.15, -s * 0.14],
      [-s * 0.86, -s * 0.32],
      [-s * 1.18, s * 0.12],
      [-s * 0.82, s * 0.36],
      [-s * 0.12, s * 0.22],
    ],
    '#475569',
    body,
    '#090d16',
    2
  );
  if (!flash) {
    ctx.strokeStyle = accent;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-s * 0.45, -s * 0.18);
    ctx.lineTo(-s * 0.54, s * 0.24);
    ctx.moveTo(-s * 0.72, -s * 0.24);
    ctx.lineTo(-s * 0.82, s * 0.28);
    ctx.stroke();
  }
  // Armored queen thorax + crown visor
  fillShadedEllipse(ctx, s * 0.16, 0, s * 0.38, s * 0.32, '#94a3b8', '#0f172a', accent, 2.2);
  drawReactorCore(ctx, s * 0.16, 0, s * 0.14, accent, flash);
  fillShadedPoly(
    ctx,
    [
      [s * 0.34, -s * 0.3],
      [s * 0.86, -s * 0.14],
      [s * 0.78, s * 0.16],
      [s * 0.36, s * 0.22],
    ],
    '#cbd5e1',
    body,
    '#090d16',
    1.9
  );
  if (!flash) drawGlowingEye(ctx, s * 0.62, -s * 0.08, s * 0.1, s * 0.06, accent);
}

// ============================================================================
// GROUND MONSTERS 1–10
// ============================================================================
function drawCyberAssaultBeast(
  ctx: CanvasRenderingContext2D,
  s: number,
  stride: number,
  armSwing: number,
  _t: number,
  body: string,
  accent: string,
  flash: boolean
) {
  const legL = stride * s * 0.24;
  const legR = -stride * s * 0.24;
  drawArticulatedLeg(ctx, -s * 0.16, s * 0.24, -s * 0.22 + legL, s * 0.68, s * 0.09, '#64748b', '#0f172a', accent, '#1e293b');
  drawArticulatedLeg(ctx, s * 0.16, s * 0.24, s * 0.22 + legR, s * 0.68, s * 0.09, '#64748b', '#0f172a', accent, '#1e293b');
  fillShadedPoly(
    ctx,
    [
      [-s * 0.38, -s * 0.24],
      [s * 0.42, -s * 0.28],
      [s * 0.32, s * 0.32],
      [-s * 0.32, s * 0.32],
    ],
    '#94a3b8',
    body,
    '#090d16',
    1.9
  );
  drawReactorCore(ctx, s * 0.05, -s * 0.02, s * 0.11, accent, flash);
  fillShadedPoly(
    ctx,
    [
      [-s * 0.14, -s * 0.58],
      [s * 0.36, -s * 0.5],
      [s * 0.3, -s * 0.28],
      [-s * 0.12, -s * 0.28],
    ],
    '#cbd5e1',
    '#1e293b',
    '#090d16',
    1.7
  );
  if (!flash) drawGlowingEye(ctx, s * 0.22, -s * 0.44, s * 0.09, s * 0.04, accent);
  ctx.save();
  ctx.translate(s * 0.34, -s * 0.04);
  ctx.rotate(armSwing * 0.35);
  drawVolumetricLimb(ctx, 0, 0, s * 0.24, s * 0.12, s * 0.08, s * 0.06, accent, '#0f172a');
  ctx.restore();
}

function drawArmoredAlienWarrior(
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
  drawArticulatedLeg(ctx, -s * 0.18, s * 0.26, -s * 0.2 + legL, s * 0.7, s * 0.11, '#94a3b8', '#1e293b', accent, '#0f172a');
  drawArticulatedLeg(ctx, s * 0.18, s * 0.26, s * 0.2 + legR, s * 0.7, s * 0.11, '#94a3b8', '#1e293b', accent, '#0f172a');
  fillShadedPoly(
    ctx,
    [
      [-s * 0.44, -s * 0.32],
      [s * 0.44, -s * 0.32],
      [s * 0.34, s * 0.36],
      [-s * 0.34, s * 0.36],
    ],
    '#cbd5e1',
    body,
    '#090d16',
    2
  );
  drawArmorPauldron(ctx, -s * 0.4, -s * 0.26, s * 0.2, s * 0.16, '#94a3b8', '#0f172a', accent, -1);
  drawArmorPauldron(ctx, s * 0.4, -s * 0.26, s * 0.2, s * 0.16, '#94a3b8', '#0f172a', accent, 1);
  drawReactorCore(ctx, 0, -s * 0.04, s * 0.12, accent, flash);
  // Crest alien helm
  fillShadedPoly(
    ctx,
    [
      [-s * 0.2, -s * 0.68],
      [s * 0.06, -s * 0.84],
      [s * 0.3, -s * 0.56],
      [s * 0.22, -s * 0.34],
      [-s * 0.2, -s * 0.34],
    ],
    '#e2e8f0',
    '#1e293b',
    accent,
    1.8
  );
  if (!flash) drawGlowingEye(ctx, s * 0.14, -s * 0.52, s * 0.09, s * 0.045, accent);
  ctx.save();
  ctx.translate(s * 0.36, -s * 0.02);
  ctx.rotate(armSwing * 0.26);
  // Energy blade
  fillShadedPoly(
    ctx,
    [
      [0, -s * 0.06],
      [s * 0.56, -s * 0.14],
      [s * 0.46, s * 0.08],
      [0, s * 0.08],
    ],
    '#f8fafc',
    accent,
    '#090d16',
    1.3
  );
  ctx.restore();
}

function drawMechanicalBrute(
  ctx: CanvasRenderingContext2D,
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
  drawArticulatedLeg(ctx, -s * 0.24, s * 0.26, -s * 0.26 + legL, s * 0.72, s * 0.14, '#64748b', '#0f172a', accent, '#1e293b');
  drawArticulatedLeg(ctx, s * 0.24, s * 0.26, s * 0.26 + legR, s * 0.72, s * 0.14, '#64748b', '#0f172a', accent, '#1e293b');
  fillShadedPoly(
    ctx,
    [
      [-s * 0.58, -s * 0.38],
      [s * 0.58, -s * 0.38],
      [s * 0.44, s * 0.38],
      [-s * 0.44, s * 0.38],
    ],
    '#94a3b8',
    body,
    '#090d16',
    2.2
  );
  drawArmorPauldron(ctx, -s * 0.5, -s * 0.3, s * 0.24, s * 0.2, '#64748b', '#0f172a', accent, -1);
  drawArmorPauldron(ctx, s * 0.5, -s * 0.3, s * 0.24, s * 0.2, '#64748b', '#0f172a', accent, 1);
  drawReactorCore(ctx, 0, -s * 0.04, s * 0.15, accent, flash);
  fillShadedPoly(
    ctx,
    [
      [-s * 0.2, -s * 0.62],
      [s * 0.24, -s * 0.62],
      [s * 0.26, -s * 0.38],
      [-s * 0.22, -s * 0.38],
    ],
    '#cbd5e1',
    '#1e293b',
    '#090d16',
    1.8
  );
  if (!flash) drawGlowingEye(ctx, s * 0.1, -s * 0.5, s * 0.1, s * 0.045, accent);
  ctx.save();
  ctx.translate(s * 0.44, 0);
  ctx.rotate(armSwing * 0.22);
  drawVolumetricLimb(ctx, 0, 0, s * 0.2, s * 0.2, s * 0.14, s * 0.13, '#64748b', accent);
  ctx.restore();
}

function drawPlasmaJuggernaut(
  ctx: CanvasRenderingContext2D,
  s: number,
  stride: number,
  armSwing: number,
  _t: number,
  body: string,
  accent: string,
  flash: boolean
) {
  drawMechanicalBrute(ctx, s, stride, armSwing, _t, body, accent, flash);
  if (!flash) {
    // Twin shoulder plasma emitters
    fillShadedEllipse(ctx, -s * 0.44, -s * 0.54, s * 0.12, s * 0.1, accent, '#0f172a', '#090d16', 1.4);
    fillShadedEllipse(ctx, s * 0.44, -s * 0.54, s * 0.12, s * 0.1, accent, '#0f172a', '#090d16', 1.4);
  }
}

function drawNanoSwarmCreature(
  ctx: CanvasRenderingContext2D,
  s: number,
  stride: number,
  t: number,
  body: string,
  accent: string,
  flash: boolean
) {
  for (let i = 0; i < 3; i++) {
    const a = t * 8 + i * 2.1;
    const ox = Math.cos(a) * s * 0.24;
    const oy = Math.sin(a) * s * 0.16;
    fillShadedEllipse(ctx, ox, oy, s * 0.32, s * 0.22, '#64748b', body, accent, 1.5);
  }
  drawArticulatedLeg(ctx, -s * 0.16, s * 0.18, -s * 0.2 + stride * s * 0.2, s * 0.56, s * 0.08, '#94a3b8', '#0f172a', accent, '#090d16');
  drawArticulatedLeg(ctx, s * 0.16, s * 0.18, s * 0.2 - stride * s * 0.2, s * 0.56, s * 0.08, '#94a3b8', '#0f172a', accent, '#090d16');
  drawReactorCore(ctx, s * 0.08, -s * 0.08, s * 0.14, accent, flash);
  if (!flash) drawGlowingEye(ctx, s * 0.28, -s * 0.22, s * 0.07, s * 0.05, '#f8fafc');
}

function drawCyberneticSpider(
  ctx: CanvasRenderingContext2D,
  s: number,
  stride: number,
  t: number,
  body: string,
  accent: string,
  flash: boolean
) {
  // 4 pairs of articulated mechanical servo legs
  for (let side of [-1, 1]) {
    for (let i = 0; i < 3; i++) {
      const lx = (i - 1) * s * 0.26;
      const step = Math.sin(t * 14 + i * 1.4 + (side > 0 ? 0 : Math.PI)) * s * 0.14;
      drawArticulatedLeg(
        ctx,
        lx,
        s * 0.06,
        lx + side * s * 0.42,
        s * 0.52 + step + stride * 0.05,
        s * 0.07,
        '#94a3b8',
        '#0f172a',
        accent,
        '#1e293b'
      );
    }
  }
  fillShadedEllipse(ctx, -s * 0.24, -s * 0.06, s * 0.38, s * 0.28, '#475569', body, '#090d16', 1.8);
  fillShadedEllipse(ctx, s * 0.22, 0, s * 0.28, s * 0.22, '#94a3b8', '#0f172a', accent, 1.7);
  drawReactorCore(ctx, -s * 0.24, -s * 0.08, s * 0.11, accent, flash);
  if (!flash) {
    drawGlowingEye(ctx, s * 0.34, -s * 0.08, s * 0.06, s * 0.045, accent);
    drawGlowingEye(ctx, s * 0.38, s * 0.04, s * 0.05, s * 0.04, accent);
  }
}

function drawHeavyCombatTitan(
  ctx: CanvasRenderingContext2D,
  s: number,
  stride: number,
  armSwing: number,
  t: number,
  body: string,
  accent: string,
  flash: boolean
) {
  drawMechanicalBrute(ctx, s * 1.05, stride, armSwing, t, body, accent, flash);
  // Twin back missile/plasma pods
  fillShadedPoly(
    ctx,
    [
      [-s * 0.48, -s * 0.72],
      [-s * 0.22, -s * 0.72],
      [-s * 0.18, -s * 0.34],
      [-s * 0.5, -s * 0.34],
    ],
    '#94a3b8',
    '#1e293b',
    accent,
    1.5
  );
  if (!flash) drawReactorCore(ctx, -s * 0.34, -s * 0.54, s * 0.08, accent, flash);
}

function drawVoidStalker(
  ctx: CanvasRenderingContext2D,
  s: number,
  stride: number,
  armSwing: number,
  _t: number,
  body: string,
  accent: string,
  flash: boolean
) {
  drawCyberAssaultBeast(ctx, s, stride, armSwing, _t, body, accent, flash);
  // Twin wrist plasma scythes
  ctx.save();
  ctx.translate(s * 0.28, -s * 0.06);
  ctx.rotate(armSwing * 0.36);
  fillShadedPoly(
    ctx,
    [
      [0, 0],
      [s * 0.62, -s * 0.16],
      [s * 0.44, s * 0.08],
    ],
    '#f8fafc',
    accent,
    '#090d16',
    1.3
  );
  ctx.restore();
}

function drawMutatedMachineBeast(
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
  drawArticulatedLeg(ctx, -s * 0.2, s * 0.24, -s * 0.22 + legL, s * 0.68, s * 0.11, accent, '#1e293b', '#94a3b8', '#090d16');
  drawArticulatedLeg(ctx, s * 0.2, s * 0.24, s * 0.22 + legR, s * 0.68, s * 0.11, '#64748b', '#0f172a', accent, '#090d16');
  fillShadedEllipse(ctx, 0, 0, s * 0.44, s * 0.36, '#64748b', body, '#090d16', 2);
  drawReactorCore(ctx, s * 0.08, 0, s * 0.14, accent, flash);
  fillShadedEllipse(ctx, s * 0.12, -s * 0.44, s * 0.24, s * 0.2, '#94a3b8', body, accent, 1.8);
  if (!flash) drawGlowingEye(ctx, s * 0.24, -s * 0.46, s * 0.08, s * 0.055, accent);
  ctx.save();
  ctx.translate(s * 0.34, -s * 0.04);
  ctx.rotate(armSwing * 0.28);
  drawVolumetricLimb(ctx, 0, 0, s * 0.24, s * 0.16, s * 0.12, s * 0.09, accent, body);
  ctx.restore();
}

function drawOmegaWarMachine(
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
  drawArticulatedLeg(ctx, -s * 0.28, s * 0.32, -s * 0.3 + legL, s * 0.78, s * 0.15, '#94a3b8', '#0f172a', accent, '#1e293b');
  drawArticulatedLeg(ctx, s * 0.28, s * 0.32, s * 0.3 + legR, s * 0.78, s * 0.15, '#94a3b8', '#0f172a', accent, '#1e293b');
  // Twin back shoulder railguns
  for (const sx of [-s * 0.46, s * 0.46]) {
    fillShadedPoly(
      ctx,
      [
        [sx - s * 0.12, -s * 0.86],
        [sx + s * 0.12, -s * 0.86],
        [sx + s * 0.14, -s * 0.32],
        [sx - s * 0.14, -s * 0.32],
      ],
      '#cbd5e1',
      '#1e293b',
      accent,
      1.6
    );
  }
  fillShadedPoly(
    ctx,
    [
      [-s * 0.62, -s * 0.42],
      [s * 0.62, -s * 0.42],
      [s * 0.46, s * 0.42],
      [-s * 0.46, s * 0.42],
    ],
    '#cbd5e1',
    body,
    accent,
    2.4
  );
  drawArmorPauldron(ctx, -s * 0.56, -s * 0.34, s * 0.26, s * 0.22, '#94a3b8', '#0f172a', accent, -1);
  drawArmorPauldron(ctx, s * 0.56, -s * 0.34, s * 0.26, s * 0.22, '#94a3b8', '#0f172a', accent, 1);
  drawReactorCore(ctx, 0, -s * 0.04, s * 0.2, accent, flash);
  fillShadedPoly(
    ctx,
    [
      [-s * 0.24, -s * 0.72],
      [s * 0.24, -s * 0.72],
      [s * 0.28, -s * 0.42],
      [-s * 0.24, -s * 0.42],
    ],
    '#e2e8f0',
    '#0f172a',
    accent,
    2
  );
  if (!flash) drawGlowingEye(ctx, s * 0.12, -s * 0.58, s * 0.11, s * 0.055, '#fef08a');
  ctx.save();
  ctx.translate(s * 0.52, -s * 0.04);
  ctx.rotate(armSwing * 0.18 + Math.sin(t * 6) * 0.05);
  fillShadedPoly(
    ctx,
    [
      [0, -s * 0.12],
      [s * 0.48, -s * 0.08],
      [s * 0.48, s * 0.1],
      [0, s * 0.14],
    ],
    '#94a3b8',
    '#0f172a',
    accent,
    1.7
  );
  ctx.restore();
}
