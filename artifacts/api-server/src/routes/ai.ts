import { Router, type IRouter } from "express";
import { generateInitiativeStructure } from "../services/aiService";

const router: IRouter = Router();

router.post("/generate-plan", async (req, res) => {
  const { description, category } = req.body;

  if (!description || typeof description !== "string" || description.length < 5) {
    res.status(400).json({ error: "Description must be at least 5 characters" });
    return;
  }

  const plan = generateInitiativeStructure(description, category);
  res.json(plan);
});

export default router;
