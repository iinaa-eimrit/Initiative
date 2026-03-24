import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Rocket, Sparkles, CheckCircle2, DollarSign, Users, Target, Loader2 } from "lucide-react";
import { useCreateInitiative, useGenerateInitiativePlan } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const CATEGORIES = [
  { value: "education", label: "Education" },
  { value: "environment", label: "Environment" },
  { value: "healthcare", label: "Healthcare" },
  { value: "community", label: "Community" },
];

const formSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(100),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: z.string().min(1, "Please select a category"),
  location: z.string().min(2, "Location is required"),
  fundingGoal: z.coerce.number().min(0, "Goal must be positive"),
  creatorName: z.string().min(2, "Name is required"),
  imageUrl: z.string().url().optional().or(z.literal('')),
});

type GeneratedPlanType = {
  title: string;
  description: string;
  category: string;
  location: string;
  fundingGoal: number;
  structuredPlan: {
    problemStatement: string;
    executionSteps: string[];
    estimatedBudget: number;
    suggestedRoles: string[];
    milestonesTimeline: { title: string; description: string; targetAmount: number; durationWeeks: number }[];
  };
};

export default function CreateInitiative() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [step, setStep] = useState<"describe" | "preview" | "customize">("describe");
  const [ideaText, setIdeaText] = useState("");
  const [ideaCategory, setIdeaCategory] = useState("");
  const [generatedPlan, setGeneratedPlan] = useState<GeneratedPlanType | null>(null);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      location: "",
      fundingGoal: 1000,
      creatorName: "",
      imageUrl: "",
    },
  });

  const generatePlanMutation = useGenerateInitiativePlan({
    mutation: {
      onSuccess: (data: any) => {
        setGeneratedPlan(data);
        form.setValue("title", data.title);
        form.setValue("description", data.description);
        form.setValue("category", data.category);
        form.setValue("location", data.location);
        form.setValue("fundingGoal", data.fundingGoal);
        setStep("preview");
      },
      onError: () => {
        toast({ title: "Error", description: "Failed to generate plan. Try again.", variant: "destructive" });
      },
    },
  });

  const createMutation = useCreateInitiative({
    mutation: {
      onSuccess: (data) => {
        toast({ title: "Success!", description: "Your AI-structured initiative is live." });
        setLocation(`/initiatives/${data.id}`);
      },
      onError: () => {
        toast({ title: "Error", description: "Failed to create initiative.", variant: "destructive" });
      },
    },
  });

  const handleGenerate = () => {
    if (ideaText.length < 5) {
      toast({ title: "Too short", description: "Please describe your idea in more detail.", variant: "destructive" });
      return;
    }
    generatePlanMutation.mutate({
      data: { description: ideaText, category: ideaCategory || undefined },
    });
  };

  const handlePublish = (values: z.infer<typeof formSchema>) => {
    createMutation.mutate({
      data: {
        ...values,
        imageUrl: values.imageUrl || undefined,
        structuredPlan: generatedPlan?.structuredPlan ?? undefined,
        lifecycleStage: "idea",
      } as any,
    });
  };

  return (
    <div className="min-h-screen bg-muted/20 pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <button 
          onClick={() => step === "describe" ? setLocation("/initiatives") : setStep("describe")}
          className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          {step === "describe" ? "Back to feed" : "Start over"}
        </button>

        <AnimatePresence mode="wait">
          {step === "describe" && (
            <motion.div
              key="describe"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="mb-8">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-100 text-purple-700 font-medium text-sm mb-4">
                  <Sparkles className="w-3.5 h-3.5" /> AI-Powered
                </div>
                <h1 className="text-4xl font-bold mb-3">Describe your initiative</h1>
                <p className="text-lg text-muted-foreground">
                  Tell us your idea in plain English. Our AI will generate a structured plan with milestones, budget, and volunteer roles.
                </p>
              </div>

              <Card className="rounded-3xl border-border/60 shadow-xl overflow-hidden">
                <div className="h-2 w-full bg-gradient-to-r from-purple-500 via-primary to-teal-400"></div>
                <CardContent className="p-8 sm:p-10 space-y-6">
                  <div>
                    <label className="text-base font-semibold mb-2 block">What do you want to accomplish?</label>
                    <Textarea 
                      placeholder="e.g. Teach underprivileged kids math in rural areas, or Clean up plastic waste from local beaches..."
                      className="min-h-[160px] resize-y rounded-xl text-base"
                      value={ideaText}
                      onChange={(e) => setIdeaText(e.target.value)}
                    />
                    <p className="text-sm text-muted-foreground mt-2">Be as descriptive as you like. The more detail, the better the plan.</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">Category (optional)</label>
                    <Select value={ideaCategory} onValueChange={setIdeaCategory}>
                      <SelectTrigger className="h-12 rounded-xl w-full sm:w-64">
                        <SelectValue placeholder="Auto-detect from description" />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map(c => (
                          <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button 
                    size="lg" 
                    className="h-14 px-10 text-base rounded-full shadow-lg shadow-primary/25"
                    onClick={handleGenerate}
                    disabled={generatePlanMutation.isPending || ideaText.length < 5}
                  >
                    {generatePlanMutation.isPending ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin" /> Generating plan...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5" /> Generate Initiative Plan
                      </span>
                    )}
                  </Button>
                </CardContent>
              </Card>

              <div className="mt-8 text-center">
                <button 
                  onClick={() => setStep("customize")} 
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors underline"
                >
                  Or create manually without AI
                </button>
              </div>
            </motion.div>
          )}

          {step === "preview" && generatedPlan && (
            <motion.div
              key="preview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="mb-8">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-100 text-green-700 font-medium text-sm mb-4">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Plan Generated
                </div>
                <h1 className="text-4xl font-bold mb-3">Review your AI-generated plan</h1>
                <p className="text-lg text-muted-foreground">
                  Here's what our AI created. You can customize or publish directly.
                </p>
              </div>

              <div className="space-y-6">
                <Card className="rounded-3xl border-border/60 shadow-xl overflow-hidden">
                  <div className="h-2 w-full bg-gradient-to-r from-green-500 to-primary"></div>
                  <CardContent className="p-8">
                    <h2 className="text-2xl font-bold mb-2">{generatedPlan.title}</h2>
                    <div className="flex gap-2 mb-4">
                      <span className="px-3 py-1 rounded-full bg-muted text-sm font-medium capitalize">{generatedPlan.category}</span>
                      <span className="px-3 py-1 rounded-full bg-muted text-sm font-medium">{generatedPlan.location}</span>
                    </div>
                    <p className="text-muted-foreground mb-6">{generatedPlan.structuredPlan.problemStatement}</p>
                    
                    <div className="grid sm:grid-cols-2 gap-6 mb-8">
                      <div className="bg-green-50 p-5 rounded-2xl border border-green-100">
                        <DollarSign className="w-6 h-6 text-green-600 mb-2" />
                        <div className="text-2xl font-bold text-green-700">${generatedPlan.fundingGoal.toLocaleString()}</div>
                        <div className="text-sm text-green-600">Estimated budget</div>
                      </div>
                      <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100">
                        <Users className="w-6 h-6 text-blue-600 mb-2" />
                        <div className="text-2xl font-bold text-blue-700">{generatedPlan.structuredPlan.suggestedRoles.length}</div>
                        <div className="text-sm text-blue-600">Volunteer roles needed</div>
                      </div>
                    </div>

                    <div className="mb-8">
                      <h3 className="font-bold text-lg mb-3">Execution Plan</h3>
                      <div className="space-y-3">
                        {generatedPlan.structuredPlan.executionSteps.map((step, i) => (
                          <div key={i} className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                              {i + 1}
                            </div>
                            <p className="text-sm text-muted-foreground">{step}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mb-8">
                      <h3 className="font-bold text-lg mb-3">Milestones Timeline</h3>
                      <div className="space-y-3">
                        {generatedPlan.structuredPlan.milestonesTimeline.map((m, i) => (
                          <div key={i} className="flex items-center gap-4 p-4 bg-muted/30 rounded-xl border border-border/50">
                            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                              <Target className="w-5 h-5" />
                            </div>
                            <div className="flex-grow">
                              <div className="font-bold text-sm">{m.title}</div>
                              <div className="text-xs text-muted-foreground">{m.description}</div>
                            </div>
                            <div className="text-right shrink-0">
                              <div className="font-bold text-sm text-primary">${m.targetAmount.toLocaleString()}</div>
                              <div className="text-xs text-muted-foreground">{m.durationWeeks}w</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-bold text-lg mb-3">Suggested Volunteer Roles</h3>
                      <div className="flex flex-wrap gap-2">
                        {generatedPlan.structuredPlan.suggestedRoles.map((role, i) => (
                          <span key={i} className="px-3 py-1.5 bg-purple-50 text-purple-700 rounded-full text-sm font-medium border border-purple-100">
                            {role}
                          </span>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button 
                    size="lg" 
                    className="h-14 px-10 text-base rounded-full shadow-lg shadow-primary/25 flex-1"
                    onClick={() => setStep("customize")}
                  >
                    Customize & Publish <Rocket className="ml-2 w-5 h-5" />
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline"
                    className="h-14 px-10 text-base rounded-full border-2"
                    onClick={() => setStep("describe")}
                  >
                    Regenerate
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {step === "customize" && (
            <motion.div
              key="customize"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="mb-8">
                <h1 className="text-4xl font-bold mb-3">
                  {generatedPlan ? "Customize & publish" : "Create your initiative"}
                </h1>
                <p className="text-lg text-muted-foreground">
                  {generatedPlan ? "Make any final adjustments before going live." : "Fill out the details to launch your initiative."}
                </p>
              </div>

              <Card className="rounded-3xl border-border/60 shadow-xl overflow-hidden">
                <div className="h-2 w-full bg-gradient-to-r from-primary via-emerald-400 to-teal-400"></div>
                <CardContent className="p-8 sm:p-10">
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(handlePublish)} className="space-y-8">
                      <div className="space-y-6">
                        <h3 className="text-xl font-display font-semibold border-b pb-2">The Basics</h3>
                        
                        <FormField control={form.control} name="title" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base">Initiative Title</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. Clean the Local River" className="h-12 text-lg rounded-xl" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />

                        <FormField control={form.control} name="description" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base">Story & Description</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Tell people why this matters..." className="min-h-[120px] resize-y rounded-xl text-base" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />

                        <div className="grid sm:grid-cols-2 gap-6">
                          <FormField control={form.control} name="category" render={({ field }) => (
                            <FormItem>
                              <FormLabel>Category</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger className="h-12 rounded-xl">
                                    <SelectValue placeholder="Select category" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {CATEGORIES.map(c => (
                                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )} />

                          <FormField control={form.control} name="location" render={({ field }) => (
                            <FormItem>
                              <FormLabel>Location</FormLabel>
                              <FormControl>
                                <Input placeholder="City, State or 'Global'" className="h-12 rounded-xl" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                        </div>
                      </div>

                      <div className="space-y-6 pt-4">
                        <h3 className="text-xl font-display font-semibold border-b pb-2">Details</h3>
                        
                        <div className="grid sm:grid-cols-2 gap-6">
                          <FormField control={form.control} name="fundingGoal" render={({ field }) => (
                            <FormItem>
                              <FormLabel>Funding Goal ($)</FormLabel>
                              <FormControl>
                                <Input type="number" min="0" className="h-12 rounded-xl text-lg font-medium" {...field} />
                              </FormControl>
                              <FormDescription>Target amount needed to succeed.</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )} />

                          <FormField control={form.control} name="creatorName" render={({ field }) => (
                            <FormItem>
                              <FormLabel>Your Name / Org</FormLabel>
                              <FormControl>
                                <Input placeholder="Who is organizing this?" className="h-12 rounded-xl" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                        </div>

                        <FormField control={form.control} name="imageUrl" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Cover Image URL (Optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="https://example.com/image.jpg" className="h-12 rounded-xl" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                      </div>

                      <div className="pt-6">
                        <Button 
                          type="submit" 
                          size="lg" 
                          className="w-full sm:w-auto h-14 px-10 text-lg rounded-full shadow-lg shadow-primary/25"
                          disabled={createMutation.isPending}
                        >
                          {createMutation.isPending ? "Launching..." : (
                            <span className="flex items-center gap-2">
                              Launch Initiative <Rocket className="w-5 h-5" />
                            </span>
                          )}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
