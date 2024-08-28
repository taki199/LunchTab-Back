const mongoose = require('mongoose');
const Joi = require('joi');

// Define the dish schema
const dishSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 4,
    maxlength: 32,
  },
  description: {
    type: String,
    required: true,
    trim: true,
    minlength: 4,
  },
  price: {
    type: Number,
    required: true,
    min: 1,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
  },
  image: {
    type: Object,
    default: {
      url: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_640.png",
      publicId: null,
    },
  },
  stock: {
    type: Number,
    required: true,
  },
  tags: {
    type: [String],
    default: [],
  },
  ratings: {
    type: [
      {
        customer: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Customer',
          required: true,
        },
        rating: {
          type: Number,
          required: true,
        },
        review: {
          type: String,
          required: true,
        },
      },
    ],
    default: [],
  },
  relatedDishes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Dish',
      default: [],
    },
  ],
  isDeleted: {
    type: Boolean,
    default: false,
  },
});

// Check if the model is already compiled
const Dish = mongoose.models.Dish || mongoose.model('Dish', dishSchema);

// Validate Create Dish
function validateCreateDish(obj) {
  const schema = Joi.object({
    name: Joi.string().required().min(4).max(32).label("Name"),
    description: Joi.string().required().min(4).label("Description"),
    price: Joi.number().required().min(1).label("Price"),
    category: Joi.string().required().label("Category"),
    image: Joi.object().keys({
      url: Joi.string().uri().label("Image URL"),
      publicId: Joi.string().allow(null).label("Image Public ID"),
    }).label("Image"),
    stock: Joi.number().required().label("Stock"),
    ratings: Joi.array().items(
      Joi.object({
        customer: Joi.string().required().label("Customer ID"),
        rating: Joi.number().required().label("Rating"),
        review: Joi.string().required().label("Review"),
      }),
    ).default([]).label("Ratings"),
    relatedDishes: Joi.array().items(Joi.string()).default([]).label("Related Dishes"),
  });

  return schema.validate(obj);
}

// Validate Update Dish
function validateUpdateDish(obj) {
  const schema = Joi.object({
    name: Joi.string().min(4).max(32).label("Name"),
    description: Joi.string().min(4).label("Description"),
    price: Joi.number().min(1).label("Price"),
    category: Joi.string().label("Category"),
    image: Joi.object().keys({
      url: Joi.string().uri().label("Image URL"),
      publicId: Joi.string().allow(null).label("Image Public ID"),
    }).label("Image"),
    stock: Joi.number().label("Stock"),
    ratings: Joi.array().items(
      Joi.object({
        customer: Joi.string().label("Customer ID"),
        rating: Joi.number().label("Rating"),
        review: Joi.string().label("Review"),
      }),
    ).label("Ratings"),
    relatedDishes: Joi.array().items(Joi.string()).label("Related Dishes"),
  });

  return schema.validate(obj);
}

module.exports = {
  validateUpdateDish,
  validateCreateDish,
  Dish,
};
