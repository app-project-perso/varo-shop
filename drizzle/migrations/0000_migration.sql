-- ============ VARO — Phase 0 : schéma, sécurité, fonctions utilitaires ============

-- ---------- Tables ----------
CREATE TABLE public.boutiques (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  nom text NOT NULL CHECK (length(trim(nom)) > 0),
  logo_url text,
  telephone text,
  adresse text,
  devise text NOT NULL DEFAULT 'MGA',
  entete_ticket text,
  pied_ticket text,
  proprietaire_id uuid NOT NULL,
  compteur_ticket integer NOT NULL DEFAULT 0 CHECK (compteur_ticket >= 0)
);

CREATE TABLE public.roles_utilisateurs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  user_id uuid NOT NULL UNIQUE,
  boutique_id uuid REFERENCES public.boutiques(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('proprietaire','vendeur','admin_editeur')),
  actif boolean NOT NULL DEFAULT true,
  nom text,
  telephone text,
  derniere_connexion timestamptz,
  CHECK ((role = 'admin_editeur' AND boutique_id IS NULL) OR (role <> 'admin_editeur' AND boutique_id IS NOT NULL))
);
CREATE UNIQUE INDEX un_proprietaire_par_boutique ON public.roles_utilisateurs(boutique_id) WHERE role = 'proprietaire';

CREATE TABLE public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  boutique_id uuid NOT NULL REFERENCES public.boutiques(id) ON DELETE CASCADE,
  nom text NOT NULL CHECK (length(trim(nom)) > 0),
  active boolean NOT NULL DEFAULT true
);
CREATE UNIQUE INDEX categories_nom_unique ON public.categories(boutique_id, lower(trim(nom)));

CREATE TABLE public.produits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  boutique_id uuid NOT NULL REFERENCES public.boutiques(id) ON DELETE CASCADE,
  categorie_id uuid REFERENCES public.categories(id),
  nom text NOT NULL CHECK (length(trim(nom)) > 0),
  prix_vente integer NOT NULL CHECK (prix_vente >= 0),
  prix_achat integer NOT NULL DEFAULT 0 CHECK (prix_achat >= 0),
  unite text NOT NULL DEFAULT 'pièce',
  seuil_alerte integer NOT NULL DEFAULT 0 CHECK (seuil_alerte >= 0),
  stock_actuel integer NOT NULL DEFAULT 0 CHECK (stock_actuel >= 0),
  code text,
  actif boolean NOT NULL DEFAULT true,
  remise_active boolean NOT NULL DEFAULT false,
  remise_type text CHECK (remise_type IN ('pourcentage','prix_promo')),
  remise_valeur integer CHECK (remise_valeur >= 0),
  CHECK (remise_active = false OR (remise_type IS NOT NULL AND remise_valeur IS NOT NULL)),
  CHECK (remise_type IS DISTINCT FROM 'pourcentage' OR remise_valeur <= 100),
  CHECK (remise_type IS DISTINCT FROM 'prix_promo' OR remise_valeur <= prix_vente)
);
CREATE UNIQUE INDEX produits_nom_unique ON public.produits(boutique_id, lower(trim(nom)));

CREATE TABLE public.sessions_caisse (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  boutique_id uuid NOT NULL REFERENCES public.boutiques(id) ON DELETE CASCADE,
  vendeur_id uuid NOT NULL,
  ouverte_le timestamptz NOT NULL DEFAULT now(),
  cloturee_le timestamptz,
  fond_caisse integer NOT NULL DEFAULT 0 CHECK (fond_caisse >= 0),
  especes_attendues integer,
  especes_comptees integer CHECK (especes_comptees >= 0),
  ecart integer,
  motif_ecart text,
  statut text NOT NULL DEFAULT 'ouverte' CHECK (statut IN ('ouverte','cloturee'))
);
CREATE UNIQUE INDEX une_session_ouverte_par_vendeur ON public.sessions_caisse(vendeur_id) WHERE statut = 'ouverte';

CREATE TABLE public.ventes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  boutique_id uuid NOT NULL REFERENCES public.boutiques(id) ON DELETE CASCADE,
  session_id uuid NOT NULL REFERENCES public.sessions_caisse(id),
  vendeur_id uuid NOT NULL,
  numero_ticket integer NOT NULL CHECK (numero_ticket > 0),
  total integer NOT NULL CHECK (total >= 0),
  statut text NOT NULL DEFAULT 'validee' CHECK (statut IN ('validee','annulee')),
  motif_annulation text,
  annulee_par uuid,
  annulee_le timestamptz,
  UNIQUE (boutique_id, numero_ticket)
);

