import * as THREE from 'three';
import {
  CHARACTERS,
  CharacterId,
  HOVERBOARDS,
  HoverboardId,
  POWERUP_META,
  PowerUpType,
  WorldConfig,
} from './types';

export interface CharacterRig {
  root: THREE.Group;
  bodyGroup: THREE.Group;
  headGroup: THREE.Group;
  leftArm: THREE.Mesh;
  rightArm: THREE.Mesh;
  leftEar: THREE.Object3D;
  rightEar: THREE.Object3D;
  tail: THREE.Object3D;
  scarfTail: THREE.Mesh;
}

export interface HoverboardRig {
  root: THREE.Group;
  glowRing: THREE.Mesh;
  thrusterFlames: THREE.Mesh[];
}

export interface BirdRig {
  root: THREE.Group;
  body: THREE.Group;
  leftWing: THREE.Group;
  rightWing: THREE.Group;
  tailFeathers: THREE.Group;
}

export function createCharacterModel(id: CharacterId): CharacterRig {
  const def = CHARACTERS.find((c) => c.id === id) ?? CHARACTERS[0];
  const root = new THREE.Group();
  const bodyGroup = new THREE.Group();
  root.add(bodyGroup);

  const furMat = new THREE.MeshStandardMaterial({
    color: def.primaryHex,
    roughness: 0.78,
    metalness: 0.04,
  });
  const bellyMat = new THREE.MeshStandardMaterial({
    color: def.secondaryHex,
    roughness: 0.82,
    metalness: 0.02,
  });
  const darkMat = new THREE.MeshStandardMaterial({
    color: 0x1e2230,
    roughness: 0.14,
    metalness: 0.15,
  });
  const scarfMat = new THREE.MeshStandardMaterial({
    color: def.scarfHex,
    roughness: 0.52,
    metalness: 0.12,
  });
  const shoeMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.35,
    metalness: 0.25,
  });

  // Boots / feet planted on hoverboard (y = 0 is top of board deck)
  const bootGeo = new THREE.CapsuleGeometry(0.11, 0.14, 6, 10);
  const leftBoot = new THREE.Mesh(bootGeo, shoeMat);
  leftBoot.position.set(-0.17, 0.11, 0.12);
  leftBoot.rotation.x = Math.PI * 0.42;
  leftBoot.castShadow = true;

  const rightBoot = new THREE.Mesh(bootGeo, shoeMat);
  rightBoot.position.set(0.17, 0.11, -0.1);
  rightBoot.rotation.x = Math.PI * 0.42;
  rightBoot.castShadow = true;
  bodyGroup.add(leftBoot, rightBoot);

  // Legs
  const legGeo = new THREE.CapsuleGeometry(0.095, 0.22, 6, 10);
  const leftLeg = new THREE.Mesh(legGeo, furMat);
  leftLeg.position.set(-0.16, 0.32, 0.08);
  leftLeg.castShadow = true;
  const rightLeg = new THREE.Mesh(legGeo, furMat);
  rightLeg.position.set(0.16, 0.32, -0.06);
  rightLeg.castShadow = true;
  bodyGroup.add(leftLeg, rightLeg);

  // Torso (plump cute body)
  const torsoGeo = new THREE.CapsuleGeometry(0.24, 0.34, 8, 14);
  const torso = new THREE.Mesh(torsoGeo, furMat);
  torso.position.set(0, 0.68, 0);
  torso.scale.set(1.02, 1, 0.92);
  torso.castShadow = true;
  bodyGroup.add(torso);

  // Belly patch
  const bellyGeo = new THREE.SphereGeometry(0.2, 14, 12);
  const belly = new THREE.Mesh(bellyGeo, bellyMat);
  belly.position.set(0, 0.67, -0.1);
  belly.scale.set(0.95, 1.2, 0.72);
  bodyGroup.add(belly);

  // Scarf collar & fluttering scarf tail
  const collarGeo = new THREE.TorusGeometry(0.21, 0.065, 10, 20);
  const collar = new THREE.Mesh(collarGeo, scarfMat);
  collar.rotation.x = Math.PI / 2;
  collar.position.set(0, 0.94, 0);
  collar.castShadow = true;
  bodyGroup.add(collar);

  const scarfTailGeo = new THREE.BoxGeometry(0.14, 0.05, 0.38);
  const scarfTail = new THREE.Mesh(scarfTailGeo, scarfMat);
  scarfTail.position.set(0.14, 0.92, 0.24);
  scarfTail.rotation.y = 0.28;
  bodyGroup.add(scarfTail);

  // Arms
  const armGeo = new THREE.CapsuleGeometry(0.08, 0.25, 6, 10);
  const leftArm = new THREE.Mesh(armGeo, furMat);
  leftArm.position.set(-0.31, 0.72, 0);
  leftArm.rotation.z = 0.55;
  leftArm.castShadow = true;

  const rightArm = new THREE.Mesh(armGeo, furMat);
  rightArm.position.set(0.31, 0.72, 0);
  rightArm.rotation.z = -0.55;
  rightArm.castShadow = true;
  bodyGroup.add(leftArm, rightArm);

  // Head group
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 1.18, -0.02);
  bodyGroup.add(headGroup);

  const headGeo = new THREE.SphereGeometry(0.31, 18, 16);
  const head = new THREE.Mesh(headGeo, furMat);
  head.scale.set(1.1, 0.95, 1.0);
  head.castShadow = true;
  headGroup.add(head);

  // Cheek / muzzle accents
  const cheekGeo = new THREE.SphereGeometry(0.17, 12, 10);
  const leftCheek = new THREE.Mesh(cheekGeo, bellyMat);
  leftCheek.position.set(-0.15, -0.06, -0.18);
  leftCheek.scale.set(1.0, 0.78, 0.75);
  const rightCheek = new THREE.Mesh(cheekGeo, bellyMat);
  rightCheek.position.set(0.15, -0.06, -0.18);
  rightCheek.scale.set(1.0, 0.78, 0.75);
  headGroup.add(leftCheek, rightCheek);

  // Cute snout + nose (facing forward -Z)
  const snoutGeo = new THREE.ConeGeometry(0.11, 0.18, 12);
  const snout = new THREE.Mesh(snoutGeo, bellyMat);
  snout.rotation.x = -Math.PI / 2;
  snout.position.set(0, -0.05, -0.32);
  headGroup.add(snout);

  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.045, 10, 8), darkMat);
  nose.position.set(0, -0.04, -0.4);
  headGroup.add(nose);

  // Big glossy eyes + white catchlights
  const eyeGeo = new THREE.SphereGeometry(0.058, 12, 10);
  const leftEye = new THREE.Mesh(eyeGeo, darkMat);
  leftEye.position.set(-0.14, 0.05, -0.26);
  const rightEye = new THREE.Mesh(eyeGeo, darkMat);
  rightEye.position.set(0.14, 0.05, -0.26);

  const glintMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const glintGeo = new THREE.SphereGeometry(0.02, 8, 6);
  const leftGlint = new THREE.Mesh(glintGeo, glintMat);
  leftGlint.position.set(-0.125, 0.075, -0.305);
  const rightGlint = new THREE.Mesh(glintGeo, glintMat);
  rightGlint.position.set(0.155, 0.075, -0.305);
  headGroup.add(leftEye, rightEye, leftGlint, rightGlint);

  // Cute rosy pastel blush cheeks
  const blushMat = new THREE.MeshStandardMaterial({
    color: 0xfb7185,
    roughness: 0.7,
    transparent: true,
    opacity: 0.65,
  });
  const blushGeo = new THREE.SphereGeometry(0.055, 8, 6);
  const leftBlush = new THREE.Mesh(blushGeo, blushMat);
  leftBlush.position.set(-0.22, -0.04, -0.23);
  leftBlush.scale.set(1.2, 0.7, 0.5);
  const rightBlush = new THREE.Mesh(blushGeo, blushMat);
  rightBlush.position.set(0.22, -0.04, -0.23);
  rightBlush.scale.set(1.2, 0.7, 0.5);
  headGroup.add(leftBlush, rightBlush);

  // Character-specific ears & accessories
  const leftEar = new THREE.Group();
  const rightEar = new THREE.Group();
  leftEar.position.set(-0.2, 0.25, 0.02);
  rightEar.position.set(0.2, 0.25, 0.02);
  headGroup.add(leftEar, rightEar);

  if (id === 'fox' || id === 'cosmic_cat') {
    const earGeo = new THREE.ConeGeometry(0.12, 0.28, 10);
    const innerGeo = new THREE.ConeGeometry(0.07, 0.18, 10);
    const innerMat = new THREE.MeshStandardMaterial({
      color: id === 'fox' ? 0xffcdb2 : 0xfde68a,
      roughness: 0.7,
    });
    const lOut = new THREE.Mesh(earGeo, furMat);
    lOut.position.y = 0.12;
    const lIn = new THREE.Mesh(innerGeo, innerMat);
    lIn.position.set(0, 0.11, -0.04);
    leftEar.add(lOut, lIn);
    leftEar.rotation.z = 0.24;

    const rOut = new THREE.Mesh(earGeo, furMat);
    rOut.position.y = 0.12;
    const rIn = new THREE.Mesh(innerGeo, innerMat);
    rIn.position.set(0, 0.11, -0.04);
    rightEar.add(rOut, rIn);
    rightEar.rotation.z = -0.24;

    if (id === 'cosmic_cat') {
      const bell = new THREE.Mesh(
        new THREE.SphereGeometry(0.06, 10, 8),
        new THREE.MeshStandardMaterial({
          color: 0xfbbf24,
          metalness: 0.85,
          roughness: 0.2,
        })
      );
      bell.position.set(0, 0.88, -0.22);
      bodyGroup.add(bell);
    }
  } else if (id === 'bunny') {
    const earGeo = new THREE.CapsuleGeometry(0.075, 0.28, 6, 10);
    const lEar = new THREE.Mesh(earGeo, furMat);
    lEar.position.set(0, 0.2, 0.04);
    lEar.rotation.x = 0.25;
    leftEar.add(lEar);

    const rEar = new THREE.Mesh(earGeo, furMat);
    rEar.position.set(0, 0.2, 0.04);
    rEar.rotation.x = 0.25;
    rightEar.add(rEar);
    leftEar.rotation.z = 0.18;
    rightEar.rotation.z = -0.18;
  } else if (id === 'panda') {
    const earGeo = new THREE.SphereGeometry(0.11, 12, 10);
    const lEar = new THREE.Mesh(earGeo, bellyMat);
    lEar.position.y = 0.04;
    leftEar.add(lEar);
    const rEar = new THREE.Mesh(earGeo, bellyMat);
    rEar.position.y = 0.04;
    rightEar.add(rEar);

    // Panda eye patches
    const patchGeo = new THREE.SphereGeometry(0.095, 10, 8);
    const lPatch = new THREE.Mesh(patchGeo, bellyMat);
    lPatch.position.set(-0.14, 0.04, -0.23);
    lPatch.scale.set(1.1, 0.9, 0.5);
    const rPatch = new THREE.Mesh(patchGeo, bellyMat);
    rPatch.position.set(0.14, 0.04, -0.23);
    rPatch.scale.set(1.1, 0.9, 0.5);
    headGroup.add(lPatch, rPatch);
  }

  // Tail (anchored at base so wagging looks natural)
  const tail = new THREE.Group();
  tail.position.set(0, 0.5, 0.22);
  bodyGroup.add(tail);

  if (id === 'fox') {
    const tailBody = new THREE.Mesh(new THREE.CapsuleGeometry(0.13, 0.34, 8, 12), furMat);
    tailBody.rotation.x = Math.PI * 0.34;
    tailBody.position.set(0, 0.14, 0.22);
    tailBody.castShadow = true;

    const tailTip = new THREE.Mesh(new THREE.SphereGeometry(0.135, 12, 10), bellyMat);
    tailTip.position.set(0, 0.26, 0.4);
    tail.add(tailBody, tailTip);
  } else if (id === 'bunny' || id === 'panda') {
    const puff = new THREE.Mesh(
      new THREE.SphereGeometry(0.13, 12, 10),
      id === 'bunny' ? bellyMat : bellyMat
    );
    puff.position.set(0, 0.02, 0.08);
    tail.add(puff);
  } else {
    const catTail = new THREE.Mesh(new THREE.CapsuleGeometry(0.06, 0.42, 6, 10), furMat);
    catTail.rotation.x = Math.PI * 0.32;
    catTail.position.set(0, 0.16, 0.22);
    const starTip = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.09, 0),
      scarfMat
    );
    starTip.position.set(0, 0.3, 0.4);
    tail.add(catTail, starTip);
  }

  return {
    root,
    bodyGroup,
    headGroup,
    leftArm,
    rightArm,
    leftEar,
    rightEar,
    tail,
    scarfTail,
  };
}

