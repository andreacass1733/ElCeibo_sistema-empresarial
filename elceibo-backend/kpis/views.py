from django.db import connection
from rest_framework.decorators import api_view
from rest_framework.response import Response


@api_view(['GET'])
def dashboard_kpis(request):

    with connection.cursor() as cursor:

        # ==================================================
        # INGRESOS (suma de cantidad * precio en Detalle_Venta)
        # ==================================================
        cursor.execute("""
            SELECT IFNULL(ROUND(SUM(cantidad * precio), 2), 0)
            FROM Detalle_Venta
        """)
        ingresos = float(cursor.fetchone()[0])

        # ==================================================
        # COSTOS (receta * precio unitario de compra)
        # ==================================================
        cursor.execute("""
            SELECT IFNULL(
                ROUND(SUM(r.cantidad * dc.precio_unitario), 2),
            0)
            FROM Receta r
            JOIN Detalle_Compra dc ON r.id_materia = dc.id_materia
        """)
        costos = float(cursor.fetchone()[0])

        utilidad = round(ingresos - costos, 2)
        margen = 0
        if ingresos > 0:
            margen = round(((ingresos - costos) / ingresos) * 100, 2)

        # ==================================================
        # STOCK TOTAL
        # ==================================================
        cursor.execute("""
            SELECT IFNULL(SUM(stock), 0)
            FROM Inventario
        """)
        stock = int(cursor.fetchone()[0])

        # ==================================================
        # PRODUCCIÓN TOTAL
        # ==================================================
        cursor.execute("""
            SELECT IFNULL(SUM(cantidad), 0)
            FROM Produccion
        """)
        produccion = int(cursor.fetchone()[0])

        # ==================================================
        # TOTAL EMPLEADOS
        # ==================================================
        cursor.execute("""
            SELECT COUNT(*)
            FROM Empleado
        """)
        empleados = int(cursor.fetchone()[0])

        # ==================================================
        # CAPACITACIONES % (tasa completado)
        # ENUM válidos: INSCRITO | COMPLETADO | ABANDONADO
        # ==================================================
        cursor.execute("""
            SELECT IFNULL(
                ROUND(
                    SUM(CASE WHEN estado = 'COMPLETADO' THEN 1 ELSE 0 END)
                    * 100.0 / NULLIF(COUNT(*), 0)
                , 2),
            0)
            FROM Empleado_Capacitacion
        """)
        capacitaciones = float(cursor.fetchone()[0])

        # ==================================================
        # TOTAL VENTAS (número de órdenes)
        # ==================================================
        cursor.execute("""
            SELECT COUNT(*)
            FROM Venta
        """)
        ventas_registradas = int(cursor.fetchone()[0])

        # ==================================================
        # PRODUCTO MÁS VENDIDO
        # ==================================================
        cursor.execute("""
            SELECT p.nombre
            FROM Detalle_Venta dv
            JOIN Producto p ON dv.id_producto = p.id_producto
            GROUP BY p.id_producto, p.nombre
            ORDER BY SUM(dv.cantidad) DESC
            LIMIT 1
        """)
        row = cursor.fetchone()
        producto_top = row[0] if row else "Sin datos"

        # ==================================================
        # TICKET PROMEDIO
        # ==================================================
        ticket_promedio = 0
        if ventas_registradas > 0:
            ticket_promedio = round(ingresos / ventas_registradas, 2)

        # ==================================================
        # SUCURSAL CON MÁS VENTAS
        # Venta tiene id_sucursal → Sucursal
        # ==================================================
        cursor.execute("""
            SELECT s.nombre
            FROM Venta v
            JOIN Sucursal s ON v.id_sucursal = s.id_sucursal
            GROUP BY s.id_sucursal, s.nombre
            ORDER BY COUNT(*) DESC
            LIMIT 1
        """)
        row = cursor.fetchone()
        sucursal_top = row[0] if row else "Sin datos"

        # ==================================================
        # ÓRDENES DE PRODUCCIÓN (registros en Produccion)
        # ==================================================
        cursor.execute("""
            SELECT COUNT(*)
            FROM Produccion
        """)
        ordenes_produccion = int(cursor.fetchone()[0])

        # ==================================================
        # PRODUCTO MÁS PRODUCIDO
        # ==================================================
        cursor.execute("""
            SELECT p.nombre
            FROM Produccion pr
            JOIN Producto p ON pr.id_producto = p.id_producto
            GROUP BY p.id_producto, p.nombre
            ORDER BY SUM(pr.cantidad) DESC
            LIMIT 1
        """)
        row = cursor.fetchone()
        prod_top = row[0] if row else "Sin datos"

        # ==================================================
        # EMPLEADOS EN PRODUCCIÓN
        # Produccion tiene id_empleado → Empleado
        # ==================================================
        cursor.execute("""
            SELECT COUNT(DISTINCT id_empleado)
            FROM Produccion
        """)
        empleados_produccion = int(cursor.fetchone()[0])

        # ==================================================
        # PROMEDIO DIARIO DE PRODUCCIÓN
        # Produccion tiene campo fecha DATE
        # ==================================================
        cursor.execute("""
            SELECT IFNULL(
                ROUND(
                    SUM(cantidad) * 1.0 /
                    NULLIF(COUNT(DISTINCT fecha), 0)
                , 1),
            0)
            FROM Produccion
        """)
        promedio_diario = float(cursor.fetchone()[0])

        # ==================================================
        # PRODUCTOS EN INVENTARIO (filas distintas)
        # ==================================================
        cursor.execute("""
            SELECT COUNT(DISTINCT id_producto)
            FROM Inventario
        """)
        productos_stock = int(cursor.fetchone()[0])

        # ==================================================
        # PRODUCTOS CRÍTICOS (stock < 10)
        # ==================================================
        cursor.execute("""
            SELECT COUNT(*)
            FROM Inventario
            WHERE stock < 10
        """)
        stock_critico = int(cursor.fetchone()[0])

        # ==================================================
        # SUCURSALES ABASTECIDAS (con al menos 1 producto > 0)
        # Inventario tiene id_sucursal → Sucursal
        # ==================================================
        cursor.execute("""
            SELECT COUNT(DISTINCT id_sucursal)
            FROM Inventario
            WHERE stock > 0
        """)
        sucursales_abastecidas = int(cursor.fetchone()[0])

        # ==================================================
        # ÚLTIMO REABASTECIMIENTO (fecha más reciente en Compra)
        # ==================================================
        cursor.execute("""
            SELECT DATE_FORMAT(MAX(fecha), '%d %b %Y')
            FROM Compra
        """)
        row = cursor.fetchone()
        ultimo_reabastecimiento = (
            row[0] if row and row[0] else "Sin datos"
        )

        # ==================================================
        # COMPRAS REALIZADAS
        # ==================================================
        cursor.execute("""
            SELECT COUNT(*)
            FROM Compra
        """)
        compras = int(cursor.fetchone()[0])

        # ==================================================
        # GASTO TOTAL EN COMPRAS
        # ==================================================
        cursor.execute("""
            SELECT IFNULL(
                ROUND(SUM(cantidad * precio_unitario), 2),
            0)
            FROM Detalle_Compra
        """)
        gasto_compras = float(cursor.fetchone()[0])

        # ==================================================
        # MATERIA PRIMA MÁS COMPRADA
        # ==================================================
        cursor.execute("""
            SELECT m.nombre
            FROM Detalle_Compra dc
            JOIN Materia_Prima m ON dc.id_materia = m.id_materia
            GROUP BY m.id_materia, m.nombre
            ORDER BY SUM(dc.cantidad) DESC
            LIMIT 1
        """)
        row = cursor.fetchone()
        materia_top = row[0] if row else "Sin datos"

        # ==================================================
        # PROVEEDOR PRINCIPAL (más órdenes de compra)
        # Compra tiene id_proveedor → Proveedor
        # ==================================================
        cursor.execute("""
            SELECT p.nombre
            FROM Compra c
            JOIN Proveedor p ON c.id_proveedor = p.id_proveedor
            GROUP BY p.id_proveedor, p.nombre
            ORDER BY COUNT(*) DESC
            LIMIT 1
        """)
        row = cursor.fetchone()
        proveedor_top = row[0] if row else "Sin datos"

        # ==================================================
        # PROVEEDORES ACTIVOS (con al menos 1 compra)
        # ==================================================
        cursor.execute("""
            SELECT COUNT(DISTINCT id_proveedor)
            FROM Compra
        """)
        proveedores_activos = int(cursor.fetchone()[0])

        # ==================================================
        # CAPACITACIONES ACTIVAS
        # ENUM: INSCRITO = en curso, sin fecha_fin pasada
        # Usamos Capacitacion.fecha_fin para saber si sigue activa
        # ==================================================
        cursor.execute("""
            SELECT COUNT(DISTINCT ec.id_capacitacion)
            FROM Empleado_Capacitacion ec
            JOIN Capacitacion c ON ec.id_capacitacion = c.id_capacitacion
            WHERE ec.estado = 'INSCRITO'
              AND (c.fecha_fin IS NULL OR c.fecha_fin >= CURDATE())
        """)
        capacitaciones_activas = int(cursor.fetchone()[0])

        # ==================================================
        # EMPLEADOS INSCRITOS EN ALGUNA CAPACITACIÓN
        # ==================================================
        cursor.execute("""
            SELECT COUNT(DISTINCT id_empleado)
            FROM Empleado_Capacitacion
        """)
        empleados_inscritos = int(cursor.fetchone()[0])

        # ==================================================
        # EMPLEADOS QUE COMPLETARON AL MENOS UNA CAPACITACIÓN
        # ==================================================
        cursor.execute("""
            SELECT COUNT(DISTINCT id_empleado)
            FROM Empleado_Capacitacion
            WHERE estado = 'COMPLETADO'
        """)
        empleados_completaron = int(cursor.fetchone()[0])

        # ==================================================
        # CALIFICACIÓN PROMEDIO (campo calificacion DECIMAL(5,2))
        # ==================================================
        cursor.execute("""
            SELECT IFNULL(
                ROUND(AVG(calificacion), 1),
            0)
            FROM Empleado_Capacitacion
            WHERE estado = 'COMPLETADO'
              AND calificacion IS NOT NULL
        """)
        calificacion_promedio = float(cursor.fetchone()[0])

        # ==================================================
        # VENTAS POR EMPLEADO (ingresos / total empleados)
        # ==================================================
        ventas_por_empleado = 0
        if empleados > 0:
            ventas_por_empleado = round(ingresos / empleados, 2)

        # ==================================================
        # EMPLEADO DESTAQUE (el que más ingresos generó en ventas)
        # Venta tiene id_empleado → Empleado
        # Total calculado desde Detalle_Venta agrupado por id_venta
        # ==================================================
        cursor.execute("""
            SELECT e.nombre
            FROM Venta v
            JOIN Empleado e ON v.id_empleado = e.id_empleado
            JOIN (
                SELECT id_venta, SUM(cantidad * precio) AS total
                FROM Detalle_Venta
                GROUP BY id_venta
            ) dv ON dv.id_venta = v.id_venta
            GROUP BY e.id_empleado, e.nombre
            ORDER BY SUM(dv.total) DESC
            LIMIT 1
        """)
        row = cursor.fetchone()
        empleado_destaque = row[0] if row else "Sin datos"

        # ==================================================
        # AUSENTISMO
        # No existe tabla Asistencia en el esquema actual.
        # Se devuelve null; agregar tabla si se requiere.
        # ==================================================
        ausentismo = None

        # ==================================================
        # VENTAS MENSUALES HISTÓRICAS (últimos 6 meses)
        # Total calculado desde Detalle_Venta JOIN Venta
        # ==================================================
        cursor.execute("""
            SELECT
                DATE_FORMAT(v.fecha, '%b') AS mes,
                ROUND(SUM(dv.cantidad * dv.precio), 2) AS valor
            FROM Venta v
            JOIN Detalle_Venta dv ON dv.id_venta = v.id_venta
            WHERE v.fecha >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
            GROUP BY
                DATE_FORMAT(v.fecha, '%Y-%m'),
                DATE_FORMAT(v.fecha, '%b')
            ORDER BY MIN(v.fecha)
        """)
        ventas_mensuales = [
            {"mes": row[0], "valor": float(row[1])}
            for row in cursor.fetchall()
        ]

    return Response({
        # RESUMEN
        "ingresos":             ingresos,
        "costos":               costos,
        "utilidad":             utilidad,
        "margen_bruto":         margen,

        # VENTAS
        "ventas_registradas":   ventas_registradas,
        "ticket_promedio":      ticket_promedio,
        "producto_top":         producto_top,
        "sucursal_top":         sucursal_top,

        # PRODUCCIÓN
        "produccion":               produccion,
        "ordenes_produccion":       ordenes_produccion,
        "producto_produccion_top":  prod_top,
        "empleados_produccion":     empleados_produccion,
        "promedio_diario":          promedio_diario,

        # INVENTARIO
        "stock":                    stock,
        "productos_stock":          productos_stock,
        "stock_critico":            stock_critico,
        "sucursales_abastecidas":   sucursales_abastecidas,
        "ultimo_reabastecimiento":  ultimo_reabastecimiento,

        # COMPRAS
        "compras":              compras,
        "gasto_compras":        gasto_compras,
        "materia_top":          materia_top,
        "proveedor_top":        proveedor_top,
        "proveedores_activos":  proveedores_activos,

        # CAPACITACIONES
        "capacitaciones":           capacitaciones,
        "capacitaciones_activas":   capacitaciones_activas,
        "empleados_inscritos":      empleados_inscritos,
        "empleados_completaron":    empleados_completaron,
        "calificacion_promedio":    calificacion_promedio,

        # RRHH
        "empleados":            empleados,
        "ventas_por_empleado":  ventas_por_empleado,
        "empleado_destaque":    empleado_destaque,
        "ausentismo":           ausentismo,

        # HISTÓRICO sparkline
        "ventas_mensuales":     ventas_mensuales,
    })


