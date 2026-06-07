from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
import json

from django.db import connection
from django.http import JsonResponse

USUARIOS = [
    {"username": "admin1", "password": "123456", "rol": "Administrador", "id_empleado": 1},
    {"username": "admin2", "password": "123456", "rol": "Administrador", "id_empleado": 2},

    {"username": "prod1", "password": "123456", "rol": "Produccion", "id_empleado": 3},
    {"username": "prod2", "password": "123456", "rol": "Produccion", "id_empleado": 4},
    {"username": "prod3", "password": "123456", "rol": "Produccion", "id_empleado": 5},
    {"username": "prod4", "password": "123456", "rol": "Produccion", "id_empleado": 6},
    {"username": "prod5", "password": "123456", "rol": "Produccion", "id_empleado": 7},

    {"username": "ven1", "password": "123456", "rol": "Vendedor", "id_empleado": 8},
    {"username": "ven2", "password": "123456", "rol": "Vendedor", "id_empleado": 9},
    {"username": "ven3", "password": "123456", "rol": "Vendedor", "id_empleado": 10},
    {"username": "ven4", "password": "123456", "rol": "Vendedor", "id_empleado": 11},

    {"username": "caj1", "password": "123456", "rol": "Cajero", "id_empleado": 12},
    {"username": "caj2", "password": "123456", "rol": "Cajero", "id_empleado": 13},

    {"username": "alm1", "password": "123456", "rol": "Almacenero", "id_empleado": 14},
    {"username": "alm2", "password": "123456", "rol": "Almacenero", "id_empleado": 15},

    {"username": "rep1", "password": "123456", "rol": "Repartidor", "id_empleado": 16},
    {"username": "rep2", "password": "123456", "rol": "Repartidor", "id_empleado": 17},

    {"username": "ope1", "password": "123456", "rol": "Operario", "id_empleado": 18},
    {"username": "ope2", "password": "123456", "rol": "Operario", "id_empleado": 19},

    {"username": "sup1", "password": "123456", "rol": "Supervisor", "id_empleado": 20},
    {"username": "sup2", "password": "123456", "rol": "Supervisor", "id_empleado": 21},
]


# =========================================
# LOGIN
# =========================================

@csrf_exempt
def login(request):

    if request.method == "POST":

        data = json.loads(request.body)

        username = data.get("username")
        password = data.get("password")

        for usuario in USUARIOS:

            if (
                usuario["username"] == username and
                usuario["password"] == password
            ):

                return JsonResponse({
                    "success": True,
                    "usuario": username,
                    "rol": usuario["rol"],
                    "id_empleado": usuario["id_empleado"],
                    "token": "token_prueba"
                })

        return JsonResponse({
            "success": False,
            "message": "Usuario o contraseña incorrectos"
        }, status=401)


# =========================================
# EMPLEADO ACTUAL
# =========================================

