"""
Generador del Capitulo 2 del TFG en formato Word (.docx).
Los diagramas se insertan como bloques de codigo PlantUML listos para renderizar.
"""

from docx import Document
from docx.shared import Inches, Pt, RGBColor, Cm
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml.ns import qn
from docx.oxml import OxmlElement
import copy


# ---------------------------------------------------------------------------
# Utilidades de formato
# ---------------------------------------------------------------------------

def set_page_margins(doc):
    for section in doc.sections:
        section.top_margin    = Cm(2.5)
        section.bottom_margin = Cm(2.5)
        section.left_margin   = Cm(3.0)
        section.right_margin  = Cm(2.5)


def add_heading(doc, text, level):
    p = doc.add_heading(text, level=level)
    p.paragraph_format.space_before = Pt(12)
    p.paragraph_format.space_after  = Pt(4)
    for run in p.runs:
        run.font.name = 'Times New Roman'
        run.font.color.rgb = RGBColor(0, 0, 0)
        run.font.size = Pt(14 if level == 1 else 12 if level == 2 else 11)
    return p


def add_body(doc, text, indent=False, bold_parts=None, italic=False):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(0)
    p.paragraph_format.space_after  = Pt(6)
    p.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    if indent:
        p.paragraph_format.first_line_indent = Cm(1.25)

    if bold_parts:
        remaining = text
        for bt in bold_parts:
            idx = remaining.find(bt)
            if idx >= 0:
                if idx > 0:
                    r = p.add_run(remaining[:idx])
                    r.font.name = 'Times New Roman'; r.font.size = Pt(12)
                r = p.add_run(bt)
                r.font.name = 'Times New Roman'; r.font.size = Pt(12); r.bold = True
                remaining = remaining[idx + len(bt):]
        if remaining:
            r = p.add_run(remaining)
            r.font.name = 'Times New Roman'; r.font.size = Pt(12)
    else:
        r = p.add_run(text)
        r.font.name = 'Times New Roman'
        r.font.size = Pt(12)
        r.italic = italic
    return p


def add_bullet(doc, text):
    p = doc.add_paragraph(style='List Bullet')
    p.paragraph_format.space_after = Pt(3)
    r = p.add_run(text)
    r.font.name = 'Times New Roman'
    r.font.size = Pt(11)
    return p


def add_figure_caption(doc, caption):
    p = doc.add_paragraph()
    p.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_before = Pt(4)
    p.paragraph_format.space_after  = Pt(12)
    r = p.add_run(caption)
    r.font.name = 'Times New Roman'
    r.font.size = Pt(10)
    r.italic = True
    return p


def add_separator(doc):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(6)
    p.paragraph_format.space_after  = Pt(6)
    r = p.add_run()
    r.font.size = Pt(1)


def _set_cell_bg(cell, hex_color):
    tc = cell._tc
    tcPr = tc.get_or_add_tcPr()
    shd = OxmlElement('w:shd')
    shd.set(qn('w:val'), 'clear')
    shd.set(qn('w:color'), 'auto')
    shd.set(qn('w:fill'), hex_color)
    tcPr.append(shd)


def _set_cell_borders(cell):
    tc = cell._tc
    tcPr = tc.get_or_add_tcPr()
    tcBorders = OxmlElement('w:tcBorders')
    for side in ('top', 'left', 'bottom', 'right'):
        border = OxmlElement(f'w:{side}')
        border.set(qn('w:val'), 'single')
        border.set(qn('w:sz'), '4')
        border.set(qn('w:space'), '0')
        border.set(qn('w:color'), 'CCCCCC')
        tcBorders.append(border)
    tcPr.append(tcBorders)


def add_table(doc, headers, rows, col_widths=None):
    table = doc.add_table(rows=1, cols=len(headers))
    table.style = 'Table Grid'
    hdr_cells = table.rows[0].cells
    for i, h in enumerate(headers):
        hdr_cells[i].text = h
        _set_cell_bg(hdr_cells[i], '1F5C99')
        for para in hdr_cells[i].paragraphs:
            para.alignment = WD_ALIGN_PARAGRAPH.CENTER
            para.paragraph_format.space_before = Pt(2)
            para.paragraph_format.space_after  = Pt(2)
            for run in para.runs:
                run.font.bold = True
                run.font.name = 'Times New Roman'
                run.font.size = Pt(10)
                run.font.color.rgb = RGBColor(255, 255, 255)
    for idx, row_data in enumerate(rows):
        row = table.add_row().cells
        bg = 'F2F7FD' if idx % 2 == 0 else 'FFFFFF'
        for i, cell_text in enumerate(row_data):
            row[i].text = str(cell_text)
            _set_cell_bg(row[i], bg)
            for para in row[i].paragraphs:
                para.paragraph_format.space_before = Pt(1)
                para.paragraph_format.space_after  = Pt(1)
                for run in para.runs:
                    run.font.name = 'Times New Roman'
                    run.font.size = Pt(10)
    if col_widths:
        for i, w in enumerate(col_widths):
            for row in table.rows:
                row.cells[i].width = Cm(w)
    doc.add_paragraph().paragraph_format.space_after = Pt(4)
    return table


def add_plantuml_block(doc, uml_code, figure_label):
    """Inserta el codigo PlantUML en un bloque de codigo con estilo y pie de figura."""
    # Marco exterior (tabla de 1 celda para simular un bloque de codigo)
    table = doc.add_table(rows=1, cols=1)
    table.style = 'Table Grid'
    cell = table.rows[0].cells[0]
    _set_cell_bg(cell, 'F8F8F8')

    # Encabezado del bloque
    hdr = cell.paragraphs[0]
    hdr.clear()
    hdr.paragraph_format.space_before = Pt(3)
    hdr.paragraph_format.space_after  = Pt(1)
    r = hdr.add_run('PlantUML — ' + figure_label.split('.')[0].strip())
    r.font.name = 'Calibri'
    r.font.size = Pt(8)
    r.font.bold = True
    r.font.color.rgb = RGBColor(100, 100, 100)

    # Lineas de codigo
    lines = uml_code.strip().split('\n')
    for line in lines:
        p = cell.add_paragraph()
        p.paragraph_format.space_before = Pt(0)
        p.paragraph_format.space_after  = Pt(0)
        p.paragraph_format.left_indent  = Cm(0.2)
        r = p.add_run(line)
        r.font.name = 'Courier New'
        r.font.size = Pt(8)
        r.font.color.rgb = RGBColor(30, 30, 120)

    # Ajustar ancho de la tabla
    for row in table.rows:
        row.cells[0].width = Cm(16.0)

    add_figure_caption(doc, figure_label)


# ---------------------------------------------------------------------------
# Codigo PlantUML de los diagramas
# ---------------------------------------------------------------------------

DIAG_CLASES = """@startuml
!theme plain
skinparam classAttributeIconSize 0
title Figura 1: Diagrama de Clases Conceptuales

class Almacen {
  idAlmacen : int
  ubicacion : String
  numSectores : int
  superficie : float
}
class Sector {
  idSector : int
  identificador : String
  capacidadMax : int
  paleActuales : int
  zona : String
}
class Pale {
  idPale : int
  codigoRef : String
  tipoMaterial : String
  masaKg : float
  fechaEntrada : Date
  estado : EstadoPale
}
class Movimiento {
  idMovimiento : int
  selloTiempo : DateTime
  tipoOperacion : TipoMovimiento
  sectorOrigen : String
  sectorDestino : String
  incidencias : String
}
class Operario {
  idOperario : int
  credencial : String
  nombreCompleto : String
  turno : String
  rol : RolOperario
}
class Cliente {
  idCliente : int
  razonSocial : String
  cif : String
}
enum EstadoPale {
  RECEPCIONADO
  EMPLAZADO
  REEMPLAZADO
  EN_PREPARACION
  EXPEDIDO
  INCIDENCIA
  CANCELADO
}
enum TipoMovimiento {
  ENTRADA
  SALIDA
  REUBICACION
}
enum RolOperario {
  OPERARIO
  ADMINISTRADOR
}
Almacen  "1" *-- "1..*" Sector     : compone >
Sector   "1" o-- "0..*" Pale       : aloja >
Pale     "1" --> "1..*" Movimiento : origina >
Operario "1" --> "0..*" Movimiento : registra >
Almacen  "1" --  "1"    Cliente    : gestiona inventario de >
Pale       ..> EstadoPale
Movimiento ..> TipoMovimiento
Operario   ..> RolOperario
@enduml"""

DIAG_OBJETOS = """@startuml
!theme plain
title Figura 2: Diagrama de Objetos - Turno tarde, 12/05/2026 16:45

object "almacenSantander : Almacen" as a {
  idAlmacen = 1
  ubicacion = "Santander, P.I. Norte"
  numSectores = 38
  superficie = 4200.0
}
object "jamesHardie : Cliente" as c {
  razonSocial = "James Hardie Iberia S.L."
  cif = "B-8871234"
}
object "sectorB4 : Sector" as s {
  identificador = "B4"
  capacidadMax = 12
  paleActuales = 11
  zona = "Bloque B - Fachada Norte"
}
object "paleJH8819 : Pale" as p {
  codigoRef = "JH-8819-A"
  tipoMaterial = "Pizarras Ensacadas"
  masaKg = 840.0
  estado = EMPLAZADO
}
object "diegoMD : Operario" as o {
  credencial = "OP-MD72"
  nombreCompleto = "Diego Martinez"
  turno = "Tarde (14:00-22:00)"
  rol = OPERARIO
}
object "mov10234 : Movimiento" as m {
  idMovimiento = 10234
  selloTiempo = 2026-05-12T16:45:00
  tipoOperacion = ENTRADA
  sectorDestino = "B4"
}
a --> c : gestiona inventario de
a --> s : segmentado en
s --> p : aloja
p --> m : origina
o --> m : registra
@enduml"""

DIAG_ESTADOS = """@startuml
!theme plain
title Figura 3: Diagrama de Estados - Ciclo de vida del Pale

[*] --> Recepcionado : descargaTrailer()

Recepcionado --> Emplazado    : asignarSector() [sector disponible]
Recepcionado --> Incidencia   : detectarError() [anomalia]

Emplazado --> Reemplazado     : solicitarReubicacion() [destino disponible]
Emplazado --> EnPreparacion   : solicitarExpedicion() [orden autorizada]
Emplazado --> Incidencia      : detectarError()

Reemplazado --> Emplazado     : reubicacionConfirmada()

EnPreparacion --> Expedido    : aprobarCarga() [documentacion valida]
EnPreparacion --> Cancelado   : rechazarOrden()

Incidencia --> Emplazado      : resolverIncidencia()
Incidencia --> Cancelado      : cancelarPale()

Expedido --> [*]
Cancelado --> [*]

state Recepcionado  : Pale en muelle, sin sector asignado.
state Emplazado     : Pale ubicado. Estado de reposo.
state Reemplazado   : Pale en transito entre sectores.
state EnPreparacion : Reservado para expedicion.
state Expedido      : Pale fuera del almacen. Terminal.
state Incidencia    : Anomalia detectada. Bloqueado.
state Cancelado     : Expedicion cancelada.
@enduml"""

