# TFG - Mario del Rio

---

# Capítulo 1 — Introducción y Marco Teórico

## 1. Introducción

El contexto en el cual está orientado este Trabajo de Fin de Grado corresponde a las instalaciones de una empresa proveedora de servicios logísticos y de transporte de mercancías, en este caso centrándose en un almacén situado en el puerto de Santander. Esta nave/almacén industrial está dedicada en específico al inventario de un único cliente, la corporación "James Hardie".

### Características físicas y operativas del almacén

El almacén es una instalación la cual está compuesta por una disposición física (o *layout*) estructurada por sectores bien diferenciados. Todo el acopio de la mercancía se realiza a nivel del suelo, no está organizada en diferentes alturas, sino que es una sola explanada, dividiendo la superficie total en unas 38 áreas en las cuales se ubican diferentes mercancías a nivel de palés.

El volumen de operaciones logísticas que son soportadas por este almacén es ultra productiva. Haciendo una base del histórico, con datos del 2025 y 2026, se registraron los siguientes datos en tráfico de mercancías:

- **Volumen de entrada:** Más de 45.000 palés recibidos mediante 2.233 órdenes de entrada o de recepción de camiones.
- **Volumen de salida:** Más de 23.400 palés expedidos, vinculados a unas 1.000 operaciones de distribución de cargas.

Este monto operativo supone un problema constante a la hora de reubicación y de tener un registro de existencias diarias, las cuales se hacen actualmente de manera manual y presencial uno por uno, ya que el cliente, como es normal, exige un control de *stock* con una precisión perfecta para no incurrir en extravíos o rupturas de inventario. La mercancía custodiada está diversificada en diferentes tipos de embalajes con dimensiones y pesos variables debido a los diferentes materiales que se manejan entre las empresas.

### 1.2. Sistema informático heredado

Aunque el nivel de material expedido en este almacén es enorme, el engranaje informático con el que se gestiona el mismo y con el que convive la empresa está severamente desfasado. Actualmente los registros de entrada y salida se sostienen sobre una base de datos monolítica de Microsoft Access, el cual no tiene sistemas automatizados como lectores de código de barras (RFID/EAN).

Este sistema Access convive mano a mano de manera precaria con el intento de la empresa de desarrollar un módulo de control integrado a través de una herramienta a medida desarrollada por otra empresa denominada "Rollship", construida principalmente con Laravel (PHP). No obstante, Access sigue siendo el gestor diario del histórico del programa.

La arquitectura física de las dependencias hace perder aún más eficacia en el proceso ya que la empresa cuenta con un único ordenador e impresora con los cuales no tienen la misma capacidad de funcionamiento que con más dispositivos, y carecen de dispositivos PDA, *tablets*, o terminales industriales en las pistas del almacén.

### 1.3. Flujo de trabajo y cuellos de botella

La ausencia de un *Software* de Gestión de Almacenes (WMS) el cual esté diseñado para móvil y con un sistema multiusuario provoca que los trabajadores tengan que desplazarse de manera repetida en su jornada desde la zona de descargas, hasta las oficinas centrales para imprimir las listas de ubicación en papel, anotar de forma manual las ubicaciones reales de donde se han descargado esos palés y añadirlo a mano al sistema Access, ya que no existe un sistema en el cual esté implementado ese funcionamiento. Es un proceso manual y tedioso en el cual se pierde mucho tiempo efectivo de trabajo además de entrar en la posibilidad del error humano.

La motivación imperante y la necesidad de este proyecto se fundamentan en una necesidad de solución de este caos organizativo. La problemática principal reside en la carencia de un mapa interactivo con el cual se evalúe y grafique el porcentaje de ocupación en tiempo real y así tener una organización perfecta en esta dependencia de la empresa. Hoy en día la empresa depende de hojas de cálculo de Excel dispares para intentar tener el porcentaje de saturación física del almacén.

El problema de que el sistema Access esté solo alojado en un dispositivo genera una dependencia de gestión de sesiones en el bloqueo de transacciones en un entorno multisesión, en el cual sería necesario un dispositivo por persona que trabaje directamente en el almacén. El resultado de esto es el déficit en la visibilidad del inventario en tiempo real y bloqueos de los administrativos los cuales pueden crear solapamientos en los datos y una toma de decisiones errática al no conocer a ciencia cierta qué segmentos del suelo están ocupados, reservados o disponibles.

### 1.4. Enunciado del problema

El principal motivo el cual justifica la realización de este proyecto radica en la obsolescencia y los problemas por los cuales este proceso es ineficaz a la hora de la gestión de inventario, sustentado actualmente en una base de datos de Microsoft Access estática que no satisface las gigantescas demandas operativas del almacén de Santander.

El problema exacto a resolver es que la empresa carece de una herramienta de *software* actual, web y en tiempo real que permita visualizar gráficamente y de forma dinámica el *layout* o plano del almacén con porcentaje de ocupación, a la vez que arrastra un fallo crítico de control de concurrencia para coordinar las acciones simultáneas de la plantilla. Esta deficiencia estructural provoca las siguientes fallas:

- **Desincronización de datos y bloqueos del sistema:** El uso de un único terminal físico y una arquitectura heredada la cual genera colisiones de transacciones cuando es estrictamente necesario registrar las entradas y salidas de mercancías en los últimos años.
- **Ineficiencia en el registro del flujo lógico-físico:** La dependencia al papel, necesaria en todo el retraso que eso conlleva, desencadena un alto índice de error, redundancia de trabajo y un grave retraso en la actualización del *stock* real.
- **Ceguera operativa en la toma de decisiones:** La monitorización del espacio útil en tiempo real sería un gran avance el cual ahora se hace de manera física y dificultando a los responsables tener un control ya que se maneja en un Excel el cual no tiene conexiones externas actualizadas. Esto impide planificar de forma óptima la descarga y el posicionamiento de la mercancía entrante.

En definitiva, es imprescindible diseñar, implementar y desplegar un sistema logístico el cual consiga representar digitalmente el mapa de ocupación del almacén mediante un plano 2D, así como integrarse en el ecosistema de la nueva herramienta ya implementada en la empresa para la gestión de otras operaciones en la empresa.

### 1.5. Hipótesis de partida

Todo proyecto de ingeniería de *software* debe fundamentarse sobre una premisa científico-tecnológica fundamental que dirija el desarrollo y permita medir su tasa de éxito final. Teniendo en cuenta el punto de la grave disfunción operativa y de arquitectura en el almacén del puerto de Santander, se enuncia la siguiente hipótesis de investigación y desarrollo:

> *"El diseño, implementación e integración de un Módulo logístico web el cual esté dotado con un sistema interactivo con el cual tener el control del layout físico de la nave y llevando un control en el backend con una base de datos relacional, solventará el problema de la ceguera operativa y la mala conexión con el inventario que existe en la actualidad. Esta digitalización erradicará de manera eficiente el problema de cuello de botella de información existente en la actualidad derivado del manejo de papel y el uso de un único terminal en el cual se maneja este software."*

Para realizar la validación de esta hipótesis en el mundo real, el presente Trabajo de Fin de Grado desglosará la ejecución de un proyecto de ingeniería con su correspondiente: análisis de requisitos, diseño del modelado e implementación en web, destinados a probar la viabilidad del nuevo proyecto no solo en la parte tecnológica, sino también demostrando la importancia de valor cualitativo y la trazabilidad con el sistema ya existente en la empresa.

---

## 2. Marco teórico

Para realizar este Trabajo de Fin de Grado, es necesario hacer una revisión exhaustiva de las tecnologías utilizadas en el sector logístico y analizar las metodologías necesarias para gestionar infraestructuras de alta demanda. Esto se basa en la literatura académica y en las premisas del consorcio industrial, lo que justifica la necesidad de una solución de *software* personalizada.

### 2.1. Exploración de soluciones y tecnologías comerciales (SGA / WMS)

En la actualidad, el mercado ofrece diversos Sistemas de Gestión de Almacenes (SGA o WMS) orientados al control de inventario y optimización de la cadena de suministro. La tendencia global demuestra que las arquitecturas web están reemplazando a los sistemas tradicionales operados desde terminales físicas aisladas, tal y como evidencian desarrollos académicos recientes como *Wareventory* (Ye Chen, 2024).

Para evaluar la viabilidad de implementar una solución comercial frente a un desarrollo a medida, se han analizado las herramientas más utilizadas en el mercado español:

- **SAP EWM (Extended Warehouse Management):** Es uno de los sistemas más robustos y utilizados para la gestión de inventarios a nivel global. SAP EWM está diseñado para maximizar la visibilidad en tiempo real y evitar roturas de *stock* (SAP SE, 2024). Sin embargo, su arquitectura es altamente compleja y está orientada a macro-almacenes altamente automatizados, lo que conlleva unos costes de implementación y licenciamiento extremadamente elevados.
- **Mecalux Easy WMS:** Se trata de un software flexible y modular, ampliamente consolidado en el sector, cuyo objetivo es optimizar las operaciones, mejorar la precisión del inventario y maximizar el diseño del *layout* de almacenamiento (Mecalux, 2024). Aunque es una de las soluciones más completas, es un *software* propietario que requiere el pago de licencias periódicas y cuya integración con herramientas desarrolladas a medida fuera de su ecosistema resulta técnica y económicamente restrictiva.
- **Odoo WMS (Módulo de Inventario):** Odoo es un sistema de gestión empresarial (ERP) que cuenta con más de 10.000 aplicaciones integradas, permitiendo administrar el inventario y la logística en una sola plataforma (Odoo S.A., 2024). Al ser de código abierto en su versión básica, ofrece mayor maleabilidad. No obstante, las funcionalidades avanzadas de control visual de planta y enrutamiento requieren la contratación de la versión *Enterprise* o el desarrollo de costosos módulos adicionales de terceros.

### 2.2. Tabla comparativa de soluciones en el mercado

| Característica / Criterio | SAP EWM | Mecalux Easy WMS | Odoo WMS | Solución Propuesta (Módulo Web a Medida) |
|---|---|---|---|---|
| Arquitectura base | Cliente-Servidor / Cloud propietaria | Cloud propietaria (SaaS) | Arquitectura Web / ERP Modular | Arquitectura Web (tres capas) |
| Control de concurrencia en tiempo real | Excelente (Alta disponibilidad) | Excelente | Excelente | Excelente (Gestión de transacciones) |
| Visualización dinámica del Layout (Plano 2D) | Sí (Requiere configuración avanzada y módulos extra) | Sí (Muy avanzado, incluye 3D en versiones superiores) | Limitado (Generalmente basado en listas, requiere desarrollo extra) | Sí (Funcionalidad principal, mapping de sectores y % de ocupación interactivo) |
| Costes de implementación y licencias | Muy elevados (Licencias por usuario/servidor) | Elevados (Suscripción o licencia perpetua) | Medios/Altos (Versión Enterprise + módulos extra) | Bajos (Inversión inicial en desarrollo, sin coste de licencias periódicas) |

### 2.3. Alcance del Proyecto

Es importante definir qué significa "digitalización" o "mapeo físico" de la nave en este proyecto. No vamos a crear un modelo digital en 3D ni a usar sensores para seguir el movimiento de cosas de manera automática. Esto sería demasiado complicado y costoso para este Trabajo de Fin de Grado.

En su lugar, haremos un plano interactivo en 2D que mostrará el almacén desde arriba, como una cuadrícula. Este plano mostrará las 38 áreas de acopio del almacén utilizando tecnologías web comunes como HTML, CSS y JavaScript, que se integrarán con el *backend*.

