const router =require("express").Router();
const { getAllCustomersCtrl,getCustomerCountCtrl,getCustomerProfileCtrl,getMyProfile,updateCustomerProfileCtrl,deleteCustomerProfileCtrl,profilePhotoUploaderCtrl  } = require("../controllers/customerController");
const { getUsersCountCtrl } = require("../controllers/userController");
const photoUpload = require("../middlewares/photoUpload");
const { validateObjectId } = require("../middlewares/validateObjectId");
const { verifyTokenAndAdmin, verifyTokenAndOnlyUser, verifyToken, verifyTokenAndAuthorization,verifyTokenAndBoth } = require("../middlewares/verifyToken");


//api/customers/profile

router.get("/profile",verifyTokenAndBoth,getAllCustomersCtrl)
//api/customers/profile/me
router.get("/profile/me",verifyToken,getMyProfile);

//api/customers/profile/:id
router.get("/profile/:id",validateObjectId,verifyTokenAndBoth,getCustomerProfileCtrl)
router.put("/profile/:id",validateObjectId,verifyTokenAndBoth,updateCustomerProfileCtrl)
router.delete("/profile/:id",validateObjectId,verifyTokenAndBoth,deleteCustomerProfileCtrl);

//api/customers/profile/profile-photo-upload
router.post("/profile/profile-photo-upload",verifyTokenAndBoth,photoUpload.single("image"),profilePhotoUploaderCtrl)

//api/customers/count

router.get("/count",verifyTokenAndBoth,getCustomerCountCtrl)

module.exports=router;