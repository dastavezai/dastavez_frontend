import { useEffect, useRef } from 'react';

interface FloatingCardProps {
  children: React.ReactNode;
  className?: string;
}

const FloatingCard = ({ children, className = '' }: FloatingCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const card = cardRef.current;
    const glow = glowRef.current;
    if (!card || !glow) return;

    // Removed hover effects

    return () => {
      // No event listeners to remove
    };
  }, []);

  return (
    <div className={`relative ${className}`}>
      {/* Background Glow - Behind everything */}
      <div className="absolute -inset-1 bg-gradient-to-br from-judicial-gold/10 to-judicial-gold/5 rounded-xl blur-lg -z-10" />
      <div className="absolute -inset-1.5 bg-gradient-to-br from-judicial-gold/10 to-judicial-gold/5 rounded-xl blur-xl -z-10" />

      {/* 3D Card Container */}
      <div
         ref={cardRef}
         className="relative z-10 rounded-xl border border-judicial-gold/50 bg-judicial-navy/60 overflow-hidden"
         style={{ transformStyle: "preserve-3d" }}
      >
        {/* Inset Border Glow */}
        <div className="absolute inset-0 rounded-xl shadow-[inset_0_0_16px_rgba(214,171,85,0.12)] pointer-events-none" />

        {/* Content Container */}
        <div className="relative p-8">
          {/* Interactive Glow Effect */}
          <div
            ref={glowRef}
            className="absolute inset-0 rounded-xl pointer-events-none"
          />

          {/* Content */}
          <div className="relative z-10">{children}</div>
        </div>
      </div>
    </div>
  );
};

export default FloatingCard; 