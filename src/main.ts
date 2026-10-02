import { hasExpansion, expansionChoices, expansionPaid } from "./simulation";
import "./style.css";
import { icon } from "../../RestaurantCommon/src/ui/icons";
import {
  createGame,
  step,
  command,
  encode,
  decode,
  offline,
  expansions,
  facilities,
  pumps,
  supply,
  marketCategories,
  roles,
  roleLevels,
  upgradeNames,
  upgradeCost,
  tankCapacity,
  supplyQuote,
  orderSupplies,
  supplyUnitCost,
  type SupplyOrder,
  capacity,
  objective,
  near,
  type State,
  type Vec,
} from "./simulation";
import { createScene } from "./scene";
import { createInput } from "../../RestaurantCommon/src/input";
import { createAudio } from "../../RestaurantCommon/src/render/audio";
import { text, locales, resolveLocale, type Locale } from "./i18n";
const SAVE = "next-stop:save:v1",
  PREF = "next-stop:preferences";
let state = createGame(),
  protect = false,
  saveOK = true,
  choice = "auto",
  sound = false,
  low = false,
  paused = false,
  tab = "journey",
  panel = false,
  hiddenAt = 0,
  offlineEarned = 0;
let shownOrder: SupplyOrder | null = null;
try {
  const p = JSON.parse(localStorage.getItem(PREF) ?? "{}");
  choice = typeof p.language === "string" ? p.language : "auto";
  sound = p.sound === true;
  low = p.low === true;
} catch {}
let locale: Locale = resolveLocale(choice, navigator.languages);
try {
  const raw = localStorage.getItem(SAVE);
  if (raw) {
    const restored = decode(raw);
    if (restored) {
      state = restored.state;
      offlineEarned = offline(
        state,
        Math.max(0, (Date.now() - restored.savedAt) / 1000),
      );
    } else protect = true;
  }
} catch {
  saveOK = false;
}
const t = (key: string) => text(key, locale),
  fmt = (n: number) =>
    new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(
      Math.floor(n),
    );
let fuelNumber = new Intl.NumberFormat(locale, { maximumFractionDigits: 1 });
const app = document.querySelector<HTMLDivElement>("#app")!;
app.innerHTML = `<main class="shell"><header><a class="brand" href="./" aria-label="Next Stop"><img src="./icon.svg" alt=""><span>NEXT STOP<small id="tagline"></small></span></a><div class="wallet"><small id="budget-label"></small><strong><span class="coin">${icon("coin", 22)}</span> <span id="money">0</span></strong></div><button data-action="pause" class="round" id="pause-button">${icon("pause")}</button><button data-action="settings" class="round" id="settings-button">${icon("settings")}</button></header><section class="world"><canvas id="game" tabindex="0"></canvas><div id="labels"></div><div class="joystick"><span></span></div><button class="mission" data-action="goal"><span class="mission-icon">${icon("arrow")}</span><span><small id="goal-title"></small><b id="goal"></b></span><span class="mission-arrow">›</span></button><div class="world-tools"><button data-action="overview" class="round">${icon("map")}</button><button data-action="help" class="round">${icon("help")}</button></div><div class="live-strip"><div class="fuel-reserves"><small id="tank-heading"></small><div class="reserve-values"><div class="fuel-reserve" id="fuel-status"><span class="reserve-name"></span><b class="reserve-value"></b><progress></progress></div><div class="fuel-reserve" id="diesel-status" hidden><span class="reserve-name"></span><b class="reserve-value"></b><progress></progress></div></div></div><span id="carry-status"></span><span id="save-status"></span></div><div class="hint" id="hint"></div><div id="paused-overlay" hidden><div><span>Ⅱ</span><h2></h2><p></p><button data-action="pause" class="primary"></button></div></div></section><aside id="panel"><div class="panel-top"><button data-action="journey" class="back-journey" hidden>${icon("arrow", 18)}<span></span></button><span class="eyebrow" id="panel-eyebrow"></span><button data-action="panel-close" class="round">×</button></div><div id="panel-content"></div></aside><nav id="nav"><button data-tab="journey"><span>${icon("map")}</span><b></b></button><button data-tab="upgrades"><span>${icon("team")}</span><b></b></button><button data-tab="services"><span>${icon("bag")}</span><b></b></button><button data-tab="daily"><span>${icon("trophy")}</span><b></b></button></nav></main><dialog id="modal"><button class="close round" data-action="close">×</button><div id="modal-content"></div></dialog><div id="toast" role="status" aria-live="polite"></div><input id="import-file" type="file" accept=".json,application/json" hidden>`;
const $ = <T extends HTMLElement = HTMLElement>(sel: string) =>
  app.querySelector<T>(sel)!;
