from django.urls import path
from .views import (
    login, 
    empleado_actual, empleado_dashboard, 
    empleado_objetivos, reportes_lista, empleado_perfil, 
    empleado_produccion, produccion_crear, produccion_editar, produccion_eliminar, productos_lista,
    empleado_ventas, venta_crear, venta_editar, venta_eliminar, clientes_lista, cliente_crear, cliente_editar, cliente_eliminar, sucursales_lista,
    inventario_por_sucursal, inventario_crear, inventario_editar, inventario_eliminar, stock_por_sucursal)

urlpatterns = [
    path('login/', login, name='login'),
    path('empleado-actual/<int:id>/', empleado_actual, name='empleado_actual'),

    # 🚀 NUEVO
    path('empleado-dashboard/<int:id>/', empleado_dashboard, name='empleado_dashboard'),
    path('empleado-objetivos/<int:id>/', empleado_objetivos, name='empleado_objetivos'),
    path('reportes/', reportes_lista, name='reportes_lista'),
    path('empleado-perfil/<int:id>/', empleado_perfil, name='empleado_perfil'),
    path('empleado-produccion/<int:id>/', empleado_produccion, name='empleado_produccion'),
    path('produccion/crear/',          produccion_crear,    name='produccion_crear'),
    path('produccion/editar/<int:id>/', produccion_editar,   name='produccion_editar'),
    path('produccion/eliminar/<int:id>/', produccion_eliminar, name='produccion_eliminar'),
    path('productos/',                 productos_lista,     name='productos_lista'),
    path('empleado-ventas/<int:id>/',    empleado_ventas,   name='empleado_ventas'),
    path('venta/crear/',                 venta_crear,       name='venta_crear'),
    path('venta/editar/<int:id>/', venta_editar, name='venta_editar'),
    path('venta/eliminar/<int:id>/',     venta_eliminar,    name='venta_eliminar'),
    path('clientes/',                    clientes_lista,    name='clientes_lista'),
    path('cliente/crear/',             cliente_crear,    name='cliente_crear'),
    path('cliente/editar/<int:id>/',   cliente_editar,   name='cliente_editar'),
    path('cliente/eliminar/<int:id>/', cliente_eliminar, name='cliente_eliminar'),
    path('sucursales/',                  sucursales_lista,  name='sucursales_lista'),
    path('inventario/',  inventario_por_sucursal, name='inventario'),
    path('inventario/crear/',              inventario_crear,        name='inventario_crear'),
    path('inventario/editar/<int:id>/',    inventario_editar,       name='inventario_editar'),
    path('inventario/eliminar/<int:id>/',  inventario_eliminar,     name='inventario_eliminar'),
    path('stock/',       stock_por_sucursal,      name='stock'),
]