const jwt = require('jsonwebtoken');
const { validationResult } = require("express-validator");
const pool = require("../database/db");
const argon2 = require("argon2");
require("dotenv").config();

const signin = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }

    const { username, password } = req.body;

    try {
        const user = await pool.query("SELECT * FROM users WHERE username = $1", [username]);
        if (user.rows.length === 0) {
            return res.status(401).json({ message: "Invalid username or password", success: false });
        }

        const isPasswordValid = await argon2.verify(user.rows[0].password, String(password));
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid username or password", success: false });
        }

        const token = jwt.sign({ id: user.rows[0].id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRATION || '1h' });

        return res.status(200).json({
            message: "Signin successful",
            success: true,
            token
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error", success: false });
    }
}

module.exports = signin;