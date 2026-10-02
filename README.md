# Informe Estratégico Apps de Gestión e IA

Generador en Python del documento **Informe Estratégico Apps de Gestión e IA**: plan de lanzamiento, análisis de entorno y viabilidad financiera de soluciones móviles B2B y B2C (distribución mayorista de ropa y SmartPantry AI).

El informe publicado está en:

**https://vegamorenomiguelangel1-pixel.github.io/federico-IA/**

## Qué incluye el PDF

El archivo `output/Informe_Estrategico_Apps_Gestion_IA_Creativo.pdf` tiene tres páginas:

1. App B2B de gestión inteligente de compras, oportunidad B2C (SmartPantry AI) y análisis PESTEL.
2. Cinco fuerzas de Porter, funcionalidades de la app y proyección financiera del año 1.
3. Lean Canvas de SmartPantry AI.

## Requisitos

- Python 3.10 o superior
- Las dependencias de `requirements.txt` (ReportLab)

## Generar el PDF

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python generar_informe.py
```

Por defecto el PDF se guarda en `output/Informe_Estrategico_Apps_Gestion_IA_Creativo.pdf`.

Para elegir otra ruta, usa `-o` o la variable de entorno `INFORME_PDF`. Si indicas las dos, prevalece `-o`:

```bash
python generar_informe.py -o mi_informe.pdf
INFORME_PDF=mi_informe.pdf python generar_informe.py
```

## Fuentes

El diseño usa Noto Sans (Light, Regular, Medium, SemiBold y Bold). Los archivos TTF están en `fonts/` y se distribuyen bajo la SIL Open Font License 1.1. El aviso de copyright y el texto de la licencia están en `fonts/OFL.txt`.

Copyright 2022 The Noto Project Authors (https://github.com/notofonts/latin-greek-cyrillic)

## GitHub Pages

Cada push a `main` ejecuta `.github/workflows/pages.yml`: instala las dependencias, genera el PDF y publica la página `index.html` junto con el informe, usando las acciones oficiales de GitHub Pages. Si el sitio todavía no está activado, el flujo intenta habilitarlo con origen **GitHub Actions**.

Repositorio: https://github.com/vegamorenomiguelangel1-pixel/federico-IA
