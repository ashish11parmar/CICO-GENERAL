const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
        const token = authHeader.split(' ')[1]; // Assuming the token is in the format "Bearer <token>"
        jwt.verify(token, process.env.SECRET_KEY, (err, user) => {
            if (err) return res.status(403).json({ message: "Token is not valid!" });
            req.user = user;
            console.log("user", user);
            next();
        });
    } else {
        return res.status(401).json({ message: "You are not authenticated!" });
    }
};

module.exports = { verifyToken };
