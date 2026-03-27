import { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import {
  Sparkles, Users, DollarSign, Target, TrendingUp, Heart,
  MapPin, Calendar, ArrowRight, Trophy, MessageSquare, ThumbsUp
} from "lucide-react";
import { useListInitiatives } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrustScoreBadge } from "@/components/TrustScoreBadge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

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
    setLikedIds((prev) => new Set(prev).add(id));
    toast({ title: "Liked!", description: `You liked "${title.split(":")[0]}"` });
  };

  return (
    <div className="min-h-screen bg-background pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">
                Impact <span className="text-gradient">Dashboard</span>
              </h1>
              <p className="text-muted-foreground mt-1">Track missions, updates, and community progress in real time.</p>
            </div>
            <Link href="/initiatives/new">
              <Button size="lg" className="rounded-full shadow-lg shadow-primary/20">
                <Sparkles className="w-4 h-4 mr-2" /> Start Initiative
              </Button>
            </Link>
          </div>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { label: "Active Missions", value: activeCount, icon: Target, color: "text-primary" },
            { label: "Total Volunteers", value: `${totalVolunteers}+`, icon: Users, color: "text-blue-500" },
            { label: "Funds Raised", value: `₹${(totalFunding / 100000).toFixed(1)}L+`, icon: DollarSign, color: "text-emerald-500" },
            { label: "Completed", value: completedCount, icon: Trophy, color: "text-amber-500" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="rounded-2xl border-border/50 bg-white">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center ${stat.color}`}>
                      <stat.icon className="w-5 h-5" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" /> Active Missions
                </h2>
                <Link href="/initiatives">
                  <Button variant="ghost" size="sm" className="rounded-full text-primary">
                    View All <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </div>

              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-32 bg-muted/20 rounded-2xl animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {initiatives?.filter(i => i.status === "active").slice(0, 6).map((initiative, idx) => {
                    const progress = Math.min((initiative.fundingRaised / initiative.fundingGoal) * 100, 100);
                    const isLiked = likedIds.has(initiative.id);
                    return (
                      <motion.div
                        key={initiative.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                      >
                        <Card className="rounded-2xl border-border/50 hover:shadow-lg hover:-translate-y-0.5 transition-all bg-white">
                          <CardContent className="p-5">
                            <div className="flex items-start justify-between gap-4">
                              <Link href={`/initiatives/${initiative.id}`} className="flex-1 min-w-0 cursor-pointer">
                                <div className="flex items-center gap-2 mb-1">
                                  <Badge variant="secondary" className="text-xs capitalize rounded-full">
                                    {initiative.category}
                                  </Badge>
                                  <Badge variant="outline" className="text-xs capitalize rounded-full">
                                    {initiative.lifecycleStage.replace("_", " ")}
                                  </Badge>
                                </div>
                                <h3 className="font-semibold text-base hover:text-primary transition-colors">{initiative.title}</h3>
                                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <Users className="w-3.5 h-3.5" /> {initiative.volunteerCount}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    ₹{initiative.fundingRaised.toLocaleString('en-IN')}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <MapPin className="w-3.5 h-3.5" /> {initiative.location?.split(",")[0]}
                                  </span>
                                </div>
                                <div className="mt-3">
                                  <Progress value={progress} className="h-2 rounded-full" />
                                  <p className="text-xs text-muted-foreground mt-1">{Math.round(progress)}% funded</p>
                                </div>
                              </Link>
                              <div className="flex flex-col items-center gap-2">
                                <TrustScoreBadge score={initiative.trustScore?.overall ?? 0} />
                                <button
                                  onClick={() => handleLike(initiative.id, initiative.title)}
                                  className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full transition-all ${
                                    isLiked
                                      ? "bg-red-50 text-red-500"
                                      : "hover:bg-muted/50 text-muted-foreground hover:text-red-500"
                                  }`}
                                >
                                  <Heart className={`w-3.5 h-3.5 ${isLiked ? "fill-red-500" : ""}`} />
                                  {isLiked ? "Liked" : "Like"}
                                </button>
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
              <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
                <MessageSquare className="w-5 h-5 text-blue-500" /> Impact Updates
              </h2>
              <div className="space-y-4">
                {initiatives?.slice(0, 4).map((initiative) => (
                  <Card key={`update-${initiative.id}`} className="rounded-2xl border-border/50 bg-white">
                    <CardContent className="p-5">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                          {initiative.creatorName.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">{initiative.creatorName}</span>
                            <span className="text-xs text-muted-foreground">posted an update</span>
                          </div>
                          <Link href={`/initiatives/${initiative.id}`}>
                            <h4 className="font-semibold text-sm hover:text-primary transition-colors cursor-pointer truncate">
                              {initiative.title}
                            </h4>
                          </Link>
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            Exciting progress on this initiative. Community engagement is growing and milestones are being reached ahead of schedule.
                          </p>
                          <div className="flex items-center gap-4 mt-3">
                            <button
                              onClick={() => {
                                handleLike(initiative.id, initiative.title);
                              }}
                              className={`flex items-center gap-1 text-xs transition-colors ${
                                likedIds.has(initiative.id)
                                  ? "text-red-500"
                                  : "text-muted-foreground hover:text-red-500"
                              }`}
                            >
                              <Heart className={`w-3.5 h-3.5 ${likedIds.has(initiative.id) ? "fill-red-500" : ""}`} /> Like
                            </button>
                            <button
                              onClick={() => toast({ title: "Coming soon", description: "Comments will be available in the next update." })}
                              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
                            >
                              <MessageSquare className="w-3.5 h-3.5" /> Comment
                            </button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <Card className="rounded-2xl border-border/50 bg-white">
              <CardHeader className="pb-2">
                <h3 className="font-semibold flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-amber-500" /> Leaderboard
                </h3>
              </CardHeader>
              <CardContent className="pt-0">
                <Tabs value={leaderboardTab} onValueChange={setLeaderboardTab}>
                  <TabsList className="w-full rounded-xl mb-3">
                    <TabsTrigger value="volunteers" className="flex-1 rounded-lg text-xs">Top Volunteers</TabsTrigger>
                    <TabsTrigger value="donors" className="flex-1 rounded-lg text-xs">Top Funded</TabsTrigger>
                  </TabsList>
                  <TabsContent value="volunteers" className="space-y-2">
                    {topVolunteerInitiatives.map((init, i) => (
                      <Link key={init.id} href={`/initiatives/${init.id}`}>
                        <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-muted/50 transition-colors cursor-pointer">
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            i === 0 ? "bg-amber-100 text-amber-600" : i === 1 ? "bg-gray-100 text-gray-600" : i === 2 ? "bg-orange-100 text-orange-600" : "bg-primary/10 text-primary"
                          }`}>
                            {i + 1}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{init.title.split(":")[0]}</p>
                            <p className="text-xs text-muted-foreground">{init.volunteerCount} volunteers</p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </TabsContent>
                  <TabsContent value="donors" className="space-y-2">
                    {topFundedInitiatives.map((init, i) => (
                      <Link key={init.id} href={`/initiatives/${init.id}`}>
                        <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-muted/50 transition-colors cursor-pointer">
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            i === 0 ? "bg-emerald-100 text-emerald-600" : i === 1 ? "bg-emerald-50 text-emerald-500" : "bg-muted text-muted-foreground"
                          }`}>
                            {i + 1}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{init.title.split(":")[0]}</p>
                            <p className="text-xs text-muted-foreground">₹{init.fundingRaised.toLocaleString('en-IN')} raised</p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-border/50 bg-gradient-to-br from-primary/5 to-primary/10">
              <CardContent className="p-5 text-center">
                <Sparkles className="w-8 h-8 text-primary mx-auto mb-3" />
                <h3 className="font-semibold mb-1">Ready to lead?</h3>
                <p className="text-sm text-muted-foreground mb-4">Use AI to structure your next initiative in seconds</p>
                <Link href="/initiatives/new">
                  <Button className="rounded-full w-full">
                    <Sparkles className="w-4 h-4 mr-2" /> Start with AI
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-border/50 bg-white">
              <CardContent className="p-5">
                <h3 className="font-semibold text-sm mb-3">Categories</h3>
                <div className="flex flex-wrap gap-2">
                  {["Education", "Environment", "Healthcare", "Community", "Women Empowerment", "Rural Development"].map((cat) => (
                    <Link key={cat} href="/initiatives">
                      <Badge variant="secondary" className="rounded-full cursor-pointer hover:bg-primary/10 hover:text-primary transition-colors">
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
