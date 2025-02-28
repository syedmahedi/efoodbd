const express = require("express");
const mysql = require("mysql");
const cors = require("cors");
const multer = require('multer');
const app = express();
const fs = require("fs");
const nodemailer = require("nodemailer");
const path = require("path");


require("dotenv").config();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
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


// seeller search
app.get("/api/sellers/searchbylocation", (req, res) => {
  const { category, location } = req.query;

  if (!location) {
    return res.status(400).json({ error: "Location is required" });
  }

  let query = `SELECT * FROM sellers WHERE location LIKE ?`;
  let params = [`%${location}%`];

  if (category) {
    query += ` AND (foodCategory LIKE ? OR id IN (
      SELECT seller_id FROM food_posts WHERE title LIKE ?
    ))`;
    params.push(`%${category}%`, `%${category}%`);
  }

  db.query(query, params, (err, results) => {
    if (err) {
      console.error("Error fetching sellers:", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "No sellers found" });
    }

    res.json(results);
  });
});


// Fetch all sellers
// app.get("/api/sellers/search", (req, res) => {
//   const category = req.query.category;

//   if (!category) {
//     // If no category is provided, return all sellers
//     db.query("SELECT * FROM sellers", (err, sellers) => {
//       if (err) {
//         console.error("Error fetching sellers:", err);
//         return res.status(500).json({ message: "Database error" });
//       }
//       res.json(sellers);
//     });
//     return;
//   }

//   // Step 1: Search sellers by their food category
//   const sellerQuery = "SELECT * FROM sellers WHERE CONCAT(foodCategory, location) LIKE ?";
//   db.query(sellerQuery, [`%${category}%`], (err, sellersFromSellers) => {
//     if (err) {
//       console.error("Error fetching sellers:", err);
//       return res.status(500).json({ message: "Database error" });
//     }

//     // Step 2: Search food_posts to find sellers selling this food
//     const foodQuery = `
//       SELECT DISTINCT sellers.* 
//       FROM food_posts 
//       JOIN sellers ON food_posts.seller_id = sellers.id 
//       WHERE food_posts.title LIKE ?`;

//     db.query(foodQuery, [`%${category}%`], (err, sellersFromFoodPosts) => {
//       if (err) {
//         console.error("Error fetching food posts:", err);
//         return res.status(500).json({ message: "Database error" });
//       }

//       // Merge results and remove duplicate sellers (same seller.id)
//       const allSellers = [...sellersFromSellers, ...sellersFromFoodPosts];

//       // Use an object to ensure unique sellers
//       const uniqueSellers = {};
//       allSellers.forEach((seller) => {
//         uniqueSellers[seller.id] = seller;
//       });

//       res.json(Object.values(uniqueSellers)); // Send unique sellers list
//     });
//   });
// });



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

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB max
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only images are allowed"), false);
    }
    cb(null, true);
  },
});


