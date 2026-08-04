"use client";

import { useEffect, useRef, useState } from "react";
import {
  DEFAULT_BUILDING_MAP,
  type BuildingMap,
  type Studio,
} from "@/lib/types";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import {
  CSS2DRenderer,
  CSS2DObject,
} from "three/examples/jsm/renderers/CSS2DRenderer.js";

// Poster-style icon markers (SVGs mimic the reference site-map pictograms).
const GLASS_SVG =
  '<svg viewBox="0 0 24 24" width="16" height="16" fill="#111">' +
  '<path d="M6 2h12v5a6 6 0 0 1-5 5.9V19h4v2H7v-2h4v-6.1A6 6 0 0 1 6 7z"/></svg>';
const WC_SVG =
  '<svg viewBox="0 0 46 24" width="30" height="16" fill="#111">' +
  '<circle cx="11" cy="4" r="3.2"/><path d="M7 9h8v9h-2.4v6h-3.2v-6H7z"/>' +
  '<circle cx="33" cy="4" r="3.2"/><path d="M33 8.5 39.5 19h-4.2v5h-4.6v-5h-4.2z"/></svg>';

// Patio footprints — wall meshes whose centers fall here become glass.
const PATIOS: { x0: number; x1: number; y0: number; y1: number }[] = [
  { x0: 4250, x1: 4800, y0: -420, y1: 400 },
  { x0: 5280, x1: 5780, y0: -420, y1: 400 },
];

function inPatio(x: number, y: number) {
  return PATIOS.some((p) => x >= p.x0 && x <= p.x1 && y >= p.y0 && y <= p.y1);
}

function iconLabelElement(svg: string): HTMLDivElement {
  const el = document.createElement("div");
  el.style.cssText =
    "left:0;top:0;background:#fff;border:2px solid #111;border-radius:6px;" +
    "padding:3px 6px;line-height:0;";
  el.innerHTML = svg;
  return el;
}

/** Scribbly poster-style tree: dark trunk + yellow blobs (built Y-up). */
function makeTree(): THREE.Group {
  const tree = new THREE.Group();
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(10, 14, 220, 6),
    new THREE.MeshStandardMaterial({ color: 0x555045, roughness: 1 }),
  );
  trunk.position.y = 110;
  tree.add(trunk);
  const leaf = new THREE.MeshStandardMaterial({
    color: 0xe3e030,
    roughness: 1,
    flatShading: true,
  });
  const blobs: [number, number, number, number][] = [
    [0, 320, 0, 110],
    [-90, 270, 30, 75],
    [80, 260, -40, 70],
  ];
  for (const [x, y, z, r] of blobs) {
    const m = new THREE.Mesh(new THREE.IcosahedronGeometry(r, 1), leaf);
    m.position.set(x, y, z);
    tree.add(m);
  }
  return tree;
}

/** L-shaped lobby bar/counter (built Y-up, like the trees). */
function makeBar(): THREE.Group {
  const bar = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({
    color: 0xf5f0e4,
    roughness: 0.85,
    metalness: 0,
  });
  const long = new THREE.Mesh(new THREE.BoxGeometry(220, 100, 45), mat);
  long.position.set(0, 50, 0);
  const ret = new THREE.Mesh(new THREE.BoxGeometry(45, 100, 120), mat);
  ret.position.set(87, 50, -40);
  bar.add(long, ret);
  return bar;
}

