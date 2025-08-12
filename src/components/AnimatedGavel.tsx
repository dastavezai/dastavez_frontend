import React, { useState, useEffect } from 'react';

const AnimatedLetterL: React.FC = () => {
  return (
    <div className="inline-block relative perspective-1000">
      <div 
        className="relative preserve-3d"
        style={{
          animation: 'letterFloat3D 4s ease-in-out infinite'
        }}
      >
        <span className="text-judicial-gold font-bold">L</span>
        <div className="absolute inset-0 bg-judicial-gold/20 blur-lg -z-10" />
      </div>
      <style>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .preserve-3d {
          transform-style: preserve-3d;
        }
        @keyframes letterFloat3D {
          0%, 100% {
            transform: rotateY(0deg) rotateX(0deg) translateZ(0);
          }
          25% {
            transform: rotateY(15deg) rotateX(-5deg) translateZ(10px);
          }
          50% {
            transform: rotateY(0deg) rotateX(0deg) translateZ(0);
          }
          75% {
            transform: rotateY(-15deg) rotateX(5deg) translateZ(10px);
          }
        }
      `}</style>
    </div>
  );
};

const AnimatedGavel: React.FC = () => {
  const [mouseX, setMouseX] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Only track horizontal movement within a reasonable range
      const boundedX = Math.max(-20, Math.min(20, (e.clientX - window.innerWidth / 2) / 50));
      setMouseX(boundedX);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div 
      className="inline-block align-middle mr-2 cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        transform: `translateX(${mouseX}px)`,
        transition: 'transform 0.3s ease-out'
      }}
    >
      <div 
        className="relative"
        style={{
          transform: `scale(${isHovered ? 1.1 : 1}) rotateY(${mouseX}deg)`,
          transition: 'transform 0.3s ease-out'
        }}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          className="gavel-icon"
        >
          {/* Gavel head */}
          <path
            d="M6 12L10 8L18 16L14 20L6 12Z"
            fill="#FFD700"
            className="gavel-part"
          />
          {/* Handle */}
          <path
            d="M14 6L16 4L20 8L18 10L14 6Z"
            fill="#FFD700"
            className="gavel-part"
          />
        </svg>

        {/* Glow effect */}
        <div className="absolute inset-0 glow-effect" />
      </div>

      <style>{`
        .gavel-icon {
          animation: rotate3D 4s ease-in-out infinite;
          transform-style: preserve-3d;
        }

        .gavel-part {
          filter: drop-shadow(0 0 4px rgba(255, 215, 0, 0.6));
        }

        .glow-effect {
          background: radial-gradient(circle at center, rgba(255, 215, 0, 0.4) 0%, transparent 70%);
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .gavel-icon:hover .glow-effect {
          opacity: 1;
        }

        @keyframes rotate3D {
          0%, 100% {
            transform: rotateY(0deg) rotateX(0deg);
          }
          50% {
            transform: rotateY(180deg) rotateX(10deg);
          }
        }

        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-2px);
          }
        }
      `}</style>
    </div>
  );
};

export { AnimatedGavel, AnimatedLetterL }; 