'use client';

import React, { useEffect, useRef } from 'react';

interface VectorPoint {
  lon: number;
  lat: number;
  u: number;
  v: number;
}

interface VectorFlowLayerProps {
  vectorData: VectorPoint[];
  maxParticles?: number;
  speedFactor?: number;
}

interface Particle {
  x: number;
  y: number;
  age: number;
  maxAge: number;
}

export default function VectorFlowLayer({
  vectorData,
  maxParticles = 2500,
  speedFactor = 0.4,
}: VectorFlowLayerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !vectorData || vectorData.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    
    // Adjust canvas resolution dynamically to full browser viewport
    const width = (canvas.width = window.innerWidth);
    const height = (canvas.height = window.innerHeight);

    // Initialize random particle field pool
    const particles: Particle[] = Array.from({ length: maxParticles }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      age: Math.floor(Math.random() * 80),
      maxAge: 80,
    }));

    // Find closest spatial grid cell vector (u, v) for screen point
    const getVector = (screenX: number, screenY: number) => {
      const lon = (screenX / width) * 360 - 180;
      const lat = 90 - (screenY / height) * 180;

      let closestU = 0.2;
      let closestV = 0.05;
      let minDistance = Infinity;

      // Sample stride for performance
      for (let i = 0; i < vectorData.length; i += 3) {
        const pt = vectorData[i];
        const dx = pt.lon - lon;
        const dy = pt.lat - lat;
        const dist = dx * dx + dy * dy;

        if (dist < minDistance) {
          minDistance = dist;
          closestU = pt.u;
          closestV = pt.v;
        }
      }

      return { u: closestU, v: closestV };
    };

    const render = () => {
      // Create trailing dynamic fade out
      ctx.fillStyle = 'rgba(2, 6, 23, 0.92)';
      ctx.globalCompositeOperation = 'destination-in';
      ctx.fillRect(0, 0, width, height);

      ctx.globalCompositeOperation = 'source-over';
      ctx.lineWidth = 1.4;
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.75)'; // Electric Cyan ocean stream lines

      ctx.beginPath();
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const vec = getVector(p.x, p.y);

        const nextX = p.x + vec.u * speedFactor * 12;
        const nextY = p.y - vec.v * speedFactor * 12;

        ctx.moveTo(p.x, p.y);
        ctx.lineTo(nextX, nextY);

        p.x = nextX;
        p.y = nextY;
        p.age++;

        // Reset dead or out-of-bounds particles
        if (p.age >= p.maxAge || p.x < 0 || p.x > width || p.y < 0 || p.y > height) {
          p.x = Math.random() * width;
          p.y = Math.random() * height;
          p.age = 0;
        }
      }
      ctx.stroke();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animationFrameId);
  }, [vectorData, maxParticles, speedFactor]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 10,
      }}
    />
  );
}