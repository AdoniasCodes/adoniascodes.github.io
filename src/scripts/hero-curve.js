/*
 * Hero option B, "revenue curve": a glossy 3D growth curve draws itself
 * across a chart floor, with light pulses flowing up it. Four milestone
 * nodes carry the verified results; their HTML labels pop in as the
 * curve reaches them. The chart leans toward the cursor.
 */
import {
  WebGLRenderer,
  Scene,
  PerspectiveCamera,
  CatmullRomCurve3,
  TubeGeometry,
  ShaderMaterial,
  Mesh,
  Group,
  Vector3,
  Color,
  GridHelper,
  BufferGeometry,
  BufferAttribute,
  Line,
  LineBasicMaterial,
  LineDashedMaterial,
  SphereGeometry,
  MeshBasicMaterial,
  Points,
  PointsMaterial,
} from "three";

const TUBE_VERT = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vN;
  varying vec3 vView;
  void main() {
    vUv = uv;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vN = normalize(normalMatrix * normal);
    vView = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`;
const TUBE_FRAG = /* glsl */ `
  precision highp float;
  uniform float uDraw;
  uniform float uTime;
  uniform vec3 uBase;
  uniform vec3 uHot;
  uniform vec3 uGlow;
  varying vec2 vUv;
  varying vec3 vN;
  varying vec3 vView;
  void main() {
    if (vUv.x > uDraw) discard;
    vec3 L = normalize(vec3(-0.4, 0.8, 0.6));
    float diff = max(dot(vN, L), 0.0);
    float rim = pow(1.0 - max(dot(vN, vView), 0.0), 2.5);
    float spec = pow(max(dot(reflect(-L, vN), vView), 0.0), 28.0);
    // Pulses travelling up the curve
    float p = fract(vUv.x * 3.0 - uTime * 0.35);
    float pulse = smoothstep(0.0, 0.04, p) * (1.0 - smoothstep(0.04, 0.16, p));
    // The drawing tip glows
    float tip = 1.0 - smoothstep(0.0, 0.03, uDraw - vUv.x);
    vec3 col = uBase * (0.45 + 0.65 * diff);
    col = mix(col, uHot, rim * 0.7);
    col += uGlow * (spec * 0.9 + pulse * 0.55 + tip * 0.8);
    gl_FragColor = vec4(col, 1.0);
  }
`;

export async function mount(host, opts = {}) {
  const canvas = host.querySelector("canvas");
  const labels = (opts.labels && opts.labels.milestones) || [];
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const small = window.matchMedia("(max-width: 48rem)").matches;

  let renderer;
  try {
    renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "low-power" });
  } catch {
    return null;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0x000000, 0);

  const scene = new Scene();
  const camera = new PerspectiveCamera(34, 1, 0.1, 100);
  camera.position.set(0, 1.2, 16);

  const chart = new Group();
  scene.add(chart);

  /* The curve: compounding growth with a little depth so it reads as 3D */
  const FLOOR = -2.6;
  const pts = [];
  for (let k = 0; k <= 48; k++) {
    const s = k / 48;
    const y = FLOOR + 0.25 + 5.9 * ((Math.exp(2.5 * s) - 1) / (Math.exp(2.5) - 1));
    pts.push(new Vector3(-6.5 + 13 * s, y + 0.35 * Math.sin(s * 9) * (1 - s) * 0.5, -1.6 * Math.sin(s * Math.PI)));
  }
  const curve = new CatmullRomCurve3(pts);
  const tubeMat = new ShaderMaterial({
    vertexShader: TUBE_VERT,
    fragmentShader: TUBE_FRAG,
    uniforms: {
      uDraw: { value: reduce ? 1 : 0 },
      uTime: { value: 0 },
      uBase: { value: new Color(0xec5022) },
      uHot: { value: new Color(0xff8a4c) },
      uGlow: { value: new Color(0xffe2b0) },
    },
  });
  chart.add(new Mesh(new TubeGeometry(curve, small ? 260 : 480, 0.17, small ? 16 : 24, false), tubeMat));

  /* Chart floor grid + the curve's shadow line on it */
  const grid = new GridHelper(26, 26, 0xf2edeb, 0xf2edeb);
  grid.material.transparent = true;
  grid.material.opacity = 0.09;
  grid.position.y = FLOOR;
  chart.add(grid);

  const shadowPts = curve.getPoints(200).map((p) => new Vector3(p.x, FLOOR + 0.01, p.z));
  const shadow = new Line(
    new BufferGeometry().setFromPoints(shadowPts),
    new LineBasicMaterial({ color: 0xec5022, transparent: true, opacity: 0.35 }),
  );
  chart.add(shadow);

  /* Milestone nodes with dashed drop lines to the floor */
  const stops = [0.38, 0.6, 0.8, 0.96];
  const nodes = stops.map((s) => {
    const p = curve.getPointAt(s);
    const dot = new Mesh(new SphereGeometry(0.3, 32, 16), new MeshBasicMaterial({ color: 0xfcba43 }));
    dot.position.copy(p);
    dot.scale.setScalar(0.001);
    chart.add(dot);
    const drop = new Line(
      new BufferGeometry().setFromPoints([p.clone(), new Vector3(p.x, FLOOR, p.z)]),
      new LineDashedMaterial({ color: 0xf2edeb, dashSize: 0.15, gapSize: 0.12, transparent: true, opacity: 0 }),
    );
    drop.computeLineDistances();
    chart.add(drop);
    return { s, p, dot, drop, shown: 0 };
  });

  /* Dust for depth */
  const DUST = small ? 120 : 260;
  const dpos = new Float32Array(DUST * 3);
  for (let i = 0; i < DUST; i++) {
    dpos.set([(Math.random() - 0.5) * 22, FLOOR + Math.random() * 8, (Math.random() - 0.5) * 12], i * 3);
  }
  const dustGeo = new BufferGeometry();
  dustGeo.setAttribute("position", new BufferAttribute(dpos, 3));
  const dust = new Points(
    dustGeo,
    new PointsMaterial({ color: 0xf2edeb, size: 0.045, transparent: true, opacity: 0.35, depthWrite: false }),
  );
  chart.add(dust);

  /* Framing: right half on desktop, under the text on phones */
  const base = new Vector3();
  function place() {
    const w = host.clientWidth;
    const h = host.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    const nx = small ? -0.14 : 0.38;
    const ny = small ? -0.74 : -0.02;
    const v = new Vector3(nx, ny, 0.5).unproject(camera);
    const dir = v.sub(camera.position).normalize();
    const t = -camera.position.z / dir.z;
    base.copy(camera.position).add(dir.multiplyScalar(t));
    chart.position.copy(base);
    const s = small ? Math.min(w / 1000, 0.42) : Math.min(0.5, (w / h) * 0.3);
    chart.scale.setScalar(s);
  }

  const target = { x: 0, y: 0 };
  const lean = { x: 0, y: 0 };
  window.addEventListener(
    "pointermove",
    (e) => {
      target.x = (e.clientX / window.innerWidth) * 2 - 1;
      target.y = (e.clientY / window.innerHeight) * 2 - 1;
    },
    { passive: true },
  );

  const tmp = new Vector3();
  function pinLabels() {
    nodes.forEach((n, i) => {
      const el = labels[i];
      if (!el) return;
      tmp.copy(n.p).applyMatrix4(chart.matrixWorld).project(camera);
      const half = el.offsetWidth / 2 + 12;
      const x = Math.min(Math.max((tmp.x * 0.5 + 0.5) * host.clientWidth, half), host.clientWidth - half);
      const y = (-tmp.y * 0.5 + 0.5) * host.clientHeight;
      el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
      el.style.opacity = n.shown > 0.5 ? "1" : "0";
    });
  }

  let running = false;
  let last = performance.now();
  let time = 0;
  let scrollK = 0;
  function frame(now) {
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    if (!reduce) {
      time += dt;
      tubeMat.uniforms.uTime.value = time;
      const d = tubeMat.uniforms.uDraw;
      d.value = Math.min(1, d.value + dt * 0.42 * (1.15 - d.value * 0.5));
      dust.rotation.y += dt * 0.02;
    }
    const drawn = tubeMat.uniforms.uDraw.value;
    nodes.forEach((n, i) => {
      const want = drawn >= n.s ? 1 : 0;
      n.shown += (want - n.shown) * 0.12;
      const pulse = reduce ? 1 : 1 + 0.12 * Math.sin(time * 3 + i);
      n.dot.scale.setScalar(Math.max(0.001, n.shown * pulse));
      n.drop.material.opacity = n.shown * 0.4;
    });
    lean.x += (target.x - lean.x) * 0.05;
    lean.y += (target.y - lean.y) * 0.05;
    chart.rotation.y = -0.32 + lean.x * 0.22;
    chart.rotation.x = 0.1 + lean.y * 0.08;
    chart.position.y = base.y + scrollK * 1.5;
    chart.updateMatrixWorld();
    pinLabels();
    renderer.render(scene, camera);
    if (running) requestAnimationFrame(frame);
  }

  new IntersectionObserver(([e]) => {
    if (e.isIntersecting && !reduce) {
      if (!running) {
        running = true;
        last = performance.now();
        requestAnimationFrame(frame);
      }
    } else running = false;
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
    place();
    frame(performance.now());
  }).observe(host);

  /* Compile shaders off the main thread where supported, then yield once */
  try {
    await renderer.compileAsync(scene, camera);
  } catch {}
  await new Promise((r) => setTimeout(r, 0));
  if (reduce) nodes.forEach((n) => (n.shown = 1));
  place();
  frame(performance.now());
  host.classList.add("scene-on");
}
