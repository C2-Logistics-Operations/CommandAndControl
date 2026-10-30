<!-- calidad:inicio -->
![Calidad](https://img.shields.io/badge/Calidad-50%2F100-orange) ![Aprobado](https://img.shields.io/badge/Aprobado-NO-red) ![Cumple](https://img.shields.io/badge/Cumple-10%2F15-yellow) ![Duplicación](https://img.shields.io/badge/Duplicaci%C3%B3n-1.1%25-green) ![SEC](https://img.shields.io/badge/SEC-0-green) ![SQL](https://img.shields.io/badge/SQL-0-green) ![DBG](https://img.shields.io/badge/DBG-2-red) ![Capas](https://img.shields.io/badge/Capas-3-green) ![Tests](https://img.shields.io/badge/Tests-6-green) ![Cob](https://img.shields.io/badge/Cob-33%25-red) ![Vistas](https://img.shields.io/badge/Vistas-9-green)

**Calidad de servicios (heurístico):** índice **50/100** · cumple **10/15** · aprobado **NO** · capas **3**
Detalle completo en [`docs/EVALUACION.md`](docs/EVALUACION.md).
<!-- calidad:fin -->

# CommandAndControl
Sistema de Despliegue de Operaciones y Suministros.

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
