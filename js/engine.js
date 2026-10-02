/**
 * Motor local de SmartPantry AI.
 *
 * Las funciones de este archivo son reglas y heurísticas: funcionan sin red
 * y sin claves. Para conectar un servicio real, sustituye solo estos puntos:
 *   - parseReceipt()        → OCR / modelo de tickets
 *   - identifyFromImage()   → API de visión por computadora
 *   - rankRecipes()         → modelo de lenguaje de recetas
 * El resto de la app (despensa, alertas, lista, precios) no cambia.
 */

import { PRODUCTS, RECIPES, REFERENCE_PRICES, STORES } from "./catalog.js";
import {
  addDays,
  createId,
  daysUntil,
  formatQty,
  norm,
  parseNum,
  todayISO,
} from "./dates.js";

export {
  addDays,
  createId,
  daysUntil,
  formatQty,
  money,
  norm,
  parseNum,
  todayISO,
} from "./dates.js";

export function productById(id) {
  return PRODUCTS.find((p) => p.id === id) || null;
}

export function storeById(id) {
  return STORES.find((s) => s.id === id) || null;
}

export function locationLabel(id) {
  if (id === "refrigerador") return "Refrigerador";
  if (id === "congelador") return "Congelador";
  if (id === "despensa") return "Despensa";
  return "Sin lugar";
}

const ALIASES = PRODUCTS
  .flatMap((product) => product.aliases.map((alias) => ({ product, alias: norm(alias) })))
  .sort((a, b) => b.alias.length - a.alias.length);

export function matchProduct(text) {
  const hay = norm(text);
  if (!hay) return null;
  for (const entry of ALIASES) {
    const re = new RegExp(`(?:^|\\s)${entry.alias.replace(/\s+/g, "\\s+")}(?:\\s|$)`);
    if (re.test(hay)) return entry.product;
  }
  return null;
}

export function expiryStatus(iso, today = todayISO()) {
  const days = daysUntil(iso, today);
  if (days === null) return { level: "none", days: null, label: "Sin fecha" };
  if (days < 0) return { level: "expired", days, label: days === -1 ? "Venció ayer" : `Venció hace ${Math.abs(days)} días` };
  if (days === 0) return { level: "urgent", days, label: "Vence hoy" };
  if (days === 1) return { level: "urgent", days, label: "Vence mañana" };
  if (days <= 2) return { level: "urgent", days, label: `Vence en ${days} días` };
  if (days <= 7) return { level: "soon", days, label: `Vence en ${days} días` };
  return { level: "ok", days, label: `Vence en ${days} días` };
}

function normalizeUnit(raw) {
  const u = norm(raw);
  if (u === "kg") return "kg";
  if (u === "g" || u === "gr") return "g";
  if (u === "ml") return "ml";
  if (u === "l" || u === "lt" || u === "litro" || u === "litros") return "L";
  if (u === "maple") return "maple";
  if (u === "paquete" || u === "paq") return "paquete";
  if (u === "bolsa") return "bolsa";
  if (u === "un" || u === "u" || u === "und") return "un";
  return raw || "un";
}

function extractSize(name) {
  let clean = name;
  let qty = 1;
  let unit = null;
  const sized = clean.match(/(\d+(?:[.,]\d+)?)\s*(kg|g|gr|ml|lt|l)\b/i);
  if (sized) {
    qty = parseNum(sized[1]) || 1;
    unit = normalizeUnit(sized[2]);
    clean = clean.replace(sized[0], " ");
  } else if (/\bmaple\b/i.test(clean)) {
    unit = "maple";
  } else if (/\bkg\b/i.test(clean)) {
    unit = "kg";
  }
  clean = clean.replace(/\b(kg|gr|g|ml|lt|litros|litro|maple)\b/gi, " ");
  clean = clean.replace(/\s+/g, " ").trim();
  return { qty, unit, cleanName: clean };
}

const SKIP_LINE = /^(total|subtotal|efectivo|cambio|vuelto|descuento|iva|nit|nit\b|fecha|hora|gracias|cajero|caja|ticket|factura|vendedor|cliente|av|avenida|calle|zona|tel|telefono|santa cruz|la paz|cochabamba|el alto)\b/i;

