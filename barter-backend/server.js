require("dotenv").config();
const express = require("express");
const path = require("path");
const cors = require("cors");
const bcrypt = require("bcrypt");
const cloudinary = require("cloudinary").v2;
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const mysql = require("mysql2");

const app = express();

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer config
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "barter-items",
    allowed_formats: ["jpg", "png", "webp"],
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"), false);
    }
  },
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "../")));

// MySQL connection
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Moksha@2003",
  database: "barter_app",
});

connection.connect((err) => {
  if (err) throw err;
  console.log("Connected to MySQL!");
});

// Register
app.post("/register", async (req, res) => {
  const { full_name, email, password, location } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    connection.query(
      "INSERT INTO users (full_name, email, password_hash, location) VALUES (?, ?, ?, ?)",
      [full_name, email, hashedPassword, location],
      (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({
          success: true,
          user: { id: results.insertId, full_name, email, location },
        });
      }
    );
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  connection.query(
    "SELECT * FROM users WHERE email = ?",
    [email],
    async (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      if (results.length === 0)
        return res.status(401).json({ error: "Invalid email or password" });

      const user = results[0];
      const isValid = await bcrypt.compare(password, user.password_hash);
      if (!isValid)
        return res.status(401).json({ error: "Invalid email or password" });

      const { password_hash, ...userData } = user;
      res.json({ success: true, user: userData });
    }
  );
});

// Create item with image
app.post("/items", upload.single("image"), (req, res) => {
  const {
    user_id,
    title,
    description,
    exchange_for,
    pickup_location,
    category,
    condition,
  } = req.body;

  const image_url = req.file ? req.file.path : null;

  connection.query(
    `INSERT INTO items 
     (user_id, title, description, exchange_for, pickup_location, image_url, category, \`condition\`) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      user_id,
      title,
      description,
      exchange_for,
      pickup_location,
      image_url,
      category,
      condition,
    ],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });

      res.json({
        success: true,
        item: {
          id: results.insertId,
          user_id,
          title,
          description,
          exchange_for,
          pickup_location,
          image_url,
          category,
          condition,
        },
      });
    }
  );
});

// Get items of a user
app.get("/user/:id/items", (req, res) => {
  connection.query(
    "SELECT * FROM items WHERE user_id = ? ORDER BY created_at DESC",
    [req.params.id],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results);
    }
  );
});

// Get all items with user info
app.get("/items", (req, res) => {
  connection.query(
    `SELECT items.*, 
            users.full_name as user_name, 
            users.email as user_email, 
            users.location as user_location 
     FROM items 
     JOIN users ON items.user_id = users.id 
     ORDER BY items.created_at DESC`,
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });

      res.json(results);
    }
  );
});

// Serve frontend
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../index.html"));
});

// Start server
app.listen(5000, () => console.log("Server running on http://localhost:5000"));
