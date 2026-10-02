#!/usr/bin/env python3
"""
PDF Creativo e Intuitivo - Informe Estratégico Apps de Gestión e IA
Conserva 100% del contenido original, con diseño moderno, visual y fácil de escanear.
"""

import argparse
import os
from pathlib import Path

from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm, cm
from reportlab.lib.colors import Color, HexColor, white, black
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import Paragraph
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY

# ──────────────────────────────────────────────
# Fuentes (Noto Sans OFL, en fonts/ junto a este script)
# ──────────────────────────────────────────────
_FONTS = Path(__file__).resolve().parent / "fonts"
pdfmetrics.registerFont(TTFont('Noto', str(_FONTS / 'NotoSans-Regular.ttf')))
pdfmetrics.registerFont(TTFont('Noto-Bold', str(_FONTS / 'NotoSans-Bold.ttf')))
pdfmetrics.registerFont(TTFont('Noto-SemiBold', str(_FONTS / 'NotoSans-SemiBold.ttf')))
pdfmetrics.registerFont(TTFont('Noto-Light', str(_FONTS / 'NotoSans-Light.ttf')))
pdfmetrics.registerFont(TTFont('Noto-Medium', str(_FONTS / 'NotoSans-Medium.ttf')))

# ──────────────────────────────────────────────
# Paleta de colores moderna (IA / Tech)
# ──────────────────────────────────────────────
PRIMARY      = HexColor('#0B1D36')      # Azul profundo
PRIMARY_LIGHT= HexColor('#1A3A5C')
ACCENT       = HexColor('#00B4D8')      # Cian AI
ACCENT_DARK  = HexColor('#0077B6')
SUCCESS      = HexColor('#2EC4B6')      # Verde-teal
WARNING      = HexColor('#FF9F1C')
SOFT_BG      = HexColor('#F7F9FC')
CARD_BG      = HexColor('#FFFFFF')
TEXT_DARK    = HexColor('#1A1A2E')
TEXT_MUTED   = HexColor('#5A6A7A')
BORDER       = HexColor('#E2E8F0')
B2B_COLOR    = HexColor('#3D5A80')
B2C_COLOR    = HexColor('#2A9D8F')
HIGHLIGHT    = HexColor('#E0F7FA')

PAGE_W, PAGE_H = A4
MARGIN = 18 * mm

def draw_rounded_rect(c, x, y, w, h, radius=8, fill_color=None, stroke_color=None, stroke_width=1):
    """Dibuja un rectángulo redondeado"""
    c.saveState()
    if fill_color:
        c.setFillColor(fill_color)
    if stroke_color:
        c.setStrokeColor(stroke_color)
        c.setLineWidth(stroke_width)
    p = c.beginPath()
    p.moveTo(x + radius, y)
    p.lineTo(x + w - radius, y)
    p.arcTo(x + w - 2*radius, y, x + w, y + 2*radius, -90, 90)
    p.lineTo(x + w, y + h - radius)
    p.arcTo(x + w - 2*radius, y + h - 2*radius, x + w, y + h, 0, 90)
    p.lineTo(x + radius, y + h)
    p.arcTo(x, y + h - 2*radius, x + 2*radius, y + h, 90, 90)
    p.lineTo(x, y + radius)
    p.arcTo(x, y, x + 2*radius, y + 2*radius, 180, 90)
    p.close()
    if fill_color and stroke_color:
        c.drawPath(p, fill=1, stroke=1)
    elif fill_color:
        c.drawPath(p, fill=1, stroke=0)
    else:
        c.drawPath(p, fill=0, stroke=1)
    c.restoreState()

def draw_header_bar(c, title, subtitle=None):
    """Barra superior moderna"""
    c.setFillColor(PRIMARY)
    c.rect(0, PAGE_H - 42*mm, PAGE_W, 42*mm, fill=1, stroke=0)
    # Acento decorativo
    c.setFillColor(ACCENT)
    c.rect(0, PAGE_H - 42*mm, PAGE_W, 2.5*mm, fill=1, stroke=0)
    
    c.setFillColor(white)
    c.setFont('Noto-Bold', 16)
    c.drawString(MARGIN, PAGE_H - 18*mm, title)
    
    if subtitle:
        c.setFont('Noto', 9)
        c.setFillColor(HexColor('#A0C4E8'))
        c.drawString(MARGIN, PAGE_H - 26*mm, subtitle)
    
    # Meta info
    c.setFont('Noto', 7.5)
    c.setFillColor(HexColor('#8BA3C7'))
    c.drawString(MARGIN, PAGE_H - 34*mm, "Área: Ingeniería de Software e IA  ·  Documento: Propuesta de Negocios y Arquitectura  ·  Fecha: Octubre 2026")

