import { createNavigator } from "../../RestaurantCommon/src/navigation";
import {
  facilities,
  pumps,
  hasExpansion,
  ownedIds,
  pumpCount,
  type State,
  type Vec,
  type Vehicle,
} from "./simulation";

type Rect = Vec & { width: number; depth: number };
const bodyRadius = 0.22;
export function solidFootprints(s: State): Rect[] {
  const solids: Rect[] = [{ x: -16, z: 8, width: 2.7, depth: 2.5 }];
  for (const x of [-14, -7, 1, 10, 18])
    solids.push({ x, z: 4.15, width: 0.19, depth: 0.19 });
  for (const x of [-19, 19])
    for (const z of [-6, -1, 4, 9])
      solids.push({ x, z, width: 0.16, depth: 0.16 });
  solids.push({ x: -19, z: -5, width: 0.26, depth: 0.26 });
  facilities.forEach((f, i) => {
    if (hasExpansion(s, f.level))
      solids.push({
        x: f.x,
        z: f.z,
        width: i === 0 ? 4 : i < 3 ? 3.5 : 2.6,
        depth: 3.5,
      });
  });
  pumps.forEach((p, i) => {
    if (i < pumpCount(s) || (i >= 4 && hasExpansion(s, 8)))
      solids.push({
        x: p.x - (i < 4 ? 2 : 2.4),
        z: p.z,
        width: 2.4,
        depth: 1.1,
      });
  });
  if (hasExpansion(s, 12))
    for (const x of [-13, 11])
      for (const z of [-9, -5]) solids.push({ x, z, width: 0.16, depth: 0.16 });
  return solids;
}
const angles = new WeakMap<
  Vehicle,
  { angle: number; cos: number; sin: number }
>();
export function pedestrianOverlapsVehicle(
  p: Vec,
  v: Vehicle,
  clearance = 0,
): boolean {
  const angle = v.heading ?? 0,
    x = p.x - v.x,
    z = p.z - v.z;
  const width = (v.truck ? 1.1 : 0.9) + bodyRadius + clearance;
  const length = (v.truck ? 3.7 : 1.55) + bodyRadius + clearance;
  if (angle === 0 || Math.abs(angle) === Math.PI)
    return Math.abs(x) < width && Math.abs(z) < length;
  if (Math.abs(angle) === Math.PI / 2)
    return Math.abs(x) < length && Math.abs(z) < width;
  let rotation = angles.get(v);
  if (!rotation || rotation.angle !== angle) {
    rotation = { angle, cos: Math.cos(angle), sin: Math.sin(angle) };
    angles.set(v, rotation);
  }
  return (
    Math.abs(x * rotation.cos - z * rotation.sin) <
      (v.truck ? 1.1 : 0.9) + bodyRadius + clearance &&
    Math.abs(x * rotation.sin + z * rotation.cos) <
      (v.truck ? 3.7 : 1.55) + bodyRadius + clearance
  );
}
const stationary = (v: Vehicle) =>
  v.state === "fuel" || (v.state === "park" && v.visitor !== null);
const waypoints = new WeakMap<
  Vec,
  { target: string; layout: string; point: Vec }
>();
const cache = new WeakMap<
  State,
  {
    key: string;
    nav: ReturnType<typeof createNavigator>;
    targets: Map<string, Vec>;
  }
>();
const frames = new WeakMap<
  State,
  {
    time: number;
    progress: string;
    count: number;
    value: ReturnType<typeof buildNavigator>;
  }
