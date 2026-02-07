"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { taskSchema, TaskFormData } from "@/lib/validations";
import { Task } from "@/types/task";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, AlertCircle, Save, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

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
  const [serverError, setServerError] = useState<string | null>(null);

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
    setServerError(null);

    try {
      await onSubmit(data);
      if (mode === "create") {
        reset();
      }
    } catch {
      setServerError("An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-6"
      onSubmit={handleSubmit(handleFormSubmit)}
    >
      <AnimatePresence>
        {serverError && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 px-4 py-3 rounded-xl text-sm flex items-center gap-2"
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {serverError}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-2">
        <label htmlFor="title" className="block text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">
          Task Title
        </label>
        <div className="relative">
          <input
            {...register("title")}
            type="text"
            id="title"
            className={cn(
              "w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-700 input-ring text-slate-900 dark:text-white placeholder:text-slate-500",
              errors.title && "border-red-500 focus:ring-red-500"
            )}
            placeholder="What needs to be done?"
          />
        </div>
        {errors.title && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs text-red-500 ml-1"
          >
            {errors.title.message}
          </motion.p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="description" className="block text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">
          Description
        </label>
        <textarea
          {...register("description")}
          id="description"
          rows={4}
          className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-700 input-ring text-slate-900 dark:text-white placeholder:text-slate-500 resize-none"
          placeholder="Add details, context, or subtasks..."
        />
        {errors.description && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs text-red-500 ml-1"
          >
            {errors.description.message}
          </motion.p>
        )}
      </div>

      <div className="flex items-center gap-3 pt-2">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={isLoading}
          className="flex-1 btn-primary flex items-center justify-center gap-2 h-11"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : mode === "create" ? (
            <>
              <Plus className="w-5 h-5" />
              Add Task
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Changes
            </>
          )}
        </motion.button>

        {onCancel && (
          <motion.button
            whileHover={{ scale: 1.02, backgroundColor: "rgba(100, 116, 139, 0.1)" }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={onCancel}
            className="px-6 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-medium hover:text-slate-900 dark:hover:text-white transition-colors h-11"
          >
            Cancel
          </motion.button>
        )}
      </div>
    </motion.form>
  );
}
