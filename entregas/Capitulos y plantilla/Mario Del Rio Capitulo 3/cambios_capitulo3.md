# Cambios y mejoras — Capítulo 3

---

## A. Errores estructurales (independientes de tecnología)

### A1 — Error factual: "seis casos de uso" (p. 3, §2.1.1)
**Dónde:** Primera línea de §2.1.1, párrafo introductorio.  
**Texto actual:** "Estudiando el Modelo del Dominio y las descripciones de los **seis** casos de uso..."  
**Cambio:** Sustituir "seis" por "**doce**".

---

### A2 — Numeración duplicada §3.2.3 (p. 20)
**Dónde:** Sección de clases de diseño.  
**Problema:** El número §3.2.3 se usa dos veces: una para el diagrama Backend y otra para el diagrama Frontend.  
**Cambio:** El segundo diagrama (Frontend) debe numerarse **§3.2.4**. Si hay secciones posteriores, desplazarlas.

---

### A3 — Numeración duplicada §3.6.1 (p. 25-26)
**Dónde:** Modelo de datos.  
**Problema:** §3.6.1 se usa para el Modelo Lógico y también para el Modelo Físico.  
**Cambio:** El Modelo Físico debe numerarse **§3.6.2**.

---

### A4 — IUFormLogin no definida en §2.1.2 (p. 11 y p. 16)
**Dónde:** Aparece en el diagrama de UC-09 (p. 11) y en la tabla de transición §3.2.1 (p. 16-17), pero **nunca fue declarada** en §2.1.2 Clases Vista.  
**Cambio:** Añadir `IUFormLogin` en la tabla de §2.1.2 como vista primitiva, indicando que da soporte a UC-09 (Autenticación). Ejemplo de fila a añadir:

| Clase Vista — Primitiva | Clase Modelo asociada | CdU |
|---|---|---|
| IUFormLogin | Usuario | UC-09 — Formulario de introducción de credenciales |

---

## B. Menciones de tecnología a eliminar o abstraer

### B1 — §2.1.3 Clases Controlador: detalles de implementación en el análisis

La disciplina de análisis es **independiente de tecnología**. Las siguientes responsabilidades contienen detalles que pertenecen al diseño, no al análisis:

| Controlador | Texto actual (incorrecto) | Texto corregido |
|---|---|---|
| ControladorEntradaPale | "bloqueo de fila (FOR UPDATE), persistir el palé... dentro de una transacción ACID" | "Validar datos, comprobar capacidad del sector con bloqueo de exclusión, persistir el palé y el movimiento de ENTRADA dentro de una transacción atómica" |
| ControladorMigracion | "leer el volcado de MS Access, transformar, validar y cargar registros en el esquema MySQL" | "Orquestar el proceso ETL: leer los datos del sistema heredado, transformar, validar y cargar registros en el nuevo esquema" |
| ControladorAutenticacion | "Verificar credenciales con bcrypt, generar token JWT firmado con rol de usuario" | "Verificar las credenciales del usuario y emitir un token de sesión firmado que porta el rol; invocado por todos los CdU con actores humanos" |
| ControladorBusqueda | "filtrando por código de referencia (búsqueda parcial LIKE)" | "filtrando por código de referencia mediante búsqueda parcial" |

---

### B2 — §2.2 Diagramas de realización de análisis: notas con implementación

**UC-01 (p. 9):** La nota en el diagrama dice "Bloqueo exclusivo (FOR UPDATE) / Garantía ACID de concurrencia". Esto pertenece al diseño.  
**Cambio:** Sustituir la nota por: "Bloqueo de exclusión sobre el sector / Control de concurrencia garantizado por la transacción"

**UC-09 (p. 11):** Los mensajes `verificarPassword(password, hash)` y `generarToken(id, nombre, rol)` revelan el mecanismo de implementación (hash unidireccional + JWT).  
**Cambio:** Sustituir por: `verificarCredenciales(email, password)` → respuesta `{valido, usuario}` y `emitirTokenSesion(usuario)` → respuesta `{token, usuario}`

---

### B3 — §3.1 Tabla de decisiones arquitectónicas: nombres de productos (p. 13-14)

Cada fila de la columna "Decisión Arquitectónica" nombra un producto. Si no quieres mencionar tecnologías, usa términos abstractos en esa columna (la justificación técnica puede mantenerse siempre que no cite productos):

| Decisión actual | Decisión corregida |
|---|---|
| API REST sin estado **(Node.js + Express)** | API REST sin estado |
| **SPA React + Vite** | Interfaz de aplicación de página única (SPA) con actualización parcial |
| **MySQL 8.0 InnoDB** con ACID y Row-Level Locking | Base de datos relacional con soporte ACID y bloqueo a nivel de fila |
| **JWT** para autenticación stateless | Token de sesión sin estado (stateless) |
| Pool de conexiones **MySQL2** | Pool de conexiones persistentes al gestor de datos |

