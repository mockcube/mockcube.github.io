require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const app = express();
app.use(express.json());
app.use(cors());

// 🔒 Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20
});
app.use("/contact", limiter);

// 🗄️ MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

// 📄 Schema
const MessageSchema = new mongoose.Schema({
  name: String,
  email: String,
  message: String,
  date: { type: Date, default: Date.now }
});

const Message = mongoose.model("Message", MessageSchema);

// 📧 Mailer
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// 📩 Contact endpoint
app.post("/contact", async (req, res) => {
  const { name, email, message } = req.body;

  try {
    const newMessage = new Message({ name, email, message });
    await newMessage.save();

    // Send email notification
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: "New Contact Message",
      text: `From: ${name} (${email})\n\n${message}`
    });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed" });
  }
});

// 🔐 Admin login (simple)
const ADMIN_USER = "admin";
const ADMIN_PASS_HASH = bcrypt.hashSync("password123", 8);

app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (username !== ADMIN_USER) return res.sendStatus(403);

  const valid = await bcrypt.compare(password, ADMIN_PASS_HASH);
  if (!valid) return res.sendStatus(403);

  const token = jwt.sign({ username }, "secret", { expiresIn: "1h" });
  res.json({ token });
});

// 🔐 Middleware
function auth(req, res, next) {
  const token = req.headers.authorization;
  if (!token) return res.sendStatus(401);

  try {
    jwt.verify(token, "secret");
    next();
  } catch {
    res.sendStatus(403);
  }
}

// 📊 Get messages
app.get("/messages", auth, async (req, res) => {
  const messages = await Message.find().sort({ date: -1 });
  res.json(messages);
});

app.listen(3000, () => console.log("Server running on http://localhost:3000"));