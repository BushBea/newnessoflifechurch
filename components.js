/* Renders the shared header and footer, and adjusts navigation based on
   whether someone is logged in (and their role). Include this after api.js
   on every page, with <div id="site-header"></div> and <div id="site-footer">
   placeholders in the HTML. */

const NAV_LINKS = [
  { href: 'index.html', label: 'Home' },
  { href: 'sermons.html', label: 'Sermons' },
  { href: 'events.html', label: 'Events' },
  { href: 'about.html', label: 'About Us' },
];

const MAPS_URL = 'https://www.google.com/maps/search/?api=1&query=507+Steel+Blue+Street,+Witfontein+301,+Akasia,+South+Africa';

function currentPage() {
  const path = window.location.pathname.split('/').pop() || 'index.html';
  return path;
}

function renderHeader(user) {
  const page = currentPage();
  const navItems = NAV_LINKS.map(link => {
    const active = link.href === page ? ' active' : '';
    return `<li><a class="${active.trim()}" href="${link.href}">${link.label}</a></li>`;
  }).join('');
  const loginNavItem = user ? '' : '<li class="mobile-login-link"><a href="login.html">Log in</a></li>';

  let accountArea;
  if (user) {
    const initial = (user.name || user.email || '?').trim().charAt(0).toUpperCase();
    const dashHref = user.role === 'admin' ? 'admin.html' : 'account.html';
    accountArea = `
      <a class="user-chip" href="${dashHref}" title="Go to your dashboard">
        <span class="avatar">${initial}</span>
        <span>${user.role === 'admin' ? 'Admin' : (user.name || 'My Account')}</span>
      </a>
      <button class="btn ghost small" id="logoutBtn" type="button">Log out</button>
    `;
  } else {
    accountArea = `
      <a class="btn ghost small login-link" href="login.html">Log in</a>
    `;
  }

  const html = `
    <div class="container nav">
      <a class="brand" href="index.html">
        <img src="images/logo.png" alt="Newness of Life Church logo">
        <span>Newness of Life</span>
      </a>
      <button class="menu-toggle" aria-label="Toggle menu" aria-expanded="false" id="menuToggle">&#9776;</button>
      <nav class="main-nav" id="mainNav">
        <ul>${navItems}${loginNavItem}</ul>
      </nav>
      <div class="nav-actions">
        <a class="btn outline small" href="${MAPS_URL}" target="_blank" rel="noopener noreferrer">Location</a>
        ${accountArea}
        <a class="btn small" href="give.html">Give</a>
      </div>
    </div>
  `;

  const el = document.getElementById('site-header');
  if (!el) return;
  el.innerHTML = html;

  const toggle = document.getElementById('menuToggle');
  const nav = document.getElementById('mainNav');
  toggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(isOpen));
  });

  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      try { await api.logout(); } catch (_) { /* ignore */ }
      window.location.href = 'index.html';
    });
  }
}

function renderFooter() {
  const el = document.getElementById('site-footer');
  if (!el) return;
  el.innerHTML = `
    <div class="container footer-grid">
      <div>
        <img src="images/logo.png" alt="Newness of Life Church logo">
        <p>Thank you for partnering with Newness of Life Church. Every gift helps us share God's love with our community and beyond.</p>
      </div>
      <div>
        <h4>Quick Links</h4>
        <ul class="footer-links">
          <li><a href="index.html">Home</a></li>
          <li><a href="sermons.html">Sermons</a></li>
          <li><a href="events.html">Events</a></li>
          <li><a href="about.html">About Us</a></li>
          <li><a href="give.html">Give</a></li>
        </ul>
      </div>
      <div>
        <h4>Connect</h4>
        <p style="margin-bottom:14px">507 Steel Blue Street, Witfontein 301, Akasia<br>hello@newnessoflife.org</p>
        <div class="footer-social">
          <a href="https://www.facebook.com/profile.php?id=100064057989810&mibextid=rS40aB7S9Ucbxw6v" target="_blank" rel="noopener noreferrer" aria-label="Facebook"><i class="fab fa-facebook-f"></i></a>
          <a href="https://www.youtube.com/@nkosinathirhulani195" target="_blank" rel="noopener noreferrer" aria-label="YouTube"><i class="fab fa-youtube"></i></a>
          <a href="https://wa.me/27647285173" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp"><i class="fab fa-whatsapp"></i></a>
        </div>
      </div>
    </div>
    <div class="container footer-bottom">
      <span>&copy; ${new Date().getFullYear()} Newness of Life Church. All rights reserved.</span>
      <span>Built with care for our community.</span>
    </div>
  `;
}

async function initLayout() {
  renderFooter();
  let user = null;
  try {
    const res = await api.me();
    user = res.user || null;
  } catch (_) { /* not logged in / API unreachable */ }
  renderHeader(user);
  document.dispatchEvent(new CustomEvent('layout:ready', { detail: { user } }));
  return user;
}

document.addEventListener('DOMContentLoaded', initLayout);