$(".brand").insertAdjacentHTML(
  "beforeend",
  '<span class="station-level"><b id="station-level">0</b><small>/ 12</small></span>',
);
$("#panel").hidden = true;
$("#panel").setAttribute("aria-label", "Next Stop");
$(".live-strip").insertAdjacentHTML(
  "afterbegin",
  `<span class="reserve-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 21h12M5 21V4h8v17M5 10h8m0 3h3v5a2 2 0 0 0 4 0V8l-3-3m1 2v4h2"/></svg></span>`,
);
$("#nav").insertAdjacentHTML(
  "beforebegin",
  '<button class="panel-scrim" data-action="dismiss-panel" tabindex="-1" aria-hidden="true" hidden></button>',
);
const canvas = $<HTMLCanvasElement>("#game"),
  input = createInput($(".world"), $(".joystick")),
  audio = createAudio();
let scene: ReturnType<typeof createScene>;
function setLocale() {
  fuelNumber = new Intl.NumberFormat(locale, { maximumFractionDigits: 1 });
  document.documentElement.lang = locale;
  document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
  document.title = "Next Stop — " + t("Roadside dreams");
  $("#tagline").textContent = t("Fuel up. Slow down.");
  $("#budget-label").textContent = t("Free cash");
  $(".wallet").title = t("Coins available for upgrades");
  $("#goal-title").textContent = t("Your next move");
  $("#tank-heading").textContent = t("Shared tanks");
  $("#hint").textContent = t("Drag to move · tap a station");
  $("#pause-button").setAttribute(
    "aria-label",
    t(paused ? "Continue" : "Pause"),
  );
  $("#pause-button").setAttribute("aria-pressed", String(paused));
  $("#settings-button").setAttribute("aria-label", t("Settings"));
  canvas.setAttribute("aria-label", t("Game world"));
  $('[data-action="overview"]').setAttribute("aria-label", t("Map overview"));
  $('[data-action="help"]').setAttribute("aria-label", t("How to play"));
  $('[data-action="panel-close"]').setAttribute("aria-label", t("Close"));
  $(".close").setAttribute("aria-label", t("Close"));
  $("#paused-overlay h2").textContent = t("Rest a little");
  $("#paused-overlay p").textContent = t("Fuel up. Slow down.");
  $("#paused-overlay button").textContent = t("Continue");
  const labels = ["Expansion", "Upgrades & team", "Supplies", "Daily goals"];
  Array.from(app.querySelectorAll("#nav b")).forEach(
    (el, i) => (el.textContent = t(labels[i])),
  );
  $('[data-action="journey"] span').textContent = t("Your journey");
  lastPanel = "";
}
function prefs() {
  try {
    localStorage.setItem(
      PREF,
      JSON.stringify({ language: choice, sound, low }),
    );
  } catch {}
}
function toast(message: string) {
  $("#toast").textContent = message;
  $("#toast").classList.add("show");
  window.setTimeout(() => $("#toast").classList.remove("show"), 3200);
}
function save() {
  if (protect) return;
  try {
    localStorage.setItem(SAVE, encode(state, hiddenAt || Date.now()));
    saveOK = true;
  } catch {
    saveOK = false;
  }
}
function target(point: Vec) {
  if (paused || $("#modal").hasAttribute("open")) return;
  state.target = { ...point };
  if (point.x === supply.x && point.z === supply.z) {
    input.reset();
    state.target = null;
    tab = "services";
    panel = true;
    renderPanel();
  }
}
try {
  scene = createScene(canvas, $("#labels"), target);
} catch {
  app.innerHTML =
    "<main class='fatal'><h1>" +
    t("Graphics could not start") +
    "</h1><p>" +
    t(
      "This game needs WebGL 2. Enable hardware acceleration or use a compatible browser.",
    ) +
    "</p><button onclick='location.reload()'>" +
    t("Try again") +
    "</button></main>";
  throw new Error("WebGL unavailable");
}
let lastPanel = "";
setLocale();
const icons = [
  "car",
  "bag",
  "chef",
  "spark",
  "team",
  "chef",
  "chair",
  "car",
  "spark",
  "team",
  "bag",
  "trophy",
];
const meter = (value: number, max: number) =>
  `<div class="meter"><i style="width:${Math.max(0, Math.min(100, (value / max) * 100))}%"></i></div>`;
