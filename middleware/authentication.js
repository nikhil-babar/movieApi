const admin = require('firebase-admin')

module.exports = async (req, res, next) => {
    try {
        const token = req.header?.('Authorization')?.split(" ")[1];
        req.user = await admin.auth().verifyIdToken(token);
        next()
    } catch (error) {
        res.status(403).json({message: 'Invalid access token'})
    }
}