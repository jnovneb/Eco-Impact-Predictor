# Eco-Impact-Predictor
An oceanographic spatial analytics platform and interactive WebGL dashboard designed to quantify and visualize real-time spatial overlaps between marine wildlife migration corridors and high-density ocean microplastic gyres.

## Technical Overview & Core Value
Eco-Impact Predictor processes marine species telemetry occurrence data from public oceanographic APIs (such as OBIS) and executes spatial containment queries against modeled ocean microplastic accumulation zones using PostGIS spatial indexing.

### Key Architecture Highlights
1. Real-Time Spatial Containment Engine: Evaluates point-in-polygon spatial intersections between wildlife movement telemetry points and microplastic convergence polygons using PostGIS GEOS functions (ST_Intersects).
2. GPU-Accelerated 3D Map Visualization: Renders spatial data layers at 60 FPS using Deck.gl and Mapbox GL JS.
3. Multi-Species Categorical Filtering: Color-codes species categories (Sea Turtles, Cetaceans/Whales, Pelagic Birds) and filters telemetry layers dynamically on the client side.
4. Interactive Hover Inspector: Provides instant context tooltips containing taxonomy data, timestamps, coordinates, and gyre density indices.

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
    # Ingest microplastic density polygons
    docker-compose exec backend python manage.py ingest_plastics

    # Ingest multi-species wildlife telemetry data
    docker-compose exec backend python manage.py ingest_obis
```

### Step 5: Access Dashboard & Endpoints
Open your browser and visit:
* Web Dashboard: http://localhost:3000   
* Analytics Overlap API: http://localhost:8000/api/impact-analysis/
* Sightings GeoJSON API: http://localhost:8000/api/sightings/
* Plastic Gyres GeoJSON API: http://localhost:8000/api/plastic-zones/

## API Endpoints Reference

### GET /api/impact-analysis/
Computes spatial containment and returns spatial overlap metrics:
* total_sightings_analyzed: Total telemetry points processed.
* sightings_in_high_risk_zones: Points falling inside microplastic gyres.   
* overall_species_risk_index_pct: Exposure risk percentage.   
* active_risk_zones: GeoJSON collection of high-density plastic polygons.   
* impacted_points: GeoJSON collection of impacted telemetry records.  

### GET /api/sightings/
Returns a GeoJSON FeatureCollection containing all recorded wildlife telemetry points with species metadata.

### GET /api/plastic-zones/
Returns a GeoJSON FeatureCollection containing all active ocean microplastic concentration polygons.

## Future Steps
### Enhanced UI / UX & Professional Design System
- [ ] Redefined Design System: Upgrade the layout using CSS modules or custom Tailwinf components with polished Glassmorphism effects, customizable theme toggles (Dark/Ocean mode), and responsive mobile support.
- [ ] Timeline Slider & Historical Playback: Introduce a time-slider widget allowing users to scrub back and forth through historical telemetry data over a 12-month period.
- [ ] Interactive Tooltip & Inspector Panel: Resolve hover event handling on Deck.gl layers to show detailed inspector cards when hovering over points or polygons (displaying scientific species metadata, exact coordinates, recording date, and microplastic particle density).

### Integration of Real-World Datasets
- [ ] Live Microplastic Sensor Feeds: Integrate real oceanographic microplastic data from the NOAA Marine Debris Program, Copernicus Marine Service, or Global Plastic Watch satellite detections instead of synthetic polygon models.

- [ ] Expanded Marine Species Telemetry: Expand the OBIS/GBIF ingestion pipeline to cover hundreds of marine species across multiple categories (e.g., Sharks, Sea Lions, Tuna, Seabirds) with tens of thousands of data points.

### Real-Time Automation & Performance
- [ ] Automated Data Ingestion Jobs: Set up periodic tasks using Celery and Redis to automatically query external oceanographic APIs and refresh microplastic density maps and wildlife tracking records.

- [ ] Geospatial Query Optimization: Implement vector tile streaming (MVT / Protobuf) and server-side spatial caching with PostGIS and Redis to support millions of geographic features without dropping frame rates.

### Advanced Analytics & Reporting
- [ ] Species-Specific Risk Profiles: Allow users to generate and download PDF impact reports detailing risk exposure percentages and high-risk migration bottlenecks per species category.

- [ ] Predictive ML Movement Models: Integrate AI-driven motion prediction (e.g., Lagrangian particle tracking models) to forecast where floating debris will move over the next 30 days relative to active animal trajectories.