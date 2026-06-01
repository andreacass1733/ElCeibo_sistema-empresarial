from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CapacitacionViewSet

router = DefaultRouter()
router.register(r'capacitaciones', CapacitacionViewSet)

urlpatterns = [
    path('', include(router.urls)),
]