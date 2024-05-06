const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Customer",
        required: true,
    },
    orderItems: [{
        dishId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Dish',
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: 1 // Ensure quantity is a positive number
        }
    }],
    totalAmount: {
        type: Number,
        required: true,
        min: 0 // Ensure totalAmount is non-negative
    },
    orderStatus: {
        type: String,
        enum: ['Pending', 'Preparing', 'Out for Delivery', 'Delivered'],
        default: 'Pending'
    },
    shippingAddress: {
        type: String
    },
    paymentMethod: {
        type: String
    },
    deliveryDate: {
        type: Date
    },
    IsDeleted: {
        type: Boolean,
        default: false,
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes for frequently queried fields
orderSchema.index({ customer: 1, createdAt: -1 }); // Index for sorting orders by customer and creation date

// Virtual for formatted creation date
orderSchema.virtual('formattedCreatedAt').get(function () {
    return this.createdAt.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
});

// Pre-save hook to calculate total amount based on order items
orderSchema.pre('save', function (next) {
    if (!this.isModified('orderItems')) {
        this.totalAmount = this.orderItems.reduce((total, item) => total + (item.quantity * item.dishId.price), 0);
    }
    next();
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
