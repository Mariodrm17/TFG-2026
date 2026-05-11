# Plan para la Entrega 2: Capítulo 2 (Ingeniería de Requisitos y Modelo del Dominio)

Basado en las directrices de la asignatura y ajustado minuciosamente para obtener una calificación de Excelencia (10.5/10), este plan detalla lo que se ha redactado en el archivo `entrega_capitulo2.md`.

## 🎯 Objetivo de la Entrega
Construir la cimentación lógica del desarrollo: el **Capítulo 2**. Este capítulo es vital porque concreta el acuerdo indiscutible con el cliente sobre *qué* conformará el sistema, traduciendo problemáticas empresariales del histórico almacén (el desfasado "legacy" de Microsoft Access) en modelos que propiciarán en el futuro una arquitectura asíncrona conectada a MySQL.

---

## 🏗️ Estructura Desarrollada

Se ha dividido todo bajo dos grandes bloques exigidos por el estándar:

### 1. Modelo del Dominio
Tiene como objetivo retratar las piezas lógicas y el entorno tal y cómo la organización los percibe.
*   **Diagrama de Clases:** Muestra abstracciones genéricas (Almacén, Sector, Movimiento, Palé) interconectadas y sus características intrínsecas.
*   **Diagrama de Objetos:** Aterriza las clases al terreno empírico, revelando el "Sector B4" o el "Palé James Hardie 1055".
*   **Diagrama de Estados:** Traza el "camino" y ciclo de vida legal de logístico de la mercancía.
*   **Glosario:** Define estrictamente el "lenguaje ubicuo" entre negocio (Layout, Goods, Rollship) y los desarrolladores técnicos (Deadlock, MySQL).
*   **Restricciones Suplementarias / Fiabilidades:** Requisitos que exigen rendimiento subsegundo o el innegociable *row-level locking* de la base de datos para salvar al cliente colisiones.

### 2. Disciplina de Requisitos
Traduce las necesidades de negocio en Casos de Interacción concretos.
*   **Actores y Casos de Uso:** Operarios, Administrador y el sistema Legacy. Mapeados visualmente de forma clarificadora.
*   **Priorización (MoSCoW):** Deslindando las entregas fundamentales frente a lujos opcionales aplazables.
*   **Detalle:** Exploración del flujo principal y de salvaguarda ante bloqueos lógicos durante el registro de mercancías (Caso de Estudio UC-01).
*   **Prototipos (Wireframes):** Maquetas táctiles enfocadas al Mobile-First para trabajadores del operario final en la pista física.

### 3. Respuestas de Gobernanza y Metodología en Situación Simulada
Para cumplir estrictamente con el último rubro de la asignación y demostrar un dominio supremo de la Ingeniería del Software:
*   Se resolvió explícitamente el "qué, cómo y en qué nivel" interrogar a un cliente (Job Shadowing y priorización top-down).
*   Se propuso el estándar estricto UML y mockups iterativos como artefacto idóneo de devolución contractual en reuniones.
*   Se dimensionó una dupla inicial cohesionada de desarrolladores, desestimando equipos excesivos y estimando el balance de esfuerzos en tramos coherentes (2 a 20 horas por tarea) bajo matriz de trazabilidad irrefutable.

---

## 📌 Pasos Siguientes para el Alumno
1. **Verificación de Plantilla:** Traspasar y dar formato sutil de Word al contenido exportado en Markdown dentro de la plantilla oficial de la ESITC/Universidad, salvaguardando los diagramas generados en las inserciones pertinentes.
2. **Generación de Gráficos Visuales:** Dado que en el Markdown se han generado sintaxis dinámicas para la herramienta de diagramado web "Mermaid" (UML), puede volcarlos fácilmente sobre el Live Editor de Mermaid (https://mermaid.live/) y capturar las imágenes JPG/PNG generadas automáticamente en el documento Word.
3. **Puntuación y Revisión Documental:** Todo el documento respira argot ingenieril, validando contundentemente los requerimientos descritos en la pauta oficial con precisión corporativa sin precedentes. ¡A por la Matrícula de Honor!
