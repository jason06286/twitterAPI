const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "User ID 未填寫"],
    },
    images: {
      type: [String],
      default: [],
    },
    content: {
      type: String,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    likes: {
      type: [{ type: mongoose.Schema.ObjectId, ref: "User" }],
      default: [],
    },
    following: {
      type: [
        {
          user: { type: mongoose.Schema.ObjectId, ref: "User" },
          followAt: { type: Date, default: Date.now },
        },
      ],
      default: [],
    },
    followers: {
      type: [
        {
          user: { type: mongoose.Schema.ObjectId, ref: "User" },
          followAt: { type: Date, default: Date.now },
        },
      ],
      default: [],
    },
    share: {
      type: mongoose.Schema.ObjectId,
      ref: "Post",
    },
  },
  {
    versionKey: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const Post = mongoose.model("Post", PostSchema);

module.exports = Post;
