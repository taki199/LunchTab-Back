const router =require("express").Router();
const { getAllUsersCtrl,getUserProfileCtrl,getMyProfile,updateUserProfileCtrl,getUsersCountCtrl,profilePhotoUploaderCtrl,deleteUserProfileCtrl } = require("../controllers/userController");
const photoUpload = require("../middlewares/photoUpload");
const { validateObjectId } = require("../middlewares/validateObjectId");
const { verifyTokenAndAdmin, verifyTokenAndOnlyUser, verifyToken, verifyTokenAndAuthorization } = require("../middlewares/verifyToken");





//api/users/profile

router.get("/profile",verifyTokenAndAdmin,getAllUsersCtrl)
//api/users/profile/me
router.get("/profile/me",verifyToken,getMyProfile);

//api/users/profile/:id
router.get("/profile/:id",validateObjectId,verifyTokenAndAdmin,getUserProfileCtrl)
router.put("/profile/:id",validateObjectId,verifyTokenAndOnlyUser,updateUserProfileCtrl)
router.delete("/profile/:id",validateObjectId,verifyTokenAndAuthorization,deleteUserProfileCtrl);

//api/users/profile/profile-photo-upload
router.post("/profile/profile-photo-upload",verifyToken,photoUpload.single("image"),profilePhotoUploaderCtrl)

//api/users/count

router.get("/count",verifyTokenAndAdmin,getUsersCountCtrl)

module.exports=router;