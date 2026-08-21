/* SkillGapRoutes.js */

import express from "express";
import { analyzeSkillGap } from "../services/SkillGapService.js";

const router = express.Router();

router.post("/analyze", async (req, res) => {
  try {
    const { skills, targetRole } = req.body || {};

    if (!Array.isArray(skills) || skills.length === 0) {
      return res.status(400).json({ success: false, message: "Please enter at least one current skill." });
    }

    if (!String(targetRole || "").trim()) {
      return res.status(400).json({ success: false, message: "Please enter a target role." });
    }

    // The service returns the analysis object. It is wrapped only once here.
    const analysis = await analyzeSkillGap(skills, targetRole.trim());
    return res.status(200).json({ success: true, data: analysis });
  } catch (error) {
    console.error("Skill-gap route error:", error);
    return res.status(500).json({ success: false, message: "Failed to analyze skill gap." });
  }
});

export default router;
