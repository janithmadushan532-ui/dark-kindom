import React, { useState } from 'react';
import {
  Check,
  Coins,
  EyeOff,
  Feather,
  Lock,
  Magnet,
  Play,
  Shield,
  Sparkles,
  Target,
  Trophy,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import { getActiveMissions } from '../game/storage';
import {
  CHARACTERS,
  CharacterId,
  HOVERBOARDS,
  HoverboardId,
  POWERUP_META,
  PowerUpType,
  SaveData,
  WORLDS,
  WorldId,
} from '../game/types';

interface MainMenuProps {
  save: SaveData;
  onSelectWorld: (worldId: WorldId) => void;
  onStartGame: () => void;
  onToggleMute: () => void;
  onUnlockCharacter: (id: CharacterId) => void;
  onSelectCharacter: (id: CharacterId) => void;
  onUnlockHoverboard: (id: HoverboardId) => void;
  onSelectHoverboard: (id: HoverboardId) => void;
  onClaimMission: (missionId: string) => void;
}

type DrawerTab = null | 'garage' | 'missions';

export const MainMenu: React.FC<MainMenuProps> = ({
  save,
  onSelectWorld,
  onStartGame,
  onToggleMute,
  onUnlockCharacter,
  onSelectCharacter,
  onUnlockHoverboard,
  onSelectHoverboard,
  onClaimMission,
}) => {
  const [drawer, setDrawer] = useState<DrawerTab>(null);
  const [garageSub, setGarageSub] = useState<'characters' | 'boards'>('characters');

  const activeMissions = getActiveMissions(save);
  const claimableCount = activeMissions.filter(
    (m) => (save.missionProgress[m.id] ?? 0) >= m.target
  ).length;

  const selectedWorld = WORLDS.find((w) => w.id === save.selectedWorld) ?? WORLDS[0];

  return (
    <div className="fixed inset-0 z-20 pointer-events-none flex flex-col justify-between p-4 sm:p-6">
      {/* Top Bar: Brand Lockup (Left) + Coins & Audio (Right) */}
      <div className="flex items-start justify-between gap-4">
        <div className="pointer-events-auto max-w-md">
          {/* Bespoke Inline SVG Title Lockup */}
          <svg
            viewBox="0 0 420 92"
            className="w-64 sm:w-80 h-auto drop-shadow-[0_4px_14px_rgba(15,23,42,0.55)]"
            role="img"
            aria-label="Cute World Adventure"
          >
            <defs>
              <linearGradient id="cwaTitleGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#FFFBEB" />
                <stop offset="55%" stopColor="#FDE68A" />
                <stop offset="100%" stopColor="#F9A8D4" />
              </linearGradient>
            </defs>
            <text
              x="6"
              y="40"
              fill="#0F172A"
              stroke="#0F172A"
              strokeWidth="7"
              strokeLinejoin="round"
              fontFamily="Outfit, sans-serif"
              fontWeight="800"
              fontSize="36"
              letterSpacing="-0.5"
            >
              Cute World
            </text>
            <text
              x="6"
              y="40"
              fill="url(#cwaTitleGrad)"
              fontFamily="Outfit, sans-serif"
              fontWeight="800"
              fontSize="36"
              letterSpacing="-0.5"
            >
              Cute World
            </text>
            <text
              x="8"
              y="76"
              fill="#0F172A"
              stroke="#0F172A"
              strokeWidth="6"
              strokeLinejoin="round"
              fontFamily="Outfit, sans-serif"
              fontWeight="800"
              fontSize="30"
              letterSpacing="1.5"
            >
              ADVENTURE
            </text>
            <text
              x="8"
              y="76"
              fill="#38BDF8"
              fontFamily="Outfit, sans-serif"
              fontWeight="800"
              fontSize="30"
              letterSpacing="1.5"
            >
              ADVENTURE
            </text>
          </svg>
        </div>

        {/* Top-Right Currency + Audio */}
        <div className="pointer-events-auto flex items-center gap-2.5">
          <div
            className="flex items-center gap-2 rounded-2xl px-4 py-2.5 border border-white/15 text-white shadow-lg"
            style={{ backgroundColor: 'rgba(18, 22, 34, 0.85)' }}
          >
            <Coins className="w-5 h-5 text-amber-400" />
            <span className="font-mono-num font-bold text-base">
              {save.totalCoins.toLocaleString()}
            </span>
          </div>
          <button
            type="button"
            onClick={onToggleMute}
            aria-label={save.muted ? 'Unmute audio' : 'Mute audio'}
            className="w-11 h-11 rounded-2xl flex items-center justify-center border border-white/15 text-white hover:bg-slate-800 transition-colors cursor-pointer shadow-lg"
            style={{ backgroundColor: 'rgba(18, 22, 34, 0.85)' }}
          >
            {save.muted ? <VolumeX className="w-5 h-5 text-slate-300" /> : <Volume2 className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Bottom Dock: 6 World Selector + Play CTA + Garage & Missions */}
      <div className="pointer-events-auto mx-auto w-full max-w-4xl">
        <div
          className="rounded-3xl p-3 sm:p-4 border border-white/15 shadow-2xl text-white"
          style={{ backgroundColor: 'rgba(18, 22, 34, 0.88)' }}
        >
          {/* 6 Worlds Strip */}
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-3">
            {WORLDS.map((w) => {
              const active = w.id === save.selectedWorld;
              const best = save.bestScores[w.id] ?? 0;
              return (
                <button
                  key={w.id}
                  type="button"
                  onClick={() => onSelectWorld(w.id)}
                  className={`text-left rounded-2xl px-2.5 py-2 border transition-all cursor-pointer ${
                    active
                      ? 'border-white bg-white/15 shadow-sm'
                      : 'border-white/10 bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span
                      className="w-2.5 h-2.5 rounded-sm shrink-0"
                      style={{ backgroundColor: w.accentHex }}
                    />
                    <span className="font-display font-bold text-xs truncate">
                      {w.name.replace(' World', '').replace('Cute Green ', '')}
                    </span>
                  </div>
                  <div className="font-mono-num text-[11px] text-slate-300 truncate">
                    Best {best.toLocaleString()}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Primary Play Action + Garage & Missions */}
          <div className="flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setDrawer(drawer === 'garage' ? null : 'garage')}
                className="px-4 py-2.5 rounded-2xl border border-white/15 bg-white/10 hover:bg-white/15 text-sm font-semibold flex items-center gap-2 cursor-pointer transition-colors whitespace-nowrap"
              >
                <Sparkles className="w-4 h-4 text-pink-300" />
                <span>Characters &amp; Boards</span>
              </button>

              <button
                type="button"
                onClick={() => setDrawer(drawer === 'missions' ? null : 'missions')}
                className="px-4 py-2.5 rounded-2xl border border-white/15 bg-white/10 hover:bg-white/15 text-sm font-semibold flex items-center gap-2 cursor-pointer transition-colors whitespace-nowrap"
              >
                <Target className="w-4 h-4 text-emerald-300" />
                <span>Missions</span>
                {claimableCount > 0 && (
                  <span className="font-mono-num text-xs font-bold text-amber-300">
                    ({claimableCount} Ready)
                  </span>
                )}
              </button>
            </div>

            <div className="flex items-center gap-3 ml-auto">
              <div className="hidden md:block text-right">
                <div className="text-xs font-semibold text-white">{selectedWorld.name}</div>
                <div className="text-[11px] text-slate-300">{selectedWorld.subtitle}</div>
              </div>
              <button
                type="button"
                onClick={onStartGame}
                className="px-7 py-3 rounded-2xl font-display font-extrabold text-base text-slate-950 shadow-lg hover:brightness-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap"
                style={{ backgroundColor: selectedWorld.accentHex }}
              >
                <Play className="w-5 h-5 fill-slate-950" />
                <span>Play Adventure</span>
              </button>
            </div>
          </div>

          {/* Single Flat Control Hint Line */}
          <div className="mt-2.5 pt-2 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-300">
            <span>Swipe or Arrow Keys / WASD to Steer, Jump &amp; Slide · Esc Pause</span>
            <span>6 Portal Worlds · Curved Roads · 4 Power-Ups</span>
          </div>
        </div>
      </div>

      {/* Garage / Missions Modal Drawer */}
      {drawer && (
        <div
          className="fixed inset-0 z-30 pointer-events-auto flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(10, 14, 24, 0.72)' }}
          onClick={() => setDrawer(null)}
        >
          <div
            className="w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-3xl p-5 sm:p-6 border border-white/15 text-white shadow-2xl"
            style={{ backgroundColor: '#161B2B' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-2.5">
                {drawer === 'garage' ? (
                  <Sparkles className="w-5 h-5 text-pink-300" />
                ) : (
                  <Trophy className="w-5 h-5 text-amber-300" />
                )}
                <h2 className="font-display font-bold text-xl">
                  {drawer === 'garage' ? 'Characters & Hoverboards' : 'Missions & Power-Ups'}
                </h2>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-sm font-mono-num font-bold text-amber-300">
                  <Coins className="w-4 h-4" />
                  <span>{save.totalCoins.toLocaleString()}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setDrawer(null)}
                  aria-label="Close panel"
                  className="w-9 h-9 rounded-xl flex items-center justify-center bg-white/10 hover:bg-white/20 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {drawer === 'garage' ? (
              <div>
                <div className="flex items-center gap-2 p-1 rounded-xl bg-white/5 border border-white/10 mb-4 w-fit">
                  <button
                    type="button"
                    onClick={() => setGarageSub('characters')}
                    className={`px-4 py-1.5 rounded-lg text-sm font-semibold cursor-pointer transition-colors ${
                      garageSub === 'characters'
                        ? 'bg-white text-slate-900'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    Characters
                  </button>
                  <button
                    type="button"
                    onClick={() => setGarageSub('boards')}
                    className={`px-4 py-1.5 rounded-lg text-sm font-semibold cursor-pointer transition-colors ${
                      garageSub === 'boards'
                        ? 'bg-white text-slate-900'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    Hoverboards
                  </button>
                </div>

                {garageSub === 'characters' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {CHARACTERS.map((char) => {
                      const unlocked = save.unlockedCharacters.includes(char.id);
                      const selected = save.selectedCharacter === char.id;
                      const canAfford = save.totalCoins >= char.cost;
                      return (
                        <div
                          key={char.id}
                          className={`rounded-2xl p-4 border flex flex-col justify-between gap-3 ${
                            selected
                              ? 'border-sky-400 bg-sky-400/10'
                              : 'border-white/10 bg-white/5'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <span className="font-display font-bold text-base">
                                {char.name}
                              </span>
                              <span
                                className="w-5 h-5 rounded-md border border-white/30"
                                style={{ backgroundColor: char.primaryHex }}
                              />
                            </div>
                            <p className="text-xs text-slate-300">{char.tagline}</p>
                          </div>

                          {unlocked ? (
                            <button
                              type="button"
                              onClick={() => onSelectCharacter(char.id)}
                              className={`w-full py-2 rounded-xl text-sm font-semibold flex items-center justify-center gap-1.5 cursor-pointer ${
                                selected
                                  ? 'bg-sky-400 text-slate-950'
                                  : 'bg-white/10 hover:bg-white/20 text-white'
                              }`}
                            >
                              {selected && <Check className="w-4 h-4" />}
                              <span>{selected ? 'Equipped' : 'Equip'}</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              disabled={!canAfford}
                              onClick={() => onUnlockCharacter(char.id)}
                              className={`w-full py-2 rounded-xl text-sm font-semibold flex items-center justify-center gap-1.5 ${
                                canAfford
                                  ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 cursor-pointer'
                                  : 'bg-white/10 text-slate-400 cursor-not-allowed'
                              }`}
                            >
                              <Lock className="w-4 h-4" />
                              <span className="font-mono-num">Unlock · {char.cost} Coins</span>
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {HOVERBOARDS.map((board) => {
                      const unlocked = save.unlockedHoverboards.includes(board.id);
                      const selected = save.selectedHoverboard === board.id;
                      const canAfford = save.totalCoins >= board.cost;
                      return (
                        <div
                          key={board.id}
                          className={`rounded-2xl p-4 border flex flex-col justify-between gap-3 ${
                            selected
                              ? 'border-pink-400 bg-pink-400/10'
                              : 'border-white/10 bg-white/5'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <span className="font-display font-bold text-base">
                                {board.name}
                              </span>
                              <span
                                className="w-5 h-5 rounded-md border border-white/30"
                                style={{ backgroundColor: board.deckHex }}
                              />
                            </div>
                            <p className="text-xs text-slate-300">{board.tagline}</p>
                          </div>

                          {unlocked ? (
                            <button
                              type="button"
                              onClick={() => onSelectHoverboard(board.id)}
                              className={`w-full py-2 rounded-xl text-sm font-semibold flex items-center justify-center gap-1.5 cursor-pointer ${
                                selected
                                  ? 'bg-pink-400 text-slate-950'
                                  : 'bg-white/10 hover:bg-white/20 text-white'
                              }`}
                            >
                              {selected && <Check className="w-4 h-4" />}
                              <span>{selected ? 'Equipped' : 'Equip'}</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              disabled={!canAfford}
                              onClick={() => onUnlockHoverboard(board.id)}
                              className={`w-full py-2 rounded-xl text-sm font-semibold flex items-center justify-center gap-1.5 ${
                                canAfford
                                  ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 cursor-pointer'
                                  : 'bg-white/10 text-slate-400 cursor-not-allowed'
                              }`}
                            >
                              <Lock className="w-4 h-4" />
                              <span className="font-mono-num">Unlock · {board.cost} Coins</span>
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-5">
                {/* Active Missions */}
                <div className="space-y-2.5">
                  {activeMissions.map((m) => {
                    const prog = save.missionProgress[m.id] ?? 0;
                    const done = prog >= m.target;
                    const claimed = save.claimedMissions.includes(m.id);
                    const pct = Math.min(100, Math.round((prog / m.target) * 100));
                    return (
                      <div
                        key={m.id}
                        className="rounded-2xl p-3.5 border border-white/10 bg-white/5 flex items-center justify-between gap-4"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="font-semibold text-sm truncate">{m.title}</span>
                            <span className="font-mono-num text-xs text-slate-300 shrink-0">
                              {prog} / {m.target}
                            </span>
                          </div>
                          <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-emerald-400"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>

                        {claimed ? (
                          <span className="text-xs font-semibold text-emerald-300 shrink-0">
                            Claimed
                          </span>
                        ) : done ? (
                          <button
                            type="button"
                            onClick={() => onClaimMission(m.id)}
                            className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-mono-num text-xs font-bold cursor-pointer shrink-0"
                          >
                            Claim +{m.reward}
                          </button>
                        ) : (
                          <span className="font-mono-num text-xs text-amber-300 shrink-0">
                            +{m.reward} Coins
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Four Collectible Power-Ups Reference */}
                <div className="pt-3 border-t border-white/10">
                  <h3 className="font-display font-bold text-sm text-slate-200 mb-2.5">
                    Four Collectible Power-Ups
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {(['magnet', 'invisibility', 'bird', 'shield'] as PowerUpType[]).map((pt) => {
                      const meta = POWERUP_META[pt];
                      return (
                        <div
                          key={pt}
                          className="rounded-xl p-3 border border-white/10 bg-white/5 flex items-start gap-3"
                        >
                          <div
                            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-slate-950"
                            style={{ backgroundColor: meta.colorHex }}
                          >
                            {pt === 'magnet' && <Magnet className="w-5 h-5" />}
                            {pt === 'invisibility' && <EyeOff className="w-5 h-5" />}
                            {pt === 'bird' && <Feather className="w-5 h-5" />}
                            {pt === 'shield' && <Shield className="w-5 h-5" />}
                          </div>
                          <div>
                            <div className="font-semibold text-sm flex items-center gap-2">
                              <span>{meta.label}</span>
                              <span className="font-mono-num text-xs text-slate-300">
                                {meta.duration}s
                              </span>
                            </div>
                            <p className="text-xs text-slate-300 mt-0.5">{meta.description}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
