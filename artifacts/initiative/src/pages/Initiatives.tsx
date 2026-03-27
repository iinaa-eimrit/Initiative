import { useState } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Search, MapPin, Users, Heart, Shield, Sparkles, MessageSquare, Share2, UserPlus, TrendingUp, Eye } from "lucide-react";
import { useListInitiatives } from "@workspace/api-client-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrustScoreBadge } from "@/components/TrustScoreBadge";
import { LifecycleBadge } from "@/components/LifecycleBadge";
import { StoryBar } from "@/components/StoryBar";
import { useToast } from "@/hooks/use-toast";

const CATEGORIES = ["All", "education", "environment", "healthcare", "community", "women empowerment", "rural development"];

const categoryLabels: Record<string, string> = {
  All: "All",
  education: "Education",
  environment: "Environment",
  healthcare: "Healthcare",
  community: "Community",
  "women empowerment": "Women Empowerment",
  "rural development": "Rural Development",
};

const COVER_GRADIENTS = [
  "from-emerald-400/20 via-teal-300/30 to-cyan-400/20",
  "from-blue-400/20 via-indigo-300/30 to-purple-400/20",
  "from-amber-400/20 via-orange-300/30 to-red-400/20",
  "from-rose-400/20 via-pink-300/30 to-fuchsia-400/20",
  "from-violet-400/20 via-purple-300/30 to-indigo-400/20",
  "from-cyan-400/20 via-blue-300/30 to-indigo-400/20",
  "from-green-400/20 via-emerald-300/30 to-teal-400/20",
];

const COVER_ICONS = ["🌱", "📚", "💊", "🤝", "💪", "🏘️", "🌊", "🌳", "⚕️", "🎓", "🌾"];

