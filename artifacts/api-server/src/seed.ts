import { db } from "@workspace/db";
import {
  initiativesTable,
  milestonesTable,
  volunteersTable,
  donationsTable,
  updatesTable,
  usersTable,
} from "@workspace/db/schema";
import { count } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { logger } from "./lib/logger";

export async function ensureDemoData() {
  const [result] = await db.select({ count: count() }).from(initiativesTable);
  if (result.count > 0) {
    logger.info({ count: result.count }, "Database has data, skipping seed");
    return;
  }

  logger.info("Database empty — seeding demo data...");
  try {
    await db.transaction(async (tx) => {
      await seedWithTx(tx);
    });
    logger.info("Demo data seeded successfully");
  } catch (err) {
    logger.error({ err }, "Failed to seed demo data — continuing without seed");
  }
}

async function seedWithTx(tx: Parameters<Parameters<typeof db.transaction>[0]>[0]) {
  try {
    const passwordHash = await bcrypt.hash("demo123", 10);

    await tx.insert(usersTable).values([
      { name: "Maria Santos", email: "maria@example.com", passwordHash, role: "changemaker", skills: "Teaching, Leadership, Community Outreach", bio: "Passionate educator dedicated to closing the achievement gap in underserved communities." },
      { name: "James Chen", email: "james@example.com", passwordHash, role: "organizer", skills: "Engineering, Project Management, Research", bio: "Environmental scientist and community organizer working to restore urban ecosystems." },
      { name: "Dr. Aisha Patel", email: "aisha@example.com", passwordHash, role: "changemaker", skills: "Healthcare, Data Analysis, Leadership", bio: "Public health physician bringing mobile healthcare to rural communities." },
      { name: "Derek Williams", email: "derek@example.com", passwordHash, role: "volunteer", skills: "Marketing, Design, Community Outreach", bio: "Youth mentor and community builder connecting at-risk youth with professional mentors." },
      { name: "Demo User", email: "demo@initiative.app", passwordHash, role: "changemaker", skills: "Design, Engineering, Marketing", bio: "Demo account for exploring the Initiative platform." },
    ]);

    const initiatives = [
      {
        title: "Knowledge Bridge: Teach underprivileged kids mathematics",
        description: "Provide free math tutoring to 200+ children in underserved neighborhoods through community learning centers and volunteer educators.",
        category: "education",
        location: "Community Centers, Oakland CA",
        status: "active" as const,
        lifecycleStage: "active" as const,
        fundingGoal: 15000,
        fundingRaised: 8750,
        volunteerCount: 12,
        creatorName: "Maria Santos",
        structuredPlan: {
          problemStatement: "Millions of children lack access to quality education, creating cycles of poverty and inequality.",
          executionSteps: [
            "Conduct community needs assessment and identify target demographics",
            "Partner with local schools and community centers for venue access",
            "Recruit and train qualified volunteer educators",
            "Develop age-appropriate curriculum and learning materials",
            "Launch pilot program with initial cohort of students",
            "Collect feedback and iterate on teaching methodology",
            "Scale program to additional locations based on results",
          ],
          estimatedBudget: 15000,
          suggestedRoles: ["Lead Educator", "Curriculum Designer", "Community Outreach Coordinator", "Student Mentor", "Operations Manager"],
          milestonesTimeline: [
            { title: "Foundation & Research", description: "Establish partnerships and finalize the curriculum.", targetAmount: 3000, durationWeeks: 3 },
            { title: "Launch & Mobilize", description: "Begin tutoring sessions with first cohort.", targetAmount: 7500, durationWeeks: 4 },
            { title: "Scale & Measure", description: "Expand to 3 locations and track learning outcomes.", targetAmount: 12000, durationWeeks: 4 },
            { title: "Sustain & Report", description: "Secure long-term funding and publish impact report.", targetAmount: 15000, durationWeeks: 3 },
          ],
        },
      },
      {
        title: "Green Future: Clean the riverside and restore the ecosystem",
        description: "Organize community-led cleanup and restoration of 5km of polluted riverbank, planting 1,000 native trees and establishing a monitoring program.",
        category: "environment",
        location: "River District, Portland OR",
        status: "active" as const,
        lifecycleStage: "planning" as const,
        fundingGoal: 25000,
        fundingRaised: 6200,
        volunteerCount: 8,
        creatorName: "James Chen",
        structuredPlan: {
          problemStatement: "Environmental degradation threatens ecosystems and communities that depend on natural resources.",
          executionSteps: [
            "Conduct environmental impact assessment of target area",
            "Build coalition with local environmental organizations",
            "Design restoration or conservation action plan",
            "Secure necessary permits and materials",
            "Organize volunteer drives for on-ground action",
            "Implement monitoring systems for progress tracking",
            "Document results and share with stakeholders",
          ],
          estimatedBudget: 25000,
          suggestedRoles: ["Environmental Scientist", "Project Lead", "Volunteer Coordinator", "Communications Officer", "Logistics Manager"],
          milestonesTimeline: [
            { title: "Assessment & Planning", description: "Complete environmental survey and action plan.", targetAmount: 5000, durationWeeks: 3 },
            { title: "First Cleanup Drive", description: "Organize and execute first major cleanup event.", targetAmount: 12500, durationWeeks: 4 },
            { title: "Tree Planting Phase", description: "Plant 1000 native trees along the riverbank.", targetAmount: 20000, durationWeeks: 4 },
            { title: "Monitoring Setup", description: "Install monitoring equipment and publish report.", targetAmount: 25000, durationWeeks: 3 },
          ],
        },
      },
      {
        title: "Health for All: Mobile clinic for rural communities",
        description: "Deploy a mobile health clinic providing free checkups, vaccinations, and health education to 3 underserved rural communities.",
        category: "healthcare",
        location: "Rural Counties, Tennessee",
        status: "active" as const,
        lifecycleStage: "active" as const,
        fundingGoal: 35000,
        fundingRaised: 22000,
        volunteerCount: 15,
        creatorName: "Dr. Aisha Patel",
        structuredPlan: {
          problemStatement: "Limited healthcare access leaves vulnerable populations without essential medical services.",
          executionSteps: [
            "Identify underserved communities and assess health needs",
            "Partner with healthcare providers and medical volunteers",
            "Secure medical supplies and equipment",
            "Set up mobile health clinics or community health points",
            "Conduct health screenings and awareness workshops",
            "Establish referral networks for ongoing care",
            "Track health outcomes and patient follow-ups",
          ],
          estimatedBudget: 35000,
          suggestedRoles: ["Medical Director", "Nurse Coordinator", "Community Health Worker", "Logistics Manager", "Data Analyst"],
          milestonesTimeline: [
            { title: "Clinic Setup", description: "Acquire vehicle, equipment, and initial supplies.", targetAmount: 10000, durationWeeks: 4 },
            { title: "First Community Visit", description: "Launch clinic in first community with full services.", targetAmount: 20000, durationWeeks: 4 },
            { title: "Expand to 3 Communities", description: "Extend services to remaining two communities.", targetAmount: 30000, durationWeeks: 6 },
            { title: "Sustain & Report", description: "Secure ongoing funding and publish health outcomes.", targetAmount: 35000, durationWeeks: 3 },
          ],
        },
      },
      {
        title: "Community Rising: Youth mentorship program",
        description: "Connect at-risk youth with professional mentors for career guidance, skill development, and personal growth through weekly one-on-one sessions.",
        category: "community",
        location: "Community Hub, Chicago IL",
        status: "active" as const,
        lifecycleStage: "idea" as const,
        fundingGoal: 12000,
        fundingRaised: 1500,
        volunteerCount: 4,
        creatorName: "Derek Williams",
        structuredPlan: {
          problemStatement: "Communities lack safe gathering spaces and programs that foster connection and mutual support.",
          executionSteps: [
            "Survey community needs and identify priority areas",
            "Secure a physical or virtual space for programming",
            "Design inclusive community programs and events",
            "Recruit local leaders and facilitators",
            "Launch initial programming with outreach",
            "Gather participant feedback and adjust offerings",
            "Build sustainable funding and volunteer pipeline",
          ],
          estimatedBudget: 12000,
          suggestedRoles: ["Program Director", "Event Coordinator", "Community Facilitator", "Marketing Lead", "Volunteer Manager"],
          milestonesTimeline: [
            { title: "Program Design", description: "Design mentorship framework and recruit mentors.", targetAmount: 3000, durationWeeks: 3 },
            { title: "Pilot Launch", description: "Match first cohort of 20 mentor-mentee pairs.", targetAmount: 6000, durationWeeks: 4 },
            { title: "Scale & Refine", description: "Expand to 50 pairs based on pilot feedback.", targetAmount: 10000, durationWeeks: 4 },
            { title: "Sustain", description: "Secure ongoing sponsorships and publish outcomes.", targetAmount: 12000, durationWeeks: 3 },
          ],
        },
      },
    ];

    for (const init of initiatives) {
      const [inserted] = await tx.insert(initiativesTable).values(init).returning();
      const plan = inserted.structuredPlan as any;

      if (plan?.milestonesTimeline) {
        const milestoneValues = plan.milestonesTimeline.map((m: any, idx: number) => {
          let status: "completed" | "active" | "pending" = "pending";
          if (inserted.fundingRaised >= m.targetAmount) status = "completed";
          else if (idx === 0 || inserted.fundingRaised >= plan.milestonesTimeline[idx - 1]?.targetAmount) status = "active";
          return {
            initiativeId: inserted.id,
            title: m.title,
            description: m.description,
            targetAmount: m.targetAmount,
            fundsLocked: m.targetAmount,
            status,
            order: idx + 1,
          };
        });
        await tx.insert(milestonesTable).values(milestoneValues);
      }

      if (inserted.fundingRaised > 0) {
        const donors = [
          { donorName: "Tech for Good Foundation", amount: Math.round(inserted.fundingRaised * 0.4) },
          { donorName: "Anonymous Donor", amount: Math.round(inserted.fundingRaised * 0.35) },
          { donorName: "Sarah Mitchell", amount: Math.round(inserted.fundingRaised * 0.25) },
        ];
        for (const d of donors) {
          await tx.insert(donationsTable).values({ initiativeId: inserted.id, ...d });
        }
      }

      if (inserted.volunteerCount > 0) {
        const names = ["Alex Rivera", "Priya Sharma", "Marcus Johnson", "Yuki Tanaka"];
        for (let v = 0; v < Math.min(inserted.volunteerCount, names.length); v++) {
          await tx.insert(volunteersTable).values({
            initiativeId: inserted.id,
            name: names[v],
            email: `${names[v].toLowerCase().replace(" ", ".")}@example.com`,
            skills: ["Teaching", "Design", "Engineering", "Communication"][v],
          });
        }
      }

      const updateTitles = [
        "Progress update — Week 4",
        "First milestone completed!",
        "Community partnership secured",
      ];
      for (let u = 0; u < Math.min(3, updateTitles.length); u++) {
        const daysAgo = (u + 1) * 4;
        await tx.insert(updatesTable).values({
          initiativeId: inserted.id,
          title: updateTitles[u],
          content: `Exciting progress on ${inserted.title}. We're seeing real impact in the community and building momentum for the next phase.`,
          createdAt: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000),
        });
      }
    }
  } catch (err) {
    throw err;
  }
}
