/*
 * "Teams anywhere" globe: a dotted sphere with live arcs from Addis Ababa
 * to the markets Adonias has worked with. Drag to spin (mouse or touch,
 * horizontal only, so vertical swipes still scroll the page).
 * Lazy-mounted when the section nears the viewport.
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
} from "three";
import { W as MW, H as MH, MASK } from "./land-mask.js";

const R = 1;
const toVec = (lat, lon, r = R) => {
  const phi = ((90 - lat) * Math.PI) / 180;
  const theta = ((lon + 180) * Math.PI) / 180;
  return new Vector3(-r * Math.sin(phi) * Math.cos(theta), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(theta));
};

const HOME = { lat: 9.03, lon: 38.74 };

const DOT_VERT = /* glsl */ `
  attribute float aSize;
  attribute float aKind;
  uniform float uPR;
  varying float vFront;
  varying float vKind;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vec3 n = normalize(mat3(modelViewMatrix) * normalize(position));
    vFront = dot(n, normalize(-mv.xyz));
    vKind = aKind;
    gl_Position = projectionMatrix * mv;
    gl_PointSize = aSize * uPR * (4.0 / -mv.z);
  }
`;
const DOT_FRAG = /* glsl */ `
  precision mediump float;
  uniform vec3 uInk;
  uniform vec3 uSignal;
  uniform vec3 uAmber;
  varying float vFront;
  varying float vKind;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    float edge = 1.0 - smoothstep(0.36, 0.5, d);
    float facing = smoothstep(-0.25, 0.35, vFront);
    vec3 col = vKind < 0.5 || vKind > 2.5 ? uInk : (vKind < 1.5 ? uSignal : uAmber);
    float a = vKind < 0.5 ? mix(0.06, 0.85, facing)
            : vKind > 2.5 ? mix(0.03, 0.2, facing)
            : mix(0.15, 1.0, facing);
    gl_FragColor = vec4(col, a * edge);
  }
`;

const ARC_VERT = /* glsl */ `
  attribute float aT;
  attribute float aArc;
  uniform float uTime;
  uniform float uPR;
  varying float vA;
  varying float vFront;
  void main() {
    float head = fract(uTime * 0.28 + aArc * 0.23);
    float dist = head - aT;
    float trail = dist >= 0.0 ? exp(-dist * 7.0) : 0.0;
    vA = 0.18 + trail * 0.82;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vec3 n = normalize(mat3(modelViewMatrix) * normalize(position));
    vFront = dot(n, normalize(-mv.xyz));
    gl_Position = projectionMatrix * mv;
    gl_PointSize = (1.6 + trail * 3.2) * uPR * (4.0 / -mv.z);
  }
`;
const ARC_FRAG = /* glsl */ `
  precision mediump float;
  uniform vec3 uSignal;
  varying float vA;
  varying float vFront;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    float facing = smoothstep(-0.35, 0.2, vFront);
    gl_FragColor = vec4(uSignal, vA * mix(0.2, 1.0, facing) * (1.0 - smoothstep(0.35, 0.5, d)));
  }
`;

const maskBytes = Uint8Array.from(atob(MASK), (c) => c.charCodeAt(0));
const isLand = (lat, lon) => {
  const r = Math.min(MH - 1, Math.floor(((90 - lat) / 180) * MH));
  const c = Math.min(MW - 1, Math.floor(((lon + 180) / 360) * MW));
  const k = r * MW + c;
  return (maskBytes[k >> 3] >> (k & 7)) & 1;
};

