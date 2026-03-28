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
  performanceMode?: boolean;
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
  subtle,
  performanceMode = false
}) => {
  const requestRef = useRef<number>(0);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const perfFrameRef = useRef(0);

  // Use a ref to store the latest props to avoid stale closures in the animation loop
  const propsRef = useRef({
    transparency,
    colorMode,
    manualColor,
    palette,
    trippy,
    subtle,
    width,
    height,
    performanceMode
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
      height,
      performanceMode
    };
  }, [transparency, colorMode, manualColor, palette, trippy, subtle, width, height, performanceMode]);

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (!ctxRef.current) {
      ctxRef.current = canvas.getContext('2d');
    }
    const ctx = ctxRef.current;
    if (!ctx) return;

    const {
      transparency: currentTransparency,
      colorMode: currentColorMode,
      manualColor: currentManualColor,
      palette: currentPalette,
      trippy: currentTrippy,
      subtle: currentSubtle,
      performanceMode: isPerfMode
    } = propsRef.current;

    // Performance mode: throttle visuals to ~30fps
    if (isPerfMode && perfFrameRef.current++ % 2 !== 0) {
      requestRef.current = requestAnimationFrame(draw);
      return;
    }

    const frameNow = Date.now();

    // Cache canvas dimensions to avoid repeated property lookups
    const cw = canvas.width;
    const ch = canvas.height;
    const cwHalf = cw / 2;
    const chHalf = ch / 2;

    // Trippy feedback loop: draw the canvas back onto itself with slight scale and rotation
    // In performance mode, use a simple fade instead of the expensive drawImage feedback
    if (isPerfMode) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
      ctx.fillRect(0, 0, cw, ch);
    } else {
      ctx.save();
      ctx.globalCompositeOperation = 'source-over';

      const trailAlpha = 0.92 - (currentTrippy * 0.1) + (currentSubtle * 0.05);
      ctx.globalAlpha = Math.max(0.7, Math.min(0.98, trailAlpha));

      ctx.translate(cwHalf, chHalf);

      const rotation = 0.002 + (currentTrippy * 0.02);
      ctx.rotate(rotation);

      const scale = 1.005 + (currentTrippy * 0.01);
      ctx.scale(scale, scale);

      ctx.drawImage(canvas, -cwHalf, -chHalf);
      ctx.restore();

      // Occasional glitch strip — only when trippy is high enough to matter
      if (currentTrippy > 0.01 && Math.random() > (0.98 - currentTrippy * 0.05)) {
        ctx.clearRect(0, Math.random() * ch, cw, 20 * (1 + currentTrippy));
      }
    }

    const points = pointsRef.current || [];
    if (points.length === 0) {
      requestRef.current = requestAnimationFrame(draw);
      return;
    }

    // Draw connecting lines — skip chromatic aberration in performance mode
    if (points.length >= 2) {
      ctx.lineWidth = 1 + (currentTrippy * 2);
      ctx.globalAlpha = currentTransparency;


      let baseColor = 'rgba(255, 255, 255, 0.4)';
      if (currentColorMode === 'manual') {
        baseColor = currentManualColor;
      } else if ((currentColorMode === 'preset' || currentColorMode === 'auto') && currentPalette.length > 0) {
        baseColor = currentPalette[0];
      }

      if (isPerfMode) {
        // Single-pass line drawing (no chromatic aberration)
        ctx.beginPath();
        points.forEach((p, i) => {
          if (i === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        });
        ctx.strokeStyle = baseColor;
        ctx.stroke();
      } else {
        // Full chromatic aberration (3-pass)
        let baseColors = ['rgba(255, 0, 0, 0.3)', 'rgba(255, 255, 255, 0.4)', 'rgba(0, 255, 255, 0.3)'];
        if (currentColorMode === 'manual') {
          baseColors = [currentManualColor, currentManualColor, currentManualColor];
        } else if ((currentColorMode === 'preset' || currentColorMode === 'auto') && currentPalette.length >= 3) {
          baseColors = currentPalette.slice(0, 3);
        }

        const path = new Path2D();
        points.forEach((p, i) => {
          const glitchAmount = currentTrippy * 10;
          const glitchX = (Math.random() - 0.5) * glitchAmount;
          const glitchY = (Math.random() - 0.5) * glitchAmount;
          if (i === 0) path.moveTo(p.x + glitchX, p.y + glitchY);
          else path.lineTo(p.x + glitchX, p.y + glitchY);
        });

        const offset = 2 * (1 + currentTrippy * 2);
        ctx.save(); ctx.translate(-offset, 0); ctx.strokeStyle = baseColors[0]; ctx.stroke(path); ctx.restore();
        ctx.strokeStyle = baseColors[1]; ctx.stroke(path);
        ctx.save(); ctx.translate(offset, 0); ctx.strokeStyle = baseColors[2]; ctx.stroke(path); ctx.restore();
      }
    }

    // Draw points — in performance mode, skip glow + energy lines
    const pointStep = isPerfMode ? 2 : 1; // Draw every other point in perf mode
    for (let i = 0; i < points.length; i += pointStep) {
      const p = points[i];
      let pointColor: string;

      if (currentColorMode === 'manual') {
        pointColor = currentManualColor;
      } else if ((currentColorMode === 'preset' || currentColorMode === 'auto') && currentPalette.length > 0) {
        pointColor = currentPalette[i % currentPalette.length];
      } else {
        const hue = (frameNow / 20 + i * 20) % 360;
        pointColor = `hsla(${hue}, 100%, 70%, 0.8)`;
      }

      if (!isPerfMode) {
        // Glow (skip in perf mode)
        const size = (10 + Math.sin(frameNow / 200 + i) * 5) * (1 - currentSubtle * 0.5 + currentTrippy);
        ctx.fillStyle = pointColor;
        ctx.globalAlpha = currentTransparency * 0.4;
        ctx.beginPath();
        ctx.arc(p.x, p.y, size * 1.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Core point
      ctx.fillStyle = 'white';
      ctx.globalAlpha = 1;
      ctx.beginPath();
      ctx.arc(p.x, p.y, isPerfMode ? 2 : 2 * (1 + currentTrippy), 0, Math.PI * 2);
      ctx.fill();

      // Energy lines (skip in perf mode)
      if (!isPerfMode) {
        ctx.beginPath();
        ctx.strokeStyle = pointColor;
        ctx.lineWidth = 1 + currentTrippy;
        const angle = (frameNow / (300 - currentTrippy * 200)) + (i * Math.PI * 2 / points.length);
        const length = (20 + Math.sin(frameNow / 100 + i) * 15) * (1 + currentTrippy * 2);
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x + Math.cos(angle) * length, p.y + Math.sin(angle) * length);
        ctx.stroke();

        if (currentTrippy > 0.2) {
          ctx.beginPath();
          ctx.strokeStyle = pointColor;
          ctx.globalAlpha = currentTransparency * 0.5;
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x + Math.cos(-angle * 1.5) * length * 0.7, p.y + Math.sin(-angle * 1.5) * length * 0.7);
          ctx.stroke();
          ctx.globalAlpha = currentTransparency;
        }
      }
    }

    requestRef.current = requestAnimationFrame(draw);
  };

  useEffect(() => {
    if (isPlaying) {
      requestRef.current = requestAnimationFrame(draw);
    } else {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = ctxRef.current ?? canvas.getContext('2d');
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
      style={{ filter: performanceMode ? undefined : 'drop-shadow(0 0 10px rgba(255,255,255,0.5))' }}
    />
  );
};

export default ScanningVisuals;
