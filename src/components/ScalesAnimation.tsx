import { useEffect, useRef } from 'react';

const ScalesAnimation = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let angle = 0;

    const draw = () => {
      if (!ctx || !canvas) return;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Set canvas size
      canvas.width = 200;
      canvas.height = 200;

      // Center point
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      // Draw stand
      ctx.beginPath();
      ctx.moveTo(centerX, centerY - 40);
      ctx.lineTo(centerX, centerY + 60);
      ctx.strokeStyle = '#D6AB55';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Draw base
      ctx.beginPath();
      ctx.moveTo(centerX - 40, centerY + 60);
      ctx.lineTo(centerX + 40, centerY + 60);
      ctx.strokeStyle = '#D6AB55';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Draw beam
      ctx.save();
      ctx.translate(centerX, centerY - 40);
      ctx.rotate(Math.sin(angle) * 0.1); // Oscillating rotation

      ctx.beginPath();
      ctx.moveTo(-60, 0);
      ctx.lineTo(60, 0);
      ctx.strokeStyle = '#D6AB55';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Draw left scale
      ctx.beginPath();
      ctx.arc(
        -50,
        Math.sin(angle) * 5, // Oscillating Y position
        15,
        0,
        Math.PI * 2
      );
      ctx.fillStyle = '#F2D694';
      ctx.fill();
      ctx.strokeStyle = '#D6AB55';
      ctx.stroke();

      // Draw right scale
      ctx.beginPath();
      ctx.arc(
        50,
        -Math.sin(angle) * 5, // Opposite oscillation
        15,
        0,
        Math.PI * 2
      );
      ctx.fillStyle = '#F2D694';
      ctx.fill();
      ctx.strokeStyle = '#D6AB55';
      ctx.stroke();

      ctx.restore();

      // Update angle
      angle += 0.02;

      // Continue animation
      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="w-[200px] h-[200px] mx-auto opacity-90"
    />
  );
};

export default ScalesAnimation; 