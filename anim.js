/* =========================================================
   anim.js — motion and interaction layer.

   Every module here is additive: if it never runs, the page is
   still complete and readable. Everything checks
   prefers-reduced-motion before animating, and anything that
   moves with the pointer is skipped on coarse-pointer devices.
   ========================================================= */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(pointer: fine)').matches;
  var on = function (el, ev, fn, opts) { el.addEventListener(ev, fn, opts || { passive: true }); };
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ---------------------------------------------------------
     Preloader — dismissed on load, and on a timeout so a slow
     font or image can never leave a visitor staring at it.
     --------------------------------------------------------- */
  (function preloader() {
    var el = $('#preload');
    if (!el) return;
    var done = false;
    var finish = function () {
      if (done) return;
      done = true;
      el.classList.add('gone');
      document.documentElement.classList.add('loaded');
      setTimeout(function () { el.remove(); }, 700);
    };
    if (document.readyState === 'complete') setTimeout(finish, 260);
    else on(window, 'load', function () { setTimeout(finish, 260); });
    setTimeout(finish, 2600);
  })();

  /* ---------------------------------------------------------
     Scroll progress bar
     --------------------------------------------------------- */
  (function scrollProgress() {
    var bar = $('#scrollbar');
    if (!bar) return;
    var tick = function () {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.transform = 'scaleX(' + (h > 0 ? Math.min(1, window.scrollY / h) : 0) + ')';
    };
    tick();
    on(window, 'scroll', tick);
    on(window, 'resize', tick);
  })();

  /* ---------------------------------------------------------
     Split the hero headline into words and stagger them in.
     --------------------------------------------------------- */
  (function splitHeadline() {
    var h = $('[data-split]');
    if (!h) return;
    if (reduced) { h.classList.add('split-in'); return; }

    var walk = function (node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (child) {
        if (child.nodeType === 3) {
          var frag = document.createDocumentFragment();
          child.nodeValue.split(/(\s+)/).forEach(function (chunk) {
            if (!chunk) return;
            if (/^\s+$/.test(chunk)) { frag.appendChild(document.createTextNode(chunk)); return; }
            var w = document.createElement('span');
            w.className = 'word';
            var i = document.createElement('span');
            i.className = 'word-i';
            i.textContent = chunk;
            w.appendChild(i);
            frag.appendChild(w);
          });
          node.replaceChild(frag, child);
        } else if (child.nodeType === 1 && child.tagName !== 'BR') {
          walk(child);
        }
      });
    };
    walk(h);
    $$('.word-i', h).forEach(function (w, i) {
      w.style.transitionDelay = (i * 62) + 'ms';
    });
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { h.classList.add('split-in'); });
    });
  })();

  /* ---------------------------------------------------------
     Terminal typing line. Cycles through data-lines, and stops
     dead (showing the first line) under reduced motion.
     --------------------------------------------------------- */
  (function terminal() {
    var el = $('[data-term]');
    if (!el) return;
    var lines;
    try { lines = JSON.parse(el.getAttribute('data-term')); } catch (e) { return; }
    if (!lines || !lines.length) return;

    var out = $('.term-out', el) || el;
    if (reduced) { out.textContent = lines[0]; return; }

    var li = 0, ci = 0, dir = 1;
    var step = function () {
      var text = lines[li];
      ci += dir;
      out.textContent = text.slice(0, ci);
      if (dir > 0 && ci >= text.length) {
        dir = -1;
        return setTimeout(step, 2100);
      }
      if (dir < 0 && ci <= 0) {
        dir = 1;
        li = (li + 1) % lines.length;
        return setTimeout(step, 420);
      }
      setTimeout(step, dir > 0 ? 52 + Math.random() * 46 : 26);
    };
    setTimeout(step, 900);
  })();

  /* ---------------------------------------------------------
     Count-up stats. Parses "675+" / "50%" / "5+" and keeps the
     suffix, so the markup stays the source of truth.
     --------------------------------------------------------- */
  (function counters() {
    var nodes = $$('[data-count]');
    if (!nodes.length) return;

    var run = function (el) {
      var raw = el.getAttribute('data-count');
      var m = raw.match(/^(\d+(?:\.\d+)?)(.*)$/);
      if (!m) { el.textContent = raw; return; }
      var target = parseFloat(m[1]);
      var suffix = m[2] || '';
      if (reduced) { el.textContent = raw; return; }

      var start = performance.now();
      var dur = 1150;
      var frame = function (now) {
        var t = Math.min(1, (now - start) / dur);
        var eased = 1 - Math.pow(1 - t, 3);
        var v = target * eased;
        el.textContent = (target % 1 ? v.toFixed(1) : Math.round(v)) + suffix;
        if (t < 1) requestAnimationFrame(frame);
      };
      el.textContent = '0' + suffix;
      requestAnimationFrame(frame);
    };

    if (!('IntersectionObserver' in window)) { nodes.forEach(run); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        run(e.target);
        io.unobserve(e.target);
      });
    }, { threshold: 0.5 });
    nodes.forEach(function (n) { io.observe(n); });
  })();

  /* ---------------------------------------------------------
     Magnetic buttons — a few pixels of pull, nothing more.
     --------------------------------------------------------- */
  (function magnetic() {
    if (!fine || reduced) return;
    $$('[data-magnet]').forEach(function (el) {
      var raf = null, x = 0, y = 0;
      on(el, 'pointermove', function (e) {
        var r = el.getBoundingClientRect();
        x = (e.clientX - (r.left + r.width / 2)) * 0.22;
        y = (e.clientY - (r.top + r.height / 2)) * 0.3;
        if (raf) return;
        raf = requestAnimationFrame(function () {
          raf = null;
          el.style.setProperty('--tx', x.toFixed(1) + 'px');
          el.style.setProperty('--ty', y.toFixed(1) + 'px');
        });
      });
      on(el, 'pointerleave', function () {
        el.style.setProperty('--tx', '0px');
        el.style.setProperty('--ty', '0px');
      });
    });
  })();

  /* ---------------------------------------------------------
     Back to top
     --------------------------------------------------------- */
  (function backToTop() {
    var btn = $('#toTop');
    if (!btn) return;
    on(window, 'scroll', function () {
      btn.classList.toggle('show', window.scrollY > 700);
    });
    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
    });
  })();

  /* ---------------------------------------------------------
     Toasts
     --------------------------------------------------------- */
  var toast = function (msg) {
    var host = $('#toasts');
    if (!host) return;
    var t = document.createElement('div');
    t.className = 'toast';
    t.textContent = msg;
    host.appendChild(t);
    requestAnimationFrame(function () { t.classList.add('in'); });
    setTimeout(function () {
      t.classList.remove('in');
      setTimeout(function () { t.remove(); }, 320);
    }, 2200);
  };
  window.toast = toast;

  /* ---------------------------------------------------------
     Command palette (⌘K / Ctrl-K). Sections, pages and posts,
     filtered by a forgiving subsequence match.
     --------------------------------------------------------- */
  (function palette() {
    var root = $('#palette');
    if (!root) return;
    var input = $('#palInput', root);
    var list = $('#palList', root);
    var items = [];
    var filtered = [];
    var cursor = 0;

    $$('[data-pal]').forEach(function (el) {
      items.push({
        label: el.getAttribute('data-pal'),
        hint: el.getAttribute('data-pal-hint') || '',
        href: el.getAttribute('href'),
        kind: el.getAttribute('data-pal-kind') || 'Go to',
      });
    });

    fetch('/posts/index.json')
      .then(function (r) { return r.json(); })
      .then(function (posts) {
        posts.filter(function (p) { return !p.draft; }).forEach(function (p) {
          items.push({
            label: p.title,
            hint: p.tag || 'Post',
            href: '/post.html?p=' + encodeURIComponent(p.slug),
            kind: 'Read',
          });
        });
      })
      .catch(function () {});

    // Subsequence match, so "jwtv" finds "JWT verification".
    var score = function (item, q) {
      if (!q) return 0;
      var hay = (item.label + ' ' + item.hint + ' ' + item.kind).toLowerCase();
      var qi = 0, hits = 0, last = -1;
      for (var i = 0; i < hay.length && qi < q.length; i++) {
        if (hay[i] === q[qi]) {
          hits += last === i - 1 ? 2 : 1;
          last = i;
          qi++;
        }
      }
      return qi === q.length ? hits : -1;
    };

    var draw = function () {
      list.innerHTML = filtered.length
        ? filtered.map(function (it, i) {
            return '<li><button class="pal-item' + (i === cursor ? ' on' : '') + '" data-i="' + i + '">' +
              '<span class="pal-kind">' + window.esc(it.kind) + '</span>' +
              '<span class="pal-label">' + window.esc(it.label) + '</span>' +
              (it.hint ? '<span class="pal-hint">' + window.esc(it.hint) + '</span>' : '') +
            '</button></li>';
          }).join('')
        : '<li class="pal-empty">Nothing matches that.</li>';
      var onEl = $('.pal-item.on', list);
      if (onEl) onEl.scrollIntoView({ block: 'nearest' });
    };

    var refresh = function () {
      var q = input.value.trim().toLowerCase();
      filtered = q
        ? items.map(function (it) { return { it: it, s: score(it, q) }; })
            .filter(function (r) { return r.s >= 0; })
            .sort(function (a, b) { return b.s - a.s; })
            .map(function (r) { return r.it; })
        : items.slice();
      cursor = 0;
      draw();
    };

    var open = function () {
      root.classList.add('open');
      root.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      input.value = '';
      refresh();
      // The dialog is still visibility:hidden on the frame the class lands,
      // and a hidden element can't take focus — wait for it to be painted.
      requestAnimationFrame(function () {
        requestAnimationFrame(function () { input.focus({ preventScroll: true }); });
      });
      setTimeout(function () { input.focus({ preventScroll: true }); }, 90);
    };
    var close = function () {
      root.classList.remove('open');
      root.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    };

    var go = function (item) {
      if (!item) return;
      close();
      if (item.href.charAt(0) === '#') {
        var target = document.querySelector(item.href);
        if (target) {
          target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
          history.replaceState(null, '', item.href);
          return;
        }
      }
      location.href = item.href;
    };

    document.addEventListener('keydown', function (e) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        return root.classList.contains('open') ? close() : open();
      }
      if (!root.classList.contains('open')) {
        // "/" opens search, unless the visitor is typing somewhere.
        if (e.key === '/' && !/^(INPUT|TEXTAREA)$/.test(document.activeElement.tagName)) {
          e.preventDefault();
          open();
        }
        return;
      }
      if (e.key === 'Escape') { e.preventDefault(); return close(); }
      if (e.key === 'ArrowDown') { e.preventDefault(); cursor = Math.min(filtered.length - 1, cursor + 1); return draw(); }
      if (e.key === 'ArrowUp') { e.preventDefault(); cursor = Math.max(0, cursor - 1); return draw(); }
      if (e.key === 'Enter') { e.preventDefault(); return go(filtered[cursor]); }
    });

    on(input, 'input', refresh);
    list.addEventListener('click', function (e) {
      var btn = e.target.closest('.pal-item');
      if (btn) go(filtered[+btn.dataset.i]);
    });
    root.addEventListener('click', function (e) { if (e.target === root) close(); });
    $$('[data-pal-open]').forEach(function (b) { b.addEventListener('click', open); });
  })();

  /* ---------------------------------------------------------
     Marquee: duplicate the track so the loop has no seam.
     --------------------------------------------------------- */
  (function marquee() {
    $$('.marquee-track').forEach(function (track) {
      track.setAttribute('aria-hidden', 'false');
      var clone = track.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      track.parentNode.appendChild(clone);
    });
  })();
})();
