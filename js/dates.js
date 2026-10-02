/** Fechas, ids y formato compartidos. Sin dependencia del DOM. */

export function createId() {
  if (globalThis.crypto?.randomUUID) return crypto.randomUUID();
  return `id-${Date.now().toString(16)}-${Math.random().toString(16).slice(2)}`;
}

export function todayISO(date = new Date()) {
  const z = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${z(date.getMonth() + 1)}-${z(date.getDate())}`;
}

export function parseISODate(iso) {
  if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null;
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(iso, days) {
  const base = parseISODate(iso) || new Date();
  base.setDate(base.getDate() + days);
  return todayISO(base);
}

export function daysUntil(iso, today = todayISO()) {
  const target = parseISODate(iso);
  const start = parseISODate(today);
  if (!target || !start) return null;
  return Math.round((target - start) / 86400000);
}

export function norm(value) {
  return String(value ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function money(value) {
  const n = Number.isFinite(+value) ? +value : 0;
  const digits = Math.abs(n) > 0 && Math.abs(n) < 1 ? 3 : 2;
  const [whole, frac] = n.toFixed(digits).split(".");
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `Bs ${grouped}.${frac}`;
}

export function formatQty(quantity, unit) {
  const n = Number(quantity);
  if (!Number.isFinite(n)) return unit ? `— ${unit}` : "—";
  const shown = Number.isInteger(n) ? String(n) : String(Math.round(n * 100) / 100);
  return unit ? `${shown} ${unit}` : shown;
}

export function parseNum(raw) {
  let s = String(raw ?? "").trim().replace(/\s/g, "");
  if (!s) return null;
  if (s.includes(",") && s.includes(".")) {
    if (s.lastIndexOf(",") > s.lastIndexOf(".")) s = s.replace(/\./g, "").replace(",", ".");
    else s = s.replace(/,/g, "");
  } else if (s.includes(",")) {
    s = s.replace(",", ".");
  }
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

export function esc(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
