interface GeneratedPlan {
  title: string;
  description: string;
  category: string;
  location: string;
  fundingGoal: number;
  structuredPlan: {
    problemStatement: string;
    executionSteps: string[];
    estimatedBudget: number;
    suggestedRoles: string[];
    milestonesTimeline: { title: string; description: string; targetAmount: number; durationWeeks: number }[];
  };
}

const categoryTemplates: Record<string, {
  problems: string[];
  steps: string[][];
  roles: string[][];
  budgetRange: [number, number];
  locations: string[];
}> = {
  education: {
    problems: [
      "Millions of children lack access to quality education, creating cycles of poverty and inequality.",
      "Educational inequality continues to widen the gap between communities, limiting future opportunities.",
      "Underfunded schools and lack of learning resources leave vulnerable children behind.",
    ],
    steps: [
      [
        "Conduct community needs assessment and identify target demographics",
        "Partner with local schools and community centers for venue access",
        "Recruit and train qualified volunteer educators",
        "Develop age-appropriate curriculum and learning materials",
        "Launch pilot program with initial cohort of students",
        "Collect feedback and iterate on teaching methodology",
        "Scale program to additional locations based on results",
      ],
      [
        "Map underserved areas and quantify education gaps",
        "Build partnerships with local NGOs and institutions",
        "Design modular curriculum adaptable to different skill levels",
        "Set up digital learning infrastructure where possible",
        "Begin classes with measurable learning outcomes",
        "Implement student progress tracking system",
        "Publish impact report and plan for expansion",
      ],
    ],
    roles: [
      ["Lead Educator", "Curriculum Designer", "Community Outreach Coordinator", "Student Mentor", "Operations Manager"],
      ["Teaching Volunteer", "Content Creator", "Data Analyst", "Event Coordinator", "Technology Support"],
    ],
    budgetRange: [5000, 25000],
    locations: ["Community Centers, Urban Districts", "Schools & Libraries, Multiple Locations"],
  },
  environment: {
    problems: [
      "Environmental degradation threatens ecosystems and communities that depend on natural resources.",
      "Climate change and pollution are destroying habitats and reducing biodiversity at alarming rates.",
      "Unsustainable practices are depleting resources and contaminating water and soil systems.",
    ],
    steps: [
      [
        "Conduct environmental impact assessment of target area",
        "Build coalition with local environmental organizations",
        "Design restoration or conservation action plan",
        "Secure necessary permits and materials",
        "Organize volunteer drives for on-ground action",
        "Implement monitoring systems for progress tracking",
        "Document results and share with stakeholders",
      ],
      [
        "Research environmental challenges in the target region",
        "Engage community leaders and local government",
        "Develop sustainable intervention strategy",
        "Source eco-friendly materials and tools",
        "Execute cleanup, planting, or conservation activities",
        "Measure environmental recovery metrics",
        "Create a long-term sustainability and maintenance plan",
      ],
    ],
    roles: [
      ["Environmental Scientist", "Project Lead", "Volunteer Coordinator", "Communications Officer", "Logistics Manager"],
      ["Field Researcher", "Tree Planting Lead", "Waste Management Expert", "Social Media Manager", "Grant Writer"],
    ],
    budgetRange: [8000, 40000],
    locations: ["Parks & Natural Reserves, Regional", "Coastal & River Systems, Multiple Sites"],
  },
  healthcare: {
    problems: [
      "Limited healthcare access leaves vulnerable populations without essential medical services.",
      "Preventable diseases continue to claim lives in communities lacking basic health infrastructure.",
      "Mental health services remain inaccessible to many, especially in underserved communities.",
    ],
    steps: [
      [
        "Identify underserved communities and assess health needs",
        "Partner with healthcare providers and medical volunteers",
        "Secure medical supplies and equipment",
        "Set up mobile health clinics or community health points",
        "Conduct health screenings and awareness workshops",
        "Establish referral networks for ongoing care",
        "Track health outcomes and patient follow-ups",
      ],
      [
        "Map healthcare gaps through community surveys",
        "Build a network of medical professionals and volunteers",
        "Procure essential medications and diagnostic tools",
        "Launch health awareness campaigns in target areas",
        "Provide free consultations and basic treatments",
        "Create patient education materials and resources",
        "Measure impact through health metrics and community feedback",
      ],
    ],
    roles: [
      ["Medical Director", "Nurse Coordinator", "Community Health Worker", "Logistics Manager", "Data Analyst"],
      ["Healthcare Volunteer", "Mental Health Counselor", "Public Health Educator", "Supply Chain Coordinator", "Outreach Specialist"],
    ],
    budgetRange: [10000, 50000],
    locations: ["Community Health Centers, Urban & Rural", "Mobile Clinics, Multiple Communities"],
  },
  community: {
    problems: [
      "Communities lack safe gathering spaces and programs that foster connection and mutual support.",
      "Social isolation and disconnection are weakening the fabric of local communities.",
    ],
    steps: [
      [
        "Survey community needs and identify priority areas",
        "Secure a physical or virtual space for programming",
        "Design inclusive community programs and events",
        "Recruit local leaders and facilitators",
        "Launch initial programming with outreach",
        "Gather participant feedback and adjust offerings",
        "Build sustainable funding and volunteer pipeline",
      ],
    ],
    roles: [
      ["Program Director", "Event Coordinator", "Community Facilitator", "Marketing Lead", "Volunteer Manager"],
    ],
    budgetRange: [3000, 20000],
    locations: ["Community Halls & Parks, Local Area"],
  },
};

