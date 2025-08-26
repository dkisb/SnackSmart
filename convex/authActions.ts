import { action } from './_generated/server';
import { v } from 'convex/values';
import bcrypt from 'bcryptjs';
import { api } from './_generated/api';
import { signJwt } from './jwt';
import type { Id } from './_generated/dataModel';

// Types for the return payloads
type PublicUser = { id: Id<'users'>; email: string; name: string };
type AuthResult = { token: string; user: PublicUser };

// Signup action
export const signupAction = action({
  args: {
    email: v.string(),
    name: v.string(),
    password: v.string(),
  },
  // Explicit return type Annotation
  handler: async (ctx, { email, name, password }): Promise<AuthResult> => {
    // get existing
    const existing = await ctx.runQuery(api.auth.getUserByEmail, { email });
    if (existing) {
      throw new Error('Email already in use');
    }

    // hash
    const salt: string = await bcrypt.genSalt(10);
    const passwordHash: string = await bcrypt.hash(password, salt);

    // insert
    const userId = (await ctx.runMutation(api.auth.insertUser, {
      email,
      name,
      passwordHash,
    })) as Id<'users'>;

    // jwt
    const token: string = await signJwt({ sub: userId, email, name });
    const user: PublicUser = { id: userId, email, name };
    return { token, user };
  },
});

// Login action
export const loginAction = action({
  args: {
    email: v.string(),
    password: v.string(),
  },
  // Explicit return type Annotation
  handler: async (ctx, { email, password }): Promise<AuthResult> => {
    // fetch user
    const userDoc = await ctx.runQuery(api.auth.getUserByEmail, { email });
    if (!userDoc) {
      throw new Error('Invalid email or password');
    }

    const isValid: boolean = await bcrypt.compare(password, userDoc.passwordHash);
    if (!isValid) {
      throw new Error('Invalid email or password');
    }

    const token: string = await signJwt({
      sub: userDoc._id as Id<'users'>,
      email: userDoc.email,
      name: userDoc.name,
    });

    const user: PublicUser = {
      id: userDoc._id as Id<'users'>,
      email: userDoc.email,
      name: userDoc.name,
    };

    return { token, user };
  },
});
