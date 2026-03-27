import { useState } from "react";
import { useParams, Link } from "wouter";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Calendar, Users, CheckCircle2, ArrowLeft, Trophy, Heart,
  Lock, Unlock, Sparkles, Clock, FileText, Send, Share2, BookOpen, TrendingUp
} from "lucide-react";
import {
  useGetInitiative,
  useDonateToInitiative,
  useVolunteerForInitiative,
  useGetSuggestedVolunteers,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { TrustBreakdown } from "@/components/TrustScoreBadge";
import { LifecycleTracker } from "@/components/LifecycleBadge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const donateSchema = z.object({
  donorName: z.string().min(2, "Name is required"),
  amount: z.coerce.number().min(1, "Minimum ₹1"),
  message: z.string().optional(),
});

const volunteerSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Valid email is required"),
  message: z.string().optional(),
  skills: z.string().optional(),
});

export default function InitiativeDetail() {
  const { id } = useParams<{ id: string }>();
  const initiativeId = parseInt(id || "0", 10);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [isDonateOpen, setIsDonateOpen] = useState(false);
  const [isVolunteerOpen, setIsVolunteerOpen] = useState(false);
  const [invitedVolunteers, setInvitedVolunteers] = useState<Set<number>>(new Set());
  const [activeTab, setActiveTab] = useState("overview");
  const [isLiked, setIsLiked] = useState(false);

  const { data: initiative, isLoading, error } = useGetInitiative(initiativeId);
  const { data: suggestedVolunteers } = useGetSuggestedVolunteers(initiativeId);

  const donateMutation = useDonateToInitiative({
    mutation: {
      onSuccess: () => {
        toast({ title: "Thank you!", description: "Your donation was successful." });
        queryClient.invalidateQueries({ queryKey: [`/api/initiatives/${initiativeId}`] });
        setIsDonateOpen(false);
        donateForm.reset();
      }
    }
  });

  const volunteerMutation = useVolunteerForInitiative({
    mutation: {
      onSuccess: () => {
        toast({ title: "Awesome!", description: "You are now signed up to volunteer." });
        queryClient.invalidateQueries({ queryKey: [`/api/initiatives/${initiativeId}`] });
        setIsVolunteerOpen(false);
        volunteerForm.reset();
      }
    }
  });

  const donateForm = useForm<z.infer<typeof donateSchema>>({
    resolver: zodResolver(donateSchema),
    defaultValues: { donorName: "", amount: 50, message: "" }
  });

  const volunteerForm = useForm<z.infer<typeof volunteerSchema>>({
    resolver: zodResolver(volunteerSchema),
    defaultValues: { name: "", email: "", message: "", skills: "" }
  });

  if (isLoading) return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <div className="w-full bg-gradient-mesh py-6">
        <div className="page-container space-y-3">
          <div className="h-6 w-48 bg-muted/40 rounded-lg animate-pulse" />
          <div className="h-10 w-full max-w-md bg-muted/30 rounded-lg animate-pulse" />
          <div className="h-5 w-36 bg-muted/20 rounded-md animate-pulse" />
        </div>
      </div>
      <div className="page-container mt-8 grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-5">
          <div className="h-40 bg-muted/20 rounded-xl animate-pulse" />
          <div className="h-28 bg-muted/20 rounded-xl animate-pulse" />
        </div>
        <div className="space-y-5">
          <div className="h-36 bg-muted/20 rounded-xl animate-pulse" />
          <div className="h-20 bg-muted/20 rounded-xl animate-pulse" />
        </div>
      </div>
    </div>
  );
  if (error || !initiative) return (
    <div className="min-h-screen pt-28 flex flex-col items-center justify-center text-center px-4">
      <div className="w-12 h-12 rounded-xl bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4 text-lg font-semibold">!</div>
      <h2 className="text-lg font-semibold mb-1.5">Initiative not found</h2>
      <p className="text-muted-foreground text-[13px] mb-4">This initiative may have been removed or doesn't exist.</p>
      <Link href="/initiatives">
        <Button variant="outline" size="sm" className="rounded-lg text-[12px]"><ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Back to Initiatives</Button>
      </Link>
    </div>
  );

  const progressPercent = Math.min((initiative.fundingRaised / initiative.fundingGoal) * 100, 100);
  const plan = initiative.structuredPlan as any;
  const isCompleted = initiative.status === "completed";

  const handleLikeClick = () => {
    const wasLiked = isLiked;
    setIsLiked(!isLiked);
    if (!wasLiked) {
      toast({ title: "Liked!", description: `You liked "${initiative.title.split(":")[0]}"` });
    }
  };

  return (
    <div className="min-h-screen bg-background pb-12">
      <div className="w-full bg-gradient-mesh py-5 pt-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(16,185,129,0.06),transparent_60%)]" />
        <div className="page-container relative z-10">
          <Link href="/initiatives" className="inline-flex items-center text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors w-fit bg-card/50 backdrop-blur-md px-2 py-0.5 rounded-md mb-3">
            <ArrowLeft className="w-3 h-3 mr-1" /> Back to feed
          </Link>

          <div className="flex items-center gap-2 mb-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-teal-400 flex items-center justify-center text-white font-semibold text-[12px] ring-2 ring-card shadow-sm">
              {initiative.creatorName.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-medium text-[13px]">{initiative.creatorName}</span>
                <Badge variant="outline" className="text-[9px] bg-card/80 h-4">{initiative.location?.split(",")[0]}</Badge>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                <Calendar className="w-2.5 h-2.5" />
                <span>Started {format(new Date(initiative.createdAt), 'MMM d, yyyy')}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-1 mb-1.5 flex-wrap">
            <Badge className="bg-gradient-to-r from-primary to-teal-500 hover:from-primary/90 text-primary-foreground border-none text-[10px] px-2 py-0 capitalize h-4">{initiative.category}</Badge>
            <Badge variant="outline" className={`bg-card/80 backdrop-blur text-foreground border-border text-[10px] px-2 py-0 capitalize h-4 ${isCompleted ? 'border-emerald-300 text-emerald-700 dark:border-emerald-700 dark:text-emerald-400' : ''}`}>
              {isCompleted && <CheckCircle2 className="w-2.5 h-2.5 mr-0.5" />}
              {initiative.status}
            </Badge>
          </div>
          <h1 className="text-xl md:text-2xl font-semibold text-foreground max-w-3xl leading-snug mb-3">
            {initiative.title}
          </h1>

          <Card className="card-elevated overflow-hidden">
            <CardContent className="p-3">
              <LifecycleTracker currentStage={initiative.lifecycleStage} />
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="sticky top-13 z-40 bg-card/80 backdrop-blur-xl border-b border-border/50 shadow-xs">
        <div className="page-container">
          <div className="flex items-center justify-between h-10">
            <div className="flex items-center gap-1.5">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleLikeClick}
                className={`flex items-center gap-1 px-2 py-1 rounded-md text-[12px] font-medium transition-all ${
                  isLiked ? "bg-red-50 text-red-500 dark:bg-red-900/20" : "hover:bg-muted/50 text-muted-foreground"
                }`}
              >
                <Heart className={`w-3.5 h-3.5 ${isLiked ? "fill-red-500 text-red-500" : ""}`} />
                {isLiked ? "Liked" : "Like"}
              </motion.button>
              <button
                onClick={() => toast({ title: "Link copied!", description: "Share link copied to clipboard." })}
                className="flex items-center gap-1 px-2 py-1 rounded-md text-[12px] font-medium text-muted-foreground hover:bg-muted/50 transition-all"
              >
                <Share2 className="w-3.5 h-3.5" /> Share
              </button>
              <div className="flex items-center gap-1 px-2 py-1 text-[12px] text-muted-foreground">
                <Heart className="w-3 h-3" /> {(initiative as any).backerCount ?? 0} Backers
                <Users className="w-3 h-3 ml-1.5" /> {initiative.volunteerCount} Volunteers
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <Dialog open={isVolunteerOpen} onOpenChange={setIsVolunteerOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="rounded-lg h-7 px-3 text-[11px] border-primary/25 text-primary hover:bg-primary/5">
                    <Users className="w-3 h-3 mr-1" /> Join
                  </Button>
                </DialogTrigger>
                <DialogContent className="rounded-xl max-w-md">
                  <DialogHeader>
                    <DialogTitle className="text-base">Volunteer for this initiative</DialogTitle>
                    <DialogDescription className="text-[13px]">Join the team and contribute your skills.</DialogDescription>
                  </DialogHeader>
                  <Form {...volunteerForm}>
                    <form onSubmit={volunteerForm.handleSubmit((data) => {
                      volunteerMutation.mutate({ id: initiativeId, data: { ...data, skills: data.skills || "" } });
                    })} className="space-y-3">
                      <FormField control={volunteerForm.control} name="name" render={({ field }) => (
                        <FormItem><FormLabel className="text-[12px]">Name</FormLabel><FormControl><Input {...field} className="rounded-lg h-8 text-[13px]" /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={volunteerForm.control} name="email" render={({ field }) => (
                        <FormItem><FormLabel className="text-[12px]">Email</FormLabel><FormControl><Input {...field} type="email" className="rounded-lg h-8 text-[13px]" /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={volunteerForm.control} name="skills" render={({ field }) => (
                        <FormItem><FormLabel className="text-[12px]">Skills</FormLabel><FormControl><Input {...field} placeholder="e.g., teaching, logistics" className="rounded-lg h-8 text-[13px]" /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={volunteerForm.control} name="message" render={({ field }) => (
                        <FormItem><FormLabel className="text-[12px]">Message (optional)</FormLabel><FormControl><Textarea {...field} className="rounded-lg text-[13px]" /></FormControl><FormMessage /></FormItem>
                      )} />
                      <Button type="submit" className="w-full rounded-lg h-8 text-[12px] bg-gradient-to-r from-primary to-teal-500 border-0" disabled={volunteerMutation.isPending}>
                        {volunteerMutation.isPending ? "Signing up..." : "Join as Volunteer"}
                      </Button>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
              <Dialog open={isDonateOpen} onOpenChange={setIsDonateOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="rounded-lg h-7 px-3 text-[11px] bg-gradient-to-r from-primary to-teal-500 border-0 shadow-sm">
                    Donate
                  </Button>
                </DialogTrigger>
                <DialogContent className="rounded-xl max-w-md">
                  <DialogHeader>
                    <DialogTitle className="text-base">Support this initiative</DialogTitle>
                    <DialogDescription className="text-[13px]">Every contribution brings us closer to the goal.</DialogDescription>
                  </DialogHeader>
                  <Form {...donateForm}>
                    <form onSubmit={donateForm.handleSubmit((data) => {
                      donateMutation.mutate({ id: initiativeId, data });
                    })} className="space-y-3">
                      <FormField control={donateForm.control} name="donorName" render={({ field }) => (
                        <FormItem><FormLabel className="text-[12px]">Your Name</FormLabel><FormControl><Input {...field} className="rounded-lg h-8 text-[13px]" /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={donateForm.control} name="amount" render={({ field }) => (
                        <FormItem><FormLabel className="text-[12px]">Amount (₹)</FormLabel><FormControl><Input {...field} type="number" className="rounded-lg h-8 text-[13px]" /></FormControl><FormMessage /></FormItem>
                      )} />
                      <div className="flex gap-1.5">
                        {[100, 500, 1000, 5000].map(amt => (
                          <Button key={amt} type="button" variant="outline" size="sm" className="rounded-lg flex-1 text-[11px] h-7 hover:bg-primary/5 hover:text-primary hover:border-primary/25" onClick={() => donateForm.setValue("amount", amt)}>
                            ₹{amt.toLocaleString('en-IN')}
                          </Button>
                        ))}
                      </div>
                      <FormField control={donateForm.control} name="message" render={({ field }) => (
                        <FormItem><FormLabel className="text-[12px]">Message (optional)</FormLabel><FormControl><Textarea {...field} className="rounded-lg text-[13px]" /></FormControl><FormMessage /></FormItem>
                      )} />
                      <Button type="submit" className="w-full rounded-lg h-8 text-[12px] bg-gradient-to-r from-primary to-teal-500 border-0" disabled={donateMutation.isPending}>
                        {donateMutation.isPending ? "Processing..." : `Donate ₹${donateForm.watch('amount') || 0}`}
                      </Button>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>

      <div className="page-container mt-5">
        <div className="grid lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full rounded-lg mb-3 h-8 bg-muted/50 p-0.5">
                <TabsTrigger value="overview" className="flex-1 rounded-md text-[12px] data-[state=active]:shadow-xs">Overview</TabsTrigger>
                <TabsTrigger value="updates" className="flex-1 rounded-md text-[12px] data-[state=active]:shadow-xs">
                  Updates {initiative.updates?.length ? `(${initiative.updates.length})` : ""}
                </TabsTrigger>
                <TabsTrigger value="volunteers" className="flex-1 rounded-md text-[12px] data-[state=active]:shadow-xs">Volunteers</TabsTrigger>
                <TabsTrigger value="impact" className="flex-1 rounded-md text-[12px] data-[state=active]:shadow-xs">Impact</TabsTrigger>
                {initiative.blogs && initiative.blogs.length > 0 && (
                  <TabsTrigger value="blog" className="flex-1 rounded-md text-[12px] data-[state=active]:shadow-xs">
                    Blog ({initiative.blogs.length})
                  </TabsTrigger>
                )}
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <section>
                  <h2 className="text-lg font-semibold mb-3">About this initiative</h2>
                  <div className="prose prose-sm prose-p:text-muted-foreground max-w-none whitespace-pre-wrap text-[14px] leading-relaxed">
                    {initiative.description}
                  </div>
                </section>

                {plan && (
                  <section>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500 to-fuchsia-600 flex items-center justify-center text-white shadow-sm">
                        <Sparkles className="w-3.5 h-3.5" />
                      </div>
                      <h2 className="text-lg font-semibold">AI-Generated Execution Plan</h2>
                    </div>

                    <Card className="card-elevated border-purple-100 dark:border-purple-900/30 bg-purple-50/30 dark:bg-purple-900/10 mb-4">
                      <CardContent className="p-4">
                        <h3 className="font-medium text-[11px] text-purple-700 dark:text-purple-400 uppercase tracking-wide mb-1.5">Problem Statement</h3>
                        <p className="text-[13px] text-muted-foreground leading-relaxed">{plan.problemStatement}</p>
                      </CardContent>
                    </Card>

                    <div className="space-y-2.5 mb-4">
                      <h3 className="font-semibold text-[14px]">Execution Steps</h3>
                      {plan.executionSteps?.map((step: string, i: number) => (
                        <div key={i} className="flex items-start gap-2.5">
                          <div className="w-5 h-5 rounded-md bg-gradient-to-br from-primary/15 to-teal-500/15 text-primary flex items-center justify-center text-[10px] font-semibold shrink-0 mt-0.5 border border-primary/10">
                            {i + 1}
                          </div>
                          <p className="text-[13px] text-muted-foreground pt-0.5 leading-relaxed">{step}</p>
                        </div>
                      ))}
                    </div>

                    {plan.suggestedRoles && (
                      <div>
                        <h3 className="font-semibold text-[14px] mb-2">Suggested Volunteer Roles</h3>
                        <div className="flex flex-wrap gap-1.5">
                          {plan.suggestedRoles.map((role: string, i: number) => (
                            <span key={i} className="px-2.5 py-1 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 rounded-md text-[12px] font-medium border border-purple-100 dark:border-purple-800/30">
                              {role}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </section>
                )}

                <section>
                  <h2 className="text-lg font-semibold mb-4">Milestone-Based Funding</h2>
                  {initiative.milestones && initiative.milestones.length > 0 ? (
                    <div className="space-y-3">
                      {initiative.milestones.map((milestone) => {
                        const isLocked = milestone.status === 'pending';
                        const milestoneCompleted = milestone.status === 'completed';
                        const isActive = milestone.status === 'active';
                        const milestoneProgress = Math.min(
                          (initiative.fundingRaised / milestone.targetAmount) * 100,
                          100
                        );

                        return (
                          <motion.div
                            key={milestone.id}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                          >
                            <Card className={`card-elevated transition-all ${
                              milestoneCompleted ? 'border-emerald-200 dark:border-emerald-800/30 bg-emerald-50/20 dark:bg-emerald-900/10' :
                              isActive ? 'border-blue-200 dark:border-blue-800/30 bg-blue-50/15 dark:bg-blue-900/10 shadow-md' :
                              'border-border/50 bg-muted/15 opacity-75'
                            }`}>
                              <CardContent className="p-4">
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex items-center gap-2.5">
                                    {milestoneCompleted ? (
                                      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 text-white flex items-center justify-center shadow-sm">
                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                      </div>
                                    ) : isLocked ? (
                                      <div className="w-7 h-7 rounded-lg bg-muted text-muted-foreground flex items-center justify-center">
                                        <Lock className="w-3.5 h-3.5" />
                                      </div>
                                    ) : (
                                      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-400 to-indigo-500 text-white flex items-center justify-center shadow-sm">
                                        <Unlock className="w-3.5 h-3.5" />
                                      </div>
                                    )}
                                    <div>
                                      <h4 className="font-semibold text-[13px]">{milestone.title}</h4>
                                      <p className="text-[12px] text-muted-foreground">{milestone.description}</p>
                                    </div>
                                  </div>
                                  <div className="text-right shrink-0 ml-3">
                                    <div className="font-semibold text-[12px]">₹{milestone.targetAmount.toLocaleString('en-IN')}</div>
                                    <Badge variant="outline" className={`text-[9px] capitalize h-4 ${
                                      milestoneCompleted ? 'text-emerald-600 border-emerald-200 dark:text-emerald-400 dark:border-emerald-800/30' :
                                      isActive ? 'text-blue-600 border-blue-200 dark:text-blue-400 dark:border-blue-800/30' : ''
                                    }`}>
                                      {isLocked ? 'Locked' : milestone.status}
                                    </Badge>
                                  </div>
                                </div>
                                {!isLocked && (
                                  <div className="mt-1.5">
                                    <Progress
                                      value={milestoneProgress}
                                      className={`h-1.5 ${milestoneCompleted ? 'bg-emerald-100 dark:bg-emerald-900/20' : 'bg-blue-100 dark:bg-blue-900/20'}`}
                                      indicatorClassName={milestoneCompleted ? 'bg-gradient-to-r from-emerald-400 to-emerald-600' : 'progress-gradient'}
                                    />
                                    <div className="text-[10px] text-muted-foreground mt-0.5 text-right">
                                      {Math.round(milestoneProgress)}% funded
                                    </div>
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          </motion.div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="bg-muted/20 p-6 rounded-xl border border-dashed border-border text-center text-muted-foreground text-[13px]">
                      No milestones defined yet.
                    </div>
                  )}
                </section>
              </TabsContent>

              <TabsContent value="updates" className="space-y-5">
                {initiative.updates && initiative.updates.length > 0 ? (
                  <>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white shadow-sm">
                        <FileText className="w-3.5 h-3.5" />
                      </div>
                      <h2 className="text-lg font-semibold">Impact Proof Feed</h2>
                      <Badge className="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-none text-[9px] h-4">{initiative.updates.length} updates</Badge>
                    </div>
                    <div className="relative">
                      <div className="absolute left-3.5 top-0 bottom-0 w-px bg-gradient-to-b from-orange-300 dark:from-orange-600 via-border to-transparent"></div>
                      <div className="space-y-4">
                        {initiative.updates.map((update, i) => (
                          <motion.div
                            key={update.id}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.06 }}
                            className="relative pl-8"
                          >
                            <div className="absolute left-1.5 top-2 w-4 h-4 rounded-full bg-card border-2 border-orange-300 dark:border-orange-600 z-10"></div>
                            <Card className="card-elevated">
                              <CardContent className="p-4">
                                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mb-1.5">
                                  <Clock className="w-3 h-3" />
                                  {format(new Date(update.createdAt), 'MMM d, yyyy')}
                                </div>
                                <h4 className="font-semibold text-[14px] mb-1.5">{update.title}</h4>
                                <p className="text-[13px] text-muted-foreground leading-relaxed">{update.content}</p>
                              </CardContent>
                            </Card>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12 bg-muted/15 rounded-xl">
                    <FileText className="w-10 h-10 text-muted-foreground mx-auto mb-2.5 opacity-40" />
                    <p className="text-muted-foreground text-[13px]">No updates posted yet.</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="volunteers" className="space-y-5">
                {suggestedVolunteers && suggestedVolunteers.length > 0 ? (
                  <>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-teal-400 to-primary flex items-center justify-center text-white shadow-sm">
                        <Sparkles className="w-3.5 h-3.5" />
                      </div>
                      <h2 className="text-lg font-semibold">AI-Suggested Volunteers</h2>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {suggestedVolunteers.map((vol, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.06 }}
                        >
                          <Card className="card-elevated">
                            <CardContent className="p-4">
                              <div className="flex items-center gap-2.5 mb-2.5">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-400 to-primary text-white flex items-center justify-center font-semibold text-[12px] shadow-sm">
                                  {vol.avatarInitials}
                                </div>
                                <div>
                                  <div className="font-medium text-[13px]">{vol.name}</div>
                                  <div className="text-[11px] text-primary font-medium">{vol.matchScore}% match</div>
                                </div>
                              </div>
                              <div className="flex flex-wrap gap-1 mb-2.5">
                                {vol.skills.slice(0, 3).map((skill, j) => (
                                  <span key={j} className="px-1.5 py-0.5 bg-muted rounded-md text-[9px] font-medium">{skill}</span>
                                ))}
                              </div>
                              <p className="text-[11px] text-muted-foreground italic mb-2.5">"{vol.reason}"</p>
                              <Button
                                size="sm"
                                className={`w-full rounded-lg text-[11px] h-7 transition-all ${
                                  invitedVolunteers.has(i)
                                    ? 'bg-teal-100 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400 hover:bg-teal-100 cursor-default border border-teal-200 dark:border-teal-800/30'
                                    : 'bg-gradient-to-r from-primary to-teal-500 text-white border-0 shadow-sm'
                                }`}
                                disabled={invitedVolunteers.has(i)}
                                onClick={() => {
                                  setInvitedVolunteers(prev => new Set(prev).add(i));
                                  toast({
                                    title: "Invitation sent!",
                                    description: `${vol.name} has been invited to join this initiative.`,
                                  });
                                }}
                              >
                                {invitedVolunteers.has(i) ? (
                                  <><CheckCircle2 className="w-3 h-3 mr-1" /> Invited</>
                                ) : (
                                  <><Send className="w-3 h-3 mr-1" /> Invite to Join</>
                                )}
                              </Button>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12 bg-muted/15 rounded-xl">
                    <Users className="w-10 h-10 text-muted-foreground mx-auto mb-2.5 opacity-40" />
                    <p className="text-muted-foreground text-[13px]">Volunteer matching in progress...</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="impact" className="space-y-5">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-cyan-500 flex items-center justify-center text-white shadow-sm">
                    <TrendingUp className="w-3.5 h-3.5" />
                  </div>
                  <h2 className="text-lg font-semibold">Impact Metrics</h2>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: initiative.volunteerCount, label: "Volunteers Engaged", gradient: "from-blue-500 to-indigo-600", icon: <Users className="w-4 h-4" /> },
                    { value: `₹${initiative.fundingRaised.toLocaleString('en-IN')}`, label: "Funds Raised", gradient: "from-emerald-500 to-teal-600", icon: <Trophy className="w-4 h-4" /> },
                    { value: `${initiative.milestones?.filter(m => m.status === 'completed').length ?? 0}/${initiative.milestones?.length ?? 0}`, label: "Milestones Completed", gradient: "from-amber-500 to-orange-600", icon: <CheckCircle2 className="w-4 h-4" /> },
                    { value: initiative.updates?.length ?? 0, label: "Updates Posted", gradient: "from-purple-500 to-fuchsia-600", icon: <FileText className="w-4 h-4" /> },
                  ].map((stat, i) => (
                    <Card key={i} className="card-elevated overflow-hidden">
                      <div className={`h-0.5 w-full bg-gradient-to-r ${stat.gradient}`} />
                      <CardContent className="p-4 text-center">
                        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${stat.gradient} flex items-center justify-center text-white shadow-sm mx-auto mb-2`}>
                          {stat.icon}
                        </div>
                        <p className="text-xl font-semibold">{stat.value}</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">{stat.label}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <TrustBreakdown breakdown={initiative.trustScore?.breakdown} overall={initiative.trustScore?.overall ?? 0} />
              </TabsContent>

              {initiative.blogs && initiative.blogs.length > 0 && (
                <TabsContent value="blog" className="space-y-5">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white shadow-sm">
                      <BookOpen className="w-3.5 h-3.5" />
                    </div>
                    <h2 className="text-lg font-semibold">Impact Stories</h2>
                    <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-none text-[9px] h-4">{initiative.blogs.length} {initiative.blogs.length === 1 ? 'story' : 'stories'}</Badge>
                  </div>
                  <div className="space-y-4">
                    {initiative.blogs.map((blog: any, i: number) => (
                      <motion.div
                        key={blog.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.08 }}
                      >
                        <Card className="card-elevated overflow-hidden border-emerald-200/40 dark:border-emerald-800/20">
                          <div className="h-1 w-full bg-gradient-to-r from-emerald-400 to-teal-400" />
                          <CardContent className="p-5">
                            <h3 className="text-base font-semibold mb-3">{blog.title}</h3>
                            <div className="space-y-3">
                              <div>
                                <h4 className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide mb-1.5">The Story</h4>
                                <p className="text-[13px] text-muted-foreground leading-relaxed whitespace-pre-line">{blog.story}</p>
                              </div>
                              <div className="bg-amber-50/50 dark:bg-amber-900/10 rounded-lg p-3 border border-amber-100 dark:border-amber-800/20">
                                <h4 className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wide mb-1.5">Challenges Faced</h4>
                                <p className="text-[13px] text-muted-foreground leading-relaxed">{blog.challenges}</p>
                              </div>
                              <div>
                                <h4 className="text-[11px] font-semibold text-blue-700 dark:text-blue-400 uppercase tracking-wide mb-1.5">Outcome</h4>
                                <p className="text-[13px] text-muted-foreground leading-relaxed">{blog.outcome}</p>
                              </div>
                              <div className="bg-emerald-50 dark:bg-emerald-900/10 rounded-lg p-3 border border-emerald-100 dark:border-emerald-800/20">
                                <h4 className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide mb-1.5">Impact at a Glance</h4>
                                <p className="text-[13px] font-medium text-emerald-800 dark:text-emerald-300">{blog.impactSummary}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </TabsContent>
              )}
            </Tabs>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-3">
              <Card className="card-elevated overflow-hidden shadow-md">
                <div className="h-0.5 w-full progress-gradient" />
                <CardContent className="p-3.5">
                  <div className="mb-2.5">
                    <div className="flex items-baseline gap-1.5 mb-0.5">
                      <span className="text-2xl font-semibold text-foreground tracking-tight">₹{initiative.fundingRaised.toLocaleString('en-IN')}</span>
                      <span className="text-muted-foreground text-[12px] font-medium">raised</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">of ₹{initiative.fundingGoal.toLocaleString('en-IN')} goal</p>
                  </div>

                  <Progress value={progressPercent} className="h-2 mb-2 bg-muted" indicatorClassName="progress-gradient" />
                  <div className="text-center text-[11px] font-semibold text-primary mb-3">{Math.round(progressPercent)}% funded</div>

                  <div className="space-y-1.5">
                    <Dialog open={isDonateOpen} onOpenChange={setIsDonateOpen}>
                      <DialogTrigger asChild>
                        <Button className="w-full rounded-lg h-8 text-[12px] font-medium shadow-sm bg-gradient-to-r from-primary to-teal-500 border-0">
                          Back this project
                        </Button>
                      </DialogTrigger>
                    </Dialog>
                    <Dialog open={isVolunteerOpen} onOpenChange={setIsVolunteerOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="w-full rounded-lg h-8 text-[12px] font-medium border-primary/25 text-primary hover:bg-primary/5">
                          <Users className="w-3 h-3 mr-1" /> Volunteer
                        </Button>
                      </DialogTrigger>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>

              <TrustBreakdown breakdown={initiative.trustScore?.breakdown} overall={initiative.trustScore?.overall ?? 0} />

              {initiative.topDonors && initiative.topDonors.length > 0 && (
                <Card className="card-elevated overflow-hidden">
                  <div className="h-0.5 w-full bg-gradient-to-r from-amber-400 via-orange-400 to-red-400" />
                  <CardContent className="p-3.5">
                    <h3 className="font-medium text-[13px] mb-2.5 flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded-md bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                        <Trophy className="w-3 h-3 text-white" />
                      </div>
                      Top Supporters
                    </h3>
                    <div className="space-y-1.5">
                      {initiative.topDonors.map((donor: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <div className={`w-5.5 h-5.5 rounded-md flex items-center justify-center text-[9px] font-semibold ${
                              idx === 0 ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-white' :
                              idx === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-white' :
                              idx === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-white' :
                              'bg-muted text-muted-foreground'
                            }`}>
                              #{donor.rank}
                            </div>
                            <span className="font-medium text-[11px]">{donor.donorName}</span>
                          </div>
                          <span className="font-semibold text-[11px] text-primary">₹{donor.totalAmount.toLocaleString('en-IN')}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