function detectCategory(text: string): string {
  const lower = text.toLowerCase();
  const keywords: Record<string, string[]> = {
    education: ["teach", "school", "learn", "education", "student", "tutor", "literacy", "math", "reading", "curriculum", "classroom"],
    environment: ["clean", "tree", "plant", "ocean", "river", "pollution", "recycle", "green", "climate", "sustainable", "nature", "forest"],
    healthcare: ["health", "medical", "hospital", "doctor", "mental", "wellness", "disease", "clinic", "therapy", "medicine", "care"],
    community: ["community", "neighbor", "local", "shelter", "food bank", "homeless", "social", "support", "youth"],
  };

  let bestCategory = "community";
  let bestScore = 0;

  for (const [cat, words] of Object.entries(keywords)) {
    const score = words.filter((w) => lower.includes(w)).length;
    if (score > bestScore) {
      bestScore = score;
      bestCategory = cat;
    }
  }

  return bestCategory;
}

function generateTitle(description: string, category: string): string {
  const words = description.split(/\s+/).slice(0, 8);
  const titleMap: Record<string, string[]> = {
    education: ["Empower Through Education:", "Knowledge Bridge:", "Learning for All:"],
    environment: ["Green Future:", "Earth Guardians:", "Sustainable Tomorrow:"],
    healthcare: ["Health for All:", "Wellness Initiative:", "Healing Hands:"],
    community: ["Community Rising:", "Together We Build:", "Neighbors United:"],
  };

  const prefixes = titleMap[category] || titleMap.community;
  const prefix = prefixes[Math.floor(description.length % prefixes.length)];
  const core = words.join(" ");
  const capitalizedCore = core.charAt(0).toUpperCase() + core.slice(1);
  return `${prefix} ${capitalizedCore}`;
}

export function generateInitiativeStructure(inputText: string, inputCategory?: string): GeneratedPlan {
  const category = inputCategory || detectCategory(inputText);
  const template = categoryTemplates[category] || categoryTemplates.community;

  const idx = Math.abs(inputText.length) % template.problems.length;
  const stepsIdx = Math.abs(inputText.length) % template.steps.length;
  const rolesIdx = Math.abs(inputText.length) % template.roles.length;

  const budget = template.budgetRange[0] + 
    ((inputText.length * 137) % (template.budgetRange[1] - template.budgetRange[0]));
  const roundedBudget = Math.round(budget / 500) * 500;

  const milestonesTimeline = [
    {
      title: "Foundation & Research",
      description: "Establish partnerships, conduct assessments, and finalize the action plan.",
      targetAmount: Math.round(roundedBudget * 0.2),
      durationWeeks: 3,
    },
    {
      title: "Launch & Mobilize",
      description: "Begin operations, recruit volunteers, and execute initial activities.",
      targetAmount: Math.round(roundedBudget * 0.5),
      durationWeeks: 4,
    },
    {
      title: "Scale & Measure",
      description: "Expand reach, track impact metrics, and optimize operations.",
      targetAmount: Math.round(roundedBudget * 0.8),
      durationWeeks: 4,
    },
    {
      title: "Sustain & Report",
      description: "Ensure long-term sustainability, publish impact report, and plan next phase.",
      targetAmount: roundedBudget,
      durationWeeks: 3,
    },
  ];

  const title = generateTitle(inputText, category);
  const locationIdx = Math.abs(inputText.length) % template.locations.length;

  return {
    title,
    description: inputText,
    category,
    location: template.locations[locationIdx],
    fundingGoal: roundedBudget,
    structuredPlan: {
      problemStatement: template.problems[idx],
      executionSteps: template.steps[stepsIdx],
      estimatedBudget: roundedBudget,
      suggestedRoles: template.roles[rolesIdx],
      milestonesTimeline,
    },
  };
}
