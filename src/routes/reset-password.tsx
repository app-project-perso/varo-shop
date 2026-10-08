import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/varo/Logo";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Nouveau mot de passe — Varo" },
      { name: "description", content: "Choisis un nouveau mot de passe pour ton compte Varo." },
      { property: "og:title", content: "Nouveau mot de passe — Varo" },
      { property: "og:description", content: "Choisis un nouveau mot de passe pour ton compte Varo." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ResetPage,
});

function ResetPage() {
  const [mdp, setMdp] = useState("");
  const [erreur, setErreur] = useState("");
  const navigate = useNavigate();

  const soumettre = async (e: FormEvent) => {
    e.preventDefault();
    if (mdp.length < 8) return setErreur("8 caractères minimum.");
    const { error } = await supabase.auth.updateUser({ password: mdp });
    if (error) return setErreur("Le lien a expiré. Redemande un email de réinitialisation.");
    navigate({ to: "/" });
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-4">
      <form onSubmit={soumettre} className="w-full max-w-sm space-y-4 rounded-2xl bg-card p-5 shadow-sm">
        <div className="flex flex-col items-center gap-2">
          <Logo taille={48} />
          <h1 className="text-xl font-extrabold text-primary">Nouveau mot de passe</h1>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="mdp">Mot de passe</Label>
          <Input id="mdp" type="password" className="h-12" value={mdp} onChange={(e) => setMdp(e.target.value)} autoComplete="new-password" />
          {erreur && <p className="text-sm font-medium text-destructive" role="alert">⚠ {erreur}</p>}
        </div>
        <Button type="submit" variant="cta" size="xl" className="w-full">Enregistrer</Button>
      </form>
    </main>
  );
}
