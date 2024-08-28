const mongoose = require('mongoose');
const Joi = require('joi');

// Define the category schema
const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
  },
  description: {
    type: String,
    minlength: 10,
  },
  image: {
    type: Object,
    default: {
      url: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_640.png",
      publicId: null,
    },
  },
  IsDeleted: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

// Check if the model is already compiled
const Category = mongoose.models.Category || mongoose.model('Category', categorySchema);

// Validate Create Category
function validateCreateCategory(obj) {
  const schema = Joi.object({
    name: Joi.string().required().label("Name").min(3).trim(),
    description: Joi.string().label("Description").min(10).trim(),
  });
  return schema.validate(obj);
}

// Validate Update Category
function validateUpdateCategory(obj) {
  const schema = Joi.object({
    name: Joi.string().required().label("Name").min(3).trim(),
    description: Joi.string().label("Description").min(10).trim(),
  });
  return schema.validate(obj);
}

module.exports = {
  Category,
  validateCreateCategory,
  validateUpdateCategory,
};
