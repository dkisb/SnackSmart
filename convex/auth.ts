import { mutation, query } from './_generated/server';
import { v } from 'convex/values';

export const getUserByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    return await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', email))
      .unique();
  },
});

export const insertUser = mutation({
  args: { email: v.string(), name: v.string(), passwordHash: v.string() },
  handler: async (ctx, { email, name, passwordHash }) => {
    return await ctx.db.insert('users', {
      email,
      name,
      passwordHash,
      createdAt: Date.now(),
    });
  },
});
