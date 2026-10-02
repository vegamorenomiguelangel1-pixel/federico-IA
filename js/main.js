import {
  CATEGORIES,
  LOCATIONS,
  PDF_HREF,
  PRODUCTS,
  RECIPES,
  SAMPLE_RECEIPT,
  STORES,
  UNITS,
} from "./catalog.js";
import { esc, todayISO } from "./dates.js";
import {
  addDays,
  compareProduct,
  createId,
  deductFromLot,
  estimateLotValue,
  examplePhotoResult,
  expiryStatus,
  formatQty,
  identifyFromImage,
  learnHabits,
  locationLabel,
  matchProduct,
  money,
  monthStats,
  parseReceipt,
  productById,
  rankRecipes,
  referenceUnitPrice,
  shoppingComparison,
  storeById,
} from "./engine.js";
import { loadState, normalize, resetState, saveState } from "./state.js";

const TITLES = {
  inicio: "Inicio",
  despensa: "Despensa",
  escanear: "Escanear",
  recetas: "Recetas",
  compras: "Compras",
  precios: "Precios",
  familia: "Familia",
};

let state = loadState();
const ui = {
  search: "",
  location: "todas",
  category: "todas",
  scanTab: "ticket",
  receiptText: "",
  parsed: null,
  photo: null,
  photoUrl: "",
  photoPick: 0,
  photoQty: 1,
  photoExpiry: "",
  recipeMode: "priorizar",
  priceProduct: "leche",
};

const $ = (id) => document.getElementById(id);

function activeMember() {
  return state.household.members.find((m) => m.id === state.household.activeMemberId) || state.household.members[0];
}

function memberName(id) {
  return state.household.members.find((m) => m.id === id)?.name?.split(" ")[0] || "Alguien";
}

function firstName(person = activeMember()) {
  return person?.name?.split(" ")[0] || "Hola";
}

function persist() {
  try {
    saveState(state);
  } catch {
    toast("No se pudo guardar en este navegador.");
  }
}

function logActivity(text) {
  state.activity.unshift({ id: createId(), at: todayISO(), memberId: activeMember().id, text });
  state.activity = state.activity.slice(0, 40);
}

function toast(message) {
  const el = $("toast");
  el.hidden = false;
  el.textContent = message;
  clearTimeout(toast._t);
  toast._t = setTimeout(() => { el.hidden = true; }, 2800);
}

