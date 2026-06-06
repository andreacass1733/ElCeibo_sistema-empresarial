from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CapacitacionViewSet, ObjetivoViewSet, AlertaViewSet, MetricaViewSet, EmpleadoViewSet, ReporteViewSet

router = DefaultRouter()
router.register(r'capacitaciones', CapacitacionViewSet)
router.register(r'objetivos',      ObjetivoViewSet)
router.register(r'alertas',        AlertaViewSet)
router.register(r'metricas',       MetricaViewSet)
router.register(r'empleados', EmpleadoViewSet)
router.register(r'reportes',       ReporteViewSet)
urlpatterns = [
    path('', include(router.urls)),
]