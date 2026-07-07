(function () {
'use strict';

// ============================================================
// GLOBAL STATE
// ============================================================
let scene, camera, renderer;
let clock = new THREE.Clock();
let bodies = {};          // id -> body object (see createBody)
let bodyMeshList = [];    // flat list of {mesh, id, isMoon, parentId} for raycasting
let timeScale = 1;
let playing = true;
let showOrbits = true;
let showLabels = true;
let selectedId = null;
let tourActive = false;
let tourIndex = -1;
let tourTimer = null;
const TOUR_DWELL_MS = 7000;

// Camera orbit-controller (spherical around a focus point)
const cam = {
  theta: 0.9,        // horizontal angle
  phi: 1.15,         // vertical angle (0 = top, PI = bottom)
  radius: 46,
  targetRadius: 46,
  focusPos: new THREE.Vector3(0, 0, 0),
  desiredFocusId: null,
};
let isDragging = false;
let lastPointer = { x: 0, y: 0 };
let pinchStartDist = null;
let pinchStartRadius = null;

// ============================================================
// INIT
// ============================================================
function init() {
  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 4000);

  renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputEncoding = THREE.sRGBEncoding;
  document.getElementById('appRoot').appendChild(renderer.domElement);

  scene.add(new THREE.AmbientLight(0x404060, 0.55));
  const sunLight = new THREE.PointLight(0xffffff, 2.4, 0, 0);
  scene.add(sunLight);

  buildStarfield();
  buildSun();
  PLANETS_DATA.forEach((p) => buildPlanet(p));
  buildPlanet(DWARF_DATA);

  buildSidebar();
  wireUI();
  wirePointerControls();
  window.addEventListener('resize', onResize);

  updateCameraPosition(true);
  animate();

  setTimeout(() => {
    document.getElementById('loading').classList.add('hidden');
  }, 500);
}

// ============================================================
// STARFIELD
// ============================================================
function buildStarfield() {
  const starCount = 4000;
  const positions = new Float32Array(starCount * 3);
  const colors = new Float32Array(starCount * 3);
  const palette = [
    [1, 1, 1], [0.75, 0.83, 1], [1, 0.93, 0.8], [0.85, 0.9, 1]
  ];
  for (let i = 0; i < starCount; i++) {
    const r = 600 + Math.random() * 900;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.cos(phi);
    positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
    const c = palette[Math.floor(Math.random() * palette.length)];
    const b = 0.5 + Math.random() * 0.5;
    colors[i * 3] = c[0] * b;
    colors[i * 3 + 1] = c[1] * b;
    colors[i * 3 + 2] = c[2] * b;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  const mat = new THREE.PointsMaterial({ size: 1.6, vertexColors: true, sizeAttenuation: false });
  scene.add(new THREE.Points(geo, mat));
}

// ============================================================
// TEXTURE GENERATION (procedural, no external images needed)
// ============================================================
function hexToRgb(hex) {
  return { r: (hex >> 16) & 255, g: (hex >> 8) & 255, b: hex & 255 };
}
function shade(rgb, amt) {
  const f = (v) => Math.max(0, Math.min(255, Math.round(v + amt)));
  return `rgb(${f(rgb.r)},${f(rgb.g)},${f(rgb.b)})`;
}

function makeRockyTexture(colorHex, seed) {
  const size = 256;
  const cnv = document.createElement('canvas');
  cnv.width = size; cnv.height = size;
  const ctx = cnv.getContext('2d');
  const base = hexToRgb(colorHex);
  ctx.fillStyle = shade(base, 0);
  ctx.fillRect(0, 0, size, size);

  let s = seed * 999983;
  const rand = () => { s = (s * 16807) % 2147483647; return (s < 0 ? s + 2147483647 : s) / 2147483647; };

  for (let i = 0; i < 140; i++) {
    const x = rand() * size, y = rand() * size, r = rand() * size * 0.06 + 3;
    ctx.beginPath();
    ctx.fillStyle = shade(base, (rand() - 0.5) * 46);
    ctx.globalAlpha = 0.5;
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  for (let i = 0; i < 55; i++) {
    const x = rand() * size, y = rand() * size, r = rand() * 5 + 1.5;
    ctx.beginPath();
    ctx.fillStyle = shade(base, -35);
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.strokeStyle = shade(base, 22);
    ctx.lineWidth = 0.6;
    ctx.arc(x - r * 0.25, y - r * 0.25, r * 0.8, 0, Math.PI * 2);
    ctx.stroke();
  }
  const tex = new THREE.CanvasTexture(cnv);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

function makeBandedTexture(colorHex, seed, bandCount) {
  const w = 512, h = 256;
  const cnv = document.createElement('canvas');
  cnv.width = w; cnv.height = h;
  const ctx = cnv.getContext('2d');
  const base = hexToRgb(colorHex);
  let s = seed * 7919;
  const rand = () => { s = (s * 16807) % 2147483647; return (s < 0 ? s + 2147483647 : s) / 2147483647; };

  const bandH = h / bandCount;
  for (let b = 0; b < bandCount; b++) {
    ctx.fillStyle = shade(base, (rand() - 0.5) * 60);
    ctx.fillRect(0, b * bandH, w, bandH + 1);
  }
  ctx.globalAlpha = 0.35;
  for (let i = 0; i < 90; i++) {
    const y = rand() * h;
    const len = rand() * 140 + 40;
    const x = rand() * w;
    ctx.strokeStyle = shade(base, (rand() - 0.5) * 50);
    ctx.lineWidth = rand() * 3 + 1;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.bezierCurveTo(x + len * 0.3, y + rand() * 6 - 3, x + len * 0.7, y + rand() * 6 - 3, x + len, y);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  const tex = new THREE.CanvasTexture(cnv);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  return tex;
}

function makeEarthTexture() {
  const w = 512, h = 256;
  const cnv = document.createElement('canvas');
  cnv.width = w; cnv.height = h;
  const ctx = cnv.getContext('2d');
  ctx.fillStyle = '#1a4fa0';
  ctx.fillRect(0, 0, w, h);
  let s = 12345;
  const rand = () => { s = (s * 16807) % 2147483647; return (s < 0 ? s + 2147483647 : s) / 2147483647; };
  ctx.fillStyle = '#2f8f4e';
  for (let i = 0; i < 16; i++) {
    const cx = rand() * w, cy = rand() * h * 0.8 + h * 0.1;
    const rw = rand() * 70 + 30, rh = rand() * 34 + 16;
    ctx.beginPath();
    ctx.ellipse(cx, cy, rw, rh, rand() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
    if (cx + rw > w) { ctx.beginPath(); ctx.ellipse(cx - w, cy, rw, rh, 0, 0, Math.PI * 2); ctx.fill(); }
  }
  ctx.fillStyle = '#eef6ff';
  ctx.fillRect(0, 0, w, h * 0.07);
  ctx.fillRect(0, h * 0.93, w, h * 0.07);
  ctx.globalAlpha = 0.35;
  ctx.fillStyle = '#ffffff';
  for (let i = 0; i < 40; i++) {
    const cx = rand() * w, cy = rand() * h;
    const rr = rand() * 26 + 8;
    ctx.beginPath();
    ctx.ellipse(cx, cy, rr, rr * 0.4, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  const tex = new THREE.CanvasTexture(cnv);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  return tex;
}

function makeRingTexture(colorHex) {
  const size = 256;
  const cnv = document.createElement('canvas');
  cnv.width = size; cnv.height = 8;
  const ctx = cnv.getContext('2d');
  const base = hexToRgb(colorHex);
  let s = 555;
  const rand = () => { s = (s * 16807) % 2147483647; return (s < 0 ? s + 2147483647 : s) / 2147483647; };
  for (let x = 0; x < size; x++) {
    const alpha = 0.25 + rand() * 0.55;
    ctx.fillStyle = `rgba(${base.r},${base.g},${base.b},${alpha})`;
    ctx.fillRect(x, 0, 1, 8);
  }
  const tex = new THREE.CanvasTexture(cnv);
  return tex;
}

function makeGlowSprite(colorHex, size) {
  const cnv = document.createElement('canvas');
  cnv.width = cnv.height = 256;
  const ctx = cnv.getContext('2d');
  const rgb = hexToRgb(colorHex);
  const grad = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
  grad.addColorStop(0, `rgba(${rgb.r},${rgb.g},${rgb.b},0.9)`);
  grad.addColorStop(0.4, `rgba(${rgb.r},${rgb.g},${rgb.b},0.35)`);
  grad.addColorStop(1, `rgba(${rgb.r},${rgb.g},${rgb.b},0)`);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 256);
  const tex = new THREE.CanvasTexture(cnv);
  const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false });
  const sprite = new THREE.Sprite(mat);
  sprite.scale.set(size, size, 1);
  return sprite;
}

// ============================================================
// BUILD SUN
// ============================================================
function buildSun() {
  const geo = new THREE.SphereGeometry(SUN_DATA.visualRadius, 48, 48);
  const tex = makeBandedTexture(SUN_DATA.color, 3, 10);
  const mat = new THREE.MeshBasicMaterial({ map: tex, color: 0xffffff });
  const mesh = new THREE.Mesh(geo, mat);
  scene.add(mesh);
  scene.add(makeGlowSprite(0xffcf6b, SUN_DATA.visualRadius * 5.5));
  scene.add(makeGlowSprite(0xffe9bd, SUN_DATA.visualRadius * 3));

  const group = new THREE.Group();
  group.add(mesh);
  scene.add(group);

  bodies['sun'] = {
    id: 'sun', data: SUN_DATA, group, mesh,
    orbitAngle: 0, orbitRadius: 0, orbitSpeed: 0,
    rotationSpeed: (Math.PI * 2) / 90,
    moons: []
  };
  bodyMeshList.push({ mesh, id: 'sun' });
}

// ============================================================
// BUILD A PLANET (+ its moons, rings, orbit path)
// ============================================================
function buildPlanet(data) {
  const orbitPivot = new THREE.Group();
  scene.add(orbitPivot);

  const startAngle = Math.random() * Math.PI * 2;
  orbitPivot.rotation.y = startAngle;

  const tiltGroup = new THREE.Group();
  tiltGroup.position.x = data.visualDistance;
  tiltGroup.rotation.z = THREE.MathUtils.degToRad(data.tiltDeg > 90 ? 180 - data.tiltDeg : data.tiltDeg);
  orbitPivot.add(tiltGroup);

  const segs = data.visualRadius > 1.5 ? 40 : 28;
  const geo = new THREE.SphereGeometry(data.visualRadius, segs, segs);
  let tex;
  if (data.id === 'earth') tex = makeEarthTexture();
  else if (['jupiter', 'saturn', 'uranus', 'neptune'].includes(data.id)) tex = makeBandedTexture(data.color, hashSeed(data.id), 14);
  else tex = makeRockyTexture(data.color, hashSeed(data.id));

  const mat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.9, metalness: 0.0 });
  const mesh = new THREE.Mesh(geo, mat);
  tiltGroup.add(mesh);

  if (data.hasRings) {
    const ringGeo = new THREE.RingGeometry(data.visualRadius * 1.4, data.visualRadius * 2.4, 64);
    const uv = ringGeo.attributes.uv;
    for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i), 1);
    const ringTex = makeRingTexture(0xdcc9a3);
    const ringMat = new THREE.MeshBasicMaterial({ map: ringTex, side: THREE.DoubleSide, transparent: true, opacity: 0.9 });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2 - 0.35;
    tiltGroup.add(ring);
  }

  const orbitLine = makeOrbitLine(data.visualDistance, data.color);
  scene.add(orbitLine);

  const moonEntries = [];
  (data.moons || []).forEach((m) => {
    const moonPivot = new THREE.Group();
    moonPivot.rotation.y = Math.random() * Math.PI * 2;
    tiltGroup.add(moonPivot);

    const mGeo = new THREE.SphereGeometry(m.visualRadius, 18, 18);
    const mTex = makeRockyTexture(m.color, hashSeed(data.id + m.name));
    const mMat = new THREE.MeshStandardMaterial({ map: mTex, roughness: 1 });
    const mMesh = new THREE.Mesh(mGeo, mMat);
    mMesh.position.x = m.visualDistance;
    moonPivot.add(mMesh);

    const moonOrbitLine = makeOrbitLine(m.visualDistance, 0x8899bb, 0.12);
    tiltGroup.add(moonOrbitLine);

    const speedSign = m.periodDays < 0 ? -1 : 1;
    const period = Math.abs(m.periodDays);
    moonEntries.push({
      name: m.name, data: m, pivot: moonPivot, mesh: mMesh,
      speed: speedSign * (Math.PI * 2) / (period * 4),
    });
    bodyMeshList.push({ mesh: mMesh, id: data.id, isMoon: true, moonName: m.name });
  });

  const orbitSpeed = (Math.PI * 2) / (data.orbitalPeriodDays * 0.12);
  const rotSign = data.rotationHours < 0 ? -1 : 1;
  const rotationSpeed = rotSign * (Math.PI * 2) / (Math.abs(data.rotationHours) * 3.2);

  bodies[data.id] = {
    id: data.id, data, group: orbitPivot, tiltGroup, mesh,
    orbitRadius: data.visualDistance, orbitSpeed, rotationSpeed,
    moons: moonEntries
  };
  bodyMeshList.push({ mesh, id: data.id });
}

function hashSeed(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return (h % 9000) + 100;
}

function makeOrbitLine(radius, colorHex, opacity) {
  const pts = [];
  const segCount = 128;
  for (let i = 0; i <= segCount; i++) {
    const a = (i / segCount) * Math.PI * 2;
    pts.push(new THREE.Vector3(Math.cos(a) * radius, 0, Math.sin(a) * radius));
  }
  const geo = new THREE.BufferGeometry().setFromPoints(pts);
  const mat = new THREE.LineBasicMaterial({ color: colorHex, transparent: true, opacity: opacity !== undefined ? opacity : 0.28 });
  const line = new THREE.Line(geo, mat);
  line.userData.isOrbitLine = true;
  return line;
}

// ============================================================
// ANIMATION LOOP
// ============================================================
function animate() {
  requestAnimationFrame(animate);
  const delta = Math.min(clock.getDelta(), 0.05);
  const dt = playing ? delta * timeScale : 0;

  Object.values(bodies).forEach((b) => {
    if (b.id !== 'sun') {
      b.group.rotation.y += b.orbitSpeed * dt;
    }
    if (b.mesh) b.mesh.rotation.y += b.rotationSpeed * dt;
    (b.moons || []).forEach((m) => {
      m.pivot.rotation.y += m.speed * dt;
    });
  });

  updateCameraPosition(false);
  if (showLabels) updateLabels();
  renderer.render(scene, camera);
}

// ============================================================
// CAMERA CONTROLS (custom spherical orbit controller)
// ============================================================
function getFocusWorldPos(id) {
  if (!id) return new THREE.Vector3(0, 0, 0);
  const b = bodies[id];
  if (!b) return new THREE.Vector3(0, 0, 0);
  const pos = new THREE.Vector3();
  (b.mesh || b.group).getWorldPosition(pos);
  return pos;
}

function updateCameraPosition(instant) {
  const target = getFocusWorldPos(cam.desiredFocusId);
  const lerpFactor = instant ? 1 : 0.06;
  cam.focusPos.lerp(target, lerpFactor);
  cam.radius += (cam.targetRadius - cam.radius) * (instant ? 1 : 0.09);

  const sinPhi = Math.sin(cam.phi);
  const x = cam.focusPos.x + cam.radius * sinPhi * Math.cos(cam.theta);
  const y = cam.focusPos.y + cam.radius * Math.cos(cam.phi);
  const z = cam.focusPos.z + cam.radius * sinPhi * Math.sin(cam.theta);
  camera.position.set(x, y, z);
  camera.lookAt(cam.focusPos);
}

function focusOn(id) {
  cam.desiredFocusId = id;
  const b = bodies[id];
  if (!b) return;
  const r = (b.data.visualRadius || SUN_DATA.visualRadius);
  cam.targetRadius = Math.max(r * 6.5, 8);
}

function clearFocus() {
  cam.desiredFocusId = null;
  cam.targetRadius = 46;
}

// ============================================================
// POINTER / TOUCH CONTROLS
// ============================================================
function wirePointerControls() {
  const dom = renderer.domElement;
  const raycaster = new THREE.Raycaster();
  const pointerNdc = new THREE.Vector2();
  let downPos = { x: 0, y: 0 };
  let moved = false;

  function getMeshFromEvent(clientX, clientY) {
    pointerNdc.x = (clientX / window.innerWidth) * 2 - 1;
    pointerNdc.y = -(clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(pointerNdc, camera);
    const meshes = bodyMeshList.map((b) => b.mesh);
    const hits = raycaster.intersectObjects(meshes, false);
    if (hits.length === 0) return null;
    const hitMesh = hits[0].object;
    return bodyMeshList.find((b) => b.mesh === hitMesh);
  }

  dom.addEventListener('pointerdown', (e) => {
    isDragging = true;
    moved = false;
    lastPointer = { x: e.clientX, y: e.clientY };
    downPos = { x: e.clientX, y: e.clientY };
    dom.setPointerCapture(e.pointerId);
  });

  dom.addEventListener('pointermove', (e) => {
    if (!isDragging) return;
    const dx = e.clientX - lastPointer.x;
    const dy = e.clientY - lastPointer.y;
    if (Math.abs(e.clientX - downPos.x) > 4 || Math.abs(e.clientY - downPos.y) > 4) moved = true;
    cam.theta -= dx * 0.005;
    cam.phi = Math.max(0.25, Math.min(Math.PI - 0.25, cam.phi - dy * 0.005));
    lastPointer = { x: e.clientX, y: e.clientY };
  });

  dom.addEventListener('pointerup', (e) => {
    isDragging = false;
    if (!moved) {
      const hit = getMeshFromEvent(e.clientX, e.clientY);
      if (hit) {
        stopTour();
        selectBody(hit.id);
      }
    }
  });

  dom.addEventListener('wheel', (e) => {
    e.preventDefault();
    cam.targetRadius = Math.max(4, Math.min(320, cam.targetRadius + e.deltaY * 0.03));
  }, { passive: false });

  dom.addEventListener('touchstart', (e) => {
    if (e.touches.length === 2) {
      pinchStartDist = touchDist(e.touches);
      pinchStartRadius = cam.targetRadius;
    }
  }, { passive: true });

  dom.addEventListener('touchmove', (e) => {
    if (e.touches.length === 2 && pinchStartDist) {
      const d = touchDist(e.touches);
      const ratio = pinchStartDist / d;
      cam.targetRadius = Math.max(4, Math.min(320, pinchStartRadius * ratio));
    }
  }, { passive: true });

  dom.addEventListener('touchend', (e) => {
    if (e.touches.length < 2) pinchStartDist = null;
  }, { passive: true });

  function touchDist(touches) {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }
}

// ============================================================
// LABELS (HTML overlay, projected from 3D)
// ============================================================
let labelEls = {};
function ensureLabelEls() {
  const layer = document.getElementById('labelLayer');
  ALL_BODIES.forEach((d) => {
    if (!labelEls[d.id]) {
      const el = document.createElement('div');
      el.className = 'body-label';
      el.textContent = d.name;
      el.style.color = '#' + d.color.toString(16).padStart(6, '0');
      layer.appendChild(el);
      labelEls[d.id] = el;
    }
  });
}

function updateLabels() {
  const vec = new THREE.Vector3();
  ALL_BODIES.forEach((d) => {
    const b = bodies[d.id];
    const el = labelEls[d.id];
    if (!b || !el) return;
    (b.mesh).getWorldPosition(vec);
    const projected = vec.clone().project(camera);
    if (projected.z > 1) { el.style.opacity = 0; return; }
    const x = (projected.x * 0.5 + 0.5) * window.innerWidth;
    const y = (-projected.y * 0.5 + 0.5) * window.innerHeight;
    el.style.left = x + 'px';
    el.style.top = y + 'px';
    const dist = camera.position.distanceTo(vec);
    el.style.opacity = dist > 260 ? 0 : Math.min(1, Math.max(0.15, 1 - dist / 260));
  });
}

// ============================================================
// SIDEBAR
// ============================================================
function buildSidebar() {
  const el = document.getElementById('sidebar');
  ALL_BODIES.forEach((d) => {
    const item = document.createElement('div');
    item.className = 'body-item';
    item.dataset.id = d.id;
    const colorHex = '#' + d.color.toString(16).padStart(6, '0');
    item.innerHTML = `<span class="body-dot" style="background:${colorHex};color:${colorHex}"></span><span>${d.name}<small>${d.type}</small></span>`;
    item.addEventListener('click', () => { stopTour(); selectBody(d.id); });
    el.appendChild(item);
  });
}

function highlightSidebar(id) {
  document.querySelectorAll('.body-item').forEach((el) => {
    el.classList.toggle('selected', el.dataset.id === id);
  });
}

// ============================================================
// INFO PANEL
// ============================================================
function selectBody(id) {
  selectedId = id;
  focusOn(id);
  highlightSidebar(id);
  showInfo(id);
}

function showInfo(id) {
  const d = ALL_BODIES.find((x) => x.id === id);
  if (!d) return;
  const panel = document.getElementById('infoPanel');
  const content = document.getElementById('infoContent');
  const colorHex = '#' + d.color.toString(16).padStart(6, '0');

  let factsHtml = '';
  Object.entries(d.facts).forEach(([key, val]) => {
    const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase());
    factsHtml += `<div class="fact"><label>${label}</label><div>${val}</div></div>`;
  });

  let moonsHtml = '';
  if (d.moons && d.moons.length) {
    moonsHtml = `<div class="moons-title">Notable Moons (${d.moons.length})</div>`;
    d.moons.forEach((m) => {
      moonsHtml += `<span class="moon-chip" title="${m.fact}">${m.name}</span>`;
    });
    moonsHtml += `<div class="desc" style="margin-top:8px">${d.moons.map(m => `<b>${m.name}:</b> ${m.fact}`).join('<br><br>')}</div>`;
  }

  content.innerHTML = `
    <h2 style="color:${colorHex}">${iconFor(d.id)} ${d.name}</h2>
    <div class="type-tag">${d.type}</div>
    <div class="desc">${d.description}</div>
    <div class="facts">${factsHtml}</div>
    ${moonsHtml}
  `;
  panel.classList.add('visible');
}

function iconFor(id) {
  const map = { sun: '☀', mercury: '☿', venus: '♀', earth: '🌍', mars: '♂', jupiter: '♃', saturn: '♄', uranus: '♅', neptune: '♆', pluto: '🪐' };
  return map[id] || '●';
}

function closeInfo() {
  document.getElementById('infoPanel').classList.remove('visible');
  selectedId = null;
  highlightSidebar(null);
  clearFocus();
}

// ============================================================
// UI WIRING
// ============================================================
function wireUI() {
  ensureLabelEls();

  document.getElementById('infoCloseBtn').addEventListener('click', () => { stopTour(); closeInfo(); });

  document.getElementById('sidebarToggleBtn').addEventListener('click', (e) => {
    document.getElementById('sidebar').classList.toggle('collapsed');
    e.currentTarget.classList.toggle('active');
  });

  const orbitsBtn = document.getElementById('orbitsToggleBtn');
  orbitsBtn.classList.add('active');
  orbitsBtn.addEventListener('click', () => {
    showOrbits = !showOrbits;
    orbitsBtn.classList.toggle('active', showOrbits);
    scene.traverse((obj) => { if (obj.userData && obj.userData.isOrbitLine) obj.visible = showOrbits; });
  });

  const labelsBtn = document.getElementById('labelsToggleBtn');
  labelsBtn.classList.add('active');
  labelsBtn.addEventListener('click', () => {
    showLabels = !showLabels;
    labelsBtn.classList.toggle('active', showLabels);
    Object.values(labelEls).forEach((el) => { el.style.display = showLabels ? 'block' : 'none'; });
  });

  const playBtn = document.getElementById('playPauseBtn');
  playBtn.addEventListener('click', () => {
    playing = !playing;
    playBtn.innerHTML = playing ? '⏸ <span class="label-text">Pause</span>' : '▶ <span class="label-text">Play</span>';
  });

  document.getElementById('speedSlider').addEventListener('input', (e) => {
    const v = parseFloat(e.target.value);
    timeScale = Math.pow(v, 1.6) / 3 + 0.02;
  });
  document.getElementById('speedSlider').value = 3.2;
  timeScale = Math.pow(3.2, 1.6) / 3 + 0.02;

  document.getElementById('resetBtn').addEventListener('click', () => {
    stopTour();
    closeInfo();
    cam.theta = 0.9; cam.phi = 1.15; cam.targetRadius = 46;
  });

  document.getElementById('tourBtn').addEventListener('click', () => {
    if (tourActive) stopTour(); else startTour();
  });
}

// ============================================================
// GUIDED TOUR
// ============================================================
function startTour() {
  tourActive = true;
  tourIndex = -1;
  document.getElementById('tourBtn').classList.add('active');
  document.getElementById('tourBtn').innerHTML = '⏹ <span class="label-text">Stop Tour</span>';
  document.getElementById('tourCaption').classList.add('visible');
  advanceTour();
}

function advanceTour() {
  if (!tourActive) return;
  tourIndex = (tourIndex + 1) % ALL_BODIES.length;
  const d = ALL_BODIES[tourIndex];
  selectBody(d.id);
  document.getElementById('tourCaption').textContent = `Visiting ${d.name} — ${tourIndex + 1} / ${ALL_BODIES.length}`;
  clearTimeout(tourTimer);
  tourTimer = setTimeout(advanceTour, TOUR_DWELL_MS);
}

function stopTour() {
  if (!tourActive) return;
  tourActive = false;
  clearTimeout(tourTimer);
  document.getElementById('tourBtn').classList.remove('active');
  document.getElementById('tourBtn').innerHTML = '🚀 <span class="label-text">Start Tour</span>';
  document.getElementById('tourCaption').classList.remove('visible');
}

// ============================================================
// RESIZE
// ============================================================
function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// ============================================================
// BOOT
// ============================================================
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  });
}
})();
