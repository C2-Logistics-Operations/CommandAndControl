# C2 Logistics & Ops (Command and Control)
**Sistema de Despliegue de Operaciones Tácticas y Control de Suministros**

## 1. Modalidad y Alumno
- **Modalidad:** Trabajo Individual
- **Materia:** Programación 3
- **Nivel:** 5to Año - Técnico en Informática

---

## 2. Objetivo Principal (Paso 1)
Desarrollar un sistema web de mando y control táctico que permita gestionar Misiones Militares, coordinar los Escuadrones asignados y controlar el Inventario de Suministros en base de operaciones. El sistema evalúa automáticamente si una misión cuenta con el stock necesario para su ejecución (Estado: `Ready`) o si queda diferida por falta de insumos (Estado: `Hold`).

---

## 3. Límites y Alcances (Paso 2)

### 3.1. Límites del Sistema (Scope Boundaries)
* **✅ Dentro del Proyecto:**
  * Gestión de Misiones, Escuadrones, Suministros y Manifiesto de Carga.
  * Autenticación y Autorización basada en roles (`COMANDANTE` y `OPERADOR`) mediante tokens JWT.
  * Verificación automática de disponibilidad de stock para cambio de estado de misión.
  * Base de Datos PostgreSQL totalmente contenerizada en Docker con volúmenes de persistencia[cite: 1].
  * 2 Servicios Backend (Express.js y FastAPI) con paridad total de endpoints[cite: 1].
  * 2 Aplicaciones Frontend (React y Vue.js) con paridad total de vistas y flujo de usuario[cite: 1].
  * Estética diferenciada: Modo "HUD Terminal" para React y Modo "Manual OTAN" para Vue.js.

* **❌ Fuera del Proyecto:**
  * Integración con mapas GPS o geolocalización en tiempo real (Leaflet/Mapbox).
  * WebSockets para telemetría o chat interno entre operadores.
  * Aplicaciones móviles nativas[cite: 1].
  * Notificaciones push o envío de correos electrónicos[cite: 1].

---

### 3.2. Alcances Funcionales
1. **Módulo de Autenticación:**
   * Registro e Inicio de sesión seguro con contraseñas encriptadas (`bcrypt`).
   * Generación y validación de tokens JWT en cada petición protegida.
2. **Módulo de Misiones & Escuadrones (Relación 1:N):**
   * CRUD completo de Misiones (Nombre, Rango de peligro, Estado).
   * Asignación de Escuadrones a una Misión activa.
3. **Módulo de Suministros & Manifiesto (Relación N:M):**
   * CRUD del Arsenal/Inventario de la base.
   * Creación del Manifiesto de Misión (asociar N suministros y cantidades requeridas a una misión).
4. **Lógica de Negocio (Control de Carga):**
   * Verificación en Backend: si `stock_disponible >= cantidad_requerida`, la misión conmuta a `Ready`; de lo contrario, pasa a `Hold`.

---

### 3.3. Alcances No Funcionales
* **Desplegabilidad:** Contenerización de la Base de Datos mediante `docker-compose` con volúmenes persistentes[cite: 1].
* **Seguridad:** Hash de contraseñas (`bcrypt`), mitigación de inyecciones SQL a través de ORM/Query Builder, middleware de autenticación por JWT[cite: 1].
* **Documentación de API:** Exposición de especificación OpenAPI 3.0 / Swagger en ambos backends[cite: 1].
* **Flujo Git y Calidad:** 
  * Prohibido hacer `push` directo a la rama `main`[cite: 1].
  * Commits formateados bajo el estándar **Conventional Commits** (`feat:`, `fix:`, `docs:`, etc.)[cite: 1].
  * Integración mediante Pull Requests (PR) aprobados[cite: 1].

---

## 4. Objetivos Específicos y Medibles (SMART)
1. **Paridad Backend:** Construir 2 APIs REST (Express.js y FastAPI) que expongan exactamente los mismos 8 endpoints con identico formato de respuesta JSON[cite: 1].
2. **Paridad Frontend:** Construir 2 SPAs (React y Vue.js) que ejecuten las mismas 4 vistas operativas consumiendo indistintamente cualquiera de los dos backends[cite: 1].
3. **Persistencia de Datos:** Garantizar la no pérdida de información al reiniciar el contenedor Docker de PostgreSQL mediante volúmenes montados[cite: 1].
4. **Desempeño:** Asegurar tiempos de respuesta HTTP < 150ms en consultas de lectura y escritura locales.
