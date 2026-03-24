import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight, Globe2, HeartHandshake, Target, Sparkles, Shield, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen pt-20 flex flex-col">
      <section className="relative flex-grow flex items-center bg-gradient-mesh overflow-hidden py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-2xl"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 border border-primary/20 backdrop-blur-sm text-primary font-medium text-sm mb-6 shadow-sm">
                <Sparkles className="w-3.5 h-3.5" />
                AI-powered social impact
              </div>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight mb-6">
                Turn your <span className="text-gradient">vision</span> into real-world impact.
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground mb-8 leading-relaxed">
                Describe your idea and let AI structure your initiative. Build trust through milestone funding, recruit volunteers, and track impact transparently.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/initiatives/new">
                  <Button size="lg" className="h-14 px-8 text-base rounded-full w-full sm:w-auto shadow-xl shadow-primary/25 hover:-translate-y-1 transition-transform">
                    Start with AI <Sparkles className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link href="/initiatives">
                  <Button size="lg" variant="outline" className="h-14 px-8 text-base rounded-full w-full sm:w-auto border-2 hover:bg-muted/50">
                    Explore Initiatives <ArrowRight className="ml-2 w-5 h-5" />
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
              <div className="relative rounded-[2rem] overflow-hidden shadow-2xl shadow-secondary/20 border border-white/50 aspect-square">
                <img 
                  src={`${import.meta.env.BASE_URL}images/hero-abstract.png`}
                  alt="Abstract representation of connection and impact"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent mix-blend-overlay"></div>
              </div>
              
              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -bottom-6 -left-6 glass-card p-5 rounded-2xl max-w-[240px]"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">Trust Score: 87</p>
                    <p className="text-xs text-muted-foreground">Verified Impact</p>
                  </div>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 w-[87%]"></div>
                </div>
              </motion.div>

              <motion.div 
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute -top-4 -right-4 glass-card p-4 rounded-2xl"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <span className="text-sm font-bold">AI Generated Plan</span>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Intelligence meets impact</h2>
            <p className="text-muted-foreground text-lg">AI-powered tools that make creating and running social initiatives effortless.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Sparkles className="w-6 h-6" />,
                title: "AI Initiative Builder",
                desc: "Describe your idea in plain text. Our AI generates a structured plan with milestones, budget, and volunteer roles instantly.",
                color: "text-purple-600",
                bg: "bg-purple-100"
              },
              {
                icon: <Target className="w-6 h-6" />,
                title: "Milestone-Based Funding",
                desc: "Build trust through transparency. Funds are locked per milestone and unlocked as you deliver measurable progress.",
                color: "text-primary",
                bg: "bg-primary/15"
              },
              {
                icon: <Shield className="w-6 h-6" />,
                title: "Impact Trust Score",
                desc: "Every initiative earns a dynamic trust score based on updates posted, milestones completed, and community engagement.",
                color: "text-blue-600",
                bg: "bg-blue-100"
              },
              {
                icon: <Globe2 className="w-6 h-6" />,
                title: "Lifecycle Tracking",
                desc: "Visual stage progression from Idea to Planning to Active to Impact Delivered. See exactly where each initiative stands.",
                color: "text-teal-600",
                bg: "bg-teal-100"
              },
              {
                icon: <HeartHandshake className="w-6 h-6" />,
                title: "Smart Volunteer Matching",
                desc: "AI suggests the best-fit volunteers based on skills and initiative needs, with personalized match explanations.",
                color: "text-accent",
                bg: "bg-accent/15"
              },
              {
                icon: <BarChart3 className="w-6 h-6" />,
                title: "Impact Proof Feed",
                desc: "Post updates with evidence of progress. Build a timeline that tells the story of your initiative's journey.",
                color: "text-orange-600",
                bg: "bg-orange-100"
              }
            ].map((feature, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="p-8 rounded-3xl bg-background border border-border/50 hover:shadow-xl transition-all duration-300 group"
              >
                <div className={`w-14 h-14 rounded-2xl ${feature.bg} ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-primary/5 via-white to-teal-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to make a difference?</h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Whether you have an idea or want to support one, Initiative connects you to real-world impact in minutes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/initiatives/new">
                <Button size="lg" className="h-14 px-10 text-base rounded-full shadow-xl shadow-primary/25">
                  Create an Initiative
                </Button>
              </Link>
              <Link href="/initiatives">
                <Button size="lg" variant="outline" className="h-14 px-10 text-base rounded-full border-2">
                  Browse All Initiatives
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
