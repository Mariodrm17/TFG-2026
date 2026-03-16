### 2.1. Escenario Actual y Problemática

El contexto físico y operativo en el que se enmarca este Trabajo de Fin de Grado corresponde a las instalaciones de una empresa proveedora de servicios logísticos, concretamente en su almacén situado en Santander. Esta nave industrial está dedicada en exclusiva a la gestión del inventario de un cliente único, la corporación James Hardie. 

#### 2.1.1. Características Físicas y Operativas del Almacén

El almacén de Santander es una instalación de un tamaño considerable con una disposición física (Layout) estructurada por sectores. Todo el acopio de la mercancía se realiza **a nivel de suelo**, sin estanterías en altura, dividiendo la superficie total en aproximadamente 38 segmentos o áreas de ubicación diferenciadas destinadas al depósito de los palés.

El volumen de operaciones logísticas que soporta el almacén es ingente. Con base en el histórico de movimientos analizado (años 2025 y 2026), la instalación gestionó las siguientes magnitudes de tráfico de mercancía:
*   **Volumen de entradas:** Más de **44.800 palés** recibidos mediante 2.233 órdenes de entrada o recepciones de camiones.
*   **Volumen de salidas:** Más de **23.400 palés** expedidos, vinculados a 1.073 operaciones de distribución de carga.

Esta densidad operativa supone un reto constante de reubicación y registro de existencias diarios, exigiéndole precisión al sistema gestor para no incurrir en extravíos o rupturas de stock. La mercancía custodiada (bienes de *James Hardie*) está diversificada en diferentes tipos de empaquetado (bolsas, fardos comprimidos, etc.) con dimensiones y gramajes variables (ladrillos, pizarras, entre otros materiales de construcción y ferretería ligera referenciados como "Goods").

#### 2.1.2. Sistema Informático Heredado (Legacy)

A pesar del colosal nivel de material expedido, el engranaje de gestión informática con el que convive la empresa se encuentra severamente desfasado. Actualmente, los registros de entrada y salida se sostienen sobre una **base de datos monolítica de Microsoft Access**, completamente desprovista de sistemas automatizados como lectores de códigos de barras (RFID/EAN).

Este sistema Access se enfrenta, o convive precariamente, con el intento incipiente de la empresa de desarrollar un módulo de control integrado a través de una herramienta a medida de terceros, denominada "Rollship", construida primariamente con *Laravel* (PHP). No obstante, es el Access el gestor diario del histórico. 

La arquitectura física en las dependencias añade aún más ineficiencia al proceso: la empresa cuenta con **un único ordenador y una sola impresora centralizada en las oficinas**. No existen dispositivos PDA, tabletas ni terminales industriales *point-of-use* en las pistas del almacén.

#### 2.1.3. Flujo de Trabajo y Cuellos de Botella

La ausencia de un Software de Gestión de Almacenes (WMS) nativamente móvil y multiusuario provoca que los operarios deban desplazarse repetidamente desde la pista (zona de descargas y ubicación) hasta las oficinas centrales para imprimir listas de ubicaciones en papel, anotar a boli las ubicaciones reales donde han descargado los palés, y volver a la oficina a picar los datos en el sistema Access, un proceso manual y extremadamente propenso al error humano.

La motivación imperante y la necesidad de este proyecto nace precisamente de este caos organizativo. La problemática principal reside en la **carencia de un mapa interactivo (Layout) o herramienta dinámica que evalúe y grafique el porcentaje de ocupación en tiempo real**. Hoy en día, la empresa depende de hojas de cálculo de Excel dispares para intentar atisbar su porcentaje de saturación física.

Debido a que el sistema Access está confinado en un único terminal o, en su defecto, no gestiona eficientemente sesiones ni el bloqueo de transacciones en un entorno multi-sesión, no existe control de concurrencia. El resultado es un déficit crítico en la visibilidad del inventario en tiempo real, bloqueos administrativos al introducir datos solapados y una toma de decisiones errática al no conocer a ciencia cierta qué segmentos de suelo de la nave continúan libres para la entrada inminente de nuevos tráilers de mercancía de James Hardie.

### 2.2. Estado del Arte y Marco Teórico

La concepción de este Trabajo de Fin de Grado exige una revisión bibliográfica y técnica exhaustiva sobre las aproximaciones tecnológicas consolidadas en el sector logístico, así como el análisis de las metodologías transaccionales requeridas para orquestar infraestructuras concurrentes de alta demanda. Este análisis previo, estructurado en base a las premisas del consorcio industrial y la literatura académica subyacente, permite justificar empíricamente la necesidad de una solución de software hecha a medida.

#### 2.2.1. Exploración de Soluciones y Tecnologías Existentes

