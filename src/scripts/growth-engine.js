/*
 * Hero "growth engine": a WebGL particle funnel. Leads swirl in at the
 * wide mouth, spiral down through the throat (the system), and leave as
 * a rising revenue curve. All particle motion runs in the vertex shader,
 * so the CPU cost per frame is one uniform update.
 *
 * Lazy-loaded by the hero after first paint. Reduced motion gets one
 * still frame. No WebGL: the vermilion hero simply stays flat.
 */
import {
  WebGLRenderer,
  Scene,
  PerspectiveCamera,
  BufferGeometry,
  BufferAttribute,
  Points,
  ShaderMaterial,
  Group,
  Color,
  Vector3,
  NormalBlending,
} from "three";

const VERT = /* glsl */ `
  attribute vec4 aSeed;
  attribute float aKind;
  uniform float uTime;
  uniform float uSize;
  uniform float uPR;
  varying float vAlpha;
  varying float vKind;

  const float TOP = 1.55;
  const float BOT = -1.05;
  const float TAU = 6.2831853;

  void main() {
    vec3 p;
    float alpha;
    if (aKind < 0.5) {
      // Funnel: leads fall and tighten as they approach the throat
      float life = fract(uTime * (0.045 + aSeed.w * 0.03) + aSeed.x);
      float y = mix(TOP, BOT, pow(life, 0.85));
      float n = clamp((y - BOT) / (TOP - BOT), 0.0, 1.0);
      float r = 0.16 + 1.55 * pow(n, 1.55);
      r *= 1.0 + (aSeed.z - 0.5) * 0.35 * n;
      float a = aSeed.y * TAU + uTime * (0.25 + 1.4 * (1.0 - n)) + life * 7.0;
      p = vec3(cos(a) * r, y + (aSeed.w - 0.5) * 0.08, sin(a) * r);
      alpha = smoothstep(0.0, 0.12, life) * (1.0 - smoothstep(0.92, 1.0, life));
    } else {
      // Revenue: shot out of the throat along a compounding curve
      float s = fract(uTime * (0.07 + aSeed.w * 0.02) + aSeed.x);
      float x = s * 1.8;
      float y = BOT - 0.25 + 0.5 * (exp(2.2 * s) - 1.0) - 0.3 * sin(s * 3.14159) * (1.0 - s);
      float spread = 0.03 + s * 0.2;
      float a = aSeed.y * TAU + uTime * 1.5;
      p = vec3(x, y, 0.0) + vec3(0.0, cos(a) * spread, sin(a) * spread);
      alpha = smoothstep(0.0, 0.06, s) * (1.0 - smoothstep(0.8, 1.0, s));
    }
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    float base = aKind < 0.5 ? (0.55 + aSeed.z * 0.9) : (1.1 + aSeed.z * 1.3);
    gl_PointSize = uSize * base * uPR * (6.0 / -mv.z);
    vAlpha = alpha;
    vKind = aKind;
  }
`;

const FRAG = /* glsl */ `
  precision mediump float;
  uniform vec3 uInk;
  uniform vec3 uLight;
  varying float vAlpha;
  varying float vKind;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d = length(c);
    if (d > 0.5) discard;
    float edge = 1.0 - smoothstep(0.38, 0.5, d);
    vec3 col = vKind < 0.5 ? uInk : uLight;
    gl_FragColor = vec4(col, vAlpha * edge * (vKind < 0.5 ? 0.8 : 0.95));
  }
`;

function build(count, kind) {
  const geo = new BufferGeometry();
  const seeds = new Float32Array(count * 4);
  for (let i = 0; i < seeds.length; i++) seeds[i] = Math.random();
  const kinds = new Float32Array(count).fill(kind);
  geo.setAttribute("aSeed", new BufferAttribute(seeds, 4));
  geo.setAttribute("aKind", new BufferAttribute(kinds, 1));
  // Positions are computed in the shader; a dummy attribute keeps three happy.
  geo.setAttribute("position", new BufferAttribute(new Float32Array(count * 3), 3));
  geo.boundingSphere = null;
  return geo;
}

