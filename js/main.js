(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Scroll reveal ---------- */
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  document.querySelectorAll('[data-reveal]').forEach(function (el, i) {
    el.style.transitionDelay = ((i % 3) * 90) + 'ms';
    io.observe(el);
  });
  document.querySelectorAll('[data-title]').forEach(function (el) {
    io.observe(el);
  });
  /* Safety: reveal any title still hidden after load (e.g. above the fold) */
  setTimeout(function () {
    document.querySelectorAll('[data-title]:not(.in)').forEach(function (el) {
      if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add('in');
    });
  }, 400);

  /* ---------- Header scroll state + progress bar ---------- */
  var header = document.getElementById('header');
  var progress = document.getElementById('progress');
  function onScroll() {
    header.classList.toggle('scrolled', window.scrollY > 12);
    var h = document.documentElement;
    var max = (h.scrollHeight - h.clientHeight) || 1;
    progress.style.width = Math.min(100, (window.scrollY / max) * 100) + '%';
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- Mobile drawer ---------- */
  var menuBtn = document.getElementById('menu-btn');
  var drawer = document.getElementById('drawer');
  var scrim = document.getElementById('scrim');
  var closeBtn = document.getElementById('drawer-close');
  var open = false;

  function setMenu(o) {
    open = o;
    drawer.classList.toggle('open', o);
    scrim.classList.toggle('open', o);
    menuBtn.setAttribute('data-open', o ? '1' : '0');
    menuBtn.setAttribute('aria-expanded', o ? 'true' : 'false');
    document.body.style.overflow = o ? 'hidden' : '';
  }
  menuBtn.addEventListener('click', function () { setMenu(!open); });
  scrim.addEventListener('click', function () { setMenu(false); });
  closeBtn.addEventListener('click', function () { setMenu(false); });
  drawer.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', function () { setMenu(false); });
  });

  /* ---------- Hero carousel dots (mobile) ---------- */
  var collage = document.getElementById('collage');
  var dotsWrap = document.getElementById('collage-dots');
  if (collage && dotsWrap) {
    var tiles = collage.querySelectorAll('.tile');
    tiles.forEach(function (tile, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('aria-label', 'Show image ' + (i + 1));
      b.addEventListener('click', function () {
        collage.scrollTo({
          left: tile.offsetLeft - tiles[0].offsetLeft,
          behavior: reduce ? 'auto' : 'smooth'
        });
      });
      dotsWrap.appendChild(b);
    });
    var dots = dotsWrap.querySelectorAll('button');
    var syncDots = function () {
      var step = tiles.length > 1
        ? (tiles[1].offsetLeft - tiles[0].offsetLeft)
        : collage.clientWidth;
      var i = Math.round(collage.scrollLeft / (step || 1));
      i = Math.max(0, Math.min(tiles.length - 1, i));
      dots.forEach(function (d, j) { d.classList.toggle('active', j === i); });
    };
    syncDots();
    collage.addEventListener('scroll', function () { requestAnimationFrame(syncDots); }, { passive: true });
    window.addEventListener('resize', syncDots);
  }

  /* ---------- Before/After sliders ---------- */
  document.querySelectorAll('[data-ba]').forEach(function (wrap) {
    var top = wrap.querySelector('[data-ba-top]');
    var handle = wrap.querySelector('[data-ba-handle]');
    if (!top || !handle) return;
    var drag = false;

    function set(p) {
      p = Math.max(2, Math.min(98, p));
      top.style.clipPath = 'inset(0 ' + (100 - p) + '% 0 0)';
      handle.style.left = p + '%';
    }
    function move(e) {
      var r = wrap.getBoundingClientRect();
      var cx = e.touches ? e.touches[0].clientX : e.clientX;
      set(((cx - r.left) / r.width) * 100);
    }
    var startX = 0, startY = 0, pending = false;

    wrap.addEventListener('pointerdown', function (e) {
      if (e.pointerType === 'touch') {
        /* Direction lock: don't grab the slider until the gesture is
           clearly horizontal, so vertical swipes scroll the page. */
        pending = true;
        startX = e.clientX;
        startY = e.clientY;
      } else {
        drag = true;
        try { wrap.setPointerCapture(e.pointerId); } catch (_) {}
        move(e);
      }
    });
    wrap.addEventListener('pointermove', function (e) {
      if (pending) {
        var dx = Math.abs(e.clientX - startX);
        var dy = Math.abs(e.clientY - startY);
        if (dx > 8 && dx > dy) {
          pending = false;
          drag = true;
          try { wrap.setPointerCapture(e.pointerId); } catch (_) {}
        } else if (dy > 8) {
          pending = false;
          return;
        }
      }
      if (drag) move(e);
    });
    wrap.addEventListener('pointerup', function (e) {
      /* A simple tap (no direction decided) still moves the slider. */
      if (pending) move(e);
      pending = false;
      drag = false;
    });
    wrap.addEventListener('pointercancel', function () { pending = false; drag = false; });
    set(50);
  });

  /* ---------- Hero parallax glows ---------- */
  var hero = document.getElementById('home');
  if (hero && !reduce) {
    var px = hero.querySelectorAll('[data-parallax]');
    hero.addEventListener('pointermove', function (e) {
      var r = hero.getBoundingClientRect();
      var mx = (e.clientX - r.left) / r.width - 0.5;
      var my = (e.clientY - r.top) / r.height - 0.5;
      px.forEach(function (el) {
        var d = parseFloat(el.getAttribute('data-parallax')) || 0;
        el.style.transform = 'translate(' + (mx * d) + 'px,' + (my * d) + 'px)';
      });
    });
    hero.addEventListener('pointerleave', function () {
      px.forEach(function (el) { el.style.transform = 'translate(0,0)'; });
    });
  }

  /* ---------- Magnetic CTA ---------- */
  if (!reduce) {
    document.querySelectorAll('[data-magnetic]').forEach(function (btn) {
      btn.addEventListener('pointermove', function (e) {
        var r = btn.getBoundingClientRect();
        btn.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * 0.3) + 'px,' + ((e.clientY - r.top - r.height / 2) * 0.5) + 'px)';
      });
      btn.addEventListener('pointerleave', function () {
        btn.style.transform = 'translate(0,0)';
      });
    });
  }

  /* ---------- Count-up stats ---------- */
  document.querySelectorAll('[data-count]').forEach(function (el) {
    var target = parseInt(el.getAttribute('data-count'), 10) || 0;
    var suf = el.getAttribute('data-suffix') || '';
    if (reduce) { el.textContent = target + suf; return; }
    var cio = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var s = null;
        var dur = 1300;
        function step(t) {
          if (!s) s = t;
          var p = Math.min((t - s) / dur, 1);
          el.textContent = Math.round((1 - Math.pow(1 - p, 3)) * target) + suf;
          if (p < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
        cio.unobserve(e.target);
      });
    }, { threshold: 0.6 });
    cio.observe(el);
  });

  /* ---------- FAQ accordion (single-open) ---------- */
  var items = Array.prototype.slice.call(document.querySelectorAll('[data-faq-item]'));
  items.forEach(function (item) {
    var btn = item.querySelector('[data-faq-btn]');
    var panel = item.querySelector('[data-faq-panel]');
    btn.addEventListener('click', function () {
      var wasOpen = item.getAttribute('data-open') === '1';
      items.forEach(function (o) {
        o.setAttribute('data-open', '0');
        o.querySelector('[data-faq-btn]').setAttribute('aria-expanded', 'false');
        o.querySelector('[data-faq-panel]').style.maxHeight = '0px';
        o.querySelector('[data-faq-panel]').style.opacity = '0';
      });
      if (!wasOpen) {
        item.setAttribute('data-open', '1');
        btn.setAttribute('aria-expanded', 'true');
        panel.style.maxHeight = panel.scrollHeight + 'px';
        panel.style.opacity = '1';
      }
    });
  });
  window.addEventListener('resize', function () {
    items.forEach(function (item) {
      if (item.getAttribute('data-open') !== '1') return;
      var panel = item.querySelector('[data-faq-panel]');
      panel.style.maxHeight = panel.scrollHeight + 'px';
    });
  });
})();
