const jwt = require('jsonwebtoken');

function verifyToken(req, res, next) {
    const token = req.headers['x-access-token'];
    if (!token) {
        return res.status(401).json({ 
            auth: false, 
            message: 'No enviado' 
        });
    } 

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(500).json({ 
                auth: false, 
                message: 'Token inválido' 
            });
        }

        req.userId = decoded.id;
        next();
    });
}

module.exports = verifyToken;