export default function Initiatives() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [likedIds, setLikedIds] = useState<Set<number>>(new Set());
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const { data: initiatives, isLoading, error } = useListInitiatives({
    search: search || undefined,
    category: category !== "All" ? category : undefined,
  });

  const stories = initiatives?.map((init) => ({
    id: init.id,
    name: init.creatorName,
    initial: init.creatorName.charAt(0),
    color: "emerald",
    hasUpdate: true,
  })) ?? [];

  const handleLike = (id: number, title: string) => {
    setLikedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
        toast({ title: "Liked!", description: `You liked "${title.split(":")[0]}"` });
      }
      return next;
    });
  };

  const handleShare = (title: string) => {
    toast({ title: "Link copied!", description: `Share link for "${title.split(":")[0]}" copied to clipboard.` });
  };

  const handleComment = () => {
    toast({ title: "Coming soon", description: "Comments will be available in the next update." });
  };

  return (
    <div className="min-h-screen bg-background pt-24 pb-20">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">

        <div className="bg-white rounded-2xl border border-border/50 p-4 mb-6 shadow-sm">
          <StoryBar stories={stories.slice(0, 10)} onStoryClick={(id) => navigate(`/initiatives/${id}`)} />
        </div>

        <div className="bg-white rounded-2xl border border-border/50 p-3 mb-6 shadow-sm">
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search initiatives..."
              className="pl-10 h-10 bg-muted/30 border-transparent focus:bg-white text-sm rounded-xl"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-1.5 overflow-x-auto hide-scrollbar">
            {CATEGORIES.map(c => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                  category === c
                    ? "bg-primary text-white shadow-sm"
                    : "bg-muted/50 text-muted-foreground hover:bg-muted"
                }`}
              >
                {categoryLabels[c] || c}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-6">
            {[1, 2, 3].map(i => (
              <Card key={i} className="animate-pulse h-[400px] bg-muted/20 border-transparent rounded-2xl" />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-20 bg-destructive/5 rounded-2xl border border-destructive/20">
            <p className="text-destructive font-medium">Failed to load initiatives. Please try again later.</p>
          </div>
        ) : !initiatives?.length ? (
          <div className="text-center py-24 bg-white rounded-2xl border border-border/50">
            <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-bold mb-2">No initiatives found</h3>
            <p className="text-muted-foreground mb-6">Be the first to start something in this category!</p>
            <Button onClick={() => { setSearch(""); setCategory("All"); }} variant="outline" className="rounded-full">
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {initiatives.map((initiative, i) => {
              const progress = Math.min((initiative.fundingRaised / initiative.fundingGoal) * 100, 100);
              const isLiked = likedIds.has(initiative.id);
              const viewCount = 120 + (initiative.id * 47) % 300;

              return (
                <motion.div
                  key={initiative.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className="rounded-2xl overflow-hidden border-border/50 bg-white shadow-sm hover:shadow-lg transition-shadow duration-300">
                    <div className="p-4 pb-3">
                      <div className="flex items-center justify-between">
                        <Link href={`/initiatives/${initiative.id}`} className="flex items-center gap-3 cursor-pointer group">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-teal-400 flex items-center justify-center text-white font-bold text-sm ring-2 ring-primary/20">
                            {initiative.creatorName.charAt(0)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-sm group-hover:text-primary transition-colors">{initiative.creatorName}</span>
                              <Badge variant="secondary" className="text-[10px] capitalize rounded-full px-2 py-0">{initiative.category}</Badge>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <MapPin className="w-3 h-3" />
                              <span>{initiative.location?.split(",")[0]}</span>
                            </div>
                          </div>
                        </Link>
                        <div className="flex items-center gap-2">
                          <LifecycleBadge stage={initiative.lifecycleStage} />
                          <TrustScoreBadge score={initiative.trustScore?.overall ?? 0} size="sm" />
                        </div>
                      </div>
                    </div>

                    <Link href={`/initiatives/${initiative.id}`} className="block cursor-pointer">
                      <div className={`relative h-48 bg-gradient-to-br ${COVER_GRADIENTS[i % COVER_GRADIENTS.length]} flex items-center justify-center overflow-hidden`}>
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.3),transparent_70%)]" />
                        <span className="text-6xl opacity-40 select-none">{COVER_ICONS[i % COVER_ICONS.length]}</span>
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/40 to-transparent p-4 pt-8">
                          <h3 className="text-white font-bold text-lg leading-tight drop-shadow-md line-clamp-2">
                            {initiative.title}
                          </h3>
                        </div>
                        <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/30 backdrop-blur-sm text-white text-[10px] px-2 py-1 rounded-full">
                          <Eye className="w-3 h-3" /> {viewCount}
                        </div>
                      </div>
                    </Link>

                    <CardContent className="p-4 pt-3 space-y-3">
                      <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                        {initiative.description}
                      </p>

                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs font-medium">
                          <span className="text-primary">₹{initiative.fundingRaised?.toLocaleString('en-IN')} raised</span>
                          <span className="text-muted-foreground">₹{initiative.fundingGoal?.toLocaleString('en-IN')} goal</span>
                        </div>
                        <Progress
                          value={progress}
                          className="h-2 bg-primary/10 rounded-full"
                          indicatorClassName="bg-gradient-to-r from-primary to-teal-400 rounded-full"
                        />
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {initiative.volunteerCount} volunteers</span>
                          <span className="font-medium text-primary">{Math.round(progress)}% funded</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-border/50">
                        <div className="flex items-center gap-1">
                          <motion.button
                            whileTap={{ scale: 0.85 }}
                            onClick={() => handleLike(initiative.id, initiative.title)}
                            className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                              isLiked
                                ? "bg-red-50 text-red-500"
                                : "hover:bg-muted/50 text-muted-foreground hover:text-red-500"
                            }`}
                          >
                            <AnimatePresence mode="wait">
                              <motion.div
                                key={isLiked ? "liked" : "not-liked"}
                                initial={{ scale: 0.5 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0.5 }}
                              >
                                <Heart className={`w-4 h-4 ${isLiked ? "fill-red-500 text-red-500" : ""}`} />
                              </motion.div>
                            </AnimatePresence>
                            {isLiked ? "Liked" : "Like"}
                          </motion.button>
                          <button
                            onClick={handleComment}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium text-muted-foreground hover:bg-muted/50 hover:text-primary transition-all"
                          >
                            <MessageSquare className="w-4 h-4" /> Comment
                          </button>
                          <button
                            onClick={() => handleShare(initiative.title)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium text-muted-foreground hover:bg-muted/50 hover:text-primary transition-all"
                          >
                            <Share2 className="w-4 h-4" /> Share
                          </button>
                        </div>
                        <div className="flex items-center gap-1">
                          <Link href={`/initiatives/${initiative.id}`}>
                            <Button size="sm" variant="outline" className="rounded-full h-8 text-xs px-3 border-primary/30 text-primary hover:bg-primary/5">
                              <UserPlus className="w-3.5 h-3.5 mr-1" /> Join
                            </Button>
                          </Link>
                          <Link href={`/initiatives/${initiative.id}`}>
                            <Button size="sm" className="rounded-full h-8 text-xs px-3">
                              Donate
                            </Button>
                          </Link>
                        </div>
                      </div>

                      {initiative.lifecycleStage === 'active' && (
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                          <TrendingUp className="w-3 h-3 text-primary" />
                          <span>Trending in {categoryLabels[initiative.category] || initiative.category}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
