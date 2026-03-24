import { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Search, MapPin, Users, Heart, Shield, Sparkles } from "lucide-react";
import { useListInitiatives } from "@workspace/api-client-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrustScoreBadge } from "@/components/TrustScoreBadge";
import { LifecycleBadge } from "@/components/LifecycleBadge";

const CATEGORIES = ["All", "environment", "education", "healthcare", "community"];

const categoryLabels: Record<string, string> = {
  All: "All",
  environment: "Environment",
  education: "Education",
  healthcare: "Healthcare",
  community: "Community",
};

export default function Initiatives() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const { data: initiatives, isLoading, error } = useListInitiatives({
    search: search || undefined,
    category: category !== "All" ? category : undefined,
  });

  return (
    <div className="min-h-screen bg-background pt-28 pb-20 relative">
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-mesh opacity-50 z-0 pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Discover Initiatives</h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Support real people solving real problems. Trust scores show you who's delivering.
            </p>
          </div>
          <Link href="/initiatives/new">
            <Button size="lg" className="rounded-full shadow-lg shadow-primary/20">
              <Sparkles className="w-4 h-4 mr-2" /> Start with AI
            </Button>
          </Link>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-sm border border-border/60 mb-10 flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input 
              placeholder="Search initiatives..." 
              className="pl-12 h-12 bg-muted/30 border-transparent focus:bg-white text-base rounded-xl"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
            {CATEGORIES.map(c => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`px-5 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                  category === c 
                    ? "bg-secondary text-secondary-foreground shadow-md" 
                    : "bg-muted/50 text-muted-foreground hover:bg-muted"
                }`}
              >
                {categoryLabels[c] || c}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <Card key={i} className="animate-pulse h-[420px] bg-muted/20 border-transparent rounded-3xl" />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-20 bg-destructive/5 rounded-3xl border border-destructive/20">
            <p className="text-destructive font-medium">Failed to load initiatives. Please try again later.</p>
          </div>
        ) : !initiatives?.length ? (
          <div className="text-center py-24 bg-white rounded-3xl border border-border/50">
            <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-bold mb-2">No initiatives found</h3>
            <p className="text-muted-foreground mb-6">Be the first to start something in this category!</p>
            <Button onClick={() => { setSearch(""); setCategory("All"); }} variant="outline" className="rounded-full">
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {initiatives.map((initiative, i) => (
              <motion.div
                key={initiative.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link href={`/initiatives/${initiative.id}`} className="block h-full">
                  <Card className="h-full flex flex-col rounded-3xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-border/50 group bg-white">
                    <div className="h-3 w-full" style={{
                      background: initiative.lifecycleStage === 'impact_delivered' 
                        ? 'linear-gradient(90deg, #10b981, #34d399)' 
                        : initiative.lifecycleStage === 'active'
                        ? 'linear-gradient(90deg, #3b82f6, #60a5fa)'
                        : initiative.lifecycleStage === 'planning'
                        ? 'linear-gradient(90deg, #f59e0b, #fbbf24)'
                        : 'linear-gradient(90deg, #8b5cf6, #a78bfa)'
                    }}></div>
                    
                    <CardHeader className="pt-5 pb-2">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex gap-2 flex-wrap">
                          <Badge className="bg-muted text-foreground hover:bg-muted font-medium border-none text-xs">
                            {initiative.category}
                          </Badge>
                          <LifecycleBadge stage={initiative.lifecycleStage} />
                        </div>
                        <TrustScoreBadge score={initiative.trustScore?.overall ?? 0} size="sm" />
                      </div>
                      <h3 className="text-lg font-bold line-clamp-2 group-hover:text-primary transition-colors leading-tight">
                        {initiative.title}
                      </h3>
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-2">
                        <MapPin className="w-3.5 h-3.5" />
                        <span className="truncate text-xs">{initiative.location}</span>
                      </div>
                    </CardHeader>

                    <CardContent className="flex-grow">
                      <p className="text-muted-foreground text-sm line-clamp-2 mb-5">
                        {initiative.description}
                      </p>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm font-medium">
                          <span className="text-primary">${initiative.fundingRaised?.toLocaleString()} raised</span>
                          <span className="text-muted-foreground">of ${initiative.fundingGoal?.toLocaleString()}</span>
                        </div>
                        <Progress 
                          value={Math.min((initiative.fundingRaised / initiative.fundingGoal) * 100, 100)} 
                          className="h-2 bg-primary/10"
                          indicatorClassName="bg-primary"
                        />
                      </div>
                    </CardContent>

                    <CardFooter className="border-t border-border/50 pt-4 pb-4 flex justify-between items-center bg-muted/10">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="w-7 h-7 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center font-bold text-[10px] uppercase">
                          {initiative.creatorName.charAt(0)}
                        </div>
                        <span className="truncate max-w-[100px] text-xs">{initiative.creatorName}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs font-medium text-foreground bg-white px-2.5 py-1 rounded-full border border-border/50 shadow-sm">
                        <Users className="w-3.5 h-3.5 text-accent" />
                        {initiative.volunteerCount}
                      </div>
                    </CardFooter>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
