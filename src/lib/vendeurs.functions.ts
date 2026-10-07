import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

type Ctx = { supabase: any; userId: string };

/** Vérifie côté serveur que l'appelant est propriétaire actif d'une boutique à abonnement actif. */
async function verifierProprietaire(ctx: Ctx): Promise<string> {
  const { data: role } = await ctx.supabase.rpc("mon_role");
  if (role !== "proprietaire") throw new Error("Action réservée au propriétaire.");
  const { data: boutiqueId } = await ctx.supabase.rpc("ma_boutique");
  if (!boutiqueId) throw new Error("Boutique introuvable.");
  const { data: actif } = await ctx.supabase.rpc("abonnement_actif", { _boutique: boutiqueId });
  if (!actif) throw new Error("Ton abonnement n'est pas actif.");
  return boutiqueId as string;
}

const schemaVendeur = z.object({
  nom: z.string().trim().min(1, "Le nom est obligatoire.").max(100),
  telephone: z.string().trim().max(30).optional().default(""),
  email: z.string().trim().max(255).optional().default(""),
  motDePasse: z.string().min(8, "8 caractères minimum.").max(72),
});

export const creerVendeur = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => schemaVendeur.parse(d))
  .handler(async ({ data, context }) => {
    // 1. L'appelant doit être propriétaire d'une boutique à abonnement actif
    const boutiqueId = await verifierProprietaire(context);

    // 2. Identifiant de connexion : email, sinon téléphone
    const chiffres = data.telephone.replace(/[^\d]/g, "");
    let email = data.email.toLowerCase();
    if (email) {
      if (!z.string().email().safeParse(email).success) throw new Error("Email invalide.");
    } else {
      if (chiffres.length < 9) throw new Error("Donne un téléphone ou un email.");
      email = `${chiffres}@tel.varo.app`;
    }

    // 3. Création du compte avec la clé de service (serveur uniquement)
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: cree, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: data.motDePasse,
      email_confirm: true,
      user_metadata: { nom: data.nom },
    });
    if (error || !cree.user) {
      const msg = error?.message ?? "";
      if (/already|exists|registered/i.test(msg)) throw new Error("Ce téléphone ou cet email est déjà utilisé.");
      throw new Error("Impossible de créer le vendeur.");
    }

    // 4. Rôle « vendeur » rattaché uniquement à la boutique de l'appelant (jamais choisie par le client)
    const { error: errRole } = await supabaseAdmin.from("roles_utilisateurs").insert({
      user_id: cree.user.id,
      boutique_id: boutiqueId,
      role: "vendeur",
      actif: true,
      nom: data.nom,
      telephone: data.telephone || null,
    });
    if (errRole) {
      await supabaseAdmin.auth.admin.deleteUser(cree.user.id);
      throw new Error("Impossible de créer le vendeur.");
    }
    return { id: cree.user.id, identifiant: data.email || data.telephone };
  });

export const reinitialiserMotDePasseVendeur = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ vendeurId: z.string().uuid(), motDePasse: z.string().min(8, "8 caractères minimum.").max(72) }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const boutiqueId = await verifierProprietaire(context);
    // Le vendeur doit appartenir à la boutique de l'appelant
    const { data: v } = await context.supabase
      .from("roles_utilisateurs")
      .select("user_id")
      .eq("user_id", data.vendeurId)
      .eq("boutique_id", boutiqueId)
      .eq("role", "vendeur")
      .maybeSingle();
    if (!v) throw new Error("Vendeur introuvable dans ta boutique.");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.auth.admin.updateUserById(data.vendeurId, { password: data.motDePasse });
    if (error) throw new Error("Impossible de changer le mot de passe.");
    return { ok: true };
  });
