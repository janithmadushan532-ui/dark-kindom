import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Coins,
  Crosshair,
  Crown,
  PauseCircle,
  RotateCcw,
  Shield,
  Sparkles,
  Swords,
  X,
  XCircle,
} from 'lucide-react';
import { dkAudio } from '../audio';
import { getPreviewWeaponRange, getWeaponCostForLevel } from '../engine';
import { TARGETING_SI } from '../localization/siLabels';
import { drawMcqSet, LESSON_MAP } from '../mcq';
import {
  LevelConfig,
  McqDifficulty,
  McqModeProgress,
  McqStudyModeId,
  McqUnitId,
  ResolvedMcqQuestion,
  WeaponId,
} from '../types';
import { getWeaponMcqRequirement, getWeaponQualityTier, WEAPON_MAP } from '../weapons';
import { WeaponArtwork } from './WeaponArtwork';

interface SmartWeaponShopModalProps {
  level: LevelConfig;
  coins: number;
  towersBuilt: number;
  zoneId: string;
  previewWeaponId: WeaponId | null;
  answeredMcqIds: string[];
  mcqModeProgress?: Record<string, McqModeProgress>;
  selectedMcqMode?: McqStudyModeId | null;
  isMcqMode: boolean;
  onSelectPreview: (weaponId: WeaponId) => void;
  onBuyWithCoins: (weaponId: WeaponId) => void;
  onEnterMcqMode: () => void;
  onExitMcqToShop: () => void;
  onMarkMcqShown?: (unitId: McqUnitId, questionId: string, poolIds: string[]) => void;
  onRecordMcqAnswer: (
    questionId: string,
    isCorrect: boolean,
    resetHistory: boolean,
    poolIds?: string[]
  ) => void;
  onCompleteMcqUnlock: (weaponId: WeaponId) => void;
  onOpenUnitSelect?: () => void;
  onCloseShop: () => void;
}

type ShopFilter = 'all' | 'basic' | 'premium' | 'anti_air';

interface ActiveMcqAttempt {
  attemptId: number;
  weaponId: WeaponId;
  requiredCount: 3 | 4;
  questions: ResolvedMcqQuestion[];
  resetHistory: boolean;
  poolIds: string[];
  index: number;
  selectedOption: number | null;
  correctCount: number;
  failed: boolean;
  recordedIndices: Record<number, boolean>;
}

const DIFFICULTY_BADGES: Record<McqDifficulty, { label: string; style: string }> = {
  easy: { label: 'පහසු', style: 'border-emerald-500/35 bg-emerald-500/10 text-emerald-300' },
  medium: { label: 'මධ්‍යම', style: 'border-amber-500/35 bg-amber-500/10 text-amber-300' },
  hard: { label: 'අපහසු', style: 'border-rose-500/35 bg-rose-500/10 text-rose-300' },
};

function getTargetScopeLabel(canTargetGround: boolean, canTargetFlying: boolean): string {
  if (canTargetFlying && canTargetGround) return 'භූමි සහ ගුවන්';
  if (canTargetFlying) return 'ගුවන් පමණි';
  return 'භූමි පමණි';
}

