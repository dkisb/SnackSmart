import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  users: defineTable({
    name: v.string(),
    passwordHash: v.string(),
    email: v.string(),
    createdAt: v.number(),
  }).index('by_email', ['email']),

  chats: defineTable({
    userId: v.string(),
    title: v.string(),
    createdAt: v.number(),
  }).index('by_user', ['userId', 'createdAt']),

  messages: defineTable({
    chatId: v.id('chats'),
    role: v.union(v.literal('user'), v.literal('assistant')),
    content: v.string(),
    createdAt: v.number(),
  }).index('by_chat', ['chatId', 'createdAt']),
});
