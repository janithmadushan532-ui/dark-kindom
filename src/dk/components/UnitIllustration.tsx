import React from 'react';
import { McqStudyModeId } from '../types';

interface UnitIllustrationProps {
  modeId: McqStudyModeId;
  className?: string;
}

export const UnitIllustration: React.FC<UnitIllustrationProps> = ({
  modeId,
  className = 'h-12 w-12',
}) => {
  const renderArtwork = () => {
    switch (modeId) {
      case 'G10_U01':
        // Chemical basis of life: hexagon biomolecule + H2O bonds
        return (
          <>
            <polygon
              points="32,12 46,20 46,36 32,44 18,36 18,20"
              fill="#10b981"
              fillOpacity="0.18"
              stroke="#34d399"
              strokeWidth="2.4"
            />
            <circle cx="32" cy="12" r="3.5" fill="#6ee7b7" />
            <circle cx="46" cy="20" r="3.5" fill="#fbbf24" />
            <circle cx="46" cy="36" r="3.5" fill="#38bdf8" />
            <circle cx="32" cy="44" r="3.5" fill="#6ee7b7" />
            <circle cx="18" cy="36" r="3.5" fill="#fbbf24" />
            <circle cx="18" cy="20" r="3.5" fill="#38bdf8" />
            <path d="M24 52 C28 47, 36 47, 40 52" stroke="#38bdf8" strokeWidth="2.2" fill="none" />
            <circle cx="32" cy="28" r="5" fill="#34d399" fillOpacity="0.55" />
          </>
        );

      case 'G10_U02':
        // Linear motion: v-t graph axes + upward slope + vector arrow
        return (
          <>
            <path d="M14 48 L14 14 M14 48 L52 48" stroke="#94a3b8" strokeWidth="2.4" strokeLinecap="round" />
            <path d="M18 42 L46 18" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" />
            <polyline points="38,17 47,17 47,26" fill="none" stroke="#fbbf24" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="27" cy="34" r="3.2" fill="#38bdf8" />
            <line x1="18" y1="30" x2="29" y2="30" stroke="#475569" strokeWidth="1.6" strokeDasharray="2 2" />
            <line x1="36" y1="48" x2="36" y2="27" stroke="#475569" strokeWidth="1.6" strokeDasharray="2 2" />
          </>
        );

      case 'G10_U03':
        // Structure of matter: Bohr atom shells + nucleus
        return (
          <>
            <circle cx="32" cy="32" r="21" fill="none" stroke="#38bdf8" strokeWidth="1.8" strokeOpacity="0.55" />
            <circle cx="32" cy="32" r="13" fill="none" stroke="#a78bfa" strokeWidth="2" strokeOpacity="0.75" />
            <circle cx="32" cy="32" r="5.5" fill="#f59e0b" />
            <circle cx="30" cy="30" r="2" fill="#fde68a" />
            <circle cx="53" cy="32" r="3.2" fill="#38bdf8" />
            <circle cx="11" cy="32" r="3.2" fill="#38bdf8" />
            <circle cx="32" cy="19" r="2.8" fill="#c4b5fd" />
            <circle cx="32" cy="45" r="2.8" fill="#c4b5fd" />
          </>
        );

      case 'G10_U04':
        // Newton's laws: block on track + opposing thrust/force vectors
        return (
          <>
            <line x1="10" y1="46" x2="54" y2="46" stroke="#64748b" strokeWidth="2.6" strokeLinecap="round" />
            <rect x="22" y="24" width="20" height="20" rx="3" fill="#0284c7" fillOpacity="0.35" stroke="#38bdf8" strokeWidth="2.4" />
            <line x1="44" y1="34" x2="56" y2="34" stroke="#fbbf24" strokeWidth="2.8" strokeLinecap="round" />
            <polyline points="51,29 56,34 51,39" fill="none" stroke="#fbbf24" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
            <line x1="20" y1="34" x2="9" y2="34" stroke="#f43f5e" strokeWidth="2.4" strokeLinecap="round" />
            <polyline points="14,29 9,34 14,39" fill="none" stroke="#f43f5e" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          </>
        );

      case 'G10_U05':
        // Friction: inclined plane + sliding block + serrated contact
        return (
          <>
            <polygon points="10,48 54,48 54,22" fill="#334155" fillOpacity="0.55" stroke="#94a3b8" strokeWidth="2.2" strokeLinejoin="round" />
            <g transform="rotate(-30 33 31)">
              <rect x="24" y="22" width="16" height="12" rx="2" fill="#f59e0b" fillOpacity="0.35" stroke="#fbbf24" strokeWidth="2.2" />
            </g>
            <path d="M22 40 L34 33" stroke="#fb7185" strokeWidth="2.4" strokeLinecap="round" />
            <polyline points="24,35 21,40 27,41" fill="none" stroke="#fb7185" strokeWidth="2" strokeLinecap="round" />
          </>
        );

      case 'G10_U06':
        // Plant & animal cell structure: cell wall + nucleus + vacuole + chloroplast
        return (
          <>
            <rect x="12" y="14" width="40" height="36" rx="10" fill="#10b981" fillOpacity="0.16" stroke="#34d399" strokeWidth="2.6" />
            <rect x="16" y="18" width="32" height="28" rx="7" fill="none" stroke="#6ee7b7" strokeWidth="1.4" strokeOpacity="0.7" />
            <circle cx="26" cy="29" r="6" fill="#a78bfa" fillOpacity="0.45" stroke="#c4b5fd" strokeWidth="2" />
            <ellipse cx="39" cy="34" rx="7" ry="9" fill="#38bdf8" fillOpacity="0.25" stroke="#7dd3fc" strokeWidth="1.8" />
            <ellipse cx="25" cy="40" rx="4" ry="2.4" fill="#34d399" />
          </>
        );

      case 'G10_U07':
        // Quantification of elements/compounds (Mole): conical flask + mole particles
        return (
          <>
            <path
              d="M26 12 H38 M28 12 V23 L16 46 C14.5 49 16.5 52 20 52 H44 C47.5 52 49.5 49 48 46 L36 23 V12"
              fill="#0ea5e9"
              fillOpacity="0.15"
              stroke="#38bdf8"
              strokeWidth="2.4"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            <path d="M21 40 H43 L46 47 C46.5 48.5 45.5 50 43.5 50 H20.5 C18.5 50 17.5 48.5 18 47 Z" fill="#a78bfa" fillOpacity="0.45" />
            <circle cx="28" cy="44" r="2.2" fill="#fde68a" />
            <circle cx="35" cy="45" r="2.2" fill="#fde68a" />
            <circle cx="32" cy="36" r="2" fill="#7dd3fc" />
          </>
        );

      case 'G10_U08':
        // Characteristics of living organisms: sprouting leaf + vitality pulse
        return (
          <>
            <path d="M32 50 V24" stroke="#34d399" strokeWidth="2.8" strokeLinecap="round" />
            <path d="M32 32 C20 32, 14 22, 16 14 C25 14, 32 21, 32 32 Z" fill="#10b981" fillOpacity="0.35" stroke="#34d399" strokeWidth="2.2" />
            <path d="M32 27 C43 27, 49 19, 48 12 C39 12, 32 18, 32 27 Z" fill="#34d399" fillOpacity="0.45" stroke="#6ee7b7" strokeWidth="2.2" />
            <path d="M18 48 H25 L28 42 L32 52 L36 45 L39 48 H46" fill="none" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </>
        );

      case 'G10_U09':
        // Resultant force: parallelogram of forces + diagonal resultant
        return (
          <>
            <circle cx="16" cy="46" r="3.5" fill="#f8fafc" />
            <line x1="16" y1="46" x2="46" y2="46" stroke="#38bdf8" strokeWidth="2.4" strokeLinecap="round" />
            <line x1="16" y1="46" x2="28" y2="20" stroke="#38bdf8" strokeWidth="2.4" strokeLinecap="round" />
            <line x1="28" y1="20" x2="54" y2="20" stroke="#64748b" strokeWidth="1.8" strokeDasharray="3 3" />
            <line x1="46" y1="46" x2="54" y2="20" stroke="#64748b" strokeWidth="1.8" strokeDasharray="3 3" />
            <line x1="16" y1="46" x2="52" y2="21" stroke="#fbbf24" strokeWidth="3" strokeLinecap="round" />
            <polyline points="45,20 53,20 51,28" fill="none" stroke="#fbbf24" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
          </>
        );

      case 'G10_U10':
        // Chemical bonds: linked orbitals + shared electron pair
        return (
          <>
            <circle cx="22" cy="32" r="13" fill="#8b5cf6" fillOpacity="0.18" stroke="#a78bfa" strokeWidth="2.4" />
            <circle cx="42" cy="32" r="13" fill="#0ea5e9" fillOpacity="0.18" stroke="#38bdf8" strokeWidth="2.4" />
            <circle cx="20" cy="32" r="3.5" fill="#c4b5fd" />
            <circle cx="44" cy="32" r="3.5" fill="#7dd3fc" />
            <circle cx="32" cy="27" r="2.6" fill="#fbbf24" />
            <circle cx="32" cy="37" r="2.6" fill="#fbbf24" />
          </>
        );

      case 'G10_U11':
        // Turning effect of a force: lever wrench + circular torque arc
        return (
          <>
            <circle cx="20" cy="34" r="9" fill="#38bdf8" fillOpacity="0.2" stroke="#38bdf8" strokeWidth="2.4" />
            <circle cx="20" cy="34" r="3.5" fill="#fbbf24" />
            <line x1="29" y1="34" x2="52" y2="34" stroke="#cbd5e1" strokeWidth="4" strokeLinecap="round" />
            <path d="M44 16 C51 20, 54 27, 52 34" fill="none" stroke="#fbbf24" strokeWidth="2.6" strokeLinecap="round" />
            <polyline points="40,20 43,14 49,16" fill="none" stroke="#fbbf24" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          </>
        );

      case 'G10_U12':
        // Equilibrium of forces: balanced scale beam + triangular pivot
        return (
          <>
            <polygon points="32,30 24,48 40,48" fill="#38bdf8" fillOpacity="0.25" stroke="#38bdf8" strokeWidth="2.2" strokeLinejoin="round" />
            <line x1="12" y1="26" x2="52" y2="26" stroke="#fbbf24" strokeWidth="3.2" strokeLinecap="round" />
            <line x1="16" y1="26" x2="16" y2="36" stroke="#94a3b8" strokeWidth="2" />
            <line x1="48" y1="26" x2="48" y2="36" stroke="#94a3b8" strokeWidth="2" />
            <rect x="11" y="36" width="10" height="7" rx="1.5" fill="#10b981" fillOpacity="0.6" stroke="#34d399" strokeWidth="1.6" />
            <rect x="43" y="36" width="10" height="7" rx="1.5" fill="#10b981" fillOpacity="0.6" stroke="#34d399" strokeWidth="1.6" />
          </>
        );

      case 'G10_U13':
        // World of life / Classification: three-domain taxonomy nodes
        return (
          <>
            <circle cx="32" cy="48" r="4" fill="#fbbf24" />
            <path d="M32 44 V32 M32 32 L16 20 M32 32 V16 M32 32 L48 20" stroke="#94a3b8" strokeWidth="2.2" strokeLinecap="round" />
            <circle cx="16" cy="18" r="5.5" fill="#10b981" fillOpacity="0.4" stroke="#34d399" strokeWidth="2" />
            <circle cx="32" cy="14" r="5.5" fill="#38bdf8" fillOpacity="0.4" stroke="#7dd3fc" strokeWidth="2" />
            <circle cx="48" cy="18" r="5.5" fill="#a78bfa" fillOpacity="0.4" stroke="#c4b5fd" strokeWidth="2" />
          </>
        );

      case 'G10_U14':
        // Continuity of life: flower petals + pistil reproduction
        return (
          <>
            <ellipse cx="32" cy="17" rx="6" ry="8" fill="#f472b6" fillOpacity="0.35" stroke="#f472b6" strokeWidth="2" />
            <ellipse cx="21" cy="29" rx="8" ry="6" fill="#f472b6" fillOpacity="0.35" stroke="#f472b6" strokeWidth="2" />
            <ellipse cx="43" cy="29" rx="8" ry="6" fill="#f472b6" fillOpacity="0.35" stroke="#f472b6" strokeWidth="2" />
            <ellipse cx="32" cy="39" rx="6" ry="7" fill="#10b981" fillOpacity="0.35" stroke="#34d399" strokeWidth="2" />
            <circle cx="32" cy="28" r="5.5" fill="#fbbf24" />
            <path d="M32 46 V54" stroke="#34d399" strokeWidth="2.6" strokeLinecap="round" />
          </>
        );

      case 'G10_U15':
        // Hydrostatic pressure: U-tube hydraulic pistons
        return (
          <>
            <path d="M16 18 V44 C16 49 20 52 25 52 H39 C44 52 48 49 48 44 V14" fill="none" stroke="#94a3b8" strokeWidth="2.4" strokeLinecap="round" />
            <path d="M18 32 V44 C18 47.5 21 50 25 50 H39 C43 50 46 47.5 46 44 V28 H38 V43 H26 V32 Z" fill="#38bdf8" fillOpacity="0.4" />
            <rect x="13" y="25" width="12" height="5" rx="1.2" fill="#fbbf24" />
            <rect x="39" y="21" width="12" height="5" rx="1.2" fill="#fbbf24" />
            <line x1="19" y1="12" x2="19" y2="23" stroke="#fbbf24" strokeWidth="2.2" />
          </>
        );

      case 'G10_U16':
        // Changes of matter: reaction beaker + rising gas bubbles + heat spark
        return (
          <>
            <path d="M18 16 H46 M21 16 V46 C21 49 23 51 26 51 H38 C41 51 43 49 43 46 V16" fill="none" stroke="#94a3b8" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
            <rect x="23" y="34" width="18" height="15" rx="2" fill="#f59e0b" fillOpacity="0.35" />
            <circle cx="28" cy="29" r="2.2" fill="#fbbf24" />
            <circle cx="35" cy="24" r="2.8" fill="#38bdf8" />
            <circle cx="31" cy="19" r="1.8" fill="#6ee7b7" />
            <path d="M25 54 Q32 49 39 54" stroke="#f97316" strokeWidth="2.4" fill="none" strokeLinecap="round" />
          </>
        );

      case 'G10_U17':
        // Rate of reaction: steep vs shallow rate curve + stopwatch
        return (
          <>
            <path d="M14 48 V16 M14 48 H50" stroke="#94a3b8" strokeWidth="2.2" strokeLinecap="round" />
            <path d="M16 46 Q20 20 48 18" fill="none" stroke="#34d399" strokeWidth="2.6" strokeLinecap="round" />
            <path d="M16 46 Q28 34 48 28" fill="none" stroke="#38bdf8" strokeWidth="2.2" strokeDasharray="3 2" strokeLinecap="round" />
            <circle cx="44" cy="40" r="8" fill="#0f172a" stroke="#fbbf24" strokeWidth="2" />
            <path d="M44 40 V36 M44 40 L47 42" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" />
          </>
        );

      case 'G10_U18':
        // Work, energy and power: elevated mass + potential/kinetic energy bolt
        return (
          <>
            <path d="M35 12 L21 34 H31 L27 52 L43 28 H33 Z" fill="#fbbf24" fillOpacity="0.35" stroke="#fbbf24" strokeWidth="2.2" strokeLinejoin="round" />
            <circle cx="32" cy="32" r="22" fill="none" stroke="#38bdf8" strokeWidth="1.8" strokeDasharray="5 4" />
          </>
        );

      case 'G10_U19':
        // Current electricity: DC circuit loop with battery + resistor + lamp
        return (
          <>
            <rect x="14" y="16" width="36" height="32" rx="4" fill="none" stroke="#38bdf8" strokeWidth="2.2" />
            <rect x="25" y="12" width="14" height="8" rx="1.5" fill="#0f172a" />
            <line x1="29" y1="11" x2="29" y2="21" stroke="#fbbf24" strokeWidth="3" />
            <line x1="35" y1="13" x2="35" y2="19" stroke="#fbbf24" strokeWidth="2" />
            <polyline points="22,48 25,44 29,52 33,44 37,52 41,48" fill="none" stroke="#34d399" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="50" cy="32" r="5" fill="#fbbf24" fillOpacity="0.45" stroke="#fbbf24" strokeWidth="2" />
          </>
        );

      case 'G10_U20':
        // Heredity: Mendelian Punnett grid + DNA cross
        return (
          <>
            <rect x="16" y="16" width="32" height="32" rx="4" fill="#10b981" fillOpacity="0.14" stroke="#34d399" strokeWidth="2.2" />
            <line x1="32" y1="16" x2="32" y2="48" stroke="#34d399" strokeWidth="1.8" />
            <line x1="16" y1="32" x2="48" y2="32" stroke="#34d399" strokeWidth="1.8" />
            <circle cx="24" cy="24" r="3.5" fill="#fbbf24" />
            <circle cx="40" cy="24" r="3.5" fill="#38bdf8" />
            <circle cx="24" cy="40" r="3.5" fill="#38bdf8" />
            <circle cx="40" cy="40" r="3.5" fill="#a78bfa" />
          </>
        );

      case 'ALL_UNITS':
      default:
        // ALL UNITS: Unified tri-science core (Biology + Physics + Chemistry)
        return (
          <>
            <polygon
              points="32,10 52,21 52,43 32,54 12,43 12,21"
              fill="#f59e0b"
              fillOpacity="0.16"
              stroke="#fbbf24"
              strokeWidth="2.4"
            />
            <circle cx="32" cy="32" r="10" fill="#38bdf8" fillOpacity="0.22" stroke="#38bdf8" strokeWidth="2" />
            <path d="M32 22 V42 M23 27 L41 37 M41 27 L23 37" stroke="#34d399" strokeWidth="1.8" strokeLinecap="round" />
            <circle cx="32" cy="32" r="3.8" fill="#fbbf24" />
          </>
        );
    }
  };

  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      fill="none"
      aria-hidden="true"
    >
      {renderArtwork()}
    </svg>
  );
};
