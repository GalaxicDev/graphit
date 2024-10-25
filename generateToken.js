import jwt from 'jsonwebtoken';

export const generateToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: '31d'  // Token expires in 1 hour
    });
};
