import { pedestrianNavigator, recoverPedestrians } from "./navigation";
import { offeredIds } from "../../RestaurantCommon/src/progression";
export type Vec = { x: number; z: number };
export type SupplyOrder = {
  fuel: [number, number];
  goods: number;
  cost: number;
  credit: number;
};
export type Vehicle = {
  id: number;
  truck: boolean;
  state: "queue" | "approach" | "fuel" | "depart" | "park" | "exit";
  x: number;
  z: number;
  pump: number;
  slot: number;
  timer: number;
  remaining: number;
  paid: boolean;
  plan: number[];
  service: number;
  visitor: Vec | null;
  wait: number;
  happy: number;
  age: number;
  heading?: number;
  category?: number;
};
export type Facility = {
  stock: number;
  clean: number;
  timer: number;
  customer: number;
  quality: number;
  raw: number;
  progress: number;
  blocked: boolean;
};
export type Worker = {
  role: number;
  x: number;
  z: number;
  target: number;
  carrying: number;
};
export type State = {
  id: "gas";
  version: 1;
  time: number;
  money: number;
  earned: number;
  served: number;
  fuelSold: number;
  cleaned: number;
  level: number;
  paid: number;
  owned?: number[];
  selected?: number;
  funding?: Record<number, number>;
  seed: number;
  nextId: number;
  spawn: number;
  truckSpawn: number;
  player: Vec & { count: number };
  target: Vec | null;
  fuel: number[];
  delivery: number;
  supplyOrder: SupplyOrder | null;
  supplyDebt: number;
  supplySpent: number;
  goods: number;
  marketStocks: number[];
  traffic: number;
  truckTraffic: number;
  vehicles: Vehicle[];
  facilities: Facility[];
  workers: Worker[];
  upgrades: number[];
  autoSupply: boolean;
  open: boolean;
  rating: number[];
  daily: { date: string; served: number; cleaned: number; claimed: boolean[] };
  skin: number;
  events: { type: string; x: number; z: number; amount: number }[];
};
export const expansions = [
  { key: "Second pump", cost: 24 },
  { key: "Mini market", cost: 60 },
  { key: "Coffee & parking", cost: 120 },
  { key: "Fresh restrooms", cost: 240 },
  { key: "Your first team", cost: 320 },
  { key: "Hot food", cost: 500 },
  { key: "Family stop", cost: 700 },
  { key: "Welcome, truckers", cost: 1000 },
  { key: "First shower", cost: 1400 },
  { key: "Truck lounge", cost: 2000 },
  { key: "Smart logistics", cost: 2800 },
  { key: "Highway landmark", cost: 4000 },
];
export const facilities = [
  { key: "Market", x: -10, z: 7, level: 2, type: "shop", price: 3, seconds: 3 },
  { key: "Coffee", x: -5, z: 7, level: 3, type: "food", price: 4, seconds: 3 },
  { key: "Hot dogs", x: 0, z: 7, level: 6, type: "food", price: 7, seconds: 4 },
  { key: "Restroom", x: 5, z: 7, level: 4, type: "wc", price: 0, seconds: 7 },
  { key: "Restroom", x: 8, z: 7, level: 4, type: "wc", price: 0, seconds: 7 },
  {
    key: "Shower",
    x: 12,
    z: 7,
    level: 9,
    type: "shower",
    price: 9,
    seconds: 15,
  },
  {
    key: "Shower",
    x: 16,
    z: 7,
    level: 10,
    type: "shower",
    price: 9,
    seconds: 15,
  },
];
export const pumps: Vec[] = [
  { x: -10, z: -7 },
  { x: -4, z: -7 },
  { x: 2, z: -7 },
  { x: 8, z: -7 },
  { x: 14, z: -6 },
  { x: 19, z: -6 },
];
export const parking: Vec[] = [
  ...[-13, -9, -5, -1, 3, 7].map((x) => ({ x, z: 1 })),
  ...[-12, -4, 4, 12].map((x) => ({ x, z: 12.2 })),
];
export const supply: Vec = { x: -16, z: 7 };
export function servicePoint(index: number): Vec {
  const p = pumps[index];
  return { x: p.x - (index < 4 ? 2 : 2.4), z: p.z + 1.6 };
}
export const marketCategories = [
  { key: "Water", level: 2, price: 3 },
  { key: "Snacks", level: 2, price: 3 },
  { key: "Travel essentials", level: 3, price: 6 },
  { key: "Car care", level: 7, price: 6 },
  { key: "Driver essentials", level: 8, price: 8 },
  { key: "Souvenirs", level: 10, price: 8 },
];
export function marketCategoriesFor(level: Progress) {
  return marketCategories.filter(
    (category) => hasExpansion(level, 2) && hasExpansion(level, category.level),
  );
}
function syncMarket(s: State) {
  s.facilities[0].stock = s.marketStocks.reduce(
    (sum, stock, index) =>
      sum +
      (hasExpansion(s, 2) && hasExpansion(s, marketCategories[index].level)
        ? stock
        : 0),
    0,
  );
}
export const roles = [
  "Cashier",
  "Pump attendant",
  "Cleaner",
  "Cook",
  "Stock keeper",
  "Dispatcher",
];
export const roleLevels = [2, 5, 5, 6, 11, 11];
export const upgradeNames = [
  "Quick feet",
  "Bigger tray",
  "Faster pumps",
  "Larger warehouse",
  "Experienced team",
  "More offline hours",
];
export function createGame(): State {
  return {
    id: "gas",
    version: 1,
    time: 0,
    money: 0,
    earned: 0,
    served: 0,
    fuelSold: 0,
    cleaned: 0,
    level: 0,
    paid: 0,
    seed: 28173,
    nextId: 1,
    spawn: 1,
    truckSpawn: 10,
    player: { x: -12, z: -4, count: 0 },
    target: null,
    fuel: [80, 160],
    delivery: 0,
    supplyOrder: null,
    supplyDebt: 0,
    supplySpent: 0,
    goods: 40,
    marketStocks: [4, 4, 4, 4, 4, 4],
    traffic: -1,
    truckTraffic: -1,
    vehicles: [],
    facilities: facilities.map((_, i) => ({
      stock: i === 1 || i === 2 ? 0 : 8,
      clean: 100,
      timer: 0,
      customer: -1,
      quality: 1,
      raw: i === 1 || i === 2 ? 8 : 0,
      progress: 0,
      blocked: false,
    })),
    workers: [],
    upgrades: [0, 0, 0, 0, 0, 0],
    autoSupply: false,
    open: true,
    rating: [],
    daily: {
      date: new Date().toISOString().slice(0, 10),
      served: 0,
      cleaned: 0,
      claimed: [false, false, false],
    },
    skin: 0,
    events: [],
  };
}
const dist = (a: Vec, b: Vec) => Math.hypot(a.x - b.x, a.z - b.z);
export function near(a: Vec, b: Vec) {
  return dist(a, b) < 1.7;
}
function random(s: State) {
  s.seed = (Math.imul(s.seed, 1664525) + 1013904223) >>> 0;
  return s.seed / 4294967296;
}
export function pumpCount(s: State) {
  return hasExpansion(s, 7) ? 4 : hasExpansion(s, 1) ? 2 : 1;
}
export function parkCount(s: State) {
  return hasExpansion(s, 7)
    ? 6
    : hasExpansion(s, 3)
      ? 4
      : hasExpansion(s, 2)
        ? 2
        : 0;
}
export function tankCapacity(s: State, type: number) {
  return (type ? 160 : 80) * (1 + s.upgrades[3] * 0.5);
}
export const supplyUnitCost = 1;
export function warehouseCapacity(s: State) {
  return 100 + s.upgrades[3] * 40;
}
export function supplyQuote(s: State): SupplyOrder {
  const needs = [
    Math.max(0, Math.ceil(tankCapacity(s, 0) - s.fuel[0] - 1e-6)),
    hasExpansion(s, 8)
      ? Math.max(0, Math.ceil(tankCapacity(s, 1) - s.fuel[1] - 1e-6))
      : 0,
    hasExpansion(s, 2) ? Math.max(0, warehouseCapacity(s) - s.goods) : 0,
  ];
  const quantities = [0, 0, 0];
  let budget = Math.floor(s.money / supplyUnitCost);
  const allocate = (i: number, limit: number) => {
    const amount = Math.min(needs[i] - quantities[i], budget, limit);
    quantities[i] += amount;
    budget -= amount;
  };
  if (s.fuel[0] < 12) allocate(0, 20);
  if (hasExpansion(s, 8) && s.fuel[1] < 20) allocate(1, 32);
  if (s.goods < 20) allocate(2, 20);
  for (const i of [0, 1, 2]) allocate(i, Infinity);
  const cost = quantities.reduce((a, b) => a + b, 0) * supplyUnitCost;
  if (
    cost === 0 &&
    s.money < supplyUnitCost &&
    s.fuel[0] < 4 &&
    s.supplyDebt === 0
  )
    return {
      fuel: [8, 0],
      goods: 0,
      cost: 8 * supplyUnitCost,
      credit: 8 * supplyUnitCost,
    };
  return {
    fuel: [quantities[0], quantities[1]],
    goods: quantities[2],
    cost,
    credit: 0,
  };
}
export function orderSupplies(s: State, quote: SupplyOrder): boolean {
  if (
    s.delivery > 0 ||
    s.supplyOrder ||
    !quote ||
    !Array.isArray(quote.fuel) ||
    quote.fuel.length !== 2
  )
    return false;
  const amounts = [...quote.fuel, quote.goods];
  if (
    !amounts.every((n) => Number.isInteger(n) && n >= 0) ||
    quote.fuel.some((n, i) => n > tankCapacity(s, i)) ||
    quote.goods > warehouseCapacity(s) ||
    (!hasExpansion(s, 8) && quote.fuel[1] > 0) ||
    (!hasExpansion(s, 2) && quote.goods > 0)
  )
    return false;
  if (
    quote.cost !== amounts.reduce((a, b) => a + b, 0) * supplyUnitCost ||
    quote.cost <= 0 ||
    !Number.isFinite(quote.credit) ||
    quote.credit < 0 ||
    quote.credit > quote.cost
  )
    return false;
  if (
    quote.credit > 0 &&
    (quote.credit !== 8 * supplyUnitCost ||
      quote.cost !== quote.credit ||
      quote.fuel[0] !== 8 ||
      quote.fuel[1] !== 0 ||
      quote.goods !== 0 ||
      s.supplyDebt !== 0 ||
      s.money >= supplyUnitCost ||
      s.fuel[0] >= 4)
  )
    return false;
  if (s.money < quote.cost - quote.credit) return false;
  s.money -= quote.cost - quote.credit;
  s.supplyDebt += quote.credit;
  s.supplySpent += quote.cost;
  s.supplyOrder = { ...quote, fuel: [...quote.fuel] };
  s.delivery = 24;
  return true;
}
export function capacity(s: State) {
  return 5 + s.upgrades[1] * 3;
}
export function upgradeCost(s: State, index: number) {
  return Math.round(
    80 * Math.pow(2.4, s.upgrades[index]) * (index === 5 ? 2 : 1),
  );
}
function walk(p: Vec, target: Vec, speed: number, dt: number) {
  const d = dist(p, target);
  if (d < 0.06) return true;
  const k = Math.min(1, (speed * dt) / d);
  p.x += (target.x - p.x) * k;
  p.z += (target.z - p.z) * k;
  return d <= speed * dt;
}
type VehiclePose = Vec & { truck: boolean; heading?: number };
// Rectangle separation uses the visible vehicle dimensions, including the trailer.
// Road motion is axis-aligned; both the old and proposed pose must clear parked traffic.
export function vehiclesOverlap(a: VehiclePose, b: VehiclePose) {
  const axes = (v: VehiclePose) => {
    const angle = v.heading ?? 0;
    return [
      { x: Math.sin(angle), z: Math.cos(angle) },
      { x: Math.cos(angle), z: -Math.sin(angle) },
    ];
  };
  const aa = axes(a),
    bb = axes(b),
    delta = { x: a.x - b.x, z: a.z - b.z };
  const dot = (x: Vec, y: Vec) => x.x * y.x + x.z * y.z;
  const extent = (v: VehiclePose, axes: Vec[], axis: Vec) =>
    Math.abs(dot(axes[0], axis)) * (v.truck ? 3.7 : 1.55) +
    Math.abs(dot(axes[1], axis)) * (v.truck ? 1.1 : 0.9);
  return [...aa, ...bb].every(
    (axis) =>
      Math.abs(dot(delta, axis)) <
      extent(a, aa, axis) + extent(b, bb, axis) + 0.08,
  );
}
function drive(s: State, v: Vehicle, target: Vec, speed: number, dt: number) {
  if (dist(v, target) < 0.06) return true;
  const next = { ...v, heading: Math.atan2(target.x - v.x, target.z - v.z) };
  const arrived = walk(next, target, speed, dt);
  if (s.vehicles.some((other) => other !== v && vehiclesOverlap(next, other)))
    return false;
  v.x = next.x;
  v.z = next.z;
  v.heading = next.heading;
  return arrived;
}
function entryClear(s: State, truck: boolean) {
  const entry = {
    x: truck ? 22 : -22,
    z: truck ? -13.5 : -10.8,
    truck,
    heading: truck ? -Math.PI / 2 : Math.PI / 2,
  };
  return !s.vehicles.some((v) => vehiclesOverlap(entry, v));
}
function gain(s: State, amount: number, p: Vec) {
  if (amount <= 0) return;
  const repayment = Math.min(s.supplyDebt, amount);
  s.supplyDebt -= repayment;
  s.money += amount - repayment;
  s.earned += amount;
  s.events.push({ type: "sale", ...p, amount });
}
function activeFacility(s: State, i: number) {
  return hasExpansion(s, facilities[i].level);
}
function available(s: State, i: number, v: Vehicle) {
  const d = facilities[i],
    f = s.facilities[i];
  return (
    activeFacility(s, i) &&
    f.customer === -1 &&
    !f.blocked &&
    (i !== 0 ||
      (v.category !== undefined &&
        v.category >= 0 &&
        s.marketStocks[v.category] > 0)) &&
    (d.type === "wc"
      ? f.clean >= 35
      : d.type === "shower"
        ? f.clean >= 35 && f.stock > 0
        : f.stock > 0)
  );
}
export function command(s: State, kind: string, index = 0) {
  if (!Number.isInteger(index)) return;
  if (kind === "expand" && s.level < 12) {
    const id = index || expansionChoices(s)[0];
    if (
      !expansionChoices(s).includes(id) ||
      !Number.isFinite(s.money) ||
      s.money < 1 ||
      !Number.isFinite(s.paid) ||
      s.paid < 0
    )
      return;
    if (!s.owned && s.paid >= expansions[s.level].cost) return;
    const cost = expansions[id - 1].cost;
    s.funding ??= s.paid ? { [s.selected ?? s.level + 1]: s.paid } : {};
    s.owned ??= ownedIds(s);
    s.selected = id;
    s.paid = s.funding[id] ?? 0;
    if (s.paid >= cost) return;
    const pay = Math.min(s.money, cost - s.paid);
    s.money -= pay;
    s.paid += pay;
    s.funding[id] = s.paid;
    if (s.paid >= cost) {
      s.owned.push(id);
      s.level = s.owned.length;
      s.paid = 0;
      s.selected = undefined;
      delete s.funding[id];
      s.events.push({ type: "unlock", x: 0, z: 0, amount: id });
      if (id === 11) s.autoSupply = true;
    }
  }

  if (
    kind === "upgrade" &&
    Number.isInteger(index) &&
    index >= 0 &&
    index < 6 &&
    s.upgrades[index] < 5
  ) {
    const cost = upgradeCost(s, index);
    if (s.money >= cost) {
      s.money -= cost;
      s.upgrades[index]++;
    }
  }
  if (
    kind === "quality" &&
    index >= 3 &&
    index < 7 &&
    activeFacility(s, index) &&
    s.facilities[index].quality < 3
  ) {
    const cost = 150 * s.facilities[index].quality;
    if (s.money >= cost) {
      s.money -= cost;
      s.facilities[index].quality++;
    }
  }
  if (kind === "supply") orderSupplies(s, supplyQuote(s));
  if (kind === "open") s.open = !s.open;
  if (kind === "skin" && index >= 0 && index < 3) s.skin = index;
  if (kind === "claim" && index >= 0 && index < 3 && !s.daily.claimed[index]) {
    const done = [s.daily.served >= 20, s.daily.cleaned >= 8, s.level >= 6][
      index
    ];
    if (done) {
      s.daily.claimed[index] = true;
      gain(s, [60, 80, 120][index], s.player);
    }
  }
}
function createVehicle(s: State, truck: boolean) {
  const plan: number[] = [];
  const comfort = s.rating.length
    ? Math.max(0, s.rating.reduce((a, b) => a + b, 0) / s.rating.length - 0.5) *
      0.4
    : 0;
  if (hasExpansion(s, 2) && random(s) < Math.min(1, 0.8 + comfort))
    plan.push(0);
  if (hasExpansion(s, 3) && random(s) < Math.min(1, 0.6 + comfort))
    plan.push(1);
  if (
    hasExpansion(s, 6) &&
    random(s) < Math.min(1, (truck ? 0.8 : 0.45) + comfort)
  )
    plan.push(2);
  if (
    hasExpansion(s, 4) &&
    random(s) <
      Math.min(
        0.95,
        0.55 +
          comfort +
          (Math.max(s.facilities[3].quality, s.facilities[4].quality) - 1) *
            0.06,
      )
  )
    plan.push(random(s) < 0.5 ? 3 : 4);
  if (
    truck &&
    hasExpansion(s, 9) &&
    random(s) <
      Math.min(
        0.95,
        0.75 +
          comfort +
          (Math.max(s.facilities[5].quality, s.facilities[6].quality) - 1) *
            0.05,
      )
  )
    plan.push(hasExpansion(s, 10) && random(s) < 0.5 ? 6 : 5);
  s.vehicles.push({
    id: s.nextId++,
    truck,
    state: "queue",
    x: truck ? 22 : -22,
    z: truck ? -13.5 : -10.8,
    pump: -1,
    slot: -1,
    timer: 0,
    remaining: truck ? 16 : 4,
    paid: false,
    plan,
    service: -1,
    visitor: null,
    wait: 0,
    happy: 1,
    age: 0,
    heading: truck ? -Math.PI / 2 : Math.PI / 2,
    category: plan.includes(0)
      ? marketCategories.indexOf(
          marketCategoriesFor(s)[
            Math.floor(random(s) * marketCategoriesFor(s).length)
          ],
        )
      : -1,
  });
}
function clean(s: State, i: number, dt: number, rate = 1) {
  const f = s.facilities[i];
  if (f.customer !== -1 || f.clean === 100) return;
  f.blocked = true;
  f.clean = Math.min(100, f.clean + 25 * dt * rate);
  if (f.clean === 100) {
    f.blocked = false;
    s.cleaned++;
    s.daily.cleaned++;
    s.events.push({
      x: facilities[i].x,
      z: facilities[i].z,
      type: "clean",
      amount: 0,
    });
  }
}
function stock(s: State, i: number, carrier: { count: number }) {
  const f = s.facilities[i],
    limit = 12 + s.upgrades[3] * 4;
  if (i === 0) {
    while (carrier.count > 0) {
      const unlocked = marketCategoriesFor(s).map((category) =>
        marketCategories.indexOf(category),
      );
      const category = unlocked
        .sort((a, b) => s.marketStocks[a] - s.marketStocks[b])
        .find((j) => s.marketStocks[j] < 8 + s.upgrades[3] * 2);
      if (category === undefined) break;
      s.marketStocks[category]++;
      carrier.count--;
    }
    syncMarket(s);
    return;
  }
  const field = i === 1 || i === 2 ? "raw" : "stock";
  const n = Math.min(carrier.count, Math.max(0, limit - f[field]));
  carrier.count -= n;
  f[field] += n;
}
function prepareFood(s: State, dt: number) {
  for (const i of [1, 2]) {
    const f = s.facilities[i];
    if (!activeFacility(s, i) || f.raw <= 0 || f.stock >= 8 + s.upgrades[3] * 2)
      continue;
    const cook = s.workers.find(
      (w) => w.role === 3 && near(w, { x: facilities[i].x, z: 5 }),
    );
    f.progress += dt * (cook ? 1.25 + s.upgrades[4] * 0.1 : 1);
    if (f.progress >= (i === 1 ? 2 : 4)) {
      f.progress = 0;
      f.raw--;
      f.stock++;
    }
  }
}
function workers(s: State, dt: number) {
  const nav = pedestrianNavigator(s);
  for (let r = 0; r < roles.length; r++)
    if (hasExpansion(s, roleLevels[r]) && !s.workers.some((w) => w.role === r))
      s.workers.push({
        role: r,
        x: -12 + r * 2,
        z: 3,
        target: -1,
        carrying: 0,
      });
  for (const w of s.workers) {
    if (w.role === 1) {
      const v = s.vehicles.find((v) => v.state === "fuel" && v.timer === 0);
      const goal = v ? servicePoint(v.pump) : { x: -5, z: -4 };
      nav.toward(w, goal, 4 + s.upgrades[4] * 0.8, dt);
    } else if (w.role === 2) {
      let i =
        w.target >= 3 &&
        activeFacility(s, w.target) &&
        s.facilities[w.target].customer === -1 &&
        s.facilities[w.target].clean < 100
          ? w.target
          : -1;
      const keep = i >= 0;
      for (let j = 3; j < 7; j++)
        if (
          !keep &&
          activeFacility(s, j) &&
          s.facilities[j].customer === -1 &&
          s.facilities[j].clean < 100 &&
          (i === -1 || s.facilities[j].clean < s.facilities[i].clean)
        )
          i = j;
      w.target = i;
      if (i >= 0) {
        if (nav.toward(w, { x: facilities[i].x, z: 5 }, 4 + s.upgrades[4], dt))
          clean(s, i, dt, 1 + s.upgrades[4] * 0.2);
      }
    } else if (w.role === 3) {
      const i = s.facilities[1].raw < s.facilities[2].raw ? 1 : 2;
      w.target = i;
      if (
        nav.toward(w, { x: facilities[i].x, z: 5 }, 4, dt) &&
        s.goods > 0 &&
        s.facilities[i].raw < 8
      ) {
        s.facilities[i].timer += dt;
        if (s.facilities[i].timer >= 2) {
          s.facilities[i].raw++;
          s.goods--;
          s.facilities[i].timer = 0;
        }
      }
    } else if (w.role === 4) {
      const i = facilities.findIndex(
        (d, j) =>
          activeFacility(s, j) &&
          d.type !== "wc" &&
          (j === 0
            ? marketCategoriesFor(s).some(
                (category) =>
                  s.marketStocks[marketCategories.indexOf(category)] < 4,
              )
            : j === 1 || j === 2
              ? s.facilities[j].raw < 8
              : s.facilities[j].stock < 8),
      );
      w.target = i;
      if (i >= 0) {
        if (w.carrying === 0) {
          if (nav.toward(w, supply, 4 + s.upgrades[4], dt) && s.goods > 0) {
            w.carrying = Math.min(8, s.goods);
            s.goods -= w.carrying;
          }
        } else if (
          nav.toward(w, { x: facilities[i].x, z: 5 }, 4 + s.upgrades[4], dt)
        ) {
          const c = { count: w.carrying };
          stock(s, i, c);
          w.carrying = c.count;
        }
      }
    } else
      nav.toward(w, w.role === 0 ? { x: -10, z: 5 } : { x: -16, z: 6 }, 4, dt);
  }
}
function release(s: State, v: Vehicle) {
  if (v.service >= 0 && s.facilities[v.service].customer === v.id)
    s.facilities[v.service].customer = -1;
  v.service = -1;
  v.visitor = null;
  v.state = "exit";
  v.pump = -1;
  v.timer = 0;
}
export function step(s: State, dt: number, input: Vec = { x: 0, z: 0 }) {
  dt = Math.max(0, Math.min(0.1, dt));
  s.time += dt;
  s.events.length = 0;
  const nav = pedestrianNavigator(s);
  if (input.x || input.z) {
    s.target = null;
    nav.move(s.player, input, (5 + s.upgrades[0]) * dt);
  } else if (s.target && nav.toward(s.player, s.target, 5 + s.upgrades[0], dt))
    s.target = null;
  else nav.recover(s.player);
  if (s.delivery > 0) {
    s.delivery = Math.max(0, s.delivery - dt);
    if (s.delivery === 0) {
      const order = s.supplyOrder;
      if (order) {
        s.fuel = s.fuel.map((amount, i) =>
          Math.min(tankCapacity(s, i), amount + order.fuel[i]),
        );
        s.goods = Math.min(warehouseCapacity(s), s.goods + order.goods);
      }
      s.supplyOrder = null;
      s.events.push({ type: "delivery", ...supply, amount: 0 });
    }
  }
  if (
    s.autoSupply &&
    hasExpansion(s, 11) &&
    s.delivery === 0 &&
    (s.fuel[0] < tankCapacity(s, 0) * 0.25 ||
      s.fuel[1] < tankCapacity(s, 1) * 0.25 ||
      s.goods < 20)
  )
    command(s, "supply");
  if (near(s.player, supply) && s.player.count < capacity(s) && s.goods > 0) {
    const n = Math.min(capacity(s) - s.player.count, s.goods);
    s.goods -= n;
    s.player.count += n;
  }
  for (let i = 0; i < facilities.length; i++)
    if (activeFacility(s, i) && near(s.player, { x: facilities[i].x, z: 5 })) {
      if (i >= 3) clean(s, i, dt);
      if (facilities[i].type !== "wc") stock(s, i, s.player);
    }
  workers(s, dt);
  prepareFood(s, dt);
  syncMarket(s);
  s.spawn = Math.max(0, s.spawn - dt);
  s.truckSpawn = Math.max(0, s.truckSpawn - dt);
  if (
    s.open &&
    s.spawn === 0 &&
    s.vehicles.filter((v) => !v.truck).length < 12 &&
    entryClear(s, false) &&
    s.vehicles.filter((v) => !v.truck && v.state === "queue").length < 6
  ) {
    createVehicle(s, false);
    s.spawn = Math.max(3, 8 - s.level * 0.3);
  }
  if (
    s.open &&
    hasExpansion(s, 8) &&
    s.truckSpawn === 0 &&
    s.vehicles.filter((v) => v.truck).length < 6 &&
    entryClear(s, true) &&
    s.vehicles.filter((v) => v.truck && v.state === "queue").length < 3
  ) {
    createVehicle(s, true);
    s.truckSpawn = 16;
  }
  const transit = (v: Vehicle) =>
    v.state === "depart" ||
    v.state === "exit" ||
    (v.state === "park" && !v.visitor);
  for (const truck of [false, true]) {
    const field = truck ? "truckTraffic" : "traffic";
    if (
      !s.vehicles.some(
        (v) => v.id === s[field] && transit(v) && v.truck === truck,
      )
    )
      s[field] =
        s.vehicles.find((v) => transit(v) && v.truck === truck)?.id ?? -1;
  }
  for (const v of s.vehicles) {
    v.age += dt;
    if (v.state === "queue") {
      const allowed = v.truck
        ? [4, 5]
        : Array.from({ length: pumpCount(s) }, (_, i) => i);
      const p = allowed.find(
        (i) =>
          !s.vehicles.some(
            (o) =>
              o !== v &&
              o.pump === i &&
              ["approach", "fuel", "depart"].includes(o.state),
          ),
      );
      if (p !== undefined) {
        v.pump = p;
        v.state = "approach";
        v.timer = 0;
      }
    } else if (v.state === "approach") {
      const p = pumps[v.pump];
      const waypoint =
        v.timer === 0 ? { x: p.x, z: v.truck ? -13.5 : -10.8 } : p;
      if (drive(s, v, waypoint, v.truck ? 5 : 7, dt)) {
        if (v.timer === 0) v.timer = 1;
        else {
          v.state = "fuel";
          v.timer = 0;
        }
      }
    } else if (v.state === "fuel") {
      const p = pumps[v.pump],
        att = s.workers.find((w) => w.role === 1);
      if (
        v.timer === 0 &&
        (near(s.player, servicePoint(v.pump)) ||
          (att && near(att, servicePoint(v.pump))))
      )
        v.timer = 1;
      const type = v.truck ? 1 : 0;
      if (v.timer > 0 && s.fuel[type] > 0) {
        const n = Math.min(
          v.remaining,
          s.fuel[type],
          dt * (v.truck ? 16 / 18 : 0.5) * (1 + s.upgrades[2] * 0.2),
        );
        s.fuel[type] -= n;
        v.remaining -= n;
        s.fuelSold += n;
        if (v.remaining < 0.00001) {
          if (!v.paid) {
            gain(
              s,
              (v.truck ? 48 : 12) + (v.truck ? 16 : 4) * supplyUnitCost,
              p,
            );
            v.paid = true;
          }
          v.state = "depart";
          v.timer = 0;
        }
      }
    } else if (v.state === "depart") {
      if ((v.truck ? s.truckTraffic : s.traffic) !== v.id) continue;
      const p = pumps[v.pump];
      const points = v.truck
        ? [
            { x: p.x, z: 0 },
            { x: 22, z: 0 },
          ]
        : [{ x: p.x, z: -3.7 }];
      if (drive(s, v, points[Math.min(v.timer, points.length - 1)], 6, dt)) {
        v.timer++;
        if (v.timer >= points.length) {
          v.pump = -1;
          const possible = v.truck
            ? Array.from(
                { length: hasExpansion(s, 10) ? 4 : 2 },
                (_, i) => 6 + i,
              )
            : Array.from({ length: parkCount(s) }, (_, i) => i);
          const slot = possible.find(
            (i) => !s.vehicles.some((o) => o !== v && o.slot === i),
          );
          if (v.plan.length && slot !== undefined) {
            v.slot = slot;
            v.state = "park";
            v.timer = 0;
          } else release(s, v);
        }
      }
    } else if (v.state === "park") {
      const spot = parking[v.slot];
      if (!v.visitor) {
        if ((v.truck ? s.truckTraffic : s.traffic) !== v.id) continue;
        const points = v.truck
          ? [{ x: 22, z: 17.2 }, { x: spot.x, z: 17.2 }, spot]
          : [{ x: spot.x, z: -3.7 }, spot];
        if (
          drive(
            s,
            v,
            points[Math.min(v.timer, points.length - 1)],
            v.truck ? 6 : 5,
            dt,
          )
        ) {
          v.timer++;
          if (v.timer >= points.length) {
            v.visitor = { x: spot.x, z: spot.z > 10 ? 10 : spot.z + 1.5 };
            v.timer = 0;
            s[v.truck ? "truckTraffic" : "traffic"] = -1;
          }
        }
      } else if (v.service >= 0) {
        const f = s.facilities[v.service],
          d = facilities[v.service];
        if (pedestrianNavigator(s).toward(v.visitor, { x: d.x, z: 5 }, 4, dt)) {
          v.timer += dt;
          const done = v.timer >= d.seconds / (1 + (f.quality - 1) * 0.15);
          if (done) {
            if (v.service === 0) {
              s.marketStocks[v.category!]--;
              syncMarket(s);
            } else if (d.type !== "wc") f.stock = Math.max(0, f.stock - 1);
            if (d.type === "wc" || d.type === "shower") {
              v.happy = Math.max(0, v.happy - Math.max(0, 65 - f.clean) / 200);
              f.clean = Math.max(0, f.clean - (d.type === "wc" ? 18 : 30));
              if (f.clean < 35) f.blocked = true;
            }
            gain(
              s,
              (v.service === 0
                ? marketCategories[v.category!].price
                : d.price) + (d.type === "wc" ? 0 : supplyUnitCost),
              d,
            );
            f.customer = -1;
            v.service = -1;
            v.plan.shift();
            v.wait = 0;
            v.timer = 0;
          }
        }
      } else if (v.plan.length) {
        const i = v.plan[0];
        v.wait += dt;
        if (available(s, i, v)) {
          s.facilities[i].customer = v.id;
          v.service = i;
          v.timer = 0;
        } else if (v.wait > 18) {
          v.plan.shift();
          v.happy = Math.max(0, v.happy - 0.2);
          v.wait = 0;
        }
      } else if (
        pedestrianNavigator(s).toward(
          v.visitor,
          { x: spot.x, z: spot.z > 10 ? 10 : spot.z + 1.5 },
          4,
          dt,
        )
      )
        release(s, v);
    } else if (v.state === "exit") {
      if ((v.truck ? s.truckTraffic : s.traffic) !== v.id) continue;
      const points = v.truck
        ? [
            { x: v.x, z: 17.2 },
            { x: 23, z: 17.2 },
          ]
        : [
            { x: v.x, z: -3.7 },
            { x: 11, z: -3.7 },
            { x: 11, z: -10.8 },
            { x: 23, z: -10.8 },
          ];
      if (
        drive(
          s,
          v,
          points[Math.min(v.timer, points.length - 1)],
          v.truck ? 6 : 8,
          dt,
        )
      ) {
        if (v.timer === 0) v.slot = -1;
        v.timer++;
      }
    }
  }

  s.vehicles = s.vehicles.filter((v) => {
    if (v.state === "exit" && v.x > 22.8) {
      if (s[v.truck ? "truckTraffic" : "traffic"] === v.id)
        s[v.truck ? "truckTraffic" : "traffic"] = -1;
      s.served++;
      s.daily.served++;
      s.rating.push(v.happy);
      if (s.rating.length > 20) s.rating.shift();
      return false;
    }
    return true;
  });
  recoverPedestrians(s);
  const today = new Date().toISOString().slice(0, 10);
  if (s.daily.date !== today)
    s.daily = {
      date: today,
      served: 0,
      cleaned: 0,
      claimed: [false, false, false],
    };
}
export function objective(s: State): { key: string; point: Vec } {
  if (
    s.delivery === 0 &&
    (s.fuel[0] < 12 || (hasExpansion(s, 8) && s.fuel[1] < 20) || s.goods < 8)
  )
    return { key: "Order supplies", point: supply };
  const dirty = s.facilities.findIndex(
    (f, i) => i >= 3 && activeFacility(s, i) && f.clean < 35,
  );
  if (dirty >= 0 && !hasExpansion(s, 5))
    return {
      key: "Clean the restroom",
      point: { x: facilities[dirty].x, z: 5 },
    };
  const empty = s.facilities.findIndex(
    (f, i) =>
      activeFacility(s, i) && facilities[i].type !== "wc" && f.stock < 3,
  );
  if (empty >= 0 && !hasExpansion(s, 11))
    return s.player.count
      ? { key: "Stock the shelves", point: { x: facilities[empty].x, z: 5 } }
      : { key: "Collect supplies", point: supply };
  const v = s.vehicles.find((v) => v.state === "fuel" && v.timer === 0);
  if (v && !hasExpansion(s, 5))
    return {
      key: "Serve the next vehicle",
      point: servicePoint(v.pump),
    };
  return {
    key: s.level < 12 ? "Grow your station" : "Enjoy your station",
    point: { x: 0, z: 2 },
  };
}
export function runOperator(s: State) {
  if (
    s.money + expansionPaid(s, expansionChoices(s)[0]) >=
    (expansions[(expansionChoices(s)[0] ?? 0) - 1]?.cost ?? Infinity)
  )
    command(s, "expand");
  const goal = objective(s);
  s.target = goal.point;
  if (goal.key === "Order supplies" && near(s.player, supply))
    command(s, "supply");
}
export function offline(s: State, seconds: number) {
  if (seconds <= 0 || !hasExpansion(s, 5)) return 0;
  const duration = Math.min(seconds, 7200 + s.upgrades[5] * 4320),
    earned = s.earned,
    cash = s.money;
  const oldEvents = s.events;
  // Run only economic ticks at a coarse rate, with the same stock/cleanliness constraints.
  // Simulated time is capped to avoid work proportional to long absences; scaling only
  // applies after full logistics can sustain the station.
  const simulated = Math.min(duration, 600);
  for (let t = 0; t < simulated; t += 0.1) step(s, 0.1);
  const actual = s.money - cash;
  const value = Math.floor(
    Math.max(0, actual) *
      0.65 *
      (hasExpansion(s, 11) && s.autoSupply && s.open
        ? duration / simulated
        : 1),
  );
  s.money = cash + (actual < 0 ? actual : value);
  s.earned = earned + value;
  s.events = oldEvents;
  return value;
}
export function encode(state: State, savedAt = Date.now()) {
  return JSON.stringify({
    format: "next-stop",
    version: 1,
    savedAt,
    state: { ...state, events: [], target: null },
  });
}
export function decode(text: string): { state: State; savedAt: number } | null {
  try {
    if (text.length > 1_000_000) return null;
    const d = JSON.parse(text),
      s = d.state as State;
    if (
      d.format !== "next-stop" ||
      d.version !== 1 ||
      !Number.isFinite(d.savedAt) ||
      d.savedAt < 0 ||
      d.savedAt > 8640000000000000 ||
      s?.id !== "gas" ||
      s.version !== 1
    )
      return null;
    const n = (v: unknown, a = 0, b = 1e12) =>
      typeof v === "number" && Number.isFinite(v) && v >= a && v <= b;
    const integer = (v: unknown, a = 0, b = 1e12) =>
      n(v, a, b) && Number.isInteger(v);
    const pos = (v: Vec) => !!v && n(v.x, -24, 24) && n(v.z, -18, 20);
    if (
      ![
        "time",
        "money",
        "earned",
        "served",
        "fuelSold",
        "cleaned",
        "paid",
        "seed",
        "nextId",
        "spawn",
        "truckSpawn",
        "goods",
        "delivery",
      ].every((k) => n((s as unknown as Record<string, unknown>)[k])) ||
      !n(s.level, 0, 12) ||
      !Number.isInteger(s.level) ||
      !pos(s.player) ||
      !n(s.player.count, 0, 20) ||
      !n(s.skin, 0, 2)
    )
      return null;
    if (
      !integer(s.nextId, 1) ||
      !integer(s.seed, 0, 4294967295) ||
      !integer(s.player.count, 0, capacity(s)) ||
      !integer(s.skin, 0, 2) ||
      (!s.owned &&
        (s.level === 12 ? s.paid !== 0 : s.paid >= expansions[s.level].cost))
    )
      return null;
    if (
      s.owned !== undefined &&
      (!Array.isArray(s.owned) ||
        s.owned.length !== s.level ||
        new Set(s.owned).size !== s.owned.length ||
        s.owned.some(
          (id) =>
            !integer(id, 1, 12) ||
            (expansionDependencies[id] ?? []).some(
              (dep) => !s.owned!.includes(dep),
            ),
        ))
    )
      return null;
    if (
      s.owned === undefined &&
      (s.selected !== undefined || s.funding !== undefined)
    )
      return null;
    const choices = expansionChoices(s);
    if (s.selected !== undefined && !choices.includes(s.selected)) return null;
    if (
      s.funding !== undefined &&
      (!s.funding ||
        typeof s.funding !== "object" ||
        Array.isArray(s.funding) ||
        Object.entries(s.funding).some(
          ([key, value]) =>
            !choices.includes(Number(key)) ||
            String(Number(key)) !== key ||
            !n(value) ||
            value >= expansions[Number(key) - 1].cost,
        ))
    )
      return null;
    if (s.owned && s.paid !== (s.selected ? (s.funding?.[s.selected] ?? 0) : 0))
      return null;
    if (
      !Array.isArray(s.fuel) ||
      s.fuel.length !== 2 ||
      !s.fuel.every((x) => n(x, 0, 1000)) ||
      !Array.isArray(s.upgrades) ||
      s.upgrades.length !== 6 ||
      !s.upgrades.every((x) => Number.isInteger(x) && n(x, 0, 5))
    )
      return null;
    if (s.supplyDebt === undefined) s.supplyDebt = 0;
    if (s.supplySpent === undefined) s.supplySpent = 0;
    if (
      !integer(s.supplyDebt, 0, 8 * supplyUnitCost) ||
      !integer(s.supplySpent)
    )
      return null;
    if (s.supplyOrder === undefined) {
      s.supplyOrder =
        s.delivery > 0
          ? {
              fuel: [
                Math.max(0, Math.ceil(tankCapacity(s, 0) - s.fuel[0])),
                Math.max(0, Math.ceil(tankCapacity(s, 1) - s.fuel[1])),
              ],
              goods: Math.max(0, warehouseCapacity(s) - s.goods),
              cost: 0,
              credit: 0,
            }
          : null;
    }
    if (s.delivery > 24 || s.delivery > 0 !== (s.supplyOrder !== null))
      return null;
    if (s.supplyOrder) {
      const order = s.supplyOrder;
      if (
        !Array.isArray(order.fuel) ||
        order.fuel.length !== 2 ||
        !order.fuel.every((n, i) => integer(n, 0, tankCapacity(s, i))) ||
        !integer(order.goods, 0, warehouseCapacity(s)) ||
        !integer(order.cost) ||
        !integer(order.credit, 0, 8 * supplyUnitCost) ||
        order.credit > order.cost
      )
        return null;
      if (
        order.cost !== 0 &&
        order.cost !==
          (order.fuel[0] + order.fuel[1] + order.goods) * supplyUnitCost
      )
        return null;
    }
    if (
      !Array.isArray(s.facilities) ||
      s.facilities.length !== 7 ||
      !s.facilities.every(
        (f) =>
          n(f.stock, 0, 200) &&
          n(f.clean, 0, 100) &&
          n(f.timer) &&
          integer(f.customer, -1) &&
          integer(f.stock, 0, 200) &&
          integer(f.quality, 1, 3),
      )
    )
      return null;
    // Version-one saves made before the additional inventory fields retain their
    // finished stock; new input buffers begin empty and do not create supplies.
    for (const f of s.facilities) {
      if (f.raw === undefined) f.raw = 0;
      if (f.progress === undefined) f.progress = 0;
      if (f.blocked === undefined) f.blocked = f.clean < 35;
      if (
        !integer(f.raw, 0, 32) ||
        !n(f.progress, 0, 4) ||
        typeof f.blocked !== "boolean"
      )
        return null;
    }
    if (s.marketStocks === undefined)
      s.marketStocks = [s.facilities[0].stock, 0, 0, 0, 0, 0];
    if (
      !Array.isArray(s.marketStocks) ||
      s.marketStocks.length !== 6 ||
      !s.marketStocks.every((x) => integer(x, 0, 100))
    )
      return null;
    for (const field of ["traffic", "truckTraffic"] as const) {
      if (s[field] === undefined) s[field] = -1;
      if (!integer(s[field], -1)) return null;
    }
    if (
      !Array.isArray(s.workers) ||
      s.workers.length > 6 ||
      !s.workers.every(
        (w) =>
          pos(w) &&
          integer(w.role, 0, 5) &&
          hasExpansion(s, roleLevels[w.role]) &&
          integer(w.carrying, 0, 30) &&
          integer(w.target, -1, 6),
      ) ||
      new Set(s.workers.map((w) => w.role)).size !== s.workers.length
    )
      return null;
    if (
      !Array.isArray(s.vehicles) ||
      s.vehicles.length > 18 ||
      !s.vehicles.every(
        (v) =>
          pos(v) &&
          integer(v.id, 1) &&
          typeof v.truck === "boolean" &&
          ["queue", "approach", "fuel", "depart", "park", "exit"].includes(
            v.state,
          ) &&
          integer(v.pump, -1, 5) &&
          integer(v.slot, -1, 9) &&
          n(v.remaining, 0, 16) &&
          n(v.timer) &&
          n(v.wait) &&
          n(v.happy, 0, 1) &&
          n(v.age) &&
          typeof v.paid === "boolean" &&
          Array.isArray(v.plan) &&
          v.plan.every((i) => Number.isInteger(i) && n(i, 0, 6)) &&
          integer(v.service, -1, 6) &&
          (v.visitor === null || pos(v.visitor)),
      )
    )
      return null;
    if (
      new Set(s.vehicles.map((v) => v.id)).size !== s.vehicles.length ||
      s.nextId <= Math.max(0, ...s.vehicles.map((v) => v.id))
    )
      return null;
    const slots = s.vehicles.filter((v) => v.slot >= 0).map((v) => v.slot),
      reserved = s.vehicles.filter((v) => v.pump >= 0).map((v) => v.pump);
    if (
      new Set(slots).size !== slots.length ||
      new Set(reserved).size !== reserved.length
    )
      return null;
    for (const v of s.vehicles) {
      if (v.heading === undefined)
        v.heading =
          v.state === "queue" ? (v.truck ? -Math.PI / 2 : Math.PI / 2) : 0;
      if (v.category === undefined) v.category = v.plan.includes(0) ? 0 : -1;
      if (!n(v.heading, -Math.PI, Math.PI) || !integer(v.category, -1, 5))
        return null;
      if (
        v.plan.includes(0) &&
        (v.category < 0 || !hasExpansion(s, marketCategories[v.category].level))
      )
        return null;
      if (v.state === "approach" && !integer(v.timer, 0, 1)) return null;
      if (v.state === "depart" && !integer(v.timer, 0, v.truck ? 1 : 0))
        return null;
      if (
        v.state === "park" &&
        !v.visitor &&
        !integer(v.timer, 0, v.truck ? 2 : 1)
      )
        return null;
      if (v.state === "exit" && !integer(v.timer, 0, v.truck ? 2 : 4))
        return null;
      if (v.state === "exit" && v.slot >= 0 && v.timer !== 0) return null;
      if (
        v.slot >= 0 &&
        (v.truck
          ? v.slot < 6 || v.slot >= (hasExpansion(s, 10) ? 10 : 8)
          : v.slot >= parkCount(s))
      )
        return null;
      if (v.truck && !hasExpansion(s, 8)) return null;
      if (v.plan.some((i) => !activeFacility(s, i) || (i >= 5 && !v.truck)))
        return null;
      if (!["approach", "fuel", "depart"].includes(v.state) && v.pump !== -1)
        return null;
      if (
        v.state !== "park" &&
        ((v.state !== "exit" && v.slot !== -1) ||
          v.service !== -1 ||
          v.visitor !== null)
      )
        return null;
      if (
        ["approach", "fuel", "depart"].includes(v.state) &&
        (v.pump < 0 || (v.truck ? v.pump < 4 : v.pump >= pumpCount(s)))
      )
        return null;
      if (
        v.state === "park" &&
        (v.slot < 0 ||
          (v.truck
            ? v.slot < 6 || v.slot >= (hasExpansion(s, 10) ? 10 : 8)
            : v.slot >= parkCount(s)))
      )
        return null;
      if (
        v.service >= 0 &&
        (v.state !== "park" ||
          !v.visitor ||
          v.plan[0] !== v.service ||
          s.facilities[v.service].customer !== v.id ||
          !activeFacility(s, v.service) ||
          (facilities[v.service].type !== "wc" &&
            s.facilities[v.service].stock <= 0))
      )
        return null;
      if (
        v.service === 0 &&
        (v.category < 0 || s.marketStocks[v.category] <= 0)
      )
        return null;
    }
    for (let a = 0; a < s.vehicles.length; a++)
      for (let b = a + 1; b < s.vehicles.length; b++)
        if (vehiclesOverlap(s.vehicles[a], s.vehicles[b])) return null;
    for (const field of ["traffic", "truckTraffic"] as const)
      if (
        s[field] >= 0 &&
        !s.vehicles.some(
          (v) =>
            v.id === s[field] &&
            v.truck === (field === "truckTraffic") &&
            (v.state === "depart" ||
              v.state === "exit" ||
              (v.state === "park" && !v.visitor)),
        )
      )
        return null;
    if (
      s.facilities.some(
        (f, i) =>
          f.customer >= 0 &&
          !s.vehicles.some((v) => v.id === f.customer && v.service === i),
      )
    )
      return null;
    if (
      typeof s.open !== "boolean" ||
      typeof s.autoSupply !== "boolean" ||
      !Array.isArray(s.rating) ||
      s.rating.length > 20 ||
      !s.rating.every((x) => n(x, 0, 1)) ||
      !s.daily ||
      typeof s.daily.date !== "string" ||
      !n(s.daily.served) ||
      !n(s.daily.cleaned) ||
      !Array.isArray(s.daily.claimed) ||
      s.daily.claimed.length !== 3 ||
      !s.daily.claimed.every((x) => typeof x === "boolean")
    )
      return null;
    s.events = [];
    s.target = null;
    recoverPedestrians(s);
    return { state: s, savedAt: d.savedAt };
  } catch {
    return null;
  }
}