function route() {
  const hash = location.hash.replace(/^#/, "");
  return TITLES[hash] ? hash : "inicio";
}

function go(next) {
  closeModal();
  if (location.hash === `#${next}`) render();
  else location.hash = next;
}

function closeModal() {
  $("modal-root").innerHTML = "";
}

function openModal(title, body) {
  $("modal-root").innerHTML = `
    <div class="modal-backdrop" data-action="close-modal">
      <div class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <h3 id="modal-title">${title}</h3>
        ${body}
      </div>
    </div>`;
  const dialog = $("modal-root").querySelector(".modal");
  requestAnimationFrame(() => dialog.querySelector("input, select, textarea, button")?.focus());
}

function options(list, selected, placeholder) {
  const head = placeholder ? `<option value="">${esc(placeholder)}</option>` : "";
  return head + list.map((item) => {
    const value = item.id ?? item;
    const label = item.label || item.name || item;
    return `<option value="${esc(value)}" ${value === selected ? "selected" : ""}>${esc(label)}</option>`;
  }).join("");
}

function productOptions(selected) {
  const groups = CATEGORIES.map((category) => {
    const items = PRODUCTS.filter((p) => p.category === category);
    if (!items.length) return "";
    return `<optgroup label="${esc(category)}">${items.map((p) => `<option value="${esc(p.id)}" ${p.id === selected ? "selected" : ""}>${esc(p.name)}</option>`).join("")}</optgroup>`;
  }).join("");
  return `<option value="">Otro, escribir el nombre</option>${groups}`;
}

function unitOptions(selected) {
  return UNITS.map((unit) => `<option ${unit === selected ? "selected" : ""}>${esc(unit)}</option>`).join("");
}

function badge(status) {
  return `<span class="badge ${esc(status.level)}">${esc(status.label)}</span>`;
}

function filteredPantry() {
  const q = ui.search.trim().toLowerCase();
  return state.pantry
    .filter((item) => ui.location === "todas" || item.location === ui.location)
    .filter((item) => ui.category === "todas" || item.category === ui.category)
    .filter((item) => !q || `${item.name} ${item.category}`.toLowerCase().includes(q))
    .sort((a, b) => {
      const da = expiryStatus(a.expiresOn).days;
      const db = expiryStatus(b.expiresOn).days;
      return (da ?? 9999) - (db ?? 9999);
    });
}

function renderChrome() {
  const person = activeMember();
  const select = $("member-select");
  select.innerHTML = state.household.members.map((m) => `<option value="${esc(m.id)}">${esc(m.name)}</option>`).join("");
  select.value = person.id;
  $("page-title").textContent = TITLES[route()];
  $("top-home").textContent = `${state.household.name} · ${state.household.city}`;
  $("side-home").textContent = state.household.name;
  document.title = `${TITLES[route()]} · SmartPantry AI`;
  document.querySelectorAll("[data-route]").forEach((el) => {
    const on = el.dataset.route === route();
    el.classList.toggle("active", on);
    if (on) el.setAttribute("aria-current", "page");
    else el.removeAttribute("aria-current");
  });
}

function render() {
  renderChrome();
  const views = { inicio: viewHome, despensa: viewPantry, escanear: viewScan, recetas: viewRecipes, compras: viewShopping, precios: viewPrices, familia: viewFamily };
  $("view").innerHTML = views[route()]();
}

function viewHome() {
  const stats = monthStats(state);
  const person = firstName();
  const urgent = stats.alerts.filter((row) => row.status.level === "expired" || row.status.level === "urgent").length;
  const lead = stats.alerts.length
    ? `Hay ${stats.alerts.length} producto${stats.alerts.length === 1 ? "" : "s"} por vencer${urgent ? `, ${urgent} con prisa` : ""}. Cocinarlos evita tirar comida y plata.`
    : "Nada vence en los próximos 7 días. Buen momento para planear las compras.";
  const recipes = rankRecipes(state.pantry).filter((row) => row.coverage > 0);
  const top = recipes[0];
  const habits = learnHabits(state.consumption, state.pantry).slice(0, 3);
  const banner = state.settings.banner && state.settings.demo ? `
    <div class="banner">
      <p><strong>Despensa de ejemplo.</strong> Es la familia Rojas, en Santa Cruz. Puedes usarla para probar o vaciarla y cargar la tuya.</p>
      <div class="banner-actions">
        <button class="btn btn-primary btn-small" type="button" data-action="dismiss-banner">Seguir con el ejemplo</button>
        <button class="btn btn-ghost btn-small" type="button" data-action="confirm-empty">Empezar de cero</button>
      </div>
    </div>` : "";
  return `
    ${banner}
    <section class="hero">
      <p class="kicker">Despensa familiar</p>
      <h3>Hola, ${esc(person)}</h3>
      <p>${esc(lead)}</p>
    </section>
    <div class="stats">
      <article class="stat"><span>En la despensa</span><strong>${stats.products}</strong><em>${esc(money(stats.stockValue))} estimados</em></article>
      <article class="stat warn"><span>Por vencer</span><strong>${stats.alerts.length}</strong><em>en 7 días o ya vencidos</em></article>
      <article class="stat good"><span>Ahorro (30 días)</span><strong>${esc(money(stats.saved))}</strong><em>al cocinar lo que vencía</em></article>
      <article class="stat bad"><span>Desperdicio</span><strong>${esc(money(stats.wasted))}</strong><em>${Math.round(stats.wasteShare * 1000) / 10}% del presupuesto</em></article>
    </div>
    <div class="section-head"><h3>Alertas de vencimiento</h3><a href="#despensa">Ver despensa</a></div>
    <div class="alert-list">
      ${stats.alerts.length ? stats.alerts.slice(0, 5).map((row) => `
        <article class="alert ${esc(row.status.level)}">
          <div><strong>${esc(row.item.name)}</strong><p class="meta">${esc(formatQty(row.item.quantity, row.item.unit))} · ${esc(locationLabel(row.item.location))}</p></div>
          ${badge(row.status)}
        </article>`).join("") : `<div class="empty"><h3>Sin alertas</h3><p class="muted">Cuando un producto se acerque a su fecha, va a aparecer aquí.</p></div>`}
    </div>
    <div class="split" style="margin-top:1rem">
      <section>
        <div class="section-head"><h3>Receta para hoy</h3><a href="#recetas">Todas</a></div>
        ${top ? recipeCard(top, true) : `<div class="empty"><p>Agrega productos y el motor arma recetas con lo que está por vencer.</p></div>`}
      </section>
      <section>
        <div class="section-head"><h3>Hábitos de la casa</h3></div>
        <div class="stack">
          ${habits.length ? habits.map((h) => `
            <article class="suggestion">
              <strong>${esc(h.name)}</strong>
              <p class="meta">${esc(h.reason)}</p>
              <button class="btn btn-small btn-primary" type="button" data-action="accept-habit" data-id="${esc(h.productId)}" data-name="${esc(h.name)}" data-qty="${esc(h.quantity)}" data-unit="${esc(h.unit)}">Sumar a la lista</button>
            </article>`).join("") : `<div class="empty"><p>Cuando registres consumos, la lista va a aprender qué reponer.</p></div>`}
        </div>
      </section>
    </div>
    <div class="section-head"><h3>Atajos</h3></div>
    <div class="shortcuts">
      <a class="shortcut accent" href="#escanear"><strong>Escanear ticket</strong><span>Carga la compra en un paso</span></a>
      <a class="shortcut" href="#recetas"><strong>Cero desperdicio</strong><span>Recetas con lo que vence</span></a>
      <a class="shortcut" href="#compras"><strong>Lista familiar</strong><span>Compartida en este hogar</span></a>
      <a class="shortcut" href="#precios"><strong>Precios</strong><span>Hipermaxi, IC Norte, Fidalga, Ketal</span></a>
      <a class="shortcut" href="#familia"><strong>Familia</strong><span>Miembros, ahorro e informe</span></a>
      <a class="shortcut" href="${esc(PDF_HREF)}"><strong>Informe PDF</strong><span>El plan estratégico original</span></a>
    </div>`;
}

function viewPantry() {
  const items = filteredPantry();
  const cats = ["todas", ...CATEGORIES.filter((c) => state.pantry.some((item) => item.category === c))];
  return `
    <div class="toolbar">
      <input class="search" id="pantry-search" type="search" placeholder="Buscar en la despensa" value="${esc(ui.search)}" aria-label="Buscar en la despensa">
      <button class="btn btn-primary" type="button" data-action="add-item">Agregar</button>
      <a class="btn btn-accent" href="#escanear">Escanear</a>
    </div>
    <div class="chips" role="tablist" aria-label="Lugar">
      ${[["todas", "Todos"], ...LOCATIONS.map((l) => [l.id, l.label])].map(([id, label]) => `
        <button class="chip ${ui.location === id ? "active" : ""}" type="button" data-action="filter-location" data-id="${esc(id)}">${esc(label)}</button>`).join("")}
    </div>
    <div class="chips" style="margin:0.55rem 0 0.8rem" aria-label="Categoría">
      ${cats.map((id) => `<button class="chip ${ui.category === id ? "active" : ""}" type="button" data-action="filter-category" data-id="${esc(id)}">${esc(id === "todas" ? "Todas" : id)}</button>`).join("")}
    </div>
    <p class="muted" id="pantry-count">${items.length} producto${items.length === 1 ? "" : "s"}</p>
    <div class="stack" id="pantry-list">${pantryCards(items)}</div>`;
}

function pantryCards(items = filteredPantry()) {
  if (!items.length) {
    return `<div class="empty"><h3>No hay productos con ese filtro</h3><p class="muted">Agrega uno a mano o escanea un ticket.</p></div>`;
  }
  return items.map((item) => {
    const status = expiryStatus(item.expiresOn);
    return `
      <article class="item">
        <div class="item-top">
          <div>
            <h3>${esc(item.name)}</h3>
            <p class="meta">${esc(formatQty(item.quantity, item.unit))} · ${esc(item.category)} · ${esc(locationLabel(item.location))}</p>
            <p class="meta">${item.unitPrice ? esc(money(item.unitPrice)) + " c/u" : "Sin precio"} ${item.storeId ? "· " + esc(storeById(item.storeId)?.name || "") : ""} · ${esc(memberName(item.addedBy))}</p>
          </div>
          ${badge(status)}
        </div>
        <div class="btn-row" style="margin-top:0.7rem">
          <button class="btn btn-small btn-success" type="button" data-action="consume-item" data-id="${esc(item.id)}">Consumir</button>
          <button class="btn btn-small" type="button" data-action="edit-item" data-id="${esc(item.id)}">Editar</button>
          <button class="btn btn-small" type="button" data-action="to-shopping" data-id="${esc(item.id)}">A la lista</button>
          <button class="btn btn-small btn-warn" type="button" data-action="waste-item" data-id="${esc(item.id)}">Se echó a perder</button>
          <button class="btn btn-small btn-danger" type="button" data-action="delete-item" data-id="${esc(item.id)}">Eliminar</button>
        </div>
      </article>`;
  }).join("");
}

function viewScan() {
  const ticketOn = ui.scanTab === "ticket";
  return `
    <div class="chips" role="tablist" aria-label="Modo de escaneo">
      <button class="chip ${ticketOn ? "active" : ""}" type="button" data-action="scan-tab" data-id="ticket">Ticket</button>
      <button class="chip ${!ticketOn ? "active" : ""}" type="button" data-action="scan-tab" data-id="foto">Foto</button>
    </div>
    ${ticketOn ? scanTicket() : scanPhoto()}
    <p class="help">El reconocimiento corre en el teléfono, sin clave ni servidor. OCR y visión reales se pueden conectar en <strong>js/engine.js</strong> sin cambiar el resto de la app.</p>`;
}

function scanTicket() {
  const parsed = ui.parsed;
  return `
    <div class="field" style="margin-top:0.8rem">
      <span>Texto del ticket</span>
      <textarea id="receipt-text" placeholder="Pega aquí el ticket o carga el ejemplo de Hipermaxi">${esc(ui.receiptText)}</textarea>
    </div>
    <div class="btn-row" style="margin:0.7rem 0">
      <button class="btn btn-primary" type="button" data-action="parse-receipt">Leer ticket</button>
      <button class="btn btn-ghost" type="button" data-action="load-sample-receipt">Cargar ejemplo</button>
    </div>
    ${parsed ? `
      <div class="compare" style="margin-bottom:0.8rem">
        <strong>${esc(storeById(parsed.storeId)?.name || "Tienda no detectada")}</strong>
        <p class="meta">Fecha ${esc(parsed.date)} · ${parsed.items.length} ítems · suma ${esc(money(parsed.sum))}</p>
        <label class="field" style="margin-top:0.5rem"><span>Guardar con esta tienda</span>
          <select id="receipt-store">${options(STORES, parsed.storeId, "Sin tienda")}</select>
        </label>
      </div>
      <div class="stack" id="parsed-list">
        ${parsed.items.map((item, index) => `
          <article class="item" data-parsed-row="${index}">
            <label class="checkline" style="border:0;padding:0;box-shadow:none">
              <input type="checkbox" data-field="include" data-index="${index}" ${item.include ? "checked" : ""}>
              <span><strong>${Math.round(item.confidence * 100)}%</strong><p class="raw">${esc(item.raw)}</p></span>
            </label>
            <div class="grid-form" style="margin-top:0.55rem">
              <label class="field"><span>Nombre</span><input data-field="name" data-index="${index}" value="${esc(item.name)}"></label>
              <div class="two">
                <label class="field"><span>Cantidad</span><input data-field="quantity" data-index="${index}" type="number" min="0" step="0.01" value="${esc(item.quantity)}"></label>
                <label class="field"><span>Unidad</span><select data-field="unit" data-index="${index}">${unitOptions(item.unit)}</select></label>
              </div>
              <div class="two">
                <label class="field"><span>Precio del renglón (Bs)</span><input data-field="linePrice" data-index="${index}" type="number" min="0" step="0.01" value="${item.linePrice ?? ""}"></label>
                <label class="field"><span>Vencimiento</span><input data-field="expiresOn" data-index="${index}" type="date" value="${esc(item.expiresOn)}"></label>
              </div>
            </div>
          </article>`).join("")}
      </div>
      <button class="btn btn-success" type="button" data-action="commit-receipt" style="margin-top:0.8rem">Agregar a la despensa</button>
    ` : `<div class="empty"><h3>Nada entra solo</h3><p class="muted">Revisa productos, cantidades y precios antes de confirmar. Así evitas cargar mal un ticket.</p></div>`}`;
}

function scanPhoto() {
  const photo = ui.photo;
  const picked = photo?.suggestions?.[ui.photoPick];
  return `
    <p class="meta" style="margin-top:0.8rem">Toma o sube una foto del producto. Si el archivo se llama como el alimento, la coincidencia es directa. Si no, el color orienta la categoría.</p>
    <div class="btn-row" style="margin:0.7rem 0">
      <label class="btn btn-primary">Elegir foto<input id="photo-input" class="sr" type="file" accept="image/*" capture="environment"></label>
      <button class="btn btn-ghost" type="button" data-action="sample-photo" data-id="leche">Ejemplo: leche</button>
      <button class="btn btn-ghost" type="button" data-action="sample-photo" data-id="tomate">Ejemplo: tomate</button>
    </div>
    ${ui.photoUrl ? `<img class="photo-preview" alt="Foto elegida para identificar" src="${esc(ui.photoUrl)}">` : ""}
    ${photo ? `
      <p class="meta">${esc(photo.note)}</p>
      <div class="stack">
        ${photo.suggestions.map((row, index) => `
          <button class="pick ${index === ui.photoPick ? "selected" : ""}" type="button" data-action="pick-photo" data-index="${index}">
            <strong>${esc(row.product.name)}</strong>
            <p class="meta">${Math.round(row.confidence * 100)}% · ${esc(row.reason)}</p>
          </button>`).join("")}
      </div>
      ${picked ? `
        <div class="grid-form" style="margin-top:0.8rem">
          <div class="two">
            <label class="field"><span>Cantidad</span><input id="photo-qty" type="number" min="0.01" step="0.01" value="${esc(ui.photoQty)}"></label>
            <label class="field"><span>Vencimiento</span><input id="photo-expiry" type="date" value="${esc(ui.photoExpiry || addDays(todayISO(), picked.product.expiryDays))}"></label>
          </div>
          <button class="btn btn-success" type="button" data-action="commit-photo">Guardar ${esc(picked.product.name)}</button>
        </div>` : ""}
    ` : ""}`;
}

function recipeCard(row, compact) {
  const { recipe, used, missing, coverage } = row;
  const ings = recipe.ingredients.map((ing) => {
    const hit = used.find((u) => u.productId === ing.productId);
    const cls = hit ? (hit.days !== null && hit.days <= 7 ? "hot" : "in") : "";
    return `<span class="ing ${cls}">${esc(ing.name)}</span>`;
  }).join("");
  return `
    <article class="recipe">
      <div class="item-top">
        <h3>${esc(recipe.name)}</h3>
        <span class="badge ${coverage === 1 ? "ok" : "soon"}">${Math.round(coverage * 100)}%</span>
      </div>
      <p class="meta">${esc(recipe.blurb)} · ${recipe.minutes} min · ${recipe.servings} porciones</p>
      <div class="bar" aria-hidden="true"><span style="width:${Math.round(coverage * 100)}%"></span></div>
      <div class="ings">${ings}</div>
      ${compact ? "" : `<ol class="steps">${recipe.steps.map((step) => `<li>${esc(step)}</li>`).join("")}</ol>`}
      <p class="meta">${missing.length ? `Falta: ${esc(missing.map((m) => m.name).join(", "))}` : "Tienes todos los ingredientes."}</p>
      <div class="btn-row">
        <button class="btn btn-success btn-small" type="button" data-action="cook" data-id="${esc(recipe.id)}" ${used.length ? "" : "disabled"}>Cocinar con lo que hay</button>
        ${missing.length ? `<button class="btn btn-small" type="button" data-action="missing-to-list" data-id="${esc(recipe.id)}">Faltantes a la lista</button>` : ""}
      </div>
    </article>`;
}

function viewRecipes() {
  let rows = rankRecipes(state.pantry);
  if (ui.recipeMode === "vencer") rows = rows.filter((row) => row.expiringHits > 0);
  return `
    <p class="meta">El motor prioriza recetas que usan lo que vence pronto. Los ingredientes en ámbar están por caducar; los celestes ya están en casa.</p>
    <div class="chips" style="margin:0.7rem 0">
      <button class="chip ${ui.recipeMode === "priorizar" ? "active" : ""}" type="button" data-action="recipe-mode" data-id="priorizar">Todas, priorizadas</button>
      <button class="chip ${ui.recipeMode === "vencer" ? "active" : ""}" type="button" data-action="recipe-mode" data-id="vencer">Solo con lo que vence</button>
    </div>
    <div class="stack">
      ${rows.length ? rows.map((row) => recipeCard(row, false)).join("") : `<div class="empty"><h3>Sin coincidencias</h3><p class="muted">No hay recetas con ingredientes por vencer. Prueba el listado completo.</p></div>`}
    </div>`;
}

function viewShopping() {
  const cmp = shoppingComparison(state.shopping, state.prices);
  const habits = learnHabits(state.consumption, state.pantry);
  const pending = state.shopping.filter((item) => !item.checked);
  const done = state.shopping.filter((item) => item.checked);
  const banner = cmp.best && pending.length ? `
    <div class="compare">
      <strong>Conviene ${esc(cmp.best.store.name)}</strong>
      <p class="meta">Estimado ${esc(money(cmp.best.total))} para ${cmp.best.priced} producto${cmp.best.priced === 1 ? "" : "s"}.${cmp.savings > 0 ? ` Frente a la opción más cara ahorras ${esc(money(cmp.savings))}.` : ""}</p>
    </div>` : "";
  return `
    ${banner}
    <form id="shopping-form" class="grid-form" style="margin:0.8rem 0">
      <label class="field"><span>Agregar a la lista familiar</span><input name="name" required placeholder="Ej. papa, leche, pan"></label>
      <div class="two">
        <label class="field"><span>Cantidad</span><input name="quantity" type="number" min="0.01" step="0.01" value="1" required></label>
        <label class="field"><span>Unidad</span><select name="unit">${unitOptions("un")}</select></label>
      </div>
      <button class="btn btn-primary" type="submit">Agregar</button>
    </form>
    <div class="stack">
      ${pending.concat(done).map(shoppingRow).join("") || `<div class="empty"><h3>La lista está vacía</h3><p class="muted">Lo que anote cualquier miembro queda para toda la casa.</p></div>`}
    </div>
    ${done.length ? `<button class="btn btn-ghost" type="button" data-action="clear-checked" style="margin-top:0.7rem">Quitar lo ya comprado</button>` : ""}
    <div class="section-head"><h3>Sugerido por hábitos</h3></div>
    <div class="stack">
      ${habits.length ? habits.map((h) => `
        <article class="suggestion">
          <strong>${esc(h.name)}</strong>
          <p class="meta">${esc(h.reason)} Sugerido: ${esc(formatQty(h.quantity, h.unit))}.</p>
          <button class="btn btn-small btn-accent" type="button" data-action="accept-habit" data-id="${esc(h.productId)}" data-name="${esc(h.name)}" data-qty="${esc(h.quantity)}" data-unit="${esc(h.unit)}">Agregar</button>
        </article>`).join("") : `<p class="muted">Todavía no hay un patrón claro de reposición.</p>`}
    </div>`;
}

function shoppingRow(item) {
  return `
    <div class="item">
      <label class="checkline ${item.checked ? "done" : ""}" style="border:0;padding:0">
        <input type="checkbox" data-action="toggle-shopping" data-id="${esc(item.id)}" ${item.checked ? "checked" : ""}>
        <span>
          <strong>${esc(item.name)}</strong>
          <p class="meta">${esc(formatQty(item.quantity, item.unit))} · anotó ${esc(memberName(item.addedBy))}</p>
        </span>
      </label>
      <div class="btn-row">
        ${item.checked ? `<button class="btn btn-small btn-success" type="button" data-action="shopping-to-pantry" data-id="${esc(item.id)}">Pasar a la despensa</button>` : ""}
        <button class="btn btn-small btn-danger" type="button" data-action="delete-shopping" data-id="${esc(item.id)}">Quitar</button>
      </div>
    </div>`;
}

function viewPrices() {
  const cmp = compareProduct(ui.priceProduct, state.prices);
  const product = productById(ui.priceProduct);
  return `
    <p class="meta">Precios de referencia en bolivianos para Santa Cruz (Hipermaxi, IC Norte, Fidalga) y La Paz (Ketal). Si viste otro valor en góndola, regístralo: reemplaza al de referencia.</p>
    <label class="field" style="margin:0.8rem 0"><span>Producto</span>
      <select id="price-product">${productOptions(ui.priceProduct).replace('<option value="">Otro, escribir el nombre</option>', "")}</select>
    </label>
    <div class="stores">
      ${cmp.rows.map((row) => `
        <article class="store-card ${cmp.cheapest && row.store.id === cmp.cheapest.store.id ? "best" : ""}">
          <div class="item-top">
            <h3>${esc(row.store.name)}</h3>
            ${cmp.cheapest && row.store.id === cmp.cheapest.store.id ? `<span class="badge best">Más barato</span>` : ""}
          </div>
          <p class="meta">${esc(row.store.city)}</p>
          <strong>${esc(money(row.price))}</strong>
          <p class="meta">por ${esc(product?.unit || "un")}${row.custom ? " · precio que registraste" : " · referencia"}</p>
        </article>`).join("")}
    </div>
    <form id="price-form" class="grid-form" style="margin-top:0.9rem">
      <h3 style="margin:0">Registrar un precio visto</h3>
      <div class="two">
        <label class="field"><span>Tienda</span><select name="storeId">${options(STORES, "icnorte")}</select></label>
        <label class="field"><span>Precio (Bs por ${esc(product?.unit || "un")})</span><input name="price" type="number" min="0" step="0.01" required></label>
      </div>
      <button class="btn btn-primary" type="submit">Guardar precio</button>
    </form>`;
}

function viewFamily() {
  const stats = monthStats(state);
  const max = Math.max(stats.saved, stats.wasted, 1);
  return `
    <blockquote class="quote">“La app familiar que administra tu despensa con IA, reduce el desperdicio al mínimo y optimiza tu presupuesto automáticamente.”<span>Propuesta de SmartPantry AI</span></blockquote>
    <div class="section-head"><h3>Reducción de desperdicio</h3></div>
    <article class="card" style="padding:0.9rem">
      <p class="meta">En 30 días salvaste ${esc(money(stats.saved))} y se perdieron ${esc(money(stats.wasted))}. Eso es ${Math.round(stats.reduction * 100)}% de aprovechamiento entre lo cocinado a tiempo y lo tirado.</p>
      <p class="meta">La pérdida es ${Math.round(stats.wasteShare * 1000) / 10}% de un presupuesto de ${esc(money(state.settings.monthlyBudget))}. El informe marca hasta un 20% como problema habitual en los hogares.</p>
      <div class="meter">
        <div><span>Rescatado</span><span>${esc(money(stats.saved))}</span></div>
        <div class="track"><i class="saved" style="width:${Math.round((stats.saved / max) * 100)}%"></i></div>
        <div><span>Perdido</span><span>${esc(money(stats.wasted))}</span></div>
        <div class="track"><i class="lost" style="width:${Math.round((stats.wasted / max) * 100)}%"></i></div>
      </div>
    </article>
    <form id="home-form" class="grid-form" style="margin-top:0.9rem">
      <div class="two">
        <label class="field"><span>Nombre del hogar</span><input name="name" value="${esc(state.household.name)}" required></label>
        <label class="field"><span>Ciudad</span><input name="city" value="${esc(state.household.city)}" required></label>
      </div>
      <label class="field"><span>Presupuesto mensual de alimentos (Bs)</span><input name="budget" type="number" min="0" step="1" value="${esc(state.settings.monthlyBudget)}" required></label>
      <button class="btn btn-primary" type="submit">Guardar hogar</button>
    </form>
    <div class="section-head"><h3>Miembros</h3></div>
    <div class="stack">
      ${state.household.members.map((m) => `
        <article class="item member">
          <div class="avatar" style="background:${esc(m.color)}">${esc(m.name.slice(0, 1))}</div>
          <div style="flex:1">
            <strong>${esc(m.name)}</strong>
            <p class="meta">${esc(m.role || "En casa")}${m.id === state.household.activeMemberId ? " · usando la app ahora" : ""}</p>
          </div>
          <button class="btn btn-small btn-ghost" type="button" data-action="delete-member" data-id="${esc(m.id)}">Quitar</button>
        </article>`).join("")}
    </div>
    <form id="member-form" class="grid-form" style="margin-top:0.7rem">
      <label class="field"><span>Nuevo miembro</span><input name="name" placeholder="Nombre" required></label>
      <button class="btn btn-accent" type="submit">Sumar a la familia</button>
    </form>
    <div class="section-head"><h3>Actividad compartida</h3></div>
    <ul class="activity">
      ${state.activity.length ? state.activity.slice(0, 8).map((row) => `<li><strong>${esc(memberName(row.memberId))}</strong> · ${esc(row.text)}<p class="meta">${esc(row.at)}</p></li>`).join("") : "<li>Todavía no hay movimientos.</li>"}
    </ul>
    <div class="section-head"><h3>Llevar el hogar a otro teléfono</h3></div>
    <p class="meta">Exporta el archivo e impórtalo en el otro celular. La despensa, la lista y los precios quedan alineados. No hay cuenta ni nube: el archivo es la sincronización.</p>
    <div class="btn-row" style="margin-top:0.6rem">
      <button class="btn btn-primary" type="button" data-action="export-home">Exportar hogar</button>
      <label class="btn btn-ghost">Importar<input id="import-file" class="sr" type="file" accept="application/json,.json"></label>
    </div>
    <div class="section-head"><h3>Datos y informe</h3></div>
    <div class="btn-row">
      <button class="btn btn-ghost" type="button" data-action="confirm-reset">Restaurar demostración</button>
      <button class="btn btn-ghost" type="button" data-action="confirm-empty">Empezar de cero</button>
      <a class="btn btn-accent" href="${esc(PDF_HREF)}">Abrir informe PDF</a>
    </div>`;
}

function findItem(id) {
  return state.pantry.find((item) => item.id === id);
}

function pantryForm(item) {
  const productId = item?.productId || "";
  return `
    <form id="pantry-form" class="grid-form">
      <input type="hidden" name="id" value="${esc(item?.id || "")}">
      <input type="hidden" name="fromShoppingId" value="${esc(item?.fromShoppingId || "")}">
      <label class="field"><span>Del catálogo</span><select name="productId" data-action="fill-product">${productOptions(productId)}</select></label>
      <label class="field"><span>Nombre</span><input name="name" required value="${esc(item?.name || "")}"></label>
      <div class="two">
        <label class="field"><span>Cantidad</span><input name="quantity" type="number" min="0.01" step="0.01" required value="${esc(item?.quantity ?? 1)}"></label>
        <label class="field"><span>Unidad</span><select name="unit">${unitOptions(item?.unit || "un")}</select></label>
      </div>
      <div class="two">
        <label class="field"><span>Lugar</span><select name="location">${options(LOCATIONS, item?.location || "despensa")}</select></label>
        <label class="field"><span>Categoría</span><select name="category">${CATEGORIES.map((c) => `<option ${c === (item?.category || "Otros") ? "selected" : ""}>${esc(c)}</option>`).join("")}</select></label>
      </div>
      <div class="two">
        <label class="field"><span>Vencimiento</span><input name="expiresOn" type="date" value="${esc(item?.expiresOn || "")}"></label>
        <label class="field"><span>Precio por unidad (Bs)</span><input name="unitPrice" type="number" min="0" step="0.001" value="${item?.unitPrice ?? ""}"></label>
      </div>
      <label class="field"><span>Tienda</span><select name="storeId">${options(STORES, item?.storeId || "", "Sin tienda")}</select></label>
      <div class="btn-row">
        <button class="btn btn-primary" type="submit">Guardar</button>
        <button class="btn btn-ghost" type="button" data-action="close-modal">Cancelar</button>
      </div>
    </form>`;
}

function openPantryForm(item) {
  openModal(item ? "Editar producto" : "Nuevo producto", pantryForm(item));
}

function readPantryForm(form) {
  const data = new FormData(form);
  const quantity = Number(data.get("quantity"));
  const name = String(data.get("name") || "").trim();
  if (!name || !Number.isFinite(quantity) || quantity <= 0) return null;
  const unitPriceRaw = data.get("unitPrice");
  const product = productById(String(data.get("productId") || ""));
  return {
    id: String(data.get("id") || "") || createId(),
    productId: product?.id || matchProduct(name)?.id || "",
    name,
    category: String(data.get("category") || "Otros"),
    quantity,
    unit: String(data.get("unit") || "un"),
    location: String(data.get("location") || "despensa"),
    expiresOn: String(data.get("expiresOn") || ""),
    unitPrice: unitPriceRaw === "" || unitPriceRaw === null ? null : Number(unitPriceRaw),
    storeId: String(data.get("storeId") || ""),
    addedBy: activeMember().id,
    createdAt: todayISO(),
  };
}

function addShopping({ name, productId = "", quantity = 1, unit = "un" }) {
  const clean = name.trim();
  if (!clean) return false;
  const product = productId ? productById(productId) : matchProduct(clean);
  const existing = state.shopping.find((item) => !item.checked && normName(item.name) === normName(product?.name || clean));
  if (existing) {
    if (existing.unit === (product?.unit || unit)) existing.quantity = Math.round((Number(existing.quantity) + Number(quantity)) * 1000) / 1000;
    return true;
  }
  state.shopping.unshift({
    id: createId(),
    name: product?.name || clean,
    productId: product?.id || "",
    quantity: Number(quantity) || 1,
    unit: product?.unit || unit,
    checked: false,
    addedBy: activeMember().id,
  });
  return true;
}

function normName(value) {
  return String(value || "").trim().toLowerCase();
}

function syncParsedField(el) {
  if (!ui.parsed) return;
  const index = Number(el.dataset.index);
  const item = ui.parsed.items[index];
  if (!item) return;
  const field = el.dataset.field;
  if (field === "include") item.include = el.checked;
  else if (field === "quantity" || field === "linePrice") item[field] = el.value === "" ? null : Number(el.value);
  else item[field] = el.value;
  if (field === "linePrice" || field === "quantity") {
    const qty = Number(item.quantity) || 0;
    item.unitPrice = item.linePrice && qty ? Math.round((item.linePrice / qty) * 1000) / 1000 : null;
  }
}

function commitReceipt() {
  if (!ui.parsed) return;
  const storeEl = $("receipt-store");
  const storeId = storeEl ? storeEl.value : ui.parsed.storeId;
  const chosen = ui.parsed.items.filter((item) => item.include && item.name && Number(item.quantity) > 0);
  if (!chosen.length) {
    toast("Marca al menos un producto.");
    return;
  }
  for (const item of chosen) {
    const qty = Number(item.quantity);
    state.pantry.unshift({
      id: createId(),
      productId: item.productId || matchProduct(item.name)?.id || "",
      name: item.name.trim(),
      category: item.category || "Otros",
      quantity: qty,
      unit: item.unit || "un",
      location: item.location || "despensa",
      expiresOn: item.expiresOn || "",
      unitPrice: item.unitPrice,
      storeId: storeId || "",
      addedBy: activeMember().id,
      createdAt: todayISO(),
    });
  }
  state.receipts.unshift({
    id: createId(),
    storeId,
    date: ui.parsed.date,
    total: ui.parsed.sum,
    count: chosen.length,
  });
  logActivity(`${firstName()} cargó ${chosen.length} productos desde un ticket.`);
  ui.parsed = null;
  persist();
  toast(`Listo: ${chosen.length} productos en la despensa.`);
  go("despensa");
}

async function onPhotoFile(file) {
  if (!file) return;
  ui.photoUrl = URL.createObjectURL(file);
  const pixels = await pixelsFromFile(file);
  ui.photo = identifyFromImage({ fileName: file.name, pixels });
  ui.photoPick = 0;
  ui.photoQty = 1;
  const product = ui.photo.suggestions[0]?.product;
  ui.photoExpiry = product ? addDays(todayISO(), product.expiryDays) : "";
  render();
}

function pixelsFromFile(file) {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      const size = 48;
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      ctx.drawImage(image, 0, 0, size, size);
      const data = ctx.getImageData(0, 0, size, size).data;
      URL.revokeObjectURL(url);
      resolve(data);
    };
    image.onerror = () => resolve(null);
    image.src = url;
  });
}

