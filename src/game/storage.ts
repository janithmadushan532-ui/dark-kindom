import {
  CharacterId,
  HoverboardId,
  MISSIONS_POOL,
  MissionDef,
  SaveData,
  WorldId,
} from './types';

const STORAGE_KEY = 'cute_world_adventure_save_v1';

const DEFAULT_SAVE: SaveData = {
  totalCoins: 40,
  bestScores: {
    forest: 0,
    candy: 0,
    ocean: 0,
    snow: 0,
    sky: 0,
    crystal: 0,
  },
  bestDistances: {
    forest: 0,
    candy: 0,
    ocean: 0,
    snow: 0,
    sky: 0,
    crystal: 0,
  },
  unlockedCharacters: ['fox'],
  unlockedHoverboards: ['aero'],
  selectedCharacter: 'fox',
  selectedHoverboard: 'aero',
  selectedWorld: 'forest',
  muted: false,
  missionProgress: {},
  claimedMissions: [],
};

function cloneDefaultSave(): SaveData {
  return {
    ...DEFAULT_SAVE,
    bestScores: { ...DEFAULT_SAVE.bestScores },
    bestDistances: { ...DEFAULT_SAVE.bestDistances },
    unlockedCharacters: [...DEFAULT_SAVE.unlockedCharacters],
    unlockedHoverboards: [...DEFAULT_SAVE.unlockedHoverboards],
    missionProgress: {},
    claimedMissions: [],
  };
}

export function loadSaveData(): SaveData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return cloneDefaultSave();
    const parsed = JSON.parse(raw) as Partial<SaveData>;
    return {
      ...DEFAULT_SAVE,
      ...parsed,
      bestScores: { ...DEFAULT_SAVE.bestScores, ...(parsed.bestScores ?? {}) },
      bestDistances: { ...DEFAULT_SAVE.bestDistances, ...(parsed.bestDistances ?? {}) },
      unlockedCharacters: parsed.unlockedCharacters?.length
        ? (parsed.unlockedCharacters as CharacterId[])
        : ['fox'],
      unlockedHoverboards: parsed.unlockedHoverboards?.length
        ? (parsed.unlockedHoverboards as HoverboardId[])
        : ['aero'],
      missionProgress: { ...(parsed.missionProgress ?? {}) },
      claimedMissions: [...(parsed.claimedMissions ?? [])],
    };
  } catch {
    return cloneDefaultSave();
  }
}

export function writeSaveData(data: SaveData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Ignore storage quota errors in sandboxed iframes
  }
}

export function getActiveMissions(save: SaveData): MissionDef[] {
  const unclaimed = MISSIONS_POOL.filter((m) => !save.claimedMissions.includes(m.id));
  if (unclaimed.length >= 3) return unclaimed.slice(0, 3);
  return MISSIONS_POOL.slice(-3);
}

export function recordRunStats(
  save: SaveData,
  worldId: WorldId,
  distance: number,
  score: number,
  coins: number,
  powerupsCollected: number
): { updated: SaveData; isNewBest: boolean } {
  const prevBest = save.bestScores[worldId] ?? 0;
  const isNewBest = score > prevBest;
  const nextProgress = { ...save.missionProgress };

  for (const m of MISSIONS_POOL) {
    if (save.claimedMissions.includes(m.id)) continue;
    const cur = nextProgress[m.id] ?? 0;
    let delta = 0;
    if (m.metric === 'distance') delta = Math.floor(distance);
    else if (m.metric === 'coins') delta = coins;
    else if (m.metric === 'powerups') delta = powerupsCollected;
    else if (m.metric === 'runs') delta = 1;
    nextProgress[m.id] = Math.min(m.target, cur + delta);
  }

  const updated: SaveData = {
    ...save,
    totalCoins: save.totalCoins + coins,
    bestScores: {
      ...save.bestScores,
      [worldId]: Math.max(prevBest, score),
    },
    bestDistances: {
      ...save.bestDistances,
      [worldId]: Math.max(save.bestDistances[worldId] ?? 0, Math.floor(distance)),
    },
    missionProgress: nextProgress,
  };
  writeSaveData(updated);
  return { updated, isNewBest };
}
