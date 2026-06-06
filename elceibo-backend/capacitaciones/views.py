from rest_framework import viewsets
from .models import Capacitacion, Objetivo, Alerta, Metrica, Reporte
from .serializers import (
    CapacitacionSerializer,
    ObjetivoSerializer,
    AlertaSerializer,
    MetricaSerializer,
    ReporteSerializer,
)


class CapacitacionViewSet(viewsets.ReadOnlyModelViewSet):
    """
    GET /api/capacitaciones/          → lista todas
    GET /api/capacitaciones/<id>/     → detalle con empleados
    """
    queryset = Capacitacion.objects.prefetch_related(
        'empleadocapacitacion_set__id_empleado'
    ).all()
    serializer_class = CapacitacionSerializer

class ObjetivoViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Objetivo.objects.all()
    serializer_class = ObjetivoSerializer


class AlertaViewSet(viewsets.ReadOnlyModelViewSet):
    queryset         = Alerta.objects.all()
    serializer_class = AlertaSerializer


class MetricaViewSet(viewsets.ReadOnlyModelViewSet):
    queryset         = Metrica.objects.all()
    serializer_class = MetricaSerializer


class ReporteViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Reporte.objects.all()
    serializer_class = ReporteSerializer