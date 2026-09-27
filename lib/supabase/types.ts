export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          avatar_url: string | null;
          role: "customer" | "admin";
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["profiles"]["Row"]> & { id: string };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Row"]>;
        Relationships: [];
      };
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["categories"]["Row"]> & {
          name: string;
          slug: string;
        };
        Update: Partial<Database["public"]["Tables"]["categories"]["Row"]>;
        Relationships: [];
      };
      products: {
        Row: {
          id: string;
          category_id: string | null;
          name: string;
          slug: string;
          description: string | null;
          price_cents: number;
          currency: string;
          image_url: string | null;
          stock: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["products"]["Row"]> & {
          name: string;
          slug: string;
          price_cents: number;
        };
        Update: Partial<Database["public"]["Tables"]["products"]["Row"]>;
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          }
        ];
      };
      cart_items: {
        Row: {
          id: string;
          user_id: string;
          product_id: string;
          quantity: number;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["cart_items"]["Row"]> & {
          user_id: string;
          product_id: string;
          quantity: number;
        };
        Update: Partial<Database["public"]["Tables"]["cart_items"]["Row"]>;
        Relationships: [
          {
            foreignKeyName: "cart_items_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          }
        ];
      };
      addresses: {
        Row: {
          id: string;
          user_id: string;
          label: string;
          full_name: string;
          phone: string | null;
          line1: string;
          line2: string | null;
          city: string;
          state: string;
          postal_code: string;
          country: string;
          is_default: boolean;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["addresses"]["Row"]> & {
          user_id: string;
          full_name: string;
          line1: string;
          city: string;
          state: string;
          postal_code: string;
        };
        Update: Partial<Database["public"]["Tables"]["addresses"]["Row"]>;
        Relationships: [];
      };
      promo_codes: {
        Row: {
          id: string;
          code: string;
          description: string | null;
          discount_type: "percent" | "fixed";
          discount_value: number;
          max_discount_cents: number | null;
          min_order_cents: number;
          is_active: boolean;
          expires_at: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["promo_codes"]["Row"]> & {
          code: string;
          discount_type: "percent" | "fixed";
          discount_value: number;
        };
        Update: Partial<Database["public"]["Tables"]["promo_codes"]["Row"]>;
        Relationships: [];
      };
      orders: {
        Row: {
          id: string;
          user_id: string;
          status: "pending" | "paid" | "shipped" | "delivered" | "cancelled";
          subtotal_cents: number;
          discount_cents: number;
          promo_code: string | null;
          total_cents: number;
          currency: string;
          shipping_name: string | null;
          shipping_phone: string | null;
          shipping_line1: string | null;
          shipping_line2: string | null;
          shipping_city: string | null;
          shipping_state: string | null;
          shipping_postal_code: string | null;
          shipping_address: string | null;
          razorpay_order_id: string | null;
          razorpay_payment_id: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["orders"]["Row"]> & {
          user_id: string;
          total_cents: number;
        };
        Update: Partial<Database["public"]["Tables"]["orders"]["Row"]>;
        Relationships: [];
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string | null;
          product_name: string;
          unit_price_cents: number;
          quantity: number;
        };
        Insert: Partial<Database["public"]["Tables"]["order_items"]["Row"]> & {
          order_id: string;
          product_name: string;
          unit_price_cents: number;
          quantity: number;
        };
        Update: Partial<Database["public"]["Tables"]["order_items"]["Row"]>;
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "order_items_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: Record<string, never>;
    Functions: {
      admin_set_user_role: {
        Args: { target_email: string; new_role: string };
        Returns: void;
      };
      admin_list_admins: {
        Args: Record<string, never>;
        Returns: {
          id: string;
          email: string;
          full_name: string | null;
          created_at: string;
        }[];
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type Product = Database["public"]["Tables"]["products"]["Row"];
export type Category = Database["public"]["Tables"]["categories"]["Row"];
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type CartItem = Database["public"]["Tables"]["cart_items"]["Row"];
export type Order = Database["public"]["Tables"]["orders"]["Row"];
export type OrderItem = Database["public"]["Tables"]["order_items"]["Row"];
export type Address = Database["public"]["Tables"]["addresses"]["Row"];
export type PromoCode = Database["public"]["Tables"]["promo_codes"]["Row"];
