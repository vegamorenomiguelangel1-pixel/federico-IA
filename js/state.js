/** Persistencia local del hogar. No hay servidor: todo queda en este navegador. */

import { createId, addDays, todayISO } from "./dates.js";

const KEY = "smartpantry.ai.v1";

function lot(partial) {
  return {
    id: createId(),
    productId: "",
    name: "",
    category: "Otros",
    quantity: 1,
    unit: "un",
    location: "despensa",
    expiresOn: "",
    unitPrice: null,
    storeId: "",
    addedBy: "m-camila",
    createdAt: todayISO(),
    ...partial,
  };
}

export function createSeed() {
  const today = todayISO();
  const day = (n) => addDays(today, n);
  return {
    version: 1,
    household: {
      name: "Familia Rojas",
      city: "Santa Cruz de la Sierra",
      activeMemberId: "m-camila",
      members: [
        { id: "m-camila", name: "Camila Rojas", role: "Organiza la despensa", color: "#00B4D8" },
        { id: "m-diego", name: "Diego Rojas", role: "Compras del sábado", color: "#2EC4B6" },
        { id: "m-sofia", name: "Sofía Rojas", role: "Avisa lo que se acaba", color: "#FF9F1C" },
      ],
    },
    settings: {
      monthlyBudget: 1800,
      alertDays: 7,
      demo: true,
      banner: true,
    },
    pantry: [
      lot({ productId: "yogur", name: "Yogur", category: "Lácteos", quantity: 0.8, unit: "L", location: "refrigerador", expiresOn: day(1), unitPrice: 12.5, storeId: "icnorte", addedBy: "m-camila" }),
      lot({ productId: "pan", name: "Pan", category: "Panadería", quantity: 6, unit: "un", location: "despensa", expiresOn: day(1), unitPrice: 1.6, storeId: "hipermaxi", addedBy: "m-diego" }),
      lot({ productId: "platano", name: "Plátano", category: "Frutas", quantity: 0.7, unit: "kg", location: "despensa", expiresOn: day(2), unitPrice: 5.2, storeId: "icnorte", addedBy: "m-camila" }),
      lot({ productId: "pollo", name: "Pollo", category: "Carnes", quantity: 1.2, unit: "kg", location: "refrigerador", expiresOn: day(2), unitPrice: 18.5, storeId: "icnorte", addedBy: "m-diego" }),
      lot({ productId: "leche", name: "Leche", category: "Lácteos", quantity: 2, unit: "L", location: "refrigerador", expiresOn: day(2), unitPrice: 8.2, storeId: "icnorte", addedBy: "m-camila" }),
      lot({ productId: "tomate", name: "Tomate", category: "Verduras", quantity: 0.6, unit: "kg", location: "refrigerador", expiresOn: day(3), unitPrice: 6.8, storeId: "fidalga", addedBy: "m-sofia" }),
      lot({ productId: "queso", name: "Queso", category: "Lácteos", quantity: 0.25, unit: "kg", location: "refrigerador", expiresOn: day(4), unitPrice: 39.5, storeId: "icnorte", addedBy: "m-camila" }),
      lot({ productId: "zanahoria", name: "Zanahoria", category: "Verduras", quantity: 0.4, unit: "kg", location: "refrigerador", expiresOn: day(5), unitPrice: 5.1, storeId: "hipermaxi", addedBy: "m-diego" }),
      lot({ productId: "huevo", name: "Huevos", category: "Huevos", quantity: 10, unit: "un", location: "refrigerador", expiresOn: day(12), unitPrice: 1.05, storeId: "icnorte", addedBy: "m-camila" }),
      lot({ productId: "cebolla", name: "Cebolla", category: "Verduras", quantity: 0.8, unit: "kg", location: "despensa", expiresOn: day(18), unitPrice: 4.3, storeId: "icnorte", addedBy: "m-diego" }),
      lot({ productId: "aceite", name: "Aceite", category: "Despensa", quantity: 700, unit: "ml", location: "despensa", expiresOn: day(200), unitPrice: 0.017, storeId: "hipermaxi", addedBy: "m-camila" }),
      lot({ productId: "arroz", name: "Arroz", category: "Granos", quantity: 1.5, unit: "kg", location: "despensa", expiresOn: day(240), unitPrice: 7.8, storeId: "icnorte", addedBy: "m-camila" }),
      lot({ productId: "fideo", name: "Fideos", category: "Granos", quantity: 800, unit: "g", location: "despensa", expiresOn: day(300), unitPrice: 0.016, storeId: "icnorte", addedBy: "m-diego" }),
      lot({ productId: "lenteja", name: "Lentejas", category: "Granos", quantity: 0.5, unit: "kg", location: "despensa", expiresOn: day(320), unitPrice: 13.2, storeId: "fidalga", addedBy: "m-camila" }),
      lot({ productId: "azucar", name: "Azúcar", category: "Despensa", quantity: 1, unit: "kg", location: "despensa", expiresOn: day(400), unitPrice: 6.9, storeId: "icnorte", addedBy: "m-sofia" }),
    ],
    shopping: [
      { id: createId(), name: "Maní", productId: "mani", quantity: 0.5, unit: "kg", checked: false, addedBy: "m-camila" },
      { id: createId(), name: "Papa", productId: "papa", quantity: 2, unit: "kg", checked: false, addedBy: "m-diego" },
      { id: createId(), name: "Limón", productId: "limon", quantity: 0.3, unit: "kg", checked: false, addedBy: "m-sofia" },
      { id: createId(), name: "Lechuga", productId: "lechuga", quantity: 1, unit: "un", checked: true, addedBy: "m-camila" },
    ],
    prices: [
      { productId: "leche", storeId: "icnorte", price: 8.2, updatedAt: day(-2) },
      { productId: "pollo", storeId: "hipermaxi", price: 21.5, updatedAt: day(-1) },
    ],
    consumption: [
      { id: createId(), kind: "cooked", productId: "tomate", name: "Tortilla de la semana pasada", quantity: 1, unit: "plato", at: day(-6), memberId: "m-camila", savedAmount: 22.4, wastedAmount: 0 },
      { id: createId(), kind: "cooked", productId: "pollo", name: "Pollo al horno", quantity: 1, unit: "plato", at: day(-3), memberId: "m-diego", savedAmount: 34.8, wastedAmount: 0 },
      { id: createId(), kind: "cooked", productId: "yogur", name: "Yogur con fruta", quantity: 1, unit: "plato", at: day(-1), memberId: "m-sofia", savedAmount: 18.6, wastedAmount: 0 },
      { id: createId(), kind: "wasted", productId: "lechuga", name: "Lechuga", quantity: 1, unit: "un", at: day(-10), memberId: "m-camila", savedAmount: 0, wastedAmount: 7.5 },
      { id: createId(), kind: "wasted", productId: "pan", name: "Pan", quantity: 4, unit: "un", at: day(-8), memberId: "m-diego", savedAmount: 0, wastedAmount: 9 },
      { id: createId(), kind: "consumed", productId: "leche", name: "Leche", quantity: 1, unit: "L", at: day(-2), memberId: "m-camila", savedAmount: 0, wastedAmount: 0 },
      { id: createId(), kind: "consumed", productId: "leche", name: "Leche", quantity: 1, unit: "L", at: day(-7), memberId: "m-sofia", savedAmount: 0, wastedAmount: 0 },
      { id: createId(), kind: "consumed", productId: "leche", name: "Leche", quantity: 1, unit: "L", at: day(-12), memberId: "m-camila", savedAmount: 0, wastedAmount: 0 },
      { id: createId(), kind: "consumed", productId: "pan", name: "Pan", quantity: 6, unit: "un", at: day(-5), memberId: "m-diego", savedAmount: 0, wastedAmount: 0 },
      { id: createId(), kind: "consumed", productId: "pan", name: "Pan", quantity: 6, unit: "un", at: day(-11), memberId: "m-diego", savedAmount: 0, wastedAmount: 0 },
      { id: createId(), kind: "consumed", productId: "huevo", name: "Huevos", quantity: 6, unit: "un", at: day(-4), memberId: "m-camila", savedAmount: 0, wastedAmount: 0 },
      { id: createId(), kind: "consumed", productId: "huevo", name: "Huevos", quantity: 4, unit: "un", at: day(-9), memberId: "m-sofia", savedAmount: 0, wastedAmount: 0 },
      { id: createId(), kind: "consumed", productId: "arroz", name: "Arroz", quantity: 0.4, unit: "kg", at: day(-6), memberId: "m-diego", savedAmount: 0, wastedAmount: 0 },
      { id: createId(), kind: "consumed", productId: "arroz", name: "Arroz", quantity: 0.4, unit: "kg", at: day(-14), memberId: "m-camila", savedAmount: 0, wastedAmount: 0 },
      { id: createId(), kind: "consumed", productId: "papa", name: "Papa", quantity: 1, unit: "kg", at: day(-15), memberId: "m-diego", savedAmount: 0, wastedAmount: 0 },
      { id: createId(), kind: "consumed", productId: "papa", name: "Papa", quantity: 1, unit: "kg", at: day(-22), memberId: "m-camila", savedAmount: 0, wastedAmount: 0 },
      { id: createId(), kind: "consumed", productId: "mani", name: "Maní", quantity: 0.2, unit: "kg", at: day(-18), memberId: "m-camila", savedAmount: 0, wastedAmount: 0 },
      { id: createId(), kind: "consumed", productId: "mani", name: "Maní", quantity: 0.2, unit: "kg", at: day(-28), memberId: "m-diego", savedAmount: 0, wastedAmount: 0 },
    ],
    activity: [
      { id: createId(), at: day(-1), memberId: "m-sofia", text: "Sofía pidió limón para la lista." },
      { id: createId(), at: day(-1), memberId: "m-camila", text: "Camila usó yogur antes de que venciera." },
      { id: createId(), at: day(0), memberId: "m-diego", text: "Diego dejó el pollo en el refrigerador." },
    ],
    receipts: [],
  };
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

export function normalize(data) {
  const seed = createSeed();
  const source = data && typeof data === "object" ? data : {};
  const household = source.household && typeof source.household === "object" ? source.household : {};
  const members = asArray(household.members).filter((m) => m && m.id && m.name);
  return {
    version: 1,
    household: {
      name: household.name || seed.household.name,
      city: household.city || seed.household.city,
      activeMemberId: household.activeMemberId || members[0]?.id || seed.household.activeMemberId,
      members: members.length ? members : seed.household.members,
    },
    settings: {
      monthlyBudget: Number(source.settings?.monthlyBudget) || seed.settings.monthlyBudget,
      alertDays: Number(source.settings?.alertDays) || 7,
      demo: Boolean(source.settings?.demo),
      banner: source.settings?.banner !== false,
    },
    pantry: asArray(source.pantry),
    shopping: asArray(source.shopping),
    prices: asArray(source.prices),
    consumption: asArray(source.consumption),
    activity: asArray(source.activity).slice(0, 40),
    receipts: asArray(source.receipts).slice(0, 30),
  };
}

export function loadState() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) {
      const seed = createSeed();
      saveState(seed);
      return seed;
    }
    return normalize(JSON.parse(raw));
  } catch {
    const seed = createSeed();
    saveState(seed);
    return seed;
  }
}

export function saveState(state) {
  localStorage.setItem(KEY, JSON.stringify(state));
}

export function resetState() {
  const seed = createSeed();
  saveState(seed);
  return seed;
}
