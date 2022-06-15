const mongoose = require("mongoose");

const shareSchema = new mongoose.Schema(
  {
    createdAt: {
      type: Date,
      default: Date.now,
    },
    post: {
      type: mongoose.Schema.ObjectId,
      ref: "post",
    },
  },
  { versionKey: false }
);

shareSchema.pre(/^find/, function (next) {
  this.populate({
    path: "post",
    select: "_id user content image",
  });

  next();
});

shareSchema.pre("save", function (next) {
  this.populate({
    path: "post",
    select: "_id user content image",
  });

  next();
});

const share = mongoose.model("share", shareSchema);

module.exports = share;
