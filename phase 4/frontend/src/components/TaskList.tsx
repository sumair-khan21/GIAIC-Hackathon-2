"use client";

import { Task } from "@/types/task";
import TaskCard from "./TaskCard";
import { motion } from "framer-motion";
import { Layers } from "lucide-react";

interface TaskListProps {
  tasks: Task[];
  isLoading?: boolean;
  onToggleComplete?: (taskId: number) => void;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
};

export default function TaskList({
  tasks,
  isLoading = false,
  onToggleComplete,
}: TaskListProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, index) => (
          <div
            key={index}
            className="h-40 rounded-2xl bg-slate-200/50 dark:bg-slate-800/50 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center py-20 text-center"
      >
        <div className="w-24 h-24 bg-gradient-to-br from-violet-100 to-fuchsia-100 dark:from-violet-900/40 dark:to-fuchsia-900/40 rounded-full flex items-center justify-center mb-6 animate-float">
          <Layers className="w-10 h-10 text-purple-600 dark:text-purple-400" />
        </div>
        <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-fuchsia-600">
          No tasks found
        </h3>
        <p className="mt-2 text-slate-500 max-w-sm mx-auto">
          You&apos;re all caught up! Create a new task to get started with your productivity journey.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20"
    >
      {tasks.map((task, index) => (
        <TaskCard
          key={task.id}
          task={task}
          onToggleComplete={onToggleComplete}
          index={index}
        />
      ))}
    </motion.div>
  );
}
