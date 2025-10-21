export const requestLogger = (req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const ms = Date.now() - start;
    console.log(`${req.method} ${req.originalUrl} ${res.statusCode} - ${ms}ms`);
  });
  next();
};

// Simple in-memory rate limiter per ip+path
const buckets = new Map();
export const rateLimit = ({ windowMs = 60000, max = 60 } = {}) => (req, res, next) => {
  const key = `${req.ip}:${req.path}`;
  const now = Date.now();
  const entry = buckets.get(key) || { count: 0, reset: now + windowMs };
  if (now > entry.reset) {
    entry.count = 0;
    entry.reset = now + windowMs;
  }
  entry.count += 1;
  buckets.set(key, entry);
  if (entry.count > max) {
    return res.status(429).json({ message: "Too many requests" });
  }
  next();
};



