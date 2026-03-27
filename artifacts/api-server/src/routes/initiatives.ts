import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import {
  initiativesTable,
  milestonesTable,
  volunteersTable,
  donationsTable,
  updatesTable,
  blogsTable,
  insertInitiativeSchema,
  insertVolunteerSchema,
  insertDonationSchema,
  insertUpdateSchema,
} from "@workspace/db/schema";
import { eq, ilike, or, sql, desc, count } from "drizzle-orm";
import {
  ListInitiativesQueryParams,
  CreateInitiativeBody,
  GetInitiativeParams,
  VolunteerForInitiativeParams,
  VolunteerForInitiativeBody,
  DonateToInitiativeParams,
  DonateToInitiativeBody,
  GetLeaderboardParams,
} from "@workspace/api-zod";
import { calculateTrustScore } from "../services/trustScoreService";
import { getSuggestedVolunteers } from "../services/volunteerMatchService";
import { logger } from "../lib/logger";

const router: IRouter = Router();

async function getTrustScoreForInitiative(initiativeId: number, initiative: typeof initiativesTable.$inferSelect) {
  const [updatesResult] = await db
    .select({ count: count() })
    .from(updatesTable)
    .where(eq(updatesTable.initiativeId, initiativeId));

  const milestones = await db
    .select()
    .from(milestonesTable)
    .where(eq(milestonesTable.initiativeId, initiativeId));

  const completedMilestones = milestones.filter((m) => m.status === "completed").length;

  return calculateTrustScore({
    updatesCount: updatesResult?.count ?? 0,
    milestonesCompleted: completedMilestones,
    totalMilestones: milestones.length,
    volunteerCount: initiative.volunteerCount,
    fundingRaised: initiative.fundingRaised,
    fundingGoal: initiative.fundingGoal,
  });
}

async function formatInitiativeWithScore(i: typeof initiativesTable.$inferSelect) {
  const trustScore = await getTrustScoreForInitiative(i.id, i);
  return {
    id: i.id,
    title: i.title,
    description: i.description,
    category: i.category,
    location: i.location,
    status: i.status,
    lifecycleStage: i.lifecycleStage,
    fundingGoal: i.fundingGoal,
    fundingRaised: i.fundingRaised,
    volunteerCount: i.volunteerCount,
    createdAt: i.createdAt.toISOString(),
    creatorName: i.creatorName,
    imageUrl: i.imageUrl ?? null,
    structuredPlan: i.structuredPlan ?? null,
    trustScore,
  };
}

router.get("/", async (req, res) => {
  try {
    const query = ListInitiativesQueryParams.safeParse(req.query);
    if (!query.success) {
      res.status(400).json({ error: "Invalid query parameters" });
      return;
    }

    const { category, status, search } = query.data;

    const conditions = [];

    if (category) {
      conditions.push(eq(initiativesTable.category, category));
    }
    if (status) {
      conditions.push(eq(initiativesTable.status, status as "active" | "completed" | "paused"));
    }
    if (search) {
      conditions.push(
        or(
          ilike(initiativesTable.title, `%${search}%`),
          ilike(initiativesTable.description, `%${search}%`)
        )
      );
    }

    const initiatives = conditions.length > 0
      ? await db.select().from(initiativesTable).where(sql`${conditions.reduce((a, b) => sql`${a} AND ${b}`)}`)
      : await db.select().from(initiativesTable).orderBy(desc(initiativesTable.createdAt));

    const results = await Promise.all(initiatives.map(formatInitiativeWithScore));
    res.json(results);
  } catch (err) {
    logger.error({ err }, "Failed to list initiatives");
    res.status(500).json({ error: "Failed to load initiatives" });
  }
});