El sistema funcionará de manera simple. No habrá actualizaciones automáticas del estado de ocupación del mapa mediante *hardware*. En su lugar, se actualizará cuando un trabajador confirme una orden de entrada, reubicación o salida de un palé a través de la interfaz web en su dispositivo móvil. Cuando se confirme una transacción, se actualizará la base de datos. Luego, el plano 2D consultará la base de datos y mostrará el nuevo porcentaje de ocupación en tiempo real para todos los usuarios conectados.

### 2.4. Justificación de la propuesta a medida

Tras el análisis del estado del arte expuesto en la tabla anterior, se evidencia que, aunque existen soluciones comerciales (WMS y ERP) orientadas a la gestión logística sumamente potentes (Muñoz & Mishell, 2024; Rodríguez Díaz, 2020), estas no resultan idóneas para las particularidades del almacén de Santander. Dichos sistemas comerciales suelen ser excesivamente genéricos, incorporando funcionalidades redundantes que encarecen el producto y dificultan su adopción por parte de la plantilla.

El requerimiento crítico de la empresa es disponer de una visualización interactiva y dinámica del plano de planta, funcionalidad que rara vez se cubre de manera nativa, sencilla y asequible en los paquetes comerciales estándar sin incurrir en licencias *Premium*. A esto se suma que la compañía ya se encuentra inmersa en el desarrollo de un ecosistema propio denominado "Rollship", por lo que la integración forzosa de macro-herramientas de terceros supondría un obstáculo técnico severo y una dependencia de proveedores externos.

Por consiguiente, la solución óptima y plenamente justificada es el diseño de un módulo logístico web personalizado. Este módulo se alineará estrictamente con la necesidad de digitalizar el *layout*, garantizando la concurrencia operativa mediante un motor relacional de alta disponibilidad, y permitiendo una integración natural en la arquitectura de *software* de la organización sin incurrir en costes recurrentes de licenciamiento.

### 2.5. Objetivos General y Específicos

**Objetivo General:** El objetivo primordial de este TFG se basa en diseñar, desarrollar e implementar un sistema web para la gestión de almacén robusto, con concurrencia a través de tecnología relacional. Este sistema debe ser capaz de realizar el mapeo digital de las ubicaciones físicas de la nave, erradicar la contención de la actual base de datos Access la cual funciona en un único dispositivo y proveer métricas de ocupación en tiempo real para optimizar el trabajo y tiempo de los operarios destinados a esto.

**Objetivos Específicos:**

1. **Ingeniería y Disciplina de requisitos:** Ejecutar una fase en la cual se recolecta información y se analiza sobre el ecosistema actual del almacén de Santander y el software actual. El fin de este objetivo es formalizar el catálogo de requisitos funcionales y no funcionales que marcarán el nuevo modelo. *(Capítulo 2 de la memoria).*
2. **Análisis Arquitectónico y Diseño relacional:** Diseñar la arquitectura lógica y física del módulo logístico web y, crucialmente, modelar el esquema Entidad-Relación optimizado con el sistema de base de datos relacional. Se establecerán aquí los diagramas formales UML requeridos para trazar la escalabilidad de la solución. *(Capítulo 3 de la memoria).*
3. **Implementación y despliegue del PMV:** Desarrollar, programar y ensamblar la primera iteración que integre la base de datos concurrente y la interfaz gráfica web en tiempo real, validando así los requerimientos de diseño ya establecidos mediante pruebas de integración antes de un vuelco o migración a un entorno de producción (Salazar Ruiz et al., 2022; Vega Vargas, 2024). *(Capítulo 4 de la memoria).*

### 2.6. Estructura del trabajo

La consecución de los ambiciosos objetivos descritos anteriormente exigen una aproximación metodológica rigurosa. Para la realización del desarrollo de este módulo logístico Web, el Trabajo de Fin de Grado adopta una base de enfoque metodológico de Ingeniería Informática iterativo e incremental (Pressman & Maxim, 2020; Sommerville, 2015).

El presente documento se estructura en las siguientes fases:

- **Fase I - Identificación y Diagnosis:** Establece el escenario en el cual se genera la logística de partida, en ello también se enuncia la problemática de *deadlocks* y ceguera en el almacén, el cual defiende el marco teórico que fundamenta la transición de arquitectura.
- **Fase II - Ingeniería de requisitos:** Documentación de los casos de interacción real del operario con la mercancía. Se identificarán las restricciones en el sistema heredado y en el catálogo de requisitos tanto funcionales como no funcionales.
- **Fase III - Análisis, Diseño y Arquitectura:** Modelado lógico de datos y la arquitectura de capas y conectividad que asegura evitar el bloqueo transaccional. Se emplearán modelos UML para la explicación de las clases.
- **Fase IV - Implementación Técnica de la Solución:** Fase práctica dirigida al despliegue tecnológico de la aplicación. Se presentará el entorno configurado y se realizará la codificación algorítmica de la lógica de negocio.
- **Fase V - Verificación, Resultados y Conclusiones:** Discusión final centrada en realizar la validación empírica de la hipótesis. Se presentarán los resultados y la eficacia comparada con el nuevo sistema al ser expuesto a ese gran volumen de operaciones.

---

## 3. Referencias bibliográficas

- Clara Trujillo, I. (2022). *Proyecto de automatización de un sistema de producción y almacenamiento con implementación mediante el autómata M241 de Schneider y simulación con el software Factory I/O* (Tesis doctoral). Universitat Politècnica de València.
- Date, C. J. (2004). *An introduction to database systems* (8.ª ed.). Pearson/Addison-Wesley.
- Elmasri, R., & Navathe, S. B. (2016). *Fundamentals of database systems* (7.ª ed.). Pearson.
- Mecalux. (2024). *Software de Gestión de Almacenes Easy WMS*. Mecalux España.
- Muñoz, P., & Mishell, J. (2024). *Implementación de un sistema web para la gestión de almacenes en la empresa Cerro de Pasco Company SAC* [Trabajo de Fin de Grado]. Universidad César Vallejo.
- Odoo S.A. (2024). *Odoo Inventario y Sistema de Gestión de Almacenes*.
- Oracle Corporation. (2023). *MySQL 8.0 reference manual*.
- Pérez García, S. (2023). *Software para la planificación del almacenamiento de mercancías*.
- Pressman, R. S., & Maxim, B. R. (2020). *Software engineering: A practitioner's approach* (9.ª ed.). McGraw-Hill.
- Rodríguez Díaz, H. A. (2020). *Sistema de gestión de información logística basado en servicios web para el transporte de mercancía de la Empresa Transportes Exprecar SAS* [Trabajo de Fin de Grado]. Universidad Cooperativa de Colombia.
- Salazar Ruiz, A., Villarreal Rúa, H. J., & Mosquera Narváez, J. N. (2022). Herramientas y prácticas para el apoyo en la toma de decisiones en proyectos de migración de datos. *Revista Investigación e Innovación en Ingenierías, 10*(1).
- Sánchez, D. I. (2025). *Diseño e Implementación de un Sistema de Gestión de Entrenamientos en un Club Deportivo* [Trabajo de Fin de Grado]. Universidad Europea del Atlántico.
- SAP SE. (2024). *SAP Extended Warehouse Management (SAP EWM)*. SAP España.
- Sommerville, I. (2015). *Software engineering* (10.ª ed.). Pearson.
- Stauffer, M. (2019). *Laravel: Up & running. A framework for building modern PHP apps* (2.ª ed.). O'Reilly Media.
- Vega Vargas, Y. L. (2024). *Diseño e implementación de procesos de migración de datos de MySQL a Oracle mediante PHP para optimizar la operatividad para la empresa Grupo AAA Asesores* [Trabajo de Fin de Grado].
- Ye Chen, F. (2024). *Wareventory: Una aplicación web para el manejo logístico de almacenes* [Trabajo de Fin de Grado]. Universidad Complutense de Madrid.

---

---

# Capítulo 2 — Ingeniería de Requisitos y Modelo del Dominio

## 1. Introducción

El presente capítulo constituye la respuesta al objetivo Específico I del TFG: ejecutar la disciplina de requisitos que conduzca al diseño, y desarrollo del sistema WMS para el almacén de Santander de Intermodal Sea Solutions.

Su propósito es dirigir el desarrollo del proyecto hacia el sistema correcto, describiendo los requisitos del sistema de tal forma que se alcance el acuerdo entre el cliente, los usuarios y el equipo de desarrollo. La información aquí formalizada procede de las sesiones realizadas con cliente.

El capítulo se estructura en dos grandes bloques metodológicos:

- **Modelo del Dominio:** abstracción de la realidad del negocio logístico mediante diagramas UML (clases, objetos, estados) y un glosario de términos comunes.
- **Disciplina de Requisitos:** identificación de actores, casos de uso priorizados y detalle expandido de los flujos de interacción más relevantes.

---

## 2. Modelo de Dominio

Con el objetivo de comprender la estructura y la dinámica de interacción logística sin incurrir en restricciones tecnológicas previas, se elabora un Modelo del Dominio que abstrae e identifica los elementos vitales del ecosistema de negocio y sus vínculos.

### 2.1. Diagrama de Clases

El siguiente diagrama ilustra las entidades físicas y funcionales que operan interdependientemente en el recinto del almacén. Se han aplicado las convenciones UML estándar: la composición (rombo relleno) representa una dependencia existencial entre contenedor y contenido; la agregación (rombo vacío) indica una relación de pertenencia sin dependencia vital; y la asociación simple denota una interacción navegable entre clases independientes.

> **[INSERTAR IMAGEN: Diagrama de Clases del Modelo del Dominio — Almacen, Sector, Pale, Movimiento, Operario, Cliente, EstadoPale, TipoMovimiento, RolOperario]**

| Relación | Tipo | Cardinalidad | Significado |
|---|---|---|---|
| Almacén → Sector | Composición | 1 a 1..* | Un almacén se compone de sectores. Sin almacén no hay sectores. |
| Sector → Pale | Agregación | 1 a 0..* | Un sector aloja cero o más pales, pero los pales existen independientemente. |
| Pale → Movimiento | Asociación | 1 a 1..* | Cada pale origina al menos un movimiento (la entrada). |
| Operario → Movimiento | Asociación | 1 a 0..* | Un operario registra cero o muchos movimientos. |
| Almacén → Cliente | Asociación | 1 a 1 | Un almacén gestiona el inventario de un único cliente. |

### 2.2. Diagrama de Objetos

El Diagrama de Objetos proyecta una instantánea o estado puntual del recinto logístico en un instante temporal concreto, instanciando el modelo conceptual anterior. Este tipo de diagrama sirve para verificar que el modelo de clases es correcto confrontándolo con datos reales del negocio.

El instante modelado corresponde a una operación de descarga real en turno de tarde:

> **[INSERTAR IMAGEN: Diagrama de Objetos — instancia almacenSantander:Almacen, jamesHardie:Cliente, sectorB4:Sector, paleJH8819:Pale, diegoMD:Operario, mov10234:Movimiento]**

Este diagrama confirma que el modelo de clases captura correctamente la operativa real: un operario registra la entrada de un palé a un sector concreto, generando un movimiento transaccional que queda vinculado a ambas entidades.

### 2.3. Diagrama de Estados

El presente diagrama refleja el ciclo de vida completo de un palé desde su recepción en el muelle de descarga hasta que abandona las instalaciones. En él se incluyen estados de excepción (Incidencia y Cancelado) que representan situaciones reales de la operativa del almacén.

> **[INSERTAR IMAGEN: Diagrama de Estados del Palé — Recepcionado → Emplazado → Reemplazado / EnPreparacion → Expedido / Cancelado / Incidencia]**