En la actualidad, el mercado de software logístico ofrece multitud de Sistemas de Gestión de Almacenes (WMS, por sus siglas en inglés) estandarizados orientados a regular el inventario y trazar la cadena de suministro, operando mayoritariamente bajo el paradigma de Software as a Service (SaaS). Estas herramientas comerciales, tales como *Wareventory* (Ye Chen, 2024), proponen enfoques dinámicos centrados en aplicaciones web para la mitigación del obsoleto modelo de terminales físicos aislados. Su filosofía radica en descentralizar la información, delegando el registro a plataformas en la nube accesibles desde cualquier dispositivo inteligente en pista.

Paralelamente, corporaciones líderes en la digitalización industrial, como *Schneider Electric* (2022), inciden en la necesidad imperativa de adoptar soluciones de automatización inteligente (*Smart Logistics*) y arquitecturas interconectadas. El propósito fundamental de esta evolución es brindar un ecosistema holístico donde el flujo logístico físico se encuentra monitorizado digitalmente en tiempo real, erradicando los retrasos (*delay*) propios de la transcripción manual de datos desde hojas de papel.

Desde un punto de vista estrictamente arquitectónico y de persistencia de datos, el marco teórico contemporáneo de los Sistemas Gestores de Bases de Datos Relacionales (SGBDR) desautoriza formalmente el uso de motores ofimáticos estáticos para entornos multiusuario masivos (Date, 2004; Elmasri & Navathe, 2016). La gestión de la concurrencia —la capacidad de atender peticiones simultáneas de múltiples operarios reubicando palés— es un requisito no funcional ineludible. Motores veteranos monolíticos como Microsoft Access, los cuales bloquean archivos enteros a nivel de disco, son intrínsecamente incapaces de procesar este volumen transaccional sin incurrir en colisiones (*deadlocks*) sistémicas. Es por ello que la industria aboga por arquitecturas relacionales robustas, notablemente encarnadas por el motor InnoDB de *MySQL* (Oracle Corporation, 2023). Este motor implementa intrínsecamente las propiedades ACID (Atomicidad, Consistencia, Aislamiento y Durabilidad) y emplea mecanismos de bloqueo a nivel de fila (*row-level locking*), garantizando una orquestación transaccional segura y expedita apoyando así la normativa del *Consorcio ISC* (2020) sobre metodologías para el control concurrente.

#### 2.2.2. Justificación de la Propuesta a Medida

A pesar de la riqueza funcional que a priori ostentan los sistemas WMS comerciales y los modernos ERPs de gestión logística generalista, su adopción *out-of-the-box* (directamente del proveedor) resulta taxativamente ineficiente e inviable para la casuística particular del almacén de Santander gestionado para *James Hardie* (2023). 

En primer lugar, los sistemas comerciales pecan de una excesiva genericidad, priorizando la trazabilidad financiera o volumétrica en detrimento de una representación visual espacial pura. La principal necesidad de la corporación radica en la visualización interactiva y dinámica del plano de planta (las 38 áreas), calculando asincrónicamente los porcentajes de saturación física. Integrar este requerimiento de visualización ad-hoc en un ERP comercial enlatado implicaría costes exorbitantes de personalización sobre código cerrado propietario.

Adicionalmente, el núcleo operativo de la empresa se encuentra inmerso en una fase de transición metodológica con el incipiente desarrollo interno de "Rollship", un ecosistema programado en entorno *Laravel* (Taylor, 2021). Desplegar una aplicación de terceros crearía barreras perimetrales ("silos de información") difícilmente integrables con los flujos de *Rollship* (Abarza, 2018). Interconectar módulos *Laravel* nativos interinos con APIs de software propietario es un ejercicio redundante cuando puede abordarse construyendo un Módulo Logístico web autónomo, pero simbiótico con la arquitectura de la organización, promoviendo la consistencia global del sistema (Pressman & Maxim, 2020).

Finalmente, el insalvable escollo de la migración del histórico relacional ("legacy") justifica, por sí solo, un diseño de software a medida (Sommerville, 2015; Masías Vergara, 2020). El salto evolutivo desde una tabla monolítica de MS Access hasta un modelo Entidad-Relación normalizado en *MySQL* requiere de procesos ETL (Extracción, Transformación y Carga) construidos ex profeso, con lógicas de validación cruzada para certificar que el patrimonio de datos de la empresa no sufre desincronización o corrupción alguna en el proceso. 

Por consiguiente, el estado de la tecnología actual invalida la continuidad de las arquitecturas ofimáticas (Access) y de los trasiegos de registros en papel, pero a su vez desaconseja férreamente la incrustación forzosa de macro-herramientas externas. La respuesta de ingeniería óptima, tal y como se infiere de la literatura, estriba inexorablemente en el diseño completo e integración directa de un Módulo Logístico customizado que aúne una interfaz web de control de layout muy optimizada con el motor relacional de alta disponibilidad *MySQL*.

