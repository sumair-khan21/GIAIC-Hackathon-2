"use client";

import Link from "next/link";
import { Task } from "@/types/task";
import { motion } from "framer-motion";
import { Check, Clock, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

interface TaskCardProps {
  task: Task;
  onToggleComplete?: (taskId: number) => void;
  index?: number;
}

export default function TaskCard({ task, onToggleComplete, index = 0 }: TaskCardProps) {
  const descriptionPreview = task.description
    ? task.description.length > 80
      ? `${task.description.substring(0, 80)}...`
      : task.description
    : "No description provided";

  const handleCheckboxChange = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onToggleComplete?.(task.id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -5, boxShadow: "0 20px 40px -15px rgba(124, 58, 237, 0.1)" }}
      className="group relative"
    >
      <Link href={`/tasks/${task.id}`} className="block h-full">
        <div className={cn(
          "glass-card h-full p-5 flex flex-col justify-between overflow-hidden",
          task.completed ? "bg-slate-50/80 dark:bg-slate-900/30" : "bg-white dark:bg-slate-900/70"
        )}>
          {/* Gradient Border Line */}
          <div className={cn(
            "absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-violet-500 to-fuchsia-500 transition-opacity duration-300",
            task.completed ? "opacity-30" : "opacity-100"
          )} />

          <div className="flex items-start gap-4">
            <button
              onClick={handleCheckboxChange}
              className={cn(
                "mt-1 flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 z-20",
                task.completed
                  ? "bg-gradient-to-r from-emerald-500 to-green-500 border-transparent shadow-lg shadow-emerald-500/20"
                  : "border-slate-300 dark:border-slate-600 group-hover:border-violet-500"
              )}
            >
              {task.completed && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
            </button>

            <div className="flex-1 min-w-0">
              <h3 className={cn(
                "text-lg font-semibold transition-all duration-300",
                task.completed
                  ? "text-slate-400 dark:text-slate-500 line-through"
                  : "text-slate-800 dark:text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-violet-600 group-hover:to-fuchsia-600"
              )}>
                {task.title}
              </h3>

              <p className={cn(
                "mt-2 text-sm line-clamp-2 transition-colors",
                task.completed ? "text-slate-400/70" : "text-slate-600 dark:text-slate-400"
              )}>
                {descriptionPreview}
              </p>

              <div className="mt-4 flex items-center gap-3 text-xs text-slate-400 dark:text-slate-500">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>{new Date().toLocaleDateString()}</span>
                </div>
                {task.completed ? (
                  <span className="flex items-center gap-1 text-emerald-500 font-medium">
                    <Check className="w-3 h-3" />
                    Completed
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-amber-500 font-medium">
                    <Clock className="w-3 h-3" />
                    Pending
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Hover Glow Effect */}
          <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl group-hover:bg-purple-500/20 transition-all duration-500" />
        </div>
      </Link>
    </motion.div>
  );
}
