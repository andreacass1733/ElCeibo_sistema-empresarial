from django.db import models

class Empleado(models.Model):
    id_empleado = models.AutoField(primary_key=True)
    nombre      = models.CharField(max_length=100, null=True)
    cargo       = models.CharField(max_length=50, null=True)

    class Meta:
        db_table = 'Empleado'   # nombre exacto de la tabla en MySQL

    def __str__(self):
        return self.nombre or ''


class Capacitacion(models.Model):
    id_capacitacion = models.AutoField(primary_key=True)
    nombre          = models.CharField(max_length=150)
    descripcion     = models.TextField(null=True, blank=True)
    fecha_inicio    = models.DateField(null=True)
    fecha_fin       = models.DateField(null=True)
    instructor      = models.CharField(max_length=100, null=True)
    costo           = models.DecimalField(max_digits=10, decimal_places=2, null=True)

    class Meta:
        db_table = 'Capacitacion'

    def __str__(self):
        return self.nombre


class EmpleadoCapacitacion(models.Model):
    ESTADOS = [
        ('INSCRITO',   'Inscrito'),
        ('COMPLETADO', 'Completado'),
        ('ABANDONADO', 'Abandonado'),
    ]

    id_empleado_capacitacion = models.AutoField(primary_key=True)
    id_empleado   = models.ForeignKey(
        Empleado,     on_delete=models.CASCADE, db_column='id_empleado')
    id_capacitacion = models.ForeignKey(
        Capacitacion, on_delete=models.CASCADE, db_column='id_capacitacion')
    fecha_asistencia = models.DateField(null=True)
    estado           = models.CharField(
        max_length=20, choices=ESTADOS, default='INSCRITO')
    calificacion     = models.DecimalField(
        max_digits=5, decimal_places=2, null=True, blank=True)

    class Meta:
        db_table = 'Empleado_Capacitacion'