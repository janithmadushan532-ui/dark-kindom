import {
  McqLessonDef,
  McqLessonProgress,
  McqModeProgress,
  McqStudyModeId,
  McqUnitId,
  ResolvedMcqQuestion,
} from '../types';
import { GRADE_10_MCQS } from './grade10';
import { GRADE_10_LESSONS, GRADE_10_UNITS } from './lessons';

export { GRADE_10_LESSONS, GRADE_10_UNITS, GRADE_10_MCQS };

export const MCQ_LEVELS_PER_MODE = 100;
export const MCQ_QUESTIONS_PER_LEVEL = 10;

export const ALL_MCQ_LESSONS: McqLessonDef[] = GRADE_10_LESSONS;

export const LESSON_MAP: Record<string, McqLessonDef> = ALL_MCQ_LESSONS.reduce(
  (acc, lesson) => {
    acc[lesson.id] = lesson;
    return acc;
  },
  {} as Record<string, McqLessonDef>
);

export const ALL_MCQS: ResolvedMcqQuestion[] = GRADE_10_MCQS;

export const MCQ_MAP: Record<string, ResolvedMcqQuestion> = ALL_MCQS.reduce(
  (acc, q) => {
    acc[q.id] = q;
    return acc;
  },
  {} as Record<string, ResolvedMcqQuestion>
);

export function getLessonsForGrade(_grade: 10 = 10): McqLessonDef[] {
  return GRADE_10_LESSONS;
}

export function getQuestionsForUnit(unitId: McqUnitId): ResolvedMcqQuestion[] {
  return ALL_MCQS.filter((q) => q.unit_id === unitId);
}

export function getQuestionsForLesson(lessonId: string): ResolvedMcqQuestion[] {
  return ALL_MCQS.filter((q) => q.unit_id === lessonId || q.lessonId === lessonId);
}

export function getQuestionsForMode(modeId: McqStudyModeId): ResolvedMcqQuestion[] {
  if (modeId === 'ALL_UNITS') {
    return ALL_MCQS;
  }
  return ALL_MCQS.filter((q) => q.unit_id === modeId);
}

export function computeLessonStars(correctCount: number, total = 10): 0 | 1 | 2 | 3 {
  if (total <= 0) return 0;
  const ratio = correctCount / total;
  if (ratio >= 0.9) return 3;
  if (ratio >= 0.7) return 2;
  if (ratio >= 0.5) return 1;
  return 0;
}

export function isLessonUnlocked(
  lessonId: string,
  _progress: Record<string, McqLessonProgress>
): boolean {
  return Boolean(LESSON_MAP[lessonId]);
}

export function createEmptyModeProgress(modeId: McqStudyModeId): McqModeProgress {
  return {
    modeId,
    currentLevel: 1,
    completedLevels: [],
    levelStars: {},
    levelBestScores: {},
    totalAnswered: 0,
    totalCorrect: 0,
    totalScore: 0,
    perfectLevels: 0,
    seenQuestionIds: [],
    lastQuestionId: null,
  };
}

/**
 * Records a displayed question within a single unit's rotation cycle.
 * Keeps tracking unique shown IDs until all questions in the unit (`poolIds`)
 * have been shown once, then automatically resets `nextSeenQuestionIds` to `[]`
 * for the next cycle while remembering `lastQuestionId` so the next draw
 * never shows the same question back-to-back across the cycle boundary.
 */
export function advanceUnitCycleState(
  poolIds: string[],
  currentSeenIds: string[],
  shownQuestionId: string
): {
  nextSeenQuestionIds: string[];
  lastQuestionId: string;
  cycleCompleted: boolean;
} {
  const poolSet = new Set(poolIds);
  const validSeen = currentSeenIds.filter((id) => poolSet.has(id));
  const nextSet = new Set(validSeen);
  if (poolSet.has(shownQuestionId)) {
    nextSet.add(shownQuestionId);
  }

  if (poolSet.size > 0 && nextSet.size >= poolSet.size) {
    return {
      nextSeenQuestionIds: [],
      lastQuestionId: shownQuestionId,
      cycleCompleted: true,
    };
  }

  return {
    nextSeenQuestionIds: Array.from(nextSet),
    lastQuestionId: shownQuestionId,
    cycleCompleted: false,
  };
}

