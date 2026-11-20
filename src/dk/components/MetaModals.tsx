import React, { useState } from 'react';
import { Award, Check, Coins, Gift, RotateCcw, Settings, Swords, Volume2, X } from 'lucide-react';
import { ACHIEVEMENTS, getAchievementProgress } from '../achievements';
import { canClaimDailyReward } from '../storage';
import { GraphicsSettings, SaveData } from '../types';
import { getWeaponMcqRequirement, getWeaponQualityTier, WEAPONS } from '../weapons';
import { WeaponArtwork } from './WeaponArtwork';

interface WeaponCollectionModalProps {
  onClose: () => void;
}

export const WeaponCollectionModal: React.FC<WeaponCollectionModalProps> = ({ onClose }) => {
  const [selectedId, setSelectedId] = useState(WEAPONS[0].id);
  const weapon = WEAPONS.find((w) => w.id === selectedId) ?? WEAPONS[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-sm">
      <div className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 px-5 py-3.5">
          <div className="flex items-center gap-2">
            <Swords className="h-5 w-5 text-sky-400" />
            <h2 className="font-fantasy text-lg font-bold text-white">
              ආයුධ වෙළඳසැල
            </h2>
          </div>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-700 text-slate-300 hover:text-white"
            aria-label="වසන්න"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden md:flex-row">
          {/* List */}
          <div className="flex shrink-0 gap-2 overflow-x-auto border-b border-slate-800 bg-slate-950/50 p-3 md:w-68 md:flex-col md:overflow-y-auto md:border-r md:border-b-0">
            {WEAPONS.map((w) => {
              const tier = getWeaponQualityTier(w.id);
              const mcqReq = getWeaponMcqRequirement(w.id);
              return (
                <button
                  key={w.id}
                  onClick={() => setSelectedId(w.id)}
                  className={`flex min-w-[175px] shrink-0 items-center justify-between gap-2 rounded-xl border px-3 py-2.5 text-left transition md:min-w-0 ${
                    w.id === weapon.id
                      ? 'border-amber-500 bg-amber-500/15 text-white'
                      : 'border-slate-800 bg-slate-900/70 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <WeaponArtwork weaponId={w.id} className="h-8 w-8 shrink-0" />
                    <div>
                      <div className="text-sm font-bold">{w.name}</div>
                      <div className="text-[11px] text-slate-400">
                        {tier === 'premium' ? 'ප්‍රබල' : 'සාමාන්‍ය'} · {mcqReq} MCQ
                      </div>
                    </div>
                  </div>
                  <span className="font-mono-num shrink-0 text-xs font-bold text-amber-400">
                    {w.price} කාසි
                  </span>
                </button>
              );
            })}
          </div>

          {/* Detail */}
          <div className="flex-1 space-y-4 overflow-y-auto p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex items-center gap-3.5">
                <WeaponArtwork weaponId={weapon.id} className="h-12 w-12 shrink-0" />
                <div>
                  <div className="text-xs font-bold text-amber-400">
                    {getWeaponQualityTier(weapon.id) === 'premium'
                      ? 'ප්‍රබල කුළුණ'
                      : 'සාමාන්‍ය කුළුණ'}{' '}
                    · {weapon.role} ·{' '}
                    {weapon.canTargetFlying && weapon.canTargetGround
                      ? 'භූමි සහ ගුවන්'
                      : weapon.canTargetFlying
                        ? 'ගුවන් පමණි'
                        : 'භූමි පමණි'}
                  </div>
                  <h3 className="font-fantasy mt-0.5 text-2xl font-bold text-white">
                    {weapon.name}
                  </h3>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="font-mono-num rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-1.5 text-sm font-bold text-amber-300">
                  මිල: {weapon.price} කාසි
                </div>
                <div className="font-mono-num rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-1.5 text-sm font-bold text-emerald-300">
                  MCQ {getWeaponMcqRequirement(weapon.id)}ක් (නොමිලේ)
                </div>
              </div>
            </div>

            <p className="text-sm text-slate-300">{weapon.description}</p>

            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              <div className="rounded-lg bg-slate-950/80 p-3">
                <div className="text-[11px] text-slate-400">හානිය</div>
                <div className="font-mono-num text-base font-bold text-white">{weapon.damage}</div>
              </div>
              <div className="rounded-lg bg-slate-950/80 p-3">
                <div className="text-[11px] text-slate-400">ප්‍රහාර වේගය</div>
                <div className="font-mono-num text-base font-bold text-white">
                  {weapon.attackSpeed.toFixed(2)}/තත්.
                </div>
              </div>
              <div className="rounded-lg bg-slate-950/80 p-3">
                <div className="text-[11px] text-slate-400">ප්‍රහාර පරාසය</div>
                <div className="font-mono-num text-base font-bold text-white">{weapon.range}</div>
              </div>
              <div className="rounded-lg bg-slate-950/80 p-3">
                <div className="text-[11px] text-slate-400">විකුණුම් ආපසු මුදල</div>
                <div className="font-mono-num text-base font-bold text-amber-300">70%</div>
              </div>
            </div>

            <div className="rounded-lg border border-sky-500/30 bg-sky-950/25 p-3 text-xs text-sky-200">
              <strong>විශේෂ හැකියාව:</strong> {weapon.specialAbility}
            </div>

            <div>
              <div className="mb-2 text-xs font-bold text-slate-400">
                වැඩිදියුණු කිරීමේ මං තුන (A · B · C)
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {weapon.upgradePaths.map((path) => (
                  <div
                    key={path.id}
                    className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-xs"
                  >
                    <div className="font-bold text-amber-300">
                      මග {path.id}: {path.name}
                    </div>
                    <div className="mt-0.5 text-slate-400">{path.summary}</div>
                    <div className="mt-2 space-y-1.5 border-t border-slate-800 pt-2">
                      {path.tiers.map((tier) => (
                        <div key={tier.level} className="flex items-center justify-between gap-1">
                          <span className="truncate text-slate-200">
                            {tier.level}. {tier.name}
                          </span>
                          <span className="font-mono-num shrink-0 text-amber-400">
                            {tier.cost} කාසි
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface AchievementsModalProps {
  save: SaveData;
  onClaim: (id: string, rewardCoins: number) => void;
  onClose: () => void;
}

export const AchievementsModal: React.FC<AchievementsModalProps> = ({
  save,
  onClaim,
  onClose,
}) => {
  const [tab, setTab] = useState<'all' | 'combat' | 'science'>('all');
  const visibleAchievements = ACHIEVEMENTS.filter((a) => {
    const isScience = a.metric === 'mcq_correct' || a.metric === 'mcq_perfect_sets';
    if (tab === 'science') return isScience;
    if (tab === 'combat') return !isScience;
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-sm">
      <div className="flex max-h-[88vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 px-5 py-3.5">
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-amber-400" />
            <h2 className="font-fantasy text-lg font-bold text-white">රාජකීය ජයග්‍රහණ</h2>
          </div>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-700 text-slate-300 hover:text-white"
            aria-label="වසන්න"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex shrink-0 items-center gap-2 border-b border-slate-800 bg-slate-950/60 px-4 py-2">
          {(
            [
              { id: 'all', label: 'සියල්ල' },
              { id: 'combat', label: 'යුධ ජයග්‍රහණ' },
              { id: 'science', label: '10 ශ්‍රේණිය විද්‍යාව' },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={`min-h-[34px] rounded-lg px-3 py-1 text-xs font-bold whitespace-nowrap transition ${
                tab === item.id
                  ? 'bg-amber-500 text-slate-950'
                  : 'border border-slate-700 bg-slate-900 text-slate-300 hover:border-amber-400/50'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="flex-1 space-y-2.5 overflow-y-auto p-4">
          {visibleAchievements.map((ach) => {
            const progress = Math.min(ach.target, getAchievementProgress(ach, save));
            const completed = progress >= ach.target;
            const claimed = save.claimedAchievements.includes(ach.id);

            return (
              <div
                key={ach.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-950/60 p-3.5"
              >
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-bold text-white">{ach.title}</div>
                  <div className="text-xs text-slate-400">{ach.description}</div>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-800">
                      <div
                        className="h-full bg-amber-400"
                        style={{ width: `${(progress / ach.target) * 100}%` }}
                      />
                    </div>
                    <span className="font-mono-num text-[11px] text-slate-400">
                      {progress}/{ach.target}
                    </span>
                  </div>
                </div>

                {claimed ? (
                  <span className="flex items-center gap-1 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-xs font-bold text-emerald-300">
                    <Check className="h-3.5 w-3.5" />
                    ලබා ගත්තා
                  </span>
                ) : completed ? (
                  <button
                    onClick={() => onClaim(ach.id, ach.rewardCoins)}
                    className="rounded-lg bg-amber-500 px-3.5 py-2 text-xs font-bold whitespace-nowrap text-slate-950 hover:bg-amber-400"
                  >
                    ලබා ගන්න +{ach.rewardCoins} කාසි
                  </button>
                ) : (
                  <span className="font-mono-num text-xs font-semibold text-amber-400/80">
                    +{ach.rewardCoins} කාසි
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

interface DailyRewardModalProps {
  save: SaveData;
  onClaimDaily: () => void;
  onClose: () => void;
}

export const DailyRewardModal: React.FC<DailyRewardModalProps> = ({
  save,
  onClaimDaily,
  onClose,
}) => {
  const claimable = canClaimDailyReward(save);
  const streakRewards = [120, 160, 210, 270, 340, 420, 600];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-amber-500/40 bg-slate-900 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 px-5 py-3.5">
          <div className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-amber-400" />
            <h2 className="font-fantasy text-lg font-bold text-white">දිනපතා රාජකීය ත්‍යාගය</h2>
          </div>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-700 text-slate-300 hover:text-white"
            aria-label="වසන්න"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4 p-5">
          <p className="text-sm text-slate-300">
            ඔබේ ආරක්ෂාව ශක්තිමත් කිරීමට දිනපතා භාණ්ඩාගාර රන් කාසි ලබා ගන්න. වත්මන් පෙළ:{' '}
            <strong className="text-amber-300">දින {save.dailyStreak} / 7</strong>.
          </p>

          <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
            {streakRewards.map((amt, i) => {
              const day = i + 1;
              const done = day <= save.dailyStreak && !claimable;
              const isNext = claimable && day === Math.min(7, save.dailyStreak + 1);
              return (
                <div
                  key={day}
                  className={`rounded-xl border p-2.5 text-center ${
                    isNext
                      ? 'border-amber-400 bg-amber-500/20'
                      : done
                        ? 'border-emerald-500/40 bg-emerald-500/10'
                        : 'border-slate-800 bg-slate-950/70'
                  }`}
                >
                  <div className="text-[10px] text-slate-400">දිනය {day}</div>
                  <Coins className="mx-auto my-1 h-4 w-4 text-amber-400" />
                  <div className="font-mono-num text-xs font-bold text-white">{amt} කාසි</div>
                </div>
              );
            })}
          </div>

          <button
            disabled={!claimable}
            onClick={onClaimDaily}
            className={`flex min-h-[48px] w-full items-center justify-center rounded-xl px-5 py-3 text-sm font-bold whitespace-nowrap transition ${
              claimable
                ? 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                : 'cursor-not-allowed border border-slate-800 bg-slate-950 text-slate-500'
            }`}
          >
            {claimable
              ? 'අද ත්‍යාගය ලබා ගන්න'
              : 'අද ත්‍යාගය ලබා ගෙන ඇත · හෙට නැවත පැමිණෙන්න'}
          </button>
        </div>
      </div>
    </div>
  );
};

interface SettingsModalProps {
  save: SaveData;
  onUpdateAudio: (music: boolean, sfx: boolean) => void;
  onUpdateGraphics: (graphics: GraphicsSettings) => void;
  onResetProgress: () => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  save,
  onUpdateAudio,
  onUpdateGraphics,
  onResetProgress,
  onClose,
}) => {
  const [confirmReset, setConfirmReset] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 px-5 py-3.5">
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-amber-400" />
            <h2 className="font-fantasy text-lg font-bold text-white">සැකසුම්</h2>
          </div>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-700 text-slate-300 hover:text-white"
            aria-label="වසන්න"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4 p-5 text-sm">
          <div className="space-y-2.5 rounded-xl border border-slate-800 bg-slate-950/60 p-3.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
              <Volume2 className="h-3.5 w-3.5" />
              <span>ශබ්ද පාලනය</span>
            </div>

            <label className="flex cursor-pointer items-center justify-between">
              <span>පසුබිම් සංගීතය</span>
              <input
                type="checkbox"
                checked={save.musicEnabled}
                onChange={(e) => onUpdateAudio(e.target.checked, save.sfxEnabled)}
                className="h-4 w-4 accent-amber-500"
              />
            </label>

            <label className="flex cursor-pointer items-center justify-between">
              <span>ශබ්ද ප්‍රයෝග (SFX)</span>
              <input
                type="checkbox"
                checked={save.sfxEnabled}
                onChange={(e) => onUpdateAudio(save.musicEnabled, e.target.checked)}
                className="h-4 w-4 accent-amber-500"
              />
            </label>
          </div>

          <div className="space-y-2.5 rounded-xl border border-slate-800 bg-slate-950/60 p-3.5">
            <div className="text-xs font-bold text-slate-400">
              ග්‍රැෆික් සහ කාර්යසාධනය (ජංගම හිතකාමී)
            </div>

            <div className="flex items-center justify-between">
              <span>අංශු ඝනත්වය</span>
              <select
                value={save.graphics.particles}
                onChange={(e) =>
                  onUpdateGraphics({
                    ...save.graphics,
                    particles: e.target.value as 'high' | 'low',
                  })
                }
                className="rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1 text-xs font-semibold text-white"
              >
                <option value="high">ඉහළ</option>
                <option value="low">අඩු (4GB RAM ඉතිරිය)</option>
              </select>
            </div>

            <label className="flex cursor-pointer items-center justify-between">
              <span>සැමවිටම කුළුණු පරාසය පෙන්වන්න</span>
              <input
                type="checkbox"
                checked={save.graphics.showRangeAlways}
                onChange={(e) =>
                  onUpdateGraphics({ ...save.graphics, showRangeAlways: e.target.checked })
                }
                className="h-4 w-4 accent-amber-500"
              />
            </label>

            <label className="flex cursor-pointer items-center justify-between">
              <span>පාවෙන හානි අංක පෙන්වන්න</span>
              <input
                type="checkbox"
                checked={save.graphics.showDamageNumbers}
                onChange={(e) =>
                  onUpdateGraphics({ ...save.graphics, showDamageNumbers: e.target.checked })
                }
                className="h-4 w-4 accent-amber-500"
              />
            </label>
          </div>

          <div className="border-t border-slate-800 pt-3">
            {!confirmReset ? (
              <button
                onClick={() => setConfirmReset(true)}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-rose-500/40 bg-rose-950/30 py-2.5 text-xs font-bold text-rose-300 hover:bg-rose-950/50"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>මෙහෙයුම් ප්‍රගතිය යළි සකසන්න</span>
              </button>
            ) : (
              <div className="space-y-2 rounded-xl border border-rose-500/50 bg-rose-950/40 p-3 text-center">
                <div className="text-xs font-semibold text-rose-200">
                  සියලුම තරු, රන් කාසි සහ මට්ටම් මකා දමන්නද?
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setConfirmReset(false)}
                    className="flex-1 rounded-lg border border-slate-700 bg-slate-900 py-2 text-xs font-bold text-slate-200"
                  >
                    අවලංගු කරන්න
                  </button>
                  <button
                    onClick={() => {
                      onResetProgress();
                      setConfirmReset(false);
                    }}
                    className="flex-1 rounded-lg bg-rose-600 py-2 text-xs font-bold text-white"
                  >
                    යළි සකසන්න
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
