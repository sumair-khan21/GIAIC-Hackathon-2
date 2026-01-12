"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import TaskForm from "@/components/TaskForm";
import TaskList from "@/components/TaskList";
import FilterBar from "@/components/FilterBar";
import { Task, TaskFilter } from "@/types/task";
import { TaskFormData } from "@/lib/validations";
import { getTasks, createTask, toggleComplete } from "@/lib/api";
import { getUserId } from "@/lib/auth";

export default function DashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const filter = (searchParams.get("filter") as TaskFilter) || "all";

  const fetchTasks = useCallback(async () => {
    if (!userId) return;

    setIsLoading(true);
    setError(null);

    try {
      const fetchedTasks = await getTasks(userId, filter);
      setTasks(fetchedTasks);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load tasks");
    } finally {
      setIsLoading(false);
    }
  }, [userId, filter]);

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
      fetchTasks();
    }
  }, [userId, fetchTasks]);

  const handleCreateTask = async (data: TaskFormData) => {
    if (!userId) return;

    await createTask(userId, data);
    await fetchTasks();
  };

  const handleToggleComplete = async (taskId: number) => {
    if (!userId) return;

    // Optimistic update
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );

    try {
      await toggleComplete(userId, taskId);
    } catch {
      // Revert on error
      await fetchTasks();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Create Task Form */}
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Create New Task
            </h2>
            <div className="bg-background border border-border rounded-lg p-4">
              <TaskForm mode="create" onSubmit={handleCreateTask} />
            </div>
          </section>

          {/* Filter and Task List */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">
                Your Tasks
              </h2>
              <FilterBar currentFilter={filter} />
            </div>

            {error && (
              <div className="bg-error/10 border border-error text-error px-4 py-3 rounded-md mb-4">
                {error}
              </div>
            )}

            <TaskList
              tasks={tasks}
              isLoading={isLoading}
              onToggleComplete={handleToggleComplete}
            />
          </section>
        </div>
      </main>
    </div>
  );
}
