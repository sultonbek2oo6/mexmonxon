import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

const INTRO_SEEN_KEY = 'grandHotelIntroSeen';
const HOTEL_IMAGE = 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=85&w=1920';

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
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!visible) {
      onComplete();
      return undefined;
    }

    const finishIntro = () => {
      markIntroSeen();
      onComplete();
      setVisible(false);
    };

    const timer = window.setTimeout(finishIntro, reduceMotion ? 250 : 2300);
    return () => window.clearTimeout(timer);
  }, [onComplete, reduceMotion, visible]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[100] overflow-hidden bg-[#11100e] text-white"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.55, ease: 'easeInOut' }}
          role="status"
          aria-label="Grand Hotel kutib olish sahnasi"
        >
          <motion.div
            aria-hidden="true"
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url('${HOTEL_IMAGE}')` }}
            initial={reduceMotion ? false : { scale: 1.07 }}
            animate={{ scale: 1 }}
            transition={{ duration: reduceMotion ? 0 : 8, ease: 'linear' }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#080c12]/80 via-[#0b1017]/50 to-[#0b1017]/35" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/25" />

          <motion.div
            className="absolute left-7 top-7 z-10 flex items-center gap-3 sm:left-10 sm:top-10"
            initial={reduceMotion ? false : { opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: reduceMotion ? 0 : 0.12 }}
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-amber-100/40 bg-black/15 font-serif text-sm tracking-wide text-amber-100">Sj</span>
            <span className="text-xs font-medium uppercase tracking-[0.25em] text-white/85">Grand Hotel</span>
          </motion.div>

          <button
            type="button"
            onClick={() => {
              markIntroSeen();
              onComplete();
              setVisible(false);
            }}
            className="absolute right-5 top-5 z-20 rounded-full border border-white/25 bg-black/20 px-4 py-2 text-xs text-white/80 backdrop-blur-md transition hover:border-amber-100/60 hover:text-white sm:right-8 sm:top-8"
          >
            O‘tkazib yuborish
          </button>

          <div className="relative flex min-h-screen items-center justify-center px-6 text-center">
            <motion.div
              aria-hidden="true"
              className="pointer-events-none absolute left-1/2 top-1/2 h-[min(78vh,660px)] w-[min(78vh,660px)] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.08]"
              initial={reduceMotion ? false : { opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.2, delay: reduceMotion ? 0 : 0.2, ease: 'easeOut' }}
            />
            <motion.div
              aria-hidden="true"
              className="pointer-events-none absolute left-[-30%] top-[-30%] h-[160%] w-[24%] rotate-[20deg] bg-gradient-to-r from-transparent via-amber-100/[0.12] to-transparent blur-2xl"
              initial={{ x: '-15vw', opacity: 0 }}
              animate={reduceMotion ? { opacity: 0 } : { x: '150vw', opacity: [0, 1, 0] }}
              transition={{ duration: 1.5, delay: 0.18, ease: 'easeInOut' }}
            />

            <div className="relative z-[1] -mt-2 max-w-4xl">
              <motion.div
                className="mx-auto mb-6 h-px w-12 origin-center bg-amber-200/80"
                initial={reduceMotion ? false : { scaleX: 0, opacity: 0 }}
                animate={{ scaleX: 1, opacity: 1 }}
                transition={{ duration: 0.55, delay: reduceMotion ? 0 : 0.35 }}
              />
              <motion.p
                className="text-[10px] font-medium uppercase tracking-[0.48em] text-amber-100/85 sm:text-xs"
                initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: reduceMotion ? 0 : 0.45 }}
              >
                Sultonbek Juraboyev taqdim etadi
              </motion.p>
              <motion.h1
                className="mt-5 font-serif text-5xl font-normal tracking-[0.13em] text-white drop-shadow-lg sm:text-7xl lg:text-8xl"
                initial={reduceMotion ? false : { opacity: 0, y: 16, letterSpacing: '0.2em' }}
                animate={{ opacity: 1, y: 0, letterSpacing: '0.13em' }}
                transition={{ duration: 0.8, delay: reduceMotion ? 0 : 0.62, ease: [0.22, 1, 0.36, 1] }}
              >
                GRAND HOTEL
              </motion.h1>
              <motion.p
                className="mt-5 text-sm font-light tracking-wide text-white/75 sm:text-base"
                initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: reduceMotion ? 0 : 1.05 }}
              >
                Xush kelibsiz. Osoyishtalik va qulaylik sizni kutmoqda.
              </motion.p>
            </div>
          </div>

          <motion.div
            aria-hidden="true"
            className="absolute inset-x-0 bottom-0 h-px origin-left bg-gradient-to-r from-amber-100/0 via-amber-200/75 to-amber-100/0"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: reduceMotion ? 0 : 2.1, ease: 'linear' }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default HotelIntro;
