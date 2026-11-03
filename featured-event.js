const PRAYER_GATHERING = Object.freeze({
  date: '2026-11-03',
  title: 'Prayer & Communion Night',
  description: 'Are you ready to experience the sacred power of prayer and communion with God? Come together in prayer and encounter the boundless power of God. This is a divine opportunity to connect deeply with His presence and grace through faith.',
  verse: '“For where two or three are gathered in my name, there am I among them.”',
  reference: 'Matthew 18:20',
  zoomUrl: 'https://us02web.zoom.us/j/84418991821?pwd=Tnc2dWdXMEYyeHQrK0FzK3pld0FRdz09',
});

function renderPrayerGathering() {
  const eventDate = new Date(`${PRAYER_GATHERING.date}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (eventDate < today) return '';

  const dateLabel = eventDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
  const timeLabel = eventDate.getTime() === today.getTime()
    ? 'Tonight · 7:00 PM'
    : `${dateLabel} · 7:00 PM`;

  return `
    <article class="featured-event">
      <div class="featured-event-copy">
        <p class="featured-event-time">${timeLabel}</p>
        <h3>${PRAYER_GATHERING.title}</h3>
        <p>${PRAYER_GATHERING.description}</p>
        <blockquote>
          <p>${PRAYER_GATHERING.verse}</p>
          <cite>— ${PRAYER_GATHERING.reference}</cite>
        </blockquote>
        <p class="featured-event-invitation">Don’t miss this moment of spiritual renewal and divine connection.</p>
        <a class="btn" href="${PRAYER_GATHERING.zoomUrl}" target="_blank" rel="noopener noreferrer">
          Join us via Zoom <i class="fas fa-arrow-up-right-from-square" aria-hidden="true"></i>
        </a>
        <p class="featured-event-brand">Newness of Life <span>The Church Greatly Loved by Jesus</span></p>
      </div>
    </article>
  `;
}
