'use client';

import React, { useState, useEffect, useMemo } from 'react';
import MapViewer from '@/components/MapViewer';
import VectorFlowLayer from '@/components/VectorFlowLayer';
import DashboardOverlay from '@/components/DashboardOverlay';
import { 
  fetchAllSightings, 
  fetchAllPlasticZones, 
  fetchImpactAnalysis, 
  fetchOceanCurrentsGrid,
  ImpactMetrics 
} from '@/services/api';

const INITIAL_VIEW_STATE = {
  longitude: -140.0,
  latitude: 25.0,
  zoom: 1.8,
  pitch: 0,
  bearing: 0,
};

export default function Home() {
  const [sightingsData, setSightingsData] = useState<any>(null);
  const [plasticZonesData, setPlasticZonesData] = useState<any>(null);
  const [vectorGrid, setVectorGrid] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<ImpactMetrics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [forecastDays, setForecastDays] = useState<number>(0);
  
  // ViewState compartido entre DeckGL/Mapbox y la capa de vectores de corrientes
  const [viewState, setViewState] = useState<any>(INITIAL_VIEW_STATE);

  useEffect(() => {
    fetchOceanCurrentsGrid()
      .then((res) => {
        if (res?.vectors) {
          setVectorGrid(res.vectors);
        }
      })
      .catch((err) => {
        console.warn('Ocean vector grid layer unavailable, skipping stream overlay:', err);
      });
  }, []);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [sightings, plastics, impactRes] = await Promise.all([
          fetchAllSightings(),
          fetchAllPlasticZones(forecastDays),
          fetchImpactAnalysis(forecastDays, selectedCategory),
        ]);

        setSightingsData(sightings);
        setPlasticZonesData(plastics);

        const impactMetrics = (impactRes as any)?.metrics || impactRes;
        setMetrics(impactMetrics);
      } catch (err) {
        console.error('Error loading geospatial layers:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [forecastDays, selectedCategory]);

  const filteredSightings = useMemo(() => {
    if (!sightingsData || !sightingsData.features) return null;
    if (selectedCategory === 'ALL') return sightingsData;

    return {
      ...sightingsData,
      features: sightingsData.features.filter((f: any) => {
        const cat = f.properties?.category?.toLowerCase() || '';
        const target = selectedCategory.toLowerCase();
        
        if (target === 'fish') {
          return cat.includes('fish') || cat.includes('shark') || cat.includes('pelagic');
        }
        return cat.includes(target);
      }),
    };
  }, [sightingsData, selectedCategory]);

  return (
    <main style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden', backgroundColor: '#020617' }}>
      {/* 1. DeckGL + Mapbox Base Layer */}
      <MapViewer
        sightingsData={filteredSightings}
        plasticZonesData={plasticZonesData}
        selectedCategory={selectedCategory}
        viewState={viewState}
        onViewStateChange={setViewState}
      />

      {/* 2. Capa de corrientes vinculada al ViewState del mapa */}
      {vectorGrid.length > 0 && (
        <VectorFlowLayer vectorData={vectorGrid} viewState={viewState} />
      )}

      {/* 3. Panel de control adaptable a pantallas móviles */}
      <DashboardOverlay
        metrics={metrics}
        loading={loading}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        forecastDays={forecastDays}
        onForecastChange={setForecastDays}
      />
    </main>
  );
}