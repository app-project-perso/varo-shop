import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarClock, Users } from "lucide-react";
import { Espace } from "@/components/varo/Espace";
import { AbonnementInactif } from "@/components/varo/AbonnementInactif";
import { formatDate } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/tableau")({
  head: () => ({ meta: [{ title: "Tableau de bord — Varo" }, { name: "description", content: "Ta boutique en un coup d'œil." }] }),
  component: () => (
    <Espace roles={["proprietaire"]}>
      {(moi) =>
        !moi.abonnementActif ? (
          <AbonnementInactif moi={moi} />
        ) : (
          <div className="space-y-4">
            <h1 className="text-2xl font-extrabold text-primary">Bonjour {moi.nom ?? ""} 👋</h1>
            <div className="flex items-center gap-3 rounded-2xl bg-card p-4 shadow-sm">
              <CalendarClock className="h-6 w-6 text-success" aria-hidden />
              <p>
                {moi.abonnement?.statut === "essai" ? "Essai gratuit" : "Abonnement actif"} jusqu'au{" "}
                <strong>{formatDate(moi.abonnement?.date_fin)}</strong> ({moi.joursRestants} j restants).
              </p>
            </div>
            <Link to="/vendeurs" className="flex items-center gap-3 rounded-2xl bg-card p-4 font-semibold shadow-sm hover:bg-muted">
              <Users className="h-6 w-6 text-cta" aria-hidden /> Gérer mes vendeurs
            </Link>
            <p className="text-sm text-muted-foreground">Produits, stock et ventes arrivent bientôt.</p>
          </div>
        )
      }
    </Espace>
  ),
});
