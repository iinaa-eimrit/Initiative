import { db } from "@workspace/db";
import {
  initiativesTable,
  milestonesTable,
  volunteersTable,
  donationsTable,
  updatesTable,
} from "@workspace/db/schema";
import { sql } from "drizzle-orm";

async function seed() {
  console.log("Clearing existing data...");
  await db.execute(sql`TRUNCATE initiatives, milestones, volunteers, donations, updates RESTART IDENTITY CASCADE`);

  console.log("Seeding initiatives...");

  const initiatives = await db.insert(initiativesTable).values([
    {
      title: "Knowledge Bridge: Teach underprivileged kids mathematics",
      description: "Provide free math tutoring to 200+ children in underserved neighborhoods through community learning centers and volunteer educators.",
      category: "education",
      location: "Community Centers, Oakland CA",
      status: "active",
      lifecycleStage: "active",
      fundingGoal: 15000,
      fundingRaised: 8750,
      volunteerCount: 12,
      creatorName: "Maria Santos",
      imageUrl: null,
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
      title: "Earth Guardians: Urban Forest Restoration Project",
      description: "Restore 50 acres of urban green space by planting 5,000 native trees and establishing community gardens in partnership with local environmental groups.",
      category: "environment",
      location: "Parks & Natural Reserves, Portland OR",
      status: "active",
      lifecycleStage: "planning",
      fundingGoal: 35000,
      fundingRaised: 12500,
      volunteerCount: 28,
      creatorName: "David Chen",
      imageUrl: null,
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
        estimatedBudget: 35000,
        suggestedRoles: ["Environmental Scientist", "Project Lead", "Volunteer Coordinator", "Communications Officer", "Logistics Manager"],
        milestonesTimeline: [
          { title: "Foundation & Research", description: "Environmental assessment and site planning.", targetAmount: 7000, durationWeeks: 3 },
          { title: "Launch & Mobilize", description: "Begin planting with volunteer teams.", targetAmount: 17500, durationWeeks: 4 },
          { title: "Scale & Measure", description: "Expand planting and measure survival rates.", targetAmount: 28000, durationWeeks: 4 },
          { title: "Sustain & Report", description: "Maintenance plan and environmental impact report.", targetAmount: 35000, durationWeeks: 3 },
        ],
      },
    },
    {
      title: "Health for All: Mobile Health Clinics for Rural Communities",
      description: "Deploy mobile health clinics to provide free screenings, vaccinations, and basic medical care to 10 underserved rural communities.",
      category: "healthcare",
      location: "Mobile Clinics, Multiple Communities, TX",
      status: "active",
      lifecycleStage: "active",
      fundingGoal: 45000,
      fundingRaised: 31200,
      volunteerCount: 18,
      creatorName: "Dr. Amara Johnson",
      imageUrl: null,
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
        estimatedBudget: 45000,
        suggestedRoles: ["Medical Director", "Nurse Coordinator", "Community Health Worker", "Logistics Manager", "Data Analyst"],
        milestonesTimeline: [
          { title: "Foundation & Research", description: "Community health assessment and partnerships.", targetAmount: 9000, durationWeeks: 3 },
          { title: "Launch & Mobilize", description: "Deploy first mobile clinic.", targetAmount: 22500, durationWeeks: 4 },
          { title: "Scale & Measure", description: "Expand to additional communities.", targetAmount: 36000, durationWeeks: 4 },
          { title: "Sustain & Report", description: "Long-term care plans and health impact report.", targetAmount: 45000, durationWeeks: 3 },
        ],
      },
    },
    {
      title: "Community Rising: Youth Tech Empowerment Center",
      description: "Build a community technology center offering free coding bootcamps, digital literacy workshops, and career mentorship for underserved youth ages 14-21.",
      category: "community",
      location: "Community Halls, South Chicago IL",
      status: "active",
      lifecycleStage: "idea",
      fundingGoal: 22000,
      fundingRaised: 3200,
      volunteerCount: 5,
      creatorName: "Kwame Robinson",
      imageUrl: null,
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
        estimatedBudget: 22000,
        suggestedRoles: ["Program Director", "Event Coordinator", "Community Facilitator", "Marketing Lead", "Volunteer Manager"],
        milestonesTimeline: [
          { title: "Foundation & Research", description: "Space acquisition and program design.", targetAmount: 4400, durationWeeks: 3 },
          { title: "Launch & Mobilize", description: "Open center and start first bootcamp.", targetAmount: 11000, durationWeeks: 4 },
          { title: "Scale & Measure", description: "Expand course offerings and track outcomes.", targetAmount: 17600, durationWeeks: 4 },
          { title: "Sustain & Report", description: "Sustainability plan and impact assessment.", targetAmount: 22000, durationWeeks: 3 },
        ],
      },
    },
    {
      title: "Green Future: Ocean Plastic Cleanup Initiative",
      description: "Organize coastal cleanup drives and develop a community recycling program to remove 10 tons of plastic waste from local beaches and waterways.",
      category: "environment",
      location: "Coastal & River Systems, San Diego CA",
      status: "active",
      lifecycleStage: "active",
      fundingGoal: 28000,
      fundingRaised: 19800,
      volunteerCount: 42,
      creatorName: "Elena Vasquez",
      imageUrl: null,
      structuredPlan: {
        problemStatement: "Climate change and pollution are destroying habitats and reducing biodiversity at alarming rates.",
        executionSteps: [
          "Research environmental challenges in the target region",
          "Engage community leaders and local government",
          "Develop sustainable intervention strategy",
          "Source eco-friendly materials and tools",
          "Execute cleanup, planting, or conservation activities",
          "Measure environmental recovery metrics",
          "Create a long-term sustainability and maintenance plan",
        ],
        estimatedBudget: 28000,
        suggestedRoles: ["Field Researcher", "Tree Planting Lead", "Waste Management Expert", "Social Media Manager", "Grant Writer"],
        milestonesTimeline: [
          { title: "Foundation & Research", description: "Coastal assessment and volunteer recruitment.", targetAmount: 5600, durationWeeks: 3 },
          { title: "Launch & Mobilize", description: "First major cleanup event.", targetAmount: 14000, durationWeeks: 4 },
          { title: "Scale & Measure", description: "Weekly drives and waste tracking.", targetAmount: 22400, durationWeeks: 4 },
          { title: "Sustain & Report", description: "Recycling infrastructure and impact documentation.", targetAmount: 28000, durationWeeks: 3 },
        ],
      },
    },
    {
      title: "Wellness Initiative: Community Mental Health Support Network",
      description: "Create a free peer support network and mental wellness program offering group therapy, mindfulness workshops, and crisis intervention resources.",
      category: "healthcare",
      location: "Community Health Centers, Denver CO",
      status: "completed",
      lifecycleStage: "impact_delivered",
      fundingGoal: 18000,
      fundingRaised: 18000,
      volunteerCount: 15,
      creatorName: "Dr. Sarah Williams",
      imageUrl: null,
      structuredPlan: {
        problemStatement: "Mental health services remain inaccessible to many, especially in underserved communities.",
        executionSteps: [
          "Map healthcare gaps through community surveys",
          "Build a network of medical professionals and volunteers",
          "Procure essential medications and diagnostic tools",
          "Launch health awareness campaigns in target areas",
          "Provide free consultations and basic treatments",
          "Create patient education materials and resources",
          "Measure impact through health metrics and community feedback",
        ],
        estimatedBudget: 18000,
        suggestedRoles: ["Healthcare Volunteer", "Mental Health Counselor", "Public Health Educator", "Supply Chain Coordinator", "Outreach Specialist"],
        milestonesTimeline: [
          { title: "Foundation & Research", description: "Community mental health survey and partnerships.", targetAmount: 3600, durationWeeks: 3 },
          { title: "Launch & Mobilize", description: "Launch peer support groups.", targetAmount: 9000, durationWeeks: 4 },
          { title: "Scale & Measure", description: "Expand workshops and measure wellness outcomes.", targetAmount: 14400, durationWeeks: 4 },
          { title: "Sustain & Report", description: "Ongoing program and impact report.", targetAmount: 18000, durationWeeks: 3 },
        ],
      },
    },
    {
      title: "Learning for All: Digital Literacy for Seniors",
      description: "Bridge the digital divide by providing free technology training to 500+ seniors, helping them navigate smartphones, video calls, and online services.",
      category: "education",
      location: "Libraries & Senior Centers, Miami FL",
      status: "active",
      lifecycleStage: "planning",
      fundingGoal: 12000,
      fundingRaised: 4200,
      volunteerCount: 8,
      creatorName: "Rachel Kim",
      imageUrl: null,
      structuredPlan: {
        problemStatement: "Educational inequality continues to widen the gap between communities, limiting future opportunities.",
        executionSteps: [
          "Map underserved areas and quantify education gaps",
          "Build partnerships with local NGOs and institutions",
          "Design modular curriculum adaptable to different skill levels",
          "Set up digital learning infrastructure where possible",
          "Begin classes with measurable learning outcomes",
          "Implement student progress tracking system",
          "Publish impact report and plan for expansion",
        ],
        estimatedBudget: 12000,
        suggestedRoles: ["Teaching Volunteer", "Content Creator", "Data Analyst", "Event Coordinator", "Technology Support"],
        milestonesTimeline: [
          { title: "Foundation & Research", description: "Needs assessment and curriculum design.", targetAmount: 2400, durationWeeks: 3 },
          { title: "Launch & Mobilize", description: "Start first training sessions.", targetAmount: 6000, durationWeeks: 4 },
          { title: "Scale & Measure", description: "Expand to more locations.", targetAmount: 9600, durationWeeks: 4 },
          { title: "Sustain & Report", description: "Program sustainability and outcomes report.", targetAmount: 12000, durationWeeks: 3 },
        ],
      },
    },
    {
      title: "Together We Build: Neighborhood Food Security Program",
      description: "Establish a network of community fridges, weekly food distributions, and urban garden plots to combat food insecurity in low-income neighborhoods.",
      category: "community",
      location: "Multiple Neighborhoods, Detroit MI",
      status: "active",
      lifecycleStage: "active",
      fundingGoal: 20000,
      fundingRaised: 14500,
      volunteerCount: 22,
      creatorName: "Marcus Thompson",
      imageUrl: null,
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
        estimatedBudget: 20000,
        suggestedRoles: ["Program Director", "Event Coordinator", "Community Facilitator", "Marketing Lead", "Volunteer Manager"],
        milestonesTimeline: [
          { title: "Foundation & Research", description: "Food desert mapping and partner identification.", targetAmount: 4000, durationWeeks: 3 },
          { title: "Launch & Mobilize", description: "Install first community fridges and start distributions.", targetAmount: 10000, durationWeeks: 4 },
          { title: "Scale & Measure", description: "Expand to additional neighborhoods.", targetAmount: 16000, durationWeeks: 4 },
          { title: "Sustain & Report", description: "Long-term food security plan and impact report.", targetAmount: 20000, durationWeeks: 3 },
        ],
      },
    },
  ]).returning();

  console.log(`Seeded ${initiatives.length} initiatives.`);

  console.log("Seeding milestones...");
  for (const init of initiatives) {
    const plan = init.structuredPlan as any;
    if (plan?.milestonesTimeline) {
      const milestoneValues = plan.milestonesTimeline.map((m: any, idx: number) => {
        let status: "pending" | "active" | "completed" = "pending";
        if (init.fundingRaised >= m.targetAmount) {
          status = "completed";
        } else if (idx === 0 || (idx > 0 && init.fundingRaised >= plan.milestonesTimeline[idx - 1].targetAmount)) {
          status = "active";
        }
        return {
          initiativeId: init.id,
          title: m.title,
          description: m.description,
          targetAmount: m.targetAmount,
          fundsLocked: m.targetAmount,
          status,
          order: idx + 1,
        };
      });
      await db.insert(milestonesTable).values(milestoneValues);
    }
  }

  console.log("Seeding volunteers...");
  const volunteerData = [
    { initiativeId: initiatives[0].id, name: "Alex Rivera", email: "alex@example.com", message: "Passionate about education equity!", skills: "Teaching,Mentoring,Mathematics" },
    { initiativeId: initiatives[0].id, name: "Jessica Park", email: "jessica@example.com", message: "Former math teacher looking to help", skills: "Curriculum Design,Teaching,Data Analysis" },
    { initiativeId: initiatives[0].id, name: "Omar Hassan", email: "omar@example.com", message: null, skills: "Youth Programs,Community Outreach" },
    { initiativeId: initiatives[1].id, name: "Sophie Laurent", email: "sophie@example.com", message: "Environmental science PhD candidate", skills: "Environmental Science,Research,GIS Mapping" },
    { initiativeId: initiatives[1].id, name: "Ryan Cooper", email: "ryan@example.com", message: "Want to make Portland greener!", skills: "Logistics,Volunteer Coordination" },
    { initiativeId: initiatives[2].id, name: "Dr. Lisa Zhang", email: "lisa@example.com", message: "Board-certified family physician", skills: "Medicine,Public Health,Spanish" },
    { initiativeId: initiatives[2].id, name: "Nurse Mike Davis", email: "mike@example.com", message: "10 years in community health", skills: "Nursing,First Aid,Health Education" },
    { initiativeId: initiatives[3].id, name: "Tanya Brooks", email: "tanya@example.com", message: "Software engineer wanting to give back", skills: "Web Development,UI/UX Design,Python" },
    { initiativeId: initiatives[4].id, name: "Carlos Rivera", email: "carlos@example.com", message: "Surfer and ocean advocate", skills: "Event Planning,Social Media,Photography" },
    { initiativeId: initiatives[4].id, name: "Maya Thompson", email: "maya@example.com", message: "Environmental policy researcher", skills: "Environmental Policy,Grant Writing,Research" },
    { initiativeId: initiatives[7].id, name: "James Wilson", email: "james@example.com", message: "Former chef, know about food systems", skills: "Logistics,Community Organizing,Cooking" },
  ];
  await db.insert(volunteersTable).values(volunteerData);

  console.log("Seeding donations...");
  const donationData = [
    { initiativeId: initiatives[0].id, donorName: "Anonymous Donor", amount: 2500, message: "Keep teaching! Education changes lives." },
    { initiativeId: initiatives[0].id, donorName: "Tech for Good Foundation", amount: 5000, message: "Proud to support math education" },
    { initiativeId: initiatives[0].id, donorName: "Sarah Mitchell", amount: 1250, message: null },
    { initiativeId: initiatives[1].id, donorName: "Green Earth Fund", amount: 7500, message: "For a greener Portland" },
    { initiativeId: initiatives[1].id, donorName: "Portland Community Trust", amount: 5000, message: "Matching community donations" },
    { initiativeId: initiatives[2].id, donorName: "Healthcare Heroes Foundation", amount: 15000, message: "Healthcare is a right" },
    { initiativeId: initiatives[2].id, donorName: "Regional Health Board", amount: 10000, message: "Supporting rural health access" },
    { initiativeId: initiatives[2].id, donorName: "Dr. Robert Chen", amount: 6200, message: "From one physician to another" },
    { initiativeId: initiatives[3].id, donorName: "Tech Innovation Fund", amount: 2000, message: "Investing in youth tech" },
    { initiativeId: initiatives[3].id, donorName: "Anonymous", amount: 1200, message: null },
    { initiativeId: initiatives[4].id, donorName: "Ocean Conservation Trust", amount: 10000, message: "Protecting our oceans" },
    { initiativeId: initiatives[4].id, donorName: "Beach Lovers Association", amount: 5800, message: null },
    { initiativeId: initiatives[4].id, donorName: "Marine Biology Dept UCSD", amount: 4000, message: "Supporting student-led conservation" },
    { initiativeId: initiatives[5].id, donorName: "Mental Wellness Foundation", amount: 8000, message: "Mental health matters" },
    { initiativeId: initiatives[5].id, donorName: "Colorado Health Trust", amount: 6000, message: null },
    { initiativeId: initiatives[5].id, donorName: "Community Members (pooled)", amount: 4000, message: "Together we heal" },
    { initiativeId: initiatives[6].id, donorName: "Digital Inclusion Fund", amount: 2500, message: "Closing the digital divide" },
    { initiativeId: initiatives[6].id, donorName: "AARP Local Chapter", amount: 1700, message: "For our seniors" },
    { initiativeId: initiatives[7].id, donorName: "Detroit Food Coalition", amount: 8000, message: "Ending hunger in Detroit" },
    { initiativeId: initiatives[7].id, donorName: "Urban Agriculture Grant", amount: 4500, message: null },
    { initiativeId: initiatives[7].id, donorName: "Community Foundation", amount: 2000, message: "Stronger together" },
  ];
  await db.insert(donationsTable).values(donationData);

  console.log("Seeding updates...");
  const now = new Date();
  const updatesData = [
    { initiativeId: initiatives[0].id, title: "First tutoring session completed!", content: "We held our first math tutoring session with 25 students at the Oakland Community Center. The energy was incredible — kids were solving problems they'd never attempted before. Three volunteer teachers showed up and we're already planning the next session.", imageUrl: null, createdAt: new Date(now.getTime() - 7 * 86400000) },
    { initiativeId: initiatives[0].id, title: "Partnership with Oakland Unified School District", content: "Exciting news! We've officially partnered with OUSD to provide after-school math tutoring across 4 schools. This means dedicated classroom space and access to school resources for our volunteers.", imageUrl: null, createdAt: new Date(now.getTime() - 14 * 86400000) },
    { initiativeId: initiatives[0].id, title: "Student progress report — Week 4", content: "After 4 weeks, our initial cohort of 25 students has shown an average 23% improvement in math assessment scores. Three students who were below grade level are now performing at grade level. We're incredibly proud of their progress.", imageUrl: null, createdAt: new Date(now.getTime() - 3 * 86400000) },
    { initiativeId: initiatives[1].id, title: "Site assessment complete", content: "Our team of environmental scientists completed the 50-acre assessment. We identified 12 priority zones for native tree planting and 3 areas suitable for community gardens. The soil analysis shows strong potential for forest restoration.", imageUrl: null, createdAt: new Date(now.getTime() - 10 * 86400000) },
    { initiativeId: initiatives[1].id, title: "1,000 trees planted!", content: "We hit our first major milestone — 1,000 native trees are now in the ground! 85 volunteers showed up for our planting weekend, including families and local scout troops. The community response has been overwhelming.", imageUrl: null, createdAt: new Date(now.getTime() - 5 * 86400000) },
    { initiativeId: initiatives[2].id, title: "First mobile clinic deployed", content: "Our first mobile health clinic made its maiden trip to rural Jefferson County. In one day, we conducted 47 health screenings, administered 23 vaccinations, and provided 15 primary care consultations. Several conditions were caught early.", imageUrl: null, createdAt: new Date(now.getTime() - 12 * 86400000) },
    { initiativeId: initiatives[2].id, title: "Second clinic added to fleet", content: "Thanks to generous donations, we've added a second mobile clinic! This doubles our capacity and allows us to serve two communities simultaneously. New vehicle is equipped with diagnostic equipment and a small pharmacy.", imageUrl: null, createdAt: new Date(now.getTime() - 6 * 86400000) },
    { initiativeId: initiatives[2].id, title: "500 patients served milestone", content: "We've now served over 500 patients across 10 communities. Follow-up surveys show 94% satisfaction rate and multiple cases where early detection led to life-saving interventions.", imageUrl: null, createdAt: new Date(now.getTime() - 2 * 86400000) },
    { initiativeId: initiatives[4].id, title: "First beach cleanup — 2 tons collected!", content: "Our inaugural cleanup event at Mission Beach removed over 2 tons of plastic waste. 120 volunteers participated, making it one of the largest community cleanups in San Diego this year.", imageUrl: null, createdAt: new Date(now.getTime() - 8 * 86400000) },
    { initiativeId: initiatives[4].id, title: "Recycling partnership established", content: "We've partnered with San Diego Recycling Co-op to process collected materials. They'll handle sorting and recycling at no cost, and profits from recyclable materials will fund future cleanups.", imageUrl: null, createdAt: new Date(now.getTime() - 4 * 86400000) },
    { initiativeId: initiatives[5].id, title: "Program completed — Final impact report", content: "Our community mental health program has concluded its initial phase. Over 6 months, we served 312 individuals through peer support groups, conducted 48 mindfulness workshops, and established an ongoing crisis intervention hotline. 87% of participants reported improved mental wellness.", imageUrl: null, createdAt: new Date(now.getTime() - 1 * 86400000) },
    { initiativeId: initiatives[7].id, title: "10 community fridges installed", content: "We've installed 10 community fridges across Detroit neighborhoods. Each fridge is stocked daily by local restaurants and grocery stores donating surplus food. In the first week alone, we distributed over 2,000 meals worth of food.", imageUrl: null, createdAt: new Date(now.getTime() - 9 * 86400000) },
    { initiativeId: initiatives[7].id, title: "Urban garden plots breaking ground", content: "Breaking ground on our first 6 urban garden plots in partnership with the Detroit Land Bank. Community members have already signed up for 40 of the 50 available plots. Spring planting begins next month!", imageUrl: null, createdAt: new Date(now.getTime() - 3 * 86400000) },
  ];
  await db.insert(updatesTable).values(updatesData);

  console.log("Seed complete!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
