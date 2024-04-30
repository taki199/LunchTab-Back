const router = require('express').Router();
const { createDishCtrl,getAllDishesCtrl,getSingleDishCtrl,updateDishCtrl,deleteDishCtrl,getDishByIdCtrl } = require('../controllers/dishController.js');
const { verifyTokenAndAdmin }=require('../middlewares/verifyToken')
const photoUpload = require("../middlewares/photoUpload");
const {validateObjectId}=require('../middlewares/validateObjectId')


// //api/dishes


router.post( '/',verifyTokenAndAdmin,photoUpload.single("image"),createDishCtrl);
router.get("/",getAllDishesCtrl)


// //api/dishes/:id
router.get('/:id',validateObjectId,getDishByIdCtrl)
router.delete("/:id",validateObjectId,verifyTokenAndAdmin,deleteDishCtrl)
router.put("/:id",validateObjectId,verifyTokenAndAdmin,photoUpload.single("image"),updateDishCtrl)
router.get("/:id",validateObjectId,getSingleDishCtrl)

module.exports=router;