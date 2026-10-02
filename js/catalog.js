/** Catálogo, recetas y datos de referencia de SmartPantry AI. */

export const LOCATIONS = [
  { id: "refrigerador", label: "Refrigerador" },
  { id: "congelador", label: "Congelador" },
  { id: "despensa", label: "Despensa" },
];

export const UNITS = ["un", "kg", "g", "L", "ml", "paquete", "bolsa", "maple"];

export const STORES = [
  { id: "hipermaxi", name: "Hipermaxi", city: "Santa Cruz" },
  { id: "icnorte", name: "IC Norte", city: "Santa Cruz" },
  { id: "fidalga", name: "Fidalga", city: "Santa Cruz" },
  { id: "ketal", name: "Ketal", city: "La Paz" },
];

export const PRODUCTS = [
  { id: "leche", name: "Leche", category: "Lácteos", unit: "L", expiryDays: 7, location: "refrigerador", aliases: ["leche pil", "leche entera", "leche descremada", "leche"] },
  { id: "yogur", name: "Yogur", category: "Lácteos", unit: "L", expiryDays: 12, location: "refrigerador", aliases: ["yogurt", "yoghurt", "yogur"] },
  { id: "queso", name: "Queso", category: "Lácteos", unit: "kg", expiryDays: 20, location: "refrigerador", aliases: ["queso criollo", "quesillo", "queso"] },
  { id: "mantequilla", name: "Mantequilla", category: "Lácteos", unit: "g", expiryDays: 45, location: "refrigerador", aliases: ["mantequilla", "manteca"] },
  { id: "huevo", name: "Huevos", category: "Huevos", unit: "un", expiryDays: 21, location: "refrigerador", aliases: ["huevos", "huevo", "maple de huevos", "maple"] },
  { id: "pollo", name: "Pollo", category: "Carnes", unit: "kg", expiryDays: 3, location: "refrigerador", aliases: ["pollo entero", "pechuga de pollo", "pechuga", "pollo"] },
  { id: "carne", name: "Carne de res", category: "Carnes", unit: "kg", expiryDays: 3, location: "refrigerador", aliases: ["carne de res", "carne molida", "lomo", "carne"] },
  { id: "arroz", name: "Arroz", category: "Granos", unit: "kg", expiryDays: 365, location: "despensa", aliases: ["grano de oro", "arroz grano", "arroz"] },
  { id: "fideo", name: "Fideos", category: "Granos", unit: "g", expiryDays: 365, location: "despensa", aliases: ["don vittorio", "tallarin", "fideos", "fideo", "pasta"] },
  { id: "lenteja", name: "Lentejas", category: "Granos", unit: "kg", expiryDays: 365, location: "despensa", aliases: ["lentejas", "lenteja"] },
  { id: "mani", name: "Maní", category: "Granos", unit: "kg", expiryDays: 180, location: "despensa", aliases: ["cacahuate", "mani", "maní"] },
  { id: "poroto", name: "Porotos", category: "Granos", unit: "kg", expiryDays: 365, location: "despensa", aliases: ["frijoles", "frijol", "frejoles", "frejol", "porotos", "poroto"] },
  { id: "aceite", name: "Aceite", category: "Despensa", unit: "ml", expiryDays: 365, location: "despensa", aliases: ["aceite fino", "aceite vegetal", "aceite"] },
  { id: "azucar", name: "Azúcar", category: "Despensa", unit: "kg", expiryDays: 720, location: "despensa", aliases: ["azucar", "azúcar"] },
  { id: "harina", name: "Harina", category: "Despensa", unit: "kg", expiryDays: 180, location: "despensa", aliases: ["harina"] },
  { id: "sal", name: "Sal", category: "Condimentos", unit: "kg", expiryDays: 1200, location: "despensa", aliases: ["sal"] },
  { id: "tomate", name: "Tomate", category: "Verduras", unit: "kg", expiryDays: 7, location: "refrigerador", aliases: ["tomate perita", "tomates", "tomate"] },
  { id: "cebolla", name: "Cebolla", category: "Verduras", unit: "kg", expiryDays: 30, location: "despensa", aliases: ["cebolla blanca", "cebollas", "cebolla"] },
  { id: "papa", name: "Papa", category: "Verduras", unit: "kg", expiryDays: 30, location: "despensa", aliases: ["papas", "papa"] },
  { id: "zanahoria", name: "Zanahoria", category: "Verduras", unit: "kg", expiryDays: 18, location: "refrigerador", aliases: ["zanahorias", "zanahoria"] },
  { id: "lechuga", name: "Lechuga", category: "Verduras", unit: "un", expiryDays: 5, location: "refrigerador", aliases: ["lechuga"] },
  { id: "pimiento", name: "Pimiento", category: "Verduras", unit: "kg", expiryDays: 8, location: "refrigerador", aliases: ["pimenton", "morrón", "morron", "pimientos", "pimiento"] },
  { id: "choclo", name: "Choclo", category: "Verduras", unit: "un", expiryDays: 4, location: "refrigerador", aliases: ["choclo", "maiz", "maíz"] },
  { id: "yuca", name: "Yuca", category: "Verduras", unit: "kg", expiryDays: 8, location: "despensa", aliases: ["yuca"] },
  { id: "arveja", name: "Arveja", category: "Verduras", unit: "kg", expiryDays: 5, location: "refrigerador", aliases: ["guisante", "arvejas", "arveja"] },
  { id: "platano", name: "Plátano", category: "Frutas", unit: "kg", expiryDays: 5, location: "despensa", aliases: ["guineo", "banana", "platanos", "platano", "plátano"] },
  { id: "manzana", name: "Manzana", category: "Frutas", unit: "kg", expiryDays: 20, location: "refrigerador", aliases: ["manzanas", "manzana"] },
  { id: "limon", name: "Limón", category: "Frutas", unit: "kg", expiryDays: 21, location: "refrigerador", aliases: ["limones", "limon", "limón"] },
  { id: "pan", name: "Pan", category: "Panadería", unit: "un", expiryDays: 4, location: "despensa", aliases: ["pan de molde", "marraqueta", "pan"] },
  { id: "leche-polvo", name: "Leche en polvo", category: "Despensa", unit: "g", expiryDays: 400, location: "despensa", aliases: ["leche en polvo", "leche polvo"] },
  { id: "atun", name: "Atún", category: "Despensa", unit: "un", expiryDays: 540, location: "despensa", aliases: ["atun", "atún"] },
];

