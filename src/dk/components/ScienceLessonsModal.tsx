import React from 'react';
import { Check, GraduationCap, X } from 'lucide-react';
import { dkAudio } from '../audio';
import { GRADE_10_UNITS, LESSON_MAP } from '../mcq';
import { McqScienceBranch, McqStudyModeId, McqUnitId, SaveData } from '../types';
import { UnitIllustration } from './UnitIllustration';

interface ScienceLessonsModalProps {
  save: SaveData;
  onSelectMode: (modeId: McqStudyModeId) => void;
  onClose: () => void;
}

const BRANCH_LABELS: Record<McqScienceBranch, { label: string; accent: string }> = {
  biology: { label: 'ජීව විද්‍යාව', accent: 'text-emerald-300' },
  physics: { label: 'භෞතික විද්‍යාව', accent: 'text-sky-300' },
  chemistry: { label: 'රසායන විද්‍යාව', accent: 'text-violet-300' },
};

export const ScienceLessonsModal: React.FC<ScienceLessonsModalProps> = ({
  save,
  onSelectMode,
  onClose,
}) => {
  const selectedUnit =
    save.mcqSelectedMode && save.mcqSelectedMode !== 'ALL_UNITS'
      ? LESSON_MAP[save.mcqSelectedMode] ?? null
      : null;

  const handleSelectUnit = (unitId: McqUnitId) => {
    dkAudio.unlock();
    dkAudio.playMcqCorrect();
    onSelectMode(unitId);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="10 ශ්‍රේණිය විද්‍යාව — Unit MCQ"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 p-2 backdrop-blur-sm sm:p-4"
    >
      <div className="flex max-h-[94vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl">
        {/* Top Header */}
        <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-slate-800 bg-slate-950/95 px-4 py-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-500/40 bg-emerald-500/15 text-emerald-300">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h2 className="font-fantasy truncate text-base font-bold text-white sm:text-lg">
                10 ශ්‍රේණිය විද්‍යාව — Unit MCQ
              </h2>
              <p className="truncate text-xs text-slate-400">
                ශ්‍රී ලංකා නිල 10 ශ්‍රේණිය පෙළපොත · සටනේදී MCQ ආයුධ සඳහා පහතින් එක් ඒකකයක් SELECT කරන්න
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden text-xs font-semibold sm:block">
              {selectedUnit ? (
                <span className="text-emerald-300">
                  තෝරාගත් ඒකකය: ඒකකය {String(selectedUnit.unitNumber).padStart(2, '0')} ·{' '}
                  {selectedUnit.title}
                </span>
              ) : (
                <span className="text-amber-300">ඒකකයක් තෝරා නොමැත · SELECT ඔබන්න</span>
              )}
            </div>

            <button
              type="button"
              onClick={onClose}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-700 text-slate-300 hover:border-amber-400 hover:text-white"
              aria-label="වසන්න"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Selected Unit Status Banner (Mobile + Quick Feedback) */}
        <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-slate-800 bg-slate-950/65 px-4 py-2 text-xs sm:px-6">
          <div className="text-slate-300">
            {selectedUnit ? (
              <span>
                සක්‍රිය MCQ ඒකකය:{' '}
                <strong className="text-emerald-300">
                  ඒකකය {String(selectedUnit.unitNumber).padStart(2, '0')} · {selectedUnit.title}
                </strong>{' '}
                (තරඟය තුළ MCQ ආයුධ සඳහා මෙම ඒකකයේ ප්‍රශ්න පමණක් ලැබේ)
              </span>
            ) : (
              <span className="text-amber-200">
                තරඟය තුළ MCQ මගින් ආයුධ අගුළු හැරීමට පහතින් කැමති 10 ශ්‍රේණියේ ඒකකයක් SELECT කරන්න.
              </span>
            )}
          </div>
          <div className="font-mono-num shrink-0 font-semibold text-slate-400">
            නිල ඒකක {GRADE_10_UNITS.length}
          </div>
        </div>

        {/* Grade 10 Science Unit Cards Grid */}
        <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 overflow-y-auto p-3.5 sm:grid-cols-2 sm:p-5 lg:grid-cols-3 xl:grid-cols-4">
          {GRADE_10_UNITS.map((unit) => {
            const isSelected = save.mcqSelectedMode === unit.id;
            const branchInfo = BRANCH_LABELS[unit.branch];
            const prog = save.mcqModeProgress[unit.id];
            const answeredInUnit = prog?.totalAnswered ?? 0;

            return (
              <div
                key={unit.id}
                data-unit-id={unit.id}
                data-selected={isSelected ? 'true' : 'false'}
                className={`flex flex-col justify-between rounded-xl border p-3.5 text-left transition ${
                  isSelected
                    ? 'border-emerald-400 bg-emerald-950/25 ring-2 ring-emerald-400/70 shadow-lg shadow-emerald-500/10'
                    : 'border-slate-700/90 bg-slate-950/75'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2.5">
                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border p-1.5 ${
                        isSelected
                          ? 'border-emerald-400/60 bg-slate-900'
                          : 'border-slate-700/90 bg-slate-900'
                      }`}
                    >
                      <UnitIllustration modeId={unit.id} className="h-9 w-9" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-1 text-[11px] font-semibold">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono-num font-bold text-amber-300">
                            ඒකකය {String(unit.unitNumber).padStart(2, '0')}
                          </span>
                          <span className="text-slate-600">·</span>
                          <span className={branchInfo.accent}>{branchInfo.label}</span>
                        </div>
                        {isSelected && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-300">
                            <Check className="h-3 w-3" />
                            සක්‍රියයි
                          </span>
                        )}
                      </div>
                      <h3 className="font-fantasy mt-0.5 line-clamp-2 text-sm font-bold leading-snug text-white">
                        {unit.title}
                      </h3>
                    </div>
                  </div>

                  <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-slate-400">
                    {unit.subtitle}
                  </p>
                </div>

                <div className="mt-3 space-y-2.5 border-t border-slate-800/80 pt-2.5">
                  <div className="font-mono-num flex items-center justify-between gap-2 text-[11px] text-slate-300">
                    <span>ප්‍රශ්න {unit.questionCount}</span>
                    {answeredInUnit > 0 ? (
                      <span className="text-emerald-300">පිළිතුරු {answeredInUnit}</span>
                    ) : (
                      <span className="text-slate-400">10 ශ්‍රේණිය නිල ඒකකය</span>
                    )}
                  </div>

                  {/* ONLY ONE button under each unit: SELECT */}
                  <button
                    type="button"
                    onClick={() => handleSelectUnit(unit.id)}
                    aria-pressed={isSelected}
                    className={`flex min-h-[44px] w-full touch-manipulation items-center justify-center gap-1.5 rounded-xl px-4 py-2 text-sm font-bold tracking-wide transition active:scale-[0.98] ${
                      isSelected
                        ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                        : 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                    }`}
                  >
                    {isSelected && <Check className="h-4 w-4 stroke-[2.5]" />}
                    <span>SELECT</span>
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
