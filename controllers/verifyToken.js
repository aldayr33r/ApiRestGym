const jwt = require('jsonwebtoken');

function verifyToken(req, res, next) {
    const token = req.headers['x-access-token'] || req.headers['authorization'];

    if (!token) {
        return res.status(401).json({ 
            auth: false, 
            message: 'Token no proporcionado' 
        });
    } 

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ 
                auth: false, 
                message: 'Token inválido o expirado' 
            });
        }

        req.userId = decoded.id;
        next();
    });
}

module.exports = verifyToken;