### 2.3. Enunciado del Problema

La problemática fundamental que justifica la realización de este proyecto de ingeniería radica en la obsolescencia e ineficiencia del actual proceso de gestión de inventario, sustentado en una base de datos Microsoft Access estática que no satisface las gigantescas demandas operativas del almacén de Santander.

El problema específico a resolver consiste en que **la empresa carece de una herramienta de software moderna, web y en tiempo real que permita visualizar gráficamente y de forma dinámica el *layout* o plano del almacén junto con el porcentaje de ocupación de sus 38 segmentos**, a la par que arrastra una falta crítica de control de concurrencia para coordinar las acciones simultáneas de la plantilla. 

Esta deficiencia estructural provoca las siguientes disfunciones, que configuran el núcleo del problema a erradicar:
*   **Desincronización de datos y bloqueos del sistema:** El uso de un único terminal físico y una arquitectura *legacy* monolítica genera colisiones de transacciones (*deadlocks*) cuando es estrictamente necesario registrar múltiples de las más de 68.000 recepciones/expediciones gestionadas en los últimos años.
*   **Ineficiencia en el registro del flujo lógico-físico:** La dependencia de soportes en papel (imprimir listas, anotar la ubicación definitiva en la pista a bolígrafo y volver a la oficina para transcribirla) desencadena un alto índice de errores humanos, redundancia de trabajo y un grave *delay* o retraso en la actualización del stock real del cliente James Hardie.
*   **Ceguera operativa en la toma de decisiones:** La monitorización del espacio útil de acopio se encuentra fragmentada en archivos de Excel manuales, imposibilitando a los responsables conocer instantáneamente el nivel de saturación de la nave. Esto impide planificar de forma óptima la descarga y el posicionamiento de la mercancía entrante.

En definitiva, es perentorio diseñar, implementar y desplegar un Módulo Logístico web interactivo (soportado por motores de bases de datos relacionales estables con gestión concurrente) que consiga digitalizar completamente el mapa físico de ocupación del almacén, integrándose con el ecosistema de la nueva herramienta "Rollship" desarrollada en entorno Laravel, de cara a extinguir de una vez por todas la dependencia administrativa del sistema heredado y del papel.

### 2.4. Hipótesis de Partida

Todo proyecto de ingeniería de software debe erigirse sobre una premisa científico-tecnológica fundamental que encauce el desarrollo y permita medir empíricamente su tasa de éxito final. Teniendo como base la grave disfunción operativa y arquitectónica diagnosticada en el almacén de Santander, se enuncia la siguiente hipótesis de investigación y desarrollo:

**«El diseño, implementación e integración de un *Módulo Logístico web a medida*, dotado de un sistema interactivo de renderizado del *layout* físico de la nave e impulsado en su *backend* por un motor de bases de datos relacional (MySQL) asido a principios transaccionales ACID, resolverá de forma definitiva la ceguera operativa y la desincronización de inventario actual. Esta digitalización concurrente erradicará drásticamente los cuellos de botella derivados del manejo de papel y el uso de un terminal central monolítico, proveyendo a los responsables de métricas de ocupación en tiempo real verídicas y garantizando la coherencia de datos al interactuar simultáneamente múltiples usuarios para mover los más de 68.000 pallets anuales de la cuenta James Hardie.»**

Para validar esta hipótesis en el mundo real, el presente Trabajo de Fin de Grado desglosará el esfuerzo de ingeniería en una serie de **objetivos secuenciales** (análisis de requisitos corporativos, diseño del modelado relacional-concurrente e implementación web), destinados a probar que la sistematización moderna de estas operativas logísticas no solo es viable tecnológicamente, sino que su implantación aporta un valor cualitativo y de trazabilidad irrefutable al ecosistema empresarial de "Rollship".

### 2.5. Objetivos

A partir de la formulación del problema operativo y fundamentándose en la hipótesis descrita en el apartado anterior, se traza la meta principal de este Trabajo de Fin de Grado, así como los diferentes hitos parciales necesarios para alcanzarla metódicamente.

#### 2.5.1. Objetivo General

El objetivo primordial de este Trabajo de Fin de Grado consiste en **diseñar, desarrollar e implementar un Sistema Web interactivo de Gestión de Almacén (WMS de plano gráfico) robusto, con concurrencia garantizada bajo tecnología relacional MySQL**. Este sistema debe ser capaz de digitalizar la renderización física de la nave (Layout), erradicar la contención (*deadlocks*) de la actual base de datos Access monolítica y proveer métricas de ocupación en tiempo real para optimizar de forma integral y móvil el flujo logístico de los más de 68.000 pallets operados anualmente por la compañía.

#### 2.5.2. Objetivos Específicos