def draw_footer(c, page_num, total=3):
    c.setFillColor(TEXT_MUTED)
    c.setFont('Noto', 7)
    c.drawString(MARGIN, 10*mm, "Gestión de Compras e Inventario Inteligente — Informe Técnico")
    c.drawRightString(PAGE_W - MARGIN, 10*mm, f"Página {page_num} de {total}")
    # Línea sutil
    c.setStrokeColor(BORDER)
    c.setLineWidth(0.5)
    c.line(MARGIN, 14*mm, PAGE_W - MARGIN, 14*mm)

def draw_section_title(c, x, y, number, title, color=ACCENT, max_width=None):
    """Título de sección con número en círculo. Soporta wrap si es muy largo."""
    # Círculo
    c.setFillColor(color)
    c.circle(x + 5*mm, y + 1.5*mm, 5*mm, fill=1, stroke=0)
    c.setFillColor(white)
    c.setFont('Noto-Bold', 9)
    c.drawCentredString(x + 5*mm, y - 0.5*mm, str(number))
    
    c.setFillColor(TEXT_DARK)
    c.setFont('Noto-Bold', 10)
    
    if max_width is None:
        max_width = PAGE_W - MARGIN - x - 15*mm
    
    # Wrap title if needed
    words = title.split()
    lines = []
    current = ""
    for w in words:
        test = current + " " + w if current else w
        if c.stringWidth(test, 'Noto-Bold', 10) <= max_width:
            current = test
        else:
            if current:
                lines.append(current)
            current = w
    if current:
        lines.append(current)
    
    ty = y
    for i, line in enumerate(lines):
        c.drawString(x + 13*mm, ty, line)
        ty -= 4.2*mm
    
    return ty - 3*mm

def wrap_text(c, text, font, size, max_width):
    """Simple text wrapping"""
    c.setFont(font, size)
    words = text.split()
    lines = []
    current = ""
    for w in words:
        test = current + " " + w if current else w
        if c.stringWidth(test, font, size) <= max_width:
            current = test
        else:
            if current:
                lines.append(current)
            current = w
    if current:
        lines.append(current)
    return lines

