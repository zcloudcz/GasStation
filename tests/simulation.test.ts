import {
  describe,
  it,
  expect,
} from "../../RestaurantCommon/node_modules/vitest/dist/index.js";
import {
  createGame,
  step,
  command,
  encode,
  decode,
  offline,
  expansions,
  facilities,
  runOperator,
  servicePoint,
} from "../src/simulation";
describe("Gas station behavior", () => {
  it("sells fuel once and can replenish with an empty wallet", () => {
    const s = createGame();
    Object.assign(s.player, servicePoint(0));
    for (let i = 0; i < 800; i++) step(s, 0.1);
    expect(s.fuelSold).toBeGreaterThan(0);
    expect(s.money).toBeGreaterThan(0);
    s.money = 0;
    s.fuel[0] = 0;
    command(s, "supply");
    for (let i = 0; i < 400; i++) step(s, 0.1);
    expect(s.fuel[0]).toBeGreaterThan(0);
  });
  it("supports partial expansion and never spends negative currency", () => {
    const s = createGame();
    s.money = 10;
    command(s, "expand");
    expect(s.paid).toBe(10);
    expect(s.money).toBe(0);
    expect(s.level).toBe(0);
    s.money = 14;
    command(s, "expand");
    expect(s.level).toBe(1);
    expect(s.paid).toBe(0);
  });
  it("validates save identity, positions and reservation ownership", () => {
    const s = createGame();
    expect(decode(encode(s, 1000))).not.toBeNull();
    const raw = JSON.parse(encode(s, 1000));
    raw.state.player.x = 999;
    expect(decode(JSON.stringify(raw))).toBeNull();
    raw.state = createGame();
    raw.state.id = "burger";
    expect(decode(JSON.stringify(raw))).toBeNull();
  });
  it("bounded hour-long automation preserves stock, traffic and usable sanitation", () => {
    const s = createGame();
    s.level = 12;
    s.autoSupply = true;
    for (let i = 0; i < 36000; i++) step(s, 0.1);
    expect(s.served).toBeGreaterThan(100);
    expect(s.vehicles.length).toBeLessThanOrEqual(18);
    expect(s.fuel.every((n) => n >= 0)).toBe(true);
    expect(s.facilities.every((f) => f.clean >= 0 && f.clean <= 100)).toBe(
      true,
    );
    const occupied = s.vehicles
      .filter((v) => v.slot >= 0 && v.state === "park")
      .map((v) => v.slot);
    expect(new Set(occupied).size).toBe(occupied.length);
    expect(decode(encode(s, Date.now()))).not.toBeNull();
  }, 30000);
  it("offline is capped, ignores backward clocks and does not reward an unstaffed station", () => {
    const s = createGame();
    expect(offline(s, 1e7)).toBe(0);
    s.level = 12;
    s.autoSupply = true;
    const a = offline(s, 1e8),
      t = createGame();
    t.level = 12;
    t.autoSupply = true;
    expect(a).toBeGreaterThan(0);
    expect(offline(t, 7200)).toBe(a);
    expect(offline(t, -30)).toBe(0);
  }, 30000);
  it("active operator completes all expansions without injected money", () => {
    const s = createGame();
    let elapsed = 0;
    while (s.level < expansions.length && elapsed < 3600) {
      runOperator(s);
      step(s, 0.1);
      elapsed += 0.1;
    }
    console.log("GAS completion minutes", elapsed / 60, "served", s.served);
    expect(s.level).toBe(12);
    expect(s.earned).toBeGreaterThan(13000);
  }, 30000);
});
