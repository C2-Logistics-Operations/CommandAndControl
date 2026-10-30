# C2 Logistics & Ops - Command & Control Integration System

![CI/CD Pipeline](https://github.com/C2-Logistics-Operations/CommandAndControl/actions/workflows/ci.yml/badge.svg)
![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

Sistema integrador de Comando y Control (C2) de logística militar y pertrechos tácticos, desarrollado con arquitectura distribuida multi-stack, WebSockets en tiempo real, testing automatizado e integración continua.

---

## Arquitectura de la Plataforma
                              +-------------------+
                              |   Nginx Proxy /   |
                              |   Browsers (E2E)  |
                              +---------+---------+
                                        |
                +-----------------------+-----------------------+
                |                                               |
     http://localhost:8080                           http://localhost:8081
+---------------+---------------+               +---------------+---------------+
|  Frontend A: React 18 + Vite  |               |   Frontend B: Vue 3 + Vite    |
|  (Vitest, Testing Library)    |               |   (Vitest, Vue Test Utils)    |
+---------------+---------------+               +---------------+---------------+
                |                                               |
                +-----------------------+-----------------------+
                                        | (REST / WebSockets)
                +-----------------------+-----------------------+
                |                                               |
     http://localhost:3000                           http://localhost:8000
+---------------+---------------+               +---------------+---------------+
|  Backend A: Node.js / Express |               |  Backend B: Python / FastAPI  |
|  (Jest, Supertest, WS)        |               |  (PyTest, HTTPX, WebSockets)  |
+---------------+---------------+               +---------------+---------------+
                |                                               |
                +-----------------------+-----------------------+
                                        |
                             +----------+----------+
                             | PostgreSQL Database |
                             | (Puerta 5432)       |
                             +---------------------+

---

## Tecnologías Utilizadas

| Componente | Tecnología principal | Entorno de Pruebas |
| :--- | :--- | :--- |
| **Backend A** | Node.js, Express.js, PostgreSQL (`pg`), `ws` | Jest + Supertest |
| **Backend B** | Python 3.10+, FastAPI, `asyncpg` | PyTest + HTTPX |
| **Frontend A** | React 18, Vite, React Router DOM | Vitest + Testing Library |
| **Frontend B** | Vue 3 (Composition API), Vite, Vue Router | Vitest + Vue Test Utils |
| **Pruebas E2E** | Playwright (Chromium) | Playwright Test Suite |
| **CI/CD** | GitHub Actions | Workflows automatizados |
| **Contenedores** | Docker & Docker Compose | Nginx multi-stage builds |

---

## Despliegue Rápido con Docker Compose

```bash
# 1. Clonar el repositorio
git clone [https://github.com/C2-Logistics-Operations/CommandAndControl.git](https://github.com/C2-Logistics-Operations/CommandAndControl.git)
cd CommandAndControl

# 2. Reconstruir y levantar todos los servicios
docker compose up -d --build

# 3. Verificar estado de los contenedores
docker compose ps