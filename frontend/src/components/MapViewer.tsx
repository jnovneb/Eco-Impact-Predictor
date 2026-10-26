'use client';

import React, { useState, useEffect, useMemo } from 'react';
import DeckGL from '@deck.gl/react';
import { Map } from 'react-map-gl';
import { ScatterplotLayer } from '@deck.gl/layers';
import { HeatmapLayer } from '@deck.gl/aggregation-layers';
import { useTheme } from '@/context/ThemeContext';

const INITIAL_VIEW_STATE = {
  longitude: -140.0,
  latitude: 25.0,
  zoom: 1.8,
  pitch: 0,
  bearing: 0,
};

interface MapViewerProps {
  sightingsData: any;
  plasticZonesData: any;
  selectedCategory?: string;
}

const CATEGORY_COLORS: Record<string, [number, number, number]> = {
  Reptile: [16, 185, 129],  // Emerald Green
  Mammal: [59, 130, 246],   // Bright Blue
  Bird: [245, 158, 11],     // Amber
  Fish: [168, 85, 247],     // Purple
};

export default function MapViewer({ sightingsData, plasticZonesData, selectedCategory = 'ALL' }: MapViewerProps) {
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';
  const [hoverInfo, setHoverInfo] = useState<any>(null);
  const [isWebGlSupported, setIsWebGlSupported] = useState<boolean>(true);
  const { theme } = useTheme();

  // Validate browser WebGL acceleration context
  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl2') || canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) {
        setIsWebGlSupported(false);
      }
    } catch (e) {
      setIsWebGlSupported(false);
    }
  }, []);

  const mapStyle = theme === 'ocean'
    ? 'mapbox://styles/mapbox/navigation-night-v1'
    : 'mapbox://styles/mapbox/dark-v11';

  // Extract microplastic centroid points for continuous HeatmapLayer GPU aggregation
  const plasticPoints = useMemo(() => {
    const features = plasticZonesData?.features || [];
    return features.map((f: any) => {
      const geom = f.geometry;
      let coords = [0, 0];
      if (geom?.type === 'Point') {
        coords = geom.coordinates;
      } else if (geom?.type === 'Polygon' && geom.coordinates?.[0]) {
        const ring = geom.coordinates[0];
        const avgX = ring.reduce((acc: number, pt: number[]) => acc + pt[0], 0) / ring.length;
        const avgY = ring.reduce((acc: number, pt: number[]) => acc + pt[1], 0) / ring.length;
        coords = [avgX, avgY];
      }
      return {
        coordinates: coords,
        weight: f.properties?.density_index || 50,
      };
    });
  }, [plasticZonesData]);

  const features = sightingsData?.features || [];
  const filteredFeatures = useMemo(() => {
    if (selectedCategory === 'ALL') return features;

    const target = selectedCategory.toLowerCase();
    return features.filter((f: any) => {
      const cat = f.properties?.category?.toLowerCase() || '';
      if (target === 'fish') {
        return cat.includes('fish') || cat.includes('shark') || cat.includes('pelagic');
      }
      return cat.includes(target);
    });
  }, [features, selectedCategory]);

  const layers = [
    // Layer 1: GPU-Accelerated Microplastic Density Heatmap Layer
    new HeatmapLayer({
      id: 'plastic-heatmap-layer',
      data: plasticPoints,
      getPosition: (d: any) => d.coordinates,
      getWeight: (d: any) => d.weight,
      radiusPixels: 50,
      intensity: 1.8,
      threshold: 0.03,
      colorRange: [
        [34, 211, 238, 40],   // Cyan (Low Density)
        [251, 146, 60, 160],  // Orange (Medium Density)
        [244, 63, 94, 220],   // Crimson Red (High Density)
        [225, 29, 72, 255]    // Deep Magenta (Critical Gyre Area)
      ],
      updateTriggers: {
        getPosition: [plasticPoints],
        getWeight: [plasticPoints],
      }
    }),

    // Layer 2: Marine Telemetry Sightings Layer
    new ScatterplotLayer({
      id: 'sightings-layer',
      data: filteredFeatures,
      getPosition: (d: any) => d.geometry.coordinates,
      getFillColor: (d: any) => {
        const cat = d.properties?.category || 'Reptile';
        const rgb = CATEGORY_COLORS[cat] || [168, 85, 247];
        return [...rgb, 230];
      },
      getRadius: 25000,
      radiusMinPixels: 4,
      radiusMaxPixels: 10,
      pickable: true,
      updateTriggers: {
        getPosition: [filteredFeatures],
        getFillColor: [filteredFeatures, selectedCategory],
      },
      onHover: info => setHoverInfo(info),
    }),
  ];

  if (!isWebGlSupported) {
    return (
      <div style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        backgroundColor: '#020617',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#f43f5e',
        textAlign: 'center',
        padding: '20px'
      }}>
        <div style={{
          backgroundColor: 'rgba(15, 23, 42, 0.9)',
          border: '1px solid #334155',
          padding: '24px 32px',
          borderRadius: '12px',
          maxWidth: '500px',
          backdropFilter: 'blur(12px)'
        }}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: 'bold' }}>
            WebGL Context Error
          </h3>
          <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8', lineHeight: '1.5' }}>
            WebGL initialization blocked by browser flags or hardware limits.
            <br />
            Open <code style={{ color: '#2dd4bf' }}>chrome://flags/#use-angle</code>, select <strong>OpenGL</strong> or <strong>D3D11 WARP</strong>, and relaunch.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', backgroundColor: '#020617' }}>
      <DeckGL
        initialViewState={INITIAL_VIEW_STATE}
        controller={true}
        layers={layers}
        glOptions={{
          webgl2: true,
          failIfMajorPerformanceCaveat: false,
        }}
        onError={(error) => {
          if (error?.message?.includes('WebGL') || error?.message?.includes('Context')) {
            setIsWebGlSupported(false);
          }
        }}
      >
        <Map
          mapboxAccessToken={mapboxToken}
          mapStyle={mapStyle}
          projection="mercator"
          reuseMaps
        />
      </DeckGL>

      {/* Glassmorphic Tooltip */}
      {hoverInfo?.object && (
        <div
          style={{
            position: 'absolute',
            zIndex: 9999999,
            pointerEvents: 'none',
            left: hoverInfo.x + 12,
            top: hoverInfo.y + 12,
            backgroundColor: 'rgba(15, 23, 42, 0.95)',
            border: '1px solid #334155',
            padding: '10px 14px',
            borderRadius: '10px',
            color: '#fff',
            fontSize: '12px',
            boxShadow: '0 10px 15px -3px rgba(0,0,0,0.5)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
          }}
        >
          <p style={{ margin: 0, fontWeight: 'bold', color: '#2dd4bf' }}>
            {hoverInfo.object.properties?.common_name || hoverInfo.object.properties?.species_name}
          </p>
          <p style={{ margin: '2px 0 6px 0', fontStyle: 'italic', color: '#94a3b8' }}>
            {hoverInfo.object.properties?.species_name}
          </p>
          <p style={{ margin: 0, color: '#cbd5e1' }}>
            Taxon: <strong style={{ color: '#fff' }}>{hoverInfo.object.properties?.category}</strong>
          </p>
        </div>
      )}
    </div>
  );
}