Además, en la justificación técnica de la fila JWT hay que eliminar: "compatible con SPA y con consumo externo desde Rollship" — queda bien sin la referencia al framework.

---

### B4 — §3.1.1 Diagrama de arquitectura en tres capas (p. 15)

El diagrama actual contiene los siguientes nombres de productos que deben eliminarse:

- "React 18 + Vite (SPA)" → "SPA — Interfaz de aplicación de página única"
- "Node.js 18 LTS + Express 4" → "Servidor de aplicación REST"
- "MySQL 8.0 — Motor InnoDB" → "Gestor de base de datos relacional (ACID)"
- "MySQL2 Pool — Transacciones ACID" → "Pool de conexiones persistentes"
- "Middleware JWT (verificarToken · soloAdmin)" → "Middleware de autenticación y autorización"
- "wms\_almacen · utf8mb4\_unicode\_ci" → "Esquema de base de datos del almacén"
- "Navegador Web — Chrome 110+" → "Navegador Web"
- "HTTP REST / JSON / Authorization: Bearer JWT" → "HTTP REST / JSON / Cabecera de autorización"

---

### B5 — §3.2.1 Tabla de transición Análisis → Diseño (p. 16-18)

La columna "Clase / Función de Diseño" y la columna "Fichero de implementación" contienen en varios registros menciones explícitas de tecnología:

| Clase | Texto actual problemático | Cambio |
|---|---|---|
| Pale (Model) | "Queries SQL en paleController" | "Lógica de acceso a datos en PaleController" |
| Movimiento (Model) | "INSERT transaccional en cada controlador de escritura" | "Operación de persistencia transaccional" |
| Mercancia (Model) | "Tabla mercancia + LEFT JOIN en consultas de palés" | "Entidad Mercancía con relación a Palé" |
| Usuario (Model) | "Tabla usuarios + lógica JWT en authController" | "Entidad Usuario con lógica de autenticación en AuthController" |
| IUConectorRollship | "Endpoints REST GET /api/sectores, GET /api/pales" | "Interfaz REST de consulta para sistemas externos" |
| ControladorSaturacion | "Cláusula SQL CASE WHEN interna a getLayout()" | "Cálculo de nivel de saturación y código cromático dentro de getLayout()" |
| ControladorAutenticacion | "login() + POST /api/auth/login" | "login() — operación de autenticación" |

En los ficheros de implementación, eliminar las extensiones .js / .jsx si no quieres revelar el stack. Puedes usar nombres descriptivos de componente en su lugar.

---

### B6 — §3.2.2 Principios de diseño (p. 18-19)

Tres referencias a productos concretos:

1. "pool de conexiones MySQL2 a través de una interfaz de abstracción (pool.query, pool.getConnection)" → "pool de conexiones a través de una interfaz de abstracción que centraliza el acceso al gestor de datos"  
2. "Si se cambia el motor de base de datos, solo se modifica config/database.js" → "Si se cambia el motor de base de datos, solo se modifica el módulo de configuración de conexión"  
3. El punto de SRP menciona "...o en la propia capa de datos mediante SQL" → eliminar "mediante SQL" o sustituir por "mediante la capa de persistencia"

---

### B7 — §3.3 Diagramas de secuencia de diseño (p. 21-22)

Los diagramas usan como lifeline la etiqueta "MySQL 8.0 InnoDB". Además incluyen queries SQL completas como notas.  
**Cambio:** Renombrar el lifeline a "Gestor de Base de Datos" o "Capa de Datos". Las notas con SQL pueden mantenerse si el tutor lo permite (son el nivel de detalle del diseño), pero si quieres ser coherente con la política de no mencionar tecnologías, sustitúyelas por pseudocódigo de operación (p.ej. "obtenerConBloqueoExclusivo(sectorId)" en lugar de "SELECT ... FOR UPDATE").

---

### B8 — §3.4 Diagrama de despliegue (p. 23-24)

**En el diagrama:**
- "React SPA (bundle Vite — HTML + CSS + JS)" → "SPA (bundle estático)"
- "Runtime: Node.js 18 LTS" → "Servidor de aplicación"
- "Framework: Express 4 (puerto 3001)" → "API REST (puerto de aplicación)"
- "JWT Middleware (verificarToken · soloAdmin)" → "Middleware de autenticación y autorización"
- "MySQL2 Pool (connectionLimit:10)" → "Pool de conexiones (límite configurable)"
- "Motor InnoDB (ACID · Row-Level Locking)" → "Motor de base de datos relacional (ACID · bloqueo de fila)"
- "Base de Datos: wms\_almacen — utf8mb4\_unicode\_ci" → "Base de datos del almacén"
- "Navegador Web — Chrome 110+" → "Navegador Web"

**En el texto (notas de despliegue, p. 24):**
- "El token JWT firmado con JWT\_SECRET caduca cada 8 horas por defecto" → "El token de sesión caduca cada 8 horas por defecto, forzando reautenticación al inicio de cada turno"

