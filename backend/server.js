const express = require("express");
const mysql = require("mysql");
const cors = require("cors");
const multer = require('multer');
const app = express();
const fs = require("fs");
const path = require("path");


// Middleware
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// MySQL Connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "1232018mM.",
  database: "home_food_selling",
});

// Connect to MySQL
db.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL:", err.message);
    return;
  }
  console.log("Connected to MySQL Database");
});

// Sign Up (Save Buyer or Seller)
app.post("/api/signup", (req, res) => {
  const { name, email, phone, location, role, foodCategory } = req.body;
  let query;

  if (role === "Seller") {
    query = `
      INSERT INTO sellers (name, email, phone, location, foodCategory)
      VALUES (?, ?, ?, ?, ?)
    `;
    db.query(
      query,
      [name, email, phone, location, foodCategory || null],
      (err, result) => {
        if (err) {
          console.error("Error saving seller:", err);
          res.status(500).send("Error saving seller");
        } else {
          res.status(200).send("Seller saved successfully");
        }
      }
    );
  } else if (role === "Buyer") {
    query = `
      INSERT INTO buyers (name, email, phone, location)
      VALUES (?, ?, ?, ?)
    `;
    db.query(
      query,
      [name, email, phone, location],
      (err, result) => {
        if (err) {
          console.error("Error saving buyer:", err);
          res.status(500).send("Error saving buyer");
        } else {
          res.status(200).send("Buyer saved successfully");
        }
      }
    );
  } else {
    res.status(400).send("Invalid role specified");
  }
});

// Get User Data by Email
app.get("/api/users", (req, res) => {
  const { email } = req.query; // Fetch email from query parameters

  if (!email) {
    return res.status(400).send("Email is required");
  }

  // Query both buyers and sellers tables
  const sellerQuery = "SELECT * FROM sellers WHERE email = ?";
  const buyerQuery = "SELECT * FROM buyers WHERE email = ?";

  db.query(sellerQuery, [email], (err, sellerResults) => {
    if (err) {
      console.error("Error fetching seller:", err);
      return res.status(500).send("Error fetching user data");
    }
    if (sellerResults.length > 0) {
      return res.json({ ...sellerResults[0], role: "Seller" });
    }

    db.query(buyerQuery, [email], (err, buyerResults) => {
      if (err) {
        console.error("Error fetching buyer:", err);
        return res.status(500).send("Error fetching user data");
      }
      if (buyerResults.length > 0) {
        return res.json({ ...buyerResults[0], role: "Buyer" });
      }

      return res.status(404).send("User not found");
    });
  });
});

// Fetch all sellers
app.get("/api/sellers", (req, res) => {
  const query = "SELECT id, name, location, foodCategory AS category, occupation, bio, profilePicture FROM sellers";

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching sellers:", err);
      return res.status(500).json({ error: "Failed to fetch sellers" });
    }
    res.json(results); // Send sellers' data
  });
});


// Fetch seller details by ID
app.get("/api/sellers/:id", (req, res) => {
  const { id } = req.params;

  const query = "SELECT * FROM sellers WHERE id = ?";
  db.query(query, [id], (err, results) => {
    if (err) {
      console.error("Error fetching seller details:", err);
      return res.status(500).json({ error: "Failed to fetch seller details" });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: "Seller not found" });
    }
    res.json(results[0]);
  });
});


// Multer configuration for file uploads
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

