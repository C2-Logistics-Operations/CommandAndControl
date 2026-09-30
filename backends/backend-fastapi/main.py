from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from database import get_db_connection
from auth import (
    hash_password, verify_password, create_access_token,
    obtener_usuario_actual, verificar_rol
)

app = FastAPI(title="C2 Command System - Backend FastAPI", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Schemas Pydantic
class AuthSchema(BaseModel):
    username: str
    password: str
    rol: Optional[str] = "OPERADOR"

class SuministroSchema(BaseModel):
    item: str
    categoria: str
    stock_disponible: int

class MisionSchema(BaseModel):
    nombre: str
    rango_peligro: str

class ManifiestoSchema(BaseModel):
    suministro_id: int
    cantidad_requerida: int

class EscuadronSchema(BaseModel):
    nombre_codigo: str
    especialidad: str
    mision_id: Optional[int] = None

# Helper de Regla de Negocio
# Helper con Context Manager Seguro contra fugas de memoria
def evaluar_estado_mision(mision_id: int, conn):
    with conn.cursor() as cursor:  # <-- Cierre automático garantizado
        query = """
            SELECT mm.cantidad_requerida, s.stock_disponible 
            FROM manifiesto_mision mm
            JOIN suministros s ON mm.suministro_id = s.id
            WHERE mm.mision_id = %s
        """
        cursor.execute(query, (mision_id,))
        reqs = cursor.fetchall()

        if not reqs:
            nuevo_estado = "PLANIFICACION"
        else:
            faltante = any(r["stock_disponible"] < r["cantidad_requerida"] for r in reqs)
            nuevo_estado = "HOLD" if faltante else "READY"

        cursor.execute("UPDATE misiones SET estado = %s WHERE id = %s", (nuevo_estado, mision_id))
        conn.commit()
    return nuevo_estado

# --- RUTAS DE AUTENTICACIÓN ---
@app.post("/api/v1/auth/register", status_code=201)
def register(data: AuthSchema):
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            pwd_hash = hash_password(data.password)
            cursor.execute(
                "INSERT INTO usuarios (username, password_hash, rol) VALUES (%s, %s, %s) RETURNING id, username, rol",
                (data.username, pwd_hash, data.rol)
            )
            user = cursor.fetchone()
            conn.commit()
            return user
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail="El usuario ya existe o datos inválidos")
    finally:
        conn.close()

@app.post("/api/v1/auth/login")
def login(data: AuthSchema):
    conn = get_db_connection()
    with conn.cursor() as cursor:
        cursor.execute("SELECT * FROM usuarios WHERE username = %s", (data.username,))
        user = cursor.fetchone()
    conn.close()

    if not user or not verify_password(data.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Credenciales inválidas")

    token = create_access_token({"id": user["id"], "username": user["username"], "rol": user["rol"]})
    return {"token": token, "usuario": {"id": user["id"], "username": user["username"], "rol": user["rol"]}}

# --- RUTAS DOMINIO TÁCTICO ---
@app.get("/api/v1/suministros")
def listar_suministros(user: dict = Depends(obtener_usuario_actual)):
    conn = get_db_connection()
    with conn.cursor() as cursor:
        cursor.execute("SELECT * FROM suministros ORDER BY id ASC")
        items = cursor.fetchall()
    conn.close()
    return items

@app.post("/api/v1/suministros", status_code=201)
def crear_suministro(data: SuministroSchema, user: dict = Depends(verificar_rol("COMANDANTE"))):
    conn = get_db_connection()
    with conn.cursor() as cursor:
        cursor.execute(
            "INSERT INTO suministros (item, categoria, stock_disponible) VALUES (%s, %s, %s) RETURNING *",
            (data.item, data.categoria, data.stock_disponible)
        )
        nuevo = cursor.fetchone()
        conn.commit()
    conn.close()
    return nuevo

@app.get("/api/v1/misiones")
def listar_misiones(user: dict = Depends(obtener_usuario_actual)):
    conn = get_db_connection()
    with conn.cursor() as cursor:
        cursor.execute("SELECT * FROM misiones ORDER BY id ASC")
        misiones = cursor.fetchall()
    conn.close()
    return misiones

@app.post("/api/v1/misiones", status_code=201)
def crear_mision(data: MisionSchema, user: dict = Depends(verificar_rol("COMANDANTE"))):
    conn = get_db_connection()
    with conn.cursor() as cursor:
        cursor.execute(
            "INSERT INTO misiones (nombre, rango_peligro, estado) VALUES (%s, %s, 'PLANIFICACION') RETURNING *",
            (data.nombre, data.rango_peligro)
        )
        mision = cursor.fetchone()
        conn.commit()
    conn.close()
    return mision

# Cambiado {mision_id} por {id} para coincidir exactamente con el criterio del enunciado
@app.post("/api/v1/misiones/{id}/manifiesto")
def asignar_manifiesto(id: int, data: ManifiestoSchema, user: dict = Depends(verificar_rol("COMANDANTE"))):
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute(
                """INSERT INTO manifiesto_mision (mision_id, suministro_id, cantidad_requerida)
                   VALUES (%s, %s, %s)
                   ON CONFLICT (mision_id, suministro_id)
                   DO UPDATE SET cantidad_requerida = EXCLUDED.cantidad_requerida""",
                (id, data.suministro_id, data.cantidad_requerida)
            )
            conn.commit()

        # Evaluación con la misma conexión de forma segura
        nuevo_estado = evaluar_estado_mision(id, conn)
    finally:
        conn.close()

    return {"mensaje": "Manifiesto actualizado", "mision_id": id, "nuevo_estado": nuevo_estado}

@app.get("/api/v1/escuadrones")
def listar_escuadrones(user: dict = Depends(obtener_usuario_actual)):
    conn = get_db_connection()
    with conn.cursor() as cursor:
        cursor.execute("SELECT * FROM escuadrones ORDER BY id ASC")
        escuadrones = cursor.fetchall()
    conn.close()
    return escuadrones

@app.get("/api/v1/health")
def health_check():
    return {"status": "UP", "service": "Backend B - FastAPI"}