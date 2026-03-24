interface VolunteerSuggestion {
  name: string;
  skills: string[];
  matchScore: number;
  reason: string;
  avatarInitials: string;
}

const mockVolunteerPool = [
  { name: "Sarah Chen", skills: ["Teaching", "Curriculum Design", "Mentoring", "Python"], categories: ["education"] },
  { name: "Marcus Johnson", skills: ["Project Management", "Fundraising", "Public Speaking"], categories: ["education", "community"] },
  { name: "Priya Patel", skills: ["Data Analysis", "Research", "Grant Writing", "Impact Assessment"], categories: ["education", "healthcare"] },
  { name: "James O'Brien", skills: ["Environmental Science", "Field Research", "GIS Mapping"], categories: ["environment"] },
  { name: "Aisha Mohammed", skills: ["Community Organizing", "Event Planning", "Social Media"], categories: ["community", "environment"] },
  { name: "David Kim", skills: ["Web Development", "UI/UX Design", "Marketing"], categories: ["education", "community"] },
  { name: "Elena Rodriguez", skills: ["Nursing", "First Aid", "Health Education", "Spanish"], categories: ["healthcare"] },
  { name: "Tom Wilson", skills: ["Logistics", "Supply Chain", "Volunteer Coordination"], categories: ["healthcare", "community"] },
  { name: "Lisa Zhang", skills: ["Photography", "Videography", "Storytelling", "Content Creation"], categories: ["community", "environment"] },
  { name: "Raj Krishnamurthy", skills: ["Medicine", "Public Health", "Research", "Data Science"], categories: ["healthcare"] },
  { name: "Maya Thompson", skills: ["Environmental Policy", "Sustainability", "Grant Writing"], categories: ["environment"] },
  { name: "Carlos Rivera", skills: ["Construction", "Engineering", "Safety Management"], categories: ["community", "environment"] },
  { name: "Anna Kowalski", skills: ["Child Psychology", "Counseling", "Youth Programs"], categories: ["education", "healthcare"] },
  { name: "Kwame Asante", skills: ["Agriculture", "Water Systems", "Community Development"], categories: ["environment", "community"] },
  { name: "Sophie Laurent", skills: ["Finance", "Accounting", "Nonprofit Management"], categories: ["education", "healthcare", "community"] },
];

const categoryReasonTemplates: Record<string, string[]> = {
  education: [
    "Your teaching and mentoring experience directly aligns with this initiative's educational goals.",
    "Your background in curriculum design makes you an ideal fit for building learning programs.",
    "Your analytical skills would strengthen the initiative's impact measurement efforts.",
  ],
  environment: [
    "Your environmental expertise is exactly what this conservation initiative needs.",
    "Your fieldwork experience would be invaluable for on-ground environmental action.",
    "Your sustainability knowledge aligns perfectly with this initiative's green mission.",
  ],
  healthcare: [
    "Your medical background makes you a strong match for this health-focused initiative.",
    "Your public health experience aligns with the community health goals of this project.",
    "Your counseling skills would add tremendous value to this wellness initiative.",
  ],
  community: [
    "Your community organizing skills are a perfect match for this grassroots initiative.",
    "Your event planning and coordination experience would amplify this project's reach.",
    "Your cross-functional skills make you versatile enough to support multiple aspects of this mission.",
  ],
};

export function getSuggestedVolunteers(category: string, initiativeTitle: string): VolunteerSuggestion[] {
  const normalizedCategory = category.toLowerCase();
  const matchedVolunteers = mockVolunteerPool
    .map((v) => {
      const categoryMatch = v.categories.includes(normalizedCategory);
      const titleWords = initiativeTitle.toLowerCase().split(/\s+/);
      const skillOverlap = v.skills.filter((s) =>
        titleWords.some((w) => s.toLowerCase().includes(w) || w.includes(s.toLowerCase()))
      ).length;

      const baseScore = categoryMatch ? 70 : 40;
      const matchScore = Math.min(98, baseScore + skillOverlap * 8 + Math.floor(Math.random() * 15));

      return { ...v, matchScore };
    })
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 5);

  const reasons = categoryReasonTemplates[normalizedCategory] || categoryReasonTemplates.community;

  return matchedVolunteers.map((v, i) => ({
    name: v.name,
    skills: v.skills,
    matchScore: v.matchScore,
    reason: reasons[i % reasons.length],
    avatarInitials: v.name.split(" ").map((n) => n[0]).join(""),
  }));
}