CREATE TABLE public.lignes_vente (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  boutique_id uuid NOT NULL REFERENCES public.boutiques(id) ON DELETE CASCADE,
  vente_id uuid NOT NULL REFERENCES public.ventes(id),
  produit_id uuid NOT NULL REFERENCES public.produits(id),
  quantite integer NOT NULL CHECK (quantite > 0),
  prix_normal integer NOT NULL CHECK (prix_normal >= 0),
  remise_montant integer NOT NULL DEFAULT 0 CHECK (remise_montant >= 0),
  prix_final_unitaire integer NOT NULL CHECK (prix_final_unitaire >= 0)
);

CREATE TABLE public.mouvements_stock (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  boutique_id uuid NOT NULL REFERENCES public.boutiques(id) ON DELETE CASCADE,
  produit_id uuid NOT NULL REFERENCES public.produits(id),
  type text NOT NULL CHECK (type IN ('stock_initial','entree','vente','ajustement','retour')),
  quantite integer NOT NULL CHECK (quantite <> 0),
  utilisateur_id uuid NOT NULL,
  motif text CHECK (motif IN ('inventaire','casse','perte','vol','autre')),
  commentaire text,
  vente_id uuid REFERENCES public.ventes(id),
  CHECK (type <> 'ajustement' OR motif IS NOT NULL),
  CHECK (type NOT IN ('stock_initial','entree','retour') OR quantite > 0),
  CHECK (type <> 'vente' OR quantite < 0)
);

CREATE TABLE public.paiements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  boutique_id uuid NOT NULL REFERENCES public.boutiques(id) ON DELETE CASCADE,
  vente_id uuid NOT NULL REFERENCES public.ventes(id),
  mode text NOT NULL CHECK (mode IN ('especes','mvola','airtel_money','orange_money')),
  montant integer NOT NULL CHECK (montant > 0),
  reference text,
  numero_client text,
  frais integer NOT NULL DEFAULT 0 CHECK (frais >= 0),
  CHECK (mode = 'especes' OR (reference IS NOT NULL AND length(trim(reference)) > 0))
);

CREATE TABLE public.modes_paiement_boutique (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  boutique_id uuid NOT NULL REFERENCES public.boutiques(id) ON DELETE CASCADE,
  mode text NOT NULL CHECK (mode IN ('especes','mvola','airtel_money','orange_money')),
  active boolean NOT NULL DEFAULT false,
  taux_frais numeric(5,2) NOT NULL DEFAULT 0 CHECK (taux_frais >= 0 AND taux_frais <= 100),
  UNIQUE (boutique_id, mode)
);

CREATE TABLE public.depenses_caisse (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  boutique_id uuid NOT NULL REFERENCES public.boutiques(id) ON DELETE CASCADE,
  session_id uuid NOT NULL REFERENCES public.sessions_caisse(id),
  utilisateur_id uuid NOT NULL,
  type text NOT NULL CHECK (type IN ('depense','retrait')),
  montant integer NOT NULL CHECK (montant > 0),
  motif text NOT NULL CHECK (length(trim(motif)) > 0)
);

CREATE TABLE public.abonnements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  boutique_id uuid NOT NULL UNIQUE REFERENCES public.boutiques(id) ON DELETE CASCADE,
  statut text NOT NULL CHECK (statut IN ('essai','actif','expire','suspendu')),
  date_debut timestamptz NOT NULL DEFAULT now(),
  date_fin timestamptz NOT NULL,
  plan text NOT NULL DEFAULT 'standard'
);

CREATE TABLE public.demandes_paiement (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  boutique_id uuid NOT NULL REFERENCES public.boutiques(id) ON DELETE CASCADE,
  montant integer NOT NULL CHECK (montant > 0),
  reference text NOT NULL CHECK (length(trim(reference)) > 0),
  mode text NOT NULL CHECK (mode IN ('mvola','airtel_money','orange_money','autre')),
  statut text NOT NULL DEFAULT 'en_attente' CHECK (statut IN ('en_attente','validee','refusee')),
  traitee_par uuid,
  traitee_le timestamptz
);

