const express = require("express");
const mysql = require("mysql");
const cors = require("cors");
const multer = require('multer');
const app = express();
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
  const query = "SELECT id, name, location, foodCategory AS category FROM sellers";

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


// Multer Configuration for File Uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads");
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

  // Determine which table to update based on the role
  const table = role === "buyer" ? "buyers" : "sellers";

  const profilePicturePath = req.file ? `/uploads/${req.file.filename}` : null;

  // Updated SQL query with proper handling of NULL values
  const updateQuery = `
    UPDATE ${table}
    SET
      name = ?,
      phone = ?,
      location = ?,
      occupation = ?,
      bio = ?,
      profile_picture = ?
    WHERE email = ?
  `;

  // Parameters for the query
  const params = [
    name || null, // Default to NULL if no value is provided
    phone || null,
    location || null,
    occupation || null,
    bio || null,
    profilePicturePath, // If `null`, it will be stored as NULL in the database
    email,
  ];

  db.query(updateQuery, params, (err, result) => {
    if (err) {
      console.error("Error updating profile:", err.message);
      return res.status(500).json({ error: "An error occurred while updating the profile." });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "User not found." });
    }

    res.json({ message: "Profile updated successfully!" });
  });
});





app.post('/api/food-posts', async (req, res) => {
  const { sellerId, description, imagePath } = req.body;

  try {
      await db.query('INSERT INTO food_posts (sellerId, description, imagePath) VALUES (?, ?, ?)', 
      [sellerId, description, imagePath]);
      res.status(201).json({ message: 'Food post created successfully' });
  } catch (error) {
      res.status(500).json({ error: 'Failed to create food post' });
  }
});


app.get('/api/food-posts', async (req, res) => {
  const { sellerId } = req.query;

  try {
      const query = sellerId
          ? 'SELECT * FROM food_posts WHERE sellerId = ?'
          : 'SELECT * FROM food_posts';
      const results = await db.query(query, [sellerId]);
      res.status(200).json(results);
  } catch (error) {
      res.status(500).json({ error: 'Failed to fetch food posts' });
  }
});











// Start Server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
