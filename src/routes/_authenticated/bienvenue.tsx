import { createFileRoute, Navigate, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { accueilPourRole, useMoi } from "@/hooks/use-moi";
import { Chargement } from "@/components/varo/Espace";
import { Logo } from "@/components/varo/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/_authenticated/bienvenue")({
  head: () => ({ meta: [{ title: "Crée ta boutique — Varo" }, { name: "description", content: "Crée ta boutique et démarre ton essai gratuit." }] }),
  component: Bienvenue,
});

function Bienvenue() {
  const { data: moi, isLoading } = useMoi();
  const [nom, setNom] = useState("");
  const [tel, setTel] = useState("");
  const [adresse, setAdresse] = useState("");
  const [erreur, setErreur] = useState("");
  const [enCours, setEnCours] = useState(false);
  const qc = useQueryClient();
  const navigate = useNavigate();

  if (isLoading || !moi) return <Chargement />;
  if (moi.role) return <Navigate to={accueilPourRole(moi.role)} />;

  const soumettre = async (e: FormEvent) => {
    e.preventDefault();
    if (!nom.trim()) return setErreur("Le nom de la boutique est obligatoire.");
    setEnCours(true);
    setErreur("");
    const { error } = await supabase.rpc("creer_boutique", {
      _nom: nom, _telephone: tel, _adresse: adresse, _nom_proprietaire: moi.nomMeta ?? "",
    });
    setEnCours(false);
    if (error) return setErreur(error.message || "Impossible de créer la boutique.");
    await qc.invalidateQueries({ queryKey: ["moi"] });
    navigate({ to: "/tableau" });
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-4">
      <form onSubmit={soumettre} className="w-full max-w-sm space-y-4 rounded-2xl bg-card p-5 shadow-sm">
        <div className="flex flex-col items-center gap-2 text-center">
          <Logo taille={48} />
          <h1 className="text-xl font-extrabold text-primary">Crée ta boutique</h1>
          <p className="text-sm text-muted-foreground">Ton essai gratuit de 14 jours commence maintenant.</p>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="nom">Nom de la boutique</Label>
          <Input id="nom" className="h-12" value={nom} onChange={(e) => setNom(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="tel">Téléphone (facultatif)</Label>
          <Input id="tel" className="h-12" inputMode="tel" value={tel} onChange={(e) => setTel(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="adr">Adresse (facultatif)</Label>
          <Input id="adr" className="h-12" value={adresse} onChange={(e) => setAdresse(e.target.value)} />
        </div>
        {erreur && <p className="flex gap-2 text-sm font-medium text-destructive" role="alert"><AlertCircle className="h-4 w-4" aria-hidden />{erreur}</p>}
        <Button type="submit" variant="cta" size="xl" className="w-full" disabled={enCours}>Créer ma boutique</Button>
      </form>
    </main>
  );
}
