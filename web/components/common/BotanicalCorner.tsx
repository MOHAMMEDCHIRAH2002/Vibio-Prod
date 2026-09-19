'use client';

import { motion } from 'framer-motion';

type Position = 'top-left' | 'bottom-right';

interface BotanicalCornerProps {
  position: Position;
  className?: string;
}

/**
 * Decorative botanical corner — eucalyptus-style branch with stylized blooms.
 * The stems and leaves draw themselves in via SVG pathLength on mount.
 * Use as an absolutely-positioned, pointer-events-none accent.
 */
export default function BotanicalCorner({ position, className = '' }: BotanicalCornerProps) {
  const isTopLeft = position === 'top-left';

  const wrapperPositioning = isTopLeft
    ? 'top-[-2.5rem] left-[-2.5rem] sm:top-[-2rem] sm:left-[-2rem] lg:top-[-1rem] lg:left-[-1rem]'
    : 'bottom-[-2.5rem] right-[-2.5rem] sm:bottom-[-2rem] sm:right-[-2rem] lg:bottom-[-1rem] lg:right-[-1rem]';

  const transform = isTopLeft ? 'rotate(0deg)' : 'rotate(180deg)';

  const stemDelay = isTopLeft ? 0.15 : 0.45;

  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute z-[2] h-[16rem] w-[16rem] sm:h-[20rem] sm:w-[20rem] lg:h-[26rem] lg:w-[26rem] ${wrapperPositioning} ${className}`}
      style={{ transform, mixBlendMode: 'multiply' }}
    >
      <svg
        viewBox="0 0 320 320"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-full"
      >
        <defs>
          <linearGradient id={`stem-${position}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#273E1C" stopOpacity="0.78" />
            <stop offset="60%" stopColor="#3F5F2C" stopOpacity="0.62" />
            <stop offset="100%" stopColor="#7BA055" stopOpacity="0.42" />
          </linearGradient>
          <linearGradient id={`leaf-${position}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#3F5F2C" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#9DBC74" stopOpacity="0.32" />
          </linearGradient>
          <radialGradient id={`bloom-${position}`} cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%" stopColor="#F2C36A" stopOpacity="0.85" />
            <stop offset="60%" stopColor="#E0A647" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#B27F2C" stopOpacity="0.0" />
          </radialGradient>
        </defs>

        {/* Main curving stem */}
        <motion.path
          d="M 18 22 C 60 60, 90 110, 120 160 S 180 240, 250 270"
          stroke={`url(#stem-${position})`}
          strokeWidth="1.6"
          strokeLinecap="round"
          fill="none"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ pathLength: { duration: 1.8, delay: stemDelay, ease: [0.65, 0, 0.35, 1] }, opacity: { duration: 0.4, delay: stemDelay } }}
        />

        {/* Secondary thinner stem */}
        <motion.path
          d="M 30 60 C 70 80, 95 130, 130 170"
          stroke={`url(#stem-${position})`}
          strokeWidth="1"
          strokeLinecap="round"
          strokeDasharray="2 3"
          fill="none"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.8 }}
          transition={{ duration: 1.4, delay: stemDelay + 0.4 }}
        />

        {/* Leaves — clustered along the stem */}
        {[
          { cx: 48, cy: 52, rx: 14, ry: 7, rot: -28, delay: 0.2 },
          { cx: 78, cy: 88, rx: 16, ry: 8, rot: -18, delay: 0.32 },
          { cx: 108, cy: 130, rx: 18, ry: 9, rot: -8, delay: 0.44 },
          { cx: 64, cy: 110, rx: 13, ry: 6.5, rot: 38, delay: 0.5 },
          { cx: 138, cy: 178, rx: 19, ry: 9, rot: 6, delay: 0.56 },
          { cx: 96, cy: 162, rx: 14, ry: 7, rot: 52, delay: 0.62 },
          { cx: 170, cy: 220, rx: 17, ry: 8.5, rot: 22, delay: 0.7 },
          { cx: 210, cy: 248, rx: 15, ry: 7.5, rot: 32, delay: 0.78 },
          { cx: 200, cy: 200, rx: 12, ry: 6, rot: -42, delay: 0.84 },
        ].map((leaf, i) => (
          <motion.ellipse
            key={i}
            cx={leaf.cx}
            cy={leaf.cy}
            rx={leaf.rx}
            ry={leaf.ry}
            transform={`rotate(${leaf.rot} ${leaf.cx} ${leaf.cy})`}
            fill={`url(#leaf-${position})`}
            stroke="#3F5F2C"
            strokeOpacity="0.4"
            strokeWidth="0.7"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.92 }}
            transition={{
              duration: 0.55,
              delay: stemDelay + leaf.delay,
              ease: [0.34, 1.56, 0.64, 1],
            }}
            style={{ transformOrigin: `${leaf.cx}px ${leaf.cy}px` }}
          />
        ))}

        {/* Stylized blooms — soft amber circles with petal lines */}
        {[
          { cx: 56, cy: 28, r: 11, delay: 0.95 },
          { cx: 154, cy: 152, r: 14, delay: 1.05 },
          { cx: 232, cy: 252, r: 10, delay: 1.15 },
        ].map((bloom, i) => (
          <motion.g
            key={i}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              duration: 0.65,
              delay: stemDelay + bloom.delay,
              ease: [0.34, 1.56, 0.64, 1],
            }}
            style={{ transformOrigin: `${bloom.cx}px ${bloom.cy}px` }}
          >
            <circle cx={bloom.cx} cy={bloom.cy} r={bloom.r * 1.6} fill={`url(#bloom-${position})`} />
            {/* Six radial petals */}
            {Array.from({ length: 6 }).map((_, p) => {
              const angle = (p / 6) * Math.PI * 2;
              const x2 = bloom.cx + Math.cos(angle) * bloom.r * 1.2;
              const y2 = bloom.cy + Math.sin(angle) * bloom.r * 1.2;
              return (
                <line
                  key={p}
                  x1={bloom.cx}
                  y1={bloom.cy}
                  x2={x2}
                  y2={y2}
                  stroke="#7C5A1F"
                  strokeOpacity="0.55"
                  strokeWidth="0.8"
                  strokeLinecap="round"
                />
              );
            })}
            <circle cx={bloom.cx} cy={bloom.cy} r={bloom.r * 0.45} fill="#C7A04C" fillOpacity="0.78" />
            <circle cx={bloom.cx} cy={bloom.cy} r={bloom.r * 0.18} fill="#5C3F12" fillOpacity="0.7" />
          </motion.g>
        ))}

        {/* Tiny accent berries */}
        {[
          { cx: 116, cy: 96, r: 2.4, delay: 1.25 },
          { cx: 124, cy: 102, r: 2, delay: 1.32 },
          { cx: 188, cy: 232, r: 2.2, delay: 1.38 },
        ].map((berry, i) => (
          <motion.circle
            key={i}
            cx={berry.cx}
            cy={berry.cy}
            r={berry.r}
            fill="#5C3F12"
            fillOpacity="0.7"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.4, delay: stemDelay + berry.delay }}
          />
        ))}
      </svg>
    </div>
  );
}