| Estado | Descripción |
|---|---|
| Recepcionado | Palé presente en el muelle. Sin sector asignado. |
| Emplazado | Palé con sector asignado y ubicado físicamente. Estado de reposo normal. |
| Reemplazado | Palé en tránsito entre dos sectores. Estado transitorio. |
| En preparación | Palé incluido en orden de expedición, pendiente de aprobación. |
| Expedido | Palé fuera del almacén. Estado terminal normal. |
| Incidencia | Anomalía detectada. Flujo normal bloqueado. Supervisor notificado. |
| Cancelado | Expedición rechazada o cancelada. Sector liberado. |

### 2.5. Requisitos Suplementarios (No Funcionales)

Los requisitos suplementarios especifican las propiedades de calidad del sistema: velocidad, seguridad, fiabilidad, usabilidad y mantenibilidad (Sommerville, 2015).

| ID | Categoría | Descripción | Métrica de verificación |
|---|---|---|---|
| RS-01 | Rendimiento | El layout se carga en <1,5 s. Las escrituras se confirman en <2 s. | Prueba de carga con 5 operarios. |
| RS-02 | Disponibilidad | Disponibilidad del 99,5 % en horario operativo (06:00-22:00, L-S). | Monitorización de uptime. |
| RS-03 | Seguridad | Credenciales únicas por usuario. Sesión expira a los 30 min. El rol Operario no modifica registros confirmados. | Revisión de código y pruebas OWASP Top 10. |
| RS-04 | Usabilidad | Operable con guantes. Elementos táctiles ≥60×60 px. Dominio básico en <15 min de entrenamiento. | Test de usabilidad think-aloud con 3 operarios. |
| RS-05 | Portabilidad | Compatible con Chrome 110+, Firefox 110+, Safari 16+. Sin instalación en dispositivos de los operarios. | Pruebas manuales en los navegadores indicados. |
| RS-06 | Mantenibilidad | Separación estricta de capas (MVC). Cobertura de pruebas unitarias sobre lógica de negocio ≥70 %. | Informe de cobertura de pruebas. |
| RS-07 | Integridad | Todas las escrituras son atómicas. Sin registros parciales ante cualquier fallo del sistema. | Pruebas de integración con simulación de fallos. |

---

## 3. Disciplina de Requisitos

### 3.1. Identificación de Actores y Casos de Uso

#### 3.1.1. Identificación de Actores

Un actor, en el sentido UML, es en cualquier escenario en el que se encuentre e interactúa con él, ya sea una persona, un rol organizativo o un sistema informático externo. La identificación de los actores delimita la frontera del sistema y es el punto de partida para la construcción de los CdU.

| Actor | Tipo | Descripción | CdU accesibles |
|---|---|---|---|
| Operario de Pista | Humano principal | Registra las operaciones físicas de entrada, salida y reubicación de palés desde un dispositivo móvil. | UC-01, 02, 03, 04, 10, 12 |
| Administrador | Humano privilegiado | Supervisa la ocupación, gestiona incidencias, extrae informes, rectifica registros y administra usuarios. | UC-01 a UC-12 |
| Motor Rollship | Sistema externo receptor | Consulta el estado del inventario mediante API REST. No inicia operaciones. | UC-03 |
| Microsoft Access (legado) | Sistema externo transitorio | Fuente de datos históricos durante la migración ETL. Solo relevante en esa fase. | UC-06 |

#### 3.1.2. Identificación de Casos de Uso

| ID | Nombre | Breve descripción |
|---|---|---|
| UC-01 | Registrar entrada de palé | El operario registra la llegada de un palé y le asigna un sector. |
| UC-02 | Registrar salida de palé | El operario registra la salida autorizada de un palé del almacén. |
| UC-03 | Consultar layout interactivo | El usuario consulta el mapa de ocupación en tiempo real de los 38 sectores. |
| UC-04 | Reubicar palé entre sectores | El operario traslada un palé de un sector a otro. |
| UC-05 | Consultar estadísticas de flujo | El administrador obtiene informes de movimientos históricos. |
| UC-06 | Migrar datos legado (ETL) | El administrador lanza la importación de datos desde MS Access. |
| UC-07 | Calcular saturación de sector | El sistema calcula el porcentaje de ocupación de un sector. (Subflujo incluido.) |
| UC-08 | Registrar incidencia operativa | El operario notifica una anomalía en un palé. (Flujo extendido desde UC-01.) |
| UC-09 | Autenticar usuario | El sistema verifica las credenciales antes de conceder acceso. (Subflujo incluido.) |
| UC-10 | Buscar palé por referencia | El usuario localiza un palé concreto introduciendo su código de referencia. |
| UC-11 | Gestionar usuarios del sistema | El administrador crea, modifica y desactiva cuentas de operario. |
| UC-12 | Consultar historial de palé | El usuario consulta la traza completa de movimientos de un palé concreto. |

### 3.2. Diagramas de Casos de Uso

**CdU — Visión General del Sistema:**

> **[INSERTAR IMAGEN: Diagrama CdU — Visión General del Sistema — todos los actores y los 12 UCs con relaciones include/extend]**

**CdU — Actor: Operario de Pista:**

> **[INSERTAR IMAGEN: Diagrama CdU — Actor Operario de Pista — UC-01, 02, 03, 04, 05, 06, 10, 11, 12 con include a UC-07, UC-08, UC-09]**

**CdU — Actor: Motor Rollship:**

> **[INSERTAR IMAGEN: Diagrama CdU — Actor Motor Rollship — UC-03 con include a UC-07]**

**Diagrama de Contexto — Flujos de información entre sistema y actores:**

> **[INSERTAR IMAGEN: Diagrama de Contexto — flujos de información entre Operario de Pista, MS Access, Módulo Logístico Web, Administrador, Motor Rollship]**

### 3.3. Priorización de Casos de Uso

Los casos de uso se priorizan aplicando los criterios establecidos en RUP: riesgo técnico, contribución a la arquitectura del sistema, valor para el negocio y dependencias entre los casos de uso (Larman, 2004; Kruchten, 2004). El objetivo es ordenar la implementación de forma que las funciones críticas sean abordadas lo antes posible.

| ID | Nombre | Valor negocio | Riesgo técnico | Contribución a la arquitectura | Iteración |
|---|---|---|---|---|---|
| UC-09 | Autenticar usuario | Alto | Bajo | Alta | 1ª |
| UC-01 | Registrar entrada de palé | Muy alto | Medio | Alta | 1ª |
| UC-02 | Registrar salida de palé | Muy alto | Medio | Alta | 1ª |
| UC-03 | Consultar layout interactivo | Alto | Medio | Alta | 1ª |
| UC-07 | Calcular saturación de sector | Alto | Bajo | Alta | 1ª |
| UC-04 | Reubicar palé entre sectores | Medio | Bajo | Media | 2ª |
| UC-08 | Registrar incidencia | Medio | Bajo | Baja | 2ª |
| UC-06 | Migrar datos legado (ETL) | Alto | Alto | Baja | 2ª |
| UC-10 | Buscar palé por referencia | Alto | Bajo | Media | 2ª |
| UC-11 | Gestionar usuarios | Medio | Bajo | Media | 2ª |
| UC-05 | Consultar estadísticas | Bajo | Bajo | Baja | 3ª |
| UC-12 | Consultar historial de palé | Medio | Bajo | Media | 3ª |

**Producto Mínimo Viable (PMV):** los casos de uso de la primera iteración (UC-01, UC-02, UC-03, UC-07 y UC-09) constituyen el sistema operativamente funcional para el funcionamiento diario del almacén.

### 3.3. Detalle Expandido de Casos de Uso

---

#### UC-01 — Registrar Entrada de Palé

| Campo | Valor |
|---|---|
| Denominación | UC-01 — Registrar entrada de palé |
| Actor principal | Operario de Pista |
| Incluye | UC-09 (Autenticar usuario), UC-07 (Calcular saturación) |
| Extiende | UC-08 (Registrar incidencia) — condición: error detectado en recepción |
| Iteración | 1ª — prioridad alta |

**Precondiciones:**
- El operario tiene sesión iniciada en la aplicación web desde su móvil.
- El palé físico está presente en el muelle de descarga.

**Flujo principal (escenario de éxito):**

| Paso | Actor | Acción |
|---|---|---|
| 1 | Operario | Solicita registrar una nueva entrada de palé. |
| 2 | Sistema | Presenta el formulario de entrada y el mapa de sectores con el estado de ocupación actualizado. |
| 3 | Operario | Introduce el código de referencia del palé, el tipo de material y la masa. |
| 4 | Operario | Selecciona el sector destino en el mapa. |
| 5 | Sistema | Verifica que el sector seleccionado tiene capacidad disponible. |
| 6 | Sistema | Registra la operación: crea el palé con estado Emplazado y genera el movimiento de tipo ENTRADA. |
| 7 | Sistema | Confirma la operación al operario y actualiza el mapa en pantalla. |

**Postcondiciones:**
- Existe un nuevo registro `Palé` en el sistema con estado `Emplazado`.
- El sistema genera un movimiento de Tipo Entrada con sello temporal, sector destino y operario.
- El porcentaje de ocupación del sector destino se ha actualizado.

**Flujos alternativos y excepciones:**
- A1 - Sector lleno por operación concurrente: el sistema informa al operario e invita a seleccionar un sector alternativo.
- A2 - Código de referencia duplicado: el sistema advierte de código duplicado y solicita confirmación.
- A3 - Error detectado: el operario extiende un flujo hacia UC-08.

> **[INSERTAR IMAGEN: Diagrama de Actividad — UC-01: Registrar entrada de palé]**

---

#### UC-02 — Registrar Salida de Palé

| Campo | Valor |
|---|---|
| Denominación | UC-02 — Registrar salida de palé |
| Actor principal | Operario de Pista |
| Actores secundarios | Administrador (aprobación de la orden de expedición) |
| Incluye | UC-09 (Autenticar usuario), UC-07 (Calcular saturación) |
| Iteración | 1ª — prioridad alta |

**Flujo principal (escenario de éxito):**

| Paso | Actor | Acción |
|---|---|---|
| 1 | Operario | Solicita registrar la salida de un palé por código o en el layout. |
| 2 | Sistema | Presenta el detalle del palé y la orden de expedición asociada. |
| 3 | Operario | Confirma que el palé está en el área de carga y solicita registrar la salida. |
| 4 | Sistema | Solicita confirmación explícita al operario antes de proceder. |
| 5 | Operario | Confirma la operación. |
| 6 | Sistema | Verifica que el estado del palé permite la expedición. |
| 7 | Sistema | Registra la salida: actualiza el estado a Expedido, genera el movimiento SALIDA y libera la plaza del sector. |
| 8 | Sistema | Notifica al administrador la expedición y confirma al operario. |

> **[INSERTAR IMAGEN: Diagrama de Actividad — UC-02: Registrar salida de palé]**

---

#### UC-03 — Consultar Layout Interactivo

| Campo | Valor |
|---|---|
| Denominación | UC-03 — Consultar layout interactivo |
| Actor principal | Operario de Pista, Administrador, Motor Rollship (vía API) |
| Incluye | UC-09 (para actores humanos), UC-07 (Calcular saturación) |
| Iteración | 1ª — prioridad alta |

**Flujo principal (escenario de éxito):**

| Paso | Actor | Acción |
|---|---|---|
| 1 | Usuario | Accede a la pantalla principal del módulo. |
| 2 | Sistema | Consulta el estado de ocupación actual de los 38 sectores. |
| 3 | Sistema | Presenta la cuadrícula con codificación cromática: verde (0-60 %), ámbar (61-85 %), rojo (86-100 %). |
| 4 | Usuario | Pulsa sobre un sector. |
| 5 | Sistema | Presenta el detalle del sector: lista de palés con referencia, tipo de material y fecha de entrada. |
| 6 | Sistema | Refresca el mapa periódicamente para mantener la información actualizada. |

