
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
          id: string
          name: string
          description: string | null
          active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          active?: boolean
          created_at?: string
        }
        Relationships: []
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
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
