import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

function normalizeContentRow(row: Record<string, unknown>) {
  return {
    ...row,
    description: row.description ?? row.excerpt ?? "",
    tarjetas: row.tarjetas ?? row.tag ?? row.tarjeta ?? "",
  };
}

export function useContentData<T>(tableName: string, pageSize: number) {
  const [items, setItems] = useState<T[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setError(null);
      const { data, error: queryError } = await supabase
        .from(tableName)
        .select("*")
        .eq("published", true)
        .order("sort_order");

      if (cancelled) return;

      if (queryError) {
        console.error(`[useContentData] ${tableName}:`, queryError.message);
        setError(queryError.message);
        setItems([]);
        return;
      }

      setItems(((data ?? []) as Record<string, unknown>[]).map(normalizeContentRow) as T[]);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [tableName]);

  const totalPages = items ? Math.ceil(items.length / pageSize) : 0;
  const currentItems = items ? items.slice((currentPage - 1) * pageSize, currentPage * pageSize) : [];

  return { items, currentItems, currentPage, totalPages, setCurrentPage, error };
}