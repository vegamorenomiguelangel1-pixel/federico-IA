# SmartPantry AI

Despensa familiar que avisa lo que está por vencer, propone recetas con esos ingredientes, comparte la lista de compras y compara precios de supermercados. Funciona en el navegador, en español, y guarda todo en el propio teléfono o computadora.

**[Abrir la app](https://vegamorenomiguelangel1-pixel.github.io/federico-IA/)**

El informe estratégico que describe el producto sigue disponible dentro de la app y en esta ruta:

[Informe Estratégico Apps de Gestión e IA (PDF)](https://vegamorenomiguelangel1-pixel.github.io/federico-IA/output/Informe_Estrategico_Apps_Gestion_IA_Creativo.pdf)

## Por qué esta app

`generar_informe.py` arma el plan de negocios. Ahí hay dos ideas: una app B2B de compras para distribución mayorista de ropa y **SmartPantry AI**, la app familiar de inventario doméstico. El informe desarrolla SmartPantry de punta a punta: problema, solución, funcionalidades, público, Lean Canvas y números del año 1. Esta versión web es ese producto, usable de verdad.

La propuesta del informe es: *la app familiar que administra tu despensa con IA, reduce el desperdicio al mínimo y optimiza tu presupuesto automáticamente.*

Está pensada para familias jóvenes y de mediana edad, y para quien organiza la comida y el gasto de la casa. Los precios de ejemplo están en bolivianos e incluyen cadenas de Santa Cruz (Hipermaxi, IC Norte, Fidalga) y La Paz (Ketal).

## Qué se puede hacer

- Cargar, editar, consumir y eliminar productos de la despensa (refrigerador, congelador o estante).
- Ver alertas de vencimiento y el valor estimado de lo que hay en casa.
- Leer un ticket pegado en texto, o el ticket de ejemplo, y confirmar los productos antes de guardarlos.
- Identificar un producto por foto: el nombre del archivo o el color orientan la sugerencia, y la persona confirma.
- Armar recetas con lo que está por vencer, cocinar (descuenta la despensa) y anotar los faltantes en la lista.
- Llevar una lista de compras del hogar, con la persona que la anotó, y ver en qué tienda sale más barata.
- Registrar precios vistos en góndola. Esos valores reemplazan a la referencia.
- Ver hábitos de reposición, el ahorro de 30 días y cuánto se echó a perder frente a un presupuesto mensual.
- Sumar miembros de la familia. Cada movimiento queda a nombre de quien está usando la app.
- Exportar e importar el hogar en un archivo JSON para pasarlo a otro teléfono.
- Restaurar los datos de demostración de la familia Rojas o empezar con la despensa vacía.
- Abrir el PDF del informe desde la app.

No hay servidor ni claves de pago. Las funciones de “IA” son reglas locales (lectura de tickets, color de la foto, recetas, hábitos y alertas). En `js/engine.js` están marcados los puntos para cambiarlas por un OCR, una API de visión o un modelo de recetas más adelante.

## Datos de ejemplo

Al abrirla por primera vez aparece la despensa de la familia Rojas, en Santa Cruz: varios productos por vencer, una lista compartida, precios y un historial de ahorro y desperdicio. El aviso de la portada deja seguir con el ejemplo, vaciar la despensa o, desde Familia, restaurar la demostración.

## Usar en este repositorio

Hace falta Python 3.10 o superior solo para el PDF. La app es HTML, CSS y JavaScript estáticos.

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python generar_informe.py
python -m http.server 8765
```

Abre `http://127.0.0.1:8765/`. El PDF queda en `output/Informe_Estrategico_Apps_Gestion_IA_Creativo.pdf` y la app lo enlaza desde esa misma carpeta.

Para guardar el PDF en otra ruta:

```bash
python generar_informe.py -o mi_informe.pdf
INFORME_PDF=mi_informe.pdf python generar_informe.py
```

Si indicas `-o` y la variable `INFORME_PDF`, prevalece `-o`.

## GitHub Pages

Cada push a `main`, y también la ejecución manual (`workflow_dispatch`), corre `.github/workflows/pages.yml`:

1. Instala ReportLab y genera el PDF.
2. Publica la app (`index.html`, `css/`, `js/` y las fuentes) junto con el informe en `output/`.

El sitio usa las acciones oficiales de GitHub Pages. Si todavía no está activado, el flujo intenta habilitarlo con origen **GitHub Actions**.

Repositorio: https://github.com/vegamorenomiguelangel1-pixel/federico-IA

## Fuentes

La interfaz y el PDF usan Noto Sans (Regular, Medium, SemiBold y Bold; el PDF también usa Light). Los archivos TTF están en `fonts/` bajo la SIL Open Font License 1.1. El aviso de copyright y la licencia están en `fonts/OFL.txt`.

Copyright 2022 The Noto Project Authors (https://github.com/notofonts/latin-greek-cyrillic)