@csrf_exempt
def empleado_actual(request, id):

    try:
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT id_empleado, nombre, cargo
                FROM Empleado
                WHERE id_empleado = %s
            """, [id])

            row = cursor.fetchone()

        if row:
            return JsonResponse({
                "id": row[0],
                "nombre": row[1],
                "cargo": row[2]
            })

        return JsonResponse({
            "error": "Empleado no encontrado"
        }, status=404)

    except Exception as e:
        return JsonResponse({
            "error": str(e)
        }, status=500)
    
# =========================================
# 🚀 DASHBOARD (TODO EN UNO)
# =========================================
@csrf_exempt
def empleado_dashboard(request, id):

    try:
        with connection.cursor() as cursor:

            # EMPLEADO
            cursor.execute("""
                SELECT id_empleado, nombre, cargo
                FROM Empleado
                WHERE id_empleado = %s
            """, [id])

            emp = cursor.fetchone()

            # CAPACITACIONES
            cursor.execute("""
                SELECT c.nombre, c.instructor, ec.estado, ec.calificacion, c.fecha_fin
                FROM Empleado_Capacitacion ec
                JOIN Capacitacion c ON c.id_capacitacion = ec.id_capacitacion
                WHERE ec.id_empleado = %s
            """, [id])

            caps = cursor.fetchall()

        return JsonResponse({
            "empleado": {
                "id": emp[0],
                "nombre": emp[1],
                "cargo": emp[2],
            } if emp else None,

            "capacitaciones": [
                {
                    "nombre": c[0],
                    "instructor": c[1],
                    "estado": c[2],
                    "calificacion": c[3],
                    "fecha_fin": c[4],
                }
                for c in caps
            ],

            "objetivos": [],
            "metricas": []
        })

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
    
# =========================================
# OBJETIVOS DEL EMPLEADO
# Agregar en views.py
# =========================================

@csrf_exempt
def empleado_objetivos(request, id):
    try:
        with connection.cursor() as cursor:

            # Empleado
            cursor.execute("""
                SELECT id_empleado, nombre, cargo
                FROM Empleado
                WHERE id_empleado = %s
            """, [id])
            emp = cursor.fetchone()

            # Todos los objetivos (no están ligados a un empleado específico
            # en la BD actual, se muestran los objetivos globales)
            # Si en el futuro agregas id_empleado a la tabla Objetivo,
            # cambia WHERE a: WHERE id_empleado = %s
            cursor.execute("""
                SELECT id_objetivo, titulo, descripcion, area,
                       estado, progreso, responsable, fecha_limite
                FROM Objetivo
                ORDER BY
                    CASE estado
                        WHEN 'EN_RIESGO'   THEN 1
                        WHEN 'EN_PROGRESO' THEN 2
                        WHEN 'PENDIENTE'   THEN 3
                        WHEN 'COMPLETADO'  THEN 4
                    END,
                    fecha_limite ASC
            """)
            objetivos = cursor.fetchall()

        return JsonResponse({
            "empleado": {
                "id":     emp[0],
                "nombre": emp[1],
                "cargo":  emp[2],
            } if emp else None,

            "objetivos": [
                {
                    "id_objetivo":  o[0],
                    "titulo":       o[1],
                    "descripcion":  o[2],
                    "area":         o[3],
                    "estado":       o[4],
                    "progreso":     o[5],
                    "responsable":  o[6],
                    "fecha_limite": str(o[7]) if o[7] else None,
                }
                for o in objetivos
            ],
        })

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

# =========================================
# REPORTES GENERALES
# Agregar en views.py
# =========================================

@csrf_exempt
def reportes_lista(request):
    try:
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT id_reporte, nombre, categoria, fecha, estado, detalle
                FROM Reporte
                ORDER BY fecha DESC
            """)
            rows = cursor.fetchall()

        return JsonResponse([
            {
                "id_reporte": r[0],
                "nombre":     r[1],
                "categoria":  r[2],
                "fecha":      str(r[3]) if r[3] else None,
                "estado":     r[4],
                "detalle":    json.loads(r[5]) if isinstance(r[5], str) else r[5],
            }
            for r in rows
        ], safe=False)

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

# =========================================
# PERFIL COMPLETO DEL EMPLEADO
# Agregar en views.py
# =========================================
 
@csrf_exempt
def empleado_perfil(request, id):
    try:
        with connection.cursor() as cursor:
 
            # Datos del empleado
            cursor.execute("""
                SELECT id_empleado, nombre, cargo
                FROM Empleado
                WHERE id_empleado = %s
            """, [id])
            emp = cursor.fetchone()
 
            if not emp:
                return JsonResponse({"error": "Empleado no encontrado"}, status=404)
 
            # Capacitaciones
            cursor.execute("""
                SELECT c.nombre, ec.estado, ec.calificacion, c.fecha_fin
                FROM Empleado_Capacitacion ec
                JOIN Capacitacion c ON c.id_capacitacion = ec.id_capacitacion
                WHERE ec.id_empleado = %s
                ORDER BY c.fecha_fin DESC
            """, [id])
            caps = cursor.fetchall()
 
            # Producciones recientes (para roles de producción)
            cursor.execute("""
                SELECT p.fecha, p.cantidad, pr.nombre AS producto
                FROM Produccion p
                JOIN Producto pr ON pr.id_producto = p.id_producto
                WHERE p.id_empleado = %s
                ORDER BY p.fecha DESC
                LIMIT 5
            """, [id])
            producciones = cursor.fetchall()
 
            # Ventas recientes por sucursal del empleado
            # (ventas donde participó como empleado)
            cursor.execute("""
                SELECT v.fecha,
                       COUNT(dv.id_detalle) AS items,
                       SUM(dv.cantidad * dv.precio) AS total,
                       s.nombre AS sucursal
                FROM Venta v
                JOIN Detalle_Venta dv ON dv.id_venta = v.id_venta
                JOIN Sucursal s ON s.id_sucursal = v.id_sucursal
                WHERE v.id_empleado = %s
                GROUP BY v.id_venta, v.fecha, s.nombre
                ORDER BY v.fecha DESC
                LIMIT 5
            """, [id])
            ventas = cursor.fetchall()
 
        completados  = [c for c in caps if c[1] == "COMPLETADO"]
        califs       = [c[2] for c in completados if c[2] is not None]
        calif_prom   = round(sum(califs) / len(califs), 1) if califs else None
 
        return JsonResponse({
            "empleado": {
                "id":    emp[0],
                "nombre": emp[1],
                "cargo":  emp[2],
            },
            "resumen": {
                "cursos_completados": len(completados),
                "cursos_total":       len(caps),
                "calificacion_prom":  calif_prom,
                "producciones_total": sum(p[1] for p in producciones) if producciones else 0,
                "ventas_total":       len(ventas),
            },
            "capacitaciones": [
                {
                    "nombre":       c[0],
                    "estado":       c[1],
                    "calificacion": float(c[2]) if c[2] else None,
                    "fecha_fin":    str(c[3]) if c[3] else None,
                }
                for c in caps
            ],
            "producciones": [
                {
                    "fecha":    str(p[0]) if p[0] else None,
                    "cantidad": p[1],
                    "producto": p[2],
                }
                for p in producciones
            ],
            "ventas": [
                {
                    "fecha":    str(v[0]) if v[0] else None,
                    "items":    v[1],
                    "total":    float(v[2]) if v[2] else 0,
                    "sucursal": v[3],
                }
                for v in ventas
            ],
        })
 
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

