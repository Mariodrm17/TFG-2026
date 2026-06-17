# Índice de Diagramas y Capturas — TFG WMS Santander

> Referencia rápida para la defensa. Usa **Ctrl + F** con el nombre del diagrama o el número de UC para ir directo.

| Sección | Saltar a |
|---------|---------|
| Dominio y análisis | [↓ ir](#1-dominio-y-análisis) |
| Casos de uso | [↓ ir](#2-casos-de-uso) |
| Diagramas de actividad | [↓ ir](#3-diagramas-de-actividad) |
| Arquitectura y diseño | [↓ ir](#4-arquitectura-y-diseño) |
| Diagramas de secuencia | [↓ ir](#5-diagramas-de-secuencia) |
| Sistema en producción | [↓ ir](#6-sistema-en-producción-screenshots) |

---

## 1. Dominio y Análisis

### Modelo del dominio (conceptual — Larman, nombre-only)

<div align="center">

![Modelo del Dominio](https://github.com/Mariodrm17/TFG-2026/blob/main/docs/analisis/modelo-de-dominio.png)

</div>

---

### Diagrama de clases conceptuales (atributos y relaciones)

<div align="center">

![Diagrama de Clases](https://github.com/Mariodrm17/TFG-2026/blob/main/docs/analisis/diagrama-clases.png)

</div>

---

### Diagrama de objetos (instantánea real — palé JH-8819-A en sector B4)

<div align="center">

![Diagrama de Objetos](https://github.com/Mariodrm17/TFG-2026/blob/main/docs/analisis/diagrama-objetos.png)

</div>

---

### Ciclo de vida del palé (diagrama de estados)

<div align="center">

![Diagrama de Estados](https://github.com/Mariodrm17/TFG-2026/blob/main/docs/analisis/diagrama-estados.png)

</div>

---

### Contexto del sistema (C4 Level 1 — WMS, Rollship, Access, MySQL)

<div align="center">

![Contexto del Sistema](https://github.com/Mariodrm17/TFG-2026/blob/main/docs/analisis/contexto-sistema.png)

</div>

---

### Diagrama de contexto (actores externos y flujo de estados del palé)

<div align="center">

![Diagrama de Contexto](https://github.com/Mariodrm17/TFG-2026/blob/main/docs/analisis/diagrama-contexto.png)

</div>

---

## 2. Casos de Uso

### Visión general — todos los actores y UC del sistema

<div align="center">

![CdU General](https://github.com/Mariodrm17/TFG-2026/blob/main/docs/analisis/caso-uso-general.png)

</div>

---

### Actor: Operario de Pista (UC-01 · 02 · 03 · 04 · 10 · 12)

<div align="center">

![CdU Operario](https://github.com/Mariodrm17/TFG-2026/blob/main/docs/analisis/caso-uso-operario.png)

</div>

---

### Actor: Administrador (todos los UC + UC-05 · 06 · 11)

<div align="center">

![CdU Administrador](https://github.com/Mariodrm17/TFG-2026/blob/main/docs/analisis/caso-uso-admin.png)

</div>

---

### Actor: Motor Rollship (sistema externo James Hardie — UC-03 API REST)

<div align="center">

![CdU Motor Rollship](https://github.com/Mariodrm17/TFG-2026/blob/main/docs/analisis/caso-uso-motorrollship.png)

</div>

---

### Modelos y relaciones entre casos de uso

<div align="center">

![Modelos y Casos de Uso](https://github.com/Mariodrm17/TFG-2026/blob/main/docs/analisis/modelos-y-casos-de-uso.png)

</div>

---

### Estructura include / extend del catálogo completo

<div align="center">

![Estructura CdU](https://github.com/Mariodrm17/TFG-2026/blob/main/docs/analisis/estructura-cdu.png)

</div>

---

## 3. Diagramas de Actividad

### UC-01 — Registrar entrada de palé

<div align="center">

![Actividad UC-01](https://github.com/Mariodrm17/TFG-2026/blob/main/docs/analisis/actividad-uc01.png)

</div>

---

### UC-02 — Registrar salida de palé

<div align="center">

![Actividad UC-02](https://github.com/Mariodrm17/TFG-2026/blob/main/docs/analisis/actividad-uc02.png)

</div>

---

### UC-04 — Reubicar palé entre sectores

<div align="center">

![Actividad UC-04](https://github.com/Mariodrm17/TFG-2026/blob/main/docs/analisis/actividad-uc04.png)

</div>

---

### UC-05 — Consultar estadísticas de flujo

<div align="center">

![Actividad UC-05](https://github.com/Mariodrm17/TFG-2026/blob/main/docs/analisis/actividad-uc05.png)

</div>

---

### UC-06 — Migrar datos legado (ETL Access → MySQL)

<div align="center">

![Actividad UC-06](https://github.com/Mariodrm17/TFG-2026/blob/main/docs/analisis/actividad-uc06.png)

</div>

---

### UC-08 — Registrar incidencia operativa

<div align="center">

![Actividad UC-08](https://github.com/Mariodrm17/TFG-2026/blob/main/docs/analisis/actividad-uc08.png)

</div>

---

## 4. Arquitectura y Diseño

### Arquitectura del sistema en capas (Presentación · Negocio · Datos)

<div align="center">

![Arquitectura en Capas](https://github.com/Mariodrm17/TFG-2026/blob/main/docs/diseno/arquitectura.png)

</div>

---

### Clases de análisis MVC (Vista · Controlador · Modelo)

<div align="center">

![Clases de Análisis MVC](https://github.com/Mariodrm17/TFG-2026/blob/main/docs/diseno/clases-analisis.png)

</div>

---

### Clases de diseño — Backend (Node.js · Express)

<div align="center">

![Clases Backend](https://github.com/Mariodrm17/TFG-2026/blob/main/docs/diseno/clases-backend.png)

</div>

---

### Clases de diseño — Frontend (Vanilla JS SPA)

<div align="center">

![Clases Frontend](https://github.com/Mariodrm17/TFG-2026/blob/main/docs/diseno/clases-frontend.png)

</div>

---

### Modelo Entidad-Relación (ER)

<div align="center">

![Modelo ER](https://github.com/Mariodrm17/TFG-2026/blob/main/docs/diseno/er-modelo.png)

</div>

---

### Diagrama de despliegue

<div align="center">

![Diagrama de Despliegue](https://github.com/Mariodrm17/TFG-2026/blob/main/docs/diseno/despliegue.png)

</div>

---

### Diagrama de paquetes

<div align="center">

![Diagrama de Paquetes](https://github.com/Mariodrm17/TFG-2026/blob/main/docs/diseno/paquetes.png)

</div>

---

### Análisis de paquetes

<div align="center">

![Análisis de Paquetes](https://github.com/Mariodrm17/TFG-2026/blob/main/docs/diseno/analisis-paquetes.png)

</div>

---

### Diagrama de navegación SPA (hash routing)

<div align="center">

![Diagrama de Navegación](https://github.com/Mariodrm17/TFG-2026/blob/main/docs/diseno/navegacion.png)

</div>

---

## 5. Diagramas de Secuencia

### UC-01 — Registrar entrada de palé (FOR UPDATE · ACID)

<div align="center">

![Secuencia UC-01](https://github.com/Mariodrm17/TFG-2026/blob/main/docs/diseno/seq-uc01.png)

</div>

---

### UC-02 — Registrar salida de palé

<div align="center">

![Secuencia UC-02](https://github.com/Mariodrm17/TFG-2026/blob/main/docs/diseno/seq-uc02.png)

</div>

---

### UC-03 — Consultar layout interactivo

<div align="center">

![Secuencia UC-03](https://github.com/Mariodrm17/TFG-2026/blob/main/docs/diseno/seq-uc03.png)

</div>

---

### UC-04 — Reubicar palé (doble FOR UPDATE)

<div align="center">

![Secuencia UC-04](https://github.com/Mariodrm17/TFG-2026/blob/main/docs/diseno/seq-uc04.png)

</div>

---

### UC-09 — Autenticar usuario (JWT · bcrypt)

<div align="center">

![Secuencia UC-09](https://github.com/Mariodrm17/TFG-2026/blob/main/docs/diseno/seq-uc09.png)

</div>

---

### UC-10 — Buscar palé por referencia

<div align="center">

![Secuencia UC-10](https://github.com/Mariodrm17/TFG-2026/blob/main/docs/diseno/seq-uc10.png)

</div>

---

### UC-12 — Consultar historial de palé

<div align="center">

![Secuencia UC-12](https://github.com/Mariodrm17/TFG-2026/blob/main/docs/diseno/seq-uc12.png)

</div>

---

## 6. Sistema en Producción (Screenshots)

### Login — UC-09 Autenticación (ISS · JAMES HARDIE)

<div align="center">

![Login](https://github.com/Mariodrm17/TFG-2026/blob/main/docs/screenshots/login.png)

</div>

---

### Layout interactivo — UC-03 (118 sectores · semáforo de saturación)

<div align="center">

![Layout](https://github.com/Mariodrm17/TFG-2026/blob/main/docs/screenshots/layout.png)

</div>

<div align="center">

![Layout — vista alternativa](https://github.com/Mariodrm17/TFG-2026/blob/main/docs/screenshots/layout2.png)

</div>

---

### Modal de sector — drill-down con palés contenidos

<div align="center">

![Modal Sector](https://github.com/Mariodrm17/TFG-2026/blob/main/docs/screenshots/modal-sector.png)

</div>

---

### Operaciones: Entrada de palé — UC-01

<div align="center">

![Tab Entrada](https://github.com/Mariodrm17/TFG-2026/blob/main/docs/screenshots/tab-entrada.png)

</div>

---

### Operaciones: Salida de palé — UC-02

<div align="center">

![Tab Salida](https://github.com/Mariodrm17/TFG-2026/blob/main/docs/screenshots/tab-salida.png)

</div>

---

### Operaciones: Reubicación de palé — UC-04

<div align="center">

![Tab Reubicación](https://github.com/Mariodrm17/TFG-2026/blob/main/docs/screenshots/tab-reubicar.png)

</div>

---

### Inventario de palés — UC-10 Búsqueda

<div align="center">

![Inventario](https://github.com/Mariodrm17/TFG-2026/blob/main/docs/screenshots/inventario.png)

</div>

---

### Modal historial de palé — UC-12 Trazabilidad

<div align="center">

![Modal Historial](https://github.com/Mariodrm17/TFG-2026/blob/main/docs/screenshots/modal-historial.png)

</div>

---

### Panel de incidencias — UC-08

<div align="center">

![Incidencias](https://github.com/Mariodrm17/TFG-2026/blob/main/docs/screenshots/incidencias.png)

</div>

---

### Modal registrar incidencia — UC-08

<div align="center">

![Modal Incidencia](https://github.com/Mariodrm17/TFG-2026/blob/main/docs/screenshots/modal-incidencia.png)

</div>

---

### Dashboard estadístico — UC-05

<div align="center">

![Dashboard](https://github.com/Mariodrm17/TFG-2026/blob/main/docs/screenshots/dashboard.png)

</div>

---

### Gestión de usuarios — UC-11

<div align="center">

![Usuarios](https://github.com/Mariodrm17/TFG-2026/blob/main/docs/screenshots/usuarios.png)

</div>