function commitPhoto() {
  const suggestion = ui.photo?.suggestions?.[ui.photoPick];
  if (!suggestion) return;
  const qty = Number($("photo-qty")?.value || ui.photoQty);
  const expiresOn = $("photo-expiry")?.value || ui.photoExpiry;
  if (!qty || qty <= 0) {
    toast("Indica una cantidad.");
    return;
  }
  const product = suggestion.product;
  const ref = referenceUnitPrice(product.id);
  state.pantry.unshift({
    id: createId(),
    productId: product.id,
    name: product.name,
    category: product.category,
    quantity: qty,
    unit: product.unit,
    location: product.location,
    expiresOn,
    unitPrice: ref,
    storeId: "",
    addedBy: activeMember().id,
    createdAt: todayISO(),
  });
  logActivity(`${firstName()} identificó ${product.name} con una foto.`);
  ui.photo = null;
  ui.photoUrl = "";
  persist();
  toast(`${product.name} quedó en la despensa.`);
  go("despensa");
}

function cookRecipe(id) {
  const ranked = rankRecipes(state.pantry).find((row) => row.recipe.id === id);
  if (!ranked || !ranked.used.length) return;
  let saved = 0;
  for (const used of ranked.used) {
    const index = state.pantry.findIndex((item) => item.id === used.item.id);
    if (index < 0) continue;
    const result = deductFromLot(state.pantry[index], used.qty, used.unit);
    const price = Number(state.pantry[index].unitPrice) || referenceUnitPrice(state.pantry[index].productId) || 0;
    if (used.days !== null && used.days <= 7) saved += price * result.usedQty;
    if (result.lot.quantity <= 0.0005) state.pantry.splice(index, 1);
    else state.pantry[index] = { ...state.pantry[index], ...result.lot };
  }
  saved = Math.round(saved * 100) / 100;
  state.consumption.unshift({
    id: createId(),
    kind: "cooked",
    productId: ranked.recipe.ingredients[0].productId,
    name: ranked.recipe.name,
    quantity: 1,
    unit: "plato",
    at: todayISO(),
    memberId: activeMember().id,
    savedAmount: saved,
    wastedAmount: 0,
  });
  logActivity(`${firstName()} cocinó ${ranked.recipe.name}${saved ? ` y rescató ${money(saved)}` : ""}.`);
  persist();
  closeModal();
  toast(saved ? `${ranked.recipe.name} lista. Rescataste ${money(saved)}.` : `${ranked.recipe.name} lista.`);
  render();
}

