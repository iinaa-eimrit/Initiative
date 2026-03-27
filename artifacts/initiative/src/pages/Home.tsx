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
    <div className="min-h-screen pt-14 flex flex-col">
      <section className="relative flex-grow flex items-center bg-gradient-mesh overflow-hidden py-12 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-8 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-2xl"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-card/60 border border-primary/20 backdrop-blur-sm text-primary font-medium text-xs mb-4 shadow-sm">
                <Sparkles className="w-3 h-3" />
                AI-powered social impact
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-4">
                Turn ideas into <span className="text-gradient">real-world</span> impact.
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground mb-6 leading-relaxed">
                Describe your idea and let AI structure your initiative. Build trust through milestone funding, recruit volunteers, and track impact transparently.
              </p>

              <div className="mb-5">
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 via-teal-400/30 to-emerald-400/30 rounded-2xl blur-lg opacity-60 group-hover:opacity-100 transition-opacity duration-500 ai-glow" />
                  <div className="relative flex items-center bg-card rounded-2xl border border-border/50 shadow-lg overflow-hidden">
                    <Sparkles className="w-5 h-5 text-primary ml-4 shrink-0" />
                    <input
                      type="text"
                      placeholder="Describe what you want to change in the world..."
                      className="flex-1 h-12 px-3 bg-transparent text-sm outline-none placeholder:text-muted-foreground/60"
                      onFocus={() => {
                        navigate("/initiatives/new");
                      }}
                      readOnly
                    />
                    <Link href="/initiatives/new">
                      <Button size="sm" className="m-1.5 rounded-xl h-9 px-4 text-xs shadow-md shadow-primary/20">
                        Generate with AI
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/initiatives/new">
                  <Button size="lg" className="h-11 px-6 text-sm rounded-full w-full sm:w-auto shadow-xl shadow-primary/25 hover:-translate-y-1 transition-transform">
                    <Sparkles className="mr-2 w-4 h-4" /> Generate Initiative with AI
                  </Button>
                </Link>
                <Link href="/initiatives">
                  <Button size="lg" variant="outline" className="h-11 px-6 text-sm rounded-full w-full sm:w-auto border-2 hover:bg-muted/50">
                    Explore Initiatives <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative hidden lg:block"
            >
              <div className="relative rounded-[2rem] overflow-hidden shadow-2xl shadow-secondary/20 border border-border/50 aspect-square max-w-md mx-auto">
                <img
                  src={`${import.meta.env.BASE_URL}images/hero-abstract.png`}
                  alt="Abstract representation of connection and impact"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent mix-blend-overlay" />
              </div>

              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -bottom-4 -left-4 glass-card p-4 rounded-xl max-w-[200px]"
              >
                <div className="flex items-center gap-2.5 mb-1.5">
                  <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-foreground">Trust Score: 87</p>
                    <p className="text-[10px] text-muted-foreground">Verified Impact</p>
                  </div>
                </div>
                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 w-[87%]" />
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [0, 6, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute -top-3 -right-3 glass-card p-3 rounded-xl"
              >
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span className="text-xs font-bold">AI Generated Plan</span>
                </div>
              </motion.div>

              <motion.div
                animate={{ x: [0, 6, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                className="absolute top-1/2 -right-6 glass-card p-2.5 rounded-xl"
              >
                <div className="flex items-center gap-1.5">
                  <div className="w-7 h-7 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                    <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold">+12 likes</p>
                    <p className="text-[9px] text-muted-foreground">just now</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-3 bg-primary/5 border-y border-primary/10 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 shrink-0">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] font-semibold text-primary uppercase tracking-wide">Live</span>
            </div>
            <AnimatePresence mode="wait">
              <motion.div
                key={tickerIndex}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3 }}
                className="flex items-center gap-2 text-xs"
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold mb-2">Our Collective Impact</h2>
            <p className="text-muted-foreground text-sm">Real numbers from real initiatives making a difference.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { value: totalMissions, label: "Missions Launched", icon: <Target className="w-5 h-5" />, color: "text-primary", suffix: "" },
              { value: totalVolunteers, label: "Volunteers Engaged", icon: <Users className="w-5 h-5" />, color: "text-blue-500", suffix: "+" },
              { value: (totalFunding / 100000).toFixed(1), label: "Funds Raised", icon: <DollarSign className="w-5 h-5" />, color: "text-emerald-500", prefix: "₹", suffix: "L+" },
              { value: categories.size, label: "Categories", icon: <Globe2 className="w-5 h-5" />, color: "text-amber-500", suffix: "" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center p-4 rounded-xl hover:bg-muted/30 transition-colors"
              >
                <div className={`w-10 h-10 rounded-xl bg-muted/50 ${stat.color} flex items-center justify-center mx-auto mb-3`}>
                  {stat.icon}
                </div>
                <p className="text-2xl md:text-3xl font-bold mb-0.5">
                  {"prefix" in stat ? (stat as any).prefix : ""}
                  <AnimatedCounter target={typeof stat.value === "string" ? parseFloat(stat.value) : stat.value} suffix={stat.suffix} />
                </p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <Badge variant="secondary" className="rounded-full px-3 py-1 mb-3 text-xs">How It Works</Badge>
            <h2 className="text-2xl md:text-3xl font-bold mb-2">From idea to impact in 4 steps</h2>
            <p className="text-muted-foreground text-sm">Our AI-powered platform makes creating and running social initiatives effortless.</p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              { step: "1", icon: <Lightbulb className="w-5 h-5" />, title: "Describe Your Idea", desc: "Tell us what change you want to make.", color: "bg-purple-100 text-purple-600 dark:bg-purple-900/30" },
              { step: "2", icon: <Cpu className="w-5 h-5" />, title: "AI Builds Your Mission", desc: "Get a structured plan with milestones and budget.", color: "bg-primary/15 text-primary" },
              { step: "3", icon: <Handshake className="w-5 h-5" />, title: "Collaborate & Fund", desc: "Recruit volunteers and raise funds transparently.", color: "bg-blue-100 text-blue-600 dark:bg-blue-900/30" },
              { step: "4", icon: <Trophy className="w-5 h-5" />, title: "Deliver Impact", desc: "Track milestones and prove real-world results.", color: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30" },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center relative"
              >
                {i < 3 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-border to-transparent" />
                )}
                <div className={`w-12 h-12 rounded-xl ${item.color} flex items-center justify-center mx-auto mb-3`}>
                  {item.icon}
                </div>
                <div className="w-6 h-6 rounded-full bg-foreground text-background text-xs font-bold flex items-center justify-center mx-auto mb-2">
                  {item.step}
                </div>
                <h3 className="font-bold text-sm mb-1">{item.title}</h3>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {activeInitiatives.length > 0 && (
        <section className="py-12 bg-card">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-[10px] font-semibold text-green-600 uppercase tracking-wide">Live Now</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold">Active Initiatives</h2>
              </div>
              <Link href="/initiatives">
                <Button variant="outline" size="sm" className="rounded-full text-xs">
                  View All <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </Link>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              {activeInitiatives.map((initiative, i) => {
                const progress = Math.min((initiative.fundingRaised / initiative.fundingGoal) * 100, 100);
                return (
                  <motion.div
                    key={initiative.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="card-hover"
                  >
                    <Link href={`/initiatives/${initiative.id}`}>
                      <Card className="rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 border-border/50 cursor-pointer bg-card h-full group">
                        <div className="h-1.5 w-full bg-gradient-to-r from-primary to-teal-400" />
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2.5 mb-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-teal-400 flex items-center justify-center text-white font-bold text-xs">
                              {initiative.creatorName.charAt(0)}
                            </div>
                            <div>
                              <p className="text-xs font-semibold">{initiative.creatorName}</p>
                              <p className="text-[10px] text-muted-foreground">{initiative.location?.split(",")[0]}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 mb-2">
                            <Badge variant="secondary" className="text-[10px] capitalize rounded-full px-2 py-0">{initiative.category}</Badge>
                            <Badge variant="outline" className="text-[10px] rounded-full capitalize px-2 py-0">{initiative.lifecycleStage.replace("_", " ")}</Badge>
                          </div>
                          <h3 className="font-bold text-sm mb-1.5 line-clamp-2 group-hover:text-primary transition-colors">{initiative.title}</h3>
                          <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{initiative.description}</p>
                          <div className="space-y-1.5">
                            <div className="flex justify-between text-xs">
                              <span className="text-primary font-semibold">₹{initiative.fundingRaised.toLocaleString('en-IN')}</span>
                              <span className="text-muted-foreground">of ₹{initiative.fundingGoal.toLocaleString('en-IN')}</span>
                            </div>
                            <Progress value={progress} className="h-1.5 rounded-full" />
                          </div>
                          <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Users className="w-3.5 h-3.5" /> {initiative.volunteerCount} volunteers
                            </span>
                            <span className="flex items-center gap-1 text-xs font-medium text-primary">
                              <Shield className="w-3.5 h-3.5" /> {initiative.trustScore.overall}
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
        <section className="py-12 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-6">
              <Badge className="rounded-full px-3 py-1 mb-3 bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800 text-xs">Success Stories</Badge>
              <h2 className="text-2xl md:text-3xl font-bold mb-2">Completed Missions</h2>
              <p className="text-muted-foreground text-sm">Initiatives that delivered real-world impact.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-4 max-w-4xl mx-auto">
              {completedInitiatives.map((initiative, i) => (
                <motion.div
                  key={initiative.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="card-hover"
                >
                  <Link href={`/initiatives/${initiative.id}`}>
                    <Card className="rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 border-emerald-200/50 dark:border-emerald-800/30 cursor-pointer bg-card h-full">
                      <div className="h-1.5 w-full bg-gradient-to-r from-emerald-400 to-teal-400" />
                      <CardContent className="p-4">
                        <div className="flex items-center gap-1.5 mb-2">
                          <Badge className="text-[10px] rounded-full bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800">
                            <CheckCircle2 className="w-3 h-3 mr-1" /> Completed
                          </Badge>
                          <Badge variant="secondary" className="text-[10px] capitalize rounded-full">{initiative.category}</Badge>
                        </div>
                        <h3 className="font-bold text-sm mb-1.5">{initiative.title}</h3>
                        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{initiative.description}</p>
                        <div className="flex items-center justify-between pt-3 border-t border-border/50">
                          <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Users className="w-3.5 h-3.5" /> {initiative.volunteerCount}
                            </span>
                            <span className="flex items-center gap-1 text-xs text-emerald-600 font-semibold">
                              ₹{initiative.fundingRaised.toLocaleString('en-IN')}
                            </span>
                          </div>
                          <span className="flex items-center gap-1 text-xs font-medium text-emerald-600">
                            <Trophy className="w-3.5 h-3.5" /> 100% funded
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

      <section className="py-12 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <h2 className="text-2xl md:text-3xl font-bold mb-2">Intelligence meets impact</h2>
            <p className="text-muted-foreground text-sm">AI-powered tools that make creating social initiatives effortless.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {[
              { icon: <Sparkles className="w-5 h-5" />, title: "AI Initiative Builder", desc: "Describe your idea in plain text. Our AI generates a structured plan with milestones, budget, and volunteer roles.", color: "text-purple-600", bg: "bg-purple-100 dark:bg-purple-900/30" },
              { icon: <Target className="w-5 h-5" />, title: "Milestone-Based Funding", desc: "Build trust through transparency. Funds are locked per milestone and unlocked as you deliver progress.", color: "text-primary", bg: "bg-primary/15" },
              { icon: <Shield className="w-5 h-5" />, title: "Impact Trust Score", desc: "Every initiative earns a dynamic trust score based on updates, milestones, and community engagement.", color: "text-blue-600", bg: "bg-blue-100 dark:bg-blue-900/30" },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="rounded-2xl border-border/50 hover:shadow-lg transition-all duration-300 bg-card h-full card-hover">
                  <CardContent className="p-5">
                    <div className={`w-10 h-10 rounded-xl ${feature.bg} ${feature.color} flex items-center justify-center mb-3`}>
                      {feature.icon}
                    </div>
                    <h3 className="font-bold text-sm mb-2">{feature.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{feature.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 bg-gradient-to-r from-primary/10 via-primary/5 to-teal-400/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">Ready to create real change?</h2>
          <p className="text-muted-foreground text-sm mb-6">Join thousands of changemakers using AI to build transparent, impactful initiatives.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/initiatives/new">
              <Button size="lg" className="h-11 px-6 text-sm rounded-full shadow-xl shadow-primary/25 hover:-translate-y-1 transition-transform">
                <Sparkles className="mr-2 w-4 h-4" /> Start Your Initiative
              </Button>
            </Link>
            <Link href="/initiatives">
              <Button size="lg" variant="outline" className="h-11 px-6 text-sm rounded-full border-2">
                Explore Initiatives <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
