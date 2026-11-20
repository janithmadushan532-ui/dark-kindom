import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Coins,
  FastForward,
  Gauge,
  Heart,
  Maximize2,
  Minimize2,
  Pause,
  PauseCircle,
  Play,
  RotateCcw,
  Shield,
  Skull,
  Sparkles,
  Star,
  Trash2,
  Waves,
  X,
  Zap,
} from 'lucide-react';
import { dkAudio } from '../audio';
import {
  computeViewportTransform,
  DarkKingdomEngine,
  getTowerEffectiveStats,
  getWeaponCostForLevel,
  ViewportTransform,
} from '../engine';
import { ENEMY_CLASS_SI, SCI_FI_ABILITY_SI, TARGETING_SI } from '../localization/siLabels';
import { computeStarsFromBattle } from '../storage';
import { BattleSnapshot, EnemySpeedMultiplier, LevelConfig, McqUnitId, SaveData, WeaponId } from '../types';
import { WEAPON_MAP } from '../weapons';
import { SmartWeaponShopModal } from './SmartWeaponShopModal';
import { WeaponArtwork } from './WeaponArtwork';

const ENEMY_SPEED_OPTIONS: {
  value: EnemySpeedMultiplier;
  label: string;
  shortLabel: string;
  title: string;
  icon: 'slow' | 'normal' | 'fast' | 'max';
}[] = [
  { value: 0.5, label: '0.5x', shortLabel: 'මන්ද', title: 'මන්දගාමී (0.5x)', icon: 'slow' },
  { value: 1, label: '1.0x', shortLabel: 'සාමා', title: 'සාමාන්‍ය (1.0x)', icon: 'normal' },
  { value: 1.5, label: '1.5x', shortLabel: 'වේග', title: 'වේගවත් (1.5x)', icon: 'fast' },
  { value: 2, label: '2.0x', shortLabel: 'අධි', title: 'අධිවේගී (2.0x)', icon: 'max' },
];

interface BattlefieldProps {
  level: LevelConfig;
  save: SaveData;
  onExitToMap: () => void;
  onLevelVictory: (payload: {
    levelId: number;
    stars: 1 | 2 | 3;
    score: number;
    kills: number;
    bossesSlain: number;
    bonusCoinsEarned: number;
    xpEarned: number;
  }) => void;
  onLevelDefeatStats: (kills: number) => void;
  onMarkMcqShown?: (unitId: McqUnitId, questionId: string, poolIds: string[]) => void;
  onRecordMcqAnswer?: (
    questionId: string,
    isCorrect: boolean,
    resetHistory: boolean,
    poolIds?: string[]
  ) => void;
  onOpenUnitSelect?: () => void;
  onNextLevel?: (nextLevelId: number) => void;
}

