'use client';

import { useState } from 'react';
import UserForm from './UserForm';
import ReactMarkdown from 'react-markdown';

export default function Home() {
  const [messages, setMessages] = useState<{ id: string; role: 'user' | 'assistant'; content: string }[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const append = async (message: { role: any; content: any }) => {
    const newMessage = {
      id: Date.now().toString(),
      role: message.role,
      content: message.content,
    };

    setMessages((prev) => [...prev, newMessage]);

    if (message.role === 'user') {
      const streamId = `streaming-${Date.now()}`;
      // Azonnal hozzáadjuk az AI üzenetet "Válasz generálása..." tartalommal
      setMessages((prev) => [
        ...prev,
        {
          id: streamId,
          role: 'assistant',
          content: 'Válasz generálása...',
        },
      ]);

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: [...messages, newMessage] }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder('utf-8');
        let text = '';
        let buffer = '';

        while (true) {
          const { done, value } = await reader!.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmed = line.trim();

            if (trimmed === '' || !trimmed.startsWith('data:')) continue;

            const jsonStr = trimmed.replace(/^data:\s*/, '');

            if (jsonStr === '[DONE]') {
              break;
            }

            try {
              const parsed = JSON.parse(jsonStr);
              const delta = parsed.choices?.[0]?.delta;

              let chunkText = '';

              if (delta?.content) {
                chunkText += delta.content;
              }

              if (chunkText) {
                text += chunkText;
                // Frissítjük az üzenetet, eltávolítva a "Válasz generálása..." szöveget
                setMessages((prev) => prev.map((msg) => (msg.id === streamId ? { ...msg, content: text } : msg)));
              }
            } catch (err) {
              console.error('JSON parse error:', err, jsonStr);
            }
          }
        }

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === streamId
              ? {
                  ...msg,
                  id: `assistant-${Date.now()}`,
                  content: text || 'Válasz generálása... (Nincs tartalom)', // Ha üres a válasz
                }
              : msg
          )
        );
      } catch (error) {
        console.error('Hiba a csevegés lekérdezése közben:', error);
        setMessages((prev) => [
          ...prev,
          {
            id: `error-${Date.now()}`,
            role: 'assistant',
            content: `Hiba történt: ${String(error)}`,
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    await append({ role: 'user', content: input });
    setInput('');
  };

  return (
    <div className="flex flex-col items-center w-full min-h-screen bg-[#1A1A1A] text-[#F5F5F5] p-6">
      <div className="w-full max-w-2xl">
        <h1 className="text-4xl font-bold mb-8 text-center text-[#FFD700]">SnackSmart Nutrition AI</h1>

        <div className="space-y-4 mb-8">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`p-4 rounded-lg whitespace-pre-wrap border border-[#333333] ${
                message.role === 'user' ? 'bg-[#333333] text-right' : 'bg-[#222222] text-left'
              }`}
            >
              <div className="text-sm font-semibold text-[#FFD700] mb-2">{message.role === 'user' ? 'You' : 'AI'}</div>
              <div className="text-[#F5F5F5] prose prose-invert">
                <ReactMarkdown
                  components={{
                    p: ({ children }) => <p className="mb-2">{children}</p>,
                    ul: ({ children }) => <ul className="list-disc list-inside mb-2">{children}</ul>,
                    table: ({ children }) => (
                      <table className="table-auto w-full border-collapse border border-[#444444]">{children}</table>
                    ),
                    th: ({ children }) => <th className="border border-[#444444] p-2">{children}</th>,
                    td: ({ children }) => <td className="border border-[#444444] p-2">{children}</td>,
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              </div>
            </div>
          ))}
        </div>

        {isLoading && <div className="text-center text-[#FFD700]">Töltés...</div>}

        {!submitted && <UserForm append={append} onSubmitSuccess={() => setSubmitted(true)} key="user-form" />}

        {submitted && (
          <form onSubmit={handleSubmit} className="flex mt-4 space-x-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask further questions..."
              className="flex-grow bg-[#333333] text-[#F5F5F5] border border-[#444444] p-3 rounded focus:outline-none focus:border-[#FFD700]"
              required
            />
            <button
              type="submit"
              className="bg-[#FFD700] hover:bg-yellow-400 text-black font-bold px-4 py-3 rounded transition-colors duration-300"
            >
              Send
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
