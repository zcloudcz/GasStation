import {
  describe,
  it,
  expect,
} from "../../RestaurantCommon/node_modules/vitest/dist/index.js";
import {
  createGame,
  step,
  facilities,
  pumps,
  servicePoint,
  supply,
  encode,
  decode,
  type Vehicle,
} from "../src/simulation";
import {
  pedestrianNavigator,
  pedestrianOverlapsVehicle,
  solidFootprints,
} from "../src/navigation";

describe("pedestrian collisions", () => {
  it("blocks solids while preserving every service interaction", () => {
    const s = createGame();
    s.level = 12;
    s.open = false;
    const nav = pedestrianNavigator(s);
    for (const b of solidFootprints(s)) expect(nav.walkable(b)).toBe(false);
    for (const goal of [
      supply,
      ...facilities.map((f) => ({ x: f.x, z: 5 })),
      ...pumps.map((_, i) => servicePoint(i)),
    ]) {
      const actor = { x: -12, z: -4 };
      for (let i = 0; i < 1000 && !nav.toward(actor, goal, 5, 0.1); i++)
        expect(nav.walkable(actor)).toBe(true);
      expect(nav.walkable(actor)).toBe(true);
      expect(Math.hypot(actor.x - goal.x, actor.z - goal.z)).toBeLessThan(1.7);
    }
  });
  it("direct input slides around buildings instead of crossing them", () => {
    const s = createGame();
    s.level = 2;
    s.open = false;
    s.player.x = -10;
    s.player.z = 4;
    for (let i = 0; i < 100; i++) step(s, 0.1, { x: 0, z: 1 });
    expect(s.player.z).toBeLessThan(5.25);
    expect(pedestrianNavigator(s).walkable(s.player)).toBe(true);
    const before = s.player.x;
    for (let i = 0; i < 30; i++) step(s, 0.1, { x: 1, z: 1 });
    expect(s.player.x).toBeGreaterThan(before + 2);
  });
  it("routes around parked cars and respects moving traffic", () => {
    const s = createGame();
    s.level = 12;
    const v: Vehicle = {
      id: 1,
      truck: false,
      state: "park",
      x: -9,
      z: 1,
      pump: -1,
      slot: 1,
      timer: 0,
      remaining: 0,
      paid: true,
      plan: [],
      service: -1,
      visitor: { x: -9, z: 3 },
      wait: 0,
      happy: 1,
      age: 0,
      heading: 0,
    };
    s.vehicles.push(v);
    const nav = pedestrianNavigator(s),
      actor = { x: -9, z: -3 },
      target = { x: -9, z: 4 };
    for (let i = 0; i < 500 && !nav.toward(actor, target, 4, 0.1); i++)
      expect(pedestrianOverlapsVehicle(actor, v)).toBe(false);
    expect(Math.hypot(actor.x - target.x, actor.z - target.z)).toBeLessThan(
      0.2,
    );
    v.state = "approach";
    const walker = { x: -9, z: -3 };
    for (let i = 0; i < 30; i++)
      pedestrianNavigator(s).move(walker, { x: 0, z: 1 }, 0.2);
    expect(pedestrianOverlapsVehicle(walker, v)).toBe(false);
  });
  it("recovers legacy actors inside solids without losing inventory", () => {
    const s = createGame();
    s.level = 12;
    s.money = 321;
    s.player.x = -16;
    s.player.z = 8;
    s.player.count = 3;
    s.workers = [{ role: 0, x: -10, z: 7, target: -1, carrying: 2 }];
    const loaded = decode(encode(s));
    expect(loaded).not.toBeNull();
    if (!loaded) return;
    const nav = pedestrianNavigator(loaded.state);
    expect(nav.walkable(loaded.state.player)).toBe(true);
    expect(nav.walkable(loaded.state.workers[0])).toBe(true);
    expect(loaded.state.player.count).toBe(3);
    expect(loaded.state.workers[0].carrying).toBe(2);
    expect(loaded.state.money).toBe(321);
  });
  it("keeps workers and visiting pedestrians outside solids during live traffic", () => {
    const s = createGame(); s.level = 12; s.autoSupply = true;
    for (let i = 0; i < 1500; i++) {
      step(s, .1);
      const nav = pedestrianNavigator(s);
      for (const actor of [s.player, ...s.workers, ...s.vehicles.flatMap((v) => v.visitor ? [v.visitor] : [])])
        expect(nav.walkable(actor), `tick ${i}: ${actor.x},${actor.z}`).toBe(true);
    }
    expect(s.served).toBeGreaterThan(0);
  }, 10000);

});
