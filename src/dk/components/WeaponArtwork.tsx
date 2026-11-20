import React from 'react';
import { WeaponId } from '../types';

interface WeaponArtworkProps {
  weaponId: WeaponId;
  className?: string;
}

export const WeaponArtwork: React.FC<WeaponArtworkProps> = ({ weaponId, className = 'h-9 w-9' }) => {
  switch (weaponId) {
    case 'shadow_archer':
      return (
        <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
          <defs>
            <linearGradient id="sa_wood" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#94a3b8" />
              <stop offset="100%" stopColor="#334155" />
            </linearGradient>
          </defs>
          <polygon points="8,42 12,24 36,24 40,42" fill="url(#sa_wood)" stroke="#cbd5e1" strokeWidth="1.5" />
          <rect x="10" y="21" width="28" height="5" rx="1.5" fill="#475569" stroke="#e2e8f0" strokeWidth="1.2" />
          <polygon points="9,21 24,8 39,21" fill="#1e3a8a" stroke="#93c5fd" strokeWidth="1.5" />
          <path d="M16 14 C28 19, 28 29, 16 34" fill="none" stroke="#f59e0b" strokeWidth="2.8" strokeLinecap="round" />
          <line x1="16" y1="14" x2="16" y2="34" stroke="#e2e8f0" strokeWidth="1.2" />
          <line x1="14" y1="24" x2="36" y2="24" stroke="#fef08a" strokeWidth="2.4" strokeLinecap="round" />
          <polygon points="40,24 34,20.5 34,27.5" fill="#fbbf24" />
        </svg>
      );

    case 'iron_cannon':
      return (
        <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
          <polygon points="8,42 11,26 37,26 40,42" fill="#57534e" stroke="#a8a29e" strokeWidth="1.5" />
          <circle cx="15" cy="36" r="5" fill="#292524" stroke="#f59e0b" strokeWidth="1.6" />
          <circle cx="33" cy="36" r="5" fill="#292524" stroke="#f59e0b" strokeWidth="1.6" />
          <g transform="rotate(-18 22 22)">
            <rect x="11" y="14" width="25" height="12" rx="4" fill="#1c1917" stroke="#d6d3d1" strokeWidth="1.6" />
            <rect x="18" y="13.5" width="4" height="13" fill="#f59e0b" />
            <rect x="33" y="13" width="5" height="14" rx="1.5" fill="#f59e0b" />
          </g>
          <circle cx="41" cy="13" r="4" fill="#fb923c" />
          <circle cx="41" cy="13" r="2" fill="#fef08a" />
        </svg>
      );

    case 'ice_wizard':
      return (
        <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
          <polygon points="13,42 17,21 31,21 35,42" fill="#0c4a6e" stroke="#38bdf8" strokeWidth="1.6" />
          <polygon points="24,4 33,16 24,28 15,16" fill="#38bdf8" stroke="#e0f2fe" strokeWidth="1.6" />
          <polygon points="24,8 28.5,16 24,24 19.5,16" fill="#bae6fd" />
          <polygon points="10,20 14,15 14,25" fill="#7dd3fc" />
          <polygon points="38,20 34,15 34,25" fill="#7dd3fc" />
          <circle cx="24" cy="16" r="2.6" fill="#ffffff" />
        </svg>
      );

    case 'thunder_tower':
      return (
        <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
          <polygon points="13,42 17,18 31,18 35,42" fill="#312e81" stroke="#818cf8" strokeWidth="1.6" />
          <ellipse cx="24" cy="24" rx="9" ry="2.6" fill="none" stroke="#f59e0b" strokeWidth="2.2" />
          <ellipse cx="24" cy="30" rx="10.5" ry="2.6" fill="none" stroke="#f59e0b" strokeWidth="2.2" />
          <circle cx="24" cy="11.5" r="5.5" fill="#fde047" stroke="#ffffff" strokeWidth="1.5" />
          <polyline points="9,16 16,12 12,7" fill="none" stroke="#7dd3fc" strokeWidth="2.2" strokeLinecap="round" />
          <polyline points="39,16 32,12 36,7" fill="none" stroke="#7dd3fc" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
      );

    case 'poison_tower':
      return (
        <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
          <path d="M12 42 L15 21 L33 21 L36 42 Z" fill="#1e293b" stroke="#4ade80" strokeWidth="1.6" />
          <ellipse cx="24" cy="21" rx="12" ry="4.4" fill="#14532d" stroke="#86efac" strokeWidth="1.6" />
          <ellipse cx="24" cy="21" rx="8.5" ry="2.5" fill="#a3e635" />
          <circle cx="19" cy="13" r="3.2" fill="#a3e635" opacity="0.9" />
          <circle cx="28" cy="9" r="2.5" fill="#4ade80" opacity="0.85" />
          <circle cx="24" cy="16" r="2" fill="#ecfccb" />
        </svg>
      );

    case 'fire_dragon':
      return (
        <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
          <polygon points="12,42 16,22 32,22 36,42" fill="#450a0a" stroke="#f97316" strokeWidth="1.6" />
          <path d="M10 22 L6 12 L18 18 Z" fill="#991b1b" stroke="#fbbf24" strokeWidth="1.2" />
          <path d="M16 22 Q24 7 35 14 L40 9 L36 19 L40 24 L29 24 Z" fill="#dc2626" stroke="#fbbf24" strokeWidth="1.5" />
          <circle cx="30" cy="15.5" r="2" fill="#fde047" />
          <path d="M36 17 Q44 15 45 21 Q39 24 35 21 Z" fill="#fb923c" />
        </svg>
      );

    case 'crystal_laser':
      return (
        <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
          <polygon points="13,42 18,24 30,24 35,42" fill="#2e1065" stroke="#c084fc" strokeWidth="1.6" />
          <circle cx="24" cy="17" r="11" fill="none" stroke="#e879f9" strokeWidth="1.4" strokeDasharray="4 3" />
          <polygon points="24,5 31,17 24,29 17,17" fill="#c026d3" stroke="#f5d0fe" strokeWidth="1.6" />
          <line x1="24" y1="17" x2="44" y2="10" stroke="#f0abfc" strokeWidth="3.2" strokeLinecap="round" />
          <circle cx="24" cy="17" r="3.4" fill="#ffffff" />
        </svg>
      );

    case 'ancient_guardian':
      return (
        <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
          <polygon points="11,42 15,20 33,20 37,42" fill="#78350f" stroke="#fbbf24" strokeWidth="1.6" />
          <polygon points="10,20 6,11 16,16" fill="#fbbf24" />
          <polygon points="38,20 42,11 32,16" fill="#fbbf24" />
          <circle cx="24" cy="14" r="7.5" fill="#b45309" stroke="#fde68a" strokeWidth="1.8" />
          <polygon points="24,9 28.5,14 24,19 19.5,14" fill="#fef08a" />
          <circle cx="24" cy="24" r="19" fill="none" stroke="#fbbf24" strokeWidth="1.2" strokeDasharray="4 4" />
        </svg>
      );

    case 'sky_hunter':
      return (
        <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
          <polygon points="10,42 15,27 33,27 38,42" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.5" />
          <ellipse cx="24" cy="26" rx="11" ry="4" fill="#1e293b" stroke="#7dd3fc" strokeWidth="1.3" />
          <g transform="rotate(-32 24 22)">
            <rect x="15" y="16" width="16" height="10" rx="2" fill="#0284c7" stroke="#bae6fd" strokeWidth="1.4" />
            <line x1="30" y1="18.5" x2="43" y2="18.5" stroke="#e0f2fe" strokeWidth="2.4" strokeLinecap="round" />
            <line x1="30" y1="23.5" x2="43" y2="23.5" stroke="#e0f2fe" strokeWidth="2.4" strokeLinecap="round" />
            <circle cx="44" cy="18.5" r="1.8" fill="#38bdf8" />
            <circle cx="44" cy="23.5" r="1.8" fill="#38bdf8" />
          </g>
          <path d="M12 16 A10 10 0 0 1 20 8" fill="none" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );

    case 'missile_platform':
      return (
        <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
          <polygon points="8,42 12,26 36,26 40,42" fill="#1e293b" stroke="#94a3b8" strokeWidth="1.5" />
          <rect x="13" y="22" width="22" height="6" rx="2" fill="#334155" stroke="#f97316" strokeWidth="1.4" />
          <g transform="rotate(-24 24 19)">
            <rect x="15" y="10" width="18" height="14" rx="2" fill="#0f172a" stroke="#fb923c" strokeWidth="1.5" />
            <polygon points="34,12 41,14 34,16" fill="#f97316" />
            <polygon points="34,18 41,20 34,22" fill="#ef4444" />
            <circle cx="20" cy="14" r="2" fill="#fde047" />
            <circle cx="20" cy="20" r="2" fill="#fde047" />
          </g>
          <path d="M9 17 L13 11" stroke="#fb923c" strokeWidth="2" strokeLinecap="round" opacity="0.85" />
        </svg>
      );

    case 'storm_cannon':
      return (
        <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
          <polygon points="11,42 15,24 33,24 37,42" fill="#1e1b4b" stroke="#818cf8" strokeWidth="1.6" />
          <circle cx="24" cy="19" r="12" fill="none" stroke="#38bdf8" strokeWidth="1.4" strokeDasharray="4 2.5" />
          <circle cx="24" cy="19" r="7.5" fill="#312e81" stroke="#a5b4fc" strokeWidth="1.6" />
          <circle cx="24" cy="19" r="4" fill="#38bdf8" />
          <circle cx="24" cy="19" r="1.8" fill="#ffffff" />
          <line x1="24" y1="7" x2="24" y2="3" stroke="#7dd3fc" strokeWidth="2.2" strokeLinecap="round" />
          <line x1="36" y1="19" x2="41" y2="19" stroke="#7dd3fc" strokeWidth="2.2" strokeLinecap="round" />
          <line x1="12" y1="19" x2="7" y2="19" stroke="#7dd3fc" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
      );

    case 'drone_station':
      return (
        <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
          <polygon points="8,42 13,27 35,27 40,42" fill="#0f172a" stroke="#22d3ee" strokeWidth="1.5" />
          <ellipse cx="24" cy="28" rx="11" ry="3.5" fill="#164e63" stroke="#67e8f9" strokeWidth="1.4" />
          <circle cx="24" cy="28" r="2.6" fill="#22d3ee" />
          <g transform="translate(24,13)">
            <polygon points="0,-6 9,2 0,5 -9,2" fill="#0e7490" stroke="#a5f3fc" strokeWidth="1.4" />
            <circle cx="-10" cy="0" r="3.2" fill="none" stroke="#67e8f9" strokeWidth="1.4" />
            <circle cx="10" cy="0" r="3.2" fill="none" stroke="#67e8f9" strokeWidth="1.4" />
            <circle cx="0" cy="-1" r="2" fill="#ecfeff" />
          </g>
        </svg>
      );

      case 'plasma_air_defense':
      return (
        <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
          <polygon points="10,42 14,25 34,25 38,42" fill="#1e1b4b" stroke="#e879f9" strokeWidth="1.6" />
          <polygon points="15,25 19,14 29,14 33,25" fill="#3b0764" stroke="#f0abfc" strokeWidth="1.4" />
          <g transform="rotate(-35 24 16)">
            <rect x="20" y="11" width="21" height="5" rx="2" fill="#701a75" stroke="#f5d0fe" strokeWidth="1.3" />
            <rect x="20" y="17.5" width="21" height="5" rx="2" fill="#701a75" stroke="#f5d0fe" strokeWidth="1.3" />
          </g>
          <circle cx="24" cy="18" r="4.8" fill="#d946ef" stroke="#fdf4ff" strokeWidth="1.5" />
          <circle cx="24" cy="18" r="2" fill="#ffffff" />
        </svg>
      );

    case 'titan_plasma_cannon':
      return (
        <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
          <polygon points="7,43 12,26 36,26 41,43" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.6" />
          <rect x="11" y="23" width="26" height="6" rx="2" fill="#1e293b" stroke="#94a3b8" strokeWidth="1.3" />
          <g transform="rotate(-16 22 20)">
            <rect x="10" y="13" width="20" height="14" rx="3" fill="#1e293b" stroke="#cbd5e1" strokeWidth="1.5" />
            <rect x="26" y="14" width="15" height="4.5" rx="1.2" fill="#334155" stroke="#7dd3fc" strokeWidth="1.2" />
            <rect x="26" y="21.5" width="15" height="4.5" rx="1.2" fill="#334155" stroke="#7dd3fc" strokeWidth="1.2" />
            <circle cx="20" cy="20" r="4.6" fill="#0284c7" stroke="#e0f2fe" strokeWidth="1.4" />
            <circle cx="20" cy="20" r="2.1" fill="#ffffff" />
          </g>
          <circle cx="42" cy="14" r="4.2" fill="#38bdf8" opacity="0.85" />
          <circle cx="42" cy="14" r="2" fill="#ffffff" />
        </svg>
      );
  }
};
