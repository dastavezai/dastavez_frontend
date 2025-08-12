import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const LoginIcon = () => {
  const iconRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const icon = iconRef.current;
    if (!icon) return;

    const handleMouseEnter = () => {
      icon.style.transform = 'scale(1.1)';
    };

    const handleMouseLeave = () => {
      icon.style.transform = 'scale(1)';
    };

    icon.addEventListener('mouseenter', handleMouseEnter);
    icon.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      icon.removeEventListener('mouseenter', handleMouseEnter);
      icon.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <div
      ref={iconRef}
      className="flex items-center gap-2 cursor-pointer transition-transform duration-300"
      onClick={() => navigate('/auth')}
    >
      <div className="relative">
        {/* Pulsing background effect */}
        <div className="absolute inset-0 rounded-full bg-judicial-gold/20 animate-ping" />
        {/* Login icon */}
        <div className="relative w-8 h-8 rounded-full bg-gradient-to-br from-judicial-gold to-judicial-lightGold flex items-center justify-center shadow-lg">
          <svg
            className="w-4 h-4 text-judicial-dark"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
            />
          </svg>
        </div>
      </div>
      <span className="text-sm text-judicial-gold font-medium">Log in</span>
    </div>
  );
};

export default LoginIcon; 