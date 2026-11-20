import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { gameAudio } from './audio';
import {
  BirdRig,
  CharacterRig,
  HoverboardRig,
  createBirdModel,
  createCharacterModel,
  createCoinMesh,
  createGemMesh,
  createHoverboardModel,
  createPowerUpMesh,
  createWorldPortalMesh,
} from './models';
import {
  createContactShadowTexture,
  createGroundTexture,
  createTrackTexture,
} from './textures';
import {
  ActivePowerUpState,
  CharacterId,
  GamePhase,
  HoverboardId,
  HudSnapshot,
  POWERUP_META,
  PowerUpType,
  WORLDS,
  WorldConfig,
  WorldId,
} from './types';
import {
  ObstacleKind,
  buildBackgroundMountain,
  buildCurvedRoadMeshes,
  buildWorldBridgeSpan,
  buildWorldDecorProp,
  buildWorldObstacle,
  buildWorldTunnel,
  roadAngleAt,
  roadCenterX,
  roadElevY,
  trackPointInChunk,
} from './worlds';

const LANE_X = [-3.1, 0, 3.1] as const;
const CHUNK_LEN = 24;
const CHUNK_COUNT = 9;
const PORTAL_INTERVAL_CHUNKS = 10;
const BASE_SPEED = 18.0;
const MAX_SPEED = 36;
const POWER_TYPES: PowerUpType[] = ['magnet', 'invisibility', 'bird', 'shield'];

interface SpawnedObstacle {
  mesh: THREE.Group;
  kind: ObstacleKind;
  s: number;
  sStart: number;
  baseLaneX: number;
  width: number;
  height: number;
  depth: number;
  moveAmp: number;
  moveSpeed: number;
  phaseOffset: number;
  cleared: boolean;
}

interface SpawnedCollectible {
  mesh: THREE.Group;
  kind: 'coin' | 'gem' | 'powerup';
  powerType?: PowerUpType;
  s: number;
  sStart: number;
  laneX: number;
  baseY: number;
  worldPos: THREE.Vector3;
  collected: boolean;
  attracted: boolean;
}

interface AnimatedDecor {
  obj: THREE.Object3D;
  baseY: number;
  phase: number;
  type: string;
}

interface PortalTrigger {
  s: number;
  nextWorld: WorldConfig;
  triggered: boolean;
}

interface TrackChunk {
  group: THREE.Group;
  sStart: number;
  roadMesh: THREE.Mesh | null;
  groundMesh: THREE.Mesh | null;
  obstacles: SpawnedObstacle[];
  collectibles: SpawnedCollectible[];
  decorGroup: THREE.Group;
  animDecor: AnimatedDecor[];
  portal: PortalTrigger | null;
}

interface Particle {
  mesh: THREE.Mesh;
  vel: THREE.Vector3;
  life: number;
  maxLife: number;
  active: boolean;
}

// Reusable scratch math objects (zero GC in loop)
const _v1 = new THREE.Vector3();
const _v2 = new THREE.Vector3();
const _cTargetTop = new THREE.Color();
const _cTargetBot = new THREE.Color();
const _cTargetFog = new THREE.Color();
const _cTargetSun = new THREE.Color();
const _cTargetHemiSky = new THREE.Color();
const _cTargetHemiGnd = new THREE.Color();

export interface EngineCallbacks {
  onHudUpdate: (snapshot: HudSnapshot) => void;
  onGameOver: (stats: {
    worldId: WorldId;
    distance: number;
    score: number;
    coins: number;
    powerupsCollected: number;
  }) => void;
}

export class CuteWorldEngine {
  private container: HTMLElement;
  private callbacks: EngineCallbacks;

  private isSoftwareGl = false;
  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private skyMat!: THREE.ShaderMaterial;
  private dirLight!: THREE.DirectionalLight;
  private hemiLight!: THREE.HemisphereLight;
  private rimLight!: THREE.DirectionalLight;

  private worldCfg: WorldConfig = WORLDS[0];
  private targetWorldCfg: WorldConfig = WORLDS[0];
  private spawningWorldIndex = 0;
  private characterId: CharacterId = 'fox';
  private hoverboardId: HoverboardId = 'aero';

  private playerRoot = new THREE.Group();
  private characterRig!: CharacterRig;
  private hoverboardRig!: HoverboardRig;
  private birdRig!: BirdRig;
  private contactShadow!: THREE.Mesh;
  private shieldSphere!: THREE.Mesh;
  private magnetRing!: THREE.Mesh;
  private ghostMaterials: THREE.MeshStandardMaterial[] = [];

  private worldTrackMats: Map<WorldId, THREE.MeshStandardMaterial> = new Map();
  private worldGroundMats: Map<WorldId, THREE.MeshStandardMaterial> = new Map();
  private worldTextures: THREE.Texture[] = [];

