import requests
from django.core.management.base import BaseCommand
from django.contrib.gis.geos import Point
from analytics.models import MarineSighting
from datetime import datetime

TAXON_MAP = {
    "Reptile": [137021, 137023],    # Sea Turtles (Cheloniidae, Dermochelyidae)
    "Mammal": [137015, 137019],     # Cetaceans & Pinnipeds (Whales, Sea Lions)
    "Bird": [2684],                 # Spheniscidae / Pelagic Seabirds
    "Fish": [10194, 22591, 22580]   # Elasmobranchii (Sharks), Scombridae (Tuna) & Pelagics
}

class Command(BaseCommand):
    help = "Fetch expanded real-world marine telemetry points from OBIS API across multiple taxa and index in PostGIS"

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS("Starting expanded OBIS telemetry ingestion..."))
        
        # Opcional: Limpiar avistamientos anteriores antes de la ingesta completa
        MarineSighting.objects.all().delete()
        total_ingested = 0

        for category, taxon_ids in TAXON_MAP.items():
            for taxon_id in taxon_ids:
                # size=2500 recupera un volumen amplio de datos reales de OBIS por especie
                url = f"https://api.obis.org/v3/occurrence?taxonid={taxon_id}&size=2500"
                try:
                    response = requests.get(url, timeout=30)
                    if response.status_code != 200:
                        continue
                    
                    data = response.json()
                    results = data.get("results", [])
                    sightings_to_create = []

                    for item in results:
                        lat = item.get("decimalLatitude")
                        lon = item.get("decimalLongitude")
                        
                        if lat is None or lon is None:
                            continue

                        p_lat, p_lon = float(lat), float(lon)
                        # Validar límites geográficos estrictos [-180, 180] / [-90, 90]
                        if not (-180.0 <= p_lon <= 180.0 and -90.0 <= p_lat <= 90.0):
                            continue
                            
                        # Parsear fecha
                        event_date = item.get("eventDate")
                        timestamp = None
                        if event_date:
                            try:
                                timestamp = datetime.fromisoformat(event_date.replace("Z", "+00:00"))
                            except Exception:
                                timestamp = None
                                
                        species_name = item.get("species") or item.get("scientificName") or "Unknown species"
                        common_name = item.get("vernacularName") or species_name
                        
                        point = Point(p_lon, p_lat, srid=4326)
                        
                        sightings_to_create.append(
                            MarineSighting(
                                species_name=species_name,
                                common_name=common_name,
                                category=category,
                                location=point,
                                timestamp=timestamp
                            )
                        )
                    
                    # Inserción masiva por lotes para máximo rendimiento en PostgreSQL
                    MarineSighting.objects.bulk_create(sightings_to_create, batch_size=2000, ignore_conflicts=True)
                    total_ingested += len(sightings_to_create)
                    self.stdout.write(self.style.SUCCESS(f"Ingested {len(sightings_to_create)} records for category: {category} (Taxon ID: {taxon_id})"))
                    
                except Exception as e:
                    self.stdout.write(self.style.ERROR(f"Error fetching taxon {taxon_id}: {str(e)}"))

        self.stdout.write(self.style.SUCCESS(f"Successfully ingested {total_ingested} real-world marine telemetry records into PostGIS."))