'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import type { Id } from '../../../convex/_generated/dataModel';
import Message from './Message';
import Loading from './Loading';
import ErrorPage from './ErrorPage';
import TypingIndicator from './TypingIndicator'; // ✅ your indicator component
import type { CreateMessage } from '@ai-sdk/react';
import { useAuth } from '@/app/providers/AuthProvider';

type ChatProps = {
  chatId: Id<'chats'>;
  firstMessage: CreateMessage | null;
};

type ConvexMessage = {
  _id: Id<'messages'>;
  _creationTime: number;
  role: 'user' | 'assistant';
  content: string;
};

export default function Chat({ chatId, firstMessage }: ChatProps) {
  const { token, isReady } = useAuth();

  const addMessage = useMutation(api.messages.addMessage);
  const updateMessage = useMutation(api.messages.updateMessage);

  const messages = useQuery(api.messages.getMessages, token && chatId ? { token, chatId } : 'skip') as
    | ConvexMessage[]
    | undefined;

  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);

  // Keep reference to the temporary assistant message id during streaming
  const tempAssistantIdRef = useRef<Id<'messages'> | null>(null);

  // Insert the initial user message once (when chat created by UserForm)
  const insertedFirstRef = useRef(false);
  useEffect(() => {
    if (!isReady || !token || !firstMessage || insertedFirstRef.current) return;
    insertedFirstRef.current = true;
    addMessage({
      token,
      chatId,
      role: 'user',
      content: firstMessage.content,
    }).catch((e) => console.error('addMessage(first) failed:', e));
  }, [firstMessage, chatId, token, isReady, addMessage]);

  // Build context for /api/chat request from Convex messages
  const contextMessages = useMemo(() => {
    if (!messages) return [];
    return messages.map((m) => ({ role: m.role, content: m.content }));
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !input.trim()) return;

    const userText = input.trim();
    setInput('');
    setIsSending(true);
    setIsStreaming(true);

    try {
      // 1) Persist user follow-up
      await addMessage({ token, chatId, role: 'user', content: userText });

      // 2) Create a temporary assistant message immediately
      const tempAssistantId = (await addMessage({
        token,
        chatId,
        role: 'assistant',
        content: '…',
      })) as Id<'messages'>;
      tempAssistantIdRef.current = tempAssistantId;

      // 3) Stream assistant response from your /api/chat
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...contextMessages, { role: 'user', content: userText }],
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error(`AI HTTP ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let fullText = '';
      let buffer = '';
      let lastPatchedAt = 0;

      const patchNow = async (text: string) => {
        try {
          await updateMessage({
            token,
            messageId: tempAssistantId,
            content: text,
          });
        } catch (err) {
          console.error('updateMessage patch failed:', err);
        }
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith('data:')) continue;

          const jsonStr = trimmed.replace(/^data:\s*/, '');
          if (jsonStr === '[DONE]') continue;

          try {
            const parsed = JSON.parse(jsonStr);
            const delta = parsed.choices?.[0]?.delta;
            const chunk = typeof delta?.content === 'string' ? delta.content : '';
            if (chunk) {
              fullText += chunk;
              const now = Date.now();
              // Throttle patching to ~12.5fps
              if (now - lastPatchedAt > 80) {
                lastPatchedAt = now;
                patchNow(fullText);
              }
            }
          } catch {
            // Ignore non-JSON lines
          }
        }
      }

      // Final patch to ensure last bit is saved
      await updateMessage({
        token,
        messageId: tempAssistantId,
        content: fullText.trim() ? fullText : 'Elnézést, nem sikerült választ generálni.',
      });
    } catch (err) {
      console.error('Follow-up send failed:', err);
      await addMessage({
        token,
        chatId,
        role: 'assistant',
        content: 'Hiba történt a válasz generálásakor. Kérlek, próbáld újra később.',
      }).catch(() => {});
    } finally {
      setIsSending(false);
      setIsStreaming(false);
      tempAssistantIdRef.current = null;
    }
  };

  if (!isReady) return <Loading />;
  if (!token) return <ErrorPage message="Kérjük, jelentkezz be a folytatáshoz." />;
  if (!messages) return <Loading />;

  return (
    <div className="flex flex-col w-full max-w-2xl">
      <div className="space-y-4 mb-4">
        {messages.map((m) => (
          <Message key={m._id} role={m.role} content={m.content} />
        ))}

        {/* Typing indicator bubble (shows while streaming) */}
        {isStreaming && (
          <div className="p-4 rounded-lg whitespace-pre-wrap border border-[#333333] bg-[#222222] text-left">
            <div className="text-sm font-semibold text-[#FFD700] mb-2">AI</div>
            <TypingIndicator rotating />
          </div>
        )}
      </div>

      <form onSubmit={handleSend} className="flex gap-2 mt-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Írj egy további kérdést..."
          className="flex-grow bg-[#333333] text-[#F5F5F5] border border-[#444444] p-3 rounded focus:outline-none focus:border-[#FFD700]"
          disabled={isSending}
          aria-label="Következő üzenet"
        />
        <button
          type="submit"
          disabled={isSending || !input.trim()}
          className="bg-[#FFD700] hover:bg-yellow-400 disabled:bg-[#6b6b6b] text-black font-bold px-4 py-3 rounded transition-colors duration-300"
        >
          {isSending ? 'Küldés...' : 'Küldés'}
        </button>
      </form>
    </div>
  );
}