# =========================================
# PRODUCCIÓN DEL EMPLEADO
# =========================================

@csrf_exempt
def empleado_produccion(request, id):
    try:
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT p.id_produccion, pr.nombre, p.cantidad,
                       p.fecha, e.nombre AS empleado
                FROM Produccion p
                JOIN Producto pr ON pr.id_producto = p.id_producto
                JOIN Empleado e  ON e.id_empleado  = p.id_empleado
                WHERE p.id_empleado = %s
                ORDER BY p.fecha DESC
            """, [id])
            rows = cursor.fetchall()

        return JsonResponse([
            {
                "id":       f"LOT-{str(r[0]).zfill(3)}",
                "producto": r[1],
                "cantidad": r[2],
                "fecha":    str(r[3]) if r[3] else None,
                "empleado": r[4],
            }
            for r in rows
        ], safe=False)

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
    
# =========================================
# CRUD PRODUCCIÓN
# =========================================

@csrf_exempt
def produccion_crear(request):
    if request.method != "POST":
        return JsonResponse({"error": "Método no permitido"}, status=405)
    try:
        data        = json.loads(request.body)
        id_producto = data.get("id_producto")
        id_empleado = data.get("id_empleado")
        fecha       = data.get("fecha")
        cantidad    = data.get("cantidad")

        with connection.cursor() as cursor:
            cursor.execute("""
                INSERT INTO Produccion (id_producto, id_empleado, fecha, cantidad)
                VALUES (%s, %s, %s, %s)
            """, [id_producto, id_empleado, fecha, cantidad])

        return JsonResponse({"success": True})
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


@csrf_exempt
def produccion_editar(request, id):
    if request.method != "PUT":
        return JsonResponse({"error": "Método no permitido"}, status=405)
    try:
        data        = json.loads(request.body)
        id_producto = data.get("id_producto")
        fecha       = data.get("fecha")
        cantidad    = data.get("cantidad")

        with connection.cursor() as cursor:
            cursor.execute("""
                UPDATE Produccion
                SET id_producto = %s, fecha = %s, cantidad = %s
                WHERE id_produccion = %s
            """, [id_producto, fecha, cantidad, id])

        return JsonResponse({"success": True})
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


@csrf_exempt
def produccion_eliminar(request, id):
    if request.method != "DELETE":
        return JsonResponse({"error": "Método no permitido"}, status=405)
    try:
        with connection.cursor() as cursor:
            cursor.execute("DELETE FROM Produccion WHERE id_produccion = %s", [id])
        return JsonResponse({"success": True})
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


@csrf_exempt
def productos_lista(request):
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT id_producto, nombre FROM Producto ORDER BY nombre")
            rows = cursor.fetchall()
        return JsonResponse([{"id": r[0], "nombre": r[1]} for r in rows], safe=False)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
    
# =========================================
# VENTAS DEL EMPLEADO
# =========================================

@csrf_exempt
def empleado_ventas(request, id):
    try:
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT v.id_venta, c.nombre AS cliente, s.nombre AS sucursal,
                       v.fecha, v.id_cliente, v.id_sucursal
                FROM Venta v
                JOIN Cliente  c ON c.id_cliente  = v.id_cliente
                JOIN Sucursal s ON s.id_sucursal = v.id_sucursal
                WHERE v.id_empleado = %s
                ORDER BY v.fecha DESC
            """, [id])
            rows = cursor.fetchall()

        return JsonResponse([
            {
                "id":          f"V-{str(r[0]).zfill(3)}",
                "id_raw":      r[0],
                "cliente":     r[1],
                "sucursal":    r[2],
                "fecha":       str(r[3]) if r[3] else None,
                "id_cliente":  r[4],
                "id_sucursal": r[5],
            }
            for r in rows
        ], safe=False)

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