export function createHoverboardModel(id: HoverboardId): HoverboardRig {
  const def = HOVERBOARDS.find((b) => b.id === id) ?? HOVERBOARDS[0];
  const root = new THREE.Group();

  const deckMat = new THREE.MeshPhysicalMaterial({
    color: def.deckHex,
    roughness: 0.22,
    metalness: 0.35,
    clearcoat: 0.9,
    clearcoatRoughness: 0.12,
  });
  const trimMat = new THREE.MeshStandardMaterial({
    color: def.trimHex,
    roughness: 0.28,
    metalness: 0.78,
  });
  const glowMat = new THREE.MeshStandardMaterial({
    color: def.glowHex,
    emissive: def.glowHex,
    emissiveIntensity: 1.5,
    roughness: 0.2,
  });

  // Main contoured deck (rounded capsule-like extruded slab)
  const shape = new THREE.Shape();
  shape.moveTo(-0.34, -0.72);
  shape.quadraticCurveTo(0, -0.96, 0.34, -0.72);
  shape.lineTo(0.38, 0.62);
  shape.quadraticCurveTo(0, 0.88, -0.38, 0.62);
  shape.closePath();

  const deckGeo = new THREE.ExtrudeGeometry(shape, {
    depth: 0.08,
    bevelEnabled: true,
    bevelThickness: 0.035,
    bevelSize: 0.035,
    bevelSegments: 3,
  });
  deckGeo.rotateX(Math.PI / 2);
  const deck = new THREE.Mesh(deckGeo, deckMat);
  deck.position.y = 0.06;
  deck.castShadow = true;
  deck.receiveShadow = true;
  root.add(deck);

  // Side rails
  const railGeo = new THREE.CapsuleGeometry(0.045, 0.98, 6, 10);
  const leftRail = new THREE.Mesh(railGeo, trimMat);
  leftRail.rotation.x = Math.PI / 2;
  leftRail.position.set(-0.38, 0.03, 0);
  const rightRail = new THREE.Mesh(railGeo, trimMat);
  rightRail.rotation.x = Math.PI / 2;
  rightRail.position.set(0.38, 0.03, 0);
  root.add(leftRail, rightRail);

  // Board-specific dorsal/side fins
  const finGeo = new THREE.BoxGeometry(0.18, 0.04, 0.34);
  const leftFin = new THREE.Mesh(finGeo, trimMat);
  leftFin.position.set(-0.44, 0.05, 0.38);
  leftFin.rotation.y = 0.28;
  leftFin.rotation.z = 0.22;
  const rightFin = new THREE.Mesh(finGeo, trimMat);
  rightFin.position.set(0.44, 0.05, 0.38);
  rightFin.rotation.y = -0.28;
  rightFin.rotation.z = -0.22;
  root.add(leftFin, rightFin);

  // Twin rear thruster nozzles & flames
  const nozzleGeo = new THREE.CylinderGeometry(0.09, 0.11, 0.18, 12);
  const flameGeo = new THREE.ConeGeometry(0.085, 0.36, 10);
  const thrusterFlames: THREE.Mesh[] = [];

  [-0.2, 0.2].forEach((x) => {
    const nozzle = new THREE.Mesh(nozzleGeo, trimMat);
    nozzle.rotation.x = Math.PI / 2;
    nozzle.position.set(x, 0.02, 0.78);
    root.add(nozzle);

    const flame = new THREE.Mesh(flameGeo, glowMat);
    flame.rotation.x = Math.PI / 2;
    flame.position.set(x, 0.02, 1.02);
    root.add(flame);
    thrusterFlames.push(flame);
  });

  // Under-board hover energy ring
  const glowRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.34, 0.035, 8, 24),
    glowMat
  );
  glowRing.rotation.x = Math.PI / 2;
  glowRing.position.set(0, -0.06, 0);
  root.add(glowRing);

  return { root, glowRing, thrusterFlames };
}