DIAG_CDU_GENERAL = """@startuml
!theme plain
title Figura 4: Diagrama de Casos de Uso - Vision General
left to right direction

actor "Operario\\nde Pista"    as OP
actor "Administrador"          as AD
actor "Motor Rollship\\n<<sistema>>" as RS
actor "MS Access\\n<<legado>>" as MS

rectangle "Modulo Logistico Web" {
  usecase "UC-01 Registrar\\nentrada de pale"    as UC01
  usecase "UC-02 Registrar\\nsalida de pale"     as UC02
  usecase "UC-03 Consultar\\nlayout interactivo" as UC03
  usecase "UC-04 Reubicar pale\\nentre sectores" as UC04
  usecase "UC-05 Consultar\\nestadisticas"       as UC05
  usecase "UC-06 Migrar datos\\nlegado (ETL)"    as UC06
  usecase "UC-07 Calcular\\nsaturacion sector"   as UC07
  usecase "UC-08 Registrar\\nincidencia"         as UC08
  usecase "UC-09 Autenticar\\nusuario"           as UC09
  usecase "UC-10 Buscar pale\\npor referencia"   as UC10
  usecase "UC-11 Gestionar\\nusuarios"           as UC11
  usecase "UC-12 Consultar historial\\nde pale"  as UC12
}

OP --> UC01
OP --> UC02
OP --> UC03
OP --> UC04
OP --> UC10
OP --> UC12
AD --> UC01
AD --> UC02
AD --> UC03
AD --> UC04
AD --> UC05
AD --> UC06
AD --> UC10
AD --> UC11
AD --> UC12
RS --> UC03
MS --> UC06

UC01 ..> UC09 : <<include>>
UC02 ..> UC09 : <<include>>
UC03 ..> UC09 : <<include>>
UC04 ..> UC09 : <<include>>
UC10 ..> UC09 : <<include>>
UC11 ..> UC09 : <<include>>
UC12 ..> UC09 : <<include>>
UC01 ..> UC07 : <<include>>
UC03 ..> UC07 : <<include>>
UC01 ..> UC08 : <<extend>>
@enduml"""

DIAG_CDU_OPERARIO = """@startuml
!theme plain
title Figura 5: Diagrama de CdU - Actor: Operario de Pista
left to right direction

actor "Operario de Pista" as OP

rectangle "Modulo Logistico Web" {
  usecase "UC-01 Registrar\\nentrada de pale"    as UC01
  usecase "UC-02 Registrar\\nsalida de pale"     as UC02
  usecase "UC-03 Consultar\\nlayout interactivo" as UC03
  usecase "UC-04 Reubicar pale\\nentre sectores" as UC04
  usecase "UC-07 Calcular\\nsaturacion sector"   as UC07
  usecase "UC-08 Registrar\\nincidencia"         as UC08
  usecase "UC-09 Autenticar\\nusuario"           as UC09
  usecase "UC-10 Buscar pale\\npor referencia"   as UC10
  usecase "UC-12 Consultar historial\\nde pale"  as UC12
}

OP --> UC01
OP --> UC02
OP --> UC03
OP --> UC04
OP --> UC10
OP --> UC12

UC01 ..> UC09 : <<include>>
UC02 ..> UC09 : <<include>>
UC03 ..> UC09 : <<include>>
UC04 ..> UC09 : <<include>>
UC10 ..> UC09 : <<include>>
UC12 ..> UC09 : <<include>>
UC01 ..> UC07 : <<include>>
UC03 ..> UC07 : <<include>>
UC01 ..> UC08 : <<extend>>
@enduml"""

DIAG_CDU_ADMIN = """@startuml
!theme plain
title Figura 6: Diagrama de CdU - Actor: Administrador
left to right direction

actor "Administrador" as AD

rectangle "Modulo Logistico Web" {
  usecase "UC-01 Registrar\\nentrada de pale"    as UC01
  usecase "UC-02 Registrar\\nsalida de pale"     as UC02
  usecase "UC-03 Consultar\\nlayout interactivo" as UC03
  usecase "UC-04 Reubicar pale\\nentre sectores" as UC04
  usecase "UC-05 Consultar\\nestadisticas"       as UC05
  usecase "UC-06 Migrar datos\\nlegado (ETL)"    as UC06
  usecase "UC-07 Calcular\\nsaturacion sector"   as UC07
  usecase "UC-08 Registrar\\nincidencia"         as UC08
  usecase "UC-09 Autenticar\\nusuario"           as UC09
  usecase "UC-10 Buscar pale\\npor referencia"   as UC10
  usecase "UC-11 Gestionar\\nusuarios"           as UC11
  usecase "UC-12 Consultar historial\\nde pale"  as UC12
}

AD --> UC01
AD --> UC02
AD --> UC03
AD --> UC04
AD --> UC05
AD --> UC06
AD --> UC10
AD --> UC11
AD --> UC12

UC01 ..> UC09 : <<include>>
UC02 ..> UC09 : <<include>>
UC03 ..> UC09 : <<include>>
UC04 ..> UC09 : <<include>>
UC10 ..> UC09 : <<include>>
UC11 ..> UC09 : <<include>>
UC12 ..> UC09 : <<include>>
UC01 ..> UC07 : <<include>>
UC03 ..> UC07 : <<include>>
UC01 ..> UC08 : <<extend>>
@enduml"""

DIAG_CDU_ROLLSHIP = """@startuml
!theme plain
title Figura 7: Diagrama de CdU - Actor: Motor Rollship
left to right direction

actor "Motor Rollship\\n<<sistema>>" as RS

rectangle "Modulo Logistico Web" {
  usecase "UC-03 Consultar\\nlayout interactivo" as UC03
  usecase "UC-07 Calcular\\nsaturacion sector"   as UC07
}

RS --> UC03
UC03 ..> UC07 : <<include>>
@enduml"""

DIAG_CONTEXTO = """@startuml
!theme plain
title Figura 8: Diagrama de Contexto - Modulo Logistico Web
left to right direction

actor "Operario\\nde Pista"          as OP
actor "Administrador"                as AD
actor "Motor Rollship\\n<<sistema>>" as RS
actor "MS Access\\n<<legado>>"       as MS

component "Modulo Logistico Web" as MLW

OP  --> MLW : credenciales / datos de operacion
MLW --> OP  : confirmacion / mapa de sectores actualizado

AD  --> MLW : credenciales admin / parametros informe
MLW --> AD  : informes / estadisticas / panel incidencias

RS  --> MLW : solicitud estado inventario (API GET)
MLW --> RS  : estado de los 38 sectores (JSON)

MS  --> MLW : datos historicos (CSV/ODBC) [fase migracion]
@enduml"""

DIAG_ACT_UC01 = """@startuml
!theme plain
title Figura 9: Diagrama de Actividad - UC-01: Registrar entrada de pale

|Operario de Pista|
start
:Solicita nueva entrada de pale;

|Sistema|
:Presenta formulario de entrada;
:Muestra mapa de sectores actualizado;

|Operario de Pista|
:Introduce codigo, tipo de material y masa;
:Selecciona sector destino en el mapa;

|Sistema|
if (Sector con capacidad disponible?) then (Si)
  if (Codigo de referencia duplicado?) then (No)
    :Registra pale con estado EMPLAZADO;
    :Genera movimiento ENTRADA;
    :Actualiza ocupacion del sector;
    :Confirma operacion al operario;
    :Actualiza mapa en pantalla;
    stop
  else (Si, duplicado)
    :Muestra aviso de referencia duplicada;
    |Operario de Pista|
    :Corrige el codigo o confirma;
    stop
  endif
else (No, sector lleno)
  :Muestra aviso: sector sin capacidad;
  |Operario de Pista|
  :Selecciona sector alternativo;
  stop
endif
@enduml"""

DIAG_ACT_UC02 = """@startuml
!theme plain
title Figura 10: Diagrama de Actividad - UC-02: Registrar salida de pale

|Operario de Pista|
start
:Solicita registrar salida de pale\\n(por codigo o en el mapa);

|Sistema|
:Presenta detalle del pale\\ny orden de expedicion;

|Operario de Pista|
:Confirma que el pale esta en area de carga;
:Solicita registrar la salida;

|Sistema|
:Solicita confirmacion explicita;

|Operario de Pista|
:Confirma la operacion;

|Sistema|
if (Estado del pale permite expedicion?) then (Si)
  :Actualiza estado del pale a EXPEDIDO;
  :Genera movimiento SALIDA;
  :Libera plaza del sector origen;
  :Notifica al Administrador;
  :Confirma operacion al operario;
  :Actualiza mapa;
  stop
else (No, estado incompatible)
  :Informa del estado e impide la expedicion;
  stop
endif
@enduml"""

DIAG_ACT_UC04 = """@startuml
!theme plain
title Figura 11: Diagrama de Actividad - UC-04: Reubicar pale entre sectores

|Operario de Pista|
start
:Localiza el pale (codigo o mapa)\\ny solicita reubicarlo;

|Sistema|
:Presenta detalle del pale y sector actual;

|Operario de Pista|
:Selecciona el sector destino en el mapa;

|Sistema|
if (Sector destino con capacidad disponible?) then (Si)
  if (Sector destino distinto del actual?) then (Si)
    if (Estado del pale = EMPLAZADO?) then (Si)
      :Actualiza ubicacion del pale al sector destino;
      :Genera movimiento REUBICACION\\n(origen, destino, sello temporal, operario);
      :Actualiza contadores de ocupacion de ambos sectores;
      :Confirma operacion y actualiza mapa;
      stop
    else (No, estado incompatible)
      :Informa de estado incompatible;
      stop
    endif
  else (No, mismo sector)
    :Informa: destino igual que sector actual;
    stop
  endif
else (No, sector lleno)
  :Informa de sector lleno e invita a seleccionar otro;
  stop
endif
@enduml"""

