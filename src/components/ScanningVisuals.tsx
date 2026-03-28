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
  pointSize?: number;
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
  performanceMode = false,
  pointSize = 1
}) => {
  const requestRef = useRef<number>(0);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const perfFrameRef = useRef(0);

  // Store ALL props in a single ref to avoid stale closures AND dependency array issues
  const propsRef = useRef({
    isPlaying, transparency, colorMode, manualColor, palette,
    trippy, subtle, width, height, performanceMode, pointSize
  });

  // Sync props to ref on every render
  propsRef.current = {
    isPlaying, transparency, colorMode, manualColor, palette,
    trippy, subtle, width, height, performanceMode, pointSize
  };

  // Single mount-only effect: starts the draw loop and cleans up on unmount
  useEffect(() => {
    let alive = true;

    const draw = () => {
      if (!alive) return;

      const canvas = canvasRef.current;
      if (!canvas) {
        requestRef.current = requestAnimationFrame(draw);
        return;
      }
      if (!ctxRef.current) {
        ctxRef.current = canvas.getContext('2d');
      }
      const ctx = ctxRef.current;
      if (!ctx) {
        requestRef.current = requestAnimationFrame(draw);
        return;
      }

      const {
        isPlaying: currentIsPlaying,
        transparency: currentTransparency,
        colorMode: currentColorMode,
        manualColor: currentManualColor,
        palette: currentPalette,
        trippy: currentTrippy,
        subtle: currentSubtle,
        performanceMode: isPerfMode,
        pointSize: currentPointSize
      } = propsRef.current;

      // When not playing, clear and keep polling
      if (!currentIsPlaying) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctxRef.current = null;
        requestRef.current = requestAnimationFrame(draw);
        return;
      }

      // Performance mode: throttle visuals to ~30fps
      if (isPerfMode && perfFrameRef.current++ % 2 !== 0) {
        requestRef.current = requestAnimationFrame(draw);
        return;
      }

      const frameNow = Date.now();

      const cw = canvas.width;
      const ch = canvas.height;
      const cwHalf = cw / 2;
      const chHalf = ch / 2;

      // Trail effect — fade previous frame
      if (isPerfMode) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.fillRect(0, 0, cw, ch);
      } else {
        ctx.save();
        ctx.globalCompositeOperation = 'source-over';
        const trailAlpha = 0.88 - (currentTrippy * 0.1) + (currentSubtle * 0.05);
        ctx.globalAlpha = Math.max(0.6, Math.min(0.95, trailAlpha));
        ctx.translate(cwHalf, chHalf);
        const rotation = 0.002 + (currentTrippy * 0.02);
        ctx.rotate(rotation);
        const scale = 1.005 + (currentTrippy * 0.01);
        ctx.scale(scale, scale);
        ctx.drawImage(canvas, -cwHalf, -chHalf);
        ctx.restore();

        if (currentTrippy > 0.01 && Math.random() > (0.98 - currentTrippy * 0.05)) {
          ctx.clearRect(0, Math.random() * ch, cw, 20 * (1 + currentTrippy));
        }
      }

      const rawPoints = pointsRef.current || [];
      if (rawPoints.length === 0) {
        requestRef.current = requestAnimationFrame(draw);
        return;
      }

      // Clamp all points to the visible canvas area
      const points = rawPoints.map(p => ({
        x: Math.max(0, Math.min(cw, p.x)),
        y: Math.max(0, Math.min(ch, p.y))
      }));

      // --- Draw connecting lines (MUCH more visible) ---
      if (points.length >= 2) {
        ctx.lineWidth = Math.max(2, 2 + (currentTrippy * 3));
        ctx.globalAlpha = Math.max(0.6, currentTransparency);

        let baseColor = 'rgba(255, 255, 255, 0.7)';
        if (currentColorMode === 'manual') {
          baseColor = currentManualColor;
        } else if ((currentColorMode === 'preset' || currentColorMode === 'auto') && currentPalette.length > 0) {
          baseColor = currentPalette[0];
        }

        if (isPerfMode) {
          ctx.beginPath();
          points.forEach((p, i) => {
            if (i === 0) ctx.moveTo(p.x, p.y);
            else ctx.lineTo(p.x, p.y);
          });
          ctx.strokeStyle = baseColor;
          ctx.shadowColor = 'rgba(255, 255, 255, 0.5)';
          ctx.shadowBlur = 6;
          ctx.stroke();
          ctx.shadowBlur = 0;
        } else {
          // Chromatic aberration (3-pass) with stronger colors
          let baseColors = ['rgba(255, 50, 50, 0.5)', 'rgba(255, 255, 255, 0.7)', 'rgba(50, 200, 255, 0.5)'];
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

          const offset = 3 * (1 + currentTrippy * 2);
          ctx.shadowColor = 'rgba(255, 100, 100, 0.4)';
          ctx.shadowBlur = 8;
          ctx.save(); ctx.translate(-offset, 0); ctx.strokeStyle = baseColors[0]; ctx.stroke(path); ctx.restore();
          ctx.shadowColor = 'rgba(255, 255, 255, 0.5)';
          ctx.strokeStyle = baseColors[1]; ctx.stroke(path);
          ctx.shadowColor = 'rgba(100, 200, 255, 0.4)';
          ctx.save(); ctx.translate(offset, 0); ctx.strokeStyle = baseColors[2]; ctx.stroke(path); ctx.restore();
          ctx.shadowBlur = 0;
        }
      }

      // --- Draw points (MUCH larger and brighter) ---
      for (let i = 0; i < points.length; i++) {
        const p = points[i];
        let pointColor: string;

        if (currentColorMode === 'manual') {
          pointColor = currentManualColor;
        } else if ((currentColorMode === 'preset' || currentColorMode === 'auto') && currentPalette.length > 0) {
          pointColor = currentPalette[i % currentPalette.length];
        } else {
          const hue = (frameNow / 20 + i * 20) % 360;
          pointColor = `hsla(${hue}, 100%, 70%, 0.9)`;
        }

        // Minimum visible radius of 4px, scales with pointSize
        const baseRadius = Math.max(4, currentPointSize * 1.5);

        // Outer glow — always visible, bigger
        const glowPulse = 1 + Math.sin(frameNow / 200 + i) * 0.3;
        const glowRadius = baseRadius * 3 * glowPulse * (1 + currentTrippy);
        ctx.fillStyle = pointColor;
        ctx.globalAlpha = 0.25;
        ctx.beginPath();
        ctx.arc(p.x, p.y, glowRadius, 0, Math.PI * 2);
        ctx.fill();

        if (!isPerfMode) {
          // Mid glow ring
          ctx.globalAlpha = 0.4;
          ctx.beginPath();
          ctx.arc(p.x, p.y, baseRadius * 2 * glowPulse, 0, Math.PI * 2);
          ctx.fill();
        }

        // Core point — bright white, always visible
        ctx.fillStyle = 'white';
        ctx.globalAlpha = 1;
        ctx.shadowColor = pointColor;
        ctx.shadowBlur = isPerfMode ? 8 : 15;
        ctx.beginPath();
        const coreRadius = isPerfMode ? baseRadius : baseRadius * (1 + currentTrippy * 0.5);
        ctx.arc(p.x, p.y, coreRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Energy lines — longer and more visible
        if (!isPerfMode) {
          ctx.strokeStyle = pointColor;
          ctx.lineWidth = Math.max(1.5, 1.5 + currentTrippy);
          ctx.globalAlpha = 0.7;
          const angle = (frameNow / (300 - currentTrippy * 200)) + (i * Math.PI * 2 / points.length);
          const length = (25 + Math.sin(frameNow / 100 + i) * 15) * (1 + currentTrippy * 2);
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x + Math.cos(angle) * length, p.y + Math.sin(angle) * length);
          ctx.stroke();

          if (currentTrippy > 0.2) {
            ctx.globalAlpha = 0.4;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p.x + Math.cos(-angle * 1.5) * length * 0.7, p.y + Math.sin(-angle * 1.5) * length * 0.7);
            ctx.stroke();
          }
        }
      }

      ctx.globalAlpha = 1;
      requestRef.current = requestAnimationFrame(draw);
    };

    // Start the loop immediately on mount
    requestRef.current = requestAnimationFrame(draw);

    return () => {
      alive = false;
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Mount-only: all prop changes read via propsRef

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="absolute inset-0 w-full h-full z-10 pointer-events-none mix-blend-screen"
      style={{ filter: performanceMode ? undefined : 'drop-shadow(0 0 12px rgba(255,255,255,0.6))' }}
    />
  );
};

export default ScanningVisuals;
