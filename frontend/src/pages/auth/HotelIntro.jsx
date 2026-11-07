import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import BrandLockup from '../../components/BrandLockup';

const INTRO_SEEN_KEY = 'grandHotelIntroSeen';
const HOTEL_IMAGE = 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=85&w=1920';
const INTRO_STARS = [
  { x: '9%', y: '24%', size: 2, delay: 0.2 },
  { x: '27%', y: '18%', size: 3, delay: 0.8 },
  { x: '58%', y: '19%', size: 2, delay: 1.2 },
  { x: '78%', y: '28%', size: 2, delay: 1.8 },
  { x: '83%', y: '84%', size: 2, delay: 1.1 },
  { x: '14%', y: '78%', size: 2, delay: 2.2 },
  { x: '43%', y: '12%', size: 2, delay: 2.7 },
];

const markIntroSeen = () => {
  try {
    sessionStorage.setItem(INTRO_SEEN_KEY, '1');
  } catch {
    // Keep the intro usable if browser storage is disabled.
  }
};

const HotelIntro = ({ onComplete }) => {
  const [visible, setVisible] = useState(() => {
    try {
      return sessionStorage.getItem(INTRO_SEEN_KEY) !== '1';
    } catch {
      return true;
    }
  });
  const [ready, setReady] = useState(false);
  const completedRef = useRef(false);
  const reduceMotion = useReducedMotion();

  const completeIntro = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    onComplete();
  }, [onComplete]);

  useEffect(() => {
    if (!visible) {
      completeIntro();
      return undefined;
    }

    const timer = window.setTimeout(() => setReady(true), reduceMotion ? 0 : 2300);
    return () => window.clearTimeout(timer);
  }, [completeIntro, reduceMotion, visible]);

  const enterHotel = () => {
    markIntroSeen();
    setVisible(false);
    completeIntro();
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[100] grid min-h-[100svh] place-items-center overflow-hidden bg-[#11100e] px-5 text-white sm:px-8"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
          role="status"
          aria-label="Novaris kutib olish sahnasi"
        >
          <motion.div
            aria-hidden="true"
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url('${HOTEL_IMAGE}')` }}
            initial={reduceMotion ? false : { scale: 1.09 }}
            animate={{ scale: 1 }}
            transition={{ duration: reduceMotion ? 0 : 7, ease: 'linear' }}
          />
          <div className="absolute inset-0 bg-[linear-gradient(110deg,rgba(7,10,14,.86),rgba(11,14,18,.58)_52%,rgba(7,9,12,.45))]" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />

          <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-[1] overflow-hidden">
            {INTRO_STARS.map((star, index) => (
              <motion.span
                key={`${star.x}-${star.y}`}
                className="absolute rounded-full bg-amber-50 shadow-[0_0_10px_2px_rgba(255,236,190,0.38)]"
                style={{ left: star.x, top: star.y, width: star.size, height: star.size }}
                initial={reduceMotion ? false : { opacity: 0.2, scale: 0.75 }}
                animate={reduceMotion ? undefined : { opacity: [0.3, index % 3 === 0 ? 0.68 : 0.5, 0.3] }}
                transition={{ duration: 5 + (index % 3) * 1.5, delay: star.delay, ease: 'easeInOut', repeat: Infinity }}
              />
            ))}
            <motion.div
              className="absolute right-[13%] top-[12%] h-12 w-12 text-amber-100/80 drop-shadow-[0_0_18px_rgba(255,225,165,0.42)] sm:right-[17%] sm:top-[15%] sm:h-16 sm:w-16"
              initial={reduceMotion ? false : { opacity: 0, scale: 0.86 }}
              animate={{ opacity: 0.82, scale: 1 }}
              transition={{ duration: reduceMotion ? 0 : 1.1, delay: reduceMotion ? 0 : 0.35, ease: 'easeOut' }}
            >
              <svg aria-hidden="true" viewBox="0 0 48 48" fill="currentColor" className="h-full w-full">
                <path d="M36.5 31.8A20 20 0 0 1 16.2 4.1 20.5 20.5 0 1 0 43.9 31.8a20.3 20.3 0 0 1-7.4 0Z" />
              </svg>
            </motion.div>
            {!reduceMotion && (
              <motion.span
                className="absolute left-[72%] top-[25%] h-px w-20 origin-left rotate-[-28deg] bg-gradient-to-r from-amber-50/80 to-transparent shadow-[0_0_8px_rgba(255,235,190,0.5)]"
                initial={{ opacity: 0, x: '-8vw', y: '-3vh' }}
                animate={{ opacity: [0, 0.9, 0], x: '18vw', y: '7vh' }}
                transition={{ duration: 1.25, delay: 1.25, ease: 'easeOut' }}
              />
            )}
          </div>

          <div className="absolute left-5 top-5 z-10 sm:left-10 sm:top-9">
            <BrandLockup small />
          </div>

          <button
            type="button"
            onClick={enterHotel}
            className="absolute right-4 top-5 z-20 rounded-full border border-white/25 bg-black/20 px-3.5 py-2 text-[11px] text-white/80 backdrop-blur-md transition hover:border-amber-100/60 hover:text-white sm:right-8 sm:top-8 sm:px-4 sm:text-xs"
          >
            O‘tkazib yuborish
          </button>

          <div className="relative z-[1] flex w-full flex-col items-center justify-center py-16 text-center sm:py-20">
            <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-1/2 h-[min(78vw,68vh,650px)] w-[min(78vw,68vh,650px)] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.08]" />
            <motion.div
              aria-hidden="true"
              className="pointer-events-none absolute left-1/2 top-1/2 h-[clamp(190px,46vw,390px)] w-[clamp(145px,35vw,300px)] -translate-x-1/2 -translate-y-[58%] rounded-t-[50%] border border-amber-100/25 bg-gradient-to-b from-amber-100/[0.07] to-transparent"
              initial={reduceMotion ? false : { opacity: 0, scaleY: 0.84, y: '-52%' }}
              animate={{ opacity: 1, scaleY: 1, y: '-58%' }}
              transition={{ duration: reduceMotion ? 0 : 1.1, delay: reduceMotion ? 0 : 0.1, ease: [0.22, 1, 0.36, 1] }}
            >
              <motion.div
                className="absolute inset-x-0 top-0 h-1/2 rounded-t-[50%] bg-gradient-to-b from-amber-100/20 to-transparent blur-xl"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.65, 0.2] }}
                transition={{ duration: reduceMotion ? 0 : 1.5, delay: reduceMotion ? 0 : 0.55 }}
              />
              <motion.div
                className="absolute inset-y-0 left-1/2 w-px origin-top bg-gradient-to-b from-amber-100/50 via-amber-100/15 to-transparent"
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ duration: reduceMotion ? 0 : 0.9, delay: reduceMotion ? 0 : 0.7 }}
              />
            </motion.div>
            <motion.div
              className="relative z-[1] mt-3 w-full px-2 sm:mt-0 sm:px-0"
              initial={reduceMotion ? false : { opacity: 0, y: 17 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: reduceMotion ? 0 : 0.75, delay: reduceMotion ? 0 : 0.45, ease: [0.22, 1, 0.36, 1] }}
            >
              <motion.div
                aria-hidden="true"
                className="mx-auto mb-5 h-px w-12 origin-center bg-amber-200/80 sm:mb-6"
                initial={reduceMotion ? false : { scaleX: 0, opacity: 0 }}
                animate={{ scaleX: 1, opacity: 1 }}
                transition={{ duration: reduceMotion ? 0 : 0.6, delay: reduceMotion ? 0 : 0.55 }}
              />
              <p className="text-[9px] font-medium uppercase tracking-[0.34em] text-amber-100/85 sm:text-xs sm:tracking-[0.48em]">
                Siz uchun ochiq eshiklar
              </p>
              <motion.h1
                className="mt-4 break-words bg-gradient-to-b from-[#fff2c7] via-[#e4bd74] to-[#a87536] bg-clip-text font-serif text-[clamp(2.7rem,11vw,6.5rem)] font-normal leading-none tracking-[0.08em] text-transparent drop-shadow-[0_1px_10px_rgba(228,189,116,0.28)] sm:mt-5 sm:tracking-[0.13em]"
                animate={reduceMotion ? undefined : { filter: ['drop-shadow(0 0 5px rgba(228,189,116,0.16))', 'drop-shadow(0 0 15px rgba(228,189,116,0.34))', 'drop-shadow(0 0 5px rgba(228,189,116,0.16))'] }}
                transition={{ duration: 5.5, ease: 'easeInOut', repeat: Infinity }}
              >
                NOVARIS
              </motion.h1>
              <p className="mt-3 text-[10px] font-medium uppercase tracking-[0.36em] text-amber-100/90 sm:mt-4 sm:text-sm sm:tracking-[0.48em]">
                Luxury Stay
              </p>
              <p className="mt-1.5 text-[8px] font-medium uppercase tracking-[0.2em] text-white/55 sm:mt-2 sm:text-[10px] sm:tracking-[0.27em]">
                Sultonbek Juraboyev
              </p>
              <p className="mx-auto mt-4 max-w-lg text-xs font-light leading-relaxed tracking-wide text-white/75 sm:mt-5 sm:text-base">
                Osoyishtalik va qulaylik sari xush kelibsiz.
              </p>
            </motion.div>
          </div>

          <AnimatePresence>
            {ready && (
              <motion.button
                type="button"
                onClick={enterHotel}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                transition={{ duration: 0.45, ease: 'easeOut' }}
                className="absolute bottom-10 z-20 rounded-full border border-amber-100/50 bg-amber-100/10 px-7 py-3 text-xs font-medium uppercase tracking-[0.2em] text-amber-50 shadow-[0_0_30px_rgba(251,191,36,0.12)] backdrop-blur-md transition hover:bg-amber-100/20 focus:outline-none focus:ring-2 focus:ring-amber-100/70 sm:bottom-12 sm:px-9 sm:py-3.5 sm:text-sm"
              >
                Davom etish <span aria-hidden="true" className="ml-2">→</span>
              </motion.button>
            )}
          </AnimatePresence>

          <motion.div
            aria-hidden="true"
            className="absolute inset-x-0 bottom-0 h-px origin-left bg-gradient-to-r from-amber-100/0 via-amber-200/75 to-amber-100/0"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: reduceMotion ? 0 : 2.5, ease: 'linear' }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default HotelIntro;
