const mongoose = require("mongoose");

const { ObjectId } = mongoose.Schema;

const storySchema = new mongoose.Schema(
  {
    images: {
      type: Array,
    },
    user: {
      type: ObjectId,
      ref: "User",
      required: true,
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Story", storySchema);
