import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/varo/Logo";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Varo — Ta caisse, ton stock, sous contrôle" },
      { name: "description", content: "Caisse et gestion de stock pour les petites boutiques de Madagascar." },
      { property: "og:title", content: "Varo — Ta caisse, ton stock, sous contrôle" },
      { property: "og:description", content: "Caisse et gestion de stock pour les petites boutiques de Madagascar." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Index,
});

function Index() {
  const navigate = useNavigate();
  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return;
      const { data: role } = await supabase.rpc("mon_role");
      const cible = role === "proprietaire" ? "/tableau" : role === "vendeur" ? "/caisse" : role === "admin_editeur" ? "/admin" : "/bienvenue";
      navigate({ to: cible });
    });
  }, [navigate]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-6 text-center">
      <Logo taille={80} />
      <h1 className="text-4xl font-extrabold text-primary">Varo</h1>
      <p className="max-w-sm text-lg text-muted-foreground">Ta caisse, ton stock, sous contrôle.</p>
      <div className="flex w-full max-w-xs flex-col gap-3">
        <Button asChild variant="cta" size="xl"><Link to="/auth">Commencer — 14 jours gratuits</Link></Button>
        <Button asChild variant="outline" size="xl"><Link to="/auth">Se connecter</Link></Button>
      </div>
    </main>
  );
}