export function isModeLevelUnlocked(levelNumber: number, progress?: McqModeProgress): boolean {
  if (levelNumber <= 1) return true;
  if (levelNumber > MCQ_LEVELS_PER_MODE) return false;
  if (!progress) return false;
  return (
    levelNumber <= progress.currentLevel ||
    progress.completedLevels.includes(levelNumber) ||
    progress.completedLevels.includes(levelNumber - 1)
  );
}

/**
 * Randomly shuffles the 4 MCQ options while keeping `correctIndex` and
 * `correct_answer` strictly synchronized.
 */
export function shuffleMcqOptions(question: ResolvedMcqQuestion): ResolvedMcqQuestion {
  const indexed = question.options.map((text, idx) => ({
    text,
    isCorrect: idx === question.correctIndex,
  }));
  const shuffled = shuffleArray(indexed);
  const nextCorrectIndex = shuffled.findIndex((item) => item.isCorrect) as 0 | 1 | 2 | 3;

  return {
    ...question,
    options: [
      shuffled[0].text,
      shuffled[1].text,
      shuffled[2].text,
      shuffled[3].text,
    ],
    correctIndex: nextCorrectIndex,
    correct_answer: shuffled[nextCorrectIndex].text,
  };
}

/**
 * Draws EXACTLY `count` (default 10) MCQs for a Unit-Wise or ALL UNITS level.
 * - Filters ONLY from the central `ALL_MCQS` database (`unit_id` or all units).
 * - Never mixes other units when a specific unit is selected.
 * - Avoids repeating seen questions until the available bank for that mode is exhausted.
 * - Randomizes both question order and A/B/C/D answer option positions.
 */
export function drawUnitLevelMcqs(
  modeId: McqStudyModeId,
  seenQuestionIds: string[],
  count = MCQ_QUESTIONS_PER_LEVEL
): {
  questions: ResolvedMcqQuestion[];
  nextSeenQuestionIds: string[];
  resetHistory: boolean;
} {
  const pool = getQuestionsForMode(modeId);
  if (pool.length === 0) {
    return { questions: [], nextSeenQuestionIds: [], resetHistory: false };
  }

  const seenSet = new Set(seenQuestionIds);
  const unseen = shuffleArray(pool.filter((q) => !seenSet.has(q.question_id)));

  let picked: ResolvedMcqQuestion[];
  let resetHistory = false;
  let nextSeenQuestionIds: string[];

  if (unseen.length >= count) {
    picked = unseen.slice(0, count);
    nextSeenQuestionIds = Array.from(
      new Set([...seenQuestionIds, ...picked.map((q) => q.question_id)])
    );
  } else {
    // Use remaining unseen questions first, then cycle pool cleanly without in-level duplicates
    resetHistory = true;
    const unseenIds = new Set(unseen.map((q) => q.question_id));
    const remainderPool = shuffleArray(pool.filter((q) => !unseenIds.has(q.question_id)));
    const neededFromReset = Math.max(0, count - unseen.length);
    const resetPicks = remainderPool.slice(0, neededFromReset);
    picked = shuffleArray([...unseen, ...resetPicks]);
    nextSeenQuestionIds = resetPicks.map((q) => q.question_id);
  }

  return {
    questions: picked.map(shuffleMcqOptions),
    nextSeenQuestionIds,
    resetHistory,
  };
}

export type McqRewardType = 'arcaneStorm' | 'castleRepair' | 'goldSurge';

export interface McqRewardBundle {
  perfect: boolean;
  correctCount: number;
  bonusCoins: number;
  xpBonus: number;
  specialAbility?: {
    type: McqRewardType;
    label: string;
    description: string;
  };
}

export type McqDrawFilter =
  | 10
  | { grade?: 10; lessonId?: string; modeId?: McqStudyModeId | null };

/**
 * Draws `count` Sinhala Science MCQs from the central Grade 10 database
 * for in-battle Smart Weapon Shop unlocks, respecting the active Unit mode,
 * exhausting all unseen questions in that unit's current cycle before recycling,
 * never showing the same question twice in a row (including across cycle resets),
 * and shuffling both question order and answer option positions.
 */
