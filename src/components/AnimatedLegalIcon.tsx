import React from 'react';
import GavelIcon4D from './GavelIcon4D';

const AnimatedLegalIcon: React.FC = () => {
  return (
    <div className="relative group">
      <div className="relative transform-gpu transition-transform duration-500 group-hover:scale-110">
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-r from-judicial-gold/20 to-judicial-blue/20 rounded-full blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-500" />
        
        {/* Ring effects */}
        <div className="absolute inset-0 ring-effect" />
        <div className="absolute inset-0 ring-effect" style={{ animationDelay: '1s' }} />
        
        {/* Main icon */}
        <div className="relative z-10">
          <GavelIcon4D />
        </div>
      </div>

      <style>{`
        .ring-effect {
          border: 2px solid rgba(234, 179, 8, 0.2);
          border-radius: 50%;
          animation: ringPulse 3s ease-in-out infinite;
        }

        @keyframes ringPulse {
          0% {
            transform: scale(0.8);
            opacity: 0;
          }
          50% {
            transform: scale(1.2);
            opacity: 0.5;
          }
          100% {
            transform: scale(1.6);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default AnimatedLegalIcon; 