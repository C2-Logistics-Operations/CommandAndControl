from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient  # type: ignore[import-not-found]
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    assert response.json()["status"] == "UP"

@patch("main.get_db_connection")
def test_login_credenciales_invalidas(mock_get_db):
    mock_conn = MagicMock()
    mock_cursor = MagicMock()

    # Retornar None al buscar usuario inexistente
    mock_cursor.fetchone.return_value = None
    
    # Enlazar los gestores de contexto con los mocks
    mock_cursor.__enter__.return_value = mock_cursor
    mock_conn.cursor.return_value = mock_cursor
    mock_conn.__enter__.return_value = mock_conn
    mock_get_db.return_value = mock_conn

    response = client.post(
        "/api/v1/auth/login",
        json={"username": "usuario_inexistente_c2", "password": "clave_falsa_2026"}
    )
    assert response.status_code == 401
    assert response.json()["detail"] == "Credenciales inválidas"

def test_acceso_denegado_sin_token():
    response = client.get("/api/v1/misiones")
    assert response.status_code == 401