function roomLabelElement(
  num: string,
  studios: Studio[],
  chipBg: string,
  chipFg: string,
): HTMLDivElement {
  const el = document.createElement("div");
  el.className = "group hover:z-[10000]!";
  el.style.cssText = "left:0;top:0;pointer-events:auto;";

  const chip = document.createElement("div");
  chip.textContent = num;
  chip.dataset.chip = "1";
  chip.style.cssText =
    `font-weight:900;font-size:13px;color:${chipFg};background:${chipBg};` +
    "border:2px solid #111;padding:0 5px;line-height:1.5;text-align:center;";
  el.appendChild(chip);

  if (studios.length === 0) return el;

  const card = document.createElement("div");
  card.className =
    "hidden group-hover:block absolute top-full right-1/2 translate-x-1/2 " +
    "w-52 border-2 border-[var(--ink)] bg-white shadow-[3px_3px_0_var(--ink)] text-right";
  for (const st of studios) {
    const head = document.createElement("div");
    head.textContent = `${st.name} · ${st.date}`;
    head.className =
      "border-b-2 border-[var(--ink)] px-2 py-1 text-xs font-black";
    head.style.background = chipBg;
    head.style.color = chipFg;
    card.appendChild(head);
    for (const p of st.presenters) {
      const row = document.createElement("div");
      row.className =
        "flex justify-between gap-2 px-2 py-0.5 text-xs border-b border-black/10";
      const name = document.createElement("span");
      name.textContent = p.name;
      name.className = "font-bold";
      const time = document.createElement("span");
      time.textContent = p.time;
      time.dir = "ltr";
      row.append(name, time);
      card.appendChild(row);
    }
  }
  el.appendChild(card);
  return el;
}

type PinObj = THREE.Object3D & { userData: { pinId: string; kind: string } };

function applyMapPositions(pins: Record<string, PinObj>, map: BuildingMap) {
  for (const room of map.rooms) {
    const o = pins[`room-${room.num}`];
    if (o) o.position.set(room.x, room.y, 340);
  }
  if (pins.entrance) pins.entrance.position.set(map.entrance.x, map.entrance.y, 30);
  if (pins.bar) pins.bar.position.set(map.bar.x, map.bar.y, 0);
  if (pins["icon-bar"]) pins["icon-bar"].position.set(map.bar.x, map.bar.y, 380);
  if (pins.wc) pins.wc.position.set(map.wc.x, map.wc.y, 380);
  for (const t of map.trees) {
    const o = pins[t.id];
    if (o) o.position.set(t.x, t.y, 0);
  }
}

function applyChipColors(pins: Record<string, PinObj>, map: BuildingMap, selectedId?: string) {
  const styleChip = (el: HTMLElement | undefined, selected: boolean) => {
    if (!el) return;
    el.style.color = map.chip_fg;
    el.style.background = map.chip_bg;
    el.style.outline = selected ? "3px solid #111" : "";
    el.style.outlineOffset = selected ? "2px" : "";
  };
  for (const room of map.rooms) {
    const o = pins[`room-${room.num}`] as CSS2DObject | undefined;
    const chip = o?.element?.querySelector?.("[data-chip]") as HTMLElement | null;
    styleChip(chip ?? undefined, selectedId === `room-${room.num}`);
    const head = o?.element?.querySelector?.(".border-b-2") as HTMLElement | null;
    if (head) {
      head.style.background = map.chip_bg;
      head.style.color = map.chip_fg;
    }
  }
  const ent = pins.entrance as CSS2DObject | undefined;
  styleChip(ent?.element, selectedId === "entrance");
}

