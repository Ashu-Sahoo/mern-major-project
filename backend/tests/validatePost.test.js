const test = require("node:test");
const assert = require("node:assert/strict");
const validatePostInput = require("../utils/validatePost");

test("rejects a post with missing title", () => {
  const result = validatePostInput({ content: "Some content" });
  assert.equal(result.valid, false);
});

test("rejects a post with blank content", () => {
  const result = validatePostInput({ title: "A title", content: "   " });
  assert.equal(result.valid, false);
});

test("accepts a valid post and trims title/content", () => {
  const result = validatePostInput({
    title: "  My first post  ",
    content: "  Hello BlogSpace  "
  });

  assert.equal(result.valid, true);
  assert.equal(result.title, "My first post");
  assert.equal(result.content, "Hello BlogSpace");
});

test("rejects a title longer than 160 characters", () => {
  const result = validatePostInput({
    title: "x".repeat(161),
    content: "Valid content"
  });
  assert.equal(result.valid, false);
});