function parseDateToken(token) {
  const m = String(token).match(/^(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{2,4})$/);
  if (!m) return null;
  const day = Number(m[1]);
  const month = Number(m[2]);
  let year = Number(m[3]);
  if (year < 100) year += 2000;
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  const z = (n) => String(n).padStart(2, "0");
  return `${year}-${z(month)}-${z(day)}`;
}

/**
 * Lee un ticket en texto (pegado, o el que devolvería un OCR).
 * Devuelve tienda, fecha e ítems listos para confirmar.
 */
export function parseReceipt(text, today = todayISO()) {
  const lines = String(text || "").split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  let storeId = "";
  let date = today;
  const items = [];

  for (const rawLine of lines) {
    const collapsed = rawLine.replace(/\s+/g, " ").trim();
    const store = STORES.find((s) => norm(collapsed).includes(norm(s.name)));
    if (store) storeId = store.id;

    const dateInLine = collapsed.match(/\d{1,2}[\/.-]\d{1,2}[\/.-]\d{2,4}/);
    if (dateInLine) {
      const parsed = parseDateToken(dateInLine[0]);
      if (parsed) date = parsed;
    }
    if (/^\d{1,2}[\/.-]\d{1,2}[\/.-]\d{2,4}$/.test(collapsed)) continue;

    const tokens = collapsed.split(" ");
    let price = null;
    if (tokens.length > 1 && parseNum(tokens[tokens.length - 1]) !== null && /[a-zA-ZáéíóúñÁÉÍÓÚÑ]/.test(collapsed)) {
      price = parseNum(tokens.pop());
    }
    let rest = tokens.join(" ").trim();
    if (!rest) continue;
    if (SKIP_LINE.test(norm(rest)) || SKIP_LINE.test(norm(collapsed))) continue;

    let qtyMult = 1;
    const times = rest.match(/^(\d+(?:[.,]\d+)?)\s*[x×]\s+(.+)$/i);
    if (times) {
      qtyMult = parseNum(times[1]) || 1;
      rest = times[2];
    } else {
      const leading = rest.match(/^(\d+(?:[.,]\d+)?)\s+(.+)$/);
      if (leading && (parseNum(leading[1]) || 0) <= 40 && /[a-zA-Záéíóúñ]/.test(leading[2])) {
        qtyMult = parseNum(leading[1]) || 1;
        rest = leading[2];
      }
    }

    const size = extractSize(rest);
    const product = matchProduct(`${size.cleanName} ${collapsed}`);
    if (!product && price === null) continue;
    if (!product && price !== null && norm(size.cleanName).split(" ").length < 1) continue;
    if (!product && /^(av|avenida)\b/.test(norm(collapsed))) continue;

    const unit = size.unit || product?.unit || "un";
    const quantity = Math.round(qtyMult * size.qty * 1000) / 1000;
    const unitPrice = price !== null && quantity ? Math.round((price / quantity) * 1000) / 1000 : null;
    items.push({
      include: true,
      productId: product?.id || "",
      name: product?.name || size.cleanName || rest,
      category: product?.category || "Otros",
      location: product?.location || "despensa",
      quantity,
      unit,
      linePrice: price,
      unitPrice,
      expiresOn: addDays(today, product?.expiryDays ?? 30),
      confidence: product ? 0.9 : 0.45,
      raw: rawLine.trim(),
    });
  }

  const sum = items.reduce((acc, item) => acc + (item.linePrice || 0), 0);
  return {
    storeId,
    date,
    items,
    sum: Math.round(sum * 100) / 100,
    source: "heuristica",
  };
}

export function summarizePixels(rgba) {
  const bins = { red: 0, green: 0, yellow: 0, orange: 0, white: 0, brown: 0, pink: 0, dark: 0 };
  let r = 0;
  let g = 0;
  let b = 0;
  let n = 0;
  for (let i = 0; i < rgba.length; i += 4) {
    const R = rgba[i];
    const G = rgba[i + 1];
    const B = rgba[i + 2];
    const max = Math.max(R, G, B);
    const min = Math.min(R, G, B);
    const sat = max === 0 ? 0 : (max - min) / max;
    r += R;
    g += G;
    b += B;
    n += 1;
    if (max < 55) bins.dark += 1;
    else if (sat < 0.18 && max > 165) bins.white += 1;
    else if (R > 150 && G > 130 && B < 100) bins.yellow += 1;
    else if (R > 160 && G > 80 && B < 80) bins.orange += 1;
    else if (R > 130 && G < 100 && B < 100) bins.red += 1;
    else if (G > R + 10 && G > B) bins.green += 1;
    else if (R > 140 && B > 90 && G < 150) bins.pink += 1;
    else if (R > 70 && G > 40 && B < 70) bins.brown += 1;
  }
  return { bins, avg: n ? { r: r / n, g: g / n, b: b / n } : { r: 0, g: 0, b: 0 }, n };
}