function card(title: string, body: string) {
  return `<section class="card"><h3>${title}</h3>${body}</section>`;
}
function renderPanel() {
  const s = state;
  let html = "";
  $("#panel-eyebrow").textContent = t(
    tab === "journey"
      ? "Your journey"
      : tab === "services"
        ? "Services"
        : tab === "daily"
          ? "Daily goals"
          : "Upgrades & team",
  );
  if (tab === "journey") {
    const choices = expansionChoices(s);
    html = `<div class="chapter-progress"><h1>${t("Grow your station")}</h1><div class="row"><b>${t("Your journey")}</b><span>${s.level} / 12</span></div>${meter(s.level, 12)}</div><div class="expansion-grid">`;
    for (const id of choices) {
      const next = expansions[id - 1],
        paid = expansionPaid(s, id);
      html += `<section class="expansion-choice" data-expansion="${id}"><div class="chapter"><div class="blueprint-art"><span class="chapter-art">${icon(icons[id - 1], 58)}</span><span class="build-number">${id}</span></div><h2>${t(next.key)}</h2></div>`;
      html += card(
        t("Invest in your dream"),
        `<div class="row"><b>${fmt(paid)} / ${fmt(next.cost)} ●</b><span>${Math.floor((paid / next.cost) * 100)}%</span></div>${meter(paid, next.cost)}<button class="primary wide" data-action="expand" data-index="${id}" ${s.money < 1 ? "disabled" : ""}>${t(s.money + paid >= next.cost ? "Unlock" : "Fund expansion")} <span>+${fmt(Math.min(s.money, next.cost - paid))} ●</span></button>`,
      );
      html += `</section>`;
    }
    const fallback =
      choices.length === 1 ? s.upgrades.findIndex((level) => level < 5) : -1;
    if (fallback >= 0) {
      const cost = upgradeCost(s, fallback);
      const effect = [
        "+20%",
        "+3",
        "+20%",
        `${t("Supplies")} +40`,
        "+20%",
        "+72 min",
      ][fallback];
      html += `<section class="upgrade-choice"><span class="eyebrow">${t("Upgrades")}</span>${card(t(upgradeNames[fallback]), `<p>${effect} · ${t("Level")} ${s.upgrades[fallback]} → ${s.upgrades[fallback] + 1}</p><button class="primary wide" data-action="upgrade" data-index="${fallback}" ${s.money < cost ? "disabled" : ""}>${t("Unlock")} <span>${fmt(cost)} ●</span></button>`)}</section>`;
    }
    if (!choices.length)
      html += card(
        t("Your dream came true!"),
        `<p>${t("Enjoy your station")}</p><div class="finish-star">★★★★★</div>`,
      );
    html += `</div>`;
    html += card(
      t("Your journey"),
      `<div class="stats"><div><b>${fmt(s.served)}</b><small>${t("Vehicles served")}</small></div><div><b>${Math.round((s.rating.length ? s.rating.reduce((a, b) => a + b, 0) / s.rating.length : 1) * 100)}%</b><small>${t("Satisfaction")}</small></div><div><b>${s.workers.length} / 6</b><small>${t("Team")}</small></div><div><b>${Math.floor(s.time / 60)}:${String(Math.floor(s.time % 60)).padStart(2, "0")}</b><small>${t("Level")} ${s.level}</small></div></div>`,
    );
    html += `<details class="milestones"><summary>${t("Your journey")}</summary><div class="journey-track">${expansions.map((e, i) => `<div class="${hasExpansion(s, i + 1) ? "done" : choices.includes(i + 1) ? "current" : ""}"><span>${hasExpansion(s, i + 1) ? "✓" : i + 1}</span><p>${t(e.key)}</p></div>`).join("")}</div></details>`;
  } else if (tab === "upgrades") {
    html = `<h1>${t("Better every day")}</h1><p class="intro">${t("Grow your station")}</p>`;
    html += upgradeNames
      .map((name, i) =>
        card(
          t(name),
          `<div class="row"><span>${t("Level")} ${s.upgrades[i]} / 5</span><button data-action="upgrade" data-index="${i}" ${s.upgrades[i] === 5 || s.money < upgradeCost(s, i) ? "disabled" : ""}>${s.upgrades[i] === 5 ? t("Complete") : fmt(upgradeCost(s, i)) + " ●"}</button></div>`,
        ),
      )
      .join("");
    html += card(
      t("Team"),
      roles
        .map(
          (r, i) =>
            `<div class="staff-row"><span class="staff-dot ${hasExpansion(s, roleLevels[i]) ? "hired" : ""}">${hasExpansion(s, roleLevels[i]) ? "✓" : "♟"}</span><b>${t(r)}</b><small>${hasExpansion(s, roleLevels[i]) ? t("Complete") : t("Expansion") + " " + roleLevels[i]}</small></div>`,
        )
        .join(""),
    );
  } else if (tab === "services") {
    html = `<h1>${t("Clean & comfortable")}</h1>`;
    html += card(
      t("Supplies"),
      `<div class="row"><span>${t("Fuel")}</span><b>${fmt(s.fuel[0])}/${tankCapacity(s, 0)}</b></div>${meter(s.fuel[0], tankCapacity(s, 0))}${hasExpansion(s, 8) ? `<div class="row"><span>${t("Diesel")}</span><b>${fmt(s.fuel[1])}/${tankCapacity(s, 1)}</b></div>${meter(s.fuel[1], tankCapacity(s, 1))}` : ""}<div class="row"><span>${t("Supplies")}</span><b>${s.goods}</b></div><button class="wide" data-action="collect-supplies" ${s.goods === 0 ? "disabled" : ""}>${t("Collect supplies")}</button>`,
    );
    const quote = s.supplyOrder ?? supplyQuote(s);
    if (!s.delivery) shownOrder = quote;
    const rows = [
      { key: "Fuel", quantity: quote.fuel[0], visible: true },
      { key: "Diesel", quantity: quote.fuel[1], visible: hasExpansion(s, 8) },
      { key: "Supplies", quantity: quote.goods, visible: hasExpansion(s, 2) },
    ];
    html += card(
      t(s.delivery > 0 ? "Incoming delivery" : "Order supplies"),
      `<div class="order-quote" data-testid="supply-quote"><div class="order-head"><span>${t("Supplies")}</span><span>${t("Quantity")}</span><span>${t("Purchase cost")}</span></div>${rows
        .filter((row) => row.visible)
        .map(
          (row) =>
            `<div class="order-line"><span>${t(row.key)}</span><b>${fmt(row.quantity)}</b><span>${fmt(row.quantity * supplyUnitCost)} ●</span></div>`,
        )
        .join(
          "",
        )}<p class="muted">${t("Unit price")}: ${supplyUnitCost} ●</p><div class="row"><b>${t("Purchase cost")}</b><strong id="order-cost">${fmt(quote.cost)} ●</strong></div>${quote.credit ? `<p class="credit-note">${t("Emergency fuel")} · ${t("Repaid from sales")}: ${fmt(quote.credit)} ●</p>` : ""}${s.delivery > 0 ? `<p class="delivery-status">${t("Incoming delivery")} · ${Math.ceil(s.delivery)} s</p>` : `<div class="row"><span>${t("Balance after order")}</span><b id="order-balance">${fmt(s.money - quote.cost + quote.credit)} ●</b></div><button class="primary wide" data-action="supply" ${quote.cost === 0 ? "disabled" : ""}>${t(quote.credit ? "Emergency fuel" : "Order supplies")} <span>${fmt(quote.cost)} ●</span></button>`}<p class="muted">${t("Paid when ordered")}. ${t("Automatic orders")}: ${t(s.autoSupply ? "Complete" : "Expansion")}${s.autoSupply ? "" : " 11"}</p>${s.supplyDebt ? `<p class="credit-note">${t("Outstanding credit")}: ${fmt(s.supplyDebt)} ● · ${t("Repaid from sales")}</p>` : ""}</div>`,
    );
    html += facilities
      .map((d, i) =>
        hasExpansion(s, d.level)
          ? card(
              t(d.key),
              `<div class="row"><span>${t(i >= 3 ? "Cleanliness" : "Supplies")}</span><b>${i >= 3 ? Math.round(s.facilities[i].clean) + "%" : s.facilities[i].stock}</b><button data-action="station" data-index="${i}" aria-label="${t(d.key)}">⌖</button></div>${i >= 3 ? meter(s.facilities[i].clean, 100) + `<div class="row"><small>${t("Quality")} ${s.facilities[i].quality}/3</small><button data-action="quality" data-index="${i}" ${s.facilities[i].quality === 3 || s.money < 150 * s.facilities[i].quality ? "disabled" : ""}>${s.facilities[i].quality === 3 ? t("Complete") : 150 * s.facilities[i].quality + " ●"}</button></div>` : ""}`,
            )
          : "",
      )
      .join("");
    if (hasExpansion(s, 2))
      html += card(
        t("Market"),
        marketCategories
          .map((category, i) =>
            hasExpansion(s, category.level)
              ? `<div class="row" data-category="${i}"><span>${t(category.key)}</span><b>${s.marketStocks[i]}</b><small>+${category.price + supplyUnitCost} ●</small></div>`
              : "",
          )
          .join(""),
      );
    for (const i of [1, 2])
      if (hasExpansion(s, facilities[i].level))
        html += card(
          t(facilities[i].key),
          `<div class="row"><span>▣ ${t("Supplies")}</span><b>${s.facilities[i].raw}</b><span>→ ${t(facilities[i].key)}</span><b>${s.facilities[i].stock}</b></div>${meter(s.facilities[i].progress, facilities[i].seconds)}`,
        );
    html += card(
      t("Traffic"),
      `<div class="row"><span>${s.vehicles.length} / 18</span><button data-action="open">${t(s.open ? "Close road" : "Open road")}</button></div>`,
    );
  } else {
    html = `<h1>${t("Little goals, big rewards")}</h1><p>${t("Three fresh goals each day. No streaks to lose, no rush.")}</p>`;
    const values = [s.daily.served, s.daily.cleaned, s.level],
      goals = [20, 8, 6],
      titles = ["Serve 20 vehicles", "Clean 8 cabins", "Build a team"];
    html += titles
      .map((title, i) =>
        card(
          t(title),
          `${meter(values[i], goals[i])}<div class="row"><span>${Math.min(values[i], goals[i])}/${goals[i]}</span><button data-action="claim" data-index="${i}" ${values[i] < goals[i] || s.daily.claimed[i] ? "disabled" : ""}>${s.daily.claimed[i] ? t("Claimed") : t("Claim") + " " + [60, 80, 120][i] + " ●"}</button></div>`,
        ),
      )
      .join("");
    html += card(
      t("Your apron"),
      `<div class="skins">${["#ed7136", "#487b9b", "#8aab86"].map((c, i) => `<button data-action="skin" data-index="${i}" style="background:${c}" aria-label="${t("Apron")} ${i + 1}">${s.skin === i ? "✓" : ""}</button>`).join("")}</div>`,
    );
  }
  if (lastPanel !== html) {
    const milestonesOpen =
      app.querySelector<HTMLDetailsElement>(".milestones")?.open ?? false;
    $("#panel-content").innerHTML = html;
    const milestones = app.querySelector<HTMLDetailsElement>(".milestones");
    if (milestones) milestones.open = milestonesOpen;
    lastPanel = html;
  }
  $('[data-action="journey"]').hidden = tab === "journey";
  $("#panel-eyebrow").hidden = tab !== "journey";
  $("#panel").classList.toggle("mobile-open", panel);
  $("#panel").hidden = !panel;
  $("#panel").dataset.view = tab;
  $(".panel-scrim").hidden = !panel;
  app.querySelectorAll("[data-tab]").forEach((el) => {
    const selected = panel && (el as HTMLElement).dataset.tab === tab;
    el.classList.toggle("selected", selected);
    el.setAttribute("aria-expanded", String(selected));
  });
}
const modal = $<HTMLDialogElement>("#modal");
window.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && panel && !modal.open) {
    panel = false;
    input.reset();
    renderPanel();
    $<HTMLButtonElement>(`[data-tab="${tab}"]`).focus();
  }
});
function show(content: string) {
  input.reset();
  state.target = null;
  $("#modal-content").innerHTML = content;
  if (!modal.open) modal.showModal();
}
function settings() {
  show(
    `<span class="eyebrow">NEXT STOP</span><h1>${t("Settings")}</h1><label>${t("Language")}<select id="language"><option value="auto" ${choice === "auto" ? "selected" : ""}>${t("Automatic (device)")}</option>${locales.map((l) => `<option value="${l.code}" ${choice === l.code ? "selected" : ""}>${l.name}</option>`).join("")}</select></label><label class="switch">${t("Sound")}<input id="sound" type="checkbox" ${sound ? "checked" : ""}></label><label class="switch">${t("Battery-friendly graphics")}<input id="low" type="checkbox" ${low ? "checked" : ""}></label><div class="settings-actions"><button data-action="export">${t("Export save")}</button><button data-action="import">${t("Import save")}</button></div><p class="muted">${t("Saved on this device")}</p><button class="danger" data-action="reset">${t("Start over?")}</button>`,
  );
}
function help() {
  show(
    `<span class="eyebrow">NEXT STOP</span><h1>${t("How to play")}</h1><div class="help-art">⛽　☕　♧</div><p>${t("Move with WASD, arrow keys or by dragging the world. Tap a station label to walk there.")}</p><ol><li>${t("Serve the next vehicle")}</li><li>${t("Order supplies")} · ${t("Stock the shelves")}</li><li>${t("Clean the restroom")}</li><li>${t("Grow your station")}</li></ol><button class="primary wide" data-action="close">${t("Continue")}</button>`,
  );
}
app.addEventListener("click", (e) => {
  const b = (e.target as HTMLElement).closest<HTMLButtonElement>("button");
  if (!b || b.disabled) return;
  if (sound) audio.setEnabled(true);
  const action = b.dataset.action,
    index = Number(b.dataset.index ?? 0);
  if (b.dataset.tab) {
    input.reset();
    state.target = null;
    panel = tab !== b.dataset.tab || !panel;
    tab = b.dataset.tab;
    renderPanel();
    return;
  }
  if (
    ["expand", "upgrade", "quality", "open", "claim", "skin"].includes(
      action ?? "",
    )
  ) {
    command(state, action!, index);
    save();
    lastPanel = "";
    renderPanel();
  }
  if (action === "collect-supplies") {
    input.reset();
    state.target = { ...supply };
    panel = false;
    renderPanel();
  }
  if (action === "supply" && shownOrder) {
    if (orderSupplies(state, shownOrder)) {
      save();
      toast(t("Incoming delivery") + " · 24 s");
    }
    lastPanel = "";
    renderPanel();
  }
  if (action === "goal") target(objective(state).point);
  if (action === "station") {
    target({ x: facilities[index].x, z: 5 });
    panel = false;
    renderPanel();
  }
  if (action === "overview") scene.toggleOverview();
  if (action === "journey") {
    input.reset();
    state.target = null;
    tab = "journey";
    panel = true;
    renderPanel();
  }
  if (action === "panel-close" || action === "dismiss-panel") {
    panel = false;
    renderPanel();
  }
  if (action === "pause") {
    paused = !paused;
    $("#pause-button").innerHTML = icon(paused ? "play" : "pause");
    $("#pause-button").setAttribute(
      "aria-label",
      t(paused ? "Continue" : "Pause"),
    );
    $("#pause-button").setAttribute("aria-pressed", String(paused));
    input.reset();
    state.target = null;
    $("#paused-overlay").hidden = !paused;
  }
  if (action === "settings") settings();
  if (action === "help") help();
  if (action === "close") modal.close();
  if (action === "export") {
    const url = URL.createObjectURL(
        new Blob([encode(state)], { type: "application/json" }),
      ),
      a = document.createElement("a");
    a.href = url;
    a.download = "next-stop-save.json";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  if (action === "import") $<HTMLInputElement>("#import-file").click();
  if (action === "reset")
    show(
      `<h1>${t("Start over?")}</h1><p>${t("This resets only this game. You can export a backup first.")}</p><button data-action="export">${t("Export save")}</button><button class="danger" data-action="confirm-reset">${t("Reset and start")}</button>`,
    );
  if (action === "confirm-reset") {
    state = createGame();
    protect = false;
    paused = false;
    $("#paused-overlay").hidden = true;
    save();
    modal.close();
    lastPanel = "";
  }
});
app.addEventListener("change", (e) => {
  const el = e.target as HTMLInputElement;
  if (el.id === "language") {
    choice = el.value;
    locale = resolveLocale(choice, navigator.languages);
    prefs();
    setLocale();
    settings();
  }
  if (el.id === "sound") {
    sound = el.checked;
    audio.setEnabled(sound);
    prefs();
  }
  if (el.id === "low") {
    low = el.checked;
    prefs();
  }
});
$<HTMLInputElement>("#import-file").onchange = async (e) => {
  const el = e.target as HTMLInputElement,
    file = el.files?.[0];
  if (!file) return;
  try {
    if (file.size > 1_000_000) throw new Error(t("Save file is too large."));
    const restored = decode(await file.text());
    if (!restored) throw new Error(t("Invalid save or a different game."));
    state = restored.state;
    protect = false;
    save();
    lastPanel = "";
    modal.close();
    toast(t("Progress restored."));
  } catch (error) {
    toast(
      error instanceof Error ? error.message : t("Could not read the file."),
    );
  }
  el.value = "";
};
window.addEventListener("languagechange", () => {
  if (choice === "auto") {
    locale = resolveLocale(choice, navigator.languages);
    setLocale();
    if (modal.open) settings();
  }
});
window.addEventListener("blur", () => {
  input.reset();
  state.target = null;
});
document.addEventListener("visibilitychange", () => {
  input.reset();
  state.target = null;
  if (document.hidden) {
    hiddenAt = Date.now();
    save();
  } else if (hiddenAt) {
    const value = offline(state, (Date.now() - hiddenAt) / 1000);
    hiddenAt = 0;
    if (value) toast(t("Offline income") + ": " + fmt(value) + " ●");
    save();
  }
});
window.addEventListener("pagehide", save);
canvas.addEventListener("webglcontextlost", (e) => {
  e.preventDefault();
  paused = true;
  save();
  toast(t("Graphics interrupted. Reload the page; progress is saved."));
});
let last = performance.now(),
  accumulator = 0,
  lastHud = 0,
  lastSave = 0;
function frame(now: number) {
  const dt = Math.min((now - last) / 1000, 0.15);
  last = now;
  if (!paused && !modal.open && !document.hidden) {
    if (panel) input.reset();
    accumulator += dt;
    while (accumulator >= 1 / 30) {
      step(state, 1 / 30, input.read());
      if (sound)
        audio.play(
          state.events
            .filter((e) => ["sale", "unlock", "clean"].includes(e.type))
            .map((e) => ({
              ...e,
              type: e.type as "sale" | "unlock" | "clean",
            })),
        );
      accumulator -= 1 / 30;
    }
  }
  scene.render(state, locale, low);
  if (now - lastHud > 250) {
    lastHud = now;
    $("#money").textContent = fmt(state.money);
    $("#station-level").textContent = String(state.level);
    $("#goal").textContent = t(objective(state).key);
    for (const type of [0, 1]) {
      const reserve = $(type ? "#diesel-status" : "#fuel-status");
      reserve.hidden = type === 1 && !hasExpansion(state, 8);
      const max = tankCapacity(state, type),
        current = state.fuel[type];
      const name = t(type ? "Diesel" : "Fuel");
      reserve.querySelector(".reserve-name")!.textContent = name;
      reserve.querySelector(".reserve-value")!.textContent =
        fuelNumber.format(current) + " / " + fuelNumber.format(max);
      reserve.classList.toggle("low-fuel", current < max * 0.25);
      const progress = reserve.querySelector("progress")!;
      progress.max = max;
      progress.value = current;
      progress.setAttribute("aria-label", t("Shared tank") + " · " + name);
      reserve.title = t("Shared tank") + " · " + name;
    }
    $("#carry-status").textContent =
      "▣ " + state.player.count + "/" + capacity(state);
    $("#save-status").textContent = protect ? "⚠" : saveOK ? "✓" : "!";
    $("#save-status").title = t(
      !protect && saveOK
        ? "Saved on this device"
        : "Saving unavailable — export a backup",
    );
    renderPanel();
  }
  if (now - lastSave > 10000) {
    lastSave = now;
    save();
  }
  requestAnimationFrame(frame);
}
renderPanel();
requestAnimationFrame(frame);
if (protect)
  toast(t("Could not load your save. Restore a backup in settings."));
else {
  save();
  if (offlineEarned)
    toast(t("Offline income") + " " + fmt(offlineEarned) + " ●");
}
if ("serviceWorker" in navigator && import.meta.env.PROD)
  navigator.serviceWorker
    .register("./sw.js")
    .catch(() =>
      toast(t("Offline mode unavailable. You can still play online.")),
    );
