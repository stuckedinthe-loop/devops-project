const express = require("express");
const { Pool } = require("pg");

const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || "appuser",
  password: process.env.DB_PASSWORD || "apppass",
  database: process.env.DB_NAME || "appdb",
});

const app = express();

// Liveness check - does not touch the database (used by CI tests)
app.get("/health", (req, res) => res.json({ status: "ok" }));

// Home page
app.get("/", (req, res) => {
  res.send("<h1>DevOps Project</h1><p>Web + DB running via Docker Compose.</p><p><a href='/visits'>Visit counter</a></p>");
});

// Increments and returns a visit counter stored in PostgreSQL
app.get("/visits", async (req, res) => {
  try {
    await pool.query("CREATE TABLE IF NOT EXISTS visits (id SERIAL PRIMARY KEY, visited_at TIMESTAMP DEFAULT NOW())");
    await pool.query("INSERT INTO visits DEFAULT VALUES");
    const { rows } = await pool.query("SELECT COUNT(*)::int AS total FROM visits");
    res.json({ visits: rows[0].total });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "database unavailable" });
  }
});

module.exports = app;
