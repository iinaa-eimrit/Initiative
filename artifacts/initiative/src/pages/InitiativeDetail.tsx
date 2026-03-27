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
    <div className="min-h-screen bg-background pt-28 pb-20">
      <div className="w-full bg-gradient-mesh py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="h-8 w-64 bg-muted/40 rounded-xl animate-pulse" />
          <div className="h-12 w-full max-w-lg bg-muted/30 rounded-xl animate-pulse" />
          <div className="h-6 w-48 bg-muted/20 rounded-lg animate-pulse" />
        </div>
      </div>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <div className="h-48 bg-muted/20 rounded-3xl animate-pulse" />
          <div className="h-32 bg-muted/20 rounded-3xl animate-pulse" />
        </div>
        <div className="space-y-6">
          <div className="h-40 bg-muted/20 rounded-3xl animate-pulse" />
          <div className="h-24 bg-muted/20 rounded-3xl animate-pulse" />
        </div>
      </div>
    </div>
  );
  if (error || !initiative) return (
    <div className="min-h-screen pt-32 flex flex-col items-center justify-center text-center px-4">
      <div className="w-16 h-16 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-6 text-2xl font-bold">!</div>
      <h2 className="text-2xl font-bold mb-2">Initiative not found</h2>
      <p className="text-muted-foreground mb-6">This initiative may have been removed or doesn't exist.</p>
      <Link href="/initiatives">
        <Button variant="outline" className="rounded-full"><ArrowLeft className="w-4 h-4 mr-2" /> Back to Initiatives</Button>
      </Link>
    </div>
  );

  const progressPercent = Math.min((initiative.fundingRaised / initiative.fundingGoal) * 100, 100);
  const plan = initiative.structuredPlan as any;
  const isCompleted = initiative.status === "completed";

  return (
    <div className="min-h-screen bg-background pb-16">
      <div className="w-full bg-gradient-mesh py-6 pt-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(16,185,129,0.08),transparent_60%)]" />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <Link href="/initiatives" className="inline-flex items-center text-xs font-medium text-muted-foreground hover:text-foreground transition-colors w-fit bg-card/50 backdrop-blur-md px-2.5 py-1 rounded-full mb-4">
            <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Back to feed
          </Link>

          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-teal-400 flex items-center justify-center text-white font-bold text-sm ring-2 ring-card shadow-lg">
              {initiative.creatorName.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm">{initiative.creatorName}</span>
                <Badge variant="outline" className="text-[10px] bg-card/80">{initiative.location?.split(",")[0]}</Badge>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                <Calendar className="w-3 h-3" />
                <span>Started {format(new Date(initiative.createdAt), 'MMM d, yyyy')}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-1.5 mb-2 flex-wrap">
            <Badge className="bg-primary hover:bg-primary/90 text-primary-foreground border-none text-xs px-2.5 py-0.5 capitalize">{initiative.category}</Badge>
            <Badge variant="outline" className={`bg-card/80 backdrop-blur text-foreground border-border text-xs px-2.5 py-0.5 capitalize ${isCompleted ? 'border-emerald-300 text-emerald-700 dark:border-emerald-700 dark:text-emerald-400' : ''}`}>
              {isCompleted && <CheckCircle2 className="w-3 h-3 mr-1" />}
              {initiative.status}
            </Badge>
          </div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-display font-bold text-foreground max-w-4xl leading-tight mb-4">
            {initiative.title}
          </h1>

          <Card className="rounded-xl border-border/40 shadow-lg overflow-hidden bg-card/80 backdrop-blur-sm">
            <CardContent className="p-4">
              <LifecycleTracker currentStage={initiative.lifecycleStage} />
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="sticky top-14 z-40 bg-card/80 backdrop-blur-xl border-b border-border/50 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-12">
            <div className="flex items-center gap-2">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  setIsLiked(!isLiked);
                  if (!isLiked) toast({ title: "Liked!", description: `You liked "${initiative.title.split(":")[0]}"` });
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                  isLiked ? "bg-red-50 text-red-500" : "hover:bg-muted/50 text-muted-foreground"
                }`}
              >
                <Heart className={`w-4 h-4 ${isLiked ? "fill-red-500 text-red-500" : ""}`} />
                {isLiked ? "Liked" : "Like"}
              </motion.button>
              <button
                onClick={() => toast({ title: "Link copied!", description: "Share link copied to clipboard." })}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium text-muted-foreground hover:bg-muted/50 transition-all"
              >
                <Share2 className="w-4 h-4" /> Share
              </button>
              <div className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-muted-foreground">
                <Heart className="w-3.5 h-3.5" /> {(initiative as any).backerCount ?? 0} Backers
                <Users className="w-3.5 h-3.5 ml-2" /> {initiative.volunteerCount} Volunteers
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Dialog open={isVolunteerOpen} onOpenChange={setIsVolunteerOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="rounded-full h-9 px-4 text-xs border-primary/30 text-primary hover:bg-primary/5">
                    <Users className="w-3.5 h-3.5 mr-1.5" /> Join
                  </Button>
                </DialogTrigger>
                <DialogContent className="rounded-2xl">
                  <DialogHeader>
                    <DialogTitle>Volunteer for this initiative</DialogTitle>
                    <DialogDescription>Join the team and contribute your skills.</DialogDescription>
                  </DialogHeader>
                  <Form {...volunteerForm}>
                    <form onSubmit={volunteerForm.handleSubmit((data) => {
                      volunteerMutation.mutate({ id: initiativeId, data: { ...data, skills: data.skills || "" } });
                    })} className="space-y-4">
                      <FormField control={volunteerForm.control} name="name" render={({ field }) => (
                        <FormItem><FormLabel>Name</FormLabel><FormControl><Input {...field} className="rounded-xl" /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={volunteerForm.control} name="email" render={({ field }) => (
                        <FormItem><FormLabel>Email</FormLabel><FormControl><Input {...field} type="email" className="rounded-xl" /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={volunteerForm.control} name="skills" render={({ field }) => (
                        <FormItem><FormLabel>Skills</FormLabel><FormControl><Input {...field} placeholder="e.g., teaching, logistics" className="rounded-xl" /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={volunteerForm.control} name="message" render={({ field }) => (
                        <FormItem><FormLabel>Message (optional)</FormLabel><FormControl><Textarea {...field} className="rounded-xl" /></FormControl><FormMessage /></FormItem>
                      )} />
                      <Button type="submit" className="w-full rounded-xl" disabled={volunteerMutation.isPending}>
                        {volunteerMutation.isPending ? "Signing up..." : "Join as Volunteer"}
                      </Button>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
              <Dialog open={isDonateOpen} onOpenChange={setIsDonateOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="rounded-full h-9 px-4 text-xs">
                    Donate
                  </Button>
                </DialogTrigger>
                <DialogContent className="rounded-2xl">
                  <DialogHeader>
                    <DialogTitle>Support this initiative</DialogTitle>
                    <DialogDescription>Every contribution brings us closer to the goal.</DialogDescription>
                  </DialogHeader>
                  <Form {...donateForm}>
                    <form onSubmit={donateForm.handleSubmit((data) => {
                      donateMutation.mutate({ id: initiativeId, data });
                    })} className="space-y-4">
                      <FormField control={donateForm.control} name="donorName" render={({ field }) => (
                        <FormItem><FormLabel>Your Name</FormLabel><FormControl><Input {...field} className="rounded-xl" /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={donateForm.control} name="amount" render={({ field }) => (
                        <FormItem><FormLabel>Amount (₹)</FormLabel><FormControl><Input {...field} type="number" className="rounded-xl" /></FormControl><FormMessage /></FormItem>
                      )} />
                      <div className="flex gap-2">
                        {[100, 500, 1000, 5000].map(amt => (
                          <Button key={amt} type="button" variant="outline" size="sm" className="rounded-full flex-1 text-xs" onClick={() => donateForm.setValue("amount", amt)}>
                            ₹{amt.toLocaleString('en-IN')}
                          </Button>
                        ))}
                      </div>
                      <FormField control={donateForm.control} name="message" render={({ field }) => (
                        <FormItem><FormLabel>Message (optional)</FormLabel><FormControl><Textarea {...field} className="rounded-xl" /></FormControl><FormMessage /></FormItem>
                      )} />
                      <Button type="submit" className="w-full rounded-xl" disabled={donateMutation.isPending}>
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

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full rounded-lg mb-4 h-9 bg-muted/50 p-0.5">
                <TabsTrigger value="overview" className="flex-1 rounded-lg text-sm data-[state=active]:shadow-sm">Overview</TabsTrigger>
                <TabsTrigger value="updates" className="flex-1 rounded-lg text-sm data-[state=active]:shadow-sm">
                  Updates {initiative.updates?.length ? `(${initiative.updates.length})` : ""}
                </TabsTrigger>
                <TabsTrigger value="volunteers" className="flex-1 rounded-lg text-sm data-[state=active]:shadow-sm">Volunteers</TabsTrigger>
                <TabsTrigger value="impact" className="flex-1 rounded-lg text-sm data-[state=active]:shadow-sm">Impact</TabsTrigger>
                {initiative.blogs && initiative.blogs.length > 0 && (
                  <TabsTrigger value="blog" className="flex-1 rounded-lg text-sm data-[state=active]:shadow-sm">
                    Blog ({initiative.blogs.length})
                  </TabsTrigger>
                )}
              </TabsList>

              <TabsContent value="overview" className="space-y-8">
                <section>
                  <h2 className="text-2xl font-bold mb-4">About this initiative</h2>
                  <div className="prose prose-lg prose-p:text-muted-foreground max-w-none whitespace-pre-wrap">
                    {initiative.description}
                  </div>
                </section>

                {plan && (
                  <section>
                    <div className="flex items-center gap-2 mb-4">
                      <Sparkles className="w-5 h-5 text-purple-600" />
                      <h2 className="text-2xl font-bold">AI-Generated Execution Plan</h2>
                    </div>

                    <Card className="rounded-2xl border-purple-100 bg-purple-50/30 mb-6">
                      <CardContent className="p-6">
                        <h3 className="font-bold text-sm text-purple-700 uppercase tracking-wide mb-2">Problem Statement</h3>
                        <p className="text-muted-foreground">{plan.problemStatement}</p>
                      </CardContent>
                    </Card>

                    <div className="space-y-3 mb-6">
                      <h3 className="font-bold">Execution Steps</h3>
                      {plan.executionSteps?.map((step: string, i: number) => (
                        <div key={i} className="flex items-start gap-3">
                          <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                            {i + 1}
                          </div>
                          <p className="text-sm text-muted-foreground">{step}</p>
                        </div>
                      ))}
                    </div>

                    {plan.suggestedRoles && (
                      <div>
                        <h3 className="font-bold mb-3">Suggested Volunteer Roles</h3>
                        <div className="flex flex-wrap gap-2">
                          {plan.suggestedRoles.map((role: string, i: number) => (
                            <span key={i} className="px-3 py-1.5 bg-purple-50 text-purple-700 rounded-full text-sm font-medium border border-purple-100">
                              {role}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </section>
                )}

                <section>
                  <h2 className="text-2xl font-bold mb-6">Milestone-Based Funding</h2>
                  {initiative.milestones && initiative.milestones.length > 0 ? (
                    <div className="space-y-4">
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
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                          >
                            <Card className={`rounded-2xl border transition-all ${
                              milestoneCompleted ? 'border-green-200 bg-green-50/30' :
                              isActive ? 'border-blue-200 bg-blue-50/20 shadow-md' :
                              'border-border/50 bg-muted/20 opacity-75'
                            }`}>
                              <CardContent className="p-5">
                                <div className="flex items-start justify-between mb-3">
                                  <div className="flex items-center gap-2">
                                    {milestoneCompleted ? (
                                      <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                                        <CheckCircle2 className="w-4 h-4" />
                                      </div>
                                    ) : isLocked ? (
                                      <div className="w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center">
                                        <Lock className="w-4 h-4" />
                                      </div>
                                    ) : (
                                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                                        <Unlock className="w-4 h-4" />
                                      </div>
                                    )}
                                    <div>
                                      <h4 className="font-bold">{milestone.title}</h4>
                                      <p className="text-sm text-muted-foreground">{milestone.description}</p>
                                    </div>
                                  </div>
                                  <div className="text-right shrink-0 ml-4">
                                    <div className="font-bold text-sm">₹{milestone.targetAmount.toLocaleString('en-IN')}</div>
                                    <Badge variant="outline" className={`text-xs capitalize ${
                                      milestoneCompleted ? 'text-green-600 border-green-200' :
                                      isActive ? 'text-blue-600 border-blue-200' : ''
                                    }`}>
                                      {isLocked ? 'Locked' : milestone.status}
                                    </Badge>
                                  </div>
                                </div>
                                {!isLocked && (
                                  <div className="mt-2">
                                    <Progress
                                      value={milestoneProgress}
                                      className={`h-2 ${milestoneCompleted ? 'bg-green-100' : 'bg-blue-100'}`}
                                      indicatorClassName={milestoneCompleted ? 'bg-green-500' : 'bg-blue-500'}
                                    />
                                    <div className="text-xs text-muted-foreground mt-1 text-right">
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
                    <div className="bg-muted/30 p-8 rounded-2xl border border-dashed border-border text-center text-muted-foreground">
                      No milestones defined yet.
                    </div>
                  )}
                </section>
              </TabsContent>

              <TabsContent value="updates" className="space-y-6">
                {initiative.updates && initiative.updates.length > 0 ? (
                  <>
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="w-5 h-5 text-orange-600" />
                      <h2 className="text-2xl font-bold">Impact Proof Feed</h2>
                      <Badge className="bg-orange-100 text-orange-700 border-none text-xs">{initiative.updates.length} updates</Badge>
                    </div>
                    <div className="relative">
                      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-orange-300 via-border to-transparent"></div>
                      <div className="space-y-6">
                        {initiative.updates.map((update, i) => (
                          <motion.div
                            key={update.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.08 }}
                            className="relative pl-10"
                          >
                            <div className="absolute left-2 top-2 w-5 h-5 rounded-full bg-white border-2 border-orange-300 z-10"></div>
                            <Card className="rounded-2xl border-border/50 hover:shadow-md transition-shadow">
                              <CardContent className="p-5">
                                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                                  <Clock className="w-3 h-3" />
                                  {format(new Date(update.createdAt), 'MMM d, yyyy')}
                                </div>
                                <h4 className="font-bold text-base mb-2">{update.title}</h4>
                                <p className="text-sm text-muted-foreground leading-relaxed">{update.content}</p>
                              </CardContent>
                            </Card>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-16 bg-muted/20 rounded-2xl">
                    <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-40" />
                    <p className="text-muted-foreground">No updates posted yet.</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="volunteers" className="space-y-6">
                {suggestedVolunteers && suggestedVolunteers.length > 0 ? (
                  <>
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-5 h-5 text-teal-600" />
                      <h2 className="text-2xl font-bold">AI-Suggested Volunteers</h2>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      {suggestedVolunteers.map((vol, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.08 }}
                        >
                          <Card className="rounded-2xl border-border/50 hover:shadow-md transition-all hover:-translate-y-0.5">
                            <CardContent className="p-5">
                              <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-primary text-white flex items-center justify-center font-bold text-sm">
                                  {vol.avatarInitials}
                                </div>
                                <div>
                                  <div className="font-bold text-sm">{vol.name}</div>
                                  <div className="text-xs text-teal-600 font-medium">{vol.matchScore}% match</div>
                                </div>
                              </div>
                              <div className="flex flex-wrap gap-1 mb-3">
                                {vol.skills.slice(0, 3).map((skill, j) => (
                                  <span key={j} className="px-2 py-0.5 bg-muted rounded-md text-[10px] font-medium">{skill}</span>
                                ))}
                              </div>
                              <p className="text-xs text-muted-foreground italic mb-3">"{vol.reason}"</p>
                              <Button
                                size="sm"
                                className={`w-full rounded-xl text-xs h-8 transition-all ${
                                  invitedVolunteers.has(i)
                                    ? 'bg-teal-100 text-teal-700 hover:bg-teal-100 cursor-default'
                                    : 'bg-teal-600 hover:bg-teal-700 text-white'
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
                                  <><CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> Invited</>
                                ) : (
                                  <><Send className="w-3.5 h-3.5 mr-1.5" /> Invite to Join</>
                                )}
                              </Button>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-16 bg-muted/20 rounded-2xl">
                    <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-40" />
                    <p className="text-muted-foreground">Volunteer matching in progress...</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="impact" className="space-y-6">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  <h2 className="text-2xl font-bold">Impact Metrics</h2>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Card className="rounded-2xl">
                    <CardContent className="p-5 text-center">
                      <p className="text-3xl font-bold text-primary">{initiative.volunteerCount}</p>
                      <p className="text-sm text-muted-foreground">Volunteers Engaged</p>
                    </CardContent>
                  </Card>
                  <Card className="rounded-2xl">
                    <CardContent className="p-5 text-center">
                      <p className="text-3xl font-bold text-emerald-600">₹{initiative.fundingRaised.toLocaleString('en-IN')}</p>
                      <p className="text-sm text-muted-foreground">Funds Raised</p>
                    </CardContent>
                  </Card>
                  <Card className="rounded-2xl">
                    <CardContent className="p-5 text-center">
                      <p className="text-3xl font-bold text-blue-600">{initiative.milestones?.filter(m => m.status === 'completed').length ?? 0}/{initiative.milestones?.length ?? 0}</p>
                      <p className="text-sm text-muted-foreground">Milestones Completed</p>
                    </CardContent>
                  </Card>
                  <Card className="rounded-2xl">
                    <CardContent className="p-5 text-center">
                      <p className="text-3xl font-bold text-amber-600">{initiative.updates?.length ?? 0}</p>
                      <p className="text-sm text-muted-foreground">Updates Posted</p>
                    </CardContent>
                  </Card>
                </div>

                <TrustBreakdown breakdown={initiative.trustScore?.breakdown} overall={initiative.trustScore?.overall ?? 0} />
              </TabsContent>

              {initiative.blogs && initiative.blogs.length > 0 && (
                <TabsContent value="blog" className="space-y-6">
                  <div className="flex items-center gap-2 mb-2">
                    <BookOpen className="w-5 h-5 text-emerald-600" />
                    <h2 className="text-2xl font-bold">Impact Stories</h2>
                    <Badge className="bg-emerald-100 text-emerald-700 border-none text-xs">{initiative.blogs.length} {initiative.blogs.length === 1 ? 'story' : 'stories'}</Badge>
                  </div>
                  <div className="space-y-6">
                    {initiative.blogs.map((blog: any, i: number) => (
                      <motion.div
                        key={blog.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                      >
                        <Card className="rounded-2xl border-emerald-200/50 overflow-hidden">
                          <div className="h-1.5 w-full bg-gradient-to-r from-emerald-400 to-teal-400" />
                          <CardContent className="p-6">
                            <h3 className="text-xl font-bold mb-4">{blog.title}</h3>
                            <div className="space-y-4">
                              <div>
                                <h4 className="text-sm font-bold text-emerald-700 uppercase tracking-wide mb-2">The Story</h4>
                                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{blog.story}</p>
                              </div>
                              <div className="bg-amber-50/50 rounded-xl p-4 border border-amber-100">
                                <h4 className="text-sm font-bold text-amber-700 uppercase tracking-wide mb-2">Challenges Faced</h4>
                                <p className="text-sm text-muted-foreground leading-relaxed">{blog.challenges}</p>
                              </div>
                              <div>
                                <h4 className="text-sm font-bold text-blue-700 uppercase tracking-wide mb-2">Outcome</h4>
                                <p className="text-sm text-muted-foreground leading-relaxed">{blog.outcome}</p>
                              </div>
                              <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
                                <h4 className="text-sm font-bold text-emerald-700 uppercase tracking-wide mb-2">Impact at a Glance</h4>
                                <p className="text-sm font-medium text-emerald-800">{blog.impactSummary}</p>
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
            <div className="sticky top-28 space-y-4">
              <Card className="rounded-xl border-border/60 shadow-xl overflow-hidden">
                <div className="h-1 w-full bg-primary" />
                <CardContent className="p-4">
                  <div className="mb-3">
                    <div className="flex items-baseline gap-2 mb-0.5">
                      <span className="text-3xl font-bold font-display text-foreground">₹{initiative.fundingRaised.toLocaleString('en-IN')}</span>
                      <span className="text-muted-foreground text-sm font-medium">raised</span>
                    </div>
                    <p className="text-xs text-muted-foreground">of ₹{initiative.fundingGoal.toLocaleString('en-IN')} goal</p>
                  </div>

                  <Progress value={progressPercent} className="h-2.5 mb-3 bg-muted" indicatorClassName="bg-primary" />
                  <div className="text-center text-xs font-bold text-primary mb-4">{Math.round(progressPercent)}% funded</div>

                  <div className="space-y-2">
                    <Dialog open={isDonateOpen} onOpenChange={setIsDonateOpen}>
                      <DialogTrigger asChild>
                        <Button className="w-full rounded-lg h-9 text-sm font-semibold shadow-lg shadow-primary/20">
                          Back this project
                        </Button>
                      </DialogTrigger>
                    </Dialog>
                    <Dialog open={isVolunteerOpen} onOpenChange={setIsVolunteerOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="w-full rounded-lg h-9 text-sm font-semibold">
                          <Users className="w-3.5 h-3.5 mr-1.5" /> Volunteer
                        </Button>
                      </DialogTrigger>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>

              <TrustBreakdown breakdown={initiative.trustScore?.breakdown} overall={initiative.trustScore?.overall ?? 0} />

              {initiative.topDonors && initiative.topDonors.length > 0 && (
                <Card className="rounded-xl border-border/60 overflow-hidden">
                  <CardContent className="p-4">
                    <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
                      <Trophy className="w-3.5 h-3.5 text-amber-500" /> Top Supporters
                    </h3>
                    <div className="space-y-2">
                      {initiative.topDonors.map((donor: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold ${
                              idx === 0 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30' :
                              idx === 1 ? 'bg-gray-100 text-gray-600 dark:bg-gray-800/50' :
                              idx === 2 ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30' :
                              'bg-muted text-muted-foreground'
                            }`}>
                              #{donor.rank}
                            </div>
                            <span className="font-medium text-xs">{donor.donorName}</span>
                          </div>
                          <span className="font-bold text-xs text-primary">₹{donor.totalAmount.toLocaleString('en-IN')}</span>
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
