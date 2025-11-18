const test = require("node:test");
const assert = require("node:assert");
const { hashPassword, verifyPassword } = require("./password");

test("hashPassword creates verifiable hashes", () => {
  const password = "SuperSecret123!";
  const hashed = hashPassword(password);
  assert.ok(hashed.split(":").length === 3, "hash should include iteration, salt, and digest");
  assert.ok(verifyPassword(password, hashed), "hashed password should validate with original password");
  assert.strictEqual(verifyPassword("wrong", hashed), false, "wrong password should fail verification");
});
