'use client';

import { AnimatePresence, motion } from 'framer-motion';

const ROWS = [
  { size: 'XS', us: '32A-32B', band: "28-29\"", bust: "31-32\"" },
  { size: 'S', us: '32C-34A', band: "30-31\"", bust: "33-34\"" },
  { size: 'M', us: '34B-34C', band: "32-33\"", bust: "35-36\"" },
  { size: 'L', us: '34D-36B', band: "34-35\"", bust: "37-38\"" },
  { size: 'XL', us: '36C-38B', band: "36-37\"", bust: "39-40\"" },
];

export default function SizeGuideModal({ open, onClose }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-[60]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 m-auto z-[70] w-[92%] max-w-lg h-fit bg-cream rounded-2xl p-6 sm:p-8 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="heading-serif text-2xl italic">Size Guide</h3>
              <button onClick={onClose} aria-label="Close size guide">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-ink/50 uppercase text-xs tracking-widest2 border-b border-black/10">
                  <th className="pb-2">Size</th>
                  <th className="pb-2">US</th>
                  <th className="pb-2">Band</th>
                  <th className="pb-2">Bust</th>
                </tr>
              </thead>
              <tbody>
                {ROWS.map((r) => (
                  <tr key={r.size} className="border-b border-black/5">
                    <td className="py-2.5 font-medium">{r.size}</td>
                    <td className="py-2.5 text-ink/70">{r.us}</td>
                    <td className="py-2.5 text-ink/70">{r.band}</td>
                    <td className="py-2.5 text-ink/70">{r.bust}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <p className="text-xs text-ink/50 mt-5 leading-relaxed">
              Measurements are in inches. For the most accurate fit, measure over a
              non-padded bra with a soft tape at the fullest part of your bust and directly
              under the bust for band size. Between sizes? Size up for comfort.
            </p>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
