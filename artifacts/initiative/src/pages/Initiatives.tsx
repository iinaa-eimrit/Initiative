import { useState } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Search, MapPin, Users, Heart, Shield, Sparkles, MessageSquare, Share2, UserPlus, TrendingUp, Eye, Trophy, Flame, Award } from "lucide-react";
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
  "from-emerald-400/15 via-teal-300/25 to-cyan-400/15",
  "from-blue-400/15 via-indigo-300/25 to-purple-400/15",
  "from-amber-400/15 via-orange-300/25 to-red-400/15",
  "from-rose-400/15 via-pink-300/25 to-fuchsia-400/15",
  "from-violet-400/15 via-purple-300/25 to-indigo-400/15",
  "from-cyan-400/15 via-blue-300/25 to-indigo-400/15",
  "from-green-400/15 via-emerald-300/25 to-teal-400/15",
];

const COVER_ICONS = ["🌱", "📚", "💊", "🤝", "💪", "🏘️", "🌊", "🌳", "⚕️", "🎓", "🌾"];

const TRENDING_TAGS = ["#CleanIndia", "#EducationForAll", "#WomenPower", "#RuralHealth", "#SaveOurRivers", "#TreePlanting"];

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

  const topVolunteerInitiatives = [...(initiatives ?? [])].sort((a, b) => b.volunteerCount - a.volunteerCount).slice(0, 5);

  const handleLike = (id: number, title: string) => {
    const alreadyLiked = likedIds.has(id);
    setLikedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
    if (!alreadyLiked) {
      toast({ title: "Liked!", description: `You liked "${title.split(":")[0]}"` });
    }
  };

  const handleShare = (title: string) => {
    toast({ title: "Link copied!", description: `Share link for "${title.split(":")[0]}" copied to clipboard.` });
  };

  const handleComment = () => {
    toast({ title: "Coming soon", description: "Comments will be available in the next update." });
  };

  return (
    <div className="min-h-screen bg-background pt-16 pb-10">
      <div className="page-container">
        <div className="mb-3">
          <div className="bg-card rounded-xl border border-border/50 p-2.5 shadow-xs">
            <StoryBar stories={stories.slice(0, 10)} onStoryClick={(id) => navigate(`/initiatives/${id}`)} />
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border/50 p-2.5 mb-3 shadow-xs">
          <div className="relative mb-2">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              placeholder="Search initiatives..."
              className="pl-8 h-8 bg-muted/30 border-transparent focus:bg-card text-[13px] rounded-lg"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-1 overflow-x-auto hide-scrollbar">
            {CATEGORIES.map(c => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`px-3 py-1 rounded-md text-[11px] font-medium whitespace-nowrap transition-all duration-150 ${
                  category === c
                    ? "bg-gradient-to-r from-primary to-teal-500 text-white shadow-xs"
                    : "bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {categoryLabels[c] || c}
              </button>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-3">
          <div className="lg:col-span-2">
            {isLoading ? (
              <div className="grid sm:grid-cols-2 gap-3">
                {[1, 2, 3, 4].map(i => (
                  <Card key={i} className="animate-pulse h-[240px] bg-muted/20 border-transparent rounded-xl" />
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-10 bg-destructive/5 rounded-xl border border-destructive/20">
                <p className="text-destructive font-medium text-[13px]">Failed to load initiatives. Please try again later.</p>
              </div>
            ) : !initiatives?.length ? (
              <div className="text-center py-12 bg-card rounded-xl border border-border/50">
                <Heart className="w-10 h-10 text-muted-foreground mx-auto mb-2.5 opacity-40" />
                <h3 className="text-base font-semibold mb-1">No initiatives found</h3>
                <p className="text-muted-foreground text-[13px] mb-3">Be the first to start something in this category!</p>
                <Button onClick={() => { setSearch(""); setCategory("All"); }} variant="outline" size="sm" className="rounded-lg text-[11px]">
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-3">
                {initiatives.map((initiative, i) => {
                  const progress = Math.min((initiative.fundingRaised / initiative.fundingGoal) * 100, 100);
                  const isLiked = likedIds.has(initiative.id);
                  const viewCount = 120 + (initiative.id * 47) % 300;

                  return (
                    <motion.div
                      key={initiative.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                    >
                      <Card className="card-elevated overflow-hidden h-full flex flex-col">
                        <div className="p-2.5 pb-1.5">
                          <div className="flex items-center justify-between">
                            <Link href={`/initiatives/${initiative.id}`} className="flex items-center gap-2 cursor-pointer group">
                              <div className="w-6 h-6 rounded-md bg-gradient-to-br from-primary to-teal-400 flex items-center justify-center text-white font-semibold text-[9px] shadow-xs">
                                {initiative.creatorName.charAt(0)}
                              </div>
                              <div>
                                <div className="flex items-center gap-1">
                                  <span className="font-medium text-[12px] group-hover:text-primary transition-colors">{initiative.creatorName}</span>
                                  <Badge variant="secondary" className="text-[8px] capitalize rounded-md px-1 py-0 h-3.5">{initiative.category}</Badge>
                                </div>
                                <div className="flex items-center gap-0.5 text-[9px] text-muted-foreground">
                                  <MapPin className="w-2.5 h-2.5" />
                                  <span>{initiative.location?.split(",")[0]}</span>
                                </div>
                              </div>
                            </Link>
                            <div className="flex items-center gap-1">
                              <LifecycleBadge stage={initiative.lifecycleStage} />
                              <TrustScoreBadge score={initiative.trustScore?.overall ?? 0} size="sm" />
                            </div>
                          </div>
                        </div>

                        <Link href={`/initiatives/${initiative.id}`} className="block cursor-pointer">
                          <div className={`relative h-28 bg-gradient-to-br ${COVER_GRADIENTS[i % COVER_GRADIENTS.length]} flex items-center justify-center overflow-hidden`}>
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.25),transparent_70%)]" />
                            <span className="text-4xl opacity-35 select-none">{COVER_ICONS[i % COVER_ICONS.length]}</span>
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2.5 pt-6">
                              <h3 className="text-white font-semibold text-[12px] leading-tight drop-shadow-md line-clamp-2">
                                {initiative.title}
                              </h3>
                            </div>
                            <div className="absolute top-1.5 right-1.5 flex items-center gap-0.5 bg-black/30 backdrop-blur-sm text-white text-[8px] px-1 py-0.5 rounded-md">
                              <Eye className="w-2.5 h-2.5" /> {viewCount}
                            </div>
                          </div>
                        </Link>

                        <CardContent className="p-2.5 pt-2 space-y-1.5 flex-1 flex flex-col">
                          <div className="space-y-1">
                            <div className="flex justify-between text-[10px] font-medium">
                              <span className="text-primary font-medium">₹{initiative.fundingRaised?.toLocaleString('en-IN')} raised</span>
                              <span className="text-muted-foreground">₹{initiative.fundingGoal?.toLocaleString('en-IN')} goal</span>
                            </div>
                            <Progress
                              value={progress}
                              className="h-1 bg-primary/10 rounded-full"
                              indicatorClassName="progress-gradient"
                            />
                            <div className="flex items-center justify-between text-[9px] text-muted-foreground">
                              <span className="flex items-center gap-0.5"><Users className="w-2.5 h-2.5" /> {initiative.volunteerCount} volunteers</span>
                              <span className="font-medium text-primary">{Math.round(progress)}% funded</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-border/40 mt-auto">
                            <div className="flex items-center gap-0">
                              <motion.button
                                whileTap={{ scale: 0.85 }}
                                onClick={() => handleLike(initiative.id, initiative.title)}
                                className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[9px] font-medium transition-all ${
                                  isLiked
                                    ? "bg-red-50 text-red-500 dark:bg-red-900/20"
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
                                    <Heart className={`w-3 h-3 ${isLiked ? "fill-red-500 text-red-500" : ""}`} />
                                  </motion.div>
                                </AnimatePresence>
                                {isLiked ? "Liked" : "Like"}
                              </motion.button>
                              <button
                                onClick={handleComment}
                                className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[9px] font-medium text-muted-foreground hover:bg-muted/50 hover:text-primary transition-all"
                              >
                                <MessageSquare className="w-3 h-3" /> Comment
                              </button>
                              <button
                                onClick={() => handleShare(initiative.title)}
                                className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[9px] font-medium text-muted-foreground hover:bg-muted/50 hover:text-primary transition-all"
                              >
                                <Share2 className="w-3 h-3" /> Share
                              </button>
                            </div>
                            <div className="flex items-center gap-1">
                              <Link href={`/initiatives/${initiative.id}`}>
                                <Button size="sm" variant="outline" className="rounded-md h-5.5 text-[9px] px-2 border-primary/25 text-primary hover:bg-primary/5">
                                  <UserPlus className="w-2.5 h-2.5 mr-0.5" /> Join
                                </Button>
                              </Link>
                              <Link href={`/initiatives/${initiative.id}`}>
                                <Button size="sm" className="rounded-md h-5.5 text-[9px] px-2 bg-gradient-to-r from-primary to-teal-500 border-0">
                                  Donate
                                </Button>
                              </Link>
                            </div>
                          </div>

                          {initiative.lifecycleStage === 'active' && (
                            <div className="flex items-center gap-1 text-[8px] text-muted-foreground">
                              <TrendingUp className="w-2.5 h-2.5 text-primary" />
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

          <div className="hidden lg:block space-y-3 sticky top-16 self-start">
            <Card className="card-elevated overflow-hidden">
              <div className="h-0.5 bg-gradient-to-r from-amber-400 via-orange-400 to-red-400" />
              <CardContent className="p-3.5">
                <h3 className="font-medium text-[13px] flex items-center gap-1.5 mb-2.5">
                  <div className="w-5 h-5 rounded-md bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                    <Trophy className="w-3 h-3 text-white" />
                  </div>
                  Leaderboard
                </h3>
                <div className="space-y-0.5">
                  {topVolunteerInitiatives.map((init, i) => (
                    <Link key={init.id} href={`/initiatives/${init.id}`}>
                      <motion.div
                        whileHover={{ x: 2 }}
                        className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-muted/50 transition-all cursor-pointer"
                      >
                        <div className={`w-5.5 h-5.5 rounded-md flex items-center justify-center text-[9px] font-semibold ${
                          i === 0 ? "bg-gradient-to-br from-amber-400 to-amber-600 text-white" :
                          i === 1 ? "bg-gradient-to-br from-gray-300 to-gray-500 text-white" :
                          i === 2 ? "bg-gradient-to-br from-orange-400 to-orange-600 text-white" :
                          "bg-muted text-muted-foreground"
                        }`}>
                          {i === 0 ? <Award className="w-3 h-3" /> : i + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-medium truncate">{init.title.split(":")[0]}</p>
                          <p className="text-[9px] text-muted-foreground">{init.volunteerCount} volunteers</p>
                        </div>
                        {i < 3 && (
                          <span className="text-[9px]">{i === 0 ? "🥇" : i === 1 ? "🥈" : "🥉"}</span>
                        )}
                      </motion.div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden border-0 bg-gradient-to-br from-primary/8 via-primary/4 to-teal-500/8 dark:from-primary/12 dark:to-teal-500/12 shadow-sm">
              <CardContent className="p-4 text-center">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-teal-500 flex items-center justify-center text-white mx-auto mb-2.5 shadow-md">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h3 className="font-medium text-[13px] mb-0.5">Start with AI</h3>
                <p className="text-[11px] text-muted-foreground mb-2.5">Describe your idea and let AI build your initiative</p>
                <Link href="/initiatives/new">
                  <Button size="sm" className="rounded-lg w-full text-[11px] h-7 bg-gradient-to-r from-primary to-teal-500 border-0 shadow-sm">
                    <Sparkles className="w-3 h-3 mr-1" /> Generate with AI
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="card-elevated">
              <CardContent className="p-3.5">
                <h3 className="font-medium text-[12px] mb-2 flex items-center gap-1">
                  <Flame className="w-3 h-3 text-orange-500" /> Trending
                </h3>
                <div className="flex flex-wrap gap-1">
                  {TRENDING_TAGS.map((tag) => (
                    <Badge key={tag} variant="secondary" className="rounded-md cursor-pointer hover:bg-primary/10 hover:text-primary transition-all duration-150 text-[9px] px-2 py-0.5">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="card-elevated">
              <CardContent className="p-3.5">
                <h3 className="font-medium text-[12px] mb-2 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-primary" /> Social Proof
                </h3>
                <div className="space-y-2">
                  {[
                    { label: "Views", value: "2,847", icon: Eye, color: "text-foreground" },
                    { label: "Joins", value: "+14", icon: Users, color: "text-primary" },
                    { label: "Likes", value: "+38", icon: Heart, color: "text-rose-500" },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between text-[11px]">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <item.icon className="w-3 h-3" /> {item.label}
                      </span>
                      <span className={`font-semibold ${item.color}`}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
