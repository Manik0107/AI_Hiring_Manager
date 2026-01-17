import { Clock, Scale, TrendingUp, Shield, Users, Zap } from "lucide-react";

const benefits = [
  {
    icon: Clock,
    title: "Save 70% Time",
    description: "Eliminate scheduling back-and-forth. Candidates interview on their schedule, you review when ready.",
  },
  {
    icon: Scale,
    title: "Reduce Bias",
    description: "Standardized questions and AI-powered evaluation ensure every candidate gets a fair assessment.",
  },
  {
    icon: TrendingUp,
    title: "Scale Effortlessly",
    description: "Interview 100 candidates as easily as 10. No interviewer fatigue, no capacity constraints.",
  },
  {
    icon: Shield,
    title: "Consistent Quality",
    description: "Every interview follows your criteria. No variation based on interviewer mood or schedule.",
  },
  {
    icon: Users,
    title: "Better Experience",
    description: "Candidates interview when they're at their best. No stress about interviewer availability.",
  },
  {
    icon: Zap,
    title: "Instant Results",
    description: "Get detailed evaluation reports immediately after each interview. Speed up your pipeline.",
  },
];

export function Benefits() {
  return (
    <section id="benefits" className="py-20 lg:py-32">
      <div className="section-container">
        {/* Section header */}
        <div className="max-w-2xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Why Teams Choose HireAI
          </h2>
          <p className="text-lg text-muted-foreground">
            Modern hiring demands modern solutions
          </p>
        </div>

        {/* Benefits grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((benefit) => (
            <div
              key={benefit.title}
              className="group p-6 rounded-xl border border-border hover:border-primary/20 hover:bg-accent/50 transition-all duration-300"
            >
              {/* Icon */}
              <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors">
                <benefit.icon className="w-5 h-5 text-accent-foreground group-hover:text-primary transition-colors" />
              </div>

              {/* Content */}
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {benefit.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
