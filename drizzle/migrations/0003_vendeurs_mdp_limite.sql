ALTER TABLE public.roles_utilisateurs ADD COLUMN IF NOT EXISTS doit_changer_mdp boolean NOT NULL DEFAULT false;

-- Limite de création de vendeurs : 30 par boutique au total, 10 par 24 h
CREATE OR REPLACE FUNCTION public.limiter_creation_vendeurs()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.role <> 'vendeur' THEN RETURN NEW; END IF;
  PERFORM 1 FROM public.boutiques WHERE id = NEW.boutique_id FOR UPDATE;
  IF (SELECT count(*) FROM public.roles_utilisateurs WHERE boutique_id = NEW.boutique_id AND role = 'vendeur') >= 30 THEN
    RAISE EXCEPTION 'LIMITE_TOTALE: 30 vendeurs maximum par boutique.';
  END IF;
  IF (SELECT count(*) FROM public.roles_utilisateurs WHERE boutique_id = NEW.boutique_id AND role = 'vendeur'
      AND created_at > now() - interval '24 hours') >= 10 THEN
    RAISE EXCEPTION 'LIMITE_JOUR: 10 vendeurs maximum créés par 24 heures.';
  END IF;
  RETURN NEW;
END $$;
REVOKE EXECUTE ON FUNCTION public.limiter_creation_vendeurs() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER trg_limiter_vendeurs BEFORE INSERT ON public.roles_utilisateurs
FOR EACH ROW EXECUTE FUNCTION public.limiter_creation_vendeurs();
