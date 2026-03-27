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
  const passwordHash = await bcrypt.hash("demo123", 10);

  await tx.insert(usersTable).values([
    { name: "Maria Santos", email: "maria@example.com", passwordHash, role: "changemaker", skills: "Teaching, Leadership, Community Outreach", bio: "Passionate educator dedicated to closing the achievement gap in underserved communities." },
    { name: "James Chen", email: "james@example.com", passwordHash, role: "organizer", skills: "Engineering, Project Management, Research", bio: "Environmental scientist and community organizer working to restore urban ecosystems." },
    { name: "Dr. Aisha Patel", email: "aisha@example.com", passwordHash, role: "changemaker", skills: "Healthcare, Data Analysis, Leadership", bio: "Public health physician bringing mobile healthcare to rural communities." },
    { name: "Derek Williams", email: "derek@example.com", passwordHash, role: "volunteer", skills: "Marketing, Design, Community Outreach", bio: "Youth mentor and community builder connecting at-risk youth with professional mentors." },
    { name: "Priya Menon", email: "priya@example.com", passwordHash, role: "changemaker", skills: "Social Work, Advocacy, Community Organizing", bio: "Women's rights advocate empowering women through financial literacy and skill-building." },
    { name: "Ravi Kumar", email: "ravi@example.com", passwordHash, role: "organizer", skills: "Agriculture, Rural Development, Solar Energy", bio: "Rural development specialist bringing sustainable solutions to farming communities." },
    { name: "Sophie Laurent", email: "sophie@example.com", passwordHash, role: "changemaker", skills: "Education, Mental Health, Counseling", bio: "Child psychologist creating safe learning environments for refugee children." },
    { name: "Carlos Mendez", email: "carlos@example.com", passwordHash, role: "organizer", skills: "Urban Planning, Architecture, Community Development", bio: "Architect transforming abandoned spaces into thriving community hubs." },
  ]);

  const initiatives = [
    {
      title: "Knowledge Bridge: Math Tutoring for Underserved Kids",
      description: "Provide free math tutoring to 200+ children in underserved neighborhoods through community learning centers and volunteer educators. Our program pairs each student with a dedicated tutor for weekly sessions, supplemented by group study circles and fun math challenges that make learning engaging and accessible.",
      category: "education",
      location: "Oakland, California",
      status: "active" as const,
      lifecycleStage: "active" as const,
      fundingGoal: 15000,
      fundingRaised: 8750,
      volunteerCount: 12,
      creatorName: "Maria Santos",
      structuredPlan: {
        problemStatement: "Over 60% of children in Oakland's underserved neighborhoods score below grade level in mathematics, perpetuating cycles of educational inequality.",
        executionSteps: [
          "Conduct community needs assessment across 5 target neighborhoods",
          "Partner with local schools and community centers for venue access",
          "Recruit and train 50 qualified volunteer educators",
          "Develop age-appropriate curriculum and learning materials",
          "Launch pilot program with initial cohort of 50 students",
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
      description: "Restore 50 acres of urban green space by planting 5,000 native trees and establishing community-maintained gardens. This project transforms vacant lots and degraded parkland into thriving ecosystems that filter air, reduce flooding, and provide green spaces for recreation.",
      category: "environment",
      location: "Portland, Oregon",
      status: "active" as const,
      lifecycleStage: "active" as const,
      fundingGoal: 35000,
      fundingRaised: 12500,
      volunteerCount: 28,
      creatorName: "James Chen",
      structuredPlan: {
        problemStatement: "Portland has lost 30% of its urban tree canopy in the last decade, worsening air quality and flooding in low-income neighborhoods.",
        executionSteps: [
          "Conduct environmental impact assessment of target areas",
          "Build coalition with local environmental organizations",
          "Design restoration plan with native species selection",
          "Secure permits and purchase saplings from local nurseries",
          "Organize monthly volunteer planting drives",
          "Install irrigation and monitoring systems",
          "Document results and create community stewardship program",
        ],
        estimatedBudget: 35000,
        suggestedRoles: ["Environmental Scientist", "Project Lead", "Volunteer Coordinator", "Arborist", "Communications Officer"],
        milestonesTimeline: [
          { title: "Site Assessment & Planning", description: "Complete environmental survey and action plan.", targetAmount: 5000, durationWeeks: 3 },
          { title: "First Planting Drive", description: "Plant 1,500 trees with 200+ volunteers.", targetAmount: 15000, durationWeeks: 4 },
          { title: "Community Garden Setup", description: "Establish 10 community garden plots.", targetAmount: 25000, durationWeeks: 4 },
          { title: "Monitoring & Stewardship", description: "Install monitoring equipment and train community stewards.", targetAmount: 35000, durationWeeks: 3 },
        ],
      },
    },
    {
      title: "Health for All: Mobile Clinics for Rural Communities",
      description: "Deploy mobile health clinics providing free screenings, vaccinations, and basic medical care to 5,000+ residents across 3 underserved rural counties. Each clinic visit includes health education workshops and connections to ongoing care resources.",
      category: "healthcare",
      location: "Rural Tennessee",
      status: "active" as const,
      lifecycleStage: "active" as const,
      fundingGoal: 45000,
      fundingRaised: 31200,
      volunteerCount: 18,
      creatorName: "Dr. Aisha Patel",
      structuredPlan: {
        problemStatement: "Over 40% of rural Tennessee residents live more than 30 miles from the nearest hospital, leaving critical health needs unmet.",
        executionSteps: [
          "Map underserved communities and assess health needs",
          "Partner with healthcare providers and recruit medical volunteers",
          "Equip mobile clinic with diagnostic tools and medications",
          "Launch weekly clinic visits on a rotating schedule",
          "Conduct preventive health education workshops",
          "Establish referral networks with regional hospitals",
          "Track health outcomes and patient follow-ups",
        ],
        estimatedBudget: 45000,
        suggestedRoles: ["Medical Director", "Nurse Coordinator", "Community Health Worker", "Logistics Manager", "Data Analyst"],
        milestonesTimeline: [
          { title: "Clinic Setup", description: "Acquire vehicle, equipment, and initial supplies.", targetAmount: 12000, durationWeeks: 4 },
          { title: "First Community Visits", description: "Launch clinic in first county with full services.", targetAmount: 25000, durationWeeks: 4 },
          { title: "Expand to 3 Counties", description: "Extend weekly visits to all target communities.", targetAmount: 38000, durationWeeks: 6 },
          { title: "Sustain & Report", description: "Secure ongoing funding and publish health impact data.", targetAmount: 45000, durationWeeks: 3 },
        ],
      },
    },
    {
      title: "Community Rising: Youth Mentorship Network",
      description: "Connect 100 at-risk youth with professional mentors for career guidance, skill development, and personal growth through weekly sessions. Includes workshops on financial literacy, resume building, and interview skills.",
      category: "community",
      location: "Chicago, Illinois",
      status: "active" as const,
      lifecycleStage: "planning" as const,
      fundingGoal: 18000,
      fundingRaised: 4200,
      volunteerCount: 8,
      creatorName: "Derek Williams",
      structuredPlan: {
        problemStatement: "Youth in Chicago's south side face a 45% high school dropout rate and limited access to professional role models and career pathways.",
        executionSteps: [
          "Survey community needs and identify at-risk youth populations",
          "Recruit and background-check 50 professional mentors",
          "Design structured mentorship framework with milestones",
          "Match mentors with mentees based on interests and goals",
          "Launch weekly one-on-one and group mentoring sessions",
          "Host monthly career exploration workshops",
          "Track participant outcomes and publish impact report",
        ],
        estimatedBudget: 18000,
        suggestedRoles: ["Program Director", "Mentor Coordinator", "Youth Counselor", "Workshop Facilitator", "Volunteer Manager"],
        milestonesTimeline: [
          { title: "Program Design", description: "Design mentorship framework and recruit mentors.", targetAmount: 4000, durationWeeks: 3 },
          { title: "Pilot Launch", description: "Match first 30 mentor-mentee pairs.", targetAmount: 9000, durationWeeks: 4 },
          { title: "Scale & Workshops", description: "Expand to 100 pairs and launch workshop series.", targetAmount: 14000, durationWeeks: 4 },
          { title: "Sustain", description: "Secure corporate sponsorships and publish outcomes.", targetAmount: 18000, durationWeeks: 3 },
        ],
      },
    },
    {
      title: "Women Rise: Financial Literacy & Micro-Enterprise Program",
      description: "Empower 500 women in rural India with financial literacy training and micro-enterprise seed funding. Participants learn savings management, business planning, and digital payments while receiving mentorship from successful women entrepreneurs.",
      category: "women empowerment",
      location: "Jaipur, Rajasthan, India",
      status: "active" as const,
      lifecycleStage: "active" as const,
      fundingGoal: 28000,
      fundingRaised: 19500,
      volunteerCount: 22,
      creatorName: "Priya Menon",
      structuredPlan: {
        problemStatement: "Only 27% of women in rural Rajasthan have access to formal financial services, limiting their economic independence and family stability.",
        executionSteps: [
          "Identify target villages and partner with local women's groups",
          "Develop culturally appropriate financial literacy curriculum",
          "Train 20 local women as community financial educators",
          "Conduct 12-week financial literacy workshops in each village",
          "Provide micro-enterprise seed grants to top participants",
          "Establish peer support networks and mentorship circles",
          "Track income growth and business sustainability metrics",
        ],
        estimatedBudget: 28000,
        suggestedRoles: ["Program Director", "Financial Educator", "Community Mobilizer", "Micro-Enterprise Coach", "Impact Researcher"],
        milestonesTimeline: [
          { title: "Community Mobilization", description: "Partner with 15 villages and recruit participants.", targetAmount: 5000, durationWeeks: 3 },
          { title: "Training Launch", description: "Begin financial literacy workshops across all villages.", targetAmount: 12000, durationWeeks: 6 },
          { title: "Seed Grants", description: "Award micro-enterprise grants to 100 top participants.", targetAmount: 22000, durationWeeks: 4 },
          { title: "Mentorship & Scale", description: "Establish ongoing mentorship and expand to new villages.", targetAmount: 28000, durationWeeks: 4 },
        ],
      },
    },
    {
      title: "Solar Harvest: Clean Energy for Farming Villages",
      description: "Install solar-powered irrigation systems in 10 farming villages, replacing diesel pumps that cost farmers 40% of their income. Each system powers drip irrigation for 50 acres, dramatically increasing crop yields while reducing carbon emissions.",
      category: "rural development",
      location: "Anantapur, Andhra Pradesh, India",
      status: "active" as const,
      lifecycleStage: "active" as const,
      fundingGoal: 52000,
      fundingRaised: 38400,
      volunteerCount: 15,
      creatorName: "Ravi Kumar",
      structuredPlan: {
        problemStatement: "Smallholder farmers in drought-prone Anantapur spend 40% of income on diesel for irrigation, making farming economically unviable.",
        executionSteps: [
          "Survey 10 target villages and assess irrigation needs",
          "Partner with solar equipment manufacturers for bulk pricing",
          "Train local technicians on installation and maintenance",
          "Install solar panels and pump systems in first 3 villages",
          "Set up community-managed maintenance cooperatives",
          "Monitor crop yield improvements and cost savings",
          "Scale to remaining villages based on pilot results",
        ],
        estimatedBudget: 52000,
        suggestedRoles: ["Agricultural Engineer", "Solar Technician", "Community Organizer", "Finance Manager", "Impact Analyst"],
        milestonesTimeline: [
          { title: "Survey & Design", description: "Complete village surveys and system designs.", targetAmount: 8000, durationWeeks: 3 },
          { title: "Pilot Installation", description: "Install systems in 3 pilot villages.", targetAmount: 22000, durationWeeks: 5 },
          { title: "Full Rollout", description: "Expand to all 10 villages.", targetAmount: 42000, durationWeeks: 6 },
          { title: "Training & Handover", description: "Train village cooperatives and complete handover.", targetAmount: 52000, durationWeeks: 3 },
        ],
      },
    },
    {
      title: "Safe Haven: Refugee Children's Learning Center",
      description: "Establish a dedicated learning center for 300 refugee children providing language classes, psychosocial support, and STEM education. The center includes a library, computer lab, and counseling space staffed by trained professionals.",
      category: "education",
      location: "Berlin, Germany",
      status: "active" as const,
      lifecycleStage: "active" as const,
      fundingGoal: 40000,
      fundingRaised: 28600,
      volunteerCount: 20,
      creatorName: "Sophie Laurent",
      structuredPlan: {
        problemStatement: "85% of refugee children in Berlin face language barriers and trauma that prevent successful integration into mainstream schools.",
        executionSteps: [
          "Secure a suitable venue in a refugee-dense neighborhood",
          "Hire trained educators and psychosocial support staff",
          "Develop trauma-informed, multilingual curriculum",
          "Set up classrooms, library, and computer lab",
          "Launch enrollment with community outreach",
          "Provide ongoing counseling and family support services",
          "Track educational outcomes and integration metrics",
        ],
        estimatedBudget: 40000,
        suggestedRoles: ["Education Director", "Child Psychologist", "Language Teacher", "IT Coordinator", "Family Liaison"],
        milestonesTimeline: [
          { title: "Venue & Staff", description: "Secure location and hire core team.", targetAmount: 10000, durationWeeks: 4 },
          { title: "Center Launch", description: "Open center with first 100 enrolled children.", targetAmount: 20000, durationWeeks: 4 },
          { title: "Full Enrollment", description: "Expand to 300 children with full programming.", targetAmount: 32000, durationWeeks: 6 },
          { title: "Sustain & Report", description: "Secure annual funding and publish outcomes.", targetAmount: 40000, durationWeeks: 3 },
        ],
      },
    },
    {
      title: "Blue Oceans: Coastal Cleanup & Marine Conservation",
      description: "Organize monthly beach cleanups across 20 coastal sites, removing 50 tons of plastic waste while establishing a marine conservation monitoring program with local fishermen and diving volunteers.",
      category: "environment",
      location: "Cape Town, South Africa",
      status: "active" as const,
      lifecycleStage: "planning" as const,
      fundingGoal: 22000,
      fundingRaised: 7800,
      volunteerCount: 35,
      creatorName: "James Chen",
      structuredPlan: {
        problemStatement: "Cape Town's coastline receives 1,000 tons of plastic waste annually, threatening marine biodiversity and local fishing livelihoods.",
        executionSteps: [
          "Map 20 priority cleanup sites along the coastline",
          "Partner with local fishing communities and dive clubs",
          "Procure cleanup equipment and waste sorting stations",
          "Organize monthly cleanup drives with 100+ volunteers each",
          "Establish marine monitoring stations at 5 key locations",
          "Create educational programs for coastal schools",
          "Publish quarterly marine health reports",
        ],
        estimatedBudget: 22000,
        suggestedRoles: ["Marine Biologist", "Cleanup Coordinator", "Community Liaison", "Data Scientist", "Education Specialist"],
        milestonesTimeline: [
          { title: "Site Mapping & Partnerships", description: "Map all sites and establish community partnerships.", targetAmount: 4000, durationWeeks: 3 },
          { title: "First Cleanup Wave", description: "Conduct cleanups at 10 priority sites.", targetAmount: 10000, durationWeeks: 4 },
          { title: "Monitoring Program", description: "Install marine monitoring at 5 locations.", targetAmount: 16000, durationWeeks: 4 },
          { title: "Education & Scale", description: "Launch school programs and expand to all 20 sites.", targetAmount: 22000, durationWeeks: 4 },
        ],
      },
    },
    {
      title: "Nourish Network: Community Kitchen & Food Bank",
      description: "Launch a community kitchen serving 500 daily meals to food-insecure families while reducing food waste by partnering with 30 local restaurants and groceries for surplus food recovery.",
      category: "community",
      location: "Mumbai, Maharashtra, India",
      status: "completed" as const,
      lifecycleStage: "impact_delivered" as const,
      fundingGoal: 20000,
      fundingRaised: 20000,
      volunteerCount: 45,
      creatorName: "Priya Menon",
      structuredPlan: {
        problemStatement: "Mumbai generates 9,000 tons of food waste daily while 2.5 million residents face food insecurity — a solvable paradox.",
        executionSteps: [
          "Partner with 30 restaurants and grocery stores for surplus food",
          "Set up commercial kitchen and cold storage facility",
          "Recruit and train volunteer cooking teams",
          "Launch daily meal distribution at 5 community points",
          "Implement food safety and quality tracking systems",
          "Scale to 500 meals per day within 3 months",
          "Document impact and create replication playbook",
        ],
        estimatedBudget: 20000,
        suggestedRoles: ["Kitchen Manager", "Food Safety Officer", "Volunteer Coordinator", "Distribution Lead", "Partnership Manager"],
        milestonesTimeline: [
          { title: "Kitchen Setup", description: "Set up commercial kitchen and secure food partnerships.", targetAmount: 5000, durationWeeks: 3 },
          { title: "Soft Launch", description: "Begin serving 100 meals daily at 2 locations.", targetAmount: 10000, durationWeeks: 4 },
          { title: "Full Scale", description: "Scale to 500 meals daily across 5 locations.", targetAmount: 16000, durationWeeks: 4 },
          { title: "Impact Report", description: "Publish impact data and replication playbook.", targetAmount: 20000, durationWeeks: 2 },
        ],
      },
    },
    {
      title: "Digital Village: Internet Access for Rural Schools",
      description: "Bring high-speed internet and computer labs to 8 rural schools, connecting 2,000 students to digital learning resources. Includes teacher training on digital tools and creation of a shared online curriculum platform.",
      category: "rural development",
      location: "Kisumu County, Kenya",
      status: "active" as const,
      lifecycleStage: "active" as const,
      fundingGoal: 32000,
      fundingRaised: 18900,
      volunteerCount: 10,
      creatorName: "Ravi Kumar",
      structuredPlan: {
        problemStatement: "Only 12% of rural Kenyan schools have internet access, leaving 8 million students without digital literacy skills essential for the modern economy.",
        executionSteps: [
          "Survey 8 target schools and assess infrastructure needs",
          "Partner with telecom providers for connectivity solutions",
          "Procure computers and networking equipment",
          "Install computer labs and internet infrastructure",
          "Train teachers on digital tools and online resources",
          "Create shared curriculum platform for all participating schools",
          "Monitor student digital literacy improvements",
        ],
        estimatedBudget: 32000,
        suggestedRoles: ["IT Infrastructure Lead", "Education Specialist", "Teacher Trainer", "Project Coordinator", "Impact Analyst"],
        milestonesTimeline: [
          { title: "Infrastructure Survey", description: "Complete school surveys and equipment procurement.", targetAmount: 6000, durationWeeks: 3 },
          { title: "Pilot Schools", description: "Install labs in 3 pilot schools.", targetAmount: 14000, durationWeeks: 5 },
          { title: "Full Rollout", description: "Expand to all 8 schools with teacher training.", targetAmount: 26000, durationWeeks: 5 },
          { title: "Platform Launch", description: "Launch shared curriculum platform and measure outcomes.", targetAmount: 32000, durationWeeks: 3 },
        ],
      },
    },
    {
      title: "Heal Together: Free Mental Health Clinics",
      description: "Provide free mental health counseling to 1,000 low-income individuals through weekly walk-in clinics staffed by licensed therapists. Includes group therapy sessions, crisis intervention, and telehealth follow-ups.",
      category: "healthcare",
      location: "Los Angeles, California",
      status: "active" as const,
      lifecycleStage: "planning" as const,
      fundingGoal: 38000,
      fundingRaised: 9500,
      volunteerCount: 14,
      creatorName: "Dr. Aisha Patel",
      structuredPlan: {
        problemStatement: "1 in 4 adults in LA's low-income communities needs mental health support but cannot afford it, leading to cascading social and health crises.",
        executionSteps: [
          "Partner with community centers for clinic space",
          "Recruit licensed therapists willing to volunteer 4 hours weekly",
          "Set up intake systems and patient management tools",
          "Launch weekly walk-in clinics at 3 locations",
          "Establish group therapy programs for common conditions",
          "Implement telehealth platform for follow-up sessions",
          "Track treatment outcomes and patient satisfaction",
        ],
        estimatedBudget: 38000,
        suggestedRoles: ["Clinical Director", "Licensed Therapist", "Intake Coordinator", "Telehealth Specialist", "Community Outreach Worker"],
        milestonesTimeline: [
          { title: "Clinic Setup", description: "Secure locations and recruit therapist volunteers.", targetAmount: 8000, durationWeeks: 4 },
          { title: "Soft Launch", description: "Open first clinic with walk-in and group sessions.", targetAmount: 18000, durationWeeks: 4 },
          { title: "Expand & Telehealth", description: "Open 2 more locations and launch telehealth.", targetAmount: 30000, durationWeeks: 5 },
          { title: "Sustain & Report", description: "Secure ongoing funding and publish outcomes.", targetAmount: 38000, durationWeeks: 3 },
        ],
      },
    },
    {
      title: "Artisan Revival: Traditional Craft Marketplace for Women",
      description: "Create an online and offline marketplace connecting 200 women artisans with global buyers. Includes product photography, brand development, and e-commerce training so artisans can sell directly and earn 3x more than through middlemen.",
      category: "women empowerment",
      location: "Oaxaca, Mexico",
      status: "completed" as const,
      lifecycleStage: "impact_delivered" as const,
      fundingGoal: 15000,
      fundingRaised: 15000,
      volunteerCount: 12,
      creatorName: "Carlos Mendez",
      structuredPlan: {
        problemStatement: "Women artisans in Oaxaca earn only 30% of retail value when selling through middlemen, keeping families in poverty despite world-class craftsmanship.",
        executionSteps: [
          "Identify and onboard 200 women artisans from 12 communities",
          "Photograph and catalog all products with brand storytelling",
          "Build e-commerce platform with mobile-friendly interface",
          "Train artisans on pricing, packaging, and digital tools",
          "Launch marketplace with social media marketing campaign",
          "Establish shipping and payment infrastructure",
          "Track income growth and artisan satisfaction",
        ],
        estimatedBudget: 15000,
        suggestedRoles: ["Marketplace Manager", "Product Photographer", "E-commerce Developer", "Artisan Trainer", "Marketing Specialist"],
        milestonesTimeline: [
          { title: "Artisan Onboarding", description: "Register and catalog products from 200 artisans.", targetAmount: 3000, durationWeeks: 3 },
          { title: "Platform Build", description: "Build and test e-commerce platform.", targetAmount: 8000, durationWeeks: 5 },
          { title: "Launch & Market", description: "Launch marketplace with marketing campaign.", targetAmount: 12000, durationWeeks: 4 },
          { title: "Scale & Sustain", description: "Achieve sustainable sales and publish impact data.", targetAmount: 15000, durationWeeks: 3 },
        ],
      },
    },
    {
      title: "Green Classrooms: Eco-Schools for Climate Education",
      description: "Transform 15 public schools into eco-schools with solar panels, rainwater harvesting, school gardens, and a climate-focused curriculum. Students learn sustainability through hands-on projects while reducing school utility costs by 60%.",
      category: "education",
      location: "Bangalore, Karnataka, India",
      status: "active" as const,
      lifecycleStage: "idea" as const,
      fundingGoal: 25000,
      fundingRaised: 3200,
      volunteerCount: 6,
      creatorName: "Ravi Kumar",
      structuredPlan: {
        problemStatement: "Indian schools contribute to climate change through high energy use while students lack hands-on environmental education critical for the future.",
        executionSteps: [
          "Audit 15 schools for eco-transformation potential",
          "Design modular eco-infrastructure packages",
          "Develop climate curriculum with teacher training guides",
          "Install solar panels and rainwater systems in first 5 schools",
          "Set up school gardens and composting programs",
          "Launch student-led climate action clubs",
          "Measure energy savings and student engagement outcomes",
        ],
        estimatedBudget: 25000,
        suggestedRoles: ["Sustainability Engineer", "Curriculum Developer", "Teacher Trainer", "Garden Coordinator", "Project Manager"],
        milestonesTimeline: [
          { title: "School Audits", description: "Complete eco-audits for all 15 schools.", targetAmount: 3000, durationWeeks: 3 },
          { title: "Pilot Installations", description: "Transform first 5 schools with full eco-infrastructure.", targetAmount: 10000, durationWeeks: 5 },
          { title: "Curriculum & Training", description: "Deploy climate curriculum and train all teachers.", targetAmount: 18000, durationWeeks: 4 },
          { title: "Full Rollout", description: "Complete transformation of all 15 schools.", targetAmount: 25000, durationWeeks: 5 },
        ],
      },
    },
    {
      title: "Bridge Builders: Community Spaces from Abandoned Lots",
      description: "Transform 5 abandoned urban lots into vibrant community spaces with playgrounds, seating areas, public art, and free WiFi. Each space is designed with community input and maintained by neighborhood committees.",
      category: "community",
      location: "Detroit, Michigan",
      status: "active" as const,
      lifecycleStage: "active" as const,
      fundingGoal: 30000,
      fundingRaised: 21500,
      volunteerCount: 32,
      creatorName: "Carlos Mendez",
      structuredPlan: {
        problemStatement: "Detroit has 90,000 vacant lots creating blight, reducing property values, and eliminating safe gathering spaces for 200,000+ residents.",
        executionSteps: [
          "Survey 20 lots and select 5 based on community impact potential",
          "Hold community design workshops at each site",
          "Secure city permits and liability coverage",
          "Clear and prepare sites with volunteer crews",
          "Install playground equipment, seating, and public art",
          "Set up free WiFi and solar-powered lighting",
          "Establish neighborhood maintenance committees",
        ],
        estimatedBudget: 30000,
        suggestedRoles: ["Landscape Architect", "Community Organizer", "Construction Lead", "Artist Coordinator", "Maintenance Trainer"],
        milestonesTimeline: [
          { title: "Site Selection & Design", description: "Select 5 sites and complete community design workshops.", targetAmount: 5000, durationWeeks: 3 },
          { title: "First 2 Spaces", description: "Complete construction on first 2 community spaces.", targetAmount: 14000, durationWeeks: 5 },
          { title: "Remaining 3 Spaces", description: "Build out remaining 3 spaces with full amenities.", targetAmount: 25000, durationWeeks: 5 },
          { title: "Launch & Handover", description: "Grand opening events and handover to community committees.", targetAmount: 30000, durationWeeks: 2 },
        ],
      },
    },
  ];

  const volunteerNames = [
    "Alex Rivera", "Priya Sharma", "Marcus Johnson", "Yuki Tanaka",
    "Fatima Al-Hassan", "Dmitri Volkov", "Elena Torres", "Kwame Asante",
    "Lin Wei", "Amara Okafor", "Sebastian Cruz", "Nadia Rahman",
    "Oscar Morales", "Anya Petrov", "Thomas Osei", "Maya Patel",
    "Jamal Robinson", "Suki Nakamura", "Diego Fernandez", "Zara Ahmed",
  ];

  const volunteerSkills = [
    "Teaching", "Design", "Engineering", "Communication",
    "Marketing", "Healthcare", "Data Analysis", "Project Management",
    "Photography", "Social Media", "Legal", "Finance",
    "Agriculture", "IT", "Counseling", "Logistics",
    "Writing", "Translation", "Art", "Construction",
  ];

  const donorNames = [
    "Tech for Good Foundation", "Anonymous Donor", "Sarah Mitchell",
    "Green Earth Fund", "Hope Foundation", "Impact Ventures",
    "Social Impact Alliance", "Community First Trust", "Future Makers Fund",
    "Catalyst Foundation", "Pathways Trust", "Unity Fund",
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
      const numDonors = Math.min(3 + Math.floor(Math.random() * 3), 5);
      const donorPool = [...donorNames].sort(() => Math.random() - 0.5).slice(0, numDonors);
      let remaining = inserted.fundingRaised;
      for (let d = 0; d < donorPool.length; d++) {
        const isLast = d === donorPool.length - 1;
        const amount = isLast ? remaining : Math.round(remaining * (0.2 + Math.random() * 0.3));
        remaining -= amount;
        const daysAgo = Math.floor(Math.random() * 45) + 5;
        await tx.insert(donationsTable).values({
          initiativeId: inserted.id,
          donorName: donorPool[d],
          amount,
          message: [
            "Keep up the great work!",
            "Proud to support this initiative.",
            "This cause is close to my heart.",
            "Making a difference together!",
            "",
          ][Math.floor(Math.random() * 5)] || undefined,
          createdAt: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000),
        });
      }
    }

    const volCount = Math.min(inserted.volunteerCount, 6);
    const shuffledNames = [...volunteerNames].sort(() => Math.random() - 0.5);
    for (let v = 0; v < volCount; v++) {
      const daysAgo = Math.floor(Math.random() * 30) + 1;
      await tx.insert(volunteersTable).values({
        initiativeId: inserted.id,
        name: shuffledNames[v],
        email: `${shuffledNames[v].toLowerCase().replace(" ", ".")}@example.com`,
        skills: volunteerSkills[v % volunteerSkills.length],
        matchedScore: 70 + Math.floor(Math.random() * 25),
        joinedAt: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000),
      });
    }

    const updateData = [
      { title: "Project kickoff — We're live!", content: `We're thrilled to announce the official launch of ${inserted.title.split(":")[0]}. The response from the community has been overwhelming, and we can't wait to start making an impact together.` },
      { title: "First milestone completed!", content: `Great news! We've reached our first milestone ahead of schedule. The community support has been incredible — thank you to every volunteer and donor who made this possible.` },
      { title: "Community partnership secured", content: `We've just signed a partnership with a major local organization that will help us scale our impact. This means more resources, better reach, and faster execution.` },
      { title: "Volunteer spotlight: Amazing team effort", content: `Our volunteers have been putting in extraordinary effort. This week alone, we had 15 people show up to help, and the results speak for themselves. Real impact is happening.` },
      { title: "Midpoint progress report", content: `We're at the halfway point and tracking ahead of our goals. Funding is ${Math.round((inserted.fundingRaised / inserted.fundingGoal) * 100)}% complete and community engagement continues to grow week over week.` },
      { title: "Impact data: What the numbers show", content: `The data is in and it's encouraging. Our key metrics are trending upward across the board. We're documenting everything so we can share the full impact story when this phase wraps up.` },
    ];

    const numUpdates = inserted.status === "completed" ? 6 : 3 + Math.floor(Math.random() * 3);
    for (let u = 0; u < Math.min(numUpdates, updateData.length); u++) {
      const daysAgo = (u + 1) * 5 + Math.floor(Math.random() * 3);
      await tx.insert(updatesTable).values({
        initiativeId: inserted.id,
        title: updateData[u].title,
        content: updateData[u].content,
        createdAt: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000),
      });
    }
  }
}
