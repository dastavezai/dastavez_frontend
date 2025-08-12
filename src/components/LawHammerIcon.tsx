import React from "react";

const LawHammerIcon: React.FC = () => {
  return (
    <div className="w-12 h-12 relative animate-bounce">
      {/* Shadow */}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-6 h-1 bg-judicial-gold/30 blur-sm rounded-full" />
      
      {/* Hammer Head */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-8 h-4 bg-judicial-gold rounded-t-lg shadow-lg transition-transform duration-300 hover:scale-110" />
      
      {/* Hammer Handle */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-1 h-8 bg-judicial-gold shadow-md" />
      
      {/* Hammer Base */}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-6 h-2 bg-judicial-gold rounded-b-lg shadow-lg" />
    </div>
  );
};

export default LawHammerIcon; 