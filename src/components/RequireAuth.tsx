import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { isAuthenticated } from "../lib/api";
import { useToast } from "../hooks/use-toast";

interface RequireAuthProps {
    children: React.ReactNode;
}

const RequireAuth: React.FC<RequireAuthProps> = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { toast } = useToast();
    const [isChecking, setIsChecking] = useState(true);
    const [isAllowed, setIsAllowed] = useState(false);

    useEffect(() => {
        const checkAuth = () => {
            const authenticated = isAuthenticated();

            if (authenticated) {
                setIsAllowed(true);
            } else {
                toast({
                    title: "Authentication required",
                    description: "Please log in to access this page.",
                    variant: "destructive",
                });
                // Redirect to auth page, preserving the intended destination
                navigate("/auth", { state: { from: location }, replace: true });
            }
            setIsChecking(false);
        };

        checkAuth();
    }, [navigate, location, toast]);

    if (isChecking) {
        // You could render a loading spinner here if checking auth was async/slow
        return null;
    }

    if (!isAllowed) return null;

    return <>{children}</>;
};

export default RequireAuth;
