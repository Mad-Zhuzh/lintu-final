export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  __InternalSupabase: { PostgrestVersion: "14.5" };
  public: {
    Tables: {
      orders: {
        Row: { created_at: string; customer: string; delivery_date: string; delivery_time: string; from_address: string; id: string; order_number: number; price_rub: number; request_id: string | null; status: Database["public"]["Enums"]["order_status"]; to_address: string; weight_kg: number };
        Insert: { created_at?: string; customer: string; delivery_date: string; delivery_time: string; from_address: string; id?: string; order_number?: number; price_rub: number; request_id?: string | null; status?: Database["public"]["Enums"]["order_status"]; to_address: string; weight_kg: number };
        Update: Partial<Database["public"]["Tables"]["orders"]["Insert"]>;
        Relationships: [{ foreignKeyName: "orders_request_id_fkey"; columns: ["request_id"]; isOneToOne: true; referencedRelation: "requests"; referencedColumns: ["id"] }];
      };
      requests: {
        Row: { created_at: string; email: string | null; id: string; name: string; phone: string; status: Database["public"]["Enums"]["request_status"] };
        Insert: { created_at?: string; email?: string | null; id?: string; name: string; phone: string; status?: Database["public"]["Enums"]["request_status"] };
        Update: Partial<Database["public"]["Tables"]["requests"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: {
      create_order_from_request: { Args: { p_customer: string; p_delivery_date?: string; p_delivery_time?: string; p_from_address: string; p_price_rub: number; p_request_id: string; p_to_address: string; p_weight_kg: number }; Returns: Database["public"]["Tables"]["orders"]["Row"] };
      is_admin: { Args: Record<string, never>; Returns: boolean };
    };
    Enums: {
      order_status: "Принят" | "В полёте" | "Доставлен" | "Отменён";
      request_status: "Новая" | "Отменена" | "Заказ сформирован";
    };
    CompositeTypes: { [_ in never]: never };
  };
};

export const Constants = {
  public: {
    Enums: {
      order_status: ["Принят", "В полёте", "Доставлен", "Отменён"],
      request_status: ["Новая", "Отменена", "Заказ сформирован"],
    },
  },
} as const;
