import express from "express";
import { apiRouter } from "./api-routes";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// ES module __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(express.json());

// Debug logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// API Routes - our clean ChurnGuard 3.0 endpoints
app.use("/api", apiRouter);

// Serve static files from client build
app.use(express.static(join(__dirname, "../dist/public")));

// Health check endpoint
app.get("/health", (_req, res) => {
  console.log("Health check called");
  res.json({ status: "ok", service: "ChurnGuard 3.0" });
});

// Catch-all handler: send back React's index.html file for client-side routing
app.get("*", (_req, res) => {
  res.sendFile(join(__dirname, "../dist/public/index.html"));
});

app.listen(PORT, () => {
  console.log(`🚀 ChurnGuard 3.0 server running on port ${PORT}`);
  console.log(`📊 Clean architecture with single data service`);
});
