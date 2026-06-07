import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET ?? "dev-secret";
const WEAK_SECRETS = new Set(["dev-secret", "change-me-in-production", "change-me", "secret"]);

export function assertJwtSecretForProduction() {
  if (process.env.NODE_ENV !== "production") return;

  const secret = process.env.JWT_SECRET?.trim();
  if (!secret || secret.length < 32 || WEAK_SECRETS.has(secret)) {
    console.error(
      "[security] JWT_SECRET must be set to a strong random string (32+ chars) in production."
    );
    process.exit(1);
  }
}

export function signToken(userId) {
  return jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn: "7d" });
}

export function signAdminAccessToken(userId, tokenVersion) {
  return jwt.sign({ sub: userId, tv: tokenVersion, aud: "admin" }, JWT_SECRET, { expiresIn: "1h" });
}

export function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

export function verifyAdminAccessToken(token) {
  const payload = jwt.verify(token, JWT_SECRET);
  if (payload.aud !== "admin") {
    const err = new Error("Invalid admin token");
    err.name = "JsonWebTokenError";
    throw err;
  }
  return payload;
}

export function toSessionUser(user) {
  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    role: "customer",
    provider: user.provider ?? "local",
    emailVerified: Boolean(user.emailVerifiedAt),
    avatarUrl: user.avatarUrl ?? "",
    createdAt: user.createdAt instanceof Date ? user.createdAt.toISOString() : user.createdAt,
  };
}

export function toAdminSession(admin) {
  return {
    id: admin.id,
    fullName: admin.fullName,
    email: admin.email,
    phone: admin.phone ?? "",
    role: "admin",
    profileNote: admin.profileNote ?? "",
    avatarUrl: admin.avatarUrl ?? "",
    provider: "local",
  };
}

export const adminAccessTokenTtlSeconds = 60 * 60;
