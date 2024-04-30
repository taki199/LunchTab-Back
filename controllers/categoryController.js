const asyncHandler=require("express-async-handler");
const {Category,validateCreateCategory,validateUpdateCategory}=require("../models/Category")
const path = require('path'); // Import the path module
const fs=require("fs");
const {cloudinaryUploadImage,cloudinaryRemoveImage, cloudinaryRemoveMultipleImage}=require('../utils/cloudinary');
const { dish } = require('../models/Dish');

/**------------------------------------------
 *
 *   @desc    Create New category
 *   @route    /api/categories
 *   @method Post
 *   @access Private (only admin)
----------------------------------------- */


module.exports.createCategoryCtrl = asyncHandler(async (req, res) => {
    // Validate the request body
    const { error } = validateCreateCategory(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    let categoryImage = null;

    // Check if an image is provided in the request body
    if (req.file) {
        // Get the path to the uploaded image
        const imagePath = path.join(__dirname, `../images/${req.file.filename}`);

        // Upload the image to Cloudinary
        const result = await cloudinaryUploadImage(imagePath);

        // Set the category image properties
        categoryImage = {
            url: result.secure_url,
            publicId: result.public_id
        };
    }

    // Create the category
    const category = await Category.create({
        name: req.body.name,
        image: categoryImage // Assign the category image
    });

   

    // Return the created category in the response
    res.status(201).json(category);
});



/**------------------------------------------
 *
 *   @desc    get all categories
 *   @route    /api/categories
 *   @method get
 *   @access public 
----------------------------------------- */

module.exports.getAllCategoriesCtrl=asyncHandler(async(req,res)=>{
    const categories=await Category.find();
     res.status(200).json(categories)
 });
 
/**------------------------------------------
 *
 *   @desc   delete category
 *   @route    /api/categories/:id
 *   @method Delete
 *   @access private (only admin)
----------------------------------------- */

module.exports.deleteCategoriesCtrl = asyncHandler(async (req, res) => {
    // Find the category by ID
    const category = await Category.findById(req.params.id);

    // Check if the category exists
    if (!category) {
        return res.status(404).json({ message: 'Category not found' });
    }

    // Remove the category from the database
    await Category.findByIdAndDelete(req.params.id);

    // Check if the category has an image associated with it
    if (category.image && category.image.publicId) {
        // Remove the image from Cloudinary
        await cloudinaryRemoveImage(category.image.publicId);
    }

    // Return success message
    res.status(200).json({ message: 'Category has been deleted successfully', categoryId: category._id });
});

 /**------------------------------------------
 *
 *   @desc   update category
 *   @route    /api/categories/:id
 *   @method put
 *   @access private (only admin)
----------------------------------------- */

module.exports.updateCategoryCtrl = asyncHandler(async (req, res) => {
    // Validate the request body
    const { error } = validateUpdateCategory(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    // Check if the category exists
    let category = await Category.findById(req.params.id);
    if (!category) {
        return res.status(404).json({ message: 'Category not found' });
    }

    // Update the category name
    category.name = req.body.name;

    // Check if a new image is provided
    if (req.file) {
        // Remove the old image from Cloudinary if it exists
        if (category.image && category.image.publicId) {
            await cloudinaryRemoveImage(category.image.publicId);
        }
        
        // Upload the new image to Cloudinary
        const result = await cloudinaryUploadImage(req.file.path);

        // Update the category's image information
        category.image = {
            url: result.secure_url,
            publicId: result.public_id
        };
    }

    // Save the updated category
    await category.save();

    // Return success message
    res.status(200).json({ message: 'Category updated successfully', category });
});

/**------------------------------------------
 *  //api/categories/catId/dishes
 *   @desc  get dishes of a category
 *   @route    /api/categories/:categoryId/dishes
 *   @method get
 *   @access public 
----------------------------------------- */

module.exports.getDishesByCategoryCtrl=asyncHandler(async(req,res)=>{
    try {
        // Retrieve the category ID from the request parameters
        const categoryId = req.params.categoryId;

        // Find all dishes with the specified category ID
        const dishes = await dish.find({ category: categoryId });

        // Return the fetched dishes as a response
        res.status(200).json(dishes);
    } catch (error) {
        // Handle any errors that occur during the process
        console.error('Error fetching dishes by category:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
})

/**------------------------------------------
 *  
 *   @desc  get single category
 *   @route    /api/categories/:categoryId
 *   @method get
 *   @access public 
----------------------------------------- */

module.exports.getSingleCategoryCtrl=asyncHandler( async (req,res,next) =>{
    const id = req.params.id
    
    // Get category using the provided ID
    const category = await Category.findById(id)
    
    if(!category){
        return next(new CustomError(`Category not found`,404))
    }else res.status(200).json(category);
})  