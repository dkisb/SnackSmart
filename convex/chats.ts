import { mutation, query } from './_generated/server';
import { v } from 'convex/values';
import { verifyJwt } from './jwt';
import type { Id } from './_generated/dataModel';

async function requireUserIdFromToken(token: string): Promise<string> {
  const payload = await verifyJwt(token);
  return payload.sub;
}

export const createChat = mutation({
  args: { title: v.string(), token: v.string() },
  handler: async (ctx, { title, token }) => {
    const userId = await requireUserIdFromToken(token);
    const chatId = await ctx.db.insert('chats', {
      userId,
      title,
      createdAt: Date.now(),
    });
    return chatId;
  },
});

export const getChats = query({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    const userId = await requireUserIdFromToken(token);
    return await ctx.db
      .query('chats')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .order('desc')
      .collect();
  },
});
