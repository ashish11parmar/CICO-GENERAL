const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
        const token = authHeader.split(' ')[1]; // Assuming the token is in the format "Bearer <token>"
        jwt.verify(token, process.env.SECRET_KEY, (err, user) => {
            if (err) return res.status(403).json({ message: "Token is not valid!" });
            req.user = user;
            console.log(req.user);
            next();
        });
    } else {
        return res.status(401).json({ message: "You are not authenticated!" });
    }
};

const verifyUser = (req, res, next) => {
    verifyToken(req, res, () => {
        console.log(req.user);
        if (req.user.id === req.params.id) { // Assuming req.params contains the user id
            next();
        } else {
            return res.status(403).json({ message: "You are not authorized!" });
        }
    });
};

module.exports = { verifyToken, verifyUser };
