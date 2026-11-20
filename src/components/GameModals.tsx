import React from 'react';
import {
  Coins,
  Home,
  Play,
  RotateCcw,
  Trophy,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { getActiveMissions } from '../game/storage';
import { SaveData, WORLDS, WorldId } from '../game/types';

interface PauseModalProps {
  muted: boolean;
  onResume: () => void;
  onRestart: () => void;
  onMenu: () => void;
  onToggleMute: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  muted,
  onResume,
  onRestart,
  onMenu,
  onToggleMute,
}) => {
  return (
    <div
      className="fixed inset-0 z-30 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(10, 14, 24, 0.72)' }}
    >
      <div
        className="w-full max-w-sm rounded-3xl p-6 border border-white/15 text-white shadow-2xl"
        style={{ backgroundColor: '#161B2B' }}
      >
        <h2 className="font-display font-extrabold text-2xl text-center mb-5">
          Game Paused
        </h2>

        <div className="flex flex-col gap-2.5">
          <button
            type="button"
            onClick={onResume}
            className="w-full py-3 rounded-2xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-display font-bold text-base flex items-center justify-center gap-2 cursor-pointer"
          >
            <Play className="w-5 h-5 fill-slate-950" />
            <span>Resume</span>
          </button>

          <button
            type="button"
            onClick={onRestart}
            className="w-full py-3 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Restart Run</span>
          </button>

          <button
            type="button"
            onClick={onToggleMute}
            className="w-full py-3 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            <span>{muted ? 'Audio Muted' : 'Audio On'}</span>
          </button>

          <button
            type="button"
            onClick={onMenu}
            className="w-full py-3 rounded-2xl bg-white/10 hover:bg-white/15 text-slate-200 font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>World Select &amp; Menu</span>
          </button>
        </div>
      </div>
    </div>
  );
};

interface GameOverModalProps {
  worldId: WorldId;
  distance: number;
  score: number;
  coins: number;
  isNewBest: boolean;
  save: SaveData;
  onRestart: () => void;
  onMenu: () => void;
  onClaimMission: (id: string) => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  worldId,
  distance,
  score,
  coins,
  isNewBest,
  save,
  onRestart,
  onMenu,
  onClaimMission,
}) => {
  const world = WORLDS.find((w) => w.id === worldId) ?? WORLDS[0];
  const activeMissions = getActiveMissions(save);
  const readyMission = activeMissions.find(
    (m) => (save.missionProgress[m.id] ?? 0) >= m.target && !save.claimedMissions.includes(m.id)
  );

  return (
    <div
      className="fixed inset-0 z-30 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(10, 14, 24, 0.76)' }}
    >
      <div
        className="w-full max-w-md rounded-3xl p-6 border border-white/15 text-white shadow-2xl"
        style={{ backgroundColor: '#161B2B' }}
      >
        <div className="text-center mb-5">
          <div className="text-xs font-semibold text-slate-300 mb-1">
            {world.name}
          </div>
          <h2 className="font-display font-extrabold text-3xl">Run Complete</h2>
          {isNewBest && (
            <div className="mt-2 inline-flex items-center gap-1.5 text-sm font-bold text-amber-300">
              <Trophy className="w-4 h-4" />
              <span>New World High Score</span>
            </div>
          )}
        </div>

        {/* Summary Metrics */}
        <div className="grid grid-cols-3 gap-2.5 mb-5">
          <div className="rounded-2xl p-3 bg-white/5 border border-white/10 text-center">
            <div className="text-[11px] text-slate-300">Score</div>
            <div className="font-mono-num text-xl font-bold mt-0.5">
              {score.toLocaleString()}
            </div>
          </div>
          <div className="rounded-2xl p-3 bg-white/5 border border-white/10 text-center">
            <div className="text-[11px] text-slate-300">Distance</div>
            <div className="font-mono-num text-xl font-bold text-sky-300 mt-0.5">
              {distance} m
            </div>
          </div>
          <div className="rounded-2xl p-3 bg-white/5 border border-white/10 text-center">
            <div className="text-[11px] text-slate-300">Coins</div>
            <div className="font-mono-num text-xl font-bold text-amber-300 mt-0.5 flex items-center justify-center gap-1">
              <Coins className="w-4 h-4" />
              <span>+{coins}</span>
            </div>
          </div>
        </div>

        {/* Claimable Mission Callout */}
        {readyMission && (
          <div className="mb-5 rounded-2xl p-3.5 border border-emerald-400/35 bg-emerald-400/10 flex items-center justify-between gap-3">
            <div>
              <div className="text-xs font-semibold text-emerald-300">Mission Complete</div>
              <div className="text-sm font-medium">{readyMission.title}</div>
            </div>
            <button
              type="button"
              onClick={() => onClaimMission(readyMission.id)}
              className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-mono-num text-xs font-bold cursor-pointer shrink-0"
            >
              Claim +{readyMission.reward}
            </button>
          </div>
        )}

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onMenu}
            className="flex-1 py-3 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>Menu</span>
          </button>

          <button
            type="button"
            onClick={onRestart}
            className="flex-[1.5] py-3 rounded-2xl font-display font-extrabold text-base text-slate-950 flex items-center justify-center gap-2 cursor-pointer hover:brightness-105 active:scale-95 transition-all"
            style={{ backgroundColor: world.accentHex }}
          >
            <RotateCcw className="w-5 h-5" />
            <span>Play Again</span>
          </button>
        </div>
      </div>
    </div>
  );
};
