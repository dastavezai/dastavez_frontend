import React, { useEffect, useState } from 'react';

const GavelIcon4D: React.FC = () => {
  const [timePhase, setTimePhase] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimePhase((prev) => (prev + 1) % 360);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-12 h-12">
      {/* Time dimension wrapper */}
      <div className="absolute inset-0 time-wrapper" style={{
        animation: 'timeDimension 8s linear infinite',
        transform: `perspective(1000px) rotateX(${Math.sin(timePhase * 0.02) * 15}deg)`
      }}>
        {/* Main gavel icon with multiple layers */}
        <div className="relative w-full h-full">
          {/* Echo layers for 4D effect */}
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="absolute inset-0 gavel-echo"
              style={{
                animation: `echo${i} 3s ease-in-out infinite`,
                animationDelay: `${i * 0.2}s`,
                opacity: 0.2 - i * 0.03
              }}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="w-full h-full"
                style={{
                  filter: `hue-rotate(${i * 30}deg) brightness(1.2)`,
                  transform: `scale(${1 + i * 0.05}) rotate(${i * 5}deg)`
                }}
              >
                <path
                  d="M12 2L2 12l10 10 10-10L12 2zm0 6a4 4 0 100 8 4 4 0 000-8z"
                  className="gavel-path"
                  stroke="currentColor"
                  strokeWidth="2"
                />
              </svg>
            </div>
          ))}

          {/* Main gavel icon */}
          <div className="absolute inset-0 gavel-main">
            <svg viewBox="0 0 24 24" fill="none" className="w-full h-full text-judicial-gold">
              <path
                d="M14 14.252V16.342C14 17.254 13.254 18 12.342 18H7.658C6.746 18 6 17.254 6 16.342V11.658C6 10.746 6.746 10 7.658 10H9.748L14 14.252zM9.748 10L14 5.748V3.658C14 2.746 13.254 2 12.342 2H7.658C6.746 2 6 2.746 6 3.658V8.342C6 9.254 6.746 10 7.658 10H9.748z"
                fill="currentColor"
              />
            </svg>
          </div>
        </div>

        {/* Particle effects */}
        <div className="absolute inset-0">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-judicial-gold/30 rounded-full particle"
              style={{
                top: '50%',
                left: '50%',
                animation: `particle ${2 + Math.random() * 2}s linear infinite`,
                animationDelay: `${i * 0.2}s`
              }}
            />
          ))}
        </div>
      </div>

      {/* Glowing orb effect */}
      <div className="absolute inset-0 glow-orb" />

      <style>{`
        .time-wrapper {
          transform-style: preserve-3d;
        }

        .gavel-main {
          animation: mainGavel 4s ease-in-out infinite;
          filter: drop-shadow(0 0 10px rgba(234, 179, 8, 0.5));
        }

        .gavel-path {
          stroke-dasharray: 100;
          stroke-dashoffset: 100;
          animation: drawPath 3s ease-in-out infinite;
        }

        .glow-orb {
          background: radial-gradient(circle at center, rgba(234, 179, 8, 0.4) 0%, transparent 70%);
          animation: glowPulse 4s ease-in-out infinite;
        }

        @keyframes timeDimension {
          0%, 100% {
            transform: perspective(1000px) rotateX(0deg) rotateY(0deg) rotateZ(0deg);
          }
          25% {
            transform: perspective(1000px) rotateX(10deg) rotateY(10deg) rotateZ(5deg);
          }
          50% {
            transform: perspective(1000px) rotateX(0deg) rotateY(20deg) rotateZ(10deg);
          }
          75% {
            transform: perspective(1000px) rotateX(-10deg) rotateY(10deg) rotateZ(15deg);
          }
        }

        @keyframes mainGavel {
          0%, 100% {
            transform: translateZ(0) rotate(0deg);
          }
          50% {
            transform: translateZ(20px) rotate(180deg);
          }
        }

        @keyframes drawPath {
          0% {
            stroke-dashoffset: 100;
          }
          50% {
            stroke-dashoffset: 0;
          }
          100% {
            stroke-dashoffset: -100;
          }
        }

        @keyframes glowPulse {
          0%, 100% {
            opacity: 0.5;
            transform: scale(1);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.2);
          }
        }

        @keyframes particle {
          0% {
            transform: translate(-50%, -50%) rotate(0deg) translateX(0) scale(0);
            opacity: 1;
          }
          100% {
            transform: translate(-50%, -50%) rotate(360deg) translateX(40px) scale(1);
            opacity: 0;
          }
        }

        ${[...Array(5)].map((_, i) => `
          @keyframes echo${i} {
            0%, 100% {
              transform: translateZ(${i * 5}px) scale(${1 + i * 0.05});
              opacity: ${0.2 - i * 0.03};
            }
            50% {
              transform: translateZ(${i * 10}px) scale(${1.2 + i * 0.05});
              opacity: ${0.3 - i * 0.03};
            }
          }
        `).join('\n')}
      `}</style>
    </div>
  );
};

export default GavelIcon4D; 