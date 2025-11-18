const crypto = require("crypto");

const ITERATIONS = 310000;
const KEY_LENGTH = 32;
const DIGEST = "sha512";

function hashPassword(password) {
  if (typeof password !== "string" || password.length < 8) {
    throw new Error("Password must be at least 8 characters");
  }
  const salt = crypto.randomBytes(16).toString("hex");
  const derivedKey = crypto.pbkdf2Sync(password, salt, ITERATIONS, KEY_LENGTH, DIGEST).toString("hex");
  return `${ITERATIONS}:${salt}:${derivedKey}`;
}

function verifyPassword(password, storedHash) {
  if (!storedHash) return false;
  const [iterStr, salt, original] = storedHash.split(":");
  if (!iterStr || !salt || !original) return false;
  const iterations = Number.parseInt(iterStr, 10);
  if (!Number.isFinite(iterations)) return false;
  const derivedKey = crypto.pbkdf2Sync(password, salt, iterations, KEY_LENGTH, DIGEST).toString("hex");
  const originalBuffer = Buffer.from(original, "hex");
  const derivedBuffer = Buffer.from(derivedKey, "hex");
  if (originalBuffer.length !== derivedBuffer.length) return false;
  return crypto.timingSafeEqual(originalBuffer, derivedBuffer);
}

module.exports = { hashPassword, verifyPassword };
