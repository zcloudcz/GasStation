import {
  describe,
  it,
  expect,
} from "../../RestaurantCommon/node_modules/vitest/dist/index.js";
import {
  createGame,
  step,
  encode,
  decode,
  supplyQuote,
  orderSupplies,
  command,
  servicePoint,
} from "../src/simulation";
describe("paid supplies", () => {
  it("repays emergency credit from gross sales without charging supplies twice", () => {
    const s = createGame();
    s.fuel[0] = 0;
    Object.assign(s.player, servicePoint(0));
    orderSupplies(s, supplyQuote(s));
    for (let i = 0; i < 700; i++) step(s, 0.1);
    expect(s.supplyDebt).toBe(0);
    expect(s.earned).toBeGreaterThan(8);
    expect(s.money).toBe(s.earned - 8);
    expect(s.supplySpent).toBe(8);
  });
  it("honors an already promised legacy delivery without a retroactive charge", () => {
    const s = createGame();
    s.open = false;
    s.money = 50;
    s.fuel[0] = 0;
    s.delivery = 10;
    const raw = JSON.parse(encode(s));
    delete raw.state.supplyOrder;
    delete raw.state.supplyDebt;
    delete raw.state.supplySpent;
    const loaded = decode(JSON.stringify(raw))!.state;
    for (let i = 0; i < 110; i++) step(loaded, 0.1);
    expect(loaded.money).toBe(50);
    expect(loaded.fuel[0]).toBe(80);
    expect(loaded.supplyDebt).toBe(0);
  });
  it("quotes unlocked missing quantities and charges the accepted shipment exactly once", () => {
    const s = createGame();
    s.level = 8;
    s.open = false;
    s.money = 500;
    s.fuel = [70, 150];
    s.goods = 90;
    const quote = supplyQuote(s);
    expect(quote).toMatchObject({
      fuel: [10, 10],
      goods: 10,
      cost: 30,
      credit: 0,
    });
    expect(orderSupplies(s, quote)).toBe(true);
    expect(s.money).toBe(470);
    expect(orderSupplies(s, quote)).toBe(false);
    expect(s.money).toBe(470);
    s.fuel = [65, 145];
    s.goods = 85;
    for (let i = 0; i < 250; i++) step(s, 0.1);
    expect(s.fuel).toEqual([75, 155]);
    expect(s.money).toBe(470);
    expect(s.delivery).toBe(0);
  });
  it("offers only affordable partial stock and rejects stale unaffordable orders", () => {
    const s = createGame();
    s.money = 7;
    s.fuel[0] = 0;
    const quote = supplyQuote(s);
    expect(quote.cost).toBeLessThanOrEqual(7);
    expect(quote.fuel[1]).toBe(0);
    expect(quote.goods).toBe(0);
    s.money = 0;
    expect(orderSupplies(s, quote)).toBe(false);
    expect(s.money).toBe(0);
    expect(s.delivery).toBe(0);
  });
  it("uses disclosed repayable emergency fuel instead of trapping an empty wallet", () => {
    const s = createGame();
    s.money = 0;
    s.fuel[0] = 0;
    s.open = false;
    const quote = supplyQuote(s);
    expect(quote).toMatchObject({ fuel: [8, 0], cost: 8, credit: 8 });
    expect(orderSupplies(s, quote)).toBe(true);
    expect(s.money).toBe(0);
    expect(s.supplyDebt).toBe(8);
    for (let i = 0; i < 250; i++) step(s, 0.1);
    expect(s.fuel[0]).toBe(8);
    s.fuel[0] = 0;
    expect(supplyQuote(s).credit).toBe(0);
    expect(orderSupplies(s, supplyQuote(s))).toBe(false);
  });
  it("preserves a paid shipment and debt across save/load", () => {
    const s = createGame();
    s.money = 100;
    s.open = false;
    s.fuel[0] = 60;
    command(s, "supply");
    const restored = decode(encode(s))!.state;
    expect(restored.money).toBe(s.money);
    expect(restored.supplyOrder).toEqual(s.supplyOrder);
    for (let i = 0; i < 250; i++) step(restored, 0.1);
    expect(restored.money).toBe(s.money);
  });
});
