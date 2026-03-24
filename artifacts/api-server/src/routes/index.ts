import { Router, type IRouter } from "express";
import healthRouter from "./health";
import initiativesRouter from "./initiatives";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/initiatives", initiativesRouter);

export default router;
