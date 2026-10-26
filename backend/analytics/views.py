from rest_framework.views import APIView
from rest_framework.response import Response
from django.contrib.gis.geos import Polygon, Point
from .models import MarineSighting, MicroplasticDensityZone
from .serializers import MarineSightingSerializer, MicroplasticDensityZoneSerializer
from .services import fetch_live_noaa_plastics
from .predictor import predict_plastic_drift


def point_in_bbox(lon, lat, bbox):
    """
    Verifica si un punto (lon, lat) cae dentro de la Bounding Box [min_lon, min_lat, max_lon, max_lat].
    """
    min_x, min_y, max_x, max_y = bbox
    return min_x <= lon <= max_x and min_y <= lat <= max_y


class EnvironmentalImpactAnalysisView(APIView):
    """
    Calcula el Exposure Risk Index cruzando la telemetría almacenada en PostGIS con los giros de microplásticos.
    """
    def get(self, request):
        try:
            forecast_days = int(request.query_params.get('forecast_days', 0))
        except (ValueError, TypeError):
            forecast_days = 0

        selected_category = request.query_params.get('category', 'ALL')

        # 1. Zonas de plástico (con simulación advectiva de deriva si forecast_days > 0)
        live_plastics = fetch_live_noaa_plastics()
        if forecast_days > 0:
            active_plastics = predict_plastic_drift(live_plastics, days=forecast_days)
        else:
            active_plastics = live_plastics

        # 2. Consultar avistamientos filtrados directamente en PostGIS
        qs = MarineSighting.objects.all()
        if selected_category and selected_category != 'ALL':
            target = selected_category.lower()
            if target == 'fish':
                qs = qs.filter(category__iexact='Fish')
            else:
                qs = qs.filter(category__icontains=target)

        sightings_points = list(qs.values_list('location', flat=True))
        total_sightings = len(sightings_points)
        impacted_count = 0

        if total_sightings > 0 and active_plastics:
            bboxes = []
            geos_polys = []

            for feat in active_plastics:
                try:
                    coords = feat["geometry"]["coordinates"][0]
                    lons = [float(pt[0]) for pt in coords]
                    lats = [float(pt[1]) for pt in coords]
                    
                    bbox = [min(lons), min(lats), max(lons), max(lats)]
                    bboxes.append(bbox)

                    cleaned_coords = [[float(pt[0]), float(pt[1])] for pt in coords]
                    geos_polys.append(Polygon(cleaned_coords))
                except Exception as poly_err:
                    print(f"[WARN] Polygon parsing error: {poly_err}")
                    continue

            # Evaluación de intersección espacial optimizada
            for point in sightings_points:
                try:
                    p_lon, p_lat = point.x, point.y

                    hit = False
                    for bbox in bboxes:
                        if point_in_bbox(p_lon, p_lat, bbox):
                            hit = True
                            break

                    if not hit:
                        for poly in geos_polys:
                            if poly.contains(point) or poly.intersects(point):
                                hit = True
                                break

                    if hit:
                        impacted_count += 1

                except Exception:
                    continue

            risk_pct = round((impacted_count / total_sightings) * 100, 2)
        else:
            risk_pct = 0.0

        return Response({
            "metrics": {
                "total_sightings_analyzed": total_sightings,
                "sightings_in_high_risk_zones": impacted_count,
                "overall_species_risk_index_pct": risk_pct,
            }
        })


class AllSightingsView(APIView):
    """
    Devuelve la telemetría marina como GeoJSON FeatureCollection.
    Filtra por categoría directamente en la base de datos para transferir sólo los bytes requeridos.
    """
    def get(self, request):
        selected_category = request.query_params.get('category', 'ALL')

        qs = MarineSighting.objects.all()
        if selected_category and selected_category != 'ALL':
            target = selected_category.lower()
            if target == 'fish':
                qs = qs.filter(category__iexact='Fish')
            else:
                qs = qs.filter(category__icontains=target)

        # Consulta proyectada super rápida sin instanciar objetos pesados de Django ORM
        sightings_data = qs.values('id', 'species_name', 'common_name', 'category', 'location')

        features = [{
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [item["location"].x, item["location"].y]
            },
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

        qs = MarineSighting.objects.all()
        if selected_category and selected_category != 'ALL':
            target = selected_category.lower()
            if target == 'fish':
                qs = qs.filter(category__iexact='Fish')
            else:
                qs = qs.filter(category__icontains=target)

        sightings_data = qs.values('id', 'species_name', 'common_name', 'category', 'location')
        sightings_features = [{
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [item["location"].x, item["location"].y]
            },
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