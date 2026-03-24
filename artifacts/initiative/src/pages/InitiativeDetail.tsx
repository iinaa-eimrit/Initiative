import { useState } from "react";
import { useParams, Link } from "wouter";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { MapPin, Calendar, User, Users, CheckCircle2, Circle, ArrowLeft, Trophy, Heart } from "lucide-react";
import { 
  useGetInitiative, 
  useDonateToInitiative, 
  useVolunteerForInitiative 
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
import { Separator } from "@/components/ui/separator";

const donateSchema = z.object({
  donorName: z.string().min(2, "Name is required"),
  amount: z.coerce.number().min(1, "Minimum $1"),
  message: z.string().optional(),
});

const volunteerSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Valid email is required"),
  message: z.string().optional(),
});

export default function InitiativeDetail() {
  const { id } = useParams<{ id: string }>();
  const initiativeId = parseInt(id || "0", 10);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [isDonateOpen, setIsDonateOpen] = useState(false);
  const [isVolunteerOpen, setIsVolunteerOpen] = useState(false);

  const { data: initiative, isLoading, error } = useGetInitiative(initiativeId);

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
    defaultValues: { name: "", email: "", message: "" }
  });

  if (isLoading) return <div className="min-h-screen pt-32 flex justify-center"><div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>;
  if (error || !initiative) return <div className="min-h-screen pt-32 text-center text-xl font-bold">Initiative not found</div>;

  const progressPercent = Math.min((initiative.fundingRaised / initiative.fundingGoal) * 100, 100);

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Hero Header */}
      <div className="w-full h-[40vh] md:h-[50vh] relative bg-secondary overflow-hidden">
        {initiative.imageUrl ? (
          <img src={initiative.imageUrl} alt={initiative.title} className="w-full h-full object-cover opacity-70" />
        ) : (
          /* Unsplash placeholder */
          <img 
            src={`https://images.unsplash.com/photo-1542838132-92c53300491e?w=1600&q=80`}
            alt="Community" 
            className="w-full h-full object-cover opacity-50" 
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent"></div>
        
        <div className="absolute bottom-0 left-0 w-full p-6 md:p-10">
          <div className="max-w-5xl mx-auto flex flex-col gap-4">
            <Link href="/initiatives" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors w-fit bg-white/50 backdrop-blur-md px-3 py-1 rounded-full mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to feed
            </Link>
            <div className="flex gap-2 mb-2">
              <Badge className="bg-primary hover:bg-primary/90 text-primary-foreground border-none text-sm px-3 py-1">{initiative.category}</Badge>
              <Badge variant="outline" className="bg-white/80 backdrop-blur text-foreground border-border text-sm px-3 py-1 capitalize">{initiative.status}</Badge>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-foreground max-w-4xl leading-tight">
              {initiative.title}
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <div className="grid lg:grid-cols-3 gap-12">
          
          {/* Main Content (Left 2/3) */}
          <div className="lg:col-span-2 space-y-12">
            
            {/* Meta bar */}
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

            {/* Description */}
            <section>
              <h2 className="text-2xl font-bold mb-4">About this initiative</h2>
              <div className="prose prose-lg prose-p:text-muted-foreground max-w-none whitespace-pre-wrap">
                {initiative.description}
              </div>
            </section>

            {/* Milestones */}
            <section>
              <h2 className="text-2xl font-bold mb-6">Action Plan & Milestones</h2>
              {initiative.milestones && initiative.milestones.length > 0 ? (
                <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
                  {initiative.milestones.map((milestone, i) => (
                    <div key={milestone.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-background bg-muted text-muted-foreground shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10"
                           style={{ 
                             backgroundColor: milestone.status === 'completed' ? 'hsl(var(--primary))' : milestone.status === 'active' ? 'hsl(var(--accent))' : '',
                             color: milestone.status !== 'pending' ? 'white' : ''
                           }}>
                        {milestone.status === 'completed' ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-4 h-4" />}
                      </div>
                      <Card className={`w-[calc(100%-3rem)] md:w-[calc(50%-2.5rem)] rounded-2xl border ${milestone.status === 'active' ? 'border-accent shadow-md shadow-accent/10' : 'border-border/50'}`}>
                        <CardContent className="p-5">
                          <div className="flex justify-between items-start mb-2">
                            <Badge variant="outline" className={`capitalize text-xs ${milestone.status === 'completed' ? 'text-primary border-primary/30' : ''}`}>
                              {milestone.status}
                            </Badge>
                            <span className="text-sm font-bold text-muted-foreground">${milestone.targetAmount.toLocaleString()}</span>
                          </div>
                          <h4 className="font-bold text-lg mb-1">{milestone.title}</h4>
                          <p className="text-sm text-muted-foreground">{milestone.description}</p>
                        </CardContent>
                      </Card>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-muted/30 p-8 rounded-2xl border border-dashed border-border text-center text-muted-foreground">
                  No milestones defined yet.
                </div>
              )}
            </section>
          </div>

          {/* Sidebar (Right 1/3) */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 space-y-6">
              
              {/* Funding Card */}
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
                  
                  <Progress value={progressPercent} className="h-3 mb-8 bg-muted" indicatorClassName="bg-primary" />

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
                                <FormLabel>Message of Support (Optional)</FormLabel>
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

              {/* Leaderboard */}
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
