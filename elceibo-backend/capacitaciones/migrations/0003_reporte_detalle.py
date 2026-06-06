from django.db import migrations, models


def populate_reporte_detalle(apps, schema_editor):
    Reporte = apps.get_model('capacitaciones', 'Reporte')
    detalles = {
        1: {
            'stats': [
                {'n': 'Bs 48,720', 'l': 'Total vendido'},
                {'n': '312', 'l': 'Unidades'},
                {'n': '3', 'l': 'Sucursales'},
                {'n': '5', 'l': 'Empleados'},
            ],
            'section': 'Ventas por sucursal',
            'headers': ['Sucursal', 'Empleado', 'Productos', 'Total (Bs)'],
            'rows': [
                ['Sucursal Central', 'Carlos Mamani', 'Trufas, Bombones', '18,400'],
                ['Sucursal Norte', 'Ana Quispe', 'Tabletas, Trufas', '16,220'],
                ['Sucursal Sur', 'Luis Flores', 'Bombones', '14,100'],
            ],
        },
        2: {
            'stats': [
                {'n': '2,840', 'l': 'Unidades prod.'},
                {'n': '6', 'l': 'Productos'},
                {'n': '8', 'l': 'Empleados'},
                {'n': '22', 'l': 'Días activos'},
            ],
            'section': 'Producción por producto',
            'headers': ['Producto', 'Tipo', 'Cantidad', 'Empleado encargado'],
            'rows': [
                ['Trufa de maracuyá', 'Trufa', '640', 'Pedro Condori'],
                ['Tableta 70%', 'Tableta', '800', 'María Ticona'],
                ['Bombón relleno', 'Bombón', '520', 'Juan Mamani'],
                ['Chocolate blanco', 'Tableta', '880', 'Ana Quispe'],
            ],
        },
        3: {
            'stats': [
                {'n': '12', 'l': 'Empleados'},
                {'n': '3', 'l': 'Cargos'},
                {'n': '4.2', 'l': 'Calif. prom.'},
                {'n': '85%', 'l': 'Puntualidad'},
            ],
            'section': 'Empleados activos',
            'headers': ['Nombre', 'Cargo', 'Capacitaciones', 'Estado'],
            'rows': [
                ['Carlos Mamani', 'Vendedor', '3', 'Activo'],
                ['Ana Quispe', 'Producción', '2', 'Activo'],
                ['Luis Flores', 'Vendedor', '1', 'Activo'],
                ['Pedro Condori', 'Administrador', '4', 'Activo'],
                ['María Ticona', 'Producción', '2', 'Permiso'],
            ],
        },
        4: {
            'stats': [
                {'n': '4,210', 'l': 'Unidades total'},
                {'n': '3', 'l': 'Sucursales'},
                {'n': '8', 'l': 'Productos'},
                {'n': '12%', 'l': 'Stock bajo'},
            ],
            'section': 'Inventario actual',
            'headers': ['Producto', 'Sucursal', 'Stock', 'Alerta'],
            'rows': [
                ['Trufa de maracuyá', 'Central', '380', 'OK'],
                ['Tableta 70%', 'Norte', '120', 'Bajo'],
                ['Bombón relleno', 'Sur', '560', 'OK'],
                ['Chocolate blanco', 'Central', '45', 'Crítico'],
            ],
        },
        5: {
            'stats': [
                {'n': '8', 'l': 'Capacitaciones'},
                {'n': '24', 'l': 'Participantes'},
                {'n': '87%', 'l': 'Completado'},
                {'n': 'Bs 4,200', 'l': 'Inversión'},
            ],
            'section': 'Detalle capacitaciones',
            'headers': ['Capacitación', 'Instructor', 'Empleados', 'Estado'],
            'rows': [
                ['Manipulación de chocolate', 'Ing. Rojas', '6', 'Completado'],
                ['Atención al cliente', 'Lic. Vargas', '8', 'Completado'],
                ['Seguridad alimentaria', 'Ing. Paz', '5', 'En curso'],
                ['Control de calidad', 'Ing. Rojas', '5', 'Completado'],
            ],
        },
        6: {
            'stats': [
                {'n': 'Bs 28,400', 'l': 'Total compras'},
                {'n': '5', 'l': 'Proveedores'},
                {'n': '12', 'l': 'Materias primas'},
                {'n': '8', 'l': 'Órdenes'},
            ],
            'section': 'Compras a proveedores',
            'headers': ['Proveedor', 'Materia prima', 'Cantidad', 'Monto (Bs)'],
            'rows': [
                ['Cacao del Norte', 'Cacao en grano', '500 kg', '8,200'],
                ['Azúcares Andinos', 'Azúcar refinada', '300 kg', '3,600'],
                ['Dairy Bolivia', 'Leche en polvo', '200 kg', '5,400'],
                ['Frutas Tropicales', 'Maracuyá', '150 kg', '2,800'],
                ['Cacao del Norte', 'Manteca de cacao', '180 kg', '8,400'],
            ],
        },
        7: {
            'stats': [
                {'n': 'Top 5', 'l': 'Productos'},
                {'n': '980', 'l': 'Unidades'},
                {'n': 'Bs 32,100', 'l': 'Ingreso'},
                {'n': 'mayo', 'l': 'Período'},
            ],
            'section': 'Productos más vendidos',
            'headers': ['Producto', 'Unidades', 'Ingreso (Bs)', 'Participación'],
            'rows': [
                ['Tableta 70%', '320', '10,240', '32.7%'],
                ['Trufa de maracuyá', '280', '9,800', '30.5%'],
                ['Bombón relleno', '180', '5,580', '17.4%'],
                ['Chocolate blanco', '120', '4,080', '12.7%'],
                ['Kit regalo', '80', '2,400', '7.5%'],
            ],
        },
        8: {
            'stats': [
                {'n': '18', 'l': 'Envíos'},
                {'n': '3', 'l': 'Rutas'},
                {'n': '1,240', 'l': 'Unidades'},
                {'n': 'Bs 420', 'l': 'Costo logística'},
            ],
            'section': 'Envíos entre sucursales',
            'headers': ['Origen', 'Destino', 'Producto', 'Unidades'],
            'rows': [
                ['Planta Central', 'Sucursal Norte', 'Tabletas 70%', '220'],
                ['Planta Central', 'Sucursal Sur', 'Bombones rellenos', '180'],
                ['Sucursal Norte', 'Sucursal Sur', 'Trufas maracuyá', '150'],
                ['Planta Central', 'Sucursal Norte', 'Chocolate blanco', '90'],
            ],
        },
    }

    for reporte_id, detalle in detalles.items():
        try:
            reporte = Reporte.objects.get(id_reporte=reporte_id)
            reporte.detalle = detalle
            reporte.save()
        except Reporte.DoesNotExist:
            continue


class Migration(migrations.Migration):

    dependencies = [
        ('capacitaciones', '0002_reporte'),
    ]

    operations = [
        migrations.AddField(
            model_name='reporte',
            name='detalle',
            field=models.JSONField(blank=True, default=dict, null=True),
        ),
        migrations.RunPython(populate_reporte_detalle),
    ]
