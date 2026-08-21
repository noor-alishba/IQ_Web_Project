import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import skillGapRoutes from "./routes/SkillGapRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({ success: true, message: "Skill Gap Analyzer API is running." });
});

// All analysis logic lives in the route/service below. Do not duplicate it here.
app.use("/api/skill-gap", skillGapRoutes);

app.use((err, _req, res, _next) => {
  console.error("Unhandled server error:", err);
  res.status(500).json({ success: false, message: "Internal server error." });
});

app.listen(PORT, () => {
  console.log(`Skill Gap Analyzer API listening on http://localhost:${PORT}`);
});
