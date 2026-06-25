# Diagramas y Casos de Uso — WMS Santander


[Dominio](./01-dominio.md) | [Casos de Uso](./02-casos-de-uso.md) | [Actividades](./03-actividades.md) | [Arquitectura](./04-arquitectura.md) | [Secuencias](./05-secuencias.md) | [Screenshots](./06-screenshots.md)

---

## Dominio y Análisis → [01-dominio.md](./01-dominio.md)

| Diagrama | Descripción |
|----------|-------------|
| [Modelo del dominio](./01-dominio.md#modelo-del-dominio-conceptual--larman-nombre-only) | Conceptual, nombre-only, 6 entidades |
| [Diagrama de clases](./01-dominio.md#diagrama-de-clases-conceptuales) | Atributos, relaciones y multiplicidades |
| [Diagrama de objetos](./01-dominio.md#diagrama-de-objetos-instantánea-real) | Instantánea real — palé JH-8819-A en sector B4 |
| [Ciclo de vida del palé](./01-dominio.md#ciclo-de-vida-del-palé-diagrama-de-estados) | 7 estados: Recepcionado → Expedido |
| [Contexto del sistema](./01-dominio.md#contexto-del-sistema-c4-level-1) | WMS · MySQL · Rollship · Access |
| [Diagrama de contexto](./01-dominio.md#diagrama-de-contexto-actores-y-flujo-de-estados) | Actores externos y flujo de estados del palé |

---

## Casos de Uso → [02-casos-de-uso.md](./02-casos-de-uso.md)

| Diagrama | Descripción |
|----------|-------------|
| [Visión general](./02-casos-de-uso.md#visión-general--todos-los-actores) | Todos los actores y los 12 UC |
| [Operario de Pista](./02-casos-de-uso.md#actor-operario-de-pista) | UC-01 · 02 · 03 · 04 · 10 · 12 |
| [Administrador](./02-casos-de-uso.md#actor-administrador) | Todos los UC + UC-05 · 06 · 11 |
| [Motor Rollship](./02-casos-de-uso.md#actor-motor-rollship) | UC-03 vía API REST (actor sistema) |
| [Modelos y relaciones](./02-casos-de-uso.md#modelos-y-relaciones-entre-casos-de-uso) | Diagrama de relaciones entre CdU |
| [Estructura include/extend](./02-casos-de-uso.md#estructura-include--extend) | Árbol completo de dependencias |

---

## Diagramas de Actividad → [03-actividades.md](./03-actividades.md)

| Diagrama | UC |
|----------|----|
| [UC-01 Entrada de palé](./03-actividades.md#uc-01--registrar-entrada-de-palé) | Must · Sprint 1 |
| [UC-02 Salida de palé](./03-actividades.md#uc-02--registrar-salida-de-palé) | Must · Sprint 1 |
| [UC-04 Reubicación](./03-actividades.md#uc-04--reubicar-palé-entre-sectores) | Must · Sprint 2 |
| [UC-05 Estadísticas](./03-actividades.md#uc-05--consultar-estadísticas-de-flujo) | Should · Sprint 3 |
| [UC-06 Migración ETL](./03-actividades.md#uc-06--migrar-datos-legado-etl) | Should · Sprint 2 |
| [UC-08 Incidencia](./03-actividades.md#uc-08--registrar-incidencia-operativa) | Should · Sprint 2 |

---

## Arquitectura y Diseño → [04-arquitectura.md](./04-arquitectura.md)

| Diagrama | Descripción |
|----------|-------------|
| [Arquitectura en capas](./04-arquitectura.md#arquitectura-del-sistema-en-capas) | Presentación · Negocio · Datos |
| [Clases MVC (análisis)](./04-arquitectura.md#clases-de-análisis-mvc) | Vista · Controlador · Modelo |
| [Clases Backend](./04-arquitectura.md#clases-de-diseño--backend) | Node.js · Express |
| [Clases Frontend](./04-arquitectura.md#clases-de-diseño--frontend) | Vanilla JS SPA |
| [Modelo ER](./04-arquitectura.md#modelo-entidad-relación-er) | 6 tablas · FK · ACID |
| [Diagrama de despliegue](./04-arquitectura.md#diagrama-de-despliegue) | Infraestructura WAMP64 |
| [Diagrama de paquetes](./04-arquitectura.md#diagrama-de-paquetes) | Estructura de módulos |
| [Análisis de paquetes](./04-arquitectura.md#análisis-de-paquetes) | Dependencias entre capas |
| [Navegación SPA](./04-arquitectura.md#diagrama-de-navegación-spa-hash-routing) | Hash routing frontend |

---

## Diagramas de Secuencia → [05-secuencias.md](./05-secuencias.md)

| Diagrama | UC |
|----------|----|
| [UC-01 Entrada](./05-secuencias.md#uc-01--registrar-entrada-de-palé) | FOR UPDATE · ACID |
| [UC-02 Salida](./05-secuencias.md#uc-02--registrar-salida-de-palé) | — |
| [UC-03 Layout](./05-secuencias.md#uc-03--consultar-layout-interactivo) | Semáforo · Rollship |
| [UC-04 Reubicación](./05-secuencias.md#uc-04--reubicar-palé-doble-for-update) | Doble FOR UPDATE |
| [UC-09 Auth JWT](./05-secuencias.md#uc-09--autenticar-usuario-jwt--bcrypt) | bcrypt · JWT |
| [UC-10 Búsqueda](./05-secuencias.md#uc-10--buscar-palé-por-referencia) | — |
| [UC-12 Historial](./05-secuencias.md#uc-12--consultar-historial-de-palé) | Trazabilidad ACID |

---

## Sistema en Producción → [06-screenshots.md](./06-screenshots.md)

| Pantalla | UC |
|----------|----|
| [Login](./06-screenshots.md#login--uc-09-autenticación) | UC-09 |
| [Layout interactivo](./06-screenshots.md#layout-interactivo--uc-03) | UC-03 |
| [Modal de sector](./06-screenshots.md#modal-de-sector--drill-down) | UC-03 |
| [Entrada de palé](./06-screenshots.md#operaciones-entrada--uc-01) | UC-01 |
| [Salida de palé](./06-screenshots.md#operaciones-salida--uc-02) | UC-02 |
| [Reubicación](./06-screenshots.md#operaciones-reubicación--uc-04) | UC-04 |
| [Inventario](./06-screenshots.md#inventario--uc-10-búsqueda) | UC-10 |
| [Historial de palé](./06-screenshots.md#modal-historial--uc-12-trazabilidad) | UC-12 |
| [Incidencias](./06-screenshots.md#incidencias--uc-08) | UC-08 |
| [Dashboard](./06-screenshots.md#dashboard-estadístico--uc-05) | UC-05 |
| [Usuarios](./06-screenshots.md#gestión-de-usuarios--uc-11) | UC-11 |