/* Fibonacci lattice: land dots solid, ocean dots sparse and faint */
function sphereDots(n) {
  const pos = [];
  const size = [];
  const kind = [];
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < n; i++) {
    const y = 1 - (i / (n - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const th = golden * i;
    const x = Math.cos(th) * r;
    const z = Math.sin(th) * r;
    const lat = (Math.asin(y) * 180) / Math.PI;
    // Inverse of toVec(): x = -sin(phi)cos(theta), z = sin(phi)sin(theta)
    let lon = (Math.atan2(z, -x) * 180) / Math.PI - 180;
    if (lon < -180) lon += 360;
    const land = isLand(lat, lon);
    if (!land && i % 5) continue;
    pos.push(x * R, y * R, z * R);
    size.push(land ? 2.2 : 1.4);
    kind.push(land ? 0 : 3);
  }
  return { pos: new Float32Array(pos), size: new Float32Array(size), kind: new Float32Array(kind) };
}

export function mount(host, cities, labels) {
  const canvas = host.querySelector("canvas");
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let renderer;
  try {
    renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "low-power" });
  } catch {
    return null;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0x000000, 0);

  const scene = new Scene();
  const camera = new PerspectiveCamera(30, 1, 0.1, 20);
  camera.position.set(0, 0, 4.4);

  const colors = {
    uInk: { value: new Color(0x1c1411) },
    uSignal: { value: new Color(0xec5022) },
    uAmber: { value: new Color(0xfcba43) },
  };
  const pr = { value: renderer.getPixelRatio() };

  const globe = new Group();
  scene.add(globe);

  /* Surface dots + city markers in one Points object */
  const dots = sphereDots(window.innerWidth < 700 ? 9000 : 16000);
  const cityPos = cities.map((c) => toVec(c.lat, c.lon, R * 1.01));
  const home = toVec(HOME.lat, HOME.lon, R * 1.01);
  const total = dots.size.length + cityPos.length + 1;
  const pos = new Float32Array(total * 3);
  const size = new Float32Array(total);
  const kind = new Float32Array(total);
  pos.set(dots.pos);
  size.set(dots.size);
  kind.set(dots.kind);
  let o = dots.size.length;
  cityPos.forEach((v) => {
    pos.set([v.x, v.y, v.z], o * 3);
    size[o] = 7;
    kind[o] = 1;
    o++;
  });
  pos.set([home.x, home.y, home.z], o * 3);
  size[o] = 11;
  kind[o] = 2;

  const dotGeo = new BufferGeometry();
  dotGeo.setAttribute("position", new BufferAttribute(pos, 3));
  dotGeo.setAttribute("aSize", new BufferAttribute(size, 1));
  dotGeo.setAttribute("aKind", new BufferAttribute(kind, 1));
  const dotMat = new ShaderMaterial({
    vertexShader: DOT_VERT,
    fragmentShader: DOT_FRAG,
    transparent: true,
    depthWrite: false,
    uniforms: { ...colors, uPR: pr },
  });
  globe.add(new Points(dotGeo, dotMat));

  /* Arcs: great-circle paths lifted off the surface, drawn as dense dots */
  const PER = 90;
  const arcPos = new Float32Array(cityPos.length * PER * 3);
  const arcT = new Float32Array(cityPos.length * PER);
  const arcId = new Float32Array(cityPos.length * PER);
  const a = home.clone().normalize();
  cityPos.forEach((c, k) => {
    const b = c.clone().normalize();
    const omega = Math.acos(Math.min(Math.max(a.dot(b), -1), 1));
    for (let i = 0; i < PER; i++) {
      const t = i / (PER - 1);
      const s = Math.sin(omega) || 1;
      const p = a
        .clone()
        .multiplyScalar(Math.sin((1 - t) * omega) / s)
        .add(b.clone().multiplyScalar(Math.sin(t * omega) / s));
      p.normalize().multiplyScalar(R * (1.01 + Math.sin(t * Math.PI) * (0.12 + omega * 0.12)));
      const j = k * PER + i;
      arcPos.set([p.x, p.y, p.z], j * 3);
      arcT[j] = t;
      arcId[j] = k;
    }
  });
  const arcGeo = new BufferGeometry();
  arcGeo.setAttribute("position", new BufferAttribute(arcPos, 3));
  arcGeo.setAttribute("aT", new BufferAttribute(arcT, 1));
  arcGeo.setAttribute("aArc", new BufferAttribute(arcId, 1));
  const arcMat = new ShaderMaterial({
    vertexShader: ARC_VERT,
    fragmentShader: ARC_FRAG,
    transparent: true,
    depthWrite: false,
    uniforms: { uSignal: colors.uSignal, uPR: pr, uTime: { value: 0.6 } },
  });
  globe.add(new Points(arcGeo, arcMat));

  /* Face Addis toward the camera, tilted so Europe sits above it */
  const baseYaw = -Math.atan2(home.x, home.z) - 0.35;
  let yaw = baseYaw;
  let vel = 0;
  globe.rotation.x = 0.42;

  /* Drag to spin. Horizontal only; touch-action pan-y keeps page scroll. */
  let dragging = false;
  let lastX = 0;
  host.addEventListener("pointerdown", (e) => {
    dragging = true;
    lastX = e.clientX;
    host.setPointerCapture(e.pointerId);
    host.classList.add("is-dragging");
  });
  host.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    const dx = e.clientX - lastX;
    lastX = e.clientX;
    vel = dx * 0.006;
    yaw += vel;
    if (!running) frame(performance.now());
  });
  const end = () => {
    dragging = false;
    host.classList.remove("is-dragging");
  };
  host.addEventListener("pointerup", end);
  host.addEventListener("pointercancel", end);

  /* Keyboard: arrows spin when focused */
  host.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") yaw -= 0.2;
    if (e.key === "ArrowRight") yaw += 0.2;
    if (!running) frame(performance.now());
  });

  const tmp = new Vector3();
  const nrm = new Vector3();
  const pinAll = () => {
    labels.forEach((el, i) => {
      const v = i < cityPos.length ? cityPos[i] : home;
      tmp.copy(v).applyMatrix4(globe.matrixWorld);
      nrm.copy(tmp).normalize();
      const facing = nrm.dot(tmp.clone().sub(camera.position).normalize().negate());
      tmp.project(camera);
      const x = (tmp.x * 0.5 + 0.5) * host.clientWidth;
      const y = (-tmp.y * 0.5 + 0.5) * host.clientHeight;
      el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
      el.style.opacity = facing > 0.15 ? "1" : "0";
    });
  };

  function resize() {
    const w = host.clientWidth;
    const h = host.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }

  let running = false;
  let last = performance.now();
  function frame(now) {
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    if (!reduce) {
      arcMat.uniforms.uTime.value += dt;
      if (!dragging) {
        vel *= 0.94;
        yaw += vel + dt * 0.12;
      }
    }
    globe.rotation.y = yaw;
    globe.updateMatrixWorld();
    pinAll();
    renderer.render(scene, camera);
    if (running) requestAnimationFrame(frame);
  }
  const io = new IntersectionObserver(([e]) => {
    if (e.isIntersecting && !reduce) {
      if (!running) {
        running = true;
        last = performance.now();
        requestAnimationFrame(frame);
      }
    } else running = false;
  });
  io.observe(host);
  new ResizeObserver(() => {
    resize();
    frame(performance.now());
  }).observe(host);
  resize();
  frame(performance.now());
  host.classList.add("scene-on");
}
