import React, { useRef, useEffect } from 'react';

interface Point {
  x: number;
  y: number;
}

interface ScanningVisualsProps {
  pointsRef: React.RefObject<Point[]>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  width: number;
  height: number;
  isPlaying: boolean;
  transparency: number;
  colorMode: 'preset' | 'auto';
  manualColor: string;
  palette: string[];
  trippy: number;
  subtle: number;
}

const ScanningVisuals: React.FC<ScanningVisualsProps> = ({ 
  pointsRef, 
  canvasRef, 
  width, 
  height, 
  isPlaying,
  transparency,
  colorMode,
  manualColor,
  palette,
  trippy,
  subtle
}) => {
  const requestRef = useRef<number>(0);
  
  // Use a ref to store the latest props to avoid stale closures in the animation loop
  const propsRef = useRef({
    transparency,
    colorMode,
    manualColor,
    palette,
    trippy,
    subtle,
    width,
    height
  });

  // Update the ref whenever props change
  useEffect(() => {
    propsRef.current = {
      transparency,
      colorMode,
      manualColor,
      palette,
      trippy,
      subtle,
      width,
      height
    };
  }, [transparency, colorMode, manualColor, palette, trippy, subtle, width, height]);

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { 
      transparency: currentTransparency, 
      colorMode: currentColorMode, 
      manualColor: currentManualColor, 
      palette: currentPalette, 
      trippy: currentTrippy, 
      subtle: currentSubtle 
    } = propsRef.current;

    // Trippy feedback loop: draw the canvas back onto itself with slight scale and rotation
    ctx.save();
    ctx.globalCompositeOperation = 'source-over';
    
    // Trail length affected by 'subtle' and 'trippy'
    const trailAlpha = 0.92 - (currentTrippy * 0.1) + (currentSubtle * 0.05);
    ctx.globalAlpha = Math.max(0.7, Math.min(0.98, trailAlpha));
    
    ctx.translate(canvas.width / 2, canvas.height / 2);
    
    // Rotation affected by 'trippy'
    const rotation = 0.002 + (currentTrippy * 0.02);
    ctx.rotate(rotation); 
    
    // Scale affected by 'trippy'
    const scale = 1.005 + (currentTrippy * 0.01);
    ctx.scale(scale, scale); 
    
    ctx.drawImage(canvas, -canvas.width / 2, -canvas.height / 2);
    ctx.restore();

    // Occasional glitch: clear a random strip - more frequent if 'trippy' is high
    if (Math.random() > (0.98 - currentTrippy * 0.05)) {
      ctx.clearRect(0, Math.random() * canvas.height, canvas.width, 20 * (1 + currentTrippy));
    }

    const points = pointsRef.current || [];
    if (points.length === 0) {
      requestRef.current = requestAnimationFrame(draw);
      return;
    }

    // Draw connecting lines with chromatic aberration - Optimized
    const drawLines = () => {
      if (points.length < 2) return;
      
      const path = new Path2D();
      points.forEach((p, i) => {
        const glitchAmount = currentTrippy * 10;
        const glitchX = (Math.random() - 0.5) * glitchAmount;
        const glitchY = (Math.random() - 0.5) * glitchAmount;
        if (i === 0) path.moveTo(p.x + glitchX, p.y + glitchY);
        else path.lineTo(p.x + glitchX, p.y + glitchY);
      });

      ctx.lineWidth = 1 + (currentTrippy * 2);
      ctx.globalAlpha = currentTransparency;

      // Determine base colors
      let baseColors = ['rgba(255, 0, 0, 0.3)', 'rgba(255, 255, 255, 0.4)', 'rgba(0, 255, 255, 0.3)'];
      
      if (currentColorMode === 'manual') {
        baseColors = [currentManualColor, currentManualColor, currentManualColor];
      } else if (currentColorMode === 'preset' || currentColorMode === 'auto') {
        if (currentPalette.length >= 3) {
          baseColors = currentPalette.slice(0, 3);
        } else if (currentPalette.length > 0) {
          baseColors = [currentPalette[0], currentPalette[0], currentPalette[0]];
        }
      }

      const offset = 2 * (1 + currentTrippy * 2);
      
      ctx.save();
      ctx.translate(-offset, 0);
      ctx.strokeStyle = baseColors[0];
      ctx.stroke(path);
      ctx.restore();

      ctx.strokeStyle = baseColors[1];
      ctx.stroke(path);

      ctx.save();
      ctx.translate(offset, 0);
      ctx.strokeStyle = baseColors[2];
      ctx.stroke(path);
      ctx.restore();
    };

    drawLines();

    // Draw points
    points.forEach((p, i) => {
      let hue = (Date.now() / 20 + i * 20) % 360;
      let pointColor = `hsla(${hue}, 100%, 70%, 0.8)`;
      
      if (currentColorMode === 'manual') {
        pointColor = currentManualColor;
      } else if ((currentColorMode === 'preset' || currentColorMode === 'auto') && currentPalette.length > 0) {
        pointColor = currentPalette[i % currentPalette.length];
      }

      const size = (10 + Math.sin(Date.now() / 200 + i) * 5) * (1 - currentSubtle * 0.5 + currentTrippy);
      
      // Simplified glow - faster than radial gradient
      ctx.fillStyle = pointColor;
      ctx.globalAlpha = currentTransparency * 0.4;
      ctx.beginPath();
      ctx.arc(p.x, p.y, size * 1.5, 0, Math.PI * 2);
      ctx.fill();

      // Core point
      ctx.fillStyle = 'white';
      ctx.globalAlpha = 1;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 2 * (1 + currentTrippy), 0, Math.PI * 2);
      ctx.fill();

      // Trippy "energy" lines radiating from points
      ctx.beginPath();
      ctx.strokeStyle = pointColor;
      ctx.lineWidth = 1 + currentTrippy;
      const angle = (Date.now() / (300 - currentTrippy * 200)) + (i * Math.PI * 2 / points.length);
      const length = (20 + Math.sin(Date.now() / 100 + i) * 15) * (1 + currentTrippy * 2);
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x + Math.cos(angle) * length, p.y + Math.sin(angle) * length);
      ctx.stroke();
      
      // Secondary energy line
      if (currentTrippy > 0.2) {
        ctx.beginPath();
        ctx.strokeStyle = pointColor;
        ctx.globalAlpha = currentTransparency * 0.5;
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x + Math.cos(-angle * 1.5) * length * 0.7, p.y + Math.sin(-angle * 1.5) * length * 0.7);
        ctx.stroke();
        ctx.globalAlpha = currentTransparency;
      }
    });

    requestRef.current = requestAnimationFrame(draw);
  };

  useEffect(() => {
    if (isPlaying) {
      requestRef.current = requestAnimationFrame(draw);
    } else {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      // Clear canvas when stopped
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx?.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isPlaying]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="absolute inset-0 w-full h-full z-10 pointer-events-none mix-blend-screen"
      style={{ filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.5))' }}
    />
  );
};

export default ScanningVisuals;