# ══════════════════════════════════════════════
# PÁGINA 1
# ══════════════════════════════════════════════
def create_page1(c):
    draw_header_bar(
        c,
        "Lanzamiento & Modelado de Software e Inteligencia Artificial",
        "Plan Estratégico, Análisis de Entorno y Viabilidad Financiera de Soluciones Mobile B2B y B2C"
    )
    
    y = PAGE_H - 52*mm
    
    # ─── 1. APP B2B ───
    y = draw_section_title(c, MARGIN, y, 1, "APP B2B: GESTIÓN INTELIGENTE DE COMPRAS EN DISTRIBUCIÓN MAYORISTA DE ROPA EXCLUSIVA", B2B_COLOR)
    
    # Texto introductorio
    intro = "El mercado de distribución textil de alta gama enfrenta ineficiencias críticas vinculadas a la sobreproducción, estimaciones imprecisas de demanda y stock inmovilizado. Esta plataforma móvil automatiza la cadena de suministros B2B combinando algoritmos predictivos e interfaces de alta velocidad."
    lines = wrap_text(c, intro, 'Noto', 8.5, PAGE_W - 2*MARGIN)
    c.setFillColor(TEXT_MUTED)
    for line in lines:
        c.drawString(MARGIN, y, line)
        y -= 4*mm
    y -= 3*mm
    
    # Dos cards B2B
    card_w = (PAGE_W - 2*MARGIN - 6*mm) / 2
    card_h = 32*mm
    
    # Card 1 - Producción & Demanda
    draw_rounded_rect(c, MARGIN, y - card_h, card_w, card_h, radius=6, fill_color=CARD_BG, stroke_color=BORDER, stroke_width=0.8)
    # Barra de color izquierda
    c.setFillColor(B2B_COLOR)
    c.rect(MARGIN, y - card_h, 2.5*mm, card_h, fill=1, stroke=0)
    
    c.setFillColor(B2B_COLOR)
    c.setFont('Noto-Bold', 8)
    c.drawString(MARGIN + 6*mm, y - 6*mm, "PRODUCCIÓN & DEMANDA")
    c.setFillColor(TEXT_DARK)
    c.setFont('Noto-SemiBold', 9)
    c.drawString(MARGIN + 6*mm, y - 11*mm, "Computer Vision + Trend Analytics")
    
    desc1 = "Monitoreo continuo en redes y pasarelas mediante PLN y visión por computadora para predecir tendencias de alta costura antes del pedido mayorista."
    lines = wrap_text(c, desc1, 'Noto', 7.5, card_w - 12*mm)
    c.setFillColor(TEXT_MUTED)
    ty = y - 16*mm
    for line in lines:
        c.drawString(MARGIN + 6*mm, ty, line)
        ty -= 3.5*mm
    
    # Card 2 - Optimización Stock
    x2 = MARGIN + card_w + 6*mm
    draw_rounded_rect(c, x2, y - card_h, card_w, card_h, radius=6, fill_color=CARD_BG, stroke_color=BORDER, stroke_width=0.8)
    c.setFillColor(SUCCESS)
    c.rect(x2, y - card_h, 2.5*mm, card_h, fill=1, stroke=0)
    
    c.setFillColor(SUCCESS)
    c.setFont('Noto-Bold', 8)
    c.drawString(x2 + 6*mm, y - 6*mm, "OPTIMIZACIÓN DE STOCK")
    c.setFillColor(TEXT_DARK)
    c.setFont('Noto-SemiBold', 9)
    c.drawString(x2 + 6*mm, y - 11*mm, "Clustering de Inventario")
    
    desc2 = "Agrupamiento algorítmico por curva de tallas y velocidad de rotación regional, reduciendo el stock sobrante (deadstock) en un 35%."
    lines = wrap_text(c, desc2, 'Noto', 7.5, card_w - 12*mm)
    c.setFillColor(TEXT_MUTED)
    ty = y - 16*mm
    for line in lines:
        c.drawString(x2 + 6*mm, ty, line)
        ty -= 3.5*mm
    
    # Badge 35%
    c.setFillColor(SUCCESS)
    c.roundRect(x2 + card_w - 22*mm, y - card_h + 3*mm, 18*mm, 7*mm, 3, fill=1, stroke=0)
    c.setFillColor(white)
    c.setFont('Noto-Bold', 8)
    c.drawCentredString(x2 + card_w - 13*mm, y - card_h + 5*mm, "-35%")
    
    y -= card_h + 8*mm
    
    # ─── 2. OPORTUNIDAD B2C ───
    y = draw_section_title(c, MARGIN, y, 2, "OPORTUNIDAD B2C: APP FAMILIAR DE INVENTARIO DOMÉSTICO (SMARTPANTRY AI)", B2C_COLOR)
    
    intro2 = "Identificamos una brecha clave en el consumo familiar: el desperdicio continuo de alimentos por falta de visibilidad en despensas, duplicación de compras e ineficiencia al planificar menús diarios."
    lines = wrap_text(c, intro2, 'Noto', 8.5, PAGE_W - 2*MARGIN)
    c.setFillColor(TEXT_MUTED)
    for line in lines:
        c.drawString(MARGIN, y, line)
        y -= 4*mm
    y -= 3*mm
    
    # Dos cards B2C
    card_h2 = 28*mm
    
    # Problema
    draw_rounded_rect(c, MARGIN, y - card_h2, card_w, card_h2, radius=6, fill_color=HexColor('#FFF5F5'), stroke_color=HexColor('#FECACA'), stroke_width=0.8)
    c.setFillColor(HexColor('#E53E3E'))
    c.setFont('Noto-Bold', 8)
    c.drawString(MARGIN + 5*mm, y - 5.5*mm, "EL PROBLEMA")
    c.setFillColor(TEXT_DARK)
    c.setFont('Noto-SemiBold', 9)
    c.drawString(MARGIN + 5*mm, y - 10.5*mm, "Pérdida Económica Doméstica")
    
    desc_p = "Hasta un 20% del presupuesto mensual en alimentos consumibles se pierde por caducidad no supervisada e inventario desorganizado."
    lines = wrap_text(c, desc_p, 'Noto', 7.5, card_w - 10*mm)
    c.setFillColor(TEXT_MUTED)
    ty = y - 15.5*mm
    for line in lines:
        c.drawString(MARGIN + 5*mm, ty, line)
        ty -= 3.5*mm
    
    # Badge 20%
    c.setFillColor(HexColor('#E53E3E'))
    c.roundRect(MARGIN + card_w - 20*mm, y - card_h2 + 3*mm, 16*mm, 7*mm, 3, fill=1, stroke=0)
    c.setFillColor(white)
    c.setFont('Noto-Bold', 8)
    c.drawCentredString(MARGIN + card_w - 12*mm, y - card_h2 + 5*mm, "20%")
    
    # Solución
    draw_rounded_rect(c, x2, y - card_h2, card_w, card_h2, radius=6, fill_color=HexColor('#F0FDFA'), stroke_color=HexColor('#99F6E4'), stroke_width=0.8)
    c.setFillColor(B2C_COLOR)
    c.setFont('Noto-Bold', 8)
    c.drawString(x2 + 5*mm, y - 5.5*mm, "LA SOLUCIÓN IA")
    c.setFillColor(TEXT_DARK)
    c.setFont('Noto-SemiBold', 9)
    c.drawString(x2 + 5*mm, y - 10.5*mm, "Gestión Activa y Asistida")
    
    desc_s = "Plataforma móvil con lectura de tickets OCR, alertas predictivas de vencimiento y generación de recetas orientadas a desperdicio cero."
    lines = wrap_text(c, desc_s, 'Noto', 7.5, card_w - 10*mm)
    c.setFillColor(TEXT_MUTED)
    ty = y - 15.5*mm
    for line in lines:
        c.drawString(x2 + 5*mm, ty, line)
        ty -= 3.5*mm
    
    y -= card_h2 + 8*mm
    
    # ─── 3. PESTEL ───
    y = draw_section_title(c, MARGIN, y, 3, "ANÁLISIS DEL ENTORNO: PESTEL", ACCENT_DARK)
    
    # Tabla PESTEL
    table_data = [
        ("Político / Legal", "Leyes de sostenibilidad e Inocuidad (GDPR/Protección de datos).", "Alineación estricta con normativas de privacidad y reducción de huella ambiental."),
        ("Económico", "Inflación en cesta básica y optimización de presupuestos.", "Alta receptividad de las familias hacia herramientas que reduzcan gastos innecesarios."),
        ("Social", "Conciencia ecológica y adopción digital en el hogar.", "Tendencia sostenida hacia hábitos sustentables y colaboración familiar en app."),
        ("Tecnológico", "Madurez en OCR, redes neuronales y Cloud Serverless.", "Posibilidad de procesamiento masivo de datos a costos computacionales reducidos."),
    ]
    
    col_w = [32*mm, 70*mm, PAGE_W - 2*MARGIN - 102*mm]
    row_h = 14*mm
    header_h = 8*mm
    
    # Header
    c.setFillColor(PRIMARY)
    c.roundRect(MARGIN, y - header_h, PAGE_W - 2*MARGIN, header_h, 3, fill=1, stroke=0)
    c.setFillColor(white)
    c.setFont('Noto-Bold', 7.5)
    c.drawString(MARGIN + 3*mm, y - 5.5*mm, "Dimensión")
    c.drawString(MARGIN + col_w[0] + 3*mm, y - 5.5*mm, "Factor Clave")
    c.drawString(MARGIN + col_w[0] + col_w[1] + 3*mm, y - 5.5*mm, "Impacto Estratégico")
    
    y -= header_h
    
    for i, (dim, factor, impacto) in enumerate(table_data):
        bg = SOFT_BG if i % 2 == 0 else white
        c.setFillColor(bg)
        c.rect(MARGIN, y - row_h, PAGE_W - 2*MARGIN, row_h, fill=1, stroke=0)
        
        # Dimensión con color
        c.setFillColor(PRIMARY)
        c.setFont('Noto-Bold', 7.5)
        c.drawString(MARGIN + 3*mm, y - 5*mm, dim)
        
        c.setFillColor(TEXT_DARK)
        c.setFont('Noto', 7)
        # Factor
        flines = wrap_text(c, factor, 'Noto', 7, col_w[1] - 6*mm)
        ty = y - 4.5*mm
        for fl in flines[:2]:
            c.drawString(MARGIN + col_w[0] + 3*mm, ty, fl)
            ty -= 3.2*mm
        
        # Impacto
        ilines = wrap_text(c, impacto, 'Noto', 7, col_w[2] - 6*mm)
        ty = y - 4.5*mm
        for il in ilines[:2]:
            c.drawString(MARGIN + col_w[0] + col_w[1] + 3*mm, ty, il)
            ty -= 3.2*mm
        
        y -= row_h
    
    # Borde de tabla
    c.setStrokeColor(BORDER)
    c.setLineWidth(0.6)
    c.rect(MARGIN, y, PAGE_W - 2*MARGIN, header_h + 4*row_h, fill=0, stroke=1)
    
    draw_footer(c, 1)