  private coinGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.1, 14);
  private coinMat = new THREE.MeshStandardMaterial({
    color: 0xfbbf24,
    emissive: 0xd97706,
    emissiveIntensity: 0.35,
    metalness: 0.85,
    roughness: 0.2,
  });
  private gemGeo = new THREE.OctahedronGeometry(0.44, 0);
  private gemMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x0284c7,
    emissiveIntensity: 0.55,
    metalness: 0.35,
    roughness: 0.12,
  });

  private chunks: TrackChunk[] = [];
  private particles: Particle[] = [];
  private particleGeo = new THREE.SphereGeometry(0.14, 6, 6);

  private phase: GamePhase = 'menu';
  private elapsed = 0;
  private frameId = 0;
  private lastTimestamp = 0;
  private disposed = false;

  // Run state
  private speed = BASE_SPEED;
  private scrollZ = 0;
  private distance = 0;
  private score = 0;
  private runCoins = 0;
  private powerupsCollected = 0;
  private chunkSerial = 0;
  private nextPortalChunk = PORTAL_INTERVAL_CHUNKS;

  // Player kinematics (in track-lane coordinates)
  private targetLane = 0;
  private playerLaneX = 0;
  private prevPlayerLaneX = 0;
  private playerY = 0;
  private vy = 0;
  private isGrounded = true;
  private slideTimer = 0;
  private jumpBufferTimer = 0;
  private graceInvulnTimer = 0;
  private hitstopTimer = 0;
  private cameraShake = 0;

  // Camera smooth tracking
  private camPos = new THREE.Vector3(0, 4.4, 7.6);
  private camLook = new THREE.Vector3(0, 1.5, -12);

  // Power-ups
  private powerTimers: Record<PowerUpType, number> = {
    magnet: 0,
    invisibility: 0,
    bird: 0,
    shield: 0,
  };
  private pickupBanner: { label: string; colorHex: string; key: number } | null = null;
  private bannerTimer = 0;
  private bannerSeq = 0;
  private hudEmitAccum = 0;
  private nextPowerUpChunk = 2;
  private birdSpawnAccum = 0;

  private resizeObserver: ResizeObserver | null = null;
  private boundResize = () => this.handleResize();

  constructor(
    container: HTMLElement,
    initialWorld: WorldId,
    initialCharacter: CharacterId,
    initialHoverboard: HoverboardId,
    callbacks: EngineCallbacks
  ) {
    this.container = container;
    this.callbacks = callbacks;
    this.characterId = initialCharacter;
    this.hoverboardId = initialHoverboard;
    this.coinGeo.userData.sharedGeo = true;
    this.gemGeo.userData.sharedGeo = true;

    const idx = WORLDS.findIndex((w) => w.id === initialWorld);
    this.spawningWorldIndex = idx >= 0 ? idx : 0;
    this.worldCfg = WORLDS[this.spawningWorldIndex];
    this.targetWorldCfg = this.worldCfg;

    this.initRenderer();
    this.initScene();
    this.ensureWorldMaterials(this.worldCfg.id);
    this.initPlayer();
    this.initParticles();
    this.buildChunks(true);
    this.snapAtmosphereToWorld(this.worldCfg);

    window.addEventListener('resize', this.boundResize);
    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => this.handleResize());
      this.resizeObserver.observe(this.container);
    }
    this.handleResize();

    if (!this.isSoftwareGl) {
      try {
        this.renderer.compile(this.scene, this.camera);
      } catch {
        // Ignore pre-compile errors on constrained drivers
      }
    }

    this.lastTimestamp = performance.now();
    this.tick();
  }

  private detectSoftwareGl(): boolean {
    try {
      const probeCanvas = document.createElement('canvas');
      const gl =
        probeCanvas.getContext('webgl2') ||
        probeCanvas.getContext('webgl');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param) ?? '');
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    } catch {
      return true;
    }
  }

  private initRenderer(): void {
    this.isSoftwareGl = this.detectSoftwareGl();
    try {
      this.renderer = new THREE.WebGLRenderer({
        antialias: !this.isSoftwareGl,
        powerPreference: 'high-performance',
      });
    } catch {
      this.renderer = new THREE.WebGLRenderer({
        antialias: false,
        powerPreference: 'default',
      });
    }

    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.08;
    this.renderer.setPixelRatio(
      this.isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2)
    );
    this.renderer.shadowMap.enabled = !this.isSoftwareGl;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.domElement.style.display = 'block';
    this.renderer.domElement.style.width = '100%';
    this.renderer.domElement.style.height = '100%';

    this.renderer.domElement.addEventListener('webglcontextlost', (e) => {
      e.preventDefault();
      cancelAnimationFrame(this.frameId);
      clearTimeout(this.frameId);
    });
    this.renderer.domElement.addEventListener('webglcontextrestored', () => {
      if (!this.disposed) {
        this.lastTimestamp = performance.now();
        this.tick();
      }
    });

    this.container.innerHTML = '';
    this.container.appendChild(this.renderer.domElement);
  }

  private initScene(): void {
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(this.worldCfg.fogHex, this.worldCfg.fogDensity);

    if (!this.isSoftwareGl) {
      try {
        const pmrem = new THREE.PMREMGenerator(this.renderer);
        const roomEnv = new RoomEnvironment();
        this.scene.environment = pmrem.fromScene(roomEnv, 0.04).texture;
        roomEnv.dispose();
        pmrem.dispose();
      } catch {
        // Continue cleanly without PMREM on restricted WebGL contexts
      }
    }

    this.camera = new THREE.PerspectiveCamera(60, 16 / 9, 0.1, 240);
    this.camera.position.copy(this.camPos);
    this.camera.lookAt(this.camLook);

    const skyGeo = new THREE.SphereGeometry(185, 24, 16);
    this.skyMat = new THREE.ShaderMaterial({
      side: THREE.BackSide,
      depthWrite: false,
      uniforms: {
        topColor: { value: new THREE.Color(this.worldCfg.skyTopHex) },
        bottomColor: { value: new THREE.Color(this.worldCfg.skyBottomHex) },
      },
      vertexShader: `
        varying vec3 vWorldPos;
        void main() {
          vec4 wp = modelMatrix * vec4(position, 1.0);
          vWorldPos = wp.xyz;
          gl_Position = projectionMatrix * viewMatrix * wp;
        }
      `,
      fragmentShader: `
        uniform vec3 topColor;
        uniform vec3 bottomColor;
        varying vec3 vWorldPos;
        void main() {
          float h = normalize(vWorldPos).y;
          float t = clamp(h * 1.4 + 0.15, 0.0, 1.0);
          gl_FragColor = vec4(mix(bottomColor, topColor, pow(t, 0.75)), 1.0);
        }
      `,
    });
    this.scene.add(new THREE.Mesh(skyGeo, this.skyMat));

    this.hemiLight = new THREE.HemisphereLight(
      this.worldCfg.hemiSkyHex,
      this.worldCfg.hemiGroundHex,
      0.8
    );
    this.scene.add(this.hemiLight);

    this.dirLight = new THREE.DirectionalLight(this.worldCfg.sunHex, 1.45);
    this.dirLight.position.set(14, 24, 12);
    this.dirLight.castShadow = !this.isSoftwareGl;
    this.dirLight.shadow.mapSize.set(1024, 1024);
    this.dirLight.shadow.camera.near = 2;
    this.dirLight.shadow.camera.far = 75;
    this.dirLight.shadow.camera.left = -18;
    this.dirLight.shadow.camera.right = 18;
    this.dirLight.shadow.camera.top = 18;
    this.dirLight.shadow.camera.bottom = -18;
    this.dirLight.shadow.bias = -0.0005;
    this.dirLight.shadow.normalBias = 0.02;
    this.scene.add(this.dirLight);

    this.rimLight = new THREE.DirectionalLight(0xffffff, 0.45);
    this.rimLight.position.set(-10, 8, -18);
    this.scene.add(this.rimLight);
  }

  private ensureWorldMaterials(worldId: WorldId): {
    trackMat: THREE.MeshStandardMaterial;
    groundMat: THREE.MeshStandardMaterial;
  } {
    let trackMat = this.worldTrackMats.get(worldId);
    let groundMat = this.worldGroundMats.get(worldId);
    if (!trackMat || !groundMat) {
      const w = WORLDS.find((item) => item.id === worldId) ?? WORLDS[0];
      const maxAniso = Math.min(4, this.renderer.capabilities.getMaxAnisotropy() || 1);
      const tTex = createTrackTexture(w, maxAniso);
      const gTex = createGroundTexture(w, maxAniso);
      this.worldTextures.push(tTex, gTex);

      trackMat = new THREE.MeshStandardMaterial({
        map: tTex,
        roughness: 0.72,
        metalness: 0.06,
      });
      groundMat = new THREE.MeshStandardMaterial({
        map: gTex,
        roughness: 0.88,
        metalness: 0.02,
      });
      this.worldTrackMats.set(worldId, trackMat);
      this.worldGroundMats.set(worldId, groundMat);
    }
    return { trackMat, groundMat };
  }

  private snapAtmosphereToWorld(cfg: WorldConfig): void {
    this.worldCfg = cfg;
    this.targetWorldCfg = cfg;
    this.skyMat.uniforms.topColor.value.set(cfg.skyTopHex);
    this.skyMat.uniforms.bottomColor.value.set(cfg.skyBottomHex);
    const fog = this.scene.fog as THREE.FogExp2;
    fog.color.set(cfg.fogHex);
    fog.density = cfg.fogDensity;
    this.dirLight.color.set(cfg.sunHex);
    this.hemiLight.color.set(cfg.hemiSkyHex);
    this.hemiLight.groundColor.set(cfg.hemiGroundHex);
  }

  private lerpAtmosphere(dt: number): void {
    const k = 1 - Math.exp(-3.2 * dt);
    _cTargetTop.set(this.targetWorldCfg.skyTopHex);
    _cTargetBot.set(this.targetWorldCfg.skyBottomHex);
    _cTargetFog.set(this.targetWorldCfg.fogHex);
    _cTargetSun.set(this.targetWorldCfg.sunHex);
    _cTargetHemiSky.set(this.targetWorldCfg.hemiSkyHex);
    _cTargetHemiGnd.set(this.targetWorldCfg.hemiGroundHex);

    this.skyMat.uniforms.topColor.value.lerp(_cTargetTop, k);
    this.skyMat.uniforms.bottomColor.value.lerp(_cTargetBot, k);
    const fog = this.scene.fog as THREE.FogExp2;
    fog.color.lerp(_cTargetFog, k);
    fog.density = THREE.MathUtils.lerp(fog.density, this.targetWorldCfg.fogDensity, k);
    this.dirLight.color.lerp(_cTargetSun, k);
    this.hemiLight.color.lerp(_cTargetHemiSky, k);
    this.hemiLight.groundColor.lerp(_cTargetHemiGnd, k);
  }

  private initPlayer(): void {
    this.scene.add(this.playerRoot);

    this.hoverboardRig = createHoverboardModel(this.hoverboardId);
    this.playerRoot.add(this.hoverboardRig.root);

    this.characterRig = createCharacterModel(this.characterId);
    this.characterRig.root.position.y = 0.14;
    this.playerRoot.add(this.characterRig.root);
    this.collectGhostMaterials();

    this.birdRig = createBirdModel();
    this.birdRig.root.visible = false;
    this.playerRoot.add(this.birdRig.root);

    const shadowTex = createContactShadowTexture();
    this.worldTextures.push(shadowTex);
    this.contactShadow = new THREE.Mesh(
      new THREE.PlaneGeometry(1.7, 2.2),
      new THREE.MeshBasicMaterial({
        map: shadowTex,
        transparent: true,
        depthWrite: false,
        opacity: 0.55,
      })
    );
    this.contactShadow.rotation.x = -Math.PI / 2;
    this.contactShadow.position.y = 0.03;
    this.scene.add(this.contactShadow);

    this.shieldSphere = new THREE.Mesh(
      new THREE.SphereGeometry(1.25, 20, 16),
      new THREE.MeshStandardMaterial({
        color: 0x34d399,
        emissive: 0x10b981,
        emissiveIntensity: 0.5,
        transparent: true,
        opacity: 0.3,
        roughness: 0.1,
        depthWrite: false,
      })
    );
    this.shieldSphere.position.y = 0.95;
    this.shieldSphere.visible = false;
    this.playerRoot.add(this.shieldSphere);

    this.magnetRing = new THREE.Mesh(
      new THREE.TorusGeometry(1.15, 0.055, 8, 28),
      new THREE.MeshStandardMaterial({
        color: 0xfb7185,
        emissive: 0xf43f5e,
        emissiveIntensity: 0.9,
        transparent: true,
        opacity: 0.75,
      })
    );
    this.magnetRing.rotation.x = Math.PI / 2;
    this.magnetRing.position.y = 0.55;
    this.magnetRing.visible = false;
    this.playerRoot.add(this.magnetRing);
  }

  private collectGhostMaterials(): void {
    this.ghostMaterials = [];
    const register = (obj: THREE.Object3D) => {
      obj.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const m = (child as THREE.Mesh).material;
          if (m instanceof THREE.MeshStandardMaterial) {
            this.ghostMaterials.push(m);
          }
        }
      });
    };
    register(this.characterRig.root);
    register(this.hoverboardRig.root);
  }

  private initParticles(): void {
    for (let i = 0; i < 64; i++) {
      const mat = new THREE.MeshBasicMaterial({
        color: 0xfbbf24,
        transparent: true,
        opacity: 0.9,
      });
      const mesh = new THREE.Mesh(this.particleGeo, mat);
      mesh.visible = false;
      this.scene.add(mesh);
      this.particles.push({
        mesh,
        vel: new THREE.Vector3(),
        life: 0,
        maxLife: 0.5,
        active: false,
      });
    }
  }

  private spawnBurst(pos: THREE.Vector3, colorHex: number, count: number, speed = 5.5): void {
    let spawned = 0;
    for (const p of this.particles) {
      if (p.active) continue;
      p.active = true;
      p.life = 0;
      p.maxLife = 0.35 + Math.random() * 0.25;
      p.mesh.visible = true;
      p.mesh.position.copy(pos);
      p.mesh.scale.setScalar(0.8 + Math.random() * 0.6);
      (p.mesh.material as THREE.MeshBasicMaterial).color.setHex(colorHex);
      (p.mesh.material as THREE.MeshBasicMaterial).opacity = 1;
      p.vel.set(
        (Math.random() - 0.5) * speed * 1.4,
        Math.random() * speed + 1.5,
        (Math.random() - 0.5) * speed * 1.2
      );
      spawned++;
      if (spawned >= count) break;
    }
  }

  public setCustomization(characterId: CharacterId, hoverboardId: HoverboardId): void {
    if (characterId !== this.characterId) {
      this.characterId = characterId;
      this.playerRoot.remove(this.characterRig.root);
      this.characterRig = createCharacterModel(characterId);
      this.characterRig.root.position.y = 0.14;
      this.playerRoot.add(this.characterRig.root);
    }
    if (hoverboardId !== this.hoverboardId) {
      this.hoverboardId = hoverboardId;
      this.playerRoot.remove(this.hoverboardRig.root);
      this.hoverboardRig = createHoverboardModel(hoverboardId);
      this.playerRoot.add(this.hoverboardRig.root);
    }
    this.collectGhostMaterials();
  }

  public setWorld(worldId: WorldId): void {
    const idx = WORLDS.findIndex((w) => w.id === worldId);
    if (idx < 0) return;
    this.spawningWorldIndex = idx;
    this.snapAtmosphereToWorld(WORLDS[idx]);
    this.rebuildAllChunks(this.phase === 'menu');
    this.emitHud();
  }

  private buildChunks(menuMode: boolean): void {
    for (let i = 0; i < CHUNK_COUNT; i++) {
      const group = new THREE.Group();
      const decorGroup = new THREE.Group();
      group.add(decorGroup);
      this.scene.add(group);

      const chunk: TrackChunk = {
        group,
        sStart: (i - 1) * CHUNK_LEN,
        roadMesh: null,
        groundMesh: null,
        obstacles: [],
        collectibles: [],
        decorGroup,
        animDecor: [],
        portal: null,
      };
      this.populateChunk(chunk, i - 1, menuMode);
      this.chunks.push(chunk);
    }
  }

  private rebuildAllChunks(menuMode: boolean): void {
    this.scrollZ = 0;
    this.chunkSerial = CHUNK_COUNT - 2;
    this.nextPowerUpChunk = 2;
    this.nextPortalChunk = PORTAL_INTERVAL_CHUNKS;

    this.chunks.forEach((chunk, i) => {
      const serial = i - 1;
      this.populateChunk(chunk, serial, menuMode);
    });
    this.positionAllChunks();
  }

  private disposeSubtree(obj: THREE.Object3D): void {
    obj.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        if (mesh.geometry && !mesh.geometry.userData?.sharedGeo) {
          mesh.geometry.dispose();
        }
        if (Array.isArray(mesh.material)) {
          mesh.material.forEach((mat) => {
            if (mat && !mat.userData?.sharedMat && mat !== this.coinMat && mat !== this.gemMat) {
              mat.dispose();
            }
          });
        } else if (
          mesh.material &&
          !mesh.material.userData?.sharedMat &&
          mesh.material !== this.coinMat &&
          mesh.material !== this.gemMat
        ) {
          mesh.material.dispose();
        }
      }
    });
  }

  private clearChunkEntities(chunk: TrackChunk): void {
    if (chunk.roadMesh) {
      chunk.group.remove(chunk.roadMesh);
      chunk.roadMesh.geometry.dispose();
      chunk.roadMesh = null;
    }
    if (chunk.groundMesh) {
      chunk.group.remove(chunk.groundMesh);
      chunk.groundMesh.geometry.dispose();
      chunk.groundMesh = null;
    }
    for (const o of chunk.obstacles) {
      chunk.group.remove(o.mesh);
      this.disposeSubtree(o.mesh);
    }
    for (const c of chunk.collectibles) {
      chunk.group.remove(c.mesh);
      this.disposeSubtree(c.mesh);
    }
    chunk.obstacles = [];
    chunk.collectibles = [];
    chunk.animDecor = [];
    chunk.portal = null;
    while (chunk.decorGroup.children.length > 0) {
      const child = chunk.decorGroup.children[0];
      chunk.decorGroup.remove(child);
      this.disposeSubtree(child);
    }
  }

  private populateChunk(chunk: TrackChunk, serial: number, menuMode: boolean): void {
    this.clearChunkEntities(chunk);
    const sStart = serial * CHUNK_LEN;
    chunk.sStart = sStart;

    const spawnWorld = WORLDS[this.spawningWorldIndex];
    const { trackMat: tMat, groundMat: gMat } = this.ensureWorldMaterials(spawnWorld.id);

    // Curved road & terrain geometry
    const { trackMesh, groundMesh } = buildCurvedRoadMeshes(
      sStart,
      CHUNK_LEN,
      12,
      tMat,
      gMat
    );
    chunk.roadMesh = trackMesh;
    chunk.groundMesh = groundMesh;
    chunk.group.add(trackMesh, groundMesh);

    // Roadside props, tiny plants, adorable animals & mountains positioned along the curved road!
    for (let side = -1; side <= 1; side += 2) {
      for (let slot = 0; slot < 2; slot++) {
        const sProp = sStart + 5 + slot * 11;
        const xOff = side * (7.2 + ((Math.abs(serial) + slot) % 3) * 2.4);
        const pt = trackPointInChunk(sStart, sProp, xOff, -0.05);
        const prop = buildWorldDecorProp(
          spawnWorld.id,
          Math.abs(serial) * 3 + slot + (side > 0 ? 1 : 0)
        );
        prop.position.set(pt.x, pt.y, pt.z);
        prop.rotation.y = -pt.angle + (side > 0 ? -0.35 : 0.35);
        chunk.decorGroup.add(prop);

        if (prop.userData.animType) {
          chunk.animDecor.push({
            obj: prop,
            baseY: pt.y,
            phase: Math.random() * Math.PI * 2,
            type: prop.userData.animType as string,
          });
        }
      }

      if (Math.abs(serial) % 2 === 0) {
        const sMtn = sStart + CHUNK_LEN * 0.5;
        const mPt = trackPointInChunk(sStart, sMtn, side * 26, -0.2);
        const mtn = buildBackgroundMountain(
          spawnWorld.id,
          Math.abs(serial) + (side > 0 ? 1 : 0)
        );
        mtn.position.set(mPt.x, mPt.y, mPt.z);
        chunk.decorGroup.add(mtn);
      }
    }

    // Bridges and Tunnels along curved segments!
    if (serial > 1) {
      if (serial % 6 === 3) {
        chunk.decorGroup.add(buildWorldBridgeSpan(spawnWorld.id, sStart, CHUNK_LEN));
      } else if (serial % 6 === 5) {
        chunk.decorGroup.add(buildWorldTunnel(spawnWorld.id, sStart, CHUNK_LEN));
      }
    }

    // World Transition Portal every PORTAL_INTERVAL_CHUNKS!
    if (!menuMode && serial >= this.nextPortalChunk) {
      const nextIdx = (this.spawningWorldIndex + 1) % WORLDS.length;
      const nextWorld = WORLDS[nextIdx];
      const portalS = sStart + CHUNK_LEN * 0.5;
      const pt = trackPointInChunk(sStart, portalS, 0);
      const portalMesh = createWorldPortalMesh(nextWorld);
      portalMesh.position.set(pt.x, pt.y, pt.z);
      portalMesh.rotation.y = -pt.angle;
      chunk.decorGroup.add(portalMesh);

      portalMesh.traverse((child) => {
        if (child.userData.animType === 'spin') {
          chunk.animDecor.push({
            obj: child,
            baseY: child.position.y,
            phase: Math.random() * Math.PI * 2,
            type: 'spin',
          });
        }
      });

      chunk.portal = {
        s: portalS,
        nextWorld,
        triggered: false,
      };
      // Advance spawningWorldIndex so subsequent chunks beyond the portal belong to the NEW world!
      this.spawningWorldIndex = nextIdx;
      this.nextPortalChunk = serial + PORTAL_INTERVAL_CHUNKS;
      // Give a clean celebratory coin trail right through the portal!
      this.spawnCoinLine(chunk, sStart, 0, sStart + 3, sStart + CHUNK_LEN - 3, 5, 0.95);
      return;
    }

    // Safe starter zone for menu or initial chunks
    if (menuMode || serial <= 1) {
      if (!menuMode && serial === 1) {
        this.spawnCoinLine(chunk, sStart, 0, sStart + 5, sStart + CHUNK_LEN - 5, 4, 0.95);
      }
      return;
    }

    // Fair, readable obstacle patterns aligned to curved road!
    const difficulty = Math.min(1, this.distance / 1200);
    const patternRoll = Math.random();
    const midS = sStart + CHUNK_LEN * 0.5;

    if (patternRoll < 0.28) {
      const lowLane = Math.floor(Math.random() * 3) - 1;
      this.addObstacle(chunk, spawnWorld.id, 'low', lowLane, midS);
      this.spawnCoinArc(chunk, sStart, lowLane, midS);

      const otherLanes = [-1, 0, 1].filter((l) => l !== lowLane);
      const tallLane = otherLanes[Math.floor(Math.random() * otherLanes.length)];
      if (Math.random() < 0.65 + difficulty * 0.25) {
        this.addObstacle(chunk, spawnWorld.id, 'tall', tallLane, midS + 4);
      }
    } else if (patternRoll < 0.54) {
      const archLane = Math.floor(Math.random() * 3) - 1;
      this.addObstacle(chunk, spawnWorld.id, 'high', archLane, midS);
      this.spawnCoinLine(chunk, sStart, archLane, midS - 4, midS + 4, 4, 0.68);

      if (Math.random() < 0.6) {
        const other = [-1, 0, 1].filter((l) => l !== archLane)[0];
        this.addObstacle(chunk, spawnWorld.id, 'tall', other, midS - 2);
      }
    } else if (patternRoll < 0.78) {
      const openLane = Math.floor(Math.random() * 3) - 1;
      for (const lane of [-1, 0, 1]) {
        if (lane !== openLane) {
          this.addObstacle(chunk, spawnWorld.id, 'tall', lane, midS);
        }
      }
      this.spawnCoinLine(chunk, sStart, openLane, midS - 6, midS + 6, 5, 0.95);
    } else {
      this.addObstacle(chunk, spawnWorld.id, 'moving', 0, midS);
      const coinLane = Math.random() < 0.5 ? -1 : 1;
      this.spawnCoinLine(chunk, sStart, coinLane, midS - 6, midS + 6, 4, 0.95);
    }

    // Spawn one of the 4 exact power-ups reliably every 3 chunks
    if (serial >= this.nextPowerUpChunk) {
      const pType = POWER_TYPES[(Math.floor(serial / 3) + Math.floor(Math.random() * 4)) % POWER_TYPES.length];
      const pLane = Math.floor(Math.random() * 3) - 1;
      const powerS = sStart + CHUNK_LEN - 4;
      const pt = trackPointInChunk(sStart, powerS, LANE_X[pLane + 1], 1.15);
      const powerMesh = createPowerUpMesh(pType);
      powerMesh.position.set(pt.x, pt.y, pt.z);
      chunk.group.add(powerMesh);
      chunk.collectibles.push({
        mesh: powerMesh,
        kind: 'powerup',
        powerType: pType,
        s: powerS,
        sStart,
        laneX: LANE_X[pLane + 1],
        baseY: pt.y,
        worldPos: new THREE.Vector3(),
        collected: false,
        attracted: false,
      });
      this.nextPowerUpChunk = serial + 3;
    } else if (Math.random() < 0.38) {
      const gLane = Math.floor(Math.random() * 3) - 1;
      const gemS = sStart + 4;
      const pt = trackPointInChunk(sStart, gemS, LANE_X[gLane + 1], 1.05);
      const gMesh = createGemMesh(this.gemGeo, this.gemMat);
      gMesh.position.set(pt.x, pt.y, pt.z);
      chunk.group.add(gMesh);
      chunk.collectibles.push({
        mesh: gMesh,
        kind: 'gem',
        s: gemS,
        sStart,
        laneX: LANE_X[gLane + 1],
        baseY: pt.y,
        worldPos: new THREE.Vector3(),
        collected: false,
        attracted: false,
      });
    }
  }

  private addObstacle(
    chunk: TrackChunk,
    worldId: WorldId,
    kind: ObstacleKind,
    lane: number,
    s: number
  ): void {
    const tpl = buildWorldObstacle(worldId, kind);
    const laneX = LANE_X[lane + 1];
    const pt = trackPointInChunk(chunk.sStart, s, laneX);
    tpl.mesh.position.set(pt.x, pt.y, pt.z);
    tpl.mesh.rotation.y = -pt.angle;
    chunk.group.add(tpl.mesh);
    chunk.obstacles.push({
      mesh: tpl.mesh,
      kind,
      s,
      sStart: chunk.sStart,
      baseLaneX: laneX,
      width: tpl.width,
      height: tpl.height,
      depth: tpl.depth,
      moveAmp: tpl.moveAmp ?? 0,
      moveSpeed: tpl.moveSpeed ?? 0,
      phaseOffset: Math.random() * Math.PI * 2,
      cleared: false,
    });
  }

  private spawnCoinLine(
    chunk: TrackChunk,
    sStart: number,
    lane: number,
    sBegin: number,
    sEnd: number,
    count: number,
    yOffset: number
  ): void {
    const lx = LANE_X[lane + 1];
    for (let i = 0; i < count; i++) {
      const t = count === 1 ? 0.5 : i / (count - 1);
      const s = sBegin + (sEnd - sBegin) * t;
      const pt = trackPointInChunk(sStart, s, lx, yOffset);
      const mesh = createCoinMesh(this.coinGeo, this.coinMat);
      mesh.position.set(pt.x, pt.y, pt.z);
      chunk.group.add(mesh);
      chunk.collectibles.push({
        mesh,
        kind: 'coin',
        s,
        sStart,
        laneX: lx,
        baseY: pt.y,
        worldPos: new THREE.Vector3(),
        collected: false,
        attracted: false,
      });
    }
  }

  private spawnCoinArc(
    chunk: TrackChunk,
    sStart: number,
    lane: number,
    centerS: number
  ): void {
    const lx = LANE_X[lane + 1];
    const offsets = [-3.2, -1.6, 0, 1.6, 3.2];
    offsets.forEach((ds, idx) => {
      const arc = Math.sin((idx / (offsets.length - 1)) * Math.PI);
      const yOffset = 0.95 + arc * 1.95;
      const s = centerS + ds;
      const pt = trackPointInChunk(sStart, s, lx, yOffset);
      const mesh = createCoinMesh(this.coinGeo, this.coinMat);
      mesh.position.set(pt.x, pt.y, pt.z);
      chunk.group.add(mesh);
      chunk.collectibles.push({
        mesh,
        kind: 'coin',
        s,
        sStart,
        laneX: lx,
        baseY: pt.y,
        worldPos: new THREE.Vector3(),
        collected: false,
        attracted: false,
      });
    });
  }

  private positionAllChunks(): void {
    const rx = roadCenterX(this.scrollZ);
    const ry = roadElevY(this.scrollZ);
    for (const c of this.chunks) {
      c.group.position.set(-rx, -ry, this.scrollZ - c.sStart);
    }
  }

  // ---- Public Gameplay Controls ----

  public startGame(startWorld?: WorldId): void {
    gameAudio.unlock();
    gameAudio.startMusic();
    if (startWorld) {
      const idx = WORLDS.findIndex((w) => w.id === startWorld);
      if (idx >= 0) {
        this.spawningWorldIndex = idx;
        this.snapAtmosphereToWorld(WORLDS[idx]);
      }
    } else {
      const idx = WORLDS.findIndex((w) => w.id === this.worldCfg.id);
      this.spawningWorldIndex = idx >= 0 ? idx : 0;
      this.snapAtmosphereToWorld(WORLDS[this.spawningWorldIndex]);
    }

    this.phase = 'playing';
    this.speed = BASE_SPEED;
    this.distance = 0;
    this.score = 0;
    this.runCoins = 0;
    this.powerupsCollected = 0;
    this.targetLane = 0;
    this.playerLaneX = 0;
    this.prevPlayerLaneX = 0;
    this.playerY = 0;
    this.vy = 0;
    this.isGrounded = true;
    this.slideTimer = 0;
    this.jumpBufferTimer = 0;
    this.graceInvulnTimer = 0;
    this.hitstopTimer = 0;
    this.cameraShake = 0;
    this.powerTimers = { magnet: 0, invisibility: 0, bird: 0, shield: 0 };
    this.pickupBanner = null;
    this.bannerTimer = 0;
    this.setBirdMode(false);
    this.setGhostVisual(false);
    this.shieldSphere.visible = false;
    this.magnetRing.visible = false;

    this.rebuildAllChunks(false);
    this.emitHud();
  }

  public pauseGame(): void {
    if (this.phase !== 'playing') return;
    this.phase = 'paused';
    gameAudio.stopMusic();
    this.emitHud();
  }

  public resumeGame(): void {
    if (this.phase !== 'paused') return;
    this.phase = 'playing';
    this.lastTimestamp = performance.now();
    gameAudio.startMusic();
    this.emitHud();
  }

  public returnToMenu(): void {
    this.phase = 'menu';
    gameAudio.stopMusic();
    this.targetLane = 0;
    this.playerLaneX = 0;
    this.playerY = 0;
    this.vy = 0;
    this.isGrounded = true;
    this.slideTimer = 0;
    this.powerTimers = { magnet: 0, invisibility: 0, bird: 0, shield: 0 };
    this.setBirdMode(false);
    this.setGhostVisual(false);
    this.shieldSphere.visible = false;
    this.magnetRing.visible = false;
    const idx = WORLDS.findIndex((w) => w.id === this.worldCfg.id);
    this.spawningWorldIndex = idx >= 0 ? idx : 0;
    this.rebuildAllChunks(true);
    this.emitHud();
  }

  public moveLeft(): void {
    if (this.phase !== 'playing') return;
    if (this.targetLane > -1) {
      this.targetLane--;
      gameAudio.playLaneSwitch();
    }
  }

  public moveRight(): void {
    if (this.phase !== 'playing') return;
    if (this.targetLane < 1) {
      this.targetLane++;
      gameAudio.playLaneSwitch();
    }
  }

  public jump(): void {
    if (this.phase !== 'playing') return;
    if (this.powerTimers.bird > 0) return;
    this.jumpBufferTimer = 0.14;
  }

  public slide(): void {
    if (this.phase !== 'playing') return;
    if (this.powerTimers.bird > 0) return;
    if (!this.isGrounded) {
      this.vy = Math.min(this.vy, -22);
    }
    this.slideTimer = 0.72;
    gameAudio.playSlide();
  }

  private executeJump(): void {
    this.vy = 14.2;
    this.isGrounded = false;
    this.slideTimer = 0;
    this.jumpBufferTimer = 0;
    gameAudio.playJump();
  }

  private setBirdMode(active: boolean): void {
    this.characterRig.root.visible = !active;
    this.hoverboardRig.root.visible = !active;
    this.birdRig.root.visible = active;
  }

  private setGhostVisual(active: boolean): void {
    for (const m of this.ghostMaterials) {
      m.transparent = active;
      m.opacity = active ? 0.42 : 1.0;
      m.emissive.setHex(active ? 0x22d3ee : 0x000000);
      m.emissiveIntensity = active ? 0.35 : 0;
    }
  }

  private activatePowerUp(type: PowerUpType): void {
    const meta = POWERUP_META[type];
    const wasBird = this.powerTimers.bird > 0;
    this.powerTimers[type] = meta.duration;
    this.powerupsCollected++;

    this.bannerSeq++;
    this.pickupBanner = {
      label: `${meta.label} Active!`,
      colorHex: meta.colorHex,
      key: this.bannerSeq,
    };
    this.bannerTimer = 2.0;

    gameAudio.playPowerUp(type);
    this.spawnBurst(
      _v1.copy(this.playerRoot.position).add(new THREE.Vector3(0, 1.0, 0)),
      new THREE.Color(meta.colorHex).getHex(),
      18,
      7
    );

    if (type === 'bird' && !wasBird) {
      this.setBirdMode(true);
      this.slideTimer = 0;
    } else if (type === 'invisibility') {
      this.setGhostVisual(true);
    } else if (type === 'shield') {
      this.shieldSphere.visible = true;
    } else if (type === 'magnet') {
      this.magnetRing.visible = true;
    }

    this.emitHud();
  }

  private triggerGameOver(): void {
    this.phase = 'gameover';
    gameAudio.stopMusic();
    gameAudio.playCrash();
    this.cameraShake = 0.65;
    this.spawnBurst(
      _v1.copy(this.playerRoot.position).add(new THREE.Vector3(0, 0.9, 0)),
      0xfb7185,
      24,
      8
    );
    this.emitHud();
    this.callbacks.onGameOver({
      worldId: this.worldCfg.id,
      distance: Math.floor(this.distance),
      score: Math.floor(this.score),
      coins: this.runCoins,
      powerupsCollected: this.powerupsCollected,
    });
  }

  private tick = (): void => {
    if (this.disposed) return;

    const now = performance.now();
    const rawDt = (now - this.lastTimestamp) / 1000;
    this.lastTimestamp = now;
    const dt = Math.min(Math.max(rawDt, 0.001), 0.05);

    this.update(dt);
    this.renderer.render(this.scene, this.camera);

    if (this.isSoftwareGl) {
      this.afterDraw(this.tick);
    } else {
      this.frameId = requestAnimationFrame(this.tick);
    }
  };

  private afterDraw(cb: () => void): void {
    const gl = this.renderer.getContext() as WebGL2RenderingContext | WebGLRenderingContext;
    if (!gl || typeof (gl as WebGL2RenderingContext).fenceSync !== 'function') {
      this.frameId = window.setTimeout(cb, 80);
      return;
    }
    const gl2 = gl as WebGL2RenderingContext;
    const sync = gl2.fenceSync(gl2.SYNC_GPU_COMMANDS_COMPLETE, 0);
    gl2.flush();
    if (!sync) {
      this.frameId = window.setTimeout(cb, 80);
      return;
    }
    const poll = () => {
      if (this.disposed) return;
      try {
        const state = gl2.getSyncParameter(sync, gl2.SYNC_STATUS);
        if (state === gl2.UNSIGNALED) {
          this.frameId = window.setTimeout(poll, 5);
        } else {
          gl2.deleteSync(sync);
          this.frameId = window.setTimeout(cb, 80);
        }
      } catch {
        this.frameId = window.setTimeout(cb, 80);
      }
    };
    this.frameId = window.setTimeout(poll, 5);
  }

  private update(dt: number): void {
    if (this.phase === 'paused') return;

    if (this.hitstopTimer > 0) {
      this.hitstopTimer -= dt;
      this.cameraShake = Math.max(0, this.cameraShake - dt * 1.4);
      return;
    }

    this.elapsed += dt;
    this.updateParticles(dt);
    this.lerpAtmosphere(dt);

    if (this.phase === 'gameover') {
      this.cameraShake = Math.max(0, this.cameraShake - dt * 1.8);
      this.updateCamera(dt);
      return;
    }

    const activeSpeed = this.phase === 'menu' ? 11.5 : this.speed;
    this.scrollZ += activeSpeed * dt;

    // Recycle chunks that have passed behind the camera
    for (const c of this.chunks) {
      const worldZ = this.scrollZ - c.sStart;
      if (worldZ > CHUNK_LEN * 2.1) {
        this.chunkSerial++;
        this.populateChunk(c, this.chunkSerial, this.phase === 'menu');
      }
    }
    this.positionAllChunks();
    this.animateDecor();

    if (this.phase === 'menu') {
      this.playerLaneX = Math.sin(this.elapsed * 0.7) * 1.0;
      this.playerY = 0;
      this.animatePlayer(dt, false);
      this.updateCamera(dt);
      return;
    }

    // ---- Playing Phase ----
    this.distance += activeSpeed * dt * 0.72;
    this.score += activeSpeed * dt * 1.6;
    this.speed = Math.min(MAX_SPEED, BASE_SPEED + this.distance * 0.011);

    if (this.graceInvulnTimer > 0) this.graceInvulnTimer = Math.max(0, this.graceInvulnTimer - dt);
    if (this.cameraShake > 0) this.cameraShake = Math.max(0, this.cameraShake - dt * 2.2);
    if (this.bannerTimer > 0) {
      this.bannerTimer -= dt;
      if (this.bannerTimer <= 0) this.pickupBanner = null;
    }

    // Check Portal Transitions!
    for (const c of this.chunks) {
      if (c.portal && !c.portal.triggered && this.scrollZ >= c.portal.s) {
        c.portal.triggered = true;
        this.worldCfg = c.portal.nextWorld;
        this.targetWorldCfg = c.portal.nextWorld;
        this.graceInvulnTimer = Math.max(this.graceInvulnTimer, 0.9);
        gameAudio.playPortalTransition();
        this.spawnBurst(
          _v1.copy(this.playerRoot.position).add(new THREE.Vector3(0, 1.4, -1)),
          new THREE.Color(c.portal.nextWorld.accentHex).getHex(),
          28,
          9
        );
        this.pickupBanner = {
          label: `Entering ${c.portal.nextWorld.name}!`,
          colorHex: c.portal.nextWorld.accentHex,
          key: ++this.bannerSeq,
        };
        this.bannerTimer = 2.6;
        this.emitHud();
      }
    }

    // Power-up countdowns
    let powerChanged = false;
    for (const pt of POWER_TYPES) {
      if (this.powerTimers[pt] > 0) {
        this.powerTimers[pt] = Math.max(0, this.powerTimers[pt] - dt);
        if (this.powerTimers[pt] === 0) {
          powerChanged = true;
          if (pt === 'bird') {
            this.setBirdMode(false);
            this.graceInvulnTimer = 1.1;
            this.vy = -4;
            this.isGrounded = false;
          } else if (pt === 'invisibility') {
            this.setGhostVisual(false);
          } else if (pt === 'shield') {
            this.shieldSphere.visible = false;
          } else if (pt === 'magnet') {
            this.magnetRing.visible = false;
          }
        }
      }
    }

    if (this.powerTimers.bird > 0) {
      this.birdSpawnAccum += dt;
      if (this.birdSpawnAccum > 0.22) {
        this.birdSpawnAccum = 0;
        this.spawnBurst(
          _v1.copy(this.playerRoot.position).add(new THREE.Vector3(0, 0.3, 0.6)),
          0xfde047,
          2,
          2.2
        );
      }
    }

    // Lane damping
    this.prevPlayerLaneX = this.playerLaneX;
    const desiredX = LANE_X[this.targetLane + 1];
    this.playerLaneX = THREE.MathUtils.damp(this.playerLaneX, desiredX, 15, dt);

    // Vertical physics
    if (this.powerTimers.bird > 0) {
      this.playerY = THREE.MathUtils.damp(this.playerY, 4.3, 7.5, dt);
      this.vy = 0;
      this.isGrounded = false;
    } else {
      if (this.jumpBufferTimer > 0) {
        this.jumpBufferTimer -= dt;
        if (this.isGrounded) {
          this.executeJump();
        }
      }
      if (!this.isGrounded) {
        this.vy -= 36 * dt;
        this.playerY += this.vy * dt;
        if (this.playerY <= 0) {
          this.playerY = 0;
          this.vy = 0;
          this.isGrounded = true;
        }
      }
    }

    if (this.slideTimer > 0) {
      this.slideTimer = Math.max(0, this.slideTimer - dt);
    }

    // Hoverboard thruster particles
    if (this.powerTimers.bird <= 0 && Math.random() < 0.48) {
      this.spawnBurst(
        _v1.copy(this.playerRoot.position).add(
          new THREE.Vector3((Math.random() - 0.5) * 0.35, 0.12, 0.85)
        ),
        new THREE.Color(this.worldCfg.accentHex).getHex(),
        1,
        1.5
      );
    }

    this.animatePlayer(dt, true);
    this.updateObstaclesAndCollectibles(dt);
    this.updateCamera(dt);

    this.hudEmitAccum += dt;
    if (powerChanged || this.hudEmitAccum >= 0.08) {
      this.hudEmitAccum = 0;
      this.emitHud();
    }
  }

  private animateDecor(): void {
    for (const c of this.chunks) {
      for (const d of c.animDecor) {
        if (d.type === 'hop') {
          d.obj.position.y = d.baseY + Math.abs(Math.sin(this.elapsed * 4.5 + d.phase)) * 0.45;
        } else if (d.type === 'swim') {
          d.obj.position.y = d.baseY + Math.sin(this.elapsed * 2.6 + d.phase) * 0.35;
        } else if (d.type === 'spin') {
          d.obj.rotation.y = this.elapsed * 2.4 + d.phase;
        }
      }
    }
  }

  private animatePlayer(dt: number, activeRun: boolean): void {
    const roadAngle = roadAngleAt(this.scrollZ);
    const cosA = Math.cos(roadAngle);
    const sinA = Math.sin(roadAngle);
    const hoverBob = Math.sin(this.elapsed * 6.5) * 0.055;

    const worldX = this.playerLaneX * cosA;
    const worldZ = this.playerLaneX * sinA;

    const vx = (this.playerLaneX - this.prevPlayerLaneX) / Math.max(dt, 0.001);
    const bankRoll = THREE.MathUtils.clamp(-vx * 0.045 - roadAngle * 0.32, -0.42, 0.42);
    const yaw = -roadAngle + THREE.MathUtils.clamp(-vx * 0.025, -0.25, 0.25);

    this.playerRoot.position.set(worldX, this.playerY + hoverBob, worldZ);
    this.playerRoot.rotation.order = 'YXZ';
    this.playerRoot.rotation.y = THREE.MathUtils.damp(this.playerRoot.rotation.y, yaw, 14, dt);
    this.playerRoot.rotation.z = THREE.MathUtils.damp(this.playerRoot.rotation.z, bankRoll, 14, dt);

    // Contact shadow grounded directly beneath player along road surface
    this.contactShadow.position.set(worldX, 0.03, worldZ);
    this.contactShadow.rotation.y = -roadAngle;
    const shadowScale = Math.max(0.35, 1 - this.playerY * 0.12);
    this.contactShadow.scale.setScalar(shadowScale);
    (this.contactShadow.material as THREE.MeshBasicMaterial).opacity = 0.5 * shadowScale;

    if (this.powerTimers.bird > 0) {
      const flap = Math.sin(this.elapsed * 18) * 0.85;
      this.birdRig.leftWing.rotation.z = flap;
      this.birdRig.rightWing.rotation.z = -flap;
      this.birdRig.body.position.y = Math.sin(this.elapsed * 7) * 0.1;
      this.birdRig.tailFeathers.rotation.x = Math.sin(this.elapsed * 10) * 0.15;
    } else {
      const targetPitch = !this.isGrounded
        ? THREE.MathUtils.clamp(this.vy * 0.024, -0.28, 0.32)
        : this.slideTimer > 0
          ? 0.16
          : 0;
      this.hoverboardRig.root.rotation.x = THREE.MathUtils.damp(
        this.hoverboardRig.root.rotation.x,
        targetPitch,
        12,
        dt
      );
      this.hoverboardRig.glowRing.rotation.z += dt * 4;
      const flamePulse = 0.85 + Math.sin(this.elapsed * 28) * 0.25;
      for (const fl of this.hoverboardRig.thrusterFlames) {
        fl.scale.set(1, flamePulse * (activeRun ? 1.15 : 0.7), 1);
      }

      const isSliding = this.slideTimer > 0 && this.isGrounded;
      const targetScaleY = isSliding ? 0.56 : 1.0;
      const targetCharPitch = isSliding ? -0.58 : !this.isGrounded ? -0.14 : 0.06;
      this.characterRig.bodyGroup.scale.y = THREE.MathUtils.damp(
        this.characterRig.bodyGroup.scale.y,
        targetScaleY,
        16,
        dt
      );
      this.characterRig.bodyGroup.rotation.x = THREE.MathUtils.damp(
        this.characterRig.bodyGroup.rotation.x,
        targetCharPitch,
        14,
        dt
      );

      this.characterRig.tail.rotation.y = Math.sin(this.elapsed * 7.5) * 0.32;
      this.characterRig.scarfTail.rotation.x = Math.sin(this.elapsed * 13) * 0.18;
      this.characterRig.leftEar.rotation.x = Math.sin(this.elapsed * 6) * 0.08;
      this.characterRig.rightEar.rotation.x = -Math.sin(this.elapsed * 6) * 0.08;
      const armWave = Math.sin(this.elapsed * 5.2) * 0.12;
      this.characterRig.leftArm.rotation.z = 0.55 + armWave;
      this.characterRig.rightArm.rotation.z = -0.55 - armWave;
    }

    if (this.shieldSphere.visible) {
      this.shieldSphere.rotation.y += dt * 1.5;
      this.shieldSphere.scale.setScalar(1 + Math.sin(this.elapsed * 5) * 0.04);
    }
    if (this.magnetRing.visible) {
      this.magnetRing.rotation.z += dt * 4.5;
    }
  }

  private updateObstaclesAndCollectibles(dt: number): void {
    const isBird = this.powerTimers.bird > 0;
    const isInvisible = this.powerTimers.invisibility > 0;
    const hasMagnet = this.powerTimers.magnet > 0;
    const isSliding = this.slideTimer > 0 && this.isGrounded;

    const playerBottom = this.playerY;
    const playerTop = this.playerY + (isSliding ? 0.88 : 1.72);
    const playerRadiusX = 0.52;
    const playerRadiusZ = 0.58;

    const baseScrollX = roadCenterX(this.scrollZ);
    const baseScrollY = roadElevY(this.scrollZ);

    for (const chunk of this.chunks) {
      // Obstacles in track-space (s, laneX)
      for (const obs of chunk.obstacles) {
        if (obs.cleared) continue;

        let obsLaneX = obs.baseLaneX;
        if (obs.kind === 'moving') {
          obsLaneX = Math.sin(this.elapsed * obs.moveSpeed + obs.phaseOffset) * obs.moveAmp;
          const pt = trackPointInChunk(obs.sStart, obs.s, obsLaneX);
          obs.mesh.position.set(pt.x, pt.y, pt.z);
          obs.mesh.rotation.y = -pt.angle + this.elapsed * 2.5;
        }

        const ds = obs.s - this.scrollZ;
        if (Math.abs(ds) > 2.2) continue;

        if (isBird || isInvisible || this.graceInvulnTimer > 0) continue;

        const zOverlap = Math.abs(ds) < obs.depth * 0.5 + playerRadiusZ;
        const xOverlap = Math.abs(this.playerLaneX - obsLaneX) < obs.width * 0.44 + playerRadiusX;
        if (!zOverlap || !xOverlap) continue;

        let hit = false;
        if (obs.kind === 'low') {
          if (playerBottom < obs.height - 0.12) hit = true;
        } else if (obs.kind === 'high') {
          if (playerTop > 1.18) hit = true;
        } else {
          if (playerBottom < obs.height) hit = true;
        }

        if (hit) {
          if (this.powerTimers.shield > 0) {
            this.powerTimers.shield = 0;
            this.shieldSphere.visible = false;
            this.graceInvulnTimer = 1.2;
            this.hitstopTimer = 0.05;
            this.cameraShake = 0.45;
            obs.cleared = true;
            obs.mesh.visible = false;
            gameAudio.playShieldBreak();
            this.spawnBurst(
              _v1.copy(this.playerRoot.position).add(new THREE.Vector3(0, 1.0, 0)),
              0x34d399,
              20,
              8
            );
            this.pickupBanner = {
              label: 'Shield Saved You!',
              colorHex: '#34D399',
              key: ++this.bannerSeq,
            };
            this.bannerTimer = 1.6;
            this.emitHud();
          } else {
            this.triggerGameOver();
            return;
          }
        }
      }

      // Collectibles
      for (const col of chunk.collectibles) {
        if (col.collected) continue;

        col.mesh.rotation.y += dt * (col.kind === 'powerup' ? 2.6 : 3.2);
        const bob = Math.sin(this.elapsed * 4 + col.s) * 0.12;

        if (!col.attracted) {
          const pt = trackPointInChunk(col.sStart, col.s, col.laneX);
          col.worldPos.set(
            pt.x - baseScrollX,
            col.baseY + bob - baseScrollY,
            this.scrollZ - col.s
          );
        }

        if (hasMagnet && (col.kind === 'coin' || col.kind === 'gem')) {
          _v2.copy(this.playerRoot.position).add(new THREE.Vector3(0, 0.9, 0));
          const distSq = col.worldPos.distanceToSquared(_v2);
          if (distSq < 15 * 15) {
            col.attracted = true;
            col.worldPos.lerp(_v2, 1 - Math.exp(-13 * dt));
            col.mesh.position.set(
              col.worldPos.x + baseScrollX,
              col.worldPos.y + baseScrollY,
              col.worldPos.z - (this.scrollZ - col.sStart)
            );
          } else {
            col.mesh.position.y = col.baseY + bob;
          }
        } else {
          col.mesh.position.y = col.baseY + bob;
        }

        const ds = col.s - this.scrollZ;
        const dx = col.attracted
          ? Math.abs(col.worldPos.x - this.playerRoot.position.x)
          : Math.abs(col.laneX - this.playerLaneX);
        const dz = col.attracted ? Math.abs(col.worldPos.z - this.playerRoot.position.z) : Math.abs(ds);
        const dy = Math.abs(col.worldPos.y - (this.playerRoot.position.y + 0.9));

        const pickupRadius = col.kind === 'powerup' ? 1.15 : 1.05;
        const pickupHeight = isBird ? 5.0 : 1.45;

        if (dx < pickupRadius && dz < 1.25 && dy < pickupHeight) {
          col.collected = true;
          col.mesh.visible = false;

          if (col.kind === 'coin') {
            this.runCoins += 1;
            this.score += 10;
            gameAudio.playCoin(false);
            this.spawnBurst(col.worldPos, 0xfbbf24, 6, 3.8);
          } else if (col.kind === 'gem') {
            this.runCoins += 5;
            this.score += 50;
            gameAudio.playCoin(true);
            this.spawnBurst(col.worldPos, 0x38bdf8, 12, 5.2);
          } else if (col.kind === 'powerup' && col.powerType) {
            this.activatePowerUp(col.powerType);
          }
        }
      }
    }
  }

  private updateParticles(dt: number): void {
    for (const p of this.particles) {
      if (!p.active) continue;
      p.life += dt;
      if (p.life >= p.maxLife) {
        p.active = false;
        p.mesh.visible = false;
        continue;
      }
      p.vel.y -= 9.5 * dt;
      p.mesh.position.addScaledVector(p.vel, dt);
      const t = 1 - p.life / p.maxLife;
      (p.mesh.material as THREE.MeshBasicMaterial).opacity = t;
      p.mesh.scale.setScalar(t * 1.1);
    }
  }

  private updateCamera(dt: number): void {
    const isBird = this.powerTimers.bird > 0;
    const targetFov = this.phase === 'playing'
      ? 58 + ((this.speed - BASE_SPEED) / (MAX_SPEED - BASE_SPEED)) * 11 + (isBird ? 5 : 0)
      : 54;
    this.camera.fov = THREE.MathUtils.damp(this.camera.fov, targetFov, 6, dt);
    this.camera.updateProjectionMatrix();

    const baseX = roadCenterX(this.scrollZ);
    const baseY = roadElevY(this.scrollZ);

    // Follow road tangent behind player & look along curve ahead!
    const backS = this.scrollZ - (this.phase === 'menu' ? 6.4 : 7.6);
    const backX = roadCenterX(backS) - baseX + this.playerLaneX * 0.55;
    const backY = roadElevY(backS) - baseY + (this.phase === 'menu' ? 3.55 : 4.25 + this.playerY * 0.65);
    const backZ = this.scrollZ - backS;

    this.camPos.x = THREE.MathUtils.damp(this.camPos.x, backX, 8, dt);
    this.camPos.y = THREE.MathUtils.damp(this.camPos.y, backY, 8, dt);
    this.camPos.z = THREE.MathUtils.damp(this.camPos.z, backZ, 8, dt);

    this.camera.position.copy(this.camPos);
    if (this.cameraShake > 0) {
      this.camera.position.x += (Math.random() - 0.5) * this.cameraShake * 0.7;
      this.camera.position.y += (Math.random() - 0.5) * this.cameraShake * 0.5;
    }

    const lookS = this.scrollZ + 12.5;
    const lookX = roadCenterX(lookS) - baseX + this.playerLaneX * 0.35;
    const lookY = roadElevY(lookS) - baseY + (this.phase === 'menu' ? 1.25 : 1.4 + this.playerY * 0.55);
    const lookZ = this.scrollZ - lookS;

    this.camLook.x = THREE.MathUtils.damp(this.camLook.x, lookX, 8, dt);
    this.camLook.y = THREE.MathUtils.damp(this.camLook.y, lookY, 8, dt);
    this.camLook.z = THREE.MathUtils.damp(this.camLook.z, lookZ, 8, dt);
    this.camera.lookAt(this.camLook);
  }

  private getNextPortalMeters(): number {
    let minS = Infinity;
    for (const c of this.chunks) {
      if (c.portal && !c.portal.triggered && c.portal.s > this.scrollZ) {
        if (c.portal.s < minS) minS = c.portal.s;
      }
    }
    if (minS === Infinity) {
      const nextPortalS = this.nextPortalChunk * CHUNK_LEN + CHUNK_LEN * 0.5;
      return Math.max(0, Math.round((nextPortalS - this.scrollZ) * 0.72));
    }
    return Math.max(0, Math.round((minS - this.scrollZ) * 0.72));
  }

  private emitHud(): void {
    const activePowers: ActivePowerUpState[] = [];
    for (const pt of POWER_TYPES) {
      if (this.powerTimers[pt] > 0) {
        activePowers.push({
          type: pt,
          remaining: this.powerTimers[pt],
          duration: POWERUP_META[pt].duration,
        });
      }
    }
    this.callbacks.onHudUpdate({
      phase: this.phase,
      worldId: this.worldCfg.id,
      distance: Math.floor(this.distance),
      score: Math.floor(this.score),
      runCoins: this.runCoins,
      speed: Math.round(this.speed),
      activePowers,
      pickupBanner: this.pickupBanner,
      nextPortalMeters: this.getNextPortalMeters(),
      newBest: false,
    });
  }

  private handleResize(): void {
    const w = Math.max(1, this.container.clientWidth || window.innerWidth || 800);
    const h = Math.max(1, this.container.clientHeight || window.innerHeight || 600);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }

  public dispose(): void {
    this.disposed = true;
    cancelAnimationFrame(this.frameId);
    clearTimeout(this.frameId);
    window.removeEventListener('resize', this.boundResize);
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;
    gameAudio.stopMusic();

    for (const tex of this.worldTextures) tex.dispose();
    for (const m of this.worldTrackMats.values()) m.dispose();
    for (const m of this.worldGroundMats.values()) m.dispose();
    this.coinGeo.dispose();
    this.coinMat.dispose();
    this.gemGeo.dispose();
    this.gemMat.dispose();
    this.particleGeo.dispose();

    this.scene.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        const m = obj as THREE.Mesh;
        m.geometry?.dispose();
        if (Array.isArray(m.material)) {
          m.material.forEach((mat) => {
            if (!mat.userData?.sharedMat) mat.dispose();
          });
        } else if (m.material && !m.material.userData?.sharedMat) {
          m.material.dispose();
        }
      }
    });
    this.renderer.dispose();
  }
}
