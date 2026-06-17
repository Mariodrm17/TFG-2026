[← Actividades](./03-actividades.md) | [← Índice](./README.md) | [Secuencias →](./05-secuencias.md)

[Dominio](./01-dominio.md) | [Casos de Uso](./02-casos-de-uso.md) | [Actividades](./03-actividades.md) | [Arquitectura](./04-arquitectura.md) | [Secuencias](./05-secuencias.md) | [Screenshots](./06-screenshots.md)

---

# Arquitectura y Diseño

---

## Arquitectura del sistema en capas

> Capa de Presentación (SPA Vanilla JS) → Capa de Aplicación (Node.js + Express + JWT) → Capa de Datos (MySQL 8.0 InnoDB ACID).

<div align="center">

![Arquitectura en Capas](https://github.com/Mariodrm17/TFG-2026/blob/main/docs/diseno/arquitectura.png)

</div>

---

## Clases de análisis MVC

> **Regla de derivación:** Vista = invocar/presentar · Controlador = un controlador por UC · Modelo = derivado del modelo del dominio.

<div align="center">

![Clases de Análisis MVC](https://github.com/Mariodrm17/TFG-2026/blob/main/docs/diseno/clases-analisis.png)

</div>

---

## Clases de diseño — Backend

> Implementación real en Node.js + Express. Controladores, modelos y middleware de autenticación.

<div align="center">

![Clases Backend](https://github.com/Mariodrm17/TFG-2026/blob/main/docs/diseno/clases-backend.png)

</div>

---

## Clases de diseño — Frontend

> Implementación real en Vanilla JS SPA con hash routing. Vistas y componentes del cliente.

<div align="center">

![Clases Frontend](https://github.com/Mariodrm17/TFG-2026/blob/main/docs/diseno/clases-frontend.png)

</div>

---

## Modelo Entidad-Relación (ER)

> 6 tablas principales: `sectores` · `pales` · `movimientos` · `mercancia` · `usuarios` · `migracion_access`. PALES es el pivote central.

<div align="center">

![Modelo ER](https://github.com/Mariodrm17/TFG-2026/blob/main/docs/diseno/er-modelo.png)

</div>

---

## Diagrama de despliegue

> Infraestructura WAMP64 existente en la empresa: Apache · MySQL 8.0 · Node.js 20 en la misma máquina.

<div align="center">

![Diagrama de Despliegue](https://github.com/Mariodrm17/TFG-2026/blob/main/docs/diseno/despliegue.png)

</div>

---

## Diagrama de paquetes

<div align="center">

![Diagrama de Paquetes](https://github.com/Mariodrm17/TFG-2026/blob/main/docs/diseno/paquetes.png)

</div>

---

## Análisis de paquetes

> Dependencias entre capas y módulos del sistema.

<div align="center">

![Análisis de Paquetes](https://github.com/Mariodrm17/TFG-2026/blob/main/docs/diseno/analisis-paquetes.png)

</div>

---

## Diagrama de navegación SPA (hash routing)

> Rutas del frontend: `#/login` · `#/layout` · `#/operaciones` · `#/inventario` · `#/dashboard` · `#/incidencias` · `#/usuarios`.

<div align="center">

![Diagrama de Navegación](https://github.com/Mariodrm17/TFG-2026/blob/main/docs/diseno/navegacion.png)

</div>

---

[← Actividades](./03-actividades.md) | [← Índice](./README.md) | [Secuencias →](./05-secuencias.md)
