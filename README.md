# Eco-Impact-Predictor
An advanced oceanographic spatial analytics platform and interactive WebGL dashboard designed to quantify, model, and visualize real-time spatial overlaps between marine wildlife migration corridors and high-density microplastic sampling zones driven by ocean surface currents.

## Technical Overview & Core Value
Eco-Impact Predictor ingests real-time marine species occurrence telemetry from **OBIS** (Ocean Biodiversity Information System) alongside global surface microplastic sampling data from **The Ocean Cleanup**, **GBIF**, and **NOAA NCEI**. It executes high-performance spatial containment queries using PostGIS to compute live Exposure Risk Indices for vulnerable marine taxa.

### Key Architecture Highlights
1. **Satellite-Driven Drift Simulation Engine:** Applies advection dynamics using real-world surface ocean current vectors ($u$: East/West, $v$: North/South in m/s) fetched directly from **NOAA OSCAR** and **Copernicus Marine Service** satellite datasets.
2. **GPU-Accelerated WebGL Visualization:** Renders high-density microplastic concentration fields at 60 FPS using Deck.gl (`HeatmapLayer` and `GeoJsonLayer`) and Mapbox GL JS.
3. **Real-Time Spatial Intersection Engine:** Executes optimized PostGIS spatial queries (`ST_Intersects`, bounding-box pre-filtering) to calculate the percentage of marine species falling inside high-risk pollution zones.
4. **Glassmorphic Interactive Inspector:** Offers detailed real-time hover tooltips and metric cards showing species taxonomy, particle density counts, and predicted forecast drift horizons.

## Local Deployment Guide

### Prerequisites
* Docker Desktop installed and running
* Mapbox Public API Token

### Step 1: Clone Repository & Configure Environment
Clone the repository and add your Mapbox access token to .env file inside /frontend:

```txt
    NEXT_PUBLIC_MAPBOX_TOKEN=XXXXXXXXXXXXXXXXXX
```

## Step 2: Build and Start Containers
From the project root directory, run:

```bash
    docker-compose up --build -d
```

### Step 3: Run Database Migrations
Apply database migrations to generate PostGIS tables and spatial indexes

```bash
    docker-compose exec backend python manage.py migrate
```

### Step 4: Run Ingestion Pipelines
Populate PostgreSQL with synthetic microplastic gyre polygons and live species telemetry from the public OBIS API:

```bash
    # Ingest live microplastic observations (The Ocean Cleanup / GBIF / NOAA)
    docker-compose exec backend python manage.py ingest_plastics

    # Ingest multi-species wildlife telemetry from OBIS
    docker-compose exec backend python manage.py ingest_obis
```

### Step 5: Access Dashboard & Endpoints
Open your browser and visit:
* Web Dashboard: http://localhost:3000   
* Analytics Overlap API: http://localhost:8000/api/impact-analysis/
* Sightings GeoJSON API: http://localhost:8000/api/sightings/
* Microplastic Density Zones GeoJSON API: http://localhost:8000/api/plastic-zones/

## API Endpoints Reference

### GET /api/impact-analysis/?forecast_days={days}&category={category}
Computes spatial intersection risk metrics and returns advected plastic positions:
* total_sightings_analyzed: Total wildlife telemetry points processed.
* sightings_in_high_risk_zones: Telemetry points falling inside active plastic zones.
* overall_species_risk_index_pct: Percentage of species exposed to high risk.  
* active_risk_zones: GeoJSON FeatureCollection of active/forecasted plastic zones.
* impacted_points: GeoJSON collection of impacted telemetry records.  

### GET /api/sightings/?category={category}
Returns a GeoJSON FeatureCollection of wildlife telemetry points filtered by taxon category (Reptile, Mammal, Bird, Fish).

### GET /api/plastic-zones/?forecast_days={days}
Returns a GeoJSON FeatureCollection of microplastic concentration zones projected {days} into the future using real ocean surface current vectors.

## Future Steps
### Enhanced UI / UX & Professional Design System
- [X] Redefined Design System: Modern Glassmorphic UI with customizable theme toggles (Dark/Ocean mode).
- [x] GPU Heatmap & Density Layering: Replaced rigid bounding boxes with continuous GPU-accelerated HeatmapLayer gradients.
- [x] Interactive Inspection Inspector: Hover tooltips displaying taxonomy, density indices, and forecast horizons.
- [ ] Ocean Vector Flow Layer: Integrate an animated particle flow layer (Windy/Nullschool style) rendering surface ocean currents ($u, v$) in real time.

### Real-World Data & Physics Integration
- [X] Live Microplastic Ingestion Pipeline: Multi-source ingestion pulling real sampling records from The Ocean Cleanup, GBIF, and NOAA NCEI datasets.
- [X] Satellite Current Advection Model: Advection model utilizing real $u, v$ ocean current vectors from NOAA OSCAR / Copernicus Marine Service.
- [ ] SST & Climate Layer Integration: Overlay Sea Surface Temperature (SST) satellite data to correlate thermal stress with marine migration shifts and plastic accumulation.

### Automation, Scalability & Reporting
- [ ] Automated Ingestion Tasks: Implement Celery & Redis background workers to periodically update satellite current vectors and species telemetry.
- [ ] MVT Vector Tile Streaming: Stream millions of spatial points using Mapbox Vector Tiles (MVT / Protobuf) and Redis spatial caching.
- [ ] Automated Impact PDF Report Generator: One-click export feature generating downloadable PDF executive summary reports with risk breakdowns per species category.

### Enterprise Roadmap & Advanced Capabilities

- [ ] **Animated Vector Field Layer (Windy-style Flow):** Render live 2D/3D ocean current velocity vectors ($u, v$) using WebGL shaders and Deck.gl particle dynamics.
- [ ] **Graph Neural Network (GNN) Drift Forecasting:** Integrate PyTorch Geometric (PyG) models trained on NOAA Global Drifter data to predict non-linear microplastic dispersion up to 90 days ahead.
- [ ] **MVT Tile Streaming Server:** Implement PostGIS `ST_AsMVT` protobuf tile streaming powered by Redis spatial caching to support rendering over 1,000,000 spatial points seamlessly.
- [ ] **3D Submarine Bathymetry & Environmental Layers:** Render 3D seabed elevation alongside satellite-derived Sea Surface Temperature (SST) and Chlorophyll-a concentration layers.
- [ ] **Automated Environmental Impact PDF Generator:** One-click automated report engine outputting institutional-grade PDF summary assessments with risk heatmaps and species vulnerability profiles.
- [ ] **AI Conversational Spatial Agent:** Natural language GIS query interface allowing users to ask natural questions like *"Find critical overlap bottlenecks for leatherback turtles in the next 30 days"*.