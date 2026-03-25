import { Router, type IRouter } from "express";
import { generateInitiativeStructure } from "../services/aiService";
import { logger } from "../lib/logger";

const router: IRouter = Router();

router.post("/generate-plan", async (req, res) => {
  try {
    const { description, category } = req.body;

    if (!description || typeof description !== "string" || description.length < 5) {
      res.status(400).json({ error: "Description must be at least 5 characters" });
      return;
    }

    const plan = generateInitiativeStructure(description, category);
    res.json(plan);
  } catch (err) {
    logger.error({ err }, "AI plan generation failed, returning fallback");
    try {
      const safeDesc = typeof req.body?.description === "string" ? req.body.description : "Community improvement initiative";
      const fallbackPlan = generateInitiativeStructure(safeDesc, "community");
      res.json(fallbackPlan);
    } catch (fallbackErr) {
      logger.error({ err: fallbackErr }, "AI fallback also failed, returning static plan");
      res.json({
        title: "Community Rising: New Initiative",
        description: typeof req.body?.description === "string" ? req.body.description : "A new community initiative",
        category: "community",
        location: "Local Community",
        fundingGoal: 10000,
        structuredPlan: {
          problemStatement: "Communities need support and resources to thrive.",
          executionSteps: ["Assess community needs", "Build partnerships", "Launch programs", "Measure impact"],
          estimatedBudget: 10000,
          suggestedRoles: ["Program Director", "Volunteer Coordinator", "Outreach Lead"],
          milestonesTimeline: [
            { title: "Planning", description: "Establish goals and partnerships.", targetAmount: 2500, durationWeeks: 3 },
            { title: "Launch", description: "Begin operations.", targetAmount: 5000, durationWeeks: 4 },
            { title: "Scale", description: "Expand reach.", targetAmount: 8000, durationWeeks: 4 },
            { title: "Sustain", description: "Ensure continuity.", targetAmount: 10000, durationWeeks: 3 },
          ],
        },
      });
    }
  }
});

export default router;
