# Frontend Chat UI Specification

**Component**: frontend-chat-ui
**Parent Feature**: 003-cohere-chatbot

## Overview

React components for chat interface with message display, input handling, and floating action button.

## Chat Page Component

```typescript
// app/chat/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { Send, Bot, User } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/signin');
    }
  }, [status, router]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/${session?.user?.id}/chat`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.accessToken}`,
          },
          body: JSON.stringify({
            conversation_id: conversationId,
            message: userMessage,
          }),
        }
      );

      if (!response.ok) throw new Error('Chat request failed');

      const data = await response.json();
      setConversationId(data.conversation_id);
      setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
    } catch (error) {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: 'Sorry, something went wrong. Please try again.' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (status === 'loading') {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  return (
    <div className="flex h-screen flex-col bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-xl p-4">
        <div className="flex items-center gap-3">
          <Bot className="w-8 h-8 text-violet-600" />
          <div>
            <h1 className="font-semibold text-lg">Task Assistant</h1>
            <p className="text-sm text-slate-500">Manage tasks with natural language</p>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-slate-400 mt-20">
            <Bot className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>Start a conversation to manage your tasks!</p>
            <p className="text-sm mt-2">Try: "Add buy groceries" or "Show my tasks"</p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`flex items-start gap-2 max-w-[80%] ${
                msg.role === 'user' ? 'flex-row-reverse' : ''
              }`}
            >
              <div className={`p-2 rounded-full ${
                msg.role === 'user' ? 'bg-violet-600' : 'bg-slate-200'
              }`}>
                {msg.role === 'user' ? (
                  <User className="w-4 h-4 text-white" />
                ) : (
                  <Bot className="w-4 h-4 text-slate-600" />
                )}
              </div>
              <div
                className={`p-4 rounded-2xl ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white'
                    : 'bg-white shadow-sm border'
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-white p-4 rounded-2xl shadow-sm border">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-100" />
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-200" />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t bg-white p-4">
        <div className="flex gap-2 max-w-4xl mx-auto">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me to manage your tasks..."
            className="flex-1 p-3 rounded-full border focus:outline-none focus:ring-2 focus:ring-violet-500"
            disabled={loading}
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="p-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-full disabled:opacity-50 hover:shadow-lg transition-shadow"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
```

## Floating Chat Button

Add to dashboard or layout:

```typescript
// components/ChatButton.tsx
'use client';

import Link from 'next/link';
import { MessageCircle } from 'lucide-react';

export function ChatButton() {
  return (
    <Link href="/chat">
      <button
        className="fixed bottom-6 right-6 p-4 bg-gradient-to-r from-violet-600 to-purple-600
                   text-white rounded-full shadow-lg hover:shadow-xl transition-shadow z-50
                   hover:scale-105 active:scale-95"
        aria-label="Open chat assistant"
      >
        <MessageCircle className="w-6 h-6" />
      </button>
    </Link>
  );
}
```

## Header Navigation Link

```typescript
// In header component
import Link from 'next/link';
import { MessageCircle } from 'lucide-react';

<Link href="/chat" className="flex items-center gap-2 hover:text-violet-600">
  <MessageCircle className="w-5 h-5" />
  <span>Chat</span>
</Link>
```

## Integration Points

1. Add `ChatButton` to `app/dashboard/page.tsx`
2. Add chat link to header navigation
3. Create `app/chat/page.tsx` with chat component
4. Ensure `lucide-react` is installed for icons

## Styling Notes

- Uses existing Tailwind config
- Gradient matches dashboard theme (violet-600 → purple-600)
- Glassmorphism effect with backdrop-blur
- Responsive design (mobile-friendly)
- Accessible (ARIA labels, keyboard navigation)
