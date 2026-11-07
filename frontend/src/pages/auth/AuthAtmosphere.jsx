import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

const STARS = [
  { x: '8%', y: '19%', size: 2, delay: 0.4 },
  { x: '16%', y: '72%', size: 1.5, delay: 1.6 },
  { x: '31%', y: '13%', size: 1.5, delay: 0.9 },
  { x: '42%', y: '84%', size: 2, delay: 2.2 },
  { x: '61%', y: '17%', size: 1.5, delay: 1.3 },
  { x: '71%', y: '77%', size: 1.5, delay: 0.3 },
  { x: '84%', y: '31%', size: 2, delay: 1.9 },
  { x: '93%', y: '67%', size: 1.5, delay: 0.7 },
  { x: '53%', y: '64%', size: 1, delay: 2.5 },
];

const AuthAtmosphere = () => {
  const reduceMotion = useReducedMotion();

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-[1] overflow-hidden">
      {/* Fine radial detail keeps the photo atmospheric without competing with the form. */}
      <div className="absolute -right-36 -top-44 h-[28rem] w-[28rem] rounded-full border border-amber-100/[0.08] sm:-right-24 sm:-top-56 sm:h-[38rem] sm:w-[38rem]" />
      <div className="absolute -right-20 -top-28 h-[21rem] w-[21rem] rounded-full border border-white/[0.06] sm:-right-10 sm:-top-40 sm:h-[29rem] sm:w-[29rem]" />

      {STARS.map((star, index) => (
        <motion.span
          key={`${star.x}-${star.y}`}
          className="absolute rounded-full bg-amber-50/90 shadow-[0_0_8px_1px_rgba(255,236,190,0.28)]"
          style={{ left: star.x, top: star.y, width: star.size, height: star.size }}
          animate={reduceMotion ? undefined : { opacity: [0.28, index % 3 === 0 ? 0.72 : 0.52, 0.28], scale: [0.9, 1.2, 0.9] }}
          transition={{ duration: 5 + (index % 3) * 1.5, delay: star.delay, ease: 'easeInOut', repeat: Infinity }}
        />
      ))}

      <motion.div
        className="absolute right-[12%] top-[14%] h-9 w-9 text-amber-50/80 drop-shadow-[0_0_14px_rgba(255,225,165,0.35)] sm:right-[15%] sm:top-[16%] sm:h-12 sm:w-12"
        initial={reduceMotion ? false : { opacity: 0, y: 5 }}
        animate={{ opacity: 0.8, y: 0 }}
        transition={{ duration: reduceMotion ? 0 : 1.2, ease: 'easeOut' }}
      >
        <svg viewBox="0 0 48 48" fill="currentColor" className="h-full w-full">
          <path d="M36.5 31.8A20 20 0 0 1 16.2 4.1 20.5 20.5 0 1 0 43.9 31.8a20.3 20.3 0 0 1-7.4 0Z" />
        </svg>
      </motion.div>
    </div>
  );
};

export default AuthAtmosphere;
