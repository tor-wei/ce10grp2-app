// api/server.js
const express = require("express");
const cors = require("cors");
const redis = require("redis");
const client = require("prom-client"); // --- Prometheus Monitoring Start ---

const app = express();
const port = process.env.PORT || 3000;

// --- Prometheus Monitoring: Create a Registry for metrics ---
const register = new client.Registry();
client.collectDefaultMetrics({ register });

// --- Prometheus Monitoring: Define custom metrics ---
const httpRequestDurationMicroseconds = new client.Histogram({
  name: "http_request_duration_seconds",
  help: "Duration of HTTP requests in seconds",
  labelNames: ["method", "route", "code"],
  buckets: [0.1, 0.5, 1, 1.5], // Buckets for response time from 0.1s to 1.5s
});

const gameScoresInRedis = new client.Gauge({
  name: "game_scores_in_redis_total",
  help: "Total number of game scores currently stored in Redis",
  async collect() {
    // This function is called when Prometheus scrapes the /metrics endpoint
    if (redisClient.isReady) {
      const count = await redisClient.lLen("game_scores");
      this.set(count);
    } else {
      this.set(0);
    }
  },
});

// Register the custom metrics
register.registerMetric(httpRequestDurationMicroseconds);
register.registerMetric(gameScoresInRedis);
// --- Prometheus Monitoring End ---

// Serve static files from the 'client' directory
app.use(express.static("client"));

// Redis connection
const redisClient = redis.createClient({
  url: process.env.REDIS_URL || "redis://redis-service:6379",
  //url: process.env.REDIS_URL || "redis://localhost:6379",
});

// Middleware
app.use(cors());
app.use(express.json());

// --- Prometheus Monitoring Start ---
// --- Middleware to measure request duration ---
app.use((req, res, next) => {
  const end = httpRequestDurationMicroseconds.startTimer();
  res.on("finish", () => {
    end({ route: req.path, code: res.statusCode, method: req.method });
  });
  next();
});
// --- Prometheus Monitoring End ---

// 4-letter words (same as your original list)
const words = [
  "LOVE",
  "FIRE",
  "BEAR",
  "CAKE",
  "DUCK",
  "GOLD",
  "HOPE",
  "LAMP",
  "MOON",
  "RAIN",
  "STAR",
  "TREE",
  "WIND",
  "BOOK",
  "COAT",
  "DESK",
  "GATE",
  "HAND",
  "JUMP",
  "KING",
  "LAKE",
  "MAIL",
  "NOSE",
  "OPEN",
  "PARK",
  "QUIT",
  "ROAD",
  "SHIP",
];

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString() });
});

// --- Prometheus Monitoring Start ---
// --- Add the /metrics endpoint ---
app.get("/metrics", async (req, res) => {
  try {
    res.set("Content-Type", register.contentType);
    res.end(await register.metrics());
  } catch (ex) {
    res.status(500).end(ex);
  }
});
// --- Prometheus Monitoring End ---

// Get random word endpoint
app.get("/api/word", (req, res) => {
  try {
    const randomWord =
      words[Math.floor(Math.random() * words.length)].toUpperCase();
    console.log(`Serving word: ${randomWord}`);

    res.json({
      word: randomWord,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error serving word:", error);
    res.status(500).json({ error: "Failed to get word" });
  }
});

// Submit score endpoint
app.post("/api/score", async (req, res) => {
  try {
    const { score, attempts, word, won, timestamp } = req.body;

    const scoreData = {
      score: score || 0,
      attempts: attempts || 6,
      word: word || "UNKNOWN",
      won: won || false,
      timestamp: timestamp || new Date().toISOString(),
    };

    console.log("Received score:", scoreData);

    // Store in Redis list
    await redisClient.lpush("game_scores", JSON.stringify(scoreData));

    // Keep only last 100 scores
    await redisClient.ltrim("game_scores", 0, 99);

    console.log("Score saved successfully");
    res.json({
      message: "Score saved successfully",
      score: scoreData,
    });
  } catch (error) {
    console.error("Error saving score:", error);
    res.status(500).json({ error: "Failed to save score" });
  }
});

// Get high scores endpoint
app.get("/api/scores", async (req, res) => {
  try {
    const scores = await redisClient.lrange("game_scores", 0, 9); // Get top 10
    const parsedScores = scores.map((score) => JSON.parse(score));

    // Sort by score descending
    parsedScores.sort((a, b) => b.score - a.score);

    res.json({
      scores: parsedScores,
      total: parsedScores.length,
    });
  } catch (error) {
    console.error("Error fetching scores:", error);
    res.status(500).json({ error: "Failed to fetch scores" });
  }
});

// Initialize Redis connection
async function initRedis() {
  try {
    await redisClient.connect();
    console.log("Connected to Redis");
  } catch (error) {
    console.error("Redis connection error:", error);
    console.log("Continuing without Redis...");
  }
}

// Start server
app.listen(port, () => {
  console.log(`API Server running on port ${port}`);
  initRedis();
});

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("Shutting down gracefully...");
  await redisClient.quit();
  process.exit(0);
});
