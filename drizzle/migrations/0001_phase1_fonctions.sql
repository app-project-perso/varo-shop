CREATE OR REPLACE FUNCTION public.creer_boutique(_nom text, _telephone text, _adresse text, _nom_proprietaire text)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _uid uuid := auth.uid();
  _bid uuid;
  _duree integer;
BEGIN
  IF _uid IS NULL THEN
    RAISE EXCEPTION 'Tu dois être connecté.';
  END IF;
  IF _nom IS NULL OR length(trim(_nom)) = 0 THEN
    RAISE EXCEPTION 'Le nom de la boutique est obligatoire.';
  END IF;
  -- Refuse tout utilisateur qui a déjà un rôle (propriétaire, vendeur ou admin), actif ou non
  PERFORM 1 FROM public.roles_utilisateurs WHERE user_id = _uid FOR UPDATE;
  IF FOUND THEN
    RAISE EXCEPTION 'Tu as déjà une boutique ou un rôle.';
  END IF;

  SELECT duree_essai_jours INTO _duree FROM public.parametres_editeur WHERE id = true;
  IF _duree IS NULL THEN _duree := 14; END IF;

  INSERT INTO public.boutiques (nom, telephone, adresse, proprietaire_id)
  VALUES (trim(_nom), nullif(trim(_telephone), ''), nullif(trim(_adresse), ''), _uid)
  RETURNING id INTO _bid;

  -- Rôle toujours fixé à 'proprietaire' ici : aucun paramètre ne permet de choisir le rôle
  INSERT INTO public.roles_utilisateurs (user_id, boutique_id, role, actif, nom, telephone, derniere_connexion)
  VALUES (_uid, _bid, 'proprietaire', true, nullif(trim(_nom_proprietaire), ''), nullif(trim(_telephone), ''), now());

  INSERT INTO public.modes_paiement_boutique (boutique_id, mode, active, taux_frais) VALUES
    (_bid, 'especes', true, 0),
    (_bid, 'mvola', false, 0),
    (_bid, 'airtel_money', false, 0),
    (_bid, 'orange_money', false, 0);

  INSERT INTO public.abonnements (boutique_id, statut, date_debut, date_fin, plan)
  VALUES (_bid, 'essai', now(), now() + make_interval(days => _duree), 'standard');

  RETURN _bid;
END $$;

CREATE OR REPLACE FUNCTION public.changer_statut_vendeur(_vendeur uuid, _actif boolean)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _bid uuid := public.ma_boutique();
BEGIN
  IF public.mon_role() IS DISTINCT FROM 'proprietaire' THEN
    RAISE EXCEPTION 'Action réservée au propriétaire.';
  END IF;
  IF NOT public.abonnement_actif(_bid) THEN
    RAISE EXCEPTION 'Ton abonnement n''est pas actif.';
  END IF;
  UPDATE public.roles_utilisateurs SET actif = _actif
  WHERE user_id = _vendeur AND boutique_id = _bid AND role = 'vendeur';
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Vendeur introuvable dans ta boutique.';
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.noter_connexion()
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  UPDATE public.roles_utilisateurs SET derniere_connexion = now()
  WHERE user_id = auth.uid() AND actif = true;
$$;

REVOKE EXECUTE ON FUNCTION public.creer_boutique(text,text,text,text), public.changer_statut_vendeur(uuid,boolean), public.noter_connexion() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.creer_boutique(text,text,text,text), public.changer_statut_vendeur(uuid,boolean), public.noter_connexion() TO authenticated;
