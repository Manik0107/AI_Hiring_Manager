import { Navigate } from "react-router-dom";
import { ReactNode } from "react";

interface ProtectedRouteProps {
    children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
    // Check if user is logged in by checking for token in localStorage
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");

    // If no token or user, redirect to sign in
    if (!token || !user) {
        return <Navigate to="/sign-in" replace />;
    }

    // User is authenticated, render the protected content
    return <>{children}</>;
}
