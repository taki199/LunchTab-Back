const jwt = require('jsonwebtoken')

function verifyToken(req, res, next) {
    const token = req.cookies.authToken;
    if (token) {
      try {
        const decodedPayload = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decodedPayload;
        next();
      } catch (error) {
        return res.status(403).json({ message: "Invalid Token, access denied" });
      }
    } else {
      return res.status(401).json({ message: "No token provided, access denied" });
    }
  }
  
  // Verify token & admin
  function verifyTokenAndAdmin(req, res, next) {
    verifyToken(req, res, () => {
      if (req.user.isAdmin) {
        next();
      } else {
        return res.status(403).json({ success: false, message: "Not allowed, only admin" });
      }
    });
  }
  
  // Verify token and both admin or customer
  function verifyTokenAndBoth(req, res, next) {
    verifyToken(req, res, () => {
      if (req.user.isAdmin || req.user.isCustomer) {
        next();
      } else {
        return res.status(403).json({ success: false, message: "Not allowed, only admin or customer" });
      }
    });
  }
  
  // Verify token and only the user himself
  function verifyTokenAndOnlyUser(req, res, next) {
    verifyToken(req, res, () => {
      if (req.user.id === req.params.id) {
        next();
      } else {
        return res.status(403).json({ success: false, message: "Not allowed, only the user himself" });
      }
    });
  }
  
  // Verify token and authorization (user himself or admin)
  function verifyTokenAndAuthorization(req, res, next) {
    verifyToken(req, res, () => {
      if (req.user.id === req.params.id || req.user.isAdmin) {
        next();
      } else {
        return res.status(403).json({ success: false, message: "Not allowed, only the user himself or admin" });
      }
    });
  }
 
  


  
  
  
  
  
  
  
 
  
  
  module.exports = {
    verifyToken,
    verifyTokenAndAdmin,
    verifyTokenAndOnlyUser,
    verifyTokenAndAuthorization,
    verifyTokenAndBoth,
   
    
  };