**Flujo alternativo A1 — Motor Rollship:** si el actor es el sistema Rollship, la respuesta es un objeto JSON con el estado de cada sector.

---

#### UC-04 — Reubicar Palé entre Sectores

| Campo | Valor |
|---|---|
| Denominación | UC-04 — Reubicar palé entre sectores |
| Actor principal | Operario de Pista |
| Incluye | UC-09 (Autenticar usuario), UC-07 (Calcular saturación) |
| Iteración | 2ª — prioridad media |

**Precondiciones:**
- El operario tiene sesión iniciada.
- El palé a reubicar tiene estado Emplazado.
- El sector destino tiene capacidad disponible.

**Flujo principal (escenario de éxito):**

| Paso | Actor | Acción |
|---|---|---|
| 1 | Operario | Localiza el palé (por código o en el mapa) y solicita reubicarlo. |
| 2 | Sistema | Presenta el detalle del palé y su sector actual. |
| 3 | Operario | Selecciona el sector destino en el mapa. |
| 4 | Sistema | Verifica: (a) sector destino con capacidad; (b) sector distinto del actual; (c) estado del palé compatible. |
| 5 | Sistema | Registra la reubicación: actualiza la ubicación del palé, genera movimiento REUBICACION y actualiza contadores de ambos sectores. |
| 6 | Sistema | Confirma la operación y actualiza el mapa. |

**Postcondiciones:**
- El palé tiene estado Emplazado en el nuevo sector.
- El sistema ha generado un movimiento de tipo REUBICACIÓN con sector origen, sector destino, sello temporal y operario.

> **[INSERTAR IMAGEN: Diagrama de Actividad — UC-04: Reubicar palé entre sectores]**

---

#### UC-05 — Consultar Estadísticas de Flujo

| Campo | Valor |
|---|---|
| Denominación | UC-05 — Consultar estadísticas de flujo |
| Actor principal | Administrador |
| Incluye | UC-09 (Autenticar usuario) |
| Iteración | 3ª — prioridad baja |

**Precondiciones:**
- El administrador tiene sesión iniciada con rol ADMINISTRADOR.
- Existe al menos un movimiento registrado en el sistema.

**Flujo principal (escenario de éxito):**

| Paso | Actor | Acción |
|---|---|---|
| 1 | Administrador | Accede al panel de estadísticas desde el menú principal. |
| 2 | Sistema | Presenta un resumen de actividad del periodo actual: entradas, salidas y reubicaciones del día. |
| 3 | Administrador | Configura los filtros: rango de fechas, sector o tipo de operación. |
| 4 | Sistema | Consulta los movimientos y calcula indicadores: operaciones por tipo, evolución de la ocupación por sector, operarios más activos y horas pico. |
| 5 | Sistema | Presenta los resultados en forma de tabla y gráfico de barras. |
| 6 | Administrador | Opcionalmente exporta el informe en formato CSV o PDF. |

**Postcondiciones:** El administrador dispone de un informe de actividad del periodo seleccionado.

**Flujos alternativos:**
- A1 - Sin datos en el periodo: el sistema informa que no hay movimientos y sugiere ampliar el rango de fechas.
- A2 — Exportación: el sistema genera el archivo y lo pone a disposición del administrador para su descarga.

> **[INSERTAR IMAGEN: Diagrama de Actividad — UC-05: Consultar estadísticas de flujo]**

---

#### UC-06 — Migrar Datos Legado (ETL)

| Campo | Valor |
|---|---|
| Denominación | UC-06 — Migrar datos legado (ETL) |
| Actor principal | Administrador |
| Actores secundarios | MS Access (legado) — fuente de datos históricos |
| Iteración | 2ª — alto riesgo técnico |

**Precondiciones:**
- El administrador tiene sesión iniciada con rol ADMINISTRADOR.
- Existe el archivo exportado del sistema legado con el inventario histórico.
- La migración no ha sido ejecutada previamente (proceso irrepetible sin reset manual).

**Flujo principal (escenario de éxito):**

| Paso | Actor | Acción |
|---|---|---|
| 1 | Administrador | Accede al módulo ETL desde el panel de administración. |
| 2 | Sistema | Presenta el formulario de carga y las instrucciones de formato esperado. |
| 3 | Administrador | Sube el archivo exportado desde MS Access (CSV o MDB convertido). |
| 4 | Sistema | Valida el formato y la estructura del archivo: columnas requeridas y tipos de datos. |
| 5 | Sistema | Ejecuta simulación (dry run) e informa del número de registros a importar y conflictos detectados. |
| 6 | Administrador | Revisa el informe de simulación y confirma la migración. |
| 7 | Sistema | Ejecuta el proceso ETL: importa palés históricos y genera movimientos de tipo ENTRADA para cada registro. |
| 8 | Sistema | Presenta el resumen final: registros importados, omitidos y errores. |

**Postcondiciones:**
- Los datos históricos del sistema legado están disponibles en la nueva base de datos.
- Cada palé importado tiene al menos un movimiento de tipo ENTRADA con la fecha original.
- El log de migración queda registrado para auditoría.

**Flujos alternativos:**
- A1 — Formato no válido: el sistema describe los errores de formato e impide continuar.
- A2 — Conflicto de duplicados: el sistema identifica los registros duplicados y permite al administrador decidir si omitirlos o sobrescribirlos.
- A3 — Error durante la migración: el sistema ejecuta un rollback completo (RS-07), garantizando que no quedan registros parciales.

> **[INSERTAR IMAGEN: Diagrama de Actividad — UC-06: Migrar datos legado]**

---

#### UC-07 — Calcular Saturación de Sector (Subflujo incluido)

| Campo | Valor |
|---|---|
| Denominación | UC-07 — Calcular saturación de sector |
| Tipo | Subflujo — incluido por UC-01 y UC-03 |
| Actor | Sistema (interno, no iniciado directamente por actores humanos) |
| Iteración | 1ª — base arquitectónica |

Este caso de uso no es iniciado directamente por ningún actor humano. Es un Subflujo obligatorio activado por UC-01 (al registrar una entrada) y UC-03 (al renderizar el layout). El sistema calcula el porcentaje de ocupación de cada sector mediante la fórmula: **saturación = (palésActuales / capacidadMax) × 100**.

| Rango de saturación | Código cromático | Significado |
|---|---|---|
| 0 - 60 % | Verde | Sector disponible. |
| 61 - 85 % | Ámbar | Sector con ocupación elevada. |
| 86 - 100 % | Rojo | Sector próximo al límite o lleno. |

**Precondición:** Los campos palésActuales y capacidadMax del sector son accesibles.

**Postcondición:** El porcentaje de saturación y el código de color quedan calculados y disponibles para su presentación en el layout.

---

#### UC-08 — Registrar Incidencia Operativa

| Campo | Valor |
|---|---|
| Denominación | UC-08 — Registrar incidencia operativa |
| Actor principal | Operario de Pista |
| Actores secundarios | Administrador (recibe notificación) |
| Extiende | UC-01 (Registrar entrada) — condición: error detectado en recepción |
| Incluye | UC-09 (Autenticar usuario) |
| Iteración | 2ª — prioridad media |

**Precondiciones:**
- El operario tiene sesión iniciada en la aplicación.
- El palé sobre el que se registra la incidencia existe en el sistema o se está registrando en UC-01.

**Flujo principal (escenario de éxito):**

| Paso | Actor | Acción |
|---|---|---|
| 1 | Operario | Detecta una anomalía en el palé y accede al formulario de incidencia. |
| 2 | Sistema | Presenta el formulario con el código del palé ya vinculado y solicita el tipo de incidencia. |
| 3 | Operario | Selecciona el tipo de incidencia: daño físico, discrepancia de código o diferencia de contenido. |
| 4 | Operario | Describe la anomalía con detalle y opcionalmente adjunta fotografía. |
| 5 | Sistema | Registra la incidencia, cambia el estado del palé a Incidencia e impide operaciones sobre él hasta su resolución. |
| 6 | Sistema | Notifica al administrador la incidencia con el detalle completo. |
| 7 | Sistema | Confirma al operario que la incidencia ha sido registrada. |

**Postcondiciones:**
- La incidencia queda registrada con sello temporal y operario responsable.
- El palé tiene estado Incidencia y no puede ser expedido hasta que el administrador la resuelva.
- El administrador ha recibido la notificación.

**Flujos alternativos:**
- A1 — Resolución de incidencia: el administrador revisa, toma medidas correctoras y la marca como resuelta. El sistema devuelve el palé al estado Emplazado.
- A2 — Cancelación del palé: si la anomalía es irresoluble, el administrador cancela el palé desde el panel de incidencias.

> **[INSERTAR IMAGEN: Diagrama de Actividad — UC-08: Registrar incidencia operativa]**

---

#### UC-09 — Autenticar Usuario (Subflujo incluido)

| Campo | Valor |
|---|---|
| Denominación | UC-09 — Autenticar usuario |
| Tipo | Subflujo — incluido por todos los CdU con actores humanos |
| Actor | Sistema (interno, no iniciado directamente) |
| Iteración | 1ª — base de toda interacción |

Este caso de uso es un Subflujo de autenticación que se activa cuando un actor humano accede al módulo sin sesión activa. No es invocado directamente por el usuario: el sistema lo ejecuta de forma transparente al inicio de cualquier interacción protegida.

**Precondición:** El usuario dispone de una credencial válida registrada en el sistema.

**Flujo principal (escenario de éxito):**

| Paso | Actor | Acción |
|---|---|---|
| 1 | Sistema | Detecta el acceso sin sesión activa y presenta la pantalla de inicio de sesión. |
| 2 | Usuario | Introduce su credencial (usuario y contraseña). |
| 3 | Sistema | Valida las credenciales. Si son correctas, genera un token de sesión firmado con el rol del usuario y expiración a los 30 min de inactividad (RS-03). |
| 4 | Sistema | Redirige al usuario a la pantalla principal según su rol: layout interactivo (Operario) o panel de administración (Administrador). |

**Postcondición:** El usuario tiene una sesión activa con token de sesión válido.

**Flujo alternativo:**
- A1 — Credenciales incorrectas: el sistema informa del error sin especificar el campo incorrecto. Tras 3 intentos fallidos consecutivos, la cuenta queda bloqueada temporalmente 15 minutos.

---

#### UC-10 — Buscar Palé por Referencia

| Campo | Valor |
|---|---|
| Denominación | UC-10 — Buscar palé por referencia |
| Actores | Operario de Pista, Administrador |
| Incluye | UC-09 (Autenticar usuario) |
| Iteración | 2ª — prioridad alta |

**Precondición:** El usuario tiene sesión iniciada en la aplicación.

**Flujo principal (escenario de éxito):**

| Paso | Actor | Acción |
|---|---|---|
| 1 | Usuario | Introduce el código de referencia del palé (completo o parcial) en el campo de búsqueda. |
| 2 | Sistema | Busca el palé en el inventario activo filtrando por el código introducido. |
| 3 | Sistema | Presenta los resultados: código de referencia, tipo de material, sector actual, estado y fecha de entrada. |
| 4 | Usuario | Selecciona el palé de la lista de resultados. |
| 5 | Sistema | Muestra el detalle completo del palé y lo resalta en el layout virtual. |

**Postcondición:** El usuario conoce la ubicación exacta del palé y su estado actual.

**Flujos alternativos:**
- A1 — Sin resultados: si ningún palé coincide con la búsqueda, el sistema lo indica y ofrece ampliar los criterios.
- A2 — Palé expedido o cancelado: el sistema informa de que el palé ya no es activo y muestra su último estado registrado.