@api_view(['GET'])
def dashboard_kpi_meta(request):
    with connection.cursor() as cursor:
        cursor.execute(
            """
                SELECT nombre, IFNULL(meta, 0)
                FROM kpi_meta
            """
        )
        metas = [
            {"nombre": row[0], "meta": float(row[1])}
            for row in cursor.fetchall()
        ]

    return Response(metas)


@api_view(['GET'])
def dashboard_ultimas_ventas(request):
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT v.id_venta, IFNULL(c.nombre, 'Sin cliente'), IFNULL(s.nombre, 'Sin sucursal'),
                   DATE_FORMAT(v.fecha, '%d %b %Y'), IFNULL(ROUND(SUM(dv.cantidad * dv.precio), 2), 0), v.estado
            FROM Venta v
            LEFT JOIN Cliente c ON v.id_cliente = c.id_cliente
            LEFT JOIN Sucursal s ON v.id_sucursal = s.id_sucursal
            LEFT JOIN Detalle_Venta dv ON dv.id_venta = v.id_venta
            GROUP BY v.id_venta, c.nombre, s.nombre, v.fecha, v.estado
            ORDER BY v.fecha DESC
            LIMIT 5
        """)
        ventas = [
            {
                "id": f"V-{row[0]:04d}",
                "cliente": row[1],
                "sucursal": row[2],
                "fecha": row[3],
                "monto": float(row[4]),
                "estado": row[5] or "",
            }
            for row in cursor.fetchall()
        ]

    return Response(ventas)


@api_view(['GET'])
def dashboard_produccion_reciente(request):
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT pr.id_produccion, IFNULL(p.nombre, 'Sin producto'), pr.cantidad,
                   IFNULL(e.nombre, 'Sin empleado'), DATE_FORMAT(pr.fecha, '%d %b %Y')
            FROM Produccion pr
            LEFT JOIN Producto p ON pr.id_producto = p.id_producto
            LEFT JOIN Empleado e ON pr.id_empleado = e.id_empleado
            ORDER BY pr.fecha DESC
            LIMIT 5
        """)
        items = [
            {
                "id": row[0],
                "producto": row[1],
                "cantidad": int(row[2] or 0),
                "empleado": row[3],
                "fecha": row[4],
            }
            for row in cursor.fetchall()
        ]

    return Response(items)