export type Progress = number | Pick<State, "level" | "owned" | "funding">;
export const ownedIds = (s: Progress): number[] =>
  typeof s === "number"
    ? Array.from({ length: s }, (_, i) => i + 1)
    : (s.owned ?? ownedIds(s.level));
export const hasExpansion = (s: Progress, id: number) =>
  id === 0 ||
  (typeof s === "number"
    ? s >= id
    : s.owned
      ? s.owned.includes(id)
      : s.level >= id);
export const expansionDependencies: Record<number, number[]> = {
  3: [2],
  4: [2],
  6: [3],
  7: [1, 3],
  9: [8],
  10: [8, 9],
  11: [5, 2],
};
export const expansionChoices = (s: Progress) => {
  const owned = ownedIds(s);
  const pending =
    typeof s === "number"
      ? []
      : Object.keys(s.funding ?? {})
          .map(Number)
          .filter(
            (id) =>
              Number.isInteger(id) &&
              id >= 1 &&
              id <= expansions.length &&
              !owned.includes(id) &&
              (expansionDependencies[id] ?? []).every((dep) =>
                owned.includes(dep),
              ),
          );
  return [
    ...new Set([
      ...pending,
      ...offeredIds(expansions.length, owned, expansionDependencies),
    ]),
  ].slice(0, 2);
};
export const expansionPaid = (s: State, id: number) =>
  s.funding?.[id] ?? (id === (s.selected ?? s.level + 1) ? s.paid : 0);
