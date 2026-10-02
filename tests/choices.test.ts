import {
  describe,
  it,
  expect,
} from "../../RestaurantCommon/node_modules/vitest/dist/index.js";
import {
  createGame,
  command,
  expansionChoices,
  hasExpansion,
  pumpCount,
  encode,
  decode,
  step,
  marketCategoriesFor,
} from "../src/simulation";
describe("independent station expansion choices", () => {
  it("can buy the market first without granting a second pump", () => {
    const s = createGame();
    s.money = 100;
    expect(expansionChoices(s)).toEqual([1, 2]);
    command(s, "expand", 2);
    expect(s.owned).toEqual([2]);
    expect(s.level).toBe(1);
    expect(pumpCount(s)).toBe(1);
    expect(hasExpansion(s, 1)).toBe(false);
    expect(marketCategoriesFor(s).length).toBe(2);
    expect(decode(encode(s))).not.toBeNull();
    for (let i = 0; i < 100; i++) step(s, 0.1);
    expect(decode(encode(s))).not.toBeNull();
  });
  it("keeps partial contributions and migrates legacy progression", () => {
    const s = createGame();
    s.money = 4;
    command(s, "expand", 1);
    s.money = 7;
    command(s, "expand", 2);
    expect(s.funding).toEqual({ 1: 4, 2: 7 });
    expect(s.paid).toBe(7);
    expect(decode(encode(s))).not.toBeNull();
    const old = createGame();
    old.level = 2;
    old.paid = 5;
    old.money = 8;
    command(old, "expand", 4);
    expect(old.funding).toEqual({ 3: 5, 4: 8 });
    expect(old.owned).toEqual([1, 2]);
    expect(decode(encode(old))).not.toBeNull();
  });
  it("rejects unoffered purchases, duplicate ownership and invalid funding", () => {
    const s = createGame();
    s.money = 1000;
    command(s, "expand", 12);
    expect(s.level).toBe(0);
    expect(s.money).toBe(1000);
    command(s, "expand", 2);
    s.owned = [2, 2];
    s.level = 2;
    expect(decode(encode(s))).toBeNull();
    s.owned = [2];
    s.level = 1;
    s.funding = { 1: 100 };
    expect(decode(encode(s))).toBeNull();
  });
});

it("reversed choices retain live valid saves through completion", () => {
  const s = createGame();
  s.money = 100000;
  while (s.level < 12) {
    command(s, "expand", expansionChoices(s).at(-1));
    for (let i = 0; i < 300; i++) step(s, 0.1);
    expect(decode(encode(s)), `owned ${s.owned}`).not.toBeNull();
  }
  expect(new Set(s.owned).size).toBe(12);
});

it("keeps a funded offer available when another purchase unlocks earlier options", () => {
  const s = createGame();
  s.money = 24;
  command(s, "expand", 1);
  s.money = 10;
  command(s, "expand", 5);
  s.money = 60;
  command(s, "expand", 2);
  expect(expansionChoices(s)).toContain(5);
  expect(s.funding?.[5]).toBe(10);
  expect(decode(encode(s))).not.toBeNull();
});
