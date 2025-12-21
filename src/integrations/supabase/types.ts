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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      badges: {
        Row: {
          certificate_url: string | null
          challenge_id: string | null
          created_at: string | null
          id: string
          issued_at: string | null
          metadata: Json | null
          points: number | null
          title: string
          user_id: string
          verification_code: string
        }
        Insert: {
          certificate_url?: string | null
          challenge_id?: string | null
          created_at?: string | null
          id?: string
          issued_at?: string | null
          metadata?: Json | null
          points?: number | null
          title: string
          user_id: string
          verification_code: string
        }
        Update: {
          certificate_url?: string | null
          challenge_id?: string | null
          created_at?: string | null
          id?: string
          issued_at?: string | null
          metadata?: Json | null
          points?: number | null
          title?: string
          user_id?: string
          verification_code?: string
        }
        Relationships: [
          {
            foreignKeyName: "badges_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      carbon_logs: {
        Row: {
          created_at: string | null
          energy_emissions: number | null
          food_emissions: number | null
          id: string
          lat: number | null
          log_date: string
          lon: number | null
          total_emissions: number | null
          travel_emissions: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          energy_emissions?: number | null
          food_emissions?: number | null
          id?: string
          lat?: number | null
          log_date: string
          lon?: number | null
          total_emissions?: number | null
          travel_emissions?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          energy_emissions?: number | null
          food_emissions?: number | null
          id?: string
          lat?: number | null
          log_date?: string
          lon?: number | null
          total_emissions?: number | null
          travel_emissions?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      certificates: {
        Row: {
          award_title: string | null
          badge_id: string | null
          created_at: string | null
          id: string
          issued_at: string | null
          pdf_url: string | null
          project_name: string | null
          qr_data_url: string | null
          user_id: string
          user_name: string | null
          valid: boolean | null
          verification_code: string
        }
        Insert: {
          award_title?: string | null
          badge_id?: string | null
          created_at?: string | null
          id?: string
          issued_at?: string | null
          pdf_url?: string | null
          project_name?: string | null
          qr_data_url?: string | null
          user_id: string
          user_name?: string | null
          valid?: boolean | null
          verification_code: string
        }
        Update: {
          award_title?: string | null
          badge_id?: string | null
          created_at?: string | null
          id?: string
          issued_at?: string | null
          pdf_url?: string | null
          project_name?: string | null
          qr_data_url?: string | null
          user_id?: string
          user_name?: string | null
          valid?: boolean | null
          verification_code?: string
        }
        Relationships: [
          {
            foreignKeyName: "certificates_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
        ]
      }
      challenges: {
        Row: {
          active: boolean | null
          badge_icon_url: string | null
          created_at: string | null
          description: string | null
          end_date: string
          id: string
          points_award: number | null
          rules: Json
          start_date: string
          title: string
        }
        Insert: {
          active?: boolean | null
          badge_icon_url?: string | null
          created_at?: string | null
          description?: string | null
          end_date: string
          id?: string
          points_award?: number | null
          rules: Json
          start_date: string
          title: string
        }
        Update: {
          active?: boolean | null
          badge_icon_url?: string | null
          created_at?: string | null
          description?: string | null
          end_date?: string
          id?: string
          points_award?: number | null
          rules?: Json
          start_date?: string
          title?: string
        }
        Relationships: []
      }
      city_air_cache: {
        Row: {
          city_key: string
          data: Json
          fetched_at: string | null
          id: string
          lat: number
          lon: number
        }
        Insert: {
          city_key: string
          data: Json
          fetched_at?: string | null
          id?: string
          lat: number
          lon: number
        }
        Update: {
          city_key?: string
          data?: Json
          fetched_at?: string | null
          id?: string
          lat?: number
          lon?: number
        }
        Relationships: []
      }
      leaderboard: {
        Row: {
          avg_daily_emissions: number | null
          created_at: string | null
          id: string
          monthly_points: number | null
          rank_position: number | null
          total_points: number | null
          updated_at: string | null
          user_id: string
          username: string
          week_start: string
          weekly_points: number | null
        }
        Insert: {
          avg_daily_emissions?: number | null
          created_at?: string | null
          id?: string
          monthly_points?: number | null
          rank_position?: number | null
          total_points?: number | null
          updated_at?: string | null
          user_id: string
          username: string
          week_start: string
          weekly_points?: number | null
        }
        Update: {
          avg_daily_emissions?: number | null
          created_at?: string | null
          id?: string
          monthly_points?: number | null
          rank_position?: number | null
          total_points?: number | null
          updated_at?: string | null
          user_id?: string
          username?: string
          week_start?: string
          weekly_points?: number | null
        }
        Relationships: []
      }
      newsletters: {
        Row: {
          created_at: string | null
          email: string
          id: string
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
        }
        Relationships: []
      }
      rewards: {
        Row: {
          description: string | null
          earned_at: string | null
          id: string
          metadata: Json | null
          points_awarded: number | null
          reward_name: string
          reward_type: string
          user_id: string
        }
        Insert: {
          description?: string | null
          earned_at?: string | null
          id?: string
          metadata?: Json | null
          points_awarded?: number | null
          reward_name: string
          reward_type: string
          user_id: string
        }
        Update: {
          description?: string | null
          earned_at?: string | null
          id?: string
          metadata?: Json | null
          points_awarded?: number | null
          reward_name?: string
          reward_type?: string
          user_id?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          current_streak: number | null
          display_name: string | null
          email: string
          id: string
          points: number | null
          total_points: number | null
          updated_at: string | null
          user_id: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          current_streak?: number | null
          display_name?: string | null
          email: string
          id?: string
          points?: number | null
          total_points?: number | null
          updated_at?: string | null
          user_id: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          current_streak?: number | null
          display_name?: string | null
          email?: string
          id?: string
          points?: number | null
          total_points?: number | null
          updated_at?: string | null
          user_id?: string
          username?: string | null
        }
        Relationships: []
      }
      weekly_reports: {
        Row: {
          avg_daily_emissions: number | null
          created_at: string | null
          id: string
          improvement_percentage: number | null
          points_earned: number | null
          report_data: Json | null
          streak_days: number | null
          total_emissions: number | null
          user_id: string
          week_end: string
          week_start: string
        }
        Insert: {
          avg_daily_emissions?: number | null
          created_at?: string | null
          id?: string
          improvement_percentage?: number | null
          points_earned?: number | null
          report_data?: Json | null
          streak_days?: number | null
          total_emissions?: number | null
          user_id: string
          week_end: string
          week_start: string
        }
        Update: {
          avg_daily_emissions?: number | null
          created_at?: string | null
          id?: string
          improvement_percentage?: number | null
          points_earned?: number | null
          report_data?: Json | null
          streak_days?: number | null
          total_emissions?: number | null
          user_id?: string
          week_end?: string
          week_start?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      increment_user_points: {
        Args: { points_to_add: number; user_id: string }
        Returns: undefined
      }
      upsert_leaderboard: {
        Args: { p_points: number; p_user_id: string }
        Returns: undefined
      }
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
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
