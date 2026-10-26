'use client';

import React, { useState, useEffect } from 'react';
import MapViewer from '@/components/MapViewer';
import DashboardOverlay from '@/components/DashboardOverlay';
import { 
  fetchAllSightings, 
  fetchAllPlasticZones, 
  fetchImpactAnalysis, 
  ImpactMetrics 
} from '@/services/api';

export default function Home() {
  const [sightingsData, setSightingsData] = useState<any>(null);
  const [plasticZonesData, setPlasticZonesData] = useState<any>(null);
  const [metrics, setMetrics] = useState<ImpactMetrics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [forecastDays, setForecastDays] = useState<number>(0);

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

  // Filtrado resiliente de categorías para la capa de avistamientos
  const filteredSightings = React.useMemo(() => {
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
    <main style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <MapViewer
        sightingsData={filteredSightings}
        plasticZonesData={plasticZonesData}
        selectedCategory={selectedCategory}
      />
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