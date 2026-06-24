[1. Contexto](./Introduccion.md) | [2. Análisis y Requisitos](./AnalisisyRequisitos.md) | [3. Arquitectura](./Arquitectura.md) | [4. Demostración](./Demostracion.md) | [5. Conclusiones](./Conclusiones.md)

---

## 1. Validación de Requisitos

| Requisito | Descripción | Objetivo | Resultado |
|-----------|-------------|----------|-----------|
| RS-01 | **Rendimiento** | Layout < 1,5 s · escrituras < 2 s | ✅ ~300 ms en red local |
| RS-02 | **Disponibilidad** | 99,5 % horario operativo | ✅ Sin caídas en periodo de pruebas |
| RS-03 | **Seguridad** | JWT 8h · bcrypt · RBAC 4 roles | ✅ 4 roles verificados · 0 accesos no autorizados |
| RS-04 | **Usabilidad** | CTAs ≥ 60×60 px · mobile-first | ✅ Probado en tablet industrial con guantes |
| RS-05 | **Portabilidad** | Chrome / Firefox / Safari | ✅ Verificado en los 3 navegadores |
| RS-06 | **Mantenibilidad** | MVC estricta · capas desacopladas | ✅ 12 controladores independientes · cero acoplamiento |
| RS-07 | **Integridad** | ACID · Row-Level Locking | ✅ 0 deadlocks en ~73.000 movimientos históricos |

| Restricción empresa | Verificado |
|---------------------|-----------|
| RS-E1 · Integración Rollship vía API REST JSON | ✅ `GET /api/sectores` accesible sin JWT |
| RS-E2 · Sin instalación en dispositivos (navegador web) | ✅ SPA servida por Express · cero dependencias cliente |
| RS-E3 · Base de datos MySQL (WAMP64) | ✅ MySQL 8.0 InnoDB en infraestructura existente |
| RS-E4 · Mobile-first · CTAs ≥ 60×60 px | ✅ Diseño adaptado a tablet industrial con guantes |
| RS-E5 · Migración Access sin pérdida | ✅ ~73.064 palés históricos migrados y auditables |

---

## 2. Conclusiones del Proyecto

**Hipótesis verificada:** El módulo web transaccional sobre MySQL InnoDB elimina los deadlocks del Access y habilita el control multiusuario en tiempo real.

- **Sistema multiusuario en tiempo real:** El WMS elimina la restricción de un único PC de escritorio — múltiples operarios trabajan simultáneamente desde cualquier dispositivo con navegador, sin bloqueos ni colisiones de datos.
- **Layout interactivo:** El mapa visual de 118 sectores con semáforo de saturación sustituye las hojas Excel desactualizadas — el operario conoce la ocupación real del almacén sin necesidad de desplazarse físicamente.
- **Trazabilidad completa:** Cada entrada, salida, reubicación e incidencia queda registrada de forma inmutable en base de datos — cualquier movimiento pasado es auditable cronológicamente con UC-12.
- **Gestión de modificaciones del operario:** Las funciones de edición detectadas como necesidad del cliente durante las entrevistas quedan resueltas en la aplicación web, dentro de los límites del rol correspondiente.

---

## 3. Trabajos Futuros

**Evolución del Sistema WMS Santander**

- **Notificaciones en tiempo real:** Actualmente Rollship consulta el layout por petición; en el futuro podría recibir eventos push vía WebSockets cuando un sector cambia de estado de saturación.
- **Integración de pistolas de escáner:** Conectar lectores de código de barras por USB o Bluetooth al dispositivo del operario para que la introducción del código de referencia sea automática al apuntar al palé — elimina errores de transcripción y acelera las operaciones en pista.
- **Multi-almacén:** El modelo del dominio (`Almacen → Sector → Palé`) ya contempla múltiples almacenes; la capa de datos y el frontend necesitarían extenderse para una futura expansión de INTERMODAL.
- **App PWA con acceso offline:** Versión Progressive Web App que permita registrar entradas/salidas sin conexión y sincronizar al recuperar red — crítico para zonas del muelle con cobertura intermitente.

---

## 4. Cierre

**¡Muchas gracias al tribunal por su atención!**

*Quedo a su entera disposición para responder a cualquier pregunta.*

---

[1. Contexto](./Introduccion.md) | [2. Análisis y Requisitos](./AnalisisyRequisitos.md) | [3. Arquitectura](./Arquitectura.md) | [4. Demostración](./Demostracion.md) | [5. Conclusiones](./Conclusiones.md)
