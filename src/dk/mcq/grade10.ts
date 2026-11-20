import { McqLessonDef, McqQuestion, McqUnitId, ResolvedMcqQuestion } from '../types';
import { GRADE_10_EXPANDED_U01_U02_MCQS } from './grade10_expanded_u01_u02';
import { GRADE_10_EXPANDED_U03_U04_MCQS } from './grade10_expanded_u03_u04';
import { GRADE_10_EXPANDED_U05_U06_MCQS } from './grade10_expanded_u05_u06';
import { GRADE_10_EXPANDED_U07_U08_MCQS } from './grade10_expanded_u07_u08';
import { GRADE_10_EXPANDED_U09_U10_MCQS } from './grade10_expanded_u09_u10';
import { GRADE_10_EXPANDED_U11_U12_MCQS } from './grade10_expanded_u11_u12';
import { GRADE_10_EXPANDED_U13_U14_MCQS } from './grade10_expanded_u13_u14';
import { GRADE_10_EXPANDED_U15_U16_MCQS } from './grade10_expanded_u15_u16';
import { GRADE_10_EXPANDED_U17_U18_MCQS } from './grade10_expanded_u17_u18';
import { GRADE_10_EXPANDED_U19_U20_MCQS } from './grade10_expanded_u19_u20';
import { GRADE_10_EXTRA_PART1_MCQS } from './grade10_extra_part1';
import { GRADE_10_EXTRA_PART2_MCQS } from './grade10_extra_part2';
import { GRADE_10_PART1_MCQS } from './grade10_part1';
import { GRADE_10_PART2_MCQS } from './grade10_part2';
import { GRADE_10_LESSONS } from './lessons';

const UNIT_BY_ID: Record<string, McqLessonDef> = GRADE_10_LESSONS.reduce(
  (acc, unit) => {
    acc[unit.id] = unit;
    return acc;
  },
  {} as Record<string, McqLessonDef>
);

const ENRICHED_EXPLANATIONS: Record<string, string> = {
  G10_L02_Q05:
    'ත්වරණය යනු ඒකක කාලයකදී ප්‍රවේගය වෙනස් වීමේ ශීඝ්‍රතාවයි: a = (v - u) / t = (20 - 0) / 5 = 4 m s⁻². සෑම තත්පරයකදීම ප්‍රවේගය 4 m s⁻¹ කින් වැඩි වේ.',
  G10_L02_Q08:
    'km h⁻¹ අගයක් m s⁻¹ බවට පරිවර්තනය කිරීමේදී 1 km = 1000 m සහ 1 h = 3600 s බැවින්: 72 km h⁻¹ = (72 × 1000 m) / 3600 s = 20 m s⁻¹ වේ.',
  G10_L04_Q05:
    'වස්තුවක බර යනු පෘථිවිය මගින් එම ස්කන්ධය මත යොදන ගුරුත්වාකර්ෂණ බලයයි: W = m × g = 6 kg × 10 m s⁻² = 60 N වේ.',
  G10_L04_Q08:
    'රේඛීය ගම්‍යතාව යනු වස්තුවේ ස්කන්ධය හා ප්‍රවේගයේ ගුණිතයයි: p = m × v = 5 kg × 12 m s⁻¹ = 60 kg m s⁻¹ වේ.',
  G10_L07_Q02:
    'ඕනෑම ද්‍රව්‍යයක මවුල 1 ක අඩංගු මූලික අංශු (පරමාණු, අණු හෝ අයන) සංඛ්‍යාව ඇවගාඩ්රෝ නියතය (L) = 6.022 × 10²³ mol⁻¹ වේ.',
  G10_L07_Q03:
    'කැල්සියම් කාබනේට් (CaCO₃) හි සාපේක්ෂ සූත්‍ර ස්කන්ධය එහි සංඝටක පරමාණුවල සාපේක්ෂ පරමාණුක ස්කන්ධ එකතුවට සමාන වේ: 40 + 12 + (3 × 16) = 40 + 12 + 48 = 100.',
  G10_L07_Q06:
    'ස්කන්ධය (m) = මවුල ගණන (n) × මවුලික ස්කන්ධය (M). ජලයේ මවුලික ස්කන්ධය 18 g mol⁻¹ බැවින් 2.5 mol × 18 g mol⁻¹ = 45 g වේ.',
  G10_L07_Q07:
    'සල්ෆියුරික් අම්ලය (H₂SO₄) අණුවේ සාපේක්ෂ අණුක ස්කන්ධය = (2 × 1) + 32 + (4 × 16) = 2 + 32 + 64 = 98 වේ.',
  G10_L09_Q05:
    'එකිනෙකට ලම්බක (90°) බල දෙකක සම්ප්‍රයුක්තය පයිතගරස් ප්‍රමේයයෙන් ලැබේ: R = √(6² + 8²) = √(36 + 64) = √100 = 10 N වේ.',
  G10_L09_Q10:
    'පරිමාණ රූප සටහනේ 1 cm කින් 10 N නිරූපණය වන බැවින් සම්ප්‍රයුක්ත විකර්ණයේ දිග වන 6.5 cm මගින් 6.5 × 10 N = 65 N ක බලයක් නිරූපණය වේ.',
  G10_L11_Q01:
    'බල ඝූර්ණය යනු බලයත් භ්‍රමණ ලක්ෂ්‍යයේ සිට බලයේ ක්‍රියා රේඛාවට ඇති ලම්බක දුරත් අතර ගුණිතය බැවින් එහි SI ඒකකය නිව්ටන් මීටරය (N m) වේ.',
  G10_L11_Q02:
    'බල ඝූර්ණය = බලය × ලම්බක දුර. දොර අගුලේ සිට අසව්වට ලම්බක දුර 0.8 m බැවින් ඝූර්ණය = 25 N × 0.8 m = 20 N m වේ.',
  G10_L11_Q08:
    'ඝූර්ණ මූලධර්මය අනුව සමතුලිත අවස්ථාවේදී වාමාවර්ත ඝූර්ණය දක්ෂිණාවර්ත ඝූර්ණයට සමාන වේ: 400 × 1.5 = X × 2.0 → 600 = 2X → X = 300 N වේ.',
  G10_L15_Q02:
    'ද්‍රවස්ථිති පීඩනය P = hρg සමීකරණයෙන් ගණනය කෙරේ. මෙහි h = 3 m, ρ = 1000 kg m⁻³ සහ g = 10 m s⁻² බැවින් P = 3 × 1000 × 10 = 30 000 Pa (30 kPa) වේ.',
  G10_L15_Q07:
    'ආකිමිඩීස් මූලධර්මය අනුව ද්‍රවයක ගිල්වූ වස්තුවක දෘශ්‍ය බර අඩු වීම උඩුකුරු තෙරපුමට සමාන වේ: 20 N - 14 N = 6 N වේ.',
  G10_L18_Q02:
    'යාන්ත්‍රික කාර්යය = බලය × බලයේ දිශාවට විස්ථාපනය (W = F × s). එබැවින් W = 40 N × 3.5 m = 140 J වේ.',
  G10_L18_Q03:
    'චලනය වන වස්තුවක චාලක ශක්තිය Eₖ = ½mv² වේ. මෙහි m = 2 kg සහ v = 6 m s⁻¹ බැවින් Eₖ = ½ × 2 × 6² = 36 J වේ.',
  G10_L18_Q04:
    'ගුරුත්වාකර්ෂණ විභව ශක්තිය Eₚ = mgh වේ. ස්කන්ධය 5 kg වූ වස්තුව 4 m ක් ඉහළට එසවූ විට Eₚ = 5 × 10 × 4 = 200 J ගබඩා වේ.',
  G10_L18_Q05:
    'ජවය යනු කාර්යය කිරීමේ ශීඝ්‍රතාවයි: P = සිදු කළ කාර්යය (W) / ගත වූ කාලය (t) = 6 000 J / 20 s = 300 W වේ.',
  G10_L19_Q02:
    'විද්‍යුත් ධාරාව යනු ඒකක කාලයකදී හරස්කඩක් තුළින් ගලන ආරෝපණ ප්‍රමාණයයි: I = Q / t = 30 C / 10 s = 3 A වේ.',
  G10_L19_Q04:
    'ඕම් නියමය අනුව සන්නායකයක් හරහා ගලන ධාරාව I = V / R වේ. එබැවින් I = 12 V / 6 Ω = 2 A වේ.',
  G10_L19_Q06:
    'සමාන්තරගත ප්‍රතිරෝධක දෙකක සමක ප්‍රතිරෝධය 1/R = 1/R₁ + 1/R₂ වේ. එනම් 1/R = 1/4 + 1/12 = 4/12 = 1/3 → R = 3 Ω වේ.',
  G10_L20_Q05:
    'මිනිසාගේ සාමාන්‍ය දේහ සෛලයක වර්ණදේහ 46 ක් (යුගල 23 ක්) ඇත. ඉන් යුගල 22 ක් දේහ වර්ණදේහ වන අතර 23 වන යුගලය ගැහැනු අයට XX ද පිරිමි අයට XY ද වේ.',
};

