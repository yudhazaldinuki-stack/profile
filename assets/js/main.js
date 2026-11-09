/* =========================================================
   Portfolio interactions
   ========================================================= */
(function () {
  'use strict';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var root = document.documentElement;

  /* ---------------- Loader ---------------- */
  function initLoader() {
    var loader = $('#loader');
    if (!loader) { document.body.classList.add('ready'); startTyping(); return; }
    var lines = $$('.boot-line', loader);
    var bar = $('.boot-bar i', loader);
    var pct = $('.boot-pct', loader);
    var start = performance.now();
    var dur = reduce ? 250 : 1700;
    function tick(now) {
      var p = Math.min(1, (now - start) / dur);
      var e = 1 - Math.pow(1 - p, 3);
      bar.style.transform = 'scaleX(' + e + ')';
      pct.textContent = Math.round(e * 100) + '%';
      lines.forEach(function (l, i) { if (e > i / lines.length) l.classList.add('on'); });
      if (p < 1) requestAnimationFrame(tick);
      else setTimeout(done, 280);
    }
    function done() {
      loader.classList.add('hide');
      document.body.classList.add('ready');
      startTyping();
      setTimeout(function () { loader.remove(); }, 900);
    }
    requestAnimationFrame(tick);
  }

  /* ---------------- Custom cursor + spotlight ---------------- */
  function initCursor() {
    window.addEventListener('pointermove', function (e) {
      root.style.setProperty('--cx', e.clientX + 'px');
      root.style.setProperty('--cy', e.clientY + 'px');
    }, { passive: true });
    if (!fine) return;
    var dot = $('.cursor-dot'), ring = $('.cursor-ring');
    document.body.classList.add('has-cursor');
    var x = innerWidth / 2, y = innerHeight / 2, rx = x, ry = y;
    window.addEventListener('pointermove', function (e) {
      x = e.clientX; y = e.clientY;
      dot.style.transform = 'translate(' + x + 'px,' + y + 'px)';
    }, { passive: true });
    (function loop() {
      rx += (x - rx) * 0.2; ry += (y - ry) * 0.2;
      ring.style.transform = 'translate(' + rx + 'px,' + ry + 'px)';
      requestAnimationFrame(loop);
    })();
    document.addEventListener('pointerover', function (e) {
      var t = e.target.closest('a, button, [data-hover], .cert, [data-cursor]');
      ring.classList.toggle('hover', !!t);
      ring.dataset.label = (t && t.dataset.cursor) || '';
    });
    window.addEventListener('pointerdown', function () { ring.classList.add('down'); });
    window.addEventListener('pointerup', function () { ring.classList.remove('down'); });
    document.addEventListener('mouseleave', function () { dot.style.opacity = ring.style.opacity = 0; });
    document.addEventListener('mouseenter', function () { dot.style.opacity = ring.style.opacity = 1; });
  }

  /* ---------------- Nav ---------------- */
  function initNav() {
    var nav = $('#nav');
    var bar = $('.scroll-progress i');
    var burger = $('#burger');
    var links = $$('.nav-links a');

    function onScroll() {
      var h = document.documentElement.scrollHeight - innerHeight;
      bar.style.transform = 'scaleX(' + (h > 0 ? scrollY / h : 0) + ')';
      nav.classList.toggle('scrolled', scrollY > 30);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    burger.addEventListener('click', function () {
      var open = document.body.classList.toggle('menu-open');
      burger.setAttribute('aria-expanded', open);
      burger.setAttribute('aria-label', open ? 'Tutup menu' : 'Buka menu');
    });
    links.forEach(function (a) {
      a.addEventListener('click', function () {
        document.body.classList.remove('menu-open');
        burger.setAttribute('aria-expanded', 'false');
      });
    });

    var map = {};
    links.forEach(function (a) { map[a.getAttribute('href').slice(1)] = a; });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting && map[en.target.id]) {
          links.forEach(function (l) { l.classList.remove('active'); });
          map[en.target.id].classList.add('active');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    $$('main section[id]').forEach(function (s) { io.observe(s); });
  }

  /* ---------------- Hero: split name + typing ---------------- */
  function initSplit() {
    $$('[data-split]').forEach(function (el) {
      var text = el.textContent;
      el.textContent = '';
      el.setAttribute('aria-label', text);
      text.split('').forEach(function (c) {
        var s = document.createElement('span');
        s.className = 'ch';
        s.setAttribute('aria-hidden', 'true');
        s.textContent = c === ' ' ? ' ' : c;
        el.appendChild(s);
      });
    });
  }

  var typingStarted = false;
  function startTyping() {
    if (typingStarted) return;
    typingStarted = true;
    var el = $('#typed');
    if (!el) return;
    var roles = [
      'Full-Stack Web Developer',
      'Senior System Programmer',
      'Backend PHP & Laravel Engineer',
      'SQL Server · PostgreSQL · MySQL',
      'Middleware & Payment Gateway Integrator'
    ];
    if (reduce) { el.textContent = roles[0]; return; }
    var ri = 0, ci = 0, del = false;
    (function step() {
      var word = roles[ri];
      el.textContent = word.slice(0, ci);
      var delay = del ? 28 : 65;
      if (!del && ci === word.length) { del = true; delay = 1700; }
      else if (del && ci === 0) { del = false; ri = (ri + 1) % roles.length; delay = 350; }
      ci += del ? -1 : 1;
      setTimeout(step, delay);
    })();
  }

  /* ---------------- Scramble text ---------------- */
  function scramble(el) {
    var final = el.dataset.text || el.textContent;
    el.dataset.text = final;
    if (reduce) return;
    var chars = '!<>-_\\/[]{}=+*^?#01ABCDEF';
    var frame = 0;
    var total = final.length * 1.6 + 10;
    (function tick() {
      var out = '';
      for (var i = 0; i < final.length; i++) {
        if (frame > i * 1.6 + 4 || final[i] === ' ') out += final[i];
        else out += chars[(Math.random() * chars.length) | 0];
      }
      el.textContent = out;
      if (frame++ < total) requestAnimationFrame(tick);
      else el.textContent = final;
    })();
  }

  /* ---------------- Counters ---------------- */
  function countUp(el) {
    var target = +el.dataset.count;
    var suffix = el.dataset.suffix || '';
    if (reduce) { el.textContent = target + suffix; return; }
    var start = performance.now();
    (function tick(now) {
      var p = Math.min(1, (now - start) / 1400);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3))) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    })(start);
  }

  /* ---------------- Reveal on scroll ---------------- */
  function initReveal() {
    var items = $$('[data-reveal]');
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target;
        // stagger siblings
        var sibs = el.parentElement ? $$(':scope > [data-reveal]', el.parentElement) : [];
        var idx = Math.max(0, sibs.indexOf(el));
        el.style.transitionDelay = Math.min(idx * 0.08, 0.4) + 's';
        el.classList.add('in');
        if (el.hasAttribute('data-scramble')) scramble(el);
        $$('[data-count]', el).forEach(countUp);
        io.unobserve(el);
        setTimeout(function () { el.style.transitionDelay = ''; }, 1400);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    items.forEach(function (el) { io.observe(el); });
  }

  /* ---------------- 3D tilt + glow ---------------- */
  function initTilt() {
    if (!fine) return;
    $$('[data-tilt]').forEach(function (el) {
      var max = +el.dataset.tilt || 10;
      if (reduce) max = 0;
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width;
        var py = (e.clientY - r.top) / r.height;
        el.style.setProperty('--rx', ((0.5 - py) * max).toFixed(2) + 'deg');
        el.style.setProperty('--ry', ((px - 0.5) * max).toFixed(2) + 'deg');
        el.style.setProperty('--mx', (px * 100).toFixed(1) + '%');
        el.style.setProperty('--my', (py * 100).toFixed(1) + '%');
      });
      el.addEventListener('pointerleave', function () {
        el.style.setProperty('--rx', '0deg');
        el.style.setProperty('--ry', '0deg');
      });
    });
  }

  /* ---------------- Magnetic buttons ---------------- */
  function initMagnetic() {
    if (!fine || reduce) return;
    $$('[data-magnetic]').forEach(function (el) {
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        var x = e.clientX - r.left - r.width / 2;
        var y = e.clientY - r.top - r.height / 2;
        el.style.transform = 'translate(' + (x * 0.25) + 'px,' + (y * 0.35) + 'px)';
      });
      el.addEventListener('pointerleave', function () { el.style.transform = ''; });
    });
  }

  /* ---------------- Skill sphere ---------------- */
  function initSphere() {
    var wrap = $('#skillSphere');
    if (!wrap) return;
    var tags = $$('span', wrap);
    var n = tags.length;
    var pts = tags.map(function (el, i) {
      var phi = Math.acos(-1 + (2 * i + 1) / n);
      var theta = Math.sqrt(n * Math.PI) * phi;
      return { el: el, x: Math.cos(theta) * Math.sin(phi), y: Math.sin(theta) * Math.sin(phi), z: Math.cos(phi) };
    });
    var R = 0;
    function measure() { R = wrap.clientWidth * 0.4; }
    measure();
    window.addEventListener('resize', measure);

    var base = reduce ? 0.0008 : 0.004;
    var vx = base * 0.6, vy = base;
    var drag = false, lx = 0, ly = 0, hoverX = 0, hoverY = 0, visible = false, running = false;

    wrap.addEventListener('pointerdown', function (e) {
      drag = true; lx = e.clientX; ly = e.clientY;
      wrap.setPointerCapture(e.pointerId);
    });
    wrap.addEventListener('pointermove', function (e) {
      var r = wrap.getBoundingClientRect();
      if (drag) {
        vy = (e.clientX - lx) * 0.004;
        vx = -(e.clientY - ly) * 0.004;
        lx = e.clientX; ly = e.clientY;
      } else if (fine) {
        hoverX = ((e.clientX - r.left) / r.width - 0.5) * 0.02;
        hoverY = ((e.clientY - r.top) / r.height - 0.5) * 0.02;
      }
    });
    function end() { drag = false; }
    wrap.addEventListener('pointerup', end);
    wrap.addEventListener('pointercancel', end);
    wrap.addEventListener('pointerleave', function () { hoverX = hoverY = 0; });

    function render() {
      if (!visible) { running = false; return; }
      if (!drag) {
        var tx = hoverX ? -hoverY : base * 0.6;
        var ty = hoverX ? hoverX : base;
        vx += (tx - vx) * 0.04;
        vy += (ty - vy) * 0.04;
      }
      var cy = Math.cos(vy), sy = Math.sin(vy), cx = Math.cos(vx), sx = Math.sin(vx);
      for (var i = 0; i < n; i++) {
        var p = pts[i];
        var x1 = p.x * cy + p.z * sy;
        var z1 = -p.x * sy + p.z * cy;
        var y1 = p.y * cx - z1 * sx;
        var z2 = p.y * sx + z1 * cx;
        p.x = x1; p.y = y1; p.z = z2;
        var s = 0.6 + (z2 + 1) * 0.35;
        p.el.style.transform = 'translate(-50%,-50%) translate3d(' + (x1 * R).toFixed(1) + 'px,' + (y1 * R).toFixed(1) + 'px,0) scale(' + s.toFixed(3) + ')';
        p.el.style.opacity = (0.2 + 0.8 * (z2 + 1) / 2).toFixed(3);
        p.el.style.zIndex = Math.round((z2 + 1) * 50);
      }
      requestAnimationFrame(render);
    }
    new IntersectionObserver(function (en) {
      visible = en[0].isIntersecting;
      if (visible && !running) { running = true; requestAnimationFrame(render); }
    }).observe(wrap);
  }

  /* ---------------- Timeline progress ---------------- */
  function initTimeline() {
    var tl = $('.timeline');
    if (!tl) return;
    function update() {
      var r = tl.getBoundingClientRect();
      var p = (innerHeight * 0.65 - r.top) / r.height;
      tl.style.setProperty('--progress', Math.max(0, Math.min(1, p)).toFixed(3));
    }
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
  }

  /* ---------------- Cert flip on tap ---------------- */
  function initCerts() {
    $$('.cert').forEach(function (c) {
      c.addEventListener('click', function () { if (!fine) c.classList.toggle('flip'); });
      c.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); c.classList.toggle('flip'); }
      });
    });
  }

  /* ---------------- Toast + copy email ---------------- */
  var toastTimer;
  function toast(msg) {
    var t = $('.toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove('show'); }, 2200);
  }
  var EMAIL = 'yudhazaldi.nuki@gmail.com';
  function copyEmail() {
    function fallback() {
      var ta = document.createElement('textarea');
      ta.value = EMAIL; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); } catch (e) { /* ignore */ }
      ta.remove();
    }
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(EMAIL).catch(fallback);
    } else fallback();
    toast('✔ Email disalin: ' + EMAIL);
  }
  function initCopy() {
    $$('.copy-email').forEach(function (b) { b.addEventListener('click', copyEmail); });
  }

  /* ---------------- FX canvas: confetti + matrix ---------------- */
  var fx = $('#fx');
  var ctx = fx.getContext('2d');
  var fxMode = null, fxRaf = 0, particles = [], drops = [], fxEnd = 0;

  function sizeFx() {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    fx.width = innerWidth * dpr; fx.height = innerHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  sizeFx();
  window.addEventListener('resize', sizeFx);

  function confetti(x, y, count) {
    if (reduce) return;
    var colors = ['#22d3ee', '#8b5cf6', '#f472b6', '#4ade80', '#fde047'];
    x = x == null ? innerWidth / 2 : x;
    y = y == null ? innerHeight / 2 : y;
    for (var i = 0; i < (count || 140); i++) {
      var a = Math.random() * Math.PI * 2;
      var v = 4 + Math.random() * 9;
      particles.push({
        x: x, y: y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 6,
        w: 6 + Math.random() * 6, h: 3 + Math.random() * 4,
        r: Math.random() * Math.PI, vr: (Math.random() - 0.5) * 0.3,
        c: colors[(Math.random() * colors.length) | 0], life: 1
      });
    }
    if (fxMode !== 'matrix') { fxMode = 'confetti'; startFx(); }
  }

  function matrix(ms) {
    if (reduce) { toast('Wake up, Neo… 🐇'); return; }
    var cols = Math.ceil(innerWidth / 16);
    drops = [];
    for (var i = 0; i < cols; i++) drops.push(Math.random() * -60);
    fxMode = 'matrix';
    fxEnd = performance.now() + (ms || 7000);
    fx.classList.add('active');
    toast('Wake up, Neo… (klik / Esc untuk keluar)');
    startFx();
  }
  function stopMatrix() {
    if (fxMode !== 'matrix') return;
    fxEnd = 0;
  }
  fx.addEventListener('click', stopMatrix);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') stopMatrix(); });

  function startFx() {
    if (fxRaf) return;
    fxRaf = requestAnimationFrame(fxFrame);
  }
  function fxFrame(now) {
    var W = innerWidth, H = innerHeight;
    if (fxMode === 'matrix') {
      if (now > fxEnd) {
        ctx.clearRect(0, 0, W, H);
        fx.classList.remove('active');
        fxMode = particles.length ? 'confetti' : null;
        if (!fxMode) { fxRaf = 0; return; }
      } else {
        ctx.fillStyle = 'rgba(7,8,13,0.12)';
        ctx.fillRect(0, 0, W, H);
        ctx.font = '15px JetBrains Mono, monospace';
        var glyphs = 'アイウエオカキクケコサシスセソ01PHPSQL<>{}$#';
        for (var i = 0; i < drops.length; i++) {
          var ch = glyphs[(Math.random() * glyphs.length) | 0];
          var y = drops[i] * 16;
          ctx.fillStyle = Math.random() > 0.96 ? '#ffffff' : (i % 7 === 0 ? '#22d3ee' : '#4ade80');
          ctx.fillText(ch, i * 16, y);
          if (y > H && Math.random() > 0.975) drops[i] = 0;
          drops[i] += 1;
        }
        fxRaf = requestAnimationFrame(fxFrame);
        return;
      }
    }
    // confetti
    ctx.clearRect(0, 0, W, H);
    for (var j = particles.length - 1; j >= 0; j--) {
      var p = particles[j];
      p.vy += 0.28; p.vx *= 0.99; p.vy *= 0.99;
      p.x += p.vx; p.y += p.vy; p.r += p.vr; p.life -= 0.006;
      if (p.life <= 0 || p.y > H + 40) { particles.splice(j, 1); continue; }
      ctx.save();
      ctx.globalAlpha = Math.max(0, Math.min(1, p.life * 1.5));
      ctx.translate(p.x, p.y); ctx.rotate(p.r);
      ctx.fillStyle = p.c;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    }
    if (particles.length) fxRaf = requestAnimationFrame(fxFrame);
    else { fxRaf = 0; fxMode = null; ctx.clearRect(0, 0, W, H); }
  }

  /* ---------------- Konami code ---------------- */
  function initKonami() {
    var seq = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
    var pos = 0;
    document.addEventListener('keydown', function (e) {
      if (e.target.tagName === 'INPUT') return;
      var k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      pos = k === seq[pos] ? pos + 1 : (k === seq[0] ? 1 : 0);
      if (pos === seq.length) { pos = 0; matrix(8000); }
    });
  }

  /* ---------------- Hero core pulse → confetti ---------------- */
  var pulses = 0;
  document.addEventListener('core:pulse', function () {
    pulses++;
    if (pulses === 5) { confetti(null, innerHeight * 0.45, 180); toast('🎉 Kamu menemukan easter egg! 5x klik inti 3D'); }
  });

  /* ---------------- Logo click spin ---------------- */
  function initLogo() {
    var logo = $('.logo');
    var clicks = 0, timer;
    logo.addEventListener('click', function (e) {
      clicks++;
      clearTimeout(timer);
      timer = setTimeout(function () { clicks = 0; }, 900);
      if (clicks >= 3) {
        e.preventDefault();
        clicks = 0;
        var r = logo.getBoundingClientRect();
        confetti(r.left + r.width / 2, r.top + r.height / 2, 90);
      }
    });
  }

  /* ---------------- Terminal ---------------- */
  function initTerminal() {
    var body = $('#termBody'), out = $('#termOut'), input = $('#termInput');
    if (!body) return;
    var hist = [], hi = 0;
    function esc(s) { return s.replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
    function print(html) {
      var p = document.createElement('p');
      p.innerHTML = html;
      out.appendChild(p);
      body.scrollTop = body.scrollHeight;
    }
    function goTo(id) {
      var el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
    }
    var sections = { about: 'about', skills: 'skills', experience: 'experience', projects: 'projects', education: 'education', contact: 'contact', home: 'top' };

    var cmds = {
      help: function () {
        return [
          '<span class="t-y">Perintah tersedia:</span>',
          '  <span class="t-c">whoami</span>        siapa saya',
          '  <span class="t-c">about</span>         ringkasan profesional',
          '  <span class="t-c">skills</span>        keahlian teknis',
          '  <span class="t-c">experience</span>    pengalaman kerja',
          '  <span class="t-c">projects</span>      sistem yang pernah dibangun',
          '  <span class="t-c">education</span>     pendidikan',
          '  <span class="t-c">certs</span>         sertifikasi',
          '  <span class="t-c">contact</span>       cara menghubungi saya',
          '  <span class="t-c">ls</span> / <span class="t-c">cd &lt;section&gt;</span>   navigasi halaman',
          '  <span class="t-c">sudo hire-me</span>  🚀',
          '  <span class="t-c">matrix</span>  <span class="t-c">coffee</span>  <span class="t-c">date</span>  <span class="t-c">echo</span>  <span class="t-c">clear</span>',
          '<span class="t-m">Tips: ↑/↓ untuk riwayat, Tab untuk autocomplete.</span>'
        ].join('\n');
      },
      whoami: function () {
        return '<span class="t-p">Yudhazaldi Nuki Putrasadi</span>\nFull-Stack Web Developer | Senior System Programmer\n<span class="t-m">📍 Bekasi, Jawa Barat</span>';
      },
      about: function () {
        return 'Full-Stack Web Developer & System Programmer dengan <span class="t-y">8+ tahun</span> pengalaman\nmembangun sistem enterprise di industri <span class="t-c">asuransi</span> dan <span class="t-c">logistik</span>.\nSpesialis backend PHP, middleware, payment gateway, dan database enterprise.';
      },
      skills: function () {
        return [
          '<span class="t-v">backend </span> PHP (Native/OOP/MVC), CodeIgniter 3 & 4, Laravel, REST API, Middleware',
          '<span class="t-v">database</span> SQL Server, PostgreSQL, MySQL — SP, Trigger, Views, Query Optimization',
          '<span class="t-v">frontend</span> HTML5, CSS3, JavaScript, jQuery, Bootstrap',
          '<span class="t-v">mobile  </span> Android Studio (Java), Payment Gateway & Third-Party API',
          '<span class="t-v">tools   </span> Git, Postman, Apache, Nginx, Linux & Windows Server'
        ].join('\n');
      },
      experience: function () {
        return [
          '<span class="t-g">●</span> <span class="t-p">PT. Asuransi Intra Asia</span>  <span class="t-m">Agu 2022 – Agu 2025</span>',
          '  Programmer System / Full-Stack Developer',
          '  core insurance · middleware · payment gateway · surety bond · reporting',
          '<span class="t-g">●</span> <span class="t-p">PT. Dunia Express Transindo</span>  <span class="t-m">Okt 2020 – Nov 2021</span>',
          '  Programmer System / Web Developer',
          '  warehouse · trucking · P2H · portal internal'
        ].join('\n');
      },
      projects: function () {
        return [
          '01 Core Insurance System', '02 Middleware Core Sync', '03 Payment Gateway Integration',
          '04 Surety Bond & Reporting', '05 Warehouse & Trucking', '06 Portal Internal', '07 Posyandu Digital (Android)'
        ].map(function (s) { return '<span class="t-c">' + s.slice(0, 2) + '</span>' + s.slice(2); }).join('\n');
      },
      education: function () {
        return 'S1 Teknik Informatika — Universitas Mohammad Husni Thamrin <span class="t-m">(2018–2020)</span>\nD3 Teknik Informatika — LP3I Jakarta, Kampus Bekasi <span class="t-m">(2014–2017)</span>';
      },
      certs: function () {
        return '🏅 Junior Programming TIK — BNSP <span class="t-m">2016</span>\n🎖️ Pemrograman Database & Web Design — LSP LP3I <span class="t-m">2016</span>\n💻 Operator Komputer — BNSP <span class="t-m">2016</span>';
      },
      contact: function () {
        return '✉  <a class="t-c" href="mailto:yudhazaldi.nuki@gmail.com">yudhazaldi.nuki@gmail.com</a>\n' +
          '💬 <a class="t-c" href="https://wa.me/6285692143641" target="_blank" rel="noopener">+62 856-9214-3641</a>\n' +
          'in <a class="t-c" href="https://linkedin.com/in/yudhazaldi-nuki" target="_blank" rel="noopener">linkedin.com/in/yudhazaldi-nuki</a>\n' +
          '◎  <a class="t-c" href="https://instagram.com/Yuzanups" target="_blank" rel="noopener">@Yuzanups</a>\n' +
          '&lt;/&gt; <a class="t-c" href="https://github.com/yudhazaldinuki-stack/profile" target="_blank" rel="noopener">github.com/yudhazaldinuki-stack/profile</a>';
      },
      ls: function () {
        return Object.keys(sections).map(function (s) { return '<span class="t-v">' + s + '/</span>'; }).join('  ');
      },
      cd: function (arg) {
        arg = (arg || '').replace(/\/$/, '');
        if (!arg || arg === '~') return '<span class="t-m">sudah di ~</span>';
        if (!sections[arg]) return 'cd: ' + esc(arg) + ': direktori tidak ditemukan. Coba <span class="t-c">ls</span>';
        setTimeout(function () { goTo(sections[arg]); }, 250);
        return '<span class="t-g">→</span> menuju ' + arg + '…';
      },
      sudo: function (arg) {
        if (arg === 'hire-me' || arg === 'hire me') {
          setTimeout(function () { confetti(null, innerHeight * 0.4, 200); }, 400);
          setTimeout(function () { goTo('contact'); }, 1600);
          return '[sudo] password untuk visitor: ********\n<span class="t-g">✔ Akses diberikan.</span> Menyiapkan kontrak… 📄\n<span class="t-y">Terima kasih! Mengarahkan ke kontak…</span>';
        }
        if (/^rm\s+-rf/.test(arg || '')) return '<span class="t-p">Nice try 😏</span> sistem ini dijaga 24 jam.';
        return '<span class="t-m">visitor tidak ada di sudoers. Insiden ini akan dilaporkan. 😄 Coba</span> <span class="t-c">sudo hire-me</span>';
      },
      rm: function () { return '<span class="t-p">Nice try 😏</span> sistem ini dijaga 24 jam.'; },
      matrix: function () { setTimeout(function () { matrix(7000); }, 200); return '<span class="t-g">Follow the white rabbit… 🐇</span>'; },
      coffee: function () {
        return '<span class="t-y">      ( (\n       ) )\n    ........\n    |      |]\n    \\      /\n     `----\'</span>\nKopi siap. Saatnya ngoding ☕';
      },
      date: function () {
        return new Date().toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'medium' });
      },
      echo: function (arg) { return esc(arg || ''); },
      clear: function () { out.innerHTML = ''; return null; },
      hello: function () { return 'Halo juga! 👋 Ketik <span class="t-c">help</span> untuk mulai.'; },
      exit: function () { return '<span class="t-m">Tidak ada jalan keluar… kecuali </span><span class="t-c">sudo hire-me</span> 😉'; }
    };
    cmds.hi = cmds.hello; cmds.halo = cmds.hello; cmds.cls = cmds.clear; cmds.kontak = cmds.contact;

    function run(raw) {
      var parts = raw.trim().split(/\s+/);
      var name = parts.shift().toLowerCase();
      var arg = parts.join(' ');
      var fn = cmds[name];
      var res = fn ? fn(arg) : 'command not found: <span class="t-p">' + esc(name) + '</span>. Ketik <span class="t-c">help</span>.';
      if (res) print(res);
    }
    function submit(v) {
      print('<span class="t-prompt">visitor@yudha:~$</span> ' + esc(v));
      if (v.trim()) { hist.push(v); hi = hist.length; run(v); }
    }

    print('<span class="t-g">Selamat datang di yudha-os v8.0</span> <span class="t-m">(8+ tahun uptime)</span>');
    print('Ketik <span class="t-c">help</span> untuk melihat perintah. Coba juga <span class="t-c">sudo hire-me</span> 😉\n ');

    body.addEventListener('click', function (e) {
      if (e.target.tagName !== 'A' && !window.getSelection().toString()) input.focus({ preventScroll: true });
    });
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        submit(input.value);
        input.value = '';
      } else if (e.key === 'ArrowUp') {
        if (hi > 0) { hi--; input.value = hist[hi]; }
        e.preventDefault();
      } else if (e.key === 'ArrowDown') {
        if (hi < hist.length - 1) { hi++; input.value = hist[hi]; } else { hi = hist.length; input.value = ''; }
        e.preventDefault();
      } else if (e.key === 'Tab') {
        e.preventDefault();
        var v = input.value.toLowerCase();
        if (!v) return;
        var m = Object.keys(cmds).filter(function (k) { return k.indexOf(v) === 0; });
        if (m.length === 1) input.value = m[0] + ' ';
        else if (m.length > 1) print('<span class="t-m">' + m.join('  ') + '</span>');
      } else if (e.key === 'l' && e.ctrlKey) {
        e.preventDefault(); out.innerHTML = '';
      }
    });
    $$('[data-cmd]').forEach(function (b) {
      b.addEventListener('click', function () { submit(b.dataset.cmd); });
    });
  }

  /* ---------------- Console greeting ---------------- */
  function hello() {
    try {
      console.log('%c YN. ', 'background:linear-gradient(90deg,#22d3ee,#8b5cf6,#f472b6);color:#07080d;font:700 28px monospace;padding:6px 12px;border-radius:8px');
      console.log('%cHalo, developer! 👋 Suka mengintip source code? Kita pasti cocok.\n✉ yudhazaldi.nuki@gmail.com', 'color:#22d3ee;font:14px monospace');
    } catch (e) { /* ignore */ }
  }

  /* ---------------- Boot ---------------- */
  var y = $('#year'); if (y) y.textContent = new Date().getFullYear();
  initSplit();
  initLoader();
  initCursor();
  initNav();
  initReveal();
  initTilt();
  initMagnetic();
  initSphere();
  initTimeline();
  initCerts();
  initCopy();
  initKonami();
  initLogo();
  initTerminal();
  hello();
})();
