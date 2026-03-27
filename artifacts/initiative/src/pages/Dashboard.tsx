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

  const statCards = [
    { label: "Active Missions", value: activeCount, icon: Target, gradient: "from-emerald-500 to-teal-600", trend: "+2 this week" },
    { label: "Total Volunteers", value: `${totalVolunteers}+`, icon: Users, gradient: "from-blue-500 to-indigo-600", trend: "+14 today" },
    { label: "Funds Raised", value: `₹${(totalFunding / 100000).toFixed(1)}L+`, icon: DollarSign, gradient: "from-amber-500 to-orange-600", trend: "+₹2.1L this week" },
    { label: "Completed", value: completedCount, icon: Trophy, gradient: "from-purple-500 to-fuchsia-600", trend: "100% success rate" },
  ];

  return (
    <div className="min-h-screen bg-background pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">
                Impact <span className="text-gradient-hero">Dashboard</span>
              </h1>
              <p className="text-muted-foreground text-sm mt-0.5">Track missions, updates, and community progress.</p>
            </div>
            <Link href="/initiatives/new">
              <Button size="sm" className="rounded-full shadow-lg shadow-primary/20 bg-gradient-to-r from-primary to-teal-500 border-0">
                <Sparkles className="w-3.5 h-3.5 mr-1.5" /> Generate with AI
              </Button>
            </Link>
          </div>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {statCards.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="card-elevated overflow-hidden">
                <div className={`h-1 w-full bg-gradient-to-r ${stat.gradient}`} />
                <CardContent className="p-4">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center text-white shadow-md mb-3`}>
                    <stat.icon className="w-5 h-5" />
                  </div>
                  <p className="text-2xl font-bold tracking-tight">{stat.value}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5 font-medium">{stat.label}</p>
                  <p className="text-[9px] text-primary font-medium mt-1.5 flex items-center gap-1">
                    <TrendingUp className="w-2.5 h-2.5" /> {stat.trend}
                  </p>
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
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-primary to-teal-500 flex items-center justify-center">
                    <Target className="w-3.5 h-3.5 text-white" />
                  </div>
                  Active Missions
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
                    <div key={i} className="h-28 bg-muted/20 rounded-2xl animate-pulse" />
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
                      >
                        <Card className="card-elevated">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between gap-3">
                              <Link href={`/initiatives/${initiative.id}`} className="flex-1 min-w-0 cursor-pointer">
                                <div className="flex items-center gap-2.5 mb-1.5">
                                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-teal-400 flex items-center justify-center text-white font-bold text-[10px] shrink-0 shadow-sm">
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
                                  <Progress value={progress} className="h-1.5 rounded-full" indicatorClassName="progress-gradient" />
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
                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                  <MessageSquare className="w-3.5 h-3.5 text-white" />
                </div>
                Impact Updates
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
                  <Card key={`update-${initiative.id}`} className="card-elevated">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary/80 to-teal-400 flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-sm">
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
            <Card className="card-elevated overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-amber-400 via-orange-400 to-red-400" />
              <CardHeader className="pb-1 pt-3 px-4">
                <h3 className="font-semibold text-sm flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                    <Trophy className="w-3.5 h-3.5 text-white" />
                  </div>
                  Leaderboard
                </h3>
              </CardHeader>
              <CardContent className="pt-0 px-4 pb-3">
                <Tabs value={leaderboardTab} onValueChange={setLeaderboardTab}>
                  <TabsList className="w-full rounded-xl mb-2 h-8">
                    <TabsTrigger value="volunteers" className="flex-1 rounded-lg text-[10px]">Top Volunteers</TabsTrigger>
                    <TabsTrigger value="donors" className="flex-1 rounded-lg text-[10px]">Top Funded</TabsTrigger>
                  </TabsList>
                  <TabsContent value="volunteers" className="space-y-1">
                    {topVolunteerInitiatives.map((init, i) => (
                      <Link key={init.id} href={`/initiatives/${init.id}`}>
                        <motion.div
                          whileHover={{ x: 3 }}
                          className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-muted/50 transition-all cursor-pointer"
                        >
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold ${
                            i === 0 ? "bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-sm" :
                            i === 1 ? "bg-gradient-to-br from-gray-300 to-gray-500 text-white shadow-sm" :
                            i === 2 ? "bg-gradient-to-br from-orange-400 to-orange-600 text-white shadow-sm" :
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
                  </TabsContent>
                  <TabsContent value="donors" className="space-y-1">
                    {topFundedInitiatives.map((init, i) => (
                      <Link key={init.id} href={`/initiatives/${init.id}`}>
                        <motion.div
                          whileHover={{ x: 3 }}
                          className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-muted/50 transition-all cursor-pointer"
                        >
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold ${
                            i === 0 ? "bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-sm" :
                            i === 1 ? "bg-gradient-to-br from-emerald-300 to-emerald-500 text-white shadow-sm" :
                            i === 2 ? "bg-gradient-to-br from-teal-400 to-teal-600 text-white shadow-sm" :
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

            <Card className="card-elevated">
              <CardContent className="p-4">
                <h3 className="font-semibold text-xs mb-2.5 flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-orange-500" /> Trending
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {TRENDING_TAGS.map((tag) => (
                    <Badge key={tag} variant="secondary" className="rounded-full cursor-pointer hover:bg-primary/10 hover:text-primary transition-all duration-200 text-[10px] px-2.5 py-0.5">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="card-elevated">
              <CardContent className="p-4">
                <h3 className="font-semibold text-xs mb-3 flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-primary" /> Social Proof
                </h3>
                <div className="space-y-2.5">
                  {[
                    { label: "Total Views", value: "2,847", icon: Eye, color: "text-foreground" },
                    { label: "Joins Today", value: "+14", icon: Users, color: "text-primary" },
                    { label: "Likes Today", value: "+38", icon: Heart, color: "text-rose-500" },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground flex items-center gap-1.5">
                        <item.icon className="w-3.5 h-3.5" /> {item.label}
                      </span>
                      <span className={`font-bold ${item.color}`}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden border-0 bg-gradient-to-br from-primary/10 via-primary/5 to-teal-500/10 dark:from-primary/15 dark:to-teal-500/15 shadow-lg">
              <CardContent className="p-5 text-center">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-teal-500 flex items-center justify-center text-white mx-auto mb-3 shadow-lg">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-sm mb-1">Ready to lead?</h3>
                <p className="text-xs text-muted-foreground mb-3">Use AI to structure your next initiative</p>
                <Link href="/initiatives/new">
                  <Button size="sm" className="rounded-full w-full text-xs bg-gradient-to-r from-primary to-teal-500 border-0 shadow-md">
                    <Sparkles className="w-3 h-3 mr-1.5" /> Generate with AI
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="card-elevated">
              <CardContent className="p-4">
                <h3 className="font-semibold text-xs mb-2.5">Categories</h3>
                <div className="flex flex-wrap gap-1.5">
                  {["Education", "Environment", "Healthcare", "Community", "Women Empowerment", "Rural Development"].map((cat) => (
                    <Link key={cat} href="/initiatives">
                      <Badge variant="secondary" className="rounded-full cursor-pointer hover:bg-primary/10 hover:text-primary transition-all duration-200 text-[10px] px-2.5 py-0.5">
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
