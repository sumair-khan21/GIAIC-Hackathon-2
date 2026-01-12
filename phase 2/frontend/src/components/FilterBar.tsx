"use client";

import { useRouter, usePathname } from "next/navigation";
import { TaskFilter } from "@/types/task";

interface FilterBarProps {
  currentFilter: TaskFilter;
}

const filters: { value: TaskFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "completed", label: "Completed" },
];

export default function FilterBar({ currentFilter }: FilterBarProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleFilterChange = (filter: TaskFilter) => {
    const params = new URLSearchParams();
    if (filter !== "all") {
      params.set("filter", filter);
    }
    const queryString = params.toString();
    router.push(queryString ? `${pathname}?${queryString}` : pathname);
  };

  return (
    <div className="flex space-x-2">
      {filters.map((filter) => (
        <button
          key={filter.value}
          onClick={() => handleFilterChange(filter.value)}
          className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
            currentFilter === filter.value
              ? "bg-primary text-white"
              : "bg-background text-foreground border border-border hover:bg-muted/10"
          }`}
          aria-pressed={currentFilter === filter.value}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
}
