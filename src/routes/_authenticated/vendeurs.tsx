import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { CheckCircle2, KeyRound, Plus, UserX, UserCheck, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Espace } from "@/components/varo/Espace";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { creerVendeur, reinitialiserMotDePasseVendeur } from "@/lib/vendeurs.functions";
import { formatDateHeure } from "@/lib/format";
import type { Moi } from "@/hooks/use-moi";

export const Route = createFileRoute("/_authenticated/vendeurs")({
  head: () => ({ meta: [{ title: "Vendeurs — Varo" }, { name: "description", content: "Gère les vendeurs de ta boutique." }] }),
  component: () => <Espace roles={["proprietaire"]} ecriture>{(moi) => <Vendeurs moi={moi} />}</Espace>,
});

function messageErreur(e: unknown) {
  return e instanceof Error ? e.message : "Une erreur est survenue.";
}

function Vendeurs({ moi }: { moi: Moi }) {
  const qc = useQueryClient();
  const [creation, setCreation] = useState(false);
  const [reset, setReset] = useState<{ id: string; nom: string } | null>(null);
  const { data: vendeurs } = useQuery({
    queryKey: ["vendeurs", moi.boutique?.id],
    queryFn: async () =>
      (await supabase.from("roles_utilisateurs").select("user_id, nom, telephone, actif, derniere_connexion")
        .eq("boutique_id", moi.boutique!.id).eq("role", "vendeur").order("created_at")).data ?? [],
  });

  const basculer = async (id: string, actif: boolean) => {
    const { error } = await supabase.rpc("changer_statut_vendeur", { _vendeur: id, _actif: actif });
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(actif ? "Vendeur réactivé" : "Vendeur désactivé");
    qc.invalidateQueries({ queryKey: ["vendeurs"] });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-2xl font-extrabold text-primary">Vendeurs</h1>
        <Button variant="cta" size="lg" className="h-12 rounded-2xl" onClick={() => setCreation(true)}>
          <Plus aria-hidden /> Ajouter
        </Button>
      </div>
      {vendeurs?.length === 0 && <p className="rounded-2xl bg-card p-6 text-center text-muted-foreground shadow-sm">Aucun vendeur pour l'instant.</p>}
      <ul className="space-y-3">
        {vendeurs?.map((v) => (
          <li key={v.user_id} className="flex flex-wrap items-center gap-3 rounded-2xl bg-card p-4 shadow-sm">
            <div className="min-w-0 flex-1">
              <p className="font-bold">{v.nom}</p>
              <p className="text-sm text-muted-foreground">{v.telephone ?? "—"} · Dernière connexion : {formatDateHeure(v.derniere_connexion)}</p>
              <p className={`mt-1 inline-flex items-center gap-1 text-xs font-semibold ${v.actif ? "text-success" : "text-destructive"}`}>
                {v.actif ? <CheckCircle2 className="h-3.5 w-3.5" aria-hidden /> : <UserX className="h-3.5 w-3.5" aria-hidden />}
                {v.actif ? "Actif" : "Désactivé"}
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => setReset({ id: v.user_id, nom: v.nom ?? "" })}>
              <KeyRound aria-hidden /> Mot de passe
            </Button>
            <Button variant="outline" size="sm" onClick={() => basculer(v.user_id, !v.actif)}>
              {v.actif ? <><UserX aria-hidden /> Désactiver</> : <><UserCheck aria-hidden /> Réactiver</>}
            </Button>
          </li>
        ))}
      </ul>
      <CreationDialog ouvert={creation} fermer={() => setCreation(false)} />
      <ResetDialog cible={reset} fermer={() => setReset(null)} />
    </div>
  );
}

function CreationDialog({ ouvert, fermer }: { ouvert: boolean; fermer: () => void }) {
  const creer = useServerFn(creerVendeur);
  const qc = useQueryClient();
  const [f, setF] = useState({ nom: "", telephone: "", email: "", motDePasse: "" });
  const [erreur, setErreur] = useState("");
  const [enCours, setEnCours] = useState(false);

  const soumettre = async (e: FormEvent) => {
    e.preventDefault();
    setErreur("");
    if (!f.nom.trim()) return setErreur("Le nom est obligatoire.");
    if (!f.telephone.trim() && !f.email.trim()) return setErreur("Donne un téléphone ou un email.");
    if (f.motDePasse.length < 8) return setErreur("Mot de passe provisoire : 8 caractères minimum.");
    setEnCours(true);
    try {
      await creer({ data: f });
      toast.success(`${f.nom} peut se connecter avec ${f.email || f.telephone}`);
      setF({ nom: "", telephone: "", email: "", motDePasse: "" });
      qc.invalidateQueries({ queryKey: ["vendeurs"] });
      fermer();
    } catch (err) {
      setErreur(messageErreur(err));
    } finally {
      setEnCours(false);
    }
  };

  return (
    <Dialog open={ouvert} onOpenChange={(o) => !o && fermer()}>
      <DialogContent>
        <DialogHeader><DialogTitle>Nouveau vendeur</DialogTitle></DialogHeader>
        <form onSubmit={soumettre} className="space-y-3">
          {(["nom", "telephone", "email"] as const).map((k) => (
            <div key={k} className="space-y-1.5">
              <Label htmlFor={k}>{k === "nom" ? "Nom" : k === "telephone" ? "Téléphone" : "Email (facultatif)"}</Label>
              <Input id={k} className="h-12" value={f[k]} inputMode={k === "telephone" ? "tel" : k === "email" ? "email" : "text"} onChange={(e) => setF({ ...f, [k]: e.target.value })} />
            </div>
          ))}
          <div className="space-y-1.5">
            <Label htmlFor="mdp">Mot de passe provisoire</Label>
            <Input id="mdp" className="h-12" value={f.motDePasse} onChange={(e) => setF({ ...f, motDePasse: e.target.value })} />
            <p className="text-xs text-muted-foreground">Le vendeur se connecte avec son email, ou son téléphone s'il n'a pas d'email.</p>
          </div>
          {erreur && <p className="flex gap-2 text-sm font-medium text-destructive" role="alert"><AlertCircle className="h-4 w-4" aria-hidden />{erreur}</p>}
          <Button type="submit" variant="cta" size="xl" className="w-full" disabled={enCours}>Créer le vendeur</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ResetDialog({ cible, fermer }: { cible: { id: string; nom: string } | null; fermer: () => void }) {
  const reinit = useServerFn(reinitialiserMotDePasseVendeur);
  const [mdp, setMdp] = useState("");
  const [erreur, setErreur] = useState("");

  const soumettre = async (e: FormEvent) => {
    e.preventDefault();
    if (mdp.length < 8) return setErreur("8 caractères minimum.");
    try {
      await reinit({ data: { vendeurId: cible!.id, motDePasse: mdp } });
      toast.success("Mot de passe changé");
      setMdp("");
      fermer();
    } catch (err) {
      setErreur(messageErreur(err));
    }
  };

  return (
    <Dialog open={!!cible} onOpenChange={(o) => !o && fermer()}>
      <DialogContent>
        <DialogHeader><DialogTitle>Nouveau mot de passe pour {cible?.nom}</DialogTitle></DialogHeader>
        <form onSubmit={soumettre} className="space-y-3">
          <Input className="h-12" value={mdp} onChange={(e) => setMdp(e.target.value)} placeholder="Mot de passe provisoire" />
          {erreur && <p className="text-sm font-medium text-destructive" role="alert">⚠ {erreur}</p>}
          <Button type="submit" variant="cta" size="xl" className="w-full">Enregistrer</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
