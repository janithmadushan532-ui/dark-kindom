import * as THREE from 'three';
import { WorldId } from './types';

export type ObstacleKind = 'low' | 'high' | 'tall' | 'moving';

export interface ObstacleTemplate {
  kind: ObstacleKind;
  mesh: THREE.Group;
  width: number;
  height: number;
  depth: number;
  moveAmp?: number;
  moveSpeed?: number;
}

// Continuous smooth curved road & gentle elevation centerline
export function roadCenterX(s: number): number {
  return Math.sin(s * 0.022) * 14.5 + Math.sin(s * 0.047 + 1.1) * 5.8;
}

export function roadSlopeX(s: number): number {
  return (
    Math.cos(s * 0.022) * 14.5 * 0.022 +
    Math.cos(s * 0.047 + 1.1) * 5.8 * 0.047
  );
}

export function roadAngleAt(s: number): number {
  return Math.atan(roadSlopeX(s));
}

export function roadElevY(s: number): number {
  return Math.sin(s * 0.026) * 1.45;
}

// Compute world-space point inside a chunk at track distance `s` and lateral `laneOffset`
export function trackPointInChunk(
  sStart: number,
  s: number,
  laneOffset: number,
  yOffset = 0
): { x: number; y: number; z: number; angle: number } {
  const cx = roadCenterX(s);
  const cy = roadElevY(s) + yOffset;
  const localZ = sStart - s; // goes from 0 down to -CHUNK_LEN
  const angle = roadAngleAt(s);
  const cosA = Math.cos(angle);
  const sinA = Math.sin(angle);
  return {
    x: cx + laneOffset * cosA,
    y: cy,
    z: localZ + laneOffset * sinA,
    angle,
  };
}

// Builds curved road ribbon + curved left/right flanking ground for one chunk
export function buildCurvedRoadMeshes(
  sStart: number,
  chunkLen: number,
  steps: number,
  trackMat: THREE.Material,
  groundMat: THREE.Material
): { trackMesh: THREE.Mesh; groundMesh: THREE.Mesh } {
  const trackHalfW = 4.9;
  const groundOuterW = 44;

  const tPos: number[] = [];
  const tUv: number[] = [];
  const tIdx: number[] = [];

  const gPos: number[] = [];
  const gUv: number[] = [];
  const gIdx: number[] = [];

  for (let i = 0; i <= steps; i++) {
    const frac = i / steps;
    const s = sStart + frac * chunkLen;
    const cx = roadCenterX(s);
    const cy = roadElevY(s);
    const localZ = -frac * chunkLen;
    const a = roadAngleAt(s);
    const cosA = Math.cos(a);
    const sinA = Math.sin(a);
    const vCoord = frac * 2.0;

    // Track left & right vertices
    tPos.push(
      cx - trackHalfW * cosA, cy, localZ - trackHalfW * sinA,
      cx + trackHalfW * cosA, cy, localZ + trackHalfW * sinA
    );
    tUv.push(0, vCoord, 1, vCoord);

    // Flanking terrain ribbon (slight Y drop -0.07 to avoid Z-fighting with track)
    gPos.push(
      cx - groundOuterW * cosA, cy - 0.07, localZ - groundOuterW * sinA,
      cx + groundOuterW * cosA, cy - 0.07, localZ + groundOuterW * sinA
    );
    gUv.push(0, vCoord * 2, 4, vCoord * 2);

    if (i < steps) {
      const base = i * 2;
      tIdx.push(base, base + 1, base + 2, base + 1, base + 3, base + 2);
      gIdx.push(base, base + 1, base + 2, base + 1, base + 3, base + 2);
    }
  }

  const tGeo = new THREE.BufferGeometry();
  tGeo.setAttribute('position', new THREE.Float32BufferAttribute(tPos, 3));
  tGeo.setAttribute('uv', new THREE.Float32BufferAttribute(tUv, 2));
  tGeo.setIndex(tIdx);
  tGeo.computeVertexNormals();
  const trackMesh = new THREE.Mesh(tGeo, trackMat);
  trackMesh.receiveShadow = true;

  const gGeo = new THREE.BufferGeometry();
  gGeo.setAttribute('position', new THREE.Float32BufferAttribute(gPos, 3));
  gGeo.setAttribute('uv', new THREE.Float32BufferAttribute(gUv, 2));
  gGeo.setIndex(gIdx);
  gGeo.computeVertexNormals();
  const groundMesh = new THREE.Mesh(gGeo, groundMat);
  groundMesh.receiveShadow = true;

  return { trackMesh, groundMesh };
}

const sharedMatCache = new Map<string, THREE.MeshStandardMaterial>();

function makeMat(
  color: number,
  roughness = 0.65,
  metalness = 0.05,
  emissive = 0x000000,
  emissiveIntensity = 0
): THREE.MeshStandardMaterial {
  const key = `${color}_${roughness}_${metalness}_${emissive}_${emissiveIntensity}`;
  let mat = sharedMatCache.get(key);
  if (!mat) {
    mat = new THREE.MeshStandardMaterial({
      color,
      roughness,
      metalness,
      emissive,
      emissiveIntensity,
    });
    mat.userData.sharedMat = true;
    sharedMatCache.set(key, mat);
  }
  return mat;
}

