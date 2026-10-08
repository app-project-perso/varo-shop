import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/varo/Logo";
import { identifiantVersEmail } from "@/lib/format";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Connexion — Varo" },
      { name: "description", content: "Connecte-toi ou crée ta boutique sur Varo." },
      { property: "og:title", content: "Connexion — Varo" },
      { property: "og:description", content: "Connecte-toi ou crée ta boutique sur Varo." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

type Mode = "connexion" | "inscription" | "oubli";

function Erreur({ texte }: { texte: string }) {
  return (
    <p className="flex items-start gap-2 rounded-xl bg-destructive/10 p-3 text-sm font-medium text-destructive" role="alert">
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden /> {texte}
    </p>
  );
}
function Succes({ texte }: { texte: string }) {
  return (
    <p className="flex items-start gap-2 rounded-xl bg-success/10 p-3 text-sm font-medium text-success" role="status">
      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden /> {texte}
    </p>
  );
}

function traduire(msg: string): string {
  if (/invalid login/i.test(msg)) return "Identifiant ou mot de passe incorrect.";
  if (/not confirmed/i.test(msg)) return "Confirme d'abord ton email (regarde ta boîte de réception).";
  if (/already registered|already exists/i.test(msg)) return "Un compte existe déjà avec cet email.";
  if (/password/i.test(msg) && /(weak|short|least)/i.test(msg)) return "Mot de passe trop faible (8 caractères minimum).";
  return "Une erreur est survenue. Réessaie.";
}

function AuthPage() {
  const [mode, setMode] = useState<Mode>("connexion");
  const [nom, setNom] = useState("");
  const [identifiant, setIdentifiant] = useState("");
  const [mdp, setMdp] = useState("");
  const [erreur, setErreur] = useState("");
  const [succes, setSucces] = useState("");
  const [enCours, setEnCours] = useState(false);
  const navigate = useNavigate();
  const qc = useQueryClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) navigate({ to: "/" });
    });
  }, [navigate]);

  const soumettre = async (e: FormEvent) => {
    e.preventDefault();
    setErreur("");
    setSucces("");
    setEnCours(true);
    try {
      if (mode === "connexion") {
        const { error } = await supabase.auth.signInWithPassword({ email: identifiantVersEmail(identifiant), password: mdp });
        if (error) return setErreur(traduire(error.message));
        await supabase.rpc("noter_connexion");
        qc.clear();
        navigate({ to: "/" });
      } else if (mode === "inscription") {
        if (!nom.trim()) return setErreur("Ton nom est obligatoire.");
        if (!identifiant.includes("@")) return setErreur("Donne une adresse email valide.");
        if (mdp.length < 8) return setErreur("8 caractères minimum pour le mot de passe.");
        const { data, error } = await supabase.auth.signUp({
          email: identifiant.trim(),
          password: mdp,
          options: { emailRedirectTo: window.location.origin, data: { nom: nom.trim() } },
        });
        if (error) return setErreur(traduire(error.message));
        if (data.session) navigate({ to: "/bienvenue" });
        else setSucces("Compte créé. Ouvre l'email qu'on vient de t'envoyer pour confirmer ton adresse, puis connecte-toi.");
      } else {
        if (!identifiant.includes("@")) return setErreur("Donne l'email de ton compte. Vendeur ? Demande au propriétaire.");
        const { error } = await supabase.auth.resetPasswordForEmail(identifiant.trim(), {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) return setErreur(traduire(error.message));
        setSucces("Si un compte existe, tu vas recevoir un email pour choisir un nouveau mot de passe.");
      }
    } finally {
      setEnCours(false);
    }
  };

  const titre = mode === "connexion" ? "Connexion" : mode === "inscription" ? "Crée ton compte" : "Mot de passe oublié";

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <Logo taille={56} />
          <h1 className="text-2xl font-extrabold text-primary">{titre}</h1>
          {mode === "inscription" && <p className="text-sm text-muted-foreground">14 jours d'essai gratuit.</p>}
        </div>
        <form onSubmit={soumettre} className="space-y-4 rounded-2xl bg-card p-5 shadow-sm">
          {mode === "inscription" && (
            <div className="space-y-1.5">
              <Label htmlFor="nom">Ton nom</Label>
              <Input id="nom" className="h-12" value={nom} onChange={(e) => setNom(e.target.value)} autoComplete="name" />
            </div>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="id">{mode === "connexion" ? "Email ou téléphone" : "Email"}</Label>
            <Input id="id" className="h-12" value={identifiant} onChange={(e) => setIdentifiant(e.target.value)} autoComplete="username" inputMode={mode === "connexion" ? "text" : "email"} />
          </div>
          {mode !== "oubli" && (
            <div className="space-y-1.5">
              <Label htmlFor="mdp">Mot de passe</Label>
              <Input id="mdp" type="password" className="h-12" value={mdp} onChange={(e) => setMdp(e.target.value)} autoComplete={mode === "connexion" ? "current-password" : "new-password"} />
            </div>
          )}
          {erreur && <Erreur texte={erreur} />}
          {succes && <Succes texte={succes} />}
          <Button type="submit" variant="cta" size="xl" className="w-full" disabled={enCours}>
            {mode === "connexion" ? "Se connecter" : mode === "inscription" ? "Créer mon compte" : "Recevoir le lien"}
          </Button>
        </form>
        <div className="flex flex-col items-center gap-2 text-sm">
          {mode !== "connexion" && <button className="font-semibold text-primary underline" onClick={() => setMode("connexion")}>J'ai déjà un compte</button>}
          {mode === "connexion" && (
            <>
              <button className="font-semibold text-primary underline" onClick={() => setMode("inscription")}>Créer ma boutique</button>
              <button className="text-muted-foreground underline" onClick={() => setMode("oubli")}>Mot de passe oublié ?</button>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
