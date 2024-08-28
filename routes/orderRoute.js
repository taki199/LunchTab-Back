const router = require('express').Router();
const {createOrderCtrl,updateOrderCtrl,getAllOrdersCtrl,getSingleOrderCtrl,getCustomerOrdersCtrl,deleteOrderCtrl,getOrdersCountCtrl}=require("../controllers/orderController")
const {verifyTokenAndBoth}=require('../middlewares/verifyToken')
const {validateObjectId}=require('../middlewares/validateObjectId')


console.log(createOrderCtrl);


 //api/orders
router.get('/',verifyTokenAndBoth,getAllOrdersCtrl)
router.get('/my-orders',verifyTokenAndBoth,getCustomerOrdersCtrl)
//api/order/count
router.get('/my-count/my-orders',verifyTokenAndBoth,getOrdersCountCtrl)




router.post( '/',verifyTokenAndBoth,createOrderCtrl);

//api/order/:id
router.put('/:id',validateObjectId,verifyTokenAndBoth,updateOrderCtrl)
router.delete('/:id',validateObjectId,verifyTokenAndBoth,deleteOrderCtrl)
router.get('/:id',validateObjectId,verifyTokenAndBoth,getSingleOrderCtrl)





module.exports=router; 