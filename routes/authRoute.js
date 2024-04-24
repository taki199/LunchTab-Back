const router =require("express").Router();
const {registerUserCtrl, loginUserCtrl,registerCustomerCtrl,loginCustomerCtrl}=require("../controllers/authController")

//admin
// /api//auth/register/admin
router.post("/register/admin",registerUserCtrl)
// /api//auth/login/admin
router.post("/login/admin",loginUserCtrl)



//customer 
// /api//auth/register

router.post("/register",registerCustomerCtrl)
//api//auth/login
router.post("/login",loginCustomerCtrl)

module.exports=router;