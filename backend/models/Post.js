const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: 160
    },
    content: {
      type: String,
      required: [true, "Content is required"],
      trim: true,
      maxlength: 20000
    },
    author: {
      type: String,
      trim: true,
      default: "Anonymous",
      maxlength: 80
    },
    category: {
      type: String,
      trim: true,
      default: "General",
      maxlength: 40
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Post", postSchema);
