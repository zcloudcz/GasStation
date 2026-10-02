import { hasExpansion, expansionChoices, expansionPaid } from "./simulation";
import * as T from "three";
import {
  box,
  cylinder,
  ball,
  bakeScenery,
  material,
  sign,
} from "../../RestaurantCommon/src/render/models";
import {
  facilities,
  pumps,
  parking,
  supply,
  servicePoint,
  pumpCount,
  parkCount,
  capacity,
  tankCapacity,
  objective,
  type State,
  type Vec,
} from "./simulation";
import { text, type Locale } from "./i18n";
const C = {
  cream: "#fff8df",
  orange: "#fa6428",
  blue: "#168ed1",
  green: "#43b86c",
  ink: "#44545e",
};
function person(color: string) {
  const g = new T.Group();
  cylinder(g, 0, 0.65, 0, 0.23, 0.7, color);
  ball(g, 0, 1.23, 0, 0.23, "#f1c399");
  cylinder(g, 0, 1.46, 0, 0.26, 0.12, C.cream);
  const legs = [
    box(g, -0.13, 0.2, 0, 0.15, 0.4, 0.18, C.ink),
    box(g, 0.13, 0.2, 0, 0.15, 0.4, 0.18, C.ink),
  ];
  const arms = [
    box(g, -0.31, 0.78, 0, 0.14, 0.48, 0.16, color),
    box(g, 0.31, 0.78, 0, 0.14, 0.48, 0.16, color),
  ];
  const carry = new T.Group();
  carry.position.set(0, 0.65, 0.38);
  g.add(carry);
  g.scale.set(1.16, 1.12, 1.16);
  return { g, legs, arms, carry, last: new T.Vector3() };
}
function animate(
  p: ReturnType<typeof person>,
  v: Vec,
  time: number,
  count = 0,
) {
  const moved = Math.hypot(p.last.x - v.x, p.last.z - v.z) > 0.001;
  if (moved) p.g.rotation.y = Math.atan2(v.x - p.last.x, v.z - p.last.z);
  p.g.position.set(v.x, 0, v.z);
  p.last.set(v.x, 0, v.z);
  p.legs.forEach(
    (l, i) =>
      (l.rotation.x = moved ? Math.sin(time * 12 + i * Math.PI) * 0.5 : 0),
  );
  p.arms.forEach(
    (l, i) =>
      (l.rotation.x = count
        ? -0.9
        : moved
          ? Math.sin(time * 12 + i * Math.PI) * 0.4
          : 0),
  );
  if (p.carry.children.length !== Math.min(count, 5) * 2) {
    for (const child of [...p.carry.children]) {
      child.traverse((o) => {
        if (o instanceof T.Mesh) o.geometry.dispose();
      });
      p.carry.remove(child);
    }
    for (let i = 0; i < Math.min(count, 5); i++) {
      box(p.carry, 0, i * 0.22, 0.14, 0.5, 0.2, 0.4, "#cca16a");
      box(p.carry, 0, i * 0.22 + 0.102, 0.14, 0.1, 0.015, 0.4, "#fff3d6");
    }
  }
}
function vehicle(truck: boolean, id: number) {
  const g = new T.Group(),
    colors = ["#ff593e", "#ffd22e", "#24a8e0", "#76c54b", "#fff8df"],
    color = colors[id % colors.length];
  if (truck) {
    box(g, 0, 0.95, 0, 2.05, 1.2, 4.7, C.cream);
    box(g, 0, 1.12, 2.7, 2, 1.6, 1.8, color);
    box(g, 0, 1.43, 3.62, 1.7, 0.6, 0.05, "#334e5d");
    box(g, 0, 0.34, 0.5, 1.6, 0.35, 6.5, C.ink);
    box(g, 0, 1.1, -2.38, 1.8, 0.75, 0.04, C.blue);
  } else {
    box(g, 0, 0.55, 0, 1.5, 0.6, 2.7, color);
    box(g, 0, 1, 0.0, 1.3, 0.55, 1.4, color);
    box(g, 0, 1.06, 0.72, 1.2, 0.4, 0.04, "#bddcea");
    box(g, 0, 1.06, -0.72, 1.2, 0.4, 0.04, "#bddcea");
  }
  for (const side of [-1, 1]) {
    box(
      g,
      side * (truck ? 1.01 : 0.66),
      truck ? 1.5 : 1.07,
      truck ? 2.8 : 0,
      0.035,
      truck ? 0.58 : 0.36,
      truck ? 1.2 : 1.16,
      "#294b60",
    );
    box(
      g,
      side * (truck ? 1.13 : 0.84),
      truck ? 1.2 : 0.91,
      truck ? 3.3 : 0.65,
      0.22,
      0.15,
      0.2,
      color,
    );
    box(
      g,
      side * (truck ? 1.03 : 0.76),
      0.52,
      0,
      0.04,
      0.12,
      truck ? 4.5 : 2.25,
      "#e9eff2",
    );
    box(
      g,
      side * (truck ? 0.8 : 0.55),
      0.65,
      truck ? -2.43 : -1.39,
      0.28,
      0.18,
      0.045,
      "#d83f35",
    );
  }
  box(
    g,
    0,
    truck ? 0.55 : 0.38,
    truck ? 3.65 : 1.38,
    truck ? 2.1 : 1.5,
    0.17,
    0.12,
    "#c8d7dc",
  );
  box(
    g,
    0,
    truck ? 0.88 : 0.56,
    truck ? 3.67 : 1.39,
    truck ? 0.9 : 0.46,
    0.18,
    0.045,
    "#263b47",
  );
  box(
    g,
    0,
    0.39,
    truck ? -2.42 : -1.38,
    truck ? 2.1 : 1.5,
    0.13,
    0.1,
    "#c8d7dc",
  );
  if (truck) {
    for (let z = -1.9; z < 2; z += 0.55)
      for (const side of [-1, 1])
        box(g, side * 1.035, 1.05, z, 0.035, 0.85, 0.045, "#c7d7de");
  } else {
    box(g, 0, 1.295, 0, 1.12, 0.06, 1.1, color);
    box(g, 0, 0.87, 1.05, 1.34, 0.08, 0.55, color);
  }
  const length = truck ? 3 : 1;
  for (const x of [-0.8, 0.8])
    for (const z of [-length, length]) {
      const axle = truck ? x * 1.3 : x;
      const wheel = cylinder(g, axle, 0.35, z, 0.35, 0.24, "#26343e");
      wheel.rotation.z = Math.PI / 2;
      const hub = cylinder(
        g,
        axle + Math.sign(x) * 0.13,
        0.35,
        z,
        0.18,
        0.03,
        "#b8c8d3",
      );
      hub.rotation.z = Math.PI / 2;
    }
  for (const x of [-0.53, 0.53])
    box(g, x, 0.66, truck ? 3.64 : 1.37, 0.32, 0.16, 0.04, "#fff9c9");
  bakeScenery(g);
  const fueling = new T.Mesh(
    new T.RingGeometry(0.55, 0.7, 24),
    new T.MeshBasicMaterial({
      color: C.orange,
      transparent: true,
      opacity: 0.75,
      side: T.DoubleSide,
    }),
  );
  fueling.rotation.x = -Math.PI / 2;
  fueling.position.y = 0.09;
  fueling.visible = false;
  fueling.name = "fueling";
  g.add(fueling);
  return g;
}
function pumpModel(index: number) {
  const g = new T.Group();
  box(g, 0, 0.12, 0, 2.4, 0.24, 1.1, "#f4e7c7");
  box(g, 0, 0.9, 0, 0.8, 1.5, 0.6, index < 4 ? C.orange : C.blue);
  box(g, 0, 1.8, 0, 1.25, 0.85, 0.7, C.cream);
  box(g, 0, 1.88, 0.37, 0.8, 0.33, 0.04, C.ink);
  box(g, 0, 1.56, 0.37, 0.45, 0.08, 0.04, "#a7d5ba");
  const hose = new T.Mesh(
    new T.TorusGeometry(0.42, 0.045, 6, 14, Math.PI * 1.8),
    material(C.ink),
  );
  hose.position.set(0.7, 1, 0.05);
  g.add(hose);
  box(g, 0.9, 1.5, 0.03, 0.13, 0.45, 0.12, "#2b4147");
  bakeScenery(g);
  return g;
}
const serviceColors = [
  "#198b78",
  "#98592d",
  "#d94d39",
  "#2677ae",
  "#2677ae",
  "#7757b5",
  "#7757b5",
];
function serviceModel(i: number) {
  const g = new T.Group(),
    accent = serviceColors[i];
  const width = i === 0 ? 4 : i < 3 ? 3.5 : 2.6;
  box(g, 0, 0.14, 0, width, 0.28, 3.5, "#d7e0dc");
  box(g, 0, 0.3, 0, width - 0.2, 0.035, 3.2, "#f0f3ed");
  if (i < 3) {
    // Open-front cutaways keep inventory visible from the playing camera.
    // The interaction point is behind this wall: a low center preserves the sightline.
    box(g, 0, 0.63, -1.4, width - 0.2, 0.65, 0.18, accent);
    for (const side of [-1, 1])
      box(g, side * (width / 2 - 0.48), 1.7, -1.4, 0.76, 2.8, 0.18, accent);
    box(g, -width / 2 + 0.15, 0.9, 0, 0.18, 1.2, 2.8, accent);
    box(g, 0, 0.88, 0.95, width - 0.35, 1.1, 0.7, accent);
    box(g, 0, 1.48, 0.95, width - 0.15, 0.13, 0.85, "#f7fafc");
    for (let x = -width / 2 + 0.3; x < width / 2; x += 0.35)
      box(g, x, 0.87, 1.31, 0.045, 0.9, 0.025, "#ffffff");
    box(g, 0, 3.12, -1.35, width, 0.16, 0.45, "#f7fafc");
    box(g, width / 2 - 0.5, 1.68, 1, 0.4, 0.3, 0.3, "#314d59");
    if (i === 0) {
      for (let row = 0; row < 3; row++) {
        box(g, -1.25, 0.95 + row * 0.67, -1.02, 0.85, 0.1, 0.6, "#f7fafc");
        for (let j = 0; j < 3; j++) {
          const x = -1.52 + j * 0.26,
            y = 1.18 + row * 0.67;
          cylinder(
            g,
            x,
            y,
            -0.98,
            0.11,
            0.34,
            ["#eab754", "#82c6d8", "#ed7353"][row],
          );
          cylinder(g, x, y + 0.19, -0.98, 0.065, 0.05, "#f7fafc");
        }
      }
      box(g, 1.3, 1.55, -0.95, 0.65, 2.2, 0.65, "#e3eff0");
      box(g, 1.3, 1.6, -0.61, 0.5, 1.85, 0.025, "#6193a4");
      for (let y = 0.95; y < 2.4; y += 0.5)
        box(g, 1.3, y, -0.58, 0.47, 0.045, 0.03, "#e3eff0");
    } else if (i === 1) {
      box(g, -0.4, 1.85, 0.05, 1.45, 1, 0.7, "#bccbd0");
      box(g, -0.4, 1.83, 0.42, 1.18, 0.6, 0.04, "#294652");
      for (const x of [-0.75, -0.15]) {
        cylinder(g, x, 1.6, 0.6, 0.12, 0.24, "#ffffff");
        box(g, x, 1.95, 0.57, 0.08, 0.12, 0.24, "#d1dade");
        ball(g, x, 2.08, 0.46, 0.06, "#f3b34d");
      }
      cylinder(g, 0.8, 1.83, 0.1, 0.22, 0.6, "#384f59");
      cylinder(g, 0.8, 2.23, 0.1, 0.21, 0.25, "#a88162");
      for (let j = 0; j < 3; j++)
        cylinder(g, -1.25, 1.61 + j * 0.1, 1, 0.13, 0.12, "#fff3dd");
    } else {
      box(g, -0.25, 1.64, 0.7, 1.8, 0.2, 0.9, "#334954");
      for (let j = 0; j < 5; j++) {
        const x = -0.9 + j * 0.32;
        const bun = cylinder(g, x, 1.82, 0.7, 0.12, 0.65, "#eab66b");
        bun.rotation.x = Math.PI / 2;
        const sausage = cylinder(g, x, 1.89, 0.7, 0.055, 0.68, "#b64f2f");
        sausage.rotation.x = Math.PI / 2;
        box(g, x, 1.95, 0.7, 0.035, 0.02, 0.5, "#f5cd46");
      }
      for (const [x, color] of [
        [1, "#e54535"],
        [1.3, "#edc547"],
      ] as const) {
        cylinder(g, x, 1.74, 0.45, 0.1, 0.4, color);
        cylinder(g, x, 1.98, 0.45, 0.04, 0.13, color);
      }
    }
  } else {
    box(g, 0, 0.63, -1.35, 2.4, 0.65, 0.16, accent);
    for (const side of [-1, 1])
      box(g, side * 0.98, 1.55, -1.35, 0.44, 2.5, 0.16, accent);
    for (const x of [-1.12, 1.12])
      box(g, x, 1.25, 0, 0.16, 1.9, 2.6, "#e4edf1");
    box(g, 0, 0.73, 1.3, 2.4, 0.85, 0.16, accent);
    for (let z = -0.9; z < 1.2; z += 0.5)
      box(g, 0, 0.33, z, 2.1, 0.015, 0.025, "#b5d3dc");
    if (i < 5) {
      box(g, -0.4, 0.88, -0.8, 0.65, 0.9, 0.36, "#ffffff");
      cylinder(g, -0.4, 0.64, -0.3, 0.38, 0.25, "#ffffff");
      cylinder(g, -0.4, 0.78, -0.3, 0.22, 0.035, "#90bfd0");
      box(g, 0.7, 1.04, -0.65, 0.52, 0.14, 0.65, "#ffffff");
      cylinder(g, 0.7, 1.24, -0.82, 0.035, 0.28, "#526d7b");
      box(g, 0.65, 1.86, -1.24, 0.6, 0.65, 0.025, "#97c8dd");
    } else {
      box(g, -0.25, 0.38, -0.35, 1.35, 0.12, 1.5, "#ffffff");
      cylinder(g, -0.25, 0.45, -0.35, 0.12, 0.025, "#68818e");
      cylinder(g, -0.55, 1.55, -1.14, 0.035, 2.05, "#c5d5df");
      box(g, -0.55, 2.55, -0.86, 0.065, 0.065, 0.6, "#c5d5df");
      cylinder(g, -0.55, 2.5, -0.55, 0.2, 0.055, "#f7fafc");
      box(g, 0.8, 1.5, -0.7, 0.36, 0.7, 0.1, "#f6e6ba");
      box(g, 0.8, 1.86, -0.7, 0.48, 0.05, 0.1, "#788c99");
    }
    box(g, 0, 2.88, -1.32, 2.6, 0.17, 0.45, "#f7fafc");
  }
  bakeScenery(g);
  const emblem = sign(
    ["SHOP", "COFFEE", "HOT DOG", "WC", "WC", "SHOWER", "SHOWER"][i],
    "#ffffff",
    accent,
    i < 3 ? 2.8 : 1.8,
    0.58,
  );
  emblem.position.set(0, i < 3 ? 3.45 : 3.15, -1.35);
  g.add(emblem);
  box(g, 0, 0.31, -1.8, width - 0.2, 0.025, 0.32, accent);
  return g;
}
export function createScene(
  canvas: HTMLCanvasElement,
  labels: HTMLElement,
  onTarget: (p: Vec) => void,
) {
  const renderer = new T.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: false,
  });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.7));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = T.PCFSoftShadowMap;
  renderer.setClearColor("#ead4a1");
  const scene = new T.Scene();
  scene.fog = new T.Fog("#ead4a1", 70, 150);
  scene.add(new T.HemisphereLight("#f4f9ff", "#728b78", 2.0));
  const sun = new T.DirectionalLight("#fff8ef", 2.2);
  sun.position.set(-10, 28, 15);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.radius = 4;
  sun.shadow.camera.left = -30;
  sun.shadow.camera.right = 30;
  sun.shadow.camera.top = 25;
  sun.shadow.camera.bottom = -25;
  sun.shadow.normalBias = 0.035;
  scene.add(sun);
  const camera = new T.OrthographicCamera(-25, 25, 20, -20, 0.1, 200);
  const scenery = new T.Group();
  scene.add(scenery);
  box(scenery, 0, -0.45, 2, 49, 0.8, 39, "#e6cb92");
  box(scenery, 0, -0.01, -9, 48, 0.1, 7, C.ink);
  box(scenery, 21, -0.01, 1, 4, 0.1, 37, C.ink);
  box(scenery, 0, -0.01, 15, 44, 0.1, 9, "#536370");
  box(scenery, 0, 0.02, 3, 39, 0.15, 13, "#d8b983");
  box(scenery, 0, 0.07, 7.5, 38, 0.08, 5.5, "#f4deac");
  for (let x = -18; x <= 18; x += 2)
    box(scenery, x, 0.12, 7.5, 0.025, 0.02, 5.5, "#dec590");
  for (const z of [5.8, 7.8, 9.8])
    box(scenery, 0, 0.12, z, 38, 0.02, 0.025, "#dec590");
  // A continuous pedestrian forecourt separates services from vehicle lanes.
  box(scenery, 0, 0.11, 4.8, 38, 0.06, 1.1, "#fff0cb");
  for (let x = -18; x <= 18; x += 1.2)
    box(scenery, x, 0.15, 4.22, 0.65, 0.025, 0.12, "#e7ae36");
  for (const x of [-10, -4, 2, 8, 14, 19]) {
    box(scenery, x, 0.07, -7, 0.1, 0.02, 5, "#e7edf2");
    const arrowSprite = sign("↑", "#536370", "#ffffff", 1, 1.6);
    const direction = new T.Mesh(
      new T.PlaneGeometry(1, 1.6),
      new T.MeshBasicMaterial({
        map: arrowSprite.material.map,
        transparent: true,
      }),
    );
    arrowSprite.material.dispose();
    direction.rotation.x = -Math.PI / 2;
    direction.position.set(x, 0.09, -10);
    scenery.add(direction);
  }
  for (let x = -20; x < 21; x += 4)
    box(scenery, x, 0.07, -12, 1.8, 0.025, 0.12, "#f6e8c9");
  for (let z = -4.2; z < 4; z += 0.8)
    box(scenery, -17.6, 0.13, z, 2.2, 0.02, 0.4, "#f7fafc");
  for (const x of [-14, -7, 1, 10, 18]) {
    cylinder(scenery, x, 0.5, 4.15, 0.09, 0.75, "#d9ad3d");
    cylinder(scenery, x, 0.7, 4.15, 0.095, 0.12, "#f7fafc");
  }
  for (const x of [-19, 19])
    for (let z = -6; z < 11; z += 5) {
      cylinder(scenery, x, 2, z, 0.08, 4, C.ink);
      ball(scenery, x, 4, z, 0.2, "#fff2b8");
    }
  for (let x = -20; x < 20; x += 4) {
    box(scenery, x, 0, 20, 1.5, 0.5, 0.7, "#8aab86");
    ball(scenery, x, 0.6, 20, 0.9, "#78a079", 1, 0.7, 0.65);
  }
  for (const [x, z] of [
    [-22, -13],
    [-22, 3],
    [-21, 13],
    [23, 15],
  ]) {
    cylinder(scenery, x, 1.3, z, 0.2, 2.6, "#a8865e");
    ball(scenery, x, 3, z, 1.5, "#739e75", 0.8, 1.4, 0.8);
  }
  box(scenery, -16, 0.6, 8, 2.7, 1.2, 2.5, C.blue);
  for (let i = 0; i < 5; i++)
    box(scenery, -17 + i * 0.5, 1.4, 8, 0.43, 0.55, 0.5, "#caa56b");
  const signPole = cylinder(scenery, -19, 3, -5, 0.13, 6, C.ink);
  const logo = sign("NEXT STOP", C.orange, C.cream, 5, 1);
  logo.position.set(-19, 6, -5);
  scenery.add(logo);
  bakeScenery(scenery);
  const canopy = new T.Group();
  for (const x of [-13, 11])
    for (const z of [-9, -5]) box(canopy, x, 2.3, z, 0.16, 4.6, 0.16, C.ink);
  box(canopy, -1, 4.7, -9, 26, 0.3, 0.4, C.cream);
  box(canopy, -1, 4.68, -4.18, 26, 0.55, 0.15, C.orange);
  canopy.visible = false;
  scene.add(canopy);
  const pumpObjects = pumps.map((p, i) => {
    const g = pumpModel(i);
    g.scale.y = 1.15;
    g.position.set(p.x - (i < 4 ? 2 : 2.4), 0, p.z);
    scene.add(g);
    return g;
  });
  const serviceObjects = facilities.map((d, i) => {
    const g = serviceModel(i);
    g.position.set(d.x, 0, d.z);
    scene.add(g);
    return g;
  });
  const parkingObjects = parking.map((p, i) => {
    const g = new T.Group(),
      w = i >= 6 ? 3.3 : 2.8,
      l = i >= 6 ? 5 : 3.5;
    for (const x of [-w / 2, w / 2])
      box(g, x, 0.11, 0, 0.08, 0.02, l, "#fff3d6");
    box(g, 0, 0.11, l / 2, w, 0.02, 0.08, "#fff3d6");
    g.position.set(p.x, 0, p.z);
    scene.add(g);
    return g;
  });
  const avatar = person(C.orange);
  avatar.g.scale.setScalar(1.18);
  box(avatar.g, 0, 0.75, 0.245, 0.3, 0.4, 0.03, "#fff6d9");
  box(avatar.g, 0, 1.46, 0.19, 0.43, 0.07, 0.23, C.orange);
  scene.add(avatar.g);
  const playerHalo = new T.Mesh(
    new T.RingGeometry(0.48, 0.65, 32),
    new T.MeshBasicMaterial({ color: "#ffffff", side: T.DoubleSide }),
  );
  playerHalo.rotation.x = -Math.PI / 2;
  scene.add(playerHalo);
  const workerModels = new Map<number, ReturnType<typeof person>>(),
    visitors = new Map<number, ReturnType<typeof person>>(),
    cars = new Map<number, T.Group>();
  const delivery = vehicle(true, 2);
  delivery.visible = false;
  scene.add(delivery);
  const targetRing = new T.Mesh(
    new T.RingGeometry(0.6, 0.78, 32),
    new T.MeshBasicMaterial({ color: "#e97936", side: T.DoubleSide }),
  );
  targetRing.rotation.x = -Math.PI / 2;
  targetRing.position.y = 0.18;
  scene.add(targetRing);
  const arrow = new T.Mesh(
    new T.ConeGeometry(0.25, 0.5, 3),
    material("#f2b94e"),
  );
  scene.add(arrow);
  const buttons: {
    el: HTMLButtonElement;
    point: Vec;
    id: number;
    kind: string;
  }[] = [];
  for (let i = 0; i < 6; i++) {
    const el = document.createElement("button");
    el.className = "world-label pump-label";
    el.dataset.station = "pump" + i;
    el.onclick = () => onTarget(servicePoint(i));
    labels.append(el);
    buttons.push({
      el,
      point: { x: pumps[i].x, z: pumps[i].z },
      id: i,
      kind: "pump",
    });
  }
  for (let i = 0; i < facilities.length; i++) {
    const el = document.createElement("button");
    el.className = "world-label";
    el.dataset.station = "service" + i;
    el.onclick = () => onTarget({ x: facilities[i].x, z: 5 });
    labels.append(el);
    buttons.push({ el, point: facilities[i], id: i, kind: "service" });
  }
  const crate = document.createElement("button");
  crate.className = "world-label supply-label";
  crate.dataset.station = "supply";
  crate.onclick = () => onTarget(supply);
  labels.append(crate);
  buttons.push({ el: crate, point: supply, id: 0, kind: "supply" });
  const connectors = buttons.map((b) => {
    const line = document.createElement("span");
    line.className = "label-connector";
    const color =
      b.kind === "service"
        ? serviceColors[b.id]
        : b.kind === "pump"
          ? b.id < 4
            ? "#c44d17"
            : "#2677ae"
          : "#526776";
    b.el.style.setProperty("--station-color", color);
    line.style.background = color;
    labels.prepend(line);
    return line;
  });
  let previous: State | null = null,
    overview = false,
    lastSkin = -1;
  const focus = new T.Vector3(0, 0, 1),
    project = new T.Vector3();
  let width = 0,
    height = 0;
  function remove(g: T.Object3D) {
    g.removeFromParent();
    g.traverse((o) => {
      if (o instanceof T.Mesh) {
        o.geometry.dispose();
        if (o.name === "fueling" && !Array.isArray(o.material))
          o.material.dispose();
      }
    });
  }
  function clear() {
    for (const g of cars.values()) remove(g);
    for (const p of visitors.values()) remove(p.g);
    for (const p of workerModels.values()) remove(p.g);
    cars.clear();
    visitors.clear();
    workerModels.clear();
  }
  let numberLocale: Locale = "en";
  let number = new Intl.NumberFormat(numberLocale, {
    maximumFractionDigits: 1,
  });
  function render(s: State, locale: Locale, low = false) {
    if (locale !== numberLocale) {
      numberLocale = locale;
      number = new Intl.NumberFormat(locale, { maximumFractionDigits: 1 });
    }
    if (previous !== s) {
      clear();
      previous = s;
    }
    const w = canvas.clientWidth,
      h = canvas.clientHeight;
    if (width !== w || height !== h) {
      width = w;
      height = h;
      renderer.setSize(w, h, false);
    }
    const mobile = w < 650,
      aspect = w / Math.max(h, 1),
      range = overview ? Math.max(23, 28 / aspect) : mobile ? 11.5 : 14;
    camera.left = -range * aspect;
    camera.right = range * aspect;
    camera.top = range;
    camera.bottom = -range;
    camera.updateProjectionMatrix();
    const wanted = !overview
      ? new T.Vector3(s.player.x, 0, s.player.z)
      : new T.Vector3(0, 0, 1);
    focus.lerp(wanted, 0.09);
    camera.position.set(focus.x + 24, 34, focus.z + 30);
    camera.lookAt(focus);
    renderer.shadowMap.enabled = !low;
    canopy.visible = hasExpansion(s, 12);
    pumpObjects.forEach(
      (o, i) => (o.visible = i < 4 ? i < pumpCount(s) : hasExpansion(s, 8)),
    );
    serviceObjects.forEach((o, i) => {
      o.visible = hasExpansion(s, facilities[i].level);
      if (i >= 3 && o.userData.quality !== s.facilities[i].quality) {
        const old = o.getObjectByName("quality");
        if (old) remove(old);
        const decor = new T.Group();
        decor.name = "quality";
        const q = s.facilities[i].quality;
        for (let j = 1; j < q; j++) {
          ball(decor, -1.05 + (j - 1) * 2.1, 3.1, -1.3, 0.16, "#f0cc74");
          box(
            decor,
            0,
            2.8 + (j - 1) * 0.1,
            -1.3,
            2.8,
            0.06,
            0.4,
            q === 3 ? "#e8bf62" : "#d5ded2",
          );
        }
        o.add(decor);
        o.userData.quality = q;
      }
    });
    parkingObjects.forEach(
      (o, i) =>
        (o.visible =
          i < 6
            ? i < parkCount(s)
            : hasExpansion(s, 8) && i < 6 + (hasExpansion(s, 10) ? 4 : 2)),
    );
    if (lastSkin !== s.skin) {
      lastSkin = s.skin;
      const m = material([C.orange, C.blue, C.green][s.skin]);
      (avatar.g.children[0] as T.Mesh).material = m;
    }
    animate(avatar, s.player, s.time, s.player.count);
    playerHalo.position.set(s.player.x, 0.2, s.player.z);
    for (const w of s.workers) {
      let p = workerModels.get(w.role);
      if (!p) {
        p = person(
          [C.blue, C.orange, C.green, C.cream, "#b99c69", C.ink][w.role],
        );
        workerModels.set(w.role, p);
        scene.add(p.g);
      }
      animate(p, w, s.time, w.carrying);
    }
    for (const v of s.vehicles) {
      let g = cars.get(v.id);
      if (!g) {
        g = vehicle(v.truck, v.id);
        cars.set(v.id, g);
        scene.add(g);
        g.userData.last = { x: v.x, z: v.z };
      }
      const old = g.userData.last as Vec;
      if (v.heading !== undefined) g.rotation.y = v.heading;
      else if (Math.hypot(v.x - old.x, v.z - old.z) > 0.002)
        g.rotation.y = Math.atan2(v.x - old.x, v.z - old.z);
      g.position.set(v.x, 0.02, v.z);
      const fueling = g.getObjectByName("fueling")!;
      fueling.visible = v.state === "fuel" && v.timer > 0;
      fueling.scale.setScalar(1 + Math.sin(s.time * 5) * 0.15);
      g.userData.last = { x: v.x, z: v.z };
      if (v.visitor) {
        let p = visitors.get(v.id);
        if (!p) {
          p = person(["#d99877", "#b9a478", "#8fadb0"][v.id % 3]);
          visitors.set(v.id, p);
          scene.add(p.g);
        }
        animate(p, v.visitor, s.time);
      } else if (visitors.has(v.id)) {
        remove(visitors.get(v.id)!.g);
        visitors.delete(v.id);
      }
    }
    for (const [id, g] of cars)
      if (!s.vehicles.some((v) => v.id === id)) {
        remove(g);
        cars.delete(id);
        if (visitors.has(id)) {
          remove(visitors.get(id)!.g);
          visitors.delete(id);
        }
      }
    delivery.visible = s.delivery > 0;
    if (s.delivery > 0) {
      delivery.position.set(
        -22 + Math.sin(((24 - s.delivery) / 24) * Math.PI) * 5,
        0,
        10,
      );
      delivery.rotation.y = Math.PI / 2;
    }
    const goal = objective(s);
    targetRing.visible = !!s.target;
    targetRing.position.set(s.target?.x ?? 0, 0.18, s.target?.z ?? 0);
    arrow.position.set(
      goal.point.x,
      2.4 + Math.sin(s.time * 3) * 0.15,
      goal.point.z,
    );
    arrow.rotation.z = Math.PI;
    arrow.visible = !low;
    const occupied: { x: number; y: number; width: number; height: number }[] =
      [];
    const playerScreen = new T.Vector3(s.player.x, 1, s.player.z).project(
      camera,
    );
    occupied.push({
      x: ((playerScreen.x + 1) * w) / 2,
      y: ((1 - playerScreen.y) * h) / 2,
      width: 32,
      height: Math.max(44, h / range),
    });
    for (const hud of canvas
      .closest(".shell")
      ?.querySelectorAll(
        ".live-strip, .mission, .world-tools, header > *, #nav, #panel:not([hidden])",
      ) ?? []) {
      const box = hud.getBoundingClientRect(),
        world = canvas.getBoundingClientRect();
      if (!box.width || !box.height) continue;
      occupied.push({
        x: box.x - world.x + box.width / 2,
        y: box.y - world.y + box.height / 2,
        width: box.width + 8,
        height: box.height + 8,
      });
    }
    for (const [buttonIndex, b] of buttons.entries()) {
      const connector = connectors[buttonIndex];
      connector.hidden = true;
      let visible = true,
        label = "",
        markup = "";
      if (b.kind === "pump") {
        visible = b.id < 4 ? b.id < pumpCount(s) : hasExpansion(s, 8);
        const v = s.vehicles.find((v) => v.pump === b.id);
        const type = b.id < 4 ? 0 : 1,
          max = tankCapacity(s, type),
          current = s.fuel[type];
        const name =
          text(type ? "Diesel" : "Fuel", locale) +
          " " +
          number.format(type ? b.id - 3 : b.id + 1);
        const fuelValue = number.format(current) + " / " + number.format(max);
        const percent =
          v?.state === "fuel"
            ? Math.round((1 - v.remaining / (v.truck ? 16 : 4)) * 100)
            : null;
        label =
          name +
          " · " +
          text("Shared tank", locale) +
          " " +
          fuelValue +
          (percent !== null
            ? " · " + text("Refueling", locale) + " " + percent + "%"
            : "");
        markup = `<span class="pump-title"><span>${name}</span>${percent !== null ? `<em title="${text("Refueling", locale)}">${percent}%</em>` : ""}</span><span class="pump-capacity"><small>${text("Tank", locale)}</small><b>${fuelValue}</b></span><i class="pump-meter" aria-hidden="true"><i style="width:${Math.min(100, (current / max) * 100)}%"></i></i>`;
        b.el.classList.toggle("warning", current < max * 0.25);
      } else if (b.kind === "service") {
        const d = facilities[b.id],
          f = s.facilities[b.id];
        visible = hasExpansion(s, d.level);
        label =
          text(d.key, locale) +
          " " +
          (b.id >= 3
            ? Math.round(f.clean) + "%" + (f.blocked ? " ↺" : "")
            : f.stock + "");
        b.el.classList.toggle("warning", b.id >= 3 ? f.blocked : f.stock === 0);
      } else label = text("Supplies", locale) + " " + s.goods;
      project.set(b.point.x, 2.9, b.point.z).project(camera);
      const x = ((project.x + 1) / 2) * w,
        y = ((-project.y + 1) / 2) * h;
      // Offscreen services are reachable through the overview and services panel.
      // Do not pull their labels across unrelated visible buildings.
      if (!overview) {
        const ground = new T.Vector3(b.point.x, 0.3, b.point.z).project(camera);
        const gx = ((ground.x + 1) * w) / 2,
          gy = ((1 - ground.y) * h) / 2;
        visible =
          visible && gx >= 12 && gx <= w - 12 && gy >= 100 && gy <= h - 65;
      }
      b.el.hidden = !visible;
      if (!visible) continue;
      if (markup) {
        if (b.el.innerHTML !== markup) b.el.innerHTML = markup;
      } else b.el.textContent = label;
      b.el.setAttribute("aria-label", label);
      const bw = Math.min(144, b.el.offsetWidth + 14),
        bh = b.el.offsetHeight,
        baseX = Math.max(bw / 2 + 8, Math.min(w - bw / 2 - 8, x)),
        baseY = Math.max(110, Math.min(h - 75, y));
      let best = { x: baseX, y: baseY },
        score = Infinity;
      // Projected targets remain independently tappable even in dense portrait views.
      for (const dx of [0, -150, 150, -75, 75])
        for (let row = -10; row <= 10; row++) {
          const cx = Math.max(bw / 2 + 8, Math.min(w - bw / 2 - 8, baseX + dx)),
            cy = baseY + row * (bh + 8);
          if (
            cy < 105 ||
            cy > h - 65 ||
            occupied.some(
              (r) =>
                Math.abs(r.x - cx) < (r.width + bw) / 2 + 4 &&
                Math.abs(r.y - cy) < (r.height + bh) / 2 + 4,
            )
          )
            continue;
          const distance = Math.abs(cx - baseX) + Math.abs(cy - baseY);
          if (distance < score) {
            score = distance;
            best = { x: cx, y: cy };
          }
        }
      if (!Number.isFinite(score)) {
        b.el.hidden = true;
        continue;
      }
      occupied.push({ ...best, width: bw, height: bh });
      b.el.style.left = best.x + "px";
      b.el.style.top = best.y + "px";
      const anchor = project.set(b.point.x, 0.3, b.point.z).project(camera);
      const ax = ((anchor.x + 1) / 2) * w,
        ay = ((1 - anchor.y) / 2) * h;
      const distance = Math.hypot(ax - best.x, ay - best.y);
      connector.hidden = ax < 0 || ax > w || ay < 0 || ay > h;
      connector.style.left = best.x + "px";
      connector.style.top = best.y + "px";
      connector.style.width = distance + "px";
      connector.style.transform = `rotate(${Math.atan2(ay - best.y, ax - best.x)}rad)`;
      b.el.title = label;
      b.el.dir = locale === "ar" ? "rtl" : "ltr";
    }
    renderer.render(scene, camera);
  }
  return {
    render,
    toggleOverview() {
      overview = !overview;
    },
    dispose() {
      clear();
      renderer.dispose();
    },
    setOverview(value: boolean) {
      overview = value;
    },
  };
}
