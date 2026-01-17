import { MessageSquare, BarChart3, UserCheck } from "lucide-react";

const steps = [
  {
    icon: MessageSquare,
    step: "01",
    title: "AI Conducts Interview",
    description: "Our AI interviewer asks tailored questions based on the role, adapting in real-time to candidate responses.",
  },
  {
    icon: BarChart3,
    step: "02",
    title: "Instant Evaluation",
    description: "Get comprehensive scoring across skills, communication, problem-solving, and cultural fit—immediately after the interview.",
  },
  {
    icon: UserCheck,
    step: "03",
    title: "Smart Recommendations",
    description: "Receive hire/pass recommendations with detailed insights, making your final decision faster and data-driven.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 lg:py-32 bg-muted/50">
      <div className="section-container">
        {/* Section header */}
        <div className="max-w-2xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            How It Works
          </h2>
          <p className="text-lg text-muted-foreground">
            Three simple steps from interview to hire decision
          </p>
        </div>

        {/* Steps grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div
              key={step.title}
              className="relative bg-card rounded-xl p-8 border border-border shadow-soft hover:shadow-elevated transition-shadow duration-300"
            >
              {/* Step number */}
              <div className="absolute -top-3 -left-3 w-10 h-10 rounded-lg bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                {step.step}
              </div>

              {/* Icon */}
              <div className="w-12 h-12 rounded-lg bg-accent flex items-center justify-center mb-6">
                <step.icon className="w-6 h-6 text-accent-foreground" />
              </div>

              {/* Content */}
              <h3 className="text-xl font-semibold text-foreground mb-3">
                {step.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {step.description}
              </p>

              {/* Connector line (except last) */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-4 w-8 border-t-2 border-dashed border-border" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
