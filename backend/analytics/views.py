from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.gis.geos import GEOSGeometry
from functools import reduce
from .models import MarineSpecies, SightingLocation, MicroplasticDensityZone
from .serializers import SightingLocationGeoSerializer, MicroplasticZoneGeoSerializer


class EnvironmentalImpactAnalysisView(APIView):
    """
    Computes spatial intersections between wildlife movement vectors and high-density plastic zones.
    """

    def get(self, request):
        try:
            # 1. Filter microplastic zones exceeding risk threshold
            high_risk_zones = MicroplasticDensityZone.objects.filter(density_index__gte=30000.0)

            # Total sightings count
            total_sightings = SightingLocation.objects.count()

            # 2. Collect polygons into a unified GEOS multipolygon geometry
            polygons = [zone.polygon for zone in high_risk_zones]

            if polygons:
                # Merge all individual risk zone polygons into a single GEOS geometry
                combined_risk_area = reduce(lambda x, y: x.union(y), polygons)

                # Filter sightings intersecting the combined GEOS geometry
                impacted_sightings = SightingLocation.objects.filter(
                    location__intersects=combined_risk_area
                )
            else:
                impacted_sightings = SightingLocation.objects.none()

            impacted_count = impacted_sightings.count()

            # 3. Calculate exposure risk percentage
            risk_percentage = (impacted_count / total_sightings * 100) if total_sightings > 0 else 0.0

            sightings_serializer = SightingLocationGeoSerializer(impacted_sightings, many=True)
            zones_serializer = MicroplasticZoneGeoSerializer(high_risk_zones, many=True)

            return Response({
                'metrics': {
                    'total_sightings_analyzed': total_sightings,
                    'sightings_in_high_risk_zones': impacted_count,
                    'overall_species_risk_index_pct': round(risk_percentage, 2)
                },
                'impacted_points': sightings_serializer.data,
                'active_risk_zones': zones_serializer.data
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class AllSightingsView(APIView):
    """
    Returns GeoJSON FeatureCollection of all recorded wildlife sightings.
    """

    def get(self, request):
        sightings = SightingLocation.objects.select_related('species').all()[:2000]
        serializer = SightingLocationGeoSerializer(sightings, many=True)
        return Response(serializer.data)


class AllPlasticZonesView(APIView):
    """
    Returns GeoJSON FeatureCollection of all microplastic convergence zones.
    """

    def get(self, request):
        zones = MicroplasticDensityZone.objects.all()
        serializer = MicroplasticZoneGeoSerializer(zones, many=True)
        return Response(serializer.data)