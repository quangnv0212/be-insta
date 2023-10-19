const mongoose = require("mongoose");

const { ObjectId } = mongoose.Schema;

const conversationSchema = new mongoose.Schema(
  {

    sender_id: {
          type: ObjectId,
          ref: "User",
          required: true,
    },
    receiver_id: {
        type: ObjectId,
        ref: "User",
        required: true,
        },
    content: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Conversation", conversationSchema);