---

#### UC-11 — Gestionar Usuarios del Sistema

| Campo | Valor |
|---|---|
| Denominación | UC-11 — Gestionar usuarios del sistema |
| Actor principal | Administrador |
| Incluye | UC-09 (Autenticar usuario) |
| Iteración | 2ª — prioridad media |

**Precondición:** El administrador tiene sesión iniciada con rol ADMINISTRADOR.

**Flujo principal — Crear operario (escenario de éxito):**

| Paso | Actor | Acción |
|---|---|---|
| 1 | Administrador | Accede al panel de gestión de usuarios. |
| 2 | Sistema | Presenta la lista de usuarios activos con su nombre, credencial, turno y rol. |
| 3 | Administrador | Solicita crear un nuevo operario e introduce nombre completo, credencial, turno y rol (OPERARIO o ADMINISTRADOR). |
| 4 | Sistema | Verifica que la credencial no existe en el sistema. |
| 5 | Sistema | Crea la cuenta con la credencial proporcionada y la registra en el log de auditoría. |
| 6 | Sistema | Confirma la creación y muestra la cuenta en la lista actualizada. |

**Postcondición:** La cuenta del nuevo operario está activa y puede autenticarse en el sistema.

**Subflujos:**
- SF-A Modificar operario: el administrador actualiza turno, rol o contraseña de un usuario existente.
- SF-B Desactivar operario: el administrador desactiva la cuenta sin eliminarla.

**Flujos alternativos:**
- A1 — Credencial duplicada: el sistema informa del conflicto y solicita una credencial distinta.

---

#### UC-12 — Consultar Historial de Palé

| Campo | Valor |
|---|---|
| Denominación | UC-12 — Consultar historial de palé |
| Actores | Operario de Pista, Administrador |
| Incluye | UC-09 (Autenticar usuario) |
| Iteración | 3ª — prioridad media |

**Precondición:**
- El usuario tiene sesión iniciada.
- El palé existe en el sistema (puede estar activo o no).

**Flujo principal (escenario de éxito):**

| Paso | Actor | Acción |
|---|---|---|
| 1 | Usuario | Localiza el palé (directamente o vía UC-10) y solicita ver su historial. |
| 2 | Sistema | Recupera todos los movimientos asociados al palé, ordenados cronológicamente. |
| 3 | Sistema | Presenta la línea de tiempo de movimientos: tipo de operación, sector origen, sector destino, sello temporal y operario responsable. |
| 4 | Usuario | Navega por el historial. Opcionalmente filtra por tipo de operación o rango de fechas. |
| 5 | Sistema | Actualiza la vista con los filtros aplicados. |

**Postcondición:** El usuario dispone de la traza completa de movimientos del palé, útil para auditorías e incidencias.

**Flujos alternativos:**
- A1 — Sin movimientos registrados: situación imposible (todo palé tiene al menos un movimiento de ENTRADA), pero el sistema mostraría el mensaje correspondiente.

---

### 3.4. Prototipado de Casos de Uso

Los prototipos de interfaz constituyen un artefacto de validación: permiten contrastar, antes de la implementación, que el diseño de pantallas es coherente con los casos de uso y satisface los requisitos de usabilidad RS-04. Se presentan como diseño de baja fidelidad que no implican decisiones de diseño visual definitivas.

**Figura 15 — Prototipo: Layout Virtual (pantalla principal, UC-03)**

```
MODULO LOGISTICO WEB - ALMACEN SANTANDER       [Diego M. v]
--------------------------------------------------------------------
[+ Nueva entrada]  [^ Salida]  [<> Reubicar]  [Estadísticas]
--------------------------------------------------------------------
[A1  45%  5/11  VERDE]  [A2  78%  7/9  AMBAR]  [A3  91%  11/12  ROJO]
[B1  12%  2/17  VERDE]  [B2 100% 12/12  ROJO]  [B3  33%   4/12  VERDE]
... (38 sectores en total) ...
Última actualización: hace 12 s                [Actualizar ahora]
```

**Figura 16 — Prototipo: Formulario de Registro de Entrada (UC-01)**

```
<- Volver al mapa             NUEVA ENTRADA DE PALE
---------------------------------------------------
Código de referencia:
[ JH-____-_  (autocompletado)                    ]
Tipo de material:
[ v Seleccionar tipo...                          ]
Masa aproximada (kg):
[ _____ kg                                       ]
Sector destino:
[ v Seleccionar en el mapa                       ]
[         OK CONFIRMAR ENTRADA      (60px)        ]
```

**Figura 17 — Prototipo: Panel de Detalle de Sector (UC-03)**

```
SECTOR B4  —  11 / 12 palés  (91%)                        [X]
Zona: Bloque B - Fachada Norte
------------------------------------------------------------
REFERENCIA    MATERIAL          ENTRADA
JH-8819-A     Pizarras Ens.     12/05/2026
JH-7203-B     Fibrocemento      08/05/2026
JH-6541-C     Fibrocemento      08/05/2026
...
------------------------------------------------------------
[<> Reubicar palé]          [^ Registrar salida]
```

### 3.5. Estructura del Modelado de Casos de Uso

La estructura del modelo de casos de uso formaliza las relaciones de inclusión y extensión entre casos de uso, identificando la funcionalidad compartida (subflujos obligatorios) y los flujos opcionales (extensiones) (Larman, 2004).

**Relaciones de inclusión (<<include>>)**

| Caso de uso | Incluye | Justificación |
|---|---|---|
| UC-01, UC-02, UC-03, UC-04, UC-10, UC-11, UC-12 | UC-09 (Autenticar usuario) | Todo acceso al sistema requiere verificación. Subflujo obligatorio, incondicional y compartido. |
| UC-01, UC-03 | UC-07 (Calcular saturación) | Ambos CdU necesitan el porcentaje de ocupación de los sectores para su correcta presentación. |

**Relaciones de extensión (<<extend>>)**

| Caso de uso base | Extendido por | Condición de activación |
|---|---|---|
| UC-01 (Registrar entrada) | UC-08 (Registrar incidencia) | El operario detecta una anomalía en el palé durante el registro de entrada. |

> **[INSERTAR IMAGEN: Diagrama de Estructura del Modelo de CdU — relaciones include/extend entre los 12 UCs]**

---

## 4. Matriz de Trazabilidad

| Necesidad (Cap. 1) | Artefacto en Cap. 2 | Cap. que lo implementa |
|---|---|---|
| Registro de entradas en tiempo real | UC-01, RS-01, RS-07 | Cap. 3 y 4 |
| Registro de salidas autorizado | UC-02, RS-03 | Cap. 3 y 4 |
| Visibilidad del almacén en tiempo real | UC-03, RS-01, Glosario "Layout virtual" | Cap. 3 y 4 |
| Reubicación de palés | UC-04 | Cap. 3 y 4 |
| Localización rápida de un palé concreto | UC-10 | Cap. 3 y 4 |
| Trazabilidad auditoría de movimientos | UC-12, Clase Movimiento | Cap. 3 y 4 |
| Gestión de accesos del personal | UC-11, RS-03, Actores | Cap. 3 y 4 |
| Integración con sistema Rollship | Actor Rollship, UC-03 API, RS-05 | Cap. 3 y 4 |
| Migración del histórico de MS Access | UC-06, Actor MS Access | Cap. 4 |
| Operabilidad con guantes en nave | RS-04, Prototipos UI | Cap. 3 (diseño UI) |
| Integridad del inventario | RS-07, Diagrama de Estados | Cap. 3 (arquitectura) |
| Control de acceso por roles | RS-03, Actores | Cap. 3 (diseño) |
| Estadísticas de flujo para gerencia | UC-05 | Cap. 4 |

---

## 5. Glosario

**Actor.** Entidad externa al sistema (persona o sistema informático) que interactúa con él. En el WMS los actores son: Operario de Pista, Administrador, Motor Rollship y MS Access.

**Administrador.** Rol con privilegios extendidos en el WMS. Puede rectificar registros, gestionar incidencias, consultar estadísticas y lanzar la migración de datos (ETL).

**Almacén.** Recinto logístico en el Polígono Industrial Norte de Santander gestionado por Intermodal Sea Solutions para James Hardie, con 38 sectores y ~68.000 palés/año.

**Caso de uso.** Secuencia de acciones del sistema que produce un resultado de valor para un actor. En el WMS se han identificado doce casos de uso (UC-01 a UC-12).

**Ciclo de vida del palé.** Conjunto de estados por los que transita un palé: Recepcionado → Emplazado → En preparación → Expedido (o Incidencia / Cancelado). Formalizado en el Diagrama de Estados.

**Clase conceptual.** Abstracción del dominio del negocio sin dependencia tecnológica. Las clases conceptuales del WMS son: Almacen, Sector, Pale, Movimiento, Operario y Cliente.

**Disciplina de requisitos.** Flujo de trabajo RUP cuyo objetivo es alcanzar el acuerdo entre cliente, usuarios y desarrolladores sobre qué debe hacer el sistema. Comprende: encontrar actores y CdU, priorizar, detallar, prototipar y estructurar el modelo de CdU.

**Flujo alternativo.** Secuencia de pasos que se ejecuta cuando se produce una condición excepcional en un caso de uso (p. ej., sector lleno al registrar una entrada en UC-01).

**Flujo principal.** Secuencia de pasos estándar de un caso de uso que conduce al resultado deseado sin errores ni excepciones (escenario de éxito).

**Incidencia.** Estado de un palé que indica la presencia de una anomalía (daño físico, discrepancia de código o contenido) que impide el flujo operativo normal. Gestionada por el Administrador (UC-08).

**Inventario.** Conjunto de palés registrados en el sistema que se encuentran físicamente en el almacén en un momento dado (estados Emplazado, Reemplazado o En preparación).

**James Hardie.** James Hardie Iberia S.L. Empresa fabricante de materiales de construcción cuya mercancía gestiona Intermodal Sea Solutions en el almacén de Santander. Propietaria del sistema Rollship.

**Layout virtual.** Representación visual del estado de ocupación de los 38 sectores del almacén en tiempo real. Pantalla principal del módulo web, con semáforo cromático de saturación por sector.

**Modelo del dominio.** Representación conceptual del negocio mediante diagramas UML (clases, objetos, estados) y glosario. No incluye restricciones tecnológicas ni métodos de implementación.

**Motor Rollship.** Sistema corporativo externo de James Hardie que consulta el inventario del almacén mediante la API REST del WMS y recibe la respuesta en formato JSON.

**Movimiento.** Registro transaccional de cualquier operación sobre un palé. Incluye sello temporal, sectores de origen/destino y operario responsable.

**MS Access.** Sistema legado de gestión de inventario que el WMS sustituye. Sus limitaciones (acceso monolítico, sin interfaz web ni móvil) justifican el desarrollo del nuevo sistema.

**Operario de Pista.** Actor humano principal del WMS. Registra en tiempo real las operaciones físicas de entrada, salida y reubicación de palés desde un dispositivo móvil.

**Palé.** Unidad mínima de gestión del inventario. Cada palé tiene un código de referencia único (p. ej., JH-8819-A), tipo de material, masa y estado en su ciclo de vida.

**PMV / MVP.** Producto Mínimo Viable. Primera iteración del WMS que incluye: UC-01, UC-02, UC-03, UC-07 y UC-09.

**Precondición / Postcondición.** Condiciones que deben cumplirse antes (precondición) y que quedan garantizadas tras (postcondición) la ejecución correcta de un caso de uso.

**RUP.** Rational Unified Process. Marco de desarrollo iterativo e incremental organizado en fases y disciplinas. Metodología base de este TFG.

