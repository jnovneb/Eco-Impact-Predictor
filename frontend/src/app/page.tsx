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

export default function Home() {
  const [sightingsData, setSightingsData] = useState<any>(null);
  const [plasticZonesData, setPlasticZonesData] = useState<any>(null);
  const [vectorGrid, setVectorGrid] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<ImpactMetrics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [forecastDays, setForecastDays] = useState<number>(0);

  // Fetch ocean current velocity vector grid using api.ts service wrapper
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

  // Primary geospatial telemetry & impact analysis ingestion pipeline
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

  // Resilient species telemetry filtering
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
      {/* 1. Primary Deck.gl & Mapbox Base Layer */}
      <MapViewer
        sightingsData={filteredSightings}
        plasticZonesData={plasticZonesData}
        selectedCategory={selectedCategory}
      />

      {/* 2. Real-Time Ocean Current Vector Flow Overlay Layer */}
      {vectorGrid.length > 0 && (
        <VectorFlowLayer vectorData={vectorGrid} />
      )}

      {/* 3. Interactive Analytics HUD & Inspector Panel */}
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