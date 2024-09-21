const express = require("express");
const sql = require("mssql");
//const sqlite3 = require('sqlite3').verbose();
const bodyParser = require("body-parser");
require("dotenv").config();

const app = express();
const port = process.env.SERVER_PORT;

// Middleware to parse JSON bodies
app.use(bodyParser.json());

const sqlConfig = {
  user: process.env.SQL_USERNAME,
  password: process.env.SQL_PASSWORD,
  server: process.env.SQL_SERVER,
  port: Number(process.env.SQL_PORT),
  database: process.env.SQL_DB_NAME,
  authentication: {
    type: "default",
  },
  options: {
    encrypt: true,
  },
};

console.log("Starting...");

//Test sql connection
sql
  .connect(sqlConfig)
  .then((pool) => {
    console.log("Connected to SQL Server");
    return pool;
  })
  .catch((err) => {
    console.error("Database connection failed: ", err);
  });

// REST API Endpoints

// POST route to add a new user
app.post("/users", async (req, res) => {
  // Extract name and access_level from the request body
  const { name, access_level } = req.body;

  // Basic validation for inputs
  if (!name || access_level === undefined) {
    return res
      .status(400)
      .json({ error: "Name and access level are required" });
  }

  try {
    // Get the SQL connection pool
    const pool = await sql.connect(sqlConfig);

    // SQL query to insert data
    const query = `
      INSERT INTO users (name, access_level)
      VALUES (@name, @access_level);
    `;

    // Execute the query using prepared statements to avoid SQL injection
    const result = await pool
      .request()
      .input("name", sql.NVarChar, name)
      .input("access_level", sql.Int, access_level)
      .query(query);

    // Respond with success message and the inserted user ID
    res
      .status(201)
      .json({ message: "User added successfully", userId: result.recordset });
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "Database query error" });
  }
});

// GET route to fetch a user by ID
app.get("/users/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const pool = await sql.connect(sqlConfig);
    const query = `
      SELECT * FROM users WHERE id = @id;
    `;
    const result = await pool.request().input("id", sql.Int, id).query(query);

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(result.recordset[0]);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: "Database query error" });
  }
});

// GET route to fetch all users
app.get("/users", async (req, res) => {
  try {
    const pool = await sql.connect(sqlConfig);
    const query = `
      SELECT * FROM users;
    `;
    const result = await pool.request().query(query);

    res.status(200).json(result.recordset);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Database query error" });
  }
});

// DELETE route to delete a user by ID
app.delete("/users/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const pool = await sql.connect(sqlConfig);
    const query = `
      DELETE FROM users WHERE id = @id;
    `;
    const result = await pool.request().input("id", sql.Int, id).query(query);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: "Database query error" });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
