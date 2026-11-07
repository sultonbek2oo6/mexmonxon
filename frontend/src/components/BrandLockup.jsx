import React, { useId } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

const BrandMark = ({ small = false }) => {
  const id = useId().replace(/:/g, '');

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 96 72"
      className={small ? 'h-10 w-14 shrink-0 sm:h-11 sm:w-[3.75rem]' : 'h-12 w-16 shrink-0 sm:h-14 sm:w-[4.75rem]'}
      fill="none"
    >
      <defs>
        <linearGradient id={`${id}-gold`} x1="10" y1="5" x2="80" y2="66" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fff1c5" />
          <stop offset=".46" stopColor="#dfb867" />
          <stop offset="1" stopColor="#9a692d" />
        </linearGradient>
      </defs>
      <path d="M3 66 17 7h8l20 39L53 7h8L47 66h-8L20 25l-9 41H3Z" fill={`url(#${id}-gold)`} />
      <path d="m8 61 11-48m-1 9 21 38M23 10l21 41m9-12 6-28" stroke="#fff1c5" strokeOpacity=".36" strokeWidth=".8" />
      <g transform="translate(78 17)" stroke={`url(#${id}-gold)`} strokeLinejoin="round">
        <circle r="11.5" strokeOpacity=".42" strokeWidth=".7" />
        <path d="m0-11 2.7 8.3L11 0 2.7 2.7 0 11l-2.7-8.3L-11 0l8.3-2.7L0-11Z" fill="#111315" fillOpacity=".68" strokeWidth="1.15" />
        <path d="M0-15v30M-15 0h30M-10-10 10 10M10-10-10 10" strokeOpacity=".85" strokeWidth=".75" />
        <circle r="1.4" fill="#d9e6ff" stroke="#fff1c5" strokeWidth=".6" />
        <path d="M3.5-18a4.6 4.6 0 1 0 5.2 6.3 5.1 5.1 0 0 1-5.2-6.3Z" fill={`url(#${id}-gold)`} stroke="none" />
      </g>
    </svg>
  );
};

const BrandLockup = ({ className = '', small = false, tone = 'light' }) => {
  const reduceMotion = useReducedMotion();
  const titleTone = tone === 'light' ? 'from-[#fff0bd] via-[#dfb867] to-[#b88742]' : 'from-[#e2bd70] via-[#a97834] to-[#755022]';
  const subtitleTone = tone === 'light' ? 'text-amber-100/90' : 'text-amber-800';
  const bylineTone = tone === 'light' ? 'text-white/65' : 'text-slate-600';

  return (
    <div className={`flex min-w-0 items-center gap-2.5 sm:gap-3 ${className}`}>
      <BrandMark small={small} />
      <div className="flex min-w-0 flex-col">
        <motion.span
          className={`${small ? 'text-[1.3rem] sm:text-2xl' : 'text-2xl sm:text-3xl'} truncate bg-gradient-to-b ${titleTone} bg-clip-text font-serif font-semibold uppercase leading-none tracking-[0.13em] text-transparent drop-shadow-[0_1px_7px_rgba(221,180,100,0.2)]`}
          animate={reduceMotion ? undefined : { filter: ['drop-shadow(0 0 4px rgba(231,193,119,0.12))', 'drop-shadow(0 0 10px rgba(231,193,119,0.3))', 'drop-shadow(0 0 4px rgba(231,193,119,0.12))'] }}
          transition={{ duration: 5.5, ease: 'easeInOut', repeat: Infinity }}
        >
          Novaris
        </motion.span>
        <span className={`mt-1 truncate text-[9px] font-semibold uppercase leading-none tracking-[0.23em] sm:text-[10px] ${subtitleTone}`}>
          Luxury Stay
        </span>
        <span className={`mt-1 truncate text-[8px] font-medium uppercase leading-none tracking-[0.17em] sm:text-[9px] sm:tracking-[0.19em] ${bylineTone}`}>
          Sultonbek Juraboyev
        </span>
      </div>
    </div>
  );
};

export default BrandLockup;
