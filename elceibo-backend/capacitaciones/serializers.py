from rest_framework import serializers
from .models import Capacitacion, EmpleadoCapacitacion, Empleado


class EmpleadoEnCapacitacionSerializer(serializers.ModelSerializer):
    # Aplana los datos del empleado + la relación
    id     = serializers.IntegerField(source='id_empleado.id_empleado')
    nombre = serializers.CharField(source='id_empleado.nombre')
    cargo  = serializers.CharField(source='id_empleado.cargo')

    class Meta:
        model  = EmpleadoCapacitacion
        fields = ['id', 'nombre', 'cargo', 'estado', 'calificacion', 'fecha_asistencia']


class CapacitacionSerializer(serializers.ModelSerializer):
    empleados = EmpleadoEnCapacitacionSerializer(
        source='empleadocapacitacion_set', many=True, read_only=True
    )

    class Meta:
        model  = Capacitacion
        fields = [
            'id_capacitacion', 'nombre', 'descripcion',
            'fecha_inicio', 'fecha_fin', 'instructor',
            'costo', 'empleados'
        ]