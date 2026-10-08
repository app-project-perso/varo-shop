import { useQuery } from "@tanstack/react-query";
import { Download, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Moi } from "@/hooks/use-moi";
import { Button } from "@/components/ui/button";
import { formatAr, formatDate, formatDateHeure, telechargerCsv } from "@/lib/format";

export function AbonnementInactif({ moi }: { moi: Moi }) {
  const { data: params } = useQuery({
    queryKey: ["parametres_editeur"],
    queryFn: async () => (await supabase.from("parametres_editeur").select("prix_mensuel, instructions_paiement").maybeSingle()).data,
  });

  const exporter = async () => {
    const { data } = await supabase
      .from("roles_utilisateurs")
      .select("nom, telephone, role, actif, derniere_connexion")
      .eq("boutique_id", moi.boutique!.id);
    telechargerCsv("varo-utilisateurs.csv", [
      ["Nom", "Téléphone", "Rôle", "Statut", "Dernière connexion"],
      ...(data ?? []).map((u) => [u.nom, u.telephone, u.role, u.actif ? "Actif" : "Désactivé", formatDateHeure(u.derniere_connexion)]),
    ]);
  };

  const statut = moi.abonnement?.statut === "suspendu" ? "suspendu" : moi.abonnement ? "expiré" : "absent";

  return (
    <div className="mx-auto max-w-lg space-y-4 rounded-2xl bg-card p-6 shadow-sm">
      <div className="flex items-center gap-3">
        <Lock className="h-8 w-8 text-destructive" aria-hidden />
        <h1 className="text-xl font-bold">Ton abonnement n'est pas actif</h1>
      </div>
      <p className="text-muted-foreground">
        Statut : <strong className="text-foreground">{statut}</strong>
        {moi.abonnement && <> — fin le {formatDate(moi.abonnement.date_fin)}</>}. Tu peux encore consulter et exporter tes données, mais plus vendre ni modifier le stock.
      </p>
      {moi.role === "proprietaire" ? (
        <>
          <div className="rounded-xl bg-muted p-4 text-sm">
            <p className="font-semibold">Pour te réabonner ({formatAr(params?.prix_mensuel)} / mois)</p>
            <p className="mt-1 whitespace-pre-line">{params?.instructions_paiement}</p>
          </div>
          <Button variant="outline" size="xl" className="w-full" onClick={exporter}>
            <Download aria-hidden /> Exporter mes données (CSV)
          </Button>
        </>
      ) : (
        <p className="font-medium">Préviens le propriétaire de la boutique.</p>
      )}
    </div>
  );
}
