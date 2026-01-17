import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Home, FileText } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ThankYou() {
    const navigate = useNavigate();
    const [candidateId, setCandidateId] = useState<number | null>(null);

    useEffect(() => {
        // Get candidate ID for viewing results
        const fetchCandidateId = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    navigate("/sign-in");
                    return;
                }

                const response = await fetch("http://localhost:8000/auth/me", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    setCandidateId(data.id);
                }
            } catch (error) {
                console.error("Error fetching candidate ID:", error);
            }
        };

        fetchCandidateId();
    }, [navigate]);

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="max-w-2xl w-full">
                {/* Success Icon */}
                <div className="flex justify-center mb-8">
                    <div className="w-24 h-24 rounded-full bg-emerald-50 flex items-center justify-center">
                        <CheckCircle2 className="w-16 h-16 text-emerald-600" />
                    </div>
                </div>

                {/* Thank You Message */}
                <div className="card-elevated p-8 text-center">
                    <h1 className="text-3xl font-bold text-foreground mb-4">
                        Thank You for Completing Your Interview!
                    </h1>

                    <p className="text-lg text-muted-foreground mb-6">
                        We appreciate the time you've taken to complete all interview rounds.
                        Our team will review your performance and get back to you soon.
                    </p>

                    <div className="bg-muted/50 rounded-lg p-6 mb-8">
                        <h2 className="font-semibold text-foreground mb-2">What's Next?</h2>
                        <ul className="text-sm text-muted-foreground space-y-2 text-left max-w-md mx-auto">
                            <li className="flex items-start gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                                <span>Our hiring team will review your interview results</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                                <span>You'll receive feedback within 3-5 business days</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                                <span>Check your email for updates on your application status</span>
                            </li>
                        </ul>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Button asChild variant="default" size="lg">
                            <Link to="/">
                                <Home className="w-5 h-5 mr-2" />
                                Back to Home
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Footer Note */}
                <p className="text-center text-sm text-muted-foreground mt-6">
                    If you have any questions, please don't hesitate to contact us at{" "}
                    <a href="mailto:hr@company.com" className="text-primary hover:underline">
                        hr@company.com
                    </a>
                </p>
            </div>
        </div>
    );
}
