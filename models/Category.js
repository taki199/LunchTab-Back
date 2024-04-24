const mongoose = require('mongoose');
const Joi = require('joi');

const CategorySchema = new mongoose.Schema({
  name:{
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3, // Minimum length for category name
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

const Category = mongoose.model('Category', CategorySchema);

// Validate Create Category
function validateCreateCategory(obj) {
  const schema = Joi.object({
    name: Joi.string().required().label("Name").min(3).trim(),
  });
  return schema.validate(obj);
}

// Validate Update Category
function validateUpdateCategory(obj) {
  const schema = Joi.object({
    name: Joi.string().required().label("Name").min(3).trim(),
  });
  return schema.validate(obj);
}

module.exports = {
  Category,
  validateCreateCategory,
  validateUpdateCategory
};
