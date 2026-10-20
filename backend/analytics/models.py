from django.contrib.gis.db import models


class MarineSpecies(models.Model):
    """
    Stores target marine species metadata.
    """
    name = models.CharField(max_length=150, help_text="Scientific species name")
    common_name = models.CharField(max_length=150, blank=True, default="")
    taxon_id = models.IntegerField(unique=True, help_text="Unique taxonomy ID from OBIS/GBIF")
    category = models.CharField(max_length=50, help_text="Reptile, Mammal, Bird, Fish")

    def __str__(self):
        return f"{self.name} ({self.category})"


class SightingLocation(models.Model):
    """
    Geospatial point data representing marine wildlife sightings or telemetry updates.
    """
    species = models.ForeignKey(MarineSpecies, on_delete=models.CASCADE, related_name='sightings')
    location = models.PointField(srid=4326, help_text="WGS84 GPS coordinate point")
    timestamp = models.DateTimeField(null=True, blank=True)

    class Meta:
        indexes = [
            models.Index(fields=['timestamp']),
        ]

    def __str__(self):
        return f"{self.species.name} at {self.location.x}, {self.location.y}"


class MicroplasticDensityZone(models.Model):
    """
    Geospatial polygon data representing ocean microplastic concentration levels.
    """
    density_index = models.FloatField(help_text="Concentration index (particles per km2)")
    polygon = models.PolygonField(srid=4326, help_text="Geospatial bounding zone")
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Zone {self.id} - Density: {self.density_index} particles/km2"