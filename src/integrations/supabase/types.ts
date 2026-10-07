export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      abonnements: {
        Row: {
          boutique_id: string
          created_at: string
          date_debut: string
          date_fin: string
          id: string
          plan: string
          statut: string
        }
        Insert: {
          boutique_id: string
          created_at?: string
          date_debut?: string
          date_fin: string
          id?: string
          plan?: string
          statut: string
        }
        Update: {
          boutique_id?: string
          created_at?: string
          date_debut?: string
          date_fin?: string
          id?: string
          plan?: string
          statut?: string
        }
        Relationships: [
          {
            foreignKeyName: "abonnements_boutique_id_fkey"
            columns: ["boutique_id"]
            isOneToOne: true
            referencedRelation: "boutiques"
            referencedColumns: ["id"]
          },
        ]
      }
      boutiques: {
        Row: {
          adresse: string | null
          compteur_ticket: number
          created_at: string
          devise: string
          entete_ticket: string | null
          id: string
          logo_url: string | null
          nom: string
          pied_ticket: string | null
          proprietaire_id: string
          telephone: string | null
        }
        Insert: {
          adresse?: string | null
          compteur_ticket?: number
          created_at?: string
          devise?: string
          entete_ticket?: string | null
          id?: string
          logo_url?: string | null
          nom: string
          pied_ticket?: string | null
          proprietaire_id: string
          telephone?: string | null
        }
        Update: {
          adresse?: string | null
          compteur_ticket?: number
          created_at?: string
          devise?: string
          entete_ticket?: string | null
          id?: string
          logo_url?: string | null
          nom?: string
          pied_ticket?: string | null
          proprietaire_id?: string
          telephone?: string | null
        }
        Relationships: []
      }
      categories: {
        Row: {
          active: boolean
          boutique_id: string
          created_at: string
          id: string
          nom: string
        }
        Insert: {
          active?: boolean
          boutique_id: string
          created_at?: string
          id?: string
          nom: string
        }
        Update: {
          active?: boolean
          boutique_id?: string
          created_at?: string
          id?: string
          nom?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_boutique_id_fkey"
            columns: ["boutique_id"]
            isOneToOne: false
            referencedRelation: "boutiques"
            referencedColumns: ["id"]
          },
        ]
      }
      demandes_paiement: {
        Row: {
          boutique_id: string
          created_at: string
          id: string
          mode: string
          montant: number
          reference: string
          statut: string
          traitee_le: string | null
          traitee_par: string | null
        }
        Insert: {
          boutique_id: string
          created_at?: string
          id?: string
          mode: string
          montant: number
          reference: string
          statut?: string
          traitee_le?: string | null
          traitee_par?: string | null
        }
        Update: {
          boutique_id?: string
          created_at?: string
          id?: string
          mode?: string
          montant?: number
          reference?: string
          statut?: string
          traitee_le?: string | null
          traitee_par?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "demandes_paiement_boutique_id_fkey"
            columns: ["boutique_id"]
            isOneToOne: false
            referencedRelation: "boutiques"
            referencedColumns: ["id"]
          },
        ]
      }
      depenses_caisse: {
        Row: {
          boutique_id: string
          created_at: string
          id: string
          montant: number
          motif: string
          session_id: string
          type: string
          utilisateur_id: string
        }
        Insert: {
          boutique_id: string
          created_at?: string
          id?: string
          montant: number
          motif: string
          session_id: string
          type: string
          utilisateur_id: string
        }
        Update: {
          boutique_id?: string
          created_at?: string
          id?: string
          montant?: number
          motif?: string
          session_id?: string
          type?: string
          utilisateur_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "depenses_caisse_boutique_id_fkey"
            columns: ["boutique_id"]
            isOneToOne: false
            referencedRelation: "boutiques"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "depenses_caisse_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions_caisse"
            referencedColumns: ["id"]
          },
        ]
      }
      lignes_vente: {
        Row: {
          boutique_id: string
          created_at: string
          id: string
          prix_final_unitaire: number
          prix_normal: number
          produit_id: string
          quantite: number
          remise_montant: number
          vente_id: string
        }
        Insert: {
          boutique_id: string
          created_at?: string
          id?: string
          prix_final_unitaire: number
          prix_normal: number
          produit_id: string
          quantite: number
          remise_montant?: number
          vente_id: string
        }
        Update: {
          boutique_id?: string
          created_at?: string
          id?: string
          prix_final_unitaire?: number
          prix_normal?: number
          produit_id?: string
          quantite?: number
          remise_montant?: number
          vente_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lignes_vente_boutique_id_fkey"
            columns: ["boutique_id"]
            isOneToOne: false
            referencedRelation: "boutiques"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lignes_vente_produit_id_fkey"
            columns: ["produit_id"]
            isOneToOne: false
            referencedRelation: "produits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lignes_vente_vente_id_fkey"
            columns: ["vente_id"]
            isOneToOne: false
            referencedRelation: "ventes"
            referencedColumns: ["id"]
          },
        ]
      }
      modes_paiement_boutique: {
        Row: {
          active: boolean
          boutique_id: string
          created_at: string
          id: string
          mode: string
          taux_frais: number
        }
        Insert: {
          active?: boolean
          boutique_id: string
          created_at?: string
          id?: string
          mode: string
          taux_frais?: number
        }
        Update: {
          active?: boolean
          boutique_id?: string
          created_at?: string
          id?: string
          mode?: string
          taux_frais?: number
        }
        Relationships: [
          {
            foreignKeyName: "modes_paiement_boutique_boutique_id_fkey"
            columns: ["boutique_id"]
            isOneToOne: false
            referencedRelation: "boutiques"
            referencedColumns: ["id"]
          },
        ]
      }
      mouvements_stock: {
        Row: {
          boutique_id: string
          commentaire: string | null
          created_at: string
          id: string
          motif: string | null
          produit_id: string
          quantite: number
          type: string
          utilisateur_id: string
          vente_id: string | null
        }
        Insert: {
          boutique_id: string
          commentaire?: string | null
          created_at?: string
          id?: string
          motif?: string | null
          produit_id: string
          quantite: number
          type: string
          utilisateur_id: string
          vente_id?: string | null
        }
        Update: {
          boutique_id?: string
          commentaire?: string | null
          created_at?: string
          id?: string
          motif?: string | null
          produit_id?: string
          quantite?: number
          type?: string
          utilisateur_id?: string
          vente_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mouvements_stock_boutique_id_fkey"
            columns: ["boutique_id"]
            isOneToOne: false
            referencedRelation: "boutiques"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mouvements_stock_produit_id_fkey"
            columns: ["produit_id"]
            isOneToOne: false
            referencedRelation: "produits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mouvements_stock_vente_id_fkey"
            columns: ["vente_id"]
            isOneToOne: false
            referencedRelation: "ventes"
            referencedColumns: ["id"]
          },
        ]
      }
      paiements: {
        Row: {
          boutique_id: string
          created_at: string
          frais: number
          id: string
          mode: string
          montant: number
          numero_client: string | null
          reference: string | null
          vente_id: string
        }
        Insert: {
          boutique_id: string
          created_at?: string
          frais?: number
          id?: string
          mode: string
          montant: number
          numero_client?: string | null
          reference?: string | null
          vente_id: string
        }
        Update: {
          boutique_id?: string
          created_at?: string
          frais?: number
          id?: string
          mode?: string
          montant?: number
          numero_client?: string | null
          reference?: string | null
          vente_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "paiements_boutique_id_fkey"
            columns: ["boutique_id"]
            isOneToOne: false
            referencedRelation: "boutiques"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "paiements_vente_id_fkey"
            columns: ["vente_id"]
            isOneToOne: false
            referencedRelation: "ventes"
            referencedColumns: ["id"]
          },
        ]
      }
      parametres_editeur: {
        Row: {
          created_at: string
          duree_essai_jours: number
          id: boolean
          instructions_paiement: string | null
          prix_mensuel: number
        }
        Insert: {
          created_at?: string
          duree_essai_jours?: number
          id?: boolean
          instructions_paiement?: string | null
          prix_mensuel: number
        }
        Update: {
          created_at?: string
          duree_essai_jours?: number
          id?: boolean
          instructions_paiement?: string | null
          prix_mensuel?: number
        }
        Relationships: []
      }
      produits: {
        Row: {
          actif: boolean
          boutique_id: string
          categorie_id: string | null
          code: string | null
          created_at: string
          id: string
          nom: string
          prix_achat: number
          prix_vente: number
          remise_active: boolean
          remise_type: string | null
          remise_valeur: number | null
          seuil_alerte: number
          stock_actuel: number
          unite: string
        }
        Insert: {
          actif?: boolean
          boutique_id: string
          categorie_id?: string | null
          code?: string | null
          created_at?: string
          id?: string
          nom: string
          prix_achat?: number
          prix_vente: number
          remise_active?: boolean
          remise_type?: string | null
          remise_valeur?: number | null
          seuil_alerte?: number
          stock_actuel?: number
          unite?: string
        }
        Update: {
          actif?: boolean
          boutique_id?: string
          categorie_id?: string | null
          code?: string | null
          created_at?: string
          id?: string
          nom?: string
          prix_achat?: number
          prix_vente?: number
          remise_active?: boolean
          remise_type?: string | null
          remise_valeur?: number | null
          seuil_alerte?: number
          stock_actuel?: number
          unite?: string
        }
        Relationships: [
          {
            foreignKeyName: "produits_boutique_id_fkey"
            columns: ["boutique_id"]
            isOneToOne: false
            referencedRelation: "boutiques"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "produits_categorie_id_fkey"
            columns: ["categorie_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      roles_utilisateurs: {
        Row: {
          actif: boolean
          boutique_id: string | null
          created_at: string
          derniere_connexion: string | null
          id: string
          nom: string | null
          role: string
          telephone: string | null
          user_id: string
        }
        Insert: {
          actif?: boolean
          boutique_id?: string | null
          created_at?: string
          derniere_connexion?: string | null
          id?: string
          nom?: string | null
          role: string
          telephone?: string | null
          user_id: string
        }
        Update: {
          actif?: boolean
          boutique_id?: string | null
          created_at?: string
          derniere_connexion?: string | null
          id?: string
          nom?: string | null
          role?: string
          telephone?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "roles_utilisateurs_boutique_id_fkey"
            columns: ["boutique_id"]
            isOneToOne: false
            referencedRelation: "boutiques"
            referencedColumns: ["id"]
          },
        ]
      }
      sessions_caisse: {
        Row: {
          boutique_id: string
          cloturee_le: string | null
          created_at: string
          ecart: number | null
          especes_attendues: number | null
          especes_comptees: number | null
          fond_caisse: number
          id: string
          motif_ecart: string | null
          ouverte_le: string
          statut: string
          vendeur_id: string
        }
        Insert: {
          boutique_id: string
          cloturee_le?: string | null
          created_at?: string
          ecart?: number | null
          especes_attendues?: number | null
          especes_comptees?: number | null
          fond_caisse?: number
          id?: string
          motif_ecart?: string | null
          ouverte_le?: string
          statut?: string
          vendeur_id: string
        }
        Update: {
          boutique_id?: string
          cloturee_le?: string | null
          created_at?: string
          ecart?: number | null
          especes_attendues?: number | null
          especes_comptees?: number | null
          fond_caisse?: number
          id?: string
          motif_ecart?: string | null
          ouverte_le?: string
          statut?: string
          vendeur_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sessions_caisse_boutique_id_fkey"
            columns: ["boutique_id"]
            isOneToOne: false
            referencedRelation: "boutiques"
            referencedColumns: ["id"]
          },
        ]
      }
      ventes: {
        Row: {
          annulee_le: string | null
          annulee_par: string | null
          boutique_id: string
          created_at: string
          id: string
          motif_annulation: string | null
          numero_ticket: number
          session_id: string
          statut: string
          total: number
          vendeur_id: string
        }
        Insert: {
          annulee_le?: string | null
          annulee_par?: string | null
          boutique_id: string
          created_at?: string
          id?: string
          motif_annulation?: string | null
          numero_ticket: number
          session_id: string
          statut?: string
          total: number
          vendeur_id: string
        }
        Update: {
          annulee_le?: string | null
          annulee_par?: string | null
          boutique_id?: string
          created_at?: string
          id?: string
          motif_annulation?: string | null
          numero_ticket?: number
          session_id?: string
          statut?: string
          total?: number
          vendeur_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ventes_boutique_id_fkey"
            columns: ["boutique_id"]
            isOneToOne: false
            referencedRelation: "boutiques"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ventes_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions_caisse"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      abonnement_actif: { Args: { _boutique: string }; Returns: boolean }
      changer_statut_vendeur: {
        Args: { _actif: boolean; _vendeur: string }
        Returns: undefined
      }
      creer_boutique: {
        Args: {
          _adresse: string
          _nom: string
          _nom_proprietaire: string
          _telephone: string
        }
        Returns: string
      }
      est_admin: { Args: never; Returns: boolean }
      est_proprietaire_de: { Args: { _boutique: string }; Returns: boolean }
      ma_boutique: { Args: never; Returns: string }
      mon_role: { Args: never; Returns: string }
      noter_connexion: { Args: never; Returns: undefined }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
