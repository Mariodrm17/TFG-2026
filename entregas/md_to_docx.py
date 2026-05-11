"""
Convierte entrega_capitulo3.md a Capitulo3_WMS.docx con formato profesional.
Mantiene encabezados, tablas, bloques de código (diagramas) y párrafos.
"""

import re
from docx import Document
from docx.shared import Pt, RGBColor, Inches, Cm
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml.ns import qn
from docx.oxml import OxmlElement
import copy

MD_PATH   = r"C:\Users\PORTATIL_MSI\Desktop\TFG\TFG-2026\entregas\entrega_capitulo3.md"
DOCX_PATH = r"C:\Users\PORTATIL_MSI\Desktop\TFG\TFG-2026\entregas\Capitulo3_WMS.docx"

# ── helpers ────────────────────────────────────────────────────────────────────

def set_cell_bg(cell, hex_color):
    tc   = cell._tc
    tcPr = tc.get_or_add_tcPr()
    shd  = OxmlElement('w:shd')
    shd.set(qn('w:val'),   'clear')
    shd.set(qn('w:color'), 'auto')
    shd.set(qn('w:fill'),  hex_color)
    tcPr.append(shd)

def cell_borders(cell):
    tc   = cell._tc
    tcPr = tc.get_or_add_tcPr()
    borders = OxmlElement('w:tcBorders')
    for side in ('top', 'left', 'bottom', 'right'):
        b = OxmlElement(f'w:{side}')
        b.set(qn('w:val'),   'single')
        b.set(qn('w:sz'),    '4')
        b.set(qn('w:space'), '0')
        b.set(qn('w:color'), 'BFBFBF')
        borders.append(b)
    tcPr.append(borders)

def add_run_with_bold_inline(para, text):
    """Renderiza **negrita** inline dentro de un párrafo."""
    parts = re.split(r'(\*\*[^*]+\*\*)', text)
    for part in parts:
        if part.startswith('**') and part.endswith('**'):
            run = para.add_run(part[2:-2])
            run.bold = True
        else:
            # Italic *texto*
            subparts = re.split(r'(\*[^*]+\*)', part)
            for sp in subparts:
                if sp.startswith('*') and sp.endswith('*') and len(sp) > 2:
                    r = para.add_run(sp[1:-1])
                    r.italic = True
                else:
                    # Inline code `texto`
                    codes = re.split(r'(`[^`]+`)', sp)
                    for cp in codes:
                        if cp.startswith('`') and cp.endswith('`') and len(cp) > 2:
                            r = para.add_run(cp[1:-1])
                            r.font.name = 'Courier New'
                            r.font.size = Pt(9)
                        else:
                            para.add_run(cp)

def style_table_header_row(row, doc):
    for cell in row.cells:
        set_cell_bg(cell, '1F4E79')   # azul oscuro profesional
        cell_borders(cell)
        for para in cell.paragraphs:
            para.alignment = WD_ALIGN_PARAGRAPH.CENTER
            for run in para.runs:
                run.bold = True
                run.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)
                run.font.size = Pt(9)

def style_table_body_row(row, i):
    bg = 'EEF3FA' if i % 2 == 0 else 'FFFFFF'
    for cell in row.cells:
        set_cell_bg(cell, bg)
        cell_borders(cell)
        for para in cell.paragraphs:
            for run in para.runs:
                run.font.size = Pt(9)

# ── parser / renderer ──────────────────────────────────────────────────────────

