import { Lightbulb, ClipboardList, Zap, Award } from "lucide-react";

const stages = [
  { key: "idea", label: "Idea", icon: Lightbulb, color: "text-purple-600", bg: "bg-purple-100" },
  { key: "planning", label: "Planning", icon: ClipboardList, color: "text-yellow-600", bg: "bg-yellow-100" },
  { key: "active", label: "Active", icon: Zap, color: "text-blue-600", bg: "bg-blue-100" },
  { key: "impact_delivered", label: "Impact Delivered", icon: Award, color: "text-green-600", bg: "bg-green-100" },
];

interface LifecycleBadgeProps {
  stage: string;
}

export function LifecycleBadge({ stage }: LifecycleBadgeProps) {
  const found = stages.find((s) => s.key === stage) || stages[0];
  const Icon = found.icon;

  return (
    <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg ${found.bg}`}>
      <Icon className={`w-3 h-3 ${found.color}`} />
      <span className={`text-xs font-medium ${found.color}`}>{found.label}</span>
    </div>
  );
}

interface LifecycleTrackerProps {
  currentStage: string;
}

export function LifecycleTracker({ currentStage }: LifecycleTrackerProps) {
  const currentIdx = stages.findIndex((s) => s.key === currentStage);

  return (
    <div className="relative">
      <div className="flex items-center justify-between">
        {stages.map((stage, idx) => {
          const isCompleted = idx < currentIdx;
          const isCurrent = idx === currentIdx;
          const Icon = stage.icon;

          return (
            <div key={stage.key} className="flex flex-col items-center relative z-10">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                isCompleted 
                  ? "bg-primary text-white shadow-md shadow-primary/30" 
                  : isCurrent 
                  ? `${stage.bg} ${stage.color} ring-2 ring-offset-2 ring-primary/30 shadow-md`
                  : "bg-muted text-muted-foreground"
              }`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className={`text-xs mt-2 font-medium text-center max-w-[70px] ${
                isCurrent ? "text-foreground font-bold" : isCompleted ? "text-primary" : "text-muted-foreground"
              }`}>
                {stage.label}
              </span>
            </div>
          );
        })}
      </div>
      <div className="absolute top-5 left-0 right-0 h-0.5 bg-muted -translate-y-1/2" style={{ left: '5%', right: '5%' }}>
        <div 
          className="h-full bg-primary transition-all duration-500"
          style={{ width: `${(currentIdx / (stages.length - 1)) * 100}%` }}
        ></div>
      </div>
    </div>
  );
}
