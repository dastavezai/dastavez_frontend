import React, { useEffect, useRef } from 'react';

const StarField: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to window size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Star properties
    const stars: { x: number; y: number; z: number; prevZ: number }[] = [];
    const numStars = 400;
    const speed = 0.5;

    // Initialize stars
    for (let i = 0; i < numStars; i++) {
      stars.push({
        x: Math.random() * canvas.width - canvas.width / 2,
        y: Math.random() * canvas.height - canvas.height / 2,
        z: Math.random() * 1500,
        prevZ: 0
      });
    }

    // Animation function
    function animate() {
      ctx.fillStyle = 'rgba(17, 24, 39, 0.1)'; // Slightly transparent background for trail effect
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Center of the screen
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      // Update and draw stars
      stars.forEach(star => {
        star.prevZ = star.z;
        star.z = star.z - speed;

        if (star.z <= 1) {
          star.z = 1500;
          star.prevZ = star.z;
          star.x = Math.random() * canvas.width - centerX;
          star.y = Math.random() * canvas.height - centerY;
        }

        const sx = star.x / star.z * 500 + centerX;
        const sy = star.y / star.z * 500 + centerY;
        const px = star.x / star.prevZ * 500 + centerX;
        const py = star.y / star.prevZ * 500 + centerY;

        // Calculate size based on z position
        const size = Math.min(3, 1500 / star.z);
        
        // Calculate opacity based on z position
        const opacity = Math.min(1, 1500 / star.z / 2);

        // Draw star trail
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(sx, sy);
        ctx.strokeStyle = `rgba(234, 179, 8, ${opacity})`; // judicial-gold color
        ctx.lineWidth = size;
        ctx.stroke();

        // Draw star point
        ctx.beginPath();
        ctx.arc(sx, sy, size/2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(234, 179, 8, ${opacity})`;
        ctx.fill();
      });

      requestAnimationFrame(animate);
    }

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full -z-10 bg-judicial-dark"
      style={{ pointerEvents: 'none' }}
    />
  );
};

export default StarField; 