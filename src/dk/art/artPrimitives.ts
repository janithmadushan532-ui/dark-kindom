/**
 * Shared painterly Canvas2D shading and anatomical volume primitives.
 * Eliminates stick-figure lines and flat primitive icons in favor of layered gradients,
 * articulated limbs, metallic bevels, and glowing energy highlights.
 */

export function fillShadedEllipse(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  lightColor: string,
  darkColor: string,
  strokeColor = '#090d16',
  lineWidth = 1.9,
  rotation = 0
) {
  const grad = ctx.createRadialGradient(
    cx - rx * 0.28,
    cy - ry * 0.32,
    Math.max(1, rx * 0.1),
    cx,
    cy,
    Math.max(rx, ry) * 1.05
  );
  grad.addColorStop(0, lightColor);
  grad.addColorStop(1, darkColor);

  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, rotation, 0, Math.PI * 2);
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = lineWidth;
  ctx.lineJoin = 'round';
  ctx.stroke();
}

export function fillShadedPoly(
  ctx: CanvasRenderingContext2D,
  pts: [number, number][],
  topColor: string,
  bottomColor: string,
  strokeColor = '#090d16',
  lineWidth = 1.9
) {
  if (pts.length < 3) return;
  let minY = pts[0][1];
  let maxY = pts[0][1];
  for (const [, y] of pts) {
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }
  const grad = ctx.createLinearGradient(0, minY, 0, Math.max(minY + 1, maxY));
  grad.addColorStop(0, topColor);
  grad.addColorStop(1, bottomColor);

  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) {
    ctx.lineTo(pts[i][0], pts[i][1]);
  }
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = lineWidth;
  ctx.lineJoin = 'round';
  ctx.stroke();
}

/**
 * Draws an articulated muscular/armored limb segment (thigh/shin or bicep/forearm)
 * as a solid tapered shaded volume rather than a stick-figure stroke.
 */
export function drawVolumetricLimb(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  r1: number,
  r2: number,
  topColor: string,
  botColor: string,
  strokeColor = '#090d16'
) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.max(0.001, Math.hypot(dx, dy));
  const nx = -dy / len;
  const ny = dx / len;

  const p1: [number, number] = [x1 + nx * r1, y1 + ny * r1];
  const p2: [number, number] = [x2 + nx * r2, y2 + ny * r2];
  const p3: [number, number] = [x2 - nx * r2, y2 - ny * r2];
  const p4: [number, number] = [x1 - nx * r1, y1 - ny * r1];

  fillShadedPoly(ctx, [p1, p2, p3, p4], topColor, botColor, strokeColor, 1.6);

  // Rounded joint cap
  ctx.beginPath();
  ctx.arc(x1, y1, r1 * 0.92, 0, Math.PI * 2);
  ctx.fillStyle = topColor;
  ctx.fill();
}

/**
 * Draws a two-segment articulated leg with armored boot/claw at foot.
 */
export function drawArticulatedLeg(
  ctx: CanvasRenderingContext2D,
  hipX: number,
  hipY: number,
  footX: number,
  footY: number,
  thickness: number,
  thighLight: string,
  thighDark: string,
  greaveColor: string,
  bootColor: string
) {
  const kneeX = (hipX + footX) * 0.5 + (footX >= hipX ? thickness * 0.45 : thickness * 0.25);
  const kneeY = (hipY + footY) * 0.5 - thickness * 0.15;

  drawVolumetricLimb(ctx, hipX, hipY, kneeX, kneeY, thickness, thickness * 0.8, thighLight, thighDark);
  drawVolumetricLimb(
    ctx,
    kneeX,
    kneeY,
    footX,
    footY,
    thickness * 0.8,
    thickness * 0.65,
    greaveColor,
    thighDark
  );

  // Kneepad rivet plate
  fillShadedEllipse(
    ctx,
    kneeX,
    kneeY,
    thickness * 0.72,
    thickness * 0.58,
    greaveColor,
    thighDark,
    '#090d16',
    1.3
  );

  // Boot / claw foot
  fillShadedEllipse(
    ctx,
    footX + thickness * 0.35,
    footY + thickness * 0.2,
    thickness * 1.1,
    thickness * 0.62,
    bootColor,
    '#0f172a',
    '#090d16',
    1.5
  );
}

export function drawGlowingEye(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  rx: number,
  ry: number,
  glowColor: string,
  pupilColor = '#090d16'
) {
  ctx.save();
  ctx.fillStyle = glowColor;
  ctx.globalAlpha = 0.35;
  ctx.beginPath();
  ctx.ellipse(x, y, rx * 1.8, ry * 1.8, -0.15, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.fillStyle = glowColor;
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, -0.15, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = pupilColor;
  ctx.beginPath();
  ctx.arc(x + rx * 0.25, y, Math.max(1.2, ry * 0.48), 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export function drawArmorPauldron(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  rx: number,
  ry: number,
  lightColor: string,
  darkColor: string,
  trimColor: string,
  spikeDir = 0
) {
  ctx.save();
  ctx.translate(x, y);
  fillShadedEllipse(ctx, 0, 0, rx, ry, lightColor, darkColor, '#090d16', 1.8);
  ctx.strokeStyle = trimColor;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.arc(0, 0, rx * 0.78, Math.PI * 1.05, Math.PI * 1.95);
  ctx.stroke();

  if (spikeDir !== 0) {
    fillShadedPoly(
      ctx,
      [
        [-rx * 0.25, -ry * 0.6],
        [spikeDir * rx * 0.9, -ry * 1.55],
        [rx * 0.35, -ry * 0.4],
      ],
      trimColor,
      darkColor,
      '#090d16',
      1.4
    );
  }
  ctx.restore();
}

export function drawDragonWing(
  ctx: CanvasRenderingContext2D,
  rootX: number,
  rootY: number,
  span: number,
  flapY: number,
  dir: -1 | 1,
  boneColor: string,
  membraneTop: string,
  membraneBot: string
) {
  const tipX = rootX + dir * span;
  const tipY = rootY - span * 0.62 + flapY;
  const midX = rootX + dir * span * 0.56;
  const midY = rootY - span * 0.78 + flapY * 0.6;

  // Membrane
  fillShadedPoly(
    ctx,
    [
      [rootX, rootY],
      [midX, midY],
      [tipX, tipY],
      [tipX - dir * span * 0.22, rootY + span * 0.16 + flapY * 0.4],
      [midX - dir * span * 0.1, rootY + span * 0.08 + flapY * 0.3],
      [rootX, rootY + span * 0.18],
    ],
    membraneTop,
    membraneBot,
    '#090d16',
    1.6
  );

  // Wing bone spar & finger ribs
  ctx.strokeStyle = boneColor;
  ctx.lineWidth = Math.max(2.6, span * 0.08);
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(rootX, rootY);
  ctx.lineTo(midX, midY);
  ctx.lineTo(tipX, tipY);
  ctx.stroke();

  ctx.lineWidth = Math.max(1.5, span * 0.045);
  ctx.beginPath();
  ctx.moveTo(midX, midY);
  ctx.lineTo(midX - dir * span * 0.1, rootY + span * 0.08 + flapY * 0.3);
  ctx.moveTo(midX, midY);
  ctx.lineTo(tipX - dir * span * 0.22, rootY + span * 0.16 + flapY * 0.4);
  ctx.stroke();
}

export function drawGlowBloom(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  color: string,
  alpha = 0.45
) {
  const grad = ctx.createRadialGradient(x, y, Math.max(1, radius * 0.12), x, y, radius);
  grad.addColorStop(0, color);
  grad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}
