import { RateLimitInfo } from "@/types";

const MAX_GENERATIONS = 5;
const WINDOW_MS = 24 * 60 * 60 * 1000;

const rateLimitStore = new Map<string, RateLimitInfo>();

setInterval(() => {
  const now = Date.now();
  for (const [ip, info] of rateLimitStore.entries()) {
    if (now > info.resetAt) {
      rateLimitStore.delete(ip);
    }
  }
}, 60 * 60 * 1000);

export function checkRateLimit(ip: string): {
  allowed: boolean;
  remaining: number;
  used: number;
  resetAt: number;
} {
  const now = Date.now();
  const record = rateLimitStore.get(ip);

  if (!record || now > record.resetAt) {
    rateLimitStore.set(ip, {
      count: 0,
      resetAt: now + WINDOW_MS,
    });
  }

  const currentRecord = rateLimitStore.get(ip)!;
  const used = currentRecord.count;
  const remaining = Math.max(0, MAX_GENERATIONS - used);
  const allowed = used < MAX_GENERATIONS;

  return {
    allowed,
    remaining,
    used,
    resetAt: currentRecord.resetAt,
  };
}

export function incrementRateLimit(ip: string): void {
  const record = rateLimitStore.get(ip);
  if (record) {
    record.count += 1;
    rateLimitStore.set(ip, record);
  }
}

export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return req.headers.get("x-real-ip") || "unknown";
}
