from datetime import datetime, timedelta, timezone
from unittest.mock import MagicMock, patch
import jwt
from fastapi.testclient import TestClient
from main import app, evaluar_estado_mision
from auth import (
    SECRET_KEY, ALGORITHM,
    hash_password, verify_password, create_access_token
)

client = TestClient(app)


def make_mock_conn(fetchone_side_effect=None, fetchall_side_effect=None, execute_side_effect=None):
    conn = MagicMock()
    cursor = MagicMock()
    conn.cursor.return_value.__enter__.return_value = cursor
    if fetchone_side_effect is not None:
        cursor.fetchone.side_effect = fetchone_side_effect
    if fetchall_side_effect is not None:
        cursor.fetchall.side_effect = fetchall_side_effect
    if execute_side_effect is not None:
        cursor.execute.side_effect = execute_side_effect
    return conn, cursor


def test_auth_helpers_y_tokens_invalidos_expirados():
    hashed = hash_password("ClaveTactica2026")
    assert verify_password("ClaveTactica2026", hashed) is True
    assert verify_password("Incorrecta", hashed) is False

    # Token inválido
    res_invalid = client.get("/api/v1/suministros", headers={"Authorization": "Bearer token.invalido"})
    assert res_invalid.status_code == 401

    # Token expirado
    expired_payload = {
        "id": 1,
        "username": "cmd",
        "rol": "COMANDANTE",
        "exp": int((datetime.now(timezone.utc) - timedelta(hours=1)).timestamp())
    }
    expired_token = jwt.encode(expired_payload, SECRET_KEY, algorithm=ALGORITHM)
    res_exp = client.get("/api/v1/suministros", headers={"Authorization": f"Bearer {expired_token}"})
    assert res_exp.status_code == 401

    # Rol insuficiente (OPERADOR intentando crear misión)
    op_token = create_access_token({"id": 2, "username": "op1", "rol": "OPERADOR"})
    res_forbidden = client.post(
        "/api/v1/misiones",
        json={"nombre": "Recon", "rango_peligro": "BAJO"},
        headers={"Authorization": f"Bearer {op_token}"}
    )
    assert res_forbidden.status_code == 403


def test_register_y_login():
    conn_ok, _ = make_mock_conn(fetchone_side_effect=[{"id": 1, "username": "cmd1", "rol": "COMANDANTE"}])
    with patch("main.get_db_connection", return_value=conn_ok):
        res_reg = client.post("/api/v1/auth/register", json={"username": "cmd1", "password": "123", "rol": "COMANDANTE"})
        assert res_reg.status_code == 201
        assert res_reg.json()["username"] == "cmd1"

    conn_dup, _ = make_mock_conn(execute_side_effect=Exception("duplicate key"))
    with patch("main.get_db_connection", return_value=conn_dup):
        res_dup = client.post("/api/v1/auth/register", json={"username": "cmd1", "password": "123"})
        assert res_dup.status_code == 400

    # Login exitoso y fallido
    pwd_hash = hash_password("Secret123")
    conn_login_ok, _ = make_mock_conn(fetchone_side_effect=[{"id": 1, "username": "cmd1", "password_hash": pwd_hash, "rol": "COMANDANTE"}])
    with patch("main.get_db_connection", return_value=conn_login_ok):
        res_login = client.post("/api/v1/auth/login", json={"username": "cmd1", "password": "Secret123"})
        assert res_login.status_code == 200
        assert "token" in res_login.json()

    conn_login_fail, _ = make_mock_conn(fetchone_side_effect=[None])
    with patch("main.get_db_connection", return_value=conn_login_fail):
        res_fail = client.post("/api/v1/auth/login", json={"username": "nadie", "password": "123"})
        assert res_fail.status_code == 401


def test_endpoints_tacticos_y_manifiesto():
    cmd_token = create_access_token({"id": 1, "username": "cmd1", "rol": "COMANDANTE"})
    headers = {"Authorization": f"Bearer {cmd_token}"}

    # GET y POST suministros
    conn_sum_get, _ = make_mock_conn(fetchall_side_effect=[[{"id": 1, "item": "Botiquín", "categoria": "MED", "stock_disponible": 10}]])
    with patch("main.get_db_connection", return_value=conn_sum_get):
        assert client.get("/api/v1/suministros", headers=headers).status_code == 200

    conn_sum_post, _ = make_mock_conn(fetchone_side_effect=[{"id": 2, "item": "Radio", "categoria": "COMS", "stock_disponible": 5}])
    with patch("main.get_db_connection", return_value=conn_sum_post):
        assert client.post("/api/v1/suministros", json={"item": "Radio", "categoria": "COMS", "stock_disponible": 5}, headers=headers).status_code == 201

    # GET y POST misiones
    conn_mis_get, _ = make_mock_conn(fetchall_side_effect=[[{"id": 1, "nombre": "Alpha", "rango_peligro": "ALTO", "estado": "PLANIFICACION"}]])
    with patch("main.get_db_connection", return_value=conn_mis_get):
        assert client.get("/api/v1/misiones", headers=headers).status_code == 200

    conn_mis_post, _ = make_mock_conn(fetchone_side_effect=[{"id": 2, "nombre": "Bravo", "rango_peligro": "MEDIO", "estado": "PLANIFICACION"}])
    with patch("main.get_db_connection", return_value=conn_mis_post):
        assert client.post("/api/v1/misiones", json={"nombre": "Bravo", "rango_peligro": "MEDIO"}, headers=headers).status_code == 201

    # Helper evaluar_estado_mision (PLANIFICACION, HOLD y READY)
    conn_eval, _ = make_mock_conn(fetchall_side_effect=[
        [],
        [{"stock_disponible": 2, "cantidad_requerida": 5}],
        [{"stock_disponible": 10, "cantidad_requerida": 5}]
    ])
    assert evaluar_estado_mision(1, conn_eval) == "PLANIFICACION"
    assert evaluar_estado_mision(1, conn_eval) == "HOLD"
    assert evaluar_estado_mision(1, conn_eval) == "READY"

    # POST /misiones/{id}/manifiesto con broadcast WebSocket
    conn_manif, _ = make_mock_conn(fetchall_side_effect=[[{"stock_disponible": 10, "cantidad_requerida": 3}]])
    with patch("main.get_db_connection", return_value=conn_manif):
        res_manif = client.post(
            "/api/v1/misiones/1/manifiesto",
            json={"suministro_id": 1, "cantidad_requerida": 3},
            headers=headers
        )
        assert res_manif.status_code == 200
        assert res_manif.json()["nuevo_estado"] == "READY"

    # GET escuadrones y health
    conn_esc, _ = make_mock_conn(fetchall_side_effect=[[{"id": 1, "nombre_codigo": "ALFA-1", "especialidad": "LOG", "mision_id": 1}]])
    with patch("main.get_db_connection", return_value=conn_esc):
        assert client.get("/api/v1/escuadrones", headers=headers).status_code == 200

    assert client.get("/api/v1/health").status_code == 200


def test_websocket_connection_y_broadcast():
    with client.websocket_connect("/ws") as ws:
        ws.send_text("ping")