@csrf_exempt
def venta_crear(request):
    if request.method != "POST":
        return JsonResponse({"error": "Método no permitido"}, status=405)
    try:
        data        = json.loads(request.body)
        id_cliente  = data.get("id_cliente")
        id_sucursal = data.get("id_sucursal")
        id_empleado = data.get("id_empleado")
        fecha       = data.get("fecha")

        with connection.cursor() as cursor:
            cursor.execute("""
                INSERT INTO Venta (id_cliente, id_sucursal, id_empleado, fecha)
                VALUES (%s, %s, %s, %s)
            """, [id_cliente, id_sucursal, id_empleado, fecha])

        return JsonResponse({"success": True})
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


@csrf_exempt
def venta_eliminar(request, id):
    if request.method != "DELETE":
        return JsonResponse({"error": "Método no permitido"}, status=405)
    try:
        with connection.cursor() as cursor:
            cursor.execute("DELETE FROM Venta WHERE id_venta = %s", [id])
        return JsonResponse({"success": True})
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
    
@csrf_exempt
def venta_editar(request, id):
    if request.method != "PUT":
        return JsonResponse({"error": "Método no permitido"}, status=405)
    try:
        data        = json.loads(request.body)
        id_cliente  = data.get("id_cliente")
        id_sucursal = data.get("id_sucursal")
        fecha       = data.get("fecha")

        with connection.cursor() as cursor:
            cursor.execute("""
                UPDATE Venta
                SET id_cliente = %s, id_sucursal = %s, fecha = %s
                WHERE id_venta = %s
            """, [id_cliente, id_sucursal, fecha, id])

        return JsonResponse({"success": True})
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


# =========================================
# CLIENTES
# =========================================

@csrf_exempt
def clientes_lista(request):
    try:
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT id_cliente, nombre
                FROM Cliente
                ORDER BY nombre
            """)
            rows = cursor.fetchall()

        return JsonResponse([
            {
                "id":     r[0],
                "nombre": r[1],
            }
            for r in rows
        ], safe=False)

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

@csrf_exempt
def cliente_crear(request):
    if request.method != "POST":
        return JsonResponse({"error": "Método no permitido"}, status=405)
    try:
        data   = json.loads(request.body)
        nombre = data.get("nombre", "").strip()
        if not nombre:
            return JsonResponse({"error": "Nombre requerido"}, status=400)

        with connection.cursor() as cursor:
            # Verifica duplicado
            cursor.execute("SELECT id_cliente FROM Cliente WHERE nombre = %s", [nombre])
            if cursor.fetchone():
                return JsonResponse({"error": "Ya existe un cliente con ese nombre"}, status=400)

            cursor.execute("INSERT INTO Cliente (nombre) VALUES (%s)", [nombre])

        return JsonResponse({"success": True})
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


@csrf_exempt
def cliente_editar(request, id):
    if request.method != "PUT":
        return JsonResponse({"error": "Método no permitido"}, status=405)
    try:
        data   = json.loads(request.body)
        nombre = data.get("nombre", "").strip()
        if not nombre:
            return JsonResponse({"error": "Nombre requerido"}, status=400)

        with connection.cursor() as cursor:
            # Verifica duplicado excluyendo el actual
            cursor.execute(
                "SELECT id_cliente FROM Cliente WHERE nombre = %s AND id_cliente != %s",
                [nombre, id]
            )
            if cursor.fetchone():
                return JsonResponse({"error": "Ya existe un cliente con ese nombre"}, status=400)

            cursor.execute(
                "UPDATE Cliente SET nombre = %s WHERE id_cliente = %s",
                [nombre, id]
            )

        return JsonResponse({"success": True})
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


@csrf_exempt
def cliente_eliminar(request, id):
    if request.method != "DELETE":
        return JsonResponse({"error": "Método no permitido"}, status=405)
    try:
        with connection.cursor() as cursor:
            cursor.execute("DELETE FROM Cliente WHERE id_cliente = %s", [id])
        return JsonResponse({"success": True})
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

# =========================================
# SUCURSALES
# =========================================

@csrf_exempt
def sucursales_lista(request):
    try:
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT id_sucursal, nombre, ubicacion
                FROM Sucursal
                ORDER BY nombre
            """)
            rows = cursor.fetchall()

        return JsonResponse([
            {
                "id":        r[0],
                "nombre":    r[1],
                "ubicacion": r[2],
            }
            for r in rows
        ], safe=False)

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
    
