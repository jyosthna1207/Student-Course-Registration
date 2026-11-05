
const express = require("express");
const mysql = require("mysql2");
const path = require("path");

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend files
app.use(express.static(path.join(__dirname, "Public")));

// MySQL connection
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "jsystem",
    database: "StudentCourseRegistrationDB"
});

db.connect((err) => {
    if (err) {
        console.error("MySQL connection failed:", err.message);
        return;
    }

    console.log("Connected to StudentCourseRegistrationDB");
});

// Get all courses
app.get("/courses", (req, res) => {
    db.query("SELECT * FROM Courses ORDER BY Course_ID", (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// Get one course
app.get("/courses/:id", (req, res) => {
    db.query(
        "SELECT * FROM Courses WHERE Course_ID = ?",
        [req.params.id],
        (err, results) => {
            if (err) return res.status(500).json({ error: err.message });

            if (results.length === 0) {
                return res.status(404).json({ message: "Course not found" });
            }

            res.json(results[0]);
        }
    );
});

// Add a course
app.post("/courses", (req, res) => {
    const { Course_ID, Course_code, Course_name, Credits, Department, Semester } = req.body;

    const sql = `INSERT INTO Courses
        (Course_ID, Course_code, Course_name, Credits, Department, Semester)
        VALUES (?, ?, ?, ?, ?, ?)`;

    db.query(
        sql,
        [Course_ID, Course_code, Course_name, Credits, Department, Semester],
        (err, result) => {
            if (err) return res.status(400).json({ error: err.message });
            res.status(201).json({ message: "Course added successfully" });
        }
    );
});

// Update a course
app.put("/courses/:id", (req, res) => {
    const { Course_code, Course_name, Credits, Department, Semester } = req.body;

    const sql = `UPDATE Courses
        SET Course_code = ?, Course_name = ?, Credits = ?,
            Department = ?, Semester = ?
        WHERE Course_ID = ?`;

    db.query(
        sql,
        [Course_code, Course_name, Credits, Department, Semester, req.params.id],
        (err, result) => {
            if (err) return res.status(400).json({ error: err.message });

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: "Course not found" });
            }

            res.json({ message: "Course updated successfully" });
        }
    );
});

// Delete a course
app.delete("/courses/:id", (req, res) => {
    db.query(
        "DELETE FROM Courses WHERE Course_ID = ?",
        [req.params.id],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: "Course not found" });
            }

            res.json({ message: "Course deleted successfully" });
        }
    );
});

// Register a student for a course
app.post("/registrations", (req, res) => {
    const { Student_Name, Course_ID } = req.body;

    const sql = `INSERT INTO Registrations (Student_Name, Course_ID)
                 VALUES (?, ?)`;

    db.query(sql, [Student_Name, Course_ID], (err, result) => {
        if (err) return res.status(400).json({ error: err.message });

        res.status(201).json({ message: "Student registered successfully" });
    });
});

// View all registrations
app.get("/registrations", (req, res) => {
    const sql = `
        SELECT r.Registration_ID, r.Student_Name, r.Course_ID,
               c.Course_code, c.Course_name, r.Registered_On
        FROM Registrations r
        JOIN Courses c ON r.Course_ID = c.Course_ID
        ORDER BY r.Registration_ID DESC
    `;

    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
