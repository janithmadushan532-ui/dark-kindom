import { AchievementDef, SaveData } from './types';

export const ACHIEVEMENTS: AchievementDef[] = [
  {
    id: 'ach_first_blood',
    title: 'දොරටුවේ ආරක්ෂකයා',
    description: 'මට්ටම 1 ජයගෙන අහිමි දොරටුව ආරක්ෂා කරන්න.',
    rewardCoins: 100,
    metric: 'levels_cleared',
    target: 1,
  },
  {
    id: 'ach_world1_champ',
    title: 'අමතක රජු පරාජිතයා',
    description: 'මට්ටම් 5ක් ජයගෙන අමතක වූ රාජධානිය ජය ගන්න.',
    rewardCoins: 200,
    metric: 'levels_cleared',
    target: 5,
  },
  {
    id: 'ach_quarter_campaign',
    title: 'පෙරමුණු සෙන්පති',
    description: 'මෙහෙයුම් මට්ටම් 15ක් සම්පූර්ණ කරන්න.',
    rewardCoins: 350,
    metric: 'levels_cleared',
    target: 15,
  },
  {
    id: 'ach_half_campaign',
    title: 'යුධ උපාය විශාරද',
    description: 'මෙහෙයුම් මට්ටම් 25ක් සම්පූර්ණ කරන්න.',
    rewardCoins: 500,
    metric: 'levels_cleared',
    target: 25,
  },
  {
    id: 'ach_legend_50',
    title: 'අවසන් ආරක්ෂාවේ අධිපති',
    description: 'ලෝක 10ම හරහා මට්ටම් 50ම ජය ගන්න.',
    rewardCoins: 1500,
    metric: 'levels_cleared',
    target: 50,
  },
  {
    id: 'ach_stars_15',
    title: 'දිලිසෙන බලකොටුව',
    description: 'මෙහෙයුම් තරු 15ක් රැස් කරන්න.',
    rewardCoins: 150,
    metric: 'total_stars',
    target: 15,
  },
  {
    id: 'ach_stars_60',
    title: 'රාජකීය බලකොටු නිර්මාතෘ',
    description: 'මෙහෙයුම් තරු 60ක් රැස් කරන්න.',
    rewardCoins: 450,
    metric: 'total_stars',
    target: 60,
  },
  {
    id: 'ach_stars_120',
    title: 'පරිපූර්ණ විශිෂ්ටත්වය',
    description: 'මෙහෙයුම් තරු 120ක් රැස් කරන්න.',
    rewardCoins: 900,
    metric: 'total_stars',
    target: 120,
  },
  {
    id: 'ach_slayer_100',
    title: 'රාක්ෂ මර්දකයා',
    description: 'ආක්‍රමණික රාක්ෂයන් 100ක් පරාජය කරන්න.',
    rewardCoins: 120,
    metric: 'kills',
    target: 100,
  },
  {
    id: 'ach_slayer_1000',
    title: 'අඳුරු සේනාධිනායක',
    description: 'ආක්‍රමණික රාක්ෂයන් 1,000ක් පරාජය කරන්න.',
    rewardCoins: 400,
    metric: 'kills',
    target: 1000,
  },
  {
    id: 'ach_boss_1',
    title: 'රාජ්‍ය ඝාතකයා',
    description: 'ඔබේ පළමු ලෝක ප්‍රධාන රාක්ෂයා පරාජය කරන්න.',
    rewardCoins: 200,
    metric: 'bosses_slain',
    target: 1,
  },
  {
    id: 'ach_boss_5',
    title: 'යෝධ බිඳහෙලන්නා',
    description: 'ලෝක ප්‍රධාන රාක්ෂයන් 5ක් පරාජය කරන්න.',
    rewardCoins: 500,
    metric: 'bosses_slain',
    target: 5,
  },
  {
    id: 'ach_boss_10',
    title: 'මකර රජු ජයග්‍රාහකයා',
    description: 'ලෝක ප්‍රධාන රාක්ෂයන් 10ක් පරාජය කරන්න.',
    rewardCoins: 1000,
    metric: 'bosses_slain',
    target: 10,
  },
  {
    id: 'ach_scholar_10',
    title: 'විද්‍යා ආධුනිකයා',
    description: '10 ශ්‍රේණිය විද්‍යා MCQ ප්‍රශ්න 10 කට නිවැරදි පිළිතුරු දෙන්න.',
    rewardCoins: 180,
    metric: 'mcq_correct',
    target: 10,
  },
  {
    id: 'ach_scholar_50',
    title: 'විද්‍යා පරීක්ෂකයා',
    description: '10 ශ්‍රේණිය විද්‍යා MCQ ප්‍රශ්න 50 කට නිවැරදි පිළිතුරු දෙන්න.',
    rewardCoins: 450,
    metric: 'mcq_correct',
    target: 50,
  },
  {
    id: 'ach_scholar_200',
    title: 'විද්‍යා විශාරදයා',
    description: '10 ශ්‍රේණිය විද්‍යා MCQ ප්‍රශ්න 200 කට නිවැරදි පිළිතුරු දෙන්න.',
    rewardCoins: 950,
    metric: 'mcq_correct',
    target: 200,
  },
  {
    id: 'ach_perfect_sets_5',
    title: 'නිවැරදි බුද්ධිමතා',
    description: '10/10 පූර්ණ ලකුණු සහිත විද්‍යා මට්ටම් 5 ක් සම්පූර්ණ කරන්න.',
    rewardCoins: 500,
    metric: 'mcq_perfect_sets',
    target: 5,
  },
  {
    id: 'ach_perfect_sets_15',
    title: '10 ශ්‍රේණිය විද්‍යා ශූරයා',
    description: '10/10 පූර්ණ ලකුණු සහිත විද්‍යා මට්ටම් 15 ක් සම්පූර්ණ කරන්න.',
    rewardCoins: 1200,
    metric: 'mcq_perfect_sets',
    target: 15,
  },
  {
    id: 'ach_cyber_60',
    title: 'සයිබර් නටබුන් ජයග්‍රාහකයා',
    description: 'මෙහෙයුම් මට්ටම් 60ක් සම්පූර්ණ කරන්න.',
    rewardCoins: 1800,
    metric: 'levels_cleared',
    target: 60,
  },
  {
    id: 'ach_cryo_80',
    title: 'හිම මෙකා සෙන්පති',
    description: 'මෙහෙයුම් මට්ටම් 80ක් සම්පූර්ණ කරන්න.',
    rewardCoins: 2400,
    metric: 'levels_cleared',
    target: 80,
  },
  {
    id: 'ach_omega_100',
    title: 'ඔමේගා අවසන් විජයග්‍රාහකයා',
    description: 'ලෝක 15ම හරහා මට්ටම් 100ම ජය ගන්න!',
    rewardCoins: 5000,
    metric: 'levels_cleared',
    target: 100,
  },
  {
    id: 'ach_stars_200',
    title: 'තරු අධිරාජ්‍යයා',
    description: 'මෙහෙයුම් තරු 200ක් රැස් කරන්න.',
    rewardCoins: 1600,
    metric: 'total_stars',
    target: 200,
  },
  {
    id: 'ach_stars_300',
    title: 'සර්ව-සම්පූර්ණ මහා ආරක්ෂකයා',
    description: 'මට්ටම් 100ම සඳහා උපරිම තරු 300ම රැස් කරන්න.',
    rewardCoins: 3500,
    metric: 'total_stars',
    target: 300,
  },
  {
    id: 'ach_slayer_3000',
    title: 'මහා සයිබර් සංහාරකයා',
    description: 'ආක්‍රමණික රාක්ෂයන් 3,000ක් පරාජය කරන්න.',
    rewardCoins: 1200,
    metric: 'kills',
    target: 3000,
  },
  {
    id: 'ach_slayer_6000',
    title: 'අනන්ත ආරක්ෂක වීරයා',
    description: 'ආක්‍රමණික රාක්ෂයන් 6,000ක් පරාජය කරන්න.',
    rewardCoins: 2500,
    metric: 'kills',
    target: 6000,
  },
  {
    id: 'ach_boss_15',
    title: 'අධිරාජ්‍ය නාශකයා',
    description: 'ලෝක ප්‍රධාන රාක්ෂයන් 15ක් පරාජය කරන්න.',
    rewardCoins: 3000,
    metric: 'bosses_slain',
    target: 15,
  },
];

export function getAchievementProgress(def: AchievementDef, save: SaveData): number {
  switch (def.metric) {
    case 'levels_cleared':
      return Object.keys(save.levelStars).length;
    case 'total_stars':
      return Object.values(save.levelStars).reduce((a, b) => a + b, 0);
    case 'kills':
      return save.totalKills;
    case 'mcq_correct':
      return save.mcqTotalCorrect;
    case 'mcq_perfect_sets':
      return save.mcqPerfectSets;
    case 'bosses_slain':
      return save.bossesSlain;
  }
}
