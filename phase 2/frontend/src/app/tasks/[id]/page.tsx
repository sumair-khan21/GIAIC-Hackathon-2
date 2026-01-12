"use client";

import { useState, useEffect, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import TaskForm from "@/components/TaskForm";
import Modal from "@/components/Modal";
import { Task } from "@/types/task";
import { TaskFormData } from "@/lib/validations";
import { getTask, updateTask, deleteTask, toggleComplete } from "@/lib/api";
import { getUserId } from "@/lib/auth";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Calendar, Clock, Edit2, Trash2, CheckCircle2, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

interface TaskDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function TaskDetailPage({ params }: TaskDetailPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [task, setTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const taskId = parseInt(id, 10);

  const fetchTask = useCallback(async () => {
    if (!userId || isNaN(taskId)) return;

    setIsLoading(true);
    try {
      const fetchedTask = await getTask(userId, taskId);
      setTask(fetchedTask);
    } catch {
      toast.error("Failed to load task details");
      router.push("/dashboard");
    } finally {
      setIsLoading(false);
    }
  }, [userId, taskId, router]);

  useEffect(() => {
    const initUser = async () => {
      const id = await getUserId();
      if (id) {
        setUserId(id);
      } else {
        router.push("/auth/signin");
      }
    };
    initUser();
  }, [router]);

  useEffect(() => {
    if (userId) {
      fetchTask();
    }
  }, [userId, fetchTask]);

  const handleUpdate = async (data: TaskFormData) => {
    if (!userId || !task) return;

    try {
      await updateTask(userId, task.id, data);
      await fetchTask();
      setIsEditing(false);
      toast.success("Task updated successfully");
    } catch {
      toast.error("Failed to update task");
    }
  };

  const handleDelete = async () => {
    if (!userId || !task) return;

    setIsDeleting(true);
    try {
      await deleteTask(userId, task.id);
      toast.success("Task deleted successfully");
      router.push("/dashboard");
    } catch {
      toast.error("Failed to delete task");
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleToggleComplete = async () => {
    if (!userId || !task) return;

    // Optimistic update
    const prevTask = { ...task };
    setTask({ ...task, completed: !task.completed });

    try {
      const updatedTask = await toggleComplete(userId, task.id);
      setTask(updatedTask);
      if (!prevTask.completed) {
        toast.success("Task completed! 🎉");
      }
    } catch {
      setTask(prevTask);
      toast.error("Failed to update status");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <Header />
        <main className="pt-24 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-8">
            <div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded" />
            <div className="space-y-4">
              <div className="h-8 w-3/4 bg-slate-200 dark:bg-slate-800 rounded" />
              <div className="h-4 w-1/2 bg-slate-200 dark:bg-slate-800 rounded" />
            </div>
            <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          </div>
        </main>
      </div>
    );
  }

  if (!task) return null;

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header />

      <main className="pt-24 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-8"
        >
          <Link
            href="/dashboard"
            className="inline-flex items-center text-slate-500 hover:text-violet-600 dark:text-slate-400 dark:hover:text-violet-400 transition-colors font-medium group"
          >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Dashboard
          </Link>
        </motion.div>

        <AnimatePresence mode="wait">
          {isEditing ? (
            <motion.div
              key="edit"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="glass-card p-6 sm:p-8"
            >
              <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-fuchsia-600 mb-6">
                Edit Task
              </h2>
              <TaskForm
                mode="edit"
                initialData={task}
                onSubmit={handleUpdate}
                onCancel={() => setIsEditing(false)}
              />
            </motion.div>
          ) : (
            <motion.div
              key="view"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="glass-card p-6 sm:p-8 relative overflow-hidden"
            >
              <div className={cn(
                "absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-600 to-fuchsia-600 transition-opacity duration-300",
                task.completed ? "opacity-30" : "opacity-100"
              )} />

              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 mb-8">
                <div className="flex items-start gap-4">
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={handleToggleComplete}
                    className={cn(
                      "mt-1.5 flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-300",
                      task.completed
                        ? "bg-emerald-500 border-emerald-500 shadow-lg shadow-emerald-500/30"
                        : "border-slate-300 dark:border-slate-600 hover:border-violet-500"
                    )}
                  >
                    {task.completed && <CheckCircle2 className="w-5 h-5 text-white" />}
                  </motion.button>

                  <div className="space-y-2">
                    <h1 className={cn(
                      "text-2xl sm:text-3xl font-bold transition-all duration-300",
                      task.completed
                        ? "text-slate-400 dark:text-slate-500 line-through decoration-slate-400/50"
                        : "text-slate-900 dark:text-white"
                    )}>
                      {task.title}
                    </h1>
                    <div className="flex items-center gap-3">
                      <span className={cn(
                        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
                        task.completed
                          ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400"
                          : "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400"
                      )}>
                        {task.completed ? "Completed" : "In Progress"}
                      </span>
                      <span className="text-sm text-slate-500 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        Created {new Date(task.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:self-start">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsEditing(true)}
                    className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <Edit2 className="w-5 h-5" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowDeleteConfirm(true)}
                    className="p-2 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>

              <div className="prose dark:prose-invert max-w-none">
                <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                  Description
                </h3>
                <div className="bg-slate-100 dark:bg-slate-900/50 rounded-xl p-6 border border-slate-200 dark:border-slate-800 min-h-[100px] text-slate-800 dark:text-slate-300 whitespace-pre-wrap leading-relaxed shadow-inner">
                  {task.description || <span className="text-slate-400 italic">No description provided.</span>}
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 text-sm text-slate-500">
                  <div className="p-2 rounded-lg bg-violet-500/10">
                    <Calendar className="w-4 h-4 text-violet-500" />
                  </div>
                  <div>
                    <p className="font-medium">Created</p>
                    <p>{new Date(task.created_at).toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-500">
                  <div className="p-2 rounded-lg bg-fuchsia-500/10">
                    <Clock className="w-4 h-4 text-fuchsia-500" />
                  </div>
                  <div>
                    <p className="font-medium">Last Updated</p>
                    <p>{new Date(task.updated_at).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          title="Delete Task"
        >
          <div className="space-y-6">
            <div className="flex items-center gap-4 p-4 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-100 dark:border-red-900/20">
              <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
                <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <p className="text-sm text-red-800 dark:text-red-200">
                Are you sure you want to delete this task? This action cannot be undone.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium shadow-lg shadow-red-500/20 transition-colors flex items-center justify-center gap-2"
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete Permanently"}
              </button>
            </div>
          </div>
        </Modal>
      </main>
    </div>
  );
}
