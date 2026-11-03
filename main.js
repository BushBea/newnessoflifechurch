/* Small shared helpers used across pages. */

function showFormMsg(el, message, type = 'success') {
  el.textContent = message;
  el.className = `form-msg show ${type}`;
}

function clearFormMsg(el) {
  el.className = 'form-msg';
  el.textContent = '';
}

function formatEventDate(isoDate) {
  const d = new Date(isoDate + 'T00:00:00');
  if (isNaN(d)) return { day: '--', mon: '' };
  return {
    day: d.getDate(),
    mon: d.toLocaleString('en-US', { month: 'short' }),
    full: d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
  };
}

function escapeHtml(str) {
  return String(str ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

/* One-time, restrained hero entrance (respects reduced-motion via CSS). */
document.addEventListener('DOMContentLoaded', () => {
  const hero = document.querySelector('.hero .container');
  if (hero) {
    hero.style.opacity = '0';
    hero.style.transform = 'translateY(10px)';
    requestAnimationFrame(() => {
      hero.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
      hero.style.opacity = '1';
      hero.style.transform = 'translateY(0)';
    });
  }
});
