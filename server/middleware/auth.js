import jwt from 'jsonwebtoken';

// Middleware to protect routes - verifies JWT token
export const protect = async (req, res, next) => {
  try {
    // Get token from Authorization header
    // Format: "Bearer <token>"
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        message: 'Not authorized. No token provided.' 
      });
    }

    // Extract token (remove "Bearer " prefix)
    const token = authHeader.substring(7);

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user info to request object for use in controllers
    req.user = decoded;
    
    next(); // Continue to next middleware/route handler
  } catch (error) {
    return res.status(401).json({ 
      success: false, 
      message: 'Not authorized. Invalid token.' 
    });
  }
};
