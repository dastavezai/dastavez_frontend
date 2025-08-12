import { useEffect, useRef, useState } from 'react';

const CursorFollower = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [secondaryPosition, setSecondaryPosition] = useState({ x: 0, y: 0 });
  const [tertiaryPosition, setTertiaryPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      // Secondary cursor follows with a slight delay
      setTimeout(() => {
        setSecondaryPosition({ x: e.clientX, y: e.clientY });
      }, 50);
      // Tertiary cursor follows with a longer delay
      setTimeout(() => {
        setTertiaryPosition({ x: e.clientX, y: e.clientY });
      }, 100);
    };

    const handleMouseEnter = () => setIsHovering(true);
    const handleMouseLeave = () => setIsHovering(false);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseenter', handleMouseEnter);
    window.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseenter', handleMouseEnter);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <>
      {/* Primary cursor */}
      <div
        ref={cursorRef}
        className="fixed pointer-events-none z-50"
        style={{
          left: position.x,
          top: position.y,
          transform: 'translate(-50%, -50%)',
          transition: 'transform 0.1s ease-out',
        }}
      >
        <div
          className="w-2.5 h-2.5 rounded-full bg-judicial-gold/60 backdrop-blur-sm"
          style={{
            transform: isHovering ? 'scale(1.3)' : 'scale(1)',
            transition: 'transform 0.2s ease-out',
          }}
        />
        <div
          className="absolute inset-0 rounded-full border border-judicial-gold/40"
          style={{
            transform: isHovering ? 'scale(1.6)' : 'scale(1)',
            transition: 'transform 0.3s ease-out',
          }}
        />
      </div>

      {/* Secondary cursor */}
      <div
        className="fixed pointer-events-none z-40"
        style={{
          left: secondaryPosition.x,
          top: secondaryPosition.y,
          transform: 'translate(-50%, -50%)',
          transition: 'transform 0.2s ease-out',
        }}
      >
        <div
          className="w-2 h-2 rounded-full bg-judicial-gold/30 backdrop-blur-sm"
          style={{
            transform: isHovering ? 'scale(1.4)' : 'scale(1)',
            transition: 'transform 0.3s ease-out',
          }}
        />
        <div
          className="absolute inset-0 rounded-full border border-judicial-gold/20"
          style={{
            transform: isHovering ? 'scale(1.8)' : 'scale(1)',
            transition: 'transform 0.4s ease-out',
          }}
        />
      </div>

      {/* Tertiary cursor */}
      <div
        className="fixed pointer-events-none z-30"
        style={{
          left: tertiaryPosition.x,
          top: tertiaryPosition.y,
          transform: 'translate(-50%, -50%) rotate(45deg)',
          transition: 'all 0.3s ease-out',
        }}
      >
        <div
          className="w-1.5 h-1.5 rounded-sm bg-judicial-gold/20 backdrop-blur-sm"
          style={{
            transform: isHovering ? 'scale(1.5) rotate(-45deg)' : 'scale(1)',
            transition: 'all 0.4s ease-out',
          }}
        />
        <div
          className="absolute inset-0 rounded-sm border border-judicial-gold/10"
          style={{
            transform: isHovering ? 'scale(2) rotate(-90deg)' : 'scale(1)',
            transition: 'all 0.5s ease-out',
          }}
        />
      </div>
    </>
  );
};

export default CursorFollower; 