export const CATEGORIES = [
  "Lácteos",
  "Huevos",
  "Carnes",
  "Verduras",
  "Frutas",
  "Granos",
  "Panadería",
  "Despensa",
  "Condimentos",
  "Otros",
];

/** Precios de referencia en bolivianos, por la unidad del catálogo. */
export const REFERENCE_PRICES = {
  leche: { hipermaxi: 8.5, icnorte: 8.2, fidalga: 8.9, ketal: 9.1 },
  yogur: { hipermaxi: 12.9, icnorte: 12.5, fidalga: 13.4, ketal: 13.8 },
  queso: { hipermaxi: 42, icnorte: 39.5, fidalga: 44, ketal: 46 },
  mantequilla: { hipermaxi: 0.08, icnorte: 0.075, fidalga: 0.085, ketal: 0.09 },
  huevo: { hipermaxi: 1.15, icnorte: 1.05, fidalga: 1.2, ketal: 1.25 },
  pollo: { hipermaxi: 19.9, icnorte: 18.5, fidalga: 20.5, ketal: 21.5 },
  carne: { hipermaxi: 38, icnorte: 36.5, fidalga: 39, ketal: 41 },
  arroz: { hipermaxi: 8.2, icnorte: 7.8, fidalga: 8.5, ketal: 8.9 },
  fideo: { hipermaxi: 0.017, icnorte: 0.016, fidalga: 0.018, ketal: 0.019 },
  lenteja: { hipermaxi: 14, icnorte: 13.2, fidalga: 14.8, ketal: 15.5 },
  mani: { hipermaxi: 22, icnorte: 20.5, fidalga: 23, ketal: 24 },
  poroto: { hipermaxi: 16, icnorte: 15, fidalga: 16.8, ketal: 17.5 },
  aceite: { hipermaxi: 0.018, icnorte: 0.017, fidalga: 0.019, ketal: 0.02 },
  azucar: { hipermaxi: 7.2, icnorte: 6.9, fidalga: 7.5, ketal: 7.8 },
  harina: { hipermaxi: 6.5, icnorte: 6.2, fidalga: 6.8, ketal: 7 },
  sal: { hipermaxi: 3.5, icnorte: 3.2, fidalga: 3.6, ketal: 3.8 },
  tomate: { hipermaxi: 7.4, icnorte: 6.8, fidalga: 7.9, ketal: 8.2 },
  cebolla: { hipermaxi: 4.8, icnorte: 4.3, fidalga: 5.1, ketal: 5.4 },
  papa: { hipermaxi: 4.2, icnorte: 3.8, fidalga: 4.5, ketal: 4.9 },
  zanahoria: { hipermaxi: 5.5, icnorte: 5.1, fidalga: 5.9, ketal: 6.2 },
  lechuga: { hipermaxi: 5, icnorte: 4.5, fidalga: 5.5, ketal: 6 },
  pimiento: { hipermaxi: 12, icnorte: 11, fidalga: 12.8, ketal: 13.5 },
  choclo: { hipermaxi: 3.5, icnorte: 3, fidalga: 3.8, ketal: 4 },
  yuca: { hipermaxi: 4, icnorte: 3.6, fidalga: 4.3, ketal: 4.6 },
  arveja: { hipermaxi: 8, icnorte: 7.5, fidalga: 8.4, ketal: 9 },
  platano: { hipermaxi: 5.8, icnorte: 5.2, fidalga: 6.1, ketal: 6.4 },
  manzana: { hipermaxi: 12.5, icnorte: 11.8, fidalga: 13, ketal: 13.6 },
  limon: { hipermaxi: 8, icnorte: 7.2, fidalga: 8.5, ketal: 9 },
  pan: { hipermaxi: 9.5, icnorte: 8.8, fidalga: 9.9, ketal: 10.2 },
  "leche-polvo": { hipermaxi: 0.06, icnorte: 0.055, fidalga: 0.062, ketal: 0.065 },
  atun: { hipermaxi: 12.5, icnorte: 11.9, fidalga: 13, ketal: 13.4 },
};

