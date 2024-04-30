const asyncHandler = require("express-async-handler");
const { Order } = require("../models/Order");
const { Dish } = require('../models/Dish');

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

        // Validate order items
        for (const item of orderItems) {
            if (!item || typeof item !== 'object' || !('dishId' in item) || !('quantity' in item)) {
                return res.status(400).json({ message: 'Invalid order item' });
            }

            // Check if dish exists
            const dish = await Dish.findById(item.dishId);
            if (!dish) {
                return res.status(400).json({ message: 'Dish not found' });
            }

            // Check if there is enough stock
            if (dish.stock < item.quantity) {
                return res.status(400).json({ message: `Not enough stock available for ${dish.name}` });
            }
        }

        // Calculate the total amount
        let totalAmount = 0;
        for (const item of orderItems) {
            const dish = await Dish.findById(item.dishId);
            totalAmount += dish.price * item.quantity;

            // Decrement the stock of the dish based on the quantity ordered
            dish.stock -= item.quantity;
            await dish.save();
        }

        // Create a new order object with the calculated total amount
        const newOrder = new Order({
            customer: customerId,
            orderItems,
            totalAmount, // Include the calculated total amount
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