function categoryFromBins(bins) {
  const ranked = Object.entries(bins).sort((a, b) => b[1] - a[1]);
  const [top, second] = ranked;
  if (!top || top[1] === 0) return "Despensa";
  if (top[0] === "green") return "Verduras";
  if (top[0] === "red" || top[0] === "orange") return second && second[0] === "dark" ? "Carnes" : "Frutas";
  if (top[0] === "yellow") return "Huevos";
  if (top[0] === "white") return "Lácteos";
  if (top[0] === "pink" || top[0] === "dark") return "Carnes";
  if (top[0] === "brown") return "Granos";
  return "Despensa";
}

/**
 * Reconocimiento local de una foto.
 * `pixels` es un Uint8ClampedArray RGBA ya reducido.
 * Si el nombre del archivo contiene un producto, esa pista gana.
 */
export function identifyFromImage({ fileName = "", pixels = null } = {}) {
  const fromName = matchProduct(fileName.replace(/\.[a-z0-9]+$/i, " ").replace(/[_-]+/g, " "));
  if (fromName) {
    const neighbors = PRODUCTS.filter((p) => p.category === fromName.category && p.id !== fromName.id).slice(0, 2);
    return {
      method: "archivo",
      category: fromName.category,
      note: "El nombre del archivo coincide con el catálogo. Confirma antes de guardar.",
      suggestions: [
        { product: fromName, confidence: 0.92, reason: "Coincidencia con el nombre del archivo." },
        ...neighbors.map((product, i) => ({
          product,
          confidence: 0.48 - i * 0.08,
          reason: `Misma categoría (${product.category.toLowerCase()}).`,
        })),
      ],
    };
  }

  const summary = pixels ? summarizePixels(pixels) : null;
  const category = summary ? categoryFromBins(summary.bins) : "Verduras";
  const pool = PRODUCTS.filter((p) => p.category === category);
  const suggestions = (pool.length ? pool : PRODUCTS).slice(0, 4).map((product, i) => ({
    product,
    confidence: Math.max(0.32, 0.66 - i * 0.09),
    reason: `El color dominante se parece a ${category.toLowerCase()}.`,
  }));
  return {
    method: "color",
    category,
    note: "Reconocimiento local por color. Sirve para orientar; confirma el producto. Una API de visión puede reemplazar esta función.",
    suggestions,
  };
}

export function examplePhotoResult(productId) {
  const product = productById(productId) || PRODUCTS[0];
  const neighbors = PRODUCTS.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 2);
  return {
    method: "ejemplo",
    category: product.category,
    note: "Ejemplo guiado, sin cámara. El mismo paso de confirmación se usa con una foto real.",
    suggestions: [
      { product, confidence: 0.88, reason: "Ejemplo preparado para probar el flujo." },
      ...neighbors.map((item, i) => ({
        product: item,
        confidence: 0.42 - i * 0.06,
        reason: "Alternativa de la misma categoría.",
      })),
    ],
  };
}

function findLot(pantry, productId) {
  const lots = pantry.filter((item) => item.productId === productId && item.quantity > 0);
  lots.sort((a, b) => String(a.expiresOn).localeCompare(String(b.expiresOn)));
  return lots[0] || null;
}

export function rankRecipes(pantry, today = todayISO(), recipes = RECIPES) {
  return recipes
    .map((recipe) => {
      const used = [];
      const missing = [];
      let weight = 0;
      for (const ing of recipe.ingredients) {
        const item = findLot(pantry, ing.productId);
        if (!item) {
          missing.push(ing);
          continue;
        }
        const days = daysUntil(item.expiresOn, today);
        let w = 1;
        if (days !== null && days <= 2) w = 6;
        else if (days !== null && days <= 7) w = 3;
        weight += w;
        used.push({ ...ing, item, days });
      }
      const coverage = recipe.ingredients.length ? used.length / recipe.ingredients.length : 0;
      return {
        recipe,
        used,
        missing,
        coverage,
        score: coverage * weight,
        expiringHits: used.filter((u) => u.days !== null && u.days <= 7).length,
      };
    })
    .sort((a, b) => b.score - a.score || b.coverage - a.coverage || a.recipe.name.localeCompare(b.recipe.name, "es"));
}

