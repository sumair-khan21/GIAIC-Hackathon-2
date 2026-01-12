"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { taskSchema, TaskFormData } from "@/lib/validations";
import { Task } from "@/types/task";

interface TaskFormProps {
  mode: "create" | "edit";
  initialData?: Task;
  onSubmit: (data: TaskFormData) => Promise<void>;
  onCancel?: () => void;
}

export default function TaskForm({
  mode,
  initialData,
  onSubmit,
  onCancel,
}: TaskFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
    },
  });

  const handleFormSubmit = async (data: TaskFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      await onSubmit(data);
      if (mode === "create") {
        reset();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      {error && (
        <div className="bg-error/10 border border-error text-error px-4 py-3 rounded-md text-sm">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-foreground">
          Title <span className="text-error">*</span>
        </label>
        <input
          {...register("title")}
          type="text"
          id="title"
          className="mt-1 block w-full px-3 py-2 border border-border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-background text-foreground"
          placeholder="What needs to be done?"
        />
        {errors.title && (
          <p className="mt-1 text-sm text-error">{errors.title.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-foreground">
          Description
        </label>
        <textarea
          {...register("description")}
          id="description"
          rows={3}
          className="mt-1 block w-full px-3 py-2 border border-border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-background text-foreground resize-none"
          placeholder="Add some details (optional)"
        />
        {errors.description && (
          <p className="mt-1 text-sm text-error">{errors.description.message}</p>
        )}
      </div>

      <div className="flex space-x-3">
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading
            ? mode === "create"
              ? "Creating..."
              : "Saving..."
            : mode === "create"
            ? "Add Task"
            : "Save Changes"}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-border rounded-md shadow-sm text-sm font-medium text-foreground bg-background hover:bg-muted/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