export function createBirdModel(): BirdRig {
  const root = new THREE.Group();
  const body = new THREE.Group();
  root.add(body);

  const featherMat = new THREE.MeshStandardMaterial({
    color: 0xfbbf24,
    roughness: 0.45,
    metalness: 0.1,
  });
  const bellyMat = new THREE.MeshStandardMaterial({
    color: 0xfffbeb,
    roughness: 0.6,
  });
  const beakMat = new THREE.MeshStandardMaterial({
    color: 0xf97316,
    roughness: 0.35,
  });
  const eyeMat = new THREE.MeshStandardMaterial({
    color: 0x1e2230,
    roughness: 0.12,
  });

  const torso = new THREE.Mesh(new THREE.SphereGeometry(0.36, 16, 14), featherMat);
  torso.scale.set(0.95, 0.88, 1.25);
  torso.castShadow = true;
  body.add(torso);

  const chest = new THREE.Mesh(new THREE.SphereGeometry(0.28, 14, 12), bellyMat);
  chest.position.set(0, -0.07, -0.14);
  chest.scale.set(0.9, 0.85, 0.9);
  body.add(chest);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.24, 14, 12), featherMat);
  head.position.set(0, 0.24, -0.28);
  body.add(head);

  // Cute crest feathers
  const crest = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.22, 8), beakMat);
  crest.position.set(0, 0.48, -0.22);
  crest.rotation.x = 0.4;
  body.add(crest);

  const beak = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.22, 10), beakMat);
  beak.rotation.x = -Math.PI / 2;
  beak.position.set(0, 0.21, -0.54);
  body.add(beak);

  const eyeGeo = new THREE.SphereGeometry(0.045, 10, 8);
  const lEye = new THREE.Mesh(eyeGeo, eyeMat);
  lEye.position.set(-0.14, 0.28, -0.44);
  const rEye = new THREE.Mesh(eyeGeo, eyeMat);
  rEye.position.set(0.14, 0.28, -0.44);
  body.add(lEye, rEye);

  // Wings
  const wingGeo = new THREE.BoxGeometry(0.68, 0.08, 0.36);
  const leftWing = new THREE.Group();
  leftWing.position.set(-0.28, 0.08, 0);
  const lWingMesh = new THREE.Mesh(wingGeo, featherMat);
  lWingMesh.position.x = -0.32;
  lWingMesh.castShadow = true;
  leftWing.add(lWingMesh);

  const rightWing = new THREE.Group();
  rightWing.position.set(0.28, 0.08, 0);
  const rWingMesh = new THREE.Mesh(wingGeo, featherMat);
  rWingMesh.position.x = 0.32;
  rWingMesh.castShadow = true;
  rightWing.add(rWingMesh);
  body.add(leftWing, rightWing);

  // Tail feathers
  const tailFeathers = new THREE.Group();
  tailFeathers.position.set(0, 0.05, 0.42);
  const tMesh = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.06, 0.34), beakMat);
  tMesh.position.z = 0.14;
  tailFeathers.add(tMesh);
  body.add(tailFeathers);

  return { root, body, leftWing, rightWing, tailFeathers };
}

