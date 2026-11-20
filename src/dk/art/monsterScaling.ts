import { EnemyClass } from '../types';

/**
 * Canonical logical-space (1280x720) monster radii used uniformly across ALL 100 levels.
 * Guarantees monsters never appear small or stick-like on Level 2+ or any mobile viewport.
 */
export function getCanonicalMonsterRadius(
  enemyClass: EnemyClass,
  isBoss: boolean,
  baseSize: number
): number {
  if (isBoss || enemyClass === 'boss') {
    return Math.max(72, Math.min(86, Math.round(baseSize * 2.35)));
  }
  if (enemyClass === 'elite') {
    return Math.max(50, Math.min(58, Math.round(baseSize * 2.45)));
  }
  if (enemyClass === 'armored' || enemyClass === 'shielded') {
    return Math.max(44, Math.min(52, Math.round(baseSize * 2.35)));
  }
  if (enemyClass === 'flying' || enemyClass === 'resistant') {
    return Math.max(38, Math.min(45, Math.round(baseSize * 2.25)));
  }
  // normal & fast units remain clearly visible across every level
  return Math.max(33, Math.min(39, Math.round(baseSize * 2.3)));
}

export function getMonsterClickHitRadius(
  enemyClass: EnemyClass,
  isBoss: boolean,
  baseSize: number
): number {
  const r = getCanonicalMonsterRadius(enemyClass, isBoss, baseSize);
  return Math.max(34, r * 1.15);
}
