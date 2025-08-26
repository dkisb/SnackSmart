import { mutation, query } from './_generated/server';
import { v } from 'convex/values';
import { verifyJwt } from './jwt';
import type { Id } from './_generated/dataModel';

async function requireUserIdFromToken(token: string): Promise<string> {
  const payload = await verifyJwt(token);
  return payload.sub;
}

export const addMessage = mutation({
  args: {
    token: v.string(),
    chatId: v.id('chats'),
    role: v.union(v.literal('user'), v.literal('assistant')),
    content: v.string(),
  },
  handler: async (ctx, { token, chatId, role, content }) => {
    const userId = await requireUserIdFromToken(token);
    const chat = await ctx.db.get(chatId);
    if (!chat || chat.userId !== userId) throw new Error('Forbidden');

    return await ctx.db.insert('messages', {
      chatId,
      role,
      content,
      createdAt: Date.now(),
    });
  },
});

export const updateMessage = mutation({
  args: {
    token: v.string(),
    messageId: v.id('messages'),
    content: v.string(),
  },
  handler: async (ctx, { token, messageId, content }) => {
    const userId = await requireUserIdFromToken(token);
    const msg = await ctx.db.get(messageId);
    if (!msg) throw new Error('Message not found');

    const chat = await ctx.db.get(msg.chatId as Id<'chats'>);
    if (!chat || chat.userId !== userId) throw new Error('Forbidden');

    await ctx.db.patch(messageId, { content });
    return messageId;
  },
});

export const getMessages = query({
  args: { token: v.string(), chatId: v.id('chats') },
  handler: async (ctx, { token, chatId }) => {
    const userId = await requireUserIdFromToken(token);
    const chat = await ctx.db.get(chatId);
    if (!chat || chat.userId !== userId) throw new Error('Forbidden');

    return await ctx.db
      .query('messages')
      .withIndex('by_chat', (q) => q.eq('chatId', chatId))
      .order('asc')
      .collect();
  },
});
