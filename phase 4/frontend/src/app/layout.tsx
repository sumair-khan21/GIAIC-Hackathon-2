import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "@/components/ThemeProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Todo App | Premium Task Management",
  description: "A stunning, modern task management application built with Next.js",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-background text-foreground transition-colors duration-500`}
      >
        <ThemeProvider>
          <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-100 via-background to-background dark:from-purple-900/20 dark:via-background dark:to-background" />
          <div className="fixed inset-0 -z-10 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />

          <main className="relative z-10">
            {children}
          </main>
          <Toaster
            position="top-right"
            toastOptions={{
              className: 'glass !bg-white/80 dark:!bg-slate-900/80 !text-foreground !backdrop-blur-md',
              duration: 4000,
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
