/* Shared behaviour: theme, nav, scroll reveal, post card markup. */
(function () {
  'use strict';

  /* ---- theme ---- */
  var SUN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
  var MOON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z"/></svg>';

  function applyTheme(t) {
    document.documentElement.setAttribute('data-theme', t);
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', t === 'dark' ? '#12110e' : '#f2efe8');
    var btn = document.getElementById('themeBtn');
    if (btn) {
      btn.innerHTML = t === 'light' ? MOON : SUN;
      btn.setAttribute('title', t === 'light' ? 'Switch to dark' : 'Switch to light');
    }
  }

  // The inline head script already set data-theme before first paint (no
  // flash); this just syncs the button icon and theme-color meta to it.
  applyTheme(document.documentElement.getAttribute('data-theme') || 'dark');

  document.addEventListener('click', function (e) {
    var btn = e.target.closest && e.target.closest('#themeBtn');
    if (!btn) return;
    var next = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    applyTheme(next);
    try { localStorage.setItem('theme', next); } catch (err) {}
  });

  /* ---- nav ---- */
  var nav = document.getElementById('nav');
  if (nav) {
    var onScroll = function () { nav.classList.toggle('scrolled', window.scrollY > 8); };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  var toggle = document.getElementById('navToggle');
  var links = document.getElementById('navLinks');
  if (toggle && links) {
    toggle.addEventListener('click', function () {
      var open = links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
    });
    links.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        links.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ---- scroll reveal ---- */
  var reveals = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window) ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    reveals.forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry, i) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        setTimeout(function () { el.classList.add('in'); }, i * 55);
        io.unobserve(el);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    reveals.forEach(function (el) { io.observe(el); });

    /* Safety net: a fast scroll can carry an element past the viewport
       between observer deliveries, which would leave it invisible for good.
       Sweep on scroll-end and reveal anything already above the fold. */
    var sweeping = false;
    var sweep = function () {
      if (sweeping) return;
      sweeping = true;
      requestAnimationFrame(function () {
        sweeping = false;
        reveals.forEach(function (el) {
          if (el.classList.contains('in')) return;
          if (el.getBoundingClientRect().top < window.innerHeight * 0.94) {
            el.classList.add('in');
            io.unobserve(el);
          }
        });
      });
    };
    window.addEventListener('scroll', sweep, { passive: true });
    window.addEventListener('resize', sweep, { passive: true });
  }

  /* ---- section spy (home page only) ---- */
  var spyTargets = document.querySelectorAll('main section[id]');
  var navAnchors = links ? links.querySelectorAll('a[href^="#"]') : [];
  if (spyTargets.length && navAnchors.length && 'IntersectionObserver' in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navAnchors.forEach(function (a) {
          a.classList.toggle('active', a.getAttribute('href') === '#' + entry.target.id);
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    spyTargets.forEach(function (s) { spy.observe(s); });
  }

  /* ---- helpers shared with the blog pages ---- */
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function formatDate(iso) {
    var d = new Date(iso + 'T00:00:00Z');
    if (isNaN(d)) return iso;
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
  }

  function postCardHTML(p) {
    return '<a class="post-item" href="/post.html?p=' + encodeURIComponent(p.slug) + '">' +
      '<div class="post-meta">' +
        '<time datetime="' + esc(p.date) + '">' + esc(formatDate(p.date)) + '</time>' +
        (p.tag ? '<span class="pill">' + esc(p.tag) + '</span>' : '') +
      '</div>' +
      '<div>' +
        '<h3>' + esc(p.title) + '</h3>' +
        '<p>' + esc(p.summary) + '</p>' +
      '</div>' +
      '<span class="read">' + (p.readingTime ? esc(p.readingTime) + ' min' : 'Read') + '</span>' +
    '</a>';
  }

  window.esc = esc;
  window.formatDate = formatDate;
  window.postCardHTML = postCardHTML;

  var y = document.getElementById('year');
  if (y) y.textContent = String(new Date().getFullYear());
})();