@api_view(['GET'])
def dashboard_sucursales(request):
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT nombre
            FROM Sucursal
            ORDER BY nombre
        """)
        sucursales = [row[0] for row in cursor.fetchall()]

    return Response(sucursales)


@api_view(['GET'])
def dashboard_clientes_activos(request):
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT COUNT(DISTINCT id_cliente)
            FROM Venta
            WHERE fecha >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
        """)
        row = cursor.fetchone()
        clientes_activos = int(row[0]) if row and row[0] is not None else 0

    return Response({"clientes_activos": clientes_activos})


# ==============================================================================
# MÓDULO PREDICTIVO ESTRATÉGICO — agregado al final de views.py
# Usa regresión lineal (sklearn) + reglas IF para proyecciones del próx. periodo
# Instalar dependencias: pip install scikit-learn numpy
# ==============================================================================

try:
    import numpy as np
    from sklearn.linear_model import LinearRegression
    SKLEARN_OK = True
except ImportError:
    SKLEARN_OK = False


def _linear_predict(values: list) -> float:
    """Predice el siguiente valor usando regresión lineal simple."""
    n = len(values)
    if n == 0:
        return 0.0
    if n == 1:
        return values[0]
    if SKLEARN_OK:
        X = np.array(range(n)).reshape(-1, 1)
        y = np.array(values)
        model = LinearRegression()
        model.fit(X, y)
        pred = model.predict([[n]])[0]
        return max(0.0, float(pred))
    else:
        # Fallback sin sklearn: promedio ponderado
        weights = list(range(1, n + 1))
        total_w = sum(weights)
        return sum(v * w for v, w in zip(values, weights)) / total_w


