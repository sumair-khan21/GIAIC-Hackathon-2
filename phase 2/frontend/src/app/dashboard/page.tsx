"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import TaskForm from "@/components/TaskForm";
import TaskList from "@/components/TaskList";
import FilterBar from "@/components/FilterBar";
import Modal from "@/components/Modal";
import { Task, TaskFilter } from "@/types/task";
import { TaskFormData } from "@/lib/validations";
import { getTasks, createTask, toggleComplete } from "@/lib/api";
import { getUserId } from "@/lib/auth";
import { motion } from "framer-motion";
import { Plus, LayoutDashboard, CheckCircle2, Clock, ListTodo } from "lucide-react";
import toast from "react-hot-toast";

export default function DashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filter = (searchParams.get("filter") as TaskFilter) || "all";

  // Calculate stats
  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.completed).length,
    pending: tasks.filter(t => !t.completed).length
  };

  const fetchTasks = useCallback(async () => {
    if (!userId) return;

    setIsLoading(true);
    try {
      const fetchedTasks = await getTasks(userId, filter);
      setTasks(fetchedTasks); // In a real app we might want to fetch all tasks for stats if the API limits by filter
    } catch {
      toast.error("Failed to load tasks");
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

    try {
      await createTask(userId, data);
      await fetchTasks();
      setIsModalOpen(false);
      toast.success("Task created successfully!");
    } catch {
      toast.error("Failed to create task");
    }
  };

  const handleToggleComplete = async (taskId: number) => {
    if (!userId) return;

    // Optimistic update
    const previousTasks = [...tasks];
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );

    try {
      await toggleComplete(userId, taskId);
      const task = tasks.find(t => t.id === taskId);
      if (task && !task.completed) {
        toast.success("Task completed! 🎉");
      }
    } catch {
      // Revert on error
      setTasks(previousTasks);
      toast.error("Failed to update task");
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header />

      <main className="pt-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Hero Section */}
        <section className="relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center sm:text-left space-y-2 mb-8"
          >
            <h1 className="text-4xl sm:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 dark:from-violet-400 dark:via-purple-400 dark:to-fuchsia-400 pb-2">
              Welcome back!
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl">
              Here&apos;s an overview of your productivity today. You have {stats.pending} pending tasks.
            </p>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {[
              { label: "Total Tasks", value: stats.total, icon: ListTodo, color: "text-blue-500", bg: "bg-blue-500/10" },
              { label: "Completed", value: stats.completed, icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10" },
              { label: "Pending", value: stats.pending, icon: Clock, color: "text-amber-500", bg: "bg-amber-500/10" },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="glass-card p-6 flex items-center justify-between"
              >
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.label}</p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-xl ${stat.bg}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Task Section */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sticky top-20 z-30 py-4 bg-background/80 backdrop-blur-xl -mx-4 px-4 sm:mx-0 sm:px-0 sm:bg-transparent sm:backdrop-blur-none">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <LayoutDashboard className="w-6 h-6 text-purple-600" />
              Your Tasks
            </h2>
            <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
              <FilterBar currentFilter={filter} />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsModalOpen(true)}
                className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-xl font-medium shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-shadow"
              >
                <Plus className="w-5 h-5" />
                New Task
              </motion.button>
            </div>
          </div>

          <TaskList
            tasks={tasks}
            isLoading={isLoading}
            onToggleComplete={handleToggleComplete}
          />
        </section>
      </main>

      {/* Floating Action Button (Mobile) */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-6 right-6 sm:hidden w-14 h-14 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-full shadow-xl shadow-purple-500/30 flex items-center justify-center z-40"
      >
        <Plus className="w-7 h-7" />
      </motion.button>

      {/* Create Task Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Task"
      >
        <TaskForm
          mode="create"
          onSubmit={handleCreateTask}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
}
