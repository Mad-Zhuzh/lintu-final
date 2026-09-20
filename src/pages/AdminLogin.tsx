import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const AdminLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user.app_metadata?.role === "admin" && !location.state?.demo) navigate("/admin", { replace: true });
    });
  }, [location.state, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (!error && data.user?.app_metadata?.role !== "admin") {
      await supabase.auth.signOut();
      setLoading(false);
      toast({
        title: "Нет доступа",
        description: "Для входа через форму нужна учётная запись администратора.",
        variant: "destructive",
      });
      return;
    }

    setLoading(false);

    if (error) {
      toast({
        title: "Не удалось войти",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    navigate("/admin", { replace: true });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b bg-card">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">L</span>
            </div>
            <span className="font-semibold text-lg">
              Lintu <span className="text-muted-foreground font-normal text-sm">/ Админ</span>
            </span>
          </Link>
          <Link
            to="/"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            На сайт
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold tracking-tight">Вход в админ-панель</h1>
            <p className="text-sm text-muted-foreground mt-1">
            Войдите под учётной записью администратора или посмотрите интерфейс в демо-режиме.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Пароль</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Входим…
                </>
              ) : (
                "Войти"
              )}
            </Button>
            <Button type="button" variant="outline" className="w-full" disabled={loading} onClick={() => navigate("/admin/demo")}>
              Посмотреть демо
            </Button>
          </form>
        </Card>
      </main>
    </div>
  );
};

export default AdminLogin;