router.post("/", async (req, res) => {
  try {
    const body = CreateInitiativeBody.safeParse(req.body);
    if (!body.success) {
      res.status(400).json({ error: "Validation failed", details: body.error.issues });
      return;
    }

    const parsed = insertInitiativeSchema.safeParse(body.data);
    if (!parsed.success) {
      res.status(400).json({ error: "Validation failed", details: parsed.error.issues });
      return;
    }

    const [initiative] = await db.insert(initiativesTable).values(parsed.data).returning();

    const plan = initiative.structuredPlan as any;
    if (plan?.milestonesTimeline?.length > 0) {
      await db.insert(milestonesTable).values(
        plan.milestonesTimeline.map((m: any, idx: number) => ({
          initiativeId: initiative.id,
          title: m.title,
          description: m.description,
          targetAmount: m.targetAmount,
          fundsLocked: m.targetAmount,
          status: idx === 0 ? ("active" as const) : ("pending" as const),
          order: idx + 1,
        }))
      );
    } else {
      await db.insert(milestonesTable).values([
        {
          initiativeId: initiative.id,
          title: "Launch & Awareness",
          description: "Launch the initiative and raise initial awareness in the community.",
          targetAmount: initiative.fundingGoal * 0.25,
          fundsLocked: initiative.fundingGoal * 0.25,
          status: "active" as const,
          order: 1,
        },
        {
          initiativeId: initiative.id,
          title: "Community Building",
          description: "Grow the volunteer network and establish key partnerships.",
          targetAmount: initiative.fundingGoal * 0.5,
          fundsLocked: initiative.fundingGoal * 0.5,
          status: "pending" as const,
          order: 2,
        },
        {
          initiativeId: initiative.id,
          title: "Full Implementation",
          description: "Execute the core mission and deliver measurable impact.",
          targetAmount: initiative.fundingGoal,
          fundsLocked: initiative.fundingGoal,
          status: "pending" as const,
          order: 3,
        },
      ]);
    }

    const result = await formatInitiativeWithScore(initiative);
    res.status(201).json(result);
  } catch (err) {
    logger.error({ err }, "Failed to create initiative");
    res.status(500).json({ error: "Failed to create initiative" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const params = GetInitiativeParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: "Invalid ID" });
      return;
    }

    const [initiative] = await db
      .select()
      .from(initiativesTable)
      .where(eq(initiativesTable.id, params.data.id));

    if (!initiative) {
      res.status(404).json({ error: "Initiative not found" });
      return;
    }

    const milestones = await db
      .select()
      .from(milestonesTable)
      .where(eq(milestonesTable.initiativeId, initiative.id))
      .orderBy(milestonesTable.order);

    const volunteers = await db
      .select()
      .from(volunteersTable)
      .where(eq(volunteersTable.initiativeId, initiative.id))
      .orderBy(desc(volunteersTable.joinedAt));

    const topDonors = await db
      .select({
        donorName: donationsTable.donorName,
        totalAmount: sql<number>`SUM(${donationsTable.amount})`.as("total_amount"),
        donationCount: sql<number>`COUNT(*)`.as("donation_count"),
      })
      .from(donationsTable)
      .where(eq(donationsTable.initiativeId, initiative.id))
      .groupBy(donationsTable.donorName)
      .orderBy(desc(sql`SUM(${donationsTable.amount})`))
      .limit(10);

    const updates = await db
      .select()
      .from(updatesTable)
      .where(eq(updatesTable.initiativeId, initiative.id))
      .orderBy(desc(updatesTable.createdAt));

    const blogs = await db
      .select()
      .from(blogsTable)
      .where(eq(blogsTable.initiativeId, initiative.id))
      .orderBy(desc(blogsTable.createdAt));

    const formatted = await formatInitiativeWithScore(initiative);

    res.json({
      ...formatted,
      milestones: milestones.map((m) => ({
        id: m.id,
        title: m.title,
        description: m.description,
        targetAmount: m.targetAmount,
        fundsLocked: m.fundsLocked,
        status: m.status,
        order: m.order,
      })),
      volunteers: volunteers.map((v) => ({
        id: v.id,
        name: v.name,
        email: v.email,
        message: v.message,
        skills: v.skills,
        matchedScore: v.matchedScore,
        joinedAt: v.joinedAt.toISOString(),
      })),
      topDonors: topDonors.map((d, i) => ({
        rank: i + 1,
        donorName: d.donorName,
        totalAmount: d.totalAmount,
        donationCount: Number(d.donationCount),
      })),
      updates: updates.map((u) => ({
        id: u.id,
        title: u.title,
        content: u.content,
        imageUrl: u.imageUrl ?? null,
        createdAt: u.createdAt.toISOString(),
      })),
      blogs: blogs.map((b) => ({
        id: b.id,
        title: b.title,
        story: b.story,
        challenges: b.challenges,
        outcome: b.outcome,
        impactSummary: b.impactSummary,
        createdAt: b.createdAt.toISOString(),
      })),
    });
  } catch (err) {
    logger.error({ err }, "Failed to get initiative");
    res.status(500).json({ error: "Failed to load initiative" });
  }
});