**Saturación.** Porcentaje de ocupación de un sector: (palésActuales / capacidadMax) × 100. Determina el color del semáforo del layout: verde (0–60 %), ámbar (61–85 %), rojo (86–100 %).

**Sector.** Cada una de las 38 subdivisiones físicas del almacén, identificadas por código alfanumérico (p. ej., B4). Unidad mínima de gestión espacial del WMS.

**Semáforo de saturación.** Codificación cromática del layout que indica el nivel de ocupación de cada sector: verde (disponible), ámbar (casi lleno), rojo (lleno o crítico).

**Trazabilidad.** Capacidad de relacionar cada requisito del sistema con los artefactos que lo satisfacen.

**UML.** Unified Modeling Language. Lenguaje estándar de modelado visual para especificar artefactos software. En el WMS se usan diagramas de clases, objetos, estados, casos de uso, actividad y contexto.

**WMS.** Warehouse Management System. Sistema de gestión de almacén desarrollado en este TFG para Intermodal Sea Solutions, orientado a la gestión de palés de James Hardie en Santander.

---

## 6. Referencias bibliográficas del capítulo

- Date, C. J. (2004). *An Introduction to Database Systems* (8ª ed.). Addison-Wesley.
- Elmasri, R., & Navathe, S. (2016). *Fundamentals of Database Systems* (7ª ed.). Pearson.
- Larman, C. (2004). *Applying UML and Patterns* (3ª ed.). Prentice Hall.
- Oracle Corporation. (2023). *MySQL 8.0 Reference Manual — InnoDB Storage Engine*. Oracle.
- Pressman, R., & Maxim, B. (2020). *Software Engineering: A Practitioner's Approach* (9ª ed.). McGraw-Hill.
- Sommerville, I. (2015). *Software Engineering* (10ª ed.). Pearson.

---

---

# Capítulo 3 — Análisis y Diseño

## 1. Introducción

En este capítulo se va a construir y constituir el núcleo de ingeniería abstracta de este Trabajo de Fin de Grado. Su propósito es dual: en primer lugar, refinar los requisitos ya obtenidos en el anterior capítulo, introduciendo el formalismo necesario con el cual poder tomar decisiones sobre el mantenimiento interno; en segundo lugar, se producirán los modelos y artefactos que permitan abordar la implementación como un refinamiento del diseño, sin alterar su infraestructura.

El capítulo se dividirá en dos disciplinas fundamentales (Larman, 2004):

- **Disciplina de Análisis:** traduce los casos de Uso y el Modelo del Dominio definidos en el capítulo 2 a un conjunto de clases de análisis MVC (Modelo, Vista, Controlador) que capturan los requisitos necesarios en lenguaje de diseñador sin imponer todavía restricciones tecnológicas.
- **Disciplina de Diseño:** confronta los requisitos no funcionales con el dominio de la solución. Aquí se toman las decisiones sobre arquitectura, distribución de los componentes, interacción entre las capas y persistencia de datos, justificando cada elección en los requisitos suplementarios.

La trazabilidad posible entre ambas disciplinas constituye el eje principal de este capítulo y garantiza que ninguna decisión de diseño sea arbitraria: toda clase, relación y decisión arquitectónica tiene su origen en un requisito documentado.

---

## 2. Disciplina de Análisis

### 2.1. Identificación de Clases de Análisis

La estrategia con la cual se identifican las clases de análisis se fundamenta, según las convenciones de Larman (2004) y la metodología de la asignatura *Ingeniería del Software*, de dos fuentes complementarias: la descripción de los casos de uso y el Modelo del Dominio. Ambas se combinan para producir tres categorías de análisis:

| Tipo de Clase | Criterios de derivación | Responsabilidad |
|---|---|---|
| **Modelo** | Entidades del Modelo del Dominio más las menciones a sustantivos clave en las descripciones de CdU | Representar los datos y la lógica de negocio del dominio |
| **Vista** | Una clase principal por cada actor humano; una clase primitiva por cada clase Modelo; una clase central por cada actor sistema externo | Intermediar entre el usuario y el sistema; presentar datos |
| **Controlador** | Una clase por cada Caso de Uso | Orquestar la ejecución de cada CdU, coordinando Modelos y Vistas |

#### 2.1.1. Clases Modelo

Estudiando el Modelo del Dominio y las descripciones de los doce casos de uso, se identifican las siguientes clases Modelo candidatas:

| Clase Modelo | Origen | CdU en que participa |
|---|---|---|
| **Pale** | Entidad central del Modelo del Dominio; aparece como objeto directo de manipulación en toda descripción de CdU | UC-01, UC-02, UC-03, UC-04 |
| **Sector** | Entidad del Dominio; su saturación es el dato clave del layout | UC-01, UC-02, UC-03, UC-04, UC-05 |
| **Movimiento** | Entidad del Dominio; registro transaccional de toda operación sobre un palé; necesario para auditorías | UC-01, UC-02, UC-04 |
| **Mercancía** | Mencionada en UC-01 como tipo de material del palé; necesaria para categorizar el inventario | UC-01 |
| **Usuario** | El Modelo del Dominio define operario con atributos de credenciales y rol; los actores humanos se autentican antes de actuar | UC-01 a UC-12 |
| **Incidencia** | Aparece en UC-08 como entidad de registro de anomalía; referenciada en el Diagrama de Estados | UC-08 |

#### 2.1.2. Clases Vista

Aplicando las reglas de derivación:

**a) Ventanas principales (una por actor humano):**

| Clase Vista — Ventana Principal | Actor que la origina |
|---|---|
| IUPrincipalOperario | Operario de Pista — Interfaz principal desde la que el operario accede a entrada, salida, layout y reubicación |
| IUPrincipalAdministrador | Supervisor / Administrador — Panel de control con acceso total, incluyendo estadísticas y migración |

**b) Vistas primitivas (una por clase Modelo):**

| Clase Vista — Primitiva | Clase Modelo asociada | CdU |
|---|---|---|
| IUFormEntradaPale | Pale | UC-01 — Formulario de registro de entrada |
| IUFormSalidaPale | Pale, Sector | UC-02 — Formulario de registro de salida |
| IUCardSector | Sector | UC-03 — Tarjeta visual del sector con semáforo |
| IUFormReubicacion | Pale, Sector | UC-04 — Formulario de selección de destino |
| IUPanelEstadisticas | Movimiento, Sector | UC-05 — Panel de KPIs e informes |
| IUVolcadoAccess | (ETL) | UC-06 — Interfaz de carga y progreso de migración |
| IUBuscador | Pale | UC-10 — Campo de búsqueda por código de referencia |
| IUPanelUsuarios | Usuario | UC-11 — Panel CRUD de cuentas de operario |
| IUHistorialPale | Movimiento | UC-12 — Línea de tiempo de movimientos de un palé |
| IUFormIncidencia | Incidencia, Pale | UC-08 — Formulario de registro de anomalía |
| IUFormLogin | Usuario | UC-09 — Formulario de introducción de credenciales |

**c) Interfaz central (una por actor sistema externo):**

| Clase Vista — Central | Actor Sistema que la origina |
|---|---|
| IUConectorRollship | Motor Rollship — Interfaz de comunicación que expone los datos procesados al ERP corporativo |
| IUVolcadoAccess | MS Access (Legacy) — Interfaz de gestión del proceso ETL de migración desde el sistema heredado |

#### 2.1.3. Clases Controlador

| Clase Controlador | CdU que gestiona | Tipo | Responsabilidad principal |
|---|---|---|---|
| ControladorEntradaPale | UC-01 | Principal | Validar datos, comprobar capacidad del sector con bloqueo de exclusión, persistir el palé y el movimiento de ENTRADA dentro de una transacción atómica |
| ControladorSalidaPale | UC-02 | Principal | Verificar estado del palé, actualizarlo a expedido, decrementar ocupación del sector y registrar movimiento de SALIDA |
| ControladorLayout | UC-03 | Principal | Recuperar el estado de los 38 sectores con porcentaje de saturación y semáforo cromático |
| ControladorReubicacion | UC-04 | Principal | Bloquear palé y sector destino simultáneamente, mover el palé actualizando contadores de ambos sectores, registrar movimiento de REUBICACION |
| ControladorEstadisticas | UC-05 | Principal | Agregar KPIs globales, movimientos por tipo y período, sectores más ocupados y distribución de estados de palés |
| ControladorMigracion | UC-06 | Principal | Orquestar el proceso ETL: leer los datos del sistema heredado, transformar, validar y cargar registros en el nuevo esquema |
| ControladorSaturacion | UC-07 | Subflujo interno | Calcular (ocupacion_actual / capacidad_max) × 100 y determinar el código cromático del semáforo; invocado por UC-01 y UC-03 |
| ControladorIncidencia | UC-08 | Principal | Registrar la anomalía, cambiar el estado del palé a Incidencia, bloquear operaciones sobre él y notificar al administrador |
| ControladorAutenticacion | UC-09 | Subflujo interno | Verificar credenciales del usuario y emitir un token de sesión firmado que porta el rol; invocado por todos los CdU con actores humanos |
| ControladorBusqueda | UC-10 | Principal | Consultar el inventario activo filtrando por código de referencia mediante búsqueda parcial y devolver el palé localizado con su sector actual |
| ControladorUsuarios | UC-11 | Principal | Crear, modificar y desactivar cuentas de operario; garantizar unicidad de credencial y registrar la operación en el log de auditoría |
| ControladorHistorial | UC-12 | Principal | Recuperar todos los movimientos asociados a un palé, ordenados cronológicamente, con datos de sector origen/destino y operario responsable |

#### 2.1.4. Diagrama de Clases de Análisis

> **[INSERTAR IMAGEN: Diagrama de Clases de Análisis — clases agrupadas por estereotipo Modelo/Vista/Controlador con relaciones de dependencia y navegabilidad según convención UML de Larman (2004)]**

---

### 2.2. Análisis de los Casos de Uso

El análisis de los Casos de Uso produce las realizaciones de análisis: diagramas de secuencia o colaboración que demuestran cómo interactúan las clases de análisis para dar cumplimiento a cada Caso de Uso, sin llegar a indagar en restricciones tecnológicas. Se detallan a continuación los casos de uso de mayor peso funcional y concurrencia.

#### 2.2.1. Realización de UC-01: Registrar Entrada de Palé

El CdU de mayor complejidad crítica, ya que involucra control de concurrencia explícito: si dos operarios intentan ubicar palés en el mismo sector simultáneamente, solo uno lo debe conseguir.

> **[INSERTAR IMAGEN: Diagrama de secuencia de análisis — UC-01: Operario → IUFormEntradaPale → ControladorEntradaPale → ControladorAutenticacion → ControladorSaturacion → Sector → Pale → Movimiento]**

#### 2.2.2. Realización de UC-02: Registrar Salida de Palé

> **[INSERTAR IMAGEN: Diagrama de secuencia de análisis — UC-02: Operario → IUFormSalidaPale → ControladorSalidaPale → Pale → Sector → Movimiento]**

#### 2.2.3. Realización de UC-03: Consultar Layout Interactivo

CdU de lectura pura con mayor frecuencia de invocación. Se refresca automáticamente sin intervención del usuario. No requiere control de escritura, pero sí que la consulta mantenga el estándar de respuesta.

> **[INSERTAR IMAGEN: Diagrama de secuencia de análisis — UC-03: Usuario → IUPrincipalOperario → ControladorLayout → ControladorSaturacion → Sector → IUCardSector]**

#### 2.2.4. Realización de UC-04: Reubicar Palé entre Sectores

CdU de mayor complejidad transaccional: involucra el bloqueo simultáneo de dos sectores para evitar condiciones de carrera durante la reubicación.

