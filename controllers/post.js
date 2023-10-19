const Post = require("../models/Post");
const User = require("../models/User");

exports.createPost = async (req, res) => {
  try {
    const post = await new Post(req.body).save();
    await post.populate("user", "first_name last_name cover picture username");
    res.json(post);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
exports.getAllPosts = async (req, res) => {
  try {
    const { page, limit } = req.query; // Get page and limit from query parameters
    const followingTemp = await User.findById(req.user.id).select("following");
    const following = followingTemp.following;

    // Calculate the skip value based on page and limit
    const skip = (page - 1) * limit;

    const promises = following.map((user) => {
      return Post.find({ user: user })
        .populate("user", "first_name last_name picture username cover")
        .populate("comments.commentBy", "first_name last_name picture username")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .exec();
    });

    const followingPosts = await Promise.all(promises);
    const userPosts = await Post.find({ user: req.user.id })
      .populate("user", "first_name last_name picture username cover")
      .populate("comments.commentBy", "first_name last_name picture username")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .exec();

    const allPosts = followingPosts.flat().concat(userPosts);

    allPosts.sort((a, b) => b.createdAt - a.createdAt);
    res.json(allPosts);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
exports.getAllPublicPost = async (req, res) => {
  try {
    const publicPost = await Post.find().populate("user", "first_name last_name picture username cover").populate("comments.commentBy", "first_name last_name picture username").sort({ createdAt: -1 }).exec();
    res.json(publicPost);

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
exports.getDetailPost = async (req, res) => {
  try {
    const { postId } = req.query; // Get post ID from request parameters
    console.log(postId)
    const post = await Post.findById(postId).populate("user", "first_name last_name picture username cover").populate("comments.commentBy", "first_name last_name picture username"); 
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    res.json(post);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.comment = async (req, res) => {
  try {
    const { comment, image, postId } = req.body;
    let newComments = await Post.findByIdAndUpdate(
      postId,
      {
        $push: {
          comments: {
            comment: comment,
            image: image,
            commentBy: req.user.id,
            commentAt: new Date(),
          },
        },
      },
      {
        new: true,
      }
    ).populate("comments.commentBy", "picture first_name last_name username");
    res.json(newComments.comments);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.savePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const user = await User.findById(req.user.id);
    const check = user?.savedPosts.find(
      (post) => post.post.toString() == postId
    );
    if (check) {
      await User.findByIdAndUpdate(req.user.id, {
        $pull: {
          savedPosts: {
            _id: check._id,
          },
        },
      });
    } else {
      await User.findByIdAndUpdate(req.user.id, {
        $push: {
          savedPosts: {
            post: postId,
            savedAt: new Date(),
          },
        },
      });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.deletePost = async (req, res) => {
  try {
    await Post.findByIdAndRemove(req.params.id);
    res.json({ status: "ok" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
