import * as THREE from 'three';
import { WorldConfig } from './types';

function createFallbackTexture(hex: string): THREE.DataTexture {
  const c = new THREE.Color(hex);
  const data = new Uint8Array([
    Math.round(c.r * 255),
    Math.round(c.g * 255),
    Math.round(c.b * 255),
    255,
  ]);
  const tex = new THREE.DataTexture(data, 1, 1);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

export function createTrackTexture(
  world: WorldConfig,
  maxAnisotropy: number
): THREE.Texture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (!ctx) return createFallbackTexture(world.trackBaseHex);

  ctx.fillStyle = world.trackBaseHex;
  ctx.fillRect(0, 0, 512, 512);

  if (world.id === 'candy') {
    ctx.fillStyle = world.trackStripeHex;
    for (let y = 0; y < 512; y += 64) {
      ctx.fillRect(0, y, 512, 24);
    }
    // Cute pastel candy dots
    const dotCols = ['#F472B6', '#38BDF8', '#FBBF24', '#34D399'];
    for (let i = 0; i < 24; i++) {
      ctx.fillStyle = dotCols[i % dotCols.length];
      ctx.beginPath();
      ctx.arc(((i * 97) % 440) + 36, ((i * 149) % 480) + 16, 6, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (world.id === 'forest') {
    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    for (let y = 0; y < 512; y += 64) {
      ctx.fillRect(18, y + 6, 476, 48);
    }
    // Tiny clover specks along edges
    ctx.fillStyle = 'rgba(52, 211, 153, 0.4)';
    for (let y = 16; y < 512; y += 48) {
      ctx.beginPath();
      ctx.arc(28, y, 6, 0, Math.PI * 2);
      ctx.arc(484, y + 20, 6, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (world.id === 'ocean') {
    ctx.strokeStyle = 'rgba(255,255,255,0.22)';
    ctx.lineWidth = 6;
    for (let y = 32; y < 512; y += 64) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.bezierCurveTo(170, y - 16, 340, y + 16, 512, y);
      ctx.stroke();
    }
    // Soft sunlit caustic rings
    ctx.strokeStyle = 'rgba(189, 242, 255, 0.25)';
    ctx.lineWidth = 3;
    for (let i = 0; i < 10; i++) {
      ctx.beginPath();
      ctx.arc(((i * 113) % 420) + 46, ((i * 173) % 460) + 26, 18, 0, Math.PI * 2);
      ctx.stroke();
    }
  } else if (world.id === 'snow') {
    ctx.fillStyle = 'rgba(255,255,255,0.26)';
    for (let y = 0; y < 512; y += 128) {
      ctx.fillRect(0, y, 512, 42);
    }
    ctx.fillStyle = 'rgba(255,255,255,0.65)';
    for (let i = 0; i < 20; i++) {
      ctx.beginPath();
      ctx.arc(((i * 89) % 460) + 26, ((i * 131) % 480) + 16, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (world.id === 'sky') {
    ctx.fillStyle = 'rgba(253, 230, 138, 0.28)';
    for (let y = 0; y < 512; y += 64) {
      ctx.fillRect(0, y, 512, 7);
    }
    // Cute pastel rainbow edge gleam
    ctx.fillStyle = 'rgba(244, 114, 182, 0.22)';
    ctx.fillRect(16, 0, 16, 512);
    ctx.fillStyle = 'rgba(56, 189, 248, 0.22)';
    ctx.fillRect(480, 0, 16, 512);
  } else if (world.id === 'crystal') {
    ctx.strokeStyle = 'rgba(192, 132, 252, 0.35)';
    ctx.lineWidth = 3;
    for (let y = 0; y < 512; y += 64) {
      ctx.strokeRect(18, y + 6, 476, 52);
    }
    ctx.fillStyle = 'rgba(34, 211, 238, 0.25)';
    for (let y = 32; y < 512; y += 64) {
      ctx.beginPath();
      ctx.arc(256, y, 6, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Three-lane dividers at 1/3 and 2/3 widths
  ctx.fillStyle = world.trackStripeHex;
  const divider1 = Math.floor(512 / 3);
  const divider2 = Math.floor((512 * 2) / 3);
  for (let y = 16; y < 512; y += 64) {
    ctx.fillRect(divider1 - 4, y, 8, 36);
    ctx.fillRect(divider2 - 4, y, 8, 36);
  }

  // Outer edge trim rails
  ctx.fillStyle = world.accentHex;
  ctx.fillRect(0, 0, 16, 512);
  ctx.fillRect(496, 0, 16, 512);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(1, 2);
  tex.anisotropy = maxAnisotropy;
  return tex;
}

export function createGroundTexture(
  world: WorldConfig,
  maxAnisotropy: number
): THREE.Texture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (!ctx) return createFallbackTexture(world.groundHex);

  ctx.fillStyle = world.groundHex;
  ctx.fillRect(0, 0, 256, 256);

  for (let i = 0; i < 70; i++) {
    const x = (i * 73) % 256;
    const y = (i * 137) % 256;
    const r = 8 + (i % 16);
    ctx.fillStyle =
      i % 2 === 0 ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.04)';
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // Tiny flower/sparkle specks on ground
  const speckColor =
    world.id === 'forest'
      ? 'rgba(253, 224, 71, 0.45)'
      : world.id === 'candy'
        ? 'rgba(255, 255, 255, 0.5)'
        : world.id === 'crystal'
          ? 'rgba(192, 132, 252, 0.4)'
          : 'rgba(255, 255, 255, 0.35)';
  ctx.fillStyle = speckColor;
  for (let i = 0; i < 24; i++) {
    ctx.beginPath();
    ctx.arc((i * 53) % 256, (i * 97) % 256, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(4, 4);
  tex.anisotropy = maxAnisotropy;
  return tex;
}

export function createContactShadowTexture(): THREE.Texture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (!ctx) return createFallbackTexture('#0f1423');
  const grad = ctx.createRadialGradient(64, 64, 8, 64, 64, 60);
  grad.addColorStop(0, 'rgba(15, 20, 35, 0.55)');
  grad.addColorStop(0.55, 'rgba(15, 20, 35, 0.22)');
  grad.addColorStop(1, 'rgba(15, 20, 35, 0.0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 128, 128);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}