function confirmCook(id) {
  const ranked = rankRecipes(state.pantry).find((row) => row.recipe.id === id);
  if (!ranked) return;
  openModal(`Cocinar ${esc(ranked.recipe.name)}`, `
    <p class="meta">Se descuenta de la despensa solo lo que tienes. Lo que vence en 7 días suma al ahorro.</p>
    <ul class="steps">
      ${ranked.used.map((u) => `<li>${esc(u.name)}: usar ${esc(formatQty(u.qty, u.unit))}</li>`).join("")}
    </ul>
    ${ranked.missing.length ? `<p class="meta">Sin descontar, porque no está: ${esc(ranked.missing.map((m) => m.name).join(", "))}.</p>` : ""}
    <div class="btn-row">
      <button class="btn btn-success" type="button" data-action="confirm-cook" data-id="${esc(id)}">Confirmar</button>
      <button class="btn btn-ghost" type="button" data-action="close-modal">Cancelar</button>
    </div>`);
}

function applyImport(text) {
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    toast("Ese archivo no es un hogar válido.");
    return;
  }
  if (!data || typeof data !== "object" || !data.household) {
    toast("El archivo no trae un hogar de SmartPantry.");
    return;
  }
  state = normalize(data);
  ui.parsed = null;
  persist();
  toast("Hogar importado en este teléfono.");
  render();
}

