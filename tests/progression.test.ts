import {
  describe,
  it,
  expect,
} from "../../RestaurantCommon/node_modules/vitest/dist/index.js";
import {
  createGame,
  step,
  runOperator,
  decode,
  encode,
  vehiclesOverlap,
  marketCategoriesFor,
  facilities,
  parking,
  type Vehicle,
} from "../src/simulation";

describe("complete station progression", () => {
  it("serves six separate market categories and never substitutes missing stock", () => {
    expect(marketCategoriesFor(2)).toHaveLength(2);
    expect(marketCategoriesFor(10)).toHaveLength(6);
    const s = createGame();
    s.level = 10;
    s.open = false;
    s.nextId = 2;
    s.goods = 0;
    const visitor: Vehicle = {
      id: 1,
      truck: false,
      state: "park",
      ...parking[0],
      pump: -1,
      slot: 0,
      timer: 0,
      remaining: 0,
      paid: true,
      plan: [0],
      service: -1,
      visitor: { x: facilities[0].x, z: 5 },
      wait: 0,
      happy: 1,
      age: 0,
      category: 5,
      heading: 0,
    };
    s.vehicles = [visitor];
    s.marketStocks = [8, 8, 8, 8, 8, 0];
    for (let i = 0; i < 40; i++) step(s, 0.1);
    expect(visitor.service).toBe(-1);
    expect(s.money).toBe(0);
    expect(s.marketStocks[0]).toBe(8);
    s.marketStocks[5] = 1;
    for (let i = 0; i < 40; i++) step(s, 0.1);
    expect(s.marketStocks[5]).toBe(0);
    expect(s.marketStocks[0]).toBe(8);
    expect(s.money).toBe(9);
  });
  it("prepares drinks and hot food over time from finite raw inputs", () => {
    const s = createGame();
    s.level = 6;
    s.open = false;
    s.goods = 0;
    for (const i of [1, 2]) {
      s.facilities[i].raw = 2;
      s.facilities[i].stock = 0;
    }
    step(s, 0.1);
    expect(s.facilities[1].stock).toBe(0);
    expect(s.facilities[2].stock).toBe(0);
    for (let i = 0; i < 50; i++) step(s, 0.1);
    for (const i of [1, 2]) {
      expect(s.facilities[i].stock).toBeGreaterThan(0);
      expect(s.facilities[i].stock + s.facilities[i].raw).toBe(2);
    }
  });
  it.each(Array.from({ length: 20 }, (_, i) => i + 1))(
    "finishes seed %i in 35–50 minutes without traffic overlap or invalid saves",
    async (seed) => {
      const s = createGame();
      s.seed = seed;
      let ticks = 0;
      while (s.level < 12 && ticks < 30001) {
        runOperator(s);
        step(s, 0.1);
        ticks++;
        for (let a = 0; a < s.vehicles.length; a++)
          for (let b = a + 1; b < s.vehicles.length; b++)
            if (vehiclesOverlap(s.vehicles[a], s.vehicles[b]))
              throw new Error(
                `seed ${seed} tick ${ticks}: overlapping vehicles ${s.vehicles[a].id}/${s.vehicles[b].id}`,
              );
        if (ticks % 600 === 0) {
          await new Promise((resolve) => setTimeout(resolve, 0));
          expect(
            decode(encode(s)),
            `save seed ${seed} tick ${ticks}`,
          ).not.toBeNull();
          expect(s.money).toBeGreaterThanOrEqual(0);
          expect(s.vehicles.length).toBeLessThanOrEqual(18);
          expect(
            s.facilities.every(
              (f) => f.stock >= 0 && f.raw >= 0 && f.clean >= 0,
            ),
          ).toBe(true);
        }
      }
      console.log("gas completion seed/minutes", seed, ticks / 600);
      expect(s.level, `seed ${seed}`).toBe(12);
      expect(ticks / 600, `seed ${seed}`).toBeGreaterThanOrEqual(35);
      expect(ticks / 600, `seed ${seed}`).toBeLessThanOrEqual(50);
    },
    60000,
  );
});