const RAW_GRADE_10_MCQS: McqQuestion[] = [
  ...GRADE_10_PART1_MCQS,
  ...GRADE_10_EXTRA_PART1_MCQS,
  ...GRADE_10_PART2_MCQS,
  ...GRADE_10_EXTRA_PART2_MCQS,
  ...GRADE_10_EXPANDED_U01_U02_MCQS,
  ...GRADE_10_EXPANDED_U03_U04_MCQS,
  ...GRADE_10_EXPANDED_U05_U06_MCQS,
  ...GRADE_10_EXPANDED_U07_U08_MCQS,
  ...GRADE_10_EXPANDED_U09_U10_MCQS,
  ...GRADE_10_EXPANDED_U11_U12_MCQS,
  ...GRADE_10_EXPANDED_U13_U14_MCQS,
  ...GRADE_10_EXPANDED_U15_U16_MCQS,
  ...GRADE_10_EXPANDED_U17_U18_MCQS,
  ...GRADE_10_EXPANDED_U19_U20_MCQS,
];

function normalizeQuestion(raw: McqQuestion): ResolvedMcqQuestion {
  const unitId = (raw.unit_id ?? raw.lessonId) as McqUnitId;
  const unitDef = UNIT_BY_ID[unitId];
  const unitName = raw.unit_name ?? unitDef?.title ?? raw.lessonName;
  const explanation = ENRICHED_EXPLANATIONS[raw.id] ?? raw.explanation;
  const textbookRef =
    raw.textbook_reference ??
    `10 ශ්‍රේණිය විද්‍යාව පෙළපොත · ඒකකය ${String(raw.unitNumber).padStart(2, '0')}: ${unitName} (${raw.topic})`;

  return {
    ...raw,
    question_id: raw.question_id ?? raw.id,
    unit_id: unitId,
    unit_name: unitName,
    correct_answer: raw.correct_answer ?? raw.options[raw.correctIndex],
    explanation,
    textbook_reference: textbookRef,
  };
}

export const GRADE_10_MCQS: ResolvedMcqQuestion[] = RAW_GRADE_10_MCQS.map(normalizeQuestion);
