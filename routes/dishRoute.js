const router = require('express').Router();
const { createDishCtrl,getAllDishesCtrl,getSingleDishCtrl,updateDishCtrl } = require('../controllers/dishController.js');
const { verifyTokenAndAdmin }=require('../middlewares/verifyToken')
const photoUpload = require("../middlewares/photoUpload");
const {validateObjectId}=require('../middlewares/validateObjectId')


// //api/dishes


router.post( '/',verifyTokenAndAdmin,photoUpload.single("image"),createDishCtrl);
router.get("/",getAllDishesCtrl)


// //api/categories/:id
//router.delete("/:id",validateObjectId,verifyTokenAndAdmin,deleteCategoriesCtrl)
router.put("/:id",validateObjectId,verifyTokenAndAdmin,photoUpload.single("image"),updateDishCtrl)
router.get("/:id",validateObjectId,getSingleDishCtrl)

module.exports=router;