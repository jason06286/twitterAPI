const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "user",
      required: [true, "user ID 未填寫"],
    },
    image: {
      type: [String],
      default: [],
    },
    content: {
      type: String,
      // required: [true, "請輸入貼文內容"],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    likes: {
      type: Number,
      default: 0,
    },
    comments: {
      type: Number,
      default: 0,
    },
    following: {
      type: [mongoose.Schema.ObjectId],
      ref: "user",
    },
    followers: {
      type: [mongoose.Schema.ObjectId],
      ref: "user",
    },
    sharing: {
      type: mongoose.Schema.ObjectId,
      ref: "post",
    },
  },
  {
    versionKey: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
// PostSchema.virtual("shares", {
//   ref: "Share",
//   foreignField: "post",
//   localField: "_id",
// });
const Post = mongoose.model("post", PostSchema);

module.exports = Post;
