import { useState } from 'react';
import { parseStream } from '../utils/parseStream';

export function useChat() {
  const [messages, setMessages] = useState<{ id: string; role: 'user' | 'assistant'; content: string }[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const appendMessage = (role: 'user' | 'assistant', content: string) => {
    setMessages((prev) => [...prev, { id: Date.now().toString(), role, content }]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    appendMessage('user', input);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages }),
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const text = await parseStream(response, (chunk) => {
        setMessages((prev) =>
          prev.map((msg, i) =>
            i === prev.length - 1 && msg.role === 'assistant' ? { ...msg, content: msg.content + chunk } : msg
          )
        );
      });

      appendMessage('assistant', text);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return { messages, input, setInput, handleSubmit, isLoading, error };
}
