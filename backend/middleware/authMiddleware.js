const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

const authMiddleware = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) {
        logger.warn('Authentication failed: No token provided', { ip: req.ip });
        return res.status(401).json({ message: "Unauthorized", success: false });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            logger.warn('Authentication failed: Invalid token', { 
                error: err.message,
                ip: req.ip 
            });
            return res.status(403).json({ message: "Forbidden", success: false });
        }
        
        logger.info('User authenticated', { userId: decoded.id });
        req.user = decoded;
        next();
    });
}

module.exports = authMiddleware;