> **[INSERTAR IMAGEN: Diagrama de secuencia de análisis — UC-04: Operario → IUFormReubicacion → ControladorReubicacion → Pale → SectorOrigen → SectorDestino → Movimiento]**

#### 2.2.5. Realización de UC-05: Consultar Estadísticas de Flujo

> **[INSERTAR IMAGEN: Diagrama de secuencia de análisis — UC-05: Administrador → IUPanelEstadisticas → ControladorEstadisticas → Movimiento → Sector]**

#### 2.2.6. Realización de UC-06: Migrar Datos Legado (ETL)

> **[INSERTAR IMAGEN: Diagrama de secuencia de análisis — UC-06: Administrador → IUVolcadoAccess → ControladorMigracion → Pale → Movimiento]**

#### 2.2.7. Realización de UC-07: Calcular Saturación de Sector

> **[INSERTAR IMAGEN: Diagrama de secuencia de análisis — UC-07 (subflujo): ControladorSaturacion → Sector → resultado {pct, codigoColor}]**

#### 2.2.8. Realización de UC-08: Registrar Incidencia Operativa

> **[INSERTAR IMAGEN: Diagrama de secuencia de análisis — UC-08: Operario → IUFormIncidencia → ControladorIncidencia → Pale → Incidencia → Administrador (notificación)]**

#### 2.2.9. Realización de UC-09: Autenticar Usuario (Subflujo)

UC-09 es un Subflujo común incluido por todos los CdU con actores humanos. Su análisis modela la verificación de credenciales y la emisión del token de sesión.

> **[INSERTAR IMAGEN: Diagrama de secuencia de análisis — UC-09: Usuario → IUFormLogin → ControladorAutenticacion → UsuarioModel — flujos: credenciales válidas y credenciales incorrectas]**

#### 2.2.10. Realización de UC-10: Buscar Palé por Referencia

> **[INSERTAR IMAGEN: Diagrama de secuencia de análisis — UC-10: Usuario → IUBuscador → ControladorBusqueda → Pale → Sector → IUCardSector]**

#### 2.2.11. Realización de UC-11: Gestionar Usuarios del Sistema

> **[INSERTAR IMAGEN: Diagrama de secuencia de análisis — UC-11: Administrador → IUPanelUsuarios → ControladorUsuarios → Usuario — flujos: crear, modificar, desactivar]**

#### 2.2.12. Realización de UC-12: Consultar Historial de Palé

> **[INSERTAR IMAGEN: Diagrama de secuencia de análisis — UC-12: Usuario → IUHistorialPale → ControladorHistorial → Pale → Movimiento — línea de tiempo cronológica]**

---

### 2.3. Análisis de Paquetes

En esta fase de análisis se identifican los agrupamientos lógicos de clases que evolucionarán hacia los paquetes de implementación. Se detectan cuatro grandes áreas de responsabilidad, respetando los principios de alta cohesión interna y bajo acoplamiento externo (Larman, 2004):

> **[INSERTAR IMAGEN: Diagrama de Análisis de Paquetes — 4 paquetes: Gestión de Inventario (núcleo operativo), Consulta y Reporting, Seguridad y Acceso, Integración y Migración]**

---

## 3. Disciplina de Diseño

### 3.1. Decisiones Arquitectónicas y Justificación

Las decisiones de arquitectura no son elecciones arbitrarias: cada una responde a uno o varios de los requisitos suplementarios identificados en el Capítulo 2. La siguiente tabla documenta explícitamente esta trazabilidad:

| Decisión Arquitectónica | Requisito No Funcional | Justificación |
|---|---|---|
| Arquitectura en tres capas (Presentación → Aplicación → Datos) | RS-06 Mantenibilidad, RS-05 Portabilidad | Desacopla la UI del negocio y del esquema de datos; permite modificar cada capa de forma independiente (Fowler, 2002) |
| API REST sin estado | RS-05 Portabilidad, integración Rollship | Cualquier cliente (tablet, Rollship) consume la misma API; elimina dependencia de sesiones de servidor (Fielding, 2000) |
| Interfaz de aplicación de página única (SPA) con actualización parcial | RS-04 Usabilidad mobile-first, RS-01 Rendimiento | Elimina recargas de página completa; actualización parcial reduce el delay perceptible en pista logística |
| Base de datos relacional con soporte ACID y bloqueo a nivel de fila | RS-07 Integridad, RS-02 Disponibilidad | El motor bloquea solo la fila afectada (no la tabla entera como MS Access); garantiza Atomicidad, Consistencia, Aislamiento y Durabilidad |
| Token de sesión sin estado (stateless) | RS-03 Seguridad | El token porta la identidad del usuario en cada petición; el servidor no mantiene sesiones en memoria; compatible con SPA y con consumo externo desde Rollship |
| Patrón MVC en la capa de aplicación | RS-06 Mantenibilidad, cohesión | Los controladores gestionan el flujo; los modelos encapsulan el acceso a datos; las rutas expresan el contrato REST (Gamma et al., 1994) |
| Pool de conexiones persistentes | RS-01 Rendimiento, RS-02 Disponibilidad | Reutiliza conexiones abiertas; elimina la latencia de apertura en cada petición |
| Índices estratégicos en movimientos | RS-01 Rendimiento | La tabla crece ~68.000 registros/año; los índices sobre fecha, tipo y pale_id garantizan las consultas de historial y estadísticas dentro del umbral sub-segundo |

#### 3.1.1. Arquitectura en tres capas

La arquitectura adoptada sigue el patrón de tres capas canónico para sistemas de información web (Fowler, 2002). La comunicación entre la capa de presentación y la capa de aplicación se realiza exclusivamente mediante peticiones HTTP con payload JSON, siguiendo los principios REST de Fielding (2000).

> **[INSERTAR IMAGEN: Diagrama de Arquitectura en Tres Capas — Capa de Presentación (SPA), Capa de Aplicación (API REST), Capa de Datos (Base de datos relacional), con Sistema Externo Motor Rollship]**

---

### 3.2. Clases de Diseño

#### 3.2.1. Transición del Análisis al Diseño

La transición del análisis al diseño es el proceso por el que las clases de análisis, independientes de la tecnología, se mapean a clases de implementación concretas. La siguiente tabla documenta explícitamente este mapeo para los doce casos de uso:

| Clase de Análisis | Tipo | Clase / Función de Diseño | Componente de implementación |
|---|---|---|---|
| Pale | Model | Lógica de acceso a datos en PaleController | PaleController |
| Sector | Model | Lógica de acceso a datos en SectorController | SectorController |
| Movimiento | Model | Operación de persistencia transaccional | Incrustado en PaleController |
| Mercancia | Model | Entidad Mercancía con relación a Palé | schema.sql |
| Usuario | Model | Entidad Usuario con lógica de autenticación en AuthController | AuthController |
| Incidencia | Model | Campo estado='incidencia' en tabla palés | schema.sql (sprint actual) |
| IUPrincipalOperario | View | OperacionesPage + LayoutPage | pages/OperacionesPage, LayoutPage |
| IUPrincipalAdministrador | View | DashboardPage | pages/DashboardPage |
| IUFormEntradaPale | View | Formulario modal en OperacionesPage | pages/OperacionesPage |
| IUCardSector | View | Componente AlmacenMap | components/Layout/AlmacenMap |
| IUHistorialPale / IUBuscador | View | Tabla de historial y buscador en PalesPage | pages/PalesPage |
| IUFormLogin | View | LoginPage | pages/LoginPage |
| IUConectorRollship | View | Endpoints REST de consulta | routes/sectorRoutes, paleRoutes |
| ControladorEntradaPale | Controller | entradaPale() — operación de registro | paleController, paleRoutes |
| ControladorSalidaPale | Controller | salidaPale() — operación de salida | paleController, paleRoutes |
| ControladorLayout | Controller | getLayout() — consulta sectores | sectorController, sectorRoutes |
| ControladorReubicacion | Controller | reubicarPale() — operación de reubicación | paleController, paleRoutes |
| ControladorEstadisticas | Controller | getDashboard() — agregación de KPIs | statsController, statsRoutes |
| ControladorSaturacion | Controller | Cálculo de nivel de saturación dentro de getLayout() | sectorController |
| ControladorAutenticacion | Controller | login() — operación de autenticación | authController, authRoutes |
| ControladorBusqueda | Controller | listarPales() con parámetro buscar | paleController, paleRoutes |
| ControladorHistorial | Controller | detallePale() con historial | paleController, paleRoutes |
| ControladorUsuarios | Controller | (sprint futuro — UC-11 pendiente) | userController |
| ControladorIncidencia | Controller | (sprint futuro — UC-08 pendiente) | incidenciaController |
| ControladorMigracion | Controller | (sprint futuro — UC-06 pendiente) | migracionController |

#### 3.2.2. Principios de Diseño Aplicados: Cohesión y Acoplamiento

El diseño del sistema aplica los principios de alta cohesión y bajo acoplamiento que constituyen, junto con el tamaño adecuado, los tres pilares del diseño modular (Larman, 2004; Martin, 2003):

- **Cohesión comunicacional:** cada controlador agrupa operaciones que actúan sobre la misma entidad de dominio. `PaleController` agrupa todas las operaciones sobre palés (entrada, salida, reubicación, búsqueda e historial); `SectorController` agrupa únicamente la lectura y actualización de sectores; `AuthController` gestiona únicamente la autenticación. Este diseño corresponde a un nivel elevado de cohesión según la taxonomía de Constantine, tal como describe el material de la asignatura de Ingeniería del Software II.
- **Bajo acoplamiento:** la comunicación entre la capa de presentación y la capa de aplicación se realiza exclusivamente a través de la interfaz REST (JSON sobre HTTP). El frontend no conoce el esquema de base de datos; el backend no conoce el framework de UI. El único punto de contacto explícito entre subsistemas es la API REST, que actúa como interfaz contractual estable. Esto permite modificar la implementación interna de cualquier capa sin alterar el contrato externo.
- **Principio de Responsabilidad Única (SRP — SOLID):** cada función de controlador realiza una única operación transaccional. La función entradaPale() registra exclusivamente la entrada de un palé; cualquier lógica adicional (cálculo de saturación, notificación de alertas) se delega en funciones auxiliares o en la propia capa de persistencia.
- **Principio de Inversión de Dependencias (DIP — SOLID):** los controladores dependen del gestor de datos a través de una interfaz de abstracción que centraliza el acceso, sin acoplar el código de negocio al driver específico. Si se cambia el motor de base de datos, solo se modifica el módulo de configuración de conexión.

#### 3.2.3. Diagrama de Clases de Diseño — Backend

> **[INSERTAR IMAGEN: Diagrama de Clases de Diseño Backend — Routes, Middleware de autenticación, Controllers (Pale, Sector, Stats, Auth), Pool de conexiones con sus métodos y relaciones]**

#### 3.2.4. Diagrama de Clases de Diseño — Frontend

> **[INSERTAR IMAGEN: Diagrama de Clases de Diseño Frontend — Pages (Layout, Operaciones, Pales, Dashboard, Login), Component AlmacenMap, Service ApiService con sus atributos y métodos]**

---

### 3.3. Diseño de los CdU — Diagramas de Secuencia de Diseño

Los diagramas de secuencia de diseño muestran la interacción entre los componentes reales de implementación, con los nombres de métodos y rutas exactas del código desarrollado. Permiten verificar la coherencia entre el diseño y la implementación descrita en el Capítulo 4.

#### 3.3.1. UC-01: Registrar Entrada de Palé (Diseño)

> **[INSERTAR IMAGEN: Diagrama de secuencia de diseño — UC-01: OperacionesPage → api.js → POST /api/pales/entrada → AuthMiddleware.verificarToken → paleController.entradaPale() → Gestor de Base de Datos (bloqueo exclusivo de fila del sector, INSERT palé, UPDATE sector, INSERT movimiento)]**

