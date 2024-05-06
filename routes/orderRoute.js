const router = require('express').Router();
const {createOrderCtrl,updateOrderCtrl,getAllOrdersCtrl,getSingleOrderCtrl,getCustomerOrdersCtrl,deleteOrderCtrl}=require("../controllers/orderController")
const {verifyTokenAndBoth}=require('../middlewares/verifyToken')
const {validateObjectId}=require('../middlewares/validateObjectId')


console.log(createOrderCtrl);


 //api/orders
router.get('/',verifyTokenAndBoth,getAllOrdersCtrl)
router.get('/my-orders',verifyTokenAndBoth,getCustomerOrdersCtrl)




router.post( '/',verifyTokenAndBoth,createOrderCtrl);

//api/order/:id
router.put('/:id',validateObjectId,verifyTokenAndBoth,updateOrderCtrl)
router.delete('/:id',validateObjectId,verifyTokenAndBoth,deleteOrderCtrl)
router.get('/:id',validateObjectId,verifyTokenAndBoth,getSingleOrderCtrl)





module.exports=router; 