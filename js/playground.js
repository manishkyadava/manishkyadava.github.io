// Playground v3 — scroll reveal + mobile menu
(function () {
  document.documentElement.classList.add('js');

  // staggered scroll reveal
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var siblings = el.parentElement ? el.parentElement.querySelectorAll('.reveal') : [el];
        var index = Array.prototype.indexOf.call(siblings, el);
        el.style.transitionDelay = Math.max(0, index) * 70 + 'ms';
        el.classList.add('in');
        io.unobserve(el);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  }

  // mobile menu
  var burger = document.querySelector('.nav-burger');
  var menu = document.getElementById('mobile-menu');
  if (burger && menu) {
    burger.addEventListener('click', function () {
      var open = menu.classList.toggle('open');
      burger.setAttribute('aria-expanded', String(open));
      burger.textContent = open ? '✕' : '☰';
    });
    menu.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        menu.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
        burger.textContent = '☰';
      }
    });
  }

  // nav active state follows scroll
  var sections = [
    { id: 'top', link: 'a[href="#top"]' },
    { id: 'work', link: 'a[href="#work"]' },
    { id: 'about', link: 'a[href="#about"]' }
  ];
  var navPills = document.querySelectorAll('.nav-links .pill:not(.pill-dark)');
  function setActive() {
    var y = window.scrollY + 140;
    var current = 'top';
    sections.forEach(function (s) {
      var el = document.getElementById(s.id);
      if (el && el.offsetTop <= y) current = s.id;
    });
    navPills.forEach(function (pill) {
      pill.classList.toggle('pill-active', pill.getAttribute('href') === '#' + current);
    });
  }
  window.addEventListener('scroll', setActive, { passive: true });
  setActive();
})();