export const SmartWeaponShopModal: React.FC<SmartWeaponShopModalProps> = ({
  level,
  coins,
  towersBuilt,
  zoneId,
  previewWeaponId,
  answeredMcqIds: _answeredMcqIds,
  mcqModeProgress = {},
  selectedMcqMode = null,
  isMcqMode,
  onSelectPreview,
  onBuyWithCoins,
  onEnterMcqMode,
  onExitMcqToShop,
  onMarkMcqShown,
  onRecordMcqAnswer,
  onCompleteMcqUnlock,
  onOpenUnitSelect,
  onCloseShop,
}) => {
  const [filter, setFilter] = useState<ShopFilter>('all');
  const [attempt, setAttempt] = useState<ActiveMcqAttempt | null>(null);
  const [missingUnitPrompt, setMissingUnitPrompt] = useState(false);
  const grantedRef = useRef(false);
  const attemptSeqRef = useRef(0);
  const lastMarkedStepRef = useRef<string | null>(null);
  const previewCardRef = useRef<HTMLDivElement | null>(null);

  const selectedUnit = useMemo(
    () =>
      selectedMcqMode && selectedMcqMode !== 'ALL_UNITS'
        ? LESSON_MAP[selectedMcqMode] ?? null
        : null,
    [selectedMcqMode]
  );

  const activeUnitProgress = selectedUnit ? mcqModeProgress[selectedUnit.id] : undefined;
  const activeUnitSeenIds = activeUnitProgress?.seenQuestionIds ?? [];
  const activeUnitLastQuestionId = activeUnitProgress?.lastQuestionId ?? null;

  useEffect(() => {
    if (selectedUnit && missingUnitPrompt) {
      setMissingUnitPrompt(false);
    }
  }, [selectedUnit, missingUnitPrompt]);

  useEffect(() => {
    if (!isMcqMode || !attempt || !selectedUnit) return;
    const currentQ = attempt.questions[attempt.index];
    if (!currentQ) return;
    const stepKey = `${attempt.attemptId}:${attempt.index}:${currentQ.question_id}`;
    if (lastMarkedStepRef.current === stepKey) return;
    lastMarkedStepRef.current = stepKey;
    onMarkMcqShown?.(selectedUnit.id, currentQ.question_id, attempt.poolIds);
  }, [isMcqMode, attempt, selectedUnit, onMarkMcqShown]);

  useEffect(() => {
    if (!isMcqMode && previewWeaponId && previewCardRef.current) {
      previewCardRef.current.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [isMcqMode, previewWeaponId]);

  const activeModeLabel = useMemo(() => {
    if (selectedUnit) {
      return `තෝරාගත් ඒකකය: ඒකකය ${String(selectedUnit.unitNumber).padStart(2, '0')} · ${selectedUnit.title}`;
    }
    return 'ඒකකයක් තෝරා නොමැත · MCQ සඳහා Unit MCQ වෙතින් ඒකකයක් SELECT කරන්න';
  }, [selectedUnit]);

  const maxTowersReached =
    typeof level.maxTowersAllowed === 'number' && towersBuilt >= level.maxTowersAllowed;

  const availableWeaponDefs = useMemo(
    () => level.availableWeapons.map((id) => WEAPON_MAP[id]).filter(Boolean),
    [level.availableWeapons]
  );

  const filteredWeapons = useMemo(() => {
    if (filter === 'basic') {
      return availableWeaponDefs.filter((w) => getWeaponQualityTier(w.id) === 'basic');
    }
    if (filter === 'premium') {
      return availableWeaponDefs.filter((w) => getWeaponQualityTier(w.id) === 'premium');
    }
    if (filter === 'anti_air') {
      return availableWeaponDefs.filter((w) => w.canTargetFlying);
    }
    return availableWeaponDefs;
  }, [availableWeaponDefs, filter]);

  const startMcqUnlock = (weaponId: WeaponId) => {
    if (maxTowersReached) return;
    dkAudio.unlock();
    if (!selectedUnit) {
      onSelectPreview(weaponId);
      setMissingUnitPrompt(true);
      return;
    }
    const requiredCount = getWeaponMcqRequirement(weaponId);
    const { questions, resetHistory, poolIds } = drawMcqSet(
      activeUnitSeenIds,
      requiredCount,
      {
        grade: 10,
        modeId: selectedUnit.id,
      },
      activeUnitLastQuestionId
    );
    const strictlyUnitQuestions = questions.filter((q) => q.unit_id === selectedUnit.id);
    if (strictlyUnitQuestions.length < requiredCount) return;

    grantedRef.current = false;
    setMissingUnitPrompt(false);
    onSelectPreview(weaponId);
    onEnterMcqMode();
    attemptSeqRef.current += 1;
    setAttempt({
      attemptId: attemptSeqRef.current,
      weaponId,
      requiredCount,
      questions: strictlyUnitQuestions,
      resetHistory,
      poolIds,
      index: 0,
      selectedOption: null,
      correctCount: 0,
      failed: false,
      recordedIndices: {},
    });
  };

  const handleRetryMcq = () => {
    if (!attempt || !selectedUnit) return;
    dkAudio.unlock();
    const fallbackLastId =
      activeUnitLastQuestionId ?? attempt.questions[attempt.index]?.question_id ?? null;
    const { questions, resetHistory, poolIds } = drawMcqSet(
      activeUnitSeenIds,
      attempt.requiredCount,
      {
        grade: 10,
        modeId: selectedUnit.id,
      },
      fallbackLastId
    );
    const strictlyUnitQuestions = questions.filter((q) => q.unit_id === selectedUnit.id);
    if (strictlyUnitQuestions.length < attempt.requiredCount) return;

    grantedRef.current = false;
    attemptSeqRef.current += 1;
    setAttempt({
      attemptId: attemptSeqRef.current,
      weaponId: attempt.weaponId,
      requiredCount: attempt.requiredCount,
      questions: strictlyUnitQuestions,
      resetHistory,
      poolIds,
      index: 0,
      selectedOption: null,
      correctCount: 0,
      failed: false,
      recordedIndices: {},
    });
  };

  const handleBackToShop = () => {
    setAttempt(null);
    grantedRef.current = false;
    onExitMcqToShop();
  };

  const handleSelectOption = (optIndex: number) => {
    if (!attempt || attempt.selectedOption !== null) return;
    const currentQ = attempt.questions[attempt.index];
    if (!currentQ) return;

    const isRight = optIndex === currentQ.correctIndex;
    if (isRight) {
      dkAudio.playMcqCorrect();
    } else {
      dkAudio.playMcqWrong();
    }

    if (!attempt.recordedIndices[attempt.index]) {
      onRecordMcqAnswer(currentQ.question_id, isRight, false, attempt.poolIds);
    }

    setAttempt((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        selectedOption: optIndex,
        correctCount: isRight ? prev.correctCount + 1 : prev.correctCount,
        failed: !isRight,
        recordedIndices: { ...prev.recordedIndices, [prev.index]: true },
      };
    });
  };

  const handleAdvanceOrUnlock = () => {
    if (!attempt || attempt.failed || attempt.selectedOption === null) return;

    if (attempt.index + 1 < attempt.requiredCount) {
      setAttempt((prev) =>
        prev
          ? {
              ...prev,
              index: prev.index + 1,
              selectedOption: null,
            }
          : null
      );
      return;
    }

    // All required MCQs (3/3 or 4/4) answered correctly -> grant once at 0 coins
    if (attempt.correctCount === attempt.requiredCount && !grantedRef.current) {
      grantedRef.current = true;
      const unlockedId = attempt.weaponId;
      setAttempt(null);
      onCompleteMcqUnlock(unlockedId);
    }
  };

  // Render MCQ Unlock View when active
  if (isMcqMode && attempt) {
    const weapon = WEAPON_MAP[attempt.weaponId];
    const tier = getWeaponQualityTier(attempt.weaponId);
    const currentQ = attempt.questions[attempt.index];
    const revealed = attempt.selectedOption !== null;
    const isFinalQuestion = attempt.index + 1 === attempt.requiredCount;
    const allSolvedCleanly =
      revealed && !attempt.failed && isFinalQuestion && attempt.correctCount === attempt.requiredCount;

    return (
      <div
        role="dialog"
        aria-modal="true"
        aria-label="MCQ ආයුධ අගුළු හැරීම"
        className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/60 p-2 backdrop-blur-[2px] sm:p-3"
      >
        <div className="flex max-h-[94vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-emerald-500/45 bg-slate-900/98 shadow-2xl">
          {/* Header */}
          <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-slate-800 bg-slate-950/90 px-3.5 py-2.5 sm:px-5">
            <div className="flex min-w-0 items-center gap-2.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-500/40 bg-slate-900">
                <WeaponArtwork weaponId={weapon.id} className="h-8 w-8" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-[11px] font-bold text-amber-300">
                  <span className="inline-flex items-center gap-1 text-amber-300">
                    <PauseCircle className="h-3.5 w-3.5 text-amber-400" />
                    සටන නවත්වා ඇත · PAUSED
                  </span>
                  <span className="text-slate-600">|</span>
                  <span className={tier === 'premium' ? 'text-amber-200' : 'text-emerald-300'}>
                    {tier === 'premium'
                      ? 'ප්‍රබල ආයුධ අභියෝගය (4 MCQ)'
                      : 'සාමාන්‍ය ආයුධ අභියෝගය (3 MCQ)'}
                  </span>
                </div>
                <div className="font-fantasy truncate text-sm font-bold text-white sm:text-base">
                  {weapon.name} — නොමිලේ ලබා ගන්න (කාසි 0)
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="font-mono-num rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1 text-xs font-bold text-emerald-300">
                ප්‍රගතිය: {attempt.correctCount}/{attempt.requiredCount}
              </div>
              <button
                onClick={handleBackToShop}
                className="flex min-h-[36px] items-center gap-1 rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1 text-xs font-semibold text-slate-200 hover:border-amber-400/60 hover:text-white"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>වෙළඳසැල</span>
              </button>
            </div>
          </div>

          {/* Step Progress Strip */}
          <div
            className={`grid shrink-0 gap-1.5 border-b border-slate-800/80 bg-slate-950/60 px-4 py-2 ${
              attempt.requiredCount === 3 ? 'grid-cols-3' : 'grid-cols-4'
            }`}
          >
            {attempt.questions.map((qItem, qIdx) => {
              const answeredRight =
                qIdx < attempt.index ||
                (qIdx === attempt.index && attempt.selectedOption !== null && !attempt.failed);
              const answeredWrong = qIdx === attempt.index && attempt.failed;
              const isCurrent = qIdx === attempt.index && attempt.selectedOption === null;

              return (
                <div
                  key={qItem.id}
                  className={`flex items-center justify-center gap-1 rounded-md py-1 text-[11px] font-bold transition ${
                    answeredRight
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : answeredWrong
                        ? 'bg-rose-500/20 text-rose-300'
                        : isCurrent
                          ? 'bg-amber-500/20 text-amber-200 ring-1 ring-amber-400/60'
                          : 'bg-slate-900 text-slate-500'
                  }`}
                >
                  <span className="font-mono-num">
                    {qIdx + 1}/{attempt.requiredCount}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Question Body */}
          <div className="min-h-0 flex-1 overflow-y-auto p-3.5 sm:p-5">
            {currentQ && (
              <div>
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-xs font-semibold text-slate-400">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="font-sinhala text-amber-300">
                      10 ශ්‍රේණිය · ඒකකය {currentQ.unitNumber} · {currentQ.unit_name}
                    </span>
                    <span
                      className={`rounded border px-1.5 py-0.5 text-[10px] font-bold ${
                        DIFFICULTY_BADGES[currentQ.difficulty].style
                      }`}
                    >
                      {DIFFICULTY_BADGES[currentQ.difficulty].label}
                    </span>
                  </div>
                  <span className="font-mono-num text-slate-300">
                    ප්‍රශ්නය {attempt.index + 1} / {attempt.requiredCount}
                  </span>
                </div>

                <h3 className="font-sinhala mb-3.5 text-base leading-relaxed font-bold text-white sm:text-lg">
                  {currentQ.question}
                </h3>

                {currentQ.dataTable && (
                  <div className="mb-3.5 overflow-x-auto rounded-xl border border-slate-700/80 bg-slate-950/85">
                    <table className="font-sinhala w-full text-left text-xs sm:text-sm">
                      <thead>
                        <tr className="border-b border-slate-800 bg-slate-900 text-amber-300">
                          {currentQ.dataTable.headers.map((header, hIdx) => (
                            <th key={hIdx} className="px-3 py-1.5 font-bold">
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {currentQ.dataTable.rows.map((row, rIdx) => (
                          <tr key={rIdx} className="border-b border-slate-800/70 last:border-b-0">
                            {row.map((cell, cIdx) => (
                              <td key={cIdx} className="px-3 py-1.5 text-slate-200">
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {currentQ.options.map((opt, idx) => {
                    const isChosen = attempt.selectedOption === idx;
                    const isCorrectOpt = idx === currentQ.correctIndex;

                    let btnStyle =
                      'border-slate-700/90 bg-slate-950/75 text-slate-100 hover:border-amber-400/80 hover:bg-slate-800';
                    if (revealed) {
                      if (isCorrectOpt) {
                        btnStyle = 'border-emerald-500 bg-emerald-500/20 text-emerald-100';
                      } else if (isChosen) {
                        btnStyle = 'border-rose-500 bg-rose-500/20 text-rose-100';
                      } else {
                        btnStyle = 'border-slate-800 bg-slate-950/40 text-slate-500';
                      }
                    }

                    return (
                      <button
                        key={idx}
                        disabled={revealed}
                        onClick={() => handleSelectOption(idx)}
                        className={`font-sinhala flex min-h-[46px] w-full items-center justify-between gap-2 rounded-xl border px-3.5 py-2.5 text-left text-sm font-semibold transition ${btnStyle}`}
                      >
                        <span className="leading-snug">
                          <span className="mr-2 font-mono text-xs text-slate-400">
                            {['A', 'B', 'C', 'D'][idx]}.
                          </span>
                          {opt}
                        </span>
                        {revealed && isCorrectOpt && (
                          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
                        )}
                        {revealed && isChosen && !isCorrectOpt && (
                          <XCircle className="h-5 w-5 shrink-0 text-rose-400" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {revealed && (
                  <div
                    className={`mt-3.5 rounded-xl border p-3.5 ${
                      attempt.failed
                        ? 'border-rose-500/50 bg-rose-950/35'
                        : 'border-emerald-500/50 bg-emerald-950/30'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span
                        className={`text-xs font-bold ${
                          attempt.failed ? 'text-rose-300' : 'text-emerald-300'
                        }`}
                      >
                        {attempt.failed
                          ? 'වැරදි පිළිතුරකි! මෙම උත්සාහයෙන් ආයුධය ලබා ගත නොහැක.'
                          : allSolvedCleanly
                            ? `විශිෂ්ටයි! ${attempt.requiredCount}/${attempt.requiredCount} සම්පූර්ණයි — "${weapon.name}" නොමිලේ අගුළු හරින ලදී!`
                            : `නිවැරදි පිළිතුරකි! (${attempt.correctCount}/${attempt.requiredCount})`}
                      </span>
                      <span className="text-[11px] font-semibold text-amber-300">
                        {currentQ.textbook_reference}
                      </span>
                    </div>
                    <p className="font-sinhala mt-1.5 text-sm leading-relaxed text-slate-200">
                      {currentQ.explanation}
                    </p>

                    {attempt.failed ? (
                      <div className="mt-3 flex flex-wrap gap-2">
                        <button
                          onClick={handleRetryMcq}
                          className="flex min-h-[42px] flex-1 items-center justify-center gap-1.5 rounded-xl bg-amber-500 px-4 py-2 text-sm font-bold whitespace-nowrap text-slate-950 hover:bg-amber-400"
                        >
                          <RotateCcw className="h-4 w-4" />
                          <span>නැවත උත්සාහ කරන්න (0/{attempt.requiredCount})</span>
                        </button>
                        <button
                          onClick={handleBackToShop}
                          className="flex min-h-[42px] items-center justify-center gap-1.5 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-semibold whitespace-nowrap text-slate-200 hover:border-amber-400/60"
                        >
                          <ArrowLeft className="h-4 w-4" />
                          <span>වෙළඳසැලට</span>
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={handleAdvanceOrUnlock}
                        className="mt-3 flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-bold whitespace-nowrap text-slate-950 shadow-lg hover:bg-emerald-400"
                      >
                        {allSolvedCleanly ? (
                          <>
                            <Sparkles className="h-4 w-4" />
                            <span>
                              නොමිලේ ආයුධය ස්ථාපනය කර සටන අරඹන්න ({weapon.name})
                            </span>
                          </>
                        ) : (
                          <span>
                            ඊළඟ ප්‍රශ්නය ({attempt.index + 2}/{attempt.requiredCount})
                          </span>
                        )}
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Render Smart Weapon Shop Browsing View
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="බුද්ධිමත් ආයුධ වෙළඳසැල"
      className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/58 p-2 backdrop-blur-[2px] sm:p-3"
    >
      <div className="flex max-h-[93vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-amber-500/45 bg-slate-900/96 shadow-2xl">
        {/* Sticky Top Header with Clear PAUSED Status */}
        <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-slate-800 bg-slate-950/92 px-3.5 py-2.5 sm:px-5">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-amber-400/50 bg-amber-500/15 text-amber-300">
              <Swords className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold">
                <span className="inline-flex items-center gap-1 text-amber-300">
                  <PauseCircle className="h-3.5 w-3.5 text-amber-400" />
                  සටන නවත්වා ඇත · PAUSED
                </span>
                <span className="text-slate-600">·</span>
                <span className="text-slate-400">ස්ථානය {zoneId}</span>
              </div>
              <h2 className="font-fantasy truncate text-base font-bold text-white sm:text-lg">
                බුද්ධිමත් ආයුධ වෙළඳසැල
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="font-mono-num flex items-center gap-1.5 rounded-xl border border-amber-500/45 bg-amber-500/10 px-3 py-1.5 text-sm font-bold text-amber-300">
              <Coins className="h-4 w-4 text-amber-400" />
              <span>{coins} කාසි</span>
            </div>

            <button
              type="button"
              onClick={onCloseShop}
              className="flex min-h-[42px] touch-manipulation items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-bold text-slate-200 hover:border-amber-400 hover:text-white"
              aria-label="වසා සටන අරඹන්න"
            >
              <X className="h-4 w-4" />
              <span className="hidden sm:inline">වසා සටන අරඹන්න</span>
            </button>
          </div>
        </div>

        {/* Compact Filter Bar + Dual Purchase Explanation */}
        <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 bg-slate-950/60 px-3.5 py-2 sm:px-5">
          <div className="flex flex-wrap items-center gap-1.5">
            {(
              [
                { id: 'all', label: `සියල්ල (${availableWeaponDefs.length})` },
                { id: 'basic', label: 'සාමාන්‍ය (3 MCQ)' },
                { id: 'premium', label: 'ප්‍රබල (4 MCQ)' },
                { id: 'anti_air', label: 'ගුවන් ආරක්ෂක' },
              ] as { id: ShopFilter; label: string }[]
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilter(tab.id)}
                className={`min-h-[38px] touch-manipulation rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                  filter === tab.id
                    ? 'bg-amber-500 text-slate-950'
                    : 'border border-slate-700/80 bg-slate-900 text-slate-300 hover:border-amber-400/50 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2 text-[11px] font-medium text-slate-300">
            <span className={`font-bold ${selectedUnit ? 'text-emerald-300' : 'text-amber-300'}`}>
              {activeModeLabel}
            </span>
            <span className="text-slate-600">·</span>
            {maxTowersReached ? (
              <span className="font-bold text-rose-400">
                උපරිම කුළුණු සීමාව ({level.maxTowersAllowed}) සම්පූර්ණයි
              </span>
            ) : (
              <span>කාසිවලින් මිලදී ගන්න — නැතහොත් MCQ මගින් නොමිලේ අගුළු හරින්න</span>
            )}
          </div>
        </div>

        {/* Prompt if no Grade 10 Science Unit has been selected yet */}
        {missingUnitPrompt && !selectedUnit && (
          <div
            role="alert"
            className="mx-3.5 mt-3 flex shrink-0 flex-wrap items-center justify-between gap-2.5 rounded-xl border border-amber-400/70 bg-amber-950/50 px-4 py-2.5 text-xs text-amber-100 sm:mx-5"
          >
            <div className="min-w-0 flex-1">
              <strong className="font-bold text-amber-300">ඒකකයක් තෝරා නොමැත:</strong> MCQ
              මගින් ආයුධ අගුළු හැරීමට පළමුව <strong>Unit MCQ</strong> තිරයෙන් 10 ශ්‍රේණිය විද්‍යා
              ඒකකයක් <strong>SELECT</strong> කරන්න (නැතහොත් කාසිවලින් මිලදී ගන්න).
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {onOpenUnitSelect && (
                <button
                  type="button"
                  onClick={onOpenUnitSelect}
                  className="min-h-[38px] touch-manipulation rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-bold whitespace-nowrap text-slate-950 hover:bg-amber-400"
                >
                  Unit MCQ වෙත යන්න
                </button>
              )}
              <button
                type="button"
                onClick={() => setMissingUnitPrompt(false)}
                className="min-h-[38px] touch-manipulation rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-xs font-semibold text-slate-200 hover:text-white"
              >
                හරි
              </button>
            </div>
          </div>
        )}

        {/* Scrollable Mobile-Landscape Weapon Grid */}
        <div className="grid min-h-0 flex-1 grid-cols-1 gap-2.5 overflow-y-auto p-3 sm:grid-cols-2 sm:p-4 lg:grid-cols-3">
          {filteredWeapons.map((w) => {
            const cost = getWeaponCostForLevel(level, w.id);
            const effectiveRange = getPreviewWeaponRange(w.id, level);
            const tier = getWeaponQualityTier(w.id);
            const isPremium = tier === 'premium';
            const mcqReq = getWeaponMcqRequirement(w.id);
            const canAfford = coins >= cost;
            const isPreviewed = previewWeaponId === w.id;
            const targetScope = getTargetScopeLabel(w.canTargetGround, w.canTargetFlying);

            return (
              <div
                key={w.id}
                ref={isPreviewed ? previewCardRef : undefined}
                onClick={() => onSelectPreview(w.id)}
                className={`flex touch-manipulation flex-col justify-between rounded-xl border p-3 transition ${
                  isPremium
                    ? 'border-amber-400/55 border-t-2 border-t-amber-400 bg-gradient-to-b from-amber-950/35 via-slate-900 to-slate-950'
                    : 'border-slate-700/90 bg-slate-900/95'
                } ${isPreviewed ? 'ring-2 ring-amber-400/80' : ''}`}
              >
                <div>
                  {/* Card Top: Artwork + Identity + Price */}
                  <div className="flex items-start gap-2.5">
                    <div
                      className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border ${
                        isPremium
                          ? 'border-amber-400/45 bg-amber-950/40'
                          : 'border-slate-700 bg-slate-950'
                      }`}
                    >
                      <WeaponArtwork weaponId={w.id} className="h-12 w-12" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1.5">
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-bold tracking-wide ${
                            isPremium ? 'text-amber-300' : 'text-sky-300'
                          }`}
                        >
                          {isPremium ? (
                            <Crown className="h-3 w-3 shrink-0" />
                          ) : (
                            <Shield className="h-3 w-3 shrink-0" />
                          )}
                          <span>
                            {isPremium ? 'ප්‍රබල කුළුණ' : 'සාමාන්‍ය කුළුණ'} · {targetScope}
                          </span>
                        </span>
                      </div>

                      <h3 className="font-fantasy mt-0.5 truncate text-sm font-bold text-white">
                        {w.name}
                      </h3>
                      <p className="truncate text-[11px] text-slate-400">{w.role}</p>
                    </div>
                  </div>

                  {/* Tactical Stats Strip */}
                  <div className="font-mono-num mt-2.5 grid grid-cols-3 gap-1.5 rounded-lg border border-slate-800 bg-slate-950/85 px-2.5 py-1.5 text-[11px]">
                    <div>
                      <span className="block text-[9px] font-sans text-slate-400">හානිය</span>
                      <span className="font-bold text-white">{w.damage}</span>
                    </div>
                    <div>
                      <span className="block text-[9px] font-sans text-slate-400">පරාසය</span>
                      <span className="flex items-center gap-0.5 font-bold text-sky-300">
                        <Crosshair className="h-2.5 w-2.5" />
                        {effectiveRange}
                      </span>
                    </div>
                    <div>
                      <span className="block text-[9px] font-sans text-slate-400">වේගය</span>
                      <span className="font-bold text-emerald-300">
                        {w.attackSpeed.toFixed(2)}/තත්.
                      </span>
                    </div>
                  </div>

                  {/* Target Priority & Upgrade Levels/Costs Summary */}
                  <div className="mt-1.5 flex items-center justify-between gap-2 px-1 text-[10px] text-slate-400">
                    <span className="truncate">
                      ඉලක්කය: <strong className="text-slate-200">{TARGETING_SI[w.targeting]}</strong>
                    </span>
                    <span className="font-mono-num shrink-0">
                      උසස්: මට්ටම් 9 ·{' '}
                      {Math.min(...w.upgradePaths.map((p) => p.tiers[0].cost))}+ කාසි
                    </span>
                  </div>
                </div>

                {/* Dual Purchase Actions: Coins OR MCQ */}
                <div className="mt-2.5 grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    disabled={!canAfford || maxTowersReached}
                    onClick={(e) => {
                      e.stopPropagation();
                      onBuyWithCoins(w.id);
                    }}
                    className={`font-mono-num flex min-h-[42px] flex-col items-center justify-center rounded-lg px-2 py-1 text-center text-xs font-bold transition ${
                      canAfford && !maxTowersReached
                        ? 'bg-amber-500 text-slate-950 hover:bg-amber-400 active:scale-[0.98]'
                        : 'cursor-not-allowed border border-slate-800 bg-slate-950 text-slate-500'
                    }`}
                  >
                    <span className="flex items-center gap-1">
                      <Coins className="h-3.5 w-3.5" />
                      <span>{cost} කාසි</span>
                    </span>
                    <span className="font-sans text-[10px] font-semibold">
                      {maxTowersReached
                        ? 'සීමාව සම්පූර්ණයි'
                        : canAfford
                          ? 'මිලදී ගන්න'
                          : 'කාසි මදි'}
                    </span>
                  </button>

                  <button
                    type="button"
                    disabled={maxTowersReached}
                    onClick={(e) => {
                      e.stopPropagation();
                      startMcqUnlock(w.id);
                    }}
                    className={`flex min-h-[42px] flex-col items-center justify-center rounded-lg border px-2 py-1 text-center text-xs font-bold transition ${
                      maxTowersReached
                        ? 'cursor-not-allowed border-slate-800 bg-slate-950 text-slate-500'
                        : isPremium
                          ? 'border-emerald-400/70 bg-emerald-500/20 text-emerald-200 hover:bg-emerald-500/30 active:scale-[0.98]'
                          : 'border-emerald-500/60 bg-emerald-500/15 text-emerald-200 hover:bg-emerald-500/25 active:scale-[0.98]'
                    }`}
                  >
                    <span className="flex items-center gap-1">
                      <BookOpen className="h-3.5 w-3.5" />
                      <span>MCQ ({mcqReq}ක්)</span>
                    </span>
                    <span className="text-[10px] font-semibold text-emerald-300">
                      නොමිලේ ගන්න
                    </span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