function exportHome() {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "smartpantry-hogar.json";
  link.click();
  URL.revokeObjectURL(link.href);
  toast("Archivo listo para compartir.");
}

function emptyHome() {
  state.pantry = [];
  state.shopping = [];
  state.consumption = [];
  state.receipts = [];
  state.activity = [];
  state.prices = [];
  state.settings.demo = false;
  state.settings.banner = false;
  logActivity(`${firstName()} empezó una despensa vacía.`);
  persist();
  closeModal();
  toast("Despensa vacía. Ya puedes cargar la tuya.");
  render();
}

function onClick(event) {
  const el = event.target.closest("[data-action]");
  if (!el) return;
  const action = el.dataset.action;
  const id = el.dataset.id;
  if (action === "close-modal") closeModal();
  else if (action === "open-menu") {
    openModal("Menú", `
      <div class="menu-list">
        <a href="#precios">Precios regionales</a>
        <a href="#familia">Familia y ahorro</a>
        <a href="${esc(PDF_HREF)}">Informe estratégico (PDF)</a>
        <button type="button" data-action="confirm-reset">Restaurar demostración</button>
      </div>`);
  } else if (action === "dismiss-banner") {
    state.settings.banner = false;
    persist();
    render();
  } else if (action === "filter-location") {
    ui.location = id;
    render();
  } else if (action === "filter-category") {
    ui.category = id;
    render();
  } else if (action === "add-item") openPantryForm(null);
  else if (action === "edit-item") openPantryForm(findItem(id));
  else if (action === "delete-item") {
    const item = findItem(id);
    if (!item) return;
    openModal("Eliminar producto", `<p>¿Quitamos ${esc(item.name)} de la despensa? No se cuenta como desperdicio.</p><div class="btn-row"><button class="btn btn-danger" type="button" data-action="confirm-delete-item" data-id="${esc(id)}">Eliminar</button><button class="btn btn-ghost" type="button" data-action="close-modal">Cancelar</button></div>`);
  } else if (action === "confirm-delete-item") {
    const item = findItem(id);
    state.pantry = state.pantry.filter((row) => row.id !== id);
    if (item) logActivity(`${firstName()} eliminó ${item.name}.`);
    persist();
    closeModal();
    toast("Producto eliminado.");
    render();
  } else if (action === "consume-item") {
    const item = findItem(id);
    if (!item) return;
    openModal(`Consumir ${esc(item.name)}`, `
      <form id="consume-form" class="grid-form">
        <input type="hidden" name="id" value="${esc(item.id)}">
        <label class="field"><span>Cantidad (${esc(item.unit)})</span><input name="quantity" type="number" min="0.01" step="0.01" max="${esc(item.quantity)}" value="${esc(Math.min(1, item.quantity))}" required></label>
        <p class="meta">Hay ${esc(formatQty(item.quantity, item.unit))}.</p>
        <div class="btn-row"><button class="btn btn-success" type="submit">Registrar consumo</button><button class="btn btn-ghost" type="button" data-action="close-modal">Cancelar</button></div>
      </form>`);
  } else if (action === "waste-item") {
    const item = findItem(id);
    if (!item) return;
    const value = estimateLotValue(item);
    openModal("Marcar desperdicio", `<p>${esc(item.name)} se va a quitar de la despensa y sumar ${esc(money(value))} al desperdicio del mes.</p><div class="btn-row"><button class="btn btn-warn" type="button" data-action="confirm-waste" data-id="${esc(id)}">Se echó a perder</button><button class="btn btn-ghost" type="button" data-action="close-modal">Cancelar</button></div>`);
  } else if (action === "confirm-waste") {
    const item = findItem(id);
    if (item) {
      state.consumption.unshift({
        id: createId(), kind: "wasted", productId: item.productId, name: item.name,
        quantity: item.quantity, unit: item.unit, at: todayISO(), memberId: activeMember().id,
        savedAmount: 0, wastedAmount: estimateLotValue(item),
      });
      state.pantry = state.pantry.filter((row) => row.id !== id);
      logActivity(`${firstName()} marcó ${item.name} como desperdicio.`);
      persist();
      toast("Quedó registrado como pérdida.");
    }
    closeModal();
    render();
  } else if (action === "to-shopping") {
    const item = findItem(id);
    if (!item) return;
    addShopping(item);
    logActivity(`${firstName()} anotó ${item.name} en la lista.`);
    persist();
    toast(`${item.name} está en la lista.`);
  } else if (action === "scan-tab") {
    ui.scanTab = id;
    render();
  } else if (action === "load-sample-receipt") {
    ui.receiptText = SAMPLE_RECEIPT.trim();
    ui.parsed = parseReceipt(ui.receiptText);
    render();
  } else if (action === "parse-receipt") {
    ui.receiptText = $("receipt-text")?.value || "";
    if (!ui.receiptText.trim()) {
      toast("Pega un ticket o carga el ejemplo.");
      return;
    }
    ui.parsed = parseReceipt(ui.receiptText);
    if (!ui.parsed.items.length) toast("No reconocí productos. Revisa el texto.");
    render();
  } else if (action === "commit-receipt") commitReceipt();
  else if (action === "sample-photo") {
    ui.photoUrl = "";
    ui.photo = examplePhotoResult(id);
    ui.photoPick = 0;
    ui.photoQty = 1;
    ui.photoExpiry = addDays(todayISO(), ui.photo.suggestions[0].product.expiryDays);
    render();
  } else if (action === "pick-photo") {
    ui.photoPick = Number(el.dataset.index);
    const product = ui.photo?.suggestions?.[ui.photoPick]?.product;
    if (product) ui.photoExpiry = addDays(todayISO(), product.expiryDays);
    render();
  } else if (action === "commit-photo") commitPhoto();
  else if (action === "recipe-mode") {
    ui.recipeMode = id;
    render();
  } else if (action === "cook") confirmCook(id);
  else if (action === "confirm-cook") cookRecipe(id);
  else if (action === "missing-to-list") {
    const recipe = RECIPES.find((row) => row.id === id);
    const ranked = rankRecipes(state.pantry).find((row) => row.recipe.id === id);
    if (!recipe || !ranked) return;
    ranked.missing.forEach((ing) => addShopping({ name: ing.name, productId: ing.productId, quantity: ing.qty, unit: ing.unit }));
    logActivity(`${firstName()} pasó faltantes de ${recipe.name} a la lista.`);
    persist();
    toast("Faltantes anotados en compras.");
    go("compras");
  } else if (action === "toggle-shopping") {
    const item = state.shopping.find((row) => row.id === id);
    if (!item) return;
    item.checked = el.checked;
    logActivity(`${firstName()} ${item.checked ? "marcó comprado" : "devolvió a pendientes"}: ${item.name}.`);
    persist();
    render();
  } else if (action === "delete-shopping") {
    state.shopping = state.shopping.filter((row) => row.id !== id);
    persist();
    render();
  } else if (action === "clear-checked") {
    state.shopping = state.shopping.filter((row) => !row.checked);
    logActivity(`${firstName()} limpió lo ya comprado.`);
    persist();
    render();
  } else if (action === "shopping-to-pantry") {
    const item = state.shopping.find((row) => row.id === id);
    if (!item) return;
    const product = productById(item.productId) || matchProduct(item.name);
    openPantryForm({
      fromShoppingId: item.id,
      name: item.name,
      productId: product?.id || "",
      quantity: item.quantity,
      unit: item.unit,
      category: product?.category || "Otros",
      location: product?.location || "despensa",
      expiresOn: product ? addDays(todayISO(), product.expiryDays) : "",
      unitPrice: product ? referenceUnitPrice(product.id) : null,
      storeId: "",
    });
  } else if (action === "accept-habit") {
    addShopping({ name: el.dataset.name, productId: id, quantity: Number(el.dataset.qty) || 1, unit: el.dataset.unit || "un" });
    logActivity(`${firstName()} aceptó reponer ${el.dataset.name}.`);
    persist();
    toast(`${el.dataset.name} quedó en la lista.`);
    render();
  } else if (action === "delete-member") {
    if (state.household.members.length < 2) {
      toast("Tiene que quedar al menos una persona.");
      return;
    }
    const member = state.household.members.find((m) => m.id === id);
    openModal("Quitar miembro", `<p>¿Quitamos a ${esc(member?.name || "esta persona")} del hogar?</p><div class="btn-row"><button class="btn btn-danger" type="button" data-action="confirm-delete-member" data-id="${esc(id)}">Quitar</button><button class="btn btn-ghost" type="button" data-action="close-modal">Cancelar</button></div>`);
  } else if (action === "confirm-delete-member") {
    state.household.members = state.household.members.filter((m) => m.id !== id);
    if (!state.household.members.some((m) => m.id === state.household.activeMemberId)) {
      state.household.activeMemberId = state.household.members[0].id;
    }
    persist();
    closeModal();
    toast("Miembro quitado.");
    render();
  } else if (action === "export-home") exportHome();
  else if (action === "confirm-reset") {
    openModal("Restaurar demostración", `<p>Vuelve la despensa de ejemplo de la familia Rojas. Lo que hayas cargado en este navegador se reemplaza.</p><div class="btn-row"><button class="btn btn-warn" type="button" data-action="do-reset">Restaurar</button><button class="btn btn-ghost" type="button" data-action="close-modal">Cancelar</button></div>`);
  } else if (action === "do-reset") {
    state = resetState();
    ui.parsed = null;
    ui.photo = null;
    closeModal();
    toast("Datos de demostración restaurados.");
    go("inicio");
  } else if (action === "confirm-empty") {
    openModal("Empezar de cero", `<p>Se vacían despensa, lista, hábitos y movimientos. El hogar y los miembros se quedan.</p><div class="btn-row"><button class="btn btn-danger" type="button" data-action="do-empty">Vaciar</button><button class="btn btn-ghost" type="button" data-action="close-modal">Cancelar</button></div>`);
  } else if (action === "do-empty") emptyHome();
}

