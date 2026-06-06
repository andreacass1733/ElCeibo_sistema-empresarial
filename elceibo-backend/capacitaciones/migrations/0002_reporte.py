from django.db import migrations, models


def create_initial_reportes(apps, schema_editor):
    Reporte = apps.get_model('capacitaciones', 'Reporte')
    Reporte.objects.bulk_create([
        Reporte(nombre='Ventas por sucursal — mayo 2026', categoria='ventas', fecha='2026-05-28', estado='listo'),
        Reporte(nombre='Producción mensual de chocolates', categoria='produccion', fecha='2026-05-27', estado='listo'),
        Reporte(nombre='Rendimiento de empleados', categoria='empleados', fecha='2026-05-25', estado='listo'),
        Reporte(nombre='Inventario por sucursal', categoria='inventario', fecha='2026-05-24', estado='listo'),
        Reporte(nombre='Capacitaciones completadas', categoria='empleados', fecha='2026-05-22', estado='listo'),
        Reporte(nombre='Compras a proveedores — Q2 2026', categoria='compras', fecha='2026-05-20', estado='listo'),
        Reporte(nombre='Top productos más vendidos', categoria='ventas', fecha='2026-05-18', estado='pendiente'),
        Reporte(nombre='Envíos entre sucursales', categoria='inventario', fecha='2026-05-15', estado='listo'),
    ])


class Migration(migrations.Migration):

    dependencies = [
        ('capacitaciones', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Reporte',
            fields=[
                ('id_reporte', models.AutoField(primary_key=True, serialize=False)),
                ('nombre', models.CharField(max_length=200)),
                ('categoria', models.CharField(max_length=50, null=True)),
                ('fecha', models.DateField(null=True)),
                ('estado', models.CharField(choices=[('listo', 'Listo'), ('pendiente', 'Pendiente'), ('error', 'Error')], default='listo', max_length=20)),
            ],
            options={
                'db_table': 'Reporte',
            },
        ),
        migrations.RunPython(create_initial_reportes),
    ]
