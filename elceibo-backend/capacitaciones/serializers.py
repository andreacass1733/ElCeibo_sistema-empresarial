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


from .models import Capacitacion, EmpleadoCapacitacion, Empleado, Objetivo, Alerta, Metrica, Reporte


class ObjetivoSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Objetivo
        fields = '__all__'


class ReporteSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(source='id_reporte')
    cat = serializers.CharField(source='categoria')

    class Meta:
        model = Reporte
        fields = ['id', 'nombre', 'cat', 'fecha', 'estado', 'detalle']


class AlertaSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Alerta
        fields = '__all__'


class MetricaSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Metrica
        fields = '__all__'


class EmpleadoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Empleado
        fields = '__all__'