/** Interactive 3D model of the building (Draco GLB in /public). */
export default function BuildingModel({
  studios = [],
  map = DEFAULT_BUILDING_MAP,
  selectedId,
  onPlace,
}: {
  studios?: Studio[];
  map?: BuildingMap;
  selectedId?: string;
  onPlace?: (id: string, x: number, y: number) => void;
}) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const mapRef = useRef(map);
  const selectedRef = useRef(selectedId);
  const onPlaceRef = useRef(onPlace);
  const pinsRef = useRef<Record<string, PinObj>>({});
  const modelRef = useRef<THREE.Group | null>(null);

  mapRef.current = map;
  selectedRef.current = selectedId;
  onPlaceRef.current = onPlace;

  // Sync pin positions / chip colors when admin edits the map.
  useEffect(() => {
    applyMapPositions(pinsRef.current, map);
    applyChipColors(pinsRef.current, map, selectedId);
  }, [map, selectedId]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#f5f2ea");

    const camera = new THREE.PerspectiveCamera(
      45,
      mount.clientWidth / mount.clientHeight,
      0.1,
      100000,
    );

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    mount.appendChild(renderer.domElement);

    const labelRenderer = new CSS2DRenderer();
    labelRenderer.setSize(mount.clientWidth, mount.clientHeight);
    labelRenderer.domElement.style.position = "absolute";
    labelRenderer.domElement.style.inset = "0";
    labelRenderer.domElement.style.pointerEvents = "none";
    mount.appendChild(labelRenderer.domElement);

    scene.add(new THREE.HemisphereLight(0xffffff, 0x999988, 1.1));
    const sun = new THREE.DirectionalLight(0xffffff, 1.4);
    sun.position.set(1, 2, 1.5);
    scene.add(sun);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    const draco = new DRACOLoader();
    draco.setDecoderPath("https://www.gstatic.com/draco/versioned/decoders/1.5.7/");
    const loader = new GLTFLoader();
    loader.setDRACOLoader(draco);

    let disposed = false;
    const pins: Record<string, PinObj> = {};
    pinsRef.current = pins;

    loader.load(
      "/building.glb",
      (gltf) => {
        if (disposed) return;
        const cfg = mapRef.current;
        const model = gltf.scene;
        modelRef.current = model;

        const mat = new THREE.MeshStandardMaterial({
          color: 0xe8e2d4,
          roughness: 0.95,
          metalness: 0,
        });
        const glass = new THREE.MeshStandardMaterial({
          color: 0xb9d7e8,
          roughness: 0.15,
          metalness: 0.05,
          transparent: true,
          opacity: 0.28,
          depthWrite: false,
          side: THREE.DoubleSide,
        });
        model.traverse((obj) => {
          if (!(obj instanceof THREE.Mesh)) return;
          obj.material = /system.?panel/i.test(obj.name || "") ? glass : mat;
        });

        for (const room of cfg.rooms) {
          const inRoom = studios.filter(
            (s) => (s.location || "").match(/\d{3}/)?.[0] === room.num,
          );
          const label = new CSS2DObject(
            roomLabelElement(room.num, inRoom, cfg.chip_bg, cfg.chip_fg),
          ) as PinObj;
          label.userData = { pinId: `room-${room.num}`, kind: "room" };
          label.position.set(room.x, room.y, 340);
          model.add(label);
          pins[`room-${room.num}`] = label;
        }

        const barIcon = new CSS2DObject(iconLabelElement(GLASS_SVG)) as PinObj;
        barIcon.userData = { pinId: "bar", kind: "icon" };
        barIcon.position.set(cfg.bar.x, cfg.bar.y, 380);
        model.add(barIcon);
        pins["icon-bar"] = barIcon;

        const wcIcon = new CSS2DObject(iconLabelElement(WC_SVG)) as PinObj;
        wcIcon.userData = { pinId: "wc", kind: "icon" };
        wcIcon.position.set(cfg.wc.x, cfg.wc.y, 380);
        model.add(wcIcon);
        pins.wc = wcIcon;

        const entEl = document.createElement("div");
        entEl.textContent = "כניסה";
        entEl.dataset.chip = "1";
        entEl.style.cssText =
          `left:0;top:0;font-weight:900;font-style:italic;font-size:15px;` +
          `color:${cfg.chip_fg};background:${cfg.chip_bg};border:2px solid #111;padding:0 8px;`;
        const entrance = new CSS2DObject(entEl) as PinObj;
        entrance.userData = { pinId: "entrance", kind: "entrance" };
        entrance.position.set(cfg.entrance.x, cfg.entrance.y, 30);
        model.add(entrance);
        pins.entrance = entrance;

        for (const t of cfg.trees) {
          const tree = makeTree() as PinObj;
          tree.userData = { pinId: t.id, kind: "tree" };
          tree.rotation.x = Math.PI / 2;
          tree.position.set(t.x, t.y, 0);
          model.add(tree);
          pins[t.id] = tree;
        }
        {
          const bar = makeBar() as PinObj;
          bar.userData = { pinId: "bar", kind: "bar" };
          bar.rotation.x = Math.PI / 2;
          bar.position.set(cfg.bar.x, cfg.bar.y, 0);
          model.add(bar);
          pins.bar = bar;
        }

        model.rotation.x = -Math.PI / 2;
        model.updateMatrixWorld(true);

        model.traverse((obj) => {
          if (!(obj instanceof THREE.Mesh) || obj.material === glass) return;
          if (!obj.name) return;
          const box = new THREE.Box3().setFromObject(obj);
          const c = box.getCenter(new THREE.Vector3());
          if (inPatio(c.x, -c.z)) obj.material = glass;
        });

        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        model.position.sub(center);
        scene.add(model);

        const radius = size.length() / 2;
        camera.position.set(radius * 0.9, radius * 0.8, radius * 1.1);
        camera.near = radius / 100;
        camera.far = radius * 10;
        camera.updateProjectionMatrix();
        controls.maxDistance = radius * 4;
        controls.update();
        applyChipColors(pins, cfg, selectedRef.current);
        setLoading(false);
      },
      undefined,
      () => {
        setLoading(false);
        setError(true);
      },
    );

    // Click-to-place: ignore drags (orbit).
    let downX = 0;
    let downY = 0;
    const onPointerDown = (e: PointerEvent) => {
      downX = e.clientX;
      downY = e.clientY;
    };
    const onPointerUp = (e: PointerEvent) => {
      const place = onPlaceRef.current;
      const id = selectedRef.current;
      const model = modelRef.current;
      if (!place || !id || !model) return;
      if (Math.hypot(e.clientX - downX, e.clientY - downY) > 6) return;

      const rect = renderer.domElement.getBoundingClientRect();
      const ndc = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -(((e.clientY - rect.top) / rect.height) * 2 - 1),
      );
      const ray = new THREE.Raycaster();
      ray.setFromCamera(ndc, camera);
      // Floor plane: local z=0 → world y ≈ model.position.y after rot.
      const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -model.position.y);
      const hit = new THREE.Vector3();
      if (!ray.ray.intersectPlane(plane, hit)) return;
      // world → pre-rotation local (rot.x = -π/2): (x,y,z)_w ← (x,z,-y)_l + pos
      const lx = Math.round(hit.x - model.position.x);
      const ly = Math.round(-(hit.z - model.position.z));
      place(id, lx, ly);
    };
    renderer.domElement.addEventListener("pointerdown", onPointerDown);
    renderer.domElement.addEventListener("pointerup", onPointerUp);

    let raf = 0;
    const animate = () => {
      raf = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
      labelRenderer.render(scene, camera);
    };
    animate();

    const onResize = () => {
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
      labelRenderer.setSize(mount.clientWidth, mount.clientHeight);
    };
    const ro = new ResizeObserver(onResize);
    ro.observe(mount);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      renderer.domElement.removeEventListener("pointerdown", onPointerDown);
      renderer.domElement.removeEventListener("pointerup", onPointerUp);
      controls.dispose();
      draco.dispose();
      renderer.dispose();
      mount.removeChild(renderer.domElement);
      mount.removeChild(labelRenderer.domElement);
      pinsRef.current = {};
      modelRef.current = null;
    };
  }, [studios]);

  return (
    <div
      className={`relative w-full h-[60vh] border-2 border-[var(--ink)] bg-[#f5f2ea] ${
        onPlace ? "cursor-crosshair" : ""
      }`}
    >
      <div ref={mountRef} className="absolute inset-0" />
      {loading && (
        <p className="absolute inset-0 flex items-center justify-center text-sm opacity-60">
          טוען מודל… · Loading model…
        </p>
      )}
      {error && (
        <p className="absolute inset-0 flex items-center justify-center text-sm opacity-60">
          המודל לא נטען · Model failed to load
        </p>
      )}
      {onPlace && (
        <p className="absolute bottom-2 inset-x-0 text-center text-xs opacity-70 pointer-events-none">
          בחרו פין ולחצו על המודל להזזה · Select a pin, then click the model
        </p>
      )}
    </div>
  );
}
