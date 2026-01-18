import { useState } from "react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { endpoints } from "@/lib/api";
import { RefreshCcw } from "lucide-react";

interface GrantReattemptDialogProps {
    candidateId: number;
    candidateName: string;
    currentAttemptNumber: number;
    onSuccess: () => void;
}

export function GrantReattemptDialog({
    candidateId,
    candidateName,
    currentAttemptNumber,
    onSuccess,
}: GrantReattemptDialogProps) {
    const [open, setOpen] = useState(false);
    const [isGranting, setIsGranting] = useState(false);

    const handleGrantReattempt = async () => {
        setIsGranting(true);
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(
                endpoints.admin.grantReattempt(candidateId),
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) {
                throw new Error("Failed to grant re-attempt access");
            }

            const data = await response.json();
            console.log("Re-attempt granted:", data);

            setOpen(false);
            onSuccess();
        } catch (error) {
            console.error("Error granting re-attempt:", error);
            alert("Failed to grant re-attempt access. Please try again.");
        } finally {
            setIsGranting(false);
        }
    };

    return (
        <>
            <Button
                onClick={() => setOpen(true)}
                variant="outline"
                className="gap-2"
            >
                <RefreshCcw className="w-4 h-4" />
                Grant Re-Attempt
            </Button>

            <AlertDialog open={open} onOpenChange={setOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Grant Re-Attempt Access?</AlertDialogTitle>
                        <AlertDialogDescription asChild>
                            <div className="space-y-3 text-sm">
                                <p>
                                    You are about to grant <strong>{candidateName}</strong> permission to
                                    re-attempt the entire assessment.
                                </p>
                                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 space-y-2">
                                    <p className="font-medium text-amber-900">What will happen:</p>
                                    <ul className="list-disc list-inside text-amber-800 space-y-1">
                                        <li>Current scores will be archived (Attempt {currentAttemptNumber})</li>
                                        <li>Candidate will start from Round 1 again</li>
                                        <li>This will be marked as Attempt {currentAttemptNumber + 1}</li>
                                        <li>All previous attempt data will be preserved</li>
                                    </ul>
                                </div>
                                <p className="text-muted-foreground">
                                    The candidate will see a notification in their dashboard and can begin
                                    the re-attempt immediately.
                                </p>
                            </div>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isGranting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleGrantReattempt}
                            disabled={isGranting}
                            className="bg-primary"
                        >
                            {isGranting ? "Granting..." : "Yes, Grant Re-Attempt"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