router.post("/:id/volunteer", async (req, res) => {
  try {
    const params = VolunteerForInitiativeParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: "Invalid ID" });
      return;
    }

    const body = VolunteerForInitiativeBody.safeParse(req.body);
    if (!body.success) {
      res.status(400).json({ error: "Validation failed", details: body.error.issues });
      return;
    }

    const [initiative] = await db
      .select()
      .from(initiativesTable)
      .where(eq(initiativesTable.id, params.data.id));

    if (!initiative) {
      res.status(404).json({ error: "Initiative not found" });
      return;
    }

    const parsed = insertVolunteerSchema.safeParse({
      initiativeId: params.data.id,
      name: body.data.name,
      email: body.data.email,
      message: body.data.message ?? null,
      skills: body.data.skills ?? null,
    });

    if (!parsed.success) {
      res.status(400).json({ error: "Validation failed" });
      return;
    }

    const [volunteer] = await db.insert(volunteersTable).values(parsed.data).returning();

    await db
      .update(initiativesTable)
      .set({ volunteerCount: initiative.volunteerCount + 1 })
      .where(eq(initiativesTable.id, initiative.id));

    res.status(201).json({
      id: volunteer.id,
      name: volunteer.name,
      email: volunteer.email,
      message: volunteer.message,
      skills: volunteer.skills,
      matchedScore: volunteer.matchedScore,
      joinedAt: volunteer.joinedAt.toISOString(),
    });
  } catch (err) {
    logger.error({ err }, "Failed to register volunteer");
    res.status(500).json({ error: "Failed to register volunteer" });
  }
});

router.post("/:id/donate", async (req, res) => {
  try {
    const params = DonateToInitiativeParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: "Invalid ID" });
      return;
    }

    const body = DonateToInitiativeBody.safeParse(req.body);
    if (!body.success) {
      res.status(400).json({ error: "Validation failed", details: body.error.issues });
      return;
    }

    const [initiative] = await db
      .select()
      .from(initiativesTable)
      .where(eq(initiativesTable.id, params.data.id));

    if (!initiative) {
      res.status(404).json({ error: "Initiative not found" });
      return;
    }

    const parsed = insertDonationSchema.safeParse({
      initiativeId: params.data.id,
      donorName: body.data.donorName,
      amount: body.data.amount,
      message: body.data.message ?? null,
    });

    if (!parsed.success) {
      res.status(400).json({ error: "Validation failed" });
      return;
    }

    const [donation] = await db.insert(donationsTable).values(parsed.data).returning();

    const newRaised = initiative.fundingRaised + body.data.amount;
    await db
      .update(initiativesTable)
      .set({ fundingRaised: newRaised })
      .where(eq(initiativesTable.id, initiative.id));

    const milestones = await db
      .select()
      .from(milestonesTable)
      .where(eq(milestonesTable.initiativeId, initiative.id))
      .orderBy(milestonesTable.order);

    for (const milestone of milestones) {
      if (newRaised >= milestone.targetAmount && milestone.status !== "completed") {
        await db
          .update(milestonesTable)
          .set({ status: "completed" })
          .where(eq(milestonesTable.id, milestone.id));
      } else if (newRaised < milestone.targetAmount && milestone.status === "pending" &&
                 milestones.findIndex((m) => m.id === milestone.id) ===
                 milestones.filter((m) => newRaised >= m.targetAmount).length) {
        await db
          .update(milestonesTable)
          .set({ status: "active" })
          .where(eq(milestonesTable.id, milestone.id));
      }
    }

    res.status(201).json({
      id: donation.id,
      donorName: donation.donorName,
      amount: donation.amount,
      message: donation.message,
      createdAt: donation.createdAt.toISOString(),
    });
  } catch (err) {
    logger.error({ err }, "Failed to process donation");
    res.status(500).json({ error: "Failed to process donation" });
  }
});

