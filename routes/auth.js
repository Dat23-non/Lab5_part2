const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/user");

const router = express.Router();

// ========== REGISTER ==========       
router.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;

    // kiểm tra trùng user
    const existing = await User.findOne({ username });
    if (existing) {
      return res.status(400).json({ error: "Username already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashed });
    await user.save();

    // đăng nhập ngay sau khi đăng ký
    req.session.userId = user._id;

    res.json({ message: "User registered and logged in", userId: user._id });
  } catch (err) {
    res.status(400).json({ error: "Registration failed", details: err });
  }
});

// ========== LOGIN ==========
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username });
  if (!user) return res.status(400).json({ error: "User not found" });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(400).json({ error: "Invalid password" });

  req.session.userId = user._id;

  res.json({ message: "Login successful", userId: user._id });
});

// ========== PROFILE ==========
router.get("/profile", async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Not logged in" });
  }

  const user = await User.findById(req.session.userId).select("-password"); // ẩn password
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  res.json({ message: "Profile fetched", user });
});

// ========== CHECK SESSION ==========
router.get("/me", (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Not logged in" });
  }
  res.json({ message: "You are logged in", userId: req.session.userId });
});

// ========== LOGOUT ==========
router.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).json({ error: "Logout failed" });
    res.clearCookie("connect.sid");
    res.json({ message: "Logged out successfully" });
  });
});

module.exports = router;
