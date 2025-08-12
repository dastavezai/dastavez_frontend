import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authAPI, User } from "../lib/api";
import { useToast } from "../hooks/use-toast";

interface RequireAdminProps {
  children: React.ReactNode;
}

const RequireAdmin: React.FC<RequireAdminProps> = ({ children }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAuthorizing, setIsAuthorizing] = useState(true);
  const [isAllowed, setIsAllowed] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function checkAccess() {
      try {
        const user: User = await authAPI.getCurrentUser();

        const isAdmin = Boolean(
          (user as any)?.isAdmin === true ||
          (user as any)?.admin === true ||
          (user as any)?.role === "admin" ||
          Array.isArray((user as any)?.roles) && (user as any).roles.includes("admin")
        );

        const isVerified = Boolean(
          (user as any)?.isVerified === true ||
          (user as any)?.verified === true ||
          (user as any)?.emailVerified === true ||
          (user as any)?.isEmailVerified === true
        );

        const allowed = isAdmin && isVerified;
        if (isMounted) {
          setIsAllowed(allowed);
          if (!allowed) {
            toast({
              title: "Access denied",
              description: "Admin access requires a verified admin account.",
              variant: "destructive",
            });
            navigate("/auth", { replace: true });
          }
        }
      } catch (error) {
        if (isMounted) {
          toast({
            title: "Please sign in",
            description: "You must be signed in with a verified admin account to continue.",
          });
          navigate("/auth", { replace: true });
        }
      } finally {
        if (isMounted) setIsAuthorizing(false);
      }
    }

    checkAccess();
    return () => {
      isMounted = false;
    };
  }, [navigate, toast]);

  if (isAuthorizing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-slate-300">Checking admin access…</div>
      </div>
    );
  }

  if (!isAllowed) return null;

  return <>{children}</>;
};

export default RequireAdmin;


