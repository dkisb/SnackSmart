import { mutation, query } from './_generated/server';
import { v } from 'convex/values';
import bcrypt from 'bcryptjs';

export const signUp = mutation({
  args: {
    email: v.string(),
    name: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if user already exists
    const existing = await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', args.email))
      .unique();

    if (existing) {
      throw new Error('User already exists');
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(args.password, salt);

    // Insert user
    return await ctx.db.insert('users', {
      email: args.email,
      name: args.name,
      passwordHash,
      createdAt: Date.now(),
    });
  },
});

//Login feature
export const login = mutation({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', args.email))
      .unique();

    if (!user) {
      throw new Error('Invalid email or password');
    }

    const isValid = await bcrypt.compare(args.password, user.passwordHash);
    if (!isValid) {
      throw new Error('Invalid email or password');
    }

    return { id: user._id, email: user.email, name: user.name };
  },
});
