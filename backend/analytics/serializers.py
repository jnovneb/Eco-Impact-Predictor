from rest_framework import serializers
from rest_framework_gis.serializers import GeoFeatureModelSerializer
from .models import MarineSighting, SightingLocation, MicroplasticDensityZone


class MarineSightingSerializer(serializers.ModelSerializer):
    class Meta:
        model = MarineSighting
        fields = ['id', 'species_name', 'common_name', 'category', 'location', 'timestamp']


class SightingLocationGeoSerializer(GeoFeatureModelSerializer):
    species_name = serializers.CharField(source='species.name', read_only=True)
    common_name = serializers.CharField(source='species.common_name', read_only=True)
    category = serializers.CharField(source='species.category', read_only=True)

    class Meta:
        model = SightingLocation
        geo_field = 'location'
        fields = ('id', 'species_name', 'common_name', 'category', 'timestamp')


class MicroplasticDensityZoneSerializer(serializers.ModelSerializer):
    class Meta:
        model = MicroplasticDensityZone
        fields = ['id', 'density_index', 'polygon', 'updated_at']