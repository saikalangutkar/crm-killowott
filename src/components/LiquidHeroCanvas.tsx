"use client";

import React, { useRef, useEffect, useState } from "react";
import { ASSETS } from "@/lib/assets";

interface LiquidHeroCanvasProps {
  className?: string;
}

export function LiquidHeroCanvas({ className = "" }: LiquidHeroCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Check reduced motion
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  useEffect(() => {
    if (prefersReducedMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Offscreen mask canvas
    const maskCanvas = document.createElement("canvas");
    const maskCtx = maskCanvas.getContext("2d");
    if (!maskCtx) return;

    const revealImg = new Image();
    revealImg.src = ASSETS.heroReveal;

    let animationFrameId: number;
    let width = 0;
    let height = 0;
    let dpr = 1;

    // Pointer trail positions
    interface Point {
      x: number;
      y: number;
      age: number;
    }
    const points: Point[] = [];

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      maskCanvas.width = canvas.width;
      maskCanvas.height = canvas.height;

      ctx.scale(dpr, dpr);
      maskCtx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener("resize", resize);

    const handlePointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if (x >= 0 && x <= width && y >= 0 && y <= height) {
        points.push({ x, y, age: 0 });
        if (points.length > 40) points.shift();
      }
    };

    window.addEventListener("pointermove", handlePointerMove);

    // Brush settings
    const brushRadius = 143;
    const decay = 0.016; // Decay per frame

    const draw = () => {
      // 1. Decay the offscreen mask using destination-out fade
      maskCtx.globalCompositeOperation = "destination-out";
      maskCtx.fillStyle = `rgba(0, 0, 0, ${decay})`;
      maskCtx.fillRect(0, 0, width, height);

      // 2. Draw new pointer stamps on offscreen mask with radial gradient brush
      maskCtx.globalCompositeOperation = "source-over";
      for (const p of points) {
        const gradient = maskCtx.createRadialGradient(p.x, p.y, 0, p.x, p.y, brushRadius);
        // radial-gradient brush (white at 1, .82 and 0 at stops 0, .55 and 1)
        gradient.addColorStop(0, "rgba(255, 255, 255, 1)");
        gradient.addColorStop(0.55, "rgba(255, 255, 255, 0.82)");
        gradient.addColorStop(1, "rgba(255, 255, 255, 0)");

        maskCtx.fillStyle = gradient;
        maskCtx.beginPath();
        maskCtx.arc(p.x, p.y, brushRadius, 0, Math.PI * 2);
        maskCtx.fill();

        p.age++;
      }

      // 3. Render onto main canvas
      ctx.clearRect(0, 0, width, height);

      if (revealImg.complete && revealImg.naturalWidth > 0) {
        // Draw the reveal image covering canvas
        ctx.save();
        ctx.globalCompositeOperation = "source-over";

        // Calculate aspect fill for reveal image
        const imgRatio = revealImg.naturalWidth / revealImg.naturalHeight;
        const canvasRatio = width / height;
        let dw = width;
        let dh = height;
        let dx = 0;
        let dy = 0;

        if (canvasRatio > imgRatio) {
          dh = width / imgRatio;
          dy = (height - dh) / 2;
        } else {
          dw = height * imgRatio;
          dx = (width - dw) / 2;
        }

        ctx.drawImage(revealImg, dx, dy, dw, dh);

        // Apply mask: destination-in keeps reveal image only where mask is drawn
        ctx.globalCompositeOperation = "destination-in";
        ctx.drawImage(maskCanvas, 0, 0, width, height);
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", handlePointerMove);
    };
  }, [prefersReducedMotion]);

  if (prefersReducedMotion) {
    return null;
  }

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 pointer-events-none select-none z-10 ${className}`}
      aria-hidden="true"
    />
  );
}
