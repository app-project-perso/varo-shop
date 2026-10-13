import { supabase } from "@/integrations/supabase/client";

/**
 * Deux chemins de lecture des produits, imposés par la base :
 * - propriétaire (et admin) : table `produits`, avec prix d'achat ;
 * - caisse (vendeur ET propriétaire en train de vendre) : vue `produits_vente`, sans prix d'achat.
 * Un vendeur qui lirait `produits` reçoit une liste vide (règle d'accès).
 */
export async function lireProduitsGestion(boutiqueId: string) {
  const { data, error } = await supabase.from("produits").select("*").eq("boutique_id", boutiqueId).order("nom");
  if (error) throw error;
  return data;
}

export async function lireProduitsCaisse() {
  const { data, error } = await supabase.from("produits_vente").select("*").eq("actif", true).order("nom");
  if (error) throw error;
  return data;
}
