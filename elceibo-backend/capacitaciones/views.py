from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Capacitacion, EmpleadoCapacitacion, Empleado
from .serializers import CapacitacionSerializer


class CapacitacionViewSet(viewsets.ReadOnlyModelViewSet):
    """
    GET /api/capacitaciones/          → lista todas
    GET /api/capacitaciones/<id>/     → detalle con empleados
    """
    queryset = Capacitacion.objects.prefetch_related(
        'empleadocapacitacion_set__id_empleado'
    ).all()
    serializer_class = CapacitacionSerializer

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Capacitacion, EmpleadoCapacitacion, Objetivo, Alerta, Metrica
from .serializers import CapacitacionSerializer, ObjetivoSerializer, AlertaSerializer, MetricaSerializer, EmpleadoSerializer


# ... tu CapacitacionViewSet ya existente ...


class ObjetivoViewSet(viewsets.ReadOnlyModelViewSet):
    queryset         = Objetivo.objects.all()
    serializer_class = ObjetivoSerializer


class AlertaViewSet(viewsets.ReadOnlyModelViewSet):
    queryset         = Alerta.objects.all()
    serializer_class = AlertaSerializer


class MetricaViewSet(viewsets.ReadOnlyModelViewSet):
    queryset         = Metrica.objects.all()
    serializer_class = MetricaSerializer


class EmpleadoViewSet(viewsets.ModelViewSet):
    queryset = Empleado.objects.all()
    serializer_class = EmpleadoSerializer