// API Endpoint to Update Profile
app.put("/api/profileUpdate", upload.single("profilePicture"), (req, res) => {
  const { email, name, phone, location, occupation, bio, role, foodCategory } = req.body;

  if (!email || !role) {
    return res
      .status(400)
      .json({ error: "Email and role are required for profile update." });
  }

  // Validate the role and determine the table
  const validRoles = ["Buyer", "Seller"];
  if (!validRoles.includes(role)) {
    return res.status(400).json({ error: "Invalid role provided." });
  }

  const table = role === "Buyer" ? "buyers" : "sellers";
  const profilePicturePath = req.file ? `/uploads/${req.file.filename}` : null;

  // Construct the SQL query dynamically
  let updateQuery = `UPDATE ${table} SET `;
  const params = [];

  if (name) {
    updateQuery += "name = ?, ";
    params.push(name);
  }
  if (phone) {
    updateQuery += "phone = ?, ";
    params.push(phone);
  }
  if (location) {
    updateQuery += "location = ?, ";
    params.push(location);
  }
  if (occupation) {
    updateQuery += "occupation = ?, ";
    params.push(occupation);
  }
  if (bio) {
    updateQuery += "bio = ?, ";
    params.push(bio);
  }
  if (profilePicturePath) {
    updateQuery += "profilePicture = ?, ";
    params.push(profilePicturePath);
  }

  // Only include foodCategory if the user is a seller
  if (role === "Seller" && foodCategory) {
    updateQuery += "foodCategory = ?, ";
    params.push(foodCategory);
  }

  // Remove trailing comma and add WHERE clause
  updateQuery = updateQuery.replace(/, $/, " WHERE email = ?");
  params.push(email);

  // Execute the query
  db.query(updateQuery, params, (err, result) => {
    if (err) {
      console.error("Error updating profile:", err);
      return res
        .status(500)
        .json({ error: "An error occurred while updating the profile." });
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

app.get("/api/sellerOrders", (req, res) => {
  const { userId } = req.query; // Fetch seller_id from query parameters

  if (!userId) {
    return res.status(400).json({ error: "Seller ID is required." });
  }

  const query = `
    SELECT 
      o.id AS orderId,
      o.orderedItem,
      o.quantity,
      o.contact,
      o.total_price,
      o.order_date,
      COALESCE(b.name, s.name) AS buyerName,  
      COALESCE(b.location, s.location) AS buyerLocation
    FROM orders o
    LEFT JOIN buyers b ON o.buyer_email = b.email
    LEFT JOIN sellers s ON o.buyer_email = s.email
    WHERE o.seller_id = ?
    ORDER BY o.order_date DESC;
  `;

  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error("Error fetching orders:", err);
      return res.status(500).json({ error: "Failed to fetch orders." });
    }

    res.json({ orders: results });
  });
});

//count orders
app.get("/api/seller-stats/:sellerId", (req, res) => {
  const { sellerId } = req.params;

  const query = `
    SELECT 
      COUNT(seller_id) AS total_orders, 
      COALESCE(SUM(total_price), 0) AS total_sales
    FROM orders
    WHERE seller_id = ?;
  `;

  db.query(query, [sellerId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Database query failed" });
    }

    res.json(results[0]); // Return stats object
  });
});

//email to sellers for orders
app.post("/api/send-order-email", async (req, res) => {
  const { sellerEmail, buyerEmail, sellerName, orderedItem, quantity, price, contact } = req.body;

  if (!sellerEmail || !buyerEmail) {
    return res.status(400).json({ error: "Missing seller or buyer email" });
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: sellerEmail,
    subject: "New Order Received",
    html: `
       <div style="font-family: Arial, sans-serif; padding: 8px; background: #f4f4f4; border-radius: 10px;">
         <h2 style="color: #FC8934;">📦 New Order Received!</h2>
         <p>Hello <strong>${sellerName}</strong>,</p>
         <p>You have received a new order:</p>
         <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
          <tr>
            <td style="font-weight: bold; padding: 6px;">Buyer Email:</td>
            <td style="padding: 6px;">${buyerEmail}</td>
          </tr>
          <tr>
            <td style="font-weight: bold; padding: 6px;">Item:</td>
            <td style="padding: 6px;">${orderedItem}</td>
          </tr>
          <tr>
            <td style="font-weight: bold; padding: 6px;">Quantity:</td>
            <td style="padding: 6px;">${quantity}</td>
          </tr>
          <tr>
            <td style="font-weight: bold; padding: 6px;">Total Price:</td>
            <td style="padding: 6px;">৳${price} BDT</td>
          </tr>
          <tr>
            <td style="font-weight: bold; padding: 6px;">Contact:</td>
            <td style="padding: 6px;">${contact}</td>
          </tr>
        </table>
        <p>Check your dashboard for more details.</p>
        <p>Best regards,</p>
        <p><strong>eFoodBD Team</strong></p>
        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">       
        <p style="text-align: center; font-size: 14px;">Follow us on:</p>
        <p style="text-align: center;">
          <a href="https://www.facebook.com/share/17MfbcR8C1/?mibextid=wwXIfr" style="text-decoration: none; margin: 0 10px;">
            <img src="https://cdn-icons-png.flaticon.com/128/1384/1384005.png" alt="Facebook" width="24">
          </a>
          <a href="https://twitter.com/efoodbd" style="text-decoration: none; margin: 0 10px;">
            <img src="https://cdn-icons-png.flaticon.com/128/733/733635.png" alt="Twitter" width="24">
          </a>
          <a href="https://instagram.com/efoodbd" style="text-decoration: none; margin: 0 10px;">
            <img src="https://cdn-icons-png.flaticon.com/128/1384/1384031.png" alt="Instagram" width="24">
          </a>
        </p>
        <p style="text-align: center; font-size: 12px; color: #666;">&copy; 2025 eFoodBD. All rights reserved.</p>
      </div>
     `,

};

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Email sent successfully!" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ error: "Failed to send email" });
  }
});


