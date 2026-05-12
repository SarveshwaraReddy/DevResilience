import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

export const protect = async (req, res, next) => {
  let token;

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer')) {
    // Extract token from `Authorization: Bearer <token>`
    token = authHeader.split(' ')[1];

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Support common JWT payload shapes: { id }, { userId }, { _id }
      const userId = decoded?.id || decoded?.userId || decoded?._id;

      console.log('[auth.protect] token decoded', {
        hasDecoded: !!decoded,
        keys: decoded ? Object.keys(decoded) : [],
        userId: userId || null,
      });

      if (!userId) {
        return res.status(401).json({ success: false, error: 'Not authorized, invalid token payload' });
      }

      // Fetch user from DB
      req.user = await User.findById(userId).select('-password');

      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Not authorized, user not found' });
      }

      return next();
    } catch (error) {
      console.error('[auth.protect] token verify failed', {
        message: error?.message,
        stack: error?.stack,
      });

      return res.status(401).json({ success: false, error: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, error: 'Not authorized, no token' });
  }
};

