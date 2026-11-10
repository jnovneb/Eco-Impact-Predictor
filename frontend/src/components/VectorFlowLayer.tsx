'use client';

import React, { useEffect, useRef } from 'react';
import { WebMercatorViewport } from '@deck.gl/core';

interface VectorPoint {
  lon: number;
  lat: number;
  u: number;
  v: number;
}

interface VectorFlowLayerProps {
  vectorData: VectorPoint[];
  viewState: {
    longitude: number;
    latitude: number;
    zoom: number;
    pitch?: number;
    bearing?: number;
  };
  maxParticles?: number;
  speedFactor?: number;
}

interface GeoParticle {
  lon: number;
  lat: number;
  age: number;
  maxAge: number;
}

export default function VectorFlowLayer({
  vectorData,
  viewState,
  maxParticles = 2000,
  speedFactor = 0.04,
}: VectorFlowLayerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !vectorData || vectorData.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const width = (canvas.width = window.innerWidth);
    const height = (canvas.height = window.innerHeight);

    // Generar proyección espacial Web Mercator del viewport actual
    const viewport = new WebMercatorViewport({
      width,
      height,
      longitude: viewState.longitude,
      latitude: viewState.latitude,
      zoom: viewState.zoom,
      pitch: viewState.pitch || 0,
      bearing: viewState.bearing || 0,
    });

    const bounds = viewport.getBounds();
    const minLon = bounds[0];
    const minLat = bounds[1];
    const maxLon = bounds[2];
    const maxLat = bounds[3];

    // Inicializar pool de partículas en coordenadas geográficas fijas
    const particles: GeoParticle[] = Array.from({ length: maxParticles }, () => ({
      lon: minLon + Math.random() * (maxLon - minLon),
      lat: minLat + Math.random() * (maxLat - minLat),
      age: Math.floor(Math.random() * 80),
      maxAge: 80,
    }));

    const getVector = (geoLon: number, geoLat: number) => {
      let closestU = 0.2;
      let closestV = 0.05;
      let minDistance = Infinity;

      for (let i = 0; i < vectorData.length; i += 2) {
        const pt = vectorData[i];
        const dx = pt.lon - geoLon;
        const dy = pt.lat - geoLat;
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
      const currentViewport = new WebMercatorViewport({
        width: canvas.width,
        height: canvas.height,
        longitude: viewState.longitude,
        latitude: viewState.latitude,
        zoom: viewState.zoom,
        pitch: viewState.pitch || 0,
        bearing: viewState.bearing || 0,
      });

      const currentBounds = currentViewport.getBounds();
      const cMinLon = currentBounds[0];
      const cMinLat = currentBounds[1];
      const cMaxLon = currentBounds[2];
      const cMaxLat = currentBounds[3];

      ctx.fillStyle = 'rgba(2, 6, 23, 0.90)';
      ctx.globalCompositeOperation = 'destination-in';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.globalCompositeOperation = 'source-over';
      ctx.lineWidth = 1.4;
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.8)';

      ctx.beginPath();
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Mapear coordenadas geográficas a píxeles de pantalla en tiempo real
        const [x, y] = currentViewport.project([p.lon, p.lat]);

        const vec = getVector(p.lon, p.lat);

        const nextLon = p.lon + vec.u * speedFactor;
        const nextLat = p.lat + vec.v * speedFactor;

        const [nextX, nextY] = currentViewport.project([nextLon, nextLat]);

        if (x >= 0 && x <= canvas.width && y >= 0 && y <= canvas.height) {
          ctx.moveTo(x, y);
          ctx.lineTo(nextX, nextY);
        }

        p.lon = nextLon;
        p.lat = nextLat;
        p.age++;

        // Reiniciar partículas fuera del campo visual actual
        if (
          p.age >= p.maxAge ||
          p.lon < cMinLon ||
          p.lon > cMaxLon ||
          p.lat < cMinLat ||
          p.lat > cMaxLat
        ) {
          p.lon = cMinLon + Math.random() * (cMaxLon - cMinLon);
          p.lat = cMinLat + Math.random() * (cMaxLat - cMinLat);
          p.age = 0;
        }
      }
      ctx.stroke();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animationFrameId);
  }, [vectorData, viewState, maxParticles, speedFactor]);

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