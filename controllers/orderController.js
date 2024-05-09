const asyncHandler = require("express-async-handler");
const  Order  = require("../models/Order");
const { dish } = require('../models/Dish');
const {Customer}= require('../models/Customer')
const mongoose = require('mongoose');

/**------------------------------------------
 *
 *   @desc    Create New Order
 *   @route   POST /api/orders
 *   @access  Private (only admin or customer)
----------------------------------------- */

module.exports.createOrderCtrl = asyncHandler(async (req, res) => {
    try {
        // Destructure request body to extract order data
        const { customerId, orderItems, orderStatus, shippingAddress, paymentMethod, deliveryDate } = req.body;

        // Check if customerId is provided
        if (!customerId) {
            return res.status(400).json({ message: 'Customer ID is required' });
        }

        // Validate order items and check stock availability
        for (const item of orderItems) {
            if (!item || typeof item !== 'object' || !('dishId' in item) || !('quantity' in item)) {
                return res.status(400).json({ message: 'Invalid order item' });
            }

            // Check if dish exists
            const Dish = await dish.findById(item.dishId);
            if (!Dish) {
                return res.status(400).json({ message: 'Dish not found' });
            }

            // Check if there is enough stock
            if (Dish.stock < item.quantity) {
                return res.status(400).json({ message: `Not enough stock available for ${dish.name}` });
            }
        }

        // Calculate the total amount and update stock
        let totalAmount = 0;
        for (const item of orderItems) {
            const Dish = await dish.findById(item.dishId);
            totalAmount += Dish.price * item.quantity;

            // Decrement the stock of the dish based on the quantity ordered
            Dish.stock -= item.quantity;
            await Dish.save();
        }

        // Create a new order object with the calculated total amount
        const newOrder = new Order({
            customer: customerId, 
            orderItems,
            totalAmount,
            orderStatus,
            shippingAddress,
            paymentMethod,
            deliveryDate
        });

        // Save the new order to the database
        await newOrder.save();

        // Manually populate the orderItems with dish details
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
        // Extract order ID from request parameters
        const orderId = req.params.id;

        // Destructure request body to extract updated order data
        const { orderItems, orderStatus, shippingAddress, paymentMethod, deliveryDate } = req.body;

        // Validate order items and check stock availability if orderItems are provided
        if (orderItems) {
            for (const item of orderItems) {
                if (!item || typeof item !== 'object' || !('dishId' in item) || !('quantity' in item)) {
                    return res.status(400).json({ message: 'Invalid order item' });
                }

                // Check if dish exists
                const Dish = await dish.findById(item.dishId);
                if (!Dish) {
                    return res.status(400).json({ message: 'Dish not found' });
                }

                // Check if there is enough stock
                if (Dish.stock < item.quantity) {
                    return res.status(400).json({ message: `Not enough stock available for ${dish.name}` });
                }
            }

            // If order items are valid, calculate the total amount and update stock
            let totalAmount = 0;
            for (const item of orderItems) {
                const Dish = await dish.findById(item.dishId);
                totalAmount += Dish.price * item.quantity;

                // Decrement the stock of the dish based on the quantity ordered
                Dish.stock -= item.quantity;
                await Dish.save();
            }
        }

        // Find the order by ID
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Update order fields if provided
        if (orderItems) order.orderItems = orderItems;
        if (orderStatus) order.orderStatus = orderStatus;
        if (shippingAddress) order.shippingAddress = shippingAddress;
        if (paymentMethod) order.paymentMethod = paymentMethod;
        if (deliveryDate) order.deliveryDate = deliveryDate;

        // Save the updated order to the database
        await order.save();

        // Manually populate the orderItems with dish details
        await Order.populate(order, { path: 'orderItems.dishId', select: '_id name price' });

        res.status(200).json({ message: 'Order updated successfully', order });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to update Order' });
    }
});


// Delete Order Controller
module.exports.deleteOrderCtrl = asyncHandler(async (req, res) => {
    try {
        // Extract order ID from request parameters
        const orderId = req.params.id;

        // Find the order by ID
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Delete the order from the database
        await Order.deleteOne({ _id: orderId });

        res.status(200).json({ message: 'Order deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to delete Order' });
    }
});


  
  // Get All Orders Controller
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


// Get Single Order by ID Controller
module.exports.getSingleOrderCtrl = asyncHandler(async (req, res) => {
    try {
        // Extract order ID from request parameters
        const orderId = req.params.id;

        // Find the order by ID and populate orderItems and customer fields
        const order = await Order.findById(orderId)
            .populate('orderItems.dishId', '_id name price')
            .populate({
                path: 'customer',
                select: '-password' // Exclude the password field
            });

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        res.status(200).json({ message: 'Order retrieved successfully', order });
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
