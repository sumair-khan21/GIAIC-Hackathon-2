"use client";

import { useState, useEffect, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import TaskForm from "@/components/TaskForm";
import { Task } from "@/types/task";
import { TaskFormData } from "@/lib/validations";
import { getTask, updateTask, deleteTask, toggleComplete } from "@/lib/api";
import { getUserId } from "@/lib/auth";

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
  const [error, setError] = useState<string | null>(null);

  const taskId = parseInt(id, 10);

  const fetchTask = useCallback(async () => {
    if (!userId || isNaN(taskId)) return;

    setIsLoading(true);
    setError(null);

    try {
      const fetchedTask = await getTask(userId, taskId);
      setTask(fetchedTask);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load task");
    } finally {
      setIsLoading(false);
    }
  }, [userId, taskId]);

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

    await updateTask(userId, task.id, data);
    await fetchTask();
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (!userId || !task) return;

    setIsDeleting(true);
    try {
      await deleteTask(userId, task.id);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete task");
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleToggleComplete = async () => {
    if (!userId || !task) return;

    try {
      const updatedTask = await toggleComplete(userId, task.id);
      setTask(updatedTask);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update task");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-48 bg-muted/30 rounded" />
            <div className="h-4 w-full bg-muted/30 rounded" />
            <div className="h-4 w-3/4 bg-muted/30 rounded" />
          </div>
        </main>
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-foreground mb-2">
              {error || "Task not found"}
            </h2>
            <p className="text-muted mb-4">
              The task you&apos;re looking for doesn&apos;t exist or you don&apos;t have access to it.
            </p>
            <Link
              href="/dashboard"
              className="text-primary hover:text-primary-dark font-medium"
            >
              Back to Dashboard
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link
            href="/dashboard"
            className="text-primary hover:text-primary-dark font-medium flex items-center"
          >
            <svg
              className="w-4 h-4 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Dashboard
          </Link>
        </div>

        {isEditing ? (
          <div className="bg-background border border-border rounded-lg p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Edit Task
            </h2>
            <TaskForm
              mode="edit"
              initialData={task}
              onSubmit={handleUpdate}
              onCancel={() => setIsEditing(false)}
            />
          </div>
        ) : (
          <div className="bg-background border border-border rounded-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start space-x-3">
                <button
                  onClick={handleToggleComplete}
                  className={`mt-1 h-5 w-5 rounded border-2 flex items-center justify-center transition-colors ${
                    task.completed
                      ? "bg-success border-success text-white"
                      : "border-border hover:border-primary"
                  }`}
                  aria-label={`Mark as ${task.completed ? "incomplete" : "complete"}`}
                >
                  {task.completed && (
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </button>
                <div>
                  <h1
                    className={`text-2xl font-bold ${
                      task.completed
                        ? "line-through text-muted"
                        : "text-foreground"
                    }`}
                  >
                    {task.title}
                  </h1>
                  <span
                    className={`inline-block mt-2 px-2 py-1 text-xs font-medium rounded ${
                      task.completed
                        ? "bg-success/10 text-success"
                        : "bg-primary/10 text-primary"
                    }`}
                  >
                    {task.completed ? "Completed" : "Pending"}
                  </span>
                </div>
              </div>
            </div>

            {task.description && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-muted mb-2">
                  Description
                </h3>
                <p
                  className={`whitespace-pre-wrap ${
                    task.completed ? "text-muted" : "text-foreground"
                  }`}
                >
                  {task.description}
                </p>
              </div>
            )}

            <div className="text-sm text-muted mb-6">
              <p>Created: {new Date(task.created_at).toLocaleString()}</p>
              <p>Updated: {new Date(task.updated_at).toLocaleString()}</p>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 border border-border rounded-md shadow-sm text-sm font-medium text-foreground bg-background hover:bg-muted/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                Edit
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="px-4 py-2 border border-error rounded-md shadow-sm text-sm font-medium text-error bg-background hover:bg-error/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-error"
              >
                Delete
              </button>
            </div>
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-background rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Delete Task?
              </h3>
              <p className="text-muted mb-4">
                Are you sure you want to delete &quot;{task.title}&quot;? This action
                cannot be undone.
              </p>
              <div className="flex space-x-3 justify-end">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 border border-border rounded-md shadow-sm text-sm font-medium text-foreground bg-background hover:bg-muted/10"
                  disabled={isDeleting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-error hover:bg-error/90 disabled:opacity-50"
                  disabled={isDeleting}
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
