import React from 'react';
import { Bot } from 'lucide-react';

const AIAssistantIcon: React.FC = () => {
  return (
    <div className="relative perspective-1000">
      <div className="relative preserve-3d" style={{
        animation: 'float3D 4s ease-in-out infinite'
      }}>
        <Bot className="h-10 w-10 text-judicial-gold" />
        <div className="absolute inset-0 bg-judicial-gold/20 blur-lg -z-10" />
      </div>
      <style>
        {`
          .perspective-1000 {
            perspective: 1000px;
          }
          .preserve-3d {
            transform-style: preserve-3d;
          }
          @keyframes float3D {
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
        `}
      </style>
    </div>
  );
};

export default AIAssistantIcon; 