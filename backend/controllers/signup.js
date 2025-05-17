const {validationResult} = require("express-validator");
const pool = require("../database/db");
const argon2 = require("argon2");

const signup = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({errors: errors.array()});
    }
    
    const {username, password} = req.body;
    
    try {
        const checkUser = await pool.query("SELECT * FROM users WHERE username = $1", [username]);
        if (checkUser.rows.length > 0) {
            return res.status(409).json({message: "Username already exists", success: false});
        }
        
        const hashedPassword = await argon2.hash(String(password), {
            type: argon2.argon2id, 
            memoryCost: 2**16,
            timeCost: 3,         
            parallelism: 4        
        });
        const newUser = await pool.query(
            "INSERT INTO users (username, password) VALUES ($1, $2) RETURNING *",
            [username, hashedPassword]
        );
        if (newUser.rows.length === 0) {
            return res.status(500).json({message: "Failed to create user", success: false});
        }
        return res.status(201).json({
            message: "User created successfully", 
            success: true
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({message: "Internal server error", success: false});
    }
}

module.exports = signup;