DIAG_ACT_UC05 = """@startuml
!theme plain
title Figura 12: Diagrama de Actividad - UC-05: Consultar estadisticas de flujo

|Administrador|
start
:Accede al panel de estadisticas;

|Sistema|
:Presenta resumen del dia: entradas, salidas, reubicaciones;

|Administrador|
:Configura filtros: rango de fechas, sector o tipo de operacion;

|Sistema|
if (Existen movimientos en el periodo?) then (Si)
  :Calcula indicadores: operaciones por tipo,\\nocupacion por sector, operarios activos, horas pico;
  :Presenta tabla y grafico de resultados;
  |Administrador|
  if (Desea exportar el informe?) then (Si)
    |Sistema|
    :Genera archivo CSV o PDF;
    stop
  else (No)
    stop
  endif
else (Sin datos en el periodo)
  :Informa de ausencia de datos\\ny sugiere ampliar el periodo;
  stop
endif
@enduml"""

DIAG_ACT_UC06 = """@startuml
!theme plain
title Figura 13: Diagrama de Actividad - UC-06: Migrar datos legado (ETL)

|Administrador|
start
:Accede al modulo ETL;

|Sistema|
:Presenta formulario de carga y formato esperado;

|Administrador|
:Sube el archivo exportado desde MS Access;

|Sistema|
if (Formato y estructura validos?) then (Si)
  :Ejecuta simulacion (dry run);
  :Informa de registros a importar y conflictos;
  |Administrador|
  :Revisa informe y confirma migracion;
  |Sistema|
  if (Migracion sin errores criticos?) then (Si)
    :Importa pales historicos;
    :Genera movimientos ENTRADA para cada registro;
    :Presenta resumen: importados, omitidos, errores;
    stop
  else (Fallo durante la migracion)
    :Ejecuta rollback completo (RS-07);
    :Informa del error al administrador;
    stop
  endif
else (Formato no valido)
  :Describe errores de formato e impide continuar;
  stop
endif
@enduml"""

DIAG_ACT_UC08 = """@startuml
!theme plain
title Figura 14: Diagrama de Actividad - UC-08: Registrar incidencia operativa

|Operario de Pista|
start
:Detecta anomalia en el pale;
:Accede al formulario de incidencia;

|Sistema|
:Presenta formulario con codigo del pale vinculado;

|Operario de Pista|
:Selecciona tipo: dano fisico, discrepancia de codigo\\no diferencia de contenido;
:Describe la anomalia;

|Sistema|
:Registra la incidencia;
:Cambia estado del pale a INCIDENCIA;
:Bloquea operaciones sobre el pale;
:Notifica al Administrador;
:Confirma registro al operario;

|Administrador|
:Recibe notificacion;
if (Incidencia resoluble?) then (Si)
  :Toma medidas y la marca como resuelta;
  |Sistema|
  :Devuelve pale al estado EMPLAZADO;
  stop
else (No, dano irreparable)
  :Cancela el pale;
  |Sistema|
  :Actualiza estado a CANCELADO;
  stop
endif
@enduml"""

DIAG_ESTRUCTURA = """@startuml
!theme plain
title Figura 18: Estructura del Modelo de CdU (include / extend)

usecase "UC-01\\nRegistrar entrada\\nde pale"    as UC01
usecase "UC-02\\nRegistrar salida\\nde pale"     as UC02
usecase "UC-03\\nConsultar layout\\ninteractivo" as UC03
usecase "UC-04\\nReubicar pale"                  as UC04
usecase "UC-07\\nCalcular saturacion\\nde sector" as UC07
usecase "UC-08\\nRegistrar incidencia\\noperativa" as UC08
usecase "UC-09\\nAutenticar\\nusuario"            as UC09
usecase "UC-10\\nBuscar pale\\npor referencia"   as UC10
usecase "UC-11\\nGestionar\\nusuarios"            as UC11
usecase "UC-12\\nConsultar historial\\nde pale"  as UC12

UC01 ..> UC09 : <<include>>
UC02 ..> UC09 : <<include>>
UC03 ..> UC09 : <<include>>
UC04 ..> UC09 : <<include>>
UC10 ..> UC09 : <<include>>
UC11 ..> UC09 : <<include>>
UC12 ..> UC09 : <<include>>
UC01 ..> UC07 : <<include>>
UC03 ..> UC07 : <<include>>
UC01 ..> UC08 : <<extend>> [errorDetectado]

note bottom of UC09
  Subflujo obligatorio compartido
  por todos los CdU con actores humanos.
end note
note bottom of UC07
  Subflujo de calculo de saturacion,
  necesario para layout y registro.
end note
@enduml"""


# ---------------------------------------------------------------------------
# Glosario completo en orden alfabetico
# ---------------------------------------------------------------------------

GLOSARIO = [
    ("Actor", "Entidad externa al sistema (persona o sistema informático) que interactúa con él. En el WMS los actores son: Operario de Pista, Administrador, Motor Rollship y MS Access."),
    ("Administrador", "Rol con privilegios extendidos en el WMS. Puede rectificar registros, gestionar incidencias, consultar estadísticas y lanzar la migración de datos (ETL)."),
    ("Almacén", "Recinto logístico en el Polígono Industrial Norte de Santander gestionado por Intermodal Sea Solutions para James Hardie, con 38 sectores y ~68.000 palés/año."),
    ("Caso de uso", "Secuencia de acciones del sistema que produce un resultado de valor para un actor. En el WMS se han identificado doce casos de uso (UC-01 a UC-12)."),
    ("Ciclo de vida del palé", "Conjunto de estados por los que transita un palé: Recepcionado → Emplazado → En preparación → Expedido (o Incidencia / Cancelado). Formalizado en el Diagrama de Estados (Figura 3)."),
    ("Clase conceptual", "Abstracción del dominio del negocio sin dependencia tecnológica. Las clases conceptuales del WMS son: Almacen, Sector, Pale, Movimiento, Operario y Cliente."),
    ("Disciplina de requisitos", "Flujo de trabajo RUP cuyo objetivo es alcanzar el acuerdo entre cliente, usuarios y desarrolladores sobre qué debe hacer el sistema. Comprende: encontrar actores y CdU, priorizar, detallar, prototipar y estructurar el modelo de CdU."),
    ("Flujo alternativo", "Secuencia de pasos que se ejecuta cuando se produce una condición excepcional en un caso de uso (p. ej., sector lleno al registrar una entrada en UC-01)."),
    ("Flujo principal", "Secuencia de pasos estándar de un caso de uso que conduce al resultado deseado sin errores ni excepciones (escenario de éxito)."),
    ("Incidencia", "Estado de un palé que indica la presencia de una anomalía (daño físico, discrepancia de código o contenido) que impide el flujo operativo normal. Gestionada por el Administrador (UC-08)."),
    ("Inventario", "Conjunto de palés registrados en el sistema que se encuentran físicamente en el almacén en un momento dado (estados Emplazado, Reemplazado o En preparación)."),
    ("James Hardie", "James Hardie Iberia S.L. Empresa fabricante de materiales de construcción cuya mercancía gestiona Intermodal Sea Solutions en el almacén de Santander. Propietaria del sistema Rollship."),
    ("Layout virtual", "Representación visual del estado de ocupación de los 38 sectores del almacén en tiempo real. Pantalla principal del módulo web, con semáforo cromático de saturación por sector."),
    ("Modelo del dominio", "Representación conceptual del negocio mediante diagramas UML (clases, objetos, estados) y glosario. No incluye restricciones tecnológicas ni métodos de implementación."),
    ("Motor Rollship", "Sistema corporativo externo de James Hardie que consulta el inventario del almacén mediante la API REST del WMS y recibe la respuesta en formato JSON."),
    ("Movimiento", "Registro transaccional de cualquier operación sobre un palé (ENTRADA, SALIDA, REUBICACION). Incluye sello temporal, sectores de origen/destino y operario responsable."),
    ("MS Access", "Sistema legado de gestión de inventario que el WMS sustituye. Sus limitaciones (acceso monolítico, sin interfaz web ni móvil) justifican el desarrollo del nuevo sistema."),
    ("Operario de Pista", "Actor humano principal del WMS. Registra en tiempo real las operaciones físicas de entrada, salida y reubicación de palés desde un dispositivo móvil."),
    ("Palé", "Unidad mínima de gestión del inventario. Cada palé tiene un código de referencia único (p. ej., JH-8819-A), tipo de material, masa y estado en su ciclo de vida."),
    ("PMV / MVP", "Producto Mínimo Viable. Primera iteración del WMS que incluye: UC-01 (Registrar entrada), UC-02 (Registrar salida), UC-03 (Consultar layout), UC-07 (Calcular saturación) y UC-09 (Autenticar usuario)."),
    ("Precondición / Postcondición", "Condiciones que deben cumplirse antes (precondición) y que quedan garantizadas tras (postcondición) la ejecución correcta de un caso de uso."),
    ("RUP", "Rational Unified Process. Marco de desarrollo iterativo e incremental organizado en fases (Inicio, Elaboración, Construcción, Transición) y disciplinas. Metodología base de este TFG."),
    ("Saturación", "Porcentaje de ocupación de un sector: (palésActuales / capacidadMax) × 100. Determina el color del semáforo del layout: verde (0–60 %), ámbar (61–85 %), rojo (86–100 %)."),
    ("Sector", "Cada una de las 38 subdivisiones físicas del almacén, identificadas por código alfanumérico (p. ej., B4). Unidad mínima de gestión espacial del WMS."),
    ("Semáforo de saturación", "Codificación cromática del layout que indica el nivel de ocupación de cada sector: verde (disponible), ámbar (casi lleno), rojo (lleno o crítico)."),
    ("Trazabilidad", "Capacidad de relacionar cada requisito del sistema con los artefactos que lo satisfacen. La matriz de trazabilidad (Sección 4) garantiza la cobertura completa de las necesidades del negocio."),
    ("UML", "Unified Modeling Language. Lenguaje estándar de modelado visual para especificar artefactos software. En el WMS se usan diagramas de clases, objetos, estados, casos de uso, actividad y contexto."),
    ("WMS", "Warehouse Management System. Sistema de gestión de almacén desarrollado en este TFG para Intermodal Sea Solutions, orientado a la gestión de palés de James Hardie en Santander."),
]


# ---------------------------------------------------------------------------
# Construccion del documento
# ---------------------------------------------------------------------------

