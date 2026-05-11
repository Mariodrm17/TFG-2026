"""
Generador del Capitulo 3 del TFG en formato Word (.docx).
Analisis y Diseno del Sistema WMS — Almacen Santander.
Los diagramas se insertan como bloques de codigo Mermaid.
"""

from docx import Document
from docx.shared import Pt, RGBColor, Cm
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml.ns import qn
from docx.oxml import OxmlElement


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


def add_bullet(doc, text, bold_intro=None):
    p = doc.add_paragraph(style='List Bullet')
    p.paragraph_format.space_after = Pt(3)
    if bold_intro:
        rb = p.add_run(bold_intro)
        rb.font.name = 'Times New Roman'; rb.font.size = Pt(11); rb.bold = True
        r2 = p.add_run(text)
        r2.font.name = 'Times New Roman'; r2.font.size = Pt(11)
    else:
        r = p.add_run(text)
        r.font.name = 'Times New Roman'; r.font.size = Pt(11)
    return p


def add_figure_caption(doc, caption):
    p = doc.add_paragraph()
    p.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_before = Pt(4)
    p.paragraph_format.space_after  = Pt(12)
    r = p.add_run(caption)
    r.font.name = 'Times New Roman'; r.font.size = Pt(10); r.italic = True
    return p


def add_separator(doc):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(6)
    p.paragraph_format.space_after  = Pt(6)
    r = p.add_run(); r.font.size = Pt(1)


def _set_cell_bg(cell, hex_color):
    tc = cell._tc
    tcPr = tc.get_or_add_tcPr()
    shd = OxmlElement('w:shd')
    shd.set(qn('w:val'), 'clear')
    shd.set(qn('w:color'), 'auto')
    shd.set(qn('w:fill'), hex_color)
    tcPr.append(shd)


def add_table(doc, headers, rows, col_widths=None, small=False):
    table = doc.add_table(rows=1, cols=len(headers))
    table.style = 'Table Grid'
    hdr_cells = table.rows[0].cells
    fs = Pt(9) if small else Pt(10)
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
                run.font.size = fs
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
                    run.font.size = fs
    if col_widths:
        for i, w in enumerate(col_widths):
            for row in table.rows:
                row.cells[i].width = Cm(w)
    doc.add_paragraph().paragraph_format.space_after = Pt(4)
    return table


def add_mermaid_block(doc, mermaid_code, figure_label):
    """Inserta el codigo Mermaid en un bloque de codigo con estilo y pie de figura."""
    table = doc.add_table(rows=1, cols=1)
    table.style = 'Table Grid'
    cell = table.rows[0].cells[0]
    _set_cell_bg(cell, 'EEF3FF')

    hdr = cell.paragraphs[0]
    hdr.clear()
    hdr.paragraph_format.space_before = Pt(3)
    hdr.paragraph_format.space_after  = Pt(1)
    r = hdr.add_run('Mermaid — ' + figure_label.split('.')[0].strip())
    r.font.name = 'Calibri'; r.font.size = Pt(8); r.font.bold = True
    r.font.color.rgb = RGBColor(30, 80, 150)

    for line in mermaid_code.strip().split('\n'):
        p = cell.add_paragraph()
        p.paragraph_format.space_before = Pt(0)
        p.paragraph_format.space_after  = Pt(0)
        p.paragraph_format.left_indent  = Cm(0.2)
        r = p.add_run(line)
        r.font.name = 'Courier New'; r.font.size = Pt(7)
        r.font.color.rgb = RGBColor(20, 60, 120)

    for row in table.rows:
        row.cells[0].width = Cm(16.0)
    add_figure_caption(doc, figure_label)


# ---------------------------------------------------------------------------
# Diagramas Mermaid
# ---------------------------------------------------------------------------

DIAG_CLASES_ANALISIS = """\
classDiagram
    class Pale {
        <<model>>
        +String codigoRef
        +String estado
        +Date fechaEntrada
        +Date fechaSalida
        +registrarEntrada()
        +registrarSalida()
        +reubicar()
        +buscarPorReferencia()
    }
    class Sector {
        <<model>>
        +String codigo
        +int capacidadMax
        +int ocupacionActual
        +calcularSaturacion() float
        +estaDisponible() bool
        +incrementarOcupacion()
        +decrementarOcupacion()
    }
    class Movimiento {
        <<model>>
        +String tipo
        +DateTime fechaHora
        +String notas
        +registrar()
    }
    class Mercancia {
        <<model>>
        +String codigo
        +String descripcion
        +String tipo
        +float pesoKg
    }
    class Usuario {
        <<model>>
        +String email
        +String rol
        +autenticar() bool
        +generarToken() String
        +desactivar()
    }
    class Incidencia {
        <<model>>
        +String tipo
        +String descripcion
        +DateTime fechaRegistro
        +Boolean resuelta
        +resolver()
    }
    class ControladorEntradaPale {
        <<controller>>
        +ejecutar(datos, usuarioId)
    }
    class ControladorSalidaPale {
        <<controller>>
        +ejecutar(paleId, usuarioId)
    }
    class ControladorLayout {
        <<controller>>
        +ejecutar()
    }
    class ControladorReubicacion {
        <<controller>>
        +ejecutar(paleId, sectorDestinoId, usuarioId)
    }
    class ControladorEstadisticas {
        <<controller>>
        +ejecutar(filtros)
    }
    class ControladorSaturacion {
        <<controller>>
        +calcular(sectorId) float
        +determinarColor(pct) String
    }
    class ControladorIncidencia {
        <<controller>>
        +ejecutar(paleId, tipo, descripcion, usuarioId)
    }
    class ControladorAutenticacion {
        <<controller>>
        +ejecutar(email, password) Token
    }
    class ControladorBusqueda {
        <<controller>>
        +ejecutar(codigoRef, filtros)
    }
    class ControladorUsuarios {
        <<controller>>
        +crear(datos)
        +modificar(id, datos)
        +desactivar(id)
    }
    class ControladorHistorial {
        <<controller>>
        +ejecutar(paleId, filtros)
    }
    Pale "1" --> "1..*" Movimiento : genera
    Pale "0..*" --> "0..1" Sector : ubicado en
    Pale "0..1" --> "1" Mercancia : categorizado por
    Pale "1" --> "0..*" Incidencia : puede tener
    Movimiento "0..*" --> "1" Usuario : registrado por
    ControladorEntradaPale ..> Pale : crea
    ControladorEntradaPale ..> Sector : bloquea / actualiza
    ControladorEntradaPale ..> Movimiento : crea
    ControladorSalidaPale ..> Pale : actualiza estado
    ControladorSalidaPale ..> Sector : decrementa
    ControladorSalidaPale ..> Movimiento : crea
    ControladorLayout ..> Sector : consulta todos
    ControladorReubicacion ..> Pale : mueve
    ControladorReubicacion ..> Sector : verifica ambos
    ControladorReubicacion ..> Movimiento : crea
    ControladorEstadisticas ..> Movimiento : agrega
    ControladorSaturacion ..> Sector : calcula pct
    ControladorIncidencia ..> Pale : cambia estado
    ControladorIncidencia ..> Incidencia : crea
    ControladorAutenticacion ..> Usuario : verifica
    ControladorBusqueda ..> Pale : consulta por ref
    ControladorUsuarios ..> Usuario : gestiona
    ControladorHistorial ..> Movimiento : recupera
    ControladorHistorial ..> Pale : lee"""

DIAG_SEQ_UC01_ANAL = """\
sequenceDiagram
    actor Operario
    participant IUFormEntradaPale
    participant ControladorEntradaPale
    participant ControladorAutenticacion
    participant ControladorSaturacion
    participant Sector
    participant Pale
    participant Movimiento

    Operario->>IUFormEntradaPale: introducir(codigoRef, sectorId, tipoMercancia)
    IUFormEntradaPale->>ControladorAutenticacion: verificarSesion(token)
    ControladorAutenticacion-->>IUFormEntradaPale: sesion valida (usuarioId, rol)
    IUFormEntradaPale->>ControladorEntradaPale: ejecutar(datos, usuarioId)
    ControladorEntradaPale->>Pale: existeActivo(codigoRef)
    Pale-->>ControladorEntradaPale: false (codigo no duplicado)
    ControladorEntradaPale->>Sector: bloquearYLeer(sectorId)
    Note over Sector: Bloqueo exclusivo FOR UPDATE
    Sector-->>ControladorEntradaPale: {ocupacionActual, capacidadMax}
    ControladorEntradaPale->>ControladorSaturacion: calcular(sector)
    ControladorSaturacion-->>ControladorEntradaPale: pct, codigoColor
    alt Sector disponible
        ControladorEntradaPale->>Pale: crear(codigoRef, sectorId, mercanciaId)
        Pale-->>ControladorEntradaPale: paleId
        ControladorEntradaPale->>Sector: incrementarOcupacion(sectorId)
        ControladorEntradaPale->>Movimiento: registrar(paleId, ENTRADA, sectorId, usuarioId)
        ControladorEntradaPale-->>IUFormEntradaPale: exito
        IUFormEntradaPale-->>Operario: confirmacion + semaforo actualizado
    else Sector lleno
        ControladorEntradaPale-->>IUFormEntradaPale: error Capacidad maxima superada
        IUFormEntradaPale-->>Operario: alerta Seleccione otro sector
    end"""

DIAG_SEQ_UC02_ANAL = """\
sequenceDiagram
    actor Operario
    participant IUFormSalidaPale
    participant ControladorSalidaPale
    participant Pale
    participant Sector
    participant Movimiento

    Operario->>IUFormSalidaPale: buscarPale(codigoRef)
    IUFormSalidaPale->>ControladorSalidaPale: ejecutar(paleId, usuarioId)
    ControladorSalidaPale->>Pale: bloquearYLeer(paleId)
    Note over Pale: Verifica estado != expedido
    alt Pale valido en almacen
        Pale-->>ControladorSalidaPale: pale{sectorId, estado=emplazado}
        ControladorSalidaPale->>Pale: actualizarEstado(paleId, expedido, fechaSalida=ahora)
        ControladorSalidaPale->>Sector: decrementarOcupacion(sectorId)
        ControladorSalidaPale->>Movimiento: registrar(paleId, SALIDA, sectorOrigen, usuarioId)
        ControladorSalidaPale-->>IUFormSalidaPale: exito
        IUFormSalidaPale-->>Operario: confirmacion de expedicion
    else Pale ya expedido o no encontrado
        ControladorSalidaPale-->>IUFormSalidaPale: error de estado
        IUFormSalidaPale-->>Operario: alerta descriptiva
    end"""

