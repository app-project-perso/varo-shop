import { Link, Navigate, useNavigate } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, LogOut, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { accueilPourRole, useMoi, type Role, type Moi } from "@/hooks/use-moi";
import { Logo } from "./Logo";
import { Button } from "@/components/ui/button";
import { AbonnementInactif } from "./AbonnementInactif";

const NAV: Record<Role, { to: string; label: string }[]> = {
  proprietaire: [
    { to: "/tableau", label: "Tableau de bord" },
    { to: "/caisse", label: "Caisse" },
    { to: "/vendeurs", label: "Vendeurs" },
  ],
  vendeur: [{ to: "/caisse", label: "Caisse" }],
  admin_editeur: [{ to: "/admin", label: "Admin" }],
};

export function Chargement() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background text-muted-foreground">
      <Loader2 className="h-6 w-6 animate-spin" aria-hidden />
      <span className="ml-2">Chargement…</span>
    </div>
  );
}

/**
 * Cadre des écrans connectés. Le masquage des écrans est un confort :
 * la sécurité vient des règles d'accès en base et des fonctions serveur.
 */
export function Espace({
  roles,
  ecriture = false,
  children,
}: {
  roles: Role[];
  /** Écran qui permet d'écrire : bloqué si l'abonnement n'est pas actif */
  ecriture?: boolean;
  children: (moi: Moi) => ReactNode;
}) {
  const { data: moi, isLoading } = useMoi();
  const qc = useQueryClient();
  const navigate = useNavigate();

  if (isLoading || !moi) return <Chargement />;
  if (!moi.role) return <Navigate to="/bienvenue" />;
  if (!moi.actif) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background p-6 text-center">
        <AlertTriangle className="h-10 w-10 text-warning" aria-hidden />
        <p className="text-lg font-semibold">Ton compte est désactivé. Contacte le propriétaire de la boutique.</p>
        <Button variant="outline" onClick={() => supabase.auth.signOut()}>Se déconnecter</Button>
      </div>
    );
  }
  if (!roles.includes(moi.role)) return <Navigate to={accueilPourRole(moi.role)} />;

  const deconnexion = async () => {
    await supabase.auth.signOut();
    qc.clear();
    navigate({ to: "/auth" });
  };

  const bloque = ecriture && moi.role !== "admin_editeur" && !moi.abonnementActif;
  const bientot = moi.abonnementActif && moi.joursRestants !== null && moi.joursRestants <= 3 && moi.role === "proprietaire";

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-primary text-primary-foreground">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3">
          <Logo taille={34} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-base font-bold">{moi.boutique?.nom ?? "Varo"}</p>
            <p className="truncate text-xs opacity-75">{moi.nom ?? moi.email}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={deconnexion} className="text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground">
            <LogOut aria-hidden /> Quitter
          </Button>
        </div>
        {NAV[moi.role].length > 1 && (
          <nav className="mx-auto flex max-w-5xl gap-1 overflow-x-auto px-2 pb-2">
            {NAV[moi.role].map((n) => (
              <Link
                key={n.to}
                to={n.to}
                className="whitespace-nowrap rounded-xl px-4 py-2 text-sm font-semibold opacity-80 hover:opacity-100"
                activeProps={{ className: "bg-cta text-cta-foreground opacity-100" }}
              >
                {n.label}
              </Link>
            ))}
          </nav>
        )}
      </header>
      {bientot && (
        <div className="bg-warning/20 px-4 py-2 text-center text-sm font-medium text-foreground">
          <AlertTriangle className="mr-1 inline h-4 w-4" aria-hidden />
          Ton abonnement se termine dans {moi.joursRestants} jour{moi.joursRestants! > 1 ? "s" : ""}.
        </div>
      )}
      <main className="mx-auto max-w-5xl p-4">{bloque ? <AbonnementInactif moi={moi} /> : children(moi)}</main>
    </div>
  );
}
