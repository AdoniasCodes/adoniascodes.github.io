/*
 * Hero option A, "growth terrain": a field of 3D data bars that climbs
 * left to right like a compounding chart. A slow wave keeps it alive,
 * bars near the cursor lift and turn amber, and the field builds itself
 * up from zero on load. One InstancedMesh, so it is a single draw call.
 */
import {
  WebGLRenderer,
  Scene,
  PerspectiveCamera,
  BoxGeometry,
  MeshStandardMaterial,
  InstancedMesh,
  Object3D,
  Color,
  AmbientLight,
  DirectionalLight,
  HemisphereLight,
  PlaneGeometry,
  ShadowMaterial,
  Mesh,
  Raycaster,
  Plane,
  Vector2,
  Vector3,
  PCFShadowMap,
  SRGBColorSpace,
} from "three";

export async function mount(host) {
  const canvas = host.querySelector("canvas");
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const small = window.matchMedia("(max-width: 48rem)").matches;

  let renderer;
  try {
    renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "low-power" });
  } catch {
    return null;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.shadowMap.enabled = !small;
  renderer.shadowMap.type = PCFShadowMap;

  const scene = new Scene();
  const camera = new PerspectiveCamera(30, 1, 0.1, 200);

  /* Field */
  const COLS = small ? 14 : 28;
  const ROWS = small ? 9 : 15;
  const GAP = 1;
  const count = COLS * ROWS;
  const geo = new BoxGeometry(0.76, 1, 0.76);
  geo.translate(0, 0.5, 0); // grow from the floor up
  const mat = new MeshStandardMaterial({ roughness: 0.55, metalness: 0.05 });
  const bars = new InstancedMesh(geo, mat, count);
  bars.castShadow = true;
  bars.receiveShadow = true;
  scene.add(bars);

  const floor = new Mesh(new PlaneGeometry(200, 200), new ShadowMaterial({ opacity: 0.13 }));
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);

  scene.add(new HemisphereLight(0xffffff, 0xe8ddd8, 1.4));
  scene.add(new AmbientLight(0xffffff, 0.35));
  const sun = new DirectionalLight(0xffffff, 2.2);
  sun.position.set(-8, 16, 10);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  const sc = sun.shadow.camera;
  sc.left = -22;
  sc.right = 22;
  sc.top = 16;
  sc.bottom = -16;
  sc.far = 60;
  sun.shadow.bias = -0.0008;
  scene.add(sun);

  /* Per-bar constants */
  const cells = [];
  for (let j = 0; j < ROWS; j++) {
    for (let i = 0; i < COLS; i++) {
      const t = (i / (COLS - 1)) * 0.7 + (1 - j / (ROWS - 1)) * 0.3;
      cells.push({
        x: (i - (COLS - 1) / 2) * GAP,
        z: (j - (ROWS - 1) / 2) * GAP,
        i,
        j,
        trend: 0.15 + 7.4 * Math.pow(t, 2.6) * (0.78 + 0.22 * (1 - j / ROWS)),
        jitter: 0.8 + Math.random() * 0.4,
        lift: 0,
      });
    }
  }

  const low = new Color(0xe9e1dd);
  const mid = new Color(0xc9bcb6);
  const hot = new Color(0xec5022);
  const amber = new Color(0xfcba43);
  const tmpC = new Color();
  const dummy = new Object3D();

  /* Pointer on the floor plane */
  const ray = new Raycaster();
  const ndc = new Vector2(9, 9);
  const floorPlane = new Plane(new Vector3(0, 1, 0), 0);
  const hit = new Vector3(999, 0, 999);
  let pointerActive = false;
  const onMove = (e) => {
    const r = host.getBoundingClientRect();
    if (e.clientY < r.top || e.clientY > r.bottom) {
      pointerActive = false;
      return;
    }
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    pointerActive = true;
  };
  window.addEventListener("pointermove", onMove, { passive: true });

  /* Camera framing: field sits low and to the right, text keeps the top-left */
  const look = new Vector3();
  function frameCamera(scrollK = 0) {
    const w = host.clientWidth;
    const h = host.clientHeight;
    const aspect = w / h;
    camera.aspect = aspect;
    if (small) {
      camera.position.set(-4, 10 + scrollK * 3, 30);
      look.set(0.5, 7.5, 0);
    } else {
      camera.position.set(-12, 13 + scrollK * 4, 30);
      look.set(-5.5, 6.2, 0);
    }
    camera.lookAt(look);
    camera.updateProjectionMatrix();
  }

  function resize() {
    renderer.setSize(host.clientWidth, host.clientHeight, false);
    frameCamera();
  }

  let time = 0;
  let born = reduce ? 10 : 0; // seconds since mount, drives the build-up
  let running = false;
  let last = performance.now();
  let scrollK = 0;

  function update(dt) {
    time += reduce ? 0 : dt;
    born += dt;
    if (pointerActive && !reduce) {
      ray.setFromCamera(ndc, camera);
      ray.ray.intersectPlane(floorPlane, hit);
    } else {
      hit.set(999, 0, 999);
    }
    for (let k = 0; k < count; k++) {
      const c = cells[k];
      const grow = Math.min(Math.max((born - c.i * 0.035 - c.j * 0.015) / 1.1, 0), 1);
      const eased = 1 - Math.pow(1 - grow, 4);
      const wave = reduce ? 0 : 0.32 * Math.sin(time * 1.3 - c.i * 0.38 - c.j * 0.24);
      const dx = c.x - hit.x;
      const dz = c.z - hit.z;
      const target = 2.6 * Math.exp(-(dx * dx + dz * dz) / 4.5);
      c.lift += (target - c.lift) * 0.12;
      const hgt = Math.max(0.06, (c.trend * c.jitter + wave) * eased + c.lift);
      dummy.position.set(c.x, 0, c.z);
      dummy.scale.set(1, hgt, 1);
      dummy.updateMatrix();
      bars.setMatrixAt(k, dummy.matrix);

      const r = Math.min(hgt / 7, 1);
      if (r < 0.45) tmpC.copy(low).lerp(mid, r / 0.45);
      else tmpC.copy(mid).lerp(hot, (r - 0.45) / 0.55);
      if (c.lift > 0.05) tmpC.lerp(amber, Math.min(c.lift / 1.6, 1));
      bars.setColorAt(k, tmpC);
    }
    bars.instanceMatrix.needsUpdate = true;
    if (bars.instanceColor) bars.instanceColor.needsUpdate = true;
    frameCamera(scrollK);
  }

  function frame(now) {
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    update(dt);
    renderer.render(scene, camera);
    if (running) requestAnimationFrame(frame);
  }
  function start() {
    if (running) return;
    running = true;
    last = performance.now();
    requestAnimationFrame(frame);
  }

  new IntersectionObserver(([e]) => {
    if (e.isIntersecting && !reduce) start();
    else running = false;
  }).observe(host);

  window.addEventListener(
    "scroll",
    () => {
      const r = host.getBoundingClientRect();
      scrollK = Math.min(Math.max(-r.top / r.height, 0), 1);
    },
    { passive: true },
  );
  new ResizeObserver(() => {
    resize();
    if (!running) frame(performance.now());
  }).observe(host);

  /* Compile shaders off the main thread where supported, then yield once */
  try {
    await renderer.compileAsync(scene, camera);
  } catch {}
  await new Promise((r) => setTimeout(r, 0));
  resize();
  frame(performance.now());
  host.classList.add("scene-on");
  if (!reduce) start();
}
