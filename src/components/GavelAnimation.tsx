import { useEffect, useRef } from 'react';

const GavelAnimation = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let angle = 0;
    let isHitting = false;
    let hitProgress = 0;

    const draw = () => {
      if (!ctx || !canvas) return;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Set canvas size
      canvas.width = 200;
      canvas.height = 200;

      // Center point
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2 + 20;

      // Colors
      const goldColor = '#D6AB55';
      const lightGoldColor = '#F2D694';

      // Save the current state
      ctx.save();
      ctx.translate(centerX, centerY);

      // Calculate gavel rotation
      let gavelRotation = 0;
      if (isHitting) {
        gavelRotation = Math.sin(hitProgress * Math.PI) * Math.PI / 4;
        hitProgress += 0.1;
        if (hitProgress >= 1) {
          isHitting = false;
          hitProgress = 0;
        }
      } else {
        gavelRotation = Math.sin(angle * 0.5) * 0.1;
      }

      // Rotate the entire gavel
      ctx.rotate(gavelRotation);

      // Draw gavel head
      ctx.beginPath();
      ctx.roundRect(-40, -60, 80, 30, 5);
      ctx.fillStyle = goldColor;
      ctx.fill();
      ctx.strokeStyle = lightGoldColor;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw handle
      ctx.beginPath();
      ctx.moveTo(0, -30);
      ctx.lineTo(0, 40);
      ctx.strokeStyle = goldColor;
      ctx.lineWidth = 8;
      ctx.stroke();

      // Draw handle grip
      ctx.beginPath();
      ctx.roundRect(-10, 40, 20, 30, 5);
      ctx.fillStyle = goldColor;
      ctx.fill();
      ctx.strokeStyle = lightGoldColor;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Restore the canvas state
      ctx.restore();

      // Draw sound waves when hitting
      if (isHitting) {
        const waveRadius = (1 - hitProgress) * 50;
        const waveOpacity = (1 - hitProgress);
        
        ctx.beginPath();
        ctx.arc(centerX, centerY + 60, waveRadius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(214, 171, 85, ${waveOpacity})`;
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(centerX, centerY + 60, waveRadius * 0.7, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(214, 171, 85, ${waveOpacity})`;
        ctx.stroke();
      }

      // Update angle
      angle += 0.05;

      // Trigger hitting animation periodically
      if (!isHitting && Math.random() < 0.02) {
        isHitting = true;
        hitProgress = 0;
      }

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

export default GavelAnimation; 