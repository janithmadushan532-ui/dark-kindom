import { McqModeProgress, McqStudyModeId, SaveData, WeaponId } from './types';

export const SAVE_STORAGE_KEY = 'dk_last_defense_save_v1';

const VALID_MODE_ID_RE = /^(G10_U(0[1-9]|1[0-9]|20)|ALL_UNITS)$/;
const VALID_MCQ_ID_RE = /^G10_(L|U)\d{2}_Q\d{2,3}$/;

const ALL_WEAPON_IDS: WeaponId[] = [
  'shadow_archer',
  'iron_cannon',
  'ice_wizard',
  'thunder_tower',
  'poison_tower',
  'fire_dragon',
  'crystal_laser',
  'ancient_guardian',
  'sky_hunter',
  'missile_platform',
  'storm_cannon',
  'drone_station',
  'plasma_air_defense',
  'titan_plasma_cannon',
];

export function createDefaultSaveData(): SaveData {
  return {
    coins: 250,
    xp: 0,
    playerLevel: 1,
    highestUnlockedLevel: 1,
    levelStars: {},
    levelBestScores: {},
    unlockedWeapons: [...ALL_WEAPON_IDS],
    specialAbilitiesUnlocked: [],
    answeredMcqIds: [],
    mcqTotalAnswered: 0,
    mcqTotalCorrect: 0,
    mcqPerfectSets: 0,
    mcqLessonProgress: {},
    mcqSelectedMode: null,
    mcqModeProgress: {},
    totalKills: 0,
    bossesSlain: 0,
    claimedAchievements: [],
    claimedWorldBonuses: [],
    dailyLastClaimDate: null,
    dailyStreak: 0,
    musicEnabled: true,
    sfxEnabled: true,
    graphics: {
      particles: 'high',
      showRangeAlways: false,
      showDamageNumbers: true,
    },
  };
}

function sanitizeModeProgress(
  modeId: McqStudyModeId,
  raw: Partial<McqModeProgress>
): McqModeProgress {
  const completedLevels = Array.isArray(raw.completedLevels)
    ? Array.from(
        new Set(
          raw.completedLevels
            .map((n) => Number(n))
            .filter((n) => Number.isInteger(n) && n >= 1 && n <= 100)
        )
      ).sort((a, b) => a - b)
    : [];

  const levelStars: Record<number, 0 | 1 | 2 | 3> = {};
  if (raw.levelStars && typeof raw.levelStars === 'object') {
    for (const [k, v] of Object.entries(raw.levelStars)) {
      const lvl = Number(k);
      const stars = Number(v);
      if (lvl >= 1 && lvl <= 100 && (stars === 0 || stars === 1 || stars === 2 || stars === 3)) {
        levelStars[lvl] = stars;
      }
    }
  }

  const levelBestScores: Record<number, number> = {};
  if (raw.levelBestScores && typeof raw.levelBestScores === 'object') {
    for (const [k, v] of Object.entries(raw.levelBestScores)) {
      const lvl = Number(k);
      const score = Number(v);
      if (lvl >= 1 && lvl <= 100 && Number.isFinite(score) && score >= 0 && score <= 10) {
        levelBestScores[lvl] = score;
      }
    }
  }

  const seenQuestionIds = Array.isArray(raw.seenQuestionIds)
    ? raw.seenQuestionIds.filter((id) => typeof id === 'string' && VALID_MCQ_ID_RE.test(id))
    : [];
  const lastQuestionId =
    typeof raw.lastQuestionId === 'string' && VALID_MCQ_ID_RE.test(raw.lastQuestionId)
      ? raw.lastQuestionId
      : null;

  const maxCompleted = completedLevels.length > 0 ? completedLevels[completedLevels.length - 1] : 0;
  const rawCurrent = Number(raw.currentLevel ?? 1) || 1;
  const currentLevel = Math.max(1, Math.min(100, Math.max(rawCurrent, Math.min(100, maxCompleted + 1))));

  return {
    modeId,
    currentLevel,
    completedLevels,
    levelStars,
    levelBestScores,
    totalAnswered: Math.max(0, Number(raw.totalAnswered ?? 0) || 0),
    totalCorrect: Math.max(0, Number(raw.totalCorrect ?? 0) || 0),
    totalScore: Math.max(0, Number(raw.totalScore ?? 0) || 0),
    perfectLevels: Math.max(0, Number(raw.perfectLevels ?? 0) || 0),
    seenQuestionIds,
    lastQuestionId,
  };
}

