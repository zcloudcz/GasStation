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
  pumps,
  type Vehicle,
} from "../src/simulation";

function vehicle(id = 1): Vehicle {
  return {
    id,
    truck: false,
    state: "fuel",
    x: -10,
    z: -7,
    pump: 0,
    slot: -1,
    timer: 0,
    remaining: 4,
    paid: false,
    plan: [],
    service: -1,
    visitor: null,
    wait: 0,
    happy: 1,
    age: 0,
  };
}
describe("review regressions", () => {
  it("rejects overlapping vehicles even when their pump reservations differ", () => {
    const s = createGame();
    s.level = 1;
    s.open = false;
    s.nextId = 3;
    s.vehicles = [
      { ...vehicle(), timer: 1, remaining: 0, paid: true },
      { ...vehicle(2), pump: 1, timer: 1, remaining: 0, paid: true },
    ];
    expect(decode(encode(s))).toBeNull();
  });
  it("finishes a cleaner job and counts it once", () => {
    const s = createGame();
    s.level = 5;
    s.open = false;
    s.facilities[3].clean = 70;
    for (let i = 0; i < 1000; i++) step(s, 0.1);
    expect(s.facilities[3].clean).toBe(100);
    expect(s.cleaned).toBe(1);
    expect(s.daily.cleaned).toBe(1);
  });
  it("rejects fractional indexes and impossible active service saves", () => {
    const s = createGame();
    s.level = 4;
    s.open = false;
    s.nextId = 2;
    s.vehicles = [{ ...vehicle(), state: "approach", pump: 0.5 }];
    expect(decode(encode(s))).toBeNull();
    s.vehicles = [
      {
        ...vehicle(),
        state: "park",
        pump: -1,
        slot: 0,
        paid: true,
        remaining: 0,
        service: 0,
        plan: [0],
        visitor: { x: -10, z: 5 },
        timer: 3,
      },
    ];
    s.facilities[0].customer = 1;
    s.facilities[0].stock = 0;
    expect(decode(encode(s))).toBeNull();
    s.facilities[0].customer = -1;
    s.facilities[3].customer = 1;
    s.vehicles = [
      { ...vehicle(), state: "exit", pump: -1, service: 3, plan: [3] },
    ];
    expect(decode(encode(s))).toBeNull();
  });
  it("rejects excess expansion contributions and never refunds a negative payment", () => {
    const s = createGame();
    s.paid = 25;
    s.money = 1;
    expect(decode(encode(s))).toBeNull();
    command(s, "expand");
    expect(s.money).toBeLessThanOrEqual(1);
    s.level = 12;
    s.paid = 1;
    expect(decode(encode(s))).toBeNull();
  });
  it("does not multiply finite customers while arrivals are closed offline", () => {
    const setup = () => {
      const s = createGame();
      s.level = 12;
      s.autoSupply = true;
      s.open = false;
      s.nextId = 2;
      s.vehicles = [{ ...vehicle(), timer: 1 }];
      return s;
    };
    expect(offline(setup(), 7200)).toBe(offline(setup(), 600));
  });
  it("keeps trucks clear of an occupied diesel bay", () => {
    const s = createGame();
    s.level = 8;
    s.open = false;
    s.nextId = 3;
    s.vehicles = [
      { ...vehicle(), truck: true, pump: 4, ...pumps[4], remaining: 16 },
      {
        ...vehicle(2),
        truck: true,
        state: "approach",
        pump: 5,
        x: 17,
        z: -5,
        timer: 1,
        remaining: 16,
      },
    ];
    for (let i = 0; i < 6; i++) step(s, 0.1);
    expect(
      Math.hypot(
        s.vehicles[0].x - s.vehicles[1].x,
        s.vehicles[0].z - s.vehicles[1].z,
      ),
    ).toBeGreaterThan(2.1);
  });
});
