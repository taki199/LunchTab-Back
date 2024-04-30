const router = require('express').Router();
const { createCategoryCtrl,getAllCategoriesCtrl,deleteCategoriesCtrl,updateCategoryCtrl,getDishesByCategoryCtrl,getSingleCategoryCtrl } = require('../controllers/categoryController');
const { verifyTokenAndAdmin }=require('../middlewares/verifyToken')
const photoUpload = require("../middlewares/photoUpload");
const {validateObjectId}=require('../middlewares/validateObjectId')


// //api/categories

router.post( '/',verifyTokenAndAdmin,photoUpload.single("image"),createCategoryCtrl);
router.get("/",getAllCategoriesCtrl)


// //api/categories/:id
router.delete("/:id",validateObjectId,verifyTokenAndAdmin,deleteCategoriesCtrl)
router.put("/:id",validateObjectId,verifyTokenAndAdmin,photoUpload.single("image"),updateCategoryCtrl)
router.get("/:id",validateObjectId,getSingleCategoryCtrl)

// Route to fetch all dishes from a specific category
router.get('/:categoryId/dishes', getDishesByCategoryCtrl);



module.exports=router;