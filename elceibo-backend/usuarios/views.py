from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
# Create your views here.
from django.http import JsonResponse
import json

USUARIOS = [
    {"username": "admin1", "password": "123456", "rol": "Administrador"},
    {"username": "admin2", "password": "123456", "rol": "Administrador"},

    {"username": "prod1", "password": "123456", "rol": "Produccion"},
    {"username": "prod2", "password": "123456", "rol": "Produccion"},
    {"username": "prod3", "password": "123456", "rol": "Produccion"},
    {"username": "prod4", "password": "123456", "rol": "Produccion"},
    {"username": "prod5", "password": "123456", "rol": "Produccion"},

    {"username": "alm1", "password": "123456", "rol": "Almacenero"},
    {"username": "alm2", "password": "123456", "rol": "Almacenero"},

    {"username": "ven1", "password": "123456", "rol": "Vendedor"},
    {"username": "ven2", "password": "123456", "rol": "Vendedor"},
    {"username": "ven3", "password": "123456", "rol": "Vendedor"},
    {"username": "ven4", "password": "123456", "rol": "Vendedor"},

    {"username": "caj1", "password": "123456", "rol": "Cajero"},
    {"username": "caj2", "password": "123456", "rol": "Cajero"},
]
@csrf_exempt  # ← agrega esto
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
                    "token": "token_prueba"
                })

        return JsonResponse({
            "success": False,
            "message": "Usuario o contraseña incorrectos"
        }, status=401)