export function drawMcqSet(
  answeredIds: string[],
  count = 3,
  filter?: McqDrawFilter,
  lastQuestionId?: string | null
): { questions: ResolvedMcqQuestion[]; resetHistory: boolean; poolIds: string[] } {
  let pool: ResolvedMcqQuestion[] = ALL_MCQS;
  if (typeof filter === 'number') {
    pool = ALL_MCQS.filter((q) => q.grade === filter);
  } else if (filter) {
    if (filter.modeId) {
      pool = getQuestionsForMode(filter.modeId);
    } else if (filter.lessonId) {
      pool = ALL_MCQS.filter(
        (q) => q.unit_id === filter.lessonId || q.lessonId === filter.lessonId
      );
    } else if (filter.grade) {
      pool = ALL_MCQS.filter((q) => q.grade === filter.grade);
    }
  }

  if (pool.length === 0) {
    return { questions: [], resetHistory: false, poolIds: [] };
  }

  const seenSet = new Set(answeredIds);
  const unseen = shuffleArray(pool.filter((q) => !seenSet.has(q.question_id)));

  // Ensure the very first question is never the same as `lastQuestionId` when alternatives exist
  if (lastQuestionId && unseen.length > 1 && unseen[0].question_id === lastQuestionId) {
    const swapIdx = unseen.findIndex((q) => q.question_id !== lastQuestionId);
    if (swapIdx > 0) {
      [unseen[0], unseen[swapIdx]] = [unseen[swapIdx], unseen[0]];
    }
  }

  let picked: ResolvedMcqQuestion[];
  let resetHistory = false;

  if (unseen.length >= count) {
    picked = unseen.slice(0, count);
  } else if (unseen.length > 0) {
    // Exhaust all remaining unseen questions of the current cycle first,
    // then fill the rest from a fresh shuffle of the remaining pool.
    resetHistory = true;
    const unseenIdSet = new Set(unseen.map((q) => q.question_id));
    const remainderPool = shuffleArray(pool.filter((q) => !unseenIdSet.has(q.question_id)));
    const lastUnseenId = unseen[unseen.length - 1].question_id;
    if (remainderPool.length > 1 && remainderPool[0].question_id === lastUnseenId) {
      [remainderPool[0], remainderPool[1]] = [remainderPool[1], remainderPool[0]];
    }
    picked = [...unseen, ...remainderPool.slice(0, count - unseen.length)];
  } else {
    // Cycle had already reached 0 unseen: start a newly shuffled full-unit cycle
    resetHistory = true;
    const freshPool = shuffleArray(pool);
    if (lastQuestionId && freshPool.length > 1 && freshPool[0].question_id === lastQuestionId) {
      [freshPool[0], freshPool[1]] = [freshPool[1], freshPool[0]];
    }
    picked = freshPool.slice(0, count);
  }

  return {
    questions: picked.map(shuffleMcqOptions),
    resetHistory,
    poolIds: pool.map((q) => q.question_id),
  };
}

export function evaluateMcqReward(correctCount: number): McqRewardBundle {
  if (correctCount >= 3) {
    const specials: McqRewardBundle['specialAbility'][] = [
      {
        type: 'arcaneStorm',
        label: 'අකුණු කුණාටු බලය',
        description: 'සටන් බිමේ සිටින සියලුම සතුරන්ට විදුලි ප්‍රහාර එල්ල කරයි.',
      },
      {
        type: 'castleRepair',
        label: 'බලකොටු ප්‍රතිසංස්කරණය',
        description: 'රාජකීය බලකොටුවේ සෞඛ්‍යය 35% කින් ක්ෂණිකව ප්‍රතිසාධනය කරයි.',
      },
      {
        type: 'goldSurge',
        label: 'රාජකීය භාණ්ඩාගාර ත්‍යාගය',
        description: 'සටන් බිමේදී ක්ෂණිකව +180 රන් කාසි ලබා දෙයි.',
      },
    ];
    const picked = specials[Math.floor(Math.random() * specials.length)];
    return {
      perfect: true,
      correctCount,
      bonusCoins: 120,
      xpBonus: 75,
      specialAbility: picked,
    };
  }

  if (correctCount === 2) {
    return {
      perfect: false,
      correctCount,
      bonusCoins: 55,
      xpBonus: 35,
    };
  }

  if (correctCount === 1) {
    return {
      perfect: false,
      correctCount,
      bonusCoins: 25,
      xpBonus: 15,
    };
  }

  return {
    perfect: false,
    correctCount: 0,
    bonusCoins: 10,
    xpBonus: 5,
  };
}

function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
