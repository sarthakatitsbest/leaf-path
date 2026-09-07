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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      auto_estimates: {
        Row: {
          carbon_estimate: number | null
          city: string | null
          city_average_carbon: number | null
          comparison_percentage: number | null
          created_at: string | null
          estimate_data: Json | null
          estimate_date: string
          id: string
          user_id: string
          water_estimate: number | null
        }
        Insert: {
          carbon_estimate?: number | null
          city?: string | null
          city_average_carbon?: number | null
          comparison_percentage?: number | null
          created_at?: string | null
          estimate_data?: Json | null
          estimate_date: string
          id?: string
          user_id: string
          water_estimate?: number | null
        }
        Update: {
          carbon_estimate?: number | null
          city?: string | null
          city_average_carbon?: number | null
          comparison_percentage?: number | null
          created_at?: string | null
          estimate_data?: Json | null
          estimate_date?: string
          id?: string
          user_id?: string
          water_estimate?: number | null
        }
        Relationships: []
      }
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
      campaign_certificates: {
        Row: {
          campaign_id: string
          id: string
          issued_at: string | null
          issued_by: string
          metadata: Json | null
          pdf_url: string | null
          user_id: string
          verification_code: string
        }
        Insert: {
          campaign_id: string
          id?: string
          issued_at?: string | null
          issued_by: string
          metadata?: Json | null
          pdf_url?: string | null
          user_id: string
          verification_code?: string
        }
        Update: {
          campaign_id?: string
          id?: string
          issued_at?: string | null
          issued_by?: string
          metadata?: Json | null
          pdf_url?: string | null
          user_id?: string
          verification_code?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaign_certificates_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_notifications: {
        Row: {
          campaign_id: string
          id: string
          notification_type: string | null
          payload: Json | null
          sent_at: string | null
          user_id: string
        }
        Insert: {
          campaign_id: string
          id?: string
          notification_type?: string | null
          payload?: Json | null
          sent_at?: string | null
          user_id: string
        }
        Update: {
          campaign_id?: string
          id?: string
          notification_type?: string | null
          payload?: Json | null
          sent_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaign_notifications_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_participants: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          campaign_id: string
          checked_in_at: string | null
          checked_in_lat: number | null
          checked_in_lng: number | null
          completed_at: string | null
          id: string
          requested_at: string | null
          status: string | null
          user_id: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          campaign_id: string
          checked_in_at?: string | null
          checked_in_lat?: number | null
          checked_in_lng?: number | null
          completed_at?: string | null
          id?: string
          requested_at?: string | null
          status?: string | null
          user_id: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          campaign_id?: string
          checked_in_at?: string | null
          checked_in_lat?: number | null
          checked_in_lng?: number | null
          completed_at?: string | null
          id?: string
          requested_at?: string | null
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaign_participants_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_team: {
        Row: {
          added_at: string | null
          campaign_id: string
          id: string
          role: string | null
          user_id: string
        }
        Insert: {
          added_at?: string | null
          campaign_id: string
          id?: string
          role?: string | null
          user_id: string
        }
        Update: {
          added_at?: string | null
          campaign_id?: string
          id?: string
          role?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaign_team_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          capacity: number | null
          certificate_template_id: string | null
          city: string | null
          created_at: string | null
          description: string | null
          end_time: string
          id: string
          image_url: string | null
          lat: number
          lng: number
          owner_id: string
          start_time: string
          title: string
          updated_at: string | null
          visibility: string | null
        }
        Insert: {
          capacity?: number | null
          certificate_template_id?: string | null
          city?: string | null
          created_at?: string | null
          description?: string | null
          end_time: string
          id?: string
          image_url?: string | null
          lat: number
          lng: number
          owner_id: string
          start_time: string
          title: string
          updated_at?: string | null
          visibility?: string | null
        }
        Update: {
          capacity?: number | null
          certificate_template_id?: string | null
          city?: string | null
          created_at?: string | null
          description?: string | null
          end_time?: string
          id?: string
          image_url?: string | null
          lat?: number
          lng?: number
          owner_id?: string
          start_time?: string
          title?: string
          updated_at?: string | null
          visibility?: string | null
        }
        Relationships: []
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
      certificate_progress: {
        Row: {
          certificate_type: string
          created_at: string | null
          current_value: number | null
          id: string
          is_unlocked: boolean | null
          target_value: number
          unlocked_at: string | null
          updated_at: string | null
          user_id: string
          week_start: string
        }
        Insert: {
          certificate_type: string
          created_at?: string | null
          current_value?: number | null
          id?: string
          is_unlocked?: boolean | null
          target_value: number
          unlocked_at?: string | null
          updated_at?: string | null
          user_id: string
          week_start: string
        }
        Update: {
          certificate_type?: string
          created_at?: string | null
          current_value?: number | null
          id?: string
          is_unlocked?: boolean | null
          target_value?: number
          unlocked_at?: string | null
          updated_at?: string | null
          user_id?: string
          week_start?: string
        }
        Relationships: []
      }
      certificates: {
        Row: {
          award_title: string | null
          badge_id: string | null
          certificate_type: string | null
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
          certificate_type?: string | null
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
          certificate_type?: string | null
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
      companies: {
        Row: {
          created_at: string | null
          domain: string | null
          id: string
          logo_url: string | null
          max_employees: number | null
          name: string
          owner_id: string | null
          plan: Database["public"]["Enums"]["company_plan"] | null
          settings: Json | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          subscription_status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          domain?: string | null
          id?: string
          logo_url?: string | null
          max_employees?: number | null
          name: string
          owner_id?: string | null
          plan?: Database["public"]["Enums"]["company_plan"] | null
          settings?: Json | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          domain?: string | null
          id?: string
          logo_url?: string | null
          max_employees?: number | null
          name?: string
          owner_id?: string | null
          plan?: Database["public"]["Enums"]["company_plan"] | null
          settings?: Json | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      company_metrics: {
        Row: {
          company_id: string
          comparison: Json | null
          computed_at: string | null
          created_at: string | null
          id: string
          metrics: Json
          period_end: string
          period_start: string
          period_type: string
        }
        Insert: {
          company_id: string
          comparison?: Json | null
          computed_at?: string | null
          created_at?: string | null
          id?: string
          metrics?: Json
          period_end: string
          period_start: string
          period_type: string
        }
        Update: {
          company_id?: string
          comparison?: Json | null
          computed_at?: string | null
          created_at?: string | null
          id?: string
          metrics?: Json
          period_end?: string
          period_start?: string
          period_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_metrics_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      company_users: {
        Row: {
          company_id: string
          created_at: string | null
          email: string
          id: string
          invite_expires_at: string | null
          invite_token: string | null
          is_active: boolean | null
          joined_at: string | null
          opted_in: boolean | null
          opted_in_at: string | null
          role: Database["public"]["Enums"]["company_role"] | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          company_id: string
          created_at?: string | null
          email: string
          id?: string
          invite_expires_at?: string | null
          invite_token?: string | null
          is_active?: boolean | null
          joined_at?: string | null
          opted_in?: boolean | null
          opted_in_at?: string | null
          role?: Database["public"]["Enums"]["company_role"] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string | null
          email?: string
          id?: string
          invite_expires_at?: string | null
          invite_token?: string | null
          is_active?: boolean | null
          joined_at?: string | null
          opted_in?: boolean | null
          opted_in_at?: string | null
          role?: Database["public"]["Enums"]["company_role"] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "company_users_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_users_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      entries: {
        Row: {
          company_id: string | null
          created_at: string | null
          data: Json
          explanation: Json | null
          footprint: Json
          id: string
          location: Json | null
          share_with_company: boolean | null
          type: string
          user_id: string
        }
        Insert: {
          company_id?: string | null
          created_at?: string | null
          data: Json
          explanation?: Json | null
          footprint: Json
          id?: string
          location?: Json | null
          share_with_company?: boolean | null
          type: string
          user_id: string
        }
        Update: {
          company_id?: string | null
          created_at?: string | null
          data?: Json
          explanation?: Json | null
          footprint?: Json
          id?: string
          location?: Json | null
          share_with_company?: boolean | null
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "entries_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      esg_audit: {
        Row: {
          action: string
          company_id: string | null
          created_at: string | null
          details: Json | null
          id: string
          ip_address: string | null
          resource_id: string | null
          resource_type: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          company_id?: string | null
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: string | null
          resource_id?: string | null
          resource_type?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          company_id?: string | null
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: string | null
          resource_id?: string | null
          resource_type?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "esg_audit_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      esg_reports: {
        Row: {
          company_id: string
          completed_at: string | null
          created_at: string | null
          csv_url: string | null
          generated_by: string
          id: string
          metadata: Json | null
          metrics_snapshot: Json | null
          pdf_url: string | null
          period_end: string
          period_start: string
          report_type: string
          status: string | null
        }
        Insert: {
          company_id: string
          completed_at?: string | null
          created_at?: string | null
          csv_url?: string | null
          generated_by: string
          id?: string
          metadata?: Json | null
          metrics_snapshot?: Json | null
          pdf_url?: string | null
          period_end: string
          period_start: string
          report_type: string
          status?: string | null
        }
        Update: {
          company_id?: string
          completed_at?: string | null
          created_at?: string | null
          csv_url?: string | null
          generated_by?: string
          id?: string
          metadata?: Json | null
          metrics_snapshot?: Json | null
          pdf_url?: string | null
          period_end?: string
          period_start?: string
          report_type?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "esg_reports_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      health_tips: {
        Row: {
          activity_suggestions: Json | null
          aqi_value: number | null
          created_at: string | null
          diet_suggestions: Json | null
          id: string
          temperature: number | null
          tip_date: string
          tips: Json
          user_id: string
        }
        Insert: {
          activity_suggestions?: Json | null
          aqi_value?: number | null
          created_at?: string | null
          diet_suggestions?: Json | null
          id?: string
          temperature?: number | null
          tip_date: string
          tips: Json
          user_id: string
        }
        Update: {
          activity_suggestions?: Json | null
          aqi_value?: number | null
          created_at?: string | null
          diet_suggestions?: Json | null
          id?: string
          temperature?: number | null
          tip_date?: string
          tips?: Json
          user_id?: string
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
      plastic_brand_mentions: {
        Row: {
          area: string | null
          brand_name: string
          confidence: number | null
          created_at: string
          evidence: Json | null
          id: string
          mention_count: number | null
        }
        Insert: {
          area?: string | null
          brand_name: string
          confidence?: number | null
          created_at?: string
          evidence?: Json | null
          id?: string
          mention_count?: number | null
        }
        Update: {
          area?: string | null
          brand_name?: string
          confidence?: number | null
          created_at?: string
          evidence?: Json | null
          id?: string
          mention_count?: number | null
        }
        Relationships: []
      }
      plastic_classifications: {
        Row: {
          created_at: string
          id: string
          metadata: Json | null
          model_confidence: number | null
          plastic_category: string
          recyclability_score: number | null
          upload_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json | null
          model_confidence?: number | null
          plastic_category: string
          recyclability_score?: number | null
          upload_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json | null
          model_confidence?: number | null
          plastic_category?: string
          recyclability_score?: number | null
          upload_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "plastic_classifications_upload_id_fkey"
            columns: ["upload_id"]
            isOneToOne: false
            referencedRelation: "plastic_uploads"
            referencedColumns: ["id"]
          },
        ]
      }
      plastic_hotspots: {
        Row: {
          area_name: string | null
          city: string
          computed_at: string
          id: string
          location_lat: number
          location_lng: number
          score: number | null
          severity: string
          sources: Json | null
        }
        Insert: {
          area_name?: string | null
          city: string
          computed_at?: string
          id?: string
          location_lat: number
          location_lng: number
          score?: number | null
          severity: string
          sources?: Json | null
        }
        Update: {
          area_name?: string | null
          city?: string
          computed_at?: string
          id?: string
          location_lat?: number
          location_lng?: number
          score?: number | null
          severity?: string
          sources?: Json | null
        }
        Relationships: []
      }
      plastic_pitch_analyses: {
        Row: {
          category: string | null
          confidence: number | null
          created_at: string
          id: string
          problem_statement: string | null
          solution_statement: string | null
          suggested_metrics: Json | null
          transcript: string
          user_id: string
        }
        Insert: {
          category?: string | null
          confidence?: number | null
          created_at?: string
          id?: string
          problem_statement?: string | null
          solution_statement?: string | null
          suggested_metrics?: Json | null
          transcript: string
          user_id: string
        }
        Update: {
          category?: string | null
          confidence?: number | null
          created_at?: string
          id?: string
          problem_statement?: string | null
          solution_statement?: string | null
          suggested_metrics?: Json | null
          transcript?: string
          user_id?: string
        }
        Relationships: []
      }
      plastic_uploads: {
        Row: {
          created_at: string
          file_url: string | null
          id: string
          location_lat: number | null
          location_lng: number | null
          text_extracted: string | null
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          file_url?: string | null
          id?: string
          location_lat?: number | null
          location_lng?: number | null
          text_extracted?: string | null
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          file_url?: string | null
          id?: string
          location_lat?: number | null
          location_lng?: number | null
          text_extracted?: string | null
          type?: string
          user_id?: string
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
          lat: number | null
          lng: number | null
          notification_opt_in: boolean | null
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
          lat?: number | null
          lng?: number | null
          notification_opt_in?: boolean | null
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
          lat?: number | null
          lng?: number | null
          notification_opt_in?: boolean | null
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
      wellness_scores: {
        Row: {
          activity_score: number | null
          aqi_score: number | null
          breakdown: Json | null
          created_at: string | null
          diet_score: number | null
          id: string
          overall_score: number | null
          score_date: string
          user_id: string
          water_score: number | null
        }
        Insert: {
          activity_score?: number | null
          aqi_score?: number | null
          breakdown?: Json | null
          created_at?: string | null
          diet_score?: number | null
          id?: string
          overall_score?: number | null
          score_date: string
          user_id: string
          water_score?: number | null
        }
        Update: {
          activity_score?: number | null
          aqi_score?: number | null
          breakdown?: Json | null
          created_at?: string | null
          diet_score?: number | null
          id?: string
          overall_score?: number | null
          score_date?: string
          user_id?: string
          water_score?: number | null
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
      is_company_admin: {
        Args: { p_company_id: string; p_user_id: string }
        Returns: boolean
      }
      is_company_member: {
        Args: { p_company_id: string; p_user_id: string }
        Returns: boolean
      }
      upsert_leaderboard: {
        Args: { p_points: number; p_user_id: string }
        Returns: undefined
      }
    }
    Enums: {
      company_plan: "free" | "starter" | "pro" | "enterprise"
      company_role: "admin" | "manager" | "employee"
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
    Enums: {
      company_plan: ["free", "starter", "pro", "enterprise"],
      company_role: ["admin", "manager", "employee"],
    },
  },
} as const