export function createPowerUpMesh(type: PowerUpType): THREE.Group {
  const meta = POWERUP_META[type];
  const group = new THREE.Group();

  const auraMat = new THREE.MeshStandardMaterial({
    color: meta.colorHex,
    emissive: meta.colorHex,
    emissiveIntensity: 0.85,
    transparent: true,
    opacity: 0.28,
    roughness: 0.15,
  });
  const auraRing = new THREE.Mesh(new THREE.TorusGeometry(0.62, 0.05, 10, 28), auraMat);
  group.add(auraRing);

  if (type === 'magnet') {
    // Classic U-shaped Magnet with metallic tips
    const redMat = new THREE.MeshStandardMaterial({
      color: 0xf43f5e,
      emissive: 0x9f1239,
      emissiveIntensity: 0.4,
      roughness: 0.25,
      metalness: 0.2,
    });
    const tipMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      roughness: 0.18,
      metalness: 0.85,
    });
    const arc = new THREE.Mesh(
      new THREE.TorusGeometry(0.28, 0.095, 12, 24, Math.PI),
      redMat
    );
    arc.rotation.z = Math.PI;
    arc.position.y = 0.04;
    const tipGeo = new THREE.CylinderGeometry(0.095, 0.095, 0.2, 12);
    const lTip = new THREE.Mesh(tipGeo, tipMat);
    lTip.position.set(-0.28, 0.14, 0);
    const rTip = new THREE.Mesh(tipGeo, tipMat);
    rTip.position.set(0.28, 0.14, 0);
    group.add(arc, lTip, rTip);
  } else if (type === 'invisibility') {
    // Translucent cyan ghost orb + floating inner core
    const shellMat = new THREE.MeshPhysicalMaterial({
      color: 0x67e8f9,
      emissive: 0x22d3ee,
      emissiveIntensity: 0.65,
      transparent: true,
      opacity: 0.55,
      roughness: 0.1,
      clearcoat: 1.0,
    });
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0xe0f2fe,
      emissive: 0x38bdf8,
      emissiveIntensity: 1.4,
    });
    const dome = new THREE.Mesh(new THREE.SphereGeometry(0.32, 16, 14), shellMat);
    const core = new THREE.Mesh(new THREE.OctahedronGeometry(0.16, 0), coreMat);
    const orbit = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.035, 8, 24), coreMat);
    orbit.rotation.x = Math.PI / 3;
    group.add(dome, core, orbit);
  } else if (type === 'bird') {
    // Golden winged emblem
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      emissive: 0xd97706,
      emissiveIntensity: 0.55,
      roughness: 0.25,
      metalness: 0.6,
    });
    const wingMat = new THREE.MeshStandardMaterial({
      color: 0xfef3c7,
      emissive: 0xf59e0b,
      emissiveIntensity: 0.35,
      roughness: 0.35,
    });
    const orb = new THREE.Mesh(new THREE.SphereGeometry(0.2, 14, 12), goldMat);
    const wingGeo = new THREE.BoxGeometry(0.46, 0.08, 0.22);
    const lWing = new THREE.Mesh(wingGeo, wingMat);
    lWing.position.set(-0.32, 0.08, 0);
    lWing.rotation.z = -0.35;
    const rWing = new THREE.Mesh(wingGeo, wingMat);
    rWing.position.set(0.32, 0.08, 0);
    rWing.rotation.z = 0.35;
    group.add(orb, lWing, rWing);
  } else {
    // Shield hex crest
    const emeraldMat = new THREE.MeshStandardMaterial({
      color: 0x34d399,
      emissive: 0x059669,
      emissiveIntensity: 0.65,
      roughness: 0.2,
      metalness: 0.45,
    });
    const trimMat = new THREE.MeshStandardMaterial({
      color: 0xfef08a,
      roughness: 0.2,
      metalness: 0.8,
    });
    const hex = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.26, 0.14, 6), emeraldMat);
    hex.rotation.x = Math.PI / 2;
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.36, 0.045, 8, 6), trimMat);
    group.add(hex, rim);
  }

  return group;
}