# ══════════════════════════════════════════════
# PÁGINA 2
# ══════════════════════════════════════════════
def create_page2(c):
    draw_header_bar(
        c,
        "Lanzamiento & Modelado de Software e Inteligencia Artificial",
        "Análisis competitivo · Funcionalidades · Viabilidad financiera"
    )
    
    y = PAGE_H - 52*mm
    
    # ─── 3.1 PORTER ───
    y = draw_section_title(c, MARGIN, y, "3.1", "ANÁLISIS DE ENTORNO: 5 FUERZAS DE PORTER", ACCENT_DARK)
    y -= 2*mm
    
    porter = [
        ("Rivalidad de Competidores (Media)", "Existen apps tradicionales de listas de tareas, pero hay escasez de soluciones que integren visión por computadora e inventario inteligente en tiempo real.", HexColor('#3B82F6')),
        ("Amenaza de Sustitutos (Alta)", "Listas manuales en papel, notas del móvil o memoria personal. La interfaz debe ofrecer fricción cero para garantizar la adopción.", HexColor('#EF4444')),
        ("Poder de Compradores (Alto)", "Bajo costo de cambio para el usuario. La retención se logra mediante valor continuo acumulado y experiencia de usuario (UX) fluida.", HexColor('#F59E0B')),
        ("Poder de Proveedores (Bajo)", "Amplia disponibilidad de proveedores de infraestructura cloud (AWS, GCP) e infraestructuras de IA competitivas en precios.", HexColor('#10B981')),
    ]
    
    card_w = (PAGE_W - 2*MARGIN - 6*mm) / 2
    card_h = 26*mm
    
    for i, (title, desc, color) in enumerate(porter):
        col = i % 2
        row = i // 2
        x = MARGIN + col * (card_w + 6*mm)
        cy = y - row * (card_h + 4*mm)
        
        draw_rounded_rect(c, x, cy - card_h, card_w, card_h, radius=6, fill_color=CARD_BG, stroke_color=BORDER, stroke_width=0.7)
        # Color bar top
        c.setFillColor(color)
        c.roundRect(x, cy - 3.5*mm, card_w, 3.5*mm, 2, fill=1, stroke=0)
        c.rect(x, cy - 3.5*mm, card_w, 1.8*mm, fill=1, stroke=0)
        
        c.setFillColor(TEXT_DARK)
        c.setFont('Noto-Bold', 7.5)
        c.drawString(x + 4*mm, cy - 8.5*mm, title)
        
        lines = wrap_text(c, desc, 'Noto', 6.8, card_w - 8*mm)
        c.setFillColor(TEXT_MUTED)
        ty = cy - 13*mm
        for line in lines:
            c.drawString(x + 4*mm, ty, line)
            ty -= 3.1*mm
    
    y -= 2 * (card_h + 4*mm) + 5*mm
    
    # ─── 4. FUNCIONALIDADES ───
    y = draw_section_title(c, MARGIN, y, 4, "FUNCIONALIDADES INNOVADORAS (SMARTPANTRY AI)", B2C_COLOR)
    y -= 1*mm
    
    features = [
        ("Escaneo Inteligente por OCR y Visión", "Captura inmediata de recibos de supermercado e identificación de productos mediante foto directa."),
        ("Alertas de Caducidad + Motor de Recetas IA", "Generación dinámica de recetas basadas exclusivamente en los ingredientes próximos a vencer."),
        ("Sincronización Familiar Colaborativa", "Lista de compras compartida en tiempo real que aprende hábitos de consumo del núcleo familiar."),
        ("Comparador de Precios Regionales", "Módulo analítico de precios entre cadenas de supermercados locales para maximizar el ahorro."),
    ]
    
    feat_h = 14*mm
    for i, (title, desc) in enumerate(features):
        # Número
        c.setFillColor(B2C_COLOR)
        c.circle(MARGIN + 4*mm, y - 4.5*mm, 3.2*mm, fill=1, stroke=0)
        c.setFillColor(white)
        c.setFont('Noto-Bold', 7.5)
        c.drawCentredString(MARGIN + 4*mm, y - 5.6*mm, str(i+1))
        
        c.setFillColor(TEXT_DARK)
        c.setFont('Noto-SemiBold', 8)
        c.drawString(MARGIN + 11*mm, y - 3*mm, title)
        
        c.setFillColor(TEXT_MUTED)
        c.setFont('Noto', 7)
        c.drawString(MARGIN + 11*mm, y - 7.2*mm, desc)
        
        # Línea sutil
        if i < 3:
            c.setStrokeColor(BORDER)
            c.setLineWidth(0.4)
            c.line(MARGIN + 11*mm, y - 10.5*mm, PAGE_W - MARGIN, y - 10.5*mm)
        
        y -= feat_h
    
    y -= 1.5*mm
    
    # ─── 5. VIABILIDAD FINANCIERA ───
    y = draw_section_title(c, MARGIN, y, 5, "EVALUACIÓN DE VIABILIDAD FINANCIERA (PROYECCIÓN AÑO 1)", ACCENT_DARK)
    y -= 1*mm
    
    fin_data = [
        ("Desarrollo MVP (CAPEX)", "Arquitectura Mobile (Flutter), Backend (Node.js/Python), Integración APIs IA (4-6 meses).", "$35,000"),
        ("Infraestructura Cloud (OPEX)", "Servidores, bases de datos no relacionales, consumo de API OCR/LLMs ($1,200/mes).", "$14,400 /año"),
        ("Adquisición & Marketing", "Campañas ASO, publicidad digital y retención de usuarios ($2,000/mes).", "$24,000 /año"),
        ("Ingresos por Suscripción", "Modelo Freemium + Plan Familiar Premium ($3.99/mes) - Proyección 2,500 familias activas.", "$119,700 /año"),
        ("Ingresos Adicionales", "Publicidad contextual B2B y monetización de datos agregados (anónimos).", "$18,000 /año"),
    ]
    
    col_w = [48*mm, PAGE_W - 2*MARGIN - 78*mm, 30*mm]
    row_h = 10*mm
    header_h = 6.5*mm
    
    # Header
    c.setFillColor(PRIMARY)
    c.roundRect(MARGIN, y - header_h, PAGE_W - 2*MARGIN, header_h, 3, fill=1, stroke=0)
    c.setFillColor(white)
    c.setFont('Noto-Bold', 7)
    c.drawString(MARGIN + 2*mm, y - 4.5*mm, "Concepto")
    c.drawString(MARGIN + col_w[0] + 2*mm, y - 4.5*mm, "Detalle / Especificación")
    c.drawRightString(PAGE_W - MARGIN - 3*mm, y - 4.5*mm, "Monto USD")
    
    y -= header_h
    
    for i, (concepto, detalle, monto) in enumerate(fin_data):
        bg = SOFT_BG if i % 2 == 0 else white
        # Highlight income rows
        if "Ingresos" in concepto:
            bg = HexColor('#ECFDF5')
        
        c.setFillColor(bg)
        c.rect(MARGIN, y - row_h, PAGE_W - 2*MARGIN, row_h, fill=1, stroke=0)
        
        c.setFillColor(TEXT_DARK)
        c.setFont('Noto-SemiBold', 7)
        c.drawString(MARGIN + 2*mm, y - 4*mm, concepto)
        
        c.setFont('Noto', 6.5)
        c.setFillColor(TEXT_MUTED)
        dlines = wrap_text(c, detalle, 'Noto', 6.5, col_w[1] - 4*mm)
        ty = y - 3.8*mm
        for dl in dlines[:2]:
            c.drawString(MARGIN + col_w[0] + 2*mm, ty, dl)
            ty -= 2.8*mm
        
        # Monto
        if "Ingresos" in concepto:
            c.setFillColor(SUCCESS)
            c.setFont('Noto-Bold', 8)
        else:
            c.setFillColor(TEXT_DARK)
            c.setFont('Noto-SemiBold', 8)
        c.drawRightString(PAGE_W - MARGIN - 3*mm, y - 6*mm, monto)
        
        y -= row_h
    
    # Resultado - more compact and safe distance from footer
    y -= 2.5*mm
    result_h = 14*mm
    draw_rounded_rect(c, MARGIN, y - result_h, PAGE_W - 2*MARGIN, result_h, radius=5, fill_color=HexColor('#ECFDF5'), stroke_color=SUCCESS, stroke_width=1.2)
    
    c.setFillColor(SUCCESS)
    c.setFont('Noto-Bold', 7.5)
    c.drawString(MARGIN + 4*mm, y - 4.5*mm, "Resultado Operativo Estimado (Año 1)")
    
    c.setFillColor(TEXT_DARK)
    c.setFont('Noto', 7)
    result = "Margen neto positivo proyectado a partir del mes 9, alcanzando un ROI positivo estimado del 80% al finalizar el primer ciclo anual."
    lines = wrap_text(c, result, 'Noto', 7, PAGE_W - 2*MARGIN - 10*mm)
    ty = y - 9*mm
    for line in lines:
        c.drawString(MARGIN + 4*mm, ty, line)
        ty -= 3.2*mm
    
    draw_footer(c, 2)

