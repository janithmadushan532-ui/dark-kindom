import { DifficultyBand, EnemyClass, SciFiEnemyAbility, TargetingMode } from '../types';

export const DIFFICULTY_SI: Record<DifficultyBand, string> = {
  Easy: 'ආරම්භක',
  Normal: 'සාමාන්‍ය',
  Hard: 'දුෂ්කර',
  'Very Hard': 'ඉතා දුෂ්කර',
  Expert: 'විශේෂඥ',
  Nightmare: 'භයානක',
};

export const TARGETING_SI: Record<TargetingMode, string> = {
  first: 'පළමු සතුරා',
  strongest: 'ශක්තිමත්ම',
  fastest: 'වේගවත්ම',
  flying_priority: 'පියාසර ප්‍රමුඛ',
  ground_priority: 'භූමි ප්‍රමුඛ',
  area: 'සමූහ ප්‍රදේශය',
};

export const ENEMY_CLASS_SI: Record<EnemyClass, string> = {
  normal: 'සාමාන්‍ය',
  fast: 'වේගවත්',
  armored: 'සන්නාහ',
  flying: 'පියාසර',
  shielded: 'පලිහ',
  resistant: 'ප්‍රතිරෝධී',
  elite: 'ප්‍රභූ',
  boss: 'ප්‍රධාන රාක්ෂයා',
};

export const SCI_FI_ABILITY_SI: Record<SciFiEnemyAbility, string> = {
  energy_shield: 'ශක්ති පලිහ',
  speed_boost: 'අධිවේගී බූස්ට්',
  armor_regen: 'නැනෝ ප්‍රතිසංස්කරණය',
  stealth: 'රහස් ආවරණය',
  emp_pulse: 'EMP විදුලි කම්පනය',
  aerial_dash: 'ගුවන් ධාවන පිම්ම',
  heavy_armor: 'ටයිටේනියම් සන්නාහය',
  boss_energy_wave: 'ප්ලාස්මා කම්පන තරංගය',
  void_teleport: 'ශුන්‍ය අවකාශ පිම්ම',
  long_range_jam: 'දුරස්ථ ලේසර් අවහිරය',
  toxic_aura: 'විෂ විකිරණ වළල්ල',
  cryo_aura: 'ක්‍රයෝ අධි-ශීත තරංගය',
};
