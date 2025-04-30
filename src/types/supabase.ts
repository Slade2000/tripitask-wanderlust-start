
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
        }
        Insert: {
          id: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string | null
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
        }
        Relationships: [
          {
            foreignKeyName: "tasks_user_id_fkey"
            columns: ["user_id"]
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
