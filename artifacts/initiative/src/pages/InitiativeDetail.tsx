import { useState } from "react";
import { useParams, Link } from "wouter";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  MapPin, Calendar, User, Users, CheckCircle2, Circle, ArrowLeft, Trophy, Heart,
  Lock, Unlock, Sparkles, Clock, FileText, Send
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

const donateSchema = z.object({
  donorName: z.string().min(2, "Name is required"),
  amount: z.coerce.number().min(1, "Minimum $1"),
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

  if (isLoading) return <div className="min-h-screen pt-32 flex justify-center"><div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>;
  if (error || !initiative) return <div className="min-h-screen pt-32 text-center text-xl font-bold">Initiative not found</div>;

  const progressPercent = Math.min((initiative.fundingRaised / initiative.fundingGoal) * 100, 100);
  const plan = initiative.structuredPlan as any;

  return (
    <div className="min-h-screen bg-background pb-32">
      <div className="w-full bg-gradient-mesh py-8 pt-28">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/initiatives" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors w-fit bg-white/50 backdrop-blur-md px-3 py-1 rounded-full mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to feed
          </Link>
          <div className="flex gap-2 mb-3 flex-wrap">
            <Badge className="bg-primary hover:bg-primary/90 text-primary-foreground border-none text-sm px-3 py-1 capitalize">{initiative.category}</Badge>
            <Badge variant="outline" className="bg-white/80 backdrop-blur text-foreground border-border text-sm px-3 py-1 capitalize">{initiative.status}</Badge>
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-foreground max-w-4xl leading-tight mb-6">
            {initiative.title}
          </h1>
          
          <Card className="rounded-2xl border-border/40 shadow-lg overflow-hidden bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <LifecycleTracker currentStage={initiative.lifecycleStage} />
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <div className="grid lg:grid-cols-3 gap-12">
          
          <div className="lg:col-span-2 space-y-10">
            
            <div className="flex flex-wrap gap-6 text-muted-foreground border-b border-border/60 pb-6">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5" />
                <span className="font-medium text-foreground">{initiative.creatorName}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                <span>{initiative.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                <span>Started {format(new Date(initiative.createdAt), 'MMM d, yyyy')}</span>
              </div>
            </div>

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
                    const isCompleted = milestone.status === 'completed';
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
                          isCompleted ? 'border-green-200 bg-green-50/30' : 
                          isActive ? 'border-blue-200 bg-blue-50/20 shadow-md' : 
                          'border-border/50 bg-muted/20 opacity-75'
                        }`}>
                          <CardContent className="p-5">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-2">
                                {isCompleted ? (
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
                                <div className="font-bold text-sm">${milestone.targetAmount.toLocaleString()}</div>
                                <Badge variant="outline" className={`text-xs capitalize ${
                                  isCompleted ? 'text-green-600 border-green-200' : 
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
                                  className={`h-2 ${isCompleted ? 'bg-green-100' : 'bg-blue-100'}`}
                                  indicatorClassName={isCompleted ? 'bg-green-500' : 'bg-blue-500'}
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

            {initiative.updates && initiative.updates.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-6">
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
              </section>
            )}

            {suggestedVolunteers && suggestedVolunteers.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-6">
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
                      <Card className="rounded-2xl border-border/50 hover:shadow-md transition-all">
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
              </section>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-28 space-y-6">
              
              <Card className="rounded-3xl border-border/60 shadow-xl shadow-black/5 overflow-hidden">
                <div className="h-1.5 w-full bg-primary"></div>
                <CardContent className="p-6">
                  <div className="mb-4">
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="text-4xl font-bold font-display text-foreground">${initiative.fundingRaised.toLocaleString()}</span>
                      <span className="text-muted-foreground font-medium">raised</span>
                    </div>
                    <p className="text-sm text-muted-foreground">of ${initiative.fundingGoal.toLocaleString()} goal</p>
                  </div>
                  
                  <Progress value={progressPercent} className="h-3 mb-4 bg-muted" indicatorClassName="bg-primary" />
                  <div className="text-center text-sm font-bold text-primary mb-6">{Math.round(progressPercent)}% funded</div>

                  <div className="space-y-3">
                    <Dialog open={isDonateOpen} onOpenChange={setIsDonateOpen}>
                      <DialogTrigger asChild>
                        <Button className="w-full h-12 text-lg rounded-xl shadow-md shadow-primary/20 hover:-translate-y-0.5 transition-transform">
                          Back this project
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md rounded-3xl">
                        <DialogHeader>
                          <DialogTitle className="text-2xl font-display">Make a Donation</DialogTitle>
                          <DialogDescription>Your contribution helps make this initiative a reality.</DialogDescription>
                        </DialogHeader>
                        <Form {...donateForm}>
                          <form onSubmit={donateForm.handleSubmit((v) => donateMutation.mutate({ id: initiativeId, data: v }))} className="space-y-4 mt-4">
                            <FormField control={donateForm.control} name="amount" render={({ field }) => (
                              <FormItem>
                                <FormLabel>Amount ($)</FormLabel>
                                <FormControl><Input type="number" className="text-lg h-12 rounded-xl" {...field} /></FormControl>
                                <FormMessage />
                              </FormItem>
                            )} />
                            <FormField control={donateForm.control} name="donorName" render={({ field }) => (
                              <FormItem>
                                <FormLabel>Your Name</FormLabel>
                                <FormControl><Input placeholder="John Doe" className="h-12 rounded-xl" {...field} /></FormControl>
                                <FormMessage />
                              </FormItem>
                            )} />
                            <FormField control={donateForm.control} name="message" render={({ field }) => (
                              <FormItem>
                                <FormLabel>Message (Optional)</FormLabel>
                                <FormControl><Textarea className="resize-none rounded-xl" {...field} /></FormControl>
                                <FormMessage />
                              </FormItem>
                            )} />
                            <Button type="submit" className="w-full h-12 rounded-xl text-lg mt-2" disabled={donateMutation.isPending}>
                              {donateMutation.isPending ? "Processing..." : `Donate $${donateForm.watch('amount') || 0}`}
                            </Button>
                          </form>
                        </Form>
                      </DialogContent>
                    </Dialog>

                    <Dialog open={isVolunteerOpen} onOpenChange={setIsVolunteerOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="w-full h-12 text-lg rounded-xl border-2">
                          <Users className="w-5 h-5 mr-2" /> Volunteer
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md rounded-3xl">
                        <DialogHeader>
                          <DialogTitle className="text-2xl font-display">Join the Team</DialogTitle>
                          <DialogDescription>Offer your time and skills to support this cause.</DialogDescription>
                        </DialogHeader>
                        <Form {...volunteerForm}>
                          <form onSubmit={volunteerForm.handleSubmit((v) => volunteerMutation.mutate({ id: initiativeId, data: v }))} className="space-y-4 mt-4">
                            <FormField control={volunteerForm.control} name="name" render={({ field }) => (
                              <FormItem>
                                <FormLabel>Full Name</FormLabel>
                                <FormControl><Input className="h-12 rounded-xl" {...field} /></FormControl>
                                <FormMessage />
                              </FormItem>
                            )} />
                            <FormField control={volunteerForm.control} name="email" render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl><Input type="email" className="h-12 rounded-xl" {...field} /></FormControl>
                                <FormMessage />
                              </FormItem>
                            )} />
                            <FormField control={volunteerForm.control} name="skills" render={({ field }) => (
                              <FormItem>
                                <FormLabel>Your Skills (Optional)</FormLabel>
                                <FormControl><Input placeholder="e.g. Teaching, Design, Coding" className="h-12 rounded-xl" {...field} /></FormControl>
                                <FormMessage />
                              </FormItem>
                            )} />
                            <FormField control={volunteerForm.control} name="message" render={({ field }) => (
                              <FormItem>
                                <FormLabel>How can you help? (Optional)</FormLabel>
                                <FormControl><Textarea className="resize-none rounded-xl" {...field} /></FormControl>
                                <FormMessage />
                              </FormItem>
                            )} />
                            <Button type="submit" className="w-full h-12 rounded-xl text-lg mt-2" disabled={volunteerMutation.isPending}>
                              {volunteerMutation.isPending ? "Signing up..." : "Sign Up to Volunteer"}
                            </Button>
                          </form>
                        </Form>
                      </DialogContent>
                    </Dialog>
                  </div>

                  <div className="mt-6 pt-6 border-t flex items-center justify-between text-sm text-muted-foreground font-medium">
                    <span className="flex items-center gap-1.5"><Heart className="w-4 h-4 text-accent" /> {initiative.topDonors?.length || 0} Backers</span>
                    <span className="flex items-center gap-1.5"><Users className="w-4 h-4" /> {initiative.volunteerCount} Volunteers</span>
                  </div>
                </CardContent>
              </Card>

              {initiative.trustScore && (
                <Card className="rounded-3xl border-border/60 shadow-sm bg-white overflow-hidden">
                  <CardContent className="p-6">
                    <TrustBreakdown breakdown={initiative.trustScore.breakdown} overall={initiative.trustScore.overall} />
                  </CardContent>
                </Card>
              )}

              {initiative.topDonors && initiative.topDonors.length > 0 && (
                <Card className="rounded-3xl border-border/60 shadow-sm bg-white overflow-hidden">
                  <div className="bg-muted/30 px-6 py-4 border-b flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-yellow-500" />
                    <h3 className="font-bold text-foreground">Top Supporters</h3>
                  </div>
                  <div className="p-0">
                    {initiative.topDonors.map((donor, idx) => (
                      <div key={idx} className="flex items-center justify-between px-6 py-3 border-b last:border-0 hover:bg-muted/20 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                            idx === 0 ? 'bg-yellow-100 text-yellow-700' :
                            idx === 1 ? 'bg-gray-100 text-gray-600' :
                            idx === 2 ? 'bg-orange-100 text-orange-700' : 'bg-muted text-muted-foreground'
                          }`}>
                            #{donor.rank}
                          </div>
                          <span className="font-medium text-sm">{donor.donorName}</span>
                        </div>
                        <span className="font-bold text-primary">${donor.totalAmount.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
