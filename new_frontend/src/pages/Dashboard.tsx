import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { InterviewCard } from "@/components/dashboard/InterviewCard";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import {
  MessageSquare,
  Users,
  TrendingUp,
  Clock,
  Plus,
  Filter,
} from "lucide-react";
import { useEffect, useState } from "react";
import { endpoints } from "@/lib/api";

interface DashboardStats {
  total_interviews: number;
  active_candidates: number;
  avg_score: number;
  total_candidates: number;
}

interface Candidate {
  id: number;
  candidateName: string;
  email: string;
  role: string;
  status: "registered" | "in_progress" | "completed" | "pending";
  score: number | null;
  currentRound: number;
  round1Score: number | null;
  round2Score: number | null;
  round3Score: number | null;
  applicationDate: string | null;
  updatedAt: string | null;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is admin
    const user = localStorage.getItem("user");
    if (user) {
      const userData = JSON.parse(user);
      if (userData.role !== "admin") {
        navigate("/");
        return;
      }
    } else {
      navigate("/sign-in");
      return;
    }

    fetchDashboardData();
  }, [navigate]);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/sign-in");
        return;
      }

      // Fetch stats
      const statsResponse = await fetch(endpoints.dashboard.stats, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!statsResponse.ok) {
        throw new Error("Failed to fetch dashboard stats");
      }

      const statsData = await statsResponse.json();
      setStats(statsData);

      // Fetch candidates
      const candidatesResponse = await fetch(endpoints.dashboard.candidates, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!candidatesResponse.ok) {
        throw new Error("Failed to fetch candidates");
      }

      const candidatesData = await candidatesResponse.json();
      setCandidates(candidatesData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return `Today, ${date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      })}`;
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const statsCards = stats
    ? [
      {
        title: "Total Interviews",
        value: stats.total_interviews,
        change: { value: 0, label: "real-time data" },
        icon: MessageSquare,
      },
      {
        title: "Active Candidates",
        value: stats.active_candidates,
        change: { value: 0, label: "real-time data" },
        icon: Users,
      },
      {
        title: "Avg. Score",
        value: stats.avg_score > 0 ? `${stats.avg_score}%` : "N/A",
        change: { value: 0, label: "real-time data" },
        icon: TrendingUp,
      },
      {
        title: "Total Candidates",
        value: stats.total_candidates,
        change: { value: 0, label: "real-time data" },
        icon: Clock,
      },
    ]
    : [];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error: {error}</p>
          <Button onClick={fetchDashboardData}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <DashboardSidebar />
        <div className="flex-1 flex flex-col">
          <DashboardHeader
            title="Dashboard"
            subtitle="Overview of your hiring activity"
          />

          <main className="flex-1 p-4 md:p-6">
            {/* Stats Grid - Responsive */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {statsCards.map((stat) => (
                <StatsCard key={stat.title} {...stat} />
              ))}
            </div>

            {/* Recent Interviews */}
            <div className="card-elevated">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border-b border-border gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">
                    Recent Candidates
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {candidates.length > 0
                      ? "Your latest candidate activity"
                      : "No candidates yet"}
                  </p>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchDashboardData}
                    className="flex-1 sm:flex-none"
                  >
                    <Filter className="w-4 h-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              </div>

              {candidates.length > 0 ? (
                <>
                  <div className="divide-y divide-border">
                    {candidates.map((candidate) => (
                      <InterviewCard
                        key={candidate.id}
                        id={candidate.id.toString()}
                        candidateName={candidate.candidateName}
                        role={candidate.role}
                        status={candidate.status}
                        score={candidate.score || undefined}
                        date={formatDate(candidate.updatedAt)}
                        duration={
                          candidate.currentRound > 0
                            ? `Round ${candidate.currentRound}/3`
                            : undefined
                        }
                      />
                    ))}
                  </div>
                </>
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No candidates have signed up yet</p>
                  <p className="text-sm mt-2">
                    Candidates will appear here once they register
                  </p>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
