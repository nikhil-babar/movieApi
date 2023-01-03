const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        const token = req.header?.('Authorization')?.split(" ")[1];
        req.user = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        next()
    } catch (error) {
        res.status(401).json({message: 'Invalid access token'})
    }
}