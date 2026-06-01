from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Capacitacion, EmpleadoCapacitacion
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