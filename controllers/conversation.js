const Post = require("../models/Post");
const User = require("../models/User");
const Conversation = require("../models/Conversation");
const { ObjectId } = require("mongodb");


exports.getCoversation = async (req, res) => {
    try {
        const { receiver_id } = req.params
        const sender_id = req.user.id
        const getConversation = async (sender_id, receiver_id) => {
            const conversation = await Conversation.find({
                $or: [
                    {
                        sender_id,
                        receiver_id
                    },
                    {
                        sender_id: receiver_id,
                        receiver_id: sender_id
                    }
                ]
            })
            return conversation
        }
        const x = await getConversation(sender_id, receiver_id)
        return res.json(x).status(200)
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};