const UNIT_TO_BASE = { g: ["g", 1], kg: ["g", 1000], ml: ["ml", 1], L: ["ml", 1000] };

export function toBase(quantity, unit) {
  const spec = UNIT_TO_BASE[unit];
  if (!spec) return null;
  return { unit: spec[0], quantity: quantity * spec[1] };
}

export function fromBase(quantity, unit) {
  const spec = UNIT_TO_BASE[unit];
  if (!spec) return quantity;
  return quantity / spec[1];
}

function asEggs(quantity, unit) {
  if (unit === "maple") return quantity * 30;
  if (unit === "un") return quantity;
  return null;
}

/** Resta un ingrediente de un lote. Convierte kg/g, L/ml y maple/un. */
export function deductFromLot(lot, qty, unit) {
  const next = { ...lot };
  const wantEggs = asEggs(qty, unit);
  const haveEggs = asEggs(lot.quantity, lot.unit);
  if (wantEggs !== null && haveEggs !== null) {
    const usedEggs = Math.min(haveEggs, wantEggs);
    const leftEggs = Math.max(0, haveEggs - usedEggs);
    next.quantity = lot.unit === "maple"
      ? Math.round((leftEggs / 30) * 1000) / 1000
      : Math.round(leftEggs * 1000) / 1000;
    return {
      lot: next,
      usedQty: lot.unit === "maple" ? usedEggs / 30 : usedEggs,
      unit: lot.unit,
    };
  }
  const wanted = toBase(qty, unit);
  const have = toBase(lot.quantity, lot.unit);
  if (wanted && have && wanted.unit === have.unit) {
    const leftBase = Math.max(0, have.quantity - wanted.quantity);
    next.quantity = Math.round(fromBase(leftBase, lot.unit) * 1000) / 1000;
    const usedBase = Math.min(have.quantity, wanted.quantity);
    return { lot: next, usedQty: fromBase(usedBase, lot.unit), unit: lot.unit };
  }
  if (lot.unit === unit) {
    const used = Math.min(lot.quantity, qty);
    next.quantity = Math.round((lot.quantity - used) * 1000) / 1000;
    return { lot: next, usedQty: used, unit };
  }
  const used = Math.min(lot.quantity, lot.quantity >= 1 ? 1 : lot.quantity);
  next.quantity = Math.round((lot.quantity - used) * 1000) / 1000;
  return { lot: next, usedQty: used, unit: lot.unit };
}

export function priceOf(productId, storeId, overrides = []) {
  const custom = overrides.find((row) => row.productId === productId && row.storeId === storeId);
  if (custom && Number.isFinite(+custom.price)) return +custom.price;
  const table = REFERENCE_PRICES[productId];
  if (table && Number.isFinite(+table[storeId])) return +table[storeId];
  return null;
}

export function compareProduct(productId, overrides = []) {
  const rows = STORES.map((store) => ({
    store,
    price: priceOf(productId, store.id, overrides),
    custom: overrides.some((row) => row.productId === productId && row.storeId === store.id),
  })).filter((row) => row.price !== null);
  const cheapest = rows.reduce((best, row) => (best === null || row.price < best.price ? row : best), null);
  return { rows, cheapest };
}

export function shoppingComparison(items, overrides = []) {
  const pending = items.filter((item) => !item.checked);
  const totals = STORES.map((store) => {
    let total = 0;
    let priced = 0;
    let missing = 0;
    for (const item of pending) {
      const product = item.productId ? productById(item.productId) : matchProduct(item.name);
      const price = product ? priceOf(product.id, store.id, overrides) : null;
      if (price === null) {
        missing += 1;
        continue;
      }
      const qty = Number(item.quantity) || 1;
      const line = lineCost(price, product.unit, qty, item.unit || product.unit);
      total += line;
      priced += 1;
    }
    return { store, total: Math.round(total * 100) / 100, priced, missing };
  }).filter((row) => row.priced > 0);
  totals.sort((a, b) => a.total - b.total);
  const best = totals[0] || null;
  const worst = totals[totals.length - 1] || null;
  const savings = best && worst ? Math.round((worst.total - best.total) * 100) / 100 : 0;
  return { totals, best, savings, pendingCount: pending.length };
}

