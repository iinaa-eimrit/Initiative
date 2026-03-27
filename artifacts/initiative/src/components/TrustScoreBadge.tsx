import { Shield } from "lucide-react";

interface TrustScoreBadgeProps {
  score: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

function getScoreColor(score: number) {
  if (score >= 80) return { bg: "bg-green-100", text: "text-green-700", ring: "ring-green-200" };
  if (score >= 60) return { bg: "bg-blue-100", text: "text-blue-700", ring: "ring-blue-200" };
  if (score >= 40) return { bg: "bg-yellow-100", text: "text-yellow-700", ring: "ring-yellow-200" };
  return { bg: "bg-gray-100", text: "text-gray-600", ring: "ring-gray-200" };
}

function getScoreLabel(score: number) {
  if (score >= 80) return "High Trust";
  if (score >= 60) return "Good";
  if (score >= 40) return "Building";
  return "New";
}

export function TrustScoreBadge({ score, size = "sm", showLabel = false }: TrustScoreBadgeProps) {
  const colors = getScoreColor(score);
  
  if (size === "lg") {
    return (
      <div className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl ${colors.bg} ring-1 ${colors.ring}`}>
        <Shield className={`w-5 h-5 ${colors.text}`} />
        <div>
          <div className={`text-2xl font-bold ${colors.text}`}>{score}</div>
          <div className={`text-xs font-medium ${colors.text} opacity-80`}>Trust Score</div>
        </div>
      </div>
    );
  }

  if (size === "md") {
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl ${colors.bg} ring-1 ${colors.ring}`}>
        <Shield className={`w-4 h-4 ${colors.text}`} />
        <span className={`text-sm font-bold ${colors.text}`}>{score}</span>
        {showLabel && <span className={`text-xs ${colors.text} opacity-80`}>{getScoreLabel(score)}</span>}
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg ${colors.bg}`}>
      <Shield className={`w-3 h-3 ${colors.text}`} />
      <span className={`text-xs font-bold ${colors.text}`}>{score}</span>
    </div>
  );
}

interface TrustBreakdownProps {
  breakdown: {
    updatesScore: number;
    milestonesScore: number;
    volunteersScore: number;
    fundingScore: number;
  };
  overall: number;
}

export function TrustBreakdown({ breakdown, overall }: TrustBreakdownProps) {
  if (!breakdown) return null;
  const categories = [
    { label: "Updates", score: breakdown.updatesScore ?? 0, max: 25, color: "bg-purple-500" },
    { label: "Milestones", score: breakdown.milestonesScore ?? 0, max: 30, color: "bg-blue-500" },
    { label: "Volunteers", score: breakdown.volunteersScore ?? 0, max: 20, color: "bg-teal-500" },
    { label: "Funding", score: breakdown.fundingScore ?? 0, max: 25, color: "bg-green-500" },
  ];

  const overallColors = getScoreColor(overall);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-bold text-sm">Impact Trust Score</h4>
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${overallColors.bg}`}>
          <Shield className={`w-4 h-4 ${overallColors.text}`} />
          <span className={`text-lg font-bold ${overallColors.text}`}>{overall}</span>
          <span className={`text-xs ${overallColors.text} opacity-80`}>/100</span>
        </div>
      </div>
      <div className="space-y-3">
        {categories.map((cat) => (
          <div key={cat.label}>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-muted-foreground font-medium">{cat.label}</span>
              <span className="font-bold">{cat.score}/{cat.max}</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className={`h-full ${cat.color} rounded-full transition-all duration-500`}
                style={{ width: `${(cat.score / cat.max) * 100}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
