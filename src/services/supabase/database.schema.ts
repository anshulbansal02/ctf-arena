export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      contest_submissions: {
        Row: {
          contest_id: number;
          created_at: string;
          id: number;
          metadata: Json | null;
          submitted_by: number;
          value: string;
        };
        Insert: {
          contest_id: number;
          created_at?: string;
          id?: number;
          metadata?: Json | null;
          submitted_by: number;
          value: string;
        };
        Update: {
          contest_id?: number;
          created_at?: string;
          id?: number;
          metadata?: Json | null;
          submitted_by?: number;
          value?: string;
        };
        Relationships: [
          {
            foreignKeyName: "public_contest_submissions_contest_id_fkey";
            columns: ["contest_id"];
            isOneToOne: false;
            referencedRelation: "contests";
            referencedColumns: ["id"];
          },
        ];
      };
      contests: {
        Row: {
          created_at: string;
          description: string;
          ends_at: string;
          id: number;
          name: string;
          starts_at: string;
        };
        Insert: {
          created_at?: string;
          description?: string;
          ends_at: string;
          id?: number;
          name: string;
          starts_at: string;
        };
        Update: {
          created_at?: string;
          description?: string;
          ends_at?: string;
          id?: number;
          name?: string;
          starts_at?: string;
        };
        Relationships: [];
      };
      team_members: {
        Row: {
          id: number;
          joined_at: string;
          left_at: string | null;
          team_id: number;
          user_id: string;
        };
        Insert: {
          id?: number;
          joined_at?: string;
          left_at?: string | null;
          team_id: number;
          user_id?: string;
        };
        Update: {
          id?: number;
          joined_at?: string;
          left_at?: string | null;
          team_id?: number;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "public_team_members_team_id_fkey";
            columns: ["team_id"];
            isOneToOne: false;
            referencedRelation: "teams";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "public_team_members_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      team_requests: {
        Row: {
          created_at: string;
          created_by: string;
          id: number;
          metadata: Json | null;
          status: Database["public"]["Enums"]["team_request_status"];
          team_id: number;
          type: Database["public"]["Enums"]["team_request_type"];
          updated_at: string | null;
          user_email: string | null;
        };
        Insert: {
          created_at?: string;
          created_by?: string;
          id?: number;
          metadata?: Json | null;
          status?: Database["public"]["Enums"]["team_request_status"];
          team_id: number;
          type: Database["public"]["Enums"]["team_request_type"];
          updated_at?: string | null;
          user_email?: string | null;
        };
        Update: {
          created_at?: string;
          created_by?: string;
          id?: number;
          metadata?: Json | null;
          status?: Database["public"]["Enums"]["team_request_status"];
          team_id?: number;
          type?: Database["public"]["Enums"]["team_request_type"];
          updated_at?: string | null;
          user_email?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "team_requests_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "team_requests_team_id_fkey";
            columns: ["team_id"];
            isOneToOne: false;
            referencedRelation: "teams";
            referencedColumns: ["id"];
          },
        ];
      };
      teams: {
        Row: {
          created_at: string;
          id: number;
          leader: string;
          name: string;
        };
        Insert: {
          created_at?: string;
          id?: number;
          leader?: string;
          name: string;
        };
        Update: {
          created_at?: string;
          id?: number;
          leader?: string;
          name?: string;
        };
        Relationships: [
          {
            foreignKeyName: "public_teams_leader_fkey";
            columns: ["leader"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      user_notifications: {
        Row: {
          content: Json;
          created_at: string;
          for_user_id: string;
          id: number;
          status: string;
        };
        Insert: {
          content: Json;
          created_at?: string;
          for_user_id?: string;
          id?: number;
          status: string;
        };
        Update: {
          content?: Json;
          created_at?: string;
          for_user_id?: string;
          id?: number;
          status?: string;
        };
        Relationships: [
          {
            foreignKeyName: "public_user_notifications_for_user_id_fkey";
            columns: ["for_user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      users: {
        Row: {
          email: string | null;
          full_name: string | null;
          id: string;
          metadata: Json | null;
          updated_at: string | null;
        };
        Insert: {
          email?: string | null;
          full_name?: string | null;
          id: string;
          metadata?: Json | null;
          updated_at?: string | null;
        };
        Update: {
          email?: string | null;
          full_name?: string | null;
          id?: string;
          metadata?: Json | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "users_id_fkey";
            columns: ["id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      create_team_with_leader: {
        Args: {
          team_name: string;
          leader: string;
          invitee_emails: string[];
        };
        Returns: undefined;
      };
    };
    Enums: {
      team_request_status: "queued" | "delivered" | "accepted" | "rejected";
      team_request_type: "invite" | "request";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type PublicSchema = Database[Extract<keyof Database, "public">];

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never;