def parse_and_write(md_path, docx_path):
    doc = Document()

    # Márgenes
    for section in doc.sections:
        section.top_margin    = Cm(2.5)
        section.bottom_margin = Cm(2.5)
        section.left_margin   = Cm(3.0)
        section.right_margin  = Cm(2.5)

    # Fuente por defecto
    doc.styles['Normal'].font.name = 'Calibri'
    doc.styles['Normal'].font.size = Pt(11)
    doc.styles['Normal'].paragraph_format.space_after = Pt(6)

    with open(md_path, encoding='utf-8') as f:
        lines = f.readlines()

    i = 0
    while i < len(lines):
        line = lines[i].rstrip('\n')

        # ── Encabezados ──────────────────────────────────────────────────────
        if line.startswith('#'):
            level = len(line) - len(line.lstrip('#'))
            text  = line.lstrip('#').strip()
            style_map = {1: 'Heading 1', 2: 'Heading 2', 3: 'Heading 3',
                         4: 'Heading 4', 5: 'Heading 5'}
            p = doc.add_paragraph(style=style_map.get(level, 'Heading 4'))
            run = p.add_run(text)
            run.font.size  = Pt([0, 16, 14, 12, 11, 10][min(level, 5)])
            run.font.color.rgb = RGBColor(0x1F, 0x4E, 0x79)
            run.bold = True
            i += 1
            continue

        # ── Línea horizontal ─────────────────────────────────────────────────
        if re.match(r'^-{3,}$', line.strip()):
            p = doc.add_paragraph()
            pPr = p._p.get_or_add_pPr()
            pb  = OxmlElement('w:pBdr')
            bot = OxmlElement('w:bottom')
            bot.set(qn('w:val'),   'single')
            bot.set(qn('w:sz'),    '6')
            bot.set(qn('w:color'), '1F4E79')
            pb.append(bot)
            pPr.append(pb)
            i += 1
            continue

        # ── Bloque de código (mermaid u otro) ────────────────────────────────
        if line.strip().startswith('```'):
            lang = line.strip()[3:].strip()
            code_lines = []
            i += 1
            while i < len(lines) and not lines[i].strip().startswith('```'):
                code_lines.append(lines[i].rstrip('\n'))
                i += 1
            i += 1  # saltar la línea de cierre ```

            if lang == 'mermaid':
                label = '[ Diagrama Mermaid — insertar imagen al maquetar ]'
                p = doc.add_paragraph()
                p.alignment = WD_ALIGN_PARAGRAPH.CENTER
                run = p.add_run(label)
                run.italic = True
                run.font.color.rgb = RGBColor(0x70, 0x70, 0x70)
                run.font.size = Pt(9)
                # Incluir el código en un bloque plegado
                p2 = doc.add_paragraph()
                p2.paragraph_format.left_indent = Inches(0.5)
                for cl in code_lines:
                    r = p2.add_run(cl + '\n')
                    r.font.name = 'Courier New'
                    r.font.size = Pt(7.5)
                    r.font.color.rgb = RGBColor(0x36, 0x36, 0x36)
            else:
                for cl in code_lines:
                    p = doc.add_paragraph()
                    p.paragraph_format.left_indent = Inches(0.4)
                    p.paragraph_format.space_after = Pt(0)
                    r = p.add_run(cl)
                    r.font.name = 'Courier New'
                    r.font.size = Pt(8.5)
            continue

        # ── Tabla Markdown ────────────────────────────────────────────────────
        if line.startswith('|'):
            table_lines = []
            while i < len(lines) and lines[i].startswith('|'):
                table_lines.append(lines[i].rstrip('\n'))
                i += 1
            # Filtrar la fila separadora (---|---)
            rows_raw = [r for r in table_lines
                        if not re.match(r'^\|[-| :]+\|$', r.strip())]
            if not rows_raw:
                continue

            def split_row(r):
                return [c.strip() for c in r.strip('|').split('|')]

            parsed = [split_row(r) for r in rows_raw]
            cols   = max(len(r) for r in parsed)
            tbl    = doc.add_table(rows=len(parsed), cols=cols)
            tbl.style = 'Table Grid'
            tbl.alignment = WD_TABLE_ALIGNMENT.CENTER

            for ri, row_data in enumerate(parsed):
                row_obj = tbl.rows[ri]
                for ci, cell_text in enumerate(row_data):
                    if ci >= cols:
                        break
                    cell = row_obj.cells[ci]
                    cell.text = ''
                    p = cell.paragraphs[0]
                    add_run_with_bold_inline(p, cell_text)
                    for run in p.runs:
                        run.font.size = Pt(9)
                if ri == 0:
                    style_table_header_row(row_obj, doc)
                else:
                    style_table_body_row(row_obj, ri - 1)

            doc.add_paragraph()
            continue

        # ── Lista con bullet (- o *) ──────────────────────────────────────────
        if re.match(r'^(\s*)[-*]\s+', line):
            indent = len(line) - len(line.lstrip())
            text   = re.sub(r'^(\s*)[-*]\s+', '', line)
            p      = doc.add_paragraph(style='List Bullet')
            p.paragraph_format.left_indent = Inches(0.25 + indent * 0.02)
            p.paragraph_format.space_after = Pt(2)
            add_run_with_bold_inline(p, text)
            i += 1
            continue

        # ── Lista numerada ────────────────────────────────────────────────────
        if re.match(r'^\d+\.\s+', line):
            text = re.sub(r'^\d+\.\s+', '', line)
            p    = doc.add_paragraph(style='List Number')
            p.paragraph_format.space_after = Pt(2)
            add_run_with_bold_inline(p, text)
            i += 1
            continue

        # ── Blockquote ────────────────────────────────────────────────────────
        if line.startswith('>'):
            text = line.lstrip('> ').strip()
            p    = doc.add_paragraph()
            p.paragraph_format.left_indent  = Inches(0.4)
            p.paragraph_format.right_indent = Inches(0.4)
            r = p.add_run(text)
            r.italic = True
            r.font.color.rgb = RGBColor(0x50, 0x50, 0x50)
            r.font.size = Pt(10)
            i += 1
            continue

        # ── Línea vacía ───────────────────────────────────────────────────────
        if line.strip() == '':
            i += 1
            continue

        # ── Párrafo normal ────────────────────────────────────────────────────
        p = doc.add_paragraph()
        p.paragraph_format.alignment  = WD_ALIGN_PARAGRAPH.JUSTIFY
        p.paragraph_format.space_after = Pt(6)
        add_run_with_bold_inline(p, line)
        i += 1

    doc.save(docx_path)
    print(f"OK - Guardado en: {docx_path}")

if __name__ == '__main__':
    parse_and_write(MD_PATH, DOCX_PATH)
