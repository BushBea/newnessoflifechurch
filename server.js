require('dotenv').config();

const path = require('path');
const express = require('express');
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./src/routes/auth');
const sermonRoutes = require('./src/routes/sermons');
const eventRoutes = require('./src/routes/events');
const pledgeRoutes = require('./src/routes/pledges');
const userRoutes = require('./src/routes/users');

const app = express();
const PORT = process.env.PORT || 4000;
const isProd = process.env.NODE_ENV === 'production';

if (!process.env.SESSION_SECRET || process.env.SESSION_SECRET.includes('replace-this')) {
  console.warn('\n⚠️  SESSION_SECRET is missing or still the placeholder value.');
  console.warn('   Set a real, random SESSION_SECRET in your .env before deploying.\n');
}

// Trust the first proxy hop (Render/Railway/most PaaS put a proxy in front
// of your app) so secure cookies and rate limiting see the real client IP.
app.set('trust proxy', 1);

app.use(helmet());
app.use(express.json({ limit: '100kb' }));

const allowedOrigins = (process.env.CORS_ORIGIN || '').split(',').map(s => s.trim()).filter(Boolean);
app.use(cors({
  origin(origin, callback) {
    // Allow same-origin/non-browser requests (no Origin header) through.
    if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

app.use(session({
  store: new SQLiteStore({ db: 'sessions.db', dir: path.dirname(process.env.DATABASE_FILE || './data/church.db') }),
  name: 'nol.sid',
  secret: process.env.SESSION_SECRET || 'dev-only-secret-change-me',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: isProd, // requires HTTPS in production, which Render/Railway provide
    maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
  },
}));

// Slow down brute-force attempts against login/register specifically.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many attempts. Please wait a few minutes and try again.' },
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

app.use('/api/auth', authRoutes);
app.use('/api/sermons', sermonRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/pledges', pledgeRoutes);
app.use('/api/users', userRoutes);

app.get('/api/health', (req, res) => res.json({ ok: true }));

// Optional: serve the frontend from this same server so you only need one
// deployment. Uncomment if you're not hosting the frontend separately.
// app.use(express.static(path.join(__dirname, '..', 'frontend')));

app.use((req, res) => res.status(404).json({ error: 'Not found.' }));

// Centralized error handler — keeps stack traces out of API responses.
app.use((err, req, res, next) => {
  if (err && err.message === 'Not allowed by CORS') {
    return res.status(403).json({ error: 'This origin is not allowed to access the API.' });
  }
  console.error(err);
  res.status(500).json({ error: 'Something went wrong on our end.' });
});

app.listen(PORT, () => {
  console.log(`Newness of Life API listening on port ${PORT} (${isProd ? 'production' : 'development'})`);
});
