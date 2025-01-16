const express = require("express");
const mysql = require("mysql");
const cors = require("cors");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

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



// Start Server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
