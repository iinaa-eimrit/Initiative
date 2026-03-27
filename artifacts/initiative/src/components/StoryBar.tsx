import { motion } from "framer-motion";
import { Plus } from "lucide-react";

interface StoryItem {
  id: number;
  name: string;
  initial: string;
  color: string;
}

interface StoryBarProps {
  stories: StoryItem[];
  onStoryClick?: (id: number) => void;
}

const GRADIENT_COLORS = [
  "from-emerald-400 to-teal-500",
  "from-blue-400 to-indigo-500",
  "from-purple-400 to-pink-500",
  "from-amber-400 to-orange-500",
  "from-rose-400 to-red-500",
  "from-cyan-400 to-blue-500",
  "from-green-400 to-emerald-500",
  "from-violet-400 to-purple-500",
];

export function StoryBar({ stories, onStoryClick }: StoryBarProps) {
  return (
    <div className="flex gap-4 overflow-x-auto pb-2 hide-scrollbar" role="list" aria-label="Story bar">
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-1.5 cursor-pointer group shrink-0 bg-transparent border-none p-0"
        aria-label="Create your story"
        type="button"
      >
        <div className="w-16 h-16 rounded-full bg-muted/50 border-2 border-dashed border-muted-foreground/30 flex items-center justify-center group-hover:border-primary group-hover:bg-primary/5 transition-all group-focus-visible:ring-2 group-focus-visible:ring-primary group-focus-visible:ring-offset-2">
          <Plus className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
        </div>
        <span className="text-[10px] text-muted-foreground font-medium">Your Story</span>
      </motion.button>

      {stories.map((story, i) => (
        <motion.button
          key={story.id}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.05 }}
          className="flex flex-col items-center gap-1.5 cursor-pointer group shrink-0 bg-transparent border-none p-0"
          onClick={() => onStoryClick?.(story.id)}
          aria-label={`View ${story.name}'s story`}
          type="button"
        >
          <div className={`p-[2.5px] rounded-full bg-gradient-to-br ${GRADIENT_COLORS[i % GRADIENT_COLORS.length]} group-hover:scale-110 transition-transform group-focus-visible:ring-2 group-focus-visible:ring-primary group-focus-visible:ring-offset-2`}>
            <div className="w-[58px] h-[58px] rounded-full bg-white p-[2px]">
              <div className={`w-full h-full rounded-full bg-gradient-to-br ${GRADIENT_COLORS[i % GRADIENT_COLORS.length]} flex items-center justify-center text-white font-bold text-lg`}>
                {story.initial}
              </div>
            </div>
          </div>
          <span className="text-[10px] text-muted-foreground font-medium truncate max-w-[64px] text-center">
            {story.name.split(" ")[0]}
          </span>
        </motion.button>
      ))}
    </div>
  );
}
