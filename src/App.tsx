import React, { useEffect, useState } from 'react';
import { dkAudio } from './dk/audio';
import { Battlefield } from './dk/components/Battlefield';
import { MainMenu } from './dk/components/MainMenu';
import {
  AchievementsModal,
  DailyRewardModal,
  SettingsModal,
  WeaponCollectionModal,
} from './dk/components/MetaModals';
import { ScienceLessonsModal } from './dk/components/ScienceLessonsModal';
import { WorldLevelSelect } from './dk/components/WorldLevelSelect';
import { getLevelsByWorld, LEVEL_MAP } from './dk/levels';
import { advanceUnitCycleState, createEmptyModeProgress } from './dk/mcq';
import {
  applyDailyRewardClaim,
  calculatePlayerLevel,
  createDefaultSaveData,
  loadSaveData,
  saveSaveData,
} from './dk/storage';
import { GraphicsSettings, LevelConfig, McqStudyModeId, McqUnitId, SaveData } from './dk/types';
import { WORLD_MAP } from './dk/worlds';

class GameErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; message: string }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, message: error.message || 'අනපේක්ෂිත දෝෂයකි' };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-full w-full flex-col items-center justify-center bg-[#0b0d14] p-6 text-center text-slate-100">
          <h1 className="font-fantasy text-2xl font-bold text-amber-400">
            අඳුරු රාජධානිය: අවසාන ආරක්ෂාව
          </h1>
          <p className="mt-2 max-w-md text-sm text-slate-300">
            දර්ශන ප්‍රතිසාධන දෝෂයක් ඇති විය: {this.state.message}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-bold text-slate-950"
          >
            ක්‍රීඩාව නැවත පූරණය කරන්න
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const RotateDeviceOverlay: React.FC = () => (
  <div
    role="alert"
    aria-live="polite"
    className="rotate-device-overlay fixed inset-0 z-50 flex-col items-center justify-center bg-[#0b0d14] p-6 text-center text-slate-100"
  >
    <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-2xl border border-amber-500/35 bg-slate-900/90 shadow-2xl">
      <svg
        viewBox="0 0 64 64"
        className="animate-phone-rotate h-14 w-14 text-amber-400"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <rect x="20" y="10" width="24" height="44" rx="4" />
        <line x1="29" y1="48" x2="35" y2="48" />
        <path d="M12 24 C10 14, 18 8, 28 8" stroke="#38bdf8" strokeWidth="2.4" />
        <polyline points="10,20 12,25 17,23" stroke="#38bdf8" strokeWidth="2.4" />
      </svg>
    </div>

    <p className="text-xs font-semibold text-amber-400">
      අඳුරු රාජධානිය: අවසාන ආරක්ෂාව
    </p>
    <h2 className="font-fantasy mt-2 text-2xl font-bold text-white">
      ඔබේ උපාංගය හරස් අතට හරවන්න
    </h2>
    <p className="mt-3 max-w-xs text-sm leading-relaxed text-slate-300">
      16:9 සම්පූර්ණ සටන් බිම පාලනය කිරීමට කරුණාකර ඔබේ දුරකථනය හරස් අතට (Landscape) හරවන්න.
    </p>
  </div>
);

function tryLockLandscapeOrientation() {
  try {
    const ori = window.screen?.orientation as
      | (ScreenOrientation & { lock?: (orientation: string) => Promise<void> })
      | undefined;
    if (ori && typeof ori.lock === 'function') {
      void ori.lock('landscape').catch(() => {});
    }
  } catch {
    // Screen Orientation lock is optional and only active in fullscreen/supported browsers
  }
}

type Screen = 'menu' | 'world_select' | 'playing';
type ActiveModal = 'none' | 'weapons' | 'science_lessons' | 'achievements' | 'daily' | 'settings';

export default function App() {
  const [save, setSave] = useState<SaveData>(() => loadSaveData());
  const [screen, setScreen] = useState<Screen>('menu');
  const [activeModal, setActiveModal] = useState<ActiveModal>('none');
  const [activeLevel, setActiveLevel] = useState<LevelConfig>(() => LEVEL_MAP[1]);

  useEffect(() => {
    dkAudio.setSettings(save.musicEnabled, save.sfxEnabled);
    saveSaveData(save);
  }, [save]);

  const handleStartLevel = (level: LevelConfig) => {
    dkAudio.unlock();
    tryLockLandscapeOrientation();
    setActiveLevel(level);
    setActiveModal('none');
    setScreen('playing');
  };

  const handleContinue = () => {
    const nextLvl = LEVEL_MAP[save.highestUnlockedLevel] ?? LEVEL_MAP[1];
    handleStartLevel(nextLvl);
  };

  const handleLevelVictory = (payload: {
    levelId: number;
    stars: 1 | 2 | 3;
    score: number;
    kills: number;
    bossesSlain: number;
    bonusCoinsEarned: number;
    xpEarned: number;
  }) => {
    setSave((prev) => {
      const prevStars = prev.levelStars[payload.levelId] ?? 0;
      const isFirstClear = prevStars === 0;
      const awardedCoins = isFirstClear ? payload.bonusCoinsEarned : 0;
      const awardedXp = isFirstClear ? payload.xpEarned : 0;
      const nextXp = prev.xp + awardedXp;
      const lvlInfo = calculatePlayerLevel(nextXp);
      const prevBest = prev.levelBestScores[payload.levelId] ?? 0;

      const nextLevelStars = {
        ...prev.levelStars,
        [payload.levelId]: Math.max(prevStars, payload.stars),
      };

      const lvlDef = LEVEL_MAP[payload.levelId];
      const worldDef = lvlDef ? WORLD_MAP[lvlDef.worldId] : undefined;
      let worldBonus = 0;
      let nextClaimedWorldBonuses = prev.claimedWorldBonuses ?? [];
      if (
        worldDef &&
        worldDef.worldCompletionBonusCoins &&
        !nextClaimedWorldBonuses.includes(worldDef.id)
      ) {
        const wLevels = getLevelsByWorld(worldDef.id);
        if (wLevels.length > 0 && wLevels.every((l) => (nextLevelStars[l.id] ?? 0) > 0)) {
          worldBonus = worldDef.worldCompletionBonusCoins;
          nextClaimedWorldBonuses = [...nextClaimedWorldBonuses, worldDef.id];
        }
      }

      return {
        ...prev,
        coins: prev.coins + awardedCoins + worldBonus,
        xp: nextXp,
        playerLevel: lvlInfo.level,
        highestUnlockedLevel: Math.min(
          100,
          Math.max(prev.highestUnlockedLevel, payload.levelId + 1)
        ),
        levelStars: nextLevelStars,
        levelBestScores: {
          ...prev.levelBestScores,
          [payload.levelId]: Math.max(prevBest, payload.score),
        },
        totalKills: prev.totalKills + payload.kills,
        bossesSlain: prev.bossesSlain + payload.bossesSlain,
        claimedWorldBonuses: nextClaimedWorldBonuses,
      };
    });
  };

  const handleUpdateAudio = (music: boolean, sfx: boolean) => {
    setSave((prev) => ({ ...prev, musicEnabled: music, sfxEnabled: sfx }));
  };

  const handleUpdateGraphics = (graphics: GraphicsSettings) => {
    setSave((prev) => ({ ...prev, graphics }));
  };

  const handleMarkMcqShown = (unitId: McqUnitId, questionId: string, poolIds: string[]) => {
    setSave((prev) => {
      const existing = prev.mcqModeProgress[unitId] ?? createEmptyModeProgress(unitId);
      const cycle = advanceUnitCycleState(poolIds, existing.seenQuestionIds, questionId);
      return {
        ...prev,
        mcqModeProgress: {
          ...prev.mcqModeProgress,
          [unitId]: {
            ...existing,
            seenQuestionIds: cycle.nextSeenQuestionIds,
            lastQuestionId: cycle.lastQuestionId,
          },
        },
      };
    });
  };

  const handleRecordMcqAnswer = (
    questionId: string,
    isCorrect: boolean,
    _resetHistory: boolean,
    _poolIds?: string[]
  ) => {
    setSave((prev) => {
      const nextAnswered = Array.from(new Set([...prev.answeredMcqIds, questionId]));

      const nextModeProgress = { ...prev.mcqModeProgress };
      if (prev.mcqSelectedMode && prev.mcqSelectedMode !== 'ALL_UNITS') {
        const existing =
          nextModeProgress[prev.mcqSelectedMode] ??
          createEmptyModeProgress(prev.mcqSelectedMode);
        nextModeProgress[prev.mcqSelectedMode] = {
          ...existing,
          totalAnswered: existing.totalAnswered + 1,
          totalCorrect: existing.totalCorrect + (isCorrect ? 1 : 0),
        };
      }

      return {
        ...prev,
        answeredMcqIds: nextAnswered,
        mcqTotalAnswered: prev.mcqTotalAnswered + 1,
        mcqTotalCorrect: prev.mcqTotalCorrect + (isCorrect ? 1 : 0),
        mcqModeProgress: nextModeProgress,
      };
    });
  };

  const handleSelectMcqMode = (modeId: McqStudyModeId) => {
    setSave((prev) =>
      prev.mcqSelectedMode === modeId ? prev : { ...prev, mcqSelectedMode: modeId }
    );
  };

  return (
    <GameErrorBoundary>
      <div className="relative h-full w-full overflow-hidden bg-[#0b0d14]">
        <RotateDeviceOverlay />

        {screen === 'menu' && (
          <MainMenu
            save={save}
            onContinue={handleContinue}
            onOpenWorldSelect={() => setScreen('world_select')}
            onOpenWeapons={() => setActiveModal('weapons')}
            onOpenScienceLessons={() => setActiveModal('science_lessons')}
            onOpenAchievements={() => setActiveModal('achievements')}
            onOpenDailyReward={() => setActiveModal('daily')}
            onOpenSettings={() => setActiveModal('settings')}
          />
        )}

        {screen === 'world_select' && (
          <WorldLevelSelect
            save={save}
            initialLevelId={activeLevel.id}
            onBack={() => setScreen('menu')}
            onStartLevel={handleStartLevel}
          />
        )}

        {screen === 'playing' && (
          <Battlefield
            level={activeLevel}
            save={save}
            onExitToMap={() => setScreen('world_select')}
            onLevelVictory={handleLevelVictory}
            onLevelDefeatStats={(kills) =>
              setSave((prev) => ({ ...prev, totalKills: prev.totalKills + kills }))
            }
            onMarkMcqShown={handleMarkMcqShown}
            onRecordMcqAnswer={handleRecordMcqAnswer}
            onOpenUnitSelect={() => setActiveModal('science_lessons')}
            onNextLevel={(nextId) => {
              const next = LEVEL_MAP[nextId];
              if (next) handleStartLevel(next);
            }}
          />
        )}

        {activeModal === 'weapons' && (
          <WeaponCollectionModal onClose={() => setActiveModal('none')} />
        )}

        {activeModal === 'science_lessons' && (
          <ScienceLessonsModal
            save={save}
            onSelectMode={handleSelectMcqMode}
            onClose={() => setActiveModal('none')}
          />
        )}

        {activeModal === 'achievements' && (
          <AchievementsModal
            save={save}
            onClaim={(id, rewardCoins) =>
              setSave((prev) =>
                prev.claimedAchievements.includes(id)
                  ? prev
                  : {
                      ...prev,
                      coins: prev.coins + rewardCoins,
                      claimedAchievements: [...prev.claimedAchievements, id],
                    }
              )
            }
            onClose={() => setActiveModal('none')}
          />
        )}

        {activeModal === 'daily' && (
          <DailyRewardModal
            save={save}
            onClaimDaily={() =>
              setSave((prev) => applyDailyRewardClaim(prev).nextSave)
            }
            onClose={() => setActiveModal('none')}
          />
        )}

        {activeModal === 'settings' && (
          <SettingsModal
            save={save}
            onUpdateAudio={handleUpdateAudio}
            onUpdateGraphics={handleUpdateGraphics}
            onResetProgress={() => setSave(createDefaultSaveData())}
            onClose={() => setActiveModal('none')}
          />
        )}
      </div>
    </GameErrorBoundary>
  );
}
