"use client";

import Link from "next/link";
import { Task } from "@/types/task";

interface TaskCardProps {
  task: Task;
  onToggleComplete?: (taskId: number) => void;
}

export default function TaskCard({ task, onToggleComplete }: TaskCardProps) {
  const descriptionPreview = task.description
    ? task.description.length > 50
      ? `${task.description.substring(0, 50)}...`
      : task.description
    : null;

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    onToggleComplete?.(task.id);
  };

  return (
    <div className="bg-background border border-border rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start space-x-3">
        <input
          type="checkbox"
          checked={task.completed}
          onChange={handleCheckboxChange}
          className="mt-1 h-4 w-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
          aria-label={`Mark "${task.title}" as ${task.completed ? "incomplete" : "complete"}`}
        />
        <Link href={`/tasks/${task.id}`} className="flex-1 min-w-0">
          <h3
            className={`text-lg font-medium ${
              task.completed
                ? "line-through text-muted"
                : "text-foreground"
            }`}
          >
            {task.title}
          </h3>
          {descriptionPreview && (
            <p
              className={`mt-1 text-sm ${
                task.completed ? "text-muted/70" : "text-muted"
              }`}
            >
              {descriptionPreview}
            </p>
          )}
        </Link>
      </div>
    </div>
  );
}
