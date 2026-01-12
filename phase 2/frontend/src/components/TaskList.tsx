"use client";

import { Task } from "@/types/task";
import TaskCard from "./TaskCard";

interface TaskListProps {
  tasks: Task[];
  isLoading?: boolean;
  onToggleComplete?: (taskId: number) => void;
}

export default function TaskList({
  tasks,
  isLoading = false,
  onToggleComplete,
}: TaskListProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, index) => (
          <div
            key={index}
            className="bg-background border border-border rounded-lg p-4 animate-pulse"
          >
            <div className="flex items-start space-x-3">
              <div className="mt-1 h-4 w-4 bg-muted/30 rounded" />
              <div className="flex-1">
                <div className="h-5 bg-muted/30 rounded w-3/4 mb-2" />
                <div className="h-4 bg-muted/30 rounded w-1/2" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-muted">
          <svg
            className="mx-auto h-12 w-12 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          <p className="text-lg font-medium">No tasks yet</p>
          <p className="mt-1 text-sm">Create your first task to get started!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          onToggleComplete={onToggleComplete}
        />
      ))}
    </div>
  );
}
