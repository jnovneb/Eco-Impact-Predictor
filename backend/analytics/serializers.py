from rest_framework import serializers
from rest_framework_gis.serializers import GeoFeatureModelSerializer
from .models import MarineSpecies, SightingLocation, MicroplasticDensityZone


class MarineSpeciesSerializer(serializers.ModelSerializer):
    class Meta:
        model = MarineSpecies
        fields = '__all__'


class SightingLocationGeoSerializer(GeoFeatureModelSerializer):
    species_name = serializers.CharField(source='species.name', read_only=True)
    common_name = serializers.CharField(source='species.common_name', read_only=True)
    category = serializers.CharField(source='species.category', read_only=True)

    class Meta:
        model = SightingLocation
        geo_field = 'location'
        fields = ('id', 'species_name', 'common_name', 'category', 'timestamp')


class MicroplasticZoneGeoSerializer(GeoFeatureModelSerializer):
    class Meta:
        model = MicroplasticDensityZone
        geo_field = 'polygon'
        fields = ('id', 'density_index', 'updated_at')