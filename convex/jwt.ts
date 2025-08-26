import { SignJWT, jwtVerify } from 'jose';

const encoder = new TextEncoder();

export async function signJwt(payload: object, exp: string = '14d') {
  const secret = process.env.AUTH_JWT_SECRET;
  if (!secret) throw new Error('Missing AUTH_JWT_SECRET');
  return await new SignJWT(payload as any)
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setIssuedAt()
    .setExpirationTime(exp)
    .sign(encoder.encode(secret));
}

export async function verifyJwt<T extends object = any>(token: string) {
  const secret = process.env.AUTH_JWT_SECRET;
  if (!secret) throw new Error('Missing AUTH_JWT_SECRET');
  const { payload } = await jwtVerify(token, encoder.encode(secret));
  return payload as T & { sub: string };
}
