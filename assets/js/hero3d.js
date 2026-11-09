/* =========================================================
   Hero 3D scene — morphing core, orbit rings, star field
   ========================================================= */
(function () {
  'use strict';
  var canvas = document.getElementById('hero3d');
  var hero = document.getElementById('hero');
  if (!canvas || !hero) return;

  function fail() { document.documentElement.classList.add('no-webgl'); canvas.style.display = 'none'; }
  if (!window.THREE) return fail();

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  } catch (e) { return fail(); }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0x000000, 0);

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.set(0, 0, 8);

  var root = new THREE.Group();
  scene.add(root);
  var group = new THREE.Group();
  root.add(group);

  /* ---------- lights ---------- */
  scene.add(new THREE.AmbientLight(0x404040, 0.6));
  var l1 = new THREE.PointLight(0x22d3ee, 2.2, 30); l1.position.set(5, 4, 5); scene.add(l1);
  var l2 = new THREE.PointLight(0xffffff, 1.4, 30); l2.position.set(-5, -2, 4); scene.add(l2);
  var l3 = new THREE.PointLight(0x22d3ee, 1.2, 30); l3.position.set(0, -5, -3); scene.add(l3);

  /* ---------- morphing core ---------- */
  var geo = new THREE.IcosahedronGeometry(1.55, 6);
  var pos = geo.attributes.position;
  var base = new Float32Array(pos.array);
  geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 2.2);

  var coreMat = new THREE.MeshStandardMaterial({
    color: 0x15171c, emissive: 0x050608, metalness: 0.75, roughness: 0.22, flatShading: true
  });
  var core = new THREE.Mesh(geo, coreMat);
  group.add(core);

  var wireMat = new THREE.MeshBasicMaterial({ color: 0x22d3ee, wireframe: true, transparent: true, opacity: 0.14 });
  var wire = new THREE.Mesh(geo, wireMat);
  wire.scale.setScalar(1.004);
  group.add(wire);

  // inner glow sprite
  var glowCanvas = document.createElement('canvas');
  glowCanvas.width = glowCanvas.height = 128;
  var gctx = glowCanvas.getContext('2d');
  var grd = gctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  grd.addColorStop(0, 'rgba(34,211,238,0.55)');
  grd.addColorStop(0.4, 'rgba(34,211,238,0.12)');
  grd.addColorStop(1, 'rgba(0,0,0,0)');
  gctx.fillStyle = grd; gctx.fillRect(0, 0, 128, 128);
  var glow = new THREE.Sprite(new THREE.SpriteMaterial({
    map: new THREE.CanvasTexture(glowCanvas), blending: THREE.AdditiveBlending, transparent: true, depthWrite: false
  }));
  glow.scale.set(7.5, 7.5, 1);
  group.add(glow);

  /* ---------- rings + satellites ---------- */
  function ring(r, color, op) {
    var m = new THREE.Mesh(
      new THREE.TorusGeometry(r, 0.008, 8, 220),
      new THREE.MeshBasicMaterial({ color: color, transparent: true, opacity: op })
    );
    return m;
  }
  var ringA = ring(2.55, 0x22d3ee, 0.6); ringA.rotation.set(1.2, 0.3, 0); group.add(ringA);
  var ringB = ring(3.05, 0xe9ebf5, 0.22); ringB.rotation.set(-0.9, 0.8, 0.2); group.add(ringB);
  var ringC = ring(3.6, 0x22d3ee, 0.18); ringC.rotation.set(0.3, -1.1, 0.5); group.add(ringC);

  var satGeo = new THREE.SphereGeometry(0.07, 16, 16);
  var sats = [
    { ring: ringA, r: 2.55, speed: 0.6, phase: 0, color: 0x22d3ee },
    { ring: ringB, r: 3.05, speed: -0.4, phase: 2, color: 0xe9ebf5 },
    { ring: ringC, r: 3.6, speed: 0.3, phase: 4, color: 0x22d3ee }
  ].map(function (s) {
    s.mesh = new THREE.Mesh(satGeo, new THREE.MeshBasicMaterial({ color: s.color }));
    s.ring.add(s.mesh);
    return s;
  });

  /* ---------- code-ish floating tags (sprites with text) ---------- */
  var words = ['<?php', 'SELECT *', '{ api }', 'Laravel', 'CI4', 'JOIN', '200 OK', 'git push', 'TRIGGER', 'SP_EXEC'];
  var tags = [];
  words.forEach(function (w, i) {
    var c = document.createElement('canvas'); c.width = 256; c.height = 64;
    var x = c.getContext('2d');
    x.font = '600 30px JetBrains Mono, monospace';
    x.textAlign = 'center'; x.textBaseline = 'middle';
    x.fillStyle = i % 2 === 0 ? '#22d3ee' : '#e9ebf5';
    x.fillText(w, 128, 32);
    var sp = new THREE.Sprite(new THREE.SpriteMaterial({
      map: new THREE.CanvasTexture(c), transparent: true, opacity: 0.55, depthWrite: false
    }));
    var a = (i / words.length) * Math.PI * 2;
    var rad = 3.3 + (i % 3) * 0.45;
    sp.userData = { a: a, rad: rad, y: (Math.random() - 0.5) * 2.8, speed: 0.08 + Math.random() * 0.06 };
    sp.scale.set(1.6, 0.4, 1);
    root.add(sp);
    tags.push(sp);
  });

  /* ---------- star field ---------- */
  var N = window.innerWidth < 700 ? 900 : 1800;
  var starPos = new Float32Array(N * 3);
  var starCol = new Float32Array(N * 3);
  var palette = [new THREE.Color(0x22d3ee), new THREE.Color(0xe9ebf5), new THREE.Color(0xe9ebf5)];
  for (var i = 0; i < N; i++) {
    var r = 5 + Math.random() * 16;
    var th = Math.random() * Math.PI * 2;
    var ph = Math.acos(2 * Math.random() - 1);
    starPos[i * 3] = r * Math.sin(ph) * Math.cos(th);
    starPos[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th);
    starPos[i * 3 + 2] = r * Math.cos(ph) - 4;
    var col = palette[(Math.random() * palette.length) | 0];
    starCol[i * 3] = col.r; starCol[i * 3 + 1] = col.g; starCol[i * 3 + 2] = col.b;
  }
  var starGeo = new THREE.BufferGeometry();
  starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
  starGeo.setAttribute('color', new THREE.BufferAttribute(starCol, 3));
  var stars = new THREE.Points(starGeo, new THREE.PointsMaterial({
    size: 0.045, vertexColors: true, transparent: true, opacity: 0.85,
    blending: THREE.AdditiveBlending, depthWrite: false
  }));
  scene.add(stars);

  /* ---------- interaction ---------- */
  var mouse = { x: 0, y: 0, tx: 0, ty: 0 };
  var ndc = new THREE.Vector2(-10, -10);
  var raycaster = new THREE.Raycaster();
  var hovering = false;
  var pulse = 0;
  var wireAccent = true;
  var scrollP = 0;

  window.addEventListener('pointermove', function (e) {
    mouse.tx = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.ty = (e.clientY / window.innerHeight) * 2 - 1;
    var rect = canvas.getBoundingClientRect();
    ndc.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    ndc.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
  }, { passive: true });

  hero.addEventListener('click', function (e) {
    if (e.target.closest('a, button')) return;
    if (!hovering && window.matchMedia('(hover: hover)').matches) return;
    pulse = 1;
    wireAccent = !wireAccent;
    wireMat.color.set(wireAccent ? 0x22d3ee : 0xe9ebf5);
    document.dispatchEvent(new CustomEvent('core:pulse'));
  });

  window.addEventListener('scroll', function () {
    scrollP = Math.min(1, window.scrollY / (hero.offsetHeight || 1));
  }, { passive: true });

  /* ---------- layout ---------- */
  var layoutX = 0, layoutY = 0, layoutS = 1;
  function resize() {
    var w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    if (w > 900) { layoutX = 3.0; layoutY = 0; layoutS = 0.86; }
    else if (w > 640) { layoutX = 1.8; layoutY = 0.8; layoutS = 0.72; }
    else { layoutX = 0; layoutY = 2.0; layoutS = 0.6; }
  }
  window.addEventListener('resize', resize);
  resize();

  /* ---------- loop ---------- */
  var visible = true;
  new IntersectionObserver(function (en) {
    visible = en[0].isIntersecting;
    if (visible) loop();
    else if (hovering) { hovering = false; document.body.classList.remove('core-hover'); }
  }).observe(hero);

  var clock = new THREE.Clock();
  var t = 0;
  var running = false;
  var speed = reduce ? 0.25 : 1;

  function displace(time) {
    var arr = pos.array;
    var amp = 0.16 + pulse * 0.35;
    for (var i = 0; i < arr.length; i += 3) {
      var ox = base[i], oy = base[i + 1], oz = base[i + 2];
      var n = Math.sin(ox * 1.9 + time * 1.1) * Math.sin(oy * 2.3 + time * 1.4) * Math.sin(oz * 1.7 + time * 0.9);
      var n2 = Math.sin((ox + oy + oz) * 3.2 - time * 2.0) * 0.35;
      var s = 1 + amp * (n + n2 * (0.4 + pulse));
      arr[i] = ox * s; arr[i + 1] = oy * s; arr[i + 2] = oz * s;
    }
    pos.needsUpdate = true;
    geo.computeVertexNormals();
  }

  function loop() {
    if (running) return;
    running = true;
    requestAnimationFrame(frame);
  }

  function frame() {
    if (!visible) { running = false; return; }
    var dt = Math.min(clock.getDelta(), 0.05);
    t += dt * speed;

    mouse.x += (mouse.tx - mouse.x) * 0.05;
    mouse.y += (mouse.ty - mouse.y) * 0.05;
    pulse *= 0.94;

    displace(t);

    group.rotation.y += dt * 0.18 * speed + mouse.x * 0.004;
    group.rotation.x += (mouse.y * 0.5 - group.rotation.x) * 0.04;
    ringA.rotation.z += dt * 0.25 * speed;
    ringB.rotation.z -= dt * 0.18 * speed;
    ringC.rotation.z += dt * 0.1 * speed;
    sats.forEach(function (s) {
      var a = t * s.speed + s.phase;
      s.mesh.position.set(Math.cos(a) * s.r, Math.sin(a) * s.r, 0);
    });
    tags.forEach(function (sp) {
      var d = sp.userData;
      var a = d.a + t * d.speed;
      sp.position.set(Math.cos(a) * d.rad, d.y + Math.sin(t * 0.6 + d.a) * 0.25, Math.sin(a) * d.rad * 0.7 - 1.2);
      sp.material.opacity = 0.08 + 0.42 * ((Math.sin(a) + 1) / 2);
    });
    stars.rotation.y += dt * 0.012 * speed;
    stars.rotation.x = mouse.y * 0.06;

    var sc = layoutS * (1 + pulse * 0.12) * (1 - scrollP * 0.25);
    root.scale.setScalar(sc);
    root.position.x += (layoutX + mouse.x * 0.35 - root.position.x) * 0.06;
    root.position.y += (layoutY - mouse.y * 0.25 + scrollP * 2.2 - root.position.y) * 0.06;
    camera.position.x += (mouse.x * 0.6 - camera.position.x) * 0.04;
    camera.position.y += (-mouse.y * 0.4 - camera.position.y) * 0.04;
    camera.lookAt(0, 0, 0);

    glow.material.opacity = 0.65 + Math.sin(t * 2) * 0.15 + pulse * 0.4;
    coreMat.emissiveIntensity = 1 + pulse * 3;

    // hover detection on the core
    raycaster.setFromCamera(ndc, camera);
    var hit = raycaster.intersectObject(core, false).length > 0;
    if (hit !== hovering) {
      hovering = hit;
      document.body.classList.toggle('core-hover', hit);
    }
    wireMat.opacity += ((hovering ? 0.45 : 0.14) + pulse * 0.4 - wireMat.opacity) * 0.1;

    renderer.render(scene, camera);
    requestAnimationFrame(frame);
  }

  loop();
})();
