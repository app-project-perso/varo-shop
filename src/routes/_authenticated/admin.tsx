import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Espace } from "@/components/varo/Espace";
import { formatDate } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "Admin — Varo" }, { name: "description", content: "Espace éditeur Varo." }] }),
  component: () => <Espace roles={["admin_editeur"]}>{() => <Boutiques />}</Espace>,
});

function Boutiques() {
  const { data } = useQuery({
    queryKey: ["admin_boutiques"],
    queryFn: async () => (await supabase.from("boutiques").select("id, nom, created_at, abonnements(statut, date_fin)").order("created_at", { ascending: false })).data ?? [],
  });
  return (
    <div className="space-y-3">
      <h1 className="text-2xl font-extrabold text-primary">Boutiques</h1>
      {data?.map((b: any) => (
        <div key={b.id} className="rounded-2xl bg-card p-4 shadow-sm">
          <p className="font-bold">{b.nom}</p>
          <p className="text-sm text-muted-foreground">
            Inscrite le {formatDate(b.created_at)} · {b.abonnements?.statut ?? "—"} jusqu'au {formatDate(b.abonnements?.date_fin)}
          </p>
        </div>
      ))}
    </div>
  );
}
