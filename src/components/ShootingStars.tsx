import { useEffect, useState } from 'react';

interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  speed: number;
  delay: number;
  opacity: number;
  angle: number;
}

const ShootingStars = () => {
  const [stars, setStars] = useState<Star[]>([]);

  const createStar = (id: number): Star => ({
    id,
    x: Math.random() * 120,
    y: Math.random() * 60,
    size: Math.random() * 1.5 + 1,
    speed: Math.random() * 4 + 4,
    delay: Math.random() * 8,
    opacity: Math.random() * 0.5 + 0.2,
    angle: Math.random() * 45 + 15,
  });

  useEffect(() => {
    // Create initial stars
    const initialStars = Array.from({ length: 8 }, (_, i) => createStar(i));
    setStars(initialStars);

    // Animation loop
    const animateStars = () => {
      setStars(prevStars => 
        prevStars.map(star => {
          // Move star diagonally based on its angle
          const radians = (star.angle * Math.PI) / 180;
          const newX = star.x - Math.cos(radians) * (star.speed / 2);
          const newY = star.y + Math.sin(radians) * (star.speed / 2);

          // Reset star if it goes off screen
          if (newX < -20 || newY > 120) {
            return createStar(star.id);
          }

          return { ...star, x: newX, y: newY };
        })
      );
    };

    const interval = setInterval(animateStars, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      <style>
        {`
          @keyframes shooting-star {
            0% {
              transform: translateX(0) translateY(0);
              opacity: 1;
            }
            100% {
              transform: translateX(-200px) translateY(200px);
              opacity: 0;
            }
          }
        `}
      </style>
      {stars.map(star => (
        <div
          key={star.id}
          className="absolute"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            transform: `rotate(${star.angle}deg)`,
            opacity: star.opacity,
            animation: `shooting-star ${star.speed}s linear ${star.delay}s infinite`,
          }}
        >
          <div
            className="relative"
            style={{
              width: `${star.size * 30}px`,
              height: `${star.size}px`,
            }}
          >
            {/* Star head */}
            <div
              className="absolute left-0 top-1/2 -translate-y-1/2 rounded-full bg-judicial-gold"
              style={{
                width: `${star.size * 2}px`,
                height: `${star.size * 2}px`,
                boxShadow: `0 0 ${star.size * 2}px ${star.size}px rgba(255, 215, 0, 0.2)`,
              }}
            />
            {/* Star tail */}
            <div
              className="absolute left-0 top-0 w-full h-full bg-gradient-to-l from-transparent to-judicial-gold/20"
              style={{
                borderRadius: `${star.size}px`,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default ShootingStars; 