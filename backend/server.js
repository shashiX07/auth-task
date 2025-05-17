const express = require("express");
const pool  = require("./database/db");
const cors = require("cors");
const {body} = require("express-validator");
const rateLimit = require("express-rate-limit");
const app = express();
const port = process.env.PORT || 5000;
const bodyParser = require("body-parser");
const signup = require("./controllers/signup");
const signin = require("./controllers/signin");
const authMiddleware = require("./middleware/authMiddleware");
const loggingMiddleware = require("./middleware/loggingMiddleware");
const logger = require("./utils/logger");
const {getData, changeDescription} = require("./controllers/me");
require("dotenv").config();

// Configure rate limiters for simple api end points
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: { message: "Too many requests, please try again later", success: false },
    handler: (req, res, next, options) => {
        logger.warn(`Rate limit exceeded by IP: ${req.ip}`);
        res.status(options.statusCode).send(options.message);
    }
});

// Stricter rate limit for authentication endpoints more security
const authLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour window
    max: 10, // limit each IP to 10 requests per hour
    message: { message: "Too many sign-in attempts, please try again later", success: false },
    handler: (req, res, next, options) => {
        logger.warn(`Authentication rate limit exceeded by IP: ${req.ip}`);
        res.status(options.statusCode).send(options.message);
    }
});



// Apply logging middleware early in the chain
app.use(loggingMiddleware);
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post("/signup",  authLimiter, [
    body("username").notEmpty().withMessage("Username is required"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters long")
], signup);

app.post("/signin", authLimiter, [
    body("username").notEmpty().withMessage("Username is required"),
    body("password").notEmpty().withMessage("Password is required")
], signin);

app.get("/me", apiLimiter, authMiddleware, getData);
app.put("/me",apiLimiter, authMiddleware, [
    body("description").isLength({ max: 300 }).withMessage("Description must be less than 300 characters")
], changeDescription);

// Improved error handler with logging
app.use((err, req, res, next) => {
    logger.error(`${err.name}: ${err.message}`, { 
        stack: err.stack,
        path: req.path
    });
    res.status(500).json({ message: "Internal server error", success: false });
});

pool.connect((err) => {
    if (err) {
        logger.error("Error connecting to the database", err);
    } else {
        //create table if not exists
        pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                password TEXT NOT NULL,
                description VARCHAR(300) DEFAULT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `, (err, res) => {
            if (err) {
                logger.error("Error creating table", err);
            } else {
                logger.info("Table created or already exists");
            }
        });
        logger.info("Connected to the database");
        app.listen(port, () => {
            logger.info(`Server is running on port ${port}`);
        });
    }
});