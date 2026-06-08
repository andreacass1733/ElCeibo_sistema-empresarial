from django.urls import path
from .views import (
    dashboard_kpi_meta,
    dashboard_kpis,
    dashboard_ultimas_ventas,
    dashboard_produccion_reciente,
    dashboard_sucursales,
    dashboard_clientes_activos,
    dashboard_predicciones
)

urlpatterns = [
    path('dashboard/kpis/', dashboard_kpis),
    path('dashboard/kpi-meta/', dashboard_kpi_meta),
    path('dashboard/ultimas-ventas/', dashboard_ultimas_ventas),
    path('dashboard/produccion-reciente/', dashboard_produccion_reciente),
    path('dashboard/sucursales/', dashboard_sucursales),
    path('dashboard/clientes-activos/', dashboard_clientes_activos),
    path('dashboard/predicciones/', dashboard_predicciones),
]