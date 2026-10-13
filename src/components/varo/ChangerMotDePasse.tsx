import { useState, type FormEvent } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { KeyRound } from "lucide-react";
import { toast } from "sonner";
import { changerMonMotDePasse } from "@/lib/vendeurs.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "./Logo";

export function ChangerMotDePasse() {
  const changer = useServerFn(changerMonMotDePasse);
  const qc = useQueryClient();
  const [mdp, setMdp] = useState("");
  const [confirm, setConfirm] = useState("");
  const [erreur, setErreur] = useState("");
  const [enCours, setEnCours] = useState(false);

  const soumettre = async (e: FormEvent) => {
    e.preventDefault();
    setErreur("");
    if (mdp.length < 8) return setErreur("8 caractères minimum.");
    if (mdp !== confirm) return setErreur("Les deux mots de passe ne sont pas identiques.");
    setEnCours(true);
    try {
      await changer({ data: { motDePasse: mdp } });
      toast.success("Mot de passe changé");
      await qc.invalidateQueries({ queryKey: ["moi"] });
    } catch (err) {
      setErreur(err instanceof Error ? err.message : "Une erreur est survenue.");
    } finally {
      setEnCours(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-4">
      <form onSubmit={soumettre} className="w-full max-w-sm space-y-4 rounded-2xl bg-card p-5 shadow-sm">
        <div className="flex flex-col items-center gap-2 text-center">
          <Logo taille={48} />
          <h1 className="flex items-center gap-2 text-xl font-extrabold text-primary"><KeyRound className="h-5 w-5" aria-hidden /> Choisis ton mot de passe</h1>
          <p className="text-sm text-muted-foreground">Ton mot de passe actuel est provisoire. Choisis-en un nouveau pour continuer.</p>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="n1">Nouveau mot de passe</Label>
          <Input id="n1" type="password" className="h-12" value={mdp} onChange={(e) => setMdp(e.target.value)} autoComplete="new-password" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="n2">Confirme le mot de passe</Label>
          <Input id="n2" type="password" className="h-12" value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" />
        </div>
        {erreur && <p className="text-sm font-medium text-destructive" role="alert">⚠ {erreur}</p>}
        <Button type="submit" variant="cta" size="xl" className="w-full" disabled={enCours}>Enregistrer</Button>
      </form>
    </main>
  );
}
