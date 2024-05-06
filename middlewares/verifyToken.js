const jwt = require('jsonwebtoken')

function verifyToken(req,res,next){
    const authToken=req.headers.authorization;
    if(authToken){
     const token=authToken.split(" ")[1] 
      try {

        const decodedPayload=jwt.verify(token,process.env.JWT_SECRET)
        req.user=decodedPayload;
        next();
        
      } catch (error) {
        return res.status(403).json({message:"Invalid Token,acces denied"})
      }
    }else{
        return res.status(401).json({message:"no token provided,access denied"})
    }
}
//verify token & admin
function verifyTokenAndAdmin(req,res,next){
    console.log('Request Headers:', req.headers);
    verifyToken(req,res,()=>{
        if(req.user.isAdmin ){
            next();

        }else{
            return res.status(403).json({success:false,message:"not allowed only admin"});
        }
    })

}
// if admin or customer
function verifyTokenAndBoth(req, res, next) {
    verifyToken(req, res, () => {
        if (req.user.isAdmin || req.user.isCustomer) {
            next(); // Proceed to the next middleware
        } else {
            return res.status(403).json({ success: false, message: "Not allowed. Only admin or customer." });
        }
    });
}


//verify token and only User Himself 
function verifyTokenAndOnlyUser(req,res,next){
    verifyToken(req,res,()=>{
        if(req.user.id===req.params.id ){
            next();

        }else{
            return res.status(403).json({success:false,message:"not allowed only user himself"});
        }
    })

}
// verify token and authorization
function verifyTokenAndAuthorization(req,res,next){
    verifyToken(req,res,()=>{
        if(req.user.id===req.params.id || req.user.isAdmin ){
            next();

        }else{
            return res.status(403).json({success:false,message:"not allowed only user himself or Admin"});
        }
    })

}
module.exports
={verifyToken,verifyTokenAndAdmin,verifyTokenAndOnlyUser,verifyTokenAndAuthorization,verifyTokenAndBoth};