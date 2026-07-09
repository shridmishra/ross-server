import { useState, useEffect } from "react";

export function useCrcCategoryExpansion(currentCategory: string | null) {
  const [expandedCrcCategories, setExpandedCrcCategories] = useState<Record<string, boolean>>(
    currentCategory ? { [currentCategory]: true } : {}
  );

  useEffect(() => {
    if (currentCategory) {
      setExpandedCrcCategories((prev) => {
        // If only the current category is expanded and nothing else, skip update
        const keys = Object.keys(prev).filter((k) => prev[k]);
        if (keys.length === 1 && keys[0] === currentCategory) return prev;
        return { [currentCategory]: true };
      });
    }
  }, [currentCategory]);

  return {
    expandedCrcCategories,
    setExpandedCrcCategories,
  };
}
