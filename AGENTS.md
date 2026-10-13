# Varo — règles techniques
- Toute écriture sensible (stock, ventes, paiements, sessions, abonnements, rôles) passe par des fonctions SQL SECURITY DEFINER ; le client n'a que SELECT sur ces tables — l'isolation et l'intégrité sont garanties côté base.
- Rôle et boutique d'un utilisateur vivent uniquement dans roles_utilisateurs (aucun droit d'écriture client) — empêche l'auto-promotion.
- Les déclencheurs refusent les changements de champs protégés quand current_user est authenticated/anon — les fonctions serveur restent seules autorisées.
- Montants en entiers Ariary — pas d'erreurs d'arrondi.
- Les opérations nécessitant la clé de service (création de vendeur, changement de mot de passe) sont des createServerFn avec requireSupabaseAuth dans src/lib/*.functions.ts, pas des Edge Functions — c'est le standard de la plateforme TanStack Start.
- Les vendeurs sans email se connectent avec leur téléphone, converti en adresse `<chiffres>@vendeur.varo.invalid` (domaine réservé, aucun courrier livrable) ; réinitialisation par email refusée pour ces comptes.
- Les écrans connectés passent par le composant Espace (rôles autorisés + blocage écriture si abonnement inactif) — confort UI uniquement, la sécurité reste en base.
- Lecture des produits : la gestion lit la table `produits` (propriétaire/admin), la caisse lit la vue `produits_vente` (sans prix d'achat) — passer par src/lib/produits.ts.
- Le drapeau doit_changer_mdp n'est levé que par la fonction serveur qui change réellement le mot de passe — empêche de contourner le changement obligatoire.
