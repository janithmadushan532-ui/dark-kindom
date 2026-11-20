import React from 'react';
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Coins,
  EyeOff,
  Feather,
  Magnet,
  Pause,
  Shield,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { HudSnapshot, POWERUP_META, PowerUpType, WORLDS } from '../game/types';

interface GameHUDProps {
  hud: HudSnapshot;
  bestScore: number;
  muted: boolean;
  onToggleMute: () => void;
  onPause: () => void;
  onMoveLeft: () => void;
  onMoveRight: () => void;
  onJump: () => void;
  onSlide: () => void;
}

function PowerIcon({ type }: { type: PowerUpType }) {
  if (type === 'magnet') return <Magnet className="w-4 h-4" />;
  if (type === 'invisibility') return <EyeOff className="w-4 h-4" />;
  if (type === 'bird') return <Feather className="w-4 h-4" />;
  return <Shield className="w-4 h-4" />;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  hud,
  bestScore,
  muted,
  onToggleMute,
  onPause,
  onMoveLeft,
  onMoveRight,
  onJump,
  onSlide,
}) => {
  const world = WORLDS.find((w) => w.id === hud.worldId) ?? WORLDS[0];

  return (
    <div className="fixed inset-0 z-20 pointer-events-none flex flex-col justify-between p-3 sm:p-5">
      {/* Top Perimeter Bar */}
      <div className="flex items-start justify-between gap-3">
        {/* Top-Left: Score & Distance */}
        <div
          className="pointer-events-auto rounded-2xl px-4 py-2.5 border border-white/15 shadow-lg text-white"
          style={{ backgroundColor: 'rgba(18, 22, 34, 0.84)' }}
        >
          <div className="flex items-baseline gap-3">
            <span className="font-mono-num text-2xl sm:text-3xl font-bold tracking-tight">
              {hud.score.toLocaleString()}
            </span>
            <span className="font-mono-num text-sm font-semibold text-sky-300">
              {hud.distance} m
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-300 mt-0.5">
            <span className="font-semibold text-white">{world.name}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono-num">
              Best {Math.max(bestScore, hud.score).toLocaleString()}
            </span>
            <span aria-hidden="true">·</span>
            <span className="font-mono-num text-emerald-300">
              Portal {hud.nextPortalMeters}m
            </span>
          </div>
        </div>

        {/* Top-Center: Power-Up Pickup Announcement */}
        {hud.pickupBanner && (
          <div
            key={hud.pickupBanner.key}
            className="hidden sm:flex items-center gap-2 rounded-xl px-4 py-2 border border-white/20 shadow-lg text-white font-display font-bold text-sm"
            style={{ backgroundColor: 'rgba(18, 22, 34, 0.88)' }}
          >
            <span
              className="w-2.5 h-2.5 rounded-sm shrink-0"
              style={{ backgroundColor: hud.pickupBanner.colorHex }}
            />
            <span>{hud.pickupBanner.label}</span>
          </div>
        )}

        {/* Top-Right: Coins + Audio + Pause */}
        <div className="pointer-events-auto flex items-center gap-2">
          <div
            className="flex items-center gap-2 rounded-2xl px-3.5 py-2.5 border border-white/15 shadow-lg text-white"
            style={{ backgroundColor: 'rgba(18, 22, 34, 0.84)' }}
          >
            <Coins className="w-5 h-5 text-amber-400 shrink-0" />
            <span className="font-mono-num text-lg font-bold">{hud.runCoins}</span>
          </div>

          <button
            type="button"
            onClick={onToggleMute}
            aria-label={muted ? 'Unmute audio' : 'Mute audio'}
            className="w-11 h-11 rounded-2xl flex items-center justify-center border border-white/15 text-white hover:bg-slate-800 active:scale-95 transition-transform cursor-pointer shadow-lg"
            style={{ backgroundColor: 'rgba(18, 22, 34, 0.84)' }}
          >
            {muted ? <VolumeX className="w-5 h-5 text-slate-300" /> : <Volume2 className="w-5 h-5" />}
          </button>

          <button
            type="button"
            onClick={onPause}
            aria-label="Pause game"
            className="w-11 h-11 rounded-2xl flex items-center justify-center border border-white/15 text-white hover:bg-slate-800 active:scale-95 transition-transform cursor-pointer shadow-lg"
            style={{ backgroundColor: 'rgba(18, 22, 34, 0.84)' }}
          >
            <Pause className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Mobile Center Pickup Toast */}
      {hud.pickupBanner && (
        <div className="sm:hidden self-center">
          <div
            key={hud.pickupBanner.key}
            className="flex items-center gap-2 rounded-xl px-4 py-1.5 border border-white/20 text-white font-display font-bold text-sm shadow-lg"
            style={{ backgroundColor: 'rgba(18, 22, 34, 0.88)' }}
          >
            <span
              className="w-2.5 h-2.5 rounded-sm shrink-0"
              style={{ backgroundColor: hud.pickupBanner.colorHex }}
            />
            <span>{hud.pickupBanner.label}</span>
          </div>
        </div>
      )}

      {/* Bottom Perimeter: Active Power-Up Timers + Touch Quick Buttons */}
      <div className="flex items-end justify-between gap-4">
        {/* Bottom-Left: Active Power-Up Timers */}
        <div className="flex flex-col gap-2 min-w-[175px] max-w-[230px]">
          {hud.activePowers.map((p) => {
            const meta = POWERUP_META[p.type];
            const pct = Math.max(0, Math.min(100, (p.remaining / p.duration) * 100));
            return (
              <div
                key={p.type}
                className="rounded-xl px-3 py-2 border border-white/15 text-white shadow-lg"
                style={{ backgroundColor: 'rgba(18, 22, 34, 0.86)' }}
              >
                <div className="flex items-center justify-between gap-2 text-xs font-semibold mb-1.5">
                  <div className="flex items-center gap-1.5" style={{ color: meta.colorHex }}>
                    <PowerIcon type={p.type} />
                    <span className="text-white">{meta.label}</span>
                  </div>
                  <span className="font-mono-num text-slate-200">
                    {p.remaining.toFixed(1)}s
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-white/15 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-100"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: meta.colorHex,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom-Right: Compact Mobile Touch Action Pad (also handy on touchscreen laptops) */}
        <div className="pointer-events-auto flex items-end gap-2 sm:opacity-85">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onPointerDown={(e) => {
                e.stopPropagation();
                onMoveLeft();
              }}
              aria-label="Move left"
              className="w-12 h-12 rounded-xl flex items-center justify-center border border-white/20 text-white active:scale-90 transition-transform cursor-pointer"
              style={{ backgroundColor: 'rgba(18, 22, 34, 0.72)' }}
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              type="button"
              onPointerDown={(e) => {
                e.stopPropagation();
                onMoveRight();
              }}
              aria-label="Move right"
              className="w-12 h-12 rounded-xl flex items-center justify-center border border-white/20 text-white active:scale-90 transition-transform cursor-pointer"
              style={{ backgroundColor: 'rgba(18, 22, 34, 0.72)' }}
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
          <div className="flex flex-col gap-1.5">
            <button
              type="button"
              onPointerDown={(e) => {
                e.stopPropagation();
                onJump();
              }}
              aria-label="Jump"
              className="w-12 h-12 rounded-xl flex items-center justify-center border border-white/20 text-white active:scale-90 transition-transform cursor-pointer"
              style={{ backgroundColor: 'rgba(18, 22, 34, 0.72)' }}
            >
              <ChevronUp className="w-6 h-6" />
            </button>
            <button
              type="button"
              onPointerDown={(e) => {
                e.stopPropagation();
                onSlide();
              }}
              aria-label="Slide"
              className="w-12 h-12 rounded-xl flex items-center justify-center border border-white/20 text-white active:scale-90 transition-transform cursor-pointer"
              style={{ backgroundColor: 'rgba(18, 22, 34, 0.72)' }}
            >
              <ChevronDown className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