DIAG_SEQ_UC03_ANAL = """\
sequenceDiagram
    actor Usuario
    participant IUPrincipalOperario
    participant ControladorLayout
    participant ControladorSaturacion
    participant Sector

    Note over IUPrincipalOperario: Carga inicial o refresco automatico (30 s)
    IUPrincipalOperario->>ControladorLayout: ejecutar()
    ControladorLayout->>Sector: consultarTodos()
    Sector-->>ControladorLayout: lista[38 sectores con ocupacion]
    loop Para cada sector
        ControladorLayout->>ControladorSaturacion: calcular(sector)
        ControladorSaturacion-->>ControladorLayout: pct, codigoColor
    end
    ControladorLayout->>ControladorLayout: calcularResumenGlobal(lista)
    ControladorLayout-->>IUPrincipalOperario: {sectores, resumen}
    loop Para cada sector
        IUPrincipalOperario->>IUCardSector: renderizarSemaforo(sector)
    end
    IUPrincipalOperario-->>Usuario: mapa interactivo de 38 sectores"""

DIAG_SEQ_UC04_ANAL = """\
sequenceDiagram
    actor Operario
    participant IUFormReubicacion
    participant ControladorReubicacion
    participant Pale
    participant SectorOrigen
    participant SectorDestino
    participant Movimiento

    Operario->>IUFormReubicacion: seleccionar pale y sector destino
    IUFormReubicacion->>ControladorReubicacion: ejecutar(paleId, sectorDestinoId, usuarioId)
    ControladorReubicacion->>Pale: bloquearYLeer(paleId)
    Pale-->>ControladorReubicacion: pale{sectorOrigenId, estado=emplazado}
    ControladorReubicacion->>SectorDestino: bloquearYLeer(sectorDestinoId)
    Note over SectorDestino: Bloqueo en orden deterministico para evitar deadlock
    alt Sector destino disponible y pale no ya alli
        ControladorReubicacion->>Pale: actualizarSector(paleId, sectorDestinoId)
        ControladorReubicacion->>SectorOrigen: decrementarOcupacion(sectorOrigenId)
        ControladorReubicacion->>SectorDestino: incrementarOcupacion(sectorDestinoId)
        ControladorReubicacion->>Movimiento: registrar(paleId, REUBICACION, origen, destino, usuarioId)
        ControladorReubicacion-->>IUFormReubicacion: exito
        IUFormReubicacion-->>Operario: confirmacion + mapa actualizado
    else Error de capacidad o pale ya en destino
        ControladorReubicacion-->>IUFormReubicacion: error descriptivo
        IUFormReubicacion-->>Operario: alerta
    end"""

DIAG_SEQ_UC09_ANAL = """\
sequenceDiagram
    actor Usuario
    participant IUFormLogin
    participant ControladorAutenticacion
    participant UsuarioModel

    Usuario->>IUFormLogin: introducir(email, password)
    IUFormLogin->>ControladorAutenticacion: ejecutar(email, password)
    ControladorAutenticacion->>UsuarioModel: buscarPorEmail(email)
    UsuarioModel-->>ControladorAutenticacion: usuario{passwordHash, rol, activo}
    alt Credenciales validas y usuario activo
        ControladorAutenticacion->>ControladorAutenticacion: verificarPassword(password, hash)
        ControladorAutenticacion->>ControladorAutenticacion: generarToken(id, nombre, rol)
        ControladorAutenticacion-->>IUFormLogin: {token, usuario}
        IUFormLogin-->>Usuario: redirigir a pantalla principal segun rol
    else Credenciales incorrectas
        ControladorAutenticacion-->>IUFormLogin: error 401
        IUFormLogin-->>Usuario: mensaje de error generico
    end"""

DIAG_SEQ_UC10_ANAL = """\
sequenceDiagram
    actor Usuario
    participant IUBuscador
    participant ControladorBusqueda
    participant Pale
    participant Sector

    Usuario->>IUBuscador: introducir codigoRef (completo o parcial)
    IUBuscador->>ControladorBusqueda: ejecutar(codigoRef, filtros)
    ControladorBusqueda->>Pale: buscarPorReferencia(codigoRef)
    Pale-->>ControladorBusqueda: lista[pales coincidentes]
    alt Resultados encontrados
        loop Para cada pale
            ControladorBusqueda->>Sector: obtenerDetalle(sectorId)
            Sector-->>ControladorBusqueda: {codigo, nombre, porcentajeSaturacion}
        end
        ControladorBusqueda-->>IUBuscador: lista[{pale, sector}]
        IUBuscador->>IUCardSector: resaltarSector(sectorId)
        IUBuscador-->>Usuario: resultados + pale resaltado en el layout
    else Sin resultados
        ControladorBusqueda-->>IUBuscador: lista vacia
        IUBuscador-->>Usuario: Sin coincidencias. Amplie los criterios.
    end"""

DIAG_SEQ_UC12_ANAL = """\
sequenceDiagram
    actor Usuario
    participant IUHistorialPale
    participant ControladorHistorial
    participant Pale
    participant Movimiento

    Usuario->>IUHistorialPale: solicitar historial
    IUHistorialPale->>ControladorHistorial: ejecutar(paleId, filtros)
    ControladorHistorial->>Pale: verificarExistencia(paleId)
    Pale-->>ControladorHistorial: pale{codigoRef, estado}
    ControladorHistorial->>Movimiento: recuperarPorPale(paleId, filtros)
    Note over Movimiento: Recupera tipo, fecha, sectores y operario de cada movimiento
    Movimiento-->>ControladorHistorial: lista[movimientos ordenados ASC]
    ControladorHistorial-->>IUHistorialPale: {pale, historial}
    IUHistorialPale-->>Usuario: linea de tiempo de movimientos"""

DIAG_PAQUETES_ANALISIS = """\
graph TD
    subgraph PA["Paquete: Gestion de Inventario (nucleo operativo)"]
        P1["ControladorEntradaPale · ControladorSalidaPale
        ControladorReubicacion · ControladorSaturacion · ControladorIncidencia"]
        P2["Pale · Sector · Movimiento · Mercancia · Incidencia"]
    end
    subgraph PB["Paquete: Consulta y Reporting"]
        P3["ControladorLayout · ControladorEstadisticas
        ControladorBusqueda · ControladorHistorial"]
        P4["IUCardSector · IUBuscador · IUHistorialPale
        IUPanelEstadisticas · IUPrincipalOperario · IUPrincipalAdministrador"]
    end
    subgraph PC["Paquete: Seguridad y Acceso"]
        P5["ControladorAutenticacion · ControladorUsuarios
        Usuario · IUFormLogin · IUPanelUsuarios"]
    end
    subgraph PD["Paquete: Integracion y Migracion"]
        P6["ControladorMigracion · IUConectorRollship · IUVolcadoAccess"]
    end
    PA -->|"usa"| PB
    PA -->|"usa"| PC
    PB -->|"usa"| PC"""

DIAG_ARQUITECTURA = """\
graph TD
    subgraph CAPA1["Capa de Presentacion — Cliente"]
        C1A["React 18 + Vite (SPA)"]
        C1B["Navegador: tablet / PC oficina"]
        C1A --- C1B
    end
    subgraph CAPA2["Capa de Aplicacion — Servidor"]
        C2A["Node.js 18 LTS + Express 4"]
        C2B["Rutas REST: /api/auth · /api/pales · /api/sectores · /api/stats"]
        C2C["Controladores: authCtrl · paleCtrl · sectorCtrl · statsCtrl"]
        C2D["Middleware JWT (verificarToken · soloAdmin)"]
        C2A --> C2B --> C2C
        C2A --> C2D
    end
    subgraph CAPA3["Capa de Datos — Persistencia"]
        C3A["MySQL 8.0 — Motor InnoDB"]
        C3B["wms_almacen  utf8mb4_unicode_ci"]
        C3C["Tablas: usuarios · sectores · mercancia · pales · movimientos"]
        C3A --> C3B --> C3C
    end
    subgraph EXT["Sistemas Externos"]
        E1["Motor Rollship (ERP James Hardie)"]
    end
    CAPA1 -->|"HTTP REST / JSON  Authorization: Bearer JWT"| CAPA2
    CAPA2 -->|"MySQL2 Pool  Transacciones ACID"| CAPA3
    CAPA2 -->|"JSON + JWT"| CAPA1
    E1 -->|"GET /api/sectores  GET /api/pales"| CAPA2"""

DIAG_CLASES_BACKEND = """\
classDiagram
    class PaleController {
        +entradaPale(req, res) Promise
        +salidaPale(req, res) Promise
        +reubicarPale(req, res) Promise
        +listarPales(req, res) Promise
        +detallePale(req, res) Promise
    }
    class SectorController {
        +getLayout(req, res) Promise
        +getSectorDetalle(req, res) Promise
        +actualizarSector(req, res) Promise
    }
    class StatsController {
        +getDashboard(req, res) Promise
    }
    class AuthController {
        +login(req, res) Promise
        +perfil(req, res) Promise
    }
    class AuthMiddleware {
        <<middleware>>
        +verificarToken(req, res, next) void
        +soloAdmin(req, res, next) void
    }
    class DatabasePool {
        <<config>>
        +getConnection() Connection
        +query(sql, params) Promise
        +testConnection() Promise
    }
    class PaleRoutes {
        <<routes>>
        GET /
        GET /:id
        POST /entrada
        POST /:id/salida
        PUT /:id/reubicar
    }
    class SectorRoutes {
        <<routes>>
        GET /
        GET /:id
        PUT /:id
    }
    class StatsRoutes {
        <<routes>>
        GET /
    }
    class AuthRoutes {
        <<routes>>
        POST /login
        GET /perfil
    }
    PaleRoutes --> AuthMiddleware : aplica verificarToken
    PaleRoutes --> PaleController : delega en
    SectorRoutes --> AuthMiddleware : aplica verificarToken
    SectorRoutes --> SectorController : delega en
    StatsRoutes --> AuthMiddleware : verificarToken + soloAdmin
    StatsRoutes --> StatsController : delega en
    AuthRoutes --> AuthController : delega en
    PaleController --> DatabasePool : usa pool
    SectorController --> DatabasePool : usa pool
    StatsController --> DatabasePool : usa pool
    AuthController --> DatabasePool : usa pool"""

