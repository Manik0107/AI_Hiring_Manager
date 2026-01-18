import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { endpoints } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Sparkles,
  MessageSquare,
  Mic,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";

const steps = [
  { id: 1, title: "Role Details", description: "Define the position" },
  { id: 2, title: "Interview Rounds", description: "3 rounds overview" },
  { id: 3, title: "Review", description: "Confirm settings" },
];

const interviewRounds = [
  {
    id: 1,
    title: "Aptitude Test",
    description: "Logical reasoning & problem solving MCQs",
    icon: FileText,
    questions: 5,
    duration: "10 mins",
  },
  {
    id: 2,
    title: "DSA Assessment",
    description: "Data structures & algorithms MCQs",
    icon: MessageSquare,
    questions: 5,
    duration: "10 mins",
  },
  {
    id: 3,
    title: "Voice Interview",
    description: "One-on-one conversation with AI interviewer",
    icon: Mic,
    questions: 6,
    duration: "15-20 mins",
  },
];

export default function InterviewSetup() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    candidateName: "",
    candidateEmail: "",
    role: "",
    department: "",
    skills: "",
    interviewType: "text",
    duration: "30",
  });

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        if (!token) return;

        const response = await fetch(endpoints.auth.me, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          // If completed, redirect to thank you
          if (data.candidate_status === "completed") {
            navigate("/thank-you");
          }
          // Pre-fill candidate name if available
          if (data.full_name) {
            setFormData(prev => ({ ...prev, candidateName: data.full_name }));
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    checkStatus();
  }, [navigate]);

  const updateFormData = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    if (currentStep < 3) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = () => {
    // Start with round 1 (Aptitude)
    navigate("/interview/round?round=1");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="section-container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" asChild>
                <Link to="/dashboard">
                  <ArrowLeft className="w-5 h-5" />
                </Link>
              </Button>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-primary-foreground" />
                </div>
                <span className="font-semibold text-lg">New Interview</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="section-container py-8">
        <div className="max-w-2xl mx-auto">
          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <div
                  key={step.id}
                  className="flex items-center flex-1"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                        currentStep > step.id
                          ? "bg-primary text-primary-foreground"
                          : currentStep === step.id
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                      )}
                    >
                      {currentStep > step.id ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        step.id
                      )}
                    </div>
                    <div className="hidden sm:block">
                      <p
                        className={cn(
                          "text-sm font-medium",
                          currentStep >= step.id
                            ? "text-foreground"
                            : "text-muted-foreground"
                        )}
                      >
                        {step.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {step.description}
                      </p>
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={cn(
                        "flex-1 h-0.5 mx-4",
                        currentStep > step.id ? "bg-primary" : "bg-border"
                      )}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Step Content */}
          <div className="card-elevated p-6">
            {currentStep === 1 && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <h2 className="text-xl font-semibold text-foreground mb-1">
                    Role Details
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Enter the candidate and position information
                  </p>
                </div>

                <div className="grid gap-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="candidateName">Candidate Name</Label>
                      <Input
                        id="candidateName"
                        placeholder="John Smith"
                        value={formData.candidateName}
                        onChange={(e) =>
                          updateFormData("candidateName", e.target.value)
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="candidateEmail">Candidate Email</Label>
                      <Input
                        id="candidateEmail"
                        type="email"
                        placeholder="john@example.com"
                        value={formData.candidateEmail}
                        onChange={(e) =>
                          updateFormData("candidateEmail", e.target.value)
                        }
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="role">Role Title</Label>
                      <Input
                        id="role"
                        placeholder="Senior Frontend Engineer"
                        value={formData.role}
                        onChange={(e) => updateFormData("role", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="department">Department</Label>
                      <Select
                        value={formData.department}
                        onValueChange={(value) =>
                          updateFormData("department", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="engineering">Engineering</SelectItem>
                          <SelectItem value="product">Product</SelectItem>
                          <SelectItem value="design">Design</SelectItem>
                          <SelectItem value="marketing">Marketing</SelectItem>
                          <SelectItem value="sales">Sales</SelectItem>
                          <SelectItem value="operations">Operations</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="skills">Key Skills to Assess</Label>
                    <Textarea
                      id="skills"
                      placeholder="React, TypeScript, System Design, Communication..."
                      value={formData.skills}
                      onChange={(e) => updateFormData("skills", e.target.value)}
                      rows={3}
                    />
                    <p className="text-xs text-muted-foreground">
                      Separate skills with commas. These will guide the interview questions.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <h2 className="text-xl font-semibold text-foreground mb-1">
                    Interview Rounds
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    The candidate will go through 3 sequential rounds
                  </p>
                </div>

                <div className="space-y-4">
                  {interviewRounds.map((round, index) => (
                    <div
                      key={round.id}
                      className="flex items-start gap-4 p-4 rounded-lg border border-border bg-muted/30"
                    >
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="text-sm font-bold text-primary">
                          {round.id}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <round.icon className="w-4 h-4 text-muted-foreground" />
                          <p className="font-medium text-foreground">
                            {round.title}
                          </p>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {round.description}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>{round.questions} questions</span>
                          <span>•</span>
                          <span>{round.duration}</span>
                        </div>
                      </div>
                      {index < interviewRounds.length - 1 && (
                        <div className="absolute left-9 top-14 w-0.5 h-4 bg-border" />
                      )}
                    </div>
                  ))}
                </div>

                <div className="p-4 rounded-lg bg-accent/50 border border-accent">
                  <p className="text-sm text-foreground">
                    <strong>Note:</strong> All rounds must be completed in sequence.
                    Results will be available after the voice interview round.
                  </p>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <h2 className="text-xl font-semibold text-foreground mb-1">
                    Review & Confirm
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Verify the interview settings before starting
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-muted/50 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Candidate
                      </span>
                      <span className="text-sm font-medium text-foreground">
                        {formData.candidateName || "Not specified"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Email
                      </span>
                      <span className="text-sm font-medium text-foreground">
                        {formData.candidateEmail || "Not specified"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Role
                      </span>
                      <span className="text-sm font-medium text-foreground">
                        {formData.role || "Not specified"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Department
                      </span>
                      <span className="text-sm font-medium text-foreground capitalize">
                        {formData.department || "Not specified"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Interview Rounds
                      </span>
                      <span className="text-sm font-medium text-foreground">
                        3 Rounds (Aptitude → DSA → Voice)
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Estimated Duration
                      </span>
                      <span className="text-sm font-medium text-foreground">
                        35-40 minutes
                      </span>
                    </div>
                  </div>

                  {formData.skills && (
                    <div className="p-4 rounded-lg bg-muted/50">
                      <p className="text-sm text-muted-foreground mb-2">
                        Skills to Assess
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {formData.skills.split(",").map((skill, i) => (
                          <span
                            key={i}
                            className="px-2 py-1 rounded-md bg-accent text-accent-foreground text-xs font-medium"
                          >
                            {skill.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between pt-6 mt-6 border-t border-border">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              {currentStep < 3 ? (
                <Button onClick={nextStep}>
                  Continue
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button onClick={handleSubmit}>
                  Start Interview
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
