// Generated TypeScript types for Supabase database schema

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      posts: {
        Row: {
          id: string;
          title: string;
          content: string;
          outline: string[];
          category: string;
          tags: string[];
          author: string | null;
          reading_time: number | null;
          word_count: number | null;
          seo_platform: 'google' | 'naver' | 'none' | null;
          topic: string;
          target_audience: string | null;
          seo_metadata: Json | null;
          references: Json;
          completion_status: Json | null;
          generated_at: string;
          completed_at: string;
          created_at: string;
          updated_at: string;
          writing_style: Json | null;
          performance_metrics: Json | null;
        };
        Insert: {
          id?: string;
          title: string;
          content: string;
          outline: string[];
          category: string;
          tags?: string[];
          author?: string | null;
          reading_time?: number | null;
          word_count?: number | null;
          seo_platform?: 'google' | 'naver' | 'none' | null;
          topic: string;
          target_audience?: string | null;
          seo_metadata?: Json | null;
          references?: Json;
          completion_status?: Json | null;
          generated_at: string;
          completed_at?: string;
          created_at?: string;
          updated_at?: string;
          writing_style?: Json | null;
          performance_metrics?: Json | null;
        };
        Update: {
          id?: string;
          title?: string;
          content?: string;
          outline?: string[];
          category?: string;
          tags?: string[];
          author?: string | null;
          reading_time?: number | null;
          word_count?: number | null;
          seo_platform?: 'google' | 'naver' | 'none' | null;
          topic?: string;
          target_audience?: string | null;
          seo_metadata?: Json | null;
          references?: Json;
          completion_status?: Json | null;
          generated_at?: string;
          completed_at?: string;
          created_at?: string;
          updated_at?: string;
          writing_style?: Json | null;
          performance_metrics?: Json | null;
        };
      };
      post_versions: {
        Row: {
          id: string;
          post_id: string;
          version_number: number;
          title: string;
          content: string;
          outline: string[];
          change_type: 'generated' | 'edited' | 'completed';
          changes_summary: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          post_id: string;
          version_number: number;
          title: string;
          content: string;
          outline: string[];
          change_type: 'generated' | 'edited' | 'completed';
          changes_summary?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          post_id?: string;
          version_number?: number;
          title?: string;
          content?: string;
          outline?: string[];
          change_type?: 'generated' | 'edited' | 'completed';
          changes_summary?: Json | null;
          created_at?: string;
        };
      };
      successful_patterns: {
        Row: {
          id: string;
          pattern_type:
            | 'korean_ending_mix'
            | 'heading_structure'
            | 'paragraph_length'
            | 'emoji_usage'
            | 'engagement_style'
            | 'topic_approach';
          seo_platform: string | null;
          category: string | null;
          pattern_data: Json;
          success_score: number | null;
          usage_count: number;
          example_post_ids: string[] | null;
          first_observed_at: string;
          last_updated_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          pattern_type:
            | 'korean_ending_mix'
            | 'heading_structure'
            | 'paragraph_length'
            | 'emoji_usage'
            | 'engagement_style'
            | 'topic_approach';
          seo_platform?: string | null;
          category?: string | null;
          pattern_data: Json;
          success_score?: number | null;
          usage_count?: number;
          example_post_ids?: string[] | null;
          first_observed_at?: string;
          last_updated_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          pattern_type?:
            | 'korean_ending_mix'
            | 'heading_structure'
            | 'paragraph_length'
            | 'emoji_usage'
            | 'engagement_style'
            | 'topic_approach';
          seo_platform?: string | null;
          category?: string | null;
          pattern_data?: Json;
          success_score?: number | null;
          usage_count?: number;
          example_post_ids?: string[] | null;
          first_observed_at?: string;
          last_updated_at?: string;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
