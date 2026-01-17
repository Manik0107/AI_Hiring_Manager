import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { Sparkles, User, LayoutDashboard, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEffect, useState } from "react";

// Helper component to handle candidate link logic
function HeaderCandidateLink() {
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
      <DropdownMenuItem asChild>
        <Link to="/thank-you" className="cursor-pointer flex items-center whitespace-nowrap">
          <Sparkles className="w-4 h-4 mr-2 shrink-0" />
          View Results
        </Link>
      </DropdownMenuItem>
    );
  }

  return (
    <DropdownMenuItem asChild>
      <Link to="/interview/setup" className="cursor-pointer flex items-center whitespace-nowrap">
        <Sparkles className="w-4 h-4 mr-2 shrink-0" />
        Start Interview
      </Link>
    </DropdownMenuItem>
  );
}

export function Header() {
  const navigate = useNavigate();
  const [user, setUser] = useState<{ email: string; role: string; name?: string } | null>(null);

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/");
    // Reload to update header state
    window.location.reload();
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="section-container">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center overflow-hidden">
              <img src="/logo.png" alt="HireAI Logo" className="w-full h-full object-cover" />
            </div>
            <span className="font-semibold text-lg text-foreground">HireAI</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              How it Works
            </a>
            <a href="#benefits" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Benefits
            </a>
            <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Pricing
            </a>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {user ? (
              // User is logged in - show user dropdown
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-sm">{user.name || user.email.split('@')[0]}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5">
                    {/* <p className="text-sm font-medium">{user.email}</p> */}
                    <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
                  </div>
                  <DropdownMenuSeparator />

                  {/* Admin-only options */}
                  {user.role === "admin" && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link to="/dashboard" className="cursor-pointer">
                          <LayoutDashboard className="w-4 h-4 mr-2" />
                          Dashboard
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}

                  {/* Regular user options */}
                  {user.role === "candidate" && (
                    <>
                      {/* Check status to decide where to link */}
                      <HeaderCandidateLink />
                      <DropdownMenuSeparator />
                    </>
                  )}

                  {/* Settings for all users */}
                  <DropdownMenuItem asChild>
                    <Link to="/settings" className="cursor-pointer">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37-2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />

                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600">
                    <LogOut className="w-4 h-4 mr-2" />
                    Log Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              // User is not logged in - show sign in/get started buttons
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/sign-in">Sign In</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link to="/sign-up">Get Started</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
