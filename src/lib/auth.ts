import { db } from "./db";
import { cookies } from "next/headers";

// Token-based session auth. Equivalent to Django @login_required via requireUser()/requireAdmin().

export interface AuthUser {
  id: string;
  phone: string;
  fullName: string | null;
  isStaff: boolean;
  isSuperuser: boolean;
}

const SESSION_DAYS = 30;

export function generateToken(): string {
  // 32-byte random hex token
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

export function generateOtp(): string {
  // 5-digit code
  return String(Math.floor(10000 + Math.random() * 90000));
}

export async function createSession(userId: string): Promise<string> {
  const token = generateToken();
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 86400 * 1000);
  await db.session.create({ data: { token, userId, expiresAt } });
  return token;
}

export async function getUserFromRequest(
  req: Request,
): Promise<AuthUser | null> {
  // Prefer Authorization: Bearer <token>, fall back to cookie.
  let token: string | null = null;
  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    token = authHeader.slice(7).trim();
  }
  if (!token) {
    const cookieHeader = req.headers.get("cookie") ?? "";
    const match = cookieHeader.match(/luxa_token=([^;]+)/);
    if (match) token = match[1];
  }
  if (!token) return null;

  const session = await db.session.findUnique({
    where: { token },
    include: { user: true },
  });
  if (!session) return null;
  if (session.expiresAt < new Date()) return null;
  if (!session.user.isActive) return null;

  return {
    id: session.user.id,
    phone: session.user.phone,
    fullName: session.user.fullName,
    isStaff: session.user.isStaff,
    isSuperuser: session.user.isSuperuser,
  };
}

// requireUser → returns user or throws a 401-shaped error.
export async function requireUser(req: Request): Promise<AuthUser> {
  const user = await getUserFromRequest(req);
  if (!user) {
    throw new ResponseError(401, "برای دسترسی به این بخش وارد شوید");
  }
  return user;
}

// requireAdmin → @staff_member_required equivalent (is_staff = True).
export async function requireAdmin(req: Request): Promise<AuthUser> {
  const user = await requireUser(req);
  if (!user.isStaff) {
    throw new ResponseError(403, "دسترسی محدود به مدیران");
  }
  return user;
}

export class ResponseError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export function setAuthCookie(token: string): string {
  return `luxa_token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${
    SESSION_DAYS * 86400
  }`;
}

export function clearAuthCookie(): string {
  return `luxa_token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}

// Helper for client-side: read token from cookie (client can't read HttpOnly,
// so we use a separate non-HttpOnly mirror "luxa_tok" set alongside, OR rely on
// the fact that the browser auto-sends HttpOnly cookies with same-origin fetch).
// We keep HttpOnly for security; same-origin fetch includes credentials automatically.
export function json(data: unknown, status = 200, extraHeaders: HeadersInit = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...extraHeaders,
    },
  });
}

export function errorJson(message: string, status = 400) {
  return json({ error: message }, status);
}