// delete post

app.delete('/api/foodPosts/:id', async (req, res) => {
  const { id } = req.params;
  try {
      db.query('DELETE FROM food_posts WHERE id = ?', [id]);
      res.status(200).send({ message: 'Post deleted successfully!' });
  } catch (error) {
      res.status(500).send({ error: 'Failed to delete post.' });
  }
});

// review section
app.post("/api/complaints/:userId", async (req, res) => {
  const { complainant, respondent_id, description, rating } = req.body;
  const userId = req.params.userId;

  if (!complainant || !respondent_id || !description || !rating) {
    return res.status(400).json({ error: "All fields are required" });
  }

  // Prevent user from complaining about themselves
  // if (userId === respondent_id) {
  //   return res.status(400).json({ error: "You cannot submit a complaint against yourself." });
  // }

  try {
    // **Check if the user has already submitted a complaint against the same respondent**
    const checkQuery = `SELECT * FROM complain WHERE complainant_id = ? AND respondent_id = ?`;
    db.query(checkQuery, [userId, respondent_id], (err, results) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ error: "Internal Server Error" });
      }

      if (results.length > 0) {
        // **Update existing complaint instead of inserting a new one**
        const updateQuery = `
          UPDATE complain 
          SET description = ?, rating = ?
          WHERE complainant_id = ? AND respondent_id = ?`;

        db.query(updateQuery, [description, rating, userId, respondent_id], (err, updateResult) => {
          if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ error: "Internal Server Error" });
          }
          res.status(200).json({ message: "Complaint updated successfully" });
        });

      } else {
        // **Insert new complaint if no previous complaint exists**
        const insertQuery = `
          INSERT INTO complain (complainant, complainant_id, respondent_id, description, rating)
          VALUES (?, ?, ?, ?, ?)`;
        const values = [complainant, userId, respondent_id, description, rating];

        db.query(insertQuery, values, (err, insertResult) => {
          if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ error: "Internal Server Error" });
          }
          res.status(201).json({ message: "Complaint submitted successfully" });
        });
      }
    });

  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});


// Fetch reviews for a seller along with the average rating
app.get("/api/reviews/:sellerId", (req, res) => {
  const { sellerId } = req.params;

  const query = `
    SELECT complainant, description, rating 
    FROM complain 
    WHERE respondent_id = ?`;

  const avgRatingQuery = `
    SELECT AVG(rating) AS average_rating 
    FROM complain 
    WHERE respondent_id = ?`;

  // Execute both queries in parallel
  db.query(query, [sellerId], (err, reviews) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    db.query(avgRatingQuery, [sellerId], (err, avgResult) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ error: "Internal Server Error" });
      }

      const averageRating = avgResult[0]?.average_rating || 0; // Default to 0 if no rating exists

      res.status(200).json({ reviews, averageRating });
    });
  });
});



// Search Sellers by Food Category
app.get("/api/search-sellers", (req, res) => {
  const { category } = req.query;

  if (!category) {
    return res.status(400).json({ error: "Food category is required" });
  }

  const query = `
    SELECT id, name, location, foodCategory AS category, occupation, bio, profilePicture
    FROM sellers
    WHERE foodCategory LIKE ?
  `;

  db.query(query, [`%${category}%`], (err, results) => {
    if (err) {
      console.error("Error fetching sellers:", err);
      return res.status(500).json({ error: "Failed to fetch sellers" });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "No sellers found for this category" });
    }

    res.json(results);
  });
});




// Start Server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});