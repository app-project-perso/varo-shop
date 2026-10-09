-- ============ VARO — 0002 : durcissement de la sécurité ============
REVOKE ALL ON
  public.boutiques, public.roles_utilisateurs, public.categories, public.produits,
  public.mouvements_stock, public.sessions_caisse, public.ventes, public.lignes_vente,
  public.paiements, public.modes_paiement_boutique, public.depenses_caisse,
  public.abonnements, public.demandes_paiement, public.parametres_editeur
FROM anon, authenticated;

GRANT SELECT ON
  public.boutiques, public.roles_utilisateurs, public.categories, public.produits,
  public.mouvements_stock, public.sessions_caisse, public.ventes, public.lignes_vente,
  public.paiements, public.modes_paiement_boutique, public.depenses_caisse,
  public.abonnements, public.demandes_paiement, public.parametres_editeur
TO authenticated;
GRANT UPDATE ON public.boutiques TO authenticated;
GRANT INSERT, UPDATE ON public.categories, public.produits TO authenticated;
GRANT UPDATE ON public.modes_paiement_boutique TO authenticated;
GRANT INSERT ON public.demandes_paiement TO authenticated;
GRANT UPDATE ON public.parametres_editeur TO authenticated;

DROP POLICY "lecture sessions" ON public.sessions_caisse;
CREATE POLICY "lecture sessions" ON public.sessions_caisse FOR SELECT TO authenticated
  USING (
    public.est_admin()
    OR public.est_proprietaire_de(boutique_id)
    OR (boutique_id = public.ma_boutique() AND vendeur_id = auth.uid())
  );

DROP POLICY "lecture ventes" ON public.ventes;
CREATE POLICY "lecture ventes" ON public.ventes FOR SELECT TO authenticated
  USING (
    public.est_admin()
    OR public.est_proprietaire_de(boutique_id)
    OR (boutique_id = public.ma_boutique() AND vendeur_id = auth.uid())
  );

DROP POLICY "lecture lignes" ON public.lignes_vente;
CREATE POLICY "lecture lignes" ON public.lignes_vente FOR SELECT TO authenticated
  USING (
    public.est_admin()
    OR public.est_proprietaire_de(boutique_id)
    OR EXISTS (
      SELECT 1 FROM public.ventes v
      WHERE v.id = lignes_vente.vente_id
        AND v.boutique_id = public.ma_boutique()
        AND v.vendeur_id = auth.uid()
    )
  );

DROP POLICY "lecture paiements" ON public.paiements;
CREATE POLICY "lecture paiements" ON public.paiements FOR SELECT TO authenticated
  USING (
    public.est_admin()
    OR public.est_proprietaire_de(boutique_id)
    OR EXISTS (
      SELECT 1 FROM public.ventes v
      WHERE v.id = paiements.vente_id
        AND v.boutique_id = public.ma_boutique()
        AND v.vendeur_id = auth.uid()
    )
  );

DROP POLICY "lecture depenses" ON public.depenses_caisse;
CREATE POLICY "lecture depenses" ON public.depenses_caisse FOR SELECT TO authenticated
  USING (
    public.est_admin()
    OR public.est_proprietaire_de(boutique_id)
    OR (boutique_id = public.ma_boutique() AND utilisateur_id = auth.uid())
  );

DROP POLICY "lecture mouvements" ON public.mouvements_stock;
CREATE POLICY "lecture mouvements" ON public.mouvements_stock FOR SELECT TO authenticated
  USING (public.est_admin() OR public.est_proprietaire_de(boutique_id));

DROP POLICY "lecture roles" ON public.roles_utilisateurs;
CREATE POLICY "lecture roles" ON public.roles_utilisateurs FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR public.est_proprietaire_de(boutique_id)
    OR public.est_admin()
  );

DROP POLICY "lecture produits" ON public.produits;
CREATE POLICY "lecture produits" ON public.produits FOR SELECT TO authenticated
  USING (public.est_proprietaire_de(boutique_id) OR public.est_admin());

CREATE OR REPLACE VIEW public.produits_vente AS
SELECT
  id, boutique_id, categorie_id, nom, prix_vente, unite, seuil_alerte,
  stock_actuel, code, actif, remise_active, remise_type, remise_valeur
FROM public.produits
WHERE boutique_id = public.ma_boutique();

REVOKE ALL ON public.produits_vente FROM PUBLIC, anon;
GRANT SELECT ON public.produits_vente TO authenticated;

CREATE OR REPLACE FUNCTION public.verifier_categorie_produit()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.categorie_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM public.categories c
    WHERE c.id = NEW.categorie_id AND c.boutique_id = NEW.boutique_id
  ) THEN
    RAISE EXCEPTION 'Catégorie invalide pour cette boutique.';
  END IF;
  RETURN NEW;
END $$;

CREATE TRIGGER trg_categorie_produit BEFORE INSERT OR UPDATE ON public.produits
FOR EACH ROW EXECUTE FUNCTION public.verifier_categorie_produit();

CREATE INDEX IF NOT EXISTS roles_utilisateurs_boutique_idx ON public.roles_utilisateurs(boutique_id);
