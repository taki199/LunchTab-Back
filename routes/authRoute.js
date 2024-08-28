const router =require("express").Router();
const {registerUserCtrl, loginUserCtrl,registerCustomerCtrl,loginCustomerCtrl}=require("../controllers/authController")
const UserActivity = require('../models/UserActivity'); // Assuming you have a UserActivity model

router.get('/activity-log', async (req, res) => {
    try {
        const activityLogs = await UserActivity.find().sort({ timestamp: -1 });
        res.json(activityLogs);
    } catch (error) {
        console.error('Error fetching activity logs from database:', error);
        res.status(500).json({ error: 'Error retrieving activity logs' });
    }
});



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