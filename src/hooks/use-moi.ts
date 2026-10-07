import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type Role = "proprietaire" | "vendeur" | "admin_editeur";

export type Moi = {
  userId: string;
  email: string | null;
  nomMeta: string | null;
  role: Role | null;
  actif: boolean;
  nom: string | null;
  boutique: { id: string; nom: string } | null;
  abonnement: { statut: string; date_fin: string } | null;
  abonnementActif: boolean;
  joursRestants: number | null;
};

export function useMoi() {
  return useQuery({
    queryKey: ["moi"],
    queryFn: async (): Promise<Moi> => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) throw new Error("Non connecté");
      const { data: r } = await supabase
        .from("roles_utilisateurs")
        .select("role, actif, nom, boutique_id")
        .eq("user_id", u.user.id)
        .maybeSingle();
      let boutique = null;
      let abonnement = null;
      if (r?.boutique_id && r.actif) {
        const [b, a] = await Promise.all([
          supabase.from("boutiques").select("id, nom").eq("id", r.boutique_id).maybeSingle(),
          supabase.from("abonnements").select("statut, date_fin").eq("boutique_id", r.boutique_id).maybeSingle(),
        ]);
        boutique = b.data;
        abonnement = a.data;
      }
      const fin = abonnement ? new Date(abonnement.date_fin).getTime() : null;
      const abonnementActif = !!abonnement && ["essai", "actif"].includes(abonnement.statut) && fin! >= Date.now();
      return {
        userId: u.user.id,
        email: u.user.email ?? null,
        nomMeta: (u.user.user_metadata?.nom as string) ?? null,
        role: (r?.role as Role) ?? null,
        actif: r?.actif ?? false,
        nom: r?.nom ?? null,
        boutique,
        abonnement,
        abonnementActif,
        joursRestants: fin ? Math.ceil((fin - Date.now()) / 86400000) : null,
      };
    },
    staleTime: 30_000,
  });
}

export function accueilPourRole(role: Role | null): "/bienvenue" | "/tableau" | "/caisse" | "/admin" {
  if (role === "proprietaire") return "/tableau";
  if (role === "vendeur") return "/caisse";
  if (role === "admin_editeur") return "/admin";
  return "/bienvenue";
}