// 24 Distinct World-Specific Obstacles (4 types x 6 worlds)
export function buildWorldObstacle(worldId: WorldId, kind: ObstacleKind): ObstacleTemplate {
  const group = new THREE.Group();

  if (kind === 'low') {
    if (worldId === 'forest') {
      // Mossy fallen timber log with tiny red mushrooms & flowers
      const wood = makeMat(0x8d5b4c, 0.85);
      const moss = makeMat(0x4ade80, 0.78);
      const log = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.44, 2.35, 12), wood);
      log.rotation.z = Math.PI / 2;
      log.position.y = 0.44;
      log.castShadow = true;
      const cap1 = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.2, 0.7, 8), wood);
      cap1.position.set(-0.95, 0.35, 0.26);
      const cap2 = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.2, 0.7, 8), wood);
      cap2.position.set(0.95, 0.35, 0.26);
      const tuft = new THREE.Mesh(new THREE.SphereGeometry(0.32, 10, 8), moss);
      tuft.position.set(0.2, 0.82, 0);
      tuft.scale.set(1.5, 0.6, 0.8);
      const mushCap = new THREE.Mesh(
        new THREE.SphereGeometry(0.2, 10, 8, 0, Math.PI * 2, 0, Math.PI / 2),
        makeMat(0xfb7185, 0.45)
      );
      mushCap.position.set(-0.45, 0.88, 0.05);
      group.add(log, cap1, cap2, tuft, mushCap);
    } else if (worldId === 'candy') {
      // Frosted chocolate block with colorful sprinkles & wafer sticks
      const choco = makeMat(0x5c3a21, 0.45, 0.08);
      const cream = makeMat(0xfff1f7, 0.35);
      const bar = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.75, 0.72), choco);
      bar.position.y = 0.4;
      bar.castShadow = true;
      const icing = new THREE.Mesh(new THREE.BoxGeometry(2.38, 0.22, 0.78), cream);
      icing.position.y = 0.82;
      const sp1 = new THREE.Mesh(new THREE.CapsuleGeometry(0.06, 0.22, 4, 6), makeMat(0xf472b6, 0.3));
      sp1.rotation.z = Math.PI / 2;
      sp1.position.set(-0.5, 0.96, 0);
      const sp2 = new THREE.Mesh(new THREE.CapsuleGeometry(0.06, 0.22, 4, 6), makeMat(0x38bdf8, 0.3));
      sp2.rotation.z = Math.PI / 2;
      sp2.position.set(0.45, 0.96, 0.1);
      group.add(bar, icing, sp1, sp2);
    } else if (worldId === 'ocean') {
      // Coral & glowing sea-anemone reef barrier
      const coral = makeMat(0xfb7185, 0.62);
      const rock = makeMat(0x475569, 0.85);
      const base = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.42, 0.82), rock);
      base.position.y = 0.21;
      for (let i = -2; i <= 2; i++) {
        const branch = new THREE.Mesh(new THREE.CapsuleGeometry(0.14, 0.52, 6, 8), coral);
        branch.position.set(i * 0.45, 0.64, 0);
        branch.rotation.z = (i % 2 === 0 ? 1 : -1) * 0.18;
        branch.castShadow = true;
        group.add(branch);
      }
      group.add(base);
    } else if (worldId === 'snow') {
      // Frosted ice-block & snowdrift hurdle
      const ice = makeMat(0x7dd3fc, 0.18, 0.15);
      const snow = makeMat(0xf8fafc, 0.85);
      const block = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.72, 0.72), ice);
      block.position.y = 0.36;
      block.castShadow = true;
      const cap = new THREE.Mesh(new THREE.BoxGeometry(2.36, 0.22, 0.78), snow);
      cap.position.y = 0.78;
      const spike = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.42, 6), ice);
      spike.position.set(-0.6, 1.0, 0);
      const spike2 = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.42, 6), ice);
      spike2.position.set(0.6, 1.0, 0);
      group.add(block, cap, spike, spike2);
    } else if (worldId === 'sky') {
      // Fluffy cloud & golden star-rail hurdle
      const gold = makeMat(0xfbbf24, 0.28, 0.65);
      const cloud = makeMat(0xffffff, 0.88);
      const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 2.35, 10), gold);
      bar.rotation.z = Math.PI / 2;
      bar.position.y = 0.76;
      const p1 = new THREE.Mesh(new THREE.SphereGeometry(0.42, 12, 10), cloud);
      p1.position.set(-0.95, 0.42, 0);
      const p2 = new THREE.Mesh(new THREE.SphereGeometry(0.42, 12, 10), cloud);
      p2.position.set(0.95, 0.42, 0);
      const p3 = new THREE.Mesh(new THREE.SphereGeometry(0.36, 12, 10), cloud);
      p3.position.set(0, 0.36, 0);
      group.add(bar, p1, p2, p3);
    } else {
      // Magic Crystal barrier
      const crystal = makeMat(0xc084fc, 0.18, 0.25, 0x9333ea, 0.55);
      const base = makeMat(0x312e81, 0.75);
      const plinth = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.35, 0.7), base);
      plinth.position.y = 0.175;
      group.add(plinth);
      for (let i = -2; i <= 2; i++) {
        const shard = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.75, 5), crystal);
        shard.position.set(i * 0.45, 0.62, 0);
        shard.castShadow = true;
        group.add(shard);
      }
    }
    return { kind, mesh: group, width: 2.2, height: 0.98, depth: 0.8 };
  }

  if (kind === 'high') {
    // World-unique Slide-Under Overhead Arches (clearance at y = 1.18)
    if (worldId === 'forest') {
      const timber = makeMat(0x7c4a3a, 0.85);
      const leaves = makeMat(0x34d399, 0.72);
      const lPost = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.24, 2.7, 10), timber);
      lPost.position.set(-1.18, 1.35, 0);
      const rPost = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.24, 2.7, 10), timber);
      rPost.position.set(1.18, 1.35, 0);
      const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.36, 2.7, 10), timber);
      beam.rotation.z = Math.PI / 2;
      beam.position.set(0, 1.72, 0);
      const vine = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.35, 0.78), leaves);
      vine.position.set(0, 2.1, 0);
      group.add(lPost, rPost, beam, vine);
    } else if (worldId === 'candy') {
      // Candy cane overhead gate
      const pink = makeMat(0xf472b6, 0.3);
      const white = makeMat(0xfff1f2, 0.3);
      const lPost = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 2.6, 12), pink);
      lPost.position.set(-1.16, 1.3, 0);
      const rPost = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 2.6, 12), pink);
      rPost.position.set(1.16, 1.3, 0);
      const wafer = new THREE.Mesh(new THREE.BoxGeometry(2.7, 0.85, 0.75), white);
      wafer.position.set(0, 1.75, 0);
      const mint = new THREE.Mesh(new THREE.TorusGeometry(0.38, 0.12, 8, 18), makeMat(0x34d399, 0.3));
      mint.position.set(0, 1.78, 0.4);
      group.add(lPost, rPost, wafer, mint);
    } else if (worldId === 'ocean') {
      // Sunken stone & glowing coral archway
      const stone = makeMat(0x475569, 0.85);
      const glow = makeMat(0x22d3ee, 0.3, 0.1, 0x06b6d4, 0.55);
      const lPost = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.28, 2.6, 8), stone);
      lPost.position.set(-1.18, 1.3, 0);
      const rPost = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.28, 2.6, 8), stone);
      rPost.position.set(1.18, 1.3, 0);
      const lintel = new THREE.Mesh(new THREE.BoxGeometry(2.75, 0.82, 0.8), stone);
      lintel.position.set(0, 1.78, 0);
      const pearlTrim = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.18, 0.86), glow);
      pearlTrim.position.set(0, 1.35, 0);
      group.add(lPost, rPost, lintel, pearlTrim);
    } else if (worldId === 'snow') {
      // Frozen bridge arch with hanging icicles
      const ice = makeMat(0x7dd3fc, 0.2, 0.2);
      const snow = makeMat(0xf8fafc, 0.85);
      const lPost = new THREE.Mesh(new THREE.BoxGeometry(0.36, 2.6, 0.5), ice);
      lPost.position.set(-1.18, 1.3, 0);
      const rPost = new THREE.Mesh(new THREE.BoxGeometry(0.36, 2.6, 0.5), ice);
      rPost.position.set(1.18, 1.3, 0);
      const top = new THREE.Mesh(new THREE.BoxGeometry(2.75, 0.88, 0.78), snow);
      top.position.set(0, 1.82, 0);
      for (let i = -2; i <= 2; i++) {
        const icicle = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.35, 6), ice);
        icicle.rotation.x = Math.PI;
        icicle.position.set(i * 0.45, 1.25, 0.25);
        group.add(icicle);
      }
      group.add(lPost, rPost, top);
    } else if (worldId === 'sky') {
      // Rainbow gate between cloud pillars
      const cloud = makeMat(0xffffff, 0.9);
      const lPost = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.26, 2.5, 10), cloud);
      lPost.position.set(-1.18, 1.25, 0);
      const rPost = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.26, 2.5, 10), cloud);
      rPost.position.set(1.18, 1.25, 0);
      const b1 = new THREE.Mesh(new THREE.BoxGeometry(2.7, 0.3, 0.72), makeMat(0xfb7185, 0.4));
      b1.position.set(0, 1.5, 0);
      const b2 = new THREE.Mesh(new THREE.BoxGeometry(2.7, 0.3, 0.72), makeMat(0xfbbf24, 0.4));
      b2.position.set(0, 1.8, 0);
      const b3 = new THREE.Mesh(new THREE.BoxGeometry(2.7, 0.3, 0.72), makeMat(0x38bdf8, 0.4));
      b3.position.set(0, 2.1, 0);
      group.add(lPost, rPost, b1, b2, b3);
    } else {
      // Magic Crystal rune portal arch
      const dark = makeMat(0x312e81, 0.65);
      const neon = makeMat(0xc084fc, 0.2, 0.2, 0x9333ea, 0.75);
      const lPost = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.24, 2.7, 6), dark);
      lPost.position.set(-1.18, 1.35, 0);
      const rPost = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.24, 2.7, 6), dark);
      rPost.position.set(1.18, 1.35, 0);
      const beam = new THREE.Mesh(new THREE.BoxGeometry(2.65, 0.85, 0.75), dark);
      beam.position.set(0, 1.82, 0);
      const rune = new THREE.Mesh(new THREE.BoxGeometry(2.7, 0.18, 0.82), neon);
      rune.position.set(0, 1.38, 0);
      group.add(lPost, rPost, beam, rune);
    }
    return { kind, mesh: group, width: 2.35, height: 2.6, depth: 0.85 };
  }

  if (kind === 'tall') {
    if (worldId === 'forest') {
      const boxMat = makeMat(0xa16207, 0.8);
      const leafMat = makeMat(0x22c55e, 0.75);
      const crate1 = new THREE.Mesh(new THREE.BoxGeometry(1.9, 1.4, 1.8), boxMat);
      crate1.position.y = 0.7;
      crate1.castShadow = true;
      const crate2 = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.2, 1.4), boxMat);
      crate2.position.y = 2.0;
      crate2.rotation.y = 0.25;
      const cap = new THREE.Mesh(new THREE.SphereGeometry(0.85, 12, 10), leafMat);
      cap.position.y = 2.85;
      group.add(crate1, crate2, cap);
    } else if (worldId === 'candy') {
      // Giant swirl lollipop + candy wall block
      const cone = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 1.05, 1.8, 14), makeMat(0xfb7185, 0.45));
      cone.position.y = 0.9;
      cone.castShadow = true;
      const roof = new THREE.Mesh(new THREE.ConeGeometry(1.2, 1.25, 14), makeMat(0xfff1f2, 0.35));
      roof.position.y = 2.4;
      const cherry = new THREE.Mesh(new THREE.SphereGeometry(0.32, 12, 10), makeMat(0xe11d48, 0.2));
      cherry.position.y = 3.1;
      group.add(cone, roof, cherry);
    } else if (worldId === 'ocean') {
      const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(1.05, 0), makeMat(0x334155, 0.85));
      rock.position.y = 0.95;
      rock.scale.set(1, 1.35, 1);
      rock.castShadow = true;
      const shell = new THREE.Mesh(new THREE.SphereGeometry(0.65, 12, 10), makeMat(0xf472b6, 0.4));
      shell.position.set(0, 2.25, 0);
      const pearl = new THREE.Mesh(
        new THREE.SphereGeometry(0.28, 12, 10),
        makeMat(0xfef9c3, 0.15, 0.25, 0xfef08a, 0.4)
      );
      pearl.position.set(0, 2.6, 0.35);
      group.add(rock, shell, pearl);
    } else if (worldId === 'snow') {
      const snowMat = makeMat(0xf8fafc, 0.8);
      const b1 = new THREE.Mesh(new THREE.SphereGeometry(0.95, 14, 12), snowMat);
      b1.position.y = 0.85;
      b1.castShadow = true;
      const b2 = new THREE.Mesh(new THREE.SphereGeometry(0.68, 14, 12), snowMat);
      b2.position.y = 2.05;
      const hat = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.55, 0.65, 12), makeMat(0x1e293b, 0.5));
      hat.position.y = 2.88;
      const nose = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.42, 8), makeMat(0xf97316, 0.5));
      nose.rotation.x = Math.PI / 2;
      nose.position.set(0, 2.08, 0.72);
      group.add(b1, b2, hat, nose);
    } else if (worldId === 'sky') {
      const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.95, 2.2, 12), makeMat(0xfef3c7, 0.55));
      pillar.position.y = 1.1;
      pillar.castShadow = true;
      const star = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.65, 0),
        makeMat(0xfbbf24, 0.25, 0.7, 0xf59e0b, 0.35)
      );
      star.position.y = 2.65;
      group.add(pillar, star);
    } else {
      const spireMat = makeMat(0xa855f7, 0.18, 0.25, 0x7e22ce, 0.6);
      const mainSpire = new THREE.Mesh(new THREE.ConeGeometry(0.88, 2.9, 6), spireMat);
      mainSpire.position.y = 1.45;
      mainSpire.castShadow = true;
      const side1 = new THREE.Mesh(new THREE.ConeGeometry(0.45, 1.5, 5), makeMat(0x22d3ee, 0.2, 0.2, 0x06b6d4, 0.5));
      side1.position.set(-0.65, 0.75, 0.2);
      side1.rotation.z = 0.25;
      const side2 = new THREE.Mesh(new THREE.ConeGeometry(0.45, 1.5, 5), makeMat(0x22d3ee, 0.2, 0.2, 0x06b6d4, 0.5));
      side2.position.set(0.65, 0.75, -0.2);
      side2.rotation.z = -0.25;
      group.add(mainSpire, side1, side2);
    }
    return { kind, mesh: group, width: 1.9, height: 3.1, depth: 1.7 };
  }

  // 'moving' animated obstacle — unique silhouette per world!
  if (worldId === 'forest') {
    // Rolling banded forest log wheel
    const log = new THREE.Mesh(new THREE.CylinderGeometry(0.72, 0.72, 1.4, 14), makeMat(0x7c4a3a, 0.8));
    log.rotation.x = Math.PI / 2;
    log.position.y = 0.75;
    const moss = new THREE.Mesh(new THREE.TorusGeometry(0.74, 0.14, 8, 16), makeMat(0x4ade80, 0.7));
    moss.position.y = 0.75;
    group.add(log, moss);
  } else if (worldId === 'candy') {
    // Rolling pastel jawbreaker with candy belt
    const ball = new THREE.Mesh(new THREE.SphereGeometry(0.86, 16, 14), makeMat(0xf472b6, 0.25));
    ball.position.y = 0.88;
    const belt = new THREE.Mesh(new THREE.TorusGeometry(0.9, 0.12, 8, 22), makeMat(0xfef08a, 0.25));
    belt.position.y = 0.88;
    belt.rotation.x = Math.PI / 2;
    group.add(ball, belt);
  } else if (worldId === 'ocean') {
    // Cute cartoon pufferfish / submarine drone
    const sub = new THREE.Mesh(new THREE.SphereGeometry(0.82, 16, 14), makeMat(0xfbbf24, 0.35));
    sub.position.y = 0.92;
    const finL = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.12, 0.4), makeMat(0xf97316, 0.4));
    finL.position.set(-0.9, 0.92, 0);
    const finR = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.12, 0.4), makeMat(0xf97316, 0.4));
    finR.position.set(0.9, 0.92, 0);
    const e1 = new THREE.Mesh(new THREE.SphereGeometry(0.14, 8, 8), makeMat(0x1e293b, 0.1));
    e1.position.set(-0.32, 1.12, 0.72);
    const e2 = new THREE.Mesh(new THREE.SphereGeometry(0.14, 8, 8), makeMat(0x1e293b, 0.1));
    e2.position.set(0.32, 1.12, 0.72);
    group.add(sub, finL, finR, e1, e2);
  } else if (worldId === 'snow') {
    // Giant rolling snowball with icy sparkles
    const snow = new THREE.Mesh(new THREE.SphereGeometry(0.92, 16, 14), makeMat(0xf8fafc, 0.85));
    snow.position.y = 0.92;
    const iceBand = new THREE.Mesh(new THREE.TorusGeometry(0.94, 0.1, 8, 20), makeMat(0x7dd3fc, 0.2));
    iceBand.position.y = 0.92;
    group.add(snow, iceBand);
  } else if (worldId === 'sky') {
    // Floating golden sun-orb with wing fins
    const orb = new THREE.Mesh(new THREE.SphereGeometry(0.75, 16, 14), makeMat(0xfbbf24, 0.25, 0.5, 0xf59e0b, 0.35));
    orb.position.y = 1.05;
    const w1 = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.12, 0.36), makeMat(0xffffff, 0.8));
    w1.position.set(-0.92, 1.15, 0);
    w1.rotation.z = 0.28;
    const w2 = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.12, 0.36), makeMat(0xffffff, 0.8));
    w2.position.set(0.92, 1.15, 0);
    w2.rotation.z = -0.28;
    group.add(orb, w1, w2);
  } else {
    // Spinning arcane crystal golem core
    const core = new THREE.Mesh(new THREE.OctahedronGeometry(0.86, 0), makeMat(0xc026d3, 0.2, 0.3, 0xa21caf, 0.7));
    core.position.y = 1.02;
    const ring = new THREE.Mesh(new THREE.TorusGeometry(1.02, 0.1, 8, 22), makeMat(0x22d3ee, 0.2, 0.3, 0x06b6d4, 0.6));
    ring.position.y = 1.02;
    ring.rotation.x = Math.PI / 2;
    group.add(core, ring);
  }

  return {
    kind: 'moving',
    mesh: group,
    width: 1.75,
    height: 1.85,
    depth: 1.65,
    moveAmp: 3.1,
    moveSpeed: 2.1,
  };
}

