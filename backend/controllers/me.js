const {validationResult} = require("express-validator");
const pool = require("../database/db");
const getData = async (req, res) => {
    const userId = req.user.id;
    try {
        const user = await pool.query("SELECT * FROM users WHERE id = $1", [userId]);
        if (user.rows.length === 0) {
            return res.status(404).json({ message: "User not found", success: false });
        }
        //share all data except password
        const { password, ...userData } = user.rows[0];
        return res.status(200).json({
            message: "User data retrieved successfully",
            success: true,
            data: userData
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error", success: false });
    }
}

const changeDescription = async (req, res) => {
    const userId = req.user.id;
    const { description } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }
    try {
        const updatedUser = await pool.query(
            "UPDATE users SET description = $1 WHERE id = $2 RETURNING *",
            [description, userId]
        );
        if (updatedUser.rows.length === 0) {
            return res.status(404).json({ message: "User not found", success: false });
        }
        //share all data except password
        const { password, ...userData } = updatedUser.rows[0];
        return res.status(200).json({
            message: "Description updated successfully",
            success: true,
            data: userData
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error", success: false });
    }
}

module.exports = {
    getData,
    changeDescription
}