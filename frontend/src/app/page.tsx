'use client';

import React, { useEffect, useState } from 'react';
import MapViewer from '../components/MapViewer';
import DashboardOverlay from '../components/DashboardOverlay';
import { fetchImpactAnalysis, fetchAllSightings, fetchAllPlasticZones, ImpactMetrics } from '../services/api';

export default function Home() {
  const [metrics, setMetrics] = useState<ImpactMetrics | null>(null);
  const [sightings, setSightings] = useState<any>(null);
  const [plasticZones, setPlasticZones] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [impactData, sightingsData, zonesData] = await Promise.all([
          fetchImpactAnalysis(),
          fetchAllSightings(),
          fetchAllPlasticZones()
        ]);

        setMetrics(impactData.metrics);
        setSightings(sightingsData);
        setPlasticZones(zonesData);
      } catch (error) {
        console.error('Error fetching geospatial data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-slate-950">
      <DashboardOverlay
        metrics={metrics}
        loading={loading}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />
      <MapViewer
        sightingsData={sightings}
        plasticZonesData={plasticZones}
        selectedCategory={selectedCategory}
      />
    </main>
  );
}