CREATE TABLE public.parametres_editeur (
  id boolean PRIMARY KEY DEFAULT true CHECK (id),
  created_at timestamptz NOT NULL DEFAULT now(),
  prix_mensuel integer NOT NULL CHECK (prix_mensuel >= 0),
  duree_essai_jours integer NOT NULL DEFAULT 14 CHECK (duree_essai_jours > 0),
  instructions_paiement text
);
INSERT INTO public.parametres_editeur (prix_mensuel, duree_essai_jours, instructions_paiement)
VALUES (30000, 14, 'Envoie le montant de ton abonnement par mobile money puis clique sur « J''ai payé » avec la référence de la transaction.');

-- Index boutique
CREATE INDEX ON public.categories(boutique_id);
CREATE INDEX ON public.produits(boutique_id);
CREATE INDEX ON public.mouvements_stock(boutique_id, produit_id, created_at);
CREATE INDEX ON public.sessions_caisse(boutique_id);
CREATE INDEX ON public.ventes(boutique_id, created_at);
CREATE INDEX ON public.ventes(session_id);
CREATE INDEX ON public.lignes_vente(vente_id);
CREATE INDEX ON public.paiements(vente_id);
CREATE INDEX ON public.paiements(boutique_id, reference);
CREATE INDEX ON public.depenses_caisse(session_id);
CREATE INDEX ON public.demandes_paiement(boutique_id);

-- ---------- Fonctions utilitaires (SECURITY DEFINER, search_path fixé) ----------
CREATE OR REPLACE FUNCTION public.ma_boutique()
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT boutique_id FROM public.roles_utilisateurs
  WHERE user_id = auth.uid() AND actif = true LIMIT 1
$$;

CREATE OR REPLACE FUNCTION public.mon_role()
RETURNS text LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT role FROM public.roles_utilisateurs
  WHERE user_id = auth.uid() AND actif = true LIMIT 1
$$;

CREATE OR REPLACE FUNCTION public.est_admin()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT coalesce(public.mon_role() = 'admin_editeur', false)
$$;

