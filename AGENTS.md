# Varo — règles techniques
- Toute écriture sensible (stock, ventes, paiements, sessions, abonnements, rôles) passe par des fonctions SQL SECURITY DEFINER ; le client n'a que SELECT sur ces tables — l'isolation et l'intégrité sont garanties côté base.
- Rôle et boutique d'un utilisateur vivent uniquement dans roles_utilisateurs (aucun droit d'écriture client) — empêche l'auto-promotion.
- Les déclencheurs refusent les changements de champs protégés quand current_user est authenticated/anon — les fonctions serveur restent seules autorisées.
- Montants en entiers Ariary — pas d'erreurs d'arrondi.
- Les opérations nécessitant la clé de service (création de vendeur, changement de mot de passe) sont des createServerFn avec requireSupabaseAuth dans src/lib/*.functions.ts, pas des Edge Functions — c'est le standard de la plateforme TanStack Start.
- Les vendeurs sans email se connectent avec leur téléphone, converti en adresse interne `<chiffres>@tel.varo.app` — l'authentification exige un email.
- Les écrans connectés passent par le composant Espace (rôles autorisés + blocage écriture si abonnement inactif) — confort UI uniquement, la sécurité reste en base.
