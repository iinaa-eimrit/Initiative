import { db } from "@workspace/db";
import {
  initiativesTable,
  milestonesTable,
  volunteersTable,
  donationsTable,
  updatesTable,
  blogsTable,
  usersTable,
} from "@workspace/db/schema";
import { count, eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { logger } from "./lib/logger";

const EXPECTED_SEED_COUNT = 11;
const SEED_MARKER_TITLE = "Vidya Setu: Bridge to Learning for Tribal Children";

export async function ensureDemoData() {
  const [result] = await db.select({ count: count() }).from(initiativesTable);

  if (result.count > 0) {
    const [marker] = await db
      .select({ count: count() })
      .from(initiativesTable)
      .where(eq(initiativesTable.title, SEED_MARKER_TITLE));

    if (marker.count > 0 && result.count === EXPECTED_SEED_COUNT) {
      logger.info({ count: result.count }, "Database has current seed data, skipping");
      return;
    }

    logger.info({ count: result.count }, "Stale data detected — clearing and re-seeding...");
    await db.delete(blogsTable);
    await db.delete(updatesTable);
    await db.delete(donationsTable);
    await db.delete(volunteersTable);
    await db.delete(milestonesTable);
    await db.delete(initiativesTable);
    await db.delete(usersTable);
  }

  logger.info("Seeding demo data...");
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
  const passwordHash = await bcrypt.hash("demo123", 10);

  await tx.insert(usersTable).values([
    { name: "Ananya Sharma", email: "ananya@initiative.app", passwordHash, role: "changemaker", skills: "Education, Community Outreach, Curriculum Design", bio: "Former school teacher building bridges between rural students and quality education." },
    { name: "Vikram Desai", email: "vikram@initiative.app", passwordHash, role: "organizer", skills: "Environmental Science, Sustainability, Project Management", bio: "Environmental engineer restoring mangroves and coastal ecosystems across western India." },
    { name: "Dr. Meera Nair", email: "meera@initiative.app", passwordHash, role: "changemaker", skills: "Public Health, Telemedicine, Data Analytics", bio: "Rural health specialist who has brought healthcare access to 50,000+ underserved patients." },
    { name: "Rahul Joshi", email: "rahul@initiative.app", passwordHash, role: "volunteer", skills: "Youth Development, Sports Coaching, Fundraising", bio: "Youth mentor who believes every child deserves a shot at their dreams." },
    { name: "Kavitha Reddy", email: "kavitha@initiative.app", passwordHash, role: "changemaker", skills: "Women's Rights, Financial Literacy, Micro-Enterprise", bio: "Empowering women through financial independence and self-help group networks." },
    { name: "Arjun Mehta", email: "arjun@initiative.app", passwordHash, role: "organizer", skills: "Solar Energy, Agriculture, Rural Infrastructure", bio: "Bringing clean energy solutions to off-grid farming communities." },
    { name: "Fatima Sheikh", email: "fatima@initiative.app", passwordHash, role: "changemaker", skills: "Handicrafts, E-commerce, Design Thinking", bio: "Connecting traditional artisans with modern markets through digital platforms." },
    { name: "Sanjay Patil", email: "sanjay@initiative.app", passwordHash, role: "organizer", skills: "Urban Planning, Waste Management, Community Organizing", bio: "Turning waste into wealth through community-driven recycling networks." },
  ]);

  const initiatives = [
    {
      title: "Vidya Setu: Bridge to Learning for Tribal Children",
      description: "Providing quality education to 350 tribal children in remote Jharkhand villages through mobile learning centers, trained local teachers, and culturally relevant curriculum. Each center includes a mini-library, tablets preloaded with lessons in local languages, and weekly community gatherings where parents can track their children's progress.",
      category: "education",
      location: "Ranchi, Jharkhand, India",
      status: "active" as const,
      lifecycleStage: "active" as const,
      fundingGoal: 500000,
      fundingRaised: 310000,
      volunteerCount: 18,
      creatorName: "Ananya Sharma",
      structuredPlan: {
        problemStatement: "78% of tribal children in Jharkhand's remote blocks drop out before Class 8 due to lack of schools, trained teachers, and culturally relevant materials within walking distance.",
        executionSteps: [
          "Map 12 target villages and identify community spaces for learning centers",
          "Recruit and train 24 local youth as para-teachers with 3-week immersive training",
          "Develop curriculum in Ho, Santhali, and Hindi with visual learning aids",
          "Distribute tablets preloaded with offline educational content",
          "Launch daily 3-hour learning sessions in each village",
          "Conduct monthly parent-teacher meets and community feedback sessions",
          "Track attendance, learning outcomes, and publish quarterly progress reports",
        ],
        estimatedBudget: 500000,
        suggestedRoles: ["Lead Educator", "Curriculum Designer", "Community Mobilizer", "Tech Support", "Impact Researcher"],
        milestonesTimeline: [
          { title: "Village Mapping & Teacher Training", description: "Identify villages, set up centers, and complete teacher training.", targetAmount: 80000, durationWeeks: 4 },
          { title: "Curriculum & Material Development", description: "Finalize multilingual curriculum and procure tablets and books.", targetAmount: 200000, durationWeeks: 5 },
          { title: "Launch Learning Centers", description: "Begin daily classes in all 12 villages with 350 enrolled children.", targetAmount: 380000, durationWeeks: 6 },
          { title: "Assessment & Scale", description: "Conduct first learning assessments and plan expansion to neighboring blocks.", targetAmount: 500000, durationWeeks: 4 },
        ],
      },
    },
    {
      title: "Hariyali: Mangrove Restoration Along the Konkan Coast",
      description: "Restoring 200 acres of degraded mangrove forests along the Konkan coast by planting 50,000 saplings and training 15 fishing villages in mangrove conservation. Healthy mangroves protect coastlines from storms, nurture fish breeding grounds, and sequester carbon — directly benefiting 8,000 coastal families.",
      category: "environment",
      location: "Ratnagiri, Maharashtra, India",
      status: "active" as const,
      lifecycleStage: "active" as const,
      fundingGoal: 750000,
      fundingRaised: 485000,
      volunteerCount: 14,
      creatorName: "Vikram Desai",
      structuredPlan: {
        problemStatement: "The Konkan coast has lost 40% of its mangrove cover in two decades, leaving fishing communities vulnerable to cyclones and declining fish stocks.",
        executionSteps: [
          "Conduct ecological survey of 200 acres of degraded mangrove areas",
          "Set up 3 community nurseries growing native mangrove species",
          "Organize monthly planting drives with local fishermen and volunteers",
          "Train 15 village committees as mangrove guardians",
          "Install tide-monitoring equipment at key restoration sites",
          "Document biodiversity recovery through quarterly wildlife surveys",
          "Publish open-source restoration playbook for other coastal communities",
        ],
        estimatedBudget: 750000,
        suggestedRoles: ["Marine Ecologist", "Nursery Manager", "Community Trainer", "GIS Specialist", "Communications Lead"],
        milestonesTimeline: [
          { title: "Ecological Survey & Nursery Setup", description: "Complete coastal survey and establish 3 nurseries.", targetAmount: 120000, durationWeeks: 4 },
          { title: "First Planting Phase", description: "Plant 20,000 saplings across 80 acres with community drives.", targetAmount: 320000, durationWeeks: 6 },
          { title: "Community Training Program", description: "Train all 15 village committees and install monitoring equipment.", targetAmount: 550000, durationWeeks: 5 },
          { title: "Full Restoration & Documentation", description: "Complete planting of 50,000 saplings and publish restoration playbook.", targetAmount: 750000, durationWeeks: 5 },
        ],
      },
    },
    {
      title: "Sehat Gaadi: Mobile Health Clinics for Rural Bihar",
      description: "Deploying 3 fully equipped mobile health vans to reach 40,000+ patients across 60 remote villages in Bihar where the nearest hospital is over 50 km away. Services include maternal health checkups, vaccinations, diabetes/BP screening, and telemedicine consultations with specialists in Patna.",
      category: "healthcare",
      location: "Madhubani, Bihar, India",
      status: "active" as const,
      lifecycleStage: "planning" as const,
      fundingGoal: 900000,
      fundingRaised: 225000,
      volunteerCount: 8,
      creatorName: "Dr. Meera Nair",
      structuredPlan: {
        problemStatement: "60 villages in Madhubani district have zero primary healthcare facilities. Maternal mortality is 3x the national average, and preventable diseases go undiagnosed until emergency stage.",
        executionSteps: [
          "Map 60 villages and create weekly rotation schedule for 3 vans",
          "Equip vans with diagnostic tools, pharmacy supplies, and telemedicine kits",
          "Recruit 3 doctors, 6 nurses, and 12 community health workers",
          "Partner with district hospital for specialist referrals",
          "Launch weekly health camps with maternal care priority",
          "Establish patient record system with follow-up tracking",
          "Conduct health awareness workshops in every village",
        ],
        estimatedBudget: 900000,
        suggestedRoles: ["Medical Director", "Nurse Coordinator", "Community Health Worker", "Logistics Manager", "Telemedicine Specialist"],
        milestonesTimeline: [
          { title: "Vehicle & Equipment Procurement", description: "Purchase and equip 3 mobile health vans.", targetAmount: 350000, durationWeeks: 5 },
          { title: "Team Recruitment & Training", description: "Hire and train medical staff and health workers.", targetAmount: 500000, durationWeeks: 4 },
          { title: "Pilot in 20 Villages", description: "Launch weekly clinics in first 20 villages.", targetAmount: 700000, durationWeeks: 6 },
          { title: "Full Coverage & Impact Report", description: "Expand to all 60 villages and publish health impact data.", targetAmount: 900000, durationWeeks: 5 },
        ],
      },
    },
    {
      title: "Umeed: Sports Academy for Underprivileged Youth",
      description: "Building a free sports academy for 200 underprivileged children in Dharavi providing professional coaching in cricket, football, and kabaddi along with fitness training, nutrition support, and academic tutoring. Sport becomes the vehicle for discipline, confidence, and a path out of poverty.",
      category: "community",
      location: "Mumbai, Maharashtra, India",
      status: "active" as const,
      lifecycleStage: "active" as const,
      fundingGoal: 400000,
      fundingRaised: 280000,
      volunteerCount: 16,
      creatorName: "Rahul Joshi",
      structuredPlan: {
        problemStatement: "Children in Dharavi have no access to organized sports, safe play spaces, or professional coaching — 70% are at risk of dropping out of school and falling into substance abuse.",
        executionSteps: [
          "Secure partnership with municipal ground for daily training sessions",
          "Recruit 6 certified coaches across cricket, football, and kabaddi",
          "Enroll first batch of 200 children through community drives",
          "Provide sports equipment, uniforms, and nutrition supplements",
          "Set up weekly academic tutoring sessions alongside sports training",
          "Organize inter-community tournaments every quarter",
          "Track academic performance and behavioral improvements",
        ],
        estimatedBudget: 400000,
        suggestedRoles: ["Head Coach", "Sports Coordinator", "Nutritionist", "Academic Tutor", "Community Outreach Lead"],
        milestonesTimeline: [
          { title: "Ground & Coach Setup", description: "Secure venue and recruit coaching staff.", targetAmount: 80000, durationWeeks: 3 },
          { title: "Enrollment & Equipment", description: "Enroll 200 children and distribute sports gear.", targetAmount: 180000, durationWeeks: 4 },
          { title: "Full Training Program", description: "Launch daily coaching and weekly tutoring sessions.", targetAmount: 320000, durationWeeks: 6 },
          { title: "First Tournament & Report", description: "Host inter-community tournament and publish outcomes.", targetAmount: 400000, durationWeeks: 3 },
        ],
      },
    },
    {
      title: "Shakti: Self-Help Groups for Rural Women Entrepreneurs",
      description: "Forming and training 40 women's self-help groups across 20 villages in Rajasthan, equipping 500 women with savings management, business planning, and digital payment skills. Each group receives seed capital to launch micro-enterprises — from dairy farming to tailoring to pickle-making.",
      category: "women empowerment",
      location: "Udaipur, Rajasthan, India",
      status: "active" as const,
      lifecycleStage: "active" as const,
      fundingGoal: 600000,
      fundingRaised: 410000,
      volunteerCount: 12,
      creatorName: "Kavitha Reddy",
      structuredPlan: {
        problemStatement: "Only 22% of rural women in Rajasthan have bank accounts. Without financial access or business skills, women remain economically dependent despite possessing marketable skills.",
        executionSteps: [
          "Identify 20 target villages and conduct community awareness camps",
          "Form 40 self-help groups of 12-15 women each",
          "Deliver 8-week financial literacy and business planning curriculum",
          "Train women on UPI payments, basic accounting, and record-keeping",
          "Disburse seed capital to groups with strongest business plans",
          "Connect groups with local markets, cooperatives, and wholesale buyers",
          "Track income growth, savings rates, and business sustainability",
        ],
        estimatedBudget: 600000,
        suggestedRoles: ["Program Director", "Financial Trainer", "Business Mentor", "Community Mobilizer", "Market Linkage Officer"],
        milestonesTimeline: [
          { title: "Village Outreach & Group Formation", description: "Form 40 SHGs across 20 villages with 500 women enrolled.", targetAmount: 100000, durationWeeks: 4 },
          { title: "Financial Literacy Training", description: "Complete 8-week training across all groups.", targetAmount: 250000, durationWeeks: 6 },
          { title: "Seed Capital Disbursement", description: "Award seed grants to 25 top-performing groups.", targetAmount: 450000, durationWeeks: 4 },
          { title: "Market Linkage & Sustainability", description: "Connect all groups to markets and publish impact data.", targetAmount: 600000, durationWeeks: 4 },
        ],
      },
    },
    {
      title: "Jal Jeevan: Solar Water Purification for Drought Villages",
      description: "Installing community-scale solar water purification systems in 15 drought-prone villages of Bundelkhand, providing clean drinking water to 12,000 residents who currently walk 3+ km daily for contaminated water. Each system produces 5,000 liters of safe water per day using solar energy alone.",
      category: "rural development",
      location: "Jhansi, Uttar Pradesh, India",
      status: "active" as const,
      lifecycleStage: "active" as const,
      fundingGoal: 850000,
      fundingRaised: 520000,
      volunteerCount: 10,
      creatorName: "Arjun Mehta",
      structuredPlan: {
        problemStatement: "15 villages in Bundelkhand have no access to clean drinking water. Waterborne diseases account for 40% of child hospitalizations, and women spend 4 hours daily fetching water.",
        executionSteps: [
          "Conduct water quality testing and demand assessment in all 15 villages",
          "Design solar purification systems customized for local water conditions",
          "Procure solar panels, RO membranes, and storage tanks in bulk",
          "Install systems with community labor participation",
          "Train 2 village technicians per site for maintenance",
          "Set up water quality monitoring and automated alerts",
          "Establish village water committees for long-term sustainability",
        ],
        estimatedBudget: 850000,
        suggestedRoles: ["Water Engineer", "Solar Technician", "Community Organizer", "Quality Monitor", "Training Coordinator"],
        milestonesTimeline: [
          { title: "Water Testing & System Design", description: "Complete testing and finalize designs for all 15 sites.", targetAmount: 120000, durationWeeks: 3 },
          { title: "Pilot Installation (5 Villages)", description: "Install and commission systems in first 5 villages.", targetAmount: 350000, durationWeeks: 5 },
          { title: "Full Rollout (10 More Villages)", description: "Install systems in remaining 10 villages.", targetAmount: 680000, durationWeeks: 6 },
          { title: "Training & Handover", description: "Train village technicians and committees, complete handover.", targetAmount: 850000, durationWeeks: 3 },
        ],
      },
    },
    {
      title: "Prakriti Pathshala: Eco-Schools for Climate-Smart Kids",
      description: "Transforming 10 government schools in Bangalore into eco-schools with rooftop solar panels, rainwater harvesting systems, organic gardens, and a hands-on climate curriculum. Students learn sustainability not from textbooks but by building and maintaining real green infrastructure.",
      category: "education",
      location: "Bangalore, Karnataka, India",
      status: "active" as const,
      lifecycleStage: "idea" as const,
      fundingGoal: 650000,
      fundingRaised: 95000,
      volunteerCount: 6,
      creatorName: "Vikram Desai",
      structuredPlan: {
        problemStatement: "Government schools in Bangalore spend ₹2-3 lakh annually on electricity and water while students have zero exposure to practical sustainability education.",
        executionSteps: [
          "Audit 10 schools for rooftop solar, rainwater, and garden potential",
          "Design modular eco-infrastructure kits adaptable to each school",
          "Develop hands-on climate curriculum aligned with NCERT standards",
          "Install solar panels and rainwater harvesting in first 4 schools",
          "Set up school gardens with composting stations",
          "Train teachers and launch student green clubs",
          "Measure energy/water savings and student engagement",
        ],
        estimatedBudget: 650000,
        suggestedRoles: ["Sustainability Engineer", "Curriculum Developer", "Garden Coordinator", "Teacher Trainer", "Project Manager"],
        milestonesTimeline: [
          { title: "School Audits & Curriculum", description: "Complete eco-audits and finalize curriculum.", targetAmount: 80000, durationWeeks: 4 },
          { title: "Pilot in 4 Schools", description: "Install solar, rainwater, and gardens in first 4 schools.", targetAmount: 280000, durationWeeks: 6 },
          { title: "Teacher Training & Green Clubs", description: "Train teachers and launch student clubs in all 10 schools.", targetAmount: 480000, durationWeeks: 5 },
          { title: "Full Rollout & Impact Report", description: "Complete all installations and publish savings/engagement data.", targetAmount: 650000, durationWeeks: 5 },
        ],
      },
    },
    {
      title: "Nourish Network: Zero-Waste Community Kitchens",
      description: "Built a network of 5 community kitchens across Mumbai that rescued surplus food from 40 restaurants and hotels, cooked 800 nutritious meals daily for food-insecure families, and diverted 15 tons of food from landfills in 6 months. The model proved that urban hunger and food waste are the same problem — and both can be solved together.",
      category: "community",
      location: "Mumbai, Maharashtra, India",
      status: "completed" as const,
      lifecycleStage: "impact_delivered" as const,
      fundingGoal: 350000,
      fundingRaised: 350000,
      volunteerCount: 42,
      creatorName: "Kavitha Reddy",
      structuredPlan: {
        problemStatement: "Mumbai generates 9,000 tons of food waste daily while 2.5 million residents sleep hungry — a paradox that community kitchens can solve.",
        executionSteps: [
          "Partner with 40 restaurants and hotels for daily surplus food collection",
          "Set up 5 commercial-grade community kitchens in underserved neighborhoods",
          "Recruit and train 60 volunteer cooks in food safety and bulk preparation",
          "Launch daily meal distribution at 10 community points",
          "Implement cold chain logistics for safe food transport",
          "Scale to 800 meals per day within 4 months",
          "Document model and create replication playbook for other cities",
        ],
        estimatedBudget: 350000,
        suggestedRoles: ["Kitchen Manager", "Food Safety Officer", "Volunteer Coordinator", "Logistics Lead", "Partnership Manager"],
        milestonesTimeline: [
          { title: "Kitchen Setup & Partnerships", description: "Set up 5 kitchens and sign 40 food partners.", targetAmount: 90000, durationWeeks: 4 },
          { title: "Pilot Operations", description: "Begin serving 200 meals daily at 4 locations.", targetAmount: 180000, durationWeeks: 5 },
          { title: "Scale to 800 Meals/Day", description: "Reach full capacity across all 10 distribution points.", targetAmount: 290000, durationWeeks: 5 },
          { title: "Impact Report & Playbook", description: "Publish impact data and city-replication guide.", targetAmount: 350000, durationWeeks: 3 },
        ],
      },
    },
    {
      title: "Artisan Revival: Digital Marketplace for Tribal Craftswomen",
      description: "Connected 180 tribal women artisans from 12 villages in Kutch with global buyers through a custom e-commerce platform. Provided product photography, brand storytelling, packaging design, and UPI payment training — increasing artisan income by 3.2x within 8 months and preserving endangered craft traditions.",
      category: "women empowerment",
      location: "Bhuj, Gujarat, India",
      status: "completed" as const,
      lifecycleStage: "impact_delivered" as const,
      fundingGoal: 280000,
      fundingRaised: 280000,
      volunteerCount: 15,
      creatorName: "Fatima Sheikh",
      structuredPlan: {
        problemStatement: "Women artisans in Kutch earn only 25-30% of retail value selling through middlemen. Their world-class embroidery, mirror work, and block printing face extinction as younger generations abandon craft for urban migration.",
        executionSteps: [
          "Identify and onboard 180 artisans from 12 villages",
          "Photograph 500+ products with professional brand storytelling",
          "Build mobile-first e-commerce platform in Gujarati and English",
          "Train artisans on pricing, packaging, and UPI payments",
          "Launch with social media marketing campaign",
          "Establish shipping partnerships for domestic and international orders",
          "Track income growth, order volumes, and artisan satisfaction",
        ],
        estimatedBudget: 280000,
        suggestedRoles: ["Platform Manager", "Product Photographer", "E-commerce Developer", "Artisan Trainer", "Marketing Specialist"],
        milestonesTimeline: [
          { title: "Artisan Onboarding", description: "Register 180 artisans and catalog 500+ products.", targetAmount: 60000, durationWeeks: 4 },
          { title: "Platform Development", description: "Build and test e-commerce platform.", targetAmount: 140000, durationWeeks: 5 },
          { title: "Launch & Marketing", description: "Launch marketplace with digital marketing campaign.", targetAmount: 220000, durationWeeks: 4 },
          { title: "Sustainability & Scale", description: "Achieve repeat orders and publish impact report.", targetAmount: 280000, durationWeeks: 4 },
        ],
      },
    },
    {
      title: "Swachh Nadi: River Cleanup & Wetland Revival",
      description: "Cleaned 12 km of the Mula-Mutha river in Pune, removed 85 tons of solid waste, and restored 3 wetland patches that now support 40+ bird species. Trained 500 citizen volunteers as river guardians and established India's first community-run river water quality monitoring network.",
      category: "environment",
      location: "Pune, Maharashtra, India",
      status: "completed" as const,
      lifecycleStage: "impact_delivered" as const,
      fundingGoal: 420000,
      fundingRaised: 420000,
      volunteerCount: 35,
      creatorName: "Vikram Desai",
      structuredPlan: {
        problemStatement: "The Mula-Mutha river, Pune's lifeline, carries 800 MLD of sewage and industrial waste. Wetlands along its banks have shrunk 70% in 20 years, devastating urban biodiversity.",
        executionSteps: [
          "Map 12 km of priority cleanup zones with pollution hotspots",
          "Organize 24 weekend cleanup drives with 100+ volunteers each",
          "Partner with waste processing plants for segregation and recycling",
          "Restore 3 degraded wetland patches with native aquatic plants",
          "Install 10 water quality monitoring stations along the river",
          "Train 500 citizen volunteers as 'River Guardians'",
          "Publish monthly river health reports and biodiversity data",
        ],
        estimatedBudget: 420000,
        suggestedRoles: ["Environmental Scientist", "Cleanup Coordinator", "Wetland Ecologist", "Data Analyst", "Volunteer Trainer"],
        milestonesTimeline: [
          { title: "Survey & First Cleanups", description: "Complete river mapping and conduct first 8 cleanup drives.", targetAmount: 80000, durationWeeks: 4 },
          { title: "Waste Removal Phase", description: "Remove 85 tons of waste and set up recycling partnerships.", targetAmount: 200000, durationWeeks: 5 },
          { title: "Wetland Restoration", description: "Restore 3 wetland patches and install monitoring stations.", targetAmount: 340000, durationWeeks: 6 },
          { title: "Guardian Training & Handover", description: "Train 500 River Guardians and launch community monitoring.", targetAmount: 420000, durationWeeks: 3 },
        ],
      },
    },
    {
      title: "Aarogya Gram: Telemedicine Hubs for Himalayan Villages",
      description: "Established 8 telemedicine hubs across remote Himalayan villages in Uttarakhand, connecting 15,000 residents to specialist doctors in Dehradun and Delhi via video consultations. Each hub includes a trained health worker, basic diagnostic equipment, and a pharmacy stocked with essential medicines.",
      category: "healthcare",
      location: "Chamoli, Uttarakhand, India",
      status: "completed" as const,
      lifecycleStage: "impact_delivered" as const,
      fundingGoal: 550000,
      fundingRaised: 550000,
      volunteerCount: 20,
      creatorName: "Dr. Meera Nair",
      structuredPlan: {
        problemStatement: "Villages above 2,500m in Uttarakhand are 6-12 hours from the nearest hospital. Residents suffer and sometimes die from treatable conditions because specialist care is inaccessible.",
        executionSteps: [
          "Identify 8 villages with highest health burden and satellite connectivity",
          "Set up telemedicine rooms with video equipment and diagnostic devices",
          "Recruit and train 8 village health workers in basic diagnostics",
          "Partner with 30 specialist doctors for scheduled teleconsultations",
          "Stock each hub pharmacy with 100 essential medicines",
          "Launch weekly clinic schedule with walk-in and appointment slots",
          "Track patient outcomes, referrals, and satisfaction rates",
        ],
        estimatedBudget: 550000,
        suggestedRoles: ["Medical Director", "Telemedicine Specialist", "Health Worker Trainer", "Logistics Coordinator", "Pharmacy Manager"],
        milestonesTimeline: [
          { title: "Site Selection & Equipment", description: "Identify sites and procure telemedicine equipment.", targetAmount: 150000, durationWeeks: 4 },
          { title: "Hub Setup & Training", description: "Set up 8 hubs and train village health workers.", targetAmount: 300000, durationWeeks: 5 },
          { title: "Launch Teleconsultations", description: "Begin weekly specialist consultations across all hubs.", targetAmount: 450000, durationWeeks: 6 },
          { title: "Pharmacy Stocking & Handover", description: "Complete pharmacy setup and transfer operations to local committees.", targetAmount: 550000, durationWeeks: 3 },
        ],
      },
    },
  ];

  const volunteerPool = [
    { name: "Priya Sharma", skills: "Teaching" },
    { name: "Arun Kumar", skills: "Healthcare" },
    { name: "Neha Gupta", skills: "Marketing" },
    { name: "Ravi Shankar", skills: "Engineering" },
    { name: "Sunita Devi", skills: "Community Work" },
    { name: "Mohan Das", skills: "Agriculture" },
    { name: "Lakshmi Iyer", skills: "Finance" },
    { name: "Deepak Rao", skills: "IT & Digital" },
    { name: "Anjali Nair", skills: "Design" },
    { name: "Suresh Yadav", skills: "Logistics" },
    { name: "Rekha Bai", skills: "Handicrafts" },
    { name: "Amitabh Singh", skills: "Legal" },
    { name: "Meena Kumari", skills: "Counseling" },
    { name: "Karan Chopra", skills: "Photography" },
    { name: "Divya Reddy", skills: "Social Media" },
    { name: "Prakash Jain", skills: "Construction" },
    { name: "Shalini Mishra", skills: "Data Analysis" },
    { name: "Vijay Patil", skills: "Event Management" },
    { name: "Geeta Deshpande", skills: "Translation" },
    { name: "Manish Tiwari", skills: "Project Management" },
  ];

  const donorNames = [
    "Tata Trusts Foundation",
    "Infosys Foundation",
    "Anonymous Donor",
    "Azim Premji Foundation",
    "Rohini Nilekani Philanthropies",
    "Godrej Good & Green",
    "Reliance Foundation",
    "HDFC Bank Parivartan",
    "Wipro Cares",
    "Mahindra Rise",
    "Kotak Education Foundation",
    "Birla White Community Fund",
  ];

  const initiativeUpdates: Record<string, Array<{ title: string; content: string; daysAgo: number }>> = {
    "Vidya Setu: Bridge to Learning for Tribal Children": [
      { title: "First 6 learning centers operational!", daysAgo: 38, content: "We opened our first 6 mobile learning centers across Ranchi's Khunti block this week. 180 children showed up on day one — many walking 3 km through forest paths. The joy on their faces when they saw tablets with lessons in their own Santhali language was unforgettable." },
      { title: "Para-teacher training completed", daysAgo: 28, content: "24 local youth from tribal communities completed their 3-week intensive training. They are now certified para-teachers who understand both the curriculum and the cultural context. Three of them are the first college graduates from their villages." },
      { title: "Community libraries take shape", daysAgo: 18, content: "Mini-libraries with 200 books each are now set up in all centers. We curated books in Ho, Santhali, and Hindi covering stories, science, and mathematics. Parent turnout at weekly gatherings has exceeded expectations — 85% attendance." },
      { title: "310 children enrolled and thriving", daysAgo: 8, content: "Enrollment has reached 310 of our 350 target. Early learning assessments show 40% improvement in basic numeracy within just 8 weeks. The district education officer visited last week and expressed interest in replicating the model." },
    ],
    "Hariyali: Mangrove Restoration Along the Konkan Coast": [
      { title: "Nurseries growing strong", daysAgo: 42, content: "Our 3 community nurseries are thriving with 15,000 Rhizophora and Avicennia saplings ready for transplanting. Local fisherwomen are managing the nurseries as a paid livelihood activity — conservation and income generation working hand in hand." },
      { title: "20,000 saplings planted!", daysAgo: 25, content: "We crossed the 20,000 sapling milestone this weekend! Over 300 volunteers from 8 villages joined the planting drive along a 4 km stretch of coastline. The community ownership of this project is deeply moving." },
      { title: "Fish stocks recovering near restored areas", daysAgo: 12, content: "Fishermen near our earliest restoration sites report a 25% increase in catch over the past quarter. Young mangrove roots are already providing nursery habitat for juvenile fish and shrimp. The ecological feedback loop is working." },
    ],
    "Sehat Gaadi: Mobile Health Clinics for Rural Bihar": [
      { title: "First mobile van equipped and ready", daysAgo: 30, content: "Our first Sehat Gaadi is fully equipped with diagnostic tools, a small pharmacy, and telemedicine setup. The van can serve 80 patients per day with screenings, vaccinations, and video consultations with specialists in Patna." },
      { title: "Recruitment drive for health workers", daysAgo: 18, content: "We've recruited 4 community health workers from the target villages — all women who are trusted by their communities. They will serve as the bridge between the mobile clinics and families, ensuring follow-up care and health education reach every home." },
      { title: "Village mapping complete", daysAgo: 7, content: "All 60 villages have been mapped with GPS coordinates, population data, and health burden assessments. We've designed a rotation schedule that ensures every village gets at least 2 visits per month. Pilot launch is scheduled for next week." },
    ],
    "Umeed: Sports Academy for Underprivileged Youth": [
      { title: "Partnership with Mumbai Municipal Corporation", daysAgo: 35, content: "We secured exclusive morning access to the Maidan ground in Dharavi for daily training sessions. The municipal corporation waived all fees after seeing our proposal — a huge win for the 200 children who will train here." },
      { title: "Coaches recruited — legends on board", daysAgo: 22, content: "6 certified coaches have joined Umeed, including a former Ranji cricketer and a national-level kabaddi player. They are donating 50% of their time because they believe in what sport can do for these children." },
      { title: "150 children enrolled, gear distributed", daysAgo: 12, content: "150 of our 200 target kids are now enrolled and training daily. Every child received a kit with shoes, uniform, water bottle, and sport-specific equipment. Parents are reporting improved behavior and attendance at school." },
      { title: "First inter-community friendly match", daysAgo: 4, content: "We hosted our first cricket match between Umeed kids and a team from a nearby housing society. Our kids won by 3 wickets! More importantly, the two communities that barely interacted before are now connected through sport." },
    ],
    "Shakti: Self-Help Groups for Rural Women Entrepreneurs": [
      { title: "40 groups formed across 20 villages", daysAgo: 40, content: "All 40 self-help groups are now formally registered with 500 women enrolled. Each group elected a president, secretary, and treasurer. The energy in these gatherings is electric — many women are opening bank accounts for the first time in their lives." },
      { title: "Financial literacy training in full swing", daysAgo: 25, content: "Week 5 of our 8-week curriculum. Women are learning UPI payments, basic accounting, and business planning. One group in Gogunda village has already started a collective pickle-making enterprise using the skills they learned." },
      { title: "Seed capital applications pouring in", daysAgo: 12, content: "We've received 35 seed capital applications from groups with business plans ranging from dairy farming to tailoring units to organic farming cooperatives. The quality and ambition of these plans is remarkable — every woman sees a future she can build." },
    ],
    "Jal Jeevan: Solar Water Purification for Drought Villages": [
      { title: "Water testing reveals alarming contamination", daysAgo: 35, content: "Lab results from all 15 villages show fluoride levels 3x above safe limits and bacterial contamination in 80% of water sources. This data confirms the urgent need for purification systems and will guide our RO membrane specifications." },
      { title: "5 pilot systems installed and producing clean water", daysAgo: 20, content: "Our first 5 solar purification systems are operational! Each produces 5,000 liters of clean water daily. Village women who used to walk 3 km for water now collect it from their own community tap. The time savings alone are transforming daily life." },
      { title: "Village technicians trained and certified", daysAgo: 8, content: "10 village youth (2 per pilot site) completed maintenance training and received certification. They can now handle filter changes, solar panel cleaning, and basic repairs independently. Community ownership is the key to long-term sustainability." },
    ],
    "Prakriti Pathshala: Eco-Schools for Climate-Smart Kids": [
      { title: "School audits reveal massive savings potential", daysAgo: 20, content: "We completed eco-audits of all 10 government schools. Average electricity bill: ₹2.5 lakh/year. Average water waste: 40%. Rooftop solar alone can cut electricity costs by 60%. The numbers make a compelling case for transformation." },
      { title: "Curriculum draft ready for review", daysAgo: 8, content: "Our climate curriculum is ready — 40 hands-on lessons aligned with NCERT standards covering energy, water, waste, and biodiversity. Students won't just read about sustainability, they'll build rain gauges, maintain compost bins, and monitor their school's energy savings." },
    ],
    "Nourish Network: Zero-Waste Community Kitchens": [
      { title: "First kitchen operational in Dharavi!", daysAgo: 65, content: "Kitchen #1 is live! We served 120 meals on day one, all made from surplus food collected from 8 restaurant partners. The kitchen is staffed by 12 trained volunteers who rotate in 4-hour shifts." },
      { title: "40 restaurant partners signed on", daysAgo: 50, content: "We hit our target of 40 food partners! Hotels, restaurants, wedding caterers, and corporate cafeterias are now channeling surplus food to our 5 kitchens instead of sending it to landfills." },
      { title: "800 meals/day milestone reached", daysAgo: 35, content: "Today we served our 800th meal in a single day across all 5 kitchens. Our cold chain logistics with 2 refrigerated vans ensure food safety from partner to plate within 4 hours." },
      { title: "15 tons of food diverted from landfills", daysAgo: 20, content: "In 6 months, we've rescued 15 tons of perfectly good food from going to waste. That's 15 tons of reduced methane emissions and 144,000 nutritious meals served to families who needed them." },
      { title: "Impact report published — model ready for replication", daysAgo: 5, content: "Our comprehensive impact report is out: 800 meals/day, 15 tons of food rescued, 40 partners, 42 active volunteers, and ₹3.5 lakh in operational savings through food rescue. Three other cities have already requested our replication playbook." },
    ],
    "Artisan Revival: Digital Marketplace for Tribal Craftswomen": [
      { title: "180 artisans onboarded from 12 villages", daysAgo: 70, content: "We traveled to 12 villages across Kutch, met with 180 women artisans, and cataloged their extraordinary embroidery, mirror work, and block printing. Every piece tells a story — our platform will make sure the world hears it." },
      { title: "Platform launched with 500+ products", daysAgo: 45, content: "The marketplace is live! 500+ handcrafted products with professional photography, artisan stories, and fair pricing. First-week sales exceeded expectations with orders from Mumbai, Delhi, and even Singapore." },
      { title: "Artisan income up 3.2x in 4 months", daysAgo: 25, content: "After eliminating middlemen, artisans are earning 3.2x their previous income on average. Rekha Ben from Bhujodi village made ₹45,000 last month from her mirror work dupattas — more than her husband earns from farming." },
      { title: "International orders begin — craft goes global", daysAgo: 12, content: "We received our first international orders from US and UK buyers. Kutchi embroidery is now reaching homes in New York and London while the women who create it earn directly and with dignity." },
      { title: "Model recognized by NITI Aayog", daysAgo: 3, content: "NITI Aayog featured our marketplace as a best-practice model for artisan empowerment. The recognition opens doors for government support and scaling to other craft clusters across India." },
    ],
    "Swachh Nadi: River Cleanup & Wetland Revival": [
      { title: "First cleanup drive — 200 volunteers, 8 tons of waste", daysAgo: 72, content: "Our inaugural cleanup along the Mula-Mutha riverbank drew 200 passionate citizens. In 6 hours, we pulled out 8 tons of plastic, construction debris, and domestic waste. The river is crying for help, and Pune is answering." },
      { title: "Wetland restoration begins", daysAgo: 50, content: "We started replanting native lotus, reeds, and water hyacinth in 3 degraded wetland patches. Ecologists estimate these wetlands once supported 60+ bird species — we're bringing them back, one plant at a time." },
      { title: "85 tons removed — river shows signs of recovery", daysAgo: 30, content: "After 24 cleanup drives, we've removed 85 tons of waste from 12 km of riverbank. Water quality has measurably improved near cleaned stretches — dissolved oxygen is up 15% and coliform counts have dropped." },
      { title: "40+ bird species spotted at restored wetlands", daysAgo: 15, content: "Birders conducted the first post-restoration survey and documented 42 species including kingfishers, herons, and even a rare painted stork. The wetlands are coming alive again!" },
      { title: "500 River Guardians trained and deployed", daysAgo: 5, content: "We trained our 500th River Guardian last weekend. These citizen volunteers will monitor water quality weekly, report illegal dumping, and maintain cleanup momentum long after the project officially concludes." },
    ],
    "Aarogya Gram: Telemedicine Hubs for Himalayan Villages": [
      { title: "8 hubs set up in remote mountain villages", daysAgo: 75, content: "All 8 telemedicine hubs are operational in villages ranging from 2,500m to 3,800m altitude. Each hub has a dedicated room with video equipment, diagnostic devices (BP monitor, pulse oximeter, glucometer), and satellite internet." },
      { title: "30 specialist doctors onboarded", daysAgo: 55, content: "We partnered with 30 specialist doctors across cardiology, pediatrics, gynecology, dermatology, and orthopedics who provide scheduled teleconsultations. Patients who would have traveled 12 hours now see a specialist in their own village." },
      { title: "1,000 consultations completed", daysAgo: 35, content: "We crossed the 1,000 teleconsultation milestone! Most common conditions: hypertension (28%), joint pain (22%), skin conditions (15%), and pregnancy monitoring (18%). Early detection has prevented 40+ emergency evacuations." },
      { title: "Pharmacy network fully stocked", daysAgo: 18, content: "All 8 hub pharmacies are now stocked with 100 essential medicines. Village health workers can dispense prescriptions immediately after teleconsultation — no more 2-day trips to Dehradun for basic medication." },
      { title: "15,000 patients served — handing over to communities", daysAgo: 5, content: "We've served 15,000 patients across 8 villages. Village health committees are now trained to manage hub operations independently. The telemedicine infrastructure will outlast our project because communities own it." },
    ],
  };

  const blogs: Record<string, Array<{ title: string; story: string; challenges: string; outcome: string; impactSummary: string }>> = {
    "Nourish Network: Zero-Waste Community Kitchens": [
      {
        title: "How Mumbai's Surplus Food Found Its Way to 800 Families Every Day",
        story: "It started with a simple question: why do restaurants throw away 200 kg of perfectly good food every night while families sleep hungry 2 km away? We didn't have a grand plan. Kavitha started by talking to restaurant owners in Bandra, asking if they'd let us collect leftovers before the garbage trucks came. The first night, 3 restaurants said yes. Kavitha and 4 volunteers cooked those leftovers into 120 meals in a rented community hall kitchen. By the second week, word spread. Hotels started calling us. A catering company offered their kitchen during off-hours. Women from the neighborhood showed up saying, 'We want to cook.' Within 3 months, we had 5 kitchens running on surplus food alone. No ingredient purchased. Zero food wasted. The most powerful moment was when Sunita, a daily wage worker's wife, told us: 'My children used to go to school hungry. Now they eat a real meal every morning before class. They are learning better.'",
        challenges: "Food safety was our biggest worry. Surplus food has a short shelf life, and we couldn't risk making anyone sick. We invested in 2 refrigerated vans and strict 4-hour collection-to-plate protocols. Training volunteer cooks in FSSAI standards took weeks. Some restaurant partners dropped out early, worried about liability. Scaling from 1 kitchen to 5 meant finding spaces, equipment, and reliable volunteers in each neighborhood — a logistical puzzle we solved through sheer community goodwill.",
        outcome: "5 community kitchens serving 800 meals daily across 10 distribution points. 40 restaurant and hotel partners providing surplus food. 15 tons of food diverted from landfills in 6 months. 42 trained volunteers running operations. Replication playbook published and adopted by 3 other Indian cities.",
        impactSummary: "800 daily meals served | 15 tons food rescued | 40 food partners | ₹3.5L saved through food rescue | 3 cities replicating model",
      },
      {
        title: "The Women Who Turned Leftovers Into a Movement",
        story: "When we set up our Dharavi kitchen, we expected to struggle with volunteer recruitment. Instead, 30 women from the neighborhood showed up the first week. 'We know what hunger feels like,' said Meena, a mother of three. 'We won't let good food go to waste while children go without.' These women became the backbone of Nourish Network. They organized themselves into shifts, trained newcomers, and developed recipes that stretched surplus food into maximum nutrition. A restaurant's leftover rice became lemon rice for breakfast. Day-old bread became bread upma. Overripe bananas became banana halwa that children lined up for. The women didn't just cook meals — they cooked dignity. Every plate was served with care, on proper plates, in a clean space. 'We don't do charity,' Meena would say. 'We do community.'",
        challenges: "Maintaining volunteer motivation over months was harder than the cooking itself. We introduced a small stipend for regular volunteers and organized monthly appreciation events. Cultural sensitivity around accepting free food required careful community engagement — we positioned kitchens as 'community dining' rather than 'charity feeding.'",
        outcome: "60 women trained as community kitchen volunteers. Average volunteer retention: 8 months. 3 volunteers went on to start their own catering micro-enterprises using skills learned at Nourish Network.",
        impactSummary: "60 trained volunteers | 8-month avg retention | 3 micro-enterprises launched | Community dining model adopted",
      },
    ],
    "Artisan Revival: Digital Marketplace for Tribal Craftswomen": [
      {
        title: "From Village Workshops to Global Buyers: How 180 Women Reclaimed Their Craft",
        story: "Fatima had spent 3 years documenting Kutchi textile traditions when she realized the biggest threat wasn't cultural erosion — it was economic exploitation. Artisans creating museum-quality embroidery were earning ₹200 for pieces that sold for ₹2,000 in city boutiques. The middleman captured 80% of the value. 'Why don't we sell directly?' asked Rekha Ben, a master embroiderer from Bhujodi. That question launched Artisan Revival. We spent 4 months in villages, sitting with women as they stitched, understanding their process, their stories, their constraints. Many had never used a smartphone. Most had never had a bank account. All of them had extraordinary skill and zero market access. Building the platform was the easy part. The hard part was trust. These women had been exploited by middlemen for decades. Why would they trust us? We answered with transparency: every woman saw her product price, our margin, and the final sale price. No hidden fees. No delayed payments. UPI transfers within 48 hours of sale. When Rekha Ben received ₹18,000 directly into her bank account for 4 dupattas, she wept. 'In 30 years of stitching, no one has ever paid me my worth,' she said.",
        challenges: "Digital literacy was near-zero. We ran 6 weeks of smartphone and UPI training. Photography in remote villages without electricity required portable solar-powered setups. Shipping fragile handcrafted items from villages with no postal service meant building a custom last-mile logistics network with local bus operators. Some artisans' husbands initially resisted, seeing it as a threat to household dynamics — we organized family meetings to address concerns and share success stories.",
        outcome: "180 artisans connected to direct markets. Average income increase: 3.2x. Platform processing ₹12 lakh in monthly orders. International orders from 5 countries. NITI Aayog recognition as best-practice model.",
        impactSummary: "180 artisans | 3.2x income increase | ₹12L monthly orders | 5 countries reached | National recognition",
      },
    ],
    "Swachh Nadi: River Cleanup & Wetland Revival": [
      {
        title: "12 Kilometers, 85 Tons, and a River That's Learning to Breathe Again",
        story: "The first time Vikram walked along the Mula-Mutha, he counted 14 sewage outlets in a single kilometer. The river didn't flow — it crawled, dark and lifeless. 'This was a river that once sustained entire civilizations,' he thought. 'It deserves another chance.' Swachh Nadi began not with funding or plans, but with 23 people and trash bags on a Saturday morning. The first cleanup was depressing — in 4 hours, they filled 80 bags. Construction rubble, medical waste, festival idols, plastic by the ton. But something unexpected happened. Joggers stopped to help. Families from nearby apartments brought their children. A chai seller offered free tea to volunteers. By the third cleanup, 200 people were showing up. By the sixth, the municipal corporation took notice and started providing trucks for waste removal. The wetland restoration was more delicate work. Ecologists spent weeks testing soil, mapping water flow, and selecting native species that could survive in polluted conditions. Planting happened at dawn, when the water was calmest. Volunteers waded knee-deep in muck to place lotus rhizomes and reed bundles. Three months later, a kingfisher was spotted at the restored site. Then herons. Then, incredibly, a painted stork — a species not seen on the Mula-Mutha in over a decade.",
        challenges: "Upstream pollution kept undoing cleanup work. We had to coordinate with municipal authorities to address sewage outlets — a political process that required persistent advocacy. Volunteer fatigue after month 4 was real; we countered it with 'River Champion' certificates and social media recognition. Wetland restoration faced skepticism from engineers who wanted concrete embankments instead of natural solutions.",
        outcome: "85 tons of waste removed from 12 km of riverbank. 3 wetland patches restored to ecological health. 42 bird species documented, including 8 not previously recorded on the river. 500 trained River Guardians monitoring water quality weekly. Dissolved oxygen improved 15% near cleanup sites.",
        impactSummary: "85 tons waste removed | 12 km cleaned | 42 bird species | 500 River Guardians | 15% water quality improvement",
      },
    ],
    "Aarogya Gram: Telemedicine Hubs for Himalayan Villages": [
      {
        title: "When a Screen Saved a Life: Telemedicine in the Mountains",
        story: "Kamla Devi, 67, from Joshimath, had been ignoring chest pains for 3 months. The nearest hospital was a 12-hour journey on mountain roads. She would have continued ignoring them if the telemedicine hub hadn't opened in her village. During a routine screening, the village health worker noticed irregular readings and connected Kamla to a cardiologist in Dehradun via video. The diagnosis: early-stage heart blockage, treatable with medication but dangerous if left untreated. Medicine was dispensed from the hub pharmacy that same afternoon. Three months later, Kamla's condition has stabilized. 'The doctor on the screen talks to me like I'm in his clinic,' she says. 'I don't have to worry about the mountain road anymore.' Kamla's story is one of 15,000. A mother in Chamoli who got prenatal care without a dangerous 8-hour journey. A child in Pipalkoti whose skin infection was correctly diagnosed as requiring antibiotics, not the home remedy that was making it worse. An elderly farmer whose diabetes was caught before it damaged his kidneys. Each teleconsultation takes 15 minutes. Each one potentially saves a life.",
        challenges: "Satellite internet in mountain villages is unreliable. We installed signal boosters and designed the system to work on low-bandwidth connections. Convincing elderly patients to trust a 'doctor on a screen' required months of community outreach. Power outages are frequent — each hub runs on solar backup. The biggest challenge was pharmacy logistics: getting medicines to villages accessible only by foot or mule track required building relationships with local transport networks.",
        outcome: "8 telemedicine hubs serving 15,000 patients. 30 specialist doctors providing remote consultations. 40+ emergency evacuations prevented through early detection. 100 essential medicines available at each hub. Village health committees trained for independent operation.",
        impactSummary: "15,000 patients served | 8 hubs | 30 specialist doctors | 40+ emergencies prevented | Community-owned operations",
      },
      {
        title: "Training Mountain Women as Healthcare's First Responders",
        story: "The 8 village health workers are the heroes of Aarogya Gram. All women. All from the villages they serve. All trained from scratch. Pushpa from Ghat village had never used a computer before the program. After 6 weeks of training, she can take blood pressure readings, conduct glucose tests, operate the telemedicine equipment, and explain prescriptions to patients in their local dialect. 'The women trust me because I'm one of them,' Pushpa says. 'When I tell Kamla Devi to take her medicine, she listens. If a city doctor told her the same thing on the phone, she might not.' These health workers don't just operate equipment. They walk through their villages, checking on chronic patients, reminding pregnant women about checkups, and conducting health education sessions at anganwadis. They are the bridge between cutting-edge telemedicine technology and a grandmother who has never left her mountain village.",
        challenges: "Training women with no prior medical or technical background required a completely custom curriculum. We used visual guides, hands-on practice, and buddy systems rather than textbooks. Two trainees dropped out due to family pressure. Others struggled with the responsibility of being their community's health gatekeeper. Ongoing mentorship from experienced nurses via weekly video calls became essential for building confidence.",
        outcome: "8 village health workers trained and certified. Each worker manages 40-60 patient relationships. Follow-up compliance improved to 78% (vs. 30% before the program). 2 health workers are now mentoring new trainees in neighboring villages.",
        impactSummary: "8 health workers trained | 78% follow-up compliance | 40-60 patients each | Peer mentorship expanding",
      },
    ],
  };

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
      const numDonors = Math.min(4 + Math.floor(inserted.fundingRaised / 100000), 8);
      const donorPool = [...donorNames].sort(() => 0.5 - Math.random()).slice(0, numDonors);
      let remaining = inserted.fundingRaised;
      for (let d = 0; d < donorPool.length; d++) {
        const isLast = d === donorPool.length - 1;
        const amount = isLast ? remaining : Math.round(remaining * (0.15 + Math.random() * 0.25));
        remaining -= amount;
        if (remaining < 0) remaining = 0;
        const daysAgo = Math.floor(Math.random() * 60) + 5;
        await tx.insert(donationsTable).values({
          initiativeId: inserted.id,
          donorName: donorPool[d],
          amount,
          message: [
            "Proud to support this initiative. Keep going!",
            "This cause resonates deeply with our foundation's mission.",
            "Making a real difference — inspiring work!",
            "We believe in your team and your vision.",
            "Every contribution counts. Happy to be part of this.",
          ][d % 5],
          createdAt: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000),
        });
      }
    }

    const volCount = Math.min(inserted.volunteerCount, 8);
    const shuffledVols = [...volunteerPool].sort(() => 0.5 - Math.random());
    for (let v = 0; v < volCount; v++) {
      const vol = shuffledVols[v];
      const daysAgo = Math.floor(Math.random() * 45) + 1;
      await tx.insert(volunteersTable).values({
        initiativeId: inserted.id,
        name: vol.name,
        email: `${vol.name.toLowerCase().replace(/ /g, ".")}@example.com`,
        skills: vol.skills,
        matchedScore: 72 + Math.floor(Math.random() * 23),
        joinedAt: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000),
      });
    }

    const updates = initiativeUpdates[inserted.title];
    if (updates) {
      for (const update of updates) {
        await tx.insert(updatesTable).values({
          initiativeId: inserted.id,
          title: update.title,
          content: update.content,
          createdAt: new Date(Date.now() - update.daysAgo * 24 * 60 * 60 * 1000),
        });
      }
    }

    const initiativeBlogs = blogs[inserted.title];
    if (initiativeBlogs) {
      for (const blog of initiativeBlogs) {
        await tx.insert(blogsTable).values({
          initiativeId: inserted.id,
          title: blog.title,
          story: blog.story,
          challenges: blog.challenges,
          outcome: blog.outcome,
          impactSummary: blog.impactSummary,
          createdAt: new Date(Date.now() - Math.floor(Math.random() * 10 + 2) * 24 * 60 * 60 * 1000),
        });
      }
    }
  }
}