// API Endpoint to Update Profile
app.put("/api/profileUpdate", upload.single("profilePicture"), (req, res) => {
  const { email, name, phone, location, occupation, bio, role } = req.body;

  if (!email || !role) {
    return res.status(400).json({ error: "Email and role are required for profile update." });
  }

  // Validate the role and determine the table
  const validRoles = ["Buyer", "Seller"];
  if (!validRoles.includes(role)) {
    return res.status(400).json({ error: "Invalid role provided." });
  }

  const table = role === "Buyer" ? "buyers" : "sellers";
  const profilePicturePath = req.file ? `/uploads/${req.file.filename}` : null;

  // SQL query to update the profile
  const updateQuery = `
    UPDATE ${table}
    SET
      name = ?,
      phone = ?,
      location = ?,
      occupation = ?,
      bio = ?,
      profilePicture = ?
    WHERE email = email
  `;

  const params = [
    name,
    phone,
    location,
    occupation || null,
    bio || null,
    profilePicturePath,
    email,
  ];

  db.query(updateQuery, params, (err, result) => {
    if (err) {
      console.error("Error updating profile:", err);
      return res.status(500).json({ error: "An error occurred while updating the profile." });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "User not found." });
    }

    res.json({ message: "Profile updated successfully!" });
  });
});


// Add a new post by a seller
app.post("/api/foodPosts", upload.single("foodImage"), (req, res) => {
  const { sellerId, title, description, price } = req.body;

  if (!sellerId || !title || !description || !price) {
    return res.status(400).json({ error: "Seller ID, title, description and price are required." });
  }

  const foodImagePath = req.file ? `/uploads/${req.file.filename}` : null;

  const query = `
    INSERT INTO food_posts (seller_id, title, description, food_image, price)
    VALUES (?, ?, ?, ?, ?)
  `;

  const params = [sellerId, title, description, foodImagePath,price];

  db.query(query, params, (err, result) => {
    if (err) {
      console.error("Error creating food post:", err.message);
      return res.status(500).json({ error: "An error occurred while creating the post." });
    }

    res.json({ message: "Food post created successfully!", postId: result.insertId });
  });
});

// Get all posts by a seller
app.get("/api/sellers/:id/posts", (req, res) => {
  const { id } = req.params;

  const query = `
    SELECT * FROM food_posts WHERE seller_id = ?
    ORDER BY created_at DESC
  `;

  db.query(query, [id], (err, results) => {
    if (err) {
      console.error("Error fetching food posts:", err.message);
      return res.status(500).json({ error: "An error occurred while fetching posts." });
    }

    res.json(results);
  });
});



app.get("/api/sellers/:id", (req, res) => {
  const { id } = req.params;

  const sellerQuery = "SELECT * FROM sellers WHERE id = ?";
  const postsQuery = "SELECT * FROM food_posts WHERE seller_id = ? ORDER BY created_at DESC";

  db.query(sellerQuery, [id], (err, sellerResults) => {
    if (err) {
      console.error("Error fetching seller details:", err);
      return res.status(500).json({ error: "Failed to fetch seller details" });
    }

    if (sellerResults.length === 0) {
      return res.status(404).json({ error: "Seller not found" });
    }

    db.query(postsQuery, [id], (err, postResults) => {
      if (err) {
        console.error("Error fetching food posts:", err);
        return res.status(500).json({ error: "Failed to fetch food posts" });
      }

      res.json({
        seller: sellerResults[0],
        posts: postResults,
      });
    });
  });
});




//oders

app.post("/api/orders", (req, res) => {
  const { buyerEmail, sellerId, postId, orderedItem, quantity, contact, price } = req.body;

  const query = `
    INSERT INTO orders (buyer_email, seller_id, post_id, orderedItem, quantity, contact, total_price)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  const params = [buyerEmail, sellerId, postId, orderedItem, quantity, contact, price];

  db.query(query, params, (err, result) => {
    if (err) {
      console.error("Error saving order:", err.message);
      return res.status(500).json({ error: "Failed to place order" });
    }
    res.json({ message: "Order placed successfully!" });
  });
});


// delete post

app.delete('/api/foodPosts/:id', async (req, res) => {
  const { id } = req.params;
  try {
      await db.query('DELETE FROM food_posts WHERE id = ?', [id]);
      res.status(200).send({ message: 'Post deleted successfully!' });
  } catch (error) {
      res.status(500).send({ error: 'Failed to delete post.' });
  }
});





// Start Server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});