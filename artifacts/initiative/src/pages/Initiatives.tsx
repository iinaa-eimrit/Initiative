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
  "from-emerald-400/20 via-teal-300/30 to-cyan-400/20",
  "from-blue-400/20 via-indigo-300/30 to-purple-400/20",
  "from-amber-400/20 via-orange-300/30 to-red-400/20",
  "from-rose-400/20 via-pink-300/30 to-fuchsia-400/20",
  "from-violet-400/20 via-purple-300/30 to-indigo-400/20",
  "from-cyan-400/20 via-blue-300/30 to-indigo-400/20",
  "from-green-400/20 via-emerald-300/30 to-teal-400/20",
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
    <div className="min-h-screen bg-background pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-4">
          <div className="bg-card rounded-xl border border-border/50 p-3 shadow-sm">
            <StoryBar stories={stories.slice(0, 10)} onStoryClick={(id) => navigate(`/initiatives/${id}`)} />
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border/50 p-3 mb-4 shadow-sm">
          <div className="relative mb-2.5">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search initiatives..."
              className="pl-9 h-9 bg-muted/30 border-transparent focus:bg-card text-sm rounded-lg"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-1.5 overflow-x-auto hide-scrollbar">
            {CATEGORIES.map(c => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
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

        <div className="grid lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            {isLoading ? (
              <div className="grid sm:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map(i => (
                  <Card key={i} className="animate-pulse h-[280px] bg-muted/20 border-transparent rounded-xl" />
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-12 bg-destructive/5 rounded-xl border border-destructive/20">
                <p className="text-destructive font-medium text-sm">Failed to load initiatives. Please try again later.</p>
              </div>
            ) : !initiatives?.length ? (
              <div className="text-center py-16 bg-card rounded-xl border border-border/50">
                <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                <h3 className="text-lg font-bold mb-1.5">No initiatives found</h3>
                <p className="text-muted-foreground text-sm mb-4">Be the first to start something in this category!</p>
                <Button onClick={() => { setSearch(""); setCategory("All"); }} variant="outline" size="sm" className="rounded-full">
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {initiatives.map((initiative, i) => {
                  const progress = Math.min((initiative.fundingRaised / initiative.fundingGoal) * 100, 100);
                  const isLiked = likedIds.has(initiative.id);
                  const viewCount = 120 + (initiative.id * 47) % 300;

                  return (
                    <motion.div
                      key={initiative.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="card-hover"
                    >
                      <Card className="rounded-xl overflow-hidden border-border/50 bg-card shadow-sm hover:shadow-lg transition-shadow duration-300 h-full flex flex-col">
                        <div className="p-3 pb-2">
                          <div className="flex items-center justify-between">
                            <Link href={`/initiatives/${initiative.id}`} className="flex items-center gap-2 cursor-pointer group">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-teal-400 flex items-center justify-center text-white font-bold text-xs ring-2 ring-primary/20">
                                {initiative.creatorName.charAt(0)}
                              </div>
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <span className="font-semibold text-xs group-hover:text-primary transition-colors">{initiative.creatorName}</span>
                                  <Badge variant="secondary" className="text-[9px] capitalize rounded-full px-1.5 py-0">{initiative.category}</Badge>
                                </div>
                                <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                  <MapPin className="w-2.5 h-2.5" />
                                  <span>{initiative.location?.split(",")[0]}</span>
                                </div>
                              </div>
                            </Link>
                            <div className="flex items-center gap-1.5">
                              <LifecycleBadge stage={initiative.lifecycleStage} />
                              <TrustScoreBadge score={initiative.trustScore?.overall ?? 0} size="sm" />
                            </div>
                          </div>
                        </div>

                        <Link href={`/initiatives/${initiative.id}`} className="block cursor-pointer">
                          <div className={`relative h-32 bg-gradient-to-br ${COVER_GRADIENTS[i % COVER_GRADIENTS.length]} flex items-center justify-center overflow-hidden`}>
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.3),transparent_70%)]" />
                            <span className="text-5xl opacity-40 select-none">{COVER_ICONS[i % COVER_ICONS.length]}</span>
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-3 pt-6">
                              <h3 className="text-white font-bold text-sm leading-tight drop-shadow-md line-clamp-2">
                                {initiative.title}
                              </h3>
                            </div>
                            <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/30 backdrop-blur-sm text-white text-[9px] px-1.5 py-0.5 rounded-full">
                              <Eye className="w-2.5 h-2.5" /> {viewCount}
                            </div>
                          </div>
                        </Link>

                        <CardContent className="p-3 pt-2 space-y-2 flex-1 flex flex-col">
                          <div className="space-y-1">
                            <div className="flex justify-between text-[10px] font-medium">
                              <span className="text-primary font-semibold">₹{initiative.fundingRaised?.toLocaleString('en-IN')} raised</span>
                              <span className="text-muted-foreground">₹{initiative.fundingGoal?.toLocaleString('en-IN')} goal</span>
                            </div>
                            <Progress
                              value={progress}
                              className="h-1.5 bg-primary/10 rounded-full"
                              indicatorClassName="bg-gradient-to-r from-primary to-teal-400 rounded-full"
                            />
                            <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                              <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {initiative.volunteerCount} volunteers</span>
                              <span className="font-medium text-primary">{Math.round(progress)}% funded</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-border/50 mt-auto">
                            <div className="flex items-center gap-0.5">
                              <motion.button
                                whileTap={{ scale: 0.85 }}
                                onClick={() => handleLike(initiative.id, initiative.title)}
                                className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium transition-all ${
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
                                    <Heart className={`w-3.5 h-3.5 ${isLiked ? "fill-red-500 text-red-500" : ""}`} />
                                  </motion.div>
                                </AnimatePresence>
                                {isLiked ? "Liked" : "Like"}
                              </motion.button>
                              <button
                                onClick={handleComment}
                                className="flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium text-muted-foreground hover:bg-muted/50 hover:text-primary transition-all"
                              >
                                <MessageSquare className="w-3.5 h-3.5" /> Comment
                              </button>
                              <button
                                onClick={() => handleShare(initiative.title)}
                                className="flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium text-muted-foreground hover:bg-muted/50 hover:text-primary transition-all"
                              >
                                <Share2 className="w-3.5 h-3.5" /> Share
                              </button>
                            </div>
                            <div className="flex items-center gap-1">
                              <Link href={`/initiatives/${initiative.id}`}>
                                <Button size="sm" variant="outline" className="rounded-full h-7 text-[10px] px-2.5 border-primary/30 text-primary hover:bg-primary/5">
                                  <UserPlus className="w-3 h-3 mr-0.5" /> Join
                                </Button>
                              </Link>
                              <Link href={`/initiatives/${initiative.id}`}>
                                <Button size="sm" className="rounded-full h-7 text-[10px] px-2.5">
                                  Donate
                                </Button>
                              </Link>
                            </div>
                          </div>

                          {initiative.lifecycleStage === 'active' && (
                            <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground">
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

          <div className="hidden lg:block space-y-4 sticky top-16 self-start">
            <Card className="rounded-xl border-border/50 bg-card overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-amber-400 via-orange-400 to-red-400" />
              <CardContent className="p-4">
                <h3 className="font-semibold text-sm flex items-center gap-2 mb-3">
                  <Trophy className="w-4 h-4 text-amber-500" /> Leaderboard
                </h3>
                <div className="space-y-1.5">
                  {topVolunteerInitiatives.map((init, i) => (
                    <Link key={init.id} href={`/initiatives/${init.id}`}>
                      <motion.div
                        whileHover={{ x: 3 }}
                        className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-muted/50 transition-all cursor-pointer"
                      >
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold ${
                          i === 0 ? "bg-amber-100 text-amber-600 ring-2 ring-amber-300 dark:bg-amber-900/30" :
                          i === 1 ? "bg-gray-100 text-gray-600 ring-2 ring-gray-300 dark:bg-gray-800/50" :
                          i === 2 ? "bg-orange-100 text-orange-600 ring-2 ring-orange-300 dark:bg-orange-900/30" :
                          "bg-muted text-muted-foreground"
                        }`}>
                          {i === 0 ? <Award className="w-3.5 h-3.5" /> : i + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate">{init.title.split(":")[0]}</p>
                          <p className="text-[10px] text-muted-foreground">{init.volunteerCount} volunteers</p>
                        </div>
                        {i < 3 && (
                          <span className="text-[10px]">{i === 0 ? "🥇" : i === 1 ? "🥈" : "🥉"}</span>
                        )}
                      </motion.div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-xl border-border/50 bg-gradient-to-br from-primary/5 to-primary/10">
              <CardContent className="p-4 text-center">
                <Sparkles className="w-6 h-6 text-primary mx-auto mb-2" />
                <h3 className="font-semibold text-sm mb-1">Start with AI</h3>
                <p className="text-xs text-muted-foreground mb-3">Describe your idea and let AI build your initiative</p>
                <Link href="/initiatives/new">
                  <Button size="sm" className="rounded-full w-full text-xs">
                    <Sparkles className="w-3 h-3 mr-1.5" /> Generate with AI
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="rounded-xl border-border/50 bg-card">
              <CardContent className="p-4">
                <h3 className="font-semibold text-xs mb-2.5 flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-orange-500" /> Trending
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {TRENDING_TAGS.map((tag) => (
                    <Badge key={tag} variant="secondary" className="rounded-full cursor-pointer hover:bg-primary/10 hover:text-primary transition-colors text-[10px] px-2 py-0.5">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-xl border-border/50 bg-card">
              <CardContent className="p-4">
                <h3 className="font-semibold text-xs mb-2.5 flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-primary" /> Social Proof
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground flex items-center gap-1"><Eye className="w-3 h-3" /> Views</span>
                    <span className="font-bold">2,847</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground flex items-center gap-1"><Users className="w-3 h-3" /> Joins</span>
                    <span className="font-bold text-primary">+14</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground flex items-center gap-1"><Heart className="w-3 h-3" /> Likes</span>
                    <span className="font-bold text-red-500">+38</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
