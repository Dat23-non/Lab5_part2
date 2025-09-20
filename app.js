const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const authRoutes = require("./routes/auth");

const app = express();

app.use(express.json());

// MongoDB URL
const MONGO_URL = "mongodb://127.0.0.1:27017/simple_auth";

// Kết nối MongoDB
mongoose
  .connect(MONGO_URL)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Session lưu vào MongoDB
app.use(
  session({
    secret: "mysecretkey",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: MONGO_URL,
      collectionName: "sessions" // sessions sẽ hiện ở đây
    }),
    cookie: {
      httpOnly: true,
      secure: false,
      maxAge: 1000 * 60 * 30 // 30 phút
    }
  })
);

// Routes
app.use("/auth", authRoutes);

// Protected route
app.get("/protected", (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  res.json({ message: "Welcome!", userId: req.session.userId });
});

app.listen(3000, () => console.log("Server running on http://localhost:3000"));
