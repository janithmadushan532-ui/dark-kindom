import React from 'react';
import {
  Award,
  Coins,
  Gift,
  GraduationCap,
  Map as MapIcon,
  Play,
  Settings,
  Shield,
  Star,
  Swords,
} from 'lucide-react';
import { ALL_LEVELS } from '../levels';
import { LESSON_MAP } from '../mcq';
import { calculatePlayerLevel, canClaimDailyReward, getTotalStars } from '../storage';
import { SaveData } from '../types';
import { WORLDS } from '../worlds';

interface MainMenuProps {
  save: SaveData;
  onContinue: () => void;
  onOpenWorldSelect: () => void;
  onOpenWeapons: () => void;
  onOpenScienceLessons: () => void;
  onOpenAchievements: () => void;
  onOpenDailyReward: () => void;
  onOpenSettings: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  save,
  onContinue,
  onOpenWorldSelect,
  onOpenWeapons,
  onOpenScienceLessons,
  onOpenAchievements,
  onOpenDailyReward,
  onOpenSettings,
}) => {
  const totalStars = getTotalStars(save);
  const clearedCount = Object.keys(save.levelStars).length;
  const selectedMcqUnit =
    save.mcqSelectedMode && save.mcqSelectedMode !== 'ALL_UNITS'
      ? LESSON_MAP[save.mcqSelectedMode] ?? null
      : null;
  const levelInfo = calculatePlayerLevel(save.xp);
  const dailyAvailable = canClaimDailyReward(save);

  return (
    <div className="relative flex h-full w-full flex-col overflow-y-auto bg-[#0b0e14] text-slate-100">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 50% 20%, rgba(245, 158, 11, 0.16), transparent 55%), radial-gradient(circle at 20% 85%, rgba(22, 101, 52, 0.14), transparent 45%)',
        }}
      />

      {/* Top status bar */}
      <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between border-b border-slate-800/80 px-4 py-3 sm:px-8">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-amber-500/40 bg-amber-500/10 text-amber-400">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-300">
              සේනාධිනායක මට්ටම {levelInfo.level}
            </div>
            <div className="mt-1 h-1.5 w-24 overflow-hidden rounded-full bg-slate-800 sm:w-28">
              <div
                className="h-full bg-amber-400 transition-all"
                style={{
                  width: `${Math.min(100, (levelInfo.currentXpInLevel / levelInfo.xpForNextLevel) * 100)}%`,
                }}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs font-semibold tabular-nums sm:gap-5 sm:text-sm">
          <div className="flex items-center gap-1.5 text-amber-300">
            <Coins className="h-4 w-4 text-amber-400" />
            <span>{save.coins}</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-200">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            <span>{totalStars} / {ALL_LEVELS.length * 3}</span>
          </div>
          <button
            onClick={onOpenSettings}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-700/80 bg-slate-900/90 text-slate-300 transition hover:border-amber-500/60 hover:text-amber-300"
            aria-label="සැකසුම්"
          >
            <Settings className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Main Focal Content */}
      <main className="relative z-10 mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center px-5 py-4 text-center sm:py-8">
        <p className="mb-1 text-[11px] font-semibold text-amber-400 sm:mb-2 sm:text-xs">
          මනඃකල්පිත ලෝක {WORLDS.length} · අතින් නිමවූ මට්ටම් {ALL_LEVELS.length} · ප්‍රධාන රාක්ෂයන් {WORLDS.length}
        </p>
        <h1 className="font-fantasy text-3xl font-extrabold text-slate-50 drop-shadow-md sm:text-5xl lg:text-6xl">
          අඳුරු රාජධානිය
        </h1>
        <h2 className="font-fantasy mt-1 text-base font-bold text-amber-400 sm:mt-1.5 sm:text-2xl">
          අවසාන ආරක්ෂාව
        </h2>
        <p className="mt-2 max-w-xl text-xs leading-relaxed text-slate-300 sm:mt-4 sm:text-base">
          නවීන ආරක්ෂක කුළුණු 14 කින් වංගු සහිත මාර්ග සවිමත් කර, එක් කුළුණකට උසස් කිරීමේ මං 3
          බැගින් ප්‍රගුණ කර, නොනවතින රාක්ෂ රැළි වලින් රාජකීය බලකොටුව රැක ගන්න.
        </p>

        {/* Primary Actions */}
        <div className="mt-4 flex w-full max-w-lg flex-col gap-2.5 sm:mt-7 sm:flex-row sm:gap-3">
          <button
            onClick={onContinue}
            className="flex min-h-[46px] flex-1 items-center justify-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-bold whitespace-nowrap text-slate-950 shadow-lg shadow-amber-500/25 transition hover:bg-amber-400 active:scale-[0.99] sm:min-h-[52px] sm:text-base"
          >
            <Play className="h-5 w-5 fill-current" />
            <span>
              {clearedCount > 0
                ? `ඉදිරියට · මට්ටම ${save.highestUnlockedLevel}`
                : 'මට්ටම 1 අරඹන්න · අහිමි වූ දොරටුව'}
            </span>
          </button>

          <button
            onClick={onOpenWorldSelect}
            className="flex min-h-[46px] flex-1 items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-5 py-2.5 text-sm font-bold whitespace-nowrap text-slate-100 transition hover:border-amber-500/60 hover:bg-slate-800 sm:min-h-[52px] sm:text-base"
          >
            <MapIcon className="h-5 w-5 text-amber-400" />
            <span>මෙහෙයුම් සිතියම</span>
          </button>
        </div>

        {/* Utility Grid */}
        <div className="mt-4 grid w-full max-w-2xl grid-cols-2 gap-2 sm:mt-6 sm:grid-cols-4 sm:gap-3">
          <button
            onClick={onOpenScienceLessons}
            className="flex min-h-[48px] flex-col items-center justify-center gap-1 rounded-xl border border-emerald-500/45 bg-emerald-500/12 p-2 text-xs font-semibold text-emerald-100 transition hover:border-emerald-400 hover:bg-emerald-500/20 sm:min-h-[58px] sm:p-3.5 sm:text-sm"
          >
            <GraduationCap className="h-4 w-4 text-emerald-300 sm:h-5 sm:w-5" />
            <span className="whitespace-nowrap">
              {selectedMcqUnit
                ? `Unit MCQ · ඒකකය ${String(selectedMcqUnit.unitNumber).padStart(2, '0')}`
                : 'Unit MCQ'}
            </span>
          </button>

          <button
            onClick={onOpenWeapons}
            className="flex min-h-[48px] flex-col items-center justify-center gap-1 rounded-xl border border-slate-800 bg-slate-900/85 p-2 text-xs font-semibold text-slate-200 transition hover:border-amber-500/50 hover:bg-slate-800 sm:min-h-[58px] sm:p-3.5 sm:text-sm"
          >
            <Swords className="h-4 w-4 text-sky-400 sm:h-5 sm:w-5" />
            <span className="whitespace-nowrap">ආයුධ වෙළඳසැල</span>
          </button>

          <button
            onClick={onOpenAchievements}
            className="flex min-h-[48px] flex-col items-center justify-center gap-1 rounded-xl border border-slate-800 bg-slate-900/85 p-2 text-xs font-semibold text-slate-200 transition hover:border-amber-500/50 hover:bg-slate-800 sm:min-h-[58px] sm:p-3.5 sm:text-sm"
          >
            <Award className="h-4 w-4 text-amber-400 sm:h-5 sm:w-5" />
            <span className="whitespace-nowrap">ජයග්‍රහණ</span>
          </button>

          <button
            onClick={onOpenDailyReward}
            className={`flex min-h-[48px] flex-col items-center justify-center gap-1 rounded-xl border p-2 text-xs font-semibold transition sm:min-h-[58px] sm:p-3.5 sm:text-sm ${
              dailyAvailable
                ? 'border-amber-500/70 bg-amber-500/15 text-amber-200 hover:bg-amber-500/25'
                : 'border-slate-800 bg-slate-900/85 text-slate-300 hover:border-slate-700'
            }`}
          >
            <Gift className="h-4 w-4 text-amber-400 sm:h-5 sm:w-5" />
            <span className="whitespace-nowrap">
              {dailyAvailable ? 'දිනපතා තෑග්ග' : 'දිනපතා ත්‍යාග'}
            </span>
          </button>
        </div>

        {/* Clean Unboxed Stats Summary */}
        <div className="mt-4 grid w-full max-w-2xl grid-cols-3 gap-4 border-t border-slate-800/80 pt-3 text-left text-xs text-slate-400 sm:mt-7 sm:pt-5 sm:text-sm">
          <div>
            <div className="text-slate-500">මෙහෙයුම් ප්‍රගතිය</div>
            <div className="font-mono-num mt-0.5 text-sm font-bold text-slate-100 sm:text-base">
              {clearedCount} / {ALL_LEVELS.length} ජයගත්තා
            </div>
          </div>
          <div>
            <div className="text-slate-500">පරාජිත රාක්ෂයන්</div>
            <div className="font-mono-num mt-0.5 text-sm font-bold text-slate-100 sm:text-base">
              {save.totalKills.toLocaleString()}
            </div>
          </div>
          <div>
            <div className="text-slate-500">පරාජිත රාක්ෂ රජුන්</div>
            <div className="font-mono-num mt-0.5 text-sm font-bold text-amber-300 sm:text-base">
              {save.bossesSlain} / {WORLDS.length}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
