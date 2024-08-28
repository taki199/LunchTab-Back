const asyncHandler = require('express-async-handler');
const { Dish, validateCreateDish, validateUpdateDish } = require('../models/Dish');
const { Customer } = require('../models/Customer');
const path = require('path');
const fs = require('fs');
const { cloudinaryUploadImage, cloudinaryRemoveImage, cloudinaryRemoveMultipleImage } = require('../utils/cloudinary');


/**------------------------------------------
 *
 *   @desc    Get all dishes 
 *   @route   POST /api/dishes
 *   @method Get
 *   @access public 
----------------------------------------- */

module.exports.getAllDishesCtrl = asyncHandler(async (req, res) => {
    const dishes = await Dish.find({ isDeleted: false }).populate('category', 'name');
  
    if (dishes.length === 0) {
      return res.status(404).json({ success: false, msg: "No dishes found" });
    }
  
    res.status(200).json({ success: true, data: dishes });
  });
  
/**------------------------------------------
 *
 *   @desc    Get  single Dish
 *   @route   Get /api/dishes/:id
 *   @method Get
 *   @access public 
----------------------------------------- */


module.exports.getSingleDishCtrl = asyncHandler(async (req, res) => {
    const dish = await Dish.findById(req.params.id).populate("category", ["-password"]);
    if (!dish || dish.isDeleted) {
      return res.status(404).json({ success: false, message: "This dish doesn't exist" });
    }
  
    res.status(200).json({ success: true, data: dish });
  });
  
/**------------------------------------------
 *
 *   @desc    Create New Dish
 *   @route    /api/dishes
 *   @method Post
 *   @access Private (only admin)
----------------------------------------- */

module.exports.createDishCtrl = asyncHandler(async (req, res) => {
    const { error } = validateCreateDish(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
  
    let dishImage = null;
  
    if (req.file) {
      const imagePath = path.join(__dirname, `../images/${req.file.filename}`);
      const result = await cloudinaryUploadImage(imagePath);
      dishImage = {
        url: result.secure_url,
        publicId: result.public_id,
      };
    }
  
    const newDish = new Dish({
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      category: req.body.category,
      image: dishImage,
      stock: req.body.stock,
      ratings: req.body.ratings,
      relatedDishes: req.body.relatedDishes,
    });
  
    await newDish.save();
  
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) {
          console.error('Error deleting file:', err);
        }
      });
    }
  
    res.status(201).json(newDish);
  });

 /**------------------------------------------
 *
 *   @desc   update Dish
 *   @route    /api/dishes/:id
 *   @method put
 *   @access private (only admin)
----------------------------------------- */
module.exports.updateDishCtrl = asyncHandler(async (req, res) => {
    const { error } = validateUpdateDish(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
  
    try {
      let dish = await Dish.findById(req.params.id);
      if (!dish) {
        return res.status(404).json({ message: 'Dish not found' });
      }
  
      const { name, description, price, category, stock, ratings, relatedDishes } = req.body;
      if (name) dish.name = name;
      if (description) dish.description = description;
      if (price) dish.price = price;
      if (category) dish.category = category;
      if (stock) dish.stock = stock;
      if (ratings) dish.ratings = ratings;
      if (relatedDishes) dish.relatedDishes = relatedDishes;
  
      if (req.file) {
        if (dish.image && dish.image.publicId) {
          await cloudinaryRemoveImage(dish.image.publicId);
        }
        const result = await cloudinaryUploadImage(req.file.path);
        dish.image = {
          url: result.secure_url,
          publicId: result.public_id,
        };
      }
  
      const updatedDish = await dish.save();
  
      if (req.file) {
        fs.unlink(req.file.path, (err) => {
          if (err) {
            console.error('Error deleting file:', err);
          }
        });
      }
  
      res.status(200).json({ message: 'Dish updated successfully', dish: updatedDish });
    } catch (err) {
      console.error('Error updating dish:', err);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });
  
/**------------------------------------------
 *
 *   @desc   delete dish
 *   @route    /api/dishes/:id
 *   @method Delete
 *   @access private (only admin)
----------------------------------------- */

module.exports.deleteDishCtrl = asyncHandler(async (req, res) => {
    const dish = await Dish.findById(req.params.id);
    if (!dish) {
      return res.status(404).json({ message: 'Dish not found' });
    }
  
    await Dish.findByIdAndDelete(req.params.id);
  
    if (dish.image && dish.image.publicId) {
      await cloudinaryRemoveImage(dish.image.publicId);
    }
  
    res.status(200).json({ message: 'Dish has been deleted successfully', dishId: dish._id });
  });
  

/**------------------------------------------
 *
 *   @desc   find  dish by id
 *   @route    /api/dishes/:id
 *   @method get
 *   @access public 
----------------------------------------- */

module.exports.getDishByIdCtrl = asyncHandler(async (req, res) => {
    const dish = await Dish.findById(req.params.id).populate('category');
  
    if (!dish) {
      return res.status(404).json({ message: 'Dish not found' });
    }
  
    res.status(200).json(dish);
  });


  module.exports.getDishCountCtrl=asyncHandler(async(req,res)=>{
    const count=await Dish.countDocuments();
    res.status(200).json(count);

});


