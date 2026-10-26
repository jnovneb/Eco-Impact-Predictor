from django.urls import path
from .views import EnvironmentalImpactAnalysisView, AllSightingsView, AllPlasticZonesView, PredictiveImpactView

urlpatterns = [
    path('impact-analysis/', EnvironmentalImpactAnalysisView.as_view(), name='impact-analysis'),
    path('sightings/', AllSightingsView.as_view(), name='all-sightings'),
    path('plastic-zones/', AllPlasticZonesView.as_view(), name='all-plastic-zones'),
    path('predictive-impact/', PredictiveImpactView.as_view(), name='predictive-impact'),
]