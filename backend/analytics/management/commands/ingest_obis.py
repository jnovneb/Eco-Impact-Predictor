import requests
from django.core.management.base import BaseCommand
from django.contrib.gis.geos import Point
from django.utils.dateparse import parse_datetime
from django.utils import timezone
from analytics.models import MarineSpecies, SightingLocation


class Command(BaseCommand):
    help = "Fetches and ingests marine telemetry/sighting data for multiple species from OBIS API"

    SPECIES_LIST = [
        {"name": "Caretta caretta", "common_name": "Loggerhead Sea Turtle", "category": "Reptile", "taxon_id": 137205},
        {"name": "Balaenoptera musculus", "common_name": "Blue Whale", "category": "Mammal", "taxon_id": 137090},
        {"name": "Phoebastria immutabilis", "common_name": "Laysan Albatross", "category": "Bird", "taxon_id": 206001},
        {"name": "Dermochelys coriacea", "common_name": "Leatherback Sea Turtle", "category": "Reptile", "taxon_id": 137206},
    ]

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS("Starting multi-species OBIS data ingestion..."))

        SightingLocation.objects.all().delete()

        for sp in self.SPECIES_LIST:
            species, _ = MarineSpecies.objects.get_or_create(
                taxon_id=sp["taxon_id"],
                defaults={
                    'name': sp["name"],
                    'common_name': sp["common_name"],
                    'category': sp["category"]
                }
            )

            url = f"https://api.obis.org/v3/occurrence?scientificname={sp['name']}&size=300"
            response = requests.get(url)

            if response.status_code != 200:
                self.stdout.write(self.style.ERROR(f"Failed to fetch data for {sp['name']}"))
                continue

            records = response.json().get('results', [])
            inserted = 0

            for record in records:
                lon = record.get('decimalLongitude')
                lat = record.get('decimalLatitude')
                raw_date = record.get('eventDate')

                parsed_timestamp = None
                if raw_date:
                    if '/' in raw_date:
                        raw_date = raw_date.split('/')[0]
                    dt = parse_datetime(raw_date)
                    if dt:
                        parsed_timestamp = timezone.make_aware(dt) if timezone.is_naive(dt) else dt

                if lon is not None and lat is not None:
                    SightingLocation.objects.create(
                        species=species,
                        location=Point(float(lon), float(lat), srid=4326),
                        timestamp=parsed_timestamp
                    )
                    inserted += 1

            self.stdout.write(self.style.SUCCESS(f"Ingested {inserted} points for {sp['common_name']}"))