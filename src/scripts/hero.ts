// Hero: an impossible (Penrose) "play" triangle that resolves as it settles, then, on scroll, turns away
// and a 3D screen frame turns in, playing the studio reel. Orthographic camera so the illusion holds.
import * as THREE from "three";

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const range = (v: number, a: number, b: number) => clamp((v - a) / (b - a));
const expoOut = (t: number) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));
const smooth = (t: number) => t * t * (3 - 2 * t);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export function initHero() {
  const canvas = document.querySelector<HTMLCanvasElement>(".hero-canvas");
  const wrap = document.querySelector<HTMLElement>(".hero-scroll");
  const word = document.querySelector<HTMLElement>("[data-word]");
  const counter = document.querySelector<HTMLElement>("[data-count]");
  if (!canvas || !wrap) return;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
  } catch {
    document.body.classList.add("loaded", "no-webgl");
    return;
  }
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 200);
  const viewDir = new THREE.Vector3(1, 1, 1).normalize();
  camera.position.copy(viewDir).multiplyScalar(60);
  camera.up.set(0, 1, 0);
  camera.lookAt(0, 0, 0);
  camera.updateMatrixWorld();

  scene.add(new THREE.HemisphereLight(0xffffff, 0x0e0f11, 0.3));
  const sun = new THREE.DirectionalLight(0xffffff, 3.4);
  sun.position.set(9, 30, -5);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.radius = 6;
  Object.assign(sun.shadow.camera, { left: -14, right: 14, top: 14, bottom: -14, near: 1, far: 80 });
  scene.add(sun);
  const fill = new THREE.DirectionalLight(0xdfe6ff, 0.35);
  fill.position.set(20, 6, 30);
  scene.add(fill);

  const ink = new THREE.Color("#1e1f23");
  const inkLift = new THREE.Color("#33363d");
  const mat = new THREE.MeshStandardMaterial({ color: ink.clone(), roughness: 0.62, metalness: 0.08 });
  const blue = new THREE.MeshStandardMaterial({ color: new THREE.Color("#0037ff"), roughness: 0.5, metalness: 0.05 });

  // stage = screen space (local XY is the screen plane)
  const stage = new THREE.Group();
  stage.quaternion.copy(camera.quaternion);
  scene.add(stage);
  const root = new THREE.Group();
  stage.add(root);

  // ---- impossible triangle, built along world axes ----
  // mouse sway lives in the screen plane (roll + drift): any real 3D tilt would break the illusion
  const sway = new THREE.Group();
  root.add(sway);
  const orient = new THREE.Group();
  orient.quaternion.copy(camera.quaternion).invert();
  sway.add(orient);
  const spin = new THREE.Group();
  orient.add(spin);
  const tilt = new THREE.Group();
  spin.add(tilt);
  const tri = new THREE.Group();
  tilt.add(tri);

  const L = 3.1;
  const t = 0.78;
  const beam = (sx: number, sy: number, sz: number, x: number, y: number, z: number, m = mat) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), m);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    tri.add(mesh);
    return mesh;
  };
  beam(L, t, t, (L + t) / 2, 0, 0);
  beam(t, L + t, t, L, L / 2, 0);
  beam(t, t, L + t, L, L, L / 2);
  // The corner where the loop "closes". Drawn last and on top while the illusion holds, so the far beam
  // seems to pass behind it. That's the Penrose trick.
  const cap = beam(t, t, t, 0, 0, 0, blue.clone());
  const capMat = cap.material as THREE.MeshStandardMaterial;
  cap.renderOrder = 10;
  tri.position.set((-2 * L) / 3, -L / 3, 0);

  // point the triangle right, like a play button: rotate about the view axis
  const project = (v: THREE.Vector3) => v.clone().applyQuaternion(camera.quaternion.clone().invert());
  const verts = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(L, 0, 0), new THREE.Vector3(L, L, 0)];
  const centroid = verts.reduce((a, v) => a.add(v), new THREE.Vector3()).divideScalar(3);
  const screenAngle = (v: THREE.Vector3, q: THREE.Quaternion) => {
    const p = project(v.clone().sub(centroid).applyQuaternion(q));
    return Math.atan2(p.y, p.x);
  };
  let best = new THREE.Quaternion();
  let bestErr = Infinity;
  for (const v of verts)
    for (const s of [1, -1]) {
      const a0 = screenAngle(v, new THREE.Quaternion());
      const q = new THREE.Quaternion().setFromAxisAngle(viewDir, -a0 * s);
      const err = Math.abs(screenAngle(v, q));
      if (err < bestErr) [best, bestErr] = [q, err];
    }
  spin.quaternion.copy(best);

  const shadowPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(60, 60),
    new THREE.ShadowMaterial({ color: 0x101113, opacity: 0.09 }),
  );
  shadowPlane.rotation.x = -Math.PI / 2;
  shadowPlane.position.y = -3.4;
  shadowPlane.receiveShadow = true;
  orient.add(shadowPlane);

  // ---- screen frame (16:9) with the reel inside ----
  const frame = new THREE.Group();
  root.add(frame);
  const iw = 4.8, ih = 2.7, b = 0.42, d = 0.7;
  const W = iw + 2 * b, H = ih + 2 * b;
  const fbeam = (sx: number, sy: number, x: number, y: number, m = mat) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, d), m);
    mesh.position.set(x, y, 0);
    frame.add(mesh);
    return mesh;
  };
  fbeam(W, b, 0, H / 2 - b / 2);
  fbeam(W - b, b, -b / 2, -H / 2 + b / 2);
  fbeam(b, ih, -W / 2 + b / 2, 0);
  fbeam(b, ih, W / 2 - b / 2, 0);
  fbeam(b, b, W / 2 - b / 2, -H / 2 + b / 2, blue); // the corner that's always blue
  const backing = new THREE.Mesh(new THREE.PlaneGeometry(iw, ih), new THREE.MeshBasicMaterial({ color: 0x0b0c0e }));
  backing.position.z = -d / 2 + 0.02;
  frame.add(backing);

  const video = document.createElement("video");
  Object.assign(video, { muted: true, loop: true, playsInline: true, preload: "auto", crossOrigin: "anonymous" });
  video.setAttribute("playsinline", "");
  video.src = canvas.dataset.reel ?? "";
  const tex = new THREE.VideoTexture(video);
  tex.colorSpace = THREE.SRGBColorSpace;
  const screenMat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: 0, toneMapped: false });
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(iw, ih), screenMat);
  screen.position.z = -d / 2 + 0.04;
  frame.add(screen);
  frame.scale.setScalar(0.0001);

  // ---- layout ----
  let vw = 0, vh = 0, portrait = false, viewH = 10;
  const resize = () => {
    vw = innerWidth;
    vh = canvas.clientHeight || innerHeight;
    portrait = vw / vh < 0.9;
    renderer.setSize(vw, vh, false);
    const aspect = vw / vh;
    viewH = portrait ? 8 / aspect : 10;
    const viewW = viewH * aspect;
    Object.assign(camera, { left: -viewW / 2, right: viewW / 2, top: viewH / 2, bottom: -viewH / 2 });
    camera.updateProjectionMatrix();
  };
  resize();
  addEventListener("resize", resize);

  // ---- input + state ----
  const mouse = { x: 0, y: 0, sx: 0, sy: 0 };
  addEventListener("pointermove", (e) => {
    if (e.pointerType !== "mouse") return;
    mouse.x = (e.clientX / vw) * 2 - 1;
    mouse.y = (e.clientY / vh) * 2 - 1;
  });

  let intro = reduced ? 1 : 0;
  let introStart = 0;
  let loaded = false;
  let scrollP = 0, smoothP = 0;
  const readScroll = () => {
    const r = wrap.getBoundingClientRect();
    const total = r.height - innerHeight;
    scrollP = clamp(-r.top / total);
    const gone = r.bottom < innerHeight * 0.35;
    canvas.classList.toggle("gone", gone);
    running = !gone || smoothP < 0.999;
  };
  addEventListener("scroll", readScroll, { passive: true });

  // loader counter, then reveal
  const t0 = performance.now();
  const minLoad = reduced ? 0 : 1300;
  const fontsReady = document.fonts?.ready ?? Promise.resolve();
  let fontsDone = false;
  fontsReady.then(() => (fontsDone = true));

  let running = true;
  let raf = 0;
  const tick = (now: number) => {
    raf = requestAnimationFrame(tick);
    if (!loaded) {
      const p = clamp((now - t0) / Math.max(minLoad, 1));
      const shown = fontsDone ? p : Math.min(p, 0.9);
      if (counter) counter.textContent = String(Math.round(shown * 100)).padStart(3, "0");
      if (shown >= 1) {
        loaded = true;
        introStart = now;
        document.body.classList.add("loaded");
      }
    } else if (intro < 1) {
      intro = clamp((now - introStart) / 1700);
    }
    if (!running && loaded && intro >= 1) return;

    smoothP = reduced ? scrollP : lerp(smoothP, scrollP, 0.12);
    mouse.sx = lerp(mouse.sx, mouse.x, 0.06);
    mouse.sy = lerp(mouse.sy, mouse.y, 0.06);
    const ei = expoOut(intro);

    // layout: object centered on the word (desktop) or below it (portrait); drifts to center for the frame
    const baseY = portrait ? -viewH * 0.06 : -0.15;
    const frameIn = smooth(range(smoothP, 0.22, 0.7));
    root.position.set(0, lerp(lerp(-viewH * 0.02, baseY, ei), portrait ? 0.4 : 0.2, frameIn), 0);

    // triangle: small + turned while loading, settles into the illusion, turns away on scroll
    const away = smooth(range(smoothP, 0.02, 0.42));
    const triScale = lerp(0.42, portrait ? 1.25 : 1.2, ei) * (1 - smooth(range(smoothP, 0.18, 0.44)));
    tri.visible = triScale > 0.002;
    tilt.scale.setScalar(Math.max(triScale, 0.0001));
    tilt.rotation.set(lerp(-0.9, 0, ei) - away * 0.6, lerp(1.9, 0, ei) + away * 1.8, 0);
    sway.rotation.z = -mouse.sx * 0.07 * (1 - away);
    sway.position.set(mouse.sx * 0.18 * (1 - away), -mouse.sy * 0.12 * (1 - away), 0);
    const tiltMag = Math.abs(tilt.rotation.x) + Math.abs(tilt.rotation.y);
    capMat.depthTest = tiltMag > 0.3;
    shadowPlane.visible = smoothP < 0.3;

    // frame: turns in and lifts its tone so it reads on ink
    const fs = (portrait ? 1.2 : 1.3) * frameIn;
    frame.scale.setScalar(Math.max(fs, 0.0001));
    frame.visible = fs > 0.002;
    frame.rotation.set(lerp(0.7, 0.1, frameIn) + mouse.sy * 0.06, lerp(-1.5, -0.32, frameIn) + mouse.sx * 0.12, lerp(0.25, 0.02, frameIn));
    mat.color.lerpColors(ink, inkLift, smooth(range(smoothP, 0.3, 0.7)));
    screenMat.opacity = smooth(range(smoothP, 0.42, 0.72));
    if (screenMat.opacity > 0.01 && video.paused) video.play().catch(() => {});
    if (screenMat.opacity <= 0.01 && !video.paused) video.pause();

    if (word) {
      const wp = smooth(range(smoothP, 0, 0.4));
      word.style.transform = `translate3d(${-wp * 18}vw, -50%, 0)`;
      word.style.opacity = String(1 - wp);
    }
    renderer.render(scene, camera);
  };
  readScroll();
  raf = requestAnimationFrame(tick);
  document.addEventListener("visibilitychange", () => {
    cancelAnimationFrame(raf);
    if (!document.hidden) raf = requestAnimationFrame(tick);
  });
}
