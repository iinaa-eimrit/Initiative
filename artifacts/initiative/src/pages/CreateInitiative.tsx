import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { ArrowLeft, Rocket } from "lucide-react";
import { useCreateInitiative } from "@workspace/api-client-react";
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

// Zod schema matching OpenAPI CreateInitiativeInput
const formSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(100),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: z.string().min(1, "Please select a category"),
  location: z.string().min(2, "Location is required"),
  fundingGoal: z.coerce.number().min(0, "Goal must be positive"),
  creatorName: z.string().min(2, "Name is required"),
  imageUrl: z.string().url().optional().or(z.literal('')),
});

const CATEGORIES = ["Environment", "Education", "Health", "Community", "Food", "Technology", "Other"];

export default function CreateInitiative() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
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

  const createMutation = useCreateInitiative({
    mutation: {
      onSuccess: (data) => {
        toast({
          title: "Success!",
          description: "Your initiative has been created.",
        });
        setLocation(`/initiatives/${data.id}`);
      },
      onError: (err) => {
        toast({
          title: "Error",
          description: "Failed to create initiative. Please try again.",
          variant: "destructive",
        });
      }
    }
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    // Convert empty string back to undefined for the API if needed, 
    // though schema allows nullable.
    const payload = {
      ...values,
      imageUrl: values.imageUrl || undefined
    };
    createMutation.mutate({ data: payload });
  };

  return (
    <div className="min-h-screen bg-muted/20 pt-24 pb-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <button 
          onClick={() => setLocation("/initiatives")}
          className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to feed
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-3">Launch something great.</h1>
            <p className="text-lg text-muted-foreground">
              Fill out the details below to start gathering support for your mission.
            </p>
          </div>

          <Card className="rounded-3xl border-border/60 shadow-xl shadow-black/5 overflow-hidden">
            <div className="h-2 w-full bg-gradient-to-r from-primary via-emerald-400 to-teal-400"></div>
            <CardContent className="p-8 sm:p-10">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                  
                  {/* Basics */}
                  <div className="space-y-6">
                    <h3 className="text-xl font-display font-semibold border-b pb-2">The Basics</h3>
                    
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base">Initiative Title</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Clean the Local River" className="h-12 text-lg rounded-xl" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base">Story & Description</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Tell people why this matters..." 
                              className="min-h-[150px] resize-y rounded-xl text-base" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid sm:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Category</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="h-12 rounded-xl">
                                  <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {CATEGORIES.map(c => (
                                  <SelectItem key={c} value={c}>{c}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="location"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Location</FormLabel>
                            <FormControl>
                              <Input placeholder="City, State or 'Global'" className="h-12 rounded-xl" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Funding & Media */}
                  <div className="space-y-6 pt-4">
                    <h3 className="text-xl font-display font-semibold border-b pb-2">Details</h3>
                    
                    <div className="grid sm:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="fundingGoal"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Funding Goal ($)</FormLabel>
                            <FormControl>
                              <Input type="number" min="0" className="h-12 rounded-xl text-lg font-medium" {...field} />
                            </FormControl>
                            <FormDescription>Target amount needed to succeed.</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="creatorName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Your Name / Org</FormLabel>
                            <FormControl>
                              <Input placeholder="Who is organizing this?" className="h-12 rounded-xl" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="imageUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cover Image URL (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="https://example.com/image.jpg" className="h-12 rounded-xl" {...field} />
                          </FormControl>
                          <FormDescription>Provide a direct link to an image to make your initiative stand out.</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
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
      </div>
    </div>
  );
}
