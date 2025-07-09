'use client';

import { useChat } from '@ai-sdk/react';
import UserForm from './UserForm';
import { useState } from 'react';

export default function Home() {
  const { messages, append, input, handleInputChange, handleSubmit } = useChat();
  const [submitted, setSubmitted] = useState(false);

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
              {message.parts.map((part, index) => {
                if (part.type === 'text') {
                  return (
                    <div key={`${message.id}-${index}`} className="text-[#F5F5F5]">
                      {part.text}
                    </div>
                  );
                }
              })}
            </div>
          ))}
        </div>

        {!submitted && <UserForm append={append} onSubmitSuccess={() => setSubmitted(true)} key="user-form" />}

        {submitted && (
          <form onSubmit={handleSubmit} className="flex mt-4 space-x-2">
            <input
              type="text"
              value={input}
              onChange={handleInputChange}
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
