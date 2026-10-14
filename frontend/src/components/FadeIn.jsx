import React from 'react';
import { motion } from 'framer-motion';

export const FadeIn = ({ children, delay = 0, direction = 'up', className = '' }) => {
  // Skromniy (kichik) masofa va ravon o'tish
  const directions = {
    up: { y: 20, x: 0 },
    down: { y: -20, x: 0 },
    left: { x: 20, y: 0 },
    right: { x: -20, y: 0 },
  };

  return (
    <motion.div
      initial={{ 
        opacity: 0, 
        ...directions[direction] 
      }}
      whileInView={{ 
        opacity: 1, 
        x: 0, 
        y: 0 
      }}
      viewport={{ once: true, margin: '-50px' }} // Sahifa skroll bo'lganda faqat 1 marta mayin chiqadi
      transition={{
        duration: 0.6,
        delay: delay,
        ease: [0.21, 0.47, 0.32, 0.98], // O'ta tabiiy, premium easing egri chizig'i
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};