DIAG_CLASES_FRONTEND = """\
classDiagram
    class ApiService {
        <<service>>
        +login(email, pwd) Promise
        +getLayout() Promise
        +entradaPale(datos) Promise
        +salidaPale(id) Promise
        +reubicarPale(id, sectorId) Promise
        +listarPales(filtros) Promise
        +detallePale(id) Promise
        +getDashboard() Promise
    }
    class LoginPage {
        -email String
        -password String
        +handleSubmit() void
        +render() JSX
    }
    class LayoutPage {
        -data Object
        -cargando Boolean
        +cargarLayout() Promise
        +render() JSX
    }
    class OperacionesPage {
        -sectores Array
        -formData Object
        +handleEntrada() Promise
        +handleSalida() Promise
        +render() JSX
    }
    class PalesPage {
        -pales Array
        -pale Object
        -historial Array
        +buscarPale(buscar) Promise
        +cargarDetalle(id) Promise
        +reubicar(paleId, sectorId) Promise
        +render() JSX
    }
    class DashboardPage {
        -kpis Object
        -movimientos Array
        +cargarDatos() Promise
        +render() JSX
    }
    class AlmacenMap {
        <<component>>
        -sectores Array
        +calcularColor(pct, estado) String
        +onSectorClick(sector) void
        +render() JSX
    }
    LoginPage --> ApiService : login()
    LayoutPage --> ApiService : getLayout()
    LayoutPage --> AlmacenMap : renderiza
    OperacionesPage --> ApiService : entradaPale() / salidaPale()
    PalesPage --> ApiService : listarPales() / detallePale() / reubicarPale()
    DashboardPage --> ApiService : getDashboard()"""

DIAG_SEQ_UC01_DIS = """\
sequenceDiagram
    actor Operario as Operario (Tablet)
    participant React as OperacionesPage.jsx
    participant API as api.js (Axios)
    participant Express as POST /api/pales/entrada
    participant JWT as authMiddleware.verificarToken
    participant Ctrl as paleController.entradaPale()
    participant MySQL as MySQL 8.0 InnoDB

    Operario->>React: rellena formulario y pulsa Registrar entrada
    React->>API: entradaPale({codigo_ref, sector_id, mercancia_id, notas})
    API->>Express: POST /api/pales/entrada — Authorization: Bearer JWT
    Express->>JWT: verificarToken(req)
    JWT-->>Express: req.usuario = {id, nombre, rol}
    Express->>Ctrl: entradaPale(req, res)
    Ctrl->>MySQL: pool.getConnection()
    MySQL-->>Ctrl: conn
    Ctrl->>MySQL: conn.beginTransaction()
    Ctrl->>MySQL: SELECT id FROM pales WHERE codigo_ref=? AND estado!='expedido'
    MySQL-->>Ctrl: [] (codigo no duplicado)
    Ctrl->>MySQL: SELECT * FROM sectores WHERE id=? FOR UPDATE
    Note over MySQL: Row-Level Lock sobre la fila del sector.
    MySQL-->>Ctrl: {ocupacion_actual, capacidad_max, activo}
    alt ocupacion_actual < capacidad_max
        Ctrl->>MySQL: INSERT INTO pales (codigo_ref, mercancia_id, sector_id, estado='emplazado')
        MySQL-->>Ctrl: insertId = paleId
        Ctrl->>MySQL: UPDATE sectores SET ocupacion_actual=ocupacion_actual+1 WHERE id=?
        Ctrl->>MySQL: INSERT INTO movimientos (pale_id, usuario_id, tipo='entrada', sector_destino, notas)
        Ctrl->>MySQL: conn.commit()
        MySQL-->>Ctrl: OK — lock liberado
        Ctrl->>MySQL: conn.release()
        Ctrl-->>Express: res.status(201).json({mensaje, pale_id, codigo_ref, sector_id})
        Express-->>API: HTTP 201 JSON
        API-->>React: {mensaje: Pale registrado correctamente}
        React-->>Operario: SnackBar verde + refresco del layout
    else ocupacion_actual >= capacidad_max
        Ctrl->>MySQL: conn.rollback()
        Ctrl->>MySQL: conn.release()
        Ctrl-->>Express: res.status(409).json({error: Capacidad maxima superada})
        Express-->>API: HTTP 409
        React-->>Operario: alerta roja Selecciona otro sector
    end"""

DIAG_SEQ_UC03_DIS = """\
sequenceDiagram
    actor Usuario as Usuario (Tablet/PC)
    participant React as LayoutPage.jsx
    participant Interval as setInterval(30 000 ms)
    participant API as api.js (Axios)
    participant Express as GET /api/sectores
    participant Ctrl as sectorController.getLayout()
    participant MySQL as MySQL 8.0 InnoDB

    Note over React,Interval: Carga inicial al montar el componente
    React->>API: getLayout()
    API->>Express: GET /api/sectores — Authorization: Bearer JWT
    Express->>Ctrl: getLayout(req, res)
    Ctrl->>MySQL: SELECT id, codigo, nombre, capacidad_max, ocupacion_actual,
    Ctrl->>MySQL:   ROUND(ocupacion_actual/capacidad_max*100,1) AS pct,
    Ctrl->>MySQL:   CASE WHEN pct<50 THEN 'bajo' WHEN pct<75 THEN 'medio' ELSE 'alto' END
    Ctrl->>MySQL:   FROM sectores ORDER BY codigo
    MySQL-->>Ctrl: [38 filas con pct y estado]
    Ctrl->>Ctrl: reduce() para totalPales, totalCapacidad, pctGlobal
    Ctrl-->>Express: res.json({sectores:[...], resumen:{...}})
    Express-->>API: HTTP 200 JSON
    API-->>React: {sectores, resumen}
    loop Para cada uno de los 38 sectores
        React->>AlmacenMap: render(sector.pct, sector.estado_saturacion)
        Note over AlmacenMap: verde(libre)/azul(bajo)/amarillo(medio)/naranja(alto)/rojo(critico)
    end
    React-->>Usuario: mapa interactivo + KPIs globales
    Note over React,Interval: Refresco automatico cada 30 segundos
    Interval-->>React: trigger cargarLayout()
    React->>API: getLayout()"""

DIAG_SEQ_UC04_DIS = """\
sequenceDiagram
    actor Operario
    participant React as PalesPage.jsx
    participant API as api.js
    participant Express as PUT /api/pales/:id/reubicar
    participant Ctrl as paleController.reubicarPale()
    participant MySQL as MySQL 8.0 InnoDB

    Operario->>React: selecciona pale + sector destino -> Reubicar
    React->>API: reubicarPale(paleId, {sector_destino_id, notas})
    API->>Express: PUT /api/pales/247/reubicar — Bearer JWT
    Express->>Ctrl: reubicarPale(req, res)
    Ctrl->>MySQL: getConnection() beginTransaction()
    Ctrl->>MySQL: SELECT * FROM pales WHERE id=247 AND estado NOT IN ('expedido') FOR UPDATE
    MySQL-->>Ctrl: {sector_id: sectorOrigen, estado: emplazado}
    Ctrl->>MySQL: SELECT * FROM sectores WHERE id=sectorDestinoId FOR UPDATE
    Note over MySQL: Bloqueo de ambas filas en orden deterministico para evitar deadlock
    MySQL-->>Ctrl: {ocupacion_actual, capacidad_max}
    alt Sector destino disponible y distinto del actual
        Ctrl->>MySQL: UPDATE pales SET sector_id=sectorDestino WHERE id=247
        Ctrl->>MySQL: UPDATE sectores SET ocupacion_actual=GREATEST(0,ocupacion-1) WHERE id=sectorOrigen
        Ctrl->>MySQL: UPDATE sectores SET ocupacion_actual=ocupacion+1 WHERE id=sectorDestino
        Ctrl->>MySQL: INSERT INTO movimientos (pale_id=247, tipo='reubicacion', ...)
        Ctrl->>MySQL: commit() release()
        Ctrl-->>Express: res.json({mensaje: Pale reubicado correctamente})
        Express-->>API: HTTP 200
        React-->>Operario: confirmacion + actualizacion de vista
    else Error de capacidad o pale ya en destino
        Ctrl->>MySQL: rollback() release()
        Ctrl-->>Express: res.status(409).json({error})
        React-->>Operario: alerta descriptiva
    end"""

DIAG_SEQ_UC09_DIS = """\
sequenceDiagram
    actor Usuario
    participant React as LoginPage.jsx
    participant API as api.js (Axios)
    participant Express as POST /api/auth/login
    participant Ctrl as authController.login()
    participant MySQL as MySQL 8.0 InnoDB
    participant BCrypt as bcryptjs.compare()
    participant JWT as jsonwebtoken.sign()

    Usuario->>React: introduce email + contrasena
    React->>API: login({email, password})
    API->>Express: POST /api/auth/login (sin token — ruta publica)
    Express->>Ctrl: login(req, res)
    Ctrl->>MySQL: SELECT * FROM usuarios WHERE email=? AND activo=1
    MySQL-->>Ctrl: usuario{id, nombre, passwordHash, rol} o []
    alt Usuario encontrado y activo
        Ctrl->>BCrypt: compare(password, passwordHash)
        BCrypt-->>Ctrl: true (contrasena valida)
        Ctrl->>JWT: sign({id, nombre, rol}, JWT_SECRET, {expiresIn: '8h'})
        JWT-->>Ctrl: token firmado
        Ctrl-->>Express: res.json({token, usuario:{id, nombre, email, rol}})
        Express-->>API: HTTP 200 JSON
        API-->>React: {token, usuario}
        React->>React: localStorage.setItem('token', token)
        React-->>Usuario: redirigir a LayoutPage (operario) o DashboardPage (admin)
    else Credenciales incorrectas o cuenta inactiva
        Ctrl-->>Express: res.status(401).json({error: Credenciales incorrectas})
        Note over Ctrl: Mismo mensaje para email o password incorrectos (RS-03 seguridad)
        Express-->>API: HTTP 401
        React-->>Usuario: mensaje de error generico
    end"""

