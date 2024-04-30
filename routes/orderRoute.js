const router = require('express').Router();
const {createOrderCtrl}=require("../controllers/orderController")
const {validateObjectId,verifyTokenAndBoth}=require('../middlewares/validateObjectId')


console.log(createOrderCtrl);


 //api/orders


router.post( '/',verifyTokenAndBoth,createOrderCtrl);