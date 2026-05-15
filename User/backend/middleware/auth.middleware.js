import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-change-this';
export const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ error: 'No token' });
    }

    const token = authHeader.replace('Bearer ', '');

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.userId = decoded.userId;
    req.userEmail = decoded.email;

    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};