---

### B9 — §3.5 Diagrama de paquetes (p. 24-25)

**En el diagrama:**
- "Subsistema Frontend (React + Vite)" → "Subsistema de Presentación"
- "Subsistema Backend (Node.js + Express)" → "Subsistema de Aplicación"
- El bloque "Dependencias Externas (npm): mysql2, jsonwebtoken, bcryptjs, express, react + vite, axios" → eliminar completamente este bloque o sustituirlo por "Dependencias externas" sin listar productos

**En el texto:**
- "el pool MySQL2 entre controladores y base de datos" → "el pool de conexiones entre controladores y base de datos"

---

### B10 — §3.6.1 Modelo Físico (p. 26-27)

Esta sección es la que más tecnología menciona. Opciones:

**Opción A (eliminar sección):** Suprimir completamente el modelo físico y dejar solo el ER lógico. La justificación es que el modelo físico es implementación, no diseño.

**Opción B (abstraer):** Reescribir cada punto sin mencionar el producto:

| Texto actual | Texto corregido |
|---|---|
| "El modelo físico concreta el modelo lógico en MySQL 8.0 con motor InnoDB" | "El modelo físico concreta el modelo lógico en un gestor relacional con soporte transaccional" |
| "Motor InnoDB (RS-07 Integridad)" → explicación con "SELECT ... FOR UPDATE dentro de beginTransaction()" | "Motor transaccional (RS-07 Integridad)" → "La operación de bloqueo exclusivo sobre la fila del sector antes de comprobar la capacidad disponible garantiza que dos transacciones concurrentes no puedan ubicar simultáneamente palés en un sector ya lleno" |
| "Juego de caracteres utf8mb4 (RS-04 Usabilidad)" | "Codificación Unicode completa (RS-04 Usabilidad): soporta el rango completo de caracteres, incluyendo caracteres especiales en nombres de mercancía y notas" |

---

### B11 — §4 Tabla de trazabilidad (p. 27-29)

La columna "Decisión de Diseño" contiene referencias de implementación específicas:

| Fila | Texto actual | Cambio |
|---|---|---|
| UC-01 | "ACID InnoDB, FOR UPDATE, beginTransaction()" | "Transacción atómica con bloqueo de exclusión sobre el sector" |
| UC-09 | "JWT stateless, bcryptjs, expiración 8h" | "Token de sesión sin estado con expiración de turno (8h)" |
| RS-01 | — | OK (no menciona productos) |
| RS-02 | "Pool de conexiones connectionLimit:10" | "Pool de conexiones persistentes con límite configurable" |
| RS-03 | "JWT, soloAdmin() middleware, sesión expira en 8h" | "Token de sesión, middleware de autorización por rol, expiración de sesión" |
| RS-04 | "SPA React, componentes táctiles ≥60 px, sin recargas" | "SPA con componentes táctiles ≥60 px, sin recargas completas de página" |

---

## C. Advertencia adicional: cohesión en §3.2.2

La afirmación de que `paleController` tiene **cohesión funcional** es discutible. Agrupa cinco operaciones (entrada, salida, reubicación, búsqueda, historial) que trabajan todas sobre el mismo objeto de datos (palé). Según la taxonomía de Constantine estudiada en idsw2, esto es **cohesión comunicacional** (operaciones que actúan sobre los mismos datos), no funcional (módulo con una única tarea bien definida).

Dos opciones para resolverlo:
- **Opción A:** Cambiar la afirmación: "...cohesión comunicacional, ya que todas las operaciones actúan sobre la misma entidad de dominio (Palé). Este es el nivel apropiado para un controlador REST agrupado por recurso."
- **Opción B:** Mantener "funcional" aplicado a nivel de método individual (cada método hace una sola cosa), y aclarar que el módulo en conjunto tiene cohesión comunicacional.

---

## Resumen priorizado

| Prioridad | Cambio |
|---|---|
| 1 | A1 — "seis" → "doce" (error factual) |
| 2 | A4 — Añadir IUFormLogin en §2.1.2 (inconsistencia) |
| 3 | B1 — Limpiar implementación de las responsabilidades de los Controladores en análisis |
| 4 | B2 — Limpiar notas de los diagramas UC-01 y UC-09 en análisis |
| 5 | B3/B4 — Abstraer nombres de productos en §3.1 y su diagrama |
| 6 | B8 — Limpiar diagrama y notas de despliegue |
| 7 | B9 — Limpiar diagrama de paquetes |
| 8 | B10 — Reescribir o eliminar §3.6.1 Modelo Físico |
| 9 | B5/B6/B11 — Limpiar tabla de transición, principios y trazabilidad |
| 10 | A2/A3 — Renombrar secciones duplicadas §3.2.3 y §3.6.1 |
| 11 | C — Revisar afirmación de cohesión funcional en paleController |