CREATE OR REPLACE FUNCTION public.est_proprietaire_de(_boutique uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT coalesce(public.mon_role() = 'proprietaire' AND public.ma_boutique() = _boutique, false)
$$;

CREATE OR REPLACE FUNCTION public.abonnement_actif(_boutique uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.abonnements
    WHERE boutique_id = _boutique AND statut IN ('essai','actif') AND date_fin >= now()
  )
$$;

REVOKE EXECUTE ON FUNCTION public.ma_boutique(), public.mon_role(), public.est_admin(),
  public.est_proprietaire_de(uuid), public.abonnement_actif(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.ma_boutique(), public.mon_role(), public.est_admin(),
  public.est_proprietaire_de(uuid), public.abonnement_actif(uuid) TO authenticated, service_role;

-- ---------- Déclencheurs de protection ----------
-- Champs sensibles : modifiables uniquement par les fonctions serveur (pas par les rôles client)
CREATE OR REPLACE FUNCTION public.proteger_champs_produit()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF current_user IN ('authenticated','anon') THEN
    IF TG_OP = 'INSERT' AND NEW.stock_actuel <> 0 THEN
      RAISE EXCEPTION 'Le stock ne peut pas être saisi directement : utilise un mouvement de stock.';
    END IF;
    IF TG_OP = 'UPDATE' AND (NEW.stock_actuel IS DISTINCT FROM OLD.stock_actuel
                             OR NEW.boutique_id IS DISTINCT FROM OLD.boutique_id) THEN
      RAISE EXCEPTION 'Le stock ne se modifie jamais directement : utilise un mouvement de stock.';
    END IF;
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER trg_proteger_produit BEFORE INSERT OR UPDATE ON public.produits
FOR EACH ROW EXECUTE FUNCTION public.proteger_champs_produit();

CREATE OR REPLACE FUNCTION public.proteger_champs_boutique()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF current_user IN ('authenticated','anon') AND (
       NEW.compteur_ticket IS DISTINCT FROM OLD.compteur_ticket
    OR NEW.proprietaire_id IS DISTINCT FROM OLD.proprietaire_id) THEN
    RAISE EXCEPTION 'Champ non modifiable.';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER trg_proteger_boutique BEFORE UPDATE ON public.boutiques
FOR EACH ROW EXECUTE FUNCTION public.proteger_champs_boutique();

CREATE OR REPLACE FUNCTION public.proteger_boutique_id()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.boutique_id IS DISTINCT FROM OLD.boutique_id THEN
    RAISE EXCEPTION 'La boutique d''un enregistrement ne peut pas changer.';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER trg_bid_categories BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION public.proteger_boutique_id();
CREATE TRIGGER trg_bid_modes BEFORE UPDATE ON public.modes_paiement_boutique FOR EACH ROW EXECUTE FUNCTION public.proteger_boutique_id();

-- Traçabilité : jamais de modification/suppression
CREATE OR REPLACE FUNCTION public.interdire_modification()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  RAISE EXCEPTION 'Cet enregistrement ne peut être ni modifié ni supprimé (traçabilité).';
END $$;
CREATE TRIGGER trg_mvt_immuable BEFORE UPDATE OR DELETE ON public.mouvements_stock FOR EACH ROW EXECUTE FUNCTION public.interdire_modification();
CREATE TRIGGER trg_paiements_immuable BEFORE UPDATE OR DELETE ON public.paiements FOR EACH ROW EXECUTE FUNCTION public.interdire_modification();
CREATE TRIGGER trg_lignes_immuable BEFORE UPDATE OR DELETE ON public.lignes_vente FOR EACH ROW EXECUTE FUNCTION public.interdire_modification();
CREATE TRIGGER trg_depenses_immuable BEFORE UPDATE OR DELETE ON public.depenses_caisse FOR EACH ROW EXECUTE FUNCTION public.interdire_modification();

CREATE OR REPLACE FUNCTION public.interdire_suppression()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  RAISE EXCEPTION 'Suppression interdite (traçabilité).';
END $$;
CREATE TRIGGER trg_ventes_nodelete BEFORE DELETE ON public.ventes FOR EACH ROW EXECUTE FUNCTION public.interdire_suppression();
CREATE TRIGGER trg_sessions_nodelete BEFORE DELETE ON public.sessions_caisse FOR EACH ROW EXECUTE FUNCTION public.interdire_suppression();

-- Session clôturée : figée
CREATE OR REPLACE FUNCTION public.session_cloturee_figee()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF OLD.statut = 'cloturee' THEN
    RAISE EXCEPTION 'Une session clôturée n''est plus modifiable.';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER trg_session_figee BEFORE UPDATE ON public.sessions_caisse FOR EACH ROW EXECUTE FUNCTION public.session_cloturee_figee();

-- ---------- Droits (GRANT) ----------
GRANT SELECT ON public.boutiques, public.roles_utilisateurs, public.categories, public.produits,
  public.mouvements_stock, public.sessions_caisse, public.ventes, public.lignes_vente, public.paiements,
  public.modes_paiement_boutique, public.depenses_caisse, public.abonnements, public.demandes_paiement,
  public.parametres_editeur TO authenticated;
GRANT UPDATE ON public.boutiques TO authenticated;
GRANT INSERT, UPDATE ON public.categories, public.produits TO authenticated;
GRANT UPDATE ON public.modes_paiement_boutique TO authenticated;
GRANT INSERT ON public.demandes_paiement TO authenticated;
GRANT UPDATE ON public.parametres_editeur TO authenticated;
GRANT ALL ON public.boutiques, public.roles_utilisateurs, public.categories, public.produits,
  public.mouvements_stock, public.sessions_caisse, public.ventes, public.lignes_vente, public.paiements,
  public.modes_paiement_boutique, public.depenses_caisse, public.abonnements, public.demandes_paiement,
  public.parametres_editeur TO service_role;

-- ---------- RLS ----------
ALTER TABLE public.boutiques ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles_utilisateurs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.produits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mouvements_stock ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions_caisse ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ventes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lignes_vente ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.paiements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modes_paiement_boutique ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.depenses_caisse ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.abonnements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.demandes_paiement ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parametres_editeur ENABLE ROW LEVEL SECURITY;

-- boutiques
CREATE POLICY "lecture boutique" ON public.boutiques FOR SELECT TO authenticated
  USING (id = public.ma_boutique() OR public.est_admin());
CREATE POLICY "modif boutique proprietaire" ON public.boutiques FOR UPDATE TO authenticated
  USING ((public.est_proprietaire_de(id) AND public.abonnement_actif(id)) OR public.est_admin())
  WITH CHECK ((public.est_proprietaire_de(id) AND public.abonnement_actif(id)) OR public.est_admin());

-- roles_utilisateurs : lecture seule
CREATE POLICY "lecture roles" ON public.roles_utilisateurs FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR boutique_id = public.ma_boutique() OR public.est_admin());

-- categories / produits
CREATE POLICY "lecture categories" ON public.categories FOR SELECT TO authenticated
  USING (boutique_id = public.ma_boutique() OR public.est_admin());
CREATE POLICY "creation categories" ON public.categories FOR INSERT TO authenticated
  WITH CHECK (public.est_proprietaire_de(boutique_id) AND public.abonnement_actif(boutique_id));
CREATE POLICY "modif categories" ON public.categories FOR UPDATE TO authenticated
  USING (public.est_proprietaire_de(boutique_id) AND public.abonnement_actif(boutique_id))
  WITH CHECK (public.est_proprietaire_de(boutique_id) AND public.abonnement_actif(boutique_id));

CREATE POLICY "lecture produits" ON public.produits FOR SELECT TO authenticated
  USING (boutique_id = public.ma_boutique() OR public.est_admin());
CREATE POLICY "creation produits" ON public.produits FOR INSERT TO authenticated
  WITH CHECK (public.est_proprietaire_de(boutique_id) AND public.abonnement_actif(boutique_id));
CREATE POLICY "modif produits" ON public.produits FOR UPDATE TO authenticated
  USING (public.est_proprietaire_de(boutique_id) AND public.abonnement_actif(boutique_id))
  WITH CHECK (public.est_proprietaire_de(boutique_id) AND public.abonnement_actif(boutique_id));

-- Tables en lecture seule pour le client (écritures via fonctions serveur)
CREATE POLICY "lecture mouvements" ON public.mouvements_stock FOR SELECT TO authenticated
  USING (boutique_id = public.ma_boutique() OR public.est_admin());
CREATE POLICY "lecture sessions" ON public.sessions_caisse FOR SELECT TO authenticated
  USING (boutique_id = public.ma_boutique() OR public.est_admin());
CREATE POLICY "lecture ventes" ON public.ventes FOR SELECT TO authenticated
  USING (boutique_id = public.ma_boutique() OR public.est_admin());
CREATE POLICY "lecture lignes" ON public.lignes_vente FOR SELECT TO authenticated
  USING (boutique_id = public.ma_boutique() OR public.est_admin());
CREATE POLICY "lecture paiements" ON public.paiements FOR SELECT TO authenticated
  USING (boutique_id = public.ma_boutique() OR public.est_admin());
CREATE POLICY "lecture depenses" ON public.depenses_caisse FOR SELECT TO authenticated
  USING (boutique_id = public.ma_boutique() OR public.est_admin());
CREATE POLICY "lecture abonnement" ON public.abonnements FOR SELECT TO authenticated
  USING (boutique_id = public.ma_boutique() OR public.est_admin());

-- modes de paiement
CREATE POLICY "lecture modes" ON public.modes_paiement_boutique FOR SELECT TO authenticated
  USING (boutique_id = public.ma_boutique() OR public.est_admin());
CREATE POLICY "modif modes proprietaire" ON public.modes_paiement_boutique FOR UPDATE TO authenticated
  USING (public.est_proprietaire_de(boutique_id) AND public.abonnement_actif(boutique_id))
  WITH CHECK (public.est_proprietaire_de(boutique_id) AND public.abonnement_actif(boutique_id));

-- demandes de paiement (création autorisée même abonnement expiré)
CREATE POLICY "lecture demandes" ON public.demandes_paiement FOR SELECT TO authenticated
  USING (boutique_id = public.ma_boutique() OR public.est_admin());
CREATE POLICY "creation demande proprietaire" ON public.demandes_paiement FOR INSERT TO authenticated
  WITH CHECK (public.est_proprietaire_de(boutique_id) AND statut = 'en_attente'
              AND traitee_par IS NULL AND traitee_le IS NULL);

-- paramètres éditeur
CREATE POLICY "lecture parametres" ON public.parametres_editeur FOR SELECT TO authenticated USING (true);
CREATE POLICY "modif parametres admin" ON public.parametres_editeur FOR UPDATE TO authenticated
  USING (public.est_admin()) WITH CHECK (public.est_admin());
