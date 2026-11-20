import React, { useMemo, useState } from 'react';
import { CheckCircle2, ArrowLeft, Coins, Crown, Lock, Play, Shield, Skull, Star, Waves } from 'lucide-react';
import { ALL_LEVELS, getLevelsByWorld, LEVEL_MAP } from '../levels';
import { DIFFICULTY_SI } from '../localization/siLabels';
import { getTotalStars } from '../storage';
import { LevelConfig, SaveData, WorldId } from '../types';
import { WEAPON_MAP } from '../weapons';
import { WORLDS } from '../worlds';

interface WorldLevelSelectProps {
  save: SaveData;
  initialLevelId?: number;
  onBack: () => void;
  onStartLevel: (level: LevelConfig) => void;
}

export const WorldLevelSelect: React.FC<WorldLevelSelectProps> = ({
  save,
  initialLevelId,
  onBack,
  onStartLevel,
}) => {
  const initialLevel = LEVEL_MAP[initialLevelId ?? save.highestUnlockedLevel] ?? LEVEL_MAP[1];
  const [selectedWorldId, setSelectedWorldId] = useState<WorldId>(initialLevel.worldId);
  const [selectedLevelId, setSelectedLevelId] = useState<number>(initialLevel.id);

  const totalStars = getTotalStars(save);
  const worldLevels = useMemo(() => getLevelsByWorld(selectedWorldId), [selectedWorldId]);
  const selectedWorld = WORLDS.find((w) => w.id === selectedWorldId) ?? WORLDS[0];
  const selectedLevel =
    worldLevels.find((l) => l.id === selectedLevelId) ?? worldLevels[0] ?? LEVEL_MAP[1];

  const isLevelUnlocked = (lvl: LevelConfig) => {
    if (lvl.id <= 1) return true;
    return lvl.id <= save.highestUnlockedLevel;
  };

  const handleSelectWorld = (worldId: WorldId) => {
    setSelectedWorldId(worldId);
    const levels = getLevelsByWorld(worldId);
    const firstUnlocked = levels.find((l) => isLevelUnlocked(l)) ?? levels[0];
    if (firstUnlocked) setSelectedLevelId(firstUnlocked.id);
  };

  const unlockedSelected = isLevelUnlocked(selectedLevel);

  return (
    <div className="flex h-full w-full flex-col bg-[#0b0d14] text-slate-100">
      {/* Top Bar */}
      <header className="flex shrink-0 items-center justify-between border-b border-slate-800 px-4 py-3 sm:px-6">
        <button
          onClick={onBack}
          className="flex min-h-[44px] items-center gap-2 rounded-lg border border-slate-700/80 bg-slate-900 px-3.5 py-2 text-sm font-semibold whitespace-nowrap text-slate-200 hover:border-amber-500/60"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>ප්‍රධාන මෙනුව</span>
        </button>

        <h1 className="font-fantasy text-base font-bold text-amber-400 sm:text-xl">
          මෙහෙයුම් සිතියම · ලෝක {WORLDS.length} · මට්ටම් {ALL_LEVELS.length}
        </h1>

        <div className="flex items-center gap-4 text-sm font-semibold tabular-nums">
          <span className="flex items-center gap-1 text-amber-300">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            {totalStars}/{ALL_LEVELS.length * 3}
          </span>
          <span className="hidden items-center gap-1 text-amber-300 sm:flex">
            <Coins className="h-4 w-4 text-amber-400" />
            {save.coins}
          </span>
        </div>
      </header>

      {/* Main Split Content */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden lg:flex-row">
        {/* World List Sidebar */}
        <aside className="flex shrink-0 gap-2 overflow-x-auto border-b border-slate-800 bg-slate-950/60 p-3 lg:w-72 lg:flex-col lg:overflow-y-auto lg:border-r lg:border-b-0">
          {WORLDS.map((world) => {
            const wLevels = getLevelsByWorld(world.id);
            const wStars = wLevels.reduce((s, l) => s + (save.levelStars[l.id] ?? 0), 0);
            const wMaxStars = wLevels.length * 3;
            const wCompleted = wLevels.length > 0 && wLevels.every((l) => (save.levelStars[l.id] ?? 0) > 0);
            const wUnlocked = wLevels.some((l) => isLevelUnlocked(l));
            const active = world.id === selectedWorldId;

            return (
              <button
                key={world.id}
                onClick={() => handleSelectWorld(world.id)}
                className={`flex min-w-[180px] shrink-0 items-center justify-between rounded-xl border px-3.5 py-2.5 text-left transition lg:min-w-0 ${
                  active
                    ? 'border-amber-500 bg-amber-500/15 text-slate-50'
                    : wUnlocked
                      ? 'border-slate-800 bg-slate-900/70 text-slate-300 hover:border-slate-700'
                      : 'border-slate-800/60 bg-slate-900/30 text-slate-500'
                }`}
              >
                <div className="min-w-0 pr-2">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-400/90">
                    <span>ලෝකය {world.index}</span>
                    {wCompleted && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />}
                  </div>
                  <div className="truncate text-sm font-bold">{world.name}</div>
                </div>
                <div className="font-mono-num shrink-0 text-xs font-bold text-slate-300">
                  {wUnlocked ? `${wStars}/${wMaxStars} ★` : <Lock className="h-4 w-4 text-slate-600" />}
                </div>
              </button>
            );
          })}
        </aside>

        {/* Center + Right: World Levels + Full Preview */}
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-4 sm:p-6">
          {/* World Header */}
          <div
            className="mb-5 rounded-xl border border-slate-800 p-4 sm:p-5"
            style={{
              background: `linear-gradient(120deg, ${selectedWorld.bgPrimaryHex}, ${selectedWorld.bgSecondaryHex})`,
            }}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="text-xs font-bold text-amber-400">
                  ලෝකය {selectedWorld.index} · {selectedWorld.terrainName} · මට්ටම් {worldLevels[0]?.id}–{worldLevels[worldLevels.length - 1]?.id}
                </div>
                <h2 className="font-fantasy mt-0.5 text-2xl font-bold text-white">
                  {selectedWorld.name}
                </h2>
              </div>
              <div className="text-right text-xs font-semibold text-slate-200">
                <div>{selectedWorld.subtitle}</div>
                {selectedWorld.worldCompletionBonusCoins && (
                  <div className="mt-1 text-amber-300">
                    ලෝකය සම්පූර්ණ ත්‍යාගය: +{selectedWorld.worldCompletionBonusCoins} කාසි
                    {(save.claimedWorldBonuses ?? []).includes(selectedWorld.id) ? ' (ලබාගත්තා ✓)' : ''}
                  </div>
                )}
              </div>
            </div>
            <p className="mt-2 max-w-3xl text-sm text-slate-300">{selectedWorld.description}</p>
          </div>

          {/* 5 Levels Row */}
          <div className="mb-5 grid grid-cols-1 gap-2.5 sm:grid-cols-5">
            {worldLevels.map((lvl) => {
              const unlocked = isLevelUnlocked(lvl);
              const stars = save.levelStars[lvl.id] ?? 0;
              const isSelected = lvl.id === selectedLevel.id;
              const isBoss = Boolean(lvl.bossConfig);

              return (
                <button
                  key={lvl.id}
                  onClick={() => setSelectedLevelId(lvl.id)}
                  className={`flex flex-col justify-between rounded-xl border p-3.5 text-left transition ${
                    isSelected
                      ? 'border-amber-400 bg-slate-800/95 ring-1 ring-amber-400/50'
                      : unlocked
                        ? 'border-slate-800 bg-slate-900/80 hover:border-slate-600'
                        : 'border-slate-800/60 bg-slate-950/60 text-slate-500'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono-num flex items-center gap-1 text-xs font-bold text-amber-400">
                      <span>මට්ටම {lvl.id}</span>
                      {stars > 0 && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />}
                    </span>
                    {!unlocked ? (
                      <Lock className="h-4 w-4 text-slate-600" />
                    ) : isBoss ? (
                      <Crown className="h-4 w-4 text-rose-400" />
                    ) : null}
                  </div>

                  <div className="mt-1.5 truncate text-sm font-bold text-slate-100">
                    {lvl.name}
                  </div>

                  <div className="mt-2 flex items-center justify-between text-xs">
                    <span className="text-slate-400">{DIFFICULTY_SI[lvl.difficulty]}</span>
                    <span className="flex items-center gap-0.5">
                      {[1, 2, 3].map((s) => (
                        <Star
                          key={s}
                          className={`h-3.5 w-3.5 ${
                            s <= stars
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-slate-700'
                          }`}
                        />
                      ))}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Selected Level Full Briefing */}
          <div className="grid grid-cols-1 gap-4 rounded-xl border border-slate-800 bg-slate-900/90 p-5 lg:grid-cols-3">
            <div className="space-y-4 lg:col-span-2">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="text-xs font-bold text-amber-400">
                    මට්ටම {selectedLevel.id} විස්තරය · {DIFFICULTY_SI[selectedLevel.difficulty]}{' '}
                    (අපහසුතාව {selectedLevel.difficultyRating}/10)
                  </div>
                  <h3 className="font-fantasy mt-0.5 text-xl font-bold text-white sm:text-2xl">
                    {selectedLevel.name}
                  </h3>
                </div>
                <div className="font-mono-num text-xs text-slate-400">
                  මාර්ග දිග: මීටර් {selectedLevel.roadLayout.totalLength} · ඉදිකිරීම් ස්ථාන{' '}
                  {selectedLevel.buildZones.length}
                </div>
              </div>

              <p className="text-sm text-slate-300">{selectedLevel.description}</p>
              <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-3 text-xs text-slate-300">
                <strong className="text-amber-300">අරමුණ:</strong> {selectedLevel.objective}
                <div className="mt-1 text-slate-400">
                  <strong>මාර්ග සැලැස්ම:</strong> {selectedLevel.roadLayout.curvesDescription} ·
                  සතුරු පිවිසුම් {selectedLevel.spawns.length}
                </div>
                <div className="mt-1 text-slate-400">
                  <strong>පාරිසරික අභියෝගය:</strong> {selectedLevel.environment.hazardDescription}
                </div>
              </div>

              {/* Boss Alert if present */}
              {selectedLevel.bossConfig && (
                <div className="rounded-lg border border-rose-500/40 bg-rose-950/30 p-3 text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-rose-300">
                    <Skull className="h-4 w-4" />
                    <span>
                      ප්‍රධාන රාක්ෂ සටන: {selectedLevel.bossConfig.name} (
                      {selectedLevel.bossConfig.title})
                    </span>
                  </div>
                  <div className="mt-1 text-rose-200/80">
                    මූලික ජීව ශක්තිය: {selectedLevel.bossConfig.hp.toLocaleString()} · සන්නාහය:{' '}
                    {selectedLevel.bossConfig.armor} · හැකියාවන්:{' '}
                    {selectedLevel.bossConfig.abilities.join(', ')}
                  </div>
                </div>
              )}

              {/* Bonus Objectives & Restrictions */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-lg border border-slate-800 bg-slate-950/50 p-3 text-xs">
                  <div className="mb-1 font-bold text-emerald-400">අතිරේක අරමුණු</div>
                  <ul className="space-y-1 text-slate-300">
                    {selectedLevel.bonusObjectives
                      .filter((bo) => bo.type !== 'mcq_perfect')
                      .map((bo) => (
                        <li key={bo.id}>
                          • {bo.description} (+{bo.rewardCoins} කාසි)
                        </li>
                      ))}
                  </ul>
                </div>

                <div className="rounded-lg border border-slate-800 bg-slate-950/50 p-3 text-xs">
                  <div className="mb-1 font-bold text-sky-400">
                    උපායමාර්ගික නීති සහ අභියෝග
                  </div>
                  <ul className="space-y-1 text-slate-300">
                    {selectedLevel.restrictions.map((r, i) => (
                      <li key={i}>• {r}</li>
                    ))}
                    {selectedLevel.specialChallenges.map((c, i) => (
                      <li key={`c_${i}`}>• {c}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Right Stats & Launch Column */}
            <div className="flex flex-col justify-between gap-4 border-t border-slate-800 pt-4 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-5">
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-lg bg-slate-950/80 p-2.5">
                    <Shield className="mx-auto h-4 w-4 text-emerald-400" />
                    <div className="font-mono-num mt-1 text-sm font-bold">
                      {selectedLevel.castleHealth}
                    </div>
                    <div className="text-[10px] text-slate-400">ජීව ශක්තිය</div>
                  </div>
                  <div className="rounded-lg bg-slate-950/80 p-2.5">
                    <Coins className="mx-auto h-4 w-4 text-amber-400" />
                    <div className="font-mono-num mt-1 text-sm font-bold">
                      {selectedLevel.startingCoins}
                    </div>
                    <div className="text-[10px] text-slate-400">ආරම්භක කාසි</div>
                  </div>
                  <div className="rounded-lg bg-slate-950/80 p-2.5">
                    <Waves className="mx-auto h-4 w-4 text-sky-400" />
                    <div className="font-mono-num mt-1 text-sm font-bold">
                      {selectedLevel.waveCount}
                    </div>
                    <div className="text-[10px] text-slate-400">සතුරු වටය</div>
                  </div>
                </div>

                <div>
                  <div className="mb-1.5 text-xs font-bold text-slate-400">
                    අවසර ලත් අවි ({selectedLevel.availableWeapons.length})
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedLevel.availableWeapons.map((wId) => (
                      <span
                        key={wId}
                        className="rounded border border-slate-700 bg-slate-950 px-2 py-1 text-[11px] font-medium text-slate-200"
                      >
                        {WEAPON_MAP[wId].name}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="rounded-lg bg-slate-950/70 p-3 text-xs text-slate-300">
                  <div className="font-bold text-amber-300">ජයග්‍රහණ ත්‍යාග</div>
                  <div className="mt-1">
                    +{selectedLevel.rewards.coins} රන් කාසි · +{selectedLevel.rewards.xp} XP ·
                    තරු 3 දක්වා
                  </div>
                </div>
              </div>

              <button
                disabled={!unlockedSelected}
                onClick={() => onStartLevel(selectedLevel)}
                className={`flex min-h-[50px] w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-base font-bold whitespace-nowrap transition ${
                  unlockedSelected
                    ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 hover:bg-amber-400'
                    : 'cursor-not-allowed border border-slate-800 bg-slate-900 text-slate-500'
                }`}
              >
                {unlockedSelected ? (
                  <>
                    <Play className="h-5 w-5 fill-current" />
                    <span>ආරක්ෂාව අරඹන්න</span>
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4" />
                    <span>පළමුව මට්ටම {selectedLevel.id - 1} ජය ගන්න</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
