const root = document.documentElement;

// Theme toggle
(function initTheme() {
  const preferred = localStorage.getItem('theme');
  if (preferred) document.documentElement.setAttribute('data-theme', preferred);
  const toggle = document.getElementById('themeToggle');
  toggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
  });
})();

// Mobile nav toggle
(function initMobileNav() {
  const btn = document.querySelector('.nav-toggle');
  const list = document.querySelector('.nav-list');
  btn.addEventListener('click', () => {
    const open = list.classList.toggle('open');
    btn.setAttribute('aria-expanded', String(open));
  });
  list.querySelectorAll('a').forEach(a => a.addEventListener('click', () => list.classList.remove('open')));
})();

// Active link on scroll
(function highlightOnScroll() {
  const sections = [...document.querySelectorAll('main section[id]')];
  const links = [...document.querySelectorAll('.nav-link')];
  const map = new Map(sections.map(s => [s.id, s]));
  function setActive(id) {
    links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === `#${id}`));
  }
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) setActive(entry.target.id);
    });
  }, { rootMargin: '-40% 0px -55% 0px', threshold: 0.01 });
  sections.forEach(s => observer.observe(s));
})();

// Reveal sections on scroll
(function revealSections() {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.section-observe').forEach(el => obs.observe(el));
})();

// Project filter logic
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', function() {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    this.classList.add('active');
    const filter = this.getAttribute('data-filter');
    document.querySelectorAll('.project-card').forEach(card => {
      if (filter === 'all' || card.dataset.status === filter) {
        card.style.display = '';
      } else {
        card.style.display = 'none';
      }
    });
  });
});

// Smooth scroll for internal links
(function smoothAnchors() {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const id = link.getAttribute('href');
      if (id.length > 1) {
        e.preventDefault();
        document.querySelector(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
})();

// Contact form validation + UX
(function contactForm() {
  const form = document.getElementById('contactForm');
  const msg = document.getElementById('formMsg');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    msg.textContent = '';
    const data = new FormData(form);
    const name = String(data.get('name') || '').trim();
    const email = String(data.get('email') || '').trim();
    const message = String(data.get('message') || '').trim();
    const consent = data.get('consent');

    if (!name || !email || !message || !consent) {
      msg.textContent = 'Please fill out all fields and consent.';
      return;
    }
    try {
      const res = await fetch(form.action, {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: data
      });
      if (res.ok) {
        msg.textContent = 'Thanks! I\'ll get back to you soon.';
        form.reset();
      } else {
        let serverMsg = '';
        try {
          const json = await res.json();
          if (json && json.errors) {
            serverMsg = json.errors.map(e => e.message).join('; ');
          }
        } catch (_) {}
        msg.textContent = serverMsg || 'Something went wrong. Please email me directly.';
        // Fallback: open mail client prefilled
        const mailHref = document.querySelector('.contact-list a[href^="mailto:"]')?.getAttribute('href') || 'mailto:';
        const subject = encodeURIComponent(`Portfolio contact from ${name}`);
        const body = encodeURIComponent(`From: ${name} <${email}>\n\n${message}`);
        try {
          window.location.href = `${mailHref}?subject=${subject}&body=${body}`;
        } catch (_) {}
      }
    } catch (_) {
      msg.textContent = 'Network error. Opening your email client...';
      const mailHref = document.querySelector('.contact-list a[href^="mailto:"]')?.getAttribute('href') || 'mailto:';
      const subject = encodeURIComponent(`Portfolio contact from ${name}`);
      const body = encodeURIComponent(`From: ${name} <${email}>\n\n${message}`);
      try {
        window.location.href = `${mailHref}?subject=${subject}&body=${body}`;
      } catch (_) {}
    }
  });
})();

// Footer year
document.getElementById('year').textContent = String(new Date().getFullYear());