export function loadSaveData(): SaveData {
  if (typeof window === 'undefined' || !window.localStorage) {
    return createDefaultSaveData();
  }
  try {
    const raw = window.localStorage.getItem(SAVE_STORAGE_KEY);
    if (!raw) return createDefaultSaveData();
    const parsed = JSON.parse(raw) as Partial<SaveData>;
    const defaults = createDefaultSaveData();

    const cleanAnsweredMcqIds = Array.isArray(parsed.answeredMcqIds)
      ? parsed.answeredMcqIds.filter((id) => typeof id === 'string' && VALID_MCQ_ID_RE.test(id))
      : [];

    const cleanLessonProgress: SaveData['mcqLessonProgress'] = {};
    if (parsed.mcqLessonProgress && typeof parsed.mcqLessonProgress === 'object') {
      for (const [lessonId, prog] of Object.entries(parsed.mcqLessonProgress)) {
        if (/^G10_U(0[1-9]|1[0-9]|20)$/.test(lessonId) && prog && typeof prog === 'object') {
          cleanLessonProgress[lessonId] = prog;
        }
      }
    }

    const cleanModeProgress: Record<string, McqModeProgress> = {};
    if (parsed.mcqModeProgress && typeof parsed.mcqModeProgress === 'object') {
      for (const [modeKey, modeProg] of Object.entries(parsed.mcqModeProgress)) {
        if (VALID_MODE_ID_RE.test(modeKey) && modeProg && typeof modeProg === 'object') {
          cleanModeProgress[modeKey] = sanitizeModeProgress(
            modeKey as McqStudyModeId,
            modeProg as Partial<McqModeProgress>
          );
        }
      }
    }

    // Preserve legacy lesson progress seamlessly into Level 1 of each corresponding unit
    for (const [lessonId, legacy] of Object.entries(cleanLessonProgress)) {
      if (!cleanModeProgress[lessonId] && legacy && (legacy.attempts > 0 || legacy.completed)) {
        cleanModeProgress[lessonId] = sanitizeModeProgress(lessonId as McqStudyModeId, {
          modeId: lessonId as McqStudyModeId,
          currentLevel: legacy.completed ? 2 : 1,
          completedLevels: legacy.completed ? [1] : [],
          levelStars: { 1: legacy.stars ?? 0 },
          levelBestScores: { 1: legacy.bestScore ?? 0 },
          totalAnswered: (legacy.attempts ?? 1) * 10,
          totalCorrect: legacy.bestScore ?? 0,
          totalScore: (legacy.bestScore ?? 0) * 10,
          perfectLevels: legacy.bestScore === 10 ? 1 : 0,
          seenQuestionIds: [],
        });
      }
    }

    const cleanSelectedMode =
      typeof parsed.mcqSelectedMode === 'string' &&
      /^G10_U(0[1-9]|1[0-9]|20)$/.test(parsed.mcqSelectedMode)
        ? (parsed.mcqSelectedMode as McqStudyModeId)
        : null;

    const levelStars = parsed.levelStars ?? {};
    let highestUnlockedLevel = Math.max(
      1,
      Math.min(100, Number(parsed.highestUnlockedLevel ?? 1) || 1)
    );
    if ((levelStars[50] ?? 0) > 0 && highestUnlockedLevel < 51) {
      highestUnlockedLevel = 51;
    }

    return {
      ...defaults,
      ...parsed,
      highestUnlockedLevel,
      levelStars,
      levelBestScores: parsed.levelBestScores ?? {},
      unlockedWeapons:
        Array.isArray(parsed.unlockedWeapons) && parsed.unlockedWeapons.length > 0
          ? Array.from(new Set([...parsed.unlockedWeapons, ...ALL_WEAPON_IDS]))
          : defaults.unlockedWeapons,
      specialAbilitiesUnlocked: parsed.specialAbilitiesUnlocked ?? [],
      answeredMcqIds: cleanAnsweredMcqIds,
      mcqLessonProgress: cleanLessonProgress,
      mcqSelectedMode: cleanSelectedMode,
      mcqModeProgress: cleanModeProgress,
      claimedAchievements: parsed.claimedAchievements ?? [],
      claimedWorldBonuses: Array.isArray(parsed.claimedWorldBonuses)
        ? parsed.claimedWorldBonuses
        : [],
      graphics: {
        ...defaults.graphics,
        ...(parsed.graphics ?? {}),
      },
    };
  } catch {
    return createDefaultSaveData();
  }
}

export function saveSaveData(data: SaveData): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    window.localStorage.setItem(SAVE_STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Ignore quota errors
  }
}

export function calculatePlayerLevel(xp: number): {
  level: number;
  currentXpInLevel: number;
  xpForNextLevel: number;
} {
  let level = 1;
  let remaining = Math.max(0, Math.floor(xp));
  let needed = 150;
  while (remaining >= needed) {
    remaining -= needed;
    level++;
    needed = Math.floor(150 + (level - 1) * 65);
  }
  return {
    level,
    currentXpInLevel: remaining,
    xpForNextLevel: needed,
  };
}

export function computeStarsFromBattle(castleHp: number, maxCastleHp: number): 1 | 2 | 3 {
  const ratio = maxCastleHp > 0 ? castleHp / maxCastleHp : 0;
  if (ratio >= 0.85) return 3;
  if (ratio >= 0.5) return 2;
  return 1;
}

export function getTotalStars(save: SaveData): number {
  return Object.values(save.levelStars).reduce((sum, s) => sum + s, 0);
}

export function canClaimDailyReward(save: SaveData, now = new Date()): boolean {
  const today = now.toISOString().slice(0, 10);
  return save.dailyLastClaimDate !== today;
}

export function applyDailyRewardClaim(save: SaveData, now = new Date()): {
  nextSave: SaveData;
  rewardCoins: number;
  newStreak: number;
} {
  const today = now.toISOString().slice(0, 10);
  const yesterdayDate = new Date(now.getTime() - 86400000).toISOString().slice(0, 10);
  const nextStreak =
    save.dailyLastClaimDate === yesterdayDate ? Math.min(7, save.dailyStreak + 1) : 1;
  const streakRewards = [120, 160, 210, 270, 340, 420, 600];
  const rewardCoins = streakRewards[nextStreak - 1] ?? 150;
  const nextSave: SaveData = {
    ...save,
    coins: save.coins + rewardCoins,
    dailyLastClaimDate: today,
    dailyStreak: nextStreak,
  };
  return { nextSave, rewardCoins, newStreak: nextStreak };
}
