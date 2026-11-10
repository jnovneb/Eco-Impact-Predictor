from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.gis.geos import Polygon, MultiPolygon
from django.contrib.gis.db.models.functions import AsGeoJSON
import json

from .models import MarineSighting, MicroplasticDensityZone
from .serializers import MarineSightingSerializer, MicroplasticDensityZoneSerializer
from .services import fetch_live_noaa_plastics, get_ocean_currents_grid
from .predictor import predict_plastic_drift


def get_filtered_sightings_qs(selected_category):
    """Filtro reutilizable de categorías para el QuerySet de avistamientos."""
    qs = MarineSighting.objects.all()
    if selected_category and selected_category != 'ALL':
        target = selected_category.lower()
        if target == 'fish':
            qs = qs.filter(category__iexact='Fish')
        else:
            qs = qs.filter(category__icontains=target)
    return qs


class OceanCurrentsGridView(APIView):
    def get(self, request):
        data = get_ocean_currents_grid()
        return Response(data, status=status.HTTP_200_OK)


class EnvironmentalImpactAnalysisView(APIView):
    """
    Calcula el Exposure Risk Index delegando las intersecciones espaciales directamente a PostGIS.
    """
    def get(self, request):
        try:
            forecast_days = int(request.query_params.get('forecast_days', 0))
        except (ValueError, TypeError):
            forecast_days = 0

        selected_category = request.query_params.get('category', 'ALL')

        # 1. Obtener polígonos activos de plástico
        live_plastics = fetch_live_noaa_plastics()
        if forecast_days > 0:
            active_plastics = predict_plastic_drift(live_plastics, days=forecast_days)
        else:
            active_plastics = live_plastics

        # 2. Filtrar avistamientos en PostGIS
        qs = get_filtered_sightings_qs(selected_category)
        total_sightings = qs.count()

        impacted_count = 0
        if total_sightings > 0 and active_plastics:
            geos_polys = []

            for feat in active_plastics:
                try:
                    coords = feat["geometry"]["coordinates"][0]
                    cleaned_coords = [[float(pt[0]), float(pt[1])] for pt in coords]
                    geos_polys.append(Polygon(cleaned_coords))
                except Exception as poly_err:
                    print(f"[WARN] Polygon parsing error: {poly_err}")
                    continue

            # 3. Intersección espacial masiva en PostGIS usando índices GiST
            if geos_polys:
                try:
                    combined_poly = MultiPolygon(geos_polys)
                    impacted_count = qs.filter(location__intersects=combined_poly).count()
                except Exception:
                    # Fallback de unión en caso de geometrías complejas no contiguas
                    impacted_count = qs.filter(
                        location__intersects=geos_polys[0]
                    ).count() if geos_polys else 0

        risk_pct = round((impacted_count / total_sightings) * 100, 2) if total_sightings > 0 else 0.0

        return Response({
            "metrics": {
                "total_sightings_analyzed": total_sightings,
                "sightings_in_high_risk_zones": impacted_count,
                "overall_species_risk_index_pct": risk_pct,
            }
        })


class AllSightingsView(APIView):
    """
    Devuelve la telemetría marina como GeoJSON FeatureCollection serializada directamente desde PostGIS.
    """
    def get(self, request):
        selected_category = request.query_params.get('category', 'ALL')
        qs = get_filtered_sightings_qs(selected_category)

        # Genera la cadena GeoJSON directo en base de datos mediante PostGIS ST_AsGeoJSON
        sightings_data = qs.annotate(geojson=AsGeoJSON('location')).values(
            'id', 'species_name', 'common_name', 'category', 'geojson'
        )

        features = [{
            "type": "Feature",
            "geometry": json.loads(item["geojson"]),
            "properties": {
                "id": item["id"],
                "species_name": item["species_name"],
                "common_name": item["common_name"],
                "category": item["category"]
            }
        } for item in sightings_data]

        return Response({"type": "FeatureCollection", "features": features})


class AllPlasticZonesView(APIView):
    def get(self, request):
        try:
            forecast_days = int(request.query_params.get('forecast_days', 0))
        except (ValueError, TypeError):
            forecast_days = 0

        live_plastics = fetch_live_noaa_plastics()
        if forecast_days > 0:
            active_plastics = predict_plastic_drift(live_plastics, days=forecast_days)
        else:
            active_plastics = live_plastics

        return Response({
            "type": "FeatureCollection",
            "features": active_plastics
        })


class PredictiveImpactView(APIView):
    def get(self, request):
        try:
            forecast_days = int(request.query_params.get('forecast_days', 0))
        except (ValueError, TypeError):
            forecast_days = 0

        selected_category = request.query_params.get('category', 'ALL')

        live_plastics = fetch_live_noaa_plastics()
        if forecast_days > 0:
            active_plastics = predict_plastic_drift(live_plastics, days=forecast_days)
        else:
            active_plastics = live_plastics

        qs = get_filtered_sightings_qs(selected_category)
        sightings_data = qs.annotate(geojson=AsGeoJSON('location')).values(
            'id', 'species_name', 'common_name', 'category', 'geojson'
        )

        sightings_features = [{
            "type": "Feature",
            "geometry": json.loads(item["geojson"]),
            "properties": {
                "id": item["id"],
                "species_name": item["species_name"],
                "common_name": item["common_name"],
                "category": item["category"]
            }
        } for item in sightings_data]

        return Response({
            "forecast_days": forecast_days,
            "plastic_zones": {
                "type": "FeatureCollection",
                "features": active_plastics
            },
            "sightings": {
                "type": "FeatureCollection",
                "features": sightings_features
            }
        })