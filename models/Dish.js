const mongoose = require('mongoose');
const Joi = require('joi');




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
    minlength: 4
  },
  price: {
    type: Number,
    required: true,
    min: 1
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
  ingredients: {
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
      }
    ],
    default: [],
  },
  availabilitySchedule: {
    dayOfWeek: {
      type: [Number],
      required: true,
    },
    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    },
  },
  availabilitySchedule: {
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
    },

  },
  relatedDishes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Dish',
      default: [],
    },
  ],
  IsDeleted: {
    type: Boolean,
    default: false,
  },
});

const dish=mongoose.model("Dish",dishSchema);



// Validate Create Dish
function validateCreateDish(obj) {
  // Define the validation schema
  const schema = Joi.object({
    name: Joi.string().required().min(4).max(32).label("Name"),
    description: Joi.string().required().min(4).label("Description"),
    price: Joi.number().required().min(1).label("Price"),
    category: Joi.string().required().label("Category"), // Assuming category is a string ID
    image: Joi.object().keys({
      url: Joi.string().uri().label("Image URL"),
      publicId: Joi.string().allow(null).label("Image Public ID")
    }).default({
      url: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_640.png",
      publicId: null
    }).label("Image"),
    stock: Joi.number().required().label("Stock"),
    tags: Joi.array().items(Joi.string()).default([]).label("Tags"),
    ingredients: Joi.array().items(Joi.string()).default([]).label("Ingredients"),
    ratings: Joi.array().items(
      Joi.object({
        customer: Joi.string().required().label("Customer ID"),
        rating: Joi.number().required().label("Rating"),
        review: Joi.string().required().label("Review")
      })
    ).default([]).label("Ratings"),
    availabilitySchedule: Joi.object({
      dayOfWeek: Joi.array().items(Joi.number().min(0).max(6)).required().label("Day of Week"),
      startTime: Joi.string().required().label("Start Time"),
      endTime: Joi.string().required().label("End Time"),
    }).label("Availability Schedule"),
    relatedDishes: Joi.array().items(Joi.string()).default([]).label("Related Dishes"), // Assuming related dishes are string IDs
   
  });

  // Validate the object against the schema
  return schema.validate(obj);
}


// Validate Update Dish
function validateUpdateDish(obj) {
  // Define the validation schema
  const schema = Joi.object({
      name: Joi.string().min(4).max(32).label("Name"),
      description: Joi.string().min(4).label("Description"),
      price: Joi.number().min(1).label("Price"),
      category: Joi.string().label("Category"), // Assuming category is a string ID
      image: Joi.object().keys({
          url: Joi.string().uri().label("Image URL"),
          publicId: Joi.string().allow(null).label("Image Public ID")
      }).label("Image"),
      stock: Joi.number().label("Stock"),
      tags: Joi.array().items(Joi.string()).label("Tags"),
      ingredients: Joi.array().items(Joi.string()).label("Ingredients"),
      ratings: Joi.array().items(
          Joi.object({
              customer: Joi.string().label("Customer ID"),
              rating: Joi.number().label("Rating"),
              review: Joi.string().label("Review")
          })
      ).label("Ratings"),
      availabilitySchedule: Joi.object({
          dayOfWeek: Joi.array().items(Joi.number().min(0).max(6)).label("Day of Week"),
          startTime: Joi.string().label("Start Time"),
          endTime: Joi.string().label("End Time"),
      }).label("Availability Schedule"),
      relatedDishes: Joi.array().items(Joi.string()).label("Related Dishes"), // Assuming related dishes are string IDs
  });

  // Validate the object against the schema
  return schema.validate(obj);
}


  
  


module.exports = {
  validateUpdateDish,
  validateCreateDish,
  dish
  
};



