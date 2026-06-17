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

- **ACID sobre InnoDB:** Cero bloqueos de jornada en producción. El `SELECT … FOR UPDATE` resuelve exactamente el deadlock que paralizaba el almacén con MS Access.
- **MVC estricta derivada del dominio:** 12 controladores independientes, Vista = invocar/presentar, Modelo derivado de las 6 entidades del dominio — la arquitectura es trazable desde el modelo conceptual hasta el código.
- **Trazabilidad total garantizada:** ~73.064 palés del histórico del Access migrados y auditables en MySQL. Cualquier operación pasada es reconstruible cronológicamente con UC-12.
- **RBAC 4 roles verificado:** visualizador · operario · gerente · administrador — ningún rol accede a funciones fuera de su ámbito; la escalada de privilegios es imposible sin credenciales.

---

## 3. Trabajos Futuros

**Evolución del Sistema WMS Santander**

- **Notificaciones en tiempo real:** Actualmente Rollship consulta el layout por petición; en el futuro podría recibir eventos push vía WebSockets cuando un sector cambia de estado de saturación.
- **Escáner de código de barras / QR:** Sustituir la introducción manual del código de referencia por lectura de QR con la cámara del dispositivo — reduce errores de transcripción en pista.
- **Multi-almacén:** El modelo del dominio (`Almacen → Sector → Palé`) ya contempla múltiples almacenes; la capa de datos y el frontend necesitarían extenderse para una futura expansión de INTERMODAL.
- **App PWA con acceso offline:** Versión Progressive Web App que permita registrar entradas/salidas sin conexión y sincronizar al recuperar red — crítico para zonas del muelle con cobertura intermitente.

---

## 4. Cierre

**¡Muchas gracias al tribunal por su atención!**

*Quedo a su entera disposición para responder a cualquier pregunta.*

---

[1. Contexto](./Introduccion.md) | [2. Análisis y Requisitos](./AnalisisyRequisitos.md) | [3. Arquitectura](./Arquitectura.md) | [4. Demostración](./Demostracion.md) | [5. Conclusiones](./Conclusiones.md)
