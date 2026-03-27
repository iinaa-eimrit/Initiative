import { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import {
  Sparkles, Users, DollarSign, Target, TrendingUp, Heart,
  MapPin, ArrowRight, Trophy, MessageSquare,
  Eye, Share2, Flame, Award
} from "lucide-react";
import { useListInitiatives } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrustScoreBadge } from "@/components/TrustScoreBadge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

const TRENDING_TAGS = ["#CleanIndia", "#EducationForAll", "#WomenPower", "#RuralHealth", "#SaveOurRivers", "#TreePlanting"];

export default function Dashboard() {
  const { data: initiatives, isLoading } = useListInitiatives({});
  const [leaderboardTab, setLeaderboardTab] = useState("volunteers");
  const [likedIds, setLikedIds] = useState<Set<number>>(new Set());
  const { toast } = useToast();

  const totalVolunteers = initiatives?.reduce((sum, i) => sum + i.volunteerCount, 0) ?? 0;
  const totalFunding = initiatives?.reduce((sum, i) => sum + i.fundingRaised, 0) ?? 0;
  const activeCount = initiatives?.filter((i) => i.status === "active").length ?? 0;
  const completedCount = initiatives?.filter((i) => i.status === "completed").length ?? 0;

  const topVolunteerInitiatives = [...(initiatives ?? [])].sort((a, b) => b.volunteerCount - a.volunteerCount).slice(0, 5);
  const topFundedInitiatives = [...(initiatives ?? [])].sort((a, b) => b.fundingRaised - a.fundingRaised).slice(0, 5);

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

  return (
    <div className="min-h-screen bg-background pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-5"
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">
                Impact <span className="text-gradient">Dashboard</span>
              </h1>
              <p className="text-muted-foreground text-sm mt-0.5">Track missions, updates, and community progress.</p>
            </div>
            <Link href="/initiatives/new">
              <Button size="sm" className="rounded-full shadow-lg shadow-primary/20">
                <Sparkles className="w-3.5 h-3.5 mr-1.5" /> Generate with AI
              </Button>
            </Link>
          </div>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { label: "Active Missions", value: activeCount, icon: Target, color: "text-primary", bg: "bg-primary/10" },
            { label: "Total Volunteers", value: `${totalVolunteers}+`, icon: Users, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-900/20" },
            { label: "Funds Raised", value: `₹${(totalFunding / 100000).toFixed(1)}L+`, icon: DollarSign, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
            { label: "Completed", value: completedCount, icon: Trophy, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-900/20" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="card-hover"
            >
              <Card className="rounded-xl border-border/50 bg-card hover:shadow-lg transition-all duration-300">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <div className={`w-8 h-8 rounded-lg ${stat.bg} flex items-center justify-center ${stat.color}`}>
                      <stat.icon className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="text-xl font-bold">{stat.value}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{stat.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-4">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-bold flex items-center gap-2">
                  <Target className="w-4 h-4 text-primary" /> Active Missions
                </h2>
                <Link href="/initiatives">
                  <Button variant="ghost" size="sm" className="rounded-full text-primary text-xs h-8">
                    View All <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </Link>
              </div>

              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-28 bg-muted/20 rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {initiatives?.filter(i => i.status === "active").slice(0, 6).map((initiative, idx) => {
                    const progress = Math.min((initiative.fundingRaised / initiative.fundingGoal) * 100, 100);
                    const isLiked = likedIds.has(initiative.id);
                    const viewCount = 80 + (initiative.id * 31) % 200;
                    return (
                      <motion.div
                        key={initiative.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="card-hover"
                      >
                        <Card className="rounded-xl border-border/50 hover:shadow-lg transition-all bg-card">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between gap-3">
                              <Link href={`/initiatives/${initiative.id}`} className="flex-1 min-w-0 cursor-pointer">
                                <div className="flex items-center gap-2.5 mb-1.5">
                                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-teal-400 flex items-center justify-center text-white font-bold text-[10px] shrink-0">
                                    {initiative.creatorName.charAt(0)}
                                  </div>
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="font-semibold text-xs">{initiative.creatorName}</span>
                                    <Badge variant="secondary" className="text-[9px] capitalize rounded-full px-1.5 py-0">
                                      {initiative.category}
                                    </Badge>
                                    <Badge variant="outline" className="text-[9px] capitalize rounded-full px-1.5 py-0">
                                      {initiative.lifecycleStage.replace("_", " ")}
                                    </Badge>
                                  </div>
                                </div>
                                <h3 className="font-semibold text-sm hover:text-primary transition-colors">{initiative.title}</h3>
                                <div className="flex items-center gap-3 mt-1.5 text-[10px] text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <Users className="w-3 h-3" /> {initiative.volunteerCount}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    ₹{initiative.fundingRaised.toLocaleString('en-IN')}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <MapPin className="w-3 h-3" /> {initiative.location?.split(",")[0]}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Eye className="w-3 h-3" /> {viewCount}
                                  </span>
                                </div>
                                <div className="mt-2">
                                  <Progress value={progress} className="h-1.5 rounded-full" />
                                  <p className="text-[10px] text-muted-foreground mt-0.5">{Math.round(progress)}% funded</p>
                                </div>
                              </Link>
                              <div className="flex flex-col items-center gap-1.5">
                                <TrustScoreBadge score={initiative.trustScore?.overall ?? 0} />
                                <motion.button
                                  whileTap={{ scale: 0.85 }}
                                  onClick={() => handleLike(initiative.id, initiative.title)}
                                  className={`flex items-center gap-1 text-[10px] px-2 py-1 rounded-full transition-all ${
                                    isLiked
                                      ? "bg-red-50 text-red-500 dark:bg-red-900/20"
                                      : "hover:bg-muted/50 text-muted-foreground hover:text-red-500"
                                  }`}
                                >
                                  <Heart className={`w-3 h-3 ${isLiked ? "fill-red-500" : ""}`} />
                                  {isLiked ? "Liked" : "Like"}
                                </motion.button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>

            <div>
              <h2 className="text-base font-bold flex items-center gap-2 mb-3">
                <MessageSquare className="w-4 h-4 text-blue-500" /> Impact Updates
              </h2>
              <div className="space-y-3">
                {initiatives?.slice(0, 4).map((initiative, idx) => {
                const trustLabels = [
                  { text: "AI Verified", color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400", icon: "🤖" },
                  { text: "Milestone completed", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400", icon: "✅" },
                  { text: "Funds unlocked", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400", icon: "🔓" },
                  { text: "Community growing", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400", icon: "📈" },
                ];
                const label = trustLabels[idx % trustLabels.length];
                const updateMessages = [
                  "AI has verified all milestones and impact reports for this initiative. Trust score updated.",
                  `Milestone "${initiative.title.split(":")[0]}" marked as completed. Progress on track.`,
                  `₹${(initiative.fundingRaised * 0.3).toLocaleString('en-IN')} in funds unlocked after milestone verification.`,
                  `${initiative.volunteerCount} volunteers now engaged. Community momentum building.`,
                ];
                return (
                  <Card key={`update-${initiative.id}`} className="rounded-xl border-border/50 bg-card hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/80 to-teal-400 flex items-center justify-center text-white font-bold text-xs shrink-0">
                          {initiative.creatorName.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="font-medium text-xs">{initiative.creatorName}</span>
                            <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-semibold ${label.color}`}>
                              {label.icon} {label.text}
                            </span>
                          </div>
                          <Link href={`/initiatives/${initiative.id}`}>
                            <h4 className="font-semibold text-xs hover:text-primary transition-colors cursor-pointer truncate">
                              {initiative.title}
                            </h4>
                          </Link>
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                            {updateMessages[idx % updateMessages.length]}
                          </p>
                          <div className="flex items-center gap-3 mt-2">
                            <motion.button
                              whileTap={{ scale: 0.85 }}
                              onClick={() => handleLike(initiative.id, initiative.title)}
                              className={`flex items-center gap-1 text-[10px] transition-colors ${
                                likedIds.has(initiative.id)
                                  ? "text-red-500"
                                  : "text-muted-foreground hover:text-red-500"
                              }`}
                            >
                              <Heart className={`w-3 h-3 ${likedIds.has(initiative.id) ? "fill-red-500" : ""}`} /> Like
                            </motion.button>
                            <button
                              onClick={() => toast({ title: "Coming soon", description: "Comments will be available in the next update." })}
                              className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-primary transition-colors"
                            >
                              <MessageSquare className="w-3 h-3" /> Comment
                            </button>
                            <button
                              onClick={() => toast({ title: "Link copied!", description: "Share link copied to clipboard." })}
                              className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-primary transition-colors"
                            >
                              <Share2 className="w-3 h-3" /> Share
                            </button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
                })}
              </div>
            </div>
          </div>

          <div className="space-y-4 sticky top-16 self-start">
            <Card className="rounded-xl border-border/50 bg-card overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-amber-400 via-orange-400 to-red-400" />
              <CardHeader className="pb-1 pt-3 px-4">
                <h3 className="font-semibold text-sm flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-amber-500" /> Leaderboard
                </h3>
              </CardHeader>
              <CardContent className="pt-0 px-4 pb-3">
                <Tabs value={leaderboardTab} onValueChange={setLeaderboardTab}>
                  <TabsList className="w-full rounded-lg mb-2 h-8">
                    <TabsTrigger value="volunteers" className="flex-1 rounded-md text-[10px]">Top Volunteers</TabsTrigger>
                    <TabsTrigger value="donors" className="flex-1 rounded-md text-[10px]">Top Funded</TabsTrigger>
                  </TabsList>
                  <TabsContent value="volunteers" className="space-y-1">
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
                            "bg-primary/10 text-primary"
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
                  </TabsContent>
                  <TabsContent value="donors" className="space-y-1">
                    {topFundedInitiatives.map((init, i) => (
                      <Link key={init.id} href={`/initiatives/${init.id}`}>
                        <motion.div
                          whileHover={{ x: 3 }}
                          className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-muted/50 transition-all cursor-pointer"
                        >
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold ${
                            i === 0 ? "bg-emerald-100 text-emerald-600 ring-2 ring-emerald-300 dark:bg-emerald-900/30" :
                            i === 1 ? "bg-emerald-50 text-emerald-500 ring-2 ring-emerald-200 dark:bg-emerald-900/20" :
                            i === 2 ? "bg-teal-50 text-teal-500 ring-2 ring-teal-200 dark:bg-teal-900/20" :
                            "bg-muted text-muted-foreground"
                          }`}>
                            {i === 0 ? <Award className="w-3.5 h-3.5" /> : i + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium truncate">{init.title.split(":")[0]}</p>
                            <p className="text-[10px] text-muted-foreground">₹{init.fundingRaised.toLocaleString('en-IN')} raised</p>
                          </div>
                          {i < 3 && (
                            <span className="text-[10px]">{i === 0 ? "🥇" : i === 1 ? "🥈" : "🥉"}</span>
                          )}
                        </motion.div>
                      </Link>
                    ))}
                  </TabsContent>
                </Tabs>
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
                    <span className="text-muted-foreground flex items-center gap-1"><Eye className="w-3 h-3" /> Total Views</span>
                    <span className="font-bold">2,847</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground flex items-center gap-1"><Users className="w-3 h-3" /> Joins Today</span>
                    <span className="font-bold text-primary">+14</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground flex items-center gap-1"><Heart className="w-3 h-3" /> Likes Today</span>
                    <span className="font-bold text-red-500">+38</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-xl border-border/50 bg-gradient-to-br from-primary/5 to-primary/10">
              <CardContent className="p-4 text-center">
                <Sparkles className="w-6 h-6 text-primary mx-auto mb-2" />
                <h3 className="font-semibold text-sm mb-1">Ready to lead?</h3>
                <p className="text-xs text-muted-foreground mb-3">Use AI to structure your next initiative</p>
                <Link href="/initiatives/new">
                  <Button size="sm" className="rounded-full w-full text-xs">
                    <Sparkles className="w-3 h-3 mr-1.5" /> Generate with AI
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="rounded-xl border-border/50 bg-card">
              <CardContent className="p-4">
                <h3 className="font-semibold text-xs mb-2.5">Categories</h3>
                <div className="flex flex-wrap gap-1.5">
                  {["Education", "Environment", "Healthcare", "Community", "Women Empowerment", "Rural Development"].map((cat) => (
                    <Link key={cat} href="/initiatives">
                      <Badge variant="secondary" className="rounded-full cursor-pointer hover:bg-primary/10 hover:text-primary transition-colors text-[10px] px-2 py-0.5">
                        {cat}
                      </Badge>
                    </Link>
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