def build_document():
    doc = Document()
    set_page_margins(doc)

    # ---------------------------------------------------------------- portada
    p = doc.add_heading('Capitulo 2: Disciplina de Requisitos', 0)
    for run in p.runs:
        run.font.name = 'Times New Roman'
        run.font.size = Pt(16)
        run.font.color.rgb = RGBColor(0, 0, 0)
    p.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.CENTER
    doc.add_paragraph()

    # ================================================================ 1. INTRO
    add_heading(doc, '1. Introduccion', 1)
    add_body(doc,
        "El presente capitulo da respuesta al Objetivo Especifico I del Trabajo de Fin de Grado: "
        "ejecutar la disciplina de requisitos que conduzca al diseno y desarrollo del sistema WMS "
        "para el almacen de Santander de Intermodal Sea Solutions, gestionado para la cuenta de "
        "James Hardie Iberia S.L.",
        indent=True)
    add_body(doc,
        "Su proposito es dirigir el desarrollo hacia el sistema correcto, describiendo los requisitos "
        "del sistema de tal forma que se alcance el acuerdo entre el cliente, los usuarios y el equipo "
        "de ingenieria sobre que debe hacer el sistema (Larman, 2004). La informacion aqui formalizada "
        "procede de las sesiones de elicitacion realizadas con el supervisor del almacen, la direccion "
        "de Intermodal Sea Solutions y la observacion directa del trabajo diario de los operarios.",
        indent=True)
    add_body(doc,
        "El capitulo se estructura en dos bloques metodologicos complementarios, siguiendo la secuencia "
        "de la disciplina de requisitos del proceso RUP: (1) Modelo del Dominio, que establece el "
        "vocabulario comun y formaliza la realidad del negocio en diagramas UML conceptuales; "
        "(2) Disciplina de Requisitos, que identifica, diagrama, prioriza, detalla y prototipos "
        "los casos de uso del sistema.",
        indent=True)
    add_separator(doc)

    # ========================================================= 2. MODELO DOM.
    add_heading(doc, '2. Modelo del Dominio', 1)
    add_body(doc,
        "Con el objetivo de comprender la estructura y la dinamica del negocio logistico sin incurrir "
        "en restricciones tecnologicas, se elabora un Modelo del Dominio que abstrae e identifica los "
        "elementos conceptuales del ecosistema y sus vinculos. El modelado sigue las convenciones de "
        "Larman (2004) y Pressman y Maxim (2020), diferenciando las clases conceptuales de las clases "
        "de implementacion.",
        indent=True)

    # ----------------------------------------- 2.1 GLOSARIO
    add_heading(doc, '2.1 Glosario de Terminos', 2)
    add_body(doc,
        "El siguiente glosario establece el vocabulario acordado con el cliente durante las sesiones "
        "de elicitacion. Su objetivo es crear un lenguaje comun entre el equipo de desarrollo y las "
        "partes interesadas del negocio, eliminando ambiguedades que podrian llevar a requisitos "
        "incorrectos o a malentendidos durante el desarrollo (Larman, 2004; Sommerville, 2015). "
        "Los terminos se presentan en orden alfabetico.")

    for termino, definicion in GLOSARIO:
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(4)
        p.paragraph_format.space_after  = Pt(2)
        p.paragraph_format.left_indent  = Cm(0)
        r_term = p.add_run(termino + '. ')
        r_term.font.name = 'Times New Roman'
        r_term.font.size = Pt(11)
        r_term.bold = True
        r_def = p.add_run(definicion)
        r_def.font.name = 'Times New Roman'
        r_def.font.size = Pt(11)

    add_separator(doc)

    # ----------------------------------------- 2.2 CLASES
    add_heading(doc, '2.2 Diagrama de Clases Conceptuales', 2)
    add_body(doc,
        "El diagrama de clases del dominio representa las entidades conceptuales mas importantes del "
        "negocio logistico y sus relaciones. Es una abstraccion de la realidad, expresada en el "
        "lenguaje del cliente, sin dependencias tecnologicas ni metodos de implementacion (Larman, 2004). "
        "Los diagramas se expresan en UML, estandar de modelado visual definido por el Object Management "
        "Group (OMG, 2017).")
    add_plantuml_block(doc, DIAG_CLASES, "Figura 1. Diagrama de Clases Conceptuales — WMS Almacen Santander.")
    add_table(doc,
        headers=['Relacion', 'Tipo', 'Cardinalidad', 'Significado'],
        rows=[
            ['Almacen -> Sector', 'Composicion', '1 a 1..*', 'Un almacen se compone de sectores. Sin almacen no hay sectores.'],
            ['Sector -> Pale', 'Agregacion', '1 a 0..*', 'Un sector aloja cero o mas pales. Los pales existen independientemente.'],
            ['Pale -> Movimiento', 'Asociacion', '1 a 1..*', 'Cada pale origina al menos un movimiento (la entrada).'],
            ['Operario -> Movimiento', 'Asociacion', '1 a 0..*', 'Un operario registra cero o muchos movimientos.'],
            ['Almacen -> Cliente', 'Asociacion', '1 a 1', 'El almacen gestiona el inventario de un unico cliente corporativo.'],
        ],
        col_widths=[4.0, 3.0, 3.0, 8.5])

    # ----------------------------------------- 2.3 OBJETOS
    doc.add_page_break()
    add_heading(doc, '2.3 Diagrama de Objetos', 2)
    add_body(doc,
        "El diagrama de objetos proyecta una instantanea del recinto logistico en un instante concreto, "
        "instanciando el modelo de clases con datos reales del negocio. Sirve para verificar la "
        "correccion del modelo conceptual (Larman, 2004). El instante modelado corresponde a una "
        "operacion de descarga registrada el 12 de mayo de 2026 en turno de tarde.")
    add_plantuml_block(doc, DIAG_OBJETOS, "Figura 2. Diagrama de Objetos — Turno tarde, 12/05/2026, 16:45.")
    add_body(doc,
        "El diagrama confirma que el modelo conceptual captura correctamente la operativa real: "
        "el operario Diego Martinez registra la entrada del pale JH-8819-A (840 kg de Pizarras "
        "Ensacadas) en el sector B4, generando el movimiento MOV-10234 que queda vinculado al "
        "pale, al sector y al operario.",
        indent=True)

    # ----------------------------------------- 2.4 ESTADOS
    add_heading(doc, '2.4 Diagrama de Estados del Pale', 2)
    add_body(doc,
        "El diagrama de estados refleja el ciclo de vida completo de un pale desde su llegada al "
        "muelle de descarga hasta que abandona las instalaciones. Se incluyen estados de excepcion "
        "(Incidencia y Cancelado) que representan situaciones reales de la operativa del almacen.")
    add_plantuml_block(doc, DIAG_ESTADOS, "Figura 3. Diagrama de Estados — Ciclo de vida del Pale.")
    add_table(doc,
        headers=['Estado', 'Descripcion'],
        rows=[
            ['Recepcionado', 'Pale presente en el muelle. Sin sector asignado.'],
            ['Emplazado', 'Pale con sector asignado y fisicamente ubicado. Estado de reposo normal.'],
            ['Reemplazado', 'Pale en transito entre dos sectores. Estado transitorio.'],
            ['En preparacion', 'Pale incluido en orden de expedicion, pendiente de aprobacion.'],
            ['Expedido', 'Pale fuera del almacen. Estado terminal normal.'],
            ['Incidencia', 'Anomalia detectada. Flujo normal bloqueado. Supervisor notificado.'],
            ['Cancelado', 'Expedicion rechazada o cancelada. Sector liberado.'],
        ],
        col_widths=[4.5, 14.0])

    # ----------------------------------------- 2.5 REQ. SUPLE
    add_heading(doc, '2.5 Requisitos Suplementarios (No Funcionales)', 2)
    add_body(doc,
        "Los requisitos suplementarios especifican las propiedades de calidad del sistema: velocidad, "
        "seguridad, fiabilidad, usabilidad y mantenibilidad (Sommerville, 2015). Condicionaran "
        "las decisiones de arquitectura del Capitulo 3.")
    add_table(doc,
        headers=['ID', 'Categoria', 'Descripcion', 'Metrica de verificacion'],
        rows=[
            ['RS-01', 'Rendimiento', 'El layout se carga en <1,5 s. Las escrituras se confirman en <2 s.', 'Prueba de carga con 5 operarios concurrentes.'],
            ['RS-02', 'Disponibilidad', 'Disponibilidad del 99,5 % en horario operativo (06:00-22:00, L-S).', 'Monitorizacion de uptime.'],
            ['RS-03', 'Seguridad', 'Credenciales unicas por usuario. Sesion expira a los 30 min. El rol OPERARIO no modifica registros confirmados.', 'Revision de codigo y pruebas OWASP Top 10.'],
            ['RS-04', 'Usabilidad', 'Operable con guantes. Elementos tactiles >=60x60 px. Dominio basico en <15 min de entrenamiento. Cumplimiento WCAG 2.1 nivel AA (W3C, 2018).', 'Test de usabilidad think-aloud con 3 operarios.'],
            ['RS-05', 'Portabilidad', 'Compatible con Chrome 110+, Firefox 110+, Safari 16+. Sin instalacion en dispositivos de los operarios.', 'Pruebas manuales en los navegadores indicados.'],
            ['RS-06', 'Mantenibilidad', 'Separacion estricta de capas (MVC). Cobertura de pruebas unitarias sobre logica de negocio >=70 %.', 'Informe de cobertura de pruebas.'],
            ['RS-07', 'Integridad', 'Todas las escrituras son atomicas. Sin registros parciales ante cualquier fallo del sistema.', 'Pruebas de integracion con simulacion de fallos.'],
        ],
        col_widths=[1.5, 3.0, 8.5, 5.5])
    add_separator(doc)

    # ======================================================= 3. DISC. REQUIS.
    doc.add_page_break()
    add_heading(doc, '3. Disciplina de Requisitos', 1)

    # ----------------------------------------- 3.1 ACTORES Y CdU
    add_heading(doc, '3.1 Identificacion de Actores y Casos de Uso', 2)
    add_body(doc,
        "Un actor, en el sentido UML, es cualquier entidad externa al sistema que interactua con el, "
        "ya sea una persona, un rol organizativo o un sistema informatico externo (Larman, 2004). "
        "La identificacion de actores delimita la frontera del sistema y es el punto de partida para "
        "la construccion de los casos de uso (Wiegers y Beatty, 2013).")

    add_heading(doc, 'Actores identificados', 3)
    add_table(doc,
        headers=['Actor', 'Tipo', 'Descripcion', 'CdU accesibles'],
        rows=[
            ['Operario de Pista', 'Humano principal', 'Registra las operaciones fisicas de entrada, salida y reubicacion de pales desde un dispositivo movil.', 'UC-01, 02, 03, 04, 10, 12'],
            ['Administrador', 'Humano privilegiado', 'Supervisa la ocupacion, gestiona incidencias, extrae informes, rectifica registros y administra usuarios.', 'UC-01 a UC-12'],
            ['Motor Rollship', 'Sistema externo receptor', 'Consulta el estado del inventario mediante API REST. No inicia operaciones.', 'UC-03'],
            ['MS Access (legado)', 'Sistema externo transitorio', 'Fuente de datos historicos durante la migracion ETL. Solo relevante en esa fase.', 'UC-06'],
        ],
        col_widths=[3.5, 3.5, 8.0, 3.5])

    add_heading(doc, 'Casos de uso identificados', 3)
    add_table(doc,
        headers=['ID', 'Nombre', 'Breve descripcion'],
        rows=[
            ['UC-01', 'Registrar entrada de pale', 'El operario registra la llegada de un pale y le asigna un sector.'],
            ['UC-02', 'Registrar salida de pale', 'El operario registra la salida autorizada de un pale del almacen.'],
            ['UC-03', 'Consultar layout interactivo', 'El usuario consulta el mapa de ocupacion en tiempo real de los 38 sectores.'],
            ['UC-04', 'Reubicar pale entre sectores', 'El operario traslada un pale de un sector a otro.'],
            ['UC-05', 'Consultar estadisticas de flujo', 'El administrador obtiene informes de movimientos historicos.'],
            ['UC-06', 'Migrar datos legado (ETL)', 'El administrador lanza la importacion de datos desde MS Access.'],
            ['UC-07', 'Calcular saturacion de sector', 'El sistema calcula el porcentaje de ocupacion de un sector. (Subflujo incluido.)'],
            ['UC-08', 'Registrar incidencia operativa', 'El operario notifica una anomalia en un pale. (Flujo extendido desde UC-01.)'],
            ['UC-09', 'Autenticar usuario', 'El sistema verifica las credenciales antes de conceder acceso. (Subflujo incluido.)'],
            ['UC-10', 'Buscar pale por referencia', 'El usuario localiza un pale concreto introduciendo su codigo de referencia.'],
            ['UC-11', 'Gestionar usuarios del sistema', 'El administrador crea, modifica y desactiva cuentas de operario.'],
            ['UC-12', 'Consultar historial de pale', 'El usuario consulta la traza completa de movimientos de un pale concreto.'],
        ],
        col_widths=[1.5, 5.5, 11.5])

    add_heading(doc, 'Diagramas de Casos de Uso', 3)
    add_plantuml_block(doc, DIAG_CDU_GENERAL,  "Figura 4. Diagrama de Casos de Uso — Vision General del sistema.")
    doc.add_page_break()
    add_plantuml_block(doc, DIAG_CDU_OPERARIO, "Figura 5. Diagrama de CdU — Actor: Operario de Pista.")
    add_plantuml_block(doc, DIAG_CDU_ADMIN,    "Figura 6. Diagrama de CdU — Actor: Administrador.")
    add_plantuml_block(doc, DIAG_CDU_ROLLSHIP, "Figura 7. Diagrama de CdU — Actor: Motor Rollship.")
    add_plantuml_block(doc, DIAG_CONTEXTO,     "Figura 8. Diagrama de Contexto — Flujos de informacion entre el sistema y los actores.")

    # ----------------------------------------- 3.2 PRIORIZACIÓN
    doc.add_page_break()
    add_heading(doc, '3.2 Priorizacion de Casos de Uso', 2)
    add_body(doc,
        "Los casos de uso se priorizan aplicando los criterios establecidos en RUP: riesgo tecnico, "
        "contribucion a la arquitectura del sistema, valor para el negocio y dependencias entre casos "
        "de uso (Larman, 2004; Kruchten, 2004). El objetivo es ordenar la implementacion de forma que "
        "las funcionalidades mas criticas se aborden en las primeras iteraciones.")
    add_table(doc,
        headers=['ID', 'Nombre', 'Valor negocio', 'Riesgo tecnico', 'Contrib. arq.', 'Iteracion'],
        rows=[
            ['UC-09', 'Autenticar usuario',           'Alto',     'Bajo',  'Alta',  '1a'],
            ['UC-01', 'Registrar entrada de pale',     'Muy alto', 'Medio', 'Alta',  '1a'],
            ['UC-02', 'Registrar salida de pale',      'Muy alto', 'Medio', 'Alta',  '1a'],
            ['UC-03', 'Consultar layout interactivo',  'Alto',     'Medio', 'Alta',  '1a'],
            ['UC-07', 'Calcular saturacion de sector', 'Alto',     'Bajo',  'Alta',  '1a'],
            ['UC-04', 'Reubicar pale entre sectores',  'Medio',    'Bajo',  'Media', '2a'],
            ['UC-08', 'Registrar incidencia',          'Medio',    'Bajo',  'Baja',  '2a'],
            ['UC-06', 'Migrar datos legado (ETL)',      'Alto',     'Alto',  'Baja',  '2a'],
            ['UC-10', 'Buscar pale por referencia',    'Alto',     'Bajo',  'Media', '2a'],
            ['UC-11', 'Gestionar usuarios',             'Medio',    'Bajo',  'Media', '2a'],
            ['UC-05', 'Consultar estadisticas',         'Bajo',     'Bajo',  'Baja',  '3a'],
            ['UC-12', 'Consultar historial de pale',   'Medio',    'Bajo',  'Baja',  '3a'],
        ],
        col_widths=[1.5, 5.5, 2.5, 2.5, 2.5, 2.0])
    add_body(doc,
        "Producto Minimo Viable (PMV): los casos de uso de la primera iteracion (UC-01, UC-02, UC-03, "
        "UC-07 y UC-09) constituyen el sistema operativamente funcional para la actividad diaria del almacen.",
        bold_parts=["Producto Minimo Viable (PMV):"])

    # ----------------------------------------- 3.3 DETALLE CdU
    doc.add_page_break()
    add_heading(doc, '3.3 Detalle de Casos de Uso', 2)

    # UC-01
    add_heading(doc, 'UC-01 — Registrar Entrada de Pale', 3)
    add_table(doc, headers=['Campo', 'Valor'], rows=[
        ['Denominacion', 'UC-01 — Registrar entrada de pale'],
        ['Actor principal', 'Operario de Pista'],
        ['Incluye', 'UC-09 (Autenticar usuario), UC-07 (Calcular saturacion)'],
        ['Extiende', 'UC-08 (Registrar incidencia) — condicion: error detectado en recepcion'],
        ['Iteracion', '1a — prioridad alta'],
    ], col_widths=[4.0, 14.5])
    add_body(doc, "Precondiciones:", bold_parts=["Precondiciones:"])
    add_bullet(doc, "El operario tiene sesion iniciada en la aplicacion.")
    add_bullet(doc, "El pale fisico esta presente en el muelle de descarga.")
    add_body(doc, "Flujo principal (escenario de exito):", bold_parts=["Flujo principal (escenario de exito):"])
    add_table(doc, headers=['Paso', 'Actor', 'Accion'], rows=[
        ['1', 'Operario', 'Solicita registrar una nueva entrada de pale.'],
        ['2', 'Sistema', 'Presenta el formulario de entrada y el mapa de sectores con el estado de ocupacion actualizado.'],
        ['3', 'Operario', 'Introduce el codigo de referencia del pale, el tipo de material y la masa.'],
        ['4', 'Operario', 'Selecciona el sector destino en el mapa.'],
        ['5', 'Sistema', 'Verifica que el sector seleccionado tiene capacidad disponible.'],
        ['6', 'Sistema', 'Registra la operacion: crea el pale con estado Emplazado y genera el movimiento de tipo ENTRADA.'],
        ['7', 'Sistema', 'Confirma la operacion al operario y actualiza el mapa en pantalla.'],
    ], col_widths=[1.0, 3.0, 14.5])
    add_body(doc, "Postcondiciones:", bold_parts=["Postcondiciones:"])
    add_bullet(doc, "El pale queda registrado con estado Emplazado en el sector seleccionado.")
    add_bullet(doc, "El sistema ha generado un movimiento de tipo ENTRADA con sello temporal, sector destino y operario.")
    add_bullet(doc, "La ocupacion del sector destino se ha actualizado.")
    add_body(doc, "Flujos alternativos:", bold_parts=["Flujos alternativos:"])
    add_bullet(doc, "A1 — Sector lleno: el sistema informa al operario e invita a seleccionar un sector alternativo.")
    add_bullet(doc, "A2 — Codigo duplicado: el sistema advierte al operario y solicita confirmacion.")
    add_bullet(doc, "A3 — Error detectado: el operario puede extender el flujo hacia UC-08 (Registrar incidencia).")
    add_plantuml_block(doc, DIAG_ACT_UC01, "Figura 9. Diagrama de Actividad — UC-01: Registrar entrada de pale.")

    # UC-02
    doc.add_page_break()
    add_heading(doc, 'UC-02 — Registrar Salida de Pale', 3)
    add_table(doc, headers=['Campo', 'Valor'], rows=[
        ['Denominacion', 'UC-02 — Registrar salida de pale'],
        ['Actor principal', 'Operario de Pista'],
        ['Actores secundarios', 'Administrador (aprobacion de la orden de expedicion)'],
        ['Incluye', 'UC-09 (Autenticar usuario), UC-07 (Calcular saturacion)'],
        ['Iteracion', '1a — prioridad alta'],
    ], col_widths=[4.0, 14.5])
    add_table(doc, headers=['Paso', 'Actor', 'Accion'], rows=[
        ['1', 'Operario', 'Solicita registrar la salida de un pale por codigo o en el layout.'],
        ['2', 'Sistema', 'Presenta el detalle del pale y la orden de expedicion asociada.'],
        ['3', 'Operario', 'Confirma que el pale esta en el area de carga y solicita registrar la salida.'],
        ['4', 'Sistema', 'Solicita confirmacion explicita al operario antes de proceder.'],
        ['5', 'Operario', 'Confirma la operacion.'],
        ['6', 'Sistema', 'Verifica que el estado del pale permite la expedicion.'],
        ['7', 'Sistema', 'Registra la salida: actualiza el estado a Expedido, genera el movimiento SALIDA y libera la plaza del sector.'],
        ['8', 'Sistema', 'Notifica al administrador la expedicion y confirma al operario.'],
    ], col_widths=[1.0, 3.0, 14.5])
    add_plantuml_block(doc, DIAG_ACT_UC02, "Figura 10. Diagrama de Actividad — UC-02: Registrar salida de pale.")

    # UC-03
    add_heading(doc, 'UC-03 — Consultar Layout Interactivo', 3)
    add_table(doc, headers=['Campo', 'Valor'], rows=[
        ['Denominacion', 'UC-03 — Consultar layout interactivo'],
        ['Actores', 'Operario de Pista, Administrador, Motor Rollship (via API)'],
        ['Incluye', 'UC-09 (para actores humanos), UC-07 (Calcular saturacion)'],
        ['Iteracion', '1a — prioridad alta'],
    ], col_widths=[4.0, 14.5])
    add_table(doc, headers=['Paso', 'Actor', 'Accion'], rows=[
        ['1', 'Usuario', 'Accede a la pantalla principal del modulo.'],
        ['2', 'Sistema', 'Consulta el estado de ocupacion actual de los 38 sectores.'],
        ['3', 'Sistema', 'Presenta la cuadricula con codificacion cromatica: verde (0-60%), ambar (61-85%), rojo (86-100%).'],
        ['4', 'Usuario', 'Pulsa sobre un sector.'],
        ['5', 'Sistema', 'Presenta el detalle del sector: lista de pales con referencia, tipo de material y fecha de entrada.'],
        ['6', 'Sistema', 'Refresca el mapa periodicamente para mantener la informacion actualizada.'],
    ], col_widths=[1.0, 3.0, 14.5])
    add_body(doc,
        "Flujo alternativo A1 — Motor Rollship: si el actor es el sistema Rollship, la respuesta "
        "es un objeto JSON con el estado de cada sector (identificador, pales actuales, capacidad "
        "maxima, porcentaje de saturacion y listado de pales).",
        bold_parts=["Flujo alternativo A1 — Motor Rollship:"])

    # UC-04
    add_heading(doc, 'UC-04 — Reubicar Pale entre Sectores', 3)
    add_table(doc, headers=['Campo', 'Valor'], rows=[
        ['Denominacion', 'UC-04 — Reubicar pale entre sectores'],
        ['Actor principal', 'Operario de Pista'],
        ['Incluye', 'UC-09 (Autenticar usuario), UC-07 (Calcular saturacion)'],
        ['Iteracion', '2a — prioridad media'],
    ], col_widths=[4.0, 14.5])
    add_body(doc, "Precondiciones:", bold_parts=["Precondiciones:"])
    add_bullet(doc, "El operario tiene sesion iniciada.")
    add_bullet(doc, "El pale a reubicar tiene estado Emplazado.")
    add_bullet(doc, "El sector destino tiene capacidad disponible.")
    add_table(doc, headers=['Paso', 'Actor', 'Accion'], rows=[
        ['1', 'Operario', 'Localiza el pale (por codigo o en el mapa) y solicita reubicarlo.'],
        ['2', 'Sistema', 'Presenta el detalle del pale y su sector actual.'],
        ['3', 'Operario', 'Selecciona el sector destino en el mapa.'],
        ['4', 'Sistema', 'Verifica: (a) sector destino con capacidad; (b) sector distinto del actual; (c) estado del pale compatible.'],
        ['5', 'Sistema', 'Registra la reubicacion: actualiza la ubicacion del pale, genera movimiento REUBICACION y actualiza contadores de ambos sectores.'],
        ['6', 'Sistema', 'Confirma la operacion y actualiza el mapa.'],
    ], col_widths=[1.0, 3.0, 14.5])
    add_body(doc, "Postcondiciones:", bold_parts=["Postcondiciones:"])
    add_bullet(doc, "El pale tiene estado Emplazado en el nuevo sector.")
    add_bullet(doc, "El sistema ha generado un movimiento de tipo REUBICACION con sector origen, sector destino, sello temporal y operario.")
    add_plantuml_block(doc, DIAG_ACT_UC04, "Figura 11. Diagrama de Actividad — UC-04: Reubicar pale entre sectores.")

    # UC-05
    add_heading(doc, 'UC-05 — Consultar Estadisticas de Flujo', 3)
    add_table(doc, headers=['Campo', 'Valor'], rows=[
        ['Denominacion', 'UC-05 — Consultar estadisticas de flujo'],
        ['Actor principal', 'Administrador'],
        ['Incluye', 'UC-09 (Autenticar usuario)'],
        ['Iteracion', '3a — prioridad baja'],
    ], col_widths=[4.0, 14.5])
    add_body(doc, "Precondiciones:", bold_parts=["Precondiciones:"])
    add_bullet(doc, "El administrador tiene sesion iniciada con rol ADMINISTRADOR.")
    add_bullet(doc, "Existe al menos un movimiento registrado en el sistema.")
    add_body(doc, "Flujo principal (escenario de exito):", bold_parts=["Flujo principal (escenario de exito):"])
    add_table(doc, headers=['Paso', 'Actor', 'Accion'], rows=[
        ['1', 'Administrador', 'Accede al panel de estadisticas desde el menu principal.'],
        ['2', 'Sistema', 'Presenta un resumen de actividad del periodo actual: entradas, salidas y reubicaciones del dia.'],
        ['3', 'Administrador', 'Configura los filtros: rango de fechas, sector o tipo de operacion.'],
        ['4', 'Sistema', 'Consulta los movimientos y calcula indicadores: operaciones por tipo, evolucion de la ocupacion por sector, operarios mas activos y horas pico.'],
        ['5', 'Sistema', 'Presenta los resultados en forma de tabla y grafico de barras.'],
        ['6', 'Administrador', 'Opcionalmente exporta el informe en formato CSV o PDF.'],
    ], col_widths=[1.0, 3.0, 14.5])
    add_body(doc, "Postcondiciones:", bold_parts=["Postcondiciones:"])
    add_bullet(doc, "El administrador dispone de un informe de actividad del periodo seleccionado.")
    add_body(doc, "Flujos alternativos:", bold_parts=["Flujos alternativos:"])
    add_bullet(doc, "A1 — Sin datos en el periodo: el sistema informa que no hay movimientos y sugiere ampliar el rango de fechas.")
    add_bullet(doc, "A2 — Exportacion: el sistema genera el archivo y lo pone a disposicion del administrador para su descarga.")
    add_plantuml_block(doc, DIAG_ACT_UC05, "Figura 12. Diagrama de Actividad — UC-05: Consultar estadisticas de flujo.")

    # UC-06
    add_heading(doc, 'UC-06 — Migrar Datos Legado (ETL)', 3)
    add_table(doc, headers=['Campo', 'Valor'], rows=[
        ['Denominacion', 'UC-06 — Migrar datos legado (ETL)'],
        ['Actor principal', 'Administrador'],
        ['Actores secundarios', 'MS Access (legado) — fuente de datos historicos'],
        ['Iteracion', '2a — alto riesgo tecnico'],
    ], col_widths=[4.0, 14.5])
    add_body(doc, "Precondiciones:", bold_parts=["Precondiciones:"])
    add_bullet(doc, "El administrador tiene sesion iniciada con rol ADMINISTRADOR.")
    add_bullet(doc, "Existe el archivo exportado del sistema MS Access con el inventario historico.")
    add_bullet(doc, "La migracion no ha sido ejecutada previamente (proceso irrepetible sin reset manual).")
    add_body(doc, "Flujo principal (escenario de exito):", bold_parts=["Flujo principal (escenario de exito):"])
    add_table(doc, headers=['Paso', 'Actor', 'Accion'], rows=[
        ['1', 'Administrador', 'Accede al modulo ETL desde el panel de administracion.'],
        ['2', 'Sistema', 'Presenta el formulario de carga y las instrucciones de formato esperado.'],
        ['3', 'Administrador', 'Sube el archivo exportado desde MS Access (CSV o MDB convertido).'],
        ['4', 'Sistema', 'Valida el formato y la estructura del archivo: columnas requeridas y tipos de datos.'],
        ['5', 'Sistema', 'Ejecuta simulacion (dry run) e informa del numero de registros a importar y conflictos detectados.'],
        ['6', 'Administrador', 'Revisa el informe de simulacion y confirma la migracion.'],
        ['7', 'Sistema', 'Ejecuta el proceso ETL: importa pales historicos y genera movimientos de tipo ENTRADA para cada registro.'],
        ['8', 'Sistema', 'Presenta el resumen final: registros importados, omitidos y errores.'],
    ], col_widths=[1.0, 3.0, 14.5])
    add_body(doc, "Postcondiciones:", bold_parts=["Postcondiciones:"])
    add_bullet(doc, "Los datos historicos del sistema MS Access estan disponibles en la nueva base de datos.")
    add_bullet(doc, "Cada pale importado tiene al menos un movimiento de tipo ENTRADA con la fecha original.")
    add_bullet(doc, "El log de migracion queda registrado para auditoria.")
    add_body(doc, "Flujos alternativos:", bold_parts=["Flujos alternativos:"])
    add_bullet(doc, "A1 — Formato no valido: el sistema describe los errores de formato e impide continuar.")
    add_bullet(doc, "A2 — Conflicto de duplicados: el sistema identifica los registros duplicados y permite al administrador decidir si omitirlos o sobrescribirlos.")
    add_bullet(doc, "A3 — Error durante la migracion: el sistema ejecuta un rollback completo (RS-07), garantizando que no quedan registros parciales.")
    add_plantuml_block(doc, DIAG_ACT_UC06, "Figura 13. Diagrama de Actividad — UC-06: Migrar datos legado (ETL).")

    # UC-07
    add_heading(doc, 'UC-07 — Calcular Saturacion de Sector (subflujo incluido)', 3)
    add_table(doc, headers=['Campo', 'Valor'], rows=[
        ['Denominacion', 'UC-07 — Calcular saturacion de sector'],
        ['Tipo', 'Subflujo — incluido por UC-01 y UC-03'],
        ['Actor', 'Sistema (interno, no iniciado directamente por actores humanos)'],
        ['Iteracion', '1a — base arquitectonica'],
    ], col_widths=[4.0, 14.5])
    add_body(doc,
        "Este caso de uso no es iniciado directamente por ningun actor humano. Es un subflujo obligatorio "
        "activado por UC-01 (al registrar una entrada) y UC-03 (al renderizar el layout). El sistema "
        "calcula el porcentaje de ocupacion de cada sector mediante la formula: "
        "saturacion = (paleActuales / capacidadMax) x 100. El resultado determina el codigo cromatico del semaforo.")
    add_table(doc,
        headers=['Rango de saturacion', 'Codigo cromatico', 'Significado'],
        rows=[
            ['0 - 60 %', 'Verde', 'Sector disponible.'],
            ['61 - 85 %', 'Ambar', 'Sector con ocupacion elevada.'],
            ['86 - 100 %', 'Rojo', 'Sector proximo al limite o lleno.'],
        ],
        col_widths=[4.5, 4.5, 9.5])
    add_body(doc, "Precondicion:", bold_parts=["Precondicion:"])
    add_bullet(doc, "Los campos paleActuales y capacidadMax del sector son accesibles.")
    add_body(doc, "Postcondicion:", bold_parts=["Postcondicion:"])
    add_bullet(doc, "El porcentaje de saturacion y el codigo de color quedan calculados y disponibles para su presentacion en el layout.")

    # UC-08
    add_heading(doc, 'UC-08 — Registrar Incidencia Operativa', 3)
    add_table(doc, headers=['Campo', 'Valor'], rows=[
        ['Denominacion', 'UC-08 — Registrar incidencia operativa'],
        ['Actor principal', 'Operario de Pista'],
        ['Actores secundarios', 'Administrador (recibe notificacion)'],
        ['Extiende', 'UC-01 (Registrar entrada) — condicion: error detectado en recepcion'],
        ['Incluye', 'UC-09 (Autenticar usuario)'],
        ['Iteracion', '2a — prioridad media'],
    ], col_widths=[4.0, 14.5])
    add_body(doc, "Precondiciones:", bold_parts=["Precondiciones:"])
    add_bullet(doc, "El operario tiene sesion iniciada en la aplicacion.")
    add_bullet(doc, "El pale sobre el que se registra la incidencia existe en el sistema o se esta registrando en UC-01.")
    add_body(doc, "Flujo principal (escenario de exito):", bold_parts=["Flujo principal (escenario de exito):"])
    add_table(doc, headers=['Paso', 'Actor', 'Accion'], rows=[
        ['1', 'Operario', 'Detecta una anomalia en el pale y accede al formulario de incidencia.'],
        ['2', 'Sistema', 'Presenta el formulario con el codigo del pale ya vinculado y solicita el tipo de incidencia.'],
        ['3', 'Operario', 'Selecciona el tipo de incidencia: dano fisico, discrepancia de codigo o diferencia de contenido.'],
        ['4', 'Operario', 'Describe la anomalia con detalle y opcionalmente adjunta fotografia.'],
        ['5', 'Sistema', 'Registra la incidencia, cambia el estado del pale a Incidencia e impide operaciones sobre el hasta su resolucion.'],
        ['6', 'Sistema', 'Notifica al administrador la incidencia con el detalle completo.'],
        ['7', 'Sistema', 'Confirma al operario que la incidencia ha sido registrada.'],
    ], col_widths=[1.0, 3.0, 14.5])
    add_body(doc, "Postcondiciones:", bold_parts=["Postcondiciones:"])
    add_bullet(doc, "La incidencia queda registrada con sello temporal y operario responsable.")
    add_bullet(doc, "El pale tiene estado Incidencia y no puede ser expedido hasta que el administrador la resuelva.")
    add_bullet(doc, "El administrador ha recibido la notificacion.")
    add_body(doc, "Flujos alternativos:", bold_parts=["Flujos alternativos:"])
    add_bullet(doc, "A1 — Resolucion de incidencia: el administrador revisa, toma medidas correctoras y la marca como resuelta. El sistema devuelve el pale al estado Emplazado.")
    add_bullet(doc, "A2 — Cancelacion del pale: si la anomalia es irresoluble, el administrador cancela el pale desde el panel de incidencias.")
    add_plantuml_block(doc, DIAG_ACT_UC08, "Figura 14. Diagrama de Actividad — UC-08: Registrar incidencia operativa.")

    # UC-09
    add_heading(doc, 'UC-09 — Autenticar Usuario (subflujo incluido)', 3)
    add_table(doc, headers=['Campo', 'Valor'], rows=[
        ['Denominacion', 'UC-09 — Autenticar usuario'],
        ['Tipo', 'Subflujo — incluido por todos los CdU con actores humanos'],
        ['Actor', 'Sistema (interno, no iniciado directamente)'],
        ['Iteracion', '1a — base de toda interaccion'],
    ], col_widths=[4.0, 14.5])
    add_body(doc,
        "Este caso de uso es un subflujo de autenticacion que se activa cuando un actor humano accede "
        "al modulo sin sesion activa. No es invocado directamente por el usuario: el sistema lo ejecuta "
        "de forma transparente al inicio de cualquier interaccion protegida.")
    add_body(doc, "Precondicion:", bold_parts=["Precondicion:"])
    add_bullet(doc, "El usuario dispone de una credencial valida registrada en el sistema.")
    add_body(doc, "Flujo principal:", bold_parts=["Flujo principal:"])
    add_table(doc, headers=['Paso', 'Actor', 'Accion'], rows=[
        ['1', 'Sistema', 'Detecta el acceso sin sesion activa y presenta la pantalla de inicio de sesion.'],
        ['2', 'Usuario', 'Introduce su credencial (usuario y contrasena).'],
        ['3', 'Sistema', 'Valida las credenciales. Si son correctas, genera un token JWT con el rol del usuario y expiracion a los 30 min de inactividad (RS-03).'],
        ['4', 'Sistema', 'Redirige al usuario a la pantalla principal segun su rol: layout interactivo (Operario) o panel de administracion (Administrador).'],
    ], col_widths=[1.0, 3.0, 14.5])
    add_body(doc, "Postcondicion:", bold_parts=["Postcondicion:"])
    add_bullet(doc, "El usuario tiene una sesion activa con token JWT valido.")
    add_body(doc, "Flujo alternativo:", bold_parts=["Flujo alternativo:"])
    add_bullet(doc, "A1 — Credenciales incorrectas: el sistema informa del error sin especificar el campo incorrecto. Tras 3 intentos fallidos consecutivos, la cuenta queda bloqueada temporalmente 15 minutos.")

    # UC-10
    add_heading(doc, 'UC-10 — Buscar Pale por Referencia', 3)
    add_table(doc, headers=['Campo', 'Valor'], rows=[
        ['Denominacion', 'UC-10 — Buscar pale por referencia'],
        ['Actores', 'Operario de Pista, Administrador'],
        ['Incluye', 'UC-09 (Autenticar usuario)'],
        ['Iteracion', '2a — prioridad alta'],
    ], col_widths=[4.0, 14.5])
    add_body(doc, "Precondiciones:", bold_parts=["Precondiciones:"])
    add_bullet(doc, "El usuario tiene sesion iniciada en la aplicacion.")
    add_body(doc, "Flujo principal (escenario de exito):", bold_parts=["Flujo principal (escenario de exito):"])
    add_table(doc, headers=['Paso', 'Actor', 'Accion'], rows=[
        ['1', 'Usuario', 'Introduce el codigo de referencia del pale (completo o parcial) en el campo de busqueda.'],
        ['2', 'Sistema', 'Busca el pale en el inventario activo filtrando por el codigo introducido.'],
        ['3', 'Sistema', 'Presenta los resultados: codigo de referencia, tipo de material, sector actual, estado y fecha de entrada.'],
        ['4', 'Usuario', 'Selecciona el pale de la lista de resultados.'],
        ['5', 'Sistema', 'Muestra el detalle completo del pale y lo resalta en el layout virtual.'],
    ], col_widths=[1.0, 3.0, 14.5])
    add_body(doc, "Postcondiciones:", bold_parts=["Postcondiciones:"])
    add_bullet(doc, "El usuario conoce la ubicacion exacta del pale y su estado actual.")
    add_body(doc, "Flujos alternativos:", bold_parts=["Flujos alternativos:"])
    add_bullet(doc, "A1 — Sin resultados: si ningun pale coincide con la busqueda, el sistema lo indica y ofrece ampliar los criterios.")
    add_bullet(doc, "A2 — Pale expedido o cancelado: el sistema informa de que el pale ya no esta activo y muestra su ultimo estado registrado.")

    # UC-11
    add_heading(doc, 'UC-11 — Gestionar Usuarios del Sistema', 3)
    add_table(doc, headers=['Campo', 'Valor'], rows=[
        ['Denominacion', 'UC-11 — Gestionar usuarios del sistema'],
        ['Actor principal', 'Administrador'],
        ['Incluye', 'UC-09 (Autenticar usuario)'],
        ['Iteracion', '2a — prioridad media'],
    ], col_widths=[4.0, 14.5])
    add_body(doc, "Precondiciones:", bold_parts=["Precondiciones:"])
    add_bullet(doc, "El administrador tiene sesion iniciada con rol ADMINISTRADOR.")
    add_body(doc, "Flujo principal — Crear operario (escenario de exito):", bold_parts=["Flujo principal — Crear operario (escenario de exito):"])
    add_table(doc, headers=['Paso', 'Actor', 'Accion'], rows=[
        ['1', 'Administrador', 'Accede al panel de gestion de usuarios.'],
        ['2', 'Sistema', 'Presenta la lista de usuarios activos con su nombre, credencial, turno y rol.'],
        ['3', 'Administrador', 'Solicita crear un nuevo operario e introduce nombre completo, credencial, turno y rol (OPERARIO o ADMINISTRADOR).'],
        ['4', 'Sistema', 'Verifica que la credencial no existe en el sistema.'],
        ['5', 'Sistema', 'Crea la cuenta con la credencial proporcionada y la registra en el log de auditoria.'],
        ['6', 'Sistema', 'Confirma la creacion y muestra la cuenta en la lista actualizada.'],
    ], col_widths=[1.0, 3.0, 14.5])
    add_body(doc, "Postcondiciones:", bold_parts=["Postcondiciones:"])
    add_bullet(doc, "La cuenta del nuevo operario esta activa y puede autenticarse en el sistema.")
    add_body(doc, "Subflujos:", bold_parts=["Subflujos:"])
    add_bullet(doc, "SF-A Modificar operario: el administrador actualiza turno, rol o contrasena de un usuario existente.")
    add_bullet(doc, "SF-B Desactivar operario: el administrador desactiva la cuenta sin eliminarla (conservando el historial de movimientos).")
    add_body(doc, "Flujos alternativos:", bold_parts=["Flujos alternativos:"])
    add_bullet(doc, "A1 — Credencial duplicada: el sistema informa del conflicto y solicita una credencial distinta.")

    # UC-12
    add_heading(doc, 'UC-12 — Consultar Historial de Pale', 3)
    add_table(doc, headers=['Campo', 'Valor'], rows=[
        ['Denominacion', 'UC-12 — Consultar historial de pale'],
        ['Actores', 'Operario de Pista, Administrador'],
        ['Incluye', 'UC-09 (Autenticar usuario)'],
        ['Iteracion', '3a — prioridad media'],
    ], col_widths=[4.0, 14.5])
    add_body(doc, "Precondiciones:", bold_parts=["Precondiciones:"])
    add_bullet(doc, "El usuario tiene sesion iniciada.")
    add_bullet(doc, "El pale existe en el sistema (puede estar activo o expedido).")
    add_body(doc, "Flujo principal (escenario de exito):", bold_parts=["Flujo principal (escenario de exito):"])
    add_table(doc, headers=['Paso', 'Actor', 'Accion'], rows=[
        ['1', 'Usuario', 'Localiza el pale (directamente o via UC-10) y solicita ver su historial.'],
        ['2', 'Sistema', 'Recupera todos los movimientos asociados al pale, ordenados cronologicamente.'],
        ['3', 'Sistema', 'Presenta la linea de tiempo de movimientos: tipo de operacion, sector origen, sector destino, sello temporal y operario responsable.'],
        ['4', 'Usuario', 'Navega por el historial. Opcionalmente filtra por tipo de operacion o rango de fechas.'],
        ['5', 'Sistema', 'Actualiza la vista con los filtros aplicados.'],
    ], col_widths=[1.0, 3.0, 14.5])
    add_body(doc, "Postcondiciones:", bold_parts=["Postcondiciones:"])
    add_bullet(doc, "El usuario dispone de la traza completa de movimientos del pale, util para auditorias e incidencias.")
    add_body(doc, "Flujos alternativos:", bold_parts=["Flujos alternativos:"])
    add_bullet(doc, "A1 — Sin movimientos registrados: situacion imposible (todo pale tiene al menos un movimiento de ENTRADA), pero el sistema mostraria el mensaje correspondiente.")

    # ----------------------------------------- 3.4 PROTOTIPOS
    doc.add_page_break()
    add_heading(doc, '3.4 Prototipos de Casos de Uso', 2)
    add_body(doc,
        "Los prototipos de interfaz constituyen un artefacto de validacion: permiten contrastar, "
        "antes de la implementacion, que el diseno de pantallas es coherente con los casos de uso "
        "y satisface los requisitos de usabilidad RS-04. Se presentan como wireframes de baja "
        "fidelidad que no implican decisiones de diseno visual definitivas.")

    for label, wireframe in [
        ("Figura 15 — Prototipo: Layout Virtual (pantalla principal, UC-03).",
         "MODULO LOGISTICO WEB - ALMACEN SANTANDER        [Diego M. v]\n"
         "--------------------------------------------------------------------\n"
         "[+ Nueva entrada]  [^ Salida]  [<> Reubicar]  [Estadisticas]\n"
         "--------------------------------------------------------------------\n"
         " [A1  45%  5/11 VERDE] [A2  78%  7/9 AMBAR] [A3  91% 11/12 ROJO]\n"
         " [B1  12%  2/17 VERDE] [B2 100% 12/12 ROJO] [B3  33%  4/12 VERDE]\n"
         " ... (38 sectores en total) ...\n"
         "Ultima actualizacion: hace 12 s              [Actualizar ahora]"),
        ("Figura 16 — Prototipo: Formulario de Registro de Entrada (UC-01).",
         "<- Volver al mapa          NUEVA ENTRADA DE PALE\n"
         "---------------------------------------------------\n"
         "Codigo de referencia:\n"
         "[ JH-____-_  (autocompletado)                    ]\n"
         "\n"
         "Tipo de material:\n"
         "[ v Seleccionar tipo...                          ]\n"
         "\n"
         "Masa aproximada (kg):\n"
         "[ _____ kg                                       ]\n"
         "\n"
         "Sector destino:\n"
         "[ v Seleccionar en el mapa                       ]\n"
         "\n"
         "[         OK  CONFIRMAR ENTRADA          (60px)  ]"),
        ("Figura 17 — Prototipo: Panel de Detalle de Sector (UC-03).",
         "SECTOR B4  -  11 / 12 pales  (91%)                    [X]\n"
         "Zona: Bloque B - Fachada Norte\n"
         "------------------------------------------------------------\n"
         "REFERENCIA     MATERIAL           ENTRADA\n"
         "JH-8819-A      Pizarras Ens.      12/05/2026\n"
         "JH-7203-B      Fibrocemento       08/05/2026\n"
         "JH-6541-C      Fibrocemento       08/05/2026\n"
         "...\n"
         "------------------------------------------------------------\n"
         "[<> Reubicar pale]          [^ Registrar salida]"),
    ]:
        add_body(doc, label, bold_parts=[label])
        p = doc.add_paragraph()
        p.paragraph_format.left_indent = Cm(0.5)
        p.paragraph_format.space_before = Pt(2)
        p.paragraph_format.space_after  = Pt(2)
        run = p.add_run(wireframe)
        run.font.name = 'Courier New'
        run.font.size = Pt(8)
        add_figure_caption(doc, label)

    # ----------------------------------------- 3.5 ESTRUCTURA
    add_heading(doc, '3.5 Estructura del Modelo de Casos de Uso', 2)
    add_body(doc,
        "La estructura del modelo de casos de uso formaliza las relaciones de inclusion y extension "
        "entre casos de uso, identificando la funcionalidad compartida (subflujos obligatorios) y "
        "los flujos opcionales (extensiones) (Larman, 2004).")
    add_heading(doc, 'Relaciones de inclusion (<<include>>)', 3)
    add_table(doc,
        headers=['Caso de uso', 'Incluye', 'Justificacion'],
        rows=[
            ['UC-01, UC-02, UC-03, UC-04, UC-10, UC-11, UC-12', 'UC-09 (Autenticar usuario)', 'Todo acceso al sistema requiere verificacion. Subflujo obligatorio, incondicional y compartido.'],
            ['UC-01, UC-03', 'UC-07 (Calcular saturacion)', 'Ambos CdU necesitan el porcentaje de ocupacion de los sectores para su correcta presentacion.'],
        ],
        col_widths=[5.5, 4.5, 8.5])
    add_heading(doc, 'Relaciones de extension (<<extend>>)', 3)
    add_table(doc,
        headers=['Caso de uso base', 'Extendido por', 'Condicion de activacion'],
        rows=[
            ['UC-01 (Registrar entrada)', 'UC-08 (Registrar incidencia)', 'El operario detecta una anomalia en el pale durante el registro de entrada.'],
        ],
        col_widths=[4.5, 4.5, 9.5])
    add_plantuml_block(doc, DIAG_ESTRUCTURA, "Figura 18. Diagrama de Estructura del Modelo de CdU (include/extend).")
    add_separator(doc)

    # ======================================================= 4. TRAZABILIDAD
    doc.add_page_break()
    add_heading(doc, '4. Matriz de Trazabilidad', 1)
    add_body(doc,
        "La matriz de trazabilidad garantiza la correspondencia entre las necesidades del negocio "
        "identificadas en el Capitulo 1 y los artefactos especificados en el presente capitulo. "
        "Constituye evidencia de coherencia del sistema.")
    add_table(doc,
        headers=['Necesidad (Cap. 1)', 'Artefacto en Cap. 2', 'Cap. que lo implementa'],
        rows=[
            ['Registro de entradas en tiempo real', 'UC-01, RS-01, RS-07', 'Cap. 3 y 4'],
            ['Registro de salidas autorizado', 'UC-02, RS-03', 'Cap. 3 y 4'],
            ['Visibilidad del almacen en tiempo real', 'UC-03, RS-01, Glosario "Layout virtual", Fig. 15', 'Cap. 3 y 4'],
            ['Reubicacion de pales', 'UC-04', 'Cap. 3 y 4'],
            ['Localizacion rapida de un pale concreto', 'UC-10', 'Cap. 3 y 4'],
            ['Trazabilidad auditoria de movimientos', 'UC-12, Clase Movimiento (Fig. 1)', 'Cap. 3 y 4'],
            ['Gestion de accesos del personal', 'UC-11, RS-03, Actores', 'Cap. 3 y 4'],
            ['Integracion con sistema Rollship', 'Actor Rollship, UC-03 API, RS-05, Fig. 8', 'Cap. 3 y 4'],
            ['Migracion del historico de MS Access', 'UC-06, Actor MS Access', 'Cap. 4'],
            ['Operabilidad con guantes en nave', 'RS-04, Fig. 15-17 (wireframes)', 'Cap. 3 (diseno UI)'],
            ['Integridad del inventario', 'RS-07, Fig. 3 (ciclo de vida pale)', 'Cap. 3 (arquitectura)'],
            ['Control de acceso por roles', 'RS-03, Actores, Fig. 5 y 6', 'Cap. 3 (diseno)'],
            ['Estadisticas de flujo para gerencia', 'UC-05', 'Cap. 4'],
        ],
        col_widths=[5.5, 6.5, 4.5])
    add_separator(doc)

    # ======================================================= 5. REFERENCIAS
    add_heading(doc, '5. Referencias Bibliograficas', 1)
    refs = [
        "Kruchten, P. (2004). The rational unified process: An introduction (3.a ed.). Addison-Wesley.",
        "Larman, C. (2004). Applying UML and patterns: An introduction to object-oriented analysis and design and iterative development (3.a ed.). Prentice Hall.",
        "Object Management Group. (2017). Unified Modeling Language specification version 2.5.1. OMG. https://www.omg.org/spec/UML/2.5.1/",
        "Pressman, R. S., & Maxim, B. R. (2020). Software engineering: A practitioner's approach (9.a ed.). McGraw-Hill.",
        "Sommerville, I. (2015). Software engineering (10.a ed.). Pearson.",
        "W3C. (2018). Web content accessibility guidelines (WCAG) 2.1. World Wide Web Consortium. https://www.w3.org/TR/WCAG21/",
        "Wiegers, K. E., & Beatty, J. (2013). Software requirements (3.a ed.). Microsoft Press.",
    ]
    for ref in refs:
        p = doc.add_paragraph()
        p.paragraph_format.left_indent = Cm(1.25)
        p.paragraph_format.first_line_indent = Cm(-1.25)
        p.paragraph_format.space_after = Pt(6)
        r = p.add_run(ref)
        r.font.name = 'Times New Roman'
        r.font.size = Pt(11)

    return doc


if __name__ == '__main__':
    output = (r"C:\Users\PORTATIL_MSI\Desktop\TFG\Archivos importantes--entregas"
              r"\Capitulo2_Mario_Del_Rio_FINAL.docx")
    print("Generando Capitulo 2...")
    doc = build_document()
    doc.save(output)
    print("Documento guardado en:")
    print(output)
