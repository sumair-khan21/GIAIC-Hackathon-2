"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { MessageCircle, Sparkles } from "lucide-react";

interface ChatButtonProps {
  variant?: "fixed" | "inline";
}

export default function ChatButton({ variant = "fixed" }: ChatButtonProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push("/chat");
  };

  if (variant === "inline") {
    return (
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleClick}
        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-medium shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-shadow"
      >
        <Sparkles className="w-5 h-5" />
        AI Chat
      </motion.button>
    );
  }

  // Fixed floating action button
  return (
    <motion.button
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.3 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={handleClick}
      className="fixed bottom-6 right-6 z-40 group sm:bottom-6 sm:right-6"
    >
      <div className="relative">
        {/* Glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />

        {/* Button */}
        <div className="relative w-14 h-14 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-full shadow-xl shadow-emerald-500/30 flex items-center justify-center">
          <MessageCircle className="w-6 h-6" />
        </div>

        {/* Tooltip */}
        <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-slate-900 dark:bg-slate-800 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap">
          Chat with AI
          <div className="absolute left-full top-1/2 -translate-y-1/2 border-8 border-transparent border-l-slate-900 dark:border-l-slate-800" />
        </div>
      </div>
    </motion.button>
  );
}