export const Battlefield: React.FC<BattlefieldProps> = ({
  level,
  save,
  onExitToMap,
  onLevelVictory,
  onLevelDefeatStats,
  onMarkMcqShown,
  onRecordMcqAnswer,
  onOpenUnitSelect,
  onNextLevel,
}) => {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<DarkKingdomEngine | null>(null);
  const viewportRef = useRef<ViewportTransform>(computeViewportTransform(1280, 720, 14, 16));
  const victoryReportedRef = useRef(false);
  const defeatReportedRef = useRef(false);

  const [snap, setSnap] = useState<BattleSnapshot | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [unlockBanner, setUnlockBanner] = useState<{ weaponName: string } | null>(null);
  const [confirmReplayOpen, setConfirmReplayOpen] = useState(false);
  const [runKey, setRunKey] = useState(0);
  const isFullscreenRef = useRef(false);
  const isRestartingRef = useRef(false);
  const enemySpeedRef = useRef<EnemySpeedMultiplier>(1);
  const wasPlayingBeforeReplayConfirmRef = useRef(false);
  const wasClearedBeforeRunRef = useRef((save.levelStars[level.id] ?? 0) > 0);

  useEffect(() => {
    if (!unlockBanner) return;
    const timer = window.setTimeout(() => setUnlockBanner(null), 3200);
    return () => window.clearTimeout(timer);
  }, [unlockBanner]);

  useEffect(() => {
    isFullscreenRef.current = isFullscreen;
  }, [isFullscreen]);

  useEffect(() => {
    const syncFullscreen = () => {
      const active = Boolean(document.fullscreenElement);
      isFullscreenRef.current = active;
      setIsFullscreen(active);
    };
    document.addEventListener('fullscreenchange', syncFullscreen);
    return () => {
      document.removeEventListener('fullscreenchange', syncFullscreen);
    };
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
        isFullscreenRef.current = false;
        setIsFullscreen(false);
      } else {
        const target = stageRef.current ?? document.documentElement;
        if (typeof target.requestFullscreen === 'function') {
          await target.requestFullscreen();
          isFullscreenRef.current = true;
          setIsFullscreen(true);
        } else {
          setIsFullscreen((prev) => {
            isFullscreenRef.current = !prev;
            return !prev;
          });
        }
      }
    } catch {
      // Fallback for restricted preview iframes that disallow native Fullscreen API
      setIsFullscreen((prev) => {
        isFullscreenRef.current = !prev;
        return !prev;
      });
    }
  };

  useEffect(() => {
    let disposed = false;
    isRestartingRef.current = false;
    victoryReportedRef.current = false;
    defeatReportedRef.current = false;
    wasPlayingBeforeReplayConfirmRef.current = false;
    setConfirmReplayOpen(false);
    setUnlockBanner(null);
    wasClearedBeforeRunRef.current = (save.levelStars[level.id] ?? 0) > 0;

    const engine = new DarkKingdomEngine(level, {
      graphics: save.graphics,
      initialEnemySpeed: enemySpeedRef.current,
      onStatusChange: (nextSnap) => {
        if (!disposed && engineRef.current === engine) {
          setSnap(nextSnap);
        }
      },
    });
    engineRef.current = engine;
    setSnap(engine.getSnapshot());
    dkAudio.unlock();

    let rafId = 0;
    let lastTime = performance.now();
    let uiSyncAccum = 0;

    const syncCanvasMetrics = () => {
      const canvas = canvasRef.current;
      const stage = stageRef.current;
      if (!canvas || !stage) return;
      const cssW = Math.max(320, stage.clientWidth);
      const cssH = Math.max(240, stage.clientHeight);
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const targetW = Math.round(cssW * dpr);
      const targetH = Math.round(cssH * dpr);
      if (canvas.width !== targetW || canvas.height !== targetH) {
        canvas.width = targetW;
        canvas.height = targetH;
      }
      const fs = isFullscreenRef.current || Boolean(document.fullscreenElement);
      const isShortScreen = cssH < 480;
      const topSafe = fs ? 4 : isShortScreen ? 10 : 14;
      const bottomSafe = fs ? 6 : isShortScreen ? 12 : 16;
      viewportRef.current = computeViewportTransform(cssW, cssH, topSafe, bottomSafe);
    };

    syncCanvasMetrics();
    window.addEventListener('resize', syncCanvasMetrics);
    window.addEventListener('orientationchange', syncCanvasMetrics);
    document.addEventListener('fullscreenchange', syncCanvasMetrics);

    const tick = (now: number) => {
      if (disposed || engineRef.current !== engine) return;
      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;

      engine.stepSimulation(dt);

      const canvas = canvasRef.current;
      const stage = stageRef.current;
      if (canvas && stage) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const cssW = Math.max(320, stage.clientWidth);
          const cssH = Math.max(240, stage.clientHeight);
          const dpr = Math.min(window.devicePixelRatio || 1, 2);
          const targetW = Math.round(cssW * dpr);
          const targetH = Math.round(cssH * dpr);

          if (canvas.width !== targetW || canvas.height !== targetH) {
            canvas.width = targetW;
            canvas.height = targetH;
          }

          // Edge-to-edge 16:9 battlefield sizing with minimal floating HUD inset
          const fs = isFullscreenRef.current || Boolean(document.fullscreenElement);
          const isShortScreen = cssH < 480;
          const topSafe = fs ? 4 : isShortScreen ? 10 : 14;
          const bottomSafe = fs ? 6 : isShortScreen ? 12 : 16;
          const vt = computeViewportTransform(cssW, cssH, topSafe, bottomSafe);
          viewportRef.current = vt;

          ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
          engine.renderWithViewport(ctx, vt);
        }
      }

      uiSyncAccum += dt;
      if (uiSyncAccum >= 0.08) {
        uiSyncAccum = 0;
        const current = engine.getSnapshot();
        setSnap(current);

        if (current.status === 'victory' && !victoryReportedRef.current) {
          victoryReportedRef.current = true;
          const stars = computeStarsFromBattle(current.castleHp, current.maxCastleHp);
          let bonusObjCoins = 0;
          for (const bo of level.bonusObjectives) {
            if (bo.type === 'min_castle_hp_pct') {
              if (current.castleHp / current.maxCastleHp >= bo.threshold) {
                bonusObjCoins += bo.rewardCoins;
              }
            } else if (bo.type === 'no_leaks' && current.leaks === 0) {
              bonusObjCoins += bo.rewardCoins;
            } else if (bo.type === 'max_towers_built' && current.towersBuilt <= bo.threshold) {
              bonusObjCoins += bo.rewardCoins;
            }
          }
          onLevelVictory({
            levelId: level.id,
            stars,
            score: current.score,
            kills: current.kills,
            bossesSlain: engine.bossesKilledInLevel,
            bonusCoinsEarned: level.rewards.coins + bonusObjCoins,
            xpEarned: level.rewards.xp,
          });
        } else if (current.status === 'defeat' && !defeatReportedRef.current) {
          defeatReportedRef.current = true;
          onLevelDefeatStats(current.kills);
        }
      }

      if (!disposed && engineRef.current === engine) {
        rafId = requestAnimationFrame(tick);
      }
    };

    rafId = requestAnimationFrame(tick);
    return () => {
      disposed = true;
      cancelAnimationFrame(rafId);
      if (engineRef.current === engine) {
        engineRef.current = null;
      }
      window.removeEventListener('resize', syncCanvasMetrics);
      window.removeEventListener('orientationchange', syncCanvasMetrics);
      document.removeEventListener('fullscreenchange', syncCanvasMetrics);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level.id, runKey]);

  useEffect(() => {
    engineRef.current?.setGraphics(save.graphics);
  }, [save.graphics]);

  const handleCanvasPointer = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const engine = engineRef.current;
    if (!canvas || !engine) return;
    dkAudio.unlock();

    const rect = canvas.getBoundingClientRect();
    const vt = viewportRef.current;
    const localX = e.clientX - rect.left;
    const localY = e.clientY - rect.top;
    const mapX = (localX - vt.offsetX) / vt.scale;
    const mapY = (localY - vt.offsetY) / vt.scale;
    engine.selectAtMapPoint(mapX, mapY);
    setSnap(engine.getSnapshot());
  };

  const handleZoneWeaponClick = (weaponId: WeaponId) => {
    const engine = engineRef.current;
    if (!engine) return;
    dkAudio.unlock();
    if (engine.selectedZoneId) {
      engine.setPreviewWeapon(weaponId);
    } else {
      engine.selectWeaponForPlacement(weaponId);
    }
    setSnap(engine.getSnapshot());
  };

  const handleUpgrade = (pathId: 'A' | 'B' | 'C') => {
    const engine = engineRef.current;
    if (!engine || !snap?.selectedTower) return;
    engine.upgradeTower(snap.selectedTower.instanceId, pathId);
    setSnap(engine.getSnapshot());
  };

  const handleSell = () => {
    const engine = engineRef.current;
    if (!engine || !snap?.selectedTower) return;
    engine.sellTower(snap.selectedTower.instanceId);
    setSnap(engine.getSnapshot());
  };

  const executeReplay = () => {
    if (isRestartingRef.current) return;
    isRestartingRef.current = true;
    dkAudio.unlock();
    victoryReportedRef.current = false;
    defeatReportedRef.current = false;
    wasPlayingBeforeReplayConfirmRef.current = false;
    setConfirmReplayOpen(false);
    setUnlockBanner(null);
    setRunKey((prev) => prev + 1);
  };

  const requestReplay = () => {
    if (isRestartingRef.current) return;
    const engine = engineRef.current;
    if (!engine) return;
    if (engine.status === 'shop_pause' || engine.status === 'mcq_pause') return;
    if (engine.status === 'victory' || engine.status === 'defeat') {
      executeReplay();
      return;
    }
    const wasPlaying = engine.status === 'playing';
    wasPlayingBeforeReplayConfirmRef.current = wasPlaying;
    if (wasPlaying) {
      engine.togglePause();
      setSnap(engine.getSnapshot());
    }
    setConfirmReplayOpen(true);
  };

  const cancelReplayConfirm = () => {
    setConfirmReplayOpen(false);
    const engine = engineRef.current;
    if (wasPlayingBeforeReplayConfirmRef.current && engine && engine.status === 'paused') {
      engine.togglePause();
      setSnap(engine.getSnapshot());
    }
    wasPlayingBeforeReplayConfirmRef.current = false;
  };

  const handleSetEnemySpeed = (speed: EnemySpeedMultiplier) => {
    enemySpeedRef.current = speed;
    engineRef.current?.setEnemySpeedMultiplier(speed);
    setSnap(engineRef.current?.getSnapshot() ?? null);
  };

  const selectedTowerStats = useMemo(() => {
    if (!snap?.selectedTower) return null;
    return getTowerEffectiveStats(snap.selectedTower, level);
  }, [snap?.selectedTower, level]);

  if (!snap) return null;

  const formatHp = (val: number) => (Number.isInteger(val) ? `${val}` : val.toFixed(1));
  const hpPct = Math.max(0, Math.min(100, (snap.castleHp / snap.maxCastleHp) * 100));
  const isShopPaused = snap.status === 'shop_pause' || snap.status === 'mcq_pause';

  return (
    <div
      ref={stageRef}
      className={`${
        isFullscreen ? 'fixed inset-0 z-40' : 'relative'
      } h-full w-full overflow-hidden bg-[#1e3d1e] text-slate-100 select-none`}
    >
      {/* Full-Screen 16:9 Landscape Battlefield Canvas */}
      <canvas
        ref={canvasRef}
        onPointerDown={handleCanvasPointer}
        className="absolute inset-0 block h-full w-full cursor-pointer touch-none"
      />

      {/* Compact 3-Zone Landscape Top HUD (Top-Left, Top-Center, Top-Right) */}
      <header className="pointer-events-none absolute top-0 right-0 left-0 z-20 flex items-center justify-between gap-2 px-2 pt-1 sm:px-3">
        {/* Top-Left: World · Level Number · Level Name */}
        <div className="pointer-events-auto flex min-w-0 items-center gap-2 rounded-xl border border-slate-700/75 bg-slate-950/82 px-2.5 py-1 shadow-lg backdrop-blur-sm">
          <div className="min-w-0">
            <div className="truncate text-[10px] font-semibold text-amber-400">
              {level.worldName} · මට්ටම {level.id}
            </div>
            <div className="font-fantasy truncate text-xs font-bold text-white">
              {level.name}
            </div>
          </div>
        </div>

        {/* Top-Center: Castle Health, Coins, Current Wave + Start Wave */}
        <div className="pointer-events-auto flex items-center gap-1.5 rounded-xl border border-slate-700/75 bg-slate-950/82 px-2.5 py-1 shadow-lg backdrop-blur-sm sm:gap-3">
          <div className="flex items-center gap-1.5">
            <Heart className="h-3.5 w-3.5 shrink-0 fill-rose-500 text-rose-500" />
            <div className="w-14 sm:w-20">
              <div className="font-mono-num text-[10px] leading-none font-bold text-white sm:text-[11px]">
                {formatHp(snap.castleHp)}/{snap.maxCastleHp}
              </div>
              <div className="mt-0.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                <div
                  className={`h-full transition-all ${
                    hpPct > 50 ? 'bg-emerald-500' : hpPct > 25 ? 'bg-amber-400' : 'bg-rose-500'
                  }`}
                  style={{ width: `${hpPct}%` }}
                />
              </div>
            </div>
          </div>

          <div className="h-4 w-px bg-slate-800" />

          <div className="font-mono-num flex items-center gap-1 text-xs font-bold text-amber-300" title="කාසි">
            <Coins className="h-3.5 w-3.5 text-amber-400" />
            <span>{snap.coins}</span>
          </div>

          <div className="h-4 w-px bg-slate-800" />

          <div className="font-mono-num flex items-center gap-1 text-xs font-bold text-sky-300" title="සතුරු වටය">
            <Waves className="h-3.5 w-3.5 text-sky-400" />
            <span>
              {snap.currentWave}/{snap.totalWaves}
            </span>
          </div>

          {snap.currentWave < snap.totalWaves && snap.enemiesRemaining === 0 && (
            <button
              onClick={() => engineRef.current?.startNextWaveNow()}
              className="ml-1 flex min-h-[28px] items-center gap-1 rounded-lg bg-emerald-500 px-2.5 py-0.5 text-[11px] font-bold whitespace-nowrap text-slate-950 shadow transition hover:bg-emerald-400 active:scale-95"
            >
              <Play className="h-3 w-3 fill-current" />
              <span>සතුරු වටය {snap.currentWave + 1}</span>
            </button>
          )}
        </div>

        {/* Top-Right: Enemy Speed Selector (0.5x / 1.0x / 1.5x / 2.0x), Fullscreen & Pause */}
        <div className="pointer-events-auto flex shrink-0 items-center gap-1.5">
          <div
            role="group"
            aria-label="සතුරු ගමන් වේගය"
            className="flex items-center gap-0.5 rounded-xl border border-slate-700/80 bg-slate-950/90 p-0.5 shadow-lg backdrop-blur-sm"
          >
            {ENEMY_SPEED_OPTIONS.map((opt) => {
              const active = snap.enemySpeedMultiplier === opt.value;
              const IconComp =
                opt.icon === 'slow'
                  ? Gauge
                  : opt.icon === 'normal'
                    ? Play
                    : opt.icon === 'fast'
                      ? FastForward
                      : Zap;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleSetEnemySpeed(opt.value)}
                  title={opt.title}
                  aria-label={opt.title}
                  aria-pressed={active}
                  className={`flex min-h-[38px] min-w-[40px] items-center justify-center gap-1 rounded-lg px-1.5 py-1 text-[11px] font-bold transition active:scale-95 sm:px-2 ${
                    active
                      ? 'bg-amber-500 text-slate-950 shadow-sm ring-1 ring-amber-300'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <IconComp className={`h-3 w-3 shrink-0 ${active ? 'text-slate-950' : 'text-amber-400/80'}`} />
                  <span className="font-mono-num leading-none">{opt.label}</span>
                  <span className="hidden text-[9px] font-semibold lg:inline">{opt.shortLabel}</span>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            disabled={isShopPaused}
            onClick={requestReplay}
            className={`touch-manipulation flex min-h-[40px] min-w-[40px] items-center justify-center rounded-xl border border-slate-700/80 bg-slate-950/82 text-slate-200 shadow-lg backdrop-blur-sm transition active:scale-95 ${
              isShopPaused ? 'cursor-not-allowed opacity-50' : 'hover:border-sky-400/70 hover:text-sky-200'
            }`}
            aria-label="නැවත ක්‍රීඩා කරන්න"
            title="මට්ටම නැවත අරඹන්න"
          >
            <RotateCcw className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() => void toggleFullscreen()}
            className="touch-manipulation flex min-h-[40px] min-w-[40px] items-center justify-center rounded-xl border border-slate-700/80 bg-slate-950/82 text-slate-200 shadow-lg backdrop-blur-sm transition hover:border-amber-400/60 active:scale-95"
            aria-label={isFullscreen ? 'සම්පූර්ණ තිරයෙන් ඉවත් වන්න' : 'සම්පූර්ණ තිරය'}
            title={isFullscreen ? 'සම්පූර්ණ තිරයෙන් ඉවත් වන්න' : 'සම්පූර්ණ තිරය'}
          >
            {isFullscreen ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </button>

          <button
            type="button"
            disabled={isShopPaused}
            onClick={() => engineRef.current?.togglePause()}
            className={`touch-manipulation flex min-h-[40px] min-w-[40px] items-center justify-center rounded-xl border border-slate-700/80 bg-slate-950/82 text-slate-200 shadow-lg backdrop-blur-sm transition active:scale-95 ${
              isShopPaused ? 'cursor-not-allowed opacity-50' : 'hover:border-amber-400/60'
            }`}
            aria-label="නවත්වන්න"
            title="නවත්වන්න"
          >
            <Pause className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* Clear PAUSED Indicator during In-Match Weapon Selection / MCQ */}
      {isShopPaused && (
        <div className="pointer-events-none absolute top-11 left-1/2 z-30 flex -translate-x-1/2 items-center gap-1.5 rounded-xl border border-amber-400/75 bg-slate-950/92 px-3.5 py-1 text-xs font-bold text-amber-300 shadow-xl backdrop-blur-sm">
          <PauseCircle className="h-3.5 w-3.5 text-amber-400" />
          <span>සටන නවත්වා ඇත · PAUSED</span>
        </div>
      )}

      {/* Celebratory MCQ Unlock Banner */}
      {unlockBanner && !isShopPaused && (
        <div className="pointer-events-none absolute top-12 left-1/2 z-30 flex -translate-x-1/2 items-center gap-2 rounded-xl border border-emerald-400/80 bg-emerald-950/95 px-4 py-1.5 text-xs font-bold text-emerald-200 shadow-2xl backdrop-blur-md">
          <Sparkles className="h-4 w-4 shrink-0 text-amber-300" />
          <span>
            "{unlockBanner.weaponName}" MCQ මගින් නොමිලේ අගුළු හැර ස්ථාපනය කෙරිණි!
          </span>
        </div>
      )}

      {/* Boss Health Bar Overlay */}
      {snap.activeBoss && (
        <div className="pointer-events-none absolute top-11 left-1/2 z-20 w-[86%] max-w-md -translate-x-1/2 rounded-xl border border-rose-500/70 bg-slate-950/88 px-3.5 py-1.5 shadow-2xl backdrop-blur-sm">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="flex items-center gap-1.5 text-rose-300">
              <Skull className="h-3.5 w-3.5" />
              ප්‍රධාන රාක්ෂයා: {snap.activeBoss.name} · {snap.activeBoss.title}
            </span>
            <span className="font-mono-num text-rose-100">
              {snap.activeBoss.hp.toLocaleString()} / {snap.activeBoss.maxHp.toLocaleString()}
            </span>
          </div>
          <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full bg-gradient-to-r from-rose-600 to-amber-500 transition-all"
              style={{
                width: `${Math.max(0, (snap.activeBoss.hp / snap.activeBoss.maxHp) * 100)}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Wave Announcement */}
      {snap.waveAnnouncement && !snap.activeBoss && !isShopPaused && (
        <div className="pointer-events-none absolute top-11 left-1/2 z-20 -translate-x-1/2 rounded-lg border border-amber-500/50 bg-slate-950/85 px-3.5 py-1 text-center text-xs font-bold text-amber-300 shadow-lg">
          {snap.waveAnnouncement}
        </div>
      )}

      {/* Special Ability Bar when charges unlocked */}
      {(snap.specialCharges.arcaneStorm > 0 ||
        snap.specialCharges.castleRepair > 0 ||
        snap.specialCharges.goldSurge > 0) && (
        <div className="absolute bottom-14 left-3 z-20 flex flex-wrap gap-1.5">
          {snap.specialCharges.arcaneStorm > 0 && (
            <button
              onClick={() => engineRef.current?.triggerSpecialPower('arcaneStorm')}
              className="flex min-h-[34px] items-center gap-1 rounded-xl border border-sky-400/70 bg-sky-950/90 px-2.5 py-1 text-xs font-bold text-sky-200 shadow-lg hover:bg-sky-900"
            >
              <Zap className="h-3.5 w-3.5 text-sky-400" />
              <span>විදුලි කුණාටුව ({snap.specialCharges.arcaneStorm})</span>
            </button>
          )}
          {snap.specialCharges.castleRepair > 0 && (
            <button
              onClick={() => engineRef.current?.triggerSpecialPower('castleRepair')}
              className="flex min-h-[34px] items-center gap-1 rounded-xl border border-emerald-400/70 bg-emerald-950/90 px-2.5 py-1 text-xs font-bold text-emerald-200 shadow-lg hover:bg-emerald-900"
            >
              <Shield className="h-3.5 w-3.5 text-emerald-400" />
              <span>පිළිසකර කිරීම ({snap.specialCharges.castleRepair})</span>
            </button>
          )}
          {snap.specialCharges.goldSurge > 0 && (
            <button
              onClick={() => engineRef.current?.triggerSpecialPower('goldSurge')}
              className="flex min-h-[34px] items-center gap-1 rounded-xl border border-amber-400/70 bg-amber-950/90 px-2.5 py-1 text-xs font-bold text-amber-200 shadow-lg hover:bg-amber-900"
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              <span>+180 කාසි ({snap.specialCharges.goldSurge})</span>
            </button>
          )}
        </div>
      )}

      {/* Spider Nest Info & Focus Card */}
      {snap.selectedNest && !snap.selectedNest.destroyed && !snap.selectedTower && !snap.selectedZoneId && (
        <div className="absolute right-3 bottom-14 z-30 w-64 rounded-xl border border-lime-500/55 bg-slate-950/92 p-2.5 text-xs shadow-2xl backdrop-blur-md">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <span className="block truncate font-bold text-lime-300">
                {snap.selectedNest.label}
              </span>
              <span className="text-[10px] text-amber-300/90">
                විනාශ කළ හැකි මකුළු ගුල
              </span>
            </div>
            <button
              onClick={() => {
                if (engineRef.current) {
                  engineRef.current.selectedNestId = null;
                  setSnap(engineRef.current.getSnapshot());
                }
              }}
              className="rounded p-0.5 text-slate-400 hover:text-white"
              aria-label="වසන්න"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="font-mono-num mt-1.5 grid grid-cols-2 gap-1 text-[11px] text-slate-200">
            <div>
              ජීව ශක්තිය: {Math.ceil(snap.selectedNest.hp)}/{snap.selectedNest.maxHp}
            </div>
            <div>සන්නාහ: {snap.selectedNest.armor}</div>
            <div>
              ඉතිරි මකුළුවන්: {snap.selectedNest.spawnsRemaining}/{snap.selectedNest.maxSpawns}
            </div>
            <div className="text-amber-300">ත්‍යාගය: +{snap.selectedNest.coinReward} කාසි</div>
          </div>
          <button
            onClick={() => {
              if (!engineRef.current || !snap.selectedNest) return;
              const isAlreadyFocused = snap.focusedNestId === snap.selectedNest.id;
              engineRef.current.setFocusedNest(isAlreadyFocused ? null : snap.selectedNest.id);
              setSnap(engineRef.current.getSnapshot());
            }}
            className={`mt-2 min-h-[34px] w-full rounded-lg border px-2 py-1 text-[11px] font-bold transition ${
              snap.focusedNestId === snap.selectedNest.id
                ? 'border-rose-400/70 bg-rose-950/60 text-rose-200 hover:bg-rose-900/60'
                : 'border-lime-400/70 bg-lime-950/50 text-lime-200 hover:bg-lime-900/50'
            }`}
          >
            {snap.focusedNestId === snap.selectedNest.id
              ? 'ප්‍රමුඛ ඉලක්කය ඉවත් කරන්න'
              : 'මෙම ගුලට ප්‍රමුඛ ප්‍රහාර එල්ල කරන්න'}
          </button>
        </div>
      )}

      {/* Enemy Info Floating Card */}
      {snap.selectedEnemy && !snap.selectedTower && !snap.selectedZoneId && (
        <div className="absolute right-3 bottom-14 z-30 w-64 rounded-xl border border-rose-500/50 bg-slate-950/92 p-2.5 text-xs shadow-2xl backdrop-blur-md">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <span className="block truncate font-bold text-rose-300">
                {snap.selectedEnemy.name}
              </span>
              <span className="text-[10px] text-amber-300/90">
                {ENEMY_CLASS_SI[snap.selectedEnemy.enemyClass]} ·{' '}
                {snap.selectedEnemy.isFlying ? 'ගුවන්' : 'භූමි'}
              </span>
            </div>
            <button
              onClick={() => {
                if (engineRef.current) {
                  engineRef.current.selectedEnemyId = null;
                  setSnap(engineRef.current.getSnapshot());
                }
              }}
              className="rounded p-0.5 text-slate-400 hover:text-white"
              aria-label="වසන්න"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="font-mono-num mt-1.5 grid grid-cols-2 gap-1 text-[11px] text-slate-200">
            <div>
              ජීව ශක්තිය: {snap.selectedEnemy.hp}/{snap.selectedEnemy.maxHp}
            </div>
            <div>සන්නාහ: {snap.selectedEnemy.armor}</div>
            <div>වේගය: {Math.round(snap.selectedEnemy.speed)}</div>
            <div>කාසි: +{snap.selectedEnemy.coinReward}</div>
            {snap.selectedEnemy.shield > 0 && (
              <div className="text-sky-300">පලිහ: {Math.round(snap.selectedEnemy.shield)}</div>
            )}
            {Boolean(snap.selectedEnemy.regenPerSec) && (
              <div className="text-emerald-300">
                පුනර්ජීව: +{snap.selectedEnemy.regenPerSec}/තත්.
              </div>
            )}
            {Boolean(snap.selectedEnemy.dodgeChance) && (
              <div className="text-amber-300">
                මගහැරීම: {Math.round((snap.selectedEnemy.dodgeChance ?? 0) * 100)}%
              </div>
            )}
            {snap.selectedEnemy.poisonResistant && (
              <div className="col-span-2 text-lime-300">විෂ ප්‍රතිරෝධී (-65%)</div>
            )}
            {snap.selectedEnemy.sciFiAbility && (
              <div className="col-span-2 text-cyan-300">
                විශේෂ හැකියාව: {SCI_FI_ABILITY_SI[snap.selectedEnemy.sciFiAbility]}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Pending Weapon Placement Hint when weapon tapped in bottom dock */}
      {snap.pendingWeaponToBuild && !isShopPaused && !snap.selectedTower && (
        <div className="pointer-events-auto absolute bottom-14 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 rounded-xl border border-amber-400/60 bg-slate-950/90 px-3 py-1.5 text-xs font-semibold text-amber-200 shadow-xl backdrop-blur-sm">
          <span className="whitespace-nowrap">
            {WEAPON_MAP[snap.pendingWeaponToBuild]?.name} — කාසි හෝ MCQ මගින් ස්ථාපනයට හිස් ස්ථානයක් ස්පර්ශ කරන්න
          </span>
          <button
            type="button"
            onClick={() => {
              engineRef.current?.selectWeaponForPlacement(null);
              setSnap(engineRef.current?.getSnapshot() ?? null);
            }}
            className="rounded p-0.5 text-slate-400 hover:text-white"
            aria-label="තේරීම අවලංගු කරන්න"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Bottom Compact Landscape Dock */}
      <footer className="pointer-events-none absolute right-0 bottom-0 left-0 z-20 flex justify-center px-2 pb-1">
        {snap.selectedTower && selectedTowerStats ? (
          /* Tower Upgrade & Sell Panel (only shown when a tower is tapped) */
          (() => {
            const tower = snap.selectedTower!;
            const def = WEAPON_MAP[tower.weaponId];
            const refund = Math.round(tower.totalInvested * def.sellRatio);

            return (
              <div className="pointer-events-auto w-full max-w-4xl rounded-xl border border-amber-500/40 bg-slate-950/92 px-3 py-2 shadow-2xl backdrop-blur-md">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-1.5">
                  <div className="flex items-center gap-2">
                    <WeaponArtwork weaponId={tower.weaponId} className="h-7 w-7 shrink-0" />
                    <div>
                      <div className="text-xs font-bold text-white">
                        {def.name}{' '}
                        <span className="ml-1 text-[10px] font-semibold text-amber-400">
                          ·{' '}
                          {selectedTowerStats.canTargetFlying && selectedTowerStats.canTargetGround
                            ? 'භූමි සහ ගුවන්'
                            : selectedTowerStats.canTargetFlying
                              ? 'ගුවන් පමණි'
                              : 'භූමි පමණි'}
                        </span>
                      </div>
                      <div className="font-mono-num text-[10px] text-slate-300">
                        හානිය {selectedTowerStats.damage} · වේගය{' '}
                        {selectedTowerStats.attackSpeed.toFixed(2)}/තත්. · ප්‍රහාර පරාසය{' '}
                        {selectedTowerStats.range} · මරණ {tower.kills}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        engineRef.current?.cycleTowerTargeting(tower.instanceId);
                        setSnap(engineRef.current?.getSnapshot() ?? null);
                      }}
                      className="min-h-[32px] rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap text-sky-300 hover:border-sky-400"
                    >
                      ඉලක්කය: {TARGETING_SI[tower.targeting]}
                    </button>
                    <button
                      onClick={handleSell}
                      className="flex min-h-[32px] items-center gap-1 rounded-lg border border-rose-500/45 bg-rose-950/40 px-2.5 py-1 text-[11px] font-bold whitespace-nowrap text-rose-300 hover:bg-rose-900/50"
                    >
                      <Trash2 className="h-3 w-3" />
                      <span>විකුණන්න +{refund} කාසි</span>
                    </button>
                    <button
                      onClick={() => {
                        if (engineRef.current) {
                          engineRef.current.selectedTowerId = null;
                          setSnap(engineRef.current.getSnapshot());
                        }
                      }}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-700 text-slate-300 hover:text-white"
                      aria-label="වසන්න"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-1.5">
                  {def.upgradePaths.map((path) => {
                    const tierIdx = tower.pathChoices[path.id];
                    const nextTier = path.tiers[tierIdx];
                    const maxed = tierIdx >= 3;
                    const canAfford = Boolean(nextTier && snap.coins >= nextTier.cost);

                    return (
                      <button
                        key={path.id}
                        disabled={maxed || !canAfford}
                        onClick={() => handleUpgrade(path.id)}
                        className={`flex min-h-[40px] flex-col justify-between rounded-lg border px-2 py-1 text-left transition ${
                          maxed
                            ? 'border-amber-500/45 bg-amber-500/15'
                            : canAfford
                              ? 'border-slate-700 bg-slate-900 hover:border-amber-400'
                              : 'cursor-not-allowed border-slate-800 bg-slate-950/60 opacity-55'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1 text-[10px] font-bold">
                          <span className="truncate text-amber-300">
                            {path.id}: {path.name}
                          </span>
                          <span className="font-mono-num shrink-0 text-slate-400">
                            {tierIdx}/3
                          </span>
                        </div>
                        {nextTier ? (
                          <div className="flex items-center justify-between gap-1 text-[10px]">
                            <span className="truncate text-slate-200">{nextTier.specialEffect}</span>
                            <span className="font-mono-num shrink-0 font-bold text-amber-400">
                              {nextTier.cost} කාසි
                            </span>
                          </div>
                        ) : (
                          <div className="text-[10px] font-bold text-emerald-400">උපරිමයි</div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })()
        ) : (
          /* Compact Persistent Bottom Weapon Shop Strip */
          <div className="pointer-events-auto flex max-w-full items-center gap-1.5 overflow-x-auto rounded-xl border border-slate-700/75 bg-slate-950/84 px-2 py-1 shadow-xl backdrop-blur-md">
            <span className="hidden shrink-0 border-r border-slate-800 pr-2 text-[10px] font-bold text-amber-400 sm:inline">
              ආයුධ වෙළඳසැල
            </span>
            {level.availableWeapons.map((wId) => {
              const w = WEAPON_MAP[wId];
              const cost = getWeaponCostForLevel(level, wId);
              const canAfford = snap.coins >= cost;
              const isPending = snap.pendingWeaponToBuild === wId;

              return (
                <button
                  key={wId}
                  onClick={() => handleZoneWeaponClick(wId)}
                  className={`flex shrink-0 items-center gap-1.5 rounded-lg border px-2 py-1 text-left transition ${
                    isPending
                      ? 'border-amber-400 bg-amber-500/25 ring-1 ring-amber-400/70'
                      : canAfford
                        ? 'border-slate-700/80 bg-slate-900/90 hover:border-amber-400/80 hover:bg-slate-800'
                        : 'border-emerald-500/35 bg-slate-900/70 hover:border-emerald-400/70'
                  }`}
                >
                  <WeaponArtwork weaponId={wId} className="h-6 w-6 shrink-0" />
                  <div className="leading-tight">
                    <div className="text-[11px] font-bold whitespace-nowrap text-white">
                      {w.name}
                    </div>
                    <div
                      className={`font-mono-num text-[10px] font-bold ${
                        canAfford ? 'text-amber-400' : 'text-emerald-300'
                      }`}
                    >
                      {canAfford ? `${cost} කාසි` : `${cost} · MCQ නොමිලේ`}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </footer>

      {/* Smart Weapon Shop + MCQ Weapon Unlock Modal (Automatically Pauses Game) */}
      {isShopPaused && snap.selectedZoneId && (
        <SmartWeaponShopModal
          level={level}
          coins={snap.coins}
          towersBuilt={snap.towersBuilt}
          zoneId={snap.selectedZoneId}
          previewWeaponId={snap.previewWeaponId}
          answeredMcqIds={save.answeredMcqIds}
          mcqModeProgress={save.mcqModeProgress}
          selectedMcqMode={save.mcqSelectedMode}
          isMcqMode={snap.status === 'mcq_pause'}
          onSelectPreview={(weaponId) => {
            engineRef.current?.setPreviewWeapon(weaponId);
            setSnap(engineRef.current?.getSnapshot() ?? null);
          }}
          onBuyWithCoins={(weaponId) => {
            if (!snap.selectedZoneId || !engineRef.current) return;
            engineRef.current.buildTower(snap.selectedZoneId, weaponId, { free: false });
            setSnap(engineRef.current.getSnapshot());
          }}
          onEnterMcqMode={() => {
            engineRef.current?.enterShopMcqPause();
            setSnap(engineRef.current?.getSnapshot() ?? null);
          }}
          onExitMcqToShop={() => {
            engineRef.current?.returnToShopFromMcq();
            setSnap(engineRef.current?.getSnapshot() ?? null);
          }}
          onMarkMcqShown={(unitId, questionId, poolIds) => {
            onMarkMcqShown?.(unitId, questionId, poolIds);
          }}
          onRecordMcqAnswer={(questionId, isCorrect, resetHistory, poolIds) => {
            onRecordMcqAnswer?.(questionId, isCorrect, resetHistory, poolIds);
          }}
          onCompleteMcqUnlock={(weaponId) => {
            if (!snap.selectedZoneId || !engineRef.current) return;
            const ok = engineRef.current.buildTower(snap.selectedZoneId, weaponId, {
              free: true,
            });
            if (ok) {
              setUnlockBanner({ weaponName: WEAPON_MAP[weaponId].name });
            }
            setSnap(engineRef.current.getSnapshot());
          }}
          onOpenUnitSelect={onOpenUnitSelect}
          onCloseShop={() => {
            engineRef.current?.closeWeaponShop();
            setSnap(engineRef.current?.getSnapshot() ?? null);
          }}
        />
      )}

      {/* Pause Overlay */}
      {snap.status === 'paused' && !confirmReplayOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center overflow-y-auto bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="my-auto max-h-full w-full max-w-sm space-y-4 overflow-y-auto rounded-2xl border border-amber-500/35 bg-slate-900 p-6 text-center shadow-2xl">
            <h2 className="font-fantasy text-2xl font-bold text-white">සටන නවත්වා ඇත</h2>
            <p className="text-xs text-slate-400">
              මට්ටම {level.id} · {level.name}
            </p>
            <div className="space-y-2.5 pt-2">
              <button
                type="button"
                onClick={() => engineRef.current?.togglePause()}
                className="touch-manipulation flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-amber-500 font-bold text-slate-950 transition hover:bg-amber-400 active:scale-[0.98]"
              >
                <Play className="h-4 w-4 fill-current" />
                <span>සටන ඉදිරියට ගෙන යන්න</span>
              </button>
              <button
                type="button"
                onClick={requestReplay}
                className="touch-manipulation flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl border border-sky-500/50 bg-sky-950/40 font-bold text-sky-200 transition hover:border-sky-400 hover:bg-sky-900/50 active:scale-[0.98]"
              >
                <RotateCcw className="h-4 w-4" />
                <span>නැවත ක්‍රීඩා කරන්න</span>
              </button>
              <button
                type="button"
                onClick={onExitToMap}
                className="touch-manipulation flex min-h-[44px] w-full items-center justify-center rounded-xl border border-slate-800 bg-slate-950/60 text-sm font-semibold text-slate-300 transition hover:text-white active:scale-[0.98]"
              >
                ලෝක සිතියමට යන්න
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Active-Level Replay Confirmation Prompt */}
      {confirmReplayOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/85 p-4 backdrop-blur-sm">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="replay-confirm-title"
            className="my-auto max-h-full w-full max-w-sm space-y-4 overflow-y-auto rounded-2xl border border-amber-500/60 bg-slate-900 p-6 text-center shadow-2xl"
          >
            <RotateCcw className="mx-auto h-9 w-9 text-amber-400" />
            <div>
              <h2 id="replay-confirm-title" className="font-fantasy text-xl font-bold text-white">
                මට්ටම නැවත ආරම්භ කරන්නද?
              </h2>
              <p className="mt-2 text-xs leading-relaxed text-slate-300">
                මෙම මට්ටමේ වත්මන් ප්‍රගතිය, ස්ථාපිත කුළුණු සහ වත්මන් සතුරු වට සියල්ල අහිමි වේ.
                මුල සිට නැවත ක්‍රීඩා කිරීමට අවශ්‍යද?
              </p>
            </div>
            <div className="flex gap-2.5 pt-1">
              <button
                type="button"
                onClick={cancelReplayConfirm}
                className="touch-manipulation flex min-h-[44px] flex-1 items-center justify-center rounded-xl border border-slate-700 bg-slate-950 px-3 font-bold text-slate-200 transition hover:border-slate-500 active:scale-[0.98]"
              >
                අවලංගු කරන්න
              </button>
              <button
                type="button"
                onClick={executeReplay}
                className="touch-manipulation flex min-h-[44px] flex-1 items-center justify-center gap-1.5 rounded-xl bg-amber-500 px-3 font-bold text-slate-950 transition hover:bg-amber-400 active:scale-[0.98]"
              >
                <RotateCcw className="h-4 w-4" />
                <span>ඔව්, නැවත අරඹන්න</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Victory Overlay */}
      {snap.status === 'victory' && (
        <div className="fixed inset-0 z-40 flex items-center justify-center overflow-y-auto bg-slate-950/85 p-3 backdrop-blur-sm sm:p-4">
          {(() => {
            const stars = computeStarsFromBattle(snap.castleHp, snap.maxCastleHp);
            const isReplayVictory = wasClearedBeforeRunRef.current;
            return (
              <div className="my-auto max-h-full w-full max-w-md space-y-3 overflow-y-auto rounded-2xl border border-amber-500/60 bg-slate-900 p-4 text-center shadow-2xl sm:p-5">
                <div className="text-xs font-bold text-emerald-400">
                  බලකොටුව සාර්ථකව රැක ගත්තා
                </div>
                <h2 className="font-fantasy text-2xl font-bold text-white sm:text-3xl">
                  ජයග්‍රහණය!
                </h2>

                <div className="flex justify-center gap-2">
                  {[1, 2, 3].map((s) => (
                    <Star
                      key={s}
                      className={`h-8 w-8 ${
                        s <= stars ? 'fill-amber-400 text-amber-400' : 'text-slate-700'
                      }`}
                    />
                  ))}
                </div>

                <div className="grid grid-cols-3 gap-2 rounded-xl border border-slate-800 bg-slate-950/80 p-2.5 text-xs">
                  <div>
                    <div className="text-slate-400">ජීව ශක්තිය</div>
                    <div className="font-mono-num font-bold text-emerald-400">
                      {formatHp(snap.castleHp)}/{snap.maxCastleHp}
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-400">පරාජිත සතුරන්</div>
                    <div className="font-mono-num font-bold text-white">{snap.kills}</div>
                  </div>
                  <div>
                    <div className="text-slate-400">ලකුණු</div>
                    <div className="font-mono-num font-bold text-amber-300">{snap.score}</div>
                  </div>
                </div>

                <div
                  className={`rounded-xl border px-3 py-1.5 text-[11px] font-semibold ${
                    isReplayVictory
                      ? 'border-slate-700 bg-slate-950/70 text-slate-300'
                      : 'border-emerald-500/40 bg-emerald-950/35 text-emerald-200'
                  }`}
                >
                  {isReplayVictory
                    ? 'නැවත ක්‍රීඩා ජයග්‍රහණය · මූලික ත්‍යාග දැනටමත් ලබාගෙන ඇත'
                    : `පළමු ජයග්‍රහණ ත්‍යාග: +${level.rewards.coins} කාසි · +${level.rewards.xp} XP`}
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-2.5 text-left text-xs">
                  <div className="mb-1 font-bold text-amber-300">අතිරේක අරමුණු</div>
                  {level.bonusObjectives
                    .filter((bo) => bo.type !== 'mcq_perfect')
                    .map((bo) => {
                      const met =
                        (bo.type === 'min_castle_hp_pct' &&
                          snap.castleHp / snap.maxCastleHp >= bo.threshold) ||
                        (bo.type === 'no_leaks' && snap.leaks === 0) ||
                        (bo.type === 'max_towers_built' && snap.towersBuilt <= bo.threshold);

                      return (
                        <div key={bo.id} className={met ? 'text-emerald-300' : 'text-slate-500'}>
                          {met ? '✓' : '•'} {bo.description} (+{bo.rewardCoins} කාසි)
                        </div>
                      );
                    })}
                </div>

                <div className="flex flex-wrap gap-2">
                  {level.id === 100 && (
                    <div className="w-full rounded-xl border border-amber-400/60 bg-amber-950/40 px-3 py-2 text-xs font-bold text-amber-200">
                      මහා අවසන් ජයග්‍රහණය! ඔබ Dark Kingdom මට්ටම් 100ම ජයගෙන රාජධානිය බේරා ගත්තා!
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={onExitToMap}
                    className="touch-manipulation flex min-h-[44px] min-w-[100px] flex-1 items-center justify-center rounded-xl border border-slate-700 bg-slate-950 px-3 text-xs font-bold text-slate-200 transition hover:border-amber-500/50 active:scale-[0.98] sm:text-sm"
                  >
                    ලෝක සිතියම
                  </button>
                  <button
                    type="button"
                    onClick={executeReplay}
                    className="touch-manipulation flex min-h-[44px] min-w-[125px] flex-1 items-center justify-center gap-1.5 rounded-xl border border-sky-500/60 bg-sky-950/60 px-3 text-xs font-bold text-sky-100 transition hover:border-sky-400 hover:bg-sky-900/70 active:scale-[0.98] sm:text-sm"
                  >
                    <RotateCcw className="h-4 w-4 shrink-0" />
                    <span>නැවත ක්‍රීඩා කරන්න</span>
                  </button>
                  {level.id < 100 && onNextLevel && (
                    <button
                      type="button"
                      onClick={() => onNextLevel(level.id + 1)}
                      className="touch-manipulation flex min-h-[44px] min-w-[130px] flex-1 items-center justify-center rounded-xl bg-amber-500 px-3 text-xs font-bold text-slate-950 transition hover:bg-amber-400 active:scale-[0.98] sm:text-sm"
                    >
                      ඊළඟ මට්ටම ({level.id + 1})
                    </button>
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Defeat Overlay */}
      {snap.status === 'defeat' && (
        <div className="fixed inset-0 z-40 flex items-center justify-center overflow-y-auto bg-slate-950/85 p-3 backdrop-blur-sm sm:p-4">
          <div className="my-auto max-h-full w-full max-w-sm space-y-4 overflow-y-auto rounded-2xl border border-rose-500/50 bg-slate-900 p-5 text-center shadow-2xl sm:p-6">
            <Skull className="mx-auto h-10 w-10 text-rose-400" />
            <div>
              <h2 className="font-fantasy text-2xl font-bold text-white">පරාජය!</h2>
              <p className="mt-1 text-xs font-semibold text-rose-300">බලකොටුව බිඳ වැටුණි</p>
            </div>
            <p className="text-sm text-slate-300">
              {snap.currentWave}/{snap.totalWaves} වන සතුරු වටයේදී රාක්ෂයන් බලකොටුව ආක්‍රමණය කළහ.
              ඔබේ කුළුණු ස්ථානගත කිරීම සහ වැඩිදියුණු කිරීමේ මං වෙනස් කර නැවත ක්‍රීඩා කරන්න!
            </p>
            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={onExitToMap}
                className="touch-manipulation flex min-h-[44px] flex-1 items-center justify-center rounded-xl border border-slate-700 bg-slate-950 px-3 font-bold text-slate-200 transition hover:border-slate-500 active:scale-[0.98]"
              >
                ලෝක සිතියම
              </button>
              <button
                type="button"
                onClick={executeReplay}
                className="touch-manipulation flex min-h-[44px] flex-1 items-center justify-center gap-1.5 rounded-xl bg-amber-500 px-3 font-bold text-slate-950 transition hover:bg-amber-400 active:scale-[0.98]"
              >
                <RotateCcw className="h-4 w-4 shrink-0" />
                <span>නැවත ක්‍රීඩා කරන්න</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