export function createCoinMesh(sharedGeo: THREE.BufferGeometry, sharedMat: THREE.Material): THREE.Group {
  const g = new THREE.Group();
  const disc = new THREE.Mesh(sharedGeo, sharedMat);
  disc.rotation.x = Math.PI / 2;
  disc.castShadow = false;
  g.add(disc);
  return g;
}

export function createGemMesh(sharedGeo: THREE.BufferGeometry, sharedMat: THREE.Material): THREE.Group {
  const g = new THREE.Group();
  const gem = new THREE.Mesh(sharedGeo, sharedMat);
  gem.scale.set(1, 1.35, 1);
  g.add(gem);
  return g;
}

export function createWorldPortalMesh(nextWorld: WorldConfig): THREE.Group {
  const group = new THREE.Group();
  const portalColor = new THREE.Color(nextWorld.accentHex);

  const frameMat = new THREE.MeshStandardMaterial({
    color: 0xfef3c7,
    roughness: 0.28,
    metalness: 0.55,
  });
  const glowMat = new THREE.MeshStandardMaterial({
    color: portalColor,
    emissive: portalColor,
    emissiveIntensity: 1.35,
    roughness: 0.15,
  });
  const curtainMat = new THREE.MeshBasicMaterial({
    color: portalColor,
    transparent: true,
    opacity: 0.28,
    side: THREE.DoubleSide,
    depthWrite: false,
  });

  // Left & Right ornate pillars
  const pillarGeo = new THREE.CylinderGeometry(0.38, 0.52, 5.2, 12);
  const lPillar = new THREE.Mesh(pillarGeo, frameMat);
  lPillar.position.set(-4.8, 2.6, 0);
  const rPillar = new THREE.Mesh(pillarGeo, frameMat);
  rPillar.position.set(4.8, 2.6, 0);

  // Glowing top arch & inner vortex ring
  const arch = new THREE.Mesh(
    new THREE.TorusGeometry(4.8, 0.34, 12, 32, Math.PI),
    glowMat
  );
  arch.position.set(0, 4.9, 0);

  const innerRing = new THREE.Mesh(
    new THREE.TorusGeometry(3.9, 0.14, 10, 32, Math.PI),
    frameMat
  );
  innerRing.position.set(0, 4.8, 0);

  // Shimmering portal curtain
  const curtain = new THREE.Mesh(new THREE.PlaneGeometry(9.2, 6.4), curtainMat);
  curtain.position.set(0, 3.2, 0);

  // Floating star crystals atop the portal
  const starGeo = new THREE.OctahedronGeometry(0.55, 0);
  const topStar = new THREE.Mesh(starGeo, glowMat);
  topStar.position.set(0, 9.9, 0);
  topStar.userData.animType = 'spin';

  const leftOrb = new THREE.Mesh(new THREE.OctahedronGeometry(0.38, 0), glowMat);
  leftOrb.position.set(-4.8, 5.5, 0);
  leftOrb.userData.animType = 'spin';

  const rightOrb = new THREE.Mesh(new THREE.OctahedronGeometry(0.38, 0), glowMat);
  rightOrb.position.set(4.8, 5.5, 0);
  rightOrb.userData.animType = 'spin';

  group.add(lPillar, rPillar, arch, innerRing, curtain, topStar, leftOrb, rightOrb);
  return group;
}