DIAG_SEQ_UC10_DIS = """\
sequenceDiagram
    actor Usuario
    participant React as PalesPage.jsx
    participant API as api.js
    participant Express as GET /api/pales?buscar=
    participant Ctrl as paleController.listarPales()
    participant MySQL as MySQL 8.0 InnoDB

    Usuario->>React: introduce codigo de referencia en el buscador
    React->>API: listarPales({buscar: JH-88, pagina: 1, limite: 20})
    API->>Express: GET /api/pales?buscar=JH-88 — Bearer JWT
    Express->>Ctrl: listarPales(req, res)
    Ctrl->>MySQL: SELECT COUNT(*) FROM pales p WHERE p.codigo_ref LIKE '%JH-88%'
    MySQL-->>Ctrl: {total: N}
    Ctrl->>MySQL: SELECT p.id, p.codigo_ref, p.estado, p.fecha_entrada,
    Ctrl->>MySQL:   s.codigo AS sector_codigo, m.descripcion AS mercancia
    Ctrl->>MySQL:   FROM pales p LEFT JOIN sectores s ON p.sector_id=s.id
    Ctrl->>MySQL:   LEFT JOIN mercancia m ON p.mercancia_id=m.id
    Ctrl->>MySQL:   WHERE p.codigo_ref LIKE '%JH-88%' ORDER BY p.fecha_entrada DESC LIMIT 20
    MySQL-->>Ctrl: [lista de pales coincidentes con sector y mercancia]
    Ctrl-->>Express: res.json({pales, total, pagina, limite})
    Express-->>API: HTTP 200 JSON
    API-->>React: {pales, total}
    alt Resultados encontrados
        React->>React: renderizar lista de resultados
        React-->>Usuario: lista de pales + boton Ver detalle por cada uno
    else Sin resultados
        React-->>Usuario: No se encontraron pales con esa referencia.
    end"""

DIAG_SEQ_UC12_DIS = """\
sequenceDiagram
    actor Usuario
    participant React as PalesPage.jsx
    participant API as api.js
    participant Express as GET /api/pales/:id
    participant Ctrl as paleController.detallePale()
    participant MySQL as MySQL 8.0 InnoDB

    Usuario->>React: selecciona un pale de la lista
    React->>API: detallePale(paleId)
    API->>Express: GET /api/pales/247 — Bearer JWT
    Express->>Ctrl: detallePale(req, res)
    Ctrl->>MySQL: SELECT p.*, s.codigo AS sector_codigo, m.descripcion AS mercancia
    Ctrl->>MySQL:   FROM pales p LEFT JOIN sectores s ON p.sector_id=s.id
    Ctrl->>MySQL:   LEFT JOIN mercancia m ON p.mercancia_id=m.id WHERE p.id=247
    MySQL-->>Ctrl: pale{codigoRef, estado, sectorCodigo, mercancia}
    Ctrl->>MySQL: SELECT mv.tipo, mv.fecha_hora, mv.notas,
    Ctrl->>MySQL:   u.nombre AS usuario, so.codigo AS sector_origen, sd.codigo AS sector_destino
    Ctrl->>MySQL:   FROM movimientos mv LEFT JOIN usuarios u ON mv.usuario_id=u.id
    Ctrl->>MySQL:   LEFT JOIN sectores so ON mv.sector_origen=so.id
    Ctrl->>MySQL:   LEFT JOIN sectores sd ON mv.sector_destino=sd.id
    Ctrl->>MySQL:   WHERE mv.pale_id=247 ORDER BY mv.fecha_hora ASC
    Note over MySQL: JOIN con cuatro tablas. Indice idx_movimientos_pale garantiza sub-segundo.
    MySQL-->>Ctrl: [{tipo, fecha_hora, sector_origen, sector_destino, usuario}...]
    Ctrl-->>Express: res.json({pale, historial:[...]})
    Express-->>API: HTTP 200 JSON
    API-->>React: {pale, historial}
    React-->>Usuario: linea de tiempo cronologica de movimientos"""

DIAG_DESPLIEGUE = """\
graph TD
    subgraph CLIENTE["Nodo: Dispositivo Cliente (Tablet / PC Oficina)"]
        BR["Navegador Web — Chrome 110+"]
        SPA["React SPA (bundle Vite — HTML + CSS + JS)"]
        BR --> SPA
    end
    subgraph SERVIDOR["Nodo: Servidor de Aplicacion (Windows Server / Linux)"]
        NODE["Runtime: Node.js 18 LTS"]
        EXPRESS["Framework: Express 4 (puerto 3001)"]
        CORS["CORS Middleware"]
        JWTMW["JWT Middleware (verificarToken · soloAdmin)"]
        CTRL["Controladores: authCtrl · paleCtrl · sectorCtrl · statsCtrl"]
        ROUTES["Rutas: /api/auth · /api/pales · /api/sectores · /api/stats"]
        NODE --> EXPRESS --> CORS
        EXPRESS --> JWTMW
        EXPRESS --> ROUTES --> CTRL
    end
    subgraph BBDD["Nodo: Servidor de Base de Datos (MySQL 8.0)"]
        INNODB["Motor InnoDB (ACID · Row-Level Locking)"]
        DB["Base de Datos: wms_almacen — utf8mb4_unicode_ci"]
        TABLAS["Tablas: usuarios · sectores · mercancia · pales · movimientos"]
        IDX["Indices: idx_movimientos_fecha · idx_movimientos_tipo · idx_movimientos_pale"]
        INNODB --> DB --> TABLAS
        DB --> IDX
    end
    subgraph ROLLSHIP["Sistema Externo: Motor Rollship (ERP James Hardie)"]
        ROLL["Servidor Laravel/PHP"]
    end
    SPA -->|"HTTP REST / JSON  Authorization: Bearer JWT"| EXPRESS
    CTRL -->|"MySQL2 Pool (connectionLimit=10)  Transacciones ACID"| INNODB
    ROLL -->|"GET /api/sectores  GET /api/pales"| EXPRESS"""

DIAG_PAQUETES = """\
graph TD
    subgraph FRONT["Subsistema Frontend (React + Vite)"]
        direction TB
        F1["pages/  LoginPage · LayoutPage · OperacionesPage · PalesPage · DashboardPage"]
        F2["components/  Layout/AlmacenMap · Auth/ · Dashboard/ · Operaciones/"]
        F3["services/  api.js (Axios + JWT header automatico)"]
        F4["styles/  CSS global · variables"]
        F1 --> F2
        F1 --> F3
        F2 --> F3
        F1 --> F4
    end
    subgraph BACK["Subsistema Backend (Node.js + Express)"]
        direction TB
        B1["routes/  authRoutes · paleRoutes · sectorRoutes · statsRoutes"]
        B2["controllers/  authController · paleController · sectorController · statsController"]
        B3["middleware/  auth.js (verificarToken · soloAdmin)"]
        B4["config/  database.js (MySQL2 pool — connectionLimit:10)"]
        B5["sql/  schema.sql · seed.sql"]
        B1 --> B3
        B1 --> B2
        B2 --> B4
        B4 --> B5
    end
    subgraph EXT["Dependencias Externas (npm)"]
        E1["mysql2"] --- E2["jsonwebtoken"] --- E3["bcryptjs"]
        E4["express"] --- E5["react + vite"] --- E6["axios"]
    end
    BACK --> E1
    BACK --> E2
    BACK --> E3
    BACK --> E4
    FRONT --> E5
    FRONT --> E6
    FRONT -->|"HTTP REST (JSON)"| BACK"""

DIAG_ER = """\
erDiagram
    USUARIOS {
        int id PK
        varchar nombre
        varchar email UK
        varchar password
        enum rol "operario | administrador"
        tinyint activo
        timestamp created_at
        timestamp updated_at
    }
    SECTORES {
        int id PK
        varchar codigo UK
        varchar nombre
        int capacidad_max
        int ocupacion_actual
        tinyint activo
        text notas
        timestamp created_at
        timestamp updated_at
    }
    MERCANCIA {
        int id PK
        varchar codigo UK
        varchar descripcion
        enum tipo "bolsas | fardos | ladrillos | pizarras | otros"
        decimal peso_kg
        timestamp created_at
    }
    PALES {
        int id PK
        varchar codigo_ref UK
        int mercancia_id FK
        int sector_id FK
        enum estado "recepcionado | emplazado | en_reubicacion | expedido | incidencia"
        timestamp fecha_entrada
        timestamp fecha_salida
        text notas
        timestamp created_at
        timestamp updated_at
    }
    MOVIMIENTOS {
        int id PK
        int pale_id FK
        int usuario_id FK
        enum tipo "entrada | salida | reubicacion | ajuste"
        int sector_origen FK
        int sector_destino FK
        timestamp fecha_hora
        text notas
    }
    MIGRACION_ACCESS {
        int id PK
        json datos_raw
        tinyint procesado
        text error
        timestamp created_at
    }
    SECTORES ||--o{ PALES : "contiene (0..*)"
    MERCANCIA ||--o{ PALES : "categoriza (0..*)"
    PALES ||--|{ MOVIMIENTOS : "genera (1..*)"
    USUARIOS ||--o{ MOVIMIENTOS : "registra (0..*)"
    SECTORES ||--o{ MOVIMIENTOS : "sector_origen (0..*)"
    SECTORES ||--o{ MOVIMIENTOS : "sector_destino (0..*)" """


# ---------------------------------------------------------------------------
# Construccion del documento
# ---------------------------------------------------------------------------