#### 3.3.2. UC-03: Consultar Layout — Renderizar Mapa (Diseño)

> **[INSERTAR IMAGEN: Diagrama de secuencia de diseño — UC-03: LayoutPage → setInterval(30s) → api.js → GET /api/sectores → sectorController.getLayout() → Gestor de Base de Datos (SELECT sectores con CASE saturación) → AlmacenMap.renderizarSemaforo()]**

#### 3.3.3. UC-04: Reubicar Palé entre Sectores (Diseño)

> **[INSERTAR IMAGEN: Diagrama de secuencia de diseño — UC-04: PalesPage → api.js → PUT /api/pales/:id/reubicar → paleController.reubicarPale() → Gestor de Base de Datos (bloqueo doble determinístico, UPDATE palé y sectores, INSERT movimiento)]**

#### 3.3.4. UC-09: Autenticar Usuario (Diseño)

> **[INSERTAR IMAGEN: Diagrama de secuencia de diseño — UC-09: LoginPage → api.js → POST /api/auth/login → authController.login() → Gestor de Base de Datos (SELECT usuario, verificarPassword, generarToken) → redirección según rol]**

#### 3.3.5. UC-10: Buscar Palé por Referencia (Diseño)

> **[INSERTAR IMAGEN: Diagrama de secuencia de diseño — UC-10: PalesPage → api.js → GET /api/pales?buscar= → paleController.listarPales() → Gestor de Base de Datos (SELECT con búsqueda parcial, JOIN sectores y mercancía, paginación)]**

#### 3.3.6. UC-12: Consultar Historial de Palé (Diseño)

> **[INSERTAR IMAGEN: Diagrama de secuencia de diseño — UC-12: PalesPage → api.js → GET /api/pales/:id → paleController.detallePale() → Gestor de Base de Datos (SELECT palé, SELECT movimientos con JOIN usuarios y sectores ORDER BY fecha ASC)]**

---

### 3.4. Diagrama de Despliegue

El diagrama de despliegue muestra la distribución física de los componentes de software sobre los nodos de hardware del entorno de ejecución (Larman, 2004).

> **[INSERTAR IMAGEN: Diagrama de Despliegue — Dispositivo Cliente (Navegador Web), Servidor de Aplicación (SPA bundle estático + API REST + Middleware de autenticación + Pool de conexiones), Servidor de Base de Datos (motor relacional ACID, esquema del almacén), Sistema Externo Motor Rollship]**

**Notas de despliegue:**

- El servidor de aplicación y el de base de datos pueden cohabitar en el mismo equipo físico en la fase inicial, separándose cuando el volumen de operaciones lo justifique.
- La comunicación entre la SPA y la API se realiza sobre HTTP (HTTPS en producción). El token de sesión caduca cada 8 horas por defecto, forzando reautenticación al inicio de cada turno.
- El Motor Rollship consume la API REST del módulo logístico mediante peticiones GET autenticadas con su propio token, sin acceder directamente a la base de datos. Esto preserva el desacoplamiento y facilita la integración futura de nuevos almacenes.

---

### 3.5. Diagrama de Paquetes

El diagrama de paquetes muestra la organización modular del código fuente y las dependencias entre subsistemas.

> **[INSERTAR IMAGEN: Diagrama de Paquetes — Subsistema de Presentación (pages, components, services), Subsistema de Aplicación (routes, controllers, middleware, config, sql), comunicación HTTP REST entre ambos, dependencias externas]**

La arquitectura de paquetes garantiza una alta cohesión interna (cada paquete agrupa clases del mismo nivel de abstracción) y un bajo acoplamiento externo (los paquetes se comunican únicamente a través de interfaces bien definidas: la API REST entre frontend y backend, y el pool de conexiones entre controladores y base de datos). Este diseño facilita tanto el mantenimiento correctivo como la incorporación futura de nuevos módulos, conforme al principio abierto/cerrado de SOLID (Martin, 2003).

---

### 3.6. Modelo de Datos

#### 3.6.1. Modelo Lógico — Diagrama Entidad-Relación

> **[INSERTAR IMAGEN: Diagrama ER — entidades: SECTORES (id, codigo UK, nombre, capacidad_max, ocupacion_actual, activo, notas), MERCANCIA (id, codigo UK, descripcion, tipo enum, peso_kg), PALES (id, codigo_ref UK, sector_id FK, mercancia_id FK, estado enum, fecha_entrada, fecha_salida, notas), USUARIOS (id, nombre, email UK, password, rol enum, activo), MOVIMIENTOS (id, pale_id FK, usuario_id FK, tipo enum, sector_origen FK, sector_destino FK, fecha_hora, notas), MIGRACION_ACCESS (id, datos_raw json, procesado, error)]**

#### 3.6.2. Modelo Físico — Decisiones de implementación

El modelo físico concreta el modelo lógico en un gestor relacional con soporte transaccional. Las decisiones físicas más relevantes, cada una justificada en los requisitos suplementarios:

- **Motor transaccional (RS-07 Integridad):** Se selecciona un motor que implementa bloqueo a nivel de fila y soporte completo para transacciones ACID. La operación de bloqueo exclusivo sobre la fila del sector antes de comprobar la capacidad disponible garantiza que dos transacciones concurrentes no puedan ubicar simultáneamente palés en un sector ya lleno. Este comportamiento sustituye el bloqueo de fichero completo del sistema legado, que impedía el acceso concurrente de múltiples operarios.
- **Codificación Unicode completa (RS-04 Usabilidad):** Soporta el rango completo de caracteres, incluyendo caracteres especiales en nombres de mercancía y notas de operarios, evitando truncaciones o errores de codificación.
- **Índices estratégicos en movimientos (RS-01 Rendimiento):** La tabla de movimientos crece aproximadamente 68.000 registros por año. Se definen tres índices explícitos:
  - Índice sobre `fecha_hora` — para filtros de estadísticas por período (UC-05)
  - Índice sobre `tipo` — para conteos por tipo de operación (UC-05)
  - Índice sobre `pale_id` — para la recuperación del historial de un palé concreto (UC-12)
- **Restricción CHECK en sectores (RS-07 Integridad):** CHECK (ocupacion_actual >= 0) actúa como salvaguarda de integridad a nivel de base de datos. Junto con la función GREATEST(0, ocupacion - 1) en las consultas de decremento, garantiza que ningún error de aplicación pueda dejar la ocupación en un valor negativo.
- **sector_id NULL en palés (coherencia con el Modelo del Dominio):** Un palé expedido no tiene sector asignado. Permitir NULL en sector_id mantiene la semántica correcta del Diagrama de Estados del Capítulo 2: la ausencia de sector expresa el estado de expedición sin requerir un sector ficticio.

---

## 4. Trazabilidad y Coherencia del Capítulo

La siguiente tabla verifica que cada elemento de diseño tiene su origen documentado en los capítulos precedentes y su correspondencia prevista en la implementación:

| Requisito / CdU (Cap. 2) | Clase de Análisis (§2) | Decisión de Diseño (§3) | Componente de Implementación (Cap. 4) |
|---|---|---|---|
| UC-01 Entrada palé | ControladorEntradaPale, Pale, Sector, Movimiento | Transacción atómica con bloqueo de exclusión sobre el sector | paleController.entradaPale() · POST /api/pales/entrada |
| UC-02 Salida palé | ControladorSalidaPale, Pale, Sector | Transacción atómica, decremento con valor mínimo 0 | paleController.salidaPale() · POST /api/pales/:id/salida |
| UC-03 Layout | ControladorLayout, Sector, IUCardSector | REST GET, refresco 30 s, semáforo cromático | sectorController.getLayout() · AlmacenMap |
| UC-04 Reubicación | ControladorReubicacion, Pale, Sector (×2) | Bloqueo doble determinístico para evitar deadlock | paleController.reubicarPale() · PUT /api/pales/:id/reubicar |
| UC-05 Estadísticas | ControladorEstadisticas, Movimiento, Sector | Agregación con índice sobre fecha_hora | statsController.getDashboard() · GET /api/stats |
| UC-06 Migración ETL | ControladorMigracion, IUVolcadoAccess | Tabla de migración (datos brutos + flag procesado) | Sprint futuro |
| UC-07 Saturación (subflujo) | ControladorSaturacion (interno) | CASE de saturación incrustado en getLayout() | sectorController (función interna) |
| UC-08 Incidencia | ControladorIncidencia, Incidencia, Pale | Estado incidencia en ENUM palés.estado, bloqueo de operaciones | Sprint futuro · incidenciaController |
| UC-09 Autenticación (subflujo) | ControladorAutenticacion, Usuario | Token stateless, hash unidireccional, expiración 8h | authController.login() · POST /api/auth/login |
| UC-10 Búsqueda | ControladorBusqueda, Pale | Búsqueda parcial con paginación, JOIN sectores y mercancía | paleController.listarPales() · GET /api/pales?buscar= |
| UC-11 Usuarios | ControladorUsuarios, Usuario | CRUD usuarios, constraint email UNIQUE, hash contraseña | Sprint futuro · userController |
| UC-12 Historial | ControladorHistorial, Movimiento, Pale | JOIN de cuatro tablas, índice sobre pale_id | paleController.detallePale() · GET /api/pales/:id |
| RS-01 Rendimiento (<1,5 s) | ControladorLayout | Índices en sectores, consulta única con CASE | getLayout() — única consulta SELECT |
| RS-02 Disponibilidad (99,5 %) | — | Pool de conexiones persistentes con límite configurable | config/database |
| RS-03 Seguridad / Roles | ControladorAutenticacion, AuthMiddleware | Token de sesión, middleware de autorización por rol, expiración de sesión | middleware/auth |
| RS-04 Usabilidad / mobile-first | IUCardSector, IUPrincipalOperario | SPA con componentes táctiles ≥60 px, sin recargas completas de página | AlmacenMap, OperacionesPage |
| RS-05 Portabilidad | IUConectorRollship | API REST JSON sin estado (Fielding, 2000) | Endpoints GET /api/sectores, GET /api/pales |
| RS-06 Mantenibilidad (MVC) | Separación Controller / Model / View | Patrón MVC explícito, cohesión por módulo | Estructura routes/ · controllers/ · config/ |
| RS-07 Integridad (ACID) | Sector.bloquearYLeer() | Bloqueo exclusivo + transacción atómica (commit/rollback) | Pool transaccional en todos los controladores de escritura |

---

## 5. Referencias bibliográficas

- Date, C. J. (2004). *Introducción a los sistemas de bases de datos* (7.ª ed.). Pearson Educación.
- Fielding, R. T. (2000). *Architectural styles and the design of network-based software architectures* [Tesis doctoral, University of California, Irvine].
- Fowler, M. (2002). *Patterns of enterprise application architecture*. Addison-Wesley.
- Gamma, E., Helm, R., Johnson, R., & Vlissides, J. (1994). *Design patterns: Elements of reusable object-oriented software*. Addison-Wesley.
- Larman, C. (2004). *Applying UML and patterns: An introduction to object-oriented analysis and design and iterative development* (3.ª ed.). Prentice Hall.
- Martin, R. C. (2003). *Agile software development: Principles, patterns, and practices*. Prentice Hall.
- Oracle Corporation. (2023). *MySQL 8.0 Reference Manual: InnoDB transaction and locking information*.
- Pressman, R. S., & Maxim, B. R. (2020). *Software engineering: A practitioner's approach* (9.ª ed.). McGraw-Hill Education.
- Sommerville, I. (2015). *Software engineering* (10.ª ed.). Pearson.