function onSubmit(event) {
  const form = event.target;
  if (!(form instanceof HTMLFormElement)) return;
  if (form.id === "pantry-form") {
    event.preventDefault();
    const next = readPantryForm(form);
    if (!next) {
      toast("Revisa el nombre y la cantidad.");
      return;
    }
    const index = state.pantry.findIndex((item) => item.id === next.id);
    if (index >= 0) {
      next.createdAt = state.pantry[index].createdAt;
      next.addedBy = state.pantry[index].addedBy;
      state.pantry[index] = next;
      logActivity(`${firstName()} editó ${next.name}.`);
    } else {
      state.pantry.unshift(next);
      const fromShoppingId = String(new FormData(form).get("fromShoppingId") || "");
      if (fromShoppingId) state.shopping = state.shopping.filter((row) => row.id !== fromShoppingId);
      logActivity(`${firstName()} agregó ${next.name}.`);
    }
    persist();
    closeModal();
    toast("Despensa actualizada.");
    render();
  } else if (form.id === "consume-form") {
    event.preventDefault();
    const data = new FormData(form);
    const item = findItem(String(data.get("id")));
    const qty = Number(data.get("quantity"));
    if (!item || !qty || qty <= 0) return;
    const used = Math.min(qty, item.quantity);
    item.quantity = Math.round((item.quantity - used) * 1000) / 1000;
    state.consumption.unshift({
      id: createId(), kind: "consumed", productId: item.productId, name: item.name,
      quantity: used, unit: item.unit, at: todayISO(), memberId: activeMember().id,
      savedAmount: 0, wastedAmount: 0,
    });
    if (item.quantity <= 0.0005) state.pantry = state.pantry.filter((row) => row.id !== item.id);
    logActivity(`${firstName()} consumió ${formatQty(used, item.unit)} de ${item.name}.`);
    persist();
    closeModal();
    toast("Consumo registrado.");
    render();
  } else if (form.id === "shopping-form") {
    event.preventDefault();
    const data = new FormData(form);
    const name = String(data.get("name") || "");
    addShopping({ name, quantity: Number(data.get("quantity")) || 1, unit: String(data.get("unit") || "un") });
    logActivity(`${firstName()} anotó ${name.trim()} en la lista.`);
    persist();
    form.reset();
    toast("Anotado en la lista familiar.");
    render();
  } else if (form.id === "price-form") {
    event.preventDefault();
    const data = new FormData(form);
    const price = Number(data.get("price"));
    const storeId = String(data.get("storeId"));
    if (!Number.isFinite(price) || price < 0) return;
    const existing = state.prices.find((row) => row.productId === ui.priceProduct && row.storeId === storeId);
    if (existing) {
      existing.price = price;
      existing.updatedAt = todayISO();
    } else {
      state.prices.push({ productId: ui.priceProduct, storeId, price, updatedAt: todayISO() });
    }
    const product = productById(ui.priceProduct);
    logActivity(`${firstName()} actualizó el precio de ${product?.name || "un producto"} en ${storeById(storeId)?.name || "una tienda"}.`);
    persist();
    toast("Precio guardado en este hogar.");
    render();
  } else if (form.id === "home-form") {
    event.preventDefault();
    const data = new FormData(form);
    state.household.name = String(data.get("name") || "").trim() || state.household.name;
    state.household.city = String(data.get("city") || "").trim() || state.household.city;
    state.settings.monthlyBudget = Number(data.get("budget")) || 0;
    persist();
    toast("Hogar actualizado.");
    render();
  } else if (form.id === "member-form") {
    event.preventDefault();
    const name = String(new FormData(form).get("name") || "").trim();
    if (!name) return;
    const colors = ["#00B4D8", "#2EC4B6", "#FF9F1C", "#0077B6", "#E53E3E"];
    state.household.members.push({
      id: createId(),
      name,
      role: "En casa",
      color: colors[state.household.members.length % colors.length],
    });
    logActivity(`${firstName()} sumó a ${name} al hogar.`);
    persist();
    toast(`${name} ya está en la familia.`);
    render();
  }
}

