import math
from typing import List, Dict, Any
from .services import fetch_live_surface_velocity


def predict_plastic_drift(features: List[Dict[str, Any]], days: int = 0) -> List[Dict[str, Any]]:
    """
    Simulates physical drift advection of microplastic accumulation zones
    accumulating vector displacement based on real satellite surface currents (u, v in m/s).
    """
    if days == 0 or not features:
        return features

    seconds_per_day = 86400
    total_seconds = days * seconds_per_day
    projected_features = []

    for feat in features:
        geom = feat.get("geometry", {})
        geom_type = geom.get("type")
        coords = geom.get("coordinates", [])

        if geom_type == "Polygon" and coords:
            ring = coords[0]
            if not ring:
                continue

            # Polygon centroid for local current vector lookup
            avg_lon = sum(float(pt[0]) for pt in ring) / len(ring)
            avg_lat = sum(float(pt[1]) for pt in ring) / len(ring)

            # Query real surface velocity vector (u, v) in m/s
            u_vel, v_vel = fetch_live_surface_velocity(avg_lon, avg_lat)

            # Convert meter shifts to WGS84 geographic degrees
            shift_x_m = u_vel * total_seconds
            shift_y_m = v_vel * total_seconds

            delta_lat = shift_y_m / 111000.0
            rad_lat = math.radians(avg_lat)
            cos_factor = math.cos(rad_lat) if abs(math.cos(rad_lat)) > 0.01 else 1.0
            delta_lon = shift_x_m / (111000.0 * cos_factor)

            # Advect vertices
            new_ring = []
            for pt in ring:
                p_lon, p_lat = float(pt[0]), float(pt[1])
                new_ring.append([
                    round(p_lon + delta_lon, 5),
                    round(p_lat + delta_lat, 5)
                ])

            new_feat = {
                "type": "Feature",
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [new_ring]
                },
                "properties": {
                    **feat.get("properties", {}),
                    "is_prediction": True,
                    "forecast_days": days,
                    "drift_vector": {
                        "u_m_s": round(u_vel, 3),
                        "v_m_s": round(v_vel, 3)
                    }
                }
            }
            projected_features.append(new_feat)

    return projected_features