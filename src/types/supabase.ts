export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          avatar_url: string | null
          created_at: string | null
          business_name: string | null
          about: string | null
          location: string | null
          services: string[] | null
          rating: number | null
          jobs_completed: number | null
          updated_at: string | null
          total_earnings: number | null
          available_balance: number | null
          pending_earnings: number | null
          total_withdrawn: number | null
          trade_registry_number: string | null
          certifications: Json | null
        }
        Insert: {
          id: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string | null
          business_name?: string | null
          about?: string | null
          location?: string | null
          services?: string[] | null
          rating?: number | null
          jobs_completed?: number | null
          updated_at?: string | null
          total_earnings?: number | null
          available_balance?: number | null
          pending_earnings?: number | null
          total_withdrawn?: number | null
          trade_registry_number?: string | null
          certifications?: Json | null
        }
        Update: {
          id?: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string | null
          business_name?: string | null
          about?: string | null
          location?: string | null
          services?: string[] | null
          rating?: number | null
          jobs_completed?: number | null
          updated_at?: string | null
          total_earnings?: number | null
          available_balance?: number | null
          pending_earnings?: number | null
          total_withdrawn?: number | null
          trade_registry_number?: string | null
          certifications?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      categories: {
        Row: {
          created_at: string
          id: number
          name: string
          parent_id: number | null
        }
        Insert: {
          created_at?: string
          id?: number
          name: string
          parent_id?: number | null
        }
        Update: {
          created_at?: string
          id?: number
          name?: string
          parent_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          }
        ]
      }
      tasks: {
        Row: {
          id: string
          title: string
          description: string
          budget: string
          location: string
          created_at: string
          user_id: string
          due_date: string
          status: string
          latitude: number | null
          longitude: number | null
          category_id: string | null
        }
        Insert: {
          id?: string
          title: string
          description: string
          budget: string
          location: string
          created_at?: string
          user_id: string
          due_date: string
          status?: string
          latitude?: number | null
          longitude?: number | null
          category_id?: string | null
        }
        Update: {
          id?: string
          title?: string
          description?: string
          budget?: string
          location?: string
          created_at?: string
          user_id?: string
          due_date?: string
          status?: string
          latitude?: number | null
          longitude?: number | null
          category_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tasks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          }
        ]
      }
      provider_earnings: {
        Row: {
          id: string
          provider_id: string
          task_id: string
          offer_id: string
          amount: number
          commission_amount: number
          net_amount: number
          status: string
          created_at: string
          available_at: string | null
          withdrawn_at: string | null
        }
        Insert: {
          id?: string
          provider_id: string
          task_id: string
          offer_id: string
          amount: number
          commission_amount: number
          net_amount: number
          status?: string
          created_at?: string
          available_at?: string | null
          withdrawn_at?: string | null
        }
        Update: {
          id?: string
          provider_id?: string
          task_id?: string
          offer_id?: string
          amount?: number
          commission_amount?: number
          net_amount?: number
          status?: string
          created_at?: string
          available_at?: string | null
          withdrawn_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "provider_earnings_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "provider_earnings_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "provider_earnings_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "offers"
            referencedColumns: ["id"]
          }
        ]
      }
      wallet_transactions: {
        Row: {
          id: string
          provider_id: string
          amount: number
          transaction_type: string
          status: string
          reference: string | null
          created_at: string | null
          completed_at: string | null
        }
        Insert: {
          id?: string
          provider_id: string
          amount: number
          transaction_type: string
          status: string
          reference?: string | null
          created_at?: string | null
          completed_at?: string | null
        }
        Update: {
          id?: string
          provider_id?: string
          amount?: number
          transaction_type?: string
          status?: string
          reference?: string | null
          created_at?: string | null
          completed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "wallet_transactions_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      offers: {
        Row: {
          id: string
          task_id: string
          provider_id: string
          amount: number
          expected_delivery_date: string
          message: string | null
          status: string
          created_at: string
          net_amount: number | null
        }
        Insert: {
          id?: string
          task_id: string
          provider_id: string
          amount: number
          expected_delivery_date: string
          message?: string | null
          status?: string
          created_at?: string
          net_amount?: number | null
        }
        Update: {
          id?: string
          task_id?: string
          provider_id?: string
          amount?: number
          expected_delivery_date?: string
          message?: string | null
          status?: string
          created_at?: string
          net_amount?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "offers_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offers_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      reviews: {
        Row: {
          id: string
          task_id: string
          reviewer_id: string
          reviewee_id: string
          rating: number
          feedback?: string
          created_at: string
          is_provider_review: boolean
        }
        Insert: {
          id?: string
          task_id: string
          reviewer_id: string
          reviewee_id: string
          rating: number
          feedback?: string
          created_at?: string
          is_provider_review: boolean
        }
        Update: {
          id?: string
          task_id?: string
          reviewer_id?: string
          reviewee_id?: string
          rating?: number
          feedback?: string
          created_at?: string
          is_provider_review?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "reviews_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_reviewee_id_fkey"
            columns: ["reviewee_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      task_photos: {
        Row: {
          id: string
          task_id: string
          photo_url: string
          created_at: string
        }
        Insert: {
          id?: string
          task_id: string
          photo_url: string
          created_at?: string
        }
        Update: {
          id?: string
          task_id?: string
          photo_url?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_photos_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          }
        ]
      }
      user_status: {
        Row: {
          user_id: string
          status: string
          updated_at: string | null
        }
        Insert: {
          user_id: string
          status: string
          updated_at?: string | null
        }
        Update: {
          user_id?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_status_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      messages: {
        Row: {
          id: string
          task_id: string
          sender_id: string
          receiver_id: string
          content: string
          created_at: string
          read: boolean
        }
        Insert: {
          id?: string
          task_id: string
          sender_id: string
          receiver_id: string
          content: string
          created_at?: string
          read?: boolean
        }
        Update: {
          id?: string
          task_id?: string
          sender_id?: string
          receiver_id?: string
          content?: string
          created_at?: string
          read?: boolean
        }
        Relationships: []
      }
      message_attachments: {
        Row: {
          id: string
          message_id: string
          file_url: string
          file_type: string
          created_at: string
        }
        Insert: {
          id?: string
          message_id: string
          file_url: string
          file_type: string
          created_at?: string
        }
        Update: {
          id?: string
          message_id?: string
          file_url?: string
          file_type?: string
          created_at?: string
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          id: string
          name: string
          email: string
          message: string
          user_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          message: string
          user_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          message?: string
          user_id?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "contact_messages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      spatial_ref_sys: {
        Row: {
          srid: number
          auth_name: string | null
          auth_srid: number | null
          srtext: string | null
          proj4text: string | null
        }
        Insert: {
          srid: number
          auth_name?: string | null
          auth_srid?: number | null
          srtext?: string | null
          proj4text?: string | null
        }
        Update: {
          srid?: number
          auth_name?: string | null
          auth_srid?: number | null
          srtext?: string | null
          proj4text?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      message_threads: {
        Row: {
          task_id: string | null
          task_title: string | null
          last_message_content: string | null
          last_message_date: string | null
          unread_count: number | null
          other_user_id: string | null
          other_user_name: string | null
          other_user_avatar: string | null
          sender_id: string | null
          receiver_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_receiver_id_fkey"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Functions: {
      get_user_details: {
        Args: { 
          user_ids: string[] 
        }
        Returns: {
          id: string;
          email: string;
          raw_user_meta_data?: {
            full_name?: string;
            name?: string;
          };
        }[]
      }
      increment: {
        Args: {
          row_id: string;
          inc: number;
        }
        Returns: void
      }
      decrement: {
        Args: {
          row_id: string;
          dec: number;
        }
        Returns: void
      }
      update_task_status_for_provider: {
        Args: {
          task_id: string;
          provider_id: string;
          new_status: string;
        }
        Returns: boolean
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