def _growth_rate(values: list) -> float:
    """Tasa de crecimiento promedio entre períodos (%)."""
    if len(values) < 2:
        return 0.0
    rates = []
    for i in range(1, len(values)):
        if values[i - 1] > 0:
            rates.append((values[i] - values[i - 1]) / values[i - 1] * 100)
    return round(sum(rates) / len(rates), 2) if rates else 0.0


def _semaforo(score: float) -> str:
    if score >= 80:
        return "optimo"
    elif score >= 60:
        return "riesgo"
    return "critico"


def _tendencia(growth: float) -> str:
    if growth > 5:
        return "positiva"
    elif growth < -5:
        return "negativa"
    return "estable"


@api_view(['GET'])
def dashboard_predicciones(request):
    """
    GET /api/dashboard/predicciones/
    Devuelve predicciones estratégicas para el próximo periodo.
    """
    with connection.cursor() as cursor:

        # ── Historial ventas últimos 6 meses ──────────────────────────────
        cursor.execute("""
            SELECT
                DATE_FORMAT(v.fecha, '%b %Y') AS mes_label,
                DATE_FORMAT(v.fecha, '%Y-%m') AS mes_key,
                ROUND(SUM(dv.cantidad * dv.precio), 2) AS total
            FROM Venta v
            JOIN Detalle_Venta dv ON dv.id_venta = v.id_venta
            WHERE v.fecha >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
            GROUP BY mes_key, mes_label
            ORDER BY mes_key
        """)
        ventas_rows = cursor.fetchall()
        ventas_hist  = [float(r[2]) for r in ventas_rows]
        ventas_labels = [r[0] for r in ventas_rows]

        ventas_pred   = _linear_predict(ventas_hist)
        ventas_growth = _growth_rate(ventas_hist)

        # ── Historial producción últimos 6 meses ──────────────────────────
        cursor.execute("""
            SELECT
                DATE_FORMAT(fecha, '%b %Y') AS mes_label,
                DATE_FORMAT(fecha, '%Y-%m') AS mes_key,
                SUM(cantidad) AS total
            FROM Produccion
            WHERE fecha >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
            GROUP BY mes_key, mes_label
            ORDER BY mes_key
        """)
        prod_rows   = cursor.fetchall()
        prod_hist   = [float(r[2]) for r in prod_rows]
        prod_labels = [r[0] for r in prod_rows]

        prod_pred   = _linear_predict(prod_hist)
        prod_growth = _growth_rate(prod_hist)

        # ── Inventario + consumo promedio ─────────────────────────────────
        cursor.execute("SELECT IFNULL(SUM(stock), 0) FROM Inventario")
        stock_actual = float(cursor.fetchone()[0])

        cursor.execute("""
            SELECT IFNULL(
                ROUND(SUM(cantidad) / NULLIF(COUNT(DISTINCT DATE_FORMAT(fecha,'%Y-%m')), 0), 0),
            0)
            FROM Produccion
            WHERE fecha >= DATE_SUB(CURDATE(), INTERVAL 3 MONTH)
        """)
        consumo_mensual = float(cursor.fetchone()[0])

        semanas_stock = 0.0
        if consumo_mensual > 0:
            semanas_stock = round((stock_actual / consumo_mensual) * 4, 1)

        if semanas_stock >= 4:
            inv_score = 90.0
            inv_estado = "Stock suficiente para el próximo periodo"
        elif semanas_stock >= 2:
            inv_score = 65.0
            inv_estado = f"Inventario crítico estimado en {semanas_stock:.0f} semanas"
        else:
            inv_score = 35.0
            inv_estado = "Inventario en nivel crítico · reabastecimiento urgente"

        # ── Capacitaciones ────────────────────────────────────────────────
        cursor.execute("""
            SELECT IFNULL(
                ROUND(SUM(CASE WHEN estado='COMPLETADO' THEN 1 ELSE 0 END)
                      * 100.0 / NULLIF(COUNT(*), 0), 1), 0)
            FROM Empleado_Capacitacion
        """)
        cap_actual = float(cursor.fetchone()[0])

        cursor.execute("SELECT COUNT(*) FROM Empleado_Capacitacion WHERE estado='INSCRITO'")
        inscritos = int(cursor.fetchone()[0])

        cursor.execute("SELECT COUNT(*) FROM Empleado_Capacitacion")
        total_cap = int(cursor.fetchone()[0])

        completados = round(cap_actual * total_cap / 100) if total_cap > 0 else 0
        cap_pred = round(
            (completados + inscritos * 0.75) / (total_cap + inscritos) * 100, 1
        ) if (total_cap + inscritos) > 0 else cap_actual
        cap_growth = round(cap_pred - cap_actual, 1)

        # ── Empleados / rendimiento ───────────────────────────────────────
        cursor.execute("SELECT COUNT(*) FROM Empleado")
        total_emp = int(cursor.fetchone()[0])

        cursor.execute("SELECT IFNULL(ROUND(SUM(cantidad * precio), 2), 0) FROM Detalle_Venta")
        ingresos_total = float(cursor.fetchone()[0])

        ventas_x_emp = round(ingresos_total / total_emp, 2) if total_emp > 0 else 0.0
        rend_pred    = round(ventas_pred / total_emp, 2)    if total_emp > 0 else 0.0
        rend_growth  = _growth_rate([ventas_x_emp, rend_pred]) if ventas_x_emp > 0 else 0.0

    # ── Scores 0–100 por área ────────────────────────────────────────────────
    ventas_score = max(20.0, min(100.0, 75.0 + ventas_growth))
    prod_score   = max(20.0, min(100.0, 72.0 + prod_growth))
    cap_score    = min(100.0, cap_pred)
    emp_score    = 90.0 if rend_growth > 5 else 75.0 if rend_growth > 0 else 60.0 if rend_growth > -5 else 40.0

    # ── Índice global ponderado ──────────────────────────────────────────────
    # Ventas 40% | Producción 30% | Inventario 15% | Capacitaciones 10% | RRHH 5%
    indice_global = round(
        ventas_score * 0.40 +
        prod_score   * 0.30 +
        inv_score    * 0.15 +
        cap_score    * 0.10 +
        emp_score    * 0.05,
        1
    )

    # ── Alertas predictivas (reglas IF) ─────────────────────────────────────
    alertas = []
    if ventas_growth < -5:
        alertas.append({"tipo": "critico", "area": "Ventas",
                        "mensaje": "Posible disminución de ventas en el próximo periodo. Se detecta tendencia negativa."})
    elif ventas_growth < 0:
        alertas.append({"tipo": "riesgo", "area": "Ventas",
                        "mensaje": "Leve desaceleración en ventas. Monitorear comportamiento comercial."})
    if prod_growth < -5:
        alertas.append({"tipo": "critico", "area": "Producción",
                        "mensaje": "Producción insuficiente para el siguiente periodo. Revisar órdenes y capacidad."})
    if semanas_stock < 2:
        alertas.append({"tipo": "critico", "area": "Inventario",
                        "mensaje": "Stock proyectado en nivel crítico. Reabastecimiento urgente necesario."})
    elif semanas_stock < 4:
        alertas.append({"tipo": "riesgo", "area": "Inventario",
                        "mensaje": f"Inventario estimado para {semanas_stock:.0f} semanas. Considerar orden de compra."})
    if cap_pred < 60:
        alertas.append({"tipo": "riesgo", "area": "Capacitaciones",
                        "mensaje": "Capacitaciones con bajo impacto proyectado. Reforzar programas de formación."})
    if rend_growth < -5:
        alertas.append({"tipo": "riesgo", "area": "Empleados",
                        "mensaje": "Rendimiento por empleado con tendencia decreciente. Evaluar gestión de equipos."})
    if not alertas:
        alertas.append({"tipo": "optimo", "area": "General",
                        "mensaje": "Todos los indicadores muestran tendencia favorable para el próximo periodo."})

    # ── Recomendaciones (reglas IF) ──────────────────────────────────────────
    recomendaciones = []
    if ventas_score < 65:
        recomendaciones.append("Reforzar estrategias comerciales y revisar política de precios.")
    if prod_score < 65:
        recomendaciones.append("Optimizar procesos productivos e identificar cuellos de botella.")
    if inv_score < 65:
        recomendaciones.append("Gestionar reabastecimiento de inventario con proveedores clave.")
    if cap_score < 65:
        recomendaciones.append("Incrementar capacitaciones en áreas de ventas y producción.")
    if emp_score < 65:
        recomendaciones.append("Implementar incentivos de rendimiento para el equipo de ventas.")
    if not recomendaciones:
        recomendaciones.append("Mantener el ritmo operativo actual. Todos los indicadores son favorables.")

    # ── Histórico + punto predicho para gráficos ─────────────────────────────
    tendencias_ventas = [
        {"mes": l, "valor": round(v, 2), "tipo": "historico"}
        for l, v in zip(ventas_labels, ventas_hist)
    ] + [{"mes": "Próx. periodo", "valor": round(ventas_pred, 2), "tipo": "prediccion"}]

    tendencias_prod = [
        {"mes": l, "valor": int(v), "tipo": "historico"}
        for l, v in zip(prod_labels, prod_hist)
    ] + [{"mes": "Próx. periodo", "valor": int(prod_pred), "tipo": "prediccion"}]

    return Response({
        "ventas": {
            "valor_predicho": round(ventas_pred, 2),
            "crecimiento":    ventas_growth,
            "tendencia":      _tendencia(ventas_growth),
            "score":          round(ventas_score, 1),
            "semaforo":       _semaforo(ventas_score),
            "historico":      [{"mes": l, "valor": v} for l, v in zip(ventas_labels, ventas_hist)],
        },
        "produccion": {
            "valor_predicho": int(prod_pred),
            "crecimiento":    prod_growth,
            "tendencia":      _tendencia(prod_growth),
            "score":          round(prod_score, 1),
            "semaforo":       _semaforo(prod_score),
            "historico":      [{"mes": l, "valor": int(v)} for l, v in zip(prod_labels, prod_hist)],
        },
        "inventario": {
            "stock_actual":  int(stock_actual),
            "semanas_stock": semanas_stock,
            "estado":        inv_estado,
            "score":         round(inv_score, 1),
            "semaforo":      _semaforo(inv_score),
        },
        "capacitaciones": {
            "tasa_actual":   cap_actual,
            "tasa_predicha": cap_pred,
            "crecimiento":   cap_growth,
            "tendencia":     _tendencia(cap_growth),
            "score":         round(cap_score, 1),
            "semaforo":      _semaforo(cap_score),
        },
        "empleados": {
            "rendimiento_actual":   ventas_x_emp,
            "rendimiento_predicho": rend_pred,
            "crecimiento":          round(rend_growth, 1),
            "tendencia":            _tendencia(rend_growth),
            "score":                round(emp_score, 1),
            "semaforo":             _semaforo(emp_score),
        },
        "indice_global": {
            "valor":    indice_global,
            "semaforo": _semaforo(indice_global),
            "pesos":    {"ventas": 40, "produccion": 30, "inventario": 15, "capacitaciones": 10, "empleados": 5},
            "scores":   {
                "ventas":         round(ventas_score, 1),
                "produccion":     round(prod_score, 1),
                "inventario":     round(inv_score, 1),
                "capacitaciones": round(cap_score, 1),
                "empleados":      round(emp_score, 1),
            },
        },
        "alertas":         alertas,
        "recomendaciones": recomendaciones,
        "tendencias": {
            "ventas":     tendencias_ventas,
            "produccion": tendencias_prod,
        },
    })