# =========================================
# INVENTARIO POR SUCURSAL
# =========================================

@csrf_exempt
def inventario_por_sucursal(request, id_sucursal=None):
    try:
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT p.id_producto, p.nombre, p.tipo,
                       i.stock, i.id_inventario
                FROM Inventario i
                JOIN Producto p ON p.id_producto = i.id_producto
                ORDER BY p.tipo, p.nombre
            """)
            rows = cursor.fetchall()

        def estado(stock):
            if stock == 0:  return "CRITICO"
            if stock < 50:  return "BAJO"
            return "OK"

        return JsonResponse([
            {
                "id":        f"INV-{str(r[4]).zfill(3)}",
                "id_inv":    r[4],
                "nombre":    r[1],
                "categoria": r[2],
                "stock":     r[3],
                "unidad":    "und",
                "minimo":    50,
                "estado":    estado(r[3]),
            }
            for r in rows
        ], safe=False)

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

@csrf_exempt
def inventario_editar(request, id):
    if request.method != "PUT":
        return JsonResponse({"error": "Método no permitido"}, status=405)
    try:
        data  = json.loads(request.body)
        stock = data.get("stock")

        with connection.cursor() as cursor:
            cursor.execute("""
                UPDATE Inventario SET stock = %s
                WHERE id_inventario = %s
            """, [stock, id])

        return JsonResponse({"success": True})
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


@csrf_exempt
def inventario_crear(request):
    if request.method != "POST":
        return JsonResponse({"error": "Método no permitido"}, status=405)
    try:
        data        = json.loads(request.body)
        id_producto = data.get("id_producto")
        id_sucursal = data.get("id_sucursal")
        stock       = data.get("stock")

        with connection.cursor() as cursor:
            # Evita duplicado producto+sucursal
            cursor.execute("""
                SELECT id_inventario FROM Inventario
                WHERE id_producto = %s AND id_sucursal = %s
            """, [id_producto, id_sucursal])
            if cursor.fetchone():
                return JsonResponse({"error": "Ya existe ese producto en esa sucursal"}, status=400)

            cursor.execute("""
                INSERT INTO Inventario (id_producto, id_sucursal, stock)
                VALUES (%s, %s, %s)
            """, [id_producto, id_sucursal, stock])

        return JsonResponse({"success": True})
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


@csrf_exempt
def inventario_eliminar(request, id):
    if request.method != "DELETE":
        return JsonResponse({"error": "Método no permitido"}, status=405)
    try:
        with connection.cursor() as cursor:
            cursor.execute("DELETE FROM Inventario WHERE id_inventario = %s", [id])
        return JsonResponse({"success": True})
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


@csrf_exempt
def stock_por_sucursal(request, id_sucursal=None):
    try:
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT p.nombre, p.tipo, SUM(i.stock) as stock
                FROM Inventario i
                JOIN Producto p ON p.id_producto = i.id_producto
                GROUP BY p.id_producto, p.nombre, p.tipo
                ORDER BY p.nombre
            """)
            rows = cursor.fetchall()

        MAXIMOS = {"Tableta": 500, "Bombon": 100, "Caja": 200}

        return JsonResponse([
            {
                "nombre": r[0],
                "tipo":   r[1],
                "actual": r[2],
                "maximo": MAXIMOS.get(r[1], 300),
                "unidad": "und",
            }
            for r in rows
        ], safe=False)

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)