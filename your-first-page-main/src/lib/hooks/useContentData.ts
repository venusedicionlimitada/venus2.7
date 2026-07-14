import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useContentData<T>(tableName: string, pageSize: number) {
  const [items, setItems] = useState<T[] | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    supabase.from(tableName)
      .select("*")
      .eq("published", true)
      .order("sort_order")
      .then(({ data }) => setItems((data ?? []) as T[]));
  }, [tableName]);

  const totalPages = items ? Math.ceil(items.length / pageSize) : 0;
  const currentItems = items ? items.slice((currentPage - 1) * pageSize, currentPage * pageSize) : [];

  return { items, currentItems, currentPage, totalPages, setCurrentPage };
}