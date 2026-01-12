"use client";

import { useRouter, usePathname } from "next/navigation";
import { TaskFilter } from "@/types/task";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface FilterBarProps {
  currentFilter: TaskFilter;
}

const filters: { value: TaskFilter; label: string }[] = [
  { value: "all", label: "All Tasks" },
  { value: "pending", label: "In Progress" },
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
    <div className="flex p-1 space-x-1 bg-white dark:bg-slate-800/50 backdrop-blur-md rounded-xl border border-slate-200 dark:border-slate-700/50 w-fit mx-auto sm:mx-0 shadow-sm">
      {filters.map((filter) => {
        const isActive = currentFilter === filter.value;
        return (
          <button
            key={filter.value}
            onClick={() => handleFilterChange(filter.value)}
            className={cn(
              "relative px-4 py-2 text-sm font-medium rounded-lg transition-colors z-10",
              isActive
                ? "text-white"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            )}
          >
            {isActive && (
              <motion.div
                layoutId="activeFilter"
                className="absolute inset-0 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-lg -z-10 shadow-md shadow-purple-500/20"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
            {filter.label}
          </button>
        );
      })}
    </div>
  );
}