# ══════════════════════════════════════════════
# PÁGINA 3 - LEAN CANVAS
# ══════════════════════════════════════════════
def create_page3(c):
    draw_header_bar(
        c,
        "Lanzamiento & Modelado de Software e Inteligencia Artificial",
        "Modelo de Negocios Lean Canvas — SmartPantry AI"
    )
    
    y = PAGE_H - 50*mm
    
    # Título
    c.setFillColor(PRIMARY)
    c.setFont('Noto-Bold', 13)
    c.drawCentredString(PAGE_W/2, y, "6. MODELO DE NEGOCIOS: LEAN CANVAS (SMARTPANTRY AI)")
    y -= 8*mm
    
    # Layout Lean Canvas clásico (3 columnas principales + filas)
    # Estructura:
    # [Problema] [Solución] [Propuesta Única] [Ventaja Injusta] [Segmento]
    # [Métricas]                          [Canales]
    # [Estructura de Costos]               [Fuentes de Ingresos]
    
    gap = 3*mm
    usable_w = PAGE_W - 2*MARGIN
    col_w = (usable_w - 2*gap) / 3
    small_col = (usable_w - 4*gap) / 5
    
    # Colores por bloque
    colors = {
        1: HexColor('#FEE2E2'),  # Problema - rojo suave
        2: HexColor('#DBEAFE'),  # Segmento - azul
        3: HexColor('#FEF3C7'),  # Propuesta - amarillo
        4: HexColor('#D1FAE5'),  # Solución - verde
        5: HexColor('#E0E7FF'),  # Canales - índigo
        6: HexColor('#FCE7F3'),  # Costos - rosa
        7: HexColor('#CCFBF1'),  # Ingresos - teal
        8: HexColor('#EDE9FE'),  # Métricas - púrpura
        9: HexColor('#FFEDD5'),  # Ventaja - naranja
    }
    
    border_colors = {
        1: HexColor('#F87171'),
        2: HexColor('#60A5FA'),
        3: HexColor('#FBBF24'),
        4: HexColor('#34D399'),
        5: HexColor('#818CF8'),
        6: HexColor('#F472B6'),
        7: HexColor('#2DD4BF'),
        8: HexColor('#A78BFA'),
        9: HexColor('#FB923C'),
    }
    
    def draw_canvas_block(x, y, w, h, num, title, items, bg, border):
        draw_rounded_rect(c, x, y - h, w, h, radius=5, fill_color=bg, stroke_color=border, stroke_width=1.2)
        
        # Número + título
        c.setFillColor(border)
        c.setFont('Noto-Bold', 7)
        c.drawString(x + 3*mm, y - 5*mm, f"{num}. {title}")
        
        c.setFillColor(TEXT_DARK)
        c.setFont('Noto', 6.8)
        ty = y - 10*mm
        for item in items:
            # Bullet
            c.setFillColor(border)
            c.circle(x + 4*mm, ty + 1*mm, 1*mm, fill=1, stroke=0)
            c.setFillColor(TEXT_DARK)
            # Wrap
            max_w = w - 10*mm
            lines = wrap_text(c, item, 'Noto', 6.8, max_w)
            for j, line in enumerate(lines):
                c.drawString(x + 7*mm, ty, line)
                ty -= 3.2*mm
            ty -= 1*mm
        return
    
    # Fila 1: Problema | Solución | Propuesta Única
    # En Lean Canvas real:
    # Top row often: Problem | Solution | Unique Value Prop | Unfair Advantage | Customer Segments
    # But original has specific numbers. Seguimos el orden del documento.
    
    block_h_top = 38*mm
    block_h_mid = 28*mm
    block_h_bot = 32*mm
    
    # Usamos layout de 5 columnas en la parte superior para el Lean Canvas clásico adaptado al contenido original
    # Para fidelidad, organizamos según el orden del documento original pero de forma visual intuitiva.
    
    # Layout mejorado:
    # Fila superior (5 bloques pequeños): 1 Problema, 4 Solución, 3 Propuesta, 9 Ventaja, 2 Segmento
    # Fila media: 8 Métricas | 5 Canales
    # Fila inferior: 6 Costos | 7 Ingresos
    
    small_w = (usable_w - 4*gap) / 5
    top_h = 42*mm
    
    blocks_top = [
        (1, "PROBLEMA", [
            "Desperdicio continuo de alimentos en hogares.",
            "Falta de visibilidad de inventario en despensas.",
            "Planificación de compras ineficiente."
        ]),
        (4, "SOLUCIÓN", [
            "Ingreso por OCR y fotos.",
            "Alertas preventivas de caducidad.",
            "Recetario IA cero-desperdicio."
        ]),
        (3, "PROPUESTA ÚNICA", [
            '"La app familiar que administra tu despensa con IA, reduce el desperdicio al mínimo y optimiza tu presupuesto automáticamente."'
        ]),
        (9, "VENTAJA INJUSTA", [
            "Algoritmo adaptado a empaques locales y recomendador de recetas optimizado por ingredientes."
        ]),
        (2, "SEGMENTO CLIENTES", [
            "Familias jóvenes y de mediana edad digitalizadas.",
            "Responsables del hogar enfocados en eficiencia y ahorro."
        ]),
    ]
    
    for i, (num, title, items) in enumerate(blocks_top):
        x = MARGIN + i * (small_w + gap)
        draw_canvas_block(x, y, small_w, top_h, num, title, items, colors[num], border_colors[num])
    
    y -= top_h + gap + 2*mm
    
    # Fila media: Métricas + Canales
    mid_w = (usable_w - gap) / 2
    mid_h = 28*mm
    
    # 8. MÉTRICAS
    draw_canvas_block(MARGIN, y, mid_w, mid_h, 8, "MÉTRICAS CLAVE", [
        "Usuarios Activos (MAU/DAU).",
        "Tasa de Conversión a Premium.",
        "Porcentaje de reducción de desperdicio."
    ], colors[8], border_colors[8])
    
    # 5. CANALES
    draw_canvas_block(MARGIN + mid_w + gap, y, mid_w, mid_h, 5, "CANALES", [
        "Estrategia Social Media (TikTok/Instagram enfocada en estilo de vida y economía doméstica).",
        "App Store Optimization (ASO) y alianzas con blogs de cocina/nutrición."
    ], colors[5], border_colors[5])
    
    y -= mid_h + gap + 2*mm
    
    # Fila inferior: Costos + Ingresos
    bot_h = 36*mm
    
    # 6. ESTRUCTURA DE COSTOS
    draw_canvas_block(MARGIN, y, mid_w, bot_h, 6, "ESTRUCTURA DE COSTOS", [
        "Desarrollo de Software, mantenimiento continuo e infraestructura Cloud (AWS/GCP).",
        "Consumo de APIs de Inteligencia Artificial (Visión y Modelos de Lenguaje).",
        "Inversión en Adquisición de Clientes (CAC) y Marketing Digital."
    ], colors[6], border_colors[6])
    
    # 7. FUENTES DE INGRESOS
    draw_canvas_block(MARGIN + mid_w + gap, y, mid_w, bot_h, 7, "FUENTES DE INGRESOS", [
        "Suscripción Premium Familiar ($3.99 USD/mes).",
        "Publicidad B2B contextual con marcas y supermercados.",
        "Informes de analítica de consumo masivo agregados y anónimos (FMCG Data)."
    ], colors[7], border_colors[7])
    
    # Nota final visual
    y -= bot_h + 8*mm
    c.setFillColor(PRIMARY)
    c.setFont('Noto-Light', 8)
    c.drawCentredString(PAGE_W/2, y, "SmartPantry AI  ·  Gestión inteligente de despensa familiar impulsada por IA")
    
    draw_footer(c, 3)

# ══════════════════════════════════════════════
# MAIN
# ══════════════════════════════════════════════
def main():
    default_output = os.environ.get(
        "INFORME_PDF",
        str(Path(__file__).resolve().parent / "output" / "Informe_Estrategico_Apps_Gestion_IA_Creativo.pdf"),
    )
    parser = argparse.ArgumentParser(
        description="Genera el Informe Estratégico Apps de Gestión e IA"
    )
    parser.add_argument(
        "-o",
        "--output",
        default=default_output,
        help="Ruta del PDF de salida (también configurable con la variable de entorno INFORME_PDF)",
    )
    args = parser.parse_args()
    output_path = args.output
    Path(output_path).parent.mkdir(parents=True, exist_ok=True)
    c = canvas.Canvas(output_path, pagesize=A4)
    
    # Página 1
    create_page1(c)
    c.showPage()
    
    # Página 2
    create_page2(c)
    c.showPage()
    
    # Página 3
    create_page3(c)
    c.showPage()
    
    c.save()
    print(f"PDF generado exitosamente: {output_path}")

if __name__ == "__main__":
    main()
