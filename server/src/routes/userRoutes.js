
const express = require("express");
const mongoose = require("mongoose");
const User = require("../models/User");
const auth = require("../middleware/auth");

const router = express.Router();

// Get current user's profile
router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId)
      .select("-password")
      .populate("followers", "name")
      .populate("following", "name");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get people to follow
router.get("/suggestions", auth, async (req, res) => {
  try {
    const currentUser = await User.findById(req.userId);

    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const users = await User.find({
      _id: {
        $ne: req.userId,
        $nin: currentUser.following,
      },
    })
      .select("name bio followers following")
      .limit(10);

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Follow or unfollow a user
router.post("/:id/follow", auth, async (req, res) => {
  try {
    const targetId = req.params.id;

    if (!mongoose.isValidObjectId(targetId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    if (targetId === req.userId) {
      return res.status(400).json({ message: "You cannot follow yourself" });
    }

    const [currentUser, targetUser] = await Promise.all([
      User.findById(req.userId),
      User.findById(targetId),
    ]);

    if (!currentUser || !targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const alreadyFollowing = currentUser.following.some(
      (id) => id.toString() === targetId
    );

    if (alreadyFollowing) {
      currentUser.following.pull(targetId);
      targetUser.followers.pull(req.userId);
    } else {
      currentUser.following.addToSet(targetId);
      targetUser.followers.addToSet(req.userId);
    }

    await Promise.all([currentUser.save(), targetUser.save()]);

    res.json({
      message: alreadyFollowing ? "Unfollowed successfully" : "Followed successfully",
      following: !alreadyFollowing,
      followersCount: targetUser.followers.length,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
