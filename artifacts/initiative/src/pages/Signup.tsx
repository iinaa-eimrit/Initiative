import { useState } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { UserPlus, Mail, Lock, User, Sparkles, Briefcase } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const SKILL_OPTIONS = [
  "Teaching", "Design", "Engineering", "Marketing", "Finance",
  "Healthcare", "Legal", "Writing", "Photography", "Data Analysis",
  "Project Management", "Community Outreach", "Research", "Leadership",
];

export default function Signup() {
  const { signup } = useAuth();
  const [, navigate] = useLocation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("changemaker");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [bio, setBio] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signup({
        name,
        email,
        password,
        role,
        skills: selectedSkills.join(", ") || undefined,
        bio: bio || undefined,
      });
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pt-28 pb-20 flex items-center justify-center relative">
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-mesh opacity-30 pointer-events-none" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg mx-4 relative z-10"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold">Join Initiative</h1>
          <p className="text-muted-foreground mt-2">Create your account and start making an impact</p>
        </div>

        <Card className="rounded-3xl border-border/50 shadow-xl">
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-3 rounded-xl bg-destructive/10 text-destructive text-sm font-medium text-center">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="pl-10 h-12 rounded-xl"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Role</label>
                  <Select value={role} onValueChange={setRole}>
                    <SelectTrigger className="h-12 rounded-xl">
                      <Briefcase className="w-4 h-4 mr-2 text-muted-foreground" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="changemaker">Changemaker</SelectItem>
                      <SelectItem value="volunteer">Volunteer</SelectItem>
                      <SelectItem value="donor">Donor</SelectItem>
                      <SelectItem value="organizer">Organizer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-12 rounded-xl"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="password"
                    placeholder="At least 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 h-12 rounded-xl"
                    required
                    minLength={6}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Skills & Interests</label>
                <div className="flex flex-wrap gap-2">
                  {SKILL_OPTIONS.map((skill) => (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => toggleSkill(skill)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                        selectedSkills.includes(skill)
                          ? "bg-primary text-white shadow-sm"
                          : "bg-muted/50 text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      {skill}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Bio <span className="text-muted-foreground">(optional)</span></label>
                <Textarea
                  placeholder="Tell us about yourself and your passion for social impact..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="rounded-xl min-h-[80px]"
                />
              </div>

              <Button
                type="submit"
                className="w-full h-12 rounded-xl text-base font-medium"
                disabled={loading}
              >
                {loading ? "Creating account..." : (
                  <>
                    <UserPlus className="w-4 h-4 mr-2" /> Create Account
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="text-primary font-medium hover:underline">
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