def build_document():
    doc = Document()
    set_page_margins(doc)

    # ================================================================ PORTADA
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r = p.add_run('CAPITULO 3')
    r.font.name = 'Times New Roman'; r.font.size = Pt(20); r.bold = True

    p2 = doc.add_paragraph()
    p2.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r2 = p2.add_run('Analisis y Diseno del Sistema WMS')
    r2.font.name = 'Times New Roman'; r2.font.size = Pt(16)

    p3 = doc.add_paragraph()
    p3.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r3 = p3.add_run('TFG — Mario Del Rio Merino')
    r3.font.name = 'Times New Roman'; r3.font.size = Pt(12); r3.italic = True

    doc.add_page_break()

    # ============================================================ 3.1 INTRO
    add_heading(doc, '3.1. Introduccion', 1)
    add_body(doc,
        "El presente capitulo constituye el nucleo de ingenieria abstracta de este Trabajo de Fin de "
        "Grado. Su proposito es doble: en primer lugar, refinar los doce casos de uso obtenidos en el "
        "Capitulo 2 mediante el lenguaje de los desarrolladores, introduciendo el formalismo necesario "
        "para tomar decisiones sobre el funcionamiento interno del sistema; en segundo lugar, producir "
        "los modelos y artefactos que permitan abordar la implementacion —descrita en el Capitulo 4— "
        "como un refinamiento natural y predecible del diseno, sin alterar su estructura fundamental.",
        indent=True)

    add_body(doc,
        "El capitulo se organiza en torno a las dos disciplinas que lo articulan metodologicamente "
        "(Larman, 2004):",
        indent=True)

    add_bullet(doc,
        "Disciplina de Analisis: traduce los Casos de Uso y el Modelo del Dominio definidos en el "
        "Capitulo 2 a un conjunto de clases de analisis —Modelo, Vista y Controlador— que capturan "
        "los requisitos en lenguaje de disenador sin imponer todavia restricciones tecnologicas. "
        "El resultado es una comprension mas precisa y mantenible de lo que el sistema debe hacer.",
        bold_intro="Disciplina de Analisis: ")

    add_bullet(doc,
        "Disciplina de Diseno: enfrenta los requisitos no funcionales y el dominio de la solucion. "
        "Aqui se toman las decisiones tecnicas sobre arquitectura, distribucion de componentes, "
        "interaccion entre capas y persistencia de datos, justificando cada eleccion en los requisitos "
        "suplementarios (RS-01 a RS-07) identificados en el capitulo anterior. El diseno aplica los "
        "principios de alta cohesion y bajo acoplamiento (Larman, 2004) y los principios SOLID "
        "(Martin, 2003) como guias de calidad estructural.",
        bold_intro="Disciplina de Diseno: ")

    add_body(doc,
        "La trazabilidad entre ambas disciplinas —y entre estas y los Casos de Uso del Capitulo 2— "
        "constituye el eje vertebrador de este capitulo y garantiza que ninguna decision de diseno "
        "sea arbitraria: toda clase, toda relacion y toda decision arquitectonica tiene su origen "
        "en un requisito documentado.",
        indent=True)

    add_separator(doc)

    # ============================================================ 3.2 ANALISIS
    add_heading(doc, '3.2. Disciplina de Analisis', 1)

    # ---------------------------------------- 3.2.1
    add_heading(doc, '3.2.1. Identificacion de Clases de Analisis', 2)
    add_body(doc,
        "La estrategia de identificacion de clases de analisis parte, segun las convenciones de "
        "Larman (2004), de dos fuentes complementarias: la descripcion textual de los Casos de Uso "
        "y el Modelo del Dominio establecido en el Capitulo 2. Ambas fuentes se combinan para producir "
        "tres categorias de clases de analisis:")

    add_table(doc,
        headers=['Tipo de Clase', 'Criterio de derivacion', 'Responsabilidad'],
        rows=[
            ['Modelo',
             'Entidades del Modelo del Dominio mas los sustantivos clave en las descripciones de CdU',
             'Representar los datos y la logica de negocio del dominio'],
            ['Vista',
             'Una clase principal por cada actor humano; una clase primitiva por cada clase Modelo; '
             'una clase central por cada actor sistema externo',
             'Intermediar entre el usuario y el sistema; presentar datos'],
            ['Controlador',
             'Una clase por cada Caso de Uso',
             'Orquestar la ejecucion de cada CdU, coordinando Modelos y Vistas'],
        ],
        col_widths=[3.0, 7.0, 8.5])

    # --- 3.2.1.1 Clases Modelo
    add_heading(doc, '3.2.1.1. Clases Modelo', 3)
    add_body(doc,
        "Estudiando el Modelo del Dominio (seccion 2.2 del Capitulo 2) y las descripciones de los "
        "doce Casos de Uso, se identifican las siguientes clases Modelo:")

    add_table(doc,
        headers=['Clase Modelo', 'Origen', 'CdU en que participa'],
        rows=[
            ['Pale',
             'Entidad central del Modelo del Dominio; objeto directo de manipulacion en toda descripcion de CdU',
             'UC-01, UC-02, UC-04, UC-07, UC-08, UC-10, UC-12'],
            ['Sector',
             'Entidad del Dominio; contenedor fisico de pales; su saturacion es el dato clave del layout',
             'UC-01, UC-02, UC-03, UC-04, UC-07'],
            ['Movimiento',
             'Entidad del Dominio; registro transaccional de toda operacion sobre un pale',
             'UC-01, UC-02, UC-04, UC-08, UC-12'],
            ['Mercancia',
             'Categoria de producto de James Hardie; necesaria para catalogar el inventario',
             'UC-01'],
            ['Usuario',
             'El Modelo del Dominio define Operario con credenciales y rol; toda interaccion humana '
             'requiere autenticacion',
             'UC-09, UC-11 (y precondicion de todos los CdU humanos)'],
            ['Incidencia',
             'Situacion anomala asociada a un pale; estado especifico del ciclo de vida del Modelo del Dominio',
             'UC-08'],
        ],
        col_widths=[3.5, 8.0, 6.0])

    # --- 3.2.1.2 Clases Vista
    add_heading(doc, '3.2.1.2. Clases Vista', 3)
    add_body(doc, "Aplicando las reglas de derivacion:")

    add_body(doc, "a) Ventanas principales (una por actor humano):",
             bold_parts=["a) Ventanas principales (una por actor humano):"])
    add_table(doc,
        headers=['Clase Vista — Ventana Principal', 'Actor que la origina'],
        rows=[
            ['IUPrincipalOperario',
             'Operario de Pista — acceso a entrada, salida, layout, reubicacion y busqueda'],
            ['IUPrincipalAdministrador',
             'Administrador — panel con acceso completo al sistema'],
        ],
        col_widths=[5.5, 13.0])

    add_body(doc, "b) Vistas primitivas (una por clase Modelo + formularios funcionales):",
             bold_parts=["b) Vistas primitivas (una por clase Modelo + formularios funcionales):"])
    add_table(doc,
        headers=['Clase Vista — Primitiva', 'Clase Modelo asociada', 'CdU'],
        rows=[
            ['IUFormEntradaPale', 'Pale', 'UC-01 — Formulario de registro de entrada'],
            ['IUFormSalidaPale', 'Pale, Sector', 'UC-02 — Formulario de registro de salida'],
            ['IUCardSector', 'Sector', 'UC-03 — Tarjeta visual del sector con semaforo'],
            ['IUFormReubicacion', 'Pale, Sector', 'UC-04 — Formulario de seleccion de destino'],
            ['IUPanelEstadisticas', 'Movimiento, Sector', 'UC-05 — Panel de KPIs e informes'],
            ['IUVolcadoAccess', '(ETL)', 'UC-06 — Interfaz de carga y progreso de migracion'],
            ['IUBuscador', 'Pale', 'UC-10 — Campo de busqueda por codigo de referencia'],
            ['IUPanelUsuarios', 'Usuario', 'UC-11 — Panel CRUD de cuentas de operario'],
            ['IUHistorialPale', 'Movimiento', 'UC-12 — Linea de tiempo de movimientos de un pale'],
            ['IUFormIncidencia', 'Incidencia, Pale', 'UC-08 — Formulario de registro de anomalia'],
            ['IUFormLogin', 'Usuario', 'UC-09 — Pantalla de autenticacion'],
        ],
        col_widths=[4.5, 4.0, 10.0], small=True)

    add_body(doc, "c) Interfaces centrales (una por actor sistema externo):",
             bold_parts=["c) Interfaces centrales (una por actor sistema externo):"])
    add_table(doc,
        headers=['Clase Vista — Central', 'Actor Sistema que la origina'],
        rows=[
            ['IUConectorRollship',
             'Motor Rollship — expone los datos procesados al ERP corporativo via API REST'],
            ['IUVolcadoAccess',
             'MS Access (legado) — gestiona el proceso ETL de migracion de datos historicos'],
        ],
        col_widths=[4.5, 14.0])

    # --- 3.2.1.3 Clases Controlador
    add_heading(doc, '3.2.1.3. Clases Controlador', 3)
    add_body(doc, "Siguiendo la regla de una clase Controlador por Caso de Uso:")

    add_table(doc,
        headers=['Clase Controlador', 'CdU', 'Tipo', 'Responsabilidad principal'],
        rows=[
            ['ControladorEntradaPale', 'UC-01', 'Principal',
             'Validar datos, comprobar capacidad del sector con bloqueo de fila (FOR UPDATE), '
             'persistir el pale y el movimiento de ENTRADA dentro de una transaccion ACID'],
            ['ControladorSalidaPale', 'UC-02', 'Principal',
             'Verificar estado del pale, actualizarlo a expedido, decrementar ocupacion del sector '
             'y registrar movimiento de SALIDA'],
            ['ControladorLayout', 'UC-03', 'Principal',
             'Recuperar el estado de los 38 sectores con porcentaje de saturacion y semaforo cromatico'],
            ['ControladorReubicacion', 'UC-04', 'Principal',
             'Bloquear pale y sector destino simultaneamente, mover el pale actualizando contadores '
             'de ambos sectores, registrar movimiento de REUBICACION'],
            ['ControladorEstadisticas', 'UC-05', 'Principal',
             'Agregar KPIs globales, movimientos por tipo y periodo, sectores mas ocupados y '
             'distribucion de estados de pales'],
            ['ControladorMigracion', 'UC-06', 'Principal',
             'Orquestar el proceso ETL: leer el volcado de MS Access, transformar, validar y cargar '
             'registros en el esquema MySQL'],
            ['ControladorSaturacion', 'UC-07', 'Subflujo interno',
             'Calcular (ocupacion_actual / capacidad_max) x 100 y determinar el codigo cromatico '
             'del semaforo; invocado por UC-01 y UC-03'],
            ['ControladorIncidencia', 'UC-08', 'Principal',
             'Registrar la anomalia, cambiar el estado del pale a Incidencia, bloquear operaciones '
             'sobre el y notificar al administrador'],
            ['ControladorAutenticacion', 'UC-09', 'Subflujo interno',
             'Verificar credenciales con bcrypt, generar token JWT firmado con rol de usuario; '
             'invocado por todos los CdU con actores humanos'],
            ['ControladorBusqueda', 'UC-10', 'Principal',
             'Consultar el inventario activo filtrando por codigo de referencia (busqueda parcial LIKE) '
             'y devolver el pale localizado con su sector actual'],
            ['ControladorUsuarios', 'UC-11', 'Principal',
             'Crear, modificar y desactivar cuentas de operario; garantizar unicidad de credencial '
             'y registrar la operacion en el log de auditoria'],
            ['ControladorHistorial', 'UC-12', 'Principal',
             'Recuperar todos los movimientos asociados a un pale, ordenados cronologicamente, '
             'con datos de sector origen/destino y operario responsable'],
        ],
        col_widths=[4.5, 1.5, 3.0, 9.5], small=True)

    # --- 3.2.1.4 Diagrama
    add_heading(doc, '3.2.1.4. Diagrama de Clases de Analisis', 3)
    add_body(doc,
        "El siguiente diagrama muestra la estructura completa de clases de analisis agrupadas por "
        "estereotipo UML, con sus relaciones de dependencia y navegabilidad (Larman, 2004):")
    add_mermaid_block(doc, DIAG_CLASES_ANALISIS,
        "Figura 1. Diagrama de Clases de Analisis — Sistema WMS Almacen Santander.")

    add_separator(doc)

    # ---------------------------------------- 3.2.2
    add_heading(doc, '3.2.2. Analisis de los Casos de Uso', 2)
    add_body(doc,
        "El analisis de los Casos de Uso produce las realizaciones de analisis: diagramas de secuencia "
        "que muestran como interactuan las clases de analisis para dar cumplimiento a cada CdU, sin "
        "entrar todavia en tecnologias concretas. Se detallan los casos de uso de mayor peso funcional "
        "y complejidad concurrente.")

    # UC-01
    add_heading(doc, '3.2.2.1. Realizacion de UC-01: Registrar Entrada de Pale', 3)
    add_body(doc,
        "El CdU de mayor criticidad operativa. Involucra control de concurrencia explicito: si dos "
        "operarios intentan ubicar pales en el mismo sector simultaneamente, solo uno debe triunfar. "
        "El analisis refleja esta logica de bloqueo en la interaccion con Sector.")
    add_mermaid_block(doc, DIAG_SEQ_UC01_ANAL,
        "Figura 2. Realizacion de UC-01 — Registrar Entrada de Pale.")

    # UC-02
    add_heading(doc, '3.2.2.2. Realizacion de UC-02: Registrar Salida de Pale', 3)
    add_mermaid_block(doc, DIAG_SEQ_UC02_ANAL,
        "Figura 3. Realizacion de UC-02 — Registrar Salida de Pale.")

    # UC-03
    add_heading(doc, '3.2.2.3. Realizacion de UC-03: Consultar Layout Interactivo', 3)
    add_body(doc,
        "CdU de lectura pura con mayor frecuencia de invocacion. Se refresca automaticamente sin "
        "intervencion del usuario. No requiere control de escritura, pero si que la consulta mantenga "
        "el estandar de respuesta sub-segundo (RS-01).")
    add_mermaid_block(doc, DIAG_SEQ_UC03_ANAL,
        "Figura 4. Realizacion de UC-03 — Consultar Layout Interactivo.")

    # UC-04
    add_heading(doc, '3.2.2.4. Realizacion de UC-04: Reubicar Pale entre Sectores', 3)
    add_body(doc,
        "CdU de mayor complejidad transaccional: involucra el bloqueo simultaneo de dos sectores "
        "para evitar condiciones de carrera (race conditions) durante la reubicacion.")
    add_mermaid_block(doc, DIAG_SEQ_UC04_ANAL,
        "Figura 5. Realizacion de UC-04 — Reubicar Pale entre Sectores.")

    # UC-09
    add_heading(doc, '3.2.2.5. Realizacion de UC-09: Autenticar Usuario (subflujo)', 3)
    add_body(doc,
        "UC-09 es un subflujo comun incluido por todos los CdU con actores humanos. Su analisis modela "
        "la verificacion de credenciales y la emision del token de sesion.")
    add_mermaid_block(doc, DIAG_SEQ_UC09_ANAL,
        "Figura 6. Realizacion de UC-09 — Autenticar Usuario.")

    # UC-10
    add_heading(doc, '3.2.2.6. Realizacion de UC-10: Buscar Pale por Referencia', 3)
    add_mermaid_block(doc, DIAG_SEQ_UC10_ANAL,
        "Figura 7. Realizacion de UC-10 — Buscar Pale por Referencia.")

    # UC-12
    add_heading(doc, '3.2.2.7. Realizacion de UC-12: Consultar Historial de Pale', 3)
    add_mermaid_block(doc, DIAG_SEQ_UC12_ANAL,
        "Figura 8. Realizacion de UC-12 — Consultar Historial de Pale.")

    add_separator(doc)

    # ---------------------------------------- 3.2.3
    add_heading(doc, '3.2.3. Analisis de Paquetes', 2)
    add_body(doc,
        "En esta fase de analisis se identifican los agrupamientos logicos de clases que evolucionaran "
        "hacia los paquetes de implementacion. Se detectan cuatro grandes areas de responsabilidad, "
        "respetando los principios de alta cohesion interna y bajo acoplamiento externo (Larman, 2004):")
    add_mermaid_block(doc, DIAG_PAQUETES_ANALISIS,
        "Figura 9. Diagrama de Paquetes de Analisis — Cuatro subsistemas logicos.")
    add_body(doc,
        "Esta segmentacion responde directamente a los requisitos suplementarios: el nucleo de "
        "inventario exige el nivel mas alto de proteccion transaccional (ACID — RS-07), la consulta "
        "y reporting puede tolerar lecturas diferidas (refresco cada 30 s — RS-01), el paquete de "
        "seguridad gestiona las fronteras de autenticacion (RS-03), y el de integracion maneja los "
        "actores sistema externos.",
        indent=True)

    add_separator(doc)
    doc.add_page_break()

    # ============================================================ 3.3 DISENO
    add_heading(doc, '3.3. Disciplina de Diseno', 1)

    # ---------------------------------------- 3.3.1
    add_heading(doc, '3.3.1. Decisiones Arquitectonicas y Justificacion', 2)
    add_body(doc,
        "Las decisiones de arquitectura no son elecciones arbitrarias: cada una responde a uno o "
        "varios de los requisitos suplementarios identificados en el Capitulo 2. La siguiente tabla "
        "documenta explicitamente esta trazabilidad:")

    add_table(doc,
        headers=['Decision Arquitectonica', 'Requisito No Funcional', 'Justificacion tecnica'],
        rows=[
            ['Arquitectura en tres capas (Presentacion > Aplicacion > Datos)',
             'RS-06 Mantenibilidad, RS-05 Portabilidad',
             'Desacopla la UI del negocio y del esquema de datos; permite modificar cada capa de forma '
             'independiente (Fowler, 2002)'],
            ['API REST sin estado (Node.js + Express)',
             'RS-05 Portabilidad, integracion Rollship',
             'Cualquier cliente (tablet, Rollship) consume la misma API; elimina dependencia de '
             'sesiones de servidor (Fielding, 2000)'],
            ['SPA React + Vite',
             'RS-04 Usabilidad mobile-first, RS-01 Rendimiento',
             'Elimina recargas de pagina completa; actualizacion parcial reduce el delay perceptible '
             'en pista logistica'],
            ['MySQL 8.0 InnoDB con ACID y Row-Level Locking',
             'RS-07 Integridad, RS-02 Disponibilidad',
             'InnoDB bloquea solo la fila afectada (no la tabla entera como MS Access); garantiza '
             'Atomicidad, Consistencia, Aislamiento y Durabilidad (Oracle Corporation, 2023)'],
            ['JWT para autenticacion stateless',
             'RS-03 Seguridad',
             'El token porta la identidad del usuario en cada peticion HTTP; el servidor no mantiene '
             'sesiones en memoria; compatible con SPA y con consumo externo desde Rollship'],
            ['Patron MVC en backend',
             'RS-06 Mantenibilidad, cohesion funcional',
             'Los controladores gestionan el flujo; los modelos encapsulan el acceso a datos; '
             'las rutas expresan el contrato REST (Gamma et al., 1994)'],
            ['Pool de conexiones MySQL2',
             'RS-01 Rendimiento, RS-02 Disponibilidad',
             'Reutiliza conexiones abiertas (limite configurable: 10 por defecto); elimina la '
             'latencia de apertura en cada peticion'],
            ['Indices estrategicos en movimientos',
             'RS-01 Rendimiento',
             'La tabla crece ~68.000 registros/ano; los indices sobre fecha_hora, tipo y pale_id '
             'garantizan las consultas de historial y estadisticas dentro del umbral sub-segundo'],
        ],
        col_widths=[5.5, 4.0, 9.0], small=True)

    # --- 3.3.1.1
    add_heading(doc, '3.3.1.1. Arquitectura en Tres Capas', 3)
    add_body(doc,
        "La arquitectura adoptada sigue el patron de tres capas (3-tier architecture) canonico para "
        "sistemas de informacion web (Fowler, 2002). La comunicacion entre la capa de presentacion "
        "y la capa de aplicacion se realiza exclusivamente mediante peticiones HTTP con payload JSON, "
        "siguiendo los principios REST de Fielding (2000): recursos nombrados por sustantivos "
        "(/api/pales, /api/sectores), verbos HTTP que expresan la operacion y respuestas sin estado.")
    add_mermaid_block(doc, DIAG_ARQUITECTURA,
        "Figura 10. Arquitectura en Tres Capas — Sistema WMS Almacen Santander.")

    add_separator(doc)

    # ---------------------------------------- 3.3.2
    add_heading(doc, '3.3.2. Clases de Diseno', 2)

    # --- 3.3.2.1
    add_heading(doc, '3.3.2.1. Transicion del Analisis al Diseno', 3)
    add_body(doc,
        "La transicion del analisis al diseno es el proceso por el que las clases de analisis, "
        "independientes de la tecnologia, se mapean a clases de implementacion concretas del stack "
        "seleccionado. La siguiente tabla documenta explicitamente este mapeo para los doce casos de uso:")

    add_table(doc,
        headers=['Clase de Analisis', 'Tipo', 'Clase / Funcion de Diseno', 'Fichero de implementacion'],
        rows=[
            ['Pale', 'Model', 'Queries SQL en paleController', 'backend/src/controllers/paleController.js'],
            ['Sector', 'Model', 'Queries SQL en sectorController', 'backend/src/controllers/sectorController.js'],
            ['Movimiento', 'Model', 'INSERT transaccional en cada controlador de escritura', 'incrustado en paleController.js'],
            ['Mercancia', 'Model', 'Tabla mercancia + LEFT JOIN en consultas de pales', 'backend/sql/schema.sql'],
            ['Usuario', 'Model', 'Tabla usuarios + logica JWT en authController', 'backend/src/controllers/authController.js'],
            ['Incidencia', 'Model', "Campo estado='incidencia' en tabla pales", 'schema.sql (sprint actual)'],
            ['IUPrincipalOperario', 'View', 'OperacionesPage + LayoutPage', 'frontend/src/pages/OperacionesPage.jsx, LayoutPage.jsx'],
            ['IUPrincipalAdministrador', 'View', 'DashboardPage', 'frontend/src/pages/DashboardPage.jsx'],
            ['IUFormEntradaPale', 'View', 'Formulario modal en OperacionesPage', 'frontend/src/pages/OperacionesPage.jsx'],
            ['IUCardSector', 'View', 'Componente AlmacenMap', 'frontend/src/components/Layout/AlmacenMap'],
            ['IUHistorialPale / IUBuscador', 'View', 'Tabla de historial y buscador en PalesPage', 'frontend/src/pages/PalesPage.jsx'],
            ['IUFormLogin', 'View', 'LoginPage', 'frontend/src/pages/LoginPage.jsx'],
            ['IUConectorRollship', 'View', 'Endpoints REST GET /api/sectores, GET /api/pales', 'backend/src/routes/sectorRoutes.js, paleRoutes.js'],
            ['ControladorEntradaPale', 'Controller', "entradaPale() + POST /api/pales/entrada", 'paleController.js, paleRoutes.js'],
            ['ControladorSalidaPale', 'Controller', "salidaPale() + POST /api/pales/:id/salida", 'paleController.js, paleRoutes.js'],
            ['ControladorLayout', 'Controller', "getLayout() + GET /api/sectores", 'sectorController.js, sectorRoutes.js'],
            ['ControladorReubicacion', 'Controller', "reubicarPale() + PUT /api/pales/:id/reubicar", 'paleController.js, paleRoutes.js'],
            ['ControladorEstadisticas', 'Controller', "getDashboard() + GET /api/stats", 'statsController.js, statsRoutes.js'],
            ['ControladorSaturacion', 'Controller', "Clausula SQL CASE WHEN interna a getLayout()", 'sectorController.js (lineas 15-22)'],
            ['ControladorAutenticacion', 'Controller', "login() + POST /api/auth/login", 'authController.js, authRoutes.js'],
            ['ControladorBusqueda', 'Controller', "listarPales() con parametro buscar + GET /api/pales?buscar=", 'paleController.js, paleRoutes.js'],
            ['ControladorHistorial', 'Controller', "detallePale() con historial + GET /api/pales/:id", 'paleController.js, paleRoutes.js'],
            ['ControladorUsuarios', 'Controller', 'Sprint futuro — UC-11 pendiente de implementacion', 'backend/src/controllers/userController.js'],
            ['ControladorIncidencia', 'Controller', 'Sprint futuro — UC-08 pendiente de implementacion', 'backend/src/controllers/incidenciaController.js'],
            ['ControladorMigracion', 'Controller', 'Sprint futuro — UC-06 pendiente de implementacion', 'backend/src/controllers/migracionController.js'],
        ],
        col_widths=[4.5, 2.0, 5.5, 6.5], small=True)

    # --- 3.3.2.2
    add_heading(doc, '3.3.2.2. Principios de Diseno Aplicados: Cohesion y Acoplamiento', 3)
    add_body(doc,
        "El diseno del sistema aplica los principios de alta cohesion funcional y bajo acoplamiento "
        "que constituyen, junto con el tamano adecuado, los tres pilares del diseno modular "
        "(Larman, 2004; Martin, 2003).",
        bold_parts=["alta cohesion funcional", "bajo acoplamiento"])

    add_body(doc,
        "Cohesion funcional: cada controlador del backend gestiona una responsabilidad unica y bien "
        "delimitada. paleController encapsula exclusivamente las operaciones sobre pales (entrada, "
        "salida, reubicacion, busqueda e historial); sectorController encapsula unicamente la lectura "
        "y actualizacion de sectores; authController gestiona unicamente la autenticacion. Ningun "
        "controlador mezcla responsabilidades de niveles distintos. Este diseno corresponde al nivel "
        "mas alto de cohesion segun la taxonomia de Constantine.",
        bold_parts=["Cohesion funcional:"])

    add_body(doc,
        "Bajo acoplamiento: la comunicacion entre la capa de presentacion y la capa de aplicacion "
        "se realiza exclusivamente a traves de la interfaz REST (JSON sobre HTTP). El frontend no "
        "conoce el esquema de base de datos; el backend no conoce el framework de UI. El unico punto "
        "de contacto explicito entre subsistemas es la API REST, que actua como interfaz contractual "
        "estable.",
        bold_parts=["Bajo acoplamiento:"])

    add_body(doc,
        "Principio de Responsabilidad Unica (SRP — SOLID): cada funcion de controlador realiza una "
        "unica operacion transaccional. La funcion entradaPale() registra exclusivamente la entrada "
        "de un pale; cualquier logica adicional (calculo de saturacion, notificacion de alertas) se "
        "delega en funciones auxiliares o en la propia capa de datos mediante SQL.",
        bold_parts=["Principio de Responsabilidad Unica (SRP — SOLID):"])

    add_body(doc,
        "Principio de Inversion de Dependencias (DIP — SOLID): los controladores dependen del pool "
        "de conexiones MySQL2 a traves de una interfaz de abstraccion (pool.query, pool.getConnection), "
        "sin acoplar el codigo de negocio al driver especifico. Si se cambia el motor de base de datos, "
        "solo se modifica config/database.js.",
        bold_parts=["Principio de Inversion de Dependencias (DIP — SOLID):"])

    # --- 3.3.2.3
    add_heading(doc, '3.3.2.3. Diagrama de Clases de Diseno — Capa Backend', 3)
    add_body(doc,
        "El siguiente diagrama refleja las clases de diseno concretas de la capa de aplicacion "
        "(Node.js/Express), sus metodos publicos y sus dependencias hacia la capa de datos:")
    add_mermaid_block(doc, DIAG_CLASES_BACKEND,
        "Figura 11. Diagrama de Clases de Diseno — Capa Backend (Node.js + Express).")

    # --- 3.3.2.4
    add_heading(doc, '3.3.2.4. Diagrama de Clases de Diseno — Capa Frontend', 3)
    add_mermaid_block(doc, DIAG_CLASES_FRONTEND,
        "Figura 12. Diagrama de Clases de Diseno — Capa Frontend (React + Vite).")

    add_separator(doc)

    # ---------------------------------------- 3.3.3
    add_heading(doc, '3.3.3. Diseno de los Casos de Uso — Diagramas de Secuencia', 2)
    add_body(doc,
        "Los diagramas de secuencia de diseno muestran la interaccion entre los componentes reales "
        "de implementacion, con los nombres de metodos y rutas exactas del codigo desarrollado. "
        "Permiten verificar la coherencia entre el diseno y la implementacion descrita en el Capitulo 4.")

    # UC-01 diseno
    add_heading(doc, '3.3.3.1. UC-01: Registrar Entrada de Pale (Diseno)', 3)
    add_mermaid_block(doc, DIAG_SEQ_UC01_DIS,
        "Figura 13. Secuencia de Diseno — UC-01 Registrar Entrada de Pale.")

    # UC-03 diseno
    add_heading(doc, '3.3.3.2. UC-03: Consultar Layout — Renderizar Mapa (Diseno)', 3)
    add_mermaid_block(doc, DIAG_SEQ_UC03_DIS,
        "Figura 14. Secuencia de Diseno — UC-03 Consultar Layout Interactivo.")

    # UC-04 diseno
    add_heading(doc, '3.3.3.3. UC-04: Reubicar Pale entre Sectores (Diseno)', 3)
    add_mermaid_block(doc, DIAG_SEQ_UC04_DIS,
        "Figura 15. Secuencia de Diseno — UC-04 Reubicar Pale entre Sectores.")

    # UC-09 diseno
    add_heading(doc, '3.3.3.4. UC-09: Autenticar Usuario (Diseno)', 3)
    add_mermaid_block(doc, DIAG_SEQ_UC09_DIS,
        "Figura 16. Secuencia de Diseno — UC-09 Autenticar Usuario (bcrypt + JWT).")

    # UC-10 diseno
    add_heading(doc, '3.3.3.5. UC-10: Buscar Pale por Referencia (Diseno)', 3)
    add_mermaid_block(doc, DIAG_SEQ_UC10_DIS,
        "Figura 17. Secuencia de Diseno — UC-10 Buscar Pale por Referencia.")

    # UC-12 diseno
    add_heading(doc, '3.3.3.6. UC-12: Consultar Historial de Pale (Diseno)', 3)
    add_mermaid_block(doc, DIAG_SEQ_UC12_DIS,
        "Figura 18. Secuencia de Diseno — UC-12 Consultar Historial de Pale.")

    add_separator(doc)

    # ---------------------------------------- 3.3.4
    add_heading(doc, '3.3.4. Diagrama de Despliegue', 2)
    add_body(doc,
        "El diagrama de despliegue muestra la distribucion fisica de los componentes de software "
        "sobre los nodos de hardware del entorno de ejecucion (Larman, 2004):")
    add_mermaid_block(doc, DIAG_DESPLIEGUE,
        "Figura 19. Diagrama de Despliegue — Sistema WMS Almacen Santander.")

    add_body(doc,
        "Notas de despliegue:",
        bold_parts=["Notas de despliegue:"])
    add_bullet(doc,
        "El servidor de aplicacion y el de base de datos pueden cohabitar en el mismo equipo fisico "
        "en la fase inicial, separandose cuando el volumen de operaciones lo justifique.")
    add_bullet(doc,
        "La comunicacion entre la SPA y la API se realiza sobre HTTP (HTTPS en produccion). "
        "El token JWT firmado con JWT_SECRET caduca cada 8 horas por defecto, forzando reautenticacion "
        "al inicio de cada turno.")
    add_bullet(doc,
        "El Motor Rollship consume la API REST mediante peticiones GET autenticadas con su propio token, "
        "sin acceder directamente a la base de datos. Esto preserva el desacoplamiento y facilita la "
        "integracion futura de nuevos almacenes.")

    add_separator(doc)

    # ---------------------------------------- 3.3.5
    add_heading(doc, '3.3.5. Diagrama de Paquetes', 2)
    add_body(doc,
        "El diagrama de paquetes muestra la organizacion modular del codigo fuente y las dependencias "
        "entre subsistemas (Larman, 2004):")
    add_mermaid_block(doc, DIAG_PAQUETES,
        "Figura 20. Diagrama de Paquetes — Organizacion modular del codigo fuente.")
    add_body(doc,
        "La arquitectura de paquetes garantiza una alta cohesion interna (cada paquete agrupa clases "
        "del mismo nivel de abstraccion) y un bajo acoplamiento externo (los paquetes se comunican "
        "unicamente a traves de interfaces bien definidas: la API REST entre frontend y backend, y "
        "el pool MySQL2 entre controladores y base de datos). Este diseno facilita tanto el "
        "mantenimiento correctivo como la incorporacion futura de nuevos modulos, conforme al "
        "principio abierto/cerrado de SOLID (Martin, 2003).",
        indent=True)

    add_separator(doc)

    # ---------------------------------------- 3.3.6
    add_heading(doc, '3.3.6. Modelo de Datos', 2)

    # --- 3.3.6.1
    add_heading(doc, '3.3.6.1. Modelo Logico — Diagrama Entidad-Relacion', 3)
    add_body(doc,
        "El Diagrama Entidad-Relacion (DER) representa la estructura conceptual de los datos "
        "persistidos, derivada directamente del Modelo del Dominio del Capitulo 2 (Date, 2004):")
    add_mermaid_block(doc, DIAG_ER,
        "Figura 21. Diagrama Entidad-Relacion — Modelo logico de la base de datos.")

    # --- 3.3.6.2
    add_heading(doc, '3.3.6.2. Modelo Fisico — Decisiones de Implementacion MySQL', 3)
    add_body(doc,
        "El modelo fisico concreta el modelo logico en MySQL 8.0 con motor InnoDB. Las decisiones "
        "fisicas mas relevantes, cada una justificada en los requisitos suplementarios:")

    add_body(doc,
        "Motor InnoDB (RS-07 Integridad): es el unico motor MySQL que implementa bloqueo a nivel "
        "de fila (row-level locking) y soporte completo para transacciones ACID (Oracle Corporation, "
        "2023). La sentencia SELECT ... FOR UPDATE dentro de beginTransaction() adquiere un bloqueo "
        "de escritura exclusivo sobre la fila del sector antes de comprobar la capacidad disponible, "
        "garantizando que dos transacciones concurrentes no puedan ubicar simultaneamente pales en "
        "un sector ya lleno.",
        bold_parts=["Motor InnoDB (RS-07 Integridad):"])

    add_body(doc,
        "Juego de caracteres utf8mb4 (RS-04 Usabilidad): soporta el rango completo Unicode, "
        "incluyendo caracteres especiales en nombres de mercancia y notas de operarios, evitando "
        "truncaciones o errores de codificacion.",
        bold_parts=["Juego de caracteres utf8mb4 (RS-04 Usabilidad):"])

    add_body(doc,
        "Indices estrategicos en movimientos (RS-01 Rendimiento): la tabla de movimientos crece "
        "aproximadamente 68.000 registros por ano. Se definen tres indices explicitos: "
        "idx_movimientos_fecha sobre fecha_hora para filtros de estadisticas por periodo (UC-05); "
        "idx_movimientos_tipo sobre tipo para conteos por tipo de operacion (UC-05); "
        "idx_movimientos_pale sobre pale_id para la recuperacion del historial de un pale (UC-12).",
        bold_parts=["Indices estrategicos en movimientos (RS-01 Rendimiento):"])

    add_body(doc,
        "Constraint CHECK en sectores (RS-07 Integridad): CHECK (ocupacion_actual >= 0) actua como "
        "salvaguarda de integridad a nivel de base de datos. Junto con GREATEST(0, ocupacion - 1) en "
        "las consultas de decremento, garantiza que ningun error de aplicacion pueda dejar la ocupacion "
        "en un valor negativo.",
        bold_parts=["Constraint CHECK en sectores (RS-07 Integridad):"])

    add_body(doc,
        "sector_id NULL en pales (coherencia con el Modelo del Dominio): un pale expedido no tiene "
        "sector asignado. Permitir NULL en sector_id mantiene la semantica correcta del Diagrama de "
        "Estados del Capitulo 2: la ausencia de sector expresa el estado de expedicion sin requerir "
        "un sector ficticio.",
        bold_parts=["sector_id NULL en pales (coherencia con el Modelo del Dominio):"])

    add_separator(doc)
    doc.add_page_break()

    # ============================================================ 3.4 TRAZABILIDAD
    add_heading(doc, '3.4. Trazabilidad y Coherencia del Capitulo', 1)
    add_body(doc,
        "La siguiente tabla verifica que cada elemento de diseno tiene su origen documentado en los "
        "capitulos precedentes y su correspondencia prevista en la implementacion del Capitulo 4:")

    add_table(doc,
        headers=['Requisito / CdU (Cap. 2)', 'Clase de Analisis (Sec. 3.2)',
                 'Decision de Diseno (Sec. 3.3.1)', 'Componente de Implementacion (Cap. 4)'],
        rows=[
            ['UC-01 Entrada pale',
             'ControladorEntradaPale, Pale, Sector, Movimiento',
             'ACID InnoDB, FOR UPDATE, beginTransaction()',
             'paleController.entradaPale() — POST /api/pales/entrada'],
            ['UC-02 Salida pale',
             'ControladorSalidaPale, Pale, Sector',
             'Transaccion ACID, GREATEST(0, ocupacion-1)',
             'paleController.salidaPale() — POST /api/pales/:id/salida'],
            ['UC-03 Layout',
             'ControladorLayout, Sector, IUCardSector',
             'REST GET, refresco 30 s, CASE SQL semaforo',
             'sectorController.getLayout() — AlmacenMap'],
            ['UC-04 Reubicacion',
             'ControladorReubicacion, Pale, Sector (x2)',
             'Bloqueo doble deterministico para evitar deadlock',
             'paleController.reubicarPale() — PUT /api/pales/:id/reubicar'],
            ['UC-05 Estadisticas',
             'ControladorEstadisticas, Movimiento, Sector',
             'Agregacion SQL, indice idx_movimientos_fecha',
             'statsController.getDashboard() — GET /api/stats'],
            ['UC-06 Migracion ETL',
             'ControladorMigracion, IUVolcadoAccess',
             'Tabla migracion_access (JSON bruto + flag procesado)',
             'Sprint futuro'],
            ['UC-07 Saturacion (subflujo)',
             'ControladorSaturacion (interno)',
             'CASE SQL incrustado en getLayout()',
             'sectorController.js lineas 15-22'],
            ['UC-08 Incidencia',
             'ControladorIncidencia, Incidencia, Pale',
             "Estado 'incidencia' en ENUM pales.estado, bloqueo de operaciones",
             'Sprint futuro — incidenciaController.js'],
            ['UC-09 Autenticacion (subflujo)',
             'ControladorAutenticacion, Usuario',
             'JWT stateless, bcryptjs, expiracion 8h',
             'authController.login() — POST /api/auth/login'],
            ['UC-10 Busqueda',
             'ControladorBusqueda, Pale',
             'Query LIKE con paginacion, JOIN sectores y mercancia',
             'paleController.listarPales() — GET /api/pales?buscar='],
            ['UC-11 Usuarios',
             'ControladorUsuarios, Usuario',
             'CRUD usuarios, constraint email UNIQUE, hash bcrypt',
             'Sprint futuro — userController.js'],
            ['UC-12 Historial',
             'ControladorHistorial, Movimiento, Pale',
             'JOIN de cuatro tablas, indice idx_movimientos_pale',
             'paleController.detallePale() — GET /api/pales/:id'],
            ['RS-01 Rendimiento (<1,5 s)',
             'ControladorLayout',
             'Indices en sectores, consulta unica con CASE',
             'getLayout() — unica consulta SELECT'],
            ['RS-02 Disponibilidad (99,5 %)',
             '—',
             'Pool de conexiones connectionLimit:10',
             'config/database.js'],
            ['RS-03 Seguridad / Roles',
             'ControladorAutenticacion, AuthMiddleware',
             'JWT, soloAdmin() middleware, sesion expira en 8h',
             'middleware/auth.js — verificarToken — soloAdmin'],
            ['RS-04 Usabilidad / mobile-first',
             'IUCardSector, IUPrincipalOperario',
             'SPA React, componentes tactiles >= 60 px, sin recargas',
             'AlmacenMap, OperacionesPage'],
            ['RS-05 Portabilidad',
             'IUConectorRollship',
             'API REST JSON sin estado (Fielding, 2000)',
             'Endpoints GET /api/sectores, GET /api/pales'],
            ['RS-06 Mantenibilidad (MVC)',
             'Separacion Controller / Model / View',
             'Patron MVC explicito, cohesion funcional por modulo',
             'Estructura routes/ — controllers/ — config/'],
            ['RS-07 Integridad (ACID)',
             'Sector.bloquearYLeer()',
             'FOR UPDATE + beginTransaction() / commit() / rollback()',
             'Pool InnoDB MySQL2 en todos los controladores de escritura'],
        ],
        col_widths=[3.5, 4.5, 4.5, 6.0], small=True)

    add_separator(doc)
    doc.add_page_break()

    # ============================================================ 3.5 REFERENCIAS
    add_heading(doc, '3.5. Referencias Bibliograficas del Capitulo', 1)
    add_body(doc,
        "Se incorporan a la bibliografia global del TFG, complementando las citadas en los capitulos "
        "anteriores.", italic=True)

    refs = [
        "Date, C. J. (2004). Introduccion a los sistemas de bases de datos (7.a ed.). Pearson Educacion.",
        "Fielding, R. T. (2000). Architectural styles and the design of network-based software architectures "
        "[Tesis doctoral, University of California, Irvine]. https://www.ics.uci.edu/~fielding/pubs/dissertation/rest_arch_style.htm",
        "Fowler, M. (2002). Patterns of enterprise application architecture. Addison-Wesley.",
        "Gamma, E., Helm, R., Johnson, R., & Vlissides, J. (1994). Design patterns: Elements of reusable "
        "object-oriented software. Addison-Wesley.",
        "Larman, C. (2004). Applying UML and patterns: An introduction to object-oriented analysis and "
        "design and iterative development (3.a ed.). Prentice Hall.",
        "Martin, R. C. (2003). Agile software development: Principles, patterns, and practices. Prentice Hall.",
        "Oracle Corporation. (2023). MySQL 8.0 Reference Manual: InnoDB transaction and locking information. "
        "https://dev.mysql.com/doc/refman/8.0/en/innodb-locking.html",
        "Pressman, R. S., & Maxim, B. R. (2020). Software engineering: A practitioner's approach (9.a ed.). "
        "McGraw-Hill Education.",
        "Sommerville, I. (2015). Software engineering (10.a ed.). Pearson.",
    ]
    for ref in refs:
        p = doc.add_paragraph()
        p.paragraph_format.left_indent = Cm(1.25)
        p.paragraph_format.first_line_indent = Cm(-1.25)
        p.paragraph_format.space_after = Pt(6)
        r = p.add_run(ref)
        r.font.name = 'Times New Roman'; r.font.size = Pt(11)

    return doc


if __name__ == '__main__':
    output = (r"C:\Users\PORTATIL_MSI\Desktop\TFG\Archivos importantes--entregas"
              r"\Capitulo3_Mario_Del_Rio_FINAL.docx")
    print("Generando Capitulo 3 — Analisis y Diseno...")
    doc = build_document()
    doc.save(output)
    print("Documento guardado en:")
    print(output)
