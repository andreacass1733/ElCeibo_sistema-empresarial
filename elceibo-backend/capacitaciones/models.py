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


class Objetivo(models.Model):
    ESTADOS = [
        ('COMPLETADO',  'Completado'),
        ('EN_PROGRESO', 'En progreso'),
        ('PENDIENTE',   'Pendiente'),
        ('EN_RIESGO',   'En riesgo'),
    ]
    id_objetivo  = models.AutoField(primary_key=True)
    titulo       = models.CharField(max_length=200)
    descripcion  = models.TextField(null=True, blank=True)
    area         = models.CharField(max_length=50, null=True)
    estado       = models.CharField(max_length=20, choices=ESTADOS, default='PENDIENTE')
    progreso     = models.IntegerField(default=0)
    responsable  = models.CharField(max_length=100, null=True)
    fecha_limite = models.DateField(null=True)

    class Meta:
        db_table = 'Objetivo'

    def __str__(self):
        return self.titulo


class Alerta(models.Model):
    TIPOS = [('warning', 'Warning'), ('info', 'Info'), ('danger', 'Danger')]
    id_alerta = models.AutoField(primary_key=True)
    tipo      = models.CharField(max_length=10, choices=TIPOS)
    mensaje   = models.TextField()
    area      = models.CharField(max_length=50, null=True)

    class Meta:
        db_table = 'Alerta'


class Metrica(models.Model):
    id_metrica  = models.AutoField(primary_key=True)
    label       = models.CharField(max_length=100)
    valor       = models.CharField(max_length=50, null=True)
    sub         = models.CharField(max_length=150, null=True)
    pct         = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    color       = models.CharField(max_length=80, null=True)
    text_color  = models.CharField(max_length=80, null=True)

    class Meta:
        db_table = 'Metrica'