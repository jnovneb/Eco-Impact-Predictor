FROM python:3.11-slim

# Install GDAL and GEOS dependencies required for GeoDjango
RUN apt-get update && apt-get install -y \
    binutils \
    libproj-dev \
    gdal-bin \
    python3-gdal \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Crear el directorio estático para evitar UserWarning en Django/WhiteNoise
RUN mkdir -p /app/staticfiles

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

# Start Gunicorn production server with extended 120s timeout and memory-efficient worker setup
CMD ["sh", "-c", "python manage.py collectstatic --noinput && gunicorn eco_project.wsgi:application --bind 0.0.0.0:${PORT:-10000} --workers 1 --threads 2 --timeout 120"]