export async function mount(host, opts = {}) {
  const canvas = host.querySelector("canvas");
  const anchor = opts.anchor || null;
  const labels = opts.labels || {};
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const small = window.matchMedia("(max-width: 48rem)").matches;

  let renderer;
  try {
    renderer = new WebGLRenderer({ canvas, antialias: false, alpha: true, powerPreference: "low-power" });
  } catch {
    return null;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  renderer.setClearColor(0x000000, 0);

  const scene = new Scene();
  const camera = new PerspectiveCamera(34, 1, 0.1, 50);
  camera.position.set(0, 0, 8);

  const ink = new Color(0x1c1411);
  const light = new Color(0xf2edeb);

  const material = new ShaderMaterial({
    vertexShader: VERT,
    fragmentShader: FRAG,
    transparent: true,
    depthWrite: false,
    blending: NormalBlending,
    uniforms: {
      uTime: { value: 12 },
      uSize: { value: small ? 2.3 : 2.6 },
      uPR: { value: renderer.getPixelRatio() },
      uInk: { value: ink },
      uLight: { value: light },
    },
  });

  const engine = new Group();
  const funnel = new Points(build(small ? 3200 : 7000, 0), material);
  const stream = new Points(build(small ? 700 : 1500, 1), material);
  funnel.frustumCulled = false;
  stream.frustumCulled = false;
  engine.add(funnel, stream);
  engine.rotation.set(0.28, -0.35, 0.0);
  scene.add(engine);

  /* Place the engine behind the anchor element (the portrait) */
  const base = new Vector3();
  function place() {
    const w = host.clientWidth;
    const h = host.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    const hr = host.getBoundingClientRect();
    let nx = small ? 0 : 0.45;
    let ny = small ? -0.35 : 0;
    if (anchor) {
      const ar = anchor.getBoundingClientRect();
      nx = ((ar.left + ar.width / 2 - hr.left) / w) * 2 - 1;
      ny = -(((ar.top + ar.height / 2 - hr.top) / h) * 2 - 1);
    }
    // Unproject NDC onto the z=0 plane
    const v = new Vector3(nx, ny, 0.5).unproject(camera);
    const dir = v.sub(camera.position).normalize();
    const t = -camera.position.z / dir.z;
    base.copy(camera.position).add(dir.multiplyScalar(t));
    engine.position.copy(base);
    const scale = small ? Math.min(1, w / 520) * 1.05 : Math.min(1.25, h / 760);
    engine.scale.setScalar(scale);
  }

  /* Pointer: the whole engine leans toward the cursor */
  const target = { x: 0, y: 0 };
  const lean = { x: 0, y: 0 };
  const onMove = (e) => {
    target.x = (e.clientX / window.innerWidth) * 2 - 1;
    target.y = (e.clientY / window.innerHeight) * 2 - 1;
  };
  window.addEventListener("pointermove", onMove, { passive: true });

  /* Labels ride on projected 3D points */
  const tmp = new Vector3();
  function pin(el, local) {
    if (!el) return;
    tmp.copy(local).applyMatrix4(engine.matrixWorld).project(camera);
    const half = el.offsetWidth / 2 + 16;
    const x = Math.min(Math.max((tmp.x * 0.5 + 0.5) * host.clientWidth, half), host.clientWidth - half);
    const y = (-tmp.y * 0.5 + 0.5) * host.clientHeight;
    el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
  }
  const leadsAt = new Vector3(-0.95, 1.45, 0.3);
  const revenueAt = new Vector3(1.45, 0.7, 0);

  let visible = true;
  let running = false;
  let last = performance.now();
  let scrollK = 0;

  function frame(now) {
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    if (!reduce) material.uniforms.uTime.value += dt;
    lean.x += (target.x - lean.x) * 0.05;
    lean.y += (target.y - lean.y) * 0.05;
    engine.rotation.y = -0.35 + lean.x * 0.45;
    engine.rotation.x = 0.28 + lean.y * 0.18;
    engine.position.y = base.y + scrollK * 1.6;
    engine.updateMatrixWorld();
    pin(labels.leads, leadsAt);
    pin(labels.revenue, revenueAt);
    renderer.render(scene, camera);
    if (running) requestAnimationFrame(frame);
  }

  function start() {
    if (running || reduce) return;
    running = true;
    last = performance.now();
    requestAnimationFrame(frame);
  }
  function stop() {
    running = false;
  }

  const io = new IntersectionObserver(
    ([entry]) => {
      visible = entry.isIntersecting;
      visible ? start() : stop();
    },
    { threshold: 0 },
  );
  io.observe(host);

  const onScroll = () => {
    const r = host.getBoundingClientRect();
    scrollK = Math.min(Math.max(-r.top / r.height, 0), 1);
  };
  window.addEventListener("scroll", onScroll, { passive: true });

  const ro = new ResizeObserver(() => {
    place();
    if (!running) frame(performance.now());
  });
  ro.observe(host);

  /* Compile shaders off the main thread where supported, then yield once */
  try {
    await renderer.compileAsync(scene, camera);
  } catch {}
  await new Promise((r) => setTimeout(r, 0));
  place();
  frame(performance.now());
  host.classList.add("scene-on");
  if (!reduce) start();

  return { stop };
}
