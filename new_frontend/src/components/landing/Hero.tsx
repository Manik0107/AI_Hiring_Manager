import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Play, CheckCircle2 } from "lucide-react";
import { useState, useEffect } from "react";

const benefits = [
  "Reduce hiring time by 70%",
  "Eliminate scheduling conflicts",
  "Consistent evaluation criteria",
];

// Helper component for Hero button
function HeroButton() {
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const response = await fetch("http://localhost:8000/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setStatus(data.candidate_status);
        }
      } catch (e) {
        console.error(e);
      }
    };
    checkStatus();
  }, []);

  if (status === "completed") {
    return (
      <Button variant="hero" size="xl" asChild>
        <Link to="/thank-you">
          View Results
          <ArrowRight className="w-4 h-4 ml-2" />
        </Link>
      </Button>
    );
  }

  return (
    <Button variant="hero" size="xl" asChild>
      <Link to="/interview/setup">
        Start Interview
        <ArrowRight className="w-4 h-4 ml-2" />
      </Link>
    </Button>
  );
}

export function Hero() {
  return (
    <section className="pt-32 pb-20 lg:pt-40 lg:pb-32">
      <div className="section-container">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent text-accent-foreground text-sm font-medium mb-6 animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse-soft" />
            AI-Powered Interview Platform
          </div>

          {/* Headline */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 tracking-tight text-balance animate-fade-in">
            AI Interviews That{" "}
            <span className="text-primary">Scale Your Hiring</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 text-balance animate-fade-in">
            Automate candidate interviews, get instant scoring, and shortlist top talent—without the scheduling hassle.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12 animate-fade-in">
            <HeroButton />
            <Button variant="hero-outline" size="xl" asChild>
              <Link to="/demo">
                <Play className="w-4 h-4" />
                Watch Demo
              </Link>
            </Button>
          </div>

          {/* Trust points */}
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm text-muted-foreground animate-fade-in">
            {benefits.map((benefit) => (
              <div key={benefit} className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-success" />
                <span>{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
