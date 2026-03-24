import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import {
  initiativesTable,
  milestonesTable,
  volunteersTable,
  donationsTable,
  insertInitiativeSchema,
  insertVolunteerSchema,
  insertDonationSchema,
} from "@workspace/db/schema";
import { eq, ilike, or, sql, desc } from "drizzle-orm";
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

const router: IRouter = Router();

router.get("/", async (req, res) => {
  const query = ListInitiativesQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: "Invalid query parameters" });
    return;
  }

  const { category, status, search } = query.data;

  let dbQuery = db.select().from(initiativesTable);
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

  res.json(initiatives.map(formatInitiative));
});

router.post("/", async (req, res) => {
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

  // Create default milestones
  await db.insert(milestonesTable).values([
    {
      initiativeId: initiative.id,
      title: "Launch & Awareness",
      description: "Launch the initiative and raise initial awareness in the community.",
      targetAmount: initiative.fundingGoal * 0.25,
      status: "active",
      order: 1,
    },
    {
      initiativeId: initiative.id,
      title: "Community Building",
      description: "Grow the volunteer network and establish key partnerships.",
      targetAmount: initiative.fundingGoal * 0.5,
      status: "pending",
      order: 2,
    },
    {
      initiativeId: initiative.id,
      title: "Full Implementation",
      description: "Execute the core mission and deliver measurable impact.",
      targetAmount: initiative.fundingGoal,
      status: "pending",
      order: 3,
    },
  ]);

  res.status(201).json(formatInitiative(initiative));
});

router.get("/:id", async (req, res) => {
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

  res.json({
    ...formatInitiative(initiative),
    milestones: milestones.map((m) => ({
      id: m.id,
      title: m.title,
      description: m.description,
      targetAmount: m.targetAmount,
      status: m.status,
      order: m.order,
    })),
    volunteers: volunteers.map((v) => ({
      id: v.id,
      name: v.name,
      email: v.email,
      message: v.message,
      joinedAt: v.joinedAt.toISOString(),
    })),
    topDonors: topDonors.map((d, i) => ({
      rank: i + 1,
      donorName: d.donorName,
      totalAmount: d.totalAmount,
      donationCount: Number(d.donationCount),
    })),
  });
});

router.post("/:id/volunteer", async (req, res) => {
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
    joinedAt: volunteer.joinedAt.toISOString(),
  });
});

router.post("/:id/donate", async (req, res) => {
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

  // Update milestone statuses based on funding progress
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
});

router.get("/:id/leaderboard", async (req, res) => {
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
});

function formatInitiative(i: typeof initiativesTable.$inferSelect) {
  return {
    id: i.id,
    title: i.title,
    description: i.description,
    category: i.category,
    location: i.location,
    status: i.status,
    fundingGoal: i.fundingGoal,
    fundingRaised: i.fundingRaised,
    volunteerCount: i.volunteerCount,
    createdAt: i.createdAt.toISOString(),
    creatorName: i.creatorName,
    imageUrl: i.imageUrl ?? null,
  };
}

export default router;