router.get("/:id/leaderboard", async (req, res) => {
  try {
    const params = GetLeaderboardParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: "Invalid ID" });
      return;
    }

    const topDonors = await db
      .select({
        donorName: donationsTable.donorName,
        totalAmount: sql<number>`SUM(${donationsTable.amount})`.as("total_amount"),
        donationCount: sql<number>`COUNT(*)`.as("donation_count"),
      })
      .from(donationsTable)
      .where(eq(donationsTable.initiativeId, params.data.id))
      .groupBy(donationsTable.donorName)
      .orderBy(desc(sql`SUM(${donationsTable.amount})`))
      .limit(10);

    res.json(
      topDonors.map((d, i) => ({
        rank: i + 1,
        donorName: d.donorName,
        totalAmount: d.totalAmount,
        donationCount: Number(d.donationCount),
      }))
    );
  } catch (err) {
    logger.error({ err }, "Failed to get leaderboard");
    res.status(500).json({ error: "Failed to load leaderboard" });
  }
});

router.get("/:id/updates", async (req, res) => {
  try {
    const idNum = parseInt(req.params.id, 10);
    if (isNaN(idNum)) {
      res.status(400).json({ error: "Invalid ID" });
      return;
    }

    const updates = await db
      .select()
      .from(updatesTable)
      .where(eq(updatesTable.initiativeId, idNum))
      .orderBy(desc(updatesTable.createdAt));

    res.json(
      updates.map((u) => ({
        id: u.id,
        title: u.title,
        content: u.content,
        imageUrl: u.imageUrl ?? null,
        createdAt: u.createdAt.toISOString(),
      }))
    );
  } catch (err) {
    logger.error({ err }, "Failed to get updates");
    res.status(500).json({ error: "Failed to load updates" });
  }
});

router.post("/:id/updates", async (req, res) => {
  try {
    const idNum = parseInt(req.params.id, 10);
    if (isNaN(idNum)) {
      res.status(400).json({ error: "Invalid ID" });
      return;
    }

    const [initiative] = await db
      .select()
      .from(initiativesTable)
      .where(eq(initiativesTable.id, idNum));

    if (!initiative) {
      res.status(404).json({ error: "Initiative not found" });
      return;
    }

    const parsed = insertUpdateSchema.safeParse({
      initiativeId: idNum,
      title: req.body.title,
      content: req.body.content,
      imageUrl: req.body.imageUrl ?? null,
    });

    if (!parsed.success) {
      res.status(400).json({ error: "Validation failed" });
      return;
    }

    const [update] = await db.insert(updatesTable).values(parsed.data).returning();

    res.status(201).json({
      id: update.id,
      title: update.title,
      content: update.content,
      imageUrl: update.imageUrl ?? null,
      createdAt: update.createdAt.toISOString(),
    });
  } catch (err) {
    logger.error({ err }, "Failed to post update");
    res.status(500).json({ error: "Failed to post update" });
  }
});

router.get("/:id/suggested-volunteers", async (req, res) => {
  try {
    const idNum = parseInt(req.params.id, 10);
    if (isNaN(idNum)) {
      res.status(400).json({ error: "Invalid ID" });
      return;
    }

    const [initiative] = await db
      .select()
      .from(initiativesTable)
      .where(eq(initiativesTable.id, idNum));

    if (!initiative) {
      res.status(404).json({ error: "Initiative not found" });
      return;
    }

    const suggestions = getSuggestedVolunteers(initiative.category, initiative.title);
    res.json(suggestions);
  } catch (err) {
    logger.error({ err }, "Failed to get suggested volunteers");
    res.status(500).json({ error: "Failed to load volunteer suggestions" });
  }
});

export default router;
