'use client';

import React, { useState } from 'react';
import DeckGL from '@deck.gl/react/typed';
import { Map } from 'react-map-gl';
import { GeoJsonLayer, ScatterplotLayer } from '@deck.gl/layers/typed';

const INITIAL_VIEW_STATE = {
  longitude: -140.0,
  latitude: 25.0,
  zoom: 1.8,
  pitch: 0,
  bearing: 0
};

interface MapViewerProps {
  sightingsData: any;
  plasticZonesData: any;
  selectedCategory: string;
}

const CATEGORY_COLORS: Record<string, [number, number, number]> = {
  Reptile: [16, 185, 129],   // Emerald Green
  Mammal: [59, 130, 246],    // Bright Blue
  Bird: [245, 158, 11],      // Amber
  Fish: [168, 85, 247]       // Purple
};

export default function MapViewer({ sightingsData, plasticZonesData, selectedCategory }: MapViewerProps) {
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';
  const [hoverInfo, setHoverInfo] = useState<any>(null);

  const filteredFeatures = sightingsData?.features?.filter((f: any) => {
    if (selectedCategory === 'ALL') return true;
    return f.properties.category === selectedCategory;
  }) || [];

  const layers = [
    new GeoJsonLayer({
      id: 'plastic-zones-layer',
      data: plasticZonesData,
      filled: true,
      stroked: true,
      getFillColor: [239, 68, 68, 140],
      getLineColor: [220, 38, 38, 255],
      getLineWidth: 2,
      pickable: true,
      onHover: info => setHoverInfo(info)
    }),
    new ScatterplotLayer({
      id: 'sightings-layer',
      data: filteredFeatures,
      getPosition: (d: any) => d.geometry.coordinates,
      getFillColor: (d: any) => {
        const cat = d.properties.category || 'Reptile';
        const rgb = CATEGORY_COLORS[cat] || [16, 185, 129];
        return [...rgb, 220];
      },
      getRadius: 30000,
      radiusMinPixels: 4,
      radiusMaxPixels: 10,
      pickable: true,
      onHover: info => setHoverInfo(info)
    })
  ];

  return (
    <div className="absolute inset-0 w-full h-full bg-slate-950">
      <DeckGL
        initialViewState={INITIAL_VIEW_STATE}
        controller={true}
        layers={layers}
      >
        <Map
          mapboxAccessToken={mapboxToken}
          mapStyle="mapbox://styles/mapbox/dark-v11"
          projection="mercator"
          reuseMaps
        />
      </DeckGL>

      {/* Tooltip en Hover */}
      {hoverInfo?.object && (
        <div
          className="absolute z-50 p-3 bg-slate-900/95 border border-slate-700 text-white text-xs rounded-lg shadow-xl pointer-events-none backdrop-blur-md"
          style={{ left: hoverInfo.x + 12, top: hoverInfo.y + 12 }}
        >
          {hoverInfo.layer.id === 'sightings-layer' ? (
            <div>
              <p className="font-bold text-teal-400">{hoverInfo.object.properties.common_name || hoverInfo.object.properties.species_name}</p>
              <p className="text-slate-300 italic">{hoverInfo.object.properties.species_name}</p>
              <p className="text-slate-400 mt-1">Categoría: <span className="text-slate-200">{hoverInfo.object.properties.category}</span></p>
              <p className="text-slate-400">Fecha: <span className="text-slate-200">{hoverInfo.object.properties.timestamp ? new Date(hoverInfo.object.properties.timestamp).toLocaleDateString() : 'N/A'}</span></p>
            </div>
          ) : (
            <div>
              <p className="font-bold text-rose-400">Giro de Plásticos</p>
              <p className="text-slate-300">Densidad: {hoverInfo.object.properties.density_index} part/km²</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}