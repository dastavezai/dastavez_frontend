import { useEffect, useRef } from 'react';

interface FloatingCardProps {
  children: React.ReactNode;
}

const FloatingCard = ({ children }: FloatingCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const card = cardRef.current;
    const glow = glowRef.current;
    if (!card || !glow) return;

    const handleMouseMove = (e: MouseEvent) => {
      const { left, top, width, height } = card.getBoundingClientRect();
      const x = e.clientX - left;
      const y = e.clientY - top;

      const centerX = width / 2;
      const centerY = height / 2;

      const rotateX = ((y - centerY) / height) * 20;
      const rotateY = ((centerX - x) / width) * 20;

      // Calculate the position for the glow effect
      const glowX = (x / width) * 200 - 100;
      const glowY = (y / height) * 200 - 100;

      card.style.transform = `
        perspective(1000px)
        rotateX(${rotateX}deg)
        rotateY(${rotateY}deg)
        translateZ(10px)
      `;

      // Update glow position
      glow.style.background = `
        radial-gradient(
          circle at ${x}px ${y}px,
          rgba(214, 171, 85, 0.15) 0%,
          rgba(214, 171, 85, 0.05) 30%,
          rgba(214, 171, 85, 0) 60%
        )
      `;
    };

    const handleMouseLeave = () => {
      card.style.transform = `
        perspective(1000px)
        rotateX(0deg)
        rotateY(0deg)
        translateZ(0px)
      `;
      card.style.transition = 'transform 0.5s ease-out';
      
      // Reset glow
      glow.style.background = 'transparent';
    };

    const handleMouseEnter = () => {
      card.style.transition = 'transform 0.1s ease-out';
    };

    card.addEventListener('mousemove', handleMouseMove);
    card.addEventListener('mouseleave', handleMouseLeave);
    card.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      card.removeEventListener('mousemove', handleMouseMove);
      card.removeEventListener('mouseleave', handleMouseLeave);
      card.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, []);

  return (
    <div className="relative">
      {/* 3D Card Container */}
      <div
        ref={cardRef}
        className="relative z-10"
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Frosted Glass Effect */}
        <div className="absolute inset-0 backdrop-blur-xl bg-gradient-to-br from-judicial-navy/80 to-judicial-navy/40 rounded-lg" />
        
        {/* Border Glow */}
        <div className="absolute inset-0 rounded-lg border border-judicial-gold/20 shadow-[inset_0_0_20px_rgba(214,171,85,0.1)]" />
        
        {/* Content Container */}
        <div className="relative backdrop-blur-md bg-gradient-to-br from-judicial-navy/60 to-judicial-navy/30 p-8 rounded-lg">
          {/* Interactive Glow Effect */}
          <div
            ref={glowRef}
            className="absolute inset-0 rounded-lg pointer-events-none"
          />
          
          {/* Edge Highlights */}
          <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-judicial-gold/10 to-transparent pointer-events-none" />
          
          {/* Content */}
          <div className="relative z-10">{children}</div>
        </div>
      </div>

      {/* Background Glow */}
      <div className="absolute -inset-1 bg-judicial-gold/5 rounded-lg blur-lg" />
      <div className="absolute -inset-1.5 bg-judicial-gold/5 rounded-lg blur-xl" />
    </div>
  );
};

export default FloatingCard; 