function lineCost(unitPrice, priceUnit, qty, qtyUnit) {
  const leftEggs = asEggs(qty, qtyUnit);
  const rightEggs = asEggs(1, priceUnit);
  if (leftEggs !== null && rightEggs !== null && rightEggs !== 0) {
    return unitPrice * (leftEggs / rightEggs);
  }
  const left = toBase(qty, qtyUnit);
  const right = toBase(1, priceUnit);
  if (left && right && left.unit === right.unit) return unitPrice * (left.quantity / right.quantity);
  if (qtyUnit === priceUnit) return unitPrice * qty;
  return unitPrice * qty;
}

export function learnHabits(consumption, pantry, today = todayISO()) {
  const windowStart = addDays(today, -45);
  const groups = new Map();
  for (const event of consumption) {
    if (event.kind === "wasted") continue;
    if (event.at < windowStart) continue;
    const key = event.productId || norm(event.name);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(event);
  }
  const suggestions = [];
  for (const [key, events] of groups) {
    if (events.length < 2) continue;
    const product = productById(events[0].productId);
    const name = product?.name || events[0].name;
    const unit = product?.unit || events[0].unit || "un";
    const inPantry = pantry
      .filter((item) => (product ? item.productId === product.id : norm(item.name) === key))
      .reduce((sum, item) => sum + (item.unit === unit ? item.quantity : 0), 0);
    const avg = events.reduce((sum, event) => sum + (Number(event.quantity) || 1), 0) / events.length;
    if (inPantry > avg) continue;
    const dates = events.map((event) => event.at).sort();
    suggestions.push({
      productId: product?.id || "",
      name,
      unit,
      quantity: Math.max(1, Math.round(avg * 10) / 10),
      times: events.length,
      inPantry,
      reason: inPantry <= 0
        ? `Lo usaron ${events.length} veces en mes y medio y ya no queda.`
        : `Lo usaron ${events.length} veces y queda poco (${formatQty(inPantry, unit)}).`,
      lastAt: dates[dates.length - 1],
    });
  }
  suggestions.sort((a, b) => b.times - a.times || a.name.localeCompare(b.name, "es"));
  return suggestions.slice(0, 5);
}

export function monthStats(state, today = todayISO()) {
  const start = addDays(today, -30);
  const inMonth = (iso) => {
    const day = String(iso || "");
    return day >= start && day <= today;
  };
  const saved = state.consumption
    .filter((event) => event.kind === "cooked" && inMonth(event.at))
    .reduce((sum, event) => sum + (Number(event.savedAmount) || 0), 0);
  const wasted = state.consumption
    .filter((event) => event.kind === "wasted" && inMonth(event.at))
    .reduce((sum, event) => sum + (Number(event.wastedAmount) || 0), 0);
  const budget = Number(state.settings?.monthlyBudget) || 0;
  const wasteShare = budget > 0 ? wasted / budget : 0;
  const reduction = saved + wasted > 0 ? saved / (saved + wasted) : 0;
  const alerts = state.pantry
    .map((item) => ({ item, status: expiryStatus(item.expiresOn, today) }))
    .filter((row) => row.status.level === "expired" || row.status.level === "urgent" || row.status.level === "soon")
    .sort((a, b) => (a.status.days ?? 99) - (b.status.days ?? 99));
  const stockValue = state.pantry.reduce((sum, item) => sum + (Number(item.unitPrice) || 0) * (Number(item.quantity) || 0), 0);
  return {
    saved: Math.round(saved * 100) / 100,
    wasted: Math.round(wasted * 100) / 100,
    wasteShare,
    reduction,
    alerts,
    stockValue: Math.round(stockValue * 100) / 100,
    products: state.pantry.length,
  };
}

export function estimateLotValue(item) {
  const price = Number(item.unitPrice);
  const qty = Number(item.quantity);
  if (!Number.isFinite(price) || !Number.isFinite(qty)) return 0;
  return Math.round(price * qty * 100) / 100;
}

export function referenceUnitPrice(productId) {
  const table = REFERENCE_PRICES[productId];
  if (!table) return null;
  const values = Object.values(table).filter((n) => Number.isFinite(n));
  if (!values.length) return null;
  return Math.min(...values);
}