function onInput(event) {
  const el = event.target;
  if (el.id === "pantry-search") {
    ui.search = el.value;
    const list = $("pantry-list");
    if (list) list.innerHTML = pantryCards();
    const count = $("pantry-count");
    const n = filteredPantry().length;
    if (count) count.textContent = `${n} producto${n === 1 ? "" : "s"}`;
    return;
  }
  if (el.id === "receipt-text") ui.receiptText = el.value;
  if (el.dataset?.field) syncParsedField(el);
  if (el.id === "photo-qty") ui.photoQty = Number(el.value) || 1;
  if (el.id === "photo-expiry") ui.photoExpiry = el.value;
}

function onChange(event) {
  const el = event.target;
  if (el.id === "member-select") {
    state.household.activeMemberId = el.value;
    persist();
    toast(`Ahora registras como ${firstName()}.`);
    render();
    return;
  }
  if (el.id === "price-product") {
    ui.priceProduct = el.value;
    render();
    return;
  }
  if (el.id === "receipt-store" && ui.parsed) ui.parsed.storeId = el.value;
  if (el.id === "photo-input") onPhotoFile(el.files?.[0]);
  if (el.id === "import-file" && el.files?.[0]) {
    const reader = new FileReader();
    reader.onload = () => applyImport(String(reader.result || ""));
    reader.readAsText(el.files[0]);
  }
  if (el.dataset?.action === "fill-product") {
    const product = productById(el.value);
    const form = el.form;
    if (!product || !form) return;
    form.name.value = product.name;
    form.category.value = product.category;
    form.unit.value = product.unit;
    form.location.value = product.location;
    form.expiresOn.value = addDays(todayISO(), product.expiryDays);
    const ref = referenceUnitPrice(product.id);
    if (ref) form.unitPrice.value = String(Math.round(ref * 1000) / 1000);
  }
  if (el.dataset?.field) syncParsedField(el);
}

document.addEventListener("click", (event) => {
  if (event.target.closest("#modal-root") && event.target.classList.contains("modal-backdrop")) closeModal();
  onClick(event);
});
document.addEventListener("submit", onSubmit);
document.addEventListener("input", onInput);
document.addEventListener("change", onChange);
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeModal();
});
window.addEventListener("hashchange", () => {
  closeModal();
  render();
});

if (!location.hash) location.hash = "inicio";
else render();
