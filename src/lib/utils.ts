// src/lib/utils.ts

import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

// 🔧 Tailwind className merge utility
export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}

// 🔥 Fetch featured products from Supabase
export const fetchFeaturedProducts = async (): Promise<Tables<"featuredProducts">[]> => {
  const { data, error } = await supabase
    .from("featuredProducts")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch featured products: ${error.message}`);
  }

  return data ?? [];
};
