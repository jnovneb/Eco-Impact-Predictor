from django.core.management.base import BaseCommand
from django.contrib.gis.geos import Polygon
from analytics.models import MicroplasticDensityZone


class Command(BaseCommand):
    help = "Generates sample ocean microplastic density polygon zones for demonstration"

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS("Ingesting sample microplastic density zones..."))

        # Clear existing entries
        MicroplasticDensityZone.objects.all().delete()

        # Synthetic polygon dataset representing North Pacific Gyre convergence sub-zones
        zones_data = [
            {
                "density": 45000.0,
                "coords": ((-145.0, 25.0), (-135.0, 25.0), (-135.0, 32.0), (-145.0, 32.0), (-145.0, 25.0))
            },
            {
                "density": 88000.0,
                "coords": ((-140.0, 28.0), (-130.0, 28.0), (-130.0, 35.0), (-140.0, 35.0), (-140.0, 28.0))
            },
            {
                "density": 12000.0,
                "coords": ((-70.0, 20.0), (-60.0, 20.0), (-60.0, 30.0), (-70.0, 30.0), (-70.0, 20.0))
            }
        ]

        for item in zones_data:
            poly = Polygon(item["coords"], srid=4326)
            MicroplasticDensityZone.objects.create(
                density_index=item["density"],
                polygon=poly
            )

        self.stdout.write(self.style.SUCCESS(f"Ingested {len(zones_data)} microplastic zones."))