'use client';

import { motion } from 'framer-motion';

export default function AnimateIn({
  children,
  delay = 0,
  y = 28,
  duration = 0.7,
  className = '',
  once = true,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, amount: 0.2 }}
      transition={{ duration, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
