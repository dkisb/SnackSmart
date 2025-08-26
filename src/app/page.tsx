'use client';

import Sidebar from './components/Sidebar';
import Chat from './components/Chat';
import UserForm from './components/UserForm';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import { useAuth } from './providers/AuthProvider';
import { useState } from 'react';
import type { CreateMessage } from '@ai-sdk/react';
import type { Id } from '../../convex/_generated/dataModel';
import Loading from './components/Loading';

export default function Home() {
  const { user, isReady } = useAuth();

  // Use Convex branded Id type
  const [chatId, setChatId] = useState<Id<'chats'> | null>(null);
  const [firstMessage, setFirstMessage] = useState<CreateMessage | null>(null);

  const handleChatCreated = (newChatId: Id<'chats'>, message: CreateMessage) => {
    setChatId(newChatId);
    setFirstMessage(message);
  };

  if (!isReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#1A1A1A] text-[#F5F5F5]">
        <Loading />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#1A1A1A] text-[#F5F5F5]">
      <main className="flex-1 flex flex-col items-center p-6 w-full">
        <h1 className="text-4xl font-bold mb-8 text-[#FFD700]">SnackSmart Nutrition AI</h1>
        {!user ? (
          <div className="grid w-full max-w-3xl gap-6 md:grid-cols-2">
            <div className="bg-[#222] p-6 rounded-lg border border-[#333]">
              <LoginForm />
            </div>
            <div className="bg-[#222] p-6 rounded-lg border border-[#333]">
              <RegisterForm />
            </div>
          </div>
        ) : (
          <>
            <Sidebar />
            <div className="w-full max-w-2xl">
              {!chatId ? (
                <UserForm onChatCreated={handleChatCreated} />
              ) : (
                <Chat chatId={chatId} firstMessage={firstMessage} />
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
