import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import type { Session } from "@supabase/supabase-js";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Props {
  children: React.ReactNode;
}

const RequireAuth = ({ children }: Props) => {
  const location = useLocation();
  const [session, setSession] = useState<Session | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    // Set up listener BEFORE getting current session
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
    });

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setChecked(true);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  if (!checked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }

  return <>{children}</>;
};

export default RequireAuth;