// Extremely Cute World Decor Props & Adorable Animated Animals
export function buildWorldDecorProp(worldId: WorldId, variant: number): THREE.Group {
  const g = new THREE.Group();
  const type = variant % 6;

  if (worldId === 'forest') {
    if (type === 0) {
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.42, 1.9, 8), makeMat(0x7c4a3a, 0.9));
      trunk.position.y = 0.95;
      trunk.castShadow = true;
      const c1 = new THREE.Mesh(new THREE.ConeGeometry(1.55, 2.2, 10), makeMat(0x34d399, 0.72));
      c1.position.y = 2.4;
      const c2 = new THREE.Mesh(new THREE.ConeGeometry(1.15, 1.8, 10), makeMat(0x6ee7b7, 0.72));
      c2.position.y = 3.55;
      g.add(trunk, c1, c2);
    } else if (type === 1) {
      const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.3, 1.1, 10), makeMat(0xfef3c7, 0.78));
      stem.position.y = 0.55;
      const cap = new THREE.Mesh(new THREE.SphereGeometry(0.85, 14, 10, 0, Math.PI * 2, 0, Math.PI / 2), makeMat(0xfb7185, 0.45));
      cap.position.y = 1.05;
      const spot1 = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 8), makeMat(0xffffff, 0.6));
      spot1.position.set(-0.35, 1.48, 0.32);
      const spot2 = new THREE.Mesh(new THREE.SphereGeometry(0.14, 8, 8), makeMat(0xffffff, 0.6));
      spot2.position.set(0.38, 1.42, -0.2);
      g.add(stem, cap, spot1, spot2);
    } else if (type === 2) {
      const walls = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.8, 2.2), makeMat(0xfef3c7, 0.8));
      walls.position.y = 0.9;
      const roof = new THREE.Mesh(new THREE.ConeGeometry(1.95, 1.5, 4), makeMat(0xf97316, 0.65));
      roof.position.y = 2.55;
      roof.rotation.y = Math.PI / 4;
      const door = new THREE.Mesh(new THREE.BoxGeometry(0.65, 1.0, 0.12), makeMat(0x7c2d12, 0.7));
      door.position.set(0, 0.5, 1.1);
      g.add(walls, roof, door);
    } else if (type === 3) {
      // Hopping cute bunny animal!
      const bBody = new THREE.Mesh(new THREE.SphereGeometry(0.42, 10, 10), makeMat(0xfff1f2, 0.75));
      bBody.position.set(0, 0.42, 0);
      const bHead = new THREE.Mesh(new THREE.SphereGeometry(0.3, 10, 10), makeMat(0xfff1f2, 0.75));
      bHead.position.set(0, 0.82, -0.1);
      const e1 = new THREE.Mesh(new THREE.CapsuleGeometry(0.065, 0.28, 4, 6), makeMat(0xfda4af, 0.7));
      e1.position.set(-0.11, 1.15, -0.1);
      const e2 = new THREE.Mesh(new THREE.CapsuleGeometry(0.065, 0.28, 4, 6), makeMat(0xfda4af, 0.7));
      e2.position.set(0.11, 1.15, -0.1);
      g.add(bBody, bHead, e1, e2);
      g.userData.animType = 'hop';
    } else if (type === 4) {
      // Tiny colorful flower garden cluster
      const leaf = makeMat(0x22c55e, 0.8);
      const cols = [0xfbbf24, 0xf472b6, 0x38bdf8];
      for (let i = 0; i < 3; i++) {
        const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 0.55, 6), leaf);
        stem.position.set((i - 1) * 0.45, 0.27, (i % 2) * 0.3);
        const bloom = new THREE.Mesh(new THREE.SphereGeometry(0.22, 8, 8), makeMat(cols[i], 0.45));
        bloom.position.set((i - 1) * 0.45, 0.6, (i % 2) * 0.3);
        g.add(stem, bloom);
      }
    } else {
      const post1 = new THREE.Mesh(new THREE.BoxGeometry(0.22, 1.1, 0.22), makeMat(0x92400e, 0.85));
      post1.position.set(-0.7, 0.55, 0);
      const post2 = new THREE.Mesh(new THREE.BoxGeometry(0.22, 1.1, 0.22), makeMat(0x92400e, 0.85));
      post2.position.set(0.7, 0.55, 0);
      const rail = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.16, 0.12), makeMat(0xb45309, 0.85));
      rail.position.y = 0.75;
      const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(0.45, 0), makeMat(0x94a3b8, 0.88));
      rock.position.set(0.1, 0.35, 0.45);
      g.add(post1, post2, rail, rock);
    }
  } else if (worldId === 'candy') {
    if (type === 0) {
      const stick = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 2.8, 10), makeMat(0xffffff, 0.3));
      stick.position.y = 1.4;
      const candy = new THREE.Mesh(new THREE.CylinderGeometry(1.05, 1.05, 0.34, 20), makeMat(0xf472b6, 0.25));
      candy.rotation.x = Math.PI / 2;
      candy.position.y = 3.2;
      const swirl = new THREE.Mesh(new THREE.TorusGeometry(0.62, 0.12, 8, 18), makeMat(0xfef08a, 0.25));
      swirl.position.set(0, 3.2, 0.16);
      g.add(stick, candy, swirl);
    } else if (type === 1) {
      const wall = new THREE.Mesh(new THREE.BoxGeometry(2.3, 1.7, 2.1), makeMat(0xfde68a, 0.55));
      wall.position.y = 0.85;
      const roof = new THREE.Mesh(new THREE.ConeGeometry(1.9, 1.4, 4), makeMat(0xfb7185, 0.35));
      roof.position.y = 2.4;
      roof.rotation.y = Math.PI / 4;
      const donut = new THREE.Mesh(new THREE.TorusGeometry(0.4, 0.16, 10, 16), makeMat(0x38bdf8, 0.3));
      donut.position.set(0, 1.1, 1.08);
      g.add(wall, roof, donut);
    } else if (type === 2) {
      // Hopping cute gummy bear!
      const gm = makeMat(0x34d399, 0.2, 0.05);
      const body = new THREE.Mesh(new THREE.SphereGeometry(0.62, 12, 10), gm);
      body.position.y = 0.62;
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.44, 12, 10), gm);
      head.position.y = 1.4;
      const e1 = new THREE.Mesh(new THREE.SphereGeometry(0.15, 8, 8), gm);
      e1.position.set(-0.32, 1.78, 0);
      const e2 = new THREE.Mesh(new THREE.SphereGeometry(0.15, 8, 8), gm);
      e2.position.set(0.32, 1.78, 0);
      g.add(body, head, e1, e2);
      g.userData.animType = 'hop';
    } else if (type === 3) {
      const cone = new THREE.Mesh(new THREE.ConeGeometry(0.7, 1.8, 12), makeMat(0xfbbf24, 0.65));
      cone.rotation.x = Math.PI;
      cone.position.y = 0.9;
      const scoop = new THREE.Mesh(new THREE.SphereGeometry(0.85, 14, 12), makeMat(0xf9a8d4, 0.45));
      scoop.position.y = 2.1;
      const scoop2 = new THREE.Mesh(new THREE.SphereGeometry(0.62, 14, 12), makeMat(0xa7f3d0, 0.45));
      scoop2.position.y = 2.95;
      g.add(cone, scoop, scoop2);
    } else if (type === 4) {
      // Giant cupcake
      const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.55, 0.9, 12), makeMat(0x38bdf8, 0.5));
      cup.position.y = 0.45;
      const frost = new THREE.Mesh(new THREE.SphereGeometry(0.82, 12, 10), makeMat(0xfff1f2, 0.35));
      frost.position.y = 1.05;
      const berry = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 8), makeMat(0xf43f5e, 0.2));
      berry.position.y = 1.85;
      g.add(cup, frost, berry);
    } else {
      const m1 = new THREE.Mesh(new THREE.SphereGeometry(0.75, 12, 10), makeMat(0xc084fc, 0.4));
      m1.position.y = 0.65;
      const m2 = new THREE.Mesh(new THREE.SphereGeometry(0.55, 12, 10), makeMat(0xf472b6, 0.4));
      m2.position.set(0.65, 0.5, 0.2);
      g.add(m1, m2);
    }
  } else if (worldId === 'ocean') {
    if (type === 0) {
      const cMat = makeMat(0xf472b6, 0.5);
      const c2Mat = makeMat(0x22d3ee, 0.5, 0, 0x06b6d4, 0.25);
      const t1 = new THREE.Mesh(new THREE.CapsuleGeometry(0.28, 2.2, 6, 10), cMat);
      t1.position.y = 1.2;
      const t2 = new THREE.Mesh(new THREE.CapsuleGeometry(0.22, 1.6, 6, 10), c2Mat);
      t2.position.set(0.55, 0.95, 0.2);
      t2.rotation.z = -0.3;
      const t3 = new THREE.Mesh(new THREE.CapsuleGeometry(0.2, 1.4, 6, 10), cMat);
      t3.position.set(-0.5, 0.85, -0.2);
      t3.rotation.z = 0.25;
      g.add(t1, t2, t3);
    } else if (type === 1) {
      const shellMat = makeMat(0xfda4af, 0.45);
      const bottom = new THREE.Mesh(new THREE.SphereGeometry(0.95, 12, 10, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), shellMat);
      bottom.position.y = 0.85;
      const top = new THREE.Mesh(new THREE.SphereGeometry(0.95, 12, 10, 0, Math.PI * 2, 0, Math.PI / 2), shellMat);
      top.position.set(0, 0.95, -0.3);
      top.rotation.x = -0.65;
      const pearl = new THREE.Mesh(new THREE.SphereGeometry(0.32, 14, 12), makeMat(0xfef9c3, 0.1, 0.3, 0xfef08a, 0.6));
      pearl.position.set(0, 0.9, 0.15);
      g.add(bottom, top, pearl);
    } else if (type === 2) {
      // Cute swimming cartoon fish school
      const fishMat = makeMat(0xfbbf24, 0.35);
      for (let i = 0; i < 2; i++) {
        const fBody = new THREE.Mesh(new THREE.SphereGeometry(0.42, 12, 10), fishMat);
        fBody.scale.set(1.3, 0.9, 0.7);
        fBody.position.set(i * 0.7 - 0.35, 1.8 + i * 0.65, 0);
        const fTail = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.45, 6), makeMat(0xf97316, 0.4));
        fTail.rotation.z = Math.PI / 2;
        fTail.position.set(i * 0.7 - 0.95, 1.8 + i * 0.65, 0);
        g.add(fBody, fTail);
      }
      g.userData.animType = 'swim';
    } else if (type === 3) {
      const kMat = makeMat(0x34d399, 0.65);
      for (let i = -1; i <= 1; i++) {
        const stalk = new THREE.Mesh(new THREE.CapsuleGeometry(0.14, 2.4 + Math.abs(i) * 0.4, 6, 8), kMat);
        stalk.position.set(i * 0.45, 1.25, i * 0.2);
        stalk.rotation.z = i * 0.12;
        g.add(stalk);
      }
    } else if (type === 4) {
      // Floating translucent ocean bubbles
      const bubbleKey = 'ocean_bubble_mat';
      let bMat = sharedMatCache.get(bubbleKey);
      if (!bMat) {
        bMat = new THREE.MeshStandardMaterial({
          color: 0xbdf2ff,
          emissive: 0x38bdf8,
          emissiveIntensity: 0.35,
          transparent: true,
          opacity: 0.55,
          roughness: 0.1,
        });
        bMat.userData.sharedMat = true;
        sharedMatCache.set(bubbleKey, bMat);
      }
      for (let i = 0; i < 3; i++) {
        const bub = new THREE.Mesh(new THREE.SphereGeometry(0.28 + i * 0.1, 10, 8), bMat);
        bub.position.set((i - 1) * 0.45, 1.2 + i * 0.75, 0);
        g.add(bub);
      }
      g.userData.animType = 'swim';
    } else {
      const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.58, 2.8, 10), makeMat(0x94a3b8, 0.85));
      pillar.position.y = 1.4;
      const cap = new THREE.Mesh(new THREE.BoxGeometry(1.35, 0.35, 1.35), makeMat(0xcbd5e1, 0.85));
      cap.position.y = 2.8;
      g.add(pillar, cap);
    }
  } else if (worldId === 'snow') {
    if (type === 0) {
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.38, 1.6, 8), makeMat(0x78350f, 0.9));
      trunk.position.y = 0.8;
      const pine = new THREE.Mesh(new THREE.ConeGeometry(1.5, 2.6, 10), makeMat(0x0f766e, 0.75));
      pine.position.y = 2.4;
      const snowCap = new THREE.Mesh(new THREE.ConeGeometry(1.05, 1.5, 10), makeMat(0xf8fafc, 0.8));
      snowCap.position.y = 3.25;
      g.add(trunk, pine, snowCap);
    } else if (type === 1) {
      const sMat = makeMat(0xf8fafc, 0.82);
      const b1 = new THREE.Mesh(new THREE.SphereGeometry(0.72, 12, 10), sMat);
      b1.position.y = 0.65;
      const b2 = new THREE.Mesh(new THREE.SphereGeometry(0.5, 12, 10), sMat);
      b2.position.y = 1.6;
      const scarf = new THREE.Mesh(new THREE.TorusGeometry(0.36, 0.09, 8, 14), makeMat(0xef4444, 0.6));
      scarf.rotation.x = Math.PI / 2;
      scarf.position.y = 1.25;
      const nose = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.32, 6), makeMat(0xf97316, 0.5));
      nose.rotation.x = Math.PI / 2;
      nose.position.set(0, 1.62, 0.52);
      g.add(b1, b2, scarf, nose);
    } else if (type === 2) {
      const log = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.7, 2.1), makeMat(0x92400e, 0.82));
      log.position.y = 0.85;
      const roof = new THREE.Mesh(new THREE.ConeGeometry(2.0, 1.4, 4), makeMat(0xf8fafc, 0.75));
      roof.position.y = 2.4;
      roof.rotation.y = Math.PI / 4;
      const win = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.65, 0.12), makeMat(0xfde047, 0.3, 0, 0xfbbf24, 0.6));
      win.position.set(0, 0.95, 1.08);
      g.add(log, roof, win);
    } else if (type === 3) {
      // Hopping cute penguin!
      const pBody = new THREE.Mesh(new THREE.CapsuleGeometry(0.34, 0.45, 6, 10), makeMat(0x1e293b, 0.45));
      pBody.position.y = 0.55;
      const pBelly = new THREE.Mesh(new THREE.SphereGeometry(0.28, 10, 8), makeMat(0xffffff, 0.6));
      pBelly.position.set(0, 0.5, 0.16);
      const pBeak = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.2, 6), makeMat(0xfbbf24, 0.4));
      pBeak.rotation.x = Math.PI / 2;
      pBeak.position.set(0, 0.82, 0.34);
      g.add(pBody, pBelly, pBeak);
      g.userData.animType = 'hop';
    } else {
      const iMat = makeMat(0x7dd3fc, 0.15, 0.25);
      const s1 = new THREE.Mesh(new THREE.ConeGeometry(0.55, 2.1, 6), iMat);
      s1.position.y = 1.05;
      const s2 = new THREE.Mesh(new THREE.ConeGeometry(0.38, 1.4, 6), iMat);
      s2.position.set(0.55, 0.7, 0.15);
      s2.rotation.z = -0.25;
      g.add(s1, s2);
    }
  } else if (worldId === 'sky') {
    if (type === 0) {
      const rock = new THREE.Mesh(new THREE.ConeGeometry(1.5, 1.8, 7), makeMat(0xfcd5ce, 0.8));
      rock.rotation.x = Math.PI;
      rock.position.y = 1.1;
      const top = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.45, 0.35, 10), makeMat(0x6ee7b7, 0.75));
      top.position.y = 2.05;
      const tree = new THREE.Mesh(new THREE.SphereGeometry(0.85, 12, 10), makeMat(0xfbbf24, 0.55));
      tree.position.y = 3.1;
      g.add(rock, top, tree);
    } else if (type === 1) {
      const cMat = makeMat(0xffffff, 0.9);
      const c1 = new THREE.Mesh(new THREE.SphereGeometry(0.85, 12, 10), cMat);
      c1.position.y = 1.2;
      const c2 = new THREE.Mesh(new THREE.SphereGeometry(0.65, 12, 10), cMat);
      c2.position.set(-0.65, 1.05, 0);
      const c3 = new THREE.Mesh(new THREE.SphereGeometry(0.65, 12, 10), cMat);
      c3.position.set(0.65, 1.05, 0);
      g.add(c1, c2, c3);
    } else if (type === 2) {
      const balloon = new THREE.Mesh(new THREE.SphereGeometry(1.15, 14, 12), makeMat(0xf472b6, 0.4));
      balloon.position.y = 4.2;
      const stripe = new THREE.Mesh(new THREE.TorusGeometry(1.08, 0.12, 8, 20), makeMat(0xfef08a, 0.35));
      stripe.rotation.x = Math.PI / 2;
      stripe.position.y = 4.2;
      const basket = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.55, 0.65), makeMat(0xb45309, 0.8));
      basket.position.y = 2.4;
      g.add(balloon, stripe, basket);
      g.userData.animType = 'swim';
    } else if (type === 3) {
      // Cute fluttering sky bird
      const b = new THREE.Mesh(new THREE.SphereGeometry(0.35, 10, 8), makeMat(0xffffff, 0.5));
      b.position.y = 2.2;
      const w1 = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.08, 0.3), makeMat(0xbae6fd, 0.4));
      w1.position.set(-0.45, 2.25, 0);
      w1.rotation.z = 0.3;
      const w2 = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.08, 0.3), makeMat(0xbae6fd, 0.4));
      w2.position.set(0.45, 2.25, 0);
      w2.rotation.z = -0.3;
      g.add(b, w1, w2);
      g.userData.animType = 'swim';
    } else {
      const r1 = new THREE.Mesh(new THREE.TorusGeometry(1.4, 0.18, 8, 20, Math.PI), makeMat(0xfb7185, 0.4));
      r1.position.y = 0.2;
      const r2 = new THREE.Mesh(new THREE.TorusGeometry(1.15, 0.18, 8, 20, Math.PI), makeMat(0x38bdf8, 0.4));
      r2.position.y = 0.2;
      g.add(r1, r2);
    }
  } else {
    // Magic Crystal World
    if (type === 0) {
      const m1 = makeMat(0xc084fc, 0.18, 0.3, 0x9333ea, 0.65);
      const m2 = makeMat(0x22d3ee, 0.18, 0.3, 0x06b6d4, 0.55);
      const s1 = new THREE.Mesh(new THREE.ConeGeometry(0.65, 3.0, 6), m1);
      s1.position.y = 1.5;
      const s2 = new THREE.Mesh(new THREE.ConeGeometry(0.45, 2.1, 6), m2);
      s2.position.set(0.65, 1.0, 0.2);
      s2.rotation.z = -0.32;
      const s3 = new THREE.Mesh(new THREE.ConeGeometry(0.4, 1.8, 6), m1);
      s3.position.set(-0.55, 0.9, -0.2);
      s3.rotation.z = 0.28;
      g.add(s1, s2, s3);
    } else if (type === 1) {
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.45, 2.1, 8), makeMat(0x312e81, 0.8));
      trunk.position.y = 1.05;
      const crown = new THREE.Mesh(new THREE.IcosahedronGeometry(1.3, 1), makeMat(0xe879f9, 0.35, 0.1, 0xc026d3, 0.4));
      crown.position.y = 2.8;
      g.add(trunk, crown);
    } else if (type === 2) {
      const base = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 1.05, 2.4, 10), makeMat(0x3b0764, 0.7));
      base.position.y = 1.2;
      const roof = new THREE.Mesh(new THREE.ConeGeometry(1.15, 1.6, 10), makeMat(0x7c3aed, 0.4));
      roof.position.y = 3.2;
      const orb = new THREE.Mesh(new THREE.SphereGeometry(0.28, 10, 8), makeMat(0x22d3ee, 0.15, 0.2, 0x22d3ee, 0.9));
      orb.position.y = 4.25;
      g.add(base, roof, orb);
    } else if (type === 3) {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.2, 2.2, 8), makeMat(0x4c1d95, 0.6));
      post.position.y = 1.1;
      const lantern = new THREE.Mesh(new THREE.OctahedronGeometry(0.42, 0), makeMat(0x34d399, 0.2, 0.2, 0x10b981, 0.8));
      lantern.position.y = 2.55;
      g.add(post, lantern);
    } else {
      const wisp = new THREE.Mesh(new THREE.SphereGeometry(0.45, 12, 10), makeMat(0x67e8f9, 0.2, 0.1, 0x22d3ee, 0.85));
      wisp.position.y = 1.25;
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.65, 0.06, 8, 18), makeMat(0xf472b6, 0.2, 0.2, 0xec4899, 0.7));
      ring.position.y = 1.25;
      ring.rotation.x = Math.PI / 3;
      g.add(wisp, ring);
      g.userData.animType = 'swim';
    }
  }

  return g;
}

