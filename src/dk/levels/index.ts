import { LevelConfig, WorldId } from '../types';
import { WORLD_01_LEVELS } from './world01';
import { WORLD_02_LEVELS } from './world02';
import { WORLD_03_LEVELS } from './world03';
import { WORLD_04_LEVELS } from './world04';
import { WORLD_05_LEVELS } from './world05';
import { WORLD_06_LEVELS } from './world06';
import { WORLD_07_LEVELS } from './world07';
import { WORLD_08_LEVELS } from './world08';
import { WORLD_09_LEVELS } from './world09';
import { WORLD_10_LEVELS } from './world10';
import { WORLD_11_LEVELS } from './world11';
import { WORLD_12_LEVELS } from './world12';
import { WORLD_13_LEVELS } from './world13';
import { WORLD_14_LEVELS } from './world14';
import { WORLD_15_LEVELS } from './world15';

export const ALL_LEVELS: LevelConfig[] = [
  ...WORLD_01_LEVELS,
  ...WORLD_02_LEVELS,
  ...WORLD_03_LEVELS,
  ...WORLD_04_LEVELS,
  ...WORLD_05_LEVELS,
  ...WORLD_06_LEVELS,
  ...WORLD_07_LEVELS,
  ...WORLD_08_LEVELS,
  ...WORLD_09_LEVELS,
  ...WORLD_10_LEVELS,
  ...WORLD_11_LEVELS,
  ...WORLD_12_LEVELS,
  ...WORLD_13_LEVELS,
  ...WORLD_14_LEVELS,
  ...WORLD_15_LEVELS,
];

export const LEVEL_MAP: Record<number, LevelConfig> = ALL_LEVELS.reduce(
  (acc, lvl) => {
    acc[lvl.id] = lvl;
    return acc;
  },
  {} as Record<number, LevelConfig>
);

export function getLevelsByWorld(worldId: WorldId): LevelConfig[] {
  return ALL_LEVELS.filter((l) => l.worldId === worldId);
}
