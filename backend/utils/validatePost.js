function validatePostInput(body = {}) {
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const content = typeof body.content === "string" ? body.content.trim() : "";

  if (!title || !content) {
    return { valid: false, message: "Title and content are required." };
  }

  if (title.length > 160) {
    return { valid: false, message: "Title must be 160 characters or fewer." };
  }

  if (content.length > 20000) {
    return { valid: false, message: "Content must be 20000 characters or fewer." };
  }

  return { valid: true, title, content };
}

module.exports = validatePostInput;