// Grand Curved Bridge Railings & Pillars along a chunk
export function buildWorldBridgeSpan(
  worldId: WorldId,
  sStart: number,
  chunkLen: number
): THREE.Group {
  const g = new THREE.Group();
  const colors: Record<WorldId, [number, number]> = {
    forest: [0x92400e, 0xd97706],
    candy: [0xf472b6, 0xfff1f2],
    ocean: [0x0ea5e9, 0xfde047],
    snow: [0x7dd3fc, 0xf8fafc],
    sky: [0xfbbf24, 0xf472b6],
    crystal: [0x7e22ce, 0x22d3ee],
  };
  const [c1, c2] = colors[worldId];
  const m1 = makeMat(c1, 0.5, 0.2);
  const m2 = makeMat(c2, 0.35, 0.25);

  const postGeo = new THREE.CylinderGeometry(0.18, 0.24, 1.4, 8);
  const archGeo = new THREE.TorusGeometry(5.3, 0.28, 8, 22, Math.PI);

  for (let i = 0; i <= 4; i++) {
    const s = sStart + (i / 4) * chunkLen;
    for (const side of [-1, 1]) {
      const pt = trackPointInChunk(sStart, s, side * 5.05);
      const post = new THREE.Mesh(postGeo, m1);
      post.position.set(pt.x, pt.y + 0.7, pt.z);
      g.add(post);

      const cap = new THREE.Mesh(new THREE.SphereGeometry(0.24, 8, 8), m2);
      cap.position.set(pt.x, pt.y + 1.45, pt.z);
      g.add(cap);
    }
    if (i === 2) {
      const center = trackPointInChunk(sStart, s, 0);
      const arch = new THREE.Mesh(archGeo, m2);
      arch.position.set(center.x, center.y + 1.2, center.z);
      arch.rotation.y = -center.angle;
      g.add(arch);
    }
  }
  return g;
}

