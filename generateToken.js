import jwt from 'jsonwebtoken';

export const generateToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: '1h'  // Token expires in 1 hour
    });
};
