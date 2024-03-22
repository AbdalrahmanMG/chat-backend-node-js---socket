const jwt = require('jsonwebtoken');
const { User } = require('../models/user.model');

const protectedRoutes = async (req, res, next) =>{
    try {
        console.log("here you go!!");
        const authHeader = req.headers['authorization']
        const token = authHeader && authHeader.split(' ')[1];
        if(!token){
        return res.status(401).json({ success: false, message: 'Unauthorized user - no token !' });
        }

        const decoded = jwt.verify(token, process.env.SECRET_KEY)
        if (!decoded) {
            return res.status(401).json({ success: false, message: 'Unauthorized user - Invalid token!' });
        }

        const user = await User.findById(decoded.userId).select('-password')
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        req.user = user
        next()
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

module.exports = protectedRoutes