export const RECIPES = [
  {
    id: "yogur-platano",
    name: "Yogur con plátano",
    minutes: 5,
    servings: 2,
    blurb: "Desayuno rápido para acabar el yogur y la fruta madura.",
    steps: [
      "Pela el plátano y córtalo en rodajas.",
      "Sirve el yogur en tazones y cubre con el plátano.",
      "Si tienes azúcar, espolvorea una cucharadita. Come el mismo día.",
    ],
    ingredients: [
      { productId: "yogur", name: "Yogur", qty: 0.5, unit: "L" },
      { productId: "platano", name: "Plátano", qty: 0.3, unit: "kg" },
    ],
  },
  {
    id: "tostadas",
    name: "Tostadas de queso y tomate",
    minutes: 12,
    servings: 2,
    blurb: "Aprovecha el pan del día y el tomate que ya está blando.",
    steps: [
      "Tuesta o dora el pan en una sartén seca.",
      "Cubre con láminas de queso y rodajas de tomate.",
      "Salpimenta si quieres y sirve enseguida.",
    ],
    ingredients: [
      { productId: "pan", name: "Pan", qty: 4, unit: "un" },
      { productId: "queso", name: "Queso", qty: 0.1, unit: "kg" },
      { productId: "tomate", name: "Tomate", qty: 0.2, unit: "kg" },
    ],
  },
  {
    id: "tortilla",
    name: "Tortilla de huevo y tomate",
    minutes: 15,
    servings: 3,
    blurb: "Una comida de sartén con lo que está por vencer en el refrigerador.",
    steps: [
      "Pica la cebolla y el tomate.",
      "Sofríe la cebolla con un chorrito de aceite y suma el tomate.",
      "Bate los huevos, viértelos en la sartén y cocina hasta que cuajen.",
    ],
    ingredients: [
      { productId: "huevo", name: "Huevos", qty: 4, unit: "un" },
      { productId: "tomate", name: "Tomate", qty: 0.25, unit: "kg" },
      { productId: "cebolla", name: "Cebolla", qty: 0.1, unit: "kg" },
      { productId: "aceite", name: "Aceite", qty: 15, unit: "ml" },
    ],
  },
  {
    id: "majadito",
    name: "Majadito cruceño",
    minutes: 40,
    servings: 4,
    blurb: "Arroz con pollo y plátano, el plato que vacía la despensa de la semana.",
    steps: [
      "Cocina el arroz y resérvalo.",
      "Dora el pollo en trozos con cebolla y un poco de aceite.",
      "Mezcla el arroz con el pollo. Sirve con plátano frito y huevo.",
    ],
    ingredients: [
      { productId: "arroz", name: "Arroz", qty: 0.4, unit: "kg" },
      { productId: "pollo", name: "Pollo", qty: 0.5, unit: "kg" },
      { productId: "platano", name: "Plátano", qty: 0.3, unit: "kg" },
      { productId: "huevo", name: "Huevos", qty: 2, unit: "un" },
      { productId: "cebolla", name: "Cebolla", qty: 0.15, unit: "kg" },
      { productId: "aceite", name: "Aceite", qty: 30, unit: "ml" },
    ],
  },
  {
    id: "pollo-horno",
    name: "Pollo al horno con verduras",
    minutes: 55,
    servings: 4,
    blurb: "Mete al horno el pollo y las verduras que vencen esta semana.",
    steps: [
      "Parte la papa, la zanahoria y la cebolla en trozos.",
      "Acomoda el pollo y las verduras en una fuente con aceite.",
      "Hornea hasta que el pollo esté cocido y las papas blandas.",
    ],
    ingredients: [
      { productId: "pollo", name: "Pollo", qty: 0.8, unit: "kg" },
      { productId: "papa", name: "Papa", qty: 0.4, unit: "kg" },
      { productId: "zanahoria", name: "Zanahoria", qty: 0.2, unit: "kg" },
      { productId: "cebolla", name: "Cebolla", qty: 0.15, unit: "kg" },
      { productId: "aceite", name: "Aceite", qty: 20, unit: "ml" },
    ],
  },
  {
    id: "fideos",
    name: "Fideos con salsa de tomate",
    minutes: 25,
    servings: 3,
    blurb: "Salsa corta para usar tomates maduros y el queso abierto.",
    steps: [
      "Hierve los fideos en agua con sal.",
      "Sofríe la cebolla, agrega el tomate picado y cocina la salsa.",
      "Mezcla con los fideos y termina con queso rallado.",
    ],
    ingredients: [
      { productId: "fideo", name: "Fideos", qty: 300, unit: "g" },
      { productId: "tomate", name: "Tomate", qty: 0.3, unit: "kg" },
      { productId: "cebolla", name: "Cebolla", qty: 0.1, unit: "kg" },
      { productId: "queso", name: "Queso", qty: 0.08, unit: "kg" },
      { productId: "aceite", name: "Aceite", qty: 15, unit: "ml" },
    ],
  },
  {
    id: "arroz-leche",
    name: "Arroz con leche",
    minutes: 35,
    servings: 4,
    blurb: "Postre para no botar la leche que vence en un par de días.",
    steps: [
      "Cocina el arroz en parte de la leche a fuego bajo.",
      "Agrega el resto de la leche y el azúcar, revolviendo.",
      "Apaga cuando espese. Sirve frío o tibio.",
    ],
    ingredients: [
      { productId: "arroz", name: "Arroz", qty: 0.15, unit: "kg" },
      { productId: "leche", name: "Leche", qty: 1, unit: "L" },
      { productId: "azucar", name: "Azúcar", qty: 0.08, unit: "kg" },
    ],
  },
  {
    id: "lentejas",
    name: "Lentejas con verduras",
    minutes: 45,
    servings: 4,
    blurb: "Olla de la semana con granos de despensa y verdura del refrigerador.",
    steps: [
      "Enjuaga las lentejas y cúbrelas con agua.",
      "Sofríe cebolla, papa y zanahoria, y súmalas a las lentejas.",
      "Cocina hasta que estén blandas. Rectifica la sal.",
    ],
    ingredients: [
      { productId: "lenteja", name: "Lentejas", qty: 0.3, unit: "kg" },
      { productId: "zanahoria", name: "Zanahoria", qty: 0.15, unit: "kg" },
      { productId: "cebolla", name: "Cebolla", qty: 0.1, unit: "kg" },
      { productId: "papa", name: "Papa", qty: 0.25, unit: "kg" },
      { productId: "aceite", name: "Aceite", qty: 15, unit: "ml" },
    ],
  },
  {
    id: "sopa-mani",
    name: "Sopa de maní",
    minutes: 50,
    servings: 4,
    blurb: "Clásico paceño y cruceño para cuando hay maní y algo de carne.",
    steps: [
      "Licúa o muele el maní con un poco de agua.",
      "Sofríe la cebolla y la carne o el pollo en trozos.",
      "Agrega el maní, la papa y los fideos. Cocina hasta espesar.",
    ],
    ingredients: [
      { productId: "mani", name: "Maní", qty: 0.2, unit: "kg" },
      { productId: "papa", name: "Papa", qty: 0.3, unit: "kg" },
      { productId: "fideo", name: "Fideos", qty: 80, unit: "g" },
      { productId: "pollo", name: "Pollo", qty: 0.3, unit: "kg" },
      { productId: "cebolla", name: "Cebolla", qty: 0.1, unit: "kg" },
    ],
  },
  {
    id: "salteado",
    name: "Salteado cero desperdicio",
    minutes: 20,
    servings: 3,
    blurb: "Una sartén para el pollo, el pimiento y lo que ya no espera.",
    steps: [
      "Corta el pollo y las verduras en tiras.",
      "Saltea a fuego fuerte con aceite, empezando por el pollo.",
      "Sirve con arroz recién hecho o del día anterior.",
    ],
    ingredients: [
      { productId: "pollo", name: "Pollo", qty: 0.35, unit: "kg" },
      { productId: "pimiento", name: "Pimiento", qty: 0.15, unit: "kg" },
      { productId: "cebolla", name: "Cebolla", qty: 0.1, unit: "kg" },
      { productId: "arroz", name: "Arroz", qty: 0.25, unit: "kg" },
      { productId: "aceite", name: "Aceite", qty: 15, unit: "ml" },
    ],
  },
  {
    id: "revuelto",
    name: "Revuelto de la refri",
    minutes: 15,
    servings: 2,
    blurb: "Huevos con la verdura que quedó suelta.",
    steps: [
      "Pica cebolla, tomate y pimiento.",
      "Sofríe las verduras dos minutos.",
      "Agrega los huevos batidos y revuelve hasta cuajar.",
    ],
    ingredients: [
      { productId: "huevo", name: "Huevos", qty: 3, unit: "un" },
      { productId: "tomate", name: "Tomate", qty: 0.15, unit: "kg" },
      { productId: "cebolla", name: "Cebolla", qty: 0.08, unit: "kg" },
      { productId: "pimiento", name: "Pimiento", qty: 0.08, unit: "kg" },
      { productId: "aceite", name: "Aceite", qty: 10, unit: "ml" },
    ],
  },
  {
    id: "ensalada",
    name: "Ensalada fresca",
    minutes: 10,
    servings: 3,
    blurb: "Para la lechuga y el tomate antes de que se echen a perder.",
    steps: [
      "Lava y corta lechuga, tomate, zanahoria y cebolla.",
      "Aliña con limón, una pizca de sal y un hilo de aceite.",
      "Sirve de inmediato.",
    ],
    ingredients: [
      { productId: "lechuga", name: "Lechuga", qty: 1, unit: "un" },
      { productId: "tomate", name: "Tomate", qty: 0.2, unit: "kg" },
      { productId: "zanahoria", name: "Zanahoria", qty: 0.1, unit: "kg" },
      { productId: "cebolla", name: "Cebolla", qty: 0.05, unit: "kg" },
      { productId: "limon", name: "Limón", qty: 0.05, unit: "kg" },
    ],
  },
];

export const SAMPLE_RECEIPT = `HIPERMAXI
Av. San Martin 450, Santa Cruz
02/10/2026

LECHE PIL ENTERA 1L          8.50
YOGUR PIL FRUTILLA 1L       12.90
PAN DE MOLDE                 9.50
2 x HUEVO MAPLE             56.00
ARROZ GRANO DE ORO 1KG       8.20
FIDEO DON VITTORIO 400G      6.80
ACEITE FINO 900ML           16.50
TOMATE PERITA KG             7.40
CEBOLLA BLANCA KG            4.80
POLLO ENTERO KG             19.90

TOTAL                      150.50
`;

export const PDF_HREF = "output/Informe_Estrategico_Apps_Gestion_IA_Creativo.pdf";