Para garantizar la viabilidad empírica y constructiva del Objetivo General, el alcance del presente TFG se fragmenta metodológicamente en tres objetivos específicos de investigación y desarrollo, intrínsecamente acoplados al ciclo de vida formal de la ingeniería del software y mapeados progresivamente en los siguientes capítulos de la memoria:

1.  **Objetivo Específico I (Ingeniería y Disciplina de Requisitos):**
    Ejecutar una fase de recolección, elicitación y análisis exhaustivo sobre el ecosistema físico del almacén de Santander y el software actual ("Rollship" y MsAccess). El fin es formalizar el catálogo de Requisitos Funcionales y No Funcionales (disponibilidad, concurrencia, carga) que delimitarán el nuevo modelo a escala. 
    *(Este objetivo será desarrollado y documentado íntegramente en el **Capítulo 2** del presente Trabajo de Fin de Grado).*
2.  **Objetivo Específico II (Análisis Arquitectónico y Diseño Relacional):**
    Diseñar la arquitectura lógica y física del Módulo Logístico web y, crucialmente, modelar el esquema Entidad-Relación (E/R) optimizado bajo MySQL para eludir los bloqueos mutuos que colapsaban el sistema original. Se establecerán aquí los diagramas formales UML (Casos de Uso, Clases, Despliegue) requeridos para trazar la escalabilidad de la solución.
    *(Este objetivo conformará el núcleo de modelado estructural a detallar en el **Capítulo 3** del documento).*
3.  **Objetivo Específico III (Implementación y Despliegue del PMV):**
    Desarrollar, programar y ensamblar la primera iteración funcional (Producto Mínimo Viable o PMV) que integre la base de datos concurrente y la interfaz gráfica web en tiempo real, validando los requerimientos de diseño preestablecidos mediante pruebas de integración antes de un eventual vuelco o migración a un entorno de producción.
    *(Este objetivo práctico y de codificación se demostrará analíticamente en el **Capítulo 4** de la memoria).*

### 2.6. Estructura del Proyecto y Metodología

La consecución de los ambiciosos objetivos descritos exige una aproximación metodológica rigurosa. Para orquestar el desarrollo de este Módulo Logístico Web, el TFG adopta de base un **enfoque metodológico de Ingeniería del Software Iterativo e Incremental**. Este ciclo de vida resulta idóneo frente a modelos tradicionales (como el Ciclo de Vida en Cascada), al permitir que la arquitectura de la base de datos MySQL y la interfaz de cliente web evolucionen orgánicamente mediante prototipos funcionales (MVP), mitigando los riesgos inherentes a sustituir el sistema Access obsoleto que, a día de hoy, soporta la operativa en producción del almacén.

El presente documento, y el desarrollo tecnológico que ampara, se estructura lógica y narrativamente en las siguientes fases metodológicas constitutivas:

*   **Fase I (Identificación y Diagnosis - Capítulo 1):** Establece el escenario logístico de partida (gestión de la cuenta *James Hardie*), enuncia la problemática de *deadlocks* y ceguera documental del almacén de Santander, y defiende el marco teórico que fundamenta la transición a una arquitectura web transaccional relacional.
*   **Fase II (Ingeniería de Requisitos - Capítulo 2):** Abordaje dogmático para documentar los casos de interacción real del operario con la mercancía. Se identificarán las restricciones del sistema heredado y se elaborará el catálogo de Requisitos Funcionales y No Funcionales (control de concurrencia, carga gráfica de los 38 sectores y despliegue integrado con *Rollship*).
*   **Fase III (Análisis, Diseño y Arquitectura - Capítulo 3):** Es el pilar de ingeniería abstracta del sistema. Abarcará el modelado lógico de datos (Modelo Entidad-Relación y diseño de los esquemas bajo MySQL) y la arquitectura de capas y conectividad (arquitectura cliente-servidor) que asegurará el bloqueo transaccional optimizado. Se emplearán modelos UML normalizados para la especificación formal del modelo de clases.
*   **Fase IV (Implementación Técnica de la Solución - Capítulo 4):** Fase práctica concerniente al despliegue tecnológico de la aplicación. Se presentará el entorno de desarrollo web configurado y se abordará la codificación algorítmica de la lógica de negocio (renderizado dinámico del nivel de ocupación asincrónicamente frente a la base de datos).
*   **Fase V (Verificación, Resultados y Conclusiones - Capítulo 5):** Discusión final centrada en validar empíricamente la hipótesis enunciada. Se presentarán los resultados y la eficacia comparada del nuevo sistema al ser expuesto al volumen de 68.000 operaciones anuales simuladas. Adicionalmente, se acotarán las viables *Líneas de Actuación Futuras* para la herramienta (ej. integración completa con el ERP *Rollship*, adaptación para nuevos almacenes en Vigo o adición de infraestructuras RFID en pista).
