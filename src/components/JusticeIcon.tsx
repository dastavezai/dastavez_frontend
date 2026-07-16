import { useTheme } from './ThemeProvider';
import { useColorMode } from '@chakra-ui/react';
import { useLocation } from 'react-router-dom';

interface JusticeIconProps {
  className?: string;
  size?: number | string;
}

const JusticeIcon: React.FC<JusticeIconProps> = ({ className = "", size }) => {
  const sizeStyle = size ? { width: size, height: size } : undefined;
  
  const { theme } = useTheme();
  
  let chakraMode = 'light';
  try {
    const { colorMode } = useColorMode();
    chakraMode = colorMode;
  } catch (e) {}

  // Bulletproof theme detection checking both context states and root DOM class
  const isDark = theme === 'dark' || 
                 chakraMode === 'dark' || 
                 (typeof document !== 'undefined' && document.documentElement.classList.contains('dark'));

  // Standard color scheme matching the theme (dark background in dark mode, light background in light mode)
  const bgSecondary = isDark ? '#0a0d14' : '#ffffff';
  const borderColorVal = isDark ? 'rgba(212, 175, 55, 0.2)' : '#e2e8f0';

  const sparkDirections = [
    { dx: -9, dy: -9 },
    { dx: -12, dy: 0 },
    { dx: -9, dy: 9 },
    { dx: 0, dy: -12 },
    { dx: 8, dy: -8 },
    { dx: 11, dy: -4 },
    { dx: -6, dy: -10 },
    { dx: 10, dy: 6 }
  ];

  return (
    <div 
      className={`relative flex items-center justify-center select-none overflow-visible ${className}`}
      style={sizeStyle}
    >
      <style>{`
        .justice-logo-bg {
          fill: #ffffff;
          stroke: #e2e8f0;
          transition: fill 0.35s ease, stroke 0.35s ease;
        }
        .dark .justice-logo-bg,
        [data-theme="dark"] .justice-logo-bg,
        .chakra-ui-dark .justice-logo-bg {
          fill: #0a0d14;
          stroke: rgba(212, 175, 55, 0.2);
        }

        /* Gavel rotation animation */
        .gavel-strike-anim {
          transform-origin: 0px 0px;
          animation: gavel-strike 1.6s infinite cubic-bezier(0.25, 1, 0.5, 1);
          will-change: transform;
        }

        @keyframes gavel-strike {
          0%, 30% {
            transform: rotate(0deg);
          }
          45% {
            transform: rotate(28deg);
          }
          50% {
            transform: rotate(-14deg);
          }
          55% {
            transform: rotate(6deg);
          }
          70%, 100% {
            transform: rotate(0deg);
          }
        }

        /* Sounding block compression animation */
        .block-squeeze-anim {
          transform-origin: 52px 80px;
          animation: block-squeeze 1.6s infinite ease-out;
          will-change: transform;
        }

        @keyframes block-squeeze {
          0%, 43% {
            transform: scaleY(1) translateY(0);
          }
          45% {
            transform: scaleY(0.92) translateY(0.32px);
          }
          51% {
            transform: scaleY(1.05) translateY(-0.15px);
          }
          58% {
            transform: scaleY(0.98) translateY(0.05px);
          }
          65%, 100% {
            transform: scaleY(1) translateY(0);
          }
        }

        /* Concentric waves expansion animation */
        .wave-1-anim {
          transform-origin: 52px 83px;
          animation: wave-expand-1 1.6s infinite ease-out;
          will-change: transform, opacity;
        }

        @keyframes wave-expand-1 {
          0%, 43% {
            opacity: 0;
            transform: scale(0);
          }
          45% {
            opacity: 0.8;
            transform: scale(1.0);
          }
          64%, 100% {
            opacity: 0;
            transform: scale(1.5);
          }
        }

        .wave-2-anim {
          transform-origin: 52px 83px;
          animation: wave-expand-2 1.6s infinite ease-out;
          will-change: transform, opacity;
        }

        @keyframes wave-expand-2 {
          0%, 43% {
            opacity: 0;
            transform: scale(0);
          }
          45.5% {
            opacity: 0.6;
            transform: scale(1.0);
          }
          64.5%, 100% {
            opacity: 0;
            transform: scale(2.0);
          }
        }

        /* Impact Flash animation */
        .flash-anim {
          transform-origin: 52px 83px;
          animation: flash-glow 1.6s infinite ease-out;
          will-change: transform, opacity;
        }

        @keyframes flash-glow {
          0%, 43% {
            opacity: 0;
            transform: scale(0.5);
          }
          45% {
            opacity: 1.0;
            transform: scale(1.0);
          }
          51%, 100% {
            opacity: 0;
            transform: scale(1.4);
          }
        }

        /* Spark Particles animation using custom variables */
        .spark-anim {
          transform-origin: 52px 83px;
          animation: spark-explode 1.6s infinite ease-out;
          will-change: transform, opacity;
        }

        @keyframes spark-explode {
          0%, 43% {
            opacity: 0;
            transform: translate(0, 0);
          }
          45% {
            opacity: 1;
          }
          60%, 100% {
            opacity: 0;
            transform: translate(var(--dx), var(--dy));
          }
        }
      `}</style>
      <svg 
        style={{ width: '100%', height: '100%', overflow: 'visible' }}
        viewBox="0 0 120 120" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Dastavez AI animated brand logo"
      >
        <defs>
          {/* Multi-Stop Liquid Gold Gradient */}
          <linearGradient id="luxury-gold" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FFFBEB" />
            <stop offset="25%" stopColor="#FDE68A" />
            <stop offset="50%" stopColor="#FBBF24" />
            <stop offset="80%" stopColor="#D97706" />
            <stop offset="100%" stopColor="#78350F" />
          </linearGradient>

          {/* High-Contrast Gold Gradient for Shadows */}
          <linearGradient id="luxury-gold-dark" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#D97706" />
            <stop offset="50%" stopColor="#92400E" />
            <stop offset="100%" stopColor="#451A03" />
          </linearGradient>

          {/* Linear gradient for gavel shaft to simulate rounded metal */}
          <linearGradient id="gavel-shaft-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#92400E" />
            <stop offset="30%" stopColor="#FDE68A" />
            <stop offset="50%" stopColor="#FFFBEB" />
            <stop offset="70%" stopColor="#FBBF24" />
            <stop offset="100%" stopColor="#78350F" />
          </linearGradient>

          {/* Glow filter for impact sparks */}
          <filter id="impact-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          {/* GPU-Accelerated Drop Shadow for Gavel Depth */}
          <filter id="gavel-shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="1" dy="2" stdDeviation="1.5" floodColor="#000000" floodOpacity="0.25" />
          </filter>
        </defs>

        {/* Theme-dependent Background Card */}
        <rect 
          x="8" 
          y="8" 
          width="104" 
          height="104" 
          rx="24" 
          className="justice-logo-bg"
          strokeWidth="1.5"
        />

        {/* Scaled Gavel & Sound Block Group */}
        <g transform="translate(60, 67.5) scale(1.15) translate(-60, -67.5)">
          {/* Sounding Block (Legal stepped foundation with physics compression) */}
          <g className="block-squeeze-anim">
            {/* Top Step */}
            <rect x="41" y="80" width="22" height="4" rx="1" fill="url(#luxury-gold)" />
            {/* Middle Step */}
            <rect x="37" y="84" width="30" height="4" rx="1.5" fill="url(#luxury-gold)" />
            {/* Bottom Step */}
            <rect x="33" y="88" width="38" height="4" rx="2" fill="url(#luxury-gold-dark)" />
          </g>

          {/* Sound / Impact Waves (centered at impact point: x=52, y=83) */}
          <circle 
            cx="52" 
            cy="83" 
            r="8" 
            stroke="url(#luxury-gold)" 
            strokeWidth="2"
            className="wave-1-anim"
          />
          <circle 
            cx="52" 
            cy="83" 
            r="8" 
            stroke="url(#luxury-gold)" 
            strokeWidth="1.5"
            className="wave-2-anim"
          />

          {/* Impact Flash (Radial Burst) */}
          <circle 
            cx="52" 
            cy="83" 
            r="14" 
            fill="url(#luxury-gold)"
            opacity="0.3"
            className="flash-anim"
            style={{ filter: 'url(#impact-glow)' }}
          />

          {/* Spark Particles */}
          <g>
            {sparkDirections.map((p, idx) => (
              <circle
                key={idx}
                cx="52"
                cy="83"
                r="1.2"
                fill="url(#luxury-gold)"
                className="spark-anim"
                style={{ '--dx': `${p.dx}px`, '--dy': `${p.dy}px` } as React.CSSProperties}
              />
            ))}
          </g>

          {/* Gavel Group (Shaft + Head) with drop-shadow filter */}
          <g transform="translate(87, 60)" style={{ filter: 'url(#gavel-shadow)' }}>
            <g className="gavel-strike-anim">
              {/* Gavel Handle Shaft */}
              <rect x="-29" y="-2" width="29" height="4" rx="2" fill="url(#gavel-shaft-grad)" />
              {/* Gavel Grip Cap */}
              <rect x="-6" y="-4" width="6" height="8" rx="2" fill="url(#luxury-gold)" />

              {/* Connection Collar */}
              <rect x="-29" y="-5" width="3" height="10" rx="1" fill="url(#luxury-gold)" />

              {/* Gavel Head Cylinder (Drum) */}
              <rect x="-39" y="-12" width="12" height="24" rx="2.5" fill="url(#luxury-gold)" />
              {/* Cylinder Detail Rings / Ridges */}
              <rect x="-39.5" y="-7" width="13" height="1" fill="#fff" opacity="0.35" />
              <rect x="-39.5" y="-4" width="13" height="8" fill="url(#luxury-gold-dark)" opacity="0.2" />
              <rect x="-39.5" y="6" width="13" height="1" fill="#fff" opacity="0.35" />

              {/* Gavel Head Top Cap */}
              <rect x="-41.5" y="-15" width="17" height="3" rx="1" fill="url(#luxury-gold)" />
              
              {/* Gavel Head Bottom Cap */}
              <rect x="-41.5" y="12" width="17" height="3" rx="1" fill="url(#luxury-gold)" />
            </g>
          </g>
        </g>
      </svg>
    </div>
  );
};

export default JusticeIcon;