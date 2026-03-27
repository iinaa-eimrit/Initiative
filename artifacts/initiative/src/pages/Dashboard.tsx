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
    <div className="min-h-screen bg-background pt-16 pb-10">
      <div className="page-container">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-5"
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
            <div>
              <h1 className="text-xl font-semibold">
                Impact <span className="text-gradient-hero">Dashboard</span>
              </h1>
              <p className="text-muted-foreground text-[13px] mt-0.5">Track missions, updates, and community progress.</p>
            </div>
            <Link href="/initiatives/new">
              <Button size="sm" className="rounded-lg h-7 text-[11px] shadow-sm bg-gradient-to-r from-primary to-teal-500 border-0">
                <Sparkles className="w-3 h-3 mr-1" /> Generate with AI
              </Button>
            </Link>
          </div>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
          {statCards.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <Card className="card-elevated overflow-hidden">
                <div className={`h-0.5 w-full bg-gradient-to-r ${stat.gradient}`} />
                <CardContent className="p-3.5">
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${stat.gradient} flex items-center justify-center text-white shadow-sm mb-2.5`}>
                    <stat.icon className="w-4 h-4" />
                  </div>
                  <p className="text-xl font-semibold tracking-tight">{stat.value}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5 font-medium">{stat.label}</p>
                  <p className="text-[9px] text-primary font-medium mt-1 flex items-center gap-0.5">
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
                <h2 className="text-sm font-semibold flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-md bg-gradient-to-br from-primary to-teal-500 flex items-center justify-center">
                    <Target className="w-3 h-3 text-white" />
                  </div>
                  Active Missions
                </h2>
                <Link href="/initiatives">
                  <Button variant="ghost" size="sm" className="rounded-lg text-primary text-[11px] h-7 px-2">
                    View All <ArrowRight className="w-3 h-3 ml-0.5" />
                  </Button>
                </Link>
              </div>

              {isLoading ? (
                <div className="space-y-2.5">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-24 bg-muted/20 rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="space-y-2.5">
                  {initiatives?.filter(i => i.status === "active").slice(0, 5).map((initiative, idx) => {
                    const progress = Math.min((initiative.fundingRaised / initiative.fundingGoal) * 100, 100);
                    const isLiked = likedIds.has(initiative.id);
                    const viewCount = 80 + (initiative.id * 31) % 200;
                    return (
                      <motion.div
                        key={initiative.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.04 }}
                      >
                        <Card className="card-elevated">
                          <CardContent className="p-3.5">
                            <div className="flex items-start justify-between gap-3">
                              <Link href={`/initiatives/${initiative.id}`} className="flex-1 min-w-0 cursor-pointer">
                                <div className="flex items-center gap-2 mb-1">
                                  <div className="w-6 h-6 rounded-md bg-gradient-to-br from-primary to-teal-400 flex items-center justify-center text-white font-semibold text-[9px] shrink-0 shadow-xs">
                                    {initiative.creatorName.charAt(0)}
                                  </div>
                                  <div className="flex items-center gap-1 flex-wrap">
                                    <span className="font-medium text-[12px]">{initiative.creatorName}</span>
                                    <Badge variant="secondary" className="text-[8px] capitalize rounded-md px-1 py-0 h-3.5">
                                      {initiative.category}
                                    </Badge>
                                    <Badge variant="outline" className="text-[8px] capitalize rounded-md px-1 py-0 h-3.5">
                                      {initiative.lifecycleStage.replace("_", " ")}
                                    </Badge>
                                  </div>
                                </div>
                                <h3 className="font-medium text-[13px] hover:text-primary transition-colors leading-snug">{initiative.title}</h3>
                                <div className="flex items-center gap-2.5 mt-1 text-[10px] text-muted-foreground">
                                  <span className="flex items-center gap-0.5">
                                    <Users className="w-2.5 h-2.5" /> {initiative.volunteerCount}
                                  </span>
                                  <span>₹{initiative.fundingRaised.toLocaleString('en-IN')}</span>
                                  <span className="flex items-center gap-0.5">
                                    <MapPin className="w-2.5 h-2.5" /> {initiative.location?.split(",")[0]}
                                  </span>
                                  <span className="flex items-center gap-0.5">
                                    <Eye className="w-2.5 h-2.5" /> {viewCount}
                                  </span>
                                </div>
                                <div className="mt-1.5">
                                  <Progress value={progress} className="h-1 rounded-full" indicatorClassName="progress-gradient" />
                                  <p className="text-[9px] text-muted-foreground mt-0.5">{Math.round(progress)}% funded</p>
                                </div>
                              </Link>
                              <div className="flex flex-col items-center gap-1">
                                <TrustScoreBadge score={initiative.trustScore?.overall ?? 0} />
                                <motion.button
                                  whileTap={{ scale: 0.85 }}
                                  onClick={() => handleLike(initiative.id, initiative.title)}
                                  className={`flex items-center gap-0.5 text-[9px] px-1.5 py-0.5 rounded-md transition-all ${
                                    isLiked
                                      ? "bg-red-50 text-red-500 dark:bg-red-900/20"
                                      : "hover:bg-muted/50 text-muted-foreground hover:text-red-500"
                                  }`}
                                >
                                  <Heart className={`w-2.5 h-2.5 ${isLiked ? "fill-red-500" : ""}`} />
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
              <h2 className="text-sm font-semibold flex items-center gap-1.5 mb-3">
                <div className="w-5 h-5 rounded-md bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                  <MessageSquare className="w-3 h-3 text-white" />
                </div>
                Impact Updates
              </h2>
              <div className="space-y-2.5">
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
                    <CardContent className="p-3.5">
                      <div className="flex items-start gap-2.5">
                        <div className="w-6 h-6 rounded-md bg-gradient-to-br from-primary/80 to-teal-400 flex items-center justify-center text-white font-semibold text-[9px] shrink-0 shadow-xs">
                          {initiative.creatorName.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <span className="font-medium text-[12px]">{initiative.creatorName}</span>
                            <span className={`inline-flex items-center gap-0.5 px-1 py-0 rounded-md text-[8px] font-medium ${label.color}`}>
                              {label.icon} {label.text}
                            </span>
                          </div>
                          <Link href={`/initiatives/${initiative.id}`}>
                            <h4 className="font-medium text-[12px] hover:text-primary transition-colors cursor-pointer truncate leading-snug">
                              {initiative.title}
                            </h4>
                          </Link>
                          <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">
                            {updateMessages[idx % updateMessages.length]}
                          </p>
                          <div className="flex items-center gap-2.5 mt-1.5">
                            <motion.button
                              whileTap={{ scale: 0.85 }}
                              onClick={() => handleLike(initiative.id, initiative.title)}
                              className={`flex items-center gap-0.5 text-[10px] transition-colors ${
                                likedIds.has(initiative.id)
                                  ? "text-red-500"
                                  : "text-muted-foreground hover:text-red-500"
                              }`}
                            >
                              <Heart className={`w-2.5 h-2.5 ${likedIds.has(initiative.id) ? "fill-red-500" : ""}`} /> Like
                            </motion.button>
                            <button
                              onClick={() => toast({ title: "Coming soon", description: "Comments will be available in the next update." })}
                              className="flex items-center gap-0.5 text-[10px] text-muted-foreground hover:text-primary transition-colors"
                            >
                              <MessageSquare className="w-2.5 h-2.5" /> Comment
                            </button>
                            <button
                              onClick={() => toast({ title: "Link copied!", description: "Share link copied to clipboard." })}
                              className="flex items-center gap-0.5 text-[10px] text-muted-foreground hover:text-primary transition-colors"
                            >
                              <Share2 className="w-2.5 h-2.5" /> Share
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

          <div className="space-y-3 lg:sticky lg:top-16 lg:self-start">
            <Card className="card-elevated overflow-hidden">
              <div className="h-0.5 bg-gradient-to-r from-amber-400 via-orange-400 to-red-400" />
              <CardHeader className="pb-1 pt-3 px-3.5">
                <h3 className="font-medium text-[13px] flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-md bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                    <Trophy className="w-3 h-3 text-white" />
                  </div>
                  Leaderboard
                </h3>
              </CardHeader>
              <CardContent className="pt-0 px-3.5 pb-3">
                <Tabs value={leaderboardTab} onValueChange={setLeaderboardTab}>
                  <TabsList className="w-full rounded-lg mb-2 h-7">
                    <TabsTrigger value="volunteers" className="flex-1 rounded-md text-[10px]">Top Volunteers</TabsTrigger>
                    <TabsTrigger value="donors" className="flex-1 rounded-md text-[10px]">Top Funded</TabsTrigger>
                  </TabsList>
                  <TabsContent value="volunteers" className="space-y-0.5">
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
                  </TabsContent>
                  <TabsContent value="donors" className="space-y-0.5">
                    {topFundedInitiatives.map((init, i) => (
                      <Link key={init.id} href={`/initiatives/${init.id}`}>
                        <motion.div
                          whileHover={{ x: 2 }}
                          className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-muted/50 transition-all cursor-pointer"
                        >
                          <div className={`w-5.5 h-5.5 rounded-md flex items-center justify-center text-[9px] font-semibold ${
                            i === 0 ? "bg-gradient-to-br from-emerald-400 to-emerald-600 text-white" :
                            i === 1 ? "bg-gradient-to-br from-emerald-300 to-emerald-500 text-white" :
                            i === 2 ? "bg-gradient-to-br from-teal-400 to-teal-600 text-white" :
                            "bg-muted text-muted-foreground"
                          }`}>
                            {i === 0 ? <Award className="w-3 h-3" /> : i + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[11px] font-medium truncate">{init.title.split(":")[0]}</p>
                            <p className="text-[9px] text-muted-foreground">₹{init.fundingRaised.toLocaleString('en-IN')} raised</p>
                          </div>
                          {i < 3 && (
                            <span className="text-[9px]">{i === 0 ? "🥇" : i === 1 ? "🥈" : "🥉"}</span>
                          )}
                        </motion.div>
                      </Link>
                    ))}
                  </TabsContent>
                </Tabs>
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
                    { label: "Total Views", value: "2,847", icon: Eye, color: "text-foreground" },
                    { label: "Joins Today", value: "+14", icon: Users, color: "text-primary" },
                    { label: "Likes Today", value: "+38", icon: Heart, color: "text-rose-500" },
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

            <Card className="overflow-hidden border-0 bg-gradient-to-br from-primary/8 via-primary/4 to-teal-500/8 dark:from-primary/12 dark:to-teal-500/12 shadow-sm">
              <CardContent className="p-4 text-center">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-teal-500 flex items-center justify-center text-white mx-auto mb-2.5 shadow-md">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h3 className="font-medium text-[13px] mb-0.5">Ready to lead?</h3>
                <p className="text-[11px] text-muted-foreground mb-2.5">Use AI to structure your next initiative</p>
                <Link href="/initiatives/new">
                  <Button size="sm" className="rounded-lg w-full text-[11px] h-7 bg-gradient-to-r from-primary to-teal-500 border-0 shadow-sm">
                    <Sparkles className="w-3 h-3 mr-1" /> Generate with AI
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="card-elevated">
              <CardContent className="p-3.5">
                <h3 className="font-medium text-[12px] mb-2">Categories</h3>
                <div className="flex flex-wrap gap-1">
                  {["Education", "Environment", "Healthcare", "Community", "Women Empowerment", "Rural Development"].map((cat) => (
                    <Link key={cat} href="/initiatives">
                      <Badge variant="secondary" className="rounded-md cursor-pointer hover:bg-primary/10 hover:text-primary transition-all duration-150 text-[9px] px-2 py-0.5">
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
