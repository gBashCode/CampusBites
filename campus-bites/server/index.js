require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { WebSocketServer } = require('ws');
const jwt = require('jsonwebtoken');
const { pool } = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

// --- Security: sanitize $ and . keys in request body/query/params ---
const DANGEROUS_KEY_RE = /^\$|__/;
const sanitizeObject = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(sanitizeObject);
  const clean = {};
  for (const [key, value] of Object.entries(obj)) {
    if (DANGEROUS_KEY_RE.test(key)) continue;
    clean[key] = typeof value === 'object' ? sanitizeObject(value) : value;
  }
  return clean;
};

app.use((req, res, next) => {
  if (req.body && typeof req.body === 'object') req.body = sanitizeObject(req.body);
  if (req.query && typeof req.query === 'object') req.query = sanitizeObject(req.query);
  if (req.params && typeof req.params === 'object') req.params = sanitizeObject(req.params);
  next();
});

// --- Helmet ---
app.use(helmet({
  crossOriginResourcePolicy: false,
  contentSecurityPolicy: false,
  hsts: { maxAge: 31536000, includeSubDomains: true },
}));

// --- CORS with strict origin allowlist ---
const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(',').map(s => s.trim())
  : [];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// --- Body parsing with size limit ---
app.use(express.json({ limit: '10kb' }));

// --- Rate limiting ---
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests, please try again later' },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many authentication attempts, please try again later' },
});

app.use('/api/', generalLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth/forgot-password', authLimiter);
app.use('/api/auth/reset-password', authLimiter);
app.use('/api/auth/verify-otp', authLimiter);

// --- Request logger ---
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const ms = Date.now() - start;
    if (req.method !== 'OPTIONS') {
      console.log(`${req.method} ${req.originalUrl} ${res.statusCode} ${ms}ms`);
    }
  });
  next();
});

// --- Database connection test on startup ---
async function connectDB() {
  try {
    const result = await pool.query('SELECT NOW()');
    console.log('PostgreSQL connected:', result.rows[0].now);
  } catch (err) {
    console.error('PostgreSQL connection error:', err.message);
  }
}
connectDB();

// --- Routes ---
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Campus Bites API',
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/notifications', require('./routes/notifications'));

// --- 404 handler ---
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// --- Global error handler ---
app.use((err, req, res, _next) => {
  console.error('Unhandled error:', err);
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ message: 'Origin not allowed by CORS' });
  }
  res.status(500).json({ message: 'Internal server error' });
});

// --- Process error handlers ---
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

// --- Graceful shutdown ---
const gracefulShutdown = async (signal) => {
  console.log(`\n${signal} received. Shutting down gracefully...`);
  try {
    await pool.end();
    console.log('PostgreSQL pool closed.');
  } catch (err) {
    console.error('Error closing PostgreSQL pool:', err.message);
  }
  process.exit(0);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// --- Start server ---
const server = http.createServer(app);

// --- WebSocket server ---
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';
const connectedClients = new Map(); // userId -> Set<ws>

const wss = new WebSocketServer({ server });

wss.on('connection', (ws, req) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const token = url.searchParams.get('token');
    if (!token) { ws.close(1008, 'No token'); return; }

    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.id;

    if (!connectedClients.has(userId)) {
      connectedClients.set(userId, new Set());
    }
    connectedClients.get(userId).add(ws);

    ws.userId = userId;
    ws.isAlive = true;

    ws.on('pong', () => { ws.isAlive = true; });
    ws.on('close', () => {
      const userSet = connectedClients.get(userId);
      if (userSet) { userSet.delete(ws); if (userSet.size === 0) connectedClients.delete(userId); }
    });

    ws.send(JSON.stringify({ type: 'connected', message: 'Connected to order updates' }));
  } catch (err) {
    ws.close(1008, 'Invalid token');
  }
});

// Heartbeat to detect dead connections
const heartbeat = setInterval(() => {
  wss.clients.forEach(ws => {
    if (!ws.isAlive) return ws.terminate();
    ws.isAlive = false;
    ws.ping();
  });
}, 30000);
wss.on('close', () => clearInterval(heartbeat));

// Helper to send order update to a user
function broadcastToUser(userId, data) {
  const clients = connectedClients.get(String(userId));
  if (clients) {
    const msg = JSON.stringify(data);
    clients.forEach(ws => { if (ws.readyState === 1) ws.send(msg); });
  }
}

// Make broadcastToUser available to routes
app.set('broadcastToUser', broadcastToUser);

// WebSocket status endpoint
app.get('/ws/status', (req, res) => {
  res.json({ connections: connectedClients.size });
});

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;
