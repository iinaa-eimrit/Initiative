import { Router, type IRouter } from "express";
import healthRouter from "./health";
import initiativesRouter from "./initiatives";
import aiRouter from "./ai";
import authRouter from "./auth";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/auth", authRouter);
router.use("/initiatives", initiativesRouter);
router.use("/ai", aiRouter);

export default router;