// Spectacular Themed Tunnels (including Underwater Glass Tunnel in Ocean World!)
export function buildWorldTunnel(
  worldId: WorldId,
  sStart: number,
  chunkLen: number
): THREE.Group {
  const g = new THREE.Group();
  const colors: Record<WorldId, [number, number]> = {
    forest: [0x7c4a3a, 0x34d399],
    candy: [0xf472b6, 0xfef3c7],
    ocean: [0x0284c7, 0x67e8f9],
    snow: [0x93c5fd, 0xf8fafc],
    sky: [0xfbbf24, 0xf9a8d4],
    crystal: [0x4c1d95, 0xc084fc],
  };
  const [c1, c2] = colors[worldId];
  const ribMat = makeMat(c1, 0.45, 0.2);
  const tunnelKey = `tunnel_${worldId}`;
  let shellMat = sharedMatCache.get(tunnelKey);
  if (!shellMat) {
    shellMat = new THREE.MeshStandardMaterial({
      color: c2,
      roughness: 0.25,
      metalness: 0.15,
      transparent: worldId === 'ocean' || worldId === 'sky' || worldId === 'snow',
      opacity: worldId === 'ocean' ? 0.35 : worldId === 'sky' || worldId === 'snow' ? 0.42 : 0.85,
      emissive: worldId === 'crystal' ? 0x7e22ce : 0x000000,
      emissiveIntensity: worldId === 'crystal' ? 0.45 : 0,
      side: THREE.DoubleSide,
    });
    shellMat.userData.sharedMat = true;
    sharedMatCache.set(tunnelKey, shellMat);
  }

  const ribGeo = new THREE.TorusGeometry(5.5, 0.35, 10, 24, Math.PI);
  const shellGeo = new THREE.CylinderGeometry(5.45, 5.45, 5.8, 18, 1, true, 0, Math.PI);

  for (let i = 0; i < 4; i++) {
    const s = sStart + 3 + i * (chunkLen / 4);
    const pt = trackPointInChunk(sStart, s, 0);
    const rib = new THREE.Mesh(ribGeo, ribMat);
    rib.position.set(pt.x, pt.y + 0.1, pt.z);
    rib.rotation.y = -pt.angle;
    g.add(rib);

    if (i < 3) {
      const midS = s + chunkLen / 8;
      const midPt = trackPointInChunk(sStart, midS, 0);
      const shell = new THREE.Mesh(shellGeo, shellMat);
      shell.position.set(midPt.x, midPt.y + 0.1, midPt.z);
      shell.rotation.order = 'YXZ';
      shell.rotation.y = -midPt.angle;
      shell.rotation.z = Math.PI / 2;
      shell.rotation.x = Math.PI / 2;
      g.add(shell);
    }
  }
  return g;
}

export function buildBackgroundMountain(worldId: WorldId, idx: number): THREE.Group {
  const g = new THREE.Group();
  const palette: Record<WorldId, [number, number]> = {
    forest: [0x4ade80, 0x86efac],
    candy: [0xf9a8d4, 0xfde68a],
    ocean: [0x0284c7, 0x38bdf8],
    snow: [0x93c5fd, 0xffffff],
    sky: [0xfef08a, 0xffffff],
    crystal: [0x4c1d95, 0x9333ea],
  };
  const [baseC, peakC] = palette[worldId];
  const h = 14 + (idx % 3) * 5;
  const r = 9 + (idx % 2) * 3;
  const cone = new THREE.Mesh(
    new THREE.ConeGeometry(r, h, 7),
    makeMat(idx % 2 === 0 ? baseC : peakC, 0.85)
  );
  cone.position.y = h * 0.5 - 1;
  g.add(cone);

  if (worldId === 'snow') {
    const cap = new THREE.Mesh(new THREE.ConeGeometry(r * 0.45, h * 0.45, 7), makeMat(0xffffff, 0.8));
    cap.position.y = h * 0.78 - 1;
    g.add(cap);
  }
  return g;
}
