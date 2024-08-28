const asyncHandler = require("express-async-handler");
const Order = require("../models/Order");
const { Dish } = require('../models/Dish');
const { Customer } = require('../models/Customer');
const mongoose = require('mongoose');


/**------------------------------------------
 *
 *   @desc    Create New Order
 *   @route   POST /api/orders
 *   @access  Private (only admin or customer)
----------------------------------------- */

module.exports.createOrderCtrl = asyncHandler(async (req, res) => {
    try {
        const { customerId, orderItems, orderStatus, shippingAddress, paymentMethod, deliveryDate } = req.body;

        if (!customerId) {
            return res.status(400).json({ message: 'Customer ID is required' });
        }

        for (const item of orderItems) {
            if (!item || typeof item !== 'object' || !('dishId' in item) || !('quantity' in item)) {
                return res.status(400).json({ message: 'Invalid order item' });
            }

            const dish = await Dish.findById(item.dishId);
            if (!dish) {
                return res.status(400).json({ message: 'Dish not found' });
            }

            if (dish.stock < item.quantity) {
                return res.status(400).json({ message: `Not enough stock available for ${dish.name}` });
            }
        }

        let totalAmount = 0;
        for (const item of orderItems) {
            const dish = await Dish.findById(item.dishId);
            totalAmount += dish.price * item.quantity;
            dish.stock -= item.quantity;
            await dish.save();
        }

        const newOrder = new Order({
            customer: customerId,
            orderItems,
            totalAmount,
            orderStatus,
            shippingAddress,
            paymentMethod,
            deliveryDate
        });

        await newOrder.save();

        await Order.populate(newOrder, { path: 'orderItems.dishId', select: '_id name price' });

        res.status(201).json({ message: 'Order created successfully', order: newOrder });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to create Order' });
    }
});

/**------------------------------------------
 *
 *   @desc   Update Order
 *   @route   Put /api/orders/:id
 *   @access  Private (only admin or customer)
----------------------------------------- */


module.exports.updateOrderCtrl = asyncHandler(async (req, res) => {
    try {
        const orderId = req.params.id;
        const { orderItems, orderStatus, shippingAddress, paymentMethod, deliveryDate } = req.body;

        if (orderItems) {
            for (const item of orderItems) {
                if (!item || typeof item !== 'object' || !('dishId' in item) || !('quantity' in item)) {
                    return res.status(400).json({ message: 'Invalid order item' });
                }

                const dish = await Dish.findById(item.dishId);
                if (!dish) {
                    return res.status(400).json({ message: 'Dish not found' });
                }

                if (dish.stock < item.quantity) {
                    return res.status(400).json({ message: `Not enough stock available for ${dish.name}` });
                }
            }

            let totalAmount = 0;
            for (const item of orderItems) {
                const dish = await Dish.findById(item.dishId);
                totalAmount += dish.price * item.quantity;
                dish.stock -= item.quantity;
                await dish.save();
            }
        }

        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        if (orderItems) order.orderItems = orderItems;
        if (orderStatus) order.orderStatus = orderStatus;
        if (shippingAddress) order.shippingAddress = shippingAddress;
        if (paymentMethod) order.paymentMethod = paymentMethod;
        if (deliveryDate) order.deliveryDate = deliveryDate;

        await order.save();

        await Order.populate(order, { path: 'orderItems.dishId', select: '_id name price' });

        res.status(200).json({ message: 'Order updated successfully', order });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to update Order' });
    }
});


/**------------------------------------------
 *
 *   @desc   Delete Order
 *   @route   DELETE /api/orders/:id
 *   @access  Private (only admin or customer)
----------------------------------------- */

module.exports.deleteOrderCtrl = asyncHandler(async (req, res) => {
    try {
        const orderId = req.params.id;

        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        await Order.deleteOne({ _id: orderId });

        res.status(200).json({ message: 'Order deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to delete Order' });
    }
});


  
 /**------------------------------------------
 *
 *   @desc   Get All Orders
 *   @route   GET /api/orders
 *   @access  Private (only admin or customer)
----------------------------------------- */
  module.exports.getAllOrdersCtrl = asyncHandler(async (req, res) => {
    try {
        const orders = await Order.find()
            .populate({
                path: 'orderItems.dishId',
                select: 'name', // Select only the 'name' field of the dish
            })
            .populate('customer', '-password -_id -email');

        res.status(200).json({ message: 'Orders retrieved successfully', orders });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to retrieve orders' });
    }
});

/**------------------------------------------
 *
 *   @desc   Get Single Order by ID
 *   @route   GET /api/orders/:id
 *   @access  Private (only admin or customer)
----------------------------------------- */
module.exports.getSingleOrderCtrl = asyncHandler(async (req, res) => {
    try {
        const orderId = req.params.id;

        const order = await Order.findById(orderId)
            .populate('orderItems.dishId', '_id name price')
            .populate({
                path: 'customer',
                select: '-password' // Exclude the password field
            });

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        res.status(200).json({ message: 'Order retrieved successfully', order })
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to retrieve Order' });
    }
});



// Get Customer Orders Controller
module.exports.getCustomerOrdersCtrl = asyncHandler(async (req, res) => {
    try {
        // Get customer ID from the authenticated user's data
        const customerId = req.user.id;

        // Find orders associated with the customer ID
        const orders = await Order.find({ customer: customerId })
            .populate('orderItems.dishId', '_id name price')
            .populate({
                path: 'customer',
                select: '-password' // Exclude the password field
            });

        if (!orders || orders.length === 0) {
            return res.status(404).json({ message: 'No orders found for the customer' });
        }

        res.status(200).json({ message: 'Customer orders retrieved successfully', orders });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to retrieve customer orders' });
    }
});

/**------------------------------------------
 *
 *   @desc   order Count
 *   @route   Put /api/orders/count
 *   @access  Private (only admin or customer)
----------------------------------------- */
module.exports.getOrdersCountCtrl=asyncHandler(async(req,res)=>{
    const count=await Order.countDocuments();
    res.status(200).json(count);

});