>();
export function pedestrianNavigator(
  s: State,
): ReturnType<typeof buildNavigator> {
  const progress = s.owned?.join(",") ?? String(s.level);
  const old = frames.get(s);
  if (
    old &&
    old.time === s.time &&
    old.progress === progress &&
    old.count === s.vehicles.length
  )
    return old.value;
  const value = buildNavigator(s);
  frames.set(s, { time: s.time, progress, count: s.vehicles.length, value });
  return value;
}
function buildNavigator(s: State) {
  const fixed = solidFootprints(s);
  const fixedWalkable = (p: Vec, clearance = 0) => {
    const r = bodyRadius + clearance;
    return (
      p.x >= -19 + clearance &&
      p.x <= 19 - clearance &&
      p.z >= -9 + clearance &&
      p.z <= 10 - clearance &&
      !fixed.some(
        (b) =>
          Math.abs(p.x - b.x) < b.width / 2 + r &&
          Math.abs(p.z - b.z) < b.depth / 2 + r,
      )
    );
  };
  const parked = s.vehicles.filter(stationary);
  const key = `gas:${ownedIds(s).join(",")}:${parked
    .map((v) => `${v.x}:${v.z}:${v.heading}:${v.truck}`)
    .sort()
    .join(";")}`;
  let entry = cache.get(s);
  if (!entry || entry.key !== key) {
    entry = {
      key,
      targets: new Map(),
      nav: createNavigator({
        key,
        walkable: (p, c = 0) =>
          fixedWalkable(p, c) &&
          !parked.some((v) => pedestrianOverlapsVehicle(p, v, c)),
      }),
    };
    cache.set(s, entry);
  }
  const routes = entry.nav;
  // Moving traffic can block the next footstep, but does not invalidate every
  // pedestrian route each frame. Existing traffic reservations remain untouched.
  const live = createNavigator({
    key: `${key}:live`,
    walkable: (p, c = 0) =>
      fixedWalkable(p, c) &&
      !s.vehicles.some((v) => pedestrianOverlapsVehicle(p, v, c)),
  });
  const recover = (p: Vec) => {
    if (!live.walkable(p)) {
      Object.assign(p, live.nearest(p));
      waypoints.delete(p);
    }
  };
  return {
    walkable: live.walkable,
    nearest: live.nearest,
    recover,
    move(p: Vec, vector: Vec, amount: number) {
      recover(p);
      live.move(p, vector, amount);
    },
    toward(p: Vec, target: Vec, speed: number, dt: number): boolean {
      recover(p);
      const requested = `${target.x}:${target.z}`;
      let destination = entry!.targets.get(requested);
      if (!destination) {
        destination = routes.nearest(target);
        entry!.targets.set(requested, destination);
      }
      const targetKey = `${destination.x}:${destination.z}:${ownedIds(s).join(",")}`;
      let waypoint = waypoints.get(p);
      if (
        !waypoint ||
        waypoint.target !== targetKey ||
        Math.hypot(p.x - waypoint.point.x, p.z - waypoint.point.z) < 0.005 ||
        !routes.walkable(waypoint.point)
      ) {
        const next = { ...p };
        // Ask the shared router for its next visible corner, then follow that
        // segment over subsequent ticks rather than repeating BFS every frame.
        routes.toward(next, destination, 1000, 1);
        waypoint = { target: targetKey, layout: key, point: next };
        waypoints.set(p, waypoint);
      }
      const delta = { x: waypoint.point.x - p.x, z: waypoint.point.z - p.z };
      const length = Math.hypot(delta.x, delta.z);
      const before = { ...p };
      if (length)
        live.move(
          p,
          { x: delta.x / length, z: delta.z / length },
          Math.min(length, speed * dt),
        );
      // A newly parked vehicle can invalidate a previously clear segment.
      if (
        Math.hypot(p.x - before.x, p.z - before.z) < 0.001 &&
        waypoint.layout !== key
      )
        waypoints.delete(p);
      return Math.hypot(p.x - destination.x, p.z - destination.z) < 0.16;
    },
  };
}
export function recoverPedestrians(s: State) {
  const nav = pedestrianNavigator(s);
  nav.recover(s.player);
  s.workers.forEach(nav.recover);
  for (const v of s.vehicles) if (v.visitor) nav.recover(v.visitor);
}
