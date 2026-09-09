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

  const featuredItem = items && items.length > 0 ? items[0] : null;
  const rest = items ? items.slice(1) : [];
  const page1SecondaryCount = Math.max(pageSize - 1, 0);

  let totalPages = 0;
  if (items && items.length > 0) {
    if (rest.length <= page1SecondaryCount) {
      totalPages = 1;
    } else {
      totalPages = 1 + Math.ceil((rest.length - page1SecondaryCount) / pageSize);
    }
  }

  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  let secondaryItems: T[] = [];
  if (items) {
    if (currentPage === 1) {
      secondaryItems = rest.slice(0, page1SecondaryCount);
    } else {
      const offset = page1SecondaryCount + (currentPage - 2) * pageSize;
      secondaryItems = rest.slice(offset, offset + pageSize);
    }
  }

  return {
    items,
    featuredItem,
    secondaryItems,
    currentPage,
    totalPages,
    setCurrentPage,
    error,
  };
}
