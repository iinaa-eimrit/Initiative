import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Globe2, HeartHandshake, Target, Sparkles, Shield, BarChart3, Users, DollarSign, CheckCircle2, Lightbulb, Cpu, Handshake, Trophy, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useListInitiatives } from "@workspace/api-client-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

function AnimatedCounter({ target, suffix = "" }: { target: number | string; suffix?: string }) {
  const [count, setCount] = useState(0);
  const numericTarget = typeof target === "number" ? target : parseFloat(target) || 0;

  useEffect(() => {
    const duration = 1500;
    const steps = 40;
    const increment = numericTarget / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= numericTarget) {
        setCount(numericTarget);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [numericTarget]);

  return <span>{typeof target === "number" ? count : count.toFixed(1)}{suffix}</span>;
}

const LIVE_ACTIVITIES = [
  { icon: "💰", text: "Priya donated ₹5,000 to Vidya Setu", time: "2m ago" },
  { icon: "🙋", text: "Rahul joined Hariyali as a volunteer", time: "5m ago" },
  { icon: "🎯", text: "Sehat Gaadi reached 25% funding", time: "8m ago" },
  { icon: "📝", text: "Shakti posted a new update", time: "12m ago" },
  { icon: "💰", text: "Meera donated ₹10,000 to Jal Jeevan", time: "15m ago" },
  { icon: "🏆", text: "Nourish Network completed all milestones", time: "20m ago" },
  { icon: "🙋", text: "Arun joined Prakriti Pathshala", time: "25m ago" },
  { icon: "📝", text: "Artisan Revival shared impact story", time: "30m ago" },
];

export default function Home() {
  const { data: initiatives } = useListInitiatives({});
  const [tickerIndex, setTickerIndex] = useState(0);
  const [, navigate] = useLocation();

  const activeInitiatives = initiatives?.filter((i) => i.status === "active").slice(0, 3) ?? [];
  const completedInitiatives = initiatives?.filter((i) => i.status === "completed").slice(0, 2) ?? [];
  const totalVolunteers = initiatives?.reduce((sum, i) => sum + i.volunteerCount, 0) ?? 0;
  const totalFunding = initiatives?.reduce((sum, i) => sum + i.fundingRaised, 0) ?? 0;
  const totalMissions = initiatives?.length ?? 0;
  const categories = new Set(initiatives?.map((i) => i.category) ?? []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTickerIndex((prev) => (prev + 1) % LIVE_ACTIVITIES.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen pt-13 flex flex-col">
      <section className="relative flex-grow flex items-center bg-gradient-mesh overflow-hidden py-12 lg:py-16">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-64 h-64 bg-primary/4 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-80 h-80 bg-cyan-400/4 rounded-full blur-3xl" />
        </div>

        <div className="page-container relative z-10 w-full">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-xl"
            >
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 }}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/6 border border-primary/12 text-primary font-medium text-[11px] mb-4"
              >
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary" />
                </span>
                AI-powered social impact
              </motion.div>

              <h1 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-semibold leading-[1.15] mb-4 tracking-tight">
                Turn ideas into{" "}
                <span className="text-gradient-hero">real-world</span>{" "}
                impact.
              </h1>
              <p className="text-sm text-muted-foreground mb-5 leading-relaxed max-w-md">
                Describe your idea and let AI structure your initiative. Build trust through milestone funding, recruit volunteers, and track impact transparently.
              </p>

              <div className="mb-5">
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 via-teal-400/20 to-cyan-400/20 rounded-xl blur-md opacity-40 group-hover:opacity-80 transition-opacity duration-500 ai-glow" />
                  <div className="relative flex items-center bg-card rounded-xl border border-border/60 shadow-sm overflow-hidden">
                    <Sparkles className="w-4 h-4 text-primary ml-3 shrink-0" />
                    <input
                      type="text"
                      placeholder="Describe what you want to change in the world..."
                      className="flex-1 h-10 px-2.5 bg-transparent text-[13px] outline-none placeholder:text-muted-foreground/50"
                      onFocus={() => navigate("/initiatives/new")}
                      readOnly
                    />
                    <Link href="/initiatives/new">
                      <Button size="sm" className="m-1 rounded-lg h-7 px-3 text-[11px] shadow-sm bg-gradient-to-r from-primary to-teal-500 border-0">
                        Generate with AI
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2.5">
                <Link href="/initiatives/new">
                  <Button size="sm" className="h-9 px-5 text-[13px] rounded-lg w-full sm:w-auto shadow-md shadow-primary/15 hover:-translate-y-px transition-all duration-200 bg-gradient-to-r from-primary to-teal-500 border-0">
                    <Sparkles className="mr-1.5 w-3.5 h-3.5" /> Generate Initiative with AI
                  </Button>
                </Link>
                <Link href="/initiatives">
                  <Button size="sm" variant="outline" className="h-9 px-5 text-[13px] rounded-lg w-full sm:w-auto border-border hover:bg-muted/50 hover:-translate-y-px transition-all duration-200">
                    Explore Initiatives <ArrowRight className="ml-1.5 w-3.5 h-3.5" />
                  </Button>
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="relative hidden lg:block"
            >
              <div className="relative rounded-2xl overflow-hidden shadow-lg border border-border/20 aspect-square max-w-sm mx-auto">
                <img
                  src={`${import.meta.env.BASE_URL}images/hero-abstract.png`}
                  alt="Abstract representation of connection and impact"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 via-transparent to-cyan-400/5 mix-blend-overlay" />
              </div>

              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -bottom-3 -left-3 glass-card p-2.5 rounded-xl max-w-[170px]"
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white shadow-sm">
                    <Shield className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-foreground leading-tight">Trust Score: 87</p>
                    <p className="text-[9px] text-muted-foreground">Verified Impact</p>
                  </div>
                </div>
                <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                  <div className="h-full progress-gradient w-[87%]" />
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [0, 5, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute -top-2 -right-2 glass-card p-2 rounded-xl"
              >
                <div className="flex items-center gap-1.5">
                  <div className="w-6 h-6 rounded-md bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
                    <Sparkles className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-[11px] font-semibold">AI Generated Plan</span>
                </div>
              </motion.div>

              <motion.div
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                className="absolute top-1/2 -right-4 glass-card p-2 rounded-xl"
              >
                <div className="flex items-center gap-1.5">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-rose-400 to-rose-600 flex items-center justify-center shadow-sm">
                    <Heart className="w-3 h-3 text-white fill-white" />
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold">+12 likes</p>
                    <p className="text-[8px] text-muted-foreground">just now</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-2 bg-primary/3 border-y border-primary/6 overflow-hidden">
        <div className="page-container">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1 shrink-0">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500" />
              </span>
              <span className="text-[9px] font-semibold text-primary uppercase tracking-wider">Live</span>
            </div>
            <AnimatePresence mode="wait">
              <motion.div
                key={tickerIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="flex items-center gap-1.5 text-[12px]"
              >
                <span>{LIVE_ACTIVITIES[tickerIndex].icon}</span>
                <span className="text-foreground font-medium">{LIVE_ACTIVITIES[tickerIndex].text}</span>
                <span className="text-muted-foreground text-[10px]">{LIVE_ACTIVITIES[tickerIndex].time}</span>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </section>

      <section className="py-10 bg-card">
        <div className="page-container">
          <div className="text-center mb-7">
            <h2 className="text-xl font-semibold mb-1">Our Collective Impact</h2>
            <p className="text-muted-foreground text-[13px]">Real numbers from real initiatives making a difference.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {[
              { value: totalMissions, label: "Missions Launched", icon: <Target className="w-4 h-4" />, gradient: "from-emerald-500 to-teal-600", suffix: "" },
              { value: totalVolunteers, label: "Volunteers Engaged", icon: <Users className="w-4 h-4" />, gradient: "from-blue-500 to-indigo-600", suffix: "+" },
              { value: (totalFunding / 100000).toFixed(1), label: "Funds Raised", icon: <DollarSign className="w-4 h-4" />, gradient: "from-amber-500 to-orange-600", prefix: "₹", suffix: "L+" },
              { value: categories.size, label: "Categories", icon: <Globe2 className="w-4 h-4" />, gradient: "from-purple-500 to-indigo-600", suffix: "" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="text-center"
              >
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center mx-auto text-white shadow-md mb-3`}>
                  {stat.icon}
                </div>
                <p className="text-2xl font-semibold mb-0.5 tracking-tight">
                  {"prefix" in stat ? (stat as any).prefix : ""}
                  <AnimatedCounter target={typeof stat.value === "string" ? parseFloat(stat.value) : stat.value} suffix={stat.suffix} />
                </p>
                <p className="text-[11px] text-muted-foreground font-medium">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 bg-background relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-72 h-72 bg-primary/3 rounded-full blur-3xl" />
        </div>
        <div className="page-container relative">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <Badge variant="secondary" className="rounded-full px-3 py-1 mb-3 text-[11px] font-medium">How It Works</Badge>
            <h2 className="text-xl font-semibold mb-2">From idea to impact in 4 steps</h2>
            <p className="text-muted-foreground text-[13px]">Our AI-powered platform makes creating and running social initiatives effortless.</p>
          </div>

          <div className="grid md:grid-cols-4 gap-6 max-w-3xl mx-auto">
            {[
              { step: "1", icon: <Lightbulb className="w-4 h-4" />, title: "Describe Your Idea", desc: "Tell us what change you want to make.", gradient: "from-purple-500 to-fuchsia-600" },
              { step: "2", icon: <Cpu className="w-4 h-4" />, title: "AI Builds Your Mission", desc: "Get a structured plan with milestones and budget.", gradient: "from-primary to-teal-600" },
              { step: "3", icon: <Handshake className="w-4 h-4" />, title: "Collaborate & Fund", desc: "Recruit volunteers and raise funds transparently.", gradient: "from-blue-500 to-indigo-600" },
              { step: "4", icon: <Trophy className="w-4 h-4" />, title: "Deliver Impact", desc: "Track milestones and prove real-world results.", gradient: "from-amber-500 to-orange-600" },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="text-center relative"
              >
                {i < 3 && (
                  <div className="hidden md:block absolute top-5 left-[60%] w-[80%] h-px bg-border" />
                )}
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center mx-auto mb-2.5 text-white shadow-md`}>
                  {item.icon}
                </div>
                <div className="w-5 h-5 rounded-full bg-foreground text-background text-[10px] font-semibold flex items-center justify-center mx-auto mb-2">
                  {item.step}
                </div>
                <h3 className="font-semibold text-[13px] mb-1">{item.title}</h3>
                <p className="text-[11px] text-muted-foreground leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {activeInitiatives.length > 0 && (
        <section className="py-10 bg-card">
          <div className="page-container">
            <div className="flex items-center justify-between mb-5">
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500" />
                  </span>
                  <span className="text-[9px] font-semibold text-green-600 dark:text-green-400 uppercase tracking-wider">Live Now</span>
                </div>
                <h2 className="text-xl font-semibold">Active Initiatives</h2>
              </div>
              <Link href="/initiatives">
                <Button variant="outline" size="sm" className="rounded-lg text-[11px] h-7">
                  View All <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </Link>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              {activeInitiatives.map((initiative, i) => {
                const progress = Math.min((initiative.fundingRaised / initiative.fundingGoal) * 100, 100);
                return (
                  <motion.div
                    key={initiative.id}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                  >
                    <Link href={`/initiatives/${initiative.id}`}>
                      <Card className="card-elevated overflow-hidden cursor-pointer bg-card h-full group">
                        <div className="h-0.5 w-full progress-gradient" />
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-2.5">
                            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-teal-400 flex items-center justify-center text-white font-semibold text-[10px] shadow-sm">
                              {initiative.creatorName.charAt(0)}
                            </div>
                            <div>
                              <p className="text-[12px] font-medium">{initiative.creatorName}</p>
                              <p className="text-[10px] text-muted-foreground">{initiative.location?.split(",")[0]}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 mb-1.5">
                            <Badge variant="secondary" className="text-[9px] capitalize rounded-md px-1.5 py-0 h-4">{initiative.category}</Badge>
                            <Badge variant="outline" className="text-[9px] rounded-md capitalize px-1.5 py-0 h-4">{initiative.lifecycleStage.replace("_", " ")}</Badge>
                          </div>
                          <h3 className="font-semibold text-[13px] mb-1.5 line-clamp-2 group-hover:text-primary transition-colors leading-snug">{initiative.title}</h3>
                          <p className="text-[11px] text-muted-foreground mb-2.5 line-clamp-2 leading-relaxed">{initiative.description}</p>
                          <div className="space-y-1">
                            <div className="flex justify-between text-[11px]">
                              <span className="text-primary font-medium">₹{initiative.fundingRaised.toLocaleString('en-IN')}</span>
                              <span className="text-muted-foreground">of ₹{initiative.fundingGoal.toLocaleString('en-IN')}</span>
                            </div>
                            <Progress value={progress} className="h-1 rounded-full" indicatorClassName="progress-gradient" />
                          </div>
                          <div className="flex items-center justify-between mt-2.5 pt-2.5 border-t border-border/40">
                            <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                              <Users className="w-3 h-3" /> {initiative.volunteerCount} volunteers
                            </span>
                            <span className="flex items-center gap-1 text-[11px] font-medium text-primary">
                              <Shield className="w-3 h-3" /> {initiative.trustScore.overall}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {completedInitiatives.length > 0 && (
        <section className="py-10 bg-background">
          <div className="page-container">
            <div className="text-center mb-6">
              <Badge className="rounded-full px-3 py-1 mb-3 bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800 text-[11px] font-medium">Success Stories</Badge>
              <h2 className="text-xl font-semibold mb-1">Completed Missions</h2>
              <p className="text-muted-foreground text-[13px]">Initiatives that delivered real-world impact.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-4 max-w-3xl mx-auto">
              {completedInitiatives.map((initiative, i) => (
                <motion.div
                  key={initiative.id}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                >
                  <Link href={`/initiatives/${initiative.id}`}>
                    <Card className="card-elevated overflow-hidden border-emerald-200/40 dark:border-emerald-800/20 cursor-pointer bg-card h-full">
                      <div className="h-0.5 w-full bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400" />
                      <CardContent className="p-4">
                        <div className="flex items-center gap-1 mb-1.5">
                          <Badge className="text-[9px] rounded-md bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800 h-4">
                            <CheckCircle2 className="w-2.5 h-2.5 mr-0.5" /> Completed
                          </Badge>
                          <Badge variant="secondary" className="text-[9px] capitalize rounded-md h-4">{initiative.category}</Badge>
                        </div>
                        <h3 className="font-semibold text-[13px] mb-1 leading-snug">{initiative.title}</h3>
                        <p className="text-[11px] text-muted-foreground mb-2.5 line-clamp-2 leading-relaxed">{initiative.description}</p>
                        <div className="flex items-center justify-between pt-2.5 border-t border-border/40">
                          <div className="flex items-center gap-2.5">
                            <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                              <Users className="w-3 h-3" /> {initiative.volunteerCount}
                            </span>
                            <span className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                              ₹{initiative.fundingRaised.toLocaleString('en-IN')}
                            </span>
                          </div>
                          <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                            <Trophy className="w-3 h-3" /> 100% funded
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="py-10 bg-card relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-primary/3 rounded-full blur-3xl" />
        </div>
        <div className="page-container relative">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <h2 className="text-xl font-semibold mb-2">Intelligence meets impact</h2>
            <p className="text-muted-foreground text-[13px]">AI-powered tools that make creating social initiatives effortless.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {[
              { icon: <Sparkles className="w-4 h-4" />, title: "AI Initiative Builder", desc: "Describe your idea in plain text. Our AI generates a structured plan with milestones, budget, and volunteer roles.", gradient: "from-purple-500 to-fuchsia-600" },
              { icon: <Shield className="w-4 h-4" />, title: "Impact Trust Score", desc: "GitHub-style trust scores based on updates, milestones, volunteers, and funding. Build credibility transparently.", gradient: "from-primary to-teal-600" },
              { icon: <BarChart3 className="w-4 h-4" />, title: "Milestone Funding", desc: "Funds unlock per milestone — not all at once. Donors see exactly where their money goes.", gradient: "from-blue-500 to-indigo-600" },
              { icon: <Users className="w-4 h-4" />, title: "Volunteer Matching", desc: "AI suggests volunteers based on skills, location, and initiative needs. Smart community building.", gradient: "from-amber-500 to-orange-600" },
              { icon: <HeartHandshake className="w-4 h-4" />, title: "Impact Stories", desc: "Completed missions generate rich impact blogs with challenges overcome and outcomes achieved.", gradient: "from-rose-500 to-pink-600" },
              { icon: <Target className="w-4 h-4" />, title: "Lifecycle Tracking", desc: "Visual stage tracker from Idea to Impact Delivered. See exactly where each initiative stands.", gradient: "from-cyan-500 to-blue-600" },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
              >
                <Card className="card-elevated h-full group">
                  <CardContent className="p-4">
                    <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center text-white shadow-md mb-3 group-hover:scale-105 transition-transform duration-200`}>
                      {feature.icon}
                    </div>
                    <h3 className="font-semibold text-[13px] mb-1">{feature.title}</h3>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">{feature.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 bg-gradient-mesh relative overflow-hidden">
        <div className="page-container text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-xl md:text-2xl font-semibold mb-3">
              Ready to make a <span className="text-gradient-hero">difference</span>?
            </h2>
            <p className="text-muted-foreground text-[13px] mb-6 max-w-md mx-auto">
              Join thousands creating real social impact. Your next initiative is just one description away.
            </p>
            <div className="flex flex-col sm:flex-row gap-2.5 justify-center">
              <Link href="/initiatives/new">
                <Button size="sm" className="h-10 px-6 text-[13px] rounded-lg shadow-md shadow-primary/15 hover:-translate-y-px transition-all duration-200 bg-gradient-to-r from-primary to-teal-500 border-0">
                  <Sparkles className="mr-1.5 w-4 h-4" /> Start Your Initiative
                </Button>
              </Link>
              <Link href="/initiatives">
                <Button size="sm" variant="outline" className="h-10 px-6 text-[13px] rounded-lg border-border hover:-translate-y-px transition-all duration-200">
                  Browse Initiatives <ArrowRight className="ml-1.5 w-4 h-4" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
