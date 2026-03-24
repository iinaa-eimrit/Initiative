interface TrustScoreBreakdown {
  updatesScore: number;
  milestonesScore: number;
  volunteersScore: number;
  fundingScore: number;
}

export interface TrustScore {
  overall: number;
  breakdown: TrustScoreBreakdown;
}

export function calculateTrustScore(data: {
  updatesCount: number;
  milestonesCompleted: number;
  totalMilestones: number;
  volunteerCount: number;
  fundingRaised: number;
  fundingGoal: number;
}): TrustScore {
  const updatesScore = Math.min(25, data.updatesCount * 5);

  const milestoneRatio = data.totalMilestones > 0
    ? data.milestonesCompleted / data.totalMilestones
    : 0;
  const milestonesScore = Math.min(30, Math.round(milestoneRatio * 30));

  const volunteersScore = Math.min(20, data.volunteerCount * 4);

  const fundingRatio = data.fundingGoal > 0
    ? data.fundingRaised / data.fundingGoal
    : 0;
  const fundingScore = Math.min(25, Math.round(fundingRatio * 25));

  const overall = updatesScore + milestonesScore + volunteersScore + fundingScore;

  return {
    overall,
    breakdown: {
      updatesScore,
      milestonesScore,
      volunteersScore,
      fundingScore,
    },
  };
}
